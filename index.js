/* global module, require */
module.exports = {
    rules: {
        "property": require("./lib/rules/property"),
        "method": require("./lib/rules/method")
    }
};
