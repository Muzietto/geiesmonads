import {
  letterP,
  digitP,
  whiteP,
  choice,
  stringP,
  anyOf,
  opt, // returns a Success(Maybe)
  sequenceP, // returns an array
  many1, // returns a Success(_)
  many,
  pchar,
  pstring,
} from './lib/parsers';

import { Tuple } from './lib/tuples';
const Pair = Tuple.Pair;
const Triple = Tuple.Triple;

const array2String = res => res.join('');
const tuple2String = res => res.toArray().join('');

const newlineP = pstring('§§');
export const lineP = parser => parser.discardSecond(newlineP)
  .setLabel('On one line: ' + parser.label);
const symbolicChars = () => ['/', '+', '-', '|', '\'', '¢', '©', '÷', 'µ', '¶', '±',
  '¥', '(', ')', 'á', 'Á', 'à', 'À', 'â', 'Â', 'å', 'Å', 'ã', 'Ã', 'ä', 'Ä', 'æ', '™',
  'Æ', 'ç', 'Ç', 'é', 'É', 'è', 'È', 'ê', 'Ê', 'ë', 'Ë', 'í', 'Í', 'ì', 'Ì', 'î', '£',
  'Î', 'ï', 'Ï', 'ñ', 'Ñ', 'ó', 'Ó', 'ò', 'Ò', 'ô', 'Ô', 'ø', 'Ø', 'õ', 'Õ', 'ö', '$',
  'Ö', 'ú', 'Ú', 'ù', 'Ù', 'û', 'Û', 'ü', 'Ü', 'ß', 'ÿ', '!', '?', '/', '=', '®', '€'];
const symbolicCharP = anyOf(symbolicChars());
export const numberP = many1(digitP).fmap(res => parseInt(res.join(''), 10))
  .setLabel('numberP');
export const whateverP = many(choice([letterP, digitP, whiteP, symbolicCharP]))
  .fmap(array2String).setLabel('Parsing whatever...');
export const fileHistorySeparatorP = lineP(many(pchar('-'), 6));

export const weekdayP = choice(['Mon','Tue','Wed','Thu','Fri','Sat','Sun']
  .map(stringP)).setLabel('weekdayP');
export const monthP = choice(['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  .map(stringP)).setLabel('monthP');
export const yearP = many(digitP, 4).fmap(array2String).setLabel('yearP');
export const timezoneP = pchar('+').andThen(yearP)
  .fmap(tuple2String).setLabel('timezoneP');
export const daytimeP = sequenceP([
  numberP,
  pchar(':'),
  numberP,
  pchar(':'),
  numberP,
]).fmap(array2String).setLabel('daytimeP');

export const dateP = sequenceP([
  weekdayP,
  whiteP,
  monthP,
  whiteP,
  numberP,
  whiteP,
  daytimeP,
  whiteP,
  yearP,
  whiteP,
  timezoneP,
]).fmap(res => new Date(array2String(res))).setLabel('dateP');

export const firstLineP = lineP(dateP);

export const filenameP = many1(choice([letterP, digitP, pchar('/'), pchar('.')])).fmap(array2String);

export const secondLineP = lineP(whiteP.discardFirst(filenameP).discardSecond(whateverP));

export const insertionsP = numberP.discardSecond(sequenceP([whiteP, pstring('insertion'), opt(pchar('s')), stringP('(+)')]));
export const deletionsP = numberP.discardSecond(sequenceP([whiteP, pstring('deletion'), opt(pchar('s')), stringP('(-)')]));

export const thirdLineP = lineP(sequenceP([whateverP, pchar(','), whiteP])
  .discardFirst(sequenceP([opt(insertionsP), opt(sequenceP([pchar(','), whiteP])), opt(deletionsP)])))
  .fmap(([maybeInsertions, maybeSeparator, maybeDeletions]) =>
      maybeInsertions.getOrElse(0) - maybeDeletions.getOrElse(0)) // deltaRows

export const commitP = sequenceP([firstLineP, secondLineP, thirdLineP])
  .fmap(([date, filename, deltaRows]) => Pair(filename, Pair(date, deltaRows)));

//const fileHistoryP = ... // Pair(filename, Pair[](data, filesize))

//const gitLogFileP = ... // Pair(filename, Pair[](data, filesize))[]

function symbolicChars() {
  return [
    '/',
    '+',
    '-',
    '|',
    '\'',
    '¢',
    '©',
    '÷',
    'µ',
    '¶',
    '±',
    '€',
    '$',
    '£',
    '®',
    '™',
    '¥',
    '(', ')',
    'á', 'Á',
    'à', 'À',
    'â', 'Â',
    'å', 'Å',
    'ã', 'Ã',
    'ä', 'Ä',
    'æ', 'Æ',
    'ç', 'Ç',
    'é', 'É',
    'è', 'È',
    'ê', 'Ê',
    'ë', 'Ë',
    'í', 'Í',
    'ì', 'Ì',
    'î', 'Î',
    'ï', 'Ï',
    'ñ', 'Ñ',
    'ó', 'Ó',
    'ò', 'Ò',
    'ô', 'Ô',
    'ø', 'Ø',
    'õ', 'Õ',
    'ö', 'Ö',
    'ú', 'Ú',
    'ù', 'Ù',
    'û', 'Û',
    'ü', 'Ü',
    'ß', 'ÿ',
    '!',
    '?',
    '/',
    '=',
  ];
}
