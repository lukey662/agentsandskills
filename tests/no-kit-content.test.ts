import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { loadCatalog } from "../src/catalog.js";

/**
 * Shipped agents and skills run inside other people's products. The kit's own palette, its
 * HTML page, and maintainer scan notes prime a downstream Design agent toward this repo's
 * look. They belong in this repo's DESIGN.md, MESSAGING.md, and DECISIONS.md instead.
 */

const here = process.cwd();
const FORBIDDEN = ["#10100e", "#eceae4", "#ff5a2a", "USER_GUIDE.html", "kit-html", "Kit HTML", "charcoal", "Scan 20"] as const;

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) out.push(...walk(path));
    else if (path.endsWith(".md")) out.push(path);
  }
  return out;
}

describe("shipped agents and skills stay product-neutral", () => {
  const catalog = loadCatalog();

  it("default agents and skills contain no kit tokens, kit HTML, or provenance notes", () => {
    const files = [
      ...catalog.defaultAgents.map((id) => join(here, "agents", id, "agent.md")),
      ...catalog.defaultSkills.map((id) => join(here, "skills", id, "SKILL.md"))
    ];
    for (const file of files) {
      const text = readFileSync(file, "utf8");
      for (const token of FORBIDDEN) {
        expect(text, `${file} contains ${token}`).not.toContain(token);
      }
    }
  });

  it("optional agents carry no kit palette either", () => {
    for (const file of walk(join(here, "agents", "optional"))) {
      const text = readFileSync(file, "utf8");
      for (const token of ["#10100e", "Scan 20"]) expect(text, `${file} contains ${token}`).not.toContain(token);
    }
  });
});
