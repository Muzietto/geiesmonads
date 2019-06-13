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
  filenameP,
  firstLineP,
  secondLineP,
  insertionsP,
  deletionsP,
  thirdLineP,
} from '../git_log_parser';
import {
  pchar,
  logP,
  whiteP,
  sequenceP,
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
            expect(whateverP.run(' | 6 +++---').isSuccess).to.be.true;
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
          expect(dateP.run('Thu Jan 17 09:22:09 2019 +0100').isSuccess).to.be.true;
          expect(dateP.run('Tue Jan 22 15:38:24 2019').isSuccess).to.be.false;
          expect(dateP.run('Tue Jan 22 15:38:24 2019 +0100').value[0].constructor.name === 'Date').to.be.true;
          expect(dateP.run('Thu Jan 17 09:22:09 2019 +0100').isSuccess).to.be.true;
          expect(dateP.run('Thu Jan 17 09:22:09 2019 +0100').value[0].constructor.name === 'Date').to.be.true;
        });
    });

    describe('firstLineP', () => {
        it('parses a date with a newline at the end', () => {
          expect(firstLineP.run(prep('Thu Jan 17 09:22:09 2019 +0100\n')).isSuccess).to.be.true;
          expect(firstLineP.run(prep('Tue Jan 22 15:38:24 2019\n')).isSuccess).to.be.false;
          expect(firstLineP.run(prep('Tue Jan 22 15:38:24 2019 +0100\n')).value[0].constructor.name === 'Date').to.be.true;
          expect(firstLineP.run(prep('Thu Jan 17 09:22:09 2019 +0100\n')).isSuccess).to.be.true;
          expect(firstLineP.run(prep('Thu Jan 17 09:22:09 2019 +0100\n')).value[0].constructor.name === 'Date').to.be.true;
        });
    });

    describe('filenameP', () => {
        it('parses a filename', () => {
          expect(filenameP.run('src/Accordion.scss').isSuccess).to.be.true;
          expect(filenameP.run('src/Accordion.scss').value[1].rest()).to.be.eql('');
          expect(filenameP.run('src\\components\\organisms\\Accordion\\Accordion.scss').isSuccess).to.be.true;
          expect(filenameP.run('src\\components\\organisms\\Accordion\\Accordion.scss').value[1].rest()).not.to.be.eql('');
        });
    });

    describe('secondLineP', () => {
        const fname = 'src/components/organisms/Accordion/Accordion.scss';
        it('parses a complex string and returns just the filename', () => {
          const secline = whiteP.discardFirst(filenameP).discardSecond(whateverP)
          expect(secline.run(' ' + fname + ' | 6 +++---').value[0]).to.be.eql(fname);
          expect(lineP(secline).run(prep(' ' + fname + ' | 6 +++---\n')).value[0]).to.be.eql(fname);
          expect(secondLineP.run(prep(' ' + fname + ' | 6 +++---\n')).value[0]).to.be.eql(fname);
        });
    });

    describe('insertionsP', () => {
        it('extracts the number of insertions', () => {
          expect(insertionsP.run('1 insertion(+)').isSuccess).to.be.true;
          expect(insertionsP.run('53 insertions(+)').isSuccess).to.be.true;
          expect(insertionsP.run('53 insertions(+)').value[0]).to.be.eql(53);
          expect(insertionsP.run('53 insertions(+)').value[1].rest()).to.be.eql('');
        });
    });

    describe('deletionsP', () => {
        it('extracts the number of deletions', () => {
          expect(deletionsP.run('1 deletion(-)').isSuccess).to.be.true;
          expect(deletionsP.run('53 deletions(-)').isSuccess).to.be.true;
          expect(deletionsP.run('53 deletions(-)').value[0]).to.be.eql(53);
          expect(deletionsP.run('53 deletions(-)').value[1].rest()).to.be.eql('');
        });
    });

    describe('thirdLineP', () => {
        it('parses a complex string and returns just relevant numbers', () => {
          expect(thirdLineP.run(prep(' 1 file changed, 3 insertions(+), 3 deletions(-)\n')).value[0]).to.be.eql(0);
          expect(thirdLineP.run(prep(' 1 file changed, 3 deletions(-)\n')).value[0]).to.be.eql(-3);
          expect(thirdLineP.run(prep(' 1 file changed, 3 insertions(+), 1 deletions(-)\n')).value[0]).to.be.eql(2);
          expect(thirdLineP.run(prep(' 1 file changed, 43 deletions(-)\n')).value[0]).to.be.eql(-43);
        });
    });

    describe('an hand-made line parser', () => {
        it('parses a 3-lines commit log', () => {
          const parzer = sequenceP([lineP(pchar('a')), lineP(pchar('b')), lineP(pchar('c'))]);
          const commitStr = 'a\nb\nc\n';
          expect(parzer.run(prep(commitStr)).isSuccess).to.be.true;
          expect(parzer.run(prep(commitStr)).value[1].rest()).to.be.eql('');
        });
    });

    describe('commitP', () => {
        it('parses a 3-lines commit log', () => {
          const commitStr = 'Thu Jan 17 19:22:09 2019 +0100\n Accordion.scss | 22 +++\n 1 file changed, 16 insertions(+), 6 deletions(-)\n';
          expect(commitP.run(prep(commitStr)).isSuccess).to.be.true;
          expect(commitP.run(prep(commitStr)).toString()).to.be.eql('Validation.Success([[Accordion.scss,[Thu Jan 17 2019 19:22:09 GMT+0100 (Central European Standard Time),10]],row=1;col=0;rest=])');
        });
    });
    describe('fileHistorySeparatorP', () => {
        it('parses six lonely dashes in a row', () => {
          expect(fileHistorySeparatorP.run(prep('------\n')).isSuccess).to.be.true;
          expect(fileHistorySeparatorP.run(prep('-------\n')).isSuccess).to.be.false;
          expect(fileHistorySeparatorP.run(prep('-----\n')).isSuccess).to.be.false;
          expect(fileHistorySeparatorP.run(prep('-----6\n')).isSuccess).to.be.false;
        });
    });
});

function prep(str) {
  return str.replace(/\n/g, '§§')
}
