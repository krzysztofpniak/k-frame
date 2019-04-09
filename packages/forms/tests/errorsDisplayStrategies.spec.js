import {
  fieldTouchedStrategy,
  alwaysStrategy,
  onSubmitStrategy,
  fieldDirtyStrategy,
} from '../src/errorsDisplayStrategies';

describe('errorsDisplayStrategies', () => {
  describe('fieldTouchedStrategy', () => {
    it('should return true when touched or submitRequested', () => {
      expect(
        fieldTouchedStrategy({touched: true, submitRequested: false})
      ).toBe(true);
      expect(
        fieldTouchedStrategy({touched: false, submitRequested: true})
      ).toBe(true);
      expect(fieldTouchedStrategy({touched: true, submitRequested: true})).toBe(
        true
      );
    });
    it('should return true when not touched and not submitRequested', () => {
      expect(
        fieldTouchedStrategy({touched: false, submitRequested: false})
      ).toBe(false);
    });
  });
  describe('alwaysStrategy', () => {
    it('should always return true', () => {
      expect(alwaysStrategy({touched: false, submitRequested: false})).toBe(
        true
      );
    });
  });
  describe('onSubmitStrategy', () => {
    it('should return true when submitRequested', () => {
      expect(onSubmitStrategy({touched: false, submitRequested: true})).toBe(
        true
      );
    });
    it('should return false when not submitRequested', () => {
      expect(onSubmitStrategy({submitRequested: false})).toBe(false);
    });
  });
  describe('fieldDirtyStrategy', () => {
    it('should return true when dirty or submitRequested', () => {
      expect(fieldDirtyStrategy({dirty: true, submitRequested: false})).toBe(
        true
      );
      expect(fieldDirtyStrategy({dirty: false, submitRequested: true})).toBe(
        true
      );
      expect(fieldDirtyStrategy({dirty: true, submitRequested: true})).toBe(
        true
      );
    });
    it('should return false when not dirty and not submitRequested', () => {
      expect(fieldDirtyStrategy({dirty: false, submitRequested: false})).toBe(
        false
      );
    });
  });
});
