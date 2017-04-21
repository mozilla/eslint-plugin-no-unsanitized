/**
 * @fileoverview ESLint helpers for checking sanitization
 * @author Frederik Braun et al.
 * @copyright 2015-2017 Mozilla Corporation. All rights reserved.
 */
"use strict";

// names of escaping functions that we acknowledge
const VALID_ESCAPERS = ["Sanitizer.escapeHTML", "escapeHTML"];
const VALID_UNWRAPPERS = ["Sanitizer.unwrapSafeHTML", "unwrapSafeHTML"];

/* Change this to class RuleHelper when <4.2.6 is no longer an issue */
function RuleHelper(context) {
    this.context = context;
}

RuleHelper.prototype = {
    /**
     * Returns true if the expression contains allowed syntax, otherwise false.
     * For Template Strings with interpolation (e.g. |`${foo}`|) and
     * Binary Expressions (e.g. |foo+bar|), the function will look into the expression
     * recursively.
     * For testing and development, I recommend looking at example code and its syntax tree.
     * Using the Esprima Demo, for example: http://esprima.org/demo/parse.html
     *
     * @param {Object} expression Checks whether this node is an allowed expression.
     * @param {Object} escapeObject contains keys "methods" and "taggedTemplates" which are arrays of strings
     *                              of matching escaping function names.
     * @returns {boolean}
     */
    allowedExpression(expression, escapeObject) {
        if (!escapeObject) {
            escapeObject = {};
        }
        /*
        expression = { right-hand side of innerHTML or 2nd param to insertAdjacentHTML
        */
        let allowed;
        /* check the stringish-part, which is either the right-hand-side of
        an inner/outerHTML assignment or the 2nd parameter to insertAdjacentTML
        */

        /*  surely, someone could have an evil literal in there, but that"s malice
        we can just check for unsafe coding practice, not outright malice
        example literal "<script>eval(location.hash.slice(1)</script>"
        (it"s the task of the tagger-function to be the gateway here.)
        */
        if (expression.type === "Literal") {
            // we just assign a literal (e.g. a string, a number, a bool)
            allowed = true;
        } else if (expression.type === "TemplateLiteral") {
            allowed = true;

            // check for ${..} expressions
            for (let e = 0; e < expression.expressions.length; e++) {
                const templateExpression = expression.expressions[e];
                if (!this.allowedExpression(templateExpression, escapeObject)) {
                    allowed = false;
                    break;
                }
            }
        } else if (expression.type === "TaggedTemplateExpression") {
            allowed = this.isAllowedCallExpression(expression.tag, escapeObject.taggedTemplates || VALID_ESCAPERS);
        } else if (expression.type === "CallExpression") {
            allowed = this.isAllowedCallExpression(expression.callee, escapeObject.methods || VALID_UNWRAPPERS);
        } else if (expression.type === "BinaryExpression") {
            allowed = ((this.allowedExpression(expression.left, escapeObject))
            && (this.allowedExpression(expression.right, escapeObject)));
        } else {
            // everything that doesn't match is unsafe:
            allowed = false;
        }
        return allowed;
    },

    /**
     * Check if a callee is in the list allowed sanitizers
     * @param {Object} callee function that is being called expression.tag or expression.callee
     * @param {Array} allowedSanitizers List of valid wrapping expressions
     * @returns {boolean}
     */
    isAllowedCallExpression(callee, allowedSanitizers) {
        const funcName = this.getCodeName(callee);
        let allowed = false;
        if (funcName && allowedSanitizers.indexOf(funcName) !== -1) {
            allowed = true;
        }
        return allowed;
    },

    /**
     * Captures safely any new node types that have been missed and throw when we don't support them
     * this normalizes the passed in identifier type to return the same shape
     */
    normalizeMethodCall(node) {
        let methodName;
        let objectName;
        switch (node.type) {
        case "Identifier":
            methodName = node.name;
            break;
        case "MemberExpression":
            methodName = node.property.name;
            objectName = node.object.name;
            break;
        case "ArrowFunctionExpression":
            methodName = "";
            break;
        default:
            this.reportUnsupported(node, "Unexpected callable", `unexpected ${node.type} in normalizeMethodName`);
        }
        return {
            objectName,
            methodName
        };
    },

    /**
     * Returns functionName or objectName.methodName of an expression
     * @param {Object} node
     * @returns {String} nice name to expression call
     */
    getCodeName(node) {
        const normalizedMethodCall = this.normalizeMethodCall(node);
        let codeName = normalizedMethodCall.methodName;
        if (normalizedMethodCall.objectName) {
            codeName = `${normalizedMethodCall.objectName}.${codeName}`;
        }
        return codeName;
    },

    /**
     * Checks to see if a method or function should be called
     * If objectMatches isn't present or blank array the code should not be checked
     * If we do have object filters and the call is a function then it should not be checked
     * Checks if there are objectMatches we need to apply
     * @param {Object} node call expression node
     * @param {Object} objectMatches strings that are checked as regex to match an object name
     * @returns {Boolean} if to run checks expression
     */
    shouldCheckMethodCall(node, objectMatches) {
        const normalizedMethodCall = this.normalizeMethodCall(node.callee);
        let matched = false;

        // If objectMatches isn't present we should match all
        if (!objectMatches) {
            return true;
        }

        // if blank array the code should not be checked, this is a quick way to disable rules
        // TODO should we make this match all instead and let the $ruleCheck be false instead?
        if (objectMatches.length === 0) {
            return false;
        }

        // If we do have object filters and the call is a function then it should not be checked
        if ("objectName" in normalizedMethodCall) {
            for (const objectMatch of objectMatches) {
                const match = new RegExp(objectMatch, "gi");
                if (normalizedMethodCall.objectName.match(match)) {
                    matched = true;
                    break;
                }
            }
        }

        // if we don't have a objectName return false as bare function call
        // if we didn't match also return false
        return matched;
    },

    /**
     * Algorithm used to decide on merging ruleChecks with this.context
     * @returns {Object} merged ruleChecks
     */
    combineRuleChecks(defaultRuleChecks) {
        const parentRuleChecks = this.context.options[0] || {};
        let childRuleChecks = Object.assign({}, this.context.options[1]);
        const ruleCheckOutput = {};

        if (!("defaultDisable" in parentRuleChecks)
            || !parentRuleChecks.defaultDisable) {
            childRuleChecks = Object.assign({}, defaultRuleChecks, childRuleChecks);
        }

        // If we have defined child rules lets ignore default rules
        Object.keys(childRuleChecks).forEach((ruleCheckKey) => {
            // However if they have missing keys merge with default
            const ruleCheck = Object.assign({},
                                            defaultRuleChecks[ruleCheckKey],
                                            parentRuleChecks,
                                            childRuleChecks[ruleCheckKey]);
            ruleCheckOutput[ruleCheckKey] = ruleCheck;
        });
        return ruleCheckOutput;
    },

    /**
     * Runs the checks against a CallExpression
     * @param {Object} node call expression node
     * @param {Object} defaultRuleChecks default rules to merge with this.context
     */
    checkMethod(node, defaultRuleChecks) {
        const ruleChecks = this.combineRuleChecks(defaultRuleChecks);
        const normalizeMethodCall = this.normalizeMethodCall(node.callee);
        const methodName = normalizeMethodCall.methodName;

        if (ruleChecks.hasOwnProperty(methodName)) {
            const ruleCheck = ruleChecks[methodName];
            if (!Array.isArray(ruleCheck.properties)) {
                this.context.report(node, `Method check requires properties array in eslint rule ${methodName}`);
                return;
            }
            ruleCheck.properties.forEach((propertyId) => {
                const argument = node.arguments[propertyId];
                if (this.shouldCheckMethodCall(node, ruleCheck.objectMatches)
                    && !this.allowedExpression(argument, ruleCheck.escape)) {
                    this.context.report(node, `Unsafe call to ${this.getCodeName(node.callee)} for argument ${propertyId}`);
                }
            });
        }
    },

    /**
     * Runs the checks against an assignment expression
     * @param {Object} node assignment expression node
     * @param {Object} defaultRuleChecks default rules to merge with this.context
     */
    checkProperty(node, defaultRuleChecks) {
        const ruleChecks = this.combineRuleChecks(defaultRuleChecks);

        if (ruleChecks.hasOwnProperty(node.left.property.name)) {
            const ruleCheck = ruleChecks[node.left.property.name];
            if (!this.allowedExpression(node.right, ruleCheck.escape)) {
                this.context.report(node, `Unsafe assignment to ${node.left.property.name}`);
            }
        }
    },

    reportUnsupported(node, reason, errorTitle) {
        const bugPath = `https://github.com/mozilla/eslint-plugin-no-unsanitized/issues/new?title=${encodeURIComponent(errorTitle)}`;
        this.context.report(node, `Error in no-unsanitized: ${reason}. Please report a minimal code snippet to the developers at ${bugPath}`);
    }

};

module.exports = RuleHelper;
