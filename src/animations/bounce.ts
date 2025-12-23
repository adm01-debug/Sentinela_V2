export const bounce = {
  animate: { y: [0, -10, 0] },
  transition: { duration: 0.6, repeat: Infinity },
};

export const bounceIn = {
  initial: { scale: 0 },
  animate: { scale: [0, 1.2, 0.9, 1] },
  transition: { duration: 0.5 },
};

export const shake = {
  animate: { x: [0, -10, 10, -10, 10, 0] },
  transition: { duration: 0.5 },
};
