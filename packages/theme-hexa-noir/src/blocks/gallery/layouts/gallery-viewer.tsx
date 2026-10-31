"use client";

import { useState } from "react";
import { MediaImage } from "../../../components/media-image";

type Item = { src: string; alt: string; title: string; description: string };

/**
 * The interactive part of the synced gallery: the main image follows the
 * selected thumbnail. Thumbnails are real buttons, so it works with a
 * keyboard; the first image is shown without JavaScript.
 */
export function GalleryViewer({ items }: { items: Item[] }) {
  const [active, setActive] = useState(0);
  const current = items[active] ?? items[0]!;

  return (
    <div>
      <figure className="relative aspect-[16/9] overflow-hidden border border-line bg-page-raised">
        <MediaImage
          key={current.src}
          src={current.src}
          alt={current.alt}
          fill
          sizes="(min-width: 1440px) 1360px, 100vw"
          className="object-cover"
        />
        {current.title || current.description ? (
          <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-page/90 to-transparent p-6 pt-16">
            {current.title ? <span className="wide block text-title font-medium">{current.title}</span> : null}
            {current.description ? <span className="mt-1 block text-copy-dim">{current.description}</span> : null}
          </figcaption>
        ) : null}
      </figure>
      <ul className="mt-4 flex gap-3 overflow-x-auto pb-1">
        {items.map((item, i) => (
          <li key={i} className="shrink-0">
            <button
              type="button"
              onClick={() => setActive(i)}
              aria-pressed={i === active}
              aria-label={item.title || `Image ${i + 1}`}
              className={`block h-20 w-28 overflow-hidden border-2 transition-colors ${
                i === active ? "border-signal" : "border-transparent opacity-60 hover:opacity-100"
              }`}
            >
              <MediaImage
                src={item.src}
                alt=""
                fill
                sizes="112px"
                className="object-cover"
              />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
