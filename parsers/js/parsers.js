// cfr. "Understanding Parser Combinators" (F# for Fun and Profit)

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
    some,
    none,
} from 'classes';

const charParser = char => str => {
    if ('' === str) throw new Error('reached end of char stream');
    if (head(str) === char) return success(char, tail(str));
    return failure('wanted ' + char + '; got ' + head(str), str);
};

const digitParser = digit => str => {
    if ('' === str) throw new Error('reached end of char stream');
    if (parseInt(head(str), 10) === digit) return success(digit, tail(str));
    return failure('wanted ' + digit + '; got ' + head(str), str);
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

// return neutral element instead of message
let _succeed = parser(str => success('parsing succeeded', str));

export function choice(parsers) {
    return parsers.reduceRight((rest, curr) => orElse(curr, rest), _fail);
}

export function anyOf(chars) {
    return choice(chars.map(pchar));
}

export function fmap(fab, parser1) {
    return parser(str => {
        let res = parser1.run(str);
        if (isSuccess(res)) return success(fab(res[0]), res[1]);
        return res;
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

// using lift2(cons)
export function sequenceP(parsers) {
    return parsers
        .reduceRight((rest, curr) => {
            return lift2(_cons)(curr)(rest);
        }, returnP([]));
}

// using naive andThen && fmap --> returns strings, not arrays!
export function sequenceP2(parsers) {
    return parsers
        .reduceRight((rest, curr) => {
            return fmap(([x, y]) => x + y, andThen(curr, rest));
        }, returnP(''));
}

export function pstring(str) {
    return sequenceP(str.split('').map(pchar));
}

export function zeroOrMore(xP) { // zeroOrMore :: p a -> [a] -> try [a] = p a -> p [a]
    return str => {
        let res1 = xP.run(str);
        if (isFailure(res1)) return success([], str);
        let resN = zeroOrMore(xP)(res1[1]);
        return success([res1[0]].concat(resN[0]), resN[1]);
    };
}

// not working  :-(
function zeroOrMoreX(xP) { // zeroOrMoreX :: p a -> p(a -> p [a]) !!!
    return parser(str => {
        let res = xP.run(str);
        if (isFailure(res)) return success([], str);
        // next line returns a parser (wrong, wrong, wrong...)
        return lift2(_cons)(returnP(res[0]))(zeroOrMoreX(xP).run(res[1]));
    });
}

export function many(xP) {
    return parser(str => {
        return zeroOrMore(xP)(str);
    });
}

export function many1(xP) {
    return parser(str => {
        let res1 = xP.run(str);
        if (isFailure(res1)) return res1;
        let resN = zeroOrMore(xP)(res1[1]);
        return success([res1[0]].concat(resN[0]), resN[1]);
    });
}

export function opt(xP) {
    return parser(str => {
        let res = xP.fmap(x => some(x)).run(str);
        if (isSuccess(res)) return res;
        return success(none(), str);
    });
}

// opt from the book
export function optBook(pX) {
    const someP = pX.fmap(some);
    const noneP = returnP(none);
    return someP.orElse(noneP);
}

export function discardSecond(p1, p2) {
    return parser(str => {
        return andThen(p1, p2).fmap(([r1, r2]) => r1).run(str);
    });
}

export function discardFirst(p1, p2) {
    return parser(str => {
        return andThen(p1, p2).fmap(([r1, r2]) => r2).run(str);
    });
}

export function between(p1, p2, p3) {
    return p1.discardFirst(p2).discardSecond(p3);
}

export function betweenParens(px) {
    return between(pchar('('), px, pchar(')'));
}

function _cons(x) {
    return function (xs) {
        return [x].concat(xs);
    };
}
