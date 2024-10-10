/**
 * @file Test for no-unsanitized rule
 * @author Frederik Braun et al.
 * @copyright 2015-2017 Mozilla Corporation. All rights reserved
 */

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const rule = require("../../lib/rules/parsing_method");
const RuleTester = require("eslint").RuleTester;

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const eslintTester = new RuleTester();

eslintTester.run("parsing_method", rule, {
    // Examples of code that should not trigger the rule
    // XXX this does not find z['innerHTML'] and the like.

    valid: [
        {
            code: "var doc = parser.parseFromString('static string');",
        },
        {
            code: "var doc = Document.parseHTMLUnsafe('static string');",
        },
    ],

    // Examples of code that should trigger the rule
    invalid: [
        /* XXX Do NOT change the error strings below without review from freddy:
         * The strings are optimized for SEO and understandability.
         */

        {
            code: "var doc = domparser.parseFromString(badness);",
            errors: [
                {
                    message:
                        /Potentially unsafe call to DOMParser parseFromString \(domparser\.parseFromString\) for argument 0/,
                    type: "CallExpression",
                },
            ],
        },
        // Make sure we also warn on DOMParser instance named differently (as long as `parser` is part of the object name).
        {
            code: "var doc = parserdom.parseFromString(badness);",
            errors: [
                {
                    message:
                        /Potentially unsafe call to DOMParser parseFromString \(parserdom\.parseFromString\) for argument 0/,
                    type: "CallExpression",
                },
            ],
        },
        {
            code: "var doc = Document.parseHTMLUnsafe(badness);",
            errors: [
                {
                    message:
                        /Potentially unsafe call to Document.parseHTMLUnsafe for argument 0/,
                    type: "CallExpression",
                },
            ],
        },
        {
            code: "var doc = SomeDocument.parseHTMLUnsafe(badness);",
            errors: [
                {
                    message:
                        /Potentially unsafe call to Document.parseHTMLUnsafe \(SomeDocument\.parseHTMLUnsafe\) for argument 0/,
                    type: "CallExpression",
                },
            ],
        },
    ],
});
