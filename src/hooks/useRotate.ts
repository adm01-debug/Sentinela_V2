import { useState, useCallback } from "react";

export function useRotate(initialAngle = 0) {
  const [angle, setAngle] = useState(initialAngle);

  const rotate = useCallback((degrees) => {
    setAngle(a => (a + degrees) % 360);
  }, []);

  const rotateLeft = useCallback(() => rotate(-90), [rotate]);
  const rotateRight = useCallback(() => rotate(90), [rotate]);
  const reset = useCallback(() => setAngle(initialAngle), [initialAngle]);

  return { angle, rotate, rotateLeft, rotateRight, reset };
}
