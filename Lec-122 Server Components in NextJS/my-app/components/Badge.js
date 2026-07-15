// Server Component (no "use client" — this file never ships its own JS
// to the browser; it just returns markup). Used throughout the page to
// tag which render environment produced the section next to it.

const KIND_STYLES = {
  server: {
    dot: "bg-server",
    text: "text-server",
    ring: "ring-server/25",
    bg: "bg-server-dim/60",
  },
  client: {
    dot: "bg-client",
    text: "text-client",
    ring: "ring-client/25",
    bg: "bg-client-dim/60",
  },
  warn: {
    dot: "bg-warn",
    text: "text-warn",
    ring: "ring-warn/25",
    bg: "bg-warn-dim/60",
  },
};

export default function Badge({ kind = "server", children, pulse = false }) {
  const style = KIND_STYLES[kind] ?? KIND_STYLES.server;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full ${style.bg} px-2.5 py-1 font-mono text-[11px] font-medium uppercase tracking-wider ${style.text} ring-1 ${style.ring}`}
    >
      <span className="relative flex h-1.5 w-1.5">
        {pulse ? (
          <span
            className={`absolute inline-flex h-full w-full animate-ping rounded-full ${style.dot} opacity-60`}
          />
        ) : null}
        <span
          className={`relative inline-flex h-1.5 w-1.5 rounded-full ${style.dot}`}
        />
      </span>
      {children}
    </span>
  );
}
