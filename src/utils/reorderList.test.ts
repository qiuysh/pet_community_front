import { describe, expect, it } from 'vitest';
import { moveListItem } from './reorderList';

describe('moveListItem', () => {
  it('把项移到目标位置', () => {
    expect(moveListItem(['a', 'b', 'c', 'd'], 0, 2)).toEqual(['b', 'c', 'a', 'd']);
    expect(moveListItem(['a', 'b', 'c'], 2, 0)).toEqual(['c', 'a', 'b']);
  });

  it('相邻上移下移', () => {
    expect(moveListItem(['a', 'b', 'c'], 1, 0)).toEqual(['b', 'a', 'c']);
    expect(moveListItem(['a', 'b', 'c'], 0, 1)).toEqual(['b', 'a', 'c']);
  });

  it('越界或相同索引返回原引用', () => {
    const list = ['a', 'b'];
    expect(moveListItem(list, 0, 0)).toBe(list);
    expect(moveListItem(list, -1, 0)).toBe(list);
    expect(moveListItem(list, 0, 9)).toBe(list);
  });
});
