import { Inter, JetBrains_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import Navbar from "@/components/Navbar";
import ConsoleDock from "@/components/ConsoleDock";
import RouteWatcher from "@/components/RouteWatcher";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const jbMono = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-jbmono" });

export const metadata = {
  title: "next.lab — Link, Image & Script components",
  description:
    "A hands-on playground for next/link, next/image and next/script, with a live console that logs every optimization in real time.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${jbMono.variable}`}>
      <body className="min-h-screen bg-lab-bg font-sans text-lab-ink antialiased">
        {/*
          strategy="beforeInteractive" — the ONLY strategy next/script allows outside
          the root layout is disallowed; this ONE is required to live here. It runs
          before any Next.js JS executes and before the page hydrates, so this is the
          earliest possible timestamp we can capture. We stash it on window instead of
          alert()ing, so it shows up as the first line in the console dock below and as
          the first point on the /script-lab timeline.
        */}
        <Script id="nextlab-before-interactive" strategy="beforeInteractive">
          {`
            window.__NEXTLAB_TIMINGS__ = window.__NEXTLAB_TIMINGS__ || {};
            window.__NEXTLAB_TIMINGS__.beforeInteractive = performance.now();
            window.__NEXTLAB_BUFFER__ = window.__NEXTLAB_BUFFER__ || [];
            var msg = "beforeInteractive fired at " + Math.round(performance.now()) + "ms — before hydration";
            window.__NEXTLAB_BUFFER__.push({ category: "script", message: msg, t: performance.now() });
            window.dispatchEvent(new CustomEvent("nextlab:log", { detail: { category: "script", message: msg, t: performance.now() } }));
            window.dispatchEvent(new CustomEvent("nextlab:timing"));
          `}
        </Script>

        <RouteWatcher />
        <Navbar />

        <main className="mx-auto min-h-[calc(100vh-8.5rem)] max-w-6xl px-6 pb-24 pt-10">
          {children}
        </main>

        <ConsoleDock />
      </body>
    </html>
  );
}
