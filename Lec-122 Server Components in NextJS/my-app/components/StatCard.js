// Server Component — pure presentation, fed numbers computed on the
// server in app/page.js. No state, no handlers, nothing that needs
// the browser.

export default function StatCard({ label, value, hint, accent = "server" }) {
  const accentText = accent === "client" ? "text-client" : "text-server";

  return (
    <div className="rounded-lg border border-hairline bg-panel-0 p-4 sm:p-5">
      <p className="font-mono text-[11px] uppercase tracking-wider text-ink-tertiary">
        {label}
      </p>
      <p className={`mt-2 font-mono text-3xl font-semibold tabular-nums ${accentText}`}>
        {value}
      </p>
      {hint ? (
        <p className="mt-1 text-xs text-ink-tertiary">{hint}</p>
      ) : null}
    </div>
  );
}
