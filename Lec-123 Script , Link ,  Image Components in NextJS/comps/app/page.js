import Image from "next/image";
import heroImg from "@/public/images/hero.svg";
import LabCard from "@/components/LabCard";

export default function Home() {
  return (
    <div className="flex flex-col gap-16">
      <section className="grid gap-10 lg:grid-cols-[1.1fr,1fr] lg:items-center">
        <div className="flex flex-col gap-5">
          <span className="eyebrow text-link">Lecture 123 · next.lab</span>
          <h1 className="text-balance text-4xl font-semibold leading-tight text-lab-ink sm:text-5xl">
            Three components Next.js gives you for free.
          </h1>
          <p className="max-w-lg text-balance text-base leading-relaxed text-lab-ink-soft">
            <code className="kbd">next/link</code>, <code className="kbd">next/image</code> and{" "}
            <code className="kbd">next/script</code> quietly replace <code>&lt;a&gt;</code>,{" "}
            <code>&lt;img&gt;</code> and <code>&lt;script&gt;</code> with framework-aware versions
            that navigate without reloading, ship the right image for the device, and load
            third-party JS on your terms. Open a lab below — every interaction is logged live
            in the console docked at the bottom of the screen.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <span className="flex items-center gap-2 rounded-full border border-lab-border px-3 py-1.5 text-xs text-lab-ink-soft">
              <span className="h-1.5 w-1.5 rounded-full bg-link" /> Client-side navigation
            </span>
            <span className="flex items-center gap-2 rounded-full border border-lab-border px-3 py-1.5 text-xs text-lab-ink-soft">
              <span className="h-1.5 w-1.5 rounded-full bg-image" /> Priority vs. lazy images
            </span>
            <span className="flex items-center gap-2 rounded-full border border-lab-border px-3 py-1.5 text-xs text-lab-ink-soft">
              <span className="h-1.5 w-1.5 rounded-full bg-script" /> Loading strategies
            </span>
          </div>
        </div>

        <div className="relative aspect-[16/9] overflow-hidden rounded-xl border border-lab-border">
          {/*
            priority — this hero is the largest content above the fold, so we tell
            Next.js to skip lazy-loading and fetch it eagerly (it also gets
            fetchPriority="high"). Compare with the un-prioritized tiles on /image-lab.
          */}
          <Image
            src={heroImg}
            alt="Abstract diagram of Link, Image and Script nodes wired together in an optimization pipeline"
            fill
            priority
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
      </section>

      <section className="grid gap-5 sm:grid-cols-3">
        <LabCard
          accent="link"
          tag="01 · next/link"
          title="Link Lab"
          description="Send the same navigation two ways — one through <Link>, one through a raw <a> — and watch the uptime counter prove which one reloaded the page."
          href="/link-lab"
          cta="Open the link lab"
        />
        <LabCard
          accent="image"
          tag="02 · next/image"
          title="Image Lab"
          description="One priority hero loads eagerly; a scrollable grid of tiles loads lazily. Each load is timestamped live in the console."
          href="/image-lab"
          cta="Open the image lab"
        />
        <LabCard
          accent="script"
          tag="03 · next/script"
          title="Script Lab"
          description="beforeInteractive, afterInteractive and lazyOnload — see the real millisecond gap between all three strategies on one timeline."
          href="/script-lab"
          cta="Open the script lab"
        />
      </section>
    </div>
  );
}
