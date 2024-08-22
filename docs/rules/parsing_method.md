# parsing_method

The _parsing_method_ rule in _eslint-plugin-no-unsanitized_ performs basic security
checks for function calls that parse strings into new Document or DocumentFragment
instances. The idea of these checks is to allow developers to opt-in/opt-out of detecting
use of these methods, separately from the `method` rule which is reporting violation
as errors by default.

### Further Reading

-   Advanced guidance on [Fixing rule violations](fixing-violations.md)
-   This rule has some [customization](customization.md) options that allow you
    to add or remove functions that should not be called
