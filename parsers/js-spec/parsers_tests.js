import {expect} from 'chai';
import {
    parser1,
    parser2,
    charParser,
    andThen,
    orElse,
    choice,
    anyOf,
    fmap,
} from 'parsers';
import {
    isPair,
    isSuccess,
    isFailure,
    isParser,
} from 'util';

const lowercases = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',];
const uppercases = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',];
const digits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];


describe('parse 3 digits', () => {
    let parseDigit, threeDigits, parsing;
    beforeEach(() => {
        parseDigit = anyOf(digits);
        threeDigits = andThen(parseDigit, andThen(parseDigit, parseDigit));
        parsing = threeDigits.run('123');
    });
    it('parses three digits', () => {
        expect(isSuccess(parsing)).to.be.true;
        expect(parsing[0].toString()).to.be.eql('[1,[2,3]]');
        expect(parsing[1]).to.be.eql('');
    });
    describe('parses three digits while showcasing fmap', () => {
        it('as global method', () => {
            threeDigits = fmap(threeDigits, ([x, [y, z]]) => [x, y, z]);
            let parsing = threeDigits.run('123');
            expect(isSuccess(parsing)).to.be.true;
            expect(parsing[0].toString()).to.be.eql('[1,2,3]');
            expect(parsing[1]).to.be.eql('');
        });
        it('as instance method', () => {
            threeDigits = threeDigits.fmap(([x, [y, z]]) => [x, y, z]);
            let parsing = threeDigits.run('123');
            expect(isSuccess(parsing)).to.be.true;
            expect(parsing[0].toString()).to.be.eql('[1,2,3]');
            expect(parsing[1]).to.be.eql('');
        });
    });
});

describe('a parsers for any of a list of chars', () => {

    it('can parse any lowercase char', () => {
        let lowercasesParser = anyOf(lowercases);

        expect(isParser(lowercasesParser)).to.be.true;
        let parsingChoice = lowercasesParser.run('a');
        expect(isSuccess(parsingChoice)).to.be.true;
        expect(parsingChoice[0]).to.be.eql('a');
        expect(parsingChoice[1]).to.be.eql('');
        parsingChoice = lowercasesParser.run('b');
        expect(isSuccess(parsingChoice)).to.be.true;
        expect(parsingChoice[0]).to.be.eql('b');
        expect(parsingChoice[1]).to.be.eql('');
        parsingChoice = lowercasesParser.run('d');
        expect(isSuccess(parsingChoice)).to.be.true;
        expect(parsingChoice[0]).to.be.eql('d');
        expect(parsingChoice[1]).to.be.eql('');
        parsingChoice = lowercasesParser.run('z');
        expect(isSuccess(parsingChoice)).to.be.true;
        expect(parsingChoice[0]).to.be.eql('z');
        expect(parsingChoice[1]).to.be.eql('');

        parsingChoice = lowercasesParser.run('Y');
        expect(isFailure(parsingChoice)).to.be.true;
        expect(parsingChoice[0]).to.be.eql('parsing failed');
        expect(parsingChoice[1]).to.be.eql('Y');
    });

    it('can parse any uppercase char', () => {
        let uppercasesParser = anyOf(uppercases);

        expect(isParser(uppercasesParser)).to.be.true;
        let parsingChoice = uppercasesParser.run('A');
        expect(isSuccess(parsingChoice)).to.be.true;
        expect(parsingChoice[0]).to.be.eql('A');
        expect(parsingChoice[1]).to.be.eql('');
        parsingChoice = uppercasesParser.run('B');
        expect(isSuccess(parsingChoice)).to.be.true;
        expect(parsingChoice[0]).to.be.eql('B');
        expect(parsingChoice[1]).to.be.eql('');
        parsingChoice = uppercasesParser.run('R');
        expect(isSuccess(parsingChoice)).to.be.true;
        expect(parsingChoice[0]).to.be.eql('R');
        expect(parsingChoice[1]).to.be.eql('');
        parsingChoice = uppercasesParser.run('Z');
        expect(isSuccess(parsingChoice)).to.be.true;
        expect(parsingChoice[0]).to.be.eql('Z');
        expect(parsingChoice[1]).to.be.eql('');

        parsingChoice = uppercasesParser.run('s');
        expect(isFailure(parsingChoice)).to.be.true;
        expect(parsingChoice[0]).to.be.eql('parsing failed');
        expect(parsingChoice[1]).to.be.eql('s');
    });

    it('can parse any digit', () => {
        let digitsParser = anyOf(digits);

        expect(isParser(digitsParser)).to.be.true;
        let parsingChoice = digitsParser.run('1');
        expect(isSuccess(parsingChoice)).to.be.true;
        expect(parsingChoice[0]).to.be.eql('1');
        expect(parsingChoice[1]).to.be.eql('');
        parsingChoice = digitsParser.run('3');
        expect(isSuccess(parsingChoice)).to.be.true;
        expect(parsingChoice[0]).to.be.eql('3');
        expect(parsingChoice[1]).to.be.eql('');
        parsingChoice = digitsParser.run('0');
        expect(isSuccess(parsingChoice)).to.be.true;
        expect(parsingChoice[0]).to.be.eql('0');
        expect(parsingChoice[1]).to.be.eql('');
        parsingChoice = digitsParser.run('8');
        expect(isSuccess(parsingChoice)).to.be.true;
        expect(parsingChoice[0]).to.be.eql('8');
        expect(parsingChoice[1]).to.be.eql('');

        parsingChoice = digitsParser.run('s');
        expect(isFailure(parsingChoice)).to.be.true;
        expect(parsingChoice[0]).to.be.eql('parsing failed');
        expect(parsingChoice[1]).to.be.eql('s');
    });
});

describe('a choice of parsers bound by orElse', () => {
    let parsersChoice;

    beforeEach(() => {
        parsersChoice = choice([charParser('a'), charParser('b'), charParser('c'), charParser('d'),]);
    });

    it('can parse one of four chars', () => {
        expect(isParser(parsersChoice)).to.be.true;
        let parsingChoice = parsersChoice.run('a');
        expect(isSuccess(parsingChoice)).to.be.true;
        expect(parsingChoice[0]).to.be.eql('a');
        expect(parsingChoice[1]).to.be.eql('');
        parsingChoice = parsersChoice.run('b');
        expect(isSuccess(parsingChoice)).to.be.true;
        expect(parsingChoice[0]).to.be.eql('b');
        expect(parsingChoice[1]).to.be.eql('');
        parsingChoice = parsersChoice.run('d');
        expect(isSuccess(parsingChoice)).to.be.true;
        expect(parsingChoice[0]).to.be.eql('d');
        expect(parsingChoice[1]).to.be.eql('');
    });

    it('can also parse NONE of four chars', () => {
        const parsingChoice = parsersChoice.run('x');
        expect(isFailure(parsingChoice)).to.be.true;
        expect(parsingChoice[0]).to.be.eql('parsing failed');
        expect(parsingChoice[1]).to.be.eql('x');
    });
});

describe('two parsers bound by orElse', () => {
    let parserA, parserB, parserAorB;

    beforeEach(() => {
        parserAorB = orElse(charParser('a'), charParser('b'));
    });

    it('can parse one of two chars', () => {
        expect(isParser(parserAorB)).to.be.true;
        let parsingAorB = parserAorB.run('abc');
        expect(isSuccess(parsingAorB)).to.be.true;
        expect(parsingAorB[0]).to.be.eql('a');
        expect(parsingAorB[1]).to.be.eql('bc');
        parsingAorB = parserAorB.run('bbc');
        expect(isSuccess(parsingAorB)).to.be.true;
        expect(parsingAorB[0]).to.be.eql('b');
        expect(parsingAorB[1]).to.be.eql('bc');
    });

    it('can also parse NONE of two chars', () => {
        const parsingAorB = parserAorB.run('cde');
        expect(isFailure(parsingAorB)).to.be.true;
        expect(parsingAorB[0]).to.be.eql('b');
        expect(parsingAorB[1]).to.be.eql('cde');
    });
});

describe('two parsers bound by andThen', () => {
    let parserAandB;

    beforeEach(() => {
        parserAandB = andThen(charParser('a'), charParser('b'));
    });

    it('can parse two chars', () => {
        expect(isParser(parserAandB)).to.be.true;
        const parsingAandB = parserAandB.run('abc');
        expect(isSuccess(parsingAandB)).to.be.true;
        expect(parsingAandB[0].toString()).to.be.eql('[a,b]');
        expect(parsingAandB[1]).to.be.eql('c');
        expect(parsingAandB.toString()).to.be.eql('[[a,b],c]');
    });

    it('can also NOT parse two chars', () => {
        const parsingAandB = parserAandB.run('acd');
        expect(isFailure(parsingAandB)).to.be.true;
        expect(parsingAandB[0]).to.be.eql('b');
        expect(parsingAandB[1]).to.be.eql('cd');
    });
});

describe('a simple parser', () => {
    let parserA;

    beforeEach(() => {
        parserA = parser1('a');
    });

    it('can parse a single char', () => {
        const parsingA = parserA('abc');
        expect(parsingA[0]).to.be.true;
        expect(parsingA[1]).to.be.eql('bc');
        expect(isPair(parsingA)).to.be.true;
    });

    it('can also NOT parse a single char', () => {
        const parsingB = parserA('bcd');
        expect(parsingB[0]).to.be.false;
        expect(parsingB[1]).to.be.eql('bcd');
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
        expect(parsingA[0]).to.be.eql('a');
        expect(parsingA[1]).to.be.eql('bc');
        expect(isSuccess(parsingA)).to.be.true;
    });

    it('can also NOT parse a single char', () => {
        const parsingB = parserA('bcd');
        expect(parsingB[0]).to.be.eql('a');
        expect(parsingB[1]).to.be.eql('bcd');
        expect(isFailure(parsingB)).to.be.true;
    });
});

describe('a named character parser', () => {
    let parserA;

    beforeEach(() => {
        parserA = charParser('a');
    });

    it('can parse a single char', () => {
        expect(isParser(parserA)).to.be.true;
        const parsingA = parserA.run('abc');
        expect(parsingA[0]).to.be.eql('a');
        expect(parsingA[1]).to.be.eql('bc');
        expect(isSuccess(parsingA)).to.be.true;
    });

    it('can also NOT parse a single char', () => {
        const parsingB = parserA.run('bcd');
        expect(parsingB[0]).to.be.eql('a');
        expect(parsingB[1]).to.be.eql('bcd');
        expect(isFailure(parsingB)).to.be.true;
    });
});
