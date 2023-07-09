import { expect } from 'chai';
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
  stringP,
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
  sepBy,
  between,
  betweenParens,
  tapP,
  logP,
  pword,
  trimP,
  precededByP,
  notPrecededByP,
  followedByP,
  notFollowedByP,
  startOfInputP,
  notStartOfInputP,
  endOfInputP,
  notEndOfInputP,
  succeedP,
  failP,
} from 'parsers';
import {
  isPair,
  isSuccess,
  isFailure,
  isParser,
  isSome,
  isNone,
} from 'util';
import { Maybe } from 'maybe';
import { Validation } from 'validation';
import { Position } from 'classes';

const lowercases = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
const uppercases = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
const digits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
const whites = [' ', '\t', '\n', '\r'];
const text = Position.fromText;

describe('a basic parser for single chars (parserA = charParser(\'a\'))', () => {
  const parserA = charParser('a');

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
});

describe('a basic parser for single STRINGIFIED digits (parser1 = digitParser(1))', () => {
  const parser1 = digitParser(1);
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

describe('a named character parser (parserA = pchar(\'a\'))', () => {
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

describe('the mapping parser fmap', () => {
  describe('defined as function (fmap(x => x.toUpperCase(), pchar(\'a\')))', () => {
    const mappingParser = fmap(x => x.toUpperCase(), pchar('a'));
    it('shall map the output of another parser', () => {
      expect(isParser(mappingParser)).to.be.true;
      const mappedParsingA = mappingParser.run(text('abc'));
      expect(mappedParsingA.value[0]).to.be.eql('A');
      expect(mappedParsingA.value[1].rest()).to.be.eql('bc');
      expect(mappedParsingA.isSuccess).to.be.true;
    });
  });
  describe('defined as a method of another parser (pchar(\'a\').fmap(x => x.toUpperCase()))', () => {
    const mappingParser = pchar('a').fmap(x => x.toUpperCase());
    it('shall map the output of another parser', () => {
      expect(isParser(mappingParser)).to.be.true;
      const mappedParsingA = mappingParser.run(text('abc'));
      expect(mappedParsingA.value[0]).to.be.eql('A');
      expect(mappedParsingA.value[1].rest()).to.be.eql('bc');
      expect(mappedParsingA.isSuccess).to.be.true;
    });
  });
});

describe('two parsers bound by andThen (parserAandB = andThen(pchar(\'a\'), pchar(\'b\')))', () => {
  const parserAandB = andThen(pchar('a'), pchar('b'));

  it('can parse two chars', () => {
    expect(isParser(parserAandB)).to.be.true;
    const parsingAandB = parserAandB.run(text('abc'));
    expect(parsingAandB.isSuccess).to.be.true;
    expect(parsingAandB.value[0].toString()).to.be.eql('[a,b]');
    expect(parsingAandB.value[1].rest()).to.be.eql('c');
    expect(parsingAandB.toString()).to.be.eql('Validation.Success([[a,b],row=0;col=2;rest=c])');
  });

  it('will fail if the two chars are not the ones sought', () => {
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

describe('two parsers bound by orElse (parserAorB = orElse(pchar(\'a\'), pchar(\'b\')))', () => {
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

describe('a parser for even just three chars in a row, done with andThen + fmap, is real clumsy; but it works...', () => {
  it('parses abc', () => {
    const pairAdder = ([x, y]) => x + y;
    const abcP = andThen(
      pchar('a'),
      andThen(
        pchar('b'),
        andThen(
          pchar('c'),
          returnP(''),
        ).fmap(pairAdder),
      ).fmap(pairAdder),
    ).fmap(pairAdder);
    const parsing = abcP.run('abcd');
    expect(parsing.isSuccess).to.be.true;
    expect(parsing.value[0].toString()).to.be.eql('abc');
    expect(parsing.value[1].rest()).to.be.eql('d');
  });
  it('parses abc with a different, but still very clumsy syntax', () => {
    const pairAdder = ([x, y]) => x + y;
    const abcP = ((pchar('a').andThen(pchar('b'))).fmap(pairAdder).andThen(pchar('c'))).fmap(pairAdder);
    const parsing = abcP.run('abcd');
    expect(parsing.isSuccess).to.be.true;
    expect(parsing.value[0].toString()).to.be.eql('abc');
    expect(parsing.value[1].rest()).to.be.eql('d');
  });
});

describe('a parser for even just three digits in a row, done with andThen + fmap, is real clumsy; but it works...', () => {
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
      const parsing = threeDigitsImpl.run('123');
      expect(parsing.isSuccess).to.be.true;
      expect(parsing.value[0].toString()).to.be.eql('[1,2,3]');
      expect(parsing.value[1].rest()).to.be.eql('');
    });
    it('as instance method', () => {
      const threeDigitsInst = threeDigits.fmap(unpacker);
      const parsing = threeDigitsInst.run('123');
      expect(parsing.isSuccess).to.be.true;
      expect(parsing.value[0].toString()).to.be.eql('[1,2,3]');
      expect(parsing.value[1].rest()).to.be.eql('');
    });
  });
});

describe('a choice of four parsers bound by orElse (parsersChoice = choice([pchar(\'a\'), pchar(\'b\'), pchar(\'c\'), pchar(\'d\'),]))', () => {
  const parsersChoice = choice([pchar('a'), pchar('b'), pchar('c'), pchar('d')]);

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

  it('will fail if NONE of the four chars is provided', () => {
    const parsingChoice = parsersChoice.run(text('x'));
    expect(parsingChoice.isFailure).to.be.true;
    expect(parsingChoice.value[0]).to.be.eql('choice /pchar_a/pchar_b/pchar_c/pchar_d');
    expect(parsingChoice.value[1]).to.be.eql('fail');
    expect(parsingChoice.value[2].rest()).to.be.eql('x');
  });

  it('will fail if the input is too short', () => {
    expect(parsersChoice.run(text('a')).isSuccess).to.be.true;
    expect(parsersChoice.run(text('')).isFailure).to.be.true;
  });
});

describe('a parser for any of a list of... ', () => {
  describe('lowercase chars (lowercasesParser = anyOf(lowercases))', () => {
    const lowercasesParser = anyOf(lowercases);
    it('can parse any single lowercase char', () => {
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
    });
    it('cannot parse any single uppercase char', () => {
      const parsingChoice = lowercasesParser.run(text('Y'));
      expect(parsingChoice.isFailure).to.be.true;
      expect(parsingChoice.value[0]).to.be.eql('anyOf abcdefghijklmnopqrstuvwxyz');
      expect(parsingChoice.value[1]).to.be.eql('fail');
      expect(parsingChoice.value[2].rest()).to.be.eql('Y');
    });
  });
  describe('uppercase chars (uppercasesParser = anyOf(uppercases))', () => {
    const uppercasesParser = anyOf(uppercases);
    it('can parse any single uppercase char', () => {
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
    });
    it('cannot parse any single lowercase char', () => {
      const parsingChoice = uppercasesParser.run(text('s'));
      expect(parsingChoice.isFailure).to.be.true;
      expect(parsingChoice.value[0]).to.be.eql('anyOf ABCDEFGHIJKLMNOPQRSTUVWXYZ');
      expect(parsingChoice.value[1]).to.be.eql('fail');
      expect(parsingChoice.value[2].rest()).to.be.eql('s');
    });
  });
  describe('digits (digitsParser = anyOf(digits))', () => {
    const digitsParser = anyOf(digits);
    it('can parse any single digit', () => {
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
    });
    it('cannot parse any single character', () => {
      const parsingChoice = digitsParser.run(text('s'));
      expect(parsingChoice.isFailure).to.be.true;
      expect(parsingChoice.value[0]).to.be.eql('anyOf 0123456789');
      expect(parsingChoice.value[1]).to.be.eql('fail');
      expect(parsingChoice.value[2].rest()).to.be.eql('s');
    });
  });
  it('will fail if the input is too short', () => {
    expect(anyOf(lowercases).run(text('')).isFailure).to.be.true;
    expect(anyOf(uppercases).run(text('')).isFailure).to.be.true;
    expect(anyOf(digits).run(text('')).isFailure).to.be.true;
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

describe('a sequence of parsers, built using lift2(cons) (aka sequenceP)', () => {
  it('stores matched chars inside an ARRAY', () => {
    const abcParser = sequenceP([pchar('a'), pchar('b'), pchar('c')]);
    expect(abcParser.run('abc').toString())
      .to.be.eql('Validation.Success([[a,b,c],row=1;col=0;rest=])');
  });
  it('requires therefore some mapping', () => {
    const mappedAbcParser = sequenceP([pchar('a'), pchar('b'), pchar('c')])
      .fmap(a => a.join(''));
    expect(mappedAbcParser.run('abc').toString())
      .to.be.eql('Validation.Success([abc,row=1;col=0;rest=])');
  });
});

describe('a sequence of parsers, built using andThen && fmap (aka sequenceP2)', () => {
  it('store matched chars inside a plain STRING', () => {
    const abcParser = sequenceP2([pchar('a'), pchar('b'), pchar('c')]);
    expect(abcParser.run('abc').toString())
      .to.be.eql('Validation.Success([abc,row=1;col=0;rest=])');
  });
});

describe('a parser for a specific sequence of chars', () => {
  it('is easy to create with sequenceP (marcoParser = pstring(\'marco\')) and it returns an array', () => {
    const marcoParser = pstring('marco');
    const marcoParsing = marcoParser.run('marcociao');
    expect(marcoParsing.isSuccess).to.be.true;
    expect(marcoParsing.toString())
      .to.be.eql('Validation.Success([[m,a,r,c,o],row=0;col=5;rest=ciao])');
  });
  it('has a version based on sequenceP2 that returns strings (marcoParser = stringP(\'marco\'))', () => {
    const marcoParser = stringP('marco');
    const marcoParsing = marcoParser.run('marcociao');
    expect(marcoParsing.isSuccess).to.be.true;
    expect(marcoParsing.toString())
      .to.be.eql('Validation.Success([marco,row=0;col=5;rest=ciao])');
  });
});

describe('a succeeding parser (succeedP)', () => {
  const whatever = Position.fromText('whatever');
  it('succeeds always', () => {
    expect(succeedP.run(whatever).isSuccess).to.be.true;
  });
  it('can be used as a flag to exit with satisfaction from a more complex parsing (parsing = sequenceP([pchar(\'w\'), pchar(\'h\'), succeedP]))', () => {
    expect(succeedP.run(whatever).isSuccess).to.be.true;
    const parsing = sequenceP([pchar('w'), pchar('h'), succeedP]).run(whatever);
    expect(parsing.toString()).to.be.eql('Validation.Success([[w,h,],row=0;col=2;rest=atever])');
  });
  it('does not consume characters, but it returns an empty string as result', () => {
    const parsing = sequenceP([pchar('w'), succeedP, pchar('h')]);
    expect(parsing.run(whatever).toString()).to.be.eql('Validation.Success([[w,,h],row=0;col=2;rest=atever])');
  });
});

describe('a failing parser (failP)', () => {
  it('will always fail', () => {
    expect(failP.run('whatever').isFailure).to.be.true;
  });
  it('can be used as a flag to exit WITHOUT satisfaction from a more complex parsing (parsing = sequenceP([pchar(\'w\'), pchar(\'h\'), failP]))', () => {
    expect(failP.run('whatever').isFailure).to.be.true;
    const parsing = sequenceP([pchar('w'), pchar('h'), failP]).run('whatever');
    expect(parsing.toString()).to.be.eql('Validation.Failure([bindP applied to bindP applied to undefined,fail,row=0;col=2;rest=atever])');
  });
  it('does not consume characters, but it returns an empty string as result', () => {
    const parsing = sequenceP([pchar('w'), failP, pchar('h')]);
    expect(parsing.run('whatever').toString()).to.be.eql('Validation.Failure([bindP applied to bindP applied to undefined,fail,row=0;col=1;rest=hatever])');
  });
});

describe('a parser for the start of the input (startOfInputP)', () => {
  it('succeeds at the start of the stream', () => {
    expect(startOfInputP.run(Position.fromText('abc')).isSuccess).to.be.true;
  });
  it('fails halfway through the stream ()', () => {
    const laterInTheStream = sequenceP([pchar('a'), startOfInputP]);
    expect(laterInTheStream.run(Position.fromText('abc')).isFailure).to.be.true;
  });
  it('does not consume characters, but it returns an empty string as result', () => {
    const startABC = sequenceP([startOfInputP, pchar('A'), pchar('B'), pchar('C')]);
    const parsing = startABC.run(Position.fromText('ABC'));
    expect(parsing.toString()).to.be.eql('Validation.Success([[,A,B,C],row=1;col=0;rest=])');
  });
});

describe('a parser for NOT the start of the input (notStartOfInputP)', () => {
  it('fails at the start of the stream', () => {
    expect(notStartOfInputP.run(Position.fromText('abc')).isFailure).to.be.true;
    expect(sequenceP([notStartOfInputP, pchar('a')]).run(Position.fromText('abc')).toString())
      .to.be.eql('Validation.Failure([bindP applied to bindP applied to undefined,fail,row=0;col=0;rest=abc])');
  });
  it('succeeds halfway through the stream', () => {
    const laterInTheStream = sequenceP([pchar('a'), notStartOfInputP]);
    expect(laterInTheStream.run(Position.fromText('abc')).isSuccess).to.be.true;
  });
  it('does not consume characters, but it returns an empty string as result', () => {
    const ABNotStartC = sequenceP([pchar('A'), pchar('B'), notStartOfInputP, pchar('C')]);
    const parsing = ABNotStartC.run(Position.fromText('ABC'));
    expect(parsing.toString()).to.be.eql('Validation.Success([[A,B,,C],row=1;col=0;rest=])');
  });
});

describe('a parser for the end of the input (endOfInputP)', () => {
  it('succeeds at the end of the stream', () => {
    const finallyInTheStream = sequenceP([pchar('a'), pchar('b'), endOfInputP]);
    expect(finallyInTheStream.run(Position.fromText('ab')).isSuccess).to.be.true;
  });
  it('fails halfway through the stream', () => {
    const laterInTheStream = sequenceP([pchar('a'), endOfInputP]);
    expect(laterInTheStream.run(Position.fromText('abc')).isFailure).to.be.true;
  });
});

describe('a parser for NOT the end of the input (notEndOfInputP)', () => {
  it('fails at the end of the stream', () => {
    const notFinallyInTheStream = sequenceP([pchar('a'), notEndOfInputP]);
    expect(notFinallyInTheStream.run(Position.fromText('a')).isFailure).to.be.true;
  });
  it('succeeds halfway through the stream', () => {
    const ABnotEndC = sequenceP([pchar('A'), pchar('B'), notEndOfInputP, pchar('C')].map(logP));
    expect(ABnotEndC.run(Position.fromText('ABC')).isSuccess).to.be.true;
  });
  it('does not consume characters, but it returns an empty string as result', () => {
    const AnotEndB = sequenceP([pchar('A'), notEndOfInputP, pchar('B')].map(logP));
    expect(AnotEndB.run(Position.fromText('AB')).toString()).to.be.eql('Validation.Success([[A,,B],row=1;col=0;rest=])');
  });
});

describe('a parser that trims parsings (trimP)', () => {
  it('can ignore whitespaces around a single char (trimmer = trimP(pchar(\'a\')))', () => {
    const trimmer = trimP(pchar('a'));
    expect(trimmer.run('  a    ').toString())
      .to.be.eql('Validation.Success([a,row=1;col=0;rest=])');
  });
  it('can ignore whitespaces around a sequence of two chars (trimmer = trimP(pchar(\'a\').andThen(pchar(\'b\')))', () => {
    const trimmer = trimP(pchar('a').andThen(pchar('b')));
    expect(trimmer.run('  ab    ').toString())
      .to.be.eql('Validation.Success([[a,b],row=1;col=0;rest=])');
  });
});

describe('a parser for a specific word (pword)', () => {
  it('detects and ignores whitespaces around it', () => {
    const marcoParser = pword('marco');
    const marcoParsing = marcoParser.run('  marco ciao');
    expect(marcoParsing.isSuccess).to.be.true;
    expect(marcoParsing.toString())
      .to.be.eql('Validation.Success([[m,a,r,c,o],row=0;col=8;rest=ciao])');
  });
  it('has no problem if the whitespaces aren\'t there', () => {
    const marcoParser = pword('marco');
    const marcoParsing = marcoParser.run('marcociao');
    expect(marcoParsing.isSuccess).to.be.true;
    expect(marcoParsing.toString())
      .to.be.eql('Validation.Success([[m,a,r,c,o],row=0;col=5;rest=ciao])');
  });
});

describe('a parsing function for zero or more occurrences (zeroOrMore)', () => {
  it('can parse a char zero times (zeroOrMoreParsingFunction = zeroOrMore(pchar(\'m\')))', () => {
    const zeroOrMoreParsingFunction = zeroOrMore(pchar('m'));
    const parsing = zeroOrMoreParsingFunction(text('arco'));
    expect(parsing.isSuccess).to.be.true;
    expect(parsing.toString()).to.be.eql('Validation.Success([[],row=0;col=0;rest=arco])');
  });
  it('can parse a char many times (zeroOrMoreParsingFunction = zeroOrMore(pchar(\'m\')))', () => {
    const zeroOrMoreParsingFunction = zeroOrMore(pchar('m'));
    const parsing = zeroOrMoreParsingFunction(text('mmmarco'));
    expect(parsing.isSuccess).to.be.true;
    expect(parsing.toString()).to.be.eql('Validation.Success([[m,m,m],row=0;col=3;rest=arco])');
  });
  it('can parse a char sequence zero times (zeroOrMoreParsingFunction = zeroOrMore(pstring(\'marco\')))', () => {
    const zeroOrMoreParsingFunction = zeroOrMore(pstring('marco'));
    const parsing = zeroOrMoreParsingFunction(text('xmarcomarcociao'));
    expect(parsing.isSuccess).to.be.true;
    expect(parsing.toString()).to.be.eql('Validation.Success([[],row=0;col=0;rest=xmarcomarcociao])');
  });
  it('can parse a char sequence many times (zeroOrMoreParsingFunction = zeroOrMore(pstring(\'marco\')))', () => {
    const zeroOrMoreParsingFunction = zeroOrMore(pstring('marco'));
    const parsing = zeroOrMoreParsingFunction(text('marcomarcociao'));
    expect(parsing.isSuccess).to.be.true;
    expect(parsing.toString())
      .to.be.eql('Validation.Success([[[m,a,r,c,o],[m,a,r,c,o]],row=0;col=10;rest=ciao])');
  });
});

describe('a parser for zero or more occurrences', () => {
  it('can parse a char zero times (zeroOrMoreParser = many(pchar(\'m\')))', () => {
    const zeroOrMoreParser = many(pchar('m'));
    const parsing = zeroOrMoreParser.run(text('arco'));
    expect(parsing.isSuccess).to.be.true;
    expect(parsing.toString()).to.be.eql('Validation.Success([[],row=0;col=0;rest=arco])');
  });
  it('can parse a char many times and return an array (zeroOrMoreParser = many(pchar(\'m\')))', () => {
    const zeroOrMoreParser = many(pchar('m'));
    const parsing = zeroOrMoreParser.run(text('mmmarco'));
    expect(parsing.isSuccess).to.be.true;
    expect(parsing.toString()).to.be.eql('Validation.Success([[m,m,m],row=0;col=3;rest=arco])');
  });
  it('can parse a char exactly n times and return an array, or fail (exactlyThree = many(pchar(\'m\'), 3))', () => {
    const exactlyThree = many(pchar('m'), 3);
    let parsing = exactlyThree.run(text('mmmarco'));
    expect(parsing.isSuccess).to.be.true;
    expect(parsing.toString()).to.be.eql('Validation.Success([[m,m,m],row=0;col=3;rest=arco])');
    parsing = exactlyThree.run(text('mmmmarco'));
    expect(parsing.isFailure).to.be.true;
    expect(parsing.toString()).to.be.eql('Validation.Failure([many pchar_m times=3,times param wanted 3; got 4,row=0;col=0;rest=mmmmarco])');
  });
  it('can parse a char many times and return a string (zeroOrMoreParser = manyChars(pchar(\'m\')))', () => {
    const zeroOrMoreParser = manyChars(pchar('m'));
    const parsing = zeroOrMoreParser.run(text('mmmarco'));
    expect(parsing.isSuccess).to.be.true;
    expect(parsing.toString()).to.be.eql('Validation.Success([mmm,row=0;col=3;rest=arco])');
  });
  it('can parse a char exactly n times and return a string, or fail (exactlyThree = manyChars(pchar(\'m\'), 3))', () => {
    const exactlyThree = manyChars(pchar('m'), 3);
    let parsing = exactlyThree.run(text('mmmarco'));
    expect(parsing.isSuccess).to.be.true;
    expect(parsing.toString()).to.be.eql('Validation.Success([mmm,row=0;col=3;rest=arco])');
    parsing = exactlyThree.run(text('mmmmarco'));
    expect(parsing.isFailure).to.be.true;
    expect(parsing.toString()).to.be.eql('Validation.Failure([manyChars pchar_m times=3,times param wanted 3; got 4,row=0;col=0;rest=mmmmarco])');
  });
  it('can parse a char sequence zero times (zeroOrMoreParser = many(pstring(\'marco\')))', () => {
    const zeroOrMoreParser = many(pstring('marco'));
    const parsing = zeroOrMoreParser.run(text('xmarcomarcociao'));
    expect(parsing.isSuccess).to.be.true;
    expect(parsing.toString()).to.be.eql('Validation.Success([[],row=0;col=0;rest=xmarcomarcociao])');
  });
  it('can parse a char sequence many times (zeroOrMoreParser = many(pstring(\'marco\')))', () => {
    const zeroOrMoreParser = many(pstring('marco'));
    const parsing = zeroOrMoreParser.run('marcomarcociao');
    expect(parsing.isSuccess).to.be.true;
    expect(parsing.toString())
      .to.be.eql('Validation.Success([[[m,a,r,c,o],[m,a,r,c,o]],row=0;col=10;rest=ciao])');
  });
  it('can parse whitespaces!! (whitesParser = many(anyOf(whites)))', () => {
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

describe('a parser for one or more occurrences (many1, manyChars1)', () => {
  it('cannot parse a char zero times (oneOrMoreParser = many1(pchar(\'m\')))', () => {
    const oneOrMoreParser = many1(pchar('m'));
    const parsing = oneOrMoreParser.run('arco');
    expect(parsing.isFailure).to.be.true;
    expect(parsing.toString())
      .to.be.eql('Validation.Failure([many1 pchar_m,wanted m; got a,row=0;col=0;rest=arco])');
  });
  it('can parse a char many times and return an array (oneOrMoreParser = many1(pchar(\'m\')))', () => {
    const oneOrMoreParser = many1(pchar('m'));
    const parsing = oneOrMoreParser.run('mmmarco');
    expect(parsing.isSuccess).to.be.true;
    expect(parsing.toString()).to.be.eql('Validation.Success([[m,m,m],row=0;col=3;rest=arco])');
  });
  it('can parse a char many times and return a string (oneOrMoreParser = manyChars1(pchar(\'m\')))', () => {
    const oneOrMoreParser = manyChars1(pchar('m'));
    const parsing = oneOrMoreParser.run('mmmarco');
    expect(parsing.isSuccess).to.be.true;
    expect(parsing.toString()).to.be.eql('Validation.Success([mmm,row=0;col=3;rest=arco])');
  });
  it('cannot parse a char sequence zero times (oneOrMoreParser = many1(pstring(\'marco\')))', () => {
    const oneOrMoreParser = many1(pstring('marco'));
    const parsing = oneOrMoreParser.run('xmarcomarcociao');
    expect(parsing.isFailure).to.be.true;
    expect(parsing.toString())
      .to.be.eql('Validation.Failure([many1 pstring marco,wanted m; got x,row=0;col=0;rest=xmarcomarcociao])');
  });
  it('can parse a char sequence many times (oneOrMoreParser = many1(pstring(\'marco\')))', () => {
    const oneOrMoreParser = many1(pstring('marco'));
    const parsing = oneOrMoreParser.run('marcomarcociao');
    expect(parsing.isSuccess).to.be.true;
    expect(parsing.toString())
      .to.be.eql('Validation.Success([[[m,a,r,c,o],[m,a,r,c,o]],row=0;col=10;rest=ciao])');
  });
  it('can parse an integer, no matter how large... (pint = many1(anyOf(digits)))', () => {
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
      .to.be.eql('Validation.Failure([many1 anyOf 0123456789,fail,A12345])');
  });
  it('can parse an integer into a true integer (pint = many1(anyOf(digits)))', () => {
    const pint = many1(anyOf(digits))
      .fmap(l => parseInt(l.reduce((acc, curr) => acc + curr, ''), 10));
    const parsing = pint.run('12345A');
    expect(parsing.isSuccess).to.be.true;
    expect(parsing.value[0]).to.be.eql(12345);
    expect(parsing.value[1].toString()).to.be.eql('row=0;col=5;rest=A');
  });
});

describe('parsers that consider precedences (precededByP, notPrecededByP, followedByP, notFollowedByP)', () => {
  describe('can parse X preceded by Y (XafterY = precededByP(\'Y\', \'X\'))', () => {
    const XafterY = precededByP('Y', 'X');
    it('even if Y has been consumed by the parser before', () => {
      const YXp = many1(choice([pchar('Y'), XafterY]));
      const parsingYX = YXp.run(text('YX'));
      expect(parsingYX.isSuccess).to.be.true;
      expect(parsingYX.toString()).to.be.eql('Validation.Success([[Y,X],row=1;col=0;rest=])');
    });
    it('and halt when X is not preceded by Y (AXp = many1(choice([pchar(\'A\'), XafterY])))', () => {
      const AXp = many1(choice([pchar('A'), XafterY]));
      const parsingAX = AXp.run(text('AX'));
      expect(parsingAX.isSuccess).to.be.true;
      expect(parsingAX.value[1].rest()).to.be.eql('X');
    });
    it('and fail when X is at the start of the string (AXp = many1(choice([pchar(\'A\'), XafterY])))', () => {
      const AXp = many1(choice([pchar('A'), XafterY]));
      const parsingAX = AXp.run(text('XA'));
      expect(parsingAX.isFailure).to.be.true;
    });
  });

  describe('can parse X not preceded by Y (XnotAfterY = notPrecededByP(\'Y\', \'X\'))', () => {
    const XnotAfterY = notPrecededByP('Y', 'X');

    it('even if the previous char has been consumed by the parser before (AXp = many1(choice([pchar(\'A\'), XnotAfterY])))', () => {
      const AXp = many1(choice([pchar('A'), XnotAfterY]));
      const parsingAX = AXp.run(text('AX'));
      expect(parsingAX.isSuccess).to.be.true;
      expect(parsingAX.toString()).to.be.eql('Validation.Success([[A,X],row=1;col=0;rest=])');
    });
    it('and halt when X is the first char in the string (AXp = many1(choice([pchar(\'A\'), XnotAfterY])))', () => {
      const AXp = many1(choice([pchar('A'), XnotAfterY]));
      const parsingAX = AXp.run(text('XA'));
      expect(parsingAX.isSuccess).to.be.true;
      expect(parsingAX.toString()).to.be.eql('Validation.Success([[X,A],row=1;col=0;rest=])');
    });
    it('and halt when X is preceded by Y (YXp = many1(choice([pchar(\'Y\'), XnotAfterY])))', () => {
      const YXp = many1(choice([pchar('Y'), XnotAfterY]));
      const parsingYX = YXp.run(text('YX'));
      expect(parsingYX.isSuccess).to.be.true;
      expect(parsingYX.value[1].rest()).to.be.eql('X');
    });
  });

  describe('can parse X followed by Y (XbeforeY = followedByP(\'Y\', \'X\'))', () => {
    const XbeforeY = followedByP('Y', 'X');
    it('without consuming the character', () => {
      const XYp = many1(choice([XbeforeY, pchar('Y')]));
      const parsingXY = XYp.run(text('XY'));
      expect(parsingXY.isSuccess).to.be.true;
      expect(parsingXY.toString()).to.be.eql('Validation.Success([[X,Y],row=1;col=0;rest=])');
    });
    it('and fail when X is not followed by Y (XAp = many1(choice([XbeforeY, pchar(\'A\')])))', () => {
      const XAp = many1(choice([XbeforeY, pchar('A')]));
      const parsingXA = XAp.run(text('XA'));
      expect(parsingXA.isFailure).to.be.true;
      // expect(parsingXA.value[1].rest()).to.be.eql('X');
    });
    it('and fail when X is at the end of the string (AXp = many1(choice([pchar(\'A\'), XbeforeY])))', () => {
      const AXp = many1(choice([pchar('A'), XbeforeY]));
      const parsingAX = AXp.run(text('AX'));
      expect(parsingAX.isSuccess).to.be.true;
      expect(parsingAX.value[1].rest()).to.be.eql('X');
    });
  });

  describe('can parse X not followed by Y (XnotBeforeY = notFollowedByP(\'Y\', \'X\'))', () => {
    const XnotBeforeY = notFollowedByP('Y', 'X');

    it('without consuming the character (XAp = many1(choice([XnotBeforeY, pchar(\'A\')])))', () => {
      const XAp = many1(choice([XnotBeforeY, pchar('A')]));
      const parsingXA = XAp.run(text('XA'));
      expect(parsingXA.isSuccess).to.be.true;
      expect(parsingXA.toString()).to.be.eql('Validation.Success([[X,A],row=1;col=0;rest=])');
    });
    it('and succeed when X is the last char in the string (AXp = many1(choice([pchar(\'A\'), XnotBeforeY])))', () => {
      const AXp = many1(choice([pchar('A'), XnotBeforeY]));
      const parsingAX = AXp.run(text('AX'));
      expect(parsingAX.isSuccess).to.be.true;
      expect(parsingAX.toString()).to.be.eql('Validation.Success([[A,X],row=1;col=0;rest=])');
    });
    it('and halt when X is followed by Y (AXYp = many1(choice([pchar(\'A\'), XnotBeforeY])))', () => {
      const AXYp = many1(choice([pchar('A'), XnotBeforeY]));
      const parsingAXY = AXYp.run(text('AXY'));
      expect(parsingAXY.isSuccess).to.be.true;
      expect(parsingAXY.value[1].rest()).to.be.eql('XY');
    });
  });
});

describe('a parser for optional characters (opt)', () => {
  it('can capture or not capture a dot (optDotThenA = opt(pchar(\'.\')).andThen(pchar(\'a\')))', () => {
    const optDotThenA = opt(pchar('.')).andThen(pchar('a'));
    expect(optDotThenA.run('.abc').toString())
      .to.be.eql('Validation.Success([[Maybe.Just(.),a],row=0;col=2;rest=bc])');
    expect(optDotThenA.run('abc').toString())
      .to.be.eql('Validation.Success([[Maybe.Nothing,a],row=0;col=1;rest=bc])');
  });
  it('can capture a dot or provide a default alternative (optDotWithDefaultThenA = opt(pchar(\'.\'), \'ALTERNATIVE\').andThen(pchar(\'a\')))', () => {
    const optDotWithDefaultThenA = opt(pchar('.'), 'ALTERNATIVE').andThen(pchar('a'));
    expect(optDotWithDefaultThenA.run('abc').toString())
      .to.be.eql('Validation.Success([[Maybe.Just(ALTERNATIVE),a],row=0;col=1;rest=bc])');
  });
  it('can parse SIGNED integers!!! (CHECK THIS OUT!!)', () => {
    const pint = many1(anyOf(digits))
      .fmap(l => parseInt(l.reduce((acc, curr) => acc + curr, ''), 10));
    const pSignedInt = opt(pchar('-'))
      .andThen(pint)
      .fmap(optSignNumberPair => ((optSignNumberPair[0].isJust) ? -optSignNumberPair[1] : optSignNumberPair[1]));
    expect(pSignedInt.run('13243546x').value[0]).to.be.eql(13243546);
    expect(pSignedInt.run('-13243546x').value[0]).to.be.eql(-13243546);
  });
  it('can capture or not capture a whole substring (optSubstring = opt(pstring(\'marco\')).andThen(pstring(\'faustinelli\')))', () => {
    const optSubstring = opt(pstring('marco')).andThen(pstring('faustinelli'));
    expect(optSubstring.run('marcofaustinellix').toString())
      .to.be.eql('Validation.Success([[Maybe.Just([m,a,r,c,o]),[f,a,u,s,t,i,n,e,l,l,i]],row=0;col=16;rest=x])');
    expect(optSubstring.run('faustinellix').toString())
      .to.be.eql('Validation.Success([[Maybe.Nothing,[f,a,u,s,t,i,n,e,l,l,i]],row=0;col=11;rest=x])');
  });
});

describe('a couple of result-discarding parsers (discardFirst, discardSecond)', () => {
  it('can decide to discard the matches of the first one (discardIntegerSign = pchar(\'-\').discardFirst(pdigit(8)))', () => {
    const discardIntegerSign = pchar('-').discardFirst(pdigit(8));
    const parsing = discardIntegerSign.run('-8x');
    expect(parsing.toString()).to.be.eql('Validation.Success([8,row=0;col=2;rest=x])');
  });
  it('can decide to discard the matches of the second one (discardSuffix = pstring(\'marco\').discardSecond(many1(anyOf(whites))))', () => {
    const discardSuffix = pstring('marco').discardSecond(many1(anyOf(whites)));
    let parsing = discardSuffix.run('marco faustinelli');
    expect(parsing.toString()).to.be.eql('Validation.Success([[m,a,r,c,o],row=0;col=6;rest=faustinelli])');
    parsing = discardSuffix.run('marco                                faustinelli');
    expect(parsing.toString()).to.be.eql('Validation.Success([[m,a,r,c,o],row=0;col=37;rest=faustinelli])');
  });
});

describe('a tapper for parsers (tapP)', () => {
  it('can do things with a result that\'s going to be discarded', () => {
    const tapIntoDiscardIntegerSign = tapP(pchar('-'), res => {
      expect(res).to.be.eql('-');
    }).discardFirst(pdigit(8));
    // eslint-disable-next-line no-unused-vars
    const parsing = tapIntoDiscardIntegerSign.run('-8x');
  });
});

describe('a logger for parsers (logP)', () => {
  const storedLog = console.log;
  it('can log intermediate parsing results', () => {
    console.log = msg => {
      expect(msg).to.be.eql('pchar_-:-');
    };
    const logIntermediateResult = logP(pchar('-'))
      .discardFirst(pdigit(8));
    const parsing = logIntermediateResult.run('-8x');
    expect(parsing.toString()).to.be.eql('Validation.Success([8,row=0;col=2;rest=x])');
  });
  it('can log a result that\'s going to be discarded', () => {
    console.log = msg => {
      expect(msg).to.be.eql('many1 anyOf  \t\n\r:[ , ]');
    };
    const discardSuffix = pstring('marco').discardSecond(logP(many1(anyOf(whites))));
    const parsing = discardSuffix.run('marco  faustinelli');
    expect(parsing.toString()).to.be.eql('Validation.Success([[m,a,r,c,o],row=0;col=7;rest=faustinelli])');
  });
  console.log = storedLog;
});

describe('parsing while discarding input (ADVANCED STUFF)', function() {
  this.timeout(50000000000);
  it('allows to exclude parentheses', () => {
    const insideParens = pchar('(')
      .discardFirst(many(anyOf(lowercases)))
      .discardSecond(pchar(')'));
    expect(insideParens.run('(marco)').toString())
      .to.be.eql('Validation.Success([[m,a,r,c,o],row=1;col=0;rest=])');
    expect(insideParens.run('()').toString())
      .to.be.eql('Validation.Success([[],row=1;col=0;rest=])');
  });
  it('...even using a tailor-made method \'betweenParens\' (insideParens = betweenParens(pstring(\'marco\')))', () => {
    const insideParens = betweenParens(pstring('marco'));
    expect(insideParens.run('(marco)').toString())
      .to.be.eql('Validation.Success([[m,a,r,c,o],row=1;col=0;rest=])');
  });
  it('cherry-picking elements separated by separators (substringsWithCommas = many(many1(anyOf(lowercases)).discardSecond(pchar(\',\'))))', () => {
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
  describe('thanks to the specific sepBy1 operator (introduction to JSON parsers)', () => {
    const valuesP = many1(anyOf(lowercases));
    const commaP = pchar(',');
    it('cherry-picking 1+ elements separated by separators', () => {
      // debugger;
      const result = sepBy1(valuesP, commaP).run('a,b,cd').toString();
      expect(result)
        .to.be.eql('Validation.Success([[[a],[b],[c,d]],row=1;col=0;rest=])');
    });
    it('but unable to cherry-pick 0+ elements separated by separators', () => {
      const result = sepBy1(valuesP, commaP).run('');
      expect(result.isFailure).to.be.true;
    });
    describe('also able to handle lists', () => {
      const listElements = between(pchar('['), sepBy1(valuesP, commaP), pchar(']'));
      it('...lists with many elements', () => {
        const result = listElements.run('[a,b,cd,marco]').toString();
        expect(result)
          .to.be.eql('Validation.Success([[[a],[b],[c,d],[m,a,r,c,o]],row=1;col=0;rest=])');
      });
      it('...lists with just one element', () => {
        const result = listElements.run('[a]').toString();
        expect(result)
          .to.be.eql('Validation.Success([[[a]],row=1;col=0;rest=])');
      });
      it('...but unable to handle lists with no elements', () => {
        const result = listElements.run('[]');
        expect(result.isFailure).to.be.true;
      });
    });
  });
  describe('thanks to the specific sepBy operator (introduction to JSON parsers)', () => {
    const valuesP = many1(anyOf(lowercases));
    const commaP = pchar(',');
    it('cherry-picking 0+ elements separated by separators', () => {
      // debugger;
      const result = sepBy(valuesP, commaP).run('a,b,cd').toString();
      expect(result)
        .to.be.eql('Validation.Success([[[a],[b],[c,d]],row=1;col=0;rest=])');
    });
    it('still able to cherry-pick 0+ elements separated by separators', () => {
      const result = sepBy(valuesP, commaP).run(';');
      const resString = result.toString();
      expect(resString)
        .to.be.eql('Validation.Success([[],;])'); // WHY???!!!???!!!
    });
    describe('also able to handle lists', () => {
      const listElements = between(pchar('['), sepBy(valuesP, commaP), pchar(']'));
      it('...lists with many elements', () => {
        const result = listElements.run('[a,b,cd,marco]').toString();
        expect(result)
          .to.be.eql('Validation.Success([[[a],[b],[c,d],[m,a,r,c,o]],row=1;col=0;rest=])');
      });
      it('...lists with just one element', () => {
        const result = listElements.run('[a]').toString();
        expect(result)
          .to.be.eql('Validation.Success([[[a]],row=1;col=0;rest=])');
      });
      it('...still able to handle lists with no elements', () => {
        const result = listElements.run('[]');
        const resString = result.toString();
        expect(resString)
          .to.be.eql('Validation.Success([[],row=1;col=0;rest=])');
      });
    });
  });
});
