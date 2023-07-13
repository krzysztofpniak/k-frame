import fc from 'fast-check';
import {act, renderHook, cleanup} from '@testing-library/react';
import useDebounceValue from './useDebounceValue';
import {promise} from 'fluture';

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

describe('useDebounceValue', () => {
  it('', async () => {
    await fc.assert(
      fc
        .asyncProperty(
          fc.scheduler({act}).map(withTimers),
          fc.string({minLength: 1}),
          async (s, text) => {
            jest.useFakeTimers();

            const queue = [];

            const scheduler = {
              enqueueLabeled: z => {
                queue.push(z.future);
              },
              enqueue: z => {
                queue.push(z);
              },
            };

            const onChange = jest.fn();

            const {result, rerender} = renderHook(
              ({value}) => useDebounceValue({value, scheduler, onChange}),
              {
                initialProps: {value: 'd'},
              }
            );

            const zz = text.split('').map((c, idx) => ({
              label: `Typing "${c}"`,
              builder: async () => {
                rerender({value: text.slice(0, idx + 1), scheduler});
                console.log('q', text, idx, text.slice(0, idx));
              },
            }));

            s.scheduleSequence(zz);

            await s.waitAll();

            s.scheduleSequence(
              queue.map((e, idx) => ({
                label: `s${idx}`,
                builder: () => e |> promise,
              }))
            );

            await s.waitAll();

            console.log(result, zz.length, queue.length);

            expect(result.current[0]).toEqual(text);
            expect(queue.length).toEqual(0);
            expect(onChange).toHaveBeenCalledTimes(0);
          }
        )
        .beforeEach(async () => {
          jest.clearAllTimers();
          jest.resetAllMocks();
          await cleanup();
        }),
      {numRuns: 1}
    );
  });
});
