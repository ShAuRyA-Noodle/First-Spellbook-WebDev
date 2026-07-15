// Loaded with strategy="lazyOnload" from /script-lab — i.e. during browser idle
// time, after everything else has finished. This is the right strategy for
// low-priority, non-critical widgets: chat bubbles, social embeds, and — here —
// a pretend "support widget" that has no business delaying the page.
(function () {
  window.__NEXTLAB_TIMINGS__ = window.__NEXTLAB_TIMINGS__ || {};
  window.__NEXTLAB_TIMINGS__.lazyOnload = performance.now();

  window.__NEXTLAB_BUFFER__ = window.__NEXTLAB_BUFFER__ || [];
  var msg =
    "lazyOnload fired at " + Math.round(performance.now()) + "ms — external file, idle time";
  window.__NEXTLAB_BUFFER__.push({ category: "script", message: msg, t: performance.now() });
  window.dispatchEvent(
    new CustomEvent("nextlab:log", { detail: { category: "script", message: msg, t: performance.now() } })
  );
  window.dispatchEvent(new CustomEvent("nextlab:timing"));
})();
