import type { WizardSectionId } from "../wizard/steps.js";
import type { OfficeStation } from "./types.js";

/** Map an office station to the wizard section used for onboarding progress. */
export function wizardSectionForStation(station: OfficeStation): WizardSectionId | null {
  if (station.kind === "amenity") return null;
  if (station.kind === "agent") return "team";
  if (station.section === "agent") return "team";
  return station.section;
}

export function allAgentBriefsComplete(form: Record<string, string>, agentIds: string[]): boolean {
  if (agentIds.length === 0) return false;
  return agentIds.every((id) => Boolean(form[`agentBrief_${id}`]?.trim()));
}
