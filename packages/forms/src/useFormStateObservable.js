import {useEffect, useMemo, useRef} from 'react';
import {Observable} from './micro-rx/index';
import {equals} from 'ramda';

const useFormStateObservable = (subscribe, getFormState) => {
  const observer = useRef(null);

  const observable = useMemo(
    () =>
      Observable(o => {
        observer.current = o;
        return () => {};
      }),
    []
  );

  useEffect(() => {
    let prevState = getFormState();
    if (observer.current !== null) {
      observer.current.next(prevState);
    }
    return subscribe(() => {
      const newState = getFormState();
      if (!equals(newState, prevState)) {
        observer.current.next(newState);
        prevState = newState;
      }
    });
  }, []);

  return observable;
};

export default useFormStateObservable;
