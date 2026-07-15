"use client";

import { useActionState, useEffect, useId, useRef } from "react";
import { useFormStatus } from "react-dom";

/**
 * Reads pending status from the nearest ancestor <form>. This is the
 * textbook reason useFormStatus exists: SubmitButton has no direct access
 * to SubmissionConsole's useActionState result, yet it still needs to
 * know "is my form mid-submit right now?"
 */
function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="group inline-flex w-full touch-manipulation items-center justify-center gap-2 rounded-lg bg-signal px-4 py-2.5 text-sm font-medium text-[#04141a] transition-colors duration-150 ease-out hover:bg-signal-strong disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
    >
      {pending ? (
        <>
          <span
            aria-hidden="true"
            className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#04141a]/30 border-t-[#04141a]"
          />
          Sending to Server…
        </>
      ) : (
        <>
          Send to Server
          <span
            aria-hidden="true"
            className="transition-transform duration-150 ease-out group-hover:translate-x-0.5"
          >
            →
          </span>
        </>
      )}
    </button>
  );
}

function Field({ id, name, label, placeholder, autoComplete, error, errorId, inputRef }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={id}
        className="text-xs font-medium uppercase tracking-wide text-ink-tertiary"
      >
        {label}
      </label>
      <input
        ref={inputRef}
        id={id}
        name={name}
        type="text"
        autoComplete={autoComplete}
        placeholder={placeholder}
        defaultValue=""
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        className={`rounded-lg border bg-surface-inset px-3.5 py-2.5 text-sm text-ink-primary transition-colors duration-150 placeholder:text-ink-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-signal ${
          error ? "border-fault" : "border-line focus-visible:border-transparent"
        }`}
      />
      {error ? (
        <p id={errorId} role="alert" className="text-xs text-fault">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export default function SubmissionConsole({ action, initialState }) {
  const [state, formAction, isPending] = useActionState(action, initialState);
  const formRef = useRef(null);
  const nameInputRef = useRef(null);
  const addressInputRef = useRef(null);
  const nameErrorId = useId();
  const addressErrorId = useId();

  // Clear the inputs once the server confirms a successful write — never
  // reset optimistically, and never *before* the action resolves.
  useEffect(() => {
    if (state.status === "success") {
      formRef.current?.reset();
    }
  }, [state.status, state.entry]);

  // Move focus to the first invalid field once the server reports an
  // error, so keyboard and screen-reader users land exactly where the fix
  // is needed instead of having to hunt for it.
  useEffect(() => {
    if (state.status === "error") {
      if (state.errors?.name) nameInputRef.current?.focus();
      else if (state.errors?.address) addressInputRef.current?.focus();
    }
  }, [state]);

  const lines = state.fileContents.split("\n").filter(Boolean);

  return (
    <form
      id="submission-form"
      ref={formRef}
      action={formAction}
      aria-busy={isPending}
      noValidate
      className="grid gap-5 md:grid-cols-[minmax(0,1fr)_44px_minmax(0,1fr)] md:items-start"
    >
      {/* CLIENT — the human-facing half */}
      <section className="rounded-2xl border border-line bg-surface-1 p-6 shadow-[0_1px_0_0_rgba(255,255,255,0.03)_inset]">
        <div className="mb-5 flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-ink-primary">Client</h2>
          <span className="rounded-full bg-surface-2 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-ink-tertiary">
            browser
          </span>
        </div>

        <div className="flex flex-col gap-4">
          <Field
            id="name"
            name="name"
            label="Name"
            placeholder="e.g. Harry…"
            autoComplete="name"
            error={state.errors?.name}
            errorId={nameErrorId}
            inputRef={nameInputRef}
          />
          <Field
            id="address"
            name="address"
            label="Address"
            placeholder="e.g. 221B Baker Street…"
            autoComplete="street-address"
            error={state.errors?.address}
            errorId={addressErrorId}
            inputRef={addressInputRef}
          />

          <SubmitButton />

          <p
            role="status"
            aria-live="polite"
            className={`min-h-[2.25rem] text-xs leading-relaxed ${
              state.status === "success"
                ? "text-proof"
                : state.status === "error"
                  ? "text-fault"
                  : "text-ink-muted"
            }`}
          >
            {state.message ||
              "FormData is built from these two fields, keyed by their name attribute — not id."}
          </p>
        </div>
      </section>

      {/* WIRE — the signature element: the only motion in the whole demo,
          and it only ever means "request in flight right now." */}
      <div
        aria-hidden="true"
        className="relative hidden md:flex md:h-full md:min-h-[18rem] md:flex-col md:items-center md:justify-center"
      >
        <div className="h-full w-px bg-line" />
        {isPending && (
          <svg
            className="absolute inset-0 h-full w-full"
            viewBox="0 0 4 100"
            preserveAspectRatio="none"
          >
            <line
              x1="2"
              y1="0"
              x2="2"
              y2="100"
              stroke="var(--accent)"
              strokeWidth="2"
              strokeDasharray="6 6"
              strokeLinecap="round"
              className="wire-pulse"
            />
          </svg>
        )}
        <span
          className="absolute top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full border"
          style={{
            background: isPending ? "var(--pending)" : "var(--surface-2)",
            borderColor: "var(--border-strong)",
          }}
        />
      </div>

      {/* mobile: compact inline status instead of the vertical wire */}
      <div className="flex justify-center md:hidden" aria-hidden="true">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider ${
            isPending
              ? "border-transparent bg-transit-dim text-transit"
              : "border-line-subtle text-ink-muted"
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${isPending ? "bg-transit" : "bg-ink-muted"}`}
          />
          {isPending ? "On the Wire…" : "Idle"}
        </span>
      </div>

      {/* SERVER — the machine-facing half, proof the write happened */}
      <section className="rounded-2xl border border-line bg-surface-1 p-6">
        <div className="mb-5 flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-ink-primary">Server</h2>
          <span
            className={`rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider ${
              isPending ? "bg-transit-dim text-transit" : "bg-surface-2 text-ink-tertiary"
            }`}
          >
            {isPending ? "writing…" : "fs.appendFile"}
          </span>
        </div>

        <div className="console-scroll max-h-64 overflow-y-auto rounded-lg border border-line-subtle bg-surface-inset p-3.5 font-mono text-[11px] leading-relaxed">
          <p className="mb-2 select-none text-ink-muted">
            # harry.txt — appended by actions/form.js
          </p>
          {lines.length === 0 ? (
            <p className="text-ink-muted">
              (empty — submit the form to write the first line)
            </p>
          ) : (
            lines.map((line, i) => {
              const isNewest =
                state.status === "success" &&
                state.entry &&
                i === lines.length - 1;
              return (
                <p
                  key={i}
                  className={`whitespace-pre-wrap break-all ${
                    line.startsWith("#") ? "text-ink-muted" : "text-proof"
                  } ${isNewest ? "rise-in" : ""}`}
                >
                  {line}
                </p>
              );
            })
          )}
          <span aria-hidden="true" className="blink-cursor text-proof">
            ▊
          </span>
        </div>

        <dl className="mt-4 flex items-center justify-between text-[11px] text-ink-tertiary">
          <div className="flex items-center gap-1.5">
            <dt className="uppercase tracking-wide text-ink-muted">Entries logged</dt>
            <dd className="font-mono tabular-nums text-ink-secondary">
              {state.submissionCount}
            </dd>
          </div>
          <div className="flex items-center gap-1.5">
            <dt className="uppercase tracking-wide text-ink-muted">Path</dt>
            <dd className="font-mono text-ink-secondary">./harry.txt</dd>
          </div>
        </dl>
      </section>
    </form>
  );
}
