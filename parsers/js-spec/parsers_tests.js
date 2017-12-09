import {expect} from 'chai';
import {
    parser1,
    parser2,
    pchar,
    andThen,
    orElse,
} from 'parsers';
import {
    isPair,
    isSuccess,
    isFailure,
    isParser,
} from 'util';

describe('two parsers bound by orElse', () => {
    let parserA, parserB, parserAorB;

    beforeEach(() => {
        parserAorB = orElse(pchar('a'), pchar('b'));
    });

    it('can parse one of two chars', () => {
        expect(isParser(parserAorB)).to.be.true;
        let parsingAorB = parserAorB.run('abc');
        expect(isSuccess(parsingAorB)).to.be.true;
        expect(parsingAorB.first()).to.be.eql('a');
        expect(parsingAorB.second()).to.be.eql('bc');
        parsingAorB = parserAorB.run('bbc');
        expect(isSuccess(parsingAorB)).to.be.true;
        expect(parsingAorB.first()).to.be.eql('b');
        expect(parsingAorB.second()).to.be.eql('bc');
    });

    it('can also parse NONE of two chars', () => {
        const parsingAorB = parserAorB.run('cde');
        expect(isFailure(parsingAorB)).to.be.true;
        expect(parsingAorB.first()).to.be.eql('b');
        expect(parsingAorB.second()).to.be.eql('cde');
    });
});

describe('two parsers bound by andThen', () => {
    let parserA, parserB, parserAandB;

    beforeEach(() => {
        parserAandB = andThen(pchar('a'), pchar('b'));
    });

    it('can parse two chars', () => {
        expect(isParser(parserAandB)).to.be.true;
        const parsingAandB = parserAandB.run('abc');
        expect(isSuccess(parsingAandB)).to.be.true;
        expect(parsingAandB.first()).to.be.eql('ab');
        expect(parsingAandB.second()).to.be.eql('c');
    });

    it('can also NOT parse two chars', () => {
        const parsingAandB = parserAandB.run('acd');
        expect(isFailure(parsingAandB)).to.be.true;
        expect(parsingAandB.first()).to.be.eql('b');
        expect(parsingAandB.second()).to.be.eql('cd');
    });
});

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
        expect(parsingA.first()).to.be.eql('a');
        expect(parsingA.second()).to.be.eql('bc');
        expect(isSuccess(parsingA)).to.be.true;
    });

    it('can also NOT parse a single char', () => {
        const parsingB = parserA('bcd');
        expect(parsingB.first()).to.be.eql('a');
        expect(parsingB.second()).to.be.eql('bcd');
        expect(isFailure(parsingB)).to.be.true;
    });
});

describe('a named character parser', () => {
    let parserA;

    beforeEach(() => {
        parserA = pchar('a');
    });

    it('can parse a single char', () => {
        expect(isParser(parserA)).to.be.true;
        const parsingA = parserA.run('abc');
        expect(parsingA.first()).to.be.eql('a');
        expect(parsingA.second()).to.be.eql('bc');
        expect(isSuccess(parsingA)).to.be.true;
    });

    it('can also NOT parse a single char', () => {
        const parsingB = parserA.run('bcd');
        expect(parsingB.first()).to.be.eql('a');
        expect(parsingB.second()).to.be.eql('bcd');
        expect(isFailure(parsingB)).to.be.true;
    });
});
