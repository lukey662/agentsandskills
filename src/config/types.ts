export type StackProfile = "next-supabase";

export interface InstallManifest {
  schemaVersion?: 1 | 2 | 3;
  packageName: string;
  packageVersion: string;
  stack: StackProfile;
  installedAt: string;
  updatedAt?: string;
  docs: string[];
  activated?: string[];
  templateHashes?: Record<string, string>;
  assetHashes?: Record<string, string>;
}
