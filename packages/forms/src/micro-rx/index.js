import {equals} from 'ramda';

const Observable = subscribe => {
  const s = observer =>
    subscribe(typeof observer === 'function' ? {next: observer} : observer);

  return {
    subscribe: s,
  };
};

const interval = period => {
  let i = 0;
  let timer;
  return Observable(observer => {
    timer = setInterval(() => observer.next(i++), period);
    return () => {
      clearInterval(timer);
    };
  });
};

const oFilter = (predicate, observable) =>
  Observable(observer =>
    observable.subscribe({
      next: data => predicate(data) && observer.next(data),
    })
  );

const oMap = (predicate, observable) =>
  Observable(observer =>
    observable.subscribe({next: data => observer.next(predicate(data))})
  );

const oScan = (accumulator, seed, observable) =>
  Observable(observer =>
    observable.subscribe({
      next: data => observer.next((seed = accumulator(seed, data))),
    })
  );

const combineLatest = (...observables) => {
  const latest = observables.map(() => null);
  return Observable(observer => {
    const unsubscribes = [];
    for (let i = 0; i < observables.length; i++) {
      unsubscribes.push(
        observables[i].subscribe({
          next: data => {
            latest[i] = data;
            observer.next(latest);
          },
        })
      );
    }
    return () => {
      for (let i = 0; i < unsubscribes.length; i++) {
        unsubscribes[i]();
      }
    };
  });
};

const share = observable => {
  const listeners = [];

  const unsubscribe = observable.subscribe({
    next: data => {
      for (let i = 0; i < listeners.length; i++) {
        listeners[i](data);
      }
    },
  });

  return Observable(observer => {
    listeners.push(observer.next);
    return () => {
      const idx = listeners.indexOf(observer.next);
      listeners.splice(idx, 1);
      if (listeners.length === 0) {
        unsubscribe();
      }
    };
  });
};

const distinctUntilChanged = observable =>
  Observable(observer => {
    let prev = null;
    return observable.subscribe({
      next: data => {
        if (!equals(data, prev)) {
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
