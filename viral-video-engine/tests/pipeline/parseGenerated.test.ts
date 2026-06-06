import { describe, it, expect } from "vitest";
import { parseGeneratedContent } from "../../src/pipeline/parseGenerated.js";

const valid = {
  script: { hook: "h", beats: [{ kind: "broll", voiceover: "v", brollKeywords: ["k"] }], cta: "c" },
  caption: "cap",
  hashtags: ["deals", "amazon"],
};

describe("parseGeneratedContent", () => {
  it("parses raw JSON", () => {
    const g = parseGeneratedContent(JSON.stringify(valid));
    expect(g.caption).toBe("cap");
    expect(g.script.beats).toHaveLength(1);
  });

  it("parses JSON wrapped in ```json fences", () => {
    const g = parseGeneratedContent("```json\n" + JSON.stringify(valid) + "\n```");
    expect(g.script.hook).toBe("h");
  });

  it("parses JSON surrounded by prose", () => {
    const g = parseGeneratedContent("Sure! Here you go:\n" + JSON.stringify(valid) + "\nHope that helps.");
    expect(g.hashtags).toEqual(["deals", "amazon"]);
  });

  it("throws when there is no JSON object", () => {
    expect(() => parseGeneratedContent("no json here")).toThrow(/no json/i);
  });

  it("throws when JSON does not match the schema", () => {
    expect(() => parseGeneratedContent(JSON.stringify({ caption: "x" }))).toThrow();
  });
});
