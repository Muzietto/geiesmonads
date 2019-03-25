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
            (0, _chai.expect)((0, _parsers.sequenceP)([_parsers.notStartOfInputP, (0, _parsers.pchar)('a')]).run(_classes.Position.fromText('abc')).toString()).to.be.eql('Validation.Failure([unknown,fail,row=0;col=0;rest=abc])');
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2pzLXNwZWMvcGFyc2Vyc190ZXN0cy5qcyJdLCJuYW1lcyI6WyJsb3dlcmNhc2VzIiwidXBwZXJjYXNlcyIsImRpZ2l0cyIsIndoaXRlcyIsInRleHQiLCJQb3NpdGlvbiIsImZyb21UZXh0IiwiZGVzY3JpYmUiLCJwYXJzZXJBIiwicGFyc2VyMSIsIml0IiwicGFyc2luZ0EiLCJ2YWx1ZSIsInRvIiwiYmUiLCJlcWwiLCJyZXN0IiwiaXNTdWNjZXNzIiwidHJ1ZSIsInBhcnNpbmdCIiwiaXNGYWlsdXJlIiwicGFyc2luZzEiLCJwYXJzaW5nMiIsInBhcnNpbmczIiwicnVuIiwic3RhcnRPZklucHV0UCIsImxhdGVySW5UaGVTdHJlYW0iLCJzdGFydEFCQyIsInBhcnNpbmciLCJ0b1N0cmluZyIsIm5vdFN0YXJ0T2ZJbnB1dFAiLCJBQk5vdFN0YXJ0QyIsImZpbmFsbHlJblRoZVN0cmVhbSIsImVuZE9mSW5wdXRQIiwibm90RmluYWxseUluVGhlU3RyZWFtIiwibm90RW5kT2ZJbnB1dFAiLCJBQm5vdEVuZEMiLCJtYXAiLCJsb2dQIiwiQW5vdEVuZEIiLCJwYXJzZXJBYW5kQiIsInBhcnNpbmdBYW5kQiIsInBhcnNlckFvckIiLCJwYXJzaW5nQW9yQiIsIndoYXRldmVyIiwic3VjY2VlZFAiLCJmYWlsUCIsInBhcnNlcnNDaG9pY2UiLCJwYXJzaW5nQ2hvaWNlIiwibG93ZXJjYXNlc1BhcnNlciIsInVwcGVyY2FzZXNQYXJzZXIiLCJkaWdpdHNQYXJzZXIiLCJYYWZ0ZXJZIiwiWVhwIiwicGFyc2luZ1lYIiwiQVhwIiwicGFyc2luZ0FYIiwiWG5vdEFmdGVyWSIsInBhaXJBZGRlciIsIngiLCJ5IiwiYWJjUCIsImZtYXAiLCJwYXJzZURpZ2l0IiwidGhyZWVEaWdpdHMiLCJiZWZvcmUiLCJ1bnBhY2tlciIsInoiLCJ0aHJlZURpZ2l0c0ltcGwiLCJ0aHJlZURpZ2l0c0luc3QiLCJhZGRTdHJpbmdzIiwiQXBsdXNCIiwiYWRkRGlnaXRzIiwiYWRkUGFyc2VyIiwiYWJjUGFyc2VyIiwibWFyY29QYXJzZXIiLCJtYXJjb1BhcnNpbmciLCJ0cmltbWVyIiwiYW5kVGhlbiIsInplcm9Pck1vcmVQYXJzaW5nRnVuY3Rpb24iLCJ6ZXJvT3JNb3JlUGFyc2VyIiwiZXhhY3RseVRocmVlIiwid2hpdGVzUGFyc2VyIiwidHdvV29yZHMiLCJvbmVPck1vcmVQYXJzZXIiLCJwaW50IiwicGFyc2VJbnQiLCJsIiwicmVkdWNlIiwiYWNjIiwiY3VyciIsIm9wdERvdFRoZW5BIiwib3B0RG90V2l0aERlZmF1bHRUaGVuQSIsInBTaWduZWRJbnQiLCJvcHRTaWduTnVtYmVyUGFpciIsImlzSnVzdCIsIm9wdFN1YnN0cmluZyIsImRpc2NhcmRJbnRlZ2VyU2lnbiIsImRpc2NhcmRGaXJzdCIsImRpc2NhcmRTdWZmaXgiLCJkaXNjYXJkU2Vjb25kIiwidGFwSW50b0Rpc2NhcmRJbnRlZ2VyU2lnbiIsInJlcyIsInN0b3JlZExvZyIsImNvbnNvbGUiLCJsb2ciLCJtc2ciLCJsb2dJbnRlcm1lZGlhdGVSZXN1bHQiLCJpbnNpZGVQYXJlbnMiLCJzdWJzdHJpbmdzV2l0aENvbW1hcyIsImxpc3RFbGVtZW50cyIsInZhbHVlc1AiLCJjb21tYVAiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBdURBLFFBQU1BLGFBQWEsQ0FBQyxHQUFELEVBQU0sR0FBTixFQUFXLEdBQVgsRUFBZ0IsR0FBaEIsRUFBcUIsR0FBckIsRUFBMEIsR0FBMUIsRUFBK0IsR0FBL0IsRUFBb0MsR0FBcEMsRUFBeUMsR0FBekMsRUFBOEMsR0FBOUMsRUFBbUQsR0FBbkQsRUFBd0QsR0FBeEQsRUFBNkQsR0FBN0QsRUFBa0UsR0FBbEUsRUFBdUUsR0FBdkUsRUFBNEUsR0FBNUUsRUFBaUYsR0FBakYsRUFBc0YsR0FBdEYsRUFBMkYsR0FBM0YsRUFBZ0csR0FBaEcsRUFBcUcsR0FBckcsRUFBMEcsR0FBMUcsRUFBK0csR0FBL0csRUFBb0gsR0FBcEgsRUFB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LEVBQVAsRUFDS2hCLEVBREwsQ0FDUUMsRUFEUixDQUNXQyxHQURYLENBQ2UscUVBRGY7QUFFSCxhQUpEO0FBS0FMLGVBQUcsMkJBQUgsRUFBZ0MsWUFBTTtBQUNsQyxvQkFBTW9HLGVBQWUsc0JBQVEsb0JBQU0sR0FBTixDQUFSLEVBQW9CLHFCQUFPQyxPQUFQLEVBQWdCQyxNQUFoQixDQUFwQixFQUE2QyxvQkFBTSxHQUFOLENBQTdDLENBQXJCO0FBQ0Esa0NBQU9GLGFBQWF0RixHQUFiLENBQWlCLElBQWpCLEVBQXVCSyxRQUF2QixFQUFQLEVBQ0toQixFQURMLENBQ1FDLEVBRFIsQ0FDV0MsR0FEWCxDQUNlLDRDQURmO0FBRUgsYUFKRDtBQUtBTCxlQUFHLGdDQUFILEVBQXFDLFlBQU07QUFDdkMsb0JBQU1vRyxlQUFlLHNCQUFRLG9CQUFNLEdBQU4sQ0FBUixFQUFvQixxQkFBT0MsT0FBUCxFQUFnQkMsTUFBaEIsQ0FBcEIsRUFBNkMsb0JBQU0sR0FBTixDQUE3QyxDQUFyQjtBQUNBLGtDQUFPRixhQUFhdEYsR0FBYixDQUFpQixLQUFqQixFQUF3QkssUUFBeEIsRUFBUCxFQUNLaEIsRUFETCxDQUNRQyxFQURSLENBQ1dDLEdBRFgsQ0FDZSwrQ0FEZjtBQUVILGFBSkQ7QUFLSCxTQXRCRDtBQXVCSCxLQWpERCIsImZpbGUiOiJwYXJzZXJzX3Rlc3RzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtleHBlY3R9IGZyb20gJ2NoYWknO1xuaW1wb3J0IHtcbiAgICBjaGFyUGFyc2VyLFxuICAgIGRpZ2l0UGFyc2VyLFxuICAgIHBjaGFyLFxuICAgIHBkaWdpdCxcbiAgICBhbmRUaGVuLFxuICAgIG9yRWxzZSxcbiAgICBjaG9pY2UsXG4gICAgYW55T2YsXG4gICAgZm1hcCxcbiAgICByZXR1cm5QLFxuICAgIGFwcGx5UCxcbiAgICBsaWZ0MixcbiAgICBzZXF1ZW5jZVAsXG4gICAgc2VxdWVuY2VQMixcbiAgICBwc3RyaW5nLFxuICAgIHN0cmluZ1AsXG4gICAgemVyb09yTW9yZSxcbiAgICBtYW55LFxuICAgIG1hbnkxLFxuICAgIG1hbnlDaGFycyxcbiAgICBtYW55Q2hhcnMxLFxuICAgIG9wdCxcbiAgICBvcHRCb29rLFxuICAgIGRpc2NhcmRGaXJzdCxcbiAgICBkaXNjYXJkU2Vjb25kLFxuICAgIHNlcEJ5MSxcbiAgICBiZXR3ZWVuLFxuICAgIGJldHdlZW5QYXJlbnMsXG4gICAgdGFwUCxcbiAgICBsb2dQLFxuICAgIHB3b3JkLFxuICAgIHRyaW1QLFxuICAgIHByZWNlZGVkQnlQLFxuICAgIG5vdFByZWNlZGVkQnlQLFxuICAgIHN0YXJ0T2ZJbnB1dFAsXG4gICAgbm90U3RhcnRPZklucHV0UCxcbiAgICBlbmRPZklucHV0UCxcbiAgICBub3RFbmRPZklucHV0UCxcbiAgICBzdWNjZWVkUCxcbiAgICBmYWlsUCxcbn0gZnJvbSAncGFyc2Vycyc7XG5pbXBvcnQge1xuICAgIGlzUGFpcixcbiAgICBpc1N1Y2Nlc3MsXG4gICAgaXNGYWlsdXJlLFxuICAgIGlzUGFyc2VyLFxuICAgIGlzU29tZSxcbiAgICBpc05vbmUsXG59IGZyb20gJ3V0aWwnO1xuaW1wb3J0IHtNYXliZX0gZnJvbSAnbWF5YmUnO1xuaW1wb3J0IHtWYWxpZGF0aW9ufSBmcm9tICd2YWxpZGF0aW9uJztcbmltcG9ydCB7UG9zaXRpb259IGZyb20gJ2NsYXNzZXMnO1xuXG5jb25zdCBsb3dlcmNhc2VzID0gWydhJywgJ2InLCAnYycsICdkJywgJ2UnLCAnZicsICdnJywgJ2gnLCAnaScsICdqJywgJ2snLCAnbCcsICdtJywgJ24nLCAnbycsICdwJywgJ3EnLCAncicsICdzJywgJ3QnLCAndScsICd2JywgJ3cnLCAneCcsICd5JywgJ3onLF07XG5jb25zdCB1cHBlcmNhc2VzID0gWydBJywgJ0InLCAnQycsICdEJywgJ0UnLCAnRicsICdHJywgJ0gnLCAnSScsICdKJywgJ0snLCAnTCcsICdNJywgJ04nLCAnTycsICdQJywgJ1EnLCAnUicsICdTJywgJ1QnLCAnVScsICdWJywgJ1cnLCAnWCcsICdZJywgJ1onLF07XG5jb25zdCBkaWdpdHMgPSBbJzAnLCAnMScsICcyJywgJzMnLCAnNCcsICc1JywgJzYnLCAnNycsICc4JywgJzknXTtcbmNvbnN0IHdoaXRlcyA9IFsnICcsICdcXHQnLCAnXFxuJywgJ1xcciddO1xuY29uc3QgdGV4dCA9IFBvc2l0aW9uLmZyb21UZXh0O1xuXG5kZXNjcmliZSgnYSB2ZXJ5IHNpbXBsZSBwYXJzZXIgZm9yIGNoYXJzIG9yIGZvciBkaWdpdHMnLCAoKSA9PiB7XG4gICAgY29uc3QgcGFyc2VyQSA9IGNoYXJQYXJzZXIoJ2EnKTtcbiAgICBjb25zdCBwYXJzZXIxID0gZGlnaXRQYXJzZXIoMSk7XG5cbiAgICBpdCgnY2FuIHBhcnNlIGEgc2luZ2xlIGNoYXInLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHBhcnNpbmdBID0gcGFyc2VyQSh0ZXh0KCdhYmMnKSk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQS52YWx1ZVswXSkudG8uYmUuZXFsKCdhJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQS52YWx1ZVsxXS5yZXN0KCkpLnRvLmJlLmVxbCgnYmMnKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdBLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcbiAgICB9KTtcblxuICAgIGl0KCdjYW4gYWxzbyBOT1QgcGFyc2UgYSBzaW5nbGUgY2hhcicsICgpID0+IHtcbiAgICAgICAgY29uc3QgcGFyc2luZ0IgPSBwYXJzZXJBKHRleHQoJ2JjZCcpKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdCLnZhbHVlWzBdKS50by5iZS5lcWwoJ2NoYXJQYXJzZXInKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdCLnZhbHVlWzFdKS50by5iZS5lcWwoJ3dhbnRlZCBhOyBnb3QgYicpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0IudmFsdWVbMl0ucmVzdCgpKS50by5iZS5lcWwoJ2JjZCcpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0IuaXNGYWlsdXJlKS50by5iZS50cnVlO1xuICAgIH0pO1xuXG4gICAgaXQoJ2ZhaWxzIGF0IHRoZSBlbmQgb2YgdGhlIHN0cmVhbScsICgpID0+IHtcbiAgICAgICAgY29uc3QgcGFyc2luZ0EgPSBwYXJzZXJBKHRleHQoJycpKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdBLnZhbHVlWzBdKS50by5iZS5lcWwoJ2NoYXJQYXJzZXInKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdBLnZhbHVlWzFdKS50by5iZS5lcWwoJ25vIG1vcmUgaW5wdXQnKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdBLnZhbHVlWzJdLnJlc3QoKSkudG8uYmUuZXFsKCcnKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdBLmlzRmFpbHVyZSkudG8uYmUudHJ1ZTtcbiAgICB9KTtcblxuICAgIGl0KCdjYW4gcGFyc2UgYSBzaW5nbGUgZGlnaXQnLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHBhcnNpbmcxID0gcGFyc2VyMSh0ZXh0KCcxMjMnKSk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nMS52YWx1ZVswXSkudG8uYmUuZXFsKDEpO1xuICAgICAgICBleHBlY3QocGFyc2luZzEudmFsdWVbMV0ucmVzdCgpKS50by5iZS5lcWwoJzIzJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nMS5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgfSk7XG5cbiAgICBpdCgnY2FuIGFsc28gTk9UIHBhcnNlIGEgc2luZ2xlIGRpZ2l0JywgKCkgPT4ge1xuICAgICAgICBjb25zdCBwYXJzaW5nMiA9IHBhcnNlcjEodGV4dCgnMjM0JykpO1xuICAgICAgICBleHBlY3QocGFyc2luZzIudmFsdWVbMF0pLnRvLmJlLmVxbCgnZGlnaXRQYXJzZXInKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcyLnZhbHVlWzFdKS50by5iZS5lcWwoJ3dhbnRlZCAxOyBnb3QgMicpO1xuICAgICAgICBleHBlY3QocGFyc2luZzIudmFsdWVbMl0ucmVzdCgpKS50by5iZS5lcWwoJzIzNCcpO1xuICAgICAgICBleHBlY3QocGFyc2luZzIuaXNGYWlsdXJlKS50by5iZS50cnVlO1xuICAgIH0pO1xuXG4gICAgaXQoJ2ZhaWxzIGF0IHRoZSBlbmQgb2YgdGhlIHN0cmVhbSBhbHNvIHdoZW4gaHVudGluZyBmb3IgZGlnaXRzJywgKCkgPT4ge1xuICAgICAgICBjb25zdCBwYXJzaW5nMyA9IHBhcnNlcjEodGV4dCgnJykpO1xuICAgICAgICBleHBlY3QocGFyc2luZzMudmFsdWVbMF0pLnRvLmJlLmVxbCgnZGlnaXRQYXJzZXInKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmczLnZhbHVlWzFdKS50by5iZS5lcWwoJ25vIG1vcmUgaW5wdXQnKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmczLnZhbHVlWzJdLnJlc3QoKSkudG8uYmUuZXFsKCcnKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmczLmlzRmFpbHVyZSkudG8uYmUudHJ1ZTtcbiAgICB9KTtcbn0pO1xuXG5kZXNjcmliZSgnYSBuYW1lZCBjaGFyYWN0ZXIgcGFyc2VyJywgKCkgPT4ge1xuICAgIGNvbnN0IHBhcnNlckEgPSBwY2hhcignYScpO1xuXG4gICAgaXQoJ2NhbiBwYXJzZSBhIHNpbmdsZSBjaGFyJywgKCkgPT4ge1xuICAgICAgICBleHBlY3QoaXNQYXJzZXIocGFyc2VyQSkpLnRvLmJlLnRydWU7XG4gICAgICAgIGNvbnN0IHBhcnNpbmdBID0gcGFyc2VyQS5ydW4odGV4dCgnYWJjJykpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0EudmFsdWVbMF0pLnRvLmJlLmVxbCgnYScpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0EudmFsdWVbMV0ucmVzdCgpKS50by5iZS5lcWwoJ2JjJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQS5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgfSk7XG5cbiAgICBpdCgnY2FuIGFsc28gTk9UIHBhcnNlIGEgc2luZ2xlIGNoYXInLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHBhcnNpbmdCID0gcGFyc2VyQS5ydW4odGV4dCgnYmNkJykpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0IudmFsdWVbMF0pLnRvLmJlLmVxbCgncGNoYXJfYScpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0IudmFsdWVbMV0pLnRvLmJlLmVxbCgnd2FudGVkIGE7IGdvdCBiJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQi5pc0ZhaWx1cmUpLnRvLmJlLnRydWU7XG4gICAgfSk7XG59KTtcblxuZGVzY3JpYmUoJ2EgcGFyc2VyIGZvciB0aGUgc3RhcnQgb2YgdGhlIGlucHV0JywgKCkgPT4ge1xuICBpdCgnc3VjY2VlZHMgYXQgdGhlIHN0YXJ0IG9mIHRoZSBzdHJlYW0nLCAoKSA9PiB7XG4gICAgZXhwZWN0KHN0YXJ0T2ZJbnB1dFAucnVuKFBvc2l0aW9uLmZyb21UZXh0KCdhYmMnKSkuaXNTdWNjZXNzKS50by5iZS50cnVlO1xuICB9KTtcbiAgaXQoJ2ZhaWxzIGhhbGZ3YXkgdGhyb3VnaCB0aGUgc3RyZWFtJywgKCkgPT4ge1xuICAgIGNvbnN0IGxhdGVySW5UaGVTdHJlYW0gPSBzZXF1ZW5jZVAoW3BjaGFyKCdhJyksIHN0YXJ0T2ZJbnB1dFBdKTtcbiAgICBleHBlY3QobGF0ZXJJblRoZVN0cmVhbS5ydW4oUG9zaXRpb24uZnJvbVRleHQoJ2FiYycpKS5pc0ZhaWx1cmUpLnRvLmJlLnRydWU7XG4gIH0pO1xuICBpdCgnZG9lcyBub3QgY29uc3VtZSBjaGFyYWN0ZXJzLCBidXQgaXQgcmV0dXJucyBhbiBlbXB0eSBzdHJpbmcgYXMgcmVzdWx0JywgKCkgPT4ge1xuICAgIGNvbnN0IHN0YXJ0QUJDID0gc2VxdWVuY2VQKFtzdGFydE9mSW5wdXRQLCBwY2hhcignQScpLCBwY2hhcignQicpLCBwY2hhcignQycpXSk7XG4gICAgY29uc3QgcGFyc2luZyA9IHN0YXJ0QUJDLnJ1bihQb3NpdGlvbi5mcm9tVGV4dCgnQUJDJykpO1xuICAgIGV4cGVjdChwYXJzaW5nLnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgnVmFsaWRhdGlvbi5TdWNjZXNzKFtbLEEsQixDXSxyb3c9MTtjb2w9MDtyZXN0PV0pJyk7XG4gIH0pO1xufSk7XG5cbmRlc2NyaWJlKCdhIHBhcnNlciBmb3IgTk9UIHRoZSBzdGFydCBvZiB0aGUgaW5wdXQnLCAoKSA9PiB7XG4gIGl0KCdmYWlscyBhdCB0aGUgc3RhcnQgb2YgdGhlIHN0cmVhbScsICgpID0+IHtcbiAgICBleHBlY3Qobm90U3RhcnRPZklucHV0UC5ydW4oUG9zaXRpb24uZnJvbVRleHQoJ2FiYycpKS5pc0ZhaWx1cmUpLnRvLmJlLnRydWU7XG4gICAgZXhwZWN0KHNlcXVlbmNlUChbbm90U3RhcnRPZklucHV0UCwgcGNoYXIoJ2EnKV0pLnJ1bihQb3NpdGlvbi5mcm9tVGV4dCgnYWJjJykpLnRvU3RyaW5nKCkpXG4gICAgICAudG8uYmUuZXFsKCdWYWxpZGF0aW9uLkZhaWx1cmUoW3Vua25vd24sZmFpbCxyb3c9MDtjb2w9MDtyZXN0PWFiY10pJyk7XG4gIH0pO1xuICBpdCgnc3VjY2VlZHMgaGFsZndheSB0aHJvdWdoIHRoZSBzdHJlYW0nLCAoKSA9PiB7XG4gICAgY29uc3QgbGF0ZXJJblRoZVN0cmVhbSA9IHNlcXVlbmNlUChbcGNoYXIoJ2EnKSwgbm90U3RhcnRPZklucHV0UF0pO1xuICAgIGV4cGVjdChsYXRlckluVGhlU3RyZWFtLnJ1bihQb3NpdGlvbi5mcm9tVGV4dCgnYWJjJykpLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcbiAgfSk7XG4gIGl0KCdkb2VzIG5vdCBjb25zdW1lIGNoYXJhY3RlcnMsIGJ1dCBpdCByZXR1cm5zIGFuIGVtcHR5IHN0cmluZyBhcyByZXN1bHQnLCAoKSA9PiB7XG4gICAgY29uc3QgQUJOb3RTdGFydEMgPSBzZXF1ZW5jZVAoW3BjaGFyKCdBJyksIHBjaGFyKCdCJyksIG5vdFN0YXJ0T2ZJbnB1dFAsIHBjaGFyKCdDJyldKTtcbiAgICBjb25zdCBwYXJzaW5nID0gQUJOb3RTdGFydEMucnVuKFBvc2l0aW9uLmZyb21UZXh0KCdBQkMnKSk7XG4gICAgZXhwZWN0KHBhcnNpbmcudG9TdHJpbmcoKSkudG8uYmUuZXFsKCdWYWxpZGF0aW9uLlN1Y2Nlc3MoW1tBLEIsLENdLHJvdz0xO2NvbD0wO3Jlc3Q9XSknKTtcbiAgfSk7XG59KTtcblxuZGVzY3JpYmUoJ2EgcGFyc2VyIGZvciB0aGUgZW5kIG9mIHRoZSBpbnB1dCcsICgpID0+IHtcbiAgaXQoJ3N1Y2NlZWRzIGF0IHRoZSBlbmQgb2YgdGhlIHN0cmVhbScsICgpID0+IHtcbiAgICBjb25zdCBmaW5hbGx5SW5UaGVTdHJlYW0gPSBzZXF1ZW5jZVAoW3BjaGFyKCdhJyksIHBjaGFyKCdiJyksIGVuZE9mSW5wdXRQXSk7XG4gICAgZXhwZWN0KGZpbmFsbHlJblRoZVN0cmVhbS5ydW4oUG9zaXRpb24uZnJvbVRleHQoJ2FiJykpLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcbiAgfSk7XG4gIGl0KCdmYWlscyBoYWxmd2F5IHRocm91Z2ggdGhlIHN0cmVhbScsICgpID0+IHtcbiAgICBjb25zdCBsYXRlckluVGhlU3RyZWFtID0gc2VxdWVuY2VQKFtwY2hhcignYScpLCBlbmRPZklucHV0UF0pO1xuICAgIGV4cGVjdChsYXRlckluVGhlU3RyZWFtLnJ1bihQb3NpdGlvbi5mcm9tVGV4dCgnYWJjJykpLmlzRmFpbHVyZSkudG8uYmUudHJ1ZTtcbiAgfSk7XG59KTtcblxuZGVzY3JpYmUoJ2EgcGFyc2VyIGZvciBOT1QgdGhlIGVuZCBvZiB0aGUgaW5wdXQnLCAoKSA9PiB7XG4gIGl0KCdmYWlscyBhdCB0aGUgZW5kIG9mIHRoZSBzdHJlYW0nLCAoKSA9PiB7XG4gICAgY29uc3Qgbm90RmluYWxseUluVGhlU3RyZWFtID0gc2VxdWVuY2VQKFtwY2hhcignYScpLCBub3RFbmRPZklucHV0UF0pO1xuICAgIGV4cGVjdChub3RGaW5hbGx5SW5UaGVTdHJlYW0ucnVuKFBvc2l0aW9uLmZyb21UZXh0KCdhJykpLmlzRmFpbHVyZSkudG8uYmUudHJ1ZTtcbiAgfSk7XG4gIGl0KCdzdWNjZWVkcyBoYWxmd2F5IHRocm91Z2ggdGhlIHN0cmVhbScsICgpID0+IHtcbiAgICBjb25zdCBBQm5vdEVuZEMgPSBzZXF1ZW5jZVAoW3BjaGFyKCdBJyksIHBjaGFyKCdCJyksIG5vdEVuZE9mSW5wdXRQLCBwY2hhcignQycpXS5tYXAobG9nUCkpO1xuICAgIGV4cGVjdChBQm5vdEVuZEMucnVuKFBvc2l0aW9uLmZyb21UZXh0KCdBQkMnKSkuaXNTdWNjZXNzKS50by5iZS50cnVlO1xuICB9KTtcbiAgaXQoJ2RvZXMgbm90IGNvbnN1bWUgY2hhcmFjdGVycywgYnV0IGl0IHJldHVybnMgYW4gZW1wdHkgc3RyaW5nIGFzIHJlc3VsdCcsICgpID0+IHtcbiAgICBjb25zdCBBbm90RW5kQiA9IHNlcXVlbmNlUChbcGNoYXIoJ0EnKSwgbm90RW5kT2ZJbnB1dFAsIHBjaGFyKCdCJyldLm1hcChsb2dQKSk7XG4gICAgZXhwZWN0KEFub3RFbmRCLnJ1bihQb3NpdGlvbi5mcm9tVGV4dCgnQUInKSkudG9TdHJpbmcoKSkudG8uYmUuZXFsKCdWYWxpZGF0aW9uLlN1Y2Nlc3MoW1tBLCxCXSxyb3c9MTtjb2w9MDtyZXN0PV0pJyk7XG4gIH0pO1xufSk7XG5cbmRlc2NyaWJlKCd0d28gcGFyc2VycyBib3VuZCBieSBhbmRUaGVuJywgKCkgPT4ge1xuICAgIGNvbnN0IHBhcnNlckFhbmRCID0gYW5kVGhlbihwY2hhcignYScpLCBwY2hhcignYicpKTtcblxuICAgIGl0KCdjYW4gcGFyc2UgdHdvIGNoYXJzJywgKCkgPT4ge1xuICAgICAgICBleHBlY3QoaXNQYXJzZXIocGFyc2VyQWFuZEIpKS50by5iZS50cnVlO1xuICAgICAgICBjb25zdCBwYXJzaW5nQWFuZEIgPSBwYXJzZXJBYW5kQi5ydW4odGV4dCgnYWJjJykpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0FhbmRCLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdBYW5kQi52YWx1ZVswXS50b1N0cmluZygpKS50by5iZS5lcWwoJ1thLGJdJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQWFuZEIudmFsdWVbMV0ucmVzdCgpKS50by5iZS5lcWwoJ2MnKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdBYW5kQi50b1N0cmluZygpKS50by5iZS5lcWwoJ1ZhbGlkYXRpb24uU3VjY2VzcyhbW2EsYl0scm93PTA7Y29sPTI7cmVzdD1jXSknKTtcbiAgICB9KTtcblxuICAgIGl0KCdjYW4gYWxzbyBOT1QgcGFyc2UgdHdvIGNoYXJzJywgKCkgPT4ge1xuICAgICAgICBjb25zdCBwYXJzaW5nQWFuZEIgPSBwYXJzZXJBYW5kQi5ydW4odGV4dCgnYWNkJykpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0FhbmRCLmlzRmFpbHVyZSkudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdBYW5kQi52YWx1ZVswXSkudG8uYmUuZXFsKCdwY2hhcl9hIGFuZFRoZW4gcGNoYXJfYicpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0FhbmRCLnZhbHVlWzFdKS50by5iZS5lcWwoJ3dhbnRlZCBiOyBnb3QgYycpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0FhbmRCLnZhbHVlWzJdLnJlc3QoKSkudG8uYmUuZXFsKCdjZCcpO1xuICAgIH0pO1xuXG4gICAgaXQoJ3dpbGwgZmFpbCBpZiB0aGUgaW5wdXQgaXMgdG9vIHNob3J0JywgKCkgPT4ge1xuICAgICAgICBleHBlY3QocGFyc2VyQWFuZEIucnVuKHRleHQoJ2EnKSkuaXNGYWlsdXJlKS50by5iZS50cnVlO1xuICAgICAgICBleHBlY3QocGFyc2VyQWFuZEIucnVuKHRleHQoJ2FiJykpLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcbiAgICB9KTtcbn0pO1xuXG5kZXNjcmliZSgndHdvIHBhcnNlcnMgYm91bmQgYnkgb3JFbHNlJywgKCkgPT4ge1xuICAgIGNvbnN0IHBhcnNlckFvckIgPSBvckVsc2UocGNoYXIoJ2EnKSwgcGNoYXIoJ2InKSk7XG5cbiAgICBpdCgnY2FuIHBhcnNlIG9uZSBvZiB0d28gY2hhcnMnLCAoKSA9PiB7XG4gICAgICAgIGV4cGVjdChpc1BhcnNlcihwYXJzZXJBb3JCKSkudG8uYmUudHJ1ZTtcbiAgICAgICAgbGV0IHBhcnNpbmdBb3JCID0gcGFyc2VyQW9yQi5ydW4odGV4dCgnYWJjJykpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0FvckIuaXNTdWNjZXNzKS50by5iZS50cnVlO1xuICAgICAgICBleHBlY3QocGFyc2luZ0FvckIudmFsdWVbMF0pLnRvLmJlLmVxbCgnYScpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0FvckIudmFsdWVbMV0ucmVzdCgpKS50by5iZS5lcWwoJ2JjJyk7XG4gICAgICAgIHBhcnNpbmdBb3JCID0gcGFyc2VyQW9yQi5ydW4odGV4dCgnYmJjJykpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0FvckIuaXNTdWNjZXNzKS50by5iZS50cnVlO1xuICAgICAgICBleHBlY3QocGFyc2luZ0FvckIudmFsdWVbMF0pLnRvLmJlLmVxbCgnYicpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0FvckIudmFsdWVbMV0ucmVzdCgpKS50by5iZS5lcWwoJ2JjJyk7XG4gICAgfSk7XG5cbiAgICBpdCgnY2FuIGFsc28gcGFyc2UgTk9ORSBvZiB0d28gY2hhcnMnLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHBhcnNpbmdBb3JCID0gcGFyc2VyQW9yQi5ydW4odGV4dCgnY2RlJykpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0FvckIuaXNGYWlsdXJlKS50by5iZS50cnVlO1xuICAgICAgICBleHBlY3QocGFyc2luZ0FvckIudmFsdWVbMF0pLnRvLmJlLmVxbCgncGNoYXJfYSBvckVsc2UgcGNoYXJfYicpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0FvckIudmFsdWVbMV0pLnRvLmJlLmVxbCgnd2FudGVkIGI7IGdvdCBjJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQW9yQi52YWx1ZVsyXS5yZXN0KCkpLnRvLmJlLmVxbCgnY2RlJyk7XG4gICAgfSk7XG5cbiAgICBpdCgnd2lsbCBmYWlsIGlmIHRoZSBpbnB1dCBpcyB0b28gc2hvcnQnLCAoKSA9PiB7XG4gICAgICAgIGV4cGVjdChwYXJzZXJBb3JCLnJ1bih0ZXh0KCdhJykpLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNlckFvckIucnVuKHRleHQoJycpKS5pc0ZhaWx1cmUpLnRvLmJlLnRydWU7XG4gICAgfSk7XG59KTtcblxuZGVzY3JpYmUoJ2Egc3VjY2VlZGluZyBwYXJzZXInLCAoKSA9PiB7XG4gIGNvbnN0IHdoYXRldmVyID0gUG9zaXRpb24uZnJvbVRleHQoJ3doYXRldmVyJyk7XG4gIGl0KCdzdWNjZWVkcyBhbHdheXMnLCAoKSA9PiB7XG4gICAgZXhwZWN0KHN1Y2NlZWRQLnJ1bih3aGF0ZXZlcikuaXNTdWNjZXNzKS50by5iZS50cnVlO1xuICAgIGNvbnN0IHBhcnNpbmcgPSBzZXF1ZW5jZVAoW3BjaGFyKCd3JyksIHBjaGFyKCdoJyksIHN1Y2NlZWRQXSkucnVuKHdoYXRldmVyKTtcbiAgICBleHBlY3QocGFyc2luZy50b1N0cmluZygpKS50by5iZS5lcWwoJ1ZhbGlkYXRpb24uU3VjY2VzcyhbW3csaCxdLHJvdz0wO2NvbD0yO3Jlc3Q9YXRldmVyXSknKTtcbiAgfSk7XG4gIGl0KCdkb2VzIG5vdCBjb25zdW1lIGNoYXJhY3RlcnMsIGJ1dCBpdCByZXR1cm5zIGFuIGVtcHR5IHN0cmluZyBhcyByZXN1bHQnLCAoKSA9PiB7XG4gICAgY29uc3QgcGFyc2luZyA9IHNlcXVlbmNlUChbcGNoYXIoJ3cnKSwgc3VjY2VlZFAsIHBjaGFyKCdoJyldKTtcbiAgICBleHBlY3QocGFyc2luZy5ydW4od2hhdGV2ZXIpLnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgnVmFsaWRhdGlvbi5TdWNjZXNzKFtbdywsaF0scm93PTA7Y29sPTI7cmVzdD1hdGV2ZXJdKScpO1xuICB9KTtcbn0pO1xuXG5kZXNjcmliZSgnYSBmYWlsaW5nIHBhcnNlcicsICgpID0+IHtcbiAgaXQoJ3dpbGwgYWx3YXlzIGZhaWwnLCAoKSA9PiB7XG4gICAgZXhwZWN0KGZhaWxQLnJ1bignd2hhdGV2ZXInKS5pc0ZhaWx1cmUpLnRvLmJlLnRydWU7XG4gICAgZXhwZWN0KHNlcXVlbmNlUChbcGNoYXIoJ3cnKSwgZmFpbFBdKS5ydW4oJ3doYXRldmVyJykuaXNGYWlsdXJlKS50by5iZS50cnVlO1xuICB9KTtcbn0pO1xuXG5kZXNjcmliZSgnYSBjaG9pY2Ugb2YgcGFyc2VycyBib3VuZCBieSBvckVsc2UnLCAoKSA9PiB7XG4gICAgY29uc3QgcGFyc2Vyc0Nob2ljZSA9IGNob2ljZShbcGNoYXIoJ2EnKSwgcGNoYXIoJ2InKSwgcGNoYXIoJ2MnKSwgcGNoYXIoJ2QnKSxdKTtcblxuICAgIGl0KCdjYW4gcGFyc2Ugb25lIG9mIGZvdXIgY2hhcnMnLCAoKSA9PiB7XG4gICAgICAgIGV4cGVjdChpc1BhcnNlcihwYXJzZXJzQ2hvaWNlKSkudG8uYmUudHJ1ZTtcbiAgICAgICAgbGV0IHBhcnNpbmdDaG9pY2UgPSBwYXJzZXJzQ2hvaWNlLnJ1bih0ZXh0KCdhJykpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLnZhbHVlWzBdKS50by5iZS5lcWwoJ2EnKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UudmFsdWVbMV0ucmVzdCgpKS50by5iZS5lcWwoJycpO1xuICAgICAgICBwYXJzaW5nQ2hvaWNlID0gcGFyc2Vyc0Nob2ljZS5ydW4odGV4dCgnYicpKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UuaXNTdWNjZXNzKS50by5iZS50cnVlO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS52YWx1ZVswXSkudG8uYmUuZXFsKCdiJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLnZhbHVlWzFdLnJlc3QoKSkudG8uYmUuZXFsKCcnKTtcbiAgICAgICAgcGFyc2luZ0Nob2ljZSA9IHBhcnNlcnNDaG9pY2UucnVuKHRleHQoJ2QnKSk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UudmFsdWVbMF0pLnRvLmJlLmVxbCgnZCcpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS52YWx1ZVsxXS5yZXN0KCkpLnRvLmJlLmVxbCgnJyk7XG4gICAgfSk7XG5cbiAgICBpdCgnY2FuIGFsc28gcGFyc2UgTk9ORSBvZiBmb3VyIGNoYXJzJywgKCkgPT4ge1xuICAgICAgICBjb25zdCBwYXJzaW5nQ2hvaWNlID0gcGFyc2Vyc0Nob2ljZS5ydW4odGV4dCgneCcpKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UuaXNGYWlsdXJlKS50by5iZS50cnVlO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS52YWx1ZVswXSkudG8uYmUuZXFsKCdjaG9pY2UgL3BjaGFyX2EvcGNoYXJfYi9wY2hhcl9jL3BjaGFyX2QnKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UudmFsdWVbMV0pLnRvLmJlLmVxbCgnZmFpbCcpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS52YWx1ZVsyXS5yZXN0KCkpLnRvLmJlLmVxbCgneCcpO1xuICAgIH0pO1xuXG4gICAgaXQoJ3dpbGwgZmFpbCBpZiB0aGUgaW5wdXQgaXMgdG9vIHNob3J0JywgKCkgPT4ge1xuICAgICAgICBleHBlY3QocGFyc2Vyc0Nob2ljZS5ydW4odGV4dCgnYScpKS5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChwYXJzZXJzQ2hvaWNlLnJ1bih0ZXh0KCcnKSkuaXNGYWlsdXJlKS50by5iZS50cnVlO1xuICAgIH0pO1xufSk7XG5cbmRlc2NyaWJlKCdhIHBhcnNlciBmb3IgYW55IG9mIGEgbGlzdCBvZiBjaGFycycsICgpID0+IHtcbiAgICBpdCgnY2FuIHBhcnNlIGFueSBsb3dlcmNhc2UgY2hhcicsICgpID0+IHtcbiAgICAgICAgY29uc3QgbG93ZXJjYXNlc1BhcnNlciA9IGFueU9mKGxvd2VyY2FzZXMpO1xuXG4gICAgICAgIGV4cGVjdChpc1BhcnNlcihsb3dlcmNhc2VzUGFyc2VyKSkudG8uYmUudHJ1ZTtcbiAgICAgICAgbGV0IHBhcnNpbmdDaG9pY2UgPSBsb3dlcmNhc2VzUGFyc2VyLnJ1bih0ZXh0KCdhJykpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLnZhbHVlWzBdKS50by5iZS5lcWwoJ2EnKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UudmFsdWVbMV0ucmVzdCgpKS50by5iZS5lcWwoJycpO1xuICAgICAgICBwYXJzaW5nQ2hvaWNlID0gbG93ZXJjYXNlc1BhcnNlci5ydW4odGV4dCgnYicpKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UuaXNTdWNjZXNzKS50by5iZS50cnVlO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS52YWx1ZVswXSkudG8uYmUuZXFsKCdiJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLnZhbHVlWzFdLnJlc3QoKSkudG8uYmUuZXFsKCcnKTtcbiAgICAgICAgcGFyc2luZ0Nob2ljZSA9IGxvd2VyY2FzZXNQYXJzZXIucnVuKHRleHQoJ2QnKSk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UudmFsdWVbMF0pLnRvLmJlLmVxbCgnZCcpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS52YWx1ZVsxXS5yZXN0KCkpLnRvLmJlLmVxbCgnJyk7XG4gICAgICAgIHBhcnNpbmdDaG9pY2UgPSBsb3dlcmNhc2VzUGFyc2VyLnJ1bih0ZXh0KCd6JykpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLnZhbHVlWzBdKS50by5iZS5lcWwoJ3onKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UudmFsdWVbMV0ucmVzdCgpKS50by5iZS5lcWwoJycpO1xuXG4gICAgICAgIHBhcnNpbmdDaG9pY2UgPSBsb3dlcmNhc2VzUGFyc2VyLnJ1bih0ZXh0KCdZJykpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS5pc0ZhaWx1cmUpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLnZhbHVlWzBdKS50by5iZS5lcWwoJ2FueU9mIGFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6Jyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLnZhbHVlWzFdKS50by5iZS5lcWwoJ2ZhaWwnKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UudmFsdWVbMl0ucmVzdCgpKS50by5iZS5lcWwoJ1knKTtcbiAgICB9KTtcblxuICAgIGl0KCdjYW4gcGFyc2UgYW55IHVwcGVyY2FzZSBjaGFyJywgKCkgPT4ge1xuICAgICAgICBsZXQgdXBwZXJjYXNlc1BhcnNlciA9IGFueU9mKHVwcGVyY2FzZXMpO1xuXG4gICAgICAgIGV4cGVjdChpc1BhcnNlcih1cHBlcmNhc2VzUGFyc2VyKSkudG8uYmUudHJ1ZTtcbiAgICAgICAgbGV0IHBhcnNpbmdDaG9pY2UgPSB1cHBlcmNhc2VzUGFyc2VyLnJ1bih0ZXh0KCdBJykpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLnZhbHVlWzBdKS50by5iZS5lcWwoJ0EnKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UudmFsdWVbMV0ucmVzdCgpKS50by5iZS5lcWwoJycpO1xuICAgICAgICBwYXJzaW5nQ2hvaWNlID0gdXBwZXJjYXNlc1BhcnNlci5ydW4odGV4dCgnQicpKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UuaXNTdWNjZXNzKS50by5iZS50cnVlO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS52YWx1ZVswXSkudG8uYmUuZXFsKCdCJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLnZhbHVlWzFdLnJlc3QoKSkudG8uYmUuZXFsKCcnKTtcbiAgICAgICAgcGFyc2luZ0Nob2ljZSA9IHVwcGVyY2FzZXNQYXJzZXIucnVuKHRleHQoJ1InKSk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UudmFsdWVbMF0pLnRvLmJlLmVxbCgnUicpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS52YWx1ZVsxXS5yZXN0KCkpLnRvLmJlLmVxbCgnJyk7XG4gICAgICAgIHBhcnNpbmdDaG9pY2UgPSB1cHBlcmNhc2VzUGFyc2VyLnJ1bih0ZXh0KCdaJykpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLnZhbHVlWzBdKS50by5iZS5lcWwoJ1onKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UudmFsdWVbMV0ucmVzdCgpKS50by5iZS5lcWwoJycpO1xuXG4gICAgICAgIHBhcnNpbmdDaG9pY2UgPSB1cHBlcmNhc2VzUGFyc2VyLnJ1bih0ZXh0KCdzJykpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS5pc0ZhaWx1cmUpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLnZhbHVlWzBdKS50by5iZS5lcWwoJ2FueU9mIEFCQ0RFRkdISUpLTE1OT1BRUlNUVVZXWFlaJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLnZhbHVlWzFdKS50by5iZS5lcWwoJ2ZhaWwnKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UudmFsdWVbMl0ucmVzdCgpKS50by5iZS5lcWwoJ3MnKTtcbiAgICB9KTtcblxuICAgIGl0KCdjYW4gcGFyc2UgYW55IGRpZ2l0JywgKCkgPT4ge1xuICAgICAgICBsZXQgZGlnaXRzUGFyc2VyID0gYW55T2YoZGlnaXRzKTtcblxuICAgICAgICBleHBlY3QoaXNQYXJzZXIoZGlnaXRzUGFyc2VyKSkudG8uYmUudHJ1ZTtcbiAgICAgICAgbGV0IHBhcnNpbmdDaG9pY2UgPSBkaWdpdHNQYXJzZXIucnVuKHRleHQoJzEnKSk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UudmFsdWVbMF0pLnRvLmJlLmVxbCgnMScpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS52YWx1ZVsxXS5yZXN0KCkpLnRvLmJlLmVxbCgnJyk7XG4gICAgICAgIHBhcnNpbmdDaG9pY2UgPSBkaWdpdHNQYXJzZXIucnVuKHRleHQoJzMnKSk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UudmFsdWVbMF0pLnRvLmJlLmVxbCgnMycpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS52YWx1ZVsxXS5yZXN0KCkpLnRvLmJlLmVxbCgnJyk7XG4gICAgICAgIHBhcnNpbmdDaG9pY2UgPSBkaWdpdHNQYXJzZXIucnVuKHRleHQoJzAnKSk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UudmFsdWVbMF0pLnRvLmJlLmVxbCgnMCcpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS52YWx1ZVsxXS5yZXN0KCkpLnRvLmJlLmVxbCgnJyk7XG4gICAgICAgIHBhcnNpbmdDaG9pY2UgPSBkaWdpdHNQYXJzZXIucnVuKHRleHQoJzgnKSk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UudmFsdWVbMF0pLnRvLmJlLmVxbCgnOCcpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS52YWx1ZVsxXS5yZXN0KCkpLnRvLmJlLmVxbCgnJyk7XG5cbiAgICAgICAgcGFyc2luZ0Nob2ljZSA9IGRpZ2l0c1BhcnNlci5ydW4odGV4dCgncycpKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UuaXNGYWlsdXJlKS50by5iZS50cnVlO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS52YWx1ZVswXSkudG8uYmUuZXFsKCdhbnlPZiAwMTIzNDU2Nzg5Jyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLnZhbHVlWzFdKS50by5iZS5lcWwoJ2ZhaWwnKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UudmFsdWVbMl0ucmVzdCgpKS50by5iZS5lcWwoJ3MnKTtcbiAgICB9KTtcblxuICAgIGl0KCd3aWxsIGZhaWwgaWYgdGhlIGlucHV0IGlzIHRvbyBzaG9ydCcsICgpID0+IHtcbiAgICAgICAgZXhwZWN0KGFueU9mKGxvd2VyY2FzZXMpLnJ1bih0ZXh0KCcnKSkuaXNGYWlsdXJlKS50by5iZS50cnVlO1xuICAgICAgICBleHBlY3QoYW55T2YoZGlnaXRzKS5ydW4odGV4dCgnJykpLmlzRmFpbHVyZSkudG8uYmUudHJ1ZTtcbiAgICB9KTtcbn0pO1xuXG5kZXNjcmliZSgncGFyc2VycyB0aGF0IGNvbnNpZGVyIHByZWNlZGVuY2VzJywgKCkgPT4ge1xuXG4gIGRlc2NyaWJlKCdjYW4gcGFyc2UgWCBwcmVjZWRlZCBieSBZJywgKCkgPT4ge1xuICAgIGNvbnN0IFhhZnRlclkgPSBwcmVjZWRlZEJ5UCgnWScsICdYJyk7XG4gICAgaXQoJ2V2ZW4gaWYgWSBoYXMgYmVlbiBjb25zdW1lZCBieSB0aGUgcGFyc2VyIGJlZm9yZScsICgpID0+IHtcbiAgICAgIGNvbnN0IFlYcCA9IG1hbnkxKGNob2ljZShbcGNoYXIoJ1knKSwgWGFmdGVyWV0pKTtcbiAgICAgIGNvbnN0IHBhcnNpbmdZWCA9IFlYcC5ydW4odGV4dCgnWVgnKSk7XG4gICAgICBleHBlY3QocGFyc2luZ1lYLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcbiAgICAgIGV4cGVjdChwYXJzaW5nWVgudG9TdHJpbmcoKSkudG8uYmUuZXFsKCdWYWxpZGF0aW9uLlN1Y2Nlc3MoW1tZLFhdLHJvdz0xO2NvbD0wO3Jlc3Q9XSknKVxuICAgIH0pO1xuICAgIGl0KCdhbmQgaGFsdCB3aGVuIFggaXMgbm90IHByZWNlZGVkIGJ5IFknLCAoKSA9PiB7XG4gICAgICBjb25zdCBBWHAgPSBtYW55MShjaG9pY2UoW3BjaGFyKCdBJyksIFhhZnRlclldKSk7XG4gICAgICBjb25zdCBwYXJzaW5nQVggPSBBWHAucnVuKHRleHQoJ0FYJykpO1xuICAgICAgZXhwZWN0KHBhcnNpbmdBWC5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgICBleHBlY3QocGFyc2luZ0FYLnZhbHVlWzFdLnJlc3QoKSkudG8uYmUuZXFsKCdYJyk7XG4gICAgfSk7XG4gICAgaXQoJ2FuZCBmYWlsIHdoZW4gWCBpcyBhdCB0aGUgc3RhcnQgb2YgdGhlIHN0cmluZycsICgpID0+IHtcbiAgICAgIGNvbnN0IEFYcCA9IG1hbnkxKGNob2ljZShbcGNoYXIoJ0EnKSwgWGFmdGVyWV0pKTtcbiAgICAgIGNvbnN0IHBhcnNpbmdBWCA9IEFYcC5ydW4odGV4dCgnWEEnKSk7XG4gICAgICBleHBlY3QocGFyc2luZ0FYLmlzRmFpbHVyZSkudG8uYmUudHJ1ZTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgZGVzY3JpYmUoJ2NhbiBwYXJzZSBYIG5vdCBwcmVjZWRlZCBieSBZJywgKCkgPT4ge1xuICAgIGNvbnN0IFhub3RBZnRlclkgPSBub3RQcmVjZWRlZEJ5UCgnWScsICdYJyk7XG5cbiAgICBpdCgnZXZlbiBpZiB0aGUgcHJldmlvdXMgY2hhciBoYXMgYmVlbiBjb25zdW1lZCBieSB0aGUgcGFyc2VyIGJlZm9yZScsICgpID0+IHtcbiAgICAgIGNvbnN0IEFYcCA9IG1hbnkxKGNob2ljZShbcGNoYXIoJ0EnKSwgWG5vdEFmdGVyWV0pKTtcbiAgICAgIGNvbnN0IHBhcnNpbmdBWCA9IEFYcC5ydW4odGV4dCgnQVgnKSk7XG4gICAgICBleHBlY3QocGFyc2luZ0FYLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcbiAgICAgIGV4cGVjdChwYXJzaW5nQVgudG9TdHJpbmcoKSkudG8uYmUuZXFsKCdWYWxpZGF0aW9uLlN1Y2Nlc3MoW1tBLFhdLHJvdz0xO2NvbD0wO3Jlc3Q9XSknKVxuICAgIH0pO1xuICAgIGl0KCdhbmQgaGFsdCB3aGVuIFggaXMgdGhlIGZpcnN0IGNoYXIgaW4gdGhlIHN0cmluZycsICgpID0+IHtcbiAgICAgIGNvbnN0IEFYcCA9IG1hbnkxKGNob2ljZShbcGNoYXIoJ0EnKSwgWG5vdEFmdGVyWV0pKTtcbiAgICAgIGNvbnN0IHBhcnNpbmdBWCA9IEFYcC5ydW4odGV4dCgnWEEnKSk7XG4gICAgICBleHBlY3QocGFyc2luZ0FYLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcbiAgICAgIGV4cGVjdChwYXJzaW5nQVgudG9TdHJpbmcoKSkudG8uYmUuZXFsKCdWYWxpZGF0aW9uLlN1Y2Nlc3MoW1tYLEFdLHJvdz0xO2NvbD0wO3Jlc3Q9XSknKVxuICAgIH0pO1xuICAgIGl0KCdhbmQgaGFsdCB3aGVuIFggaXMgcHJlY2VkZWQgYnkgWScsICgpID0+IHtcbiAgICAgIGNvbnN0IFlYcCA9IG1hbnkxKGNob2ljZShbcGNoYXIoJ1knKSwgWG5vdEFmdGVyWV0pKTtcbiAgICAgIGNvbnN0IHBhcnNpbmdZWCA9IFlYcC5ydW4odGV4dCgnWVgnKSk7XG4gICAgICBleHBlY3QocGFyc2luZ1lYLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcbiAgICAgIGV4cGVjdChwYXJzaW5nWVgudmFsdWVbMV0ucmVzdCgpKS50by5iZS5lcWwoJ1gnKTtcbiAgICB9KTtcbiAgfSk7XG59KTtcblxuZGVzY3JpYmUoJ2EgcGFyc2VyIGZvciBhYmMnLCAoKSA9PiB7XG4gICAgaXQoJ3BhcnNlcyBhYmMnLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHBhaXJBZGRlciA9IChbeCwgeV0pID0+IHggKyB5O1xuICAgICAgICBjb25zdCBhYmNQID0gYW5kVGhlbihcbiAgICAgICAgICAgIHBjaGFyKCdhJyksXG4gICAgICAgICAgICBhbmRUaGVuKFxuICAgICAgICAgICAgICAgIHBjaGFyKCdiJyksXG4gICAgICAgICAgICAgICAgYW5kVGhlbihcbiAgICAgICAgICAgICAgICAgICAgcGNoYXIoJ2MnKSxcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuUCgnJylcbiAgICAgICAgICAgICAgICApLmZtYXAocGFpckFkZGVyKVxuICAgICAgICAgICAgKS5mbWFwKHBhaXJBZGRlcilcbiAgICAgICAgKS5mbWFwKHBhaXJBZGRlcik7XG4gICAgICAgIGNvbnN0IHBhcnNpbmcgPSBhYmNQLnJ1bignYWJjZCcpO1xuICAgICAgICBleHBlY3QocGFyc2luZy5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLnZhbHVlWzBdLnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgnYWJjJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLnZhbHVlWzFdLnJlc3QoKSkudG8uYmUuZXFsKCdkJyk7XG4gICAgfSk7XG59KTtcblxuZGVzY3JpYmUoJ3BhcnNlIDMgZGlnaXRzJywgKCkgPT4ge1xuICAgIGxldCBwYXJzZURpZ2l0LCB0aHJlZURpZ2l0cywgcGFyc2luZztcblxuICAgIGJlZm9yZSgoKSA9PiB7XG4gICAgICAgIHBhcnNlRGlnaXQgPSBhbnlPZihkaWdpdHMpO1xuICAgICAgICB0aHJlZURpZ2l0cyA9IGFuZFRoZW4ocGFyc2VEaWdpdCwgYW5kVGhlbihwYXJzZURpZ2l0LCBwYXJzZURpZ2l0KSk7XG4gICAgICAgIHBhcnNpbmcgPSB0aHJlZURpZ2l0cy5ydW4oJzEyMycpO1xuICAgIH0pO1xuICAgIGl0KCdwYXJzZXMgYW55IG9mIHRocmVlIGRpZ2l0cycsICgpID0+IHtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcuaXNTdWNjZXNzKS50by5iZS50cnVlO1xuICAgICAgICBleHBlY3QocGFyc2luZy52YWx1ZVswXS50b1N0cmluZygpKS50by5iZS5lcWwoJ1sxLFsyLDNdXScpO1xuICAgICAgICBleHBlY3QocGFyc2luZy52YWx1ZVsxXS5yZXN0KCkpLnRvLmJlLmVxbCgnJyk7XG4gICAgfSk7XG4gICAgZGVzY3JpYmUoJ3BhcnNlcyBhbnkgb2YgdGhyZWUgZGlnaXRzIHdoaWxlIHNob3djYXNpbmcgZm1hcCcsICgpID0+IHtcbiAgICAgICAgY29uc3QgdW5wYWNrZXIgPSAoW3gsIFt5LCB6XV0pID0+IHtcbiAgICAgICAgICAgIHJldHVybiBbeCwgeSwgel07XG4gICAgICAgIH07XG4gICAgICAgIGl0KCdhcyBnbG9iYWwgbWV0aG9kJywgKCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgdGhyZWVEaWdpdHNJbXBsID0gZm1hcCh1bnBhY2tlciwgdGhyZWVEaWdpdHMpO1xuICAgICAgICAgICAgbGV0IHBhcnNpbmcgPSB0aHJlZURpZ2l0c0ltcGwucnVuKCcxMjMnKTtcbiAgICAgICAgICAgIGV4cGVjdChwYXJzaW5nLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcbiAgICAgICAgICAgIGV4cGVjdChwYXJzaW5nLnZhbHVlWzBdLnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgnWzEsMiwzXScpO1xuICAgICAgICAgICAgZXhwZWN0KHBhcnNpbmcudmFsdWVbMV0ucmVzdCgpKS50by5iZS5lcWwoJycpO1xuICAgICAgICB9KTtcbiAgICAgICAgaXQoJ2FzIGluc3RhbmNlIG1ldGhvZCcsICgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHRocmVlRGlnaXRzSW5zdCA9IHRocmVlRGlnaXRzLmZtYXAodW5wYWNrZXIpO1xuICAgICAgICAgICAgbGV0IHBhcnNpbmcgPSB0aHJlZURpZ2l0c0luc3QucnVuKCcxMjMnKTtcbiAgICAgICAgICAgIGV4cGVjdChwYXJzaW5nLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcbiAgICAgICAgICAgIGV4cGVjdChwYXJzaW5nLnZhbHVlWzBdLnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgnWzEsMiwzXScpO1xuICAgICAgICAgICAgZXhwZWN0KHBhcnNpbmcudmFsdWVbMV0ucmVzdCgpKS50by5iZS5lcWwoJycpO1xuICAgICAgICB9KTtcbiAgICB9KTtcbn0pO1xuXG5kZXNjcmliZSgnbGlmdDIgZm9yIHBhcnNlcnMnLCAoKSA9PiB7XG4gICAgaXQoJ29wZXJhdGVzIG9uIHRoZSByZXN1bHRzIG9mIHR3byBzdHJpbmcgcGFyc2luZ3MnLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IGFkZFN0cmluZ3MgPSB4ID0+IHkgPT4geCArICcrJyArIHk7XG4gICAgICAgIGNvbnN0IEFwbHVzQiA9IGxpZnQyKGFkZFN0cmluZ3MpKHBjaGFyKCdhJykpKHBjaGFyKCdiJykpO1xuICAgICAgICBleHBlY3QoQXBsdXNCLnJ1bignYWJjJykudG9TdHJpbmcoKSkudG8uYmUuZXFsKCdWYWxpZGF0aW9uLlN1Y2Nlc3MoW2ErYixyb3c9MDtjb2w9MjtyZXN0PWNdKScpO1xuICAgIH0pO1xuICAgIGl0KCdhZGRzIHRoZSByZXN1bHRzIG9mIHR3byBkaWdpdCBwYXJzaW5ncycsICgpID0+IHtcbiAgICAgICAgY29uc3QgYWRkRGlnaXRzID0geCA9PiB5ID0+IHggKyB5O1xuICAgICAgICBjb25zdCBhZGRQYXJzZXIgPSBsaWZ0MihhZGREaWdpdHMpKHBkaWdpdCgxKSkocGRpZ2l0KDIpKTtcbiAgICAgICAgZXhwZWN0KGFkZFBhcnNlci5ydW4oJzEyMzQnKS50b1N0cmluZygpKS50by5iZS5lcWwoJ1ZhbGlkYXRpb24uU3VjY2VzcyhbMyxyb3c9MDtjb2w9MjtyZXN0PTM0XSknKTtcbiAgICAgICAgZXhwZWN0KGFkZFBhcnNlci5ydW4oJzE0NCcpLmlzRmFpbHVyZSkudG8uYmUudHJ1ZTtcbiAgICB9KTtcbn0pO1xuXG5kZXNjcmliZSgnc2VxdWVuY2VzIG9mIHBhcnNlcnMgYmFzZWQgb24gYW5kVGhlbiAmJiBmbWFwIChha2Egc2VxdWVuY2VQMiknLCAoKSA9PiB7XG4gICAgaXQoJ3N0b3JlIG1hdGNoZWQgY2hhcnMgaW5zaWRlIGEgcGxhaW4gc3RyaW5nJywgKCkgPT4ge1xuICAgICAgICBjb25zdCBhYmNQYXJzZXIgPSBzZXF1ZW5jZVAyKFtwY2hhcignYScpLCBwY2hhcignYicpLCBwY2hhcignYycpLF0pO1xuICAgICAgICBleHBlY3QoYWJjUGFyc2VyLnJ1bignYWJjJykudG9TdHJpbmcoKSlcbiAgICAgICAgICAgIC50by5iZS5lcWwoJ1ZhbGlkYXRpb24uU3VjY2VzcyhbYWJjLHJvdz0xO2NvbD0wO3Jlc3Q9XSknKTtcbiAgICB9KTtcbn0pO1xuXG5kZXNjcmliZSgnc2VxdWVuY2VzIG9mIHBhcnNlcnMgYmFzZWQgb24gbGlmdDIoY29ucykgKGFrYSBzZXF1ZW5jZVApJywgKCkgPT4ge1xuICAgIGl0KCdzdG9yZXMgbWF0Y2hlZCBjaGFycyBpbnNpZGUgYW4gYXJyYXknLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IGFiY1BhcnNlciA9IHNlcXVlbmNlUChbcGNoYXIoJ2EnKSwgcGNoYXIoJ2InKSwgcGNoYXIoJ2MnKSxdKTtcbiAgICAgICAgZXhwZWN0KGFiY1BhcnNlci5ydW4oJ2FiYycpLnRvU3RyaW5nKCkpXG4gICAgICAgICAgICAudG8uYmUuZXFsKCdWYWxpZGF0aW9uLlN1Y2Nlc3MoW1thLGIsY10scm93PTE7Y29sPTA7cmVzdD1dKScpO1xuICAgIH0pO1xufSk7XG5cbmRlc2NyaWJlKCdhIHBhcnNlciBmb3IgYSBzcGVjaWZpYyBzZXF1ZW5jZSBvZiBjaGFycycsICgpID0+IHtcbiAgICBpdCgnaXMgZWFzeSB0byBjcmVhdGUgd2l0aCBzZXF1ZW5jZVAnLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IG1hcmNvUGFyc2VyID0gcHN0cmluZygnbWFyY28nKTtcbiAgICAgICAgY29uc3QgbWFyY29QYXJzaW5nID0gbWFyY29QYXJzZXIucnVuKCdtYXJjb2NpYW8nKTtcbiAgICAgICAgZXhwZWN0KG1hcmNvUGFyc2luZy5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChtYXJjb1BhcnNpbmcudG9TdHJpbmcoKSlcbiAgICAgICAgICAgIC50by5iZS5lcWwoJ1ZhbGlkYXRpb24uU3VjY2VzcyhbW20sYSxyLGMsb10scm93PTA7Y29sPTU7cmVzdD1jaWFvXSknKTtcbiAgICB9KTtcbiAgICBpdCgnaGFzIGEgdmVyc2lvbiB0aGF0IHJldHVybnMgc3RyaW5ncycsICgpID0+IHtcbiAgICAgICAgY29uc3QgbWFyY29QYXJzZXIgPSBzdHJpbmdQKCdtYXJjbycpO1xuICAgICAgICBjb25zdCBtYXJjb1BhcnNpbmcgPSBtYXJjb1BhcnNlci5ydW4oJ21hcmNvY2lhbycpO1xuICAgICAgICBleHBlY3QobWFyY29QYXJzaW5nLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KG1hcmNvUGFyc2luZy50b1N0cmluZygpKVxuICAgICAgICAgICAgLnRvLmJlLmVxbCgnVmFsaWRhdGlvbi5TdWNjZXNzKFttYXJjbyxyb3c9MDtjb2w9NTtyZXN0PWNpYW9dKScpO1xuICAgIH0pO1xufSk7XG5cbmRlc2NyaWJlKCdhIHRyaW1tZXIgb2YgcGFyc2VycycsICgpID0+IHtcbiAgICBpdCgnY2FuIGlnbm9yZSB3aGl0ZXNwYWNlcyBhcm91bmQgYSBzaW5nbGUgY2hhcicsICgpID0+IHtcbiAgICAgICAgY29uc3QgdHJpbW1lciA9IHRyaW1QKHBjaGFyKCdhJykpO1xuICAgICAgICBleHBlY3QodHJpbW1lci5ydW4oJyAgYSAgICAnKS50b1N0cmluZygpKVxuICAgICAgICAgICAgLnRvLmJlLmVxbCgnVmFsaWRhdGlvbi5TdWNjZXNzKFthLHJvdz0xO2NvbD0wO3Jlc3Q9XSknKTtcbiAgICB9KTtcbiAgICBpdCgnY2FuIGlnbm9yZSB3aGl0ZXNwYWNlcyBhcm91bmQgYSBzZXF1ZW5jZSBvZiB0d28gY2hhcnMnLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHRyaW1tZXIgPSB0cmltUChwY2hhcignYScpLmFuZFRoZW4ocGNoYXIoJ2InKSkpO1xuICAgICAgICBleHBlY3QodHJpbW1lci5ydW4oJyAgYWIgICAgJykudG9TdHJpbmcoKSlcbiAgICAgICAgICAgIC50by5iZS5lcWwoJ1ZhbGlkYXRpb24uU3VjY2VzcyhbW2EsYl0scm93PTE7Y29sPTA7cmVzdD1dKScpO1xuICAgIH0pO1xufSk7XG5cbmRlc2NyaWJlKCdhIHBhcnNlciBmb3IgYSBzcGVjaWZpYyB3b3JkJywgKCkgPT4ge1xuICAgIGl0KCdkZXRlY3RzIGFuZCBpZ25vcmVzIHdoaXRlc3BhY2VzIGFyb3VuZCBpdCcsICgpID0+IHtcbiAgICAgICAgY29uc3QgbWFyY29QYXJzZXIgPSBwd29yZCgnbWFyY28nKTtcbiAgICAgICAgY29uc3QgbWFyY29QYXJzaW5nID0gbWFyY29QYXJzZXIucnVuKCcgIG1hcmNvIGNpYW8nKTtcbiAgICAgICAgZXhwZWN0KG1hcmNvUGFyc2luZy5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChtYXJjb1BhcnNpbmcudG9TdHJpbmcoKSlcbiAgICAgICAgICAgIC50by5iZS5lcWwoJ1ZhbGlkYXRpb24uU3VjY2VzcyhbW20sYSxyLGMsb10scm93PTA7Y29sPTg7cmVzdD1jaWFvXSknKTtcbiAgICB9KTtcbiAgICBpdCgnaGFzIG5vIHByb2JsZW0gaWYgdGhlIHdoaXRlc3BhY2VzIGFyZW5cXCd0IHRoZXJlJywgKCkgPT4ge1xuICAgICAgICBjb25zdCBtYXJjb1BhcnNlciA9IHB3b3JkKCdtYXJjbycpO1xuICAgICAgICBjb25zdCBtYXJjb1BhcnNpbmcgPSBtYXJjb1BhcnNlci5ydW4oJ21hcmNvY2lhbycpO1xuICAgICAgICBleHBlY3QobWFyY29QYXJzaW5nLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KG1hcmNvUGFyc2luZy50b1N0cmluZygpKVxuICAgICAgICAgICAgLnRvLmJlLmVxbCgnVmFsaWRhdGlvbi5TdWNjZXNzKFtbbSxhLHIsYyxvXSxyb3c9MDtjb2w9NTtyZXN0PWNpYW9dKScpO1xuICAgIH0pO1xufSk7XG5cbmRlc2NyaWJlKCdhIHBhcnNpbmcgZnVuY3Rpb24gZm9yIHplcm8gb3IgbW9yZSBvY2N1cnJlbmNlcycsICgpID0+IHtcbiAgICBpdCgnY2FuIHBhcnNlIGEgY2hhciB6ZXJvIHRpbWVzJywgKCkgPT4ge1xuICAgICAgICBjb25zdCB6ZXJvT3JNb3JlUGFyc2luZ0Z1bmN0aW9uID0gemVyb09yTW9yZShwY2hhcignbScpKTtcbiAgICAgICAgbGV0IHBhcnNpbmcgPSB6ZXJvT3JNb3JlUGFyc2luZ0Z1bmN0aW9uKHRleHQoJ2FyY28nKSk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcudG9TdHJpbmcoKSkudG8uYmUuZXFsKCdWYWxpZGF0aW9uLlN1Y2Nlc3MoW1tdLHJvdz0wO2NvbD0wO3Jlc3Q9YXJjb10pJyk7XG4gICAgfSk7XG4gICAgaXQoJ2NhbiBwYXJzZSBhIGNoYXIgbWFueSB0aW1lcycsICgpID0+IHtcbiAgICAgICAgY29uc3QgemVyb09yTW9yZVBhcnNpbmdGdW5jdGlvbiA9IHplcm9Pck1vcmUocGNoYXIoJ20nKSk7XG4gICAgICAgIGxldCBwYXJzaW5nID0gemVyb09yTW9yZVBhcnNpbmdGdW5jdGlvbih0ZXh0KCdtbW1hcmNvJykpO1xuICAgICAgICBleHBlY3QocGFyc2luZy5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgnVmFsaWRhdGlvbi5TdWNjZXNzKFtbbSxtLG1dLHJvdz0wO2NvbD0zO3Jlc3Q9YXJjb10pJyk7XG4gICAgfSk7XG4gICAgaXQoJ2NhbiBwYXJzZSBhIGNoYXIgc2VxdWVuY2UgemVybyB0aW1lcycsICgpID0+IHtcbiAgICAgICAgY29uc3QgemVyb09yTW9yZVBhcnNpbmdGdW5jdGlvbiA9IHplcm9Pck1vcmUocHN0cmluZygnbWFyY28nKSk7XG4gICAgICAgIGxldCBwYXJzaW5nID0gemVyb09yTW9yZVBhcnNpbmdGdW5jdGlvbih0ZXh0KCd4bWFyY29tYXJjb2NpYW8nKSk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcudG9TdHJpbmcoKSkudG8uYmUuZXFsKCdWYWxpZGF0aW9uLlN1Y2Nlc3MoW1tdLHJvdz0wO2NvbD0wO3Jlc3Q9eG1hcmNvbWFyY29jaWFvXSknKTtcbiAgICB9KTtcbiAgICBpdCgnY2FuIHBhcnNlIGEgY2hhciBzZXF1ZW5jZSBtYW55IHRpbWVzJywgKCkgPT4ge1xuICAgICAgICBjb25zdCB6ZXJvT3JNb3JlUGFyc2luZ0Z1bmN0aW9uID0gemVyb09yTW9yZShwc3RyaW5nKCdtYXJjbycpKTtcbiAgICAgICAgbGV0IHBhcnNpbmcgPSB6ZXJvT3JNb3JlUGFyc2luZ0Z1bmN0aW9uKHRleHQoJ21hcmNvbWFyY29jaWFvJykpO1xuICAgICAgICBleHBlY3QocGFyc2luZy5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLnRvU3RyaW5nKCkpXG4gICAgICAgICAgICAudG8uYmUuZXFsKCdWYWxpZGF0aW9uLlN1Y2Nlc3MoW1tbbSxhLHIsYyxvXSxbbSxhLHIsYyxvXV0scm93PTA7Y29sPTEwO3Jlc3Q9Y2lhb10pJyk7XG4gICAgfSk7XG59KTtcblxuZGVzY3JpYmUoJ2EgcGFyc2VyIGZvciB6ZXJvIG9yIG1vcmUgb2NjdXJyZW5jZXMnLCAoKSA9PiB7XG4gICAgaXQoJ2NhbiBwYXJzZSBhIGNoYXIgemVybyB0aW1lcycsICgpID0+IHtcbiAgICAgICAgY29uc3QgemVyb09yTW9yZVBhcnNlciA9IG1hbnkocGNoYXIoJ20nKSk7XG4gICAgICAgIGxldCBwYXJzaW5nID0gemVyb09yTW9yZVBhcnNlci5ydW4odGV4dCgnYXJjbycpKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcuaXNTdWNjZXNzKS50by5iZS50cnVlO1xuICAgICAgICBleHBlY3QocGFyc2luZy50b1N0cmluZygpKS50by5iZS5lcWwoJ1ZhbGlkYXRpb24uU3VjY2VzcyhbW10scm93PTA7Y29sPTA7cmVzdD1hcmNvXSknKTtcbiAgICB9KTtcbiAgICBpdCgnY2FuIHBhcnNlIGEgY2hhciBtYW55IHRpbWVzIGFuZCByZXR1cm4gYW4gYXJyYXknLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHplcm9Pck1vcmVQYXJzZXIgPSBtYW55KHBjaGFyKCdtJykpO1xuICAgICAgICBsZXQgcGFyc2luZyA9IHplcm9Pck1vcmVQYXJzZXIucnVuKHRleHQoJ21tbWFyY28nKSk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcudG9TdHJpbmcoKSkudG8uYmUuZXFsKCdWYWxpZGF0aW9uLlN1Y2Nlc3MoW1ttLG0sbV0scm93PTA7Y29sPTM7cmVzdD1hcmNvXSknKTtcbiAgICB9KTtcbiAgICBpdCgnY2FuIHBhcnNlIGEgY2hhciBleGFjdGx5IG4gdGltZXMgYW5kIHJldHVybiBhbiBhcnJheSAob3IgZmFpbCknLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IGV4YWN0bHlUaHJlZSA9IG1hbnkocGNoYXIoJ20nKSwgMyk7XG4gICAgICAgIGxldCBwYXJzaW5nID0gZXhhY3RseVRocmVlLnJ1bih0ZXh0KCdtbW1hcmNvJykpO1xuICAgICAgICBleHBlY3QocGFyc2luZy5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgnVmFsaWRhdGlvbi5TdWNjZXNzKFtbbSxtLG1dLHJvdz0wO2NvbD0zO3Jlc3Q9YXJjb10pJyk7XG4gICAgICAgIHBhcnNpbmcgPSBleGFjdGx5VGhyZWUucnVuKHRleHQoJ21tbW1hcmNvJykpO1xuICAgICAgICBleHBlY3QocGFyc2luZy5pc0ZhaWx1cmUpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgnVmFsaWRhdGlvbi5GYWlsdXJlKFttYW55IHBjaGFyX20gdGltZXM9Myx0aW1lcyBwYXJhbSB3YW50ZWQgMzsgZ290IDQscm93PTA7Y29sPTA7cmVzdD1tbW1tYXJjb10pJyk7XG4gICAgfSk7XG4gICAgaXQoJ2NhbiBwYXJzZSBhIGNoYXIgbWFueSB0aW1lcyBhbmQgcmV0dXJuIGEgc3RyaW5nJywgKCkgPT4ge1xuICAgICAgICBjb25zdCB6ZXJvT3JNb3JlUGFyc2VyID0gbWFueUNoYXJzKHBjaGFyKCdtJykpO1xuICAgICAgICBsZXQgcGFyc2luZyA9IHplcm9Pck1vcmVQYXJzZXIucnVuKHRleHQoJ21tbWFyY28nKSk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcudG9TdHJpbmcoKSkudG8uYmUuZXFsKCdWYWxpZGF0aW9uLlN1Y2Nlc3MoW21tbSxyb3c9MDtjb2w9MztyZXN0PWFyY29dKScpO1xuICAgIH0pO1xuICAgIGl0KCdjYW4gcGFyc2UgYSBjaGFyIGV4YWN0bHkgbiB0aW1lcyBhbmQgcmV0dXJuIGEgc3RyaW5nIChvciBmYWlsKScsICgpID0+IHtcbiAgICAgICAgY29uc3QgZXhhY3RseVRocmVlID0gbWFueUNoYXJzKHBjaGFyKCdtJyksIDMpO1xuICAgICAgICBsZXQgcGFyc2luZyA9IGV4YWN0bHlUaHJlZS5ydW4odGV4dCgnbW1tYXJjbycpKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcuaXNTdWNjZXNzKS50by5iZS50cnVlO1xuICAgICAgICBleHBlY3QocGFyc2luZy50b1N0cmluZygpKS50by5iZS5lcWwoJ1ZhbGlkYXRpb24uU3VjY2VzcyhbbW1tLHJvdz0wO2NvbD0zO3Jlc3Q9YXJjb10pJyk7XG4gICAgICAgIHBhcnNpbmcgPSBleGFjdGx5VGhyZWUucnVuKHRleHQoJ21tbW1hcmNvJykpO1xuICAgICAgICBleHBlY3QocGFyc2luZy5pc0ZhaWx1cmUpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgnVmFsaWRhdGlvbi5GYWlsdXJlKFttYW55Q2hhcnMgcGNoYXJfbSB0aW1lcz0zLHRpbWVzIHBhcmFtIHdhbnRlZCAzOyBnb3QgNCxyb3c9MDtjb2w9MDtyZXN0PW1tbW1hcmNvXSknKTtcbiAgICB9KTtcbiAgICBpdCgnY2FuIHBhcnNlIGEgY2hhciBzZXF1ZW5jZSB6ZXJvIHRpbWVzJywgKCkgPT4ge1xuICAgICAgICBjb25zdCB6ZXJvT3JNb3JlUGFyc2VyID0gbWFueShwc3RyaW5nKCdtYXJjbycpKTtcbiAgICAgICAgbGV0IHBhcnNpbmcgPSB6ZXJvT3JNb3JlUGFyc2VyLnJ1bih0ZXh0KCd4bWFyY29tYXJjb2NpYW8nKSk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcudG9TdHJpbmcoKSkudG8uYmUuZXFsKCdWYWxpZGF0aW9uLlN1Y2Nlc3MoW1tdLHJvdz0wO2NvbD0wO3Jlc3Q9eG1hcmNvbWFyY29jaWFvXSknKTtcbiAgICB9KTtcbiAgICBpdCgnY2FuIHBhcnNlIGEgY2hhciBzZXF1ZW5jZSBtYW55IHRpbWVzJywgKCkgPT4ge1xuICAgICAgICBjb25zdCB6ZXJvT3JNb3JlUGFyc2VyID0gbWFueShwc3RyaW5nKCdtYXJjbycpKTtcbiAgICAgICAgbGV0IHBhcnNpbmcgPSB6ZXJvT3JNb3JlUGFyc2VyLnJ1bignbWFyY29tYXJjb2NpYW8nKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcuaXNTdWNjZXNzKS50by5iZS50cnVlO1xuICAgICAgICBleHBlY3QocGFyc2luZy50b1N0cmluZygpKVxuICAgICAgICAgICAgLnRvLmJlLmVxbCgnVmFsaWRhdGlvbi5TdWNjZXNzKFtbW20sYSxyLGMsb10sW20sYSxyLGMsb11dLHJvdz0wO2NvbD0xMDtyZXN0PWNpYW9dKScpO1xuICAgIH0pO1xuICAgIGl0KCdjYW4gcGFyc2Ugd2hpdGVzcGFjZXMhIScsICgpID0+IHtcbiAgICAgICAgY29uc3Qgd2hpdGVzUGFyc2VyID0gbWFueShhbnlPZih3aGl0ZXMpKTtcbiAgICAgICAgY29uc3QgdHdvV29yZHMgPSBzZXF1ZW5jZVAoW3BzdHJpbmcoJ2NpYW8nKSwgd2hpdGVzUGFyc2VyLCBwc3RyaW5nKCdtYW1tYScpXSk7XG4gICAgICAgIGxldCBwYXJzaW5nID0gdHdvV29yZHMucnVuKCdjaWFvbWFtbWFYJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLnRvU3RyaW5nKCkpXG4gICAgICAgICAgICAudG8uYmUuZXFsKCdWYWxpZGF0aW9uLlN1Y2Nlc3MoW1tbYyxpLGEsb10sW10sW20sYSxtLG0sYV1dLHJvdz0wO2NvbD05O3Jlc3Q9WF0pJyk7XG4gICAgICAgIHBhcnNpbmcgPSB0d29Xb3Jkcy5ydW4oJ2NpYW8gbWFtbWFYJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLnRvU3RyaW5nKCkpXG4gICAgICAgICAgICAudG8uYmUuZXFsKCdWYWxpZGF0aW9uLlN1Y2Nlc3MoW1tbYyxpLGEsb10sWyBdLFttLGEsbSxtLGFdXSxyb3c9MDtjb2w9MTA7cmVzdD1YXSknKTtcbiAgICAgICAgcGFyc2luZyA9IHR3b1dvcmRzLnJ1bignY2lhbyAgIG1hbW1hWCcpO1xuICAgICAgICBleHBlY3QocGFyc2luZy50b1N0cmluZygpKVxuICAgICAgICAgICAgLnRvLmJlLmVxbCgnVmFsaWRhdGlvbi5TdWNjZXNzKFtbW2MsaSxhLG9dLFsgLCAsIF0sW20sYSxtLG0sYV1dLHJvdz0wO2NvbD0xMjtyZXN0PVhdKScpO1xuICAgICAgICBwYXJzaW5nID0gdHdvV29yZHMucnVuKCdjaWFvIFxcdCBtYW1tYVgnKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcudG9TdHJpbmcoKSlcbiAgICAgICAgICAgIC50by5iZS5lcWwoJ1ZhbGlkYXRpb24uU3VjY2VzcyhbW1tjLGksYSxvXSxbICxcXHQsIF0sW20sYSxtLG0sYV1dLHJvdz0wO2NvbD0xMjtyZXN0PVhdKScpO1xuICAgIH0pO1xufSk7XG5cbmRlc2NyaWJlKCdhIHBhcnNlciBmb3Igb25lIG9yIG1vcmUgb2NjdXJyZW5jZXMnLCAoKSA9PiB7XG4gICAgaXQoJ2Nhbm5vdCBwYXJzZSBhIGNoYXIgemVybyB0aW1lcycsICgpID0+IHtcbiAgICAgICAgY29uc3Qgb25lT3JNb3JlUGFyc2VyID0gbWFueTEocGNoYXIoJ20nKSk7XG4gICAgICAgIGxldCBwYXJzaW5nID0gb25lT3JNb3JlUGFyc2VyLnJ1bignYXJjbycpO1xuICAgICAgICBleHBlY3QocGFyc2luZy5pc0ZhaWx1cmUpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLnRvU3RyaW5nKCkpXG4gICAgICAgICAgICAudG8uYmUuZXFsKCdWYWxpZGF0aW9uLkZhaWx1cmUoW21hbnkxIHBjaGFyX20sd2FudGVkIG07IGdvdCBhLHJvdz0wO2NvbD0wO3Jlc3Q9YXJjb10pJyk7XG4gICAgfSk7XG4gICAgaXQoJ2NhbiBwYXJzZSBhIGNoYXIgbWFueSB0aW1lcyBhbmQgcmV0dXJuIGFuIGFycmF5JywgKCkgPT4ge1xuICAgICAgICBjb25zdCBvbmVPck1vcmVQYXJzZXIgPSBtYW55MShwY2hhcignbScpKTtcbiAgICAgICAgbGV0IHBhcnNpbmcgPSBvbmVPck1vcmVQYXJzZXIucnVuKCdtbW1hcmNvJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcudG9TdHJpbmcoKSkudG8uYmUuZXFsKCdWYWxpZGF0aW9uLlN1Y2Nlc3MoW1ttLG0sbV0scm93PTA7Y29sPTM7cmVzdD1hcmNvXSknKTtcbiAgICB9KTtcbiAgICBpdCgnY2FuIHBhcnNlIGEgY2hhciBtYW55IHRpbWVzIGFuZCByZXR1cm4gYSBzdHJpbmcnLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IG9uZU9yTW9yZVBhcnNlciA9IG1hbnlDaGFyczEocGNoYXIoJ20nKSk7XG4gICAgICAgIGxldCBwYXJzaW5nID0gb25lT3JNb3JlUGFyc2VyLnJ1bignbW1tYXJjbycpO1xuICAgICAgICBleHBlY3QocGFyc2luZy5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgnVmFsaWRhdGlvbi5TdWNjZXNzKFttbW0scm93PTA7Y29sPTM7cmVzdD1hcmNvXSknKTtcbiAgICB9KTtcbiAgICBpdCgnY2Fubm90IHBhcnNlIGEgY2hhciBzZXF1ZW5jZSB6ZXJvIHRpbWVzJywgKCkgPT4ge1xuICAgICAgICBjb25zdCBvbmVPck1vcmVQYXJzZXIgPSBtYW55MShwc3RyaW5nKCdtYXJjbycpKTtcbiAgICAgICAgbGV0IHBhcnNpbmcgPSBvbmVPck1vcmVQYXJzZXIucnVuKCd4bWFyY29tYXJjb2NpYW8nKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcuaXNGYWlsdXJlKS50by5iZS50cnVlO1xuICAgICAgICBleHBlY3QocGFyc2luZy50b1N0cmluZygpKVxuICAgICAgICAgICAgLnRvLmJlLmVxbCgnVmFsaWRhdGlvbi5GYWlsdXJlKFttYW55MSBwc3RyaW5nIG1hcmNvLHdhbnRlZCBtOyBnb3QgeCxyb3c9MDtjb2w9MDtyZXN0PXhtYXJjb21hcmNvY2lhb10pJyk7XG4gICAgfSk7XG4gICAgaXQoJ2NhbiBwYXJzZSBhIGNoYXIgc2VxdWVuY2UgbWFueSB0aW1lcycsICgpID0+IHtcbiAgICAgICAgY29uc3Qgb25lT3JNb3JlUGFyc2VyID0gbWFueTEocHN0cmluZygnbWFyY28nKSk7XG4gICAgICAgIGxldCBwYXJzaW5nID0gb25lT3JNb3JlUGFyc2VyLnJ1bignbWFyY29tYXJjb2NpYW8nKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcuaXNTdWNjZXNzKS50by5iZS50cnVlO1xuICAgICAgICBleHBlY3QocGFyc2luZy50b1N0cmluZygpKVxuICAgICAgICAgICAgLnRvLmJlLmVxbCgnVmFsaWRhdGlvbi5TdWNjZXNzKFtbW20sYSxyLGMsb10sW20sYSxyLGMsb11dLHJvdz0wO2NvbD0xMDtyZXN0PWNpYW9dKScpO1xuICAgIH0pO1xuICAgIGl0KCdjYW4gcGFyc2UgYW4gaW50ZWdlciwgbm8gbWF0dGVyIGhvdyBsYXJnZS4uLicsICgpID0+IHtcbiAgICAgICAgY29uc3QgcGludCA9IG1hbnkxKGFueU9mKGRpZ2l0cykpO1xuICAgICAgICBsZXQgcGFyc2luZyA9IHBpbnQucnVuKCcxMjM0NUEnKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcuaXNTdWNjZXNzKS50by5iZS50cnVlO1xuICAgICAgICBleHBlY3QocGFyc2luZy50b1N0cmluZygpKS50by5iZS5lcWwoJ1ZhbGlkYXRpb24uU3VjY2VzcyhbWzEsMiwzLDQsNV0scm93PTA7Y29sPTU7cmVzdD1BXSknKTtcbiAgICAgICAgcGFyc2luZyA9IHBpbnQucnVuKCcxQicpO1xuICAgICAgICBleHBlY3QocGFyc2luZy5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgnVmFsaWRhdGlvbi5TdWNjZXNzKFtbMV0scm93PTA7Y29sPTE7cmVzdD1CXSknKTtcbiAgICAgICAgcGFyc2luZyA9IHBpbnQucnVuKCdBMTIzNDUnKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcuaXNGYWlsdXJlKS50by5iZS50cnVlO1xuICAgICAgICBleHBlY3QocGFyc2luZy50b1N0cmluZygpKVxuICAgICAgICAgICAgLnRvLmJlLmVxbCgnVmFsaWRhdGlvbi5GYWlsdXJlKFttYW55MSBhbnlPZiAwMTIzNDU2Nzg5LGZhaWwsQTEyMzQ1XSknKTtcbiAgICB9KTtcbiAgICBpdCgnY2FuIHBhcnNlIGFuIGludGVnZXIgaW50byBhIHRydWUgaW50ZWdlcicsICgpID0+IHtcbiAgICAgICAgY29uc3QgcGludCA9IG1hbnkxKGFueU9mKGRpZ2l0cykpXG4gICAgICAgICAgICAuZm1hcChsID0+IHBhcnNlSW50KGwucmVkdWNlKChhY2MsIGN1cnIpID0+IGFjYyArIGN1cnIsICcnKSwgMTApKTtcbiAgICAgICAgbGV0IHBhcnNpbmcgPSBwaW50LnJ1bignMTIzNDVBJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcudmFsdWVbMF0pLnRvLmJlLmVxbCgxMjM0NSk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLnZhbHVlWzFdLnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgncm93PTA7Y29sPTU7cmVzdD1BJyk7XG4gICAgfSk7XG59KTtcblxuZGVzY3JpYmUoJ2EgcGFyc2VyIGZvciBvcHRpb25hbCBjaGFyYWN0ZXJzJywgKCkgPT4ge1xuICAgIGl0KCdjYW4gY2FwdHVyZSBvciBub3QgY2FwdHVyZSBhIGRvdCcsICgpID0+IHtcbiAgICAgICAgY29uc3Qgb3B0RG90VGhlbkEgPSBvcHQocGNoYXIoJy4nKSkuYW5kVGhlbihwY2hhcignYScpKTtcbiAgICAgICAgZXhwZWN0KG9wdERvdFRoZW5BLnJ1bignLmFiYycpLnRvU3RyaW5nKCkpXG4gICAgICAgICAgICAudG8uYmUuZXFsKCdWYWxpZGF0aW9uLlN1Y2Nlc3MoW1tNYXliZS5KdXN0KC4pLGFdLHJvdz0wO2NvbD0yO3Jlc3Q9YmNdKScpO1xuICAgICAgICBleHBlY3Qob3B0RG90VGhlbkEucnVuKCdhYmMnKS50b1N0cmluZygpKVxuICAgICAgICAgICAgLnRvLmJlLmVxbCgnVmFsaWRhdGlvbi5TdWNjZXNzKFtbTWF5YmUuTm90aGluZyxhXSxyb3c9MDtjb2w9MTtyZXN0PWJjXSknKTtcbiAgICB9KTtcbiAgICBpdCgnY2FuIGNhcHR1cmUgYSBkb3Qgb3IgcHJvdmlkZSBhIGRlZmF1bHQgYWx0ZXJuYXRpdmUnLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IG9wdERvdFdpdGhEZWZhdWx0VGhlbkEgPSBvcHQocGNoYXIoJy4nKSwgJ0FMVEVSTkFUSVZFJykuYW5kVGhlbihwY2hhcignYScpKTtcbiAgICAgICAgZXhwZWN0KG9wdERvdFdpdGhEZWZhdWx0VGhlbkEucnVuKCdhYmMnKS50b1N0cmluZygpKVxuICAgICAgICAgICAgLnRvLmJlLmVxbCgnVmFsaWRhdGlvbi5TdWNjZXNzKFtbTWF5YmUuSnVzdChBTFRFUk5BVElWRSksYV0scm93PTA7Y29sPTE7cmVzdD1iY10pJyk7XG4gICAgfSk7XG4gICAgaXQoJ2NhbiBwYXJzZSBTSUdORUQgaW50ZWdlcnMhISEnLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHBpbnQgPSBtYW55MShhbnlPZihkaWdpdHMpKVxuICAgICAgICAgICAgLmZtYXAobCA9PiBwYXJzZUludChsLnJlZHVjZSgoYWNjLCBjdXJyKSA9PiBhY2MgKyBjdXJyLCAnJyksIDEwKSk7XG4gICAgICAgIGNvbnN0IHBTaWduZWRJbnQgPSBvcHQocGNoYXIoJy0nKSlcbiAgICAgICAgICAgIC5hbmRUaGVuKHBpbnQpXG4gICAgICAgICAgICAuZm1hcChvcHRTaWduTnVtYmVyUGFpciA9PiAob3B0U2lnbk51bWJlclBhaXJbMF0uaXNKdXN0KSA/IC1vcHRTaWduTnVtYmVyUGFpclsxXSA6IG9wdFNpZ25OdW1iZXJQYWlyWzFdKTtcbiAgICAgICAgZXhwZWN0KHBTaWduZWRJbnQucnVuKCcxMzI0MzU0NngnKS52YWx1ZVswXSkudG8uYmUuZXFsKDEzMjQzNTQ2KTtcbiAgICAgICAgZXhwZWN0KHBTaWduZWRJbnQucnVuKCctMTMyNDM1NDZ4JykudmFsdWVbMF0pLnRvLmJlLmVxbCgtMTMyNDM1NDYpO1xuICAgIH0pO1xuICAgIGl0KCdjYW4gY2FwdHVyZSBvciBub3QgY2FwdHVyZSBhIHdob2xlIHN1YnN0cmluZycsICgpID0+IHtcbiAgICAgICAgY29uc3Qgb3B0U3Vic3RyaW5nID0gb3B0KHBzdHJpbmcoJ21hcmNvJykpLmFuZFRoZW4ocHN0cmluZygnZmF1c3RpbmVsbGknKSk7XG4gICAgICAgIGV4cGVjdChvcHRTdWJzdHJpbmcucnVuKCdtYXJjb2ZhdXN0aW5lbGxpeCcpLnRvU3RyaW5nKCkpXG4gICAgICAgICAgICAudG8uYmUuZXFsKCdWYWxpZGF0aW9uLlN1Y2Nlc3MoW1tNYXliZS5KdXN0KFttLGEscixjLG9dKSxbZixhLHUscyx0LGksbixlLGwsbCxpXV0scm93PTA7Y29sPTE2O3Jlc3Q9eF0pJyk7XG4gICAgICAgIGV4cGVjdChvcHRTdWJzdHJpbmcucnVuKCdmYXVzdGluZWxsaXgnKS50b1N0cmluZygpKVxuICAgICAgICAgICAgLnRvLmJlLmVxbCgnVmFsaWRhdGlvbi5TdWNjZXNzKFtbTWF5YmUuTm90aGluZyxbZixhLHUscyx0LGksbixlLGwsbCxpXV0scm93PTA7Y29sPTExO3Jlc3Q9eF0pJyk7XG4gICAgfSk7XG59KTtcblxuZGVzY3JpYmUoJ2EgY291cGxlIG9mIHBhcnNlcnMnLCAoKSA9PiB7XG4gICAgaXQoJ2NhbiBkZWNpZGUgdG8gZGlzY2FyZCB0aGUgbWF0Y2hlcyBvZiB0aGUgZmlyc3Qgb25lJywgKCkgPT4ge1xuICAgICAgICBjb25zdCBkaXNjYXJkSW50ZWdlclNpZ24gPSBwY2hhcignLScpLmRpc2NhcmRGaXJzdChwZGlnaXQoOCkpO1xuICAgICAgICBsZXQgcGFyc2luZyA9IGRpc2NhcmRJbnRlZ2VyU2lnbi5ydW4oJy04eCcpO1xuICAgICAgICBleHBlY3QocGFyc2luZy50b1N0cmluZygpKS50by5iZS5lcWwoJ1ZhbGlkYXRpb24uU3VjY2VzcyhbOCxyb3c9MDtjb2w9MjtyZXN0PXhdKScpO1xuICAgIH0pO1xuICAgIGl0KCdjYW4gZGVjaWRlIHRvIGRpc2NhcmQgdGhlIG1hdGNoZXMgb2YgdGhlIHNlY29uZCBvbmUnLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IGRpc2NhcmRTdWZmaXggPSBwc3RyaW5nKCdtYXJjbycpLmRpc2NhcmRTZWNvbmQobWFueTEoYW55T2Yod2hpdGVzKSkpO1xuICAgICAgICBsZXQgcGFyc2luZyA9IGRpc2NhcmRTdWZmaXgucnVuKCdtYXJjbyBmYXVzdGluZWxsaScpO1xuICAgICAgICBleHBlY3QocGFyc2luZy50b1N0cmluZygpKS50by5iZS5lcWwoJ1ZhbGlkYXRpb24uU3VjY2VzcyhbW20sYSxyLGMsb10scm93PTA7Y29sPTY7cmVzdD1mYXVzdGluZWxsaV0pJyk7XG4gICAgICAgIHBhcnNpbmcgPSBkaXNjYXJkU3VmZml4LnJ1bignbWFyY28gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZhdXN0aW5lbGxpJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgnVmFsaWRhdGlvbi5TdWNjZXNzKFtbbSxhLHIsYyxvXSxyb3c9MDtjb2w9Mzc7cmVzdD1mYXVzdGluZWxsaV0pJyk7XG4gICAgfSk7XG59KTtcblxuZGVzY3JpYmUoJ2EgdGFwcGVyIGZvciBwYXJzZXJzJywgKCkgPT4ge1xuICAgIGl0KCdjYW4gZG8gdGhpbmdzIHdpdGggYSByZXN1bHQgdGhhdFxcJ3MgZ29pbmcgdG8gYmUgZGlzY2FyZGVkJywgKCkgPT4ge1xuICAgICAgICBjb25zdCB0YXBJbnRvRGlzY2FyZEludGVnZXJTaWduID0gdGFwUChwY2hhcignLScpLCByZXMgPT4ge1xuICAgICAgICAgICAgZXhwZWN0KHJlcykudG8uYmUuZXFsKCctJyk7XG4gICAgICAgIH0pLmRpc2NhcmRGaXJzdChwZGlnaXQoOCkpO1xuICAgICAgICBsZXQgcGFyc2luZyA9IHRhcEludG9EaXNjYXJkSW50ZWdlclNpZ24ucnVuKCctOHgnKTtcbiAgICB9KTtcbn0pO1xuXG5kZXNjcmliZSgnYSBsb2dnZXIgZm9yIHBhcnNlcnMnLCAoKSA9PiB7XG4gICAgbGV0IHN0b3JlZExvZyA9IGNvbnNvbGUubG9nO1xuICAgIGl0KCdjYW4gbG9nIGludGVybWVkaWF0ZSBwYXJzaW5nIHJlc3VsdHMnLCAoKSA9PiB7XG4gICAgICAgIGNvbnNvbGUubG9nID0gbXNnID0+IHtcbiAgICAgICAgICAgIGV4cGVjdChtc2cpLnRvLmJlLmVxbCgncGNoYXJfLTotJyk7XG4gICAgICAgIH07XG4gICAgICAgIGNvbnN0IGxvZ0ludGVybWVkaWF0ZVJlc3VsdCA9IGxvZ1AocGNoYXIoJy0nKSlcbiAgICAgICAgICAgIC5kaXNjYXJkRmlyc3QocGRpZ2l0KDgpKTtcbiAgICAgICAgbGV0IHBhcnNpbmcgPSBsb2dJbnRlcm1lZGlhdGVSZXN1bHQucnVuKCctOHgnKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcudG9TdHJpbmcoKSkudG8uYmUuZXFsKCdWYWxpZGF0aW9uLlN1Y2Nlc3MoWzgscm93PTA7Y29sPTI7cmVzdD14XSknKTtcbiAgICB9KTtcbiAgICBpdCgnY2FuIGxvZyBhIHJlc3VsdCB0aGF0XFwncyBnb2luZyB0byBiZSBkaXNjYXJkZWQnLCAoKSA9PiB7XG4gICAgICAgIGNvbnNvbGUubG9nID0gbXNnID0+IHtcbiAgICAgICAgICAgIGV4cGVjdChtc2cpLnRvLmJlLmVxbCgnbWFueTEgYW55T2YgIFxcdFxcblxccjpbICwgXScpO1xuICAgICAgICB9O1xuICAgICAgICBjb25zdCBkaXNjYXJkU3VmZml4ID0gcHN0cmluZygnbWFyY28nKS5kaXNjYXJkU2Vjb25kKGxvZ1AobWFueTEoYW55T2Yod2hpdGVzKSkpKTtcbiAgICAgICAgbGV0IHBhcnNpbmcgPSBkaXNjYXJkU3VmZml4LnJ1bignbWFyY28gIGZhdXN0aW5lbGxpJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgnVmFsaWRhdGlvbi5TdWNjZXNzKFtbbSxhLHIsYyxvXSxyb3c9MDtjb2w9NztyZXN0PWZhdXN0aW5lbGxpXSknKTtcbiAgICB9KTtcbiAgICBjb25zb2xlLmxvZyA9IHN0b3JlZExvZztcbn0pO1xuXG5kZXNjcmliZSgncGFyc2luZyB3aGlsZSBkaXNjYXJkaW5nIGlucHV0JywgKCkgPT4ge1xuICAgIGl0KCdhbGxvd3MgdG8gZXhjbHVkZSBwYXJlbnRoZXNlcycsICgpID0+IHtcbiAgICAgICAgY29uc3QgaW5zaWRlUGFyZW5zID0gcGNoYXIoJygnKVxuICAgICAgICAgICAgLmRpc2NhcmRGaXJzdChtYW55KGFueU9mKGxvd2VyY2FzZXMpKSlcbiAgICAgICAgICAgIC5kaXNjYXJkU2Vjb25kKHBjaGFyKCcpJykpO1xuICAgICAgICBleHBlY3QoaW5zaWRlUGFyZW5zLnJ1bignKG1hcmNvKScpLnRvU3RyaW5nKCkpXG4gICAgICAgICAgICAudG8uYmUuZXFsKCdWYWxpZGF0aW9uLlN1Y2Nlc3MoW1ttLGEscixjLG9dLHJvdz0xO2NvbD0wO3Jlc3Q9XSknKTtcbiAgICAgICAgZXhwZWN0KGluc2lkZVBhcmVucy5ydW4oJygpJykudG9TdHJpbmcoKSlcbiAgICAgICAgICAgIC50by5iZS5lcWwoJ1ZhbGlkYXRpb24uU3VjY2VzcyhbW10scm93PTE7Y29sPTA7cmVzdD1dKScpO1xuICAgIH0pO1xuICAgIGl0KCcuLi5ldmVuIHVzaW5nIGEgdGFpbG9yLW1hZGUgbWV0aG9kJywgKCkgPT4ge1xuICAgICAgICBjb25zdCBpbnNpZGVQYXJlbnMgPSBiZXR3ZWVuUGFyZW5zKHBzdHJpbmcoJ21hcmNvJykpO1xuICAgICAgICBleHBlY3QoaW5zaWRlUGFyZW5zLnJ1bignKG1hcmNvKScpLnRvU3RyaW5nKCkpXG4gICAgICAgICAgICAudG8uYmUuZXFsKCdWYWxpZGF0aW9uLlN1Y2Nlc3MoW1ttLGEscixjLG9dLHJvdz0xO2NvbD0wO3Jlc3Q9XSknKTtcbiAgICB9KTtcbiAgICBpdCgnY2hlcnJ5LXBpY2tpbmcgZWxlbWVudHMgc2VwYXJhdGVkIGJ5IHNlcGFyYXRvcnMnLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHN1YnN0cmluZ3NXaXRoQ29tbWFzID0gbWFueShtYW55MShhbnlPZihsb3dlcmNhc2VzKSkuZGlzY2FyZFNlY29uZChwY2hhcignLCcpKSk7XG4gICAgICAgIGV4cGVjdChzdWJzdHJpbmdzV2l0aENvbW1hcy5ydW4oJ2EsYixjZCwxJykudG9TdHJpbmcoKSlcbiAgICAgICAgICAgIC50by5iZS5lcWwoJ1ZhbGlkYXRpb24uU3VjY2VzcyhbW1thXSxbYl0sW2MsZF1dLHJvdz0wO2NvbD03O3Jlc3Q9MV0pJyk7XG4gICAgfSk7XG4gICAgaXQoJy4uLmFsc28gd2hlbiBpbnNpZGUgYSBsaXN0cycsICgpID0+IHtcbiAgICAgICAgY29uc3Qgc3Vic3RyaW5nc1dpdGhDb21tYXMgPSBtYW55KG1hbnkxKGFueU9mKGxvd2VyY2FzZXMpKS5kaXNjYXJkU2Vjb25kKHBjaGFyKCcsJykpKTtcbiAgICAgICAgY29uc3QgbGlzdEVsZW1lbnRzID0gYmV0d2VlbihwY2hhcignWycpLCBzdWJzdHJpbmdzV2l0aENvbW1hcywgcGNoYXIoJ10nKSk7XG4gICAgICAgIGV4cGVjdChsaXN0RWxlbWVudHMucnVuKCdbYSxiLGNkLG1hcmNvLF0xJykudG9TdHJpbmcoKSlcbiAgICAgICAgICAgIC50by5iZS5lcWwoJ1ZhbGlkYXRpb24uU3VjY2VzcyhbW1thXSxbYl0sW2MsZF0sW20sYSxyLGMsb11dLHJvdz0wO2NvbD0xNTtyZXN0PTFdKScpO1xuICAgIH0pO1xuICAgIGRlc2NyaWJlKCd0aGFua3MgdG8gdGhlIHNwZWNpZmljIHNlcEJ5MSBvcGVyYXRvcicsICgpID0+IHtcbiAgICAgICAgY29uc3QgdmFsdWVzUCA9IGFueU9mKGxvd2VyY2FzZXMpO1xuICAgICAgICBjb25zdCBjb21tYVAgPSBwY2hhcignLCcpO1xuICAgICAgICBpdCgnY2hlcnJ5LXBpY2tpbmcgZWxlbWVudHMgc2VwYXJhdGVkIGJ5IHNlcGFyYXRvcnMnLCAoKSA9PiB7XG4gICAgICAgICAgICBleHBlY3Qoc2VwQnkxKHZhbHVlc1AsIGNvbW1hUCkucnVuKCdhLGIsY2QsMScpLnRvU3RyaW5nKCkpXG4gICAgICAgICAgICAgICAgLnRvLmJlLmVxbCgnVmFsaWRhdGlvbi5TdWNjZXNzKFtbW2FdLFtiXSxbYyxkXV0scm93PTA7Y29sPTc7cmVzdD0xXSknKTtcbiAgICAgICAgfSk7XG4gICAgICAgIGl0KCcuLi5hbHNvIHdoZW4gaW5zaWRlIGEgbGlzdHMnLCAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBsaXN0RWxlbWVudHMgPSBiZXR3ZWVuKHBjaGFyKCdbJyksIHNlcEJ5MSh2YWx1ZXNQLCBjb21tYVApLCBwY2hhcignXScpKTtcbiAgICAgICAgICAgIGV4cGVjdChsaXN0RWxlbWVudHMucnVuKCdbYSxiLGNkLG1hcmNvLF0nKS50b1N0cmluZygpKVxuICAgICAgICAgICAgICAgIC50by5iZS5lcWwoJ1ZhbGlkYXRpb24uU3VjY2VzcyhbW1thXSxbYl0sW2MsZF0sW20sYSxyLGMsb11dLHJvdz0xO2NvbD0wO3Jlc3Q9XSknKTtcbiAgICAgICAgfSk7XG4gICAgICAgIGl0KCcuLi5saXN0cyB3aXRoIG5vIGVsZW1lbnRzJywgKCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgbGlzdEVsZW1lbnRzID0gYmV0d2VlbihwY2hhcignWycpLCBzZXBCeTEodmFsdWVzUCwgY29tbWFQKSwgcGNoYXIoJ10nKSk7XG4gICAgICAgICAgICBleHBlY3QobGlzdEVsZW1lbnRzLnJ1bignW10nKS50b1N0cmluZygpKVxuICAgICAgICAgICAgICAgIC50by5iZS5lcWwoJ1ZhbGlkYXRpb24uU3VjY2VzcyhbW10scm93PTE7Y29sPTA7cmVzdD1dKScpO1xuICAgICAgICB9KTtcbiAgICAgICAgaXQoJy4uLmxpc3RzIHdpdGgganVzdCBvbmUgZWxlbWVudCcsICgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGxpc3RFbGVtZW50cyA9IGJldHdlZW4ocGNoYXIoJ1snKSwgc2VwQnkxKHZhbHVlc1AsIGNvbW1hUCksIHBjaGFyKCddJykpO1xuICAgICAgICAgICAgZXhwZWN0KGxpc3RFbGVtZW50cy5ydW4oJ1thXScpLnRvU3RyaW5nKCkpXG4gICAgICAgICAgICAgICAgLnRvLmJlLmVxbCgnVmFsaWRhdGlvbi5TdWNjZXNzKFtbW2FdXSxyb3c9MTtjb2w9MDtyZXN0PV0pJyk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xufSk7XG4iXX0=