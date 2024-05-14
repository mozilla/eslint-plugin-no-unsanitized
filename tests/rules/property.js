/**
 * @file Test for no-unsanitized rule
 * @author Frederik Braun et al.
 * @copyright 2015-2017 Mozilla Corporation. All rights reserved
 */

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const rule = require("../../lib/rules/property");
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

const FANTASY_OPERATOR_OPTIONS = preESLintv9
    ? {
          parser: require.resolve("../parsers/fantasy-operator"),
      }
    : {
          languageOptions: {
              parser: require("../parsers/fantasy-operator"),
          },
      };

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const eslintTester = new RuleTester();

eslintTester.run("property", rule, {
    // Examples of code that should not trigger the rule
    // XXX this does not find z['innerHTML'] and the like.

    valid: [
        // tests for innerHTML equals
        {
            code: "a.innerHTML = '';",
            ...ECMA_VERSION_6_ONLY_OPTIONS,
        },
        {
            code: "a.innerHTML *= 'test';",
            ...ECMA_VERSION_6_ONLY_OPTIONS,
        },
        {
            code: "c.innerHTML = ``;",
            ...ECMA_VERSION_6_ONLY_OPTIONS,
        },
        {
            code: "g.innerHTML = Sanitizer.escapeHTML``;",
            ...ECMA_VERSION_6_ONLY_OPTIONS,
        },
        {
            code: "h.innerHTML = Sanitizer.escapeHTML`foo`;",
            ...ECMA_VERSION_6_ONLY_OPTIONS,
        },
        {
            code: "i.innerHTML = Sanitizer.escapeHTML`foo${bar}baz`;",
            ...ECMA_VERSION_6_ONLY_OPTIONS,
        },

        // tests for innerHTML update (+= operator)
        {
            code: "a.innerHTML += '';",
            ...ECMA_VERSION_6_ONLY_OPTIONS,
        },
        {
            code: 'b.innerHTML += "";',
            ...ECMA_VERSION_6_ONLY_OPTIONS,
        },
        {
            code: "c.innerHTML += ``;",
            ...ECMA_VERSION_6_ONLY_OPTIONS,
        },
        {
            code: "g.innerHTML += Sanitizer.escapeHTML``;",
            ...ECMA_VERSION_6_ONLY_OPTIONS,
        },
        {
            code: "h.innerHTML += Sanitizer.escapeHTML`foo`;",
            ...ECMA_VERSION_6_ONLY_OPTIONS,
        },
        {
            code: "i.innerHTML += Sanitizer.escapeHTML`foo${bar}baz`;",
            ...ECMA_VERSION_6_ONLY_OPTIONS,
        },
        {
            code: "i.innerHTML += Sanitizer.unwrapSafeHTML(htmlSnippet)",
            ...ECMA_VERSION_6_ONLY_OPTIONS,
        },
        {
            code: "i.outerHTML += Sanitizer.unwrapSafeHTML(htmlSnippet)",
            ...ECMA_VERSION_6_ONLY_OPTIONS,
        },
        {
            code: "let c; c = 123; a.innerHTML = `${c}`;",
            ...ECMA_VERSION_6_ONLY_OPTIONS,
        },
        {
            code: "let c; a.innerHTML = `${c}`;",
            ...ECMA_VERSION_6_ONLY_OPTIONS,
        },

        // (binary) expressions
        {
            code: "x.innerHTML = `foo`+`bar`;",
            ...ECMA_VERSION_6_ONLY_OPTIONS,
        },
        {
            code: "y.innerHTML = '<span>' + 5 + '</span>';",
            ...ECMA_VERSION_6_ONLY_OPTIONS,
        },
        {
            code: "document.writeln(Sanitizer.escapeHTML`<em>${evil}</em>`);",
            ...ECMA_VERSION_6_ONLY_OPTIONS,
        },

        // template string expression tests
        {
            code: "u.innerHTML = `<span>${'lulz'}</span>`;",
            ...ECMA_VERSION_6_ONLY_OPTIONS,
        },
        {
            code: "v.innerHTML = `<span>${'lulz'}</span>${55}`;",
            ...ECMA_VERSION_6_ONLY_OPTIONS,
        },
        {
            code: "w.innerHTML = `<span>${'lulz'+'meh'}</span>`;",
            ...ECMA_VERSION_6_ONLY_OPTIONS,
        },

        // testing unwrapSafeHTML spread
        {
            code: "this.imeList.innerHTML = Sanitizer.unwrapSafeHTML(...listHtml);",
            ...ECMA_VERSION_6_ONLY_OPTIONS,
        },

        // Native method (Check customize code doesn't include these)
        {
            code: "document.toString = evil;",
        },
        {
            // issue 108: adding tests for custom escaper
            code: "w.innerHTML = templateEscaper`<em>${evil}</em>`;",
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
            code: "w.innerHTML = DOMPurify.sanitize('<em>${evil}</em>');",
            ...ECMA_VERSION_6_ONLY_OPTIONS,
            options: [
                {
                    escape: {
                        methods: ["DOMPurify.sanitize"],
                    },
                },
            ],
        },

        // Typescript support valid cases
        // raw strings can be assigned to innerHTML
        {
            code: "(options as HTMLElement).innerHTML = '<s>safe</s>';",
            ...TYPESCRIPT_OPTIONS,
        },
        {
            code: "(<HTMLElement>items[i](args)).innerHTML = 'rawstring';",
            ...TYPESCRIPT_OPTIONS,
        },
        {
            code: "lol.innerHTML = (5 as string);",
            ...TYPESCRIPT_OPTIONS,
        },
        {
            code: "node!.innerHTML = DOMPurify.sanitize(evil);",
            ...TYPESCRIPT_OPTIONS,
            options: [
                {
                    escape: {
                        methods: ["DOMPurify.sanitize"],
                    },
                },
            ],
        },

        // Flow support cases
        {
            code: "(x: HTMLElement).innerHTML = 'static string'",
            ...BABEL_OPTIONS_FOR_FLOW,
        },
        {
            code: "(x: HTMLElement).innerHTML = '<b>safe</b>'",
            ...BABEL_OPTIONS_FOR_FLOW,
        },
        {
            code: "(x: HTMLElement).innerHTML = '<b>safe</b>'",
            ...BABEL_OPTIONS_FOR_FLOW,
        },
        {
            code: "(items[i](args): HTMLElement).innerHTML = 'rawstring';",
            ...BABEL_OPTIONS_FOR_FLOW,
        },

        // support for variables that are declared elsewhere
        {
            code: "let literalFromElsewhere = '<b>safe</b>'; y.innerHTML = literalFromElsewhere;",
            ...ECMA_VERSION_6_ONLY_OPTIONS,
        },
        {
            code: "const literalFromElsewhereWithInnerExpr = '<b>safe</b>'+'yo'; y.innerHTML = literalFromElsewhereWithInnerExpr;",
            ...ECMA_VERSION_6_ONLY_OPTIONS,
        },
        {
            code: "let multiStepVarSearch = '<b>safe</b>'+'yo'; const copy = multiStepVarSearch; y.innerHTML = copy;",
            ...ECMA_VERSION_6_ONLY_OPTIONS,
        },
        {
            code: "let copies = '<b>safe</b>'; copies = 'stillOK'; y.innerHTML = copies;",
            ...ECMA_VERSION_6_ONLY_OPTIONS,
        },
        {
            code: "let copies = '<b>safe</b>'; if (monday) { copies = 'stillOK'; }; y.innerHTML = copies;",
            ...ECMA_VERSION_6_ONLY_OPTIONS,
        },
        {
            code: "let msg = '<b>safe</b>'; let altMsg = 'also cool';  if (monday) { msg = altMsg; }; y.innerHTML = msg;",
            ...ECMA_VERSION_6_ONLY_OPTIONS,
        },
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
                {
                    message: "Unsafe assignment to innerHTML",
                    type: "AssignmentExpression",
                },
            ],
        },
        {
            code: "a.innerHTML += htmlString;",
            errors: [
                {
                    message: "Unsafe assignment to innerHTML",
                    type: "AssignmentExpression",
                },
            ],
        },
        {
            code: "a.innerHTML += template.toHtml();",
            errors: [
                {
                    message: "Unsafe assignment to innerHTML",
                    type: "AssignmentExpression",
                },
            ],
        },
        {
            code: "m.outerHTML = htmlString;",
            errors: [
                {
                    message: "Unsafe assignment to outerHTML",
                    type: "AssignmentExpression",
                },
            ],
        },
        {
            code: "t.innerHTML = `<span>${name}</span>`;",
            errors: [
                {
                    message: "Unsafe assignment to innerHTML",
                    type: "AssignmentExpression",
                },
            ],
            ...ECMA_VERSION_6_ONLY_OPTIONS,
        },
        {
            code: "t.innerHTML = `<span>${'foobar'}</span>${evil}`;",
            errors: [
                {
                    message: "Unsafe assignment to innerHTML",
                    type: "AssignmentExpression",
                },
            ],
            ...ECMA_VERSION_6_ONLY_OPTIONS,
        },

        // (binary) expressions
        {
            code: "node.innerHTML = '<span>'+ htmlInput;",
            errors: [
                {
                    message: "Unsafe assignment to innerHTML",
                    type: "AssignmentExpression",
                },
            ],
        },
        {
            code: "node.innerHTML = '<span>'+ htmlInput + '</span>';",
            errors: [
                {
                    message: "Unsafe assignment to innerHTML",
                    type: "AssignmentExpression",
                },
            ],
        },

        // bug https://bugzilla.mozilla.org/show_bug.cgi?id=1198200
        {
            code:
                "title.innerHTML = _('WB_LT_TIPS_S_SEARCH'," +
                " {value0:engine});",
            errors: [
                {
                    message: "Unsafe assignment to innerHTML",
                    type: "AssignmentExpression",
                },
            ],
        },

        // https://bugzilla.mozilla.org/show_bug.cgi?id=1192595
        {
            code: "x.innerHTML = Sanitizer.escapeHTML(evil)",
            errors: [
                {
                    message: "Unsafe assignment to innerHTML",
                    type: "AssignmentExpression",
                },
            ],
        },
        {
            code: "x.innerHTML = Sanitizer.escapeHTML(`evil`)",
            errors: [
                {
                    message: "Unsafe assignment to innerHTML",
                    type: "AssignmentExpression",
                },
            ],
            ...ECMA_VERSION_6_ONLY_OPTIONS,
        },
        {
            code: "y.innerHTML = ((arrow_function)=>null)`some HTML`",
            errors: [
                {
                    message: "Unsafe assignment to innerHTML",
                    type: "AssignmentExpression",
                },
            ],
            ...ECMA_VERSION_6_ONLY_OPTIONS,
        },

        // testing unwrapSafeHTML spread sanitizer typo
        {
            code: "this.imeList.innerHTML = Sanitizer.unrapSafeHTML(...listHtml);",
            errors: [
                {
                    message: "Unsafe assignment to innerHTML",
                    type: "AssignmentExpression",
                },
            ],
            ...ECMA_VERSION_6_ONLY_OPTIONS,
        },

        // the previous override for manual review and legacy code is now invalid
        {
            code: "g.innerHTML = potentiallyUnsafe; // a=legacy, bug 1155131",
            errors: [
                {
                    message: "Unsafe assignment to innerHTML",
                    type: "AssignmentExpression",
                },
            ],
            ...ECMA_VERSION_6_ONLY_OPTIONS,
        },
        {
            code: "function foo() { return this().innerHTML = evil; };",
            errors: [
                {
                    message: "Unsafe assignment to innerHTML",
                    type: "AssignmentExpression",
                },
            ],
            ...ECMA_VERSION_6_ONLY_OPTIONS,
        },

        // issue 154: Adding tests for TaggedTemplateExpression callee https://jestjs.io/docs/api#2-describeeachtablename-fn-timeout
        {
            code: "describe.each`table${m.innerHTML = htmlString}`(name, fn, timeout)",
            ...ECMA_VERSION_6_ONLY_OPTIONS,
            errors: [
                {
                    message: "Unsafe assignment to innerHTML",
                    type: "AssignmentExpression",
                },
            ],
        },
        {
            code: "describe.each`table${t.innerHTML = `<span>${name}</span>`}`(name, fn, timeout)",
            ...ECMA_VERSION_6_ONLY_OPTIONS,
            errors: [
                {
                    message: "Unsafe assignment to innerHTML",
                    type: "AssignmentExpression",
                },
            ],
        },

        // Typescript support cases
        {
            code: "x!().innerHTML = htmlString",
            ...TYPESCRIPT_OPTIONS,
            errors: [
                {
                    message: "Unsafe assignment to innerHTML",
                    type: "AssignmentExpression",
                },
            ],
        },
        {
            code: "(x as HTMLElement).innerHTML = htmlString",
            ...TYPESCRIPT_OPTIONS,
            errors: [
                {
                    message: "Unsafe assignment to innerHTML",
                    type: "AssignmentExpression",
                },
            ],
        },
        {
            code: "lol.innerHTML = (foo as string);",
            ...TYPESCRIPT_OPTIONS,
            errors: [
                {
                    message: "Unsafe assignment to innerHTML",
                    type: "AssignmentExpression",
                },
            ],
        },

        // Flow support cases
        {
            code: "(x: HTMLElement).innerHTML = htmlString",
            ...BABEL_OPTIONS_FOR_FLOW,
            errors: [
                {
                    message: "Unsafe assignment to innerHTML",
                    type: "AssignmentExpression",
                },
            ],
        },
        {
            code: "node.innerHTML = (foo: string);",
            ...BABEL_OPTIONS_FOR_FLOW,
            errors: [
                {
                    message: "Unsafe assignment to innerHTML",
                    type: "AssignmentExpression",
                },
            ],
        },
        {
            code: "(items[i](args): HTMLElement).innerHTML = unsafe;",
            ...BABEL_OPTIONS_FOR_FLOW,
            errors: [
                {
                    message: "Unsafe assignment to innerHTML",
                    type: "AssignmentExpression",
                },
            ],
        },

        // ES2020 support cases
        {
            code: "yoink.innerHTML &&= bar;",
            errors: [
                {
                    message: "Unsafe assignment to innerHTML",
                    type: "AssignmentExpression",
                },
            ],
            ...BABEL_ONLY_OPTIONS,
        },
        {
            code: "yoink.innerHTML ||= bar;",
            errors: [
                {
                    message: "Unsafe assignment to innerHTML",
                    type: "AssignmentExpression",
                },
            ],
            ...BABEL_ONLY_OPTIONS,
        },
        {
            code: "yoink.innerHTML ??= bar;",
            errors: [
                {
                    message: "Unsafe assignment to innerHTML",
                    type: "AssignmentExpression",
                },
            ],
            ...BABEL_ONLY_OPTIONS,
        },

        // Ensure normalizeMethodCall expects a CallExpression with a CallExpression callee.
        {
            code: "a.innerHTML = somefn()()",
            errors: [
                {
                    message: "Unsafe assignment to innerHTML",
                    type: "AssignmentExpression",
                },
            ],
            ...ECMA_VERSION_6_ONLY_OPTIONS,
        },

        // Ensure normalizeMethodCall expects a CallExpression with a ConditionalExpression callee.
        {
            code: "a.innerHTML = (cond ? maybe_safe : or_evil)()",
            errors: [
                {
                    message: "Unsafe assignment to innerHTML",
                    type: "AssignmentExpression",
                },
            ],
            ...ECMA_VERSION_6_ONLY_OPTIONS,
        },

        // Explicitly cover behavior on new unexpected operators.
        {
            code: "copy = '<b>safe</b>'; copy = evil; y.innerHTML = copy;",
            errors: [
                {
                    message: "Unsafe assignment to innerHTML",
                    type: "AssignmentExpression",
                },
            ],
            ...ECMA_VERSION_6_ONLY_OPTIONS,
        },
        {
            code: "let copies = '<b>safe</b>'; copies = suddenlyUnsafe; y.innerHTML = copies;",
            errors: [
                {
                    message:
                        /Unsafe assignment to innerHTML \(Variable 'copies' reassigned with unsafe value at \d+:\d+\)/,
                    type: "AssignmentExpression",
                },
            ],
            ...ECMA_VERSION_6_ONLY_OPTIONS,
        },
        {
            code: "let copies = '<b>safe</b>'; if (monday) { copies = badness }; y.innerHTML = copies;",
            errors: [
                {
                    message:
                        /Unsafe assignment to innerHTML \(Variable 'copies' reassigned with unsafe value at \d+:\d+\)/,
                    type: "AssignmentExpression",
                },
            ],
            ...ECMA_VERSION_6_ONLY_OPTIONS,
        },
        {
            code: `let copies = "<b>safe</b>";
              (() => {
                  copies = badness;
              })();
              y.innerHTML = copies;
            `,
            errors: [
                {
                    message:
                        /Unsafe assignment to innerHTML \(Variable 'copies' reassigned with unsafe value at \d+:\d+\)/,
                    type: "AssignmentExpression",
                },
            ],
            ...ECMA_VERSION_6_ONLY_OPTIONS,
        },
        {
            code: `let obj = { prop: "<b>safe</b>" };
              doSomething(obj);
              let copies = obj.prop;
              y.innerHTML = copies;
            `,
            errors: [
                {
                    message:
                        /Unsafe assignment to innerHTML \(Variable 'copies' initialized with unsafe value at \d+:\d+\)/,
                    type: "AssignmentExpression",
                },
            ],
            ...ECMA_VERSION_6_ONLY_OPTIONS,
        },
        {
            code: "let msg = '<b>safe</b>'; let altMsg = 'also cool';  if (monday) { msg = altMsg; }; y.innerHTML = msg;",
            options: [
                {
                    variableTracing: false,
                },
            ],
            ...ECMA_VERSION_6_ONLY_OPTIONS,
            errors: [
                {
                    message: /Unsafe assignment to innerHTML/,
                    type: "AssignmentExpression",
                },
            ],
        },
        {
            code: "a.innerHTML §= b;",
            errors: [
                {
                    message:
                        "Error in no-unsanitized: Unexpected Assignment. Please report a minimal code snippet to the developers at https://github.com/mozilla/eslint-plugin-no-unsanitized/issues/new?title=Unsupported%20Operator%20%25C2%25A7%253D%20for%20AssignmentExpression",
                    type: "AssignmentExpression",
                },
            ],
            ...FANTASY_OPERATOR_OPTIONS,
        },

        // Uninitialized variable declaration.
        {
            code: `
              let c;
              if (cond) {
                c = '<b>safe</b>';
              } else {
                c = evil;
              }
              a.innerHTML = \`\${c}\`;
            `,
            errors: [
                {
                    message: /Unsafe assignment to innerHTML/,
                    type: "AssignmentExpression",
                },
            ],
            ...ECMA_VERSION_6_ONLY_OPTIONS,
        },
        {
            code: "let c; c = 'apparently-safe'; functionCall(c); n.innerHTML = c.property;",
            ...ECMA_VERSION_6_ONLY_OPTIONS,
            errors: [
                {
                    message: /Unsafe assignment to innerHTML/,
                    type: "AssignmentExpression",
                },
            ],
        },
    ],
});
