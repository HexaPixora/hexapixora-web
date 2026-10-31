import Image from "next/image";
import type { CSSProperties } from "react";

// Media-library files: next/image resizes them and serves WebP. The host must
// stay in images.remotePatterns in the site's and the admin's next.config.js.
const LIBRARY = /^https:\/\/[^/]+\.supabase\.co\/storage\//;

/** SVG and GIF stay as uploaded (vector, or animation the optimiser would drop), as do files from other hosts. */
function optimisable(src: string): boolean {
  return LIBRARY.test(src) && !/\.(svg|gif)(?:[?#]|$)/i.test(src);
}

type MediaImageProps = {
  src: string;
  alt: string;
  /** How wide the image shows on screen, so the browser picks a fitting size. */
  sizes: string;
  className?: string;
  style?: CSSProperties;
  /** The page's main image (in the opening block): fetched first, never lazily. */
  preload?: boolean;
} & (
  /** Fills its positioned parent (cover boxes). */
  | { fill: true; width?: never; height?: never }
  /** A fixed box (logos, avatars). */
  | { fill?: never; width: number; height: number }
  /** Natural aspect: the class sets the size (`w-full h-auto`, `h-10 w-auto`). */
  | { fill?: never; width?: never; height?: never }
);

/** A media image served at the size it shows, in a modern format, through next/image. */
export function MediaImage({ src, alt, sizes, className, style, preload, fill, width, height }: MediaImageProps) {
  const box = fill ? { fill: true } : { width: width ?? 0, height: height ?? 0 };
  return (
    <Image
      src={src}
      alt={alt}
      sizes={sizes}
      className={className}
      style={style}
      preload={preload}
      unoptimized={!optimisable(src)}
      {...box}
    />
  );
}
