import Image from "next/image";

/**
 * A single "contact sheet" frame — the studio's recurring motif. Every frame is
 * numbered like a roll of film, has a thin hairline border, and (aside from the
 * hero) loads lazily: only priority="above the fold" gets the eager treatment.
 */
export default function GalleryFrame({ src, alt, index, total, caption, priority = false }) {
  return (
    <figure className="group flex flex-col gap-2">
      <div className="relative aspect-[4/5] overflow-hidden border border-ink-ghost">
        <Image
          src={src}
          alt={alt}
          fill
          priority={priority}
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
        />
      </div>
      <figcaption className="flex items-baseline justify-between gap-3">
        <span className="frame-number">
          {String(index).padStart(2, "0")}/{String(total).padStart(2, "0")}
        </span>
        <span className="truncate text-xs text-ink-faint">{caption}</span>
      </figcaption>
    </figure>
  );
}
