import {expect} from 'chai';
import {
    charParser,
    digitParser,
    pchar,
    pdigit,
    andThen,
    orElse,
    choice,
    anyOf,
    fmap,
    returnP,
    applyP,
    lift2,
    sequenceP,
    sequenceP2,
    sequenceP3,
    pstring,
    zeroOrMore,
    many,
    many1,
    opt,
    optBook,
} from 'parsers';
import {
    isPair,
    isSuccess,
    isFailure,
    isParser,
    isSome,
    isNone,
} from 'util';

const lowercases = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',];
const uppercases = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',];
const digits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

describe('a parser for optional characters', () => {
    it('can capture or not capture a dot', () => {
        const optDotThenA = opt(pchar('.')).andThen(pchar('a'));
        expect(optDotThenA.run('.abc').toString()).to.be.eql('[[some(.),a],bc]');
        expect(optDotThenA.run('abc').toString()).to.be.eql('[[none(),a],bc]');
    });
    it('can parse SIGNED integers!!!', () => {
        const pint = many1(anyOf(digits))
            .fmap(l => parseInt(l.reduce((acc, curr) => acc + curr, ''), 10));
        const pSignedInt = opt(pchar('-'))
            .andThen(pint)
            .fmap(([maybeSign, number]) => (isSome(maybeSign)) ? -number : number);
        expect(pSignedInt.run('13243546x')[0]).to.be.eql(13243546);
        expect(pSignedInt.run('-13243546x')[0]).to.be.eql(-13243546);
    });
});

describe('a parser for one or more occurrences', () => {
    it('cannot parse a char zero times', () => {
        const zeroOrMoreParser = many1(pchar('m'));
        let parsing = zeroOrMoreParser.run('arco');
        expect(isFailure(parsing)).to.be.true;
        expect(parsing.toString()).to.be.eql('[wanted m; got a,arco]');
    });
    it('can parse a char many times', () => {
        const zeroOrMoreParser = many1(pchar('m'));
        let parsing = zeroOrMoreParser.run('mmmarco');
        expect(isSuccess(parsing)).to.be.true;
        expect(parsing.toString()).to.be.eql('[[m,m,m],arco]');
    });
    it('cannot parse a char sequence zero times', () => {
        const zeroOrMoreParser = many1(pstring('marco'));
        let parsing = zeroOrMoreParser.run('xmarcomarcociao');
        expect(isFailure(parsing)).to.be.true;
        expect(parsing.toString()).to.be.eql('[wanted m; got x,xmarcomarcociao]');
    });
    it('can parse a char sequence many times', () => {
        const zeroOrMoreParser = many1(pstring('marco'));
        let parsing = zeroOrMoreParser.run('marcomarcociao');
        expect(isSuccess(parsing)).to.be.true;
        expect(parsing.toString()).to.be.eql('[[[m,a,r,c,o],[m,a,r,c,o]],ciao]');
    });
    it('can parse an integer, no matter how large...', () => {
        const pint = many1(anyOf(digits));
        let parsing = pint.run('12345A');
        expect(isSuccess(parsing)).to.be.true;
        expect(parsing.toString()).to.be.eql('[[1,2,3,4,5],A]');
        parsing = pint.run('1B');
        expect(isSuccess(parsing)).to.be.true;
        expect(parsing.toString()).to.be.eql('[[1],B]');
        parsing = pint.run('A12345');
        expect(isFailure(parsing)).to.be.true;
        expect(parsing.toString()).to.be.eql('[parsing failed,A12345]');
    });
    it('can parse an integer into a true integer', () => {
        const pint = many1(anyOf(digits))
            .fmap(l => parseInt(l.reduce((acc, curr) => acc + curr, ''), 10));
        let parsing = pint.run('12345A');
        expect(isSuccess(parsing)).to.be.true;
        expect(parsing[0]).to.be.eql(12345);
        expect(parsing[1]).to.be.eql('A');
    });
});

describe('a parser for zero or more occurrences', () => {
    it('can parse a char zero times', () => {
        const zeroOrMoreParser = many(pchar('m'));
        let parsing = zeroOrMoreParser.run('arco');
        expect(isSuccess(parsing)).to.be.true;
        expect(parsing.toString()).to.be.eql('[[],arco]');
    });
    it('can parse a char many times', () => {
        const zeroOrMoreParser = many(pchar('m'));
        let parsing = zeroOrMoreParser.run('mmmarco');
        expect(isSuccess(parsing)).to.be.true;
        expect(parsing.toString()).to.be.eql('[[m,m,m],arco]');
    });
    it('can parse a char sequence zero times', () => {
        const zeroOrMoreParser = many(pstring('marco'));
        let parsing = zeroOrMoreParser.run('xmarcomarcociao');
        expect(isSuccess(parsing)).to.be.true;
        expect(parsing.toString()).to.be.eql('[[],xmarcomarcociao]');
    });
    it('can parse a char sequence many times', () => {
        const zeroOrMoreParser = many(pstring('marco'));
        let parsing = zeroOrMoreParser.run('marcomarcociao');
        expect(isSuccess(parsing)).to.be.true;
        expect(parsing.toString()).to.be.eql('[[[m,a,r,c,o],[m,a,r,c,o]],ciao]');
    });
});

describe('a parsing function for zero or more occurrences', () => {
    it('can parse a char zero times', () => {
        const zeroOrMoreParsingFunction = zeroOrMore(pchar('m'));
        let parsing = zeroOrMoreParsingFunction('arco');
        expect(isSuccess(parsing)).to.be.true;
        expect(parsing.toString()).to.be.eql('[[],arco]');
    });
    it('can parse a char many times', () => {
        const zeroOrMoreParsingFunction = zeroOrMore(pchar('m'));
        let parsing = zeroOrMoreParsingFunction('mmmarco');
        expect(isSuccess(parsing)).to.be.true;
        expect(parsing.toString()).to.be.eql('[[m,m,m],arco]');
    });
    it('can parse a char sequence zero times', () => {
        const zeroOrMoreParsingFunction = zeroOrMore(pstring('marco'));
        let parsing = zeroOrMoreParsingFunction('xmarcomarcociao');
        expect(isSuccess(parsing)).to.be.true;
        expect(parsing.toString()).to.be.eql('[[],xmarcomarcociao]');
    });
    it('can parse a char sequence many times', () => {
        const zeroOrMoreParsingFunction = zeroOrMore(pstring('marco'));
        let parsing = zeroOrMoreParsingFunction('marcomarcociao');
        expect(isSuccess(parsing)).to.be.true;
        expect(parsing.toString()).to.be.eql('[[[m,a,r,c,o],[m,a,r,c,o]],ciao]');
    });
});

describe('a parser for a specific word', () => {
    it('is easy to create with sequenceP', () => {
        const marcoParser = pstring('marco');
        const marcoParsing = marcoParser.run('marcociao');
        expect(isSuccess(marcoParsing)).to.be.true;
        expect(marcoParsing.toString()).to.be.eql('[[m,a,r,c,o],ciao]');
    });
});

describe('sequence for parsers based on lift2(cons) (aka sequenceP)', () => {
    it('stores matched chars inside an array', () => {
        const abcParser = sequenceP([pchar('a'), pchar('b'), pchar('c'),]);
        expect(abcParser.run('abc').toString()).to.be.eql('[[a,b,c],]');
    });
});

describe('sequences for parsers based on andThen && fmap (aka sequenceP2)', () => {
    it('store matched chars inside a plain string', () => {
        const abcParser = sequenceP2([pchar('a'), pchar('b'), pchar('c'),]);
        expect(abcParser.run('abc').toString()).to.be.eql('[abc,]');
    });
});

describe('lift2 for parsers', () => {
    it('operates on the results of two string parsings', () => {
        const addStrings = x => y => x + '+' + y;
        const AplusB = lift2(addStrings)(pchar('a'))(pchar('b'));
        expect(AplusB.run('abc').toString()).to.be.eql('[a+b,c]');
    });
    it('adds the results of two digit parsings', () => {
        const addDigits = x => y => x + y;
        const addParser = lift2(addDigits)(pdigit(1))(pdigit(2));
        expect(addParser.run('1234').toString()).to.be.eql('[3,34]');
        expect(isFailure(addParser.run('144'))).to.be.true;
    });
});

describe('parse 3 digits', () => {
    let parseDigit, threeDigits, parsing;
    beforeEach(() => {
        parseDigit = anyOf(digits);
        threeDigits = andThen(parseDigit, andThen(parseDigit, parseDigit));
        parsing = threeDigits.run('123');
    });
    it('parses any of three digits', () => {
        expect(isSuccess(parsing)).to.be.true;
        expect(parsing[0].toString()).to.be.eql('[1,[2,3]]');
        expect(parsing[1]).to.be.eql('');
    });
    describe('parses any of three digits while showcasing fmap', () => {
        it('as global method', () => {
            threeDigits = fmap(([x, [y, z]]) => [x, y, z], threeDigits);
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

describe('parse ABC', () => {
    let abcP, parsing;
    beforeEach(() => {
        abcP = andThen(pchar('a'),
            andThen(pchar('b'),
                andThen(pchar('c'), returnP('')).fmap(([x, y]) => x + y)
            ).fmap(([x, y]) => x + y)
        ).fmap(([x, y]) => x + y);
        parsing = abcP.run('abcd');
    });
    it('parses ABC', () => {
        expect(isSuccess(parsing)).to.be.true;
        expect(parsing[0].toString()).to.be.eql('abc');
        expect(parsing[1]).to.be.eql('d');
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
        parsersChoice = choice([pchar('a'), pchar('b'), pchar('c'), pchar('d'),]);
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
        parserAorB = orElse(pchar('a'), pchar('b'));
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
        expect(parsingAorB[0]).to.be.eql('wanted b; got c');
        expect(parsingAorB[1]).to.be.eql('cde');
    });
});

describe('two parsers bound by andThen', () => {
    let parserAandB;

    beforeEach(() => {
        parserAandB = andThen(pchar('a'), pchar('b'));
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
        expect(parsingAandB[0]).to.be.eql('wanted b; got c');
        expect(parsingAandB[1]).to.be.eql('cd');
    });
});

describe('a simple parser', () => {
    const parserA = charParser('a');
    const parser1 = digitParser(1);

    it('can parse a single char', () => {
        const parsingA = parserA('abc');
        expect(parsingA[0]).to.be.eql('a');
        expect(parsingA[1]).to.be.eql('bc');
        expect(isSuccess(parsingA)).to.be.true;
    });

    it('can also NOT parse a single char', () => {
        const parsingB = parserA('bcd');
        expect(parsingB[0]).to.be.eql('wanted a; got b');
        expect(parsingB[1]).to.be.eql('bcd');
        expect(isFailure(parsingB)).to.be.true;
    });

    it('can parse a single digit', () => {
        const parsing1 = parser1('123');
        expect(parsing1[0]).to.be.eql(1);
        expect(parsing1[1]).to.be.eql('23');
        expect(isSuccess(parsing1)).to.be.true;
    });

    it('can also NOT parse a single digit', () => {
        const parsing2 = parser1('234');
        expect(parsing2[0]).to.be.eql('wanted 1; got 2');
        expect(parsing2[1]).to.be.eql('234');
        expect(isFailure(parsing2)).to.be.true;
    });
});

describe('a slightly more complex parser', () => {
    const parserA = charParser('a');

    it('can parse a single char', () => {
        const parsingA = parserA('abc');
        expect(parsingA[0]).to.be.eql('a');
        expect(parsingA[1]).to.be.eql('bc');
        expect(isSuccess(parsingA)).to.be.true;
    });

    it('can also NOT parse a single char', () => {
        const parsingB = parserA('bcd');
        expect(parsingB[0]).to.be.eql('wanted a; got b');
        expect(parsingB[1]).to.be.eql('bcd');
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
        expect(parsingA[0]).to.be.eql('a');
        expect(parsingA[1]).to.be.eql('bc');
        expect(isSuccess(parsingA)).to.be.true;
    });

    it('can also NOT parse a single char', () => {
        const parsingB = parserA.run('bcd');
        expect(parsingB[0]).to.be.eql('wanted a; got b');
        expect(parsingB[1]).to.be.eql('bcd');
        expect(isFailure(parsingB)).to.be.true;
    });
});
