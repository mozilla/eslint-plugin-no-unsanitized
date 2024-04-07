const packageJSON = require("./package.json");

const plugin = {
    meta: {
        name: "eslint-plugin-no-unsanitized",
        version: packageJSON.version,
    },
    rules: {
        property: require("./lib/rules/property"),
        method: require("./lib/rules/method"),
    },
    configs: {},
};

const rules = {
    "no-unsanitized/property": [
        "error",
        {},
        {
            // Check unsafe assignment to innerHTML
            innerHTML: {},

            // Check unsafe assignment to outerHTML
            outerHTML: {},
        },
    ],
    "no-unsanitized/method": [
        "error",
        {},
        {
            // check second parameter to .insertAdjacentHTML()
            insertAdjacentHTML: {
                properties: [1],
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
        },
    ],
};

Object.assign(plugin.configs, {
    "DOM-legacy": {
        plugins: ["no-unsanitized"],
        rules,
    },
    DOM: [
        {
            plugins: { "no-unsanitized": plugin },
            rules,
        },
    ],
});

module.exports = plugin;
