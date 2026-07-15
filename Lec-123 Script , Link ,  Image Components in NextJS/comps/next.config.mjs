/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // This lab renders its diagrams as local SVGs (public/images/*.svg) imported
    // with next/image's static-import form, e.g. `import hero from "@/public/images/hero.svg"`.
    // next/image runs every image — including local ones — through its optimizer,
    // and the optimizer refuses SVG by default (it can carry embedded scripts).
    // These two flags opt back in safely for our own trusted, hand-authored assets.
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",

    // If you swap any of these local SVGs for a REMOTE photo later, next/image will
    // refuse to load it until the hostname is whitelisted here, e.g.:
    // remotePatterns: [{ protocol: "https", hostname: "images.unsplash.com" }],
  },
};

export default nextConfig;
