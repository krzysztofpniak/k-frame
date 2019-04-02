const fieldTouchedStrategy = ({submitRequested, touched}) =>
  touched || submitRequested;

const onSubmitStrategy = ({submitRequested}) => submitRequested;

const fieldDirtyStrategy = ({submitRequested, dirty}) =>
  dirty || submitRequested;

const alwaysStrategy = () => true;

export {
  fieldDirtyStrategy,
  fieldTouchedStrategy,
  onSubmitStrategy,
  alwaysStrategy,
};
