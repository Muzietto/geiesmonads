import {
    head,
    tail,
} from 'util';
import {
    Pair,
} from 'classes';

const parser = char => str => {
    if ('' === str) throw new Error('reached end of char stream');
    if (head(str) === char) return new Pair(true, tail(str));
    return new Pair(false, str);
}

export {parser};