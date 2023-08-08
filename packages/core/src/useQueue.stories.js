import React, {useEffect, useRef, useState} from 'react';
import useScheduler from './useScheduler';
import {after, encase} from 'fluture';
import {assoc, chain, evolve, pluck, propOr} from 'ramda';

const InputDebouncer = ({scheduler, id, value, onChange}) => {
  const [internalValue, setInternalValue] = useState(value);
  const cancelRef = useRef();

  useEffect(() => {
    if (cancelRef.current) {
      cancelRef.current();
    }
    setInternalValue(value);
  }, [value]);

  const handleChange = e => {
    setInternalValue(e.target.value);
    cancelRef.current = scheduler.enqueueLabeled({
      key: id,
      label: `change ${id} to: ${e.target.value}`,
    })(after(2000)(e.target.value) |> chain(encase(onChange)));
  };

  return <input value={internalValue} onChange={handleChange} />;
};

const UseSchedulerTester = () => {
  const scheduler = useScheduler();
  const [result, setResult] = useState({name: '', age: ''});

  return (
    <div>
      <div>UseQueueTester</div>
      <InputDebouncer
        scheduler={scheduler}
        id="name"
        value={result.name}
        onChange={v => setResult(assoc('name', v))}
      />
      <InputDebouncer
        scheduler={scheduler}
        id="age"
        value={result.age}
        onChange={v => setResult(assoc('age', v))}
      />
      <button
        type="button"
        onClick={() =>
          setResult(evolve({name: x => x + '!', age: x => x + '!'}))
        }
      >
        Reset
      </button>
      <pre>{JSON.stringify(result, null, 2)}</pre>
      <pre>{JSON.stringify(scheduler.pending, null, 2)}</pre>
      <pre>
        {JSON.stringify(scheduler.running |> propOr('', 'label'), null, 2)}
      </pre>
      <pre>{JSON.stringify(scheduler.queue |> pluck('label'), null, 2)}</pre>
    </div>
  );
};
export default {
  title: 'useScheduler',
  component: UseSchedulerTester,
};

export const Basic = {};
