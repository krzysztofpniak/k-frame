import {oMap} from '../../src/micro-rx/index';

describe('micro-rx', () => {
  describe('oMap', () => {
    it('should map events', () => {
      let subject = null;
      const observable = {
        subscribe: jest.fn(o => {
          subject = o;
        }),
      };
      const subscription = jest.fn();
      oMap(e => `Hi ${e}`, observable).subscribe(subscription);

      subject.next(1);
      subject.next(2);
      subject.next(3);

      expect(subscription).toHaveBeenCalledTimes(3);
      expect(subscription).toHaveBeenNthCalledWith(1, 'Hi 1');
      expect(subscription).toHaveBeenNthCalledWith(2, 'Hi 2');
      expect(subscription).toHaveBeenNthCalledWith(3, 'Hi 3');
    });
  });
});
