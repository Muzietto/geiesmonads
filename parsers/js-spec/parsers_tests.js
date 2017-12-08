import {expect} from 'chai';
import {
    parser1,
    parser2
} from 'parsers';
import {
    isPair,
    isSuccess,
    isFailure,
} from 'util';

describe('a simple parser', () => {
    let parserA;

    beforeEach(() => {
        parserA = parser1('a');
    });

    it('can parse a single char', () => {
        const parsingA = parserA('abc');
        expect(parsingA.first()).to.be.true;
        expect(parsingA.second()).to.be.eql('bc');
        expect(isPair(parsingA)).to.be.true;
    });

    it('can also NOT parse a single char', () => {
        const parsingB = parserA('bcd');
        expect(parsingB.first()).to.be.false;
        expect(parsingB.second()).to.be.eql('bcd');
        expect(isPair(parsingB)).to.be.true;
    });
});

describe('a slightly more complex parser', () => {
    let parserA;

    beforeEach(() => {
        parserA = parser2('a');
    });

    it('can parse a single char', () => {
        const parsingA = parserA('abc');
        expect(parsingA.first()).to.be.eql('got a');
        expect(parsingA.second()).to.be.eql('bc');
        expect(isSuccess(parsingA)).to.be.true;
    });

    it('can also NOT parse a single char', () => {
        const parsingB = parserA('bcd');
        expect(parsingB.first()).to.be.eql('missed a');
        expect(parsingB.second()).to.be.eql('bcd');
        expect(isFailure(parsingB)).to.be.true;
    });
});
