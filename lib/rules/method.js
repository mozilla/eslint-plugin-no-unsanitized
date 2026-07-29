/**
 * @file ESLint rule to disallow unsanitized method calls
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

/**
 * On newer parsers, `import(foo)` gets parsed as a keyword.
 *
 * @param {object} ruleHelper a RuleHelper instance
 * @param {object} importExpr The ImportExpression we triggered on
 * @returns {undefined} Does not return
 */
function checkImport(ruleHelper, importExpr) {
    const fakeCall = {
        callee: { type: "Import" },
        arguments: [importExpr.source],
    };
    Object.assign(fakeCall, importExpr);
    ruleHelper.checkMethod(fakeCall);
}

// A bound function is only worth re-checking when we can tell which
// function is being bound. Rewriting any other expression would report its
// receiver as an unsupported callee, or duplicate a diagnostic that another
// visitor already emits for it.
const BINDABLE_CALLEES = ["Identifier", "MemberExpression", "CallExpression"];

/**
 * Returns the function being bound by an expression that looks like a call to
 * `Function.prototype.bind`, i.e., `foo.bar` for the `foo.bar.bind(foo)` part
 * of `foo.bar.bind(foo)(baz)`.
 *
 * @param {object} callExpr The CallExpression to inspect
 * @returns {object|undefined} The bound function, if we can name one
 */
function getBoundFunction(callExpr) {
    const callee = callExpr.callee;
    if (
        callee.type !== "MemberExpression" ||
        callee.computed ||
        callee.property.type !== "Identifier" ||
        callee.property.name !== "bind"
    ) {
        return undefined;
    }
    return BINDABLE_CALLEES.includes(callee.object.type)
        ? callee.object
        : undefined;
}

/**
 * Run ruleHelper.checkMethod for all but irrelevant callees (FunctionExpression, etc.)
 *
 * @param {object} ruleHelper a RuleHelper instance
 * @param {object} callExpr The CallExpression we triggered on
 * @param {object} node The callee node
 * @returns {undefined} Does not return
 */
function checkCallExpression(ruleHelper, callExpr, node) {
    switch (node.type) {
        case "Identifier":
        case "MemberExpression":
            if (callExpr.arguments && callExpr.arguments.length > 0) {
                ruleHelper.checkMethod(callExpr);
            }
            break;

        case "TSNonNullExpression": {
            const newCallExpr = Object.assign({}, callExpr);
            newCallExpr.callee = node.expression;
            checkCallExpression(ruleHelper, newCallExpr, node.expression);
            break;
        }

        case "TaggedTemplateExpression": {
            const newCallExpr = Object.assign({}, callExpr);
            newCallExpr.callee = node.tag;
            const expressions = node.quasi.expressions;
            const strings = node.quasi.quasis;
            newCallExpr.arguments = [strings, ...expressions];
            checkCallExpression(ruleHelper, newCallExpr, node.tag);
            break;
        }

        case "TypeCastExpression": {
            const newCallExpr = Object.assign({}, callExpr);
            newCallExpr.callee = node.expression;
            checkCallExpression(ruleHelper, newCallExpr, node.expression);
            break;
        }

        case "AssignmentExpression":
            if (node.right.type === "MemberExpression") {
                const newCallExpr = Object.assign({}, callExpr);
                newCallExpr.callee = node.right;
                checkCallExpression(ruleHelper, newCallExpr, node.right);
                break;
            }
            checkCallExpression(ruleHelper, callExpr, node.right);
            break;

        case "Import":
            ruleHelper.checkMethod(callExpr);
            break;

        case "SequenceExpression": {
            // the return value of a SequenceExpression is the last expression.
            // So, we create a new mock CallExpression with the actually called
            // ... expression as the callee node and pass it to checkMethod()

            const newCallExpr = Object.assign({}, callExpr);
            const idx = node.expressions.length - 1;
            const called = node.expressions[idx];
            newCallExpr.callee = called;
            ruleHelper.checkMethod(newCallExpr);
            break;
        }

        case "CallExpression": {
            // Calling the result of a call is only interesting when that call
            // is a bind(): `foo.insertAdjacentHTML.bind(foo)(pos, bar)` runs
            // the very same method as `foo.insertAdjacentHTML(pos, bar)`.
            // So, we create a new mock CallExpression that calls the bound
            // function directly and check that one instead. Issue #115.
            const bound = getBoundFunction(node);
            if (!bound) {
                break;
            }

            // bind() prepends its own arguments, all but `thisArg`, to the
            // ones of the eventual call. A SpreadElement in the `thisArg`
            // position may well stand for prepended arguments too and we
            // cannot tell how many, so we leave those calls alone.
            const [thisArg, ...prependedArguments] = node.arguments;
            if (thisArg && thisArg.type === "SpreadElement") {
                break;
            }

            const newCallExpr = Object.assign({}, callExpr);
            newCallExpr.callee = bound;
            newCallExpr.arguments = [
                ...prependedArguments,
                ...callExpr.arguments,
            ];
            checkCallExpression(ruleHelper, newCallExpr, bound);
            break;
        }

        case "TSAsExpression":
            break;

        // those are fine:
        case "LogicalExpression": // Should we scan these? issue #62.
        case "ConditionalExpression":
        case "ArrowFunctionExpression":
        case "FunctionExpression":
        case "Super":
        case "ThisExpression":
        case "NewExpression":
        case "TSTypeAssertion":
        case "AwaitExpression": // see issue #122
            break;

        // If we don't cater for this expression throw an error
        default:
            ruleHelper.reportUnsupported(
                node,
                "Unexpected Callee",
                `Unsupported Callee of type ${node.type} for CallExpression`
            );
    }
}

module.exports = {
    meta: {
        type: "problem",
        docs: {
            description: "ESLint rule to disallow unsanitized method calls",
            category: "possible-errors",
            url: "https://github.com/mozilla/eslint-plugin-no-unsanitized/tree/master/docs/rules/method.md",
        },
        schema: [
            {
                type: "object",
                properties: {
                    defaultDisable: {
                        type: "boolean",
                    },
                    escape: {
                        type: "object",
                        properties: {
                            taggedTemplates: {
                                type: "array",
                                items: [{ type: "string" }],
                            },
                            methods: {
                                type: "array",
                                items: [{ type: "string" }],
                            },
                        },
                    },
                    objectMatches: {
                        type: "array",
                    },
                    properties: {
                        type: "array",
                    },
                    variableTracing: { type: "boolean" },
                },
                additionalProperties: false,
            },
            {
                type: "object",
            },
        ],
    },
    create(context) {
        const ruleHelper = new RuleHelper(context, defaultRuleChecks);
        return {
            CallExpression(node) {
                checkCallExpression(ruleHelper, node, node.callee);
            },
            ImportExpression(node) {
                checkImport(ruleHelper, node);
            },

            // Tagged template expressions pass arguments in a special format we need to
            // map to our existing function call logic
            // foo`bar${var1}${var2}` will run as foo(['bar', ''], var1, var2)
            TaggedTemplateExpression(node) {
                const newCallExpr = Object.assign({}, node);
                newCallExpr.callee = node.tag;
                const expressions = node.quasi.expressions;
                const strings = node.quasi.quasis;
                newCallExpr.arguments = [strings, ...expressions];
                checkCallExpression(ruleHelper, newCallExpr, node.tag);
            },
        };
    },
};
