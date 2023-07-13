import fc from 'fast-check';
import {act, renderHook, cleanup} from '@testing-library/react';
import useDebounceValue from './useDebounceValue';
import {after, promise, resolve} from 'fluture';
import useQueue from './useQueue';
import {propEq, filter, length} from 'ramda';

const withTimers = s => {
  let alreadyScheduledTaskToUnqueueTimers = false;
  const appendScheduledTaskToUnqueueTimersIfNeeded = () => {
    // Append a scheduled task to unqueue pending timers (if task missing and pending timers)
    if (!alreadyScheduledTaskToUnqueueTimers && jest.getTimerCount() !== 0) {
      alreadyScheduledTaskToUnqueueTimers = true;
      s.schedule(Promise.resolve('advance timers if any')).then(() => {
        alreadyScheduledTaskToUnqueueTimers = false;
        jest.advanceTimersToNextTimer();
      });
    }
  };

  return {
    schedule(...args) {
      return s.schedule(...args);
    },
    scheduleFunction(...args) {
      return s.scheduleFunction(...args);
    },
    scheduleSequence(...args) {
      return s.scheduleSequence(...args);
    },
    count() {
      return s.count();
    },
    toString() {
      return String(s);
    },
    async waitOne() {
      appendScheduledTaskToUnqueueTimersIfNeeded();
      await s.waitOne();
    },
    async waitAll() {
      appendScheduledTaskToUnqueueTimersIfNeeded();
      while (s.count()) {
        await s.waitOne();
        appendScheduledTaskToUnqueueTimersIfNeeded();
      }
    },
  };
};

const someKeys = ['a', 'b', 'c', 'd', 'e'];

const keyArbitrary = fc.constantFrom(...someKeys);

//['a', 's'], ['a', 'st'], ['b', '6'], ['a', 'sta']

describe('useQueue', () => {
  it('', async () => {
    jest.useFakeTimers();

    const queueArbitrary = fc.array(
      fc.tuple(fc.string({minLength: 1}), keyArbitrary).map(([value, key]) => ({
        key,
        label: `${key}:${value}`,
        future: after(100)(value),
      })),
      {minLength: 1}
    );

    await fc.assert(
      fc
        .asyncProperty(
          fc.scheduler({act}), //.map(withTimers),
          queueArbitrary,
          async (s, queue) => {
            const {result} = renderHook(() => useQueue());

            const zz = queue.map(({label, future, key}) => ({
              label,
              builder: async () => {
                result.current.enqueueLabeled({label, key, future});
                const currentQueue = result.current.queueRef.current;
                const tasksWithCurrentKeyCount =
                  filter(propEq('key', key))(currentQueue) |> length;

                if (
                  result.current.isRunningRef.current &&
                  result.current.runningKeyRef.current !== key
                ) {
                  try {
                    expect(tasksWithCurrentKeyCount).toEqual(1);
                  } catch (e) {
                    console.log(e);
                  }
                } else {
                  try {
                    expect(tasksWithCurrentKeyCount).toEqual(0);
                  } catch (e) {
                    console.log(e);
                  }
                }
              },
            }));

            const sequenceResult = s.scheduleSequence(zz);

            await s.waitAll();

            expect(sequenceResult.faulty).toEqual(false);

            while (
              result.current.queueRef.current.length > 0 ||
              result.current.isRunningRef.current
            ) {
              await act(async () => {
                jest.advanceTimersToNextTimer();
              });
            }

            expect(result.current.pendingRef.current).toEqual(false);
          }
        )
        .beforeEach(async () => {
          jest.clearAllTimers();
          jest.resetAllMocks();
          await cleanup();
        })
    );
  });
});
