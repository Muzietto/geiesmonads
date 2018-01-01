import {
    JValue,
    Tuple,
} from 'classes';
import {
    parser,
    charParser,
    digitParser,
    predicateBasedParser,
    pchar,
    pdigit,
    andThen,
    orElse,
    choice,
    anyOf,
    fmap,
    returnP,
    applyP,
    lift2,
    sequenceP,
    sequenceP2,
    pstring,
    zeroOrMore,
    many,
    many1,
    opt,
    optBook,
    discardFirst,
    discardSecond,
    between,
    betweenParens,
} from 'parsers';

export const JNullP = pstring('null').fmap(_ => JValue.JNull(null)).setLabel('null');

const JTrueP = pstring('true').fmap(_ => JValue.JBool(true));
const JFalseP = pstring('false').fmap(_ => JValue.JBool(false));
export const JBoolP = JTrueP.orElse(JFalseP).setLabel('bool');

export const jUnescapedCharP = parser(predicateBasedParser(char => (char !== '\\' && char !== '"'), 'junescapedCharP'));
const escapedJSONChars = [
    '\"',
    '\\',
    '\/',
    '\b',
    '\f',
//    '\n', // newlines will be removed during text -> position transformation
    '\r',
    '\t',
];
export const jEscapedCharP = choice(escapedJSONChars.map(pchar));
