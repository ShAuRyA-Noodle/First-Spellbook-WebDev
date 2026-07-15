// Server Component — static teaching content. Nothing here reacts to
// user input, so it costs zero bytes of client JavaScript.

import Badge from "@/components/Badge";

const ROWS = [
  {
    need: "Read the filesystem, hit a database, call a private API",
    where: "server",
    why: "Direct access, no exposed endpoint, no client-side fetch waterfall.",
  },
  {
    need: "Keep API keys and secrets out of the browser",
    where: "server",
    why: "Server code is executed and discarded — it never reaches the client bundle.",
  },
  {
    need: "useState, useEffect, or any other hook",
    where: "client",
    why: "Hooks need the React runtime that only exists in the browser.",
  },
  {
    need: "onClick, onChange, onSubmit — any event handler",
    where: "client",
    why: "Handlers can't be serialized across the server → client wire.",
  },
  {
    need: "Browser-only APIs: localStorage, window, setInterval",
    where: "client",
    why: "These objects don't exist in the Node.js process that renders your server tree.",
  },
  {
    need: "Render mostly-static content: articles, layouts, lists",
    where: "server",
    why: "Zero hydration cost — the browser just paints HTML.",
  },
];

export default function ExplainerSection() {
  return (
    <section id="guide" className="scroll-mt-24 py-16 sm:py-20">
      <div className="mb-8 flex items-center gap-3">
        <Badge kind="server">Server Component</Badge>
        <p className="font-mono text-xs text-ink-tertiary">
          components/ExplainerSection.js
        </p>
      </div>

      <h2 className="text-2xl font-semibold tracking-tight text-ink-primary sm:text-3xl">
        Field guide — which one do you reach for?
      </h2>
      <p className="mt-2 max-w-2xl text-sm text-ink-secondary sm:text-base">
        Start every component as a Server Component — that&rsquo;s the App
        Router default. Only add <code className="rounded bg-panel-1 px-1.5 py-0.5 font-mono text-[13px] text-client">&quot;use client&quot;</code> when
        the framework&rsquo;s build error forces your hand, and put it on
        the smallest leaf you can.
      </p>

      <div className="mt-8 overflow-hidden rounded-lg border border-hairline">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="bg-panel-0">
              <th className="border-b border-hairline px-4 py-3 font-mono text-[11px] uppercase tracking-wider text-ink-tertiary sm:px-5">
                You need to&hellip;
              </th>
              <th className="border-b border-hairline px-4 py-3 font-mono text-[11px] uppercase tracking-wider text-ink-tertiary sm:px-5">
                Use
              </th>
              <th className="hidden border-b border-hairline px-4 py-3 font-mono text-[11px] uppercase tracking-wider text-ink-tertiary sm:table-cell sm:px-5">
                Why
              </th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row, i) => (
              <tr
                key={row.need}
                className={i % 2 === 0 ? "bg-panel-0" : "bg-canvas"}
              >
                <td className="px-4 py-3 align-top text-ink-secondary sm:px-5">
                  {row.need}
                </td>
                <td className="px-4 py-3 align-top sm:px-5">
                  <Badge kind={row.where}>{row.where}</Badge>
                </td>
                <td className="hidden px-4 py-3 align-top text-ink-tertiary sm:table-cell sm:px-5">
                  {row.why}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-hairline bg-panel-0 p-5">
          <Badge kind="server">app/page.js</Badge>
          <pre className="mt-3 overflow-x-auto rounded-md bg-canvas p-3 font-mono text-[12px] leading-relaxed text-ink-secondary">
{`export const dynamic = "force-dynamic";

export default async function Home() {
  console.log("[SERVER] rendering…");
  const raw = await fs.readFile(
    path.join(process.cwd(), "data.json"),
    "utf-8"
  );
  const tasks = JSON.parse(raw);
  return <TaskExplorer tasks={tasks} />;
}`}
          </pre>
          <p className="mt-3 text-xs text-ink-tertiary">
            Async, reads the disk directly, logs to your terminal — none of
            this is possible in a Client Component.
          </p>
        </div>

        <div className="rounded-lg border border-hairline bg-panel-0 p-5">
          <Badge kind="client">components/TaskExplorer.js</Badge>
          <pre className="mt-3 overflow-x-auto rounded-md bg-canvas p-3 font-mono text-[12px] leading-relaxed text-ink-secondary">
{`"use client";

export default function TaskExplorer({ tasks }) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(
    () => tasks.filter(t => t.title.includes(query)),
    [tasks, query]
  );
  return <input onChange={e => setQuery(e.target.value)} />;
}`}
          </pre>
          <p className="mt-3 text-xs text-ink-tertiary">
            Receives server-fetched data as a prop, then filters it live in
            the browser — zero extra network requests per keystroke.
          </p>
        </div>
      </div>
    </section>
  );
}
