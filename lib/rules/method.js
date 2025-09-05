/**
 * @file ESLint rule to disallow unsanitized method calls
 * @author Frederik Braun et al.
 * @copyright 2015-2017 Mozilla Corporation. All rights reserved.
 */
"use strict";

const createMethodsRule = require("../base_method");

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

const defaultRuleChecks = {
    // check second parameter to .insertAdjacentHTML()
    insertAdjacentHTML: {
        properties: [1],
    },

    // check first parameter of import()
    import: {
        properties: [0],
    },

    // check first parameter to createContextualFragment()
    createContextualFragment: {
        properties: [0],
    },

    // check first parameter to .write(), as long as the preceeding object matches the regex "document"
    write: {
        objectMatches: ["document"],
        properties: [0],
    },

    // check first parameter to .writeLn(), as long as the preceeding object matches the regex "document"
    writeln: {
        objectMatches: ["document"],
        properties: [0],
    },

    // check first parameter to `setHTMLUnsafe()`
    setHTMLUnsafe: {
        properties: [0],
    },
};

const meta = {
    docs: {
        description: "ESLint rule to disallow unsanitized method calls",
        category: "possible-errors",
        url: "https://github.com/mozilla/eslint-plugin-no-unsanitized/tree/master/docs/rules/method.md",
    },
};

module.exports = createMethodsRule({
    meta,
    defaultRuleChecks,
});
