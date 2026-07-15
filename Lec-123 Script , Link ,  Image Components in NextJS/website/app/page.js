import Image from "next/image";
import Link from "next/link";
import heroImg from "@/public/images/hero-studio.svg";
import gallery01 from "@/public/images/gallery-01.svg";
import gallery02 from "@/public/images/gallery-02.svg";
import gallery03 from "@/public/images/gallery-03.svg";
import gallery04 from "@/public/images/gallery-04.svg";
import gallery05 from "@/public/images/gallery-05.svg";
import gallery06 from "@/public/images/gallery-06.svg";
import GalleryFrame from "@/components/GalleryFrame";

const GALLERY = [
  { src: gallery01, caption: "Coastline, dusk" },
  { src: gallery02, caption: "Structure study I" },
  { src: gallery03, caption: "Portrait, window light" },
  { src: gallery04, caption: "Faceted form" },
  { src: gallery05, caption: "Aperture, f/2.8" },
  { src: gallery06, caption: "Tidal lines" },
];

export default function Home() {
  return (
    <div className="flex flex-col gap-24 pb-24">
      <section className="relative">
        <div className="relative aspect-[3/2] w-full sm:aspect-[16/9]">
          {/*
            priority — the hero is the first thing visible on the page, so we skip
            lazy-loading and let Next.js fetch it eagerly.
          */}
          <Image
            src={heroImg}
            alt="Warm, hazy coastal hillside at dusk with a distant architectural silhouette"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/10 to-transparent" />
        </div>

        <div className="mx-auto -mt-24 max-w-3xl px-6 text-center sm:-mt-32">
          <div className="mx-auto flex max-w-2xl flex-col items-center gap-5 rounded-sm bg-paper px-8 py-10 shadow-[0_1px_0_rgba(34,29,24,0.06)] sm:px-14 sm:py-14">
            <span className="eyebrow text-clay">Architectural Photography</span>
            <h1 className="text-balance font-serif text-4xl leading-tight text-ink sm:text-5xl">
              Light, structure, and the space between them.
            </h1>
            <p className="max-w-md text-balance text-sm leading-relaxed text-ink-soft">
              Studio Lumen documents buildings and the people who move through them — shot on
              location, in available light, printed on matte stock.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <Link
                href="/contact"
                className="focus-ring rounded-sm bg-ink px-6 py-3 text-sm text-paper transition-opacity hover:opacity-85"
              >
                Enquire about a project
              </Link>
              <Link
                href="/about"
                className="focus-ring rounded-sm text-sm text-ink-soft underline underline-offset-4 hover:text-ink"
              >
                About the studio
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="eyebrow text-clay">Selected work</span>
            <h2 className="font-serif text-2xl text-ink">Contact sheet, 2024</h2>
          </div>
          <p className="max-w-xs text-xs leading-relaxed text-ink-faint">
            Every frame below loads lazily — next/image only fetches it once it nears the
            viewport, so this page stays light no matter how long the sheet grows.
          </p>
        </div>

        <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {GALLERY.map((item, i) => (
            <GalleryFrame
              key={item.caption}
              src={item.src}
              alt={item.caption}
              index={i + 1}
              total={GALLERY.length}
              caption={item.caption}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
