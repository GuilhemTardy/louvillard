"use client";

import { useState } from "react";

/** <img> qui se masque proprement si le fichier ne charge pas (fond neutre à la place). */
export function SafeImg(props: React.ImgHTMLAttributes<HTMLImageElement>) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  if (failed) return <span className={`block bg-gradient-to-br from-[#e9eaec] to-[#d9dbde] ${props.className ?? ""}`} aria-hidden="true" />;
  return (
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    <img
      {...props}
      onLoad={(e) => {
        setLoaded(true);
        props.onLoad?.(e);
      }}
      onError={() => setFailed(true)}
      className={`${props.className ?? ""} transition-opacity duration-700 ${loaded ? "opacity-100" : "opacity-0"}`}
    />
  );
}
