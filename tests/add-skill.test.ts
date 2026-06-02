import { describe, expect, it } from "vitest";
import { addSkill } from "../src/install/add-skill.js";

describe("addSkill", () => {
  it("rejects path-like skill names", () => {
    expect(() => addSkill(process.cwd(), "../secret")).toThrow(/Skill names/);
  });
});
