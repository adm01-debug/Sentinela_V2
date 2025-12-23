export const cryptoHelpers = {
  uuid: (): string => crypto.randomUUID(),
  randomBytes: (length: number): string => { const arr = new Uint8Array(length); crypto.getRandomValues(arr); return Array.from(arr, b => b.toString(16).padStart(2, '0')).join(''); },
  randomInt: (min: number, max: number): number => { const arr = new Uint32Array(1); crypto.getRandomValues(arr); return min + (arr[0] % (max - min + 1)); },
};
