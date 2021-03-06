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
  returnP,
  logP,
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

export const fileHistoryP = many1(commitP.discardSecond(opt(newlineP))).discardSecond(fileHistorySeparatorP)
  .fmap(commits => commits.reverse())
  .bind(commits => {
      const [filename, _] = commits[0];
      const [commitPairs, __] = commits.reduce((acc, curr) => {
        const [previousCommits, previousFilesize] = acc;
        const [_, [date, deltaRows]] = curr;
        const currFileSize = previousFilesize + deltaRows;
        return Pair(previousCommits.concat([Pair(date, currFileSize)]), currFileSize);
      }, Pair([], 0));
      return returnP(Pair(filename, commitPairs));
    })
  .setLabel('fileHistoryP'); // Pair(filename, Pair[](date, filesize))

// Pair[](filename, Pair[](date, filesize))
export const gitLogFileP = many1(fileHistoryP).setLabel('gitLogFileP');

// [
//   A.css\n10/01/2018,10/05/2018,10/19/2018,10/28/2018,10/29/2018\n10,12,18,13,9
//   B.css\n10/01/2018,10/05/2018,10/19/2018,10/28/2018,10/29/2018\n10,12,18,13,9
// ]
export const prettyLogP = gitLogFileP
.fmap(fileHistories => {
    return fileHistories.map(fileHistory => {
      const [filename, history] = fileHistory;
      const [dates, sizes] = history
        .reduce(([prevDates, prevSizes], [date, size]) =>
          Pair(prevDates.concat([date.toLocaleDateString('en-US')]),prevSizes.concat([size])), Pair([],[]));
      return `${filename}\n${dates.join(',')}\n${sizes.join(',')}\n`;
    });
  }).setLabel('prettyLogP');

export const repeatedFirstLineP = logP(many1(firstLineP, 2).setLabel('DOUBLE_FIRST_LINE'));
export const repeatedSecondLineP = logP(many1(secondLineP, 2).setLabel('DOUBLE_SECOND_LINE'));
export const repeatedThirdLineP = logP(many1(thirdLineP, 2).setLabel('DOUBLE_THIRD_LINE'));
export const anyOtherLineP = choice([
  pchar('\n'),
  secondLineP,
  thirdLineP,
]).setLabel('anyOtherLineP');
export const cleanupP = choice([ repeatedFirstLineP, anyOtherLineP ]);

export const fileCreationP = logP(fileHistoryP
  .fmap(([filename, [[creationDate, creationFilesize], ...rest]]) =>
    Pair(filename, creationDate.toLocaleDateString('en-US')))
  .setLabel('fileCreationP'));

// Pair[](filename, dateStr)
export const fileCreationsP = many1(fileCreationP).setLabel('fileCreationsP');
// { [dateStr]: numCreations }
export const creationDatesP = fileCreationsP
  .bind(creations => returnP(creations.reduce((acc, [fname, creationDateStr]) => {
    if (typeof acc[creationDateStr] !== 'undefined') acc[creationDateStr] += 1;
    else acc[creationDateStr] = 1;
    return acc;
  }, {}))).setLabel('creationDatesP');

  //   10/01/2018,10/05/2018,10/19/2018,10/28/2018,10/29/2018\n10,12,18,13,9
  export const prettyCreationsP = creationDatesP
    .fmap(creationsObj => {
      const keyzz = Object.keys(creationsObj)
        .sort((a,b) => new Date(b) - new Date(a));
      const valuzz = keyzz.map(key => creationsObj[key]);
      return valuzz.reverse().join(',') + '\n' + keyzz.reverse().join(',');
    });
