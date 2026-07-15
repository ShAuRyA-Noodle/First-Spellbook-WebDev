"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/link-lab", label: "Link", dot: "bg-link" },
  { href: "/image-lab", label: "Image", dot: "bg-image" },
  { href: "/script-lab", label: "Script", dot: "bg-script" },
];

/**
 * The uptime counter is the whole point of this navbar: it starts when the ROOT
 * LAYOUT mounts and never resets during client-side navigation, because
 * next/link swaps only the route segment — the layout (and this component)
 * stays mounted. Click a plain `<a>` instead (see /link-lab) and the browser
 * does a full document reload, which remounts everything and snaps this back
 * to 0. That reset *is* the visible proof that `<Link>` avoided a reload.
 */
function useUptime() {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    const start = performance.now();
    const id = setInterval(() => {
      setSeconds(Math.floor((performance.now() - start) / 1000));
    }, 1000);
    return () => clearInterval(id);
  }, []);
  return seconds;
}

export default function Navbar() {
  const pathname = usePathname();
  const uptime = useUptime();

  return (
    <header className="sticky top-0 z-40 border-b border-lab-border bg-lab-bg/85 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="focus-ring flex items-center gap-2 rounded-md font-mono text-sm font-semibold text-lab-ink"
        >
          <span className="inline-block h-2 w-2 rounded-full bg-link pulse-dot" />
          next.lab
        </Link>

        <ul className="hidden items-center gap-1 sm:flex">
          {LINKS.map((item) => {
            const active = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`focus-ring flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors ${
                    active
                      ? "bg-lab-raised text-lab-ink"
                      : "text-lab-ink-soft hover:bg-lab-raised/60 hover:text-lab-ink"
                  }`}
                >
                  {item.dot && <span className={`h-1.5 w-1.5 rounded-full ${item.dot}`} />}
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <div
          className="kbd flex items-center gap-1.5"
          title="Seconds since the root layout mounted — resets only on a full page reload"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-image pulse-dot" />
          <span className="tabular-nums">uptime {String(uptime).padStart(3, "0")}s</span>
        </div>
      </nav>

      {/* mobile route row */}
      <ul className="flex items-center gap-1 overflow-x-auto border-t border-lab-border px-4 py-2 sm:hidden">
        {LINKS.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className={`focus-ring whitespace-nowrap rounded-md px-2.5 py-1.5 text-xs ${
                pathname === item.href ? "bg-lab-raised text-lab-ink" : "text-lab-ink-soft"
              }`}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </header>
  );
}
