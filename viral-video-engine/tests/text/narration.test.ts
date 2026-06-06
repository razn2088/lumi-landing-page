import { describe, it, expect } from "vitest";
import { tokenizeWords, escapeXml, buildNarration, buildMarkedSsml } from "../../src/text/narration.js";
import type { Script } from "../../src/types/domain.js";

describe("narration utils", () => {
  it("tokenizes on whitespace and drops empties", () => {
    expect(tokenizeWords("  hello   world ")).toEqual(["hello", "world"]);
  });

  it("escapes xml special chars", () => {
    expect(escapeXml(`a & b < c > "d" 'e'`)).toBe("a &amp; b &lt; c &gt; &quot;d&quot; &apos;e&apos;");
  });

  it("builds narration in hook->beats->cta order", () => {
    const script: Script = {
      hook: "Hook here",
      beats: [{ kind: "broll", voiceover: "Beat one", brollKeywords: [] }, { kind: "product_image", voiceover: "Beat two", brollKeywords: [] }],
      cta: "Go now",
    };
    expect(buildNarration(script)).toBe("Hook here Beat one Beat two Go now");
  });

  it("builds marked SSML with one mark per word and returns the words", () => {
    const { ssml, words } = buildMarkedSsml("Buy these now");
    expect(words).toEqual(["Buy", "these", "now"]);
    expect(ssml).toBe(`<speak><mark name="w0"/>Buy <mark name="w1"/>these <mark name="w2"/>now</speak>`);
  });

  it("escapes words inside SSML but keeps raw words in the array", () => {
    const { ssml, words } = buildMarkedSsml("AT&T rocks");
    expect(words).toEqual(["AT&T", "rocks"]);
    expect(ssml).toContain("AT&amp;T");
  });
});
