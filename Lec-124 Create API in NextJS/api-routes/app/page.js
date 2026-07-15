"use client";

import { useRef, useState } from "react";

const STATUS_LABEL = {
  idle: "Idle",
  loading: "Sending…",
  success: "Live",
  error: "Error",
};

export default function Home() {
  const [a, setA] = useState("12");
  const [b, setB] = useState("30");
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [entries, setEntries] = useState([]);
  const entryId = useRef(0);

  const pushEntry = (entry) => {
    entryId.current += 1;
    setEntries((prev) => [{ id: entryId.current, ...entry }, ...prev].slice(0, 20));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const numA = Number(a);
    const numB = Number(b);
    const inputIsValid =
      a.trim() !== "" && b.trim() !== "" && Number.isFinite(numA) && Number.isFinite(numB);

    if (!inputIsValid) {
      setStatus("error");
      setErrorMsg("Enter two valid numbers before pressing =.");
      setResult(null);
      return;
    }

    const payload = { a: numA, b: numB };
    const time = new Date().toLocaleTimeString([], { hour12: false });

    setStatus("loading");
    setErrorMsg("");

    try {
      const response = await fetch("/api/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await response.json();

      pushEntry({
        time,
        request: payload,
        response: json,
        statusCode: response.status,
        ok: response.ok && json.success === true,
      });

      if (!response.ok || json.success !== true) {
        setStatus("error");
        setErrorMsg(json.error || `Request failed with status ${response.status}.`);
        setResult(null);
        return;
      }

      setResult(json.result);
      setStatus("success");
    } catch (err) {
      pushEntry({
        time,
        request: payload,
        response: { success: false, error: "Network error — could not reach /api/add." },
        statusCode: 0,
        ok: false,
      });
      setStatus("error");
      setErrorMsg("Network error — is the dev server running?");
      setResult(null);
    }
  };

  const handleClear = () => setEntries([]);

  const digitsState = status === "loading" ? "pending" : status === "error" ? "error" : "idle";
  const digitsText =
    status === "loading" ? "····" : status === "error" ? "ERR" : result !== null ? String(result) : "0";

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-10 sm:py-16">
      <div className="w-full max-w-4xl">
        <header className="mb-8 text-center sm:text-left">
          <p
            className="text-xs font-semibold tracking-[0.18em] uppercase"
            style={{ color: "var(--ink-tertiary)" }}
          >
            Next.js Route Handlers
          </p>
          <h1 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight">
            Adding Machine
          </h1>
          <p className="mt-2 text-sm sm:text-base max-w-lg mx-auto sm:mx-0" style={{ color: "var(--ink-secondary)" }}>
            A client page POSTs two numbers to <code className="font-mono">/api/add</code>; the
            route handler validates, adds, and replies with JSON. Every call prints on the tape.
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] items-start">
          {/* ---------- Calculator device ---------- */}
          <section className="device relative" aria-labelledby="device-heading">
            <h2 id="device-heading" className="sr-only">
              Calculator
            </h2>

            <div className="lcd">
              <div className="lcd-formula">
                {a || "0"} + {b || "0"} =
              </div>
              <div className="lcd-digits" data-state={digitsState} aria-live="polite">
                {digitsText}
              </div>
            </div>

            {status === "error" && errorMsg && (
              <p
                id="add-error"
                role="alert"
                className="mt-2 text-sm font-medium"
                style={{ color: "var(--danger)" }}
              >
                {errorMsg}
              </p>
            )}

            <form onSubmit={handleSubmit} className="mt-5 space-y-3" noValidate>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="input-a"
                    className="block mb-1 text-xs font-semibold tracking-wide uppercase"
                    style={{ color: "var(--ink-tertiary)" }}
                  >
                    A
                  </label>
                  <div className="well">
                    <input
                      id="input-a"
                      type="number"
                      inputMode="decimal"
                      step="any"
                      value={a}
                      onChange={(e) => setA(e.target.value)}
                      placeholder="0"
                      aria-describedby={status === "error" ? "add-error" : undefined}
                    />
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="input-b"
                    className="block mb-1 text-xs font-semibold tracking-wide uppercase"
                    style={{ color: "var(--ink-tertiary)" }}
                  >
                    B
                  </label>
                  <div className="well">
                    <input
                      id="input-b"
                      type="number"
                      inputMode="decimal"
                      step="any"
                      value={b}
                      onChange={(e) => setB(e.target.value)}
                      placeholder="0"
                      aria-describedby={status === "error" ? "add-error" : undefined}
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="key-equals w-full py-3"
                disabled={status === "loading"}
                aria-busy={status === "loading"}
              >
                {status === "loading" ? "Adding…" : "="}
              </button>
            </form>

            <div className="mt-4 flex items-center gap-2 text-xs" style={{ color: "var(--ink-tertiary)" }}>
              <span className="status-dot" data-state={status} aria-hidden="true" />
              <span>{STATUS_LABEL[status]}</span>
              <span className="ml-auto font-mono">POST /api/add</span>
            </div>
          </section>

          {/* ---------- Paper tape log ---------- */}
          <section className="tape-panel flex flex-col" style={{ maxHeight: "26rem" }} aria-labelledby="tape-heading">
            <div
              className="flex items-center justify-between px-5 py-4 border-b"
              style={{ borderColor: "var(--border-soft)" }}
            >
              <h2 id="tape-heading" className="text-sm font-bold tracking-wide uppercase">
                Tape
              </h2>
              <button
                type="button"
                onClick={handleClear}
                disabled={entries.length === 0}
                className="px-2.5 py-1.5 -mr-2.5 text-xs font-semibold uppercase tracking-wide disabled:opacity-40"
                style={{ color: "var(--ink-tertiary)" }}
                aria-label="Clear tape log"
              >
                Clear
              </button>
            </div>

            <div className="tape-scroll flex-1 overflow-y-auto p-3 space-y-2">
              {entries.length === 0 ? (
                <p className="px-2 py-6 text-sm text-center" style={{ color: "var(--ink-muted)" }}>
                  No requests yet — press = to print the first line.
                </p>
              ) : (
                entries.map((entry) => (
                  <article key={entry.id} className="tape-entry px-3 py-2.5 text-xs">
                    <div className="flex items-center justify-between gap-2">
                      <span style={{ color: "var(--ink-tertiary)" }}>{entry.time}</span>
                      <span className="status-pill" data-ok={String(entry.ok)}>
                        {entry.statusCode || "ERR"}
                      </span>
                    </div>
                    <div className="mt-1" style={{ color: "var(--ink-primary)" }}>
                      → {JSON.stringify(entry.request)}
                    </div>
                    <div
                      className="mt-0.5"
                      style={{ color: entry.ok ? "var(--success)" : "var(--danger)" }}
                    >
                      ← {JSON.stringify(entry.response)}
                    </div>
                  </article>
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
