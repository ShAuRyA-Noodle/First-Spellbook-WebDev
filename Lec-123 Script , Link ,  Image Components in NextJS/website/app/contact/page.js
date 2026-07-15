import Script from "next/script";
import ContactForm from "@/components/ContactForm";

export const metadata = {
  title: "Contact — Studio Lumen",
  description: "Get in touch with Studio Lumen about an architectural photography commission.",
};

export default function ContactPage() {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-16 px-6 py-20">
      <div className="flex flex-col gap-3 text-center">
        <span className="eyebrow text-clay">Get in touch</span>
        <h1 className="text-balance font-serif text-4xl leading-tight text-ink">
          Tell us about the space.
        </h1>
        <p className="mx-auto max-w-md text-balance text-sm leading-relaxed text-ink-soft">
          Studio, residence, or public building — send a few lines and we&apos;ll follow up
          with availability.
        </p>
      </div>

      <div className="grid gap-12 sm:grid-cols-[1fr,1.2fr]">
        <div className="flex flex-col gap-8">
          <div>
            <h2 className="mb-2 text-sm font-medium text-ink">Studio</h2>
            <p className="text-sm leading-relaxed text-ink-soft">
              hello@studiolumen.example
              <br />
              +1 (555) 013-0142
              <br />
              Open by appointment, worldwide travel
            </p>
          </div>

          <div>
            <h2 className="mb-2 text-sm font-medium text-ink">Availability</h2>
            {/*
              strategy="afterInteractive" (the default — no strategy prop needed, but
              named for clarity) — an inline script with an id, since Next.js needs one
              to track and dedupe inline script children.
            */}
            <p
              id="availability-status"
              className="inline-flex w-fit items-center gap-2 bg-ink-ghost px-3 py-1.5 text-xs text-ink-faint"
            >
              Checking live availability…
            </p>
          </div>

          <div>
            <h2 className="mb-2 text-sm font-medium text-ink">Booking assistant</h2>
            {/*
              strategy="lazyOnload" — external file (public/scripts/booking-widget.js),
              loaded during idle time since a booking widget is the lowest-priority
              thing on this page.
            */}
            <p
              id="booking-widget-status"
              className="inline-flex w-fit items-center gap-2 bg-ink-ghost px-3 py-1.5 text-xs text-ink-faint"
            >
              Loading booking assistant…
            </p>
          </div>
        </div>

        <ContactForm />
      </div>

      <Script id="lumen-availability" strategy="afterInteractive">
        {`
          var el = document.getElementById("availability-status");
          if (el) {
            el.textContent = "Open for enquiries — checked just now";
            el.classList.add("pill-ready");
          }
        `}
      </Script>

      <Script id="lumen-booking-widget" src="/scripts/booking-widget.js" strategy="lazyOnload" />
    </div>
  );
}
