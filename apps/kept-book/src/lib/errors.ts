export const ERROR_COPY: Record<string, string> = {
  "name-required": "Name the kitchen and yourself.",
  "invalid-invite": "That invite code does not match a kitchen.",
  "invalid-recipe": "The card needs a name, a from, ingredients, and steps.",
  "not-signed-in": "Open or join a kitchen first.",
  "not-found": "That card is not in this kitchen.",
  failed: "The box could not save that. Try again."
};

export function messageFor(code: string | undefined): string | null {
  if (!code) return null;
  return ERROR_COPY[code] ?? ERROR_COPY.failed ?? null;
}
