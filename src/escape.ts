export default function escapeHtml(input: string) {
  // List of HTML entities for escaping.
  var htmlEscapes: any = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#x27;",
    "/": "&#x2F;"
  };

  // Regex containing the keys listed immediately above.
  var htmlEscaper = /[&<>"'\/]/g;

  // Escape a string for HTML interpolation.
  return input.replace(htmlEscaper, match => htmlEscapes[match]);
}
