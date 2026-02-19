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
    // check first parameter to DOMParser parseFromString method.
    parseFromString: {
        // NOTE: look for calls on objects with 'parser' included in their name.
        objectMatches: ["parser"],
        properties: [0],
        // Customized base message (propertyId and details.message will be appended to the custom
        // message returned).
        getCustomMessage(nodeCalleeCodeName) {
            return `Potentially unsafe call to DOMParser parseFromString (${nodeCalleeCodeName})`;
        },
    },

    // check first parameter to Document.parseHTMLUnsafe().
    parseHTMLUnsafe: {
        // NOTE: objectMatches values is internally used as case-insensitive.
        objectMatches: ["document"],
        properties: [0],
        getCustomMessage(nodeCalleeCodeName) {
            let message = "Potentially unsafe call to Document.parseHTMLUnsafe";
            if (nodeCalleeCodeName !== "Document.parseHTMLUnsafe") {
                message += ` (${nodeCalleeCodeName})`;
            }
            return message;
        },
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
