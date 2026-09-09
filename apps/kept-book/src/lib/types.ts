export const COURSES = ["starters", "mains", "sides", "sweets", "other"] as const;

export type Course = (typeof COURSES)[number];

export type Household = {
  id: string;
  name: string;
  inviteCode: string;
  createdAt: string;
};

export type Member = {
  id: string;
  householdId: string;
  displayName: string;
  createdAt: string;
};

export type Recipe = {
  id: string;
  householdId: string;
  title: string;
  fromWhom: string;
  course: Course;
  story: string;
  servings: string;
  ingredients: string[];
  steps: string[];
  notes: string;
  createdByMemberId: string;
  createdAt: string;
  updatedAt: string;
};

export type Book = {
  householdId: string;
  title: string;
  dedication: string;
  updatedAt: string;
};

export type StoreData = {
  version: 1;
  households: Household[];
  members: Member[];
  recipes: Recipe[];
  books: Book[];
};

export type Session = {
  memberId: string;
  householdId: string;
};

export const COURSE_LABEL: Record<Course, string> = {
  starters: "Starters",
  mains: "Mains",
  sides: "Sides",
  sweets: "Sweets",
  other: "Other"
};

export function emptyStore(): StoreData {
  return { version: 1, households: [], members: [], recipes: [], books: [] };
}
