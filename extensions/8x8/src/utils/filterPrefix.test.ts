import { addFilterKeyPrefix, isValidFilterField, removeFilterKeyPrefix } from './filterPrefix';

describe('customer node > filterPrefix', () => {
  describe('isValidFilterField', () => {
    it('should return true for filter$customFields', () => {
      expect(isValidFilterField('filter$customFields')).toBe(true);
    });

    it('should return true for filter$firstName', () => {
      expect(isValidFilterField('filter$lastName')).toBe(true);
    });

    it('should return false for firstName', () => {
      expect(isValidFilterField('firstName')).toBe(false);
    });
  });

  describe('removeFilterKeyPrefix', () => {
    it('should remove filter$ prefix', () => {
      expect(removeFilterKeyPrefix('filter$firstName')).toBe('firstName');
    });
  });

  describe('addFilterKeyPrefix', () => {
    it('should add filter$ prefix', () => {
      expect(addFilterKeyPrefix('firstName')).toBe('filter$firstName');
    });
  });
});
