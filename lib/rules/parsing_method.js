/**
 * @file ESLint rule to disallow unsanitized method calls to HTML parsing methods.
 * @author Frederik Braun et al.
 * @copyright 2015-2017 Mozilla Corporation. All rights reserved.
 */
"use strict";

const createMethodsRule = require("../base_method");

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

const defaultRuleChecks = {
    // check first parameter to `DOMParser.parseFromString()`
    parseFromString: {
        objectMatches: ["DOMParser"],
        properties: [0],
    },

    // check first parameter to `Document.parseHTMLUnsafe()`
    parseHTMLUnsafe: {
        objectMatches: ["Document"],
        properties: [0],
    },
};

const meta = {
    docs: {
        description:
            "ESLint rule to disallow unsanitized method calls to HTML parsing methods",
        category: "possible-errors",
        url: "https://github.com/mozilla/eslint-plugin-no-unsanitized/tree/master/docs/rules/parsing_method.md",
    },
};

module.exports = createMethodsRule({
    meta,
    defaultRuleChecks,
});
