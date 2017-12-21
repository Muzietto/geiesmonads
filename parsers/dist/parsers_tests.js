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

    describe('a parser for zero or more occurrences', function () {
        it('can parse a char zero times', function () {
            var zeroOrMoreParser = (0, _parsers.many)((0, _parsers.pchar)('m'));
            var parsing = zeroOrMoreParser.run('arco');
            (0, _chai.expect)(parsing.isSuccess).to.be.true;
            (0, _chai.expect)(parsing.toString()).to.be.eql('Validation.Success([[],arco])');
        });
        it('can parse a char many times', function () {
            var zeroOrMoreParser = (0, _parsers.many)((0, _parsers.pchar)('m'));
            var parsing = zeroOrMoreParser.run('mmmarco');
            (0, _chai.expect)(parsing.isSuccess).to.be.true;
            (0, _chai.expect)(parsing.toString()).to.be.eql('Validation.Success([[m,m,m],arco])');
        });
        it('can parse a char sequence zero times', function () {
            var zeroOrMoreParser = (0, _parsers.many)((0, _parsers.pstring)('marco'));
            var parsing = zeroOrMoreParser.run('xmarcomarcociao');
            (0, _chai.expect)(parsing.isSuccess).to.be.true;
            (0, _chai.expect)(parsing.toString()).to.be.eql('Validation.Success([[],xmarcomarcociao])');
        });
        it('can parse a char sequence many times', function () {
            var zeroOrMoreParser = (0, _parsers.many)((0, _parsers.pstring)('marco'));
            var parsing = zeroOrMoreParser.run('marcomarcociao');
            (0, _chai.expect)(parsing.isSuccess).to.be.true;
            (0, _chai.expect)(parsing.toString()).to.be.eql('Validation.Success([[[m,a,r,c,o],[m,a,r,c,o]],ciao])');
        });
        it('can parse whitespaces!!', function () {
            var whitesParser = (0, _parsers.many)((0, _parsers.anyOf)(whites));
            var twoWords = (0, _parsers.sequenceP)([(0, _parsers.pstring)('ciao'), whitesParser, (0, _parsers.pstring)('mamma')]);
            var parsing = twoWords.run('ciaomammaX');
            (0, _chai.expect)(parsing.toString()).to.be.eql('Validation.Success([[[c,i,a,o],[],[m,a,m,m,a]],X])');
            parsing = twoWords.run('ciao mammaX');
            (0, _chai.expect)(parsing.toString()).to.be.eql('Validation.Success([[[c,i,a,o],[ ],[m,a,m,m,a]],X])');
            parsing = twoWords.run('ciao   mammaX');
            (0, _chai.expect)(parsing.toString()).to.be.eql('Validation.Success([[[c,i,a,o],[ , , ],[m,a,m,m,a]],X])');
            parsing = twoWords.run('ciao \t mammaX');
            (0, _chai.expect)(parsing.toString()).to.be.eql('Validation.Success([[[c,i,a,o],[ ,\t, ],[m,a,m,m,a]],X])');
        });
    });

    describe('a parsing function for zero or more occurrences', function () {
        it('can parse a char zero times', function () {
            var zeroOrMoreParsingFunction = (0, _parsers.zeroOrMore)((0, _parsers.pchar)('m'));
            var parsing = zeroOrMoreParsingFunction('arco');
            (0, _chai.expect)(parsing.isSuccess).to.be.true;
            (0, _chai.expect)(parsing.toString()).to.be.eql('Validation.Success([[],arco])');
        });
        it('can parse a char many times', function () {
            var zeroOrMoreParsingFunction = (0, _parsers.zeroOrMore)((0, _parsers.pchar)('m'));
            var parsing = zeroOrMoreParsingFunction('mmmarco');
            (0, _chai.expect)(parsing.isSuccess).to.be.true;
            (0, _chai.expect)(parsing.toString()).to.be.eql('Validation.Success([[m,m,m],arco])');
        });
        it('can parse a char sequence zero times', function () {
            var zeroOrMoreParsingFunction = (0, _parsers.zeroOrMore)((0, _parsers.pstring)('marco'));
            var parsing = zeroOrMoreParsingFunction('xmarcomarcociao');
            (0, _chai.expect)(parsing.isSuccess).to.be.true;
            (0, _chai.expect)(parsing.toString()).to.be.eql('Validation.Success([[],xmarcomarcociao])');
        });
        it('can parse a char sequence many times', function () {
            var zeroOrMoreParsingFunction = (0, _parsers.zeroOrMore)((0, _parsers.pstring)('marco'));
            var parsing = zeroOrMoreParsingFunction('marcomarcociao');
            (0, _chai.expect)(parsing.isSuccess).to.be.true;
            (0, _chai.expect)(parsing.toString()).to.be.eql('Validation.Success([[[m,a,r,c,o],[m,a,r,c,o]],ciao])');
        });
    });

    describe('a parser for a specific word', function () {
        it('is easy to create with sequenceP', function () {
            var marcoParser = (0, _parsers.pstring)('marco');
            var marcoParsing = marcoParser.run('marcociao');
            (0, _chai.expect)(marcoParsing.isSuccess).to.be.true;
            (0, _chai.expect)(marcoParsing.toString()).to.be.eql('Validation.Success([[m,a,r,c,o],ciao])');
        });
    });

    describe('sequences of parsers based on lift2(cons) (aka sequenceP)', function () {
        it('stores matched chars inside an array', function () {
            var abcParser = (0, _parsers.sequenceP)([(0, _parsers.pchar)('a'), (0, _parsers.pchar)('b'), (0, _parsers.pchar)('c')]);
            (0, _chai.expect)(abcParser.run('abc').toString()).to.be.eql('Validation.Success([[a,b,c],])');
        });
    });

    describe('sequences of parsers based on andThen && fmap (aka sequenceP2)', function () {
        it('store matched chars inside a plain string', function () {
            var abcParser = (0, _parsers.sequenceP2)([(0, _parsers.pchar)('a'), (0, _parsers.pchar)('b'), (0, _parsers.pchar)('c')]);
            (0, _chai.expect)(abcParser.run('abc').toString()).to.be.eql('Validation.Success([abc,])');
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
            (0, _chai.expect)(AplusB.run('abc').toString()).to.be.eql('Validation.Success([a+b,c])');
        });
        it('adds the results of two digit parsings', function () {
            var addDigits = function addDigits(x) {
                return function (y) {
                    return x + y;
                };
            };
            var addParser = (0, _parsers.lift2)(addDigits)((0, _parsers.pdigit)(1))((0, _parsers.pdigit)(2));
            (0, _chai.expect)(addParser.run('1234').toString()).to.be.eql('Validation.Success([3,34])');
            (0, _chai.expect)(addParser.run('144').isFailure).to.be.true;
        });
    });

    describe('parse 3 digits', function () {
        var parseDigit = (0, _parsers.anyOf)(digits);
        var threeDigits = (0, _parsers.andThen)(parseDigit, (0, _parsers.andThen)(parseDigit, parseDigit));
        var parsing = threeDigits.run('123');
        it('parses any of three digits', function () {
            (0, _chai.expect)(parsing.isSuccess).to.be.true;
            (0, _chai.expect)(parsing.value[0].toString()).to.be.eql('[1,[2,3]]');
            (0, _chai.expect)(parsing.value[1]).to.be.eql('');
        });
        describe('parses any of three digits while showcasing fmap', function () {
            var unpacker = function unpacker(pairOfPairs) {
                return [pairOfPairs[0], pairOfPairs[1][0], pairOfPairs[1][1]];
            };
            it('as global method', function () {
                //            threeDigits = fmap(([x, [y, z]]) => [x, y, z], threeDigits);
                var threeDigitsImpl = (0, _parsers.fmap)(unpacker, threeDigits);
                var parsing = threeDigitsImpl.run('123');
                (0, _chai.expect)(parsing.isSuccess).to.be.true;
                (0, _chai.expect)(parsing.value[0].toString()).to.be.eql('[1,2,3]');
                (0, _chai.expect)(parsing.value[1]).to.be.eql('');
            });
            it('as instance method', function () {
                var threeDigitsInst = threeDigits.fmap(unpacker);
                var parsing = threeDigitsInst.run('123');
                (0, _chai.expect)(parsing.isSuccess).to.be.true;
                (0, _chai.expect)(parsing.value[0].toString()).to.be.eql('[1,2,3]');
                (0, _chai.expect)(parsing.value[1]).to.be.eql('');
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2pzLXNwZWMvcGFyc2Vyc190ZXN0cy5qcyJdLCJuYW1lcyI6WyJsb3dlcmNhc2VzIiwidXBwZXJjYXNlcyIsImRpZ2l0cyIsIndoaXRlcyIsInhkZXNjcmliZSIsIml0IiwiaW5zaWRlUGFyZW5zIiwiZGlzY2FyZEZpcnN0IiwiZGlzY2FyZFNlY29uZCIsInJ1biIsInRvU3RyaW5nIiwidG8iLCJiZSIsImVxbCIsInN1YnN0cmluZ3NXaXRoQ29tbWFzIiwibGlzdEVsZW1lbnRzIiwiZGlzY2FyZEludGVnZXJTaWduIiwicGFyc2luZyIsImRpc2NhcmRTdWZmaXgiLCJvcHREb3RUaGVuQSIsImFuZFRoZW4iLCJwaW50IiwiZm1hcCIsInBhcnNlSW50IiwibCIsInJlZHVjZSIsImFjYyIsImN1cnIiLCJwU2lnbmVkSW50IiwibWF5YmVTaWduIiwibnVtYmVyIiwiaXNKdXN0Iiwib3B0U3Vic3RyaW5nIiwib25lT3JNb3JlUGFyc2VyIiwiaXNGYWlsdXJlIiwidHJ1ZSIsImlzU3VjY2VzcyIsImRlc2NyaWJlIiwiemVyb09yTW9yZVBhcnNlciIsIndoaXRlc1BhcnNlciIsInR3b1dvcmRzIiwiemVyb09yTW9yZVBhcnNpbmdGdW5jdGlvbiIsIm1hcmNvUGFyc2VyIiwibWFyY29QYXJzaW5nIiwiYWJjUGFyc2VyIiwiYWRkU3RyaW5ncyIsIngiLCJ5IiwiQXBsdXNCIiwiYWRkRGlnaXRzIiwiYWRkUGFyc2VyIiwicGFyc2VEaWdpdCIsInRocmVlRGlnaXRzIiwidmFsdWUiLCJ1bnBhY2tlciIsInBhaXJPZlBhaXJzIiwidGhyZWVEaWdpdHNJbXBsIiwidGhyZWVEaWdpdHNJbnN0IiwicGFpckFkZGVyIiwicGFpciIsImFiY1AiLCJsb3dlcmNhc2VzUGFyc2VyIiwicGFyc2luZ0Nob2ljZSIsInVwcGVyY2FzZXNQYXJzZXIiLCJkaWdpdHNQYXJzZXIiLCJwYXJzZXJzQ2hvaWNlIiwicGFyc2VyQW9yQiIsInBhcnNpbmdBb3JCIiwicGFyc2VyQWFuZEIiLCJwYXJzaW5nQWFuZEIiLCJwYXJzZXJBIiwicGFyc2VyMSIsInBhcnNpbmdBIiwicGFyc2luZ0IiLCJwYXJzaW5nMSIsInBhcnNpbmcyIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQXNDQSxRQUFNQSxhQUFhLENBQUMsR0FBRCxFQUFNLEdBQU4sRUFBVyxHQUFYLEVBQWdCLEdBQWhCLEVBQXFCLEdBQXJCLEVBQTBCLEdBQTFCLEVBQStCLEdBQS9CLEVBQW9DLEdBQXBDLEVBQXlDLEdBQXpDLEVBQThDLEdBQTlDLEVBQW1ELEdBQW5ELEVBQXdELEdBQXhELEVBQTZELEdBQTdELEVBQWtFLEdBQWxFLEVBQXVFLEdBQXZFLEVBQTRFLEdBQTVFLEVBQWlGLEdBQWpGLEVBQXNGLEdBQXRGLEVBQTJGLEdBQTNGLEVBQWdHLEdBQWhHLEVBQXFHLEdBQXJHLEVBQTBHLEdBQTFHLEVBQStHLEdBQS9HLEVBQW9ILEdBQXBILEVBQXlILEdBQXpILEVBQThILEdBQTlILENBQW5CO0FBQ0EsUUFBTUMsYUFBYSxDQUFDLEdBQUQsRUFBTSxHQUFOLEVBQVcsR0FBWCxFQUFnQixHQUFoQixFQUFxQixHQUFyQixFQUEwQixHQUExQixFQUErQixHQUEvQixFQUFvQyxHQUFwQyxFQUF5QyxHQUF6QyxFQUE4QyxHQUE5QyxFQUFtRCxHQUFuRCxFQUF3RCxHQUF4RCxFQUE2RCxHQUE3RCxFQUFrRSxHQUFsRSxFQUF1RSxHQUF2RSxFQUE0RSxHQUE1RSxFQUFpRixHQUFqRixFQUFzRixHQUF0RixFQUEyRixHQUEzRixFQUFnRyxHQUFoRyxFQUFxRyxHQUFyRyxFQUEwRyxHQUExRyxFQUErRyxHQUEvRyxFQUFvSCxHQUFwSCxFQUF5SCxHQUF6SCxFQUE4SCxHQUE5SCxDQUFuQjtBQUNBLFFBQU1DLFNBQVMsQ0FBQyxHQUFELEVBQU0sR0FBTixFQUFXLEdBQVgsRUFBZ0IsR0FBaEIsRUFBcUIsR0FBckIsRUFBMEIsR0FBMUIsRUFBK0IsR0FBL0IsRUFBb0MsR0FBcEMsRUFBeUMs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LEtBQVosQ0FBakI7QUFDQSw4QkFBTytELFNBQVNuQixLQUFULENBQWUsQ0FBZixDQUFQLEVBQTBCMUMsRUFBMUIsQ0FBNkJDLEVBQTdCLENBQWdDQyxHQUFoQyxDQUFvQyxHQUFwQztBQUNBLDhCQUFPMkQsU0FBU25CLEtBQVQsQ0FBZSxDQUFmLENBQVAsRUFBMEIxQyxFQUExQixDQUE2QkMsRUFBN0IsQ0FBZ0NDLEdBQWhDLENBQW9DLElBQXBDO0FBQ0EsOEJBQU8yRCxTQUFTcEMsU0FBaEIsRUFBMkJ6QixFQUEzQixDQUE4QkMsRUFBOUIsQ0FBaUN1QixJQUFqQztBQUNILFNBTkQ7O0FBUUE5QixXQUFHLGtDQUFILEVBQXVDLFlBQU07QUFDekMsZ0JBQU1vRSxXQUFXSCxRQUFRN0QsR0FBUixDQUFZLEtBQVosQ0FBakI7QUFDQSw4QkFBT2dFLFNBQVNwQixLQUFULENBQWUsQ0FBZixDQUFQLEVBQTBCMUMsRUFBMUIsQ0FBNkJDLEVBQTdCLENBQWdDQyxHQUFoQyxDQUFvQyxTQUFwQztBQUNBLDhCQUFPNEQsU0FBU3BCLEtBQVQsQ0FBZSxDQUFmLENBQVAsRUFBMEIxQyxFQUExQixDQUE2QkMsRUFBN0IsQ0FBZ0NDLEdBQWhDLENBQW9DLGlCQUFwQztBQUNBLDhCQUFPNEQsU0FBU3ZDLFNBQWhCLEVBQTJCdkIsRUFBM0IsQ0FBOEJDLEVBQTlCLENBQWlDdUIsSUFBakM7QUFDSCxTQUxEO0FBTUgsS0FqQkQiLCJmaWxlIjoicGFyc2Vyc190ZXN0cy5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7ZXhwZWN0fSBmcm9tICdjaGFpJztcbmltcG9ydCB7XG4gICAgY2hhclBhcnNlcixcbiAgICBkaWdpdFBhcnNlcixcbiAgICBwY2hhcixcbiAgICBwZGlnaXQsXG4gICAgYW5kVGhlbixcbiAgICBvckVsc2UsXG4gICAgY2hvaWNlLFxuICAgIGFueU9mLFxuICAgIGZtYXAsXG4gICAgcmV0dXJuUCxcbiAgICBhcHBseVAsXG4gICAgbGlmdDIsXG4gICAgc2VxdWVuY2VQLFxuICAgIHNlcXVlbmNlUDIsXG4gICAgcHN0cmluZyxcbiAgICB6ZXJvT3JNb3JlLFxuICAgIG1hbnksXG4gICAgbWFueTEsXG4gICAgb3B0LFxuICAgIG9wdEJvb2ssXG4gICAgZGlzY2FyZEZpcnN0LFxuICAgIGRpc2NhcmRTZWNvbmQsXG4gICAgYmV0d2VlbixcbiAgICBiZXR3ZWVuUGFyZW5zLFxufSBmcm9tICdwYXJzZXJzJztcbmltcG9ydCB7XG4gICAgaXNQYWlyLFxuICAgIGlzU3VjY2VzcyxcbiAgICBpc0ZhaWx1cmUsXG4gICAgaXNQYXJzZXIsXG4gICAgaXNTb21lLFxuICAgIGlzTm9uZSxcbn0gZnJvbSAndXRpbCc7XG5pbXBvcnQge01heWJlfSBmcm9tICdtYXliZSc7XG5pbXBvcnQge1ZhbGlkYXRpb259IGZyb20gJ3ZhbGlkYXRpb24nO1xuXG5jb25zdCBsb3dlcmNhc2VzID0gWydhJywgJ2InLCAnYycsICdkJywgJ2UnLCAnZicsICdnJywgJ2gnLCAnaScsICdqJywgJ2snLCAnbCcsICdtJywgJ24nLCAnbycsICdwJywgJ3EnLCAncicsICdzJywgJ3QnLCAndScsICd2JywgJ3cnLCAneCcsICd5JywgJ3onLF07XG5jb25zdCB1cHBlcmNhc2VzID0gWydBJywgJ0InLCAnQycsICdEJywgJ0UnLCAnRicsICdHJywgJ0gnLCAnSScsICdKJywgJ0snLCAnTCcsICdNJywgJ04nLCAnTycsICdQJywgJ1EnLCAnUicsICdTJywgJ1QnLCAnVScsICdWJywgJ1cnLCAnWCcsICdZJywgJ1onLF07XG5jb25zdCBkaWdpdHMgPSBbJzAnLCAnMScsICcyJywgJzMnLCAnNCcsICc1JywgJzYnLCAnNycsICc4JywgJzknXTtcbmNvbnN0IHdoaXRlcyA9IFsnICcsICdcXHQnLCAnXFxuJywgJ1xcciddO1xuXG54ZGVzY3JpYmUoJ3BhcnNpbmcgd2hpbGUgZGlzY2FyZGluZyBpbnB1dCcsICgpID0+IHtcbiAgICBpdCgnYWxsb3dzIHRvIGV4Y2x1ZGUgcGFyZW50aGVzZXMnLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IGluc2lkZVBhcmVucyA9IHBjaGFyKCcoJylcbiAgICAgICAgICAgIC5kaXNjYXJkRmlyc3QobWFueShhbnlPZihsb3dlcmNhc2VzKSkpXG4gICAgICAgICAgICAuZGlzY2FyZFNlY29uZChwY2hhcignKScpKTtcbiAgICAgICAgZXhwZWN0KGluc2lkZVBhcmVucy5ydW4oJyhtYXJjbyknKS50b1N0cmluZygpKS50by5iZS5lcWwoJ1tbbSxhLHIsYyxvXSxdJyk7XG4gICAgICAgIGV4cGVjdChpbnNpZGVQYXJlbnMucnVuKCcoKScpLnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgnW1tdLF0nKTtcbiAgICB9KTtcbiAgICBpdCgnLi4uZXZlbiB1c2luZyBhIHRhaWxvci1tYWRlIG1ldGhvZCcsICgpID0+IHtcbiAgICAgICAgY29uc3QgaW5zaWRlUGFyZW5zID0gYmV0d2VlblBhcmVucyhwc3RyaW5nKCdtYXJjbycpKTtcbiAgICAgICAgZXhwZWN0KGluc2lkZVBhcmVucy5ydW4oJyhtYXJjbyknKS50b1N0cmluZygpKS50by5iZS5lcWwoJ1tbbSxhLHIsYyxvXSxdJyk7XG4gICAgfSk7XG4gICAgaXQoJ2NoZXJyeS1waWNraW5nIGVsZW1lbnRzIHNlcGFyYXRlZCBieSBzZXBhcmF0b3JzJywgKCkgPT4ge1xuICAgICAgICBjb25zdCBzdWJzdHJpbmdzV2l0aENvbW1hcyA9IG1hbnkobWFueTEoYW55T2YobG93ZXJjYXNlcykpLmRpc2NhcmRTZWNvbmQocGNoYXIoJywnKSkpO1xuICAgICAgICBleHBlY3Qoc3Vic3RyaW5nc1dpdGhDb21tYXMucnVuKCdhLGIsY2QsMScpLnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgnW1tbYV0sW2JdLFtjLGRdXSwxXScpO1xuICAgIH0pO1xuICAgIGl0KCcuLi5hbHNvIHdoZW4gaW5zaWRlIGEgbGlzdHMnLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHN1YnN0cmluZ3NXaXRoQ29tbWFzID0gbWFueShtYW55MShhbnlPZihsb3dlcmNhc2VzKSkuZGlzY2FyZFNlY29uZChwY2hhcignLCcpKSk7XG4gICAgICAgIGNvbnN0IGxpc3RFbGVtZW50cyA9IGJldHdlZW4ocGNoYXIoJ1snKSwgc3Vic3RyaW5nc1dpdGhDb21tYXMsIHBjaGFyKCddJykpO1xuICAgICAgICBleHBlY3QobGlzdEVsZW1lbnRzLnJ1bignW2EsYixjZCxtYXJjbyxdMScpLnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgnW1tbYV0sW2JdLFtjLGRdLFttLGEscixjLG9dXSwxXScpO1xuICAgIH0pO1xufSk7XG5cbnhkZXNjcmliZSgnYSBjb3VwbGUgb2YgcGFyc2VycycsICgpID0+IHtcbiAgICBpdCgnY2FuIGRlY2lkZSB0byBkaXNjYXJkIHRoZSBtYXRjaGVzIG9mIHRoZSBmaXJzdCBvbmUnLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IGRpc2NhcmRJbnRlZ2VyU2lnbiA9IHBjaGFyKCctJykuZGlzY2FyZEZpcnN0KHBkaWdpdCg4KSk7XG4gICAgICAgIGxldCBwYXJzaW5nID0gZGlzY2FyZEludGVnZXJTaWduLnJ1bignLTh4Jyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgnWzgseF0nKTtcbiAgICB9KTtcbiAgICBpdCgnY2FuIGRlY2lkZSB0byBkaXNjYXJkIHRoZSBtYXRjaGVzIG9mIHRoZSBzZWNvbmQgb25lJywgKCkgPT4ge1xuICAgICAgICBjb25zdCBkaXNjYXJkU3VmZml4ID0gcHN0cmluZygnbWFyY28nKS5kaXNjYXJkU2Vjb25kKG1hbnkxKGFueU9mKHdoaXRlcykpKTtcbiAgICAgICAgbGV0IHBhcnNpbmcgPSBkaXNjYXJkU3VmZml4LnJ1bignbWFyY28gZmF1c3RpbmVsbGknKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcudG9TdHJpbmcoKSkudG8uYmUuZXFsKCdbW20sYSxyLGMsb10sZmF1c3RpbmVsbGldJyk7XG4gICAgICAgIHBhcnNpbmcgPSBkaXNjYXJkU3VmZml4LnJ1bignbWFyY28gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZhdXN0aW5lbGxpJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgnW1ttLGEscixjLG9dLGZhdXN0aW5lbGxpXScpO1xuICAgIH0pO1xufSk7XG5cbnhkZXNjcmliZSgnYSBwYXJzZXIgZm9yIG9wdGlvbmFsIGNoYXJhY3RlcnMnLCAoKSA9PiB7XG4gICAgaXQoJ2NhbiBjYXB0dXJlIG9yIG5vdCBjYXB0dXJlIGEgZG90JywgKCkgPT4ge1xuICAgICAgICBjb25zdCBvcHREb3RUaGVuQSA9IG9wdChwY2hhcignLicpKS5hbmRUaGVuKHBjaGFyKCdhJykpO1xuICAgICAgICBleHBlY3Qob3B0RG90VGhlbkEucnVuKCcuYWJjJykudG9TdHJpbmcoKSkudG8uYmUuZXFsKCdbW3NvbWUoLiksYV0sYmNdJyk7XG4gICAgICAgIGV4cGVjdChvcHREb3RUaGVuQS5ydW4oJ2FiYycpLnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgnW1tub25lKCksYV0sYmNdJyk7XG4gICAgfSk7XG4gICAgaXQoJ2NhbiBwYXJzZSBTSUdORUQgaW50ZWdlcnMhISEnLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHBpbnQgPSBtYW55MShhbnlPZihkaWdpdHMpKVxuICAgICAgICAgICAgLmZtYXAobCA9PiBwYXJzZUludChsLnJlZHVjZSgoYWNjLCBjdXJyKSA9PiBhY2MgKyBjdXJyLCAnJyksIDEwKSk7XG4gICAgICAgIGNvbnN0IHBTaWduZWRJbnQgPSBvcHQocGNoYXIoJy0nKSlcbiAgICAgICAgICAgIC5hbmRUaGVuKHBpbnQpXG4gICAgICAgICAgICAuZm1hcCgoW21heWJlU2lnbiwgbnVtYmVyXSkgPT4gKE1heWJlLmlzSnVzdChtYXliZVNpZ24pKSA/IC1udW1iZXIgOiBudW1iZXIpO1xuICAgICAgICBleHBlY3QocFNpZ25lZEludC5ydW4oJzEzMjQzNTQ2eCcpWzBdKS50by5iZS5lcWwoMTMyNDM1NDYpO1xuICAgICAgICBleHBlY3QocFNpZ25lZEludC5ydW4oJy0xMzI0MzU0NngnKVswXSkudG8uYmUuZXFsKC0xMzI0MzU0Nik7XG4gICAgfSk7XG4gICAgaXQoJ2NhbiBjYXB0dXJlIG9yIG5vdCBjYXB0dXJlIGEgd2hvbGUgc3Vic3RyaW5nJywgKCkgPT4ge1xuICAgICAgICBjb25zdCBvcHRTdWJzdHJpbmcgPSBvcHQocHN0cmluZygnbWFyY28nKSkuYW5kVGhlbihwc3RyaW5nKCdmYXVzdGluZWxsaScpKTtcbiAgICAgICAgZXhwZWN0KG9wdFN1YnN0cmluZy5ydW4oJ21hcmNvZmF1c3RpbmVsbGl4JykudG9TdHJpbmcoKSlcbiAgICAgICAgICAgIC50by5iZS5lcWwoJ1tbc29tZShbbSxhLHIsYyxvXSksW2YsYSx1LHMsdCxpLG4sZSxsLGwsaV1dLHhdJyk7XG4gICAgICAgIGV4cGVjdChvcHRTdWJzdHJpbmcucnVuKCdmYXVzdGluZWxsaXgnKS50b1N0cmluZygpKVxuICAgICAgICAgICAgLnRvLmJlLmVxbCgnW1tub25lKCksW2YsYSx1LHMsdCxpLG4sZSxsLGwsaV1dLHhdJyk7XG4gICAgfSk7XG59KTtcblxueGRlc2NyaWJlKCdhIHBhcnNlciBmb3Igb25lIG9yIG1vcmUgb2NjdXJyZW5jZXMnLCAoKSA9PiB7XG4gICAgaXQoJ2Nhbm5vdCBwYXJzZSBhIGNoYXIgemVybyB0aW1lcycsICgpID0+IHtcbiAgICAgICAgY29uc3Qgb25lT3JNb3JlUGFyc2VyID0gbWFueTEocGNoYXIoJ20nKSk7XG4gICAgICAgIGxldCBwYXJzaW5nID0gb25lT3JNb3JlUGFyc2VyLnJ1bignYXJjbycpO1xuICAgICAgICBleHBlY3QocGFyc2luZy5pc0ZhaWx1cmUpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgnW21hbnkxIHBjaGFyX20sd2FudGVkIG07IGdvdCBhXScpO1xuICAgIH0pO1xuICAgIGl0KCdjYW4gcGFyc2UgYSBjaGFyIG1hbnkgdGltZXMnLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IG9uZU9yTW9yZVBhcnNlciA9IG1hbnkxKHBjaGFyKCdtJykpO1xuICAgICAgICBsZXQgcGFyc2luZyA9IG9uZU9yTW9yZVBhcnNlci5ydW4oJ21tbWFyY28nKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcuaXNTdWNjZXNzKS50by5iZS50cnVlO1xuICAgICAgICBleHBlY3QocGFyc2luZy50b1N0cmluZygpKS50by5iZS5lcWwoJ1tbbSxtLG1dLGFyY29dJyk7XG4gICAgfSk7XG4gICAgaXQoJ2Nhbm5vdCBwYXJzZSBhIGNoYXIgc2VxdWVuY2UgemVybyB0aW1lcycsICgpID0+IHtcbiAgICAgICAgY29uc3Qgb25lT3JNb3JlUGFyc2VyID0gbWFueTEocHN0cmluZygnbWFyY28nKSk7XG4gICAgICAgIGxldCBwYXJzaW5nID0gb25lT3JNb3JlUGFyc2VyLnJ1bigneG1hcmNvbWFyY29jaWFvJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLmlzRmFpbHVyZSkudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcudG9TdHJpbmcoKSkudG8uYmUuZXFsKCdbbWFueTEgcHN0cmluZyBtYXJjbyx3YW50ZWQgbTsgZ290IHhdJyk7XG4gICAgfSk7XG4gICAgaXQoJ2NhbiBwYXJzZSBhIGNoYXIgc2VxdWVuY2UgbWFueSB0aW1lcycsICgpID0+IHtcbiAgICAgICAgY29uc3Qgb25lT3JNb3JlUGFyc2VyID0gbWFueTEocHN0cmluZygnbWFyY28nKSk7XG4gICAgICAgIGxldCBwYXJzaW5nID0gb25lT3JNb3JlUGFyc2VyLnJ1bignbWFyY29tYXJjb2NpYW8nKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcuaXNTdWNjZXNzKS50by5iZS50cnVlO1xuICAgICAgICBleHBlY3QocGFyc2luZy50b1N0cmluZygpKS50by5iZS5lcWwoJ1tbW20sYSxyLGMsb10sW20sYSxyLGMsb11dLGNpYW9dJyk7XG4gICAgfSk7XG4gICAgaXQoJ2NhbiBwYXJzZSBhbiBpbnRlZ2VyLCBubyBtYXR0ZXIgaG93IGxhcmdlLi4uJywgKCkgPT4ge1xuICAgICAgICBjb25zdCBwaW50ID0gbWFueTEoYW55T2YoZGlnaXRzKSk7XG4gICAgICAgIGxldCBwYXJzaW5nID0gcGludC5ydW4oJzEyMzQ1QScpO1xuICAgICAgICBleHBlY3QocGFyc2luZy5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgnW1sxLDIsMyw0LDVdLEFdJyk7XG4gICAgICAgIHBhcnNpbmcgPSBwaW50LnJ1bignMUInKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcuaXNTdWNjZXNzKS50by5iZS50cnVlO1xuICAgICAgICBleHBlY3QocGFyc2luZy50b1N0cmluZygpKS50by5iZS5lcWwoJ1tbMV0sQl0nKTtcbiAgICAgICAgcGFyc2luZyA9IHBpbnQucnVuKCdBMTIzNDUnKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcuaXNGYWlsdXJlKS50by5iZS50cnVlO1xuICAgICAgICBleHBlY3QocGFyc2luZy50b1N0cmluZygpKS50by5iZS5lcWwoJ1ttYW55MSBhbnlPZiAwMTIzNDU2Nzg5LF9mYWlsXScpO1xuICAgIH0pO1xuICAgIGl0KCdjYW4gcGFyc2UgYW4gaW50ZWdlciBpbnRvIGEgdHJ1ZSBpbnRlZ2VyJywgKCkgPT4ge1xuICAgICAgICBjb25zdCBwaW50ID0gbWFueTEoYW55T2YoZGlnaXRzKSlcbiAgICAgICAgICAgIC5mbWFwKGwgPT4gcGFyc2VJbnQobC5yZWR1Y2UoKGFjYywgY3VycikgPT4gYWNjICsgY3VyciwgJycpLCAxMCkpO1xuICAgICAgICBsZXQgcGFyc2luZyA9IHBpbnQucnVuKCcxMjM0NUEnKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcuaXNTdWNjZXNzKS50by5iZS50cnVlO1xuICAgICAgICBleHBlY3QocGFyc2luZ1swXSkudG8uYmUuZXFsKDEyMzQ1KTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdbMV0pLnRvLmJlLmVxbCgnQScpO1xuICAgIH0pO1xufSk7XG5cbmRlc2NyaWJlKCdhIHBhcnNlciBmb3IgemVybyBvciBtb3JlIG9jY3VycmVuY2VzJywgKCkgPT4ge1xuICAgIGl0KCdjYW4gcGFyc2UgYSBjaGFyIHplcm8gdGltZXMnLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHplcm9Pck1vcmVQYXJzZXIgPSBtYW55KHBjaGFyKCdtJykpO1xuICAgICAgICBsZXQgcGFyc2luZyA9IHplcm9Pck1vcmVQYXJzZXIucnVuKCdhcmNvJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcudG9TdHJpbmcoKSkudG8uYmUuZXFsKCdWYWxpZGF0aW9uLlN1Y2Nlc3MoW1tdLGFyY29dKScpO1xuICAgIH0pO1xuICAgIGl0KCdjYW4gcGFyc2UgYSBjaGFyIG1hbnkgdGltZXMnLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHplcm9Pck1vcmVQYXJzZXIgPSBtYW55KHBjaGFyKCdtJykpO1xuICAgICAgICBsZXQgcGFyc2luZyA9IHplcm9Pck1vcmVQYXJzZXIucnVuKCdtbW1hcmNvJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcudG9TdHJpbmcoKSkudG8uYmUuZXFsKCdWYWxpZGF0aW9uLlN1Y2Nlc3MoW1ttLG0sbV0sYXJjb10pJyk7XG4gICAgfSk7XG4gICAgaXQoJ2NhbiBwYXJzZSBhIGNoYXIgc2VxdWVuY2UgemVybyB0aW1lcycsICgpID0+IHtcbiAgICAgICAgY29uc3QgemVyb09yTW9yZVBhcnNlciA9IG1hbnkocHN0cmluZygnbWFyY28nKSk7XG4gICAgICAgIGxldCBwYXJzaW5nID0gemVyb09yTW9yZVBhcnNlci5ydW4oJ3htYXJjb21hcmNvY2lhbycpO1xuICAgICAgICBleHBlY3QocGFyc2luZy5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgnVmFsaWRhdGlvbi5TdWNjZXNzKFtbXSx4bWFyY29tYXJjb2NpYW9dKScpO1xuICAgIH0pO1xuICAgIGl0KCdjYW4gcGFyc2UgYSBjaGFyIHNlcXVlbmNlIG1hbnkgdGltZXMnLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHplcm9Pck1vcmVQYXJzZXIgPSBtYW55KHBzdHJpbmcoJ21hcmNvJykpO1xuICAgICAgICBsZXQgcGFyc2luZyA9IHplcm9Pck1vcmVQYXJzZXIucnVuKCdtYXJjb21hcmNvY2lhbycpO1xuICAgICAgICBleHBlY3QocGFyc2luZy5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgnVmFsaWRhdGlvbi5TdWNjZXNzKFtbW20sYSxyLGMsb10sW20sYSxyLGMsb11dLGNpYW9dKScpO1xuICAgIH0pO1xuICAgIGl0KCdjYW4gcGFyc2Ugd2hpdGVzcGFjZXMhIScsICgpID0+IHtcbiAgICAgICAgY29uc3Qgd2hpdGVzUGFyc2VyID0gbWFueShhbnlPZih3aGl0ZXMpKTtcbiAgICAgICAgY29uc3QgdHdvV29yZHMgPSBzZXF1ZW5jZVAoW3BzdHJpbmcoJ2NpYW8nKSwgd2hpdGVzUGFyc2VyLCBwc3RyaW5nKCdtYW1tYScpXSk7XG4gICAgICAgIGxldCBwYXJzaW5nID0gdHdvV29yZHMucnVuKCdjaWFvbWFtbWFYJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgnVmFsaWRhdGlvbi5TdWNjZXNzKFtbW2MsaSxhLG9dLFtdLFttLGEsbSxtLGFdXSxYXSknKTtcbiAgICAgICAgcGFyc2luZyA9IHR3b1dvcmRzLnJ1bignY2lhbyBtYW1tYVgnKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcudG9TdHJpbmcoKSkudG8uYmUuZXFsKCdWYWxpZGF0aW9uLlN1Y2Nlc3MoW1tbYyxpLGEsb10sWyBdLFttLGEsbSxtLGFdXSxYXSknKTtcbiAgICAgICAgcGFyc2luZyA9IHR3b1dvcmRzLnJ1bignY2lhbyAgIG1hbW1hWCcpO1xuICAgICAgICBleHBlY3QocGFyc2luZy50b1N0cmluZygpKS50by5iZS5lcWwoJ1ZhbGlkYXRpb24uU3VjY2VzcyhbW1tjLGksYSxvXSxbICwgLCBdLFttLGEsbSxtLGFdXSxYXSknKTtcbiAgICAgICAgcGFyc2luZyA9IHR3b1dvcmRzLnJ1bignY2lhbyBcXHQgbWFtbWFYJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgnVmFsaWRhdGlvbi5TdWNjZXNzKFtbW2MsaSxhLG9dLFsgLFxcdCwgXSxbbSxhLG0sbSxhXV0sWF0pJyk7XG4gICAgfSk7XG59KTtcblxuZGVzY3JpYmUoJ2EgcGFyc2luZyBmdW5jdGlvbiBmb3IgemVybyBvciBtb3JlIG9jY3VycmVuY2VzJywgKCkgPT4ge1xuICAgIGl0KCdjYW4gcGFyc2UgYSBjaGFyIHplcm8gdGltZXMnLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHplcm9Pck1vcmVQYXJzaW5nRnVuY3Rpb24gPSB6ZXJvT3JNb3JlKHBjaGFyKCdtJykpO1xuICAgICAgICBsZXQgcGFyc2luZyA9IHplcm9Pck1vcmVQYXJzaW5nRnVuY3Rpb24oJ2FyY28nKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcuaXNTdWNjZXNzKS50by5iZS50cnVlO1xuICAgICAgICBleHBlY3QocGFyc2luZy50b1N0cmluZygpKS50by5iZS5lcWwoJ1ZhbGlkYXRpb24uU3VjY2VzcyhbW10sYXJjb10pJyk7XG4gICAgfSk7XG4gICAgaXQoJ2NhbiBwYXJzZSBhIGNoYXIgbWFueSB0aW1lcycsICgpID0+IHtcbiAgICAgICAgY29uc3QgemVyb09yTW9yZVBhcnNpbmdGdW5jdGlvbiA9IHplcm9Pck1vcmUocGNoYXIoJ20nKSk7XG4gICAgICAgIGxldCBwYXJzaW5nID0gemVyb09yTW9yZVBhcnNpbmdGdW5jdGlvbignbW1tYXJjbycpO1xuICAgICAgICBleHBlY3QocGFyc2luZy5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgnVmFsaWRhdGlvbi5TdWNjZXNzKFtbbSxtLG1dLGFyY29dKScpO1xuICAgIH0pO1xuICAgIGl0KCdjYW4gcGFyc2UgYSBjaGFyIHNlcXVlbmNlIHplcm8gdGltZXMnLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHplcm9Pck1vcmVQYXJzaW5nRnVuY3Rpb24gPSB6ZXJvT3JNb3JlKHBzdHJpbmcoJ21hcmNvJykpO1xuICAgICAgICBsZXQgcGFyc2luZyA9IHplcm9Pck1vcmVQYXJzaW5nRnVuY3Rpb24oJ3htYXJjb21hcmNvY2lhbycpO1xuICAgICAgICBleHBlY3QocGFyc2luZy5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgnVmFsaWRhdGlvbi5TdWNjZXNzKFtbXSx4bWFyY29tYXJjb2NpYW9dKScpO1xuICAgIH0pO1xuICAgIGl0KCdjYW4gcGFyc2UgYSBjaGFyIHNlcXVlbmNlIG1hbnkgdGltZXMnLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHplcm9Pck1vcmVQYXJzaW5nRnVuY3Rpb24gPSB6ZXJvT3JNb3JlKHBzdHJpbmcoJ21hcmNvJykpO1xuICAgICAgICBsZXQgcGFyc2luZyA9IHplcm9Pck1vcmVQYXJzaW5nRnVuY3Rpb24oJ21hcmNvbWFyY29jaWFvJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcudG9TdHJpbmcoKSkudG8uYmUuZXFsKCdWYWxpZGF0aW9uLlN1Y2Nlc3MoW1tbbSxhLHIsYyxvXSxbbSxhLHIsYyxvXV0sY2lhb10pJyk7XG4gICAgfSk7XG59KTtcblxuZGVzY3JpYmUoJ2EgcGFyc2VyIGZvciBhIHNwZWNpZmljIHdvcmQnLCAoKSA9PiB7XG4gICAgaXQoJ2lzIGVhc3kgdG8gY3JlYXRlIHdpdGggc2VxdWVuY2VQJywgKCkgPT4ge1xuICAgICAgICBjb25zdCBtYXJjb1BhcnNlciA9IHBzdHJpbmcoJ21hcmNvJyk7XG4gICAgICAgIGNvbnN0IG1hcmNvUGFyc2luZyA9IG1hcmNvUGFyc2VyLnJ1bignbWFyY29jaWFvJyk7XG4gICAgICAgIGV4cGVjdChtYXJjb1BhcnNpbmcuaXNTdWNjZXNzKS50by5iZS50cnVlO1xuICAgICAgICBleHBlY3QobWFyY29QYXJzaW5nLnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgnVmFsaWRhdGlvbi5TdWNjZXNzKFtbbSxhLHIsYyxvXSxjaWFvXSknKTtcbiAgICB9KTtcbn0pO1xuXG5kZXNjcmliZSgnc2VxdWVuY2VzIG9mIHBhcnNlcnMgYmFzZWQgb24gbGlmdDIoY29ucykgKGFrYSBzZXF1ZW5jZVApJywgKCkgPT4ge1xuICAgIGl0KCdzdG9yZXMgbWF0Y2hlZCBjaGFycyBpbnNpZGUgYW4gYXJyYXknLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IGFiY1BhcnNlciA9IHNlcXVlbmNlUChbcGNoYXIoJ2EnKSwgcGNoYXIoJ2InKSwgcGNoYXIoJ2MnKSxdKTtcbiAgICAgICAgZXhwZWN0KGFiY1BhcnNlci5ydW4oJ2FiYycpLnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgnVmFsaWRhdGlvbi5TdWNjZXNzKFtbYSxiLGNdLF0pJyk7XG4gICAgfSk7XG59KTtcblxuZGVzY3JpYmUoJ3NlcXVlbmNlcyBvZiBwYXJzZXJzIGJhc2VkIG9uIGFuZFRoZW4gJiYgZm1hcCAoYWthIHNlcXVlbmNlUDIpJywgKCkgPT4ge1xuICAgIGl0KCdzdG9yZSBtYXRjaGVkIGNoYXJzIGluc2lkZSBhIHBsYWluIHN0cmluZycsICgpID0+IHtcbiAgICAgICAgY29uc3QgYWJjUGFyc2VyID0gc2VxdWVuY2VQMihbcGNoYXIoJ2EnKSwgcGNoYXIoJ2InKSwgcGNoYXIoJ2MnKSxdKTtcbiAgICAgICAgZXhwZWN0KGFiY1BhcnNlci5ydW4oJ2FiYycpLnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgnVmFsaWRhdGlvbi5TdWNjZXNzKFthYmMsXSknKTtcbiAgICB9KTtcbn0pO1xuXG5kZXNjcmliZSgnbGlmdDIgZm9yIHBhcnNlcnMnLCAoKSA9PiB7XG4gICAgaXQoJ29wZXJhdGVzIG9uIHRoZSByZXN1bHRzIG9mIHR3byBzdHJpbmcgcGFyc2luZ3MnLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IGFkZFN0cmluZ3MgPSB4ID0+IHkgPT4geCArICcrJyArIHk7XG4gICAgICAgIGNvbnN0IEFwbHVzQiA9IGxpZnQyKGFkZFN0cmluZ3MpKHBjaGFyKCdhJykpKHBjaGFyKCdiJykpO1xuICAgICAgICBleHBlY3QoQXBsdXNCLnJ1bignYWJjJykudG9TdHJpbmcoKSkudG8uYmUuZXFsKCdWYWxpZGF0aW9uLlN1Y2Nlc3MoW2ErYixjXSknKTtcbiAgICB9KTtcbiAgICBpdCgnYWRkcyB0aGUgcmVzdWx0cyBvZiB0d28gZGlnaXQgcGFyc2luZ3MnLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IGFkZERpZ2l0cyA9IHggPT4geSA9PiB4ICsgeTtcbiAgICAgICAgY29uc3QgYWRkUGFyc2VyID0gbGlmdDIoYWRkRGlnaXRzKShwZGlnaXQoMSkpKHBkaWdpdCgyKSk7XG4gICAgICAgIGV4cGVjdChhZGRQYXJzZXIucnVuKCcxMjM0JykudG9TdHJpbmcoKSkudG8uYmUuZXFsKCdWYWxpZGF0aW9uLlN1Y2Nlc3MoWzMsMzRdKScpO1xuICAgICAgICBleHBlY3QoYWRkUGFyc2VyLnJ1bignMTQ0JykuaXNGYWlsdXJlKS50by5iZS50cnVlO1xuICAgIH0pO1xufSk7XG5cbmRlc2NyaWJlKCdwYXJzZSAzIGRpZ2l0cycsICgpID0+IHtcbiAgICBjb25zdCBwYXJzZURpZ2l0ID0gYW55T2YoZGlnaXRzKTtcbiAgICBsZXQgdGhyZWVEaWdpdHMgPSBhbmRUaGVuKHBhcnNlRGlnaXQsIGFuZFRoZW4ocGFyc2VEaWdpdCwgcGFyc2VEaWdpdCkpO1xuICAgIGNvbnN0IHBhcnNpbmcgPSB0aHJlZURpZ2l0cy5ydW4oJzEyMycpO1xuICAgIGl0KCdwYXJzZXMgYW55IG9mIHRocmVlIGRpZ2l0cycsICgpID0+IHtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcuaXNTdWNjZXNzKS50by5iZS50cnVlO1xuICAgICAgICBleHBlY3QocGFyc2luZy52YWx1ZVswXS50b1N0cmluZygpKS50by5iZS5lcWwoJ1sxLFsyLDNdXScpO1xuICAgICAgICBleHBlY3QocGFyc2luZy52YWx1ZVsxXSkudG8uYmUuZXFsKCcnKTtcbiAgICB9KTtcbiAgICBkZXNjcmliZSgncGFyc2VzIGFueSBvZiB0aHJlZSBkaWdpdHMgd2hpbGUgc2hvd2Nhc2luZyBmbWFwJywgKCkgPT4ge1xuICAgICAgICBjb25zdCB1bnBhY2tlciA9IHBhaXJPZlBhaXJzID0+IHtcbiAgICAgICAgICAgIHJldHVybiBbcGFpck9mUGFpcnNbMF0sIHBhaXJPZlBhaXJzWzFdWzBdLCBwYWlyT2ZQYWlyc1sxXVsxXV07XG4gICAgICAgIH1cbiAgICAgICAgaXQoJ2FzIGdsb2JhbCBtZXRob2QnLCAoKSA9PiB7XG4vLyAgICAgICAgICAgIHRocmVlRGlnaXRzID0gZm1hcCgoW3gsIFt5LCB6XV0pID0+IFt4LCB5LCB6XSwgdGhyZWVEaWdpdHMpO1xuICAgICAgICAgICAgY29uc3QgdGhyZWVEaWdpdHNJbXBsID0gZm1hcCh1bnBhY2tlciwgdGhyZWVEaWdpdHMpO1xuICAgICAgICAgICAgbGV0IHBhcnNpbmcgPSB0aHJlZURpZ2l0c0ltcGwucnVuKCcxMjMnKTtcbiAgICAgICAgICAgIGV4cGVjdChwYXJzaW5nLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcbiAgICAgICAgICAgIGV4cGVjdChwYXJzaW5nLnZhbHVlWzBdLnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgnWzEsMiwzXScpO1xuICAgICAgICAgICAgZXhwZWN0KHBhcnNpbmcudmFsdWVbMV0pLnRvLmJlLmVxbCgnJyk7XG4gICAgICAgIH0pO1xuICAgICAgICBpdCgnYXMgaW5zdGFuY2UgbWV0aG9kJywgKCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgdGhyZWVEaWdpdHNJbnN0ID0gdGhyZWVEaWdpdHMuZm1hcCh1bnBhY2tlcik7XG4gICAgICAgICAgICBsZXQgcGFyc2luZyA9IHRocmVlRGlnaXRzSW5zdC5ydW4oJzEyMycpO1xuICAgICAgICAgICAgZXhwZWN0KHBhcnNpbmcuaXNTdWNjZXNzKS50by5iZS50cnVlO1xuICAgICAgICAgICAgZXhwZWN0KHBhcnNpbmcudmFsdWVbMF0udG9TdHJpbmcoKSkudG8uYmUuZXFsKCdbMSwyLDNdJyk7XG4gICAgICAgICAgICBleHBlY3QocGFyc2luZy52YWx1ZVsxXSkudG8uYmUuZXFsKCcnKTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG59KTtcblxuZGVzY3JpYmUoJ3BhcnNlIEFCQycsICgpID0+IHtcbi8vICAgIGNvbnN0IHBhaXJBZGRlciA9IHBhaXIgPT4gcGFpci52YWx1ZVswXSArIHBhaXIudmFsdWVbMV07XG4gICAgaXQoJ3BhcnNlcyBBQkMnLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHBhaXJBZGRlciA9IHBhaXIgPT4gcGFpclswXSArIHBhaXJbMV07XG4gICAgICAgIGNvbnN0IGFiY1AgPSBhbmRUaGVuKHBjaGFyKCdhJyksXG4gICAgICAgICAgICBhbmRUaGVuKHBjaGFyKCdiJyksXG4gICAgICAgICAgICAgICAgYW5kVGhlbihwY2hhcignYycpLCByZXR1cm5QKCcnKSkuZm1hcChwYWlyQWRkZXIpXG4gICAgICAgICAgICApLmZtYXAocGFpckFkZGVyKVxuICAgICAgICApLmZtYXAocGFpckFkZGVyKTtcbiAgICAgICAgY29uc3QgcGFyc2luZyA9IGFiY1AucnVuKCdhYmNkJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcudmFsdWVbMF0udG9TdHJpbmcoKSkudG8uYmUuZXFsKCdhYmMnKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcudmFsdWVbMV0pLnRvLmJlLmVxbCgnZCcpO1xuICAgIH0pO1xufSk7XG5cbmRlc2NyaWJlKCdhIHBhcnNlcnMgZm9yIGFueSBvZiBhIGxpc3Qgb2YgY2hhcnMnLCAoKSA9PiB7XG5cbiAgICBpdCgnY2FuIHBhcnNlIGFueSBsb3dlcmNhc2UgY2hhcicsICgpID0+IHtcbiAgICAgICAgY29uc3QgbG93ZXJjYXNlc1BhcnNlciA9IGFueU9mKGxvd2VyY2FzZXMpO1xuXG4gICAgICAgIGV4cGVjdChpc1BhcnNlcihsb3dlcmNhc2VzUGFyc2VyKSkudG8uYmUudHJ1ZTtcbiAgICAgICAgbGV0IHBhcnNpbmdDaG9pY2UgPSBsb3dlcmNhc2VzUGFyc2VyLnJ1bignYScpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLnZhbHVlWzBdKS50by5iZS5lcWwoJ2EnKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UudmFsdWVbMV0pLnRvLmJlLmVxbCgnJyk7XG4gICAgICAgIHBhcnNpbmdDaG9pY2UgPSBsb3dlcmNhc2VzUGFyc2VyLnJ1bignYicpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLnZhbHVlWzBdKS50by5iZS5lcWwoJ2InKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UudmFsdWVbMV0pLnRvLmJlLmVxbCgnJyk7XG4gICAgICAgIHBhcnNpbmdDaG9pY2UgPSBsb3dlcmNhc2VzUGFyc2VyLnJ1bignZCcpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLnZhbHVlWzBdKS50by5iZS5lcWwoJ2QnKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UudmFsdWVbMV0pLnRvLmJlLmVxbCgnJyk7XG4gICAgICAgIHBhcnNpbmdDaG9pY2UgPSBsb3dlcmNhc2VzUGFyc2VyLnJ1bigneicpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLnZhbHVlWzBdKS50by5iZS5lcWwoJ3onKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UudmFsdWVbMV0pLnRvLmJlLmVxbCgnJyk7XG5cbiAgICAgICAgcGFyc2luZ0Nob2ljZSA9IGxvd2VyY2FzZXNQYXJzZXIucnVuKCdZJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLmlzRmFpbHVyZSkudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UudmFsdWVbMF0pLnRvLmJlLmVxbCgnYW55T2YgYWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXonKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UudmFsdWVbMV0pLnRvLmJlLmVxbCgnX2ZhaWwnKTtcbiAgICB9KTtcblxuICAgIGl0KCdjYW4gcGFyc2UgYW55IHVwcGVyY2FzZSBjaGFyJywgKCkgPT4ge1xuICAgICAgICBsZXQgdXBwZXJjYXNlc1BhcnNlciA9IGFueU9mKHVwcGVyY2FzZXMpO1xuXG4gICAgICAgIGV4cGVjdChpc1BhcnNlcih1cHBlcmNhc2VzUGFyc2VyKSkudG8uYmUudHJ1ZTtcbiAgICAgICAgbGV0IHBhcnNpbmdDaG9pY2UgPSB1cHBlcmNhc2VzUGFyc2VyLnJ1bignQScpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLnZhbHVlWzBdKS50by5iZS5lcWwoJ0EnKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UudmFsdWVbMV0pLnRvLmJlLmVxbCgnJyk7XG4gICAgICAgIHBhcnNpbmdDaG9pY2UgPSB1cHBlcmNhc2VzUGFyc2VyLnJ1bignQicpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLnZhbHVlWzBdKS50by5iZS5lcWwoJ0InKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UudmFsdWVbMV0pLnRvLmJlLmVxbCgnJyk7XG4gICAgICAgIHBhcnNpbmdDaG9pY2UgPSB1cHBlcmNhc2VzUGFyc2VyLnJ1bignUicpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLnZhbHVlWzBdKS50by5iZS5lcWwoJ1InKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UudmFsdWVbMV0pLnRvLmJlLmVxbCgnJyk7XG4gICAgICAgIHBhcnNpbmdDaG9pY2UgPSB1cHBlcmNhc2VzUGFyc2VyLnJ1bignWicpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLnZhbHVlWzBdKS50by5iZS5lcWwoJ1onKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UudmFsdWVbMV0pLnRvLmJlLmVxbCgnJyk7XG5cbiAgICAgICAgcGFyc2luZ0Nob2ljZSA9IHVwcGVyY2FzZXNQYXJzZXIucnVuKCdzJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLmlzRmFpbHVyZSkudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UudmFsdWVbMF0pLnRvLmJlLmVxbCgnYW55T2YgQUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVonKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UudmFsdWVbMV0pLnRvLmJlLmVxbCgnX2ZhaWwnKTtcbiAgICB9KTtcblxuICAgIGl0KCdjYW4gcGFyc2UgYW55IGRpZ2l0JywgKCkgPT4ge1xuICAgICAgICBsZXQgZGlnaXRzUGFyc2VyID0gYW55T2YoZGlnaXRzKTtcblxuICAgICAgICBleHBlY3QoaXNQYXJzZXIoZGlnaXRzUGFyc2VyKSkudG8uYmUudHJ1ZTtcbiAgICAgICAgbGV0IHBhcnNpbmdDaG9pY2UgPSBkaWdpdHNQYXJzZXIucnVuKCcxJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UudmFsdWVbMF0pLnRvLmJlLmVxbCgnMScpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS52YWx1ZVsxXSkudG8uYmUuZXFsKCcnKTtcbiAgICAgICAgcGFyc2luZ0Nob2ljZSA9IGRpZ2l0c1BhcnNlci5ydW4oJzMnKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UuaXNTdWNjZXNzKS50by5iZS50cnVlO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS52YWx1ZVswXSkudG8uYmUuZXFsKCczJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLnZhbHVlWzFdKS50by5iZS5lcWwoJycpO1xuICAgICAgICBwYXJzaW5nQ2hvaWNlID0gZGlnaXRzUGFyc2VyLnJ1bignMCcpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLnZhbHVlWzBdKS50by5iZS5lcWwoJzAnKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UudmFsdWVbMV0pLnRvLmJlLmVxbCgnJyk7XG4gICAgICAgIHBhcnNpbmdDaG9pY2UgPSBkaWdpdHNQYXJzZXIucnVuKCc4Jyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UudmFsdWVbMF0pLnRvLmJlLmVxbCgnOCcpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS52YWx1ZVsxXSkudG8uYmUuZXFsKCcnKTtcblxuICAgICAgICBwYXJzaW5nQ2hvaWNlID0gZGlnaXRzUGFyc2VyLnJ1bigncycpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS5pc0ZhaWx1cmUpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLnZhbHVlWzBdKS50by5iZS5lcWwoJ2FueU9mIDAxMjM0NTY3ODknKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UudmFsdWVbMV0pLnRvLmJlLmVxbCgnX2ZhaWwnKTtcbiAgICB9KTtcbn0pO1xuXG5kZXNjcmliZSgnYSBjaG9pY2Ugb2YgcGFyc2VycyBib3VuZCBieSBvckVsc2UnLCAoKSA9PiB7XG4gICAgY29uc3QgcGFyc2Vyc0Nob2ljZSA9IGNob2ljZShbcGNoYXIoJ2EnKSwgcGNoYXIoJ2InKSwgcGNoYXIoJ2MnKSwgcGNoYXIoJ2QnKSxdKTtcblxuICAgIGl0KCdjYW4gcGFyc2Ugb25lIG9mIGZvdXIgY2hhcnMnLCAoKSA9PiB7XG4gICAgICAgIGV4cGVjdChpc1BhcnNlcihwYXJzZXJzQ2hvaWNlKSkudG8uYmUudHJ1ZTtcbiAgICAgICAgbGV0IHBhcnNpbmdDaG9pY2UgPSBwYXJzZXJzQ2hvaWNlLnJ1bignYScpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLnZhbHVlWzBdKS50by5iZS5lcWwoJ2EnKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UudmFsdWVbMV0pLnRvLmJlLmVxbCgnJyk7XG4gICAgICAgIHBhcnNpbmdDaG9pY2UgPSBwYXJzZXJzQ2hvaWNlLnJ1bignYicpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLnZhbHVlWzBdKS50by5iZS5lcWwoJ2InKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UudmFsdWVbMV0pLnRvLmJlLmVxbCgnJyk7XG4gICAgICAgIHBhcnNpbmdDaG9pY2UgPSBwYXJzZXJzQ2hvaWNlLnJ1bignZCcpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLnZhbHVlWzBdKS50by5iZS5lcWwoJ2QnKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UudmFsdWVbMV0pLnRvLmJlLmVxbCgnJyk7XG4gICAgfSk7XG5cbiAgICBpdCgnY2FuIGFsc28gcGFyc2UgTk9ORSBvZiBmb3VyIGNoYXJzJywgKCkgPT4ge1xuICAgICAgICBjb25zdCBwYXJzaW5nQ2hvaWNlID0gcGFyc2Vyc0Nob2ljZS5ydW4oJ3gnKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UuaXNGYWlsdXJlKS50by5iZS50cnVlO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS52YWx1ZVswXSkudG8uYmUuZXFsKCdjaG9pY2UgL3BjaGFyX2EvcGNoYXJfYi9wY2hhcl9jL3BjaGFyX2QnKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UudmFsdWVbMV0pLnRvLmJlLmVxbCgnX2ZhaWwnKTtcbiAgICB9KTtcbn0pO1xuXG5kZXNjcmliZSgndHdvIHBhcnNlcnMgYm91bmQgYnkgb3JFbHNlJywgKCkgPT4ge1xuICAgIGNvbnN0IHBhcnNlckFvckIgPSBvckVsc2UocGNoYXIoJ2EnKSwgcGNoYXIoJ2InKSk7XG5cbiAgICBpdCgnY2FuIHBhcnNlIG9uZSBvZiB0d28gY2hhcnMnLCAoKSA9PiB7XG4gICAgICAgIGV4cGVjdChpc1BhcnNlcihwYXJzZXJBb3JCKSkudG8uYmUudHJ1ZTtcbiAgICAgICAgbGV0IHBhcnNpbmdBb3JCID0gcGFyc2VyQW9yQi5ydW4oJ2FiYycpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0FvckIuaXNTdWNjZXNzKS50by5iZS50cnVlO1xuICAgICAgICBleHBlY3QocGFyc2luZ0FvckIudmFsdWVbMF0pLnRvLmJlLmVxbCgnYScpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0FvckIudmFsdWVbMV0pLnRvLmJlLmVxbCgnYmMnKTtcbiAgICAgICAgcGFyc2luZ0FvckIgPSBwYXJzZXJBb3JCLnJ1bignYmJjJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQW9yQi5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQW9yQi52YWx1ZVswXSkudG8uYmUuZXFsKCdiJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQW9yQi52YWx1ZVsxXSkudG8uYmUuZXFsKCdiYycpO1xuICAgIH0pO1xuXG4gICAgaXQoJ2NhbiBhbHNvIHBhcnNlIE5PTkUgb2YgdHdvIGNoYXJzJywgKCkgPT4ge1xuICAgICAgICBjb25zdCBwYXJzaW5nQW9yQiA9IHBhcnNlckFvckIucnVuKCdjZGUnKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdBb3JCLmlzRmFpbHVyZSkudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdBb3JCLnZhbHVlWzBdKS50by5iZS5lcWwoJ3BjaGFyX2Egb3JFbHNlIHBjaGFyX2InKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdBb3JCLnZhbHVlWzFdKS50by5iZS5lcWwoJ3dhbnRlZCBiOyBnb3QgYycpO1xuICAgIH0pO1xufSk7XG5cbmRlc2NyaWJlKCd0d28gcGFyc2VycyBib3VuZCBieSBhbmRUaGVuJywgKCkgPT4ge1xuICAgIGNvbnN0IHBhcnNlckFhbmRCID0gYW5kVGhlbihwY2hhcignYScpLCBwY2hhcignYicpKTtcblxuICAgIGl0KCdjYW4gcGFyc2UgdHdvIGNoYXJzJywgKCkgPT4ge1xuICAgICAgICBleHBlY3QoaXNQYXJzZXIocGFyc2VyQWFuZEIpKS50by5iZS50cnVlO1xuICAgICAgICBjb25zdCBwYXJzaW5nQWFuZEIgPSBwYXJzZXJBYW5kQi5ydW4oJ2FiYycpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0FhbmRCLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdBYW5kQi52YWx1ZVswXS50b1N0cmluZygpKS50by5iZS5lcWwoJ1thLGJdJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQWFuZEIudmFsdWVbMV0pLnRvLmJlLmVxbCgnYycpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0FhbmRCLnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgnVmFsaWRhdGlvbi5TdWNjZXNzKFtbYSxiXSxjXSknKTtcbiAgICB9KTtcblxuICAgIGl0KCdjYW4gYWxzbyBOT1QgcGFyc2UgdHdvIGNoYXJzJywgKCkgPT4ge1xuICAgICAgICBjb25zdCBwYXJzaW5nQWFuZEIgPSBwYXJzZXJBYW5kQi5ydW4oJ2FjZCcpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0FhbmRCLmlzRmFpbHVyZSkudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdBYW5kQi52YWx1ZVswXSkudG8uYmUuZXFsKCdwY2hhcl9hIGFuZFRoZW4gcGNoYXJfYicpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0FhbmRCLnZhbHVlWzFdKS50by5iZS5lcWwoJ3dhbnRlZCBiOyBnb3QgYycpO1xuICAgIH0pO1xufSk7XG5cbmRlc2NyaWJlKCdhIHNpbXBsZSBwYXJzZXInLCAoKSA9PiB7XG4gICAgY29uc3QgcGFyc2VyQSA9IGNoYXJQYXJzZXIoJ2EnKTtcbiAgICBjb25zdCBwYXJzZXIxID0gZGlnaXRQYXJzZXIoMSk7XG5cbiAgICBpdCgnY2FuIHBhcnNlIGEgc2luZ2xlIGNoYXInLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHBhcnNpbmdBID0gcGFyc2VyQSgnYWJjJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQS52YWx1ZVswXSkudG8uYmUuZXFsKCdhJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQS52YWx1ZVsxXSkudG8uYmUuZXFsKCdiYycpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0EuaXNTdWNjZXNzKS50by5iZS50cnVlO1xuICAgIH0pO1xuXG4gICAgaXQoJ2NhbiBhbHNvIE5PVCBwYXJzZSBhIHNpbmdsZSBjaGFyJywgKCkgPT4ge1xuICAgICAgICBjb25zdCBwYXJzaW5nQiA9IHBhcnNlckEoJ2JjZCcpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0IudmFsdWVbMF0pLnRvLmJlLmVxbCgnY2hhclBhcnNlcicpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0IudmFsdWVbMV0pLnRvLmJlLmVxbCgnd2FudGVkIGE7IGdvdCBiJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQi5pc0ZhaWx1cmUpLnRvLmJlLnRydWU7XG4gICAgfSk7XG5cbiAgICBpdCgnY2FuIHBhcnNlIGEgc2luZ2xlIGRpZ2l0JywgKCkgPT4ge1xuICAgICAgICBjb25zdCBwYXJzaW5nMSA9IHBhcnNlcjEoJzEyMycpO1xuICAgICAgICBleHBlY3QocGFyc2luZzEudmFsdWVbMF0pLnRvLmJlLmVxbCgxKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcxLnZhbHVlWzFdKS50by5iZS5lcWwoJzIzJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nMS5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgfSk7XG5cbiAgICBpdCgnY2FuIGFsc28gTk9UIHBhcnNlIGEgc2luZ2xlIGRpZ2l0JywgKCkgPT4ge1xuICAgICAgICBjb25zdCBwYXJzaW5nMiA9IHBhcnNlcjEoJzIzNCcpO1xuICAgICAgICBleHBlY3QocGFyc2luZzIudmFsdWVbMF0pLnRvLmJlLmVxbCgnZGlnaXRQYXJzZXInKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcyLnZhbHVlWzFdKS50by5iZS5lcWwoJ3dhbnRlZCAxOyBnb3QgMicpO1xuICAgICAgICBleHBlY3QocGFyc2luZzIuaXNGYWlsdXJlKS50by5iZS50cnVlO1xuICAgIH0pO1xufSk7XG5cbmRlc2NyaWJlKCdhIHNsaWdodGx5IG1vcmUgY29tcGxleCBwYXJzZXInLCAoKSA9PiB7XG4gICAgY29uc3QgcGFyc2VyQSA9IGNoYXJQYXJzZXIoJ2EnKTtcblxuICAgIGl0KCdjYW4gcGFyc2UgYSBzaW5nbGUgY2hhcicsICgpID0+IHtcbiAgICAgICAgY29uc3QgcGFyc2luZ0EgPSBwYXJzZXJBKCdhYmMnKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdBLnZhbHVlWzBdKS50by5iZS5lcWwoJ2EnKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdBLnZhbHVlWzFdKS50by5iZS5lcWwoJ2JjJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQS5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgfSk7XG5cbiAgICBpdCgnY2FuIGFsc28gTk9UIHBhcnNlIGEgc2luZ2xlIGNoYXInLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHBhcnNpbmdCID0gcGFyc2VyQSgnYmNkJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQi52YWx1ZVswXSkudG8uYmUuZXFsKCdjaGFyUGFyc2VyJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQi52YWx1ZVsxXSkudG8uYmUuZXFsKCd3YW50ZWQgYTsgZ290IGInKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdCLmlzRmFpbHVyZSkudG8uYmUudHJ1ZTtcbiAgICB9KTtcbn0pO1xuXG5kZXNjcmliZSgnYSBuYW1lZCBjaGFyYWN0ZXIgcGFyc2VyJywgKCkgPT4ge1xuICAgIGNvbnN0IHBhcnNlckEgPSBwY2hhcignYScpO1xuXG4gICAgaXQoJ2NhbiBwYXJzZSBhIHNpbmdsZSBjaGFyJywgKCkgPT4ge1xuICAgICAgICBleHBlY3QoaXNQYXJzZXIocGFyc2VyQSkpLnRvLmJlLnRydWU7XG4gICAgICAgIGNvbnN0IHBhcnNpbmdBID0gcGFyc2VyQS5ydW4oJ2FiYycpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0EudmFsdWVbMF0pLnRvLmJlLmVxbCgnYScpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0EudmFsdWVbMV0pLnRvLmJlLmVxbCgnYmMnKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdBLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcbiAgICB9KTtcblxuICAgIGl0KCdjYW4gYWxzbyBOT1QgcGFyc2UgYSBzaW5nbGUgY2hhcicsICgpID0+IHtcbiAgICAgICAgY29uc3QgcGFyc2luZ0IgPSBwYXJzZXJBLnJ1bignYmNkJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQi52YWx1ZVswXSkudG8uYmUuZXFsKCdwY2hhcl9hJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQi52YWx1ZVsxXSkudG8uYmUuZXFsKCd3YW50ZWQgYTsgZ290IGInKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdCLmlzRmFpbHVyZSkudG8uYmUudHJ1ZTtcbiAgICB9KTtcbn0pO1xuIl19