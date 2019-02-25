import wrapAction from './wrapAction';

const forwardTo = (dispatch, ...types) => {
    if (types.length === 0) {
        return dispatch;
    } else {
        return action => dispatch(wrapAction(action, ...types));
    }
};

export default forwardTo;
