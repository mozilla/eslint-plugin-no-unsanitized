[![Build Status](https://travis-ci.org/mozilla/eslint-plugin-no-unsanitized.svg?branch=master)](https://travis-ci.org/mozilla/eslint-plugin-no-unsanitized)
# Disallow unsanitized code (no-unsanitized)

These rules disallow unsafe coding practices that may result into security vulnerabilities. We will disallow assignments to innerHTML as well as calls to insertAdjacentHTML without the use of a pre-defined escaping function. The escaping functions must be called with a template string. The function names are hardcoded as `Sanitizer.escapeHTML` and `escapeHTML`.

## Rule Details

The rule disallows unsafe coding practices while trying to allow safe coding practices.

Here are a few examples of code that we do not want to allow:

```js
foo.innerHTML = input.value;
bar.innerHTML = "<a href='"+url+"'>About</a>";
```

A few examples of allowed practices:


```js
foo.innerHTML = 5;
bar.innerHTML = "<a href='/about.html'>About</a>";
bar.innerHTML = escapeHTML`<a href='${url}'>About</a>`;
```


This rule is being used within Mozilla to maintain and improve the security of our products and services.


## Usage

In your eslint.json file enable this rule with the following:


```
{
    "plugins": ["no-unsanitized"],
    "env": {
        "no-unsanitized/method": "error",
        "no-unsanitized/property": "error"
    }
}
```

## Advanced configuration

```js
{
    "plugins": ["no-unsanitized"],
    "env": {
        "no-unsanitized/method": [
            "error",
            {
                disableDefault: true,
                escape: {
                    taggedTemplates: ["safeHTML"]
                }
            },
            {
                html: {
                    properties: [0]
                }
            }
        ],
        "no-unsanitized/method": [
            "error",
            {
            },
            {
                innerHTML: {
                    objectMatches: ["document.*"]
                }
            }
        ]
    }
}
```

[To see all available options vitit](./SCHEMA.md)
