import { COURSES, type Course, type Recipe } from "./types";

export type FieldError = { field?: string; message: string };

export class InputError extends Error {
  constructor(
    message: string,
    readonly code: string,
    readonly field?: string
  ) {
    super(message);
    this.name = "InputError";
  }
}

function clip(value: string, max: number): string {
  return value.trim().slice(0, max);
}

function requireText(value: unknown, field: string, max: number, code: string): string {
  if (typeof value !== "string") throw new InputError(`${field} is required.`, code, field);
  const next = clip(value, max);
  if (!next) throw new InputError(`${field} is required.`, code, field);
  return next;
}

function optionalText(value: unknown, max: number): string {
  if (typeof value !== "string") return "";
  return clip(value, max);
}

function lines(value: unknown, field: string, maxLines: number, maxLen: number): string[] {
  if (typeof value !== "string") return [];
  const items = value
    .split(/\r?\n/)
    .map((line) => clip(line, maxLen))
    .filter(Boolean);
  if (items.length > maxLines) {
    throw new InputError(`${field} has too many lines.`, "too-long", field);
  }
  return items;
}

export function parseHouseholdName(value: unknown): string {
  return requireText(value, "Kitchen name", 80, "name-required");
}

export function parseDisplayName(value: unknown): string {
  return requireText(value, "Your name", 60, "name-required");
}

export function parseInviteCode(value: unknown): string {
  const code = requireText(value, "Invite code", 16, "invalid-invite")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");
  if (code.length < 6 || code.length > 12) {
    throw new InputError("That invite code does not match a kitchen.", "invalid-invite", "inviteCode");
  }
  return code;
}

export function parseCourse(value: unknown): Course {
  if (typeof value === "string" && (COURSES as readonly string[]).includes(value)) {
    return value as Course;
  }
  throw new InputError("Pick a section for this card.", "invalid-recipe", "course");
}

export function parseBookTitle(value: unknown): string {
  return requireText(value, "Book title", 80, "name-required");
}

export function parseDedication(value: unknown): string {
  return optionalText(value, 400);
}

export function parseRecipeFields(form: {
  title: unknown;
  fromWhom: unknown;
  course: unknown;
  story: unknown;
  servings: unknown;
  ingredients: unknown;
  steps: unknown;
  notes: unknown;
}): Pick<Recipe, "title" | "fromWhom" | "course" | "story" | "servings" | "ingredients" | "steps" | "notes"> {
  const title = requireText(form.title, "Recipe name", 120, "invalid-recipe");
  const fromWhom = requireText(form.fromWhom, "From", 80, "invalid-recipe");
  const course = parseCourse(form.course);
  const story = optionalText(form.story, 800);
  const servings = optionalText(form.servings, 40);
  const ingredients = lines(form.ingredients, "Ingredients", 80, 400);
  const steps = lines(form.steps, "Steps", 60, 800);
  const notes = optionalText(form.notes, 800);
  if (ingredients.length === 0) {
    throw new InputError("Write at least one ingredient.", "invalid-recipe", "ingredients");
  }
  if (steps.length === 0) {
    throw new InputError("Write at least one step.", "invalid-recipe", "steps");
  }
  return { title, fromWhom, course, story, servings, ingredients, steps, notes };
}

export function errorCodeFromUnknown(error: unknown): string {
  if (error instanceof InputError) return error.code;
  return "failed";
}
