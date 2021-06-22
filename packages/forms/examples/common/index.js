import React, {useCallback} from 'react';
import {fork} from 'fluture';

const FormTemplate = ({buttons, fields}) => (
  <form>
    <div
      style={{
        border: `2px solid gray`,
        borderRadius: '5px',
        padding: '10px',
      }}
    >
      {fields.default}
      {buttons}
    </div>
  </form>
);

const fontFamily = 'Arial, Helvetica';

const Row = ({input, title, error, errorPending, pending}) => (
  <div style={{margin: '10px 0'}}>
    <div style={{fontFamily}}>{title}</div>
    {pending ? <div style={{fontFamily}}>Loading ...</div> : <div>{input}</div>}
    <div
      style={{color: 'red', fontFamily}}
      className={errorPending && 'opacity-transition'}
    >
      {error}
    </div>
  </div>
);

const useSubmitAlert = () =>
  useCallback((defaultSubmitFuture, fields) => {
    defaultSubmitFuture
      |> fork(errors => alert(JSON.stringify(errors, null, 2)))(() =>
        alert(JSON.stringify(fields, null, 2))
      );
  }, []);

export {FormTemplate, Row, useSubmitAlert};
