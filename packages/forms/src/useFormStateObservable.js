import {useEffect, useMemo, useRef} from 'react';
import {Observable} from './micro-rx';

const useFormStateObservable = (subscribe, getFormState) => {
  const observer = useRef({});

  useEffect(() => {
    let prevState = getFormState();
    observer.current.next(prevState);
    return subscribe(() => {
      const newState = getFormState();
      if (newState !== prevState) {
        observer.current.next(newState);
        prevState = newState;
      }
    });
  }, []);

  const observable = useMemo(
    () =>
      Observable(o => {
        observer.current = o;
        return () => {};
      }),
    []
  );

  return observable;
};

export default useFormStateObservable;
