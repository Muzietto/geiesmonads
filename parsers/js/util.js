export function isPair(thing) {
    return thing.type === 'pair'
        || thing.type === 'success'
        || thing.type === 'failure';
}

export function isTriple(thing) {
    return thing.type === 'triple';
}

export function isSome(thing) {
    return thing.type === 'some';
}

export function isNone(thing) {
    return thing.type === 'none';
}

export function isSuccess(thing) {
    return thing.type === 'success';
}

export function isFailure(thing) {
    return thing.type === 'failure';
}

export function isParser(thing) {
    return thing.type === 'parser';
}

export function rnd(size) {
    size = size || 6;
    return Math.floor(Math.random() * Math.pow(10, size));
}

export function IDENTITY(x) {
    return x;
}

export function NULL_FUNCTION() {
}

export function PREVENT_DEFAULT(ev) {
    ev.preventDefault();
}

export function uniqueIdentifier(str, num, prefix) {
    let start = (prefix) ? prefix + '.' : '';
    return start + str + '#' + num;
}

export function isObject(o) {
    return null !== o && typeof o === 'object' && !Array.isArray(o);
}

export function toInt(string) {
    return parseInt(string, 10);
}

export function capitalize(s) {
    return s[0].toUpperCase() + s.slice(1);
}

export function isBoolean(expr) {
    return isXxx('boolean')(expr);
}

export function isString(expr) {
    return isXxx('string')(expr);
}

export function isNumber(expr) {
    if (isNaN(expr)) return false;
    return isXxx('number')(expr);
}

export function isFunction(expr) {
    return isXxx('function')(expr);
}

export function isUndefined(expr) {
    return isXxx('undefined')(expr);
}

function isXxx(type) {
    return function (expr) {
        return (typeof expr === type);
    };
}

export function last(stringOrArray) {
    if (stringOrArray.length === 0) {
        return '';
    }
    return stringOrArray[stringOrArray.length - 1];
}

export function head(stringOrArray) {
    if (stringOrArray.length === 0) {
        return '';
    }
    return stringOrArray[0];
}

export function tail(stringOrArray) {
    if (stringOrArray.length === 0) {
        return '';
    }
    return stringOrArray.slice(1);
}

export function contains(stringOrArray, charsOrItem) {
    return stringOrArray.indexOf(charsOrItem) !== -1;
}

export function exceptTheLast(arra) {
    return arra.slice(0, arra.length - 1);
}

export function reversed(arra) {
    return arra.reduceRight((rest, elem, index) => {
        return rest.concat([elem]);
    }, []);
}

export function enumeration(length) {
    if (!isNumber(length)) return [];
    return Array.from(Array(length).keys());
}

const addOne = x => x + 1;

const timesTwo = x => x * 2;

// make x -> addOne -> addOne -> timesTwo
// y = (x + 2) * 2

const composable = [timesTwo, addOne, addOne];
const pipable = [addOne, addOne, timesTwo];

const composed = composable.reduce((acc, curr) => {
    return x => acc(curr(x));
}, x => x);

const piped = pipable.reduce((acc, curr) => {
    return x => curr(acc(x));
}, x => x);
