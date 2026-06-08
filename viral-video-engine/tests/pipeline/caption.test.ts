import { describe, it, expect } from "vitest";
import { composeCaption } from "../../src/pipeline/caption.js";

describe("composeCaption", () => {
  it("appends hashtags on a new line, deduping and prefixing #", () => {
    expect(composeCaption("Best earbuds!", ["earbuds", "#amazonfinds", "earbuds"])).toBe("Best earbuds!\n\n#earbuds #amazonfinds");
  });
  it("returns just the caption when there are no hashtags", () => {
    expect(composeCaption("Hello", [])).toBe("Hello");
  });
  it("trims and ignores empty tags", () => {
    expect(composeCaption("  Hi  ", [" deals ", ""])).toBe("Hi\n\n#deals");
  });
});
