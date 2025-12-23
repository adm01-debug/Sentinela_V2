export const scaleIn = {
  initial: { scale: 0, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  exit: { scale: 0, opacity: 0 },
  transition: { type: 'spring', stiffness: 500, damping: 30 },
};

export const scaleUp = {
  initial: { scale: 0.8, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  exit: { scale: 0.8, opacity: 0 },
  transition: { duration: 0.2 },
};

export const pulse = {
  animate: { scale: [1, 1.05, 1] },
  transition: { duration: 0.5, repeat: Infinity },
};
