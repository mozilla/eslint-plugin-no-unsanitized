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
     * @returns {boolean}
     */
    allowedExpression(expression) {
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
                if (!this.allowedExpression(templateExpression)) {
                    allowed = false;
                    break;
                }
            }
        } else if (expression.type === "TaggedTemplateExpression") {
            //TODO avoid code-duplication with CallExpression-case below.
            const functionName = this.context.getSource(expression.tag);
            if (VALID_ESCAPERS.indexOf(functionName) !== -1) {
                allowed = true;
            } else {
                allowed = false;
            }
        } else if ((expression.type === "CallExpression") &&
                (expression.callee.property || expression.callee.name)) {
            const funcName = expression.callee.name || expression.callee.property.name;
            if (funcName && VALID_UNWRAPPERS.indexOf(funcName) !== -1) {
                allowed = true;
            } else {
                allowed = false;
            }
        } else if (expression.type === "BinaryExpression") {
            allowed = ((this.allowedExpression(expression.left))
            && (this.allowedExpression(expression.right)));
        } else {
            // everything that doesn't match is unsafe:
            allowed = false;
        }
        return allowed;
    },

    reportUnsupported(node, reason, errorTitle) {
        const bugPath = `https://github.com/mozilla/eslint-plugin-no-unsanitized/issues/new?title=${encodeURIComponent(errorTitle)}`;
        this.context.report(node, `Error in no-unsanitized: ${reason}. Please report a minimal code snippet to the developers at ${bugPath}`);
    }

};

module.exports = RuleHelper;
