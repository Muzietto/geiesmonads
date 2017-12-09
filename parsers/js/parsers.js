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

const parser1 = char => str => {
    if ('' === str) throw new Error('reached end of char stream');
    if (head(str) === char) return pair(true, tail(str));
    return pair(false, str);
};

const parser2 = char => str => {
    if ('' === str) throw new Error('reached end of char stream');
    if (head(str) === char) return success(char, tail(str));
    return failure(char, str);
};

export {parser1, parser2};

export function charParser(char) {
    let result = function (str) {
        return parser2(char)(str);
    };
    return parser(result);
}

export function andThen(parser1, parser2) {
    return parser(function (str) {
        let res1 = parser1.run(str);
        if (isSuccess(res1)) {
            let res2 = parser2.run(res1.second());
            if (isSuccess(res2)) {
                return success([res1.first(), res2.first()], res2.second());
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
    return parsers.reduceRight((rest, curr) => {
        return orElse(curr, rest);
    }, _fail);
}

export function alternativeParsers(chars) {
    return choice(chars.map(charParser));
}

export function choiceL(parsers) {
    return tail(parsers).concat([_fail])
        .reduce((acc, curr) => {
            return orElse(acc, curr);
        }, head(parsers));
}
