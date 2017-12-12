import {
    head,
    tail,
    isSuccess,
    isFailure,
} from 'util';
import {
    pair,
    success,
    failure,
    parser,
} from 'classes';

const charParser = char => str => {
    if ('' === str) throw new Error('reached end of char stream');
    if (head(str) === char) return success(char, tail(str));
    return failure('got ' + char, str);
};

const digitParser = digit => str => {
    if ('' === str) throw new Error('reached end of char stream');
    if (parseInt(head(str), 10) === digit) return success(digit, tail(str));
    return failure('got ' + digit, str);
};

export {charParser, digitParser};

export function pchar(char) {
    let result = function (str) {
        return charParser(char)(str);
    };
    return parser(result);
}

export function pdigit(digit) {
    return parser(str => digitParser(digit)(str));
}

export function andThen(parser1, parser2) {
    return parser(function (str) {
        let res1 = parser1.run(str);
        if (isSuccess(res1)) {
            let res2 = parser2.run(res1[1]);
            if (isSuccess(res2)) {
                return success(pair(res1[0], res2[0]), res2[1]);
            } else return res2;
        } else return res1;
    });
}

export function orElse(parser1, parser2) {
    return parser(str => {
        let res1 = parser1.run(str);
        return (isSuccess(res1)) ? res1 : parser2.run(str);
    });
}

let _fail = parser(str => failure('parsing failed', str));

let _succeed = parser(str => success('parsing succeeded', str));

export function choice(parsers) {
    return parsers.reduceRight((rest, curr) => orElse(curr, rest), _fail);
}

export function anyOf(chars) {
    return choice(chars.map(pchar));
}

export function fmap(fab, parser1) {
    return parser(str => {
        let res1 = parser1.run(str);
        if (isSuccess(res1)) return success(fab(res1[0]), res1[1]);
        return res1;
    });
}

export function returnP(value) {
    return parser(str => success(value, str));
}

// parser(a -> b) -> parser(a) -> parser(b)
export function applyP(fP) {
    return function (xP) {
        return andThen(fP, xP).fmap(([f, x]) => f(x));
    };
}

export function lift2(faab) {
    return function (parser1) {
        return function (parser2) {
            return applyP(applyP(returnP(faab))(parser1))(parser2);
        };
    };
}

export function sequenceP(parsers) {
    return parsers.reverse()
        .reduceRight((curr, rest) => {
            return lift2(_cons)(curr)(rest);
        }, returnP([]));
}

export function sequenceP2(parsers) {
    return parsers.reverse()
        .reduceRight((curr, rest) => {
            return fmap(([x, y]) => x + y, andThen(curr, rest));
        }, returnP(''));
}

export function sequenceP3(parsers) {
    if (parsers.length === 0) return returnP('');
    return fmap(([x, y]) => x + y, andThen(head(parsers), sequenceP3(tail(parsers))));
}

export function pstring(chars) {
    return sequence(chars.split('').map(pchar));
}

function _cons(x) {
    return function (xs) {
        return x.concat(xs);
    };
}
