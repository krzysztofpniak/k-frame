import {uncurryN} from 'ramda';

const action = (matcher, transform) => (state, action) =>
    matcher(action) ? uncurryN(2, transform)(action.payload, state) : state;

export default action;
