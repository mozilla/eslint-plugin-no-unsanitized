# Fixing Rule Violations

The default configuration will allow your code to pass if it ensures
that all user input is properly escaped. Using the an HTML sanitizer
library like [DOMPurify](https://github.com/cure53/DOMPurify/),
your code would look like this:

```js
// example for no-unsanitized/property
foo.innerHTML = DOMPurify.sanitize(<a href="${link}">click</a>);
```

Please also see the [customization docs](customization.md] to
change the allowed sanitizer calls.

# That still does not solve my problem

It might very well be the case that there's a bug in our linter rule.

[Please file an issue.](https://github.com/mozilla/eslint-plugin-no-unsanitized/issues/new)
