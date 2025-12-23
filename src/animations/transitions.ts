export const easeInOut = { duration: 0.3, ease: 'easeInOut' };
export const spring = { type: 'spring', stiffness: 300, damping: 30 };
export const smooth = { duration: 0.5, ease: [0.43, 0.13, 0.23, 0.96] };
export const snappy = { type: 'spring', stiffness: 500, damping: 25 };

export const pageTransition = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 },
  transition: { duration: 0.3 },
};

export const modalTransition = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
  transition: { duration: 0.2 },
};
