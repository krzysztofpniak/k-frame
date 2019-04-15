import {always, prop} from 'ramda';
import mergeSpec from './mergeSpec';

const reset = mergeSpec({
  dirty: always(false),
  submitRequested: always(false),
  fields: prop('defaultValues'),
  subStates: prop('initialSubStates'),
});

export default reset;
