import {required, regex} from '../src/validators';

describe('validators', () => {
  describe('required', () => {
    it('should return message on empties', () => {
      expect(required()(null)).toBe('This field is required');
      expect(required()('')).toBe('This field is required');
      expect(required()([])).toBe('This field is required');
    });

    it('should return empty string on not empties', () => {
      expect(required()('a')).toBe('');
      expect(required()([1])).toBe('');
    });
  });

  describe('regex', () => {
    it('should return message when not matching', () => {
      expect(regex(/^[0-9]+$/, 'Must be a number in 1-9 range')('a')).toBe(
        'Must be a number in 1-9 range'
      );
    });
  });
});
