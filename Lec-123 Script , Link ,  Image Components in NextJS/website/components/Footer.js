import Link from "next/link";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-ink-ghost bg-ink text-paper">
      <div className="mx-auto flex max-w-5xl flex-col gap-8 px-6 py-12 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex max-w-sm flex-col gap-3">
          <span className="font-serif text-lg">Studio Lumen</span>
          <p className="text-sm leading-relaxed text-paper/60">
            An architectural photography studio working in available light, shot on location,
            printed on matte stock. Based on the coast, working worldwide.
          </p>
        </div>

        <nav aria-label="Footer">
          <ul className="flex gap-6">
            {LINKS.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="focus-ring rounded-sm text-sm text-paper/70 transition-colors hover:text-paper focus-visible:ring-offset-ink"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="border-t border-paper/10 px-6 py-4">
        <p className="mx-auto max-w-5xl text-xs tracking-wideish text-paper/40">
          © {year} Studio Lumen · Est. 2016 · Available worldwide
        </p>
      </div>
    </footer>
  );
}
