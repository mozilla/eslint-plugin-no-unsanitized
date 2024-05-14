import globals from "globals";
import js from "@eslint/js";
import jsdoc from "eslint-plugin-jsdoc";
import eslintConfigPrettier from "eslint-config-prettier";

export default [
    {
        languageOptions: {
            ecmaVersion: "latest",
            globals: {
                ...globals.browser,
                ...globals.node,
            },
        },
    },
    js.configs.recommended,
    {
        rules: {
            "lines-around-comment": [
                "error",
                {
                    allowArrayStart: true,
                    allowBlockStart: true,
                    allowObjectStart: true,
                    beforeBlockComment: false,
                    beforeLineComment: true,
                },
            ],
            "prefer-template": ["error"],
            "object-shorthand": ["error"],
            "prefer-const": ["error"],
            "no-var": ["error"],

            // Handling valid jsdoc.
            "jsdoc/check-access": "error",
            // Handled by prettier
            // "jsdoc/check-alignment": "error",
            "jsdoc/check-param-names": "error",
            "jsdoc/check-property-names": "error",
            "jsdoc/check-tag-names": "error",
            "jsdoc/check-types": "error",
            "jsdoc/empty-tags": "error",
            "jsdoc/tag-lines": ["error", "never", { startLines: 1 }],
            "jsdoc/no-multi-asterisks": "error",
            "jsdoc/require-param-type": "error",
            "jsdoc/require-returns-type": "error",
            "jsdoc/valid-types": "error",

            // Handling requiring jsdoc.
            "jsdoc/require-jsdoc": [
                "error",
                {
                    require: {
                        ClassDeclaration: true,
                        FunctionDeclaration: false,
                    },
                },
            ],
            "jsdoc/require-param": "error",
            "jsdoc/require-param-description": "error",
            "jsdoc/require-param-name": "error",
            "jsdoc/require-property": "error",
            "jsdoc/require-property-description": "error",
            "jsdoc/require-property-name": "error",
            "jsdoc/require-property-type": "error",
            "jsdoc/require-returns": "error",
            "jsdoc/require-returns-check": "error",
            "jsdoc/require-yields": "error",
            "jsdoc/require-yields-check": "error",
        },
        plugins: {
            jsdoc,
        },
    },

    // Should always be at the end, so that prettier is configured correctly.
    eslintConfigPrettier,
];
