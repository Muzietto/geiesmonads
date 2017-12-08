import {expect} from 'chai';
import {parser} from 'parsers';

describe('a simple parser', () => {
    let parserA;

    beforeEach(() => {
        parserA = parser('a');
    });

    it('can parse a single char', () => {
        const parsingA = parserA('abc');
        expect(parsingA.first()).to.be.true;
        expect(parsingA.second()).to.be.eql('bc');
    });

    it('can also NOT parse a single char', () => {
        const parsingB = parserA('bcd');
        expect(parsingB.first()).to.be.false;
        expect(parsingB.second()).to.be.eql('bcd');
    });
});
