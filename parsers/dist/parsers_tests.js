define(['chai', 'parsers', 'util'], function (_chai, _parsers, _util) {
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

    describe('parsing while discarding input', function () {
        it('allows to exclude parentheses', function () {
            var insideParens = (0, _parsers.pchar)('(').discardFirst((0, _parsers.many)((0, _parsers.anyOf)(lowercases))).discardSecond((0, _parsers.pchar)(')'));
            (0, _chai.expect)(insideParens.run('(marco)').toString()).to.be.eql('[[m,a,r,c,o],]');
            (0, _chai.expect)(insideParens.run('()').toString()).to.be.eql('[[],]');
        });
        it('...even using a tailor-made method', function () {
            var insideParens = (0, _parsers.betweenParens)((0, _parsers.pstring)('marco'));
            (0, _chai.expect)(insideParens.run('(marco)').toString()).to.be.eql('[[m,a,r,c,o],]');
        });
        it('cherry-picking elements separated by separators', function () {
            var substringsWithCommas = (0, _parsers.many)((0, _parsers.many1)((0, _parsers.anyOf)(lowercases)).discardSecond((0, _parsers.pchar)(',')));
            (0, _chai.expect)(substringsWithCommas.run('a,b,cd,1').toString()).to.be.eql('[[[a],[b],[c,d]],1]');
        });
        it('...also when inside a lists', function () {
            var substringsWithCommas = (0, _parsers.many)((0, _parsers.many1)((0, _parsers.anyOf)(lowercases)).discardSecond((0, _parsers.pchar)(',')));
            var listElements = (0, _parsers.between)((0, _parsers.pchar)('['), substringsWithCommas, (0, _parsers.pchar)(']'));
            (0, _chai.expect)(listElements.run('[a,b,cd,marco,]1').toString()).to.be.eql('[[[a],[b],[c,d],[m,a,r,c,o]],1]');
        });
    });

    describe('a couple of parsers', function () {
        it('can decide to discard the matches of the first one', function () {
            var discardIntegerSign = (0, _parsers.pchar)('-').discardFirst((0, _parsers.pdigit)(8));
            var parsing = discardIntegerSign.run('-8x');
            (0, _chai.expect)(parsing.toString()).to.be.eql('[8,x]');
        });
        it('can decide to discard the matches of the second one', function () {
            var discardSuffix = (0, _parsers.pstring)('marco').discardSecond((0, _parsers.many1)((0, _parsers.anyOf)(whites)));
            var parsing = discardSuffix.run('marco faustinelli');
            (0, _chai.expect)(parsing.toString()).to.be.eql('[[m,a,r,c,o],faustinelli]');
            parsing = discardSuffix.run('marco                                faustinelli');
            (0, _chai.expect)(parsing.toString()).to.be.eql('[[m,a,r,c,o],faustinelli]');
        });
    });

    describe('a parser for optional characters', function () {
        it('can capture or not capture a dot', function () {
            var optDotThenA = (0, _parsers.opt)((0, _parsers.pchar)('.')).andThen((0, _parsers.pchar)('a'));
            (0, _chai.expect)(optDotThenA.run('.abc').toString()).to.be.eql('[[some(.),a],bc]');
            (0, _chai.expect)(optDotThenA.run('abc').toString()).to.be.eql('[[none(),a],bc]');
        });
        it('can parse SIGNED integers!!!', function () {
            var pint = (0, _parsers.many1)((0, _parsers.anyOf)(digits)).fmap(function (l) {
                return parseInt(l.reduce(function (acc, curr) {
                    return acc + curr;
                }, ''), 10);
            });
            var pSignedInt = (0, _parsers.opt)((0, _parsers.pchar)('-')).andThen(pint).fmap(function (_ref) {
                var _ref2 = _slicedToArray(_ref, 2),
                    maybeSign = _ref2[0],
                    number = _ref2[1];

                return (0, _util.isSome)(maybeSign) ? -number : number;
            });
            (0, _chai.expect)(pSignedInt.run('13243546x')[0]).to.be.eql(13243546);
            (0, _chai.expect)(pSignedInt.run('-13243546x')[0]).to.be.eql(-13243546);
        });
        it('can capture or not capture a whole substring', function () {
            var optSubstring = (0, _parsers.opt)((0, _parsers.pstring)('marco')).andThen((0, _parsers.pstring)('faustinelli'));
            (0, _chai.expect)(optSubstring.run('marcofaustinellix').toString()).to.be.eql('[[some([m,a,r,c,o]),[f,a,u,s,t,i,n,e,l,l,i]],x]');
            (0, _chai.expect)(optSubstring.run('faustinellix').toString()).to.be.eql('[[none(),[f,a,u,s,t,i,n,e,l,l,i]],x]');
        });
    });

    describe('a parser for one or more occurrences', function () {
        it('cannot parse a char zero times', function () {
            var oneOrMoreParser = (0, _parsers.many1)((0, _parsers.pchar)('m'));
            var parsing = oneOrMoreParser.run('arco');
            (0, _chai.expect)((0, _util.isFailure)(parsing)).to.be.true;
            (0, _chai.expect)(parsing.toString()).to.be.eql('[many1 pchar_m,wanted m; got a]');
        });
        it('can parse a char many times', function () {
            var oneOrMoreParser = (0, _parsers.many1)((0, _parsers.pchar)('m'));
            var parsing = oneOrMoreParser.run('mmmarco');
            (0, _chai.expect)((0, _util.isSuccess)(parsing)).to.be.true;
            (0, _chai.expect)(parsing.toString()).to.be.eql('[[m,m,m],arco]');
        });
        it('cannot parse a char sequence zero times', function () {
            var oneOrMoreParser = (0, _parsers.many1)((0, _parsers.pstring)('marco'));
            var parsing = oneOrMoreParser.run('xmarcomarcociao');
            (0, _chai.expect)((0, _util.isFailure)(parsing)).to.be.true;
            (0, _chai.expect)(parsing.toString()).to.be.eql('[many1 pstring marco,wanted m; got x]');
        });
        it('can parse a char sequence many times', function () {
            var oneOrMoreParser = (0, _parsers.many1)((0, _parsers.pstring)('marco'));
            var parsing = oneOrMoreParser.run('marcomarcociao');
            (0, _chai.expect)((0, _util.isSuccess)(parsing)).to.be.true;
            (0, _chai.expect)(parsing.toString()).to.be.eql('[[[m,a,r,c,o],[m,a,r,c,o]],ciao]');
        });
        it('can parse an integer, no matter how large...', function () {
            var pint = (0, _parsers.many1)((0, _parsers.anyOf)(digits));
            var parsing = pint.run('12345A');
            (0, _chai.expect)((0, _util.isSuccess)(parsing)).to.be.true;
            (0, _chai.expect)(parsing.toString()).to.be.eql('[[1,2,3,4,5],A]');
            parsing = pint.run('1B');
            (0, _chai.expect)((0, _util.isSuccess)(parsing)).to.be.true;
            (0, _chai.expect)(parsing.toString()).to.be.eql('[[1],B]');
            parsing = pint.run('A12345');
            (0, _chai.expect)((0, _util.isFailure)(parsing)).to.be.true;
            (0, _chai.expect)(parsing.toString()).to.be.eql('[many1 anyOf 0123456789,_fail]');
        });
        it('can parse an integer into a true integer', function () {
            var pint = (0, _parsers.many1)((0, _parsers.anyOf)(digits)).fmap(function (l) {
                return parseInt(l.reduce(function (acc, curr) {
                    return acc + curr;
                }, ''), 10);
            });
            var parsing = pint.run('12345A');
            (0, _chai.expect)((0, _util.isSuccess)(parsing)).to.be.true;
            (0, _chai.expect)(parsing[0]).to.be.eql(12345);
            (0, _chai.expect)(parsing[1]).to.be.eql('A');
        });
    });

    describe('a parser for zero or more occurrences', function () {
        it('can parse a char zero times', function () {
            var zeroOrMoreParser = (0, _parsers.many)((0, _parsers.pchar)('m'));
            var parsing = zeroOrMoreParser.run('arco');
            (0, _chai.expect)((0, _util.isSuccess)(parsing)).to.be.true;
            (0, _chai.expect)(parsing.toString()).to.be.eql('[[],arco]');
        });
        it('can parse a char many times', function () {
            var zeroOrMoreParser = (0, _parsers.many)((0, _parsers.pchar)('m'));
            var parsing = zeroOrMoreParser.run('mmmarco');
            (0, _chai.expect)((0, _util.isSuccess)(parsing)).to.be.true;
            (0, _chai.expect)(parsing.toString()).to.be.eql('[[m,m,m],arco]');
        });
        it('can parse a char sequence zero times', function () {
            var zeroOrMoreParser = (0, _parsers.many)((0, _parsers.pstring)('marco'));
            var parsing = zeroOrMoreParser.run('xmarcomarcociao');
            (0, _chai.expect)((0, _util.isSuccess)(parsing)).to.be.true;
            (0, _chai.expect)(parsing.toString()).to.be.eql('[[],xmarcomarcociao]');
        });
        it('can parse a char sequence many times', function () {
            var zeroOrMoreParser = (0, _parsers.many)((0, _parsers.pstring)('marco'));
            var parsing = zeroOrMoreParser.run('marcomarcociao');
            (0, _chai.expect)((0, _util.isSuccess)(parsing)).to.be.true;
            (0, _chai.expect)(parsing.toString()).to.be.eql('[[[m,a,r,c,o],[m,a,r,c,o]],ciao]');
        });
        it('can parse whitespaces!!', function () {
            var whitesParser = (0, _parsers.many)((0, _parsers.anyOf)(whites));
            var twoWords = (0, _parsers.sequenceP)([(0, _parsers.pstring)('ciao'), whitesParser, (0, _parsers.pstring)('mamma')]);
            var parsing = twoWords.run('ciaomammaX');
            (0, _chai.expect)(parsing.toString()).to.be.eql('[[[c,i,a,o],[],[m,a,m,m,a]],X]');
            parsing = twoWords.run('ciao mammaX');
            (0, _chai.expect)(parsing.toString()).to.be.eql('[[[c,i,a,o],[ ],[m,a,m,m,a]],X]');
            parsing = twoWords.run('ciao   mammaX');
            (0, _chai.expect)(parsing.toString()).to.be.eql('[[[c,i,a,o],[ , , ],[m,a,m,m,a]],X]');
            parsing = twoWords.run('ciao \t mammaX');
            (0, _chai.expect)(parsing.toString()).to.be.eql('[[[c,i,a,o],[ ,\t, ],[m,a,m,m,a]],X]');
        });
    });

    describe('a parsing function for zero or more occurrences', function () {
        it('can parse a char zero times', function () {
            var zeroOrMoreParsingFunction = (0, _parsers.zeroOrMore)((0, _parsers.pchar)('m'));
            var parsing = zeroOrMoreParsingFunction('arco');
            (0, _chai.expect)((0, _util.isSuccess)(parsing)).to.be.true;
            (0, _chai.expect)(parsing.toString()).to.be.eql('[[],arco]');
        });
        it('can parse a char many times', function () {
            var zeroOrMoreParsingFunction = (0, _parsers.zeroOrMore)((0, _parsers.pchar)('m'));
            var parsing = zeroOrMoreParsingFunction('mmmarco');
            (0, _chai.expect)((0, _util.isSuccess)(parsing)).to.be.true;
            (0, _chai.expect)(parsing.toString()).to.be.eql('[[m,m,m],arco]');
        });
        it('can parse a char sequence zero times', function () {
            var zeroOrMoreParsingFunction = (0, _parsers.zeroOrMore)((0, _parsers.pstring)('marco'));
            var parsing = zeroOrMoreParsingFunction('xmarcomarcociao');
            (0, _chai.expect)((0, _util.isSuccess)(parsing)).to.be.true;
            (0, _chai.expect)(parsing.toString()).to.be.eql('[[],xmarcomarcociao]');
        });
        it('can parse a char sequence many times', function () {
            var zeroOrMoreParsingFunction = (0, _parsers.zeroOrMore)((0, _parsers.pstring)('marco'));
            var parsing = zeroOrMoreParsingFunction('marcomarcociao');
            (0, _chai.expect)((0, _util.isSuccess)(parsing)).to.be.true;
            (0, _chai.expect)(parsing.toString()).to.be.eql('[[[m,a,r,c,o],[m,a,r,c,o]],ciao]');
        });
    });

    describe('a parser for a specific word', function () {
        it('is easy to create with sequenceP', function () {
            var marcoParser = (0, _parsers.pstring)('marco');
            var marcoParsing = marcoParser.run('marcociao');
            (0, _chai.expect)((0, _util.isSuccess)(marcoParsing)).to.be.true;
            (0, _chai.expect)(marcoParsing.toString()).to.be.eql('[[m,a,r,c,o],ciao]');
        });
    });

    describe('sequences of parsers based on lift2(cons) (aka sequenceP)', function () {
        it('stores matched chars inside an array', function () {
            var abcParser = (0, _parsers.sequenceP)([(0, _parsers.pchar)('a'), (0, _parsers.pchar)('b'), (0, _parsers.pchar)('c')]);
            (0, _chai.expect)(abcParser.run('abc').toString()).to.be.eql('[[a,b,c],]');
        });
    });

    describe('sequences of parsers based on andThen && fmap (aka sequenceP2)', function () {
        it('store matched chars inside a plain string', function () {
            var abcParser = (0, _parsers.sequenceP2)([(0, _parsers.pchar)('a'), (0, _parsers.pchar)('b'), (0, _parsers.pchar)('c')]);
            (0, _chai.expect)(abcParser.run('abc').toString()).to.be.eql('[abc,]');
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
            (0, _chai.expect)(AplusB.run('abc').toString()).to.be.eql('[a+b,c]');
        });
        it('adds the results of two digit parsings', function () {
            var addDigits = function addDigits(x) {
                return function (y) {
                    return x + y;
                };
            };
            var addParser = (0, _parsers.lift2)(addDigits)((0, _parsers.pdigit)(1))((0, _parsers.pdigit)(2));
            (0, _chai.expect)(addParser.run('1234').toString()).to.be.eql('[3,34]');
            (0, _chai.expect)((0, _util.isFailure)(addParser.run('144'))).to.be.true;
        });
    });

    describe('parse 3 digits', function () {
        var parseDigit = void 0,
            threeDigits = void 0,
            parsing = void 0;
        beforeEach(function () {
            parseDigit = (0, _parsers.anyOf)(digits);
            threeDigits = (0, _parsers.andThen)(parseDigit, (0, _parsers.andThen)(parseDigit, parseDigit));
            parsing = threeDigits.run('123');
        });
        it('parses any of three digits', function () {
            (0, _chai.expect)((0, _util.isSuccess)(parsing)).to.be.true;
            (0, _chai.expect)(parsing[0].toString()).to.be.eql('[1,[2,3]]');
            (0, _chai.expect)(parsing[1]).to.be.eql('');
        });
        describe('parses any of three digits while showcasing fmap', function () {
            it('as global method', function () {
                threeDigits = (0, _parsers.fmap)(function (_ref3) {
                    var _ref4 = _slicedToArray(_ref3, 2),
                        x = _ref4[0],
                        _ref4$ = _slicedToArray(_ref4[1], 2),
                        y = _ref4$[0],
                        z = _ref4$[1];

                    return [x, y, z];
                }, threeDigits);
                var parsing = threeDigits.run('123');
                (0, _chai.expect)((0, _util.isSuccess)(parsing)).to.be.true;
                (0, _chai.expect)(parsing[0].toString()).to.be.eql('[1,2,3]');
                (0, _chai.expect)(parsing[1]).to.be.eql('');
            });
            it('as instance method', function () {
                threeDigits = threeDigits.fmap(function (_ref5) {
                    var _ref6 = _slicedToArray(_ref5, 2),
                        x = _ref6[0],
                        _ref6$ = _slicedToArray(_ref6[1], 2),
                        y = _ref6$[0],
                        z = _ref6$[1];

                    return [x, y, z];
                });
                var parsing = threeDigits.run('123');
                (0, _chai.expect)((0, _util.isSuccess)(parsing)).to.be.true;
                (0, _chai.expect)(parsing[0].toString()).to.be.eql('[1,2,3]');
                (0, _chai.expect)(parsing[1]).to.be.eql('');
            });
        });
    });

    describe('parse ABC', function () {
        var abcP = void 0,
            parsing = void 0;
        beforeEach(function () {
            abcP = (0, _parsers.andThen)((0, _parsers.pchar)('a'), (0, _parsers.andThen)((0, _parsers.pchar)('b'), (0, _parsers.andThen)((0, _parsers.pchar)('c'), (0, _parsers.returnP)('')).fmap(function (_ref7) {
                var _ref8 = _slicedToArray(_ref7, 2),
                    x = _ref8[0],
                    y = _ref8[1];

                return x + y;
            })).fmap(function (_ref9) {
                var _ref10 = _slicedToArray(_ref9, 2),
                    x = _ref10[0],
                    y = _ref10[1];

                return x + y;
            })).fmap(function (_ref11) {
                var _ref12 = _slicedToArray(_ref11, 2),
                    x = _ref12[0],
                    y = _ref12[1];

                return x + y;
            });
            parsing = abcP.run('abcd');
        });
        it('parses ABC', function () {
            (0, _chai.expect)((0, _util.isSuccess)(parsing)).to.be.true;
            (0, _chai.expect)(parsing[0].toString()).to.be.eql('abc');
            (0, _chai.expect)(parsing[1]).to.be.eql('d');
        });
    });

    describe('a parsers for any of a list of chars', function () {

        it('can parse any lowercase char', function () {
            var lowercasesParser = (0, _parsers.anyOf)(lowercases);

            (0, _chai.expect)((0, _util.isParser)(lowercasesParser)).to.be.true;
            var parsingChoice = lowercasesParser.run('a');
            (0, _chai.expect)((0, _util.isSuccess)(parsingChoice)).to.be.true;
            (0, _chai.expect)(parsingChoice[0]).to.be.eql('a');
            (0, _chai.expect)(parsingChoice[1]).to.be.eql('');
            parsingChoice = lowercasesParser.run('b');
            (0, _chai.expect)((0, _util.isSuccess)(parsingChoice)).to.be.true;
            (0, _chai.expect)(parsingChoice[0]).to.be.eql('b');
            (0, _chai.expect)(parsingChoice[1]).to.be.eql('');
            parsingChoice = lowercasesParser.run('d');
            (0, _chai.expect)((0, _util.isSuccess)(parsingChoice)).to.be.true;
            (0, _chai.expect)(parsingChoice[0]).to.be.eql('d');
            (0, _chai.expect)(parsingChoice[1]).to.be.eql('');
            parsingChoice = lowercasesParser.run('z');
            (0, _chai.expect)((0, _util.isSuccess)(parsingChoice)).to.be.true;
            (0, _chai.expect)(parsingChoice[0]).to.be.eql('z');
            (0, _chai.expect)(parsingChoice[1]).to.be.eql('');

            parsingChoice = lowercasesParser.run('Y');
            (0, _chai.expect)((0, _util.isFailure)(parsingChoice)).to.be.true;
            (0, _chai.expect)(parsingChoice[0]).to.be.eql('anyOf abcdefghijklmnopqrstuvwxyz');
            (0, _chai.expect)(parsingChoice[1]).to.be.eql('_fail');
        });

        it('can parse any uppercase char', function () {
            var uppercasesParser = (0, _parsers.anyOf)(uppercases);

            (0, _chai.expect)((0, _util.isParser)(uppercasesParser)).to.be.true;
            var parsingChoice = uppercasesParser.run('A');
            (0, _chai.expect)((0, _util.isSuccess)(parsingChoice)).to.be.true;
            (0, _chai.expect)(parsingChoice[0]).to.be.eql('A');
            (0, _chai.expect)(parsingChoice[1]).to.be.eql('');
            parsingChoice = uppercasesParser.run('B');
            (0, _chai.expect)((0, _util.isSuccess)(parsingChoice)).to.be.true;
            (0, _chai.expect)(parsingChoice[0]).to.be.eql('B');
            (0, _chai.expect)(parsingChoice[1]).to.be.eql('');
            parsingChoice = uppercasesParser.run('R');
            (0, _chai.expect)((0, _util.isSuccess)(parsingChoice)).to.be.true;
            (0, _chai.expect)(parsingChoice[0]).to.be.eql('R');
            (0, _chai.expect)(parsingChoice[1]).to.be.eql('');
            parsingChoice = uppercasesParser.run('Z');
            (0, _chai.expect)((0, _util.isSuccess)(parsingChoice)).to.be.true;
            (0, _chai.expect)(parsingChoice[0]).to.be.eql('Z');
            (0, _chai.expect)(parsingChoice[1]).to.be.eql('');

            parsingChoice = uppercasesParser.run('s');
            (0, _chai.expect)((0, _util.isFailure)(parsingChoice)).to.be.true;
            (0, _chai.expect)(parsingChoice[0]).to.be.eql('anyOf ABCDEFGHIJKLMNOPQRSTUVWXYZ');
            (0, _chai.expect)(parsingChoice[1]).to.be.eql('_fail');
        });

        it('can parse any digit', function () {
            var digitsParser = (0, _parsers.anyOf)(digits);

            (0, _chai.expect)((0, _util.isParser)(digitsParser)).to.be.true;
            var parsingChoice = digitsParser.run('1');
            (0, _chai.expect)((0, _util.isSuccess)(parsingChoice)).to.be.true;
            (0, _chai.expect)(parsingChoice[0]).to.be.eql('1');
            (0, _chai.expect)(parsingChoice[1]).to.be.eql('');
            parsingChoice = digitsParser.run('3');
            (0, _chai.expect)((0, _util.isSuccess)(parsingChoice)).to.be.true;
            (0, _chai.expect)(parsingChoice[0]).to.be.eql('3');
            (0, _chai.expect)(parsingChoice[1]).to.be.eql('');
            parsingChoice = digitsParser.run('0');
            (0, _chai.expect)((0, _util.isSuccess)(parsingChoice)).to.be.true;
            (0, _chai.expect)(parsingChoice[0]).to.be.eql('0');
            (0, _chai.expect)(parsingChoice[1]).to.be.eql('');
            parsingChoice = digitsParser.run('8');
            (0, _chai.expect)((0, _util.isSuccess)(parsingChoice)).to.be.true;
            (0, _chai.expect)(parsingChoice[0]).to.be.eql('8');
            (0, _chai.expect)(parsingChoice[1]).to.be.eql('');

            parsingChoice = digitsParser.run('s');
            (0, _chai.expect)((0, _util.isFailure)(parsingChoice)).to.be.true;
            (0, _chai.expect)(parsingChoice[0]).to.be.eql('anyOf 0123456789');
            (0, _chai.expect)(parsingChoice[1]).to.be.eql('_fail');
        });
    });

    describe('a choice of parsers bound by orElse', function () {
        var parsersChoice = void 0;

        beforeEach(function () {
            parsersChoice = (0, _parsers.choice)([(0, _parsers.pchar)('a'), (0, _parsers.pchar)('b'), (0, _parsers.pchar)('c'), (0, _parsers.pchar)('d')]);
        });

        it('can parse one of four chars', function () {
            (0, _chai.expect)((0, _util.isParser)(parsersChoice)).to.be.true;
            var parsingChoice = parsersChoice.run('a');
            (0, _chai.expect)((0, _util.isSuccess)(parsingChoice)).to.be.true;
            (0, _chai.expect)(parsingChoice[0]).to.be.eql('a');
            (0, _chai.expect)(parsingChoice[1]).to.be.eql('');
            parsingChoice = parsersChoice.run('b');
            (0, _chai.expect)((0, _util.isSuccess)(parsingChoice)).to.be.true;
            (0, _chai.expect)(parsingChoice[0]).to.be.eql('b');
            (0, _chai.expect)(parsingChoice[1]).to.be.eql('');
            parsingChoice = parsersChoice.run('d');
            (0, _chai.expect)((0, _util.isSuccess)(parsingChoice)).to.be.true;
            (0, _chai.expect)(parsingChoice[0]).to.be.eql('d');
            (0, _chai.expect)(parsingChoice[1]).to.be.eql('');
        });

        it('can also parse NONE of four chars', function () {
            var parsingChoice = parsersChoice.run('x');
            (0, _chai.expect)((0, _util.isFailure)(parsingChoice)).to.be.true;
            (0, _chai.expect)(parsingChoice[0]).to.be.eql('choice /pchar_a/pchar_b/pchar_c/pchar_d');
            (0, _chai.expect)(parsingChoice[1]).to.be.eql('_fail');
        });
    });

    describe('two parsers bound by orElse', function () {
        var parserA = void 0,
            parserB = void 0,
            parserAorB = void 0;

        beforeEach(function () {
            parserAorB = (0, _parsers.orElse)((0, _parsers.pchar)('a'), (0, _parsers.pchar)('b'));
        });

        it('can parse one of two chars', function () {
            (0, _chai.expect)((0, _util.isParser)(parserAorB)).to.be.true;
            var parsingAorB = parserAorB.run('abc');
            (0, _chai.expect)((0, _util.isSuccess)(parsingAorB)).to.be.true;
            (0, _chai.expect)(parsingAorB[0]).to.be.eql('a');
            (0, _chai.expect)(parsingAorB[1]).to.be.eql('bc');
            parsingAorB = parserAorB.run('bbc');
            (0, _chai.expect)((0, _util.isSuccess)(parsingAorB)).to.be.true;
            (0, _chai.expect)(parsingAorB[0]).to.be.eql('b');
            (0, _chai.expect)(parsingAorB[1]).to.be.eql('bc');
        });

        it('can also parse NONE of two chars', function () {
            var parsingAorB = parserAorB.run('cde');
            (0, _chai.expect)((0, _util.isFailure)(parsingAorB)).to.be.true;
            (0, _chai.expect)(parsingAorB[0]).to.be.eql('pchar_a orElse pchar_b');
            (0, _chai.expect)(parsingAorB[1]).to.be.eql('wanted b; got c');
        });
    });

    describe('two parsers bound by andThen', function () {
        var parserAandB = void 0;

        beforeEach(function () {
            parserAandB = (0, _parsers.andThen)((0, _parsers.pchar)('a'), (0, _parsers.pchar)('b'));
        });

        it('can parse two chars', function () {
            (0, _chai.expect)((0, _util.isParser)(parserAandB)).to.be.true;
            var parsingAandB = parserAandB.run('abc');
            (0, _chai.expect)((0, _util.isSuccess)(parsingAandB)).to.be.true;
            (0, _chai.expect)(parsingAandB[0].toString()).to.be.eql('[a,b]');
            (0, _chai.expect)(parsingAandB[1]).to.be.eql('c');
            (0, _chai.expect)(parsingAandB.toString()).to.be.eql('[[a,b],c]');
        });

        it('can also NOT parse two chars', function () {
            var parsingAandB = parserAandB.run('acd');
            (0, _chai.expect)((0, _util.isFailure)(parsingAandB)).to.be.true;
            (0, _chai.expect)(parsingAandB[0]).to.be.eql('pchar_a andThen pchar_b');
            (0, _chai.expect)(parsingAandB[1]).to.be.eql('wanted b; got c');
        });
    });

    describe('a simple parser', function () {
        var parserA = (0, _parsers.charParser)('a');
        var parser1 = (0, _parsers.digitParser)(1);

        it('can parse a single char', function () {
            var parsingA = parserA('abc');
            (0, _chai.expect)(parsingA[0]).to.be.eql('a');
            (0, _chai.expect)(parsingA[1]).to.be.eql('bc');
            (0, _chai.expect)((0, _util.isSuccess)(parsingA)).to.be.true;
        });

        it('can also NOT parse a single char', function () {
            var parsingB = parserA('bcd');
            (0, _chai.expect)(parsingB[0]).to.be.eql('charParser');
            (0, _chai.expect)(parsingB[1]).to.be.eql('wanted a; got b');
            (0, _chai.expect)((0, _util.isFailure)(parsingB)).to.be.true;
        });

        it('can parse a single digit', function () {
            var parsing1 = parser1('123');
            (0, _chai.expect)(parsing1[0]).to.be.eql(1);
            (0, _chai.expect)(parsing1[1]).to.be.eql('23');
            (0, _chai.expect)((0, _util.isSuccess)(parsing1)).to.be.true;
        });

        it('can also NOT parse a single digit', function () {
            var parsing2 = parser1('234');
            (0, _chai.expect)(parsing2[0]).to.be.eql('digitParser');
            (0, _chai.expect)(parsing2[1]).to.be.eql('wanted 1; got 2');
            (0, _chai.expect)((0, _util.isFailure)(parsing2)).to.be.true;
        });
    });

    describe('a slightly more complex parser', function () {
        var parserA = (0, _parsers.charParser)('a');

        it('can parse a single char', function () {
            var parsingA = parserA('abc');
            (0, _chai.expect)(parsingA[0]).to.be.eql('a');
            (0, _chai.expect)(parsingA[1]).to.be.eql('bc');
            (0, _chai.expect)((0, _util.isSuccess)(parsingA)).to.be.true;
        });

        it('can also NOT parse a single char', function () {
            var parsingB = parserA('bcd');
            (0, _chai.expect)(parsingB[0]).to.be.eql('charParser');
            (0, _chai.expect)(parsingB[1]).to.be.eql('wanted a; got b');
            (0, _chai.expect)((0, _util.isFailure)(parsingB)).to.be.true;
        });
    });

    describe('a named character parser', function () {
        var parserA = (0, _parsers.pchar)('a');

        it('can parse a single char', function () {
            (0, _chai.expect)((0, _util.isParser)(parserA)).to.be.true;
            var parsingA = parserA.run('abc');
            (0, _chai.expect)(parsingA[0]).to.be.eql('a');
            (0, _chai.expect)(parsingA[1]).to.be.eql('bc');
            (0, _chai.expect)((0, _util.isSuccess)(parsingA)).to.be.true;
        });

        it('can also NOT parse a single char', function () {
            var parsingB = parserA.run('bcd');
            (0, _chai.expect)(parsingB[0]).to.be.eql('pchar_a');
            (0, _chai.expect)(parsingB[1]).to.be.eql('wanted a; got b');
            (0, _chai.expect)((0, _util.isFailure)(parsingB)).to.be.true;
        });
    });
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2pzLXNwZWMvcGFyc2Vyc190ZXN0cy5qcyJdLCJuYW1lcyI6WyJsb3dlcmNhc2VzIiwidXBwZXJjYXNlcyIsImRpZ2l0cyIsIndoaXRlcyIsImRlc2NyaWJlIiwiaXQiLCJpbnNpZGVQYXJlbnMiLCJkaXNjYXJkRmlyc3QiLCJkaXNjYXJkU2Vjb25kIiwicnVuIiwidG9TdHJpbmciLCJ0byIsImJlIiwiZXFsIiwic3Vic3RyaW5nc1dpdGhDb21tYXMiLCJsaXN0RWxlbWVudHMiLCJkaXNjYXJkSW50ZWdlclNpZ24iLCJwYXJzaW5nIiwiZGlzY2FyZFN1ZmZpeCIsIm9wdERvdFRoZW5BIiwiYW5kVGhlbiIsInBpbnQiLCJmbWFwIiwicGFyc2VJbnQiLCJsIiwicmVkdWNlIiwiYWNjIiwiY3VyciIsInBTaWduZWRJbnQiLCJtYXliZVNpZ24iLCJudW1iZXIiLCJvcHRTdWJzdHJpbmciLCJvbmVPck1vcmVQYXJzZXIiLCJ0cnVlIiwiemVyb09yTW9yZVBhcnNlciIsIndoaXRlc1BhcnNlciIsInR3b1dvcmRzIiwiemVyb09yTW9yZVBhcnNpbmdGdW5jdGlvbiIsIm1hcmNvUGFyc2VyIiwibWFyY29QYXJzaW5nIiwiYWJjUGFyc2VyIiwiYWRkU3RyaW5ncyIsIngiLCJ5IiwiQXBsdXNCIiwiYWRkRGlnaXRzIiwiYWRkUGFyc2VyIiwicGFyc2VEaWdpdCIsInRocmVlRGlnaXRzIiwiYmVmb3JlRWFjaCIsInoiLCJhYmNQIiwibG93ZXJjYXNlc1BhcnNlciIsInBhcnNpbmdDaG9pY2UiLCJ1cHBlcmNhc2VzUGFyc2VyIiwiZGlnaXRzUGFyc2VyIiwicGFyc2Vyc0Nob2ljZSIsInBhcnNlckEiLCJwYXJzZXJCIiwicGFyc2VyQW9yQiIsInBhcnNpbmdBb3JCIiwicGFyc2VyQWFuZEIiLCJwYXJzaW5nQWFuZEIiLCJwYXJzZXIxIiwicGFyc2luZ0EiLCJwYXJzaW5nQiIsInBhcnNpbmcxIiwicGFyc2luZzIiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7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QUFTLENBQVQsQ0FBUCxFQUFvQnRELEVBQXBCLENBQXVCQyxFQUF2QixDQUEwQkMsR0FBMUIsQ0FBOEIsaUJBQTlCO0FBQ0EsOEJBQU8scUJBQVVvRCxRQUFWLENBQVAsRUFBNEJ0RCxFQUE1QixDQUErQkMsRUFBL0IsQ0FBa0NxQixJQUFsQztBQUNILFNBTEQ7QUFNSCxLQWpCRCIsImZpbGUiOiJwYXJzZXJzX3Rlc3RzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtleHBlY3R9IGZyb20gJ2NoYWknO1xuaW1wb3J0IHtcbiAgICBjaGFyUGFyc2VyLFxuICAgIGRpZ2l0UGFyc2VyLFxuICAgIHBjaGFyLFxuICAgIHBkaWdpdCxcbiAgICBhbmRUaGVuLFxuICAgIG9yRWxzZSxcbiAgICBjaG9pY2UsXG4gICAgYW55T2YsXG4gICAgZm1hcCxcbiAgICByZXR1cm5QLFxuICAgIGFwcGx5UCxcbiAgICBsaWZ0MixcbiAgICBzZXF1ZW5jZVAsXG4gICAgc2VxdWVuY2VQMixcbiAgICBwc3RyaW5nLFxuICAgIHplcm9Pck1vcmUsXG4gICAgbWFueSxcbiAgICBtYW55MSxcbiAgICBvcHQsXG4gICAgb3B0Qm9vayxcbiAgICBkaXNjYXJkRmlyc3QsXG4gICAgZGlzY2FyZFNlY29uZCxcbiAgICBiZXR3ZWVuLFxuICAgIGJldHdlZW5QYXJlbnMsXG59IGZyb20gJ3BhcnNlcnMnO1xuaW1wb3J0IHtcbiAgICBpc1BhaXIsXG4gICAgaXNTdWNjZXNzLFxuICAgIGlzRmFpbHVyZSxcbiAgICBpc1BhcnNlcixcbiAgICBpc1NvbWUsXG4gICAgaXNOb25lLFxufSBmcm9tICd1dGlsJztcblxuY29uc3QgbG93ZXJjYXNlcyA9IFsnYScsICdiJywgJ2MnLCAnZCcsICdlJywgJ2YnLCAnZycsICdoJywgJ2knLCAnaicsICdrJywgJ2wnLCAnbScsICduJywgJ28nLCAncCcsICdxJywgJ3InLCAncycsICd0JywgJ3UnLCAndicsICd3JywgJ3gnLCAneScsICd6JyxdO1xuY29uc3QgdXBwZXJjYXNlcyA9IFsnQScsICdCJywgJ0MnLCAnRCcsICdFJywgJ0YnLCAnRycsICdIJywgJ0knLCAnSicsICdLJywgJ0wnLCAnTScsICdOJywgJ08nLCAnUCcsICdRJywgJ1InLCAnUycsICdUJywgJ1UnLCAnVicsICdXJywgJ1gnLCAnWScsICdaJyxdO1xuY29uc3QgZGlnaXRzID0gWycwJywgJzEnLCAnMicsICczJywgJzQnLCAnNScsICc2JywgJzcnLCAnOCcsICc5J107XG5jb25zdCB3aGl0ZXMgPSBbJyAnLCAnXFx0JywgJ1xcbicsICdcXHInXTtcblxuZGVzY3JpYmUoJ3BhcnNpbmcgd2hpbGUgZGlzY2FyZGluZyBpbnB1dCcsICgpID0+IHtcbiAgICBpdCgnYWxsb3dzIHRvIGV4Y2x1ZGUgcGFyZW50aGVzZXMnLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IGluc2lkZVBhcmVucyA9IHBjaGFyKCcoJylcbiAgICAgICAgICAgIC5kaXNjYXJkRmlyc3QobWFueShhbnlPZihsb3dlcmNhc2VzKSkpXG4gICAgICAgICAgICAuZGlzY2FyZFNlY29uZChwY2hhcignKScpKTtcbiAgICAgICAgZXhwZWN0KGluc2lkZVBhcmVucy5ydW4oJyhtYXJjbyknKS50b1N0cmluZygpKS50by5iZS5lcWwoJ1tbbSxhLHIsYyxvXSxdJyk7XG4gICAgICAgIGV4cGVjdChpbnNpZGVQYXJlbnMucnVuKCcoKScpLnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgnW1tdLF0nKTtcbiAgICB9KTtcbiAgICBpdCgnLi4uZXZlbiB1c2luZyBhIHRhaWxvci1tYWRlIG1ldGhvZCcsICgpID0+IHtcbiAgICAgICAgY29uc3QgaW5zaWRlUGFyZW5zID0gYmV0d2VlblBhcmVucyhwc3RyaW5nKCdtYXJjbycpKTtcbiAgICAgICAgZXhwZWN0KGluc2lkZVBhcmVucy5ydW4oJyhtYXJjbyknKS50b1N0cmluZygpKS50by5iZS5lcWwoJ1tbbSxhLHIsYyxvXSxdJyk7XG4gICAgfSk7XG4gICAgaXQoJ2NoZXJyeS1waWNraW5nIGVsZW1lbnRzIHNlcGFyYXRlZCBieSBzZXBhcmF0b3JzJywgKCkgPT4ge1xuICAgICAgICBjb25zdCBzdWJzdHJpbmdzV2l0aENvbW1hcyA9IG1hbnkobWFueTEoYW55T2YobG93ZXJjYXNlcykpLmRpc2NhcmRTZWNvbmQocGNoYXIoJywnKSkpO1xuICAgICAgICBleHBlY3Qoc3Vic3RyaW5nc1dpdGhDb21tYXMucnVuKCdhLGIsY2QsMScpLnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgnW1tbYV0sW2JdLFtjLGRdXSwxXScpO1xuICAgIH0pO1xuICAgIGl0KCcuLi5hbHNvIHdoZW4gaW5zaWRlIGEgbGlzdHMnLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHN1YnN0cmluZ3NXaXRoQ29tbWFzID0gbWFueShtYW55MShhbnlPZihsb3dlcmNhc2VzKSkuZGlzY2FyZFNlY29uZChwY2hhcignLCcpKSk7XG4gICAgICAgIGNvbnN0IGxpc3RFbGVtZW50cyA9IGJldHdlZW4ocGNoYXIoJ1snKSwgc3Vic3RyaW5nc1dpdGhDb21tYXMsIHBjaGFyKCddJykpO1xuICAgICAgICBleHBlY3QobGlzdEVsZW1lbnRzLnJ1bignW2EsYixjZCxtYXJjbyxdMScpLnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgnW1tbYV0sW2JdLFtjLGRdLFttLGEscixjLG9dXSwxXScpO1xuICAgIH0pO1xufSk7XG5cbmRlc2NyaWJlKCdhIGNvdXBsZSBvZiBwYXJzZXJzJywgKCkgPT4ge1xuICAgIGl0KCdjYW4gZGVjaWRlIHRvIGRpc2NhcmQgdGhlIG1hdGNoZXMgb2YgdGhlIGZpcnN0IG9uZScsICgpID0+IHtcbiAgICAgICAgY29uc3QgZGlzY2FyZEludGVnZXJTaWduID0gcGNoYXIoJy0nKS5kaXNjYXJkRmlyc3QocGRpZ2l0KDgpKTtcbiAgICAgICAgbGV0IHBhcnNpbmcgPSBkaXNjYXJkSW50ZWdlclNpZ24ucnVuKCctOHgnKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcudG9TdHJpbmcoKSkudG8uYmUuZXFsKCdbOCx4XScpO1xuICAgIH0pO1xuICAgIGl0KCdjYW4gZGVjaWRlIHRvIGRpc2NhcmQgdGhlIG1hdGNoZXMgb2YgdGhlIHNlY29uZCBvbmUnLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IGRpc2NhcmRTdWZmaXggPSBwc3RyaW5nKCdtYXJjbycpLmRpc2NhcmRTZWNvbmQobWFueTEoYW55T2Yod2hpdGVzKSkpO1xuICAgICAgICBsZXQgcGFyc2luZyA9IGRpc2NhcmRTdWZmaXgucnVuKCdtYXJjbyBmYXVzdGluZWxsaScpO1xuICAgICAgICBleHBlY3QocGFyc2luZy50b1N0cmluZygpKS50by5iZS5lcWwoJ1tbbSxhLHIsYyxvXSxmYXVzdGluZWxsaV0nKTtcbiAgICAgICAgcGFyc2luZyA9IGRpc2NhcmRTdWZmaXgucnVuKCdtYXJjbyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmF1c3RpbmVsbGknKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcudG9TdHJpbmcoKSkudG8uYmUuZXFsKCdbW20sYSxyLGMsb10sZmF1c3RpbmVsbGldJyk7XG4gICAgfSk7XG59KTtcblxuZGVzY3JpYmUoJ2EgcGFyc2VyIGZvciBvcHRpb25hbCBjaGFyYWN0ZXJzJywgKCkgPT4ge1xuICAgIGl0KCdjYW4gY2FwdHVyZSBvciBub3QgY2FwdHVyZSBhIGRvdCcsICgpID0+IHtcbiAgICAgICAgY29uc3Qgb3B0RG90VGhlbkEgPSBvcHQocGNoYXIoJy4nKSkuYW5kVGhlbihwY2hhcignYScpKTtcbiAgICAgICAgZXhwZWN0KG9wdERvdFRoZW5BLnJ1bignLmFiYycpLnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgnW1tzb21lKC4pLGFdLGJjXScpO1xuICAgICAgICBleHBlY3Qob3B0RG90VGhlbkEucnVuKCdhYmMnKS50b1N0cmluZygpKS50by5iZS5lcWwoJ1tbbm9uZSgpLGFdLGJjXScpO1xuICAgIH0pO1xuICAgIGl0KCdjYW4gcGFyc2UgU0lHTkVEIGludGVnZXJzISEhJywgKCkgPT4ge1xuICAgICAgICBjb25zdCBwaW50ID0gbWFueTEoYW55T2YoZGlnaXRzKSlcbiAgICAgICAgICAgIC5mbWFwKGwgPT4gcGFyc2VJbnQobC5yZWR1Y2UoKGFjYywgY3VycikgPT4gYWNjICsgY3VyciwgJycpLCAxMCkpO1xuICAgICAgICBjb25zdCBwU2lnbmVkSW50ID0gb3B0KHBjaGFyKCctJykpXG4gICAgICAgICAgICAuYW5kVGhlbihwaW50KVxuICAgICAgICAgICAgLmZtYXAoKFttYXliZVNpZ24sIG51bWJlcl0pID0+IChpc1NvbWUobWF5YmVTaWduKSkgPyAtbnVtYmVyIDogbnVtYmVyKTtcbiAgICAgICAgZXhwZWN0KHBTaWduZWRJbnQucnVuKCcxMzI0MzU0NngnKVswXSkudG8uYmUuZXFsKDEzMjQzNTQ2KTtcbiAgICAgICAgZXhwZWN0KHBTaWduZWRJbnQucnVuKCctMTMyNDM1NDZ4JylbMF0pLnRvLmJlLmVxbCgtMTMyNDM1NDYpO1xuICAgIH0pO1xuICAgIGl0KCdjYW4gY2FwdHVyZSBvciBub3QgY2FwdHVyZSBhIHdob2xlIHN1YnN0cmluZycsICgpID0+IHtcbiAgICAgICAgY29uc3Qgb3B0U3Vic3RyaW5nID0gb3B0KHBzdHJpbmcoJ21hcmNvJykpLmFuZFRoZW4ocHN0cmluZygnZmF1c3RpbmVsbGknKSk7XG4gICAgICAgIGV4cGVjdChvcHRTdWJzdHJpbmcucnVuKCdtYXJjb2ZhdXN0aW5lbGxpeCcpLnRvU3RyaW5nKCkpXG4gICAgICAgICAgICAudG8uYmUuZXFsKCdbW3NvbWUoW20sYSxyLGMsb10pLFtmLGEsdSxzLHQsaSxuLGUsbCxsLGldXSx4XScpO1xuICAgICAgICBleHBlY3Qob3B0U3Vic3RyaW5nLnJ1bignZmF1c3RpbmVsbGl4JykudG9TdHJpbmcoKSlcbiAgICAgICAgICAgIC50by5iZS5lcWwoJ1tbbm9uZSgpLFtmLGEsdSxzLHQsaSxuLGUsbCxsLGldXSx4XScpO1xuICAgIH0pO1xufSk7XG5cbmRlc2NyaWJlKCdhIHBhcnNlciBmb3Igb25lIG9yIG1vcmUgb2NjdXJyZW5jZXMnLCAoKSA9PiB7XG4gICAgaXQoJ2Nhbm5vdCBwYXJzZSBhIGNoYXIgemVybyB0aW1lcycsICgpID0+IHtcbiAgICAgICAgY29uc3Qgb25lT3JNb3JlUGFyc2VyID0gbWFueTEocGNoYXIoJ20nKSk7XG4gICAgICAgIGxldCBwYXJzaW5nID0gb25lT3JNb3JlUGFyc2VyLnJ1bignYXJjbycpO1xuICAgICAgICBleHBlY3QoaXNGYWlsdXJlKHBhcnNpbmcpKS50by5iZS50cnVlO1xuICAgICAgICBleHBlY3QocGFyc2luZy50b1N0cmluZygpKS50by5iZS5lcWwoJ1ttYW55MSBwY2hhcl9tLHdhbnRlZCBtOyBnb3QgYV0nKTtcbiAgICB9KTtcbiAgICBpdCgnY2FuIHBhcnNlIGEgY2hhciBtYW55IHRpbWVzJywgKCkgPT4ge1xuICAgICAgICBjb25zdCBvbmVPck1vcmVQYXJzZXIgPSBtYW55MShwY2hhcignbScpKTtcbiAgICAgICAgbGV0IHBhcnNpbmcgPSBvbmVPck1vcmVQYXJzZXIucnVuKCdtbW1hcmNvJyk7XG4gICAgICAgIGV4cGVjdChpc1N1Y2Nlc3MocGFyc2luZykpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgnW1ttLG0sbV0sYXJjb10nKTtcbiAgICB9KTtcbiAgICBpdCgnY2Fubm90IHBhcnNlIGEgY2hhciBzZXF1ZW5jZSB6ZXJvIHRpbWVzJywgKCkgPT4ge1xuICAgICAgICBjb25zdCBvbmVPck1vcmVQYXJzZXIgPSBtYW55MShwc3RyaW5nKCdtYXJjbycpKTtcbiAgICAgICAgbGV0IHBhcnNpbmcgPSBvbmVPck1vcmVQYXJzZXIucnVuKCd4bWFyY29tYXJjb2NpYW8nKTtcbiAgICAgICAgZXhwZWN0KGlzRmFpbHVyZShwYXJzaW5nKSkudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcudG9TdHJpbmcoKSkudG8uYmUuZXFsKCdbbWFueTEgcHN0cmluZyBtYXJjbyx3YW50ZWQgbTsgZ290IHhdJyk7XG4gICAgfSk7XG4gICAgaXQoJ2NhbiBwYXJzZSBhIGNoYXIgc2VxdWVuY2UgbWFueSB0aW1lcycsICgpID0+IHtcbiAgICAgICAgY29uc3Qgb25lT3JNb3JlUGFyc2VyID0gbWFueTEocHN0cmluZygnbWFyY28nKSk7XG4gICAgICAgIGxldCBwYXJzaW5nID0gb25lT3JNb3JlUGFyc2VyLnJ1bignbWFyY29tYXJjb2NpYW8nKTtcbiAgICAgICAgZXhwZWN0KGlzU3VjY2VzcyhwYXJzaW5nKSkudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcudG9TdHJpbmcoKSkudG8uYmUuZXFsKCdbW1ttLGEscixjLG9dLFttLGEscixjLG9dXSxjaWFvXScpO1xuICAgIH0pO1xuICAgIGl0KCdjYW4gcGFyc2UgYW4gaW50ZWdlciwgbm8gbWF0dGVyIGhvdyBsYXJnZS4uLicsICgpID0+IHtcbiAgICAgICAgY29uc3QgcGludCA9IG1hbnkxKGFueU9mKGRpZ2l0cykpO1xuICAgICAgICBsZXQgcGFyc2luZyA9IHBpbnQucnVuKCcxMjM0NUEnKTtcbiAgICAgICAgZXhwZWN0KGlzU3VjY2VzcyhwYXJzaW5nKSkudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcudG9TdHJpbmcoKSkudG8uYmUuZXFsKCdbWzEsMiwzLDQsNV0sQV0nKTtcbiAgICAgICAgcGFyc2luZyA9IHBpbnQucnVuKCcxQicpO1xuICAgICAgICBleHBlY3QoaXNTdWNjZXNzKHBhcnNpbmcpKS50by5iZS50cnVlO1xuICAgICAgICBleHBlY3QocGFyc2luZy50b1N0cmluZygpKS50by5iZS5lcWwoJ1tbMV0sQl0nKTtcbiAgICAgICAgcGFyc2luZyA9IHBpbnQucnVuKCdBMTIzNDUnKTtcbiAgICAgICAgZXhwZWN0KGlzRmFpbHVyZShwYXJzaW5nKSkudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcudG9TdHJpbmcoKSkudG8uYmUuZXFsKCdbbWFueTEgYW55T2YgMDEyMzQ1Njc4OSxfZmFpbF0nKTtcbiAgICB9KTtcbiAgICBpdCgnY2FuIHBhcnNlIGFuIGludGVnZXIgaW50byBhIHRydWUgaW50ZWdlcicsICgpID0+IHtcbiAgICAgICAgY29uc3QgcGludCA9IG1hbnkxKGFueU9mKGRpZ2l0cykpXG4gICAgICAgICAgICAuZm1hcChsID0+IHBhcnNlSW50KGwucmVkdWNlKChhY2MsIGN1cnIpID0+IGFjYyArIGN1cnIsICcnKSwgMTApKTtcbiAgICAgICAgbGV0IHBhcnNpbmcgPSBwaW50LnJ1bignMTIzNDVBJyk7XG4gICAgICAgIGV4cGVjdChpc1N1Y2Nlc3MocGFyc2luZykpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nWzBdKS50by5iZS5lcWwoMTIzNDUpO1xuICAgICAgICBleHBlY3QocGFyc2luZ1sxXSkudG8uYmUuZXFsKCdBJyk7XG4gICAgfSk7XG59KTtcblxuZGVzY3JpYmUoJ2EgcGFyc2VyIGZvciB6ZXJvIG9yIG1vcmUgb2NjdXJyZW5jZXMnLCAoKSA9PiB7XG4gICAgaXQoJ2NhbiBwYXJzZSBhIGNoYXIgemVybyB0aW1lcycsICgpID0+IHtcbiAgICAgICAgY29uc3QgemVyb09yTW9yZVBhcnNlciA9IG1hbnkocGNoYXIoJ20nKSk7XG4gICAgICAgIGxldCBwYXJzaW5nID0gemVyb09yTW9yZVBhcnNlci5ydW4oJ2FyY28nKTtcbiAgICAgICAgZXhwZWN0KGlzU3VjY2VzcyhwYXJzaW5nKSkudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcudG9TdHJpbmcoKSkudG8uYmUuZXFsKCdbW10sYXJjb10nKTtcbiAgICB9KTtcbiAgICBpdCgnY2FuIHBhcnNlIGEgY2hhciBtYW55IHRpbWVzJywgKCkgPT4ge1xuICAgICAgICBjb25zdCB6ZXJvT3JNb3JlUGFyc2VyID0gbWFueShwY2hhcignbScpKTtcbiAgICAgICAgbGV0IHBhcnNpbmcgPSB6ZXJvT3JNb3JlUGFyc2VyLnJ1bignbW1tYXJjbycpO1xuICAgICAgICBleHBlY3QoaXNTdWNjZXNzKHBhcnNpbmcpKS50by5iZS50cnVlO1xuICAgICAgICBleHBlY3QocGFyc2luZy50b1N0cmluZygpKS50by5iZS5lcWwoJ1tbbSxtLG1dLGFyY29dJyk7XG4gICAgfSk7XG4gICAgaXQoJ2NhbiBwYXJzZSBhIGNoYXIgc2VxdWVuY2UgemVybyB0aW1lcycsICgpID0+IHtcbiAgICAgICAgY29uc3QgemVyb09yTW9yZVBhcnNlciA9IG1hbnkocHN0cmluZygnbWFyY28nKSk7XG4gICAgICAgIGxldCBwYXJzaW5nID0gemVyb09yTW9yZVBhcnNlci5ydW4oJ3htYXJjb21hcmNvY2lhbycpO1xuICAgICAgICBleHBlY3QoaXNTdWNjZXNzKHBhcnNpbmcpKS50by5iZS50cnVlO1xuICAgICAgICBleHBlY3QocGFyc2luZy50b1N0cmluZygpKS50by5iZS5lcWwoJ1tbXSx4bWFyY29tYXJjb2NpYW9dJyk7XG4gICAgfSk7XG4gICAgaXQoJ2NhbiBwYXJzZSBhIGNoYXIgc2VxdWVuY2UgbWFueSB0aW1lcycsICgpID0+IHtcbiAgICAgICAgY29uc3QgemVyb09yTW9yZVBhcnNlciA9IG1hbnkocHN0cmluZygnbWFyY28nKSk7XG4gICAgICAgIGxldCBwYXJzaW5nID0gemVyb09yTW9yZVBhcnNlci5ydW4oJ21hcmNvbWFyY29jaWFvJyk7XG4gICAgICAgIGV4cGVjdChpc1N1Y2Nlc3MocGFyc2luZykpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgnW1tbbSxhLHIsYyxvXSxbbSxhLHIsYyxvXV0sY2lhb10nKTtcbiAgICB9KTtcbiAgICBpdCgnY2FuIHBhcnNlIHdoaXRlc3BhY2VzISEnLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHdoaXRlc1BhcnNlciA9IG1hbnkoYW55T2Yod2hpdGVzKSk7XG4gICAgICAgIGNvbnN0IHR3b1dvcmRzID0gc2VxdWVuY2VQKFtwc3RyaW5nKCdjaWFvJyksIHdoaXRlc1BhcnNlciwgcHN0cmluZygnbWFtbWEnKV0pO1xuICAgICAgICBsZXQgcGFyc2luZyA9IHR3b1dvcmRzLnJ1bignY2lhb21hbW1hWCcpO1xuICAgICAgICBleHBlY3QocGFyc2luZy50b1N0cmluZygpKS50by5iZS5lcWwoJ1tbW2MsaSxhLG9dLFtdLFttLGEsbSxtLGFdXSxYXScpO1xuICAgICAgICBwYXJzaW5nID0gdHdvV29yZHMucnVuKCdjaWFvIG1hbW1hWCcpO1xuICAgICAgICBleHBlY3QocGFyc2luZy50b1N0cmluZygpKS50by5iZS5lcWwoJ1tbW2MsaSxhLG9dLFsgXSxbbSxhLG0sbSxhXV0sWF0nKTtcbiAgICAgICAgcGFyc2luZyA9IHR3b1dvcmRzLnJ1bignY2lhbyAgIG1hbW1hWCcpO1xuICAgICAgICBleHBlY3QocGFyc2luZy50b1N0cmluZygpKS50by5iZS5lcWwoJ1tbW2MsaSxhLG9dLFsgLCAsIF0sW20sYSxtLG0sYV1dLFhdJyk7XG4gICAgICAgIHBhcnNpbmcgPSB0d29Xb3Jkcy5ydW4oJ2NpYW8gXFx0IG1hbW1hWCcpO1xuICAgICAgICBleHBlY3QocGFyc2luZy50b1N0cmluZygpKS50by5iZS5lcWwoJ1tbW2MsaSxhLG9dLFsgLFxcdCwgXSxbbSxhLG0sbSxhXV0sWF0nKTtcbiAgICB9KTtcbn0pO1xuXG5kZXNjcmliZSgnYSBwYXJzaW5nIGZ1bmN0aW9uIGZvciB6ZXJvIG9yIG1vcmUgb2NjdXJyZW5jZXMnLCAoKSA9PiB7XG4gICAgaXQoJ2NhbiBwYXJzZSBhIGNoYXIgemVybyB0aW1lcycsICgpID0+IHtcbiAgICAgICAgY29uc3QgemVyb09yTW9yZVBhcnNpbmdGdW5jdGlvbiA9IHplcm9Pck1vcmUocGNoYXIoJ20nKSk7XG4gICAgICAgIGxldCBwYXJzaW5nID0gemVyb09yTW9yZVBhcnNpbmdGdW5jdGlvbignYXJjbycpO1xuICAgICAgICBleHBlY3QoaXNTdWNjZXNzKHBhcnNpbmcpKS50by5iZS50cnVlO1xuICAgICAgICBleHBlY3QocGFyc2luZy50b1N0cmluZygpKS50by5iZS5lcWwoJ1tbXSxhcmNvXScpO1xuICAgIH0pO1xuICAgIGl0KCdjYW4gcGFyc2UgYSBjaGFyIG1hbnkgdGltZXMnLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHplcm9Pck1vcmVQYXJzaW5nRnVuY3Rpb24gPSB6ZXJvT3JNb3JlKHBjaGFyKCdtJykpO1xuICAgICAgICBsZXQgcGFyc2luZyA9IHplcm9Pck1vcmVQYXJzaW5nRnVuY3Rpb24oJ21tbWFyY28nKTtcbiAgICAgICAgZXhwZWN0KGlzU3VjY2VzcyhwYXJzaW5nKSkudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcudG9TdHJpbmcoKSkudG8uYmUuZXFsKCdbW20sbSxtXSxhcmNvXScpO1xuICAgIH0pO1xuICAgIGl0KCdjYW4gcGFyc2UgYSBjaGFyIHNlcXVlbmNlIHplcm8gdGltZXMnLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHplcm9Pck1vcmVQYXJzaW5nRnVuY3Rpb24gPSB6ZXJvT3JNb3JlKHBzdHJpbmcoJ21hcmNvJykpO1xuICAgICAgICBsZXQgcGFyc2luZyA9IHplcm9Pck1vcmVQYXJzaW5nRnVuY3Rpb24oJ3htYXJjb21hcmNvY2lhbycpO1xuICAgICAgICBleHBlY3QoaXNTdWNjZXNzKHBhcnNpbmcpKS50by5iZS50cnVlO1xuICAgICAgICBleHBlY3QocGFyc2luZy50b1N0cmluZygpKS50by5iZS5lcWwoJ1tbXSx4bWFyY29tYXJjb2NpYW9dJyk7XG4gICAgfSk7XG4gICAgaXQoJ2NhbiBwYXJzZSBhIGNoYXIgc2VxdWVuY2UgbWFueSB0aW1lcycsICgpID0+IHtcbiAgICAgICAgY29uc3QgemVyb09yTW9yZVBhcnNpbmdGdW5jdGlvbiA9IHplcm9Pck1vcmUocHN0cmluZygnbWFyY28nKSk7XG4gICAgICAgIGxldCBwYXJzaW5nID0gemVyb09yTW9yZVBhcnNpbmdGdW5jdGlvbignbWFyY29tYXJjb2NpYW8nKTtcbiAgICAgICAgZXhwZWN0KGlzU3VjY2VzcyhwYXJzaW5nKSkudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcudG9TdHJpbmcoKSkudG8uYmUuZXFsKCdbW1ttLGEscixjLG9dLFttLGEscixjLG9dXSxjaWFvXScpO1xuICAgIH0pO1xufSk7XG5cbmRlc2NyaWJlKCdhIHBhcnNlciBmb3IgYSBzcGVjaWZpYyB3b3JkJywgKCkgPT4ge1xuICAgIGl0KCdpcyBlYXN5IHRvIGNyZWF0ZSB3aXRoIHNlcXVlbmNlUCcsICgpID0+IHtcbiAgICAgICAgY29uc3QgbWFyY29QYXJzZXIgPSBwc3RyaW5nKCdtYXJjbycpO1xuICAgICAgICBjb25zdCBtYXJjb1BhcnNpbmcgPSBtYXJjb1BhcnNlci5ydW4oJ21hcmNvY2lhbycpO1xuICAgICAgICBleHBlY3QoaXNTdWNjZXNzKG1hcmNvUGFyc2luZykpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChtYXJjb1BhcnNpbmcudG9TdHJpbmcoKSkudG8uYmUuZXFsKCdbW20sYSxyLGMsb10sY2lhb10nKTtcbiAgICB9KTtcbn0pO1xuXG5kZXNjcmliZSgnc2VxdWVuY2VzIG9mIHBhcnNlcnMgYmFzZWQgb24gbGlmdDIoY29ucykgKGFrYSBzZXF1ZW5jZVApJywgKCkgPT4ge1xuICAgIGl0KCdzdG9yZXMgbWF0Y2hlZCBjaGFycyBpbnNpZGUgYW4gYXJyYXknLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IGFiY1BhcnNlciA9IHNlcXVlbmNlUChbcGNoYXIoJ2EnKSwgcGNoYXIoJ2InKSwgcGNoYXIoJ2MnKSxdKTtcbiAgICAgICAgZXhwZWN0KGFiY1BhcnNlci5ydW4oJ2FiYycpLnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgnW1thLGIsY10sXScpO1xuICAgIH0pO1xufSk7XG5cbmRlc2NyaWJlKCdzZXF1ZW5jZXMgb2YgcGFyc2VycyBiYXNlZCBvbiBhbmRUaGVuICYmIGZtYXAgKGFrYSBzZXF1ZW5jZVAyKScsICgpID0+IHtcbiAgICBpdCgnc3RvcmUgbWF0Y2hlZCBjaGFycyBpbnNpZGUgYSBwbGFpbiBzdHJpbmcnLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IGFiY1BhcnNlciA9IHNlcXVlbmNlUDIoW3BjaGFyKCdhJyksIHBjaGFyKCdiJyksIHBjaGFyKCdjJyksXSk7XG4gICAgICAgIGV4cGVjdChhYmNQYXJzZXIucnVuKCdhYmMnKS50b1N0cmluZygpKS50by5iZS5lcWwoJ1thYmMsXScpO1xuICAgIH0pO1xufSk7XG5cbmRlc2NyaWJlKCdsaWZ0MiBmb3IgcGFyc2VycycsICgpID0+IHtcbiAgICBpdCgnb3BlcmF0ZXMgb24gdGhlIHJlc3VsdHMgb2YgdHdvIHN0cmluZyBwYXJzaW5ncycsICgpID0+IHtcbiAgICAgICAgY29uc3QgYWRkU3RyaW5ncyA9IHggPT4geSA9PiB4ICsgJysnICsgeTtcbiAgICAgICAgY29uc3QgQXBsdXNCID0gbGlmdDIoYWRkU3RyaW5ncykocGNoYXIoJ2EnKSkocGNoYXIoJ2InKSk7XG4gICAgICAgIGV4cGVjdChBcGx1c0IucnVuKCdhYmMnKS50b1N0cmluZygpKS50by5iZS5lcWwoJ1thK2IsY10nKTtcbiAgICB9KTtcbiAgICBpdCgnYWRkcyB0aGUgcmVzdWx0cyBvZiB0d28gZGlnaXQgcGFyc2luZ3MnLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IGFkZERpZ2l0cyA9IHggPT4geSA9PiB4ICsgeTtcbiAgICAgICAgY29uc3QgYWRkUGFyc2VyID0gbGlmdDIoYWRkRGlnaXRzKShwZGlnaXQoMSkpKHBkaWdpdCgyKSk7XG4gICAgICAgIGV4cGVjdChhZGRQYXJzZXIucnVuKCcxMjM0JykudG9TdHJpbmcoKSkudG8uYmUuZXFsKCdbMywzNF0nKTtcbiAgICAgICAgZXhwZWN0KGlzRmFpbHVyZShhZGRQYXJzZXIucnVuKCcxNDQnKSkpLnRvLmJlLnRydWU7XG4gICAgfSk7XG59KTtcblxuZGVzY3JpYmUoJ3BhcnNlIDMgZGlnaXRzJywgKCkgPT4ge1xuICAgIGxldCBwYXJzZURpZ2l0LCB0aHJlZURpZ2l0cywgcGFyc2luZztcbiAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgICAgcGFyc2VEaWdpdCA9IGFueU9mKGRpZ2l0cyk7XG4gICAgICAgIHRocmVlRGlnaXRzID0gYW5kVGhlbihwYXJzZURpZ2l0LCBhbmRUaGVuKHBhcnNlRGlnaXQsIHBhcnNlRGlnaXQpKTtcbiAgICAgICAgcGFyc2luZyA9IHRocmVlRGlnaXRzLnJ1bignMTIzJyk7XG4gICAgfSk7XG4gICAgaXQoJ3BhcnNlcyBhbnkgb2YgdGhyZWUgZGlnaXRzJywgKCkgPT4ge1xuICAgICAgICBleHBlY3QoaXNTdWNjZXNzKHBhcnNpbmcpKS50by5iZS50cnVlO1xuICAgICAgICBleHBlY3QocGFyc2luZ1swXS50b1N0cmluZygpKS50by5iZS5lcWwoJ1sxLFsyLDNdXScpO1xuICAgICAgICBleHBlY3QocGFyc2luZ1sxXSkudG8uYmUuZXFsKCcnKTtcbiAgICB9KTtcbiAgICBkZXNjcmliZSgncGFyc2VzIGFueSBvZiB0aHJlZSBkaWdpdHMgd2hpbGUgc2hvd2Nhc2luZyBmbWFwJywgKCkgPT4ge1xuICAgICAgICBpdCgnYXMgZ2xvYmFsIG1ldGhvZCcsICgpID0+IHtcbiAgICAgICAgICAgIHRocmVlRGlnaXRzID0gZm1hcCgoW3gsIFt5LCB6XV0pID0+IFt4LCB5LCB6XSwgdGhyZWVEaWdpdHMpO1xuICAgICAgICAgICAgbGV0IHBhcnNpbmcgPSB0aHJlZURpZ2l0cy5ydW4oJzEyMycpO1xuICAgICAgICAgICAgZXhwZWN0KGlzU3VjY2VzcyhwYXJzaW5nKSkudG8uYmUudHJ1ZTtcbiAgICAgICAgICAgIGV4cGVjdChwYXJzaW5nWzBdLnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgnWzEsMiwzXScpO1xuICAgICAgICAgICAgZXhwZWN0KHBhcnNpbmdbMV0pLnRvLmJlLmVxbCgnJyk7XG4gICAgICAgIH0pO1xuICAgICAgICBpdCgnYXMgaW5zdGFuY2UgbWV0aG9kJywgKCkgPT4ge1xuICAgICAgICAgICAgdGhyZWVEaWdpdHMgPSB0aHJlZURpZ2l0cy5mbWFwKChbeCwgW3ksIHpdXSkgPT4gW3gsIHksIHpdKTtcbiAgICAgICAgICAgIGxldCBwYXJzaW5nID0gdGhyZWVEaWdpdHMucnVuKCcxMjMnKTtcbiAgICAgICAgICAgIGV4cGVjdChpc1N1Y2Nlc3MocGFyc2luZykpLnRvLmJlLnRydWU7XG4gICAgICAgICAgICBleHBlY3QocGFyc2luZ1swXS50b1N0cmluZygpKS50by5iZS5lcWwoJ1sxLDIsM10nKTtcbiAgICAgICAgICAgIGV4cGVjdChwYXJzaW5nWzFdKS50by5iZS5lcWwoJycpO1xuICAgICAgICB9KTtcbiAgICB9KTtcbn0pO1xuXG5kZXNjcmliZSgncGFyc2UgQUJDJywgKCkgPT4ge1xuICAgIGxldCBhYmNQLCBwYXJzaW5nO1xuICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgICBhYmNQID0gYW5kVGhlbihwY2hhcignYScpLFxuICAgICAgICAgICAgYW5kVGhlbihwY2hhcignYicpLFxuICAgICAgICAgICAgICAgIGFuZFRoZW4ocGNoYXIoJ2MnKSwgcmV0dXJuUCgnJykpLmZtYXAoKFt4LCB5XSkgPT4geCArIHkpXG4gICAgICAgICAgICApLmZtYXAoKFt4LCB5XSkgPT4geCArIHkpXG4gICAgICAgICkuZm1hcCgoW3gsIHldKSA9PiB4ICsgeSk7XG4gICAgICAgIHBhcnNpbmcgPSBhYmNQLnJ1bignYWJjZCcpO1xuICAgIH0pO1xuICAgIGl0KCdwYXJzZXMgQUJDJywgKCkgPT4ge1xuICAgICAgICBleHBlY3QoaXNTdWNjZXNzKHBhcnNpbmcpKS50by5iZS50cnVlO1xuICAgICAgICBleHBlY3QocGFyc2luZ1swXS50b1N0cmluZygpKS50by5iZS5lcWwoJ2FiYycpO1xuICAgICAgICBleHBlY3QocGFyc2luZ1sxXSkudG8uYmUuZXFsKCdkJyk7XG4gICAgfSk7XG59KTtcblxuZGVzY3JpYmUoJ2EgcGFyc2VycyBmb3IgYW55IG9mIGEgbGlzdCBvZiBjaGFycycsICgpID0+IHtcblxuICAgIGl0KCdjYW4gcGFyc2UgYW55IGxvd2VyY2FzZSBjaGFyJywgKCkgPT4ge1xuICAgICAgICBsZXQgbG93ZXJjYXNlc1BhcnNlciA9IGFueU9mKGxvd2VyY2FzZXMpO1xuXG4gICAgICAgIGV4cGVjdChpc1BhcnNlcihsb3dlcmNhc2VzUGFyc2VyKSkudG8uYmUudHJ1ZTtcbiAgICAgICAgbGV0IHBhcnNpbmdDaG9pY2UgPSBsb3dlcmNhc2VzUGFyc2VyLnJ1bignYScpO1xuICAgICAgICBleHBlY3QoaXNTdWNjZXNzKHBhcnNpbmdDaG9pY2UpKS50by5iZS50cnVlO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZVswXSkudG8uYmUuZXFsKCdhJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlWzFdKS50by5iZS5lcWwoJycpO1xuICAgICAgICBwYXJzaW5nQ2hvaWNlID0gbG93ZXJjYXNlc1BhcnNlci5ydW4oJ2InKTtcbiAgICAgICAgZXhwZWN0KGlzU3VjY2VzcyhwYXJzaW5nQ2hvaWNlKSkudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2VbMF0pLnRvLmJlLmVxbCgnYicpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZVsxXSkudG8uYmUuZXFsKCcnKTtcbiAgICAgICAgcGFyc2luZ0Nob2ljZSA9IGxvd2VyY2FzZXNQYXJzZXIucnVuKCdkJyk7XG4gICAgICAgIGV4cGVjdChpc1N1Y2Nlc3MocGFyc2luZ0Nob2ljZSkpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlWzBdKS50by5iZS5lcWwoJ2QnKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2VbMV0pLnRvLmJlLmVxbCgnJyk7XG4gICAgICAgIHBhcnNpbmdDaG9pY2UgPSBsb3dlcmNhc2VzUGFyc2VyLnJ1bigneicpO1xuICAgICAgICBleHBlY3QoaXNTdWNjZXNzKHBhcnNpbmdDaG9pY2UpKS50by5iZS50cnVlO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZVswXSkudG8uYmUuZXFsKCd6Jyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlWzFdKS50by5iZS5lcWwoJycpO1xuXG4gICAgICAgIHBhcnNpbmdDaG9pY2UgPSBsb3dlcmNhc2VzUGFyc2VyLnJ1bignWScpO1xuICAgICAgICBleHBlY3QoaXNGYWlsdXJlKHBhcnNpbmdDaG9pY2UpKS50by5iZS50cnVlO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZVswXSkudG8uYmUuZXFsKCdhbnlPZiBhYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5eicpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZVsxXSkudG8uYmUuZXFsKCdfZmFpbCcpO1xuICAgIH0pO1xuXG4gICAgaXQoJ2NhbiBwYXJzZSBhbnkgdXBwZXJjYXNlIGNoYXInLCAoKSA9PiB7XG4gICAgICAgIGxldCB1cHBlcmNhc2VzUGFyc2VyID0gYW55T2YodXBwZXJjYXNlcyk7XG5cbiAgICAgICAgZXhwZWN0KGlzUGFyc2VyKHVwcGVyY2FzZXNQYXJzZXIpKS50by5iZS50cnVlO1xuICAgICAgICBsZXQgcGFyc2luZ0Nob2ljZSA9IHVwcGVyY2FzZXNQYXJzZXIucnVuKCdBJyk7XG4gICAgICAgIGV4cGVjdChpc1N1Y2Nlc3MocGFyc2luZ0Nob2ljZSkpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlWzBdKS50by5iZS5lcWwoJ0EnKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2VbMV0pLnRvLmJlLmVxbCgnJyk7XG4gICAgICAgIHBhcnNpbmdDaG9pY2UgPSB1cHBlcmNhc2VzUGFyc2VyLnJ1bignQicpO1xuICAgICAgICBleHBlY3QoaXNTdWNjZXNzKHBhcnNpbmdDaG9pY2UpKS50by5iZS50cnVlO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZVswXSkudG8uYmUuZXFsKCdCJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlWzFdKS50by5iZS5lcWwoJycpO1xuICAgICAgICBwYXJzaW5nQ2hvaWNlID0gdXBwZXJjYXNlc1BhcnNlci5ydW4oJ1InKTtcbiAgICAgICAgZXhwZWN0KGlzU3VjY2VzcyhwYXJzaW5nQ2hvaWNlKSkudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2VbMF0pLnRvLmJlLmVxbCgnUicpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZVsxXSkudG8uYmUuZXFsKCcnKTtcbiAgICAgICAgcGFyc2luZ0Nob2ljZSA9IHVwcGVyY2FzZXNQYXJzZXIucnVuKCdaJyk7XG4gICAgICAgIGV4cGVjdChpc1N1Y2Nlc3MocGFyc2luZ0Nob2ljZSkpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlWzBdKS50by5iZS5lcWwoJ1onKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2VbMV0pLnRvLmJlLmVxbCgnJyk7XG5cbiAgICAgICAgcGFyc2luZ0Nob2ljZSA9IHVwcGVyY2FzZXNQYXJzZXIucnVuKCdzJyk7XG4gICAgICAgIGV4cGVjdChpc0ZhaWx1cmUocGFyc2luZ0Nob2ljZSkpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlWzBdKS50by5iZS5lcWwoJ2FueU9mIEFCQ0RFRkdISUpLTE1OT1BRUlNUVVZXWFlaJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlWzFdKS50by5iZS5lcWwoJ19mYWlsJyk7XG4gICAgfSk7XG5cbiAgICBpdCgnY2FuIHBhcnNlIGFueSBkaWdpdCcsICgpID0+IHtcbiAgICAgICAgbGV0IGRpZ2l0c1BhcnNlciA9IGFueU9mKGRpZ2l0cyk7XG5cbiAgICAgICAgZXhwZWN0KGlzUGFyc2VyKGRpZ2l0c1BhcnNlcikpLnRvLmJlLnRydWU7XG4gICAgICAgIGxldCBwYXJzaW5nQ2hvaWNlID0gZGlnaXRzUGFyc2VyLnJ1bignMScpO1xuICAgICAgICBleHBlY3QoaXNTdWNjZXNzKHBhcnNpbmdDaG9pY2UpKS50by5iZS50cnVlO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZVswXSkudG8uYmUuZXFsKCcxJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlWzFdKS50by5iZS5lcWwoJycpO1xuICAgICAgICBwYXJzaW5nQ2hvaWNlID0gZGlnaXRzUGFyc2VyLnJ1bignMycpO1xuICAgICAgICBleHBlY3QoaXNTdWNjZXNzKHBhcnNpbmdDaG9pY2UpKS50by5iZS50cnVlO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZVswXSkudG8uYmUuZXFsKCczJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlWzFdKS50by5iZS5lcWwoJycpO1xuICAgICAgICBwYXJzaW5nQ2hvaWNlID0gZGlnaXRzUGFyc2VyLnJ1bignMCcpO1xuICAgICAgICBleHBlY3QoaXNTdWNjZXNzKHBhcnNpbmdDaG9pY2UpKS50by5iZS50cnVlO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZVswXSkudG8uYmUuZXFsKCcwJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlWzFdKS50by5iZS5lcWwoJycpO1xuICAgICAgICBwYXJzaW5nQ2hvaWNlID0gZGlnaXRzUGFyc2VyLnJ1bignOCcpO1xuICAgICAgICBleHBlY3QoaXNTdWNjZXNzKHBhcnNpbmdDaG9pY2UpKS50by5iZS50cnVlO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZVswXSkudG8uYmUuZXFsKCc4Jyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlWzFdKS50by5iZS5lcWwoJycpO1xuXG4gICAgICAgIHBhcnNpbmdDaG9pY2UgPSBkaWdpdHNQYXJzZXIucnVuKCdzJyk7XG4gICAgICAgIGV4cGVjdChpc0ZhaWx1cmUocGFyc2luZ0Nob2ljZSkpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlWzBdKS50by5iZS5lcWwoJ2FueU9mIDAxMjM0NTY3ODknKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2VbMV0pLnRvLmJlLmVxbCgnX2ZhaWwnKTtcbiAgICB9KTtcbn0pO1xuXG5kZXNjcmliZSgnYSBjaG9pY2Ugb2YgcGFyc2VycyBib3VuZCBieSBvckVsc2UnLCAoKSA9PiB7XG4gICAgbGV0IHBhcnNlcnNDaG9pY2U7XG5cbiAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgICAgcGFyc2Vyc0Nob2ljZSA9IGNob2ljZShbcGNoYXIoJ2EnKSwgcGNoYXIoJ2InKSwgcGNoYXIoJ2MnKSwgcGNoYXIoJ2QnKSxdKTtcbiAgICB9KTtcblxuICAgIGl0KCdjYW4gcGFyc2Ugb25lIG9mIGZvdXIgY2hhcnMnLCAoKSA9PiB7XG4gICAgICAgIGV4cGVjdChpc1BhcnNlcihwYXJzZXJzQ2hvaWNlKSkudG8uYmUudHJ1ZTtcbiAgICAgICAgbGV0IHBhcnNpbmdDaG9pY2UgPSBwYXJzZXJzQ2hvaWNlLnJ1bignYScpO1xuICAgICAgICBleHBlY3QoaXNTdWNjZXNzKHBhcnNpbmdDaG9pY2UpKS50by5iZS50cnVlO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZVswXSkudG8uYmUuZXFsKCdhJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlWzFdKS50by5iZS5lcWwoJycpO1xuICAgICAgICBwYXJzaW5nQ2hvaWNlID0gcGFyc2Vyc0Nob2ljZS5ydW4oJ2InKTtcbiAgICAgICAgZXhwZWN0KGlzU3VjY2VzcyhwYXJzaW5nQ2hvaWNlKSkudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2VbMF0pLnRvLmJlLmVxbCgnYicpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZVsxXSkudG8uYmUuZXFsKCcnKTtcbiAgICAgICAgcGFyc2luZ0Nob2ljZSA9IHBhcnNlcnNDaG9pY2UucnVuKCdkJyk7XG4gICAgICAgIGV4cGVjdChpc1N1Y2Nlc3MocGFyc2luZ0Nob2ljZSkpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlWzBdKS50by5iZS5lcWwoJ2QnKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2VbMV0pLnRvLmJlLmVxbCgnJyk7XG4gICAgfSk7XG5cbiAgICBpdCgnY2FuIGFsc28gcGFyc2UgTk9ORSBvZiBmb3VyIGNoYXJzJywgKCkgPT4ge1xuICAgICAgICBjb25zdCBwYXJzaW5nQ2hvaWNlID0gcGFyc2Vyc0Nob2ljZS5ydW4oJ3gnKTtcbiAgICAgICAgZXhwZWN0KGlzRmFpbHVyZShwYXJzaW5nQ2hvaWNlKSkudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2VbMF0pLnRvLmJlLmVxbCgnY2hvaWNlIC9wY2hhcl9hL3BjaGFyX2IvcGNoYXJfYy9wY2hhcl9kJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlWzFdKS50by5iZS5lcWwoJ19mYWlsJyk7XG4gICAgfSk7XG59KTtcblxuZGVzY3JpYmUoJ3R3byBwYXJzZXJzIGJvdW5kIGJ5IG9yRWxzZScsICgpID0+IHtcbiAgICBsZXQgcGFyc2VyQSwgcGFyc2VyQiwgcGFyc2VyQW9yQjtcblxuICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgICBwYXJzZXJBb3JCID0gb3JFbHNlKHBjaGFyKCdhJyksIHBjaGFyKCdiJykpO1xuICAgIH0pO1xuXG4gICAgaXQoJ2NhbiBwYXJzZSBvbmUgb2YgdHdvIGNoYXJzJywgKCkgPT4ge1xuICAgICAgICBleHBlY3QoaXNQYXJzZXIocGFyc2VyQW9yQikpLnRvLmJlLnRydWU7XG4gICAgICAgIGxldCBwYXJzaW5nQW9yQiA9IHBhcnNlckFvckIucnVuKCdhYmMnKTtcbiAgICAgICAgZXhwZWN0KGlzU3VjY2VzcyhwYXJzaW5nQW9yQikpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQW9yQlswXSkudG8uYmUuZXFsKCdhJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQW9yQlsxXSkudG8uYmUuZXFsKCdiYycpO1xuICAgICAgICBwYXJzaW5nQW9yQiA9IHBhcnNlckFvckIucnVuKCdiYmMnKTtcbiAgICAgICAgZXhwZWN0KGlzU3VjY2VzcyhwYXJzaW5nQW9yQikpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQW9yQlswXSkudG8uYmUuZXFsKCdiJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQW9yQlsxXSkudG8uYmUuZXFsKCdiYycpO1xuICAgIH0pO1xuXG4gICAgaXQoJ2NhbiBhbHNvIHBhcnNlIE5PTkUgb2YgdHdvIGNoYXJzJywgKCkgPT4ge1xuICAgICAgICBjb25zdCBwYXJzaW5nQW9yQiA9IHBhcnNlckFvckIucnVuKCdjZGUnKTtcbiAgICAgICAgZXhwZWN0KGlzRmFpbHVyZShwYXJzaW5nQW9yQikpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQW9yQlswXSkudG8uYmUuZXFsKCdwY2hhcl9hIG9yRWxzZSBwY2hhcl9iJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQW9yQlsxXSkudG8uYmUuZXFsKCd3YW50ZWQgYjsgZ290IGMnKTtcbiAgICB9KTtcbn0pO1xuXG5kZXNjcmliZSgndHdvIHBhcnNlcnMgYm91bmQgYnkgYW5kVGhlbicsICgpID0+IHtcbiAgICBsZXQgcGFyc2VyQWFuZEI7XG5cbiAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgICAgcGFyc2VyQWFuZEIgPSBhbmRUaGVuKHBjaGFyKCdhJyksIHBjaGFyKCdiJykpO1xuICAgIH0pO1xuXG4gICAgaXQoJ2NhbiBwYXJzZSB0d28gY2hhcnMnLCAoKSA9PiB7XG4gICAgICAgIGV4cGVjdChpc1BhcnNlcihwYXJzZXJBYW5kQikpLnRvLmJlLnRydWU7XG4gICAgICAgIGNvbnN0IHBhcnNpbmdBYW5kQiA9IHBhcnNlckFhbmRCLnJ1bignYWJjJyk7XG4gICAgICAgIGV4cGVjdChpc1N1Y2Nlc3MocGFyc2luZ0FhbmRCKSkudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdBYW5kQlswXS50b1N0cmluZygpKS50by5iZS5lcWwoJ1thLGJdJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQWFuZEJbMV0pLnRvLmJlLmVxbCgnYycpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0FhbmRCLnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgnW1thLGJdLGNdJyk7XG4gICAgfSk7XG5cbiAgICBpdCgnY2FuIGFsc28gTk9UIHBhcnNlIHR3byBjaGFycycsICgpID0+IHtcbiAgICAgICAgY29uc3QgcGFyc2luZ0FhbmRCID0gcGFyc2VyQWFuZEIucnVuKCdhY2QnKTtcbiAgICAgICAgZXhwZWN0KGlzRmFpbHVyZShwYXJzaW5nQWFuZEIpKS50by5iZS50cnVlO1xuICAgICAgICBleHBlY3QocGFyc2luZ0FhbmRCWzBdKS50by5iZS5lcWwoJ3BjaGFyX2EgYW5kVGhlbiBwY2hhcl9iJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQWFuZEJbMV0pLnRvLmJlLmVxbCgnd2FudGVkIGI7IGdvdCBjJyk7XG4gICAgfSk7XG59KTtcblxuZGVzY3JpYmUoJ2Egc2ltcGxlIHBhcnNlcicsICgpID0+IHtcbiAgICBjb25zdCBwYXJzZXJBID0gY2hhclBhcnNlcignYScpO1xuICAgIGNvbnN0IHBhcnNlcjEgPSBkaWdpdFBhcnNlcigxKTtcblxuICAgIGl0KCdjYW4gcGFyc2UgYSBzaW5nbGUgY2hhcicsICgpID0+IHtcbiAgICAgICAgY29uc3QgcGFyc2luZ0EgPSBwYXJzZXJBKCdhYmMnKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdBWzBdKS50by5iZS5lcWwoJ2EnKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdBWzFdKS50by5iZS5lcWwoJ2JjJyk7XG4gICAgICAgIGV4cGVjdChpc1N1Y2Nlc3MocGFyc2luZ0EpKS50by5iZS50cnVlO1xuICAgIH0pO1xuXG4gICAgaXQoJ2NhbiBhbHNvIE5PVCBwYXJzZSBhIHNpbmdsZSBjaGFyJywgKCkgPT4ge1xuICAgICAgICBjb25zdCBwYXJzaW5nQiA9IHBhcnNlckEoJ2JjZCcpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0JbMF0pLnRvLmJlLmVxbCgnY2hhclBhcnNlcicpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0JbMV0pLnRvLmJlLmVxbCgnd2FudGVkIGE7IGdvdCBiJyk7XG4gICAgICAgIGV4cGVjdChpc0ZhaWx1cmUocGFyc2luZ0IpKS50by5iZS50cnVlO1xuICAgIH0pO1xuXG4gICAgaXQoJ2NhbiBwYXJzZSBhIHNpbmdsZSBkaWdpdCcsICgpID0+IHtcbiAgICAgICAgY29uc3QgcGFyc2luZzEgPSBwYXJzZXIxKCcxMjMnKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcxWzBdKS50by5iZS5lcWwoMSk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nMVsxXSkudG8uYmUuZXFsKCcyMycpO1xuICAgICAgICBleHBlY3QoaXNTdWNjZXNzKHBhcnNpbmcxKSkudG8uYmUudHJ1ZTtcbiAgICB9KTtcblxuICAgIGl0KCdjYW4gYWxzbyBOT1QgcGFyc2UgYSBzaW5nbGUgZGlnaXQnLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHBhcnNpbmcyID0gcGFyc2VyMSgnMjM0Jyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nMlswXSkudG8uYmUuZXFsKCdkaWdpdFBhcnNlcicpO1xuICAgICAgICBleHBlY3QocGFyc2luZzJbMV0pLnRvLmJlLmVxbCgnd2FudGVkIDE7IGdvdCAyJyk7XG4gICAgICAgIGV4cGVjdChpc0ZhaWx1cmUocGFyc2luZzIpKS50by5iZS50cnVlO1xuICAgIH0pO1xufSk7XG5cbmRlc2NyaWJlKCdhIHNsaWdodGx5IG1vcmUgY29tcGxleCBwYXJzZXInLCAoKSA9PiB7XG4gICAgY29uc3QgcGFyc2VyQSA9IGNoYXJQYXJzZXIoJ2EnKTtcblxuICAgIGl0KCdjYW4gcGFyc2UgYSBzaW5nbGUgY2hhcicsICgpID0+IHtcbiAgICAgICAgY29uc3QgcGFyc2luZ0EgPSBwYXJzZXJBKCdhYmMnKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdBWzBdKS50by5iZS5lcWwoJ2EnKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdBWzFdKS50by5iZS5lcWwoJ2JjJyk7XG4gICAgICAgIGV4cGVjdChpc1N1Y2Nlc3MocGFyc2luZ0EpKS50by5iZS50cnVlO1xuICAgIH0pO1xuXG4gICAgaXQoJ2NhbiBhbHNvIE5PVCBwYXJzZSBhIHNpbmdsZSBjaGFyJywgKCkgPT4ge1xuICAgICAgICBjb25zdCBwYXJzaW5nQiA9IHBhcnNlckEoJ2JjZCcpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0JbMF0pLnRvLmJlLmVxbCgnY2hhclBhcnNlcicpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0JbMV0pLnRvLmJlLmVxbCgnd2FudGVkIGE7IGdvdCBiJyk7XG4gICAgICAgIGV4cGVjdChpc0ZhaWx1cmUocGFyc2luZ0IpKS50by5iZS50cnVlO1xuICAgIH0pO1xufSk7XG5cbmRlc2NyaWJlKCdhIG5hbWVkIGNoYXJhY3RlciBwYXJzZXInLCAoKSA9PiB7XG4gICAgY29uc3QgcGFyc2VyQSA9IHBjaGFyKCdhJyk7XG5cbiAgICBpdCgnY2FuIHBhcnNlIGEgc2luZ2xlIGNoYXInLCAoKSA9PiB7XG4gICAgICAgIGV4cGVjdChpc1BhcnNlcihwYXJzZXJBKSkudG8uYmUudHJ1ZTtcbiAgICAgICAgY29uc3QgcGFyc2luZ0EgPSBwYXJzZXJBLnJ1bignYWJjJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQVswXSkudG8uYmUuZXFsKCdhJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQVsxXSkudG8uYmUuZXFsKCdiYycpO1xuICAgICAgICBleHBlY3QoaXNTdWNjZXNzKHBhcnNpbmdBKSkudG8uYmUudHJ1ZTtcbiAgICB9KTtcblxuICAgIGl0KCdjYW4gYWxzbyBOT1QgcGFyc2UgYSBzaW5nbGUgY2hhcicsICgpID0+IHtcbiAgICAgICAgY29uc3QgcGFyc2luZ0IgPSBwYXJzZXJBLnJ1bignYmNkJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQlswXSkudG8uYmUuZXFsKCdwY2hhcl9hJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQlsxXSkudG8uYmUuZXFsKCd3YW50ZWQgYTsgZ290IGInKTtcbiAgICAgICAgZXhwZWN0KGlzRmFpbHVyZShwYXJzaW5nQikpLnRvLmJlLnRydWU7XG4gICAgfSk7XG59KTtcbiJdfQ==