import { describe, it, expect } from "vitest";
import { pick } from "../pick";
describe("pick", () => {
  it("picks specified keys", () => { expect(pick({a:1,b:2,c:3}, ['a','c'])).toEqual({a:1,c:3}); });
});
