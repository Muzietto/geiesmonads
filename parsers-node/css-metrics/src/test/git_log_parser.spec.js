import { expect } from 'chai';
import {
  lineP,
  numberP,
  whateverP,
  weekdayP,
  yearP,
  timezoneP,
  daytimeP,
  dateP,
} from '../git_log_parser';
import {
  pchar,
  logP
} from '../lib/parsers';

describe('among git log parsers', () => {

    describe('lineP', () => {
        it('runs a parser and then expects a CR immediately after', () => {
            const line = lineP(pchar('a'));
            expect(line.run('a').isSuccess).to.be.false;
            expect(line.run(prep('a\n')).isSuccess).to.be.true;
        });
    });

    describe('numberP', () => {
        it('parses chars and returns integers', () => {
            expect(numberP.run('').isSuccess).to.be.false;
            expect(numberP.run('a').isSuccess).to.be.false;
            expect(numberP.run('123').isSuccess).to.be.true;
        });
    });

    describe('whateverP', () => {
        it('parses anything, as long as it\'s made of chars', () => {
            expect(whateverP.run('').isSuccess).to.be.true;
            expect(whateverP.run('a').isSuccess).to.be.true;
            expect(whateverP.run('123').isSuccess).to.be.true;
            expect(whateverP.run('123asd£$% £$%345ertERT QWEQWE123@#ù').isSuccess).to.be.true;
        });
    });

    describe('weekdayP', () => {
        it('parses the shortened days of the week in English', () => {
            expect(weekdayP.run('Lun').isSuccess).to.be.false;
            expect(weekdayP.run('Mon').isSuccess).to.be.true;
            expect(weekdayP.run('Sun').isSuccess).to.be.true;
        });
    });

    describe('yearP', () => {
        it('parses 4 digits and returns a string', () => {
            expect(yearP.run('123').isSuccess).to.be.false;
            expect(yearP.run('123e').isSuccess).to.be.false;
            expect(yearP.run('1234').isSuccess).to.be.true;
        });
    });

    describe('timezoneP', () => {
        it('wants a plus before a year', () => {
            expect(timezoneP.run('+123').isSuccess).to.be.false;
            expect(timezoneP.run('+123e').isSuccess).to.be.false;
            expect(timezoneP.run('+1234').isSuccess).to.be.true; // arr.join is not a function
            expect(timezoneP.run('-1234').isSuccess).to.be.false;
        });
    });

    describe('daytimeP', () => {
        it('parses digits and colons', () => {
            expect(daytimeP.run('01:02:03').isSuccess).to.be.true;
            expect(daytimeP.run('1234').isSuccess).to.be.false;
            expect(daytimeP.run('01.02.03').isSuccess).to.be.false;
        });
    });

    describe('dateP', () => {
        it('parses a complex string and returns a JS Date', () => {
          expect(dateP.run('Tue Jan 22 15:38:24 2019 +0100').isSuccess).to.be.true;
          expect(dateP.run('Tue Jan 22 15:38:24 2019').isSuccess).to.be.false;
          expect(dateP.run('Tue Jan 22 15:38:24 2019 +0100').value[0].constructor.name === 'Date').to.be.true;
        });
    });

});

function prep(str) {
  return str.replace('\n', '§§')
}
