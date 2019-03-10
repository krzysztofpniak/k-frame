import {shallowEqual} from '../src/main';

describe('shallowEqual', () => {
  describe('strings', () => {
    it('equal', () => {
      expect(shallowEqual('a', 'a')).toBe(true);
    });

    it('not equal', () => {
      expect(shallowEqual('a', 'b')).toBe(false);
    });
  });

  describe('numbers', () => {
    it('equal', () => {
      expect(shallowEqual(1, 1)).toBe(true);
      expect(shallowEqual(NaN, NaN)).toBe(true);
    });

    it('not equal', () => {
      expect(shallowEqual(1, 2)).toBe(false);
      expect(shallowEqual(0, -0)).toBe(false);
    });
  });

  describe('objects', () => {
    it('equal', () => {
      expect(shallowEqual({a: '1', b: '2'}, {a: '1', b: '2'})).toBe(true);
    });

    it('not equal', () => {
      expect(shallowEqual({a: '1', b: '2'}, {a: '1', b: '1'})).toBe(false);
      expect(shallowEqual({a: '1', b: '2', c: '3'}, {a: '1', b: '2'})).toBe(
        false
      );
    });
  });
});
