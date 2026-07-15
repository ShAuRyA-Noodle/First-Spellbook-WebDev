"use client";

// Client Component. This file needs useState (search text, filters,
// pagination, an interaction counter) and onChange/onClick handlers —
// none of that is legal in a Server Component, which is exactly why
// the "use client" directive sits at the very top of this file, above
// every import. Everything this component imports is now part of the
// client bundle too.
//
// The data itself was never fetched from here: app/page.js read
// data.json on the server and passed the finished array down as a
// plain prop. This component only filters/sorts what it was given —
// no network request fires as you type.

import { useMemo, useState } from "react";
import Badge from "@/components/Badge";

const STATUS_OPTIONS = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "completed", label: "Completed" },
];

const PAGE_SIZE = 18;

function initials(userId) {
  return `U${userId}`;
}


export default function TaskExplorer({ tasks, userIds }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [userId, setUserId] = useState("all");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [interactions, setInteractions] = useState(0);

  const track = (fn) => (...args) => {
    setInteractions((n) => n + 1);
    fn(...args);
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tasks.filter((task) => {
      if (status === "completed" && !task.completed) return false;
      if (status === "pending" && task.completed) return false;
      if (userId !== "all" && task.userId !== Number(userId)) return false;
      if (q && !task.title.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [tasks, query, status, userId]);

  const visible = filtered.slice(0, visibleCount);
  const hasMore = filtered.length > visible.length;

  function resetFilters() {
    setQuery("");
    setStatus("all");
    setUserId("all");
    setVisibleCount(PAGE_SIZE);
    setInteractions((n) => n + 1);
  }

  return (
    <section id="ledger" className="scroll-mt-24 py-16 sm:py-20">
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Badge kind="client" pulse>
          Client Component
        </Badge>
        <p className="font-mono text-xs text-ink-tertiary">
          components/TaskExplorer.js · needs useState + onChange
        </p>
      </div>

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-ink-primary sm:text-3xl">
            Task ledger
          </h2>
          <p className="mt-1 max-w-xl text-sm text-ink-secondary">
            {tasks.length} tasks were read on the server. Everything below
            filters instantly in your browser — no round-trip, no
            server console output.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-hairline-strong bg-panel-1 px-3 py-1.5 font-mono text-[11px] text-ink-tertiary">
          <span className="h-1.5 w-1.5 rounded-full bg-client" />
          Client interactions: <span className="tabular-nums text-client">{interactions}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="mt-6 flex flex-col gap-3 rounded-lg border border-hairline bg-panel-0 p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <label htmlFor="task-search" className="sr-only">
            Search tasks
          </label>
          <div className="relative flex-1">
            <svg
              aria-hidden="true"
              viewBox="0 0 20 20"
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
            >
              <circle cx="9" cy="9" r="6" />
              <path d="M17 17l-4-4" strokeLinecap="round" />
            </svg>
            <input
              id="task-search"
              type="search"
              autoComplete="off"
              spellCheck="false"
              value={query}
              onChange={track((e) => setQuery(e.target.value))}
              placeholder="Search task titles…"
              className="w-full rounded-md border border-hairline-strong bg-panel-1 py-2 pl-9 pr-3 text-sm text-ink-primary placeholder:text-ink-muted focus:border-client focus:outline-none focus:ring-2 focus:ring-client/30"
            />
          </div>

          <label htmlFor="user-filter" className="sr-only">
            Filter by user
          </label>
          <select
            id="user-filter"
            value={userId}
            onChange={track((e) => setUserId(e.target.value))}
            className="rounded-md border border-hairline-strong bg-panel-1 py-2 pl-3 pr-8 text-sm text-ink-primary focus:border-client focus:outline-none focus:ring-2 focus:ring-client/30"
          >
            <option value="all">All users</option>
            {userIds.map((id) => (
              <option key={id} value={id}>
                {initials(id)}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={track(resetFilters)}
            className="shrink-0 rounded-md border border-hairline-strong px-3 py-2 text-sm text-ink-secondary transition-colors hover:bg-panel-1 hover:text-ink-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-client"
          >
            Reset
          </button>
        </div>

        <div
          role="group"
          aria-label="Filter by status"
          className="flex gap-1 rounded-md border border-hairline-strong bg-panel-1 p-1"
        >
          {STATUS_OPTIONS.map((opt) => {
            const active = status === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                aria-pressed={active}
                onClick={track(() => setStatus(opt.value))}
                className={`flex-1 rounded px-3 py-1.5 text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-client ${
                  active
                    ? "bg-client-dim text-client"
                    : "text-ink-secondary hover:text-ink-primary"
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      <p className="mt-4 text-xs text-ink-tertiary" role="status">
        Showing {visible.length} of {filtered.length} matching tasks
        {filtered.length !== tasks.length ? ` (filtered from ${tasks.length})` : ""}.
      </p>

      {/* Results */}
      {visible.length > 0 ? (
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {visible.map((task) => (
            <li
              key={task.id}
              className="flex items-start gap-3 rounded-lg border border-hairline bg-panel-0 p-3 transition-colors hover:border-hairline-strong"
            >
              <span
                className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-hairline-strong bg-panel-1 font-mono text-[10px] font-semibold text-client"
                aria-hidden="true"
              >
                {initials(task.userId)}
              </span>
              <div className="min-w-0 flex-1">
                <p
                  className={`truncate text-sm ${
                    task.completed
                      ? "text-ink-muted line-through"
                      : "text-ink-primary"
                  }`}
                  title={task.title}
                >
                  {task.title}
                </p>
                <p className="mt-1 font-mono text-[10px] uppercase tracking-wide text-ink-tertiary">
                  #{task.id} · {initials(task.userId)} ·{" "}
                  {task.completed ? (
                    <span className="text-server">done</span>
                  ) : (
                    <span className="text-warn">pending</span>
                  )}
                </p>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-4 rounded-lg border border-dashed border-hairline-strong bg-panel-0 p-10 text-center">
          <p className="text-sm text-ink-secondary">
            No tasks match &ldquo;{query}&rdquo;.
          </p>
          <button
            type="button"
            onClick={track(resetFilters)}
            className="mt-3 text-sm text-client underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-client"
          >
            Clear filters
          </button>
        </div>
      )}

      {hasMore ? (
        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={track(() => setVisibleCount((n) => n + PAGE_SIZE))}
            className="rounded-md border border-hairline-strong bg-panel-1 px-4 py-2 text-sm text-ink-primary transition-colors hover:border-client/50 hover:text-client focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-client"
          >
            Show {Math.min(PAGE_SIZE, filtered.length - visible.length)} more
          </button>
        </div>
      ) : null}
    </section>
  );
}
