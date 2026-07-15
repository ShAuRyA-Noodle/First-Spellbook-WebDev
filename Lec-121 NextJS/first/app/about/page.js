const problems = [
  {
    title: "Full Stack Solution",
    description:
      "Write backend route handlers and frontend pages in the same project — no separate Express server for simple APIs.",
  },
  {
    title: "File-based Routing",
    description:
      "No react-router-dom, no route config. A folder with a page.js inside it becomes a URL, automatically.",
  },
  {
    title: "Additional features",
    description:
      "The router from next/navigation, next/link, next/image, and next/font — batteries included for a real product.",
  },
  {
    title: "Optimized rendering",
    description:
      "Server-side rendering and static generation out of the box, so pages ship fast and stay crawlable.",
  },
];

const stack = ["Next.js 14", "App Router", "React 18", "Tailwind CSS"];

export const metadata = {
  title: "About",
  description:
    "Why this project uses Next.js, and the four problems it solves compared to plain React.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16 sm:py-20">
      <p className="font-mono text-sm text-accent">{"// about"}</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
        Problems solved by Next.js
      </h1>
      <p className="mt-5 max-w-2xl text-lg leading-relaxed text-ink-soft">
        This page is one of three routes in this project — created by adding
        an <code className="rounded bg-paper-dim px-1.5 py-0.5 font-mono text-[0.9em] text-ink">about</code>{" "}
        folder under <code className="rounded bg-paper-dim px-1.5 py-0.5 font-mono text-[0.9em] text-ink">app/</code>.
        Here&rsquo;s the short version of why Next.js exists at all.
      </p>

      {/* Editor-style numbered list, echoing a code editor's line-number gutter */}
      <div className="mt-12 overflow-hidden rounded-2xl border border-line/10">
        {problems.map((problem, index) => (
          <div
            key={problem.title}
            className={`flex gap-5 px-6 py-5 ${
              index !== problems.length - 1 ? "border-b border-line/10" : ""
            }`}
          >
            <span className="select-none font-mono text-sm text-ink-faint">
              {String(index + 1).padStart(2, "0")}
            </span>
            <div>
              <h2 className="text-base font-semibold text-ink">
                {problem.title}
              </h2>
              <p className="mt-1 text-sm leading-relaxed text-ink-soft">
                {problem.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Pull quote */}
      <blockquote className="mt-12 border-l-2 border-accent pl-6 text-lg leading-relaxed text-ink-soft">
        Plain React gives you components and state. Next.js adds routing,
        rendering strategy, and a backend — the parts every real app needs
        anyway.
      </blockquote>

      {/* Stack badges */}
      <div className="mt-12">
        <p className="font-mono text-sm text-ink-faint">{"// built with"}</p>
        <ul className="mt-4 flex flex-wrap gap-2">
          {stack.map((item) => (
            <li
              key={item}
              className="rounded-full border border-line/15 bg-paper-dim px-3.5 py-1.5 font-mono text-xs text-ink-soft"
            >
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
