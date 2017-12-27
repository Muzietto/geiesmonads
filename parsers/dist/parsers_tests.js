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

    describe('a parser for optional characters', function () {
        it('can capture or not capture a dot', function () {
            var optDotThenA = (0, _parsers.opt)((0, _parsers.pchar)('.')).andThen((0, _parsers.pchar)('a'));
            (0, _chai.expect)(optDotThenA.run('.abc').toString()).to.be.eql('Validation.Success([[Maybe.Just(.),a],row=0;col=2;rest=bc])');
            (0, _chai.expect)(optDotThenA.run('abc').toString()).to.be.eql('Validation.Success([[Maybe.Nothing,a],row=0;col=1;rest=bc])');
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

    describe('a parser for one or more occurrences', function () {
        it('cannot parse a char zero times', function () {
            var oneOrMoreParser = (0, _parsers.many1)((0, _parsers.pchar)('m'));
            var parsing = oneOrMoreParser.run('arco');
            (0, _chai.expect)(parsing.isFailure).to.be.true;
            (0, _chai.expect)(parsing.toString()).to.be.eql('Validation.Failure([many1 pchar_m,wanted m; got a,row=0;col=0;rest=arco])');
        });
        it('can parse a char many times', function () {
            var oneOrMoreParser = (0, _parsers.many1)((0, _parsers.pchar)('m'));
            var parsing = oneOrMoreParser.run('mmmarco');
            (0, _chai.expect)(parsing.isSuccess).to.be.true;
            (0, _chai.expect)(parsing.toString()).to.be.eql('Validation.Success([[m,m,m],row=0;col=3;rest=arco])');
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

    describe('a parser for zero or more occurrences', function () {
        it('can parse a char zero times', function () {
            var zeroOrMoreParser = (0, _parsers.many)((0, _parsers.pchar)('m'));
            var parsing = zeroOrMoreParser.run(text('arco'));
            (0, _chai.expect)(parsing.isSuccess).to.be.true;
            (0, _chai.expect)(parsing.toString()).to.be.eql('Validation.Success([[],row=0;col=0;rest=arco])');
        });
        it('can parse a char many times', function () {
            var zeroOrMoreParser = (0, _parsers.many)((0, _parsers.pchar)('m'));
            var parsing = zeroOrMoreParser.run(text('mmmarco'));
            (0, _chai.expect)(parsing.isSuccess).to.be.true;
            (0, _chai.expect)(parsing.toString()).to.be.eql('Validation.Success([[m,m,m],row=0;col=3;rest=arco])');
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

    describe('a parser for a specific word', function () {
        it('is easy to create with sequenceP', function () {
            var marcoParser = (0, _parsers.pstring)('marco');
            var marcoParsing = marcoParser.run('marcociao');
            (0, _chai.expect)(marcoParsing.isSuccess).to.be.true;
            (0, _chai.expect)(marcoParsing.toString()).to.be.eql('Validation.Success([[m,a,r,c,o],row=0;col=5;rest=ciao])');
        });
    });

    describe('sequences of parsers based on lift2(cons) (aka sequenceP)', function () {
        it('stores matched chars inside an array', function () {
            var abcParser = (0, _parsers.sequenceP)([(0, _parsers.pchar)('a'), (0, _parsers.pchar)('b'), (0, _parsers.pchar)('c')]);
            (0, _chai.expect)(abcParser.run('abc').toString()).to.be.eql('Validation.Success([[a,b,c],row=1;col=0;rest=])');
        });
    });

    describe('sequences of parsers based on andThen && fmap (aka sequenceP2)', function () {
        it('store matched chars inside a plain string', function () {
            var abcParser = (0, _parsers.sequenceP2)([(0, _parsers.pchar)('a'), (0, _parsers.pchar)('b'), (0, _parsers.pchar)('c')]);
            (0, _chai.expect)(abcParser.run('abc').toString()).to.be.eql('Validation.Success([abc,row=1;col=0;rest=])');
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
            var unpacker = function unpacker(_ref) {
                var _ref2 = _slicedToArray(_ref, 2),
                    x = _ref2[0],
                    _ref2$ = _slicedToArray(_ref2[1], 2),
                    y = _ref2$[0],
                    z = _ref2$[1];

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

    describe('parse ABC', function () {
        it('parses ABC', function () {
            var pairAdder = function pairAdder(_ref3) {
                var _ref4 = _slicedToArray(_ref3, 2),
                    x = _ref4[0],
                    y = _ref4[1];

                return x + y;
            };
            var abcP = (0, _parsers.andThen)((0, _parsers.pchar)('a'), (0, _parsers.andThen)((0, _parsers.pchar)('b'), (0, _parsers.andThen)((0, _parsers.pchar)('c'), (0, _parsers.returnP)('')).fmap(pairAdder)).fmap(pairAdder)).fmap(pairAdder);
            var parsing = abcP.run('abcd');
            (0, _chai.expect)(parsing.isSuccess).to.be.true;
            (0, _chai.expect)(parsing.value[0].toString()).to.be.eql('abc');
            (0, _chai.expect)(parsing.value[1].rest()).to.be.eql('d');
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
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2pzLXNwZWMvcGFyc2Vyc190ZXN0cy5qcyJdLCJuYW1lcyI6WyJsb3dlcmNhc2VzIiwidXBwZXJjYXNlcyIsImRpZ2l0cyIsIndoaXRlcyIsInRleHQiLCJmcm9tVGV4dCIsImRlc2NyaWJlIiwiaXQiLCJpbnNpZGVQYXJlbnMiLCJkaXNjYXJkRmlyc3QiLCJkaXNjYXJkU2Vjb25kIiwicnVuIiwidG9TdHJpbmciLCJ0byIsImJlIiwiZXFsIiwic3Vic3RyaW5nc1dpdGhDb21tYXMiLCJsaXN0RWxlbWVudHMiLCJkaXNjYXJkSW50ZWdlclNpZ24iLCJwYXJzaW5nIiwiZGlzY2FyZFN1ZmZpeCIsIm9wdERvdFRoZW5BIiwiYW5kVGhlbiIsInBpbnQiLCJmbWFwIiwicGFyc2VJbnQiLCJsIiwicmVkdWNlIiwiYWNjIiwiY3VyciIsInBTaWduZWRJbnQiLCJvcHRTaWduTnVtYmVyUGFpciIsImlzSnVzdCIsInZhbHVlIiwib3B0U3Vic3RyaW5nIiwib25lT3JNb3JlUGFyc2VyIiwiaXNGYWlsdXJlIiwidHJ1ZSIsImlzU3VjY2VzcyIsInplcm9Pck1vcmVQYXJzZXIiLCJ3aGl0ZXNQYXJzZXIiLCJ0d29Xb3JkcyIsInplcm9Pck1vcmVQYXJzaW5nRnVuY3Rpb24iLCJtYXJjb1BhcnNlciIsIm1hcmNvUGFyc2luZyIsImFiY1BhcnNlciIsImFkZFN0cmluZ3MiLCJ4IiwieSIsIkFwbHVzQiIsImFkZERpZ2l0cyIsImFkZFBhcnNlciIsInBhcnNlRGlnaXQiLCJ0aHJlZURpZ2l0cyIsImJlZm9yZSIsInJlc3QiLCJ1bnBhY2tlciIsInoiLCJ0aHJlZURpZ2l0c0ltcGwiLCJ0aHJlZURpZ2l0c0luc3QiLCJwYWlyQWRkZXIiLCJhYmNQIiwibG93ZXJjYXNlc1BhcnNlciIsInBhcnNpbmdDaG9pY2UiLCJ1cHBlcmNhc2VzUGFyc2VyIiwiZGlnaXRzUGFyc2VyIiwicGFyc2Vyc0Nob2ljZSIsInBhcnNlckFvckIiLCJwYXJzaW5nQW9yQiIsInBhcnNlckFhbmRCIiwicGFyc2luZ0FhbmRCIiwicGFyc2VyQSIsInBhcnNpbmdBIiwicGFyc2luZ0IiLCJwYXJzZXIxIiwicGFyc2luZzEiLCJwYXJzaW5nMiIsInBhcnNpbmczIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQXVDQSxRQUFNQSxhQUFhLENBQUMsR0FBRCxFQUFNLEdBQU4sRUFBVyxHQUFYLEVBQWdCLEdBQWhCLEVBQXFCLEdBQXJCLEVBQTBCLEdBQTFCLEVBQStCLEdBQS9CLEVBQW9DLEdBQXBDLEVBQXlDLEdBQXpDLEVBQThDLEdBQTlDLEVBQW1ELEdBQW5ELEVBQXdELEdBQXhELEVBQTZELEdBQTdELEVBQWtFLEdBQWxFLEVBQXVFLEdBQXZFLEVBQTRFLEdBQTVFLEVBQWlGLEdBQWpGLEVBQXNGLEdBQXRGLEVBQTJGLEdBQTNGLEVBQWdHLEdBQWhHLEVBQXFHLEdBQXJHLEVBQTBHLEdBQTFHLEVBQStHLEdBQS9HLEVBQW9ILEdBQXBILEVBQXlILEdBQXpILEVBQThILEdBQTlILENBQW5CO0FBQ0EsUUFBTUMsYUFBYSxDQUFDLEdBQUQsRUFBTSxHQUFOLEVBQVcsR0FBWCxFQUFnQixHQUFoQixFQUFxQixHQUFyQixFQUEwQixHQUExQixFQUErQixHQUEvQixFQUFvQyxHQUFwQyxFQUF5QyxHQUF6QyxFQUE4QyxHQUE5QyxFQUFtRCxHQUFuRCxFQUF3RCxHQUF4RCxFQUE2RCxHQUE3RCxFQUFrRSxHQUFsRSxFQUF1RSxHQUF2RSxFQUE0RSxHQUE1RSxFQUFpRixHQUFqRixFQUFzRixHQUF0RixFQUEyRixHQUEzRixFQUFnRyxHQUFoRyxFQUFxRyxHQUFyRyxFQUEwRyxHQUExRyxFQUErRyxHQUEvRyxFQUFvSCxHQUFwSCxFQUF5SCxHQUF6SCxFQUE4SCxHQUE5SCxDQUFuQjtBQUNBLFFBQU1DLFNBQVMsQ0FBQyxHQUFELEVBQU0sR0FBTixFQUFXLEdBQVgsRUFBZ0IsR0FBaEIsRUFBcUIsR0FBckIsRUFBMEIsR0FBMUIsRUFBK0IsR0FBL0IsRUFB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LEVBQTdCLENBQWdDQyxHQUFoQyxDQUFvQyxhQUFwQztBQUNBLDhCQUFPNkQsU0FBUzNDLEtBQVQsQ0FBZSxDQUFmLENBQVAsRUFBMEJwQixFQUExQixDQUE2QkMsRUFBN0IsQ0FBZ0NDLEdBQWhDLENBQW9DLGlCQUFwQztBQUNBLDhCQUFPNkQsU0FBUzNDLEtBQVQsQ0FBZSxDQUFmLEVBQWtCc0IsSUFBbEIsRUFBUCxFQUFpQzFDLEVBQWpDLENBQW9DQyxFQUFwQyxDQUF1Q0MsR0FBdkMsQ0FBMkMsS0FBM0M7QUFDQSw4QkFBTzZELFNBQVN4QyxTQUFoQixFQUEyQnZCLEVBQTNCLENBQThCQyxFQUE5QixDQUFpQ3VCLElBQWpDO0FBQ0gsU0FORDs7QUFRQTlCLFdBQUcsNkRBQUgsRUFBa0UsWUFBTTtBQUNwRSxnQkFBTXNFLFdBQVdILFFBQVF0RSxLQUFLLEVBQUwsQ0FBUixDQUFqQjtBQUNBLDhCQUFPeUUsU0FBUzVDLEtBQVQsQ0FBZSxDQUFmLENBQVAsRUFBMEJwQixFQUExQixDQUE2QkMsRUFBN0IsQ0FBZ0NDLEdBQWhDLENBQW9DLGFBQXBDO0FBQ0EsOEJBQU84RCxTQUFTNUMsS0FBVCxDQUFlLENBQWYsQ0FBUCxFQUEwQnBCLEVBQTFCLENBQTZCQyxFQUE3QixDQUFnQ0MsR0FBaEMsQ0FBb0MsZUFBcEM7QUFDQSw4QkFBTzhELFNBQVM1QyxLQUFULENBQWUsQ0FBZixFQUFrQnNCLElBQWxCLEVBQVAsRUFBaUMxQyxFQUFqQyxDQUFvQ0MsRUFBcEMsQ0FBdUNDLEdBQXZDLENBQTJDLEVBQTNDO0FBQ0EsOEJBQU84RCxTQUFTekMsU0FBaEIsRUFBMkJ2QixFQUEzQixDQUE4QkMsRUFBOUIsQ0FBaUN1QixJQUFqQztBQUNILFNBTkQ7QUFPSCxLQWpERCIsImZpbGUiOiJwYXJzZXJzX3Rlc3RzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtleHBlY3R9IGZyb20gJ2NoYWknO1xuaW1wb3J0IHtcbiAgICBjaGFyUGFyc2VyLFxuICAgIGRpZ2l0UGFyc2VyLFxuICAgIHBjaGFyLFxuICAgIHBkaWdpdCxcbiAgICBhbmRUaGVuLFxuICAgIG9yRWxzZSxcbiAgICBjaG9pY2UsXG4gICAgYW55T2YsXG4gICAgZm1hcCxcbiAgICByZXR1cm5QLFxuICAgIGFwcGx5UCxcbiAgICBsaWZ0MixcbiAgICBzZXF1ZW5jZVAsXG4gICAgc2VxdWVuY2VQMixcbiAgICBwc3RyaW5nLFxuICAgIHplcm9Pck1vcmUsXG4gICAgbWFueSxcbiAgICBtYW55MSxcbiAgICBvcHQsXG4gICAgb3B0Qm9vayxcbiAgICBkaXNjYXJkRmlyc3QsXG4gICAgZGlzY2FyZFNlY29uZCxcbiAgICBiZXR3ZWVuLFxuICAgIGJldHdlZW5QYXJlbnMsXG59IGZyb20gJ3BhcnNlcnMnO1xuaW1wb3J0IHtcbiAgICBpc1BhaXIsXG4gICAgaXNTdWNjZXNzLFxuICAgIGlzRmFpbHVyZSxcbiAgICBpc1BhcnNlcixcbiAgICBpc1NvbWUsXG4gICAgaXNOb25lLFxufSBmcm9tICd1dGlsJztcbmltcG9ydCB7TWF5YmV9IGZyb20gJ21heWJlJztcbmltcG9ydCB7VmFsaWRhdGlvbn0gZnJvbSAndmFsaWRhdGlvbic7XG5pbXBvcnQge1Bvc2l0aW9ufSBmcm9tICdjbGFzc2VzJztcblxuY29uc3QgbG93ZXJjYXNlcyA9IFsnYScsICdiJywgJ2MnLCAnZCcsICdlJywgJ2YnLCAnZycsICdoJywgJ2knLCAnaicsICdrJywgJ2wnLCAnbScsICduJywgJ28nLCAncCcsICdxJywgJ3InLCAncycsICd0JywgJ3UnLCAndicsICd3JywgJ3gnLCAneScsICd6JyxdO1xuY29uc3QgdXBwZXJjYXNlcyA9IFsnQScsICdCJywgJ0MnLCAnRCcsICdFJywgJ0YnLCAnRycsICdIJywgJ0knLCAnSicsICdLJywgJ0wnLCAnTScsICdOJywgJ08nLCAnUCcsICdRJywgJ1InLCAnUycsICdUJywgJ1UnLCAnVicsICdXJywgJ1gnLCAnWScsICdaJyxdO1xuY29uc3QgZGlnaXRzID0gWycwJywgJzEnLCAnMicsICczJywgJzQnLCAnNScsICc2JywgJzcnLCAnOCcsICc5J107XG5jb25zdCB3aGl0ZXMgPSBbJyAnLCAnXFx0JywgJ1xcbicsICdcXHInXTtcbmNvbnN0IHRleHQgPSBQb3NpdGlvbi5mcm9tVGV4dDtcblxuZGVzY3JpYmUoJ3BhcnNpbmcgd2hpbGUgZGlzY2FyZGluZyBpbnB1dCcsICgpID0+IHtcbiAgICBpdCgnYWxsb3dzIHRvIGV4Y2x1ZGUgcGFyZW50aGVzZXMnLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IGluc2lkZVBhcmVucyA9IHBjaGFyKCcoJylcbiAgICAgICAgICAgIC5kaXNjYXJkRmlyc3QobWFueShhbnlPZihsb3dlcmNhc2VzKSkpXG4gICAgICAgICAgICAuZGlzY2FyZFNlY29uZChwY2hhcignKScpKTtcbiAgICAgICAgZXhwZWN0KGluc2lkZVBhcmVucy5ydW4oJyhtYXJjbyknKS50b1N0cmluZygpKVxuICAgICAgICAgICAgLnRvLmJlLmVxbCgnVmFsaWRhdGlvbi5TdWNjZXNzKFtbbSxhLHIsYyxvXSxyb3c9MTtjb2w9MDtyZXN0PV0pJyk7XG4gICAgICAgIGV4cGVjdChpbnNpZGVQYXJlbnMucnVuKCcoKScpLnRvU3RyaW5nKCkpXG4gICAgICAgICAgICAudG8uYmUuZXFsKCdWYWxpZGF0aW9uLlN1Y2Nlc3MoW1tdLHJvdz0xO2NvbD0wO3Jlc3Q9XSknKTtcbiAgICB9KTtcbiAgICBpdCgnLi4uZXZlbiB1c2luZyBhIHRhaWxvci1tYWRlIG1ldGhvZCcsICgpID0+IHtcbiAgICAgICAgY29uc3QgaW5zaWRlUGFyZW5zID0gYmV0d2VlblBhcmVucyhwc3RyaW5nKCdtYXJjbycpKTtcbiAgICAgICAgZXhwZWN0KGluc2lkZVBhcmVucy5ydW4oJyhtYXJjbyknKS50b1N0cmluZygpKVxuICAgICAgICAgICAgLnRvLmJlLmVxbCgnVmFsaWRhdGlvbi5TdWNjZXNzKFtbbSxhLHIsYyxvXSxyb3c9MTtjb2w9MDtyZXN0PV0pJyk7XG4gICAgfSk7XG4gICAgaXQoJ2NoZXJyeS1waWNraW5nIGVsZW1lbnRzIHNlcGFyYXRlZCBieSBzZXBhcmF0b3JzJywgKCkgPT4ge1xuICAgICAgICBjb25zdCBzdWJzdHJpbmdzV2l0aENvbW1hcyA9IG1hbnkobWFueTEoYW55T2YobG93ZXJjYXNlcykpLmRpc2NhcmRTZWNvbmQocGNoYXIoJywnKSkpO1xuICAgICAgICBleHBlY3Qoc3Vic3RyaW5nc1dpdGhDb21tYXMucnVuKCdhLGIsY2QsMScpLnRvU3RyaW5nKCkpXG4gICAgICAgICAgICAudG8uYmUuZXFsKCdWYWxpZGF0aW9uLlN1Y2Nlc3MoW1tbYV0sW2JdLFtjLGRdXSxyb3c9MDtjb2w9NztyZXN0PTFdKScpO1xuICAgIH0pO1xuICAgIGl0KCcuLi5hbHNvIHdoZW4gaW5zaWRlIGEgbGlzdHMnLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHN1YnN0cmluZ3NXaXRoQ29tbWFzID0gbWFueShtYW55MShhbnlPZihsb3dlcmNhc2VzKSkuZGlzY2FyZFNlY29uZChwY2hhcignLCcpKSk7XG4gICAgICAgIGNvbnN0IGxpc3RFbGVtZW50cyA9IGJldHdlZW4ocGNoYXIoJ1snKSwgc3Vic3RyaW5nc1dpdGhDb21tYXMsIHBjaGFyKCddJykpO1xuICAgICAgICBleHBlY3QobGlzdEVsZW1lbnRzLnJ1bignW2EsYixjZCxtYXJjbyxdMScpLnRvU3RyaW5nKCkpXG4gICAgICAgICAgICAudG8uYmUuZXFsKCdWYWxpZGF0aW9uLlN1Y2Nlc3MoW1tbYV0sW2JdLFtjLGRdLFttLGEscixjLG9dXSxyb3c9MDtjb2w9MTU7cmVzdD0xXSknKTtcbiAgICB9KTtcbn0pO1xuXG5kZXNjcmliZSgnYSBjb3VwbGUgb2YgcGFyc2VycycsICgpID0+IHtcbiAgICBpdCgnY2FuIGRlY2lkZSB0byBkaXNjYXJkIHRoZSBtYXRjaGVzIG9mIHRoZSBmaXJzdCBvbmUnLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IGRpc2NhcmRJbnRlZ2VyU2lnbiA9IHBjaGFyKCctJykuZGlzY2FyZEZpcnN0KHBkaWdpdCg4KSk7XG4gICAgICAgIGxldCBwYXJzaW5nID0gZGlzY2FyZEludGVnZXJTaWduLnJ1bignLTh4Jyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgnVmFsaWRhdGlvbi5TdWNjZXNzKFs4LHJvdz0wO2NvbD0yO3Jlc3Q9eF0pJyk7XG4gICAgfSk7XG4gICAgaXQoJ2NhbiBkZWNpZGUgdG8gZGlzY2FyZCB0aGUgbWF0Y2hlcyBvZiB0aGUgc2Vjb25kIG9uZScsICgpID0+IHtcbiAgICAgICAgY29uc3QgZGlzY2FyZFN1ZmZpeCA9IHBzdHJpbmcoJ21hcmNvJykuZGlzY2FyZFNlY29uZChtYW55MShhbnlPZih3aGl0ZXMpKSk7XG4gICAgICAgIGxldCBwYXJzaW5nID0gZGlzY2FyZFN1ZmZpeC5ydW4oJ21hcmNvIGZhdXN0aW5lbGxpJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgnVmFsaWRhdGlvbi5TdWNjZXNzKFtbbSxhLHIsYyxvXSxyb3c9MDtjb2w9NjtyZXN0PWZhdXN0aW5lbGxpXSknKTtcbiAgICAgICAgcGFyc2luZyA9IGRpc2NhcmRTdWZmaXgucnVuKCdtYXJjbyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmF1c3RpbmVsbGknKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcudG9TdHJpbmcoKSkudG8uYmUuZXFsKCdWYWxpZGF0aW9uLlN1Y2Nlc3MoW1ttLGEscixjLG9dLHJvdz0wO2NvbD0zNztyZXN0PWZhdXN0aW5lbGxpXSknKTtcbiAgICB9KTtcbn0pO1xuXG5kZXNjcmliZSgnYSBwYXJzZXIgZm9yIG9wdGlvbmFsIGNoYXJhY3RlcnMnLCAoKSA9PiB7XG4gICAgaXQoJ2NhbiBjYXB0dXJlIG9yIG5vdCBjYXB0dXJlIGEgZG90JywgKCkgPT4ge1xuICAgICAgICBjb25zdCBvcHREb3RUaGVuQSA9IG9wdChwY2hhcignLicpKS5hbmRUaGVuKHBjaGFyKCdhJykpO1xuICAgICAgICBleHBlY3Qob3B0RG90VGhlbkEucnVuKCcuYWJjJykudG9TdHJpbmcoKSlcbiAgICAgICAgICAgIC50by5iZS5lcWwoJ1ZhbGlkYXRpb24uU3VjY2VzcyhbW01heWJlLkp1c3QoLiksYV0scm93PTA7Y29sPTI7cmVzdD1iY10pJyk7XG4gICAgICAgIGV4cGVjdChvcHREb3RUaGVuQS5ydW4oJ2FiYycpLnRvU3RyaW5nKCkpXG4gICAgICAgICAgICAudG8uYmUuZXFsKCdWYWxpZGF0aW9uLlN1Y2Nlc3MoW1tNYXliZS5Ob3RoaW5nLGFdLHJvdz0wO2NvbD0xO3Jlc3Q9YmNdKScpO1xuICAgIH0pO1xuICAgIGl0KCdjYW4gcGFyc2UgU0lHTkVEIGludGVnZXJzISEhJywgKCkgPT4ge1xuICAgICAgICBjb25zdCBwaW50ID0gbWFueTEoYW55T2YoZGlnaXRzKSlcbiAgICAgICAgICAgIC5mbWFwKGwgPT4gcGFyc2VJbnQobC5yZWR1Y2UoKGFjYywgY3VycikgPT4gYWNjICsgY3VyciwgJycpLCAxMCkpO1xuICAgICAgICBjb25zdCBwU2lnbmVkSW50ID0gb3B0KHBjaGFyKCctJykpXG4gICAgICAgICAgICAuYW5kVGhlbihwaW50KVxuICAgICAgICAgICAgLmZtYXAob3B0U2lnbk51bWJlclBhaXIgPT4gKG9wdFNpZ25OdW1iZXJQYWlyWzBdLmlzSnVzdCkgPyAtb3B0U2lnbk51bWJlclBhaXJbMV0gOiBvcHRTaWduTnVtYmVyUGFpclsxXSk7XG4gICAgICAgIGV4cGVjdChwU2lnbmVkSW50LnJ1bignMTMyNDM1NDZ4JykudmFsdWVbMF0pLnRvLmJlLmVxbCgxMzI0MzU0Nik7XG4gICAgICAgIGV4cGVjdChwU2lnbmVkSW50LnJ1bignLTEzMjQzNTQ2eCcpLnZhbHVlWzBdKS50by5iZS5lcWwoLTEzMjQzNTQ2KTtcbiAgICB9KTtcbiAgICBpdCgnY2FuIGNhcHR1cmUgb3Igbm90IGNhcHR1cmUgYSB3aG9sZSBzdWJzdHJpbmcnLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IG9wdFN1YnN0cmluZyA9IG9wdChwc3RyaW5nKCdtYXJjbycpKS5hbmRUaGVuKHBzdHJpbmcoJ2ZhdXN0aW5lbGxpJykpO1xuICAgICAgICBleHBlY3Qob3B0U3Vic3RyaW5nLnJ1bignbWFyY29mYXVzdGluZWxsaXgnKS50b1N0cmluZygpKVxuICAgICAgICAgICAgLnRvLmJlLmVxbCgnVmFsaWRhdGlvbi5TdWNjZXNzKFtbTWF5YmUuSnVzdChbbSxhLHIsYyxvXSksW2YsYSx1LHMsdCxpLG4sZSxsLGwsaV1dLHJvdz0wO2NvbD0xNjtyZXN0PXhdKScpO1xuICAgICAgICBleHBlY3Qob3B0U3Vic3RyaW5nLnJ1bignZmF1c3RpbmVsbGl4JykudG9TdHJpbmcoKSlcbiAgICAgICAgICAgIC50by5iZS5lcWwoJ1ZhbGlkYXRpb24uU3VjY2VzcyhbW01heWJlLk5vdGhpbmcsW2YsYSx1LHMsdCxpLG4sZSxsLGwsaV1dLHJvdz0wO2NvbD0xMTtyZXN0PXhdKScpO1xuICAgIH0pO1xufSk7XG5cbmRlc2NyaWJlKCdhIHBhcnNlciBmb3Igb25lIG9yIG1vcmUgb2NjdXJyZW5jZXMnLCAoKSA9PiB7XG4gICAgaXQoJ2Nhbm5vdCBwYXJzZSBhIGNoYXIgemVybyB0aW1lcycsICgpID0+IHtcbiAgICAgICAgY29uc3Qgb25lT3JNb3JlUGFyc2VyID0gbWFueTEocGNoYXIoJ20nKSk7XG4gICAgICAgIGxldCBwYXJzaW5nID0gb25lT3JNb3JlUGFyc2VyLnJ1bignYXJjbycpO1xuICAgICAgICBleHBlY3QocGFyc2luZy5pc0ZhaWx1cmUpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLnRvU3RyaW5nKCkpXG4gICAgICAgICAgICAudG8uYmUuZXFsKCdWYWxpZGF0aW9uLkZhaWx1cmUoW21hbnkxIHBjaGFyX20sd2FudGVkIG07IGdvdCBhLHJvdz0wO2NvbD0wO3Jlc3Q9YXJjb10pJyk7XG4gICAgfSk7XG4gICAgaXQoJ2NhbiBwYXJzZSBhIGNoYXIgbWFueSB0aW1lcycsICgpID0+IHtcbiAgICAgICAgY29uc3Qgb25lT3JNb3JlUGFyc2VyID0gbWFueTEocGNoYXIoJ20nKSk7XG4gICAgICAgIGxldCBwYXJzaW5nID0gb25lT3JNb3JlUGFyc2VyLnJ1bignbW1tYXJjbycpO1xuICAgICAgICBleHBlY3QocGFyc2luZy5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgnVmFsaWRhdGlvbi5TdWNjZXNzKFtbbSxtLG1dLHJvdz0wO2NvbD0zO3Jlc3Q9YXJjb10pJyk7XG4gICAgfSk7XG4gICAgaXQoJ2Nhbm5vdCBwYXJzZSBhIGNoYXIgc2VxdWVuY2UgemVybyB0aW1lcycsICgpID0+IHtcbiAgICAgICAgY29uc3Qgb25lT3JNb3JlUGFyc2VyID0gbWFueTEocHN0cmluZygnbWFyY28nKSk7XG4gICAgICAgIGxldCBwYXJzaW5nID0gb25lT3JNb3JlUGFyc2VyLnJ1bigneG1hcmNvbWFyY29jaWFvJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLmlzRmFpbHVyZSkudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcudG9TdHJpbmcoKSlcbiAgICAgICAgICAgIC50by5iZS5lcWwoJ1ZhbGlkYXRpb24uRmFpbHVyZShbbWFueTEgcHN0cmluZyBtYXJjbyx3YW50ZWQgbTsgZ290IHgscm93PTA7Y29sPTA7cmVzdD14bWFyY29tYXJjb2NpYW9dKScpO1xuICAgIH0pO1xuICAgIGl0KCdjYW4gcGFyc2UgYSBjaGFyIHNlcXVlbmNlIG1hbnkgdGltZXMnLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IG9uZU9yTW9yZVBhcnNlciA9IG1hbnkxKHBzdHJpbmcoJ21hcmNvJykpO1xuICAgICAgICBsZXQgcGFyc2luZyA9IG9uZU9yTW9yZVBhcnNlci5ydW4oJ21hcmNvbWFyY29jaWFvJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcudG9TdHJpbmcoKSlcbiAgICAgICAgICAgIC50by5iZS5lcWwoJ1ZhbGlkYXRpb24uU3VjY2VzcyhbW1ttLGEscixjLG9dLFttLGEscixjLG9dXSxyb3c9MDtjb2w9MTA7cmVzdD1jaWFvXSknKTtcbiAgICB9KTtcbiAgICBpdCgnY2FuIHBhcnNlIGFuIGludGVnZXIsIG5vIG1hdHRlciBob3cgbGFyZ2UuLi4nLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHBpbnQgPSBtYW55MShhbnlPZihkaWdpdHMpKTtcbiAgICAgICAgbGV0IHBhcnNpbmcgPSBwaW50LnJ1bignMTIzNDVBJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcudG9TdHJpbmcoKSkudG8uYmUuZXFsKCdWYWxpZGF0aW9uLlN1Y2Nlc3MoW1sxLDIsMyw0LDVdLHJvdz0wO2NvbD01O3Jlc3Q9QV0pJyk7XG4gICAgICAgIHBhcnNpbmcgPSBwaW50LnJ1bignMUInKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcuaXNTdWNjZXNzKS50by5iZS50cnVlO1xuICAgICAgICBleHBlY3QocGFyc2luZy50b1N0cmluZygpKS50by5iZS5lcWwoJ1ZhbGlkYXRpb24uU3VjY2VzcyhbWzFdLHJvdz0wO2NvbD0xO3Jlc3Q9Ql0pJyk7XG4gICAgICAgIHBhcnNpbmcgPSBwaW50LnJ1bignQTEyMzQ1Jyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLmlzRmFpbHVyZSkudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcudG9TdHJpbmcoKSlcbiAgICAgICAgICAgIC50by5iZS5lcWwoJ1ZhbGlkYXRpb24uRmFpbHVyZShbbWFueTEgYW55T2YgMDEyMzQ1Njc4OSxfZmFpbCxBMTIzNDVdKScpO1xuICAgIH0pO1xuICAgIGl0KCdjYW4gcGFyc2UgYW4gaW50ZWdlciBpbnRvIGEgdHJ1ZSBpbnRlZ2VyJywgKCkgPT4ge1xuICAgICAgICBjb25zdCBwaW50ID0gbWFueTEoYW55T2YoZGlnaXRzKSlcbiAgICAgICAgICAgIC5mbWFwKGwgPT4gcGFyc2VJbnQobC5yZWR1Y2UoKGFjYywgY3VycikgPT4gYWNjICsgY3VyciwgJycpLCAxMCkpO1xuICAgICAgICBsZXQgcGFyc2luZyA9IHBpbnQucnVuKCcxMjM0NUEnKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcuaXNTdWNjZXNzKS50by5iZS50cnVlO1xuICAgICAgICBleHBlY3QocGFyc2luZy52YWx1ZVswXSkudG8uYmUuZXFsKDEyMzQ1KTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcudmFsdWVbMV0udG9TdHJpbmcoKSkudG8uYmUuZXFsKCdyb3c9MDtjb2w9NTtyZXN0PUEnKTtcbiAgICB9KTtcbn0pO1xuXG5kZXNjcmliZSgnYSBwYXJzZXIgZm9yIHplcm8gb3IgbW9yZSBvY2N1cnJlbmNlcycsICgpID0+IHtcbiAgICBpdCgnY2FuIHBhcnNlIGEgY2hhciB6ZXJvIHRpbWVzJywgKCkgPT4ge1xuICAgICAgICBjb25zdCB6ZXJvT3JNb3JlUGFyc2VyID0gbWFueShwY2hhcignbScpKTtcbiAgICAgICAgbGV0IHBhcnNpbmcgPSB6ZXJvT3JNb3JlUGFyc2VyLnJ1bih0ZXh0KCdhcmNvJykpO1xuICAgICAgICBleHBlY3QocGFyc2luZy5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgnVmFsaWRhdGlvbi5TdWNjZXNzKFtbXSxyb3c9MDtjb2w9MDtyZXN0PWFyY29dKScpO1xuICAgIH0pO1xuICAgIGl0KCdjYW4gcGFyc2UgYSBjaGFyIG1hbnkgdGltZXMnLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHplcm9Pck1vcmVQYXJzZXIgPSBtYW55KHBjaGFyKCdtJykpO1xuICAgICAgICBsZXQgcGFyc2luZyA9IHplcm9Pck1vcmVQYXJzZXIucnVuKHRleHQoJ21tbWFyY28nKSk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcudG9TdHJpbmcoKSkudG8uYmUuZXFsKCdWYWxpZGF0aW9uLlN1Y2Nlc3MoW1ttLG0sbV0scm93PTA7Y29sPTM7cmVzdD1hcmNvXSknKTtcbiAgICB9KTtcbiAgICBpdCgnY2FuIHBhcnNlIGEgY2hhciBzZXF1ZW5jZSB6ZXJvIHRpbWVzJywgKCkgPT4ge1xuICAgICAgICBjb25zdCB6ZXJvT3JNb3JlUGFyc2VyID0gbWFueShwc3RyaW5nKCdtYXJjbycpKTtcbiAgICAgICAgbGV0IHBhcnNpbmcgPSB6ZXJvT3JNb3JlUGFyc2VyLnJ1bih0ZXh0KCd4bWFyY29tYXJjb2NpYW8nKSk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcudG9TdHJpbmcoKSkudG8uYmUuZXFsKCdWYWxpZGF0aW9uLlN1Y2Nlc3MoW1tdLHJvdz0wO2NvbD0wO3Jlc3Q9eG1hcmNvbWFyY29jaWFvXSknKTtcbiAgICB9KTtcbiAgICBpdCgnY2FuIHBhcnNlIGEgY2hhciBzZXF1ZW5jZSBtYW55IHRpbWVzJywgKCkgPT4ge1xuICAgICAgICBjb25zdCB6ZXJvT3JNb3JlUGFyc2VyID0gbWFueShwc3RyaW5nKCdtYXJjbycpKTtcbiAgICAgICAgbGV0IHBhcnNpbmcgPSB6ZXJvT3JNb3JlUGFyc2VyLnJ1bignbWFyY29tYXJjb2NpYW8nKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcuaXNTdWNjZXNzKS50by5iZS50cnVlO1xuICAgICAgICBleHBlY3QocGFyc2luZy50b1N0cmluZygpKVxuICAgICAgICAgICAgLnRvLmJlLmVxbCgnVmFsaWRhdGlvbi5TdWNjZXNzKFtbW20sYSxyLGMsb10sW20sYSxyLGMsb11dLHJvdz0wO2NvbD0xMDtyZXN0PWNpYW9dKScpO1xuICAgIH0pO1xuICAgIGl0KCdjYW4gcGFyc2Ugd2hpdGVzcGFjZXMhIScsICgpID0+IHtcbiAgICAgICAgY29uc3Qgd2hpdGVzUGFyc2VyID0gbWFueShhbnlPZih3aGl0ZXMpKTtcbiAgICAgICAgY29uc3QgdHdvV29yZHMgPSBzZXF1ZW5jZVAoW3BzdHJpbmcoJ2NpYW8nKSwgd2hpdGVzUGFyc2VyLCBwc3RyaW5nKCdtYW1tYScpXSk7XG4gICAgICAgIGxldCBwYXJzaW5nID0gdHdvV29yZHMucnVuKCdjaWFvbWFtbWFYJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLnRvU3RyaW5nKCkpXG4gICAgICAgICAgICAudG8uYmUuZXFsKCdWYWxpZGF0aW9uLlN1Y2Nlc3MoW1tbYyxpLGEsb10sW10sW20sYSxtLG0sYV1dLHJvdz0wO2NvbD05O3Jlc3Q9WF0pJyk7XG4gICAgICAgIHBhcnNpbmcgPSB0d29Xb3Jkcy5ydW4oJ2NpYW8gbWFtbWFYJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLnRvU3RyaW5nKCkpXG4gICAgICAgICAgICAudG8uYmUuZXFsKCdWYWxpZGF0aW9uLlN1Y2Nlc3MoW1tbYyxpLGEsb10sWyBdLFttLGEsbSxtLGFdXSxyb3c9MDtjb2w9MTA7cmVzdD1YXSknKTtcbiAgICAgICAgcGFyc2luZyA9IHR3b1dvcmRzLnJ1bignY2lhbyAgIG1hbW1hWCcpO1xuICAgICAgICBleHBlY3QocGFyc2luZy50b1N0cmluZygpKVxuICAgICAgICAgICAgLnRvLmJlLmVxbCgnVmFsaWRhdGlvbi5TdWNjZXNzKFtbW2MsaSxhLG9dLFsgLCAsIF0sW20sYSxtLG0sYV1dLHJvdz0wO2NvbD0xMjtyZXN0PVhdKScpO1xuICAgICAgICBwYXJzaW5nID0gdHdvV29yZHMucnVuKCdjaWFvIFxcdCBtYW1tYVgnKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcudG9TdHJpbmcoKSlcbiAgICAgICAgICAgIC50by5iZS5lcWwoJ1ZhbGlkYXRpb24uU3VjY2VzcyhbW1tjLGksYSxvXSxbICxcXHQsIF0sW20sYSxtLG0sYV1dLHJvdz0wO2NvbD0xMjtyZXN0PVhdKScpO1xuICAgIH0pO1xufSk7XG5cbmRlc2NyaWJlKCdhIHBhcnNpbmcgZnVuY3Rpb24gZm9yIHplcm8gb3IgbW9yZSBvY2N1cnJlbmNlcycsICgpID0+IHtcbiAgICBpdCgnY2FuIHBhcnNlIGEgY2hhciB6ZXJvIHRpbWVzJywgKCkgPT4ge1xuICAgICAgICBjb25zdCB6ZXJvT3JNb3JlUGFyc2luZ0Z1bmN0aW9uID0gemVyb09yTW9yZShwY2hhcignbScpKTtcbiAgICAgICAgbGV0IHBhcnNpbmcgPSB6ZXJvT3JNb3JlUGFyc2luZ0Z1bmN0aW9uKHRleHQoJ2FyY28nKSk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcudG9TdHJpbmcoKSkudG8uYmUuZXFsKCdWYWxpZGF0aW9uLlN1Y2Nlc3MoW1tdLHJvdz0wO2NvbD0wO3Jlc3Q9YXJjb10pJyk7XG4gICAgfSk7XG4gICAgaXQoJ2NhbiBwYXJzZSBhIGNoYXIgbWFueSB0aW1lcycsICgpID0+IHtcbiAgICAgICAgY29uc3QgemVyb09yTW9yZVBhcnNpbmdGdW5jdGlvbiA9IHplcm9Pck1vcmUocGNoYXIoJ20nKSk7XG4gICAgICAgIGxldCBwYXJzaW5nID0gemVyb09yTW9yZVBhcnNpbmdGdW5jdGlvbih0ZXh0KCdtbW1hcmNvJykpO1xuICAgICAgICBleHBlY3QocGFyc2luZy5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgnVmFsaWRhdGlvbi5TdWNjZXNzKFtbbSxtLG1dLHJvdz0wO2NvbD0zO3Jlc3Q9YXJjb10pJyk7XG4gICAgfSk7XG4gICAgaXQoJ2NhbiBwYXJzZSBhIGNoYXIgc2VxdWVuY2UgemVybyB0aW1lcycsICgpID0+IHtcbiAgICAgICAgY29uc3QgemVyb09yTW9yZVBhcnNpbmdGdW5jdGlvbiA9IHplcm9Pck1vcmUocHN0cmluZygnbWFyY28nKSk7XG4gICAgICAgIGxldCBwYXJzaW5nID0gemVyb09yTW9yZVBhcnNpbmdGdW5jdGlvbih0ZXh0KCd4bWFyY29tYXJjb2NpYW8nKSk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcudG9TdHJpbmcoKSkudG8uYmUuZXFsKCdWYWxpZGF0aW9uLlN1Y2Nlc3MoW1tdLHJvdz0wO2NvbD0wO3Jlc3Q9eG1hcmNvbWFyY29jaWFvXSknKTtcbiAgICB9KTtcbiAgICBpdCgnY2FuIHBhcnNlIGEgY2hhciBzZXF1ZW5jZSBtYW55IHRpbWVzJywgKCkgPT4ge1xuICAgICAgICBjb25zdCB6ZXJvT3JNb3JlUGFyc2luZ0Z1bmN0aW9uID0gemVyb09yTW9yZShwc3RyaW5nKCdtYXJjbycpKTtcbiAgICAgICAgbGV0IHBhcnNpbmcgPSB6ZXJvT3JNb3JlUGFyc2luZ0Z1bmN0aW9uKHRleHQoJ21hcmNvbWFyY29jaWFvJykpO1xuICAgICAgICBleHBlY3QocGFyc2luZy5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLnRvU3RyaW5nKCkpXG4gICAgICAgICAgICAudG8uYmUuZXFsKCdWYWxpZGF0aW9uLlN1Y2Nlc3MoW1tbbSxhLHIsYyxvXSxbbSxhLHIsYyxvXV0scm93PTA7Y29sPTEwO3Jlc3Q9Y2lhb10pJyk7XG4gICAgfSk7XG59KTtcblxuZGVzY3JpYmUoJ2EgcGFyc2VyIGZvciBhIHNwZWNpZmljIHdvcmQnLCAoKSA9PiB7XG4gICAgaXQoJ2lzIGVhc3kgdG8gY3JlYXRlIHdpdGggc2VxdWVuY2VQJywgKCkgPT4ge1xuICAgICAgICBjb25zdCBtYXJjb1BhcnNlciA9IHBzdHJpbmcoJ21hcmNvJyk7XG4gICAgICAgIGNvbnN0IG1hcmNvUGFyc2luZyA9IG1hcmNvUGFyc2VyLnJ1bignbWFyY29jaWFvJyk7XG4gICAgICAgIGV4cGVjdChtYXJjb1BhcnNpbmcuaXNTdWNjZXNzKS50by5iZS50cnVlO1xuICAgICAgICBleHBlY3QobWFyY29QYXJzaW5nLnRvU3RyaW5nKCkpXG4gICAgICAgICAgICAudG8uYmUuZXFsKCdWYWxpZGF0aW9uLlN1Y2Nlc3MoW1ttLGEscixjLG9dLHJvdz0wO2NvbD01O3Jlc3Q9Y2lhb10pJyk7XG4gICAgfSk7XG59KTtcblxuZGVzY3JpYmUoJ3NlcXVlbmNlcyBvZiBwYXJzZXJzIGJhc2VkIG9uIGxpZnQyKGNvbnMpIChha2Egc2VxdWVuY2VQKScsICgpID0+IHtcbiAgICBpdCgnc3RvcmVzIG1hdGNoZWQgY2hhcnMgaW5zaWRlIGFuIGFycmF5JywgKCkgPT4ge1xuICAgICAgICBjb25zdCBhYmNQYXJzZXIgPSBzZXF1ZW5jZVAoW3BjaGFyKCdhJyksIHBjaGFyKCdiJyksIHBjaGFyKCdjJyksXSk7XG4gICAgICAgIGV4cGVjdChhYmNQYXJzZXIucnVuKCdhYmMnKS50b1N0cmluZygpKVxuICAgICAgICAgICAgLnRvLmJlLmVxbCgnVmFsaWRhdGlvbi5TdWNjZXNzKFtbYSxiLGNdLHJvdz0xO2NvbD0wO3Jlc3Q9XSknKTtcbiAgICB9KTtcbn0pO1xuXG5kZXNjcmliZSgnc2VxdWVuY2VzIG9mIHBhcnNlcnMgYmFzZWQgb24gYW5kVGhlbiAmJiBmbWFwIChha2Egc2VxdWVuY2VQMiknLCAoKSA9PiB7XG4gICAgaXQoJ3N0b3JlIG1hdGNoZWQgY2hhcnMgaW5zaWRlIGEgcGxhaW4gc3RyaW5nJywgKCkgPT4ge1xuICAgICAgICBjb25zdCBhYmNQYXJzZXIgPSBzZXF1ZW5jZVAyKFtwY2hhcignYScpLCBwY2hhcignYicpLCBwY2hhcignYycpLF0pO1xuICAgICAgICBleHBlY3QoYWJjUGFyc2VyLnJ1bignYWJjJykudG9TdHJpbmcoKSlcbiAgICAgICAgICAgIC50by5iZS5lcWwoJ1ZhbGlkYXRpb24uU3VjY2VzcyhbYWJjLHJvdz0xO2NvbD0wO3Jlc3Q9XSknKTtcbiAgICB9KTtcbn0pO1xuXG5kZXNjcmliZSgnbGlmdDIgZm9yIHBhcnNlcnMnLCAoKSA9PiB7XG4gICAgaXQoJ29wZXJhdGVzIG9uIHRoZSByZXN1bHRzIG9mIHR3byBzdHJpbmcgcGFyc2luZ3MnLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IGFkZFN0cmluZ3MgPSB4ID0+IHkgPT4geCArICcrJyArIHk7XG4gICAgICAgIGNvbnN0IEFwbHVzQiA9IGxpZnQyKGFkZFN0cmluZ3MpKHBjaGFyKCdhJykpKHBjaGFyKCdiJykpO1xuICAgICAgICBleHBlY3QoQXBsdXNCLnJ1bignYWJjJykudG9TdHJpbmcoKSkudG8uYmUuZXFsKCdWYWxpZGF0aW9uLlN1Y2Nlc3MoW2ErYixyb3c9MDtjb2w9MjtyZXN0PWNdKScpO1xuICAgIH0pO1xuICAgIGl0KCdhZGRzIHRoZSByZXN1bHRzIG9mIHR3byBkaWdpdCBwYXJzaW5ncycsICgpID0+IHtcbiAgICAgICAgY29uc3QgYWRkRGlnaXRzID0geCA9PiB5ID0+IHggKyB5O1xuICAgICAgICBjb25zdCBhZGRQYXJzZXIgPSBsaWZ0MihhZGREaWdpdHMpKHBkaWdpdCgxKSkocGRpZ2l0KDIpKTtcbiAgICAgICAgZXhwZWN0KGFkZFBhcnNlci5ydW4oJzEyMzQnKS50b1N0cmluZygpKS50by5iZS5lcWwoJ1ZhbGlkYXRpb24uU3VjY2VzcyhbMyxyb3c9MDtjb2w9MjtyZXN0PTM0XSknKTtcbiAgICAgICAgZXhwZWN0KGFkZFBhcnNlci5ydW4oJzE0NCcpLmlzRmFpbHVyZSkudG8uYmUudHJ1ZTtcbiAgICB9KTtcbn0pO1xuXG5kZXNjcmliZSgncGFyc2UgMyBkaWdpdHMnLCAoKSA9PiB7XG4gICAgbGV0IHBhcnNlRGlnaXQsIHRocmVlRGlnaXRzLCBwYXJzaW5nO1xuXG4gICAgYmVmb3JlKCgpID0+IHtcbiAgICAgICAgcGFyc2VEaWdpdCA9IGFueU9mKGRpZ2l0cyk7XG4gICAgICAgIHRocmVlRGlnaXRzID0gYW5kVGhlbihwYXJzZURpZ2l0LCBhbmRUaGVuKHBhcnNlRGlnaXQsIHBhcnNlRGlnaXQpKTtcbiAgICAgICAgcGFyc2luZyA9IHRocmVlRGlnaXRzLnJ1bignMTIzJyk7XG4gICAgfSk7XG4gICAgaXQoJ3BhcnNlcyBhbnkgb2YgdGhyZWUgZGlnaXRzJywgKCkgPT4ge1xuICAgICAgICBleHBlY3QocGFyc2luZy5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLnZhbHVlWzBdLnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgnWzEsWzIsM11dJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLnZhbHVlWzFdLnJlc3QoKSkudG8uYmUuZXFsKCcnKTtcbiAgICB9KTtcbiAgICBkZXNjcmliZSgncGFyc2VzIGFueSBvZiB0aHJlZSBkaWdpdHMgd2hpbGUgc2hvd2Nhc2luZyBmbWFwJywgKCkgPT4ge1xuICAgICAgICBjb25zdCB1bnBhY2tlciA9IChbeCwgW3ksIHpdXSkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIFt4LCB5LCB6XTtcbiAgICAgICAgfTtcbiAgICAgICAgaXQoJ2FzIGdsb2JhbCBtZXRob2QnLCAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCB0aHJlZURpZ2l0c0ltcGwgPSBmbWFwKHVucGFja2VyLCB0aHJlZURpZ2l0cyk7XG4gICAgICAgICAgICBsZXQgcGFyc2luZyA9IHRocmVlRGlnaXRzSW1wbC5ydW4oJzEyMycpO1xuICAgICAgICAgICAgZXhwZWN0KHBhcnNpbmcuaXNTdWNjZXNzKS50by5iZS50cnVlO1xuICAgICAgICAgICAgZXhwZWN0KHBhcnNpbmcudmFsdWVbMF0udG9TdHJpbmcoKSkudG8uYmUuZXFsKCdbMSwyLDNdJyk7XG4gICAgICAgICAgICBleHBlY3QocGFyc2luZy52YWx1ZVsxXS5yZXN0KCkpLnRvLmJlLmVxbCgnJyk7XG4gICAgICAgIH0pO1xuICAgICAgICBpdCgnYXMgaW5zdGFuY2UgbWV0aG9kJywgKCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgdGhyZWVEaWdpdHNJbnN0ID0gdGhyZWVEaWdpdHMuZm1hcCh1bnBhY2tlcik7XG4gICAgICAgICAgICBsZXQgcGFyc2luZyA9IHRocmVlRGlnaXRzSW5zdC5ydW4oJzEyMycpO1xuICAgICAgICAgICAgZXhwZWN0KHBhcnNpbmcuaXNTdWNjZXNzKS50by5iZS50cnVlO1xuICAgICAgICAgICAgZXhwZWN0KHBhcnNpbmcudmFsdWVbMF0udG9TdHJpbmcoKSkudG8uYmUuZXFsKCdbMSwyLDNdJyk7XG4gICAgICAgICAgICBleHBlY3QocGFyc2luZy52YWx1ZVsxXS5yZXN0KCkpLnRvLmJlLmVxbCgnJyk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xufSk7XG5cbmRlc2NyaWJlKCdwYXJzZSBBQkMnLCAoKSA9PiB7XG4gICAgaXQoJ3BhcnNlcyBBQkMnLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHBhaXJBZGRlciA9IChbeCwgeV0pID0+IHggKyB5O1xuICAgICAgICBjb25zdCBhYmNQID0gYW5kVGhlbihcbiAgICAgICAgICAgIHBjaGFyKCdhJyksXG4gICAgICAgICAgICBhbmRUaGVuKFxuICAgICAgICAgICAgICAgIHBjaGFyKCdiJyksXG4gICAgICAgICAgICAgICAgYW5kVGhlbihcbiAgICAgICAgICAgICAgICAgICAgcGNoYXIoJ2MnKSxcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuUCgnJylcbiAgICAgICAgICAgICAgICApLmZtYXAocGFpckFkZGVyKVxuICAgICAgICAgICAgKS5mbWFwKHBhaXJBZGRlcilcbiAgICAgICAgKS5mbWFwKHBhaXJBZGRlcik7XG4gICAgICAgIGNvbnN0IHBhcnNpbmcgPSBhYmNQLnJ1bignYWJjZCcpO1xuICAgICAgICBleHBlY3QocGFyc2luZy5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLnZhbHVlWzBdLnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgnYWJjJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLnZhbHVlWzFdLnJlc3QoKSkudG8uYmUuZXFsKCdkJyk7XG4gICAgfSk7XG59KTtcblxuZGVzY3JpYmUoJ2EgcGFyc2VyIGZvciBhbnkgb2YgYSBsaXN0IG9mIGNoYXJzJywgKCkgPT4ge1xuXG4gICAgaXQoJ2NhbiBwYXJzZSBhbnkgbG93ZXJjYXNlIGNoYXInLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IGxvd2VyY2FzZXNQYXJzZXIgPSBhbnlPZihsb3dlcmNhc2VzKTtcblxuICAgICAgICBleHBlY3QoaXNQYXJzZXIobG93ZXJjYXNlc1BhcnNlcikpLnRvLmJlLnRydWU7XG4gICAgICAgIGxldCBwYXJzaW5nQ2hvaWNlID0gbG93ZXJjYXNlc1BhcnNlci5ydW4odGV4dCgnYScpKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UuaXNTdWNjZXNzKS50by5iZS50cnVlO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS52YWx1ZVswXSkudG8uYmUuZXFsKCdhJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLnZhbHVlWzFdLnJlc3QoKSkudG8uYmUuZXFsKCcnKTtcbiAgICAgICAgcGFyc2luZ0Nob2ljZSA9IGxvd2VyY2FzZXNQYXJzZXIucnVuKHRleHQoJ2InKSk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UudmFsdWVbMF0pLnRvLmJlLmVxbCgnYicpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS52YWx1ZVsxXS5yZXN0KCkpLnRvLmJlLmVxbCgnJyk7XG4gICAgICAgIHBhcnNpbmdDaG9pY2UgPSBsb3dlcmNhc2VzUGFyc2VyLnJ1bih0ZXh0KCdkJykpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLnZhbHVlWzBdKS50by5iZS5lcWwoJ2QnKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UudmFsdWVbMV0ucmVzdCgpKS50by5iZS5lcWwoJycpO1xuICAgICAgICBwYXJzaW5nQ2hvaWNlID0gbG93ZXJjYXNlc1BhcnNlci5ydW4odGV4dCgneicpKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UuaXNTdWNjZXNzKS50by5iZS50cnVlO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS52YWx1ZVswXSkudG8uYmUuZXFsKCd6Jyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLnZhbHVlWzFdLnJlc3QoKSkudG8uYmUuZXFsKCcnKTtcblxuICAgICAgICBwYXJzaW5nQ2hvaWNlID0gbG93ZXJjYXNlc1BhcnNlci5ydW4odGV4dCgnWScpKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UuaXNGYWlsdXJlKS50by5iZS50cnVlO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS52YWx1ZVswXSkudG8uYmUuZXFsKCdhbnlPZiBhYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5eicpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS52YWx1ZVsxXSkudG8uYmUuZXFsKCdfZmFpbCcpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS52YWx1ZVsyXS5yZXN0KCkpLnRvLmJlLmVxbCgnWScpO1xuICAgIH0pO1xuXG4gICAgaXQoJ2NhbiBwYXJzZSBhbnkgdXBwZXJjYXNlIGNoYXInLCAoKSA9PiB7XG4gICAgICAgIGxldCB1cHBlcmNhc2VzUGFyc2VyID0gYW55T2YodXBwZXJjYXNlcyk7XG5cbiAgICAgICAgZXhwZWN0KGlzUGFyc2VyKHVwcGVyY2FzZXNQYXJzZXIpKS50by5iZS50cnVlO1xuICAgICAgICBsZXQgcGFyc2luZ0Nob2ljZSA9IHVwcGVyY2FzZXNQYXJzZXIucnVuKHRleHQoJ0EnKSk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UudmFsdWVbMF0pLnRvLmJlLmVxbCgnQScpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS52YWx1ZVsxXS5yZXN0KCkpLnRvLmJlLmVxbCgnJyk7XG4gICAgICAgIHBhcnNpbmdDaG9pY2UgPSB1cHBlcmNhc2VzUGFyc2VyLnJ1bih0ZXh0KCdCJykpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLnZhbHVlWzBdKS50by5iZS5lcWwoJ0InKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UudmFsdWVbMV0ucmVzdCgpKS50by5iZS5lcWwoJycpO1xuICAgICAgICBwYXJzaW5nQ2hvaWNlID0gdXBwZXJjYXNlc1BhcnNlci5ydW4odGV4dCgnUicpKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UuaXNTdWNjZXNzKS50by5iZS50cnVlO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS52YWx1ZVswXSkudG8uYmUuZXFsKCdSJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLnZhbHVlWzFdLnJlc3QoKSkudG8uYmUuZXFsKCcnKTtcbiAgICAgICAgcGFyc2luZ0Nob2ljZSA9IHVwcGVyY2FzZXNQYXJzZXIucnVuKHRleHQoJ1onKSk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UudmFsdWVbMF0pLnRvLmJlLmVxbCgnWicpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS52YWx1ZVsxXS5yZXN0KCkpLnRvLmJlLmVxbCgnJyk7XG5cbiAgICAgICAgcGFyc2luZ0Nob2ljZSA9IHVwcGVyY2FzZXNQYXJzZXIucnVuKHRleHQoJ3MnKSk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLmlzRmFpbHVyZSkudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UudmFsdWVbMF0pLnRvLmJlLmVxbCgnYW55T2YgQUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVonKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UudmFsdWVbMV0pLnRvLmJlLmVxbCgnX2ZhaWwnKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UudmFsdWVbMl0ucmVzdCgpKS50by5iZS5lcWwoJ3MnKTtcbiAgICB9KTtcblxuICAgIGl0KCdjYW4gcGFyc2UgYW55IGRpZ2l0JywgKCkgPT4ge1xuICAgICAgICBsZXQgZGlnaXRzUGFyc2VyID0gYW55T2YoZGlnaXRzKTtcblxuICAgICAgICBleHBlY3QoaXNQYXJzZXIoZGlnaXRzUGFyc2VyKSkudG8uYmUudHJ1ZTtcbiAgICAgICAgbGV0IHBhcnNpbmdDaG9pY2UgPSBkaWdpdHNQYXJzZXIucnVuKHRleHQoJzEnKSk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UudmFsdWVbMF0pLnRvLmJlLmVxbCgnMScpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS52YWx1ZVsxXS5yZXN0KCkpLnRvLmJlLmVxbCgnJyk7XG4gICAgICAgIHBhcnNpbmdDaG9pY2UgPSBkaWdpdHNQYXJzZXIucnVuKHRleHQoJzMnKSk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UudmFsdWVbMF0pLnRvLmJlLmVxbCgnMycpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS52YWx1ZVsxXS5yZXN0KCkpLnRvLmJlLmVxbCgnJyk7XG4gICAgICAgIHBhcnNpbmdDaG9pY2UgPSBkaWdpdHNQYXJzZXIucnVuKHRleHQoJzAnKSk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UudmFsdWVbMF0pLnRvLmJlLmVxbCgnMCcpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS52YWx1ZVsxXS5yZXN0KCkpLnRvLmJlLmVxbCgnJyk7XG4gICAgICAgIHBhcnNpbmdDaG9pY2UgPSBkaWdpdHNQYXJzZXIucnVuKHRleHQoJzgnKSk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UudmFsdWVbMF0pLnRvLmJlLmVxbCgnOCcpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS52YWx1ZVsxXS5yZXN0KCkpLnRvLmJlLmVxbCgnJyk7XG5cbiAgICAgICAgcGFyc2luZ0Nob2ljZSA9IGRpZ2l0c1BhcnNlci5ydW4odGV4dCgncycpKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UuaXNGYWlsdXJlKS50by5iZS50cnVlO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS52YWx1ZVswXSkudG8uYmUuZXFsKCdhbnlPZiAwMTIzNDU2Nzg5Jyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLnZhbHVlWzFdKS50by5iZS5lcWwoJ19mYWlsJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLnZhbHVlWzJdLnJlc3QoKSkudG8uYmUuZXFsKCdzJyk7XG4gICAgfSk7XG5cbiAgICBpdCgnd2lsbCBmYWlsIGlmIHRoZSBpbnB1dCBpcyB0b28gc2hvcnQnLCAoKSA9PiB7XG4gICAgICAgIGV4cGVjdChhbnlPZihsb3dlcmNhc2VzKS5ydW4odGV4dCgnJykpLmlzRmFpbHVyZSkudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KGFueU9mKGRpZ2l0cykucnVuKHRleHQoJycpKS5pc0ZhaWx1cmUpLnRvLmJlLnRydWU7XG4gICAgfSk7XG59KTtcblxuZGVzY3JpYmUoJ2EgY2hvaWNlIG9mIHBhcnNlcnMgYm91bmQgYnkgb3JFbHNlJywgKCkgPT4ge1xuICAgIGNvbnN0IHBhcnNlcnNDaG9pY2UgPSBjaG9pY2UoW3BjaGFyKCdhJyksIHBjaGFyKCdiJyksIHBjaGFyKCdjJyksIHBjaGFyKCdkJyksXSk7XG5cbiAgICBpdCgnY2FuIHBhcnNlIG9uZSBvZiBmb3VyIGNoYXJzJywgKCkgPT4ge1xuICAgICAgICBleHBlY3QoaXNQYXJzZXIocGFyc2Vyc0Nob2ljZSkpLnRvLmJlLnRydWU7XG4gICAgICAgIGxldCBwYXJzaW5nQ2hvaWNlID0gcGFyc2Vyc0Nob2ljZS5ydW4odGV4dCgnYScpKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UuaXNTdWNjZXNzKS50by5iZS50cnVlO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS52YWx1ZVswXSkudG8uYmUuZXFsKCdhJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLnZhbHVlWzFdLnJlc3QoKSkudG8uYmUuZXFsKCcnKTtcbiAgICAgICAgcGFyc2luZ0Nob2ljZSA9IHBhcnNlcnNDaG9pY2UucnVuKHRleHQoJ2InKSk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UudmFsdWVbMF0pLnRvLmJlLmVxbCgnYicpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS52YWx1ZVsxXS5yZXN0KCkpLnRvLmJlLmVxbCgnJyk7XG4gICAgICAgIHBhcnNpbmdDaG9pY2UgPSBwYXJzZXJzQ2hvaWNlLnJ1bih0ZXh0KCdkJykpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLnZhbHVlWzBdKS50by5iZS5lcWwoJ2QnKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UudmFsdWVbMV0ucmVzdCgpKS50by5iZS5lcWwoJycpO1xuICAgIH0pO1xuXG4gICAgaXQoJ2NhbiBhbHNvIHBhcnNlIE5PTkUgb2YgZm91ciBjaGFycycsICgpID0+IHtcbiAgICAgICAgY29uc3QgcGFyc2luZ0Nob2ljZSA9IHBhcnNlcnNDaG9pY2UucnVuKHRleHQoJ3gnKSk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLmlzRmFpbHVyZSkudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UudmFsdWVbMF0pLnRvLmJlLmVxbCgnY2hvaWNlIC9wY2hhcl9hL3BjaGFyX2IvcGNoYXJfYy9wY2hhcl9kJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLnZhbHVlWzFdKS50by5iZS5lcWwoJ19mYWlsJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLnZhbHVlWzJdLnJlc3QoKSkudG8uYmUuZXFsKCd4Jyk7XG4gICAgfSk7XG5cbiAgICBpdCgnd2lsbCBmYWlsIGlmIHRoZSBpbnB1dCBpcyB0b28gc2hvcnQnLCAoKSA9PiB7XG4gICAgICAgIGV4cGVjdChwYXJzZXJzQ2hvaWNlLnJ1bih0ZXh0KCdhJykpLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNlcnNDaG9pY2UucnVuKHRleHQoJycpKS5pc0ZhaWx1cmUpLnRvLmJlLnRydWU7XG4gICAgfSk7XG59KTtcblxuZGVzY3JpYmUoJ3R3byBwYXJzZXJzIGJvdW5kIGJ5IG9yRWxzZScsICgpID0+IHtcbiAgICBjb25zdCBwYXJzZXJBb3JCID0gb3JFbHNlKHBjaGFyKCdhJyksIHBjaGFyKCdiJykpO1xuXG4gICAgaXQoJ2NhbiBwYXJzZSBvbmUgb2YgdHdvIGNoYXJzJywgKCkgPT4ge1xuICAgICAgICBleHBlY3QoaXNQYXJzZXIocGFyc2VyQW9yQikpLnRvLmJlLnRydWU7XG4gICAgICAgIGxldCBwYXJzaW5nQW9yQiA9IHBhcnNlckFvckIucnVuKHRleHQoJ2FiYycpKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdBb3JCLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdBb3JCLnZhbHVlWzBdKS50by5iZS5lcWwoJ2EnKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdBb3JCLnZhbHVlWzFdLnJlc3QoKSkudG8uYmUuZXFsKCdiYycpO1xuICAgICAgICBwYXJzaW5nQW9yQiA9IHBhcnNlckFvckIucnVuKHRleHQoJ2JiYycpKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdBb3JCLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdBb3JCLnZhbHVlWzBdKS50by5iZS5lcWwoJ2InKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdBb3JCLnZhbHVlWzFdLnJlc3QoKSkudG8uYmUuZXFsKCdiYycpO1xuICAgIH0pO1xuXG4gICAgaXQoJ2NhbiBhbHNvIHBhcnNlIE5PTkUgb2YgdHdvIGNoYXJzJywgKCkgPT4ge1xuICAgICAgICBjb25zdCBwYXJzaW5nQW9yQiA9IHBhcnNlckFvckIucnVuKHRleHQoJ2NkZScpKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdBb3JCLmlzRmFpbHVyZSkudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdBb3JCLnZhbHVlWzBdKS50by5iZS5lcWwoJ3BjaGFyX2Egb3JFbHNlIHBjaGFyX2InKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdBb3JCLnZhbHVlWzFdKS50by5iZS5lcWwoJ3dhbnRlZCBiOyBnb3QgYycpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0FvckIudmFsdWVbMl0ucmVzdCgpKS50by5iZS5lcWwoJ2NkZScpO1xuICAgIH0pO1xuXG4gICAgaXQoJ3dpbGwgZmFpbCBpZiB0aGUgaW5wdXQgaXMgdG9vIHNob3J0JywgKCkgPT4ge1xuICAgICAgICBleHBlY3QocGFyc2VyQW9yQi5ydW4odGV4dCgnYScpKS5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChwYXJzZXJBb3JCLnJ1bih0ZXh0KCcnKSkuaXNGYWlsdXJlKS50by5iZS50cnVlO1xuICAgIH0pO1xufSk7XG5cbmRlc2NyaWJlKCd0d28gcGFyc2VycyBib3VuZCBieSBhbmRUaGVuJywgKCkgPT4ge1xuICAgIGNvbnN0IHBhcnNlckFhbmRCID0gYW5kVGhlbihwY2hhcignYScpLCBwY2hhcignYicpKTtcblxuICAgIGl0KCdjYW4gcGFyc2UgdHdvIGNoYXJzJywgKCkgPT4ge1xuICAgICAgICBleHBlY3QoaXNQYXJzZXIocGFyc2VyQWFuZEIpKS50by5iZS50cnVlO1xuICAgICAgICBjb25zdCBwYXJzaW5nQWFuZEIgPSBwYXJzZXJBYW5kQi5ydW4odGV4dCgnYWJjJykpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0FhbmRCLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdBYW5kQi52YWx1ZVswXS50b1N0cmluZygpKS50by5iZS5lcWwoJ1thLGJdJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQWFuZEIudmFsdWVbMV0ucmVzdCgpKS50by5iZS5lcWwoJ2MnKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdBYW5kQi50b1N0cmluZygpKS50by5iZS5lcWwoJ1ZhbGlkYXRpb24uU3VjY2VzcyhbW2EsYl0scm93PTA7Y29sPTI7cmVzdD1jXSknKTtcbiAgICB9KTtcblxuICAgIGl0KCdjYW4gYWxzbyBOT1QgcGFyc2UgdHdvIGNoYXJzJywgKCkgPT4ge1xuICAgICAgICBjb25zdCBwYXJzaW5nQWFuZEIgPSBwYXJzZXJBYW5kQi5ydW4odGV4dCgnYWNkJykpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0FhbmRCLmlzRmFpbHVyZSkudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdBYW5kQi52YWx1ZVswXSkudG8uYmUuZXFsKCdwY2hhcl9hIGFuZFRoZW4gcGNoYXJfYicpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0FhbmRCLnZhbHVlWzFdKS50by5iZS5lcWwoJ3dhbnRlZCBiOyBnb3QgYycpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0FhbmRCLnZhbHVlWzJdLnJlc3QoKSkudG8uYmUuZXFsKCdjZCcpO1xuICAgIH0pO1xuXG4gICAgaXQoJ3dpbGwgZmFpbCBpZiB0aGUgaW5wdXQgaXMgdG9vIHNob3J0JywgKCkgPT4ge1xuICAgICAgICBleHBlY3QocGFyc2VyQWFuZEIucnVuKHRleHQoJ2EnKSkuaXNGYWlsdXJlKS50by5iZS50cnVlO1xuICAgICAgICBleHBlY3QocGFyc2VyQWFuZEIucnVuKHRleHQoJ2FiJykpLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcbiAgICB9KTtcbn0pO1xuXG5kZXNjcmliZSgnYSBuYW1lZCBjaGFyYWN0ZXIgcGFyc2VyJywgKCkgPT4ge1xuICAgIGNvbnN0IHBhcnNlckEgPSBwY2hhcignYScpO1xuXG4gICAgaXQoJ2NhbiBwYXJzZSBhIHNpbmdsZSBjaGFyJywgKCkgPT4ge1xuICAgICAgICBleHBlY3QoaXNQYXJzZXIocGFyc2VyQSkpLnRvLmJlLnRydWU7XG4gICAgICAgIGNvbnN0IHBhcnNpbmdBID0gcGFyc2VyQS5ydW4odGV4dCgnYWJjJykpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0EudmFsdWVbMF0pLnRvLmJlLmVxbCgnYScpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0EudmFsdWVbMV0ucmVzdCgpKS50by5iZS5lcWwoJ2JjJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQS5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgfSk7XG5cbiAgICBpdCgnY2FuIGFsc28gTk9UIHBhcnNlIGEgc2luZ2xlIGNoYXInLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHBhcnNpbmdCID0gcGFyc2VyQS5ydW4odGV4dCgnYmNkJykpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0IudmFsdWVbMF0pLnRvLmJlLmVxbCgncGNoYXJfYScpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0IudmFsdWVbMV0pLnRvLmJlLmVxbCgnd2FudGVkIGE7IGdvdCBiJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQi5pc0ZhaWx1cmUpLnRvLmJlLnRydWU7XG4gICAgfSk7XG59KTtcblxuZGVzY3JpYmUoJ2EgdmVyeSBzaW1wbGUgcGFyc2VyIGZvciBjaGFycyBvciBmb3IgZGlnaXRzJywgKCkgPT4ge1xuICAgIGNvbnN0IHBhcnNlckEgPSBjaGFyUGFyc2VyKCdhJyk7XG4gICAgY29uc3QgcGFyc2VyMSA9IGRpZ2l0UGFyc2VyKDEpO1xuXG4gICAgaXQoJ2NhbiBwYXJzZSBhIHNpbmdsZSBjaGFyJywgKCkgPT4ge1xuICAgICAgICBjb25zdCBwYXJzaW5nQSA9IHBhcnNlckEodGV4dCgnYWJjJykpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0EudmFsdWVbMF0pLnRvLmJlLmVxbCgnYScpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0EudmFsdWVbMV0ucmVzdCgpKS50by5iZS5lcWwoJ2JjJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQS5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgfSk7XG5cbiAgICBpdCgnY2FuIGFsc28gTk9UIHBhcnNlIGEgc2luZ2xlIGNoYXInLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHBhcnNpbmdCID0gcGFyc2VyQSh0ZXh0KCdiY2QnKSk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQi52YWx1ZVswXSkudG8uYmUuZXFsKCdjaGFyUGFyc2VyJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQi52YWx1ZVsxXSkudG8uYmUuZXFsKCd3YW50ZWQgYTsgZ290IGInKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdCLnZhbHVlWzJdLnJlc3QoKSkudG8uYmUuZXFsKCdiY2QnKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdCLmlzRmFpbHVyZSkudG8uYmUudHJ1ZTtcbiAgICB9KTtcblxuICAgIGl0KCdmYWlscyBhdCB0aGUgZW5kIG9mIHRoZSBzdHJlYW0nLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHBhcnNpbmdBID0gcGFyc2VyQSh0ZXh0KCcnKSk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQS52YWx1ZVswXSkudG8uYmUuZXFsKCdjaGFyUGFyc2VyJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQS52YWx1ZVsxXSkudG8uYmUuZXFsKCdubyBtb3JlIGlucHV0Jyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQS52YWx1ZVsyXS5yZXN0KCkpLnRvLmJlLmVxbCgnJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQS5pc0ZhaWx1cmUpLnRvLmJlLnRydWU7XG4gICAgfSk7XG5cbiAgICBpdCgnY2FuIHBhcnNlIGEgc2luZ2xlIGRpZ2l0JywgKCkgPT4ge1xuICAgICAgICBjb25zdCBwYXJzaW5nMSA9IHBhcnNlcjEodGV4dCgnMTIzJykpO1xuICAgICAgICBleHBlY3QocGFyc2luZzEudmFsdWVbMF0pLnRvLmJlLmVxbCgxKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcxLnZhbHVlWzFdLnJlc3QoKSkudG8uYmUuZXFsKCcyMycpO1xuICAgICAgICBleHBlY3QocGFyc2luZzEuaXNTdWNjZXNzKS50by5iZS50cnVlO1xuICAgIH0pO1xuXG4gICAgaXQoJ2NhbiBhbHNvIE5PVCBwYXJzZSBhIHNpbmdsZSBkaWdpdCcsICgpID0+IHtcbiAgICAgICAgY29uc3QgcGFyc2luZzIgPSBwYXJzZXIxKHRleHQoJzIzNCcpKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcyLnZhbHVlWzBdKS50by5iZS5lcWwoJ2RpZ2l0UGFyc2VyJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nMi52YWx1ZVsxXSkudG8uYmUuZXFsKCd3YW50ZWQgMTsgZ290IDInKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcyLnZhbHVlWzJdLnJlc3QoKSkudG8uYmUuZXFsKCcyMzQnKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcyLmlzRmFpbHVyZSkudG8uYmUudHJ1ZTtcbiAgICB9KTtcblxuICAgIGl0KCdmYWlscyBhdCB0aGUgZW5kIG9mIHRoZSBzdHJlYW0gYWxzbyB3aGVuIGh1bnRpbmcgZm9yIGRpZ2l0cycsICgpID0+IHtcbiAgICAgICAgY29uc3QgcGFyc2luZzMgPSBwYXJzZXIxKHRleHQoJycpKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmczLnZhbHVlWzBdKS50by5iZS5lcWwoJ2RpZ2l0UGFyc2VyJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nMy52YWx1ZVsxXSkudG8uYmUuZXFsKCdubyBtb3JlIGlucHV0Jyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nMy52YWx1ZVsyXS5yZXN0KCkpLnRvLmJlLmVxbCgnJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nMy5pc0ZhaWx1cmUpLnRvLmJlLnRydWU7XG4gICAgfSk7XG59KTtcbiJdfQ==