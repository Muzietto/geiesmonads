// cfr. "Understanding Parser Combinators" (F# for Fun and Profit)

import {
    head,
    tail,
} from 'util';
import {
    Tuple,
    Position,
} from 'classes';
import {Maybe} from 'maybe'; // Just or Nothing
import {Validation} from 'validation'; // Success or Failure

const charParser = char => str => {
    if ('' === str) return Validation.Failure(Tuple.Pair('charParser', 'no more input'));
    if (head(str) === char) return Validation.Success(Tuple.Pair(char, tail(str)));
    return Validation.Failure(Tuple.Pair('charParser', 'wanted ' + char + '; got ' + head(str)));
};

const digitParser = digit => str => {
    if ('' === str) return Validation.Failure(Tuple.Pair('digitParser', 'no more input'));
    if (parseInt(head(str), 10) === digit) return Validation.Success(Tuple.Pair(digit, tail(str)));
    return Validation.Failure(Tuple.Pair('digitParser', 'wanted ' + digit + '; got ' + head(str)));
};

export {charParser, digitParser};

export function pchar(char) {
    const label = 'pchar_' + char;
    let result = function (str) {
        return charParser(char)(str);
    };
    return parser(result, label).setLabel(label);
}

export function pdigit(digit) {
    return parser(str => digitParser(digit)(str), 'pdigit_' + digit);
}

export function andThenX(p1, p2) {
    const label = p1.label + ' andThen ' + p2.label;
    return parser(function (str) {
        let res1 = p1.run(str);
        if (res1.isSuccess) {
            let res2 = p2.run(res1.value[1]);
            if (res2.isSuccess) {
                return Validation.Success(Tuple.Pair(Tuple.Pair(res1.value[0], res2.value[0]), res2.value[1]));
            } else return Validation.Failure(Tuple.Pair(label, res2.value[1]));
        } else return Validation.Failure(Tuple.Pair(label, res1.value[1]));
    }, label);
}

// using bind
export function andThen(p1, p2) {
    return p1.bind(parsedValue1 => {
        return p2.bind(parsedValue2 => {
            return returnP(Tuple.Pair(parsedValue1, parsedValue2));
        });
    }).setLabel(p1.label + ' andThen ' + p2.label);
}

export function orElse(p1, p2) {
    const label = p1.label + ' orElse ' + p2.label;
    return parser(str => {
        const res1 = p1.run(str);
        if (res1.isSuccess) return res1;
        const res2 = p2.run(str);
        if (res2.isSuccess) return res2;
        return Validation.Failure(Tuple.Pair(label, res2.value[1]));
    }, label).setLabel(label);
}

let _fail = parser(str => Validation.Failure(Tuple.Pair(Tuple.Pair('parsing failed', '_fail'), '_fail')));

// return neutral element instead of message
let _succeed = parser(str => Validation.Success(Tuple.Pair(Tuple.Pair('parsing succeeded', str), '_succeed')));

export function choice(parsers) {
    return parsers.reduceRight((rest, curr) => orElse(curr, rest), _fail)
        .setLabel('choice ' + parsers.reduce((acc, curr) => acc + '/' + curr.label, ''));
}

export function anyOf(chars) {
    return choice(chars.map(pchar))
        .setLabel('anyOf ' + chars.reduce((acc, curr) => acc + curr, ''));
}

export function fmap(fab, parser1) {
    const label = parser1.label + ' fmap ' + fab.toString();
    return parser(str => {
        let res = parser1.run(str);
        if (res.isSuccess) return Validation.Success(Tuple.Pair(fab(res.value[0]), res.value[1]));
        return Validation.Failure(Tuple.Pair(label, res.value[1]));
    }, label);
}

export function returnP(value) {
    return parser(str => Validation.Success(Tuple.Pair(value, str)), value);
}

// parser(a -> b) -> parser(a) -> parser(b)
export function applyPx(fP) {
    return function (xP) {
        return andThen(fP, xP).fmap(([f, x]) => f(x));
    };
}

// using bind
export function applyP(fP) {
    return function (xP) {
        return fP.bind(parsedValuef => {
            return xP.bind(parsedValuex => {
                return returnP(parsedValuef(parsedValuex));
            });
        });
    };
}

export function lift2(faab) {
    return function (parser1) {
        return function (parser2) {
            //return applyP(applyP(returnP(faab))(parser1))(parser2);
            return returnP(faab).apply(parser1).apply(parser2); // using instance methods
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
    return sequenceP(str.split('').map(pchar))
        .setLabel('pstring ' + str);
}

export function zeroOrMore(xP) { // zeroOrMore :: p a -> [a] -> try [a] = p a -> p [a]
    return str => {
        let res1 = xP.run(str);
        if (res1.isFailure) return Validation.Success(Tuple.Pair([], str));
        let resN = zeroOrMore(xP)(res1.value[1]);
        return Validation.Success(Tuple.Pair([res1.value[0]].concat(resN.value[0]), resN.value[1]));
    };
}

export function many(xP) {
    const label = 'many ' + xP.label;
    return parser(str => {
        return zeroOrMore(xP)(str);
    }, label).setLabel(label);
}

export function many1(xP) {
    const label = 'many1 ' + xP.label;
    return parser(str => {
        let res1 = xP.run(str);
        if (res1.isFailure) return res1;
        let resN = zeroOrMore(xP)(res1.value[1]);
        return Validation.Success(Tuple.Pair([res1.value[0]].concat(resN.value[0]), resN.value[1]));
    }, label).setLabel(label);
}

export function opt(xP) {
    const label = 'opt ' + xP.label;
    return parser(str => {
        let res = xP.fmap(x => Maybe.Just(x)).run(str);
        if (res.isSuccess) return res;
        return Validation.Success(Tuple.Pair(Maybe.Nothing(), str));
    }, label).setLabel(label);
}

// opt from the book - works ok, but toString() gives strange results
export function optBook(pX) {
    const someP = pX.fmap(Maybe.Just);
    const noneP = returnP(Maybe.Nothing);
    return someP.orElse(noneP);
}

export function discardSecond(p1, p2) {
    const label = p1.label + ' discardSecond ' + p2.label;
    return parser(str => {
        return andThen(p1, p2).fmap(([x, y]) => x).run(str);
    }, label).setLabel(label);
}

export function discardFirst(p1, p2) {
    const label = p1.label + ' discardFirst ' + p2.label;
    return parser(str => {
        return andThen(p1, p2).fmap(([x, y]) => y).run(str);
    }, label).setLabel(label);
}

export function between(p1, p2, p3) {
    return p1.discardFirst(p2).discardSecond(p3)
        .setLabel('between ' + p1.label + '/' + p2.label + '/' + p3.label);
}

export function betweenParens(px) {
    return between(pchar('('), px, pchar(')'))
        .setLabel('betweenParens ' + px.label);
}

export function bindP(famb, px) {
    let label = 'unknown';
    return parser(str => {
        const res = px.run(str);
        if (res.isFailure) return res;
        return famb(res.value[0]).run(res.value[1]);
    }, label).setLabel(label);
}

function _cons(x) {
    return function (xs) {
        return [x].concat(xs);
    };
}

function _setLabel(px, newLabel) {
    return parser(str => {
        let result = px.run(str);
        if (result.isFailure) return Validation.Failure(Tuple.Pair(newLabel, result.value[1]));
        return result;
    }, newLabel);
}

// the real thing...
export function parser(fn, label) {
    return {
        type: 'parser',
        label: label,
        run(str) {
            return fn(str);
        },
        apply(px) {
            return applyP(this)(px);
            //return this.bind(andThen(this, px).fmap(([f, x]) => f(x))).run; // we are the fP
        },
        fmap(fab) {
            //return fmap(fab, this);
            //return bindP(str => returnP(fab(str)), this);
            return this.bind(parsedValue => returnP(fab(parsedValue)));
        },
        andThen(px) {
            return andThen(this, px);
        },
        orElse(px) {
            return orElse(this, px);
        },
        discardFirst(px) {
            return discardFirst(this, px);
        },
        discardSecond(px) {
            return discardSecond(this, px);
        },
        bind(famb) {
            return bindP(famb, this);
        },
        setLabel(newLabel) {
            return _setLabel(this, newLabel);
        }
    };
}
