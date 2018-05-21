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

    // check first parameter to createContextualFragment()
    createContextualFragment: {
        properties: [0]
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

/**
 * Run ruleHelper.checkMethod for all but irrelevant callees (FunctionExpression, etc.)
 * @param {Object} ruleHelper a RuleHelper instance
 * @param {Object} callExpr The CallExpression we triggered on
 * @param {Object} node The callee node
 * @returns {undefined} Does not return
 */
function checkCallExpression(ruleHelper, callExpr, node) {
    switch(node.type) {
    case "Identifier":
    case "MemberExpression":
        if (callExpr.arguments.length > 0) {
            ruleHelper.checkMethod(callExpr);
        }
        break;
    case "AssignmentExpression":
        checkCallExpression(ruleHelper, callExpr, node.right);
        break;

    // those are fine:
    case "LogicalExpression": // Should we scan these? issue #62.
    case "ConditionalExpression":
    case "ArrowFunctionExpression":
    case "FunctionExpression":
    case "Super":
    case "CallExpression":
    case "ThisExpression":
    case "NewExpression":
    case "Import":
        break;

    // If we don't cater for this expression throw an error
    default:
        ruleHelper.reportUnsupported(node, "Unexpected Callee", "Unsupported Callee for CallExpression");
    }
}

module.exports = {
    meta: {
        docs: {
            description: "ESLint rule to disallow unsanitized method calls",
            category: "possible-errors",
            url: "https://github.com/mozilla/eslint-plugin-no-unsanitized/tree/master/docs/rules/method.md"
        },
        /* schema statement TBD until we have options
        schema: [
            {
                type: array
            }
        ]*/
    },
    create(context) {
        const ruleHelper = new RuleHelper(context, defaultRuleChecks);
        return {
            CallExpression(node) {
                checkCallExpression(ruleHelper, node, node.callee);
            }
        };
    }
};
