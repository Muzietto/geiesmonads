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

    describe.only('a parser for a specific word', function () {
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
        it('can parse a char many times and return a string', function () {
            var zeroOrMoreParser = (0, _parsers.manyChars)((0, _parsers.pchar)('m'));
            var parsing = zeroOrMoreParser.run(text('mmmarco'));
            (0, _chai.expect)(parsing.isSuccess).to.be.true;
            (0, _chai.expect)(parsing.toString()).to.be.eql('Validation.Success([mmm,row=0;col=3;rest=arco])');
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2pzLXNwZWMvcGFyc2Vyc190ZXN0cy5qcyJdLCJuYW1lcyI6WyJsb3dlcmNhc2VzIiwidXBwZXJjYXNlcyIsImRpZ2l0cyIsIndoaXRlcyIsInRleHQiLCJmcm9tVGV4dCIsImRlc2NyaWJlIiwicGFyc2VyQSIsInBhcnNlcjEiLCJpdCIsInBhcnNpbmdBIiwidmFsdWUiLCJ0byIsImJlIiwiZXFsIiwicmVzdCIsImlzU3VjY2VzcyIsInRydWUiLCJwYXJzaW5nQiIsImlzRmFpbHVyZSIsInBhcnNpbmcxIiwicGFyc2luZzIiLCJwYXJzaW5nMyIsInJ1biIsInBhcnNlckFhbmRCIiwicGFyc2luZ0FhbmRCIiwidG9TdHJpbmciLCJwYXJzZXJBb3JCIiwicGFyc2luZ0FvckIiLCJwYXJzZXJzQ2hvaWNlIiwicGFyc2luZ0Nob2ljZSIsImxvd2VyY2FzZXNQYXJzZXIiLCJ1cHBlcmNhc2VzUGFyc2VyIiwiZGlnaXRzUGFyc2VyIiwicGFpckFkZGVyIiwieCIsInkiLCJhYmNQIiwiZm1hcCIsInBhcnNpbmciLCJwYXJzZURpZ2l0IiwidGhyZWVEaWdpdHMiLCJiZWZvcmUiLCJ1bnBhY2tlciIsInoiLCJ0aHJlZURpZ2l0c0ltcGwiLCJ0aHJlZURpZ2l0c0luc3QiLCJhZGRTdHJpbmdzIiwiQXBsdXNCIiwiYWRkRGlnaXRzIiwiYWRkUGFyc2VyIiwiYWJjUGFyc2VyIiwibWFyY29QYXJzZXIiLCJtYXJjb1BhcnNpbmciLCJvbmx5IiwiemVyb09yTW9yZVBhcnNpbmdGdW5jdGlvbiIsInplcm9Pck1vcmVQYXJzZXIiLCJ3aGl0ZXNQYXJzZXIiLCJ0d29Xb3JkcyIsIm9uZU9yTW9yZVBhcnNlciIsInBpbnQiLCJwYXJzZUludCIsImwiLCJyZWR1Y2UiLCJhY2MiLCJjdXJyIiwib3B0RG90VGhlbkEiLCJhbmRUaGVuIiwib3B0RG90V2l0aERlZmF1bHRUaGVuQSIsInBTaWduZWRJbnQiLCJvcHRTaWduTnVtYmVyUGFpciIsImlzSnVzdCIsIm9wdFN1YnN0cmluZyIsImRpc2NhcmRJbnRlZ2VyU2lnbiIsImRpc2NhcmRGaXJzdCIsImRpc2NhcmRTdWZmaXgiLCJkaXNjYXJkU2Vjb25kIiwidGFwSW50b0Rpc2NhcmRJbnRlZ2VyU2lnbiIsInJlcyIsInN0b3JlZExvZyIsImNvbnNvbGUiLCJsb2ciLCJtc2ciLCJsb2dJbnRlcm1lZGlhdGVSZXN1bHQiLCJpbnNpZGVQYXJlbnMiLCJzdWJzdHJpbmdzV2l0aENvbW1hcyIsImxpc3RFbGVtZW50cyIsInZhbHVlc1AiLCJjb21tYVAiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBNkNBLFFBQU1BLGFBQWEsQ0FBQyxHQUFELEVBQU0sR0FBTixFQUFXLEdBQVgsRUFBZ0IsR0FBaEIsRUFBcUIsR0FBckIsRUFBMEIsR0FBMUIsRUFBK0IsR0FBL0IsRUFBb0MsR0FBcEMsRUFBeUMsR0FBekMsRUFBOEMsR0FBOUMsRUFBbUQsR0FBbkQsRUFBd0QsR0FBeEQsRUFBNkQsR0FBN0QsRUFBa0UsR0FBbEUsRUFBdUUsR0FBdkUsRUFBNEUsR0FBNUUsRUFBaUYsR0FBakYsRUFBc0YsR0FBdEYsRUFBMkYsR0FBM0YsRUFBZ0csR0FBaEcsRUFBcUcsR0FBckcsRUFBMEcsR0FBMUcsRUFBK0csR0FBL0csRUFBb0gsR0FBcEgsRUFBeUgsR0FBekgsRUFBOEgsR0FBOUgsQ0FBbkI7QUFDQSxRQUFNQyxhQUFhLENBQUMsR0FBRCxFQUFNLEdBQU4sRUFBVyxHQUFYLEVBQWdCLEdBQWhCLEVBQXFCLEdBQXJCLEVBQTBCLEdBQTFCLEVBQStCLEdBQS9CLEVBQW9DLEdBQXBDLEVBQXlDLEdBQXpDLEVBQThDLEdBQTlDLEVBQW1ELEdBQW5ELEVBQXdELEdBQXhELEVBQTZELEdBQTdELEVBQWtFLEdBQWxFLEVBQXVFLEdBQXZFLEVBQTRFLEdBQTVFLEVBQWlGLEdBQWpGLEVBQXNGLEdBQXRGLEVBQTJGLEdBQTNGLEVBQWdHLEdBQWhHLEVBQXFHLEdBQXJHLEVBQTBHLEdBQTFHLEVBQStHLEdB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YS9ELEdBQWIsQ0FBaUIsSUFBakIsRUFBdUJHLFFBQXZCLEVBQVAsRUFDS2QsRUFETCxDQUNRQyxFQURSLENBQ1dDLEdBRFgsQ0FDZSw0Q0FEZjtBQUVILGFBSkQ7QUFLQUwsZUFBRyxnQ0FBSCxFQUFxQyxZQUFNO0FBQ3ZDLG9CQUFNNkUsZUFBZSxzQkFBUSxvQkFBTSxHQUFOLENBQVIsRUFBb0IscUJBQU9DLE9BQVAsRUFBZ0JDLE1BQWhCLENBQXBCLEVBQTZDLG9CQUFNLEdBQU4sQ0FBN0MsQ0FBckI7QUFDQSxrQ0FBT0YsYUFBYS9ELEdBQWIsQ0FBaUIsS0FBakIsRUFBd0JHLFFBQXhCLEVBQVAsRUFDS2QsRUFETCxDQUNRQyxFQURSLENBQ1dDLEdBRFgsQ0FDZSwrQ0FEZjtBQUVILGFBSkQ7QUFLSCxTQXRCRDtBQXVCSCxLQWpERCIsImZpbGUiOiJwYXJzZXJzX3Rlc3RzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtleHBlY3R9IGZyb20gJ2NoYWknO1xuaW1wb3J0IHtcbiAgICBjaGFyUGFyc2VyLFxuICAgIGRpZ2l0UGFyc2VyLFxuICAgIHBjaGFyLFxuICAgIHBkaWdpdCxcbiAgICBhbmRUaGVuLFxuICAgIG9yRWxzZSxcbiAgICBjaG9pY2UsXG4gICAgYW55T2YsXG4gICAgZm1hcCxcbiAgICByZXR1cm5QLFxuICAgIGFwcGx5UCxcbiAgICBsaWZ0MixcbiAgICBzZXF1ZW5jZVAsXG4gICAgc2VxdWVuY2VQMixcbiAgICBwc3RyaW5nLFxuICAgIHplcm9Pck1vcmUsXG4gICAgbWFueSxcbiAgICBtYW55MSxcbiAgICBtYW55Q2hhcnMsXG4gICAgbWFueUNoYXJzMSxcbiAgICBvcHQsXG4gICAgb3B0Qm9vayxcbiAgICBkaXNjYXJkRmlyc3QsXG4gICAgZGlzY2FyZFNlY29uZCxcbiAgICBzZXBCeTEsXG4gICAgYmV0d2VlbixcbiAgICBiZXR3ZWVuUGFyZW5zLFxuICAgIHRhcFAsXG4gICAgbG9nUCxcbiAgICBwd29yZCxcbn0gZnJvbSAncGFyc2Vycyc7XG5pbXBvcnQge1xuICAgIGlzUGFpcixcbiAgICBpc1N1Y2Nlc3MsXG4gICAgaXNGYWlsdXJlLFxuICAgIGlzUGFyc2VyLFxuICAgIGlzU29tZSxcbiAgICBpc05vbmUsXG59IGZyb20gJ3V0aWwnO1xuaW1wb3J0IHtNYXliZX0gZnJvbSAnbWF5YmUnO1xuaW1wb3J0IHtWYWxpZGF0aW9ufSBmcm9tICd2YWxpZGF0aW9uJztcbmltcG9ydCB7UG9zaXRpb259IGZyb20gJ2NsYXNzZXMnO1xuXG5jb25zdCBsb3dlcmNhc2VzID0gWydhJywgJ2InLCAnYycsICdkJywgJ2UnLCAnZicsICdnJywgJ2gnLCAnaScsICdqJywgJ2snLCAnbCcsICdtJywgJ24nLCAnbycsICdwJywgJ3EnLCAncicsICdzJywgJ3QnLCAndScsICd2JywgJ3cnLCAneCcsICd5JywgJ3onLF07XG5jb25zdCB1cHBlcmNhc2VzID0gWydBJywgJ0InLCAnQycsICdEJywgJ0UnLCAnRicsICdHJywgJ0gnLCAnSScsICdKJywgJ0snLCAnTCcsICdNJywgJ04nLCAnTycsICdQJywgJ1EnLCAnUicsICdTJywgJ1QnLCAnVScsICdWJywgJ1cnLCAnWCcsICdZJywgJ1onLF07XG5jb25zdCBkaWdpdHMgPSBbJzAnLCAnMScsICcyJywgJzMnLCAnNCcsICc1JywgJzYnLCAnNycsICc4JywgJzknXTtcbmNvbnN0IHdoaXRlcyA9IFsnICcsICdcXHQnLCAnXFxuJywgJ1xcciddO1xuY29uc3QgdGV4dCA9IFBvc2l0aW9uLmZyb21UZXh0O1xuXG5kZXNjcmliZSgnYSB2ZXJ5IHNpbXBsZSBwYXJzZXIgZm9yIGNoYXJzIG9yIGZvciBkaWdpdHMnLCAoKSA9PiB7XG4gICAgY29uc3QgcGFyc2VyQSA9IGNoYXJQYXJzZXIoJ2EnKTtcbiAgICBjb25zdCBwYXJzZXIxID0gZGlnaXRQYXJzZXIoMSk7XG5cbiAgICBpdCgnY2FuIHBhcnNlIGEgc2luZ2xlIGNoYXInLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHBhcnNpbmdBID0gcGFyc2VyQSh0ZXh0KCdhYmMnKSk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQS52YWx1ZVswXSkudG8uYmUuZXFsKCdhJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQS52YWx1ZVsxXS5yZXN0KCkpLnRvLmJlLmVxbCgnYmMnKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdBLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcbiAgICB9KTtcblxuICAgIGl0KCdjYW4gYWxzbyBOT1QgcGFyc2UgYSBzaW5nbGUgY2hhcicsICgpID0+IHtcbiAgICAgICAgY29uc3QgcGFyc2luZ0IgPSBwYXJzZXJBKHRleHQoJ2JjZCcpKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdCLnZhbHVlWzBdKS50by5iZS5lcWwoJ2NoYXJQYXJzZXInKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdCLnZhbHVlWzFdKS50by5iZS5lcWwoJ3dhbnRlZCBhOyBnb3QgYicpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0IudmFsdWVbMl0ucmVzdCgpKS50by5iZS5lcWwoJ2JjZCcpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0IuaXNGYWlsdXJlKS50by5iZS50cnVlO1xuICAgIH0pO1xuXG4gICAgaXQoJ2ZhaWxzIGF0IHRoZSBlbmQgb2YgdGhlIHN0cmVhbScsICgpID0+IHtcbiAgICAgICAgY29uc3QgcGFyc2luZ0EgPSBwYXJzZXJBKHRleHQoJycpKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdBLnZhbHVlWzBdKS50by5iZS5lcWwoJ2NoYXJQYXJzZXInKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdBLnZhbHVlWzFdKS50by5iZS5lcWwoJ25vIG1vcmUgaW5wdXQnKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdBLnZhbHVlWzJdLnJlc3QoKSkudG8uYmUuZXFsKCcnKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdBLmlzRmFpbHVyZSkudG8uYmUudHJ1ZTtcbiAgICB9KTtcblxuICAgIGl0KCdjYW4gcGFyc2UgYSBzaW5nbGUgZGlnaXQnLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHBhcnNpbmcxID0gcGFyc2VyMSh0ZXh0KCcxMjMnKSk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nMS52YWx1ZVswXSkudG8uYmUuZXFsKDEpO1xuICAgICAgICBleHBlY3QocGFyc2luZzEudmFsdWVbMV0ucmVzdCgpKS50by5iZS5lcWwoJzIzJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nMS5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgfSk7XG5cbiAgICBpdCgnY2FuIGFsc28gTk9UIHBhcnNlIGEgc2luZ2xlIGRpZ2l0JywgKCkgPT4ge1xuICAgICAgICBjb25zdCBwYXJzaW5nMiA9IHBhcnNlcjEodGV4dCgnMjM0JykpO1xuICAgICAgICBleHBlY3QocGFyc2luZzIudmFsdWVbMF0pLnRvLmJlLmVxbCgnZGlnaXRQYXJzZXInKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcyLnZhbHVlWzFdKS50by5iZS5lcWwoJ3dhbnRlZCAxOyBnb3QgMicpO1xuICAgICAgICBleHBlY3QocGFyc2luZzIudmFsdWVbMl0ucmVzdCgpKS50by5iZS5lcWwoJzIzNCcpO1xuICAgICAgICBleHBlY3QocGFyc2luZzIuaXNGYWlsdXJlKS50by5iZS50cnVlO1xuICAgIH0pO1xuXG4gICAgaXQoJ2ZhaWxzIGF0IHRoZSBlbmQgb2YgdGhlIHN0cmVhbSBhbHNvIHdoZW4gaHVudGluZyBmb3IgZGlnaXRzJywgKCkgPT4ge1xuICAgICAgICBjb25zdCBwYXJzaW5nMyA9IHBhcnNlcjEodGV4dCgnJykpO1xuICAgICAgICBleHBlY3QocGFyc2luZzMudmFsdWVbMF0pLnRvLmJlLmVxbCgnZGlnaXRQYXJzZXInKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmczLnZhbHVlWzFdKS50by5iZS5lcWwoJ25vIG1vcmUgaW5wdXQnKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmczLnZhbHVlWzJdLnJlc3QoKSkudG8uYmUuZXFsKCcnKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmczLmlzRmFpbHVyZSkudG8uYmUudHJ1ZTtcbiAgICB9KTtcbn0pO1xuXG5kZXNjcmliZSgnYSBuYW1lZCBjaGFyYWN0ZXIgcGFyc2VyJywgKCkgPT4ge1xuICAgIGNvbnN0IHBhcnNlckEgPSBwY2hhcignYScpO1xuXG4gICAgaXQoJ2NhbiBwYXJzZSBhIHNpbmdsZSBjaGFyJywgKCkgPT4ge1xuICAgICAgICBleHBlY3QoaXNQYXJzZXIocGFyc2VyQSkpLnRvLmJlLnRydWU7XG4gICAgICAgIGNvbnN0IHBhcnNpbmdBID0gcGFyc2VyQS5ydW4odGV4dCgnYWJjJykpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0EudmFsdWVbMF0pLnRvLmJlLmVxbCgnYScpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0EudmFsdWVbMV0ucmVzdCgpKS50by5iZS5lcWwoJ2JjJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQS5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgfSk7XG5cbiAgICBpdCgnY2FuIGFsc28gTk9UIHBhcnNlIGEgc2luZ2xlIGNoYXInLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHBhcnNpbmdCID0gcGFyc2VyQS5ydW4odGV4dCgnYmNkJykpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0IudmFsdWVbMF0pLnRvLmJlLmVxbCgncGNoYXJfYScpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0IudmFsdWVbMV0pLnRvLmJlLmVxbCgnd2FudGVkIGE7IGdvdCBiJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQi5pc0ZhaWx1cmUpLnRvLmJlLnRydWU7XG4gICAgfSk7XG59KTtcblxuZGVzY3JpYmUoJ3R3byBwYXJzZXJzIGJvdW5kIGJ5IGFuZFRoZW4nLCAoKSA9PiB7XG4gICAgY29uc3QgcGFyc2VyQWFuZEIgPSBhbmRUaGVuKHBjaGFyKCdhJyksIHBjaGFyKCdiJykpO1xuXG4gICAgaXQoJ2NhbiBwYXJzZSB0d28gY2hhcnMnLCAoKSA9PiB7XG4gICAgICAgIGV4cGVjdChpc1BhcnNlcihwYXJzZXJBYW5kQikpLnRvLmJlLnRydWU7XG4gICAgICAgIGNvbnN0IHBhcnNpbmdBYW5kQiA9IHBhcnNlckFhbmRCLnJ1bih0ZXh0KCdhYmMnKSk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQWFuZEIuaXNTdWNjZXNzKS50by5iZS50cnVlO1xuICAgICAgICBleHBlY3QocGFyc2luZ0FhbmRCLnZhbHVlWzBdLnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgnW2EsYl0nKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdBYW5kQi52YWx1ZVsxXS5yZXN0KCkpLnRvLmJlLmVxbCgnYycpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0FhbmRCLnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgnVmFsaWRhdGlvbi5TdWNjZXNzKFtbYSxiXSxyb3c9MDtjb2w9MjtyZXN0PWNdKScpO1xuICAgIH0pO1xuXG4gICAgaXQoJ2NhbiBhbHNvIE5PVCBwYXJzZSB0d28gY2hhcnMnLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHBhcnNpbmdBYW5kQiA9IHBhcnNlckFhbmRCLnJ1bih0ZXh0KCdhY2QnKSk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQWFuZEIuaXNGYWlsdXJlKS50by5iZS50cnVlO1xuICAgICAgICBleHBlY3QocGFyc2luZ0FhbmRCLnZhbHVlWzBdKS50by5iZS5lcWwoJ3BjaGFyX2EgYW5kVGhlbiBwY2hhcl9iJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQWFuZEIudmFsdWVbMV0pLnRvLmJlLmVxbCgnd2FudGVkIGI7IGdvdCBjJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQWFuZEIudmFsdWVbMl0ucmVzdCgpKS50by5iZS5lcWwoJ2NkJyk7XG4gICAgfSk7XG5cbiAgICBpdCgnd2lsbCBmYWlsIGlmIHRoZSBpbnB1dCBpcyB0b28gc2hvcnQnLCAoKSA9PiB7XG4gICAgICAgIGV4cGVjdChwYXJzZXJBYW5kQi5ydW4odGV4dCgnYScpKS5pc0ZhaWx1cmUpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChwYXJzZXJBYW5kQi5ydW4odGV4dCgnYWInKSkuaXNTdWNjZXNzKS50by5iZS50cnVlO1xuICAgIH0pO1xufSk7XG5cbmRlc2NyaWJlKCd0d28gcGFyc2VycyBib3VuZCBieSBvckVsc2UnLCAoKSA9PiB7XG4gICAgY29uc3QgcGFyc2VyQW9yQiA9IG9yRWxzZShwY2hhcignYScpLCBwY2hhcignYicpKTtcblxuICAgIGl0KCdjYW4gcGFyc2Ugb25lIG9mIHR3byBjaGFycycsICgpID0+IHtcbiAgICAgICAgZXhwZWN0KGlzUGFyc2VyKHBhcnNlckFvckIpKS50by5iZS50cnVlO1xuICAgICAgICBsZXQgcGFyc2luZ0FvckIgPSBwYXJzZXJBb3JCLnJ1bih0ZXh0KCdhYmMnKSk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQW9yQi5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQW9yQi52YWx1ZVswXSkudG8uYmUuZXFsKCdhJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQW9yQi52YWx1ZVsxXS5yZXN0KCkpLnRvLmJlLmVxbCgnYmMnKTtcbiAgICAgICAgcGFyc2luZ0FvckIgPSBwYXJzZXJBb3JCLnJ1bih0ZXh0KCdiYmMnKSk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQW9yQi5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQW9yQi52YWx1ZVswXSkudG8uYmUuZXFsKCdiJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQW9yQi52YWx1ZVsxXS5yZXN0KCkpLnRvLmJlLmVxbCgnYmMnKTtcbiAgICB9KTtcblxuICAgIGl0KCdjYW4gYWxzbyBwYXJzZSBOT05FIG9mIHR3byBjaGFycycsICgpID0+IHtcbiAgICAgICAgY29uc3QgcGFyc2luZ0FvckIgPSBwYXJzZXJBb3JCLnJ1bih0ZXh0KCdjZGUnKSk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQW9yQi5pc0ZhaWx1cmUpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQW9yQi52YWx1ZVswXSkudG8uYmUuZXFsKCdwY2hhcl9hIG9yRWxzZSBwY2hhcl9iJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQW9yQi52YWx1ZVsxXSkudG8uYmUuZXFsKCd3YW50ZWQgYjsgZ290IGMnKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdBb3JCLnZhbHVlWzJdLnJlc3QoKSkudG8uYmUuZXFsKCdjZGUnKTtcbiAgICB9KTtcblxuICAgIGl0KCd3aWxsIGZhaWwgaWYgdGhlIGlucHV0IGlzIHRvbyBzaG9ydCcsICgpID0+IHtcbiAgICAgICAgZXhwZWN0KHBhcnNlckFvckIucnVuKHRleHQoJ2EnKSkuaXNTdWNjZXNzKS50by5iZS50cnVlO1xuICAgICAgICBleHBlY3QocGFyc2VyQW9yQi5ydW4odGV4dCgnJykpLmlzRmFpbHVyZSkudG8uYmUudHJ1ZTtcbiAgICB9KTtcbn0pO1xuXG5kZXNjcmliZSgnYSBjaG9pY2Ugb2YgcGFyc2VycyBib3VuZCBieSBvckVsc2UnLCAoKSA9PiB7XG4gICAgY29uc3QgcGFyc2Vyc0Nob2ljZSA9IGNob2ljZShbcGNoYXIoJ2EnKSwgcGNoYXIoJ2InKSwgcGNoYXIoJ2MnKSwgcGNoYXIoJ2QnKSxdKTtcblxuICAgIGl0KCdjYW4gcGFyc2Ugb25lIG9mIGZvdXIgY2hhcnMnLCAoKSA9PiB7XG4gICAgICAgIGV4cGVjdChpc1BhcnNlcihwYXJzZXJzQ2hvaWNlKSkudG8uYmUudHJ1ZTtcbiAgICAgICAgbGV0IHBhcnNpbmdDaG9pY2UgPSBwYXJzZXJzQ2hvaWNlLnJ1bih0ZXh0KCdhJykpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLnZhbHVlWzBdKS50by5iZS5lcWwoJ2EnKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UudmFsdWVbMV0ucmVzdCgpKS50by5iZS5lcWwoJycpO1xuICAgICAgICBwYXJzaW5nQ2hvaWNlID0gcGFyc2Vyc0Nob2ljZS5ydW4odGV4dCgnYicpKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UuaXNTdWNjZXNzKS50by5iZS50cnVlO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS52YWx1ZVswXSkudG8uYmUuZXFsKCdiJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLnZhbHVlWzFdLnJlc3QoKSkudG8uYmUuZXFsKCcnKTtcbiAgICAgICAgcGFyc2luZ0Nob2ljZSA9IHBhcnNlcnNDaG9pY2UucnVuKHRleHQoJ2QnKSk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UudmFsdWVbMF0pLnRvLmJlLmVxbCgnZCcpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS52YWx1ZVsxXS5yZXN0KCkpLnRvLmJlLmVxbCgnJyk7XG4gICAgfSk7XG5cbiAgICBpdCgnY2FuIGFsc28gcGFyc2UgTk9ORSBvZiBmb3VyIGNoYXJzJywgKCkgPT4ge1xuICAgICAgICBjb25zdCBwYXJzaW5nQ2hvaWNlID0gcGFyc2Vyc0Nob2ljZS5ydW4odGV4dCgneCcpKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UuaXNGYWlsdXJlKS50by5iZS50cnVlO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS52YWx1ZVswXSkudG8uYmUuZXFsKCdjaG9pY2UgL3BjaGFyX2EvcGNoYXJfYi9wY2hhcl9jL3BjaGFyX2QnKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UudmFsdWVbMV0pLnRvLmJlLmVxbCgnX2ZhaWwnKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UudmFsdWVbMl0ucmVzdCgpKS50by5iZS5lcWwoJ3gnKTtcbiAgICB9KTtcblxuICAgIGl0KCd3aWxsIGZhaWwgaWYgdGhlIGlucHV0IGlzIHRvbyBzaG9ydCcsICgpID0+IHtcbiAgICAgICAgZXhwZWN0KHBhcnNlcnNDaG9pY2UucnVuKHRleHQoJ2EnKSkuaXNTdWNjZXNzKS50by5iZS50cnVlO1xuICAgICAgICBleHBlY3QocGFyc2Vyc0Nob2ljZS5ydW4odGV4dCgnJykpLmlzRmFpbHVyZSkudG8uYmUudHJ1ZTtcbiAgICB9KTtcbn0pO1xuXG5kZXNjcmliZSgnYSBwYXJzZXIgZm9yIGFueSBvZiBhIGxpc3Qgb2YgY2hhcnMnLCAoKSA9PiB7XG4gICAgaXQoJ2NhbiBwYXJzZSBhbnkgbG93ZXJjYXNlIGNoYXInLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IGxvd2VyY2FzZXNQYXJzZXIgPSBhbnlPZihsb3dlcmNhc2VzKTtcblxuICAgICAgICBleHBlY3QoaXNQYXJzZXIobG93ZXJjYXNlc1BhcnNlcikpLnRvLmJlLnRydWU7XG4gICAgICAgIGxldCBwYXJzaW5nQ2hvaWNlID0gbG93ZXJjYXNlc1BhcnNlci5ydW4odGV4dCgnYScpKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UuaXNTdWNjZXNzKS50by5iZS50cnVlO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS52YWx1ZVswXSkudG8uYmUuZXFsKCdhJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLnZhbHVlWzFdLnJlc3QoKSkudG8uYmUuZXFsKCcnKTtcbiAgICAgICAgcGFyc2luZ0Nob2ljZSA9IGxvd2VyY2FzZXNQYXJzZXIucnVuKHRleHQoJ2InKSk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UudmFsdWVbMF0pLnRvLmJlLmVxbCgnYicpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS52YWx1ZVsxXS5yZXN0KCkpLnRvLmJlLmVxbCgnJyk7XG4gICAgICAgIHBhcnNpbmdDaG9pY2UgPSBsb3dlcmNhc2VzUGFyc2VyLnJ1bih0ZXh0KCdkJykpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLnZhbHVlWzBdKS50by5iZS5lcWwoJ2QnKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UudmFsdWVbMV0ucmVzdCgpKS50by5iZS5lcWwoJycpO1xuICAgICAgICBwYXJzaW5nQ2hvaWNlID0gbG93ZXJjYXNlc1BhcnNlci5ydW4odGV4dCgneicpKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UuaXNTdWNjZXNzKS50by5iZS50cnVlO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS52YWx1ZVswXSkudG8uYmUuZXFsKCd6Jyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLnZhbHVlWzFdLnJlc3QoKSkudG8uYmUuZXFsKCcnKTtcblxuICAgICAgICBwYXJzaW5nQ2hvaWNlID0gbG93ZXJjYXNlc1BhcnNlci5ydW4odGV4dCgnWScpKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UuaXNGYWlsdXJlKS50by5iZS50cnVlO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS52YWx1ZVswXSkudG8uYmUuZXFsKCdhbnlPZiBhYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5eicpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS52YWx1ZVsxXSkudG8uYmUuZXFsKCdfZmFpbCcpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS52YWx1ZVsyXS5yZXN0KCkpLnRvLmJlLmVxbCgnWScpO1xuICAgIH0pO1xuXG4gICAgaXQoJ2NhbiBwYXJzZSBhbnkgdXBwZXJjYXNlIGNoYXInLCAoKSA9PiB7XG4gICAgICAgIGxldCB1cHBlcmNhc2VzUGFyc2VyID0gYW55T2YodXBwZXJjYXNlcyk7XG5cbiAgICAgICAgZXhwZWN0KGlzUGFyc2VyKHVwcGVyY2FzZXNQYXJzZXIpKS50by5iZS50cnVlO1xuICAgICAgICBsZXQgcGFyc2luZ0Nob2ljZSA9IHVwcGVyY2FzZXNQYXJzZXIucnVuKHRleHQoJ0EnKSk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UudmFsdWVbMF0pLnRvLmJlLmVxbCgnQScpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS52YWx1ZVsxXS5yZXN0KCkpLnRvLmJlLmVxbCgnJyk7XG4gICAgICAgIHBhcnNpbmdDaG9pY2UgPSB1cHBlcmNhc2VzUGFyc2VyLnJ1bih0ZXh0KCdCJykpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLnZhbHVlWzBdKS50by5iZS5lcWwoJ0InKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UudmFsdWVbMV0ucmVzdCgpKS50by5iZS5lcWwoJycpO1xuICAgICAgICBwYXJzaW5nQ2hvaWNlID0gdXBwZXJjYXNlc1BhcnNlci5ydW4odGV4dCgnUicpKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UuaXNTdWNjZXNzKS50by5iZS50cnVlO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS52YWx1ZVswXSkudG8uYmUuZXFsKCdSJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLnZhbHVlWzFdLnJlc3QoKSkudG8uYmUuZXFsKCcnKTtcbiAgICAgICAgcGFyc2luZ0Nob2ljZSA9IHVwcGVyY2FzZXNQYXJzZXIucnVuKHRleHQoJ1onKSk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UudmFsdWVbMF0pLnRvLmJlLmVxbCgnWicpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS52YWx1ZVsxXS5yZXN0KCkpLnRvLmJlLmVxbCgnJyk7XG5cbiAgICAgICAgcGFyc2luZ0Nob2ljZSA9IHVwcGVyY2FzZXNQYXJzZXIucnVuKHRleHQoJ3MnKSk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLmlzRmFpbHVyZSkudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UudmFsdWVbMF0pLnRvLmJlLmVxbCgnYW55T2YgQUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVonKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UudmFsdWVbMV0pLnRvLmJlLmVxbCgnX2ZhaWwnKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UudmFsdWVbMl0ucmVzdCgpKS50by5iZS5lcWwoJ3MnKTtcbiAgICB9KTtcblxuICAgIGl0KCdjYW4gcGFyc2UgYW55IGRpZ2l0JywgKCkgPT4ge1xuICAgICAgICBsZXQgZGlnaXRzUGFyc2VyID0gYW55T2YoZGlnaXRzKTtcblxuICAgICAgICBleHBlY3QoaXNQYXJzZXIoZGlnaXRzUGFyc2VyKSkudG8uYmUudHJ1ZTtcbiAgICAgICAgbGV0IHBhcnNpbmdDaG9pY2UgPSBkaWdpdHNQYXJzZXIucnVuKHRleHQoJzEnKSk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UudmFsdWVbMF0pLnRvLmJlLmVxbCgnMScpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS52YWx1ZVsxXS5yZXN0KCkpLnRvLmJlLmVxbCgnJyk7XG4gICAgICAgIHBhcnNpbmdDaG9pY2UgPSBkaWdpdHNQYXJzZXIucnVuKHRleHQoJzMnKSk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UudmFsdWVbMF0pLnRvLmJlLmVxbCgnMycpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS52YWx1ZVsxXS5yZXN0KCkpLnRvLmJlLmVxbCgnJyk7XG4gICAgICAgIHBhcnNpbmdDaG9pY2UgPSBkaWdpdHNQYXJzZXIucnVuKHRleHQoJzAnKSk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UudmFsdWVbMF0pLnRvLmJlLmVxbCgnMCcpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS52YWx1ZVsxXS5yZXN0KCkpLnRvLmJlLmVxbCgnJyk7XG4gICAgICAgIHBhcnNpbmdDaG9pY2UgPSBkaWdpdHNQYXJzZXIucnVuKHRleHQoJzgnKSk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UudmFsdWVbMF0pLnRvLmJlLmVxbCgnOCcpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS52YWx1ZVsxXS5yZXN0KCkpLnRvLmJlLmVxbCgnJyk7XG5cbiAgICAgICAgcGFyc2luZ0Nob2ljZSA9IGRpZ2l0c1BhcnNlci5ydW4odGV4dCgncycpKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UuaXNGYWlsdXJlKS50by5iZS50cnVlO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS52YWx1ZVswXSkudG8uYmUuZXFsKCdhbnlPZiAwMTIzNDU2Nzg5Jyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLnZhbHVlWzFdKS50by5iZS5lcWwoJ19mYWlsJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLnZhbHVlWzJdLnJlc3QoKSkudG8uYmUuZXFsKCdzJyk7XG4gICAgfSk7XG5cbiAgICBpdCgnd2lsbCBmYWlsIGlmIHRoZSBpbnB1dCBpcyB0b28gc2hvcnQnLCAoKSA9PiB7XG4gICAgICAgIGV4cGVjdChhbnlPZihsb3dlcmNhc2VzKS5ydW4odGV4dCgnJykpLmlzRmFpbHVyZSkudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KGFueU9mKGRpZ2l0cykucnVuKHRleHQoJycpKS5pc0ZhaWx1cmUpLnRvLmJlLnRydWU7XG4gICAgfSk7XG59KTtcbmRlc2NyaWJlKCdwYXJzZSBBQkMnLCAoKSA9PiB7XG4gICAgaXQoJ3BhcnNlcyBBQkMnLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHBhaXJBZGRlciA9IChbeCwgeV0pID0+IHggKyB5O1xuICAgICAgICBjb25zdCBhYmNQID0gYW5kVGhlbihcbiAgICAgICAgICAgIHBjaGFyKCdhJyksXG4gICAgICAgICAgICBhbmRUaGVuKFxuICAgICAgICAgICAgICAgIHBjaGFyKCdiJyksXG4gICAgICAgICAgICAgICAgYW5kVGhlbihcbiAgICAgICAgICAgICAgICAgICAgcGNoYXIoJ2MnKSxcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuUCgnJylcbiAgICAgICAgICAgICAgICApLmZtYXAocGFpckFkZGVyKVxuICAgICAgICAgICAgKS5mbWFwKHBhaXJBZGRlcilcbiAgICAgICAgKS5mbWFwKHBhaXJBZGRlcik7XG4gICAgICAgIGNvbnN0IHBhcnNpbmcgPSBhYmNQLnJ1bignYWJjZCcpO1xuICAgICAgICBleHBlY3QocGFyc2luZy5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLnZhbHVlWzBdLnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgnYWJjJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLnZhbHVlWzFdLnJlc3QoKSkudG8uYmUuZXFsKCdkJyk7XG4gICAgfSk7XG59KTtcblxuZGVzY3JpYmUoJ3BhcnNlIDMgZGlnaXRzJywgKCkgPT4ge1xuICAgIGxldCBwYXJzZURpZ2l0LCB0aHJlZURpZ2l0cywgcGFyc2luZztcblxuICAgIGJlZm9yZSgoKSA9PiB7XG4gICAgICAgIHBhcnNlRGlnaXQgPSBhbnlPZihkaWdpdHMpO1xuICAgICAgICB0aHJlZURpZ2l0cyA9IGFuZFRoZW4ocGFyc2VEaWdpdCwgYW5kVGhlbihwYXJzZURpZ2l0LCBwYXJzZURpZ2l0KSk7XG4gICAgICAgIHBhcnNpbmcgPSB0aHJlZURpZ2l0cy5ydW4oJzEyMycpO1xuICAgIH0pO1xuICAgIGl0KCdwYXJzZXMgYW55IG9mIHRocmVlIGRpZ2l0cycsICgpID0+IHtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcuaXNTdWNjZXNzKS50by5iZS50cnVlO1xuICAgICAgICBleHBlY3QocGFyc2luZy52YWx1ZVswXS50b1N0cmluZygpKS50by5iZS5lcWwoJ1sxLFsyLDNdXScpO1xuICAgICAgICBleHBlY3QocGFyc2luZy52YWx1ZVsxXS5yZXN0KCkpLnRvLmJlLmVxbCgnJyk7XG4gICAgfSk7XG4gICAgZGVzY3JpYmUoJ3BhcnNlcyBhbnkgb2YgdGhyZWUgZGlnaXRzIHdoaWxlIHNob3djYXNpbmcgZm1hcCcsICgpID0+IHtcbiAgICAgICAgY29uc3QgdW5wYWNrZXIgPSAoW3gsIFt5LCB6XV0pID0+IHtcbiAgICAgICAgICAgIHJldHVybiBbeCwgeSwgel07XG4gICAgICAgIH07XG4gICAgICAgIGl0KCdhcyBnbG9iYWwgbWV0aG9kJywgKCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgdGhyZWVEaWdpdHNJbXBsID0gZm1hcCh1bnBhY2tlciwgdGhyZWVEaWdpdHMpO1xuICAgICAgICAgICAgbGV0IHBhcnNpbmcgPSB0aHJlZURpZ2l0c0ltcGwucnVuKCcxMjMnKTtcbiAgICAgICAgICAgIGV4cGVjdChwYXJzaW5nLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcbiAgICAgICAgICAgIGV4cGVjdChwYXJzaW5nLnZhbHVlWzBdLnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgnWzEsMiwzXScpO1xuICAgICAgICAgICAgZXhwZWN0KHBhcnNpbmcudmFsdWVbMV0ucmVzdCgpKS50by5iZS5lcWwoJycpO1xuICAgICAgICB9KTtcbiAgICAgICAgaXQoJ2FzIGluc3RhbmNlIG1ldGhvZCcsICgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHRocmVlRGlnaXRzSW5zdCA9IHRocmVlRGlnaXRzLmZtYXAodW5wYWNrZXIpO1xuICAgICAgICAgICAgbGV0IHBhcnNpbmcgPSB0aHJlZURpZ2l0c0luc3QucnVuKCcxMjMnKTtcbiAgICAgICAgICAgIGV4cGVjdChwYXJzaW5nLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcbiAgICAgICAgICAgIGV4cGVjdChwYXJzaW5nLnZhbHVlWzBdLnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgnWzEsMiwzXScpO1xuICAgICAgICAgICAgZXhwZWN0KHBhcnNpbmcudmFsdWVbMV0ucmVzdCgpKS50by5iZS5lcWwoJycpO1xuICAgICAgICB9KTtcbiAgICB9KTtcbn0pO1xuXG5kZXNjcmliZSgnbGlmdDIgZm9yIHBhcnNlcnMnLCAoKSA9PiB7XG4gICAgaXQoJ29wZXJhdGVzIG9uIHRoZSByZXN1bHRzIG9mIHR3byBzdHJpbmcgcGFyc2luZ3MnLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IGFkZFN0cmluZ3MgPSB4ID0+IHkgPT4geCArICcrJyArIHk7XG4gICAgICAgIGNvbnN0IEFwbHVzQiA9IGxpZnQyKGFkZFN0cmluZ3MpKHBjaGFyKCdhJykpKHBjaGFyKCdiJykpO1xuICAgICAgICBleHBlY3QoQXBsdXNCLnJ1bignYWJjJykudG9TdHJpbmcoKSkudG8uYmUuZXFsKCdWYWxpZGF0aW9uLlN1Y2Nlc3MoW2ErYixyb3c9MDtjb2w9MjtyZXN0PWNdKScpO1xuICAgIH0pO1xuICAgIGl0KCdhZGRzIHRoZSByZXN1bHRzIG9mIHR3byBkaWdpdCBwYXJzaW5ncycsICgpID0+IHtcbiAgICAgICAgY29uc3QgYWRkRGlnaXRzID0geCA9PiB5ID0+IHggKyB5O1xuICAgICAgICBjb25zdCBhZGRQYXJzZXIgPSBsaWZ0MihhZGREaWdpdHMpKHBkaWdpdCgxKSkocGRpZ2l0KDIpKTtcbiAgICAgICAgZXhwZWN0KGFkZFBhcnNlci5ydW4oJzEyMzQnKS50b1N0cmluZygpKS50by5iZS5lcWwoJ1ZhbGlkYXRpb24uU3VjY2VzcyhbMyxyb3c9MDtjb2w9MjtyZXN0PTM0XSknKTtcbiAgICAgICAgZXhwZWN0KGFkZFBhcnNlci5ydW4oJzE0NCcpLmlzRmFpbHVyZSkudG8uYmUudHJ1ZTtcbiAgICB9KTtcbn0pO1xuXG5kZXNjcmliZSgnc2VxdWVuY2VzIG9mIHBhcnNlcnMgYmFzZWQgb24gYW5kVGhlbiAmJiBmbWFwIChha2Egc2VxdWVuY2VQMiknLCAoKSA9PiB7XG4gICAgaXQoJ3N0b3JlIG1hdGNoZWQgY2hhcnMgaW5zaWRlIGEgcGxhaW4gc3RyaW5nJywgKCkgPT4ge1xuICAgICAgICBjb25zdCBhYmNQYXJzZXIgPSBzZXF1ZW5jZVAyKFtwY2hhcignYScpLCBwY2hhcignYicpLCBwY2hhcignYycpLF0pO1xuICAgICAgICBleHBlY3QoYWJjUGFyc2VyLnJ1bignYWJjJykudG9TdHJpbmcoKSlcbiAgICAgICAgICAgIC50by5iZS5lcWwoJ1ZhbGlkYXRpb24uU3VjY2VzcyhbYWJjLHJvdz0xO2NvbD0wO3Jlc3Q9XSknKTtcbiAgICB9KTtcbn0pO1xuXG5kZXNjcmliZSgnc2VxdWVuY2VzIG9mIHBhcnNlcnMgYmFzZWQgb24gbGlmdDIoY29ucykgKGFrYSBzZXF1ZW5jZVApJywgKCkgPT4ge1xuICAgIGl0KCdzdG9yZXMgbWF0Y2hlZCBjaGFycyBpbnNpZGUgYW4gYXJyYXknLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IGFiY1BhcnNlciA9IHNlcXVlbmNlUChbcGNoYXIoJ2EnKSwgcGNoYXIoJ2InKSwgcGNoYXIoJ2MnKSxdKTtcbiAgICAgICAgZXhwZWN0KGFiY1BhcnNlci5ydW4oJ2FiYycpLnRvU3RyaW5nKCkpXG4gICAgICAgICAgICAudG8uYmUuZXFsKCdWYWxpZGF0aW9uLlN1Y2Nlc3MoW1thLGIsY10scm93PTE7Y29sPTA7cmVzdD1dKScpO1xuICAgIH0pO1xufSk7XG5cbmRlc2NyaWJlKCdhIHBhcnNlciBmb3IgYSBzcGVjaWZpYyBzZXF1ZW5jZSBvZiBjaGFycycsICgpID0+IHtcbiAgICBpdCgnaXMgZWFzeSB0byBjcmVhdGUgd2l0aCBzZXF1ZW5jZVAnLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IG1hcmNvUGFyc2VyID0gcHN0cmluZygnbWFyY28nKTtcbiAgICAgICAgY29uc3QgbWFyY29QYXJzaW5nID0gbWFyY29QYXJzZXIucnVuKCdtYXJjb2NpYW8nKTtcbiAgICAgICAgZXhwZWN0KG1hcmNvUGFyc2luZy5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChtYXJjb1BhcnNpbmcudG9TdHJpbmcoKSlcbiAgICAgICAgICAgIC50by5iZS5lcWwoJ1ZhbGlkYXRpb24uU3VjY2VzcyhbW20sYSxyLGMsb10scm93PTA7Y29sPTU7cmVzdD1jaWFvXSknKTtcbiAgICB9KTtcbn0pO1xuXG5kZXNjcmliZS5vbmx5KCdhIHBhcnNlciBmb3IgYSBzcGVjaWZpYyB3b3JkJywgKCkgPT4ge1xuICAgIGl0KCdkZXRlY3RzIGFuZCBpZ25vcmVzIHdoaXRlc3BhY2VzIGFyb3VuZCBpdCcsICgpID0+IHtcbiAgICAgICAgY29uc3QgbWFyY29QYXJzZXIgPSBwd29yZCgnbWFyY28nKTtcbiAgICAgICAgY29uc3QgbWFyY29QYXJzaW5nID0gbWFyY29QYXJzZXIucnVuKCcgIG1hcmNvIGNpYW8nKTtcbiAgICAgICAgZXhwZWN0KG1hcmNvUGFyc2luZy5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChtYXJjb1BhcnNpbmcudG9TdHJpbmcoKSlcbiAgICAgICAgICAgIC50by5iZS5lcWwoJ1ZhbGlkYXRpb24uU3VjY2VzcyhbW20sYSxyLGMsb10scm93PTA7Y29sPTg7cmVzdD1jaWFvXSknKTtcbiAgICB9KTtcbiAgICBpdCgnaGFzIG5vIHByb2JsZW0gaWYgdGhlIHdoaXRlc3BhY2VzIGFyZW5cXCd0IHRoZXJlJywgKCkgPT4ge1xuICAgICAgICBjb25zdCBtYXJjb1BhcnNlciA9IHB3b3JkKCdtYXJjbycpO1xuICAgICAgICBjb25zdCBtYXJjb1BhcnNpbmcgPSBtYXJjb1BhcnNlci5ydW4oJ21hcmNvY2lhbycpO1xuICAgICAgICBleHBlY3QobWFyY29QYXJzaW5nLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KG1hcmNvUGFyc2luZy50b1N0cmluZygpKVxuICAgICAgICAgICAgLnRvLmJlLmVxbCgnVmFsaWRhdGlvbi5TdWNjZXNzKFtbbSxhLHIsYyxvXSxyb3c9MDtjb2w9NTtyZXN0PWNpYW9dKScpO1xuICAgIH0pO1xufSk7XG5cbmRlc2NyaWJlKCdhIHBhcnNpbmcgZnVuY3Rpb24gZm9yIHplcm8gb3IgbW9yZSBvY2N1cnJlbmNlcycsICgpID0+IHtcbiAgICBpdCgnY2FuIHBhcnNlIGEgY2hhciB6ZXJvIHRpbWVzJywgKCkgPT4ge1xuICAgICAgICBjb25zdCB6ZXJvT3JNb3JlUGFyc2luZ0Z1bmN0aW9uID0gemVyb09yTW9yZShwY2hhcignbScpKTtcbiAgICAgICAgbGV0IHBhcnNpbmcgPSB6ZXJvT3JNb3JlUGFyc2luZ0Z1bmN0aW9uKHRleHQoJ2FyY28nKSk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcudG9TdHJpbmcoKSkudG8uYmUuZXFsKCdWYWxpZGF0aW9uLlN1Y2Nlc3MoW1tdLHJvdz0wO2NvbD0wO3Jlc3Q9YXJjb10pJyk7XG4gICAgfSk7XG4gICAgaXQoJ2NhbiBwYXJzZSBhIGNoYXIgbWFueSB0aW1lcycsICgpID0+IHtcbiAgICAgICAgY29uc3QgemVyb09yTW9yZVBhcnNpbmdGdW5jdGlvbiA9IHplcm9Pck1vcmUocGNoYXIoJ20nKSk7XG4gICAgICAgIGxldCBwYXJzaW5nID0gemVyb09yTW9yZVBhcnNpbmdGdW5jdGlvbih0ZXh0KCdtbW1hcmNvJykpO1xuICAgICAgICBleHBlY3QocGFyc2luZy5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgnVmFsaWRhdGlvbi5TdWNjZXNzKFtbbSxtLG1dLHJvdz0wO2NvbD0zO3Jlc3Q9YXJjb10pJyk7XG4gICAgfSk7XG4gICAgaXQoJ2NhbiBwYXJzZSBhIGNoYXIgc2VxdWVuY2UgemVybyB0aW1lcycsICgpID0+IHtcbiAgICAgICAgY29uc3QgemVyb09yTW9yZVBhcnNpbmdGdW5jdGlvbiA9IHplcm9Pck1vcmUocHN0cmluZygnbWFyY28nKSk7XG4gICAgICAgIGxldCBwYXJzaW5nID0gemVyb09yTW9yZVBhcnNpbmdGdW5jdGlvbih0ZXh0KCd4bWFyY29tYXJjb2NpYW8nKSk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcudG9TdHJpbmcoKSkudG8uYmUuZXFsKCdWYWxpZGF0aW9uLlN1Y2Nlc3MoW1tdLHJvdz0wO2NvbD0wO3Jlc3Q9eG1hcmNvbWFyY29jaWFvXSknKTtcbiAgICB9KTtcbiAgICBpdCgnY2FuIHBhcnNlIGEgY2hhciBzZXF1ZW5jZSBtYW55IHRpbWVzJywgKCkgPT4ge1xuICAgICAgICBjb25zdCB6ZXJvT3JNb3JlUGFyc2luZ0Z1bmN0aW9uID0gemVyb09yTW9yZShwc3RyaW5nKCdtYXJjbycpKTtcbiAgICAgICAgbGV0IHBhcnNpbmcgPSB6ZXJvT3JNb3JlUGFyc2luZ0Z1bmN0aW9uKHRleHQoJ21hcmNvbWFyY29jaWFvJykpO1xuICAgICAgICBleHBlY3QocGFyc2luZy5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLnRvU3RyaW5nKCkpXG4gICAgICAgICAgICAudG8uYmUuZXFsKCdWYWxpZGF0aW9uLlN1Y2Nlc3MoW1tbbSxhLHIsYyxvXSxbbSxhLHIsYyxvXV0scm93PTA7Y29sPTEwO3Jlc3Q9Y2lhb10pJyk7XG4gICAgfSk7XG59KTtcblxuZGVzY3JpYmUoJ2EgcGFyc2VyIGZvciB6ZXJvIG9yIG1vcmUgb2NjdXJyZW5jZXMnLCAoKSA9PiB7XG4gICAgaXQoJ2NhbiBwYXJzZSBhIGNoYXIgemVybyB0aW1lcycsICgpID0+IHtcbiAgICAgICAgY29uc3QgemVyb09yTW9yZVBhcnNlciA9IG1hbnkocGNoYXIoJ20nKSk7XG4gICAgICAgIGxldCBwYXJzaW5nID0gemVyb09yTW9yZVBhcnNlci5ydW4odGV4dCgnYXJjbycpKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcuaXNTdWNjZXNzKS50by5iZS50cnVlO1xuICAgICAgICBleHBlY3QocGFyc2luZy50b1N0cmluZygpKS50by5iZS5lcWwoJ1ZhbGlkYXRpb24uU3VjY2VzcyhbW10scm93PTA7Y29sPTA7cmVzdD1hcmNvXSknKTtcbiAgICB9KTtcbiAgICBpdCgnY2FuIHBhcnNlIGEgY2hhciBtYW55IHRpbWVzIGFuZCByZXR1cm4gYW4gYXJyYXknLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHplcm9Pck1vcmVQYXJzZXIgPSBtYW55KHBjaGFyKCdtJykpO1xuICAgICAgICBsZXQgcGFyc2luZyA9IHplcm9Pck1vcmVQYXJzZXIucnVuKHRleHQoJ21tbWFyY28nKSk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcudG9TdHJpbmcoKSkudG8uYmUuZXFsKCdWYWxpZGF0aW9uLlN1Y2Nlc3MoW1ttLG0sbV0scm93PTA7Y29sPTM7cmVzdD1hcmNvXSknKTtcbiAgICB9KTtcbiAgICBpdCgnY2FuIHBhcnNlIGEgY2hhciBtYW55IHRpbWVzIGFuZCByZXR1cm4gYSBzdHJpbmcnLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHplcm9Pck1vcmVQYXJzZXIgPSBtYW55Q2hhcnMocGNoYXIoJ20nKSk7XG4gICAgICAgIGxldCBwYXJzaW5nID0gemVyb09yTW9yZVBhcnNlci5ydW4odGV4dCgnbW1tYXJjbycpKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcuaXNTdWNjZXNzKS50by5iZS50cnVlO1xuICAgICAgICBleHBlY3QocGFyc2luZy50b1N0cmluZygpKS50by5iZS5lcWwoJ1ZhbGlkYXRpb24uU3VjY2VzcyhbbW1tLHJvdz0wO2NvbD0zO3Jlc3Q9YXJjb10pJyk7XG4gICAgfSk7XG4gICAgaXQoJ2NhbiBwYXJzZSBhIGNoYXIgc2VxdWVuY2UgemVybyB0aW1lcycsICgpID0+IHtcbiAgICAgICAgY29uc3QgemVyb09yTW9yZVBhcnNlciA9IG1hbnkocHN0cmluZygnbWFyY28nKSk7XG4gICAgICAgIGxldCBwYXJzaW5nID0gemVyb09yTW9yZVBhcnNlci5ydW4odGV4dCgneG1hcmNvbWFyY29jaWFvJykpO1xuICAgICAgICBleHBlY3QocGFyc2luZy5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgnVmFsaWRhdGlvbi5TdWNjZXNzKFtbXSxyb3c9MDtjb2w9MDtyZXN0PXhtYXJjb21hcmNvY2lhb10pJyk7XG4gICAgfSk7XG4gICAgaXQoJ2NhbiBwYXJzZSBhIGNoYXIgc2VxdWVuY2UgbWFueSB0aW1lcycsICgpID0+IHtcbiAgICAgICAgY29uc3QgemVyb09yTW9yZVBhcnNlciA9IG1hbnkocHN0cmluZygnbWFyY28nKSk7XG4gICAgICAgIGxldCBwYXJzaW5nID0gemVyb09yTW9yZVBhcnNlci5ydW4oJ21hcmNvbWFyY29jaWFvJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcudG9TdHJpbmcoKSlcbiAgICAgICAgICAgIC50by5iZS5lcWwoJ1ZhbGlkYXRpb24uU3VjY2VzcyhbW1ttLGEscixjLG9dLFttLGEscixjLG9dXSxyb3c9MDtjb2w9MTA7cmVzdD1jaWFvXSknKTtcbiAgICB9KTtcbiAgICBpdCgnY2FuIHBhcnNlIHdoaXRlc3BhY2VzISEnLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHdoaXRlc1BhcnNlciA9IG1hbnkoYW55T2Yod2hpdGVzKSk7XG4gICAgICAgIGNvbnN0IHR3b1dvcmRzID0gc2VxdWVuY2VQKFtwc3RyaW5nKCdjaWFvJyksIHdoaXRlc1BhcnNlciwgcHN0cmluZygnbWFtbWEnKV0pO1xuICAgICAgICBsZXQgcGFyc2luZyA9IHR3b1dvcmRzLnJ1bignY2lhb21hbW1hWCcpO1xuICAgICAgICBleHBlY3QocGFyc2luZy50b1N0cmluZygpKVxuICAgICAgICAgICAgLnRvLmJlLmVxbCgnVmFsaWRhdGlvbi5TdWNjZXNzKFtbW2MsaSxhLG9dLFtdLFttLGEsbSxtLGFdXSxyb3c9MDtjb2w9OTtyZXN0PVhdKScpO1xuICAgICAgICBwYXJzaW5nID0gdHdvV29yZHMucnVuKCdjaWFvIG1hbW1hWCcpO1xuICAgICAgICBleHBlY3QocGFyc2luZy50b1N0cmluZygpKVxuICAgICAgICAgICAgLnRvLmJlLmVxbCgnVmFsaWRhdGlvbi5TdWNjZXNzKFtbW2MsaSxhLG9dLFsgXSxbbSxhLG0sbSxhXV0scm93PTA7Y29sPTEwO3Jlc3Q9WF0pJyk7XG4gICAgICAgIHBhcnNpbmcgPSB0d29Xb3Jkcy5ydW4oJ2NpYW8gICBtYW1tYVgnKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcudG9TdHJpbmcoKSlcbiAgICAgICAgICAgIC50by5iZS5lcWwoJ1ZhbGlkYXRpb24uU3VjY2VzcyhbW1tjLGksYSxvXSxbICwgLCBdLFttLGEsbSxtLGFdXSxyb3c9MDtjb2w9MTI7cmVzdD1YXSknKTtcbiAgICAgICAgcGFyc2luZyA9IHR3b1dvcmRzLnJ1bignY2lhbyBcXHQgbWFtbWFYJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLnRvU3RyaW5nKCkpXG4gICAgICAgICAgICAudG8uYmUuZXFsKCdWYWxpZGF0aW9uLlN1Y2Nlc3MoW1tbYyxpLGEsb10sWyAsXFx0LCBdLFttLGEsbSxtLGFdXSxyb3c9MDtjb2w9MTI7cmVzdD1YXSknKTtcbiAgICB9KTtcbn0pO1xuXG5kZXNjcmliZSgnYSBwYXJzZXIgZm9yIG9uZSBvciBtb3JlIG9jY3VycmVuY2VzJywgKCkgPT4ge1xuICAgIGl0KCdjYW5ub3QgcGFyc2UgYSBjaGFyIHplcm8gdGltZXMnLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IG9uZU9yTW9yZVBhcnNlciA9IG1hbnkxKHBjaGFyKCdtJykpO1xuICAgICAgICBsZXQgcGFyc2luZyA9IG9uZU9yTW9yZVBhcnNlci5ydW4oJ2FyY28nKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcuaXNGYWlsdXJlKS50by5iZS50cnVlO1xuICAgICAgICBleHBlY3QocGFyc2luZy50b1N0cmluZygpKVxuICAgICAgICAgICAgLnRvLmJlLmVxbCgnVmFsaWRhdGlvbi5GYWlsdXJlKFttYW55MSBwY2hhcl9tLHdhbnRlZCBtOyBnb3QgYSxyb3c9MDtjb2w9MDtyZXN0PWFyY29dKScpO1xuICAgIH0pO1xuICAgIGl0KCdjYW4gcGFyc2UgYSBjaGFyIG1hbnkgdGltZXMgYW5kIHJldHVybiBhbiBhcnJheScsICgpID0+IHtcbiAgICAgICAgY29uc3Qgb25lT3JNb3JlUGFyc2VyID0gbWFueTEocGNoYXIoJ20nKSk7XG4gICAgICAgIGxldCBwYXJzaW5nID0gb25lT3JNb3JlUGFyc2VyLnJ1bignbW1tYXJjbycpO1xuICAgICAgICBleHBlY3QocGFyc2luZy5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgnVmFsaWRhdGlvbi5TdWNjZXNzKFtbbSxtLG1dLHJvdz0wO2NvbD0zO3Jlc3Q9YXJjb10pJyk7XG4gICAgfSk7XG4gICAgaXQoJ2NhbiBwYXJzZSBhIGNoYXIgbWFueSB0aW1lcyBhbmQgcmV0dXJuIGEgc3RyaW5nJywgKCkgPT4ge1xuICAgICAgICBjb25zdCBvbmVPck1vcmVQYXJzZXIgPSBtYW55Q2hhcnMxKHBjaGFyKCdtJykpO1xuICAgICAgICBsZXQgcGFyc2luZyA9IG9uZU9yTW9yZVBhcnNlci5ydW4oJ21tbWFyY28nKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcuaXNTdWNjZXNzKS50by5iZS50cnVlO1xuICAgICAgICBleHBlY3QocGFyc2luZy50b1N0cmluZygpKS50by5iZS5lcWwoJ1ZhbGlkYXRpb24uU3VjY2VzcyhbbW1tLHJvdz0wO2NvbD0zO3Jlc3Q9YXJjb10pJyk7XG4gICAgfSk7XG4gICAgaXQoJ2Nhbm5vdCBwYXJzZSBhIGNoYXIgc2VxdWVuY2UgemVybyB0aW1lcycsICgpID0+IHtcbiAgICAgICAgY29uc3Qgb25lT3JNb3JlUGFyc2VyID0gbWFueTEocHN0cmluZygnbWFyY28nKSk7XG4gICAgICAgIGxldCBwYXJzaW5nID0gb25lT3JNb3JlUGFyc2VyLnJ1bigneG1hcmNvbWFyY29jaWFvJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLmlzRmFpbHVyZSkudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcudG9TdHJpbmcoKSlcbiAgICAgICAgICAgIC50by5iZS5lcWwoJ1ZhbGlkYXRpb24uRmFpbHVyZShbbWFueTEgcHN0cmluZyBtYXJjbyx3YW50ZWQgbTsgZ290IHgscm93PTA7Y29sPTA7cmVzdD14bWFyY29tYXJjb2NpYW9dKScpO1xuICAgIH0pO1xuICAgIGl0KCdjYW4gcGFyc2UgYSBjaGFyIHNlcXVlbmNlIG1hbnkgdGltZXMnLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IG9uZU9yTW9yZVBhcnNlciA9IG1hbnkxKHBzdHJpbmcoJ21hcmNvJykpO1xuICAgICAgICBsZXQgcGFyc2luZyA9IG9uZU9yTW9yZVBhcnNlci5ydW4oJ21hcmNvbWFyY29jaWFvJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcudG9TdHJpbmcoKSlcbiAgICAgICAgICAgIC50by5iZS5lcWwoJ1ZhbGlkYXRpb24uU3VjY2VzcyhbW1ttLGEscixjLG9dLFttLGEscixjLG9dXSxyb3c9MDtjb2w9MTA7cmVzdD1jaWFvXSknKTtcbiAgICB9KTtcbiAgICBpdCgnY2FuIHBhcnNlIGFuIGludGVnZXIsIG5vIG1hdHRlciBob3cgbGFyZ2UuLi4nLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHBpbnQgPSBtYW55MShhbnlPZihkaWdpdHMpKTtcbiAgICAgICAgbGV0IHBhcnNpbmcgPSBwaW50LnJ1bignMTIzNDVBJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcudG9TdHJpbmcoKSkudG8uYmUuZXFsKCdWYWxpZGF0aW9uLlN1Y2Nlc3MoW1sxLDIsMyw0LDVdLHJvdz0wO2NvbD01O3Jlc3Q9QV0pJyk7XG4gICAgICAgIHBhcnNpbmcgPSBwaW50LnJ1bignMUInKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcuaXNTdWNjZXNzKS50by5iZS50cnVlO1xuICAgICAgICBleHBlY3QocGFyc2luZy50b1N0cmluZygpKS50by5iZS5lcWwoJ1ZhbGlkYXRpb24uU3VjY2VzcyhbWzFdLHJvdz0wO2NvbD0xO3Jlc3Q9Ql0pJyk7XG4gICAgICAgIHBhcnNpbmcgPSBwaW50LnJ1bignQTEyMzQ1Jyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLmlzRmFpbHVyZSkudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcudG9TdHJpbmcoKSlcbiAgICAgICAgICAgIC50by5iZS5lcWwoJ1ZhbGlkYXRpb24uRmFpbHVyZShbbWFueTEgYW55T2YgMDEyMzQ1Njc4OSxfZmFpbCxBMTIzNDVdKScpO1xuICAgIH0pO1xuICAgIGl0KCdjYW4gcGFyc2UgYW4gaW50ZWdlciBpbnRvIGEgdHJ1ZSBpbnRlZ2VyJywgKCkgPT4ge1xuICAgICAgICBjb25zdCBwaW50ID0gbWFueTEoYW55T2YoZGlnaXRzKSlcbiAgICAgICAgICAgIC5mbWFwKGwgPT4gcGFyc2VJbnQobC5yZWR1Y2UoKGFjYywgY3VycikgPT4gYWNjICsgY3VyciwgJycpLCAxMCkpO1xuICAgICAgICBsZXQgcGFyc2luZyA9IHBpbnQucnVuKCcxMjM0NUEnKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcuaXNTdWNjZXNzKS50by5iZS50cnVlO1xuICAgICAgICBleHBlY3QocGFyc2luZy52YWx1ZVswXSkudG8uYmUuZXFsKDEyMzQ1KTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcudmFsdWVbMV0udG9TdHJpbmcoKSkudG8uYmUuZXFsKCdyb3c9MDtjb2w9NTtyZXN0PUEnKTtcbiAgICB9KTtcbn0pO1xuXG5kZXNjcmliZSgnYSBwYXJzZXIgZm9yIG9wdGlvbmFsIGNoYXJhY3RlcnMnLCAoKSA9PiB7XG4gICAgaXQoJ2NhbiBjYXB0dXJlIG9yIG5vdCBjYXB0dXJlIGEgZG90JywgKCkgPT4ge1xuICAgICAgICBjb25zdCBvcHREb3RUaGVuQSA9IG9wdChwY2hhcignLicpKS5hbmRUaGVuKHBjaGFyKCdhJykpO1xuICAgICAgICBleHBlY3Qob3B0RG90VGhlbkEucnVuKCcuYWJjJykudG9TdHJpbmcoKSlcbiAgICAgICAgICAgIC50by5iZS5lcWwoJ1ZhbGlkYXRpb24uU3VjY2VzcyhbW01heWJlLkp1c3QoLiksYV0scm93PTA7Y29sPTI7cmVzdD1iY10pJyk7XG4gICAgICAgIGV4cGVjdChvcHREb3RUaGVuQS5ydW4oJ2FiYycpLnRvU3RyaW5nKCkpXG4gICAgICAgICAgICAudG8uYmUuZXFsKCdWYWxpZGF0aW9uLlN1Y2Nlc3MoW1tNYXliZS5Ob3RoaW5nLGFdLHJvdz0wO2NvbD0xO3Jlc3Q9YmNdKScpO1xuICAgIH0pO1xuICAgIGl0KCdjYW4gY2FwdHVyZSBhIGRvdCBvciBwcm92aWRlIGEgZGVmYXVsdCBhbHRlcm5hdGl2ZScsICgpID0+IHtcbiAgICAgICAgY29uc3Qgb3B0RG90V2l0aERlZmF1bHRUaGVuQSA9IG9wdChwY2hhcignLicpLCAnQUxURVJOQVRJVkUnKS5hbmRUaGVuKHBjaGFyKCdhJykpO1xuICAgICAgICBleHBlY3Qob3B0RG90V2l0aERlZmF1bHRUaGVuQS5ydW4oJ2FiYycpLnRvU3RyaW5nKCkpXG4gICAgICAgICAgICAudG8uYmUuZXFsKCdWYWxpZGF0aW9uLlN1Y2Nlc3MoW1tNYXliZS5KdXN0KEFMVEVSTkFUSVZFKSxhXSxyb3c9MDtjb2w9MTtyZXN0PWJjXSknKTtcbiAgICB9KTtcbiAgICBpdCgnY2FuIHBhcnNlIFNJR05FRCBpbnRlZ2VycyEhIScsICgpID0+IHtcbiAgICAgICAgY29uc3QgcGludCA9IG1hbnkxKGFueU9mKGRpZ2l0cykpXG4gICAgICAgICAgICAuZm1hcChsID0+IHBhcnNlSW50KGwucmVkdWNlKChhY2MsIGN1cnIpID0+IGFjYyArIGN1cnIsICcnKSwgMTApKTtcbiAgICAgICAgY29uc3QgcFNpZ25lZEludCA9IG9wdChwY2hhcignLScpKVxuICAgICAgICAgICAgLmFuZFRoZW4ocGludClcbiAgICAgICAgICAgIC5mbWFwKG9wdFNpZ25OdW1iZXJQYWlyID0+IChvcHRTaWduTnVtYmVyUGFpclswXS5pc0p1c3QpID8gLW9wdFNpZ25OdW1iZXJQYWlyWzFdIDogb3B0U2lnbk51bWJlclBhaXJbMV0pO1xuICAgICAgICBleHBlY3QocFNpZ25lZEludC5ydW4oJzEzMjQzNTQ2eCcpLnZhbHVlWzBdKS50by5iZS5lcWwoMTMyNDM1NDYpO1xuICAgICAgICBleHBlY3QocFNpZ25lZEludC5ydW4oJy0xMzI0MzU0NngnKS52YWx1ZVswXSkudG8uYmUuZXFsKC0xMzI0MzU0Nik7XG4gICAgfSk7XG4gICAgaXQoJ2NhbiBjYXB0dXJlIG9yIG5vdCBjYXB0dXJlIGEgd2hvbGUgc3Vic3RyaW5nJywgKCkgPT4ge1xuICAgICAgICBjb25zdCBvcHRTdWJzdHJpbmcgPSBvcHQocHN0cmluZygnbWFyY28nKSkuYW5kVGhlbihwc3RyaW5nKCdmYXVzdGluZWxsaScpKTtcbiAgICAgICAgZXhwZWN0KG9wdFN1YnN0cmluZy5ydW4oJ21hcmNvZmF1c3RpbmVsbGl4JykudG9TdHJpbmcoKSlcbiAgICAgICAgICAgIC50by5iZS5lcWwoJ1ZhbGlkYXRpb24uU3VjY2VzcyhbW01heWJlLkp1c3QoW20sYSxyLGMsb10pLFtmLGEsdSxzLHQsaSxuLGUsbCxsLGldXSxyb3c9MDtjb2w9MTY7cmVzdD14XSknKTtcbiAgICAgICAgZXhwZWN0KG9wdFN1YnN0cmluZy5ydW4oJ2ZhdXN0aW5lbGxpeCcpLnRvU3RyaW5nKCkpXG4gICAgICAgICAgICAudG8uYmUuZXFsKCdWYWxpZGF0aW9uLlN1Y2Nlc3MoW1tNYXliZS5Ob3RoaW5nLFtmLGEsdSxzLHQsaSxuLGUsbCxsLGldXSxyb3c9MDtjb2w9MTE7cmVzdD14XSknKTtcbiAgICB9KTtcbn0pO1xuXG5kZXNjcmliZSgnYSBjb3VwbGUgb2YgcGFyc2VycycsICgpID0+IHtcbiAgICBpdCgnY2FuIGRlY2lkZSB0byBkaXNjYXJkIHRoZSBtYXRjaGVzIG9mIHRoZSBmaXJzdCBvbmUnLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IGRpc2NhcmRJbnRlZ2VyU2lnbiA9IHBjaGFyKCctJykuZGlzY2FyZEZpcnN0KHBkaWdpdCg4KSk7XG4gICAgICAgIGxldCBwYXJzaW5nID0gZGlzY2FyZEludGVnZXJTaWduLnJ1bignLTh4Jyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgnVmFsaWRhdGlvbi5TdWNjZXNzKFs4LHJvdz0wO2NvbD0yO3Jlc3Q9eF0pJyk7XG4gICAgfSk7XG4gICAgaXQoJ2NhbiBkZWNpZGUgdG8gZGlzY2FyZCB0aGUgbWF0Y2hlcyBvZiB0aGUgc2Vjb25kIG9uZScsICgpID0+IHtcbiAgICAgICAgY29uc3QgZGlzY2FyZFN1ZmZpeCA9IHBzdHJpbmcoJ21hcmNvJykuZGlzY2FyZFNlY29uZChtYW55MShhbnlPZih3aGl0ZXMpKSk7XG4gICAgICAgIGxldCBwYXJzaW5nID0gZGlzY2FyZFN1ZmZpeC5ydW4oJ21hcmNvIGZhdXN0aW5lbGxpJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgnVmFsaWRhdGlvbi5TdWNjZXNzKFtbbSxhLHIsYyxvXSxyb3c9MDtjb2w9NjtyZXN0PWZhdXN0aW5lbGxpXSknKTtcbiAgICAgICAgcGFyc2luZyA9IGRpc2NhcmRTdWZmaXgucnVuKCdtYXJjbyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmF1c3RpbmVsbGknKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcudG9TdHJpbmcoKSkudG8uYmUuZXFsKCdWYWxpZGF0aW9uLlN1Y2Nlc3MoW1ttLGEscixjLG9dLHJvdz0wO2NvbD0zNztyZXN0PWZhdXN0aW5lbGxpXSknKTtcbiAgICB9KTtcbn0pO1xuXG5kZXNjcmliZSgnYSB0YXBwZXIgZm9yIHBhcnNlcnMnLCAoKSA9PiB7XG4gICAgaXQoJ2NhbiBkbyB0aGluZ3Mgd2l0aCBhIHJlc3VsdCB0aGF0XFwncyBnb2luZyB0byBiZSBkaXNjYXJkZWQnLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHRhcEludG9EaXNjYXJkSW50ZWdlclNpZ24gPSB0YXBQKHBjaGFyKCctJyksIHJlcyA9PiB7XG4gICAgICAgICAgICBleHBlY3QocmVzKS50by5iZS5lcWwoJy0nKTtcbiAgICAgICAgfSkuZGlzY2FyZEZpcnN0KHBkaWdpdCg4KSk7XG4gICAgICAgIGxldCBwYXJzaW5nID0gdGFwSW50b0Rpc2NhcmRJbnRlZ2VyU2lnbi5ydW4oJy04eCcpO1xuICAgIH0pO1xufSk7XG5cbmRlc2NyaWJlKCdhIGxvZ2dlciBmb3IgcGFyc2VycycsICgpID0+IHtcbiAgICBsZXQgc3RvcmVkTG9nID0gY29uc29sZS5sb2c7XG4gICAgaXQoJ2NhbiBsb2cgaW50ZXJtZWRpYXRlIHBhcnNpbmcgcmVzdWx0cycsICgpID0+IHtcbiAgICAgICAgY29uc29sZS5sb2cgPSBtc2cgPT4ge1xuICAgICAgICAgICAgZXhwZWN0KG1zZykudG8uYmUuZXFsKCctJyk7XG4gICAgICAgIH07XG4gICAgICAgIGNvbnN0IGxvZ0ludGVybWVkaWF0ZVJlc3VsdCA9IGxvZ1AocGNoYXIoJy0nKSlcbiAgICAgICAgICAgIC5kaXNjYXJkRmlyc3QocGRpZ2l0KDgpKTtcbiAgICAgICAgbGV0IHBhcnNpbmcgPSBsb2dJbnRlcm1lZGlhdGVSZXN1bHQucnVuKCctOHgnKTtcbiAgICB9KTtcbiAgICBpdCgnY2FuIGxvZyBhIHJlc3VsdCB0aGF0XFwncyBnb2luZyB0byBiZSBkaXNjYXJkZWQnLCAoKSA9PiB7XG4gICAgICAgIGNvbnNvbGUubG9nID0gbXNnID0+IHtcbiAgICAgICAgICAgIGV4cGVjdChtc2cpLnRvLmJlLmVxbChbJyAnLCAnICddKTtcbiAgICAgICAgfTtcbiAgICAgICAgY29uc3QgZGlzY2FyZFN1ZmZpeCA9IHBzdHJpbmcoJ21hcmNvJykuZGlzY2FyZFNlY29uZChsb2dQKG1hbnkxKGFueU9mKHdoaXRlcykpKSk7XG4gICAgICAgIGxldCBwYXJzaW5nID0gZGlzY2FyZFN1ZmZpeC5ydW4oJ21hcmNvICBmYXVzdGluZWxsaScpO1xuICAgIH0pO1xuICAgIGNvbnNvbGUubG9nID0gc3RvcmVkTG9nO1xufSk7XG5cbmRlc2NyaWJlKCdwYXJzaW5nIHdoaWxlIGRpc2NhcmRpbmcgaW5wdXQnLCAoKSA9PiB7XG4gICAgaXQoJ2FsbG93cyB0byBleGNsdWRlIHBhcmVudGhlc2VzJywgKCkgPT4ge1xuICAgICAgICBjb25zdCBpbnNpZGVQYXJlbnMgPSBwY2hhcignKCcpXG4gICAgICAgICAgICAuZGlzY2FyZEZpcnN0KG1hbnkoYW55T2YobG93ZXJjYXNlcykpKVxuICAgICAgICAgICAgLmRpc2NhcmRTZWNvbmQocGNoYXIoJyknKSk7XG4gICAgICAgIGV4cGVjdChpbnNpZGVQYXJlbnMucnVuKCcobWFyY28pJykudG9TdHJpbmcoKSlcbiAgICAgICAgICAgIC50by5iZS5lcWwoJ1ZhbGlkYXRpb24uU3VjY2VzcyhbW20sYSxyLGMsb10scm93PTE7Y29sPTA7cmVzdD1dKScpO1xuICAgICAgICBleHBlY3QoaW5zaWRlUGFyZW5zLnJ1bignKCknKS50b1N0cmluZygpKVxuICAgICAgICAgICAgLnRvLmJlLmVxbCgnVmFsaWRhdGlvbi5TdWNjZXNzKFtbXSxyb3c9MTtjb2w9MDtyZXN0PV0pJyk7XG4gICAgfSk7XG4gICAgaXQoJy4uLmV2ZW4gdXNpbmcgYSB0YWlsb3ItbWFkZSBtZXRob2QnLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IGluc2lkZVBhcmVucyA9IGJldHdlZW5QYXJlbnMocHN0cmluZygnbWFyY28nKSk7XG4gICAgICAgIGV4cGVjdChpbnNpZGVQYXJlbnMucnVuKCcobWFyY28pJykudG9TdHJpbmcoKSlcbiAgICAgICAgICAgIC50by5iZS5lcWwoJ1ZhbGlkYXRpb24uU3VjY2VzcyhbW20sYSxyLGMsb10scm93PTE7Y29sPTA7cmVzdD1dKScpO1xuICAgIH0pO1xuICAgIGl0KCdjaGVycnktcGlja2luZyBlbGVtZW50cyBzZXBhcmF0ZWQgYnkgc2VwYXJhdG9ycycsICgpID0+IHtcbiAgICAgICAgY29uc3Qgc3Vic3RyaW5nc1dpdGhDb21tYXMgPSBtYW55KG1hbnkxKGFueU9mKGxvd2VyY2FzZXMpKS5kaXNjYXJkU2Vjb25kKHBjaGFyKCcsJykpKTtcbiAgICAgICAgZXhwZWN0KHN1YnN0cmluZ3NXaXRoQ29tbWFzLnJ1bignYSxiLGNkLDEnKS50b1N0cmluZygpKVxuICAgICAgICAgICAgLnRvLmJlLmVxbCgnVmFsaWRhdGlvbi5TdWNjZXNzKFtbW2FdLFtiXSxbYyxkXV0scm93PTA7Y29sPTc7cmVzdD0xXSknKTtcbiAgICB9KTtcbiAgICBpdCgnLi4uYWxzbyB3aGVuIGluc2lkZSBhIGxpc3RzJywgKCkgPT4ge1xuICAgICAgICBjb25zdCBzdWJzdHJpbmdzV2l0aENvbW1hcyA9IG1hbnkobWFueTEoYW55T2YobG93ZXJjYXNlcykpLmRpc2NhcmRTZWNvbmQocGNoYXIoJywnKSkpO1xuICAgICAgICBjb25zdCBsaXN0RWxlbWVudHMgPSBiZXR3ZWVuKHBjaGFyKCdbJyksIHN1YnN0cmluZ3NXaXRoQ29tbWFzLCBwY2hhcignXScpKTtcbiAgICAgICAgZXhwZWN0KGxpc3RFbGVtZW50cy5ydW4oJ1thLGIsY2QsbWFyY28sXTEnKS50b1N0cmluZygpKVxuICAgICAgICAgICAgLnRvLmJlLmVxbCgnVmFsaWRhdGlvbi5TdWNjZXNzKFtbW2FdLFtiXSxbYyxkXSxbbSxhLHIsYyxvXV0scm93PTA7Y29sPTE1O3Jlc3Q9MV0pJyk7XG4gICAgfSk7XG4gICAgZGVzY3JpYmUoJ3RoYW5rcyB0byB0aGUgc3BlY2lmaWMgc2VwQnkxIG9wZXJhdG9yJywgKCkgPT4ge1xuICAgICAgICBjb25zdCB2YWx1ZXNQID0gYW55T2YobG93ZXJjYXNlcyk7XG4gICAgICAgIGNvbnN0IGNvbW1hUCA9IHBjaGFyKCcsJyk7XG4gICAgICAgIGl0KCdjaGVycnktcGlja2luZyBlbGVtZW50cyBzZXBhcmF0ZWQgYnkgc2VwYXJhdG9ycycsICgpID0+IHtcbiAgICAgICAgICAgIGV4cGVjdChzZXBCeTEodmFsdWVzUCwgY29tbWFQKS5ydW4oJ2EsYixjZCwxJykudG9TdHJpbmcoKSlcbiAgICAgICAgICAgICAgICAudG8uYmUuZXFsKCdWYWxpZGF0aW9uLlN1Y2Nlc3MoW1tbYV0sW2JdLFtjLGRdXSxyb3c9MDtjb2w9NztyZXN0PTFdKScpO1xuICAgICAgICB9KTtcbiAgICAgICAgaXQoJy4uLmFsc28gd2hlbiBpbnNpZGUgYSBsaXN0cycsICgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGxpc3RFbGVtZW50cyA9IGJldHdlZW4ocGNoYXIoJ1snKSwgc2VwQnkxKHZhbHVlc1AsIGNvbW1hUCksIHBjaGFyKCddJykpO1xuICAgICAgICAgICAgZXhwZWN0KGxpc3RFbGVtZW50cy5ydW4oJ1thLGIsY2QsbWFyY28sXScpLnRvU3RyaW5nKCkpXG4gICAgICAgICAgICAgICAgLnRvLmJlLmVxbCgnVmFsaWRhdGlvbi5TdWNjZXNzKFtbW2FdLFtiXSxbYyxkXSxbbSxhLHIsYyxvXV0scm93PTE7Y29sPTA7cmVzdD1dKScpO1xuICAgICAgICB9KTtcbiAgICAgICAgaXQoJy4uLmxpc3RzIHdpdGggbm8gZWxlbWVudHMnLCAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBsaXN0RWxlbWVudHMgPSBiZXR3ZWVuKHBjaGFyKCdbJyksIHNlcEJ5MSh2YWx1ZXNQLCBjb21tYVApLCBwY2hhcignXScpKTtcbiAgICAgICAgICAgIGV4cGVjdChsaXN0RWxlbWVudHMucnVuKCdbXScpLnRvU3RyaW5nKCkpXG4gICAgICAgICAgICAgICAgLnRvLmJlLmVxbCgnVmFsaWRhdGlvbi5TdWNjZXNzKFtbXSxyb3c9MTtjb2w9MDtyZXN0PV0pJyk7XG4gICAgICAgIH0pO1xuICAgICAgICBpdCgnLi4ubGlzdHMgd2l0aCBqdXN0IG9uZSBlbGVtZW50JywgKCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgbGlzdEVsZW1lbnRzID0gYmV0d2VlbihwY2hhcignWycpLCBzZXBCeTEodmFsdWVzUCwgY29tbWFQKSwgcGNoYXIoJ10nKSk7XG4gICAgICAgICAgICBleHBlY3QobGlzdEVsZW1lbnRzLnJ1bignW2FdJykudG9TdHJpbmcoKSlcbiAgICAgICAgICAgICAgICAudG8uYmUuZXFsKCdWYWxpZGF0aW9uLlN1Y2Nlc3MoW1tbYV1dLHJvdz0xO2NvbD0wO3Jlc3Q9XSknKTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG59KTtcbiJdfQ==