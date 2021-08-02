"use strict";

/**
 * Parser: fantasy-callable
 * Source code: §fantasyCallee§()
 */

exports.parse = () => ({
    "type": "Program",
    "start": 0,
    "end": 5,
    "loc": {},
    "comments": [],
    "errors": [],
    "range": [
        0,
        5
    ],
    "tokens": [],
    "body": [
        {
            "type": "ExpressionStatement",
            "loc": {
                "start": 0,
                "end": 5
            },
            "range": [
                0,
                5
            ],
            "expression": {
                "type": "CallExpression",
                "loc": {
                    "start": 0,
                    "end": 5
                },
                "range": [
                    0,
                    5
                ],
                "callee": {
                    "type": "FantasyCallee",
                    "loc": {
                        "start": 0,
                        "end": 3
                    },
                    "range": [
                        0,
                        3
                    ],
                    "name": "§fantasyCallee§"
                },
                "arguments": []
            }
        }
    ],
    "sourceType": "module"
});
