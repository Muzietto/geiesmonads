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

    describe('sequence for parsers based on lift2(cons) (aka sequenceP)', function () {
        it('stores matched chars inside an array', function () {
            var abcParser = (0, _parsers.sequenceP)([(0, _parsers.pchar)('a'), (0, _parsers.pchar)('b'), (0, _parsers.pchar)('c')]);
            (0, _chai.expect)(abcParser.run('abc').toString()).to.be.eql('[[a,b,c],]');
        });
    });

    describe('sequences for parsers based on andThen && fmap (aka sequenceP2)', function () {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2pzLXNwZWMvcGFyc2Vyc190ZXN0cy5qcyJdLCJuYW1lcyI6WyJsb3dlcmNhc2VzIiwidXBwZXJjYXNlcyIsImRpZ2l0cyIsIndoaXRlcyIsImRlc2NyaWJlIiwiaXQiLCJpbnNpZGVQYXJlbnMiLCJkaXNjYXJkRmlyc3QiLCJkaXNjYXJkU2Vjb25kIiwicnVuIiwidG9TdHJpbmciLCJ0byIsImJlIiwiZXFsIiwiZGlzY2FyZEludGVnZXJTaWduIiwicGFyc2luZyIsImRpc2NhcmRTdWZmaXgiLCJvcHREb3RUaGVuQSIsImFuZFRoZW4iLCJwaW50IiwiZm1hcCIsInBhcnNlSW50IiwibCIsInJlZHVjZSIsImFjYyIsImN1cnIiLCJwU2lnbmVkSW50IiwibWF5YmVTaWduIiwibnVtYmVyIiwib3B0U3Vic3RyaW5nIiwiemVyb09yTW9yZVBhcnNlciIsInRydWUiLCJ3aGl0ZXNQYXJzZXIiLCJ0d29Xb3JkcyIsInplcm9Pck1vcmVQYXJzaW5nRnVuY3Rpb24iLCJtYXJjb1BhcnNlciIsIm1hcmNvUGFyc2luZyIsImFiY1BhcnNlciIsImFkZFN0cmluZ3MiLCJ4IiwieSIsIkFwbHVzQiIsImFkZERpZ2l0cyIsImFkZFBhcnNlciIsInBhcnNlRGlnaXQiLCJ0aHJlZURpZ2l0cyIsImJlZm9yZUVhY2giLCJ6IiwiYWJjUCIsImxvd2VyY2FzZXNQYXJzZXIiLCJwYXJzaW5nQ2hvaWNlIiwidXBwZXJjYXNlc1BhcnNlciIsImRpZ2l0c1BhcnNlciIsInBhcnNlcnNDaG9pY2UiLCJwYXJzZXJBIiwicGFyc2VyQiIsInBhcnNlckFvckIiLCJwYXJzaW5nQW9yQiIsInBhcnNlckFhbmRCIiwicGFyc2luZ0FhbmRCIiwicGFyc2VyMSIsInBhcnNpbmdBIiwicGFyc2luZ0IiLCJwYXJzaW5nMSIsInBhcnNpbmcyIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQW9DQSxRQUFNQSxhQUFhLENBQUMsR0FBRCxFQUFN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LEVBQW9CbEQsRUFBcEIsQ0FBdUJDLEVBQXZCLENBQTBCQyxHQUExQixDQUE4QixJQUE5QjtBQUNBLDhCQUFPLHFCQUFVZ0QsUUFBVixDQUFQLEVBQTRCbEQsRUFBNUIsQ0FBK0JDLEVBQS9CLENBQWtDbUIsSUFBbEM7QUFDSCxTQU5EOztBQVFBMUIsV0FBRyxrQ0FBSCxFQUF1QyxZQUFNO0FBQ3pDLGdCQUFNeUQsV0FBV1IsUUFBUTdDLEdBQVIsQ0FBWSxLQUFaLENBQWpCO0FBQ0EsOEJBQU9xRCxTQUFTLENBQVQsQ0FBUCxFQUFvQm5ELEVBQXBCLENBQXVCQyxFQUF2QixDQUEwQkMsR0FBMUIsQ0FBOEIsaUJBQTlCO0FBQ0EsOEJBQU9pRCxTQUFTLENBQVQsQ0FBUCxFQUFvQm5ELEVBQXBCLENBQXVCQyxFQUF2QixDQUEwQkMsR0FBMUIsQ0FBOEIsS0FBOUI7QUFDQSw4QkFBTyxxQkFBVWlELFFBQVYsQ0FBUCxFQUE0Qm5ELEVBQTVCLENBQStCQyxFQUEvQixDQUFrQ21CLElBQWxDO0FBQ0gsU0FMRDtBQU1ILEtBckJEIiwiZmlsZSI6InBhcnNlcnNfdGVzdHMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge2V4cGVjdH0gZnJvbSAnY2hhaSc7XG5pbXBvcnQge1xuICAgIGNoYXJQYXJzZXIsXG4gICAgZGlnaXRQYXJzZXIsXG4gICAgcGNoYXIsXG4gICAgcGRpZ2l0LFxuICAgIGFuZFRoZW4sXG4gICAgb3JFbHNlLFxuICAgIGNob2ljZSxcbiAgICBhbnlPZixcbiAgICBmbWFwLFxuICAgIHJldHVyblAsXG4gICAgYXBwbHlQLFxuICAgIGxpZnQyLFxuICAgIHNlcXVlbmNlUCxcbiAgICBzZXF1ZW5jZVAyLFxuICAgIHBzdHJpbmcsXG4gICAgemVyb09yTW9yZSxcbiAgICBtYW55LFxuICAgIG1hbnkxLFxuICAgIG9wdCxcbiAgICBvcHRCb29rLFxuICAgIGRpc2NhcmRGaXJzdCxcbiAgICBkaXNjYXJkU2Vjb25kLFxuICAgIGJldHdlZW4sXG4gICAgYmV0d2VlblBhcmVucyxcbn0gZnJvbSAncGFyc2Vycyc7XG5pbXBvcnQge1xuICAgIGlzUGFpcixcbiAgICBpc1N1Y2Nlc3MsXG4gICAgaXNGYWlsdXJlLFxuICAgIGlzUGFyc2VyLFxuICAgIGlzU29tZSxcbiAgICBpc05vbmUsXG59IGZyb20gJ3V0aWwnO1xuXG5jb25zdCBsb3dlcmNhc2VzID0gWydhJywgJ2InLCAnYycsICdkJywgJ2UnLCAnZicsICdnJywgJ2gnLCAnaScsICdqJywgJ2snLCAnbCcsICdtJywgJ24nLCAnbycsICdwJywgJ3EnLCAncicsICdzJywgJ3QnLCAndScsICd2JywgJ3cnLCAneCcsICd5JywgJ3onLF07XG5jb25zdCB1cHBlcmNhc2VzID0gWydBJywgJ0InLCAnQycsICdEJywgJ0UnLCAnRicsICdHJywgJ0gnLCAnSScsICdKJywgJ0snLCAnTCcsICdNJywgJ04nLCAnTycsICdQJywgJ1EnLCAnUicsICdTJywgJ1QnLCAnVScsICdWJywgJ1cnLCAnWCcsICdZJywgJ1onLF07XG5jb25zdCBkaWdpdHMgPSBbJzAnLCAnMScsICcyJywgJzMnLCAnNCcsICc1JywgJzYnLCAnNycsICc4JywgJzknXTtcbmNvbnN0IHdoaXRlcyA9IFsnICcsICdcXHQnLCAnXFxuJywgJ1xcciddO1xuXG5kZXNjcmliZSgncGFyc2luZyB3aGlsZSBkaXNjYXJkaW5nIGlucHV0JywgKCkgPT4ge1xuICAgIGl0KCdhbGxvd3MgdG8gZXhjbHVkZSBwYXJlbnRoZXNlcycsICgpID0+IHtcbiAgICAgICAgY29uc3QgaW5zaWRlUGFyZW5zID0gcGNoYXIoJygnKVxuICAgICAgICAgICAgLmRpc2NhcmRGaXJzdChtYW55KGFueU9mKGxvd2VyY2FzZXMpKSlcbiAgICAgICAgICAgIC5kaXNjYXJkU2Vjb25kKHBjaGFyKCcpJykpO1xuICAgICAgICBleHBlY3QoaW5zaWRlUGFyZW5zLnJ1bignKG1hcmNvKScpLnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgnW1ttLGEscixjLG9dLF0nKTtcbiAgICAgICAgZXhwZWN0KGluc2lkZVBhcmVucy5ydW4oJygpJykudG9TdHJpbmcoKSkudG8uYmUuZXFsKCdbW10sXScpO1xuICAgIH0pO1xuICAgIGl0KCcuLi5ldmVuIHVzaW5nIGEgdGFpbG9yLW1hZGUgbWV0aG9kJywgKCkgPT4ge1xuICAgICAgICBjb25zdCBpbnNpZGVQYXJlbnMgPSBiZXR3ZWVuUGFyZW5zKHBzdHJpbmcoJ21hcmNvJykpO1xuICAgICAgICBleHBlY3QoaW5zaWRlUGFyZW5zLnJ1bignKG1hcmNvKScpLnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgnW1ttLGEscixjLG9dLF0nKTtcbiAgICB9KTtcbn0pO1xuXG5kZXNjcmliZSgnYSBjb3VwbGUgb2YgcGFyc2VycycsICgpID0+IHtcbiAgICBpdCgnY2FuIGRlY2lkZSB0byBkaXNjYXJkIHRoZSBtYXRjaGVzIG9mIHRoZSBmaXJzdCBvbmUnLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IGRpc2NhcmRJbnRlZ2VyU2lnbiA9IHBjaGFyKCctJykuZGlzY2FyZEZpcnN0KHBkaWdpdCg4KSk7XG4gICAgICAgIGxldCBwYXJzaW5nID0gZGlzY2FyZEludGVnZXJTaWduLnJ1bignLTh4Jyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgnWzgseF0nKTtcbiAgICB9KTtcbiAgICBpdCgnY2FuIGRlY2lkZSB0byBkaXNjYXJkIHRoZSBtYXRjaGVzIG9mIHRoZSBzZWNvbmQgb25lJywgKCkgPT4ge1xuICAgICAgICBjb25zdCBkaXNjYXJkU3VmZml4ID0gcHN0cmluZygnbWFyY28nKS5kaXNjYXJkU2Vjb25kKG1hbnkxKGFueU9mKHdoaXRlcykpKTtcbiAgICAgICAgbGV0IHBhcnNpbmcgPSBkaXNjYXJkU3VmZml4LnJ1bignbWFyY28gZmF1c3RpbmVsbGknKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcudG9TdHJpbmcoKSkudG8uYmUuZXFsKCdbW20sYSxyLGMsb10sZmF1c3RpbmVsbGldJyk7XG4gICAgICAgIHBhcnNpbmcgPSBkaXNjYXJkU3VmZml4LnJ1bignbWFyY28gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZhdXN0aW5lbGxpJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgnW1ttLGEscixjLG9dLGZhdXN0aW5lbGxpXScpO1xuICAgIH0pO1xufSk7XG5cbmRlc2NyaWJlKCdhIHBhcnNlciBmb3Igb3B0aW9uYWwgY2hhcmFjdGVycycsICgpID0+IHtcbiAgICBpdCgnY2FuIGNhcHR1cmUgb3Igbm90IGNhcHR1cmUgYSBkb3QnLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IG9wdERvdFRoZW5BID0gb3B0KHBjaGFyKCcuJykpLmFuZFRoZW4ocGNoYXIoJ2EnKSk7XG4gICAgICAgIGV4cGVjdChvcHREb3RUaGVuQS5ydW4oJy5hYmMnKS50b1N0cmluZygpKS50by5iZS5lcWwoJ1tbc29tZSguKSxhXSxiY10nKTtcbiAgICAgICAgZXhwZWN0KG9wdERvdFRoZW5BLnJ1bignYWJjJykudG9TdHJpbmcoKSkudG8uYmUuZXFsKCdbW25vbmUoKSxhXSxiY10nKTtcbiAgICB9KTtcbiAgICBpdCgnY2FuIHBhcnNlIFNJR05FRCBpbnRlZ2VycyEhIScsICgpID0+IHtcbiAgICAgICAgY29uc3QgcGludCA9IG1hbnkxKGFueU9mKGRpZ2l0cykpXG4gICAgICAgICAgICAuZm1hcChsID0+IHBhcnNlSW50KGwucmVkdWNlKChhY2MsIGN1cnIpID0+IGFjYyArIGN1cnIsICcnKSwgMTApKTtcbiAgICAgICAgY29uc3QgcFNpZ25lZEludCA9IG9wdChwY2hhcignLScpKVxuICAgICAgICAgICAgLmFuZFRoZW4ocGludClcbiAgICAgICAgICAgIC5mbWFwKChbbWF5YmVTaWduLCBudW1iZXJdKSA9PiAoaXNTb21lKG1heWJlU2lnbikpID8gLW51bWJlciA6IG51bWJlcik7XG4gICAgICAgIGV4cGVjdChwU2lnbmVkSW50LnJ1bignMTMyNDM1NDZ4JylbMF0pLnRvLmJlLmVxbCgxMzI0MzU0Nik7XG4gICAgICAgIGV4cGVjdChwU2lnbmVkSW50LnJ1bignLTEzMjQzNTQ2eCcpWzBdKS50by5iZS5lcWwoLTEzMjQzNTQ2KTtcbiAgICB9KTtcbiAgICBpdCgnY2FuIGNhcHR1cmUgb3Igbm90IGNhcHR1cmUgYSB3aG9sZSBzdWJzdHJpbmcnLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IG9wdFN1YnN0cmluZyA9IG9wdChwc3RyaW5nKCdtYXJjbycpKS5hbmRUaGVuKHBzdHJpbmcoJ2ZhdXN0aW5lbGxpJykpO1xuICAgICAgICBleHBlY3Qob3B0U3Vic3RyaW5nLnJ1bignbWFyY29mYXVzdGluZWxsaXgnKS50b1N0cmluZygpKVxuICAgICAgICAgICAgLnRvLmJlLmVxbCgnW1tzb21lKFttLGEscixjLG9dKSxbZixhLHUscyx0LGksbixlLGwsbCxpXV0seF0nKTtcbiAgICAgICAgZXhwZWN0KG9wdFN1YnN0cmluZy5ydW4oJ2ZhdXN0aW5lbGxpeCcpLnRvU3RyaW5nKCkpXG4gICAgICAgICAgICAudG8uYmUuZXFsKCdbW25vbmUoKSxbZixhLHUscyx0LGksbixlLGwsbCxpXV0seF0nKTtcbiAgICB9KTtcbn0pO1xuXG5kZXNjcmliZSgnYSBwYXJzZXIgZm9yIG9uZSBvciBtb3JlIG9jY3VycmVuY2VzJywgKCkgPT4ge1xuICAgIGl0KCdjYW5ub3QgcGFyc2UgYSBjaGFyIHplcm8gdGltZXMnLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHplcm9Pck1vcmVQYXJzZXIgPSBtYW55MShwY2hhcignbScpKTtcbiAgICAgICAgbGV0IHBhcnNpbmcgPSB6ZXJvT3JNb3JlUGFyc2VyLnJ1bignYXJjbycpO1xuICAgICAgICBleHBlY3QoaXNGYWlsdXJlKHBhcnNpbmcpKS50by5iZS50cnVlO1xuICAgICAgICBleHBlY3QocGFyc2luZy50b1N0cmluZygpKS50by5iZS5lcWwoJ1t3YW50ZWQgbTsgZ290IGEsYXJjb10nKTtcbiAgICB9KTtcbiAgICBpdCgnY2FuIHBhcnNlIGEgY2hhciBtYW55IHRpbWVzJywgKCkgPT4ge1xuICAgICAgICBjb25zdCB6ZXJvT3JNb3JlUGFyc2VyID0gbWFueTEocGNoYXIoJ20nKSk7XG4gICAgICAgIGxldCBwYXJzaW5nID0gemVyb09yTW9yZVBhcnNlci5ydW4oJ21tbWFyY28nKTtcbiAgICAgICAgZXhwZWN0KGlzU3VjY2VzcyhwYXJzaW5nKSkudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcudG9TdHJpbmcoKSkudG8uYmUuZXFsKCdbW20sbSxtXSxhcmNvXScpO1xuICAgIH0pO1xuICAgIGl0KCdjYW5ub3QgcGFyc2UgYSBjaGFyIHNlcXVlbmNlIHplcm8gdGltZXMnLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHplcm9Pck1vcmVQYXJzZXIgPSBtYW55MShwc3RyaW5nKCdtYXJjbycpKTtcbiAgICAgICAgbGV0IHBhcnNpbmcgPSB6ZXJvT3JNb3JlUGFyc2VyLnJ1bigneG1hcmNvbWFyY29jaWFvJyk7XG4gICAgICAgIGV4cGVjdChpc0ZhaWx1cmUocGFyc2luZykpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgnW3dhbnRlZCBtOyBnb3QgeCx4bWFyY29tYXJjb2NpYW9dJyk7XG4gICAgfSk7XG4gICAgaXQoJ2NhbiBwYXJzZSBhIGNoYXIgc2VxdWVuY2UgbWFueSB0aW1lcycsICgpID0+IHtcbiAgICAgICAgY29uc3QgemVyb09yTW9yZVBhcnNlciA9IG1hbnkxKHBzdHJpbmcoJ21hcmNvJykpO1xuICAgICAgICBsZXQgcGFyc2luZyA9IHplcm9Pck1vcmVQYXJzZXIucnVuKCdtYXJjb21hcmNvY2lhbycpO1xuICAgICAgICBleHBlY3QoaXNTdWNjZXNzKHBhcnNpbmcpKS50by5iZS50cnVlO1xuICAgICAgICBleHBlY3QocGFyc2luZy50b1N0cmluZygpKS50by5iZS5lcWwoJ1tbW20sYSxyLGMsb10sW20sYSxyLGMsb11dLGNpYW9dJyk7XG4gICAgfSk7XG4gICAgaXQoJ2NhbiBwYXJzZSBhbiBpbnRlZ2VyLCBubyBtYXR0ZXIgaG93IGxhcmdlLi4uJywgKCkgPT4ge1xuICAgICAgICBjb25zdCBwaW50ID0gbWFueTEoYW55T2YoZGlnaXRzKSk7XG4gICAgICAgIGxldCBwYXJzaW5nID0gcGludC5ydW4oJzEyMzQ1QScpO1xuICAgICAgICBleHBlY3QoaXNTdWNjZXNzKHBhcnNpbmcpKS50by5iZS50cnVlO1xuICAgICAgICBleHBlY3QocGFyc2luZy50b1N0cmluZygpKS50by5iZS5lcWwoJ1tbMSwyLDMsNCw1XSxBXScpO1xuICAgICAgICBwYXJzaW5nID0gcGludC5ydW4oJzFCJyk7XG4gICAgICAgIGV4cGVjdChpc1N1Y2Nlc3MocGFyc2luZykpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgnW1sxXSxCXScpO1xuICAgICAgICBwYXJzaW5nID0gcGludC5ydW4oJ0ExMjM0NScpO1xuICAgICAgICBleHBlY3QoaXNGYWlsdXJlKHBhcnNpbmcpKS50by5iZS50cnVlO1xuICAgICAgICBleHBlY3QocGFyc2luZy50b1N0cmluZygpKS50by5iZS5lcWwoJ1twYXJzaW5nIGZhaWxlZCxBMTIzNDVdJyk7XG4gICAgfSk7XG4gICAgaXQoJ2NhbiBwYXJzZSBhbiBpbnRlZ2VyIGludG8gYSB0cnVlIGludGVnZXInLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHBpbnQgPSBtYW55MShhbnlPZihkaWdpdHMpKVxuICAgICAgICAgICAgLmZtYXAobCA9PiBwYXJzZUludChsLnJlZHVjZSgoYWNjLCBjdXJyKSA9PiBhY2MgKyBjdXJyLCAnJyksIDEwKSk7XG4gICAgICAgIGxldCBwYXJzaW5nID0gcGludC5ydW4oJzEyMzQ1QScpO1xuICAgICAgICBleHBlY3QoaXNTdWNjZXNzKHBhcnNpbmcpKS50by5iZS50cnVlO1xuICAgICAgICBleHBlY3QocGFyc2luZ1swXSkudG8uYmUuZXFsKDEyMzQ1KTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdbMV0pLnRvLmJlLmVxbCgnQScpO1xuICAgIH0pO1xufSk7XG5cbmRlc2NyaWJlKCdhIHBhcnNlciBmb3IgemVybyBvciBtb3JlIG9jY3VycmVuY2VzJywgKCkgPT4ge1xuICAgIGl0KCdjYW4gcGFyc2UgYSBjaGFyIHplcm8gdGltZXMnLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHplcm9Pck1vcmVQYXJzZXIgPSBtYW55KHBjaGFyKCdtJykpO1xuICAgICAgICBsZXQgcGFyc2luZyA9IHplcm9Pck1vcmVQYXJzZXIucnVuKCdhcmNvJyk7XG4gICAgICAgIGV4cGVjdChpc1N1Y2Nlc3MocGFyc2luZykpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgnW1tdLGFyY29dJyk7XG4gICAgfSk7XG4gICAgaXQoJ2NhbiBwYXJzZSBhIGNoYXIgbWFueSB0aW1lcycsICgpID0+IHtcbiAgICAgICAgY29uc3QgemVyb09yTW9yZVBhcnNlciA9IG1hbnkocGNoYXIoJ20nKSk7XG4gICAgICAgIGxldCBwYXJzaW5nID0gemVyb09yTW9yZVBhcnNlci5ydW4oJ21tbWFyY28nKTtcbiAgICAgICAgZXhwZWN0KGlzU3VjY2VzcyhwYXJzaW5nKSkudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcudG9TdHJpbmcoKSkudG8uYmUuZXFsKCdbW20sbSxtXSxhcmNvXScpO1xuICAgIH0pO1xuICAgIGl0KCdjYW4gcGFyc2UgYSBjaGFyIHNlcXVlbmNlIHplcm8gdGltZXMnLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHplcm9Pck1vcmVQYXJzZXIgPSBtYW55KHBzdHJpbmcoJ21hcmNvJykpO1xuICAgICAgICBsZXQgcGFyc2luZyA9IHplcm9Pck1vcmVQYXJzZXIucnVuKCd4bWFyY29tYXJjb2NpYW8nKTtcbiAgICAgICAgZXhwZWN0KGlzU3VjY2VzcyhwYXJzaW5nKSkudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcudG9TdHJpbmcoKSkudG8uYmUuZXFsKCdbW10seG1hcmNvbWFyY29jaWFvXScpO1xuICAgIH0pO1xuICAgIGl0KCdjYW4gcGFyc2UgYSBjaGFyIHNlcXVlbmNlIG1hbnkgdGltZXMnLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHplcm9Pck1vcmVQYXJzZXIgPSBtYW55KHBzdHJpbmcoJ21hcmNvJykpO1xuICAgICAgICBsZXQgcGFyc2luZyA9IHplcm9Pck1vcmVQYXJzZXIucnVuKCdtYXJjb21hcmNvY2lhbycpO1xuICAgICAgICBleHBlY3QoaXNTdWNjZXNzKHBhcnNpbmcpKS50by5iZS50cnVlO1xuICAgICAgICBleHBlY3QocGFyc2luZy50b1N0cmluZygpKS50by5iZS5lcWwoJ1tbW20sYSxyLGMsb10sW20sYSxyLGMsb11dLGNpYW9dJyk7XG4gICAgfSk7XG4gICAgaXQoJ2NhbiBwYXJzZSB3aGl0ZXNwYWNlcyEhJywgKCkgPT4ge1xuICAgICAgICBjb25zdCB3aGl0ZXNQYXJzZXIgPSBtYW55KGFueU9mKHdoaXRlcykpO1xuICAgICAgICBjb25zdCB0d29Xb3JkcyA9IHNlcXVlbmNlUChbcHN0cmluZygnY2lhbycpLCB3aGl0ZXNQYXJzZXIsIHBzdHJpbmcoJ21hbW1hJyldKTtcbiAgICAgICAgbGV0IHBhcnNpbmcgPSB0d29Xb3Jkcy5ydW4oJ2NpYW9tYW1tYVgnKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcudG9TdHJpbmcoKSkudG8uYmUuZXFsKCdbW1tjLGksYSxvXSxbXSxbbSxhLG0sbSxhXV0sWF0nKTtcbiAgICAgICAgcGFyc2luZyA9IHR3b1dvcmRzLnJ1bignY2lhbyBtYW1tYVgnKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcudG9TdHJpbmcoKSkudG8uYmUuZXFsKCdbW1tjLGksYSxvXSxbIF0sW20sYSxtLG0sYV1dLFhdJyk7XG4gICAgICAgIHBhcnNpbmcgPSB0d29Xb3Jkcy5ydW4oJ2NpYW8gICBtYW1tYVgnKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcudG9TdHJpbmcoKSkudG8uYmUuZXFsKCdbW1tjLGksYSxvXSxbICwgLCBdLFttLGEsbSxtLGFdXSxYXScpO1xuICAgICAgICBwYXJzaW5nID0gdHdvV29yZHMucnVuKCdjaWFvIFxcdCBtYW1tYVgnKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcudG9TdHJpbmcoKSkudG8uYmUuZXFsKCdbW1tjLGksYSxvXSxbICxcXHQsIF0sW20sYSxtLG0sYV1dLFhdJyk7XG4gICAgfSk7XG59KTtcblxuZGVzY3JpYmUoJ2EgcGFyc2luZyBmdW5jdGlvbiBmb3IgemVybyBvciBtb3JlIG9jY3VycmVuY2VzJywgKCkgPT4ge1xuICAgIGl0KCdjYW4gcGFyc2UgYSBjaGFyIHplcm8gdGltZXMnLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHplcm9Pck1vcmVQYXJzaW5nRnVuY3Rpb24gPSB6ZXJvT3JNb3JlKHBjaGFyKCdtJykpO1xuICAgICAgICBsZXQgcGFyc2luZyA9IHplcm9Pck1vcmVQYXJzaW5nRnVuY3Rpb24oJ2FyY28nKTtcbiAgICAgICAgZXhwZWN0KGlzU3VjY2VzcyhwYXJzaW5nKSkudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcudG9TdHJpbmcoKSkudG8uYmUuZXFsKCdbW10sYXJjb10nKTtcbiAgICB9KTtcbiAgICBpdCgnY2FuIHBhcnNlIGEgY2hhciBtYW55IHRpbWVzJywgKCkgPT4ge1xuICAgICAgICBjb25zdCB6ZXJvT3JNb3JlUGFyc2luZ0Z1bmN0aW9uID0gemVyb09yTW9yZShwY2hhcignbScpKTtcbiAgICAgICAgbGV0IHBhcnNpbmcgPSB6ZXJvT3JNb3JlUGFyc2luZ0Z1bmN0aW9uKCdtbW1hcmNvJyk7XG4gICAgICAgIGV4cGVjdChpc1N1Y2Nlc3MocGFyc2luZykpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgnW1ttLG0sbV0sYXJjb10nKTtcbiAgICB9KTtcbiAgICBpdCgnY2FuIHBhcnNlIGEgY2hhciBzZXF1ZW5jZSB6ZXJvIHRpbWVzJywgKCkgPT4ge1xuICAgICAgICBjb25zdCB6ZXJvT3JNb3JlUGFyc2luZ0Z1bmN0aW9uID0gemVyb09yTW9yZShwc3RyaW5nKCdtYXJjbycpKTtcbiAgICAgICAgbGV0IHBhcnNpbmcgPSB6ZXJvT3JNb3JlUGFyc2luZ0Z1bmN0aW9uKCd4bWFyY29tYXJjb2NpYW8nKTtcbiAgICAgICAgZXhwZWN0KGlzU3VjY2VzcyhwYXJzaW5nKSkudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcudG9TdHJpbmcoKSkudG8uYmUuZXFsKCdbW10seG1hcmNvbWFyY29jaWFvXScpO1xuICAgIH0pO1xuICAgIGl0KCdjYW4gcGFyc2UgYSBjaGFyIHNlcXVlbmNlIG1hbnkgdGltZXMnLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHplcm9Pck1vcmVQYXJzaW5nRnVuY3Rpb24gPSB6ZXJvT3JNb3JlKHBzdHJpbmcoJ21hcmNvJykpO1xuICAgICAgICBsZXQgcGFyc2luZyA9IHplcm9Pck1vcmVQYXJzaW5nRnVuY3Rpb24oJ21hcmNvbWFyY29jaWFvJyk7XG4gICAgICAgIGV4cGVjdChpc1N1Y2Nlc3MocGFyc2luZykpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgnW1tbbSxhLHIsYyxvXSxbbSxhLHIsYyxvXV0sY2lhb10nKTtcbiAgICB9KTtcbn0pO1xuXG5kZXNjcmliZSgnYSBwYXJzZXIgZm9yIGEgc3BlY2lmaWMgd29yZCcsICgpID0+IHtcbiAgICBpdCgnaXMgZWFzeSB0byBjcmVhdGUgd2l0aCBzZXF1ZW5jZVAnLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IG1hcmNvUGFyc2VyID0gcHN0cmluZygnbWFyY28nKTtcbiAgICAgICAgY29uc3QgbWFyY29QYXJzaW5nID0gbWFyY29QYXJzZXIucnVuKCdtYXJjb2NpYW8nKTtcbiAgICAgICAgZXhwZWN0KGlzU3VjY2VzcyhtYXJjb1BhcnNpbmcpKS50by5iZS50cnVlO1xuICAgICAgICBleHBlY3QobWFyY29QYXJzaW5nLnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgnW1ttLGEscixjLG9dLGNpYW9dJyk7XG4gICAgfSk7XG59KTtcblxuZGVzY3JpYmUoJ3NlcXVlbmNlIGZvciBwYXJzZXJzIGJhc2VkIG9uIGxpZnQyKGNvbnMpIChha2Egc2VxdWVuY2VQKScsICgpID0+IHtcbiAgICBpdCgnc3RvcmVzIG1hdGNoZWQgY2hhcnMgaW5zaWRlIGFuIGFycmF5JywgKCkgPT4ge1xuICAgICAgICBjb25zdCBhYmNQYXJzZXIgPSBzZXF1ZW5jZVAoW3BjaGFyKCdhJyksIHBjaGFyKCdiJyksIHBjaGFyKCdjJyksXSk7XG4gICAgICAgIGV4cGVjdChhYmNQYXJzZXIucnVuKCdhYmMnKS50b1N0cmluZygpKS50by5iZS5lcWwoJ1tbYSxiLGNdLF0nKTtcbiAgICB9KTtcbn0pO1xuXG5kZXNjcmliZSgnc2VxdWVuY2VzIGZvciBwYXJzZXJzIGJhc2VkIG9uIGFuZFRoZW4gJiYgZm1hcCAoYWthIHNlcXVlbmNlUDIpJywgKCkgPT4ge1xuICAgIGl0KCdzdG9yZSBtYXRjaGVkIGNoYXJzIGluc2lkZSBhIHBsYWluIHN0cmluZycsICgpID0+IHtcbiAgICAgICAgY29uc3QgYWJjUGFyc2VyID0gc2VxdWVuY2VQMihbcGNoYXIoJ2EnKSwgcGNoYXIoJ2InKSwgcGNoYXIoJ2MnKSxdKTtcbiAgICAgICAgZXhwZWN0KGFiY1BhcnNlci5ydW4oJ2FiYycpLnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgnW2FiYyxdJyk7XG4gICAgfSk7XG59KTtcblxuZGVzY3JpYmUoJ2xpZnQyIGZvciBwYXJzZXJzJywgKCkgPT4ge1xuICAgIGl0KCdvcGVyYXRlcyBvbiB0aGUgcmVzdWx0cyBvZiB0d28gc3RyaW5nIHBhcnNpbmdzJywgKCkgPT4ge1xuICAgICAgICBjb25zdCBhZGRTdHJpbmdzID0geCA9PiB5ID0+IHggKyAnKycgKyB5O1xuICAgICAgICBjb25zdCBBcGx1c0IgPSBsaWZ0MihhZGRTdHJpbmdzKShwY2hhcignYScpKShwY2hhcignYicpKTtcbiAgICAgICAgZXhwZWN0KEFwbHVzQi5ydW4oJ2FiYycpLnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgnW2ErYixjXScpO1xuICAgIH0pO1xuICAgIGl0KCdhZGRzIHRoZSByZXN1bHRzIG9mIHR3byBkaWdpdCBwYXJzaW5ncycsICgpID0+IHtcbiAgICAgICAgY29uc3QgYWRkRGlnaXRzID0geCA9PiB5ID0+IHggKyB5O1xuICAgICAgICBjb25zdCBhZGRQYXJzZXIgPSBsaWZ0MihhZGREaWdpdHMpKHBkaWdpdCgxKSkocGRpZ2l0KDIpKTtcbiAgICAgICAgZXhwZWN0KGFkZFBhcnNlci5ydW4oJzEyMzQnKS50b1N0cmluZygpKS50by5iZS5lcWwoJ1szLDM0XScpO1xuICAgICAgICBleHBlY3QoaXNGYWlsdXJlKGFkZFBhcnNlci5ydW4oJzE0NCcpKSkudG8uYmUudHJ1ZTtcbiAgICB9KTtcbn0pO1xuXG5kZXNjcmliZSgncGFyc2UgMyBkaWdpdHMnLCAoKSA9PiB7XG4gICAgbGV0IHBhcnNlRGlnaXQsIHRocmVlRGlnaXRzLCBwYXJzaW5nO1xuICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgICBwYXJzZURpZ2l0ID0gYW55T2YoZGlnaXRzKTtcbiAgICAgICAgdGhyZWVEaWdpdHMgPSBhbmRUaGVuKHBhcnNlRGlnaXQsIGFuZFRoZW4ocGFyc2VEaWdpdCwgcGFyc2VEaWdpdCkpO1xuICAgICAgICBwYXJzaW5nID0gdGhyZWVEaWdpdHMucnVuKCcxMjMnKTtcbiAgICB9KTtcbiAgICBpdCgncGFyc2VzIGFueSBvZiB0aHJlZSBkaWdpdHMnLCAoKSA9PiB7XG4gICAgICAgIGV4cGVjdChpc1N1Y2Nlc3MocGFyc2luZykpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nWzBdLnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgnWzEsWzIsM11dJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nWzFdKS50by5iZS5lcWwoJycpO1xuICAgIH0pO1xuICAgIGRlc2NyaWJlKCdwYXJzZXMgYW55IG9mIHRocmVlIGRpZ2l0cyB3aGlsZSBzaG93Y2FzaW5nIGZtYXAnLCAoKSA9PiB7XG4gICAgICAgIGl0KCdhcyBnbG9iYWwgbWV0aG9kJywgKCkgPT4ge1xuICAgICAgICAgICAgdGhyZWVEaWdpdHMgPSBmbWFwKChbeCwgW3ksIHpdXSkgPT4gW3gsIHksIHpdLCB0aHJlZURpZ2l0cyk7XG4gICAgICAgICAgICBsZXQgcGFyc2luZyA9IHRocmVlRGlnaXRzLnJ1bignMTIzJyk7XG4gICAgICAgICAgICBleHBlY3QoaXNTdWNjZXNzKHBhcnNpbmcpKS50by5iZS50cnVlO1xuICAgICAgICAgICAgZXhwZWN0KHBhcnNpbmdbMF0udG9TdHJpbmcoKSkudG8uYmUuZXFsKCdbMSwyLDNdJyk7XG4gICAgICAgICAgICBleHBlY3QocGFyc2luZ1sxXSkudG8uYmUuZXFsKCcnKTtcbiAgICAgICAgfSk7XG4gICAgICAgIGl0KCdhcyBpbnN0YW5jZSBtZXRob2QnLCAoKSA9PiB7XG4gICAgICAgICAgICB0aHJlZURpZ2l0cyA9IHRocmVlRGlnaXRzLmZtYXAoKFt4LCBbeSwgel1dKSA9PiBbeCwgeSwgel0pO1xuICAgICAgICAgICAgbGV0IHBhcnNpbmcgPSB0aHJlZURpZ2l0cy5ydW4oJzEyMycpO1xuICAgICAgICAgICAgZXhwZWN0KGlzU3VjY2VzcyhwYXJzaW5nKSkudG8uYmUudHJ1ZTtcbiAgICAgICAgICAgIGV4cGVjdChwYXJzaW5nWzBdLnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgnWzEsMiwzXScpO1xuICAgICAgICAgICAgZXhwZWN0KHBhcnNpbmdbMV0pLnRvLmJlLmVxbCgnJyk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xufSk7XG5cbmRlc2NyaWJlKCdwYXJzZSBBQkMnLCAoKSA9PiB7XG4gICAgbGV0IGFiY1AsIHBhcnNpbmc7XG4gICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICAgIGFiY1AgPSBhbmRUaGVuKHBjaGFyKCdhJyksXG4gICAgICAgICAgICBhbmRUaGVuKHBjaGFyKCdiJyksXG4gICAgICAgICAgICAgICAgYW5kVGhlbihwY2hhcignYycpLCByZXR1cm5QKCcnKSkuZm1hcCgoW3gsIHldKSA9PiB4ICsgeSlcbiAgICAgICAgICAgICkuZm1hcCgoW3gsIHldKSA9PiB4ICsgeSlcbiAgICAgICAgKS5mbWFwKChbeCwgeV0pID0+IHggKyB5KTtcbiAgICAgICAgcGFyc2luZyA9IGFiY1AucnVuKCdhYmNkJyk7XG4gICAgfSk7XG4gICAgaXQoJ3BhcnNlcyBBQkMnLCAoKSA9PiB7XG4gICAgICAgIGV4cGVjdChpc1N1Y2Nlc3MocGFyc2luZykpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nWzBdLnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgnYWJjJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nWzFdKS50by5iZS5lcWwoJ2QnKTtcbiAgICB9KTtcbn0pO1xuXG5kZXNjcmliZSgnYSBwYXJzZXJzIGZvciBhbnkgb2YgYSBsaXN0IG9mIGNoYXJzJywgKCkgPT4ge1xuXG4gICAgaXQoJ2NhbiBwYXJzZSBhbnkgbG93ZXJjYXNlIGNoYXInLCAoKSA9PiB7XG4gICAgICAgIGxldCBsb3dlcmNhc2VzUGFyc2VyID0gYW55T2YobG93ZXJjYXNlcyk7XG5cbiAgICAgICAgZXhwZWN0KGlzUGFyc2VyKGxvd2VyY2FzZXNQYXJzZXIpKS50by5iZS50cnVlO1xuICAgICAgICBsZXQgcGFyc2luZ0Nob2ljZSA9IGxvd2VyY2FzZXNQYXJzZXIucnVuKCdhJyk7XG4gICAgICAgIGV4cGVjdChpc1N1Y2Nlc3MocGFyc2luZ0Nob2ljZSkpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlWzBdKS50by5iZS5lcWwoJ2EnKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2VbMV0pLnRvLmJlLmVxbCgnJyk7XG4gICAgICAgIHBhcnNpbmdDaG9pY2UgPSBsb3dlcmNhc2VzUGFyc2VyLnJ1bignYicpO1xuICAgICAgICBleHBlY3QoaXNTdWNjZXNzKHBhcnNpbmdDaG9pY2UpKS50by5iZS50cnVlO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZVswXSkudG8uYmUuZXFsKCdiJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlWzFdKS50by5iZS5lcWwoJycpO1xuICAgICAgICBwYXJzaW5nQ2hvaWNlID0gbG93ZXJjYXNlc1BhcnNlci5ydW4oJ2QnKTtcbiAgICAgICAgZXhwZWN0KGlzU3VjY2VzcyhwYXJzaW5nQ2hvaWNlKSkudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2VbMF0pLnRvLmJlLmVxbCgnZCcpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZVsxXSkudG8uYmUuZXFsKCcnKTtcbiAgICAgICAgcGFyc2luZ0Nob2ljZSA9IGxvd2VyY2FzZXNQYXJzZXIucnVuKCd6Jyk7XG4gICAgICAgIGV4cGVjdChpc1N1Y2Nlc3MocGFyc2luZ0Nob2ljZSkpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlWzBdKS50by5iZS5lcWwoJ3onKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2VbMV0pLnRvLmJlLmVxbCgnJyk7XG5cbiAgICAgICAgcGFyc2luZ0Nob2ljZSA9IGxvd2VyY2FzZXNQYXJzZXIucnVuKCdZJyk7XG4gICAgICAgIGV4cGVjdChpc0ZhaWx1cmUocGFyc2luZ0Nob2ljZSkpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlWzBdKS50by5iZS5lcWwoJ3BhcnNpbmcgZmFpbGVkJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlWzFdKS50by5iZS5lcWwoJ1knKTtcbiAgICB9KTtcblxuICAgIGl0KCdjYW4gcGFyc2UgYW55IHVwcGVyY2FzZSBjaGFyJywgKCkgPT4ge1xuICAgICAgICBsZXQgdXBwZXJjYXNlc1BhcnNlciA9IGFueU9mKHVwcGVyY2FzZXMpO1xuXG4gICAgICAgIGV4cGVjdChpc1BhcnNlcih1cHBlcmNhc2VzUGFyc2VyKSkudG8uYmUudHJ1ZTtcbiAgICAgICAgbGV0IHBhcnNpbmdDaG9pY2UgPSB1cHBlcmNhc2VzUGFyc2VyLnJ1bignQScpO1xuICAgICAgICBleHBlY3QoaXNTdWNjZXNzKHBhcnNpbmdDaG9pY2UpKS50by5iZS50cnVlO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZVswXSkudG8uYmUuZXFsKCdBJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlWzFdKS50by5iZS5lcWwoJycpO1xuICAgICAgICBwYXJzaW5nQ2hvaWNlID0gdXBwZXJjYXNlc1BhcnNlci5ydW4oJ0InKTtcbiAgICAgICAgZXhwZWN0KGlzU3VjY2VzcyhwYXJzaW5nQ2hvaWNlKSkudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2VbMF0pLnRvLmJlLmVxbCgnQicpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZVsxXSkudG8uYmUuZXFsKCcnKTtcbiAgICAgICAgcGFyc2luZ0Nob2ljZSA9IHVwcGVyY2FzZXNQYXJzZXIucnVuKCdSJyk7XG4gICAgICAgIGV4cGVjdChpc1N1Y2Nlc3MocGFyc2luZ0Nob2ljZSkpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlWzBdKS50by5iZS5lcWwoJ1InKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2VbMV0pLnRvLmJlLmVxbCgnJyk7XG4gICAgICAgIHBhcnNpbmdDaG9pY2UgPSB1cHBlcmNhc2VzUGFyc2VyLnJ1bignWicpO1xuICAgICAgICBleHBlY3QoaXNTdWNjZXNzKHBhcnNpbmdDaG9pY2UpKS50by5iZS50cnVlO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZVswXSkudG8uYmUuZXFsKCdaJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlWzFdKS50by5iZS5lcWwoJycpO1xuXG4gICAgICAgIHBhcnNpbmdDaG9pY2UgPSB1cHBlcmNhc2VzUGFyc2VyLnJ1bigncycpO1xuICAgICAgICBleHBlY3QoaXNGYWlsdXJlKHBhcnNpbmdDaG9pY2UpKS50by5iZS50cnVlO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZVswXSkudG8uYmUuZXFsKCdwYXJzaW5nIGZhaWxlZCcpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZVsxXSkudG8uYmUuZXFsKCdzJyk7XG4gICAgfSk7XG5cbiAgICBpdCgnY2FuIHBhcnNlIGFueSBkaWdpdCcsICgpID0+IHtcbiAgICAgICAgbGV0IGRpZ2l0c1BhcnNlciA9IGFueU9mKGRpZ2l0cyk7XG5cbiAgICAgICAgZXhwZWN0KGlzUGFyc2VyKGRpZ2l0c1BhcnNlcikpLnRvLmJlLnRydWU7XG4gICAgICAgIGxldCBwYXJzaW5nQ2hvaWNlID0gZGlnaXRzUGFyc2VyLnJ1bignMScpO1xuICAgICAgICBleHBlY3QoaXNTdWNjZXNzKHBhcnNpbmdDaG9pY2UpKS50by5iZS50cnVlO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZVswXSkudG8uYmUuZXFsKCcxJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlWzFdKS50by5iZS5lcWwoJycpO1xuICAgICAgICBwYXJzaW5nQ2hvaWNlID0gZGlnaXRzUGFyc2VyLnJ1bignMycpO1xuICAgICAgICBleHBlY3QoaXNTdWNjZXNzKHBhcnNpbmdDaG9pY2UpKS50by5iZS50cnVlO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZVswXSkudG8uYmUuZXFsKCczJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlWzFdKS50by5iZS5lcWwoJycpO1xuICAgICAgICBwYXJzaW5nQ2hvaWNlID0gZGlnaXRzUGFyc2VyLnJ1bignMCcpO1xuICAgICAgICBleHBlY3QoaXNTdWNjZXNzKHBhcnNpbmdDaG9pY2UpKS50by5iZS50cnVlO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZVswXSkudG8uYmUuZXFsKCcwJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlWzFdKS50by5iZS5lcWwoJycpO1xuICAgICAgICBwYXJzaW5nQ2hvaWNlID0gZGlnaXRzUGFyc2VyLnJ1bignOCcpO1xuICAgICAgICBleHBlY3QoaXNTdWNjZXNzKHBhcnNpbmdDaG9pY2UpKS50by5iZS50cnVlO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZVswXSkudG8uYmUuZXFsKCc4Jyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlWzFdKS50by5iZS5lcWwoJycpO1xuXG4gICAgICAgIHBhcnNpbmdDaG9pY2UgPSBkaWdpdHNQYXJzZXIucnVuKCdzJyk7XG4gICAgICAgIGV4cGVjdChpc0ZhaWx1cmUocGFyc2luZ0Nob2ljZSkpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlWzBdKS50by5iZS5lcWwoJ3BhcnNpbmcgZmFpbGVkJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlWzFdKS50by5iZS5lcWwoJ3MnKTtcbiAgICB9KTtcbn0pO1xuXG5kZXNjcmliZSgnYSBjaG9pY2Ugb2YgcGFyc2VycyBib3VuZCBieSBvckVsc2UnLCAoKSA9PiB7XG4gICAgbGV0IHBhcnNlcnNDaG9pY2U7XG5cbiAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgICAgcGFyc2Vyc0Nob2ljZSA9IGNob2ljZShbcGNoYXIoJ2EnKSwgcGNoYXIoJ2InKSwgcGNoYXIoJ2MnKSwgcGNoYXIoJ2QnKSxdKTtcbiAgICB9KTtcblxuICAgIGl0KCdjYW4gcGFyc2Ugb25lIG9mIGZvdXIgY2hhcnMnLCAoKSA9PiB7XG4gICAgICAgIGV4cGVjdChpc1BhcnNlcihwYXJzZXJzQ2hvaWNlKSkudG8uYmUudHJ1ZTtcbiAgICAgICAgbGV0IHBhcnNpbmdDaG9pY2UgPSBwYXJzZXJzQ2hvaWNlLnJ1bignYScpO1xuICAgICAgICBleHBlY3QoaXNTdWNjZXNzKHBhcnNpbmdDaG9pY2UpKS50by5iZS50cnVlO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZVswXSkudG8uYmUuZXFsKCdhJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlWzFdKS50by5iZS5lcWwoJycpO1xuICAgICAgICBwYXJzaW5nQ2hvaWNlID0gcGFyc2Vyc0Nob2ljZS5ydW4oJ2InKTtcbiAgICAgICAgZXhwZWN0KGlzU3VjY2VzcyhwYXJzaW5nQ2hvaWNlKSkudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2VbMF0pLnRvLmJlLmVxbCgnYicpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZVsxXSkudG8uYmUuZXFsKCcnKTtcbiAgICAgICAgcGFyc2luZ0Nob2ljZSA9IHBhcnNlcnNDaG9pY2UucnVuKCdkJyk7XG4gICAgICAgIGV4cGVjdChpc1N1Y2Nlc3MocGFyc2luZ0Nob2ljZSkpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlWzBdKS50by5iZS5lcWwoJ2QnKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2VbMV0pLnRvLmJlLmVxbCgnJyk7XG4gICAgfSk7XG5cbiAgICBpdCgnY2FuIGFsc28gcGFyc2UgTk9ORSBvZiBmb3VyIGNoYXJzJywgKCkgPT4ge1xuICAgICAgICBjb25zdCBwYXJzaW5nQ2hvaWNlID0gcGFyc2Vyc0Nob2ljZS5ydW4oJ3gnKTtcbiAgICAgICAgZXhwZWN0KGlzRmFpbHVyZShwYXJzaW5nQ2hvaWNlKSkudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2VbMF0pLnRvLmJlLmVxbCgncGFyc2luZyBmYWlsZWQnKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2VbMV0pLnRvLmJlLmVxbCgneCcpO1xuICAgIH0pO1xufSk7XG5cbmRlc2NyaWJlKCd0d28gcGFyc2VycyBib3VuZCBieSBvckVsc2UnLCAoKSA9PiB7XG4gICAgbGV0IHBhcnNlckEsIHBhcnNlckIsIHBhcnNlckFvckI7XG5cbiAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgICAgcGFyc2VyQW9yQiA9IG9yRWxzZShwY2hhcignYScpLCBwY2hhcignYicpKTtcbiAgICB9KTtcblxuICAgIGl0KCdjYW4gcGFyc2Ugb25lIG9mIHR3byBjaGFycycsICgpID0+IHtcbiAgICAgICAgZXhwZWN0KGlzUGFyc2VyKHBhcnNlckFvckIpKS50by5iZS50cnVlO1xuICAgICAgICBsZXQgcGFyc2luZ0FvckIgPSBwYXJzZXJBb3JCLnJ1bignYWJjJyk7XG4gICAgICAgIGV4cGVjdChpc1N1Y2Nlc3MocGFyc2luZ0FvckIpKS50by5iZS50cnVlO1xuICAgICAgICBleHBlY3QocGFyc2luZ0FvckJbMF0pLnRvLmJlLmVxbCgnYScpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0FvckJbMV0pLnRvLmJlLmVxbCgnYmMnKTtcbiAgICAgICAgcGFyc2luZ0FvckIgPSBwYXJzZXJBb3JCLnJ1bignYmJjJyk7XG4gICAgICAgIGV4cGVjdChpc1N1Y2Nlc3MocGFyc2luZ0FvckIpKS50by5iZS50cnVlO1xuICAgICAgICBleHBlY3QocGFyc2luZ0FvckJbMF0pLnRvLmJlLmVxbCgnYicpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0FvckJbMV0pLnRvLmJlLmVxbCgnYmMnKTtcbiAgICB9KTtcblxuICAgIGl0KCdjYW4gYWxzbyBwYXJzZSBOT05FIG9mIHR3byBjaGFycycsICgpID0+IHtcbiAgICAgICAgY29uc3QgcGFyc2luZ0FvckIgPSBwYXJzZXJBb3JCLnJ1bignY2RlJyk7XG4gICAgICAgIGV4cGVjdChpc0ZhaWx1cmUocGFyc2luZ0FvckIpKS50by5iZS50cnVlO1xuICAgICAgICBleHBlY3QocGFyc2luZ0FvckJbMF0pLnRvLmJlLmVxbCgnd2FudGVkIGI7IGdvdCBjJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQW9yQlsxXSkudG8uYmUuZXFsKCdjZGUnKTtcbiAgICB9KTtcbn0pO1xuXG5kZXNjcmliZSgndHdvIHBhcnNlcnMgYm91bmQgYnkgYW5kVGhlbicsICgpID0+IHtcbiAgICBsZXQgcGFyc2VyQWFuZEI7XG5cbiAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgICAgcGFyc2VyQWFuZEIgPSBhbmRUaGVuKHBjaGFyKCdhJyksIHBjaGFyKCdiJykpO1xuICAgIH0pO1xuXG4gICAgaXQoJ2NhbiBwYXJzZSB0d28gY2hhcnMnLCAoKSA9PiB7XG4gICAgICAgIGV4cGVjdChpc1BhcnNlcihwYXJzZXJBYW5kQikpLnRvLmJlLnRydWU7XG4gICAgICAgIGNvbnN0IHBhcnNpbmdBYW5kQiA9IHBhcnNlckFhbmRCLnJ1bignYWJjJyk7XG4gICAgICAgIGV4cGVjdChpc1N1Y2Nlc3MocGFyc2luZ0FhbmRCKSkudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdBYW5kQlswXS50b1N0cmluZygpKS50by5iZS5lcWwoJ1thLGJdJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQWFuZEJbMV0pLnRvLmJlLmVxbCgnYycpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0FhbmRCLnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgnW1thLGJdLGNdJyk7XG4gICAgfSk7XG5cbiAgICBpdCgnY2FuIGFsc28gTk9UIHBhcnNlIHR3byBjaGFycycsICgpID0+IHtcbiAgICAgICAgY29uc3QgcGFyc2luZ0FhbmRCID0gcGFyc2VyQWFuZEIucnVuKCdhY2QnKTtcbiAgICAgICAgZXhwZWN0KGlzRmFpbHVyZShwYXJzaW5nQWFuZEIpKS50by5iZS50cnVlO1xuICAgICAgICBleHBlY3QocGFyc2luZ0FhbmRCWzBdKS50by5iZS5lcWwoJ3dhbnRlZCBiOyBnb3QgYycpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0FhbmRCWzFdKS50by5iZS5lcWwoJ2NkJyk7XG4gICAgfSk7XG59KTtcblxuZGVzY3JpYmUoJ2Egc2ltcGxlIHBhcnNlcicsICgpID0+IHtcbiAgICBjb25zdCBwYXJzZXJBID0gY2hhclBhcnNlcignYScpO1xuICAgIGNvbnN0IHBhcnNlcjEgPSBkaWdpdFBhcnNlcigxKTtcblxuICAgIGl0KCdjYW4gcGFyc2UgYSBzaW5nbGUgY2hhcicsICgpID0+IHtcbiAgICAgICAgY29uc3QgcGFyc2luZ0EgPSBwYXJzZXJBKCdhYmMnKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdBWzBdKS50by5iZS5lcWwoJ2EnKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdBWzFdKS50by5iZS5lcWwoJ2JjJyk7XG4gICAgICAgIGV4cGVjdChpc1N1Y2Nlc3MocGFyc2luZ0EpKS50by5iZS50cnVlO1xuICAgIH0pO1xuXG4gICAgaXQoJ2NhbiBhbHNvIE5PVCBwYXJzZSBhIHNpbmdsZSBjaGFyJywgKCkgPT4ge1xuICAgICAgICBjb25zdCBwYXJzaW5nQiA9IHBhcnNlckEoJ2JjZCcpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0JbMF0pLnRvLmJlLmVxbCgnd2FudGVkIGE7IGdvdCBiJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQlsxXSkudG8uYmUuZXFsKCdiY2QnKTtcbiAgICAgICAgZXhwZWN0KGlzRmFpbHVyZShwYXJzaW5nQikpLnRvLmJlLnRydWU7XG4gICAgfSk7XG5cbiAgICBpdCgnY2FuIHBhcnNlIGEgc2luZ2xlIGRpZ2l0JywgKCkgPT4ge1xuICAgICAgICBjb25zdCBwYXJzaW5nMSA9IHBhcnNlcjEoJzEyMycpO1xuICAgICAgICBleHBlY3QocGFyc2luZzFbMF0pLnRvLmJlLmVxbCgxKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcxWzFdKS50by5iZS5lcWwoJzIzJyk7XG4gICAgICAgIGV4cGVjdChpc1N1Y2Nlc3MocGFyc2luZzEpKS50by5iZS50cnVlO1xuICAgIH0pO1xuXG4gICAgaXQoJ2NhbiBhbHNvIE5PVCBwYXJzZSBhIHNpbmdsZSBkaWdpdCcsICgpID0+IHtcbiAgICAgICAgY29uc3QgcGFyc2luZzIgPSBwYXJzZXIxKCcyMzQnKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcyWzBdKS50by5iZS5lcWwoJ3dhbnRlZCAxOyBnb3QgMicpO1xuICAgICAgICBleHBlY3QocGFyc2luZzJbMV0pLnRvLmJlLmVxbCgnMjM0Jyk7XG4gICAgICAgIGV4cGVjdChpc0ZhaWx1cmUocGFyc2luZzIpKS50by5iZS50cnVlO1xuICAgIH0pO1xufSk7XG5cbmRlc2NyaWJlKCdhIHNsaWdodGx5IG1vcmUgY29tcGxleCBwYXJzZXInLCAoKSA9PiB7XG4gICAgY29uc3QgcGFyc2VyQSA9IGNoYXJQYXJzZXIoJ2EnKTtcblxuICAgIGl0KCdjYW4gcGFyc2UgYSBzaW5nbGUgY2hhcicsICgpID0+IHtcbiAgICAgICAgY29uc3QgcGFyc2luZ0EgPSBwYXJzZXJBKCdhYmMnKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdBWzBdKS50by5iZS5lcWwoJ2EnKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdBWzFdKS50by5iZS5lcWwoJ2JjJyk7XG4gICAgICAgIGV4cGVjdChpc1N1Y2Nlc3MocGFyc2luZ0EpKS50by5iZS50cnVlO1xuICAgIH0pO1xuXG4gICAgaXQoJ2NhbiBhbHNvIE5PVCBwYXJzZSBhIHNpbmdsZSBjaGFyJywgKCkgPT4ge1xuICAgICAgICBjb25zdCBwYXJzaW5nQiA9IHBhcnNlckEoJ2JjZCcpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0JbMF0pLnRvLmJlLmVxbCgnd2FudGVkIGE7IGdvdCBiJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQlsxXSkudG8uYmUuZXFsKCdiY2QnKTtcbiAgICAgICAgZXhwZWN0KGlzRmFpbHVyZShwYXJzaW5nQikpLnRvLmJlLnRydWU7XG4gICAgfSk7XG59KTtcblxuZGVzY3JpYmUoJ2EgbmFtZWQgY2hhcmFjdGVyIHBhcnNlcicsICgpID0+IHtcbiAgICBsZXQgcGFyc2VyQTtcblxuICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgICBwYXJzZXJBID0gcGNoYXIoJ2EnKTtcbiAgICB9KTtcblxuICAgIGl0KCdjYW4gcGFyc2UgYSBzaW5nbGUgY2hhcicsICgpID0+IHtcbiAgICAgICAgZXhwZWN0KGlzUGFyc2VyKHBhcnNlckEpKS50by5iZS50cnVlO1xuICAgICAgICBjb25zdCBwYXJzaW5nQSA9IHBhcnNlckEucnVuKCdhYmMnKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdBWzBdKS50by5iZS5lcWwoJ2EnKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdBWzFdKS50by5iZS5lcWwoJ2JjJyk7XG4gICAgICAgIGV4cGVjdChpc1N1Y2Nlc3MocGFyc2luZ0EpKS50by5iZS50cnVlO1xuICAgIH0pO1xuXG4gICAgaXQoJ2NhbiBhbHNvIE5PVCBwYXJzZSBhIHNpbmdsZSBjaGFyJywgKCkgPT4ge1xuICAgICAgICBjb25zdCBwYXJzaW5nQiA9IHBhcnNlckEucnVuKCdiY2QnKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdCWzBdKS50by5iZS5lcWwoJ3dhbnRlZCBhOyBnb3QgYicpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0JbMV0pLnRvLmJlLmVxbCgnYmNkJyk7XG4gICAgICAgIGV4cGVjdChpc0ZhaWx1cmUocGFyc2luZ0IpKS50by5iZS50cnVlO1xuICAgIH0pO1xufSk7XG4iXX0=