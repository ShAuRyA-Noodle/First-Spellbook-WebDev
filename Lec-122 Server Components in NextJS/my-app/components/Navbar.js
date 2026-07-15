// Server Component (no "use client" at the top). The whole shell —
// logo, nav links, layout — is static markup rendered once on the
// server. The only reason this file ships *any* JavaScript to the
// browser is the <LiveClock/> leaf it renders: composition lets a
// Server Component embed a Client Component without becoming one
// itself. Try adding useState up here directly and Next.js will
// refuse to build until you add "use client" — at which point this
// entire nav (and everything it imports) would ship to the browser.

import Badge from "@/components/Badge";
import LiveClock from "@/components/LiveClock";

const LINKS = [
  { href: "#overview", label: "Overview" },
  { href: "#ledger", label: "Task Ledger" },
  { href: "#guide", label: "Field Guide" },
];

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-hairline bg-canvas/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <a
          href="#overview"
          className="flex shrink-0 items-center gap-2.5 rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-server"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-md border border-hairline-strong bg-panel-1 font-mono text-sm text-server">
            {"</>"}
          </span>
          <span className="flex flex-col leading-none">
            <span className="font-mono text-sm font-semibold tracking-tight text-ink-primary">
              RSC Lab
            </span>
            <span className="text-[11px] text-ink-tertiary">
              Server vs Client
            </span>
          </span>
        </a>

        <nav
          aria-label="Primary"
          className="scrollbar-none flex flex-1 items-center gap-1 overflow-x-auto"
        >
          {LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="shrink-0 rounded-md px-3 py-1.5 text-sm text-ink-secondary transition-colors hover:bg-panel-1 hover:text-ink-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-server"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden shrink-0 items-center gap-2 sm:flex">
          <Badge kind="server">Server</Badge>
          <LiveClock />
        </div>
      </div>
    </header>
  );
}
