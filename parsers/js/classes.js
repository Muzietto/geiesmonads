import {
    isPair,
} from 'util';

import {
    fmap,
    returnP,
    applyP,
    lift2, // fabc -> pa -> pb -> (returnP fabc) <*> pa <*> pb
    andThen,
    orElse,
    discardFirst,
    discardSecond,
} from 'parsers';

const toString = Array.prototype.toString;

Array.prototype.toString = function () {
    return '[' + toString.apply(this) + ']';
};

export function Pair(a, b) {
    let result = new _pair(a, b);
    result[Symbol.iterator] = function*() {
        yield a;
        yield b;
    };
    return result;
}

function _pair(a, b) {
    this[0] = a;
    this[1] = b;
}

_pair.prototype.isPair = true;
_pair.prototype.type = 'pair';
_pair.prototype.toString = function () {
    return '[' + this[0] + ',' + this[1] + ']';
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

export function failure(parserLabel, errorMsg) {
    let result = pair(parserLabel, errorMsg);
    result.type = 'failure';
    return result;
}

export function some(value) {
    return {
        type: 'some',
        val() {
            return value;
        },
        toString() {
            return `some(${value})`;
        }
    };
}

export function none() {
    return {
        type: 'none',
        val() {
            return null;
        },
        toString() {
            return 'none()';
        }
    };
}
