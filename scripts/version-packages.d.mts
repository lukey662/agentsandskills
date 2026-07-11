export type VersionBump = "patch" | "minor" | "major";

export interface ParsedChangeset {
  path: string;
  releases: Array<{ name: string; type: VersionBump }>;
  summary: string;
}

export function parseChangeset(path: string): ParsedChangeset;
export function incrementVersion(version: string, type: VersionBump): string;
