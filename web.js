module.exports = {
    rules: {
        "no-unsanitized/property": require("./lib/rules/property"),
        "no-unsanitized/method": require("./lib/rules/method"),
    },
};
