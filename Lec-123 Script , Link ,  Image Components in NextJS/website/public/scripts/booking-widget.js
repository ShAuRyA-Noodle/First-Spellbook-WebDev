// Loaded from /contact with strategy="lazyOnload" — the studio's booking widget is
// not needed to read or use the page, so it's the last thing to load, during
// browser idle time. Once it "connects," it swaps the pill from a neutral loading
// state to a ready state — that swap is the visible, load-bearing proof the
// strategy worked, no console needed.
(function () {
  var pill = document.getElementById("booking-widget-status");
  if (!pill) return;
  pill.textContent = "Booking assistant connected — loaded via lazyOnload";
  // Toggle a plain, hand-written CSS class (defined in globals.css) rather than a
  // Tailwind utility class: this file lives in public/scripts/, outside Tailwind's
  // content scan, so any *new* utility class named only here would ship with no
  // matching styles in the compiled CSS.
  pill.classList.add("pill-ready");
})();
