import { describe, expect, it } from "vitest";
import { redactPrivateLocation } from "./profilePrivacy";

describe("redactPrivateLocation", () => {
  it("removes coordinates and exact address from a user-facing profile", () => {
    const result = redactPrivateLocation({
      id: 12,
      name: "Test Tutor",
      area: "Koramangala",
      latitude: "12.9352",
      longitude: "77.6245",
      fullAddress: "12, 3rd Cross, Koramangala, Bengaluru",
    });

    expect(result).toEqual({
      id: 12,
      name: "Test Tutor",
      area: "Koramangala",
      hasPrivateLocation: true,
    });
    expect(result).not.toHaveProperty("latitude");
    expect(result).not.toHaveProperty("longitude");
    expect(result).not.toHaveProperty("fullAddress");
  });

  it("reports when a profile has no stored private location", () => {
    expect(redactPrivateLocation({
      id: 4,
      latitude: null,
      longitude: null,
      fullAddress: null,
    })).toEqual({ id: 4, hasPrivateLocation: false });
  });
});
