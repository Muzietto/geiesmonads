import {
    isPair,
} from 'util';

import {
    fmap,
    returnP,
    applyP,
    lift2, // fabc -> pa -> pb -> (returnP fabc) <*> pa <*> pb
} from 'parsers';

const toString = Array.prototype.toString;

Array.prototype.toString = function () {
    return '[' + toString.apply(this) + ']';
};

export function pair(x, y) {
    let result = [x, y];
    result.type = 'pair';
    result.toString = () => {
        return '['
            + (isPair(result[0]) ? result[0].toString() : result[0])
            + ','
            + (isPair(result[1]) ? result[1].toString() : result[1])
            + ']';
    };
    return result;
}

export function success(matched, str) {
    let result = pair(matched, str);
    result.type = 'success';
    return result;
}

export function failure(matched, str) {
    let result = pair(matched, str);
    result.type = 'failure';
    return result;
}

export function parser(fn) {
    return {
        run(str) {
            return fn(str);
        },
        type: 'parser',
        fmap(fab) {
            return fmap(fab, this);
        },
        apply(px) {
            return applyP(this)(px);
        },
    };
}
