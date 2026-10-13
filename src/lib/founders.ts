export const FOUNDERS = [
  { handle: "ghambuna", first: "Maximilian", name: "Maximilian Ghambuna", role: "Lead & Firmware Systems" },
  { handle: "shamba", first: "Brian", name: "Brian Shamba", role: "UI & Systems Architecture" },
  { handle: "maganga", first: "Aidan", name: "Aidan Maganga", role: "Client Operations & QA" },
  { handle: "mchele", first: "Blessing", name: "Blessing Mchele", role: "Backend & Data Pipelines" },
] as const;

export type Founder = (typeof FOUNDERS)[number];

export function findFounder(input: string): Founder | undefined {
  const h = input.trim().toLowerCase();
  return FOUNDERS.find((f) => f.handle === h);
}

export const CHANNELS = ["all-hands", "firmware-hw", "frontend-ui", "client-ops", "backend-data"] as const;

export const CATEGORIES = ["Microcontroller", "Sensor", "Radio / Wireless", "Power", "Display & Interface", "Debugger", "Actuators"] as const;

export const VERDICTS = ["Under Discussion", "Approved for Sprint", "Passed / Archived"] as const;

export const HEARTBEAT_MS = 5 * 60 * 1000;

/** A founder counts as online when flagged online and their heartbeat is within 5 minutes. */
export function isOnline(row: { is_online: boolean; last_active: string }, now = Date.now()): boolean {
  return row.is_online && now - new Date(row.last_active).getTime() < HEARTBEAT_MS;
}

export const ADVISOR_MODELS = [
  { id: "google/gemini-3.1-flash-lite", label: "Gemini 3.5 Flash-Lite", hint: "Rapid Response" },
  { id: "google/gemini-3.7-flash", label: "Gemini 3.5 Flash", hint: "Balanced Core" },
  { id: "google/gemini-3.8-flash", label: "Gemini 3.8 Flash", hint: "Deep Architecture" },
] as const;
export const DEFAULT_MODEL = ADVISOR_MODELS[1].id;
