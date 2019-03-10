import {bindActionCreators} from '../src/main';
import {counterActionInc, counterActionIncBy} from './testData';

describe('bindActionCreators', () => {
  describe('binds', () => {
    it('simple function', () => {
      const dispatch = jest.fn();
      const boundFn = bindActionCreators(counterActionInc, dispatch);
      const rawActionResult = counterActionInc();

      boundFn();

      expect(dispatch.mock.calls.length).toBe(1);
      expect(dispatch.mock.calls[0][0]).toEqual(rawActionResult);
    });

    it('object', () => {
      const dispatch = jest.fn();
      const {inc, incBy} = bindActionCreators(
        {inc: counterActionInc, incBy: counterActionIncBy, n: 1},
        dispatch
      );
      const incActionResult = counterActionInc();
      const incByActionResult = counterActionIncBy(10);

      inc();
      incBy(10);

      expect(dispatch.mock.calls.length).toBe(2);
      expect(dispatch.mock.calls[0][0]).toEqual(incActionResult);
      expect(dispatch.mock.calls[1][0]).toEqual(incByActionResult);
    });
  });

  describe('throws', () => {
    it('when first param is number', () => {
      const dispatch = jest.fn();
      expect(() => {
        bindActionCreators(1, dispatch);
      }).toThrow();
    });

    it('when first param is null', () => {
      const dispatch = jest.fn();
      expect(() => {
        bindActionCreators(null, dispatch);
      }).toThrow();
    });
  });
});
