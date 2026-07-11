import { describe, expect, it } from "vitest";
import { state, type CheckStatusState } from "./github";

describe("state", () => {
  it("has an emoji for every CheckStatusState", () => {
    const statuses: CheckStatusState[] = [
      "SUCCESS",
      "ERROR",
      "FAILURE",
      "PENDING",
      "EXPECTED",
    ];

    for (const status of statuses) {
      expect(state[status]).toBeTypeOf("string");
      expect(state[status].length).toBeGreaterThan(0);
    }
  });
});
