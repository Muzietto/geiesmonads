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
export const jEscapedCharP = choice(escapedJSONChars.map(pchar)).setLabel('escaped char');

const hexDigitsP = choice([
    '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f', 'A', 'B', 'C', 'D', 'E', 'F',
].map(pchar));

export const jUnicodeChar = pchar('\\')
    .discardFirst(pchar('u'))
    .discardFirst(hexDigitsP) //returns a
    .andThen(hexDigitsP) //returns b
    .andThen(hexDigitsP) //returns c
    .andThen(hexDigitsP) //returns d
    .fmap(([[[a, b], c], d]) => parseInt('' + a + b + c + d, 16))
    .setLabel('unicode char');
