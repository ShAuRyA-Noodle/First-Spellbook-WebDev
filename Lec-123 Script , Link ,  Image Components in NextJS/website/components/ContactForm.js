"use client";

import { useState } from "react";

export default function ContactForm() {
  const [sent, setSent] = useState(false);

  if (sent) {
    return (
      <div className="flex flex-col gap-2 border border-clay/30 bg-clay/5 px-6 py-8 text-center">
        <p className="font-serif text-xl text-ink">Thank you — message received.</p>
        <p className="text-sm text-ink-soft">We reply to every enquiry within two working days.</p>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setSent(true);
      }}
      className="flex flex-col gap-5"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 text-sm text-ink-soft">
          Name
          <input
            required
            type="text"
            name="name"
            autoComplete="name"
            className="focus-ring rounded-sm border-b border-ink-ghost bg-transparent py-2 text-ink transition-colors focus:border-clay"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm text-ink-soft">
          Email
          <input
            required
            type="email"
            name="email"
            autoComplete="email"
            spellCheck={false}
            className="focus-ring rounded-sm border-b border-ink-ghost bg-transparent py-2 text-ink transition-colors focus:border-clay"
          />
        </label>
      </div>
      <label className="flex flex-col gap-1.5 text-sm text-ink-soft">
        Project details
        <textarea
          required
          name="message"
          rows={4}
          className="focus-ring resize-none rounded-sm border-b border-ink-ghost bg-transparent py-2 text-ink transition-colors focus:border-clay"
        />
      </label>
      <button
        type="submit"
        className="focus-ring mt-2 w-fit rounded-sm bg-ink px-6 py-3 text-sm text-paper transition-opacity hover:opacity-85"
      >
        Send inquiry
      </button>
    </form>
  );
}
