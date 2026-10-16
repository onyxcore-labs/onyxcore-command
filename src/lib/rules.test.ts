import { describe, expect, test } from 'bun:test';
import { CATEGORIES, FOUNDER_HANDLES, validHandle, clampProgress, withoutItem, safeUrl } from './rules';
describe('Team and inventory rules', () => {
 test('handles use 3–24 lowercase letters, numbers or underscores and start with a letter', () => { expect(validHandle('new_member')).toBe(true); for (const h of ['ab','1abc','Abcd','a b','a'.repeat(25)]) expect(validHandle(h)).toBe(false); expect(validHandle('a'.repeat(24))).toBe(true); });
 test('only the original four handles have founder approval authority', () => { expect(FOUNDER_HANDLES).toEqual(['ghambuna','shamba','maganga','mchele']); expect(FOUNDER_HANDLES.includes('new_member')).toBe(false); });
 test('progress remains between 0 and 100', () => { expect(clampProgress(-4)).toBe(0); expect(clampProgress(112)).toBe(100); expect(clampProgress(42)).toBe(42); });
 test('Actuators is an inventory category', () => { expect(CATEGORIES).toContain('Actuators'); });
 test('deletion removes only the selected item', () => { expect(withoutItem([{id:'servo'},{id:'cart'}], 'servo')).toEqual([{id:'cart'}]); });
 test('idea links cannot execute scripts', () => { expect(safeUrl('javascript:alert(1)')).toBeNull(); expect(safeUrl('https://github.com')).toBe('https://github.com/'); });
});