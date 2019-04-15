import {useCallback} from 'react';

const useInputTargetValue = fn => useCallback(e => fn(e.target.value), [fn]);

export default useInputTargetValue;
