import { describe, expect, it } from "vitest";
import { scoreTutorMatch } from "./matching";

describe("scoreTutorMatch", () => {
  it("prioritises subject, board, and mode compatibility", () => {
    const compatible = scoreTutorMatch(
      { subjects: "Maths, Physics", board: "CBSE", mode: "home_tuition" },
      { subjects: "Physics, Mathematics", boards: "CBSE, ICSE", mode: "both" }
    );
    const weak = scoreTutorMatch(
      { subjects: "Maths, Physics", board: "CBSE", mode: "home_tuition" },
      { subjects: "English", boards: "State", mode: "online" }
    );

    expect(compatible.matchScore).toBeGreaterThan(weak.matchScore);
    expect(compatible.matchReasons).toContain("CBSE support");
    expect(compatible.matchReasons).toContain("teaching mode fits");
  });
});
