import { describe, expect, it } from 'vitest';
import { emptyPostLocation, hasPostCoordinates } from './postLocation';

describe('postLocation', () => {
  it('hasPostCoordinates requires both finite numbers', () => {
    expect(hasPostCoordinates(31.2, 121.5)).toBe(true);
    expect(hasPostCoordinates(null, 121.5)).toBe(false);
    expect(hasPostCoordinates(31.2, undefined)).toBe(false);
  });

  it('emptyPostLocation clears text and coords', () => {
    expect(emptyPostLocation()).toEqual({ location: '', latitude: null, longitude: null });
  });
});
