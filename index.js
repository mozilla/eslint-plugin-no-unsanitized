const { readFileSync } = require("fs");
const path = require("path");

const data = readFileSync(path.join(__dirname, "package.json"));
const packageJSON = JSON.parse(data);

/** @type {Record<string, "off" | "warn" | "error">} */
const rules = {
    "no-unsanitized/property": "error",
    "no-unsanitized/method": "error",
};

const plugin = {
    meta: {
        name: "eslint-plugin-no-unsanitized",
        version: packageJSON.version,
    },
    rules: {
        property: require("./lib/rules/property"),
        method: require("./lib/rules/method"),
    },
    configs: {
        recommended: {
            plugins: { "no-unsanitized": {} },
            rules,
        },
    },
};

plugin.configs.recommended.plugins["no-unsanitized"] = plugin;

module.exports = plugin;
