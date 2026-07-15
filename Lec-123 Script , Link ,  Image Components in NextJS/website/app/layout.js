import { Fraunces, Work_Sans } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-fraunces",
});
const workSans = Work_Sans({ subsets: ["latin"], variable: "--font-worksans" });

export const metadata = {
  title: "Studio Lumen — Architectural Photography",
  description:
    "Studio Lumen is an architectural photography studio working in available light, shot on location, based on the coast and working worldwide.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${workSans.variable}`}>
      <body className="flex min-h-screen flex-col bg-paper font-sans text-ink antialiased">
        <Navbar />
        <div className="flex-1">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
