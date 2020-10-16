import {always, prop, map, F} from 'ramda';
import mergeSpec from './mergeSpec';

const reset = mergeSpec({
  touched: map(F),
  dirty: map(F),
  submitRequested: always(false),
  fields: prop('defaultValues'),
  subStates: prop('initialSubStates'),
});

export default reset;
