import { expect } from 'chai';
import {
  lineP,
  numberP,
} from '../git_log_parser';
import {
  pchar,
  logP,
  digitP,
} from '../lib/parsers';

describe('among git log parsers', () => {

    describe.only('lineP', () => {
        it('runs a parser and then expects a CR immediately after', () => {
            const line = lineP(pchar('a'));
            console.log(line.run('a\n').toString());
            expect(line.run('a\n').isSuccess).to.be.true;
        });
    });

    describe('numberP', () => {
      it('runs a parser and then expects a CR immediately after', () => {
          console.log(numberP.run('123').toString());
      });
  });
});
