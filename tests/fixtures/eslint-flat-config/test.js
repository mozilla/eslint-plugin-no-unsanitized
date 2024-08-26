/* eslint no-undef: 0, no-var: 0, no-unused-vars: 0, prefer-template: 0 */

// Expect property linting error.
node.innerHTML = "<span>" + htmlInput + "</span>";

// Expect method linting error.
node.insertAdjacentHTML("beforebegin", htmlString);

// Expect parsing-method linting warning.
var doc = Document.parseHTMLUnsafe(badness);
