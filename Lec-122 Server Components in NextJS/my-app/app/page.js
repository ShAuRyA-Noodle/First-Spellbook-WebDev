import fs from "fs/promises";
import path from "path";
import Badge from "@/components/Badge";
import BoundaryDivider from "@/components/BoundaryDivider";
import StatCard from "@/components/StatCard";
import TaskExplorer from "@/components/TaskExplorer";
import ExplainerSection from "@/components/ExplainerSection";

// Force this route to render on every request instead of being
// statically optimized at build time. Without this, Next.js would
// notice this Server Component reads no request-specific data and
// would render it once and cache the HTML — which means the
// console.log calls below would only ever fire once, at build time,
// and refreshing the browser would teach you nothing. force-dynamic
// keeps the server round-trip (and its logs) live on every reload.
export const dynamic = "force-dynamic";

// Server Components can be declared `async` and `await` data before
// returning JSX — a capability Client Components do not have. This
// component reads data.json straight off disk with Node's `fs`
// module: no API route, no fetch, no CORS, and none of this code is
// ever sent to the browser.
export default async function Home() {
  const requestId = Math.random().toString(36).slice(2, 8);
  const startedAt = Date.now();

  console.log(
    `\n[SERVER] app/page.js rendering — request ${requestId} at ${new Date().toISOString()}`
  );

  const dataPath = path.join(process.cwd(), "data.json");
  const raw = await fs.readFile(dataPath, "utf-8");
  const tasks = JSON.parse(raw);

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.completed).length;
  const pendingTasks = totalTasks - completedTasks;
  const userIds = [...new Set(tasks.map((t) => t.userId))].sort(
    (a, b) => a - b
  );
  const completionRate = Math.round((completedTasks / totalTasks) * 100);

  console.log(
    `[SERVER] parsed ${totalTasks} tasks for ${userIds.length} users from data.json`
  );
  console.log(
    `[SERVER] request ${requestId} finished in ${Date.now() - startedAt}ms — this block only ever prints in your terminal, never in the browser DevTools console.\n`
  );

  // The commented block below is left here on purpose, the same way
  // the original lecture demo did it. Server Components cannot hold
  // state or handle events. Uncomment it *without* adding
  // "use client" to this file and Next.js will refuse to build —
  // that error message is the lesson (see README, Practice Exercise 1).
  //
  // import { useState } from "react";
  // const [count, setCount] = useState(0); // <-- breaks the Server Component
  // <button onClick={() => setCount(count + 1)}>{count}</button>

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
      {/* Hero */}
      <section id="overview" className="scroll-mt-24 py-16 sm:py-24">
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <Badge kind="server">Server Component</Badge>
          <p className="font-mono text-xs text-ink-tertiary">
            app/page.js · async, reads data.json via fs
          </p>
        </div>

        <h1 className="max-w-3xl text-balance text-4xl font-semibold tracking-tight text-ink-primary sm:text-5xl">
          Server Components render here.{" "}
          <span className="text-client">Client Components</span> hydrate
          over there.
        </h1>
        <p className="mt-4 max-w-2xl text-balance text-base text-ink-secondary sm:text-lg">
          This whole page is one lecture demo: a Server Component reads a
          200-row dataset straight off disk, hands it to a Client
          Component island for live filtering, and marks every boundary
          along the way so the split is impossible to miss.
        </p>

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-hairline bg-panel-0 p-4">
            <Badge kind="server">Look in your terminal</Badge>
            <p className="mt-2 text-sm text-ink-secondary">
              Every reload prints a fresh <code className="rounded bg-panel-1 px-1 py-0.5 font-mono text-[12px] text-server">[SERVER]</code>{" "}
              log with a new request id — proof this page really re-runs
              in Node on every request.
            </p>
          </div>
          <div className="rounded-lg border border-hairline bg-panel-0 p-4">
            <Badge kind="client">Look in DevTools</Badge>
            <p className="mt-2 text-sm text-ink-secondary">
              The navbar clock and the ledger below log to the{" "}
              <span className="text-client">browser</span> console only —
              their code shipped to you, so it runs where you&rsquo;re
              reading this.
            </p>
          </div>
        </div>
      </section>

      <BoundaryDivider label="fs.readFile(data.json) — inside an async Server Component" />

      {/* Server-computed stats */}
      <section aria-labelledby="stats-heading">
        <div className="mb-4 flex items-center gap-3">
          <Badge kind="server">Server Component</Badge>
          <h2
            id="stats-heading"
            className="font-mono text-xs uppercase tracking-wider text-ink-tertiary"
          >
            Computed once, on the server, before any HTML is sent
          </h2>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard label="Total tasks" value={totalTasks} accent="server" />
          <StatCard
            label="Completed"
            value={completedTasks}
            hint={`${completionRate}% completion rate`}
            accent="server"
          />
          <StatCard label="Pending" value={pendingTasks} accent="server" />
          <StatCard label="Users" value={userIds.length} accent="server" />
        </div>
        <p className="mt-3 font-mono text-[11px] text-ink-tertiary">
          request {requestId} · rendered {new Date(startedAt).toISOString()}
        </p>
      </section>

      <BoundaryDivider
        label="Server render ends — Client Component begins below"
        kind="client"
      />

      <TaskExplorer tasks={tasks} userIds={userIds} />

      <BoundaryDivider label="Back on the server — static field guide, no JS shipped" />

      <ExplainerSection />
    </div>
  );
}
