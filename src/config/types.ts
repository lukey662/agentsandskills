export type StackProfile = "next-supabase";

export type DesignProvider = "stitch" | "claude" | "figma" | "human";

export interface AgentKitConfig {
  stack: StackProfile;
  projectType: "saas" | "marketplace" | "admin" | "content" | "custom";
  docsMode: "advisory" | "required";
  designProviders: DesignProvider[];
  research: {
    maxRepos: number;
    githubTokenEnv: string;
    workdir: string;
  };
}

export interface InstallManifest {
  packageName: string;
  packageVersion: string;
  stack: StackProfile;
  installedAt: string;
  docs: string[];
  libraryFolders: string[];
  templateHashes?: Record<string, string>;
}

export interface AuditFinding {
  level: "pass" | "warn" | "fail";
  area: string;
  message: string;
  remediation?: string;
}

export interface AuditReport {
  summary: Record<AuditFinding["level"], number>;
  findings: AuditFinding[];
}

export interface RepoCandidate {
  fullName: string;
  htmlUrl: string;
  description: string;
  stars: number;
  pushedAt: string;
  language: string | null;
  topics: string[];
  category: string;
}

export interface RepoScore {
  architecture: number;
  supabaseAuthRls: number;
  security: number;
  frontendDesign: number;
  accessibility: number;
  testing: number;
  documentation: number;
  ciDeployment: number;
  agentReadiness: number;
}

export interface RepoFinding {
  candidate: RepoCandidate;
  score: RepoScore;
  selectedFiles: string[];
  strongPractices: string[];
  weakPractices: string[];
  patternsToAdopt: string[];
  impactOnKit: string[];
}
