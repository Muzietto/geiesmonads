export function pair(_1, _2) {
    let result = [_1, _2];
    result.name = 'pair';
    result.first = () => _1;
    result.second = () => _2;
    result.toString = () => {
        return '['
            + result.first().toString()
            + ','
            + result.second().toString()
            + ']';
    };
    return result;
}

export function success(matched, str) {
    let result = pair(matched, str);
    result.name = 'success';
    return result;
}

export function failure(matched, str) {
    let result = pair(matched, str);
    result.name = 'failure';
    return result;
}

export function parser(fn) {
    return {
        run: str => fn(str),
        name: 'parser',
    };
}
