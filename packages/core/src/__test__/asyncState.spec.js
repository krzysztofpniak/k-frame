import {AsyncState} from '../asyncState';
import sanctuary from 'sanctuary';
import {identity, map} from 'ramda';
const S = sanctuary.create({
  checkTypes: true,
  env: sanctuary.env,
});

describe('asyncState', () => {
  describe('setoid', () => {
    it('should return true', () => {
      expect(AsyncState.Created).toFLEqual(AsyncState.Created);
      expect(AsyncState.Running({})).toFLEqual(
        AsyncState.Running({started: 10})
      );
      expect(
        AsyncState.Completed({a: 1}, {started: 10, stopped: 20})
      ).toFLEqual(AsyncState.Completed({a: 1}, {}));
      expect(AsyncState.Faulted({message: 'failed'}, {x: 1})).toFLEqual(
        AsyncState.Faulted({message: 'failed'}, {y: 2})
      );
    });
  });

  describe('functor', () => {
    it('should return true', () => {
      expect(AsyncState.Created |> map(a => a + '!')).toFLEqual(
        AsyncState.Created
      );
      expect(AsyncState.Running({}) |> map(a => a + '!')).toFLEqual(
        AsyncState.Running({started: 10})
      );
      expect(
        AsyncState.Completed('Hello', {started: 10, stopped: 20})
          |> map(a => a + '!')
      ).toFLEqual(AsyncState.Completed('Hello!', {}));
      expect(
        AsyncState.Faulted({message: 'failed'}, {x: 1}) |> map(a => a + '!')
      ).toFLEqual(AsyncState.Faulted({message: 'failed'}, {y: 2}));
    });
  });

  describe('apply', () => {
    it('should work with left Created', () => {
      expect(S.ap(AsyncState.Created)(AsyncState.Created)).toFLEqual(
        AsyncState.Created
      );
      expect(S.ap(AsyncState.Created)(AsyncState.Running({}))).toFLEqual(
        AsyncState.Running({})
      );
      expect(
        S.ap(AsyncState.Created)(AsyncState.Completed('some result', {}))
      ).toFLEqual(AsyncState.Created);
      expect(
        S.ap(AsyncState.Created)(AsyncState.Faulted('some reason', {}))
      ).toFLEqual(AsyncState.Faulted('some reason', {}));
    });

    it('should work with left Running', () => {
      expect(S.ap(AsyncState.Running({}))(AsyncState.Created)).toFLEqual(
        AsyncState.Running({})
      );
      expect(S.ap(AsyncState.Running({}))(AsyncState.Running({}))).toFLEqual(
        AsyncState.Running({})
      );
      expect(
        S.ap(AsyncState.Running({}))(AsyncState.Completed('some result', {}))
      ).toFLEqual(AsyncState.Running({}));
      expect(
        S.ap(AsyncState.Running({}))(AsyncState.Faulted('some reason', {}))
      ).toFLEqual(AsyncState.Faulted('some reason', {}));
    });

    it('should work with left Completed', () => {
      expect(
        S.ap(AsyncState.Completed(x => x + '!', {}))(AsyncState.Created)
      ).toFLEqual(AsyncState.Created);
      expect(
        S.ap(AsyncState.Completed(x => x + '!', {}))(AsyncState.Running({}))
      ).toFLEqual(AsyncState.Running({}));
      expect(
        S.ap(AsyncState.Completed(x => x + '!', {}))(
          AsyncState.Completed('some result', {})
        )
      ).toFLEqual(AsyncState.Completed('some result!', {}));
      expect(
        S.ap(AsyncState.Completed(x => x + '!', {}))(
          AsyncState.Faulted('some reason', {})
        )
      ).toFLEqual(AsyncState.Faulted('some reason', {}));
    });

    it('should work with left Faulted', () => {
      expect(
        S.ap(AsyncState.Faulted('some reason', {}))(AsyncState.Created)
      ).toFLEqual(AsyncState.Faulted('some reason', {}));
      expect(
        S.ap(AsyncState.Faulted('some reason', {}))(AsyncState.Running({}))
      ).toFLEqual(AsyncState.Faulted('some reason', {}));
      expect(
        S.ap(AsyncState.Faulted('some reason', {}))(
          AsyncState.Completed('some result', {})
        )
      ).toFLEqual(AsyncState.Faulted('some reason', {}));
      expect(
        S.ap(AsyncState.Faulted('some reason', {}))(
          AsyncState.Faulted('some reason 2', {})
        )
      ).toFLEqual(AsyncState.Faulted('some reason', {}));
    });
  });

  describe('chain', () => {
    it('should work with left Created', () => {
      expect(S.chain(() => AsyncState.Created)(AsyncState.Created)).toFLEqual(
        AsyncState.Created
      );
      expect(
        S.chain(() => AsyncState.Created)(AsyncState.Running({}))
      ).toFLEqual(AsyncState.Running({}));
      expect(
        S.chain(() => AsyncState.Created)(
          AsyncState.Completed('some result', {})
        )
      ).toFLEqual(AsyncState.Created);
      expect(
        S.chain(() => AsyncState.Created)(AsyncState.Faulted('some reason', {}))
      ).toFLEqual(AsyncState.Faulted('some reason', {}));
    });

    it('should work with left Running', () => {
      expect(
        S.chain(() => AsyncState.Running({}))(AsyncState.Created)
      ).toFLEqual(AsyncState.Created);
      expect(
        S.chain(() => AsyncState.Running({}))(AsyncState.Running({}))
      ).toFLEqual(AsyncState.Running({}));
      expect(
        S.chain(() => AsyncState.Running({}))(
          AsyncState.Completed('some result', {})
        )
      ).toFLEqual(AsyncState.Running({}));
      expect(
        S.chain(() => AsyncState.Running({}))(
          AsyncState.Faulted('some reason', {})
        )
      ).toFLEqual(AsyncState.Faulted('some reason', {}));
    });

    it('should work with left Completed', () => {
      expect(
        S.chain(() => AsyncState.Completed('!', {}))(AsyncState.Created)
      ).toFLEqual(AsyncState.Created);
      expect(
        S.chain(() => AsyncState.Completed('!', {}))(AsyncState.Running({}))
      ).toFLEqual(AsyncState.Running({}));
      expect(
        S.chain(x => AsyncState.Completed(x + '!', {}))(
          AsyncState.Completed('some result', {})
        )
      ).toFLEqual(AsyncState.Completed('some result!', {}));
      expect(
        S.chain(() => AsyncState.Completed('!', {}))(
          AsyncState.Faulted('some reason', {})
        )
      ).toFLEqual(AsyncState.Faulted('some reason', {}));
    });

    it('should work with left Faulted', () => {
      expect(
        S.chain(() => AsyncState.Faulted('some reason', {}))(AsyncState.Created)
      ).toFLEqual(AsyncState.Created);
      expect(
        S.chain(() => AsyncState.Faulted('some reason', {}))(
          AsyncState.Running({})
        )
      ).toFLEqual(AsyncState.Running({}));
      expect(
        S.chain(() => AsyncState.Faulted('some reason', {}))(
          AsyncState.Completed('some result', {})
        )
      ).toFLEqual(AsyncState.Faulted('some reason', {}));
      expect(
        S.chain(() => AsyncState.Faulted('some reason 2', {}))(
          AsyncState.Faulted('some reason', {})
        )
      ).toFLEqual(AsyncState.Faulted('some reason', {}));
    });
  });

  describe('traversable', () => {
    it('should return true', () => {
      const x = S.unchecked.traverse(AsyncState)(identity)([
        AsyncState.Created,
        AsyncState.Completed('result 1', {}),
      ]);

      const x2 = S.unchecked.traverse(Function)(identity)(AsyncState.Created);

      const y = S.unchecked.traverse(AsyncState)(identity)([
        AsyncState.Running({}),
        AsyncState.Created,
        AsyncState.Completed('result 1', {}),
      ]);

      const z = S.unchecked.traverse(AsyncState)(identity)([
        AsyncState.Completed('result 2', {}),
        AsyncState.Completed('result 1', {}),
      ]);

      expect(y).toFLEqual(AsyncState.Running({}));
    });
  });

  describe('alt', () => {
    it('should work with left Created', () => {
      expect(S.alt(AsyncState.Created)(AsyncState.Created)).toFLEqual(
        AsyncState.Created
      );
      expect(S.alt(AsyncState.Created)(AsyncState.Running({}))).toFLEqual(
        AsyncState.Running({})
      );
      expect(
        S.alt(AsyncState.Created)(AsyncState.Completed('some result', {}))
      ).toFLEqual(AsyncState.Completed('some result', {}));
      expect(
        S.alt(AsyncState.Created)(AsyncState.Faulted('some reason', {}))
      ).toFLEqual(AsyncState.Created);
    });

    it('should work with left Running', () => {
      expect(S.alt(AsyncState.Running({}))(AsyncState.Created)).toFLEqual(
        AsyncState.Running({})
      );
      expect(S.alt(AsyncState.Running({}))(AsyncState.Running({}))).toFLEqual(
        AsyncState.Running({})
      );
      expect(
        S.alt(AsyncState.Running({}))(AsyncState.Completed('some result', {}))
      ).toFLEqual(AsyncState.Completed('some result', {}));
      expect(
        S.alt(AsyncState.Running({}))(AsyncState.Faulted('some reason', {}))
      ).toFLEqual(AsyncState.Running({}));
    });

    it('should work with left Completed', () => {
      expect(
        S.alt(AsyncState.Completed('some result', {}))(AsyncState.Created)
      ).toFLEqual(AsyncState.Completed('some result', {}));
      expect(
        S.alt(AsyncState.Completed('some result', {}))(AsyncState.Running({}))
      ).toFLEqual(AsyncState.Completed('some result', {}));
      expect(
        S.alt(AsyncState.Completed('some result 1 ', {}))(
          AsyncState.Completed('some result 2', {})
        )
      ).toFLEqual(AsyncState.Completed('some result 2', {}));
      expect(
        S.alt(AsyncState.Completed('some result', {}))(
          AsyncState.Faulted('some reason', {})
        )
      ).toFLEqual(AsyncState.Completed('some result', {}));
    });

    it('should work with left Faulted', () => {
      expect(
        S.alt(AsyncState.Faulted('some reason', {}))(AsyncState.Created)
      ).toFLEqual(AsyncState.Created);
      expect(
        S.alt(AsyncState.Faulted('some reason', {}))(AsyncState.Running({}))
      ).toFLEqual(AsyncState.Running({}));
      expect(
        S.alt(AsyncState.Faulted('some reason', {}))(
          AsyncState.Completed('some result', {})
        )
      ).toFLEqual(AsyncState.Completed('some result', {}));
      expect(
        S.alt(AsyncState.Faulted('some reason', {}))(
          AsyncState.Faulted('some reason 2', {})
        )
      ).toFLEqual(AsyncState.Faulted('some reason', {}));
    });
  });
});
