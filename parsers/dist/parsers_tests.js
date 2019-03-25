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

    describe('a parser for the start of the input', function () {
        it('succeeds at the start of the stream', function () {
            (0, _chai.expect)(_parsers.startOfInputP.run(_classes.Position.fromText('abc')).isSuccess).to.be.true;
        });
        it('fails halfway through the stream', function () {
            var laterInTheStream = (0, _parsers.sequenceP)([(0, _parsers.pchar)('a'), _parsers.startOfInputP]);
            (0, _chai.expect)(laterInTheStream.run(_classes.Position.fromText('abc')).isFailure).to.be.true;
        });
        it('does not consume characters, but it returns an empty string as result', function () {
            var startABC = (0, _parsers.sequenceP)([_parsers.startOfInputP, (0, _parsers.pchar)('A'), (0, _parsers.pchar)('B'), (0, _parsers.pchar)('C')]);
            var parsing = startABC.run(_classes.Position.fromText('ABC'));
            (0, _chai.expect)(parsing.toString()).to.be.eql('Validation.Success([[,A,B,C],row=1;col=0;rest=])');
        });
    });

    describe('a parser for NOT the start of the input', function () {
        it('fails at the start of the stream', function () {
            (0, _chai.expect)(_parsers.notStartOfInputP.run(_classes.Position.fromText('abc')).isFailure).to.be.true;
        });
        it('succeeds halfway through the stream', function () {
            var laterInTheStream = (0, _parsers.sequenceP)([(0, _parsers.pchar)('a'), _parsers.notStartOfInputP]);
            (0, _chai.expect)(laterInTheStream.run(_classes.Position.fromText('abc')).isSuccess).to.be.true;
        });
        it('does not consume characters, but it returns an empty string as result', function () {
            var ABNotStartC = (0, _parsers.sequenceP)([(0, _parsers.pchar)('A'), (0, _parsers.pchar)('B'), _parsers.notStartOfInputP, (0, _parsers.pchar)('C')]);
            var parsing = ABNotStartC.run(_classes.Position.fromText('ABC'));
            (0, _chai.expect)(parsing.toString()).to.be.eql('Validation.Success([[A,B,,C],row=1;col=0;rest=])');
        });
    });

    describe('a parser for the end of the input', function () {
        it('succeeds at the end of the stream', function () {
            var finallyInTheStream = (0, _parsers.sequenceP)([(0, _parsers.pchar)('a'), (0, _parsers.pchar)('b'), _parsers.endOfInputP]);
            (0, _chai.expect)(finallyInTheStream.run(_classes.Position.fromText('ab')).isSuccess).to.be.true;
        });
        it('fails halfway through the stream', function () {
            var laterInTheStream = (0, _parsers.sequenceP)([(0, _parsers.pchar)('a'), _parsers.endOfInputP]);
            (0, _chai.expect)(laterInTheStream.run(_classes.Position.fromText('abc')).isFailure).to.be.true;
        });
    });

    describe('a parser for NOT the end of the input', function () {
        it('fails at the end of the stream', function () {
            var notFinallyInTheStream = (0, _parsers.sequenceP)([(0, _parsers.pchar)('a'), _parsers.notEndOfInputP]);
            (0, _chai.expect)(notFinallyInTheStream.run(_classes.Position.fromText('a')).isFailure).to.be.true;
        });
        it('succeeds halfway through the stream', function () {
            var ABnotEndC = (0, _parsers.sequenceP)([(0, _parsers.pchar)('A'), (0, _parsers.pchar)('B'), _parsers.notEndOfInputP, (0, _parsers.pchar)('C')].map(_parsers.logP));
            (0, _chai.expect)(ABnotEndC.run(_classes.Position.fromText('ABC')).isSuccess).to.be.true;
        });
        it('does not consume characters, but it returns an empty string as result', function () {
            var AnotEndB = (0, _parsers.sequenceP)([(0, _parsers.pchar)('A'), _parsers.notEndOfInputP, (0, _parsers.pchar)('B')].map(_parsers.logP));
            (0, _chai.expect)(AnotEndB.run(_classes.Position.fromText('AB')).toString()).to.be.eql('Validation.Success([[A,,B],row=1;col=0;rest=])');
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

    describe('a succeeding parser', function () {
        var whatever = _classes.Position.fromText('whatever');
        it('succeeds always', function () {
            (0, _chai.expect)(_parsers.succeedP.run(whatever).isSuccess).to.be.true;
            var parsing = (0, _parsers.sequenceP)([(0, _parsers.pchar)('w'), (0, _parsers.pchar)('h'), _parsers.succeedP]).run(whatever);
            (0, _chai.expect)(parsing.toString()).to.be.eql('Validation.Success([[w,h,],row=0;col=2;rest=atever])');
        });
        it('does not consume characters, but it returns an empty string as result', function () {
            var parsing = (0, _parsers.sequenceP)([(0, _parsers.pchar)('w'), _parsers.succeedP, (0, _parsers.pchar)('h')]);
            (0, _chai.expect)(parsing.run(whatever).toString()).to.be.eql('Validation.Success([[w,,h],row=0;col=2;rest=atever])');
        });
    });

    describe('a failing parser', function () {
        it('will always fail', function () {
            (0, _chai.expect)(_parsers.failP.run('whatever').isFailure).to.be.true;
            (0, _chai.expect)((0, _parsers.sequenceP)([(0, _parsers.pchar)('w'), _parsers.failP]).run('whatever').isFailure).to.be.true;
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
            (0, _chai.expect)(parsingChoice.value[1]).to.be.eql('fail');
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
            (0, _chai.expect)(parsingChoice.value[1]).to.be.eql('fail');
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
            (0, _chai.expect)(parsingChoice.value[1]).to.be.eql('fail');
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
            (0, _chai.expect)(parsingChoice.value[1]).to.be.eql('fail');
            (0, _chai.expect)(parsingChoice.value[2].rest()).to.be.eql('s');
        });

        it('will fail if the input is too short', function () {
            (0, _chai.expect)((0, _parsers.anyOf)(lowercases).run(text('')).isFailure).to.be.true;
            (0, _chai.expect)((0, _parsers.anyOf)(digits).run(text('')).isFailure).to.be.true;
        });
    });

    describe('parsers that consider precedences', function () {

        describe('can parse X preceded by Y', function () {
            var XafterY = (0, _parsers.precededByP)('Y', 'X');
            it('even if Y has been consumed by the parser before', function () {
                var YXp = (0, _parsers.many1)((0, _parsers.choice)([(0, _parsers.pchar)('Y'), XafterY]));
                var parsingYX = YXp.run(text('YX'));
                (0, _chai.expect)(parsingYX.isSuccess).to.be.true;
                (0, _chai.expect)(parsingYX.toString()).to.be.eql('Validation.Success([[Y,X],row=1;col=0;rest=])');
            });
            it('and halt when X is not preceded by Y', function () {
                var AXp = (0, _parsers.many1)((0, _parsers.choice)([(0, _parsers.pchar)('A'), XafterY]));
                var parsingAX = AXp.run(text('AX'));
                (0, _chai.expect)(parsingAX.isSuccess).to.be.true;
                (0, _chai.expect)(parsingAX.value[1].rest()).to.be.eql('X');
            });
            it('and fail when X is at the start of the string', function () {
                var AXp = (0, _parsers.many1)((0, _parsers.choice)([(0, _parsers.pchar)('A'), XafterY]));
                var parsingAX = AXp.run(text('XA'));
                (0, _chai.expect)(parsingAX.isFailure).to.be.true;
            });
        });

        describe('can parse X not preceded by Y', function () {
            var XnotAfterY = (0, _parsers.notPrecededByP)('Y', 'X');

            it('even if the previous char has been consumed by the parser before', function () {
                var AXp = (0, _parsers.many1)((0, _parsers.choice)([(0, _parsers.pchar)('A'), XnotAfterY]));
                var parsingAX = AXp.run(text('AX'));
                (0, _chai.expect)(parsingAX.isSuccess).to.be.true;
                (0, _chai.expect)(parsingAX.toString()).to.be.eql('Validation.Success([[A,X],row=1;col=0;rest=])');
            });
            it('and halt when X is the first char in the string', function () {
                var AXp = (0, _parsers.many1)((0, _parsers.choice)([(0, _parsers.pchar)('A'), XnotAfterY]));
                var parsingAX = AXp.run(text('XA'));
                (0, _chai.expect)(parsingAX.isSuccess).to.be.true;
                (0, _chai.expect)(parsingAX.toString()).to.be.eql('Validation.Success([[X,A],row=1;col=0;rest=])');
            });
            it('and halt when X is preceded by Y', function () {
                var YXp = (0, _parsers.many1)((0, _parsers.choice)([(0, _parsers.pchar)('Y'), XnotAfterY]));
                var parsingYX = YXp.run(text('YX'));
                (0, _chai.expect)(parsingYX.isSuccess).to.be.true;
                (0, _chai.expect)(parsingYX.value[1].rest()).to.be.eql('X');
            });
        });
    });

    describe('a parser for abc', function () {
        it('parses abc', function () {
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
        it('has a version that returns strings', function () {
            var marcoParser = (0, _parsers.stringP)('marco');
            var marcoParsing = marcoParser.run('marcociao');
            (0, _chai.expect)(marcoParsing.isSuccess).to.be.true;
            (0, _chai.expect)(marcoParsing.toString()).to.be.eql('Validation.Success([marco,row=0;col=5;rest=ciao])');
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
            (0, _chai.expect)(parsing.toString()).to.be.eql('Validation.Failure([many1 anyOf 0123456789,fail,A12345])');
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
            (0, _chai.expect)(parsing.toString()).to.be.eql('Validation.Success([8,row=0;col=2;rest=x])');
        });
        it('can log a result that\'s going to be discarded', function () {
            console.log = function (msg) {
                (0, _chai.expect)(msg).to.be.eql('many1 anyOf  \t\n\r:[ , ]');
            };
            var discardSuffix = (0, _parsers.pstring)('marco').discardSecond((0, _parsers.logP)((0, _parsers.many1)((0, _parsers.anyOf)(whites))));
            var parsing = discardSuffix.run('marco  faustinelli');
            (0, _chai.expect)(parsing.toString()).to.be.eql('Validation.Success([[m,a,r,c,o],row=0;col=7;rest=faustinelli])');
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2pzLXNwZWMvcGFyc2Vyc190ZXN0cy5qcyJdLCJuYW1lcyI6WyJsb3dlcmNhc2VzIiwidXBwZXJjYXNlcyIsImRpZ2l0cyIsIndoaXRlcyIsInRleHQiLCJQb3NpdGlvbiIsImZyb21UZXh0IiwiZGVzY3JpYmUiLCJwYXJzZXJBIiwicGFyc2VyMSIsIml0IiwicGFyc2luZ0EiLCJ2YWx1ZSIsInRvIiwiYmUiLCJlcWwiLCJyZXN0IiwiaXNTdWNjZXNzIiwidHJ1ZSIsInBhcnNpbmdCIiwiaXNGYWlsdXJlIiwicGFyc2luZzEiLCJwYXJzaW5nMiIsInBhcnNpbmczIiwicnVuIiwic3RhcnRPZklucHV0UCIsImxhdGVySW5UaGVTdHJlYW0iLCJzdGFydEFCQyIsInBhcnNpbmciLCJ0b1N0cmluZyIsIm5vdFN0YXJ0T2ZJbnB1dFAiLCJBQk5vdFN0YXJ0QyIsImZpbmFsbHlJblRoZVN0cmVhbSIsImVuZE9mSW5wdXRQIiwibm90RmluYWxseUluVGhlU3RyZWFtIiwibm90RW5kT2ZJbnB1dFAiLCJBQm5vdEVuZEMiLCJtYXAiLCJsb2dQIiwiQW5vdEVuZEIiLCJwYXJzZXJBYW5kQiIsInBhcnNpbmdBYW5kQiIsInBhcnNlckFvckIiLCJwYXJzaW5nQW9yQiIsIndoYXRldmVyIiwic3VjY2VlZFAiLCJmYWlsUCIsInBhcnNlcnNDaG9pY2UiLCJwYXJzaW5nQ2hvaWNlIiwibG93ZXJjYXNlc1BhcnNlciIsInVwcGVyY2FzZXNQYXJzZXIiLCJkaWdpdHNQYXJzZXIiLCJYYWZ0ZXJZIiwiWVhwIiwicGFyc2luZ1lYIiwiQVhwIiwicGFyc2luZ0FYIiwiWG5vdEFmdGVyWSIsInBhaXJBZGRlciIsIngiLCJ5IiwiYWJjUCIsImZtYXAiLCJwYXJzZURpZ2l0IiwidGhyZWVEaWdpdHMiLCJiZWZvcmUiLCJ1bnBhY2tlciIsInoiLCJ0aHJlZURpZ2l0c0ltcGwiLCJ0aHJlZURpZ2l0c0luc3QiLCJhZGRTdHJpbmdzIiwiQXBsdXNCIiwiYWRkRGlnaXRzIiwiYWRkUGFyc2VyIiwiYWJjUGFyc2VyIiwibWFyY29QYXJzZXIiLCJtYXJjb1BhcnNpbmciLCJ0cmltbWVyIiwiYW5kVGhlbiIsInplcm9Pck1vcmVQYXJzaW5nRnVuY3Rpb24iLCJ6ZXJvT3JNb3JlUGFyc2VyIiwiZXhhY3RseVRocmVlIiwid2hpdGVzUGFyc2VyIiwidHdvV29yZHMiLCJvbmVPck1vcmVQYXJzZXIiLCJwaW50IiwicGFyc2VJbnQiLCJsIiwicmVkdWNlIiwiYWNjIiwiY3VyciIsIm9wdERvdFRoZW5BIiwib3B0RG90V2l0aERlZmF1bHRUaGVuQSIsInBTaWduZWRJbnQiLCJvcHRTaWduTnVtYmVyUGFpciIsImlzSnVzdCIsIm9wdFN1YnN0cmluZyIsImRpc2NhcmRJbnRlZ2VyU2lnbiIsImRpc2NhcmRGaXJzdCIsImRpc2NhcmRTdWZmaXgiLCJkaXNjYXJkU2Vjb25kIiwidGFwSW50b0Rpc2NhcmRJbnRlZ2VyU2lnbiIsInJlcyIsInN0b3JlZExvZyIsImNvbnNvbGUiLCJsb2ciLCJtc2ciLCJsb2dJbnRlcm1lZGlhdGVSZXN1bHQiLCJpbnNpZGVQYXJlbnMiLCJzdWJzdHJpbmdzV2l0aENvbW1hcyIsImxpc3RFbGVtZW50cyIsInZhbHVlc1AiLCJjb21tYVAiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBdURBLFFBQU1BLGFBQWEsQ0FBQyxHQUFELEVBQU0sR0FBTixFQUFXLEdBQVgsRUFBZ0IsR0FBaEIsRUFBcUIsR0FBckIsRUFBMEIsR0FBMUIsRUFBK0IsR0FBL0IsRUFBb0MsR0FBcEMsRUFBeUMsR0FBekMsRUFBOEMsR0FBOUMsRUFBbUQsR0FBbkQsRUFBd0QsR0FBeEQsRUFBNkQsR0FBN0QsRUFBa0UsR0FBbEUsRUFBdUUsR0FBdkUsRUFBNEUsR0FBNUUsRUFBaUYsR0FBakYsRUFBc0YsR0FBdEYsRUFBMkYsR0FBM0YsRUFBZ0csR0FBaEcsRUFBcUcsR0FBckcsRUFBMEcsR0FBMUcsRUFBK0csR0FBL0csRUFBb0gsR0FBcEgsRUFB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b0JBQU0sR0FBTixDQUE3QyxDQUFyQjtBQUNBLGtDQUFPRixhQUFhdEYsR0FBYixDQUFpQixJQUFqQixFQUF1QkssUUFBdkIsRUFBUCxFQUNLaEIsRUFETCxDQUNRQyxFQURSLENBQ1dDLEdBRFgsQ0FDZSw0Q0FEZjtBQUVILGFBSkQ7QUFLQUwsZUFBRyxnQ0FBSCxFQUFxQyxZQUFNO0FBQ3ZDLG9CQUFNb0csZUFBZSxzQkFBUSxvQkFBTSxHQUFOLENBQVIsRUFBb0IscUJBQU9DLE9BQVAsRUFBZ0JDLE1BQWhCLENBQXBCLEVBQTZDLG9CQUFNLEdBQU4sQ0FBN0MsQ0FBckI7QUFDQSxrQ0FBT0YsYUFBYXRGLEdBQWIsQ0FBaUIsS0FBakIsRUFBd0JLLFFBQXhCLEVBQVAsRUFDS2hCLEVBREwsQ0FDUUMsRUFEUixDQUNXQyxHQURYLENBQ2UsK0NBRGY7QUFFSCxhQUpEO0FBS0gsU0F0QkQ7QUF1QkgsS0FqREQiLCJmaWxlIjoicGFyc2Vyc190ZXN0cy5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7ZXhwZWN0fSBmcm9tICdjaGFpJztcbmltcG9ydCB7XG4gICAgY2hhclBhcnNlcixcbiAgICBkaWdpdFBhcnNlcixcbiAgICBwY2hhcixcbiAgICBwZGlnaXQsXG4gICAgYW5kVGhlbixcbiAgICBvckVsc2UsXG4gICAgY2hvaWNlLFxuICAgIGFueU9mLFxuICAgIGZtYXAsXG4gICAgcmV0dXJuUCxcbiAgICBhcHBseVAsXG4gICAgbGlmdDIsXG4gICAgc2VxdWVuY2VQLFxuICAgIHNlcXVlbmNlUDIsXG4gICAgcHN0cmluZyxcbiAgICBzdHJpbmdQLFxuICAgIHplcm9Pck1vcmUsXG4gICAgbWFueSxcbiAgICBtYW55MSxcbiAgICBtYW55Q2hhcnMsXG4gICAgbWFueUNoYXJzMSxcbiAgICBvcHQsXG4gICAgb3B0Qm9vayxcbiAgICBkaXNjYXJkRmlyc3QsXG4gICAgZGlzY2FyZFNlY29uZCxcbiAgICBzZXBCeTEsXG4gICAgYmV0d2VlbixcbiAgICBiZXR3ZWVuUGFyZW5zLFxuICAgIHRhcFAsXG4gICAgbG9nUCxcbiAgICBwd29yZCxcbiAgICB0cmltUCxcbiAgICBwcmVjZWRlZEJ5UCxcbiAgICBub3RQcmVjZWRlZEJ5UCxcbiAgICBzdGFydE9mSW5wdXRQLFxuICAgIG5vdFN0YXJ0T2ZJbnB1dFAsXG4gICAgZW5kT2ZJbnB1dFAsXG4gICAgbm90RW5kT2ZJbnB1dFAsXG4gICAgc3VjY2VlZFAsXG4gICAgZmFpbFAsXG59IGZyb20gJ3BhcnNlcnMnO1xuaW1wb3J0IHtcbiAgICBpc1BhaXIsXG4gICAgaXNTdWNjZXNzLFxuICAgIGlzRmFpbHVyZSxcbiAgICBpc1BhcnNlcixcbiAgICBpc1NvbWUsXG4gICAgaXNOb25lLFxufSBmcm9tICd1dGlsJztcbmltcG9ydCB7TWF5YmV9IGZyb20gJ21heWJlJztcbmltcG9ydCB7VmFsaWRhdGlvbn0gZnJvbSAndmFsaWRhdGlvbic7XG5pbXBvcnQge1Bvc2l0aW9ufSBmcm9tICdjbGFzc2VzJztcblxuY29uc3QgbG93ZXJjYXNlcyA9IFsnYScsICdiJywgJ2MnLCAnZCcsICdlJywgJ2YnLCAnZycsICdoJywgJ2knLCAnaicsICdrJywgJ2wnLCAnbScsICduJywgJ28nLCAncCcsICdxJywgJ3InLCAncycsICd0JywgJ3UnLCAndicsICd3JywgJ3gnLCAneScsICd6JyxdO1xuY29uc3QgdXBwZXJjYXNlcyA9IFsnQScsICdCJywgJ0MnLCAnRCcsICdFJywgJ0YnLCAnRycsICdIJywgJ0knLCAnSicsICdLJywgJ0wnLCAnTScsICdOJywgJ08nLCAnUCcsICdRJywgJ1InLCAnUycsICdUJywgJ1UnLCAnVicsICdXJywgJ1gnLCAnWScsICdaJyxdO1xuY29uc3QgZGlnaXRzID0gWycwJywgJzEnLCAnMicsICczJywgJzQnLCAnNScsICc2JywgJzcnLCAnOCcsICc5J107XG5jb25zdCB3aGl0ZXMgPSBbJyAnLCAnXFx0JywgJ1xcbicsICdcXHInXTtcbmNvbnN0IHRleHQgPSBQb3NpdGlvbi5mcm9tVGV4dDtcblxuZGVzY3JpYmUoJ2EgdmVyeSBzaW1wbGUgcGFyc2VyIGZvciBjaGFycyBvciBmb3IgZGlnaXRzJywgKCkgPT4ge1xuICAgIGNvbnN0IHBhcnNlckEgPSBjaGFyUGFyc2VyKCdhJyk7XG4gICAgY29uc3QgcGFyc2VyMSA9IGRpZ2l0UGFyc2VyKDEpO1xuXG4gICAgaXQoJ2NhbiBwYXJzZSBhIHNpbmdsZSBjaGFyJywgKCkgPT4ge1xuICAgICAgICBjb25zdCBwYXJzaW5nQSA9IHBhcnNlckEodGV4dCgnYWJjJykpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0EudmFsdWVbMF0pLnRvLmJlLmVxbCgnYScpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0EudmFsdWVbMV0ucmVzdCgpKS50by5iZS5lcWwoJ2JjJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQS5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgfSk7XG5cbiAgICBpdCgnY2FuIGFsc28gTk9UIHBhcnNlIGEgc2luZ2xlIGNoYXInLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHBhcnNpbmdCID0gcGFyc2VyQSh0ZXh0KCdiY2QnKSk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQi52YWx1ZVswXSkudG8uYmUuZXFsKCdjaGFyUGFyc2VyJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQi52YWx1ZVsxXSkudG8uYmUuZXFsKCd3YW50ZWQgYTsgZ290IGInKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdCLnZhbHVlWzJdLnJlc3QoKSkudG8uYmUuZXFsKCdiY2QnKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdCLmlzRmFpbHVyZSkudG8uYmUudHJ1ZTtcbiAgICB9KTtcblxuICAgIGl0KCdmYWlscyBhdCB0aGUgZW5kIG9mIHRoZSBzdHJlYW0nLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHBhcnNpbmdBID0gcGFyc2VyQSh0ZXh0KCcnKSk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQS52YWx1ZVswXSkudG8uYmUuZXFsKCdjaGFyUGFyc2VyJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQS52YWx1ZVsxXSkudG8uYmUuZXFsKCdubyBtb3JlIGlucHV0Jyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQS52YWx1ZVsyXS5yZXN0KCkpLnRvLmJlLmVxbCgnJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQS5pc0ZhaWx1cmUpLnRvLmJlLnRydWU7XG4gICAgfSk7XG5cbiAgICBpdCgnY2FuIHBhcnNlIGEgc2luZ2xlIGRpZ2l0JywgKCkgPT4ge1xuICAgICAgICBjb25zdCBwYXJzaW5nMSA9IHBhcnNlcjEodGV4dCgnMTIzJykpO1xuICAgICAgICBleHBlY3QocGFyc2luZzEudmFsdWVbMF0pLnRvLmJlLmVxbCgxKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcxLnZhbHVlWzFdLnJlc3QoKSkudG8uYmUuZXFsKCcyMycpO1xuICAgICAgICBleHBlY3QocGFyc2luZzEuaXNTdWNjZXNzKS50by5iZS50cnVlO1xuICAgIH0pO1xuXG4gICAgaXQoJ2NhbiBhbHNvIE5PVCBwYXJzZSBhIHNpbmdsZSBkaWdpdCcsICgpID0+IHtcbiAgICAgICAgY29uc3QgcGFyc2luZzIgPSBwYXJzZXIxKHRleHQoJzIzNCcpKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcyLnZhbHVlWzBdKS50by5iZS5lcWwoJ2RpZ2l0UGFyc2VyJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nMi52YWx1ZVsxXSkudG8uYmUuZXFsKCd3YW50ZWQgMTsgZ290IDInKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcyLnZhbHVlWzJdLnJlc3QoKSkudG8uYmUuZXFsKCcyMzQnKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcyLmlzRmFpbHVyZSkudG8uYmUudHJ1ZTtcbiAgICB9KTtcblxuICAgIGl0KCdmYWlscyBhdCB0aGUgZW5kIG9mIHRoZSBzdHJlYW0gYWxzbyB3aGVuIGh1bnRpbmcgZm9yIGRpZ2l0cycsICgpID0+IHtcbiAgICAgICAgY29uc3QgcGFyc2luZzMgPSBwYXJzZXIxKHRleHQoJycpKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmczLnZhbHVlWzBdKS50by5iZS5lcWwoJ2RpZ2l0UGFyc2VyJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nMy52YWx1ZVsxXSkudG8uYmUuZXFsKCdubyBtb3JlIGlucHV0Jyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nMy52YWx1ZVsyXS5yZXN0KCkpLnRvLmJlLmVxbCgnJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nMy5pc0ZhaWx1cmUpLnRvLmJlLnRydWU7XG4gICAgfSk7XG59KTtcblxuZGVzY3JpYmUoJ2EgbmFtZWQgY2hhcmFjdGVyIHBhcnNlcicsICgpID0+IHtcbiAgICBjb25zdCBwYXJzZXJBID0gcGNoYXIoJ2EnKTtcblxuICAgIGl0KCdjYW4gcGFyc2UgYSBzaW5nbGUgY2hhcicsICgpID0+IHtcbiAgICAgICAgZXhwZWN0KGlzUGFyc2VyKHBhcnNlckEpKS50by5iZS50cnVlO1xuICAgICAgICBjb25zdCBwYXJzaW5nQSA9IHBhcnNlckEucnVuKHRleHQoJ2FiYycpKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdBLnZhbHVlWzBdKS50by5iZS5lcWwoJ2EnKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdBLnZhbHVlWzFdLnJlc3QoKSkudG8uYmUuZXFsKCdiYycpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0EuaXNTdWNjZXNzKS50by5iZS50cnVlO1xuICAgIH0pO1xuXG4gICAgaXQoJ2NhbiBhbHNvIE5PVCBwYXJzZSBhIHNpbmdsZSBjaGFyJywgKCkgPT4ge1xuICAgICAgICBjb25zdCBwYXJzaW5nQiA9IHBhcnNlckEucnVuKHRleHQoJ2JjZCcpKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdCLnZhbHVlWzBdKS50by5iZS5lcWwoJ3BjaGFyX2EnKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdCLnZhbHVlWzFdKS50by5iZS5lcWwoJ3dhbnRlZCBhOyBnb3QgYicpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0IuaXNGYWlsdXJlKS50by5iZS50cnVlO1xuICAgIH0pO1xufSk7XG5cbmRlc2NyaWJlKCdhIHBhcnNlciBmb3IgdGhlIHN0YXJ0IG9mIHRoZSBpbnB1dCcsICgpID0+IHtcbiAgaXQoJ3N1Y2NlZWRzIGF0IHRoZSBzdGFydCBvZiB0aGUgc3RyZWFtJywgKCkgPT4ge1xuICAgIGV4cGVjdChzdGFydE9mSW5wdXRQLnJ1bihQb3NpdGlvbi5mcm9tVGV4dCgnYWJjJykpLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcbiAgfSk7XG4gIGl0KCdmYWlscyBoYWxmd2F5IHRocm91Z2ggdGhlIHN0cmVhbScsICgpID0+IHtcbiAgICBjb25zdCBsYXRlckluVGhlU3RyZWFtID0gc2VxdWVuY2VQKFtwY2hhcignYScpLCBzdGFydE9mSW5wdXRQXSk7XG4gICAgZXhwZWN0KGxhdGVySW5UaGVTdHJlYW0ucnVuKFBvc2l0aW9uLmZyb21UZXh0KCdhYmMnKSkuaXNGYWlsdXJlKS50by5iZS50cnVlO1xuICB9KTtcbiAgaXQoJ2RvZXMgbm90IGNvbnN1bWUgY2hhcmFjdGVycywgYnV0IGl0IHJldHVybnMgYW4gZW1wdHkgc3RyaW5nIGFzIHJlc3VsdCcsICgpID0+IHtcbiAgICBjb25zdCBzdGFydEFCQyA9IHNlcXVlbmNlUChbc3RhcnRPZklucHV0UCwgcGNoYXIoJ0EnKSwgcGNoYXIoJ0InKSwgcGNoYXIoJ0MnKV0pO1xuICAgIGNvbnN0IHBhcnNpbmcgPSBzdGFydEFCQy5ydW4oUG9zaXRpb24uZnJvbVRleHQoJ0FCQycpKTtcbiAgICBleHBlY3QocGFyc2luZy50b1N0cmluZygpKS50by5iZS5lcWwoJ1ZhbGlkYXRpb24uU3VjY2VzcyhbWyxBLEIsQ10scm93PTE7Y29sPTA7cmVzdD1dKScpO1xuICB9KTtcbn0pO1xuXG5kZXNjcmliZSgnYSBwYXJzZXIgZm9yIE5PVCB0aGUgc3RhcnQgb2YgdGhlIGlucHV0JywgKCkgPT4ge1xuICBpdCgnZmFpbHMgYXQgdGhlIHN0YXJ0IG9mIHRoZSBzdHJlYW0nLCAoKSA9PiB7XG4gICAgZXhwZWN0KG5vdFN0YXJ0T2ZJbnB1dFAucnVuKFBvc2l0aW9uLmZyb21UZXh0KCdhYmMnKSkuaXNGYWlsdXJlKS50by5iZS50cnVlO1xuICB9KTtcbiAgaXQoJ3N1Y2NlZWRzIGhhbGZ3YXkgdGhyb3VnaCB0aGUgc3RyZWFtJywgKCkgPT4ge1xuICAgIGNvbnN0IGxhdGVySW5UaGVTdHJlYW0gPSBzZXF1ZW5jZVAoW3BjaGFyKCdhJyksIG5vdFN0YXJ0T2ZJbnB1dFBdKTtcbiAgICBleHBlY3QobGF0ZXJJblRoZVN0cmVhbS5ydW4oUG9zaXRpb24uZnJvbVRleHQoJ2FiYycpKS5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gIH0pO1xuICBpdCgnZG9lcyBub3QgY29uc3VtZSBjaGFyYWN0ZXJzLCBidXQgaXQgcmV0dXJucyBhbiBlbXB0eSBzdHJpbmcgYXMgcmVzdWx0JywgKCkgPT4ge1xuICAgIGNvbnN0IEFCTm90U3RhcnRDID0gc2VxdWVuY2VQKFtwY2hhcignQScpLCBwY2hhcignQicpLCBub3RTdGFydE9mSW5wdXRQLCBwY2hhcignQycpXSk7XG4gICAgY29uc3QgcGFyc2luZyA9IEFCTm90U3RhcnRDLnJ1bihQb3NpdGlvbi5mcm9tVGV4dCgnQUJDJykpO1xuICAgIGV4cGVjdChwYXJzaW5nLnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgnVmFsaWRhdGlvbi5TdWNjZXNzKFtbQSxCLCxDXSxyb3c9MTtjb2w9MDtyZXN0PV0pJyk7XG4gIH0pO1xufSk7XG5cbmRlc2NyaWJlKCdhIHBhcnNlciBmb3IgdGhlIGVuZCBvZiB0aGUgaW5wdXQnLCAoKSA9PiB7XG4gIGl0KCdzdWNjZWVkcyBhdCB0aGUgZW5kIG9mIHRoZSBzdHJlYW0nLCAoKSA9PiB7XG4gICAgY29uc3QgZmluYWxseUluVGhlU3RyZWFtID0gc2VxdWVuY2VQKFtwY2hhcignYScpLCBwY2hhcignYicpLCBlbmRPZklucHV0UF0pO1xuICAgIGV4cGVjdChmaW5hbGx5SW5UaGVTdHJlYW0ucnVuKFBvc2l0aW9uLmZyb21UZXh0KCdhYicpKS5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gIH0pO1xuICBpdCgnZmFpbHMgaGFsZndheSB0aHJvdWdoIHRoZSBzdHJlYW0nLCAoKSA9PiB7XG4gICAgY29uc3QgbGF0ZXJJblRoZVN0cmVhbSA9IHNlcXVlbmNlUChbcGNoYXIoJ2EnKSwgZW5kT2ZJbnB1dFBdKTtcbiAgICBleHBlY3QobGF0ZXJJblRoZVN0cmVhbS5ydW4oUG9zaXRpb24uZnJvbVRleHQoJ2FiYycpKS5pc0ZhaWx1cmUpLnRvLmJlLnRydWU7XG4gIH0pO1xufSk7XG5cbmRlc2NyaWJlKCdhIHBhcnNlciBmb3IgTk9UIHRoZSBlbmQgb2YgdGhlIGlucHV0JywgKCkgPT4ge1xuICBpdCgnZmFpbHMgYXQgdGhlIGVuZCBvZiB0aGUgc3RyZWFtJywgKCkgPT4ge1xuICAgIGNvbnN0IG5vdEZpbmFsbHlJblRoZVN0cmVhbSA9IHNlcXVlbmNlUChbcGNoYXIoJ2EnKSwgbm90RW5kT2ZJbnB1dFBdKTtcbiAgICBleHBlY3Qobm90RmluYWxseUluVGhlU3RyZWFtLnJ1bihQb3NpdGlvbi5mcm9tVGV4dCgnYScpKS5pc0ZhaWx1cmUpLnRvLmJlLnRydWU7XG4gIH0pO1xuICBpdCgnc3VjY2VlZHMgaGFsZndheSB0aHJvdWdoIHRoZSBzdHJlYW0nLCAoKSA9PiB7XG4gICAgY29uc3QgQUJub3RFbmRDID0gc2VxdWVuY2VQKFtwY2hhcignQScpLCBwY2hhcignQicpLCBub3RFbmRPZklucHV0UCwgcGNoYXIoJ0MnKV0ubWFwKGxvZ1ApKTtcbiAgICBleHBlY3QoQUJub3RFbmRDLnJ1bihQb3NpdGlvbi5mcm9tVGV4dCgnQUJDJykpLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcbiAgfSk7XG4gIGl0KCdkb2VzIG5vdCBjb25zdW1lIGNoYXJhY3RlcnMsIGJ1dCBpdCByZXR1cm5zIGFuIGVtcHR5IHN0cmluZyBhcyByZXN1bHQnLCAoKSA9PiB7XG4gICAgY29uc3QgQW5vdEVuZEIgPSBzZXF1ZW5jZVAoW3BjaGFyKCdBJyksIG5vdEVuZE9mSW5wdXRQLCBwY2hhcignQicpXS5tYXAobG9nUCkpO1xuICAgIGV4cGVjdChBbm90RW5kQi5ydW4oUG9zaXRpb24uZnJvbVRleHQoJ0FCJykpLnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgnVmFsaWRhdGlvbi5TdWNjZXNzKFtbQSwsQl0scm93PTE7Y29sPTA7cmVzdD1dKScpO1xuICB9KTtcbn0pO1xuXG5kZXNjcmliZSgndHdvIHBhcnNlcnMgYm91bmQgYnkgYW5kVGhlbicsICgpID0+IHtcbiAgICBjb25zdCBwYXJzZXJBYW5kQiA9IGFuZFRoZW4ocGNoYXIoJ2EnKSwgcGNoYXIoJ2InKSk7XG5cbiAgICBpdCgnY2FuIHBhcnNlIHR3byBjaGFycycsICgpID0+IHtcbiAgICAgICAgZXhwZWN0KGlzUGFyc2VyKHBhcnNlckFhbmRCKSkudG8uYmUudHJ1ZTtcbiAgICAgICAgY29uc3QgcGFyc2luZ0FhbmRCID0gcGFyc2VyQWFuZEIucnVuKHRleHQoJ2FiYycpKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdBYW5kQi5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQWFuZEIudmFsdWVbMF0udG9TdHJpbmcoKSkudG8uYmUuZXFsKCdbYSxiXScpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0FhbmRCLnZhbHVlWzFdLnJlc3QoKSkudG8uYmUuZXFsKCdjJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQWFuZEIudG9TdHJpbmcoKSkudG8uYmUuZXFsKCdWYWxpZGF0aW9uLlN1Y2Nlc3MoW1thLGJdLHJvdz0wO2NvbD0yO3Jlc3Q9Y10pJyk7XG4gICAgfSk7XG5cbiAgICBpdCgnY2FuIGFsc28gTk9UIHBhcnNlIHR3byBjaGFycycsICgpID0+IHtcbiAgICAgICAgY29uc3QgcGFyc2luZ0FhbmRCID0gcGFyc2VyQWFuZEIucnVuKHRleHQoJ2FjZCcpKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdBYW5kQi5pc0ZhaWx1cmUpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQWFuZEIudmFsdWVbMF0pLnRvLmJlLmVxbCgncGNoYXJfYSBhbmRUaGVuIHBjaGFyX2InKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdBYW5kQi52YWx1ZVsxXSkudG8uYmUuZXFsKCd3YW50ZWQgYjsgZ290IGMnKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdBYW5kQi52YWx1ZVsyXS5yZXN0KCkpLnRvLmJlLmVxbCgnY2QnKTtcbiAgICB9KTtcblxuICAgIGl0KCd3aWxsIGZhaWwgaWYgdGhlIGlucHV0IGlzIHRvbyBzaG9ydCcsICgpID0+IHtcbiAgICAgICAgZXhwZWN0KHBhcnNlckFhbmRCLnJ1bih0ZXh0KCdhJykpLmlzRmFpbHVyZSkudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNlckFhbmRCLnJ1bih0ZXh0KCdhYicpKS5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgfSk7XG59KTtcblxuZGVzY3JpYmUoJ3R3byBwYXJzZXJzIGJvdW5kIGJ5IG9yRWxzZScsICgpID0+IHtcbiAgICBjb25zdCBwYXJzZXJBb3JCID0gb3JFbHNlKHBjaGFyKCdhJyksIHBjaGFyKCdiJykpO1xuXG4gICAgaXQoJ2NhbiBwYXJzZSBvbmUgb2YgdHdvIGNoYXJzJywgKCkgPT4ge1xuICAgICAgICBleHBlY3QoaXNQYXJzZXIocGFyc2VyQW9yQikpLnRvLmJlLnRydWU7XG4gICAgICAgIGxldCBwYXJzaW5nQW9yQiA9IHBhcnNlckFvckIucnVuKHRleHQoJ2FiYycpKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdBb3JCLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdBb3JCLnZhbHVlWzBdKS50by5iZS5lcWwoJ2EnKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdBb3JCLnZhbHVlWzFdLnJlc3QoKSkudG8uYmUuZXFsKCdiYycpO1xuICAgICAgICBwYXJzaW5nQW9yQiA9IHBhcnNlckFvckIucnVuKHRleHQoJ2JiYycpKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdBb3JCLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdBb3JCLnZhbHVlWzBdKS50by5iZS5lcWwoJ2InKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdBb3JCLnZhbHVlWzFdLnJlc3QoKSkudG8uYmUuZXFsKCdiYycpO1xuICAgIH0pO1xuXG4gICAgaXQoJ2NhbiBhbHNvIHBhcnNlIE5PTkUgb2YgdHdvIGNoYXJzJywgKCkgPT4ge1xuICAgICAgICBjb25zdCBwYXJzaW5nQW9yQiA9IHBhcnNlckFvckIucnVuKHRleHQoJ2NkZScpKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdBb3JCLmlzRmFpbHVyZSkudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdBb3JCLnZhbHVlWzBdKS50by5iZS5lcWwoJ3BjaGFyX2Egb3JFbHNlIHBjaGFyX2InKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdBb3JCLnZhbHVlWzFdKS50by5iZS5lcWwoJ3dhbnRlZCBiOyBnb3QgYycpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0FvckIudmFsdWVbMl0ucmVzdCgpKS50by5iZS5lcWwoJ2NkZScpO1xuICAgIH0pO1xuXG4gICAgaXQoJ3dpbGwgZmFpbCBpZiB0aGUgaW5wdXQgaXMgdG9vIHNob3J0JywgKCkgPT4ge1xuICAgICAgICBleHBlY3QocGFyc2VyQW9yQi5ydW4odGV4dCgnYScpKS5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChwYXJzZXJBb3JCLnJ1bih0ZXh0KCcnKSkuaXNGYWlsdXJlKS50by5iZS50cnVlO1xuICAgIH0pO1xufSk7XG5cbmRlc2NyaWJlKCdhIHN1Y2NlZWRpbmcgcGFyc2VyJywgKCkgPT4ge1xuICBjb25zdCB3aGF0ZXZlciA9IFBvc2l0aW9uLmZyb21UZXh0KCd3aGF0ZXZlcicpO1xuICBpdCgnc3VjY2VlZHMgYWx3YXlzJywgKCkgPT4ge1xuICAgIGV4cGVjdChzdWNjZWVkUC5ydW4od2hhdGV2ZXIpLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcbiAgICBjb25zdCBwYXJzaW5nID0gc2VxdWVuY2VQKFtwY2hhcigndycpLCBwY2hhcignaCcpLCBzdWNjZWVkUF0pLnJ1bih3aGF0ZXZlcik7XG4gICAgZXhwZWN0KHBhcnNpbmcudG9TdHJpbmcoKSkudG8uYmUuZXFsKCdWYWxpZGF0aW9uLlN1Y2Nlc3MoW1t3LGgsXSxyb3c9MDtjb2w9MjtyZXN0PWF0ZXZlcl0pJyk7XG4gIH0pO1xuICBpdCgnZG9lcyBub3QgY29uc3VtZSBjaGFyYWN0ZXJzLCBidXQgaXQgcmV0dXJucyBhbiBlbXB0eSBzdHJpbmcgYXMgcmVzdWx0JywgKCkgPT4ge1xuICAgIGNvbnN0IHBhcnNpbmcgPSBzZXF1ZW5jZVAoW3BjaGFyKCd3JyksIHN1Y2NlZWRQLCBwY2hhcignaCcpXSk7XG4gICAgZXhwZWN0KHBhcnNpbmcucnVuKHdoYXRldmVyKS50b1N0cmluZygpKS50by5iZS5lcWwoJ1ZhbGlkYXRpb24uU3VjY2VzcyhbW3csLGhdLHJvdz0wO2NvbD0yO3Jlc3Q9YXRldmVyXSknKTtcbiAgfSk7XG59KTtcblxuZGVzY3JpYmUoJ2EgZmFpbGluZyBwYXJzZXInLCAoKSA9PiB7XG4gIGl0KCd3aWxsIGFsd2F5cyBmYWlsJywgKCkgPT4ge1xuICAgIGV4cGVjdChmYWlsUC5ydW4oJ3doYXRldmVyJykuaXNGYWlsdXJlKS50by5iZS50cnVlO1xuICAgIGV4cGVjdChzZXF1ZW5jZVAoW3BjaGFyKCd3JyksIGZhaWxQXSkucnVuKCd3aGF0ZXZlcicpLmlzRmFpbHVyZSkudG8uYmUudHJ1ZTtcbiAgfSk7XG59KTtcblxuZGVzY3JpYmUoJ2EgY2hvaWNlIG9mIHBhcnNlcnMgYm91bmQgYnkgb3JFbHNlJywgKCkgPT4ge1xuICAgIGNvbnN0IHBhcnNlcnNDaG9pY2UgPSBjaG9pY2UoW3BjaGFyKCdhJyksIHBjaGFyKCdiJyksIHBjaGFyKCdjJyksIHBjaGFyKCdkJyksXSk7XG5cbiAgICBpdCgnY2FuIHBhcnNlIG9uZSBvZiBmb3VyIGNoYXJzJywgKCkgPT4ge1xuICAgICAgICBleHBlY3QoaXNQYXJzZXIocGFyc2Vyc0Nob2ljZSkpLnRvLmJlLnRydWU7XG4gICAgICAgIGxldCBwYXJzaW5nQ2hvaWNlID0gcGFyc2Vyc0Nob2ljZS5ydW4odGV4dCgnYScpKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UuaXNTdWNjZXNzKS50by5iZS50cnVlO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS52YWx1ZVswXSkudG8uYmUuZXFsKCdhJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLnZhbHVlWzFdLnJlc3QoKSkudG8uYmUuZXFsKCcnKTtcbiAgICAgICAgcGFyc2luZ0Nob2ljZSA9IHBhcnNlcnNDaG9pY2UucnVuKHRleHQoJ2InKSk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UudmFsdWVbMF0pLnRvLmJlLmVxbCgnYicpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS52YWx1ZVsxXS5yZXN0KCkpLnRvLmJlLmVxbCgnJyk7XG4gICAgICAgIHBhcnNpbmdDaG9pY2UgPSBwYXJzZXJzQ2hvaWNlLnJ1bih0ZXh0KCdkJykpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLnZhbHVlWzBdKS50by5iZS5lcWwoJ2QnKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UudmFsdWVbMV0ucmVzdCgpKS50by5iZS5lcWwoJycpO1xuICAgIH0pO1xuXG4gICAgaXQoJ2NhbiBhbHNvIHBhcnNlIE5PTkUgb2YgZm91ciBjaGFycycsICgpID0+IHtcbiAgICAgICAgY29uc3QgcGFyc2luZ0Nob2ljZSA9IHBhcnNlcnNDaG9pY2UucnVuKHRleHQoJ3gnKSk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLmlzRmFpbHVyZSkudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UudmFsdWVbMF0pLnRvLmJlLmVxbCgnY2hvaWNlIC9wY2hhcl9hL3BjaGFyX2IvcGNoYXJfYy9wY2hhcl9kJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLnZhbHVlWzFdKS50by5iZS5lcWwoJ2ZhaWwnKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UudmFsdWVbMl0ucmVzdCgpKS50by5iZS5lcWwoJ3gnKTtcbiAgICB9KTtcblxuICAgIGl0KCd3aWxsIGZhaWwgaWYgdGhlIGlucHV0IGlzIHRvbyBzaG9ydCcsICgpID0+IHtcbiAgICAgICAgZXhwZWN0KHBhcnNlcnNDaG9pY2UucnVuKHRleHQoJ2EnKSkuaXNTdWNjZXNzKS50by5iZS50cnVlO1xuICAgICAgICBleHBlY3QocGFyc2Vyc0Nob2ljZS5ydW4odGV4dCgnJykpLmlzRmFpbHVyZSkudG8uYmUudHJ1ZTtcbiAgICB9KTtcbn0pO1xuXG5kZXNjcmliZSgnYSBwYXJzZXIgZm9yIGFueSBvZiBhIGxpc3Qgb2YgY2hhcnMnLCAoKSA9PiB7XG4gICAgaXQoJ2NhbiBwYXJzZSBhbnkgbG93ZXJjYXNlIGNoYXInLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IGxvd2VyY2FzZXNQYXJzZXIgPSBhbnlPZihsb3dlcmNhc2VzKTtcblxuICAgICAgICBleHBlY3QoaXNQYXJzZXIobG93ZXJjYXNlc1BhcnNlcikpLnRvLmJlLnRydWU7XG4gICAgICAgIGxldCBwYXJzaW5nQ2hvaWNlID0gbG93ZXJjYXNlc1BhcnNlci5ydW4odGV4dCgnYScpKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UuaXNTdWNjZXNzKS50by5iZS50cnVlO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS52YWx1ZVswXSkudG8uYmUuZXFsKCdhJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLnZhbHVlWzFdLnJlc3QoKSkudG8uYmUuZXFsKCcnKTtcbiAgICAgICAgcGFyc2luZ0Nob2ljZSA9IGxvd2VyY2FzZXNQYXJzZXIucnVuKHRleHQoJ2InKSk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UudmFsdWVbMF0pLnRvLmJlLmVxbCgnYicpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS52YWx1ZVsxXS5yZXN0KCkpLnRvLmJlLmVxbCgnJyk7XG4gICAgICAgIHBhcnNpbmdDaG9pY2UgPSBsb3dlcmNhc2VzUGFyc2VyLnJ1bih0ZXh0KCdkJykpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLnZhbHVlWzBdKS50by5iZS5lcWwoJ2QnKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UudmFsdWVbMV0ucmVzdCgpKS50by5iZS5lcWwoJycpO1xuICAgICAgICBwYXJzaW5nQ2hvaWNlID0gbG93ZXJjYXNlc1BhcnNlci5ydW4odGV4dCgneicpKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UuaXNTdWNjZXNzKS50by5iZS50cnVlO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS52YWx1ZVswXSkudG8uYmUuZXFsKCd6Jyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLnZhbHVlWzFdLnJlc3QoKSkudG8uYmUuZXFsKCcnKTtcblxuICAgICAgICBwYXJzaW5nQ2hvaWNlID0gbG93ZXJjYXNlc1BhcnNlci5ydW4odGV4dCgnWScpKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UuaXNGYWlsdXJlKS50by5iZS50cnVlO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS52YWx1ZVswXSkudG8uYmUuZXFsKCdhbnlPZiBhYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5eicpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS52YWx1ZVsxXSkudG8uYmUuZXFsKCdmYWlsJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLnZhbHVlWzJdLnJlc3QoKSkudG8uYmUuZXFsKCdZJyk7XG4gICAgfSk7XG5cbiAgICBpdCgnY2FuIHBhcnNlIGFueSB1cHBlcmNhc2UgY2hhcicsICgpID0+IHtcbiAgICAgICAgbGV0IHVwcGVyY2FzZXNQYXJzZXIgPSBhbnlPZih1cHBlcmNhc2VzKTtcblxuICAgICAgICBleHBlY3QoaXNQYXJzZXIodXBwZXJjYXNlc1BhcnNlcikpLnRvLmJlLnRydWU7XG4gICAgICAgIGxldCBwYXJzaW5nQ2hvaWNlID0gdXBwZXJjYXNlc1BhcnNlci5ydW4odGV4dCgnQScpKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UuaXNTdWNjZXNzKS50by5iZS50cnVlO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS52YWx1ZVswXSkudG8uYmUuZXFsKCdBJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLnZhbHVlWzFdLnJlc3QoKSkudG8uYmUuZXFsKCcnKTtcbiAgICAgICAgcGFyc2luZ0Nob2ljZSA9IHVwcGVyY2FzZXNQYXJzZXIucnVuKHRleHQoJ0InKSk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UudmFsdWVbMF0pLnRvLmJlLmVxbCgnQicpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS52YWx1ZVsxXS5yZXN0KCkpLnRvLmJlLmVxbCgnJyk7XG4gICAgICAgIHBhcnNpbmdDaG9pY2UgPSB1cHBlcmNhc2VzUGFyc2VyLnJ1bih0ZXh0KCdSJykpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLnZhbHVlWzBdKS50by5iZS5lcWwoJ1InKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UudmFsdWVbMV0ucmVzdCgpKS50by5iZS5lcWwoJycpO1xuICAgICAgICBwYXJzaW5nQ2hvaWNlID0gdXBwZXJjYXNlc1BhcnNlci5ydW4odGV4dCgnWicpKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UuaXNTdWNjZXNzKS50by5iZS50cnVlO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS52YWx1ZVswXSkudG8uYmUuZXFsKCdaJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLnZhbHVlWzFdLnJlc3QoKSkudG8uYmUuZXFsKCcnKTtcblxuICAgICAgICBwYXJzaW5nQ2hvaWNlID0gdXBwZXJjYXNlc1BhcnNlci5ydW4odGV4dCgncycpKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UuaXNGYWlsdXJlKS50by5iZS50cnVlO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS52YWx1ZVswXSkudG8uYmUuZXFsKCdhbnlPZiBBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWicpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS52YWx1ZVsxXSkudG8uYmUuZXFsKCdmYWlsJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLnZhbHVlWzJdLnJlc3QoKSkudG8uYmUuZXFsKCdzJyk7XG4gICAgfSk7XG5cbiAgICBpdCgnY2FuIHBhcnNlIGFueSBkaWdpdCcsICgpID0+IHtcbiAgICAgICAgbGV0IGRpZ2l0c1BhcnNlciA9IGFueU9mKGRpZ2l0cyk7XG5cbiAgICAgICAgZXhwZWN0KGlzUGFyc2VyKGRpZ2l0c1BhcnNlcikpLnRvLmJlLnRydWU7XG4gICAgICAgIGxldCBwYXJzaW5nQ2hvaWNlID0gZGlnaXRzUGFyc2VyLnJ1bih0ZXh0KCcxJykpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLnZhbHVlWzBdKS50by5iZS5lcWwoJzEnKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UudmFsdWVbMV0ucmVzdCgpKS50by5iZS5lcWwoJycpO1xuICAgICAgICBwYXJzaW5nQ2hvaWNlID0gZGlnaXRzUGFyc2VyLnJ1bih0ZXh0KCczJykpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLnZhbHVlWzBdKS50by5iZS5lcWwoJzMnKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UudmFsdWVbMV0ucmVzdCgpKS50by5iZS5lcWwoJycpO1xuICAgICAgICBwYXJzaW5nQ2hvaWNlID0gZGlnaXRzUGFyc2VyLnJ1bih0ZXh0KCcwJykpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLnZhbHVlWzBdKS50by5iZS5lcWwoJzAnKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UudmFsdWVbMV0ucmVzdCgpKS50by5iZS5lcWwoJycpO1xuICAgICAgICBwYXJzaW5nQ2hvaWNlID0gZGlnaXRzUGFyc2VyLnJ1bih0ZXh0KCc4JykpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLnZhbHVlWzBdKS50by5iZS5lcWwoJzgnKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UudmFsdWVbMV0ucmVzdCgpKS50by5iZS5lcWwoJycpO1xuXG4gICAgICAgIHBhcnNpbmdDaG9pY2UgPSBkaWdpdHNQYXJzZXIucnVuKHRleHQoJ3MnKSk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLmlzRmFpbHVyZSkudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UudmFsdWVbMF0pLnRvLmJlLmVxbCgnYW55T2YgMDEyMzQ1Njc4OScpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS52YWx1ZVsxXSkudG8uYmUuZXFsKCdmYWlsJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLnZhbHVlWzJdLnJlc3QoKSkudG8uYmUuZXFsKCdzJyk7XG4gICAgfSk7XG5cbiAgICBpdCgnd2lsbCBmYWlsIGlmIHRoZSBpbnB1dCBpcyB0b28gc2hvcnQnLCAoKSA9PiB7XG4gICAgICAgIGV4cGVjdChhbnlPZihsb3dlcmNhc2VzKS5ydW4odGV4dCgnJykpLmlzRmFpbHVyZSkudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KGFueU9mKGRpZ2l0cykucnVuKHRleHQoJycpKS5pc0ZhaWx1cmUpLnRvLmJlLnRydWU7XG4gICAgfSk7XG59KTtcblxuZGVzY3JpYmUoJ3BhcnNlcnMgdGhhdCBjb25zaWRlciBwcmVjZWRlbmNlcycsICgpID0+IHtcblxuICBkZXNjcmliZSgnY2FuIHBhcnNlIFggcHJlY2VkZWQgYnkgWScsICgpID0+IHtcbiAgICBjb25zdCBYYWZ0ZXJZID0gcHJlY2VkZWRCeVAoJ1knLCAnWCcpO1xuICAgIGl0KCdldmVuIGlmIFkgaGFzIGJlZW4gY29uc3VtZWQgYnkgdGhlIHBhcnNlciBiZWZvcmUnLCAoKSA9PiB7XG4gICAgICBjb25zdCBZWHAgPSBtYW55MShjaG9pY2UoW3BjaGFyKCdZJyksIFhhZnRlclldKSk7XG4gICAgICBjb25zdCBwYXJzaW5nWVggPSBZWHAucnVuKHRleHQoJ1lYJykpO1xuICAgICAgZXhwZWN0KHBhcnNpbmdZWC5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgICBleHBlY3QocGFyc2luZ1lYLnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgnVmFsaWRhdGlvbi5TdWNjZXNzKFtbWSxYXSxyb3c9MTtjb2w9MDtyZXN0PV0pJylcbiAgICB9KTtcbiAgICBpdCgnYW5kIGhhbHQgd2hlbiBYIGlzIG5vdCBwcmVjZWRlZCBieSBZJywgKCkgPT4ge1xuICAgICAgY29uc3QgQVhwID0gbWFueTEoY2hvaWNlKFtwY2hhcignQScpLCBYYWZ0ZXJZXSkpO1xuICAgICAgY29uc3QgcGFyc2luZ0FYID0gQVhwLnJ1bih0ZXh0KCdBWCcpKTtcbiAgICAgIGV4cGVjdChwYXJzaW5nQVguaXNTdWNjZXNzKS50by5iZS50cnVlO1xuICAgICAgZXhwZWN0KHBhcnNpbmdBWC52YWx1ZVsxXS5yZXN0KCkpLnRvLmJlLmVxbCgnWCcpO1xuICAgIH0pO1xuICAgIGl0KCdhbmQgZmFpbCB3aGVuIFggaXMgYXQgdGhlIHN0YXJ0IG9mIHRoZSBzdHJpbmcnLCAoKSA9PiB7XG4gICAgICBjb25zdCBBWHAgPSBtYW55MShjaG9pY2UoW3BjaGFyKCdBJyksIFhhZnRlclldKSk7XG4gICAgICBjb25zdCBwYXJzaW5nQVggPSBBWHAucnVuKHRleHQoJ1hBJykpO1xuICAgICAgZXhwZWN0KHBhcnNpbmdBWC5pc0ZhaWx1cmUpLnRvLmJlLnRydWU7XG4gICAgfSk7XG4gIH0pO1xuXG4gIGRlc2NyaWJlKCdjYW4gcGFyc2UgWCBub3QgcHJlY2VkZWQgYnkgWScsICgpID0+IHtcbiAgICBjb25zdCBYbm90QWZ0ZXJZID0gbm90UHJlY2VkZWRCeVAoJ1knLCAnWCcpO1xuXG4gICAgaXQoJ2V2ZW4gaWYgdGhlIHByZXZpb3VzIGNoYXIgaGFzIGJlZW4gY29uc3VtZWQgYnkgdGhlIHBhcnNlciBiZWZvcmUnLCAoKSA9PiB7XG4gICAgICBjb25zdCBBWHAgPSBtYW55MShjaG9pY2UoW3BjaGFyKCdBJyksIFhub3RBZnRlclldKSk7XG4gICAgICBjb25zdCBwYXJzaW5nQVggPSBBWHAucnVuKHRleHQoJ0FYJykpO1xuICAgICAgZXhwZWN0KHBhcnNpbmdBWC5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgICBleHBlY3QocGFyc2luZ0FYLnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgnVmFsaWRhdGlvbi5TdWNjZXNzKFtbQSxYXSxyb3c9MTtjb2w9MDtyZXN0PV0pJylcbiAgICB9KTtcbiAgICBpdCgnYW5kIGhhbHQgd2hlbiBYIGlzIHRoZSBmaXJzdCBjaGFyIGluIHRoZSBzdHJpbmcnLCAoKSA9PiB7XG4gICAgICBjb25zdCBBWHAgPSBtYW55MShjaG9pY2UoW3BjaGFyKCdBJyksIFhub3RBZnRlclldKSk7XG4gICAgICBjb25zdCBwYXJzaW5nQVggPSBBWHAucnVuKHRleHQoJ1hBJykpO1xuICAgICAgZXhwZWN0KHBhcnNpbmdBWC5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgICBleHBlY3QocGFyc2luZ0FYLnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgnVmFsaWRhdGlvbi5TdWNjZXNzKFtbWCxBXSxyb3c9MTtjb2w9MDtyZXN0PV0pJylcbiAgICB9KTtcbiAgICBpdCgnYW5kIGhhbHQgd2hlbiBYIGlzIHByZWNlZGVkIGJ5IFknLCAoKSA9PiB7XG4gICAgICBjb25zdCBZWHAgPSBtYW55MShjaG9pY2UoW3BjaGFyKCdZJyksIFhub3RBZnRlclldKSk7XG4gICAgICBjb25zdCBwYXJzaW5nWVggPSBZWHAucnVuKHRleHQoJ1lYJykpO1xuICAgICAgZXhwZWN0KHBhcnNpbmdZWC5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgICBleHBlY3QocGFyc2luZ1lYLnZhbHVlWzFdLnJlc3QoKSkudG8uYmUuZXFsKCdYJyk7XG4gICAgfSk7XG4gIH0pO1xufSk7XG5cbmRlc2NyaWJlKCdhIHBhcnNlciBmb3IgYWJjJywgKCkgPT4ge1xuICAgIGl0KCdwYXJzZXMgYWJjJywgKCkgPT4ge1xuICAgICAgICBjb25zdCBwYWlyQWRkZXIgPSAoW3gsIHldKSA9PiB4ICsgeTtcbiAgICAgICAgY29uc3QgYWJjUCA9IGFuZFRoZW4oXG4gICAgICAgICAgICBwY2hhcignYScpLFxuICAgICAgICAgICAgYW5kVGhlbihcbiAgICAgICAgICAgICAgICBwY2hhcignYicpLFxuICAgICAgICAgICAgICAgIGFuZFRoZW4oXG4gICAgICAgICAgICAgICAgICAgIHBjaGFyKCdjJyksXG4gICAgICAgICAgICAgICAgICAgIHJldHVyblAoJycpXG4gICAgICAgICAgICAgICAgKS5mbWFwKHBhaXJBZGRlcilcbiAgICAgICAgICAgICkuZm1hcChwYWlyQWRkZXIpXG4gICAgICAgICkuZm1hcChwYWlyQWRkZXIpO1xuICAgICAgICBjb25zdCBwYXJzaW5nID0gYWJjUC5ydW4oJ2FiY2QnKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcuaXNTdWNjZXNzKS50by5iZS50cnVlO1xuICAgICAgICBleHBlY3QocGFyc2luZy52YWx1ZVswXS50b1N0cmluZygpKS50by5iZS5lcWwoJ2FiYycpO1xuICAgICAgICBleHBlY3QocGFyc2luZy52YWx1ZVsxXS5yZXN0KCkpLnRvLmJlLmVxbCgnZCcpO1xuICAgIH0pO1xufSk7XG5cbmRlc2NyaWJlKCdwYXJzZSAzIGRpZ2l0cycsICgpID0+IHtcbiAgICBsZXQgcGFyc2VEaWdpdCwgdGhyZWVEaWdpdHMsIHBhcnNpbmc7XG5cbiAgICBiZWZvcmUoKCkgPT4ge1xuICAgICAgICBwYXJzZURpZ2l0ID0gYW55T2YoZGlnaXRzKTtcbiAgICAgICAgdGhyZWVEaWdpdHMgPSBhbmRUaGVuKHBhcnNlRGlnaXQsIGFuZFRoZW4ocGFyc2VEaWdpdCwgcGFyc2VEaWdpdCkpO1xuICAgICAgICBwYXJzaW5nID0gdGhyZWVEaWdpdHMucnVuKCcxMjMnKTtcbiAgICB9KTtcbiAgICBpdCgncGFyc2VzIGFueSBvZiB0aHJlZSBkaWdpdHMnLCAoKSA9PiB7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcudmFsdWVbMF0udG9TdHJpbmcoKSkudG8uYmUuZXFsKCdbMSxbMiwzXV0nKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcudmFsdWVbMV0ucmVzdCgpKS50by5iZS5lcWwoJycpO1xuICAgIH0pO1xuICAgIGRlc2NyaWJlKCdwYXJzZXMgYW55IG9mIHRocmVlIGRpZ2l0cyB3aGlsZSBzaG93Y2FzaW5nIGZtYXAnLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHVucGFja2VyID0gKFt4LCBbeSwgel1dKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gW3gsIHksIHpdO1xuICAgICAgICB9O1xuICAgICAgICBpdCgnYXMgZ2xvYmFsIG1ldGhvZCcsICgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHRocmVlRGlnaXRzSW1wbCA9IGZtYXAodW5wYWNrZXIsIHRocmVlRGlnaXRzKTtcbiAgICAgICAgICAgIGxldCBwYXJzaW5nID0gdGhyZWVEaWdpdHNJbXBsLnJ1bignMTIzJyk7XG4gICAgICAgICAgICBleHBlY3QocGFyc2luZy5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgICAgICAgICBleHBlY3QocGFyc2luZy52YWx1ZVswXS50b1N0cmluZygpKS50by5iZS5lcWwoJ1sxLDIsM10nKTtcbiAgICAgICAgICAgIGV4cGVjdChwYXJzaW5nLnZhbHVlWzFdLnJlc3QoKSkudG8uYmUuZXFsKCcnKTtcbiAgICAgICAgfSk7XG4gICAgICAgIGl0KCdhcyBpbnN0YW5jZSBtZXRob2QnLCAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCB0aHJlZURpZ2l0c0luc3QgPSB0aHJlZURpZ2l0cy5mbWFwKHVucGFja2VyKTtcbiAgICAgICAgICAgIGxldCBwYXJzaW5nID0gdGhyZWVEaWdpdHNJbnN0LnJ1bignMTIzJyk7XG4gICAgICAgICAgICBleHBlY3QocGFyc2luZy5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgICAgICAgICBleHBlY3QocGFyc2luZy52YWx1ZVswXS50b1N0cmluZygpKS50by5iZS5lcWwoJ1sxLDIsM10nKTtcbiAgICAgICAgICAgIGV4cGVjdChwYXJzaW5nLnZhbHVlWzFdLnJlc3QoKSkudG8uYmUuZXFsKCcnKTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG59KTtcblxuZGVzY3JpYmUoJ2xpZnQyIGZvciBwYXJzZXJzJywgKCkgPT4ge1xuICAgIGl0KCdvcGVyYXRlcyBvbiB0aGUgcmVzdWx0cyBvZiB0d28gc3RyaW5nIHBhcnNpbmdzJywgKCkgPT4ge1xuICAgICAgICBjb25zdCBhZGRTdHJpbmdzID0geCA9PiB5ID0+IHggKyAnKycgKyB5O1xuICAgICAgICBjb25zdCBBcGx1c0IgPSBsaWZ0MihhZGRTdHJpbmdzKShwY2hhcignYScpKShwY2hhcignYicpKTtcbiAgICAgICAgZXhwZWN0KEFwbHVzQi5ydW4oJ2FiYycpLnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgnVmFsaWRhdGlvbi5TdWNjZXNzKFthK2Iscm93PTA7Y29sPTI7cmVzdD1jXSknKTtcbiAgICB9KTtcbiAgICBpdCgnYWRkcyB0aGUgcmVzdWx0cyBvZiB0d28gZGlnaXQgcGFyc2luZ3MnLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IGFkZERpZ2l0cyA9IHggPT4geSA9PiB4ICsgeTtcbiAgICAgICAgY29uc3QgYWRkUGFyc2VyID0gbGlmdDIoYWRkRGlnaXRzKShwZGlnaXQoMSkpKHBkaWdpdCgyKSk7XG4gICAgICAgIGV4cGVjdChhZGRQYXJzZXIucnVuKCcxMjM0JykudG9TdHJpbmcoKSkudG8uYmUuZXFsKCdWYWxpZGF0aW9uLlN1Y2Nlc3MoWzMscm93PTA7Y29sPTI7cmVzdD0zNF0pJyk7XG4gICAgICAgIGV4cGVjdChhZGRQYXJzZXIucnVuKCcxNDQnKS5pc0ZhaWx1cmUpLnRvLmJlLnRydWU7XG4gICAgfSk7XG59KTtcblxuZGVzY3JpYmUoJ3NlcXVlbmNlcyBvZiBwYXJzZXJzIGJhc2VkIG9uIGFuZFRoZW4gJiYgZm1hcCAoYWthIHNlcXVlbmNlUDIpJywgKCkgPT4ge1xuICAgIGl0KCdzdG9yZSBtYXRjaGVkIGNoYXJzIGluc2lkZSBhIHBsYWluIHN0cmluZycsICgpID0+IHtcbiAgICAgICAgY29uc3QgYWJjUGFyc2VyID0gc2VxdWVuY2VQMihbcGNoYXIoJ2EnKSwgcGNoYXIoJ2InKSwgcGNoYXIoJ2MnKSxdKTtcbiAgICAgICAgZXhwZWN0KGFiY1BhcnNlci5ydW4oJ2FiYycpLnRvU3RyaW5nKCkpXG4gICAgICAgICAgICAudG8uYmUuZXFsKCdWYWxpZGF0aW9uLlN1Y2Nlc3MoW2FiYyxyb3c9MTtjb2w9MDtyZXN0PV0pJyk7XG4gICAgfSk7XG59KTtcblxuZGVzY3JpYmUoJ3NlcXVlbmNlcyBvZiBwYXJzZXJzIGJhc2VkIG9uIGxpZnQyKGNvbnMpIChha2Egc2VxdWVuY2VQKScsICgpID0+IHtcbiAgICBpdCgnc3RvcmVzIG1hdGNoZWQgY2hhcnMgaW5zaWRlIGFuIGFycmF5JywgKCkgPT4ge1xuICAgICAgICBjb25zdCBhYmNQYXJzZXIgPSBzZXF1ZW5jZVAoW3BjaGFyKCdhJyksIHBjaGFyKCdiJyksIHBjaGFyKCdjJyksXSk7XG4gICAgICAgIGV4cGVjdChhYmNQYXJzZXIucnVuKCdhYmMnKS50b1N0cmluZygpKVxuICAgICAgICAgICAgLnRvLmJlLmVxbCgnVmFsaWRhdGlvbi5TdWNjZXNzKFtbYSxiLGNdLHJvdz0xO2NvbD0wO3Jlc3Q9XSknKTtcbiAgICB9KTtcbn0pO1xuXG5kZXNjcmliZSgnYSBwYXJzZXIgZm9yIGEgc3BlY2lmaWMgc2VxdWVuY2Ugb2YgY2hhcnMnLCAoKSA9PiB7XG4gICAgaXQoJ2lzIGVhc3kgdG8gY3JlYXRlIHdpdGggc2VxdWVuY2VQJywgKCkgPT4ge1xuICAgICAgICBjb25zdCBtYXJjb1BhcnNlciA9IHBzdHJpbmcoJ21hcmNvJyk7XG4gICAgICAgIGNvbnN0IG1hcmNvUGFyc2luZyA9IG1hcmNvUGFyc2VyLnJ1bignbWFyY29jaWFvJyk7XG4gICAgICAgIGV4cGVjdChtYXJjb1BhcnNpbmcuaXNTdWNjZXNzKS50by5iZS50cnVlO1xuICAgICAgICBleHBlY3QobWFyY29QYXJzaW5nLnRvU3RyaW5nKCkpXG4gICAgICAgICAgICAudG8uYmUuZXFsKCdWYWxpZGF0aW9uLlN1Y2Nlc3MoW1ttLGEscixjLG9dLHJvdz0wO2NvbD01O3Jlc3Q9Y2lhb10pJyk7XG4gICAgfSk7XG4gICAgaXQoJ2hhcyBhIHZlcnNpb24gdGhhdCByZXR1cm5zIHN0cmluZ3MnLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IG1hcmNvUGFyc2VyID0gc3RyaW5nUCgnbWFyY28nKTtcbiAgICAgICAgY29uc3QgbWFyY29QYXJzaW5nID0gbWFyY29QYXJzZXIucnVuKCdtYXJjb2NpYW8nKTtcbiAgICAgICAgZXhwZWN0KG1hcmNvUGFyc2luZy5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChtYXJjb1BhcnNpbmcudG9TdHJpbmcoKSlcbiAgICAgICAgICAgIC50by5iZS5lcWwoJ1ZhbGlkYXRpb24uU3VjY2VzcyhbbWFyY28scm93PTA7Y29sPTU7cmVzdD1jaWFvXSknKTtcbiAgICB9KTtcbn0pO1xuXG5kZXNjcmliZSgnYSB0cmltbWVyIG9mIHBhcnNlcnMnLCAoKSA9PiB7XG4gICAgaXQoJ2NhbiBpZ25vcmUgd2hpdGVzcGFjZXMgYXJvdW5kIGEgc2luZ2xlIGNoYXInLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHRyaW1tZXIgPSB0cmltUChwY2hhcignYScpKTtcbiAgICAgICAgZXhwZWN0KHRyaW1tZXIucnVuKCcgIGEgICAgJykudG9TdHJpbmcoKSlcbiAgICAgICAgICAgIC50by5iZS5lcWwoJ1ZhbGlkYXRpb24uU3VjY2VzcyhbYSxyb3c9MTtjb2w9MDtyZXN0PV0pJyk7XG4gICAgfSk7XG4gICAgaXQoJ2NhbiBpZ25vcmUgd2hpdGVzcGFjZXMgYXJvdW5kIGEgc2VxdWVuY2Ugb2YgdHdvIGNoYXJzJywgKCkgPT4ge1xuICAgICAgICBjb25zdCB0cmltbWVyID0gdHJpbVAocGNoYXIoJ2EnKS5hbmRUaGVuKHBjaGFyKCdiJykpKTtcbiAgICAgICAgZXhwZWN0KHRyaW1tZXIucnVuKCcgIGFiICAgICcpLnRvU3RyaW5nKCkpXG4gICAgICAgICAgICAudG8uYmUuZXFsKCdWYWxpZGF0aW9uLlN1Y2Nlc3MoW1thLGJdLHJvdz0xO2NvbD0wO3Jlc3Q9XSknKTtcbiAgICB9KTtcbn0pO1xuXG5kZXNjcmliZSgnYSBwYXJzZXIgZm9yIGEgc3BlY2lmaWMgd29yZCcsICgpID0+IHtcbiAgICBpdCgnZGV0ZWN0cyBhbmQgaWdub3JlcyB3aGl0ZXNwYWNlcyBhcm91bmQgaXQnLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IG1hcmNvUGFyc2VyID0gcHdvcmQoJ21hcmNvJyk7XG4gICAgICAgIGNvbnN0IG1hcmNvUGFyc2luZyA9IG1hcmNvUGFyc2VyLnJ1bignICBtYXJjbyBjaWFvJyk7XG4gICAgICAgIGV4cGVjdChtYXJjb1BhcnNpbmcuaXNTdWNjZXNzKS50by5iZS50cnVlO1xuICAgICAgICBleHBlY3QobWFyY29QYXJzaW5nLnRvU3RyaW5nKCkpXG4gICAgICAgICAgICAudG8uYmUuZXFsKCdWYWxpZGF0aW9uLlN1Y2Nlc3MoW1ttLGEscixjLG9dLHJvdz0wO2NvbD04O3Jlc3Q9Y2lhb10pJyk7XG4gICAgfSk7XG4gICAgaXQoJ2hhcyBubyBwcm9ibGVtIGlmIHRoZSB3aGl0ZXNwYWNlcyBhcmVuXFwndCB0aGVyZScsICgpID0+IHtcbiAgICAgICAgY29uc3QgbWFyY29QYXJzZXIgPSBwd29yZCgnbWFyY28nKTtcbiAgICAgICAgY29uc3QgbWFyY29QYXJzaW5nID0gbWFyY29QYXJzZXIucnVuKCdtYXJjb2NpYW8nKTtcbiAgICAgICAgZXhwZWN0KG1hcmNvUGFyc2luZy5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChtYXJjb1BhcnNpbmcudG9TdHJpbmcoKSlcbiAgICAgICAgICAgIC50by5iZS5lcWwoJ1ZhbGlkYXRpb24uU3VjY2VzcyhbW20sYSxyLGMsb10scm93PTA7Y29sPTU7cmVzdD1jaWFvXSknKTtcbiAgICB9KTtcbn0pO1xuXG5kZXNjcmliZSgnYSBwYXJzaW5nIGZ1bmN0aW9uIGZvciB6ZXJvIG9yIG1vcmUgb2NjdXJyZW5jZXMnLCAoKSA9PiB7XG4gICAgaXQoJ2NhbiBwYXJzZSBhIGNoYXIgemVybyB0aW1lcycsICgpID0+IHtcbiAgICAgICAgY29uc3QgemVyb09yTW9yZVBhcnNpbmdGdW5jdGlvbiA9IHplcm9Pck1vcmUocGNoYXIoJ20nKSk7XG4gICAgICAgIGxldCBwYXJzaW5nID0gemVyb09yTW9yZVBhcnNpbmdGdW5jdGlvbih0ZXh0KCdhcmNvJykpO1xuICAgICAgICBleHBlY3QocGFyc2luZy5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgnVmFsaWRhdGlvbi5TdWNjZXNzKFtbXSxyb3c9MDtjb2w9MDtyZXN0PWFyY29dKScpO1xuICAgIH0pO1xuICAgIGl0KCdjYW4gcGFyc2UgYSBjaGFyIG1hbnkgdGltZXMnLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHplcm9Pck1vcmVQYXJzaW5nRnVuY3Rpb24gPSB6ZXJvT3JNb3JlKHBjaGFyKCdtJykpO1xuICAgICAgICBsZXQgcGFyc2luZyA9IHplcm9Pck1vcmVQYXJzaW5nRnVuY3Rpb24odGV4dCgnbW1tYXJjbycpKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcuaXNTdWNjZXNzKS50by5iZS50cnVlO1xuICAgICAgICBleHBlY3QocGFyc2luZy50b1N0cmluZygpKS50by5iZS5lcWwoJ1ZhbGlkYXRpb24uU3VjY2VzcyhbW20sbSxtXSxyb3c9MDtjb2w9MztyZXN0PWFyY29dKScpO1xuICAgIH0pO1xuICAgIGl0KCdjYW4gcGFyc2UgYSBjaGFyIHNlcXVlbmNlIHplcm8gdGltZXMnLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHplcm9Pck1vcmVQYXJzaW5nRnVuY3Rpb24gPSB6ZXJvT3JNb3JlKHBzdHJpbmcoJ21hcmNvJykpO1xuICAgICAgICBsZXQgcGFyc2luZyA9IHplcm9Pck1vcmVQYXJzaW5nRnVuY3Rpb24odGV4dCgneG1hcmNvbWFyY29jaWFvJykpO1xuICAgICAgICBleHBlY3QocGFyc2luZy5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgnVmFsaWRhdGlvbi5TdWNjZXNzKFtbXSxyb3c9MDtjb2w9MDtyZXN0PXhtYXJjb21hcmNvY2lhb10pJyk7XG4gICAgfSk7XG4gICAgaXQoJ2NhbiBwYXJzZSBhIGNoYXIgc2VxdWVuY2UgbWFueSB0aW1lcycsICgpID0+IHtcbiAgICAgICAgY29uc3QgemVyb09yTW9yZVBhcnNpbmdGdW5jdGlvbiA9IHplcm9Pck1vcmUocHN0cmluZygnbWFyY28nKSk7XG4gICAgICAgIGxldCBwYXJzaW5nID0gemVyb09yTW9yZVBhcnNpbmdGdW5jdGlvbih0ZXh0KCdtYXJjb21hcmNvY2lhbycpKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcuaXNTdWNjZXNzKS50by5iZS50cnVlO1xuICAgICAgICBleHBlY3QocGFyc2luZy50b1N0cmluZygpKVxuICAgICAgICAgICAgLnRvLmJlLmVxbCgnVmFsaWRhdGlvbi5TdWNjZXNzKFtbW20sYSxyLGMsb10sW20sYSxyLGMsb11dLHJvdz0wO2NvbD0xMDtyZXN0PWNpYW9dKScpO1xuICAgIH0pO1xufSk7XG5cbmRlc2NyaWJlKCdhIHBhcnNlciBmb3IgemVybyBvciBtb3JlIG9jY3VycmVuY2VzJywgKCkgPT4ge1xuICAgIGl0KCdjYW4gcGFyc2UgYSBjaGFyIHplcm8gdGltZXMnLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHplcm9Pck1vcmVQYXJzZXIgPSBtYW55KHBjaGFyKCdtJykpO1xuICAgICAgICBsZXQgcGFyc2luZyA9IHplcm9Pck1vcmVQYXJzZXIucnVuKHRleHQoJ2FyY28nKSk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcudG9TdHJpbmcoKSkudG8uYmUuZXFsKCdWYWxpZGF0aW9uLlN1Y2Nlc3MoW1tdLHJvdz0wO2NvbD0wO3Jlc3Q9YXJjb10pJyk7XG4gICAgfSk7XG4gICAgaXQoJ2NhbiBwYXJzZSBhIGNoYXIgbWFueSB0aW1lcyBhbmQgcmV0dXJuIGFuIGFycmF5JywgKCkgPT4ge1xuICAgICAgICBjb25zdCB6ZXJvT3JNb3JlUGFyc2VyID0gbWFueShwY2hhcignbScpKTtcbiAgICAgICAgbGV0IHBhcnNpbmcgPSB6ZXJvT3JNb3JlUGFyc2VyLnJ1bih0ZXh0KCdtbW1hcmNvJykpO1xuICAgICAgICBleHBlY3QocGFyc2luZy5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgnVmFsaWRhdGlvbi5TdWNjZXNzKFtbbSxtLG1dLHJvdz0wO2NvbD0zO3Jlc3Q9YXJjb10pJyk7XG4gICAgfSk7XG4gICAgaXQoJ2NhbiBwYXJzZSBhIGNoYXIgZXhhY3RseSBuIHRpbWVzIGFuZCByZXR1cm4gYW4gYXJyYXkgKG9yIGZhaWwpJywgKCkgPT4ge1xuICAgICAgICBjb25zdCBleGFjdGx5VGhyZWUgPSBtYW55KHBjaGFyKCdtJyksIDMpO1xuICAgICAgICBsZXQgcGFyc2luZyA9IGV4YWN0bHlUaHJlZS5ydW4odGV4dCgnbW1tYXJjbycpKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcuaXNTdWNjZXNzKS50by5iZS50cnVlO1xuICAgICAgICBleHBlY3QocGFyc2luZy50b1N0cmluZygpKS50by5iZS5lcWwoJ1ZhbGlkYXRpb24uU3VjY2VzcyhbW20sbSxtXSxyb3c9MDtjb2w9MztyZXN0PWFyY29dKScpO1xuICAgICAgICBwYXJzaW5nID0gZXhhY3RseVRocmVlLnJ1bih0ZXh0KCdtbW1tYXJjbycpKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcuaXNGYWlsdXJlKS50by5iZS50cnVlO1xuICAgICAgICBleHBlY3QocGFyc2luZy50b1N0cmluZygpKS50by5iZS5lcWwoJ1ZhbGlkYXRpb24uRmFpbHVyZShbbWFueSBwY2hhcl9tIHRpbWVzPTMsdGltZXMgcGFyYW0gd2FudGVkIDM7IGdvdCA0LHJvdz0wO2NvbD0wO3Jlc3Q9bW1tbWFyY29dKScpO1xuICAgIH0pO1xuICAgIGl0KCdjYW4gcGFyc2UgYSBjaGFyIG1hbnkgdGltZXMgYW5kIHJldHVybiBhIHN0cmluZycsICgpID0+IHtcbiAgICAgICAgY29uc3QgemVyb09yTW9yZVBhcnNlciA9IG1hbnlDaGFycyhwY2hhcignbScpKTtcbiAgICAgICAgbGV0IHBhcnNpbmcgPSB6ZXJvT3JNb3JlUGFyc2VyLnJ1bih0ZXh0KCdtbW1hcmNvJykpO1xuICAgICAgICBleHBlY3QocGFyc2luZy5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgnVmFsaWRhdGlvbi5TdWNjZXNzKFttbW0scm93PTA7Y29sPTM7cmVzdD1hcmNvXSknKTtcbiAgICB9KTtcbiAgICBpdCgnY2FuIHBhcnNlIGEgY2hhciBleGFjdGx5IG4gdGltZXMgYW5kIHJldHVybiBhIHN0cmluZyAob3IgZmFpbCknLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IGV4YWN0bHlUaHJlZSA9IG1hbnlDaGFycyhwY2hhcignbScpLCAzKTtcbiAgICAgICAgbGV0IHBhcnNpbmcgPSBleGFjdGx5VGhyZWUucnVuKHRleHQoJ21tbWFyY28nKSk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcudG9TdHJpbmcoKSkudG8uYmUuZXFsKCdWYWxpZGF0aW9uLlN1Y2Nlc3MoW21tbSxyb3c9MDtjb2w9MztyZXN0PWFyY29dKScpO1xuICAgICAgICBwYXJzaW5nID0gZXhhY3RseVRocmVlLnJ1bih0ZXh0KCdtbW1tYXJjbycpKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcuaXNGYWlsdXJlKS50by5iZS50cnVlO1xuICAgICAgICBleHBlY3QocGFyc2luZy50b1N0cmluZygpKS50by5iZS5lcWwoJ1ZhbGlkYXRpb24uRmFpbHVyZShbbWFueUNoYXJzIHBjaGFyX20gdGltZXM9Myx0aW1lcyBwYXJhbSB3YW50ZWQgMzsgZ290IDQscm93PTA7Y29sPTA7cmVzdD1tbW1tYXJjb10pJyk7XG4gICAgfSk7XG4gICAgaXQoJ2NhbiBwYXJzZSBhIGNoYXIgc2VxdWVuY2UgemVybyB0aW1lcycsICgpID0+IHtcbiAgICAgICAgY29uc3QgemVyb09yTW9yZVBhcnNlciA9IG1hbnkocHN0cmluZygnbWFyY28nKSk7XG4gICAgICAgIGxldCBwYXJzaW5nID0gemVyb09yTW9yZVBhcnNlci5ydW4odGV4dCgneG1hcmNvbWFyY29jaWFvJykpO1xuICAgICAgICBleHBlY3QocGFyc2luZy5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgnVmFsaWRhdGlvbi5TdWNjZXNzKFtbXSxyb3c9MDtjb2w9MDtyZXN0PXhtYXJjb21hcmNvY2lhb10pJyk7XG4gICAgfSk7XG4gICAgaXQoJ2NhbiBwYXJzZSBhIGNoYXIgc2VxdWVuY2UgbWFueSB0aW1lcycsICgpID0+IHtcbiAgICAgICAgY29uc3QgemVyb09yTW9yZVBhcnNlciA9IG1hbnkocHN0cmluZygnbWFyY28nKSk7XG4gICAgICAgIGxldCBwYXJzaW5nID0gemVyb09yTW9yZVBhcnNlci5ydW4oJ21hcmNvbWFyY29jaWFvJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcudG9TdHJpbmcoKSlcbiAgICAgICAgICAgIC50by5iZS5lcWwoJ1ZhbGlkYXRpb24uU3VjY2VzcyhbW1ttLGEscixjLG9dLFttLGEscixjLG9dXSxyb3c9MDtjb2w9MTA7cmVzdD1jaWFvXSknKTtcbiAgICB9KTtcbiAgICBpdCgnY2FuIHBhcnNlIHdoaXRlc3BhY2VzISEnLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHdoaXRlc1BhcnNlciA9IG1hbnkoYW55T2Yod2hpdGVzKSk7XG4gICAgICAgIGNvbnN0IHR3b1dvcmRzID0gc2VxdWVuY2VQKFtwc3RyaW5nKCdjaWFvJyksIHdoaXRlc1BhcnNlciwgcHN0cmluZygnbWFtbWEnKV0pO1xuICAgICAgICBsZXQgcGFyc2luZyA9IHR3b1dvcmRzLnJ1bignY2lhb21hbW1hWCcpO1xuICAgICAgICBleHBlY3QocGFyc2luZy50b1N0cmluZygpKVxuICAgICAgICAgICAgLnRvLmJlLmVxbCgnVmFsaWRhdGlvbi5TdWNjZXNzKFtbW2MsaSxhLG9dLFtdLFttLGEsbSxtLGFdXSxyb3c9MDtjb2w9OTtyZXN0PVhdKScpO1xuICAgICAgICBwYXJzaW5nID0gdHdvV29yZHMucnVuKCdjaWFvIG1hbW1hWCcpO1xuICAgICAgICBleHBlY3QocGFyc2luZy50b1N0cmluZygpKVxuICAgICAgICAgICAgLnRvLmJlLmVxbCgnVmFsaWRhdGlvbi5TdWNjZXNzKFtbW2MsaSxhLG9dLFsgXSxbbSxhLG0sbSxhXV0scm93PTA7Y29sPTEwO3Jlc3Q9WF0pJyk7XG4gICAgICAgIHBhcnNpbmcgPSB0d29Xb3Jkcy5ydW4oJ2NpYW8gICBtYW1tYVgnKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcudG9TdHJpbmcoKSlcbiAgICAgICAgICAgIC50by5iZS5lcWwoJ1ZhbGlkYXRpb24uU3VjY2VzcyhbW1tjLGksYSxvXSxbICwgLCBdLFttLGEsbSxtLGFdXSxyb3c9MDtjb2w9MTI7cmVzdD1YXSknKTtcbiAgICAgICAgcGFyc2luZyA9IHR3b1dvcmRzLnJ1bignY2lhbyBcXHQgbWFtbWFYJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLnRvU3RyaW5nKCkpXG4gICAgICAgICAgICAudG8uYmUuZXFsKCdWYWxpZGF0aW9uLlN1Y2Nlc3MoW1tbYyxpLGEsb10sWyAsXFx0LCBdLFttLGEsbSxtLGFdXSxyb3c9MDtjb2w9MTI7cmVzdD1YXSknKTtcbiAgICB9KTtcbn0pO1xuXG5kZXNjcmliZSgnYSBwYXJzZXIgZm9yIG9uZSBvciBtb3JlIG9jY3VycmVuY2VzJywgKCkgPT4ge1xuICAgIGl0KCdjYW5ub3QgcGFyc2UgYSBjaGFyIHplcm8gdGltZXMnLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IG9uZU9yTW9yZVBhcnNlciA9IG1hbnkxKHBjaGFyKCdtJykpO1xuICAgICAgICBsZXQgcGFyc2luZyA9IG9uZU9yTW9yZVBhcnNlci5ydW4oJ2FyY28nKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcuaXNGYWlsdXJlKS50by5iZS50cnVlO1xuICAgICAgICBleHBlY3QocGFyc2luZy50b1N0cmluZygpKVxuICAgICAgICAgICAgLnRvLmJlLmVxbCgnVmFsaWRhdGlvbi5GYWlsdXJlKFttYW55MSBwY2hhcl9tLHdhbnRlZCBtOyBnb3QgYSxyb3c9MDtjb2w9MDtyZXN0PWFyY29dKScpO1xuICAgIH0pO1xuICAgIGl0KCdjYW4gcGFyc2UgYSBjaGFyIG1hbnkgdGltZXMgYW5kIHJldHVybiBhbiBhcnJheScsICgpID0+IHtcbiAgICAgICAgY29uc3Qgb25lT3JNb3JlUGFyc2VyID0gbWFueTEocGNoYXIoJ20nKSk7XG4gICAgICAgIGxldCBwYXJzaW5nID0gb25lT3JNb3JlUGFyc2VyLnJ1bignbW1tYXJjbycpO1xuICAgICAgICBleHBlY3QocGFyc2luZy5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgnVmFsaWRhdGlvbi5TdWNjZXNzKFtbbSxtLG1dLHJvdz0wO2NvbD0zO3Jlc3Q9YXJjb10pJyk7XG4gICAgfSk7XG4gICAgaXQoJ2NhbiBwYXJzZSBhIGNoYXIgbWFueSB0aW1lcyBhbmQgcmV0dXJuIGEgc3RyaW5nJywgKCkgPT4ge1xuICAgICAgICBjb25zdCBvbmVPck1vcmVQYXJzZXIgPSBtYW55Q2hhcnMxKHBjaGFyKCdtJykpO1xuICAgICAgICBsZXQgcGFyc2luZyA9IG9uZU9yTW9yZVBhcnNlci5ydW4oJ21tbWFyY28nKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcuaXNTdWNjZXNzKS50by5iZS50cnVlO1xuICAgICAgICBleHBlY3QocGFyc2luZy50b1N0cmluZygpKS50by5iZS5lcWwoJ1ZhbGlkYXRpb24uU3VjY2VzcyhbbW1tLHJvdz0wO2NvbD0zO3Jlc3Q9YXJjb10pJyk7XG4gICAgfSk7XG4gICAgaXQoJ2Nhbm5vdCBwYXJzZSBhIGNoYXIgc2VxdWVuY2UgemVybyB0aW1lcycsICgpID0+IHtcbiAgICAgICAgY29uc3Qgb25lT3JNb3JlUGFyc2VyID0gbWFueTEocHN0cmluZygnbWFyY28nKSk7XG4gICAgICAgIGxldCBwYXJzaW5nID0gb25lT3JNb3JlUGFyc2VyLnJ1bigneG1hcmNvbWFyY29jaWFvJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLmlzRmFpbHVyZSkudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcudG9TdHJpbmcoKSlcbiAgICAgICAgICAgIC50by5iZS5lcWwoJ1ZhbGlkYXRpb24uRmFpbHVyZShbbWFueTEgcHN0cmluZyBtYXJjbyx3YW50ZWQgbTsgZ290IHgscm93PTA7Y29sPTA7cmVzdD14bWFyY29tYXJjb2NpYW9dKScpO1xuICAgIH0pO1xuICAgIGl0KCdjYW4gcGFyc2UgYSBjaGFyIHNlcXVlbmNlIG1hbnkgdGltZXMnLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IG9uZU9yTW9yZVBhcnNlciA9IG1hbnkxKHBzdHJpbmcoJ21hcmNvJykpO1xuICAgICAgICBsZXQgcGFyc2luZyA9IG9uZU9yTW9yZVBhcnNlci5ydW4oJ21hcmNvbWFyY29jaWFvJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcudG9TdHJpbmcoKSlcbiAgICAgICAgICAgIC50by5iZS5lcWwoJ1ZhbGlkYXRpb24uU3VjY2VzcyhbW1ttLGEscixjLG9dLFttLGEscixjLG9dXSxyb3c9MDtjb2w9MTA7cmVzdD1jaWFvXSknKTtcbiAgICB9KTtcbiAgICBpdCgnY2FuIHBhcnNlIGFuIGludGVnZXIsIG5vIG1hdHRlciBob3cgbGFyZ2UuLi4nLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHBpbnQgPSBtYW55MShhbnlPZihkaWdpdHMpKTtcbiAgICAgICAgbGV0IHBhcnNpbmcgPSBwaW50LnJ1bignMTIzNDVBJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcudG9TdHJpbmcoKSkudG8uYmUuZXFsKCdWYWxpZGF0aW9uLlN1Y2Nlc3MoW1sxLDIsMyw0LDVdLHJvdz0wO2NvbD01O3Jlc3Q9QV0pJyk7XG4gICAgICAgIHBhcnNpbmcgPSBwaW50LnJ1bignMUInKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcuaXNTdWNjZXNzKS50by5iZS50cnVlO1xuICAgICAgICBleHBlY3QocGFyc2luZy50b1N0cmluZygpKS50by5iZS5lcWwoJ1ZhbGlkYXRpb24uU3VjY2VzcyhbWzFdLHJvdz0wO2NvbD0xO3Jlc3Q9Ql0pJyk7XG4gICAgICAgIHBhcnNpbmcgPSBwaW50LnJ1bignQTEyMzQ1Jyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLmlzRmFpbHVyZSkudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcudG9TdHJpbmcoKSlcbiAgICAgICAgICAgIC50by5iZS5lcWwoJ1ZhbGlkYXRpb24uRmFpbHVyZShbbWFueTEgYW55T2YgMDEyMzQ1Njc4OSxmYWlsLEExMjM0NV0pJyk7XG4gICAgfSk7XG4gICAgaXQoJ2NhbiBwYXJzZSBhbiBpbnRlZ2VyIGludG8gYSB0cnVlIGludGVnZXInLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHBpbnQgPSBtYW55MShhbnlPZihkaWdpdHMpKVxuICAgICAgICAgICAgLmZtYXAobCA9PiBwYXJzZUludChsLnJlZHVjZSgoYWNjLCBjdXJyKSA9PiBhY2MgKyBjdXJyLCAnJyksIDEwKSk7XG4gICAgICAgIGxldCBwYXJzaW5nID0gcGludC5ydW4oJzEyMzQ1QScpO1xuICAgICAgICBleHBlY3QocGFyc2luZy5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLnZhbHVlWzBdKS50by5iZS5lcWwoMTIzNDUpO1xuICAgICAgICBleHBlY3QocGFyc2luZy52YWx1ZVsxXS50b1N0cmluZygpKS50by5iZS5lcWwoJ3Jvdz0wO2NvbD01O3Jlc3Q9QScpO1xuICAgIH0pO1xufSk7XG5cbmRlc2NyaWJlKCdhIHBhcnNlciBmb3Igb3B0aW9uYWwgY2hhcmFjdGVycycsICgpID0+IHtcbiAgICBpdCgnY2FuIGNhcHR1cmUgb3Igbm90IGNhcHR1cmUgYSBkb3QnLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IG9wdERvdFRoZW5BID0gb3B0KHBjaGFyKCcuJykpLmFuZFRoZW4ocGNoYXIoJ2EnKSk7XG4gICAgICAgIGV4cGVjdChvcHREb3RUaGVuQS5ydW4oJy5hYmMnKS50b1N0cmluZygpKVxuICAgICAgICAgICAgLnRvLmJlLmVxbCgnVmFsaWRhdGlvbi5TdWNjZXNzKFtbTWF5YmUuSnVzdCguKSxhXSxyb3c9MDtjb2w9MjtyZXN0PWJjXSknKTtcbiAgICAgICAgZXhwZWN0KG9wdERvdFRoZW5BLnJ1bignYWJjJykudG9TdHJpbmcoKSlcbiAgICAgICAgICAgIC50by5iZS5lcWwoJ1ZhbGlkYXRpb24uU3VjY2VzcyhbW01heWJlLk5vdGhpbmcsYV0scm93PTA7Y29sPTE7cmVzdD1iY10pJyk7XG4gICAgfSk7XG4gICAgaXQoJ2NhbiBjYXB0dXJlIGEgZG90IG9yIHByb3ZpZGUgYSBkZWZhdWx0IGFsdGVybmF0aXZlJywgKCkgPT4ge1xuICAgICAgICBjb25zdCBvcHREb3RXaXRoRGVmYXVsdFRoZW5BID0gb3B0KHBjaGFyKCcuJyksICdBTFRFUk5BVElWRScpLmFuZFRoZW4ocGNoYXIoJ2EnKSk7XG4gICAgICAgIGV4cGVjdChvcHREb3RXaXRoRGVmYXVsdFRoZW5BLnJ1bignYWJjJykudG9TdHJpbmcoKSlcbiAgICAgICAgICAgIC50by5iZS5lcWwoJ1ZhbGlkYXRpb24uU3VjY2VzcyhbW01heWJlLkp1c3QoQUxURVJOQVRJVkUpLGFdLHJvdz0wO2NvbD0xO3Jlc3Q9YmNdKScpO1xuICAgIH0pO1xuICAgIGl0KCdjYW4gcGFyc2UgU0lHTkVEIGludGVnZXJzISEhJywgKCkgPT4ge1xuICAgICAgICBjb25zdCBwaW50ID0gbWFueTEoYW55T2YoZGlnaXRzKSlcbiAgICAgICAgICAgIC5mbWFwKGwgPT4gcGFyc2VJbnQobC5yZWR1Y2UoKGFjYywgY3VycikgPT4gYWNjICsgY3VyciwgJycpLCAxMCkpO1xuICAgICAgICBjb25zdCBwU2lnbmVkSW50ID0gb3B0KHBjaGFyKCctJykpXG4gICAgICAgICAgICAuYW5kVGhlbihwaW50KVxuICAgICAgICAgICAgLmZtYXAob3B0U2lnbk51bWJlclBhaXIgPT4gKG9wdFNpZ25OdW1iZXJQYWlyWzBdLmlzSnVzdCkgPyAtb3B0U2lnbk51bWJlclBhaXJbMV0gOiBvcHRTaWduTnVtYmVyUGFpclsxXSk7XG4gICAgICAgIGV4cGVjdChwU2lnbmVkSW50LnJ1bignMTMyNDM1NDZ4JykudmFsdWVbMF0pLnRvLmJlLmVxbCgxMzI0MzU0Nik7XG4gICAgICAgIGV4cGVjdChwU2lnbmVkSW50LnJ1bignLTEzMjQzNTQ2eCcpLnZhbHVlWzBdKS50by5iZS5lcWwoLTEzMjQzNTQ2KTtcbiAgICB9KTtcbiAgICBpdCgnY2FuIGNhcHR1cmUgb3Igbm90IGNhcHR1cmUgYSB3aG9sZSBzdWJzdHJpbmcnLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IG9wdFN1YnN0cmluZyA9IG9wdChwc3RyaW5nKCdtYXJjbycpKS5hbmRUaGVuKHBzdHJpbmcoJ2ZhdXN0aW5lbGxpJykpO1xuICAgICAgICBleHBlY3Qob3B0U3Vic3RyaW5nLnJ1bignbWFyY29mYXVzdGluZWxsaXgnKS50b1N0cmluZygpKVxuICAgICAgICAgICAgLnRvLmJlLmVxbCgnVmFsaWRhdGlvbi5TdWNjZXNzKFtbTWF5YmUuSnVzdChbbSxhLHIsYyxvXSksW2YsYSx1LHMsdCxpLG4sZSxsLGwsaV1dLHJvdz0wO2NvbD0xNjtyZXN0PXhdKScpO1xuICAgICAgICBleHBlY3Qob3B0U3Vic3RyaW5nLnJ1bignZmF1c3RpbmVsbGl4JykudG9TdHJpbmcoKSlcbiAgICAgICAgICAgIC50by5iZS5lcWwoJ1ZhbGlkYXRpb24uU3VjY2VzcyhbW01heWJlLk5vdGhpbmcsW2YsYSx1LHMsdCxpLG4sZSxsLGwsaV1dLHJvdz0wO2NvbD0xMTtyZXN0PXhdKScpO1xuICAgIH0pO1xufSk7XG5cbmRlc2NyaWJlKCdhIGNvdXBsZSBvZiBwYXJzZXJzJywgKCkgPT4ge1xuICAgIGl0KCdjYW4gZGVjaWRlIHRvIGRpc2NhcmQgdGhlIG1hdGNoZXMgb2YgdGhlIGZpcnN0IG9uZScsICgpID0+IHtcbiAgICAgICAgY29uc3QgZGlzY2FyZEludGVnZXJTaWduID0gcGNoYXIoJy0nKS5kaXNjYXJkRmlyc3QocGRpZ2l0KDgpKTtcbiAgICAgICAgbGV0IHBhcnNpbmcgPSBkaXNjYXJkSW50ZWdlclNpZ24ucnVuKCctOHgnKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcudG9TdHJpbmcoKSkudG8uYmUuZXFsKCdWYWxpZGF0aW9uLlN1Y2Nlc3MoWzgscm93PTA7Y29sPTI7cmVzdD14XSknKTtcbiAgICB9KTtcbiAgICBpdCgnY2FuIGRlY2lkZSB0byBkaXNjYXJkIHRoZSBtYXRjaGVzIG9mIHRoZSBzZWNvbmQgb25lJywgKCkgPT4ge1xuICAgICAgICBjb25zdCBkaXNjYXJkU3VmZml4ID0gcHN0cmluZygnbWFyY28nKS5kaXNjYXJkU2Vjb25kKG1hbnkxKGFueU9mKHdoaXRlcykpKTtcbiAgICAgICAgbGV0IHBhcnNpbmcgPSBkaXNjYXJkU3VmZml4LnJ1bignbWFyY28gZmF1c3RpbmVsbGknKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcudG9TdHJpbmcoKSkudG8uYmUuZXFsKCdWYWxpZGF0aW9uLlN1Y2Nlc3MoW1ttLGEscixjLG9dLHJvdz0wO2NvbD02O3Jlc3Q9ZmF1c3RpbmVsbGldKScpO1xuICAgICAgICBwYXJzaW5nID0gZGlzY2FyZFN1ZmZpeC5ydW4oJ21hcmNvICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmYXVzdGluZWxsaScpO1xuICAgICAgICBleHBlY3QocGFyc2luZy50b1N0cmluZygpKS50by5iZS5lcWwoJ1ZhbGlkYXRpb24uU3VjY2VzcyhbW20sYSxyLGMsb10scm93PTA7Y29sPTM3O3Jlc3Q9ZmF1c3RpbmVsbGldKScpO1xuICAgIH0pO1xufSk7XG5cbmRlc2NyaWJlKCdhIHRhcHBlciBmb3IgcGFyc2VycycsICgpID0+IHtcbiAgICBpdCgnY2FuIGRvIHRoaW5ncyB3aXRoIGEgcmVzdWx0IHRoYXRcXCdzIGdvaW5nIHRvIGJlIGRpc2NhcmRlZCcsICgpID0+IHtcbiAgICAgICAgY29uc3QgdGFwSW50b0Rpc2NhcmRJbnRlZ2VyU2lnbiA9IHRhcFAocGNoYXIoJy0nKSwgcmVzID0+IHtcbiAgICAgICAgICAgIGV4cGVjdChyZXMpLnRvLmJlLmVxbCgnLScpO1xuICAgICAgICB9KS5kaXNjYXJkRmlyc3QocGRpZ2l0KDgpKTtcbiAgICAgICAgbGV0IHBhcnNpbmcgPSB0YXBJbnRvRGlzY2FyZEludGVnZXJTaWduLnJ1bignLTh4Jyk7XG4gICAgfSk7XG59KTtcblxuZGVzY3JpYmUoJ2EgbG9nZ2VyIGZvciBwYXJzZXJzJywgKCkgPT4ge1xuICAgIGxldCBzdG9yZWRMb2cgPSBjb25zb2xlLmxvZztcbiAgICBpdCgnY2FuIGxvZyBpbnRlcm1lZGlhdGUgcGFyc2luZyByZXN1bHRzJywgKCkgPT4ge1xuICAgICAgICBjb25zb2xlLmxvZyA9IG1zZyA9PiB7XG4gICAgICAgICAgICBleHBlY3QobXNnKS50by5iZS5lcWwoJ3BjaGFyXy06LScpO1xuICAgICAgICB9O1xuICAgICAgICBjb25zdCBsb2dJbnRlcm1lZGlhdGVSZXN1bHQgPSBsb2dQKHBjaGFyKCctJykpXG4gICAgICAgICAgICAuZGlzY2FyZEZpcnN0KHBkaWdpdCg4KSk7XG4gICAgICAgIGxldCBwYXJzaW5nID0gbG9nSW50ZXJtZWRpYXRlUmVzdWx0LnJ1bignLTh4Jyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgnVmFsaWRhdGlvbi5TdWNjZXNzKFs4LHJvdz0wO2NvbD0yO3Jlc3Q9eF0pJyk7XG4gICAgfSk7XG4gICAgaXQoJ2NhbiBsb2cgYSByZXN1bHQgdGhhdFxcJ3MgZ29pbmcgdG8gYmUgZGlzY2FyZGVkJywgKCkgPT4ge1xuICAgICAgICBjb25zb2xlLmxvZyA9IG1zZyA9PiB7XG4gICAgICAgICAgICBleHBlY3QobXNnKS50by5iZS5lcWwoJ21hbnkxIGFueU9mICBcXHRcXG5cXHI6WyAsIF0nKTtcbiAgICAgICAgfTtcbiAgICAgICAgY29uc3QgZGlzY2FyZFN1ZmZpeCA9IHBzdHJpbmcoJ21hcmNvJykuZGlzY2FyZFNlY29uZChsb2dQKG1hbnkxKGFueU9mKHdoaXRlcykpKSk7XG4gICAgICAgIGxldCBwYXJzaW5nID0gZGlzY2FyZFN1ZmZpeC5ydW4oJ21hcmNvICBmYXVzdGluZWxsaScpO1xuICAgICAgICBleHBlY3QocGFyc2luZy50b1N0cmluZygpKS50by5iZS5lcWwoJ1ZhbGlkYXRpb24uU3VjY2VzcyhbW20sYSxyLGMsb10scm93PTA7Y29sPTc7cmVzdD1mYXVzdGluZWxsaV0pJyk7XG4gICAgfSk7XG4gICAgY29uc29sZS5sb2cgPSBzdG9yZWRMb2c7XG59KTtcblxuZGVzY3JpYmUoJ3BhcnNpbmcgd2hpbGUgZGlzY2FyZGluZyBpbnB1dCcsICgpID0+IHtcbiAgICBpdCgnYWxsb3dzIHRvIGV4Y2x1ZGUgcGFyZW50aGVzZXMnLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IGluc2lkZVBhcmVucyA9IHBjaGFyKCcoJylcbiAgICAgICAgICAgIC5kaXNjYXJkRmlyc3QobWFueShhbnlPZihsb3dlcmNhc2VzKSkpXG4gICAgICAgICAgICAuZGlzY2FyZFNlY29uZChwY2hhcignKScpKTtcbiAgICAgICAgZXhwZWN0KGluc2lkZVBhcmVucy5ydW4oJyhtYXJjbyknKS50b1N0cmluZygpKVxuICAgICAgICAgICAgLnRvLmJlLmVxbCgnVmFsaWRhdGlvbi5TdWNjZXNzKFtbbSxhLHIsYyxvXSxyb3c9MTtjb2w9MDtyZXN0PV0pJyk7XG4gICAgICAgIGV4cGVjdChpbnNpZGVQYXJlbnMucnVuKCcoKScpLnRvU3RyaW5nKCkpXG4gICAgICAgICAgICAudG8uYmUuZXFsKCdWYWxpZGF0aW9uLlN1Y2Nlc3MoW1tdLHJvdz0xO2NvbD0wO3Jlc3Q9XSknKTtcbiAgICB9KTtcbiAgICBpdCgnLi4uZXZlbiB1c2luZyBhIHRhaWxvci1tYWRlIG1ldGhvZCcsICgpID0+IHtcbiAgICAgICAgY29uc3QgaW5zaWRlUGFyZW5zID0gYmV0d2VlblBhcmVucyhwc3RyaW5nKCdtYXJjbycpKTtcbiAgICAgICAgZXhwZWN0KGluc2lkZVBhcmVucy5ydW4oJyhtYXJjbyknKS50b1N0cmluZygpKVxuICAgICAgICAgICAgLnRvLmJlLmVxbCgnVmFsaWRhdGlvbi5TdWNjZXNzKFtbbSxhLHIsYyxvXSxyb3c9MTtjb2w9MDtyZXN0PV0pJyk7XG4gICAgfSk7XG4gICAgaXQoJ2NoZXJyeS1waWNraW5nIGVsZW1lbnRzIHNlcGFyYXRlZCBieSBzZXBhcmF0b3JzJywgKCkgPT4ge1xuICAgICAgICBjb25zdCBzdWJzdHJpbmdzV2l0aENvbW1hcyA9IG1hbnkobWFueTEoYW55T2YobG93ZXJjYXNlcykpLmRpc2NhcmRTZWNvbmQocGNoYXIoJywnKSkpO1xuICAgICAgICBleHBlY3Qoc3Vic3RyaW5nc1dpdGhDb21tYXMucnVuKCdhLGIsY2QsMScpLnRvU3RyaW5nKCkpXG4gICAgICAgICAgICAudG8uYmUuZXFsKCdWYWxpZGF0aW9uLlN1Y2Nlc3MoW1tbYV0sW2JdLFtjLGRdXSxyb3c9MDtjb2w9NztyZXN0PTFdKScpO1xuICAgIH0pO1xuICAgIGl0KCcuLi5hbHNvIHdoZW4gaW5zaWRlIGEgbGlzdHMnLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHN1YnN0cmluZ3NXaXRoQ29tbWFzID0gbWFueShtYW55MShhbnlPZihsb3dlcmNhc2VzKSkuZGlzY2FyZFNlY29uZChwY2hhcignLCcpKSk7XG4gICAgICAgIGNvbnN0IGxpc3RFbGVtZW50cyA9IGJldHdlZW4ocGNoYXIoJ1snKSwgc3Vic3RyaW5nc1dpdGhDb21tYXMsIHBjaGFyKCddJykpO1xuICAgICAgICBleHBlY3QobGlzdEVsZW1lbnRzLnJ1bignW2EsYixjZCxtYXJjbyxdMScpLnRvU3RyaW5nKCkpXG4gICAgICAgICAgICAudG8uYmUuZXFsKCdWYWxpZGF0aW9uLlN1Y2Nlc3MoW1tbYV0sW2JdLFtjLGRdLFttLGEscixjLG9dXSxyb3c9MDtjb2w9MTU7cmVzdD0xXSknKTtcbiAgICB9KTtcbiAgICBkZXNjcmliZSgndGhhbmtzIHRvIHRoZSBzcGVjaWZpYyBzZXBCeTEgb3BlcmF0b3InLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHZhbHVlc1AgPSBhbnlPZihsb3dlcmNhc2VzKTtcbiAgICAgICAgY29uc3QgY29tbWFQID0gcGNoYXIoJywnKTtcbiAgICAgICAgaXQoJ2NoZXJyeS1waWNraW5nIGVsZW1lbnRzIHNlcGFyYXRlZCBieSBzZXBhcmF0b3JzJywgKCkgPT4ge1xuICAgICAgICAgICAgZXhwZWN0KHNlcEJ5MSh2YWx1ZXNQLCBjb21tYVApLnJ1bignYSxiLGNkLDEnKS50b1N0cmluZygpKVxuICAgICAgICAgICAgICAgIC50by5iZS5lcWwoJ1ZhbGlkYXRpb24uU3VjY2VzcyhbW1thXSxbYl0sW2MsZF1dLHJvdz0wO2NvbD03O3Jlc3Q9MV0pJyk7XG4gICAgICAgIH0pO1xuICAgICAgICBpdCgnLi4uYWxzbyB3aGVuIGluc2lkZSBhIGxpc3RzJywgKCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgbGlzdEVsZW1lbnRzID0gYmV0d2VlbihwY2hhcignWycpLCBzZXBCeTEodmFsdWVzUCwgY29tbWFQKSwgcGNoYXIoJ10nKSk7XG4gICAgICAgICAgICBleHBlY3QobGlzdEVsZW1lbnRzLnJ1bignW2EsYixjZCxtYXJjbyxdJykudG9TdHJpbmcoKSlcbiAgICAgICAgICAgICAgICAudG8uYmUuZXFsKCdWYWxpZGF0aW9uLlN1Y2Nlc3MoW1tbYV0sW2JdLFtjLGRdLFttLGEscixjLG9dXSxyb3c9MTtjb2w9MDtyZXN0PV0pJyk7XG4gICAgICAgIH0pO1xuICAgICAgICBpdCgnLi4ubGlzdHMgd2l0aCBubyBlbGVtZW50cycsICgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGxpc3RFbGVtZW50cyA9IGJldHdlZW4ocGNoYXIoJ1snKSwgc2VwQnkxKHZhbHVlc1AsIGNvbW1hUCksIHBjaGFyKCddJykpO1xuICAgICAgICAgICAgZXhwZWN0KGxpc3RFbGVtZW50cy5ydW4oJ1tdJykudG9TdHJpbmcoKSlcbiAgICAgICAgICAgICAgICAudG8uYmUuZXFsKCdWYWxpZGF0aW9uLlN1Y2Nlc3MoW1tdLHJvdz0xO2NvbD0wO3Jlc3Q9XSknKTtcbiAgICAgICAgfSk7XG4gICAgICAgIGl0KCcuLi5saXN0cyB3aXRoIGp1c3Qgb25lIGVsZW1lbnQnLCAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBsaXN0RWxlbWVudHMgPSBiZXR3ZWVuKHBjaGFyKCdbJyksIHNlcEJ5MSh2YWx1ZXNQLCBjb21tYVApLCBwY2hhcignXScpKTtcbiAgICAgICAgICAgIGV4cGVjdChsaXN0RWxlbWVudHMucnVuKCdbYV0nKS50b1N0cmluZygpKVxuICAgICAgICAgICAgICAgIC50by5iZS5lcWwoJ1ZhbGlkYXRpb24uU3VjY2VzcyhbW1thXV0scm93PTE7Y29sPTA7cmVzdD1dKScpO1xuICAgICAgICB9KTtcbiAgICB9KTtcbn0pO1xuIl19