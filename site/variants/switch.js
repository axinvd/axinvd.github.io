// Variants scaffold of step cv-site (design.md, Variants): the one file that names the letters.
// ?variant=<letter> picks /variants/<letter>/style.css and its script.js; without a parameter, `a`.
// document.write keeps the stylesheet parser-inserted and render-blocking, so no other letter
// flashes first. Removed with the losing letters when a variant is chosen.
(function () {
  var letters = ['a', 'b', 'c'];
  var v = new URLSearchParams(location.search).get('variant');
  if (letters.indexOf(v) < 0) v = 'a';
  document.documentElement.setAttribute('data-variant', v);
  document.write(
    '<link rel="stylesheet" href="/variants/' + v + '/style.css">' +
    '<script src="/variants/' + v + '/script.js" defer><\/script>'
  );
})();
