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

    describe('parsing while discarding input', function () {
        it('allows to exclude parentheses', function () {
            var insideParens = (0, _parsers.pchar)('(').discardFirst((0, _parsers.many)((0, _parsers.anyOf)(lowercases))).discardSecond((0, _parsers.pchar)(')'));
            (0, _chai.expect)(insideParens.run('(marco)').toString()).to.be.eql('Validation.Success([[m,a,r,c,o],])');
            (0, _chai.expect)(insideParens.run('()').toString()).to.be.eql('Validation.Success([[],])');
        });
        it('...even using a tailor-made method', function () {
            var insideParens = (0, _parsers.betweenParens)((0, _parsers.pstring)('marco'));
            (0, _chai.expect)(insideParens.run('(marco)').toString()).to.be.eql('Validation.Success([[m,a,r,c,o],])');
        });
        it('cherry-picking elements separated by separators', function () {
            var substringsWithCommas = (0, _parsers.many)((0, _parsers.many1)((0, _parsers.anyOf)(lowercases)).discardSecond((0, _parsers.pchar)(',')));
            (0, _chai.expect)(substringsWithCommas.run('a,b,cd,1').toString()).to.be.eql('Validation.Success([[[a],[b],[c,d]],1])');
        });
        it('...also when inside a lists', function () {
            var substringsWithCommas = (0, _parsers.many)((0, _parsers.many1)((0, _parsers.anyOf)(lowercases)).discardSecond((0, _parsers.pchar)(',')));
            var listElements = (0, _parsers.between)((0, _parsers.pchar)('['), substringsWithCommas, (0, _parsers.pchar)(']'));
            (0, _chai.expect)(listElements.run('[a,b,cd,marco,]1').toString()).to.be.eql('Validation.Success([[[a],[b],[c,d],[m,a,r,c,o]],1])');
        });
    });

    describe('a couple of parsers', function () {
        it('can decide to discard the matches of the first one', function () {
            var discardIntegerSign = (0, _parsers.pchar)('-').discardFirst((0, _parsers.pdigit)(8));
            var parsing = discardIntegerSign.run('-8x');
            (0, _chai.expect)(parsing.toString()).to.be.eql('Validation.Success([8,x])');
        });
        it('can decide to discard the matches of the second one', function () {
            var discardSuffix = (0, _parsers.pstring)('marco').discardSecond((0, _parsers.many1)((0, _parsers.anyOf)(whites)));
            var parsing = discardSuffix.run('marco faustinelli');
            (0, _chai.expect)(parsing.toString()).to.be.eql('Validation.Success([[m,a,r,c,o],faustinelli])');
            parsing = discardSuffix.run('marco                                faustinelli');
            (0, _chai.expect)(parsing.toString()).to.be.eql('Validation.Success([[m,a,r,c,o],faustinelli])');
        });
    });

    describe('a parser for optional characters', function () {
        it('can capture or not capture a dot', function () {
            var optDotThenA = (0, _parsers.opt)((0, _parsers.pchar)('.')).andThen((0, _parsers.pchar)('a'));
            (0, _chai.expect)(optDotThenA.run('.abc').toString()).to.be.eql('Validation.Success([[Maybe.Just(.),a],bc])');
            (0, _chai.expect)(optDotThenA.run('abc').toString()).to.be.eql('Validation.Success([[Maybe.Nothing,a],bc])');
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
            (0, _chai.expect)(optSubstring.run('marcofaustinellix').toString()).to.be.eql('Validation.Success([[Maybe.Just([m,a,r,c,o]),[f,a,u,s,t,i,n,e,l,l,i]],x])');
            (0, _chai.expect)(optSubstring.run('faustinellix').toString()).to.be.eql('Validation.Success([[Maybe.Nothing,[f,a,u,s,t,i,n,e,l,l,i]],x])');
        });
    });

    describe('a parser for one or more occurrences', function () {
        it('cannot parse a char zero times', function () {
            var oneOrMoreParser = (0, _parsers.many1)((0, _parsers.pchar)('m'));
            var parsing = oneOrMoreParser.run('arco');
            (0, _chai.expect)(parsing.isFailure).to.be.true;
            (0, _chai.expect)(parsing.toString()).to.be.eql('Validation.Failure([many1 pchar_m,wanted m; got a])');
        });
        it('can parse a char many times', function () {
            var oneOrMoreParser = (0, _parsers.many1)((0, _parsers.pchar)('m'));
            var parsing = oneOrMoreParser.run('mmmarco');
            (0, _chai.expect)(parsing.isSuccess).to.be.true;
            (0, _chai.expect)(parsing.toString()).to.be.eql('Validation.Success([[m,m,m],arco])');
        });
        it('cannot parse a char sequence zero times', function () {
            var oneOrMoreParser = (0, _parsers.many1)((0, _parsers.pstring)('marco'));
            var parsing = oneOrMoreParser.run('xmarcomarcociao');
            (0, _chai.expect)(parsing.isFailure).to.be.true;
            (0, _chai.expect)(parsing.toString()).to.be.eql('Validation.Failure([many1 pstring marco,wanted m; got x])');
        });
        it('can parse a char sequence many times', function () {
            var oneOrMoreParser = (0, _parsers.many1)((0, _parsers.pstring)('marco'));
            var parsing = oneOrMoreParser.run('marcomarcociao');
            (0, _chai.expect)(parsing.isSuccess).to.be.true;
            (0, _chai.expect)(parsing.toString()).to.be.eql('Validation.Success([[[m,a,r,c,o],[m,a,r,c,o]],ciao])');
        });
        it('can parse an integer, no matter how large...', function () {
            var pint = (0, _parsers.many1)((0, _parsers.anyOf)(digits));
            var parsing = pint.run('12345A');
            (0, _chai.expect)(parsing.isSuccess).to.be.true;
            (0, _chai.expect)(parsing.toString()).to.be.eql('Validation.Success([[1,2,3,4,5],A])');
            parsing = pint.run('1B');
            (0, _chai.expect)(parsing.isSuccess).to.be.true;
            (0, _chai.expect)(parsing.toString()).to.be.eql('Validation.Success([[1],B])');
            parsing = pint.run('A12345');
            (0, _chai.expect)(parsing.isFailure).to.be.true;
            (0, _chai.expect)(parsing.toString()).to.be.eql('Validation.Failure([many1 anyOf 0123456789,_fail])');
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
            (0, _chai.expect)(parsing.value[1]).to.be.eql('A');
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

        it('fails at the end of the stream also when hunting for digits', function () {
            var parsing3 = parser1('');
            (0, _chai.expect)(parsing3.value[0]).to.be.eql('digitParser');
            (0, _chai.expect)(parsing3.value[1]).to.be.eql('no more input');
            (0, _chai.expect)(parsing3.isFailure).to.be.true;
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

        it('fails at the end of the stream', function () {
            var parsingA = parserA('');
            (0, _chai.expect)(parsingA.value[0]).to.be.eql('charParser');
            (0, _chai.expect)(parsingA.value[1]).to.be.eql('no more input');
            (0, _chai.expect)(parsingA.isFailure).to.be.true;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2pzLXNwZWMvcGFyc2Vyc190ZXN0cy5qcyJdLCJuYW1lcyI6WyJsb3dlcmNhc2VzIiwidXBwZXJjYXNlcyIsImRpZ2l0cyIsIndoaXRlcyIsImRlc2NyaWJlIiwiaXQiLCJpbnNpZGVQYXJlbnMiLCJkaXNjYXJkRmlyc3QiLCJkaXNjYXJkU2Vjb25kIiwicnVuIiwidG9TdHJpbmciLCJ0byIsImJlIiwiZXFsIiwic3Vic3RyaW5nc1dpdGhDb21tYXMiLCJsaXN0RWxlbWVudHMiLCJkaXNjYXJkSW50ZWdlclNpZ24iLCJwYXJzaW5nIiwiZGlzY2FyZFN1ZmZpeCIsIm9wdERvdFRoZW5BIiwiYW5kVGhlbiIsInBpbnQiLCJmbWFwIiwicGFyc2VJbnQiLCJsIiwicmVkdWNlIiwiYWNjIiwiY3VyciIsInBTaWduZWRJbnQiLCJvcHRTaWduTnVtYmVyUGFpciIsImlzSnVzdCIsInZhbHVlIiwib3B0U3Vic3RyaW5nIiwib25lT3JNb3JlUGFyc2VyIiwiaXNGYWlsdXJlIiwidHJ1ZSIsImlzU3VjY2VzcyIsInplcm9Pck1vcmVQYXJzZXIiLCJ3aGl0ZXNQYXJzZXIiLCJ0d29Xb3JkcyIsInplcm9Pck1vcmVQYXJzaW5nRnVuY3Rpb24iLCJtYXJjb1BhcnNlciIsIm1hcmNvUGFyc2luZyIsImFiY1BhcnNlciIsImFkZFN0cmluZ3MiLCJ4IiwieSIsIkFwbHVzQiIsImFkZERpZ2l0cyIsImFkZFBhcnNlciIsInBhcnNlRGlnaXQiLCJ0aHJlZURpZ2l0cyIsInVucGFja2VyIiwieiIsInRocmVlRGlnaXRzSW1wbCIsInRocmVlRGlnaXRzSW5zdCIsInBhaXJBZGRlciIsImFiY1AiLCJsb3dlcmNhc2VzUGFyc2VyIiwicGFyc2luZ0Nob2ljZSIsInVwcGVyY2FzZXNQYXJzZXIiLCJkaWdpdHNQYXJzZXIiLCJwYXJzZXJzQ2hvaWNlIiwicGFyc2VyQW9yQiIsInBhcnNpbmdBb3JCIiwicGFyc2VyQWFuZEIiLCJwYXJzaW5nQWFuZEIiLCJwYXJzZXJBIiwicGFyc2Vy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akI7QUFDQSw4QkFBTzZELFNBQVN2QyxLQUFULENBQWUsQ0FBZixDQUFQLEVBQTBCcEIsRUFBMUIsQ0FBNkJDLEVBQTdCLENBQWdDQyxHQUFoQyxDQUFvQyxTQUFwQztBQUNBLDhCQUFPeUQsU0FBU3ZDLEtBQVQsQ0FBZSxDQUFmLENBQVAsRUFBMEJwQixFQUExQixDQUE2QkMsRUFBN0IsQ0FBZ0NDLEdBQWhDLENBQW9DLGlCQUFwQztBQUNBLDhCQUFPeUQsU0FBU3BDLFNBQWhCLEVBQTJCdkIsRUFBM0IsQ0FBOEJDLEVBQTlCLENBQWlDdUIsSUFBakM7QUFDSCxTQUxEO0FBTUgsS0FqQkQiLCJmaWxlIjoicGFyc2Vyc190ZXN0cy5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7ZXhwZWN0fSBmcm9tICdjaGFpJztcbmltcG9ydCB7XG4gICAgY2hhclBhcnNlcixcbiAgICBkaWdpdFBhcnNlcixcbiAgICBwY2hhcixcbiAgICBwZGlnaXQsXG4gICAgYW5kVGhlbixcbiAgICBvckVsc2UsXG4gICAgY2hvaWNlLFxuICAgIGFueU9mLFxuICAgIGZtYXAsXG4gICAgcmV0dXJuUCxcbiAgICBhcHBseVAsXG4gICAgbGlmdDIsXG4gICAgc2VxdWVuY2VQLFxuICAgIHNlcXVlbmNlUDIsXG4gICAgcHN0cmluZyxcbiAgICB6ZXJvT3JNb3JlLFxuICAgIG1hbnksXG4gICAgbWFueTEsXG4gICAgb3B0LFxuICAgIG9wdEJvb2ssXG4gICAgZGlzY2FyZEZpcnN0LFxuICAgIGRpc2NhcmRTZWNvbmQsXG4gICAgYmV0d2VlbixcbiAgICBiZXR3ZWVuUGFyZW5zLFxufSBmcm9tICdwYXJzZXJzJztcbmltcG9ydCB7XG4gICAgaXNQYWlyLFxuICAgIGlzU3VjY2VzcyxcbiAgICBpc0ZhaWx1cmUsXG4gICAgaXNQYXJzZXIsXG4gICAgaXNTb21lLFxuICAgIGlzTm9uZSxcbn0gZnJvbSAndXRpbCc7XG5pbXBvcnQge01heWJlfSBmcm9tICdtYXliZSc7XG5pbXBvcnQge1ZhbGlkYXRpb259IGZyb20gJ3ZhbGlkYXRpb24nO1xuXG5jb25zdCBsb3dlcmNhc2VzID0gWydhJywgJ2InLCAnYycsICdkJywgJ2UnLCAnZicsICdnJywgJ2gnLCAnaScsICdqJywgJ2snLCAnbCcsICdtJywgJ24nLCAnbycsICdwJywgJ3EnLCAncicsICdzJywgJ3QnLCAndScsICd2JywgJ3cnLCAneCcsICd5JywgJ3onLF07XG5jb25zdCB1cHBlcmNhc2VzID0gWydBJywgJ0InLCAnQycsICdEJywgJ0UnLCAnRicsICdHJywgJ0gnLCAnSScsICdKJywgJ0snLCAnTCcsICdNJywgJ04nLCAnTycsICdQJywgJ1EnLCAnUicsICdTJywgJ1QnLCAnVScsICdWJywgJ1cnLCAnWCcsICdZJywgJ1onLF07XG5jb25zdCBkaWdpdHMgPSBbJzAnLCAnMScsICcyJywgJzMnLCAnNCcsICc1JywgJzYnLCAnNycsICc4JywgJzknXTtcbmNvbnN0IHdoaXRlcyA9IFsnICcsICdcXHQnLCAnXFxuJywgJ1xcciddO1xuXG5kZXNjcmliZSgncGFyc2luZyB3aGlsZSBkaXNjYXJkaW5nIGlucHV0JywgKCkgPT4ge1xuICAgIGl0KCdhbGxvd3MgdG8gZXhjbHVkZSBwYXJlbnRoZXNlcycsICgpID0+IHtcbiAgICAgICAgY29uc3QgaW5zaWRlUGFyZW5zID0gcGNoYXIoJygnKVxuICAgICAgICAgICAgLmRpc2NhcmRGaXJzdChtYW55KGFueU9mKGxvd2VyY2FzZXMpKSlcbiAgICAgICAgICAgIC5kaXNjYXJkU2Vjb25kKHBjaGFyKCcpJykpO1xuICAgICAgICBleHBlY3QoaW5zaWRlUGFyZW5zLnJ1bignKG1hcmNvKScpLnRvU3RyaW5nKCkpXG4gICAgICAgICAgICAudG8uYmUuZXFsKCdWYWxpZGF0aW9uLlN1Y2Nlc3MoW1ttLGEscixjLG9dLF0pJyk7XG4gICAgICAgIGV4cGVjdChpbnNpZGVQYXJlbnMucnVuKCcoKScpLnRvU3RyaW5nKCkpXG4gICAgICAgICAgICAudG8uYmUuZXFsKCdWYWxpZGF0aW9uLlN1Y2Nlc3MoW1tdLF0pJyk7XG4gICAgfSk7XG4gICAgaXQoJy4uLmV2ZW4gdXNpbmcgYSB0YWlsb3ItbWFkZSBtZXRob2QnLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IGluc2lkZVBhcmVucyA9IGJldHdlZW5QYXJlbnMocHN0cmluZygnbWFyY28nKSk7XG4gICAgICAgIGV4cGVjdChpbnNpZGVQYXJlbnMucnVuKCcobWFyY28pJykudG9TdHJpbmcoKSlcbiAgICAgICAgICAgIC50by5iZS5lcWwoJ1ZhbGlkYXRpb24uU3VjY2VzcyhbW20sYSxyLGMsb10sXSknKTtcbiAgICB9KTtcbiAgICBpdCgnY2hlcnJ5LXBpY2tpbmcgZWxlbWVudHMgc2VwYXJhdGVkIGJ5IHNlcGFyYXRvcnMnLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHN1YnN0cmluZ3NXaXRoQ29tbWFzID0gbWFueShtYW55MShhbnlPZihsb3dlcmNhc2VzKSkuZGlzY2FyZFNlY29uZChwY2hhcignLCcpKSk7XG4gICAgICAgIGV4cGVjdChzdWJzdHJpbmdzV2l0aENvbW1hcy5ydW4oJ2EsYixjZCwxJykudG9TdHJpbmcoKSlcbiAgICAgICAgICAgIC50by5iZS5lcWwoJ1ZhbGlkYXRpb24uU3VjY2VzcyhbW1thXSxbYl0sW2MsZF1dLDFdKScpO1xuICAgIH0pO1xuICAgIGl0KCcuLi5hbHNvIHdoZW4gaW5zaWRlIGEgbGlzdHMnLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHN1YnN0cmluZ3NXaXRoQ29tbWFzID0gbWFueShtYW55MShhbnlPZihsb3dlcmNhc2VzKSkuZGlzY2FyZFNlY29uZChwY2hhcignLCcpKSk7XG4gICAgICAgIGNvbnN0IGxpc3RFbGVtZW50cyA9IGJldHdlZW4ocGNoYXIoJ1snKSwgc3Vic3RyaW5nc1dpdGhDb21tYXMsIHBjaGFyKCddJykpO1xuICAgICAgICBleHBlY3QobGlzdEVsZW1lbnRzLnJ1bignW2EsYixjZCxtYXJjbyxdMScpLnRvU3RyaW5nKCkpXG4gICAgICAgICAgICAudG8uYmUuZXFsKCdWYWxpZGF0aW9uLlN1Y2Nlc3MoW1tbYV0sW2JdLFtjLGRdLFttLGEscixjLG9dXSwxXSknKTtcbiAgICB9KTtcbn0pO1xuXG5kZXNjcmliZSgnYSBjb3VwbGUgb2YgcGFyc2VycycsICgpID0+IHtcbiAgICBpdCgnY2FuIGRlY2lkZSB0byBkaXNjYXJkIHRoZSBtYXRjaGVzIG9mIHRoZSBmaXJzdCBvbmUnLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IGRpc2NhcmRJbnRlZ2VyU2lnbiA9IHBjaGFyKCctJykuZGlzY2FyZEZpcnN0KHBkaWdpdCg4KSk7XG4gICAgICAgIGxldCBwYXJzaW5nID0gZGlzY2FyZEludGVnZXJTaWduLnJ1bignLTh4Jyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgnVmFsaWRhdGlvbi5TdWNjZXNzKFs4LHhdKScpO1xuICAgIH0pO1xuICAgIGl0KCdjYW4gZGVjaWRlIHRvIGRpc2NhcmQgdGhlIG1hdGNoZXMgb2YgdGhlIHNlY29uZCBvbmUnLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IGRpc2NhcmRTdWZmaXggPSBwc3RyaW5nKCdtYXJjbycpLmRpc2NhcmRTZWNvbmQobWFueTEoYW55T2Yod2hpdGVzKSkpO1xuICAgICAgICBsZXQgcGFyc2luZyA9IGRpc2NhcmRTdWZmaXgucnVuKCdtYXJjbyBmYXVzdGluZWxsaScpO1xuICAgICAgICBleHBlY3QocGFyc2luZy50b1N0cmluZygpKS50by5iZS5lcWwoJ1ZhbGlkYXRpb24uU3VjY2VzcyhbW20sYSxyLGMsb10sZmF1c3RpbmVsbGldKScpO1xuICAgICAgICBwYXJzaW5nID0gZGlzY2FyZFN1ZmZpeC5ydW4oJ21hcmNvICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmYXVzdGluZWxsaScpO1xuICAgICAgICBleHBlY3QocGFyc2luZy50b1N0cmluZygpKS50by5iZS5lcWwoJ1ZhbGlkYXRpb24uU3VjY2VzcyhbW20sYSxyLGMsb10sZmF1c3RpbmVsbGldKScpO1xuICAgIH0pO1xufSk7XG5cbmRlc2NyaWJlKCdhIHBhcnNlciBmb3Igb3B0aW9uYWwgY2hhcmFjdGVycycsICgpID0+IHtcbiAgICBpdCgnY2FuIGNhcHR1cmUgb3Igbm90IGNhcHR1cmUgYSBkb3QnLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IG9wdERvdFRoZW5BID0gb3B0KHBjaGFyKCcuJykpLmFuZFRoZW4ocGNoYXIoJ2EnKSk7XG4gICAgICAgIGV4cGVjdChvcHREb3RUaGVuQS5ydW4oJy5hYmMnKS50b1N0cmluZygpKVxuICAgICAgICAgICAgLnRvLmJlLmVxbCgnVmFsaWRhdGlvbi5TdWNjZXNzKFtbTWF5YmUuSnVzdCguKSxhXSxiY10pJyk7XG4gICAgICAgIGV4cGVjdChvcHREb3RUaGVuQS5ydW4oJ2FiYycpLnRvU3RyaW5nKCkpXG4gICAgICAgICAgICAudG8uYmUuZXFsKCdWYWxpZGF0aW9uLlN1Y2Nlc3MoW1tNYXliZS5Ob3RoaW5nLGFdLGJjXSknKTtcbiAgICB9KTtcbiAgICBpdCgnY2FuIHBhcnNlIFNJR05FRCBpbnRlZ2VycyEhIScsICgpID0+IHtcbiAgICAgICAgY29uc3QgcGludCA9IG1hbnkxKGFueU9mKGRpZ2l0cykpXG4gICAgICAgICAgICAuZm1hcChsID0+IHBhcnNlSW50KGwucmVkdWNlKChhY2MsIGN1cnIpID0+IGFjYyArIGN1cnIsICcnKSwgMTApKTtcbiAgICAgICAgY29uc3QgcFNpZ25lZEludCA9IG9wdChwY2hhcignLScpKVxuICAgICAgICAgICAgLmFuZFRoZW4ocGludClcbiAgICAgICAgICAgIC5mbWFwKG9wdFNpZ25OdW1iZXJQYWlyID0+IChvcHRTaWduTnVtYmVyUGFpclswXS5pc0p1c3QpID8gLW9wdFNpZ25OdW1iZXJQYWlyWzFdIDogb3B0U2lnbk51bWJlclBhaXJbMV0pO1xuICAgICAgICBleHBlY3QocFNpZ25lZEludC5ydW4oJzEzMjQzNTQ2eCcpLnZhbHVlWzBdKS50by5iZS5lcWwoMTMyNDM1NDYpO1xuICAgICAgICBleHBlY3QocFNpZ25lZEludC5ydW4oJy0xMzI0MzU0NngnKS52YWx1ZVswXSkudG8uYmUuZXFsKC0xMzI0MzU0Nik7XG4gICAgfSk7XG4gICAgaXQoJ2NhbiBjYXB0dXJlIG9yIG5vdCBjYXB0dXJlIGEgd2hvbGUgc3Vic3RyaW5nJywgKCkgPT4ge1xuICAgICAgICBjb25zdCBvcHRTdWJzdHJpbmcgPSBvcHQocHN0cmluZygnbWFyY28nKSkuYW5kVGhlbihwc3RyaW5nKCdmYXVzdGluZWxsaScpKTtcbiAgICAgICAgZXhwZWN0KG9wdFN1YnN0cmluZy5ydW4oJ21hcmNvZmF1c3RpbmVsbGl4JykudG9TdHJpbmcoKSlcbiAgICAgICAgICAgIC50by5iZS5lcWwoJ1ZhbGlkYXRpb24uU3VjY2VzcyhbW01heWJlLkp1c3QoW20sYSxyLGMsb10pLFtmLGEsdSxzLHQsaSxuLGUsbCxsLGldXSx4XSknKTtcbiAgICAgICAgZXhwZWN0KG9wdFN1YnN0cmluZy5ydW4oJ2ZhdXN0aW5lbGxpeCcpLnRvU3RyaW5nKCkpXG4gICAgICAgICAgICAudG8uYmUuZXFsKCdWYWxpZGF0aW9uLlN1Y2Nlc3MoW1tNYXliZS5Ob3RoaW5nLFtmLGEsdSxzLHQsaSxuLGUsbCxsLGldXSx4XSknKTtcbiAgICB9KTtcbn0pO1xuXG5kZXNjcmliZSgnYSBwYXJzZXIgZm9yIG9uZSBvciBtb3JlIG9jY3VycmVuY2VzJywgKCkgPT4ge1xuICAgIGl0KCdjYW5ub3QgcGFyc2UgYSBjaGFyIHplcm8gdGltZXMnLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IG9uZU9yTW9yZVBhcnNlciA9IG1hbnkxKHBjaGFyKCdtJykpO1xuICAgICAgICBsZXQgcGFyc2luZyA9IG9uZU9yTW9yZVBhcnNlci5ydW4oJ2FyY28nKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcuaXNGYWlsdXJlKS50by5iZS50cnVlO1xuICAgICAgICBleHBlY3QocGFyc2luZy50b1N0cmluZygpKVxuICAgICAgICAgICAgLnRvLmJlLmVxbCgnVmFsaWRhdGlvbi5GYWlsdXJlKFttYW55MSBwY2hhcl9tLHdhbnRlZCBtOyBnb3QgYV0pJyk7XG4gICAgfSk7XG4gICAgaXQoJ2NhbiBwYXJzZSBhIGNoYXIgbWFueSB0aW1lcycsICgpID0+IHtcbiAgICAgICAgY29uc3Qgb25lT3JNb3JlUGFyc2VyID0gbWFueTEocGNoYXIoJ20nKSk7XG4gICAgICAgIGxldCBwYXJzaW5nID0gb25lT3JNb3JlUGFyc2VyLnJ1bignbW1tYXJjbycpO1xuICAgICAgICBleHBlY3QocGFyc2luZy5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgnVmFsaWRhdGlvbi5TdWNjZXNzKFtbbSxtLG1dLGFyY29dKScpO1xuICAgIH0pO1xuICAgIGl0KCdjYW5ub3QgcGFyc2UgYSBjaGFyIHNlcXVlbmNlIHplcm8gdGltZXMnLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IG9uZU9yTW9yZVBhcnNlciA9IG1hbnkxKHBzdHJpbmcoJ21hcmNvJykpO1xuICAgICAgICBsZXQgcGFyc2luZyA9IG9uZU9yTW9yZVBhcnNlci5ydW4oJ3htYXJjb21hcmNvY2lhbycpO1xuICAgICAgICBleHBlY3QocGFyc2luZy5pc0ZhaWx1cmUpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLnRvU3RyaW5nKCkpXG4gICAgICAgICAgICAudG8uYmUuZXFsKCdWYWxpZGF0aW9uLkZhaWx1cmUoW21hbnkxIHBzdHJpbmcgbWFyY28sd2FudGVkIG07IGdvdCB4XSknKTtcbiAgICB9KTtcbiAgICBpdCgnY2FuIHBhcnNlIGEgY2hhciBzZXF1ZW5jZSBtYW55IHRpbWVzJywgKCkgPT4ge1xuICAgICAgICBjb25zdCBvbmVPck1vcmVQYXJzZXIgPSBtYW55MShwc3RyaW5nKCdtYXJjbycpKTtcbiAgICAgICAgbGV0IHBhcnNpbmcgPSBvbmVPck1vcmVQYXJzZXIucnVuKCdtYXJjb21hcmNvY2lhbycpO1xuICAgICAgICBleHBlY3QocGFyc2luZy5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLnRvU3RyaW5nKCkpXG4gICAgICAgICAgICAudG8uYmUuZXFsKCdWYWxpZGF0aW9uLlN1Y2Nlc3MoW1tbbSxhLHIsYyxvXSxbbSxhLHIsYyxvXV0sY2lhb10pJyk7XG4gICAgfSk7XG4gICAgaXQoJ2NhbiBwYXJzZSBhbiBpbnRlZ2VyLCBubyBtYXR0ZXIgaG93IGxhcmdlLi4uJywgKCkgPT4ge1xuICAgICAgICBjb25zdCBwaW50ID0gbWFueTEoYW55T2YoZGlnaXRzKSk7XG4gICAgICAgIGxldCBwYXJzaW5nID0gcGludC5ydW4oJzEyMzQ1QScpO1xuICAgICAgICBleHBlY3QocGFyc2luZy5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgnVmFsaWRhdGlvbi5TdWNjZXNzKFtbMSwyLDMsNCw1XSxBXSknKTtcbiAgICAgICAgcGFyc2luZyA9IHBpbnQucnVuKCcxQicpO1xuICAgICAgICBleHBlY3QocGFyc2luZy5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgnVmFsaWRhdGlvbi5TdWNjZXNzKFtbMV0sQl0pJyk7XG4gICAgICAgIHBhcnNpbmcgPSBwaW50LnJ1bignQTEyMzQ1Jyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLmlzRmFpbHVyZSkudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcudG9TdHJpbmcoKSlcbiAgICAgICAgICAgIC50by5iZS5lcWwoJ1ZhbGlkYXRpb24uRmFpbHVyZShbbWFueTEgYW55T2YgMDEyMzQ1Njc4OSxfZmFpbF0pJyk7XG4gICAgfSk7XG4gICAgaXQoJ2NhbiBwYXJzZSBhbiBpbnRlZ2VyIGludG8gYSB0cnVlIGludGVnZXInLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHBpbnQgPSBtYW55MShhbnlPZihkaWdpdHMpKVxuICAgICAgICAgICAgLmZtYXAobCA9PiBwYXJzZUludChsLnJlZHVjZSgoYWNjLCBjdXJyKSA9PiBhY2MgKyBjdXJyLCAnJyksIDEwKSk7XG4gICAgICAgIGxldCBwYXJzaW5nID0gcGludC5ydW4oJzEyMzQ1QScpO1xuICAgICAgICBleHBlY3QocGFyc2luZy5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLnZhbHVlWzBdKS50by5iZS5lcWwoMTIzNDUpO1xuICAgICAgICBleHBlY3QocGFyc2luZy52YWx1ZVsxXSkudG8uYmUuZXFsKCdBJyk7XG4gICAgfSk7XG59KTtcblxuZGVzY3JpYmUoJ2EgcGFyc2VyIGZvciB6ZXJvIG9yIG1vcmUgb2NjdXJyZW5jZXMnLCAoKSA9PiB7XG4gICAgaXQoJ2NhbiBwYXJzZSBhIGNoYXIgemVybyB0aW1lcycsICgpID0+IHtcbiAgICAgICAgY29uc3QgemVyb09yTW9yZVBhcnNlciA9IG1hbnkocGNoYXIoJ20nKSk7XG4gICAgICAgIGxldCBwYXJzaW5nID0gemVyb09yTW9yZVBhcnNlci5ydW4oJ2FyY28nKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcuaXNTdWNjZXNzKS50by5iZS50cnVlO1xuICAgICAgICBleHBlY3QocGFyc2luZy50b1N0cmluZygpKS50by5iZS5lcWwoJ1ZhbGlkYXRpb24uU3VjY2VzcyhbW10sYXJjb10pJyk7XG4gICAgfSk7XG4gICAgaXQoJ2NhbiBwYXJzZSBhIGNoYXIgbWFueSB0aW1lcycsICgpID0+IHtcbiAgICAgICAgY29uc3QgemVyb09yTW9yZVBhcnNlciA9IG1hbnkocGNoYXIoJ20nKSk7XG4gICAgICAgIGxldCBwYXJzaW5nID0gemVyb09yTW9yZVBhcnNlci5ydW4oJ21tbWFyY28nKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcuaXNTdWNjZXNzKS50by5iZS50cnVlO1xuICAgICAgICBleHBlY3QocGFyc2luZy50b1N0cmluZygpKS50by5iZS5lcWwoJ1ZhbGlkYXRpb24uU3VjY2VzcyhbW20sbSxtXSxhcmNvXSknKTtcbiAgICB9KTtcbiAgICBpdCgnY2FuIHBhcnNlIGEgY2hhciBzZXF1ZW5jZSB6ZXJvIHRpbWVzJywgKCkgPT4ge1xuICAgICAgICBjb25zdCB6ZXJvT3JNb3JlUGFyc2VyID0gbWFueShwc3RyaW5nKCdtYXJjbycpKTtcbiAgICAgICAgbGV0IHBhcnNpbmcgPSB6ZXJvT3JNb3JlUGFyc2VyLnJ1bigneG1hcmNvbWFyY29jaWFvJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcudG9TdHJpbmcoKSkudG8uYmUuZXFsKCdWYWxpZGF0aW9uLlN1Y2Nlc3MoW1tdLHhtYXJjb21hcmNvY2lhb10pJyk7XG4gICAgfSk7XG4gICAgaXQoJ2NhbiBwYXJzZSBhIGNoYXIgc2VxdWVuY2UgbWFueSB0aW1lcycsICgpID0+IHtcbiAgICAgICAgY29uc3QgemVyb09yTW9yZVBhcnNlciA9IG1hbnkocHN0cmluZygnbWFyY28nKSk7XG4gICAgICAgIGxldCBwYXJzaW5nID0gemVyb09yTW9yZVBhcnNlci5ydW4oJ21hcmNvbWFyY29jaWFvJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcudG9TdHJpbmcoKSlcbiAgICAgICAgICAgIC50by5iZS5lcWwoJ1ZhbGlkYXRpb24uU3VjY2VzcyhbW1ttLGEscixjLG9dLFttLGEscixjLG9dXSxjaWFvXSknKTtcbiAgICB9KTtcbiAgICBpdCgnY2FuIHBhcnNlIHdoaXRlc3BhY2VzISEnLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHdoaXRlc1BhcnNlciA9IG1hbnkoYW55T2Yod2hpdGVzKSk7XG4gICAgICAgIGNvbnN0IHR3b1dvcmRzID0gc2VxdWVuY2VQKFtwc3RyaW5nKCdjaWFvJyksIHdoaXRlc1BhcnNlciwgcHN0cmluZygnbWFtbWEnKV0pO1xuICAgICAgICBsZXQgcGFyc2luZyA9IHR3b1dvcmRzLnJ1bignY2lhb21hbW1hWCcpO1xuICAgICAgICBleHBlY3QocGFyc2luZy50b1N0cmluZygpKVxuICAgICAgICAgICAgLnRvLmJlLmVxbCgnVmFsaWRhdGlvbi5TdWNjZXNzKFtbW2MsaSxhLG9dLFtdLFttLGEsbSxtLGFdXSxYXSknKTtcbiAgICAgICAgcGFyc2luZyA9IHR3b1dvcmRzLnJ1bignY2lhbyBtYW1tYVgnKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcudG9TdHJpbmcoKSlcbiAgICAgICAgICAgIC50by5iZS5lcWwoJ1ZhbGlkYXRpb24uU3VjY2VzcyhbW1tjLGksYSxvXSxbIF0sW20sYSxtLG0sYV1dLFhdKScpO1xuICAgICAgICBwYXJzaW5nID0gdHdvV29yZHMucnVuKCdjaWFvICAgbWFtbWFYJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLnRvU3RyaW5nKCkpXG4gICAgICAgICAgICAudG8uYmUuZXFsKCdWYWxpZGF0aW9uLlN1Y2Nlc3MoW1tbYyxpLGEsb10sWyAsICwgXSxbbSxhLG0sbSxhXV0sWF0pJyk7XG4gICAgICAgIHBhcnNpbmcgPSB0d29Xb3Jkcy5ydW4oJ2NpYW8gXFx0IG1hbW1hWCcpO1xuICAgICAgICBleHBlY3QocGFyc2luZy50b1N0cmluZygpKVxuICAgICAgICAgICAgLnRvLmJlLmVxbCgnVmFsaWRhdGlvbi5TdWNjZXNzKFtbW2MsaSxhLG9dLFsgLFxcdCwgXSxbbSxhLG0sbSxhXV0sWF0pJyk7XG4gICAgfSk7XG59KTtcblxuZGVzY3JpYmUoJ2EgcGFyc2luZyBmdW5jdGlvbiBmb3IgemVybyBvciBtb3JlIG9jY3VycmVuY2VzJywgKCkgPT4ge1xuICAgIGl0KCdjYW4gcGFyc2UgYSBjaGFyIHplcm8gdGltZXMnLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHplcm9Pck1vcmVQYXJzaW5nRnVuY3Rpb24gPSB6ZXJvT3JNb3JlKHBjaGFyKCdtJykpO1xuICAgICAgICBsZXQgcGFyc2luZyA9IHplcm9Pck1vcmVQYXJzaW5nRnVuY3Rpb24oJ2FyY28nKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcuaXNTdWNjZXNzKS50by5iZS50cnVlO1xuICAgICAgICBleHBlY3QocGFyc2luZy50b1N0cmluZygpKS50by5iZS5lcWwoJ1ZhbGlkYXRpb24uU3VjY2VzcyhbW10sYXJjb10pJyk7XG4gICAgfSk7XG4gICAgaXQoJ2NhbiBwYXJzZSBhIGNoYXIgbWFueSB0aW1lcycsICgpID0+IHtcbiAgICAgICAgY29uc3QgemVyb09yTW9yZVBhcnNpbmdGdW5jdGlvbiA9IHplcm9Pck1vcmUocGNoYXIoJ20nKSk7XG4gICAgICAgIGxldCBwYXJzaW5nID0gemVyb09yTW9yZVBhcnNpbmdGdW5jdGlvbignbW1tYXJjbycpO1xuICAgICAgICBleHBlY3QocGFyc2luZy5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgnVmFsaWRhdGlvbi5TdWNjZXNzKFtbbSxtLG1dLGFyY29dKScpO1xuICAgIH0pO1xuICAgIGl0KCdjYW4gcGFyc2UgYSBjaGFyIHNlcXVlbmNlIHplcm8gdGltZXMnLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHplcm9Pck1vcmVQYXJzaW5nRnVuY3Rpb24gPSB6ZXJvT3JNb3JlKHBzdHJpbmcoJ21hcmNvJykpO1xuICAgICAgICBsZXQgcGFyc2luZyA9IHplcm9Pck1vcmVQYXJzaW5nRnVuY3Rpb24oJ3htYXJjb21hcmNvY2lhbycpO1xuICAgICAgICBleHBlY3QocGFyc2luZy5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgnVmFsaWRhdGlvbi5TdWNjZXNzKFtbXSx4bWFyY29tYXJjb2NpYW9dKScpO1xuICAgIH0pO1xuICAgIGl0KCdjYW4gcGFyc2UgYSBjaGFyIHNlcXVlbmNlIG1hbnkgdGltZXMnLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHplcm9Pck1vcmVQYXJzaW5nRnVuY3Rpb24gPSB6ZXJvT3JNb3JlKHBzdHJpbmcoJ21hcmNvJykpO1xuICAgICAgICBsZXQgcGFyc2luZyA9IHplcm9Pck1vcmVQYXJzaW5nRnVuY3Rpb24oJ21hcmNvbWFyY29jaWFvJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcudG9TdHJpbmcoKSlcbiAgICAgICAgICAgIC50by5iZS5lcWwoJ1ZhbGlkYXRpb24uU3VjY2VzcyhbW1ttLGEscixjLG9dLFttLGEscixjLG9dXSxjaWFvXSknKTtcbiAgICB9KTtcbn0pO1xuXG5kZXNjcmliZSgnYSBwYXJzZXIgZm9yIGEgc3BlY2lmaWMgd29yZCcsICgpID0+IHtcbiAgICBpdCgnaXMgZWFzeSB0byBjcmVhdGUgd2l0aCBzZXF1ZW5jZVAnLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IG1hcmNvUGFyc2VyID0gcHN0cmluZygnbWFyY28nKTtcbiAgICAgICAgY29uc3QgbWFyY29QYXJzaW5nID0gbWFyY29QYXJzZXIucnVuKCdtYXJjb2NpYW8nKTtcbiAgICAgICAgZXhwZWN0KG1hcmNvUGFyc2luZy5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChtYXJjb1BhcnNpbmcudG9TdHJpbmcoKSlcbiAgICAgICAgICAgIC50by5iZS5lcWwoJ1ZhbGlkYXRpb24uU3VjY2VzcyhbW20sYSxyLGMsb10sY2lhb10pJyk7XG4gICAgfSk7XG59KTtcblxuZGVzY3JpYmUoJ3NlcXVlbmNlcyBvZiBwYXJzZXJzIGJhc2VkIG9uIGxpZnQyKGNvbnMpIChha2Egc2VxdWVuY2VQKScsICgpID0+IHtcbiAgICBpdCgnc3RvcmVzIG1hdGNoZWQgY2hhcnMgaW5zaWRlIGFuIGFycmF5JywgKCkgPT4ge1xuICAgICAgICBjb25zdCBhYmNQYXJzZXIgPSBzZXF1ZW5jZVAoW3BjaGFyKCdhJyksIHBjaGFyKCdiJyksIHBjaGFyKCdjJyksXSk7XG4gICAgICAgIGV4cGVjdChhYmNQYXJzZXIucnVuKCdhYmMnKS50b1N0cmluZygpKVxuICAgICAgICAgICAgLnRvLmJlLmVxbCgnVmFsaWRhdGlvbi5TdWNjZXNzKFtbYSxiLGNdLF0pJyk7XG4gICAgfSk7XG59KTtcblxuZGVzY3JpYmUoJ3NlcXVlbmNlcyBvZiBwYXJzZXJzIGJhc2VkIG9uIGFuZFRoZW4gJiYgZm1hcCAoYWthIHNlcXVlbmNlUDIpJywgKCkgPT4ge1xuICAgIGl0KCdzdG9yZSBtYXRjaGVkIGNoYXJzIGluc2lkZSBhIHBsYWluIHN0cmluZycsICgpID0+IHtcbiAgICAgICAgY29uc3QgYWJjUGFyc2VyID0gc2VxdWVuY2VQMihbcGNoYXIoJ2EnKSwgcGNoYXIoJ2InKSwgcGNoYXIoJ2MnKSxdKTtcbiAgICAgICAgZXhwZWN0KGFiY1BhcnNlci5ydW4oJ2FiYycpLnRvU3RyaW5nKCkpXG4gICAgICAgICAgICAudG8uYmUuZXFsKCdWYWxpZGF0aW9uLlN1Y2Nlc3MoW2FiYyxdKScpO1xuICAgIH0pO1xufSk7XG5cbmRlc2NyaWJlKCdsaWZ0MiBmb3IgcGFyc2VycycsICgpID0+IHtcbiAgICBpdCgnb3BlcmF0ZXMgb24gdGhlIHJlc3VsdHMgb2YgdHdvIHN0cmluZyBwYXJzaW5ncycsICgpID0+IHtcbiAgICAgICAgY29uc3QgYWRkU3RyaW5ncyA9IHggPT4geSA9PiB4ICsgJysnICsgeTtcbiAgICAgICAgY29uc3QgQXBsdXNCID0gbGlmdDIoYWRkU3RyaW5ncykocGNoYXIoJ2EnKSkocGNoYXIoJ2InKSk7XG4gICAgICAgIGV4cGVjdChBcGx1c0IucnVuKCdhYmMnKS50b1N0cmluZygpKS50by5iZS5lcWwoJ1ZhbGlkYXRpb24uU3VjY2VzcyhbYStiLGNdKScpO1xuICAgIH0pO1xuICAgIGl0KCdhZGRzIHRoZSByZXN1bHRzIG9mIHR3byBkaWdpdCBwYXJzaW5ncycsICgpID0+IHtcbiAgICAgICAgY29uc3QgYWRkRGlnaXRzID0geCA9PiB5ID0+IHggKyB5O1xuICAgICAgICBjb25zdCBhZGRQYXJzZXIgPSBsaWZ0MihhZGREaWdpdHMpKHBkaWdpdCgxKSkocGRpZ2l0KDIpKTtcbiAgICAgICAgZXhwZWN0KGFkZFBhcnNlci5ydW4oJzEyMzQnKS50b1N0cmluZygpKS50by5iZS5lcWwoJ1ZhbGlkYXRpb24uU3VjY2VzcyhbMywzNF0pJyk7XG4gICAgICAgIGV4cGVjdChhZGRQYXJzZXIucnVuKCcxNDQnKS5pc0ZhaWx1cmUpLnRvLmJlLnRydWU7XG4gICAgfSk7XG59KTtcblxuZGVzY3JpYmUoJ3BhcnNlIDMgZGlnaXRzJywgKCkgPT4ge1xuICAgIGNvbnN0IHBhcnNlRGlnaXQgPSBhbnlPZihkaWdpdHMpO1xuICAgIGxldCB0aHJlZURpZ2l0cyA9IGFuZFRoZW4ocGFyc2VEaWdpdCwgYW5kVGhlbihwYXJzZURpZ2l0LCBwYXJzZURpZ2l0KSk7XG4gICAgY29uc3QgcGFyc2luZyA9IHRocmVlRGlnaXRzLnJ1bignMTIzJyk7XG4gICAgaXQoJ3BhcnNlcyBhbnkgb2YgdGhyZWUgZGlnaXRzJywgKCkgPT4ge1xuICAgICAgICBleHBlY3QocGFyc2luZy5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLnZhbHVlWzBdLnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgnWzEsWzIsM11dJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLnZhbHVlWzFdKS50by5iZS5lcWwoJycpO1xuICAgIH0pO1xuICAgIGRlc2NyaWJlKCdwYXJzZXMgYW55IG9mIHRocmVlIGRpZ2l0cyB3aGlsZSBzaG93Y2FzaW5nIGZtYXAnLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHVucGFja2VyID0gKFt4LCBbeSwgel1dKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gW3gsIHksIHpdO1xuICAgICAgICB9O1xuICAgICAgICBpdCgnYXMgZ2xvYmFsIG1ldGhvZCcsICgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHRocmVlRGlnaXRzSW1wbCA9IGZtYXAodW5wYWNrZXIsIHRocmVlRGlnaXRzKTtcbiAgICAgICAgICAgIGxldCBwYXJzaW5nID0gdGhyZWVEaWdpdHNJbXBsLnJ1bignMTIzJyk7XG4gICAgICAgICAgICBleHBlY3QocGFyc2luZy5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgICAgICAgICBleHBlY3QocGFyc2luZy52YWx1ZVswXS50b1N0cmluZygpKS50by5iZS5lcWwoJ1sxLDIsM10nKTtcbiAgICAgICAgICAgIGV4cGVjdChwYXJzaW5nLnZhbHVlWzFdKS50by5iZS5lcWwoJycpO1xuICAgICAgICB9KTtcbiAgICAgICAgaXQoJ2FzIGluc3RhbmNlIG1ldGhvZCcsICgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHRocmVlRGlnaXRzSW5zdCA9IHRocmVlRGlnaXRzLmZtYXAodW5wYWNrZXIpO1xuICAgICAgICAgICAgbGV0IHBhcnNpbmcgPSB0aHJlZURpZ2l0c0luc3QucnVuKCcxMjMnKTtcbiAgICAgICAgICAgIGV4cGVjdChwYXJzaW5nLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcbiAgICAgICAgICAgIGV4cGVjdChwYXJzaW5nLnZhbHVlWzBdLnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgnWzEsMiwzXScpO1xuICAgICAgICAgICAgZXhwZWN0KHBhcnNpbmcudmFsdWVbMV0pLnRvLmJlLmVxbCgnJyk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xufSk7XG5cbmRlc2NyaWJlKCdwYXJzZSBBQkMnLCAoKSA9PiB7XG4gICAgaXQoJ3BhcnNlcyBBQkMnLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHBhaXJBZGRlciA9IChbeCwgeV0pID0+IHggKyB5O1xuICAgICAgICBjb25zdCBhYmNQID0gYW5kVGhlbihcbiAgICAgICAgICAgIHBjaGFyKCdhJyksXG4gICAgICAgICAgICBhbmRUaGVuKFxuICAgICAgICAgICAgICAgIHBjaGFyKCdiJyksXG4gICAgICAgICAgICAgICAgYW5kVGhlbihcbiAgICAgICAgICAgICAgICAgICAgcGNoYXIoJ2MnKSxcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuUCgnJylcbiAgICAgICAgICAgICAgICApLmZtYXAocGFpckFkZGVyKVxuICAgICAgICAgICAgKS5mbWFwKHBhaXJBZGRlcilcbiAgICAgICAgKS5mbWFwKHBhaXJBZGRlcik7XG4gICAgICAgIGNvbnN0IHBhcnNpbmcgPSBhYmNQLnJ1bignYWJjZCcpO1xuICAgICAgICBleHBlY3QocGFyc2luZy5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLnZhbHVlWzBdLnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgnYWJjJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLnZhbHVlWzFdKS50by5iZS5lcWwoJ2QnKTtcbiAgICB9KTtcbn0pO1xuXG5kZXNjcmliZSgnYSBwYXJzZXJzIGZvciBhbnkgb2YgYSBsaXN0IG9mIGNoYXJzJywgKCkgPT4ge1xuXG4gICAgaXQoJ2NhbiBwYXJzZSBhbnkgbG93ZXJjYXNlIGNoYXInLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IGxvd2VyY2FzZXNQYXJzZXIgPSBhbnlPZihsb3dlcmNhc2VzKTtcblxuICAgICAgICBleHBlY3QoaXNQYXJzZXIobG93ZXJjYXNlc1BhcnNlcikpLnRvLmJlLnRydWU7XG4gICAgICAgIGxldCBwYXJzaW5nQ2hvaWNlID0gbG93ZXJjYXNlc1BhcnNlci5ydW4oJ2EnKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UuaXNTdWNjZXNzKS50by5iZS50cnVlO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS52YWx1ZVswXSkudG8uYmUuZXFsKCdhJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLnZhbHVlWzFdKS50by5iZS5lcWwoJycpO1xuICAgICAgICBwYXJzaW5nQ2hvaWNlID0gbG93ZXJjYXNlc1BhcnNlci5ydW4oJ2InKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UuaXNTdWNjZXNzKS50by5iZS50cnVlO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS52YWx1ZVswXSkudG8uYmUuZXFsKCdiJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLnZhbHVlWzFdKS50by5iZS5lcWwoJycpO1xuICAgICAgICBwYXJzaW5nQ2hvaWNlID0gbG93ZXJjYXNlc1BhcnNlci5ydW4oJ2QnKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UuaXNTdWNjZXNzKS50by5iZS50cnVlO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS52YWx1ZVswXSkudG8uYmUuZXFsKCdkJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLnZhbHVlWzFdKS50by5iZS5lcWwoJycpO1xuICAgICAgICBwYXJzaW5nQ2hvaWNlID0gbG93ZXJjYXNlc1BhcnNlci5ydW4oJ3onKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UuaXNTdWNjZXNzKS50by5iZS50cnVlO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS52YWx1ZVswXSkudG8uYmUuZXFsKCd6Jyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLnZhbHVlWzFdKS50by5iZS5lcWwoJycpO1xuXG4gICAgICAgIHBhcnNpbmdDaG9pY2UgPSBsb3dlcmNhc2VzUGFyc2VyLnJ1bignWScpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS5pc0ZhaWx1cmUpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLnZhbHVlWzBdKS50by5iZS5lcWwoJ2FueU9mIGFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6Jyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLnZhbHVlWzFdKS50by5iZS5lcWwoJ19mYWlsJyk7XG4gICAgfSk7XG5cbiAgICBpdCgnY2FuIHBhcnNlIGFueSB1cHBlcmNhc2UgY2hhcicsICgpID0+IHtcbiAgICAgICAgbGV0IHVwcGVyY2FzZXNQYXJzZXIgPSBhbnlPZih1cHBlcmNhc2VzKTtcblxuICAgICAgICBleHBlY3QoaXNQYXJzZXIodXBwZXJjYXNlc1BhcnNlcikpLnRvLmJlLnRydWU7XG4gICAgICAgIGxldCBwYXJzaW5nQ2hvaWNlID0gdXBwZXJjYXNlc1BhcnNlci5ydW4oJ0EnKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UuaXNTdWNjZXNzKS50by5iZS50cnVlO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS52YWx1ZVswXSkudG8uYmUuZXFsKCdBJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLnZhbHVlWzFdKS50by5iZS5lcWwoJycpO1xuICAgICAgICBwYXJzaW5nQ2hvaWNlID0gdXBwZXJjYXNlc1BhcnNlci5ydW4oJ0InKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UuaXNTdWNjZXNzKS50by5iZS50cnVlO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS52YWx1ZVswXSkudG8uYmUuZXFsKCdCJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLnZhbHVlWzFdKS50by5iZS5lcWwoJycpO1xuICAgICAgICBwYXJzaW5nQ2hvaWNlID0gdXBwZXJjYXNlc1BhcnNlci5ydW4oJ1InKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UuaXNTdWNjZXNzKS50by5iZS50cnVlO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS52YWx1ZVswXSkudG8uYmUuZXFsKCdSJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLnZhbHVlWzFdKS50by5iZS5lcWwoJycpO1xuICAgICAgICBwYXJzaW5nQ2hvaWNlID0gdXBwZXJjYXNlc1BhcnNlci5ydW4oJ1onKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UuaXNTdWNjZXNzKS50by5iZS50cnVlO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS52YWx1ZVswXSkudG8uYmUuZXFsKCdaJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLnZhbHVlWzFdKS50by5iZS5lcWwoJycpO1xuXG4gICAgICAgIHBhcnNpbmdDaG9pY2UgPSB1cHBlcmNhc2VzUGFyc2VyLnJ1bigncycpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS5pc0ZhaWx1cmUpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLnZhbHVlWzBdKS50by5iZS5lcWwoJ2FueU9mIEFCQ0RFRkdISUpLTE1OT1BRUlNUVVZXWFlaJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLnZhbHVlWzFdKS50by5iZS5lcWwoJ19mYWlsJyk7XG4gICAgfSk7XG5cbiAgICBpdCgnY2FuIHBhcnNlIGFueSBkaWdpdCcsICgpID0+IHtcbiAgICAgICAgbGV0IGRpZ2l0c1BhcnNlciA9IGFueU9mKGRpZ2l0cyk7XG5cbiAgICAgICAgZXhwZWN0KGlzUGFyc2VyKGRpZ2l0c1BhcnNlcikpLnRvLmJlLnRydWU7XG4gICAgICAgIGxldCBwYXJzaW5nQ2hvaWNlID0gZGlnaXRzUGFyc2VyLnJ1bignMScpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLnZhbHVlWzBdKS50by5iZS5lcWwoJzEnKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UudmFsdWVbMV0pLnRvLmJlLmVxbCgnJyk7XG4gICAgICAgIHBhcnNpbmdDaG9pY2UgPSBkaWdpdHNQYXJzZXIucnVuKCczJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UudmFsdWVbMF0pLnRvLmJlLmVxbCgnMycpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS52YWx1ZVsxXSkudG8uYmUuZXFsKCcnKTtcbiAgICAgICAgcGFyc2luZ0Nob2ljZSA9IGRpZ2l0c1BhcnNlci5ydW4oJzAnKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UuaXNTdWNjZXNzKS50by5iZS50cnVlO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS52YWx1ZVswXSkudG8uYmUuZXFsKCcwJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLnZhbHVlWzFdKS50by5iZS5lcWwoJycpO1xuICAgICAgICBwYXJzaW5nQ2hvaWNlID0gZGlnaXRzUGFyc2VyLnJ1bignOCcpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLnZhbHVlWzBdKS50by5iZS5lcWwoJzgnKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UudmFsdWVbMV0pLnRvLmJlLmVxbCgnJyk7XG5cbiAgICAgICAgcGFyc2luZ0Nob2ljZSA9IGRpZ2l0c1BhcnNlci5ydW4oJ3MnKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UuaXNGYWlsdXJlKS50by5iZS50cnVlO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS52YWx1ZVswXSkudG8uYmUuZXFsKCdhbnlPZiAwMTIzNDU2Nzg5Jyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLnZhbHVlWzFdKS50by5iZS5lcWwoJ19mYWlsJyk7XG4gICAgfSk7XG59KTtcblxuZGVzY3JpYmUoJ2EgY2hvaWNlIG9mIHBhcnNlcnMgYm91bmQgYnkgb3JFbHNlJywgKCkgPT4ge1xuICAgIGNvbnN0IHBhcnNlcnNDaG9pY2UgPSBjaG9pY2UoW3BjaGFyKCdhJyksIHBjaGFyKCdiJyksIHBjaGFyKCdjJyksIHBjaGFyKCdkJyksXSk7XG5cbiAgICBpdCgnY2FuIHBhcnNlIG9uZSBvZiBmb3VyIGNoYXJzJywgKCkgPT4ge1xuICAgICAgICBleHBlY3QoaXNQYXJzZXIocGFyc2Vyc0Nob2ljZSkpLnRvLmJlLnRydWU7XG4gICAgICAgIGxldCBwYXJzaW5nQ2hvaWNlID0gcGFyc2Vyc0Nob2ljZS5ydW4oJ2EnKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UuaXNTdWNjZXNzKS50by5iZS50cnVlO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS52YWx1ZVswXSkudG8uYmUuZXFsKCdhJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLnZhbHVlWzFdKS50by5iZS5lcWwoJycpO1xuICAgICAgICBwYXJzaW5nQ2hvaWNlID0gcGFyc2Vyc0Nob2ljZS5ydW4oJ2InKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UuaXNTdWNjZXNzKS50by5iZS50cnVlO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS52YWx1ZVswXSkudG8uYmUuZXFsKCdiJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLnZhbHVlWzFdKS50by5iZS5lcWwoJycpO1xuICAgICAgICBwYXJzaW5nQ2hvaWNlID0gcGFyc2Vyc0Nob2ljZS5ydW4oJ2QnKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UuaXNTdWNjZXNzKS50by5iZS50cnVlO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS52YWx1ZVswXSkudG8uYmUuZXFsKCdkJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLnZhbHVlWzFdKS50by5iZS5lcWwoJycpO1xuICAgIH0pO1xuXG4gICAgaXQoJ2NhbiBhbHNvIHBhcnNlIE5PTkUgb2YgZm91ciBjaGFycycsICgpID0+IHtcbiAgICAgICAgY29uc3QgcGFyc2luZ0Nob2ljZSA9IHBhcnNlcnNDaG9pY2UucnVuKCd4Jyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLmlzRmFpbHVyZSkudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UudmFsdWVbMF0pLnRvLmJlLmVxbCgnY2hvaWNlIC9wY2hhcl9hL3BjaGFyX2IvcGNoYXJfYy9wY2hhcl9kJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLnZhbHVlWzFdKS50by5iZS5lcWwoJ19mYWlsJyk7XG4gICAgfSk7XG59KTtcblxuZGVzY3JpYmUoJ3R3byBwYXJzZXJzIGJvdW5kIGJ5IG9yRWxzZScsICgpID0+IHtcbiAgICBjb25zdCBwYXJzZXJBb3JCID0gb3JFbHNlKHBjaGFyKCdhJyksIHBjaGFyKCdiJykpO1xuXG4gICAgaXQoJ2NhbiBwYXJzZSBvbmUgb2YgdHdvIGNoYXJzJywgKCkgPT4ge1xuICAgICAgICBleHBlY3QoaXNQYXJzZXIocGFyc2VyQW9yQikpLnRvLmJlLnRydWU7XG4gICAgICAgIGxldCBwYXJzaW5nQW9yQiA9IHBhcnNlckFvckIucnVuKCdhYmMnKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdBb3JCLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdBb3JCLnZhbHVlWzBdKS50by5iZS5lcWwoJ2EnKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdBb3JCLnZhbHVlWzFdKS50by5iZS5lcWwoJ2JjJyk7XG4gICAgICAgIHBhcnNpbmdBb3JCID0gcGFyc2VyQW9yQi5ydW4oJ2JiYycpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0FvckIuaXNTdWNjZXNzKS50by5iZS50cnVlO1xuICAgICAgICBleHBlY3QocGFyc2luZ0FvckIudmFsdWVbMF0pLnRvLmJlLmVxbCgnYicpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0FvckIudmFsdWVbMV0pLnRvLmJlLmVxbCgnYmMnKTtcbiAgICB9KTtcblxuICAgIGl0KCdjYW4gYWxzbyBwYXJzZSBOT05FIG9mIHR3byBjaGFycycsICgpID0+IHtcbiAgICAgICAgY29uc3QgcGFyc2luZ0FvckIgPSBwYXJzZXJBb3JCLnJ1bignY2RlJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQW9yQi5pc0ZhaWx1cmUpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQW9yQi52YWx1ZVswXSkudG8uYmUuZXFsKCdwY2hhcl9hIG9yRWxzZSBwY2hhcl9iJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQW9yQi52YWx1ZVsxXSkudG8uYmUuZXFsKCd3YW50ZWQgYjsgZ290IGMnKTtcbiAgICB9KTtcbn0pO1xuXG5kZXNjcmliZSgndHdvIHBhcnNlcnMgYm91bmQgYnkgYW5kVGhlbicsICgpID0+IHtcbiAgICBjb25zdCBwYXJzZXJBYW5kQiA9IGFuZFRoZW4ocGNoYXIoJ2EnKSwgcGNoYXIoJ2InKSk7XG5cbiAgICBpdCgnY2FuIHBhcnNlIHR3byBjaGFycycsICgpID0+IHtcbiAgICAgICAgZXhwZWN0KGlzUGFyc2VyKHBhcnNlckFhbmRCKSkudG8uYmUudHJ1ZTtcbiAgICAgICAgY29uc3QgcGFyc2luZ0FhbmRCID0gcGFyc2VyQWFuZEIucnVuKCdhYmMnKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdBYW5kQi5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQWFuZEIudmFsdWVbMF0udG9TdHJpbmcoKSkudG8uYmUuZXFsKCdbYSxiXScpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0FhbmRCLnZhbHVlWzFdKS50by5iZS5lcWwoJ2MnKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdBYW5kQi50b1N0cmluZygpKS50by5iZS5lcWwoJ1ZhbGlkYXRpb24uU3VjY2VzcyhbW2EsYl0sY10pJyk7XG4gICAgfSk7XG5cbiAgICBpdCgnY2FuIGFsc28gTk9UIHBhcnNlIHR3byBjaGFycycsICgpID0+IHtcbiAgICAgICAgY29uc3QgcGFyc2luZ0FhbmRCID0gcGFyc2VyQWFuZEIucnVuKCdhY2QnKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdBYW5kQi5pc0ZhaWx1cmUpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQWFuZEIudmFsdWVbMF0pLnRvLmJlLmVxbCgncGNoYXJfYSBhbmRUaGVuIHBjaGFyX2InKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdBYW5kQi52YWx1ZVsxXSkudG8uYmUuZXFsKCd3YW50ZWQgYjsgZ290IGMnKTtcbiAgICB9KTtcbn0pO1xuXG5kZXNjcmliZSgnYSBzaW1wbGUgcGFyc2VyJywgKCkgPT4ge1xuICAgIGNvbnN0IHBhcnNlckEgPSBjaGFyUGFyc2VyKCdhJyk7XG4gICAgY29uc3QgcGFyc2VyMSA9IGRpZ2l0UGFyc2VyKDEpO1xuXG4gICAgaXQoJ2NhbiBwYXJzZSBhIHNpbmdsZSBjaGFyJywgKCkgPT4ge1xuICAgICAgICBjb25zdCBwYXJzaW5nQSA9IHBhcnNlckEoJ2FiYycpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0EudmFsdWVbMF0pLnRvLmJlLmVxbCgnYScpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0EudmFsdWVbMV0pLnRvLmJlLmVxbCgnYmMnKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdBLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcbiAgICB9KTtcblxuICAgIGl0KCdjYW4gYWxzbyBOT1QgcGFyc2UgYSBzaW5nbGUgY2hhcicsICgpID0+IHtcbiAgICAgICAgY29uc3QgcGFyc2luZ0IgPSBwYXJzZXJBKCdiY2QnKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdCLnZhbHVlWzBdKS50by5iZS5lcWwoJ2NoYXJQYXJzZXInKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdCLnZhbHVlWzFdKS50by5iZS5lcWwoJ3dhbnRlZCBhOyBnb3QgYicpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0IuaXNGYWlsdXJlKS50by5iZS50cnVlO1xuICAgIH0pO1xuXG4gICAgaXQoJ2NhbiBwYXJzZSBhIHNpbmdsZSBkaWdpdCcsICgpID0+IHtcbiAgICAgICAgY29uc3QgcGFyc2luZzEgPSBwYXJzZXIxKCcxMjMnKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcxLnZhbHVlWzBdKS50by5iZS5lcWwoMSk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nMS52YWx1ZVsxXSkudG8uYmUuZXFsKCcyMycpO1xuICAgICAgICBleHBlY3QocGFyc2luZzEuaXNTdWNjZXNzKS50by5iZS50cnVlO1xuICAgIH0pO1xuXG4gICAgaXQoJ2NhbiBhbHNvIE5PVCBwYXJzZSBhIHNpbmdsZSBkaWdpdCcsICgpID0+IHtcbiAgICAgICAgY29uc3QgcGFyc2luZzIgPSBwYXJzZXIxKCcyMzQnKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcyLnZhbHVlWzBdKS50by5iZS5lcWwoJ2RpZ2l0UGFyc2VyJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nMi52YWx1ZVsxXSkudG8uYmUuZXFsKCd3YW50ZWQgMTsgZ290IDInKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcyLmlzRmFpbHVyZSkudG8uYmUudHJ1ZTtcbiAgICB9KTtcblxuICAgIGl0KCdmYWlscyBhdCB0aGUgZW5kIG9mIHRoZSBzdHJlYW0gYWxzbyB3aGVuIGh1bnRpbmcgZm9yIGRpZ2l0cycsICgpID0+IHtcbiAgICAgICAgY29uc3QgcGFyc2luZzMgPSBwYXJzZXIxKCcnKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmczLnZhbHVlWzBdKS50by5iZS5lcWwoJ2RpZ2l0UGFyc2VyJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nMy52YWx1ZVsxXSkudG8uYmUuZXFsKCdubyBtb3JlIGlucHV0Jyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nMy5pc0ZhaWx1cmUpLnRvLmJlLnRydWU7XG4gICAgfSk7XG59KTtcblxuZGVzY3JpYmUoJ2Egc2xpZ2h0bHkgbW9yZSBjb21wbGV4IHBhcnNlcicsICgpID0+IHtcbiAgICBjb25zdCBwYXJzZXJBID0gY2hhclBhcnNlcignYScpO1xuXG4gICAgaXQoJ2NhbiBwYXJzZSBhIHNpbmdsZSBjaGFyJywgKCkgPT4ge1xuICAgICAgICBjb25zdCBwYXJzaW5nQSA9IHBhcnNlckEoJ2FiYycpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0EudmFsdWVbMF0pLnRvLmJlLmVxbCgnYScpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0EudmFsdWVbMV0pLnRvLmJlLmVxbCgnYmMnKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdBLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcbiAgICB9KTtcblxuICAgIGl0KCdmYWlscyBhdCB0aGUgZW5kIG9mIHRoZSBzdHJlYW0nLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHBhcnNpbmdBID0gcGFyc2VyQSgnJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQS52YWx1ZVswXSkudG8uYmUuZXFsKCdjaGFyUGFyc2VyJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQS52YWx1ZVsxXSkudG8uYmUuZXFsKCdubyBtb3JlIGlucHV0Jyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQS5pc0ZhaWx1cmUpLnRvLmJlLnRydWU7XG4gICAgfSk7XG5cbiAgICBpdCgnY2FuIGFsc28gTk9UIHBhcnNlIGEgc2luZ2xlIGNoYXInLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHBhcnNpbmdCID0gcGFyc2VyQSgnYmNkJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQi52YWx1ZVswXSkudG8uYmUuZXFsKCdjaGFyUGFyc2VyJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQi52YWx1ZVsxXSkudG8uYmUuZXFsKCd3YW50ZWQgYTsgZ290IGInKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdCLmlzRmFpbHVyZSkudG8uYmUudHJ1ZTtcbiAgICB9KTtcbn0pO1xuXG5kZXNjcmliZSgnYSBuYW1lZCBjaGFyYWN0ZXIgcGFyc2VyJywgKCkgPT4ge1xuICAgIGNvbnN0IHBhcnNlckEgPSBwY2hhcignYScpO1xuXG4gICAgaXQoJ2NhbiBwYXJzZSBhIHNpbmdsZSBjaGFyJywgKCkgPT4ge1xuICAgICAgICBleHBlY3QoaXNQYXJzZXIocGFyc2VyQSkpLnRvLmJlLnRydWU7XG4gICAgICAgIGNvbnN0IHBhcnNpbmdBID0gcGFyc2VyQS5ydW4oJ2FiYycpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0EudmFsdWVbMF0pLnRvLmJlLmVxbCgnYScpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0EudmFsdWVbMV0pLnRvLmJlLmVxbCgnYmMnKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdBLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcbiAgICB9KTtcblxuICAgIGl0KCdjYW4gYWxzbyBOT1QgcGFyc2UgYSBzaW5nbGUgY2hhcicsICgpID0+IHtcbiAgICAgICAgY29uc3QgcGFyc2luZ0IgPSBwYXJzZXJBLnJ1bignYmNkJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQi52YWx1ZVswXSkudG8uYmUuZXFsKCdwY2hhcl9hJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQi52YWx1ZVsxXSkudG8uYmUuZXFsKCd3YW50ZWQgYTsgZ290IGInKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdCLmlzRmFpbHVyZSkudG8uYmUudHJ1ZTtcbiAgICB9KTtcbn0pO1xuIl19