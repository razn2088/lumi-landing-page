import { describe, it, expect } from "vitest";
import { parseGeneratedContent, sanitizeDashes } from "../../src/pipeline/parseGenerated.js";

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

  it("strips em-dashes and en-dashes from the script and caption", () => {
    const dashed = {
      script: {
        hook: "The 5 best vacuums right now —",
        beats: [{ kind: "broll", voiceover: "Powerful — and quiet", brollKeywords: ["vacuum"] }],
        cta: "Tap the link – in bio",
      },
      caption: "Best cordless vacuums on Amazon right now —",
      hashtags: ["deals"],
    };
    const g = parseGeneratedContent(JSON.stringify(dashed));
    expect(g.caption).not.toMatch(/[—–]/);
    expect(g.script.hook).not.toMatch(/[—–]/);
    expect(g.script.beats[0]!.voiceover).not.toMatch(/[—–]/);
    expect(g.script.cta).toBe("Tap the link - in bio");
  });
});

describe("sanitizeDashes", () => {
  it("replaces an em-dash with a spaced hyphen", () => {
    expect(sanitizeDashes("a—b")).toBe("a - b");
  });

  it("replaces an en-dash with a spaced hyphen", () => {
    expect(sanitizeDashes("a–b")).toBe("a - b");
  });

  it("collapses the doubled spaces left around an already-spaced dash", () => {
    expect(sanitizeDashes("right now — best deals")).toBe("right now - best deals");
  });

  it("replaces a trailing em-dash like the live caption", () => {
    expect(sanitizeDashes("The 5 best cordless vacuums on Amazon right now —")).toBe(
      "The 5 best cordless vacuums on Amazon right now - ",
    );
  });

  it("handles multiple dashes in one string", () => {
    expect(sanitizeDashes("a—b–c")).toBe("a - b - c");
  });

  it("leaves regular hyphens and dash-free text untouched", () => {
    expect(sanitizeDashes("link-in-bio, 25-40 seconds")).toBe("link-in-bio, 25-40 seconds");
  });
});
