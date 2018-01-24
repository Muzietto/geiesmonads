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

    describe('a trimmer of parsers', function () {
        it('can ignore whitespaces around a single char', function () {
            var trimmer = (0, _parsers.trimP)((0, _parsers.pchar)('a'));
            (0, _chai.expect)(trimmer.run('  a    ').toString()).to.be.eql('Validation.Success([a,row=1;col=0;rest=])');
        });
        it('can ignore whitespaces around a sequence of two chars', function () {
            var trimmer = (0, _parsers.trimP)((0, _parsers.pchar)('a').andThen((0, _parsers.pchar)('b')));
            (0, _chai.expect)(trimmer.run('  ab    ').toString()).to.be.eql('Validation.Success([[a,b],row=1;col=0;rest=])');
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
        it('can parse a char exactly n times and return a string (or fail)', function () {
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
                (0, _chai.expect)(msg).to.be.eql('pchar_-:-');
            };
            var logIntermediateResult = (0, _parsers.logP)((0, _parsers.pchar)('-')).discardFirst((0, _parsers.pdigit)(8));
            var parsing = logIntermediateResult.run('-8x');
        });
        it('can log a result that\'s going to be discarded', function () {
            console.log = function (msg) {
                (0, _chai.expect)(msg).to.be.eql('many1 anyOf  \t\n\r:[ , ]');
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2pzLXNwZWMvcGFyc2Vyc190ZXN0cy5qcyJdLCJuYW1lcyI6WyJsb3dlcmNhc2VzIiwidXBwZXJjYXNlcyIsImRpZ2l0cyIsIndoaXRlcyIsInRleHQiLCJmcm9tVGV4dCIsImRlc2NyaWJlIiwicGFyc2VyQSIsInBhcnNlcjEiLCJpdCIsInBhcnNpbmdBIiwidmFsdWUiLCJ0byIsImJlIiwiZXFsIiwicmVzdCIsImlzU3VjY2VzcyIsInRydWUiLCJwYXJzaW5nQiIsImlzRmFpbHVyZSIsInBhcnNpbmcxIiwicGFyc2luZzIiLCJwYXJzaW5nMyIsInJ1biIsInBhcnNlckFhbmRCIiwicGFyc2luZ0FhbmRCIiwidG9TdHJpbmciLCJwYXJzZXJBb3JCIiwicGFyc2luZ0FvckIiLCJwYXJzZXJzQ2hvaWNlIiwicGFyc2luZ0Nob2ljZSIsImxvd2VyY2FzZXNQYXJzZXIiLCJ1cHBlcmNhc2VzUGFyc2VyIiwiZGlnaXRzUGFyc2VyIiwicGFpckFkZGVyIiwieCIsInkiLCJhYmNQIiwiZm1hcCIsInBhcnNpbmciLCJwYXJzZURpZ2l0IiwidGhyZWVEaWdpdHMiLCJiZWZvcmUiLCJ1bnBhY2tlciIsInoiLCJ0aHJlZURpZ2l0c0ltcGwiLCJ0aHJlZURpZ2l0c0luc3QiLCJhZGRTdHJpbmdzIiwiQXBsdXNCIiwiYWRkRGlnaXRzIiwiYWRkUGFyc2VyIiwiYWJjUGFyc2VyIiwibWFyY29QYXJzZXIiLCJtYXJjb1BhcnNpbmciLCJ0cmltbWVyIiwiYW5kVGhlbiIsInplcm9Pck1vcmVQYXJzaW5nRnVuY3Rpb24iLCJ6ZXJvT3JNb3JlUGFyc2VyIiwiZXhhY3RseVRocmVlIiwid2hpdGVzUGFyc2VyIiwidHdvV29yZHMiLCJvbmVPck1vcmVQYXJzZXIiLCJwaW50IiwicGFyc2VJbnQiLCJsIiwicmVkdWNlIiwiYWNjIiwiY3VyciIsIm9wdERvdFRoZW5BIiwib3B0RG90V2l0aERlZmF1bHRUaGVuQSIsInBTaWduZWRJbnQiLCJvcHRTaWduTnVtYmVyUGFpciIsImlzSnVzdCIsIm9wdFN1YnN0cmluZyIsImRpc2NhcmRJbnRlZ2VyU2lnbiIsImRpc2NhcmRGaXJzdCIsImRpc2NhcmRTdWZmaXgiLCJkaXNjYXJkU2Vjb25kIiwidGFwSW50b0Rpc2NhcmRJbnRlZ2VyU2lnbiIsInJlcyIsInN0b3JlZExvZyIsImNvbnNvbGUiLCJsb2ciLCJtc2ciLCJsb2dJbnRlcm1lZGlhdGVSZXN1bHQiLCJpbnNpZGVQYXJlbnMiLCJzdWJzdHJpbmdzV2l0aENvbW1hcyIsImxpc3RFbGVtZW50cyIsInZhbHVlc1AiLCJjb21tYVAiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBOENBLFFBQU1BLGFBQWEsQ0FBQyxHQUFELEVBQU0sR0FBTixFQUFXLEdBQVgsRUFBZ0IsR0FBaEIsRUFBcUIsR0FBckIsRUFBMEIsR0FBMUIsRUFBK0IsR0FBL0IsRUFBb0MsR0FBcEMsRUFBeUMsR0FBekMsRUFBOEMsR0FBOUMsRUFBbUQsR0FBbkQsRUFBd0QsR0FBeEQsRUFBNkQsR0FBN0QsRUFBa0UsR0FBbEUsRUFBdUUsR0FBdkUsRUFBNEUsR0FBNUUsRUFBaUYsR0FBakYsRUFBc0YsR0FBdEYsRUFBMkYsR0FBM0YsRUFBZ0csR0FBaEcsRUFBcUcsR0FBckcsRUFBMEcsR0FBMUcsRUFBK0csR0FBL0csRUFBb0gsR0FBcEgsRUFBeUgsR0FBekgsRUFBOEgsR0FBOUgsQ0FBbkI7QUFDQSxRQUFNQyxhQUFhLENBQUMsR0FBRCxFQUFNLEdBQU4sRUFBVyxHQUFYLEVBQWdCLEdBQWhCLEVBQXFCLEdBQXJCLEVBQTBCLEdBQTFCLEVBQStCLEdBQS9CLEVBQW9DLEdBQXBDLEVBQXlDLEdBQXpDLEVBQThDLEdBQTlDLEVBQW1ELEdBQW5ELEVBQXdELEdBQXhELEVBQTZELEdBQTdELEVBQWtFLEdBQWxFLEVBQXVFLEdBQXZFLEVBQTRFLEdBQTVFLEVBQWlGLEdBQWpGLEVBQXNGLEdBQXRGLEVBQTJGLEdBQTNGLEVBQWdHLEdBQWhHLEVBQXFHLEdBQXJHLEVB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cGFyc2Vyc190ZXN0cy5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7ZXhwZWN0fSBmcm9tICdjaGFpJztcbmltcG9ydCB7XG4gICAgY2hhclBhcnNlcixcbiAgICBkaWdpdFBhcnNlcixcbiAgICBwY2hhcixcbiAgICBwZGlnaXQsXG4gICAgYW5kVGhlbixcbiAgICBvckVsc2UsXG4gICAgY2hvaWNlLFxuICAgIGFueU9mLFxuICAgIGZtYXAsXG4gICAgcmV0dXJuUCxcbiAgICBhcHBseVAsXG4gICAgbGlmdDIsXG4gICAgc2VxdWVuY2VQLFxuICAgIHNlcXVlbmNlUDIsXG4gICAgcHN0cmluZyxcbiAgICB6ZXJvT3JNb3JlLFxuICAgIG1hbnksXG4gICAgbWFueTEsXG4gICAgbWFueUNoYXJzLFxuICAgIG1hbnlDaGFyczEsXG4gICAgb3B0LFxuICAgIG9wdEJvb2ssXG4gICAgZGlzY2FyZEZpcnN0LFxuICAgIGRpc2NhcmRTZWNvbmQsXG4gICAgc2VwQnkxLFxuICAgIGJldHdlZW4sXG4gICAgYmV0d2VlblBhcmVucyxcbiAgICB0YXBQLFxuICAgIGxvZ1AsXG4gICAgcHdvcmQsXG4gICAgdHJpbVAsXG59IGZyb20gJ3BhcnNlcnMnO1xuaW1wb3J0IHtcbiAgICBpc1BhaXIsXG4gICAgaXNTdWNjZXNzLFxuICAgIGlzRmFpbHVyZSxcbiAgICBpc1BhcnNlcixcbiAgICBpc1NvbWUsXG4gICAgaXNOb25lLFxufSBmcm9tICd1dGlsJztcbmltcG9ydCB7TWF5YmV9IGZyb20gJ21heWJlJztcbmltcG9ydCB7VmFsaWRhdGlvbn0gZnJvbSAndmFsaWRhdGlvbic7XG5pbXBvcnQge1Bvc2l0aW9ufSBmcm9tICdjbGFzc2VzJztcblxuY29uc3QgbG93ZXJjYXNlcyA9IFsnYScsICdiJywgJ2MnLCAnZCcsICdlJywgJ2YnLCAnZycsICdoJywgJ2knLCAnaicsICdrJywgJ2wnLCAnbScsICduJywgJ28nLCAncCcsICdxJywgJ3InLCAncycsICd0JywgJ3UnLCAndicsICd3JywgJ3gnLCAneScsICd6JyxdO1xuY29uc3QgdXBwZXJjYXNlcyA9IFsnQScsICdCJywgJ0MnLCAnRCcsICdFJywgJ0YnLCAnRycsICdIJywgJ0knLCAnSicsICdLJywgJ0wnLCAnTScsICdOJywgJ08nLCAnUCcsICdRJywgJ1InLCAnUycsICdUJywgJ1UnLCAnVicsICdXJywgJ1gnLCAnWScsICdaJyxdO1xuY29uc3QgZGlnaXRzID0gWycwJywgJzEnLCAnMicsICczJywgJzQnLCAnNScsICc2JywgJzcnLCAnOCcsICc5J107XG5jb25zdCB3aGl0ZXMgPSBbJyAnLCAnXFx0JywgJ1xcbicsICdcXHInXTtcbmNvbnN0IHRleHQgPSBQb3NpdGlvbi5mcm9tVGV4dDtcblxuZGVzY3JpYmUoJ2EgdmVyeSBzaW1wbGUgcGFyc2VyIGZvciBjaGFycyBvciBmb3IgZGlnaXRzJywgKCkgPT4ge1xuICAgIGNvbnN0IHBhcnNlckEgPSBjaGFyUGFyc2VyKCdhJyk7XG4gICAgY29uc3QgcGFyc2VyMSA9IGRpZ2l0UGFyc2VyKDEpO1xuXG4gICAgaXQoJ2NhbiBwYXJzZSBhIHNpbmdsZSBjaGFyJywgKCkgPT4ge1xuICAgICAgICBjb25zdCBwYXJzaW5nQSA9IHBhcnNlckEodGV4dCgnYWJjJykpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0EudmFsdWVbMF0pLnRvLmJlLmVxbCgnYScpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0EudmFsdWVbMV0ucmVzdCgpKS50by5iZS5lcWwoJ2JjJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQS5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgfSk7XG5cbiAgICBpdCgnY2FuIGFsc28gTk9UIHBhcnNlIGEgc2luZ2xlIGNoYXInLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHBhcnNpbmdCID0gcGFyc2VyQSh0ZXh0KCdiY2QnKSk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQi52YWx1ZVswXSkudG8uYmUuZXFsKCdjaGFyUGFyc2VyJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQi52YWx1ZVsxXSkudG8uYmUuZXFsKCd3YW50ZWQgYTsgZ290IGInKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdCLnZhbHVlWzJdLnJlc3QoKSkudG8uYmUuZXFsKCdiY2QnKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdCLmlzRmFpbHVyZSkudG8uYmUudHJ1ZTtcbiAgICB9KTtcblxuICAgIGl0KCdmYWlscyBhdCB0aGUgZW5kIG9mIHRoZSBzdHJlYW0nLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHBhcnNpbmdBID0gcGFyc2VyQSh0ZXh0KCcnKSk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQS52YWx1ZVswXSkudG8uYmUuZXFsKCdjaGFyUGFyc2VyJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQS52YWx1ZVsxXSkudG8uYmUuZXFsKCdubyBtb3JlIGlucHV0Jyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQS52YWx1ZVsyXS5yZXN0KCkpLnRvLmJlLmVxbCgnJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQS5pc0ZhaWx1cmUpLnRvLmJlLnRydWU7XG4gICAgfSk7XG5cbiAgICBpdCgnY2FuIHBhcnNlIGEgc2luZ2xlIGRpZ2l0JywgKCkgPT4ge1xuICAgICAgICBjb25zdCBwYXJzaW5nMSA9IHBhcnNlcjEodGV4dCgnMTIzJykpO1xuICAgICAgICBleHBlY3QocGFyc2luZzEudmFsdWVbMF0pLnRvLmJlLmVxbCgxKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcxLnZhbHVlWzFdLnJlc3QoKSkudG8uYmUuZXFsKCcyMycpO1xuICAgICAgICBleHBlY3QocGFyc2luZzEuaXNTdWNjZXNzKS50by5iZS50cnVlO1xuICAgIH0pO1xuXG4gICAgaXQoJ2NhbiBhbHNvIE5PVCBwYXJzZSBhIHNpbmdsZSBkaWdpdCcsICgpID0+IHtcbiAgICAgICAgY29uc3QgcGFyc2luZzIgPSBwYXJzZXIxKHRleHQoJzIzNCcpKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcyLnZhbHVlWzBdKS50by5iZS5lcWwoJ2RpZ2l0UGFyc2VyJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nMi52YWx1ZVsxXSkudG8uYmUuZXFsKCd3YW50ZWQgMTsgZ290IDInKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcyLnZhbHVlWzJdLnJlc3QoKSkudG8uYmUuZXFsKCcyMzQnKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcyLmlzRmFpbHVyZSkudG8uYmUudHJ1ZTtcbiAgICB9KTtcblxuICAgIGl0KCdmYWlscyBhdCB0aGUgZW5kIG9mIHRoZSBzdHJlYW0gYWxzbyB3aGVuIGh1bnRpbmcgZm9yIGRpZ2l0cycsICgpID0+IHtcbiAgICAgICAgY29uc3QgcGFyc2luZzMgPSBwYXJzZXIxKHRleHQoJycpKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmczLnZhbHVlWzBdKS50by5iZS5lcWwoJ2RpZ2l0UGFyc2VyJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nMy52YWx1ZVsxXSkudG8uYmUuZXFsKCdubyBtb3JlIGlucHV0Jyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nMy52YWx1ZVsyXS5yZXN0KCkpLnRvLmJlLmVxbCgnJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nMy5pc0ZhaWx1cmUpLnRvLmJlLnRydWU7XG4gICAgfSk7XG59KTtcblxuZGVzY3JpYmUoJ2EgbmFtZWQgY2hhcmFjdGVyIHBhcnNlcicsICgpID0+IHtcbiAgICBjb25zdCBwYXJzZXJBID0gcGNoYXIoJ2EnKTtcblxuICAgIGl0KCdjYW4gcGFyc2UgYSBzaW5nbGUgY2hhcicsICgpID0+IHtcbiAgICAgICAgZXhwZWN0KGlzUGFyc2VyKHBhcnNlckEpKS50by5iZS50cnVlO1xuICAgICAgICBjb25zdCBwYXJzaW5nQSA9IHBhcnNlckEucnVuKHRleHQoJ2FiYycpKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdBLnZhbHVlWzBdKS50by5iZS5lcWwoJ2EnKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdBLnZhbHVlWzFdLnJlc3QoKSkudG8uYmUuZXFsKCdiYycpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0EuaXNTdWNjZXNzKS50by5iZS50cnVlO1xuICAgIH0pO1xuXG4gICAgaXQoJ2NhbiBhbHNvIE5PVCBwYXJzZSBhIHNpbmdsZSBjaGFyJywgKCkgPT4ge1xuICAgICAgICBjb25zdCBwYXJzaW5nQiA9IHBhcnNlckEucnVuKHRleHQoJ2JjZCcpKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdCLnZhbHVlWzBdKS50by5iZS5lcWwoJ3BjaGFyX2EnKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdCLnZhbHVlWzFdKS50by5iZS5lcWwoJ3dhbnRlZCBhOyBnb3QgYicpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0IuaXNGYWlsdXJlKS50by5iZS50cnVlO1xuICAgIH0pO1xufSk7XG5cbmRlc2NyaWJlKCd0d28gcGFyc2VycyBib3VuZCBieSBhbmRUaGVuJywgKCkgPT4ge1xuICAgIGNvbnN0IHBhcnNlckFhbmRCID0gYW5kVGhlbihwY2hhcignYScpLCBwY2hhcignYicpKTtcblxuICAgIGl0KCdjYW4gcGFyc2UgdHdvIGNoYXJzJywgKCkgPT4ge1xuICAgICAgICBleHBlY3QoaXNQYXJzZXIocGFyc2VyQWFuZEIpKS50by5iZS50cnVlO1xuICAgICAgICBjb25zdCBwYXJzaW5nQWFuZEIgPSBwYXJzZXJBYW5kQi5ydW4odGV4dCgnYWJjJykpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0FhbmRCLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdBYW5kQi52YWx1ZVswXS50b1N0cmluZygpKS50by5iZS5lcWwoJ1thLGJdJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQWFuZEIudmFsdWVbMV0ucmVzdCgpKS50by5iZS5lcWwoJ2MnKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdBYW5kQi50b1N0cmluZygpKS50by5iZS5lcWwoJ1ZhbGlkYXRpb24uU3VjY2VzcyhbW2EsYl0scm93PTA7Y29sPTI7cmVzdD1jXSknKTtcbiAgICB9KTtcblxuICAgIGl0KCdjYW4gYWxzbyBOT1QgcGFyc2UgdHdvIGNoYXJzJywgKCkgPT4ge1xuICAgICAgICBjb25zdCBwYXJzaW5nQWFuZEIgPSBwYXJzZXJBYW5kQi5ydW4odGV4dCgnYWNkJykpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0FhbmRCLmlzRmFpbHVyZSkudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdBYW5kQi52YWx1ZVswXSkudG8uYmUuZXFsKCdwY2hhcl9hIGFuZFRoZW4gcGNoYXJfYicpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0FhbmRCLnZhbHVlWzFdKS50by5iZS5lcWwoJ3dhbnRlZCBiOyBnb3QgYycpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0FhbmRCLnZhbHVlWzJdLnJlc3QoKSkudG8uYmUuZXFsKCdjZCcpO1xuICAgIH0pO1xuXG4gICAgaXQoJ3dpbGwgZmFpbCBpZiB0aGUgaW5wdXQgaXMgdG9vIHNob3J0JywgKCkgPT4ge1xuICAgICAgICBleHBlY3QocGFyc2VyQWFuZEIucnVuKHRleHQoJ2EnKSkuaXNGYWlsdXJlKS50by5iZS50cnVlO1xuICAgICAgICBleHBlY3QocGFyc2VyQWFuZEIucnVuKHRleHQoJ2FiJykpLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcbiAgICB9KTtcbn0pO1xuXG5kZXNjcmliZSgndHdvIHBhcnNlcnMgYm91bmQgYnkgb3JFbHNlJywgKCkgPT4ge1xuICAgIGNvbnN0IHBhcnNlckFvckIgPSBvckVsc2UocGNoYXIoJ2EnKSwgcGNoYXIoJ2InKSk7XG5cbiAgICBpdCgnY2FuIHBhcnNlIG9uZSBvZiB0d28gY2hhcnMnLCAoKSA9PiB7XG4gICAgICAgIGV4cGVjdChpc1BhcnNlcihwYXJzZXJBb3JCKSkudG8uYmUudHJ1ZTtcbiAgICAgICAgbGV0IHBhcnNpbmdBb3JCID0gcGFyc2VyQW9yQi5ydW4odGV4dCgnYWJjJykpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0FvckIuaXNTdWNjZXNzKS50by5iZS50cnVlO1xuICAgICAgICBleHBlY3QocGFyc2luZ0FvckIudmFsdWVbMF0pLnRvLmJlLmVxbCgnYScpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0FvckIudmFsdWVbMV0ucmVzdCgpKS50by5iZS5lcWwoJ2JjJyk7XG4gICAgICAgIHBhcnNpbmdBb3JCID0gcGFyc2VyQW9yQi5ydW4odGV4dCgnYmJjJykpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0FvckIuaXNTdWNjZXNzKS50by5iZS50cnVlO1xuICAgICAgICBleHBlY3QocGFyc2luZ0FvckIudmFsdWVbMF0pLnRvLmJlLmVxbCgnYicpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0FvckIudmFsdWVbMV0ucmVzdCgpKS50by5iZS5lcWwoJ2JjJyk7XG4gICAgfSk7XG5cbiAgICBpdCgnY2FuIGFsc28gcGFyc2UgTk9ORSBvZiB0d28gY2hhcnMnLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHBhcnNpbmdBb3JCID0gcGFyc2VyQW9yQi5ydW4odGV4dCgnY2RlJykpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0FvckIuaXNGYWlsdXJlKS50by5iZS50cnVlO1xuICAgICAgICBleHBlY3QocGFyc2luZ0FvckIudmFsdWVbMF0pLnRvLmJlLmVxbCgncGNoYXJfYSBvckVsc2UgcGNoYXJfYicpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0FvckIudmFsdWVbMV0pLnRvLmJlLmVxbCgnd2FudGVkIGI7IGdvdCBjJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQW9yQi52YWx1ZVsyXS5yZXN0KCkpLnRvLmJlLmVxbCgnY2RlJyk7XG4gICAgfSk7XG5cbiAgICBpdCgnd2lsbCBmYWlsIGlmIHRoZSBpbnB1dCBpcyB0b28gc2hvcnQnLCAoKSA9PiB7XG4gICAgICAgIGV4cGVjdChwYXJzZXJBb3JCLnJ1bih0ZXh0KCdhJykpLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNlckFvckIucnVuKHRleHQoJycpKS5pc0ZhaWx1cmUpLnRvLmJlLnRydWU7XG4gICAgfSk7XG59KTtcblxuZGVzY3JpYmUoJ2EgY2hvaWNlIG9mIHBhcnNlcnMgYm91bmQgYnkgb3JFbHNlJywgKCkgPT4ge1xuICAgIGNvbnN0IHBhcnNlcnNDaG9pY2UgPSBjaG9pY2UoW3BjaGFyKCdhJyksIHBjaGFyKCdiJyksIHBjaGFyKCdjJyksIHBjaGFyKCdkJyksXSk7XG5cbiAgICBpdCgnY2FuIHBhcnNlIG9uZSBvZiBmb3VyIGNoYXJzJywgKCkgPT4ge1xuICAgICAgICBleHBlY3QoaXNQYXJzZXIocGFyc2Vyc0Nob2ljZSkpLnRvLmJlLnRydWU7XG4gICAgICAgIGxldCBwYXJzaW5nQ2hvaWNlID0gcGFyc2Vyc0Nob2ljZS5ydW4odGV4dCgnYScpKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UuaXNTdWNjZXNzKS50by5iZS50cnVlO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS52YWx1ZVswXSkudG8uYmUuZXFsKCdhJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLnZhbHVlWzFdLnJlc3QoKSkudG8uYmUuZXFsKCcnKTtcbiAgICAgICAgcGFyc2luZ0Nob2ljZSA9IHBhcnNlcnNDaG9pY2UucnVuKHRleHQoJ2InKSk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UudmFsdWVbMF0pLnRvLmJlLmVxbCgnYicpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS52YWx1ZVsxXS5yZXN0KCkpLnRvLmJlLmVxbCgnJyk7XG4gICAgICAgIHBhcnNpbmdDaG9pY2UgPSBwYXJzZXJzQ2hvaWNlLnJ1bih0ZXh0KCdkJykpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLnZhbHVlWzBdKS50by5iZS5lcWwoJ2QnKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UudmFsdWVbMV0ucmVzdCgpKS50by5iZS5lcWwoJycpO1xuICAgIH0pO1xuXG4gICAgaXQoJ2NhbiBhbHNvIHBhcnNlIE5PTkUgb2YgZm91ciBjaGFycycsICgpID0+IHtcbiAgICAgICAgY29uc3QgcGFyc2luZ0Nob2ljZSA9IHBhcnNlcnNDaG9pY2UucnVuKHRleHQoJ3gnKSk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLmlzRmFpbHVyZSkudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UudmFsdWVbMF0pLnRvLmJlLmVxbCgnY2hvaWNlIC9wY2hhcl9hL3BjaGFyX2IvcGNoYXJfYy9wY2hhcl9kJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLnZhbHVlWzFdKS50by5iZS5lcWwoJ19mYWlsJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLnZhbHVlWzJdLnJlc3QoKSkudG8uYmUuZXFsKCd4Jyk7XG4gICAgfSk7XG5cbiAgICBpdCgnd2lsbCBmYWlsIGlmIHRoZSBpbnB1dCBpcyB0b28gc2hvcnQnLCAoKSA9PiB7XG4gICAgICAgIGV4cGVjdChwYXJzZXJzQ2hvaWNlLnJ1bih0ZXh0KCdhJykpLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNlcnNDaG9pY2UucnVuKHRleHQoJycpKS5pc0ZhaWx1cmUpLnRvLmJlLnRydWU7XG4gICAgfSk7XG59KTtcblxuZGVzY3JpYmUoJ2EgcGFyc2VyIGZvciBhbnkgb2YgYSBsaXN0IG9mIGNoYXJzJywgKCkgPT4ge1xuICAgIGl0KCdjYW4gcGFyc2UgYW55IGxvd2VyY2FzZSBjaGFyJywgKCkgPT4ge1xuICAgICAgICBjb25zdCBsb3dlcmNhc2VzUGFyc2VyID0gYW55T2YobG93ZXJjYXNlcyk7XG5cbiAgICAgICAgZXhwZWN0KGlzUGFyc2VyKGxvd2VyY2FzZXNQYXJzZXIpKS50by5iZS50cnVlO1xuICAgICAgICBsZXQgcGFyc2luZ0Nob2ljZSA9IGxvd2VyY2FzZXNQYXJzZXIucnVuKHRleHQoJ2EnKSk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UudmFsdWVbMF0pLnRvLmJlLmVxbCgnYScpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS52YWx1ZVsxXS5yZXN0KCkpLnRvLmJlLmVxbCgnJyk7XG4gICAgICAgIHBhcnNpbmdDaG9pY2UgPSBsb3dlcmNhc2VzUGFyc2VyLnJ1bih0ZXh0KCdiJykpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLnZhbHVlWzBdKS50by5iZS5lcWwoJ2InKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UudmFsdWVbMV0ucmVzdCgpKS50by5iZS5lcWwoJycpO1xuICAgICAgICBwYXJzaW5nQ2hvaWNlID0gbG93ZXJjYXNlc1BhcnNlci5ydW4odGV4dCgnZCcpKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UuaXNTdWNjZXNzKS50by5iZS50cnVlO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS52YWx1ZVswXSkudG8uYmUuZXFsKCdkJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLnZhbHVlWzFdLnJlc3QoKSkudG8uYmUuZXFsKCcnKTtcbiAgICAgICAgcGFyc2luZ0Nob2ljZSA9IGxvd2VyY2FzZXNQYXJzZXIucnVuKHRleHQoJ3onKSk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UudmFsdWVbMF0pLnRvLmJlLmVxbCgneicpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS52YWx1ZVsxXS5yZXN0KCkpLnRvLmJlLmVxbCgnJyk7XG5cbiAgICAgICAgcGFyc2luZ0Nob2ljZSA9IGxvd2VyY2FzZXNQYXJzZXIucnVuKHRleHQoJ1knKSk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLmlzRmFpbHVyZSkudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UudmFsdWVbMF0pLnRvLmJlLmVxbCgnYW55T2YgYWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXonKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UudmFsdWVbMV0pLnRvLmJlLmVxbCgnX2ZhaWwnKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UudmFsdWVbMl0ucmVzdCgpKS50by5iZS5lcWwoJ1knKTtcbiAgICB9KTtcblxuICAgIGl0KCdjYW4gcGFyc2UgYW55IHVwcGVyY2FzZSBjaGFyJywgKCkgPT4ge1xuICAgICAgICBsZXQgdXBwZXJjYXNlc1BhcnNlciA9IGFueU9mKHVwcGVyY2FzZXMpO1xuXG4gICAgICAgIGV4cGVjdChpc1BhcnNlcih1cHBlcmNhc2VzUGFyc2VyKSkudG8uYmUudHJ1ZTtcbiAgICAgICAgbGV0IHBhcnNpbmdDaG9pY2UgPSB1cHBlcmNhc2VzUGFyc2VyLnJ1bih0ZXh0KCdBJykpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLnZhbHVlWzBdKS50by5iZS5lcWwoJ0EnKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UudmFsdWVbMV0ucmVzdCgpKS50by5iZS5lcWwoJycpO1xuICAgICAgICBwYXJzaW5nQ2hvaWNlID0gdXBwZXJjYXNlc1BhcnNlci5ydW4odGV4dCgnQicpKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UuaXNTdWNjZXNzKS50by5iZS50cnVlO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS52YWx1ZVswXSkudG8uYmUuZXFsKCdCJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLnZhbHVlWzFdLnJlc3QoKSkudG8uYmUuZXFsKCcnKTtcbiAgICAgICAgcGFyc2luZ0Nob2ljZSA9IHVwcGVyY2FzZXNQYXJzZXIucnVuKHRleHQoJ1InKSk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UudmFsdWVbMF0pLnRvLmJlLmVxbCgnUicpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS52YWx1ZVsxXS5yZXN0KCkpLnRvLmJlLmVxbCgnJyk7XG4gICAgICAgIHBhcnNpbmdDaG9pY2UgPSB1cHBlcmNhc2VzUGFyc2VyLnJ1bih0ZXh0KCdaJykpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLnZhbHVlWzBdKS50by5iZS5lcWwoJ1onKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UudmFsdWVbMV0ucmVzdCgpKS50by5iZS5lcWwoJycpO1xuXG4gICAgICAgIHBhcnNpbmdDaG9pY2UgPSB1cHBlcmNhc2VzUGFyc2VyLnJ1bih0ZXh0KCdzJykpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS5pc0ZhaWx1cmUpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLnZhbHVlWzBdKS50by5iZS5lcWwoJ2FueU9mIEFCQ0RFRkdISUpLTE1OT1BRUlNUVVZXWFlaJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLnZhbHVlWzFdKS50by5iZS5lcWwoJ19mYWlsJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLnZhbHVlWzJdLnJlc3QoKSkudG8uYmUuZXFsKCdzJyk7XG4gICAgfSk7XG5cbiAgICBpdCgnY2FuIHBhcnNlIGFueSBkaWdpdCcsICgpID0+IHtcbiAgICAgICAgbGV0IGRpZ2l0c1BhcnNlciA9IGFueU9mKGRpZ2l0cyk7XG5cbiAgICAgICAgZXhwZWN0KGlzUGFyc2VyKGRpZ2l0c1BhcnNlcikpLnRvLmJlLnRydWU7XG4gICAgICAgIGxldCBwYXJzaW5nQ2hvaWNlID0gZGlnaXRzUGFyc2VyLnJ1bih0ZXh0KCcxJykpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLnZhbHVlWzBdKS50by5iZS5lcWwoJzEnKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UudmFsdWVbMV0ucmVzdCgpKS50by5iZS5lcWwoJycpO1xuICAgICAgICBwYXJzaW5nQ2hvaWNlID0gZGlnaXRzUGFyc2VyLnJ1bih0ZXh0KCczJykpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLnZhbHVlWzBdKS50by5iZS5lcWwoJzMnKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UudmFsdWVbMV0ucmVzdCgpKS50by5iZS5lcWwoJycpO1xuICAgICAgICBwYXJzaW5nQ2hvaWNlID0gZGlnaXRzUGFyc2VyLnJ1bih0ZXh0KCcwJykpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLnZhbHVlWzBdKS50by5iZS5lcWwoJzAnKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UudmFsdWVbMV0ucmVzdCgpKS50by5iZS5lcWwoJycpO1xuICAgICAgICBwYXJzaW5nQ2hvaWNlID0gZGlnaXRzUGFyc2VyLnJ1bih0ZXh0KCc4JykpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLnZhbHVlWzBdKS50by5iZS5lcWwoJzgnKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UudmFsdWVbMV0ucmVzdCgpKS50by5iZS5lcWwoJycpO1xuXG4gICAgICAgIHBhcnNpbmdDaG9pY2UgPSBkaWdpdHNQYXJzZXIucnVuKHRleHQoJ3MnKSk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLmlzRmFpbHVyZSkudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UudmFsdWVbMF0pLnRvLmJlLmVxbCgnYW55T2YgMDEyMzQ1Njc4OScpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS52YWx1ZVsxXSkudG8uYmUuZXFsKCdfZmFpbCcpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS52YWx1ZVsyXS5yZXN0KCkpLnRvLmJlLmVxbCgncycpO1xuICAgIH0pO1xuXG4gICAgaXQoJ3dpbGwgZmFpbCBpZiB0aGUgaW5wdXQgaXMgdG9vIHNob3J0JywgKCkgPT4ge1xuICAgICAgICBleHBlY3QoYW55T2YobG93ZXJjYXNlcykucnVuKHRleHQoJycpKS5pc0ZhaWx1cmUpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChhbnlPZihkaWdpdHMpLnJ1bih0ZXh0KCcnKSkuaXNGYWlsdXJlKS50by5iZS50cnVlO1xuICAgIH0pO1xufSk7XG5kZXNjcmliZSgncGFyc2UgQUJDJywgKCkgPT4ge1xuICAgIGl0KCdwYXJzZXMgQUJDJywgKCkgPT4ge1xuICAgICAgICBjb25zdCBwYWlyQWRkZXIgPSAoW3gsIHldKSA9PiB4ICsgeTtcbiAgICAgICAgY29uc3QgYWJjUCA9IGFuZFRoZW4oXG4gICAgICAgICAgICBwY2hhcignYScpLFxuICAgICAgICAgICAgYW5kVGhlbihcbiAgICAgICAgICAgICAgICBwY2hhcignYicpLFxuICAgICAgICAgICAgICAgIGFuZFRoZW4oXG4gICAgICAgICAgICAgICAgICAgIHBjaGFyKCdjJyksXG4gICAgICAgICAgICAgICAgICAgIHJldHVyblAoJycpXG4gICAgICAgICAgICAgICAgKS5mbWFwKHBhaXJBZGRlcilcbiAgICAgICAgICAgICkuZm1hcChwYWlyQWRkZXIpXG4gICAgICAgICkuZm1hcChwYWlyQWRkZXIpO1xuICAgICAgICBjb25zdCBwYXJzaW5nID0gYWJjUC5ydW4oJ2FiY2QnKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcuaXNTdWNjZXNzKS50by5iZS50cnVlO1xuICAgICAgICBleHBlY3QocGFyc2luZy52YWx1ZVswXS50b1N0cmluZygpKS50by5iZS5lcWwoJ2FiYycpO1xuICAgICAgICBleHBlY3QocGFyc2luZy52YWx1ZVsxXS5yZXN0KCkpLnRvLmJlLmVxbCgnZCcpO1xuICAgIH0pO1xufSk7XG5cbmRlc2NyaWJlKCdwYXJzZSAzIGRpZ2l0cycsICgpID0+IHtcbiAgICBsZXQgcGFyc2VEaWdpdCwgdGhyZWVEaWdpdHMsIHBhcnNpbmc7XG5cbiAgICBiZWZvcmUoKCkgPT4ge1xuICAgICAgICBwYXJzZURpZ2l0ID0gYW55T2YoZGlnaXRzKTtcbiAgICAgICAgdGhyZWVEaWdpdHMgPSBhbmRUaGVuKHBhcnNlRGlnaXQsIGFuZFRoZW4ocGFyc2VEaWdpdCwgcGFyc2VEaWdpdCkpO1xuICAgICAgICBwYXJzaW5nID0gdGhyZWVEaWdpdHMucnVuKCcxMjMnKTtcbiAgICB9KTtcbiAgICBpdCgncGFyc2VzIGFueSBvZiB0aHJlZSBkaWdpdHMnLCAoKSA9PiB7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcudmFsdWVbMF0udG9TdHJpbmcoKSkudG8uYmUuZXFsKCdbMSxbMiwzXV0nKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcudmFsdWVbMV0ucmVzdCgpKS50by5iZS5lcWwoJycpO1xuICAgIH0pO1xuICAgIGRlc2NyaWJlKCdwYXJzZXMgYW55IG9mIHRocmVlIGRpZ2l0cyB3aGlsZSBzaG93Y2FzaW5nIGZtYXAnLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHVucGFja2VyID0gKFt4LCBbeSwgel1dKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gW3gsIHksIHpdO1xuICAgICAgICB9O1xuICAgICAgICBpdCgnYXMgZ2xvYmFsIG1ldGhvZCcsICgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHRocmVlRGlnaXRzSW1wbCA9IGZtYXAodW5wYWNrZXIsIHRocmVlRGlnaXRzKTtcbiAgICAgICAgICAgIGxldCBwYXJzaW5nID0gdGhyZWVEaWdpdHNJbXBsLnJ1bignMTIzJyk7XG4gICAgICAgICAgICBleHBlY3QocGFyc2luZy5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgICAgICAgICBleHBlY3QocGFyc2luZy52YWx1ZVswXS50b1N0cmluZygpKS50by5iZS5lcWwoJ1sxLDIsM10nKTtcbiAgICAgICAgICAgIGV4cGVjdChwYXJzaW5nLnZhbHVlWzFdLnJlc3QoKSkudG8uYmUuZXFsKCcnKTtcbiAgICAgICAgfSk7XG4gICAgICAgIGl0KCdhcyBpbnN0YW5jZSBtZXRob2QnLCAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCB0aHJlZURpZ2l0c0luc3QgPSB0aHJlZURpZ2l0cy5mbWFwKHVucGFja2VyKTtcbiAgICAgICAgICAgIGxldCBwYXJzaW5nID0gdGhyZWVEaWdpdHNJbnN0LnJ1bignMTIzJyk7XG4gICAgICAgICAgICBleHBlY3QocGFyc2luZy5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgICAgICAgICBleHBlY3QocGFyc2luZy52YWx1ZVswXS50b1N0cmluZygpKS50by5iZS5lcWwoJ1sxLDIsM10nKTtcbiAgICAgICAgICAgIGV4cGVjdChwYXJzaW5nLnZhbHVlWzFdLnJlc3QoKSkudG8uYmUuZXFsKCcnKTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG59KTtcblxuZGVzY3JpYmUoJ2xpZnQyIGZvciBwYXJzZXJzJywgKCkgPT4ge1xuICAgIGl0KCdvcGVyYXRlcyBvbiB0aGUgcmVzdWx0cyBvZiB0d28gc3RyaW5nIHBhcnNpbmdzJywgKCkgPT4ge1xuICAgICAgICBjb25zdCBhZGRTdHJpbmdzID0geCA9PiB5ID0+IHggKyAnKycgKyB5O1xuICAgICAgICBjb25zdCBBcGx1c0IgPSBsaWZ0MihhZGRTdHJpbmdzKShwY2hhcignYScpKShwY2hhcignYicpKTtcbiAgICAgICAgZXhwZWN0KEFwbHVzQi5ydW4oJ2FiYycpLnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgnVmFsaWRhdGlvbi5TdWNjZXNzKFthK2Iscm93PTA7Y29sPTI7cmVzdD1jXSknKTtcbiAgICB9KTtcbiAgICBpdCgnYWRkcyB0aGUgcmVzdWx0cyBvZiB0d28gZGlnaXQgcGFyc2luZ3MnLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IGFkZERpZ2l0cyA9IHggPT4geSA9PiB4ICsgeTtcbiAgICAgICAgY29uc3QgYWRkUGFyc2VyID0gbGlmdDIoYWRkRGlnaXRzKShwZGlnaXQoMSkpKHBkaWdpdCgyKSk7XG4gICAgICAgIGV4cGVjdChhZGRQYXJzZXIucnVuKCcxMjM0JykudG9TdHJpbmcoKSkudG8uYmUuZXFsKCdWYWxpZGF0aW9uLlN1Y2Nlc3MoWzMscm93PTA7Y29sPTI7cmVzdD0zNF0pJyk7XG4gICAgICAgIGV4cGVjdChhZGRQYXJzZXIucnVuKCcxNDQnKS5pc0ZhaWx1cmUpLnRvLmJlLnRydWU7XG4gICAgfSk7XG59KTtcblxuZGVzY3JpYmUoJ3NlcXVlbmNlcyBvZiBwYXJzZXJzIGJhc2VkIG9uIGFuZFRoZW4gJiYgZm1hcCAoYWthIHNlcXVlbmNlUDIpJywgKCkgPT4ge1xuICAgIGl0KCdzdG9yZSBtYXRjaGVkIGNoYXJzIGluc2lkZSBhIHBsYWluIHN0cmluZycsICgpID0+IHtcbiAgICAgICAgY29uc3QgYWJjUGFyc2VyID0gc2VxdWVuY2VQMihbcGNoYXIoJ2EnKSwgcGNoYXIoJ2InKSwgcGNoYXIoJ2MnKSxdKTtcbiAgICAgICAgZXhwZWN0KGFiY1BhcnNlci5ydW4oJ2FiYycpLnRvU3RyaW5nKCkpXG4gICAgICAgICAgICAudG8uYmUuZXFsKCdWYWxpZGF0aW9uLlN1Y2Nlc3MoW2FiYyxyb3c9MTtjb2w9MDtyZXN0PV0pJyk7XG4gICAgfSk7XG59KTtcblxuZGVzY3JpYmUoJ3NlcXVlbmNlcyBvZiBwYXJzZXJzIGJhc2VkIG9uIGxpZnQyKGNvbnMpIChha2Egc2VxdWVuY2VQKScsICgpID0+IHtcbiAgICBpdCgnc3RvcmVzIG1hdGNoZWQgY2hhcnMgaW5zaWRlIGFuIGFycmF5JywgKCkgPT4ge1xuICAgICAgICBjb25zdCBhYmNQYXJzZXIgPSBzZXF1ZW5jZVAoW3BjaGFyKCdhJyksIHBjaGFyKCdiJyksIHBjaGFyKCdjJyksXSk7XG4gICAgICAgIGV4cGVjdChhYmNQYXJzZXIucnVuKCdhYmMnKS50b1N0cmluZygpKVxuICAgICAgICAgICAgLnRvLmJlLmVxbCgnVmFsaWRhdGlvbi5TdWNjZXNzKFtbYSxiLGNdLHJvdz0xO2NvbD0wO3Jlc3Q9XSknKTtcbiAgICB9KTtcbn0pO1xuXG5kZXNjcmliZSgnYSBwYXJzZXIgZm9yIGEgc3BlY2lmaWMgc2VxdWVuY2Ugb2YgY2hhcnMnLCAoKSA9PiB7XG4gICAgaXQoJ2lzIGVhc3kgdG8gY3JlYXRlIHdpdGggc2VxdWVuY2VQJywgKCkgPT4ge1xuICAgICAgICBjb25zdCBtYXJjb1BhcnNlciA9IHBzdHJpbmcoJ21hcmNvJyk7XG4gICAgICAgIGNvbnN0IG1hcmNvUGFyc2luZyA9IG1hcmNvUGFyc2VyLnJ1bignbWFyY29jaWFvJyk7XG4gICAgICAgIGV4cGVjdChtYXJjb1BhcnNpbmcuaXNTdWNjZXNzKS50by5iZS50cnVlO1xuICAgICAgICBleHBlY3QobWFyY29QYXJzaW5nLnRvU3RyaW5nKCkpXG4gICAgICAgICAgICAudG8uYmUuZXFsKCdWYWxpZGF0aW9uLlN1Y2Nlc3MoW1ttLGEscixjLG9dLHJvdz0wO2NvbD01O3Jlc3Q9Y2lhb10pJyk7XG4gICAgfSk7XG59KTtcblxuZGVzY3JpYmUoJ2EgdHJpbW1lciBvZiBwYXJzZXJzJywgKCkgPT4ge1xuICAgIGl0KCdjYW4gaWdub3JlIHdoaXRlc3BhY2VzIGFyb3VuZCBhIHNpbmdsZSBjaGFyJywgKCkgPT4ge1xuICAgICAgICBjb25zdCB0cmltbWVyID0gdHJpbVAocGNoYXIoJ2EnKSk7XG4gICAgICAgIGV4cGVjdCh0cmltbWVyLnJ1bignICBhICAgICcpLnRvU3RyaW5nKCkpXG4gICAgICAgICAgICAudG8uYmUuZXFsKCdWYWxpZGF0aW9uLlN1Y2Nlc3MoW2Escm93PTE7Y29sPTA7cmVzdD1dKScpO1xuICAgIH0pO1xuICAgIGl0KCdjYW4gaWdub3JlIHdoaXRlc3BhY2VzIGFyb3VuZCBhIHNlcXVlbmNlIG9mIHR3byBjaGFycycsICgpID0+IHtcbiAgICAgICAgY29uc3QgdHJpbW1lciA9IHRyaW1QKHBjaGFyKCdhJykuYW5kVGhlbihwY2hhcignYicpKSk7XG4gICAgICAgIGV4cGVjdCh0cmltbWVyLnJ1bignICBhYiAgICAnKS50b1N0cmluZygpKVxuICAgICAgICAgICAgLnRvLmJlLmVxbCgnVmFsaWRhdGlvbi5TdWNjZXNzKFtbYSxiXSxyb3c9MTtjb2w9MDtyZXN0PV0pJyk7XG4gICAgfSk7XG59KTtcblxuZGVzY3JpYmUoJ2EgcGFyc2VyIGZvciBhIHNwZWNpZmljIHdvcmQnLCAoKSA9PiB7XG4gICAgaXQoJ2RldGVjdHMgYW5kIGlnbm9yZXMgd2hpdGVzcGFjZXMgYXJvdW5kIGl0JywgKCkgPT4ge1xuICAgICAgICBjb25zdCBtYXJjb1BhcnNlciA9IHB3b3JkKCdtYXJjbycpO1xuICAgICAgICBjb25zdCBtYXJjb1BhcnNpbmcgPSBtYXJjb1BhcnNlci5ydW4oJyAgbWFyY28gY2lhbycpO1xuICAgICAgICBleHBlY3QobWFyY29QYXJzaW5nLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KG1hcmNvUGFyc2luZy50b1N0cmluZygpKVxuICAgICAgICAgICAgLnRvLmJlLmVxbCgnVmFsaWRhdGlvbi5TdWNjZXNzKFtbbSxhLHIsYyxvXSxyb3c9MDtjb2w9ODtyZXN0PWNpYW9dKScpO1xuICAgIH0pO1xuICAgIGl0KCdoYXMgbm8gcHJvYmxlbSBpZiB0aGUgd2hpdGVzcGFjZXMgYXJlblxcJ3QgdGhlcmUnLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IG1hcmNvUGFyc2VyID0gcHdvcmQoJ21hcmNvJyk7XG4gICAgICAgIGNvbnN0IG1hcmNvUGFyc2luZyA9IG1hcmNvUGFyc2VyLnJ1bignbWFyY29jaWFvJyk7XG4gICAgICAgIGV4cGVjdChtYXJjb1BhcnNpbmcuaXNTdWNjZXNzKS50by5iZS50cnVlO1xuICAgICAgICBleHBlY3QobWFyY29QYXJzaW5nLnRvU3RyaW5nKCkpXG4gICAgICAgICAgICAudG8uYmUuZXFsKCdWYWxpZGF0aW9uLlN1Y2Nlc3MoW1ttLGEscixjLG9dLHJvdz0wO2NvbD01O3Jlc3Q9Y2lhb10pJyk7XG4gICAgfSk7XG59KTtcblxuZGVzY3JpYmUoJ2EgcGFyc2luZyBmdW5jdGlvbiBmb3IgemVybyBvciBtb3JlIG9jY3VycmVuY2VzJywgKCkgPT4ge1xuICAgIGl0KCdjYW4gcGFyc2UgYSBjaGFyIHplcm8gdGltZXMnLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHplcm9Pck1vcmVQYXJzaW5nRnVuY3Rpb24gPSB6ZXJvT3JNb3JlKHBjaGFyKCdtJykpO1xuICAgICAgICBsZXQgcGFyc2luZyA9IHplcm9Pck1vcmVQYXJzaW5nRnVuY3Rpb24odGV4dCgnYXJjbycpKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcuaXNTdWNjZXNzKS50by5iZS50cnVlO1xuICAgICAgICBleHBlY3QocGFyc2luZy50b1N0cmluZygpKS50by5iZS5lcWwoJ1ZhbGlkYXRpb24uU3VjY2VzcyhbW10scm93PTA7Y29sPTA7cmVzdD1hcmNvXSknKTtcbiAgICB9KTtcbiAgICBpdCgnY2FuIHBhcnNlIGEgY2hhciBtYW55IHRpbWVzJywgKCkgPT4ge1xuICAgICAgICBjb25zdCB6ZXJvT3JNb3JlUGFyc2luZ0Z1bmN0aW9uID0gemVyb09yTW9yZShwY2hhcignbScpKTtcbiAgICAgICAgbGV0IHBhcnNpbmcgPSB6ZXJvT3JNb3JlUGFyc2luZ0Z1bmN0aW9uKHRleHQoJ21tbWFyY28nKSk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcudG9TdHJpbmcoKSkudG8uYmUuZXFsKCdWYWxpZGF0aW9uLlN1Y2Nlc3MoW1ttLG0sbV0scm93PTA7Y29sPTM7cmVzdD1hcmNvXSknKTtcbiAgICB9KTtcbiAgICBpdCgnY2FuIHBhcnNlIGEgY2hhciBzZXF1ZW5jZSB6ZXJvIHRpbWVzJywgKCkgPT4ge1xuICAgICAgICBjb25zdCB6ZXJvT3JNb3JlUGFyc2luZ0Z1bmN0aW9uID0gemVyb09yTW9yZShwc3RyaW5nKCdtYXJjbycpKTtcbiAgICAgICAgbGV0IHBhcnNpbmcgPSB6ZXJvT3JNb3JlUGFyc2luZ0Z1bmN0aW9uKHRleHQoJ3htYXJjb21hcmNvY2lhbycpKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcuaXNTdWNjZXNzKS50by5iZS50cnVlO1xuICAgICAgICBleHBlY3QocGFyc2luZy50b1N0cmluZygpKS50by5iZS5lcWwoJ1ZhbGlkYXRpb24uU3VjY2VzcyhbW10scm93PTA7Y29sPTA7cmVzdD14bWFyY29tYXJjb2NpYW9dKScpO1xuICAgIH0pO1xuICAgIGl0KCdjYW4gcGFyc2UgYSBjaGFyIHNlcXVlbmNlIG1hbnkgdGltZXMnLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHplcm9Pck1vcmVQYXJzaW5nRnVuY3Rpb24gPSB6ZXJvT3JNb3JlKHBzdHJpbmcoJ21hcmNvJykpO1xuICAgICAgICBsZXQgcGFyc2luZyA9IHplcm9Pck1vcmVQYXJzaW5nRnVuY3Rpb24odGV4dCgnbWFyY29tYXJjb2NpYW8nKSk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcudG9TdHJpbmcoKSlcbiAgICAgICAgICAgIC50by5iZS5lcWwoJ1ZhbGlkYXRpb24uU3VjY2VzcyhbW1ttLGEscixjLG9dLFttLGEscixjLG9dXSxyb3c9MDtjb2w9MTA7cmVzdD1jaWFvXSknKTtcbiAgICB9KTtcbn0pO1xuXG5kZXNjcmliZSgnYSBwYXJzZXIgZm9yIHplcm8gb3IgbW9yZSBvY2N1cnJlbmNlcycsICgpID0+IHtcbiAgICBpdCgnY2FuIHBhcnNlIGEgY2hhciB6ZXJvIHRpbWVzJywgKCkgPT4ge1xuICAgICAgICBjb25zdCB6ZXJvT3JNb3JlUGFyc2VyID0gbWFueShwY2hhcignbScpKTtcbiAgICAgICAgbGV0IHBhcnNpbmcgPSB6ZXJvT3JNb3JlUGFyc2VyLnJ1bih0ZXh0KCdhcmNvJykpO1xuICAgICAgICBleHBlY3QocGFyc2luZy5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgnVmFsaWRhdGlvbi5TdWNjZXNzKFtbXSxyb3c9MDtjb2w9MDtyZXN0PWFyY29dKScpO1xuICAgIH0pO1xuICAgIGl0KCdjYW4gcGFyc2UgYSBjaGFyIG1hbnkgdGltZXMgYW5kIHJldHVybiBhbiBhcnJheScsICgpID0+IHtcbiAgICAgICAgY29uc3QgemVyb09yTW9yZVBhcnNlciA9IG1hbnkocGNoYXIoJ20nKSk7XG4gICAgICAgIGxldCBwYXJzaW5nID0gemVyb09yTW9yZVBhcnNlci5ydW4odGV4dCgnbW1tYXJjbycpKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcuaXNTdWNjZXNzKS50by5iZS50cnVlO1xuICAgICAgICBleHBlY3QocGFyc2luZy50b1N0cmluZygpKS50by5iZS5lcWwoJ1ZhbGlkYXRpb24uU3VjY2VzcyhbW20sbSxtXSxyb3c9MDtjb2w9MztyZXN0PWFyY29dKScpO1xuICAgIH0pO1xuICAgIGl0KCdjYW4gcGFyc2UgYSBjaGFyIGV4YWN0bHkgbiB0aW1lcyBhbmQgcmV0dXJuIGFuIGFycmF5IChvciBmYWlsKScsICgpID0+IHtcbiAgICAgICAgY29uc3QgZXhhY3RseVRocmVlID0gbWFueShwY2hhcignbScpLCAzKTtcbiAgICAgICAgbGV0IHBhcnNpbmcgPSBleGFjdGx5VGhyZWUucnVuKHRleHQoJ21tbWFyY28nKSk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcudG9TdHJpbmcoKSkudG8uYmUuZXFsKCdWYWxpZGF0aW9uLlN1Y2Nlc3MoW1ttLG0sbV0scm93PTA7Y29sPTM7cmVzdD1hcmNvXSknKTtcbiAgICAgICAgcGFyc2luZyA9IGV4YWN0bHlUaHJlZS5ydW4odGV4dCgnbW1tbWFyY28nKSk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLmlzRmFpbHVyZSkudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcudG9TdHJpbmcoKSkudG8uYmUuZXFsKCdWYWxpZGF0aW9uLkZhaWx1cmUoW21hbnkgcGNoYXJfbSB0aW1lcz0zLHRpbWVzIHBhcmFtIHdhbnRlZCAzOyBnb3QgNCxyb3c9MDtjb2w9MDtyZXN0PW1tbW1hcmNvXSknKTtcbiAgICB9KTtcbiAgICBpdCgnY2FuIHBhcnNlIGEgY2hhciBtYW55IHRpbWVzIGFuZCByZXR1cm4gYSBzdHJpbmcnLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHplcm9Pck1vcmVQYXJzZXIgPSBtYW55Q2hhcnMocGNoYXIoJ20nKSk7XG4gICAgICAgIGxldCBwYXJzaW5nID0gemVyb09yTW9yZVBhcnNlci5ydW4odGV4dCgnbW1tYXJjbycpKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcuaXNTdWNjZXNzKS50by5iZS50cnVlO1xuICAgICAgICBleHBlY3QocGFyc2luZy50b1N0cmluZygpKS50by5iZS5lcWwoJ1ZhbGlkYXRpb24uU3VjY2VzcyhbbW1tLHJvdz0wO2NvbD0zO3Jlc3Q9YXJjb10pJyk7XG4gICAgfSk7XG4gICAgaXQoJ2NhbiBwYXJzZSBhIGNoYXIgZXhhY3RseSBuIHRpbWVzIGFuZCByZXR1cm4gYSBzdHJpbmcgKG9yIGZhaWwpJywgKCkgPT4ge1xuICAgICAgICBjb25zdCBleGFjdGx5VGhyZWUgPSBtYW55Q2hhcnMocGNoYXIoJ20nKSwgMyk7XG4gICAgICAgIGxldCBwYXJzaW5nID0gZXhhY3RseVRocmVlLnJ1bih0ZXh0KCdtbW1hcmNvJykpO1xuICAgICAgICBleHBlY3QocGFyc2luZy5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgnVmFsaWRhdGlvbi5TdWNjZXNzKFttbW0scm93PTA7Y29sPTM7cmVzdD1hcmNvXSknKTtcbiAgICAgICAgcGFyc2luZyA9IGV4YWN0bHlUaHJlZS5ydW4odGV4dCgnbW1tbWFyY28nKSk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLmlzRmFpbHVyZSkudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcudG9TdHJpbmcoKSkudG8uYmUuZXFsKCdWYWxpZGF0aW9uLkZhaWx1cmUoW21hbnlDaGFycyBwY2hhcl9tIHRpbWVzPTMsdGltZXMgcGFyYW0gd2FudGVkIDM7IGdvdCA0LHJvdz0wO2NvbD0wO3Jlc3Q9bW1tbWFyY29dKScpO1xuICAgIH0pO1xuICAgIGl0KCdjYW4gcGFyc2UgYSBjaGFyIHNlcXVlbmNlIHplcm8gdGltZXMnLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHplcm9Pck1vcmVQYXJzZXIgPSBtYW55KHBzdHJpbmcoJ21hcmNvJykpO1xuICAgICAgICBsZXQgcGFyc2luZyA9IHplcm9Pck1vcmVQYXJzZXIucnVuKHRleHQoJ3htYXJjb21hcmNvY2lhbycpKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcuaXNTdWNjZXNzKS50by5iZS50cnVlO1xuICAgICAgICBleHBlY3QocGFyc2luZy50b1N0cmluZygpKS50by5iZS5lcWwoJ1ZhbGlkYXRpb24uU3VjY2VzcyhbW10scm93PTA7Y29sPTA7cmVzdD14bWFyY29tYXJjb2NpYW9dKScpO1xuICAgIH0pO1xuICAgIGl0KCdjYW4gcGFyc2UgYSBjaGFyIHNlcXVlbmNlIG1hbnkgdGltZXMnLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHplcm9Pck1vcmVQYXJzZXIgPSBtYW55KHBzdHJpbmcoJ21hcmNvJykpO1xuICAgICAgICBsZXQgcGFyc2luZyA9IHplcm9Pck1vcmVQYXJzZXIucnVuKCdtYXJjb21hcmNvY2lhbycpO1xuICAgICAgICBleHBlY3QocGFyc2luZy5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLnRvU3RyaW5nKCkpXG4gICAgICAgICAgICAudG8uYmUuZXFsKCdWYWxpZGF0aW9uLlN1Y2Nlc3MoW1tbbSxhLHIsYyxvXSxbbSxhLHIsYyxvXV0scm93PTA7Y29sPTEwO3Jlc3Q9Y2lhb10pJyk7XG4gICAgfSk7XG4gICAgaXQoJ2NhbiBwYXJzZSB3aGl0ZXNwYWNlcyEhJywgKCkgPT4ge1xuICAgICAgICBjb25zdCB3aGl0ZXNQYXJzZXIgPSBtYW55KGFueU9mKHdoaXRlcykpO1xuICAgICAgICBjb25zdCB0d29Xb3JkcyA9IHNlcXVlbmNlUChbcHN0cmluZygnY2lhbycpLCB3aGl0ZXNQYXJzZXIsIHBzdHJpbmcoJ21hbW1hJyldKTtcbiAgICAgICAgbGV0IHBhcnNpbmcgPSB0d29Xb3Jkcy5ydW4oJ2NpYW9tYW1tYVgnKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcudG9TdHJpbmcoKSlcbiAgICAgICAgICAgIC50by5iZS5lcWwoJ1ZhbGlkYXRpb24uU3VjY2VzcyhbW1tjLGksYSxvXSxbXSxbbSxhLG0sbSxhXV0scm93PTA7Y29sPTk7cmVzdD1YXSknKTtcbiAgICAgICAgcGFyc2luZyA9IHR3b1dvcmRzLnJ1bignY2lhbyBtYW1tYVgnKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcudG9TdHJpbmcoKSlcbiAgICAgICAgICAgIC50by5iZS5lcWwoJ1ZhbGlkYXRpb24uU3VjY2VzcyhbW1tjLGksYSxvXSxbIF0sW20sYSxtLG0sYV1dLHJvdz0wO2NvbD0xMDtyZXN0PVhdKScpO1xuICAgICAgICBwYXJzaW5nID0gdHdvV29yZHMucnVuKCdjaWFvICAgbWFtbWFYJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLnRvU3RyaW5nKCkpXG4gICAgICAgICAgICAudG8uYmUuZXFsKCdWYWxpZGF0aW9uLlN1Y2Nlc3MoW1tbYyxpLGEsb10sWyAsICwgXSxbbSxhLG0sbSxhXV0scm93PTA7Y29sPTEyO3Jlc3Q9WF0pJyk7XG4gICAgICAgIHBhcnNpbmcgPSB0d29Xb3Jkcy5ydW4oJ2NpYW8gXFx0IG1hbW1hWCcpO1xuICAgICAgICBleHBlY3QocGFyc2luZy50b1N0cmluZygpKVxuICAgICAgICAgICAgLnRvLmJlLmVxbCgnVmFsaWRhdGlvbi5TdWNjZXNzKFtbW2MsaSxhLG9dLFsgLFxcdCwgXSxbbSxhLG0sbSxhXV0scm93PTA7Y29sPTEyO3Jlc3Q9WF0pJyk7XG4gICAgfSk7XG59KTtcblxuZGVzY3JpYmUoJ2EgcGFyc2VyIGZvciBvbmUgb3IgbW9yZSBvY2N1cnJlbmNlcycsICgpID0+IHtcbiAgICBpdCgnY2Fubm90IHBhcnNlIGEgY2hhciB6ZXJvIHRpbWVzJywgKCkgPT4ge1xuICAgICAgICBjb25zdCBvbmVPck1vcmVQYXJzZXIgPSBtYW55MShwY2hhcignbScpKTtcbiAgICAgICAgbGV0IHBhcnNpbmcgPSBvbmVPck1vcmVQYXJzZXIucnVuKCdhcmNvJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLmlzRmFpbHVyZSkudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcudG9TdHJpbmcoKSlcbiAgICAgICAgICAgIC50by5iZS5lcWwoJ1ZhbGlkYXRpb24uRmFpbHVyZShbbWFueTEgcGNoYXJfbSx3YW50ZWQgbTsgZ290IGEscm93PTA7Y29sPTA7cmVzdD1hcmNvXSknKTtcbiAgICB9KTtcbiAgICBpdCgnY2FuIHBhcnNlIGEgY2hhciBtYW55IHRpbWVzIGFuZCByZXR1cm4gYW4gYXJyYXknLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IG9uZU9yTW9yZVBhcnNlciA9IG1hbnkxKHBjaGFyKCdtJykpO1xuICAgICAgICBsZXQgcGFyc2luZyA9IG9uZU9yTW9yZVBhcnNlci5ydW4oJ21tbWFyY28nKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcuaXNTdWNjZXNzKS50by5iZS50cnVlO1xuICAgICAgICBleHBlY3QocGFyc2luZy50b1N0cmluZygpKS50by5iZS5lcWwoJ1ZhbGlkYXRpb24uU3VjY2VzcyhbW20sbSxtXSxyb3c9MDtjb2w9MztyZXN0PWFyY29dKScpO1xuICAgIH0pO1xuICAgIGl0KCdjYW4gcGFyc2UgYSBjaGFyIG1hbnkgdGltZXMgYW5kIHJldHVybiBhIHN0cmluZycsICgpID0+IHtcbiAgICAgICAgY29uc3Qgb25lT3JNb3JlUGFyc2VyID0gbWFueUNoYXJzMShwY2hhcignbScpKTtcbiAgICAgICAgbGV0IHBhcnNpbmcgPSBvbmVPck1vcmVQYXJzZXIucnVuKCdtbW1hcmNvJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcudG9TdHJpbmcoKSkudG8uYmUuZXFsKCdWYWxpZGF0aW9uLlN1Y2Nlc3MoW21tbSxyb3c9MDtjb2w9MztyZXN0PWFyY29dKScpO1xuICAgIH0pO1xuICAgIGl0KCdjYW5ub3QgcGFyc2UgYSBjaGFyIHNlcXVlbmNlIHplcm8gdGltZXMnLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IG9uZU9yTW9yZVBhcnNlciA9IG1hbnkxKHBzdHJpbmcoJ21hcmNvJykpO1xuICAgICAgICBsZXQgcGFyc2luZyA9IG9uZU9yTW9yZVBhcnNlci5ydW4oJ3htYXJjb21hcmNvY2lhbycpO1xuICAgICAgICBleHBlY3QocGFyc2luZy5pc0ZhaWx1cmUpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLnRvU3RyaW5nKCkpXG4gICAgICAgICAgICAudG8uYmUuZXFsKCdWYWxpZGF0aW9uLkZhaWx1cmUoW21hbnkxIHBzdHJpbmcgbWFyY28sd2FudGVkIG07IGdvdCB4LHJvdz0wO2NvbD0wO3Jlc3Q9eG1hcmNvbWFyY29jaWFvXSknKTtcbiAgICB9KTtcbiAgICBpdCgnY2FuIHBhcnNlIGEgY2hhciBzZXF1ZW5jZSBtYW55IHRpbWVzJywgKCkgPT4ge1xuICAgICAgICBjb25zdCBvbmVPck1vcmVQYXJzZXIgPSBtYW55MShwc3RyaW5nKCdtYXJjbycpKTtcbiAgICAgICAgbGV0IHBhcnNpbmcgPSBvbmVPck1vcmVQYXJzZXIucnVuKCdtYXJjb21hcmNvY2lhbycpO1xuICAgICAgICBleHBlY3QocGFyc2luZy5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLnRvU3RyaW5nKCkpXG4gICAgICAgICAgICAudG8uYmUuZXFsKCdWYWxpZGF0aW9uLlN1Y2Nlc3MoW1tbbSxhLHIsYyxvXSxbbSxhLHIsYyxvXV0scm93PTA7Y29sPTEwO3Jlc3Q9Y2lhb10pJyk7XG4gICAgfSk7XG4gICAgaXQoJ2NhbiBwYXJzZSBhbiBpbnRlZ2VyLCBubyBtYXR0ZXIgaG93IGxhcmdlLi4uJywgKCkgPT4ge1xuICAgICAgICBjb25zdCBwaW50ID0gbWFueTEoYW55T2YoZGlnaXRzKSk7XG4gICAgICAgIGxldCBwYXJzaW5nID0gcGludC5ydW4oJzEyMzQ1QScpO1xuICAgICAgICBleHBlY3QocGFyc2luZy5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgnVmFsaWRhdGlvbi5TdWNjZXNzKFtbMSwyLDMsNCw1XSxyb3c9MDtjb2w9NTtyZXN0PUFdKScpO1xuICAgICAgICBwYXJzaW5nID0gcGludC5ydW4oJzFCJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcudG9TdHJpbmcoKSkudG8uYmUuZXFsKCdWYWxpZGF0aW9uLlN1Y2Nlc3MoW1sxXSxyb3c9MDtjb2w9MTtyZXN0PUJdKScpO1xuICAgICAgICBwYXJzaW5nID0gcGludC5ydW4oJ0ExMjM0NScpO1xuICAgICAgICBleHBlY3QocGFyc2luZy5pc0ZhaWx1cmUpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLnRvU3RyaW5nKCkpXG4gICAgICAgICAgICAudG8uYmUuZXFsKCdWYWxpZGF0aW9uLkZhaWx1cmUoW21hbnkxIGFueU9mIDAxMjM0NTY3ODksX2ZhaWwsQTEyMzQ1XSknKTtcbiAgICB9KTtcbiAgICBpdCgnY2FuIHBhcnNlIGFuIGludGVnZXIgaW50byBhIHRydWUgaW50ZWdlcicsICgpID0+IHtcbiAgICAgICAgY29uc3QgcGludCA9IG1hbnkxKGFueU9mKGRpZ2l0cykpXG4gICAgICAgICAgICAuZm1hcChsID0+IHBhcnNlSW50KGwucmVkdWNlKChhY2MsIGN1cnIpID0+IGFjYyArIGN1cnIsICcnKSwgMTApKTtcbiAgICAgICAgbGV0IHBhcnNpbmcgPSBwaW50LnJ1bignMTIzNDVBJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcudmFsdWVbMF0pLnRvLmJlLmVxbCgxMjM0NSk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLnZhbHVlWzFdLnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgncm93PTA7Y29sPTU7cmVzdD1BJyk7XG4gICAgfSk7XG59KTtcblxuZGVzY3JpYmUoJ2EgcGFyc2VyIGZvciBvcHRpb25hbCBjaGFyYWN0ZXJzJywgKCkgPT4ge1xuICAgIGl0KCdjYW4gY2FwdHVyZSBvciBub3QgY2FwdHVyZSBhIGRvdCcsICgpID0+IHtcbiAgICAgICAgY29uc3Qgb3B0RG90VGhlbkEgPSBvcHQocGNoYXIoJy4nKSkuYW5kVGhlbihwY2hhcignYScpKTtcbiAgICAgICAgZXhwZWN0KG9wdERvdFRoZW5BLnJ1bignLmFiYycpLnRvU3RyaW5nKCkpXG4gICAgICAgICAgICAudG8uYmUuZXFsKCdWYWxpZGF0aW9uLlN1Y2Nlc3MoW1tNYXliZS5KdXN0KC4pLGFdLHJvdz0wO2NvbD0yO3Jlc3Q9YmNdKScpO1xuICAgICAgICBleHBlY3Qob3B0RG90VGhlbkEucnVuKCdhYmMnKS50b1N0cmluZygpKVxuICAgICAgICAgICAgLnRvLmJlLmVxbCgnVmFsaWRhdGlvbi5TdWNjZXNzKFtbTWF5YmUuTm90aGluZyxhXSxyb3c9MDtjb2w9MTtyZXN0PWJjXSknKTtcbiAgICB9KTtcbiAgICBpdCgnY2FuIGNhcHR1cmUgYSBkb3Qgb3IgcHJvdmlkZSBhIGRlZmF1bHQgYWx0ZXJuYXRpdmUnLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IG9wdERvdFdpdGhEZWZhdWx0VGhlbkEgPSBvcHQocGNoYXIoJy4nKSwgJ0FMVEVSTkFUSVZFJykuYW5kVGhlbihwY2hhcignYScpKTtcbiAgICAgICAgZXhwZWN0KG9wdERvdFdpdGhEZWZhdWx0VGhlbkEucnVuKCdhYmMnKS50b1N0cmluZygpKVxuICAgICAgICAgICAgLnRvLmJlLmVxbCgnVmFsaWRhdGlvbi5TdWNjZXNzKFtbTWF5YmUuSnVzdChBTFRFUk5BVElWRSksYV0scm93PTA7Y29sPTE7cmVzdD1iY10pJyk7XG4gICAgfSk7XG4gICAgaXQoJ2NhbiBwYXJzZSBTSUdORUQgaW50ZWdlcnMhISEnLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHBpbnQgPSBtYW55MShhbnlPZihkaWdpdHMpKVxuICAgICAgICAgICAgLmZtYXAobCA9PiBwYXJzZUludChsLnJlZHVjZSgoYWNjLCBjdXJyKSA9PiBhY2MgKyBjdXJyLCAnJyksIDEwKSk7XG4gICAgICAgIGNvbnN0IHBTaWduZWRJbnQgPSBvcHQocGNoYXIoJy0nKSlcbiAgICAgICAgICAgIC5hbmRUaGVuKHBpbnQpXG4gICAgICAgICAgICAuZm1hcChvcHRTaWduTnVtYmVyUGFpciA9PiAob3B0U2lnbk51bWJlclBhaXJbMF0uaXNKdXN0KSA/IC1vcHRTaWduTnVtYmVyUGFpclsxXSA6IG9wdFNpZ25OdW1iZXJQYWlyWzFdKTtcbiAgICAgICAgZXhwZWN0KHBTaWduZWRJbnQucnVuKCcxMzI0MzU0NngnKS52YWx1ZVswXSkudG8uYmUuZXFsKDEzMjQzNTQ2KTtcbiAgICAgICAgZXhwZWN0KHBTaWduZWRJbnQucnVuKCctMTMyNDM1NDZ4JykudmFsdWVbMF0pLnRvLmJlLmVxbCgtMTMyNDM1NDYpO1xuICAgIH0pO1xuICAgIGl0KCdjYW4gY2FwdHVyZSBvciBub3QgY2FwdHVyZSBhIHdob2xlIHN1YnN0cmluZycsICgpID0+IHtcbiAgICAgICAgY29uc3Qgb3B0U3Vic3RyaW5nID0gb3B0KHBzdHJpbmcoJ21hcmNvJykpLmFuZFRoZW4ocHN0cmluZygnZmF1c3RpbmVsbGknKSk7XG4gICAgICAgIGV4cGVjdChvcHRTdWJzdHJpbmcucnVuKCdtYXJjb2ZhdXN0aW5lbGxpeCcpLnRvU3RyaW5nKCkpXG4gICAgICAgICAgICAudG8uYmUuZXFsKCdWYWxpZGF0aW9uLlN1Y2Nlc3MoW1tNYXliZS5KdXN0KFttLGEscixjLG9dKSxbZixhLHUscyx0LGksbixlLGwsbCxpXV0scm93PTA7Y29sPTE2O3Jlc3Q9eF0pJyk7XG4gICAgICAgIGV4cGVjdChvcHRTdWJzdHJpbmcucnVuKCdmYXVzdGluZWxsaXgnKS50b1N0cmluZygpKVxuICAgICAgICAgICAgLnRvLmJlLmVxbCgnVmFsaWRhdGlvbi5TdWNjZXNzKFtbTWF5YmUuTm90aGluZyxbZixhLHUscyx0LGksbixlLGwsbCxpXV0scm93PTA7Y29sPTExO3Jlc3Q9eF0pJyk7XG4gICAgfSk7XG59KTtcblxuZGVzY3JpYmUoJ2EgY291cGxlIG9mIHBhcnNlcnMnLCAoKSA9PiB7XG4gICAgaXQoJ2NhbiBkZWNpZGUgdG8gZGlzY2FyZCB0aGUgbWF0Y2hlcyBvZiB0aGUgZmlyc3Qgb25lJywgKCkgPT4ge1xuICAgICAgICBjb25zdCBkaXNjYXJkSW50ZWdlclNpZ24gPSBwY2hhcignLScpLmRpc2NhcmRGaXJzdChwZGlnaXQoOCkpO1xuICAgICAgICBsZXQgcGFyc2luZyA9IGRpc2NhcmRJbnRlZ2VyU2lnbi5ydW4oJy04eCcpO1xuICAgICAgICBleHBlY3QocGFyc2luZy50b1N0cmluZygpKS50by5iZS5lcWwoJ1ZhbGlkYXRpb24uU3VjY2VzcyhbOCxyb3c9MDtjb2w9MjtyZXN0PXhdKScpO1xuICAgIH0pO1xuICAgIGl0KCdjYW4gZGVjaWRlIHRvIGRpc2NhcmQgdGhlIG1hdGNoZXMgb2YgdGhlIHNlY29uZCBvbmUnLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IGRpc2NhcmRTdWZmaXggPSBwc3RyaW5nKCdtYXJjbycpLmRpc2NhcmRTZWNvbmQobWFueTEoYW55T2Yod2hpdGVzKSkpO1xuICAgICAgICBsZXQgcGFyc2luZyA9IGRpc2NhcmRTdWZmaXgucnVuKCdtYXJjbyBmYXVzdGluZWxsaScpO1xuICAgICAgICBleHBlY3QocGFyc2luZy50b1N0cmluZygpKS50by5iZS5lcWwoJ1ZhbGlkYXRpb24uU3VjY2VzcyhbW20sYSxyLGMsb10scm93PTA7Y29sPTY7cmVzdD1mYXVzdGluZWxsaV0pJyk7XG4gICAgICAgIHBhcnNpbmcgPSBkaXNjYXJkU3VmZml4LnJ1bignbWFyY28gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZhdXN0aW5lbGxpJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgnVmFsaWRhdGlvbi5TdWNjZXNzKFtbbSxhLHIsYyxvXSxyb3c9MDtjb2w9Mzc7cmVzdD1mYXVzdGluZWxsaV0pJyk7XG4gICAgfSk7XG59KTtcblxuZGVzY3JpYmUoJ2EgdGFwcGVyIGZvciBwYXJzZXJzJywgKCkgPT4ge1xuICAgIGl0KCdjYW4gZG8gdGhpbmdzIHdpdGggYSByZXN1bHQgdGhhdFxcJ3MgZ29pbmcgdG8gYmUgZGlzY2FyZGVkJywgKCkgPT4ge1xuICAgICAgICBjb25zdCB0YXBJbnRvRGlzY2FyZEludGVnZXJTaWduID0gdGFwUChwY2hhcignLScpLCByZXMgPT4ge1xuICAgICAgICAgICAgZXhwZWN0KHJlcykudG8uYmUuZXFsKCctJyk7XG4gICAgICAgIH0pLmRpc2NhcmRGaXJzdChwZGlnaXQoOCkpO1xuICAgICAgICBsZXQgcGFyc2luZyA9IHRhcEludG9EaXNjYXJkSW50ZWdlclNpZ24ucnVuKCctOHgnKTtcbiAgICB9KTtcbn0pO1xuXG5kZXNjcmliZSgnYSBsb2dnZXIgZm9yIHBhcnNlcnMnLCAoKSA9PiB7XG4gICAgbGV0IHN0b3JlZExvZyA9IGNvbnNvbGUubG9nO1xuICAgIGl0KCdjYW4gbG9nIGludGVybWVkaWF0ZSBwYXJzaW5nIHJlc3VsdHMnLCAoKSA9PiB7XG4gICAgICAgIGNvbnNvbGUubG9nID0gbXNnID0+IHtcbiAgICAgICAgICAgIGV4cGVjdChtc2cpLnRvLmJlLmVxbCgncGNoYXJfLTotJyk7XG4gICAgICAgIH07XG4gICAgICAgIGNvbnN0IGxvZ0ludGVybWVkaWF0ZVJlc3VsdCA9IGxvZ1AocGNoYXIoJy0nKSlcbiAgICAgICAgICAgIC5kaXNjYXJkRmlyc3QocGRpZ2l0KDgpKTtcbiAgICAgICAgbGV0IHBhcnNpbmcgPSBsb2dJbnRlcm1lZGlhdGVSZXN1bHQucnVuKCctOHgnKTtcbiAgICB9KTtcbiAgICBpdCgnY2FuIGxvZyBhIHJlc3VsdCB0aGF0XFwncyBnb2luZyB0byBiZSBkaXNjYXJkZWQnLCAoKSA9PiB7XG4gICAgICAgIGNvbnNvbGUubG9nID0gbXNnID0+IHtcbiAgICAgICAgICAgIGV4cGVjdChtc2cpLnRvLmJlLmVxbCgnbWFueTEgYW55T2YgIFxcdFxcblxccjpbICwgXScpO1xuICAgICAgICB9O1xuICAgICAgICBjb25zdCBkaXNjYXJkU3VmZml4ID0gcHN0cmluZygnbWFyY28nKS5kaXNjYXJkU2Vjb25kKGxvZ1AobWFueTEoYW55T2Yod2hpdGVzKSkpKTtcbiAgICAgICAgbGV0IHBhcnNpbmcgPSBkaXNjYXJkU3VmZml4LnJ1bignbWFyY28gIGZhdXN0aW5lbGxpJyk7XG4gICAgfSk7XG4gICAgY29uc29sZS5sb2cgPSBzdG9yZWRMb2c7XG59KTtcblxuZGVzY3JpYmUoJ3BhcnNpbmcgd2hpbGUgZGlzY2FyZGluZyBpbnB1dCcsICgpID0+IHtcbiAgICBpdCgnYWxsb3dzIHRvIGV4Y2x1ZGUgcGFyZW50aGVzZXMnLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IGluc2lkZVBhcmVucyA9IHBjaGFyKCcoJylcbiAgICAgICAgICAgIC5kaXNjYXJkRmlyc3QobWFueShhbnlPZihsb3dlcmNhc2VzKSkpXG4gICAgICAgICAgICAuZGlzY2FyZFNlY29uZChwY2hhcignKScpKTtcbiAgICAgICAgZXhwZWN0KGluc2lkZVBhcmVucy5ydW4oJyhtYXJjbyknKS50b1N0cmluZygpKVxuICAgICAgICAgICAgLnRvLmJlLmVxbCgnVmFsaWRhdGlvbi5TdWNjZXNzKFtbbSxhLHIsYyxvXSxyb3c9MTtjb2w9MDtyZXN0PV0pJyk7XG4gICAgICAgIGV4cGVjdChpbnNpZGVQYXJlbnMucnVuKCcoKScpLnRvU3RyaW5nKCkpXG4gICAgICAgICAgICAudG8uYmUuZXFsKCdWYWxpZGF0aW9uLlN1Y2Nlc3MoW1tdLHJvdz0xO2NvbD0wO3Jlc3Q9XSknKTtcbiAgICB9KTtcbiAgICBpdCgnLi4uZXZlbiB1c2luZyBhIHRhaWxvci1tYWRlIG1ldGhvZCcsICgpID0+IHtcbiAgICAgICAgY29uc3QgaW5zaWRlUGFyZW5zID0gYmV0d2VlblBhcmVucyhwc3RyaW5nKCdtYXJjbycpKTtcbiAgICAgICAgZXhwZWN0KGluc2lkZVBhcmVucy5ydW4oJyhtYXJjbyknKS50b1N0cmluZygpKVxuICAgICAgICAgICAgLnRvLmJlLmVxbCgnVmFsaWRhdGlvbi5TdWNjZXNzKFtbbSxhLHIsYyxvXSxyb3c9MTtjb2w9MDtyZXN0PV0pJyk7XG4gICAgfSk7XG4gICAgaXQoJ2NoZXJyeS1waWNraW5nIGVsZW1lbnRzIHNlcGFyYXRlZCBieSBzZXBhcmF0b3JzJywgKCkgPT4ge1xuICAgICAgICBjb25zdCBzdWJzdHJpbmdzV2l0aENvbW1hcyA9IG1hbnkobWFueTEoYW55T2YobG93ZXJjYXNlcykpLmRpc2NhcmRTZWNvbmQocGNoYXIoJywnKSkpO1xuICAgICAgICBleHBlY3Qoc3Vic3RyaW5nc1dpdGhDb21tYXMucnVuKCdhLGIsY2QsMScpLnRvU3RyaW5nKCkpXG4gICAgICAgICAgICAudG8uYmUuZXFsKCdWYWxpZGF0aW9uLlN1Y2Nlc3MoW1tbYV0sW2JdLFtjLGRdXSxyb3c9MDtjb2w9NztyZXN0PTFdKScpO1xuICAgIH0pO1xuICAgIGl0KCcuLi5hbHNvIHdoZW4gaW5zaWRlIGEgbGlzdHMnLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHN1YnN0cmluZ3NXaXRoQ29tbWFzID0gbWFueShtYW55MShhbnlPZihsb3dlcmNhc2VzKSkuZGlzY2FyZFNlY29uZChwY2hhcignLCcpKSk7XG4gICAgICAgIGNvbnN0IGxpc3RFbGVtZW50cyA9IGJldHdlZW4ocGNoYXIoJ1snKSwgc3Vic3RyaW5nc1dpdGhDb21tYXMsIHBjaGFyKCddJykpO1xuICAgICAgICBleHBlY3QobGlzdEVsZW1lbnRzLnJ1bignW2EsYixjZCxtYXJjbyxdMScpLnRvU3RyaW5nKCkpXG4gICAgICAgICAgICAudG8uYmUuZXFsKCdWYWxpZGF0aW9uLlN1Y2Nlc3MoW1tbYV0sW2JdLFtjLGRdLFttLGEscixjLG9dXSxyb3c9MDtjb2w9MTU7cmVzdD0xXSknKTtcbiAgICB9KTtcbiAgICBkZXNjcmliZSgndGhhbmtzIHRvIHRoZSBzcGVjaWZpYyBzZXBCeTEgb3BlcmF0b3InLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHZhbHVlc1AgPSBhbnlPZihsb3dlcmNhc2VzKTtcbiAgICAgICAgY29uc3QgY29tbWFQID0gcGNoYXIoJywnKTtcbiAgICAgICAgaXQoJ2NoZXJyeS1waWNraW5nIGVsZW1lbnRzIHNlcGFyYXRlZCBieSBzZXBhcmF0b3JzJywgKCkgPT4ge1xuICAgICAgICAgICAgZXhwZWN0KHNlcEJ5MSh2YWx1ZXNQLCBjb21tYVApLnJ1bignYSxiLGNkLDEnKS50b1N0cmluZygpKVxuICAgICAgICAgICAgICAgIC50by5iZS5lcWwoJ1ZhbGlkYXRpb24uU3VjY2VzcyhbW1thXSxbYl0sW2MsZF1dLHJvdz0wO2NvbD03O3Jlc3Q9MV0pJyk7XG4gICAgICAgIH0pO1xuICAgICAgICBpdCgnLi4uYWxzbyB3aGVuIGluc2lkZSBhIGxpc3RzJywgKCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgbGlzdEVsZW1lbnRzID0gYmV0d2VlbihwY2hhcignWycpLCBzZXBCeTEodmFsdWVzUCwgY29tbWFQKSwgcGNoYXIoJ10nKSk7XG4gICAgICAgICAgICBleHBlY3QobGlzdEVsZW1lbnRzLnJ1bignW2EsYixjZCxtYXJjbyxdJykudG9TdHJpbmcoKSlcbiAgICAgICAgICAgICAgICAudG8uYmUuZXFsKCdWYWxpZGF0aW9uLlN1Y2Nlc3MoW1tbYV0sW2JdLFtjLGRdLFttLGEscixjLG9dXSxyb3c9MTtjb2w9MDtyZXN0PV0pJyk7XG4gICAgICAgIH0pO1xuICAgICAgICBpdCgnLi4ubGlzdHMgd2l0aCBubyBlbGVtZW50cycsICgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGxpc3RFbGVtZW50cyA9IGJldHdlZW4ocGNoYXIoJ1snKSwgc2VwQnkxKHZhbHVlc1AsIGNvbW1hUCksIHBjaGFyKCddJykpO1xuICAgICAgICAgICAgZXhwZWN0KGxpc3RFbGVtZW50cy5ydW4oJ1tdJykudG9TdHJpbmcoKSlcbiAgICAgICAgICAgICAgICAudG8uYmUuZXFsKCdWYWxpZGF0aW9uLlN1Y2Nlc3MoW1tdLHJvdz0xO2NvbD0wO3Jlc3Q9XSknKTtcbiAgICAgICAgfSk7XG4gICAgICAgIGl0KCcuLi5saXN0cyB3aXRoIGp1c3Qgb25lIGVsZW1lbnQnLCAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBsaXN0RWxlbWVudHMgPSBiZXR3ZWVuKHBjaGFyKCdbJyksIHNlcEJ5MSh2YWx1ZXNQLCBjb21tYVApLCBwY2hhcignXScpKTtcbiAgICAgICAgICAgIGV4cGVjdChsaXN0RWxlbWVudHMucnVuKCdbYV0nKS50b1N0cmluZygpKVxuICAgICAgICAgICAgICAgIC50by5iZS5lcWwoJ1ZhbGlkYXRpb24uU3VjY2VzcyhbW1thXV0scm93PTE7Y29sPTA7cmVzdD1dKScpO1xuICAgICAgICB9KTtcbiAgICB9KTtcbn0pO1xuIl19