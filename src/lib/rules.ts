export const CATEGORIES = ['Microcontroller', 'Sensor', 'Radio / Wireless', 'Power', 'Display & Interface', 'Actuators'];
export const FOUNDER_HANDLES = ['ghambuna', 'shamba', 'maganga', 'mchele'];
export const validHandle = (value: string) => /^[a-z][a-z0-9_]{2,23}$/.test(value);
export const clampProgress = (value: number) => Math.max(0, Math.min(100, Number.isFinite(value) ? value : 0));
export const withoutItem = <T extends { id: string }>(items: T[], id: string) => items.filter(item => item.id !== id);
export function safeUrl(value: string): string | null {
 try { const u = new URL(value); return ['https:', 'http:'].includes(u.protocol) ? u.href : null; } catch { return null; }
}
export function youtubeId(value: string): string | null {
 const safe = safeUrl(value); if (!safe) return null; const u = new URL(safe);
 const id = u.hostname === 'youtu.be' ? u.pathname.slice(1) : ['youtube.com','www.youtube.com'].includes(u.hostname) ? u.searchParams.get('v') || u.pathname.split('/')[2] : null;
 return id && /^[\w-]{11}$/.test(id) ? id : null;
}