/* global require */
/**
 * @fileoverview Test for no-unsanitized rule
 * @author Frederik Braun et al.
 * @copyright 2015-2017 Mozilla Corporation. All rights reserved
 */

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const rule = require("../../lib/rules/method");
const RuleTester = require("eslint").RuleTester;

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const eslintTester = new RuleTester();

eslintTester.run("method", rule, {

    // Examples of code that should not trigger the rule
    // XXX this does not find z['innerHTML'] and the like.

    valid: [
        // tests for insertAdjacentHTML calls
        {
            code: "n.insertAdjacentHTML('afterend', 'meh');",
            parserOptions: { ecmaVersion: 6 }
        },
        {
            code: "n.insertAdjacentHTML('afterend', `<br>`);",
            parserOptions: { ecmaVersion: 6 }
        },
        {
            code: "n.insertAdjacentHTML('afterend', Sanitizer.escapeHTML`${title}`);",
            parserOptions: { ecmaVersion: 6 }
        },

        // document.write/writeln
        {
            code: "document.write('lulz');",
            parserOptions: { ecmaVersion: 6 }
        },
        {
            code: "document.write();",
            parserOptions: { ecmaVersion: 6 }
        },
        {
            code: "document.writeln(Sanitizer.escapeHTML`<em>${evil}</em>`);",
            parserOptions: { ecmaVersion: 6 }
        },
        {
            code: "otherNodeWeDontCheckFor.writeln(evil);",
            parserOptions: { ecmaVersion: 6 }
        },

        // Native method (Check customize code doesn't include these)
        {
            code: "document.toString(evil);"
        },

        {
            code: "document.write(escaper(x))",
            options: [
                {
                    escape: {
                        methods: ["escaper"]
                    }
                }
            ]
        },

        // Checking write can be overriden
        {
            code: "document.write(evilest)",
            options: [
                {
                    objectMatches: ["document", "documentFun"]
                },
                {
                    write: {
                        objectMatches: ["thing"]
                    }
                }
            ]
        },

        // Checking disableDefault can remove the default rules
        {
            code: "document.write(evil)",
            options: [
                {
                    defaultDisable: true
                }
            ]
        },

        // rule should not barf on a CallExpression result being called again
        {
            code: "  _tests.shift()();",
        },
        {
            code: "(Async.checkAppReady = function() { return true; })();"
        },
        {
            code: "let endTime = (mapEnd || (e => e.delta))(this._data[this._data.length - 1]);",
            parserOptions: { ecmaVersion: 6 }
        },
        {
            code: "(text.endsWith('\\n') ? document.write : document.writeln)(text)"
        },

        // issue 71 https://github.com/mozilla/eslint-plugin-no-unsanitized/issues/71
        {
            code: "function foo() { return this().bar(); };",
        },

        // issue 73 https://github.com/mozilla/eslint-plugin-no-unsanitized/issues/73
        {
            code: "new Function()();",
        },
        { // issue 79
            code: "range.createContextualFragment('<p class=\"greeting\">Hello!</p>');"
        },
        { // issue 79
            code: "range.createContextualFragment(Sanitizer.escapeHTML`<em>${evil}</em>`);",
            parserOptions: { ecmaVersion: 6 },
            options: [
                {

                    escape: {
                        methods: ["escaper"]
                    }
                }
            ]
        },
        { // issue 79
            code: "range.createContextualFragment(escaper('<em>'+evil+'</em>'));",
            options: [
                {

                    escape: {
                        methods: ["escaper"]
                    }
                }
            ]
        },

        // Issue 83: Support import() expressions as parsed by babel-eslint
        {
            code: "import('lodash')",
            parser: "babel-eslint"
        },
    ],

    // Examples of code that should trigger the rule
    invalid: [
        /* XXX Do NOT change the error strings below without review from freddy:
         * The strings are optimized for SEO and understandability.
         * The developer can search for them and will find this MDN article:
         *  https://developer.mozilla.org/en-US/Firefox_OS/Security/Security_Automation
         */

        // insertAdjacentHTML examples
        {
            code: "node.insertAdjacentHTML('beforebegin', htmlString);",
            errors: [
                {
                    message: "Unsafe call to node.insertAdjacentHTML for argument 1",
                    type: "CallExpression"
                }
            ]
        },
        {
            code: "node.insertAdjacentHTML('beforebegin', template.getHTML());",
            errors: [
                {
                    message: "Unsafe call to node.insertAdjacentHTML for argument 1",
                    type: "CallExpression"
                }
            ]
        },

        // document.write / writeln
        {
            code: "document.write('<span>'+ htmlInput + '</span>');",
            errors: [
                {
                    message: "Unsafe call to document.write for argument 0",
                    type: "CallExpression"
                }
            ]
        },
        {
            code: "documentish.write('<span>'+ htmlInput + '</span>');",
            errors: [
                {
                    message: "Unsafe call to documentish.write for argument 0",
                    type: "CallExpression"
                }
            ]
        },
        {
            code: "documentIframe.write('<span>'+ htmlInput + '</span>');",
            errors: [
                {
                    message: "Unsafe call to documentIframe.write for argument 0",
                    type: "CallExpression"
                }
            ]
        },
        {
            code: "document.writeln(evil);",
            errors: [
                {
                    message: "Unsafe call to document.writeln for argument 0",
                    type: "CallExpression"
                }
            ]
        },
        {
            code: "window.document.writeln(bad);",
            errors: [
                {
                    message: "Unsafe call to window.document.writeln for argument 0",
                    type: "CallExpression"
                }
            ]
        },

        // issue 71 https://github.com/mozilla/eslint-plugin-no-unsanitized/issues/71
        {
            code: "function foo() { return this().insertAdjacentHTML(foo, bar); };",
            errors: [
                {
                    message: "Unsafe call to this().insertAdjacentHTML for argument 1",
                    type: "CallExpression"
                }
            ],
            parserOptions: { ecmaVersion: 6 }
        },

        // Broken config
        {
            code: "b.boop(pie)",
            options: [
                {
                },
                {
                    boop: {
                    }
                }
            ],
            errors: [
                {
                    message: "Method check requires properties array in eslint rule boop",
                    type: "CallExpression"
                }
            ]
        },

        // Checking disableDefault can remove the default rules but also add more
        {
            code: "document.write(evil); b.thing(x); b.other(me);",
            options: [
                {
                    defaultDisable: true
                },
                {
                    thing: {
                    },
                    other: {
                        properties: [0]
                    }
                }
            ],
            errors: [
                {
                    message: "Method check requires properties array in eslint rule thing",
                    type: "CallExpression"
                },
                {
                    message: "Unsafe call to b.other for argument 0",
                    type: "CallExpression"
                }
            ]
        },

        // Test that stem from former parser errors and breakage
        {
            code: "getDocument(myID).write(evil)",
            errors: [
                {
                    message: "Unsafe call to getDocument(myID).write for argument 0",
                    type: "CallExpression"
                }
            ]
        },

        // Issue 79: Warn for use of createContextualFragment
        {
            code: "range.createContextualFragment(badness)",
            errors: [
                {
                    message: "Unsafe call to range.createContextualFragment for argument 0",
                    type: "CallExpression"
                }
            ]
        }
    ]
});
