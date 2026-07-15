"use client";

import { useRef } from "react";
import Image from "next/image";
import { logEvent } from "@/lib/logBus";

/**
 * Wraps next/image with an onLoad handler that timestamps the load and pushes
 * it into the shared console — the "visible effect" that proves priority images
 * resolve immediately while lazy ones wait until they scroll near the viewport.
 */
export default function ImageTile({ src, alt, label, priority = false, className = "" }) {
  const loggedRef = useRef(false);

  return (
    <div className={`relative overflow-hidden rounded-lg border border-lab-border bg-lab-raised ${className}`}>
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        loading={priority ? undefined : "lazy"}
        sizes="(min-width: 1024px) 33vw, 50vw"
        className="object-cover"
        onLoad={() => {
          if (loggedRef.current) return;
          loggedRef.current = true;
          logEvent(
            "image",
            `${label} loaded (${priority ? "priority — eager" : "default — lazy"}) at ${Math.round(
              performance.now()
            )}ms`
          );
        }}
      />
      <span className="absolute left-2 top-2 rounded border border-lab-border bg-lab-bg/80 px-1.5 py-0.5 font-mono text-[10px] text-lab-ink-soft backdrop-blur">
        {priority ? "priority" : "lazy"}
      </span>
    </div>
  );
}
