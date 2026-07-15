// Server Component — static markup, rendered once on the server and
// streamed down as plain HTML. No interactivity, so no "use client".

import Badge from "@/components/Badge";

export default function Footer() {
  return (
    <footer className="border-t border-hairline bg-panel-0">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <Badge kind="server">Server Component</Badge>
          <p className="font-mono text-xs text-ink-tertiary">
            components/Footer.js
          </p>
        </div>
        <p className="text-xs text-ink-tertiary">
          Lecture 122 · Rendered on the server, shipped as plain HTML — no
          client JavaScript for this footer.
        </p>
      </div>
    </footer>
  );
}
