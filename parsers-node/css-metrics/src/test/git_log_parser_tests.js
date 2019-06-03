import { expect } from 'chai';
import {
  lineP
} from '../lib/git_log_parser';

describe('among git log parsers', () => {

    describe('lineP', () => {
        it('runs a parser and then expects a CR immediately after', () => {
            const line = lineP(pchar('a'));
            expect(line.run('a').isSuccess).to.be.false;
            expect(line.run('a\n').isSuccess).to.be.true;
        });
    });
});
