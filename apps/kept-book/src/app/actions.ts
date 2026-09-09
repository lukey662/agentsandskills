"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { errorCodeFromUnknown, InputError, parseBookTitle, parseDedication, parseDisplayName, parseHouseholdName, parseInviteCode, parseRecipeFields } from "@/lib/validation";
import { clearSessionCookie, getActiveSession, setSessionCookie } from "@/lib/session";
import { SAMPLE_CARDS } from "@/lib/samples";
import { createHousehold, createRecipe, joinHousehold, StoreError, updateBook, updateRecipe } from "@/lib/store";

function fail(code: string, path: string): never {
  const url = new URL(path, "http://kept.book");
  url.searchParams.set("error", code);
  redirect(`${url.pathname}?${url.searchParams.toString()}`);
}

function asCode(error: unknown): string {
  if (error instanceof StoreError) return error.code;
  if (error instanceof InputError) return error.code;
  return errorCodeFromUnknown(error);
}

export async function openKitchenAction(formData: FormData): Promise<void> {
  try {
    const name = parseHouseholdName(formData.get("name"));
    const displayName = parseDisplayName(formData.get("displayName"));
    const { household, member } = await createHousehold(name, displayName);
    await setSessionCookie({ memberId: member.id, householdId: household.id });
  } catch (error) {
    fail(asCode(error), "/");
  }
  revalidatePath("/");
  redirect("/box");
}

export async function joinKitchenAction(formData: FormData): Promise<void> {
  try {
    const inviteCode = parseInviteCode(formData.get("inviteCode"));
    const displayName = parseDisplayName(formData.get("displayName"));
    const { household, member } = await joinHousehold(inviteCode, displayName);
    await setSessionCookie({ memberId: member.id, householdId: household.id });
  } catch (error) {
    fail(asCode(error), "/");
  }
  revalidatePath("/");
  redirect("/box");
}

export async function signOutAction(): Promise<void> {
  await clearSessionCookie();
  redirect("/");
}

export async function createRecipeAction(formData: FormData): Promise<void> {
  const active = await getActiveSession();
  if (!active) fail("not-signed-in", "/");
  let recipeId: string;
  try {
    const fields = parseRecipeFields({
      title: formData.get("title"),
      fromWhom: formData.get("fromWhom"),
      course: formData.get("course"),
      story: formData.get("story"),
      servings: formData.get("servings"),
      ingredients: formData.get("ingredients"),
      steps: formData.get("steps"),
      notes: formData.get("notes")
    });
    const recipe = await createRecipe(active.household.id, active.member.id, fields);
    recipeId = recipe.id;
  } catch (error) {
    fail(asCode(error), "/recipes/new");
  }
  revalidatePath("/box");
  redirect(`/recipes/${recipeId}`);
}

export async function updateRecipeAction(recipeId: string, formData: FormData): Promise<void> {
  const active = await getActiveSession();
  if (!active) fail("not-signed-in", "/");
  try {
    const fields = parseRecipeFields({
      title: formData.get("title"),
      fromWhom: formData.get("fromWhom"),
      course: formData.get("course"),
      story: formData.get("story"),
      servings: formData.get("servings"),
      ingredients: formData.get("ingredients"),
      steps: formData.get("steps"),
      notes: formData.get("notes")
    });
    await updateRecipe(active.household.id, recipeId, fields);
  } catch (error) {
    fail(asCode(error), `/recipes/${recipeId}/edit`);
  }
  revalidatePath("/box");
  revalidatePath(`/recipes/${recipeId}`);
  redirect(`/recipes/${recipeId}`);
}

export async function addSampleCardsAction(): Promise<void> {
  const active = await getActiveSession();
  if (!active) fail("not-signed-in", "/");
  try {
    for (const sample of SAMPLE_CARDS) {
      await createRecipe(active.household.id, active.member.id, sample);
    }
  } catch (error) {
    fail(asCode(error), "/box");
  }
  revalidatePath("/box");
  redirect("/box");
}

export async function updateBookAction(formData: FormData): Promise<void> {
  const active = await getActiveSession();
  if (!active) fail("not-signed-in", "/");
  try {
    const title = parseBookTitle(formData.get("title"));
    const dedication = parseDedication(formData.get("dedication"));
    await updateBook(active.household.id, title, dedication);
  } catch (error) {
    fail(asCode(error), "/book");
  }
  revalidatePath("/book");
  redirect("/book");
}
