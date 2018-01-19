define(['exports', 'classes', 'maybe', 'validation'], function (exports, _classes, _maybe, _validation) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.whiteP = exports.digitP = exports.letterP = exports.uppercaseP = exports.lowercaseP = exports.discardFirst = exports.discardSecond = exports.orElse = exports.andThen = exports.predicateBasedParser = exports.digitParser = exports.charParser = undefined;
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

    function anyOf(chars) {
        return choice(chars.map(pchar)).setLabel('anyOf ' + chars.reduce(function (acc, curr) {
            return acc + curr;
        }, ''));
    }

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

    function many(xP) {
        var label = 'many ' + xP.label;
        return parser(function (pos) {
            return zeroOrMore(xP)(pos);
        }, label).setLabel(label);
    }

    function manyChars(xP) {
        return many(xP).fmap(function (arra) {
            return arra.join('');
        }).setLabel('manyChars ' + xP.label);
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

    function opt(xP) {
        var label = 'opt ' + xP.label;
        return parser(function (pos) {
            var res = xP.fmap(function (x) {
                return _maybe.Maybe.Just(x);
            }).run(pos);
            if (res.isSuccess) return res;
            return _validation.Validation.Success(_classes.Tuple.Pair(_maybe.Maybe.Nothing(), pos));
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

    var lowercaseP = exports.lowercaseP = anyOf(['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z']);
    var uppercaseP = exports.uppercaseP = anyOf(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']);
    var letterP = exports.letterP = lowercaseP.orElse(uppercaseP);
    var digitP = exports.digitP = anyOf(['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']);
    var whiteP = exports.whiteP = anyOf([' ', '\t', '\n', '\r']);
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2pzL3BhcnNlcnMuanMiXSwibmFtZXMiOlsicGNoYXIiLCJwZGlnaXQiLCJhbmRUaGVuQmluZCIsImNob2ljZSIsImFueU9mIiwiZm1hcCIsInJldHVyblAiLCJhcHBseVB4IiwiYXBwbHlQIiwibGlmdDIiLCJzZXF1ZW5jZVAiLCJzZXF1ZW5jZVAyIiwicHN0cmluZyIsInplcm9Pck1vcmUiLCJtYW55IiwibWFueUNoYXJzIiwibWFueTEiLCJtYW55Q2hhcnMxIiwib3B0Iiwib3B0Qm9vayIsInNlcEJ5MUJvb2siLCJzZXBCeTEiLCJiZXR3ZWVuIiwiYmV0d2VlblBhcmVucyIsImJpbmRQIiwicGFyc2VyIiwiY2hhclBhcnNlciIsInBvcyIsImZyb21UZXh0Iiwib3B0Q2hhciIsImNoYXIiLCJpc05vdGhpbmciLCJGYWlsdXJlIiwiVHJpcGxlIiwidmFsdWUiLCJTdWNjZXNzIiwiUGFpciIsImluY3JQb3MiLCJkaWdpdFBhcnNlciIsInBhcnNlSW50IiwiZGlnaXQiLCJwcmVkaWNhdGVCYXNlZFBhcnNlciIsInByZWQiLCJsYWJlbCIsInJlc3VsdCIsInNldExhYmVsIiwiYW5kVGhlbiIsInAxIiwicDIiLCJyZXMxIiwicnVuIiwiaXNTdWNjZXNzIiwicmVzMiIsImJpbmQiLCJwYXJzZWRWYWx1ZTEiLCJwYXJzZWRWYWx1ZTIiLCJvckVsc2UiLCJfZmFpbCIsIl9zdWNjZWVkIiwicGFyc2VycyIsInJlZHVjZVJpZ2h0IiwicmVzdCIsImN1cnIiLCJyZWR1Y2UiLCJhY2MiLCJjaGFycyIsIm1hcCIsImZhYiIsInBhcnNlcjEiLCJ0b1N0cmluZyIsInJlcyIsImZQIiwieFAiLCJmIiwieCIsInBhcnNlZFZhbHVlZiIsInBhcnNlZFZhbHVleCIsImZhYWIiLCJwYXJzZXIyIiwiYXBwbHkiLCJfY29ucyIsInkiLCJzdHIiLCJzcGxpdCIsImlzRmFpbHVyZSIsInJlc04iLCJjb25jYXQiLCJhcnJhIiwiam9pbiIsIkp1c3QiLCJOb3RoaW5nIiwicFgiLCJzb21lUCIsIm5vbmVQIiwiZGlzY2FyZFNlY29uZCIsImRpc2NhcmRGaXJzdCIsInB4Iiwic2VwIiwiciIsInJsaXN0IiwidmFsdWVQIiwic2VwYXJhdG9yUCIsInAzIiwiZmFtYiIsInhzIiwiX3NldExhYmVsIiwibmV3TGFiZWwiLCJmbiIsInR5cGUiLCJwYXJzZWRWYWx1ZSIsImxvd2VyY2FzZVAiLCJ1cHBlcmNhc2VQIiwibGV0dGVyUCIsImRpZ2l0UCIsIndoaXRlUCJdLCJtYXBwaW5ncyI6Ijs7Ozs7OztZQW1DZ0JBLEssR0FBQUEsSztZQVFBQyxNLEdBQUFBLE07WUFrQkFDLFcsR0FBQUEsVztZQXdCQUMsTSxHQUFBQSxNO1lBS0FDLEssR0FBQUEsSztZQUtBQyxJLEdBQUFBLEk7WUFTQUMsTyxHQUFBQSxPO1lBS0FDLE8sR0FBQUEsTztZQU9BQyxNLEdBQUFBLE07WUFVQUMsSyxHQUFBQSxLO1lBVUFDLFMsR0FBQUEsUztZQVFBQyxVLEdBQUFBLFU7WUFPQUMsTyxHQUFBQSxPO1lBS0FDLFUsR0FBQUEsVTtZQVNBQyxJLEdBQUFBLEk7WUFPQUMsUyxHQUFBQSxTO1lBTUFDLEssR0FBQUEsSztZQVVBQyxVLEdBQUFBLFU7WUFNQUMsRyxHQUFBQSxHO1lBVUFDLE8sR0FBQUEsTztZQW9CQUMsVSxHQUFBQSxVO1lBS0FDLE0sR0FBQUEsTTtZQUlBQyxPLEdBQUFBLE87WUFLQUMsYSxHQUFBQSxhO1lBS0FDLEssR0FBQUEsSztZQXdCQUMsTSxHQUFBQSxNOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBcFF1Qjs7QUFFdkMsUUFBTUMsYUFBYSxTQUFiQSxVQUFhO0FBQUEsZUFBUSxlQUFPO0FBQzlCLGdCQUFJLE9BQU9DLEdBQVAsS0FBZSxRQUFuQixFQUE2QkEsTUFBTSxrQkFBU0MsUUFBVCxDQUFrQkQsR0FBbEIsQ0FBTjtBQUM3QixnQkFBTUUsVUFBVUYsSUFBSUcsSUFBSixFQUFoQjtBQUNBLGdCQUFJRCxRQUFRRSxTQUFaLEVBQXVCLE9BQU8sdUJBQVdDLE9BQVgs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RUFBc0YsR0FBdEYsRUFBMkYsR0FBM0YsRUFBZ0csR0FBaEcsRUFBcUcsR0FBckcsRUFBMEcsR0FBMUcsRUFBK0csR0FBL0csRUFBb0gsR0FBcEgsRUFBeUgsR0FBekgsRUFBOEgsR0FBOUgsQ0FBTixDQUFuQjtBQUNBLFFBQU0yRyxrQ0FBYTNHLE1BQU0sQ0FBQyxHQUFELEVBQU0sR0FBTixFQUFXLEdBQVgsRUFBZ0IsR0FBaEIsRUFBcUIsR0FBckIsRUFBMEIsR0FBMUIsRUFBK0IsR0FBL0IsRUFBb0MsR0FBcEMsRUFBeUMsR0FBekMsRUFBOEMsR0FBOUMsRUFBbUQsR0FBbkQsRUFBd0QsR0FBeEQsRUFBNkQsR0FBN0QsRUFBa0UsR0FBbEUsRUFBdUUsR0FBdkUsRUFBNEUsR0FBNUUsRUFBaUYsR0FBakYsRUFBc0YsR0FBdEYsRUFBMkYsR0FBM0YsRUFBZ0csR0FBaEcsRUFBcUcsR0FBckcsRUFBMEcsR0FBMUcsRUFBK0csR0FBL0csRUFBb0gsR0FBcEgsRUFBeUgsR0FBekgsRUFBOEgsR0FBOUgsQ0FBTixDQUFuQjtBQUNBLFFBQU00Ryw0QkFBVUYsV0FBV3RELE1BQVgsQ0FBa0J1RCxVQUFsQixDQUFoQjtBQUNBLFFBQU1FLDBCQUFTN0csTUFBTSxDQUFDLEdBQUQsRUFBTSxHQUFOLEVBQVcsR0FBWCxFQUFnQixHQUFoQixFQUFxQixHQUFyQixFQUEwQixHQUExQixFQUErQixHQUEvQixFQUFvQyxHQUFwQyxFQUF5QyxHQUF6QyxFQUE4QyxHQUE5QyxDQUFOLENBQWY7QUFDQSxRQUFNOEcsMEJBQVM5RyxNQUFNLENBQUMsR0FBRCxFQUFNLElBQU4sRUFBWSxJQUFaLEVBQWtCLElBQWxCLENBQU4sQ0FBZiIsImZpbGUiOiJwYXJzZXJzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8gY2ZyLiBcIlVuZGVyc3RhbmRpbmcgUGFyc2VyIENvbWJpbmF0b3JzXCIgKEYjIGZvciBGdW4gYW5kIFByb2ZpdClcblxuaW1wb3J0IHtcbiAgICBUdXBsZSxcbiAgICBQb3NpdGlvbixcbn0gZnJvbSAnY2xhc3Nlcyc7XG5pbXBvcnQge01heWJlfSBmcm9tICdtYXliZSc7IC8vIEp1c3Qgb3IgTm90aGluZ1xuaW1wb3J0IHtWYWxpZGF0aW9ufSBmcm9tICd2YWxpZGF0aW9uJzsgLy8gU3VjY2VzcyBvciBGYWlsdXJlXG5cbmNvbnN0IGNoYXJQYXJzZXIgPSBjaGFyID0+IHBvcyA9PiB7XG4gICAgaWYgKHR5cGVvZiBwb3MgPT09ICdzdHJpbmcnKSBwb3MgPSBQb3NpdGlvbi5mcm9tVGV4dChwb3MpO1xuICAgIGNvbnN0IG9wdENoYXIgPSBwb3MuY2hhcigpO1xuICAgIGlmIChvcHRDaGFyLmlzTm90aGluZykgcmV0dXJuIFZhbGlkYXRpb24uRmFpbHVyZShUdXBsZS5UcmlwbGUoJ2NoYXJQYXJzZXInLCAnbm8gbW9yZSBpbnB1dCcsIHBvcykpO1xuICAgIGlmIChvcHRDaGFyLnZhbHVlID09PSBjaGFyKSByZXR1cm4gVmFsaWRhdGlvbi5TdWNjZXNzKFR1cGxlLlBhaXIoY2hhciwgcG9zLmluY3JQb3MoKSkpO1xuICAgIHJldHVybiBWYWxpZGF0aW9uLkZhaWx1cmUoVHVwbGUuVHJpcGxlKCdjaGFyUGFyc2VyJywgJ3dhbnRlZCAnICsgY2hhciArICc7IGdvdCAnICsgb3B0Q2hhci52YWx1ZSwgcG9zKSk7XG59O1xuXG5jb25zdCBkaWdpdFBhcnNlciA9IGRpZ2l0ID0+IHBvcyA9PiB7XG4gICAgaWYgKHR5cGVvZiBwb3MgPT09ICdzdHJpbmcnKSBwb3MgPSBQb3NpdGlvbi5mcm9tVGV4dChwb3MpO1xuICAgIGNvbnN0IG9wdENoYXIgPSBwb3MuY2hhcigpO1xuICAgIGlmIChvcHRDaGFyLmlzTm90aGluZykgcmV0dXJuIFZhbGlkYXRpb24uRmFpbHVyZShUdXBsZS5UcmlwbGUoJ2RpZ2l0UGFyc2VyJywgJ25vIG1vcmUgaW5wdXQnLCBwb3MpKTtcbiAgICBpZiAocGFyc2VJbnQob3B0Q2hhci52YWx1ZSwgMTApID09PSBkaWdpdCkgcmV0dXJuIFZhbGlkYXRpb24uU3VjY2VzcyhUdXBsZS5QYWlyKGRpZ2l0LCBwb3MuaW5jclBvcygpKSk7XG4gICAgcmV0dXJuIFZhbGlkYXRpb24uRmFpbHVyZShUdXBsZS5UcmlwbGUoJ2RpZ2l0UGFyc2VyJywgJ3dhbnRlZCAnICsgZGlnaXQgKyAnOyBnb3QgJyArIG9wdENoYXIudmFsdWUsIHBvcykpO1xufTtcblxuY29uc3QgcHJlZGljYXRlQmFzZWRQYXJzZXIgPSAocHJlZCwgbGFiZWwpID0+IHBvcyA9PiB7XG4gICAgaWYgKHR5cGVvZiBwb3MgPT09ICdzdHJpbmcnKSBwb3MgPSBQb3NpdGlvbi5mcm9tVGV4dChwb3MpO1xuICAgIGNvbnN0IG9wdENoYXIgPSBwb3MuY2hhcigpO1xuICAgIGlmIChvcHRDaGFyLmlzTm90aGluZykgcmV0dXJuIFZhbGlkYXRpb24uRmFpbHVyZShUdXBsZS5UcmlwbGUobGFiZWwsICdubyBtb3JlIGlucHV0JywgcG9zKSk7XG4gICAgaWYgKHByZWQob3B0Q2hhci52YWx1ZSkpIHJldHVybiBWYWxpZGF0aW9uLlN1Y2Nlc3MoVHVwbGUuUGFpcihvcHRDaGFyLnZhbHVlLCBwb3MuaW5jclBvcygpKSk7XG4gICAgcmV0dXJuIFZhbGlkYXRpb24uRmFpbHVyZShUdXBsZS5UcmlwbGUobGFiZWwsICd1bmV4cGVjdGVkIGNoYXI6ICcgKyBvcHRDaGFyLnZhbHVlLCBwb3MpKTtcbn07XG5cbmV4cG9ydCB7Y2hhclBhcnNlciwgZGlnaXRQYXJzZXIsIHByZWRpY2F0ZUJhc2VkUGFyc2VyfTtcblxuZXhwb3J0IGZ1bmN0aW9uIHBjaGFyKGNoYXIpIHtcbiAgICBjb25zdCBsYWJlbCA9ICdwY2hhcl8nICsgY2hhcjtcbiAgICBsZXQgcmVzdWx0ID0gZnVuY3Rpb24gKHBvcykge1xuICAgICAgICByZXR1cm4gY2hhclBhcnNlcihjaGFyKShwb3MpO1xuICAgIH07XG4gICAgcmV0dXJuIHBhcnNlcihyZXN1bHQsIGxhYmVsKS5zZXRMYWJlbChsYWJlbCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwZGlnaXQoZGlnaXQpIHtcbiAgICByZXR1cm4gcGFyc2VyKHBvcyA9PiBkaWdpdFBhcnNlcihkaWdpdCkocG9zKSwgJ3BkaWdpdF8nICsgZGlnaXQpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYW5kVGhlbihwMSwgcDIpIHtcbiAgICBjb25zdCBsYWJlbCA9IHAxLmxhYmVsICsgJyBhbmRUaGVuICcgKyBwMi5sYWJlbDtcbiAgICByZXR1cm4gcGFyc2VyKGZ1bmN0aW9uIChwb3MpIHtcbiAgICAgICAgbGV0IHJlczEgPSBwMS5ydW4ocG9zKTtcbiAgICAgICAgaWYgKHJlczEuaXNTdWNjZXNzKSB7XG4gICAgICAgICAgICBsZXQgcmVzMiA9IHAyLnJ1bihyZXMxLnZhbHVlWzFdKTtcbiAgICAgICAgICAgIGlmIChyZXMyLmlzU3VjY2Vzcykge1xuICAgICAgICAgICAgICAgIHJldHVybiBWYWxpZGF0aW9uLlN1Y2Nlc3MoVHVwbGUuUGFpcihUdXBsZS5QYWlyKHJlczEudmFsdWVbMF0sIHJlczIudmFsdWVbMF0pLCByZXMyLnZhbHVlWzFdKSk7XG4gICAgICAgICAgICB9IGVsc2UgcmV0dXJuIFZhbGlkYXRpb24uRmFpbHVyZShUdXBsZS5UcmlwbGUobGFiZWwsIHJlczIudmFsdWVbMV0sIHJlczIudmFsdWVbMl0pKTtcbiAgICAgICAgfSBlbHNlIHJldHVybiBWYWxpZGF0aW9uLkZhaWx1cmUoVHVwbGUuVHJpcGxlKGxhYmVsLCByZXMxLnZhbHVlWzFdLCByZXMxLnZhbHVlWzJdKSk7XG4gICAgfSwgbGFiZWwpO1xufVxuXG4vLyB1c2luZyBiaW5kXG5leHBvcnQgZnVuY3Rpb24gYW5kVGhlbkJpbmQocDEsIHAyKSB7XG4gICAgcmV0dXJuIHAxLmJpbmQocGFyc2VkVmFsdWUxID0+IHtcbiAgICAgICAgcmV0dXJuIHAyLmJpbmQocGFyc2VkVmFsdWUyID0+IHtcbiAgICAgICAgICAgIHJldHVybiByZXR1cm5QKFR1cGxlLlBhaXIocGFyc2VkVmFsdWUxLCBwYXJzZWRWYWx1ZTIpKTtcbiAgICAgICAgfSk7XG4gICAgfSkuc2V0TGFiZWwocDEubGFiZWwgKyAnIGFuZFRoZW4gJyArIHAyLmxhYmVsKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG9yRWxzZShwMSwgcDIpIHtcbiAgICBjb25zdCBsYWJlbCA9IHAxLmxhYmVsICsgJyBvckVsc2UgJyArIHAyLmxhYmVsO1xuICAgIHJldHVybiBwYXJzZXIocG9zID0+IHtcbiAgICAgICAgY29uc3QgcmVzMSA9IHAxLnJ1bihwb3MpO1xuICAgICAgICBpZiAocmVzMS5pc1N1Y2Nlc3MpIHJldHVybiByZXMxO1xuICAgICAgICBjb25zdCByZXMyID0gcDIucnVuKHBvcyk7XG4gICAgICAgIGlmIChyZXMyLmlzU3VjY2VzcykgcmV0dXJuIHJlczI7XG4gICAgICAgIHJldHVybiBWYWxpZGF0aW9uLkZhaWx1cmUoVHVwbGUuVHJpcGxlKGxhYmVsLCByZXMyLnZhbHVlWzFdLCByZXMyLnZhbHVlWzJdKSk7XG4gICAgfSwgbGFiZWwpLnNldExhYmVsKGxhYmVsKTtcbn1cblxubGV0IF9mYWlsID0gcGFyc2VyKHBvcyA9PiBWYWxpZGF0aW9uLkZhaWx1cmUoVHVwbGUuVHJpcGxlKCdwYXJzaW5nIGZhaWxlZCcsICdfZmFpbCcsIHBvcykpKTtcblxuLy8gcmV0dXJuIG5ldXRyYWwgZWxlbWVudCBpbnN0ZWFkIG9mIG1lc3NhZ2VcbmxldCBfc3VjY2VlZCA9IHBhcnNlcihwb3MgPT4gVmFsaWRhdGlvbi5TdWNjZXNzKFR1cGxlLlBhaXIoVHVwbGUuUGFpcigncGFyc2luZyBzdWNjZWVkZWQnLCBwb3MpLCAnX3N1Y2NlZWQnKSkpO1xuXG5leHBvcnQgZnVuY3Rpb24gY2hvaWNlKHBhcnNlcnMpIHtcbiAgICByZXR1cm4gcGFyc2Vycy5yZWR1Y2VSaWdodCgocmVzdCwgY3VycikgPT4gb3JFbHNlKGN1cnIsIHJlc3QpLCBfZmFpbClcbiAgICAgICAgLnNldExhYmVsKCdjaG9pY2UgJyArIHBhcnNlcnMucmVkdWNlKChhY2MsIGN1cnIpID0+IGFjYyArICcvJyArIGN1cnIubGFiZWwsICcnKSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhbnlPZihjaGFycykge1xuICAgIHJldHVybiBjaG9pY2UoY2hhcnMubWFwKHBjaGFyKSlcbiAgICAgICAgLnNldExhYmVsKCdhbnlPZiAnICsgY2hhcnMucmVkdWNlKChhY2MsIGN1cnIpID0+IGFjYyArIGN1cnIsICcnKSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBmbWFwKGZhYiwgcGFyc2VyMSkge1xuICAgIGNvbnN0IGxhYmVsID0gcGFyc2VyMS5sYWJlbCArICcgZm1hcCAnICsgZmFiLnRvU3RyaW5nKCk7XG4gICAgcmV0dXJuIHBhcnNlcihwb3MgPT4ge1xuICAgICAgICBsZXQgcmVzID0gcGFyc2VyMS5ydW4ocG9zKTtcbiAgICAgICAgaWYgKHJlcy5pc1N1Y2Nlc3MpIHJldHVybiBWYWxpZGF0aW9uLlN1Y2Nlc3MoVHVwbGUuUGFpcihmYWIocmVzLnZhbHVlWzBdKSwgcmVzLnZhbHVlWzFdKSk7XG4gICAgICAgIHJldHVybiBWYWxpZGF0aW9uLkZhaWx1cmUoVHVwbGUuVHJpcGxlKGxhYmVsLCByZXMudmFsdWVbMV0sIHJlcy52YWx1ZVsyXSkpO1xuICAgIH0sIGxhYmVsKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJldHVyblAodmFsdWUpIHtcbiAgICByZXR1cm4gcGFyc2VyKHBvcyA9PiBWYWxpZGF0aW9uLlN1Y2Nlc3MoVHVwbGUuUGFpcih2YWx1ZSwgcG9zKSksIHZhbHVlKTtcbn1cblxuLy8gcGFyc2VyKGEgLT4gYikgLT4gcGFyc2VyKGEpIC0+IHBhcnNlcihiKVxuZXhwb3J0IGZ1bmN0aW9uIGFwcGx5UHgoZlApIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKHhQKSB7XG4gICAgICAgIHJldHVybiBhbmRUaGVuKGZQLCB4UCkuZm1hcCgoW2YsIHhdKSA9PiBmKHgpKTtcbiAgICB9O1xufVxuXG4vLyB1c2luZyBiaW5kXG5leHBvcnQgZnVuY3Rpb24gYXBwbHlQKGZQKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uICh4UCkge1xuICAgICAgICByZXR1cm4gZlAuYmluZChwYXJzZWRWYWx1ZWYgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHhQLmJpbmQocGFyc2VkVmFsdWV4ID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmV0dXJuUChwYXJzZWRWYWx1ZWYocGFyc2VkVmFsdWV4KSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGxpZnQyKGZhYWIpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKHBhcnNlcjEpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChwYXJzZXIyKSB7XG4gICAgICAgICAgICAvL3JldHVybiBhcHBseVAoYXBwbHlQKHJldHVyblAoZmFhYikpKHBhcnNlcjEpKShwYXJzZXIyKTtcbiAgICAgICAgICAgIHJldHVybiByZXR1cm5QKGZhYWIpLmFwcGx5KHBhcnNlcjEpLmFwcGx5KHBhcnNlcjIpOyAvLyB1c2luZyBpbnN0YW5jZSBtZXRob2RzXG4gICAgICAgIH07XG4gICAgfTtcbn1cblxuLy8gdXNpbmcgbGlmdDIoY29ucylcbmV4cG9ydCBmdW5jdGlvbiBzZXF1ZW5jZVAocGFyc2Vycykge1xuICAgIHJldHVybiBwYXJzZXJzXG4gICAgICAgIC5yZWR1Y2VSaWdodCgocmVzdCwgY3VycikgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIGxpZnQyKF9jb25zKShjdXJyKShyZXN0KTtcbiAgICAgICAgfSwgcmV0dXJuUChbXSkpO1xufVxuXG4vLyB1c2luZyBuYWl2ZSBhbmRUaGVuICYmIGZtYXAgLS0+IHJldHVybnMgc3RyaW5ncywgbm90IGFycmF5cyFcbmV4cG9ydCBmdW5jdGlvbiBzZXF1ZW5jZVAyKHBhcnNlcnMpIHtcbiAgICByZXR1cm4gcGFyc2Vyc1xuICAgICAgICAucmVkdWNlUmlnaHQoKHJlc3QsIGN1cnIpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBmbWFwKChbeCwgeV0pID0+IHggKyB5LCBhbmRUaGVuKGN1cnIsIHJlc3QpKTtcbiAgICAgICAgfSwgcmV0dXJuUCgnJykpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcHN0cmluZyhzdHIpIHtcbiAgICByZXR1cm4gc2VxdWVuY2VQKHN0ci5zcGxpdCgnJykubWFwKHBjaGFyKSlcbiAgICAgICAgLnNldExhYmVsKCdwc3RyaW5nICcgKyBzdHIpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gemVyb09yTW9yZSh4UCkgeyAvLyB6ZXJvT3JNb3JlIDo6IHAgYSAtPiBbYV0gLT4gdHJ5IFthXSA9IHAgYSAtPiBwIFthXVxuICAgIHJldHVybiBwb3MgPT4ge1xuICAgICAgICBsZXQgcmVzMSA9IHhQLnJ1bihwb3MpO1xuICAgICAgICBpZiAocmVzMS5pc0ZhaWx1cmUpIHJldHVybiBWYWxpZGF0aW9uLlN1Y2Nlc3MoVHVwbGUuUGFpcihbXSwgcG9zKSk7XG4gICAgICAgIGxldCByZXNOID0gemVyb09yTW9yZSh4UCkocmVzMS52YWx1ZVsxXSk7XG4gICAgICAgIHJldHVybiBWYWxpZGF0aW9uLlN1Y2Nlc3MoVHVwbGUuUGFpcihbcmVzMS52YWx1ZVswXV0uY29uY2F0KHJlc04udmFsdWVbMF0pLCByZXNOLnZhbHVlWzFdKSk7XG4gICAgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1hbnkoeFApIHtcbiAgICBjb25zdCBsYWJlbCA9ICdtYW55ICcgKyB4UC5sYWJlbDtcbiAgICByZXR1cm4gcGFyc2VyKHBvcyA9PiB7XG4gICAgICAgIHJldHVybiB6ZXJvT3JNb3JlKHhQKShwb3MpO1xuICAgIH0sIGxhYmVsKS5zZXRMYWJlbChsYWJlbCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtYW55Q2hhcnMoeFApIHtcbiAgICByZXR1cm4gbWFueSh4UClcbiAgICAgICAgLmZtYXAoYXJyYSA9PiBhcnJhLmpvaW4oJycpKVxuICAgICAgICAuc2V0TGFiZWwoJ21hbnlDaGFycyAnICsgeFAubGFiZWwpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbWFueTEoeFApIHtcbiAgICBjb25zdCBsYWJlbCA9ICdtYW55MSAnICsgeFAubGFiZWw7XG4gICAgcmV0dXJuIHBhcnNlcihwb3MgPT4ge1xuICAgICAgICBsZXQgcmVzMSA9IHhQLnJ1bihwb3MpO1xuICAgICAgICBpZiAocmVzMS5pc0ZhaWx1cmUpIHJldHVybiByZXMxO1xuICAgICAgICBsZXQgcmVzTiA9IHplcm9Pck1vcmUoeFApKHJlczEudmFsdWVbMV0pO1xuICAgICAgICByZXR1cm4gVmFsaWRhdGlvbi5TdWNjZXNzKFR1cGxlLlBhaXIoW3JlczEudmFsdWVbMF1dLmNvbmNhdChyZXNOLnZhbHVlWzBdKSwgcmVzTi52YWx1ZVsxXSkpO1xuICAgIH0sIGxhYmVsKS5zZXRMYWJlbChsYWJlbCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtYW55Q2hhcnMxKHhQKSB7XG4gICAgcmV0dXJuIG1hbnkxKHhQKVxuICAgICAgICAuZm1hcChhcnJhID0+IGFycmEuam9pbignJykpXG4gICAgICAgIC5zZXRMYWJlbCgnbWFueUNoYXJzMSAnICsgeFAubGFiZWwpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gb3B0KHhQKSB7XG4gICAgY29uc3QgbGFiZWwgPSAnb3B0ICcgKyB4UC5sYWJlbDtcbiAgICByZXR1cm4gcGFyc2VyKHBvcyA9PiB7XG4gICAgICAgIGxldCByZXMgPSB4UC5mbWFwKHggPT4gTWF5YmUuSnVzdCh4KSkucnVuKHBvcyk7XG4gICAgICAgIGlmIChyZXMuaXNTdWNjZXNzKSByZXR1cm4gcmVzO1xuICAgICAgICByZXR1cm4gVmFsaWRhdGlvbi5TdWNjZXNzKFR1cGxlLlBhaXIoTWF5YmUuTm90aGluZygpLCBwb3MpKTtcbiAgICB9LCBsYWJlbCkuc2V0TGFiZWwobGFiZWwpO1xufVxuXG4vLyBvcHQgZnJvbSB0aGUgYm9vayAtIHdvcmtzIG9rLCBidXQgdG9TdHJpbmcoKSBnaXZlcyBzdHJhbmdlIHJlc3VsdHNcbmV4cG9ydCBmdW5jdGlvbiBvcHRCb29rKHBYKSB7XG4gICAgY29uc3Qgc29tZVAgPSBwWC5mbWFwKE1heWJlLkp1c3QpO1xuICAgIGNvbnN0IG5vbmVQID0gcmV0dXJuUChNYXliZS5Ob3RoaW5nKTtcbiAgICByZXR1cm4gc29tZVAub3JFbHNlKG5vbmVQKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRpc2NhcmRTZWNvbmQocDEsIHAyKSB7XG4gICAgY29uc3QgbGFiZWwgPSBwMS5sYWJlbCArICcgZGlzY2FyZFNlY29uZCAnICsgcDIubGFiZWw7XG4gICAgcmV0dXJuIHBhcnNlcihwb3MgPT4ge1xuICAgICAgICByZXR1cm4gYW5kVGhlbihwMSwgcDIpLmZtYXAoKFt4LCB5XSkgPT4geCkucnVuKHBvcyk7XG4gICAgfSwgbGFiZWwpLnNldExhYmVsKGxhYmVsKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRpc2NhcmRGaXJzdChwMSwgcDIpIHtcbiAgICBjb25zdCBsYWJlbCA9IHAxLmxhYmVsICsgJyBkaXNjYXJkRmlyc3QgJyArIHAyLmxhYmVsO1xuICAgIHJldHVybiBwYXJzZXIocG9zID0+IHtcbiAgICAgICAgcmV0dXJuIGFuZFRoZW4ocDEsIHAyKS5mbWFwKChbeCwgeV0pID0+IHkpLnJ1bihwb3MpO1xuICAgIH0sIGxhYmVsKS5zZXRMYWJlbChsYWJlbCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzZXBCeTFCb29rKHB4LCBzZXApIHtcbiAgICByZXR1cm4gcHguYW5kVGhlbihtYW55KHNlcC5kaXNjYXJkRmlyc3QocHgpKSkuZm1hcCgoW3IsIHJsaXN0XSkgPT4gW3JdLmNvbmNhdChybGlzdCkpO1xufVxuXG4vLyBteSB2ZXJzaW9uIHdvcmtzIGp1c3QgZmluZS4uLlxuZXhwb3J0IGZ1bmN0aW9uIHNlcEJ5MSh2YWx1ZVAsIHNlcGFyYXRvclApIHtcbiAgICByZXR1cm4gbWFueShtYW55MSh2YWx1ZVApLmRpc2NhcmRTZWNvbmQob3B0KHNlcGFyYXRvclApKSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBiZXR3ZWVuKHAxLCBwMiwgcDMpIHtcbiAgICByZXR1cm4gcDEuZGlzY2FyZEZpcnN0KHAyKS5kaXNjYXJkU2Vjb25kKHAzKVxuICAgICAgICAuc2V0TGFiZWwoJ2JldHdlZW4gJyArIHAxLmxhYmVsICsgJy8nICsgcDIubGFiZWwgKyAnLycgKyBwMy5sYWJlbCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBiZXR3ZWVuUGFyZW5zKHB4KSB7XG4gICAgcmV0dXJuIGJldHdlZW4ocGNoYXIoJygnKSwgcHgsIHBjaGFyKCcpJykpXG4gICAgICAgIC5zZXRMYWJlbCgnYmV0d2VlblBhcmVucyAnICsgcHgubGFiZWwpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYmluZFAoZmFtYiwgcHgpIHtcbiAgICBsZXQgbGFiZWwgPSAndW5rbm93bic7XG4gICAgcmV0dXJuIHBhcnNlcihwb3MgPT4ge1xuICAgICAgICBjb25zdCByZXMgPSBweC5ydW4ocG9zKTtcbiAgICAgICAgaWYgKHJlcy5pc0ZhaWx1cmUpIHJldHVybiByZXM7XG4gICAgICAgIHJldHVybiBmYW1iKHJlcy52YWx1ZVswXSkucnVuKHJlcy52YWx1ZVsxXSk7XG4gICAgfSwgbGFiZWwpLnNldExhYmVsKGxhYmVsKTtcbn1cblxuZnVuY3Rpb24gX2NvbnMoeCkge1xuICAgIHJldHVybiBmdW5jdGlvbiAoeHMpIHtcbiAgICAgICAgcmV0dXJuIFt4XS5jb25jYXQoeHMpO1xuICAgIH07XG59XG5cbmZ1bmN0aW9uIF9zZXRMYWJlbChweCwgbmV3TGFiZWwpIHtcbiAgICByZXR1cm4gcGFyc2VyKHBvcyA9PiB7XG4gICAgICAgIGxldCByZXN1bHQgPSBweC5ydW4ocG9zKTtcbiAgICAgICAgaWYgKHJlc3VsdC5pc0ZhaWx1cmUpIHJldHVybiBWYWxpZGF0aW9uLkZhaWx1cmUoVHVwbGUuVHJpcGxlKG5ld0xhYmVsLCByZXN1bHQudmFsdWVbMV0sIHJlc3VsdC52YWx1ZVsyXSkpO1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sIG5ld0xhYmVsKTtcbn1cblxuLy8gdGhlIHJlYWwgdGhpbmcuLi5cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZXIoZm4sIGxhYmVsKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgdHlwZTogJ3BhcnNlcicsXG4gICAgICAgIGxhYmVsOiBsYWJlbCxcbiAgICAgICAgcnVuKHBvcykge1xuICAgICAgICAgICAgcmV0dXJuIGZuKHBvcyk7XG4gICAgICAgIH0sXG4gICAgICAgIGFwcGx5KHB4KSB7XG4gICAgICAgICAgICByZXR1cm4gYXBwbHlQKHRoaXMpKHB4KTtcbiAgICAgICAgICAgIC8vcmV0dXJuIHRoaXMuYmluZChhbmRUaGVuKHRoaXMsIHB4KS5mbWFwKChbZiwgeF0pID0+IGYoeCkpKS5ydW47IC8vIHdlIGFyZSB0aGUgZlBcbiAgICAgICAgfSxcbiAgICAgICAgZm1hcChmYWIpIHtcbiAgICAgICAgICAgIC8vcmV0dXJuIGZtYXAoZmFiLCB0aGlzKTtcbiAgICAgICAgICAgIC8vcmV0dXJuIGJpbmRQKHBvcyA9PiByZXR1cm5QKGZhYihwb3MpKSwgdGhpcyk7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5iaW5kKHBhcnNlZFZhbHVlID0+IHJldHVyblAoZmFiKHBhcnNlZFZhbHVlKSkpO1xuICAgICAgICB9LFxuICAgICAgICBhbmRUaGVuKHB4KSB7XG4gICAgICAgICAgICByZXR1cm4gYW5kVGhlbih0aGlzLCBweCk7XG4gICAgICAgIH0sXG4gICAgICAgIG9yRWxzZShweCkge1xuICAgICAgICAgICAgcmV0dXJuIG9yRWxzZSh0aGlzLCBweCk7XG4gICAgICAgIH0sXG4gICAgICAgIGRpc2NhcmRGaXJzdChweCkge1xuICAgICAgICAgICAgcmV0dXJuIGRpc2NhcmRGaXJzdCh0aGlzLCBweCk7XG4gICAgICAgIH0sXG4gICAgICAgIGRpc2NhcmRTZWNvbmQocHgpIHtcbiAgICAgICAgICAgIHJldHVybiBkaXNjYXJkU2Vjb25kKHRoaXMsIHB4KTtcbiAgICAgICAgfSxcbiAgICAgICAgYmluZChmYW1iKSB7XG4gICAgICAgICAgICByZXR1cm4gYmluZFAoZmFtYiwgdGhpcyk7XG4gICAgICAgIH0sXG4gICAgICAgIHNldExhYmVsKG5ld0xhYmVsKSB7XG4gICAgICAgICAgICByZXR1cm4gX3NldExhYmVsKHRoaXMsIG5ld0xhYmVsKTtcbiAgICAgICAgfVxuICAgIH07XG59XG5cbmV4cG9ydCBjb25zdCBsb3dlcmNhc2VQID0gYW55T2YoWydhJywgJ2InLCAnYycsICdkJywgJ2UnLCAnZicsICdnJywgJ2gnLCAnaScsICdqJywgJ2snLCAnbCcsICdtJywgJ24nLCAnbycsICdwJywgJ3EnLCAncicsICdzJywgJ3QnLCAndScsICd2JywgJ3cnLCAneCcsICd5JywgJ3onLF0pO1xuZXhwb3J0IGNvbnN0IHVwcGVyY2FzZVAgPSBhbnlPZihbJ0EnLCAnQicsICdDJywgJ0QnLCAnRScsICdGJywgJ0cnLCAnSCcsICdJJywgJ0onLCAnSycsICdMJywgJ00nLCAnTicsICdPJywgJ1AnLCAnUScsICdSJywgJ1MnLCAnVCcsICdVJywgJ1YnLCAnVycsICdYJywgJ1knLCAnWicsXSk7XG5leHBvcnQgY29uc3QgbGV0dGVyUCA9IGxvd2VyY2FzZVAub3JFbHNlKHVwcGVyY2FzZVApO1xuZXhwb3J0IGNvbnN0IGRpZ2l0UCA9IGFueU9mKFsnMCcsICcxJywgJzInLCAnMycsICc0JywgJzUnLCAnNicsICc3JywgJzgnLCAnOSddKTtcbmV4cG9ydCBjb25zdCB3aGl0ZVAgPSBhbnlPZihbJyAnLCAnXFx0JywgJ1xcbicsICdcXHInXSk7XG4iXX0=