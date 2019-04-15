import {oFilter} from '../../src/micro-rx/index';

describe('micro-rx', () => {
  describe('oFilter', () => {
    it('should filter events', () => {
      let subject = null;
      const observable = {
        subscribe: jest.fn(o => {
          subject = o;
        }),
      };
      const subscription = jest.fn();
      oFilter(e => e % 2 === 0, observable).subscribe(subscription);

      subject.next(1);
      subject.next(2);
      subject.next(3);

      expect(subscription).toHaveBeenCalledTimes(1);
      expect(subscription).toHaveBeenNthCalledWith(1, 2);
    });
  });
});
