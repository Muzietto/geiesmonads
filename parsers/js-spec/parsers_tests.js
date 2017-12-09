import {expect} from 'chai';
import {
    parser1,
    parser2,
    pchar,
    andThen,
    orElse,
    choice,
    alternativeParsers,
} from 'parsers';
import {
    isPair,
    isSuccess,
    isFailure,
    isParser,
} from 'util';

describe('a parsers for a choice of chars', () => {
    let lowercases = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',];
    let uppercases = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',];

    it('can parse any lowercase char', () => {
        let lowercasesParser = alternativeParsers(lowercases);

        expect(isParser(lowercasesParser)).to.be.true;
        let parsingChoice = lowercasesParser.run('a');
        expect(isSuccess(parsingChoice)).to.be.true;
        expect(parsingChoice.first()).to.be.eql('a');
        expect(parsingChoice.second()).to.be.eql('');
        parsingChoice = lowercasesParser.run('b');
        expect(isSuccess(parsingChoice)).to.be.true;
        expect(parsingChoice.first()).to.be.eql('b');
        expect(parsingChoice.second()).to.be.eql('');
        parsingChoice = lowercasesParser.run('d');
        expect(isSuccess(parsingChoice)).to.be.true;
        expect(parsingChoice.first()).to.be.eql('d');
        expect(parsingChoice.second()).to.be.eql('');
        parsingChoice = lowercasesParser.run('z');
        expect(isSuccess(parsingChoice)).to.be.true;
        expect(parsingChoice.first()).to.be.eql('z');
        expect(parsingChoice.second()).to.be.eql('');

        parsingChoice = lowercasesParser.run('Y');
        expect(isFailure(parsingChoice)).to.be.true;
        expect(parsingChoice.first()).to.be.eql('parsing failed');
        expect(parsingChoice.second()).to.be.eql('Y');
    });

    it('can parse any uppercase char', () => {
        let uppercasesParser = alternativeParsers(uppercases);

        expect(isParser(uppercasesParser)).to.be.true;
        let parsingChoice = uppercasesParser.run('A');
        expect(isSuccess(parsingChoice)).to.be.true;
        expect(parsingChoice.first()).to.be.eql('A');
        expect(parsingChoice.second()).to.be.eql('');
        parsingChoice = uppercasesParser.run('B');
        expect(isSuccess(parsingChoice)).to.be.true;
        expect(parsingChoice.first()).to.be.eql('B');
        expect(parsingChoice.second()).to.be.eql('');
        parsingChoice = uppercasesParser.run('R');
        expect(isSuccess(parsingChoice)).to.be.true;
        expect(parsingChoice.first()).to.be.eql('R');
        expect(parsingChoice.second()).to.be.eql('');
        parsingChoice = uppercasesParser.run('Z');
        expect(isSuccess(parsingChoice)).to.be.true;
        expect(parsingChoice.first()).to.be.eql('Z');
        expect(parsingChoice.second()).to.be.eql('');

        parsingChoice = uppercasesParser.run('s');
        expect(isFailure(parsingChoice)).to.be.true;
        expect(parsingChoice.first()).to.be.eql('parsing failed');
        expect(parsingChoice.second()).to.be.eql('s');
    });
});

describe('a choice of parsers bound by orElse', () => {
    let parsersChoice;

    beforeEach(() => {
        parsersChoice = choice([pchar('a'), pchar('b'), pchar('c'), pchar('d'),]);
    });

    it('can parse one of four chars', () => {
        expect(isParser(parsersChoice)).to.be.true;
        let parsingChoice = parsersChoice.run('a');
        expect(isSuccess(parsingChoice)).to.be.true;
        expect(parsingChoice.first()).to.be.eql('a');
        expect(parsingChoice.second()).to.be.eql('');
        parsingChoice = parsersChoice.run('b');
        expect(isSuccess(parsingChoice)).to.be.true;
        expect(parsingChoice.first()).to.be.eql('b');
        expect(parsingChoice.second()).to.be.eql('');
        parsingChoice = parsersChoice.run('d');
        expect(isSuccess(parsingChoice)).to.be.true;
        expect(parsingChoice.first()).to.be.eql('d');
        expect(parsingChoice.second()).to.be.eql('');
    });

    it('can also parse NONE of four chars', () => {
        const parsingChoice = parsersChoice.run('x');
        expect(isFailure(parsingChoice)).to.be.true;
        expect(parsingChoice.first()).to.be.eql('parsing failed');
        expect(parsingChoice.second()).to.be.eql('x');
    });
});

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
