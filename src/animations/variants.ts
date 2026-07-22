import type { Variants } from 'framer-motion';

// Page-level enter/exit transitions
export const pageVariants: Variants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.25, ease: 'easeOut' } },
  exit: { opacity: 0, y: -4, transition: { duration: 0.15, ease: 'easeIn' } },
};

// Card stagger container
export const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.05,
    },
  },
};

// Child card fade-in
export const cardVariants: Variants = {
  hidden: { opacity: 0, y: 16, scale: 0.98 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

// Slide in from left (sidebar)
export const slideInLeft: Variants = {
  hidden: { x: -20, opacity: 0 },
  show: { x: 0, opacity: 1, transition: { duration: 0.25, ease: 'easeOut' } },
};

// Fade + scale (modal/dropdown)
export const fadeScale: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.18, ease: 'easeOut' } },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.12, ease: 'easeIn' } },
};

// Slide down (dropdown)
export const slideDown: Variants = {
  hidden: { opacity: 0, y: -8, scaleY: 0.95 },
  show: { opacity: 1, y: 0, scaleY: 1, transition: { duration: 0.18, ease: 'easeOut' } },
  exit: { opacity: 0, y: -8, scaleY: 0.95, transition: { duration: 0.12 } },
};

// Simple fade
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

// List item
export const listItemVariants: Variants = {
  hidden: { opacity: 0, x: -10 },
  show: { opacity: 1, x: 0, transition: { duration: 0.2, ease: 'easeOut' } },
};
