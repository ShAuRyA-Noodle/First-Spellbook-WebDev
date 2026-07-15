import Image from "next/image";
import bannerImg from "@/public/images/about-banner.svg";

export const metadata = {
  title: "About — Studio Lumen",
  description: "The studio's story, process, and approach to architectural photography.",
};

const PROCESS = [
  {
    step: "01",
    title: "Scout in daylight",
    body: "We walk the site at the hour we intend to shoot it, days before the camera comes out — light is the brief.",
  },
  {
    step: "02",
    title: "Shoot on location",
    body: "No studio, no staged sets. Every frame is the building or the room exactly as it stands.",
  },
  {
    step: "03",
    title: "Print on matte stock",
    body: "Contact sheets and final prints alike go through the same darkroom-inspired grading pass.",
  },
];

export default function AboutPage() {
  return (
    <div className="flex flex-col gap-20 pb-24">
      <section className="relative aspect-[16/7] w-full overflow-hidden">
        {/* No priority prop — this banner is well below the fold on first paint of most
            journeys into /about, so the default lazy behavior is the right call here. */}
        <Image
          src={bannerImg}
          alt="Warm, dark abstract banner with a faint aperture ring motif"
          fill
          sizes="100vw"
          className="object-cover"
        />
      </section>

      <section className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-6 text-center">
        <span className="eyebrow text-clay">About the studio</span>
        <h1 className="text-balance font-serif text-4xl leading-tight text-ink">
          We photograph buildings the way they&apos;re actually lived in.
        </h1>
        <p className="text-balance text-sm leading-relaxed text-ink-soft">
          Studio Lumen was founded in 2016 on a simple rule: no artificial light, no staged
          rooms. Every commission — a coastal house, a concrete stairwell, a single
          window — is shot where it stands, in the light it actually gets.
        </p>
      </section>

      <section className="mx-auto grid w-full max-w-5xl gap-8 px-6 sm:grid-cols-3">
        {PROCESS.map((item) => (
          <div key={item.step} className="flex flex-col gap-3 border-t border-clay/40 pt-5">
            <span className="font-serif text-3xl text-clay/70">{item.step}</span>
            <h2 className="text-base font-medium text-ink">{item.title}</h2>
            <p className="text-sm leading-relaxed text-ink-soft">{item.body}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
