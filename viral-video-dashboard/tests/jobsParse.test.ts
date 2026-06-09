import { describe, it, expect } from "vitest";
import { parseSelectedIds } from "../lib/jobs";

describe("parseSelectedIds", () => {
  it("returns the array of checked article ids from FormData getAll", () => {
    const fd = new FormData(); fd.append("articleId", "a1"); fd.append("articleId", "a2");
    expect(parseSelectedIds(fd)).toEqual(["a1", "a2"]);
  });
  it("returns [] when nothing is checked", () => {
    expect(parseSelectedIds(new FormData())).toEqual([]);
  });
});
