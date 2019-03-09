import {
  compose,
  identity,
  keys,
  lensPath,
  lensProp,
  mapObjIndexed,
  mergeRight,
  reduce,
  set,
  uncurryN,
} from 'ramda';

const asyncActionRegexp = new RegExp(`^async/(.+)/(.+)$`);

const getStageLens = (modelDef, resource, stage, dataProp) => {
  const defaultLens = compose(
    lensProp(dataProp),
    lensPath([resource, stage])
  );
  return modelDef[resource] && modelDef[resource][stage]
    ? modelDef[resource][stage]
    : defaultLens;
};

const buildModelLenses = (modelDef, options) => {
  const dataProp = options.dataProp || 'data';
  return mapObjIndexed(
    (def, resource) => ({
      pending: getStageLens(modelDef, resource, 'pending', dataProp),
      result: getStageLens(modelDef, resource, 'result', dataProp),
      error: getStageLens(modelDef, resource, 'error', dataProp),
    }),
    modelDef
  );
};

const initModelField = (fieldLens, defaultValue, target) =>
  compose(
    set(fieldLens.result, defaultValue),
    set(fieldLens.pending, false),
    set(fieldLens.error, null)
  )(target);

const initModel = (modelDef, modelLenses, target) =>
  reduce(
    (a, c) =>
      mergeRight(
        a,
        initModelField(modelLenses[c], modelDef[c].defaultValue || null, a)
      ),
    target,
    keys(modelDef)
  );

const handleAsyncs = (modelDef, options = {}) => {
  const modelLenses = buildModelLenses(modelDef, options);

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
          `you dispatched async action without registering async handler. Please register a handler using handleAsyncs function.`
        );
        return;
      }

      const resultTransform = modelDef[resource].resultTransform || identity;
      const errorTransform = modelDef[resource].errorTransform || identity;

      if (stage === 'request') {
        return set(modelLenses[resource].pending, true, model);
      } else if (stage === 'succeeded') {
        const m1 = set(modelLenses[resource].pending, false, model);
        return set(
          modelLenses[resource].result,
          uncurryN(2, resultTransform)(payload, model),
          m1
        );
      } else if (stage === 'failed') {
        const m1 = set(modelLenses[resource].pending, false, model);
        return set(
          modelLenses[resource].error,
          uncurryN(2, errorTransform)(payload, model),
          m1
        );
      }
    }

    return model;
  };
};

export default handleAsyncs;
