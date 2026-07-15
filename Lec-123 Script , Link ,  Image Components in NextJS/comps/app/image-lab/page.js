import heroImg from "@/public/images/hero.svg";
import tile01 from "@/public/images/tile-01.svg";
import tile02 from "@/public/images/tile-02.svg";
import tile03 from "@/public/images/tile-03.svg";
import tile04 from "@/public/images/tile-04.svg";
import tile05 from "@/public/images/tile-05.svg";
import tile06 from "@/public/images/tile-06.svg";
import ImageTile from "@/components/ImageTile";

export const metadata = {
  title: "Image Lab — next.lab",
  description: "Priority vs. lazy loading with next/image, timestamped live.",
};

const TILES = [tile01, tile02, tile03, tile04, tile05, tile06];

export default function ImageLabPage() {
  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-3">
        <span className="eyebrow text-image">02 · next/image</span>
        <h1 className="text-3xl font-semibold text-lab-ink">Priority above the fold, lazy below it</h1>
        <p className="max-w-2xl text-sm leading-relaxed text-lab-ink-soft">
          All images here are local SVGs in <code className="kbd">public/images/</code> — the
          safest option, since no remote hostname needs whitelisting. The featured image below
          is marked <code className="kbd">priority</code>, so Next.js fetches it eagerly and
          skips lazy-loading. The six tiles further down have no <code>priority</code> prop, so
          they use the default <code className="kbd">loading=&quot;lazy&quot;</code> behavior —
          scroll to them and watch the console log each one the instant it loads.
        </p>
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-lab-ink">Featured — priority + fill</h2>
        <ImageTile
          src={heroImg}
          alt="Abstract diagram of Link, Image and Script nodes wired together in an optimization pipeline"
          label="Featured hero"
          priority
          className="aspect-[21/9]"
        />
        <p className="font-mono text-xs text-lab-ink-faint">
          &lt;Image src=&#123;heroImg&#125; fill priority alt=&quot;…&quot; /&gt;
        </p>
      </section>

      <div className="flex min-h-[30vh] items-center justify-center rounded-lg border border-dashed border-lab-border text-sm text-lab-ink-ghost">
        ↓ scroll — the grid below loads lazily as it nears the viewport ↓
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-lab-ink">Gallery — default (lazy) loading</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TILES.map((src, i) => (
            <ImageTile
              key={i}
              src={src}
              alt={`Abstract optimization node artwork, tile ${i + 1} of ${TILES.length}`}
              label={`Tile ${String(i + 1).padStart(2, "0")}`}
              className="aspect-[4/3]"
            />
          ))}
        </div>
        <p className="font-mono text-xs text-lab-ink-faint">
          &lt;Image src=&#123;tile&#125; fill alt=&quot;…&quot; /&gt; — no priority prop, so it lazy-loads.
        </p>
      </section>
    </div>
  );
}
