import { describe, it, expect } from "vitest";
import { chunk } from "../chunk";
describe("chunk", () => {
  it("chunks array correctly", () => { expect(chunk([1,2,3,4,5], 2)).toEqual([[1,2],[3,4],[5]]); });
  it("handles empty array", () => { expect(chunk([], 2)).toEqual([]); });
});
