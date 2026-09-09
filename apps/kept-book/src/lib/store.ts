import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { newId, newInviteCode, nowIso } from "./ids";
import type { Book, Household, Member, Recipe, StoreData } from "./types";
import { emptyStore } from "./types";

export class StoreError extends Error {
  constructor(
    message: string,
    readonly code: string
  ) {
    super(message);
    this.name = "StoreError";
  }
}

let writeChain: Promise<unknown> = Promise.resolve();

function dataDir(): string {
  if (process.env.KEPT_BOOK_DATA_DIR) return process.env.KEPT_BOOK_DATA_DIR;
  if (process.env.VERCEL) return join("/tmp", "kept-book");
  return join(process.cwd(), ".data");
}

function dataFile(): string {
  return join(dataDir(), "box.json");
}

function withLock<T>(fn: () => Promise<T>): Promise<T> {
  const run = writeChain.then(fn, fn);
  writeChain = run.then(
    () => undefined,
    () => undefined
  );
  return run;
}

function isStoreData(value: unknown): value is StoreData {
  if (!value || typeof value !== "object") return false;
  const data = value as StoreData;
  return data.version === 1 && Array.isArray(data.households) && Array.isArray(data.members) && Array.isArray(data.recipes) && Array.isArray(data.books);
}

export async function readStore(): Promise<StoreData> {
  try {
    const raw = await readFile(dataFile(), "utf8");
    const parsed: unknown = JSON.parse(raw);
    if (!isStoreData(parsed)) return emptyStore();
    return parsed;
  } catch (error) {
    if (typeof error === "object" && error && "code" in error && error.code === "ENOENT") {
      return emptyStore();
    }
    throw error;
  }
}

async function writeStore(data: StoreData): Promise<void> {
  await mkdir(dataDir(), { recursive: true });
  await writeFile(dataFile(), `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

export async function createHousehold(name: string, displayName: string): Promise<{ household: Household; member: Member }> {
  return withLock(async () => {
    const data = await readStore();
    const createdAt = nowIso();
    const household: Household = {
      id: newId(),
      name,
      inviteCode: newInviteCode(),
      createdAt
    };
    const member: Member = {
      id: newId(),
      householdId: household.id,
      displayName,
      createdAt
    };
    const book: Book = {
      householdId: household.id,
      title: `${name} cookbook`,
      dedication: "",
      updatedAt: createdAt
    };
    data.households.push(household);
    data.members.push(member);
    data.books.push(book);
    await writeStore(data);
    return { household, member };
  });
}

export async function joinHousehold(inviteCode: string, displayName: string): Promise<{ household: Household; member: Member }> {
  return withLock(async () => {
    const data = await readStore();
    const household = data.households.find((item) => item.inviteCode === inviteCode);
    if (!household) {
      throw new StoreError("That invite code does not match a kitchen.", "invalid-invite");
    }
    const member: Member = {
      id: newId(),
      householdId: household.id,
      displayName,
      createdAt: nowIso()
    };
    data.members.push(member);
    await writeStore(data);
    return { household, member };
  });
}

export async function getHousehold(householdId: string): Promise<Household | null> {
  const data = await readStore();
  return data.households.find((item) => item.id === householdId) ?? null;
}

export async function getMember(memberId: string): Promise<Member | null> {
  const data = await readStore();
  return data.members.find((item) => item.id === memberId) ?? null;
}

export async function listRecipes(householdId: string): Promise<Recipe[]> {
  const data = await readStore();
  return data.recipes
    .filter((recipe) => recipe.householdId === householdId)
    .sort((a, b) => a.title.localeCompare(b.title));
}

export async function getRecipe(householdId: string, recipeId: string): Promise<Recipe | null> {
  const data = await readStore();
  const recipe = data.recipes.find((item) => item.id === recipeId) ?? null;
  if (!recipe || recipe.householdId !== householdId) return null;
  return recipe;
}

export async function createRecipe(
  householdId: string,
  createdByMemberId: string,
  fields: Omit<Recipe, "id" | "householdId" | "createdByMemberId" | "createdAt" | "updatedAt">
): Promise<Recipe> {
  return withLock(async () => {
    const data = await readStore();
    const household = data.households.find((item) => item.id === householdId);
    const member = data.members.find((item) => item.id === createdByMemberId);
    if (!household || !member || member.householdId !== householdId) {
      throw new StoreError("You are not in this kitchen.", "not-signed-in");
    }
    const stamp = nowIso();
    const recipe: Recipe = {
      id: newId(),
      householdId,
      createdByMemberId,
      createdAt: stamp,
      updatedAt: stamp,
      ...fields
    };
    data.recipes.push(recipe);
    await writeStore(data);
    return recipe;
  });
}

export async function updateRecipe(
  householdId: string,
  recipeId: string,
  fields: Omit<Recipe, "id" | "householdId" | "createdByMemberId" | "createdAt" | "updatedAt">
): Promise<Recipe> {
  return withLock(async () => {
    const data = await readStore();
    const index = data.recipes.findIndex((item) => item.id === recipeId);
    const existing = index >= 0 ? data.recipes[index] : undefined;
    if (!existing || existing.householdId !== householdId) {
      throw new StoreError("That card is not in this kitchen.", "not-found");
    }
    const recipe: Recipe = {
      ...existing,
      ...fields,
      updatedAt: nowIso()
    };
    data.recipes[index] = recipe;
    await writeStore(data);
    return recipe;
  });
}

export async function getBook(householdId: string): Promise<Book | null> {
  const data = await readStore();
  return data.books.find((item) => item.householdId === householdId) ?? null;
}

export async function updateBook(householdId: string, title: string, dedication: string): Promise<Book> {
  return withLock(async () => {
    const data = await readStore();
    const index = data.books.findIndex((item) => item.householdId === householdId);
    const existing = index >= 0 ? data.books[index] : undefined;
    if (!existing) {
      throw new StoreError("This kitchen has no book yet.", "not-found");
    }
    const book: Book = { ...existing, title, dedication, updatedAt: nowIso() };
    data.books[index] = book;
    await writeStore(data);
    return book;
  });
}

export function recipesForBook(recipes: Recipe[]): Recipe[] {
  const order = ["starters", "mains", "sides", "sweets", "other"] as const;
  return [...recipes].sort((a, b) => {
    const course = order.indexOf(a.course) - order.indexOf(b.course);
    if (course !== 0) return course;
    return a.title.localeCompare(b.title);
  });
}
