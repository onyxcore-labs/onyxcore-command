export const MILESTONES: Record<string, string[]> = {
  ghambuna: ['Validate sensor acquisition', 'Profile radio power consumption', 'Complete firmware integration tests', 'Document testbed wiring'],
  shamba: ['Review interface architecture', 'Complete founder workflows', 'Validate accessible layouts', 'Ship interface regression tests'],
  maganga: ['Confirm client acceptance criteria', 'Run end-to-end QA checks', 'Triage reported issues', 'Prepare sprint handover'],
  mchele: ['Validate data contracts', 'Complete ingestion pipeline', 'Review access and error handling', 'Verify telemetry reliability'],
};

export function clampProgress(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function youtubeId(url: string): string | null {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, '');
    const id = host === 'youtu.be' ? u.pathname.slice(1) : ['youtube.com', 'm.youtube.com'].includes(host) ? u.searchParams.get('v') ?? u.pathname.match(/^\/(?:shorts|embed)\/([^/]+)/)?.[1] : null;
    return id && /^[\w-]{11}$/.test(id) ? id : null;
  } catch { return null; }
}

export function safeLink(url: string) {
  try { const u = new URL(url); return ['https:', 'http:'].includes(u.protocol) ? u : null; } catch { return null; }
}