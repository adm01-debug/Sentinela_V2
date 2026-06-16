// Render Performance Benchmark
export function measureRender() {
  const start = performance.now();
  requestAnimationFrame(() => console.log("Render:", performance.now() - start));
}
