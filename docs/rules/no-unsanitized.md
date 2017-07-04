# eslint-plugin-no-unsanitized

Rules in *eslint-plugin-no-unsanitized* perform basic security
checks. The idea of these checks is to ensure that certain insecure
coding patterns are avoided in our codebase. We encourage developers
to use HTML sanitizers or escapers.


## Unsafe assignment to innerHTML or outerHTML (no-unsanitized/property)
The error message suggests that you are using an unsafe coding
pattern. Please do not assign varaibles to innerHTML, if at all
possible. Instead, we suggest using a sanitizer or escaping
function, e.g.,
[sanitizer.js](https://github.com/fxos-eng/sanitizer) 


## Unsafe call to insertAdjacentHTML, document.write or document.writeln (no-unsanitized/method)

This error message suggests that you are using an unsafe coding
pattern. Please do not simply call insertAdjacentHTML with a
variable parameter.

## Fixing linter errors

The default configuration will allow your code to pass if it ensures
that all user input is properly escaped.
Using the [sanitizer.js](https://github.com/fxos-eng/sanitizer) 
library your code would look like this:

```js
// example for no-unsanitized/property
foo.innerHTML = Sanitizer.escapeHTML`<a href="${link}">click</a>`

// example for no-unsanitized/method
node.insertAdjacentHTML('afterend', Sanitizer.escapeHTML`<a href="${link}">click</a>`);
```
### Wrapping & Unwrapping

If you need to generate your HTML somewhere else and e.g. cache it,
you won't be able to run `escapeHTML` on a string that knows no
distinction between HTML and user inputs.
Another feature in Sanitizer that allows you to create an object
that contains escaped HTML which is guaranteed to be safe and thus
allowed for direct innerHTML assignments (and insertAdjacentHTML
calls): `createSafeHTML` and `unwrapSafeHTML`

Example:
```js
// create the HTML object for later usage
function storeGreeting(username) {
  var safeHTML = Sanitizer.createSafeHTML`<p>Hello ${username}</p>`;
  cache.store('greeting', safeHTML)
}

// re-use the existing safe-HTML object
function useGreeting(domNode) {
  var htmlObj = cache.retrieve('greeting');
  domNode.innerHTML = Sanitizer.unwrapSafeHTML(htmlObj);
}
```

## That still does not solve my problem
It might very well be the case that there's a bug in our linter rule.
(Please file an issue.](https://github.com/mozilla/eslint-plugin-no-unsanitized/issues/new)
