import fs from "fs/promises";
import path from "path";
import { submitEntry } from "@/actions/form";
import SubmissionConsole from "@/components/submission-console";

const LOG_PATH = path.join(process.cwd(), "harry.txt");
const ENTRY_LINE = /^\[\d{4}-\d{2}-\d{2}T[\d:.]+Z\]/;

async function readLog() {
  try {
    return await fs.readFile(LOG_PATH, "utf8");
  } catch {
    return "";
  }
}

function countEntries(contents) {
  return contents.split("\n").filter((line) => ENTRY_LINE.test(line)).length;
}

// This is a Server Component (no "use client" here), so reading the
// filesystem directly at request time — no "use server", no action call
// needed — is completely ordinary. "use server" is only required when a
// CLIENT component needs to call a function on the server; this file
// never leaves the server in the first place.
export default async function Home() {
  const fileContents = await readLog();
  const submissionCount = countEntries(fileContents);

  const initialState = {
    status: "idle",
    message: "",
    errors: {},
    values: { name: "", address: "" },
    entry: null,
    fileContents,
    submissionCount,
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-10 px-6 py-12 md:py-16">
      <a
        href="#submission-form"
        className="sr-only focus-visible:not-sr-only focus-visible:fixed focus-visible:left-4 focus-visible:top-4 focus-visible:z-50 focus-visible:rounded-lg focus-visible:bg-signal focus-visible:px-4 focus-visible:py-2 focus-visible:text-sm focus-visible:font-medium focus-visible:text-[#04141a] focus-visible:outline-none"
      >
        Skip to Form
      </a>
      <header className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono uppercase tracking-wider text-ink-tertiary">
          <span className="rounded-full border border-line px-2.5 py-1">
            Next.js App Router
          </span>
          <span className="rounded-full border border-line px-2.5 py-1">
            Server Actions
          </span>
          <span className="rounded-full bg-signal-dim px-2.5 py-1 text-signal-strong">
            Zero API Routes
          </span>
        </div>
        <h1 className="max-w-2xl text-balance text-3xl font-semibold tracking-tight text-ink-primary md:text-4xl">
          A form that talks straight to Node.js.
        </h1>
        <p className="max-w-xl text-balance text-sm leading-relaxed text-ink-secondary md:text-base">
          Submit the form on the left. It calls{" "}
          <code className="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-ink-primary">
            submitEntry
          </code>{" "}
          — an async function marked{" "}
          <code className="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-ink-primary">
            &quot;use server&quot;
          </code>{" "}
          — directly. No endpoint URL, no <code className="font-mono">fetch</code>,
          no JSON body. The panel on the right is{" "}
          <code className="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-ink-primary">
            harry.txt
          </code>
          , read live off the server&apos;s disk after every write.
        </p>
      </header>

      <SubmissionConsole action={submitEntry} initialState={initialState} />

      <footer className="flex flex-col gap-3 border-t border-line-subtle pt-6 text-xs text-ink-muted">
        <p className="font-mono">
          source:{" "}
          <span className="text-ink-tertiary">actions/form.js</span> ·{" "}
          <span className="text-ink-tertiary">app/page.js</span> ·{" "}
          <span className="text-ink-tertiary">
            components/submission-console.jsx
          </span>{" "}
          · <span className="text-ink-tertiary">harry.txt</span>
        </p>
        <p>
          Disable JavaScript in DevTools and submit again — the form still
          writes to disk. That&apos;s progressive enhancement: the action is
          bound to a real HTML form, so it degrades to a plain POST.
        </p>
      </footer>
    </main>
  );
}
