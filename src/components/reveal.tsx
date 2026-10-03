"use client";

import { motion, useReducedMotion } from "motion/react";

export const EASE = [0.16, 1, 0.3, 1] as const;

/** Ligne de titre qui monte depuis un masque (au chargement, ou à l'entrée dans l'écran). */
export function Line({ children, delay = 0, inView = false }: { children: React.ReactNode; delay?: number; inView?: boolean }) {
  const reduce = useReducedMotion();
  const variants = { hidden: { y: reduce ? 0 : "105%" }, show: { y: 0, transition: { delay, duration: 1.2, ease: EASE } } };
  // Le déclencheur est le masque (toujours visible), pas le texte qu'il cache.
  return (
    <motion.span
      className="block overflow-hidden pb-[0.04em]"
      initial="hidden"
      {...(inView ? { whileInView: "show", viewport: { once: true, margin: "-8%" } } : { animate: "show" })}
    >
      <motion.span className="block" variants={variants}>
        {children}
      </motion.span>
    </motion.span>
  );
}

/** Bloc qui apparaît en glissant au défilement. */
export function FadeUp({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-8%" }}
      transition={{ delay, duration: 0.9, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

/** Image révélée par un rideau (déclenché par le conteneur, toujours visible). */
export function ClipReveal({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const variants = {
    hidden: { clipPath: "inset(100% 0 0 0)" },
    show: { clipPath: "inset(0% 0 0 0)", transition: { duration: 1.3, ease: [0.76, 0, 0.24, 1] as const } },
  };
  return (
    <motion.div className={className} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-10%" }}>
      <motion.div variants={variants}>{children}</motion.div>
    </motion.div>
  );
}
