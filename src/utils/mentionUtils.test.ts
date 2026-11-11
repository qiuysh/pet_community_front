import { describe, it, expect } from 'vitest';
import { applyMention, extractMentionNicknames, getMentionTrigger } from './mentionUtils';

describe('mentionUtils', () => {
  describe('getMentionTrigger', () => {
    it('detects @ at start', () => {
      expect(getMentionTrigger('@al', 3)).toEqual({ start: 0, query: 'al' });
    });

    it('detects @ after whitespace', () => {
      expect(getMentionTrigger('hi @bo', 6)).toEqual({ start: 3, query: 'bo' });
    });

    it('ignores email-like text', () => {
      expect(getMentionTrigger('a@b', 3)).toBeNull();
    });

    it('closes when query contains space', () => {
      expect(getMentionTrigger('@a b', 4)).toBeNull();
    });
  });

  describe('applyMention', () => {
    it('replaces query and places cursor after space', () => {
      const result = applyMention('hi @al', 3, 'al', 'Alice');
      expect(result.text).toBe('hi @Alice ');
      expect(result.cursor).toBe('hi @Alice '.length);
    });
  });

  describe('extractMentionNicknames', () => {
    it('dedupes nicknames', () => {
      expect(extractMentionNicknames('@A x @B @A')).toEqual(['A', 'B']);
    });
  });
});
