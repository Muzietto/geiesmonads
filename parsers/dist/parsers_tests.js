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

    describe('a very simple parser for chars or for digits', function () {
        var parserA = (0, _parsers.charParser)('a');
        var parser1 = (0, _parsers.digitParser)(1);

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

    describe('a named character parser', function () {
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

    describe('two parsers bound by andThen', function () {
        var parserAandB = (0, _parsers.andThen)((0, _parsers.pchar)('a'), (0, _parsers.pchar)('b'));

        it('can parse two chars', function () {
            (0, _chai.expect)((0, _util.isParser)(parserAandB)).to.be.true;
            var parsingAandB = parserAandB.run(text('abc'));
            (0, _chai.expect)(parsingAandB.isSuccess).to.be.true;
            (0, _chai.expect)(parsingAandB.value[0].toString()).to.be.eql('[a,b]');
            (0, _chai.expect)(parsingAandB.value[1].rest()).to.be.eql('c');
            (0, _chai.expect)(parsingAandB.toString()).to.be.eql('Validation.Success([[a,b],row=0;col=2;rest=c])');
        });

        it('can also NOT parse two chars', function () {
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

    describe('two parsers bound by orElse', function () {
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

    describe('a choice of parsers bound by orElse', function () {
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

        it('can also parse NONE of four chars', function () {
            var parsingChoice = parsersChoice.run(text('x'));
            (0, _chai.expect)(parsingChoice.isFailure).to.be.true;
            (0, _chai.expect)(parsingChoice.value[0]).to.be.eql('choice /pchar_a/pchar_b/pchar_c/pchar_d');
            (0, _chai.expect)(parsingChoice.value[1]).to.be.eql('_fail');
            (0, _chai.expect)(parsingChoice.value[2].rest()).to.be.eql('x');
        });

        it('will fail if the input is too short', function () {
            (0, _chai.expect)(parsersChoice.run(text('a')).isSuccess).to.be.true;
            (0, _chai.expect)(parsersChoice.run(text('')).isFailure).to.be.true;
        });
    });

    describe('a parser for any of a list of chars', function () {
        it('can parse any lowercase char', function () {
            var lowercasesParser = (0, _parsers.anyOf)(lowercases);

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

            parsingChoice = lowercasesParser.run(text('Y'));
            (0, _chai.expect)(parsingChoice.isFailure).to.be.true;
            (0, _chai.expect)(parsingChoice.value[0]).to.be.eql('anyOf abcdefghijklmnopqrstuvwxyz');
            (0, _chai.expect)(parsingChoice.value[1]).to.be.eql('_fail');
            (0, _chai.expect)(parsingChoice.value[2].rest()).to.be.eql('Y');
        });

        it('can parse any uppercase char', function () {
            var uppercasesParser = (0, _parsers.anyOf)(uppercases);

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

            parsingChoice = uppercasesParser.run(text('s'));
            (0, _chai.expect)(parsingChoice.isFailure).to.be.true;
            (0, _chai.expect)(parsingChoice.value[0]).to.be.eql('anyOf ABCDEFGHIJKLMNOPQRSTUVWXYZ');
            (0, _chai.expect)(parsingChoice.value[1]).to.be.eql('_fail');
            (0, _chai.expect)(parsingChoice.value[2].rest()).to.be.eql('s');
        });

        it('can parse any digit', function () {
            var digitsParser = (0, _parsers.anyOf)(digits);

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

            parsingChoice = digitsParser.run(text('s'));
            (0, _chai.expect)(parsingChoice.isFailure).to.be.true;
            (0, _chai.expect)(parsingChoice.value[0]).to.be.eql('anyOf 0123456789');
            (0, _chai.expect)(parsingChoice.value[1]).to.be.eql('_fail');
            (0, _chai.expect)(parsingChoice.value[2].rest()).to.be.eql('s');
        });

        it('will fail if the input is too short', function () {
            (0, _chai.expect)((0, _parsers.anyOf)(lowercases).run(text('')).isFailure).to.be.true;
            (0, _chai.expect)((0, _parsers.anyOf)(digits).run(text('')).isFailure).to.be.true;
        });
    });
    describe('parse ABC', function () {
        it('parses ABC', function () {
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
    });

    describe('parse 3 digits', function () {
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
            var unpacker = function unpacker(_ref3) {
                var _ref4 = _slicedToArray(_ref3, 2),
                    x = _ref4[0],
                    _ref4$ = _slicedToArray(_ref4[1], 2),
                    y = _ref4$[0],
                    z = _ref4$[1];

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

    describe('sequences of parsers based on andThen && fmap (aka sequenceP2)', function () {
        it('store matched chars inside a plain string', function () {
            var abcParser = (0, _parsers.sequenceP2)([(0, _parsers.pchar)('a'), (0, _parsers.pchar)('b'), (0, _parsers.pchar)('c')]);
            (0, _chai.expect)(abcParser.run('abc').toString()).to.be.eql('Validation.Success([abc,row=1;col=0;rest=])');
        });
    });

    describe('sequences of parsers based on lift2(cons) (aka sequenceP)', function () {
        it('stores matched chars inside an array', function () {
            var abcParser = (0, _parsers.sequenceP)([(0, _parsers.pchar)('a'), (0, _parsers.pchar)('b'), (0, _parsers.pchar)('c')]);
            (0, _chai.expect)(abcParser.run('abc').toString()).to.be.eql('Validation.Success([[a,b,c],row=1;col=0;rest=])');
        });
    });

    describe('a parser for a specific sequence of chars', function () {
        it('is easy to create with sequenceP', function () {
            var marcoParser = (0, _parsers.pstring)('marco');
            var marcoParsing = marcoParser.run('marcociao');
            (0, _chai.expect)(marcoParsing.isSuccess).to.be.true;
            (0, _chai.expect)(marcoParsing.toString()).to.be.eql('Validation.Success([[m,a,r,c,o],row=0;col=5;rest=ciao])');
        });
    });

    describe('a parser for a specific word', function () {
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

    describe('a parsing function for zero or more occurrences', function () {
        it('can parse a char zero times', function () {
            var zeroOrMoreParsingFunction = (0, _parsers.zeroOrMore)((0, _parsers.pchar)('m'));
            var parsing = zeroOrMoreParsingFunction(text('arco'));
            (0, _chai.expect)(parsing.isSuccess).to.be.true;
            (0, _chai.expect)(parsing.toString()).to.be.eql('Validation.Success([[],row=0;col=0;rest=arco])');
        });
        it('can parse a char many times', function () {
            var zeroOrMoreParsingFunction = (0, _parsers.zeroOrMore)((0, _parsers.pchar)('m'));
            var parsing = zeroOrMoreParsingFunction(text('mmmarco'));
            (0, _chai.expect)(parsing.isSuccess).to.be.true;
            (0, _chai.expect)(parsing.toString()).to.be.eql('Validation.Success([[m,m,m],row=0;col=3;rest=arco])');
        });
        it('can parse a char sequence zero times', function () {
            var zeroOrMoreParsingFunction = (0, _parsers.zeroOrMore)((0, _parsers.pstring)('marco'));
            var parsing = zeroOrMoreParsingFunction(text('xmarcomarcociao'));
            (0, _chai.expect)(parsing.isSuccess).to.be.true;
            (0, _chai.expect)(parsing.toString()).to.be.eql('Validation.Success([[],row=0;col=0;rest=xmarcomarcociao])');
        });
        it('can parse a char sequence many times', function () {
            var zeroOrMoreParsingFunction = (0, _parsers.zeroOrMore)((0, _parsers.pstring)('marco'));
            var parsing = zeroOrMoreParsingFunction(text('marcomarcociao'));
            (0, _chai.expect)(parsing.isSuccess).to.be.true;
            (0, _chai.expect)(parsing.toString()).to.be.eql('Validation.Success([[[m,a,r,c,o],[m,a,r,c,o]],row=0;col=10;rest=ciao])');
        });
    });

    describe('a parser for zero or more occurrences', function () {
        it('can parse a char zero times', function () {
            var zeroOrMoreParser = (0, _parsers.many)((0, _parsers.pchar)('m'));
            var parsing = zeroOrMoreParser.run(text('arco'));
            (0, _chai.expect)(parsing.isSuccess).to.be.true;
            (0, _chai.expect)(parsing.toString()).to.be.eql('Validation.Success([[],row=0;col=0;rest=arco])');
        });
        it('can parse a char many times and return an array', function () {
            var zeroOrMoreParser = (0, _parsers.many)((0, _parsers.pchar)('m'));
            var parsing = zeroOrMoreParser.run(text('mmmarco'));
            (0, _chai.expect)(parsing.isSuccess).to.be.true;
            (0, _chai.expect)(parsing.toString()).to.be.eql('Validation.Success([[m,m,m],row=0;col=3;rest=arco])');
        });
        it('can parse a char exactly n times and return an array (or fail)', function () {
            var exactlyThree = (0, _parsers.many)((0, _parsers.pchar)('m'), 3);
            var parsing = exactlyThree.run(text('mmmarco'));
            (0, _chai.expect)(parsing.isSuccess).to.be.true;
            (0, _chai.expect)(parsing.toString()).to.be.eql('Validation.Success([[m,m,m],row=0;col=3;rest=arco])');
            parsing = exactlyThree.run(text('mmmmarco'));
            (0, _chai.expect)(parsing.isFailure).to.be.true;
            (0, _chai.expect)(parsing.toString()).to.be.eql('Validation.Failure([many pchar_m times=3,times param wanted 3; got 4,row=0;col=0;rest=mmmmarco])');
        });
        it('can parse a char many times and return a string', function () {
            var zeroOrMoreParser = (0, _parsers.manyChars)((0, _parsers.pchar)('m'));
            var parsing = zeroOrMoreParser.run(text('mmmarco'));
            (0, _chai.expect)(parsing.isSuccess).to.be.true;
            (0, _chai.expect)(parsing.toString()).to.be.eql('Validation.Success([mmm,row=0;col=3;rest=arco])');
        });
        it.only('can parse a char exactly n times and return a string (or fail)', function () {
            var exactlyThree = (0, _parsers.manyChars)((0, _parsers.pchar)('m'), 3);
            var parsing = exactlyThree.run(text('mmmarco'));
            (0, _chai.expect)(parsing.isSuccess).to.be.true;
            (0, _chai.expect)(parsing.toString()).to.be.eql('Validation.Success([mmm,row=0;col=3;rest=arco])');
            parsing = exactlyThree.run(text('mmmmarco'));
            (0, _chai.expect)(parsing.isFailure).to.be.true;
            (0, _chai.expect)(parsing.toString()).to.be.eql('Validation.Failure([manyChars pchar_m times=3,times param wanted 3; got 4,row=0;col=0;rest=mmmmarco])');
        });
        it('can parse a char sequence zero times', function () {
            var zeroOrMoreParser = (0, _parsers.many)((0, _parsers.pstring)('marco'));
            var parsing = zeroOrMoreParser.run(text('xmarcomarcociao'));
            (0, _chai.expect)(parsing.isSuccess).to.be.true;
            (0, _chai.expect)(parsing.toString()).to.be.eql('Validation.Success([[],row=0;col=0;rest=xmarcomarcociao])');
        });
        it('can parse a char sequence many times', function () {
            var zeroOrMoreParser = (0, _parsers.many)((0, _parsers.pstring)('marco'));
            var parsing = zeroOrMoreParser.run('marcomarcociao');
            (0, _chai.expect)(parsing.isSuccess).to.be.true;
            (0, _chai.expect)(parsing.toString()).to.be.eql('Validation.Success([[[m,a,r,c,o],[m,a,r,c,o]],row=0;col=10;rest=ciao])');
        });
        it('can parse whitespaces!!', function () {
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

    describe('a parser for one or more occurrences', function () {
        it('cannot parse a char zero times', function () {
            var oneOrMoreParser = (0, _parsers.many1)((0, _parsers.pchar)('m'));
            var parsing = oneOrMoreParser.run('arco');
            (0, _chai.expect)(parsing.isFailure).to.be.true;
            (0, _chai.expect)(parsing.toString()).to.be.eql('Validation.Failure([many1 pchar_m,wanted m; got a,row=0;col=0;rest=arco])');
        });
        it('can parse a char many times and return an array', function () {
            var oneOrMoreParser = (0, _parsers.many1)((0, _parsers.pchar)('m'));
            var parsing = oneOrMoreParser.run('mmmarco');
            (0, _chai.expect)(parsing.isSuccess).to.be.true;
            (0, _chai.expect)(parsing.toString()).to.be.eql('Validation.Success([[m,m,m],row=0;col=3;rest=arco])');
        });
        it('can parse a char many times and return a string', function () {
            var oneOrMoreParser = (0, _parsers.manyChars1)((0, _parsers.pchar)('m'));
            var parsing = oneOrMoreParser.run('mmmarco');
            (0, _chai.expect)(parsing.isSuccess).to.be.true;
            (0, _chai.expect)(parsing.toString()).to.be.eql('Validation.Success([mmm,row=0;col=3;rest=arco])');
        });
        it('cannot parse a char sequence zero times', function () {
            var oneOrMoreParser = (0, _parsers.many1)((0, _parsers.pstring)('marco'));
            var parsing = oneOrMoreParser.run('xmarcomarcociao');
            (0, _chai.expect)(parsing.isFailure).to.be.true;
            (0, _chai.expect)(parsing.toString()).to.be.eql('Validation.Failure([many1 pstring marco,wanted m; got x,row=0;col=0;rest=xmarcomarcociao])');
        });
        it('can parse a char sequence many times', function () {
            var oneOrMoreParser = (0, _parsers.many1)((0, _parsers.pstring)('marco'));
            var parsing = oneOrMoreParser.run('marcomarcociao');
            (0, _chai.expect)(parsing.isSuccess).to.be.true;
            (0, _chai.expect)(parsing.toString()).to.be.eql('Validation.Success([[[m,a,r,c,o],[m,a,r,c,o]],row=0;col=10;rest=ciao])');
        });
        it('can parse an integer, no matter how large...', function () {
            var pint = (0, _parsers.many1)((0, _parsers.anyOf)(digits));
            var parsing = pint.run('12345A');
            (0, _chai.expect)(parsing.isSuccess).to.be.true;
            (0, _chai.expect)(parsing.toString()).to.be.eql('Validation.Success([[1,2,3,4,5],row=0;col=5;rest=A])');
            parsing = pint.run('1B');
            (0, _chai.expect)(parsing.isSuccess).to.be.true;
            (0, _chai.expect)(parsing.toString()).to.be.eql('Validation.Success([[1],row=0;col=1;rest=B])');
            parsing = pint.run('A12345');
            (0, _chai.expect)(parsing.isFailure).to.be.true;
            (0, _chai.expect)(parsing.toString()).to.be.eql('Validation.Failure([many1 anyOf 0123456789,_fail,A12345])');
        });
        it('can parse an integer into a true integer', function () {
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

    describe('a parser for optional characters', function () {
        it('can capture or not capture a dot', function () {
            var optDotThenA = (0, _parsers.opt)((0, _parsers.pchar)('.')).andThen((0, _parsers.pchar)('a'));
            (0, _chai.expect)(optDotThenA.run('.abc').toString()).to.be.eql('Validation.Success([[Maybe.Just(.),a],row=0;col=2;rest=bc])');
            (0, _chai.expect)(optDotThenA.run('abc').toString()).to.be.eql('Validation.Success([[Maybe.Nothing,a],row=0;col=1;rest=bc])');
        });
        it('can capture a dot or provide a default alternative', function () {
            var optDotWithDefaultThenA = (0, _parsers.opt)((0, _parsers.pchar)('.'), 'ALTERNATIVE').andThen((0, _parsers.pchar)('a'));
            (0, _chai.expect)(optDotWithDefaultThenA.run('abc').toString()).to.be.eql('Validation.Success([[Maybe.Just(ALTERNATIVE),a],row=0;col=1;rest=bc])');
        });
        it('can parse SIGNED integers!!!', function () {
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
        it('can capture or not capture a whole substring', function () {
            var optSubstring = (0, _parsers.opt)((0, _parsers.pstring)('marco')).andThen((0, _parsers.pstring)('faustinelli'));
            (0, _chai.expect)(optSubstring.run('marcofaustinellix').toString()).to.be.eql('Validation.Success([[Maybe.Just([m,a,r,c,o]),[f,a,u,s,t,i,n,e,l,l,i]],row=0;col=16;rest=x])');
            (0, _chai.expect)(optSubstring.run('faustinellix').toString()).to.be.eql('Validation.Success([[Maybe.Nothing,[f,a,u,s,t,i,n,e,l,l,i]],row=0;col=11;rest=x])');
        });
    });

    describe('a couple of parsers', function () {
        it('can decide to discard the matches of the first one', function () {
            var discardIntegerSign = (0, _parsers.pchar)('-').discardFirst((0, _parsers.pdigit)(8));
            var parsing = discardIntegerSign.run('-8x');
            (0, _chai.expect)(parsing.toString()).to.be.eql('Validation.Success([8,row=0;col=2;rest=x])');
        });
        it('can decide to discard the matches of the second one', function () {
            var discardSuffix = (0, _parsers.pstring)('marco').discardSecond((0, _parsers.many1)((0, _parsers.anyOf)(whites)));
            var parsing = discardSuffix.run('marco faustinelli');
            (0, _chai.expect)(parsing.toString()).to.be.eql('Validation.Success([[m,a,r,c,o],row=0;col=6;rest=faustinelli])');
            parsing = discardSuffix.run('marco                                faustinelli');
            (0, _chai.expect)(parsing.toString()).to.be.eql('Validation.Success([[m,a,r,c,o],row=0;col=37;rest=faustinelli])');
        });
    });

    describe('a tapper for parsers', function () {
        it('can do things with a result that\'s going to be discarded', function () {
            var tapIntoDiscardIntegerSign = (0, _parsers.tapP)((0, _parsers.pchar)('-'), function (res) {
                (0, _chai.expect)(res).to.be.eql('-');
            }).discardFirst((0, _parsers.pdigit)(8));
            var parsing = tapIntoDiscardIntegerSign.run('-8x');
        });
    });

    describe('a logger for parsers', function () {
        var storedLog = console.log;
        it('can log intermediate parsing results', function () {
            console.log = function (msg) {
                (0, _chai.expect)(msg).to.be.eql('-');
            };
            var logIntermediateResult = (0, _parsers.logP)((0, _parsers.pchar)('-')).discardFirst((0, _parsers.pdigit)(8));
            var parsing = logIntermediateResult.run('-8x');
        });
        it('can log a result that\'s going to be discarded', function () {
            console.log = function (msg) {
                (0, _chai.expect)(msg).to.be.eql([' ', ' ']);
            };
            var discardSuffix = (0, _parsers.pstring)('marco').discardSecond((0, _parsers.logP)((0, _parsers.many1)((0, _parsers.anyOf)(whites))));
            var parsing = discardSuffix.run('marco  faustinelli');
        });
        console.log = storedLog;
    });

    describe('parsing while discarding input', function () {
        it('allows to exclude parentheses', function () {
            var insideParens = (0, _parsers.pchar)('(').discardFirst((0, _parsers.many)((0, _parsers.anyOf)(lowercases))).discardSecond((0, _parsers.pchar)(')'));
            (0, _chai.expect)(insideParens.run('(marco)').toString()).to.be.eql('Validation.Success([[m,a,r,c,o],row=1;col=0;rest=])');
            (0, _chai.expect)(insideParens.run('()').toString()).to.be.eql('Validation.Success([[],row=1;col=0;rest=])');
        });
        it('...even using a tailor-made method', function () {
            var insideParens = (0, _parsers.betweenParens)((0, _parsers.pstring)('marco'));
            (0, _chai.expect)(insideParens.run('(marco)').toString()).to.be.eql('Validation.Success([[m,a,r,c,o],row=1;col=0;rest=])');
        });
        it('cherry-picking elements separated by separators', function () {
            var substringsWithCommas = (0, _parsers.many)((0, _parsers.many1)((0, _parsers.anyOf)(lowercases)).discardSecond((0, _parsers.pchar)(',')));
            (0, _chai.expect)(substringsWithCommas.run('a,b,cd,1').toString()).to.be.eql('Validation.Success([[[a],[b],[c,d]],row=0;col=7;rest=1])');
        });
        it('...also when inside a lists', function () {
            var substringsWithCommas = (0, _parsers.many)((0, _parsers.many1)((0, _parsers.anyOf)(lowercases)).discardSecond((0, _parsers.pchar)(',')));
            var listElements = (0, _parsers.between)((0, _parsers.pchar)('['), substringsWithCommas, (0, _parsers.pchar)(']'));
            (0, _chai.expect)(listElements.run('[a,b,cd,marco,]1').toString()).to.be.eql('Validation.Success([[[a],[b],[c,d],[m,a,r,c,o]],row=0;col=15;rest=1])');
        });
        describe('thanks to the specific sepBy1 operator', function () {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2pzLXNwZWMvcGFyc2Vyc190ZXN0cy5qcyJdLCJuYW1lcyI6WyJsb3dlcmNhc2VzIiwidXBwZXJjYXNlcyIsImRpZ2l0cyIsIndoaXRlcyIsInRleHQiLCJmcm9tVGV4dCIsImRlc2NyaWJlIiwicGFyc2VyQSIsInBhcnNlcjEiLCJpdCIsInBhcnNpbmdBIiwidmFsdWUiLCJ0byIsImJlIiwiZXFsIiwicmVzdCIsImlzU3VjY2VzcyIsInRydWUiLCJwYXJzaW5nQiIsImlzRmFpbHVyZSIsInBhcnNpbmcxIiwicGFyc2luZzIiLCJwYXJzaW5nMyIsInJ1biIsInBhcnNlckFhbmRCIiwicGFyc2luZ0FhbmRCIiwidG9TdHJpbmciLCJwYXJzZXJBb3JCIiwicGFyc2luZ0FvckIiLCJwYXJzZXJzQ2hvaWNlIiwicGFyc2luZ0Nob2ljZSIsImxvd2VyY2FzZXNQYXJzZXIiLCJ1cHBlcmNhc2VzUGFyc2VyIiwiZGlnaXRzUGFyc2VyIiwicGFpckFkZGVyIiwieCIsInkiLCJhYmNQIiwiZm1hcCIsInBhcnNpbmciLCJwYXJzZURpZ2l0IiwidGhyZWVEaWdpdHMiLCJiZWZvcmUiLCJ1bnBhY2tlciIsInoiLCJ0aHJlZURpZ2l0c0ltcGwiLCJ0aHJlZURpZ2l0c0luc3QiLCJhZGRTdHJpbmdzIiwiQXBsdXNCIiwiYWRkRGlnaXRzIiwiYWRkUGFyc2VyIiwiYWJjUGFyc2VyIiwibWFyY29QYXJzZXIiLCJtYXJjb1BhcnNpbmciLCJ6ZXJvT3JNb3JlUGFyc2luZ0Z1bmN0aW9uIiwiemVyb09yTW9yZVBhcnNlciIsImV4YWN0bHlUaHJlZSIsIm9ubHkiLCJ3aGl0ZXNQYXJzZXIiLCJ0d29Xb3JkcyIsIm9uZU9yTW9yZVBhcnNlciIsInBpbnQiLCJwYXJzZUludCIsImwiLCJyZWR1Y2UiLCJhY2MiLCJjdXJyIiwib3B0RG90VGhlbkEiLCJhbmRUaGVuIiwib3B0RG90V2l0aERlZmF1bHRUaGVuQSIsInBTaWduZWRJbnQiLCJvcHRTaWduTnVtYmVyUGFpciIsImlzSnVzdCIsIm9wdFN1YnN0cmluZyIsImRpc2NhcmRJbnRlZ2VyU2lnbiIsImRpc2NhcmRGaXJzdCIsImRpc2NhcmRTdWZmaXgiLCJkaXNjYXJkU2Vjb25kIiwidGFwSW50b0Rpc2NhcmRJbnRlZ2VyU2lnbiIsInJlcyIsInN0b3JlZExvZyIsImNvbnNvbGUiLCJsb2ciLCJtc2ciLCJsb2dJbnRlcm1lZGlhdGVSZXN1bHQiLCJpbnNpZGVQYXJlbnMiLCJzdWJzdHJpbmdzV2l0aENvbW1hcyIsImxpc3RFbGVtZW50cyIsInZhbHVlc1AiLCJjb21tYVAiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBNkNBLFFBQU1BLGFBQWEsQ0FBQyxHQUFELEVBQU0sR0FBTixFQUFXLEdBQVgsRUFBZ0IsR0FBaEIsRUFBcUIsR0FBckIsRUFBMEIsR0FBMUIsRUFBK0IsR0FBL0IsRUFBb0MsR0FBcEMsRUFBeUMsR0FBekMsRUFBOEMsR0FBOUMsRUFBbUQsR0FBbkQsRUFBd0QsR0FBeEQsRUFBNkQsR0FBN0QsRUFBa0UsR0FBbEUsRUFBdUUsR0FBdkUsRUFBNEUsR0FBNUUsRUFBaUYsR0FBakYsRUFBc0YsR0FBdEYsRUFBMkYsR0FBM0YsRUFBZ0csR0FBaEcsRUFBcUcsR0FBckcsRUFBMEcsR0FBMUcsRUFBK0csR0FBL0csRUFBb0gsR0FBcEgsRUFBeUgsR0FBekgsRUFBOEgsR0FBOUgsQ0FBbkI7QUFDQSxRQUFNQyxhQUFhLENBQUMsR0FBRCxFQUFNLEdBQU4sRUFBVyxHQUFYLEVBQWdCLEdBQWhCLEVBQXFCLEdBQXJCLEVBQTBCLEdBQTFCLEVBQStCLEdBQS9CLEVBQW9DLEdBQXBDLEVBQXlDLEdBQXpDLEVBQThDLEdBQTlDLEVBQW1ELEdBQW5ELEVBQXdELEdBQXhELEVBQTZELEdBQTdELEVBQWtFLEdBQWxFLEVBQXVFLEdBQXZFLEVBQTRFLEdBQTVFLEVBQWlGLEdBQWpGLEVBQXNGLEdBQXRGLEVBQTJGLEdBQTNGLEVBQWdHLEdBQWhHLEVBQXFHLEdBQXJHLEVBQTBH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QU04RSxlQUFlLHNCQUFRLG9CQUFNLEdBQU4sQ0FBUixFQUFvQixxQkFBT0MsT0FBUCxFQUFnQkMsTUFBaEIsQ0FBcEIsRUFBNkMsb0JBQU0sR0FBTixDQUE3QyxDQUFyQjtBQUNBLGtDQUFPRixhQUFhaEUsR0FBYixDQUFpQixJQUFqQixFQUF1QkcsUUFBdkIsRUFBUCxFQUNLZCxFQURMLENBQ1FDLEVBRFIsQ0FDV0MsR0FEWCxDQUNlLDRDQURmO0FBRUgsYUFKRDtBQUtBTCxlQUFHLGdDQUFILEVBQXFDLFlBQU07QUFDdkMsb0JBQU04RSxlQUFlLHNCQUFRLG9CQUFNLEdBQU4sQ0FBUixFQUFvQixxQkFBT0MsT0FBUCxFQUFnQkMsTUFBaEIsQ0FBcEIsRUFBNkMsb0JBQU0sR0FBTixDQUE3QyxDQUFyQjtBQUNBLGtDQUFPRixhQUFhaEUsR0FBYixDQUFpQixLQUFqQixFQUF3QkcsUUFBeEIsRUFBUCxFQUNLZCxFQURMLENBQ1FDLEVBRFIsQ0FDV0MsR0FEWCxDQUNlLCtDQURmO0FBRUgsYUFKRDtBQUtILFNBdEJEO0FBdUJILEtBakREIiwiZmlsZSI6InBhcnNlcnNfdGVzdHMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge2V4cGVjdH0gZnJvbSAnY2hhaSc7XG5pbXBvcnQge1xuICAgIGNoYXJQYXJzZXIsXG4gICAgZGlnaXRQYXJzZXIsXG4gICAgcGNoYXIsXG4gICAgcGRpZ2l0LFxuICAgIGFuZFRoZW4sXG4gICAgb3JFbHNlLFxuICAgIGNob2ljZSxcbiAgICBhbnlPZixcbiAgICBmbWFwLFxuICAgIHJldHVyblAsXG4gICAgYXBwbHlQLFxuICAgIGxpZnQyLFxuICAgIHNlcXVlbmNlUCxcbiAgICBzZXF1ZW5jZVAyLFxuICAgIHBzdHJpbmcsXG4gICAgemVyb09yTW9yZSxcbiAgICBtYW55LFxuICAgIG1hbnkxLFxuICAgIG1hbnlDaGFycyxcbiAgICBtYW55Q2hhcnMxLFxuICAgIG9wdCxcbiAgICBvcHRCb29rLFxuICAgIGRpc2NhcmRGaXJzdCxcbiAgICBkaXNjYXJkU2Vjb25kLFxuICAgIHNlcEJ5MSxcbiAgICBiZXR3ZWVuLFxuICAgIGJldHdlZW5QYXJlbnMsXG4gICAgdGFwUCxcbiAgICBsb2dQLFxuICAgIHB3b3JkLFxufSBmcm9tICdwYXJzZXJzJztcbmltcG9ydCB7XG4gICAgaXNQYWlyLFxuICAgIGlzU3VjY2VzcyxcbiAgICBpc0ZhaWx1cmUsXG4gICAgaXNQYXJzZXIsXG4gICAgaXNTb21lLFxuICAgIGlzTm9uZSxcbn0gZnJvbSAndXRpbCc7XG5pbXBvcnQge01heWJlfSBmcm9tICdtYXliZSc7XG5pbXBvcnQge1ZhbGlkYXRpb259IGZyb20gJ3ZhbGlkYXRpb24nO1xuaW1wb3J0IHtQb3NpdGlvbn0gZnJvbSAnY2xhc3Nlcyc7XG5cbmNvbnN0IGxvd2VyY2FzZXMgPSBbJ2EnLCAnYicsICdjJywgJ2QnLCAnZScsICdmJywgJ2cnLCAnaCcsICdpJywgJ2onLCAnaycsICdsJywgJ20nLCAnbicsICdvJywgJ3AnLCAncScsICdyJywgJ3MnLCAndCcsICd1JywgJ3YnLCAndycsICd4JywgJ3knLCAneicsXTtcbmNvbnN0IHVwcGVyY2FzZXMgPSBbJ0EnLCAnQicsICdDJywgJ0QnLCAnRScsICdGJywgJ0cnLCAnSCcsICdJJywgJ0onLCAnSycsICdMJywgJ00nLCAnTicsICdPJywgJ1AnLCAnUScsICdSJywgJ1MnLCAnVCcsICdVJywgJ1YnLCAnVycsICdYJywgJ1knLCAnWicsXTtcbmNvbnN0IGRpZ2l0cyA9IFsnMCcsICcxJywgJzInLCAnMycsICc0JywgJzUnLCAnNicsICc3JywgJzgnLCAnOSddO1xuY29uc3Qgd2hpdGVzID0gWycgJywgJ1xcdCcsICdcXG4nLCAnXFxyJ107XG5jb25zdCB0ZXh0ID0gUG9zaXRpb24uZnJvbVRleHQ7XG5cbmRlc2NyaWJlKCdhIHZlcnkgc2ltcGxlIHBhcnNlciBmb3IgY2hhcnMgb3IgZm9yIGRpZ2l0cycsICgpID0+IHtcbiAgICBjb25zdCBwYXJzZXJBID0gY2hhclBhcnNlcignYScpO1xuICAgIGNvbnN0IHBhcnNlcjEgPSBkaWdpdFBhcnNlcigxKTtcblxuICAgIGl0KCdjYW4gcGFyc2UgYSBzaW5nbGUgY2hhcicsICgpID0+IHtcbiAgICAgICAgY29uc3QgcGFyc2luZ0EgPSBwYXJzZXJBKHRleHQoJ2FiYycpKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdBLnZhbHVlWzBdKS50by5iZS5lcWwoJ2EnKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdBLnZhbHVlWzFdLnJlc3QoKSkudG8uYmUuZXFsKCdiYycpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0EuaXNTdWNjZXNzKS50by5iZS50cnVlO1xuICAgIH0pO1xuXG4gICAgaXQoJ2NhbiBhbHNvIE5PVCBwYXJzZSBhIHNpbmdsZSBjaGFyJywgKCkgPT4ge1xuICAgICAgICBjb25zdCBwYXJzaW5nQiA9IHBhcnNlckEodGV4dCgnYmNkJykpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0IudmFsdWVbMF0pLnRvLmJlLmVxbCgnY2hhclBhcnNlcicpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0IudmFsdWVbMV0pLnRvLmJlLmVxbCgnd2FudGVkIGE7IGdvdCBiJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQi52YWx1ZVsyXS5yZXN0KCkpLnRvLmJlLmVxbCgnYmNkJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQi5pc0ZhaWx1cmUpLnRvLmJlLnRydWU7XG4gICAgfSk7XG5cbiAgICBpdCgnZmFpbHMgYXQgdGhlIGVuZCBvZiB0aGUgc3RyZWFtJywgKCkgPT4ge1xuICAgICAgICBjb25zdCBwYXJzaW5nQSA9IHBhcnNlckEodGV4dCgnJykpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0EudmFsdWVbMF0pLnRvLmJlLmVxbCgnY2hhclBhcnNlcicpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0EudmFsdWVbMV0pLnRvLmJlLmVxbCgnbm8gbW9yZSBpbnB1dCcpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0EudmFsdWVbMl0ucmVzdCgpKS50by5iZS5lcWwoJycpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0EuaXNGYWlsdXJlKS50by5iZS50cnVlO1xuICAgIH0pO1xuXG4gICAgaXQoJ2NhbiBwYXJzZSBhIHNpbmdsZSBkaWdpdCcsICgpID0+IHtcbiAgICAgICAgY29uc3QgcGFyc2luZzEgPSBwYXJzZXIxKHRleHQoJzEyMycpKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcxLnZhbHVlWzBdKS50by5iZS5lcWwoMSk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nMS52YWx1ZVsxXS5yZXN0KCkpLnRvLmJlLmVxbCgnMjMnKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcxLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcbiAgICB9KTtcblxuICAgIGl0KCdjYW4gYWxzbyBOT1QgcGFyc2UgYSBzaW5nbGUgZGlnaXQnLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHBhcnNpbmcyID0gcGFyc2VyMSh0ZXh0KCcyMzQnKSk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nMi52YWx1ZVswXSkudG8uYmUuZXFsKCdkaWdpdFBhcnNlcicpO1xuICAgICAgICBleHBlY3QocGFyc2luZzIudmFsdWVbMV0pLnRvLmJlLmVxbCgnd2FudGVkIDE7IGdvdCAyJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nMi52YWx1ZVsyXS5yZXN0KCkpLnRvLmJlLmVxbCgnMjM0Jyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nMi5pc0ZhaWx1cmUpLnRvLmJlLnRydWU7XG4gICAgfSk7XG5cbiAgICBpdCgnZmFpbHMgYXQgdGhlIGVuZCBvZiB0aGUgc3RyZWFtIGFsc28gd2hlbiBodW50aW5nIGZvciBkaWdpdHMnLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHBhcnNpbmczID0gcGFyc2VyMSh0ZXh0KCcnKSk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nMy52YWx1ZVswXSkudG8uYmUuZXFsKCdkaWdpdFBhcnNlcicpO1xuICAgICAgICBleHBlY3QocGFyc2luZzMudmFsdWVbMV0pLnRvLmJlLmVxbCgnbm8gbW9yZSBpbnB1dCcpO1xuICAgICAgICBleHBlY3QocGFyc2luZzMudmFsdWVbMl0ucmVzdCgpKS50by5iZS5lcWwoJycpO1xuICAgICAgICBleHBlY3QocGFyc2luZzMuaXNGYWlsdXJlKS50by5iZS50cnVlO1xuICAgIH0pO1xufSk7XG5cbmRlc2NyaWJlKCdhIG5hbWVkIGNoYXJhY3RlciBwYXJzZXInLCAoKSA9PiB7XG4gICAgY29uc3QgcGFyc2VyQSA9IHBjaGFyKCdhJyk7XG5cbiAgICBpdCgnY2FuIHBhcnNlIGEgc2luZ2xlIGNoYXInLCAoKSA9PiB7XG4gICAgICAgIGV4cGVjdChpc1BhcnNlcihwYXJzZXJBKSkudG8uYmUudHJ1ZTtcbiAgICAgICAgY29uc3QgcGFyc2luZ0EgPSBwYXJzZXJBLnJ1bih0ZXh0KCdhYmMnKSk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQS52YWx1ZVswXSkudG8uYmUuZXFsKCdhJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQS52YWx1ZVsxXS5yZXN0KCkpLnRvLmJlLmVxbCgnYmMnKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdBLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcbiAgICB9KTtcblxuICAgIGl0KCdjYW4gYWxzbyBOT1QgcGFyc2UgYSBzaW5nbGUgY2hhcicsICgpID0+IHtcbiAgICAgICAgY29uc3QgcGFyc2luZ0IgPSBwYXJzZXJBLnJ1bih0ZXh0KCdiY2QnKSk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQi52YWx1ZVswXSkudG8uYmUuZXFsKCdwY2hhcl9hJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQi52YWx1ZVsxXSkudG8uYmUuZXFsKCd3YW50ZWQgYTsgZ290IGInKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdCLmlzRmFpbHVyZSkudG8uYmUudHJ1ZTtcbiAgICB9KTtcbn0pO1xuXG5kZXNjcmliZSgndHdvIHBhcnNlcnMgYm91bmQgYnkgYW5kVGhlbicsICgpID0+IHtcbiAgICBjb25zdCBwYXJzZXJBYW5kQiA9IGFuZFRoZW4ocGNoYXIoJ2EnKSwgcGNoYXIoJ2InKSk7XG5cbiAgICBpdCgnY2FuIHBhcnNlIHR3byBjaGFycycsICgpID0+IHtcbiAgICAgICAgZXhwZWN0KGlzUGFyc2VyKHBhcnNlckFhbmRCKSkudG8uYmUudHJ1ZTtcbiAgICAgICAgY29uc3QgcGFyc2luZ0FhbmRCID0gcGFyc2VyQWFuZEIucnVuKHRleHQoJ2FiYycpKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdBYW5kQi5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQWFuZEIudmFsdWVbMF0udG9TdHJpbmcoKSkudG8uYmUuZXFsKCdbYSxiXScpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0FhbmRCLnZhbHVlWzFdLnJlc3QoKSkudG8uYmUuZXFsKCdjJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQWFuZEIudG9TdHJpbmcoKSkudG8uYmUuZXFsKCdWYWxpZGF0aW9uLlN1Y2Nlc3MoW1thLGJdLHJvdz0wO2NvbD0yO3Jlc3Q9Y10pJyk7XG4gICAgfSk7XG5cbiAgICBpdCgnY2FuIGFsc28gTk9UIHBhcnNlIHR3byBjaGFycycsICgpID0+IHtcbiAgICAgICAgY29uc3QgcGFyc2luZ0FhbmRCID0gcGFyc2VyQWFuZEIucnVuKHRleHQoJ2FjZCcpKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdBYW5kQi5pc0ZhaWx1cmUpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQWFuZEIudmFsdWVbMF0pLnRvLmJlLmVxbCgncGNoYXJfYSBhbmRUaGVuIHBjaGFyX2InKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdBYW5kQi52YWx1ZVsxXSkudG8uYmUuZXFsKCd3YW50ZWQgYjsgZ290IGMnKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdBYW5kQi52YWx1ZVsyXS5yZXN0KCkpLnRvLmJlLmVxbCgnY2QnKTtcbiAgICB9KTtcblxuICAgIGl0KCd3aWxsIGZhaWwgaWYgdGhlIGlucHV0IGlzIHRvbyBzaG9ydCcsICgpID0+IHtcbiAgICAgICAgZXhwZWN0KHBhcnNlckFhbmRCLnJ1bih0ZXh0KCdhJykpLmlzRmFpbHVyZSkudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNlckFhbmRCLnJ1bih0ZXh0KCdhYicpKS5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgfSk7XG59KTtcblxuZGVzY3JpYmUoJ3R3byBwYXJzZXJzIGJvdW5kIGJ5IG9yRWxzZScsICgpID0+IHtcbiAgICBjb25zdCBwYXJzZXJBb3JCID0gb3JFbHNlKHBjaGFyKCdhJyksIHBjaGFyKCdiJykpO1xuXG4gICAgaXQoJ2NhbiBwYXJzZSBvbmUgb2YgdHdvIGNoYXJzJywgKCkgPT4ge1xuICAgICAgICBleHBlY3QoaXNQYXJzZXIocGFyc2VyQW9yQikpLnRvLmJlLnRydWU7XG4gICAgICAgIGxldCBwYXJzaW5nQW9yQiA9IHBhcnNlckFvckIucnVuKHRleHQoJ2FiYycpKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdBb3JCLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdBb3JCLnZhbHVlWzBdKS50by5iZS5lcWwoJ2EnKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdBb3JCLnZhbHVlWzFdLnJlc3QoKSkudG8uYmUuZXFsKCdiYycpO1xuICAgICAgICBwYXJzaW5nQW9yQiA9IHBhcnNlckFvckIucnVuKHRleHQoJ2JiYycpKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdBb3JCLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdBb3JCLnZhbHVlWzBdKS50by5iZS5lcWwoJ2InKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdBb3JCLnZhbHVlWzFdLnJlc3QoKSkudG8uYmUuZXFsKCdiYycpO1xuICAgIH0pO1xuXG4gICAgaXQoJ2NhbiBhbHNvIHBhcnNlIE5PTkUgb2YgdHdvIGNoYXJzJywgKCkgPT4ge1xuICAgICAgICBjb25zdCBwYXJzaW5nQW9yQiA9IHBhcnNlckFvckIucnVuKHRleHQoJ2NkZScpKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdBb3JCLmlzRmFpbHVyZSkudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdBb3JCLnZhbHVlWzBdKS50by5iZS5lcWwoJ3BjaGFyX2Egb3JFbHNlIHBjaGFyX2InKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdBb3JCLnZhbHVlWzFdKS50by5iZS5lcWwoJ3dhbnRlZCBiOyBnb3QgYycpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0FvckIudmFsdWVbMl0ucmVzdCgpKS50by5iZS5lcWwoJ2NkZScpO1xuICAgIH0pO1xuXG4gICAgaXQoJ3dpbGwgZmFpbCBpZiB0aGUgaW5wdXQgaXMgdG9vIHNob3J0JywgKCkgPT4ge1xuICAgICAgICBleHBlY3QocGFyc2VyQW9yQi5ydW4odGV4dCgnYScpKS5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChwYXJzZXJBb3JCLnJ1bih0ZXh0KCcnKSkuaXNGYWlsdXJlKS50by5iZS50cnVlO1xuICAgIH0pO1xufSk7XG5cbmRlc2NyaWJlKCdhIGNob2ljZSBvZiBwYXJzZXJzIGJvdW5kIGJ5IG9yRWxzZScsICgpID0+IHtcbiAgICBjb25zdCBwYXJzZXJzQ2hvaWNlID0gY2hvaWNlKFtwY2hhcignYScpLCBwY2hhcignYicpLCBwY2hhcignYycpLCBwY2hhcignZCcpLF0pO1xuXG4gICAgaXQoJ2NhbiBwYXJzZSBvbmUgb2YgZm91ciBjaGFycycsICgpID0+IHtcbiAgICAgICAgZXhwZWN0KGlzUGFyc2VyKHBhcnNlcnNDaG9pY2UpKS50by5iZS50cnVlO1xuICAgICAgICBsZXQgcGFyc2luZ0Nob2ljZSA9IHBhcnNlcnNDaG9pY2UucnVuKHRleHQoJ2EnKSk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UudmFsdWVbMF0pLnRvLmJlLmVxbCgnYScpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS52YWx1ZVsxXS5yZXN0KCkpLnRvLmJlLmVxbCgnJyk7XG4gICAgICAgIHBhcnNpbmdDaG9pY2UgPSBwYXJzZXJzQ2hvaWNlLnJ1bih0ZXh0KCdiJykpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLnZhbHVlWzBdKS50by5iZS5lcWwoJ2InKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UudmFsdWVbMV0ucmVzdCgpKS50by5iZS5lcWwoJycpO1xuICAgICAgICBwYXJzaW5nQ2hvaWNlID0gcGFyc2Vyc0Nob2ljZS5ydW4odGV4dCgnZCcpKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UuaXNTdWNjZXNzKS50by5iZS50cnVlO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS52YWx1ZVswXSkudG8uYmUuZXFsKCdkJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLnZhbHVlWzFdLnJlc3QoKSkudG8uYmUuZXFsKCcnKTtcbiAgICB9KTtcblxuICAgIGl0KCdjYW4gYWxzbyBwYXJzZSBOT05FIG9mIGZvdXIgY2hhcnMnLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHBhcnNpbmdDaG9pY2UgPSBwYXJzZXJzQ2hvaWNlLnJ1bih0ZXh0KCd4JykpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS5pc0ZhaWx1cmUpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLnZhbHVlWzBdKS50by5iZS5lcWwoJ2Nob2ljZSAvcGNoYXJfYS9wY2hhcl9iL3BjaGFyX2MvcGNoYXJfZCcpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS52YWx1ZVsxXSkudG8uYmUuZXFsKCdfZmFpbCcpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS52YWx1ZVsyXS5yZXN0KCkpLnRvLmJlLmVxbCgneCcpO1xuICAgIH0pO1xuXG4gICAgaXQoJ3dpbGwgZmFpbCBpZiB0aGUgaW5wdXQgaXMgdG9vIHNob3J0JywgKCkgPT4ge1xuICAgICAgICBleHBlY3QocGFyc2Vyc0Nob2ljZS5ydW4odGV4dCgnYScpKS5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChwYXJzZXJzQ2hvaWNlLnJ1bih0ZXh0KCcnKSkuaXNGYWlsdXJlKS50by5iZS50cnVlO1xuICAgIH0pO1xufSk7XG5cbmRlc2NyaWJlKCdhIHBhcnNlciBmb3IgYW55IG9mIGEgbGlzdCBvZiBjaGFycycsICgpID0+IHtcbiAgICBpdCgnY2FuIHBhcnNlIGFueSBsb3dlcmNhc2UgY2hhcicsICgpID0+IHtcbiAgICAgICAgY29uc3QgbG93ZXJjYXNlc1BhcnNlciA9IGFueU9mKGxvd2VyY2FzZXMpO1xuXG4gICAgICAgIGV4cGVjdChpc1BhcnNlcihsb3dlcmNhc2VzUGFyc2VyKSkudG8uYmUudHJ1ZTtcbiAgICAgICAgbGV0IHBhcnNpbmdDaG9pY2UgPSBsb3dlcmNhc2VzUGFyc2VyLnJ1bih0ZXh0KCdhJykpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLnZhbHVlWzBdKS50by5iZS5lcWwoJ2EnKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UudmFsdWVbMV0ucmVzdCgpKS50by5iZS5lcWwoJycpO1xuICAgICAgICBwYXJzaW5nQ2hvaWNlID0gbG93ZXJjYXNlc1BhcnNlci5ydW4odGV4dCgnYicpKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UuaXNTdWNjZXNzKS50by5iZS50cnVlO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS52YWx1ZVswXSkudG8uYmUuZXFsKCdiJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLnZhbHVlWzFdLnJlc3QoKSkudG8uYmUuZXFsKCcnKTtcbiAgICAgICAgcGFyc2luZ0Nob2ljZSA9IGxvd2VyY2FzZXNQYXJzZXIucnVuKHRleHQoJ2QnKSk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UudmFsdWVbMF0pLnRvLmJlLmVxbCgnZCcpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS52YWx1ZVsxXS5yZXN0KCkpLnRvLmJlLmVxbCgnJyk7XG4gICAgICAgIHBhcnNpbmdDaG9pY2UgPSBsb3dlcmNhc2VzUGFyc2VyLnJ1bih0ZXh0KCd6JykpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLnZhbHVlWzBdKS50by5iZS5lcWwoJ3onKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UudmFsdWVbMV0ucmVzdCgpKS50by5iZS5lcWwoJycpO1xuXG4gICAgICAgIHBhcnNpbmdDaG9pY2UgPSBsb3dlcmNhc2VzUGFyc2VyLnJ1bih0ZXh0KCdZJykpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS5pc0ZhaWx1cmUpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLnZhbHVlWzBdKS50by5iZS5lcWwoJ2FueU9mIGFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6Jyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLnZhbHVlWzFdKS50by5iZS5lcWwoJ19mYWlsJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLnZhbHVlWzJdLnJlc3QoKSkudG8uYmUuZXFsKCdZJyk7XG4gICAgfSk7XG5cbiAgICBpdCgnY2FuIHBhcnNlIGFueSB1cHBlcmNhc2UgY2hhcicsICgpID0+IHtcbiAgICAgICAgbGV0IHVwcGVyY2FzZXNQYXJzZXIgPSBhbnlPZih1cHBlcmNhc2VzKTtcblxuICAgICAgICBleHBlY3QoaXNQYXJzZXIodXBwZXJjYXNlc1BhcnNlcikpLnRvLmJlLnRydWU7XG4gICAgICAgIGxldCBwYXJzaW5nQ2hvaWNlID0gdXBwZXJjYXNlc1BhcnNlci5ydW4odGV4dCgnQScpKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UuaXNTdWNjZXNzKS50by5iZS50cnVlO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS52YWx1ZVswXSkudG8uYmUuZXFsKCdBJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLnZhbHVlWzFdLnJlc3QoKSkudG8uYmUuZXFsKCcnKTtcbiAgICAgICAgcGFyc2luZ0Nob2ljZSA9IHVwcGVyY2FzZXNQYXJzZXIucnVuKHRleHQoJ0InKSk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UudmFsdWVbMF0pLnRvLmJlLmVxbCgnQicpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS52YWx1ZVsxXS5yZXN0KCkpLnRvLmJlLmVxbCgnJyk7XG4gICAgICAgIHBhcnNpbmdDaG9pY2UgPSB1cHBlcmNhc2VzUGFyc2VyLnJ1bih0ZXh0KCdSJykpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLnZhbHVlWzBdKS50by5iZS5lcWwoJ1InKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UudmFsdWVbMV0ucmVzdCgpKS50by5iZS5lcWwoJycpO1xuICAgICAgICBwYXJzaW5nQ2hvaWNlID0gdXBwZXJjYXNlc1BhcnNlci5ydW4odGV4dCgnWicpKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UuaXNTdWNjZXNzKS50by5iZS50cnVlO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS52YWx1ZVswXSkudG8uYmUuZXFsKCdaJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLnZhbHVlWzFdLnJlc3QoKSkudG8uYmUuZXFsKCcnKTtcblxuICAgICAgICBwYXJzaW5nQ2hvaWNlID0gdXBwZXJjYXNlc1BhcnNlci5ydW4odGV4dCgncycpKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UuaXNGYWlsdXJlKS50by5iZS50cnVlO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS52YWx1ZVswXSkudG8uYmUuZXFsKCdhbnlPZiBBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWicpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS52YWx1ZVsxXSkudG8uYmUuZXFsKCdfZmFpbCcpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS52YWx1ZVsyXS5yZXN0KCkpLnRvLmJlLmVxbCgncycpO1xuICAgIH0pO1xuXG4gICAgaXQoJ2NhbiBwYXJzZSBhbnkgZGlnaXQnLCAoKSA9PiB7XG4gICAgICAgIGxldCBkaWdpdHNQYXJzZXIgPSBhbnlPZihkaWdpdHMpO1xuXG4gICAgICAgIGV4cGVjdChpc1BhcnNlcihkaWdpdHNQYXJzZXIpKS50by5iZS50cnVlO1xuICAgICAgICBsZXQgcGFyc2luZ0Nob2ljZSA9IGRpZ2l0c1BhcnNlci5ydW4odGV4dCgnMScpKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UuaXNTdWNjZXNzKS50by5iZS50cnVlO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS52YWx1ZVswXSkudG8uYmUuZXFsKCcxJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLnZhbHVlWzFdLnJlc3QoKSkudG8uYmUuZXFsKCcnKTtcbiAgICAgICAgcGFyc2luZ0Nob2ljZSA9IGRpZ2l0c1BhcnNlci5ydW4odGV4dCgnMycpKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UuaXNTdWNjZXNzKS50by5iZS50cnVlO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS52YWx1ZVswXSkudG8uYmUuZXFsKCczJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLnZhbHVlWzFdLnJlc3QoKSkudG8uYmUuZXFsKCcnKTtcbiAgICAgICAgcGFyc2luZ0Nob2ljZSA9IGRpZ2l0c1BhcnNlci5ydW4odGV4dCgnMCcpKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UuaXNTdWNjZXNzKS50by5iZS50cnVlO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS52YWx1ZVswXSkudG8uYmUuZXFsKCcwJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLnZhbHVlWzFdLnJlc3QoKSkudG8uYmUuZXFsKCcnKTtcbiAgICAgICAgcGFyc2luZ0Nob2ljZSA9IGRpZ2l0c1BhcnNlci5ydW4odGV4dCgnOCcpKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UuaXNTdWNjZXNzKS50by5iZS50cnVlO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS52YWx1ZVswXSkudG8uYmUuZXFsKCc4Jyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLnZhbHVlWzFdLnJlc3QoKSkudG8uYmUuZXFsKCcnKTtcblxuICAgICAgICBwYXJzaW5nQ2hvaWNlID0gZGlnaXRzUGFyc2VyLnJ1bih0ZXh0KCdzJykpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS5pc0ZhaWx1cmUpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLnZhbHVlWzBdKS50by5iZS5lcWwoJ2FueU9mIDAxMjM0NTY3ODknKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UudmFsdWVbMV0pLnRvLmJlLmVxbCgnX2ZhaWwnKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UudmFsdWVbMl0ucmVzdCgpKS50by5iZS5lcWwoJ3MnKTtcbiAgICB9KTtcblxuICAgIGl0KCd3aWxsIGZhaWwgaWYgdGhlIGlucHV0IGlzIHRvbyBzaG9ydCcsICgpID0+IHtcbiAgICAgICAgZXhwZWN0KGFueU9mKGxvd2VyY2FzZXMpLnJ1bih0ZXh0KCcnKSkuaXNGYWlsdXJlKS50by5iZS50cnVlO1xuICAgICAgICBleHBlY3QoYW55T2YoZGlnaXRzKS5ydW4odGV4dCgnJykpLmlzRmFpbHVyZSkudG8uYmUudHJ1ZTtcbiAgICB9KTtcbn0pO1xuZGVzY3JpYmUoJ3BhcnNlIEFCQycsICgpID0+IHtcbiAgICBpdCgncGFyc2VzIEFCQycsICgpID0+IHtcbiAgICAgICAgY29uc3QgcGFpckFkZGVyID0gKFt4LCB5XSkgPT4geCArIHk7XG4gICAgICAgIGNvbnN0IGFiY1AgPSBhbmRUaGVuKFxuICAgICAgICAgICAgcGNoYXIoJ2EnKSxcbiAgICAgICAgICAgIGFuZFRoZW4oXG4gICAgICAgICAgICAgICAgcGNoYXIoJ2InKSxcbiAgICAgICAgICAgICAgICBhbmRUaGVuKFxuICAgICAgICAgICAgICAgICAgICBwY2hhcignYycpLFxuICAgICAgICAgICAgICAgICAgICByZXR1cm5QKCcnKVxuICAgICAgICAgICAgICAgICkuZm1hcChwYWlyQWRkZXIpXG4gICAgICAgICAgICApLmZtYXAocGFpckFkZGVyKVxuICAgICAgICApLmZtYXAocGFpckFkZGVyKTtcbiAgICAgICAgY29uc3QgcGFyc2luZyA9IGFiY1AucnVuKCdhYmNkJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcudmFsdWVbMF0udG9TdHJpbmcoKSkudG8uYmUuZXFsKCdhYmMnKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcudmFsdWVbMV0ucmVzdCgpKS50by5iZS5lcWwoJ2QnKTtcbiAgICB9KTtcbn0pO1xuXG5kZXNjcmliZSgncGFyc2UgMyBkaWdpdHMnLCAoKSA9PiB7XG4gICAgbGV0IHBhcnNlRGlnaXQsIHRocmVlRGlnaXRzLCBwYXJzaW5nO1xuXG4gICAgYmVmb3JlKCgpID0+IHtcbiAgICAgICAgcGFyc2VEaWdpdCA9IGFueU9mKGRpZ2l0cyk7XG4gICAgICAgIHRocmVlRGlnaXRzID0gYW5kVGhlbihwYXJzZURpZ2l0LCBhbmRUaGVuKHBhcnNlRGlnaXQsIHBhcnNlRGlnaXQpKTtcbiAgICAgICAgcGFyc2luZyA9IHRocmVlRGlnaXRzLnJ1bignMTIzJyk7XG4gICAgfSk7XG4gICAgaXQoJ3BhcnNlcyBhbnkgb2YgdGhyZWUgZGlnaXRzJywgKCkgPT4ge1xuICAgICAgICBleHBlY3QocGFyc2luZy5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLnZhbHVlWzBdLnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgnWzEsWzIsM11dJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLnZhbHVlWzFdLnJlc3QoKSkudG8uYmUuZXFsKCcnKTtcbiAgICB9KTtcbiAgICBkZXNjcmliZSgncGFyc2VzIGFueSBvZiB0aHJlZSBkaWdpdHMgd2hpbGUgc2hvd2Nhc2luZyBmbWFwJywgKCkgPT4ge1xuICAgICAgICBjb25zdCB1bnBhY2tlciA9IChbeCwgW3ksIHpdXSkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIFt4LCB5LCB6XTtcbiAgICAgICAgfTtcbiAgICAgICAgaXQoJ2FzIGdsb2JhbCBtZXRob2QnLCAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCB0aHJlZURpZ2l0c0ltcGwgPSBmbWFwKHVucGFja2VyLCB0aHJlZURpZ2l0cyk7XG4gICAgICAgICAgICBsZXQgcGFyc2luZyA9IHRocmVlRGlnaXRzSW1wbC5ydW4oJzEyMycpO1xuICAgICAgICAgICAgZXhwZWN0KHBhcnNpbmcuaXNTdWNjZXNzKS50by5iZS50cnVlO1xuICAgICAgICAgICAgZXhwZWN0KHBhcnNpbmcudmFsdWVbMF0udG9TdHJpbmcoKSkudG8uYmUuZXFsKCdbMSwyLDNdJyk7XG4gICAgICAgICAgICBleHBlY3QocGFyc2luZy52YWx1ZVsxXS5yZXN0KCkpLnRvLmJlLmVxbCgnJyk7XG4gICAgICAgIH0pO1xuICAgICAgICBpdCgnYXMgaW5zdGFuY2UgbWV0aG9kJywgKCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgdGhyZWVEaWdpdHNJbnN0ID0gdGhyZWVEaWdpdHMuZm1hcCh1bnBhY2tlcik7XG4gICAgICAgICAgICBsZXQgcGFyc2luZyA9IHRocmVlRGlnaXRzSW5zdC5ydW4oJzEyMycpO1xuICAgICAgICAgICAgZXhwZWN0KHBhcnNpbmcuaXNTdWNjZXNzKS50by5iZS50cnVlO1xuICAgICAgICAgICAgZXhwZWN0KHBhcnNpbmcudmFsdWVbMF0udG9TdHJpbmcoKSkudG8uYmUuZXFsKCdbMSwyLDNdJyk7XG4gICAgICAgICAgICBleHBlY3QocGFyc2luZy52YWx1ZVsxXS5yZXN0KCkpLnRvLmJlLmVxbCgnJyk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xufSk7XG5cbmRlc2NyaWJlKCdsaWZ0MiBmb3IgcGFyc2VycycsICgpID0+IHtcbiAgICBpdCgnb3BlcmF0ZXMgb24gdGhlIHJlc3VsdHMgb2YgdHdvIHN0cmluZyBwYXJzaW5ncycsICgpID0+IHtcbiAgICAgICAgY29uc3QgYWRkU3RyaW5ncyA9IHggPT4geSA9PiB4ICsgJysnICsgeTtcbiAgICAgICAgY29uc3QgQXBsdXNCID0gbGlmdDIoYWRkU3RyaW5ncykocGNoYXIoJ2EnKSkocGNoYXIoJ2InKSk7XG4gICAgICAgIGV4cGVjdChBcGx1c0IucnVuKCdhYmMnKS50b1N0cmluZygpKS50by5iZS5lcWwoJ1ZhbGlkYXRpb24uU3VjY2VzcyhbYStiLHJvdz0wO2NvbD0yO3Jlc3Q9Y10pJyk7XG4gICAgfSk7XG4gICAgaXQoJ2FkZHMgdGhlIHJlc3VsdHMgb2YgdHdvIGRpZ2l0IHBhcnNpbmdzJywgKCkgPT4ge1xuICAgICAgICBjb25zdCBhZGREaWdpdHMgPSB4ID0+IHkgPT4geCArIHk7XG4gICAgICAgIGNvbnN0IGFkZFBhcnNlciA9IGxpZnQyKGFkZERpZ2l0cykocGRpZ2l0KDEpKShwZGlnaXQoMikpO1xuICAgICAgICBleHBlY3QoYWRkUGFyc2VyLnJ1bignMTIzNCcpLnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgnVmFsaWRhdGlvbi5TdWNjZXNzKFszLHJvdz0wO2NvbD0yO3Jlc3Q9MzRdKScpO1xuICAgICAgICBleHBlY3QoYWRkUGFyc2VyLnJ1bignMTQ0JykuaXNGYWlsdXJlKS50by5iZS50cnVlO1xuICAgIH0pO1xufSk7XG5cbmRlc2NyaWJlKCdzZXF1ZW5jZXMgb2YgcGFyc2VycyBiYXNlZCBvbiBhbmRUaGVuICYmIGZtYXAgKGFrYSBzZXF1ZW5jZVAyKScsICgpID0+IHtcbiAgICBpdCgnc3RvcmUgbWF0Y2hlZCBjaGFycyBpbnNpZGUgYSBwbGFpbiBzdHJpbmcnLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IGFiY1BhcnNlciA9IHNlcXVlbmNlUDIoW3BjaGFyKCdhJyksIHBjaGFyKCdiJyksIHBjaGFyKCdjJyksXSk7XG4gICAgICAgIGV4cGVjdChhYmNQYXJzZXIucnVuKCdhYmMnKS50b1N0cmluZygpKVxuICAgICAgICAgICAgLnRvLmJlLmVxbCgnVmFsaWRhdGlvbi5TdWNjZXNzKFthYmMscm93PTE7Y29sPTA7cmVzdD1dKScpO1xuICAgIH0pO1xufSk7XG5cbmRlc2NyaWJlKCdzZXF1ZW5jZXMgb2YgcGFyc2VycyBiYXNlZCBvbiBsaWZ0Mihjb25zKSAoYWthIHNlcXVlbmNlUCknLCAoKSA9PiB7XG4gICAgaXQoJ3N0b3JlcyBtYXRjaGVkIGNoYXJzIGluc2lkZSBhbiBhcnJheScsICgpID0+IHtcbiAgICAgICAgY29uc3QgYWJjUGFyc2VyID0gc2VxdWVuY2VQKFtwY2hhcignYScpLCBwY2hhcignYicpLCBwY2hhcignYycpLF0pO1xuICAgICAgICBleHBlY3QoYWJjUGFyc2VyLnJ1bignYWJjJykudG9TdHJpbmcoKSlcbiAgICAgICAgICAgIC50by5iZS5lcWwoJ1ZhbGlkYXRpb24uU3VjY2VzcyhbW2EsYixjXSxyb3c9MTtjb2w9MDtyZXN0PV0pJyk7XG4gICAgfSk7XG59KTtcblxuZGVzY3JpYmUoJ2EgcGFyc2VyIGZvciBhIHNwZWNpZmljIHNlcXVlbmNlIG9mIGNoYXJzJywgKCkgPT4ge1xuICAgIGl0KCdpcyBlYXN5IHRvIGNyZWF0ZSB3aXRoIHNlcXVlbmNlUCcsICgpID0+IHtcbiAgICAgICAgY29uc3QgbWFyY29QYXJzZXIgPSBwc3RyaW5nKCdtYXJjbycpO1xuICAgICAgICBjb25zdCBtYXJjb1BhcnNpbmcgPSBtYXJjb1BhcnNlci5ydW4oJ21hcmNvY2lhbycpO1xuICAgICAgICBleHBlY3QobWFyY29QYXJzaW5nLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KG1hcmNvUGFyc2luZy50b1N0cmluZygpKVxuICAgICAgICAgICAgLnRvLmJlLmVxbCgnVmFsaWRhdGlvbi5TdWNjZXNzKFtbbSxhLHIsYyxvXSxyb3c9MDtjb2w9NTtyZXN0PWNpYW9dKScpO1xuICAgIH0pO1xufSk7XG5cbmRlc2NyaWJlKCdhIHBhcnNlciBmb3IgYSBzcGVjaWZpYyB3b3JkJywgKCkgPT4ge1xuICAgIGl0KCdkZXRlY3RzIGFuZCBpZ25vcmVzIHdoaXRlc3BhY2VzIGFyb3VuZCBpdCcsICgpID0+IHtcbiAgICAgICAgY29uc3QgbWFyY29QYXJzZXIgPSBwd29yZCgnbWFyY28nKTtcbiAgICAgICAgY29uc3QgbWFyY29QYXJzaW5nID0gbWFyY29QYXJzZXIucnVuKCcgIG1hcmNvIGNpYW8nKTtcbiAgICAgICAgZXhwZWN0KG1hcmNvUGFyc2luZy5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChtYXJjb1BhcnNpbmcudG9TdHJpbmcoKSlcbiAgICAgICAgICAgIC50by5iZS5lcWwoJ1ZhbGlkYXRpb24uU3VjY2VzcyhbW20sYSxyLGMsb10scm93PTA7Y29sPTg7cmVzdD1jaWFvXSknKTtcbiAgICB9KTtcbiAgICBpdCgnaGFzIG5vIHByb2JsZW0gaWYgdGhlIHdoaXRlc3BhY2VzIGFyZW5cXCd0IHRoZXJlJywgKCkgPT4ge1xuICAgICAgICBjb25zdCBtYXJjb1BhcnNlciA9IHB3b3JkKCdtYXJjbycpO1xuICAgICAgICBjb25zdCBtYXJjb1BhcnNpbmcgPSBtYXJjb1BhcnNlci5ydW4oJ21hcmNvY2lhbycpO1xuICAgICAgICBleHBlY3QobWFyY29QYXJzaW5nLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KG1hcmNvUGFyc2luZy50b1N0cmluZygpKVxuICAgICAgICAgICAgLnRvLmJlLmVxbCgnVmFsaWRhdGlvbi5TdWNjZXNzKFtbbSxhLHIsYyxvXSxyb3c9MDtjb2w9NTtyZXN0PWNpYW9dKScpO1xuICAgIH0pO1xufSk7XG5cbmRlc2NyaWJlKCdhIHBhcnNpbmcgZnVuY3Rpb24gZm9yIHplcm8gb3IgbW9yZSBvY2N1cnJlbmNlcycsICgpID0+IHtcbiAgICBpdCgnY2FuIHBhcnNlIGEgY2hhciB6ZXJvIHRpbWVzJywgKCkgPT4ge1xuICAgICAgICBjb25zdCB6ZXJvT3JNb3JlUGFyc2luZ0Z1bmN0aW9uID0gemVyb09yTW9yZShwY2hhcignbScpKTtcbiAgICAgICAgbGV0IHBhcnNpbmcgPSB6ZXJvT3JNb3JlUGFyc2luZ0Z1bmN0aW9uKHRleHQoJ2FyY28nKSk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcudG9TdHJpbmcoKSkudG8uYmUuZXFsKCdWYWxpZGF0aW9uLlN1Y2Nlc3MoW1tdLHJvdz0wO2NvbD0wO3Jlc3Q9YXJjb10pJyk7XG4gICAgfSk7XG4gICAgaXQoJ2NhbiBwYXJzZSBhIGNoYXIgbWFueSB0aW1lcycsICgpID0+IHtcbiAgICAgICAgY29uc3QgemVyb09yTW9yZVBhcnNpbmdGdW5jdGlvbiA9IHplcm9Pck1vcmUocGNoYXIoJ20nKSk7XG4gICAgICAgIGxldCBwYXJzaW5nID0gemVyb09yTW9yZVBhcnNpbmdGdW5jdGlvbih0ZXh0KCdtbW1hcmNvJykpO1xuICAgICAgICBleHBlY3QocGFyc2luZy5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgnVmFsaWRhdGlvbi5TdWNjZXNzKFtbbSxtLG1dLHJvdz0wO2NvbD0zO3Jlc3Q9YXJjb10pJyk7XG4gICAgfSk7XG4gICAgaXQoJ2NhbiBwYXJzZSBhIGNoYXIgc2VxdWVuY2UgemVybyB0aW1lcycsICgpID0+IHtcbiAgICAgICAgY29uc3QgemVyb09yTW9yZVBhcnNpbmdGdW5jdGlvbiA9IHplcm9Pck1vcmUocHN0cmluZygnbWFyY28nKSk7XG4gICAgICAgIGxldCBwYXJzaW5nID0gemVyb09yTW9yZVBhcnNpbmdGdW5jdGlvbih0ZXh0KCd4bWFyY29tYXJjb2NpYW8nKSk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcudG9TdHJpbmcoKSkudG8uYmUuZXFsKCdWYWxpZGF0aW9uLlN1Y2Nlc3MoW1tdLHJvdz0wO2NvbD0wO3Jlc3Q9eG1hcmNvbWFyY29jaWFvXSknKTtcbiAgICB9KTtcbiAgICBpdCgnY2FuIHBhcnNlIGEgY2hhciBzZXF1ZW5jZSBtYW55IHRpbWVzJywgKCkgPT4ge1xuICAgICAgICBjb25zdCB6ZXJvT3JNb3JlUGFyc2luZ0Z1bmN0aW9uID0gemVyb09yTW9yZShwc3RyaW5nKCdtYXJjbycpKTtcbiAgICAgICAgbGV0IHBhcnNpbmcgPSB6ZXJvT3JNb3JlUGFyc2luZ0Z1bmN0aW9uKHRleHQoJ21hcmNvbWFyY29jaWFvJykpO1xuICAgICAgICBleHBlY3QocGFyc2luZy5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLnRvU3RyaW5nKCkpXG4gICAgICAgICAgICAudG8uYmUuZXFsKCdWYWxpZGF0aW9uLlN1Y2Nlc3MoW1tbbSxhLHIsYyxvXSxbbSxhLHIsYyxvXV0scm93PTA7Y29sPTEwO3Jlc3Q9Y2lhb10pJyk7XG4gICAgfSk7XG59KTtcblxuZGVzY3JpYmUoJ2EgcGFyc2VyIGZvciB6ZXJvIG9yIG1vcmUgb2NjdXJyZW5jZXMnLCAoKSA9PiB7XG4gICAgaXQoJ2NhbiBwYXJzZSBhIGNoYXIgemVybyB0aW1lcycsICgpID0+IHtcbiAgICAgICAgY29uc3QgemVyb09yTW9yZVBhcnNlciA9IG1hbnkocGNoYXIoJ20nKSk7XG4gICAgICAgIGxldCBwYXJzaW5nID0gemVyb09yTW9yZVBhcnNlci5ydW4odGV4dCgnYXJjbycpKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcuaXNTdWNjZXNzKS50by5iZS50cnVlO1xuICAgICAgICBleHBlY3QocGFyc2luZy50b1N0cmluZygpKS50by5iZS5lcWwoJ1ZhbGlkYXRpb24uU3VjY2VzcyhbW10scm93PTA7Y29sPTA7cmVzdD1hcmNvXSknKTtcbiAgICB9KTtcbiAgICBpdCgnY2FuIHBhcnNlIGEgY2hhciBtYW55IHRpbWVzIGFuZCByZXR1cm4gYW4gYXJyYXknLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHplcm9Pck1vcmVQYXJzZXIgPSBtYW55KHBjaGFyKCdtJykpO1xuICAgICAgICBsZXQgcGFyc2luZyA9IHplcm9Pck1vcmVQYXJzZXIucnVuKHRleHQoJ21tbWFyY28nKSk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcudG9TdHJpbmcoKSkudG8uYmUuZXFsKCdWYWxpZGF0aW9uLlN1Y2Nlc3MoW1ttLG0sbV0scm93PTA7Y29sPTM7cmVzdD1hcmNvXSknKTtcbiAgICB9KTtcbiAgICBpdCgnY2FuIHBhcnNlIGEgY2hhciBleGFjdGx5IG4gdGltZXMgYW5kIHJldHVybiBhbiBhcnJheSAob3IgZmFpbCknLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IGV4YWN0bHlUaHJlZSA9IG1hbnkocGNoYXIoJ20nKSwgMyk7XG4gICAgICAgIGxldCBwYXJzaW5nID0gZXhhY3RseVRocmVlLnJ1bih0ZXh0KCdtbW1hcmNvJykpO1xuICAgICAgICBleHBlY3QocGFyc2luZy5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgnVmFsaWRhdGlvbi5TdWNjZXNzKFtbbSxtLG1dLHJvdz0wO2NvbD0zO3Jlc3Q9YXJjb10pJyk7XG4gICAgICAgIHBhcnNpbmcgPSBleGFjdGx5VGhyZWUucnVuKHRleHQoJ21tbW1hcmNvJykpO1xuICAgICAgICBleHBlY3QocGFyc2luZy5pc0ZhaWx1cmUpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgnVmFsaWRhdGlvbi5GYWlsdXJlKFttYW55IHBjaGFyX20gdGltZXM9Myx0aW1lcyBwYXJhbSB3YW50ZWQgMzsgZ290IDQscm93PTA7Y29sPTA7cmVzdD1tbW1tYXJjb10pJyk7XG4gICAgfSk7XG4gICAgaXQoJ2NhbiBwYXJzZSBhIGNoYXIgbWFueSB0aW1lcyBhbmQgcmV0dXJuIGEgc3RyaW5nJywgKCkgPT4ge1xuICAgICAgICBjb25zdCB6ZXJvT3JNb3JlUGFyc2VyID0gbWFueUNoYXJzKHBjaGFyKCdtJykpO1xuICAgICAgICBsZXQgcGFyc2luZyA9IHplcm9Pck1vcmVQYXJzZXIucnVuKHRleHQoJ21tbWFyY28nKSk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcudG9TdHJpbmcoKSkudG8uYmUuZXFsKCdWYWxpZGF0aW9uLlN1Y2Nlc3MoW21tbSxyb3c9MDtjb2w9MztyZXN0PWFyY29dKScpO1xuICAgIH0pO1xuICAgIGl0Lm9ubHkoJ2NhbiBwYXJzZSBhIGNoYXIgZXhhY3RseSBuIHRpbWVzIGFuZCByZXR1cm4gYSBzdHJpbmcgKG9yIGZhaWwpJywgKCkgPT4ge1xuICAgICAgICBjb25zdCBleGFjdGx5VGhyZWUgPSBtYW55Q2hhcnMocGNoYXIoJ20nKSwgMyk7XG4gICAgICAgIGxldCBwYXJzaW5nID0gZXhhY3RseVRocmVlLnJ1bih0ZXh0KCdtbW1hcmNvJykpO1xuICAgICAgICBleHBlY3QocGFyc2luZy5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgnVmFsaWRhdGlvbi5TdWNjZXNzKFttbW0scm93PTA7Y29sPTM7cmVzdD1hcmNvXSknKTtcbiAgICAgICAgcGFyc2luZyA9IGV4YWN0bHlUaHJlZS5ydW4odGV4dCgnbW1tbWFyY28nKSk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLmlzRmFpbHVyZSkudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcudG9TdHJpbmcoKSkudG8uYmUuZXFsKCdWYWxpZGF0aW9uLkZhaWx1cmUoW21hbnlDaGFycyBwY2hhcl9tIHRpbWVzPTMsdGltZXMgcGFyYW0gd2FudGVkIDM7IGdvdCA0LHJvdz0wO2NvbD0wO3Jlc3Q9bW1tbWFyY29dKScpO1xuICAgIH0pO1xuICAgIGl0KCdjYW4gcGFyc2UgYSBjaGFyIHNlcXVlbmNlIHplcm8gdGltZXMnLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHplcm9Pck1vcmVQYXJzZXIgPSBtYW55KHBzdHJpbmcoJ21hcmNvJykpO1xuICAgICAgICBsZXQgcGFyc2luZyA9IHplcm9Pck1vcmVQYXJzZXIucnVuKHRleHQoJ3htYXJjb21hcmNvY2lhbycpKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcuaXNTdWNjZXNzKS50by5iZS50cnVlO1xuICAgICAgICBleHBlY3QocGFyc2luZy50b1N0cmluZygpKS50by5iZS5lcWwoJ1ZhbGlkYXRpb24uU3VjY2VzcyhbW10scm93PTA7Y29sPTA7cmVzdD14bWFyY29tYXJjb2NpYW9dKScpO1xuICAgIH0pO1xuICAgIGl0KCdjYW4gcGFyc2UgYSBjaGFyIHNlcXVlbmNlIG1hbnkgdGltZXMnLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHplcm9Pck1vcmVQYXJzZXIgPSBtYW55KHBzdHJpbmcoJ21hcmNvJykpO1xuICAgICAgICBsZXQgcGFyc2luZyA9IHplcm9Pck1vcmVQYXJzZXIucnVuKCdtYXJjb21hcmNvY2lhbycpO1xuICAgICAgICBleHBlY3QocGFyc2luZy5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLnRvU3RyaW5nKCkpXG4gICAgICAgICAgICAudG8uYmUuZXFsKCdWYWxpZGF0aW9uLlN1Y2Nlc3MoW1tbbSxhLHIsYyxvXSxbbSxhLHIsYyxvXV0scm93PTA7Y29sPTEwO3Jlc3Q9Y2lhb10pJyk7XG4gICAgfSk7XG4gICAgaXQoJ2NhbiBwYXJzZSB3aGl0ZXNwYWNlcyEhJywgKCkgPT4ge1xuICAgICAgICBjb25zdCB3aGl0ZXNQYXJzZXIgPSBtYW55KGFueU9mKHdoaXRlcykpO1xuICAgICAgICBjb25zdCB0d29Xb3JkcyA9IHNlcXVlbmNlUChbcHN0cmluZygnY2lhbycpLCB3aGl0ZXNQYXJzZXIsIHBzdHJpbmcoJ21hbW1hJyldKTtcbiAgICAgICAgbGV0IHBhcnNpbmcgPSB0d29Xb3Jkcy5ydW4oJ2NpYW9tYW1tYVgnKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcudG9TdHJpbmcoKSlcbiAgICAgICAgICAgIC50by5iZS5lcWwoJ1ZhbGlkYXRpb24uU3VjY2VzcyhbW1tjLGksYSxvXSxbXSxbbSxhLG0sbSxhXV0scm93PTA7Y29sPTk7cmVzdD1YXSknKTtcbiAgICAgICAgcGFyc2luZyA9IHR3b1dvcmRzLnJ1bignY2lhbyBtYW1tYVgnKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcudG9TdHJpbmcoKSlcbiAgICAgICAgICAgIC50by5iZS5lcWwoJ1ZhbGlkYXRpb24uU3VjY2VzcyhbW1tjLGksYSxvXSxbIF0sW20sYSxtLG0sYV1dLHJvdz0wO2NvbD0xMDtyZXN0PVhdKScpO1xuICAgICAgICBwYXJzaW5nID0gdHdvV29yZHMucnVuKCdjaWFvICAgbWFtbWFYJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLnRvU3RyaW5nKCkpXG4gICAgICAgICAgICAudG8uYmUuZXFsKCdWYWxpZGF0aW9uLlN1Y2Nlc3MoW1tbYyxpLGEsb10sWyAsICwgXSxbbSxhLG0sbSxhXV0scm93PTA7Y29sPTEyO3Jlc3Q9WF0pJyk7XG4gICAgICAgIHBhcnNpbmcgPSB0d29Xb3Jkcy5ydW4oJ2NpYW8gXFx0IG1hbW1hWCcpO1xuICAgICAgICBleHBlY3QocGFyc2luZy50b1N0cmluZygpKVxuICAgICAgICAgICAgLnRvLmJlLmVxbCgnVmFsaWRhdGlvbi5TdWNjZXNzKFtbW2MsaSxhLG9dLFsgLFxcdCwgXSxbbSxhLG0sbSxhXV0scm93PTA7Y29sPTEyO3Jlc3Q9WF0pJyk7XG4gICAgfSk7XG59KTtcblxuZGVzY3JpYmUoJ2EgcGFyc2VyIGZvciBvbmUgb3IgbW9yZSBvY2N1cnJlbmNlcycsICgpID0+IHtcbiAgICBpdCgnY2Fubm90IHBhcnNlIGEgY2hhciB6ZXJvIHRpbWVzJywgKCkgPT4ge1xuICAgICAgICBjb25zdCBvbmVPck1vcmVQYXJzZXIgPSBtYW55MShwY2hhcignbScpKTtcbiAgICAgICAgbGV0IHBhcnNpbmcgPSBvbmVPck1vcmVQYXJzZXIucnVuKCdhcmNvJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLmlzRmFpbHVyZSkudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcudG9TdHJpbmcoKSlcbiAgICAgICAgICAgIC50by5iZS5lcWwoJ1ZhbGlkYXRpb24uRmFpbHVyZShbbWFueTEgcGNoYXJfbSx3YW50ZWQgbTsgZ290IGEscm93PTA7Y29sPTA7cmVzdD1hcmNvXSknKTtcbiAgICB9KTtcbiAgICBpdCgnY2FuIHBhcnNlIGEgY2hhciBtYW55IHRpbWVzIGFuZCByZXR1cm4gYW4gYXJyYXknLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IG9uZU9yTW9yZVBhcnNlciA9IG1hbnkxKHBjaGFyKCdtJykpO1xuICAgICAgICBsZXQgcGFyc2luZyA9IG9uZU9yTW9yZVBhcnNlci5ydW4oJ21tbWFyY28nKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcuaXNTdWNjZXNzKS50by5iZS50cnVlO1xuICAgICAgICBleHBlY3QocGFyc2luZy50b1N0cmluZygpKS50by5iZS5lcWwoJ1ZhbGlkYXRpb24uU3VjY2VzcyhbW20sbSxtXSxyb3c9MDtjb2w9MztyZXN0PWFyY29dKScpO1xuICAgIH0pO1xuICAgIGl0KCdjYW4gcGFyc2UgYSBjaGFyIG1hbnkgdGltZXMgYW5kIHJldHVybiBhIHN0cmluZycsICgpID0+IHtcbiAgICAgICAgY29uc3Qgb25lT3JNb3JlUGFyc2VyID0gbWFueUNoYXJzMShwY2hhcignbScpKTtcbiAgICAgICAgbGV0IHBhcnNpbmcgPSBvbmVPck1vcmVQYXJzZXIucnVuKCdtbW1hcmNvJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcudG9TdHJpbmcoKSkudG8uYmUuZXFsKCdWYWxpZGF0aW9uLlN1Y2Nlc3MoW21tbSxyb3c9MDtjb2w9MztyZXN0PWFyY29dKScpO1xuICAgIH0pO1xuICAgIGl0KCdjYW5ub3QgcGFyc2UgYSBjaGFyIHNlcXVlbmNlIHplcm8gdGltZXMnLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IG9uZU9yTW9yZVBhcnNlciA9IG1hbnkxKHBzdHJpbmcoJ21hcmNvJykpO1xuICAgICAgICBsZXQgcGFyc2luZyA9IG9uZU9yTW9yZVBhcnNlci5ydW4oJ3htYXJjb21hcmNvY2lhbycpO1xuICAgICAgICBleHBlY3QocGFyc2luZy5pc0ZhaWx1cmUpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLnRvU3RyaW5nKCkpXG4gICAgICAgICAgICAudG8uYmUuZXFsKCdWYWxpZGF0aW9uLkZhaWx1cmUoW21hbnkxIHBzdHJpbmcgbWFyY28sd2FudGVkIG07IGdvdCB4LHJvdz0wO2NvbD0wO3Jlc3Q9eG1hcmNvbWFyY29jaWFvXSknKTtcbiAgICB9KTtcbiAgICBpdCgnY2FuIHBhcnNlIGEgY2hhciBzZXF1ZW5jZSBtYW55IHRpbWVzJywgKCkgPT4ge1xuICAgICAgICBjb25zdCBvbmVPck1vcmVQYXJzZXIgPSBtYW55MShwc3RyaW5nKCdtYXJjbycpKTtcbiAgICAgICAgbGV0IHBhcnNpbmcgPSBvbmVPck1vcmVQYXJzZXIucnVuKCdtYXJjb21hcmNvY2lhbycpO1xuICAgICAgICBleHBlY3QocGFyc2luZy5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLnRvU3RyaW5nKCkpXG4gICAgICAgICAgICAudG8uYmUuZXFsKCdWYWxpZGF0aW9uLlN1Y2Nlc3MoW1tbbSxhLHIsYyxvXSxbbSxhLHIsYyxvXV0scm93PTA7Y29sPTEwO3Jlc3Q9Y2lhb10pJyk7XG4gICAgfSk7XG4gICAgaXQoJ2NhbiBwYXJzZSBhbiBpbnRlZ2VyLCBubyBtYXR0ZXIgaG93IGxhcmdlLi4uJywgKCkgPT4ge1xuICAgICAgICBjb25zdCBwaW50ID0gbWFueTEoYW55T2YoZGlnaXRzKSk7XG4gICAgICAgIGxldCBwYXJzaW5nID0gcGludC5ydW4oJzEyMzQ1QScpO1xuICAgICAgICBleHBlY3QocGFyc2luZy5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgnVmFsaWRhdGlvbi5TdWNjZXNzKFtbMSwyLDMsNCw1XSxyb3c9MDtjb2w9NTtyZXN0PUFdKScpO1xuICAgICAgICBwYXJzaW5nID0gcGludC5ydW4oJzFCJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcudG9TdHJpbmcoKSkudG8uYmUuZXFsKCdWYWxpZGF0aW9uLlN1Y2Nlc3MoW1sxXSxyb3c9MDtjb2w9MTtyZXN0PUJdKScpO1xuICAgICAgICBwYXJzaW5nID0gcGludC5ydW4oJ0ExMjM0NScpO1xuICAgICAgICBleHBlY3QocGFyc2luZy5pc0ZhaWx1cmUpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLnRvU3RyaW5nKCkpXG4gICAgICAgICAgICAudG8uYmUuZXFsKCdWYWxpZGF0aW9uLkZhaWx1cmUoW21hbnkxIGFueU9mIDAxMjM0NTY3ODksX2ZhaWwsQTEyMzQ1XSknKTtcbiAgICB9KTtcbiAgICBpdCgnY2FuIHBhcnNlIGFuIGludGVnZXIgaW50byBhIHRydWUgaW50ZWdlcicsICgpID0+IHtcbiAgICAgICAgY29uc3QgcGludCA9IG1hbnkxKGFueU9mKGRpZ2l0cykpXG4gICAgICAgICAgICAuZm1hcChsID0+IHBhcnNlSW50KGwucmVkdWNlKChhY2MsIGN1cnIpID0+IGFjYyArIGN1cnIsICcnKSwgMTApKTtcbiAgICAgICAgbGV0IHBhcnNpbmcgPSBwaW50LnJ1bignMTIzNDVBJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcudmFsdWVbMF0pLnRvLmJlLmVxbCgxMjM0NSk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLnZhbHVlWzFdLnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgncm93PTA7Y29sPTU7cmVzdD1BJyk7XG4gICAgfSk7XG59KTtcblxuZGVzY3JpYmUoJ2EgcGFyc2VyIGZvciBvcHRpb25hbCBjaGFyYWN0ZXJzJywgKCkgPT4ge1xuICAgIGl0KCdjYW4gY2FwdHVyZSBvciBub3QgY2FwdHVyZSBhIGRvdCcsICgpID0+IHtcbiAgICAgICAgY29uc3Qgb3B0RG90VGhlbkEgPSBvcHQocGNoYXIoJy4nKSkuYW5kVGhlbihwY2hhcignYScpKTtcbiAgICAgICAgZXhwZWN0KG9wdERvdFRoZW5BLnJ1bignLmFiYycpLnRvU3RyaW5nKCkpXG4gICAgICAgICAgICAudG8uYmUuZXFsKCdWYWxpZGF0aW9uLlN1Y2Nlc3MoW1tNYXliZS5KdXN0KC4pLGFdLHJvdz0wO2NvbD0yO3Jlc3Q9YmNdKScpO1xuICAgICAgICBleHBlY3Qob3B0RG90VGhlbkEucnVuKCdhYmMnKS50b1N0cmluZygpKVxuICAgICAgICAgICAgLnRvLmJlLmVxbCgnVmFsaWRhdGlvbi5TdWNjZXNzKFtbTWF5YmUuTm90aGluZyxhXSxyb3c9MDtjb2w9MTtyZXN0PWJjXSknKTtcbiAgICB9KTtcbiAgICBpdCgnY2FuIGNhcHR1cmUgYSBkb3Qgb3IgcHJvdmlkZSBhIGRlZmF1bHQgYWx0ZXJuYXRpdmUnLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IG9wdERvdFdpdGhEZWZhdWx0VGhlbkEgPSBvcHQocGNoYXIoJy4nKSwgJ0FMVEVSTkFUSVZFJykuYW5kVGhlbihwY2hhcignYScpKTtcbiAgICAgICAgZXhwZWN0KG9wdERvdFdpdGhEZWZhdWx0VGhlbkEucnVuKCdhYmMnKS50b1N0cmluZygpKVxuICAgICAgICAgICAgLnRvLmJlLmVxbCgnVmFsaWRhdGlvbi5TdWNjZXNzKFtbTWF5YmUuSnVzdChBTFRFUk5BVElWRSksYV0scm93PTA7Y29sPTE7cmVzdD1iY10pJyk7XG4gICAgfSk7XG4gICAgaXQoJ2NhbiBwYXJzZSBTSUdORUQgaW50ZWdlcnMhISEnLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHBpbnQgPSBtYW55MShhbnlPZihkaWdpdHMpKVxuICAgICAgICAgICAgLmZtYXAobCA9PiBwYXJzZUludChsLnJlZHVjZSgoYWNjLCBjdXJyKSA9PiBhY2MgKyBjdXJyLCAnJyksIDEwKSk7XG4gICAgICAgIGNvbnN0IHBTaWduZWRJbnQgPSBvcHQocGNoYXIoJy0nKSlcbiAgICAgICAgICAgIC5hbmRUaGVuKHBpbnQpXG4gICAgICAgICAgICAuZm1hcChvcHRTaWduTnVtYmVyUGFpciA9PiAob3B0U2lnbk51bWJlclBhaXJbMF0uaXNKdXN0KSA/IC1vcHRTaWduTnVtYmVyUGFpclsxXSA6IG9wdFNpZ25OdW1iZXJQYWlyWzFdKTtcbiAgICAgICAgZXhwZWN0KHBTaWduZWRJbnQucnVuKCcxMzI0MzU0NngnKS52YWx1ZVswXSkudG8uYmUuZXFsKDEzMjQzNTQ2KTtcbiAgICAgICAgZXhwZWN0KHBTaWduZWRJbnQucnVuKCctMTMyNDM1NDZ4JykudmFsdWVbMF0pLnRvLmJlLmVxbCgtMTMyNDM1NDYpO1xuICAgIH0pO1xuICAgIGl0KCdjYW4gY2FwdHVyZSBvciBub3QgY2FwdHVyZSBhIHdob2xlIHN1YnN0cmluZycsICgpID0+IHtcbiAgICAgICAgY29uc3Qgb3B0U3Vic3RyaW5nID0gb3B0KHBzdHJpbmcoJ21hcmNvJykpLmFuZFRoZW4ocHN0cmluZygnZmF1c3RpbmVsbGknKSk7XG4gICAgICAgIGV4cGVjdChvcHRTdWJzdHJpbmcucnVuKCdtYXJjb2ZhdXN0aW5lbGxpeCcpLnRvU3RyaW5nKCkpXG4gICAgICAgICAgICAudG8uYmUuZXFsKCdWYWxpZGF0aW9uLlN1Y2Nlc3MoW1tNYXliZS5KdXN0KFttLGEscixjLG9dKSxbZixhLHUscyx0LGksbixlLGwsbCxpXV0scm93PTA7Y29sPTE2O3Jlc3Q9eF0pJyk7XG4gICAgICAgIGV4cGVjdChvcHRTdWJzdHJpbmcucnVuKCdmYXVzdGluZWxsaXgnKS50b1N0cmluZygpKVxuICAgICAgICAgICAgLnRvLmJlLmVxbCgnVmFsaWRhdGlvbi5TdWNjZXNzKFtbTWF5YmUuTm90aGluZyxbZixhLHUscyx0LGksbixlLGwsbCxpXV0scm93PTA7Y29sPTExO3Jlc3Q9eF0pJyk7XG4gICAgfSk7XG59KTtcblxuZGVzY3JpYmUoJ2EgY291cGxlIG9mIHBhcnNlcnMnLCAoKSA9PiB7XG4gICAgaXQoJ2NhbiBkZWNpZGUgdG8gZGlzY2FyZCB0aGUgbWF0Y2hlcyBvZiB0aGUgZmlyc3Qgb25lJywgKCkgPT4ge1xuICAgICAgICBjb25zdCBkaXNjYXJkSW50ZWdlclNpZ24gPSBwY2hhcignLScpLmRpc2NhcmRGaXJzdChwZGlnaXQoOCkpO1xuICAgICAgICBsZXQgcGFyc2luZyA9IGRpc2NhcmRJbnRlZ2VyU2lnbi5ydW4oJy04eCcpO1xuICAgICAgICBleHBlY3QocGFyc2luZy50b1N0cmluZygpKS50by5iZS5lcWwoJ1ZhbGlkYXRpb24uU3VjY2VzcyhbOCxyb3c9MDtjb2w9MjtyZXN0PXhdKScpO1xuICAgIH0pO1xuICAgIGl0KCdjYW4gZGVjaWRlIHRvIGRpc2NhcmQgdGhlIG1hdGNoZXMgb2YgdGhlIHNlY29uZCBvbmUnLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IGRpc2NhcmRTdWZmaXggPSBwc3RyaW5nKCdtYXJjbycpLmRpc2NhcmRTZWNvbmQobWFueTEoYW55T2Yod2hpdGVzKSkpO1xuICAgICAgICBsZXQgcGFyc2luZyA9IGRpc2NhcmRTdWZmaXgucnVuKCdtYXJjbyBmYXVzdGluZWxsaScpO1xuICAgICAgICBleHBlY3QocGFyc2luZy50b1N0cmluZygpKS50by5iZS5lcWwoJ1ZhbGlkYXRpb24uU3VjY2VzcyhbW20sYSxyLGMsb10scm93PTA7Y29sPTY7cmVzdD1mYXVzdGluZWxsaV0pJyk7XG4gICAgICAgIHBhcnNpbmcgPSBkaXNjYXJkU3VmZml4LnJ1bignbWFyY28gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZhdXN0aW5lbGxpJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgnVmFsaWRhdGlvbi5TdWNjZXNzKFtbbSxhLHIsYyxvXSxyb3c9MDtjb2w9Mzc7cmVzdD1mYXVzdGluZWxsaV0pJyk7XG4gICAgfSk7XG59KTtcblxuZGVzY3JpYmUoJ2EgdGFwcGVyIGZvciBwYXJzZXJzJywgKCkgPT4ge1xuICAgIGl0KCdjYW4gZG8gdGhpbmdzIHdpdGggYSByZXN1bHQgdGhhdFxcJ3MgZ29pbmcgdG8gYmUgZGlzY2FyZGVkJywgKCkgPT4ge1xuICAgICAgICBjb25zdCB0YXBJbnRvRGlzY2FyZEludGVnZXJTaWduID0gdGFwUChwY2hhcignLScpLCByZXMgPT4ge1xuICAgICAgICAgICAgZXhwZWN0KHJlcykudG8uYmUuZXFsKCctJyk7XG4gICAgICAgIH0pLmRpc2NhcmRGaXJzdChwZGlnaXQoOCkpO1xuICAgICAgICBsZXQgcGFyc2luZyA9IHRhcEludG9EaXNjYXJkSW50ZWdlclNpZ24ucnVuKCctOHgnKTtcbiAgICB9KTtcbn0pO1xuXG5kZXNjcmliZSgnYSBsb2dnZXIgZm9yIHBhcnNlcnMnLCAoKSA9PiB7XG4gICAgbGV0IHN0b3JlZExvZyA9IGNvbnNvbGUubG9nO1xuICAgIGl0KCdjYW4gbG9nIGludGVybWVkaWF0ZSBwYXJzaW5nIHJlc3VsdHMnLCAoKSA9PiB7XG4gICAgICAgIGNvbnNvbGUubG9nID0gbXNnID0+IHtcbiAgICAgICAgICAgIGV4cGVjdChtc2cpLnRvLmJlLmVxbCgnLScpO1xuICAgICAgICB9O1xuICAgICAgICBjb25zdCBsb2dJbnRlcm1lZGlhdGVSZXN1bHQgPSBsb2dQKHBjaGFyKCctJykpXG4gICAgICAgICAgICAuZGlzY2FyZEZpcnN0KHBkaWdpdCg4KSk7XG4gICAgICAgIGxldCBwYXJzaW5nID0gbG9nSW50ZXJtZWRpYXRlUmVzdWx0LnJ1bignLTh4Jyk7XG4gICAgfSk7XG4gICAgaXQoJ2NhbiBsb2cgYSByZXN1bHQgdGhhdFxcJ3MgZ29pbmcgdG8gYmUgZGlzY2FyZGVkJywgKCkgPT4ge1xuICAgICAgICBjb25zb2xlLmxvZyA9IG1zZyA9PiB7XG4gICAgICAgICAgICBleHBlY3QobXNnKS50by5iZS5lcWwoWycgJywgJyAnXSk7XG4gICAgICAgIH07XG4gICAgICAgIGNvbnN0IGRpc2NhcmRTdWZmaXggPSBwc3RyaW5nKCdtYXJjbycpLmRpc2NhcmRTZWNvbmQobG9nUChtYW55MShhbnlPZih3aGl0ZXMpKSkpO1xuICAgICAgICBsZXQgcGFyc2luZyA9IGRpc2NhcmRTdWZmaXgucnVuKCdtYXJjbyAgZmF1c3RpbmVsbGknKTtcbiAgICB9KTtcbiAgICBjb25zb2xlLmxvZyA9IHN0b3JlZExvZztcbn0pO1xuXG5kZXNjcmliZSgncGFyc2luZyB3aGlsZSBkaXNjYXJkaW5nIGlucHV0JywgKCkgPT4ge1xuICAgIGl0KCdhbGxvd3MgdG8gZXhjbHVkZSBwYXJlbnRoZXNlcycsICgpID0+IHtcbiAgICAgICAgY29uc3QgaW5zaWRlUGFyZW5zID0gcGNoYXIoJygnKVxuICAgICAgICAgICAgLmRpc2NhcmRGaXJzdChtYW55KGFueU9mKGxvd2VyY2FzZXMpKSlcbiAgICAgICAgICAgIC5kaXNjYXJkU2Vjb25kKHBjaGFyKCcpJykpO1xuICAgICAgICBleHBlY3QoaW5zaWRlUGFyZW5zLnJ1bignKG1hcmNvKScpLnRvU3RyaW5nKCkpXG4gICAgICAgICAgICAudG8uYmUuZXFsKCdWYWxpZGF0aW9uLlN1Y2Nlc3MoW1ttLGEscixjLG9dLHJvdz0xO2NvbD0wO3Jlc3Q9XSknKTtcbiAgICAgICAgZXhwZWN0KGluc2lkZVBhcmVucy5ydW4oJygpJykudG9TdHJpbmcoKSlcbiAgICAgICAgICAgIC50by5iZS5lcWwoJ1ZhbGlkYXRpb24uU3VjY2VzcyhbW10scm93PTE7Y29sPTA7cmVzdD1dKScpO1xuICAgIH0pO1xuICAgIGl0KCcuLi5ldmVuIHVzaW5nIGEgdGFpbG9yLW1hZGUgbWV0aG9kJywgKCkgPT4ge1xuICAgICAgICBjb25zdCBpbnNpZGVQYXJlbnMgPSBiZXR3ZWVuUGFyZW5zKHBzdHJpbmcoJ21hcmNvJykpO1xuICAgICAgICBleHBlY3QoaW5zaWRlUGFyZW5zLnJ1bignKG1hcmNvKScpLnRvU3RyaW5nKCkpXG4gICAgICAgICAgICAudG8uYmUuZXFsKCdWYWxpZGF0aW9uLlN1Y2Nlc3MoW1ttLGEscixjLG9dLHJvdz0xO2NvbD0wO3Jlc3Q9XSknKTtcbiAgICB9KTtcbiAgICBpdCgnY2hlcnJ5LXBpY2tpbmcgZWxlbWVudHMgc2VwYXJhdGVkIGJ5IHNlcGFyYXRvcnMnLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHN1YnN0cmluZ3NXaXRoQ29tbWFzID0gbWFueShtYW55MShhbnlPZihsb3dlcmNhc2VzKSkuZGlzY2FyZFNlY29uZChwY2hhcignLCcpKSk7XG4gICAgICAgIGV4cGVjdChzdWJzdHJpbmdzV2l0aENvbW1hcy5ydW4oJ2EsYixjZCwxJykudG9TdHJpbmcoKSlcbiAgICAgICAgICAgIC50by5iZS5lcWwoJ1ZhbGlkYXRpb24uU3VjY2VzcyhbW1thXSxbYl0sW2MsZF1dLHJvdz0wO2NvbD03O3Jlc3Q9MV0pJyk7XG4gICAgfSk7XG4gICAgaXQoJy4uLmFsc28gd2hlbiBpbnNpZGUgYSBsaXN0cycsICgpID0+IHtcbiAgICAgICAgY29uc3Qgc3Vic3RyaW5nc1dpdGhDb21tYXMgPSBtYW55KG1hbnkxKGFueU9mKGxvd2VyY2FzZXMpKS5kaXNjYXJkU2Vjb25kKHBjaGFyKCcsJykpKTtcbiAgICAgICAgY29uc3QgbGlzdEVsZW1lbnRzID0gYmV0d2VlbihwY2hhcignWycpLCBzdWJzdHJpbmdzV2l0aENvbW1hcywgcGNoYXIoJ10nKSk7XG4gICAgICAgIGV4cGVjdChsaXN0RWxlbWVudHMucnVuKCdbYSxiLGNkLG1hcmNvLF0xJykudG9TdHJpbmcoKSlcbiAgICAgICAgICAgIC50by5iZS5lcWwoJ1ZhbGlkYXRpb24uU3VjY2VzcyhbW1thXSxbYl0sW2MsZF0sW20sYSxyLGMsb11dLHJvdz0wO2NvbD0xNTtyZXN0PTFdKScpO1xuICAgIH0pO1xuICAgIGRlc2NyaWJlKCd0aGFua3MgdG8gdGhlIHNwZWNpZmljIHNlcEJ5MSBvcGVyYXRvcicsICgpID0+IHtcbiAgICAgICAgY29uc3QgdmFsdWVzUCA9IGFueU9mKGxvd2VyY2FzZXMpO1xuICAgICAgICBjb25zdCBjb21tYVAgPSBwY2hhcignLCcpO1xuICAgICAgICBpdCgnY2hlcnJ5LXBpY2tpbmcgZWxlbWVudHMgc2VwYXJhdGVkIGJ5IHNlcGFyYXRvcnMnLCAoKSA9PiB7XG4gICAgICAgICAgICBleHBlY3Qoc2VwQnkxKHZhbHVlc1AsIGNvbW1hUCkucnVuKCdhLGIsY2QsMScpLnRvU3RyaW5nKCkpXG4gICAgICAgICAgICAgICAgLnRvLmJlLmVxbCgnVmFsaWRhdGlvbi5TdWNjZXNzKFtbW2FdLFtiXSxbYyxkXV0scm93PTA7Y29sPTc7cmVzdD0xXSknKTtcbiAgICAgICAgfSk7XG4gICAgICAgIGl0KCcuLi5hbHNvIHdoZW4gaW5zaWRlIGEgbGlzdHMnLCAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBsaXN0RWxlbWVudHMgPSBiZXR3ZWVuKHBjaGFyKCdbJyksIHNlcEJ5MSh2YWx1ZXNQLCBjb21tYVApLCBwY2hhcignXScpKTtcbiAgICAgICAgICAgIGV4cGVjdChsaXN0RWxlbWVudHMucnVuKCdbYSxiLGNkLG1hcmNvLF0nKS50b1N0cmluZygpKVxuICAgICAgICAgICAgICAgIC50by5iZS5lcWwoJ1ZhbGlkYXRpb24uU3VjY2VzcyhbW1thXSxbYl0sW2MsZF0sW20sYSxyLGMsb11dLHJvdz0xO2NvbD0wO3Jlc3Q9XSknKTtcbiAgICAgICAgfSk7XG4gICAgICAgIGl0KCcuLi5saXN0cyB3aXRoIG5vIGVsZW1lbnRzJywgKCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgbGlzdEVsZW1lbnRzID0gYmV0d2VlbihwY2hhcignWycpLCBzZXBCeTEodmFsdWVzUCwgY29tbWFQKSwgcGNoYXIoJ10nKSk7XG4gICAgICAgICAgICBleHBlY3QobGlzdEVsZW1lbnRzLnJ1bignW10nKS50b1N0cmluZygpKVxuICAgICAgICAgICAgICAgIC50by5iZS5lcWwoJ1ZhbGlkYXRpb24uU3VjY2VzcyhbW10scm93PTE7Y29sPTA7cmVzdD1dKScpO1xuICAgICAgICB9KTtcbiAgICAgICAgaXQoJy4uLmxpc3RzIHdpdGgganVzdCBvbmUgZWxlbWVudCcsICgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGxpc3RFbGVtZW50cyA9IGJldHdlZW4ocGNoYXIoJ1snKSwgc2VwQnkxKHZhbHVlc1AsIGNvbW1hUCksIHBjaGFyKCddJykpO1xuICAgICAgICAgICAgZXhwZWN0KGxpc3RFbGVtZW50cy5ydW4oJ1thXScpLnRvU3RyaW5nKCkpXG4gICAgICAgICAgICAgICAgLnRvLmJlLmVxbCgnVmFsaWRhdGlvbi5TdWNjZXNzKFtbW2FdXSxyb3c9MTtjb2w9MDtyZXN0PV0pJyk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xufSk7XG4iXX0=