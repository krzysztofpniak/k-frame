const wrapAction = (action, ...types) => {
    if (types.length === 0) {
        return action;
    } else {
        return {
            ...action,
            type: `${types.join('.')}.${action.type}`,
        };
    }
};

export default wrapAction;
