import { describe, expect, it } from 'vitest';
import { clampProgress, MILESTONES, safeLink, youtubeId } from './objectives';
import { FOUNDERS } from './founders';

describe('personal objective rules', () => {
  it('keeps sprint progress between 0 and 100 percent', () => {
    expect(clampProgress(-10)).toBe(0);
    expect(clampProgress(110)).toBe(100);
    expect(clampProgress(56)).toBe(56);
  });
  it.each(['ghambuna', 'shamba', 'maganga', 'mchele'])('has separate domain milestones for %s', (handle) => {
    expect(FOUNDERS.some((f) => f.handle === handle)).toBe(true);
    expect(MILESTONES[handle]?.length).toBe(4);
    expect(new Set(Object.values(MILESTONES).flat()).size).toBe(16);
  });
});
describe('source previews', () => {
  it('extracts inline YouTube video IDs', () => {
    expect(youtubeId('https://youtu.be/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
    expect(youtubeId('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
    expect(youtubeId('https://evil.com/watch?v=dQw4w9WgXcQ')).toBeNull();
  });
  it('rejects executable links', () => {
    expect(safeLink('javascript:alert(1)')).toBeNull();
    expect(safeLink('https://github.com/onyxcore')?.hostname).toBe('github.com');
  });
});