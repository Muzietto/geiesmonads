define(['exports', 'classes', 'maybe', 'validation'], function (exports, _classes, _maybe, _validation) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.discardFirst = exports.discardSecond = exports.whiteP = exports.digitP = exports.letterP = exports.uppercaseP = exports.lowercaseP = exports.orElse = exports.andThen = exports.predicateBasedParser = exports.digitParser = exports.charParser = undefined;
    exports.pchar = pchar;
    exports.pdigit = pdigit;
    exports.andThenBind = andThenBind;
    exports.choice = choice;
    exports.anyOf = anyOf;
    exports.fmap = fmap;
    exports.returnP = returnP;
    exports.applyPx = applyPx;
    exports.applyP = applyP;
    exports.lift2 = lift2;
    exports.sequenceP = sequenceP;
    exports.sequenceP2 = sequenceP2;
    exports.pstring = pstring;
    exports.zeroOrMore = zeroOrMore;
    exports.many = many;
    exports.manyChars = manyChars;
    exports.many1 = many1;
    exports.manyChars1 = manyChars1;
    exports.opt = opt;
    exports.optBook = optBook;
    exports.sepBy1Book = sepBy1Book;
    exports.sepBy1 = sepBy1;
    exports.between = between;
    exports.betweenParens = betweenParens;
    exports.bindP = bindP;
    exports.tapP = tapP;
    exports.logP = logP;
    exports.pword = pword;
    exports.trimP = trimP;
    exports.parser = parser;

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

    // Success or Failure

    var charParser = function charParser(char) {
        return function (pos) {
            if (typeof pos === 'string') pos = _classes.Position.fromText(pos);
            var optChar = pos.char();
            if (optChar.isNothing) return _validation.Validation.Failure(_classes.Tuple.Triple('charParser', 'no more input', pos));
            if (optChar.value === char) return _validation.Validation.Success(_classes.Tuple.Pair(char, pos.incrPos()));
            return _validation.Validation.Failure(_classes.Tuple.Triple('charParser', 'wanted ' + char + '; got ' + optChar.value, pos));
        };
    };

    var digitParser = function digitParser(digit) {
        return function (pos) {
            if (typeof pos === 'string') pos = _classes.Position.fromText(pos);
            var optChar = pos.char();
            if (optChar.isNothing) return _validation.Validation.Failure(_classes.Tuple.Triple('digitParser', 'no more input', pos));
            if (parseInt(optChar.value, 10) === digit) return _validation.Validation.Success(_classes.Tuple.Pair(digit, pos.incrPos()));
            return _validation.Validation.Failure(_classes.Tuple.Triple('digitParser', 'wanted ' + digit + '; got ' + optChar.value, pos));
        };
    };

    var predicateBasedParser = function predicateBasedParser(pred, label) {
        return function (pos) {
            if (typeof pos === 'string') pos = _classes.Position.fromText(pos);
            var optChar = pos.char();
            if (optChar.isNothing) return _validation.Validation.Failure(_classes.Tuple.Triple(label, 'no more input', pos));
            if (pred(optChar.value)) return _validation.Validation.Success(_classes.Tuple.Pair(optChar.value, pos.incrPos()));
            return _validation.Validation.Failure(_classes.Tuple.Triple(label, 'unexpected char: ' + optChar.value, pos));
        };
    };

    exports.charParser = charParser;
    exports.digitParser = digitParser;
    exports.predicateBasedParser = predicateBasedParser;
    function pchar(char) {
        var label = 'pchar_' + char;
        var result = function result(pos) {
            return charParser(char)(pos);
        };
        return parser(result, label).setLabel(label);
    }

    function pdigit(digit) {
        return parser(function (pos) {
            return digitParser(digit)(pos);
        }, 'pdigit_' + digit);
    }

    function _andThen(p1, p2) {
        var label = p1.label + ' andThen ' + p2.label;
        return parser(function (pos) {
            var res1 = p1.run(pos);
            if (res1.isSuccess) {
                var res2 = p2.run(res1.value[1]);
                if (res2.isSuccess) {
                    return _validation.Validation.Success(_classes.Tuple.Pair(_classes.Tuple.Pair(res1.value[0], res2.value[0]), res2.value[1]));
                } else return _validation.Validation.Failure(_classes.Tuple.Triple(label, res2.value[1], res2.value[2]));
            } else return _validation.Validation.Failure(_classes.Tuple.Triple(label, res1.value[1], res1.value[2]));
        }, label);
    }

    // using bind
    exports.andThen = _andThen;
    function andThenBind(p1, p2) {
        return p1.bind(function (parsedValue1) {
            return p2.bind(function (parsedValue2) {
                return returnP(_classes.Tuple.Pair(parsedValue1, parsedValue2));
            });
        }).setLabel(p1.label + ' andThen ' + p2.label);
    }

    function _orElse(p1, p2) {
        var label = p1.label + ' orElse ' + p2.label;
        return parser(function (pos) {
            var res1 = p1.run(pos);
            if (res1.isSuccess) return res1;
            var res2 = p2.run(pos);
            if (res2.isSuccess) return res2;
            return _validation.Validation.Failure(_classes.Tuple.Triple(label, res2.value[1], res2.value[2]));
        }, label).setLabel(label);
    }

    exports.orElse = _orElse;
    var _fail = parser(function (pos) {
        return _validation.Validation.Failure(_classes.Tuple.Triple('parsing failed', '_fail', pos));
    });

    // return neutral element instead of message
    var _succeed = parser(function (pos) {
        return _validation.Validation.Success(_classes.Tuple.Pair(_classes.Tuple.Pair('parsing succeeded', pos), '_succeed'));
    });

    function choice(parsers) {
        return parsers.reduceRight(function (rest, curr) {
            return _orElse(curr, rest);
        }, _fail).setLabel('choice ' + parsers.reduce(function (acc, curr) {
            return acc + '/' + curr.label;
        }, ''));
    }

    function anyOf(charsArray) {
        return choice(charsArray.map(pchar)).setLabel('anyOf ' + charsArray.reduce(function (acc, curr) {
            return acc + curr;
        }, ''));
    }

    var lowercaseP = exports.lowercaseP = anyOf(['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z']).setLabel('lowercaseP');
    var uppercaseP = exports.uppercaseP = anyOf(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']).setLabel('uppercaseP');
    var letterP = exports.letterP = lowercaseP.orElse(uppercaseP).setLabel('letterP');
    var digitP = exports.digitP = anyOf(['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']).setLabel('digitP');
    var whiteP = exports.whiteP = anyOf([' ', '\t', '\n', '\r']).setLabel('whiteP');

    function fmap(fab, parser1) {
        var label = parser1.label + ' fmap ' + fab.toString();
        return parser(function (pos) {
            var res = parser1.run(pos);
            if (res.isSuccess) return _validation.Validation.Success(_classes.Tuple.Pair(fab(res.value[0]), res.value[1]));
            return _validation.Validation.Failure(_classes.Tuple.Triple(label, res.value[1], res.value[2]));
        }, label);
    }

    function returnP(value) {
        return parser(function (pos) {
            return _validation.Validation.Success(_classes.Tuple.Pair(value, pos));
        }, value);
    }

    // parser(a -> b) -> parser(a) -> parser(b)
    function applyPx(fP) {
        return function (xP) {
            return _andThen(fP, xP).fmap(function (_ref) {
                var _ref2 = _slicedToArray(_ref, 2),
                    f = _ref2[0],
                    x = _ref2[1];

                return f(x);
            });
        };
    }

    // using bind
    function applyP(fP) {
        return function (xP) {
            return fP.bind(function (parsedValuef) {
                return xP.bind(function (parsedValuex) {
                    return returnP(parsedValuef(parsedValuex));
                });
            });
        };
    }

    function lift2(faab) {
        return function (parser1) {
            return function (parser2) {
                //return applyP(applyP(returnP(faab))(parser1))(parser2);
                return returnP(faab).apply(parser1).apply(parser2); // using instance methods
            };
        };
    }

    // using lift2(cons)
    function sequenceP(parsers) {
        return parsers.reduceRight(function (rest, curr) {
            return lift2(_cons)(curr)(rest);
        }, returnP([]));
    }

    // using naive andThen && fmap --> returns strings, not arrays!
    function sequenceP2(parsers) {
        return parsers.reduceRight(function (rest, curr) {
            return fmap(function (_ref3) {
                var _ref4 = _slicedToArray(_ref3, 2),
                    x = _ref4[0],
                    y = _ref4[1];

                return x + y;
            }, _andThen(curr, rest));
        }, returnP(''));
    }

    function pstring(str) {
        return sequenceP(str.split('').map(pchar)).setLabel('pstring ' + str);
    }

    function zeroOrMore(xP) {
        // zeroOrMore :: p a -> [a] -> try [a] = p a -> p [a]
        return function (pos) {
            var res1 = xP.run(pos);
            if (res1.isFailure) return _validation.Validation.Success(_classes.Tuple.Pair([], pos));
            var resN = zeroOrMore(xP)(res1.value[1]);
            return _validation.Validation.Success(_classes.Tuple.Pair([res1.value[0]].concat(resN.value[0]), resN.value[1]));
        };
    }

    function many(xP, times) {
        var times_defined = typeof times !== 'undefined';
        var label = 'many ' + xP.label + (times_defined ? ' times=' + times : '');
        return parser(function (pos) {
            var res = zeroOrMore(xP)(pos);
            if (times_defined) {
                //debugger;
                if (res.isFailure) return res;
                var resultLength = res.value[0].length;
                return resultLength === times ? res : _validation.Validation.Failure(_classes.Tuple.Triple(label, 'times param wanted ' + times + '; got ' + resultLength, pos));
            }
            return res;
        }, label).setLabel(label);
    }

    function manyChars(xP, times) {
        return many(xP, times).fmap(function (arra) {
            return arra.join('');
        }).setLabel('manyChars ' + xP.label + (typeof times !== 'undefined' ? ' times=' + times : ''));
    }

    function many1(xP) {
        var label = 'many1 ' + xP.label;
        return parser(function (pos) {
            var res1 = xP.run(pos);
            if (res1.isFailure) return res1;
            var resN = zeroOrMore(xP)(res1.value[1]);
            return _validation.Validation.Success(_classes.Tuple.Pair([res1.value[0]].concat(resN.value[0]), resN.value[1]));
        }, label).setLabel(label);
    }

    function manyChars1(xP) {
        return many1(xP).fmap(function (arra) {
            return arra.join('');
        }).setLabel('manyChars1 ' + xP.label);
    }

    function opt(xP, defaultValue) {
        var isDefault = typeof defaultValue !== 'undefined';
        var label = 'opt ' + xP.label + (isDefault ? '(default=' + defaultValue + ')' : '');
        return parser(function (pos) {
            var res = xP.fmap(_maybe.Maybe.Just).run(pos);
            if (res.isSuccess) return res;
            var outcome = isDefault ? _maybe.Maybe.Just(defaultValue) : _maybe.Maybe.Nothing();
            return _validation.Validation.Success(_classes.Tuple.Pair(outcome, pos));
        }, label).setLabel(label);
    }

    // opt from the book - works ok, but toString() gives strange results
    function optBook(pX) {
        var someP = pX.fmap(_maybe.Maybe.Just);
        var noneP = returnP(_maybe.Maybe.Nothing);
        return someP.orElse(noneP);
    }

    function _discardSecond(p1, p2) {
        var label = p1.label + ' discardSecond ' + p2.label;
        return parser(function (pos) {
            return _andThen(p1, p2).fmap(function (_ref5) {
                var _ref6 = _slicedToArray(_ref5, 2),
                    x = _ref6[0],
                    y = _ref6[1];

                return x;
            }).run(pos);
        }, label).setLabel(label);
    }

    exports.discardSecond = _discardSecond;
    function _discardFirst(p1, p2) {
        var label = p1.label + ' discardFirst ' + p2.label;
        return parser(function (pos) {
            return _andThen(p1, p2).fmap(function (_ref7) {
                var _ref8 = _slicedToArray(_ref7, 2),
                    x = _ref8[0],
                    y = _ref8[1];

                return y;
            }).run(pos);
        }, label).setLabel(label);
    }

    exports.discardFirst = _discardFirst;
    function sepBy1Book(px, sep) {
        return px.andThen(many(sep.discardFirst(px))).fmap(function (_ref9) {
            var _ref10 = _slicedToArray(_ref9, 2),
                r = _ref10[0],
                rlist = _ref10[1];

            return [r].concat(rlist);
        });
    }

    // my version works just fine...
    function sepBy1(valueP, separatorP) {
        return many(many1(valueP).discardSecond(opt(separatorP)));
    }

    function between(p1, p2, p3) {
        return p1.discardFirst(p2).discardSecond(p3).setLabel('between ' + p1.label + '/' + p2.label + '/' + p3.label);
    }

    function betweenParens(px) {
        return between(pchar('('), px, pchar(')')).setLabel('betweenParens ' + px.label);
    }

    function bindP(famb, px) {
        var label = 'unknown';
        return parser(function (pos) {
            var res = px.run(pos);
            if (res.isFailure) return res;
            return famb(res.value[0]).run(res.value[1]);
        }, label).setLabel(label);
    }

    function tapP(px, fn) {
        return px.bind(function (res) {
            fn(res);
            return returnP(res);
        });
    }

    function logP(px) {
        return tapP(px, function (res) {
            return console.log(px.label + ':' + res);
        });
    }

    function pword(word) {
        return trim(pstring(word)).setLabel('pword ' + word);
    }

    function trimP(pX) {
        return opt(many(whiteP)).discardFirst(pX).discardSecond(opt(many(whiteP))).setLabel('trim ' + pX.label);
    }

    function _cons(x) {
        return function (xs) {
            return [x].concat(xs);
        };
    }

    function _setLabel(px, newLabel) {
        return parser(function (pos) {
            var result = px.run(pos);
            if (result.isFailure) return _validation.Validation.Failure(_classes.Tuple.Triple(newLabel, result.value[1], result.value[2]));
            return result;
        }, newLabel);
    }

    // the real thing...
    function parser(fn, label) {
        return {
            type: 'parser',
            label: label,
            run: function run(pos) {
                return fn(pos);
            },
            apply: function apply(px) {
                return applyP(this)(px);
                //return this.bind(andThen(this, px).fmap(([f, x]) => f(x))).run; // we are the fP
            },
            fmap: function fmap(fab) {
                //return fmap(fab, this);
                //return bindP(pos => returnP(fab(pos)), this);
                return this.bind(function (parsedValue) {
                    return returnP(fab(parsedValue));
                });
            },
            andThen: function andThen(px) {
                return _andThen(this, px);
            },
            orElse: function orElse(px) {
                return _orElse(this, px);
            },
            discardFirst: function discardFirst(px) {
                return _discardFirst(this, px);
            },
            discardSecond: function discardSecond(px) {
                return _discardSecond(this, px);
            },
            bind: function bind(famb) {
                return bindP(famb, this);
            },
            setLabel: function setLabel(newLabel) {
                return _setLabel(this, newLabel);
            }
        };
    }
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2pzL3BhcnNlcnMuanMiXSwibmFtZXMiOlsicGNoYXIiLCJwZGlnaXQiLCJhbmRUaGVuQmluZCIsImNob2ljZSIsImFueU9mIiwiZm1hcCIsInJldHVyblAiLCJhcHBseVB4IiwiYXBwbHlQIiwibGlmdDIiLCJzZXF1ZW5jZVAiLCJzZXF1ZW5jZVAyIiwicHN0cmluZyIsInplcm9Pck1vcmUiLCJtYW55IiwibWFueUNoYXJzIiwibWFueTEiLCJtYW55Q2hhcnMxIiwib3B0Iiwib3B0Qm9vayIsInNlcEJ5MUJvb2siLCJzZXBCeTEiLCJiZXR3ZWVuIiwiYmV0d2VlblBhcmVucyIsImJpbmRQIiwidGFwUCIsImxvZ1AiLCJwd29yZCIsInRyaW1QIiwicGFyc2VyIiwiY2hhclBhcnNlciIsInBvcyIsImZyb21UZXh0Iiwib3B0Q2hhciIsImNoYXIiLCJpc05vdGhpbmciLCJGYWlsdXJlIiwiVHJpcGxlIiwidmFsdWUiLCJTdWNjZXNzIiwiUGFpciIsImluY3JQb3MiLCJkaWdpdFBhcnNlciIsInBhcnNlSW50IiwiZGlnaXQiLCJwcmVkaWNhdGVCYXNlZFBhcnNlciIsInByZWQiLCJsYWJlbCIsInJlc3VsdCIsInNldExhYmVsIiwiYW5kVGhlbiIsInAxIiwicDIiLCJyZXMxIiwicnVuIiwiaXNTdWNjZXNzIiwicmVzMiIsImJpbmQiLCJwYXJzZWRWYWx1ZTEiLCJwYXJzZWRWYWx1ZTIiLCJvckVsc2UiLCJfZmFpbCIsIl9zdWNjZWVkIiwicGFyc2VycyIsInJlZHVjZVJpZ2h0IiwicmVzdCIsImN1cnIiLCJyZWR1Y2UiLCJhY2MiLCJjaGFyc0FycmF5IiwibWFwIiwibG93ZXJjYXNlUCIsInVwcGVyY2FzZVAiLCJsZXR0ZXJQIiwiZGlnaXRQIiwid2hpdGVQIiwiZmFiIiwicGFyc2VyMSIsInRvU3RyaW5nIiwicmVzIiwiZlAiLCJ4UCIsImYiLCJ4IiwicGFyc2VkVmFsdWVmIiwicGFyc2VkVmFsdWV4IiwiZmFhYiIsInBhcnNlcjIiLCJhcHBseSIsIl9jb25zIiwieSIsInN0ciIsInNwbGl0IiwiaXNGYWlsdXJlIiwicmVzTiIsImNvbmNhdCIsInRpbWVzIiwidGltZXNfZGVmaW5lZCIsInJlc3VsdExlbmd0aCIsImxlbmd0aCIsImFycmEiLCJqb2luIiwiZGVmYXVsdFZhbHVlIiwiaXNEZWZhdWx0IiwiSnVzdCIsIm91dGNvbWUiLCJOb3RoaW5nIiwicFgiLCJzb21lUCIsIm5vbmVQIiwiZGlzY2FyZFNlY29uZCIsImRpc2NhcmRGaXJzdCIsInB4Iiwic2VwIiwiciIsInJsaXN0IiwidmFsdWVQIiwic2VwYXJhdG9yUCIsInAzIiwiZmFtYiIsImZuIiwiY29uc29sZSIsImxvZyIsIndvcmQiLCJ0cmltIiwieHMiLCJfc2V0TGFiZWwiLCJuZXdMYWJlbCIsInR5cGUiLCJwYXJzZWRWYWx1ZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7OztZQW1DZ0JBLEssR0FBQUEsSztZQVFBQyxNLEdBQUFBLE07WUFrQkFDLFcsR0FBQUEsVztZQXdCQUMsTSxHQUFBQSxNO1lBS0FDLEssR0FBQUEsSztZQVdBQyxJLEdBQUFBLEk7WUFTQUMsTyxHQUFBQSxPO1lBS0FDLE8sR0FBQUEsTztZQU9BQyxNLEdBQUFBLE07WUFVQUMsSyxHQUFBQSxLO1lBVUFDLFMsR0FBQUEsUztZQVFBQyxVLEdBQUFBLFU7WUFPQUMsTyxHQUFBQSxPO1lBS0FDLFUsR0FBQUEsVTtZQVNBQyxJLEdBQUFBLEk7WUFpQkFDLFMsR0FBQUEsUztZQU9BQyxLLEdBQUFBLEs7WUFVQUMsVSxHQUFBQSxVO1lBTUFDLEcsR0FBQUEsRztZQWFBQyxPLEdBQUFBLE87WUFvQkFDLFUsR0FBQUEsVTtZQUtBQyxNLEdBQUFBLE07WUFJQUMsTyxHQUFBQSxPO1lBS0FDLGEsR0FBQUEsYTtZQUtBQyxLLEdBQUFBLEs7WUFTQUMsSSxHQUFBQSxJO1lBT0FDLEksR0FBQUEsSTtZQUlBQyxLLEdBQUFBLEs7WUFLQUMsSyxHQUFBQSxLO1lBc0JBQyxNLEdBQUFBLE07Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7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SCxhQWRFO0FBZUgvRSxtQkFmRyxtQkFlSzhELEVBZkwsRUFlUztBQUNSLHVCQUFPOUQsU0FBUSxJQUFSLEVBQWM4RCxFQUFkLENBQVA7QUFDSCxhQWpCRTtBQWtCSHBELGtCQWxCRyxrQkFrQklvRCxFQWxCSixFQWtCUTtBQUNQLHVCQUFPcEQsUUFBTyxJQUFQLEVBQWFvRCxFQUFiLENBQVA7QUFDSCxhQXBCRTtBQXFCSEQsd0JBckJHLHdCQXFCVUMsRUFyQlYsRUFxQmM7QUFDYix1QkFBT0QsY0FBYSxJQUFiLEVBQW1CQyxFQUFuQixDQUFQO0FBQ0gsYUF2QkU7QUF3QkhGLHlCQXhCRyx5QkF3QldFLEVBeEJYLEVBd0JlO0FBQ2QsdUJBQU9GLGVBQWMsSUFBZCxFQUFvQkUsRUFBcEIsQ0FBUDtBQUNILGFBMUJFO0FBMkJIdkQsZ0JBM0JHLGdCQTJCRThELElBM0JGLEVBMkJRO0FBQ1AsdUJBQU8vRixNQUFNK0YsSUFBTixFQUFZLElBQVosQ0FBUDtBQUNILGFBN0JFO0FBOEJIdEUsb0JBOUJHLG9CQThCTThFLFFBOUJOLEVBOEJnQjtBQUNmLHVCQUFPRCxVQUFVLElBQVYsRUFBZ0JDLFFBQWhCLENBQVA7QUFDSDtBQWhDRSxTQUFQO0FBa0NIIiwiZmlsZSI6InBhcnNlcnMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBjZnIuIFwiVW5kZXJzdGFuZGluZyBQYXJzZXIgQ29tYmluYXRvcnNcIiAoRiMgZm9yIEZ1biBhbmQgUHJvZml0KVxuXG5pbXBvcnQge1xuICAgIFR1cGxlLFxuICAgIFBvc2l0aW9uLFxufSBmcm9tICdjbGFzc2VzJztcbmltcG9ydCB7TWF5YmV9IGZyb20gJ21heWJlJzsgLy8gSnVzdCBvciBOb3RoaW5nXG5pbXBvcnQge1ZhbGlkYXRpb259IGZyb20gJ3ZhbGlkYXRpb24nOyAvLyBTdWNjZXNzIG9yIEZhaWx1cmVcblxuY29uc3QgY2hhclBhcnNlciA9IGNoYXIgPT4gcG9zID0+IHtcbiAgICBpZiAodHlwZW9mIHBvcyA9PT0gJ3N0cmluZycpIHBvcyA9IFBvc2l0aW9uLmZyb21UZXh0KHBvcyk7XG4gICAgY29uc3Qgb3B0Q2hhciA9IHBvcy5jaGFyKCk7XG4gICAgaWYgKG9wdENoYXIuaXNOb3RoaW5nKSByZXR1cm4gVmFsaWRhdGlvbi5GYWlsdXJlKFR1cGxlLlRyaXBsZSgnY2hhclBhcnNlcicsICdubyBtb3JlIGlucHV0JywgcG9zKSk7XG4gICAgaWYgKG9wdENoYXIudmFsdWUgPT09IGNoYXIpIHJldHVybiBWYWxpZGF0aW9uLlN1Y2Nlc3MoVHVwbGUuUGFpcihjaGFyLCBwb3MuaW5jclBvcygpKSk7XG4gICAgcmV0dXJuIFZhbGlkYXRpb24uRmFpbHVyZShUdXBsZS5UcmlwbGUoJ2NoYXJQYXJzZXInLCAnd2FudGVkICcgKyBjaGFyICsgJzsgZ290ICcgKyBvcHRDaGFyLnZhbHVlLCBwb3MpKTtcbn07XG5cbmNvbnN0IGRpZ2l0UGFyc2VyID0gZGlnaXQgPT4gcG9zID0+IHtcbiAgICBpZiAodHlwZW9mIHBvcyA9PT0gJ3N0cmluZycpIHBvcyA9IFBvc2l0aW9uLmZyb21UZXh0KHBvcyk7XG4gICAgY29uc3Qgb3B0Q2hhciA9IHBvcy5jaGFyKCk7XG4gICAgaWYgKG9wdENoYXIuaXNOb3RoaW5nKSByZXR1cm4gVmFsaWRhdGlvbi5GYWlsdXJlKFR1cGxlLlRyaXBsZSgnZGlnaXRQYXJzZXInLCAnbm8gbW9yZSBpbnB1dCcsIHBvcykpO1xuICAgIGlmIChwYXJzZUludChvcHRDaGFyLnZhbHVlLCAxMCkgPT09IGRpZ2l0KSByZXR1cm4gVmFsaWRhdGlvbi5TdWNjZXNzKFR1cGxlLlBhaXIoZGlnaXQsIHBvcy5pbmNyUG9zKCkpKTtcbiAgICByZXR1cm4gVmFsaWRhdGlvbi5GYWlsdXJlKFR1cGxlLlRyaXBsZSgnZGlnaXRQYXJzZXInLCAnd2FudGVkICcgKyBkaWdpdCArICc7IGdvdCAnICsgb3B0Q2hhci52YWx1ZSwgcG9zKSk7XG59O1xuXG5jb25zdCBwcmVkaWNhdGVCYXNlZFBhcnNlciA9IChwcmVkLCBsYWJlbCkgPT4gcG9zID0+IHtcbiAgICBpZiAodHlwZW9mIHBvcyA9PT0gJ3N0cmluZycpIHBvcyA9IFBvc2l0aW9uLmZyb21UZXh0KHBvcyk7XG4gICAgY29uc3Qgb3B0Q2hhciA9IHBvcy5jaGFyKCk7XG4gICAgaWYgKG9wdENoYXIuaXNOb3RoaW5nKSByZXR1cm4gVmFsaWRhdGlvbi5GYWlsdXJlKFR1cGxlLlRyaXBsZShsYWJlbCwgJ25vIG1vcmUgaW5wdXQnLCBwb3MpKTtcbiAgICBpZiAocHJlZChvcHRDaGFyLnZhbHVlKSkgcmV0dXJuIFZhbGlkYXRpb24uU3VjY2VzcyhUdXBsZS5QYWlyKG9wdENoYXIudmFsdWUsIHBvcy5pbmNyUG9zKCkpKTtcbiAgICByZXR1cm4gVmFsaWRhdGlvbi5GYWlsdXJlKFR1cGxlLlRyaXBsZShsYWJlbCwgJ3VuZXhwZWN0ZWQgY2hhcjogJyArIG9wdENoYXIudmFsdWUsIHBvcykpO1xufTtcblxuZXhwb3J0IHtjaGFyUGFyc2VyLCBkaWdpdFBhcnNlciwgcHJlZGljYXRlQmFzZWRQYXJzZXJ9O1xuXG5leHBvcnQgZnVuY3Rpb24gcGNoYXIoY2hhcikge1xuICAgIGNvbnN0IGxhYmVsID0gJ3BjaGFyXycgKyBjaGFyO1xuICAgIGxldCByZXN1bHQgPSBmdW5jdGlvbiAocG9zKSB7XG4gICAgICAgIHJldHVybiBjaGFyUGFyc2VyKGNoYXIpKHBvcyk7XG4gICAgfTtcbiAgICByZXR1cm4gcGFyc2VyKHJlc3VsdCwgbGFiZWwpLnNldExhYmVsKGxhYmVsKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHBkaWdpdChkaWdpdCkge1xuICAgIHJldHVybiBwYXJzZXIocG9zID0+IGRpZ2l0UGFyc2VyKGRpZ2l0KShwb3MpLCAncGRpZ2l0XycgKyBkaWdpdCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhbmRUaGVuKHAxLCBwMikge1xuICAgIGNvbnN0IGxhYmVsID0gcDEubGFiZWwgKyAnIGFuZFRoZW4gJyArIHAyLmxhYmVsO1xuICAgIHJldHVybiBwYXJzZXIoZnVuY3Rpb24gKHBvcykge1xuICAgICAgICBsZXQgcmVzMSA9IHAxLnJ1bihwb3MpO1xuICAgICAgICBpZiAocmVzMS5pc1N1Y2Nlc3MpIHtcbiAgICAgICAgICAgIGxldCByZXMyID0gcDIucnVuKHJlczEudmFsdWVbMV0pO1xuICAgICAgICAgICAgaWYgKHJlczIuaXNTdWNjZXNzKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFZhbGlkYXRpb24uU3VjY2VzcyhUdXBsZS5QYWlyKFR1cGxlLlBhaXIocmVzMS52YWx1ZVswXSwgcmVzMi52YWx1ZVswXSksIHJlczIudmFsdWVbMV0pKTtcbiAgICAgICAgICAgIH0gZWxzZSByZXR1cm4gVmFsaWRhdGlvbi5GYWlsdXJlKFR1cGxlLlRyaXBsZShsYWJlbCwgcmVzMi52YWx1ZVsxXSwgcmVzMi52YWx1ZVsyXSkpO1xuICAgICAgICB9IGVsc2UgcmV0dXJuIFZhbGlkYXRpb24uRmFpbHVyZShUdXBsZS5UcmlwbGUobGFiZWwsIHJlczEudmFsdWVbMV0sIHJlczEudmFsdWVbMl0pKTtcbiAgICB9LCBsYWJlbCk7XG59XG5cbi8vIHVzaW5nIGJpbmRcbmV4cG9ydCBmdW5jdGlvbiBhbmRUaGVuQmluZChwMSwgcDIpIHtcbiAgICByZXR1cm4gcDEuYmluZChwYXJzZWRWYWx1ZTEgPT4ge1xuICAgICAgICByZXR1cm4gcDIuYmluZChwYXJzZWRWYWx1ZTIgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHJldHVyblAoVHVwbGUuUGFpcihwYXJzZWRWYWx1ZTEsIHBhcnNlZFZhbHVlMikpO1xuICAgICAgICB9KTtcbiAgICB9KS5zZXRMYWJlbChwMS5sYWJlbCArICcgYW5kVGhlbiAnICsgcDIubGFiZWwpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gb3JFbHNlKHAxLCBwMikge1xuICAgIGNvbnN0IGxhYmVsID0gcDEubGFiZWwgKyAnIG9yRWxzZSAnICsgcDIubGFiZWw7XG4gICAgcmV0dXJuIHBhcnNlcihwb3MgPT4ge1xuICAgICAgICBjb25zdCByZXMxID0gcDEucnVuKHBvcyk7XG4gICAgICAgIGlmIChyZXMxLmlzU3VjY2VzcykgcmV0dXJuIHJlczE7XG4gICAgICAgIGNvbnN0IHJlczIgPSBwMi5ydW4ocG9zKTtcbiAgICAgICAgaWYgKHJlczIuaXNTdWNjZXNzKSByZXR1cm4gcmVzMjtcbiAgICAgICAgcmV0dXJuIFZhbGlkYXRpb24uRmFpbHVyZShUdXBsZS5UcmlwbGUobGFiZWwsIHJlczIudmFsdWVbMV0sIHJlczIudmFsdWVbMl0pKTtcbiAgICB9LCBsYWJlbCkuc2V0TGFiZWwobGFiZWwpO1xufVxuXG5sZXQgX2ZhaWwgPSBwYXJzZXIocG9zID0+IFZhbGlkYXRpb24uRmFpbHVyZShUdXBsZS5UcmlwbGUoJ3BhcnNpbmcgZmFpbGVkJywgJ19mYWlsJywgcG9zKSkpO1xuXG4vLyByZXR1cm4gbmV1dHJhbCBlbGVtZW50IGluc3RlYWQgb2YgbWVzc2FnZVxubGV0IF9zdWNjZWVkID0gcGFyc2VyKHBvcyA9PiBWYWxpZGF0aW9uLlN1Y2Nlc3MoVHVwbGUuUGFpcihUdXBsZS5QYWlyKCdwYXJzaW5nIHN1Y2NlZWRlZCcsIHBvcyksICdfc3VjY2VlZCcpKSk7XG5cbmV4cG9ydCBmdW5jdGlvbiBjaG9pY2UocGFyc2Vycykge1xuICAgIHJldHVybiBwYXJzZXJzLnJlZHVjZVJpZ2h0KChyZXN0LCBjdXJyKSA9PiBvckVsc2UoY3VyciwgcmVzdCksIF9mYWlsKVxuICAgICAgICAuc2V0TGFiZWwoJ2Nob2ljZSAnICsgcGFyc2Vycy5yZWR1Y2UoKGFjYywgY3VycikgPT4gYWNjICsgJy8nICsgY3Vyci5sYWJlbCwgJycpKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGFueU9mKGNoYXJzQXJyYXkpIHtcbiAgICByZXR1cm4gY2hvaWNlKGNoYXJzQXJyYXkubWFwKHBjaGFyKSlcbiAgICAgICAgLnNldExhYmVsKCdhbnlPZiAnICsgY2hhcnNBcnJheS5yZWR1Y2UoKGFjYywgY3VycikgPT4gYWNjICsgY3VyciwgJycpKTtcbn1cblxuZXhwb3J0IGNvbnN0IGxvd2VyY2FzZVAgPSBhbnlPZihbJ2EnLCAnYicsICdjJywgJ2QnLCAnZScsICdmJywgJ2cnLCAnaCcsICdpJywgJ2onLCAnaycsICdsJywgJ20nLCAnbicsICdvJywgJ3AnLCAncScsICdyJywgJ3MnLCAndCcsICd1JywgJ3YnLCAndycsICd4JywgJ3knLCAneicsXSkuc2V0TGFiZWwoJ2xvd2VyY2FzZVAnKTtcbmV4cG9ydCBjb25zdCB1cHBlcmNhc2VQID0gYW55T2YoWydBJywgJ0InLCAnQycsICdEJywgJ0UnLCAnRicsICdHJywgJ0gnLCAnSScsICdKJywgJ0snLCAnTCcsICdNJywgJ04nLCAnTycsICdQJywgJ1EnLCAnUicsICdTJywgJ1QnLCAnVScsICdWJywgJ1cnLCAnWCcsICdZJywgJ1onLF0pLnNldExhYmVsKCd1cHBlcmNhc2VQJyk7XG5leHBvcnQgY29uc3QgbGV0dGVyUCA9IGxvd2VyY2FzZVAub3JFbHNlKHVwcGVyY2FzZVApLnNldExhYmVsKCdsZXR0ZXJQJyk7XG5leHBvcnQgY29uc3QgZGlnaXRQID0gYW55T2YoWycwJywgJzEnLCAnMicsICczJywgJzQnLCAnNScsICc2JywgJzcnLCAnOCcsICc5J10pLnNldExhYmVsKCdkaWdpdFAnKTtcbmV4cG9ydCBjb25zdCB3aGl0ZVAgPSBhbnlPZihbJyAnLCAnXFx0JywgJ1xcbicsICdcXHInXSkuc2V0TGFiZWwoJ3doaXRlUCcpO1xuXG5leHBvcnQgZnVuY3Rpb24gZm1hcChmYWIsIHBhcnNlcjEpIHtcbiAgICBjb25zdCBsYWJlbCA9IHBhcnNlcjEubGFiZWwgKyAnIGZtYXAgJyArIGZhYi50b1N0cmluZygpO1xuICAgIHJldHVybiBwYXJzZXIocG9zID0+IHtcbiAgICAgICAgbGV0IHJlcyA9IHBhcnNlcjEucnVuKHBvcyk7XG4gICAgICAgIGlmIChyZXMuaXNTdWNjZXNzKSByZXR1cm4gVmFsaWRhdGlvbi5TdWNjZXNzKFR1cGxlLlBhaXIoZmFiKHJlcy52YWx1ZVswXSksIHJlcy52YWx1ZVsxXSkpO1xuICAgICAgICByZXR1cm4gVmFsaWRhdGlvbi5GYWlsdXJlKFR1cGxlLlRyaXBsZShsYWJlbCwgcmVzLnZhbHVlWzFdLCByZXMudmFsdWVbMl0pKTtcbiAgICB9LCBsYWJlbCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZXR1cm5QKHZhbHVlKSB7XG4gICAgcmV0dXJuIHBhcnNlcihwb3MgPT4gVmFsaWRhdGlvbi5TdWNjZXNzKFR1cGxlLlBhaXIodmFsdWUsIHBvcykpLCB2YWx1ZSk7XG59XG5cbi8vIHBhcnNlcihhIC0+IGIpIC0+IHBhcnNlcihhKSAtPiBwYXJzZXIoYilcbmV4cG9ydCBmdW5jdGlvbiBhcHBseVB4KGZQKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uICh4UCkge1xuICAgICAgICByZXR1cm4gYW5kVGhlbihmUCwgeFApLmZtYXAoKFtmLCB4XSkgPT4gZih4KSk7XG4gICAgfTtcbn1cblxuLy8gdXNpbmcgYmluZFxuZXhwb3J0IGZ1bmN0aW9uIGFwcGx5UChmUCkge1xuICAgIHJldHVybiBmdW5jdGlvbiAoeFApIHtcbiAgICAgICAgcmV0dXJuIGZQLmJpbmQocGFyc2VkVmFsdWVmID0+IHtcbiAgICAgICAgICAgIHJldHVybiB4UC5iaW5kKHBhcnNlZFZhbHVleCA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJldHVyblAocGFyc2VkVmFsdWVmKHBhcnNlZFZhbHVleCkpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBsaWZ0MihmYWFiKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uIChwYXJzZXIxKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAocGFyc2VyMikge1xuICAgICAgICAgICAgLy9yZXR1cm4gYXBwbHlQKGFwcGx5UChyZXR1cm5QKGZhYWIpKShwYXJzZXIxKSkocGFyc2VyMik7XG4gICAgICAgICAgICByZXR1cm4gcmV0dXJuUChmYWFiKS5hcHBseShwYXJzZXIxKS5hcHBseShwYXJzZXIyKTsgLy8gdXNpbmcgaW5zdGFuY2UgbWV0aG9kc1xuICAgICAgICB9O1xuICAgIH07XG59XG5cbi8vIHVzaW5nIGxpZnQyKGNvbnMpXG5leHBvcnQgZnVuY3Rpb24gc2VxdWVuY2VQKHBhcnNlcnMpIHtcbiAgICByZXR1cm4gcGFyc2Vyc1xuICAgICAgICAucmVkdWNlUmlnaHQoKHJlc3QsIGN1cnIpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBsaWZ0MihfY29ucykoY3VycikocmVzdCk7XG4gICAgICAgIH0sIHJldHVyblAoW10pKTtcbn1cblxuLy8gdXNpbmcgbmFpdmUgYW5kVGhlbiAmJiBmbWFwIC0tPiByZXR1cm5zIHN0cmluZ3MsIG5vdCBhcnJheXMhXG5leHBvcnQgZnVuY3Rpb24gc2VxdWVuY2VQMihwYXJzZXJzKSB7XG4gICAgcmV0dXJuIHBhcnNlcnNcbiAgICAgICAgLnJlZHVjZVJpZ2h0KChyZXN0LCBjdXJyKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gZm1hcCgoW3gsIHldKSA9PiB4ICsgeSwgYW5kVGhlbihjdXJyLCByZXN0KSk7XG4gICAgICAgIH0sIHJldHVyblAoJycpKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHBzdHJpbmcoc3RyKSB7XG4gICAgcmV0dXJuIHNlcXVlbmNlUChzdHIuc3BsaXQoJycpLm1hcChwY2hhcikpXG4gICAgICAgIC5zZXRMYWJlbCgncHN0cmluZyAnICsgc3RyKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHplcm9Pck1vcmUoeFApIHsgLy8gemVyb09yTW9yZSA6OiBwIGEgLT4gW2FdIC0+IHRyeSBbYV0gPSBwIGEgLT4gcCBbYV1cbiAgICByZXR1cm4gcG9zID0+IHtcbiAgICAgICAgbGV0IHJlczEgPSB4UC5ydW4ocG9zKTtcbiAgICAgICAgaWYgKHJlczEuaXNGYWlsdXJlKSByZXR1cm4gVmFsaWRhdGlvbi5TdWNjZXNzKFR1cGxlLlBhaXIoW10sIHBvcykpO1xuICAgICAgICBsZXQgcmVzTiA9IHplcm9Pck1vcmUoeFApKHJlczEudmFsdWVbMV0pO1xuICAgICAgICByZXR1cm4gVmFsaWRhdGlvbi5TdWNjZXNzKFR1cGxlLlBhaXIoW3JlczEudmFsdWVbMF1dLmNvbmNhdChyZXNOLnZhbHVlWzBdKSwgcmVzTi52YWx1ZVsxXSkpO1xuICAgIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtYW55KHhQLCB0aW1lcykge1xuICAgIGNvbnN0IHRpbWVzX2RlZmluZWQgPSAodHlwZW9mIHRpbWVzICE9PSAndW5kZWZpbmVkJyk7XG4gICAgY29uc3QgbGFiZWwgPSAnbWFueSAnICsgeFAubGFiZWxcbiAgICAgICAgKyAoKHRpbWVzX2RlZmluZWQpID8gJyB0aW1lcz0nICsgdGltZXMgOiAnJyk7XG4gICAgcmV0dXJuIHBhcnNlcihwb3MgPT4ge1xuICAgICAgICBjb25zdCByZXMgPSB6ZXJvT3JNb3JlKHhQKShwb3MpO1xuICAgICAgICBpZiAodGltZXNfZGVmaW5lZCkgey8vZGVidWdnZXI7XG4gICAgICAgICAgICBpZiAocmVzLmlzRmFpbHVyZSkgcmV0dXJuIHJlcztcbiAgICAgICAgICAgIGNvbnN0IHJlc3VsdExlbmd0aCA9IHJlcy52YWx1ZVswXS5sZW5ndGg7XG4gICAgICAgICAgICByZXR1cm4gKHJlc3VsdExlbmd0aCA9PT0gdGltZXMpXG4gICAgICAgICAgICAgICAgPyByZXNcbiAgICAgICAgICAgICAgICA6IFZhbGlkYXRpb24uRmFpbHVyZShUdXBsZS5UcmlwbGUobGFiZWwsICd0aW1lcyBwYXJhbSB3YW50ZWQgJyArIHRpbWVzICsgJzsgZ290ICcgKyByZXN1bHRMZW5ndGgsIHBvcykpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXM7XG4gICAgfSwgbGFiZWwpLnNldExhYmVsKGxhYmVsKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1hbnlDaGFycyh4UCwgdGltZXMpIHtcbiAgICByZXR1cm4gbWFueSh4UCwgdGltZXMpXG4gICAgICAgIC5mbWFwKGFycmEgPT4gYXJyYS5qb2luKCcnKSlcbiAgICAgICAgLnNldExhYmVsKCdtYW55Q2hhcnMgJyArIHhQLmxhYmVsXG4gICAgICAgICAgICArICgodHlwZW9mIHRpbWVzICE9PSAndW5kZWZpbmVkJykgPyAnIHRpbWVzPScgKyB0aW1lcyA6ICcnKSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtYW55MSh4UCkge1xuICAgIGNvbnN0IGxhYmVsID0gJ21hbnkxICcgKyB4UC5sYWJlbDtcbiAgICByZXR1cm4gcGFyc2VyKHBvcyA9PiB7XG4gICAgICAgIGxldCByZXMxID0geFAucnVuKHBvcyk7XG4gICAgICAgIGlmIChyZXMxLmlzRmFpbHVyZSkgcmV0dXJuIHJlczE7XG4gICAgICAgIGxldCByZXNOID0gemVyb09yTW9yZSh4UCkocmVzMS52YWx1ZVsxXSk7XG4gICAgICAgIHJldHVybiBWYWxpZGF0aW9uLlN1Y2Nlc3MoVHVwbGUuUGFpcihbcmVzMS52YWx1ZVswXV0uY29uY2F0KHJlc04udmFsdWVbMF0pLCByZXNOLnZhbHVlWzFdKSk7XG4gICAgfSwgbGFiZWwpLnNldExhYmVsKGxhYmVsKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1hbnlDaGFyczEoeFApIHtcbiAgICByZXR1cm4gbWFueTEoeFApXG4gICAgICAgIC5mbWFwKGFycmEgPT4gYXJyYS5qb2luKCcnKSlcbiAgICAgICAgLnNldExhYmVsKCdtYW55Q2hhcnMxICcgKyB4UC5sYWJlbCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBvcHQoeFAsIGRlZmF1bHRWYWx1ZSkge1xuICAgIGNvbnN0IGlzRGVmYXVsdCA9ICh0eXBlb2YgZGVmYXVsdFZhbHVlICE9PSAndW5kZWZpbmVkJyk7XG4gICAgY29uc3QgbGFiZWwgPSAnb3B0ICcgKyB4UC5sYWJlbFxuICAgICAgICArIChpc0RlZmF1bHQgPyAnKGRlZmF1bHQ9JyArIGRlZmF1bHRWYWx1ZSArICcpJyA6ICcnKTtcbiAgICByZXR1cm4gcGFyc2VyKHBvcyA9PiB7XG4gICAgICAgIGxldCByZXMgPSB4UC5mbWFwKE1heWJlLkp1c3QpLnJ1bihwb3MpO1xuICAgICAgICBpZiAocmVzLmlzU3VjY2VzcykgcmV0dXJuIHJlcztcbiAgICAgICAgbGV0IG91dGNvbWUgPSAoaXNEZWZhdWx0KSA/IE1heWJlLkp1c3QoZGVmYXVsdFZhbHVlKSA6IE1heWJlLk5vdGhpbmcoKTtcbiAgICAgICAgcmV0dXJuIFZhbGlkYXRpb24uU3VjY2VzcyhUdXBsZS5QYWlyKG91dGNvbWUsIHBvcykpO1xuICAgIH0sIGxhYmVsKS5zZXRMYWJlbChsYWJlbCk7XG59XG5cbi8vIG9wdCBmcm9tIHRoZSBib29rIC0gd29ya3Mgb2ssIGJ1dCB0b1N0cmluZygpIGdpdmVzIHN0cmFuZ2UgcmVzdWx0c1xuZXhwb3J0IGZ1bmN0aW9uIG9wdEJvb2socFgpIHtcbiAgICBjb25zdCBzb21lUCA9IHBYLmZtYXAoTWF5YmUuSnVzdCk7XG4gICAgY29uc3Qgbm9uZVAgPSByZXR1cm5QKE1heWJlLk5vdGhpbmcpO1xuICAgIHJldHVybiBzb21lUC5vckVsc2Uobm9uZVApO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZGlzY2FyZFNlY29uZChwMSwgcDIpIHtcbiAgICBjb25zdCBsYWJlbCA9IHAxLmxhYmVsICsgJyBkaXNjYXJkU2Vjb25kICcgKyBwMi5sYWJlbDtcbiAgICByZXR1cm4gcGFyc2VyKHBvcyA9PiB7XG4gICAgICAgIHJldHVybiBhbmRUaGVuKHAxLCBwMikuZm1hcCgoW3gsIHldKSA9PiB4KS5ydW4ocG9zKTtcbiAgICB9LCBsYWJlbCkuc2V0TGFiZWwobGFiZWwpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZGlzY2FyZEZpcnN0KHAxLCBwMikge1xuICAgIGNvbnN0IGxhYmVsID0gcDEubGFiZWwgKyAnIGRpc2NhcmRGaXJzdCAnICsgcDIubGFiZWw7XG4gICAgcmV0dXJuIHBhcnNlcihwb3MgPT4ge1xuICAgICAgICByZXR1cm4gYW5kVGhlbihwMSwgcDIpLmZtYXAoKFt4LCB5XSkgPT4geSkucnVuKHBvcyk7XG4gICAgfSwgbGFiZWwpLnNldExhYmVsKGxhYmVsKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNlcEJ5MUJvb2socHgsIHNlcCkge1xuICAgIHJldHVybiBweC5hbmRUaGVuKG1hbnkoc2VwLmRpc2NhcmRGaXJzdChweCkpKS5mbWFwKChbciwgcmxpc3RdKSA9PiBbcl0uY29uY2F0KHJsaXN0KSk7XG59XG5cbi8vIG15IHZlcnNpb24gd29ya3MganVzdCBmaW5lLi4uXG5leHBvcnQgZnVuY3Rpb24gc2VwQnkxKHZhbHVlUCwgc2VwYXJhdG9yUCkge1xuICAgIHJldHVybiBtYW55KG1hbnkxKHZhbHVlUCkuZGlzY2FyZFNlY29uZChvcHQoc2VwYXJhdG9yUCkpKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGJldHdlZW4ocDEsIHAyLCBwMykge1xuICAgIHJldHVybiBwMS5kaXNjYXJkRmlyc3QocDIpLmRpc2NhcmRTZWNvbmQocDMpXG4gICAgICAgIC5zZXRMYWJlbCgnYmV0d2VlbiAnICsgcDEubGFiZWwgKyAnLycgKyBwMi5sYWJlbCArICcvJyArIHAzLmxhYmVsKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGJldHdlZW5QYXJlbnMocHgpIHtcbiAgICByZXR1cm4gYmV0d2VlbihwY2hhcignKCcpLCBweCwgcGNoYXIoJyknKSlcbiAgICAgICAgLnNldExhYmVsKCdiZXR3ZWVuUGFyZW5zICcgKyBweC5sYWJlbCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBiaW5kUChmYW1iLCBweCkge1xuICAgIGxldCBsYWJlbCA9ICd1bmtub3duJztcbiAgICByZXR1cm4gcGFyc2VyKHBvcyA9PiB7XG4gICAgICAgIGNvbnN0IHJlcyA9IHB4LnJ1bihwb3MpO1xuICAgICAgICBpZiAocmVzLmlzRmFpbHVyZSkgcmV0dXJuIHJlcztcbiAgICAgICAgcmV0dXJuIGZhbWIocmVzLnZhbHVlWzBdKS5ydW4ocmVzLnZhbHVlWzFdKTtcbiAgICB9LCBsYWJlbCkuc2V0TGFiZWwobGFiZWwpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdGFwUChweCwgZm4pIHtcbiAgICByZXR1cm4gcHguYmluZChyZXMgPT4ge1xuICAgICAgICBmbihyZXMpO1xuICAgICAgICByZXR1cm4gcmV0dXJuUChyZXMpO1xuICAgIH0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbG9nUChweCkge1xuICAgIHJldHVybiB0YXBQKHB4LCByZXMgPT4gY29uc29sZS5sb2cocHgubGFiZWwgKyAnOicgKyByZXMpKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHB3b3JkKHdvcmQpIHtcbiAgICByZXR1cm4gdHJpbShwc3RyaW5nKHdvcmQpKVxuICAgICAgICAuc2V0TGFiZWwoJ3B3b3JkICcgKyB3b3JkKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHRyaW1QKHBYKSB7XG4gICAgcmV0dXJuIG9wdChtYW55KHdoaXRlUCkpXG4gICAgICAgIC5kaXNjYXJkRmlyc3QocFgpXG4gICAgICAgIC5kaXNjYXJkU2Vjb25kKG9wdChtYW55KHdoaXRlUCkpKVxuICAgICAgICAuc2V0TGFiZWwoJ3RyaW0gJyArIHBYLmxhYmVsKTtcbn1cblxuZnVuY3Rpb24gX2NvbnMoeCkge1xuICAgIHJldHVybiBmdW5jdGlvbiAoeHMpIHtcbiAgICAgICAgcmV0dXJuIFt4XS5jb25jYXQoeHMpO1xuICAgIH07XG59XG5cbmZ1bmN0aW9uIF9zZXRMYWJlbChweCwgbmV3TGFiZWwpIHtcbiAgICByZXR1cm4gcGFyc2VyKHBvcyA9PiB7XG4gICAgICAgIGxldCByZXN1bHQgPSBweC5ydW4ocG9zKTtcbiAgICAgICAgaWYgKHJlc3VsdC5pc0ZhaWx1cmUpIHJldHVybiBWYWxpZGF0aW9uLkZhaWx1cmUoVHVwbGUuVHJpcGxlKG5ld0xhYmVsLCByZXN1bHQudmFsdWVbMV0sIHJlc3VsdC52YWx1ZVsyXSkpO1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sIG5ld0xhYmVsKTtcbn1cblxuLy8gdGhlIHJlYWwgdGhpbmcuLi5cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZXIoZm4sIGxhYmVsKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgdHlwZTogJ3BhcnNlcicsXG4gICAgICAgIGxhYmVsOiBsYWJlbCxcbiAgICAgICAgcnVuKHBvcykge1xuICAgICAgICAgICAgcmV0dXJuIGZuKHBvcyk7XG4gICAgICAgIH0sXG4gICAgICAgIGFwcGx5KHB4KSB7XG4gICAgICAgICAgICByZXR1cm4gYXBwbHlQKHRoaXMpKHB4KTtcbiAgICAgICAgICAgIC8vcmV0dXJuIHRoaXMuYmluZChhbmRUaGVuKHRoaXMsIHB4KS5mbWFwKChbZiwgeF0pID0+IGYoeCkpKS5ydW47IC8vIHdlIGFyZSB0aGUgZlBcbiAgICAgICAgfSxcbiAgICAgICAgZm1hcChmYWIpIHtcbiAgICAgICAgICAgIC8vcmV0dXJuIGZtYXAoZmFiLCB0aGlzKTtcbiAgICAgICAgICAgIC8vcmV0dXJuIGJpbmRQKHBvcyA9PiByZXR1cm5QKGZhYihwb3MpKSwgdGhpcyk7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5iaW5kKHBhcnNlZFZhbHVlID0+IHJldHVyblAoZmFiKHBhcnNlZFZhbHVlKSkpO1xuICAgICAgICB9LFxuICAgICAgICBhbmRUaGVuKHB4KSB7XG4gICAgICAgICAgICByZXR1cm4gYW5kVGhlbih0aGlzLCBweCk7XG4gICAgICAgIH0sXG4gICAgICAgIG9yRWxzZShweCkge1xuICAgICAgICAgICAgcmV0dXJuIG9yRWxzZSh0aGlzLCBweCk7XG4gICAgICAgIH0sXG4gICAgICAgIGRpc2NhcmRGaXJzdChweCkge1xuICAgICAgICAgICAgcmV0dXJuIGRpc2NhcmRGaXJzdCh0aGlzLCBweCk7XG4gICAgICAgIH0sXG4gICAgICAgIGRpc2NhcmRTZWNvbmQocHgpIHtcbiAgICAgICAgICAgIHJldHVybiBkaXNjYXJkU2Vjb25kKHRoaXMsIHB4KTtcbiAgICAgICAgfSxcbiAgICAgICAgYmluZChmYW1iKSB7XG4gICAgICAgICAgICByZXR1cm4gYmluZFAoZmFtYiwgdGhpcyk7XG4gICAgICAgIH0sXG4gICAgICAgIHNldExhYmVsKG5ld0xhYmVsKSB7XG4gICAgICAgICAgICByZXR1cm4gX3NldExhYmVsKHRoaXMsIG5ld0xhYmVsKTtcbiAgICAgICAgfVxuICAgIH07XG59XG4iXX0=