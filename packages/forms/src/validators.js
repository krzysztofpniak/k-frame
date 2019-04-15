const required = () => value =>
  (value || '').length === 0 ? 'This field is required' : '';
const regex = (regex, message) => value => (!regex.test(value) ? message : '');

export {required, regex};
