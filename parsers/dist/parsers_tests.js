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
    this.timeout(50000000000);
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
      var valuesP = (0, _parsers.many1)((0, _parsers.anyOf)(lowercases));
      var commaP = (0, _parsers.pchar)(',');
      it('cherry-picking 1+ elements separated by separators', function () {
        // debugger;
        var result = (0, _parsers.sepBy1)(valuesP, commaP).run('a,b,cd').toString();
        (0, _chai.expect)(result).to.be.eql('Validation.Success([[[a],[b],[c,d]],row=1;col=0;rest=])');
      });
      it('but unable to cherry-pick 0+ elements separated by separators', function () {
        var result = (0, _parsers.sepBy1)(valuesP, commaP).run('');
        (0, _chai.expect)(result.isFailure).to.be.true;
      });
      describe('also able to handle lists', function () {
        var listElements = (0, _parsers.between)((0, _parsers.pchar)('['), (0, _parsers.sepBy1)(valuesP, commaP), (0, _parsers.pchar)(']'));
        it('...lists with many elements', function () {
          var result = listElements.run('[a,b,cd,marco]').toString();
          (0, _chai.expect)(result).to.be.eql('Validation.Success([[[a],[b],[c,d],[m,a,r,c,o]],row=1;col=0;rest=])');
        });
        it('...lists with just one element', function () {
          var result = listElements.run('[a]').toString();
          (0, _chai.expect)(result).to.be.eql('Validation.Success([[[a]],row=1;col=0;rest=])');
        });
        it('...but unable to handle lists with no elements', function () {
          var result = listElements.run('[]');
          (0, _chai.expect)(result.isFailure).to.be.true;
        });
      });
    });
    describe('thanks to the specific sepBy operator (introduction to JSON parsers)', function () {
      var valuesP = (0, _parsers.many1)((0, _parsers.anyOf)(lowercases));
      var commaP = (0, _parsers.pchar)(',');
      it('cherry-picking 0+ elements separated by separators', function () {
        // debugger;
        var result = (0, _parsers.sepBy)(valuesP, commaP).run('a,b,cd').toString();
        (0, _chai.expect)(result).to.be.eql('Validation.Success([[[a],[b],[c,d]],row=1;col=0;rest=])');
      });
      it('still able to cherry-pick 0+ elements separated by separators', function () {
        var result = (0, _parsers.sepBy)(valuesP, commaP).run(';');
        var resString = result.toString();
        (0, _chai.expect)(resString).to.be.eql('Validation.Success([[],;])'); // WHY???!!!???!!!
      });
      describe('also able to handle lists', function () {
        var listElements = (0, _parsers.between)((0, _parsers.pchar)('['), (0, _parsers.sepBy)(valuesP, commaP), (0, _parsers.pchar)(']'));
        it('...lists with many elements', function () {
          var result = listElements.run('[a,b,cd,marco]').toString();
          (0, _chai.expect)(result).to.be.eql('Validation.Success([[[a],[b],[c,d],[m,a,r,c,o]],row=1;col=0;rest=])');
        });
        it('...lists with just one element', function () {
          var result = listElements.run('[a]').toString();
          (0, _chai.expect)(result).to.be.eql('Validation.Success([[[a]],row=1;col=0;rest=])');
        });
        it('...still able to handle lists with no elements', function () {
          var result = listElements.run('[]');
          var resString = result.toString();
          (0, _chai.expect)(resString).to.be.eql('Validation.Success([[],row=1;col=0;rest=])');
        });
      });
    });
  });
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2pzLXNwZWMvcGFyc2Vyc190ZXN0cy5qcyJdLCJuYW1lcyI6WyJsb3dlcmNhc2VzIiwidXBwZXJjYXNlcyIsImRpZ2l0cyIsIndoaXRlcyIsInRleHQiLCJQb3NpdGlvbiIsImZyb21UZXh0IiwiZGVzY3JpYmUiLCJwYXJzZXJBIiwiaXQiLCJwYXJzaW5nQSIsInZhbHVlIiwidG8iLCJiZSIsImVxbCIsInJlc3QiLCJpc1N1Y2Nlc3MiLCJ0cnVlIiwicGFyc2luZ0IiLCJpc0ZhaWx1cmUiLCJwYXJzZXIxIiwicGFyc2luZzEiLCJwYXJzaW5nMiIsInBhcnNpbmczIiwicnVuIiwibWFwcGluZ1BhcnNlciIsIngiLCJ0b1VwcGVyQ2FzZSIsIm1hcHBlZFBhcnNpbmdBIiwiZm1hcCIsInBhcnNlckFhbmRCIiwicGFyc2luZ0FhbmRCIiwidG9TdHJpbmciLCJwYXJzZXJBb3JCIiwicGFyc2luZ0FvckIiLCJwYWlyQWRkZXIiLCJ5IiwiYWJjUCIsInBhcnNpbmciLCJhbmRUaGVuIiwicGFyc2VEaWdpdCIsInRocmVlRGlnaXRzIiwiYmVmb3JlIiwidW5wYWNrZXIiLCJ6IiwidGhyZWVEaWdpdHNJbXBsIiwidGhyZWVEaWdpdHNJbnN0IiwicGFyc2Vyc0Nob2ljZSIsInBhcnNpbmdDaG9pY2UiLCJsb3dlcmNhc2VzUGFyc2VyIiwidXBwZXJjYXNlc1BhcnNlciIsImRpZ2l0c1BhcnNlciIsImFkZFN0cmluZ3MiLCJBcGx1c0IiLCJhZGREaWdpdHMiLCJhZGRQYXJzZXIiLCJhYmNQYXJzZXIiLCJtYXBwZWRBYmNQYXJzZXIiLCJhIiwiam9pbiIsIm1hcmNvUGFyc2VyIiwibWFyY29QYXJzaW5nIiwid2hhdGV2ZXIiLCJzdWNjZWVkUCIsImZhaWxQIiwic3RhcnRPZklucHV0UCIsImxhdGVySW5UaGVTdHJlYW0iLCJzdGFydEFCQyIsIm5vdFN0YXJ0T2ZJbnB1dFAiLCJBQk5vdFN0YXJ0QyIsImZpbmFsbHlJblRoZVN0cmVhbSIsImVuZE9mSW5wdXRQIiwibm90RmluYWxseUluVGhlU3RyZWFtIiwibm90RW5kT2ZJbnB1dFAiLCJBQm5vdEVuZEMiLCJtYXAiLCJsb2dQIiwiQW5vdEVuZEIiLCJ0cmltbWVyIiwiemVyb09yTW9yZVBhcnNpbmdGdW5jdGlvbiIsInplcm9Pck1vcmVQYXJzZXIiLCJleGFjdGx5VGhyZWUiLCJ3aGl0ZXNQYXJzZXIiLCJ0d29Xb3JkcyIsIm9uZU9yTW9yZVBhcnNlciIsInBpbnQiLCJwYXJzZUludCIsImwiLCJyZWR1Y2UiLCJhY2MiLCJjdXJyIiwiWGFmdGVyWSIsIllYcCIsInBhcnNpbmdZWCIsIkFYcCIsInBhcnNpbmdBWCIsIlhub3RBZnRlclkiLCJYYmVmb3JlWSIsIlhZcCIsInBhcnNpbmdYWSIsIlhBcCIsInBhcnNpbmdYQSIsIlhub3RCZWZvcmVZIiwiQVhZcCIsInBhcnNpbmdBWFkiLCJvcHREb3RUaGVuQSIsIm9wdERvdFdpdGhEZWZhdWx0VGhlbkEiLCJwU2lnbmVkSW50Iiwib3B0U2lnbk51bWJlclBhaXIiLCJpc0p1c3QiLCJvcHRTdWJzdHJpbmciLCJkaXNjYXJkSW50ZWdlclNpZ24iLCJkaXNjYXJkRmlyc3QiLCJkaXNjYXJkU3VmZml4IiwiZGlzY2FyZFNlY29uZCIsInRhcEludG9EaXNjYXJkSW50ZWdlclNpZ24iLCJyZXMiLCJzdG9yZWRMb2ciLCJjb25zb2xlIiwibG9nIiwibXNnIiwibG9nSW50ZXJtZWRpYXRlUmVzdWx0IiwidGltZW91dCIsImluc2lkZVBhcmVucyIsInN1YnN0cmluZ3NXaXRoQ29tbWFzIiwibGlzdEVsZW1lbnRzIiwidmFsdWVzUCIsImNvbW1hUCIsInJlc3VsdCIsInJlc1N0cmluZyJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUEwREEsTUFBTUEsYUFBYSxDQUFDLEdBQUQsRUFBTSxHQUFOLEVBQVcsR0FBWCxFQUFnQixHQUFoQixFQUFxQixHQUFyQixFQUEwQixHQUExQixFQUErQixHQUEvQixFQUFvQyxHQUFwQyxFQUF5QyxH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dCB9IGZyb20gJ2NoYWknO1xuaW1wb3J0IHtcbiAgY2hhclBhcnNlcixcbiAgZGlnaXRQYXJzZXIsXG4gIHBjaGFyLFxuICBwZGlnaXQsXG4gIGFuZFRoZW4sXG4gIG9yRWxzZSxcbiAgY2hvaWNlLFxuICBhbnlPZixcbiAgZm1hcCxcbiAgcmV0dXJuUCxcbiAgYXBwbHlQLFxuICBsaWZ0MixcbiAgc2VxdWVuY2VQLFxuICBzZXF1ZW5jZVAyLFxuICBwc3RyaW5nLFxuICBzdHJpbmdQLFxuICB6ZXJvT3JNb3JlLFxuICBtYW55LFxuICBtYW55MSxcbiAgbWFueUNoYXJzLFxuICBtYW55Q2hhcnMxLFxuICBvcHQsXG4gIG9wdEJvb2ssXG4gIGRpc2NhcmRGaXJzdCxcbiAgZGlzY2FyZFNlY29uZCxcbiAgc2VwQnkxLFxuICBzZXBCeSxcbiAgYmV0d2VlbixcbiAgYmV0d2VlblBhcmVucyxcbiAgdGFwUCxcbiAgbG9nUCxcbiAgcHdvcmQsXG4gIHRyaW1QLFxuICBwcmVjZWRlZEJ5UCxcbiAgbm90UHJlY2VkZWRCeVAsXG4gIGZvbGxvd2VkQnlQLFxuICBub3RGb2xsb3dlZEJ5UCxcbiAgc3RhcnRPZklucHV0UCxcbiAgbm90U3RhcnRPZklucHV0UCxcbiAgZW5kT2ZJbnB1dFAsXG4gIG5vdEVuZE9mSW5wdXRQLFxuICBzdWNjZWVkUCxcbiAgZmFpbFAsXG59IGZyb20gJ3BhcnNlcnMnO1xuaW1wb3J0IHtcbiAgaXNQYWlyLFxuICBpc1N1Y2Nlc3MsXG4gIGlzRmFpbHVyZSxcbiAgaXNQYXJzZXIsXG4gIGlzU29tZSxcbiAgaXNOb25lLFxufSBmcm9tICd1dGlsJztcbmltcG9ydCB7IE1heWJlIH0gZnJvbSAnbWF5YmUnO1xuaW1wb3J0IHsgVmFsaWRhdGlvbiB9IGZyb20gJ3ZhbGlkYXRpb24nO1xuaW1wb3J0IHsgUG9zaXRpb24gfSBmcm9tICdjbGFzc2VzJztcblxuY29uc3QgbG93ZXJjYXNlcyA9IFsnYScsICdiJywgJ2MnLCAnZCcsICdlJywgJ2YnLCAnZycsICdoJywgJ2knLCAnaicsICdrJywgJ2wnLCAnbScsICduJywgJ28nLCAncCcsICdxJywgJ3InLCAncycsICd0JywgJ3UnLCAndicsICd3JywgJ3gnLCAneScsICd6J107XG5jb25zdCB1cHBlcmNhc2VzID0gWydBJywgJ0InLCAnQycsICdEJywgJ0UnLCAnRicsICdHJywgJ0gnLCAnSScsICdKJywgJ0snLCAnTCcsICdNJywgJ04nLCAnTycsICdQJywgJ1EnLCAnUicsICdTJywgJ1QnLCAnVScsICdWJywgJ1cnLCAnWCcsICdZJywgJ1onXTtcbmNvbnN0IGRpZ2l0cyA9IFsnMCcsICcxJywgJzInLCAnMycsICc0JywgJzUnLCAnNicsICc3JywgJzgnLCAnOSddO1xuY29uc3Qgd2hpdGVzID0gWycgJywgJ1xcdCcsICdcXG4nLCAnXFxyJ107XG5jb25zdCB0ZXh0ID0gUG9zaXRpb24uZnJvbVRleHQ7XG5cbmRlc2NyaWJlKCdhIGJhc2ljIHBhcnNlciBmb3Igc2luZ2xlIGNoYXJzIChwYXJzZXJBID0gY2hhclBhcnNlcihcXCdhXFwnKSknLCAoKSA9PiB7XG4gIGNvbnN0IHBhcnNlckEgPSBjaGFyUGFyc2VyKCdhJyk7XG5cbiAgaXQoJ2NhbiBwYXJzZSBhIHNpbmdsZSBjaGFyJywgKCkgPT4ge1xuICAgIGNvbnN0IHBhcnNpbmdBID0gcGFyc2VyQSh0ZXh0KCdhYmMnKSk7XG4gICAgZXhwZWN0KHBhcnNpbmdBLnZhbHVlWzBdKS50by5iZS5lcWwoJ2EnKTtcbiAgICBleHBlY3QocGFyc2luZ0EudmFsdWVbMV0ucmVzdCgpKS50by5iZS5lcWwoJ2JjJyk7XG4gICAgZXhwZWN0KHBhcnNpbmdBLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcbiAgfSk7XG5cbiAgaXQoJ2NhbiBhbHNvIE5PVCBwYXJzZSBhIHNpbmdsZSBjaGFyJywgKCkgPT4ge1xuICAgIGNvbnN0IHBhcnNpbmdCID0gcGFyc2VyQSh0ZXh0KCdiY2QnKSk7XG4gICAgZXhwZWN0KHBhcnNpbmdCLnZhbHVlWzBdKS50by5iZS5lcWwoJ2NoYXJQYXJzZXInKTtcbiAgICBleHBlY3QocGFyc2luZ0IudmFsdWVbMV0pLnRvLmJlLmVxbCgnd2FudGVkIGE7IGdvdCBiJyk7XG4gICAgZXhwZWN0KHBhcnNpbmdCLnZhbHVlWzJdLnJlc3QoKSkudG8uYmUuZXFsKCdiY2QnKTtcbiAgICBleHBlY3QocGFyc2luZ0IuaXNGYWlsdXJlKS50by5iZS50cnVlO1xuICB9KTtcblxuICBpdCgnZmFpbHMgYXQgdGhlIGVuZCBvZiB0aGUgc3RyZWFtJywgKCkgPT4ge1xuICAgIGNvbnN0IHBhcnNpbmdBID0gcGFyc2VyQSh0ZXh0KCcnKSk7XG4gICAgZXhwZWN0KHBhcnNpbmdBLnZhbHVlWzBdKS50by5iZS5lcWwoJ2NoYXJQYXJzZXInKTtcbiAgICBleHBlY3QocGFyc2luZ0EudmFsdWVbMV0pLnRvLmJlLmVxbCgnbm8gbW9yZSBpbnB1dCcpO1xuICAgIGV4cGVjdChwYXJzaW5nQS52YWx1ZVsyXS5yZXN0KCkpLnRvLmJlLmVxbCgnJyk7XG4gICAgZXhwZWN0KHBhcnNpbmdBLmlzRmFpbHVyZSkudG8uYmUudHJ1ZTtcbiAgfSk7XG59KTtcblxuZGVzY3JpYmUoJ2EgYmFzaWMgcGFyc2VyIGZvciBzaW5nbGUgU1RSSU5HSUZJRUQgZGlnaXRzIChwYXJzZXIxID0gZGlnaXRQYXJzZXIoMSkpJywgKCkgPT4ge1xuICBjb25zdCBwYXJzZXIxID0gZGlnaXRQYXJzZXIoMSk7XG4gIGl0KCdjYW4gcGFyc2UgYSBzaW5nbGUgZGlnaXQnLCAoKSA9PiB7XG4gICAgY29uc3QgcGFyc2luZzEgPSBwYXJzZXIxKHRleHQoJzEyMycpKTtcbiAgICBleHBlY3QocGFyc2luZzEudmFsdWVbMF0pLnRvLmJlLmVxbCgxKTtcbiAgICBleHBlY3QocGFyc2luZzEudmFsdWVbMV0ucmVzdCgpKS50by5iZS5lcWwoJzIzJyk7XG4gICAgZXhwZWN0KHBhcnNpbmcxLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcbiAgfSk7XG5cbiAgaXQoJ2NhbiBhbHNvIE5PVCBwYXJzZSBhIHNpbmdsZSBkaWdpdCcsICgpID0+IHtcbiAgICBjb25zdCBwYXJzaW5nMiA9IHBhcnNlcjEodGV4dCgnMjM0JykpO1xuICAgIGV4cGVjdChwYXJzaW5nMi52YWx1ZVswXSkudG8uYmUuZXFsKCdkaWdpdFBhcnNlcicpO1xuICAgIGV4cGVjdChwYXJzaW5nMi52YWx1ZVsxXSkudG8uYmUuZXFsKCd3YW50ZWQgMTsgZ290IDInKTtcbiAgICBleHBlY3QocGFyc2luZzIudmFsdWVbMl0ucmVzdCgpKS50by5iZS5lcWwoJzIzNCcpO1xuICAgIGV4cGVjdChwYXJzaW5nMi5pc0ZhaWx1cmUpLnRvLmJlLnRydWU7XG4gIH0pO1xuXG4gIGl0KCdmYWlscyBhdCB0aGUgZW5kIG9mIHRoZSBzdHJlYW0gYWxzbyB3aGVuIGh1bnRpbmcgZm9yIGRpZ2l0cycsICgpID0+IHtcbiAgICBjb25zdCBwYXJzaW5nMyA9IHBhcnNlcjEodGV4dCgnJykpO1xuICAgIGV4cGVjdChwYXJzaW5nMy52YWx1ZVswXSkudG8uYmUuZXFsKCdkaWdpdFBhcnNlcicpO1xuICAgIGV4cGVjdChwYXJzaW5nMy52YWx1ZVsxXSkudG8uYmUuZXFsKCdubyBtb3JlIGlucHV0Jyk7XG4gICAgZXhwZWN0KHBhcnNpbmczLnZhbHVlWzJdLnJlc3QoKSkudG8uYmUuZXFsKCcnKTtcbiAgICBleHBlY3QocGFyc2luZzMuaXNGYWlsdXJlKS50by5iZS50cnVlO1xuICB9KTtcbn0pO1xuXG5kZXNjcmliZSgnYSBuYW1lZCBjaGFyYWN0ZXIgcGFyc2VyIChwYXJzZXJBID0gcGNoYXIoXFwnYVxcJykpJywgKCkgPT4ge1xuICBjb25zdCBwYXJzZXJBID0gcGNoYXIoJ2EnKTtcblxuICBpdCgnY2FuIHBhcnNlIGEgc2luZ2xlIGNoYXInLCAoKSA9PiB7XG4gICAgZXhwZWN0KGlzUGFyc2VyKHBhcnNlckEpKS50by5iZS50cnVlO1xuICAgIGNvbnN0IHBhcnNpbmdBID0gcGFyc2VyQS5ydW4odGV4dCgnYWJjJykpO1xuICAgIGV4cGVjdChwYXJzaW5nQS52YWx1ZVswXSkudG8uYmUuZXFsKCdhJyk7XG4gICAgZXhwZWN0KHBhcnNpbmdBLnZhbHVlWzFdLnJlc3QoKSkudG8uYmUuZXFsKCdiYycpO1xuICAgIGV4cGVjdChwYXJzaW5nQS5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gIH0pO1xuXG4gIGl0KCdjYW4gYWxzbyBOT1QgcGFyc2UgYSBzaW5nbGUgY2hhcicsICgpID0+IHtcbiAgICBjb25zdCBwYXJzaW5nQiA9IHBhcnNlckEucnVuKHRleHQoJ2JjZCcpKTtcbiAgICBleHBlY3QocGFyc2luZ0IudmFsdWVbMF0pLnRvLmJlLmVxbCgncGNoYXJfYScpO1xuICAgIGV4cGVjdChwYXJzaW5nQi52YWx1ZVsxXSkudG8uYmUuZXFsKCd3YW50ZWQgYTsgZ290IGInKTtcbiAgICBleHBlY3QocGFyc2luZ0IuaXNGYWlsdXJlKS50by5iZS50cnVlO1xuICB9KTtcbn0pO1xuXG5kZXNjcmliZSgndGhlIG1hcHBpbmcgcGFyc2VyIGZtYXAnLCAoKSA9PiB7XG4gIGRlc2NyaWJlKCdkZWZpbmVkIGFzIGZ1bmN0aW9uIChmbWFwKHggPT4geC50b1VwcGVyQ2FzZSgpLCBwY2hhcihcXCdhXFwnKSkpJywgKCkgPT4ge1xuICAgIGNvbnN0IG1hcHBpbmdQYXJzZXIgPSBmbWFwKHggPT4geC50b1VwcGVyQ2FzZSgpLCBwY2hhcignYScpKTtcbiAgICBpdCgnc2hhbGwgbWFwIHRoZSBvdXRwdXQgb2YgYW5vdGhlciBwYXJzZXInLCAoKSA9PiB7XG4gICAgICBleHBlY3QoaXNQYXJzZXIobWFwcGluZ1BhcnNlcikpLnRvLmJlLnRydWU7XG4gICAgICBjb25zdCBtYXBwZWRQYXJzaW5nQSA9IG1hcHBpbmdQYXJzZXIucnVuKHRleHQoJ2FiYycpKTtcbiAgICAgIGV4cGVjdChtYXBwZWRQYXJzaW5nQS52YWx1ZVswXSkudG8uYmUuZXFsKCdBJyk7XG4gICAgICBleHBlY3QobWFwcGVkUGFyc2luZ0EudmFsdWVbMV0ucmVzdCgpKS50by5iZS5lcWwoJ2JjJyk7XG4gICAgICBleHBlY3QobWFwcGVkUGFyc2luZ0EuaXNTdWNjZXNzKS50by5iZS50cnVlO1xuICAgIH0pO1xuICB9KTtcbiAgZGVzY3JpYmUoJ2RlZmluZWQgYXMgYSBtZXRob2Qgb2YgYW5vdGhlciBwYXJzZXIgKHBjaGFyKFxcJ2FcXCcpLmZtYXAoeCA9PiB4LnRvVXBwZXJDYXNlKCkpKScsICgpID0+IHtcbiAgICBjb25zdCBtYXBwaW5nUGFyc2VyID0gcGNoYXIoJ2EnKS5mbWFwKHggPT4geC50b1VwcGVyQ2FzZSgpKTtcbiAgICBpdCgnc2hhbGwgbWFwIHRoZSBvdXRwdXQgb2YgYW5vdGhlciBwYXJzZXInLCAoKSA9PiB7XG4gICAgICBleHBlY3QoaXNQYXJzZXIobWFwcGluZ1BhcnNlcikpLnRvLmJlLnRydWU7XG4gICAgICBjb25zdCBtYXBwZWRQYXJzaW5nQSA9IG1hcHBpbmdQYXJzZXIucnVuKHRleHQoJ2FiYycpKTtcbiAgICAgIGV4cGVjdChtYXBwZWRQYXJzaW5nQS52YWx1ZVswXSkudG8uYmUuZXFsKCdBJyk7XG4gICAgICBleHBlY3QobWFwcGVkUGFyc2luZ0EudmFsdWVbMV0ucmVzdCgpKS50by5iZS5lcWwoJ2JjJyk7XG4gICAgICBleHBlY3QobWFwcGVkUGFyc2luZ0EuaXNTdWNjZXNzKS50by5iZS50cnVlO1xuICAgIH0pO1xuICB9KTtcbn0pO1xuXG5kZXNjcmliZSgndHdvIHBhcnNlcnMgYm91bmQgYnkgYW5kVGhlbiAocGFyc2VyQWFuZEIgPSBhbmRUaGVuKHBjaGFyKFxcJ2FcXCcpLCBwY2hhcihcXCdiXFwnKSkpJywgKCkgPT4ge1xuICBjb25zdCBwYXJzZXJBYW5kQiA9IGFuZFRoZW4ocGNoYXIoJ2EnKSwgcGNoYXIoJ2InKSk7XG5cbiAgaXQoJ2NhbiBwYXJzZSB0d28gY2hhcnMnLCAoKSA9PiB7XG4gICAgZXhwZWN0KGlzUGFyc2VyKHBhcnNlckFhbmRCKSkudG8uYmUudHJ1ZTtcbiAgICBjb25zdCBwYXJzaW5nQWFuZEIgPSBwYXJzZXJBYW5kQi5ydW4odGV4dCgnYWJjJykpO1xuICAgIGV4cGVjdChwYXJzaW5nQWFuZEIuaXNTdWNjZXNzKS50by5iZS50cnVlO1xuICAgIGV4cGVjdChwYXJzaW5nQWFuZEIudmFsdWVbMF0udG9TdHJpbmcoKSkudG8uYmUuZXFsKCdbYSxiXScpO1xuICAgIGV4cGVjdChwYXJzaW5nQWFuZEIudmFsdWVbMV0ucmVzdCgpKS50by5iZS5lcWwoJ2MnKTtcbiAgICBleHBlY3QocGFyc2luZ0FhbmRCLnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgnVmFsaWRhdGlvbi5TdWNjZXNzKFtbYSxiXSxyb3c9MDtjb2w9MjtyZXN0PWNdKScpO1xuICB9KTtcblxuICBpdCgnd2lsbCBmYWlsIGlmIHRoZSB0d28gY2hhcnMgYXJlIG5vdCB0aGUgb25lcyBzb3VnaHQnLCAoKSA9PiB7XG4gICAgY29uc3QgcGFyc2luZ0FhbmRCID0gcGFyc2VyQWFuZEIucnVuKHRleHQoJ2FjZCcpKTtcbiAgICBleHBlY3QocGFyc2luZ0FhbmRCLmlzRmFpbHVyZSkudG8uYmUudHJ1ZTtcbiAgICBleHBlY3QocGFyc2luZ0FhbmRCLnZhbHVlWzBdKS50by5iZS5lcWwoJ3BjaGFyX2EgYW5kVGhlbiBwY2hhcl9iJyk7XG4gICAgZXhwZWN0KHBhcnNpbmdBYW5kQi52YWx1ZVsxXSkudG8uYmUuZXFsKCd3YW50ZWQgYjsgZ290IGMnKTtcbiAgICBleHBlY3QocGFyc2luZ0FhbmRCLnZhbHVlWzJdLnJlc3QoKSkudG8uYmUuZXFsKCdjZCcpO1xuICB9KTtcblxuICBpdCgnd2lsbCBmYWlsIGlmIHRoZSBpbnB1dCBpcyB0b28gc2hvcnQnLCAoKSA9PiB7XG4gICAgZXhwZWN0KHBhcnNlckFhbmRCLnJ1bih0ZXh0KCdhJykpLmlzRmFpbHVyZSkudG8uYmUudHJ1ZTtcbiAgICBleHBlY3QocGFyc2VyQWFuZEIucnVuKHRleHQoJ2FiJykpLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcbiAgfSk7XG59KTtcblxuZGVzY3JpYmUoJ3R3byBwYXJzZXJzIGJvdW5kIGJ5IG9yRWxzZSAocGFyc2VyQW9yQiA9IG9yRWxzZShwY2hhcihcXCdhXFwnKSwgcGNoYXIoXFwnYlxcJykpKScsICgpID0+IHtcbiAgY29uc3QgcGFyc2VyQW9yQiA9IG9yRWxzZShwY2hhcignYScpLCBwY2hhcignYicpKTtcblxuICBpdCgnY2FuIHBhcnNlIG9uZSBvZiB0d28gY2hhcnMnLCAoKSA9PiB7XG4gICAgZXhwZWN0KGlzUGFyc2VyKHBhcnNlckFvckIpKS50by5iZS50cnVlO1xuICAgIGxldCBwYXJzaW5nQW9yQiA9IHBhcnNlckFvckIucnVuKHRleHQoJ2FiYycpKTtcbiAgICBleHBlY3QocGFyc2luZ0FvckIuaXNTdWNjZXNzKS50by5iZS50cnVlO1xuICAgIGV4cGVjdChwYXJzaW5nQW9yQi52YWx1ZVswXSkudG8uYmUuZXFsKCdhJyk7XG4gICAgZXhwZWN0KHBhcnNpbmdBb3JCLnZhbHVlWzFdLnJlc3QoKSkudG8uYmUuZXFsKCdiYycpO1xuICAgIHBhcnNpbmdBb3JCID0gcGFyc2VyQW9yQi5ydW4odGV4dCgnYmJjJykpO1xuICAgIGV4cGVjdChwYXJzaW5nQW9yQi5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgZXhwZWN0KHBhcnNpbmdBb3JCLnZhbHVlWzBdKS50by5iZS5lcWwoJ2InKTtcbiAgICBleHBlY3QocGFyc2luZ0FvckIudmFsdWVbMV0ucmVzdCgpKS50by5iZS5lcWwoJ2JjJyk7XG4gIH0pO1xuXG4gIGl0KCdjYW4gYWxzbyBwYXJzZSBOT05FIG9mIHR3byBjaGFycycsICgpID0+IHtcbiAgICBjb25zdCBwYXJzaW5nQW9yQiA9IHBhcnNlckFvckIucnVuKHRleHQoJ2NkZScpKTtcbiAgICBleHBlY3QocGFyc2luZ0FvckIuaXNGYWlsdXJlKS50by5iZS50cnVlO1xuICAgIGV4cGVjdChwYXJzaW5nQW9yQi52YWx1ZVswXSkudG8uYmUuZXFsKCdwY2hhcl9hIG9yRWxzZSBwY2hhcl9iJyk7XG4gICAgZXhwZWN0KHBhcnNpbmdBb3JCLnZhbHVlWzFdKS50by5iZS5lcWwoJ3dhbnRlZCBiOyBnb3QgYycpO1xuICAgIGV4cGVjdChwYXJzaW5nQW9yQi52YWx1ZVsyXS5yZXN0KCkpLnRvLmJlLmVxbCgnY2RlJyk7XG4gIH0pO1xuXG4gIGl0KCd3aWxsIGZhaWwgaWYgdGhlIGlucHV0IGlzIHRvbyBzaG9ydCcsICgpID0+IHtcbiAgICBleHBlY3QocGFyc2VyQW9yQi5ydW4odGV4dCgnYScpKS5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgZXhwZWN0KHBhcnNlckFvckIucnVuKHRleHQoJycpKS5pc0ZhaWx1cmUpLnRvLmJlLnRydWU7XG4gIH0pO1xufSk7XG5cbmRlc2NyaWJlKCdhIHBhcnNlciBmb3IgZXZlbiBqdXN0IHRocmVlIGNoYXJzIGluIGEgcm93LCBkb25lIHdpdGggYW5kVGhlbiArIGZtYXAsIGlzIHJlYWwgY2x1bXN5OyBidXQgaXQgd29ya3MuLi4nLCAoKSA9PiB7XG4gIGl0KCdwYXJzZXMgYWJjJywgKCkgPT4ge1xuICAgIGNvbnN0IHBhaXJBZGRlciA9IChbeCwgeV0pID0+IHggKyB5O1xuICAgIGNvbnN0IGFiY1AgPSBhbmRUaGVuKFxuICAgICAgcGNoYXIoJ2EnKSxcbiAgICAgIGFuZFRoZW4oXG4gICAgICAgIHBjaGFyKCdiJyksXG4gICAgICAgIGFuZFRoZW4oXG4gICAgICAgICAgcGNoYXIoJ2MnKSxcbiAgICAgICAgICByZXR1cm5QKCcnKSxcbiAgICAgICAgKS5mbWFwKHBhaXJBZGRlciksXG4gICAgICApLmZtYXAocGFpckFkZGVyKSxcbiAgICApLmZtYXAocGFpckFkZGVyKTtcbiAgICBjb25zdCBwYXJzaW5nID0gYWJjUC5ydW4oJ2FiY2QnKTtcbiAgICBleHBlY3QocGFyc2luZy5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgZXhwZWN0KHBhcnNpbmcudmFsdWVbMF0udG9TdHJpbmcoKSkudG8uYmUuZXFsKCdhYmMnKTtcbiAgICBleHBlY3QocGFyc2luZy52YWx1ZVsxXS5yZXN0KCkpLnRvLmJlLmVxbCgnZCcpO1xuICB9KTtcbiAgaXQoJ3BhcnNlcyBhYmMgd2l0aCBhIGRpZmZlcmVudCwgYnV0IHN0aWxsIHZlcnkgY2x1bXN5IHN5bnRheCcsICgpID0+IHtcbiAgICBjb25zdCBwYWlyQWRkZXIgPSAoW3gsIHldKSA9PiB4ICsgeTtcbiAgICBjb25zdCBhYmNQID0gKChwY2hhcignYScpLmFuZFRoZW4ocGNoYXIoJ2InKSkpLmZtYXAocGFpckFkZGVyKS5hbmRUaGVuKHBjaGFyKCdjJykpKS5mbWFwKHBhaXJBZGRlcik7XG4gICAgY29uc3QgcGFyc2luZyA9IGFiY1AucnVuKCdhYmNkJyk7XG4gICAgZXhwZWN0KHBhcnNpbmcuaXNTdWNjZXNzKS50by5iZS50cnVlO1xuICAgIGV4cGVjdChwYXJzaW5nLnZhbHVlWzBdLnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgnYWJjJyk7XG4gICAgZXhwZWN0KHBhcnNpbmcudmFsdWVbMV0ucmVzdCgpKS50by5iZS5lcWwoJ2QnKTtcbiAgfSk7XG59KTtcblxuZGVzY3JpYmUoJ2EgcGFyc2VyIGZvciBldmVuIGp1c3QgdGhyZWUgZGlnaXRzIGluIGEgcm93LCBkb25lIHdpdGggYW5kVGhlbiArIGZtYXAsIGlzIHJlYWwgY2x1bXN5OyBidXQgaXQgd29ya3MuLi4nLCAoKSA9PiB7XG4gIGxldCBwYXJzZURpZ2l0LCB0aHJlZURpZ2l0cywgcGFyc2luZztcblxuICBiZWZvcmUoKCkgPT4ge1xuICAgIHBhcnNlRGlnaXQgPSBhbnlPZihkaWdpdHMpO1xuICAgIHRocmVlRGlnaXRzID0gYW5kVGhlbihwYXJzZURpZ2l0LCBhbmRUaGVuKHBhcnNlRGlnaXQsIHBhcnNlRGlnaXQpKTtcbiAgICBwYXJzaW5nID0gdGhyZWVEaWdpdHMucnVuKCcxMjMnKTtcbiAgfSk7XG4gIGl0KCdwYXJzZXMgYW55IG9mIHRocmVlIGRpZ2l0cycsICgpID0+IHtcbiAgICBleHBlY3QocGFyc2luZy5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgZXhwZWN0KHBhcnNpbmcudmFsdWVbMF0udG9TdHJpbmcoKSkudG8uYmUuZXFsKCdbMSxbMiwzXV0nKTtcbiAgICBleHBlY3QocGFyc2luZy52YWx1ZVsxXS5yZXN0KCkpLnRvLmJlLmVxbCgnJyk7XG4gIH0pO1xuICBkZXNjcmliZSgncGFyc2VzIGFueSBvZiB0aHJlZSBkaWdpdHMgd2hpbGUgc2hvd2Nhc2luZyBmbWFwJywgKCkgPT4ge1xuICAgIGNvbnN0IHVucGFja2VyID0gKFt4LCBbeSwgel1dKSA9PiB7XG4gICAgICByZXR1cm4gW3gsIHksIHpdO1xuICAgIH07XG4gICAgaXQoJ2FzIGdsb2JhbCBtZXRob2QnLCAoKSA9PiB7XG4gICAgICBjb25zdCB0aHJlZURpZ2l0c0ltcGwgPSBmbWFwKHVucGFja2VyLCB0aHJlZURpZ2l0cyk7XG4gICAgICBjb25zdCBwYXJzaW5nID0gdGhyZWVEaWdpdHNJbXBsLnJ1bignMTIzJyk7XG4gICAgICBleHBlY3QocGFyc2luZy5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgICBleHBlY3QocGFyc2luZy52YWx1ZVswXS50b1N0cmluZygpKS50by5iZS5lcWwoJ1sxLDIsM10nKTtcbiAgICAgIGV4cGVjdChwYXJzaW5nLnZhbHVlWzFdLnJlc3QoKSkudG8uYmUuZXFsKCcnKTtcbiAgICB9KTtcbiAgICBpdCgnYXMgaW5zdGFuY2UgbWV0aG9kJywgKCkgPT4ge1xuICAgICAgY29uc3QgdGhyZWVEaWdpdHNJbnN0ID0gdGhyZWVEaWdpdHMuZm1hcCh1bnBhY2tlcik7XG4gICAgICBjb25zdCBwYXJzaW5nID0gdGhyZWVEaWdpdHNJbnN0LnJ1bignMTIzJyk7XG4gICAgICBleHBlY3QocGFyc2luZy5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgICBleHBlY3QocGFyc2luZy52YWx1ZVswXS50b1N0cmluZygpKS50by5iZS5lcWwoJ1sxLDIsM10nKTtcbiAgICAgIGV4cGVjdChwYXJzaW5nLnZhbHVlWzFdLnJlc3QoKSkudG8uYmUuZXFsKCcnKTtcbiAgICB9KTtcbiAgfSk7XG59KTtcblxuZGVzY3JpYmUoJ2EgY2hvaWNlIG9mIGZvdXIgcGFyc2VycyBib3VuZCBieSBvckVsc2UgKHBhcnNlcnNDaG9pY2UgPSBjaG9pY2UoW3BjaGFyKFxcJ2FcXCcpLCBwY2hhcihcXCdiXFwnKSwgcGNoYXIoXFwnY1xcJyksIHBjaGFyKFxcJ2RcXCcpLF0pKScsICgpID0+IHtcbiAgY29uc3QgcGFyc2Vyc0Nob2ljZSA9IGNob2ljZShbcGNoYXIoJ2EnKSwgcGNoYXIoJ2InKSwgcGNoYXIoJ2MnKSwgcGNoYXIoJ2QnKV0pO1xuXG4gIGl0KCdjYW4gcGFyc2Ugb25lIG9mIGZvdXIgY2hhcnMnLCAoKSA9PiB7XG4gICAgZXhwZWN0KGlzUGFyc2VyKHBhcnNlcnNDaG9pY2UpKS50by5iZS50cnVlO1xuICAgIGxldCBwYXJzaW5nQ2hvaWNlID0gcGFyc2Vyc0Nob2ljZS5ydW4odGV4dCgnYScpKTtcbiAgICBleHBlY3QocGFyc2luZ0Nob2ljZS5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UudmFsdWVbMF0pLnRvLmJlLmVxbCgnYScpO1xuICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLnZhbHVlWzFdLnJlc3QoKSkudG8uYmUuZXFsKCcnKTtcbiAgICBwYXJzaW5nQ2hvaWNlID0gcGFyc2Vyc0Nob2ljZS5ydW4odGV4dCgnYicpKTtcbiAgICBleHBlY3QocGFyc2luZ0Nob2ljZS5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UudmFsdWVbMF0pLnRvLmJlLmVxbCgnYicpO1xuICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLnZhbHVlWzFdLnJlc3QoKSkudG8uYmUuZXFsKCcnKTtcbiAgICBwYXJzaW5nQ2hvaWNlID0gcGFyc2Vyc0Nob2ljZS5ydW4odGV4dCgnZCcpKTtcbiAgICBleHBlY3QocGFyc2luZ0Nob2ljZS5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UudmFsdWVbMF0pLnRvLmJlLmVxbCgnZCcpO1xuICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLnZhbHVlWzFdLnJlc3QoKSkudG8uYmUuZXFsKCcnKTtcbiAgfSk7XG5cbiAgaXQoJ3dpbGwgZmFpbCBpZiBOT05FIG9mIHRoZSBmb3VyIGNoYXJzIGlzIHByb3ZpZGVkJywgKCkgPT4ge1xuICAgIGNvbnN0IHBhcnNpbmdDaG9pY2UgPSBwYXJzZXJzQ2hvaWNlLnJ1bih0ZXh0KCd4JykpO1xuICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLmlzRmFpbHVyZSkudG8uYmUudHJ1ZTtcbiAgICBleHBlY3QocGFyc2luZ0Nob2ljZS52YWx1ZVswXSkudG8uYmUuZXFsKCdjaG9pY2UgL3BjaGFyX2EvcGNoYXJfYi9wY2hhcl9jL3BjaGFyX2QnKTtcbiAgICBleHBlY3QocGFyc2luZ0Nob2ljZS52YWx1ZVsxXSkudG8uYmUuZXFsKCdmYWlsJyk7XG4gICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UudmFsdWVbMl0ucmVzdCgpKS50by5iZS5lcWwoJ3gnKTtcbiAgfSk7XG5cbiAgaXQoJ3dpbGwgZmFpbCBpZiB0aGUgaW5wdXQgaXMgdG9vIHNob3J0JywgKCkgPT4ge1xuICAgIGV4cGVjdChwYXJzZXJzQ2hvaWNlLnJ1bih0ZXh0KCdhJykpLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcbiAgICBleHBlY3QocGFyc2Vyc0Nob2ljZS5ydW4odGV4dCgnJykpLmlzRmFpbHVyZSkudG8uYmUudHJ1ZTtcbiAgfSk7XG59KTtcblxuZGVzY3JpYmUoJ2EgcGFyc2VyIGZvciBhbnkgb2YgYSBsaXN0IG9mLi4uICcsICgpID0+IHtcbiAgZGVzY3JpYmUoJ2xvd2VyY2FzZSBjaGFycyAobG93ZXJjYXNlc1BhcnNlciA9IGFueU9mKGxvd2VyY2FzZXMpKScsICgpID0+IHtcbiAgICBjb25zdCBsb3dlcmNhc2VzUGFyc2VyID0gYW55T2YobG93ZXJjYXNlcyk7XG4gICAgaXQoJ2NhbiBwYXJzZSBhbnkgc2luZ2xlIGxvd2VyY2FzZSBjaGFyJywgKCkgPT4ge1xuICAgICAgZXhwZWN0KGlzUGFyc2VyKGxvd2VyY2FzZXNQYXJzZXIpKS50by5iZS50cnVlO1xuICAgICAgbGV0IHBhcnNpbmdDaG9pY2UgPSBsb3dlcmNhc2VzUGFyc2VyLnJ1bih0ZXh0KCdhJykpO1xuICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UuaXNTdWNjZXNzKS50by5iZS50cnVlO1xuICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UudmFsdWVbMF0pLnRvLmJlLmVxbCgnYScpO1xuICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UudmFsdWVbMV0ucmVzdCgpKS50by5iZS5lcWwoJycpO1xuICAgICAgcGFyc2luZ0Nob2ljZSA9IGxvd2VyY2FzZXNQYXJzZXIucnVuKHRleHQoJ2InKSk7XG4gICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS52YWx1ZVswXSkudG8uYmUuZXFsKCdiJyk7XG4gICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS52YWx1ZVsxXS5yZXN0KCkpLnRvLmJlLmVxbCgnJyk7XG4gICAgICBwYXJzaW5nQ2hvaWNlID0gbG93ZXJjYXNlc1BhcnNlci5ydW4odGV4dCgnZCcpKTtcbiAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcbiAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLnZhbHVlWzBdKS50by5iZS5lcWwoJ2QnKTtcbiAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLnZhbHVlWzFdLnJlc3QoKSkudG8uYmUuZXFsKCcnKTtcbiAgICAgIHBhcnNpbmdDaG9pY2UgPSBsb3dlcmNhc2VzUGFyc2VyLnJ1bih0ZXh0KCd6JykpO1xuICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UuaXNTdWNjZXNzKS50by5iZS50cnVlO1xuICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UudmFsdWVbMF0pLnRvLmJlLmVxbCgneicpO1xuICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UudmFsdWVbMV0ucmVzdCgpKS50by5iZS5lcWwoJycpO1xuICAgIH0pO1xuICAgIGl0KCdjYW5ub3QgcGFyc2UgYW55IHNpbmdsZSB1cHBlcmNhc2UgY2hhcicsICgpID0+IHtcbiAgICAgIGNvbnN0IHBhcnNpbmdDaG9pY2UgPSBsb3dlcmNhc2VzUGFyc2VyLnJ1bih0ZXh0KCdZJykpO1xuICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UuaXNGYWlsdXJlKS50by5iZS50cnVlO1xuICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UudmFsdWVbMF0pLnRvLmJlLmVxbCgnYW55T2YgYWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXonKTtcbiAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLnZhbHVlWzFdKS50by5iZS5lcWwoJ2ZhaWwnKTtcbiAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLnZhbHVlWzJdLnJlc3QoKSkudG8uYmUuZXFsKCdZJyk7XG4gICAgfSk7XG4gIH0pO1xuICBkZXNjcmliZSgndXBwZXJjYXNlIGNoYXJzICh1cHBlcmNhc2VzUGFyc2VyID0gYW55T2YodXBwZXJjYXNlcykpJywgKCkgPT4ge1xuICAgIGNvbnN0IHVwcGVyY2FzZXNQYXJzZXIgPSBhbnlPZih1cHBlcmNhc2VzKTtcbiAgICBpdCgnY2FuIHBhcnNlIGFueSBzaW5nbGUgdXBwZXJjYXNlIGNoYXInLCAoKSA9PiB7XG4gICAgICBleHBlY3QoaXNQYXJzZXIodXBwZXJjYXNlc1BhcnNlcikpLnRvLmJlLnRydWU7XG4gICAgICBsZXQgcGFyc2luZ0Nob2ljZSA9IHVwcGVyY2FzZXNQYXJzZXIucnVuKHRleHQoJ0EnKSk7XG4gICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS52YWx1ZVswXSkudG8uYmUuZXFsKCdBJyk7XG4gICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS52YWx1ZVsxXS5yZXN0KCkpLnRvLmJlLmVxbCgnJyk7XG4gICAgICBwYXJzaW5nQ2hvaWNlID0gdXBwZXJjYXNlc1BhcnNlci5ydW4odGV4dCgnQicpKTtcbiAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcbiAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLnZhbHVlWzBdKS50by5iZS5lcWwoJ0InKTtcbiAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLnZhbHVlWzFdLnJlc3QoKSkudG8uYmUuZXFsKCcnKTtcbiAgICAgIHBhcnNpbmdDaG9pY2UgPSB1cHBlcmNhc2VzUGFyc2VyLnJ1bih0ZXh0KCdSJykpO1xuICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UuaXNTdWNjZXNzKS50by5iZS50cnVlO1xuICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UudmFsdWVbMF0pLnRvLmJlLmVxbCgnUicpO1xuICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UudmFsdWVbMV0ucmVzdCgpKS50by5iZS5lcWwoJycpO1xuICAgICAgcGFyc2luZ0Nob2ljZSA9IHVwcGVyY2FzZXNQYXJzZXIucnVuKHRleHQoJ1onKSk7XG4gICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS52YWx1ZVswXSkudG8uYmUuZXFsKCdaJyk7XG4gICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS52YWx1ZVsxXS5yZXN0KCkpLnRvLmJlLmVxbCgnJyk7XG4gICAgfSk7XG4gICAgaXQoJ2Nhbm5vdCBwYXJzZSBhbnkgc2luZ2xlIGxvd2VyY2FzZSBjaGFyJywgKCkgPT4ge1xuICAgICAgY29uc3QgcGFyc2luZ0Nob2ljZSA9IHVwcGVyY2FzZXNQYXJzZXIucnVuKHRleHQoJ3MnKSk7XG4gICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS5pc0ZhaWx1cmUpLnRvLmJlLnRydWU7XG4gICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS52YWx1ZVswXSkudG8uYmUuZXFsKCdhbnlPZiBBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWicpO1xuICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UudmFsdWVbMV0pLnRvLmJlLmVxbCgnZmFpbCcpO1xuICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UudmFsdWVbMl0ucmVzdCgpKS50by5iZS5lcWwoJ3MnKTtcbiAgICB9KTtcbiAgfSk7XG4gIGRlc2NyaWJlKCdkaWdpdHMgKGRpZ2l0c1BhcnNlciA9IGFueU9mKGRpZ2l0cykpJywgKCkgPT4ge1xuICAgIGNvbnN0IGRpZ2l0c1BhcnNlciA9IGFueU9mKGRpZ2l0cyk7XG4gICAgaXQoJ2NhbiBwYXJzZSBhbnkgc2luZ2xlIGRpZ2l0JywgKCkgPT4ge1xuICAgICAgZXhwZWN0KGlzUGFyc2VyKGRpZ2l0c1BhcnNlcikpLnRvLmJlLnRydWU7XG4gICAgICBsZXQgcGFyc2luZ0Nob2ljZSA9IGRpZ2l0c1BhcnNlci5ydW4odGV4dCgnMScpKTtcbiAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcbiAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLnZhbHVlWzBdKS50by5iZS5lcWwoJzEnKTtcbiAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLnZhbHVlWzFdLnJlc3QoKSkudG8uYmUuZXFsKCcnKTtcbiAgICAgIHBhcnNpbmdDaG9pY2UgPSBkaWdpdHNQYXJzZXIucnVuKHRleHQoJzMnKSk7XG4gICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS52YWx1ZVswXSkudG8uYmUuZXFsKCczJyk7XG4gICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS52YWx1ZVsxXS5yZXN0KCkpLnRvLmJlLmVxbCgnJyk7XG4gICAgICBwYXJzaW5nQ2hvaWNlID0gZGlnaXRzUGFyc2VyLnJ1bih0ZXh0KCcwJykpO1xuICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UuaXNTdWNjZXNzKS50by5iZS50cnVlO1xuICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UudmFsdWVbMF0pLnRvLmJlLmVxbCgnMCcpO1xuICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UudmFsdWVbMV0ucmVzdCgpKS50by5iZS5lcWwoJycpO1xuICAgICAgcGFyc2luZ0Nob2ljZSA9IGRpZ2l0c1BhcnNlci5ydW4odGV4dCgnOCcpKTtcbiAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcbiAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLnZhbHVlWzBdKS50by5iZS5lcWwoJzgnKTtcbiAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLnZhbHVlWzFdLnJlc3QoKSkudG8uYmUuZXFsKCcnKTtcbiAgICB9KTtcbiAgICBpdCgnY2Fubm90IHBhcnNlIGFueSBzaW5nbGUgY2hhcmFjdGVyJywgKCkgPT4ge1xuICAgICAgY29uc3QgcGFyc2luZ0Nob2ljZSA9IGRpZ2l0c1BhcnNlci5ydW4odGV4dCgncycpKTtcbiAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLmlzRmFpbHVyZSkudG8uYmUudHJ1ZTtcbiAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLnZhbHVlWzBdKS50by5iZS5lcWwoJ2FueU9mIDAxMjM0NTY3ODknKTtcbiAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLnZhbHVlWzFdKS50by5iZS5lcWwoJ2ZhaWwnKTtcbiAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLnZhbHVlWzJdLnJlc3QoKSkudG8uYmUuZXFsKCdzJyk7XG4gICAgfSk7XG4gIH0pO1xuICBpdCgnd2lsbCBmYWlsIGlmIHRoZSBpbnB1dCBpcyB0b28gc2hvcnQnLCAoKSA9PiB7XG4gICAgZXhwZWN0KGFueU9mKGxvd2VyY2FzZXMpLnJ1bih0ZXh0KCcnKSkuaXNGYWlsdXJlKS50by5iZS50cnVlO1xuICAgIGV4cGVjdChhbnlPZih1cHBlcmNhc2VzKS5ydW4odGV4dCgnJykpLmlzRmFpbHVyZSkudG8uYmUudHJ1ZTtcbiAgICBleHBlY3QoYW55T2YoZGlnaXRzKS5ydW4odGV4dCgnJykpLmlzRmFpbHVyZSkudG8uYmUudHJ1ZTtcbiAgfSk7XG59KTtcblxuZGVzY3JpYmUoJ2xpZnQyIGZvciBwYXJzZXJzJywgKCkgPT4ge1xuICBpdCgnb3BlcmF0ZXMgb24gdGhlIHJlc3VsdHMgb2YgdHdvIHN0cmluZyBwYXJzaW5ncycsICgpID0+IHtcbiAgICBjb25zdCBhZGRTdHJpbmdzID0geCA9PiB5ID0+IHggKyAnKycgKyB5O1xuICAgIGNvbnN0IEFwbHVzQiA9IGxpZnQyKGFkZFN0cmluZ3MpKHBjaGFyKCdhJykpKHBjaGFyKCdiJykpO1xuICAgIGV4cGVjdChBcGx1c0IucnVuKCdhYmMnKS50b1N0cmluZygpKS50by5iZS5lcWwoJ1ZhbGlkYXRpb24uU3VjY2VzcyhbYStiLHJvdz0wO2NvbD0yO3Jlc3Q9Y10pJyk7XG4gIH0pO1xuICBpdCgnYWRkcyB0aGUgcmVzdWx0cyBvZiB0d28gZGlnaXQgcGFyc2luZ3MnLCAoKSA9PiB7XG4gICAgY29uc3QgYWRkRGlnaXRzID0geCA9PiB5ID0+IHggKyB5O1xuICAgIGNvbnN0IGFkZFBhcnNlciA9IGxpZnQyKGFkZERpZ2l0cykocGRpZ2l0KDEpKShwZGlnaXQoMikpO1xuICAgIGV4cGVjdChhZGRQYXJzZXIucnVuKCcxMjM0JykudG9TdHJpbmcoKSkudG8uYmUuZXFsKCdWYWxpZGF0aW9uLlN1Y2Nlc3MoWzMscm93PTA7Y29sPTI7cmVzdD0zNF0pJyk7XG4gICAgZXhwZWN0KGFkZFBhcnNlci5ydW4oJzE0NCcpLmlzRmFpbHVyZSkudG8uYmUudHJ1ZTtcbiAgfSk7XG59KTtcblxuZGVzY3JpYmUoJ2Egc2VxdWVuY2Ugb2YgcGFyc2VycywgYnVpbHQgdXNpbmcgbGlmdDIoY29ucykgKGFrYSBzZXF1ZW5jZVApJywgKCkgPT4ge1xuICBpdCgnc3RvcmVzIG1hdGNoZWQgY2hhcnMgaW5zaWRlIGFuIEFSUkFZJywgKCkgPT4ge1xuICAgIGNvbnN0IGFiY1BhcnNlciA9IHNlcXVlbmNlUChbcGNoYXIoJ2EnKSwgcGNoYXIoJ2InKSwgcGNoYXIoJ2MnKV0pO1xuICAgIGV4cGVjdChhYmNQYXJzZXIucnVuKCdhYmMnKS50b1N0cmluZygpKVxuICAgICAgLnRvLmJlLmVxbCgnVmFsaWRhdGlvbi5TdWNjZXNzKFtbYSxiLGNdLHJvdz0xO2NvbD0wO3Jlc3Q9XSknKTtcbiAgfSk7XG4gIGl0KCdyZXF1aXJlcyB0aGVyZWZvcmUgc29tZSBtYXBwaW5nJywgKCkgPT4ge1xuICAgIGNvbnN0IG1hcHBlZEFiY1BhcnNlciA9IHNlcXVlbmNlUChbcGNoYXIoJ2EnKSwgcGNoYXIoJ2InKSwgcGNoYXIoJ2MnKV0pXG4gICAgICAuZm1hcChhID0+IGEuam9pbignJykpO1xuICAgIGV4cGVjdChtYXBwZWRBYmNQYXJzZXIucnVuKCdhYmMnKS50b1N0cmluZygpKVxuICAgICAgLnRvLmJlLmVxbCgnVmFsaWRhdGlvbi5TdWNjZXNzKFthYmMscm93PTE7Y29sPTA7cmVzdD1dKScpO1xuICB9KTtcbn0pO1xuXG5kZXNjcmliZSgnYSBzZXF1ZW5jZSBvZiBwYXJzZXJzLCBidWlsdCB1c2luZyBhbmRUaGVuICYmIGZtYXAgKGFrYSBzZXF1ZW5jZVAyKScsICgpID0+IHtcbiAgaXQoJ3N0b3JlIG1hdGNoZWQgY2hhcnMgaW5zaWRlIGEgcGxhaW4gU1RSSU5HJywgKCkgPT4ge1xuICAgIGNvbnN0IGFiY1BhcnNlciA9IHNlcXVlbmNlUDIoW3BjaGFyKCdhJyksIHBjaGFyKCdiJyksIHBjaGFyKCdjJyldKTtcbiAgICBleHBlY3QoYWJjUGFyc2VyLnJ1bignYWJjJykudG9TdHJpbmcoKSlcbiAgICAgIC50by5iZS5lcWwoJ1ZhbGlkYXRpb24uU3VjY2VzcyhbYWJjLHJvdz0xO2NvbD0wO3Jlc3Q9XSknKTtcbiAgfSk7XG59KTtcblxuZGVzY3JpYmUoJ2EgcGFyc2VyIGZvciBhIHNwZWNpZmljIHNlcXVlbmNlIG9mIGNoYXJzJywgKCkgPT4ge1xuICBpdCgnaXMgZWFzeSB0byBjcmVhdGUgd2l0aCBzZXF1ZW5jZVAgKG1hcmNvUGFyc2VyID0gcHN0cmluZyhcXCdtYXJjb1xcJykpIGFuZCBpdCByZXR1cm5zIGFuIGFycmF5JywgKCkgPT4ge1xuICAgIGNvbnN0IG1hcmNvUGFyc2VyID0gcHN0cmluZygnbWFyY28nKTtcbiAgICBjb25zdCBtYXJjb1BhcnNpbmcgPSBtYXJjb1BhcnNlci5ydW4oJ21hcmNvY2lhbycpO1xuICAgIGV4cGVjdChtYXJjb1BhcnNpbmcuaXNTdWNjZXNzKS50by5iZS50cnVlO1xuICAgIGV4cGVjdChtYXJjb1BhcnNpbmcudG9TdHJpbmcoKSlcbiAgICAgIC50by5iZS5lcWwoJ1ZhbGlkYXRpb24uU3VjY2VzcyhbW20sYSxyLGMsb10scm93PTA7Y29sPTU7cmVzdD1jaWFvXSknKTtcbiAgfSk7XG4gIGl0KCdoYXMgYSB2ZXJzaW9uIGJhc2VkIG9uIHNlcXVlbmNlUDIgdGhhdCByZXR1cm5zIHN0cmluZ3MgKG1hcmNvUGFyc2VyID0gc3RyaW5nUChcXCdtYXJjb1xcJykpJywgKCkgPT4ge1xuICAgIGNvbnN0IG1hcmNvUGFyc2VyID0gc3RyaW5nUCgnbWFyY28nKTtcbiAgICBjb25zdCBtYXJjb1BhcnNpbmcgPSBtYXJjb1BhcnNlci5ydW4oJ21hcmNvY2lhbycpO1xuICAgIGV4cGVjdChtYXJjb1BhcnNpbmcuaXNTdWNjZXNzKS50by5iZS50cnVlO1xuICAgIGV4cGVjdChtYXJjb1BhcnNpbmcudG9TdHJpbmcoKSlcbiAgICAgIC50by5iZS5lcWwoJ1ZhbGlkYXRpb24uU3VjY2VzcyhbbWFyY28scm93PTA7Y29sPTU7cmVzdD1jaWFvXSknKTtcbiAgfSk7XG59KTtcblxuZGVzY3JpYmUoJ2Egc3VjY2VlZGluZyBwYXJzZXIgKHN1Y2NlZWRQKScsICgpID0+IHtcbiAgY29uc3Qgd2hhdGV2ZXIgPSBQb3NpdGlvbi5mcm9tVGV4dCgnd2hhdGV2ZXInKTtcbiAgaXQoJ3N1Y2NlZWRzIGFsd2F5cycsICgpID0+IHtcbiAgICBleHBlY3Qoc3VjY2VlZFAucnVuKHdoYXRldmVyKS5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gIH0pO1xuICBpdCgnY2FuIGJlIHVzZWQgYXMgYSBmbGFnIHRvIGV4aXQgd2l0aCBzYXRpc2ZhY3Rpb24gZnJvbSBhIG1vcmUgY29tcGxleCBwYXJzaW5nIChwYXJzaW5nID0gc2VxdWVuY2VQKFtwY2hhcihcXCd3XFwnKSwgcGNoYXIoXFwnaFxcJyksIHN1Y2NlZWRQXSkpJywgKCkgPT4ge1xuICAgIGV4cGVjdChzdWNjZWVkUC5ydW4od2hhdGV2ZXIpLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcbiAgICBjb25zdCBwYXJzaW5nID0gc2VxdWVuY2VQKFtwY2hhcigndycpLCBwY2hhcignaCcpLCBzdWNjZWVkUF0pLnJ1bih3aGF0ZXZlcik7XG4gICAgZXhwZWN0KHBhcnNpbmcudG9TdHJpbmcoKSkudG8uYmUuZXFsKCdWYWxpZGF0aW9uLlN1Y2Nlc3MoW1t3LGgsXSxyb3c9MDtjb2w9MjtyZXN0PWF0ZXZlcl0pJyk7XG4gIH0pO1xuICBpdCgnZG9lcyBub3QgY29uc3VtZSBjaGFyYWN0ZXJzLCBidXQgaXQgcmV0dXJucyBhbiBlbXB0eSBzdHJpbmcgYXMgcmVzdWx0JywgKCkgPT4ge1xuICAgIGNvbnN0IHBhcnNpbmcgPSBzZXF1ZW5jZVAoW3BjaGFyKCd3JyksIHN1Y2NlZWRQLCBwY2hhcignaCcpXSk7XG4gICAgZXhwZWN0KHBhcnNpbmcucnVuKHdoYXRldmVyKS50b1N0cmluZygpKS50by5iZS5lcWwoJ1ZhbGlkYXRpb24uU3VjY2VzcyhbW3csLGhdLHJvdz0wO2NvbD0yO3Jlc3Q9YXRldmVyXSknKTtcbiAgfSk7XG59KTtcblxuZGVzY3JpYmUoJ2EgZmFpbGluZyBwYXJzZXIgKGZhaWxQKScsICgpID0+IHtcbiAgaXQoJ3dpbGwgYWx3YXlzIGZhaWwnLCAoKSA9PiB7XG4gICAgZXhwZWN0KGZhaWxQLnJ1bignd2hhdGV2ZXInKS5pc0ZhaWx1cmUpLnRvLmJlLnRydWU7XG4gIH0pO1xuICBpdCgnY2FuIGJlIHVzZWQgYXMgYSBmbGFnIHRvIGV4aXQgV0lUSE9VVCBzYXRpc2ZhY3Rpb24gZnJvbSBhIG1vcmUgY29tcGxleCBwYXJzaW5nIChwYXJzaW5nID0gc2VxdWVuY2VQKFtwY2hhcihcXCd3XFwnKSwgcGNoYXIoXFwnaFxcJyksIGZhaWxQXSkpJywgKCkgPT4ge1xuICAgIGV4cGVjdChmYWlsUC5ydW4oJ3doYXRldmVyJykuaXNGYWlsdXJlKS50by5iZS50cnVlO1xuICAgIGNvbnN0IHBhcnNpbmcgPSBzZXF1ZW5jZVAoW3BjaGFyKCd3JyksIHBjaGFyKCdoJyksIGZhaWxQXSkucnVuKCd3aGF0ZXZlcicpO1xuICAgIGV4cGVjdChwYXJzaW5nLnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgnVmFsaWRhdGlvbi5GYWlsdXJlKFtiaW5kUCBhcHBsaWVkIHRvIGJpbmRQIGFwcGxpZWQgdG8gdW5kZWZpbmVkLGZhaWwscm93PTA7Y29sPTI7cmVzdD1hdGV2ZXJdKScpO1xuICB9KTtcbiAgaXQoJ2RvZXMgbm90IGNvbnN1bWUgY2hhcmFjdGVycywgYnV0IGl0IHJldHVybnMgYW4gZW1wdHkgc3RyaW5nIGFzIHJlc3VsdCcsICgpID0+IHtcbiAgICBjb25zdCBwYXJzaW5nID0gc2VxdWVuY2VQKFtwY2hhcigndycpLCBmYWlsUCwgcGNoYXIoJ2gnKV0pO1xuICAgIGV4cGVjdChwYXJzaW5nLnJ1bignd2hhdGV2ZXInKS50b1N0cmluZygpKS50by5iZS5lcWwoJ1ZhbGlkYXRpb24uRmFpbHVyZShbYmluZFAgYXBwbGllZCB0byBiaW5kUCBhcHBsaWVkIHRvIHVuZGVmaW5lZCxmYWlsLHJvdz0wO2NvbD0xO3Jlc3Q9aGF0ZXZlcl0pJyk7XG4gIH0pO1xufSk7XG5cbmRlc2NyaWJlKCdhIHBhcnNlciBmb3IgdGhlIHN0YXJ0IG9mIHRoZSBpbnB1dCAoc3RhcnRPZklucHV0UCknLCAoKSA9PiB7XG4gIGl0KCdzdWNjZWVkcyBhdCB0aGUgc3RhcnQgb2YgdGhlIHN0cmVhbScsICgpID0+IHtcbiAgICBleHBlY3Qoc3RhcnRPZklucHV0UC5ydW4oUG9zaXRpb24uZnJvbVRleHQoJ2FiYycpKS5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gIH0pO1xuICBpdCgnZmFpbHMgaGFsZndheSB0aHJvdWdoIHRoZSBzdHJlYW0gKCknLCAoKSA9PiB7XG4gICAgY29uc3QgbGF0ZXJJblRoZVN0cmVhbSA9IHNlcXVlbmNlUChbcGNoYXIoJ2EnKSwgc3RhcnRPZklucHV0UF0pO1xuICAgIGV4cGVjdChsYXRlckluVGhlU3RyZWFtLnJ1bihQb3NpdGlvbi5mcm9tVGV4dCgnYWJjJykpLmlzRmFpbHVyZSkudG8uYmUudHJ1ZTtcbiAgfSk7XG4gIGl0KCdkb2VzIG5vdCBjb25zdW1lIGNoYXJhY3RlcnMsIGJ1dCBpdCByZXR1cm5zIGFuIGVtcHR5IHN0cmluZyBhcyByZXN1bHQnLCAoKSA9PiB7XG4gICAgY29uc3Qgc3RhcnRBQkMgPSBzZXF1ZW5jZVAoW3N0YXJ0T2ZJbnB1dFAsIHBjaGFyKCdBJyksIHBjaGFyKCdCJyksIHBjaGFyKCdDJyldKTtcbiAgICBjb25zdCBwYXJzaW5nID0gc3RhcnRBQkMucnVuKFBvc2l0aW9uLmZyb21UZXh0KCdBQkMnKSk7XG4gICAgZXhwZWN0KHBhcnNpbmcudG9TdHJpbmcoKSkudG8uYmUuZXFsKCdWYWxpZGF0aW9uLlN1Y2Nlc3MoW1ssQSxCLENdLHJvdz0xO2NvbD0wO3Jlc3Q9XSknKTtcbiAgfSk7XG59KTtcblxuZGVzY3JpYmUoJ2EgcGFyc2VyIGZvciBOT1QgdGhlIHN0YXJ0IG9mIHRoZSBpbnB1dCAobm90U3RhcnRPZklucHV0UCknLCAoKSA9PiB7XG4gIGl0KCdmYWlscyBhdCB0aGUgc3RhcnQgb2YgdGhlIHN0cmVhbScsICgpID0+IHtcbiAgICBleHBlY3Qobm90U3RhcnRPZklucHV0UC5ydW4oUG9zaXRpb24uZnJvbVRleHQoJ2FiYycpKS5pc0ZhaWx1cmUpLnRvLmJlLnRydWU7XG4gICAgZXhwZWN0KHNlcXVlbmNlUChbbm90U3RhcnRPZklucHV0UCwgcGNoYXIoJ2EnKV0pLnJ1bihQb3NpdGlvbi5mcm9tVGV4dCgnYWJjJykpLnRvU3RyaW5nKCkpXG4gICAgICAudG8uYmUuZXFsKCdWYWxpZGF0aW9uLkZhaWx1cmUoW2JpbmRQIGFwcGxpZWQgdG8gYmluZFAgYXBwbGllZCB0byB1bmRlZmluZWQsZmFpbCxyb3c9MDtjb2w9MDtyZXN0PWFiY10pJyk7XG4gIH0pO1xuICBpdCgnc3VjY2VlZHMgaGFsZndheSB0aHJvdWdoIHRoZSBzdHJlYW0nLCAoKSA9PiB7XG4gICAgY29uc3QgbGF0ZXJJblRoZVN0cmVhbSA9IHNlcXVlbmNlUChbcGNoYXIoJ2EnKSwgbm90U3RhcnRPZklucHV0UF0pO1xuICAgIGV4cGVjdChsYXRlckluVGhlU3RyZWFtLnJ1bihQb3NpdGlvbi5mcm9tVGV4dCgnYWJjJykpLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcbiAgfSk7XG4gIGl0KCdkb2VzIG5vdCBjb25zdW1lIGNoYXJhY3RlcnMsIGJ1dCBpdCByZXR1cm5zIGFuIGVtcHR5IHN0cmluZyBhcyByZXN1bHQnLCAoKSA9PiB7XG4gICAgY29uc3QgQUJOb3RTdGFydEMgPSBzZXF1ZW5jZVAoW3BjaGFyKCdBJyksIHBjaGFyKCdCJyksIG5vdFN0YXJ0T2ZJbnB1dFAsIHBjaGFyKCdDJyldKTtcbiAgICBjb25zdCBwYXJzaW5nID0gQUJOb3RTdGFydEMucnVuKFBvc2l0aW9uLmZyb21UZXh0KCdBQkMnKSk7XG4gICAgZXhwZWN0KHBhcnNpbmcudG9TdHJpbmcoKSkudG8uYmUuZXFsKCdWYWxpZGF0aW9uLlN1Y2Nlc3MoW1tBLEIsLENdLHJvdz0xO2NvbD0wO3Jlc3Q9XSknKTtcbiAgfSk7XG59KTtcblxuZGVzY3JpYmUoJ2EgcGFyc2VyIGZvciB0aGUgZW5kIG9mIHRoZSBpbnB1dCAoZW5kT2ZJbnB1dFApJywgKCkgPT4ge1xuICBpdCgnc3VjY2VlZHMgYXQgdGhlIGVuZCBvZiB0aGUgc3RyZWFtJywgKCkgPT4ge1xuICAgIGNvbnN0IGZpbmFsbHlJblRoZVN0cmVhbSA9IHNlcXVlbmNlUChbcGNoYXIoJ2EnKSwgcGNoYXIoJ2InKSwgZW5kT2ZJbnB1dFBdKTtcbiAgICBleHBlY3QoZmluYWxseUluVGhlU3RyZWFtLnJ1bihQb3NpdGlvbi5mcm9tVGV4dCgnYWInKSkuaXNTdWNjZXNzKS50by5iZS50cnVlO1xuICB9KTtcbiAgaXQoJ2ZhaWxzIGhhbGZ3YXkgdGhyb3VnaCB0aGUgc3RyZWFtJywgKCkgPT4ge1xuICAgIGNvbnN0IGxhdGVySW5UaGVTdHJlYW0gPSBzZXF1ZW5jZVAoW3BjaGFyKCdhJyksIGVuZE9mSW5wdXRQXSk7XG4gICAgZXhwZWN0KGxhdGVySW5UaGVTdHJlYW0ucnVuKFBvc2l0aW9uLmZyb21UZXh0KCdhYmMnKSkuaXNGYWlsdXJlKS50by5iZS50cnVlO1xuICB9KTtcbn0pO1xuXG5kZXNjcmliZSgnYSBwYXJzZXIgZm9yIE5PVCB0aGUgZW5kIG9mIHRoZSBpbnB1dCAobm90RW5kT2ZJbnB1dFApJywgKCkgPT4ge1xuICBpdCgnZmFpbHMgYXQgdGhlIGVuZCBvZiB0aGUgc3RyZWFtJywgKCkgPT4ge1xuICAgIGNvbnN0IG5vdEZpbmFsbHlJblRoZVN0cmVhbSA9IHNlcXVlbmNlUChbcGNoYXIoJ2EnKSwgbm90RW5kT2ZJbnB1dFBdKTtcbiAgICBleHBlY3Qobm90RmluYWxseUluVGhlU3RyZWFtLnJ1bihQb3NpdGlvbi5mcm9tVGV4dCgnYScpKS5pc0ZhaWx1cmUpLnRvLmJlLnRydWU7XG4gIH0pO1xuICBpdCgnc3VjY2VlZHMgaGFsZndheSB0aHJvdWdoIHRoZSBzdHJlYW0nLCAoKSA9PiB7XG4gICAgY29uc3QgQUJub3RFbmRDID0gc2VxdWVuY2VQKFtwY2hhcignQScpLCBwY2hhcignQicpLCBub3RFbmRPZklucHV0UCwgcGNoYXIoJ0MnKV0ubWFwKGxvZ1ApKTtcbiAgICBleHBlY3QoQUJub3RFbmRDLnJ1bihQb3NpdGlvbi5mcm9tVGV4dCgnQUJDJykpLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcbiAgfSk7XG4gIGl0KCdkb2VzIG5vdCBjb25zdW1lIGNoYXJhY3RlcnMsIGJ1dCBpdCByZXR1cm5zIGFuIGVtcHR5IHN0cmluZyBhcyByZXN1bHQnLCAoKSA9PiB7XG4gICAgY29uc3QgQW5vdEVuZEIgPSBzZXF1ZW5jZVAoW3BjaGFyKCdBJyksIG5vdEVuZE9mSW5wdXRQLCBwY2hhcignQicpXS5tYXAobG9nUCkpO1xuICAgIGV4cGVjdChBbm90RW5kQi5ydW4oUG9zaXRpb24uZnJvbVRleHQoJ0FCJykpLnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgnVmFsaWRhdGlvbi5TdWNjZXNzKFtbQSwsQl0scm93PTE7Y29sPTA7cmVzdD1dKScpO1xuICB9KTtcbn0pO1xuXG5kZXNjcmliZSgnYSBwYXJzZXIgdGhhdCB0cmltcyBwYXJzaW5ncyAodHJpbVApJywgKCkgPT4ge1xuICBpdCgnY2FuIGlnbm9yZSB3aGl0ZXNwYWNlcyBhcm91bmQgYSBzaW5nbGUgY2hhciAodHJpbW1lciA9IHRyaW1QKHBjaGFyKFxcJ2FcXCcpKSknLCAoKSA9PiB7XG4gICAgY29uc3QgdHJpbW1lciA9IHRyaW1QKHBjaGFyKCdhJykpO1xuICAgIGV4cGVjdCh0cmltbWVyLnJ1bignICBhICAgICcpLnRvU3RyaW5nKCkpXG4gICAgICAudG8uYmUuZXFsKCdWYWxpZGF0aW9uLlN1Y2Nlc3MoW2Escm93PTE7Y29sPTA7cmVzdD1dKScpO1xuICB9KTtcbiAgaXQoJ2NhbiBpZ25vcmUgd2hpdGVzcGFjZXMgYXJvdW5kIGEgc2VxdWVuY2Ugb2YgdHdvIGNoYXJzICh0cmltbWVyID0gdHJpbVAocGNoYXIoXFwnYVxcJykuYW5kVGhlbihwY2hhcihcXCdiXFwnKSkpJywgKCkgPT4ge1xuICAgIGNvbnN0IHRyaW1tZXIgPSB0cmltUChwY2hhcignYScpLmFuZFRoZW4ocGNoYXIoJ2InKSkpO1xuICAgIGV4cGVjdCh0cmltbWVyLnJ1bignICBhYiAgICAnKS50b1N0cmluZygpKVxuICAgICAgLnRvLmJlLmVxbCgnVmFsaWRhdGlvbi5TdWNjZXNzKFtbYSxiXSxyb3c9MTtjb2w9MDtyZXN0PV0pJyk7XG4gIH0pO1xufSk7XG5cbmRlc2NyaWJlKCdhIHBhcnNlciBmb3IgYSBzcGVjaWZpYyB3b3JkIChwd29yZCknLCAoKSA9PiB7XG4gIGl0KCdkZXRlY3RzIGFuZCBpZ25vcmVzIHdoaXRlc3BhY2VzIGFyb3VuZCBpdCcsICgpID0+IHtcbiAgICBjb25zdCBtYXJjb1BhcnNlciA9IHB3b3JkKCdtYXJjbycpO1xuICAgIGNvbnN0IG1hcmNvUGFyc2luZyA9IG1hcmNvUGFyc2VyLnJ1bignICBtYXJjbyBjaWFvJyk7XG4gICAgZXhwZWN0KG1hcmNvUGFyc2luZy5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgZXhwZWN0KG1hcmNvUGFyc2luZy50b1N0cmluZygpKVxuICAgICAgLnRvLmJlLmVxbCgnVmFsaWRhdGlvbi5TdWNjZXNzKFtbbSxhLHIsYyxvXSxyb3c9MDtjb2w9ODtyZXN0PWNpYW9dKScpO1xuICB9KTtcbiAgaXQoJ2hhcyBubyBwcm9ibGVtIGlmIHRoZSB3aGl0ZXNwYWNlcyBhcmVuXFwndCB0aGVyZScsICgpID0+IHtcbiAgICBjb25zdCBtYXJjb1BhcnNlciA9IHB3b3JkKCdtYXJjbycpO1xuICAgIGNvbnN0IG1hcmNvUGFyc2luZyA9IG1hcmNvUGFyc2VyLnJ1bignbWFyY29jaWFvJyk7XG4gICAgZXhwZWN0KG1hcmNvUGFyc2luZy5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgZXhwZWN0KG1hcmNvUGFyc2luZy50b1N0cmluZygpKVxuICAgICAgLnRvLmJlLmVxbCgnVmFsaWRhdGlvbi5TdWNjZXNzKFtbbSxhLHIsYyxvXSxyb3c9MDtjb2w9NTtyZXN0PWNpYW9dKScpO1xuICB9KTtcbn0pO1xuXG5kZXNjcmliZSgnYSBwYXJzaW5nIGZ1bmN0aW9uIGZvciB6ZXJvIG9yIG1vcmUgb2NjdXJyZW5jZXMgKHplcm9Pck1vcmUpJywgKCkgPT4ge1xuICBpdCgnY2FuIHBhcnNlIGEgY2hhciB6ZXJvIHRpbWVzICh6ZXJvT3JNb3JlUGFyc2luZ0Z1bmN0aW9uID0gemVyb09yTW9yZShwY2hhcihcXCdtXFwnKSkpJywgKCkgPT4ge1xuICAgIGNvbnN0IHplcm9Pck1vcmVQYXJzaW5nRnVuY3Rpb24gPSB6ZXJvT3JNb3JlKHBjaGFyKCdtJykpO1xuICAgIGNvbnN0IHBhcnNpbmcgPSB6ZXJvT3JNb3JlUGFyc2luZ0Z1bmN0aW9uKHRleHQoJ2FyY28nKSk7XG4gICAgZXhwZWN0KHBhcnNpbmcuaXNTdWNjZXNzKS50by5iZS50cnVlO1xuICAgIGV4cGVjdChwYXJzaW5nLnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgnVmFsaWRhdGlvbi5TdWNjZXNzKFtbXSxyb3c9MDtjb2w9MDtyZXN0PWFyY29dKScpO1xuICB9KTtcbiAgaXQoJ2NhbiBwYXJzZSBhIGNoYXIgbWFueSB0aW1lcyAoemVyb09yTW9yZVBhcnNpbmdGdW5jdGlvbiA9IHplcm9Pck1vcmUocGNoYXIoXFwnbVxcJykpKScsICgpID0+IHtcbiAgICBjb25zdCB6ZXJvT3JNb3JlUGFyc2luZ0Z1bmN0aW9uID0gemVyb09yTW9yZShwY2hhcignbScpKTtcbiAgICBjb25zdCBwYXJzaW5nID0gemVyb09yTW9yZVBhcnNpbmdGdW5jdGlvbih0ZXh0KCdtbW1hcmNvJykpO1xuICAgIGV4cGVjdChwYXJzaW5nLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcbiAgICBleHBlY3QocGFyc2luZy50b1N0cmluZygpKS50by5iZS5lcWwoJ1ZhbGlkYXRpb24uU3VjY2VzcyhbW20sbSxtXSxyb3c9MDtjb2w9MztyZXN0PWFyY29dKScpO1xuICB9KTtcbiAgaXQoJ2NhbiBwYXJzZSBhIGNoYXIgc2VxdWVuY2UgemVybyB0aW1lcyAoemVyb09yTW9yZVBhcnNpbmdGdW5jdGlvbiA9IHplcm9Pck1vcmUocHN0cmluZyhcXCdtYXJjb1xcJykpKScsICgpID0+IHtcbiAgICBjb25zdCB6ZXJvT3JNb3JlUGFyc2luZ0Z1bmN0aW9uID0gemVyb09yTW9yZShwc3RyaW5nKCdtYXJjbycpKTtcbiAgICBjb25zdCBwYXJzaW5nID0gemVyb09yTW9yZVBhcnNpbmdGdW5jdGlvbih0ZXh0KCd4bWFyY29tYXJjb2NpYW8nKSk7XG4gICAgZXhwZWN0KHBhcnNpbmcuaXNTdWNjZXNzKS50by5iZS50cnVlO1xuICAgIGV4cGVjdChwYXJzaW5nLnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgnVmFsaWRhdGlvbi5TdWNjZXNzKFtbXSxyb3c9MDtjb2w9MDtyZXN0PXhtYXJjb21hcmNvY2lhb10pJyk7XG4gIH0pO1xuICBpdCgnY2FuIHBhcnNlIGEgY2hhciBzZXF1ZW5jZSBtYW55IHRpbWVzICh6ZXJvT3JNb3JlUGFyc2luZ0Z1bmN0aW9uID0gemVyb09yTW9yZShwc3RyaW5nKFxcJ21hcmNvXFwnKSkpJywgKCkgPT4ge1xuICAgIGNvbnN0IHplcm9Pck1vcmVQYXJzaW5nRnVuY3Rpb24gPSB6ZXJvT3JNb3JlKHBzdHJpbmcoJ21hcmNvJykpO1xuICAgIGNvbnN0IHBhcnNpbmcgPSB6ZXJvT3JNb3JlUGFyc2luZ0Z1bmN0aW9uKHRleHQoJ21hcmNvbWFyY29jaWFvJykpO1xuICAgIGV4cGVjdChwYXJzaW5nLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcbiAgICBleHBlY3QocGFyc2luZy50b1N0cmluZygpKVxuICAgICAgLnRvLmJlLmVxbCgnVmFsaWRhdGlvbi5TdWNjZXNzKFtbW20sYSxyLGMsb10sW20sYSxyLGMsb11dLHJvdz0wO2NvbD0xMDtyZXN0PWNpYW9dKScpO1xuICB9KTtcbn0pO1xuXG5kZXNjcmliZSgnYSBwYXJzZXIgZm9yIHplcm8gb3IgbW9yZSBvY2N1cnJlbmNlcycsICgpID0+IHtcbiAgaXQoJ2NhbiBwYXJzZSBhIGNoYXIgemVybyB0aW1lcyAoemVyb09yTW9yZVBhcnNlciA9IG1hbnkocGNoYXIoXFwnbVxcJykpKScsICgpID0+IHtcbiAgICBjb25zdCB6ZXJvT3JNb3JlUGFyc2VyID0gbWFueShwY2hhcignbScpKTtcbiAgICBjb25zdCBwYXJzaW5nID0gemVyb09yTW9yZVBhcnNlci5ydW4odGV4dCgnYXJjbycpKTtcbiAgICBleHBlY3QocGFyc2luZy5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgZXhwZWN0KHBhcnNpbmcudG9TdHJpbmcoKSkudG8uYmUuZXFsKCdWYWxpZGF0aW9uLlN1Y2Nlc3MoW1tdLHJvdz0wO2NvbD0wO3Jlc3Q9YXJjb10pJyk7XG4gIH0pO1xuICBpdCgnY2FuIHBhcnNlIGEgY2hhciBtYW55IHRpbWVzIGFuZCByZXR1cm4gYW4gYXJyYXkgKHplcm9Pck1vcmVQYXJzZXIgPSBtYW55KHBjaGFyKFxcJ21cXCcpKSknLCAoKSA9PiB7XG4gICAgY29uc3QgemVyb09yTW9yZVBhcnNlciA9IG1hbnkocGNoYXIoJ20nKSk7XG4gICAgY29uc3QgcGFyc2luZyA9IHplcm9Pck1vcmVQYXJzZXIucnVuKHRleHQoJ21tbWFyY28nKSk7XG4gICAgZXhwZWN0KHBhcnNpbmcuaXNTdWNjZXNzKS50by5iZS50cnVlO1xuICAgIGV4cGVjdChwYXJzaW5nLnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgnVmFsaWRhdGlvbi5TdWNjZXNzKFtbbSxtLG1dLHJvdz0wO2NvbD0zO3Jlc3Q9YXJjb10pJyk7XG4gIH0pO1xuICBpdCgnY2FuIHBhcnNlIGEgY2hhciBleGFjdGx5IG4gdGltZXMgYW5kIHJldHVybiBhbiBhcnJheSwgb3IgZmFpbCAoZXhhY3RseVRocmVlID0gbWFueShwY2hhcihcXCdtXFwnKSwgMykpJywgKCkgPT4ge1xuICAgIGNvbnN0IGV4YWN0bHlUaHJlZSA9IG1hbnkocGNoYXIoJ20nKSwgMyk7XG4gICAgbGV0IHBhcnNpbmcgPSBleGFjdGx5VGhyZWUucnVuKHRleHQoJ21tbWFyY28nKSk7XG4gICAgZXhwZWN0KHBhcnNpbmcuaXNTdWNjZXNzKS50by5iZS50cnVlO1xuICAgIGV4cGVjdChwYXJzaW5nLnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgnVmFsaWRhdGlvbi5TdWNjZXNzKFtbbSxtLG1dLHJvdz0wO2NvbD0zO3Jlc3Q9YXJjb10pJyk7XG4gICAgcGFyc2luZyA9IGV4YWN0bHlUaHJlZS5ydW4odGV4dCgnbW1tbWFyY28nKSk7XG4gICAgZXhwZWN0KHBhcnNpbmcuaXNGYWlsdXJlKS50by5iZS50cnVlO1xuICAgIGV4cGVjdChwYXJzaW5nLnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgnVmFsaWRhdGlvbi5GYWlsdXJlKFttYW55IHBjaGFyX20gdGltZXM9Myx0aW1lcyBwYXJhbSB3YW50ZWQgMzsgZ290IDQscm93PTA7Y29sPTA7cmVzdD1tbW1tYXJjb10pJyk7XG4gIH0pO1xuICBpdCgnY2FuIHBhcnNlIGEgY2hhciBtYW55IHRpbWVzIGFuZCByZXR1cm4gYSBzdHJpbmcgKHplcm9Pck1vcmVQYXJzZXIgPSBtYW55Q2hhcnMocGNoYXIoXFwnbVxcJykpKScsICgpID0+IHtcbiAgICBjb25zdCB6ZXJvT3JNb3JlUGFyc2VyID0gbWFueUNoYXJzKHBjaGFyKCdtJykpO1xuICAgIGNvbnN0IHBhcnNpbmcgPSB6ZXJvT3JNb3JlUGFyc2VyLnJ1bih0ZXh0KCdtbW1hcmNvJykpO1xuICAgIGV4cGVjdChwYXJzaW5nLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcbiAgICBleHBlY3QocGFyc2luZy50b1N0cmluZygpKS50by5iZS5lcWwoJ1ZhbGlkYXRpb24uU3VjY2VzcyhbbW1tLHJvdz0wO2NvbD0zO3Jlc3Q9YXJjb10pJyk7XG4gIH0pO1xuICBpdCgnY2FuIHBhcnNlIGEgY2hhciBleGFjdGx5IG4gdGltZXMgYW5kIHJldHVybiBhIHN0cmluZywgb3IgZmFpbCAoZXhhY3RseVRocmVlID0gbWFueUNoYXJzKHBjaGFyKFxcJ21cXCcpLCAzKSknLCAoKSA9PiB7XG4gICAgY29uc3QgZXhhY3RseVRocmVlID0gbWFueUNoYXJzKHBjaGFyKCdtJyksIDMpO1xuICAgIGxldCBwYXJzaW5nID0gZXhhY3RseVRocmVlLnJ1bih0ZXh0KCdtbW1hcmNvJykpO1xuICAgIGV4cGVjdChwYXJzaW5nLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcbiAgICBleHBlY3QocGFyc2luZy50b1N0cmluZygpKS50by5iZS5lcWwoJ1ZhbGlkYXRpb24uU3VjY2VzcyhbbW1tLHJvdz0wO2NvbD0zO3Jlc3Q9YXJjb10pJyk7XG4gICAgcGFyc2luZyA9IGV4YWN0bHlUaHJlZS5ydW4odGV4dCgnbW1tbWFyY28nKSk7XG4gICAgZXhwZWN0KHBhcnNpbmcuaXNGYWlsdXJlKS50by5iZS50cnVlO1xuICAgIGV4cGVjdChwYXJzaW5nLnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgnVmFsaWRhdGlvbi5GYWlsdXJlKFttYW55Q2hhcnMgcGNoYXJfbSB0aW1lcz0zLHRpbWVzIHBhcmFtIHdhbnRlZCAzOyBnb3QgNCxyb3c9MDtjb2w9MDtyZXN0PW1tbW1hcmNvXSknKTtcbiAgfSk7XG4gIGl0KCdjYW4gcGFyc2UgYSBjaGFyIHNlcXVlbmNlIHplcm8gdGltZXMgKHplcm9Pck1vcmVQYXJzZXIgPSBtYW55KHBzdHJpbmcoXFwnbWFyY29cXCcpKSknLCAoKSA9PiB7XG4gICAgY29uc3QgemVyb09yTW9yZVBhcnNlciA9IG1hbnkocHN0cmluZygnbWFyY28nKSk7XG4gICAgY29uc3QgcGFyc2luZyA9IHplcm9Pck1vcmVQYXJzZXIucnVuKHRleHQoJ3htYXJjb21hcmNvY2lhbycpKTtcbiAgICBleHBlY3QocGFyc2luZy5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgZXhwZWN0KHBhcnNpbmcudG9TdHJpbmcoKSkudG8uYmUuZXFsKCdWYWxpZGF0aW9uLlN1Y2Nlc3MoW1tdLHJvdz0wO2NvbD0wO3Jlc3Q9eG1hcmNvbWFyY29jaWFvXSknKTtcbiAgfSk7XG4gIGl0KCdjYW4gcGFyc2UgYSBjaGFyIHNlcXVlbmNlIG1hbnkgdGltZXMgKHplcm9Pck1vcmVQYXJzZXIgPSBtYW55KHBzdHJpbmcoXFwnbWFyY29cXCcpKSknLCAoKSA9PiB7XG4gICAgY29uc3QgemVyb09yTW9yZVBhcnNlciA9IG1hbnkocHN0cmluZygnbWFyY28nKSk7XG4gICAgY29uc3QgcGFyc2luZyA9IHplcm9Pck1vcmVQYXJzZXIucnVuKCdtYXJjb21hcmNvY2lhbycpO1xuICAgIGV4cGVjdChwYXJzaW5nLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcbiAgICBleHBlY3QocGFyc2luZy50b1N0cmluZygpKVxuICAgICAgLnRvLmJlLmVxbCgnVmFsaWRhdGlvbi5TdWNjZXNzKFtbW20sYSxyLGMsb10sW20sYSxyLGMsb11dLHJvdz0wO2NvbD0xMDtyZXN0PWNpYW9dKScpO1xuICB9KTtcbiAgaXQoJ2NhbiBwYXJzZSB3aGl0ZXNwYWNlcyEhICh3aGl0ZXNQYXJzZXIgPSBtYW55KGFueU9mKHdoaXRlcykpKScsICgpID0+IHtcbiAgICBjb25zdCB3aGl0ZXNQYXJzZXIgPSBtYW55KGFueU9mKHdoaXRlcykpO1xuICAgIGNvbnN0IHR3b1dvcmRzID0gc2VxdWVuY2VQKFtwc3RyaW5nKCdjaWFvJyksIHdoaXRlc1BhcnNlciwgcHN0cmluZygnbWFtbWEnKV0pO1xuICAgIGxldCBwYXJzaW5nID0gdHdvV29yZHMucnVuKCdjaWFvbWFtbWFYJyk7XG4gICAgZXhwZWN0KHBhcnNpbmcudG9TdHJpbmcoKSlcbiAgICAgIC50by5iZS5lcWwoJ1ZhbGlkYXRpb24uU3VjY2VzcyhbW1tjLGksYSxvXSxbXSxbbSxhLG0sbSxhXV0scm93PTA7Y29sPTk7cmVzdD1YXSknKTtcbiAgICBwYXJzaW5nID0gdHdvV29yZHMucnVuKCdjaWFvIG1hbW1hWCcpO1xuICAgIGV4cGVjdChwYXJzaW5nLnRvU3RyaW5nKCkpXG4gICAgICAudG8uYmUuZXFsKCdWYWxpZGF0aW9uLlN1Y2Nlc3MoW1tbYyxpLGEsb10sWyBdLFttLGEsbSxtLGFdXSxyb3c9MDtjb2w9MTA7cmVzdD1YXSknKTtcbiAgICBwYXJzaW5nID0gdHdvV29yZHMucnVuKCdjaWFvICAgbWFtbWFYJyk7XG4gICAgZXhwZWN0KHBhcnNpbmcudG9TdHJpbmcoKSlcbiAgICAgIC50by5iZS5lcWwoJ1ZhbGlkYXRpb24uU3VjY2VzcyhbW1tjLGksYSxvXSxbICwgLCBdLFttLGEsbSxtLGFdXSxyb3c9MDtjb2w9MTI7cmVzdD1YXSknKTtcbiAgICBwYXJzaW5nID0gdHdvV29yZHMucnVuKCdjaWFvIFxcdCBtYW1tYVgnKTtcbiAgICBleHBlY3QocGFyc2luZy50b1N0cmluZygpKVxuICAgICAgLnRvLmJlLmVxbCgnVmFsaWRhdGlvbi5TdWNjZXNzKFtbW2MsaSxhLG9dLFsgLFxcdCwgXSxbbSxhLG0sbSxhXV0scm93PTA7Y29sPTEyO3Jlc3Q9WF0pJyk7XG4gIH0pO1xufSk7XG5cbmRlc2NyaWJlKCdhIHBhcnNlciBmb3Igb25lIG9yIG1vcmUgb2NjdXJyZW5jZXMgKG1hbnkxLCBtYW55Q2hhcnMxKScsICgpID0+IHtcbiAgaXQoJ2Nhbm5vdCBwYXJzZSBhIGNoYXIgemVybyB0aW1lcyAob25lT3JNb3JlUGFyc2VyID0gbWFueTEocGNoYXIoXFwnbVxcJykpKScsICgpID0+IHtcbiAgICBjb25zdCBvbmVPck1vcmVQYXJzZXIgPSBtYW55MShwY2hhcignbScpKTtcbiAgICBjb25zdCBwYXJzaW5nID0gb25lT3JNb3JlUGFyc2VyLnJ1bignYXJjbycpO1xuICAgIGV4cGVjdChwYXJzaW5nLmlzRmFpbHVyZSkudG8uYmUudHJ1ZTtcbiAgICBleHBlY3QocGFyc2luZy50b1N0cmluZygpKVxuICAgICAgLnRvLmJlLmVxbCgnVmFsaWRhdGlvbi5GYWlsdXJlKFttYW55MSBwY2hhcl9tLHdhbnRlZCBtOyBnb3QgYSxyb3c9MDtjb2w9MDtyZXN0PWFyY29dKScpO1xuICB9KTtcbiAgaXQoJ2NhbiBwYXJzZSBhIGNoYXIgbWFueSB0aW1lcyBhbmQgcmV0dXJuIGFuIGFycmF5IChvbmVPck1vcmVQYXJzZXIgPSBtYW55MShwY2hhcihcXCdtXFwnKSkpJywgKCkgPT4ge1xuICAgIGNvbnN0IG9uZU9yTW9yZVBhcnNlciA9IG1hbnkxKHBjaGFyKCdtJykpO1xuICAgIGNvbnN0IHBhcnNpbmcgPSBvbmVPck1vcmVQYXJzZXIucnVuKCdtbW1hcmNvJyk7XG4gICAgZXhwZWN0KHBhcnNpbmcuaXNTdWNjZXNzKS50by5iZS50cnVlO1xuICAgIGV4cGVjdChwYXJzaW5nLnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgnVmFsaWRhdGlvbi5TdWNjZXNzKFtbbSxtLG1dLHJvdz0wO2NvbD0zO3Jlc3Q9YXJjb10pJyk7XG4gIH0pO1xuICBpdCgnY2FuIHBhcnNlIGEgY2hhciBtYW55IHRpbWVzIGFuZCByZXR1cm4gYSBzdHJpbmcgKG9uZU9yTW9yZVBhcnNlciA9IG1hbnlDaGFyczEocGNoYXIoXFwnbVxcJykpKScsICgpID0+IHtcbiAgICBjb25zdCBvbmVPck1vcmVQYXJzZXIgPSBtYW55Q2hhcnMxKHBjaGFyKCdtJykpO1xuICAgIGNvbnN0IHBhcnNpbmcgPSBvbmVPck1vcmVQYXJzZXIucnVuKCdtbW1hcmNvJyk7XG4gICAgZXhwZWN0KHBhcnNpbmcuaXNTdWNjZXNzKS50by5iZS50cnVlO1xuICAgIGV4cGVjdChwYXJzaW5nLnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgnVmFsaWRhdGlvbi5TdWNjZXNzKFttbW0scm93PTA7Y29sPTM7cmVzdD1hcmNvXSknKTtcbiAgfSk7XG4gIGl0KCdjYW5ub3QgcGFyc2UgYSBjaGFyIHNlcXVlbmNlIHplcm8gdGltZXMgKG9uZU9yTW9yZVBhcnNlciA9IG1hbnkxKHBzdHJpbmcoXFwnbWFyY29cXCcpKSknLCAoKSA9PiB7XG4gICAgY29uc3Qgb25lT3JNb3JlUGFyc2VyID0gbWFueTEocHN0cmluZygnbWFyY28nKSk7XG4gICAgY29uc3QgcGFyc2luZyA9IG9uZU9yTW9yZVBhcnNlci5ydW4oJ3htYXJjb21hcmNvY2lhbycpO1xuICAgIGV4cGVjdChwYXJzaW5nLmlzRmFpbHVyZSkudG8uYmUudHJ1ZTtcbiAgICBleHBlY3QocGFyc2luZy50b1N0cmluZygpKVxuICAgICAgLnRvLmJlLmVxbCgnVmFsaWRhdGlvbi5GYWlsdXJlKFttYW55MSBwc3RyaW5nIG1hcmNvLHdhbnRlZCBtOyBnb3QgeCxyb3c9MDtjb2w9MDtyZXN0PXhtYXJjb21hcmNvY2lhb10pJyk7XG4gIH0pO1xuICBpdCgnY2FuIHBhcnNlIGEgY2hhciBzZXF1ZW5jZSBtYW55IHRpbWVzIChvbmVPck1vcmVQYXJzZXIgPSBtYW55MShwc3RyaW5nKFxcJ21hcmNvXFwnKSkpJywgKCkgPT4ge1xuICAgIGNvbnN0IG9uZU9yTW9yZVBhcnNlciA9IG1hbnkxKHBzdHJpbmcoJ21hcmNvJykpO1xuICAgIGNvbnN0IHBhcnNpbmcgPSBvbmVPck1vcmVQYXJzZXIucnVuKCdtYXJjb21hcmNvY2lhbycpO1xuICAgIGV4cGVjdChwYXJzaW5nLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcbiAgICBleHBlY3QocGFyc2luZy50b1N0cmluZygpKVxuICAgICAgLnRvLmJlLmVxbCgnVmFsaWRhdGlvbi5TdWNjZXNzKFtbW20sYSxyLGMsb10sW20sYSxyLGMsb11dLHJvdz0wO2NvbD0xMDtyZXN0PWNpYW9dKScpO1xuICB9KTtcbiAgaXQoJ2NhbiBwYXJzZSBhbiBpbnRlZ2VyLCBubyBtYXR0ZXIgaG93IGxhcmdlLi4uIChwaW50ID0gbWFueTEoYW55T2YoZGlnaXRzKSkpJywgKCkgPT4ge1xuICAgIGNvbnN0IHBpbnQgPSBtYW55MShhbnlPZihkaWdpdHMpKTtcbiAgICBsZXQgcGFyc2luZyA9IHBpbnQucnVuKCcxMjM0NUEnKTtcbiAgICBleHBlY3QocGFyc2luZy5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgZXhwZWN0KHBhcnNpbmcudG9TdHJpbmcoKSkudG8uYmUuZXFsKCdWYWxpZGF0aW9uLlN1Y2Nlc3MoW1sxLDIsMyw0LDVdLHJvdz0wO2NvbD01O3Jlc3Q9QV0pJyk7XG4gICAgcGFyc2luZyA9IHBpbnQucnVuKCcxQicpO1xuICAgIGV4cGVjdChwYXJzaW5nLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcbiAgICBleHBlY3QocGFyc2luZy50b1N0cmluZygpKS50by5iZS5lcWwoJ1ZhbGlkYXRpb24uU3VjY2VzcyhbWzFdLHJvdz0wO2NvbD0xO3Jlc3Q9Ql0pJyk7XG4gICAgcGFyc2luZyA9IHBpbnQucnVuKCdBMTIzNDUnKTtcbiAgICBleHBlY3QocGFyc2luZy5pc0ZhaWx1cmUpLnRvLmJlLnRydWU7XG4gICAgZXhwZWN0KHBhcnNpbmcudG9TdHJpbmcoKSlcbiAgICAgIC50by5iZS5lcWwoJ1ZhbGlkYXRpb24uRmFpbHVyZShbbWFueTEgYW55T2YgMDEyMzQ1Njc4OSxmYWlsLEExMjM0NV0pJyk7XG4gIH0pO1xuICBpdCgnY2FuIHBhcnNlIGFuIGludGVnZXIgaW50byBhIHRydWUgaW50ZWdlciAocGludCA9IG1hbnkxKGFueU9mKGRpZ2l0cykpKScsICgpID0+IHtcbiAgICBjb25zdCBwaW50ID0gbWFueTEoYW55T2YoZGlnaXRzKSlcbiAgICAgIC5mbWFwKGwgPT4gcGFyc2VJbnQobC5yZWR1Y2UoKGFjYywgY3VycikgPT4gYWNjICsgY3VyciwgJycpLCAxMCkpO1xuICAgIGNvbnN0IHBhcnNpbmcgPSBwaW50LnJ1bignMTIzNDVBJyk7XG4gICAgZXhwZWN0KHBhcnNpbmcuaXNTdWNjZXNzKS50by5iZS50cnVlO1xuICAgIGV4cGVjdChwYXJzaW5nLnZhbHVlWzBdKS50by5iZS5lcWwoMTIzNDUpO1xuICAgIGV4cGVjdChwYXJzaW5nLnZhbHVlWzFdLnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgncm93PTA7Y29sPTU7cmVzdD1BJyk7XG4gIH0pO1xufSk7XG5cbmRlc2NyaWJlKCdwYXJzZXJzIHRoYXQgY29uc2lkZXIgcHJlY2VkZW5jZXMgKHByZWNlZGVkQnlQLCBub3RQcmVjZWRlZEJ5UCwgZm9sbG93ZWRCeVAsIG5vdEZvbGxvd2VkQnlQKScsICgpID0+IHtcbiAgZGVzY3JpYmUoJ2NhbiBwYXJzZSBYIHByZWNlZGVkIGJ5IFkgKFhhZnRlclkgPSBwcmVjZWRlZEJ5UChcXCdZXFwnLCBcXCdYXFwnKSknLCAoKSA9PiB7XG4gICAgY29uc3QgWGFmdGVyWSA9IHByZWNlZGVkQnlQKCdZJywgJ1gnKTtcbiAgICBpdCgnZXZlbiBpZiBZIGhhcyBiZWVuIGNvbnN1bWVkIGJ5IHRoZSBwYXJzZXIgYmVmb3JlJywgKCkgPT4ge1xuICAgICAgY29uc3QgWVhwID0gbWFueTEoY2hvaWNlKFtwY2hhcignWScpLCBYYWZ0ZXJZXSkpO1xuICAgICAgY29uc3QgcGFyc2luZ1lYID0gWVhwLnJ1bih0ZXh0KCdZWCcpKTtcbiAgICAgIGV4cGVjdChwYXJzaW5nWVguaXNTdWNjZXNzKS50by5iZS50cnVlO1xuICAgICAgZXhwZWN0KHBhcnNpbmdZWC50b1N0cmluZygpKS50by5iZS5lcWwoJ1ZhbGlkYXRpb24uU3VjY2VzcyhbW1ksWF0scm93PTE7Y29sPTA7cmVzdD1dKScpO1xuICAgIH0pO1xuICAgIGl0KCdhbmQgaGFsdCB3aGVuIFggaXMgbm90IHByZWNlZGVkIGJ5IFkgKEFYcCA9IG1hbnkxKGNob2ljZShbcGNoYXIoXFwnQVxcJyksIFhhZnRlclldKSkpJywgKCkgPT4ge1xuICAgICAgY29uc3QgQVhwID0gbWFueTEoY2hvaWNlKFtwY2hhcignQScpLCBYYWZ0ZXJZXSkpO1xuICAgICAgY29uc3QgcGFyc2luZ0FYID0gQVhwLnJ1bih0ZXh0KCdBWCcpKTtcbiAgICAgIGV4cGVjdChwYXJzaW5nQVguaXNTdWNjZXNzKS50by5iZS50cnVlO1xuICAgICAgZXhwZWN0KHBhcnNpbmdBWC52YWx1ZVsxXS5yZXN0KCkpLnRvLmJlLmVxbCgnWCcpO1xuICAgIH0pO1xuICAgIGl0KCdhbmQgZmFpbCB3aGVuIFggaXMgYXQgdGhlIHN0YXJ0IG9mIHRoZSBzdHJpbmcgKEFYcCA9IG1hbnkxKGNob2ljZShbcGNoYXIoXFwnQVxcJyksIFhhZnRlclldKSkpJywgKCkgPT4ge1xuICAgICAgY29uc3QgQVhwID0gbWFueTEoY2hvaWNlKFtwY2hhcignQScpLCBYYWZ0ZXJZXSkpO1xuICAgICAgY29uc3QgcGFyc2luZ0FYID0gQVhwLnJ1bih0ZXh0KCdYQScpKTtcbiAgICAgIGV4cGVjdChwYXJzaW5nQVguaXNGYWlsdXJlKS50by5iZS50cnVlO1xuICAgIH0pO1xuICB9KTtcblxuICBkZXNjcmliZSgnY2FuIHBhcnNlIFggbm90IHByZWNlZGVkIGJ5IFkgKFhub3RBZnRlclkgPSBub3RQcmVjZWRlZEJ5UChcXCdZXFwnLCBcXCdYXFwnKSknLCAoKSA9PiB7XG4gICAgY29uc3QgWG5vdEFmdGVyWSA9IG5vdFByZWNlZGVkQnlQKCdZJywgJ1gnKTtcblxuICAgIGl0KCdldmVuIGlmIHRoZSBwcmV2aW91cyBjaGFyIGhhcyBiZWVuIGNvbnN1bWVkIGJ5IHRoZSBwYXJzZXIgYmVmb3JlIChBWHAgPSBtYW55MShjaG9pY2UoW3BjaGFyKFxcJ0FcXCcpLCBYbm90QWZ0ZXJZXSkpKScsICgpID0+IHtcbiAgICAgIGNvbnN0IEFYcCA9IG1hbnkxKGNob2ljZShbcGNoYXIoJ0EnKSwgWG5vdEFmdGVyWV0pKTtcbiAgICAgIGNvbnN0IHBhcnNpbmdBWCA9IEFYcC5ydW4odGV4dCgnQVgnKSk7XG4gICAgICBleHBlY3QocGFyc2luZ0FYLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcbiAgICAgIGV4cGVjdChwYXJzaW5nQVgudG9TdHJpbmcoKSkudG8uYmUuZXFsKCdWYWxpZGF0aW9uLlN1Y2Nlc3MoW1tBLFhdLHJvdz0xO2NvbD0wO3Jlc3Q9XSknKTtcbiAgICB9KTtcbiAgICBpdCgnYW5kIGhhbHQgd2hlbiBYIGlzIHRoZSBmaXJzdCBjaGFyIGluIHRoZSBzdHJpbmcgKEFYcCA9IG1hbnkxKGNob2ljZShbcGNoYXIoXFwnQVxcJyksIFhub3RBZnRlclldKSkpJywgKCkgPT4ge1xuICAgICAgY29uc3QgQVhwID0gbWFueTEoY2hvaWNlKFtwY2hhcignQScpLCBYbm90QWZ0ZXJZXSkpO1xuICAgICAgY29uc3QgcGFyc2luZ0FYID0gQVhwLnJ1bih0ZXh0KCdYQScpKTtcbiAgICAgIGV4cGVjdChwYXJzaW5nQVguaXNTdWNjZXNzKS50by5iZS50cnVlO1xuICAgICAgZXhwZWN0KHBhcnNpbmdBWC50b1N0cmluZygpKS50by5iZS5lcWwoJ1ZhbGlkYXRpb24uU3VjY2VzcyhbW1gsQV0scm93PTE7Y29sPTA7cmVzdD1dKScpO1xuICAgIH0pO1xuICAgIGl0KCdhbmQgaGFsdCB3aGVuIFggaXMgcHJlY2VkZWQgYnkgWSAoWVhwID0gbWFueTEoY2hvaWNlKFtwY2hhcihcXCdZXFwnKSwgWG5vdEFmdGVyWV0pKSknLCAoKSA9PiB7XG4gICAgICBjb25zdCBZWHAgPSBtYW55MShjaG9pY2UoW3BjaGFyKCdZJyksIFhub3RBZnRlclldKSk7XG4gICAgICBjb25zdCBwYXJzaW5nWVggPSBZWHAucnVuKHRleHQoJ1lYJykpO1xuICAgICAgZXhwZWN0KHBhcnNpbmdZWC5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgICBleHBlY3QocGFyc2luZ1lYLnZhbHVlWzFdLnJlc3QoKSkudG8uYmUuZXFsKCdYJyk7XG4gICAgfSk7XG4gIH0pO1xuXG4gIGRlc2NyaWJlKCdjYW4gcGFyc2UgWCBmb2xsb3dlZCBieSBZIChYYmVmb3JlWSA9IGZvbGxvd2VkQnlQKFxcJ1lcXCcsIFxcJ1hcXCcpKScsICgpID0+IHtcbiAgICBjb25zdCBYYmVmb3JlWSA9IGZvbGxvd2VkQnlQKCdZJywgJ1gnKTtcbiAgICBpdCgnd2l0aG91dCBjb25zdW1pbmcgdGhlIGNoYXJhY3RlcicsICgpID0+IHtcbiAgICAgIGNvbnN0IFhZcCA9IG1hbnkxKGNob2ljZShbWGJlZm9yZVksIHBjaGFyKCdZJyldKSk7XG4gICAgICBjb25zdCBwYXJzaW5nWFkgPSBYWXAucnVuKHRleHQoJ1hZJykpO1xuICAgICAgZXhwZWN0KHBhcnNpbmdYWS5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgICBleHBlY3QocGFyc2luZ1hZLnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgnVmFsaWRhdGlvbi5TdWNjZXNzKFtbWCxZXSxyb3c9MTtjb2w9MDtyZXN0PV0pJyk7XG4gICAgfSk7XG4gICAgaXQoJ2FuZCBmYWlsIHdoZW4gWCBpcyBub3QgZm9sbG93ZWQgYnkgWSAoWEFwID0gbWFueTEoY2hvaWNlKFtYYmVmb3JlWSwgcGNoYXIoXFwnQVxcJyldKSkpJywgKCkgPT4ge1xuICAgICAgY29uc3QgWEFwID0gbWFueTEoY2hvaWNlKFtYYmVmb3JlWSwgcGNoYXIoJ0EnKV0pKTtcbiAgICAgIGNvbnN0IHBhcnNpbmdYQSA9IFhBcC5ydW4odGV4dCgnWEEnKSk7XG4gICAgICBleHBlY3QocGFyc2luZ1hBLmlzRmFpbHVyZSkudG8uYmUudHJ1ZTtcbiAgICAgIC8vIGV4cGVjdChwYXJzaW5nWEEudmFsdWVbMV0ucmVzdCgpKS50by5iZS5lcWwoJ1gnKTtcbiAgICB9KTtcbiAgICBpdCgnYW5kIGZhaWwgd2hlbiBYIGlzIGF0IHRoZSBlbmQgb2YgdGhlIHN0cmluZyAoQVhwID0gbWFueTEoY2hvaWNlKFtwY2hhcihcXCdBXFwnKSwgWGJlZm9yZVldKSkpJywgKCkgPT4ge1xuICAgICAgY29uc3QgQVhwID0gbWFueTEoY2hvaWNlKFtwY2hhcignQScpLCBYYmVmb3JlWV0pKTtcbiAgICAgIGNvbnN0IHBhcnNpbmdBWCA9IEFYcC5ydW4odGV4dCgnQVgnKSk7XG4gICAgICBleHBlY3QocGFyc2luZ0FYLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcbiAgICAgIGV4cGVjdChwYXJzaW5nQVgudmFsdWVbMV0ucmVzdCgpKS50by5iZS5lcWwoJ1gnKTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgZGVzY3JpYmUoJ2NhbiBwYXJzZSBYIG5vdCBmb2xsb3dlZCBieSBZIChYbm90QmVmb3JlWSA9IG5vdEZvbGxvd2VkQnlQKFxcJ1lcXCcsIFxcJ1hcXCcpKScsICgpID0+IHtcbiAgICBjb25zdCBYbm90QmVmb3JlWSA9IG5vdEZvbGxvd2VkQnlQKCdZJywgJ1gnKTtcblxuICAgIGl0KCd3aXRob3V0IGNvbnN1bWluZyB0aGUgY2hhcmFjdGVyIChYQXAgPSBtYW55MShjaG9pY2UoW1hub3RCZWZvcmVZLCBwY2hhcihcXCdBXFwnKV0pKSknLCAoKSA9PiB7XG4gICAgICBjb25zdCBYQXAgPSBtYW55MShjaG9pY2UoW1hub3RCZWZvcmVZLCBwY2hhcignQScpXSkpO1xuICAgICAgY29uc3QgcGFyc2luZ1hBID0gWEFwLnJ1bih0ZXh0KCdYQScpKTtcbiAgICAgIGV4cGVjdChwYXJzaW5nWEEuaXNTdWNjZXNzKS50by5iZS50cnVlO1xuICAgICAgZXhwZWN0KHBhcnNpbmdYQS50b1N0cmluZygpKS50by5iZS5lcWwoJ1ZhbGlkYXRpb24uU3VjY2VzcyhbW1gsQV0scm93PTE7Y29sPTA7cmVzdD1dKScpO1xuICAgIH0pO1xuICAgIGl0KCdhbmQgc3VjY2VlZCB3aGVuIFggaXMgdGhlIGxhc3QgY2hhciBpbiB0aGUgc3RyaW5nIChBWHAgPSBtYW55MShjaG9pY2UoW3BjaGFyKFxcJ0FcXCcpLCBYbm90QmVmb3JlWV0pKSknLCAoKSA9PiB7XG4gICAgICBjb25zdCBBWHAgPSBtYW55MShjaG9pY2UoW3BjaGFyKCdBJyksIFhub3RCZWZvcmVZXSkpO1xuICAgICAgY29uc3QgcGFyc2luZ0FYID0gQVhwLnJ1bih0ZXh0KCdBWCcpKTtcbiAgICAgIGV4cGVjdChwYXJzaW5nQVguaXNTdWNjZXNzKS50by5iZS50cnVlO1xuICAgICAgZXhwZWN0KHBhcnNpbmdBWC50b1N0cmluZygpKS50by5iZS5lcWwoJ1ZhbGlkYXRpb24uU3VjY2VzcyhbW0EsWF0scm93PTE7Y29sPTA7cmVzdD1dKScpO1xuICAgIH0pO1xuICAgIGl0KCdhbmQgaGFsdCB3aGVuIFggaXMgZm9sbG93ZWQgYnkgWSAoQVhZcCA9IG1hbnkxKGNob2ljZShbcGNoYXIoXFwnQVxcJyksIFhub3RCZWZvcmVZXSkpKScsICgpID0+IHtcbiAgICAgIGNvbnN0IEFYWXAgPSBtYW55MShjaG9pY2UoW3BjaGFyKCdBJyksIFhub3RCZWZvcmVZXSkpO1xuICAgICAgY29uc3QgcGFyc2luZ0FYWSA9IEFYWXAucnVuKHRleHQoJ0FYWScpKTtcbiAgICAgIGV4cGVjdChwYXJzaW5nQVhZLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcbiAgICAgIGV4cGVjdChwYXJzaW5nQVhZLnZhbHVlWzFdLnJlc3QoKSkudG8uYmUuZXFsKCdYWScpO1xuICAgIH0pO1xuICB9KTtcbn0pO1xuXG5kZXNjcmliZSgnYSBwYXJzZXIgZm9yIG9wdGlvbmFsIGNoYXJhY3RlcnMgKG9wdCknLCAoKSA9PiB7XG4gIGl0KCdjYW4gY2FwdHVyZSBvciBub3QgY2FwdHVyZSBhIGRvdCAob3B0RG90VGhlbkEgPSBvcHQocGNoYXIoXFwnLlxcJykpLmFuZFRoZW4ocGNoYXIoXFwnYVxcJykpKScsICgpID0+IHtcbiAgICBjb25zdCBvcHREb3RUaGVuQSA9IG9wdChwY2hhcignLicpKS5hbmRUaGVuKHBjaGFyKCdhJykpO1xuICAgIGV4cGVjdChvcHREb3RUaGVuQS5ydW4oJy5hYmMnKS50b1N0cmluZygpKVxuICAgICAgLnRvLmJlLmVxbCgnVmFsaWRhdGlvbi5TdWNjZXNzKFtbTWF5YmUuSnVzdCguKSxhXSxyb3c9MDtjb2w9MjtyZXN0PWJjXSknKTtcbiAgICBleHBlY3Qob3B0RG90VGhlbkEucnVuKCdhYmMnKS50b1N0cmluZygpKVxuICAgICAgLnRvLmJlLmVxbCgnVmFsaWRhdGlvbi5TdWNjZXNzKFtbTWF5YmUuTm90aGluZyxhXSxyb3c9MDtjb2w9MTtyZXN0PWJjXSknKTtcbiAgfSk7XG4gIGl0KCdjYW4gY2FwdHVyZSBhIGRvdCBvciBwcm92aWRlIGEgZGVmYXVsdCBhbHRlcm5hdGl2ZSAob3B0RG90V2l0aERlZmF1bHRUaGVuQSA9IG9wdChwY2hhcihcXCcuXFwnKSwgXFwnQUxURVJOQVRJVkVcXCcpLmFuZFRoZW4ocGNoYXIoXFwnYVxcJykpKScsICgpID0+IHtcbiAgICBjb25zdCBvcHREb3RXaXRoRGVmYXVsdFRoZW5BID0gb3B0KHBjaGFyKCcuJyksICdBTFRFUk5BVElWRScpLmFuZFRoZW4ocGNoYXIoJ2EnKSk7XG4gICAgZXhwZWN0KG9wdERvdFdpdGhEZWZhdWx0VGhlbkEucnVuKCdhYmMnKS50b1N0cmluZygpKVxuICAgICAgLnRvLmJlLmVxbCgnVmFsaWRhdGlvbi5TdWNjZXNzKFtbTWF5YmUuSnVzdChBTFRFUk5BVElWRSksYV0scm93PTA7Y29sPTE7cmVzdD1iY10pJyk7XG4gIH0pO1xuICBpdCgnY2FuIHBhcnNlIFNJR05FRCBpbnRlZ2VycyEhISAoQ0hFQ0sgVEhJUyBPVVQhISknLCAoKSA9PiB7XG4gICAgY29uc3QgcGludCA9IG1hbnkxKGFueU9mKGRpZ2l0cykpXG4gICAgICAuZm1hcChsID0+IHBhcnNlSW50KGwucmVkdWNlKChhY2MsIGN1cnIpID0+IGFjYyArIGN1cnIsICcnKSwgMTApKTtcbiAgICBjb25zdCBwU2lnbmVkSW50ID0gb3B0KHBjaGFyKCctJykpXG4gICAgICAuYW5kVGhlbihwaW50KVxuICAgICAgLmZtYXAob3B0U2lnbk51bWJlclBhaXIgPT4gKChvcHRTaWduTnVtYmVyUGFpclswXS5pc0p1c3QpID8gLW9wdFNpZ25OdW1iZXJQYWlyWzFdIDogb3B0U2lnbk51bWJlclBhaXJbMV0pKTtcbiAgICBleHBlY3QocFNpZ25lZEludC5ydW4oJzEzMjQzNTQ2eCcpLnZhbHVlWzBdKS50by5iZS5lcWwoMTMyNDM1NDYpO1xuICAgIGV4cGVjdChwU2lnbmVkSW50LnJ1bignLTEzMjQzNTQ2eCcpLnZhbHVlWzBdKS50by5iZS5lcWwoLTEzMjQzNTQ2KTtcbiAgfSk7XG4gIGl0KCdjYW4gY2FwdHVyZSBvciBub3QgY2FwdHVyZSBhIHdob2xlIHN1YnN0cmluZyAob3B0U3Vic3RyaW5nID0gb3B0KHBzdHJpbmcoXFwnbWFyY29cXCcpKS5hbmRUaGVuKHBzdHJpbmcoXFwnZmF1c3RpbmVsbGlcXCcpKSknLCAoKSA9PiB7XG4gICAgY29uc3Qgb3B0U3Vic3RyaW5nID0gb3B0KHBzdHJpbmcoJ21hcmNvJykpLmFuZFRoZW4ocHN0cmluZygnZmF1c3RpbmVsbGknKSk7XG4gICAgZXhwZWN0KG9wdFN1YnN0cmluZy5ydW4oJ21hcmNvZmF1c3RpbmVsbGl4JykudG9TdHJpbmcoKSlcbiAgICAgIC50by5iZS5lcWwoJ1ZhbGlkYXRpb24uU3VjY2VzcyhbW01heWJlLkp1c3QoW20sYSxyLGMsb10pLFtmLGEsdSxzLHQsaSxuLGUsbCxsLGldXSxyb3c9MDtjb2w9MTY7cmVzdD14XSknKTtcbiAgICBleHBlY3Qob3B0U3Vic3RyaW5nLnJ1bignZmF1c3RpbmVsbGl4JykudG9TdHJpbmcoKSlcbiAgICAgIC50by5iZS5lcWwoJ1ZhbGlkYXRpb24uU3VjY2VzcyhbW01heWJlLk5vdGhpbmcsW2YsYSx1LHMsdCxpLG4sZSxsLGwsaV1dLHJvdz0wO2NvbD0xMTtyZXN0PXhdKScpO1xuICB9KTtcbn0pO1xuXG5kZXNjcmliZSgnYSBjb3VwbGUgb2YgcmVzdWx0LWRpc2NhcmRpbmcgcGFyc2VycyAoZGlzY2FyZEZpcnN0LCBkaXNjYXJkU2Vjb25kKScsICgpID0+IHtcbiAgaXQoJ2NhbiBkZWNpZGUgdG8gZGlzY2FyZCB0aGUgbWF0Y2hlcyBvZiB0aGUgZmlyc3Qgb25lIChkaXNjYXJkSW50ZWdlclNpZ24gPSBwY2hhcihcXCctXFwnKS5kaXNjYXJkRmlyc3QocGRpZ2l0KDgpKSknLCAoKSA9PiB7XG4gICAgY29uc3QgZGlzY2FyZEludGVnZXJTaWduID0gcGNoYXIoJy0nKS5kaXNjYXJkRmlyc3QocGRpZ2l0KDgpKTtcbiAgICBjb25zdCBwYXJzaW5nID0gZGlzY2FyZEludGVnZXJTaWduLnJ1bignLTh4Jyk7XG4gICAgZXhwZWN0KHBhcnNpbmcudG9TdHJpbmcoKSkudG8uYmUuZXFsKCdWYWxpZGF0aW9uLlN1Y2Nlc3MoWzgscm93PTA7Y29sPTI7cmVzdD14XSknKTtcbiAgfSk7XG4gIGl0KCdjYW4gZGVjaWRlIHRvIGRpc2NhcmQgdGhlIG1hdGNoZXMgb2YgdGhlIHNlY29uZCBvbmUgKGRpc2NhcmRTdWZmaXggPSBwc3RyaW5nKFxcJ21hcmNvXFwnKS5kaXNjYXJkU2Vjb25kKG1hbnkxKGFueU9mKHdoaXRlcykpKSknLCAoKSA9PiB7XG4gICAgY29uc3QgZGlzY2FyZFN1ZmZpeCA9IHBzdHJpbmcoJ21hcmNvJykuZGlzY2FyZFNlY29uZChtYW55MShhbnlPZih3aGl0ZXMpKSk7XG4gICAgbGV0IHBhcnNpbmcgPSBkaXNjYXJkU3VmZml4LnJ1bignbWFyY28gZmF1c3RpbmVsbGknKTtcbiAgICBleHBlY3QocGFyc2luZy50b1N0cmluZygpKS50by5iZS5lcWwoJ1ZhbGlkYXRpb24uU3VjY2VzcyhbW20sYSxyLGMsb10scm93PTA7Y29sPTY7cmVzdD1mYXVzdGluZWxsaV0pJyk7XG4gICAgcGFyc2luZyA9IGRpc2NhcmRTdWZmaXgucnVuKCdtYXJjbyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmF1c3RpbmVsbGknKTtcbiAgICBleHBlY3QocGFyc2luZy50b1N0cmluZygpKS50by5iZS5lcWwoJ1ZhbGlkYXRpb24uU3VjY2VzcyhbW20sYSxyLGMsb10scm93PTA7Y29sPTM3O3Jlc3Q9ZmF1c3RpbmVsbGldKScpO1xuICB9KTtcbn0pO1xuXG5kZXNjcmliZSgnYSB0YXBwZXIgZm9yIHBhcnNlcnMgKHRhcFApJywgKCkgPT4ge1xuICBpdCgnY2FuIGRvIHRoaW5ncyB3aXRoIGEgcmVzdWx0IHRoYXRcXCdzIGdvaW5nIHRvIGJlIGRpc2NhcmRlZCcsICgpID0+IHtcbiAgICBjb25zdCB0YXBJbnRvRGlzY2FyZEludGVnZXJTaWduID0gdGFwUChwY2hhcignLScpLCByZXMgPT4ge1xuICAgICAgZXhwZWN0KHJlcykudG8uYmUuZXFsKCctJyk7XG4gICAgfSkuZGlzY2FyZEZpcnN0KHBkaWdpdCg4KSk7XG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXVudXNlZC12YXJzXG4gICAgY29uc3QgcGFyc2luZyA9IHRhcEludG9EaXNjYXJkSW50ZWdlclNpZ24ucnVuKCctOHgnKTtcbiAgfSk7XG59KTtcblxuZGVzY3JpYmUoJ2EgbG9nZ2VyIGZvciBwYXJzZXJzIChsb2dQKScsICgpID0+IHtcbiAgY29uc3Qgc3RvcmVkTG9nID0gY29uc29sZS5sb2c7XG4gIGl0KCdjYW4gbG9nIGludGVybWVkaWF0ZSBwYXJzaW5nIHJlc3VsdHMnLCAoKSA9PiB7XG4gICAgY29uc29sZS5sb2cgPSBtc2cgPT4ge1xuICAgICAgZXhwZWN0KG1zZykudG8uYmUuZXFsKCdwY2hhcl8tOi0nKTtcbiAgICB9O1xuICAgIGNvbnN0IGxvZ0ludGVybWVkaWF0ZVJlc3VsdCA9IGxvZ1AocGNoYXIoJy0nKSlcbiAgICAgIC5kaXNjYXJkRmlyc3QocGRpZ2l0KDgpKTtcbiAgICBjb25zdCBwYXJzaW5nID0gbG9nSW50ZXJtZWRpYXRlUmVzdWx0LnJ1bignLTh4Jyk7XG4gICAgZXhwZWN0KHBhcnNpbmcudG9TdHJpbmcoKSkudG8uYmUuZXFsKCdWYWxpZGF0aW9uLlN1Y2Nlc3MoWzgscm93PTA7Y29sPTI7cmVzdD14XSknKTtcbiAgfSk7XG4gIGl0KCdjYW4gbG9nIGEgcmVzdWx0IHRoYXRcXCdzIGdvaW5nIHRvIGJlIGRpc2NhcmRlZCcsICgpID0+IHtcbiAgICBjb25zb2xlLmxvZyA9IG1zZyA9PiB7XG4gICAgICBleHBlY3QobXNnKS50by5iZS5lcWwoJ21hbnkxIGFueU9mICBcXHRcXG5cXHI6WyAsIF0nKTtcbiAgICB9O1xuICAgIGNvbnN0IGRpc2NhcmRTdWZmaXggPSBwc3RyaW5nKCdtYXJjbycpLmRpc2NhcmRTZWNvbmQobG9nUChtYW55MShhbnlPZih3aGl0ZXMpKSkpO1xuICAgIGNvbnN0IHBhcnNpbmcgPSBkaXNjYXJkU3VmZml4LnJ1bignbWFyY28gIGZhdXN0aW5lbGxpJyk7XG4gICAgZXhwZWN0KHBhcnNpbmcudG9TdHJpbmcoKSkudG8uYmUuZXFsKCdWYWxpZGF0aW9uLlN1Y2Nlc3MoW1ttLGEscixjLG9dLHJvdz0wO2NvbD03O3Jlc3Q9ZmF1c3RpbmVsbGldKScpO1xuICB9KTtcbiAgY29uc29sZS5sb2cgPSBzdG9yZWRMb2c7XG59KTtcblxuZGVzY3JpYmUoJ3BhcnNpbmcgd2hpbGUgZGlzY2FyZGluZyBpbnB1dCAoQURWQU5DRUQgU1RVRkYpJywgZnVuY3Rpb24oKSB7XG4gIHRoaXMudGltZW91dCg1MDAwMDAwMDAwMCk7XG4gIGl0KCdhbGxvd3MgdG8gZXhjbHVkZSBwYXJlbnRoZXNlcycsICgpID0+IHtcbiAgICBjb25zdCBpbnNpZGVQYXJlbnMgPSBwY2hhcignKCcpXG4gICAgICAuZGlzY2FyZEZpcnN0KG1hbnkoYW55T2YobG93ZXJjYXNlcykpKVxuICAgICAgLmRpc2NhcmRTZWNvbmQocGNoYXIoJyknKSk7XG4gICAgZXhwZWN0KGluc2lkZVBhcmVucy5ydW4oJyhtYXJjbyknKS50b1N0cmluZygpKVxuICAgICAgLnRvLmJlLmVxbCgnVmFsaWRhdGlvbi5TdWNjZXNzKFtbbSxhLHIsYyxvXSxyb3c9MTtjb2w9MDtyZXN0PV0pJyk7XG4gICAgZXhwZWN0KGluc2lkZVBhcmVucy5ydW4oJygpJykudG9TdHJpbmcoKSlcbiAgICAgIC50by5iZS5lcWwoJ1ZhbGlkYXRpb24uU3VjY2VzcyhbW10scm93PTE7Y29sPTA7cmVzdD1dKScpO1xuICB9KTtcbiAgaXQoJy4uLmV2ZW4gdXNpbmcgYSB0YWlsb3ItbWFkZSBtZXRob2QgXFwnYmV0d2VlblBhcmVuc1xcJyAoaW5zaWRlUGFyZW5zID0gYmV0d2VlblBhcmVucyhwc3RyaW5nKFxcJ21hcmNvXFwnKSkpJywgKCkgPT4ge1xuICAgIGNvbnN0IGluc2lkZVBhcmVucyA9IGJldHdlZW5QYXJlbnMocHN0cmluZygnbWFyY28nKSk7XG4gICAgZXhwZWN0KGluc2lkZVBhcmVucy5ydW4oJyhtYXJjbyknKS50b1N0cmluZygpKVxuICAgICAgLnRvLmJlLmVxbCgnVmFsaWRhdGlvbi5TdWNjZXNzKFtbbSxhLHIsYyxvXSxyb3c9MTtjb2w9MDtyZXN0PV0pJyk7XG4gIH0pO1xuICBpdCgnY2hlcnJ5LXBpY2tpbmcgZWxlbWVudHMgc2VwYXJhdGVkIGJ5IHNlcGFyYXRvcnMgKHN1YnN0cmluZ3NXaXRoQ29tbWFzID0gbWFueShtYW55MShhbnlPZihsb3dlcmNhc2VzKSkuZGlzY2FyZFNlY29uZChwY2hhcihcXCcsXFwnKSkpKScsICgpID0+IHtcbiAgICBjb25zdCBzdWJzdHJpbmdzV2l0aENvbW1hcyA9IG1hbnkobWFueTEoYW55T2YobG93ZXJjYXNlcykpLmRpc2NhcmRTZWNvbmQocGNoYXIoJywnKSkpO1xuICAgIGV4cGVjdChzdWJzdHJpbmdzV2l0aENvbW1hcy5ydW4oJ2EsYixjZCwxJykudG9TdHJpbmcoKSlcbiAgICAgIC50by5iZS5lcWwoJ1ZhbGlkYXRpb24uU3VjY2VzcyhbW1thXSxbYl0sW2MsZF1dLHJvdz0wO2NvbD03O3Jlc3Q9MV0pJyk7XG4gIH0pO1xuICBpdCgnLi4uYWxzbyB3aGVuIGluc2lkZSBhIGxpc3RzJywgKCkgPT4ge1xuICAgIGNvbnN0IHN1YnN0cmluZ3NXaXRoQ29tbWFzID0gbWFueShtYW55MShhbnlPZihsb3dlcmNhc2VzKSkuZGlzY2FyZFNlY29uZChwY2hhcignLCcpKSk7XG4gICAgY29uc3QgbGlzdEVsZW1lbnRzID0gYmV0d2VlbihwY2hhcignWycpLCBzdWJzdHJpbmdzV2l0aENvbW1hcywgcGNoYXIoJ10nKSk7XG4gICAgZXhwZWN0KGxpc3RFbGVtZW50cy5ydW4oJ1thLGIsY2QsbWFyY28sXTEnKS50b1N0cmluZygpKVxuICAgICAgLnRvLmJlLmVxbCgnVmFsaWRhdGlvbi5TdWNjZXNzKFtbW2FdLFtiXSxbYyxkXSxbbSxhLHIsYyxvXV0scm93PTA7Y29sPTE1O3Jlc3Q9MV0pJyk7XG4gIH0pO1xuICBkZXNjcmliZSgndGhhbmtzIHRvIHRoZSBzcGVjaWZpYyBzZXBCeTEgb3BlcmF0b3IgKGludHJvZHVjdGlvbiB0byBKU09OIHBhcnNlcnMpJywgKCkgPT4ge1xuICAgIGNvbnN0IHZhbHVlc1AgPSBtYW55MShhbnlPZihsb3dlcmNhc2VzKSk7XG4gICAgY29uc3QgY29tbWFQID0gcGNoYXIoJywnKTtcbiAgICBpdCgnY2hlcnJ5LXBpY2tpbmcgMSsgZWxlbWVudHMgc2VwYXJhdGVkIGJ5IHNlcGFyYXRvcnMnLCAoKSA9PiB7XG4gICAgICAvLyBkZWJ1Z2dlcjtcbiAgICAgIGNvbnN0IHJlc3VsdCA9IHNlcEJ5MSh2YWx1ZXNQLCBjb21tYVApLnJ1bignYSxiLGNkJykudG9TdHJpbmcoKTtcbiAgICAgIGV4cGVjdChyZXN1bHQpXG4gICAgICAgIC50by5iZS5lcWwoJ1ZhbGlkYXRpb24uU3VjY2VzcyhbW1thXSxbYl0sW2MsZF1dLHJvdz0xO2NvbD0wO3Jlc3Q9XSknKTtcbiAgICB9KTtcbiAgICBpdCgnYnV0IHVuYWJsZSB0byBjaGVycnktcGljayAwKyBlbGVtZW50cyBzZXBhcmF0ZWQgYnkgc2VwYXJhdG9ycycsICgpID0+IHtcbiAgICAgIGNvbnN0IHJlc3VsdCA9IHNlcEJ5MSh2YWx1ZXNQLCBjb21tYVApLnJ1bignJyk7XG4gICAgICBleHBlY3QocmVzdWx0LmlzRmFpbHVyZSkudG8uYmUudHJ1ZTtcbiAgICB9KTtcbiAgICBkZXNjcmliZSgnYWxzbyBhYmxlIHRvIGhhbmRsZSBsaXN0cycsICgpID0+IHtcbiAgICAgIGNvbnN0IGxpc3RFbGVtZW50cyA9IGJldHdlZW4ocGNoYXIoJ1snKSwgc2VwQnkxKHZhbHVlc1AsIGNvbW1hUCksIHBjaGFyKCddJykpO1xuICAgICAgaXQoJy4uLmxpc3RzIHdpdGggbWFueSBlbGVtZW50cycsICgpID0+IHtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gbGlzdEVsZW1lbnRzLnJ1bignW2EsYixjZCxtYXJjb10nKS50b1N0cmluZygpO1xuICAgICAgICBleHBlY3QocmVzdWx0KVxuICAgICAgICAgIC50by5iZS5lcWwoJ1ZhbGlkYXRpb24uU3VjY2VzcyhbW1thXSxbYl0sW2MsZF0sW20sYSxyLGMsb11dLHJvdz0xO2NvbD0wO3Jlc3Q9XSknKTtcbiAgICAgIH0pO1xuICAgICAgaXQoJy4uLmxpc3RzIHdpdGgganVzdCBvbmUgZWxlbWVudCcsICgpID0+IHtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gbGlzdEVsZW1lbnRzLnJ1bignW2FdJykudG9TdHJpbmcoKTtcbiAgICAgICAgZXhwZWN0KHJlc3VsdClcbiAgICAgICAgICAudG8uYmUuZXFsKCdWYWxpZGF0aW9uLlN1Y2Nlc3MoW1tbYV1dLHJvdz0xO2NvbD0wO3Jlc3Q9XSknKTtcbiAgICAgIH0pO1xuICAgICAgaXQoJy4uLmJ1dCB1bmFibGUgdG8gaGFuZGxlIGxpc3RzIHdpdGggbm8gZWxlbWVudHMnLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGxpc3RFbGVtZW50cy5ydW4oJ1tdJyk7XG4gICAgICAgIGV4cGVjdChyZXN1bHQuaXNGYWlsdXJlKS50by5iZS50cnVlO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH0pO1xuICBkZXNjcmliZSgndGhhbmtzIHRvIHRoZSBzcGVjaWZpYyBzZXBCeSBvcGVyYXRvciAoaW50cm9kdWN0aW9uIHRvIEpTT04gcGFyc2VycyknLCAoKSA9PiB7XG4gICAgY29uc3QgdmFsdWVzUCA9IG1hbnkxKGFueU9mKGxvd2VyY2FzZXMpKTtcbiAgICBjb25zdCBjb21tYVAgPSBwY2hhcignLCcpO1xuICAgIGl0KCdjaGVycnktcGlja2luZyAwKyBlbGVtZW50cyBzZXBhcmF0ZWQgYnkgc2VwYXJhdG9ycycsICgpID0+IHtcbiAgICAgIC8vIGRlYnVnZ2VyO1xuICAgICAgY29uc3QgcmVzdWx0ID0gc2VwQnkodmFsdWVzUCwgY29tbWFQKS5ydW4oJ2EsYixjZCcpLnRvU3RyaW5nKCk7XG4gICAgICBleHBlY3QocmVzdWx0KVxuICAgICAgICAudG8uYmUuZXFsKCdWYWxpZGF0aW9uLlN1Y2Nlc3MoW1tbYV0sW2JdLFtjLGRdXSxyb3c9MTtjb2w9MDtyZXN0PV0pJyk7XG4gICAgfSk7XG4gICAgaXQoJ3N0aWxsIGFibGUgdG8gY2hlcnJ5LXBpY2sgMCsgZWxlbWVudHMgc2VwYXJhdGVkIGJ5IHNlcGFyYXRvcnMnLCAoKSA9PiB7XG4gICAgICBjb25zdCByZXN1bHQgPSBzZXBCeSh2YWx1ZXNQLCBjb21tYVApLnJ1bignOycpO1xuICAgICAgY29uc3QgcmVzU3RyaW5nID0gcmVzdWx0LnRvU3RyaW5nKCk7XG4gICAgICBleHBlY3QocmVzU3RyaW5nKVxuICAgICAgICAudG8uYmUuZXFsKCdWYWxpZGF0aW9uLlN1Y2Nlc3MoW1tdLDtdKScpOyAvLyBXSFk/Pz8hISE/Pz8hISFcbiAgICB9KTtcbiAgICBkZXNjcmliZSgnYWxzbyBhYmxlIHRvIGhhbmRsZSBsaXN0cycsICgpID0+IHtcbiAgICAgIGNvbnN0IGxpc3RFbGVtZW50cyA9IGJldHdlZW4ocGNoYXIoJ1snKSwgc2VwQnkodmFsdWVzUCwgY29tbWFQKSwgcGNoYXIoJ10nKSk7XG4gICAgICBpdCgnLi4ubGlzdHMgd2l0aCBtYW55IGVsZW1lbnRzJywgKCkgPT4ge1xuICAgICAgICBjb25zdCByZXN1bHQgPSBsaXN0RWxlbWVudHMucnVuKCdbYSxiLGNkLG1hcmNvXScpLnRvU3RyaW5nKCk7XG4gICAgICAgIGV4cGVjdChyZXN1bHQpXG4gICAgICAgICAgLnRvLmJlLmVxbCgnVmFsaWRhdGlvbi5TdWNjZXNzKFtbW2FdLFtiXSxbYyxkXSxbbSxhLHIsYyxvXV0scm93PTE7Y29sPTA7cmVzdD1dKScpO1xuICAgICAgfSk7XG4gICAgICBpdCgnLi4ubGlzdHMgd2l0aCBqdXN0IG9uZSBlbGVtZW50JywgKCkgPT4ge1xuICAgICAgICBjb25zdCByZXN1bHQgPSBsaXN0RWxlbWVudHMucnVuKCdbYV0nKS50b1N0cmluZygpO1xuICAgICAgICBleHBlY3QocmVzdWx0KVxuICAgICAgICAgIC50by5iZS5lcWwoJ1ZhbGlkYXRpb24uU3VjY2VzcyhbW1thXV0scm93PTE7Y29sPTA7cmVzdD1dKScpO1xuICAgICAgfSk7XG4gICAgICBpdCgnLi4uc3RpbGwgYWJsZSB0byBoYW5kbGUgbGlzdHMgd2l0aCBubyBlbGVtZW50cycsICgpID0+IHtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gbGlzdEVsZW1lbnRzLnJ1bignW10nKTtcbiAgICAgICAgY29uc3QgcmVzU3RyaW5nID0gcmVzdWx0LnRvU3RyaW5nKCk7XG4gICAgICAgIGV4cGVjdChyZXNTdHJpbmcpXG4gICAgICAgICAgLnRvLmJlLmVxbCgnVmFsaWRhdGlvbi5TdWNjZXNzKFtbXSxyb3c9MTtjb2w9MDtyZXN0PV0pJyk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfSk7XG59KTtcbiJdfQ==