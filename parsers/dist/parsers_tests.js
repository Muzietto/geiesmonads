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

        describe('can parse X followed by Y', function () {
            var XbeforeY = (0, _parsers.followedByP)('Y', 'X');
            it('without consuming the character', function () {
                var XYp = (0, _parsers.many1)((0, _parsers.choice)([XbeforeY, (0, _parsers.pchar)('Y')]));
                var parsingXY = XYp.run(text('XY'));
                (0, _chai.expect)(parsingXY.isSuccess).to.be.true;
                (0, _chai.expect)(parsingXY.toString()).to.be.eql('Validation.Success([[X,Y],row=1;col=0;rest=])');
            });
            it('and fail when X is not followed by Y', function () {
                var XAp = (0, _parsers.many1)((0, _parsers.choice)([XbeforeY, (0, _parsers.pchar)('A')]));
                var parsingXA = XAp.run(text('XA'));
                (0, _chai.expect)(parsingXA.isFailure).to.be.true;
                // expect(parsingXA.value[1].rest()).to.be.eql('X');
            });
            it('and fail when X is at the end of the string', function () {
                var AXp = (0, _parsers.many1)((0, _parsers.choice)([(0, _parsers.pchar)('A'), XbeforeY]));
                var parsingAX = AXp.run(text('AX'));
                (0, _chai.expect)(parsingAX.isSuccess).to.be.true;
                (0, _chai.expect)(parsingAX.value[1].rest()).to.be.eql('X');
            });
        });

        describe('can parse X not followed by Y', function () {
            var XnotBeforeY = (0, _parsers.notFollowedByP)('Y', 'X');

            it('without consuming the character', function () {
                var XAp = (0, _parsers.many1)((0, _parsers.choice)([XnotBeforeY, (0, _parsers.pchar)('A')]));
                var parsingXA = XAp.run(text('XA'));
                (0, _chai.expect)(parsingXA.isSuccess).to.be.true;
                (0, _chai.expect)(parsingXA.toString()).to.be.eql('Validation.Success([[X,A],row=1;col=0;rest=])');
            });
            it('and succeed when X is the last char in the string', function () {
                var AXp = (0, _parsers.many1)((0, _parsers.choice)([(0, _parsers.pchar)('A'), XnotBeforeY]));
                var parsingAX = AXp.run(text('AX'));
                (0, _chai.expect)(parsingAX.isSuccess).to.be.true;
                (0, _chai.expect)(parsingAX.toString()).to.be.eql('Validation.Success([[A,X],row=1;col=0;rest=])');
            });
            it('and halt when X is followed by Y', function () {
                var AXYp = (0, _parsers.many1)((0, _parsers.choice)([(0, _parsers.pchar)('A'), XnotBeforeY]));
                var parsingAXY = AXYp.run(text('AXY'));
                (0, _chai.expect)(parsingAXY.isSuccess).to.be.true;
                (0, _chai.expect)(parsingAXY.value[1].rest()).to.be.eql('XY');
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
        it('parses abc with a different, but still very clumsy syntax', function () {
            var pairAdder = function pairAdder(_ref3) {
                var _ref4 = _slicedToArray(_ref3, 2),
                    x = _ref4[0],
                    y = _ref4[1];

                return x + y;
            };
            var abcP = (0, _parsers.pchar)('a').andThen((0, _parsers.pchar)('b')).fmap(pairAdder).andThen((0, _parsers.pchar)('c')).fmap(pairAdder);
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
            var unpacker = function unpacker(_ref5) {
                var _ref6 = _slicedToArray(_ref5, 2),
                    x = _ref6[0],
                    _ref6$ = _slicedToArray(_ref6[1], 2),
                    y = _ref6$[0],
                    z = _ref6$[1];

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2pzLXNwZWMvcGFyc2Vyc190ZXN0cy5qcyJdLCJuYW1lcyI6WyJsb3dlcmNhc2VzIiwidXBwZXJjYXNlcyIsImRpZ2l0cyIsIndoaXRlcyIsInRleHQiLCJQb3NpdGlvbiIsImZyb21UZXh0IiwiZGVzY3JpYmUiLCJwYXJzZXJBIiwicGFyc2VyMSIsIml0IiwicGFyc2luZ0EiLCJ2YWx1ZSIsInRvIiwiYmUiLCJlcWwiLCJyZXN0IiwiaXNTdWNjZXNzIiwidHJ1ZSIsInBhcnNpbmdCIiwiaXNGYWlsdXJlIiwicGFyc2luZzEiLCJwYXJzaW5nMiIsInBhcnNpbmczIiwicnVuIiwic3RhcnRPZklucHV0UCIsImxhdGVySW5UaGVTdHJlYW0iLCJzdGFydEFCQyIsInBhcnNpbmciLCJ0b1N0cmluZyIsIm5vdFN0YXJ0T2ZJbnB1dFAiLCJBQk5vdFN0YXJ0QyIsImZpbmFsbHlJblRoZVN0cmVhbSIsImVuZE9mSW5wdXRQIiwibm90RmluYWxseUluVGhlU3RyZWFtIiwibm90RW5kT2ZJbnB1dFAiLCJBQm5vdEVuZEMiLCJtYXAiLCJsb2dQIiwiQW5vdEVuZEIiLCJwYXJzZXJBYW5kQiIsInBhcnNpbmdBYW5kQiIsInBhcnNlckFvckIiLCJwYXJzaW5nQW9yQiIsIndoYXRldmVyIiwic3VjY2VlZFAiLCJmYWlsUCIsInBhcnNlcnNDaG9pY2UiLCJwYXJzaW5nQ2hvaWNlIiwibG93ZXJjYXNlc1BhcnNlciIsInVwcGVyY2FzZXNQYXJzZXIiLCJkaWdpdHNQYXJzZXIiLCJYYWZ0ZXJZIiwiWVhwIiwicGFyc2luZ1lYIiwiQVhwIiwicGFyc2luZ0FYIiwiWG5vdEFmdGVyWSIsIlhiZWZvcmVZIiwiWFlwIiwicGFyc2luZ1hZIiwiWEFwIiwicGFyc2luZ1hBIiwiWG5vdEJlZm9yZVkiLCJBWFlwIiwicGFyc2luZ0FYWSIsInBhaXJBZGRlciIsIngiLCJ5IiwiYWJjUCIsImZtYXAiLCJhbmRUaGVuIiwicGFyc2VEaWdpdCIsInRocmVlRGlnaXRzIiwiYmVmb3JlIiwidW5wYWNrZXIiLCJ6IiwidGhyZWVEaWdpdHNJbXBsIiwidGhyZWVEaWdpdHNJbnN0IiwiYWRkU3RyaW5ncyIsIkFwbHVzQiIsImFkZERpZ2l0cyIsImFkZFBhcnNlciIsImFiY1BhcnNlciIsIm1hcmNvUGFyc2VyIiwibWFyY29QYXJzaW5nIiwidHJpbW1lciIsInplcm9Pck1vcmVQYXJzaW5nRnVuY3Rpb24iLCJ6ZXJvT3JNb3JlUGFyc2VyIiwiZXhhY3RseVRocmVlIiwid2hpdGVzUGFyc2VyIiwidHdvV29yZHMiLCJvbmVPck1vcmVQYXJzZXIiLCJwaW50IiwicGFyc2VJbnQiLCJsIiwicmVkdWNlIiwiYWNjIiwiY3VyciIsIm9wdERvdFRoZW5BIiwib3B0RG90V2l0aERlZmF1bHRUaGVuQSIsInBTaWduZWRJbnQiLCJvcHRTaWduTnVtYmVyUGFpciIsImlzSnVzdCIsIm9wdFN1YnN0cmluZyIsImRpc2NhcmRJbnRlZ2VyU2lnbiIsImRpc2NhcmRGaXJzdCIsImRpc2NhcmRTdWZmaXgiLCJkaXNjYXJkU2Vjb25kIiwidGFwSW50b0Rpc2NhcmRJbnRlZ2VyU2lnbiIsInJlcyIsInN0b3JlZExvZyIsImNvbnNvbGUiLCJsb2ciLCJtc2ciLCJsb2dJbnRlcm1lZGlhdGVSZXN1bHQiLCJpbnNpZGVQYXJlbnMiLCJzdWJzdHJpbmdzV2l0aENvbW1hcyIsImxpc3RFbGVtZW50cyIsInZhbHVlc1AiLCJjb21tYVAiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBeURBLFFBQU1BLGFBQWEsQ0FBQyxHQUFELEVBQU0sR0FBTixFQUFXLEdBQVgsRUFBZ0IsR0FBaEIsRUFBcUIsR0FBckIsRUFBMEIsR0FBMUIsRUFBK0IsR0FBL0IsRUFBb0MsR0FBcEMsRUFBeUMsR0FBekMsRUFBOEMsR0FBOUMsRUFBbUQsR0FBbkQsRUFBd0QsR0FBeEQsRUFBNkQsR0FBN0QsRUFBa0UsR0FBbEUsRUFBdUUsR0FBdkUsRUFBNEUsR0FBNUUsRUFBaUYsR0FBakYsRUFBc0Ys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QUFnQkMsTUFBaEIsQ0FBcEIsRUFBNkMsb0JBQU0sR0FBTixDQUE3QyxDQUFyQjtBQUNBLGtDQUFPRixhQUFhOUYsR0FBYixDQUFpQixpQkFBakIsRUFBb0NLLFFBQXBDLEVBQVAsRUFDS2hCLEVBREwsQ0FDUUMsRUFEUixDQUNXQyxHQURYLENBQ2UscUVBRGY7QUFFSCxhQUpEO0FBS0FMLGVBQUcsMkJBQUgsRUFBZ0MsWUFBTTtBQUNsQyxvQkFBTTRHLGVBQWUsc0JBQVEsb0JBQU0sR0FBTixDQUFSLEVBQW9CLHFCQUFPQyxPQUFQLEVBQWdCQyxNQUFoQixDQUFwQixFQUE2QyxvQkFBTSxHQUFOLENBQTdDLENBQXJCO0FBQ0Esa0NBQU9GLGFBQWE5RixHQUFiLENBQWlCLElBQWpCLEVBQXVCSyxRQUF2QixFQUFQLEVBQ0toQixFQURMLENBQ1FDLEVBRFIsQ0FDV0MsR0FEWCxDQUNlLDRDQURmO0FBRUgsYUFKRDtBQUtBTCxlQUFHLGdDQUFILEVBQXFDLFlBQU07QUFDdkMsb0JBQU00RyxlQUFlLHNCQUFRLG9CQUFNLEdBQU4sQ0FBUixFQUFvQixxQkFBT0MsT0FBUCxFQUFnQkMsTUFBaEIsQ0FBcEIsRUFBNkMsb0JBQU0sR0FBTixDQUE3QyxDQUFyQjtBQUNBLGtDQUFPRixhQUFhOUYsR0FBYixDQUFpQixLQUFqQixFQUF3QkssUUFBeEIsRUFBUCxFQUNLaEIsRUFETCxDQUNRQyxFQURSLENBQ1dDLEdBRFgsQ0FDZSwrQ0FEZjtBQUVILGFBSkQ7QUFLSCxTQXRCRDtBQXVCSCxLQWpERCIsImZpbGUiOiJwYXJzZXJzX3Rlc3RzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtleHBlY3R9IGZyb20gJ2NoYWknO1xuaW1wb3J0IHtcbiAgICBjaGFyUGFyc2VyLFxuICAgIGRpZ2l0UGFyc2VyLFxuICAgIHBjaGFyLFxuICAgIHBkaWdpdCxcbiAgICBhbmRUaGVuLFxuICAgIG9yRWxzZSxcbiAgICBjaG9pY2UsXG4gICAgYW55T2YsXG4gICAgZm1hcCxcbiAgICByZXR1cm5QLFxuICAgIGFwcGx5UCxcbiAgICBsaWZ0MixcbiAgICBzZXF1ZW5jZVAsXG4gICAgc2VxdWVuY2VQMixcbiAgICBwc3RyaW5nLFxuICAgIHN0cmluZ1AsXG4gICAgemVyb09yTW9yZSxcbiAgICBtYW55LFxuICAgIG1hbnkxLFxuICAgIG1hbnlDaGFycyxcbiAgICBtYW55Q2hhcnMxLFxuICAgIG9wdCxcbiAgICBvcHRCb29rLFxuICAgIGRpc2NhcmRGaXJzdCxcbiAgICBkaXNjYXJkU2Vjb25kLFxuICAgIHNlcEJ5MSxcbiAgICBiZXR3ZWVuLFxuICAgIGJldHdlZW5QYXJlbnMsXG4gICAgdGFwUCxcbiAgICBsb2dQLFxuICAgIHB3b3JkLFxuICAgIHRyaW1QLFxuICAgIHByZWNlZGVkQnlQLFxuICAgIG5vdFByZWNlZGVkQnlQLFxuICAgIGZvbGxvd2VkQnlQLFxuICAgIG5vdEZvbGxvd2VkQnlQLFxuICAgIHN0YXJ0T2ZJbnB1dFAsXG4gICAgbm90U3RhcnRPZklucHV0UCxcbiAgICBlbmRPZklucHV0UCxcbiAgICBub3RFbmRPZklucHV0UCxcbiAgICBzdWNjZWVkUCxcbiAgICBmYWlsUCxcbn0gZnJvbSAncGFyc2Vycyc7XG5pbXBvcnQge1xuICAgIGlzUGFpcixcbiAgICBpc1N1Y2Nlc3MsXG4gICAgaXNGYWlsdXJlLFxuICAgIGlzUGFyc2VyLFxuICAgIGlzU29tZSxcbiAgICBpc05vbmUsXG59IGZyb20gJ3V0aWwnO1xuaW1wb3J0IHtNYXliZX0gZnJvbSAnbWF5YmUnO1xuaW1wb3J0IHtWYWxpZGF0aW9ufSBmcm9tICd2YWxpZGF0aW9uJztcbmltcG9ydCB7UG9zaXRpb259IGZyb20gJ2NsYXNzZXMnO1xuXG5jb25zdCBsb3dlcmNhc2VzID0gWydhJywgJ2InLCAnYycsICdkJywgJ2UnLCAnZicsICdnJywgJ2gnLCAnaScsICdqJywgJ2snLCAnbCcsICdtJywgJ24nLCAnbycsICdwJywgJ3EnLCAncicsICdzJywgJ3QnLCAndScsICd2JywgJ3cnLCAneCcsICd5JywgJ3onLF07XG5jb25zdCB1cHBlcmNhc2VzID0gWydBJywgJ0InLCAnQycsICdEJywgJ0UnLCAnRicsICdHJywgJ0gnLCAnSScsICdKJywgJ0snLCAnTCcsICdNJywgJ04nLCAnTycsICdQJywgJ1EnLCAnUicsICdTJywgJ1QnLCAnVScsICdWJywgJ1cnLCAnWCcsICdZJywgJ1onLF07XG5jb25zdCBkaWdpdHMgPSBbJzAnLCAnMScsICcyJywgJzMnLCAnNCcsICc1JywgJzYnLCAnNycsICc4JywgJzknXTtcbmNvbnN0IHdoaXRlcyA9IFsnICcsICdcXHQnLCAnXFxuJywgJ1xcciddO1xuY29uc3QgdGV4dCA9IFBvc2l0aW9uLmZyb21UZXh0O1xuXG5kZXNjcmliZSgnYSB2ZXJ5IHNpbXBsZSBwYXJzZXIgZm9yIGNoYXJzIG9yIGZvciBkaWdpdHMnLCAoKSA9PiB7XG4gICAgY29uc3QgcGFyc2VyQSA9IGNoYXJQYXJzZXIoJ2EnKTtcbiAgICBjb25zdCBwYXJzZXIxID0gZGlnaXRQYXJzZXIoMSk7XG5cbiAgICBpdCgnY2FuIHBhcnNlIGEgc2luZ2xlIGNoYXInLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHBhcnNpbmdBID0gcGFyc2VyQSh0ZXh0KCdhYmMnKSk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQS52YWx1ZVswXSkudG8uYmUuZXFsKCdhJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQS52YWx1ZVsxXS5yZXN0KCkpLnRvLmJlLmVxbCgnYmMnKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdBLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcbiAgICB9KTtcblxuICAgIGl0KCdjYW4gYWxzbyBOT1QgcGFyc2UgYSBzaW5nbGUgY2hhcicsICgpID0+IHtcbiAgICAgICAgY29uc3QgcGFyc2luZ0IgPSBwYXJzZXJBKHRleHQoJ2JjZCcpKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdCLnZhbHVlWzBdKS50by5iZS5lcWwoJ2NoYXJQYXJzZXInKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdCLnZhbHVlWzFdKS50by5iZS5lcWwoJ3dhbnRlZCBhOyBnb3QgYicpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0IudmFsdWVbMl0ucmVzdCgpKS50by5iZS5lcWwoJ2JjZCcpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0IuaXNGYWlsdXJlKS50by5iZS50cnVlO1xuICAgIH0pO1xuXG4gICAgaXQoJ2ZhaWxzIGF0IHRoZSBlbmQgb2YgdGhlIHN0cmVhbScsICgpID0+IHtcbiAgICAgICAgY29uc3QgcGFyc2luZ0EgPSBwYXJzZXJBKHRleHQoJycpKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdBLnZhbHVlWzBdKS50by5iZS5lcWwoJ2NoYXJQYXJzZXInKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdBLnZhbHVlWzFdKS50by5iZS5lcWwoJ25vIG1vcmUgaW5wdXQnKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdBLnZhbHVlWzJdLnJlc3QoKSkudG8uYmUuZXFsKCcnKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdBLmlzRmFpbHVyZSkudG8uYmUudHJ1ZTtcbiAgICB9KTtcblxuICAgIGl0KCdjYW4gcGFyc2UgYSBzaW5nbGUgZGlnaXQnLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHBhcnNpbmcxID0gcGFyc2VyMSh0ZXh0KCcxMjMnKSk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nMS52YWx1ZVswXSkudG8uYmUuZXFsKDEpO1xuICAgICAgICBleHBlY3QocGFyc2luZzEudmFsdWVbMV0ucmVzdCgpKS50by5iZS5lcWwoJzIzJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nMS5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgfSk7XG5cbiAgICBpdCgnY2FuIGFsc28gTk9UIHBhcnNlIGEgc2luZ2xlIGRpZ2l0JywgKCkgPT4ge1xuICAgICAgICBjb25zdCBwYXJzaW5nMiA9IHBhcnNlcjEodGV4dCgnMjM0JykpO1xuICAgICAgICBleHBlY3QocGFyc2luZzIudmFsdWVbMF0pLnRvLmJlLmVxbCgnZGlnaXRQYXJzZXInKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcyLnZhbHVlWzFdKS50by5iZS5lcWwoJ3dhbnRlZCAxOyBnb3QgMicpO1xuICAgICAgICBleHBlY3QocGFyc2luZzIudmFsdWVbMl0ucmVzdCgpKS50by5iZS5lcWwoJzIzNCcpO1xuICAgICAgICBleHBlY3QocGFyc2luZzIuaXNGYWlsdXJlKS50by5iZS50cnVlO1xuICAgIH0pO1xuXG4gICAgaXQoJ2ZhaWxzIGF0IHRoZSBlbmQgb2YgdGhlIHN0cmVhbSBhbHNvIHdoZW4gaHVudGluZyBmb3IgZGlnaXRzJywgKCkgPT4ge1xuICAgICAgICBjb25zdCBwYXJzaW5nMyA9IHBhcnNlcjEodGV4dCgnJykpO1xuICAgICAgICBleHBlY3QocGFyc2luZzMudmFsdWVbMF0pLnRvLmJlLmVxbCgnZGlnaXRQYXJzZXInKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmczLnZhbHVlWzFdKS50by5iZS5lcWwoJ25vIG1vcmUgaW5wdXQnKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmczLnZhbHVlWzJdLnJlc3QoKSkudG8uYmUuZXFsKCcnKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmczLmlzRmFpbHVyZSkudG8uYmUudHJ1ZTtcbiAgICB9KTtcbn0pO1xuXG5kZXNjcmliZSgnYSBuYW1lZCBjaGFyYWN0ZXIgcGFyc2VyJywgKCkgPT4ge1xuICAgIGNvbnN0IHBhcnNlckEgPSBwY2hhcignYScpO1xuXG4gICAgaXQoJ2NhbiBwYXJzZSBhIHNpbmdsZSBjaGFyJywgKCkgPT4ge1xuICAgICAgICBleHBlY3QoaXNQYXJzZXIocGFyc2VyQSkpLnRvLmJlLnRydWU7XG4gICAgICAgIGNvbnN0IHBhcnNpbmdBID0gcGFyc2VyQS5ydW4odGV4dCgnYWJjJykpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0EudmFsdWVbMF0pLnRvLmJlLmVxbCgnYScpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0EudmFsdWVbMV0ucmVzdCgpKS50by5iZS5lcWwoJ2JjJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQS5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgfSk7XG5cbiAgICBpdCgnY2FuIGFsc28gTk9UIHBhcnNlIGEgc2luZ2xlIGNoYXInLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHBhcnNpbmdCID0gcGFyc2VyQS5ydW4odGV4dCgnYmNkJykpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0IudmFsdWVbMF0pLnRvLmJlLmVxbCgncGNoYXJfYScpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0IudmFsdWVbMV0pLnRvLmJlLmVxbCgnd2FudGVkIGE7IGdvdCBiJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQi5pc0ZhaWx1cmUpLnRvLmJlLnRydWU7XG4gICAgfSk7XG59KTtcblxuZGVzY3JpYmUoJ2EgcGFyc2VyIGZvciB0aGUgc3RhcnQgb2YgdGhlIGlucHV0JywgKCkgPT4ge1xuICBpdCgnc3VjY2VlZHMgYXQgdGhlIHN0YXJ0IG9mIHRoZSBzdHJlYW0nLCAoKSA9PiB7XG4gICAgZXhwZWN0KHN0YXJ0T2ZJbnB1dFAucnVuKFBvc2l0aW9uLmZyb21UZXh0KCdhYmMnKSkuaXNTdWNjZXNzKS50by5iZS50cnVlO1xuICB9KTtcbiAgaXQoJ2ZhaWxzIGhhbGZ3YXkgdGhyb3VnaCB0aGUgc3RyZWFtJywgKCkgPT4ge1xuICAgIGNvbnN0IGxhdGVySW5UaGVTdHJlYW0gPSBzZXF1ZW5jZVAoW3BjaGFyKCdhJyksIHN0YXJ0T2ZJbnB1dFBdKTtcbiAgICBleHBlY3QobGF0ZXJJblRoZVN0cmVhbS5ydW4oUG9zaXRpb24uZnJvbVRleHQoJ2FiYycpKS5pc0ZhaWx1cmUpLnRvLmJlLnRydWU7XG4gIH0pO1xuICBpdCgnZG9lcyBub3QgY29uc3VtZSBjaGFyYWN0ZXJzLCBidXQgaXQgcmV0dXJucyBhbiBlbXB0eSBzdHJpbmcgYXMgcmVzdWx0JywgKCkgPT4ge1xuICAgIGNvbnN0IHN0YXJ0QUJDID0gc2VxdWVuY2VQKFtzdGFydE9mSW5wdXRQLCBwY2hhcignQScpLCBwY2hhcignQicpLCBwY2hhcignQycpXSk7XG4gICAgY29uc3QgcGFyc2luZyA9IHN0YXJ0QUJDLnJ1bihQb3NpdGlvbi5mcm9tVGV4dCgnQUJDJykpO1xuICAgIGV4cGVjdChwYXJzaW5nLnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgnVmFsaWRhdGlvbi5TdWNjZXNzKFtbLEEsQixDXSxyb3c9MTtjb2w9MDtyZXN0PV0pJyk7XG4gIH0pO1xufSk7XG5cbmRlc2NyaWJlKCdhIHBhcnNlciBmb3IgTk9UIHRoZSBzdGFydCBvZiB0aGUgaW5wdXQnLCAoKSA9PiB7XG4gIGl0KCdmYWlscyBhdCB0aGUgc3RhcnQgb2YgdGhlIHN0cmVhbScsICgpID0+IHtcbiAgICBleHBlY3Qobm90U3RhcnRPZklucHV0UC5ydW4oUG9zaXRpb24uZnJvbVRleHQoJ2FiYycpKS5pc0ZhaWx1cmUpLnRvLmJlLnRydWU7XG4gICAgZXhwZWN0KHNlcXVlbmNlUChbbm90U3RhcnRPZklucHV0UCwgcGNoYXIoJ2EnKV0pLnJ1bihQb3NpdGlvbi5mcm9tVGV4dCgnYWJjJykpLnRvU3RyaW5nKCkpXG4gICAgICAudG8uYmUuZXFsKCdWYWxpZGF0aW9uLkZhaWx1cmUoW3Vua25vd24sZmFpbCxyb3c9MDtjb2w9MDtyZXN0PWFiY10pJyk7XG4gIH0pO1xuICBpdCgnc3VjY2VlZHMgaGFsZndheSB0aHJvdWdoIHRoZSBzdHJlYW0nLCAoKSA9PiB7XG4gICAgY29uc3QgbGF0ZXJJblRoZVN0cmVhbSA9IHNlcXVlbmNlUChbcGNoYXIoJ2EnKSwgbm90U3RhcnRPZklucHV0UF0pO1xuICAgIGV4cGVjdChsYXRlckluVGhlU3RyZWFtLnJ1bihQb3NpdGlvbi5mcm9tVGV4dCgnYWJjJykpLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcbiAgfSk7XG4gIGl0KCdkb2VzIG5vdCBjb25zdW1lIGNoYXJhY3RlcnMsIGJ1dCBpdCByZXR1cm5zIGFuIGVtcHR5IHN0cmluZyBhcyByZXN1bHQnLCAoKSA9PiB7XG4gICAgY29uc3QgQUJOb3RTdGFydEMgPSBzZXF1ZW5jZVAoW3BjaGFyKCdBJyksIHBjaGFyKCdCJyksIG5vdFN0YXJ0T2ZJbnB1dFAsIHBjaGFyKCdDJyldKTtcbiAgICBjb25zdCBwYXJzaW5nID0gQUJOb3RTdGFydEMucnVuKFBvc2l0aW9uLmZyb21UZXh0KCdBQkMnKSk7XG4gICAgZXhwZWN0KHBhcnNpbmcudG9TdHJpbmcoKSkudG8uYmUuZXFsKCdWYWxpZGF0aW9uLlN1Y2Nlc3MoW1tBLEIsLENdLHJvdz0xO2NvbD0wO3Jlc3Q9XSknKTtcbiAgfSk7XG59KTtcblxuZGVzY3JpYmUoJ2EgcGFyc2VyIGZvciB0aGUgZW5kIG9mIHRoZSBpbnB1dCcsICgpID0+IHtcbiAgaXQoJ3N1Y2NlZWRzIGF0IHRoZSBlbmQgb2YgdGhlIHN0cmVhbScsICgpID0+IHtcbiAgICBjb25zdCBmaW5hbGx5SW5UaGVTdHJlYW0gPSBzZXF1ZW5jZVAoW3BjaGFyKCdhJyksIHBjaGFyKCdiJyksIGVuZE9mSW5wdXRQXSk7XG4gICAgZXhwZWN0KGZpbmFsbHlJblRoZVN0cmVhbS5ydW4oUG9zaXRpb24uZnJvbVRleHQoJ2FiJykpLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcbiAgfSk7XG4gIGl0KCdmYWlscyBoYWxmd2F5IHRocm91Z2ggdGhlIHN0cmVhbScsICgpID0+IHtcbiAgICBjb25zdCBsYXRlckluVGhlU3RyZWFtID0gc2VxdWVuY2VQKFtwY2hhcignYScpLCBlbmRPZklucHV0UF0pO1xuICAgIGV4cGVjdChsYXRlckluVGhlU3RyZWFtLnJ1bihQb3NpdGlvbi5mcm9tVGV4dCgnYWJjJykpLmlzRmFpbHVyZSkudG8uYmUudHJ1ZTtcbiAgfSk7XG59KTtcblxuZGVzY3JpYmUoJ2EgcGFyc2VyIGZvciBOT1QgdGhlIGVuZCBvZiB0aGUgaW5wdXQnLCAoKSA9PiB7XG4gIGl0KCdmYWlscyBhdCB0aGUgZW5kIG9mIHRoZSBzdHJlYW0nLCAoKSA9PiB7XG4gICAgY29uc3Qgbm90RmluYWxseUluVGhlU3RyZWFtID0gc2VxdWVuY2VQKFtwY2hhcignYScpLCBub3RFbmRPZklucHV0UF0pO1xuICAgIGV4cGVjdChub3RGaW5hbGx5SW5UaGVTdHJlYW0ucnVuKFBvc2l0aW9uLmZyb21UZXh0KCdhJykpLmlzRmFpbHVyZSkudG8uYmUudHJ1ZTtcbiAgfSk7XG4gIGl0KCdzdWNjZWVkcyBoYWxmd2F5IHRocm91Z2ggdGhlIHN0cmVhbScsICgpID0+IHtcbiAgICBjb25zdCBBQm5vdEVuZEMgPSBzZXF1ZW5jZVAoW3BjaGFyKCdBJyksIHBjaGFyKCdCJyksIG5vdEVuZE9mSW5wdXRQLCBwY2hhcignQycpXS5tYXAobG9nUCkpO1xuICAgIGV4cGVjdChBQm5vdEVuZEMucnVuKFBvc2l0aW9uLmZyb21UZXh0KCdBQkMnKSkuaXNTdWNjZXNzKS50by5iZS50cnVlO1xuICB9KTtcbiAgaXQoJ2RvZXMgbm90IGNvbnN1bWUgY2hhcmFjdGVycywgYnV0IGl0IHJldHVybnMgYW4gZW1wdHkgc3RyaW5nIGFzIHJlc3VsdCcsICgpID0+IHtcbiAgICBjb25zdCBBbm90RW5kQiA9IHNlcXVlbmNlUChbcGNoYXIoJ0EnKSwgbm90RW5kT2ZJbnB1dFAsIHBjaGFyKCdCJyldLm1hcChsb2dQKSk7XG4gICAgZXhwZWN0KEFub3RFbmRCLnJ1bihQb3NpdGlvbi5mcm9tVGV4dCgnQUInKSkudG9TdHJpbmcoKSkudG8uYmUuZXFsKCdWYWxpZGF0aW9uLlN1Y2Nlc3MoW1tBLCxCXSxyb3c9MTtjb2w9MDtyZXN0PV0pJyk7XG4gIH0pO1xufSk7XG5cbmRlc2NyaWJlKCd0d28gcGFyc2VycyBib3VuZCBieSBhbmRUaGVuJywgKCkgPT4ge1xuICAgIGNvbnN0IHBhcnNlckFhbmRCID0gYW5kVGhlbihwY2hhcignYScpLCBwY2hhcignYicpKTtcblxuICAgIGl0KCdjYW4gcGFyc2UgdHdvIGNoYXJzJywgKCkgPT4ge1xuICAgICAgICBleHBlY3QoaXNQYXJzZXIocGFyc2VyQWFuZEIpKS50by5iZS50cnVlO1xuICAgICAgICBjb25zdCBwYXJzaW5nQWFuZEIgPSBwYXJzZXJBYW5kQi5ydW4odGV4dCgnYWJjJykpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0FhbmRCLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdBYW5kQi52YWx1ZVswXS50b1N0cmluZygpKS50by5iZS5lcWwoJ1thLGJdJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQWFuZEIudmFsdWVbMV0ucmVzdCgpKS50by5iZS5lcWwoJ2MnKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdBYW5kQi50b1N0cmluZygpKS50by5iZS5lcWwoJ1ZhbGlkYXRpb24uU3VjY2VzcyhbW2EsYl0scm93PTA7Y29sPTI7cmVzdD1jXSknKTtcbiAgICB9KTtcblxuICAgIGl0KCdjYW4gYWxzbyBOT1QgcGFyc2UgdHdvIGNoYXJzJywgKCkgPT4ge1xuICAgICAgICBjb25zdCBwYXJzaW5nQWFuZEIgPSBwYXJzZXJBYW5kQi5ydW4odGV4dCgnYWNkJykpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0FhbmRCLmlzRmFpbHVyZSkudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdBYW5kQi52YWx1ZVswXSkudG8uYmUuZXFsKCdwY2hhcl9hIGFuZFRoZW4gcGNoYXJfYicpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0FhbmRCLnZhbHVlWzFdKS50by5iZS5lcWwoJ3dhbnRlZCBiOyBnb3QgYycpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0FhbmRCLnZhbHVlWzJdLnJlc3QoKSkudG8uYmUuZXFsKCdjZCcpO1xuICAgIH0pO1xuXG4gICAgaXQoJ3dpbGwgZmFpbCBpZiB0aGUgaW5wdXQgaXMgdG9vIHNob3J0JywgKCkgPT4ge1xuICAgICAgICBleHBlY3QocGFyc2VyQWFuZEIucnVuKHRleHQoJ2EnKSkuaXNGYWlsdXJlKS50by5iZS50cnVlO1xuICAgICAgICBleHBlY3QocGFyc2VyQWFuZEIucnVuKHRleHQoJ2FiJykpLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcbiAgICB9KTtcbn0pO1xuXG5kZXNjcmliZSgndHdvIHBhcnNlcnMgYm91bmQgYnkgb3JFbHNlJywgKCkgPT4ge1xuICAgIGNvbnN0IHBhcnNlckFvckIgPSBvckVsc2UocGNoYXIoJ2EnKSwgcGNoYXIoJ2InKSk7XG5cbiAgICBpdCgnY2FuIHBhcnNlIG9uZSBvZiB0d28gY2hhcnMnLCAoKSA9PiB7XG4gICAgICAgIGV4cGVjdChpc1BhcnNlcihwYXJzZXJBb3JCKSkudG8uYmUudHJ1ZTtcbiAgICAgICAgbGV0IHBhcnNpbmdBb3JCID0gcGFyc2VyQW9yQi5ydW4odGV4dCgnYWJjJykpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0FvckIuaXNTdWNjZXNzKS50by5iZS50cnVlO1xuICAgICAgICBleHBlY3QocGFyc2luZ0FvckIudmFsdWVbMF0pLnRvLmJlLmVxbCgnYScpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0FvckIudmFsdWVbMV0ucmVzdCgpKS50by5iZS5lcWwoJ2JjJyk7XG4gICAgICAgIHBhcnNpbmdBb3JCID0gcGFyc2VyQW9yQi5ydW4odGV4dCgnYmJjJykpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0FvckIuaXNTdWNjZXNzKS50by5iZS50cnVlO1xuICAgICAgICBleHBlY3QocGFyc2luZ0FvckIudmFsdWVbMF0pLnRvLmJlLmVxbCgnYicpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0FvckIudmFsdWVbMV0ucmVzdCgpKS50by5iZS5lcWwoJ2JjJyk7XG4gICAgfSk7XG5cbiAgICBpdCgnY2FuIGFsc28gcGFyc2UgTk9ORSBvZiB0d28gY2hhcnMnLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHBhcnNpbmdBb3JCID0gcGFyc2VyQW9yQi5ydW4odGV4dCgnY2RlJykpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0FvckIuaXNGYWlsdXJlKS50by5iZS50cnVlO1xuICAgICAgICBleHBlY3QocGFyc2luZ0FvckIudmFsdWVbMF0pLnRvLmJlLmVxbCgncGNoYXJfYSBvckVsc2UgcGNoYXJfYicpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0FvckIudmFsdWVbMV0pLnRvLmJlLmVxbCgnd2FudGVkIGI7IGdvdCBjJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQW9yQi52YWx1ZVsyXS5yZXN0KCkpLnRvLmJlLmVxbCgnY2RlJyk7XG4gICAgfSk7XG5cbiAgICBpdCgnd2lsbCBmYWlsIGlmIHRoZSBpbnB1dCBpcyB0b28gc2hvcnQnLCAoKSA9PiB7XG4gICAgICAgIGV4cGVjdChwYXJzZXJBb3JCLnJ1bih0ZXh0KCdhJykpLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNlckFvckIucnVuKHRleHQoJycpKS5pc0ZhaWx1cmUpLnRvLmJlLnRydWU7XG4gICAgfSk7XG59KTtcblxuZGVzY3JpYmUoJ2Egc3VjY2VlZGluZyBwYXJzZXInLCAoKSA9PiB7XG4gIGNvbnN0IHdoYXRldmVyID0gUG9zaXRpb24uZnJvbVRleHQoJ3doYXRldmVyJyk7XG4gIGl0KCdzdWNjZWVkcyBhbHdheXMnLCAoKSA9PiB7XG4gICAgZXhwZWN0KHN1Y2NlZWRQLnJ1bih3aGF0ZXZlcikuaXNTdWNjZXNzKS50by5iZS50cnVlO1xuICAgIGNvbnN0IHBhcnNpbmcgPSBzZXF1ZW5jZVAoW3BjaGFyKCd3JyksIHBjaGFyKCdoJyksIHN1Y2NlZWRQXSkucnVuKHdoYXRldmVyKTtcbiAgICBleHBlY3QocGFyc2luZy50b1N0cmluZygpKS50by5iZS5lcWwoJ1ZhbGlkYXRpb24uU3VjY2VzcyhbW3csaCxdLHJvdz0wO2NvbD0yO3Jlc3Q9YXRldmVyXSknKTtcbiAgfSk7XG4gIGl0KCdkb2VzIG5vdCBjb25zdW1lIGNoYXJhY3RlcnMsIGJ1dCBpdCByZXR1cm5zIGFuIGVtcHR5IHN0cmluZyBhcyByZXN1bHQnLCAoKSA9PiB7XG4gICAgY29uc3QgcGFyc2luZyA9IHNlcXVlbmNlUChbcGNoYXIoJ3cnKSwgc3VjY2VlZFAsIHBjaGFyKCdoJyldKTtcbiAgICBleHBlY3QocGFyc2luZy5ydW4od2hhdGV2ZXIpLnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgnVmFsaWRhdGlvbi5TdWNjZXNzKFtbdywsaF0scm93PTA7Y29sPTI7cmVzdD1hdGV2ZXJdKScpO1xuICB9KTtcbn0pO1xuXG5kZXNjcmliZSgnYSBmYWlsaW5nIHBhcnNlcicsICgpID0+IHtcbiAgaXQoJ3dpbGwgYWx3YXlzIGZhaWwnLCAoKSA9PiB7XG4gICAgZXhwZWN0KGZhaWxQLnJ1bignd2hhdGV2ZXInKS5pc0ZhaWx1cmUpLnRvLmJlLnRydWU7XG4gICAgZXhwZWN0KHNlcXVlbmNlUChbcGNoYXIoJ3cnKSwgZmFpbFBdKS5ydW4oJ3doYXRldmVyJykuaXNGYWlsdXJlKS50by5iZS50cnVlO1xuICB9KTtcbn0pO1xuXG5kZXNjcmliZSgnYSBjaG9pY2Ugb2YgcGFyc2VycyBib3VuZCBieSBvckVsc2UnLCAoKSA9PiB7XG4gICAgY29uc3QgcGFyc2Vyc0Nob2ljZSA9IGNob2ljZShbcGNoYXIoJ2EnKSwgcGNoYXIoJ2InKSwgcGNoYXIoJ2MnKSwgcGNoYXIoJ2QnKSxdKTtcblxuICAgIGl0KCdjYW4gcGFyc2Ugb25lIG9mIGZvdXIgY2hhcnMnLCAoKSA9PiB7XG4gICAgICAgIGV4cGVjdChpc1BhcnNlcihwYXJzZXJzQ2hvaWNlKSkudG8uYmUudHJ1ZTtcbiAgICAgICAgbGV0IHBhcnNpbmdDaG9pY2UgPSBwYXJzZXJzQ2hvaWNlLnJ1bih0ZXh0KCdhJykpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLnZhbHVlWzBdKS50by5iZS5lcWwoJ2EnKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UudmFsdWVbMV0ucmVzdCgpKS50by5iZS5lcWwoJycpO1xuICAgICAgICBwYXJzaW5nQ2hvaWNlID0gcGFyc2Vyc0Nob2ljZS5ydW4odGV4dCgnYicpKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UuaXNTdWNjZXNzKS50by5iZS50cnVlO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS52YWx1ZVswXSkudG8uYmUuZXFsKCdiJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLnZhbHVlWzFdLnJlc3QoKSkudG8uYmUuZXFsKCcnKTtcbiAgICAgICAgcGFyc2luZ0Nob2ljZSA9IHBhcnNlcnNDaG9pY2UucnVuKHRleHQoJ2QnKSk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UudmFsdWVbMF0pLnRvLmJlLmVxbCgnZCcpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS52YWx1ZVsxXS5yZXN0KCkpLnRvLmJlLmVxbCgnJyk7XG4gICAgfSk7XG5cbiAgICBpdCgnY2FuIGFsc28gcGFyc2UgTk9ORSBvZiBmb3VyIGNoYXJzJywgKCkgPT4ge1xuICAgICAgICBjb25zdCBwYXJzaW5nQ2hvaWNlID0gcGFyc2Vyc0Nob2ljZS5ydW4odGV4dCgneCcpKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UuaXNGYWlsdXJlKS50by5iZS50cnVlO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS52YWx1ZVswXSkudG8uYmUuZXFsKCdjaG9pY2UgL3BjaGFyX2EvcGNoYXJfYi9wY2hhcl9jL3BjaGFyX2QnKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UudmFsdWVbMV0pLnRvLmJlLmVxbCgnZmFpbCcpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS52YWx1ZVsyXS5yZXN0KCkpLnRvLmJlLmVxbCgneCcpO1xuICAgIH0pO1xuXG4gICAgaXQoJ3dpbGwgZmFpbCBpZiB0aGUgaW5wdXQgaXMgdG9vIHNob3J0JywgKCkgPT4ge1xuICAgICAgICBleHBlY3QocGFyc2Vyc0Nob2ljZS5ydW4odGV4dCgnYScpKS5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChwYXJzZXJzQ2hvaWNlLnJ1bih0ZXh0KCcnKSkuaXNGYWlsdXJlKS50by5iZS50cnVlO1xuICAgIH0pO1xufSk7XG5cbmRlc2NyaWJlKCdhIHBhcnNlciBmb3IgYW55IG9mIGEgbGlzdCBvZiBjaGFycycsICgpID0+IHtcbiAgICBpdCgnY2FuIHBhcnNlIGFueSBsb3dlcmNhc2UgY2hhcicsICgpID0+IHtcbiAgICAgICAgY29uc3QgbG93ZXJjYXNlc1BhcnNlciA9IGFueU9mKGxvd2VyY2FzZXMpO1xuXG4gICAgICAgIGV4cGVjdChpc1BhcnNlcihsb3dlcmNhc2VzUGFyc2VyKSkudG8uYmUudHJ1ZTtcbiAgICAgICAgbGV0IHBhcnNpbmdDaG9pY2UgPSBsb3dlcmNhc2VzUGFyc2VyLnJ1bih0ZXh0KCdhJykpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLnZhbHVlWzBdKS50by5iZS5lcWwoJ2EnKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UudmFsdWVbMV0ucmVzdCgpKS50by5iZS5lcWwoJycpO1xuICAgICAgICBwYXJzaW5nQ2hvaWNlID0gbG93ZXJjYXNlc1BhcnNlci5ydW4odGV4dCgnYicpKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UuaXNTdWNjZXNzKS50by5iZS50cnVlO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS52YWx1ZVswXSkudG8uYmUuZXFsKCdiJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLnZhbHVlWzFdLnJlc3QoKSkudG8uYmUuZXFsKCcnKTtcbiAgICAgICAgcGFyc2luZ0Nob2ljZSA9IGxvd2VyY2FzZXNQYXJzZXIucnVuKHRleHQoJ2QnKSk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UudmFsdWVbMF0pLnRvLmJlLmVxbCgnZCcpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS52YWx1ZVsxXS5yZXN0KCkpLnRvLmJlLmVxbCgnJyk7XG4gICAgICAgIHBhcnNpbmdDaG9pY2UgPSBsb3dlcmNhc2VzUGFyc2VyLnJ1bih0ZXh0KCd6JykpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLnZhbHVlWzBdKS50by5iZS5lcWwoJ3onKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UudmFsdWVbMV0ucmVzdCgpKS50by5iZS5lcWwoJycpO1xuXG4gICAgICAgIHBhcnNpbmdDaG9pY2UgPSBsb3dlcmNhc2VzUGFyc2VyLnJ1bih0ZXh0KCdZJykpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS5pc0ZhaWx1cmUpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLnZhbHVlWzBdKS50by5iZS5lcWwoJ2FueU9mIGFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6Jyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLnZhbHVlWzFdKS50by5iZS5lcWwoJ2ZhaWwnKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UudmFsdWVbMl0ucmVzdCgpKS50by5iZS5lcWwoJ1knKTtcbiAgICB9KTtcblxuICAgIGl0KCdjYW4gcGFyc2UgYW55IHVwcGVyY2FzZSBjaGFyJywgKCkgPT4ge1xuICAgICAgICBsZXQgdXBwZXJjYXNlc1BhcnNlciA9IGFueU9mKHVwcGVyY2FzZXMpO1xuXG4gICAgICAgIGV4cGVjdChpc1BhcnNlcih1cHBlcmNhc2VzUGFyc2VyKSkudG8uYmUudHJ1ZTtcbiAgICAgICAgbGV0IHBhcnNpbmdDaG9pY2UgPSB1cHBlcmNhc2VzUGFyc2VyLnJ1bih0ZXh0KCdBJykpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLnZhbHVlWzBdKS50by5iZS5lcWwoJ0EnKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UudmFsdWVbMV0ucmVzdCgpKS50by5iZS5lcWwoJycpO1xuICAgICAgICBwYXJzaW5nQ2hvaWNlID0gdXBwZXJjYXNlc1BhcnNlci5ydW4odGV4dCgnQicpKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UuaXNTdWNjZXNzKS50by5iZS50cnVlO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS52YWx1ZVswXSkudG8uYmUuZXFsKCdCJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLnZhbHVlWzFdLnJlc3QoKSkudG8uYmUuZXFsKCcnKTtcbiAgICAgICAgcGFyc2luZ0Nob2ljZSA9IHVwcGVyY2FzZXNQYXJzZXIucnVuKHRleHQoJ1InKSk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UudmFsdWVbMF0pLnRvLmJlLmVxbCgnUicpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS52YWx1ZVsxXS5yZXN0KCkpLnRvLmJlLmVxbCgnJyk7XG4gICAgICAgIHBhcnNpbmdDaG9pY2UgPSB1cHBlcmNhc2VzUGFyc2VyLnJ1bih0ZXh0KCdaJykpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLnZhbHVlWzBdKS50by5iZS5lcWwoJ1onKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UudmFsdWVbMV0ucmVzdCgpKS50by5iZS5lcWwoJycpO1xuXG4gICAgICAgIHBhcnNpbmdDaG9pY2UgPSB1cHBlcmNhc2VzUGFyc2VyLnJ1bih0ZXh0KCdzJykpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS5pc0ZhaWx1cmUpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLnZhbHVlWzBdKS50by5iZS5lcWwoJ2FueU9mIEFCQ0RFRkdISUpLTE1OT1BRUlNUVVZXWFlaJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLnZhbHVlWzFdKS50by5iZS5lcWwoJ2ZhaWwnKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UudmFsdWVbMl0ucmVzdCgpKS50by5iZS5lcWwoJ3MnKTtcbiAgICB9KTtcblxuICAgIGl0KCdjYW4gcGFyc2UgYW55IGRpZ2l0JywgKCkgPT4ge1xuICAgICAgICBsZXQgZGlnaXRzUGFyc2VyID0gYW55T2YoZGlnaXRzKTtcblxuICAgICAgICBleHBlY3QoaXNQYXJzZXIoZGlnaXRzUGFyc2VyKSkudG8uYmUudHJ1ZTtcbiAgICAgICAgbGV0IHBhcnNpbmdDaG9pY2UgPSBkaWdpdHNQYXJzZXIucnVuKHRleHQoJzEnKSk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UudmFsdWVbMF0pLnRvLmJlLmVxbCgnMScpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS52YWx1ZVsxXS5yZXN0KCkpLnRvLmJlLmVxbCgnJyk7XG4gICAgICAgIHBhcnNpbmdDaG9pY2UgPSBkaWdpdHNQYXJzZXIucnVuKHRleHQoJzMnKSk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UudmFsdWVbMF0pLnRvLmJlLmVxbCgnMycpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS52YWx1ZVsxXS5yZXN0KCkpLnRvLmJlLmVxbCgnJyk7XG4gICAgICAgIHBhcnNpbmdDaG9pY2UgPSBkaWdpdHNQYXJzZXIucnVuKHRleHQoJzAnKSk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UudmFsdWVbMF0pLnRvLmJlLmVxbCgnMCcpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS52YWx1ZVsxXS5yZXN0KCkpLnRvLmJlLmVxbCgnJyk7XG4gICAgICAgIHBhcnNpbmdDaG9pY2UgPSBkaWdpdHNQYXJzZXIucnVuKHRleHQoJzgnKSk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UudmFsdWVbMF0pLnRvLmJlLmVxbCgnOCcpO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS52YWx1ZVsxXS5yZXN0KCkpLnRvLmJlLmVxbCgnJyk7XG5cbiAgICAgICAgcGFyc2luZ0Nob2ljZSA9IGRpZ2l0c1BhcnNlci5ydW4odGV4dCgncycpKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UuaXNGYWlsdXJlKS50by5iZS50cnVlO1xuICAgICAgICBleHBlY3QocGFyc2luZ0Nob2ljZS52YWx1ZVswXSkudG8uYmUuZXFsKCdhbnlPZiAwMTIzNDU2Nzg5Jyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nQ2hvaWNlLnZhbHVlWzFdKS50by5iZS5lcWwoJ2ZhaWwnKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmdDaG9pY2UudmFsdWVbMl0ucmVzdCgpKS50by5iZS5lcWwoJ3MnKTtcbiAgICB9KTtcblxuICAgIGl0KCd3aWxsIGZhaWwgaWYgdGhlIGlucHV0IGlzIHRvbyBzaG9ydCcsICgpID0+IHtcbiAgICAgICAgZXhwZWN0KGFueU9mKGxvd2VyY2FzZXMpLnJ1bih0ZXh0KCcnKSkuaXNGYWlsdXJlKS50by5iZS50cnVlO1xuICAgICAgICBleHBlY3QoYW55T2YoZGlnaXRzKS5ydW4odGV4dCgnJykpLmlzRmFpbHVyZSkudG8uYmUudHJ1ZTtcbiAgICB9KTtcbn0pO1xuXG5kZXNjcmliZSgncGFyc2VycyB0aGF0IGNvbnNpZGVyIHByZWNlZGVuY2VzJywgKCkgPT4ge1xuXG4gIGRlc2NyaWJlKCdjYW4gcGFyc2UgWCBwcmVjZWRlZCBieSBZJywgKCkgPT4ge1xuICAgIGNvbnN0IFhhZnRlclkgPSBwcmVjZWRlZEJ5UCgnWScsICdYJyk7XG4gICAgaXQoJ2V2ZW4gaWYgWSBoYXMgYmVlbiBjb25zdW1lZCBieSB0aGUgcGFyc2VyIGJlZm9yZScsICgpID0+IHtcbiAgICAgIGNvbnN0IFlYcCA9IG1hbnkxKGNob2ljZShbcGNoYXIoJ1knKSwgWGFmdGVyWV0pKTtcbiAgICAgIGNvbnN0IHBhcnNpbmdZWCA9IFlYcC5ydW4odGV4dCgnWVgnKSk7XG4gICAgICBleHBlY3QocGFyc2luZ1lYLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcbiAgICAgIGV4cGVjdChwYXJzaW5nWVgudG9TdHJpbmcoKSkudG8uYmUuZXFsKCdWYWxpZGF0aW9uLlN1Y2Nlc3MoW1tZLFhdLHJvdz0xO2NvbD0wO3Jlc3Q9XSknKVxuICAgIH0pO1xuICAgIGl0KCdhbmQgaGFsdCB3aGVuIFggaXMgbm90IHByZWNlZGVkIGJ5IFknLCAoKSA9PiB7XG4gICAgICBjb25zdCBBWHAgPSBtYW55MShjaG9pY2UoW3BjaGFyKCdBJyksIFhhZnRlclldKSk7XG4gICAgICBjb25zdCBwYXJzaW5nQVggPSBBWHAucnVuKHRleHQoJ0FYJykpO1xuICAgICAgZXhwZWN0KHBhcnNpbmdBWC5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgICBleHBlY3QocGFyc2luZ0FYLnZhbHVlWzFdLnJlc3QoKSkudG8uYmUuZXFsKCdYJyk7XG4gICAgfSk7XG4gICAgaXQoJ2FuZCBmYWlsIHdoZW4gWCBpcyBhdCB0aGUgc3RhcnQgb2YgdGhlIHN0cmluZycsICgpID0+IHtcbiAgICAgIGNvbnN0IEFYcCA9IG1hbnkxKGNob2ljZShbcGNoYXIoJ0EnKSwgWGFmdGVyWV0pKTtcbiAgICAgIGNvbnN0IHBhcnNpbmdBWCA9IEFYcC5ydW4odGV4dCgnWEEnKSk7XG4gICAgICBleHBlY3QocGFyc2luZ0FYLmlzRmFpbHVyZSkudG8uYmUudHJ1ZTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgZGVzY3JpYmUoJ2NhbiBwYXJzZSBYIG5vdCBwcmVjZWRlZCBieSBZJywgKCkgPT4ge1xuICAgIGNvbnN0IFhub3RBZnRlclkgPSBub3RQcmVjZWRlZEJ5UCgnWScsICdYJyk7XG5cbiAgICBpdCgnZXZlbiBpZiB0aGUgcHJldmlvdXMgY2hhciBoYXMgYmVlbiBjb25zdW1lZCBieSB0aGUgcGFyc2VyIGJlZm9yZScsICgpID0+IHtcbiAgICAgIGNvbnN0IEFYcCA9IG1hbnkxKGNob2ljZShbcGNoYXIoJ0EnKSwgWG5vdEFmdGVyWV0pKTtcbiAgICAgIGNvbnN0IHBhcnNpbmdBWCA9IEFYcC5ydW4odGV4dCgnQVgnKSk7XG4gICAgICBleHBlY3QocGFyc2luZ0FYLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcbiAgICAgIGV4cGVjdChwYXJzaW5nQVgudG9TdHJpbmcoKSkudG8uYmUuZXFsKCdWYWxpZGF0aW9uLlN1Y2Nlc3MoW1tBLFhdLHJvdz0xO2NvbD0wO3Jlc3Q9XSknKVxuICAgIH0pO1xuICAgIGl0KCdhbmQgaGFsdCB3aGVuIFggaXMgdGhlIGZpcnN0IGNoYXIgaW4gdGhlIHN0cmluZycsICgpID0+IHtcbiAgICAgIGNvbnN0IEFYcCA9IG1hbnkxKGNob2ljZShbcGNoYXIoJ0EnKSwgWG5vdEFmdGVyWV0pKTtcbiAgICAgIGNvbnN0IHBhcnNpbmdBWCA9IEFYcC5ydW4odGV4dCgnWEEnKSk7XG4gICAgICBleHBlY3QocGFyc2luZ0FYLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcbiAgICAgIGV4cGVjdChwYXJzaW5nQVgudG9TdHJpbmcoKSkudG8uYmUuZXFsKCdWYWxpZGF0aW9uLlN1Y2Nlc3MoW1tYLEFdLHJvdz0xO2NvbD0wO3Jlc3Q9XSknKVxuICAgIH0pO1xuICAgIGl0KCdhbmQgaGFsdCB3aGVuIFggaXMgcHJlY2VkZWQgYnkgWScsICgpID0+IHtcbiAgICAgIGNvbnN0IFlYcCA9IG1hbnkxKGNob2ljZShbcGNoYXIoJ1knKSwgWG5vdEFmdGVyWV0pKTtcbiAgICAgIGNvbnN0IHBhcnNpbmdZWCA9IFlYcC5ydW4odGV4dCgnWVgnKSk7XG4gICAgICBleHBlY3QocGFyc2luZ1lYLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcbiAgICAgIGV4cGVjdChwYXJzaW5nWVgudmFsdWVbMV0ucmVzdCgpKS50by5iZS5lcWwoJ1gnKTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgZGVzY3JpYmUoJ2NhbiBwYXJzZSBYIGZvbGxvd2VkIGJ5IFknLCAoKSA9PiB7XG4gICAgY29uc3QgWGJlZm9yZVkgPSBmb2xsb3dlZEJ5UCgnWScsICdYJyk7XG4gICAgaXQoJ3dpdGhvdXQgY29uc3VtaW5nIHRoZSBjaGFyYWN0ZXInLCAoKSA9PiB7XG4gICAgICBjb25zdCBYWXAgPSBtYW55MShjaG9pY2UoW1hiZWZvcmVZLCBwY2hhcignWScpXSkpO1xuICAgICAgY29uc3QgcGFyc2luZ1hZID0gWFlwLnJ1bih0ZXh0KCdYWScpKTtcbiAgICAgIGV4cGVjdChwYXJzaW5nWFkuaXNTdWNjZXNzKS50by5iZS50cnVlO1xuICAgICAgZXhwZWN0KHBhcnNpbmdYWS50b1N0cmluZygpKS50by5iZS5lcWwoJ1ZhbGlkYXRpb24uU3VjY2VzcyhbW1gsWV0scm93PTE7Y29sPTA7cmVzdD1dKScpXG4gICAgfSk7XG4gICAgaXQoJ2FuZCBmYWlsIHdoZW4gWCBpcyBub3QgZm9sbG93ZWQgYnkgWScsICgpID0+IHtcbiAgICAgIGNvbnN0IFhBcCA9IG1hbnkxKGNob2ljZShbWGJlZm9yZVksIHBjaGFyKCdBJyldKSk7XG4gICAgICBjb25zdCBwYXJzaW5nWEEgPSBYQXAucnVuKHRleHQoJ1hBJykpO1xuICAgICAgZXhwZWN0KHBhcnNpbmdYQS5pc0ZhaWx1cmUpLnRvLmJlLnRydWU7XG4gICAgICAvLyBleHBlY3QocGFyc2luZ1hBLnZhbHVlWzFdLnJlc3QoKSkudG8uYmUuZXFsKCdYJyk7XG4gICAgfSk7XG4gICAgaXQoJ2FuZCBmYWlsIHdoZW4gWCBpcyBhdCB0aGUgZW5kIG9mIHRoZSBzdHJpbmcnLCAoKSA9PiB7XG4gICAgICBjb25zdCBBWHAgPSBtYW55MShjaG9pY2UoW3BjaGFyKCdBJyksIFhiZWZvcmVZXSkpO1xuICAgICAgY29uc3QgcGFyc2luZ0FYID0gQVhwLnJ1bih0ZXh0KCdBWCcpKTtcbiAgICAgIGV4cGVjdChwYXJzaW5nQVguaXNTdWNjZXNzKS50by5iZS50cnVlO1xuICAgICAgZXhwZWN0KHBhcnNpbmdBWC52YWx1ZVsxXS5yZXN0KCkpLnRvLmJlLmVxbCgnWCcpO1xuICAgIH0pO1xuICB9KTtcblxuICBkZXNjcmliZSgnY2FuIHBhcnNlIFggbm90IGZvbGxvd2VkIGJ5IFknLCAoKSA9PiB7XG4gICAgY29uc3QgWG5vdEJlZm9yZVkgPSBub3RGb2xsb3dlZEJ5UCgnWScsICdYJyk7XG5cbiAgICBpdCgnd2l0aG91dCBjb25zdW1pbmcgdGhlIGNoYXJhY3RlcicsICgpID0+IHtcbiAgICAgIGNvbnN0IFhBcCA9IG1hbnkxKGNob2ljZShbWG5vdEJlZm9yZVksIHBjaGFyKCdBJyldKSk7XG4gICAgICBjb25zdCBwYXJzaW5nWEEgPSBYQXAucnVuKHRleHQoJ1hBJykpO1xuICAgICAgZXhwZWN0KHBhcnNpbmdYQS5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgICBleHBlY3QocGFyc2luZ1hBLnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgnVmFsaWRhdGlvbi5TdWNjZXNzKFtbWCxBXSxyb3c9MTtjb2w9MDtyZXN0PV0pJylcbiAgICB9KTtcbiAgICBpdCgnYW5kIHN1Y2NlZWQgd2hlbiBYIGlzIHRoZSBsYXN0IGNoYXIgaW4gdGhlIHN0cmluZycsICgpID0+IHtcbiAgICAgIGNvbnN0IEFYcCA9IG1hbnkxKGNob2ljZShbcGNoYXIoJ0EnKSwgWG5vdEJlZm9yZVldKSk7XG4gICAgICBjb25zdCBwYXJzaW5nQVggPSBBWHAucnVuKHRleHQoJ0FYJykpO1xuICAgICAgZXhwZWN0KHBhcnNpbmdBWC5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgICBleHBlY3QocGFyc2luZ0FYLnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgnVmFsaWRhdGlvbi5TdWNjZXNzKFtbQSxYXSxyb3c9MTtjb2w9MDtyZXN0PV0pJylcbiAgICB9KTtcbiAgICBpdCgnYW5kIGhhbHQgd2hlbiBYIGlzIGZvbGxvd2VkIGJ5IFknLCAoKSA9PiB7XG4gICAgICBjb25zdCBBWFlwID0gbWFueTEoY2hvaWNlKFtwY2hhcignQScpLCBYbm90QmVmb3JlWV0pKTtcbiAgICAgIGNvbnN0IHBhcnNpbmdBWFkgPSBBWFlwLnJ1bih0ZXh0KCdBWFknKSk7XG4gICAgICBleHBlY3QocGFyc2luZ0FYWS5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgICBleHBlY3QocGFyc2luZ0FYWS52YWx1ZVsxXS5yZXN0KCkpLnRvLmJlLmVxbCgnWFknKTtcbiAgICB9KTtcbiAgfSk7XG59KTtcblxuZGVzY3JpYmUoJ2EgcGFyc2VyIGZvciBhYmMnLCAoKSA9PiB7XG4gICAgaXQoJ3BhcnNlcyBhYmMnLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHBhaXJBZGRlciA9IChbeCwgeV0pID0+IHggKyB5O1xuICAgICAgICBjb25zdCBhYmNQID0gYW5kVGhlbihcbiAgICAgICAgICAgIHBjaGFyKCdhJyksXG4gICAgICAgICAgICBhbmRUaGVuKFxuICAgICAgICAgICAgICAgIHBjaGFyKCdiJyksXG4gICAgICAgICAgICAgICAgYW5kVGhlbihcbiAgICAgICAgICAgICAgICAgICAgcGNoYXIoJ2MnKSxcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuUCgnJylcbiAgICAgICAgICAgICAgICApLmZtYXAocGFpckFkZGVyKVxuICAgICAgICAgICAgKS5mbWFwKHBhaXJBZGRlcilcbiAgICAgICAgKS5mbWFwKHBhaXJBZGRlcik7XG4gICAgICAgIGNvbnN0IHBhcnNpbmcgPSBhYmNQLnJ1bignYWJjZCcpO1xuICAgICAgICBleHBlY3QocGFyc2luZy5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLnZhbHVlWzBdLnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgnYWJjJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLnZhbHVlWzFdLnJlc3QoKSkudG8uYmUuZXFsKCdkJyk7XG4gICAgfSk7XG4gICAgaXQoJ3BhcnNlcyBhYmMgd2l0aCBhIGRpZmZlcmVudCwgYnV0IHN0aWxsIHZlcnkgY2x1bXN5IHN5bnRheCcsICgpID0+IHtcbiAgICAgICAgY29uc3QgcGFpckFkZGVyID0gKFt4LCB5XSkgPT4geCArIHk7XG4gICAgICAgIGNvbnN0IGFiY1AgPSAoKHBjaGFyKCdhJykuYW5kVGhlbihwY2hhcignYicpKSkuZm1hcChwYWlyQWRkZXIpLmFuZFRoZW4ocGNoYXIoJ2MnKSkpLmZtYXAocGFpckFkZGVyKTtcbiAgICAgICAgY29uc3QgcGFyc2luZyA9IGFiY1AucnVuKCdhYmNkJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcudmFsdWVbMF0udG9TdHJpbmcoKSkudG8uYmUuZXFsKCdhYmMnKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcudmFsdWVbMV0ucmVzdCgpKS50by5iZS5lcWwoJ2QnKTtcbiAgICB9KTtcbn0pO1xuXG5kZXNjcmliZSgncGFyc2UgMyBkaWdpdHMnLCAoKSA9PiB7XG4gICAgbGV0IHBhcnNlRGlnaXQsIHRocmVlRGlnaXRzLCBwYXJzaW5nO1xuXG4gICAgYmVmb3JlKCgpID0+IHtcbiAgICAgICAgcGFyc2VEaWdpdCA9IGFueU9mKGRpZ2l0cyk7XG4gICAgICAgIHRocmVlRGlnaXRzID0gYW5kVGhlbihwYXJzZURpZ2l0LCBhbmRUaGVuKHBhcnNlRGlnaXQsIHBhcnNlRGlnaXQpKTtcbiAgICAgICAgcGFyc2luZyA9IHRocmVlRGlnaXRzLnJ1bignMTIzJyk7XG4gICAgfSk7XG4gICAgaXQoJ3BhcnNlcyBhbnkgb2YgdGhyZWUgZGlnaXRzJywgKCkgPT4ge1xuICAgICAgICBleHBlY3QocGFyc2luZy5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLnZhbHVlWzBdLnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgnWzEsWzIsM11dJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLnZhbHVlWzFdLnJlc3QoKSkudG8uYmUuZXFsKCcnKTtcbiAgICB9KTtcbiAgICBkZXNjcmliZSgncGFyc2VzIGFueSBvZiB0aHJlZSBkaWdpdHMgd2hpbGUgc2hvd2Nhc2luZyBmbWFwJywgKCkgPT4ge1xuICAgICAgICBjb25zdCB1bnBhY2tlciA9IChbeCwgW3ksIHpdXSkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIFt4LCB5LCB6XTtcbiAgICAgICAgfTtcbiAgICAgICAgaXQoJ2FzIGdsb2JhbCBtZXRob2QnLCAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCB0aHJlZURpZ2l0c0ltcGwgPSBmbWFwKHVucGFja2VyLCB0aHJlZURpZ2l0cyk7XG4gICAgICAgICAgICBsZXQgcGFyc2luZyA9IHRocmVlRGlnaXRzSW1wbC5ydW4oJzEyMycpO1xuICAgICAgICAgICAgZXhwZWN0KHBhcnNpbmcuaXNTdWNjZXNzKS50by5iZS50cnVlO1xuICAgICAgICAgICAgZXhwZWN0KHBhcnNpbmcudmFsdWVbMF0udG9TdHJpbmcoKSkudG8uYmUuZXFsKCdbMSwyLDNdJyk7XG4gICAgICAgICAgICBleHBlY3QocGFyc2luZy52YWx1ZVsxXS5yZXN0KCkpLnRvLmJlLmVxbCgnJyk7XG4gICAgICAgIH0pO1xuICAgICAgICBpdCgnYXMgaW5zdGFuY2UgbWV0aG9kJywgKCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgdGhyZWVEaWdpdHNJbnN0ID0gdGhyZWVEaWdpdHMuZm1hcCh1bnBhY2tlcik7XG4gICAgICAgICAgICBsZXQgcGFyc2luZyA9IHRocmVlRGlnaXRzSW5zdC5ydW4oJzEyMycpO1xuICAgICAgICAgICAgZXhwZWN0KHBhcnNpbmcuaXNTdWNjZXNzKS50by5iZS50cnVlO1xuICAgICAgICAgICAgZXhwZWN0KHBhcnNpbmcudmFsdWVbMF0udG9TdHJpbmcoKSkudG8uYmUuZXFsKCdbMSwyLDNdJyk7XG4gICAgICAgICAgICBleHBlY3QocGFyc2luZy52YWx1ZVsxXS5yZXN0KCkpLnRvLmJlLmVxbCgnJyk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xufSk7XG5cbmRlc2NyaWJlKCdsaWZ0MiBmb3IgcGFyc2VycycsICgpID0+IHtcbiAgICBpdCgnb3BlcmF0ZXMgb24gdGhlIHJlc3VsdHMgb2YgdHdvIHN0cmluZyBwYXJzaW5ncycsICgpID0+IHtcbiAgICAgICAgY29uc3QgYWRkU3RyaW5ncyA9IHggPT4geSA9PiB4ICsgJysnICsgeTtcbiAgICAgICAgY29uc3QgQXBsdXNCID0gbGlmdDIoYWRkU3RyaW5ncykocGNoYXIoJ2EnKSkocGNoYXIoJ2InKSk7XG4gICAgICAgIGV4cGVjdChBcGx1c0IucnVuKCdhYmMnKS50b1N0cmluZygpKS50by5iZS5lcWwoJ1ZhbGlkYXRpb24uU3VjY2VzcyhbYStiLHJvdz0wO2NvbD0yO3Jlc3Q9Y10pJyk7XG4gICAgfSk7XG4gICAgaXQoJ2FkZHMgdGhlIHJlc3VsdHMgb2YgdHdvIGRpZ2l0IHBhcnNpbmdzJywgKCkgPT4ge1xuICAgICAgICBjb25zdCBhZGREaWdpdHMgPSB4ID0+IHkgPT4geCArIHk7XG4gICAgICAgIGNvbnN0IGFkZFBhcnNlciA9IGxpZnQyKGFkZERpZ2l0cykocGRpZ2l0KDEpKShwZGlnaXQoMikpO1xuICAgICAgICBleHBlY3QoYWRkUGFyc2VyLnJ1bignMTIzNCcpLnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgnVmFsaWRhdGlvbi5TdWNjZXNzKFszLHJvdz0wO2NvbD0yO3Jlc3Q9MzRdKScpO1xuICAgICAgICBleHBlY3QoYWRkUGFyc2VyLnJ1bignMTQ0JykuaXNGYWlsdXJlKS50by5iZS50cnVlO1xuICAgIH0pO1xufSk7XG5cbmRlc2NyaWJlKCdzZXF1ZW5jZXMgb2YgcGFyc2VycyBiYXNlZCBvbiBhbmRUaGVuICYmIGZtYXAgKGFrYSBzZXF1ZW5jZVAyKScsICgpID0+IHtcbiAgICBpdCgnc3RvcmUgbWF0Y2hlZCBjaGFycyBpbnNpZGUgYSBwbGFpbiBzdHJpbmcnLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IGFiY1BhcnNlciA9IHNlcXVlbmNlUDIoW3BjaGFyKCdhJyksIHBjaGFyKCdiJyksIHBjaGFyKCdjJyksXSk7XG4gICAgICAgIGV4cGVjdChhYmNQYXJzZXIucnVuKCdhYmMnKS50b1N0cmluZygpKVxuICAgICAgICAgICAgLnRvLmJlLmVxbCgnVmFsaWRhdGlvbi5TdWNjZXNzKFthYmMscm93PTE7Y29sPTA7cmVzdD1dKScpO1xuICAgIH0pO1xufSk7XG5cbmRlc2NyaWJlKCdzZXF1ZW5jZXMgb2YgcGFyc2VycyBiYXNlZCBvbiBsaWZ0Mihjb25zKSAoYWthIHNlcXVlbmNlUCknLCAoKSA9PiB7XG4gICAgaXQoJ3N0b3JlcyBtYXRjaGVkIGNoYXJzIGluc2lkZSBhbiBhcnJheScsICgpID0+IHtcbiAgICAgICAgY29uc3QgYWJjUGFyc2VyID0gc2VxdWVuY2VQKFtwY2hhcignYScpLCBwY2hhcignYicpLCBwY2hhcignYycpLF0pO1xuICAgICAgICBleHBlY3QoYWJjUGFyc2VyLnJ1bignYWJjJykudG9TdHJpbmcoKSlcbiAgICAgICAgICAgIC50by5iZS5lcWwoJ1ZhbGlkYXRpb24uU3VjY2VzcyhbW2EsYixjXSxyb3c9MTtjb2w9MDtyZXN0PV0pJyk7XG4gICAgfSk7XG59KTtcblxuZGVzY3JpYmUoJ2EgcGFyc2VyIGZvciBhIHNwZWNpZmljIHNlcXVlbmNlIG9mIGNoYXJzJywgKCkgPT4ge1xuICAgIGl0KCdpcyBlYXN5IHRvIGNyZWF0ZSB3aXRoIHNlcXVlbmNlUCcsICgpID0+IHtcbiAgICAgICAgY29uc3QgbWFyY29QYXJzZXIgPSBwc3RyaW5nKCdtYXJjbycpO1xuICAgICAgICBjb25zdCBtYXJjb1BhcnNpbmcgPSBtYXJjb1BhcnNlci5ydW4oJ21hcmNvY2lhbycpO1xuICAgICAgICBleHBlY3QobWFyY29QYXJzaW5nLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KG1hcmNvUGFyc2luZy50b1N0cmluZygpKVxuICAgICAgICAgICAgLnRvLmJlLmVxbCgnVmFsaWRhdGlvbi5TdWNjZXNzKFtbbSxhLHIsYyxvXSxyb3c9MDtjb2w9NTtyZXN0PWNpYW9dKScpO1xuICAgIH0pO1xuICAgIGl0KCdoYXMgYSB2ZXJzaW9uIHRoYXQgcmV0dXJucyBzdHJpbmdzJywgKCkgPT4ge1xuICAgICAgICBjb25zdCBtYXJjb1BhcnNlciA9IHN0cmluZ1AoJ21hcmNvJyk7XG4gICAgICAgIGNvbnN0IG1hcmNvUGFyc2luZyA9IG1hcmNvUGFyc2VyLnJ1bignbWFyY29jaWFvJyk7XG4gICAgICAgIGV4cGVjdChtYXJjb1BhcnNpbmcuaXNTdWNjZXNzKS50by5iZS50cnVlO1xuICAgICAgICBleHBlY3QobWFyY29QYXJzaW5nLnRvU3RyaW5nKCkpXG4gICAgICAgICAgICAudG8uYmUuZXFsKCdWYWxpZGF0aW9uLlN1Y2Nlc3MoW21hcmNvLHJvdz0wO2NvbD01O3Jlc3Q9Y2lhb10pJyk7XG4gICAgfSk7XG59KTtcblxuZGVzY3JpYmUoJ2EgdHJpbW1lciBvZiBwYXJzZXJzJywgKCkgPT4ge1xuICAgIGl0KCdjYW4gaWdub3JlIHdoaXRlc3BhY2VzIGFyb3VuZCBhIHNpbmdsZSBjaGFyJywgKCkgPT4ge1xuICAgICAgICBjb25zdCB0cmltbWVyID0gdHJpbVAocGNoYXIoJ2EnKSk7XG4gICAgICAgIGV4cGVjdCh0cmltbWVyLnJ1bignICBhICAgICcpLnRvU3RyaW5nKCkpXG4gICAgICAgICAgICAudG8uYmUuZXFsKCdWYWxpZGF0aW9uLlN1Y2Nlc3MoW2Escm93PTE7Y29sPTA7cmVzdD1dKScpO1xuICAgIH0pO1xuICAgIGl0KCdjYW4gaWdub3JlIHdoaXRlc3BhY2VzIGFyb3VuZCBhIHNlcXVlbmNlIG9mIHR3byBjaGFycycsICgpID0+IHtcbiAgICAgICAgY29uc3QgdHJpbW1lciA9IHRyaW1QKHBjaGFyKCdhJykuYW5kVGhlbihwY2hhcignYicpKSk7XG4gICAgICAgIGV4cGVjdCh0cmltbWVyLnJ1bignICBhYiAgICAnKS50b1N0cmluZygpKVxuICAgICAgICAgICAgLnRvLmJlLmVxbCgnVmFsaWRhdGlvbi5TdWNjZXNzKFtbYSxiXSxyb3c9MTtjb2w9MDtyZXN0PV0pJyk7XG4gICAgfSk7XG59KTtcblxuZGVzY3JpYmUoJ2EgcGFyc2VyIGZvciBhIHNwZWNpZmljIHdvcmQnLCAoKSA9PiB7XG4gICAgaXQoJ2RldGVjdHMgYW5kIGlnbm9yZXMgd2hpdGVzcGFjZXMgYXJvdW5kIGl0JywgKCkgPT4ge1xuICAgICAgICBjb25zdCBtYXJjb1BhcnNlciA9IHB3b3JkKCdtYXJjbycpO1xuICAgICAgICBjb25zdCBtYXJjb1BhcnNpbmcgPSBtYXJjb1BhcnNlci5ydW4oJyAgbWFyY28gY2lhbycpO1xuICAgICAgICBleHBlY3QobWFyY29QYXJzaW5nLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KG1hcmNvUGFyc2luZy50b1N0cmluZygpKVxuICAgICAgICAgICAgLnRvLmJlLmVxbCgnVmFsaWRhdGlvbi5TdWNjZXNzKFtbbSxhLHIsYyxvXSxyb3c9MDtjb2w9ODtyZXN0PWNpYW9dKScpO1xuICAgIH0pO1xuICAgIGl0KCdoYXMgbm8gcHJvYmxlbSBpZiB0aGUgd2hpdGVzcGFjZXMgYXJlblxcJ3QgdGhlcmUnLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IG1hcmNvUGFyc2VyID0gcHdvcmQoJ21hcmNvJyk7XG4gICAgICAgIGNvbnN0IG1hcmNvUGFyc2luZyA9IG1hcmNvUGFyc2VyLnJ1bignbWFyY29jaWFvJyk7XG4gICAgICAgIGV4cGVjdChtYXJjb1BhcnNpbmcuaXNTdWNjZXNzKS50by5iZS50cnVlO1xuICAgICAgICBleHBlY3QobWFyY29QYXJzaW5nLnRvU3RyaW5nKCkpXG4gICAgICAgICAgICAudG8uYmUuZXFsKCdWYWxpZGF0aW9uLlN1Y2Nlc3MoW1ttLGEscixjLG9dLHJvdz0wO2NvbD01O3Jlc3Q9Y2lhb10pJyk7XG4gICAgfSk7XG59KTtcblxuZGVzY3JpYmUoJ2EgcGFyc2luZyBmdW5jdGlvbiBmb3IgemVybyBvciBtb3JlIG9jY3VycmVuY2VzJywgKCkgPT4ge1xuICAgIGl0KCdjYW4gcGFyc2UgYSBjaGFyIHplcm8gdGltZXMnLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHplcm9Pck1vcmVQYXJzaW5nRnVuY3Rpb24gPSB6ZXJvT3JNb3JlKHBjaGFyKCdtJykpO1xuICAgICAgICBsZXQgcGFyc2luZyA9IHplcm9Pck1vcmVQYXJzaW5nRnVuY3Rpb24odGV4dCgnYXJjbycpKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcuaXNTdWNjZXNzKS50by5iZS50cnVlO1xuICAgICAgICBleHBlY3QocGFyc2luZy50b1N0cmluZygpKS50by5iZS5lcWwoJ1ZhbGlkYXRpb24uU3VjY2VzcyhbW10scm93PTA7Y29sPTA7cmVzdD1hcmNvXSknKTtcbiAgICB9KTtcbiAgICBpdCgnY2FuIHBhcnNlIGEgY2hhciBtYW55IHRpbWVzJywgKCkgPT4ge1xuICAgICAgICBjb25zdCB6ZXJvT3JNb3JlUGFyc2luZ0Z1bmN0aW9uID0gemVyb09yTW9yZShwY2hhcignbScpKTtcbiAgICAgICAgbGV0IHBhcnNpbmcgPSB6ZXJvT3JNb3JlUGFyc2luZ0Z1bmN0aW9uKHRleHQoJ21tbWFyY28nKSk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcudG9TdHJpbmcoKSkudG8uYmUuZXFsKCdWYWxpZGF0aW9uLlN1Y2Nlc3MoW1ttLG0sbV0scm93PTA7Y29sPTM7cmVzdD1hcmNvXSknKTtcbiAgICB9KTtcbiAgICBpdCgnY2FuIHBhcnNlIGEgY2hhciBzZXF1ZW5jZSB6ZXJvIHRpbWVzJywgKCkgPT4ge1xuICAgICAgICBjb25zdCB6ZXJvT3JNb3JlUGFyc2luZ0Z1bmN0aW9uID0gemVyb09yTW9yZShwc3RyaW5nKCdtYXJjbycpKTtcbiAgICAgICAgbGV0IHBhcnNpbmcgPSB6ZXJvT3JNb3JlUGFyc2luZ0Z1bmN0aW9uKHRleHQoJ3htYXJjb21hcmNvY2lhbycpKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcuaXNTdWNjZXNzKS50by5iZS50cnVlO1xuICAgICAgICBleHBlY3QocGFyc2luZy50b1N0cmluZygpKS50by5iZS5lcWwoJ1ZhbGlkYXRpb24uU3VjY2VzcyhbW10scm93PTA7Y29sPTA7cmVzdD14bWFyY29tYXJjb2NpYW9dKScpO1xuICAgIH0pO1xuICAgIGl0KCdjYW4gcGFyc2UgYSBjaGFyIHNlcXVlbmNlIG1hbnkgdGltZXMnLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHplcm9Pck1vcmVQYXJzaW5nRnVuY3Rpb24gPSB6ZXJvT3JNb3JlKHBzdHJpbmcoJ21hcmNvJykpO1xuICAgICAgICBsZXQgcGFyc2luZyA9IHplcm9Pck1vcmVQYXJzaW5nRnVuY3Rpb24odGV4dCgnbWFyY29tYXJjb2NpYW8nKSk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcudG9TdHJpbmcoKSlcbiAgICAgICAgICAgIC50by5iZS5lcWwoJ1ZhbGlkYXRpb24uU3VjY2VzcyhbW1ttLGEscixjLG9dLFttLGEscixjLG9dXSxyb3c9MDtjb2w9MTA7cmVzdD1jaWFvXSknKTtcbiAgICB9KTtcbn0pO1xuXG5kZXNjcmliZSgnYSBwYXJzZXIgZm9yIHplcm8gb3IgbW9yZSBvY2N1cnJlbmNlcycsICgpID0+IHtcbiAgICBpdCgnY2FuIHBhcnNlIGEgY2hhciB6ZXJvIHRpbWVzJywgKCkgPT4ge1xuICAgICAgICBjb25zdCB6ZXJvT3JNb3JlUGFyc2VyID0gbWFueShwY2hhcignbScpKTtcbiAgICAgICAgbGV0IHBhcnNpbmcgPSB6ZXJvT3JNb3JlUGFyc2VyLnJ1bih0ZXh0KCdhcmNvJykpO1xuICAgICAgICBleHBlY3QocGFyc2luZy5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgnVmFsaWRhdGlvbi5TdWNjZXNzKFtbXSxyb3c9MDtjb2w9MDtyZXN0PWFyY29dKScpO1xuICAgIH0pO1xuICAgIGl0KCdjYW4gcGFyc2UgYSBjaGFyIG1hbnkgdGltZXMgYW5kIHJldHVybiBhbiBhcnJheScsICgpID0+IHtcbiAgICAgICAgY29uc3QgemVyb09yTW9yZVBhcnNlciA9IG1hbnkocGNoYXIoJ20nKSk7XG4gICAgICAgIGxldCBwYXJzaW5nID0gemVyb09yTW9yZVBhcnNlci5ydW4odGV4dCgnbW1tYXJjbycpKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcuaXNTdWNjZXNzKS50by5iZS50cnVlO1xuICAgICAgICBleHBlY3QocGFyc2luZy50b1N0cmluZygpKS50by5iZS5lcWwoJ1ZhbGlkYXRpb24uU3VjY2VzcyhbW20sbSxtXSxyb3c9MDtjb2w9MztyZXN0PWFyY29dKScpO1xuICAgIH0pO1xuICAgIGl0KCdjYW4gcGFyc2UgYSBjaGFyIGV4YWN0bHkgbiB0aW1lcyBhbmQgcmV0dXJuIGFuIGFycmF5IChvciBmYWlsKScsICgpID0+IHtcbiAgICAgICAgY29uc3QgZXhhY3RseVRocmVlID0gbWFueShwY2hhcignbScpLCAzKTtcbiAgICAgICAgbGV0IHBhcnNpbmcgPSBleGFjdGx5VGhyZWUucnVuKHRleHQoJ21tbWFyY28nKSk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcudG9TdHJpbmcoKSkudG8uYmUuZXFsKCdWYWxpZGF0aW9uLlN1Y2Nlc3MoW1ttLG0sbV0scm93PTA7Y29sPTM7cmVzdD1hcmNvXSknKTtcbiAgICAgICAgcGFyc2luZyA9IGV4YWN0bHlUaHJlZS5ydW4odGV4dCgnbW1tbWFyY28nKSk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLmlzRmFpbHVyZSkudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcudG9TdHJpbmcoKSkudG8uYmUuZXFsKCdWYWxpZGF0aW9uLkZhaWx1cmUoW21hbnkgcGNoYXJfbSB0aW1lcz0zLHRpbWVzIHBhcmFtIHdhbnRlZCAzOyBnb3QgNCxyb3c9MDtjb2w9MDtyZXN0PW1tbW1hcmNvXSknKTtcbiAgICB9KTtcbiAgICBpdCgnY2FuIHBhcnNlIGEgY2hhciBtYW55IHRpbWVzIGFuZCByZXR1cm4gYSBzdHJpbmcnLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHplcm9Pck1vcmVQYXJzZXIgPSBtYW55Q2hhcnMocGNoYXIoJ20nKSk7XG4gICAgICAgIGxldCBwYXJzaW5nID0gemVyb09yTW9yZVBhcnNlci5ydW4odGV4dCgnbW1tYXJjbycpKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcuaXNTdWNjZXNzKS50by5iZS50cnVlO1xuICAgICAgICBleHBlY3QocGFyc2luZy50b1N0cmluZygpKS50by5iZS5lcWwoJ1ZhbGlkYXRpb24uU3VjY2VzcyhbbW1tLHJvdz0wO2NvbD0zO3Jlc3Q9YXJjb10pJyk7XG4gICAgfSk7XG4gICAgaXQoJ2NhbiBwYXJzZSBhIGNoYXIgZXhhY3RseSBuIHRpbWVzIGFuZCByZXR1cm4gYSBzdHJpbmcgKG9yIGZhaWwpJywgKCkgPT4ge1xuICAgICAgICBjb25zdCBleGFjdGx5VGhyZWUgPSBtYW55Q2hhcnMocGNoYXIoJ20nKSwgMyk7XG4gICAgICAgIGxldCBwYXJzaW5nID0gZXhhY3RseVRocmVlLnJ1bih0ZXh0KCdtbW1hcmNvJykpO1xuICAgICAgICBleHBlY3QocGFyc2luZy5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgnVmFsaWRhdGlvbi5TdWNjZXNzKFttbW0scm93PTA7Y29sPTM7cmVzdD1hcmNvXSknKTtcbiAgICAgICAgcGFyc2luZyA9IGV4YWN0bHlUaHJlZS5ydW4odGV4dCgnbW1tbWFyY28nKSk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLmlzRmFpbHVyZSkudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcudG9TdHJpbmcoKSkudG8uYmUuZXFsKCdWYWxpZGF0aW9uLkZhaWx1cmUoW21hbnlDaGFycyBwY2hhcl9tIHRpbWVzPTMsdGltZXMgcGFyYW0gd2FudGVkIDM7IGdvdCA0LHJvdz0wO2NvbD0wO3Jlc3Q9bW1tbWFyY29dKScpO1xuICAgIH0pO1xuICAgIGl0KCdjYW4gcGFyc2UgYSBjaGFyIHNlcXVlbmNlIHplcm8gdGltZXMnLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHplcm9Pck1vcmVQYXJzZXIgPSBtYW55KHBzdHJpbmcoJ21hcmNvJykpO1xuICAgICAgICBsZXQgcGFyc2luZyA9IHplcm9Pck1vcmVQYXJzZXIucnVuKHRleHQoJ3htYXJjb21hcmNvY2lhbycpKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcuaXNTdWNjZXNzKS50by5iZS50cnVlO1xuICAgICAgICBleHBlY3QocGFyc2luZy50b1N0cmluZygpKS50by5iZS5lcWwoJ1ZhbGlkYXRpb24uU3VjY2VzcyhbW10scm93PTA7Y29sPTA7cmVzdD14bWFyY29tYXJjb2NpYW9dKScpO1xuICAgIH0pO1xuICAgIGl0KCdjYW4gcGFyc2UgYSBjaGFyIHNlcXVlbmNlIG1hbnkgdGltZXMnLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHplcm9Pck1vcmVQYXJzZXIgPSBtYW55KHBzdHJpbmcoJ21hcmNvJykpO1xuICAgICAgICBsZXQgcGFyc2luZyA9IHplcm9Pck1vcmVQYXJzZXIucnVuKCdtYXJjb21hcmNvY2lhbycpO1xuICAgICAgICBleHBlY3QocGFyc2luZy5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLnRvU3RyaW5nKCkpXG4gICAgICAgICAgICAudG8uYmUuZXFsKCdWYWxpZGF0aW9uLlN1Y2Nlc3MoW1tbbSxhLHIsYyxvXSxbbSxhLHIsYyxvXV0scm93PTA7Y29sPTEwO3Jlc3Q9Y2lhb10pJyk7XG4gICAgfSk7XG4gICAgaXQoJ2NhbiBwYXJzZSB3aGl0ZXNwYWNlcyEhJywgKCkgPT4ge1xuICAgICAgICBjb25zdCB3aGl0ZXNQYXJzZXIgPSBtYW55KGFueU9mKHdoaXRlcykpO1xuICAgICAgICBjb25zdCB0d29Xb3JkcyA9IHNlcXVlbmNlUChbcHN0cmluZygnY2lhbycpLCB3aGl0ZXNQYXJzZXIsIHBzdHJpbmcoJ21hbW1hJyldKTtcbiAgICAgICAgbGV0IHBhcnNpbmcgPSB0d29Xb3Jkcy5ydW4oJ2NpYW9tYW1tYVgnKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcudG9TdHJpbmcoKSlcbiAgICAgICAgICAgIC50by5iZS5lcWwoJ1ZhbGlkYXRpb24uU3VjY2VzcyhbW1tjLGksYSxvXSxbXSxbbSxhLG0sbSxhXV0scm93PTA7Y29sPTk7cmVzdD1YXSknKTtcbiAgICAgICAgcGFyc2luZyA9IHR3b1dvcmRzLnJ1bignY2lhbyBtYW1tYVgnKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcudG9TdHJpbmcoKSlcbiAgICAgICAgICAgIC50by5iZS5lcWwoJ1ZhbGlkYXRpb24uU3VjY2VzcyhbW1tjLGksYSxvXSxbIF0sW20sYSxtLG0sYV1dLHJvdz0wO2NvbD0xMDtyZXN0PVhdKScpO1xuICAgICAgICBwYXJzaW5nID0gdHdvV29yZHMucnVuKCdjaWFvICAgbWFtbWFYJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLnRvU3RyaW5nKCkpXG4gICAgICAgICAgICAudG8uYmUuZXFsKCdWYWxpZGF0aW9uLlN1Y2Nlc3MoW1tbYyxpLGEsb10sWyAsICwgXSxbbSxhLG0sbSxhXV0scm93PTA7Y29sPTEyO3Jlc3Q9WF0pJyk7XG4gICAgICAgIHBhcnNpbmcgPSB0d29Xb3Jkcy5ydW4oJ2NpYW8gXFx0IG1hbW1hWCcpO1xuICAgICAgICBleHBlY3QocGFyc2luZy50b1N0cmluZygpKVxuICAgICAgICAgICAgLnRvLmJlLmVxbCgnVmFsaWRhdGlvbi5TdWNjZXNzKFtbW2MsaSxhLG9dLFsgLFxcdCwgXSxbbSxhLG0sbSxhXV0scm93PTA7Y29sPTEyO3Jlc3Q9WF0pJyk7XG4gICAgfSk7XG59KTtcblxuZGVzY3JpYmUoJ2EgcGFyc2VyIGZvciBvbmUgb3IgbW9yZSBvY2N1cnJlbmNlcycsICgpID0+IHtcbiAgICBpdCgnY2Fubm90IHBhcnNlIGEgY2hhciB6ZXJvIHRpbWVzJywgKCkgPT4ge1xuICAgICAgICBjb25zdCBvbmVPck1vcmVQYXJzZXIgPSBtYW55MShwY2hhcignbScpKTtcbiAgICAgICAgbGV0IHBhcnNpbmcgPSBvbmVPck1vcmVQYXJzZXIucnVuKCdhcmNvJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLmlzRmFpbHVyZSkudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcudG9TdHJpbmcoKSlcbiAgICAgICAgICAgIC50by5iZS5lcWwoJ1ZhbGlkYXRpb24uRmFpbHVyZShbbWFueTEgcGNoYXJfbSx3YW50ZWQgbTsgZ290IGEscm93PTA7Y29sPTA7cmVzdD1hcmNvXSknKTtcbiAgICB9KTtcbiAgICBpdCgnY2FuIHBhcnNlIGEgY2hhciBtYW55IHRpbWVzIGFuZCByZXR1cm4gYW4gYXJyYXknLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IG9uZU9yTW9yZVBhcnNlciA9IG1hbnkxKHBjaGFyKCdtJykpO1xuICAgICAgICBsZXQgcGFyc2luZyA9IG9uZU9yTW9yZVBhcnNlci5ydW4oJ21tbWFyY28nKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcuaXNTdWNjZXNzKS50by5iZS50cnVlO1xuICAgICAgICBleHBlY3QocGFyc2luZy50b1N0cmluZygpKS50by5iZS5lcWwoJ1ZhbGlkYXRpb24uU3VjY2VzcyhbW20sbSxtXSxyb3c9MDtjb2w9MztyZXN0PWFyY29dKScpO1xuICAgIH0pO1xuICAgIGl0KCdjYW4gcGFyc2UgYSBjaGFyIG1hbnkgdGltZXMgYW5kIHJldHVybiBhIHN0cmluZycsICgpID0+IHtcbiAgICAgICAgY29uc3Qgb25lT3JNb3JlUGFyc2VyID0gbWFueUNoYXJzMShwY2hhcignbScpKTtcbiAgICAgICAgbGV0IHBhcnNpbmcgPSBvbmVPck1vcmVQYXJzZXIucnVuKCdtbW1hcmNvJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcudG9TdHJpbmcoKSkudG8uYmUuZXFsKCdWYWxpZGF0aW9uLlN1Y2Nlc3MoW21tbSxyb3c9MDtjb2w9MztyZXN0PWFyY29dKScpO1xuICAgIH0pO1xuICAgIGl0KCdjYW5ub3QgcGFyc2UgYSBjaGFyIHNlcXVlbmNlIHplcm8gdGltZXMnLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IG9uZU9yTW9yZVBhcnNlciA9IG1hbnkxKHBzdHJpbmcoJ21hcmNvJykpO1xuICAgICAgICBsZXQgcGFyc2luZyA9IG9uZU9yTW9yZVBhcnNlci5ydW4oJ3htYXJjb21hcmNvY2lhbycpO1xuICAgICAgICBleHBlY3QocGFyc2luZy5pc0ZhaWx1cmUpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLnRvU3RyaW5nKCkpXG4gICAgICAgICAgICAudG8uYmUuZXFsKCdWYWxpZGF0aW9uLkZhaWx1cmUoW21hbnkxIHBzdHJpbmcgbWFyY28sd2FudGVkIG07IGdvdCB4LHJvdz0wO2NvbD0wO3Jlc3Q9eG1hcmNvbWFyY29jaWFvXSknKTtcbiAgICB9KTtcbiAgICBpdCgnY2FuIHBhcnNlIGEgY2hhciBzZXF1ZW5jZSBtYW55IHRpbWVzJywgKCkgPT4ge1xuICAgICAgICBjb25zdCBvbmVPck1vcmVQYXJzZXIgPSBtYW55MShwc3RyaW5nKCdtYXJjbycpKTtcbiAgICAgICAgbGV0IHBhcnNpbmcgPSBvbmVPck1vcmVQYXJzZXIucnVuKCdtYXJjb21hcmNvY2lhbycpO1xuICAgICAgICBleHBlY3QocGFyc2luZy5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLnRvU3RyaW5nKCkpXG4gICAgICAgICAgICAudG8uYmUuZXFsKCdWYWxpZGF0aW9uLlN1Y2Nlc3MoW1tbbSxhLHIsYyxvXSxbbSxhLHIsYyxvXV0scm93PTA7Y29sPTEwO3Jlc3Q9Y2lhb10pJyk7XG4gICAgfSk7XG4gICAgaXQoJ2NhbiBwYXJzZSBhbiBpbnRlZ2VyLCBubyBtYXR0ZXIgaG93IGxhcmdlLi4uJywgKCkgPT4ge1xuICAgICAgICBjb25zdCBwaW50ID0gbWFueTEoYW55T2YoZGlnaXRzKSk7XG4gICAgICAgIGxldCBwYXJzaW5nID0gcGludC5ydW4oJzEyMzQ1QScpO1xuICAgICAgICBleHBlY3QocGFyc2luZy5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgnVmFsaWRhdGlvbi5TdWNjZXNzKFtbMSwyLDMsNCw1XSxyb3c9MDtjb2w9NTtyZXN0PUFdKScpO1xuICAgICAgICBwYXJzaW5nID0gcGludC5ydW4oJzFCJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcudG9TdHJpbmcoKSkudG8uYmUuZXFsKCdWYWxpZGF0aW9uLlN1Y2Nlc3MoW1sxXSxyb3c9MDtjb2w9MTtyZXN0PUJdKScpO1xuICAgICAgICBwYXJzaW5nID0gcGludC5ydW4oJ0ExMjM0NScpO1xuICAgICAgICBleHBlY3QocGFyc2luZy5pc0ZhaWx1cmUpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLnRvU3RyaW5nKCkpXG4gICAgICAgICAgICAudG8uYmUuZXFsKCdWYWxpZGF0aW9uLkZhaWx1cmUoW21hbnkxIGFueU9mIDAxMjM0NTY3ODksZmFpbCxBMTIzNDVdKScpO1xuICAgIH0pO1xuICAgIGl0KCdjYW4gcGFyc2UgYW4gaW50ZWdlciBpbnRvIGEgdHJ1ZSBpbnRlZ2VyJywgKCkgPT4ge1xuICAgICAgICBjb25zdCBwaW50ID0gbWFueTEoYW55T2YoZGlnaXRzKSlcbiAgICAgICAgICAgIC5mbWFwKGwgPT4gcGFyc2VJbnQobC5yZWR1Y2UoKGFjYywgY3VycikgPT4gYWNjICsgY3VyciwgJycpLCAxMCkpO1xuICAgICAgICBsZXQgcGFyc2luZyA9IHBpbnQucnVuKCcxMjM0NUEnKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcuaXNTdWNjZXNzKS50by5iZS50cnVlO1xuICAgICAgICBleHBlY3QocGFyc2luZy52YWx1ZVswXSkudG8uYmUuZXFsKDEyMzQ1KTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcudmFsdWVbMV0udG9TdHJpbmcoKSkudG8uYmUuZXFsKCdyb3c9MDtjb2w9NTtyZXN0PUEnKTtcbiAgICB9KTtcbn0pO1xuXG5kZXNjcmliZSgnYSBwYXJzZXIgZm9yIG9wdGlvbmFsIGNoYXJhY3RlcnMnLCAoKSA9PiB7XG4gICAgaXQoJ2NhbiBjYXB0dXJlIG9yIG5vdCBjYXB0dXJlIGEgZG90JywgKCkgPT4ge1xuICAgICAgICBjb25zdCBvcHREb3RUaGVuQSA9IG9wdChwY2hhcignLicpKS5hbmRUaGVuKHBjaGFyKCdhJykpO1xuICAgICAgICBleHBlY3Qob3B0RG90VGhlbkEucnVuKCcuYWJjJykudG9TdHJpbmcoKSlcbiAgICAgICAgICAgIC50by5iZS5lcWwoJ1ZhbGlkYXRpb24uU3VjY2VzcyhbW01heWJlLkp1c3QoLiksYV0scm93PTA7Y29sPTI7cmVzdD1iY10pJyk7XG4gICAgICAgIGV4cGVjdChvcHREb3RUaGVuQS5ydW4oJ2FiYycpLnRvU3RyaW5nKCkpXG4gICAgICAgICAgICAudG8uYmUuZXFsKCdWYWxpZGF0aW9uLlN1Y2Nlc3MoW1tNYXliZS5Ob3RoaW5nLGFdLHJvdz0wO2NvbD0xO3Jlc3Q9YmNdKScpO1xuICAgIH0pO1xuICAgIGl0KCdjYW4gY2FwdHVyZSBhIGRvdCBvciBwcm92aWRlIGEgZGVmYXVsdCBhbHRlcm5hdGl2ZScsICgpID0+IHtcbiAgICAgICAgY29uc3Qgb3B0RG90V2l0aERlZmF1bHRUaGVuQSA9IG9wdChwY2hhcignLicpLCAnQUxURVJOQVRJVkUnKS5hbmRUaGVuKHBjaGFyKCdhJykpO1xuICAgICAgICBleHBlY3Qob3B0RG90V2l0aERlZmF1bHRUaGVuQS5ydW4oJ2FiYycpLnRvU3RyaW5nKCkpXG4gICAgICAgICAgICAudG8uYmUuZXFsKCdWYWxpZGF0aW9uLlN1Y2Nlc3MoW1tNYXliZS5KdXN0KEFMVEVSTkFUSVZFKSxhXSxyb3c9MDtjb2w9MTtyZXN0PWJjXSknKTtcbiAgICB9KTtcbiAgICBpdCgnY2FuIHBhcnNlIFNJR05FRCBpbnRlZ2VycyEhIScsICgpID0+IHtcbiAgICAgICAgY29uc3QgcGludCA9IG1hbnkxKGFueU9mKGRpZ2l0cykpXG4gICAgICAgICAgICAuZm1hcChsID0+IHBhcnNlSW50KGwucmVkdWNlKChhY2MsIGN1cnIpID0+IGFjYyArIGN1cnIsICcnKSwgMTApKTtcbiAgICAgICAgY29uc3QgcFNpZ25lZEludCA9IG9wdChwY2hhcignLScpKVxuICAgICAgICAgICAgLmFuZFRoZW4ocGludClcbiAgICAgICAgICAgIC5mbWFwKG9wdFNpZ25OdW1iZXJQYWlyID0+IChvcHRTaWduTnVtYmVyUGFpclswXS5pc0p1c3QpID8gLW9wdFNpZ25OdW1iZXJQYWlyWzFdIDogb3B0U2lnbk51bWJlclBhaXJbMV0pO1xuICAgICAgICBleHBlY3QocFNpZ25lZEludC5ydW4oJzEzMjQzNTQ2eCcpLnZhbHVlWzBdKS50by5iZS5lcWwoMTMyNDM1NDYpO1xuICAgICAgICBleHBlY3QocFNpZ25lZEludC5ydW4oJy0xMzI0MzU0NngnKS52YWx1ZVswXSkudG8uYmUuZXFsKC0xMzI0MzU0Nik7XG4gICAgfSk7XG4gICAgaXQoJ2NhbiBjYXB0dXJlIG9yIG5vdCBjYXB0dXJlIGEgd2hvbGUgc3Vic3RyaW5nJywgKCkgPT4ge1xuICAgICAgICBjb25zdCBvcHRTdWJzdHJpbmcgPSBvcHQocHN0cmluZygnbWFyY28nKSkuYW5kVGhlbihwc3RyaW5nKCdmYXVzdGluZWxsaScpKTtcbiAgICAgICAgZXhwZWN0KG9wdFN1YnN0cmluZy5ydW4oJ21hcmNvZmF1c3RpbmVsbGl4JykudG9TdHJpbmcoKSlcbiAgICAgICAgICAgIC50by5iZS5lcWwoJ1ZhbGlkYXRpb24uU3VjY2VzcyhbW01heWJlLkp1c3QoW20sYSxyLGMsb10pLFtmLGEsdSxzLHQsaSxuLGUsbCxsLGldXSxyb3c9MDtjb2w9MTY7cmVzdD14XSknKTtcbiAgICAgICAgZXhwZWN0KG9wdFN1YnN0cmluZy5ydW4oJ2ZhdXN0aW5lbGxpeCcpLnRvU3RyaW5nKCkpXG4gICAgICAgICAgICAudG8uYmUuZXFsKCdWYWxpZGF0aW9uLlN1Y2Nlc3MoW1tNYXliZS5Ob3RoaW5nLFtmLGEsdSxzLHQsaSxuLGUsbCxsLGldXSxyb3c9MDtjb2w9MTE7cmVzdD14XSknKTtcbiAgICB9KTtcbn0pO1xuXG5kZXNjcmliZSgnYSBjb3VwbGUgb2YgcGFyc2VycycsICgpID0+IHtcbiAgICBpdCgnY2FuIGRlY2lkZSB0byBkaXNjYXJkIHRoZSBtYXRjaGVzIG9mIHRoZSBmaXJzdCBvbmUnLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IGRpc2NhcmRJbnRlZ2VyU2lnbiA9IHBjaGFyKCctJykuZGlzY2FyZEZpcnN0KHBkaWdpdCg4KSk7XG4gICAgICAgIGxldCBwYXJzaW5nID0gZGlzY2FyZEludGVnZXJTaWduLnJ1bignLTh4Jyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgnVmFsaWRhdGlvbi5TdWNjZXNzKFs4LHJvdz0wO2NvbD0yO3Jlc3Q9eF0pJyk7XG4gICAgfSk7XG4gICAgaXQoJ2NhbiBkZWNpZGUgdG8gZGlzY2FyZCB0aGUgbWF0Y2hlcyBvZiB0aGUgc2Vjb25kIG9uZScsICgpID0+IHtcbiAgICAgICAgY29uc3QgZGlzY2FyZFN1ZmZpeCA9IHBzdHJpbmcoJ21hcmNvJykuZGlzY2FyZFNlY29uZChtYW55MShhbnlPZih3aGl0ZXMpKSk7XG4gICAgICAgIGxldCBwYXJzaW5nID0gZGlzY2FyZFN1ZmZpeC5ydW4oJ21hcmNvIGZhdXN0aW5lbGxpJyk7XG4gICAgICAgIGV4cGVjdChwYXJzaW5nLnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgnVmFsaWRhdGlvbi5TdWNjZXNzKFtbbSxhLHIsYyxvXSxyb3c9MDtjb2w9NjtyZXN0PWZhdXN0aW5lbGxpXSknKTtcbiAgICAgICAgcGFyc2luZyA9IGRpc2NhcmRTdWZmaXgucnVuKCdtYXJjbyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmF1c3RpbmVsbGknKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcudG9TdHJpbmcoKSkudG8uYmUuZXFsKCdWYWxpZGF0aW9uLlN1Y2Nlc3MoW1ttLGEscixjLG9dLHJvdz0wO2NvbD0zNztyZXN0PWZhdXN0aW5lbGxpXSknKTtcbiAgICB9KTtcbn0pO1xuXG5kZXNjcmliZSgnYSB0YXBwZXIgZm9yIHBhcnNlcnMnLCAoKSA9PiB7XG4gICAgaXQoJ2NhbiBkbyB0aGluZ3Mgd2l0aCBhIHJlc3VsdCB0aGF0XFwncyBnb2luZyB0byBiZSBkaXNjYXJkZWQnLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHRhcEludG9EaXNjYXJkSW50ZWdlclNpZ24gPSB0YXBQKHBjaGFyKCctJyksIHJlcyA9PiB7XG4gICAgICAgICAgICBleHBlY3QocmVzKS50by5iZS5lcWwoJy0nKTtcbiAgICAgICAgfSkuZGlzY2FyZEZpcnN0KHBkaWdpdCg4KSk7XG4gICAgICAgIGxldCBwYXJzaW5nID0gdGFwSW50b0Rpc2NhcmRJbnRlZ2VyU2lnbi5ydW4oJy04eCcpO1xuICAgIH0pO1xufSk7XG5cbmRlc2NyaWJlKCdhIGxvZ2dlciBmb3IgcGFyc2VycycsICgpID0+IHtcbiAgICBsZXQgc3RvcmVkTG9nID0gY29uc29sZS5sb2c7XG4gICAgaXQoJ2NhbiBsb2cgaW50ZXJtZWRpYXRlIHBhcnNpbmcgcmVzdWx0cycsICgpID0+IHtcbiAgICAgICAgY29uc29sZS5sb2cgPSBtc2cgPT4ge1xuICAgICAgICAgICAgZXhwZWN0KG1zZykudG8uYmUuZXFsKCdwY2hhcl8tOi0nKTtcbiAgICAgICAgfTtcbiAgICAgICAgY29uc3QgbG9nSW50ZXJtZWRpYXRlUmVzdWx0ID0gbG9nUChwY2hhcignLScpKVxuICAgICAgICAgICAgLmRpc2NhcmRGaXJzdChwZGlnaXQoOCkpO1xuICAgICAgICBsZXQgcGFyc2luZyA9IGxvZ0ludGVybWVkaWF0ZVJlc3VsdC5ydW4oJy04eCcpO1xuICAgICAgICBleHBlY3QocGFyc2luZy50b1N0cmluZygpKS50by5iZS5lcWwoJ1ZhbGlkYXRpb24uU3VjY2VzcyhbOCxyb3c9MDtjb2w9MjtyZXN0PXhdKScpO1xuICAgIH0pO1xuICAgIGl0KCdjYW4gbG9nIGEgcmVzdWx0IHRoYXRcXCdzIGdvaW5nIHRvIGJlIGRpc2NhcmRlZCcsICgpID0+IHtcbiAgICAgICAgY29uc29sZS5sb2cgPSBtc2cgPT4ge1xuICAgICAgICAgICAgZXhwZWN0KG1zZykudG8uYmUuZXFsKCdtYW55MSBhbnlPZiAgXFx0XFxuXFxyOlsgLCBdJyk7XG4gICAgICAgIH07XG4gICAgICAgIGNvbnN0IGRpc2NhcmRTdWZmaXggPSBwc3RyaW5nKCdtYXJjbycpLmRpc2NhcmRTZWNvbmQobG9nUChtYW55MShhbnlPZih3aGl0ZXMpKSkpO1xuICAgICAgICBsZXQgcGFyc2luZyA9IGRpc2NhcmRTdWZmaXgucnVuKCdtYXJjbyAgZmF1c3RpbmVsbGknKTtcbiAgICAgICAgZXhwZWN0KHBhcnNpbmcudG9TdHJpbmcoKSkudG8uYmUuZXFsKCdWYWxpZGF0aW9uLlN1Y2Nlc3MoW1ttLGEscixjLG9dLHJvdz0wO2NvbD03O3Jlc3Q9ZmF1c3RpbmVsbGldKScpO1xuICAgIH0pO1xuICAgIGNvbnNvbGUubG9nID0gc3RvcmVkTG9nO1xufSk7XG5cbmRlc2NyaWJlKCdwYXJzaW5nIHdoaWxlIGRpc2NhcmRpbmcgaW5wdXQnLCAoKSA9PiB7XG4gICAgaXQoJ2FsbG93cyB0byBleGNsdWRlIHBhcmVudGhlc2VzJywgKCkgPT4ge1xuICAgICAgICBjb25zdCBpbnNpZGVQYXJlbnMgPSBwY2hhcignKCcpXG4gICAgICAgICAgICAuZGlzY2FyZEZpcnN0KG1hbnkoYW55T2YobG93ZXJjYXNlcykpKVxuICAgICAgICAgICAgLmRpc2NhcmRTZWNvbmQocGNoYXIoJyknKSk7XG4gICAgICAgIGV4cGVjdChpbnNpZGVQYXJlbnMucnVuKCcobWFyY28pJykudG9TdHJpbmcoKSlcbiAgICAgICAgICAgIC50by5iZS5lcWwoJ1ZhbGlkYXRpb24uU3VjY2VzcyhbW20sYSxyLGMsb10scm93PTE7Y29sPTA7cmVzdD1dKScpO1xuICAgICAgICBleHBlY3QoaW5zaWRlUGFyZW5zLnJ1bignKCknKS50b1N0cmluZygpKVxuICAgICAgICAgICAgLnRvLmJlLmVxbCgnVmFsaWRhdGlvbi5TdWNjZXNzKFtbXSxyb3c9MTtjb2w9MDtyZXN0PV0pJyk7XG4gICAgfSk7XG4gICAgaXQoJy4uLmV2ZW4gdXNpbmcgYSB0YWlsb3ItbWFkZSBtZXRob2QnLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IGluc2lkZVBhcmVucyA9IGJldHdlZW5QYXJlbnMocHN0cmluZygnbWFyY28nKSk7XG4gICAgICAgIGV4cGVjdChpbnNpZGVQYXJlbnMucnVuKCcobWFyY28pJykudG9TdHJpbmcoKSlcbiAgICAgICAgICAgIC50by5iZS5lcWwoJ1ZhbGlkYXRpb24uU3VjY2VzcyhbW20sYSxyLGMsb10scm93PTE7Y29sPTA7cmVzdD1dKScpO1xuICAgIH0pO1xuICAgIGl0KCdjaGVycnktcGlja2luZyBlbGVtZW50cyBzZXBhcmF0ZWQgYnkgc2VwYXJhdG9ycycsICgpID0+IHtcbiAgICAgICAgY29uc3Qgc3Vic3RyaW5nc1dpdGhDb21tYXMgPSBtYW55KG1hbnkxKGFueU9mKGxvd2VyY2FzZXMpKS5kaXNjYXJkU2Vjb25kKHBjaGFyKCcsJykpKTtcbiAgICAgICAgZXhwZWN0KHN1YnN0cmluZ3NXaXRoQ29tbWFzLnJ1bignYSxiLGNkLDEnKS50b1N0cmluZygpKVxuICAgICAgICAgICAgLnRvLmJlLmVxbCgnVmFsaWRhdGlvbi5TdWNjZXNzKFtbW2FdLFtiXSxbYyxkXV0scm93PTA7Y29sPTc7cmVzdD0xXSknKTtcbiAgICB9KTtcbiAgICBpdCgnLi4uYWxzbyB3aGVuIGluc2lkZSBhIGxpc3RzJywgKCkgPT4ge1xuICAgICAgICBjb25zdCBzdWJzdHJpbmdzV2l0aENvbW1hcyA9IG1hbnkobWFueTEoYW55T2YobG93ZXJjYXNlcykpLmRpc2NhcmRTZWNvbmQocGNoYXIoJywnKSkpO1xuICAgICAgICBjb25zdCBsaXN0RWxlbWVudHMgPSBiZXR3ZWVuKHBjaGFyKCdbJyksIHN1YnN0cmluZ3NXaXRoQ29tbWFzLCBwY2hhcignXScpKTtcbiAgICAgICAgZXhwZWN0KGxpc3RFbGVtZW50cy5ydW4oJ1thLGIsY2QsbWFyY28sXTEnKS50b1N0cmluZygpKVxuICAgICAgICAgICAgLnRvLmJlLmVxbCgnVmFsaWRhdGlvbi5TdWNjZXNzKFtbW2FdLFtiXSxbYyxkXSxbbSxhLHIsYyxvXV0scm93PTA7Y29sPTE1O3Jlc3Q9MV0pJyk7XG4gICAgfSk7XG4gICAgZGVzY3JpYmUoJ3RoYW5rcyB0byB0aGUgc3BlY2lmaWMgc2VwQnkxIG9wZXJhdG9yJywgKCkgPT4ge1xuICAgICAgICBjb25zdCB2YWx1ZXNQID0gYW55T2YobG93ZXJjYXNlcyk7XG4gICAgICAgIGNvbnN0IGNvbW1hUCA9IHBjaGFyKCcsJyk7XG4gICAgICAgIGl0KCdjaGVycnktcGlja2luZyBlbGVtZW50cyBzZXBhcmF0ZWQgYnkgc2VwYXJhdG9ycycsICgpID0+IHtcbiAgICAgICAgICAgIGV4cGVjdChzZXBCeTEodmFsdWVzUCwgY29tbWFQKS5ydW4oJ2EsYixjZCwxJykudG9TdHJpbmcoKSlcbiAgICAgICAgICAgICAgICAudG8uYmUuZXFsKCdWYWxpZGF0aW9uLlN1Y2Nlc3MoW1tbYV0sW2JdLFtjLGRdXSxyb3c9MDtjb2w9NztyZXN0PTFdKScpO1xuICAgICAgICB9KTtcbiAgICAgICAgaXQoJy4uLmFsc28gd2hlbiBpbnNpZGUgYSBsaXN0cycsICgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGxpc3RFbGVtZW50cyA9IGJldHdlZW4ocGNoYXIoJ1snKSwgc2VwQnkxKHZhbHVlc1AsIGNvbW1hUCksIHBjaGFyKCddJykpO1xuICAgICAgICAgICAgZXhwZWN0KGxpc3RFbGVtZW50cy5ydW4oJ1thLGIsY2QsbWFyY28sXScpLnRvU3RyaW5nKCkpXG4gICAgICAgICAgICAgICAgLnRvLmJlLmVxbCgnVmFsaWRhdGlvbi5TdWNjZXNzKFtbW2FdLFtiXSxbYyxkXSxbbSxhLHIsYyxvXV0scm93PTE7Y29sPTA7cmVzdD1dKScpO1xuICAgICAgICB9KTtcbiAgICAgICAgaXQoJy4uLmxpc3RzIHdpdGggbm8gZWxlbWVudHMnLCAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBsaXN0RWxlbWVudHMgPSBiZXR3ZWVuKHBjaGFyKCdbJyksIHNlcEJ5MSh2YWx1ZXNQLCBjb21tYVApLCBwY2hhcignXScpKTtcbiAgICAgICAgICAgIGV4cGVjdChsaXN0RWxlbWVudHMucnVuKCdbXScpLnRvU3RyaW5nKCkpXG4gICAgICAgICAgICAgICAgLnRvLmJlLmVxbCgnVmFsaWRhdGlvbi5TdWNjZXNzKFtbXSxyb3c9MTtjb2w9MDtyZXN0PV0pJyk7XG4gICAgICAgIH0pO1xuICAgICAgICBpdCgnLi4ubGlzdHMgd2l0aCBqdXN0IG9uZSBlbGVtZW50JywgKCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgbGlzdEVsZW1lbnRzID0gYmV0d2VlbihwY2hhcignWycpLCBzZXBCeTEodmFsdWVzUCwgY29tbWFQKSwgcGNoYXIoJ10nKSk7XG4gICAgICAgICAgICBleHBlY3QobGlzdEVsZW1lbnRzLnJ1bignW2FdJykudG9TdHJpbmcoKSlcbiAgICAgICAgICAgICAgICAudG8uYmUuZXFsKCdWYWxpZGF0aW9uLlN1Y2Nlc3MoW1tbYV1dLHJvdz0xO2NvbD0wO3Jlc3Q9XSknKTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG59KTtcbiJdfQ==