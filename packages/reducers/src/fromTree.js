import {mapObjIndexed, values} from 'ramda';
import createReducer from './createReducer';
import nest from './nest';

const fromTree = tree =>
    createReducer(
        {},
        values(
            mapObjIndexed(
                (v, k) =>
                    k === '.'
                        ? v
                        : typeof v === 'object'
                            ? nest(k, fromTree(v))
                            : nest(k, v),
                tree
            )
        )
    );

export default fromTree;
