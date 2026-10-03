"use client";

import { useState } from "react";
import { srcOf, srcSetOf, type SiteImage } from "@/content/images";

type Props = {
  image: SiteImage;
  className?: string;
  imgClassName?: string;
  priority?: boolean;
  sizes?: string;
  w?: number;
};

/** Photo plein cadre avec apparition en fondu et repli si l'image ne charge pas. */
export function Photo({ image, className = "", imgClassName = "", priority = false, sizes = "100vw", w = 2000 }: Props) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const src = srcOf(image, Math.min(w, 2000));
  const srcSet = srcSetOf(image);

  return (
    <div className={`relative overflow-hidden bg-[#16191c] ${className}`}>
      {failed || !src ? (
        <div className="absolute inset-0 bg-gradient-to-br from-[#1c2126] to-[#0e1113]" />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          srcSet={srcSet}
          sizes={srcSet ? sizes : undefined}
          alt={image.alt}
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : "auto"}
          decoding="async"
          draggable={false}
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          className={`h-full w-full object-cover transition-opacity duration-1000 ease-out ${loaded ? "opacity-100" : "opacity-0"} ${imgClassName}`}
        />
      )}
    </div>
  );
}
