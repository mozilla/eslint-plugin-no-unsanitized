/* global module */
/**
 * @fileoverview ESLint rule to disallow unsanitized method calls
 * @author Frederik Braun et al.
 * @copyright 2015-2017 Mozilla Corporation. All rights reserved.
 */
"use strict";

const RuleHelper = require("../ruleHelper");

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------


const defaultRuleChecks = {

    // check second parameter to .insertAdjacentHTML()
    insertAdjacentHTML: {
        properties: [1]
    },

    // check first parameter to .write(), as long as the preceeding object matches the regex "document"
    write: {
        objectMatches: [
            "document"
        ],
        properties: [0]
    },

    // check first parameter to .writeLn(), as long as the preceeding object matches the regex "document"
    writeln: {
        objectMatches: [
            "document"
        ],
        properties: [0]
    }
};

module.exports = {
    meta: {
        docs: {
            description: "ESLint rule to disallow unsanitized method calls",
            category: "possible-errors"
        },
        /* schema statement TBD until we have options
        schema: [
            {
                type: array
            }
        ]*/
    },
    create(context) {
        const ruleHelper = new RuleHelper(context);

        return {
            CallExpression(node) {
                // this is for insertAdjacentHTML(position, markup)
                switch(node.callee.type) {
                case "Identifier":
                case "MemberExpression":
                    if (node.arguments.length > 0) {
                        ruleHelper.checkMethod(node, defaultRuleChecks);
                    }
                    break;

                // those are fine:
                case "ArrowFunctionExpression":
                    break;
                case "FunctionExpression":
                    break;
                case "Super":
                    break;
                case "CallExpression":
                    break;

                // If we don't cater for this expression throw an error
                default:
                    ruleHelper.reportUnsupported(node, "Unexpected Callee", "Unsupported Callee for CallExpression");
                }
            }
        };
    }
};
