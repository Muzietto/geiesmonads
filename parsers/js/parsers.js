import {
    head,
    tail,
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

function pchar(char) {
    let result = function (str) {
        return parser2(char)(str);
    };
    return parser(result);
}

export {parser1, parser2, pchar};