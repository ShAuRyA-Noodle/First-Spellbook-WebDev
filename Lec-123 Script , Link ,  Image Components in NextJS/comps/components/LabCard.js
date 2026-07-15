import Link from "next/link";

const ACCENT = {
  link: "border-l-link",
  image: "border-l-image",
  script: "border-l-script",
};

const ACCENT_TEXT = {
  link: "text-link",
  image: "text-image",
  script: "text-script",
};

export default function LabCard({ accent, tag, title, description, href, cta }) {
  return (
    <Link
      href={href}
      className={`focus-ring card-surface group flex flex-col gap-4 border-l-2 ${ACCENT[accent]} p-6 transition-colors hover:bg-lab-raised`}
    >
      <span className={`eyebrow ${ACCENT_TEXT[accent]}`}>{tag}</span>
      <h2 className="text-xl font-semibold text-lab-ink">{title}</h2>
      <p className="text-sm leading-relaxed text-lab-ink-soft">{description}</p>
      <span className={`mt-auto flex items-center gap-1.5 text-sm font-medium ${ACCENT_TEXT[accent]}`}>
        {cta}
        <span className="transition-transform group-hover:translate-x-1">→</span>
      </span>
    </Link>
  );
}
