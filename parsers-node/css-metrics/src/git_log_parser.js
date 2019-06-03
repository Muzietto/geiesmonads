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
} from 'js/parsers';

const array2String = arr => arr.join('');

const lineP = parser => parser.discardSecond(pchar('\n')).setLabel('On one line: ' + parser.label);
const symbolicCharP = anyOf(symbolicChars());
const numberP = many1(digitP).fmap(res => parseInt(res.join(''), 10));
const whateverP = many(choice([letterP, digitP, whiteP, symbolicCharP]))
  .fmap(array2String).setLabel('Parsing whatever...');

const weekdayP = choice(['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(stringP));
const monthP = choice(['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].map(stringP));
const yearP = many(digitP, 4).fmap(array2String);
const timezoneP = (pchar('+').andThen(yearP)).fmap(array2String);
const daytimeP = sequenceP([
  numberP,
  pchar(':'),
  numberP,
  pchar(':'),
  numberP,
]).fmap(array2String);

const dateP = sequenceP([
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
]).fmap(array2String); // ready for new Date(res)

const firstLineP = lineP(dateP);

const filenameP = many1(choice([letterP, digitP, pchar('/')])).fmap(array2String);

const secondLineP = lineP(whiteP.discardFirst(filenameP).discardSecond(whateverP));

const insertionsP = numberP.discardSecond(sequenceP([whiteP, pstring('insertion'), opt(pchar('s')), stringP('(+)')]));
const deletionsP = numberP.discardSecond(sequenceP([whiteP, pstring('deletion'), opt(pchar('s')), stringP('(-)')]));

const thirdLineP = lineP(sequenceP([whateverP, pchar(','), whiteP])
  .discardFirst(sequenceP([opt(insertionsP), opt(sequenceP([pchar(','), whiteP])), opt(deletionsP)])))
  .fmap(([maybeInsertions, maybeSeparator, maybeDeletions]) => {/* TODO operations here */}); // deltaRows

//const commitP = ... // res = Tuple.Couple(filename, Tuple.Couple(date, deltaRows))

//const fileHistorySeparatorP = ...

//const fileHistoryP = ... // Tuple.Couple(filename, Tuple.Couple[](data, filesize))

//const gitLogFileP = ... // Tuple.Couple(filename, Tuple.Couple[](data, filesize))[]

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
    '·',
    '¶',
    '±',
    '€',
    '$',
    '£',
    '®',
    '§',
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
