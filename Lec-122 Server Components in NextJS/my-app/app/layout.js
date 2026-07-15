import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata = {
  title: "Server vs Client Components · RSC Lab",
  description:
    "A hands-on Next.js App Router demo that makes the server/client component boundary observable — watch the terminal, watch the browser, see the difference.",
};

// Root layout — a Server Component (no "use client" here, or anywhere
// up the tree by default). It composes Navbar and Footer, both also
// Server Components, around whatever page is currently rendering.
export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${mono.variable}`}>
      <body className="flex min-h-screen flex-col bg-canvas font-sans text-ink-primary antialiased">
        <a
          href="#overview"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-panel-1 focus:px-4 focus:py-2 focus:text-sm focus:text-ink-primary"
        >
          Skip to content
        </a>
        <Navbar />
        <main className="flex-1 bg-grid">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
