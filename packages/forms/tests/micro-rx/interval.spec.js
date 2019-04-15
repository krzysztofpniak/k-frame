import {interval} from '../../src/micro-rx/index';

jest.useFakeTimers();

describe('micro-rx', () => {
  describe('interval', () => {
    it('should emit every interval until unsubscribed', () => {
      const subscription = jest.fn();
      const unsubscribe = interval(1000).subscribe(subscription);
      jest.advanceTimersByTime(3000);
      unsubscribe();
      jest.advanceTimersByTime(2000);

      expect(subscription).toHaveBeenCalledTimes(3);
      expect(subscription).toHaveBeenNthCalledWith(1, 0);
      expect(subscription).toHaveBeenNthCalledWith(2, 1);
      expect(subscription).toHaveBeenNthCalledWith(3, 2);
    });
  });
});
