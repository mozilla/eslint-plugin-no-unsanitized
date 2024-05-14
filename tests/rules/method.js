/**
 * @file Test for no-unsanitized rule
 * @author Frederik Braun et al.
 * @copyright 2015-2017 Mozilla Corporation. All rights reserved
 */

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const rule = require("../../lib/rules/method");
const RuleTester = require("eslint").RuleTester;
const { ESLint } = require("eslint");
const preESLintv9 = ESLint.version.split(".")[0] < 9;

const PATH_TO_BABEL_ESLINT = `${process.cwd()}/node_modules/@babel/eslint-parser/`;
const PATH_TO_TYPESCRIPT_ESLINT = `${process.cwd()}/node_modules/@typescript-eslint/parser/`;

const babelParser = require(PATH_TO_BABEL_ESLINT);
const typescriptParser = require(PATH_TO_TYPESCRIPT_ESLINT);

const ECMA_VERSION_6_ONLY_OPTIONS = preESLintv9
    ? {
          parserOptions: { ecmaVersion: 6 },
      }
    : {
          languageOptions: { parserOptions: { ecmaVersion: 6 } },
      };
const ECMA_VERSION_8_ONLY_OPTIONS = preESLintv9
    ? {
          parserOptions: { ecmaVersion: 8 },
      }
    : {
          languageOptions: { parserOptions: { ecmaVersion: 8 } },
      };

const ECMA_VERSION_2020_ONLY_OPTIONS = preESLintv9
    ? {
          parserOptions: { ecmaVersion: 2020 },
      }
    : {
          languageOptions: { parserOptions: { ecmaVersion: 2020 } },
      };

const BABEL_ONLY_OPTIONS = preESLintv9
    ? {
          parser: PATH_TO_BABEL_ESLINT,
      }
    : {
          languageOptions: {
              parser: babelParser,
          },
      };

const BABEL_OPTIONS_FOR_FLOW = preESLintv9
    ? {
          parser: PATH_TO_BABEL_ESLINT,
          parserOptions: {
              requireConfigFile: false,
              babelOptions: {
                  plugins: ["@babel/plugin-syntax-flow"],
              },
          },
      }
    : {
          languageOptions: {
              parser: babelParser,
              parserOptions: {
                  requireConfigFile: false,
                  babelOptions: {
                      plugins: ["@babel/plugin-syntax-flow"],
                  },
              },
          },
      };

const TYPESCRIPT_OPTIONS = preESLintv9
    ? {
          parser: PATH_TO_TYPESCRIPT_ESLINT,
          parserOptions: {
              ecmaVersion: 2018,
              sourceType: "module",
          },
      }
    : {
          languageOptions: {
              parser: typescriptParser,
              parserOptions: {
                  ecmaVersion: 2018,
                  sourceType: "module",
              },
          },
      };

const FANTASY_CALLEE_OPTIONS = preESLintv9
    ? {
          parser: require.resolve("../parsers/fantasy-callee"),
      }
    : {
          languageOptions: {
              parser: require("../parsers/fantasy-callee"),
          },
      };

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
            ...ECMA_VERSION_6_ONLY_OPTIONS,
        },
        {
            code: "n.insertAdjacentHTML('afterend', `<br>`);",
            ...ECMA_VERSION_6_ONLY_OPTIONS,
        },
        {
            code: "n.insertAdjacentHTML('afterend', Sanitizer.escapeHTML`${title}`);",
            ...ECMA_VERSION_6_ONLY_OPTIONS,
        },

        // document.write/writeln
        {
            code: "document.write('lulz');",
            ...ECMA_VERSION_6_ONLY_OPTIONS,
        },
        {
            code: "document.write();",
            ...ECMA_VERSION_6_ONLY_OPTIONS,
        },
        {
            code: "document.writeln(Sanitizer.escapeHTML`<em>${evil}</em>`);",
            ...ECMA_VERSION_6_ONLY_OPTIONS,
        },
        {
            code: "otherNodeWeDontCheckFor.writeln(evil);",
            ...ECMA_VERSION_6_ONLY_OPTIONS,
        },

        // Native method (Check customize code doesn't include these)
        {
            code: "document.toString(evil);",
        },

        {
            code: "document.write(escaper(x))",
            options: [
                {
                    escape: {
                        methods: ["escaper"],
                    },
                },
            ],
        },

        // Checking write can be overriden
        {
            code: "document.write(evilest)",
            options: [
                {
                    objectMatches: ["document", "documentFun"],
                },
                {
                    write: {
                        objectMatches: ["thing"],
                    },
                },
            ],
        },

        // Checking disableDefault can remove the default rules
        {
            code: "document.write(evil)",
            options: [
                {
                    defaultDisable: true,
                },
            ],
        },

        // rule should not barf on a CallExpression result being called again
        {
            code: "  _tests.shift()();",
        },
        {
            code: "(Async.checkAppReady = function() { return true; })();",
        },
        {
            code: "let endTime = (mapEnd || (e => e.delta))(this._data[this._data.length - 1]);",
            ...ECMA_VERSION_6_ONLY_OPTIONS,
        },
        {
            code: "(text.endsWith('\\n') ? document.write : document.writeln)(text)",
        },

        // issue 71 https://github.com/mozilla/eslint-plugin-no-unsanitized/issues/71
        {
            code: "function foo() { return this().bar(); };",
        },

        // issue 73 https://github.com/mozilla/eslint-plugin-no-unsanitized/issues/73
        {
            code: "new Function()();",
        },
        {
            // issue 79
            code: "range.createContextualFragment('<p class=\"greeting\">Hello!</p>');",
        },
        {
            // issue 79
            code: "range.createContextualFragment(Sanitizer.escapeHTML`<em>${evil}</em>`);",
            ...ECMA_VERSION_6_ONLY_OPTIONS,
            options: [
                {
                    escape: {
                        methods: ["escaper"],
                    },
                },
            ],
        },
        {
            // issue 79
            code: "range.createContextualFragment(escaper('<em>'+evil+'</em>'));",
            options: [
                {
                    escape: {
                        methods: ["escaper"],
                    },
                },
            ],
        },

        // Issue 135: Check literal imports in all parsers:
        {
            code: "import('lodash')",
            ...ECMA_VERSION_2020_ONLY_OPTIONS,
        },

        // Issue 83: Support import() expressions as parsed by @babel/eslint-parser
        {
            code: "import('lodash')",
            ...BABEL_ONLY_OPTIONS,
        },

        // Issue 135: Check literal imports in all parsers:
        {
            code: "import('lodash')",
            ...TYPESCRIPT_OPTIONS,
        },
        {
            // issue 108: adding tests for custom escaper
            code: "range.createContextualFragment(templateEscaper`<em>${evil}</em>`);",
            ...ECMA_VERSION_6_ONLY_OPTIONS,
            options: [
                {
                    escape: {
                        taggedTemplates: ["templateEscaper"],
                    },
                },
            ],
        },
        {
            // issue 108: adding tests for custom escaper
            code: "n.insertAdjacentHTML('afterend', DOMPurify.sanitize(evil));",
            ...ECMA_VERSION_6_ONLY_OPTIONS,
            options: [
                {
                    escape: {
                        methods: ["DOMPurify.sanitize"],
                    },
                },
            ],
        },
        {
            // issue 108: adding tests for custom escaper
            code: "n.insertAdjacentHTML('afterend', DOMPurify.sanitize(evil, options));",
            ...ECMA_VERSION_6_ONLY_OPTIONS,
            options: [
                {
                    escape: {
                        methods: ["DOMPurify.sanitize"],
                    },
                },
            ],
        },
        {
            // issue 108: adding tests for custom escaper
            code: "n.insertAdjacentHTML('afterend', DOMPurify.sanitize(evil, {ALLOWED_TAGS: ['b']}));",
            ...ECMA_VERSION_6_ONLY_OPTIONS,
            options: [
                {
                    escape: {
                        methods: ["DOMPurify.sanitize"],
                    },
                },
            ],
        },
        {
            // issue 154: Adding tests for TaggedTemplateExpression callee https://jestjs.io/docs/api#2-describeeachtablename-fn-timeout
            code: "describe.each`table`(name, fn, timeout)",
            ...ECMA_VERSION_6_ONLY_OPTIONS,
        },
        {
            code: "document.write`text`",
            ...ECMA_VERSION_6_ONLY_OPTIONS,
        },
        {
            code: "document.write`text ${'static string'}`",
            ...ECMA_VERSION_6_ONLY_OPTIONS,
        },
        {
            code: "custom`text ${variable}`",
            ...ECMA_VERSION_6_ONLY_OPTIONS,
            options: [
                {},
                {
                    custom: {
                        properties: [0],
                    },
                },
            ],
        },
        {
            code: "custom`text ${'string'}`",
            ...ECMA_VERSION_6_ONLY_OPTIONS,
            options: [
                {},
                {
                    custom: {
                        properties: [1],
                    },
                },
            ],
        },
        {
            // This is allowed because of how tagged templates pass function parameters
            code: "document.write`text ${variable}`",
            ...ECMA_VERSION_6_ONLY_OPTIONS,
        },
        {
            // basic support for SequenceExpressions, which always return the last item - fixes #113
            code: "let a = (0,1,2,34);",
            ...ECMA_VERSION_6_ONLY_OPTIONS,
        },
        {
            // issue #122 calling an await expression
            code: "(async function()  { (await somePromise)(); })",
            ...ECMA_VERSION_8_ONLY_OPTIONS,
        },
        {
            // issue #122 calling an await expression
            // note how we won't be able to tell if the promise resolves to foo.insertAdjacentHTML
            code: "async () => (await TheRuleDoesntKnowWhatIsBeingReturnedHere())('afterend', blah);",
            ...ECMA_VERSION_2020_ONLY_OPTIONS,
        },
        {
            // Regression test for #124, make sure we don't raise an "Unexpected Callee" error.
            code: "(e = this.n[n.i])(i, r)",
            ...ECMA_VERSION_6_ONLY_OPTIONS,
        },
        {
            // Regression test for #124, make sure we go deeper into validating the AssignmentExpression.
            code: "(e = node.insertAdjacentHTML('beforebegin', '<s>safe</s>'))()",
            ...ECMA_VERSION_6_ONLY_OPTIONS,
        },

        // Typescript support tests
        {
            code: "node.insertAdjacentHTML('beforebegin', (5 as string));",
            ...TYPESCRIPT_OPTIONS,
        },
        {
            code: "node!.insertAdjacentHTML('beforebegin', 'raw string');",
            ...TYPESCRIPT_OPTIONS,
        },
        {
            code: "node!().insertAdjacentHTML('beforebegin', 'raw string');",
            ...TYPESCRIPT_OPTIONS,
        },

        // Flow support tests
        {
            code: "(node: HTMLElement).insertAdjacentHTML('beforebegin', 'raw string');",
            ...BABEL_OPTIONS_FOR_FLOW,
        },
        {
            code: "node.insertAdjacentHTML('beforebegin', (5: string));",
            ...BABEL_OPTIONS_FOR_FLOW,
        },
        {
            code: "(insertAdjacentHTML: function)('afterend', 'static string');",
            ...BABEL_OPTIONS_FOR_FLOW,
        },

        // Issue 135: method calls to import should not warn.
        {
            code: "foo.import(bar)",
            ...ECMA_VERSION_2020_ONLY_OPTIONS,
        },
        {
            code: "foo.import(bar)",
            ...BABEL_ONLY_OPTIONS,
        },
        {
            code: "foo.import(bar)",
            ...TYPESCRIPT_OPTIONS,
        },

        // let without initialization.
        {
            code: "let c; n.insertAdjacentHTML('beforebegin', c)",
            ...ECMA_VERSION_6_ONLY_OPTIONS,
        },
        {
            code: "x.setHTML(evil)",
        },
        {
            code: "x.setHTML(evil, { sanitizer: s })",
        },
        {
            code: "x.setHTML(evil, { sanitizer: new Sanitizer()})",
        },
        {
            code: "(info.current = type)(child_ctx)",
        },
        {
            code: "(info.current = n.insertAdjacentHTML)('beforebegin', 'innocent')",
        },
        {
            // #214: We also allow *harmful* parameters.
            code: "let l = ['afterend', 'harmless']; foo.insertAdjacentHTML(...l);",
            ...ECMA_VERSION_2020_ONLY_OPTIONS,
        },
        {
            // #214: We also allow *harmful* parameters.
            code: "foo.insertAdjacentHTML(wrongParamCount);",
            ...ECMA_VERSION_2020_ONLY_OPTIONS,
        },
        {
            // # 232: disallow setHTMLUnsafe, but OK with static string.
            code: "foo.setHTMLUnsafe('static string')",
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
                    message:
                        "Unsafe call to node.insertAdjacentHTML for argument 1",
                    type: "CallExpression",
                },
            ],
        },
        {
            code: "node.insertAdjacentHTML('beforebegin', template.getHTML());",
            errors: [
                {
                    message:
                        "Unsafe call to node.insertAdjacentHTML for argument 1",
                    type: "CallExpression",
                },
            ],
        },

        // document.write / writeln
        {
            code: "document.write('<span>'+ htmlInput + '</span>');",
            errors: [
                {
                    message: "Unsafe call to document.write for argument 0",
                    type: "CallExpression",
                },
            ],
        },
        {
            code: "documentish.write('<span>'+ htmlInput + '</span>');",
            errors: [
                {
                    message: "Unsafe call to documentish.write for argument 0",
                    type: "CallExpression",
                },
            ],
        },
        {
            code: "documentIframe.write('<span>'+ htmlInput + '</span>');",
            errors: [
                {
                    message:
                        "Unsafe call to documentIframe.write for argument 0",
                    type: "CallExpression",
                },
            ],
        },
        {
            code: "document.writeln(evil);",
            errors: [
                {
                    message: "Unsafe call to document.writeln for argument 0",
                    type: "CallExpression",
                },
            ],
        },
        {
            code: "window.document.writeln(bad);",
            errors: [
                {
                    message:
                        "Unsafe call to window.document.writeln for argument 0",
                    type: "CallExpression",
                },
            ],
        },

        // issue 71 https://github.com/mozilla/eslint-plugin-no-unsanitized/issues/71
        {
            code: "function foo() { return this().insertAdjacentHTML(foo, bar); };",
            errors: [
                {
                    message:
                        "Unsafe call to this().insertAdjacentHTML for argument 1",
                    type: "CallExpression",
                },
            ],
            ...ECMA_VERSION_6_ONLY_OPTIONS,
        },

        // Broken config
        {
            code: "b.boop(pie)",
            options: [
                {},
                {
                    boop: {},
                },
            ],
            errors: [
                {
                    message:
                        "Method check requires properties array in eslint rule boop",
                    type: "CallExpression",
                },
            ],
        },

        // Checking disableDefault can remove the default rules but also add more
        {
            code: "document.write(evil); b.thing(x); b.other(me);",
            options: [
                {
                    defaultDisable: true,
                },
                {
                    thing: {},
                    other: {
                        properties: [0],
                    },
                },
            ],
            errors: [
                {
                    message:
                        "Method check requires properties array in eslint rule thing",
                    type: "CallExpression",
                },
                {
                    message: "Unsafe call to b.other for argument 0",
                    type: "CallExpression",
                },
            ],
        },

        // Test that stem from former parser errors and breakage
        {
            code: "getDocument(myID).write(evil)",
            errors: [
                {
                    message:
                        "Unsafe call to getDocument(myID).write for argument 0",
                    type: "CallExpression",
                },
            ],
        },

        // Issue 79: Warn for use of createContextualFragment
        {
            code: "range.createContextualFragment(badness)",
            errors: [
                {
                    message:
                        "Unsafe call to range.createContextualFragment for argument 0",
                    type: "CallExpression",
                },
            ],
        },

        // Issue 135: Disallow import() with non-literal params
        {
            code: "import(foo)",
            ...ECMA_VERSION_2020_ONLY_OPTIONS,
            errors: [
                {
                    message: "Unsafe call to import for argument 0",
                    type: "ImportExpression",
                },
            ],
        },
        {
            code: "import(foo)",
            ...BABEL_ONLY_OPTIONS,
            errors: [
                {
                    message: "Unsafe call to import for argument 0",
                    type: "ImportExpression",
                },
            ],
        },
        {
            code: "import(foo)",
            ...TYPESCRIPT_OPTIONS,
            errors: [
                {
                    message: "Unsafe call to import for argument 0",
                    type: "ImportExpression",
                },
            ],
        },
        {
            // basic support for SequenceExpressions, which always return the last item - fixes #113
            code: "(0, node.insertAdjacentHTML)('beforebegin', evil);",
            ...ECMA_VERSION_6_ONLY_OPTIONS,
            errors: [
                {
                    message:
                        "Unsafe call to node.insertAdjacentHTML for argument 1",
                    type: "CallExpression",
                },
            ],
        },
        {
            // issue 108: adding tests for custom escaper
            // in this case we allow a function for templates, but it's used as a method
            code: "n.insertAdjacentHTML('afterend', templateEscaper(evil, options));",
            ...ECMA_VERSION_6_ONLY_OPTIONS,
            options: [
                {
                    escape: {
                        taggedTemplates: ["templateEscaper"],
                    },
                },
            ],
            errors: [
                {
                    message:
                        "Unsafe call to n.insertAdjacentHTML for argument 1",
                    type: "CallExpression",
                },
            ],
        },
        {
            // issue 108: adding tests for custom escaper
            // in this case we allow a function for methods, but it's used fo template strings
            code: "n.insertAdjacentHTML('afterend', sanitize`<em>${evil}</em>`);",
            ...ECMA_VERSION_6_ONLY_OPTIONS,
            options: [
                {
                    escape: {
                        methods: ["sanitize"],
                    },
                },
            ],
            errors: [
                {
                    message:
                        "Unsafe call to n.insertAdjacentHTML for argument 1",
                    type: "CallExpression",
                },
            ],
        },
        {
            code: "document.writeln(Sanitizer.escapeHTML`<em>${evil}</em>`);",
            ...ECMA_VERSION_6_ONLY_OPTIONS,
            options: [
                {
                    defaultDisable: true,
                },
                {
                    // check first parameter to .writeLn(), as long as the preceeding object matches the regex "document"
                    writeln: {
                        objectMatches: ["document"],
                        properties: [0],
                        escape: {
                            methods: [],
                            taggedTemplates: [],
                        },
                    },
                },
            ],
            errors: [
                {
                    message: "Unsafe call to document.writeln for argument 0",
                    type: "CallExpression",
                },
            ],
        },

        // issue 154: Adding tests for TaggedTemplateExpression callee https://jestjs.io/docs/api#2-describeeachtablename-fn-timeout
        {
            code: "describe.each`table${node.insertAdjacentHTML('beforebegin', htmlString)}`(name, fn, timeout)",
            ...ECMA_VERSION_6_ONLY_OPTIONS,
            errors: [
                {
                    message:
                        "Unsafe call to node.insertAdjacentHTML for argument 1",
                    type: "CallExpression",
                },
            ],
        },
        {
            code: "describe.each`table${document.writeln(evil)}`(name, fn, timeout)",
            ...ECMA_VERSION_6_ONLY_OPTIONS,
            errors: [
                {
                    message: "Unsafe call to document.writeln for argument 0",
                    type: "CallExpression",
                },
            ],
        },
        {
            code: "node.insertAdjacentHTML`text ${variable}`",
            ...ECMA_VERSION_6_ONLY_OPTIONS,
            errors: [
                {
                    message:
                        "Unsafe call to node.insertAdjacentHTML for argument 1",
                    type: "TaggedTemplateExpression",
                },
            ],
        },
        {
            code: "custom`text ${variable}`",
            ...ECMA_VERSION_6_ONLY_OPTIONS,
            options: [
                {},
                {
                    custom: {
                        properties: [1],
                    },
                },
            ],
            errors: [
                {
                    message: "Unsafe call to custom for argument 1",
                    type: "TaggedTemplateExpression",
                },
            ],
        },
        {
            code: "custom`text ${variable} ${variable2}`",
            ...ECMA_VERSION_6_ONLY_OPTIONS,
            options: [
                {},
                {
                    custom: {
                        properties: [2],
                    },
                },
            ],
            errors: [
                {
                    message: "Unsafe call to custom for argument 2",
                    type: "TaggedTemplateExpression",
                },
            ],
        },
        {
            // admittedly, this doesnt make a lot of sense, since the func doesnt return a promise
            code: "async () => await foo.insertAdjacentHTML('afterend', blah);",
            ...ECMA_VERSION_2020_ONLY_OPTIONS,
            errors: [
                {
                    message:
                        "Unsafe call to foo.insertAdjacentHTML for argument 1",
                    type: "CallExpression",
                },
            ],
        },
        {
            // admittedly, this doesnt make a lot of sense, since the func doesnt return a promise
            code: "async () => (await foo.insertAdjacentHTML('afterend', blah))();",
            ...ECMA_VERSION_2020_ONLY_OPTIONS,
            errors: [
                {
                    message:
                        "Unsafe call to foo.insertAdjacentHTML for argument 1",
                    type: "CallExpression",
                },
            ],
        },
        {
            code: "async () => (await foo)().insertAdjacentHTML('afterend', blah);",
            ...ECMA_VERSION_2020_ONLY_OPTIONS,
            errors: [
                {
                    message:
                        "Unsafe call to (await foo)().insertAdjacentHTML for argument 1",
                    type: "CallExpression",
                },
            ],
        },
        {
            // AssignmentExpression, ensure we are detecting the pattern from the right part - Regression test for #124
            code: "(e = node.insertAdjacentHTML)('beforebegin', evil)",
            ...ECMA_VERSION_6_ONLY_OPTIONS,
            errors: [
                {
                    message:
                        "Unsafe call to node.insertAdjacentHTML for argument 1",
                    type: "CallExpression",
                },
            ],
        },
        {
            // Regression test for #124, make sure we go deeper and detect the unsafe pattern
            code: "(e = node.insertAdjacentHTML('beforebegin', evil))()",
            ...ECMA_VERSION_6_ONLY_OPTIONS,
            errors: [
                {
                    message:
                        "Unsafe call to node.insertAdjacentHTML for argument 1",
                    type: "CallExpression",
                },
            ],
        },
        {
            code: "(9)()",
            errors: [
                {
                    message:
                        "Error in no-unsanitized: Unexpected Callee. Please report a minimal code snippet to the developers at https://github.com/mozilla/eslint-plugin-no-unsanitized/issues/new?title=Unsupported%20Callee%20of%20type%20Literal%20for%20CallExpression",
                    type: "Literal",
                },
            ],
        },

        // Typescript test cases
        //
        // Null coalescing operator
        {
            code: "node!().insertAdjacentHTML('beforebegin', htmlString);",
            ...TYPESCRIPT_OPTIONS,
            errors: [
                {
                    message:
                        "Unsafe call to node!().insertAdjacentHTML for argument 1",
                    type: "CallExpression",
                },
            ],
        },
        {
            code: "node!.insertAdjacentHTML('beforebegin', htmlString);",
            ...TYPESCRIPT_OPTIONS,
            errors: [
                {
                    message:
                        "Unsafe call to node!.insertAdjacentHTML for argument 1",
                    type: "CallExpression",
                },
            ],
        },
        {
            code: "(x as HTMLElement).insertAdjacentHTML('beforebegin', htmlString)",
            ...TYPESCRIPT_OPTIONS,
            errors: [
                {
                    message:
                        "Unsafe call to x as HTMLElement.insertAdjacentHTML for argument 1",
                    type: "CallExpression",
                },
            ],
        },

        // Flow test cases

        {
            code: "(node: HTMLElement).insertAdjacentHTML('beforebegin', unsafe);",
            ...BABEL_OPTIONS_FOR_FLOW,
            errors: [
                {
                    message:
                        "Unsafe call to node: HTMLElement.insertAdjacentHTML for argument 1",
                    type: "CallExpression",
                },
            ],
        },
        {
            code: "node.insertAdjacentHTML('beforebegin', (unsafe: string));",
            ...BABEL_OPTIONS_FOR_FLOW,
            errors: [
                {
                    message:
                        "Unsafe call to node.insertAdjacentHTML for argument 1",
                    type: "CallExpression",
                },
            ],
        },
        {
            code: "(insertAdjacentHTML: function)('beforebegin', unsafe);",
            ...BABEL_OPTIONS_FOR_FLOW,
            errors: [
                {
                    message: "Unsafe call to insertAdjacentHTML for argument 1",
                    type: "CallExpression",
                },
            ],
        },
        {
            // This test ensures we do not allow _var_ declarations traced back as "safe"
            // because it could be modified through dynamical global scope operations,
            // e.g., globalThis['copies'] and we don't want to trace through those.
            code: "var copies = '<b>safe</b>'; /* some modifications with globalThis['copies'] */;  n.insertAdjacentHTML('beforebegin', copies);",
            errors: [
                {
                    message:
                        /Unsafe call to n.insertAdjacentHTML for argument 1/,
                    type: "CallExpression",
                },
            ],
        },
        {
            code: "let copies = evil; n.insertAdjacentHTML('beforebegin', copies);",
            errors: [
                {
                    message:
                        /Unsafe call to n.insertAdjacentHTML for argument 1 \(Variable 'copies' initialized with unsafe value at \d+:\d+\)/,
                    type: "CallExpression",
                },
            ],
            ...ECMA_VERSION_6_ONLY_OPTIONS,
        },
        {
            code: "let copies = '<b>safe</b>'; copies = suddenlyUnsafe; n.insertAdjacentHTML('beforebegin', copies);",
            errors: [
                {
                    message:
                        /Unsafe call to n.insertAdjacentHTML for argument 1 \(Variable 'copies' reassigned with unsafe value at \d+:\d+\)/,
                    type: "CallExpression",
                },
            ],
            ...ECMA_VERSION_6_ONLY_OPTIONS,
        },

        // Variable tracked back to a parameter part of a FunctionDeclaration.
        {
            code: "function test(evil) { let copies = '<b>safe</b>'; copies = evil; n.insertAdjacentHTML('beforebegin', copies); }",
            errors: [
                {
                    message:
                        /Unsafe call to n.insertAdjacentHTML for argument 1 \(Variable 'evil' declared as function parameter, which is considered unsafe. 'FunctionDeclaration' at \d+:\d+\)/,
                    type: "CallExpression",
                },
            ],
            ...ECMA_VERSION_6_ONLY_OPTIONS,
        },

        // Variable tracked back to a parameter part of a FunctionExpression.
        {
            code: "const fn = function (evil) { let copies = '<b>safe</b>'; copies = evil; n.insertAdjacentHTML('beforebegin', copies); }",
            errors: [
                {
                    message:
                        /Unsafe call to n.insertAdjacentHTML for argument 1 \(Variable 'evil' declared as function parameter, which is considered unsafe. 'FunctionExpression' at \d+:\d+\)/,
                    type: "CallExpression",
                },
            ],
            ...ECMA_VERSION_6_ONLY_OPTIONS,
        },

        // Variable tracked back to a parameter part of a ArrowFunctionExpression.
        {
            code: "const fn = (evil) => { let copies = '<b>safe</b>'; copies = evil; n.insertAdjacentHTML('beforebegin', copies); }",
            errors: [
                {
                    message:
                        /Unsafe call to n.insertAdjacentHTML for argument 1 \(Variable 'evil' declared as function parameter, which is considered unsafe. 'ArrowFunctionExpression' at \d+:\d+\)/,
                    type: "CallExpression",
                },
            ],
            ...ECMA_VERSION_6_ONLY_OPTIONS,
        },
        {
            code: "§fantasyCallee§()",
            ...FANTASY_CALLEE_OPTIONS,
            errors: [
                {
                    message:
                        "Error in no-unsanitized: Unexpected Callee. Please report a minimal code snippet to the developers at https://github.com/mozilla/eslint-plugin-no-unsanitized/issues/new?title=Unsupported%20Callee%20of%20type%20FantasyCallee%20for%20CallExpression",
                    type: "FantasyCallee",
                },
            ],
        },
        {
            code: `
              let c;
              if (cond) {
                c = '<b>safe</b>';
              } else {
                c = evil;
              }
              n.insertAdjacentHTML('beforebegin', \`\${c}\`);
            `,
            errors: [
                {
                    message:
                        /Unsafe call to n.insertAdjacentHTML for argument 1/,
                    type: "CallExpression",
                },
            ],
            ...ECMA_VERSION_6_ONLY_OPTIONS,
        },
        {
            code: "(info.current = n.insertAdjacentHTML)('beforebegin', c)",
            errors: [
                {
                    message:
                        /Unsafe call to n.insertAdjacentHTML for argument 1/,
                    type: "CallExpression",
                },
            ],
        },
        {
            code: "foo.setHTMLUnsafe(badness)",
            errors: [
                {
                    message: /Unsafe call to foo.setHTMLUnsafe for argument 0/,
                    type: "CallExpression",
                },
            ],
        },
    ],
});
