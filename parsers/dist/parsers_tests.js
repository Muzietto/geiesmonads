define(['chai', 'parsers', 'util', 'maybe', 'validation', 'classes'], function (_chai, _parsers, _util, _maybe, _validation, _classes) {
  'use strict';

  var _slicedToArray = function () {
    function sliceIterator(arr, i) {
      var _arr = [];
      var _n = true;
      var _d = false;
      var _e = undefined;

      try {
        for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
          _arr.push(_s.value);

          if (i && _arr.length === i) break;
        }
      } catch (err) {
        _d = true;
        _e = err;
      } finally {
        try {
          if (!_n && _i["return"]) _i["return"]();
        } finally {
          if (_d) throw _e;
        }
      }

      return _arr;
    }

    return function (arr, i) {
      if (Array.isArray(arr)) {
        return arr;
      } else if (Symbol.iterator in Object(arr)) {
        return sliceIterator(arr, i);
      } else {
        throw new TypeError("Invalid attempt to destructure non-iterable instance");
      }
    };
  }();

  var lowercases = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
  var uppercases = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
  var digits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  var whites = [' ', '\t', '\n', '\r'];
  var text = _classes.Position.fromText;

  describe('a basic parser for single chars (parserA = charParser(\'a\'))', function () {
    var parserA = (0, _parsers.charParser)('a');

    it('can parse a single char', function () {
      var parsingA = parserA(text('abc'));
      (0, _chai.expect)(parsingA.value[0]).to.be.eql('a');
      (0, _chai.expect)(parsingA.value[1].rest()).to.be.eql('bc');
      (0, _chai.expect)(parsingA.isSuccess).to.be.true;
    });

    it('can also NOT parse a single char', function () {
      var parsingB = parserA(text('bcd'));
      (0, _chai.expect)(parsingB.value[0]).to.be.eql('charParser');
      (0, _chai.expect)(parsingB.value[1]).to.be.eql('wanted a; got b');
      (0, _chai.expect)(parsingB.value[2].rest()).to.be.eql('bcd');
      (0, _chai.expect)(parsingB.isFailure).to.be.true;
    });

    it('fails at the end of the stream', function () {
      var parsingA = parserA(text(''));
      (0, _chai.expect)(parsingA.value[0]).to.be.eql('charParser');
      (0, _chai.expect)(parsingA.value[1]).to.be.eql('no more input');
      (0, _chai.expect)(parsingA.value[2].rest()).to.be.eql('');
      (0, _chai.expect)(parsingA.isFailure).to.be.true;
    });
  });

  describe('a basic parser for single STRINGIFIED digits (parser1 = digitParser(1))', function () {
    var parser1 = (0, _parsers.digitParser)(1);
    it('can parse a single digit', function () {
      var parsing1 = parser1(text('123'));
      (0, _chai.expect)(parsing1.value[0]).to.be.eql(1);
      (0, _chai.expect)(parsing1.value[1].rest()).to.be.eql('23');
      (0, _chai.expect)(parsing1.isSuccess).to.be.true;
    });

    it('can also NOT parse a single digit', function () {
      var parsing2 = parser1(text('234'));
      (0, _chai.expect)(parsing2.value[0]).to.be.eql('digitParser');
      (0, _chai.expect)(parsing2.value[1]).to.be.eql('wanted 1; got 2');
      (0, _chai.expect)(parsing2.value[2].rest()).to.be.eql('234');
      (0, _chai.expect)(parsing2.isFailure).to.be.true;
    });

    it('fails at the end of the stream also when hunting for digits', function () {
      var parsing3 = parser1(text(''));
      (0, _chai.expect)(parsing3.value[0]).to.be.eql('digitParser');
      (0, _chai.expect)(parsing3.value[1]).to.be.eql('no more input');
      (0, _chai.expect)(parsing3.value[2].rest()).to.be.eql('');
      (0, _chai.expect)(parsing3.isFailure).to.be.true;
    });
  });

  describe('a named character parser (parserA = pchar(\'a\'))', function () {
    var parserA = (0, _parsers.pchar)('a');

    it('can parse a single char', function () {
      (0, _chai.expect)((0, _util.isParser)(parserA)).to.be.true;
      var parsingA = parserA.run(text('abc'));
      (0, _chai.expect)(parsingA.value[0]).to.be.eql('a');
      (0, _chai.expect)(parsingA.value[1].rest()).to.be.eql('bc');
      (0, _chai.expect)(parsingA.isSuccess).to.be.true;
    });

    it('can also NOT parse a single char', function () {
      var parsingB = parserA.run(text('bcd'));
      (0, _chai.expect)(parsingB.value[0]).to.be.eql('pchar_a');
      (0, _chai.expect)(parsingB.value[1]).to.be.eql('wanted a; got b');
      (0, _chai.expect)(parsingB.isFailure).to.be.true;
    });
  });

  describe('the mapping parser fmap', function () {
    describe('defined as function (fmap(x => x.toUpperCase(), pchar(\'a\')))', function () {
      var mappingParser = (0, _parsers.fmap)(function (x) {
        return x.toUpperCase();
      }, (0, _parsers.pchar)('a'));
      it('shall map the output of another parser', function () {
        (0, _chai.expect)((0, _util.isParser)(mappingParser)).to.be.true;
        var mappedParsingA = mappingParser.run(text('abc'));
        (0, _chai.expect)(mappedParsingA.value[0]).to.be.eql('A');
        (0, _chai.expect)(mappedParsingA.value[1].rest()).to.be.eql('bc');
        (0, _chai.expect)(mappedParsingA.isSuccess).to.be.true;
      });
    });
    describe('defined as a method of another parser (pchar(\'a\').fmap(x => x.toUpperCase()))', function () {
      var mappingParser = (0, _parsers.pchar)('a').fmap(function (x) {
        return x.toUpperCase();
      });
      it('shall map the output of another parser', function () {
        (0, _chai.expect)((0, _util.isParser)(mappingParser)).to.be.true;
        var mappedParsingA = mappingParser.run(text('abc'));
        (0, _chai.expect)(mappedParsingA.value[0]).to.be.eql('A');
        (0, _chai.expect)(mappedParsingA.value[1].rest()).to.be.eql('bc');
        (0, _chai.expect)(mappedParsingA.isSuccess).to.be.true;
      });
    });
  });

  describe('two parsers bound by andThen (parserAandB = andThen(pchar(\'a\'), pchar(\'b\')))', function () {
    var parserAandB = (0, _parsers.andThen)((0, _parsers.pchar)('a'), (0, _parsers.pchar)('b'));

    it('can parse two chars', function () {
      (0, _chai.expect)((0, _util.isParser)(parserAandB)).to.be.true;
      var parsingAandB = parserAandB.run(text('abc'));
      (0, _chai.expect)(parsingAandB.isSuccess).to.be.true;
      (0, _chai.expect)(parsingAandB.value[0].toString()).to.be.eql('[a,b]');
      (0, _chai.expect)(parsingAandB.value[1].rest()).to.be.eql('c');
      (0, _chai.expect)(parsingAandB.toString()).to.be.eql('Validation.Success([[a,b],row=0;col=2;rest=c])');
    });

    it('will fail if the two chars are not the ones sought', function () {
      var parsingAandB = parserAandB.run(text('acd'));
      (0, _chai.expect)(parsingAandB.isFailure).to.be.true;
      (0, _chai.expect)(parsingAandB.value[0]).to.be.eql('pchar_a andThen pchar_b');
      (0, _chai.expect)(parsingAandB.value[1]).to.be.eql('wanted b; got c');
      (0, _chai.expect)(parsingAandB.value[2].rest()).to.be.eql('cd');
    });

    it('will fail if the input is too short', function () {
      (0, _chai.expect)(parserAandB.run(text('a')).isFailure).to.be.true;
      (0, _chai.expect)(parserAandB.run(text('ab')).isSuccess).to.be.true;
    });
  });

  describe('two parsers bound by orElse (parserAorB = orElse(pchar(\'a\'), pchar(\'b\')))', function () {
    var parserAorB = (0, _parsers.orElse)((0, _parsers.pchar)('a'), (0, _parsers.pchar)('b'));

    it('can parse one of two chars', function () {
      (0, _chai.expect)((0, _util.isParser)(parserAorB)).to.be.true;
      var parsingAorB = parserAorB.run(text('abc'));
      (0, _chai.expect)(parsingAorB.isSuccess).to.be.true;
      (0, _chai.expect)(parsingAorB.value[0]).to.be.eql('a');
      (0, _chai.expect)(parsingAorB.value[1].rest()).to.be.eql('bc');
      parsingAorB = parserAorB.run(text('bbc'));
      (0, _chai.expect)(parsingAorB.isSuccess).to.be.true;
      (0, _chai.expect)(parsingAorB.value[0]).to.be.eql('b');
      (0, _chai.expect)(parsingAorB.value[1].rest()).to.be.eql('bc');
    });

    it('can also parse NONE of two chars', function () {
      var parsingAorB = parserAorB.run(text('cde'));
      (0, _chai.expect)(parsingAorB.isFailure).to.be.true;
      (0, _chai.expect)(parsingAorB.value[0]).to.be.eql('pchar_a orElse pchar_b');
      (0, _chai.expect)(parsingAorB.value[1]).to.be.eql('wanted b; got c');
      (0, _chai.expect)(parsingAorB.value[2].rest()).to.be.eql('cde');
    });

    it('will fail if the input is too short', function () {
      (0, _chai.expect)(parserAorB.run(text('a')).isSuccess).to.be.true;
      (0, _chai.expect)(parserAorB.run(text('')).isFailure).to.be.true;
    });
  });

  describe('a parser for even just three chars in a row, done with andThen + fmap, is real clumsy; but it works...', function () {
    it('parses abc', function () {
      var pairAdder = function pairAdder(_ref) {
        var _ref2 = _slicedToArray(_ref, 2),
            x = _ref2[0],
            y = _ref2[1];

        return x + y;
      };
      var abcP = (0, _parsers.andThen)((0, _parsers.pchar)('a'), (0, _parsers.andThen)((0, _parsers.pchar)('b'), (0, _parsers.andThen)((0, _parsers.pchar)('c'), (0, _parsers.returnP)('')).fmap(pairAdder)).fmap(pairAdder)).fmap(pairAdder);
      var parsing = abcP.run('abcd');
      (0, _chai.expect)(parsing.isSuccess).to.be.true;
      (0, _chai.expect)(parsing.value[0].toString()).to.be.eql('abc');
      (0, _chai.expect)(parsing.value[1].rest()).to.be.eql('d');
    });
    it('parses abc with a different, but still very clumsy syntax', function () {
      var pairAdder = function pairAdder(_ref3) {
        var _ref4 = _slicedToArray(_ref3, 2),
            x = _ref4[0],
            y = _ref4[1];

        return x + y;
      };
      var abcP = (0, _parsers.pchar)('a').andThen((0, _parsers.pchar)('b')).fmap(pairAdder).andThen((0, _parsers.pchar)('c')).fmap(pairAdder);
      var parsing = abcP.run('abcd');
      (0, _chai.expect)(parsing.isSuccess).to.be.true;
      (0, _chai.expect)(parsing.value[0].toString()).to.be.eql('abc');
      (0, _chai.expect)(parsing.value[1].rest()).to.be.eql('d');
    });
  });

  describe('a parser for even just three digits in a row, done with andThen + fmap, is real clumsy; but it works...', function () {
    var parseDigit = void 0,
        threeDigits = void 0,
        parsing = void 0;

    before(function () {
      parseDigit = (0, _parsers.anyOf)(digits);
      threeDigits = (0, _parsers.andThen)(parseDigit, (0, _parsers.andThen)(parseDigit, parseDigit));
      parsing = threeDigits.run('123');
    });
    it('parses any of three digits', function () {
      (0, _chai.expect)(parsing.isSuccess).to.be.true;
      (0, _chai.expect)(parsing.value[0].toString()).to.be.eql('[1,[2,3]]');
      (0, _chai.expect)(parsing.value[1].rest()).to.be.eql('');
    });
    describe('parses any of three digits while showcasing fmap', function () {
      var unpacker = function unpacker(_ref5) {
        var _ref6 = _slicedToArray(_ref5, 2),
            x = _ref6[0],
            _ref6$ = _slicedToArray(_ref6[1], 2),
            y = _ref6$[0],
            z = _ref6$[1];

        return [x, y, z];
      };
      it('as global method', function () {
        var threeDigitsImpl = (0, _parsers.fmap)(unpacker, threeDigits);
        var parsing = threeDigitsImpl.run('123');
        (0, _chai.expect)(parsing.isSuccess).to.be.true;
        (0, _chai.expect)(parsing.value[0].toString()).to.be.eql('[1,2,3]');
        (0, _chai.expect)(parsing.value[1].rest()).to.be.eql('');
      });
      it('as instance method', function () {
        var threeDigitsInst = threeDigits.fmap(unpacker);
        var parsing = threeDigitsInst.run('123');
        (0, _chai.expect)(parsing.isSuccess).to.be.true;
        (0, _chai.expect)(parsing.value[0].toString()).to.be.eql('[1,2,3]');
        (0, _chai.expect)(parsing.value[1].rest()).to.be.eql('');
      });
    });
  });

  describe('a choice of four parsers bound by orElse (parsersChoice = choice([pchar(\'a\'), pchar(\'b\'), pchar(\'c\'), pchar(\'d\'),]))', function () {
    var parsersChoice = (0, _parsers.choice)([(0, _parsers.pchar)('a'), (0, _parsers.pchar)('b'), (0, _parsers.pchar)('c'), (0, _parsers.pchar)('d')]);

    it('can parse one of four chars', function () {
      (0, _chai.expect)((0, _util.isParser)(parsersChoice)).to.be.true;
      var parsingChoice = parsersChoice.run(text('a'));
      (0, _chai.expect)(parsingChoice.isSuccess).to.be.true;
      (0, _chai.expect)(parsingChoice.value[0]).to.be.eql('a');
      (0, _chai.expect)(parsingChoice.value[1].rest()).to.be.eql('');
      parsingChoice = parsersChoice.run(text('b'));
      (0, _chai.expect)(parsingChoice.isSuccess).to.be.true;
      (0, _chai.expect)(parsingChoice.value[0]).to.be.eql('b');
      (0, _chai.expect)(parsingChoice.value[1].rest()).to.be.eql('');
      parsingChoice = parsersChoice.run(text('d'));
      (0, _chai.expect)(parsingChoice.isSuccess).to.be.true;
      (0, _chai.expect)(parsingChoice.value[0]).to.be.eql('d');
      (0, _chai.expect)(parsingChoice.value[1].rest()).to.be.eql('');
    });

    it('will fail if NONE of the four chars is provided', function () {
      var parsingChoice = parsersChoice.run(text('x'));
      (0, _chai.expect)(parsingChoice.isFailure).to.be.true;
      (0, _chai.expect)(parsingChoice.value[0]).to.be.eql('choice /pchar_a/pchar_b/pchar_c/pchar_d');
      (0, _chai.expect)(parsingChoice.value[1]).to.be.eql('fail');
      (0, _chai.expect)(parsingChoice.value[2].rest()).to.be.eql('x');
    });

    it('will fail if the input is too short', function () {
      (0, _chai.expect)(parsersChoice.run(text('a')).isSuccess).to.be.true;
      (0, _chai.expect)(parsersChoice.run(text('')).isFailure).to.be.true;
    });
  });

  describe('a parser for any of a list of... ', function () {
    describe('lowercase chars (lowercasesParser = anyOf(lowercases))', function () {
      var lowercasesParser = (0, _parsers.anyOf)(lowercases);
      it('can parse any single lowercase char', function () {
        (0, _chai.expect)((0, _util.isParser)(lowercasesParser)).to.be.true;
        var parsingChoice = lowercasesParser.run(text('a'));
        (0, _chai.expect)(parsingChoice.isSuccess).to.be.true;
        (0, _chai.expect)(parsingChoice.value[0]).to.be.eql('a');
        (0, _chai.expect)(parsingChoice.value[1].rest()).to.be.eql('');
        parsingChoice = lowercasesParser.run(text('b'));
        (0, _chai.expect)(parsingChoice.isSuccess).to.be.true;
        (0, _chai.expect)(parsingChoice.value[0]).to.be.eql('b');
        (0, _chai.expect)(parsingChoice.value[1].rest()).to.be.eql('');
        parsingChoice = lowercasesParser.run(text('d'));
        (0, _chai.expect)(parsingChoice.isSuccess).to.be.true;
        (0, _chai.expect)(parsingChoice.value[0]).to.be.eql('d');
        (0, _chai.expect)(parsingChoice.value[1].rest()).to.be.eql('');
        parsingChoice = lowercasesParser.run(text('z'));
        (0, _chai.expect)(parsingChoice.isSuccess).to.be.true;
        (0, _chai.expect)(parsingChoice.value[0]).to.be.eql('z');
        (0, _chai.expect)(parsingChoice.value[1].rest()).to.be.eql('');
      });
      it('cannot parse any single uppercase char', function () {
        var parsingChoice = lowercasesParser.run(text('Y'));
        (0, _chai.expect)(parsingChoice.isFailure).to.be.true;
        (0, _chai.expect)(parsingChoice.value[0]).to.be.eql('anyOf abcdefghijklmnopqrstuvwxyz');
        (0, _chai.expect)(parsingChoice.value[1]).to.be.eql('fail');
        (0, _chai.expect)(parsingChoice.value[2].rest()).to.be.eql('Y');
      });
    });
    describe('uppercase chars (uppercasesParser = anyOf(uppercases))', function () {
      var uppercasesParser = (0, _parsers.anyOf)(uppercases);
      it('can parse any single uppercase char', function () {
        (0, _chai.expect)((0, _util.isParser)(uppercasesParser)).to.be.true;
        var parsingChoice = uppercasesParser.run(text('A'));
        (0, _chai.expect)(parsingChoice.isSuccess).to.be.true;
        (0, _chai.expect)(parsingChoice.value[0]).to.be.eql('A');
        (0, _chai.expect)(parsingChoice.value[1].rest()).to.be.eql('');
        parsingChoice = uppercasesParser.run(text('B'));
        (0, _chai.expect)(parsingChoice.isSuccess).to.be.true;
        (0, _chai.expect)(parsingChoice.value[0]).to.be.eql('B');
        (0, _chai.expect)(parsingChoice.value[1].rest()).to.be.eql('');
        parsingChoice = uppercasesParser.run(text('R'));
        (0, _chai.expect)(parsingChoice.isSuccess).to.be.true;
        (0, _chai.expect)(parsingChoice.value[0]).to.be.eql('R');
        (0, _chai.expect)(parsingChoice.value[1].rest()).to.be.eql('');
        parsingChoice = uppercasesParser.run(text('Z'));
        (0, _chai.expect)(parsingChoice.isSuccess).to.be.true;
        (0, _chai.expect)(parsingChoice.value[0]).to.be.eql('Z');
        (0, _chai.expect)(parsingChoice.value[1].rest()).to.be.eql('');
      });
      it('cannot parse any single lowercase char', function () {
        var parsingChoice = uppercasesParser.run(text('s'));
        (0, _chai.expect)(parsingChoice.isFailure).to.be.true;
        (0, _chai.expect)(parsingChoice.value[0]).to.be.eql('anyOf ABCDEFGHIJKLMNOPQRSTUVWXYZ');
        (0, _chai.expect)(parsingChoice.value[1]).to.be.eql('fail');
        (0, _chai.expect)(parsingChoice.value[2].rest()).to.be.eql('s');
      });
    });
    describe('digits (digitsParser = anyOf(digits))', function () {
      var digitsParser = (0, _parsers.anyOf)(digits);
      it('can parse any single digit', function () {
        (0, _chai.expect)((0, _util.isParser)(digitsParser)).to.be.true;
        var parsingChoice = digitsParser.run(text('1'));
        (0, _chai.expect)(parsingChoice.isSuccess).to.be.true;
        (0, _chai.expect)(parsingChoice.value[0]).to.be.eql('1');
        (0, _chai.expect)(parsingChoice.value[1].rest()).to.be.eql('');
        parsingChoice = digitsParser.run(text('3'));
        (0, _chai.expect)(parsingChoice.isSuccess).to.be.true;
        (0, _chai.expect)(parsingChoice.value[0]).to.be.eql('3');
        (0, _chai.expect)(parsingChoice.value[1].rest()).to.be.eql('');
        parsingChoice = digitsParser.run(text('0'));
        (0, _chai.expect)(parsingChoice.isSuccess).to.be.true;
        (0, _chai.expect)(parsingChoice.value[0]).to.be.eql('0');
        (0, _chai.expect)(parsingChoice.value[1].rest()).to.be.eql('');
        parsingChoice = digitsParser.run(text('8'));
        (0, _chai.expect)(parsingChoice.isSuccess).to.be.true;
        (0, _chai.expect)(parsingChoice.value[0]).to.be.eql('8');
        (0, _chai.expect)(parsingChoice.value[1].rest()).to.be.eql('');
      });
      it('cannot parse any single character', function () {
        var parsingChoice = digitsParser.run(text('s'));
        (0, _chai.expect)(parsingChoice.isFailure).to.be.true;
        (0, _chai.expect)(parsingChoice.value[0]).to.be.eql('anyOf 0123456789');
        (0, _chai.expect)(parsingChoice.value[1]).to.be.eql('fail');
        (0, _chai.expect)(parsingChoice.value[2].rest()).to.be.eql('s');
      });
    });
    it('will fail if the input is too short', function () {
      (0, _chai.expect)((0, _parsers.anyOf)(lowercases).run(text('')).isFailure).to.be.true;
      (0, _chai.expect)((0, _parsers.anyOf)(uppercases).run(text('')).isFailure).to.be.true;
      (0, _chai.expect)((0, _parsers.anyOf)(digits).run(text('')).isFailure).to.be.true;
    });
  });

  describe('lift2 for parsers', function () {
    it('operates on the results of two string parsings', function () {
      var addStrings = function addStrings(x) {
        return function (y) {
          return x + '+' + y;
        };
      };
      var AplusB = (0, _parsers.lift2)(addStrings)((0, _parsers.pchar)('a'))((0, _parsers.pchar)('b'));
      (0, _chai.expect)(AplusB.run('abc').toString()).to.be.eql('Validation.Success([a+b,row=0;col=2;rest=c])');
    });
    it('adds the results of two digit parsings', function () {
      var addDigits = function addDigits(x) {
        return function (y) {
          return x + y;
        };
      };
      var addParser = (0, _parsers.lift2)(addDigits)((0, _parsers.pdigit)(1))((0, _parsers.pdigit)(2));
      (0, _chai.expect)(addParser.run('1234').toString()).to.be.eql('Validation.Success([3,row=0;col=2;rest=34])');
      (0, _chai.expect)(addParser.run('144').isFailure).to.be.true;
    });
  });

  describe('a sequence of parsers, built using lift2(cons) (aka sequenceP)', function () {
    it('stores matched chars inside an ARRAY', function () {
      var abcParser = (0, _parsers.sequenceP)([(0, _parsers.pchar)('a'), (0, _parsers.pchar)('b'), (0, _parsers.pchar)('c')]);
      (0, _chai.expect)(abcParser.run('abc').toString()).to.be.eql('Validation.Success([[a,b,c],row=1;col=0;rest=])');
    });
    it('requires therefore some mapping', function () {
      var mappedAbcParser = (0, _parsers.sequenceP)([(0, _parsers.pchar)('a'), (0, _parsers.pchar)('b'), (0, _parsers.pchar)('c')]).fmap(function (a) {
        return a.join('');
      });
      (0, _chai.expect)(mappedAbcParser.run('abc').toString()).to.be.eql('Validation.Success([abc,row=1;col=0;rest=])');
    });
  });

  describe('a sequence of parsers, built using andThen && fmap (aka sequenceP2)', function () {
    it('store matched chars inside a plain STRING', function () {
      var abcParser = (0, _parsers.sequenceP2)([(0, _parsers.pchar)('a'), (0, _parsers.pchar)('b'), (0, _parsers.pchar)('c')]);
      (0, _chai.expect)(abcParser.run('abc').toString()).to.be.eql('Validation.Success([abc,row=1;col=0;rest=])');
    });
  });

  describe('a parser for a specific sequence of chars', function () {
    it('is easy to create with sequenceP (marcoParser = pstring(\'marco\')) and it returns an array', function () {
      var marcoParser = (0, _parsers.pstring)('marco');
      var marcoParsing = marcoParser.run('marcociao');
      (0, _chai.expect)(marcoParsing.isSuccess).to.be.true;
      (0, _chai.expect)(marcoParsing.toString()).to.be.eql('Validation.Success([[m,a,r,c,o],row=0;col=5;rest=ciao])');
    });
    it('has a version based on sequenceP2 that returns strings (marcoParser = stringP(\'marco\'))', function () {
      var marcoParser = (0, _parsers.stringP)('marco');
      var marcoParsing = marcoParser.run('marcociao');
      (0, _chai.expect)(marcoParsing.isSuccess).to.be.true;
      (0, _chai.expect)(marcoParsing.toString()).to.be.eql('Validation.Success([marco,row=0;col=5;rest=ciao])');
    });
  });

  describe('a succeeding parser (succeedP)', function () {
    var whatever = _classes.Position.fromText('whatever');
    it('succeeds always', function () {
      (0, _chai.expect)(_parsers.succeedP.run(whatever).isSuccess).to.be.true;
    });
    it('can be used as a flag to exit with satisfaction from a more complex parsing (parsing = sequenceP([pchar(\'w\'), pchar(\'h\'), succeedP]))', function () {
      (0, _chai.expect)(_parsers.succeedP.run(whatever).isSuccess).to.be.true;
      var parsing = (0, _parsers.sequenceP)([(0, _parsers.pchar)('w'), (0, _parsers.pchar)('h'), _parsers.succeedP]).run(whatever);
      (0, _chai.expect)(parsing.toString()).to.be.eql('Validation.Success([[w,h,],row=0;col=2;rest=atever])');
    });
    it('does not consume characters, but it returns an empty string as result', function () {
      var parsing = (0, _parsers.sequenceP)([(0, _parsers.pchar)('w'), _parsers.succeedP, (0, _parsers.pchar)('h')]);
      (0, _chai.expect)(parsing.run(whatever).toString()).to.be.eql('Validation.Success([[w,,h],row=0;col=2;rest=atever])');
    });
  });

  describe('a failing parser (failP)', function () {
    it('will always fail', function () {
      (0, _chai.expect)(_parsers.failP.run('whatever').isFailure).to.be.true;
    });
    it('can be used as a flag to exit WITHOUT satisfaction from a more complex parsing (parsing = sequenceP([pchar(\'w\'), pchar(\'h\'), failP]))', function () {
      (0, _chai.expect)(_parsers.failP.run('whatever').isFailure).to.be.true;
      var parsing = (0, _parsers.sequenceP)([(0, _parsers.pchar)('w'), (0, _parsers.pchar)('h'), _parsers.failP]).run('whatever');
      (0, _chai.expect)(parsing.toString()).to.be.eql('Validation.Failure([bindP applied to bindP applied to undefined,fail,row=0;col=2;rest=atever])');
    });
    it('does not consume characters, but it returns an empty string as result', function () {
      var parsing = (0, _parsers.sequenceP)([(0, _parsers.pchar)('w'), _parsers.failP, (0, _parsers.pchar)('h')]);
      (0, _chai.expect)(parsing.run('whatever').toString()).to.be.eql('Validation.Failure([bindP applied to bindP applied to undefined,fail,row=0;col=1;rest=hatever])');
    });
  });

  describe('a parser for the start of the input (startOfInputP)', function () {
    it('succeeds at the start of the stream', function () {
      (0, _chai.expect)(_parsers.startOfInputP.run(_classes.Position.fromText('abc')).isSuccess).to.be.true;
    });
    it('fails halfway through the stream ()', function () {
      var laterInTheStream = (0, _parsers.sequenceP)([(0, _parsers.pchar)('a'), _parsers.startOfInputP]);
      (0, _chai.expect)(laterInTheStream.run(_classes.Position.fromText('abc')).isFailure).to.be.true;
    });
    it('does not consume characters, but it returns an empty string as result', function () {
      var startABC = (0, _parsers.sequenceP)([_parsers.startOfInputP, (0, _parsers.pchar)('A'), (0, _parsers.pchar)('B'), (0, _parsers.pchar)('C')]);
      var parsing = startABC.run(_classes.Position.fromText('ABC'));
      (0, _chai.expect)(parsing.toString()).to.be.eql('Validation.Success([[,A,B,C],row=1;col=0;rest=])');
    });
  });

  describe('a parser for NOT the start of the input (notStartOfInputP)', function () {
    it('fails at the start of the stream', function () {
      (0, _chai.expect)(_parsers.notStartOfInputP.run(_classes.Position.fromText('abc')).isFailure).to.be.true;
      (0, _chai.expect)((0, _parsers.sequenceP)([_parsers.notStartOfInputP, (0, _parsers.pchar)('a')]).run(_classes.Position.fromText('abc')).toString()).to.be.eql('Validation.Failure([bindP applied to bindP applied to undefined,fail,row=0;col=0;rest=abc])');
    });
    it('succeeds halfway through the stream', function () {
      var laterInTheStream = (0, _parsers.sequenceP)([(0, _parsers.pchar)('a'), _parsers.notStartOfInputP]);
      (0, _chai.expect)(laterInTheStream.run(_classes.Position.fromText('abc')).isSuccess).to.be.true;
    });
    it('does not consume characters, but it returns an empty string as result', function () {
      var ABNotStartC = (0, _parsers.sequenceP)([(0, _parsers.pchar)('A'), (0, _parsers.pchar)('B'), _parsers.notStartOfInputP, (0, _parsers.pchar)('C')]);
      var parsing = ABNotStartC.run(_classes.Position.fromText('ABC'));
      (0, _chai.expect)(parsing.toString()).to.be.eql('Validation.Success([[A,B,,C],row=1;col=0;rest=])');
    });
  });

  describe('a parser for the end of the input (endOfInputP)', function () {
    it('succeeds at the end of the stream', function () {
      var finallyInTheStream = (0, _parsers.sequenceP)([(0, _parsers.pchar)('a'), (0, _parsers.pchar)('b'), _parsers.endOfInputP]);
      (0, _chai.expect)(finallyInTheStream.run(_classes.Position.fromText('ab')).isSuccess).to.be.true;
    });
    it('fails halfway through the stream', function () {
      var laterInTheStream = (0, _parsers.sequenceP)([(0, _parsers.pchar)('a'), _parsers.endOfInputP]);
      (0, _chai.expect)(laterInTheStream.run(_classes.Position.fromText('abc')).isFailure).to.be.true;
    });
  });

  describe('a parser for NOT the end of the input (notEndOfInputP)', function () {
    it('fails at the end of the stream', function () {
      var notFinallyInTheStream = (0, _parsers.sequenceP)([(0, _parsers.pchar)('a'), _parsers.notEndOfInputP]);
      (0, _chai.expect)(notFinallyInTheStream.run(_classes.Position.fromText('a')).isFailure).to.be.true;
    });
    it('succeeds halfway through the stream', function () {
      var ABnotEndC = (0, _parsers.sequenceP)([(0, _parsers.pchar)('A'), (0, _parsers.pchar)('B'), _parsers.notEndOfInputP, (0, _parsers.pchar)('C')].map(_parsers.logP));
      (0, _chai.expect)(ABnotEndC.run(_classes.Position.fromText('ABC')).isSuccess).to.be.true;
    });
    it('does not consume characters, but it returns an empty string as result', function () {
      var AnotEndB = (0, _parsers.sequenceP)([(0, _parsers.pchar)('A'), _parsers.notEndOfInputP, (0, _parsers.pchar)('B')].map(_parsers.logP));
      (0, _chai.expect)(AnotEndB.run(_classes.Position.fromText('AB')).toString()).to.be.eql('Validation.Success([[A,,B],row=1;col=0;rest=])');
    });
  });

  describe('a parser that trims parsings (trimP)', function () {
    it('can ignore whitespaces around a single char (trimmer = trimP(pchar(\'a\')))', function () {
      var trimmer = (0, _parsers.trimP)((0, _parsers.pchar)('a'));
      (0, _chai.expect)(trimmer.run('  a    ').toString()).to.be.eql('Validation.Success([a,row=1;col=0;rest=])');
    });
    it('can ignore whitespaces around a sequence of two chars (trimmer = trimP(pchar(\'a\').andThen(pchar(\'b\')))', function () {
      var trimmer = (0, _parsers.trimP)((0, _parsers.pchar)('a').andThen((0, _parsers.pchar)('b')));
      (0, _chai.expect)(trimmer.run('  ab    ').toString()).to.be.eql('Validation.Success([[a,b],row=1;col=0;rest=])');
    });
  });

  describe('a parser for a specific word (pword)', function () {
    it('detects and ignores whitespaces around it', function () {
      var marcoParser = (0, _parsers.pword)('marco');
      var marcoParsing = marcoParser.run('  marco ciao');
      (0, _chai.expect)(marcoParsing.isSuccess).to.be.true;
      (0, _chai.expect)(marcoParsing.toString()).to.be.eql('Validation.Success([[m,a,r,c,o],row=0;col=8;rest=ciao])');
    });
    it('has no problem if the whitespaces aren\'t there', function () {
      var marcoParser = (0, _parsers.pword)('marco');
      var marcoParsing = marcoParser.run('marcociao');
      (0, _chai.expect)(marcoParsing.isSuccess).to.be.true;
      (0, _chai.expect)(marcoParsing.toString()).to.be.eql('Validation.Success([[m,a,r,c,o],row=0;col=5;rest=ciao])');
    });
  });

  describe('a parsing function for zero or more occurrences (zeroOrMore)', function () {
    it('can parse a char zero times (zeroOrMoreParsingFunction = zeroOrMore(pchar(\'m\')))', function () {
      var zeroOrMoreParsingFunction = (0, _parsers.zeroOrMore)((0, _parsers.pchar)('m'));
      var parsing = zeroOrMoreParsingFunction(text('arco'));
      (0, _chai.expect)(parsing.isSuccess).to.be.true;
      (0, _chai.expect)(parsing.toString()).to.be.eql('Validation.Success([[],row=0;col=0;rest=arco])');
    });
    it('can parse a char many times (zeroOrMoreParsingFunction = zeroOrMore(pchar(\'m\')))', function () {
      var zeroOrMoreParsingFunction = (0, _parsers.zeroOrMore)((0, _parsers.pchar)('m'));
      var parsing = zeroOrMoreParsingFunction(text('mmmarco'));
      (0, _chai.expect)(parsing.isSuccess).to.be.true;
      (0, _chai.expect)(parsing.toString()).to.be.eql('Validation.Success([[m,m,m],row=0;col=3;rest=arco])');
    });
    it('can parse a char sequence zero times (zeroOrMoreParsingFunction = zeroOrMore(pstring(\'marco\')))', function () {
      var zeroOrMoreParsingFunction = (0, _parsers.zeroOrMore)((0, _parsers.pstring)('marco'));
      var parsing = zeroOrMoreParsingFunction(text('xmarcomarcociao'));
      (0, _chai.expect)(parsing.isSuccess).to.be.true;
      (0, _chai.expect)(parsing.toString()).to.be.eql('Validation.Success([[],row=0;col=0;rest=xmarcomarcociao])');
    });
    it('can parse a char sequence many times (zeroOrMoreParsingFunction = zeroOrMore(pstring(\'marco\')))', function () {
      var zeroOrMoreParsingFunction = (0, _parsers.zeroOrMore)((0, _parsers.pstring)('marco'));
      var parsing = zeroOrMoreParsingFunction(text('marcomarcociao'));
      (0, _chai.expect)(parsing.isSuccess).to.be.true;
      (0, _chai.expect)(parsing.toString()).to.be.eql('Validation.Success([[[m,a,r,c,o],[m,a,r,c,o]],row=0;col=10;rest=ciao])');
    });
  });

  describe('a parser for zero or more occurrences', function () {
    it('can parse a char zero times (zeroOrMoreParser = many(pchar(\'m\')))', function () {
      var zeroOrMoreParser = (0, _parsers.many)((0, _parsers.pchar)('m'));
      var parsing = zeroOrMoreParser.run(text('arco'));
      (0, _chai.expect)(parsing.isSuccess).to.be.true;
      (0, _chai.expect)(parsing.toString()).to.be.eql('Validation.Success([[],row=0;col=0;rest=arco])');
    });
    it('can parse a char many times and return an array (zeroOrMoreParser = many(pchar(\'m\')))', function () {
      var zeroOrMoreParser = (0, _parsers.many)((0, _parsers.pchar)('m'));
      var parsing = zeroOrMoreParser.run(text('mmmarco'));
      (0, _chai.expect)(parsing.isSuccess).to.be.true;
      (0, _chai.expect)(parsing.toString()).to.be.eql('Validation.Success([[m,m,m],row=0;col=3;rest=arco])');
    });
    it('can parse a char exactly n times and return an array, or fail (exactlyThree = many(pchar(\'m\'), 3))', function () {
      var exactlyThree = (0, _parsers.many)((0, _parsers.pchar)('m'), 3);
      var parsing = exactlyThree.run(text('mmmarco'));
      (0, _chai.expect)(parsing.isSuccess).to.be.true;
      (0, _chai.expect)(parsing.toString()).to.be.eql('Validation.Success([[m,m,m],row=0;col=3;rest=arco])');
      parsing = exactlyThree.run(text('mmmmarco'));
      (0, _chai.expect)(parsing.isFailure).to.be.true;
      (0, _chai.expect)(parsing.toString()).to.be.eql('Validation.Failure([many pchar_m times=3,times param wanted 3; got 4,row=0;col=0;rest=mmmmarco])');
    });
    it('can parse a char many times and return a string (zeroOrMoreParser = manyChars(pchar(\'m\')))', function () {
      var zeroOrMoreParser = (0, _parsers.manyChars)((0, _parsers.pchar)('m'));
      var parsing = zeroOrMoreParser.run(text('mmmarco'));
      (0, _chai.expect)(parsing.isSuccess).to.be.true;
      (0, _chai.expect)(parsing.toString()).to.be.eql('Validation.Success([mmm,row=0;col=3;rest=arco])');
    });
    it('can parse a char exactly n times and return a string, or fail (exactlyThree = manyChars(pchar(\'m\'), 3))', function () {
      var exactlyThree = (0, _parsers.manyChars)((0, _parsers.pchar)('m'), 3);
      var parsing = exactlyThree.run(text('mmmarco'));
      (0, _chai.expect)(parsing.isSuccess).to.be.true;
      (0, _chai.expect)(parsing.toString()).to.be.eql('Validation.Success([mmm,row=0;col=3;rest=arco])');
      parsing = exactlyThree.run(text('mmmmarco'));
      (0, _chai.expect)(parsing.isFailure).to.be.true;
      (0, _chai.expect)(parsing.toString()).to.be.eql('Validation.Failure([manyChars pchar_m times=3,times param wanted 3; got 4,row=0;col=0;rest=mmmmarco])');
    });
    it('can parse a char sequence zero times (zeroOrMoreParser = many(pstring(\'marco\')))', function () {
      var zeroOrMoreParser = (0, _parsers.many)((0, _parsers.pstring)('marco'));
      var parsing = zeroOrMoreParser.run(text('xmarcomarcociao'));
      (0, _chai.expect)(parsing.isSuccess).to.be.true;
      (0, _chai.expect)(parsing.toString()).to.be.eql('Validation.Success([[],row=0;col=0;rest=xmarcomarcociao])');
    });
    it('can parse a char sequence many times (zeroOrMoreParser = many(pstring(\'marco\')))', function () {
      var zeroOrMoreParser = (0, _parsers.many)((0, _parsers.pstring)('marco'));
      var parsing = zeroOrMoreParser.run('marcomarcociao');
      (0, _chai.expect)(parsing.isSuccess).to.be.true;
      (0, _chai.expect)(parsing.toString()).to.be.eql('Validation.Success([[[m,a,r,c,o],[m,a,r,c,o]],row=0;col=10;rest=ciao])');
    });
    it('can parse whitespaces!! (whitesParser = many(anyOf(whites)))', function () {
      var whitesParser = (0, _parsers.many)((0, _parsers.anyOf)(whites));
      var twoWords = (0, _parsers.sequenceP)([(0, _parsers.pstring)('ciao'), whitesParser, (0, _parsers.pstring)('mamma')]);
      var parsing = twoWords.run('ciaomammaX');
      (0, _chai.expect)(parsing.toString()).to.be.eql('Validation.Success([[[c,i,a,o],[],[m,a,m,m,a]],row=0;col=9;rest=X])');
      parsing = twoWords.run('ciao mammaX');
      (0, _chai.expect)(parsing.toString()).to.be.eql('Validation.Success([[[c,i,a,o],[ ],[m,a,m,m,a]],row=0;col=10;rest=X])');
      parsing = twoWords.run('ciao   mammaX');
      (0, _chai.expect)(parsing.toString()).to.be.eql('Validation.Success([[[c,i,a,o],[ , , ],[m,a,m,m,a]],row=0;col=12;rest=X])');
      parsing = twoWords.run('ciao \t mammaX');
      (0, _chai.expect)(parsing.toString()).to.be.eql('Validation.Success([[[c,i,a,o],[ ,\t, ],[m,a,m,m,a]],row=0;col=12;rest=X])');
    });
  });

  describe('a parser for one or more occurrences (many1, manyChars1)', function () {
    it('cannot parse a char zero times (oneOrMoreParser = many1(pchar(\'m\')))', function () {
      var oneOrMoreParser = (0, _parsers.many1)((0, _parsers.pchar)('m'));
      var parsing = oneOrMoreParser.run('arco');
      (0, _chai.expect)(parsing.isFailure).to.be.true;
      (0, _chai.expect)(parsing.toString()).to.be.eql('Validation.Failure([many1 pchar_m,wanted m; got a,row=0;col=0;rest=arco])');
    });
    it('can parse a char many times and return an array (oneOrMoreParser = many1(pchar(\'m\')))', function () {
      var oneOrMoreParser = (0, _parsers.many1)((0, _parsers.pchar)('m'));
      var parsing = oneOrMoreParser.run('mmmarco');
      (0, _chai.expect)(parsing.isSuccess).to.be.true;
      (0, _chai.expect)(parsing.toString()).to.be.eql('Validation.Success([[m,m,m],row=0;col=3;rest=arco])');
    });
    it('can parse a char many times and return a string (oneOrMoreParser = manyChars1(pchar(\'m\')))', function () {
      var oneOrMoreParser = (0, _parsers.manyChars1)((0, _parsers.pchar)('m'));
      var parsing = oneOrMoreParser.run('mmmarco');
      (0, _chai.expect)(parsing.isSuccess).to.be.true;
      (0, _chai.expect)(parsing.toString()).to.be.eql('Validation.Success([mmm,row=0;col=3;rest=arco])');
    });
    it('cannot parse a char sequence zero times (oneOrMoreParser = many1(pstring(\'marco\')))', function () {
      var oneOrMoreParser = (0, _parsers.many1)((0, _parsers.pstring)('marco'));
      var parsing = oneOrMoreParser.run('xmarcomarcociao');
      (0, _chai.expect)(parsing.isFailure).to.be.true;
      (0, _chai.expect)(parsing.toString()).to.be.eql('Validation.Failure([many1 pstring marco,wanted m; got x,row=0;col=0;rest=xmarcomarcociao])');
    });
    it('can parse a char sequence many times (oneOrMoreParser = many1(pstring(\'marco\')))', function () {
      var oneOrMoreParser = (0, _parsers.many1)((0, _parsers.pstring)('marco'));
      var parsing = oneOrMoreParser.run('marcomarcociao');
      (0, _chai.expect)(parsing.isSuccess).to.be.true;
      (0, _chai.expect)(parsing.toString()).to.be.eql('Validation.Success([[[m,a,r,c,o],[m,a,r,c,o]],row=0;col=10;rest=ciao])');
    });
    it('can parse an integer, no matter how large... (pint = many1(anyOf(digits)))', function () {
      var pint = (0, _parsers.many1)((0, _parsers.anyOf)(digits));
      var parsing = pint.run('12345A');
      (0, _chai.expect)(parsing.isSuccess).to.be.true;
      (0, _chai.expect)(parsing.toString()).to.be.eql('Validation.Success([[1,2,3,4,5],row=0;col=5;rest=A])');
      parsing = pint.run('1B');
      (0, _chai.expect)(parsing.isSuccess).to.be.true;
      (0, _chai.expect)(parsing.toString()).to.be.eql('Validation.Success([[1],row=0;col=1;rest=B])');
      parsing = pint.run('A12345');
      (0, _chai.expect)(parsing.isFailure).to.be.true;
      (0, _chai.expect)(parsing.toString()).to.be.eql('Validation.Failure([many1 anyOf 0123456789,fail,A12345])');
    });
    it('can parse an integer into a true integer (pint = many1(anyOf(digits)))', function () {
      var pint = (0, _parsers.many1)((0, _parsers.anyOf)(digits)).fmap(function (l) {
        return parseInt(l.reduce(function (acc, curr) {
          return acc + curr;
        }, ''), 10);
      });
      var parsing = pint.run('12345A');
      (0, _chai.expect)(parsing.isSuccess).to.be.true;
      (0, _chai.expect)(parsing.value[0]).to.be.eql(12345);
      (0, _chai.expect)(parsing.value[1].toString()).to.be.eql('row=0;col=5;rest=A');
    });
  });

  describe('parsers that consider precedences (precededByP, notPrecededByP, followedByP, notFollowedByP)', function () {
    describe('can parse X preceded by Y (XafterY = precededByP(\'Y\', \'X\'))', function () {
      var XafterY = (0, _parsers.precededByP)('Y', 'X');
      it('even if Y has been consumed by the parser before', function () {
        var YXp = (0, _parsers.many1)((0, _parsers.choice)([(0, _parsers.pchar)('Y'), XafterY]));
        var parsingYX = YXp.run(text('YX'));
        (0, _chai.expect)(parsingYX.isSuccess).to.be.true;
        (0, _chai.expect)(parsingYX.toString()).to.be.eql('Validation.Success([[Y,X],row=1;col=0;rest=])');
      });
      it('and halt when X is not preceded by Y (AXp = many1(choice([pchar(\'A\'), XafterY])))', function () {
        var AXp = (0, _parsers.many1)((0, _parsers.choice)([(0, _parsers.pchar)('A'), XafterY]));
        var parsingAX = AXp.run(text('AX'));
        (0, _chai.expect)(parsingAX.isSuccess).to.be.true;
        (0, _chai.expect)(parsingAX.value[1].rest()).to.be.eql('X');
      });
      it('and fail when X is at the start of the string (AXp = many1(choice([pchar(\'A\'), XafterY])))', function () {
        var AXp = (0, _parsers.many1)((0, _parsers.choice)([(0, _parsers.pchar)('A'), XafterY]));
        var parsingAX = AXp.run(text('XA'));
        (0, _chai.expect)(parsingAX.isFailure).to.be.true;
      });
    });

    describe('can parse X not preceded by Y (XnotAfterY = notPrecededByP(\'Y\', \'X\'))', function () {
      var XnotAfterY = (0, _parsers.notPrecededByP)('Y', 'X');

      it('even if the previous char has been consumed by the parser before (AXp = many1(choice([pchar(\'A\'), XnotAfterY])))', function () {
        var AXp = (0, _parsers.many1)((0, _parsers.choice)([(0, _parsers.pchar)('A'), XnotAfterY]));
        var parsingAX = AXp.run(text('AX'));
        (0, _chai.expect)(parsingAX.isSuccess).to.be.true;
        (0, _chai.expect)(parsingAX.toString()).to.be.eql('Validation.Success([[A,X],row=1;col=0;rest=])');
      });
      it('and halt when X is the first char in the string (AXp = many1(choice([pchar(\'A\'), XnotAfterY])))', function () {
        var AXp = (0, _parsers.many1)((0, _parsers.choice)([(0, _parsers.pchar)('A'), XnotAfterY]));
        var parsingAX = AXp.run(text('XA'));
        (0, _chai.expect)(parsingAX.isSuccess).to.be.true;
        (0, _chai.expect)(parsingAX.toString()).to.be.eql('Validation.Success([[X,A],row=1;col=0;rest=])');
      });
      it('and halt when X is preceded by Y (YXp = many1(choice([pchar(\'Y\'), XnotAfterY])))', function () {
        var YXp = (0, _parsers.many1)((0, _parsers.choice)([(0, _parsers.pchar)('Y'), XnotAfterY]));
        var parsingYX = YXp.run(text('YX'));
        (0, _chai.expect)(parsingYX.isSuccess).to.be.true;
        (0, _chai.expect)(parsingYX.value[1].rest()).to.be.eql('X');
      });
    });

    describe('can parse X followed by Y (XbeforeY = followedByP(\'Y\', \'X\'))', function () {
      var XbeforeY = (0, _parsers.followedByP)('Y', 'X');
      it('without consuming the character', function () {
        var XYp = (0, _parsers.many1)((0, _parsers.choice)([XbeforeY, (0, _parsers.pchar)('Y')]));
        var parsingXY = XYp.run(text('XY'));
        (0, _chai.expect)(parsingXY.isSuccess).to.be.true;
        (0, _chai.expect)(parsingXY.toString()).to.be.eql('Validation.Success([[X,Y],row=1;col=0;rest=])');
      });
      it('and fail when X is not followed by Y (XAp = many1(choice([XbeforeY, pchar(\'A\')])))', function () {
        var XAp = (0, _parsers.many1)((0, _parsers.choice)([XbeforeY, (0, _parsers.pchar)('A')]));
        var parsingXA = XAp.run(text('XA'));
        (0, _chai.expect)(parsingXA.isFailure).to.be.true;
        // expect(parsingXA.value[1].rest()).to.be.eql('X');
      });
      it('and fail when X is at the end of the string (AXp = many1(choice([pchar(\'A\'), XbeforeY])))', function () {
        var AXp = (0, _parsers.many1)((0, _parsers.choice)([(0, _parsers.pchar)('A'), XbeforeY]));
        var parsingAX = AXp.run(text('AX'));
        (0, _chai.expect)(parsingAX.isSuccess).to.be.true;
        (0, _chai.expect)(parsingAX.value[1].rest()).to.be.eql('X');
      });
    });

    describe('can parse X not followed by Y (XnotBeforeY = notFollowedByP(\'Y\', \'X\'))', function () {
      var XnotBeforeY = (0, _parsers.notFollowedByP)('Y', 'X');

      it('without consuming the character (XAp = many1(choice([XnotBeforeY, pchar(\'A\')])))', function () {
        var XAp = (0, _parsers.many1)((0, _parsers.choice)([XnotBeforeY, (0, _parsers.pchar)('A')]));
        var parsingXA = XAp.run(text('XA'));
        (0, _chai.expect)(parsingXA.isSuccess).to.be.true;
        (0, _chai.expect)(parsingXA.toString()).to.be.eql('Validation.Success([[X,A],row=1;col=0;rest=])');
      });
      it('and succeed when X is the last char in the string (AXp = many1(choice([pchar(\'A\'), XnotBeforeY])))', function () {
        var AXp = (0, _parsers.many1)((0, _parsers.choice)([(0, _parsers.pchar)('A'), XnotBeforeY]));
        var parsingAX = AXp.run(text('AX'));
        (0, _chai.expect)(parsingAX.isSuccess).to.be.true;
        (0, _chai.expect)(parsingAX.toString()).to.be.eql('Validation.Success([[A,X],row=1;col=0;rest=])');
      });
      it('and halt when X is followed by Y (AXYp = many1(choice([pchar(\'A\'), XnotBeforeY])))', function () {
        var AXYp = (0, _parsers.many1)((0, _parsers.choice)([(0, _parsers.pchar)('A'), XnotBeforeY]));
        var parsingAXY = AXYp.run(text('AXY'));
        (0, _chai.expect)(parsingAXY.isSuccess).to.be.true;
        (0, _chai.expect)(parsingAXY.value[1].rest()).to.be.eql('XY');
      });
    });
  });

  describe('a parser for optional characters (opt)', function () {
    it('can capture or not capture a dot (optDotThenA = opt(pchar(\'.\')).andThen(pchar(\'a\')))', function () {
      var optDotThenA = (0, _parsers.opt)((0, _parsers.pchar)('.')).andThen((0, _parsers.pchar)('a'));
      (0, _chai.expect)(optDotThenA.run('.abc').toString()).to.be.eql('Validation.Success([[Maybe.Just(.),a],row=0;col=2;rest=bc])');
      (0, _chai.expect)(optDotThenA.run('abc').toString()).to.be.eql('Validation.Success([[Maybe.Nothing,a],row=0;col=1;rest=bc])');
    });
    it('can capture a dot or provide a default alternative (optDotWithDefaultThenA = opt(pchar(\'.\'), \'ALTERNATIVE\').andThen(pchar(\'a\')))', function () {
      var optDotWithDefaultThenA = (0, _parsers.opt)((0, _parsers.pchar)('.'), 'ALTERNATIVE').andThen((0, _parsers.pchar)('a'));
      (0, _chai.expect)(optDotWithDefaultThenA.run('abc').toString()).to.be.eql('Validation.Success([[Maybe.Just(ALTERNATIVE),a],row=0;col=1;rest=bc])');
    });
    it('can parse SIGNED integers!!! (CHECK THIS OUT!!)', function () {
      var pint = (0, _parsers.many1)((0, _parsers.anyOf)(digits)).fmap(function (l) {
        return parseInt(l.reduce(function (acc, curr) {
          return acc + curr;
        }, ''), 10);
      });
      var pSignedInt = (0, _parsers.opt)((0, _parsers.pchar)('-')).andThen(pint).fmap(function (optSignNumberPair) {
        return optSignNumberPair[0].isJust ? -optSignNumberPair[1] : optSignNumberPair[1];
      });
      (0, _chai.expect)(pSignedInt.run('13243546x').value[0]).to.be.eql(13243546);
      (0, _chai.expect)(pSignedInt.run('-13243546x').value[0]).to.be.eql(-13243546);
    });
    it('can capture or not capture a whole substring (optSubstring = opt(pstring(\'marco\')).andThen(pstring(\'faustinelli\')))', function () {
      var optSubstring = (0, _parsers.opt)((0, _parsers.pstring)('marco')).andThen((0, _parsers.pstring)('faustinelli'));
      (0, _chai.expect)(optSubstring.run('marcofaustinellix').toString()).to.be.eql('Validation.Success([[Maybe.Just([m,a,r,c,o]),[f,a,u,s,t,i,n,e,l,l,i]],row=0;col=16;rest=x])');
      (0, _chai.expect)(optSubstring.run('faustinellix').toString()).to.be.eql('Validation.Success([[Maybe.Nothing,[f,a,u,s,t,i,n,e,l,l,i]],row=0;col=11;rest=x])');
    });
  });

  describe('a couple of result-discarding parsers (discardFirst, discardSecond)', function () {
    it('can decide to discard the matches of the first one (discardIntegerSign = pchar(\'-\').discardFirst(pdigit(8)))', function () {
      var discardIntegerSign = (0, _parsers.pchar)('-').discardFirst((0, _parsers.pdigit)(8));
      var parsing = discardIntegerSign.run('-8x');
      (0, _chai.expect)(parsing.toString()).to.be.eql('Validation.Success([8,row=0;col=2;rest=x])');
    });
    it('can decide to discard the matches of the second one (discardSuffix = pstring(\'marco\').discardSecond(many1(anyOf(whites))))', function () {
      var discardSuffix = (0, _parsers.pstring)('marco').discardSecond((0, _parsers.many1)((0, _parsers.anyOf)(whites)));
      var parsing = discardSuffix.run('marco faustinelli');
      (0, _chai.expect)(parsing.toString()).to.be.eql('Validation.Success([[m,a,r,c,o],row=0;col=6;rest=faustinelli])');
      parsing = discardSuffix.run('marco                                faustinelli');
      (0, _chai.expect)(parsing.toString()).to.be.eql('Validation.Success([[m,a,r,c,o],row=0;col=37;rest=faustinelli])');
    });
  });

  describe('a tapper for parsers (tapP)', function () {
    it('can do things with a result that\'s going to be discarded', function () {
      var tapIntoDiscardIntegerSign = (0, _parsers.tapP)((0, _parsers.pchar)('-'), function (res) {
        (0, _chai.expect)(res).to.be.eql('-');
      }).discardFirst((0, _parsers.pdigit)(8));
      // eslint-disable-next-line no-unused-vars
      var parsing = tapIntoDiscardIntegerSign.run('-8x');
    });
  });

  describe('a logger for parsers (logP)', function () {
    var storedLog = console.log;
    it('can log intermediate parsing results', function () {
      console.log = function (msg) {
        (0, _chai.expect)(msg).to.be.eql('pchar_-:-');
      };
      var logIntermediateResult = (0, _parsers.logP)((0, _parsers.pchar)('-')).discardFirst((0, _parsers.pdigit)(8));
      var parsing = logIntermediateResult.run('-8x');
      (0, _chai.expect)(parsing.toString()).to.be.eql('Validation.Success([8,row=0;col=2;rest=x])');
    });
    it('can log a result that\'s going to be discarded', function () {
      console.log = function (msg) {
        (0, _chai.expect)(msg).to.be.eql('many1 anyOf  \t\n\r:[ , ]');
      };
      var discardSuffix = (0, _parsers.pstring)('marco').discardSecond((0, _parsers.logP)((0, _parsers.many1)((0, _parsers.anyOf)(whites))));
      var parsing = discardSuffix.run('marco  faustinelli');
      (0, _chai.expect)(parsing.toString()).to.be.eql('Validation.Success([[m,a,r,c,o],row=0;col=7;rest=faustinelli])');
    });
    console.log = storedLog;
  });

  describe('parsing while discarding input (ADVANCED STUFF)', function () {
    it('allows to exclude parentheses', function () {
      var insideParens = (0, _parsers.pchar)('(').discardFirst((0, _parsers.many)((0, _parsers.anyOf)(lowercases))).discardSecond((0, _parsers.pchar)(')'));
      (0, _chai.expect)(insideParens.run('(marco)').toString()).to.be.eql('Validation.Success([[m,a,r,c,o],row=1;col=0;rest=])');
      (0, _chai.expect)(insideParens.run('()').toString()).to.be.eql('Validation.Success([[],row=1;col=0;rest=])');
    });
    it('...even using a tailor-made method \'betweenParens\' (insideParens = betweenParens(pstring(\'marco\')))', function () {
      var insideParens = (0, _parsers.betweenParens)((0, _parsers.pstring)('marco'));
      (0, _chai.expect)(insideParens.run('(marco)').toString()).to.be.eql('Validation.Success([[m,a,r,c,o],row=1;col=0;rest=])');
    });
    it('cherry-picking elements separated by separators (substringsWithCommas = many(many1(anyOf(lowercases)).discardSecond(pchar(\',\'))))', function () {
      var substringsWithCommas = (0, _parsers.many)((0, _parsers.many1)((0, _parsers.anyOf)(lowercases)).discardSecond((0, _parsers.pchar)(',')));
      (0, _chai.expect)(substringsWithCommas.run('a,b,cd,1').toString()).to.be.eql('Validation.Success([[[a],[b],[c,d]],row=0;col=7;rest=1])');
    });
    it('...also when inside a lists', function () {
      var substringsWithCommas = (0, _parsers.many)((0, _parsers.many1)((0, _parsers.anyOf)(lowercases)).discardSecond((0, _parsers.pchar)(',')));
      var listElements = (0, _parsers.between)((0, _parsers.pchar)('['), substringsWithCommas, (0, _parsers.pchar)(']'));
      (0, _chai.expect)(listElements.run('[a,b,cd,marco,]1').toString()).to.be.eql('Validation.Success([[[a],[b],[c,d],[m,a,r,c,o]],row=0;col=15;rest=1])');
    });
    describe('thanks to the specific sepBy1 operator (introduction to JSON parsers)', function () {
      var valuesP = (0, _parsers.anyOf)(lowercases);
      var commaP = (0, _parsers.pchar)(',');
      it('cherry-picking elements separated by separators', function () {
        (0, _chai.expect)((0, _parsers.sepBy1)(valuesP, commaP).run('a,b,cd,1').toString()).to.be.eql('Validation.Success([[[a],[b],[c,d]],row=0;col=7;rest=1])');
      });
      it('...also when inside a lists', function () {
        var listElements = (0, _parsers.between)((0, _parsers.pchar)('['), (0, _parsers.sepBy1)(valuesP, commaP), (0, _parsers.pchar)(']'));
        (0, _chai.expect)(listElements.run('[a,b,cd,marco,]').toString()).to.be.eql('Validation.Success([[[a],[b],[c,d],[m,a,r,c,o]],row=1;col=0;rest=])');
      });
      it('...lists with no elements', function () {
        var listElements = (0, _parsers.between)((0, _parsers.pchar)('['), (0, _parsers.sepBy1)(valuesP, commaP), (0, _parsers.pchar)(']'));
        (0, _chai.expect)(listElements.run('[]').toString()).to.be.eql('Validation.Success([[],row=1;col=0;rest=])');
      });
      it('...lists with just one element', function () {
        var listElements = (0, _parsers.between)((0, _parsers.pchar)('['), (0, _parsers.sepBy1)(valuesP, commaP), (0, _parsers.pchar)(']'));
        (0, _chai.expect)(listElements.run('[a]').toString()).to.be.eql('Validation.Success([[[a]],row=1;col=0;rest=])');
      });
    });
  });
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2pzLXNwZWMvcGFyc2Vyc190ZXN0cy5qcyJdLCJuYW1lcyI6WyJsb3dlcmNhc2VzIiwidXBwZXJjYXNlcyIsImRpZ2l0cyIsIndoaXRlcyIsInRleHQiLCJQb3NpdGlvbiIsImZyb21UZXh0IiwiZGVzY3JpYmUiLCJwYXJzZXJBIiwiaXQiLCJwYXJzaW5nQSIsInZhbHVlIiwidG8iLCJiZSIsImVxbCIsInJlc3QiLCJpc1N1Y2Nlc3MiLCJ0cnVlIiwicGFyc2luZ0IiLCJpc0ZhaWx1cmUiLCJwYXJzZXIxIiwicGFyc2luZzEiLCJwYXJzaW5nMiIsInBhcnNpbmczIiwicnVuIiwibWFwcGluZ1BhcnNlciIsIngiLCJ0b1VwcGVyQ2FzZSIsIm1hcHBlZFBhcnNpbmdBIiwiZm1hcCIsInBhcnNlckFhbmRCIiwicGFyc2luZ0FhbmRCIiwidG9TdHJpbmciLCJwYXJzZXJBb3JCIiwicGFyc2luZ0FvckIiLCJwYWlyQWRkZXIiLCJ5IiwiYWJjUCIsInBhcnNpbmciLCJhbmRUaGVuIiwicGFyc2VEaWdpdCIsInRocmVlRGlnaXRzIiwiYmVmb3JlIiwidW5wYWNrZXIiLCJ6IiwidGhyZWVEaWdpdHNJbXBsIiwidGhyZWVEaWdpdHNJbnN0IiwicGFyc2Vyc0Nob2ljZSIsInBhcnNpbmdDaG9pY2UiLCJsb3dlcmNhc2VzUGFyc2VyIiwidXBwZXJjYXNlc1BhcnNlciIsImRpZ2l0c1BhcnNlciIsImFkZFN0cmluZ3MiLCJBcGx1c0IiLCJhZGREaWdpdHMiLCJhZGRQYXJzZXIiLCJhYmNQYXJzZXIiLCJtYXBwZWRBYmNQYXJzZXIiLCJhIiwiam9pbiIsIm1hcmNvUGFyc2VyIiwibWFyY29QYXJzaW5nIiwid2hhdGV2ZXIiLCJzdWNjZWVkUCIsImZhaWxQIiwic3RhcnRPZklucHV0UCIsImxhdGVySW5UaGVTdHJlYW0iLCJzdGFydEFCQyIsIm5vdFN0YXJ0T2ZJbnB1dFAiLCJBQk5vdFN0YXJ0QyIsImZpbmFsbHlJblRoZVN0cmVhbSIsImVuZE9mSW5wdXRQIiwibm90RmluYWxseUluVGhlU3RyZWFtIiwibm90RW5kT2ZJbnB1dFAiLCJBQm5vdEVuZEMiLCJtYXAiLCJsb2dQIiwiQW5vdEVuZEIiLCJ0cmltbWVyIiwiemVyb09yTW9yZVBhcnNpbmdGdW5jdGlvbiIsInplcm9Pck1vcmVQYXJzZXIiLCJleGFjdGx5VGhyZWUiLCJ3aGl0ZXNQYXJzZXIiLCJ0d29Xb3JkcyIsIm9uZU9yTW9yZVBhcnNlciIsInBpbnQiLCJwYXJzZUludCIsImwiLCJyZWR1Y2UiLCJhY2MiLCJjdXJyIiwiWGFmdGVyWSIsIllYcCIsInBhcnNpbmdZWCIsIkFYcCIsInBhcnNpbmdBWCIsIlhub3RBZnRlclkiLCJYYmVmb3JlWSIsIlhZcCIsInBhcnNpbmdYWSIsIlhBcCIsInBhcnNpbmdYQSIsIlhub3RCZWZvcmVZIiwiQVhZcCIsInBhcnNpbmdBWFkiLCJvcHREb3RUaGVuQSIsIm9wdERvdFdpdGhEZWZhdWx0VGhlbkEiLCJwU2lnbmVkSW50Iiwib3B0U2lnbk51bWJlclBhaXIiLCJpc0p1c3QiLCJvcHRTdWJzdHJpbmciLCJkaXNjYXJkSW50ZWdlclNpZ24iLCJkaXNjYXJkRmlyc3QiLCJkaXNjYXJkU3VmZml4IiwiZGlzY2FyZFNlY29uZCIsInRhcEludG9EaXNjYXJkSW50ZWdlclNpZ24iLCJyZXMiLCJzdG9yZWRMb2ciLCJjb25zb2xlIiwibG9nIiwibXNnIiwibG9nSW50ZXJtZWRpYXRlUmVzdWx0IiwiaW5zaWRlUGFyZW5zIiwic3Vic3RyaW5nc1dpdGhDb21tYXMiLCJsaXN0RWxlbWVudHMiLCJ2YWx1ZXNQIiwiY29tbWFQIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQXlEQSxNQUFNQSxhQUFhLENBQUMsR0FBRCxFQUFNLEdBQU4sRUFBVyxHQUFYLEVBQWdCLEdBQWhCLEVBQXFCLEdBQXJCLEVBQTBCLEdBQTFCLEVBQStCLEdBQS9CLEVBQW9DLEdBQXBDLEVBQXlDLEdBQXpDLEVBQThDLEdBQTlDLEVBQW1ELEdBQW5ELEVB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N0MsQ0FBckI7QUFDQSwwQkFBT0YsYUFBYXBHLEdBQWIsQ0FBaUIsSUFBakIsRUFBdUJRLFFBQXZCLEVBQVAsRUFDR3BCLEVBREgsQ0FDTUMsRUFETixDQUNTQyxHQURULENBQ2EsNENBRGI7QUFFRCxPQUpEO0FBS0FMLFNBQUcsZ0NBQUgsRUFBcUMsWUFBTTtBQUN6QyxZQUFNbUgsZUFBZSxzQkFBUSxvQkFBTSxHQUFOLENBQVIsRUFBb0IscUJBQU9DLE9BQVAsRUFBZ0JDLE1BQWhCLENBQXBCLEVBQTZDLG9CQUFNLEdBQU4sQ0FBN0MsQ0FBckI7QUFDQSwwQkFBT0YsYUFBYXBHLEdBQWIsQ0FBaUIsS0FBakIsRUFBd0JRLFFBQXhCLEVBQVAsRUFDR3BCLEVBREgsQ0FDTUMsRUFETixDQUNTQyxHQURULENBQ2EsK0NBRGI7QUFFRCxPQUpEO0FBS0QsS0F0QkQ7QUF1QkQsR0FqREQiLCJmaWxlIjoicGFyc2Vyc190ZXN0cy5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGV4cGVjdCB9IGZyb20gJ2NoYWknO1xyXG5pbXBvcnQge1xyXG4gIGNoYXJQYXJzZXIsXHJcbiAgZGlnaXRQYXJzZXIsXHJcbiAgcGNoYXIsXHJcbiAgcGRpZ2l0LFxyXG4gIGFuZFRoZW4sXHJcbiAgb3JFbHNlLFxyXG4gIGNob2ljZSxcclxuICBhbnlPZixcclxuICBmbWFwLFxyXG4gIHJldHVyblAsXHJcbiAgYXBwbHlQLFxyXG4gIGxpZnQyLFxyXG4gIHNlcXVlbmNlUCxcclxuICBzZXF1ZW5jZVAyLFxyXG4gIHBzdHJpbmcsXHJcbiAgc3RyaW5nUCxcclxuICB6ZXJvT3JNb3JlLFxyXG4gIG1hbnksXHJcbiAgbWFueTEsXHJcbiAgbWFueUNoYXJzLFxyXG4gIG1hbnlDaGFyczEsXHJcbiAgb3B0LFxyXG4gIG9wdEJvb2ssXHJcbiAgZGlzY2FyZEZpcnN0LFxyXG4gIGRpc2NhcmRTZWNvbmQsXHJcbiAgc2VwQnkxLFxyXG4gIGJldHdlZW4sXHJcbiAgYmV0d2VlblBhcmVucyxcclxuICB0YXBQLFxyXG4gIGxvZ1AsXHJcbiAgcHdvcmQsXHJcbiAgdHJpbVAsXHJcbiAgcHJlY2VkZWRCeVAsXHJcbiAgbm90UHJlY2VkZWRCeVAsXHJcbiAgZm9sbG93ZWRCeVAsXHJcbiAgbm90Rm9sbG93ZWRCeVAsXHJcbiAgc3RhcnRPZklucHV0UCxcclxuICBub3RTdGFydE9mSW5wdXRQLFxyXG4gIGVuZE9mSW5wdXRQLFxyXG4gIG5vdEVuZE9mSW5wdXRQLFxyXG4gIHN1Y2NlZWRQLFxyXG4gIGZhaWxQLFxyXG59IGZyb20gJ3BhcnNlcnMnO1xyXG5pbXBvcnQge1xyXG4gIGlzUGFpcixcclxuICBpc1N1Y2Nlc3MsXHJcbiAgaXNGYWlsdXJlLFxyXG4gIGlzUGFyc2VyLFxyXG4gIGlzU29tZSxcclxuICBpc05vbmUsXHJcbn0gZnJvbSAndXRpbCc7XHJcbmltcG9ydCB7IE1heWJlIH0gZnJvbSAnbWF5YmUnO1xyXG5pbXBvcnQgeyBWYWxpZGF0aW9uIH0gZnJvbSAndmFsaWRhdGlvbic7XHJcbmltcG9ydCB7IFBvc2l0aW9uIH0gZnJvbSAnY2xhc3Nlcyc7XHJcblxyXG5jb25zdCBsb3dlcmNhc2VzID0gWydhJywgJ2InLCAnYycsICdkJywgJ2UnLCAnZicsICdnJywgJ2gnLCAnaScsICdqJywgJ2snLCAnbCcsICdtJywgJ24nLCAnbycsICdwJywgJ3EnLCAncicsICdzJywgJ3QnLCAndScsICd2JywgJ3cnLCAneCcsICd5JywgJ3onXTtcclxuY29uc3QgdXBwZXJjYXNlcyA9IFsnQScsICdCJywgJ0MnLCAnRCcsICdFJywgJ0YnLCAnRycsICdIJywgJ0knLCAnSicsICdLJywgJ0wnLCAnTScsICdOJywgJ08nLCAnUCcsICdRJywgJ1InLCAnUycsICdUJywgJ1UnLCAnVicsICdXJywgJ1gnLCAnWScsICdaJ107XHJcbmNvbnN0IGRpZ2l0cyA9IFsnMCcsICcxJywgJzInLCAnMycsICc0JywgJzUnLCAnNicsICc3JywgJzgnLCAnOSddO1xyXG5jb25zdCB3aGl0ZXMgPSBbJyAnLCAnXFx0JywgJ1xcbicsICdcXHInXTtcclxuY29uc3QgdGV4dCA9IFBvc2l0aW9uLmZyb21UZXh0O1xyXG5cclxuZGVzY3JpYmUoJ2EgYmFzaWMgcGFyc2VyIGZvciBzaW5nbGUgY2hhcnMgKHBhcnNlckEgPSBjaGFyUGFyc2VyKFxcJ2FcXCcpKScsICgpID0+IHtcclxuICBjb25zdCBwYXJzZXJBID0gY2hhclBhcnNlcignYScpO1xyXG5cclxuICBpdCgnY2FuIHBhcnNlIGEgc2luZ2xlIGNoYXInLCAoKSA9PiB7XHJcbiAgICBjb25zdCBwYXJzaW5nQSA9IHBhcnNlckEodGV4dCgnYWJjJykpO1xyXG4gICAgZXhwZWN0KHBhcnNpbmdBLnZhbHVlWzBdKS50by5iZS5lcWwoJ2EnKTtcclxuICAgIGV4cGVjdChwYXJzaW5nQS52YWx1ZVsxXS5yZXN0KCkpLnRvLmJlLmVxbCgnYmMnKTtcclxuICAgIGV4cGVjdChwYXJzaW5nQS5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XHJcbiAgfSk7XHJcblxyXG4gIGl0KCdjYW4gYWxzbyBOT1QgcGFyc2UgYSBzaW5nbGUgY2hhcicsICgpID0+IHtcclxuICAgIGNvbnN0IHBhcnNpbmdCID0gcGFyc2VyQSh0ZXh0KCdiY2QnKSk7XHJcbiAgICBleHBlY3QocGFyc2luZ0IudmFsdWVbMF0pLnRvLmJlLmVxbCgnY2hhclBhcnNlcicpO1xyXG4gICAgZXhwZWN0KHBhcnNpbmdCLnZhbHVlWzFdKS50by5iZS5lcWwoJ3dhbnRlZCBhOyBnb3QgYicpO1xyXG4gICAgZXhwZWN0KHBhcnNpbmdCLnZhbHVlWzJdLnJlc3QoKSkudG8uYmUuZXFsKCdiY2QnKTtcclxuICAgIGV4cGVjdChwYXJzaW5nQi5pc0ZhaWx1cmUpLnRvLmJlLnRydWU7XHJcbiAgfSk7XHJcblxyXG4gIGl0KCdmYWlscyBhdCB0aGUgZW5kIG9mIHRoZSBzdHJlYW0nLCAoKSA9PiB7XHJcbiAgICBjb25zdCBwYXJzaW5nQSA9IHBhcnNlckEodGV4dCgnJykpO1xyXG4gICAgZXhwZWN0KHBhcnNpbmdBLnZhbHVlWzBdKS50by5iZS5lcWwoJ2NoYXJQYXJzZXInKTtcclxuICAgIGV4cGVjdChwYXJzaW5nQS52YWx1ZVsxXSkudG8uYmUuZXFsKCdubyBtb3JlIGlucHV0Jyk7XHJcbiAgICBleHBlY3QocGFyc2luZ0EudmFsdWVbMl0ucmVzdCgpKS50by5iZS5lcWwoJycpO1xyXG4gICAgZXhwZWN0KHBhcnNpbmdBLmlzRmFpbHVyZSkudG8uYmUudHJ1ZTtcclxuICB9KTtcclxufSk7XHJcblxyXG5kZXNjcmliZSgnYSBiYXNpYyBwYXJzZXIgZm9yIHNpbmdsZSBTVFJJTkdJRklFRCBkaWdpdHMgKHBhcnNlcjEgPSBkaWdpdFBhcnNlcigxKSknLCAoKSA9PiB7XHJcbiAgY29uc3QgcGFyc2VyMSA9IGRpZ2l0UGFyc2VyKDEpO1xyXG4gIGl0KCdjYW4gcGFyc2UgYSBzaW5nbGUgZGlnaXQnLCAoKSA9PiB7XHJcbiAgICBjb25zdCBwYXJzaW5nMSA9IHBhcnNlcjEodGV4dCgnMTIzJykpO1xyXG4gICAgZXhwZWN0KHBhcnNpbmcxLnZhbHVlWzBdKS50by5iZS5lcWwoMSk7XHJcbiAgICBleHBlY3QocGFyc2luZzEudmFsdWVbMV0ucmVzdCgpKS50by5iZS5lcWwoJzIzJyk7XHJcbiAgICBleHBlY3QocGFyc2luZzEuaXNTdWNjZXNzKS50by5iZS50cnVlO1xyXG4gIH0pO1xyXG5cclxuICBpdCgnY2FuIGFsc28gTk9UIHBhcnNlIGEgc2luZ2xlIGRpZ2l0JywgKCkgPT4ge1xyXG4gICAgY29uc3QgcGFyc2luZzIgPSBwYXJzZXIxKHRleHQoJzIzNCcpKTtcclxuICAgIGV4cGVjdChwYXJzaW5nMi52YWx1ZVswXSkudG8uYmUuZXFsKCdkaWdpdFBhcnNlcicpO1xyXG4gICAgZXhwZWN0KHBhcnNpbmcyLnZhbHVlWzFdKS50by5iZS5lcWwoJ3dhbnRlZCAxOyBnb3QgMicpO1xyXG4gICAgZXhwZWN0KHBhcnNpbmcyLnZhbHVlWzJdLnJlc3QoKSkudG8uYmUuZXFsKCcyMzQnKTtcclxuICAgIGV4cGVjdChwYXJzaW5nMi5pc0ZhaWx1cmUpLnRvLmJlLnRydWU7XHJcbiAgfSk7XHJcblxyXG4gIGl0KCdmYWlscyBhdCB0aGUgZW5kIG9mIHRoZSBzdHJlYW0gYWxzbyB3aGVuIGh1bnRpbmcgZm9yIGRpZ2l0cycsICgpID0+IHtcclxuICAgIGNvbnN0IHBhcnNpbmczID0gcGFyc2VyMSh0ZXh0KCcnKSk7XHJcbiAgICBleHBlY3QocGFyc2luZzMudmFsdWVbMF0pLnRvLmJlLmVxbCgnZGlnaXRQYXJzZXInKTtcclxuICAgIGV4cGVjdChwYXJzaW5nMy52YWx1ZVsxXSkudG8uYmUuZXFsKCdubyBtb3JlIGlucHV0Jyk7XHJcbiAgICBleHBlY3QocGFyc2luZzMudmFsdWVbMl0ucmVzdCgpKS50by5iZS5lcWwoJycpO1xyXG4gICAgZXhwZWN0KHBhcnNpbmczLmlzRmFpbHVyZSkudG8uYmUudHJ1ZTtcclxuICB9KTtcclxufSk7XHJcblxyXG5kZXNjcmliZSgnYSBuYW1lZCBjaGFyYWN0ZXIgcGFyc2VyIChwYXJzZXJBID0gcGNoYXIoXFwnYVxcJykpJywgKCkgPT4ge1xyXG4gIGNvbnN0IHBhcnNlckEgPSBwY2hhcignYScpO1xyXG5cclxuICBpdCgnY2FuIHBhcnNlIGEgc2luZ2xlIGNoYXInLCAoKSA9PiB7XHJcbiAgICBleHBlY3QoaXNQYXJzZXIocGFyc2VyQSkpLnRvLmJlLnRydWU7XHJcbiAgICBjb25zdCBwYXJzaW5nQSA9IHBhcnNlckEucnVuKHRleHQoJ2FiYycpKTtcclxuICAgIGV4cGVjdChwYXJzaW5nQS52YWx1ZVswXSkudG8uYmUuZXFsKCdhJyk7XHJcbiAgICBleHBlY3QocGFyc2luZ0EudmFsdWVbMV0ucmVzdCgpKS50by5iZS5lcWwoJ2JjJyk7XHJcbiAgICBleHBlY3QocGFyc2luZ0EuaXNTdWNjZXNzKS50by5iZS50cnVlO1xyXG4gIH0pO1xyXG5cclxuICBpdCgnY2FuIGFsc28gTk9UIHBhcnNlIGEgc2luZ2xlIGNoYXInLCAoKSA9PiB7XHJcbiAgICBjb25zdCBwYXJzaW5nQiA9IHBhcnNlckEucnVuKHRleHQoJ2JjZCcpKTtcclxuICAgIGV4cGVjdChwYXJzaW5nQi52YWx1ZVswXSkudG8uYmUuZXFsKCdwY2hhcl9hJyk7XHJcbiAgICBleHBlY3QocGFyc2luZ0IudmFsdWVbMV0pLnRvLmJlLmVxbCgnd2FudGVkIGE7IGdvdCBiJyk7XHJcbiAgICBleHBlY3QocGFyc2luZ0IuaXNGYWlsdXJlKS50by5iZS50cnVlO1xyXG4gIH0pO1xyXG59KTtcclxuXHJcbmRlc2NyaWJlKCd0aGUgbWFwcGluZyBwYXJzZXIgZm1hcCcsICgpID0+IHtcclxuICBkZXNjcmliZSgnZGVmaW5lZCBhcyBmdW5jdGlvbiAoZm1hcCh4ID0+IHgudG9VcHBlckNhc2UoKSwgcGNoYXIoXFwnYVxcJykpKScsICgpID0+IHtcclxuICAgIGNvbnN0IG1hcHBpbmdQYXJzZXIgPSBmbWFwKHggPT4geC50b1VwcGVyQ2FzZSgpLCBwY2hhcignYScpKTtcclxuICAgIGl0KCdzaGFsbCBtYXAgdGhlIG91dHB1dCBvZiBhbm90aGVyIHBhcnNlcicsICgpID0+IHtcclxuICAgICAgZXhwZWN0KGlzUGFyc2VyKG1hcHBpbmdQYXJzZXIpKS50by5iZS50cnVlO1xyXG4gICAgICBjb25zdCBtYXBwZWRQYXJzaW5nQSA9IG1hcHBpbmdQYXJzZXIucnVuKHRleHQoJ2FiYycpKTtcclxuICAgICAgZXhwZWN0KG1hcHBlZFBhcnNpbmdBLnZhbHVlWzBdKS50by5iZS5lcWwoJ0EnKTtcclxuICAgICAgZXhwZWN0KG1hcHBlZFBhcnNpbmdBLnZhbHVlWzFdLnJlc3QoKSkudG8uYmUuZXFsKCdiYycpO1xyXG4gICAgICBleHBlY3QobWFwcGVkUGFyc2luZ0EuaXNTdWNjZXNzKS50by5iZS50cnVlO1xyXG4gICAgfSk7XHJcbiAgfSk7XHJcbiAgZGVzY3JpYmUoJ2RlZmluZWQgYXMgYSBtZXRob2Qgb2YgYW5vdGhlciBwYXJzZXIgKHBjaGFyKFxcJ2FcXCcpLmZtYXAoeCA9PiB4LnRvVXBwZXJDYXNlKCkpKScsICgpID0+IHtcclxuICAgIGNvbnN0IG1hcHBpbmdQYXJzZXIgPSBwY2hhcignYScpLmZtYXAoeCA9PiB4LnRvVXBwZXJDYXNlKCkpO1xyXG4gICAgaXQoJ3NoYWxsIG1hcCB0aGUgb3V0cHV0IG9mIGFub3RoZXIgcGFyc2VyJywgKCkgPT4ge1xyXG4gICAgICBleHBlY3QoaXNQYXJzZXIobWFwcGluZ1BhcnNlcikpLnRvLmJlLnRydWU7XHJcbiAgICAgIGNvbnN0IG1hcHBlZFBhcnNpbmdBID0gbWFwcGluZ1BhcnNlci5ydW4odGV4dCgnYWJjJykpO1xyXG4gICAgICBleHBlY3QobWFwcGVkUGFyc2luZ0EudmFsdWVbMF0pLnRvLmJlLmVxbCgnQScpO1xyXG4gICAgICBleHBlY3QobWFwcGVkUGFyc2luZ0EudmFsdWVbMV0ucmVzdCgpKS50by5iZS5lcWwoJ2JjJyk7XHJcbiAgICAgIGV4cGVjdChtYXBwZWRQYXJzaW5nQS5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XHJcbiAgICB9KTtcclxuICB9KTtcclxufSk7XHJcblxyXG5kZXNjcmliZSgndHdvIHBhcnNlcnMgYm91bmQgYnkgYW5kVGhlbiAocGFyc2VyQWFuZEIgPSBhbmRUaGVuKHBjaGFyKFxcJ2FcXCcpLCBwY2hhcihcXCdiXFwnKSkpJywgKCkgPT4ge1xyXG4gIGNvbnN0IHBhcnNlckFhbmRCID0gYW5kVGhlbihwY2hhcignYScpLCBwY2hhcignYicpKTtcclxuXHJcbiAgaXQoJ2NhbiBwYXJzZSB0d28gY2hhcnMnLCAoKSA9PiB7XHJcbiAgICBleHBlY3QoaXNQYXJzZXIocGFyc2VyQWFuZEIpKS50by5iZS50cnVlO1xyXG4gICAgY29uc3QgcGFyc2luZ0FhbmRCID0gcGFyc2VyQWFuZEIucnVuKHRleHQoJ2FiYycpKTtcclxuICAgIGV4cGVjdChwYXJzaW5nQWFuZEIuaXNTdWNjZXNzKS50by5iZS50cnVlO1xyXG4gICAgZXhwZWN0KHBhcnNpbmdBYW5kQi52YWx1ZVswXS50b1N0cmluZygpKS50by5iZS5lcWwoJ1thLGJdJyk7XHJcbiAgICBleHBlY3QocGFyc2luZ0FhbmRCLnZhbHVlWzFdLnJlc3QoKSkudG8uYmUuZXFsKCdjJyk7XHJcbiAgICBleHBlY3QocGFyc2luZ0FhbmRCLnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgnVmFsaWRhdGlvbi5TdWNjZXNzKFtbYSxiXSxyb3c9MDtjb2w9MjtyZXN0PWNdKScpO1xyXG4gIH0pO1xyXG5cclxuICBpdCgnd2lsbCBmYWlsIGlmIHRoZSB0d28gY2hhcnMgYXJlIG5vdCB0aGUgb25lcyBzb3VnaHQnLCAoKSA9PiB7XHJcbiAgICBjb25zdCBwYXJzaW5nQWFuZEIgPSBwYXJzZXJBYW5kQi5ydW4odGV4dCgnYWNkJykpO1xyXG4gICAgZXhwZWN0KHBhcnNpbmdBYW5kQi5pc0ZhaWx1cmUpLnRvLmJlLnRydWU7XHJcbiAgICBleHBlY3QocGFyc2luZ0FhbmRCLnZhbHVlWzBdKS50by5iZS5lcWwoJ3BjaGFyX2EgYW5kVGhlbiBwY2hhcl9iJyk7XHJcbiAgICBleHBlY3QocGFyc2luZ0FhbmRCLnZhbHVlWzFdKS50by5iZS5lcWwoJ3dhbnRlZCBiOyBnb3QgYycpO1xyXG4gICAgZXhwZWN0KHBhcnNpbmdBYW5kQi52YWx1ZVsyXS5yZXN0KCkpLnRvLmJlLmVxbCgnY2QnKTtcclxuICB9KTtcclxuXHJcbiAgaXQoJ3dpbGwgZmFpbCBpZiB0aGUgaW5wdXQgaXMgdG9vIHNob3J0JywgKCkgPT4ge1xyXG4gICAgZXhwZWN0KHBhcnNlckFhbmRCLnJ1bih0ZXh0KCdhJykpLmlzRmFpbHVyZSkudG8uYmUudHJ1ZTtcclxuICAgIGV4cGVjdChwYXJzZXJBYW5kQi5ydW4odGV4dCgnYWInKSkuaXNTdWNjZXNzKS50by5iZS50cnVlO1xyXG4gIH0pO1xyXG59KTtcclxuXHJcbmRlc2NyaWJlKCd0d28gcGFyc2VycyBib3VuZCBieSBvckVsc2UgKHBhcnNlckFvckIgPSBvckVsc2UocGNoYXIoXFwnYVxcJyksIHBjaGFyKFxcJ2JcXCcpKSknLCAoKSA9PiB7XHJcbiAgY29uc3QgcGFyc2VyQW9yQiA9IG9yRWxzZShwY2hhcignYScpLCBwY2hhcignYicpKTtcclxuXHJcbiAgaXQoJ2NhbiBwYXJzZSBvbmUgb2YgdHdvIGNoYXJzJywgKCkgPT4ge1xyXG4gICAgZXhwZWN0KGlzUGFyc2VyKHBhcnNlckFvckIpKS50by5iZS50cnVlO1xyXG4gICAgbGV0IHBhcnNpbmdBb3JCID0gcGFyc2VyQW9yQi5ydW4odGV4dCgnYWJjJykpO1xyXG4gICAgZXhwZWN0KHBhcnNpbmdBb3JCLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcclxuICAgIGV4cGVjdChwYXJzaW5nQW9yQi52YWx1ZVswXSkudG8uYmUuZXFsKCdhJyk7XHJcbiAgICBleHBlY3QocGFyc2luZ0FvckIudmFsdWVbMV0ucmVzdCgpKS50by5iZS5lcWwoJ2JjJyk7XHJcbiAgICBwYXJzaW5nQW9yQiA9IHBhcnNlckFvckIucnVuKHRleHQoJ2JiYycpKTtcclxuICAgIGV4cGVjdChwYXJzaW5nQW9yQi5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XHJcbiAgICBleHBlY3QocGFyc2luZ0FvckIudmFsdWVbMF0pLnRvLmJlLmVxbCgnYicpO1xyXG4gICAgZXhwZWN0KHBhcnNpbmdBb3JCLnZhbHVlWzFdLnJlc3QoKSkudG8uYmUuZXFsKCdiYycpO1xyXG4gIH0pO1xyXG5cclxuICBpdCgnY2FuIGFsc28gcGFyc2UgTk9ORSBvZiB0d28gY2hhcnMnLCAoKSA9PiB7XHJcbiAgICBjb25zdCBwYXJzaW5nQW9yQiA9IHBhcnNlckFvckIucnVuKHRleHQoJ2NkZScpKTtcclxuICAgIGV4cGVjdChwYXJzaW5nQW9yQi5pc0ZhaWx1cmUpLnRvLmJlLnRydWU7XHJcbiAgICBleHBlY3QocGFyc2luZ0FvckIudmFsdWVbMF0pLnRvLmJlLmVxbCgncGNoYXJfYSBvckVsc2UgcGNoYXJfYicpO1xyXG4gICAgZXhwZWN0KHBhcnNpbmdBb3JCLnZhbHVlWzFdKS50by5iZS5lcWwoJ3dhbnRlZCBiOyBnb3QgYycpO1xyXG4gICAgZXhwZWN0KHBhcnNpbmdBb3JCLnZhbHVlWzJdLnJlc3QoKSkudG8uYmUuZXFsKCdjZGUnKTtcclxuICB9KTtcclxuXHJcbiAgaXQoJ3dpbGwgZmFpbCBpZiB0aGUgaW5wdXQgaXMgdG9vIHNob3J0JywgKCkgPT4ge1xyXG4gICAgZXhwZWN0KHBhcnNlckFvckIucnVuKHRleHQoJ2EnKSkuaXNTdWNjZXNzKS50by5iZS50cnVlO1xyXG4gICAgZXhwZWN0KHBhcnNlckFvckIucnVuKHRleHQoJycpKS5pc0ZhaWx1cmUpLnRvLmJlLnRydWU7XHJcbiAgfSk7XHJcbn0pO1xyXG5cclxuZGVzY3JpYmUoJ2EgcGFyc2VyIGZvciBldmVuIGp1c3QgdGhyZWUgY2hhcnMgaW4gYSByb3csIGRvbmUgd2l0aCBhbmRUaGVuICsgZm1hcCwgaXMgcmVhbCBjbHVtc3k7IGJ1dCBpdCB3b3Jrcy4uLicsICgpID0+IHtcclxuICBpdCgncGFyc2VzIGFiYycsICgpID0+IHtcclxuICAgIGNvbnN0IHBhaXJBZGRlciA9IChbeCwgeV0pID0+IHggKyB5O1xyXG4gICAgY29uc3QgYWJjUCA9IGFuZFRoZW4oXHJcbiAgICAgIHBjaGFyKCdhJyksXHJcbiAgICAgIGFuZFRoZW4oXHJcbiAgICAgICAgcGNoYXIoJ2InKSxcclxuICAgICAgICBhbmRUaGVuKFxyXG4gICAgICAgICAgcGNoYXIoJ2MnKSxcclxuICAgICAgICAgIHJldHVyblAoJycpLFxyXG4gICAgICAgICkuZm1hcChwYWlyQWRkZXIpLFxyXG4gICAgICApLmZtYXAocGFpckFkZGVyKSxcclxuICAgICkuZm1hcChwYWlyQWRkZXIpO1xyXG4gICAgY29uc3QgcGFyc2luZyA9IGFiY1AucnVuKCdhYmNkJyk7XHJcbiAgICBleHBlY3QocGFyc2luZy5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XHJcbiAgICBleHBlY3QocGFyc2luZy52YWx1ZVswXS50b1N0cmluZygpKS50by5iZS5lcWwoJ2FiYycpO1xyXG4gICAgZXhwZWN0KHBhcnNpbmcudmFsdWVbMV0ucmVzdCgpKS50by5iZS5lcWwoJ2QnKTtcclxuICB9KTtcclxuICBpdCgncGFyc2VzIGFiYyB3aXRoIGEgZGlmZmVyZW50LCBidXQgc3RpbGwgdmVyeSBjbHVtc3kgc3ludGF4JywgKCkgPT4ge1xyXG4gICAgY29uc3QgcGFpckFkZGVyID0gKFt4LCB5XSkgPT4geCArIHk7XHJcbiAgICBjb25zdCBhYmNQID0gKChwY2hhcignYScpLmFuZFRoZW4ocGNoYXIoJ2InKSkpLmZtYXAocGFpckFkZGVyKS5hbmRUaGVuKHBjaGFyKCdjJykpKS5mbWFwKHBhaXJBZGRlcik7XHJcbiAgICBjb25zdCBwYXJzaW5nID0gYWJjUC5ydW4oJ2FiY2QnKTtcclxuICAgIGV4cGVjdChwYXJzaW5nLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcclxuICAgIGV4cGVjdChwYXJzaW5nLnZhbHVlWzBdLnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgnYWJjJyk7XHJcbiAgICBleHBlY3QocGFyc2luZy52YWx1ZVsxXS5yZXN0KCkpLnRvLmJlLmVxbCgnZCcpO1xyXG4gIH0pO1xyXG59KTtcclxuXHJcbmRlc2NyaWJlKCdhIHBhcnNlciBmb3IgZXZlbiBqdXN0IHRocmVlIGRpZ2l0cyBpbiBhIHJvdywgZG9uZSB3aXRoIGFuZFRoZW4gKyBmbWFwLCBpcyByZWFsIGNsdW1zeTsgYnV0IGl0IHdvcmtzLi4uJywgKCkgPT4ge1xyXG4gIGxldCBwYXJzZURpZ2l0LCB0aHJlZURpZ2l0cywgcGFyc2luZztcclxuXHJcbiAgYmVmb3JlKCgpID0+IHtcclxuICAgIHBhcnNlRGlnaXQgPSBhbnlPZihkaWdpdHMpO1xyXG4gICAgdGhyZWVEaWdpdHMgPSBhbmRUaGVuKHBhcnNlRGlnaXQsIGFuZFRoZW4ocGFyc2VEaWdpdCwgcGFyc2VEaWdpdCkpO1xyXG4gICAgcGFyc2luZyA9IHRocmVlRGlnaXRzLnJ1bignMTIzJyk7XHJcbiAgfSk7XHJcbiAgaXQoJ3BhcnNlcyBhbnkgb2YgdGhyZWUgZGlnaXRzJywgKCkgPT4ge1xyXG4gICAgZXhwZWN0KHBhcnNpbmcuaXNTdWNjZXNzKS50by5iZS50cnVlO1xyXG4gICAgZXhwZWN0KHBhcnNpbmcudmFsdWVbMF0udG9TdHJpbmcoKSkudG8uYmUuZXFsKCdbMSxbMiwzXV0nKTtcclxuICAgIGV4cGVjdChwYXJzaW5nLnZhbHVlWzFdLnJlc3QoKSkudG8uYmUuZXFsKCcnKTtcclxuICB9KTtcclxuICBkZXNjcmliZSgncGFyc2VzIGFueSBvZiB0aHJlZSBkaWdpdHMgd2hpbGUgc2hvd2Nhc2luZyBmbWFwJywgKCkgPT4ge1xyXG4gICAgY29uc3QgdW5wYWNrZXIgPSAoW3gsIFt5LCB6XV0pID0+IHtcclxuICAgICAgcmV0dXJuIFt4LCB5LCB6XTtcclxuICAgIH07XHJcbiAgICBpdCgnYXMgZ2xvYmFsIG1ldGhvZCcsICgpID0+IHtcclxuICAgICAgY29uc3QgdGhyZWVEaWdpdHNJbXBsID0gZm1hcCh1bnBhY2tlciwgdGhyZWVEaWdpdHMpO1xyXG4gICAgICBjb25zdCBwYXJzaW5nID0gdGhyZWVEaWdpdHNJbXBsLnJ1bignMTIzJyk7XHJcbiAgICAgIGV4cGVjdChwYXJzaW5nLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcclxuICAgICAgZXhwZWN0KHBhcnNpbmcudmFsdWVbMF0udG9TdHJpbmcoKSkudG8uYmUuZXFsKCdbMSwyLDNdJyk7XHJcbiAgICAgIGV4cGVjdChwYXJzaW5nLnZhbHVlWzFdLnJlc3QoKSkudG8uYmUuZXFsKCcnKTtcclxuICAgIH0pO1xyXG4gICAgaXQoJ2FzIGluc3RhbmNlIG1ldGhvZCcsICgpID0+IHtcclxuICAgICAgY29uc3QgdGhyZWVEaWdpdHNJbnN0ID0gdGhyZWVEaWdpdHMuZm1hcCh1bnBhY2tlcik7XHJcbiAgICAgIGNvbnN0IHBhcnNpbmcgPSB0aHJlZURpZ2l0c0luc3QucnVuKCcxMjMnKTtcclxuICAgICAgZXhwZWN0KHBhcnNpbmcuaXNTdWNjZXNzKS50by5iZS50cnVlO1xyXG4gICAgICBleHBlY3QocGFyc2luZy52YWx1ZVswXS50b1N0cmluZygpKS50by5iZS5lcWwoJ1sxLDIsM10nKTtcclxuICAgICAgZXhwZWN0KHBhcnNpbmcudmFsdWVbMV0ucmVzdCgpKS50by5iZS5lcWwoJycpO1xyXG4gICAgfSk7XHJcbiAgfSk7XHJcbn0pO1xyXG5cclxuZGVzY3JpYmUoJ2EgY2hvaWNlIG9mIGZvdXIgcGFyc2VycyBib3VuZCBieSBvckVsc2UgKHBhcnNlcnNDaG9pY2UgPSBjaG9pY2UoW3BjaGFyKFxcJ2FcXCcpLCBwY2hhcihcXCdiXFwnKSwgcGNoYXIoXFwnY1xcJyksIHBjaGFyKFxcJ2RcXCcpLF0pKScsICgpID0+IHtcclxuICBjb25zdCBwYXJzZXJzQ2hvaWNlID0gY2hvaWNlKFtwY2hhcignYScpLCBwY2hhcignYicpLCBwY2hhcignYycpLCBwY2hhcignZCcpXSk7XHJcblxyXG4gIGl0KCdjYW4gcGFyc2Ugb25lIG9mIGZvdXIgY2hhcnMnLCAoKSA9PiB7XHJcbiAgICBleHBlY3QoaXNQYXJzZXIocGFyc2Vyc0Nob2ljZSkpLnRvLmJlLnRydWU7XHJcbiAgICBsZXQgcGFyc2luZ0Nob2ljZSA9IHBhcnNlcnNDaG9pY2UucnVuKHRleHQoJ2EnKSk7XHJcbiAgICBleHBlY3QocGFyc2luZ0Nob2ljZS5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XHJcbiAgICBleHBlY3QocGFyc2luZ0Nob2ljZS52YWx1ZVswXSkudG8uYmUuZXFsKCdhJyk7XHJcbiAgICBleHBlY3QocGFyc2luZ0Nob2ljZS52YWx1ZVsxXS5yZXN0KCkpLnRvLmJlLmVxbCgnJyk7XHJcbiAgICBwYXJzaW5nQ2hvaWNlID0gcGFyc2Vyc0Nob2ljZS5ydW4odGV4dCgnYicpKTtcclxuICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcclxuICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLnZhbHVlWzBdKS50by5iZS5lcWwoJ2InKTtcclxuICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLnZhbHVlWzFdLnJlc3QoKSkudG8uYmUuZXFsKCcnKTtcclxuICAgIHBhcnNpbmdDaG9pY2UgPSBwYXJzZXJzQ2hvaWNlLnJ1bih0ZXh0KCdkJykpO1xyXG4gICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UuaXNTdWNjZXNzKS50by5iZS50cnVlO1xyXG4gICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UudmFsdWVbMF0pLnRvLmJlLmVxbCgnZCcpO1xyXG4gICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UudmFsdWVbMV0ucmVzdCgpKS50by5iZS5lcWwoJycpO1xyXG4gIH0pO1xyXG5cclxuICBpdCgnd2lsbCBmYWlsIGlmIE5PTkUgb2YgdGhlIGZvdXIgY2hhcnMgaXMgcHJvdmlkZWQnLCAoKSA9PiB7XHJcbiAgICBjb25zdCBwYXJzaW5nQ2hvaWNlID0gcGFyc2Vyc0Nob2ljZS5ydW4odGV4dCgneCcpKTtcclxuICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLmlzRmFpbHVyZSkudG8uYmUudHJ1ZTtcclxuICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLnZhbHVlWzBdKS50by5iZS5lcWwoJ2Nob2ljZSAvcGNoYXJfYS9wY2hhcl9iL3BjaGFyX2MvcGNoYXJfZCcpO1xyXG4gICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UudmFsdWVbMV0pLnRvLmJlLmVxbCgnZmFpbCcpO1xyXG4gICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UudmFsdWVbMl0ucmVzdCgpKS50by5iZS5lcWwoJ3gnKTtcclxuICB9KTtcclxuXHJcbiAgaXQoJ3dpbGwgZmFpbCBpZiB0aGUgaW5wdXQgaXMgdG9vIHNob3J0JywgKCkgPT4ge1xyXG4gICAgZXhwZWN0KHBhcnNlcnNDaG9pY2UucnVuKHRleHQoJ2EnKSkuaXNTdWNjZXNzKS50by5iZS50cnVlO1xyXG4gICAgZXhwZWN0KHBhcnNlcnNDaG9pY2UucnVuKHRleHQoJycpKS5pc0ZhaWx1cmUpLnRvLmJlLnRydWU7XHJcbiAgfSk7XHJcbn0pO1xyXG5cclxuZGVzY3JpYmUoJ2EgcGFyc2VyIGZvciBhbnkgb2YgYSBsaXN0IG9mLi4uICcsICgpID0+IHtcclxuICBkZXNjcmliZSgnbG93ZXJjYXNlIGNoYXJzIChsb3dlcmNhc2VzUGFyc2VyID0gYW55T2YobG93ZXJjYXNlcykpJywgKCkgPT4ge1xyXG4gICAgY29uc3QgbG93ZXJjYXNlc1BhcnNlciA9IGFueU9mKGxvd2VyY2FzZXMpO1xyXG4gICAgaXQoJ2NhbiBwYXJzZSBhbnkgc2luZ2xlIGxvd2VyY2FzZSBjaGFyJywgKCkgPT4ge1xyXG4gICAgICBleHBlY3QoaXNQYXJzZXIobG93ZXJjYXNlc1BhcnNlcikpLnRvLmJlLnRydWU7XHJcbiAgICAgIGxldCBwYXJzaW5nQ2hvaWNlID0gbG93ZXJjYXNlc1BhcnNlci5ydW4odGV4dCgnYScpKTtcclxuICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UuaXNTdWNjZXNzKS50by5iZS50cnVlO1xyXG4gICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS52YWx1ZVswXSkudG8uYmUuZXFsKCdhJyk7XHJcbiAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLnZhbHVlWzFdLnJlc3QoKSkudG8uYmUuZXFsKCcnKTtcclxuICAgICAgcGFyc2luZ0Nob2ljZSA9IGxvd2VyY2FzZXNQYXJzZXIucnVuKHRleHQoJ2InKSk7XHJcbiAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcclxuICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UudmFsdWVbMF0pLnRvLmJlLmVxbCgnYicpO1xyXG4gICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS52YWx1ZVsxXS5yZXN0KCkpLnRvLmJlLmVxbCgnJyk7XHJcbiAgICAgIHBhcnNpbmdDaG9pY2UgPSBsb3dlcmNhc2VzUGFyc2VyLnJ1bih0ZXh0KCdkJykpO1xyXG4gICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XHJcbiAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLnZhbHVlWzBdKS50by5iZS5lcWwoJ2QnKTtcclxuICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UudmFsdWVbMV0ucmVzdCgpKS50by5iZS5lcWwoJycpO1xyXG4gICAgICBwYXJzaW5nQ2hvaWNlID0gbG93ZXJjYXNlc1BhcnNlci5ydW4odGV4dCgneicpKTtcclxuICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UuaXNTdWNjZXNzKS50by5iZS50cnVlO1xyXG4gICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS52YWx1ZVswXSkudG8uYmUuZXFsKCd6Jyk7XHJcbiAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLnZhbHVlWzFdLnJlc3QoKSkudG8uYmUuZXFsKCcnKTtcclxuICAgIH0pO1xyXG4gICAgaXQoJ2Nhbm5vdCBwYXJzZSBhbnkgc2luZ2xlIHVwcGVyY2FzZSBjaGFyJywgKCkgPT4ge1xyXG4gICAgICBjb25zdCBwYXJzaW5nQ2hvaWNlID0gbG93ZXJjYXNlc1BhcnNlci5ydW4odGV4dCgnWScpKTtcclxuICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UuaXNGYWlsdXJlKS50by5iZS50cnVlO1xyXG4gICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS52YWx1ZVswXSkudG8uYmUuZXFsKCdhbnlPZiBhYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5eicpO1xyXG4gICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS52YWx1ZVsxXSkudG8uYmUuZXFsKCdmYWlsJyk7XHJcbiAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLnZhbHVlWzJdLnJlc3QoKSkudG8uYmUuZXFsKCdZJyk7XHJcbiAgICB9KTtcclxuICB9KTtcclxuICBkZXNjcmliZSgndXBwZXJjYXNlIGNoYXJzICh1cHBlcmNhc2VzUGFyc2VyID0gYW55T2YodXBwZXJjYXNlcykpJywgKCkgPT4ge1xyXG4gICAgY29uc3QgdXBwZXJjYXNlc1BhcnNlciA9IGFueU9mKHVwcGVyY2FzZXMpO1xyXG4gICAgaXQoJ2NhbiBwYXJzZSBhbnkgc2luZ2xlIHVwcGVyY2FzZSBjaGFyJywgKCkgPT4ge1xyXG4gICAgICBleHBlY3QoaXNQYXJzZXIodXBwZXJjYXNlc1BhcnNlcikpLnRvLmJlLnRydWU7XHJcbiAgICAgIGxldCBwYXJzaW5nQ2hvaWNlID0gdXBwZXJjYXNlc1BhcnNlci5ydW4odGV4dCgnQScpKTtcclxuICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UuaXNTdWNjZXNzKS50by5iZS50cnVlO1xyXG4gICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS52YWx1ZVswXSkudG8uYmUuZXFsKCdBJyk7XHJcbiAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLnZhbHVlWzFdLnJlc3QoKSkudG8uYmUuZXFsKCcnKTtcclxuICAgICAgcGFyc2luZ0Nob2ljZSA9IHVwcGVyY2FzZXNQYXJzZXIucnVuKHRleHQoJ0InKSk7XHJcbiAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcclxuICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UudmFsdWVbMF0pLnRvLmJlLmVxbCgnQicpO1xyXG4gICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS52YWx1ZVsxXS5yZXN0KCkpLnRvLmJlLmVxbCgnJyk7XHJcbiAgICAgIHBhcnNpbmdDaG9pY2UgPSB1cHBlcmNhc2VzUGFyc2VyLnJ1bih0ZXh0KCdSJykpO1xyXG4gICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XHJcbiAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLnZhbHVlWzBdKS50by5iZS5lcWwoJ1InKTtcclxuICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UudmFsdWVbMV0ucmVzdCgpKS50by5iZS5lcWwoJycpO1xyXG4gICAgICBwYXJzaW5nQ2hvaWNlID0gdXBwZXJjYXNlc1BhcnNlci5ydW4odGV4dCgnWicpKTtcclxuICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UuaXNTdWNjZXNzKS50by5iZS50cnVlO1xyXG4gICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS52YWx1ZVswXSkudG8uYmUuZXFsKCdaJyk7XHJcbiAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLnZhbHVlWzFdLnJlc3QoKSkudG8uYmUuZXFsKCcnKTtcclxuICAgIH0pO1xyXG4gICAgaXQoJ2Nhbm5vdCBwYXJzZSBhbnkgc2luZ2xlIGxvd2VyY2FzZSBjaGFyJywgKCkgPT4ge1xyXG4gICAgICBjb25zdCBwYXJzaW5nQ2hvaWNlID0gdXBwZXJjYXNlc1BhcnNlci5ydW4odGV4dCgncycpKTtcclxuICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UuaXNGYWlsdXJlKS50by5iZS50cnVlO1xyXG4gICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS52YWx1ZVswXSkudG8uYmUuZXFsKCdhbnlPZiBBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWicpO1xyXG4gICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS52YWx1ZVsxXSkudG8uYmUuZXFsKCdmYWlsJyk7XHJcbiAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLnZhbHVlWzJdLnJlc3QoKSkudG8uYmUuZXFsKCdzJyk7XHJcbiAgICB9KTtcclxuICB9KTtcclxuICBkZXNjcmliZSgnZGlnaXRzIChkaWdpdHNQYXJzZXIgPSBhbnlPZihkaWdpdHMpKScsICgpID0+IHtcclxuICAgIGNvbnN0IGRpZ2l0c1BhcnNlciA9IGFueU9mKGRpZ2l0cyk7XHJcbiAgICBpdCgnY2FuIHBhcnNlIGFueSBzaW5nbGUgZGlnaXQnLCAoKSA9PiB7XHJcbiAgICAgIGV4cGVjdChpc1BhcnNlcihkaWdpdHNQYXJzZXIpKS50by5iZS50cnVlO1xyXG4gICAgICBsZXQgcGFyc2luZ0Nob2ljZSA9IGRpZ2l0c1BhcnNlci5ydW4odGV4dCgnMScpKTtcclxuICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UuaXNTdWNjZXNzKS50by5iZS50cnVlO1xyXG4gICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS52YWx1ZVswXSkudG8uYmUuZXFsKCcxJyk7XHJcbiAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLnZhbHVlWzFdLnJlc3QoKSkudG8uYmUuZXFsKCcnKTtcclxuICAgICAgcGFyc2luZ0Nob2ljZSA9IGRpZ2l0c1BhcnNlci5ydW4odGV4dCgnMycpKTtcclxuICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UuaXNTdWNjZXNzKS50by5iZS50cnVlO1xyXG4gICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS52YWx1ZVswXSkudG8uYmUuZXFsKCczJyk7XHJcbiAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLnZhbHVlWzFdLnJlc3QoKSkudG8uYmUuZXFsKCcnKTtcclxuICAgICAgcGFyc2luZ0Nob2ljZSA9IGRpZ2l0c1BhcnNlci5ydW4odGV4dCgnMCcpKTtcclxuICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UuaXNTdWNjZXNzKS50by5iZS50cnVlO1xyXG4gICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS52YWx1ZVswXSkudG8uYmUuZXFsKCcwJyk7XHJcbiAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLnZhbHVlWzFdLnJlc3QoKSkudG8uYmUuZXFsKCcnKTtcclxuICAgICAgcGFyc2luZ0Nob2ljZSA9IGRpZ2l0c1BhcnNlci5ydW4odGV4dCgnOCcpKTtcclxuICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UuaXNTdWNjZXNzKS50by5iZS50cnVlO1xyXG4gICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS52YWx1ZVswXSkudG8uYmUuZXFsKCc4Jyk7XHJcbiAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLnZhbHVlWzFdLnJlc3QoKSkudG8uYmUuZXFsKCcnKTtcclxuICAgIH0pO1xyXG4gICAgaXQoJ2Nhbm5vdCBwYXJzZSBhbnkgc2luZ2xlIGNoYXJhY3RlcicsICgpID0+IHtcclxuICAgICAgY29uc3QgcGFyc2luZ0Nob2ljZSA9IGRpZ2l0c1BhcnNlci5ydW4odGV4dCgncycpKTtcclxuICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UuaXNGYWlsdXJlKS50by5iZS50cnVlO1xyXG4gICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS52YWx1ZVswXSkudG8uYmUuZXFsKCdhbnlPZiAwMTIzNDU2Nzg5Jyk7XHJcbiAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLnZhbHVlWzFdKS50by5iZS5lcWwoJ2ZhaWwnKTtcclxuICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UudmFsdWVbMl0ucmVzdCgpKS50by5iZS5lcWwoJ3MnKTtcclxuICAgIH0pO1xyXG4gIH0pO1xyXG4gIGl0KCd3aWxsIGZhaWwgaWYgdGhlIGlucHV0IGlzIHRvbyBzaG9ydCcsICgpID0+IHtcclxuICAgIGV4cGVjdChhbnlPZihsb3dlcmNhc2VzKS5ydW4odGV4dCgnJykpLmlzRmFpbHVyZSkudG8uYmUudHJ1ZTtcclxuICAgIGV4cGVjdChhbnlPZih1cHBlcmNhc2VzKS5ydW4odGV4dCgnJykpLmlzRmFpbHVyZSkudG8uYmUudHJ1ZTtcclxuICAgIGV4cGVjdChhbnlPZihkaWdpdHMpLnJ1bih0ZXh0KCcnKSkuaXNGYWlsdXJlKS50by5iZS50cnVlO1xyXG4gIH0pO1xyXG59KTtcclxuXHJcbmRlc2NyaWJlKCdsaWZ0MiBmb3IgcGFyc2VycycsICgpID0+IHtcclxuICBpdCgnb3BlcmF0ZXMgb24gdGhlIHJlc3VsdHMgb2YgdHdvIHN0cmluZyBwYXJzaW5ncycsICgpID0+IHtcclxuICAgIGNvbnN0IGFkZFN0cmluZ3MgPSB4ID0+IHkgPT4geCArICcrJyArIHk7XHJcbiAgICBjb25zdCBBcGx1c0IgPSBsaWZ0MihhZGRTdHJpbmdzKShwY2hhcignYScpKShwY2hhcignYicpKTtcclxuICAgIGV4cGVjdChBcGx1c0IucnVuKCdhYmMnKS50b1N0cmluZygpKS50by5iZS5lcWwoJ1ZhbGlkYXRpb24uU3VjY2VzcyhbYStiLHJvdz0wO2NvbD0yO3Jlc3Q9Y10pJyk7XHJcbiAgfSk7XHJcbiAgaXQoJ2FkZHMgdGhlIHJlc3VsdHMgb2YgdHdvIGRpZ2l0IHBhcnNpbmdzJywgKCkgPT4ge1xyXG4gICAgY29uc3QgYWRkRGlnaXRzID0geCA9PiB5ID0+IHggKyB5O1xyXG4gICAgY29uc3QgYWRkUGFyc2VyID0gbGlmdDIoYWRkRGlnaXRzKShwZGlnaXQoMSkpKHBkaWdpdCgyKSk7XHJcbiAgICBleHBlY3QoYWRkUGFyc2VyLnJ1bignMTIzNCcpLnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgnVmFsaWRhdGlvbi5TdWNjZXNzKFszLHJvdz0wO2NvbD0yO3Jlc3Q9MzRdKScpO1xyXG4gICAgZXhwZWN0KGFkZFBhcnNlci5ydW4oJzE0NCcpLmlzRmFpbHVyZSkudG8uYmUudHJ1ZTtcclxuICB9KTtcclxufSk7XHJcblxyXG5kZXNjcmliZSgnYSBzZXF1ZW5jZSBvZiBwYXJzZXJzLCBidWlsdCB1c2luZyBsaWZ0Mihjb25zKSAoYWthIHNlcXVlbmNlUCknLCAoKSA9PiB7XHJcbiAgaXQoJ3N0b3JlcyBtYXRjaGVkIGNoYXJzIGluc2lkZSBhbiBBUlJBWScsICgpID0+IHtcclxuICAgIGNvbnN0IGFiY1BhcnNlciA9IHNlcXVlbmNlUChbcGNoYXIoJ2EnKSwgcGNoYXIoJ2InKSwgcGNoYXIoJ2MnKV0pO1xyXG4gICAgZXhwZWN0KGFiY1BhcnNlci5ydW4oJ2FiYycpLnRvU3RyaW5nKCkpXHJcbiAgICAgIC50by5iZS5lcWwoJ1ZhbGlkYXRpb24uU3VjY2VzcyhbW2EsYixjXSxyb3c9MTtjb2w9MDtyZXN0PV0pJyk7XHJcbiAgfSk7XHJcbiAgaXQoJ3JlcXVpcmVzIHRoZXJlZm9yZSBzb21lIG1hcHBpbmcnLCAoKSA9PiB7XHJcbiAgICBjb25zdCBtYXBwZWRBYmNQYXJzZXIgPSBzZXF1ZW5jZVAoW3BjaGFyKCdhJyksIHBjaGFyKCdiJyksIHBjaGFyKCdjJyldKVxyXG4gICAgICAuZm1hcChhID0+IGEuam9pbignJykpO1xyXG4gICAgZXhwZWN0KG1hcHBlZEFiY1BhcnNlci5ydW4oJ2FiYycpLnRvU3RyaW5nKCkpXHJcbiAgICAgIC50by5iZS5lcWwoJ1ZhbGlkYXRpb24uU3VjY2VzcyhbYWJjLHJvdz0xO2NvbD0wO3Jlc3Q9XSknKTtcclxuICB9KTtcclxufSk7XHJcblxyXG5kZXNjcmliZSgnYSBzZXF1ZW5jZSBvZiBwYXJzZXJzLCBidWlsdCB1c2luZyBhbmRUaGVuICYmIGZtYXAgKGFrYSBzZXF1ZW5jZVAyKScsICgpID0+IHtcclxuICBpdCgnc3RvcmUgbWF0Y2hlZCBjaGFycyBpbnNpZGUgYSBwbGFpbiBTVFJJTkcnLCAoKSA9PiB7XHJcbiAgICBjb25zdCBhYmNQYXJzZXIgPSBzZXF1ZW5jZVAyKFtwY2hhcignYScpLCBwY2hhcignYicpLCBwY2hhcignYycpXSk7XHJcbiAgICBleHBlY3QoYWJjUGFyc2VyLnJ1bignYWJjJykudG9TdHJpbmcoKSlcclxuICAgICAgLnRvLmJlLmVxbCgnVmFsaWRhdGlvbi5TdWNjZXNzKFthYmMscm93PTE7Y29sPTA7cmVzdD1dKScpO1xyXG4gIH0pO1xyXG59KTtcclxuXHJcbmRlc2NyaWJlKCdhIHBhcnNlciBmb3IgYSBzcGVjaWZpYyBzZXF1ZW5jZSBvZiBjaGFycycsICgpID0+IHtcclxuICBpdCgnaXMgZWFzeSB0byBjcmVhdGUgd2l0aCBzZXF1ZW5jZVAgKG1hcmNvUGFyc2VyID0gcHN0cmluZyhcXCdtYXJjb1xcJykpIGFuZCBpdCByZXR1cm5zIGFuIGFycmF5JywgKCkgPT4ge1xyXG4gICAgY29uc3QgbWFyY29QYXJzZXIgPSBwc3RyaW5nKCdtYXJjbycpO1xyXG4gICAgY29uc3QgbWFyY29QYXJzaW5nID0gbWFyY29QYXJzZXIucnVuKCdtYXJjb2NpYW8nKTtcclxuICAgIGV4cGVjdChtYXJjb1BhcnNpbmcuaXNTdWNjZXNzKS50by5iZS50cnVlO1xyXG4gICAgZXhwZWN0KG1hcmNvUGFyc2luZy50b1N0cmluZygpKVxyXG4gICAgICAudG8uYmUuZXFsKCdWYWxpZGF0aW9uLlN1Y2Nlc3MoW1ttLGEscixjLG9dLHJvdz0wO2NvbD01O3Jlc3Q9Y2lhb10pJyk7XHJcbiAgfSk7XHJcbiAgaXQoJ2hhcyBhIHZlcnNpb24gYmFzZWQgb24gc2VxdWVuY2VQMiB0aGF0IHJldHVybnMgc3RyaW5ncyAobWFyY29QYXJzZXIgPSBzdHJpbmdQKFxcJ21hcmNvXFwnKSknLCAoKSA9PiB7XHJcbiAgICBjb25zdCBtYXJjb1BhcnNlciA9IHN0cmluZ1AoJ21hcmNvJyk7XHJcbiAgICBjb25zdCBtYXJjb1BhcnNpbmcgPSBtYXJjb1BhcnNlci5ydW4oJ21hcmNvY2lhbycpO1xyXG4gICAgZXhwZWN0KG1hcmNvUGFyc2luZy5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XHJcbiAgICBleHBlY3QobWFyY29QYXJzaW5nLnRvU3RyaW5nKCkpXHJcbiAgICAgIC50by5iZS5lcWwoJ1ZhbGlkYXRpb24uU3VjY2VzcyhbbWFyY28scm93PTA7Y29sPTU7cmVzdD1jaWFvXSknKTtcclxuICB9KTtcclxufSk7XHJcblxyXG5kZXNjcmliZSgnYSBzdWNjZWVkaW5nIHBhcnNlciAoc3VjY2VlZFApJywgKCkgPT4ge1xyXG4gIGNvbnN0IHdoYXRldmVyID0gUG9zaXRpb24uZnJvbVRleHQoJ3doYXRldmVyJyk7XHJcbiAgaXQoJ3N1Y2NlZWRzIGFsd2F5cycsICgpID0+IHtcclxuICAgIGV4cGVjdChzdWNjZWVkUC5ydW4od2hhdGV2ZXIpLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcclxuICB9KTtcclxuICBpdCgnY2FuIGJlIHVzZWQgYXMgYSBmbGFnIHRvIGV4aXQgd2l0aCBzYXRpc2ZhY3Rpb24gZnJvbSBhIG1vcmUgY29tcGxleCBwYXJzaW5nIChwYXJzaW5nID0gc2VxdWVuY2VQKFtwY2hhcihcXCd3XFwnKSwgcGNoYXIoXFwnaFxcJyksIHN1Y2NlZWRQXSkpJywgKCkgPT4ge1xyXG4gICAgZXhwZWN0KHN1Y2NlZWRQLnJ1bih3aGF0ZXZlcikuaXNTdWNjZXNzKS50by5iZS50cnVlO1xyXG4gICAgY29uc3QgcGFyc2luZyA9IHNlcXVlbmNlUChbcGNoYXIoJ3cnKSwgcGNoYXIoJ2gnKSwgc3VjY2VlZFBdKS5ydW4od2hhdGV2ZXIpO1xyXG4gICAgZXhwZWN0KHBhcnNpbmcudG9TdHJpbmcoKSkudG8uYmUuZXFsKCdWYWxpZGF0aW9uLlN1Y2Nlc3MoW1t3LGgsXSxyb3c9MDtjb2w9MjtyZXN0PWF0ZXZlcl0pJyk7XHJcbiAgfSk7XHJcbiAgaXQoJ2RvZXMgbm90IGNvbnN1bWUgY2hhcmFjdGVycywgYnV0IGl0IHJldHVybnMgYW4gZW1wdHkgc3RyaW5nIGFzIHJlc3VsdCcsICgpID0+IHtcclxuICAgIGNvbnN0IHBhcnNpbmcgPSBzZXF1ZW5jZVAoW3BjaGFyKCd3JyksIHN1Y2NlZWRQLCBwY2hhcignaCcpXSk7XHJcbiAgICBleHBlY3QocGFyc2luZy5ydW4od2hhdGV2ZXIpLnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgnVmFsaWRhdGlvbi5TdWNjZXNzKFtbdywsaF0scm93PTA7Y29sPTI7cmVzdD1hdGV2ZXJdKScpO1xyXG4gIH0pO1xyXG59KTtcclxuXHJcbmRlc2NyaWJlKCdhIGZhaWxpbmcgcGFyc2VyIChmYWlsUCknLCAoKSA9PiB7XHJcbiAgaXQoJ3dpbGwgYWx3YXlzIGZhaWwnLCAoKSA9PiB7XHJcbiAgICBleHBlY3QoZmFpbFAucnVuKCd3aGF0ZXZlcicpLmlzRmFpbHVyZSkudG8uYmUudHJ1ZTtcclxuICB9KTtcclxuICBpdCgnY2FuIGJlIHVzZWQgYXMgYSBmbGFnIHRvIGV4aXQgV0lUSE9VVCBzYXRpc2ZhY3Rpb24gZnJvbSBhIG1vcmUgY29tcGxleCBwYXJzaW5nIChwYXJzaW5nID0gc2VxdWVuY2VQKFtwY2hhcihcXCd3XFwnKSwgcGNoYXIoXFwnaFxcJyksIGZhaWxQXSkpJywgKCkgPT4ge1xyXG4gICAgZXhwZWN0KGZhaWxQLnJ1bignd2hhdGV2ZXInKS5pc0ZhaWx1cmUpLnRvLmJlLnRydWU7XHJcbiAgICBjb25zdCBwYXJzaW5nID0gc2VxdWVuY2VQKFtwY2hhcigndycpLCBwY2hhcignaCcpLCBmYWlsUF0pLnJ1bignd2hhdGV2ZXInKTtcclxuICAgIGV4cGVjdChwYXJzaW5nLnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgnVmFsaWRhdGlvbi5GYWlsdXJlKFtiaW5kUCBhcHBsaWVkIHRvIGJpbmRQIGFwcGxpZWQgdG8gdW5kZWZpbmVkLGZhaWwscm93PTA7Y29sPTI7cmVzdD1hdGV2ZXJdKScpO1xyXG4gIH0pO1xyXG4gIGl0KCdkb2VzIG5vdCBjb25zdW1lIGNoYXJhY3RlcnMsIGJ1dCBpdCByZXR1cm5zIGFuIGVtcHR5IHN0cmluZyBhcyByZXN1bHQnLCAoKSA9PiB7XHJcbiAgICBjb25zdCBwYXJzaW5nID0gc2VxdWVuY2VQKFtwY2hhcigndycpLCBmYWlsUCwgcGNoYXIoJ2gnKV0pO1xyXG4gICAgZXhwZWN0KHBhcnNpbmcucnVuKCd3aGF0ZXZlcicpLnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgnVmFsaWRhdGlvbi5GYWlsdXJlKFtiaW5kUCBhcHBsaWVkIHRvIGJpbmRQIGFwcGxpZWQgdG8gdW5kZWZpbmVkLGZhaWwscm93PTA7Y29sPTE7cmVzdD1oYXRldmVyXSknKTtcclxuICB9KTtcclxufSk7XHJcblxyXG5kZXNjcmliZSgnYSBwYXJzZXIgZm9yIHRoZSBzdGFydCBvZiB0aGUgaW5wdXQgKHN0YXJ0T2ZJbnB1dFApJywgKCkgPT4ge1xyXG4gIGl0KCdzdWNjZWVkcyBhdCB0aGUgc3RhcnQgb2YgdGhlIHN0cmVhbScsICgpID0+IHtcclxuICAgIGV4cGVjdChzdGFydE9mSW5wdXRQLnJ1bihQb3NpdGlvbi5mcm9tVGV4dCgnYWJjJykpLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcclxuICB9KTtcclxuICBpdCgnZmFpbHMgaGFsZndheSB0aHJvdWdoIHRoZSBzdHJlYW0gKCknLCAoKSA9PiB7XHJcbiAgICBjb25zdCBsYXRlckluVGhlU3RyZWFtID0gc2VxdWVuY2VQKFtwY2hhcignYScpLCBzdGFydE9mSW5wdXRQXSk7XHJcbiAgICBleHBlY3QobGF0ZXJJblRoZVN0cmVhbS5ydW4oUG9zaXRpb24uZnJvbVRleHQoJ2FiYycpKS5pc0ZhaWx1cmUpLnRvLmJlLnRydWU7XHJcbiAgfSk7XHJcbiAgaXQoJ2RvZXMgbm90IGNvbnN1bWUgY2hhcmFjdGVycywgYnV0IGl0IHJldHVybnMgYW4gZW1wdHkgc3RyaW5nIGFzIHJlc3VsdCcsICgpID0+IHtcclxuICAgIGNvbnN0IHN0YXJ0QUJDID0gc2VxdWVuY2VQKFtzdGFydE9mSW5wdXRQLCBwY2hhcignQScpLCBwY2hhcignQicpLCBwY2hhcignQycpXSk7XHJcbiAgICBjb25zdCBwYXJzaW5nID0gc3RhcnRBQkMucnVuKFBvc2l0aW9uLmZyb21UZXh0KCdBQkMnKSk7XHJcbiAgICBleHBlY3QocGFyc2luZy50b1N0cmluZygpKS50by5iZS5lcWwoJ1ZhbGlkYXRpb24uU3VjY2VzcyhbWyxBLEIsQ10scm93PTE7Y29sPTA7cmVzdD1dKScpO1xyXG4gIH0pO1xyXG59KTtcclxuXHJcbmRlc2NyaWJlKCdhIHBhcnNlciBmb3IgTk9UIHRoZSBzdGFydCBvZiB0aGUgaW5wdXQgKG5vdFN0YXJ0T2ZJbnB1dFApJywgKCkgPT4ge1xyXG4gIGl0KCdmYWlscyBhdCB0aGUgc3RhcnQgb2YgdGhlIHN0cmVhbScsICgpID0+IHtcclxuICAgIGV4cGVjdChub3RTdGFydE9mSW5wdXRQLnJ1bihQb3NpdGlvbi5mcm9tVGV4dCgnYWJjJykpLmlzRmFpbHVyZSkudG8uYmUudHJ1ZTtcclxuICAgIGV4cGVjdChzZXF1ZW5jZVAoW25vdFN0YXJ0T2ZJbnB1dFAsIHBjaGFyKCdhJyldKS5ydW4oUG9zaXRpb24uZnJvbVRleHQoJ2FiYycpKS50b1N0cmluZygpKVxyXG4gICAgICAudG8uYmUuZXFsKCdWYWxpZGF0aW9uLkZhaWx1cmUoW2JpbmRQIGFwcGxpZWQgdG8gYmluZFAgYXBwbGllZCB0byB1bmRlZmluZWQsZmFpbCxyb3c9MDtjb2w9MDtyZXN0PWFiY10pJyk7XHJcbiAgfSk7XHJcbiAgaXQoJ3N1Y2NlZWRzIGhhbGZ3YXkgdGhyb3VnaCB0aGUgc3RyZWFtJywgKCkgPT4ge1xyXG4gICAgY29uc3QgbGF0ZXJJblRoZVN0cmVhbSA9IHNlcXVlbmNlUChbcGNoYXIoJ2EnKSwgbm90U3RhcnRPZklucHV0UF0pO1xyXG4gICAgZXhwZWN0KGxhdGVySW5UaGVTdHJlYW0ucnVuKFBvc2l0aW9uLmZyb21UZXh0KCdhYmMnKSkuaXNTdWNjZXNzKS50by5iZS50cnVlO1xyXG4gIH0pO1xyXG4gIGl0KCdkb2VzIG5vdCBjb25zdW1lIGNoYXJhY3RlcnMsIGJ1dCBpdCByZXR1cm5zIGFuIGVtcHR5IHN0cmluZyBhcyByZXN1bHQnLCAoKSA9PiB7XHJcbiAgICBjb25zdCBBQk5vdFN0YXJ0QyA9IHNlcXVlbmNlUChbcGNoYXIoJ0EnKSwgcGNoYXIoJ0InKSwgbm90U3RhcnRPZklucHV0UCwgcGNoYXIoJ0MnKV0pO1xyXG4gICAgY29uc3QgcGFyc2luZyA9IEFCTm90U3RhcnRDLnJ1bihQb3NpdGlvbi5mcm9tVGV4dCgnQUJDJykpO1xyXG4gICAgZXhwZWN0KHBhcnNpbmcudG9TdHJpbmcoKSkudG8uYmUuZXFsKCdWYWxpZGF0aW9uLlN1Y2Nlc3MoW1tBLEIsLENdLHJvdz0xO2NvbD0wO3Jlc3Q9XSknKTtcclxuICB9KTtcclxufSk7XHJcblxyXG5kZXNjcmliZSgnYSBwYXJzZXIgZm9yIHRoZSBlbmQgb2YgdGhlIGlucHV0IChlbmRPZklucHV0UCknLCAoKSA9PiB7XHJcbiAgaXQoJ3N1Y2NlZWRzIGF0IHRoZSBlbmQgb2YgdGhlIHN0cmVhbScsICgpID0+IHtcclxuICAgIGNvbnN0IGZpbmFsbHlJblRoZVN0cmVhbSA9IHNlcXVlbmNlUChbcGNoYXIoJ2EnKSwgcGNoYXIoJ2InKSwgZW5kT2ZJbnB1dFBdKTtcclxuICAgIGV4cGVjdChmaW5hbGx5SW5UaGVTdHJlYW0ucnVuKFBvc2l0aW9uLmZyb21UZXh0KCdhYicpKS5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XHJcbiAgfSk7XHJcbiAgaXQoJ2ZhaWxzIGhhbGZ3YXkgdGhyb3VnaCB0aGUgc3RyZWFtJywgKCkgPT4ge1xyXG4gICAgY29uc3QgbGF0ZXJJblRoZVN0cmVhbSA9IHNlcXVlbmNlUChbcGNoYXIoJ2EnKSwgZW5kT2ZJbnB1dFBdKTtcclxuICAgIGV4cGVjdChsYXRlckluVGhlU3RyZWFtLnJ1bihQb3NpdGlvbi5mcm9tVGV4dCgnYWJjJykpLmlzRmFpbHVyZSkudG8uYmUudHJ1ZTtcclxuICB9KTtcclxufSk7XHJcblxyXG5kZXNjcmliZSgnYSBwYXJzZXIgZm9yIE5PVCB0aGUgZW5kIG9mIHRoZSBpbnB1dCAobm90RW5kT2ZJbnB1dFApJywgKCkgPT4ge1xyXG4gIGl0KCdmYWlscyBhdCB0aGUgZW5kIG9mIHRoZSBzdHJlYW0nLCAoKSA9PiB7XHJcbiAgICBjb25zdCBub3RGaW5hbGx5SW5UaGVTdHJlYW0gPSBzZXF1ZW5jZVAoW3BjaGFyKCdhJyksIG5vdEVuZE9mSW5wdXRQXSk7XHJcbiAgICBleHBlY3Qobm90RmluYWxseUluVGhlU3RyZWFtLnJ1bihQb3NpdGlvbi5mcm9tVGV4dCgnYScpKS5pc0ZhaWx1cmUpLnRvLmJlLnRydWU7XHJcbiAgfSk7XHJcbiAgaXQoJ3N1Y2NlZWRzIGhhbGZ3YXkgdGhyb3VnaCB0aGUgc3RyZWFtJywgKCkgPT4ge1xyXG4gICAgY29uc3QgQUJub3RFbmRDID0gc2VxdWVuY2VQKFtwY2hhcignQScpLCBwY2hhcignQicpLCBub3RFbmRPZklucHV0UCwgcGNoYXIoJ0MnKV0ubWFwKGxvZ1ApKTtcclxuICAgIGV4cGVjdChBQm5vdEVuZEMucnVuKFBvc2l0aW9uLmZyb21UZXh0KCdBQkMnKSkuaXNTdWNjZXNzKS50by5iZS50cnVlO1xyXG4gIH0pO1xyXG4gIGl0KCdkb2VzIG5vdCBjb25zdW1lIGNoYXJhY3RlcnMsIGJ1dCBpdCByZXR1cm5zIGFuIGVtcHR5IHN0cmluZyBhcyByZXN1bHQnLCAoKSA9PiB7XHJcbiAgICBjb25zdCBBbm90RW5kQiA9IHNlcXVlbmNlUChbcGNoYXIoJ0EnKSwgbm90RW5kT2ZJbnB1dFAsIHBjaGFyKCdCJyldLm1hcChsb2dQKSk7XHJcbiAgICBleHBlY3QoQW5vdEVuZEIucnVuKFBvc2l0aW9uLmZyb21UZXh0KCdBQicpKS50b1N0cmluZygpKS50by5iZS5lcWwoJ1ZhbGlkYXRpb24uU3VjY2VzcyhbW0EsLEJdLHJvdz0xO2NvbD0wO3Jlc3Q9XSknKTtcclxuICB9KTtcclxufSk7XHJcblxyXG5kZXNjcmliZSgnYSBwYXJzZXIgdGhhdCB0cmltcyBwYXJzaW5ncyAodHJpbVApJywgKCkgPT4ge1xyXG4gIGl0KCdjYW4gaWdub3JlIHdoaXRlc3BhY2VzIGFyb3VuZCBhIHNpbmdsZSBjaGFyICh0cmltbWVyID0gdHJpbVAocGNoYXIoXFwnYVxcJykpKScsICgpID0+IHtcclxuICAgIGNvbnN0IHRyaW1tZXIgPSB0cmltUChwY2hhcignYScpKTtcclxuICAgIGV4cGVjdCh0cmltbWVyLnJ1bignICBhICAgICcpLnRvU3RyaW5nKCkpXHJcbiAgICAgIC50by5iZS5lcWwoJ1ZhbGlkYXRpb24uU3VjY2VzcyhbYSxyb3c9MTtjb2w9MDtyZXN0PV0pJyk7XHJcbiAgfSk7XHJcbiAgaXQoJ2NhbiBpZ25vcmUgd2hpdGVzcGFjZXMgYXJvdW5kIGEgc2VxdWVuY2Ugb2YgdHdvIGNoYXJzICh0cmltbWVyID0gdHJpbVAocGNoYXIoXFwnYVxcJykuYW5kVGhlbihwY2hhcihcXCdiXFwnKSkpJywgKCkgPT4ge1xyXG4gICAgY29uc3QgdHJpbW1lciA9IHRyaW1QKHBjaGFyKCdhJykuYW5kVGhlbihwY2hhcignYicpKSk7XHJcbiAgICBleHBlY3QodHJpbW1lci5ydW4oJyAgYWIgICAgJykudG9TdHJpbmcoKSlcclxuICAgICAgLnRvLmJlLmVxbCgnVmFsaWRhdGlvbi5TdWNjZXNzKFtbYSxiXSxyb3c9MTtjb2w9MDtyZXN0PV0pJyk7XHJcbiAgfSk7XHJcbn0pO1xyXG5cclxuZGVzY3JpYmUoJ2EgcGFyc2VyIGZvciBhIHNwZWNpZmljIHdvcmQgKHB3b3JkKScsICgpID0+IHtcclxuICBpdCgnZGV0ZWN0cyBhbmQgaWdub3JlcyB3aGl0ZXNwYWNlcyBhcm91bmQgaXQnLCAoKSA9PiB7XHJcbiAgICBjb25zdCBtYXJjb1BhcnNlciA9IHB3b3JkKCdtYXJjbycpO1xyXG4gICAgY29uc3QgbWFyY29QYXJzaW5nID0gbWFyY29QYXJzZXIucnVuKCcgIG1hcmNvIGNpYW8nKTtcclxuICAgIGV4cGVjdChtYXJjb1BhcnNpbmcuaXNTdWNjZXNzKS50by5iZS50cnVlO1xyXG4gICAgZXhwZWN0KG1hcmNvUGFyc2luZy50b1N0cmluZygpKVxyXG4gICAgICAudG8uYmUuZXFsKCdWYWxpZGF0aW9uLlN1Y2Nlc3MoW1ttLGEscixjLG9dLHJvdz0wO2NvbD04O3Jlc3Q9Y2lhb10pJyk7XHJcbiAgfSk7XHJcbiAgaXQoJ2hhcyBubyBwcm9ibGVtIGlmIHRoZSB3aGl0ZXNwYWNlcyBhcmVuXFwndCB0aGVyZScsICgpID0+IHtcclxuICAgIGNvbnN0IG1hcmNvUGFyc2VyID0gcHdvcmQoJ21hcmNvJyk7XHJcbiAgICBjb25zdCBtYXJjb1BhcnNpbmcgPSBtYXJjb1BhcnNlci5ydW4oJ21hcmNvY2lhbycpO1xyXG4gICAgZXhwZWN0KG1hcmNvUGFyc2luZy5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XHJcbiAgICBleHBlY3QobWFyY29QYXJzaW5nLnRvU3RyaW5nKCkpXHJcbiAgICAgIC50by5iZS5lcWwoJ1ZhbGlkYXRpb24uU3VjY2VzcyhbW20sYSxyLGMsb10scm93PTA7Y29sPTU7cmVzdD1jaWFvXSknKTtcclxuICB9KTtcclxufSk7XHJcblxyXG5kZXNjcmliZSgnYSBwYXJzaW5nIGZ1bmN0aW9uIGZvciB6ZXJvIG9yIG1vcmUgb2NjdXJyZW5jZXMgKHplcm9Pck1vcmUpJywgKCkgPT4ge1xyXG4gIGl0KCdjYW4gcGFyc2UgYSBjaGFyIHplcm8gdGltZXMgKHplcm9Pck1vcmVQYXJzaW5nRnVuY3Rpb24gPSB6ZXJvT3JNb3JlKHBjaGFyKFxcJ21cXCcpKSknLCAoKSA9PiB7XHJcbiAgICBjb25zdCB6ZXJvT3JNb3JlUGFyc2luZ0Z1bmN0aW9uID0gemVyb09yTW9yZShwY2hhcignbScpKTtcclxuICAgIGNvbnN0IHBhcnNpbmcgPSB6ZXJvT3JNb3JlUGFyc2luZ0Z1bmN0aW9uKHRleHQoJ2FyY28nKSk7XHJcbiAgICBleHBlY3QocGFyc2luZy5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XHJcbiAgICBleHBlY3QocGFyc2luZy50b1N0cmluZygpKS50by5iZS5lcWwoJ1ZhbGlkYXRpb24uU3VjY2VzcyhbW10scm93PTA7Y29sPTA7cmVzdD1hcmNvXSknKTtcclxuICB9KTtcclxuICBpdCgnY2FuIHBhcnNlIGEgY2hhciBtYW55IHRpbWVzICh6ZXJvT3JNb3JlUGFyc2luZ0Z1bmN0aW9uID0gemVyb09yTW9yZShwY2hhcihcXCdtXFwnKSkpJywgKCkgPT4ge1xyXG4gICAgY29uc3QgemVyb09yTW9yZVBhcnNpbmdGdW5jdGlvbiA9IHplcm9Pck1vcmUocGNoYXIoJ20nKSk7XHJcbiAgICBjb25zdCBwYXJzaW5nID0gemVyb09yTW9yZVBhcnNpbmdGdW5jdGlvbih0ZXh0KCdtbW1hcmNvJykpO1xyXG4gICAgZXhwZWN0KHBhcnNpbmcuaXNTdWNjZXNzKS50by5iZS50cnVlO1xyXG4gICAgZXhwZWN0KHBhcnNpbmcudG9TdHJpbmcoKSkudG8uYmUuZXFsKCdWYWxpZGF0aW9uLlN1Y2Nlc3MoW1ttLG0sbV0scm93PTA7Y29sPTM7cmVzdD1hcmNvXSknKTtcclxuICB9KTtcclxuICBpdCgnY2FuIHBhcnNlIGEgY2hhciBzZXF1ZW5jZSB6ZXJvIHRpbWVzICh6ZXJvT3JNb3JlUGFyc2luZ0Z1bmN0aW9uID0gemVyb09yTW9yZShwc3RyaW5nKFxcJ21hcmNvXFwnKSkpJywgKCkgPT4ge1xyXG4gICAgY29uc3QgemVyb09yTW9yZVBhcnNpbmdGdW5jdGlvbiA9IHplcm9Pck1vcmUocHN0cmluZygnbWFyY28nKSk7XHJcbiAgICBjb25zdCBwYXJzaW5nID0gemVyb09yTW9yZVBhcnNpbmdGdW5jdGlvbih0ZXh0KCd4bWFyY29tYXJjb2NpYW8nKSk7XHJcbiAgICBleHBlY3QocGFyc2luZy5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XHJcbiAgICBleHBlY3QocGFyc2luZy50b1N0cmluZygpKS50by5iZS5lcWwoJ1ZhbGlkYXRpb24uU3VjY2VzcyhbW10scm93PTA7Y29sPTA7cmVzdD14bWFyY29tYXJjb2NpYW9dKScpO1xyXG4gIH0pO1xyXG4gIGl0KCdjYW4gcGFyc2UgYSBjaGFyIHNlcXVlbmNlIG1hbnkgdGltZXMgKHplcm9Pck1vcmVQYXJzaW5nRnVuY3Rpb24gPSB6ZXJvT3JNb3JlKHBzdHJpbmcoXFwnbWFyY29cXCcpKSknLCAoKSA9PiB7XHJcbiAgICBjb25zdCB6ZXJvT3JNb3JlUGFyc2luZ0Z1bmN0aW9uID0gemVyb09yTW9yZShwc3RyaW5nKCdtYXJjbycpKTtcclxuICAgIGNvbnN0IHBhcnNpbmcgPSB6ZXJvT3JNb3JlUGFyc2luZ0Z1bmN0aW9uKHRleHQoJ21hcmNvbWFyY29jaWFvJykpO1xyXG4gICAgZXhwZWN0KHBhcnNpbmcuaXNTdWNjZXNzKS50by5iZS50cnVlO1xyXG4gICAgZXhwZWN0KHBhcnNpbmcudG9TdHJpbmcoKSlcclxuICAgICAgLnRvLmJlLmVxbCgnVmFsaWRhdGlvbi5TdWNjZXNzKFtbW20sYSxyLGMsb10sW20sYSxyLGMsb11dLHJvdz0wO2NvbD0xMDtyZXN0PWNpYW9dKScpO1xyXG4gIH0pO1xyXG59KTtcclxuXHJcbmRlc2NyaWJlKCdhIHBhcnNlciBmb3IgemVybyBvciBtb3JlIG9jY3VycmVuY2VzJywgKCkgPT4ge1xyXG4gIGl0KCdjYW4gcGFyc2UgYSBjaGFyIHplcm8gdGltZXMgKHplcm9Pck1vcmVQYXJzZXIgPSBtYW55KHBjaGFyKFxcJ21cXCcpKSknLCAoKSA9PiB7XHJcbiAgICBjb25zdCB6ZXJvT3JNb3JlUGFyc2VyID0gbWFueShwY2hhcignbScpKTtcclxuICAgIGNvbnN0IHBhcnNpbmcgPSB6ZXJvT3JNb3JlUGFyc2VyLnJ1bih0ZXh0KCdhcmNvJykpO1xyXG4gICAgZXhwZWN0KHBhcnNpbmcuaXNTdWNjZXNzKS50by5iZS50cnVlO1xyXG4gICAgZXhwZWN0KHBhcnNpbmcudG9TdHJpbmcoKSkudG8uYmUuZXFsKCdWYWxpZGF0aW9uLlN1Y2Nlc3MoW1tdLHJvdz0wO2NvbD0wO3Jlc3Q9YXJjb10pJyk7XHJcbiAgfSk7XHJcbiAgaXQoJ2NhbiBwYXJzZSBhIGNoYXIgbWFueSB0aW1lcyBhbmQgcmV0dXJuIGFuIGFycmF5ICh6ZXJvT3JNb3JlUGFyc2VyID0gbWFueShwY2hhcihcXCdtXFwnKSkpJywgKCkgPT4ge1xyXG4gICAgY29uc3QgemVyb09yTW9yZVBhcnNlciA9IG1hbnkocGNoYXIoJ20nKSk7XHJcbiAgICBjb25zdCBwYXJzaW5nID0gemVyb09yTW9yZVBhcnNlci5ydW4odGV4dCgnbW1tYXJjbycpKTtcclxuICAgIGV4cGVjdChwYXJzaW5nLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcclxuICAgIGV4cGVjdChwYXJzaW5nLnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgnVmFsaWRhdGlvbi5TdWNjZXNzKFtbbSxtLG1dLHJvdz0wO2NvbD0zO3Jlc3Q9YXJjb10pJyk7XHJcbiAgfSk7XHJcbiAgaXQoJ2NhbiBwYXJzZSBhIGNoYXIgZXhhY3RseSBuIHRpbWVzIGFuZCByZXR1cm4gYW4gYXJyYXksIG9yIGZhaWwgKGV4YWN0bHlUaHJlZSA9IG1hbnkocGNoYXIoXFwnbVxcJyksIDMpKScsICgpID0+IHtcclxuICAgIGNvbnN0IGV4YWN0bHlUaHJlZSA9IG1hbnkocGNoYXIoJ20nKSwgMyk7XHJcbiAgICBsZXQgcGFyc2luZyA9IGV4YWN0bHlUaHJlZS5ydW4odGV4dCgnbW1tYXJjbycpKTtcclxuICAgIGV4cGVjdChwYXJzaW5nLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcclxuICAgIGV4cGVjdChwYXJzaW5nLnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgnVmFsaWRhdGlvbi5TdWNjZXNzKFtbbSxtLG1dLHJvdz0wO2NvbD0zO3Jlc3Q9YXJjb10pJyk7XHJcbiAgICBwYXJzaW5nID0gZXhhY3RseVRocmVlLnJ1bih0ZXh0KCdtbW1tYXJjbycpKTtcclxuICAgIGV4cGVjdChwYXJzaW5nLmlzRmFpbHVyZSkudG8uYmUudHJ1ZTtcclxuICAgIGV4cGVjdChwYXJzaW5nLnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgnVmFsaWRhdGlvbi5GYWlsdXJlKFttYW55IHBjaGFyX20gdGltZXM9Myx0aW1lcyBwYXJhbSB3YW50ZWQgMzsgZ290IDQscm93PTA7Y29sPTA7cmVzdD1tbW1tYXJjb10pJyk7XHJcbiAgfSk7XHJcbiAgaXQoJ2NhbiBwYXJzZSBhIGNoYXIgbWFueSB0aW1lcyBhbmQgcmV0dXJuIGEgc3RyaW5nICh6ZXJvT3JNb3JlUGFyc2VyID0gbWFueUNoYXJzKHBjaGFyKFxcJ21cXCcpKSknLCAoKSA9PiB7XHJcbiAgICBjb25zdCB6ZXJvT3JNb3JlUGFyc2VyID0gbWFueUNoYXJzKHBjaGFyKCdtJykpO1xyXG4gICAgY29uc3QgcGFyc2luZyA9IHplcm9Pck1vcmVQYXJzZXIucnVuKHRleHQoJ21tbWFyY28nKSk7XHJcbiAgICBleHBlY3QocGFyc2luZy5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XHJcbiAgICBleHBlY3QocGFyc2luZy50b1N0cmluZygpKS50by5iZS5lcWwoJ1ZhbGlkYXRpb24uU3VjY2VzcyhbbW1tLHJvdz0wO2NvbD0zO3Jlc3Q9YXJjb10pJyk7XHJcbiAgfSk7XHJcbiAgaXQoJ2NhbiBwYXJzZSBhIGNoYXIgZXhhY3RseSBuIHRpbWVzIGFuZCByZXR1cm4gYSBzdHJpbmcsIG9yIGZhaWwgKGV4YWN0bHlUaHJlZSA9IG1hbnlDaGFycyhwY2hhcihcXCdtXFwnKSwgMykpJywgKCkgPT4ge1xyXG4gICAgY29uc3QgZXhhY3RseVRocmVlID0gbWFueUNoYXJzKHBjaGFyKCdtJyksIDMpO1xyXG4gICAgbGV0IHBhcnNpbmcgPSBleGFjdGx5VGhyZWUucnVuKHRleHQoJ21tbWFyY28nKSk7XHJcbiAgICBleHBlY3QocGFyc2luZy5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XHJcbiAgICBleHBlY3QocGFyc2luZy50b1N0cmluZygpKS50by5iZS5lcWwoJ1ZhbGlkYXRpb24uU3VjY2VzcyhbbW1tLHJvdz0wO2NvbD0zO3Jlc3Q9YXJjb10pJyk7XHJcbiAgICBwYXJzaW5nID0gZXhhY3RseVRocmVlLnJ1bih0ZXh0KCdtbW1tYXJjbycpKTtcclxuICAgIGV4cGVjdChwYXJzaW5nLmlzRmFpbHVyZSkudG8uYmUudHJ1ZTtcclxuICAgIGV4cGVjdChwYXJzaW5nLnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgnVmFsaWRhdGlvbi5GYWlsdXJlKFttYW55Q2hhcnMgcGNoYXJfbSB0aW1lcz0zLHRpbWVzIHBhcmFtIHdhbnRlZCAzOyBnb3QgNCxyb3c9MDtjb2w9MDtyZXN0PW1tbW1hcmNvXSknKTtcclxuICB9KTtcclxuICBpdCgnY2FuIHBhcnNlIGEgY2hhciBzZXF1ZW5jZSB6ZXJvIHRpbWVzICh6ZXJvT3JNb3JlUGFyc2VyID0gbWFueShwc3RyaW5nKFxcJ21hcmNvXFwnKSkpJywgKCkgPT4ge1xyXG4gICAgY29uc3QgemVyb09yTW9yZVBhcnNlciA9IG1hbnkocHN0cmluZygnbWFyY28nKSk7XHJcbiAgICBjb25zdCBwYXJzaW5nID0gemVyb09yTW9yZVBhcnNlci5ydW4odGV4dCgneG1hcmNvbWFyY29jaWFvJykpO1xyXG4gICAgZXhwZWN0KHBhcnNpbmcuaXNTdWNjZXNzKS50by5iZS50cnVlO1xyXG4gICAgZXhwZWN0KHBhcnNpbmcudG9TdHJpbmcoKSkudG8uYmUuZXFsKCdWYWxpZGF0aW9uLlN1Y2Nlc3MoW1tdLHJvdz0wO2NvbD0wO3Jlc3Q9eG1hcmNvbWFyY29jaWFvXSknKTtcclxuICB9KTtcclxuICBpdCgnY2FuIHBhcnNlIGEgY2hhciBzZXF1ZW5jZSBtYW55IHRpbWVzICh6ZXJvT3JNb3JlUGFyc2VyID0gbWFueShwc3RyaW5nKFxcJ21hcmNvXFwnKSkpJywgKCkgPT4ge1xyXG4gICAgY29uc3QgemVyb09yTW9yZVBhcnNlciA9IG1hbnkocHN0cmluZygnbWFyY28nKSk7XHJcbiAgICBjb25zdCBwYXJzaW5nID0gemVyb09yTW9yZVBhcnNlci5ydW4oJ21hcmNvbWFyY29jaWFvJyk7XHJcbiAgICBleHBlY3QocGFyc2luZy5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XHJcbiAgICBleHBlY3QocGFyc2luZy50b1N0cmluZygpKVxyXG4gICAgICAudG8uYmUuZXFsKCdWYWxpZGF0aW9uLlN1Y2Nlc3MoW1tbbSxhLHIsYyxvXSxbbSxhLHIsYyxvXV0scm93PTA7Y29sPTEwO3Jlc3Q9Y2lhb10pJyk7XHJcbiAgfSk7XHJcbiAgaXQoJ2NhbiBwYXJzZSB3aGl0ZXNwYWNlcyEhICh3aGl0ZXNQYXJzZXIgPSBtYW55KGFueU9mKHdoaXRlcykpKScsICgpID0+IHtcclxuICAgIGNvbnN0IHdoaXRlc1BhcnNlciA9IG1hbnkoYW55T2Yod2hpdGVzKSk7XHJcbiAgICBjb25zdCB0d29Xb3JkcyA9IHNlcXVlbmNlUChbcHN0cmluZygnY2lhbycpLCB3aGl0ZXNQYXJzZXIsIHBzdHJpbmcoJ21hbW1hJyldKTtcclxuICAgIGxldCBwYXJzaW5nID0gdHdvV29yZHMucnVuKCdjaWFvbWFtbWFYJyk7XHJcbiAgICBleHBlY3QocGFyc2luZy50b1N0cmluZygpKVxyXG4gICAgICAudG8uYmUuZXFsKCdWYWxpZGF0aW9uLlN1Y2Nlc3MoW1tbYyxpLGEsb10sW10sW20sYSxtLG0sYV1dLHJvdz0wO2NvbD05O3Jlc3Q9WF0pJyk7XHJcbiAgICBwYXJzaW5nID0gdHdvV29yZHMucnVuKCdjaWFvIG1hbW1hWCcpO1xyXG4gICAgZXhwZWN0KHBhcnNpbmcudG9TdHJpbmcoKSlcclxuICAgICAgLnRvLmJlLmVxbCgnVmFsaWRhdGlvbi5TdWNjZXNzKFtbW2MsaSxhLG9dLFsgXSxbbSxhLG0sbSxhXV0scm93PTA7Y29sPTEwO3Jlc3Q9WF0pJyk7XHJcbiAgICBwYXJzaW5nID0gdHdvV29yZHMucnVuKCdjaWFvICAgbWFtbWFYJyk7XHJcbiAgICBleHBlY3QocGFyc2luZy50b1N0cmluZygpKVxyXG4gICAgICAudG8uYmUuZXFsKCdWYWxpZGF0aW9uLlN1Y2Nlc3MoW1tbYyxpLGEsb10sWyAsICwgXSxbbSxhLG0sbSxhXV0scm93PTA7Y29sPTEyO3Jlc3Q9WF0pJyk7XHJcbiAgICBwYXJzaW5nID0gdHdvV29yZHMucnVuKCdjaWFvIFxcdCBtYW1tYVgnKTtcclxuICAgIGV4cGVjdChwYXJzaW5nLnRvU3RyaW5nKCkpXHJcbiAgICAgIC50by5iZS5lcWwoJ1ZhbGlkYXRpb24uU3VjY2VzcyhbW1tjLGksYSxvXSxbICxcXHQsIF0sW20sYSxtLG0sYV1dLHJvdz0wO2NvbD0xMjtyZXN0PVhdKScpO1xyXG4gIH0pO1xyXG59KTtcclxuXHJcbmRlc2NyaWJlKCdhIHBhcnNlciBmb3Igb25lIG9yIG1vcmUgb2NjdXJyZW5jZXMgKG1hbnkxLCBtYW55Q2hhcnMxKScsICgpID0+IHtcclxuICBpdCgnY2Fubm90IHBhcnNlIGEgY2hhciB6ZXJvIHRpbWVzIChvbmVPck1vcmVQYXJzZXIgPSBtYW55MShwY2hhcihcXCdtXFwnKSkpJywgKCkgPT4ge1xyXG4gICAgY29uc3Qgb25lT3JNb3JlUGFyc2VyID0gbWFueTEocGNoYXIoJ20nKSk7XHJcbiAgICBjb25zdCBwYXJzaW5nID0gb25lT3JNb3JlUGFyc2VyLnJ1bignYXJjbycpO1xyXG4gICAgZXhwZWN0KHBhcnNpbmcuaXNGYWlsdXJlKS50by5iZS50cnVlO1xyXG4gICAgZXhwZWN0KHBhcnNpbmcudG9TdHJpbmcoKSlcclxuICAgICAgLnRvLmJlLmVxbCgnVmFsaWRhdGlvbi5GYWlsdXJlKFttYW55MSBwY2hhcl9tLHdhbnRlZCBtOyBnb3QgYSxyb3c9MDtjb2w9MDtyZXN0PWFyY29dKScpO1xyXG4gIH0pO1xyXG4gIGl0KCdjYW4gcGFyc2UgYSBjaGFyIG1hbnkgdGltZXMgYW5kIHJldHVybiBhbiBhcnJheSAob25lT3JNb3JlUGFyc2VyID0gbWFueTEocGNoYXIoXFwnbVxcJykpKScsICgpID0+IHtcclxuICAgIGNvbnN0IG9uZU9yTW9yZVBhcnNlciA9IG1hbnkxKHBjaGFyKCdtJykpO1xyXG4gICAgY29uc3QgcGFyc2luZyA9IG9uZU9yTW9yZVBhcnNlci5ydW4oJ21tbWFyY28nKTtcclxuICAgIGV4cGVjdChwYXJzaW5nLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcclxuICAgIGV4cGVjdChwYXJzaW5nLnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgnVmFsaWRhdGlvbi5TdWNjZXNzKFtbbSxtLG1dLHJvdz0wO2NvbD0zO3Jlc3Q9YXJjb10pJyk7XHJcbiAgfSk7XHJcbiAgaXQoJ2NhbiBwYXJzZSBhIGNoYXIgbWFueSB0aW1lcyBhbmQgcmV0dXJuIGEgc3RyaW5nIChvbmVPck1vcmVQYXJzZXIgPSBtYW55Q2hhcnMxKHBjaGFyKFxcJ21cXCcpKSknLCAoKSA9PiB7XHJcbiAgICBjb25zdCBvbmVPck1vcmVQYXJzZXIgPSBtYW55Q2hhcnMxKHBjaGFyKCdtJykpO1xyXG4gICAgY29uc3QgcGFyc2luZyA9IG9uZU9yTW9yZVBhcnNlci5ydW4oJ21tbWFyY28nKTtcclxuICAgIGV4cGVjdChwYXJzaW5nLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcclxuICAgIGV4cGVjdChwYXJzaW5nLnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgnVmFsaWRhdGlvbi5TdWNjZXNzKFttbW0scm93PTA7Y29sPTM7cmVzdD1hcmNvXSknKTtcclxuICB9KTtcclxuICBpdCgnY2Fubm90IHBhcnNlIGEgY2hhciBzZXF1ZW5jZSB6ZXJvIHRpbWVzIChvbmVPck1vcmVQYXJzZXIgPSBtYW55MShwc3RyaW5nKFxcJ21hcmNvXFwnKSkpJywgKCkgPT4ge1xyXG4gICAgY29uc3Qgb25lT3JNb3JlUGFyc2VyID0gbWFueTEocHN0cmluZygnbWFyY28nKSk7XHJcbiAgICBjb25zdCBwYXJzaW5nID0gb25lT3JNb3JlUGFyc2VyLnJ1bigneG1hcmNvbWFyY29jaWFvJyk7XHJcbiAgICBleHBlY3QocGFyc2luZy5pc0ZhaWx1cmUpLnRvLmJlLnRydWU7XHJcbiAgICBleHBlY3QocGFyc2luZy50b1N0cmluZygpKVxyXG4gICAgICAudG8uYmUuZXFsKCdWYWxpZGF0aW9uLkZhaWx1cmUoW21hbnkxIHBzdHJpbmcgbWFyY28sd2FudGVkIG07IGdvdCB4LHJvdz0wO2NvbD0wO3Jlc3Q9eG1hcmNvbWFyY29jaWFvXSknKTtcclxuICB9KTtcclxuICBpdCgnY2FuIHBhcnNlIGEgY2hhciBzZXF1ZW5jZSBtYW55IHRpbWVzIChvbmVPck1vcmVQYXJzZXIgPSBtYW55MShwc3RyaW5nKFxcJ21hcmNvXFwnKSkpJywgKCkgPT4ge1xyXG4gICAgY29uc3Qgb25lT3JNb3JlUGFyc2VyID0gbWFueTEocHN0cmluZygnbWFyY28nKSk7XHJcbiAgICBjb25zdCBwYXJzaW5nID0gb25lT3JNb3JlUGFyc2VyLnJ1bignbWFyY29tYXJjb2NpYW8nKTtcclxuICAgIGV4cGVjdChwYXJzaW5nLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcclxuICAgIGV4cGVjdChwYXJzaW5nLnRvU3RyaW5nKCkpXHJcbiAgICAgIC50by5iZS5lcWwoJ1ZhbGlkYXRpb24uU3VjY2VzcyhbW1ttLGEscixjLG9dLFttLGEscixjLG9dXSxyb3c9MDtjb2w9MTA7cmVzdD1jaWFvXSknKTtcclxuICB9KTtcclxuICBpdCgnY2FuIHBhcnNlIGFuIGludGVnZXIsIG5vIG1hdHRlciBob3cgbGFyZ2UuLi4gKHBpbnQgPSBtYW55MShhbnlPZihkaWdpdHMpKSknLCAoKSA9PiB7XHJcbiAgICBjb25zdCBwaW50ID0gbWFueTEoYW55T2YoZGlnaXRzKSk7XHJcbiAgICBsZXQgcGFyc2luZyA9IHBpbnQucnVuKCcxMjM0NUEnKTtcclxuICAgIGV4cGVjdChwYXJzaW5nLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcclxuICAgIGV4cGVjdChwYXJzaW5nLnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgnVmFsaWRhdGlvbi5TdWNjZXNzKFtbMSwyLDMsNCw1XSxyb3c9MDtjb2w9NTtyZXN0PUFdKScpO1xyXG4gICAgcGFyc2luZyA9IHBpbnQucnVuKCcxQicpO1xyXG4gICAgZXhwZWN0KHBhcnNpbmcuaXNTdWNjZXNzKS50by5iZS50cnVlO1xyXG4gICAgZXhwZWN0KHBhcnNpbmcudG9TdHJpbmcoKSkudG8uYmUuZXFsKCdWYWxpZGF0aW9uLlN1Y2Nlc3MoW1sxXSxyb3c9MDtjb2w9MTtyZXN0PUJdKScpO1xyXG4gICAgcGFyc2luZyA9IHBpbnQucnVuKCdBMTIzNDUnKTtcclxuICAgIGV4cGVjdChwYXJzaW5nLmlzRmFpbHVyZSkudG8uYmUudHJ1ZTtcclxuICAgIGV4cGVjdChwYXJzaW5nLnRvU3RyaW5nKCkpXHJcbiAgICAgIC50by5iZS5lcWwoJ1ZhbGlkYXRpb24uRmFpbHVyZShbbWFueTEgYW55T2YgMDEyMzQ1Njc4OSxmYWlsLEExMjM0NV0pJyk7XHJcbiAgfSk7XHJcbiAgaXQoJ2NhbiBwYXJzZSBhbiBpbnRlZ2VyIGludG8gYSB0cnVlIGludGVnZXIgKHBpbnQgPSBtYW55MShhbnlPZihkaWdpdHMpKSknLCAoKSA9PiB7XHJcbiAgICBjb25zdCBwaW50ID0gbWFueTEoYW55T2YoZGlnaXRzKSlcclxuICAgICAgLmZtYXAobCA9PiBwYXJzZUludChsLnJlZHVjZSgoYWNjLCBjdXJyKSA9PiBhY2MgKyBjdXJyLCAnJyksIDEwKSk7XHJcbiAgICBjb25zdCBwYXJzaW5nID0gcGludC5ydW4oJzEyMzQ1QScpO1xyXG4gICAgZXhwZWN0KHBhcnNpbmcuaXNTdWNjZXNzKS50by5iZS50cnVlO1xyXG4gICAgZXhwZWN0KHBhcnNpbmcudmFsdWVbMF0pLnRvLmJlLmVxbCgxMjM0NSk7XHJcbiAgICBleHBlY3QocGFyc2luZy52YWx1ZVsxXS50b1N0cmluZygpKS50by5iZS5lcWwoJ3Jvdz0wO2NvbD01O3Jlc3Q9QScpO1xyXG4gIH0pO1xyXG59KTtcclxuXHJcbmRlc2NyaWJlKCdwYXJzZXJzIHRoYXQgY29uc2lkZXIgcHJlY2VkZW5jZXMgKHByZWNlZGVkQnlQLCBub3RQcmVjZWRlZEJ5UCwgZm9sbG93ZWRCeVAsIG5vdEZvbGxvd2VkQnlQKScsICgpID0+IHtcclxuICBkZXNjcmliZSgnY2FuIHBhcnNlIFggcHJlY2VkZWQgYnkgWSAoWGFmdGVyWSA9IHByZWNlZGVkQnlQKFxcJ1lcXCcsIFxcJ1hcXCcpKScsICgpID0+IHtcclxuICAgIGNvbnN0IFhhZnRlclkgPSBwcmVjZWRlZEJ5UCgnWScsICdYJyk7XHJcbiAgICBpdCgnZXZlbiBpZiBZIGhhcyBiZWVuIGNvbnN1bWVkIGJ5IHRoZSBwYXJzZXIgYmVmb3JlJywgKCkgPT4ge1xyXG4gICAgICBjb25zdCBZWHAgPSBtYW55MShjaG9pY2UoW3BjaGFyKCdZJyksIFhhZnRlclldKSk7XHJcbiAgICAgIGNvbnN0IHBhcnNpbmdZWCA9IFlYcC5ydW4odGV4dCgnWVgnKSk7XHJcbiAgICAgIGV4cGVjdChwYXJzaW5nWVguaXNTdWNjZXNzKS50by5iZS50cnVlO1xyXG4gICAgICBleHBlY3QocGFyc2luZ1lYLnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgnVmFsaWRhdGlvbi5TdWNjZXNzKFtbWSxYXSxyb3c9MTtjb2w9MDtyZXN0PV0pJyk7XHJcbiAgICB9KTtcclxuICAgIGl0KCdhbmQgaGFsdCB3aGVuIFggaXMgbm90IHByZWNlZGVkIGJ5IFkgKEFYcCA9IG1hbnkxKGNob2ljZShbcGNoYXIoXFwnQVxcJyksIFhhZnRlclldKSkpJywgKCkgPT4ge1xyXG4gICAgICBjb25zdCBBWHAgPSBtYW55MShjaG9pY2UoW3BjaGFyKCdBJyksIFhhZnRlclldKSk7XHJcbiAgICAgIGNvbnN0IHBhcnNpbmdBWCA9IEFYcC5ydW4odGV4dCgnQVgnKSk7XHJcbiAgICAgIGV4cGVjdChwYXJzaW5nQVguaXNTdWNjZXNzKS50by5iZS50cnVlO1xyXG4gICAgICBleHBlY3QocGFyc2luZ0FYLnZhbHVlWzFdLnJlc3QoKSkudG8uYmUuZXFsKCdYJyk7XHJcbiAgICB9KTtcclxuICAgIGl0KCdhbmQgZmFpbCB3aGVuIFggaXMgYXQgdGhlIHN0YXJ0IG9mIHRoZSBzdHJpbmcgKEFYcCA9IG1hbnkxKGNob2ljZShbcGNoYXIoXFwnQVxcJyksIFhhZnRlclldKSkpJywgKCkgPT4ge1xyXG4gICAgICBjb25zdCBBWHAgPSBtYW55MShjaG9pY2UoW3BjaGFyKCdBJyksIFhhZnRlclldKSk7XHJcbiAgICAgIGNvbnN0IHBhcnNpbmdBWCA9IEFYcC5ydW4odGV4dCgnWEEnKSk7XHJcbiAgICAgIGV4cGVjdChwYXJzaW5nQVguaXNGYWlsdXJlKS50by5iZS50cnVlO1xyXG4gICAgfSk7XHJcbiAgfSk7XHJcblxyXG4gIGRlc2NyaWJlKCdjYW4gcGFyc2UgWCBub3QgcHJlY2VkZWQgYnkgWSAoWG5vdEFmdGVyWSA9IG5vdFByZWNlZGVkQnlQKFxcJ1lcXCcsIFxcJ1hcXCcpKScsICgpID0+IHtcclxuICAgIGNvbnN0IFhub3RBZnRlclkgPSBub3RQcmVjZWRlZEJ5UCgnWScsICdYJyk7XHJcblxyXG4gICAgaXQoJ2V2ZW4gaWYgdGhlIHByZXZpb3VzIGNoYXIgaGFzIGJlZW4gY29uc3VtZWQgYnkgdGhlIHBhcnNlciBiZWZvcmUgKEFYcCA9IG1hbnkxKGNob2ljZShbcGNoYXIoXFwnQVxcJyksIFhub3RBZnRlclldKSkpJywgKCkgPT4ge1xyXG4gICAgICBjb25zdCBBWHAgPSBtYW55MShjaG9pY2UoW3BjaGFyKCdBJyksIFhub3RBZnRlclldKSk7XHJcbiAgICAgIGNvbnN0IHBhcnNpbmdBWCA9IEFYcC5ydW4odGV4dCgnQVgnKSk7XHJcbiAgICAgIGV4cGVjdChwYXJzaW5nQVguaXNTdWNjZXNzKS50by5iZS50cnVlO1xyXG4gICAgICBleHBlY3QocGFyc2luZ0FYLnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgnVmFsaWRhdGlvbi5TdWNjZXNzKFtbQSxYXSxyb3c9MTtjb2w9MDtyZXN0PV0pJyk7XHJcbiAgICB9KTtcclxuICAgIGl0KCdhbmQgaGFsdCB3aGVuIFggaXMgdGhlIGZpcnN0IGNoYXIgaW4gdGhlIHN0cmluZyAoQVhwID0gbWFueTEoY2hvaWNlKFtwY2hhcihcXCdBXFwnKSwgWG5vdEFmdGVyWV0pKSknLCAoKSA9PiB7XHJcbiAgICAgIGNvbnN0IEFYcCA9IG1hbnkxKGNob2ljZShbcGNoYXIoJ0EnKSwgWG5vdEFmdGVyWV0pKTtcclxuICAgICAgY29uc3QgcGFyc2luZ0FYID0gQVhwLnJ1bih0ZXh0KCdYQScpKTtcclxuICAgICAgZXhwZWN0KHBhcnNpbmdBWC5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XHJcbiAgICAgIGV4cGVjdChwYXJzaW5nQVgudG9TdHJpbmcoKSkudG8uYmUuZXFsKCdWYWxpZGF0aW9uLlN1Y2Nlc3MoW1tYLEFdLHJvdz0xO2NvbD0wO3Jlc3Q9XSknKTtcclxuICAgIH0pO1xyXG4gICAgaXQoJ2FuZCBoYWx0IHdoZW4gWCBpcyBwcmVjZWRlZCBieSBZIChZWHAgPSBtYW55MShjaG9pY2UoW3BjaGFyKFxcJ1lcXCcpLCBYbm90QWZ0ZXJZXSkpKScsICgpID0+IHtcclxuICAgICAgY29uc3QgWVhwID0gbWFueTEoY2hvaWNlKFtwY2hhcignWScpLCBYbm90QWZ0ZXJZXSkpO1xyXG4gICAgICBjb25zdCBwYXJzaW5nWVggPSBZWHAucnVuKHRleHQoJ1lYJykpO1xyXG4gICAgICBleHBlY3QocGFyc2luZ1lYLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcclxuICAgICAgZXhwZWN0KHBhcnNpbmdZWC52YWx1ZVsxXS5yZXN0KCkpLnRvLmJlLmVxbCgnWCcpO1xyXG4gICAgfSk7XHJcbiAgfSk7XHJcblxyXG4gIGRlc2NyaWJlKCdjYW4gcGFyc2UgWCBmb2xsb3dlZCBieSBZIChYYmVmb3JlWSA9IGZvbGxvd2VkQnlQKFxcJ1lcXCcsIFxcJ1hcXCcpKScsICgpID0+IHtcclxuICAgIGNvbnN0IFhiZWZvcmVZID0gZm9sbG93ZWRCeVAoJ1knLCAnWCcpO1xyXG4gICAgaXQoJ3dpdGhvdXQgY29uc3VtaW5nIHRoZSBjaGFyYWN0ZXInLCAoKSA9PiB7XHJcbiAgICAgIGNvbnN0IFhZcCA9IG1hbnkxKGNob2ljZShbWGJlZm9yZVksIHBjaGFyKCdZJyldKSk7XHJcbiAgICAgIGNvbnN0IHBhcnNpbmdYWSA9IFhZcC5ydW4odGV4dCgnWFknKSk7XHJcbiAgICAgIGV4cGVjdChwYXJzaW5nWFkuaXNTdWNjZXNzKS50by5iZS50cnVlO1xyXG4gICAgICBleHBlY3QocGFyc2luZ1hZLnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgnVmFsaWRhdGlvbi5TdWNjZXNzKFtbWCxZXSxyb3c9MTtjb2w9MDtyZXN0PV0pJyk7XHJcbiAgICB9KTtcclxuICAgIGl0KCdhbmQgZmFpbCB3aGVuIFggaXMgbm90IGZvbGxvd2VkIGJ5IFkgKFhBcCA9IG1hbnkxKGNob2ljZShbWGJlZm9yZVksIHBjaGFyKFxcJ0FcXCcpXSkpKScsICgpID0+IHtcclxuICAgICAgY29uc3QgWEFwID0gbWFueTEoY2hvaWNlKFtYYmVmb3JlWSwgcGNoYXIoJ0EnKV0pKTtcclxuICAgICAgY29uc3QgcGFyc2luZ1hBID0gWEFwLnJ1bih0ZXh0KCdYQScpKTtcclxuICAgICAgZXhwZWN0KHBhcnNpbmdYQS5pc0ZhaWx1cmUpLnRvLmJlLnRydWU7XHJcbiAgICAgIC8vIGV4cGVjdChwYXJzaW5nWEEudmFsdWVbMV0ucmVzdCgpKS50by5iZS5lcWwoJ1gnKTtcclxuICAgIH0pO1xyXG4gICAgaXQoJ2FuZCBmYWlsIHdoZW4gWCBpcyBhdCB0aGUgZW5kIG9mIHRoZSBzdHJpbmcgKEFYcCA9IG1hbnkxKGNob2ljZShbcGNoYXIoXFwnQVxcJyksIFhiZWZvcmVZXSkpKScsICgpID0+IHtcclxuICAgICAgY29uc3QgQVhwID0gbWFueTEoY2hvaWNlKFtwY2hhcignQScpLCBYYmVmb3JlWV0pKTtcclxuICAgICAgY29uc3QgcGFyc2luZ0FYID0gQVhwLnJ1bih0ZXh0KCdBWCcpKTtcclxuICAgICAgZXhwZWN0KHBhcnNpbmdBWC5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XHJcbiAgICAgIGV4cGVjdChwYXJzaW5nQVgudmFsdWVbMV0ucmVzdCgpKS50by5iZS5lcWwoJ1gnKTtcclxuICAgIH0pO1xyXG4gIH0pO1xyXG5cclxuICBkZXNjcmliZSgnY2FuIHBhcnNlIFggbm90IGZvbGxvd2VkIGJ5IFkgKFhub3RCZWZvcmVZID0gbm90Rm9sbG93ZWRCeVAoXFwnWVxcJywgXFwnWFxcJykpJywgKCkgPT4ge1xyXG4gICAgY29uc3QgWG5vdEJlZm9yZVkgPSBub3RGb2xsb3dlZEJ5UCgnWScsICdYJyk7XHJcblxyXG4gICAgaXQoJ3dpdGhvdXQgY29uc3VtaW5nIHRoZSBjaGFyYWN0ZXIgKFhBcCA9IG1hbnkxKGNob2ljZShbWG5vdEJlZm9yZVksIHBjaGFyKFxcJ0FcXCcpXSkpKScsICgpID0+IHtcclxuICAgICAgY29uc3QgWEFwID0gbWFueTEoY2hvaWNlKFtYbm90QmVmb3JlWSwgcGNoYXIoJ0EnKV0pKTtcclxuICAgICAgY29uc3QgcGFyc2luZ1hBID0gWEFwLnJ1bih0ZXh0KCdYQScpKTtcclxuICAgICAgZXhwZWN0KHBhcnNpbmdYQS5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XHJcbiAgICAgIGV4cGVjdChwYXJzaW5nWEEudG9TdHJpbmcoKSkudG8uYmUuZXFsKCdWYWxpZGF0aW9uLlN1Y2Nlc3MoW1tYLEFdLHJvdz0xO2NvbD0wO3Jlc3Q9XSknKTtcclxuICAgIH0pO1xyXG4gICAgaXQoJ2FuZCBzdWNjZWVkIHdoZW4gWCBpcyB0aGUgbGFzdCBjaGFyIGluIHRoZSBzdHJpbmcgKEFYcCA9IG1hbnkxKGNob2ljZShbcGNoYXIoXFwnQVxcJyksIFhub3RCZWZvcmVZXSkpKScsICgpID0+IHtcclxuICAgICAgY29uc3QgQVhwID0gbWFueTEoY2hvaWNlKFtwY2hhcignQScpLCBYbm90QmVmb3JlWV0pKTtcclxuICAgICAgY29uc3QgcGFyc2luZ0FYID0gQVhwLnJ1bih0ZXh0KCdBWCcpKTtcclxuICAgICAgZXhwZWN0KHBhcnNpbmdBWC5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XHJcbiAgICAgIGV4cGVjdChwYXJzaW5nQVgudG9TdHJpbmcoKSkudG8uYmUuZXFsKCdWYWxpZGF0aW9uLlN1Y2Nlc3MoW1tBLFhdLHJvdz0xO2NvbD0wO3Jlc3Q9XSknKTtcclxuICAgIH0pO1xyXG4gICAgaXQoJ2FuZCBoYWx0IHdoZW4gWCBpcyBmb2xsb3dlZCBieSBZIChBWFlwID0gbWFueTEoY2hvaWNlKFtwY2hhcihcXCdBXFwnKSwgWG5vdEJlZm9yZVldKSkpJywgKCkgPT4ge1xyXG4gICAgICBjb25zdCBBWFlwID0gbWFueTEoY2hvaWNlKFtwY2hhcignQScpLCBYbm90QmVmb3JlWV0pKTtcclxuICAgICAgY29uc3QgcGFyc2luZ0FYWSA9IEFYWXAucnVuKHRleHQoJ0FYWScpKTtcclxuICAgICAgZXhwZWN0KHBhcnNpbmdBWFkuaXNTdWNjZXNzKS50by5iZS50cnVlO1xyXG4gICAgICBleHBlY3QocGFyc2luZ0FYWS52YWx1ZVsxXS5yZXN0KCkpLnRvLmJlLmVxbCgnWFknKTtcclxuICAgIH0pO1xyXG4gIH0pO1xyXG59KTtcclxuXHJcbmRlc2NyaWJlKCdhIHBhcnNlciBmb3Igb3B0aW9uYWwgY2hhcmFjdGVycyAob3B0KScsICgpID0+IHtcclxuICBpdCgnY2FuIGNhcHR1cmUgb3Igbm90IGNhcHR1cmUgYSBkb3QgKG9wdERvdFRoZW5BID0gb3B0KHBjaGFyKFxcJy5cXCcpKS5hbmRUaGVuKHBjaGFyKFxcJ2FcXCcpKSknLCAoKSA9PiB7XHJcbiAgICBjb25zdCBvcHREb3RUaGVuQSA9IG9wdChwY2hhcignLicpKS5hbmRUaGVuKHBjaGFyKCdhJykpO1xyXG4gICAgZXhwZWN0KG9wdERvdFRoZW5BLnJ1bignLmFiYycpLnRvU3RyaW5nKCkpXHJcbiAgICAgIC50by5iZS5lcWwoJ1ZhbGlkYXRpb24uU3VjY2VzcyhbW01heWJlLkp1c3QoLiksYV0scm93PTA7Y29sPTI7cmVzdD1iY10pJyk7XHJcbiAgICBleHBlY3Qob3B0RG90VGhlbkEucnVuKCdhYmMnKS50b1N0cmluZygpKVxyXG4gICAgICAudG8uYmUuZXFsKCdWYWxpZGF0aW9uLlN1Y2Nlc3MoW1tNYXliZS5Ob3RoaW5nLGFdLHJvdz0wO2NvbD0xO3Jlc3Q9YmNdKScpO1xyXG4gIH0pO1xyXG4gIGl0KCdjYW4gY2FwdHVyZSBhIGRvdCBvciBwcm92aWRlIGEgZGVmYXVsdCBhbHRlcm5hdGl2ZSAob3B0RG90V2l0aERlZmF1bHRUaGVuQSA9IG9wdChwY2hhcihcXCcuXFwnKSwgXFwnQUxURVJOQVRJVkVcXCcpLmFuZFRoZW4ocGNoYXIoXFwnYVxcJykpKScsICgpID0+IHtcclxuICAgIGNvbnN0IG9wdERvdFdpdGhEZWZhdWx0VGhlbkEgPSBvcHQocGNoYXIoJy4nKSwgJ0FMVEVSTkFUSVZFJykuYW5kVGhlbihwY2hhcignYScpKTtcclxuICAgIGV4cGVjdChvcHREb3RXaXRoRGVmYXVsdFRoZW5BLnJ1bignYWJjJykudG9TdHJpbmcoKSlcclxuICAgICAgLnRvLmJlLmVxbCgnVmFsaWRhdGlvbi5TdWNjZXNzKFtbTWF5YmUuSnVzdChBTFRFUk5BVElWRSksYV0scm93PTA7Y29sPTE7cmVzdD1iY10pJyk7XHJcbiAgfSk7XHJcbiAgaXQoJ2NhbiBwYXJzZSBTSUdORUQgaW50ZWdlcnMhISEgKENIRUNLIFRISVMgT1VUISEpJywgKCkgPT4ge1xyXG4gICAgY29uc3QgcGludCA9IG1hbnkxKGFueU9mKGRpZ2l0cykpXHJcbiAgICAgIC5mbWFwKGwgPT4gcGFyc2VJbnQobC5yZWR1Y2UoKGFjYywgY3VycikgPT4gYWNjICsgY3VyciwgJycpLCAxMCkpO1xyXG4gICAgY29uc3QgcFNpZ25lZEludCA9IG9wdChwY2hhcignLScpKVxyXG4gICAgICAuYW5kVGhlbihwaW50KVxyXG4gICAgICAuZm1hcChvcHRTaWduTnVtYmVyUGFpciA9PiAoKG9wdFNpZ25OdW1iZXJQYWlyWzBdLmlzSnVzdCkgPyAtb3B0U2lnbk51bWJlclBhaXJbMV0gOiBvcHRTaWduTnVtYmVyUGFpclsxXSkpO1xyXG4gICAgZXhwZWN0KHBTaWduZWRJbnQucnVuKCcxMzI0MzU0NngnKS52YWx1ZVswXSkudG8uYmUuZXFsKDEzMjQzNTQ2KTtcclxuICAgIGV4cGVjdChwU2lnbmVkSW50LnJ1bignLTEzMjQzNTQ2eCcpLnZhbHVlWzBdKS50by5iZS5lcWwoLTEzMjQzNTQ2KTtcclxuICB9KTtcclxuICBpdCgnY2FuIGNhcHR1cmUgb3Igbm90IGNhcHR1cmUgYSB3aG9sZSBzdWJzdHJpbmcgKG9wdFN1YnN0cmluZyA9IG9wdChwc3RyaW5nKFxcJ21hcmNvXFwnKSkuYW5kVGhlbihwc3RyaW5nKFxcJ2ZhdXN0aW5lbGxpXFwnKSkpJywgKCkgPT4ge1xyXG4gICAgY29uc3Qgb3B0U3Vic3RyaW5nID0gb3B0KHBzdHJpbmcoJ21hcmNvJykpLmFuZFRoZW4ocHN0cmluZygnZmF1c3RpbmVsbGknKSk7XHJcbiAgICBleHBlY3Qob3B0U3Vic3RyaW5nLnJ1bignbWFyY29mYXVzdGluZWxsaXgnKS50b1N0cmluZygpKVxyXG4gICAgICAudG8uYmUuZXFsKCdWYWxpZGF0aW9uLlN1Y2Nlc3MoW1tNYXliZS5KdXN0KFttLGEscixjLG9dKSxbZixhLHUscyx0LGksbixlLGwsbCxpXV0scm93PTA7Y29sPTE2O3Jlc3Q9eF0pJyk7XHJcbiAgICBleHBlY3Qob3B0U3Vic3RyaW5nLnJ1bignZmF1c3RpbmVsbGl4JykudG9TdHJpbmcoKSlcclxuICAgICAgLnRvLmJlLmVxbCgnVmFsaWRhdGlvbi5TdWNjZXNzKFtbTWF5YmUuTm90aGluZyxbZixhLHUscyx0LGksbixlLGwsbCxpXV0scm93PTA7Y29sPTExO3Jlc3Q9eF0pJyk7XHJcbiAgfSk7XHJcbn0pO1xyXG5cclxuZGVzY3JpYmUoJ2EgY291cGxlIG9mIHJlc3VsdC1kaXNjYXJkaW5nIHBhcnNlcnMgKGRpc2NhcmRGaXJzdCwgZGlzY2FyZFNlY29uZCknLCAoKSA9PiB7XHJcbiAgaXQoJ2NhbiBkZWNpZGUgdG8gZGlzY2FyZCB0aGUgbWF0Y2hlcyBvZiB0aGUgZmlyc3Qgb25lIChkaXNjYXJkSW50ZWdlclNpZ24gPSBwY2hhcihcXCctXFwnKS5kaXNjYXJkRmlyc3QocGRpZ2l0KDgpKSknLCAoKSA9PiB7XHJcbiAgICBjb25zdCBkaXNjYXJkSW50ZWdlclNpZ24gPSBwY2hhcignLScpLmRpc2NhcmRGaXJzdChwZGlnaXQoOCkpO1xyXG4gICAgY29uc3QgcGFyc2luZyA9IGRpc2NhcmRJbnRlZ2VyU2lnbi5ydW4oJy04eCcpO1xyXG4gICAgZXhwZWN0KHBhcnNpbmcudG9TdHJpbmcoKSkudG8uYmUuZXFsKCdWYWxpZGF0aW9uLlN1Y2Nlc3MoWzgscm93PTA7Y29sPTI7cmVzdD14XSknKTtcclxuICB9KTtcclxuICBpdCgnY2FuIGRlY2lkZSB0byBkaXNjYXJkIHRoZSBtYXRjaGVzIG9mIHRoZSBzZWNvbmQgb25lIChkaXNjYXJkU3VmZml4ID0gcHN0cmluZyhcXCdtYXJjb1xcJykuZGlzY2FyZFNlY29uZChtYW55MShhbnlPZih3aGl0ZXMpKSkpJywgKCkgPT4ge1xyXG4gICAgY29uc3QgZGlzY2FyZFN1ZmZpeCA9IHBzdHJpbmcoJ21hcmNvJykuZGlzY2FyZFNlY29uZChtYW55MShhbnlPZih3aGl0ZXMpKSk7XHJcbiAgICBsZXQgcGFyc2luZyA9IGRpc2NhcmRTdWZmaXgucnVuKCdtYXJjbyBmYXVzdGluZWxsaScpO1xyXG4gICAgZXhwZWN0KHBhcnNpbmcudG9TdHJpbmcoKSkudG8uYmUuZXFsKCdWYWxpZGF0aW9uLlN1Y2Nlc3MoW1ttLGEscixjLG9dLHJvdz0wO2NvbD02O3Jlc3Q9ZmF1c3RpbmVsbGldKScpO1xyXG4gICAgcGFyc2luZyA9IGRpc2NhcmRTdWZmaXgucnVuKCdtYXJjbyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmF1c3RpbmVsbGknKTtcclxuICAgIGV4cGVjdChwYXJzaW5nLnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgnVmFsaWRhdGlvbi5TdWNjZXNzKFtbbSxhLHIsYyxvXSxyb3c9MDtjb2w9Mzc7cmVzdD1mYXVzdGluZWxsaV0pJyk7XHJcbiAgfSk7XHJcbn0pO1xyXG5cclxuZGVzY3JpYmUoJ2EgdGFwcGVyIGZvciBwYXJzZXJzICh0YXBQKScsICgpID0+IHtcclxuICBpdCgnY2FuIGRvIHRoaW5ncyB3aXRoIGEgcmVzdWx0IHRoYXRcXCdzIGdvaW5nIHRvIGJlIGRpc2NhcmRlZCcsICgpID0+IHtcclxuICAgIGNvbnN0IHRhcEludG9EaXNjYXJkSW50ZWdlclNpZ24gPSB0YXBQKHBjaGFyKCctJyksIHJlcyA9PiB7XHJcbiAgICAgIGV4cGVjdChyZXMpLnRvLmJlLmVxbCgnLScpO1xyXG4gICAgfSkuZGlzY2FyZEZpcnN0KHBkaWdpdCg4KSk7XHJcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tdW51c2VkLXZhcnNcclxuICAgIGNvbnN0IHBhcnNpbmcgPSB0YXBJbnRvRGlzY2FyZEludGVnZXJTaWduLnJ1bignLTh4Jyk7XHJcbiAgfSk7XHJcbn0pO1xyXG5cclxuZGVzY3JpYmUoJ2EgbG9nZ2VyIGZvciBwYXJzZXJzIChsb2dQKScsICgpID0+IHtcclxuICBjb25zdCBzdG9yZWRMb2cgPSBjb25zb2xlLmxvZztcclxuICBpdCgnY2FuIGxvZyBpbnRlcm1lZGlhdGUgcGFyc2luZyByZXN1bHRzJywgKCkgPT4ge1xyXG4gICAgY29uc29sZS5sb2cgPSBtc2cgPT4ge1xyXG4gICAgICBleHBlY3QobXNnKS50by5iZS5lcWwoJ3BjaGFyXy06LScpO1xyXG4gICAgfTtcclxuICAgIGNvbnN0IGxvZ0ludGVybWVkaWF0ZVJlc3VsdCA9IGxvZ1AocGNoYXIoJy0nKSlcclxuICAgICAgLmRpc2NhcmRGaXJzdChwZGlnaXQoOCkpO1xyXG4gICAgY29uc3QgcGFyc2luZyA9IGxvZ0ludGVybWVkaWF0ZVJlc3VsdC5ydW4oJy04eCcpO1xyXG4gICAgZXhwZWN0KHBhcnNpbmcudG9TdHJpbmcoKSkudG8uYmUuZXFsKCdWYWxpZGF0aW9uLlN1Y2Nlc3MoWzgscm93PTA7Y29sPTI7cmVzdD14XSknKTtcclxuICB9KTtcclxuICBpdCgnY2FuIGxvZyBhIHJlc3VsdCB0aGF0XFwncyBnb2luZyB0byBiZSBkaXNjYXJkZWQnLCAoKSA9PiB7XHJcbiAgICBjb25zb2xlLmxvZyA9IG1zZyA9PiB7XHJcbiAgICAgIGV4cGVjdChtc2cpLnRvLmJlLmVxbCgnbWFueTEgYW55T2YgIFxcdFxcblxccjpbICwgXScpO1xyXG4gICAgfTtcclxuICAgIGNvbnN0IGRpc2NhcmRTdWZmaXggPSBwc3RyaW5nKCdtYXJjbycpLmRpc2NhcmRTZWNvbmQobG9nUChtYW55MShhbnlPZih3aGl0ZXMpKSkpO1xyXG4gICAgY29uc3QgcGFyc2luZyA9IGRpc2NhcmRTdWZmaXgucnVuKCdtYXJjbyAgZmF1c3RpbmVsbGknKTtcclxuICAgIGV4cGVjdChwYXJzaW5nLnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgnVmFsaWRhdGlvbi5TdWNjZXNzKFtbbSxhLHIsYyxvXSxyb3c9MDtjb2w9NztyZXN0PWZhdXN0aW5lbGxpXSknKTtcclxuICB9KTtcclxuICBjb25zb2xlLmxvZyA9IHN0b3JlZExvZztcclxufSk7XHJcblxyXG5kZXNjcmliZSgncGFyc2luZyB3aGlsZSBkaXNjYXJkaW5nIGlucHV0IChBRFZBTkNFRCBTVFVGRiknLCAoKSA9PiB7XHJcbiAgaXQoJ2FsbG93cyB0byBleGNsdWRlIHBhcmVudGhlc2VzJywgKCkgPT4ge1xyXG4gICAgY29uc3QgaW5zaWRlUGFyZW5zID0gcGNoYXIoJygnKVxyXG4gICAgICAuZGlzY2FyZEZpcnN0KG1hbnkoYW55T2YobG93ZXJjYXNlcykpKVxyXG4gICAgICAuZGlzY2FyZFNlY29uZChwY2hhcignKScpKTtcclxuICAgIGV4cGVjdChpbnNpZGVQYXJlbnMucnVuKCcobWFyY28pJykudG9TdHJpbmcoKSlcclxuICAgICAgLnRvLmJlLmVxbCgnVmFsaWRhdGlvbi5TdWNjZXNzKFtbbSxhLHIsYyxvXSxyb3c9MTtjb2w9MDtyZXN0PV0pJyk7XHJcbiAgICBleHBlY3QoaW5zaWRlUGFyZW5zLnJ1bignKCknKS50b1N0cmluZygpKVxyXG4gICAgICAudG8uYmUuZXFsKCdWYWxpZGF0aW9uLlN1Y2Nlc3MoW1tdLHJvdz0xO2NvbD0wO3Jlc3Q9XSknKTtcclxuICB9KTtcclxuICBpdCgnLi4uZXZlbiB1c2luZyBhIHRhaWxvci1tYWRlIG1ldGhvZCBcXCdiZXR3ZWVuUGFyZW5zXFwnIChpbnNpZGVQYXJlbnMgPSBiZXR3ZWVuUGFyZW5zKHBzdHJpbmcoXFwnbWFyY29cXCcpKSknLCAoKSA9PiB7XHJcbiAgICBjb25zdCBpbnNpZGVQYXJlbnMgPSBiZXR3ZWVuUGFyZW5zKHBzdHJpbmcoJ21hcmNvJykpO1xyXG4gICAgZXhwZWN0KGluc2lkZVBhcmVucy5ydW4oJyhtYXJjbyknKS50b1N0cmluZygpKVxyXG4gICAgICAudG8uYmUuZXFsKCdWYWxpZGF0aW9uLlN1Y2Nlc3MoW1ttLGEscixjLG9dLHJvdz0xO2NvbD0wO3Jlc3Q9XSknKTtcclxuICB9KTtcclxuICBpdCgnY2hlcnJ5LXBpY2tpbmcgZWxlbWVudHMgc2VwYXJhdGVkIGJ5IHNlcGFyYXRvcnMgKHN1YnN0cmluZ3NXaXRoQ29tbWFzID0gbWFueShtYW55MShhbnlPZihsb3dlcmNhc2VzKSkuZGlzY2FyZFNlY29uZChwY2hhcihcXCcsXFwnKSkpKScsICgpID0+IHtcclxuICAgIGNvbnN0IHN1YnN0cmluZ3NXaXRoQ29tbWFzID0gbWFueShtYW55MShhbnlPZihsb3dlcmNhc2VzKSkuZGlzY2FyZFNlY29uZChwY2hhcignLCcpKSk7XHJcbiAgICBleHBlY3Qoc3Vic3RyaW5nc1dpdGhDb21tYXMucnVuKCdhLGIsY2QsMScpLnRvU3RyaW5nKCkpXHJcbiAgICAgIC50by5iZS5lcWwoJ1ZhbGlkYXRpb24uU3VjY2VzcyhbW1thXSxbYl0sW2MsZF1dLHJvdz0wO2NvbD03O3Jlc3Q9MV0pJyk7XHJcbiAgfSk7XHJcbiAgaXQoJy4uLmFsc28gd2hlbiBpbnNpZGUgYSBsaXN0cycsICgpID0+IHtcclxuICAgIGNvbnN0IHN1YnN0cmluZ3NXaXRoQ29tbWFzID0gbWFueShtYW55MShhbnlPZihsb3dlcmNhc2VzKSkuZGlzY2FyZFNlY29uZChwY2hhcignLCcpKSk7XHJcbiAgICBjb25zdCBsaXN0RWxlbWVudHMgPSBiZXR3ZWVuKHBjaGFyKCdbJyksIHN1YnN0cmluZ3NXaXRoQ29tbWFzLCBwY2hhcignXScpKTtcclxuICAgIGV4cGVjdChsaXN0RWxlbWVudHMucnVuKCdbYSxiLGNkLG1hcmNvLF0xJykudG9TdHJpbmcoKSlcclxuICAgICAgLnRvLmJlLmVxbCgnVmFsaWRhdGlvbi5TdWNjZXNzKFtbW2FdLFtiXSxbYyxkXSxbbSxhLHIsYyxvXV0scm93PTA7Y29sPTE1O3Jlc3Q9MV0pJyk7XHJcbiAgfSk7XHJcbiAgZGVzY3JpYmUoJ3RoYW5rcyB0byB0aGUgc3BlY2lmaWMgc2VwQnkxIG9wZXJhdG9yIChpbnRyb2R1Y3Rpb24gdG8gSlNPTiBwYXJzZXJzKScsICgpID0+IHtcclxuICAgIGNvbnN0IHZhbHVlc1AgPSBhbnlPZihsb3dlcmNhc2VzKTtcclxuICAgIGNvbnN0IGNvbW1hUCA9IHBjaGFyKCcsJyk7XHJcbiAgICBpdCgnY2hlcnJ5LXBpY2tpbmcgZWxlbWVudHMgc2VwYXJhdGVkIGJ5IHNlcGFyYXRvcnMnLCAoKSA9PiB7XHJcbiAgICAgIGV4cGVjdChzZXBCeTEodmFsdWVzUCwgY29tbWFQKS5ydW4oJ2EsYixjZCwxJykudG9TdHJpbmcoKSlcclxuICAgICAgICAudG8uYmUuZXFsKCdWYWxpZGF0aW9uLlN1Y2Nlc3MoW1tbYV0sW2JdLFtjLGRdXSxyb3c9MDtjb2w9NztyZXN0PTFdKScpO1xyXG4gICAgfSk7XHJcbiAgICBpdCgnLi4uYWxzbyB3aGVuIGluc2lkZSBhIGxpc3RzJywgKCkgPT4ge1xyXG4gICAgICBjb25zdCBsaXN0RWxlbWVudHMgPSBiZXR3ZWVuKHBjaGFyKCdbJyksIHNlcEJ5MSh2YWx1ZXNQLCBjb21tYVApLCBwY2hhcignXScpKTtcclxuICAgICAgZXhwZWN0KGxpc3RFbGVtZW50cy5ydW4oJ1thLGIsY2QsbWFyY28sXScpLnRvU3RyaW5nKCkpXHJcbiAgICAgICAgLnRvLmJlLmVxbCgnVmFsaWRhdGlvbi5TdWNjZXNzKFtbW2FdLFtiXSxbYyxkXSxbbSxhLHIsYyxvXV0scm93PTE7Y29sPTA7cmVzdD1dKScpO1xyXG4gICAgfSk7XHJcbiAgICBpdCgnLi4ubGlzdHMgd2l0aCBubyBlbGVtZW50cycsICgpID0+IHtcclxuICAgICAgY29uc3QgbGlzdEVsZW1lbnRzID0gYmV0d2VlbihwY2hhcignWycpLCBzZXBCeTEodmFsdWVzUCwgY29tbWFQKSwgcGNoYXIoJ10nKSk7XHJcbiAgICAgIGV4cGVjdChsaXN0RWxlbWVudHMucnVuKCdbXScpLnRvU3RyaW5nKCkpXHJcbiAgICAgICAgLnRvLmJlLmVxbCgnVmFsaWRhdGlvbi5TdWNjZXNzKFtbXSxyb3c9MTtjb2w9MDtyZXN0PV0pJyk7XHJcbiAgICB9KTtcclxuICAgIGl0KCcuLi5saXN0cyB3aXRoIGp1c3Qgb25lIGVsZW1lbnQnLCAoKSA9PiB7XHJcbiAgICAgIGNvbnN0IGxpc3RFbGVtZW50cyA9IGJldHdlZW4ocGNoYXIoJ1snKSwgc2VwQnkxKHZhbHVlc1AsIGNvbW1hUCksIHBjaGFyKCddJykpO1xyXG4gICAgICBleHBlY3QobGlzdEVsZW1lbnRzLnJ1bignW2FdJykudG9TdHJpbmcoKSlcclxuICAgICAgICAudG8uYmUuZXFsKCdWYWxpZGF0aW9uLlN1Y2Nlc3MoW1tbYV1dLHJvdz0xO2NvbD0wO3Jlc3Q9XSknKTtcclxuICAgIH0pO1xyXG4gIH0pO1xyXG59KTtcclxuIl19