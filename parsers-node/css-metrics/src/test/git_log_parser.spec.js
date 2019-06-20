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
  commitP,
  fileHistorySeparatorP,
  fileHistoryP,
  gitLogFileP,
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
          expect(commitP.run(prep(commitStr)).value[0][0]).to.be.eql('Accordion.scss');
          expect(commitP.run(prep(commitStr)).value[0][1][0].toString()).to.be.eql('Thu Jan 17 2019 19:22:09 GMT+0100 (Central European Standard Time)');
          expect(commitP.run(prep(commitStr)).value[0][1][1]).to.be.eql(10);
          expect(commitP.run(prep(commitStr)).value[1].rest()).to.be.eql('');
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

    describe('fileHistoryP', () => {
        it('parses one commit log', () => {
          let chs = 'Thu Jan 17 19:22:09 2019 +0100\n A.scss | 22 +++\n 1 f c, 10 insertions(+)\n\n';
          chs += '------\n';
          const result = fileHistoryP.run(prep(chs));

          expect(result.isSuccess).to.be.true;
          expect(result.value[0].isPair).to.be.true;
          expect(result.value[0][0]).to.be.eql('A.scss');
          expect(Array.isArray(result.value[0][1])).to.be.true;
          expect(result.value[0][1][0].toString()).to.be.eql('P{Thu Jan 17 2019 19:22:09 GMT+0100 (Central European Standard Time),10}');
          expect(result.value[1].rest()).to.be.eql('');
        });
        it('parses several commit logs', () => {
          let chs = 'Thu Jan 17 19:22:09 2019 +0100\n A.scss | 22 +++\n 1 f c, 10 insertions(+)\n\n';
          chs += 'Fri Jan 18 19:22:09 2019 +0100\n A.scss | 22 +++\n 1 f c, 16 insertions(+), 6 deletions(-)\n';
          chs += '------\n';
          const result = fileHistoryP.run(prep(chs));

          expect(result.isSuccess).to.be.true;
          expect(result.value[0][1][0].toString()).to.be.eql('P{Thu Jan 17 2019 19:22:09 GMT+0100 (Central European Standard Time),10}');
          expect(result.value[0][1][1].toString()).to.be.eql('P{Fri Jan 18 2019 19:22:09 GMT+0100 (Central European Standard Time),20}');
          expect(result.value[1].rest()).to.be.eql('');
        });
    });

    describe('gitLogFileP', () => {
        it('parses several file histories', () => {
          let chs = '';
          chs += 'Thu Jan 17 19:22:09 2019 +0100\n A.scss | 22 +++\n 1 f c, 10 insertions(+)\n\n';
          chs += 'Fri Jan 18 19:22:09 2019 +0100\n A.scss | 22 +++\n 1 f c, 16 insertions(+), 6 deletions(-)\n';
          chs += '------\n';
          chs += 'Thu Jan 17 20:22:09 2019 +0100\n B.scss | 22 +++\n 1 f c, 10 insertions(+)\n\n';
          chs += 'Fri Jan 18 20:22:09 2019 +0100\n B.scss | 22 +++\n 1 f c, 6 insertions(+), 8 deletions(-)\n';
          chs += 'Sat Jan 19 20:22:09 2019 +0100\n B.scss | 22 +++\n 1 f c, 1 deletion(-)\n';
          chs += '------\n';
          chs += 'Sat Jan 19 21:22:09 2019 +0100\n C.scss | 22 +++\n 1 f c, 16 insertions(+)\n\n';
          chs += '------\n';
          const result = gitLogFileP.run(prep(chs));
          expect(result.isSuccess).to.be.true;
          expect(Array.isArray(result.value[0])).to.be.true;
          expect(result.value[0][0][0]).to.be.eql('A.scss');
          expect(Array.isArray(result.value[0][0][1])).to.be.true;
          expect(result.value[0][0][1][0].toString()).to.be.eql('P{Thu Jan 17 2019 19:22:09 GMT+0100 (Central European Standard Time),10}');
          expect(result.value[0][0][1][1].toString()).to.be.eql('P{Fri Jan 18 2019 19:22:09 GMT+0100 (Central European Standard Time),20}');
          expect(result.value[0][1][0]).to.be.eql('B.scss');
          expect(Array.isArray(result.value[0][1][1])).to.be.true;
          expect(result.value[0][1][1][0].toString()).to.be.eql('P{Thu Jan 17 2019 20:22:09 GMT+0100 (Central European Standard Time),10}');
          expect(result.value[0][1][1][1].toString()).to.be.eql('P{Fri Jan 18 2019 20:22:09 GMT+0100 (Central European Standard Time),8}');
          expect(result.value[0][1][1][2].toString()).to.be.eql('P{Sat Jan 19 2019 20:22:09 GMT+0100 (Central European Standard Time),7}');
          expect(result.value[0][2][0]).to.be.eql('C.scss');
          expect(Array.isArray(result.value[0][2][1])).to.be.true;
          expect(result.value[0][2][1][0].toString()).to.be.eql('P{Sat Jan 19 2019 21:22:09 GMT+0100 (Central European Standard Time),16}');
          expect(result.value[1].rest()).to.be.eql('');
        });
    });
});

function prep(str) {
  return str.replace(/\n/g, '§§')
}
