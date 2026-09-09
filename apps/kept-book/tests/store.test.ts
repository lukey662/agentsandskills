import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createHousehold, createRecipe, getRecipe, joinHousehold, listRecipes } from "../src/lib/store";
import { signSession, verifySessionToken } from "../src/lib/session-token";
import { renderCookbookPdf } from "../src/lib/pdf";
import { parseInviteCode, parseRecipeFields } from "../src/lib/validation";

describe("household isolation", () => {
  let dir: string;

  beforeEach(async () => {
    dir = await mkdtemp(join(tmpdir(), "kept-book-"));
    process.env.KEPT_BOOK_DATA_DIR = dir;
  });

  afterEach(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  it("does not return another kitchen's recipe by id", async () => {
    const a = await createHousehold("Oak Street", "Jo");
    const b = await createHousehold("Pine Street", "Sam");
    const recipe = await createRecipe(a.household.id, a.member.id, {
      title: "Tuesday beans",
      fromWhom: "Aunt Jo",
      course: "mains",
      story: "",
      servings: "",
      ingredients: ["beans"],
      steps: ["simmer"],
      notes: ""
    });
    expect(await getRecipe(b.household.id, recipe.id)).toBeNull();
    expect(await getRecipe(a.household.id, recipe.id)).not.toBeNull();
    expect(await listRecipes(b.household.id)).toHaveLength(0);
  });

  it("lets a second person join with the invite code", async () => {
    const opened = await createHousehold("Oak Street", "Jo");
    const joined = await joinHousehold(opened.household.inviteCode, "Sam");
    expect(joined.household.id).toBe(opened.household.id);
    expect(joined.member.id).not.toBe(opened.member.id);
  });

  it("rejects a guessed invite", async () => {
    await expect(joinHousehold("ZZZZZZZZ", "Sam")).rejects.toMatchObject({ code: "invalid-invite" });
  });
});

describe("session tokens", () => {
  it("round-trips a session", () => {
    const token = signSession({ memberId: "m1", householdId: "h1" }, "secret");
    expect(verifySessionToken(token, "secret")).toEqual({ memberId: "m1", householdId: "h1" });
    expect(verifySessionToken(token, "other")).toBeNull();
    expect(verifySessionToken("not-a-token", "secret")).toBeNull();
  });
});

describe("recipe fields", () => {
  it("requires ingredients and steps", () => {
    expect(() =>
      parseRecipeFields({
        title: "Pan bread",
        fromWhom: "Dad",
        course: "sides",
        story: "",
        servings: "",
        ingredients: "",
        steps: "mix",
        notes: ""
      })
    ).toThrow(/ingredient/i);
  });

  it("normalizes invite codes", () => {
    expect(parseInviteCode("ab-cd-efgh")).toBe("ABCDEFGH");
  });
});

describe("print PDF", () => {
  it("starts with a PDF header", async () => {
    const pdf = await renderCookbookPdf({
      household: { id: "h", name: "Oak Street", inviteCode: "ABCDEFGH", createdAt: "2026-01-01" },
      book: { householdId: "h", title: "Oak Street cookbook", dedication: "For the table.", updatedAt: "2026-01-01" },
      recipes: [
        {
          id: "r1",
          householdId: "h",
          title: "Pan bread",
          fromWhom: "Dad",
          course: "sides",
          story: "",
          servings: "1 skillet",
          ingredients: ["flour"],
          steps: ["mix", "cook"],
          notes: "",
          createdByMemberId: "m",
          createdAt: "2026-01-01",
          updatedAt: "2026-01-01"
        }
      ]
    });
    expect(pdf.subarray(0, 4).toString("utf8")).toBe("%PDF");
    expect(pdf.length).toBeGreaterThan(200);
  });
});
