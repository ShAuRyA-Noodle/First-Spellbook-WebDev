/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // All photography on this site is a local, hand-authored SVG in public/images/
    // (safest option per the lecture: no third-party hostname to whitelist, and it
    // keeps the demo working offline). next/image still runs local files through its
    // optimizer, and SVG is blocked there by default — these two flags opt back in
    // for our own trusted assets.
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",

    // Swapping in real remote photography later needs a whitelist entry, e.g.:
    // remotePatterns: [{ protocol: "https", hostname: "images.unsplash.com" }],
  },
};

export default nextConfig;
