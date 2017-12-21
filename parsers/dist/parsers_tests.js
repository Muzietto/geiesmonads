define(['chai', 'parsers', 'util', 'maybe', 'validation'], function (_chai, _parsers, _util, _maybe, _validation) {
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

    xdescribe('parsing while discarding input', function () {
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

    xdescribe('a couple of parsers', function () {
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

    xdescribe('a parser for optional characters', function () {
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

                return _maybe.Maybe.isJust(maybeSign) ? -number : number;
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

    xdescribe('a parser for one or more occurrences', function () {
        it('cannot parse a char zero times', function () {
            var oneOrMoreParser = (0, _parsers.many1)((0, _parsers.pchar)('m'));
            var parsing = oneOrMoreParser.run('arco');
            (0, _chai.expect)(parsing.isFailure).to.be.true;
            (0, _chai.expect)(parsing.toString()).to.be.eql('[many1 pchar_m,wanted m; got a]');
        });
        it('can parse a char many times', function () {
            var oneOrMoreParser = (0, _parsers.many1)((0, _parsers.pchar)('m'));
            var parsing = oneOrMoreParser.run('mmmarco');
            (0, _chai.expect)(parsing.isSuccess).to.be.true;
            (0, _chai.expect)(parsing.toString()).to.be.eql('[[m,m,m],arco]');
        });
        it('cannot parse a char sequence zero times', function () {
            var oneOrMoreParser = (0, _parsers.many1)((0, _parsers.pstring)('marco'));
            var parsing = oneOrMoreParser.run('xmarcomarcociao');
            (0, _chai.expect)(parsing.isFailure).to.be.true;
            (0, _chai.expect)(parsing.toString()).to.be.eql('[many1 pstring marco,wanted m; got x]');
        });
        it('can parse a char sequence many times', function () {
            var oneOrMoreParser = (0, _parsers.many1)((0, _parsers.pstring)('marco'));
            var parsing = oneOrMoreParser.run('marcomarcociao');
            (0, _chai.expect)(parsing.isSuccess).to.be.true;
            (0, _chai.expect)(parsing.toString()).to.be.eql('[[[m,a,r,c,o],[m,a,r,c,o]],ciao]');
        });
        it('can parse an integer, no matter how large...', function () {
            var pint = (0, _parsers.many1)((0, _parsers.anyOf)(digits));
            var parsing = pint.run('12345A');
            (0, _chai.expect)(parsing.isSuccess).to.be.true;
            (0, _chai.expect)(parsing.toString()).to.be.eql('[[1,2,3,4,5],A]');
            parsing = pint.run('1B');
            (0, _chai.expect)(parsing.isSuccess).to.be.true;
            (0, _chai.expect)(parsing.toString()).to.be.eql('[[1],B]');
            parsing = pint.run('A12345');
            (0, _chai.expect)(parsing.isFailure).to.be.true;
            (0, _chai.expect)(parsing.toString()).to.be.eql('[many1 anyOf 0123456789,_fail]');
        });
        it('can parse an integer into a true integer', function () {
            var pint = (0, _parsers.many1)((0, _parsers.anyOf)(digits)).fmap(function (l) {
                return parseInt(l.reduce(function (acc, curr) {
                    return acc + curr;
                }, ''), 10);
            });
            var parsing = pint.run('12345A');
            (0, _chai.expect)(parsing.isSuccess).to.be.true;
            (0, _chai.expect)(parsing[0]).to.be.eql(12345);
            (0, _chai.expect)(parsing[1]).to.be.eql('A');
        });
    });

    xdescribe('a parser for zero or more occurrences', function () {
        it('can parse a char zero times', function () {
            var zeroOrMoreParser = (0, _parsers.many)((0, _parsers.pchar)('m'));
            var parsing = zeroOrMoreParser.run('arco');
            (0, _chai.expect)(parsing.isSuccess).to.be.true;
            (0, _chai.expect)(parsing.toString()).to.be.eql('[[],arco]');
        });
        it('can parse a char many times', function () {
            var zeroOrMoreParser = (0, _parsers.many)((0, _parsers.pchar)('m'));
            var parsing = zeroOrMoreParser.run('mmmarco');
            (0, _chai.expect)(parsing.isSuccess).to.be.true;
            (0, _chai.expect)(parsing.toString()).to.be.eql('[[m,m,m],arco]');
        });
        it('can parse a char sequence zero times', function () {
            var zeroOrMoreParser = (0, _parsers.many)((0, _parsers.pstring)('marco'));
            var parsing = zeroOrMoreParser.run('xmarcomarcociao');
            (0, _chai.expect)(parsing.isSuccess).to.be.true;
            (0, _chai.expect)(parsing.toString()).to.be.eql('[[],xmarcomarcociao]');
        });
        it('can parse a char sequence many times', function () {
            var zeroOrMoreParser = (0, _parsers.many)((0, _parsers.pstring)('marco'));
            var parsing = zeroOrMoreParser.run('marcomarcociao');
            (0, _chai.expect)(parsing.isSuccess).to.be.true;
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

    xdescribe('a parsing function for zero or more occurrences', function () {
        it('can parse a char zero times', function () {
            var zeroOrMoreParsingFunction = (0, _parsers.zeroOrMore)((0, _parsers.pchar)('m'));
            var parsing = zeroOrMoreParsingFunction('arco');
            (0, _chai.expect)(parsing.isSuccess).to.be.true;
            (0, _chai.expect)(parsing.toString()).to.be.eql('[[],arco]');
        });
        it('can parse a char many times', function () {
            var zeroOrMoreParsingFunction = (0, _parsers.zeroOrMore)((0, _parsers.pchar)('m'));
            var parsing = zeroOrMoreParsingFunction('mmmarco');
            (0, _chai.expect)(parsing.isSuccess).to.be.true;
            (0, _chai.expect)(parsing.toString()).to.be.eql('[[m,m,m],arco]');
        });
        it('can parse a char sequence zero times', function () {
            var zeroOrMoreParsingFunction = (0, _parsers.zeroOrMore)((0, _parsers.pstring)('marco'));
            var parsing = zeroOrMoreParsingFunction('xmarcomarcociao');
            (0, _chai.expect)(parsing.isSuccess).to.be.true;
            (0, _chai.expect)(parsing.toString()).to.be.eql('[[],xmarcomarcociao]');
        });
        it('can parse a char sequence many times', function () {
            var zeroOrMoreParsingFunction = (0, _parsers.zeroOrMore)((0, _parsers.pstring)('marco'));
            var parsing = zeroOrMoreParsingFunction('marcomarcociao');
            (0, _chai.expect)(parsing.isSuccess).to.be.true;
            (0, _chai.expect)(parsing.toString()).to.be.eql('[[[m,a,r,c,o],[m,a,r,c,o]],ciao]');
        });
    });

    xdescribe('a parser for a specific word', function () {
        it('is easy to create with sequenceP', function () {
            var marcoParser = (0, _parsers.pstring)('marco');
            var marcoParsing = marcoParser.run('marcociao');
            (0, _chai.expect)((0, _util.isSuccess)(marcoParsing)).to.be.true;
            (0, _chai.expect)(marcoParsing.toString()).to.be.eql('[[m,a,r,c,o],ciao]');
        });
    });

    xdescribe('sequences of parsers based on lift2(cons) (aka sequenceP)', function () {
        it('stores matched chars inside an array', function () {
            var abcParser = (0, _parsers.sequenceP)([(0, _parsers.pchar)('a'), (0, _parsers.pchar)('b'), (0, _parsers.pchar)('c')]);
            (0, _chai.expect)(abcParser.run('abc').toString()).to.be.eql('[[a,b,c],]');
        });
    });

    xdescribe('sequences of parsers based on andThen && fmap (aka sequenceP2)', function () {
        it('store matched chars inside a plain string', function () {
            var abcParser = (0, _parsers.sequenceP2)([(0, _parsers.pchar)('a'), (0, _parsers.pchar)('b'), (0, _parsers.pchar)('c')]);
            (0, _chai.expect)(abcParser.run('abc').toString()).to.be.eql('[abc,]');
        });
    });

    xdescribe('lift2 for parsers', function () {
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
            (0, _chai.expect)(addParser.run('144').isFailure).to.be.true;
        });
    });

    xdescribe('parse 3 digits', function () {
        var parseDigit = void 0,
            threeDigits = void 0,
            parsing = void 0;
        beforeEach(function () {
            parseDigit = (0, _parsers.anyOf)(digits);
            threeDigits = (0, _parsers.andThen)(parseDigit, (0, _parsers.andThen)(parseDigit, parseDigit));
            parsing = threeDigits.run('123');
        });
        it('parses any of three digits', function () {
            (0, _chai.expect)(parsing.isSuccess).to.be.true;
            (0, _chai.expect)(parsing[0].toString()).to.be.eql('[1,[2,3]]');
            (0, _chai.expect)(parsing[1]).to.be.eql('');
        });
        xdescribe('parses any of three digits while showcasing fmap', function () {
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
                (0, _chai.expect)(parsing.isSuccess).to.be.true;
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
                (0, _chai.expect)(parsing.isSuccess).to.be.true;
                (0, _chai.expect)(parsing[0].toString()).to.be.eql('[1,2,3]');
                (0, _chai.expect)(parsing[1]).to.be.eql('');
            });
        });
    });

    describe('parse ABC', function () {
        //    const pairAdder = pair => pair.value[0] + pair.value[1];
        it('parses ABC', function () {
            var pairAdder = function pairAdder(pair) {
                return pair[0] + pair[1];
            };
            var abcP = (0, _parsers.andThen)((0, _parsers.pchar)('a'), (0, _parsers.andThen)((0, _parsers.pchar)('b'), (0, _parsers.andThen)((0, _parsers.pchar)('c'), (0, _parsers.returnP)('')).fmap(pairAdder)).fmap(pairAdder)).fmap(pairAdder);
            var parsing = abcP.run('abcd');
            (0, _chai.expect)(parsing.isSuccess).to.be.true;
            (0, _chai.expect)(parsing.value[0].toString()).to.be.eql('abc');
            (0, _chai.expect)(parsing.value[1]).to.be.eql('d');
        });
    });

    describe('a parsers for any of a list of chars', function () {

        it('can parse any lowercase char', function () {
            var lowercasesParser = (0, _parsers.anyOf)(lowercases);

            (0, _chai.expect)((0, _util.isParser)(lowercasesParser)).to.be.true;
            var parsingChoice = lowercasesParser.run('a');
            (0, _chai.expect)(parsingChoice.isSuccess).to.be.true;
            (0, _chai.expect)(parsingChoice.value[0]).to.be.eql('a');
            (0, _chai.expect)(parsingChoice.value[1]).to.be.eql('');
            parsingChoice = lowercasesParser.run('b');
            (0, _chai.expect)(parsingChoice.isSuccess).to.be.true;
            (0, _chai.expect)(parsingChoice.value[0]).to.be.eql('b');
            (0, _chai.expect)(parsingChoice.value[1]).to.be.eql('');
            parsingChoice = lowercasesParser.run('d');
            (0, _chai.expect)(parsingChoice.isSuccess).to.be.true;
            (0, _chai.expect)(parsingChoice.value[0]).to.be.eql('d');
            (0, _chai.expect)(parsingChoice.value[1]).to.be.eql('');
            parsingChoice = lowercasesParser.run('z');
            (0, _chai.expect)(parsingChoice.isSuccess).to.be.true;
            (0, _chai.expect)(parsingChoice.value[0]).to.be.eql('z');
            (0, _chai.expect)(parsingChoice.value[1]).to.be.eql('');

            parsingChoice = lowercasesParser.run('Y');
            (0, _chai.expect)(parsingChoice.isFailure).to.be.true;
            (0, _chai.expect)(parsingChoice.value[0]).to.be.eql('anyOf abcdefghijklmnopqrstuvwxyz');
            (0, _chai.expect)(parsingChoice.value[1]).to.be.eql('_fail');
        });

        it('can parse any uppercase char', function () {
            var uppercasesParser = (0, _parsers.anyOf)(uppercases);

            (0, _chai.expect)((0, _util.isParser)(uppercasesParser)).to.be.true;
            var parsingChoice = uppercasesParser.run('A');
            (0, _chai.expect)(parsingChoice.isSuccess).to.be.true;
            (0, _chai.expect)(parsingChoice.value[0]).to.be.eql('A');
            (0, _chai.expect)(parsingChoice.value[1]).to.be.eql('');
            parsingChoice = uppercasesParser.run('B');
            (0, _chai.expect)(parsingChoice.isSuccess).to.be.true;
            (0, _chai.expect)(parsingChoice.value[0]).to.be.eql('B');
            (0, _chai.expect)(parsingChoice.value[1]).to.be.eql('');
            parsingChoice = uppercasesParser.run('R');
            (0, _chai.expect)(parsingChoice.isSuccess).to.be.true;
            (0, _chai.expect)(parsingChoice.value[0]).to.be.eql('R');
            (0, _chai.expect)(parsingChoice.value[1]).to.be.eql('');
            parsingChoice = uppercasesParser.run('Z');
            (0, _chai.expect)(parsingChoice.isSuccess).to.be.true;
            (0, _chai.expect)(parsingChoice.value[0]).to.be.eql('Z');
            (0, _chai.expect)(parsingChoice.value[1]).to.be.eql('');

            parsingChoice = uppercasesParser.run('s');
            (0, _chai.expect)(parsingChoice.isFailure).to.be.true;
            (0, _chai.expect)(parsingChoice.value[0]).to.be.eql('anyOf ABCDEFGHIJKLMNOPQRSTUVWXYZ');
            (0, _chai.expect)(parsingChoice.value[1]).to.be.eql('_fail');
        });

        it('can parse any digit', function () {
            var digitsParser = (0, _parsers.anyOf)(digits);

            (0, _chai.expect)((0, _util.isParser)(digitsParser)).to.be.true;
            var parsingChoice = digitsParser.run('1');
            (0, _chai.expect)(parsingChoice.isSuccess).to.be.true;
            (0, _chai.expect)(parsingChoice.value[0]).to.be.eql('1');
            (0, _chai.expect)(parsingChoice.value[1]).to.be.eql('');
            parsingChoice = digitsParser.run('3');
            (0, _chai.expect)(parsingChoice.isSuccess).to.be.true;
            (0, _chai.expect)(parsingChoice.value[0]).to.be.eql('3');
            (0, _chai.expect)(parsingChoice.value[1]).to.be.eql('');
            parsingChoice = digitsParser.run('0');
            (0, _chai.expect)(parsingChoice.isSuccess).to.be.true;
            (0, _chai.expect)(parsingChoice.value[0]).to.be.eql('0');
            (0, _chai.expect)(parsingChoice.value[1]).to.be.eql('');
            parsingChoice = digitsParser.run('8');
            (0, _chai.expect)(parsingChoice.isSuccess).to.be.true;
            (0, _chai.expect)(parsingChoice.value[0]).to.be.eql('8');
            (0, _chai.expect)(parsingChoice.value[1]).to.be.eql('');

            parsingChoice = digitsParser.run('s');
            (0, _chai.expect)(parsingChoice.isFailure).to.be.true;
            (0, _chai.expect)(parsingChoice.value[0]).to.be.eql('anyOf 0123456789');
            (0, _chai.expect)(parsingChoice.value[1]).to.be.eql('_fail');
        });
    });

    describe('a choice of parsers bound by orElse', function () {
        var parsersChoice = (0, _parsers.choice)([(0, _parsers.pchar)('a'), (0, _parsers.pchar)('b'), (0, _parsers.pchar)('c'), (0, _parsers.pchar)('d')]);

        it('can parse one of four chars', function () {
            (0, _chai.expect)((0, _util.isParser)(parsersChoice)).to.be.true;
            var parsingChoice = parsersChoice.run('a');
            (0, _chai.expect)(parsingChoice.isSuccess).to.be.true;
            (0, _chai.expect)(parsingChoice.value[0]).to.be.eql('a');
            (0, _chai.expect)(parsingChoice.value[1]).to.be.eql('');
            parsingChoice = parsersChoice.run('b');
            (0, _chai.expect)(parsingChoice.isSuccess).to.be.true;
            (0, _chai.expect)(parsingChoice.value[0]).to.be.eql('b');
            (0, _chai.expect)(parsingChoice.value[1]).to.be.eql('');
            parsingChoice = parsersChoice.run('d');
            (0, _chai.expect)(parsingChoice.isSuccess).to.be.true;
            (0, _chai.expect)(parsingChoice.value[0]).to.be.eql('d');
            (0, _chai.expect)(parsingChoice.value[1]).to.be.eql('');
        });

        it('can also parse NONE of four chars', function () {
            var parsingChoice = parsersChoice.run('x');
            (0, _chai.expect)(parsingChoice.isFailure).to.be.true;
            (0, _chai.expect)(parsingChoice.value[0]).to.be.eql('choice /pchar_a/pchar_b/pchar_c/pchar_d');
            (0, _chai.expect)(parsingChoice.value[1]).to.be.eql('_fail');
        });
    });

    describe('two parsers bound by orElse', function () {
        var parserAorB = (0, _parsers.orElse)((0, _parsers.pchar)('a'), (0, _parsers.pchar)('b'));

        it('can parse one of two chars', function () {
            (0, _chai.expect)((0, _util.isParser)(parserAorB)).to.be.true;
            var parsingAorB = parserAorB.run('abc');
            (0, _chai.expect)(parsingAorB.isSuccess).to.be.true;
            (0, _chai.expect)(parsingAorB.value[0]).to.be.eql('a');
            (0, _chai.expect)(parsingAorB.value[1]).to.be.eql('bc');
            parsingAorB = parserAorB.run('bbc');
            (0, _chai.expect)(parsingAorB.isSuccess).to.be.true;
            (0, _chai.expect)(parsingAorB.value[0]).to.be.eql('b');
            (0, _chai.expect)(parsingAorB.value[1]).to.be.eql('bc');
        });

        it('can also parse NONE of two chars', function () {
            var parsingAorB = parserAorB.run('cde');
            (0, _chai.expect)(parsingAorB.isFailure).to.be.true;
            (0, _chai.expect)(parsingAorB.value[0]).to.be.eql('pchar_a orElse pchar_b');
            (0, _chai.expect)(parsingAorB.value[1]).to.be.eql('wanted b; got c');
        });
    });

    describe('two parsers bound by andThen', function () {
        var parserAandB = (0, _parsers.andThen)((0, _parsers.pchar)('a'), (0, _parsers.pchar)('b'));

        it('can parse two chars', function () {
            (0, _chai.expect)((0, _util.isParser)(parserAandB)).to.be.true;
            var parsingAandB = parserAandB.run('abc');
            (0, _chai.expect)(parsingAandB.isSuccess).to.be.true;
            (0, _chai.expect)(parsingAandB.value[0].toString()).to.be.eql('[a,b]');
            (0, _chai.expect)(parsingAandB.value[1]).to.be.eql('c');
            (0, _chai.expect)(parsingAandB.toString()).to.be.eql('Validation.Success([[a,b],c])');
        });

        it('can also NOT parse two chars', function () {
            var parsingAandB = parserAandB.run('acd');
            (0, _chai.expect)(parsingAandB.isFailure).to.be.true;
            (0, _chai.expect)(parsingAandB.value[0]).to.be.eql('pchar_a andThen pchar_b');
            (0, _chai.expect)(parsingAandB.value[1]).to.be.eql('wanted b; got c');
        });
    });

    describe('a simple parser', function () {
        var parserA = (0, _parsers.charParser)('a');
        var parser1 = (0, _parsers.digitParser)(1);

        it('can parse a single char', function () {
            var parsingA = parserA('abc');
            (0, _chai.expect)(parsingA.value[0]).to.be.eql('a');
            (0, _chai.expect)(parsingA.value[1]).to.be.eql('bc');
            (0, _chai.expect)(parsingA.isSuccess).to.be.true;
        });

        it('can also NOT parse a single char', function () {
            var parsingB = parserA('bcd');
            (0, _chai.expect)(parsingB.value[0]).to.be.eql('charParser');
            (0, _chai.expect)(parsingB.value[1]).to.be.eql('wanted a; got b');
            (0, _chai.expect)(parsingB.isFailure).to.be.true;
        });

        it('can parse a single digit', function () {
            var parsing1 = parser1('123');
            (0, _chai.expect)(parsing1.value[0]).to.be.eql(1);
            (0, _chai.expect)(parsing1.value[1]).to.be.eql('23');
            (0, _chai.expect)(parsing1.isSuccess).to.be.true;
        });

        it('can also NOT parse a single digit', function () {
            var parsing2 = parser1('234');
            (0, _chai.expect)(parsing2.value[0]).to.be.eql('digitParser');
            (0, _chai.expect)(parsing2.value[1]).to.be.eql('wanted 1; got 2');
            (0, _chai.expect)(parsing2.isFailure).to.be.true;
        });
    });

    describe('a slightly more complex parser', function () {
        var parserA = (0, _parsers.charParser)('a');

        it('can parse a single char', function () {
            var parsingA = parserA('abc');
            (0, _chai.expect)(parsingA.value[0]).to.be.eql('a');
            (0, _chai.expect)(parsingA.value[1]).to.be.eql('bc');
            (0, _chai.expect)(parsingA.isSuccess).to.be.true;
        });

        it('can also NOT parse a single char', function () {
            var parsingB = parserA('bcd');
            (0, _chai.expect)(parsingB.value[0]).to.be.eql('charParser');
            (0, _chai.expect)(parsingB.value[1]).to.be.eql('wanted a; got b');
            (0, _chai.expect)(parsingB.isFailure).to.be.true;
        });
    });

    describe('a named character parser', function () {
        var parserA = (0, _parsers.pchar)('a');

        it('can parse a single char', function () {
            (0, _chai.expect)((0, _util.isParser)(parserA)).to.be.true;
            var parsingA = parserA.run('abc');
            (0, _chai.expect)(parsingA.value[0]).to.be.eql('a');
            (0, _chai.expect)(parsingA.value[1]).to.be.eql('bc');
            (0, _chai.expect)(parsingA.isSuccess).to.be.true;
        });

        it('can also NOT parse a single char', function () {
            var parsingB = parserA.run('bcd');
            (0, _chai.expect)(parsingB.value[0]).to.be.eql('pchar_a');
            (0, _chai.expect)(parsingB.value[1]).to.be.eql('wanted a; got b');
            (0, _chai.expect)(parsingB.isFailure).to.be.true;
        });
    });
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2pzLXNwZWMvcGFyc2Vyc190ZXN0cy5qcyJdLCJuYW1lcyI6WyJsb3dlcmNhc2VzIiwidXBwZXJjYXNlcyIsImRpZ2l0cyIsIndoaXRlcyIsInhkZXNjcmliZSIsIml0IiwiaW5zaWRlUGFyZW5zIiwiZGlzY2FyZEZpcnN0IiwiZGlzY2FyZFNlY29uZCIsInJ1biIsInRvU3RyaW5nIiwidG8iLCJiZSIsImVxbCIsInN1YnN0cmluZ3NXaXRoQ29tbWFzIiwibGlzdEVsZW1lbnRzIiwiZGlzY2FyZEludGVnZXJTaWduIiwicGFyc2luZyIsImRpc2NhcmRTdWZmaXgiLCJvcHREb3RUaGVuQSIsImFuZFRoZW4iLCJwaW50IiwiZm1hcCIsInBhcnNlSW50IiwibCIsInJlZHVjZSIsImFjYyIsImN1cnIiLCJwU2lnbmVkSW50IiwibWF5YmVTaWduIiwibnVtYmVyIiwiaXNKdXN0Iiwib3B0U3Vic3RyaW5nIiwib25lT3JNb3JlUGFyc2VyIiwiaXNGYWlsdXJlIiwidHJ1ZSIsImlzU3VjY2VzcyIsInplcm9Pck1vcmVQYXJzZXIiLCJ3aGl0ZXNQYXJzZXIiLCJ0d29Xb3JkcyIsInplcm9Pck1vcmVQYXJzaW5nRnVuY3Rpb24iLCJtYXJjb1BhcnNlciIsIm1hcmNvUGFyc2luZyIsImFiY1BhcnNlciIsImFkZFN0cmluZ3MiLCJ4IiwieSIsIkFwbHVzQiIsImFkZERpZ2l0cyIsImFkZFBhcnNlciIsInBhcnNlRGlnaXQiLCJ0aHJlZURpZ2l0cyIsImJlZm9yZUVhY2giLCJ6IiwiZGVzY3JpYmUiLCJwYWlyQWRkZXIiLCJwYWlyIiwiYWJjUCIsInZhbHVlIiwibG93ZXJjYXNlc1BhcnNlciIsInBhcnNpbmdDaG9pY2UiLCJ1cHBlcmNhc2VzUGFyc2VyIiwiZGlnaXRzUGFyc2VyIiwicGFyc2Vyc0Nob2ljZSIsInBhcnNlckFvckIiLCJwYXJzaW5nQW9yQiIsInBhcnNlckFhbmRCIiwicGFyc2luZ0FhbmRCIiwicGFyc2VyQSIsInBhcnNlcjEiLCJwYXJzaW5nQSIsInBhcnNpbmdCIiwicGFyc2luZzEiLCJwYXJzaW5nMiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFzQ0EsUUFBTUEsYUFBYSxDQUFDLEdBQUQsRUFBTSxHQUFOLEVBQVcsR0FBWCxFQUFnQixHQUFoQixFQUFxQixHQUFyQixFQUEwQixHQUExQixFQUErQixHQUEvQixFQUFvQyxHQUFwQyxFQUF5QyxHQUF6QyxFQUE4QyxHQUE5QyxFQUFtRCxHQUFuRCxFQUF3RCxHQUF4RCxFQUE2RCxHQUE3RCxFQUFrRSxHQUFsRSxFQUF1RSxHQUF2RSxFQUE0RSxHQUE1RSxFQUFpRixHQUFqRixFQUFzRixHQUF0RixFQUEyRixHQUEzRixFQUFnRyxHQUFoRyxFQUFxRyxHQUFyRyxFQUEwRyxHQUExRyxFQUErRyxHQUEvRyxFQUFvSCxHQUFwSCxFQUF5SCxHQUF6SCxFQUE4SCxHQUE5SCxDQUFuQjtBQUNBLFFBQU1DLGFBQWEsQ0FBQyxHQUFELEVBQU0sR0FBTixFQUFXLEdBQVgsRUFBZ0IsR0FBaEIsRUFBcUIsR0FBckIsRUFBMEIsR0FBMUIsRUFBK0IsR0FBL0IsRUFBb0MsR0FBcEMsRUFBeUMsR0FBekMsRUFBOEMsR0FBOUMsRUFBbUQsR0FBbkQsRUFBd0QsR0FBeEQsRUFBNkQsR0FBN0QsRUFBa0UsR0FBbEUsRUFBdUUsR0FBdkUsRUFBNEUsR0FBNUUsRUFBaUYsR0FBakYsRUFBc0YsR0FBdEYsRUFBMkYsR0FBM0YsRUFBZ0csR0FBaEcsRUFBcUcsR0FBckcsRUFBMEcsR0FBMUcsRUFBK0csR0FBL0csRUFBb0gsR0FBcEgsRUFBeUgsR0FBekgsRUFBOEgsR0FBOUgsQ0FBbkI7QUFDQSxRQUFNQyxTQUFTLENBQUMsR0FBRCxFQUFNLEdBQU4sRUFBVyxHQUFYLEVBQWdCLEdBQWhCLEVBQXFCLEdBQXJCLEVBQTBCLEdBQTFCLEVBQStCLEdBQS9CLEVBQW9DLEdBQXBDLEVBQXlDLEdBQXpDLEVBQThDLEdBQTlDLENBQWY7QUFDQSxRQUFNQyxTQUFTLENBQUMsR0FBRCxFQUFNLElBQU4sRUFBWSxJQUFaLEVBQWtCLElBQWxCLENBQWY7O0FBRUFDLGNBQVUsZ0NBQVYsRUFBNEMsWUFBTTtBQUM5Q0MsV0FBRywrQkFBSCxFQUFvQyxZQUFNO0FBQ3RDLGdCQUFNQyxlQUFlLG9CQUFNLEdBQU4sRUFDaEJDLFlBRGdCLENBQ0gsbUJBQUssb0JBQU1QLFVBQU4sQ0FBTCxDQURHLEVBRWhCUSxhQUZnQixDQUVGLG9CQUFNLEdBQU4sQ0FGRSxDQUFyQjtBQUdBLDhCQUFPRixhQUFhRyxHQUFiLENBQWlCLFNBQWpCLEVBQTRCQyxRQUE1QixFQUFQLEVBQStDQyxFQUEvQyxDQUFrREMsRUFBbEQsQ0FBcURDLEdBQXJELENBQXlELGdCQUF6RDtBQUNBLDhCQUFPUCxhQUFhRyxHQUFiLENBQWlCLElBQWpCLEVBQXVCQyxRQUF2QixFQUFQLEVBQTBDQyxFQUExQyxDQUE2Q0MsRUFBN0MsQ0FBZ0RDLEdBQWhELENBQW9ELE9BQXBEO0FBQ0gsU0FORDtBQU9BUixXQUFHLG9DQUFILEVBQXlDLFlBQU07QUFDM0MsZ0JBQU1DLGVBQWUsNEJBQWMsc0JBQVEsT0FBUixDQUFkLENBQXJCO0FBQ0EsOEJBQU9BLGFBQWFHLEdBQWIsQ0FBaUIsU0FBakIsRUFBNEJDLFFBQTVCLEVBQVAsRUFBK0NDLEVBQS9DLENBQWtEQyxFQUFsRCxDQUFxREMsR0FBckQsQ0FBeUQsZ0JBQXpEO0FBQ0gsU0FIRDtBQUlBUixXQUFHLGlEQUFILEVBQXNELFlBQU07QUFDeEQsZ0JBQU1TLHVCQUF1QixtQkFBSyxvQkFBTSxvQkFBTWQsVUFBTixDQUFOLEVBQXlCUSxhQUF6QixDQUF1QyxvQkFBTSxHQUFOLENBQXZDLENBQUwsQ0FBN0I7QUFDQSw4QkFBT00scUJBQXFCTCxHQUFyQixDQUF5QixVQUF6QixFQUFxQ0MsUUFBckMsRUFBUCxFQUF3REMsRUFBeEQsQ0FBMkRDLEVBQTNELENBQThEQyxHQUE5RCxDQUFrRSxxQkFBbEU7QUFDSCxTQUhEO0FBSUFSLFdBQUcsNkJBQUgsRUFBa0MsWUFBTTtBQUNwQyxnQkFBTVMsdUJBQXVCLG1CQUFLLG9CQUFNLG9CQUFNZCxVQUFOLENBQU4sRUFBeUJRLGFBQXpCLENBQXVDLG9CQUFNLEdBQU4sQ0FBdkMsQ0FBTCxDQUE3QjtBQUNBLGdCQUFNTyxlQUFlLHNCQUFRLG9CQUFNLEdBQU4sQ0FBUixFQUFvQkQsb0JBQXBCLEVBQTBDLG9CQUFNLEdBQU4sQ0FBMUMsQ0FBckI7QUFDQSw4QkFBT0MsYUFBYU4sR0FBYixDQUFpQixrQkFBakIsRUFBcUNDLFFBQXJDLEVBQVAsRUFBd0RDLEVBQXhELENBQTJEQyxFQUEzRCxDQUE4REMsR0FBOUQsQ0FBa0UsaUNBQWxFO0FBQ0gsU0FKRDtBQUtILEtBckJEOztBQXVCQVQsY0FBVSxxQkFBVixFQUFpQyxZQUFNO0FBQ25DQyxXQUFHLG9EQUFILEVBQXlELFlBQU07QUFDM0QsZ0JBQU1XLHFCQUFxQixvQkFBTSxHQUFOLEVBQVdULFlBQVgsQ0FBd0IscUJBQU8sQ0FBUCxDQUF4QixDQUEzQjtBQUNBLGdCQUFJVSxVQUFVRCxtQkFBbUJQLEdBQW5CLENBQXVCLEtBQXZCLENBQWQ7QUFDQSw4QkFBT1EsUUFBUVAsUUFBUixFQUFQLEVBQTJCQyxFQUEzQixDQUE4QkMsRUFBOUIsQ0FBaUNDLEdBQWpDLENBQXFDLE9BQXJDO0FBQ0gsU0FKRDtBQUtBUixXQUFHLHFEQUFILEVBQTBELFlBQU07QUFDNUQsZ0JBQU1hLGdCQUFnQixzQkFBUSxPQUFSLEVBQWlCVixhQUFqQixDQUErQixvQkFBTSxvQkFBTUwsTUFBTixDQUFOLENBQS9CLENBQXRCO0FBQ0EsZ0JBQUljLFVBQVVDLGNBQWNULEdBQWQsQ0FBa0IsbUJBQWxCLENBQWQ7QUFDQSw4QkFBT1EsUUFBUVAsUUFBUixFQUFQLEVBQTJCQyxFQUEzQixDQUE4QkMsRUFBOUIsQ0FBaUNDLEdBQWpDLENBQXFDLDJCQUFyQztBQUNBSSxzQkFBVUMsY0FBY1QsR0FBZCxDQUFrQixrREFBbEIsQ0FBVjtBQUNBLDhCQUFPUSxRQUFRUCxRQUFSLEVBQVAsRUFBMkJDLEVBQTNCLENBQThCQyxFQUE5QixDQUFpQ0MsR0FBakMsQ0FBcUMsMkJBQXJDO0FBQ0gsU0FORDtBQU9ILEtBYkQ7O0FBZUFULGNBQVUsa0NBQVYsRUFBOEMsWUFBTTtBQUNoREMsV0FBRyxrQ0FBSCxFQUF1QyxZQUFNO0FBQ3pDLGdCQUFNYyxjQUFjLGtCQUFJLG9CQUFNLEdBQU4sQ0FBSixFQUFnQkMsT0FBaEIsQ0FBd0Isb0JBQU0sR0FBTixDQUF4QixDQUFwQjtBQUNBLDhCQUFPRCxZQUFZVixHQUFaLENBQWdCLE1BQWhCLEVBQXdCQyxRQUF4QixFQUFQLEVBQTJDQyxFQUEzQyxDQUE4Q0MsRUFBOUMsQ0FBaURDLEdBQWpELENBQXFELGtCQUFyRDtBQUNBLDhCQUFPTSxZQUFZVixHQUFaLENBQWdCLEtBQWhCLEVBQXVCQyxRQUF2QixFQUFQLEVBQTBDQyxFQUExQyxDQUE2Q0MsRUFBN0MsQ0FBZ0RDLEdBQWhELENBQW9ELGlCQUFwRDtBQUNILFNBSkQ7QUFLQVIsV0FBRyw4QkFBSCxFQUFtQyxZQUFNO0FBQ3JDLGdCQUFNZ0IsT0FBTyxvQkFBTSxvQkFBTW5CLE1BQU4sQ0FBTixFQUNSb0IsSUFEUSxDQUNIO0FBQUEsdUJBQUtDLFNBQVNDLEVBQUVDLE1BQUYsQ0FBUyxVQUFDQyxHQUFELEVBQU1DLElBQU47QUFBQSwyQkFBZUQsTUFBTUMsSUFBckI7QUFBQSxpQkFBVCxFQUFvQyxFQUFwQyxDQUFULEVBQWtELEVBQWxELENBQUw7QUFBQSxhQURHLENBQWI7QUFFQSxnQkFBTUMsYUFBYSxrQkFBSSxvQkFBTSxHQUFOLENBQUosRUFDZFIsT0FEYyxDQUNOQyxJQURNLEVBRWRDLElBRmMsQ0FFVDtBQUFBO0FBQUEsb0JBQUVPLFNBQUY7QUFBQSxvQkFBYUMsTUFBYjs7QUFBQSx1QkFBMEIsYUFBTUMsTUFBTixDQUFhRixTQUFiLENBQUQsR0FBNEIsQ0FBQ0MsTUFBN0IsR0FBc0NBLE1BQS9EO0FBQUEsYUFGUyxDQUFuQjtBQUdBLDhCQUFPRixXQUFXbkIsR0FBWCxDQUFlLFdBQWYsRUFBNEIsQ0FBNUIsQ0FBUCxFQUF1Q0UsRUFBdkMsQ0FBMENDLEVBQTFDLENBQTZDQyxHQUE3QyxDQUFpRCxRQUFqRDtBQUNBLDhCQUFPZSxXQUFXbkIsR0FBWCxDQUFlLFlBQWYsRUFBNkIsQ0FBN0IsQ0FBUCxFQUF3Q0UsRUFBeEMsQ0FBMkNDLEVBQTNDLENBQThDQyxHQUE5QyxDQUFrRCxDQUFDLFFBQW5EO0FBQ0gsU0FSRDtBQVNBUixXQUFHLDhDQUFILEVBQW1ELFlBQU07QUFDckQsZ0JBQU0yQixlQUFlLGtCQUFJLHNCQUFRLE9BQVIsQ0FBSixFQUFzQlosT0FBdEIsQ0FBOEIsc0JBQVEsYUFBUixDQUE5QixDQUFyQjtBQUNBLDhCQUFPWSxhQUFhdkIsR0FBYixDQUFpQixtQkFBakIsRUFBc0NDLFFBQXRDLEVBQVAsRUFDS0MsRUFETCxDQUNRQyxFQURSLENBQ1dDLEdBRFgsQ0FDZSxpREFEZjtBQUVBLDhCQUFPbUIsYUFBYXZCLEdBQWIsQ0FBaUIsY0FBakIsRUFBaUNDLFFBQWpDLEVBQVAsRUFDS0MsRUFETCxDQUNRQyxFQURSLENBQ1dDLEdBRFgsQ0FDZSxzQ0FEZjtBQUVILFNBTkQ7QUFPSCxLQXRCRDs7QUF3QkFULGNBQVUsc0NBQVYsRUFBa0QsWUFBTTtBQUNwREMsV0FBRyxnQ0FBSCxFQUFxQyxZQUFNO0FBQ3ZDLGdCQUFNNEIsa0JBQWtCLG9CQUFNLG9CQUFNLEdBQU4sQ0FBTixDQUF4QjtBQUNBLGdCQUFJaEIsVUFBVWdCLGdCQUFnQnhCLEdBQWhCLENBQW9CLE1BQXBCLENBQWQ7QUFDQSw4QkFBT1EsUUFBUWlCLFNBQWYsRUFBMEJ2QixFQUExQixDQUE2QkMsRUFBN0IsQ0FBZ0N1QixJQUFoQztBQUNBLDhCQUFPbEIsUUFBUVAsUUFBUixFQUFQLEVBQTJCQyxFQUEzQixDQUE4QkMsRUFBOUIsQ0FBaUNDLEdBQWpDLENBQXFDLGlDQUFyQztBQUNILFNBTEQ7QUFNQVIsV0FBRyw2QkFBSCxFQUFrQyxZQUFNO0FBQ3BDLGdCQUFNNEIsa0JBQWtCLG9CQUFNLG9CQUFNLEdBQU4sQ0FBTixDQUF4QjtBQUNBLGdCQUFJaEIsVUFBVWdCLGdCQUFnQnhCLEdBQWhCLENBQW9CLFNBQXBCLENBQWQ7QUFDQSw4QkFBT1EsUUFBUW1CLFNBQWYsRUFBMEJ6QixFQUExQixDQUE2QkMsRUFBN0IsQ0FBZ0N1QixJQUFoQztBQUNBLDhCQUFPbEIsUUFBUVAsUUFBUixFQUFQLEVBQTJCQyxFQUEzQixDQUE4QkMsRUFBOUIsQ0FBaUNDLEdBQWpDLENBQXFDLGdCQUFyQztBQUNILFNBTEQ7QUFNQVIsV0FBRyx5Q0FBSCxFQUE4QyxZQUFNO0FBQ2hELGdCQUFNNEIsa0JBQWtCLG9CQUFNLHNCQUFRLE9BQVIsQ0FBTixDQUF4QjtBQUNBLGdCQUFJaEIsVUFBVWdCLGdCQUFnQnhCLEdBQWhCLENBQW9CLGlCQUFwQixDQUFkO0FBQ0EsOEJBQU9RLFFBQVFpQixTQUFmLEVBQTBCdkIsRUFBMUIsQ0FBNkJDLEVBQTdCLENBQWdDdUIsSUFBaEM7QUFDQSw4QkFBT2xCLFFBQVFQLFFBQVIsRUFBUCxFQUEyQkMsRUFBM0IsQ0FBOEJDLEVBQTlCLENBQWlDQyxHQUFqQyxDQUFxQyx1Q0FBckM7QUFDSCxTQUxEO0FBTUFSLFdBQUcsc0NBQUgsRUFBMkMsWUFBTTtBQUM3QyxnQkFBTTRCLGtCQUFrQixvQkFBTSxzQkFBUSxPQUFSLENBQU4sQ0FBeEI7QUFDQSxnQkFBSWhCLFVBQVVnQixnQkFBZ0J4QixHQUFoQixDQUFvQixnQkFBcEIsQ0FBZDtBQUNBLDhCQUFPUSxRQUFRbUIsU0FBZixFQUEwQnpCLEVBQTFCLENBQTZCQyxFQUE3QixDQUFnQ3VCLElBQWhDO0FBQ0EsOEJBQU9sQixRQUFRUCxRQUFSLEVBQVAsRUFBMkJDLEVBQTNCLENBQThCQyxFQUE5QixDQUFpQ0MsR0FBakMsQ0FBcUMsa0NBQXJDO0FBQ0gsU0FMRDtBQU1BUixXQUFHLDhDQUFILEVBQW1ELFlBQU07QUFDckQsZ0JBQU1nQixPQUFPLG9CQUFNLG9CQUFNbkIsTUFBTixDQUFOLENBQWI7QUFDQSxnQkFBSWUsVUFBVUksS0FBS1osR0FBTCxDQUFTLFFBQVQsQ0FBZDtBQUNBLDhCQUFPUSxRQUFRbUIsU0FBZixFQUEwQnpCLEVBQTFCLENBQTZCQyxFQUE3QixDQUFnQ3VCLElBQWhDO0FBQ0EsOEJBQU9sQixRQUFRUCxRQUFSLEVBQVAsRUFBMkJDLEVBQTNCLENBQThCQyxFQUE5QixDQUFpQ0MsR0FBakMsQ0FBcUMsaUJBQXJDO0FBQ0FJLHNCQUFVSSxLQUFLWixHQUFMLENBQVMsSUFBVCxDQUFWO0FBQ0EsOEJBQU9RLFFBQVFtQixTQUFmLEVBQTBCekIsRUFBMUIsQ0FBNkJDLEVBQTdCLENBQWdDdUIsSUFBaEM7QUFDQSw4QkFBT2xCLFFBQVFQLFFBQVIsRUFBUCxFQUEyQkMsRUFBM0IsQ0FBOEJDLEVBQTlCLENBQWlDQyxHQUFqQyxDQUFxQyxTQUFyQztBQUNBSSxzQkFBVUksS0FBS1osR0FBTCxDQUFTLFFBQVQsQ0FBVjtBQUNBLDhCQUFPUSxRQUFRaUIsU0FBZixFQUEwQnZCLEVBQTFCLENBQTZCQyxFQUE3QixDQUFnQ3VCLElBQWhDO0FBQ0EsOEJBQU9sQixRQUFRUCxRQUFSLEVBQVAsRUFBMkJDLEVBQTNCLENBQThCQyxFQUE5QixDQUFpQ0MsR0FBakMsQ0FBcUMsZ0NBQXJDO0FBQ0gsU0FYRDtBQVlBUixXQUFHLDBDQUFILEVBQStDLFlBQU07QUFDakQsZ0JBQU1nQixPQUFPLG9CQUFNLG9CQUFNbkIsTUFBTixDQUFOLEVBQ1JvQixJQURRLENBQ0g7QUFBQSx1QkFBS0MsU0FBU0MsRUFBRUMsTUFBRixDQUFTLFVBQUNDLEdBQUQsRUFBTUMsSUFBTjtBQUFBLDJCQUFlRCxNQUFNQyxJQUFyQjtBQUFBLGlCQUFULEVBQW9DLEVBQXBDLENBQVQsRUFBa0QsRUFBbEQsQ0FBTDtBQUFBLGFBREcsQ0FBYjtBQUVBLGdCQUFJVixVQUFVSSxLQUFLWixHQUFMLENBQVMsUUFBVCxDQUFkO0FBQ0EsOEJBQU9RLFFBQVFtQixTQUFmLEVBQTBCekIsRUFBMUIsQ0FBNkJDLEVBQTdCLENBQWdDdUIsSUFBaEM7QUFDQSw4QkFBT2xCLFFBQVEsQ0FBUixDQUFQLEVBQW1CTixFQUFuQixDQUFzQkMsRUFBdEIsQ0FBeUJDLEdBQXpCLENBQTZCLEtBQTdCO0FBQ0EsOEJBQU9JLFFBQVEsQ0FBUixDQUFQLEVBQW1CTixFQUFuQixDQUFzQkMsRUFBdEIsQ0FBeUJDLEdBQXpCLENBQTZCLEdBQTdCO0FBQ0gsU0FQRDtBQVFILEtBN0NEOztBQStDQVQsY0FBVSx1Q0FBVixFQUFtRCxZQUFNO0FBQ3JEQyxXQUFHLDZCQUFILEVBQWtDLFlBQU07QUFDcEMsZ0JBQU1nQyxtQkFBbUIsbUJBQUssb0JBQU0sR0FBTixDQUFMLENBQXpCO0FBQ0EsZ0JBQUlwQixVQUFVb0IsaUJBQWlCNUIsR0FBakIsQ0FBcUIsTUFBckIsQ0FBZDtBQUNBLDhCQUFPUSxRQUFRbUIsU0FBZixFQUEwQnpCLEVBQTFCLENBQTZCQyxFQUE3QixDQUFnQ3VCLElBQWhDO0FBQ0EsOEJBQU9sQixRQUFRUCxRQUFSLEVBQVAsRUFBMkJDLEVBQTNCLENBQThCQyxFQUE5QixDQUFpQ0MsR0FBakMsQ0FBcUMsV0FBckM7QUFDSCxTQUxEO0FBTUFSLFdBQUcsNkJBQUgsRUFBa0MsWUFBTTtBQUNwQyxnQkFBTWdDLG1CQUFtQixtQkFBSyxvQkFBTSxHQUFOLENBQUwsQ0FBekI7QUFDQSxnQkFBSXBCLFVBQVVvQixpQkFBaUI1QixHQUFqQixDQUFxQixTQUFyQixDQUFkO0FBQ0EsOEJBQU9RLFFBQVFtQixTQUFmLEVBQTBCekIsRUFBMUIsQ0FBNkJDLEVBQTdCLENBQWdDdUIsSUFBaEM7QUFDQSw4QkFBT2xCLFFBQVFQLFFBQVIsRUFBUCxFQUEyQkMsRUFBM0IsQ0FBOEJDLEVBQTlCLENBQWlDQyxHQUFqQyxDQUFxQyxnQkFBckM7QUFDSCxTQUxEO0FBTUFSLFdBQUcsc0NBQUgsRUFBMkMsWUFBTTtBQUM3QyxnQkFBTWdDLG1CQUFtQixtQkFBSyxzQkFBUSxPQUFSLENBQUwsQ0FBekI7QUFDQSxnQkFBSXBCLFVBQVVvQixpQkFBaUI1QixHQUFqQixDQUFxQixpQkFBckIsQ0FBZDtBQUNBLDhCQUFPUSxRQUFRbUIsU0FBZixFQUEwQnpCLEVBQTFCLENBQTZCQyxFQUE3QixDQUFnQ3VCLElBQWhDO0FBQ0EsOEJBQU9sQixRQUFRUCxRQUFSLEVBQVAsRUFBMkJDLEVBQTNCLENBQThCQyxFQUE5QixDQUFpQ0MsR0FBakMsQ0FBcUMsc0JBQXJDO0FBQ0gsU0FMRDtBQU1BUixXQUFHLHNDQUFILEVBQTJDLFlBQU07QUFDN0MsZ0JBQU1nQyxtQkFBbUIsbUJBQUssc0JBQVEsT0FBUixDQUFMLENBQXpCO0FBQ0EsZ0JBQUlwQixVQUFVb0IsaUJBQWlCNUIsR0FBakIsQ0FBcUIsZ0JBQXJCLENBQWQ7QUFDQSw4QkFBT1EsUUFBUW1CLFNBQWYsRUFBMEJ6QixFQUExQixDQUE2QkMsRUFBN0IsQ0FBZ0N1QixJQUFoQztBQUNBLDhCQUFPbEIsUUFBUVAsUUFBUixFQUFQLEVBQTJCQyxFQUEzQixDQUE4QkMsRUFBOUIsQ0FBaUNDLEdBQWpDLENBQXFDLGtDQUFyQztBQUNILFNBTEQ7QUFNQVIsV0FBRyx5QkFBSCxFQUE4QixZQUFNO0FBQ2hDLGdCQUFNaUMsZUFBZSxtQkFBSyxvQkFBTW5DLE1BQU4sQ0FBTCxDQUFyQjtBQUNBLGdCQUFNb0MsV0FBVyx3QkFBVSxDQUFDLHNCQUFRLE1BQVIsQ0FBRCxFQUFrQkQsWUFBbEIsRUFBZ0Msc0JBQVEsT0FBUixDQUFoQyxDQUFWLENBQWpCO0FBQ0EsZ0JBQUlyQixVQUFVc0IsU0FBUzlCLEdBQVQsQ0FBYSxZQUFiLENBQWQ7QUFDQSw4QkFBT1EsUUFBUVAsUUFBUixFQUFQLEVBQTJCQyxFQUEzQixDQUE4QkMsRUFBOUIsQ0FBaUNDLEdBQWpDLENBQXFDLGdDQUFyQztBQUNBSSxzQkFBVXNCLFNBQVM5QixHQUFULENBQWEsYUFBYixDQUFWO0FBQ0EsOEJBQU9RLFFBQVFQLFFBQVIsRUFBUCxFQUEyQkMsRUFBM0IsQ0FBOEJDLEVBQTlCLENBQWlDQyxHQUFqQyxDQUFxQyxpQ0FBckM7QUFDQUksc0JBQVVzQixTQUFTOUIsR0FBVCxDQUFhLGVBQWIsQ0FBVjtBQUNBLDhCQUFPUSxRQUFRUCxRQUFSLEVBQVAsRUFBMkJDLEVBQTNCLENBQThCQyxFQUE5QixDQUFpQ0MsR0FBakMsQ0FBcUMscUNBQXJDO0FBQ0FJLHNCQUFVc0IsU0FBUzlCLEdBQVQsQ0FBYSxnQkFBYixDQUFWO0FBQ0EsOEJBQU9RLFFBQVFQLFFBQVIsRUFBUCxFQUEyQkMsRUFBM0IsQ0FBOEJDLEVBQTlCLENBQWlDQyxHQUFqQyxDQUFxQyxzQ0FBckM7QUFDSCxTQVhEO0FBWUgsS0FyQ0Q7O0FBdUNBVCxjQUFVLGlEQUFWLEVBQTZELFlBQU07QUFDL0RDLFdBQUcsNkJBQUgsRUFBa0MsWUFBTTtBQUNwQyxnQkFBTW1DLDRCQUE0Qix5QkFBVyxvQkFBTSxHQUFOLENBQVgsQ0FBbEM7QUFDQSxnQkFBSXZCLFVBQVV1QiwwQkFBMEIsTUFBMUIsQ0FBZDtBQUNBLDhCQUFPdkIsUUFBUW1CLFNBQWYsRUFBMEJ6QixFQUExQixDQUE2QkMsRUFBN0IsQ0FBZ0N1QixJQUFoQztBQUNBLDhCQUFPbEIsUUFBUVAsUUFBUixFQUFQLEVBQTJCQyxFQUEzQixDQUE4QkMsRUFBOUIsQ0FBaUNDLEdBQWpDLENBQXFDLFdBQXJDO0FBQ0gsU0FMRDtBQU1BUixXQUFHLDZCQUFILEVBQWtDLFlBQU07QUFDcEMsZ0JBQU1tQyw0QkFBNEIseUJBQVcsb0JBQU0sR0FBTixDQUFYLENBQWxDO0FBQ0EsZ0JBQUl2QixVQUFVdUIsMEJBQTBCLFNBQTFCLENBQWQ7QUFDQSw4QkFBT3ZCLFFBQVFtQixTQUFmLEVBQTBCekIsRUFBMUIsQ0FBNkJDLEVBQTdCLENBQWdDdUIsSUFBaEM7QUFDQSw4QkFBT2xCLFFBQVFQLFFBQVIsRUFBUCxFQUEyQkMsRUFBM0IsQ0FBOEJDLEVBQTlCLENBQWlDQyxHQUFqQyxDQUFxQyxnQkFBckM7QUFDSCxTQUxEO0FBTUFSLFdBQUcsc0NBQUgsRUFBMkMsWUFBTTtBQUM3QyxnQkFBTW1DLDRCQUE0Qix5QkFBVyxzQkFBUSxPQUFSLENBQVgsQ0FBbEM7QUFDQSxnQkFBSXZCLFVBQVV1QiwwQkFBMEIsaUJBQTFCLENBQWQ7QUFDQSw4QkFBT3ZCLFFBQVFtQixTQUFmLEVBQTBCekIsRUFBMUIsQ0FBNkJDLEVBQTdCLENBQWdDdUIsSUFBaEM7QUFDQSw4QkFBT2xCLFFBQVFQLFFBQVIsRUFBUCxFQUEyQkMsRUFBM0IsQ0FBOEJDLEVBQTlCLENBQWlDQyxHQUFqQyxDQUFxQyxzQkFBckM7QUFDSCxTQUxEO0FBTUFSLFdBQUcsc0NBQUgsRUFBMkMsWUFBTTtBQUM3QyxnQkFBTW1DLDRCQUE0Qix5QkFBVyxzQkFBUSxPQUFSLENBQVgsQ0FBbEM7QUFDQSxnQkFBSXZCLFVBQVV1QiwwQkFBMEIsZ0JBQTFCLENBQWQ7QUFDQSw4QkFBT3ZCLFFBQVFtQixTQUFmLEVBQTBCekIsRUFBMUIsQ0FBNkJDLEVBQTdCLENBQWdDdUIsSUFBaEM7QUFDQSw4QkFBT2xCLFFBQVFQLFFBQVIsRUFBUCxFQUEyQkMsRUFBM0IsQ0FBOEJDLEVBQTlCLENBQWlDQyxHQUFqQyxDQUFxQyxrQ0FBckM7QUFDSCxTQUxEO0FBTUgsS0F6QkQ7O0FBMkJBVCxjQUFVLDhCQUFWLEVBQTBDLFlBQU07QUFDNUNDLFdBQUcsa0NBQUgsRUFBdUMsWUFBTTtBQUN6QyxnQkFBTW9DLGNBQWMsc0JBQVEsT0FBUixDQUFwQjtBQUNBLGdCQUFNQyxlQUFlRCxZQUFZaEMsR0FBWixDQUFnQixXQUFoQixDQUFyQjtBQUNBLDhCQUFPLHFCQUFVaUMsWUFBVixDQUFQLEVBQWdDL0IsRUFBaEMsQ0FBbUNDLEVBQW5DLENBQXNDdUIsSUFBdEM7QUFDQSw4QkFBT08sYUFBYWhDLFFBQWIsRUFBUCxFQUFnQ0MsRUFBaEMsQ0FBbUNDLEVBQW5DLENBQXNDQyxHQUF0QyxDQUEwQyxvQkFBMUM7QUFDSCxTQUxEO0FBTUgsS0FQRDs7QUFTQVQsY0FBVSwyREFBVixFQUF1RSxZQUFNO0FBQ3pFQyxXQUFHLHNDQUFILEVBQTJDLFlBQU07QUFDN0MsZ0JBQU1zQyxZQUFZLHdCQUFVLENBQUMsb0JBQU0sR0FBTixDQUFELEVBQWEsb0JBQU0sR0FBTixDQUFiLEVBQXlCLG9CQUFNLEdBQU4sQ0FBekIsQ0FBVixDQUFsQjtBQUNBLDhCQUFPQSxVQUFVbEMsR0FBVixDQUFjLEtBQWQsRUFBcUJDLFFBQXJCLEVBQVAsRUFBd0NDLEVBQXhDLENBQTJDQyxFQUEzQyxDQUE4Q0MsR0FBOUMsQ0FBa0QsWUFBbEQ7QUFDSCxTQUhEO0FBSUgsS0FMRDs7QUFPQVQsY0FBVSxnRUFBVixFQUE0RSxZQUFNO0FBQzlFQyxXQUFHLDJDQUFILEVBQWdELFlBQU07QUFDbEQsZ0JBQU1zQyxZQUFZLHlCQUFXLENBQUMsb0JBQU0sR0FBTixDQUFELEVBQWEsb0JBQU0sR0FBTixDQUFiLEVBQXlCLG9CQUFNLEdBQU4sQ0FBekIsQ0FBWCxDQUFsQjtBQUNBLDhCQUFPQSxVQUFVbEMsR0FBVixDQUFjLEtBQWQsRUFBcUJDLFFBQXJCLEVBQVAsRUFBd0NDLEVBQXhDLENBQTJDQyxFQUEzQyxDQUE4Q0MsR0FBOUMsQ0FBa0QsUUFBbEQ7QUFDSCxTQUhEO0FBSUgsS0FMRDs7QUFPQVQsY0FBVSxtQkFBVixFQUErQixZQUFNO0FBQ2pDQyxXQUFHLGdEQUFILEVBQXFELFlBQU07QUFDdkQsZ0JBQU11QyxhQUFhLFNBQWJBLFVBQWE7QUFBQSx1QkFBSztBQUFBLDJCQUFLQyxJQUFJLEdBQUosR0FBVUMsQ0FBZjtBQUFBLGlCQUFMO0FBQUEsYUFBbkI7QUFDQSxnQkFBTUMsU0FBUyxvQkFBTUgsVUFBTixFQUFrQixvQkFBTSxHQUFOLENBQWxCLEVBQThCLG9CQUFNLEdBQU4sQ0FBOUIsQ0FBZjtBQUNBLDhCQUFPRyxPQUFPdEMsR0FBUCxDQUFXLEtBQVgsRUFBa0JDLFFBQWxCLEVBQVAsRUFBcUNDLEVBQXJDLENBQXdDQyxFQUF4QyxDQUEyQ0MsR0FBM0MsQ0FBK0MsU0FBL0M7QUFDSCxTQUpEO0FBS0FSLFdBQUcsd0NBQUgsRUFBNkMsWUFBTTtBQUMvQyxnQkFBTTJDLFlBQVksU0FBWkEsU0FBWTtBQUFBLHVCQUFLO0FBQUEsMkJBQUtILElBQUlDLENBQVQ7QUFBQSxpQkFBTDtBQUFBLGFBQWxCO0FBQ0EsZ0JBQU1HLFlBQVksb0JBQU1ELFNBQU4sRUFBaUIscUJBQU8sQ0FBUCxDQUFqQixFQUE0QixxQkFBTyxDQUFQLENBQTVCLENBQWxCO0FBQ0EsOEJBQU9DLFVBQVV4QyxHQUFWLENBQWMsTUFBZCxFQUFzQkMsUUFBdEIsRUFBUCxFQUF5Q0MsRUFBekMsQ0FBNENDLEVBQTVDLENBQStDQyxHQUEvQyxDQUFtRCxRQUFuRDtBQUNBLDhCQUFPb0MsVUFBVXhDLEdBQVYsQ0FBYyxLQUFkLEVBQXFCeUIsU0FBNUIsRUFBdUN2QixFQUF2QyxDQUEwQ0MsRUFBMUMsQ0FBNkN1QixJQUE3QztBQUNILFNBTEQ7QUFNSCxLQVpEOztBQWNBL0IsY0FBVSxnQkFBVixFQUE0QixZQUFNO0FBQzlCLFlBQUk4QyxtQkFBSjtBQUFBLFlBQWdCQyxvQkFBaEI7QUFBQSxZQUE2QmxDLGdCQUE3QjtBQUNBbUMsbUJBQVcsWUFBTTtBQUNiRix5QkFBYSxvQkFBTWhELE1BQU4sQ0FBYjtBQUNBaUQsMEJBQWMsc0JBQVFELFVBQVIsRUFBb0Isc0JBQVFBLFVBQVIsRUFBb0JBLFVBQXBCLENBQXBCLENBQWQ7QUFDQWpDLHNCQUFVa0MsWUFBWTFDLEdBQVosQ0FBZ0IsS0FBaEIsQ0FBVjtBQUNILFNBSkQ7QUFLQUosV0FBRyw0QkFBSCxFQUFpQyxZQUFNO0FBQ25DLDhCQUFPWSxRQUFRbUIsU0FBZixFQUEwQnpCLEVBQTFCLENBQTZCQyxFQUE3QixDQUFnQ3VCLElBQWhDO0FBQ0EsOEJBQU9sQixRQUFRLENBQVIsRUFBV1AsUUFBWCxFQUFQLEVBQThCQyxFQUE5QixDQUFpQ0MsRUFBakMsQ0FBb0NDLEdBQXBDLENBQXdDLFdBQXhDO0FBQ0EsOEJBQU9JLFFBQVEsQ0FBUixDQUFQLEVBQW1CTixFQUFuQixDQUFzQkMsRUFBdEIsQ0FBeUJDLEdBQXpCLENBQTZCLEVBQTdCO0FBQ0gsU0FKRDtBQUtBVCxrQkFBVSxrREFBVixFQUE4RCxZQUFNO0FBQ2hFQyxlQUFHLGtCQUFILEVBQXVCLFlBQU07QUFDekI4Qyw4QkFBYyxtQkFBSztBQUFBO0FBQUEsd0JBQUVOLENBQUY7QUFBQTtBQUFBLHdCQUFNQyxDQUFOO0FBQUEsd0JBQVNPLENBQVQ7O0FBQUEsMkJBQWlCLENBQUNSLENBQUQsRUFBSUMsQ0FBSixFQUFPTyxDQUFQLENBQWpCO0FBQUEsaUJBQUwsRUFBaUNGLFdBQWpDLENBQWQ7QUFDQSxvQkFBSWxDLFVBQVVrQyxZQUFZMUMsR0FBWixDQUFnQixLQUFoQixDQUFkO0FBQ0Esa0NBQU9RLFFBQVFtQixTQUFmLEVBQTBCekIsRUFBMUIsQ0FBNkJDLEVBQTdCLENBQWdDdUIsSUFBaEM7QUFDQSxrQ0FBT2xCLFFBQVEsQ0FBUixFQUFXUCxRQUFYLEVBQVAsRUFBOEJDLEVBQTlCLENBQWlDQyxFQUFqQyxDQUFvQ0MsR0FBcEMsQ0FBd0MsU0FBeEM7QUFDQSxrQ0FBT0ksUUFBUSxDQUFSLENBQVAsRUFBbUJOLEVBQW5CLENBQXNCQyxFQUF0QixDQUF5QkMsR0FBekIsQ0FBNkIsRUFBN0I7QUFDSCxhQU5EO0FBT0FSLGVBQUcsb0JBQUgsRUFBeUIsWUFBTTtBQUMzQjhDLDhCQUFjQSxZQUFZN0IsSUFBWixDQUFpQjtBQUFBO0FBQUEsd0JBQUV1QixDQUFGO0FBQUE7QUFBQSx3QkFBTUMsQ0FBTjtBQUFBLHdCQUFTTyxDQUFUOztBQUFBLDJCQUFpQixDQUFDUixDQUFELEVBQUlDLENBQUosRUFBT08sQ0FBUCxDQUFqQjtBQUFBLGlCQUFqQixDQUFkO0FBQ0Esb0JBQUlwQyxVQUFVa0MsWUFBWTFDLEdBQVosQ0FBZ0IsS0FBaEIsQ0FBZDtBQUNBLGtDQUFPUSxRQUFRbUIsU0FBZixFQUEwQnpCLEVBQTFCLENBQTZCQyxFQUE3QixDQUFnQ3VCLElBQWhDO0FBQ0Esa0NBQU9sQixRQUFRLENBQVIsRUFBV1AsUUFBWCxFQUFQLEVBQThCQyxFQUE5QixDQUFpQ0MsRUFBakMsQ0FBb0NDLEdBQXBDLENBQXdDLFNBQXhDO0FBQ0Esa0NBQU9JLFFBQVEsQ0FBUixDQUFQLEVBQW1CTixFQUFuQixDQUFzQkMsRUFBdEIsQ0FBeUJDLEdBQXpCLENBQTZCLEVBQTdCO0FBQ0gsYUFORDtBQU9ILFNBZkQ7QUFnQkgsS0E1QkQ7O0FBOEJBeUMsYUFBUyxXQUFULEVBQXNCLFlBQU07QUFDNUI7QUFDSWpELFdBQUcsWUFBSCxFQUFpQixZQUFNO0FBQ25CLGdCQUFNa0QsWUFBWSxTQUFaQSxTQUFZO0FBQUEsdUJBQVFDLEtBQUssQ0FBTCxJQUFVQSxLQUFLLENBQUwsQ0FBbEI7QUFBQSxhQUFsQjtBQUNBLGdCQUFNQyxPQUFPLHNCQUFRLG9CQUFNLEdBQU4sQ0FBUixFQUNULHNCQUFRLG9CQUFNLEdBQU4sQ0FBUixFQUNJLHNCQUFRLG9CQUFNLEdBQU4sQ0FBUixFQUFvQixzQkFBUSxFQUFSLENBQXBCLEVBQWlDbkMsSUFBakMsQ0FBc0NpQyxTQUF0QyxDQURKLEVBRUVqQyxJQUZGLENBRU9pQyxTQUZQLENBRFMsRUFJWGpDLElBSlcsQ0FJTmlDLFNBSk0sQ0FBYjtBQUtBLGdCQUFNdEMsVUFBVXdDLEtBQUtoRCxHQUFMLENBQVMsTUFBVCxDQUFoQjtBQUNBLDhCQUFPUSxRQUFRbUIsU0FBZixFQUEwQnpCLEVBQTFCLENBQTZCQyxFQUE3QixDQUFnQ3VCLElBQWhDO0FBQ0EsOEJBQU9sQixRQUFReUMsS0FBUixDQUFjLENBQWQsRUFBaUJoRCxRQUFqQixFQUFQLEVBQW9DQyxFQUFwQyxDQUF1Q0MsRUFBdkMsQ0FBMENDLEdBQTFDLENBQThDLEtBQTlDO0FBQ0EsOEJBQU9JLFFBQVF5QyxLQUFSLENBQWMsQ0FBZCxDQUFQLEVBQXlCL0MsRUFBekIsQ0FBNEJDLEVBQTVCLENBQStCQyxHQUEvQixDQUFtQyxHQUFuQztBQUNILFNBWEQ7QUFZSCxLQWREOztBQWdCQXlDLGFBQVMsc0NBQVQsRUFBaUQsWUFBTTs7QUFFbkRqRCxXQUFHLDhCQUFILEVBQW1DLFlBQU07QUFDckMsZ0JBQU1zRCxtQkFBbUIsb0JBQU0zRCxVQUFOLENBQXpCOztBQUVBLDhCQUFPLG9CQUFTMkQsZ0JBQVQsQ0FBUCxFQUFtQ2hELEVBQW5DLENBQXNDQyxFQUF0QyxDQUF5Q3VCLElBQXpDO0FBQ0EsZ0JBQUl5QixnQkFBZ0JELGlCQUFpQmxELEdBQWpCLENBQXFCLEdBQXJCLENBQXBCO0FBQ0EsOEJBQU9tRCxjQUFjeEIsU0FBckIsRUFBZ0N6QixFQUFoQyxDQUFtQ0MsRUFBbkMsQ0FBc0N1QixJQUF0QztBQUNBLDhCQUFPeUIsY0FBY0YsS0FBZCxDQUFvQixDQUFwQixDQUFQLEVBQStCL0MsRUFBL0IsQ0FBa0NDLEVBQWxDLENBQXFDQyxHQUFyQyxDQUF5QyxHQUF6QztBQUNBLDhCQUFPK0MsY0FBY0YsS0FBZCxDQUFvQixDQUFwQixDQUFQLEVBQStCL0MsRUFBL0IsQ0FBa0NDLEVBQWxDLENBQXFDQyxHQUFyQyxDQUF5QyxFQUF6QztBQUNBK0MsNEJBQWdCRCxpQkFBaUJsRCxHQUFqQixDQUFxQixHQUFyQixDQUFoQjtBQUNBLDhCQUFPbUQsY0FBY3hCLFNBQXJCLEVBQWdDekIsRUFBaEMsQ0FBbUNDLEVBQW5DLENBQXNDdUIsSUFBdEM7QUFDQSw4QkFBT3lCLGNBQWNGLEtBQWQsQ0FBb0IsQ0FBcEIsQ0FBUCxFQUErQi9DLEVBQS9CLENBQWtDQyxFQUFsQyxDQUFxQ0MsR0FBckMsQ0FBeUMsR0FBekM7QUFDQSw4QkFBTytDLGNBQWNGLEtBQWQsQ0FBb0IsQ0FBcEIsQ0FBUCxFQUErQi9DLEVBQS9CLENBQWtDQyxFQUFsQyxDQUFxQ0MsR0FBckMsQ0FBeUMsRUFBekM7QUFDQStDLDRCQUFnQkQsaUJBQWlCbEQsR0FBakIsQ0FBcUIsR0FBckIsQ0FBaEI7QUFDQSw4QkFBT21ELGNBQWN4QixTQUFyQixFQUFnQ3pCLEVBQWhDLENBQW1DQyxFQUFuQyxDQUFzQ3VCLElBQXRDO0FBQ0EsOEJBQU95QixjQUFjRixLQUFkLENBQW9CLENBQXBCLENBQVAsRUFBK0IvQyxFQUEvQixDQUFrQ0MsRUFBbEMsQ0FBcUNDLEdBQXJDLENBQXlDLEdBQXpDO0FBQ0EsOEJBQU8rQyxjQUFjRixLQUFkLENBQW9CLENBQXBCLENBQVAsRUFBK0IvQyxFQUEvQixDQUFrQ0MsRUFBbEMsQ0FBcUNDLEdBQXJDLENBQXlDLEVBQXpDO0FBQ0ErQyw0QkFBZ0JELGlCQUFpQmxELEdBQWpCLENBQXFCLEdBQXJCLENBQWhCO0FBQ0EsOEJBQU9tRCxjQUFjeEIsU0FBckIsRUFBZ0N6QixFQUFoQyxDQUFtQ0MsRUFBbkMsQ0FBc0N1QixJQUF0QztBQUNBLDhCQUFPeUIsY0FBY0YsS0FBZCxDQUFvQixDQUFwQixDQUFQLEVBQStCL0MsRUFBL0IsQ0FBa0NDLEVBQWxDLENBQXFDQyxHQUFyQyxDQUF5QyxHQUF6QztBQUNBLDhCQUFPK0MsY0FBY0YsS0FBZCxDQUFvQixDQUFwQixDQUFQLEVBQStCL0MsRUFBL0IsQ0FBa0NDLEVBQWxDLENBQXFDQyxHQUFyQyxDQUF5QyxFQUF6Qzs7QUFFQStDLDRCQUFnQkQsaUJBQWlCbEQsR0FBakIsQ0FBcUIsR0FBckIsQ0FBaEI7QUFDQSw4QkFBT21ELGNBQWMxQixTQUFyQixFQUFnQ3ZCLEVBQWhDLENBQW1DQyxFQUFuQyxDQUFzQ3VCLElBQXRDO0FBQ0EsOEJBQU95QixjQUFjRixLQUFkLENBQW9CLENBQXBCLENBQVAsRUFBK0IvQyxFQUEvQixDQUFrQ0MsRUFBbEMsQ0FBcUNDLEdBQXJDLENBQXlDLGtDQUF6QztBQUNBLDhCQUFPK0MsY0FBY0YsS0FBZCxDQUFvQixDQUFwQixDQUFQLEVBQStCL0MsRUFBL0IsQ0FBa0NDLEVBQWxDLENBQXFDQyxHQUFyQyxDQUF5QyxPQUF6QztBQUNILFNBekJEOztBQTJCQVIsV0FBRyw4QkFBSCxFQUFtQyxZQUFNO0FBQ3JDLGdCQUFJd0QsbUJBQW1CLG9CQUFNNUQsVUFBTixDQUF2Qjs7QUFFQSw4QkFBTyxvQkFBUzRELGdCQUFULENBQVAsRUFBbUNsRCxFQUFuQyxDQUFzQ0MsRUFBdEMsQ0FBeUN1QixJQUF6QztBQUNBLGdCQUFJeUIsZ0JBQWdCQyxpQkFBaUJwRCxHQUFqQixDQUFxQixHQUFyQixDQUFwQjtBQUNBLDhCQUFPbUQsY0FBY3hCLFNBQXJCLEVBQWdDekIsRUFBaEMsQ0FBbUNDLEVBQW5DLENBQXNDdUIsSUFBdEM7QUFDQSw4QkFBT3lCLGNBQWNGLEtBQWQsQ0FBb0IsQ0FBcEIsQ0FBUCxFQUErQi9DLEVBQS9CLENBQWtDQyxFQUFsQyxDQUFxQ0MsR0FBckMsQ0FBeUMsR0FBekM7QUFDQSw4QkFBTytDLGNBQWNGLEtBQWQsQ0FBb0IsQ0FBcEIsQ0FBUCxFQUErQi9DLEVBQS9CLENBQWtDQyxFQUFsQyxDQUFxQ0MsR0FBckMsQ0FBeUMsRUFBekM7QUFDQStDLDRCQUFnQkMsaUJBQWlCcEQsR0FBakIsQ0FBcUIsR0FBckIsQ0FBaEI7QUFDQSw4QkFBT21ELGNBQWN4QixTQUFyQixFQUFnQ3pCLEVBQWhDLENBQW1DQyxFQUFuQyxDQUFzQ3VCLElBQXRDO0FBQ0EsOEJBQU95QixjQUFjRixLQUFkLENBQW9CLENBQXBCLENBQVAsRUFBK0IvQyxFQUEvQixDQUFrQ0MsRUFBbEMsQ0FBcUNDLEdBQXJDLENBQXlDLEdBQXpDO0FBQ0EsOEJBQU8rQyxjQUFjRixLQUFkLENBQW9CLENBQXBCLENBQVAsRUFBK0IvQyxFQUEvQixDQUFrQ0MsRUFBbEMsQ0FBcUNDLEdBQXJDLENBQXlDLEVBQXpDO0FBQ0ErQyw0QkFBZ0JDLGlCQUFpQnBELEdBQWpCLENBQXFCLEdBQXJCLENBQWhCO0FBQ0EsOEJBQU9tRCxjQUFjeEIsU0FBckIsRUFBZ0N6QixFQUFoQyxDQUFtQ0MsRUFBbkMsQ0FBc0N1QixJQUF0QztBQUNBLDhCQUFPeUIsY0FBY0YsS0FBZCxDQUFvQixDQUFwQixDQUFQLEVBQStCL0MsRUFBL0IsQ0FBa0NDLEVBQWxDLENBQXFDQyxHQUFyQyxDQUF5QyxHQUF6QztBQUNBLDhCQUFPK0MsY0FBY0YsS0FBZCxDQUFvQixDQUFwQixDQUFQLEVBQStCL0MsRUFBL0IsQ0FBa0NDLEVBQWxDLENBQXFDQyxHQUFyQyxDQUF5QyxFQUF6QztBQUNBK0MsNEJBQWdCQyxpQkFBaUJwRCxHQUFqQixDQUFxQixHQUFyQixDQUFoQjtBQUNBLDhCQUFPbUQsY0FBY3hCLFNBQXJCLEVBQWdDekIsRUFBaEMsQ0FBbUNDLEVBQW5DLENBQXNDdUIsSUFBdEM7QUFDQSw4QkFBT3lCLGNBQWNGLEtBQWQsQ0FBb0IsQ0FBcEIsQ0FBUCxFQUErQi9DLEVBQS9CLENBQWtDQyxFQUFsQyxDQUFxQ0MsR0FBckMsQ0FBeUMsR0FBekM7QUFDQSw4QkFBTytDLGNBQWNGLEtBQWQsQ0FBb0IsQ0FBcEIsQ0FBUCxFQUErQi9DLEVBQS9CLENBQWtDQyxFQUFsQyxDQUFxQ0MsR0FBckMsQ0FBeUMsRUFBekM7O0FBRUErQyw0QkFBZ0JDLGlCQUFpQnBELEdBQWpCLENBQXFCLEdBQXJCLENBQWhCO0FBQ0EsOEJBQU9tRCxjQUFjMUIsU0FBckIsRUFBZ0N2QixFQUFoQyxDQUFtQ0MsRUFBbkMsQ0FBc0N1QixJQUF0QztBQUNBLDhCQUFPeUIsY0FBY0YsS0FBZCxDQUFvQixDQUFwQixDQUFQLEVBQStCL0MsRUFBL0IsQ0FBa0NDLEVBQWxDLENBQXFDQyxHQUFyQyxDQUF5QyxrQ0FBekM7QUFDQSw4QkFBTytDLGNBQWNGLEtBQWQsQ0FBb0IsQ0FBcEIsQ0FBUCxFQUErQi9DLEVBQS9CLENBQWtDQyxFQUFsQyxDQUFxQ0MsR0FBckMsQ0FBeUMsT0FBekM7QUFDSCxTQXpCRDs7QUEyQkFSLFdBQUcscUJBQUgsRUFBMEIsWUFBTTtBQUM1QixnQkFBSXlELGVBQWUsb0JBQU01RCxNQUFOLENBQW5COztBQUVBLDhCQUFPLG9CQUFTNEQsWUFBVCxDQUFQLEVBQStCbkQsRUFBL0IsQ0FBa0NDLEVBQWxDLENBQXFDdUIsSUFBckM7QUFDQSxnQkFBSXlCLGdCQUFnQkUsYUFBYXJELEdBQWIsQ0FBaUIsR0FBakIsQ0FBcEI7QUFDQSw4QkFBT21ELGNBQWN4QixTQUFyQixFQUFnQ3pCLEVBQWhDLENBQW1DQyxFQUFuQyxDQUFzQ3VCLElBQXRDO0FBQ0EsOEJBQU95QixjQUFjRixLQUFkLENBQW9CLENBQXBCLENBQVAsRUFBK0IvQyxFQUEvQixDQUFrQ0MsRUFBbEMsQ0FBcUNDLEdBQXJDLENBQXlDLEdBQXpDO0FBQ0EsOEJBQU8rQyxjQUFjRixLQUFkLENBQW9CLENBQXBCLENBQVAsRUFBK0IvQyxFQUEvQixDQUFrQ0MsRUFBbEMsQ0FBcUNDLEdBQXJDLENBQXlDLEVBQXpDO0FBQ0ErQyw0QkFBZ0JFLGFBQWFyRCxHQUFiLENBQWlCLEdBQWpCLENBQWhCO0FBQ0EsOEJBQU9tRCxjQUFjeEIsU0FBckIsRUFBZ0N6QixFQUFoQyxDQUFtQ0MsRUFBbkMsQ0FBc0N1QixJQUF0QztBQUNBLDhCQUFPeUIsY0FBY0YsS0FBZCxDQUFvQixDQUFwQixDQUFQLEVBQStCL0MsRUFBL0IsQ0FBa0NDLEVBQWxDLENBQXFDQyxHQUFyQyxDQUF5QyxHQUF6QztBQUNBLDhCQUFPK0MsY0FBY0YsS0FBZCxDQUFvQixDQUFwQixDQUFQLEVBQStCL0MsRUFBL0IsQ0FBa0NDLEVBQWxDLENBQXFDQyxHQUFyQyxDQUF5QyxFQUF6QztBQUNBK0MsNEJBQWdCRSxhQUFhckQsR0FBYixDQUFpQixHQUFqQixDQUFoQjtBQUNBLDhCQUFPbUQsY0FBY3hCLFNBQXJCLEVBQWdDekIsRUFBaEMsQ0FBbUNDLEVBQW5DLENBQXNDdUIsSUFBdEM7QUFDQSw4QkFBT3lCLGNBQWNGLEtBQWQsQ0FBb0IsQ0FBcEIsQ0FBUCxFQUErQi9DLEVBQS9CLENBQWtDQyxFQUFsQyxDQUFxQ0MsR0FBckMsQ0FBeUMsR0FBekM7QUFDQSw4QkFBTytDLGNBQWNGLEtBQWQsQ0FBb0IsQ0FBcEIsQ0FBUCxFQUErQi9DLEVBQS9CLENBQWtDQyxFQUFsQyxDQUFxQ0MsR0FBckMsQ0FBeUMsRUFBekM7QUFDQStDLDRCQUFnQkUsYUFBYXJELEdBQWIsQ0FBaUIsR0FBakIsQ0FBaEI7QUFDQSw4QkFBT21ELGNBQWN4QixTQUFyQixFQUFnQ3pCLEVBQWhDLENBQW1DQyxFQUFuQyxDQUFzQ3VCLElBQXRDO0FBQ0EsOEJBQU95QixjQUFjRixLQUFkLENBQW9CLENBQXBCLENBQVAsRUFBK0IvQyxFQUEvQixDQUFrQ0MsRUFBbEMsQ0FBcUNDLEdBQXJDLENBQXlDLEdBQXpDO0FBQ0EsOEJBQU8rQyxjQUFjRixLQUFkLENBQW9CLENBQXBCLENBQVAsRUFBK0IvQyxFQUEvQixDQUFrQ0MsRUFBbEMsQ0FBcUNDLEdBQXJDLENBQXlDLEVBQXpDOztBQUVBK0MsNEJBQWdCRSxhQUFhckQsR0FBYixDQUFpQixHQUFqQixDQUFoQjtBQUNBLDhCQUFPbUQsY0FBYzFCLFNBQXJCLEVBQWdDdkIsRUFBaEMsQ0FBbUNDLEVBQW5DLENBQXNDdUIsSUFBdEM7QUFDQSw4QkFBT3lCLGNBQWNGLEtBQWQsQ0FBb0IsQ0FBcEIsQ0FBUCxFQUErQi9DLEVBQS9CLENBQWtDQyxFQUFsQyxDQUFxQ0MsR0FBckMsQ0FBeUMsa0JBQXpDO0FBQ0EsOEJBQU8rQyxjQUFjRixLQUFkLENBQW9CLENBQXBCLENBQVAsRUFBK0IvQyxFQUEvQixDQUFrQ0MsRUFBbEMsQ0FBcUNDLEdBQXJDLENBQXlDLE9BQXpDO0FBQ0gsU0F6QkQ7QUEwQkgsS0FsRkQ7O0FBb0ZBeUMsYUFBUyxxQ0FBVCxFQUFnRCxZQUFNO0FBQ2xELFlBQU1TLGdCQUFnQixxQkFBTyxDQUFDLG9CQUFNLEdBQU4sQ0FBRCxFQUFhLG9CQUFNLEdBQU4sQ0FBYixFQUF5QixvQkFBTSxHQUFOLENBQXpCLEVBQXFDLG9CQUFNLEdBQU4sQ0FBckMsQ0FBUCxDQUF0Qjs7QUFFQTFELFdBQUcsNkJBQUgsRUFBa0MsWUFBTTtBQUNwQyw4QkFBTyxvQkFBUzBELGFBQVQsQ0FBUCxFQUFnQ3BELEVBQWhDLENBQW1DQyxFQUFuQyxDQUFzQ3VCLElBQXRDO0FBQ0EsZ0JBQUl5QixnQkFBZ0JHLGNBQWN0RCxHQUFkLENBQWtCLEdBQWxCLENBQXBCO0FBQ0EsOEJBQU9tRCxjQUFjeEIsU0FBckIsRUFBZ0N6QixFQUFoQyxDQUFtQ0MsRUFBbkMsQ0FBc0N1QixJQUF0QztBQUNBLDhCQUFPeUIsY0FBY0YsS0FBZCxDQUFvQixDQUFwQixDQUFQLEVBQStCL0MsRUFBL0IsQ0FBa0NDLEVBQWxDLENBQXFDQyxHQUFyQyxDQUF5QyxHQUF6QztBQUNBLDhCQUFPK0MsY0FBY0YsS0FBZCxDQUFvQixDQUFwQixDQUFQLEVBQStCL0MsRUFBL0IsQ0FBa0NDLEVBQWxDLENBQXFDQyxHQUFyQyxDQUF5QyxFQUF6QztBQUNBK0MsNEJBQWdCRyxjQUFjdEQsR0FBZCxDQUFrQixHQUFsQixDQUFoQjtBQUNBLDhCQUFPbUQsY0FBY3hCLFNBQXJCLEVBQWdDekIsRUFBaEMsQ0FBbUNDLEVBQW5DLENBQXNDdUIsSUFBdEM7QUFDQSw4QkFBT3lCLGNBQWNGLEtBQWQsQ0FBb0IsQ0FBcEIsQ0FBUCxFQUErQi9DLEVBQS9CLENBQWtDQyxFQUFsQyxDQUFxQ0MsR0FBckMsQ0FBeUMsR0FBekM7QUFDQSw4QkFBTytDLGNBQWNGLEtBQWQsQ0FBb0IsQ0FBcEIsQ0FBUCxFQUErQi9DLEVBQS9CLENBQWtDQyxFQUFsQyxDQUFxQ0MsR0FBckMsQ0FBeUMsRUFBekM7QUFDQStDLDRCQUFnQkcsY0FBY3RELEdBQWQsQ0FBa0IsR0FBbEIsQ0FBaEI7QUFDQSw4QkFBT21ELGNBQWN4QixTQUFyQixFQUFnQ3pCLEVBQWhDLENBQW1DQyxFQUFuQyxDQUFzQ3VCLElBQXRDO0FBQ0EsOEJBQU95QixjQUFjRixLQUFkLENBQW9CLENBQXBCLENBQVAsRUFBK0IvQyxFQUEvQixDQUFrQ0MsRUFBbEMsQ0FBcUNDLEdBQXJDLENBQXlDLEdBQXpDO0FBQ0EsOEJBQU8rQyxjQUFjRixLQUFkLENBQW9CLENBQXBCLENBQVAsRUFBK0IvQyxFQUEvQixDQUFrQ0MsRUFBbEMsQ0FBcUNDLEdBQXJDLENBQXlDLEVBQXpDO0FBQ0gsU0FkRDs7QUFnQkFSLFdBQUcsbUNBQUgsRUFBd0MsWUFBTTtBQUMxQyxnQkFBTXVELGdCQUFnQkcsY0FBY3RELEdBQWQsQ0FBa0IsR0FBbEIsQ0FBdEI7QUFDQSw4QkFBT21ELGNBQWMxQixTQUFyQixFQUFnQ3ZCLEVBQWhDLENBQW1DQyxFQUFuQyxDQUFzQ3VCLElBQXRDO0FBQ0EsOEJBQU95QixjQUFjRixLQUFkLENBQW9CLENBQXBCLENBQVAsRUFBK0IvQyxFQUEvQixDQUFrQ0MsRUFBbEMsQ0FBcUNDLEdBQXJDLENBQXlDLHlDQUF6QztBQUNBLDhCQUFPK0MsY0FBY0YsS0FBZCxDQUFvQixDQUFwQixDQUFQLEVBQStCL0MsRUFBL0IsQ0FBa0NDLEVBQWxDLENBQXFDQyxHQUFyQyxDQUF5QyxPQUF6QztBQUNILFNBTEQ7QUFNSCxLQXpCRDs7QUEyQkF5QyxhQUFTLDZCQUFULEVBQXdDLFlBQU07QUFDMUMsWUFBTVUsYUFBYSxxQkFBTyxvQkFBTSxHQUFOLENBQVAsRUFBbUIsb0JBQU0sR0FBTixDQUFuQixDQUFuQjs7QUFFQTNELFdBQUcsNEJBQUgsRUFBaUMsWUFBTTtBQUNuQyw4QkFBTyxvQkFBUzJELFVBQVQsQ0FBUCxFQUE2QnJELEVBQTdCLENBQWdDQyxFQUFoQyxDQUFtQ3VCLElBQW5DO0FBQ0EsZ0JBQUk4QixjQUFjRCxXQUFXdkQsR0FBWCxDQUFlLEtBQWYsQ0FBbEI7QUFDQSw4QkFBT3dELFlBQVk3QixTQUFuQixFQUE4QnpCLEVBQTlCLENBQWlDQyxFQUFqQyxDQUFvQ3VCLElBQXBDO0FBQ0EsOEJBQU84QixZQUFZUCxLQUFaLENBQWtCLENBQWxCLENBQVAsRUFBNkIvQyxFQUE3QixDQUFnQ0MsRUFBaEMsQ0FBbUNDLEdBQW5DLENBQXVDLEdBQXZDO0FBQ0EsOEJBQU9vRCxZQUFZUCxLQUFaLENBQWtCLENBQWxCLENBQVAsRUFBNkIvQyxFQUE3QixDQUFnQ0MsRUFBaEMsQ0FBbUNDLEdBQW5DLENBQXVDLElBQXZDO0FBQ0FvRCwwQkFBY0QsV0FBV3ZELEdBQVgsQ0FBZSxLQUFmLENBQWQ7QUFDQSw4QkFBT3dELFlBQVk3QixTQUFuQixFQUE4QnpCLEVBQTlCLENBQWlDQyxFQUFqQyxDQUFvQ3VCLElBQXBDO0FBQ0EsOEJBQU84QixZQUFZUCxLQUFaLENBQWtCLENBQWxCLENBQVAsRUFBNkIvQyxFQUE3QixDQUFnQ0MsRUFBaEMsQ0FBbUNDLEdBQW5DLENBQXVDLEdBQXZDO0FBQ0EsOEJBQU9vRCxZQUFZUCxLQUFaLENBQWtCLENBQWxCLENBQVAsRUFBNkIvQyxFQUE3QixDQUFnQ0MsRUFBaEMsQ0FBbUNDLEdBQW5DLENBQXVDLElBQXZDO0FBQ0gsU0FWRDs7QUFZQVIsV0FBRyxrQ0FBSCxFQUF1QyxZQUFNO0FBQ3pDLGdCQUFNNEQsY0FBY0QsV0FBV3ZELEdBQVgsQ0FBZSxLQUFmLENBQXBCO0FBQ0EsOEJBQU93RCxZQUFZL0IsU0FBbkIsRUFBOEJ2QixFQUE5QixDQUFpQ0MsRUFBakMsQ0FBb0N1QixJQUFwQztBQUNBLDhCQUFPOEIsWUFBWVAsS0FBWixDQUFrQixDQUFsQixDQUFQLEVBQTZCL0MsRUFBN0IsQ0FBZ0NDLEVBQWhDLENBQW1DQyxHQUFuQyxDQUF1Qyx3QkFBdkM7QUFDQSw4QkFBT29ELFlBQVlQLEtBQVosQ0FBa0IsQ0FBbEIsQ0FBUCxFQUE2Qi9DLEVBQTdCLENBQWdDQyxFQUFoQyxDQUFtQ0MsR0FBbkMsQ0FBdUMsaUJBQXZDO0FBQ0gsU0FMRDtBQU1ILEtBckJEOztBQXVCQXlDLGFBQVMsOEJBQVQsRUFBeUMsWUFBTTtBQUMzQyxZQUFNWSxjQUFjLHNCQUFRLG9CQUFNLEdBQU4sQ0FBUixFQUFvQixvQkFBTSxHQUFOLENBQXBCLENBQXBCOztBQUVBN0QsV0FBRyxxQkFBSCxFQUEwQixZQUFNO0FBQzVCLDhCQUFPLG9CQUFTNkQsV0FBVCxDQUFQLEVBQThCdkQsRUFBOUIsQ0FBaUNDLEVBQWpDLENBQW9DdUIsSUFBcEM7QUFDQSxnQkFBTWdDLGVBQWVELFlBQVl6RCxHQUFaLENBQWdCLEtBQWhCLENBQXJCO0FBQ0EsOEJBQU8wRCxhQUFhL0IsU0FBcEIsRUFBK0J6QixFQUEvQixDQUFrQ0MsRUFBbEMsQ0FBcUN1QixJQUFyQztBQUNBLDhCQUFPZ0MsYUFBYVQsS0FBYixDQUFtQixDQUFuQixFQUFzQmhELFFBQXRCLEVBQVAsRUFBeUNDLEVBQXpDLENBQTRDQyxFQUE1QyxDQUErQ0MsR0FBL0MsQ0FBbUQsT0FBbkQ7QUFDQSw4QkFBT3NELGFBQWFULEtBQWIsQ0FBbUIsQ0FBbkIsQ0FBUCxFQUE4Qi9DLEVBQTlCLENBQWlDQyxFQUFqQyxDQUFvQ0MsR0FBcEMsQ0FBd0MsR0FBeEM7QUFDQSw4QkFBT3NELGFBQWF6RCxRQUFiLEVBQVAsRUFBZ0NDLEVBQWhDLENBQW1DQyxFQUFuQyxDQUFzQ0MsR0FBdEMsQ0FBMEMsK0JBQTFDO0FBQ0gsU0FQRDs7QUFTQVIsV0FBRyw4QkFBSCxFQUFtQyxZQUFNO0FBQ3JDLGdCQUFNOEQsZUFBZUQsWUFBWXpELEdBQVosQ0FBZ0IsS0FBaEIsQ0FBckI7QUFDQSw4QkFBTzBELGFBQWFqQyxTQUFwQixFQUErQnZCLEVBQS9CLENBQWtDQyxFQUFsQyxDQUFxQ3VCLElBQXJDO0FBQ0EsOEJBQU9nQyxhQUFhVCxLQUFiLENBQW1CLENBQW5CLENBQVAsRUFBOEIvQyxFQUE5QixDQUFpQ0MsRUFBakMsQ0FBb0NDLEdBQXBDLENBQXdDLHlCQUF4QztBQUNBLDhCQUFPc0QsYUFBYVQsS0FBYixDQUFtQixDQUFuQixDQUFQLEVBQThCL0MsRUFBOUIsQ0FBaUNDLEVBQWpDLENBQW9DQyxHQUFwQyxDQUF3QyxpQkFBeEM7QUFDSCxTQUxEO0FBTUgsS0FsQkQ7O0FBb0JBeUMsYUFBUyxpQkFBVCxFQUE0QixZQUFNO0FBQzlCLFlBQU1jLFVBQVUseUJBQVcsR0FBWCxDQUFoQjtBQUNBLFlBQU1DLFVBQVUsMEJBQVksQ0FBWixDQUFoQjs7QUFFQWhFLFdBQUcseUJBQUgsRUFBOEIsWUFBTTtBQUNoQyxnQkFBTWlFLFdBQVdGLFFBQVEsS0FBUixDQUFqQjtBQUNBLDhCQUFPRSxTQUFTWixLQUFULENBQWUsQ0FBZixDQUFQLEVBQTBCL0MsRUFBMUIsQ0FBNkJDLEVBQTdCLENBQWdDQyxHQUFoQyxDQUFvQyxHQUFwQztBQUNBLDhCQUFPeUQsU0FBU1osS0FBVCxDQUFlLENBQWYsQ0FBUCxFQUEwQi9DLEVBQTFCLENBQTZCQyxFQUE3QixDQUFnQ0MsR0FBaEMsQ0FBb0MsSUFBcEM7QUFDQSw4QkFBT3lELFNBQVNsQyxTQUFoQixFQUEyQnpCLEVBQTNCLENBQThCQyxFQUE5QixDQUFpQ3VCLElBQWpDO0FBQ0gsU0FMRDs7QUFPQTlCLFdBQUcsa0NBQUgsRUFBdUMsWUFBTTtBQUN6QyxnQkFBTWtFLFdBQVdILFFBQVEsS0FBUixDQUFqQjtBQUNBLDhCQUFPRyxTQUFTYixLQUFULENBQWUsQ0FBZixDQUFQLEVBQTBCL0MsRUFBMUIsQ0FBNkJDLEVBQTdCLENBQWdDQyxHQUFoQyxDQUFvQyxZQUFwQztBQUNBLDhCQUFPMEQsU0FBU2IsS0FBVCxDQUFlLENBQWYsQ0FBUCxFQUEwQi9DLEVBQTFCLENBQTZCQyxFQUE3QixDQUFnQ0MsR0FBaEMsQ0FBb0MsaUJBQXBDO0FBQ0EsOEJBQU8wRCxTQUFTckMsU0FBaEIsRUFBMkJ2QixFQUEzQixDQUE4QkMsRUFBOUIsQ0FBaUN1QixJQUFqQztBQUNILFNBTEQ7O0FBT0E5QixXQUFHLDBCQUFILEVBQStCLFlBQU07QUFDakMsZ0JBQU1tRSxXQUFXSCxRQUFRLEtBQVIsQ0FBakI7QUFDQSw4QkFBT0csU0FBU2QsS0FBVCxDQUFlLENBQWYsQ0FBUCxFQUEwQi9DLEVBQTFCLENBQTZCQyxFQUE3QixDQUFnQ0MsR0FBaEMsQ0FBb0MsQ0FBcEM7QUFDQSw4QkFBTzJELFNBQVNkLEtBQVQsQ0FBZSxDQUFmLENBQVAsRUFBMEIvQyxFQUExQixDQUE2QkMsRUFBN0IsQ0FBZ0NDLEdBQWhDLENBQW9DLElBQXBDO0FBQ0EsOEJBQU8yRCxTQUFTcEMsU0FBaEIsRUFBMkJ6QixFQUEzQixDQUE4QkMsRUFBOUIsQ0FBaUN1QixJQUFqQztBQUNILFNBTEQ7O0FBT0E5QixXQUFHLG1DQUFILEVBQXdDLFlBQU07QUFDMUMsZ0JBQU1vRSxXQUFXSixRQUFRLEtBQVIsQ0FBakI7QUFDQSw4QkFBT0ksU0FBU2YsS0FBVCxDQUFlLENBQWYsQ0FBUCxFQUEwQi9DLEVBQTFCLENBQTZCQyxFQUE3QixDQUFnQ0MsR0FBaEMsQ0FBb0MsYUFBcEM7QUFDQSw4QkFBTzRELFNBQVNmLEtBQVQsQ0FBZSxDQUFmLENBQVAsRUFBMEIvQyxFQUExQixDQUE2QkMsRUFBN0IsQ0FBZ0NDLEdBQWhDLENBQW9DLGlCQUFwQztBQUNBLDhCQUFPNEQsU0FBU3ZDLFNBQWhCLEVBQTJCdkIsRUFBM0IsQ0FBOEJDLEVBQTlCLENBQWlDdUIsSUFBakM7QUFDSCxTQUxEO0FBTUgsS0EvQkQ7O0FBaUNBbUIsYUFBUyxnQ0FBVCxFQUEyQyxZQUFNO0FBQzdDLFlBQU1jLFVBQVUseUJBQVcsR0FBWCxDQUFoQjs7QUFFQS9ELFdBQUcseUJBQUgsRUFBOEIsWUFBTTtBQUNoQyxnQkFBTWlFLFdBQVdGLFFBQVEsS0FBUixDQUFqQjtBQUNBLDhCQUFPRSxTQUFTWixLQUFULENBQWUsQ0FBZixDQUFQLEVBQTBCL0MsRUFBMUIsQ0FBNkJDLEVBQTdCLENBQWdDQyxHQUFoQyxDQUFvQyxHQUFwQztBQUNBLDhCQUFPeUQsU0FBU1osS0FBVCxDQUFlLENBQWYsQ0FBUCxFQUEwQi9DLEVBQTFCLENBQTZCQyxFQUE3QixDQUFnQ0MsR0FBaEMsQ0FBb0MsSUFBcEM7QUFDQSw4QkFBT3lELFNBQVNsQyxTQUFoQixFQUEyQnpCLEVBQTNCLENBQThCQyxFQUE5QixDQUFpQ3VCLElBQWpDO0FBQ0gsU0FMRDs7QUFPQTlCLFdBQUcsa0NBQUgsRUFBdUMsWUFBTTtBQUN6QyxnQkFBTWtFLFdBQVdILFFBQVEsS0FBUixDQUFqQjtBQUNBLDhCQUFPRyxTQUFTYixLQUFULENBQWUsQ0FBZixDQUFQLEVBQTBCL0MsRUFBMUIsQ0FBNkJDLEVBQTdCLENBQWdDQyxHQUFoQyxDQUFvQyxZQUFwQztBQUNBLDhCQUFPMEQsU0FBU2IsS0FBVCxDQUFlLENBQWYsQ0FBUCxFQUEwQi9DLEVBQTFCLENBQTZCQyxFQUE3QixDQUFnQ0MsR0FBaEMsQ0FBb0MsaUJBQXBDO0FBQ0EsOEJBQU8wRCxTQUFTckMsU0FBaEIsRUFBMkJ2QixFQUEzQixDQUE4QkMsRUFBOUIsQ0FBaUN1QixJQUFqQztBQUNILFNBTEQ7QUFNSCxLQWhCRDs7QUFrQkFtQixhQUFTLDBCQUFULEVBQXFDLFlBQU07QUFDdkMsWUFBTWMsVUFBVSxvQkFBTSxHQUFOLENBQWhCOztBQUVBL0QsV0FBRyx5QkFBSCxFQUE4QixZQUFNO0FBQ2hDLDhCQUFPLG9CQUFTK0QsT0FBVCxDQUFQLEVBQTBCekQsRUFBMUIsQ0FBNkJDLEVBQTdCLENBQWdDdUIsSUFBaEM7QUFDQSxnQkFBTW1DLFdBQVdGLFFBQVEzRCxHQUFSLENBQVksS0FBWixDQUFqQjtBQUNBLDhCQUFPNkQsU0FBU1osS0FBVCxDQUFlLENBQWYsQ0FBUCxFQUEwQi9DLEVBQTFCLENBQTZCQyxFQUE3QixDQUFnQ0MsR0FBaEMsQ0FBb0MsR0FBcEM7QUFDQSw4QkFBT3lELFNBQVNaLEtBQVQsQ0FBZSxDQUFmLENBQVAsRUFBMEIvQyxFQUExQixDQUE2QkMsRUFBN0IsQ0FBZ0NDLEdBQWhDLENBQW9DLElBQXBDO0FBQ0EsOEJBQU95RCxTQUFTbEMsU0FBaEIsRUFBMkJ6QixFQUEzQixDQUE4QkMsRUFBOUIsQ0FBaUN1QixJQUFqQztBQUNILFNBTkQ7O0FBUUE5QixXQUFHLGtDQUFILEVBQXVDLFlBQU07QUFDekMsZ0JBQU1rRSxXQUFXSCxRQUFRM0QsR0FBUixDQUFZLEtBQVosQ0FBakI7QUFDQSw4QkFBTzhELFNBQVNiLEtBQVQsQ0FBZSxDQUFmLENBQVAsRUFBMEIvQyxFQUExQixDQUE2QkMsRUFBN0IsQ0FBZ0NDLEdBQWhDLENBQW9DLFNBQXBDO0FBQ0EsOEJBQU8wRCxTQUFTYixLQUFULENBQWUsQ0FBZixDQUFQLEVBQTBCL0MsRUFBMUIsQ0FBNkJDLEVBQTdCLENBQWdDQyxHQUFoQyxDQUFvQyxpQkFBcEM7QUFDQSw4QkFBTzBELFNBQVNyQyxTQUFoQixFQUEyQnZCLEVBQTNCLENBQThCQyxFQUE5QixDQUFpQ3VCLElBQWpDO0FBQ0gsU0FMRDtBQU1ILEtBakJEIiwiZmlsZSI6InBhcnNlcnNfdGVzdHMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge2V4cGVjdH0gZnJvbSAnY2hhaSc7XG5pbXBvcnQge1xuICAgIGNoYXJQYXJzZXIsXG4gICAgZGlnaXRQYXJzZXIsXG4gICAgcGNoYXIsXG4gICAgcGRpZ2l0LFxuICAgIGFuZFRoZW4sXG4gICAgb3JFbHNlLFxuICAgIGNob2ljZSxcbiAgICBhbnlPZixcbiAgICBmbWFwLFxuICAgIHJldHVyblAsXG4gICAgYXBwbHlQLFxuICAgIGxpZnQyLFxuICAgIHNlcXVlbmNlUCxcbiAgICBzZXF1ZW5jZVAyLFxuICAgIHBzdHJpbmcsXG4gICAgemVyb09yTW9yZSxcbiAgICBtYW55LFxuICAgIG1hbnkxLFxuICAgIG9wdCxcbiAgICBvcHRCb29rLFxuICAgIGRpc2NhcmRGaXJzdCxcbiAgICBkaXNjYXJkU2Vjb25kLFxuICAgIGJldHdlZW4sXG4gICAgYmV0d2VlblBhcmVucyxcbn0gZnJvbSAncGFyc2Vycyc7XG5pbXBvcnQge1xuICAgIGlzUGFpcixcbiAgICBpc1N1Y2Nlc3MsXG4gICAgaXNGYWlsdXJlLFxuICAgIGlzUGFyc2VyLFxuICAgIGlzU29tZSxcbiAgICBpc05vbmUsXG59IGZyb20gJ3V0aWwnO1xuaW1wb3J0IHtNYXliZX0gZnJvbSAnbWF5YmUnO1xuaW1wb3J0IHtWYWxpZGF0aW9ufSBmcm9tICd2YWxpZGF0aW9uJztcblxuY29uc3QgbG93ZXJjYXNlcyA9IFsnYScsICdiJywgJ2MnLCAnZCcsICdlJywgJ2YnLCAnZycsICdoJywgJ2knLCAnaicsICdrJywgJ2wnLCAnbScsICduJywgJ28nLCAncCcsICdxJywgJ3InLCAncycsICd0JywgJ3UnLCAndicsICd3JywgJ3gnLCAneScsICd6JyxdO1xuY29uc3QgdXBwZXJjYXNlcyA9IFsnQScsICdCJywgJ0MnLCAnRCcsICdFJywgJ0YnLCAnRycsICdIJywgJ0knLCAnSicsICdLJywgJ0wnLCAnTScsICdOJywgJ08nLCAnUCcsICdRJywgJ1InLCAnUycsICdUJywgJ1UnLCAnVicsICdXJywgJ1gnLCAnWScsICdaJyxdO1xuY29uc3QgZGlnaXRzID0gWycwJywgJzEnLCAnMicsICczJywgJzQnLCAnNScsICc2JywgJzcnLCAnOCcsICc5J107XG5jb25zdCB3aGl0ZXMgPSBbJyAnLCAnXFx0JywgJ1xcbicsICdcXHInXTtcblxueGRlc2NyaWJlKCdwYXJzaW5nIHdoaWxlIGRpc2NhcmRpbmcgaW5wdXQnLCAoKSA9PiB7XG4gICAgaXQoJ2FsbG93cyB0byBleGNsdWRlIHBhcmVudGhlc2VzJywgKCkgPT4ge1xuICAgICAgICBjb25zdCBpbnNpZGVQYXJlbnMgPSBwY2hhcignKCcpXG4gICAgICAgICAgICAuZGlzY2FyZEZpcnN0KG1hbnkoYW55T2YobG93ZXJjYXNlcykpKVxuICAgICAgICAgICAgLmRpc2NhcmRTZWNvbmQocGNoYXIoJyknKSk7XG4gICAgICAgIGV4cGVjdChpbnNpZGVQYXJlbnMucnVuKCcobWFyY28pJykudG9TdHJpbmcoKSkudG8uYmUuZXFsKCdbW20sYSxyLGMsb10sXScpO1xuICAgICAgICBleHBlY3QoaW5zaWRlUGFyZW5zLnJ1bignKCknKS50b1N0cmluZygpKS50by5iZS5lcWwoJ1tbXSxdJyk7XG4gICAgfSk7XG4gICAgaXQoJy4uLmV2ZW4gdXNpbmcgYSB0YWlsb3ItbWFkZSBtZXRob2QnLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IGluc2lkZVBhcmVucyA9IGJldHdlZW5QYXJlbnMocHN0cmluZygnbWFyY28nKSk7XG4gICAgICAgIGV4cGVjdChpbnNpZGVQYXJlbnMucnVuKCcobWFyY28pJykudG9TdHJpbmcoKSkudG8uYmUuZXFsKCdbW20sYSxyLGMsb10sXScpO1xuICAgIH0pO1xuICAgIGl0KCdjaGVycnktcGlja2luZyBlbGVtZW50cyBzZXBhcmF0ZWQgYnkgc2VwYXJhdG9ycycsICgpID0+IHtcbiAgICAgICAgY29uc3Qgc3Vic3RyaW5nc1dpdGhDb21tYXMgPSBtYW55KG1hbnkxKGFueU9mKGxvd2VyY2FzZXMpKS5kaXNjYXJkU2Vjb25kKHBjaGFyKCcsJykpKTtcbiAgICAgICAgZXhwZWN0KHN1YnN0cmluZ3NXaXRoQ29tbWFzLnJ1bignYSxiLGNkLDEnKS50b1N0cmluZygpKS50by5iZS5lcWwoJ1tbW2FdLFtiXSxbYyxkXV0sMV0nKTtcbiAgICB9KTtcbiAgICBpdCgnLi4uYWxzbyB3aGVuIGluc2lkZSBhIGxpc3RzJywgKCkgPT4ge1xuICAgICAgICBjb25zdCBzdWJzdHJpbmdzV2l0aENvbW1hcyA9IG1hbnkobWFueTEoYW55T2YobG93ZXJjYXNlcykpLmRpc2NhcmRTZWNvbmQocGNoYXIoJywnKSkpO1xuICAgICAgICBjb25zdCBsaXN0RWxlbWVudHMgPSBiZXR3ZWVuKHBjaGFyKCdbJyksIHN1YnN0cmluZ3NXaXRoQ29tbWFzLCBwY2hhcignXScpKTtcbiAgICAgICAgZXhwZWN0KGxpc3RFbGVtZW50cy5ydW4oJ1thLGIsY2QsbWFyY28sXTEnKS50b1N0cmluZygpKS50by5iZS5lcWwoJ1tbW2FdLFtiXSxbYyxkXSxbbSxhLHIsYyxvXV0sMV0nKTtcbiAgICB9KTtcbn0pO1xuXG54ZGVzY3JpYmUoJ2EgY291cGxlIG9mIHBhcnNlcnMnLCAoKSA9PiB7XG4gICAgaXQoJ2NhbiBkZWNpZGUgdG8gZGlzY2FyZCB0aGUgbWF0Y2hlcyBvZiB0aGUgZmlyc3Qgb25lJywgKCkgPT4ge1xuICAgICAgICBjb25zdCBkaXNjYXJkSW50ZWdlclNpZ24gPSBwY2hhcignLScpLmRpc2NhcmRGaXJzdChwZGlnaXQoOCkpO1xuICAgICAgICBsZXQgcGFyc2luZyA9IGRpc2NhcmRJbnRlZ2VyU2lnbi5ydW4oJy04eCcpO1xuICAgICAgICBleHBlY3QocGFyc2luZy50b1N0cmluZygpKS50by5iZS5lcWwoJ1s4LHhdJyk7XG4gICAgfSk7XG4gICAgaXQoJ2NhbiBkZWNpZGUgdG8gZGlzY2FyZCB0aGUgbWF0Y2hlcyBvZiB0aGUgc2Vjb25kIG9uZScsICgpID0+IHtcbiAgICAgICAgY29uc3QgZGlzY2FyZFN1ZmZpeCA9IHBzdHJpbmcoJ21hcmNvJykuZGlzY2FyZFNlY29uZChtYW55MShhbnlPZih3aGl0ZXMpKSk7XG4gICAgICAgIGxldCBwYXJzaW5nID0gZGlzY2FyZFN1ZmZpeC5ydW4oJ21hcmNvIGZhdXN0aW5lbGxpJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgnW1ttLGEscixjLG9dLGZhdXN0aW5lbGxpXScpO1xuICAgICAgICBwYXJzaW5nID0gZGlzY2FyZFN1ZmZpeC5ydW4oJ21hcmNvICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmYXVzdGluZWxsaScpO1xuICAgICAgICBleHBlY3QocGFyc2luZy50b1N0cmluZygpKS50by5iZS5lcWwoJ1tbbSxhLHIsYyxvXSxmYXVzdGluZWxsaV0nKTtcbiAgICB9KTtcbn0pO1xuXG54ZGVzY3JpYmUoJ2EgcGFyc2VyIGZvciBvcHRpb25hbCBjaGFyYWN0ZXJzJywgKCkgPT4ge1xuICAgIGl0KCdjYW4gY2FwdHVyZSBvciBub3QgY2FwdHVyZSBhIGRvdCcsICgpID0+IHtcbiAgICAgICAgY29uc3Qgb3B0RG90VGhlbkEgPSBvcHQocGNoYXIoJy4nKSkuYW5kVGhlbihwY2hhcignYScpKTtcbiAgICAgICAgZXhwZWN0KG9wdERvdFRoZW5BLnJ1bignLmFiYycpLnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgnW1tzb21lKC4pLGFdLGJjXScpO1xuICAgICAgICBleHBlY3Qob3B0RG90VGhlbkEucnVuKCdhYmMnKS50b1N0cmluZygpKS50by5iZS5lcWwoJ1tbbm9uZSgpLGFdLGJjXScpO1xuICAgIH0pO1xuICAgIGl0KCdjYW4gcGFyc2UgU0lHTkVEIGludGVnZXJzISEhJywgKCkgPT4ge1xuICAgICAgICBjb25zdCBwaW50ID0gbWFueTEoYW55T2YoZGlnaXRzKSlcbiAgICAgICAgICAgIC5mbWFwKGwgPT4gcGFyc2VJbnQobC5yZWR1Y2UoKGFjYywgY3VycikgPT4gYWNjICsgY3VyciwgJycpLCAxMCkpO1xuICAgICAgICBjb25zdCBwU2lnbmVkSW50ID0gb3B0KHBjaGFyKCctJykpXG4gICAgICAgICAgICAuYW5kVGhlbihwaW50KVxuICAgICAgICAgICAgLmZtYXAoKFttYXliZVNpZ24sIG51bWJlcl0pID0+IChNYXliZS5pc0p1c3QobWF5YmVTaWduKSkgPyAtbnVtYmVyIDogbnVtYmVyKTtcbiAgICAgICAgZXhwZWN0KHBTaWduZWRJbnQucnVuKCcxMzI0MzU0NngnKVswXSkudG8uYmUuZXFsKDEzMjQzNTQ2KTtcbiAgICAgICAgZXhwZWN0KHBTaWduZWRJbnQucnVuKCctMTMyNDM1NDZ4JylbMF0pLnRvLmJlLmVxbCgtMTMyNDM1NDYpO1xuICAgIH0pO1xuICAgIGl0KCdjYW4gY2FwdHVyZSBvciBub3QgY2FwdHVyZSBhIHdob2xlIHN1YnN0cmluZycsICgpID0+IHtcbiAgICAgICAgY29uc3Qgb3B0U3Vic3RyaW5nID0gb3B0KHBzdHJpbmcoJ21hcmNvJykpLmFuZFRoZW4ocHN0cmluZygnZmF1c3RpbmVsbGknKSk7XG4gICAgICAgIGV4cGVjdChvcHRTdWJzdHJpbmcucnVuKCdtYXJjb2ZhdXN0aW5lbGxpeCcpLnRvU3RyaW5nKCkpXG4gICAgICAgICAgICAudG8uYmUuZXFsKCdbW3NvbWUoW20sYSxyLGMsb10pLFtmLGEsdSxzLHQsaSxuLGUsbCxsLGldXSx4XScpO1xuICAgICAgICBleHBlY3Qob3B0U3Vic3RyaW5nLnJ1bignZmF1c3RpbmVsbGl4JykudG9TdHJpbmcoKSlcbiAgICAgICAgICAgIC50by5iZS5lcWwoJ1tbbm9uZSgpLFtmLGEsdSxzLHQsaSxuLGUsbCxsLGldXSx4XScpO1xuICAgIH0pO1xufSk7XG5cbnhkZXNjcmliZSgnYSBwYXJzZXIgZm9yIG9uZSBvciBtb3JlIG9jY3VycmVuY2VzJywgKCkgPT4ge1xuICAgIGl0KCdjYW5ub3QgcGFyc2UgYSBjaGFyIHplcm8gdGltZXMnLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IG9uZU9yTW9yZVBhcnNlciA9IG1hbnkxKHBjaGFyKCdtJykpO1xuICAgICAgICBsZXQgcGFyc2luZyA9IG9uZU9yTW9yZVBhcnNlci5ydW4oJ2FyY28nKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcuaXNGYWlsdXJlKS50by5iZS50cnVlO1xuICAgICAgICBleHBlY3QocGFyc2luZy50b1N0cmluZygpKS50by5iZS5lcWwoJ1ttYW55MSBwY2hhcl9tLHdhbnRlZCBtOyBnb3QgYV0nKTtcbiAgICB9KTtcbiAgICBpdCgnY2FuIHBhcnNlIGEgY2hhciBtYW55IHRpbWVzJywgKCkgPT4ge1xuICAgICAgICBjb25zdCBvbmVPck1vcmVQYXJzZXIgPSBtYW55MShwY2hhcignbScpKTtcbiAgICAgICAgbGV0IHBhcnNpbmcgPSBvbmVPck1vcmVQYXJzZXIucnVuKCdtbW1hcmNvJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcudG9TdHJpbmcoKSkudG8uYmUuZXFsKCdbW20sbSxtXSxhcmNvXScpO1xuICAgIH0pO1xuICAgIGl0KCdjYW5ub3QgcGFyc2UgYSBjaGFyIHNlcXVlbmNlIHplcm8gdGltZXMnLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IG9uZU9yTW9yZVBhcnNlciA9IG1hbnkxKHBzdHJpbmcoJ21hcmNvJykpO1xuICAgICAgICBsZXQgcGFyc2luZyA9IG9uZU9yTW9yZVBhcnNlci5ydW4oJ3htYXJjb21hcmNvY2lhbycpO1xuICAgICAgICBleHBlY3QocGFyc2luZy5pc0ZhaWx1cmUpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgnW21hbnkxIHBzdHJpbmcgbWFyY28sd2FudGVkIG07IGdvdCB4XScpO1xuICAgIH0pO1xuICAgIGl0KCdjYW4gcGFyc2UgYSBjaGFyIHNlcXVlbmNlIG1hbnkgdGltZXMnLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IG9uZU9yTW9yZVBhcnNlciA9IG1hbnkxKHBzdHJpbmcoJ21hcmNvJykpO1xuICAgICAgICBsZXQgcGFyc2luZyA9IG9uZU9yTW9yZVBhcnNlci5ydW4oJ21hcmNvbWFyY29jaWFvJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcudG9TdHJpbmcoKSkudG8uYmUuZXFsKCdbW1ttLGEscixjLG9dLFttLGEscixjLG9dXSxjaWFvXScpO1xuICAgIH0pO1xuICAgIGl0KCdjYW4gcGFyc2UgYW4gaW50ZWdlciwgbm8gbWF0dGVyIGhvdyBsYXJnZS4uLicsICgpID0+IHtcbiAgICAgICAgY29uc3QgcGludCA9IG1hbnkxKGFueU9mKGRpZ2l0cykpO1xuICAgICAgICBsZXQgcGFyc2luZyA9IHBpbnQucnVuKCcxMjM0NUEnKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcuaXNTdWNjZXNzKS50by5iZS50cnVlO1xuICAgICAgICBleHBlY3QocGFyc2luZy50b1N0cmluZygpKS50by5iZS5lcWwoJ1tbMSwyLDMsNCw1XSxBXScpO1xuICAgICAgICBwYXJzaW5nID0gcGludC5ydW4oJzFCJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcudG9TdHJpbmcoKSkudG8uYmUuZXFsKCdbWzFdLEJdJyk7XG4gICAgICAgIHBhcnNpbmcgPSBwaW50LnJ1bignQTEyMzQ1Jyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLmlzRmFpbHVyZSkudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcudG9TdHJpbmcoKSkudG8uYmUuZXFsKCdbbWFueTEgYW55T2YgMDEyMzQ1Njc4OSxfZmFpbF0nKTtcbiAgICB9KTtcbiAgICBpdCgnY2FuIHBhcnNlIGFuIGludGVnZXIgaW50byBhIHRydWUgaW50ZWdlcicsICgpID0+IHtcbiAgICAgICAgY29uc3QgcGludCA9IG1hbnkxKGFueU9mKGRpZ2l0cykpXG4gICAgICAgICAgICAuZm1hcChsID0+IHBhcnNlSW50KGwucmVkdWNlKChhY2MsIGN1cnIpID0+IGFjYyArIGN1cnIsICcnKSwgMTApKTtcbiAgICAgICAgbGV0IHBhcnNpbmcgPSBwaW50LnJ1bignMTIzNDVBJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdbMF0pLnRvLmJlLmVxbCgxMjM0NSk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nWzFdKS50by5iZS5lcWwoJ0EnKTtcbiAgICB9KTtcbn0pO1xuXG54ZGVzY3JpYmUoJ2EgcGFyc2VyIGZvciB6ZXJvIG9yIG1vcmUgb2NjdXJyZW5jZXMnLCAoKSA9PiB7XG4gICAgaXQoJ2NhbiBwYXJzZSBhIGNoYXIgemVybyB0aW1lcycsICgpID0+IHtcbiAgICAgICAgY29uc3QgemVyb09yTW9yZVBhcnNlciA9IG1hbnkocGNoYXIoJ20nKSk7XG4gICAgICAgIGxldCBwYXJzaW5nID0gemVyb09yTW9yZVBhcnNlci5ydW4oJ2FyY28nKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcuaXNTdWNjZXNzKS50by5iZS50cnVlO1xuICAgICAgICBleHBlY3QocGFyc2luZy50b1N0cmluZygpKS50by5iZS5lcWwoJ1tbXSxhcmNvXScpO1xuICAgIH0pO1xuICAgIGl0KCdjYW4gcGFyc2UgYSBjaGFyIG1hbnkgdGltZXMnLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHplcm9Pck1vcmVQYXJzZXIgPSBtYW55KHBjaGFyKCdtJykpO1xuICAgICAgICBsZXQgcGFyc2luZyA9IHplcm9Pck1vcmVQYXJzZXIucnVuKCdtbW1hcmNvJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcudG9TdHJpbmcoKSkudG8uYmUuZXFsKCdbW20sbSxtXSxhcmNvXScpO1xuICAgIH0pO1xuICAgIGl0KCdjYW4gcGFyc2UgYSBjaGFyIHNlcXVlbmNlIHplcm8gdGltZXMnLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHplcm9Pck1vcmVQYXJzZXIgPSBtYW55KHBzdHJpbmcoJ21hcmNvJykpO1xuICAgICAgICBsZXQgcGFyc2luZyA9IHplcm9Pck1vcmVQYXJzZXIucnVuKCd4bWFyY29tYXJjb2NpYW8nKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcuaXNTdWNjZXNzKS50by5iZS50cnVlO1xuICAgICAgICBleHBlY3QocGFyc2luZy50b1N0cmluZygpKS50by5iZS5lcWwoJ1tbXSx4bWFyY29tYXJjb2NpYW9dJyk7XG4gICAgfSk7XG4gICAgaXQoJ2NhbiBwYXJzZSBhIGNoYXIgc2VxdWVuY2UgbWFueSB0aW1lcycsICgpID0+IHtcbiAgICAgICAgY29uc3QgemVyb09yTW9yZVBhcnNlciA9IG1hbnkocHN0cmluZygnbWFyY28nKSk7XG4gICAgICAgIGxldCBwYXJzaW5nID0gemVyb09yTW9yZVBhcnNlci5ydW4oJ21hcmNvbWFyY29jaWFvJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcudG9TdHJpbmcoKSkudG8uYmUuZXFsKCdbW1ttLGEscixjLG9dLFttLGEscixjLG9dXSxjaWFvXScpO1xuICAgIH0pO1xuICAgIGl0KCdjYW4gcGFyc2Ugd2hpdGVzcGFjZXMhIScsICgpID0+IHtcbiAgICAgICAgY29uc3Qgd2hpdGVzUGFyc2VyID0gbWFueShhbnlPZih3aGl0ZXMpKTtcbiAgICAgICAgY29uc3QgdHdvV29yZHMgPSBzZXF1ZW5jZVAoW3BzdHJpbmcoJ2NpYW8nKSwgd2hpdGVzUGFyc2VyLCBwc3RyaW5nKCdtYW1tYScpXSk7XG4gICAgICAgIGxldCBwYXJzaW5nID0gdHdvV29yZHMucnVuKCdjaWFvbWFtbWFYJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgnW1tbYyxpLGEsb10sW10sW20sYSxtLG0sYV1dLFhdJyk7XG4gICAgICAgIHBhcnNpbmcgPSB0d29Xb3Jkcy5ydW4oJ2NpYW8gbWFtbWFYJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgnW1tbYyxpLGEsb10sWyBdLFttLGEsbSxtLGFdXSxYXScpO1xuICAgICAgICBwYXJzaW5nID0gdHdvV29yZHMucnVuKCdjaWFvICAgbWFtbWFYJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgnW1tbYyxpLGEsb10sWyAsICwgXSxbbSxhLG0sbSxhXV0sWF0nKTtcbiAgICAgICAgcGFyc2luZyA9IHR3b1dvcmRzLnJ1bignY2lhbyBcXHQgbWFtbWFYJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgnW1tbYyxpLGEsb10sWyAsXFx0LCBdLFttLGEsbSxtLGFdXSxYXScpO1xuICAgIH0pO1xufSk7XG5cbnhkZXNjcmliZSgnYSBwYXJzaW5nIGZ1bmN0aW9uIGZvciB6ZXJvIG9yIG1vcmUgb2NjdXJyZW5jZXMnLCAoKSA9PiB7XG4gICAgaXQoJ2NhbiBwYXJzZSBhIGNoYXIgemVybyB0aW1lcycsICgpID0+IHtcbiAgICAgICAgY29uc3QgemVyb09yTW9yZVBhcnNpbmdGdW5jdGlvbiA9IHplcm9Pck1vcmUocGNoYXIoJ20nKSk7XG4gICAgICAgIGxldCBwYXJzaW5nID0gemVyb09yTW9yZVBhcnNpbmdGdW5jdGlvbignYXJjbycpO1xuICAgICAgICBleHBlY3QocGFyc2luZy5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgnW1tdLGFyY29dJyk7XG4gICAgfSk7XG4gICAgaXQoJ2NhbiBwYXJzZSBhIGNoYXIgbWFueSB0aW1lcycsICgpID0+IHtcbiAgICAgICAgY29uc3QgemVyb09yTW9yZVBhcnNpbmdGdW5jdGlvbiA9IHplcm9Pck1vcmUocGNoYXIoJ20nKSk7XG4gICAgICAgIGxldCBwYXJzaW5nID0gemVyb09yTW9yZVBhcnNpbmdGdW5jdGlvbignbW1tYXJjbycpO1xuICAgICAgICBleHBlY3QocGFyc2luZy5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgnW1ttLG0sbV0sYXJjb10nKTtcbiAgICB9KTtcbiAgICBpdCgnY2FuIHBhcnNlIGEgY2hhciBzZXF1ZW5jZSB6ZXJvIHRpbWVzJywgKCkgPT4ge1xuICAgICAgICBjb25zdCB6ZXJvT3JNb3JlUGFyc2luZ0Z1bmN0aW9uID0gemVyb09yTW9yZShwc3RyaW5nKCdtYXJjbycpKTtcbiAgICAgICAgbGV0IHBhcnNpbmcgPSB6ZXJvT3JNb3JlUGFyc2luZ0Z1bmN0aW9uKCd4bWFyY29tYXJjb2NpYW8nKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcuaXNTdWNjZXNzKS50by5iZS50cnVlO1xuICAgICAgICBleHBlY3QocGFyc2luZy50b1N0cmluZygpKS50by5iZS5lcWwoJ1tbXSx4bWFyY29tYXJjb2NpYW9dJyk7XG4gICAgfSk7XG4gICAgaXQoJ2NhbiBwYXJzZSBhIGNoYXIgc2VxdWVuY2UgbWFueSB0aW1lcycsICgpID0+IHtcbiAgICAgICAgY29uc3QgemVyb09yTW9yZVBhcnNpbmdGdW5jdGlvbiA9IHplcm9Pck1vcmUocHN0cmluZygnbWFyY28nKSk7XG4gICAgICAgIGxldCBwYXJzaW5nID0gemVyb09yTW9yZVBhcnNpbmdGdW5jdGlvbignbWFyY29tYXJjb2NpYW8nKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcuaXNTdWNjZXNzKS50by5iZS50cnVlO1xuICAgICAgICBleHBlY3QocGFyc2luZy50b1N0cmluZygpKS50by5iZS5lcWwoJ1tbW20sYSxyLGMsb10sW20sYSxyLGMsb11dLGNpYW9dJyk7XG4gICAgfSk7XG59KTtcblxueGRlc2NyaWJlKCdhIHBhcnNlciBmb3IgYSBzcGVjaWZpYyB3b3JkJywgKCkgPT4ge1xuICAgIGl0KCdpcyBlYXN5IHRvIGNyZWF0ZSB3aXRoIHNlcXVlbmNlUCcsICgpID0+IHtcbiAgICAgICAgY29uc3QgbWFyY29QYXJzZXIgPSBwc3RyaW5nKCdtYXJjbycpO1xuICAgICAgICBjb25zdCBtYXJjb1BhcnNpbmcgPSBtYXJjb1BhcnNlci5ydW4oJ21hcmNvY2lhbycpO1xuICAgICAgICBleHBlY3QoaXNTdWNjZXNzKG1hcmNvUGFyc2luZykpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChtYXJjb1BhcnNpbmcudG9TdHJpbmcoKSkudG8uYmUuZXFsKCdbW20sYSxyLGMsb10sY2lhb10nKTtcbiAgICB9KTtcbn0pO1xuXG54ZGVzY3JpYmUoJ3NlcXVlbmNlcyBvZiBwYXJzZXJzIGJhc2VkIG9uIGxpZnQyKGNvbnMpIChha2Egc2VxdWVuY2VQKScsICgpID0+IHtcbiAgICBpdCgnc3RvcmVzIG1hdGNoZWQgY2hhcnMgaW5zaWRlIGFuIGFycmF5JywgKCkgPT4ge1xuICAgICAgICBjb25zdCBhYmNQYXJzZXIgPSBzZXF1ZW5jZVAoW3BjaGFyKCdhJyksIHBjaGFyKCdiJyksIHBjaGFyKCdjJyksXSk7XG4gICAgICAgIGV4cGVjdChhYmNQYXJzZXIucnVuKCdhYmMnKS50b1N0cmluZygpKS50by5iZS5lcWwoJ1tbYSxiLGNdLF0nKTtcbiAgICB9KTtcbn0pO1xuXG54ZGVzY3JpYmUoJ3NlcXVlbmNlcyBvZiBwYXJzZXJzIGJhc2VkIG9uIGFuZFRoZW4gJiYgZm1hcCAoYWthIHNlcXVlbmNlUDIpJywgKCkgPT4ge1xuICAgIGl0KCdzdG9yZSBtYXRjaGVkIGNoYXJzIGluc2lkZSBhIHBsYWluIHN0cmluZycsICgpID0+IHtcbiAgICAgICAgY29uc3QgYWJjUGFyc2VyID0gc2VxdWVuY2VQMihbcGNoYXIoJ2EnKSwgcGNoYXIoJ2InKSwgcGNoYXIoJ2MnKSxdKTtcbiAgICAgICAgZXhwZWN0KGFiY1BhcnNlci5ydW4oJ2FiYycpLnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgnW2FiYyxdJyk7XG4gICAgfSk7XG59KTtcblxueGRlc2NyaWJlKCdsaWZ0MiBmb3IgcGFyc2VycycsICgpID0+IHtcbiAgICBpdCgnb3BlcmF0ZXMgb24gdGhlIHJlc3VsdHMgb2YgdHdvIHN0cmluZyBwYXJzaW5ncycsICgpID0+IHtcbiAgICAgICAgY29uc3QgYWRkU3RyaW5ncyA9IHggPT4geSA9PiB4ICsgJysnICsgeTtcbiAgICAgICAgY29uc3QgQXBsdXNCID0gbGlmdDIoYWRkU3RyaW5ncykocGNoYXIoJ2EnKSkocGNoYXIoJ2InKSk7XG4gICAgICAgIGV4cGVjdChBcGx1c0IucnVuKCdhYmMnKS50b1N0cmluZygpKS50by5iZS5lcWwoJ1thK2IsY10nKTtcbiAgICB9KTtcbiAgICBpdCgnYWRkcyB0aGUgcmVzdWx0cyBvZiB0d28gZGlnaXQgcGFyc2luZ3MnLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IGFkZERpZ2l0cyA9IHggPT4geSA9PiB4ICsgeTtcbiAgICAgICAgY29uc3QgYWRkUGFyc2VyID0gbGlmdDIoYWRkRGlnaXRzKShwZGlnaXQoMSkpKHBkaWdpdCgyKSk7XG4gICAgICAgIGV4cGVjdChhZGRQYXJzZXIucnVuKCcxMjM0JykudG9TdHJpbmcoKSkudG8uYmUuZXFsKCdbMywzNF0nKTtcbiAgICAgICAgZXhwZWN0KGFkZFBhcnNlci5ydW4oJzE0NCcpLmlzRmFpbHVyZSkudG8uYmUudHJ1ZTtcbiAgICB9KTtcbn0pO1xuXG54ZGVzY3JpYmUoJ3BhcnNlIDMgZGlnaXRzJywgKCkgPT4ge1xuICAgIGxldCBwYXJzZURpZ2l0LCB0aHJlZURpZ2l0cywgcGFyc2luZztcbiAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgICAgcGFyc2VEaWdpdCA9IGFueU9mKGRpZ2l0cyk7XG4gICAgICAgIHRocmVlRGlnaXRzID0gYW5kVGhlbihwYXJzZURpZ2l0LCBhbmRUaGVuKHBhcnNlRGlnaXQsIHBhcnNlRGlnaXQpKTtcbiAgICAgICAgcGFyc2luZyA9IHRocmVlRGlnaXRzLnJ1bignMTIzJyk7XG4gICAgfSk7XG4gICAgaXQoJ3BhcnNlcyBhbnkgb2YgdGhyZWUgZGlnaXRzJywgKCkgPT4ge1xuICAgICAgICBleHBlY3QocGFyc2luZy5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nWzBdLnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgnWzEsWzIsM11dJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nWzFdKS50by5iZS5lcWwoJycpO1xuICAgIH0pO1xuICAgIHhkZXNjcmliZSgncGFyc2VzIGFueSBvZiB0aHJlZSBkaWdpdHMgd2hpbGUgc2hvd2Nhc2luZyBmbWFwJywgKCkgPT4ge1xuICAgICAgICBpdCgnYXMgZ2xvYmFsIG1ldGhvZCcsICgpID0+IHtcbiAgICAgICAgICAgIHRocmVlRGlnaXRzID0gZm1hcCgoW3gsIFt5LCB6XV0pID0+IFt4LCB5LCB6XSwgdGhyZWVEaWdpdHMpO1xuICAgICAgICAgICAgbGV0IHBhcnNpbmcgPSB0aHJlZURpZ2l0cy5ydW4oJzEyMycpO1xuICAgICAgICAgICAgZXhwZWN0KHBhcnNpbmcuaXNTdWNjZXNzKS50by5iZS50cnVlO1xuICAgICAgICAgICAgZXhwZWN0KHBhcnNpbmdbMF0udG9TdHJpbmcoKSkudG8uYmUuZXFsKCdbMSwyLDNdJyk7XG4gICAgICAgICAgICBleHBlY3QocGFyc2luZ1sxXSkudG8uYmUuZXFsKCcnKTtcbiAgICAgICAgfSk7XG4gICAgICAgIGl0KCdhcyBpbnN0YW5jZSBtZXRob2QnLCAoKSA9PiB7XG4gICAgICAgICAgICB0aHJlZURpZ2l0cyA9IHRocmVlRGlnaXRzLmZtYXAoKFt4LCBbeSwgel1dKSA9PiBbeCwgeSwgel0pO1xuICAgICAgICAgICAgbGV0IHBhcnNpbmcgPSB0aHJlZURpZ2l0cy5ydW4oJzEyMycpO1xuICAgICAgICAgICAgZXhwZWN0KHBhcnNpbmcuaXNTdWNjZXNzKS50by5iZS50cnVlO1xuICAgICAgICAgICAgZXhwZWN0KHBhcnNpbmdbMF0udG9TdHJpbmcoKSkudG8uYmUuZXFsKCdbMSwyLDNdJyk7XG4gICAgICAgICAgICBleHBlY3QocGFyc2luZ1sxXSkudG8uYmUuZXFsKCcnKTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG59KTtcblxuZGVzY3JpYmUoJ3BhcnNlIEFCQycsICgpID0+IHtcbi8vICAgIGNvbnN0IHBhaXJBZGRlciA9IHBhaXIgPT4gcGFpci52YWx1ZVswXSArIHBhaXIudmFsdWVbMV07XG4gICAgaXQoJ3BhcnNlcyBBQkMnLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHBhaXJBZGRlciA9IHBhaXIgPT4gcGFpclswXSArIHBhaXJbMV07XG4gICAgICAgIGNvbnN0IGFiY1AgPSBhbmRUaGVuKHBjaGFyKCdhJyksXG4gICAgICAgICAgICBhbmRUaGVuKHBjaGFyKCdiJyksXG4gICAgICAgICAgICAgICAgYW5kVGhlbihwY2hhcignYycpLCByZXR1cm5QKCcnKSkuZm1hcChwYWlyQWRkZXIpXG4gICAgICAgICAgICApLmZtYXAocGFpckFkZGVyKVxuICAgICAgICApLmZtYXAocGFpckFkZGVyKTtcbiAgICAgICAgY29uc3QgcGFyc2luZyA9IGFiY1AucnVuKCdhYmNkJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcudmFsdWVbMF0udG9TdHJpbmcoKSkudG8uYmUuZXFsKCdhYmMnKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcudmFsdWVbMV0pLnRvLmJlLmVxbCgnZCcpO1xuICAgIH0pO1xufSk7XG5cbmRlc2NyaWJlKCdhIHBhcnNlcnMgZm9yIGFueSBvZiBhIGxpc3Qgb2YgY2hhcnMnLCAoKSA9PiB7XG5cbiAgICBpdCgnY2FuIHBhcnNlIGFueSBsb3dlcmNhc2UgY2hhcicsICgpID0+IHtcbiAgICAgICAgY29uc3QgbG93ZXJjYXNlc1BhcnNlciA9IGFueU9mKGxvd2VyY2FzZXMpO1xuXG4gICAgICAgIGV4cGVjdChpc1BhcnNlcihsb3dlcmNhc2VzUGFyc2VyKSkudG8uYmUudHJ1ZTtcbiAgICAgICAgbGV0IHBhcnNpbmdDaG9pY2UgPSBsb3dlcmNhc2VzUGFyc2VyLnJ1bignYScpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLnZhbHVlWzBdKS50by5iZS5lcWwoJ2EnKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UudmFsdWVbMV0pLnRvLmJlLmVxbCgnJyk7XG4gICAgICAgIHBhcnNpbmdDaG9pY2UgPSBsb3dlcmNhc2VzUGFyc2VyLnJ1bignYicpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLnZhbHVlWzBdKS50by5iZS5lcWwoJ2InKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UudmFsdWVbMV0pLnRvLmJlLmVxbCgnJyk7XG4gICAgICAgIHBhcnNpbmdDaG9pY2UgPSBsb3dlcmNhc2VzUGFyc2VyLnJ1bignZCcpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLnZhbHVlWzBdKS50by5iZS5lcWwoJ2QnKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UudmFsdWVbMV0pLnRvLmJlLmVxbCgnJyk7XG4gICAgICAgIHBhcnNpbmdDaG9pY2UgPSBsb3dlcmNhc2VzUGFyc2VyLnJ1bigneicpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLnZhbHVlWzBdKS50by5iZS5lcWwoJ3onKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UudmFsdWVbMV0pLnRvLmJlLmVxbCgnJyk7XG5cbiAgICAgICAgcGFyc2luZ0Nob2ljZSA9IGxvd2VyY2FzZXNQYXJzZXIucnVuKCdZJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLmlzRmFpbHVyZSkudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UudmFsdWVbMF0pLnRvLmJlLmVxbCgnYW55T2YgYWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXonKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UudmFsdWVbMV0pLnRvLmJlLmVxbCgnX2ZhaWwnKTtcbiAgICB9KTtcblxuICAgIGl0KCdjYW4gcGFyc2UgYW55IHVwcGVyY2FzZSBjaGFyJywgKCkgPT4ge1xuICAgICAgICBsZXQgdXBwZXJjYXNlc1BhcnNlciA9IGFueU9mKHVwcGVyY2FzZXMpO1xuXG4gICAgICAgIGV4cGVjdChpc1BhcnNlcih1cHBlcmNhc2VzUGFyc2VyKSkudG8uYmUudHJ1ZTtcbiAgICAgICAgbGV0IHBhcnNpbmdDaG9pY2UgPSB1cHBlcmNhc2VzUGFyc2VyLnJ1bignQScpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLnZhbHVlWzBdKS50by5iZS5lcWwoJ0EnKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UudmFsdWVbMV0pLnRvLmJlLmVxbCgnJyk7XG4gICAgICAgIHBhcnNpbmdDaG9pY2UgPSB1cHBlcmNhc2VzUGFyc2VyLnJ1bignQicpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLnZhbHVlWzBdKS50by5iZS5lcWwoJ0InKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UudmFsdWVbMV0pLnRvLmJlLmVxbCgnJyk7XG4gICAgICAgIHBhcnNpbmdDaG9pY2UgPSB1cHBlcmNhc2VzUGFyc2VyLnJ1bignUicpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLnZhbHVlWzBdKS50by5iZS5lcWwoJ1InKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UudmFsdWVbMV0pLnRvLmJlLmVxbCgnJyk7XG4gICAgICAgIHBhcnNpbmdDaG9pY2UgPSB1cHBlcmNhc2VzUGFyc2VyLnJ1bignWicpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLnZhbHVlWzBdKS50by5iZS5lcWwoJ1onKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UudmFsdWVbMV0pLnRvLmJlLmVxbCgnJyk7XG5cbiAgICAgICAgcGFyc2luZ0Nob2ljZSA9IHVwcGVyY2FzZXNQYXJzZXIucnVuKCdzJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLmlzRmFpbHVyZSkudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UudmFsdWVbMF0pLnRvLmJlLmVxbCgnYW55T2YgQUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVonKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UudmFsdWVbMV0pLnRvLmJlLmVxbCgnX2ZhaWwnKTtcbiAgICB9KTtcblxuICAgIGl0KCdjYW4gcGFyc2UgYW55IGRpZ2l0JywgKCkgPT4ge1xuICAgICAgICBsZXQgZGlnaXRzUGFyc2VyID0gYW55T2YoZGlnaXRzKTtcblxuICAgICAgICBleHBlY3QoaXNQYXJzZXIoZGlnaXRzUGFyc2VyKSkudG8uYmUudHJ1ZTtcbiAgICAgICAgbGV0IHBhcnNpbmdDaG9pY2UgPSBkaWdpdHNQYXJzZXIucnVuKCcxJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UudmFsdWVbMF0pLnRvLmJlLmVxbCgnMScpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS52YWx1ZVsxXSkudG8uYmUuZXFsKCcnKTtcbiAgICAgICAgcGFyc2luZ0Nob2ljZSA9IGRpZ2l0c1BhcnNlci5ydW4oJzMnKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UuaXNTdWNjZXNzKS50by5iZS50cnVlO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS52YWx1ZVswXSkudG8uYmUuZXFsKCczJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLnZhbHVlWzFdKS50by5iZS5lcWwoJycpO1xuICAgICAgICBwYXJzaW5nQ2hvaWNlID0gZGlnaXRzUGFyc2VyLnJ1bignMCcpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLnZhbHVlWzBdKS50by5iZS5lcWwoJzAnKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UudmFsdWVbMV0pLnRvLmJlLmVxbCgnJyk7XG4gICAgICAgIHBhcnNpbmdDaG9pY2UgPSBkaWdpdHNQYXJzZXIucnVuKCc4Jyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UudmFsdWVbMF0pLnRvLmJlLmVxbCgnOCcpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS52YWx1ZVsxXSkudG8uYmUuZXFsKCcnKTtcblxuICAgICAgICBwYXJzaW5nQ2hvaWNlID0gZGlnaXRzUGFyc2VyLnJ1bigncycpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS5pc0ZhaWx1cmUpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLnZhbHVlWzBdKS50by5iZS5lcWwoJ2FueU9mIDAxMjM0NTY3ODknKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UudmFsdWVbMV0pLnRvLmJlLmVxbCgnX2ZhaWwnKTtcbiAgICB9KTtcbn0pO1xuXG5kZXNjcmliZSgnYSBjaG9pY2Ugb2YgcGFyc2VycyBib3VuZCBieSBvckVsc2UnLCAoKSA9PiB7XG4gICAgY29uc3QgcGFyc2Vyc0Nob2ljZSA9IGNob2ljZShbcGNoYXIoJ2EnKSwgcGNoYXIoJ2InKSwgcGNoYXIoJ2MnKSwgcGNoYXIoJ2QnKSxdKTtcblxuICAgIGl0KCdjYW4gcGFyc2Ugb25lIG9mIGZvdXIgY2hhcnMnLCAoKSA9PiB7XG4gICAgICAgIGV4cGVjdChpc1BhcnNlcihwYXJzZXJzQ2hvaWNlKSkudG8uYmUudHJ1ZTtcbiAgICAgICAgbGV0IHBhcnNpbmdDaG9pY2UgPSBwYXJzZXJzQ2hvaWNlLnJ1bignYScpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLnZhbHVlWzBdKS50by5iZS5lcWwoJ2EnKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UudmFsdWVbMV0pLnRvLmJlLmVxbCgnJyk7XG4gICAgICAgIHBhcnNpbmdDaG9pY2UgPSBwYXJzZXJzQ2hvaWNlLnJ1bignYicpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLnZhbHVlWzBdKS50by5iZS5lcWwoJ2InKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UudmFsdWVbMV0pLnRvLmJlLmVxbCgnJyk7XG4gICAgICAgIHBhcnNpbmdDaG9pY2UgPSBwYXJzZXJzQ2hvaWNlLnJ1bignZCcpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLnZhbHVlWzBdKS50by5iZS5lcWwoJ2QnKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UudmFsdWVbMV0pLnRvLmJlLmVxbCgnJyk7XG4gICAgfSk7XG5cbiAgICBpdCgnY2FuIGFsc28gcGFyc2UgTk9ORSBvZiBmb3VyIGNoYXJzJywgKCkgPT4ge1xuICAgICAgICBjb25zdCBwYXJzaW5nQ2hvaWNlID0gcGFyc2Vyc0Nob2ljZS5ydW4oJ3gnKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UuaXNGYWlsdXJlKS50by5iZS50cnVlO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS52YWx1ZVswXSkudG8uYmUuZXFsKCdjaG9pY2UgL3BjaGFyX2EvcGNoYXJfYi9wY2hhcl9jL3BjaGFyX2QnKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UudmFsdWVbMV0pLnRvLmJlLmVxbCgnX2ZhaWwnKTtcbiAgICB9KTtcbn0pO1xuXG5kZXNjcmliZSgndHdvIHBhcnNlcnMgYm91bmQgYnkgb3JFbHNlJywgKCkgPT4ge1xuICAgIGNvbnN0IHBhcnNlckFvckIgPSBvckVsc2UocGNoYXIoJ2EnKSwgcGNoYXIoJ2InKSk7XG5cbiAgICBpdCgnY2FuIHBhcnNlIG9uZSBvZiB0d28gY2hhcnMnLCAoKSA9PiB7XG4gICAgICAgIGV4cGVjdChpc1BhcnNlcihwYXJzZXJBb3JCKSkudG8uYmUudHJ1ZTtcbiAgICAgICAgbGV0IHBhcnNpbmdBb3JCID0gcGFyc2VyQW9yQi5ydW4oJ2FiYycpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0FvckIuaXNTdWNjZXNzKS50by5iZS50cnVlO1xuICAgICAgICBleHBlY3QocGFyc2luZ0FvckIudmFsdWVbMF0pLnRvLmJlLmVxbCgnYScpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0FvckIudmFsdWVbMV0pLnRvLmJlLmVxbCgnYmMnKTtcbiAgICAgICAgcGFyc2luZ0FvckIgPSBwYXJzZXJBb3JCLnJ1bignYmJjJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQW9yQi5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQW9yQi52YWx1ZVswXSkudG8uYmUuZXFsKCdiJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQW9yQi52YWx1ZVsxXSkudG8uYmUuZXFsKCdiYycpO1xuICAgIH0pO1xuXG4gICAgaXQoJ2NhbiBhbHNvIHBhcnNlIE5PTkUgb2YgdHdvIGNoYXJzJywgKCkgPT4ge1xuICAgICAgICBjb25zdCBwYXJzaW5nQW9yQiA9IHBhcnNlckFvckIucnVuKCdjZGUnKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdBb3JCLmlzRmFpbHVyZSkudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdBb3JCLnZhbHVlWzBdKS50by5iZS5lcWwoJ3BjaGFyX2Egb3JFbHNlIHBjaGFyX2InKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdBb3JCLnZhbHVlWzFdKS50by5iZS5lcWwoJ3dhbnRlZCBiOyBnb3QgYycpO1xuICAgIH0pO1xufSk7XG5cbmRlc2NyaWJlKCd0d28gcGFyc2VycyBib3VuZCBieSBhbmRUaGVuJywgKCkgPT4ge1xuICAgIGNvbnN0IHBhcnNlckFhbmRCID0gYW5kVGhlbihwY2hhcignYScpLCBwY2hhcignYicpKTtcblxuICAgIGl0KCdjYW4gcGFyc2UgdHdvIGNoYXJzJywgKCkgPT4ge1xuICAgICAgICBleHBlY3QoaXNQYXJzZXIocGFyc2VyQWFuZEIpKS50by5iZS50cnVlO1xuICAgICAgICBjb25zdCBwYXJzaW5nQWFuZEIgPSBwYXJzZXJBYW5kQi5ydW4oJ2FiYycpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0FhbmRCLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdBYW5kQi52YWx1ZVswXS50b1N0cmluZygpKS50by5iZS5lcWwoJ1thLGJdJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQWFuZEIudmFsdWVbMV0pLnRvLmJlLmVxbCgnYycpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0FhbmRCLnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgnVmFsaWRhdGlvbi5TdWNjZXNzKFtbYSxiXSxjXSknKTtcbiAgICB9KTtcblxuICAgIGl0KCdjYW4gYWxzbyBOT1QgcGFyc2UgdHdvIGNoYXJzJywgKCkgPT4ge1xuICAgICAgICBjb25zdCBwYXJzaW5nQWFuZEIgPSBwYXJzZXJBYW5kQi5ydW4oJ2FjZCcpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0FhbmRCLmlzRmFpbHVyZSkudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdBYW5kQi52YWx1ZVswXSkudG8uYmUuZXFsKCdwY2hhcl9hIGFuZFRoZW4gcGNoYXJfYicpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0FhbmRCLnZhbHVlWzFdKS50by5iZS5lcWwoJ3dhbnRlZCBiOyBnb3QgYycpO1xuICAgIH0pO1xufSk7XG5cbmRlc2NyaWJlKCdhIHNpbXBsZSBwYXJzZXInLCAoKSA9PiB7XG4gICAgY29uc3QgcGFyc2VyQSA9IGNoYXJQYXJzZXIoJ2EnKTtcbiAgICBjb25zdCBwYXJzZXIxID0gZGlnaXRQYXJzZXIoMSk7XG5cbiAgICBpdCgnY2FuIHBhcnNlIGEgc2luZ2xlIGNoYXInLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHBhcnNpbmdBID0gcGFyc2VyQSgnYWJjJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQS52YWx1ZVswXSkudG8uYmUuZXFsKCdhJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQS52YWx1ZVsxXSkudG8uYmUuZXFsKCdiYycpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0EuaXNTdWNjZXNzKS50by5iZS50cnVlO1xuICAgIH0pO1xuXG4gICAgaXQoJ2NhbiBhbHNvIE5PVCBwYXJzZSBhIHNpbmdsZSBjaGFyJywgKCkgPT4ge1xuICAgICAgICBjb25zdCBwYXJzaW5nQiA9IHBhcnNlckEoJ2JjZCcpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0IudmFsdWVbMF0pLnRvLmJlLmVxbCgnY2hhclBhcnNlcicpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0IudmFsdWVbMV0pLnRvLmJlLmVxbCgnd2FudGVkIGE7IGdvdCBiJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQi5pc0ZhaWx1cmUpLnRvLmJlLnRydWU7XG4gICAgfSk7XG5cbiAgICBpdCgnY2FuIHBhcnNlIGEgc2luZ2xlIGRpZ2l0JywgKCkgPT4ge1xuICAgICAgICBjb25zdCBwYXJzaW5nMSA9IHBhcnNlcjEoJzEyMycpO1xuICAgICAgICBleHBlY3QocGFyc2luZzEudmFsdWVbMF0pLnRvLmJlLmVxbCgxKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcxLnZhbHVlWzFdKS50by5iZS5lcWwoJzIzJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nMS5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgfSk7XG5cbiAgICBpdCgnY2FuIGFsc28gTk9UIHBhcnNlIGEgc2luZ2xlIGRpZ2l0JywgKCkgPT4ge1xuICAgICAgICBjb25zdCBwYXJzaW5nMiA9IHBhcnNlcjEoJzIzNCcpO1xuICAgICAgICBleHBlY3QocGFyc2luZzIudmFsdWVbMF0pLnRvLmJlLmVxbCgnZGlnaXRQYXJzZXInKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcyLnZhbHVlWzFdKS50by5iZS5lcWwoJ3dhbnRlZCAxOyBnb3QgMicpO1xuICAgICAgICBleHBlY3QocGFyc2luZzIuaXNGYWlsdXJlKS50by5iZS50cnVlO1xuICAgIH0pO1xufSk7XG5cbmRlc2NyaWJlKCdhIHNsaWdodGx5IG1vcmUgY29tcGxleCBwYXJzZXInLCAoKSA9PiB7XG4gICAgY29uc3QgcGFyc2VyQSA9IGNoYXJQYXJzZXIoJ2EnKTtcblxuICAgIGl0KCdjYW4gcGFyc2UgYSBzaW5nbGUgY2hhcicsICgpID0+IHtcbiAgICAgICAgY29uc3QgcGFyc2luZ0EgPSBwYXJzZXJBKCdhYmMnKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdBLnZhbHVlWzBdKS50by5iZS5lcWwoJ2EnKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdBLnZhbHVlWzFdKS50by5iZS5lcWwoJ2JjJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQS5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgfSk7XG5cbiAgICBpdCgnY2FuIGFsc28gTk9UIHBhcnNlIGEgc2luZ2xlIGNoYXInLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHBhcnNpbmdCID0gcGFyc2VyQSgnYmNkJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQi52YWx1ZVswXSkudG8uYmUuZXFsKCdjaGFyUGFyc2VyJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQi52YWx1ZVsxXSkudG8uYmUuZXFsKCd3YW50ZWQgYTsgZ290IGInKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdCLmlzRmFpbHVyZSkudG8uYmUudHJ1ZTtcbiAgICB9KTtcbn0pO1xuXG5kZXNjcmliZSgnYSBuYW1lZCBjaGFyYWN0ZXIgcGFyc2VyJywgKCkgPT4ge1xuICAgIGNvbnN0IHBhcnNlckEgPSBwY2hhcignYScpO1xuXG4gICAgaXQoJ2NhbiBwYXJzZSBhIHNpbmdsZSBjaGFyJywgKCkgPT4ge1xuICAgICAgICBleHBlY3QoaXNQYXJzZXIocGFyc2VyQSkpLnRvLmJlLnRydWU7XG4gICAgICAgIGNvbnN0IHBhcnNpbmdBID0gcGFyc2VyQS5ydW4oJ2FiYycpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0EudmFsdWVbMF0pLnRvLmJlLmVxbCgnYScpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0EudmFsdWVbMV0pLnRvLmJlLmVxbCgnYmMnKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdBLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcbiAgICB9KTtcblxuICAgIGl0KCdjYW4gYWxzbyBOT1QgcGFyc2UgYSBzaW5nbGUgY2hhcicsICgpID0+IHtcbiAgICAgICAgY29uc3QgcGFyc2luZ0IgPSBwYXJzZXJBLnJ1bignYmNkJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQi52YWx1ZVswXSkudG8uYmUuZXFsKCdwY2hhcl9hJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQi52YWx1ZVsxXSkudG8uYmUuZXFsKCd3YW50ZWQgYTsgZ290IGInKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdCLmlzRmFpbHVyZSkudG8uYmUudHJ1ZTtcbiAgICB9KTtcbn0pO1xuIl19