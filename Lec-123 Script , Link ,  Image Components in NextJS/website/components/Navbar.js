"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

function ApertureMark() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="9.5" stroke="currentColor" strokeOpacity="0.35" />
      <circle cx="11" cy="11" r="3.2" fill="currentColor" />
    </svg>
  );
}

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-ink-ghost bg-paper/90 backdrop-blur">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
        <Link href="/" className="focus-ring flex items-center gap-2 rounded-sm text-ink">
          <ApertureMark />
          <span className="font-serif text-lg tracking-tight">Studio Lumen</span>
        </Link>

        <ul className="flex items-center gap-7">
          {LINKS.map((item) => {
            const active = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`focus-ring relative rounded-sm pb-1 text-sm transition-colors ${
                    active ? "text-ink" : "text-ink-soft hover:text-ink"
                  }`}
                >
                  {item.label}
                  <span
                    className={`absolute inset-x-0 -bottom-0.5 h-px bg-clay transition-opacity ${
                      active ? "opacity-100" : "opacity-0"
                    }`}
                  />
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
}
