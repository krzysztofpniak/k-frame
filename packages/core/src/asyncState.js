import daggy from 'daggy';
import {always, equals, identity, tap, map, F, T} from 'ramda';
import of from './of';

const defaultDate = new Date(0);

const AsyncState = daggy.taggedSum('AsyncState', {
  Created: [], //Created
  Running: ['meta'], //Running {started: timestamp}
  Completed: ['result', 'meta'], //Completed {started: timestamp, finshed: timestamp}
  Faulted: ['reason', 'meta'], //Faulted {started: timestamp, finshed: timestamp}
});

AsyncState.prototype['@@show'] = function(other) {
  return this.cata({
    Created: () => 'Created',
    Running: () => 'Running',
    Completed: (result, meta) => `Completed(${result |> JSON.stringify}`,
    Faulted: (reason, meta) => `Faulted(${result |> JSON.stringify}`,
  });
};

AsyncState.prototype['fantasy-land/equals'] = function(other) {
  return this.cata({
    Created: () => AsyncState.Created.is(other),
    Running: () => AsyncState.Running.is(other),
    Completed: (result, meta) =>
      AsyncState.Completed.is(other) && equals(result, other.result),
    Faulted: (reason, meta) =>
      AsyncState.Faulted.is(other) && equals(reason, other.reason),
  });
};

AsyncState.prototype['fantasy-land/map'] = function(f) {
  return this.cata({
    Created: () => this,
    Running: meta => this,
    Completed: (result, meta) => AsyncState.Completed(result |> f, meta),
    Faulted: (reason, meta) => this,
  });
};

AsyncState.prototype['fantasy-land/reduce'] = function(f, x) {
  return this.cata({
    Created: () => x,
    Running: meta => x,
    Completed: (result, meta) => f(x, result),
    Faulted: (reason, meta) => x,
  });
};

AsyncState.prototype['fantasy-land/ap'] = function(other) {
  return this.cata({
    Created: () =>
      other.cata({
        Created: () => this,
        Running: () => other,
        Completed: () => this,
        Faulted: () => other,
      }),
    Running: meta =>
      other.cata({
        Created: () => this,
        Running: () => other,
        Completed: () => this,
        Faulted: () => other,
      }),
    Completed: (result, meta) =>
      other.cata({
        Created: () => other,
        Running: () => other,
        Completed: () => AsyncState.Completed(other.result(result), {}),
        Faulted: () => other,
      }),
    Faulted: (reason, meta) =>
      other.cata({
        Created: () => this,
        Running: () => this,
        Completed: () => this,
        Faulted: () => other,
      }),
  });
};

AsyncState.prototype['fantasy-land/chain'] = function(fn) {
  return this.cata({
    Created: () => this,
    Running: () => this,
    Completed: result => fn(result),
    Faulted: () => this,
  });
};

AsyncState['fantasy-land/of'] = function(value) {
  return AsyncState.Completed(value, {
    started: defaultDate,
    finished: defaultDate,
  });
};

AsyncState.prototype['fantasy-land/traverse'] = function(typeRep, f) {
  return this.cata({
    Created: () => of(typeRep)(this),
    Running: meta => of(typeRep)(this),
    Completed: (result, meta) =>
      f(result) |> tap(x => x) |> map(x => AsyncState.Completed(x, meta)),
    Faulted: (reason, meta) => of(typeRep)(this),
  });
};

const fromAsyncState = defaultValue => asyncState =>
  asyncState.cata({
    Created: always(defaultValue),
    Running: always(defaultValue),
    Completed: identity,
    Faulted: always(defaultValue),
  });

const isAsyncStateCreated = asyncState =>
  asyncState.cata({
    Created: T,
    Running: F,
    Completed: F,
    Faulted: F,
  });

const isAsyncStateRunning = asyncState =>
  asyncState.cata({
    Created: F,
    Running: T,
    Completed: F,
    Faulted: F,
  });

const isAsyncStateCompleted = asyncState =>
  asyncState.cata({
    Created: F,
    Running: F,
    Completed: T,
    Faulted: F,
  });

const isAsyncStateFaulted = asyncState =>
  asyncState.cata({
    Created: F,
    Running: F,
    Completed: F,
    Faulted: T,
  });

export {
  AsyncState,
  fromAsyncState,
  isAsyncStateCreated,
  isAsyncStateRunning,
  isAsyncStateCompleted,
  isAsyncStateFaulted,
};
