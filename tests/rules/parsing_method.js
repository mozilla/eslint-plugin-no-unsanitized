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
            code: "var doc = DOMParser.parseFromString('static string');",
        },
        {
            code: "var doc = Document.parseHTMLUnsafe('static string');",
        },
    ],

    // Examples of code that should trigger the rule
    invalid: [
        /* XXX Do NOT change the error strings below without review from freddy:
         * The strings are optimized for SEO and understandability.
         * The developer can search for them and will find this MDN article:
         *  https://developer.mozilla.org/en-US/Firefox_OS/Security/Security_Automation
         */

        {
            code: "var doc = DOMParser.parseFromString(badness);",
            errors: [
                {
                    message:
                        /Unsafe call to DOMParser.parseFromString for argument 0/,
                    type: "CallExpression",
                },
            ],
        },
        {
            code: "var doc = Document.parseHTMLUnsafe(badness);",
            errors: [
                {
                    message:
                        /Unsafe call to Document.parseHTMLUnsafe for argument 0/,
                    type: "CallExpression",
                },
            ],
        },
    ],
});
