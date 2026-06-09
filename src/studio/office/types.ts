import type { RosterAgent } from "../wizard/roster.js";
import type { WizardDepth, WizardSectionId } from "../wizard/steps.js";

export type AgentRoleSprite = "planner" | "engineer" | "design" | "ops";

export type OfficeStationKind = "zone" | "agent" | "review" | "amenity";

export type OfficeAmenityId = "coffee" | "cooler";

export interface OfficeStation {
  id: string;
  kind: OfficeStationKind;
  label: string;
  section: WizardSectionId | "agent";
  agentId?: string;
  amenityId?: OfficeAmenityId;
  /** Tile coordinates */
  x: number;
  y: number;
  w: number;
  h: number;
  depths: WizardDepth[];
}

export interface OfficeBootConfig {
  mode?: "setup" | "studio";
  mapWidth: number;
  mapHeight: number;
  tileSize: number;
  scale: number;
  stations: OfficeStation[];
  agents: RosterAgent[];
  categories: string[];
  tenantModels: string[];
  recommendedSupabaseAuth: string;
  ideSurfaces: { id: string; label: string; path: string }[];
  hasSupabase: boolean;
  stackSignals: string[];
  activeSessionId?: string;
}

export function agentRoleSprite(agentId: string): AgentRoleSprite {
  if (agentId === "planner") return "planner";
  if (["lead-architect", "nextjs-engineer", "supabase-postgres-engineer"].includes(agentId)) return "engineer";
  if (["frontend-design-lead", "marketing-copy-lead"].includes(agentId)) return "design";
  return "ops";
}
