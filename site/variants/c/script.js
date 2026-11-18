// Variant c, lens: motion-first, «the run». Marks what the reader has passed on the spine: one
// custom property (--run, the fill) and one class (is-passed) per node; it never writes text.
// With reduced motion it does nothing, and the page stays in its finished state.
(function () {
  var mq = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)');
  if (!mq || mq.matches) return;
  var root = document.documentElement;
  var main = document.querySelector('main');
  if (!main) return;
  var items = [].slice.call(main.querySelectorAll('h2, .chain > li, .failures > li, .position'));
  var queued = false;

  function update() {
    queued = false;
    var line = innerHeight * 0.62;
    var end = scrollY + innerHeight >= root.scrollHeight - 2;
    var box = main.getBoundingClientRect();
    var run = end ? 1 : Math.min(1, Math.max(0, (line - box.top) / box.height));
    main.style.setProperty('--run', run.toFixed(4));
    for (var i = 0; i < items.length; i++) {
      items[i].classList.toggle('is-passed', end || items[i].getBoundingClientRect().top < line);
    }
  }
  function queue() {
    if (!queued) { queued = true; requestAnimationFrame(update); }
  }
  function stop() {
    removeEventListener('scroll', queue);
    removeEventListener('resize', queue);
    root.classList.remove('c-run');
    main.style.removeProperty('--run');
  }

  root.classList.add('c-run', 'c-still');
  update();
  requestAnimationFrame(function () {
    requestAnimationFrame(function () { root.classList.remove('c-still'); });
  });
  addEventListener('scroll', queue, { passive: true });
  addEventListener('resize', queue);
  if (mq.addEventListener) mq.addEventListener('change', function (e) { if (e.matches) stop(); });
})();
