"use client";

import { useState } from "react";

const initialForm = { name: "", email: "", message: "" };

export default function ContactPage() {
  const [form, setForm] = useState(initialForm);
  const [submitted, setSubmitted] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    // No backend wired up yet — this just proves the form is a real
    // client component with state. Swap this for a fetch() to a
    // route handler (e.g. app/api/contact/route.js) later.
    setSubmitted(true);
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-16 sm:py-20">
      <p className="font-mono text-sm text-accent">{"// contact"}</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
        Let&rsquo;s talk
      </h1>
      <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink-soft">
        Questions about this build, the App Router, or Tailwind setup —
        the form below is a real client component using useState.
      </p>

      <div className="mt-12 grid gap-10 lg:grid-cols-[0.8fr,1.2fr]">
        <div>
          <div className="rounded-2xl border border-line/10 p-6">
            <p className="font-mono text-xs text-ink-faint">
              response time
            </p>
            <p className="mt-2 text-2xl font-semibold text-ink">
              ~1 business day
            </p>
          </div>

          <dl className="mt-6 space-y-4 text-sm">
            <div className="flex justify-between border-b border-line/10 pb-3">
              <dt className="text-ink-faint">Email</dt>
              <dd className="font-mono text-ink">shauryapunj404@gmail.com</dd>
            </div>
            <div className="flex justify-between border-b border-line/10 pb-3">
              <dt className="text-ink-faint">Topic</dt>
              <dd className="text-ink">Next.js / App Router</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-faint">Status</dt>
              <dd className="text-ink">Open to questions</dd>
            </div>
          </dl>
        </div>

        <div
          className="rounded-2xl border border-line/10 bg-paper-dim p-6 shadow-card sm:p-8"
          aria-live="polite"
        >
          {submitted ? (
            <div className="flex flex-col items-start gap-3 py-8">
              <span className="font-mono text-sm text-accent">
                {"// message received"}
              </span>
              <h2 className="text-xl font-semibold text-ink">
                Thanks, {form.name.split(" ")[0] || "friend"} — got it.
              </h2>
              <p className="text-ink-soft">
                This is a demo form with no backend yet, but your message
                stayed right here in component state.
              </p>
              <button
                type="button"
                onClick={() => {
                  setForm(initialForm);
                  setSubmitted(false);
                }}
                className="mt-2 rounded-full border border-line/20 px-4 py-2 text-sm font-medium text-ink transition-colors hover:border-line/40"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="name"
                  className="font-mono text-xs text-ink-faint"
                >
                  name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Ada Lovelace"
                  className="mt-2 w-full rounded-xl border border-line/15 bg-paper px-4 py-3 text-ink placeholder:text-ink-faint focus:border-accent"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="font-mono text-xs text-ink-faint"
                >
                  email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  spellCheck={false}
                  required
                  value={form.email}
                  onChange={handleChange}
                  placeholder="ada@example.com"
                  className="mt-2 w-full rounded-xl border border-line/15 bg-paper px-4 py-3 text-ink placeholder:text-ink-faint focus:border-accent"
                />
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="font-mono text-xs text-ink-faint"
                >
                  message
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={5}
                  value={form.message}
                  onChange={handleChange}
                  placeholder="What are you building?"
                  className="mt-2 w-full resize-none rounded-xl border border-line/15 bg-paper px-4 py-3 text-ink placeholder:text-ink-faint focus:border-accent"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-full bg-ink px-5 py-3 text-sm font-medium text-paper transition-opacity hover:opacity-90 sm:w-auto"
              >
                Send message
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
