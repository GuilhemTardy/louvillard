"use client";

import Link from "next/link";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useEffect, useRef, useState } from "react";
import type { SiteImage } from "@/content/images";
import { Photo } from "./photo";
import { EASE, Line } from "./reveal";

type Props = {
  name: string;
  kicker: string;
  disciplines: readonly string[];
  slides: SiteImage[];
};

export function Hero({ name, kicker, disciplines, slides }: Props) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", reduce ? "0%" : "22%"]);
  const titleY = useTransform(scrollYProgress, [0, 1], ["0%", reduce ? "0%" : "-35%"]);
  const fade = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const [index, setIndex] = useState(0);
  const [first, ...rest] = name.split(" ");

  useEffect(() => {
    if (slides.length < 2 || reduce) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % slides.length), 6500);
    return () => clearInterval(t);
  }, [slides.length, reduce]);

  return (
    <section ref={ref} className="relative h-[100svh] min-h-[620px] overflow-hidden bg-black text-white">
      <motion.div style={{ y }} className="absolute inset-x-0 -top-[6%] h-[112%]">
        <motion.div
          className="h-full"
          initial={{ scale: reduce ? 1 : 1.18, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 2.6, ease: EASE }}
        >
          {slides.map((slide, i) => (
            <div
              key={slide.id ?? slide.src}
              className="absolute inset-0 transition-opacity duration-[1800ms] ease-out"
              style={{ opacity: i === index ? 1 : 0 }}
              aria-hidden={i !== index}
            >
              <Photo image={slide} className="h-full w-full" priority={i === 0} />
            </div>
          ))}
        </motion.div>
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/5 to-black/70" />

      <motion.div style={{ y: titleY, opacity: fade }} className="absolute inset-x-0 bottom-0 px-5 pb-24 md:px-10 md:pb-28">
        <motion.p
          className="mono text-white/80"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 1 }}
        >
          {kicker}
        </motion.p>
        <h1 className="display mt-5 text-[clamp(4.6rem,19vw,19rem)]">
          <Line delay={0.25}>{first}</Line>
          <Line delay={0.4}>{rest.join(" ")}</Line>
        </h1>
      </motion.div>

      <motion.div
        className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-6 px-5 pb-7 md:px-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.3, duration: 1 }}
      >
        <ul className="mono hidden gap-6 text-white/75 sm:flex">
          {disciplines.map((d, i) => (
            <li key={d}>
              <span className="text-white/45">{String(i + 1).padStart(2, "0")}</span> {d}
            </li>
          ))}
        </ul>
        <Link href="/acces" className="group mono flex items-center gap-3 text-white">
          <span className="link-u pb-0.5">Retrouver mes photos</span>
          <span className="grid h-10 w-10 place-items-center rounded-full border border-white/40 transition-colors group-hover:bg-white group-hover:text-black">
            →
          </span>
        </Link>
      </motion.div>
    </section>
  );
}
