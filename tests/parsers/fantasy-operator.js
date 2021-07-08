"use strict";

/**
 * Parser: fantasy-callable
 * Source code: a.innerHTML §= b
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
                "type": "AssignmentExpression",
                "start": 1,
                "end": 6,
                "loc": {
                    "start": {
                        "line": 1,
                        "column": 1
                    },
                    "end": {
                        "line": 1,
                        "column": 6
                    }
                },
                "range": [
                    1,
                    6
                ],
                "operator": "§=",
                "left": {
                    "type": "MemberExpression",
                    "start": 1,
                    "end": 4,
                    "loc": {
                        "start": {
                            "line": 1,
                            "column": 1
                        },
                        "end": {
                            "line": 1,
                            "column": 4
                        }
                    },
                    "range": [
                        1,
                        4
                    ],
                    "object": {
                        "type": "Identifier",
                        "start": 1,
                        "end": 2,
                        "loc": {
                            "start": {
                                "line": 1,
                                "column": 1
                            },
                            "end": {
                                "line": 1,
                                "column": 2
                            },
                            "identifierName": "a"
                        },
                        "range": [
                            1,
                            2
                        ],
                        "name": "a",
                    },
                    "computed": false,
                    "property": {
                        "type": "Identifier",
                        "start": 3,
                        "end": 4,
                        "loc": {
                            "start": {
                                "line": 1,
                                "column": 3
                            },
                            "end": {
                                "line": 1,
                                "column": 4
                            },
                            "identifierName": "innerHTML"
                        },
                        "range": [
                            3,
                            4
                        ],
                        "name": "a",
                    },
                    "optional": false,
                },
                "right": {
                    "type": "Identifier",
                    "start": 5,
                    "end": 6,
                    "loc": {
                        "start": {
                            "line": 1,
                            "column": 5
                        },
                        "end": {
                            "line": 1,
                            "column": 6
                        },
                        "identifierName": "b"
                    },
                    "range": [
                        5,
                        6
                    ],
                    "name": "b",
                },
            },
        }
    ],
    "sourceType": "module"
});
