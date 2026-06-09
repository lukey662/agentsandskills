import type { RosterAgent } from "../wizard/roster.js";
import type { WizardDepth } from "../wizard/steps.js";
import type { OfficeStation } from "./types.js";

export const MAP_WIDTH = 28;
export const MAP_HEIGHT = 18;
export const TILE_SIZE = 24;
export const CANVAS_SCALE = 4;

const ALL_DEPTHS: WizardDepth[] = ["quick", "standard", "complete", "undecided"];
const STANDARD_DEPTHS: WizardDepth[] = ["standard", "complete"];
const COMPLETE_DEPTHS: WizardDepth[] = ["complete"];

const ZONE_STATIONS: Omit<OfficeStation, "agentId">[] = [
  { id: "ide", kind: "zone", label: "IDE Terminal", section: "ide", x: 1, y: 1, w: 4, h: 3, depths: ALL_DEPTHS },
  { id: "product", kind: "zone", label: "Product Board", section: "product", x: 22, y: 1, w: 5, h: 3, depths: ALL_DEPTHS },
  { id: "access", kind: "zone", label: "Security Door", section: "access", x: 1, y: 14, w: 4, h: 3, depths: ALL_DEPTHS },
  { id: "ui", kind: "zone", label: "Design Corner", section: "ui", x: 22, y: 14, w: 5, h: 3, depths: ALL_DEPTHS },
  { id: "messaging", kind: "zone", label: "Marketing Booth", section: "messaging", x: 11, y: 1, w: 6, h: 2, depths: ALL_DEPTHS },
  {
    id: "visualQa",
    kind: "zone",
    label: "QA Camera",
    section: "visualQa",
    x: 11,
    y: 15,
    w: 6,
    h: 2,
    depths: STANDARD_DEPTHS
  },
  {
    id: "designDoc",
    kind: "zone",
    label: "Design Archive",
    section: "designDoc",
    x: 6,
    y: 14,
    w: 4,
    h: 3,
    depths: COMPLETE_DEPTHS
  },
  {
    id: "messagingDoc",
    kind: "zone",
    label: "Copy Archive",
    section: "messagingDoc",
    x: 18,
    y: 14,
    w: 4,
    h: 3,
    depths: COMPLETE_DEPTHS
  },
  {
    id: "applyDrafts",
    kind: "zone",
    label: "Publishing Desk",
    section: "applyDrafts",
    x: 9,
    y: 8,
    w: 3,
    h: 2,
    depths: COMPLETE_DEPTHS
  },
  { id: "review", kind: "review", label: "Review Board", section: "review", x: 16, y: 8, w: 4, h: 2, depths: ALL_DEPTHS },
  {
    id: "coffee",
    kind: "amenity",
    label: "Coffee Machine",
    section: "agent",
    amenityId: "coffee",
    x: 12,
    y: 10,
    w: 2,
    h: 2,
    depths: ALL_DEPTHS
  },
  {
    id: "cooler",
    kind: "amenity",
    label: "Water Cooler",
    section: "agent",
    amenityId: "cooler",
    x: 14,
    y: 10,
    w: 2,
    h: 2,
    depths: ALL_DEPTHS
  }
];

/** Break-room rug tile bounds (inclusive tile coords). */
export const BREAK_ROOM_RUG = { x: 11, y: 9, w: 7, h: 4 };

function agentDeskPositions(count: number): { x: number; y: number }[] {
  const positions: { x: number; y: number }[] = [];
  const cols = Math.min(5, Math.ceil(count / 2));
  const startX = 4;
  const startY = 5;
  const gapX = 4;
  const gapY = 5;
  for (let i = 0; i < count; i += 1) {
    const row = Math.floor(i / cols);
    const col = i % cols;
    positions.push({ x: startX + col * gapX, y: startY + row * gapY });
  }
  return positions;
}

export function buildOfficeStations(agents: RosterAgent[]): OfficeStation[] {
  const desks = agentDeskPositions(agents.length);
  const agentStations: OfficeStation[] = agents.map((agent, index) => ({
    id: `agent-${agent.id}`,
    kind: "agent",
    label: agent.name,
    section: "agent",
    agentId: agent.id,
    x: desks[index]?.x ?? 4,
    y: desks[index]?.y ?? 5,
    w: 3,
    h: 3,
    depths: ALL_DEPTHS
  }));
  return [...ZONE_STATIONS, ...agentStations];
}

export function stationsForDepth(stations: OfficeStation[], depth: WizardDepth): OfficeStation[] {
  if (depth === "undecided") return stations.filter((s) => s.depths.includes("quick"));
  return stations.filter((s) => s.depths.includes(depth));
}

export function amenityTileCenter(amenityId: "coffee" | "cooler"): { x: number; y: number } {
  const station = ZONE_STATIONS.find((s) => s.amenityId === amenityId);
  if (!station) return { x: 13, y: 10 };
  return { x: station.x + station.w / 2, y: station.y + station.h / 2 };
}
