// cfr. "Understanding Parser Combinators" (F# for Fun and Profit)

import {
    Tuple,
    Position,
} from 'classes';
import {Maybe} from 'maybe'; // Just or Nothing
import {Validation} from 'validation'; // Success or Failure

const charParser = char => pos => {
    if (typeof pos === 'string') pos = Position.fromText(pos);
    const optChar = pos.char();
    if (optChar.isNothing) return Validation.Failure(Tuple.Triple('charParser', 'no more input', pos));
    if (optChar.value === char) return Validation.Success(Tuple.Pair(char, pos.incrPos()));
    return Validation.Failure(Tuple.Triple('charParser', 'wanted ' + char + '; got ' + optChar.value, pos));
};

const digitParser = digit => pos => {
    if (typeof pos === 'string') pos = Position.fromText(pos);
    const optChar = pos.char();
    if (optChar.isNothing) return Validation.Failure(Tuple.Triple('digitParser', 'no more input', pos));
    if (parseInt(optChar.value, 10) === digit) return Validation.Success(Tuple.Pair(digit, pos.incrPos()));
    return Validation.Failure(Tuple.Triple('digitParser', 'wanted ' + digit + '; got ' + optChar.value, pos));
};

const predicateBasedParser = (pred, label) => pos => {
    if (typeof pos === 'string') pos = Position.fromText(pos);
    const optChar = pos.char();
    if (optChar.isNothing) return Validation.Failure(Tuple.Triple(label, 'no more input', pos));
    if (pred(optChar.value)) return Validation.Success(Tuple.Pair(optChar.value, pos.incrPos()));
    return Validation.Failure(Tuple.Triple(label, 'unexpected char: ' + optChar.value, pos));
};

export {charParser, digitParser, predicateBasedParser};

export function pchar(char) {
    const label = 'pchar_' + char;
    let result = function (pos) {
        return charParser(char)(pos);
    };
    return parser(result, label).setLabel(label);
}

export function pdigit(digit) {
    return parser(pos => digitParser(digit)(pos), 'pdigit_' + digit);
}

export function andThen(p1, p2) {
    const label = p1.label + ' andThen ' + p2.label;
    return parser(function (pos) {
        let res1 = p1.run(pos);
        if (res1.isSuccess) {
            let res2 = p2.run(res1.value[1]);
            if (res2.isSuccess) {
                return Validation.Success(Tuple.Pair(Tuple.Pair(res1.value[0], res2.value[0]), res2.value[1]));
            } else return Validation.Failure(Tuple.Triple(label, res2.value[1], res2.value[2]));
        } else return Validation.Failure(Tuple.Triple(label, res1.value[1], res1.value[2]));
    }, label);
}

// using bind
export function andThenBind(p1, p2) {
    return p1.bind(parsedValue1 => {
        return p2.bind(parsedValue2 => {
            return returnP(Tuple.Pair(parsedValue1, parsedValue2));
        });
    }).setLabel(p1.label + ' andThen ' + p2.label);
}

export function orElse(p1, p2) {
    const label = p1.label + ' orElse ' + p2.label;
    return parser(pos => {
        const res1 = p1.run(pos);
        if (res1.isSuccess) return res1;
        const res2 = p2.run(pos);
        if (res2.isSuccess) return res2;
        return Validation.Failure(Tuple.Triple(label, res2.value[1], res2.value[2]));
    }, label).setLabel(label);
}

let _fail = parser(pos => Validation.Failure(Tuple.Triple('parsing failed', '_fail', pos)));

// return neutral element instead of message
let _succeed = parser(pos => Validation.Success(Tuple.Pair(Tuple.Pair('parsing succeeded', pos), '_succeed')));

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
    return parser(pos => {
        let res = parser1.run(pos);
        if (res.isSuccess) return Validation.Success(Tuple.Pair(fab(res.value[0]), res.value[1]));
        return Validation.Failure(Tuple.Triple(label, res.value[1], res.value[2]));
    }, label);
}

export function returnP(value) {
    return parser(pos => Validation.Success(Tuple.Pair(value, pos)), value);
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
    return pos => {
        let res1 = xP.run(pos);
        if (res1.isFailure) return Validation.Success(Tuple.Pair([], pos));
        let resN = zeroOrMore(xP)(res1.value[1]);
        return Validation.Success(Tuple.Pair([res1.value[0]].concat(resN.value[0]), resN.value[1]));
    };
}

export function many(xP) {
    const label = 'many ' + xP.label;
    return parser(pos => {
        return zeroOrMore(xP)(pos);
    }, label).setLabel(label);
}

export function manyChars(xP) {
    return many(xP)
        .fmap(arra => arra.join(''))
        .setLabel('manyChars ' + xP.label);
}

export function many1(xP) {
    const label = 'many1 ' + xP.label;
    return parser(pos => {
        let res1 = xP.run(pos);
        if (res1.isFailure) return res1;
        let resN = zeroOrMore(xP)(res1.value[1]);
        return Validation.Success(Tuple.Pair([res1.value[0]].concat(resN.value[0]), resN.value[1]));
    }, label).setLabel(label);
}

export function manyChars1(xP) {
    return many1(xP)
        .fmap(arra => arra.join(''))
        .setLabel('manyChars1 ' + xP.label);
}

export function opt(xP) {
    const label = 'opt ' + xP.label;
    return parser(pos => {
        let res = xP.fmap(x => Maybe.Just(x)).run(pos);
        if (res.isSuccess) return res;
        return Validation.Success(Tuple.Pair(Maybe.Nothing(), pos));
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
    return parser(pos => {
        return andThen(p1, p2).fmap(([x, y]) => x).run(pos);
    }, label).setLabel(label);
}

export function discardFirst(p1, p2) {
    const label = p1.label + ' discardFirst ' + p2.label;
    return parser(pos => {
        return andThen(p1, p2).fmap(([x, y]) => y).run(pos);
    }, label).setLabel(label);
}

export function sepBy1Book(px, sep) {
    return px.andThen(many(sep.discardFirst(px))).fmap(([r, rlist]) => [r].concat(rlist));
}

// my version works just fine...
export function sepBy1(valueP, separatorP) {
    return many(many1(valueP).discardSecond(opt(separatorP)));
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
    return parser(pos => {
        const res = px.run(pos);
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
    return parser(pos => {
        let result = px.run(pos);
        if (result.isFailure) return Validation.Failure(Tuple.Triple(newLabel, result.value[1], result.value[2]));
        return result;
    }, newLabel);
}

// the real thing...
export function parser(fn, label) {
    return {
        type: 'parser',
        label: label,
        run(pos) {
            return fn(pos);
        },
        apply(px) {
            return applyP(this)(px);
            //return this.bind(andThen(this, px).fmap(([f, x]) => f(x))).run; // we are the fP
        },
        fmap(fab) {
            //return fmap(fab, this);
            //return bindP(pos => returnP(fab(pos)), this);
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

export const lowercaseP = anyOf(['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',]);
export const uppercaseP = anyOf(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',]);
export const letterP = lowercaseP.orElse(uppercaseP);
export const digitP = anyOf(['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']);
export const whiteP = anyOf([' ', '\t', '\n', '\r']);
