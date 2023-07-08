import {
  JValue,
  Tuple,
} from 'classes';
import {
  Validation,
} from 'validation';
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
  manyChars,
  manyChars1,
  opt,
  optBook,
  discardFirst,
  discardSecond,
  between,
  betweenParens,
  sepBy1,
} from 'parsers';

export const JNullP = pstring('null').fmap(_ => JValue.JNull(null)).setLabel('null');

const JTrueP = pstring('true').fmap(_ => JValue.JBool(true));
const JFalseP = pstring('false').fmap(_ => JValue.JBool(false));
export const JBoolP = JTrueP.orElse(JFalseP).setLabel('bool');

export const jUnescapedCharP = parser(predicateBasedParser(char => (char !== '\\' && char !== '"'), 'jUnescapedCharP'));

const escapedJSONChars = [
  // [stringToMatch, resultChar]
  ['\\\"', '\"'],      // quote
  ['\\\\', '\\'],      // reverse solidus
  ['\\/', '/'],        // solidus
  ['\\b', '\b'],       // backspace
  ['\\f', '\f'],       // formfeed
  ['\\n', '\n'],       // newline
  ['\\r', '\r'],       // cr
  ['\\t', '\t'],       // tab
];
export const jEscapedCharP = choice(escapedJSONChars
  .map(([stringToMatch, resultChar]) => pstring(stringToMatch).fmap(() => resultChar)))
    .setLabel('escaped char');

const hexDigitsP = choice([
  '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f', 'A', 'B', 'C', 'D', 'E', 'F',
].map(pchar));

export const jUnicodeCharP = pchar('\\')
  .discardFirst(pchar('u'))
  .discardFirst(hexDigitsP) // returns a
  .andThen(hexDigitsP) // returns b
  .andThen(hexDigitsP) // returns c
  .andThen(hexDigitsP) // returns d
  .fmap(([[[a, b], c], d]) => parseInt('' + a + b + c + d, 16))
  .setLabel('unicode char');

const jCharP = jUnescapedCharP/* .orElse(jEscapedCharP) */.orElse(jUnicodeCharP);
const doublequote = pchar('"').setLabel('doublequote');

export const JStringP = doublequote
  .discardFirst(manyChars(jCharP))
  .discardSecond(doublequote)
  .fmap(res => JValue.JString(res))
  .setLabel('JSON string parser');

const digits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
const digits19 = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

// improvable all over the place by:
// - using manyChars to process lists into strings right away
// - discarding e/E's and dots, and composing the final number from NUMERICAL pieces
const digitsP = many(anyOf(digits));
const digits1P = many1(anyOf(digits));

const optionalPlusMinusP = opt(pchar('-').orElse(pchar('+')));
const optionalMinusP = opt(pchar('-'));

const boxedJust = x => (x.isNothing ? [''] : [x.value]);
const unboxedJust = x => (x.isNothing ? [''] : x.value);
const unboxedNothing = x => (x.isNothing ? '' : x.value);

const exponentialP = choice([pchar('e'), pchar('E')])
  .andThen(optionalPlusMinusP)// .fmap(boxedJust)
  .andThen(digits1P)
  .fmap(([[ee, optPM], digs]) => [ee, (unboxedNothing(optPM))].concat(digs).join(''));

// returns Success(string)
export const jNumberStringP = sequenceP([
  optionalMinusP.fmap(boxedJust),
  digits1P,
  opt(pchar('.').andThen(digits1P).fmap(([dot, digs]) => [dot].concat(digs)))
    .fmap(unboxedJust),
  opt(exponentialP).fmap(boxedJust),
]).fmap(res => res.reduce((acc, curr) => acc.concat(curr), []).join(''));

// returns Success(parseFloat(string))
export const JNumberP = jNumberStringP
  .fmap(parseFloat)
  .fmap(JValue.JNumber)
  .setLabel('JSON number parser');

const [jValueP, parserRef] = parserForwardedToRef();

const leftSquareParensP = pchar('[').discardSecond(many(pchar(' ')));
const rightSquareParensP = pchar(']').discardSecond(many(pchar(' ')));
const commaP = pchar(',').discardSecond(many(pchar(' ')));
const jvalueP = jValueP.discardSecond(many(pchar(' ')));
const jvaluesP = sepBy1(jvalueP, commaP);

export const JArrayP = between(leftSquareParensP, jvaluesP, rightSquareParensP)
  .fmap(JValue.JArray)
  .setLabel('JSON array parser');

// parserRef = JNullP
//     .orElse(JBoolP)
//     .orElse(JStringP)
//     .orElse(JNumberP)
//     .orElse(JArrayP);

function parserForwardedToRef() {

  const dummyParser = parser(pos =>
    Validation.Failure(Tuple.Triple('unfixed forwarded parser', '_fail', pos)),
  'dummyParser');

  const parserRef = dummyParser;

  const wrapperParser = parser(pos => {
    return parserRef.run(pos);
  }, 'wrapperParser');

  return Tuple.Pair(wrapperParser, parserRef);
}
