import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

// Two typefaces, on purpose: Inter for the human-facing (client) side of
// the demo, JetBrains Mono for everything that represents the server's
// point of view (logs, file contents, code references). The pairing is
// the first hint of the client/server split this lecture is about.
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata = {
  title: "Server Actions — Next.js App Router demo",
  description:
    "A form whose action is a real server function: no API route, no fetch, just FormData in and a filesystem write to prove it ran on the server.",
};

export const viewport = {
  themeColor: "#08080c",
  colorScheme: "dark",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="bg-canvas font-sans text-ink-primary antialiased">
        {children}
      </body>
    </html>
  );
}
