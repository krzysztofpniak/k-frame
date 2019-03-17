const mergeProps = propName => props => ({
  ...props,
  ...props[propName],
  [propName]: null,
});

export default mergeProps;
