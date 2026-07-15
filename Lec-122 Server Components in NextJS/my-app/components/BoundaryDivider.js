// Server Component — the visual "signature" of this demo: a dashed seam
// marking every spot on the page where the render environment changes
// from server to client (or back). Purely decorative markup, so it never
// needs to be a Client Component.

const ACCENTS = {
  server: { text: "text-server", dot: "bg-server" },
  client: { text: "text-client", dot: "bg-client" },
};

export default function BoundaryDivider({ label, kind = "server" }) {
  const accent = ACCENTS[kind] ?? ACCENTS.server;
  const seam =
    "h-px flex-1 bg-[repeating-linear-gradient(90deg,rgb(var(--border-strong)/0.35)_0_6px,transparent_6px_12px)]";

  return (
    <div
      role="separator"
      aria-label={label}
      className="relative my-10 flex items-center gap-4 sm:my-14"
    >
      <span className={seam} />
      <span
        className={`flex shrink-0 items-center gap-2 rounded-full border border-hairline-strong bg-panel-1 px-3 py-1.5 font-mono text-[10px] font-medium uppercase tracking-[0.14em] ${accent.text} sm:text-[11px]`}
      >
        <span className={`h-1.5 w-1.5 rounded-full ${accent.dot}`} />
        {label}
      </span>
      <span className={seam} />
    </div>
  );
}
