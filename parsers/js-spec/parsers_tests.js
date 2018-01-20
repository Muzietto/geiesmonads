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
    pstring,
    zeroOrMore,
    many,
    many1,
    manyChars,
    manyChars1,
    opt,
    optBook,
    discardFirst,
    discardSecond,
    sepBy1,
    between,
    betweenParens,
    tapP,
    logP,
} from 'parsers';
import {
    isPair,
    isSuccess,
    isFailure,
    isParser,
    isSome,
    isNone,
} from 'util';
import {Maybe} from 'maybe';
import {Validation} from 'validation';
import {Position} from 'classes';

const lowercases = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',];
const uppercases = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',];
const digits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
const whites = [' ', '\t', '\n', '\r'];
const text = Position.fromText;

describe('a very simple parser for chars or for digits', () => {
    const parserA = charParser('a');
    const parser1 = digitParser(1);

    it('can parse a single char', () => {
        const parsingA = parserA(text('abc'));
        expect(parsingA.value[0]).to.be.eql('a');
        expect(parsingA.value[1].rest()).to.be.eql('bc');
        expect(parsingA.isSuccess).to.be.true;
    });

    it('can also NOT parse a single char', () => {
        const parsingB = parserA(text('bcd'));
        expect(parsingB.value[0]).to.be.eql('charParser');
        expect(parsingB.value[1]).to.be.eql('wanted a; got b');
        expect(parsingB.value[2].rest()).to.be.eql('bcd');
        expect(parsingB.isFailure).to.be.true;
    });

    it('fails at the end of the stream', () => {
        const parsingA = parserA(text(''));
        expect(parsingA.value[0]).to.be.eql('charParser');
        expect(parsingA.value[1]).to.be.eql('no more input');
        expect(parsingA.value[2].rest()).to.be.eql('');
        expect(parsingA.isFailure).to.be.true;
    });

    it('can parse a single digit', () => {
        const parsing1 = parser1(text('123'));
        expect(parsing1.value[0]).to.be.eql(1);
        expect(parsing1.value[1].rest()).to.be.eql('23');
        expect(parsing1.isSuccess).to.be.true;
    });

    it('can also NOT parse a single digit', () => {
        const parsing2 = parser1(text('234'));
        expect(parsing2.value[0]).to.be.eql('digitParser');
        expect(parsing2.value[1]).to.be.eql('wanted 1; got 2');
        expect(parsing2.value[2].rest()).to.be.eql('234');
        expect(parsing2.isFailure).to.be.true;
    });

    it('fails at the end of the stream also when hunting for digits', () => {
        const parsing3 = parser1(text(''));
        expect(parsing3.value[0]).to.be.eql('digitParser');
        expect(parsing3.value[1]).to.be.eql('no more input');
        expect(parsing3.value[2].rest()).to.be.eql('');
        expect(parsing3.isFailure).to.be.true;
    });
});

describe('a named character parser', () => {
    const parserA = pchar('a');

    it('can parse a single char', () => {
        expect(isParser(parserA)).to.be.true;
        const parsingA = parserA.run(text('abc'));
        expect(parsingA.value[0]).to.be.eql('a');
        expect(parsingA.value[1].rest()).to.be.eql('bc');
        expect(parsingA.isSuccess).to.be.true;
    });

    it('can also NOT parse a single char', () => {
        const parsingB = parserA.run(text('bcd'));
        expect(parsingB.value[0]).to.be.eql('pchar_a');
        expect(parsingB.value[1]).to.be.eql('wanted a; got b');
        expect(parsingB.isFailure).to.be.true;
    });
});

describe('two parsers bound by andThen', () => {
    const parserAandB = andThen(pchar('a'), pchar('b'));

    it('can parse two chars', () => {
        expect(isParser(parserAandB)).to.be.true;
        const parsingAandB = parserAandB.run(text('abc'));
        expect(parsingAandB.isSuccess).to.be.true;
        expect(parsingAandB.value[0].toString()).to.be.eql('[a,b]');
        expect(parsingAandB.value[1].rest()).to.be.eql('c');
        expect(parsingAandB.toString()).to.be.eql('Validation.Success([[a,b],row=0;col=2;rest=c])');
    });

    it('can also NOT parse two chars', () => {
        const parsingAandB = parserAandB.run(text('acd'));
        expect(parsingAandB.isFailure).to.be.true;
        expect(parsingAandB.value[0]).to.be.eql('pchar_a andThen pchar_b');
        expect(parsingAandB.value[1]).to.be.eql('wanted b; got c');
        expect(parsingAandB.value[2].rest()).to.be.eql('cd');
    });

    it('will fail if the input is too short', () => {
        expect(parserAandB.run(text('a')).isFailure).to.be.true;
        expect(parserAandB.run(text('ab')).isSuccess).to.be.true;
    });
});

describe('two parsers bound by orElse', () => {
    const parserAorB = orElse(pchar('a'), pchar('b'));

    it('can parse one of two chars', () => {
        expect(isParser(parserAorB)).to.be.true;
        let parsingAorB = parserAorB.run(text('abc'));
        expect(parsingAorB.isSuccess).to.be.true;
        expect(parsingAorB.value[0]).to.be.eql('a');
        expect(parsingAorB.value[1].rest()).to.be.eql('bc');
        parsingAorB = parserAorB.run(text('bbc'));
        expect(parsingAorB.isSuccess).to.be.true;
        expect(parsingAorB.value[0]).to.be.eql('b');
        expect(parsingAorB.value[1].rest()).to.be.eql('bc');
    });

    it('can also parse NONE of two chars', () => {
        const parsingAorB = parserAorB.run(text('cde'));
        expect(parsingAorB.isFailure).to.be.true;
        expect(parsingAorB.value[0]).to.be.eql('pchar_a orElse pchar_b');
        expect(parsingAorB.value[1]).to.be.eql('wanted b; got c');
        expect(parsingAorB.value[2].rest()).to.be.eql('cde');
    });

    it('will fail if the input is too short', () => {
        expect(parserAorB.run(text('a')).isSuccess).to.be.true;
        expect(parserAorB.run(text('')).isFailure).to.be.true;
    });
});

describe('a choice of parsers bound by orElse', () => {
    const parsersChoice = choice([pchar('a'), pchar('b'), pchar('c'), pchar('d'),]);

    it('can parse one of four chars', () => {
        expect(isParser(parsersChoice)).to.be.true;
        let parsingChoice = parsersChoice.run(text('a'));
        expect(parsingChoice.isSuccess).to.be.true;
        expect(parsingChoice.value[0]).to.be.eql('a');
        expect(parsingChoice.value[1].rest()).to.be.eql('');
        parsingChoice = parsersChoice.run(text('b'));
        expect(parsingChoice.isSuccess).to.be.true;
        expect(parsingChoice.value[0]).to.be.eql('b');
        expect(parsingChoice.value[1].rest()).to.be.eql('');
        parsingChoice = parsersChoice.run(text('d'));
        expect(parsingChoice.isSuccess).to.be.true;
        expect(parsingChoice.value[0]).to.be.eql('d');
        expect(parsingChoice.value[1].rest()).to.be.eql('');
    });

    it('can also parse NONE of four chars', () => {
        const parsingChoice = parsersChoice.run(text('x'));
        expect(parsingChoice.isFailure).to.be.true;
        expect(parsingChoice.value[0]).to.be.eql('choice /pchar_a/pchar_b/pchar_c/pchar_d');
        expect(parsingChoice.value[1]).to.be.eql('_fail');
        expect(parsingChoice.value[2].rest()).to.be.eql('x');
    });

    it('will fail if the input is too short', () => {
        expect(parsersChoice.run(text('a')).isSuccess).to.be.true;
        expect(parsersChoice.run(text('')).isFailure).to.be.true;
    });
});

describe('a parser for any of a list of chars', () => {
    it('can parse any lowercase char', () => {
        const lowercasesParser = anyOf(lowercases);

        expect(isParser(lowercasesParser)).to.be.true;
        let parsingChoice = lowercasesParser.run(text('a'));
        expect(parsingChoice.isSuccess).to.be.true;
        expect(parsingChoice.value[0]).to.be.eql('a');
        expect(parsingChoice.value[1].rest()).to.be.eql('');
        parsingChoice = lowercasesParser.run(text('b'));
        expect(parsingChoice.isSuccess).to.be.true;
        expect(parsingChoice.value[0]).to.be.eql('b');
        expect(parsingChoice.value[1].rest()).to.be.eql('');
        parsingChoice = lowercasesParser.run(text('d'));
        expect(parsingChoice.isSuccess).to.be.true;
        expect(parsingChoice.value[0]).to.be.eql('d');
        expect(parsingChoice.value[1].rest()).to.be.eql('');
        parsingChoice = lowercasesParser.run(text('z'));
        expect(parsingChoice.isSuccess).to.be.true;
        expect(parsingChoice.value[0]).to.be.eql('z');
        expect(parsingChoice.value[1].rest()).to.be.eql('');

        parsingChoice = lowercasesParser.run(text('Y'));
        expect(parsingChoice.isFailure).to.be.true;
        expect(parsingChoice.value[0]).to.be.eql('anyOf abcdefghijklmnopqrstuvwxyz');
        expect(parsingChoice.value[1]).to.be.eql('_fail');
        expect(parsingChoice.value[2].rest()).to.be.eql('Y');
    });

    it('can parse any uppercase char', () => {
        let uppercasesParser = anyOf(uppercases);

        expect(isParser(uppercasesParser)).to.be.true;
        let parsingChoice = uppercasesParser.run(text('A'));
        expect(parsingChoice.isSuccess).to.be.true;
        expect(parsingChoice.value[0]).to.be.eql('A');
        expect(parsingChoice.value[1].rest()).to.be.eql('');
        parsingChoice = uppercasesParser.run(text('B'));
        expect(parsingChoice.isSuccess).to.be.true;
        expect(parsingChoice.value[0]).to.be.eql('B');
        expect(parsingChoice.value[1].rest()).to.be.eql('');
        parsingChoice = uppercasesParser.run(text('R'));
        expect(parsingChoice.isSuccess).to.be.true;
        expect(parsingChoice.value[0]).to.be.eql('R');
        expect(parsingChoice.value[1].rest()).to.be.eql('');
        parsingChoice = uppercasesParser.run(text('Z'));
        expect(parsingChoice.isSuccess).to.be.true;
        expect(parsingChoice.value[0]).to.be.eql('Z');
        expect(parsingChoice.value[1].rest()).to.be.eql('');

        parsingChoice = uppercasesParser.run(text('s'));
        expect(parsingChoice.isFailure).to.be.true;
        expect(parsingChoice.value[0]).to.be.eql('anyOf ABCDEFGHIJKLMNOPQRSTUVWXYZ');
        expect(parsingChoice.value[1]).to.be.eql('_fail');
        expect(parsingChoice.value[2].rest()).to.be.eql('s');
    });

    it('can parse any digit', () => {
        let digitsParser = anyOf(digits);

        expect(isParser(digitsParser)).to.be.true;
        let parsingChoice = digitsParser.run(text('1'));
        expect(parsingChoice.isSuccess).to.be.true;
        expect(parsingChoice.value[0]).to.be.eql('1');
        expect(parsingChoice.value[1].rest()).to.be.eql('');
        parsingChoice = digitsParser.run(text('3'));
        expect(parsingChoice.isSuccess).to.be.true;
        expect(parsingChoice.value[0]).to.be.eql('3');
        expect(parsingChoice.value[1].rest()).to.be.eql('');
        parsingChoice = digitsParser.run(text('0'));
        expect(parsingChoice.isSuccess).to.be.true;
        expect(parsingChoice.value[0]).to.be.eql('0');
        expect(parsingChoice.value[1].rest()).to.be.eql('');
        parsingChoice = digitsParser.run(text('8'));
        expect(parsingChoice.isSuccess).to.be.true;
        expect(parsingChoice.value[0]).to.be.eql('8');
        expect(parsingChoice.value[1].rest()).to.be.eql('');

        parsingChoice = digitsParser.run(text('s'));
        expect(parsingChoice.isFailure).to.be.true;
        expect(parsingChoice.value[0]).to.be.eql('anyOf 0123456789');
        expect(parsingChoice.value[1]).to.be.eql('_fail');
        expect(parsingChoice.value[2].rest()).to.be.eql('s');
    });

    it('will fail if the input is too short', () => {
        expect(anyOf(lowercases).run(text('')).isFailure).to.be.true;
        expect(anyOf(digits).run(text('')).isFailure).to.be.true;
    });
});
describe('parse ABC', () => {
    it('parses ABC', () => {
        const pairAdder = ([x, y]) => x + y;
        const abcP = andThen(
            pchar('a'),
            andThen(
                pchar('b'),
                andThen(
                    pchar('c'),
                    returnP('')
                ).fmap(pairAdder)
            ).fmap(pairAdder)
        ).fmap(pairAdder);
        const parsing = abcP.run('abcd');
        expect(parsing.isSuccess).to.be.true;
        expect(parsing.value[0].toString()).to.be.eql('abc');
        expect(parsing.value[1].rest()).to.be.eql('d');
    });
});

describe('parse 3 digits', () => {
    let parseDigit, threeDigits, parsing;

    before(() => {
        parseDigit = anyOf(digits);
        threeDigits = andThen(parseDigit, andThen(parseDigit, parseDigit));
        parsing = threeDigits.run('123');
    });
    it('parses any of three digits', () => {
        expect(parsing.isSuccess).to.be.true;
        expect(parsing.value[0].toString()).to.be.eql('[1,[2,3]]');
        expect(parsing.value[1].rest()).to.be.eql('');
    });
    describe('parses any of three digits while showcasing fmap', () => {
        const unpacker = ([x, [y, z]]) => {
            return [x, y, z];
        };
        it('as global method', () => {
            const threeDigitsImpl = fmap(unpacker, threeDigits);
            let parsing = threeDigitsImpl.run('123');
            expect(parsing.isSuccess).to.be.true;
            expect(parsing.value[0].toString()).to.be.eql('[1,2,3]');
            expect(parsing.value[1].rest()).to.be.eql('');
        });
        it('as instance method', () => {
            const threeDigitsInst = threeDigits.fmap(unpacker);
            let parsing = threeDigitsInst.run('123');
            expect(parsing.isSuccess).to.be.true;
            expect(parsing.value[0].toString()).to.be.eql('[1,2,3]');
            expect(parsing.value[1].rest()).to.be.eql('');
        });
    });
});

describe('lift2 for parsers', () => {
    it('operates on the results of two string parsings', () => {
        const addStrings = x => y => x + '+' + y;
        const AplusB = lift2(addStrings)(pchar('a'))(pchar('b'));
        expect(AplusB.run('abc').toString()).to.be.eql('Validation.Success([a+b,row=0;col=2;rest=c])');
    });
    it('adds the results of two digit parsings', () => {
        const addDigits = x => y => x + y;
        const addParser = lift2(addDigits)(pdigit(1))(pdigit(2));
        expect(addParser.run('1234').toString()).to.be.eql('Validation.Success([3,row=0;col=2;rest=34])');
        expect(addParser.run('144').isFailure).to.be.true;
    });
});

describe('sequences of parsers based on andThen && fmap (aka sequenceP2)', () => {
    it('store matched chars inside a plain string', () => {
        const abcParser = sequenceP2([pchar('a'), pchar('b'), pchar('c'),]);
        expect(abcParser.run('abc').toString())
            .to.be.eql('Validation.Success([abc,row=1;col=0;rest=])');
    });
});

describe('sequences of parsers based on lift2(cons) (aka sequenceP)', () => {
    it('stores matched chars inside an array', () => {
        const abcParser = sequenceP([pchar('a'), pchar('b'), pchar('c'),]);
        expect(abcParser.run('abc').toString())
            .to.be.eql('Validation.Success([[a,b,c],row=1;col=0;rest=])');
    });
});

describe('a parser for a specific word', () => {
    it('is easy to create with sequenceP', () => {
        const marcoParser = pstring('marco');
        const marcoParsing = marcoParser.run('marcociao');
        expect(marcoParsing.isSuccess).to.be.true;
        expect(marcoParsing.toString())
            .to.be.eql('Validation.Success([[m,a,r,c,o],row=0;col=5;rest=ciao])');
    });
});

describe('a parsing function for zero or more occurrences', () => {
    it('can parse a char zero times', () => {
        const zeroOrMoreParsingFunction = zeroOrMore(pchar('m'));
        let parsing = zeroOrMoreParsingFunction(text('arco'));
        expect(parsing.isSuccess).to.be.true;
        expect(parsing.toString()).to.be.eql('Validation.Success([[],row=0;col=0;rest=arco])');
    });
    it('can parse a char many times', () => {
        const zeroOrMoreParsingFunction = zeroOrMore(pchar('m'));
        let parsing = zeroOrMoreParsingFunction(text('mmmarco'));
        expect(parsing.isSuccess).to.be.true;
        expect(parsing.toString()).to.be.eql('Validation.Success([[m,m,m],row=0;col=3;rest=arco])');
    });
    it('can parse a char sequence zero times', () => {
        const zeroOrMoreParsingFunction = zeroOrMore(pstring('marco'));
        let parsing = zeroOrMoreParsingFunction(text('xmarcomarcociao'));
        expect(parsing.isSuccess).to.be.true;
        expect(parsing.toString()).to.be.eql('Validation.Success([[],row=0;col=0;rest=xmarcomarcociao])');
    });
    it('can parse a char sequence many times', () => {
        const zeroOrMoreParsingFunction = zeroOrMore(pstring('marco'));
        let parsing = zeroOrMoreParsingFunction(text('marcomarcociao'));
        expect(parsing.isSuccess).to.be.true;
        expect(parsing.toString())
            .to.be.eql('Validation.Success([[[m,a,r,c,o],[m,a,r,c,o]],row=0;col=10;rest=ciao])');
    });
});

describe('a parser for zero or more occurrences', () => {
    it('can parse a char zero times', () => {
        const zeroOrMoreParser = many(pchar('m'));
        let parsing = zeroOrMoreParser.run(text('arco'));
        expect(parsing.isSuccess).to.be.true;
        expect(parsing.toString()).to.be.eql('Validation.Success([[],row=0;col=0;rest=arco])');
    });
    it('can parse a char many times and return an array', () => {
        const zeroOrMoreParser = many(pchar('m'));
        let parsing = zeroOrMoreParser.run(text('mmmarco'));
        expect(parsing.isSuccess).to.be.true;
        expect(parsing.toString()).to.be.eql('Validation.Success([[m,m,m],row=0;col=3;rest=arco])');
    });
    it('can parse a char many times and return a string', () => {
        const zeroOrMoreParser = manyChars(pchar('m'));
        let parsing = zeroOrMoreParser.run(text('mmmarco'));
        expect(parsing.isSuccess).to.be.true;
        expect(parsing.toString()).to.be.eql('Validation.Success([mmm,row=0;col=3;rest=arco])');
    });
    it('can parse a char sequence zero times', () => {
        const zeroOrMoreParser = many(pstring('marco'));
        let parsing = zeroOrMoreParser.run(text('xmarcomarcociao'));
        expect(parsing.isSuccess).to.be.true;
        expect(parsing.toString()).to.be.eql('Validation.Success([[],row=0;col=0;rest=xmarcomarcociao])');
    });
    it('can parse a char sequence many times', () => {
        const zeroOrMoreParser = many(pstring('marco'));
        let parsing = zeroOrMoreParser.run('marcomarcociao');
        expect(parsing.isSuccess).to.be.true;
        expect(parsing.toString())
            .to.be.eql('Validation.Success([[[m,a,r,c,o],[m,a,r,c,o]],row=0;col=10;rest=ciao])');
    });
    it('can parse whitespaces!!', () => {
        const whitesParser = many(anyOf(whites));
        const twoWords = sequenceP([pstring('ciao'), whitesParser, pstring('mamma')]);
        let parsing = twoWords.run('ciaomammaX');
        expect(parsing.toString())
            .to.be.eql('Validation.Success([[[c,i,a,o],[],[m,a,m,m,a]],row=0;col=9;rest=X])');
        parsing = twoWords.run('ciao mammaX');
        expect(parsing.toString())
            .to.be.eql('Validation.Success([[[c,i,a,o],[ ],[m,a,m,m,a]],row=0;col=10;rest=X])');
        parsing = twoWords.run('ciao   mammaX');
        expect(parsing.toString())
            .to.be.eql('Validation.Success([[[c,i,a,o],[ , , ],[m,a,m,m,a]],row=0;col=12;rest=X])');
        parsing = twoWords.run('ciao \t mammaX');
        expect(parsing.toString())
            .to.be.eql('Validation.Success([[[c,i,a,o],[ ,\t, ],[m,a,m,m,a]],row=0;col=12;rest=X])');
    });
});

describe('a parser for one or more occurrences', () => {
    it('cannot parse a char zero times', () => {
        const oneOrMoreParser = many1(pchar('m'));
        let parsing = oneOrMoreParser.run('arco');
        expect(parsing.isFailure).to.be.true;
        expect(parsing.toString())
            .to.be.eql('Validation.Failure([many1 pchar_m,wanted m; got a,row=0;col=0;rest=arco])');
    });
    it('can parse a char many times and return an array', () => {
        const oneOrMoreParser = many1(pchar('m'));
        let parsing = oneOrMoreParser.run('mmmarco');
        expect(parsing.isSuccess).to.be.true;
        expect(parsing.toString()).to.be.eql('Validation.Success([[m,m,m],row=0;col=3;rest=arco])');
    });
    it('can parse a char many times and return a string', () => {
        const oneOrMoreParser = manyChars1(pchar('m'));
        let parsing = oneOrMoreParser.run('mmmarco');
        expect(parsing.isSuccess).to.be.true;
        expect(parsing.toString()).to.be.eql('Validation.Success([mmm,row=0;col=3;rest=arco])');
    });
    it('cannot parse a char sequence zero times', () => {
        const oneOrMoreParser = many1(pstring('marco'));
        let parsing = oneOrMoreParser.run('xmarcomarcociao');
        expect(parsing.isFailure).to.be.true;
        expect(parsing.toString())
            .to.be.eql('Validation.Failure([many1 pstring marco,wanted m; got x,row=0;col=0;rest=xmarcomarcociao])');
    });
    it('can parse a char sequence many times', () => {
        const oneOrMoreParser = many1(pstring('marco'));
        let parsing = oneOrMoreParser.run('marcomarcociao');
        expect(parsing.isSuccess).to.be.true;
        expect(parsing.toString())
            .to.be.eql('Validation.Success([[[m,a,r,c,o],[m,a,r,c,o]],row=0;col=10;rest=ciao])');
    });
    it('can parse an integer, no matter how large...', () => {
        const pint = many1(anyOf(digits));
        let parsing = pint.run('12345A');
        expect(parsing.isSuccess).to.be.true;
        expect(parsing.toString()).to.be.eql('Validation.Success([[1,2,3,4,5],row=0;col=5;rest=A])');
        parsing = pint.run('1B');
        expect(parsing.isSuccess).to.be.true;
        expect(parsing.toString()).to.be.eql('Validation.Success([[1],row=0;col=1;rest=B])');
        parsing = pint.run('A12345');
        expect(parsing.isFailure).to.be.true;
        expect(parsing.toString())
            .to.be.eql('Validation.Failure([many1 anyOf 0123456789,_fail,A12345])');
    });
    it('can parse an integer into a true integer', () => {
        const pint = many1(anyOf(digits))
            .fmap(l => parseInt(l.reduce((acc, curr) => acc + curr, ''), 10));
        let parsing = pint.run('12345A');
        expect(parsing.isSuccess).to.be.true;
        expect(parsing.value[0]).to.be.eql(12345);
        expect(parsing.value[1].toString()).to.be.eql('row=0;col=5;rest=A');
    });
});

describe('a parser for optional characters', () => {
    it('can capture or not capture a dot', () => {
        const optDotThenA = opt(pchar('.')).andThen(pchar('a'));
        expect(optDotThenA.run('.abc').toString())
            .to.be.eql('Validation.Success([[Maybe.Just(.),a],row=0;col=2;rest=bc])');
        expect(optDotThenA.run('abc').toString())
            .to.be.eql('Validation.Success([[Maybe.Nothing,a],row=0;col=1;rest=bc])');
    });
    it('can capture a dot or provide a default alternative', () => {
        const optDotWithDefaultThenA = opt(pchar('.'), 'ALTERNATIVE').andThen(pchar('a'));
        expect(optDotWithDefaultThenA.run('abc').toString())
            .to.be.eql('Validation.Success([[Maybe.Just(ALTERNATIVE),a],row=0;col=1;rest=bc])');
    });
    it('can parse SIGNED integers!!!', () => {
        const pint = many1(anyOf(digits))
            .fmap(l => parseInt(l.reduce((acc, curr) => acc + curr, ''), 10));
        const pSignedInt = opt(pchar('-'))
            .andThen(pint)
            .fmap(optSignNumberPair => (optSignNumberPair[0].isJust) ? -optSignNumberPair[1] : optSignNumberPair[1]);
        expect(pSignedInt.run('13243546x').value[0]).to.be.eql(13243546);
        expect(pSignedInt.run('-13243546x').value[0]).to.be.eql(-13243546);
    });
    it('can capture or not capture a whole substring', () => {
        const optSubstring = opt(pstring('marco')).andThen(pstring('faustinelli'));
        expect(optSubstring.run('marcofaustinellix').toString())
            .to.be.eql('Validation.Success([[Maybe.Just([m,a,r,c,o]),[f,a,u,s,t,i,n,e,l,l,i]],row=0;col=16;rest=x])');
        expect(optSubstring.run('faustinellix').toString())
            .to.be.eql('Validation.Success([[Maybe.Nothing,[f,a,u,s,t,i,n,e,l,l,i]],row=0;col=11;rest=x])');
    });
});

describe('a couple of parsers', () => {
    it('can decide to discard the matches of the first one', () => {
        const discardIntegerSign = pchar('-').discardFirst(pdigit(8));
        let parsing = discardIntegerSign.run('-8x');
        expect(parsing.toString()).to.be.eql('Validation.Success([8,row=0;col=2;rest=x])');
    });
    it('can decide to discard the matches of the second one', () => {
        const discardSuffix = pstring('marco').discardSecond(many1(anyOf(whites)));
        let parsing = discardSuffix.run('marco faustinelli');
        expect(parsing.toString()).to.be.eql('Validation.Success([[m,a,r,c,o],row=0;col=6;rest=faustinelli])');
        parsing = discardSuffix.run('marco                                faustinelli');
        expect(parsing.toString()).to.be.eql('Validation.Success([[m,a,r,c,o],row=0;col=37;rest=faustinelli])');
    });
});

describe('a tapper for parsers', () => {
    it('can do things with a result that\'s going to be discarded', () => {
        const tapIntoDiscardIntegerSign = tapP(pchar('-'), res => {
            expect(res).to.be.eql('-');
        }).discardFirst(pdigit(8));
        let parsing = tapIntoDiscardIntegerSign.run('-8x');
    });
});

describe('a logger for parsers', () => {
    let storedLog = console.log;
    it('can log intermediate parsing results', () => {
        console.log = msg => {
            expect(msg).to.be.eql('-');
        };
        const logIntermediateResult = logP(pchar('-'))
            .discardFirst(pdigit(8));
        let parsing = logIntermediateResult.run('-8x');
    });
    console.log = storedLog;
});

describe('parsing while discarding input', () => {
    it('allows to exclude parentheses', () => {
        const insideParens = pchar('(')
            .discardFirst(many(anyOf(lowercases)))
            .discardSecond(pchar(')'));
        expect(insideParens.run('(marco)').toString())
            .to.be.eql('Validation.Success([[m,a,r,c,o],row=1;col=0;rest=])');
        expect(insideParens.run('()').toString())
            .to.be.eql('Validation.Success([[],row=1;col=0;rest=])');
    });
    it('...even using a tailor-made method', () => {
        const insideParens = betweenParens(pstring('marco'));
        expect(insideParens.run('(marco)').toString())
            .to.be.eql('Validation.Success([[m,a,r,c,o],row=1;col=0;rest=])');
    });
    it('cherry-picking elements separated by separators', () => {
        const substringsWithCommas = many(many1(anyOf(lowercases)).discardSecond(pchar(',')));
        expect(substringsWithCommas.run('a,b,cd,1').toString())
            .to.be.eql('Validation.Success([[[a],[b],[c,d]],row=0;col=7;rest=1])');
    });
    it('...also when inside a lists', () => {
        const substringsWithCommas = many(many1(anyOf(lowercases)).discardSecond(pchar(',')));
        const listElements = between(pchar('['), substringsWithCommas, pchar(']'));
        expect(listElements.run('[a,b,cd,marco,]1').toString())
            .to.be.eql('Validation.Success([[[a],[b],[c,d],[m,a,r,c,o]],row=0;col=15;rest=1])');
    });
    describe('thanks to the specific sepBy1 operator', () => {
        const valuesP = anyOf(lowercases);
        const commaP = pchar(',');
        it('cherry-picking elements separated by separators', () => {
            expect(sepBy1(valuesP, commaP).run('a,b,cd,1').toString())
                .to.be.eql('Validation.Success([[[a],[b],[c,d]],row=0;col=7;rest=1])');
        });
        it('...also when inside a lists', () => {
            const listElements = between(pchar('['), sepBy1(valuesP, commaP), pchar(']'));
            expect(listElements.run('[a,b,cd,marco,]').toString())
                .to.be.eql('Validation.Success([[[a],[b],[c,d],[m,a,r,c,o]],row=1;col=0;rest=])');
        });
        it('...lists with no elements', () => {
            const listElements = between(pchar('['), sepBy1(valuesP, commaP), pchar(']'));
            expect(listElements.run('[]').toString())
                .to.be.eql('Validation.Success([[],row=1;col=0;rest=])');
        });
        it('...lists with just one element', () => {
            const listElements = between(pchar('['), sepBy1(valuesP, commaP), pchar(']'));
            expect(listElements.run('[a]').toString())
                .to.be.eql('Validation.Success([[[a]],row=1;col=0;rest=])');
        });
    });
});
