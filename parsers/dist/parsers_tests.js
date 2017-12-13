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
            var zeroOrMoreParser = (0, _parsers.many1)((0, _parsers.pchar)('m'));
            var parsing = zeroOrMoreParser.run('arco');
            (0, _chai.expect)((0, _util.isFailure)(parsing)).to.be.true;
            (0, _chai.expect)(parsing.toString()).to.be.eql('[wanted m; got a,arco]');
        });
        it('can parse a char many times', function () {
            var zeroOrMoreParser = (0, _parsers.many1)((0, _parsers.pchar)('m'));
            var parsing = zeroOrMoreParser.run('mmmarco');
            (0, _chai.expect)((0, _util.isSuccess)(parsing)).to.be.true;
            (0, _chai.expect)(parsing.toString()).to.be.eql('[[m,m,m],arco]');
        });
        it('cannot parse a char sequence zero times', function () {
            var zeroOrMoreParser = (0, _parsers.many1)((0, _parsers.pstring)('marco'));
            var parsing = zeroOrMoreParser.run('xmarcomarcociao');
            (0, _chai.expect)((0, _util.isFailure)(parsing)).to.be.true;
            (0, _chai.expect)(parsing.toString()).to.be.eql('[wanted m; got x,xmarcomarcociao]');
        });
        it('can parse a char sequence many times', function () {
            var zeroOrMoreParser = (0, _parsers.many1)((0, _parsers.pstring)('marco'));
            var parsing = zeroOrMoreParser.run('marcomarcociao');
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
            (0, _chai.expect)(parsing.toString()).to.be.eql('[parsing failed,A12345]');
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
            (0, _chai.expect)(parsingChoice[0]).to.be.eql('parsing failed');
            (0, _chai.expect)(parsingChoice[1]).to.be.eql('Y');
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
            (0, _chai.expect)(parsingChoice[0]).to.be.eql('parsing failed');
            (0, _chai.expect)(parsingChoice[1]).to.be.eql('s');
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
            (0, _chai.expect)(parsingChoice[0]).to.be.eql('parsing failed');
            (0, _chai.expect)(parsingChoice[1]).to.be.eql('s');
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
            (0, _chai.expect)(parsingChoice[0]).to.be.eql('parsing failed');
            (0, _chai.expect)(parsingChoice[1]).to.be.eql('x');
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
            (0, _chai.expect)(parsingAorB[0]).to.be.eql('wanted b; got c');
            (0, _chai.expect)(parsingAorB[1]).to.be.eql('cde');
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
            (0, _chai.expect)(parsingAandB[0]).to.be.eql('wanted b; got c');
            (0, _chai.expect)(parsingAandB[1]).to.be.eql('cd');
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
            (0, _chai.expect)(parsingB[0]).to.be.eql('wanted a; got b');
            (0, _chai.expect)(parsingB[1]).to.be.eql('bcd');
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
            (0, _chai.expect)(parsing2[0]).to.be.eql('wanted 1; got 2');
            (0, _chai.expect)(parsing2[1]).to.be.eql('234');
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
            (0, _chai.expect)(parsingB[0]).to.be.eql('wanted a; got b');
            (0, _chai.expect)(parsingB[1]).to.be.eql('bcd');
            (0, _chai.expect)((0, _util.isFailure)(parsingB)).to.be.true;
        });
    });

    describe('a named character parser', function () {
        var parserA = void 0;

        beforeEach(function () {
            parserA = (0, _parsers.pchar)('a');
        });

        it('can parse a single char', function () {
            (0, _chai.expect)((0, _util.isParser)(parserA)).to.be.true;
            var parsingA = parserA.run('abc');
            (0, _chai.expect)(parsingA[0]).to.be.eql('a');
            (0, _chai.expect)(parsingA[1]).to.be.eql('bc');
            (0, _chai.expect)((0, _util.isSuccess)(parsingA)).to.be.true;
        });

        it('can also NOT parse a single char', function () {
            var parsingB = parserA.run('bcd');
            (0, _chai.expect)(parsingB[0]).to.be.eql('wanted a; got b');
            (0, _chai.expect)(parsingB[1]).to.be.eql('bcd');
            (0, _chai.expect)((0, _util.isFailure)(parsingB)).to.be.true;
        });
    });
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2pzLXNwZWMvcGFyc2Vyc190ZXN0cy5qcyJdLCJuYW1lcyI6WyJsb3dlcmNhc2VzIiwidXBwZXJjYXNlcyIsImRpZ2l0cyIsIndoaXRlcyIsImRlc2NyaWJlIiwiaXQiLCJpbnNpZGVQYXJlbnMiLCJkaXNjYXJkRmlyc3QiLCJkaXNjYXJkU2Vjb25kIiwicnVuIiwidG9TdHJpbmciLCJ0byIsImJlIiwiZXFsIiwic3Vic3RyaW5nc1dpdGhDb21tYXMiLCJsaXN0RWxlbWVudHMiLCJkaXNjYXJkSW50ZWdlclNpZ24iLCJwYXJzaW5nIiwiZGlzY2FyZFN1ZmZpeCIsIm9wdERvdFRoZW5BIiwiYW5kVGhlbiIsInBpbnQiLCJmbWFwIiwicGFyc2VJbnQiLCJsIiwicmVkdWNlIiwiYWNjIiwiY3VyciIsInBTaWduZWRJbnQiLCJtYXliZVNpZ24iLCJudW1iZXIiLCJvcHRTdWJzdHJpbmciLCJ6ZXJvT3JNb3JlUGFyc2VyIiwidHJ1ZSIsIndoaXRlc1BhcnNlciIsInR3b1dvcmRzIiwiemVyb09yTW9yZVBhcnNpbmdGdW5jdGlvbiIsIm1hcmNvUGFyc2VyIiwibWFyY29QYXJzaW5nIiwiYWJjUGFyc2VyIiwiYWRkU3RyaW5ncyIsIngiLCJ5IiwiQXBsdXNCIiwiYWRkRGlnaXRzIiwiYWRkUGFyc2VyIiwicGFyc2VEaWdpdCIsInRocmVlRGlnaXRzIiwiYmVmb3JlRWFjaCIsInoiLCJhYmNQIiwibG93ZXJjYXNlc1BhcnNlciIsInBhcnNpbmdDaG9pY2UiLCJ1cHBlcmNhc2VzUGFyc2VyIiwiZGlnaXRzUGFyc2VyIiwicGFyc2Vyc0Nob2ljZSIsInBhcnNlckEiLCJwYXJzZXJCIiwicGFyc2VyQW9yQiIsInBhcnNpbmdBb3JCIiwicGFyc2VyQWFuZEIiLCJwYXJzaW5nQWFuZEIiLCJwYXJzZXIxIiwicGFyc2luZ0EiLCJwYXJzaW5nQiIsInBhcnNpbmcxIiwicGFyc2luZzIiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7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QUNBLDhCQUFPbUQsU0FBUyxDQUFULENBQVAsRUFBb0JyRCxFQUFwQixDQUF1QkMsRUFBdkIsQ0FBMEJDLEdBQTFCLENBQThCLEtBQTlCO0FBQ0EsOEJBQU8scUJBQVVtRCxRQUFWLENBQVAsRUFBNEJyRCxFQUE1QixDQUErQkMsRUFBL0IsQ0FBa0NxQixJQUFsQztBQUNILFNBTEQ7QUFNSCxLQXJCRCIsImZpbGUiOiJwYXJzZXJzX3Rlc3RzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtleHBlY3R9IGZyb20gJ2NoYWknO1xuaW1wb3J0IHtcbiAgICBjaGFyUGFyc2VyLFxuICAgIGRpZ2l0UGFyc2VyLFxuICAgIHBjaGFyLFxuICAgIHBkaWdpdCxcbiAgICBhbmRUaGVuLFxuICAgIG9yRWxzZSxcbiAgICBjaG9pY2UsXG4gICAgYW55T2YsXG4gICAgZm1hcCxcbiAgICByZXR1cm5QLFxuICAgIGFwcGx5UCxcbiAgICBsaWZ0MixcbiAgICBzZXF1ZW5jZVAsXG4gICAgc2VxdWVuY2VQMixcbiAgICBwc3RyaW5nLFxuICAgIHplcm9Pck1vcmUsXG4gICAgbWFueSxcbiAgICBtYW55MSxcbiAgICBvcHQsXG4gICAgb3B0Qm9vayxcbiAgICBkaXNjYXJkRmlyc3QsXG4gICAgZGlzY2FyZFNlY29uZCxcbiAgICBiZXR3ZWVuLFxuICAgIGJldHdlZW5QYXJlbnMsXG59IGZyb20gJ3BhcnNlcnMnO1xuaW1wb3J0IHtcbiAgICBpc1BhaXIsXG4gICAgaXNTdWNjZXNzLFxuICAgIGlzRmFpbHVyZSxcbiAgICBpc1BhcnNlcixcbiAgICBpc1NvbWUsXG4gICAgaXNOb25lLFxufSBmcm9tICd1dGlsJztcblxuY29uc3QgbG93ZXJjYXNlcyA9IFsnYScsICdiJywgJ2MnLCAnZCcsICdlJywgJ2YnLCAnZycsICdoJywgJ2knLCAnaicsICdrJywgJ2wnLCAnbScsICduJywgJ28nLCAncCcsICdxJywgJ3InLCAncycsICd0JywgJ3UnLCAndicsICd3JywgJ3gnLCAneScsICd6JyxdO1xuY29uc3QgdXBwZXJjYXNlcyA9IFsnQScsICdCJywgJ0MnLCAnRCcsICdFJywgJ0YnLCAnRycsICdIJywgJ0knLCAnSicsICdLJywgJ0wnLCAnTScsICdOJywgJ08nLCAnUCcsICdRJywgJ1InLCAnUycsICdUJywgJ1UnLCAnVicsICdXJywgJ1gnLCAnWScsICdaJyxdO1xuY29uc3QgZGlnaXRzID0gWycwJywgJzEnLCAnMicsICczJywgJzQnLCAnNScsICc2JywgJzcnLCAnOCcsICc5J107XG5jb25zdCB3aGl0ZXMgPSBbJyAnLCAnXFx0JywgJ1xcbicsICdcXHInXTtcblxuZGVzY3JpYmUoJ3BhcnNpbmcgd2hpbGUgZGlzY2FyZGluZyBpbnB1dCcsICgpID0+IHtcbiAgICBpdCgnYWxsb3dzIHRvIGV4Y2x1ZGUgcGFyZW50aGVzZXMnLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IGluc2lkZVBhcmVucyA9IHBjaGFyKCcoJylcbiAgICAgICAgICAgIC5kaXNjYXJkRmlyc3QobWFueShhbnlPZihsb3dlcmNhc2VzKSkpXG4gICAgICAgICAgICAuZGlzY2FyZFNlY29uZChwY2hhcignKScpKTtcbiAgICAgICAgZXhwZWN0KGluc2lkZVBhcmVucy5ydW4oJyhtYXJjbyknKS50b1N0cmluZygpKS50by5iZS5lcWwoJ1tbbSxhLHIsYyxvXSxdJyk7XG4gICAgICAgIGV4cGVjdChpbnNpZGVQYXJlbnMucnVuKCcoKScpLnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgnW1tdLF0nKTtcbiAgICB9KTtcbiAgICBpdCgnLi4uZXZlbiB1c2luZyBhIHRhaWxvci1tYWRlIG1ldGhvZCcsICgpID0+IHtcbiAgICAgICAgY29uc3QgaW5zaWRlUGFyZW5zID0gYmV0d2VlblBhcmVucyhwc3RyaW5nKCdtYXJjbycpKTtcbiAgICAgICAgZXhwZWN0KGluc2lkZVBhcmVucy5ydW4oJyhtYXJjbyknKS50b1N0cmluZygpKS50by5iZS5lcWwoJ1tbbSxhLHIsYyxvXSxdJyk7XG4gICAgfSk7XG4gICAgaXQoJ2NoZXJyeS1waWNraW5nIGVsZW1lbnRzIHNlcGFyYXRlZCBieSBzZXBhcmF0b3JzJywgKCkgPT4ge1xuICAgICAgICBjb25zdCBzdWJzdHJpbmdzV2l0aENvbW1hcyA9IG1hbnkobWFueTEoYW55T2YobG93ZXJjYXNlcykpLmRpc2NhcmRTZWNvbmQocGNoYXIoJywnKSkpO1xuICAgICAgICBleHBlY3Qoc3Vic3RyaW5nc1dpdGhDb21tYXMucnVuKCdhLGIsY2QsMScpLnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgnW1tbYV0sW2JdLFtjLGRdXSwxXScpO1xuICAgIH0pO1xuICAgIGl0KCcuLi5hbHNvIHdoZW4gaW5zaWRlIGEgbGlzdHMnLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHN1YnN0cmluZ3NXaXRoQ29tbWFzID0gbWFueShtYW55MShhbnlPZihsb3dlcmNhc2VzKSkuZGlzY2FyZFNlY29uZChwY2hhcignLCcpKSk7XG4gICAgICAgIGNvbnN0IGxpc3RFbGVtZW50cyA9IGJldHdlZW4ocGNoYXIoJ1snKSwgc3Vic3RyaW5nc1dpdGhDb21tYXMsIHBjaGFyKCddJykpO1xuICAgICAgICBleHBlY3QobGlzdEVsZW1lbnRzLnJ1bignW2EsYixjZCxtYXJjbyxdMScpLnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgnW1tbYV0sW2JdLFtjLGRdLFttLGEscixjLG9dXSwxXScpO1xuICAgIH0pO1xufSk7XG5cbmRlc2NyaWJlKCdhIGNvdXBsZSBvZiBwYXJzZXJzJywgKCkgPT4ge1xuICAgIGl0KCdjYW4gZGVjaWRlIHRvIGRpc2NhcmQgdGhlIG1hdGNoZXMgb2YgdGhlIGZpcnN0IG9uZScsICgpID0+IHtcbiAgICAgICAgY29uc3QgZGlzY2FyZEludGVnZXJTaWduID0gcGNoYXIoJy0nKS5kaXNjYXJkRmlyc3QocGRpZ2l0KDgpKTtcbiAgICAgICAgbGV0IHBhcnNpbmcgPSBkaXNjYXJkSW50ZWdlclNpZ24ucnVuKCctOHgnKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcudG9TdHJpbmcoKSkudG8uYmUuZXFsKCdbOCx4XScpO1xuICAgIH0pO1xuICAgIGl0KCdjYW4gZGVjaWRlIHRvIGRpc2NhcmQgdGhlIG1hdGNoZXMgb2YgdGhlIHNlY29uZCBvbmUnLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IGRpc2NhcmRTdWZmaXggPSBwc3RyaW5nKCdtYXJjbycpLmRpc2NhcmRTZWNvbmQobWFueTEoYW55T2Yod2hpdGVzKSkpO1xuICAgICAgICBsZXQgcGFyc2luZyA9IGRpc2NhcmRTdWZmaXgucnVuKCdtYXJjbyBmYXVzdGluZWxsaScpO1xuICAgICAgICBleHBlY3QocGFyc2luZy50b1N0cmluZygpKS50by5iZS5lcWwoJ1tbbSxhLHIsYyxvXSxmYXVzdGluZWxsaV0nKTtcbiAgICAgICAgcGFyc2luZyA9IGRpc2NhcmRTdWZmaXgucnVuKCdtYXJjbyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmF1c3RpbmVsbGknKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcudG9TdHJpbmcoKSkudG8uYmUuZXFsKCdbW20sYSxyLGMsb10sZmF1c3RpbmVsbGldJyk7XG4gICAgfSk7XG59KTtcblxuZGVzY3JpYmUoJ2EgcGFyc2VyIGZvciBvcHRpb25hbCBjaGFyYWN0ZXJzJywgKCkgPT4ge1xuICAgIGl0KCdjYW4gY2FwdHVyZSBvciBub3QgY2FwdHVyZSBhIGRvdCcsICgpID0+IHtcbiAgICAgICAgY29uc3Qgb3B0RG90VGhlbkEgPSBvcHQocGNoYXIoJy4nKSkuYW5kVGhlbihwY2hhcignYScpKTtcbiAgICAgICAgZXhwZWN0KG9wdERvdFRoZW5BLnJ1bignLmFiYycpLnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgnW1tzb21lKC4pLGFdLGJjXScpO1xuICAgICAgICBleHBlY3Qob3B0RG90VGhlbkEucnVuKCdhYmMnKS50b1N0cmluZygpKS50by5iZS5lcWwoJ1tbbm9uZSgpLGFdLGJjXScpO1xuICAgIH0pO1xuICAgIGl0KCdjYW4gcGFyc2UgU0lHTkVEIGludGVnZXJzISEhJywgKCkgPT4ge1xuICAgICAgICBjb25zdCBwaW50ID0gbWFueTEoYW55T2YoZGlnaXRzKSlcbiAgICAgICAgICAgIC5mbWFwKGwgPT4gcGFyc2VJbnQobC5yZWR1Y2UoKGFjYywgY3VycikgPT4gYWNjICsgY3VyciwgJycpLCAxMCkpO1xuICAgICAgICBjb25zdCBwU2lnbmVkSW50ID0gb3B0KHBjaGFyKCctJykpXG4gICAgICAgICAgICAuYW5kVGhlbihwaW50KVxuICAgICAgICAgICAgLmZtYXAoKFttYXliZVNpZ24sIG51bWJlcl0pID0+IChpc1NvbWUobWF5YmVTaWduKSkgPyAtbnVtYmVyIDogbnVtYmVyKTtcbiAgICAgICAgZXhwZWN0KHBTaWduZWRJbnQucnVuKCcxMzI0MzU0NngnKVswXSkudG8uYmUuZXFsKDEzMjQzNTQ2KTtcbiAgICAgICAgZXhwZWN0KHBTaWduZWRJbnQucnVuKCctMTMyNDM1NDZ4JylbMF0pLnRvLmJlLmVxbCgtMTMyNDM1NDYpO1xuICAgIH0pO1xuICAgIGl0KCdjYW4gY2FwdHVyZSBvciBub3QgY2FwdHVyZSBhIHdob2xlIHN1YnN0cmluZycsICgpID0+IHtcbiAgICAgICAgY29uc3Qgb3B0U3Vic3RyaW5nID0gb3B0KHBzdHJpbmcoJ21hcmNvJykpLmFuZFRoZW4ocHN0cmluZygnZmF1c3RpbmVsbGknKSk7XG4gICAgICAgIGV4cGVjdChvcHRTdWJzdHJpbmcucnVuKCdtYXJjb2ZhdXN0aW5lbGxpeCcpLnRvU3RyaW5nKCkpXG4gICAgICAgICAgICAudG8uYmUuZXFsKCdbW3NvbWUoW20sYSxyLGMsb10pLFtmLGEsdSxzLHQsaSxuLGUsbCxsLGldXSx4XScpO1xuICAgICAgICBleHBlY3Qob3B0U3Vic3RyaW5nLnJ1bignZmF1c3RpbmVsbGl4JykudG9TdHJpbmcoKSlcbiAgICAgICAgICAgIC50by5iZS5lcWwoJ1tbbm9uZSgpLFtmLGEsdSxzLHQsaSxuLGUsbCxsLGldXSx4XScpO1xuICAgIH0pO1xufSk7XG5cbmRlc2NyaWJlKCdhIHBhcnNlciBmb3Igb25lIG9yIG1vcmUgb2NjdXJyZW5jZXMnLCAoKSA9PiB7XG4gICAgaXQoJ2Nhbm5vdCBwYXJzZSBhIGNoYXIgemVybyB0aW1lcycsICgpID0+IHtcbiAgICAgICAgY29uc3QgemVyb09yTW9yZVBhcnNlciA9IG1hbnkxKHBjaGFyKCdtJykpO1xuICAgICAgICBsZXQgcGFyc2luZyA9IHplcm9Pck1vcmVQYXJzZXIucnVuKCdhcmNvJyk7XG4gICAgICAgIGV4cGVjdChpc0ZhaWx1cmUocGFyc2luZykpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgnW3dhbnRlZCBtOyBnb3QgYSxhcmNvXScpO1xuICAgIH0pO1xuICAgIGl0KCdjYW4gcGFyc2UgYSBjaGFyIG1hbnkgdGltZXMnLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHplcm9Pck1vcmVQYXJzZXIgPSBtYW55MShwY2hhcignbScpKTtcbiAgICAgICAgbGV0IHBhcnNpbmcgPSB6ZXJvT3JNb3JlUGFyc2VyLnJ1bignbW1tYXJjbycpO1xuICAgICAgICBleHBlY3QoaXNTdWNjZXNzKHBhcnNpbmcpKS50by5iZS50cnVlO1xuICAgICAgICBleHBlY3QocGFyc2luZy50b1N0cmluZygpKS50by5iZS5lcWwoJ1tbbSxtLG1dLGFyY29dJyk7XG4gICAgfSk7XG4gICAgaXQoJ2Nhbm5vdCBwYXJzZSBhIGNoYXIgc2VxdWVuY2UgemVybyB0aW1lcycsICgpID0+IHtcbiAgICAgICAgY29uc3QgemVyb09yTW9yZVBhcnNlciA9IG1hbnkxKHBzdHJpbmcoJ21hcmNvJykpO1xuICAgICAgICBsZXQgcGFyc2luZyA9IHplcm9Pck1vcmVQYXJzZXIucnVuKCd4bWFyY29tYXJjb2NpYW8nKTtcbiAgICAgICAgZXhwZWN0KGlzRmFpbHVyZShwYXJzaW5nKSkudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcudG9TdHJpbmcoKSkudG8uYmUuZXFsKCdbd2FudGVkIG07IGdvdCB4LHhtYXJjb21hcmNvY2lhb10nKTtcbiAgICB9KTtcbiAgICBpdCgnY2FuIHBhcnNlIGEgY2hhciBzZXF1ZW5jZSBtYW55IHRpbWVzJywgKCkgPT4ge1xuICAgICAgICBjb25zdCB6ZXJvT3JNb3JlUGFyc2VyID0gbWFueTEocHN0cmluZygnbWFyY28nKSk7XG4gICAgICAgIGxldCBwYXJzaW5nID0gemVyb09yTW9yZVBhcnNlci5ydW4oJ21hcmNvbWFyY29jaWFvJyk7XG4gICAgICAgIGV4cGVjdChpc1N1Y2Nlc3MocGFyc2luZykpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgnW1tbbSxhLHIsYyxvXSxbbSxhLHIsYyxvXV0sY2lhb10nKTtcbiAgICB9KTtcbiAgICBpdCgnY2FuIHBhcnNlIGFuIGludGVnZXIsIG5vIG1hdHRlciBob3cgbGFyZ2UuLi4nLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHBpbnQgPSBtYW55MShhbnlPZihkaWdpdHMpKTtcbiAgICAgICAgbGV0IHBhcnNpbmcgPSBwaW50LnJ1bignMTIzNDVBJyk7XG4gICAgICAgIGV4cGVjdChpc1N1Y2Nlc3MocGFyc2luZykpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgnW1sxLDIsMyw0LDVdLEFdJyk7XG4gICAgICAgIHBhcnNpbmcgPSBwaW50LnJ1bignMUInKTtcbiAgICAgICAgZXhwZWN0KGlzU3VjY2VzcyhwYXJzaW5nKSkudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcudG9TdHJpbmcoKSkudG8uYmUuZXFsKCdbWzFdLEJdJyk7XG4gICAgICAgIHBhcnNpbmcgPSBwaW50LnJ1bignQTEyMzQ1Jyk7XG4gICAgICAgIGV4cGVjdChpc0ZhaWx1cmUocGFyc2luZykpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgnW3BhcnNpbmcgZmFpbGVkLEExMjM0NV0nKTtcbiAgICB9KTtcbiAgICBpdCgnY2FuIHBhcnNlIGFuIGludGVnZXIgaW50byBhIHRydWUgaW50ZWdlcicsICgpID0+IHtcbiAgICAgICAgY29uc3QgcGludCA9IG1hbnkxKGFueU9mKGRpZ2l0cykpXG4gICAgICAgICAgICAuZm1hcChsID0+IHBhcnNlSW50KGwucmVkdWNlKChhY2MsIGN1cnIpID0+IGFjYyArIGN1cnIsICcnKSwgMTApKTtcbiAgICAgICAgbGV0IHBhcnNpbmcgPSBwaW50LnJ1bignMTIzNDVBJyk7XG4gICAgICAgIGV4cGVjdChpc1N1Y2Nlc3MocGFyc2luZykpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nWzBdKS50by5iZS5lcWwoMTIzNDUpO1xuICAgICAgICBleHBlY3QocGFyc2luZ1sxXSkudG8uYmUuZXFsKCdBJyk7XG4gICAgfSk7XG59KTtcblxuZGVzY3JpYmUoJ2EgcGFyc2VyIGZvciB6ZXJvIG9yIG1vcmUgb2NjdXJyZW5jZXMnLCAoKSA9PiB7XG4gICAgaXQoJ2NhbiBwYXJzZSBhIGNoYXIgemVybyB0aW1lcycsICgpID0+IHtcbiAgICAgICAgY29uc3QgemVyb09yTW9yZVBhcnNlciA9IG1hbnkocGNoYXIoJ20nKSk7XG4gICAgICAgIGxldCBwYXJzaW5nID0gemVyb09yTW9yZVBhcnNlci5ydW4oJ2FyY28nKTtcbiAgICAgICAgZXhwZWN0KGlzU3VjY2VzcyhwYXJzaW5nKSkudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcudG9TdHJpbmcoKSkudG8uYmUuZXFsKCdbW10sYXJjb10nKTtcbiAgICB9KTtcbiAgICBpdCgnY2FuIHBhcnNlIGEgY2hhciBtYW55IHRpbWVzJywgKCkgPT4ge1xuICAgICAgICBjb25zdCB6ZXJvT3JNb3JlUGFyc2VyID0gbWFueShwY2hhcignbScpKTtcbiAgICAgICAgbGV0IHBhcnNpbmcgPSB6ZXJvT3JNb3JlUGFyc2VyLnJ1bignbW1tYXJjbycpO1xuICAgICAgICBleHBlY3QoaXNTdWNjZXNzKHBhcnNpbmcpKS50by5iZS50cnVlO1xuICAgICAgICBleHBlY3QocGFyc2luZy50b1N0cmluZygpKS50by5iZS5lcWwoJ1tbbSxtLG1dLGFyY29dJyk7XG4gICAgfSk7XG4gICAgaXQoJ2NhbiBwYXJzZSBhIGNoYXIgc2VxdWVuY2UgemVybyB0aW1lcycsICgpID0+IHtcbiAgICAgICAgY29uc3QgemVyb09yTW9yZVBhcnNlciA9IG1hbnkocHN0cmluZygnbWFyY28nKSk7XG4gICAgICAgIGxldCBwYXJzaW5nID0gemVyb09yTW9yZVBhcnNlci5ydW4oJ3htYXJjb21hcmNvY2lhbycpO1xuICAgICAgICBleHBlY3QoaXNTdWNjZXNzKHBhcnNpbmcpKS50by5iZS50cnVlO1xuICAgICAgICBleHBlY3QocGFyc2luZy50b1N0cmluZygpKS50by5iZS5lcWwoJ1tbXSx4bWFyY29tYXJjb2NpYW9dJyk7XG4gICAgfSk7XG4gICAgaXQoJ2NhbiBwYXJzZSBhIGNoYXIgc2VxdWVuY2UgbWFueSB0aW1lcycsICgpID0+IHtcbiAgICAgICAgY29uc3QgemVyb09yTW9yZVBhcnNlciA9IG1hbnkocHN0cmluZygnbWFyY28nKSk7XG4gICAgICAgIGxldCBwYXJzaW5nID0gemVyb09yTW9yZVBhcnNlci5ydW4oJ21hcmNvbWFyY29jaWFvJyk7XG4gICAgICAgIGV4cGVjdChpc1N1Y2Nlc3MocGFyc2luZykpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgnW1tbbSxhLHIsYyxvXSxbbSxhLHIsYyxvXV0sY2lhb10nKTtcbiAgICB9KTtcbiAgICBpdCgnY2FuIHBhcnNlIHdoaXRlc3BhY2VzISEnLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHdoaXRlc1BhcnNlciA9IG1hbnkoYW55T2Yod2hpdGVzKSk7XG4gICAgICAgIGNvbnN0IHR3b1dvcmRzID0gc2VxdWVuY2VQKFtwc3RyaW5nKCdjaWFvJyksIHdoaXRlc1BhcnNlciwgcHN0cmluZygnbWFtbWEnKV0pO1xuICAgICAgICBsZXQgcGFyc2luZyA9IHR3b1dvcmRzLnJ1bignY2lhb21hbW1hWCcpO1xuICAgICAgICBleHBlY3QocGFyc2luZy50b1N0cmluZygpKS50by5iZS5lcWwoJ1tbW2MsaSxhLG9dLFtdLFttLGEsbSxtLGFdXSxYXScpO1xuICAgICAgICBwYXJzaW5nID0gdHdvV29yZHMucnVuKCdjaWFvIG1hbW1hWCcpO1xuICAgICAgICBleHBlY3QocGFyc2luZy50b1N0cmluZygpKS50by5iZS5lcWwoJ1tbW2MsaSxhLG9dLFsgXSxbbSxhLG0sbSxhXV0sWF0nKTtcbiAgICAgICAgcGFyc2luZyA9IHR3b1dvcmRzLnJ1bignY2lhbyAgIG1hbW1hWCcpO1xuICAgICAgICBleHBlY3QocGFyc2luZy50b1N0cmluZygpKS50by5iZS5lcWwoJ1tbW2MsaSxhLG9dLFsgLCAsIF0sW20sYSxtLG0sYV1dLFhdJyk7XG4gICAgICAgIHBhcnNpbmcgPSB0d29Xb3Jkcy5ydW4oJ2NpYW8gXFx0IG1hbW1hWCcpO1xuICAgICAgICBleHBlY3QocGFyc2luZy50b1N0cmluZygpKS50by5iZS5lcWwoJ1tbW2MsaSxhLG9dLFsgLFxcdCwgXSxbbSxhLG0sbSxhXV0sWF0nKTtcbiAgICB9KTtcbn0pO1xuXG5kZXNjcmliZSgnYSBwYXJzaW5nIGZ1bmN0aW9uIGZvciB6ZXJvIG9yIG1vcmUgb2NjdXJyZW5jZXMnLCAoKSA9PiB7XG4gICAgaXQoJ2NhbiBwYXJzZSBhIGNoYXIgemVybyB0aW1lcycsICgpID0+IHtcbiAgICAgICAgY29uc3QgemVyb09yTW9yZVBhcnNpbmdGdW5jdGlvbiA9IHplcm9Pck1vcmUocGNoYXIoJ20nKSk7XG4gICAgICAgIGxldCBwYXJzaW5nID0gemVyb09yTW9yZVBhcnNpbmdGdW5jdGlvbignYXJjbycpO1xuICAgICAgICBleHBlY3QoaXNTdWNjZXNzKHBhcnNpbmcpKS50by5iZS50cnVlO1xuICAgICAgICBleHBlY3QocGFyc2luZy50b1N0cmluZygpKS50by5iZS5lcWwoJ1tbXSxhcmNvXScpO1xuICAgIH0pO1xuICAgIGl0KCdjYW4gcGFyc2UgYSBjaGFyIG1hbnkgdGltZXMnLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHplcm9Pck1vcmVQYXJzaW5nRnVuY3Rpb24gPSB6ZXJvT3JNb3JlKHBjaGFyKCdtJykpO1xuICAgICAgICBsZXQgcGFyc2luZyA9IHplcm9Pck1vcmVQYXJzaW5nRnVuY3Rpb24oJ21tbWFyY28nKTtcbiAgICAgICAgZXhwZWN0KGlzU3VjY2VzcyhwYXJzaW5nKSkudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcudG9TdHJpbmcoKSkudG8uYmUuZXFsKCdbW20sbSxtXSxhcmNvXScpO1xuICAgIH0pO1xuICAgIGl0KCdjYW4gcGFyc2UgYSBjaGFyIHNlcXVlbmNlIHplcm8gdGltZXMnLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHplcm9Pck1vcmVQYXJzaW5nRnVuY3Rpb24gPSB6ZXJvT3JNb3JlKHBzdHJpbmcoJ21hcmNvJykpO1xuICAgICAgICBsZXQgcGFyc2luZyA9IHplcm9Pck1vcmVQYXJzaW5nRnVuY3Rpb24oJ3htYXJjb21hcmNvY2lhbycpO1xuICAgICAgICBleHBlY3QoaXNTdWNjZXNzKHBhcnNpbmcpKS50by5iZS50cnVlO1xuICAgICAgICBleHBlY3QocGFyc2luZy50b1N0cmluZygpKS50by5iZS5lcWwoJ1tbXSx4bWFyY29tYXJjb2NpYW9dJyk7XG4gICAgfSk7XG4gICAgaXQoJ2NhbiBwYXJzZSBhIGNoYXIgc2VxdWVuY2UgbWFueSB0aW1lcycsICgpID0+IHtcbiAgICAgICAgY29uc3QgemVyb09yTW9yZVBhcnNpbmdGdW5jdGlvbiA9IHplcm9Pck1vcmUocHN0cmluZygnbWFyY28nKSk7XG4gICAgICAgIGxldCBwYXJzaW5nID0gemVyb09yTW9yZVBhcnNpbmdGdW5jdGlvbignbWFyY29tYXJjb2NpYW8nKTtcbiAgICAgICAgZXhwZWN0KGlzU3VjY2VzcyhwYXJzaW5nKSkudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcudG9TdHJpbmcoKSkudG8uYmUuZXFsKCdbW1ttLGEscixjLG9dLFttLGEscixjLG9dXSxjaWFvXScpO1xuICAgIH0pO1xufSk7XG5cbmRlc2NyaWJlKCdhIHBhcnNlciBmb3IgYSBzcGVjaWZpYyB3b3JkJywgKCkgPT4ge1xuICAgIGl0KCdpcyBlYXN5IHRvIGNyZWF0ZSB3aXRoIHNlcXVlbmNlUCcsICgpID0+IHtcbiAgICAgICAgY29uc3QgbWFyY29QYXJzZXIgPSBwc3RyaW5nKCdtYXJjbycpO1xuICAgICAgICBjb25zdCBtYXJjb1BhcnNpbmcgPSBtYXJjb1BhcnNlci5ydW4oJ21hcmNvY2lhbycpO1xuICAgICAgICBleHBlY3QoaXNTdWNjZXNzKG1hcmNvUGFyc2luZykpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChtYXJjb1BhcnNpbmcudG9TdHJpbmcoKSkudG8uYmUuZXFsKCdbW20sYSxyLGMsb10sY2lhb10nKTtcbiAgICB9KTtcbn0pO1xuXG5kZXNjcmliZSgnc2VxdWVuY2VzIG9mIHBhcnNlcnMgYmFzZWQgb24gbGlmdDIoY29ucykgKGFrYSBzZXF1ZW5jZVApJywgKCkgPT4ge1xuICAgIGl0KCdzdG9yZXMgbWF0Y2hlZCBjaGFycyBpbnNpZGUgYW4gYXJyYXknLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IGFiY1BhcnNlciA9IHNlcXVlbmNlUChbcGNoYXIoJ2EnKSwgcGNoYXIoJ2InKSwgcGNoYXIoJ2MnKSxdKTtcbiAgICAgICAgZXhwZWN0KGFiY1BhcnNlci5ydW4oJ2FiYycpLnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgnW1thLGIsY10sXScpO1xuICAgIH0pO1xufSk7XG5cbmRlc2NyaWJlKCdzZXF1ZW5jZXMgb2YgcGFyc2VycyBiYXNlZCBvbiBhbmRUaGVuICYmIGZtYXAgKGFrYSBzZXF1ZW5jZVAyKScsICgpID0+IHtcbiAgICBpdCgnc3RvcmUgbWF0Y2hlZCBjaGFycyBpbnNpZGUgYSBwbGFpbiBzdHJpbmcnLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IGFiY1BhcnNlciA9IHNlcXVlbmNlUDIoW3BjaGFyKCdhJyksIHBjaGFyKCdiJyksIHBjaGFyKCdjJyksXSk7XG4gICAgICAgIGV4cGVjdChhYmNQYXJzZXIucnVuKCdhYmMnKS50b1N0cmluZygpKS50by5iZS5lcWwoJ1thYmMsXScpO1xuICAgIH0pO1xufSk7XG5cbmRlc2NyaWJlKCdsaWZ0MiBmb3IgcGFyc2VycycsICgpID0+IHtcbiAgICBpdCgnb3BlcmF0ZXMgb24gdGhlIHJlc3VsdHMgb2YgdHdvIHN0cmluZyBwYXJzaW5ncycsICgpID0+IHtcbiAgICAgICAgY29uc3QgYWRkU3RyaW5ncyA9IHggPT4geSA9PiB4ICsgJysnICsgeTtcbiAgICAgICAgY29uc3QgQXBsdXNCID0gbGlmdDIoYWRkU3RyaW5ncykocGNoYXIoJ2EnKSkocGNoYXIoJ2InKSk7XG4gICAgICAgIGV4cGVjdChBcGx1c0IucnVuKCdhYmMnKS50b1N0cmluZygpKS50by5iZS5lcWwoJ1thK2IsY10nKTtcbiAgICB9KTtcbiAgICBpdCgnYWRkcyB0aGUgcmVzdWx0cyBvZiB0d28gZGlnaXQgcGFyc2luZ3MnLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IGFkZERpZ2l0cyA9IHggPT4geSA9PiB4ICsgeTtcbiAgICAgICAgY29uc3QgYWRkUGFyc2VyID0gbGlmdDIoYWRkRGlnaXRzKShwZGlnaXQoMSkpKHBkaWdpdCgyKSk7XG4gICAgICAgIGV4cGVjdChhZGRQYXJzZXIucnVuKCcxMjM0JykudG9TdHJpbmcoKSkudG8uYmUuZXFsKCdbMywzNF0nKTtcbiAgICAgICAgZXhwZWN0KGlzRmFpbHVyZShhZGRQYXJzZXIucnVuKCcxNDQnKSkpLnRvLmJlLnRydWU7XG4gICAgfSk7XG59KTtcblxuZGVzY3JpYmUoJ3BhcnNlIDMgZGlnaXRzJywgKCkgPT4ge1xuICAgIGxldCBwYXJzZURpZ2l0LCB0aHJlZURpZ2l0cywgcGFyc2luZztcbiAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgICAgcGFyc2VEaWdpdCA9IGFueU9mKGRpZ2l0cyk7XG4gICAgICAgIHRocmVlRGlnaXRzID0gYW5kVGhlbihwYXJzZURpZ2l0LCBhbmRUaGVuKHBhcnNlRGlnaXQsIHBhcnNlRGlnaXQpKTtcbiAgICAgICAgcGFyc2luZyA9IHRocmVlRGlnaXRzLnJ1bignMTIzJyk7XG4gICAgfSk7XG4gICAgaXQoJ3BhcnNlcyBhbnkgb2YgdGhyZWUgZGlnaXRzJywgKCkgPT4ge1xuICAgICAgICBleHBlY3QoaXNTdWNjZXNzKHBhcnNpbmcpKS50by5iZS50cnVlO1xuICAgICAgICBleHBlY3QocGFyc2luZ1swXS50b1N0cmluZygpKS50by5iZS5lcWwoJ1sxLFsyLDNdXScpO1xuICAgICAgICBleHBlY3QocGFyc2luZ1sxXSkudG8uYmUuZXFsKCcnKTtcbiAgICB9KTtcbiAgICBkZXNjcmliZSgncGFyc2VzIGFueSBvZiB0aHJlZSBkaWdpdHMgd2hpbGUgc2hvd2Nhc2luZyBmbWFwJywgKCkgPT4ge1xuICAgICAgICBpdCgnYXMgZ2xvYmFsIG1ldGhvZCcsICgpID0+IHtcbiAgICAgICAgICAgIHRocmVlRGlnaXRzID0gZm1hcCgoW3gsIFt5LCB6XV0pID0+IFt4LCB5LCB6XSwgdGhyZWVEaWdpdHMpO1xuICAgICAgICAgICAgbGV0IHBhcnNpbmcgPSB0aHJlZURpZ2l0cy5ydW4oJzEyMycpO1xuICAgICAgICAgICAgZXhwZWN0KGlzU3VjY2VzcyhwYXJzaW5nKSkudG8uYmUudHJ1ZTtcbiAgICAgICAgICAgIGV4cGVjdChwYXJzaW5nWzBdLnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgnWzEsMiwzXScpO1xuICAgICAgICAgICAgZXhwZWN0KHBhcnNpbmdbMV0pLnRvLmJlLmVxbCgnJyk7XG4gICAgICAgIH0pO1xuICAgICAgICBpdCgnYXMgaW5zdGFuY2UgbWV0aG9kJywgKCkgPT4ge1xuICAgICAgICAgICAgdGhyZWVEaWdpdHMgPSB0aHJlZURpZ2l0cy5mbWFwKChbeCwgW3ksIHpdXSkgPT4gW3gsIHksIHpdKTtcbiAgICAgICAgICAgIGxldCBwYXJzaW5nID0gdGhyZWVEaWdpdHMucnVuKCcxMjMnKTtcbiAgICAgICAgICAgIGV4cGVjdChpc1N1Y2Nlc3MocGFyc2luZykpLnRvLmJlLnRydWU7XG4gICAgICAgICAgICBleHBlY3QocGFyc2luZ1swXS50b1N0cmluZygpKS50by5iZS5lcWwoJ1sxLDIsM10nKTtcbiAgICAgICAgICAgIGV4cGVjdChwYXJzaW5nWzFdKS50by5iZS5lcWwoJycpO1xuICAgICAgICB9KTtcbiAgICB9KTtcbn0pO1xuXG5kZXNjcmliZSgncGFyc2UgQUJDJywgKCkgPT4ge1xuICAgIGxldCBhYmNQLCBwYXJzaW5nO1xuICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgICBhYmNQID0gYW5kVGhlbihwY2hhcignYScpLFxuICAgICAgICAgICAgYW5kVGhlbihwY2hhcignYicpLFxuICAgICAgICAgICAgICAgIGFuZFRoZW4ocGNoYXIoJ2MnKSwgcmV0dXJuUCgnJykpLmZtYXAoKFt4LCB5XSkgPT4geCArIHkpXG4gICAgICAgICAgICApLmZtYXAoKFt4LCB5XSkgPT4geCArIHkpXG4gICAgICAgICkuZm1hcCgoW3gsIHldKSA9PiB4ICsgeSk7XG4gICAgICAgIHBhcnNpbmcgPSBhYmNQLnJ1bignYWJjZCcpO1xuICAgIH0pO1xuICAgIGl0KCdwYXJzZXMgQUJDJywgKCkgPT4ge1xuICAgICAgICBleHBlY3QoaXNTdWNjZXNzKHBhcnNpbmcpKS50by5iZS50cnVlO1xuICAgICAgICBleHBlY3QocGFyc2luZ1swXS50b1N0cmluZygpKS50by5iZS5lcWwoJ2FiYycpO1xuICAgICAgICBleHBlY3QocGFyc2luZ1sxXSkudG8uYmUuZXFsKCdkJyk7XG4gICAgfSk7XG59KTtcblxuZGVzY3JpYmUoJ2EgcGFyc2VycyBmb3IgYW55IG9mIGEgbGlzdCBvZiBjaGFycycsICgpID0+IHtcblxuICAgIGl0KCdjYW4gcGFyc2UgYW55IGxvd2VyY2FzZSBjaGFyJywgKCkgPT4ge1xuICAgICAgICBsZXQgbG93ZXJjYXNlc1BhcnNlciA9IGFueU9mKGxvd2VyY2FzZXMpO1xuXG4gICAgICAgIGV4cGVjdChpc1BhcnNlcihsb3dlcmNhc2VzUGFyc2VyKSkudG8uYmUudHJ1ZTtcbiAgICAgICAgbGV0IHBhcnNpbmdDaG9pY2UgPSBsb3dlcmNhc2VzUGFyc2VyLnJ1bignYScpO1xuICAgICAgICBleHBlY3QoaXNTdWNjZXNzKHBhcnNpbmdDaG9pY2UpKS50by5iZS50cnVlO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZVswXSkudG8uYmUuZXFsKCdhJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlWzFdKS50by5iZS5lcWwoJycpO1xuICAgICAgICBwYXJzaW5nQ2hvaWNlID0gbG93ZXJjYXNlc1BhcnNlci5ydW4oJ2InKTtcbiAgICAgICAgZXhwZWN0KGlzU3VjY2VzcyhwYXJzaW5nQ2hvaWNlKSkudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2VbMF0pLnRvLmJlLmVxbCgnYicpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZVsxXSkudG8uYmUuZXFsKCcnKTtcbiAgICAgICAgcGFyc2luZ0Nob2ljZSA9IGxvd2VyY2FzZXNQYXJzZXIucnVuKCdkJyk7XG4gICAgICAgIGV4cGVjdChpc1N1Y2Nlc3MocGFyc2luZ0Nob2ljZSkpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlWzBdKS50by5iZS5lcWwoJ2QnKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2VbMV0pLnRvLmJlLmVxbCgnJyk7XG4gICAgICAgIHBhcnNpbmdDaG9pY2UgPSBsb3dlcmNhc2VzUGFyc2VyLnJ1bigneicpO1xuICAgICAgICBleHBlY3QoaXNTdWNjZXNzKHBhcnNpbmdDaG9pY2UpKS50by5iZS50cnVlO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZVswXSkudG8uYmUuZXFsKCd6Jyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlWzFdKS50by5iZS5lcWwoJycpO1xuXG4gICAgICAgIHBhcnNpbmdDaG9pY2UgPSBsb3dlcmNhc2VzUGFyc2VyLnJ1bignWScpO1xuICAgICAgICBleHBlY3QoaXNGYWlsdXJlKHBhcnNpbmdDaG9pY2UpKS50by5iZS50cnVlO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZVswXSkudG8uYmUuZXFsKCdwYXJzaW5nIGZhaWxlZCcpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZVsxXSkudG8uYmUuZXFsKCdZJyk7XG4gICAgfSk7XG5cbiAgICBpdCgnY2FuIHBhcnNlIGFueSB1cHBlcmNhc2UgY2hhcicsICgpID0+IHtcbiAgICAgICAgbGV0IHVwcGVyY2FzZXNQYXJzZXIgPSBhbnlPZih1cHBlcmNhc2VzKTtcblxuICAgICAgICBleHBlY3QoaXNQYXJzZXIodXBwZXJjYXNlc1BhcnNlcikpLnRvLmJlLnRydWU7XG4gICAgICAgIGxldCBwYXJzaW5nQ2hvaWNlID0gdXBwZXJjYXNlc1BhcnNlci5ydW4oJ0EnKTtcbiAgICAgICAgZXhwZWN0KGlzU3VjY2VzcyhwYXJzaW5nQ2hvaWNlKSkudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2VbMF0pLnRvLmJlLmVxbCgnQScpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZVsxXSkudG8uYmUuZXFsKCcnKTtcbiAgICAgICAgcGFyc2luZ0Nob2ljZSA9IHVwcGVyY2FzZXNQYXJzZXIucnVuKCdCJyk7XG4gICAgICAgIGV4cGVjdChpc1N1Y2Nlc3MocGFyc2luZ0Nob2ljZSkpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlWzBdKS50by5iZS5lcWwoJ0InKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2VbMV0pLnRvLmJlLmVxbCgnJyk7XG4gICAgICAgIHBhcnNpbmdDaG9pY2UgPSB1cHBlcmNhc2VzUGFyc2VyLnJ1bignUicpO1xuICAgICAgICBleHBlY3QoaXNTdWNjZXNzKHBhcnNpbmdDaG9pY2UpKS50by5iZS50cnVlO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZVswXSkudG8uYmUuZXFsKCdSJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlWzFdKS50by5iZS5lcWwoJycpO1xuICAgICAgICBwYXJzaW5nQ2hvaWNlID0gdXBwZXJjYXNlc1BhcnNlci5ydW4oJ1onKTtcbiAgICAgICAgZXhwZWN0KGlzU3VjY2VzcyhwYXJzaW5nQ2hvaWNlKSkudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2VbMF0pLnRvLmJlLmVxbCgnWicpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZVsxXSkudG8uYmUuZXFsKCcnKTtcblxuICAgICAgICBwYXJzaW5nQ2hvaWNlID0gdXBwZXJjYXNlc1BhcnNlci5ydW4oJ3MnKTtcbiAgICAgICAgZXhwZWN0KGlzRmFpbHVyZShwYXJzaW5nQ2hvaWNlKSkudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2VbMF0pLnRvLmJlLmVxbCgncGFyc2luZyBmYWlsZWQnKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2VbMV0pLnRvLmJlLmVxbCgncycpO1xuICAgIH0pO1xuXG4gICAgaXQoJ2NhbiBwYXJzZSBhbnkgZGlnaXQnLCAoKSA9PiB7XG4gICAgICAgIGxldCBkaWdpdHNQYXJzZXIgPSBhbnlPZihkaWdpdHMpO1xuXG4gICAgICAgIGV4cGVjdChpc1BhcnNlcihkaWdpdHNQYXJzZXIpKS50by5iZS50cnVlO1xuICAgICAgICBsZXQgcGFyc2luZ0Nob2ljZSA9IGRpZ2l0c1BhcnNlci5ydW4oJzEnKTtcbiAgICAgICAgZXhwZWN0KGlzU3VjY2VzcyhwYXJzaW5nQ2hvaWNlKSkudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2VbMF0pLnRvLmJlLmVxbCgnMScpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZVsxXSkudG8uYmUuZXFsKCcnKTtcbiAgICAgICAgcGFyc2luZ0Nob2ljZSA9IGRpZ2l0c1BhcnNlci5ydW4oJzMnKTtcbiAgICAgICAgZXhwZWN0KGlzU3VjY2VzcyhwYXJzaW5nQ2hvaWNlKSkudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2VbMF0pLnRvLmJlLmVxbCgnMycpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZVsxXSkudG8uYmUuZXFsKCcnKTtcbiAgICAgICAgcGFyc2luZ0Nob2ljZSA9IGRpZ2l0c1BhcnNlci5ydW4oJzAnKTtcbiAgICAgICAgZXhwZWN0KGlzU3VjY2VzcyhwYXJzaW5nQ2hvaWNlKSkudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2VbMF0pLnRvLmJlLmVxbCgnMCcpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZVsxXSkudG8uYmUuZXFsKCcnKTtcbiAgICAgICAgcGFyc2luZ0Nob2ljZSA9IGRpZ2l0c1BhcnNlci5ydW4oJzgnKTtcbiAgICAgICAgZXhwZWN0KGlzU3VjY2VzcyhwYXJzaW5nQ2hvaWNlKSkudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2VbMF0pLnRvLmJlLmVxbCgnOCcpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZVsxXSkudG8uYmUuZXFsKCcnKTtcblxuICAgICAgICBwYXJzaW5nQ2hvaWNlID0gZGlnaXRzUGFyc2VyLnJ1bigncycpO1xuICAgICAgICBleHBlY3QoaXNGYWlsdXJlKHBhcnNpbmdDaG9pY2UpKS50by5iZS50cnVlO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZVswXSkudG8uYmUuZXFsKCdwYXJzaW5nIGZhaWxlZCcpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZVsxXSkudG8uYmUuZXFsKCdzJyk7XG4gICAgfSk7XG59KTtcblxuZGVzY3JpYmUoJ2EgY2hvaWNlIG9mIHBhcnNlcnMgYm91bmQgYnkgb3JFbHNlJywgKCkgPT4ge1xuICAgIGxldCBwYXJzZXJzQ2hvaWNlO1xuXG4gICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICAgIHBhcnNlcnNDaG9pY2UgPSBjaG9pY2UoW3BjaGFyKCdhJyksIHBjaGFyKCdiJyksIHBjaGFyKCdjJyksIHBjaGFyKCdkJyksXSk7XG4gICAgfSk7XG5cbiAgICBpdCgnY2FuIHBhcnNlIG9uZSBvZiBmb3VyIGNoYXJzJywgKCkgPT4ge1xuICAgICAgICBleHBlY3QoaXNQYXJzZXIocGFyc2Vyc0Nob2ljZSkpLnRvLmJlLnRydWU7XG4gICAgICAgIGxldCBwYXJzaW5nQ2hvaWNlID0gcGFyc2Vyc0Nob2ljZS5ydW4oJ2EnKTtcbiAgICAgICAgZXhwZWN0KGlzU3VjY2VzcyhwYXJzaW5nQ2hvaWNlKSkudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2VbMF0pLnRvLmJlLmVxbCgnYScpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZVsxXSkudG8uYmUuZXFsKCcnKTtcbiAgICAgICAgcGFyc2luZ0Nob2ljZSA9IHBhcnNlcnNDaG9pY2UucnVuKCdiJyk7XG4gICAgICAgIGV4cGVjdChpc1N1Y2Nlc3MocGFyc2luZ0Nob2ljZSkpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlWzBdKS50by5iZS5lcWwoJ2InKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2VbMV0pLnRvLmJlLmVxbCgnJyk7XG4gICAgICAgIHBhcnNpbmdDaG9pY2UgPSBwYXJzZXJzQ2hvaWNlLnJ1bignZCcpO1xuICAgICAgICBleHBlY3QoaXNTdWNjZXNzKHBhcnNpbmdDaG9pY2UpKS50by5iZS50cnVlO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZVswXSkudG8uYmUuZXFsKCdkJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlWzFdKS50by5iZS5lcWwoJycpO1xuICAgIH0pO1xuXG4gICAgaXQoJ2NhbiBhbHNvIHBhcnNlIE5PTkUgb2YgZm91ciBjaGFycycsICgpID0+IHtcbiAgICAgICAgY29uc3QgcGFyc2luZ0Nob2ljZSA9IHBhcnNlcnNDaG9pY2UucnVuKCd4Jyk7XG4gICAgICAgIGV4cGVjdChpc0ZhaWx1cmUocGFyc2luZ0Nob2ljZSkpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlWzBdKS50by5iZS5lcWwoJ3BhcnNpbmcgZmFpbGVkJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlWzFdKS50by5iZS5lcWwoJ3gnKTtcbiAgICB9KTtcbn0pO1xuXG5kZXNjcmliZSgndHdvIHBhcnNlcnMgYm91bmQgYnkgb3JFbHNlJywgKCkgPT4ge1xuICAgIGxldCBwYXJzZXJBLCBwYXJzZXJCLCBwYXJzZXJBb3JCO1xuXG4gICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICAgIHBhcnNlckFvckIgPSBvckVsc2UocGNoYXIoJ2EnKSwgcGNoYXIoJ2InKSk7XG4gICAgfSk7XG5cbiAgICBpdCgnY2FuIHBhcnNlIG9uZSBvZiB0d28gY2hhcnMnLCAoKSA9PiB7XG4gICAgICAgIGV4cGVjdChpc1BhcnNlcihwYXJzZXJBb3JCKSkudG8uYmUudHJ1ZTtcbiAgICAgICAgbGV0IHBhcnNpbmdBb3JCID0gcGFyc2VyQW9yQi5ydW4oJ2FiYycpO1xuICAgICAgICBleHBlY3QoaXNTdWNjZXNzKHBhcnNpbmdBb3JCKSkudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdBb3JCWzBdKS50by5iZS5lcWwoJ2EnKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdBb3JCWzFdKS50by5iZS5lcWwoJ2JjJyk7XG4gICAgICAgIHBhcnNpbmdBb3JCID0gcGFyc2VyQW9yQi5ydW4oJ2JiYycpO1xuICAgICAgICBleHBlY3QoaXNTdWNjZXNzKHBhcnNpbmdBb3JCKSkudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdBb3JCWzBdKS50by5iZS5lcWwoJ2InKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdBb3JCWzFdKS50by5iZS5lcWwoJ2JjJyk7XG4gICAgfSk7XG5cbiAgICBpdCgnY2FuIGFsc28gcGFyc2UgTk9ORSBvZiB0d28gY2hhcnMnLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHBhcnNpbmdBb3JCID0gcGFyc2VyQW9yQi5ydW4oJ2NkZScpO1xuICAgICAgICBleHBlY3QoaXNGYWlsdXJlKHBhcnNpbmdBb3JCKSkudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdBb3JCWzBdKS50by5iZS5lcWwoJ3dhbnRlZCBiOyBnb3QgYycpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0FvckJbMV0pLnRvLmJlLmVxbCgnY2RlJyk7XG4gICAgfSk7XG59KTtcblxuZGVzY3JpYmUoJ3R3byBwYXJzZXJzIGJvdW5kIGJ5IGFuZFRoZW4nLCAoKSA9PiB7XG4gICAgbGV0IHBhcnNlckFhbmRCO1xuXG4gICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICAgIHBhcnNlckFhbmRCID0gYW5kVGhlbihwY2hhcignYScpLCBwY2hhcignYicpKTtcbiAgICB9KTtcblxuICAgIGl0KCdjYW4gcGFyc2UgdHdvIGNoYXJzJywgKCkgPT4ge1xuICAgICAgICBleHBlY3QoaXNQYXJzZXIocGFyc2VyQWFuZEIpKS50by5iZS50cnVlO1xuICAgICAgICBjb25zdCBwYXJzaW5nQWFuZEIgPSBwYXJzZXJBYW5kQi5ydW4oJ2FiYycpO1xuICAgICAgICBleHBlY3QoaXNTdWNjZXNzKHBhcnNpbmdBYW5kQikpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQWFuZEJbMF0udG9TdHJpbmcoKSkudG8uYmUuZXFsKCdbYSxiXScpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0FhbmRCWzFdKS50by5iZS5lcWwoJ2MnKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdBYW5kQi50b1N0cmluZygpKS50by5iZS5lcWwoJ1tbYSxiXSxjXScpO1xuICAgIH0pO1xuXG4gICAgaXQoJ2NhbiBhbHNvIE5PVCBwYXJzZSB0d28gY2hhcnMnLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHBhcnNpbmdBYW5kQiA9IHBhcnNlckFhbmRCLnJ1bignYWNkJyk7XG4gICAgICAgIGV4cGVjdChpc0ZhaWx1cmUocGFyc2luZ0FhbmRCKSkudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdBYW5kQlswXSkudG8uYmUuZXFsKCd3YW50ZWQgYjsgZ290IGMnKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdBYW5kQlsxXSkudG8uYmUuZXFsKCdjZCcpO1xuICAgIH0pO1xufSk7XG5cbmRlc2NyaWJlKCdhIHNpbXBsZSBwYXJzZXInLCAoKSA9PiB7XG4gICAgY29uc3QgcGFyc2VyQSA9IGNoYXJQYXJzZXIoJ2EnKTtcbiAgICBjb25zdCBwYXJzZXIxID0gZGlnaXRQYXJzZXIoMSk7XG5cbiAgICBpdCgnY2FuIHBhcnNlIGEgc2luZ2xlIGNoYXInLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHBhcnNpbmdBID0gcGFyc2VyQSgnYWJjJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQVswXSkudG8uYmUuZXFsKCdhJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQVsxXSkudG8uYmUuZXFsKCdiYycpO1xuICAgICAgICBleHBlY3QoaXNTdWNjZXNzKHBhcnNpbmdBKSkudG8uYmUudHJ1ZTtcbiAgICB9KTtcblxuICAgIGl0KCdjYW4gYWxzbyBOT1QgcGFyc2UgYSBzaW5nbGUgY2hhcicsICgpID0+IHtcbiAgICAgICAgY29uc3QgcGFyc2luZ0IgPSBwYXJzZXJBKCdiY2QnKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdCWzBdKS50by5iZS5lcWwoJ3dhbnRlZCBhOyBnb3QgYicpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0JbMV0pLnRvLmJlLmVxbCgnYmNkJyk7XG4gICAgICAgIGV4cGVjdChpc0ZhaWx1cmUocGFyc2luZ0IpKS50by5iZS50cnVlO1xuICAgIH0pO1xuXG4gICAgaXQoJ2NhbiBwYXJzZSBhIHNpbmdsZSBkaWdpdCcsICgpID0+IHtcbiAgICAgICAgY29uc3QgcGFyc2luZzEgPSBwYXJzZXIxKCcxMjMnKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcxWzBdKS50by5iZS5lcWwoMSk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nMVsxXSkudG8uYmUuZXFsKCcyMycpO1xuICAgICAgICBleHBlY3QoaXNTdWNjZXNzKHBhcnNpbmcxKSkudG8uYmUudHJ1ZTtcbiAgICB9KTtcblxuICAgIGl0KCdjYW4gYWxzbyBOT1QgcGFyc2UgYSBzaW5nbGUgZGlnaXQnLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHBhcnNpbmcyID0gcGFyc2VyMSgnMjM0Jyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nMlswXSkudG8uYmUuZXFsKCd3YW50ZWQgMTsgZ290IDInKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcyWzFdKS50by5iZS5lcWwoJzIzNCcpO1xuICAgICAgICBleHBlY3QoaXNGYWlsdXJlKHBhcnNpbmcyKSkudG8uYmUudHJ1ZTtcbiAgICB9KTtcbn0pO1xuXG5kZXNjcmliZSgnYSBzbGlnaHRseSBtb3JlIGNvbXBsZXggcGFyc2VyJywgKCkgPT4ge1xuICAgIGNvbnN0IHBhcnNlckEgPSBjaGFyUGFyc2VyKCdhJyk7XG5cbiAgICBpdCgnY2FuIHBhcnNlIGEgc2luZ2xlIGNoYXInLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHBhcnNpbmdBID0gcGFyc2VyQSgnYWJjJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQVswXSkudG8uYmUuZXFsKCdhJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQVsxXSkudG8uYmUuZXFsKCdiYycpO1xuICAgICAgICBleHBlY3QoaXNTdWNjZXNzKHBhcnNpbmdBKSkudG8uYmUudHJ1ZTtcbiAgICB9KTtcblxuICAgIGl0KCdjYW4gYWxzbyBOT1QgcGFyc2UgYSBzaW5nbGUgY2hhcicsICgpID0+IHtcbiAgICAgICAgY29uc3QgcGFyc2luZ0IgPSBwYXJzZXJBKCdiY2QnKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdCWzBdKS50by5iZS5lcWwoJ3dhbnRlZCBhOyBnb3QgYicpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0JbMV0pLnRvLmJlLmVxbCgnYmNkJyk7XG4gICAgICAgIGV4cGVjdChpc0ZhaWx1cmUocGFyc2luZ0IpKS50by5iZS50cnVlO1xuICAgIH0pO1xufSk7XG5cbmRlc2NyaWJlKCdhIG5hbWVkIGNoYXJhY3RlciBwYXJzZXInLCAoKSA9PiB7XG4gICAgbGV0IHBhcnNlckE7XG5cbiAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgICAgcGFyc2VyQSA9IHBjaGFyKCdhJyk7XG4gICAgfSk7XG5cbiAgICBpdCgnY2FuIHBhcnNlIGEgc2luZ2xlIGNoYXInLCAoKSA9PiB7XG4gICAgICAgIGV4cGVjdChpc1BhcnNlcihwYXJzZXJBKSkudG8uYmUudHJ1ZTtcbiAgICAgICAgY29uc3QgcGFyc2luZ0EgPSBwYXJzZXJBLnJ1bignYWJjJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQVswXSkudG8uYmUuZXFsKCdhJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQVsxXSkudG8uYmUuZXFsKCdiYycpO1xuICAgICAgICBleHBlY3QoaXNTdWNjZXNzKHBhcnNpbmdBKSkudG8uYmUudHJ1ZTtcbiAgICB9KTtcblxuICAgIGl0KCdjYW4gYWxzbyBOT1QgcGFyc2UgYSBzaW5nbGUgY2hhcicsICgpID0+IHtcbiAgICAgICAgY29uc3QgcGFyc2luZ0IgPSBwYXJzZXJBLnJ1bignYmNkJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQlswXSkudG8uYmUuZXFsKCd3YW50ZWQgYTsgZ290IGInKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdCWzFdKS50by5iZS5lcWwoJ2JjZCcpO1xuICAgICAgICBleHBlY3QoaXNGYWlsdXJlKHBhcnNpbmdCKSkudG8uYmUudHJ1ZTtcbiAgICB9KTtcbn0pO1xuIl19