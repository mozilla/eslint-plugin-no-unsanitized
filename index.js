const { readFileSync } = require("fs");

const data = readFileSync("./package.json");
const packageJSON = JSON.parse(data);

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
    "no-unsanitized/property": "error",
    "no-unsanitized/method": "error",
};

Object.assign(plugin.configs, {
    "recommended-legacy": {
        plugins: ["no-unsanitized"],
        rules,
    },
    recommended: [
        {
            plugins: { "no-unsanitized": plugin },
            rules,
        },
    ],
});

module.exports = plugin;
