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

export function pchar(char) {
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
