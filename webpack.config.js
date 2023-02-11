"use strict";
const NodePolyfillPlugin = require("node-polyfill-webpack-plugin");

/** @type {import("webpack").Configuration} */
module.exports = {
    mode: "none",
    entry: {
        no_unsanitize: ["./web.js"],
    },
    output: {
        filename: "[name].js",
        library: "[name]",
        libraryTarget: "umd",
        globalObject: "this",
    },
    module: {
        rules: [
            {
                test: /\.m?js$/u,
                loader: "babel-loader",
                options: {
                    presets: [
                        ["@babel/preset-env", {
                            debug: true, // ← to print actual browser versions
                            // NOTE: keep the preset-env targets in sync with the one
                            // used in https://github.com/eslint/eslint
                            targets: ">0.5%, not chrome 49, not ie 11, not safari 5.1",
                        }],
                    ],
                },
            },
        ],
    },
    plugins: [
        new NodePolyfillPlugin(),
    ],
    resolve: {

        // NOTE: this option will determine which fields in its package.json are checked.
        // We only effectively export `main` in `package.json`.
        // https://webpack.js.org/configuration/resolve/#resolvemainfields
        mainFields: ["browser", "main", "module"],
    },
    stats: "errors-only",
};
