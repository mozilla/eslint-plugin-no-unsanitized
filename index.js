const { readFileSync } = require("fs");
const path = require("path");

const data = readFileSync(path.join(__dirname, "package.json"));
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
    recommended: {
        plugins: { "no-unsanitized": plugin },
        rules,
    },
});
Object.defineProperty(plugin.configs, "DOM", {
    enumerable: true,
    get() {
        console.log(
            'The "DOM" configuration of the "no-unsanitized" plugin is deprecated. Use "recommended-legacy" instead.'
        );

        return this["recommended-legacy"];
    },
});

module.exports = plugin;
