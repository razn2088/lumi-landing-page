import { describe, it, expect } from "vitest";
import { parseAccountValue } from "../lib/connections";

describe("parseAccountValue", () => {
  it("splits 'igUserId|username'", () => {
    expect(parseAccountValue("IG1|topdealsus")).toEqual({ igUserId: "IG1", username: "topdealsus" });
  });
  it("tolerates a missing username", () => {
    expect(parseAccountValue("IG1")).toEqual({ igUserId: "IG1", username: "" });
  });
});
