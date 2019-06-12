import {
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
  reduce,
  set,
  toPairs,
  type,
  uncurryN,
} from 'ramda';

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
        initModelField(modelLenses[c], modelDef[c].defaultValue || null, a)
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
          `Async action has been dispatched without registering async handler. Please register a handler using handleAsyncs function.`
        );
        return model;
      }

      const resultTransform = modelDef[resource].resultTransform || identity;
      const errorTransform = modelDef[resource].errorTransform || identity;

      if (stage === 'request') {
        return modelLenses[resource].pending(true, model);
      } else if (stage === 'succeeded') {
        const m1 = modelLenses[resource].pending(false, model);
        return modelLenses[resource].result(
          uncurryN(2, resultTransform)(payload, model),
          m1
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
