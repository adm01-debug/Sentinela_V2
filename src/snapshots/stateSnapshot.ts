export class StateSnapshot<T> {
  private history: { state: T; timestamp: Date }[] = [];
  private maxHistory = 100;
  capture(state: T): void { this.history.push({ state: JSON.parse(JSON.stringify(state)), timestamp: new Date() }); if (this.history.length > this.maxHistory) this.history.shift(); }
  getLatest(): T | null { return this.history[this.history.length - 1]?.state || null; }
  getAt(index: number): T | null { return this.history[index]?.state || null; }
  getHistory(): { state: T; timestamp: Date }[] { return [...this.history]; }
  clear(): void { this.history = []; }
  setMaxHistory(max: number): void { this.maxHistory = max; }
}
export const createStateSnapshot = <T>() => new StateSnapshot<T>();
