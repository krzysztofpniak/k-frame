const required = value => (value || '').length === 0 ? 'This field is required' : '';
const minLength = min => value =>
    value && value.length < min ? `Must be at least ${min} characters` : '';
const maxLength = max => value =>
    value && value.length > max ? `Must be ${max} characters or less` : '';
const number = value => value && isNaN(Number(value)) ? 'Must be a number' : '';
const minValue = min => value =>
    value && value < min ? `Must be at least ${min}` : '';
const maxValue = max => value =>
    value && value > max ? `Must be at most ${max}` : '';
const repeatField = field => (value, model) =>
    value !== model[field] ? `Must match ${field} field` : '';
const regex = (regex, message) => value =>
    !regex.test(value) ? (message ? message : `Must match ${regex} regex`) : '';
const createDebouncingValidator = message => (value, fields, schema, debouncing) => debouncing ? message : '';

export {
    required,
    minLength,
    maxLength,
    number,
    minValue,
    maxValue,
    repeatField,
    regex,
    createDebouncingValidator,
};
