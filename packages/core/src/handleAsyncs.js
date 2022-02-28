import {
  assocPath,
  compose,
  curry,
  equals,
  identity,
  ifElse,
  keys,
  lensPath,
  lensProp,
  mapObjIndexed,
  mergeRight,
  over,
  propEq,
  reduce,
  set,
  toPairs,
  type,
  uncurryN,
} from 'ramda';
import {AsyncState} from './asyncState';

const asyncActionRegexp = new RegExp(`^async/(.+)/(.+)$`);

const setObject = curry((lens, source, target) =>
  reduce(
    (p, [key, value]) => (lens[key] ? set(lens[key], value, p) : p),
    target,
    toPairs(source)
  )
);

const smartSet = ifElse(
  compose(
    equals('Object'),
    type
  ),
  setObject,
  set
);

const getStageSetter = (modelDef, resource, stage, dataProp) => {
  const defaultLens = compose(
    lensProp(dataProp),
    lensPath([resource, stage])
  );

  const stageLensProp = `${stage}Lens`;

  return smartSet(
    modelDef[resource] && modelDef[resource][stageLensProp]
      ? modelDef[resource][stageLensProp]
      : defaultLens
  );
};

const buildModelSetters = (modelDef, options) => {
  const dataProp = options.dataProp || 'data';
  return mapObjIndexed(
    (def, resource) => ({
      pending: getStageSetter(modelDef, resource, 'pending', dataProp),
      result: getStageSetter(modelDef, resource, 'result', dataProp),
      error: getStageSetter(modelDef, resource, 'error', dataProp),
      adt: lensPath([dataProp, resource]),
    }),
    modelDef
  );
};

const initModelField = (fieldLens, defaultValue, target) =>
  compose(
    fieldLens.result(defaultValue),
    fieldLens.pending(false),
    fieldLens.error(null)
  )(target);

const initModel = (modelDef, modelLenses, target) =>
  reduce(
    (a, c) =>
      mergeRight(
        a,
        modelDef[c] |> propEq('mode', 'adt')
          ? a |> assocPath(['data', c], AsyncState.Created)
          : initModelField(modelLenses[c], modelDef[c].defaultValue || null, a)
      ),
    target,
    keys(modelDef)
  );

const handleAsyncs = (modelDef, options = {}) => {
  const modelLenses = buildModelSetters(modelDef, options);

  return (model, {type, payload}) => {
    if (type === '@@INIT') {
      return initModel(modelDef, modelLenses, model);
    }

    const match = type.match(asyncActionRegexp);
    if (match) {
      const resource = match[1];
      const stage = match[2];

      if (!modelDef[resource]) {
        console.error(
          `Async action has been dispatched without registering async handler. Please register a handler for %c${resource}%c resource using handleAsyncs function.`,
          'font-weight: bold',
          'font-weight:normal'
        );
        return model;
      }

      const resultTransform = modelDef[resource].resultTransform || identity;
      const errorTransform = modelDef[resource].errorTransform || identity;
      const isAdtMode = modelDef[resource] |> propEq('mode', 'adt');

      if (isAdtMode && stage === 'request') {
        return set(
          modelLenses[resource].adt,
          AsyncState.Running({started: Date.now()}),
          model
        );
      } else if (isAdtMode && stage === 'succeeded') {
        return over(
          modelLenses[resource].adt,
          x =>
            AsyncState.Completed(payload, {
              started: x.meta.started,
              stopped: Date.now(),
            }),
          model
        );
      } else if (isAdtMode && stage === 'failed') {
        return over(
          modelLenses[resource].adt,
          x =>
            AsyncState.Faulted(payload, {
              started: x.meta.started,
              stopped: Date.now(),
            }),
          model
        );
      } else if (stage === 'request') {
        return modelLenses[resource].pending(true, model);
      } else if (stage === 'succeeded') {
        const m1 = modelLenses[resource].pending(false, model);
        return modelLenses[resource].result(
          uncurryN(2, resultTransform)(payload, model),
          m1
        );
      } else if (stage === 'chunk') {
        return modelLenses[resource].result(
          uncurryN(2, resultTransform)(payload, model),
          model
        );
      } else if (stage === 'failed') {
        const m1 = modelLenses[resource].pending(false, model);
        return modelLenses[resource].error(
          uncurryN(2, errorTransform)(payload, model),
          m1
        );
      }
    }

    return model;
  };
};

export default handleAsyncs;
