import React, {useCallback, useEffect, useState} from "react";
import {map} from "ramda";
import S_ from 'sanctuary';

const S = S_.create({
  checkTypes: false,
  env: [],
});

export const Input = (({value, onChange}) => {
  const [internal, setInternal] = useState(
    '0' //() => value |> map(x => '' + x) |> S.fromRight('')
  );

  const handleChange = useCallback(
    e => {
      setInternal(e.target.value);

      S.parseInt(10)(e.target.value)
        |> S.maybeToEither('Expecting an integer')
        |> onChange;
    },
    [onChange]
  );

  useEffect(() => {
    if (S.isRight(value)) {
      value |> map(x => '' + x) |> S.fromRight('') |> setInternal;
    }
  }, [value]);

  return <input value={internal} onChange={handleChange}/>;
});
