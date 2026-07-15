// Tiny pub/sub used across the lab so ANY component — a React client component,
// a plain inline <Script>, or an external script loaded via next/script — can push
// a line into the shared ConsoleDock without prop-drilling or React context.
// It works because window.CustomEvent is available to raw <script> tags too, which
// is exactly what our beforeInteractive / afterInteractive / lazyOnload demos need.

export const LOG_EVENT = "nextlab:log";

/**
 * @param {"link"|"image"|"script"|"system"} category
 * @param {string} message
 */
export function logEvent(category, message) {
  if (typeof window === "undefined") return;
  const detail = { category, message, t: performance.now() };
  // Buffer on window so events fired by a beforeInteractive <Script> — which runs
  // before React hydrates and before ConsoleDock has mounted to add a listener —
  // aren't lost. ConsoleDock replays this buffer on mount, then listens live.
  window.__NEXTLAB_BUFFER__ = window.__NEXTLAB_BUFFER__ || [];
  window.__NEXTLAB_BUFFER__.push(detail);
  window.dispatchEvent(new CustomEvent(LOG_EVENT, { detail }));
}

export function subscribe(handler) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(LOG_EVENT, handler);
  return () => window.removeEventListener(LOG_EVENT, handler);
}

export function drainBuffer() {
  if (typeof window === "undefined") return [];
  return window.__NEXTLAB_BUFFER__ || [];
}
