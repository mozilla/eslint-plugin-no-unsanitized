/**
 * @fileoverview Test for no-unsafe-innerhtml rule
 * @author Frederik Braun
 * @copyright 2015 Mozilla Corporation. All rights reserved
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var rule = require("../../lib/rules/no-unsafe-innerhtml");
var RuleTester = require('eslint').RuleTester;

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

var eslintTester = new RuleTester();

eslintTester.run("no-unsafe-innerhtml", rule, {

    // Examples of code that should not trigger the rule
    // XXX this does not find z['innerHTML'] and the like.

    valid: [
        // tests for innerHTML equals
        { code: "a.innerHTML = '';",
            ecmaFeatures: { templateStrings: true }
        },
        {
            code: "c.innerHTML = ``;",
            ecmaFeatures: { templateStrings: true }
        },
        {
            code: "g.innerHTML = Sanitizer.escapeHTML``;",
            ecmaFeatures: { templateStrings: true }
        },
        {
            code: "h.innerHTML = Sanitizer.escapeHTML`foo`;",
            ecmaFeatures: { templateStrings: true }
        },
        {
            code: "i.innerHTML = Sanitizer.escapeHTML`foo${bar}baz`;",
            ecmaFeatures: { templateStrings: true }
        },
        // tests for innerHTML update (+= operator)
        {
            code: "a.innerHTML += '';",
            ecmaFeatures: { templateStrings: true }
        },
        {
            code: "b.innerHTML += \"\";",
            ecmaFeatures: { templateStrings: true }
        },
        {
            code: "c.innerHTML += ``;",
            ecmaFeatures: { templateStrings: true }
        },
        {
            code: "g.innerHTML += Sanitizer.escapeHTML``;",
            ecmaFeatures: { templateStrings: true }
        },
        {
            code: "h.innerHTML += Sanitizer.escapeHTML`foo`;",
            ecmaFeatures: { templateStrings: true }
        },
        {
            code: "i.innerHTML += Sanitizer.escapeHTML`foo${bar}baz`;",
            ecmaFeatures: { templateStrings: true }
        },
        {
          code: "i.innerHTML += Sanitizer.unwrapSafeHTML(htmlSnippet)",
          ecmaFeatures: { templateStrings: true }
        },
        {
          code: "i.outerHTML += Sanitizer.unwrapSafeHTML(htmlSnippet)",
          ecmaFeatures: { templateStrings: true }
        },
        // tests for insertAdjacentHTML calls
        {
            code: "n.insertAdjacentHTML('afterend', 'meh');",
            ecmaFeatures: { templateStrings: true }
        },
        {
            code: "n.insertAdjacentHTML('afterend', `<br>`);",
            ecmaFeatures: { templateStrings: true }
        },
        {
            code: "n.insertAdjacentHTML('afterend', Sanitizer.escapeHTML`${title}`);",
            ecmaFeatures: { templateStrings: true }
        },
        // override for manual review and legacy code
        {
            code: "g.innerHTML = potentiallyUnsafe; // a=legacy, bug 1155131",
            ecmaFeatures: { templateStrings: true }
        },
        // (binary) expressions
        {
            code: "x.innerHTML = `foo`+`bar`;",
            ecmaFeatures: { templateStrings: true }
        },
        {
            code: "y.innerHTML = '<span>' + 5 + '</span>';",
            ecmaFeatures: { templateStrings: true }
        },
        // document.write/writeln
        {
            code: "document.write('lulz');",
            ecmaFeatures: { templateStrings: true }
        },
        {
            code: "document.writeln(Sanitizer.escapeHTML`<em>${evil}</em>`);",
            ecmaFeatures: { templateStrings: true }
        }

    ],

    // Examples of code that should trigger the rule
    invalid: [
        /* XXX Do NOT change the error strings below without review from freddy:
         * The strings are optimized for SEO and understandability.
         * The developer can search for them and will find this MDN article:
         *  https://developer.mozilla.org/en-US/Firefox_OS/Security/Security_Automation
         */

        // innerHTML examples
        {
            code: "m.innerHTML = htmlString;",
            errors: [
                { message: "Unsafe assignment to innerHTML",
                    type: "AssignmentExpression" }
            ]
        },
        {
            code: "a.innerHTML += htmlString;",
            errors: [
                {
                    message: "Unsafe assignment to innerHTML",
                    type: "AssignmentExpression"
                }
            ]
        },
        {
            code: "a.innerHTML += template.toHtml();",
            errors: [
                {
                    message: "Unsafe assignment to innerHTML",
                    type: "AssignmentExpression"
                }
            ]
        },
        {
             code: "m.outerHTML = htmlString;",
             errors: [
                {
                     message: "Unsafe assignment to outerHTML",
                     type: "AssignmentExpression"
                }
          ]
        },
        // insertAdjacentHTML examples
        {
            code: "node.insertAdjacentHTML('beforebegin', htmlString);",
            errors: [
                {
                    message: "Unsafe call to insertAdjacentHTML",
                    type: "CallExpression"
                }
            ]
        },
        {
            code: "node.insertAdjacentHTML('beforebegin', template.getHTML());",
            errors: [
                {
                    message: "Unsafe call to insertAdjacentHTML",
                    type: "CallExpression"
                }
            ]
        },
        // (binary) expressions
        {
            code: "node.innerHTML = '<span>'+ htmlInput;",
            errors: [
                {
                    message: "Unsafe assignment to innerHTML",
                    type: "AssignmentExpression"
                }
            ]
        },
        {
            code: "node.innerHTML = '<span>'+ htmlInput + '</span>';",
            errors: [
                {
                    message: "Unsafe assignment to innerHTML",
                    type: "AssignmentExpression"
                }
            ]
        },
        // document.write / writeln
        {
            code: "document.write('<span>'+ htmlInput + '</span>');",
            errors: [
                {
                    message: "Unsafe call to document.write",
                    type: "CallExpression"
                }
            ]
        },
        {
            code: "document.writeln(evil);",
            errors: [
                {
                    message: "Unsafe call to document.writeln",
                    type: "CallExpression"
                }
            ]
        },
        // bug https://bugzilla.mozilla.org/show_bug.cgi?id=1198200
        {
            code: "title.innerHTML = _('WB_LT_TIPS_S_SEARCH'," +
            " {value0:engine});",
            errors: [
                {
                    message: "Unsafe assignment to innerHTML",
                    type: "AssignmentExpression"
                }
            ]
}
    ]
});
