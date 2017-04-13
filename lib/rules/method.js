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
                    if ("property" in node.callee && node.arguments.length > 0) {
                        if (node.callee.property.name === "insertAdjacentHTML") {
                            if (!ruleHelper.allowedExpression(node.arguments[1])) {
                                context.report(node, "Unsafe call to insertAdjacentHTML");
                            }
                        } else if (context.getSource(node.callee) === "document.write") {
                            if (!ruleHelper.allowedExpression(node.arguments[0])) {
                                context.report(node, "Unsafe call to document.write");
                            }
                        } else if (context.getSource(node.callee) === "document.writeln") {
                            if (!ruleHelper.allowedExpression(node.arguments[0])) {
                                context.report(node, "Unsafe call to document.writeln");
                            }
                        }
                    }
                    break;

                // those are fine:
                case "ArrowFunctionExpression":
                    break;
                case "FunctionExpression":
                    break;
                case "Super":
                    break;
                default:
                    context.reportUnsupported(node, "Unexpected Callee", "Unsupported Callee for CallExpression");
                }
            }
        };
    }
};
