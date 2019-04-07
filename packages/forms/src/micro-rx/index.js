import {shallowEqual} from '@k-frame/core';

const Observable = subscribe => {
  const s = observer => {
    subscribe(typeof observer === 'function' ? {next: observer} : observer);
  };

  return {
    subscribe: s,
  };
};

const interval = period => {
  let i = 0;
  return Observable(observer => {
    setInterval(() => observer.next(i++), period);
  });
};

const oFilter = (predicate, observable) =>
  Observable(observer => {
    observable.subscribe({
      next: data => predicate(data) && observer.next(data),
    });
  });

const oMap = (predicate, observable) =>
  Observable(observer => {
    observable.subscribe({next: data => observer.next(predicate(data))});
  });

const oScan = (accumulator, seed) =>
  Observable(observer => {
    observable.subscribe({
      next: data => observer.next((seed = accumulator(seed, data))),
    });
  });

const combineLatest = (...observables) => {
  const latest = observables.map(() => null);
  return Observable(observer => {
    for (let i = 0; i < observables.length; i++) {
      observables[i].subscribe({
        next: data => {
          latest[i] = data;
          observer.next(latest);
        },
      });
    }
  });
};

const share = observable => {
  const listeners = [];

  observable.subscribe({
    next: data => {
      for (let i = 0; i < listeners.length; i++) {
        listeners[i](data);
      }
    },
  });

  return Observable(observer => listeners.push(observer.next));
};

const distinctUntilChanged = observable =>
  Observable(observer => {
    let prev = null;
    observable.subscribe({
      next: data => {
        if (!shallowEqual(data, prev)) {
          observer.next(data);
          prev = data;
        }
      },
    });
  });

export {
  Observable,
  interval,
  oFilter,
  oMap,
  oScan,
  combineLatest,
  share,
  distinctUntilChanged,
};
