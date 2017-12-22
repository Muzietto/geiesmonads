define(['exports', 'util', 'classes', 'maybe', 'validation'], function (exports, _util, _classes, _maybe, _validation) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.discardFirst = exports.discardSecond = exports.orElse = exports.andThen = exports.digitParser = exports.charParser = undefined;
    exports.pchar = pchar;
    exports.pdigit = pdigit;
    exports.andThenX = andThenX;
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
    exports.many1 = many1;
    exports.opt = opt;
    exports.optBook = optBook;
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
        return function (str) {
            if ('' === str) return _validation.Validation.Failure(_classes.Tuple.Pair('charParser', 'no more input'));
            if ((0, _util.head)(str) === char) return _validation.Validation.Success(_classes.Tuple.Pair(char, (0, _util.tail)(str)));
            return _validation.Validation.Failure(_classes.Tuple.Pair('charParser', 'wanted ' + char + '; got ' + (0, _util.head)(str)));
        };
    };

    var digitParser = function digitParser(digit) {
        return function (str) {
            if ('' === str) return _validation.Validation.Failure(_classes.Tuple.Pair('digitParser', 'no more input'));
            if (parseInt((0, _util.head)(str), 10) === digit) return _validation.Validation.Success(_classes.Tuple.Pair(digit, (0, _util.tail)(str)));
            return _validation.Validation.Failure(_classes.Tuple.Pair('digitParser', 'wanted ' + digit + '; got ' + (0, _util.head)(str)));
        };
    };

    exports.charParser = charParser;
    exports.digitParser = digitParser;
    function pchar(char) {
        var label = 'pchar_' + char;
        var result = function result(str) {
            return charParser(char)(str);
        };
        return parser(result, label).setLabel(label);
    }

    function pdigit(digit) {
        return parser(function (str) {
            return digitParser(digit)(str);
        }, 'pdigit_' + digit);
    }

    function andThenX(p1, p2) {
        var label = p1.label + ' andThen ' + p2.label;
        return parser(function (str) {
            var res1 = p1.run(str);
            if (res1.isSuccess) {
                var res2 = p2.run(res1.value[1]);
                if (res2.isSuccess) {
                    return _validation.Validation.Success(_classes.Tuple.Pair(_classes.Tuple.Pair(res1.value[0], res2.value[0]), res2.value[1]));
                } else return _validation.Validation.Failure(_classes.Tuple.Pair(label, res2.value[1]));
            } else return _validation.Validation.Failure(_classes.Tuple.Pair(label, res1.value[1]));
        }, label);
    }

    // using bind
    function _andThen(p1, p2) {
        return p1.bind(function (parsedValue1) {
            return p2.bind(function (parsedValue2) {
                return returnP(_classes.Tuple.Pair(parsedValue1, parsedValue2));
            });
        }).setLabel(p1.label + ' andThen ' + p2.label);
    }

    exports.andThen = _andThen;
    function _orElse(p1, p2) {
        var label = p1.label + ' orElse ' + p2.label;
        return parser(function (str) {
            var res1 = p1.run(str);
            if (res1.isSuccess) return res1;
            var res2 = p2.run(str);
            if (res2.isSuccess) return res2;
            return _validation.Validation.Failure(_classes.Tuple.Pair(label, res2.value[1]));
        }, label).setLabel(label);
    }

    exports.orElse = _orElse;
    var _fail = parser(function (str) {
        return _validation.Validation.Failure(_classes.Tuple.Pair(_classes.Tuple.Pair('parsing failed', '_fail'), '_fail'));
    });

    // return neutral element instead of message
    var _succeed = parser(function (str) {
        return _validation.Validation.Success(_classes.Tuple.Pair(_classes.Tuple.Pair('parsing succeeded', str), '_succeed'));
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
        return parser(function (str) {
            var res = parser1.run(str);
            if (res.isSuccess) return _validation.Validation.Success(_classes.Tuple.Pair(fab(res.value[0]), res.value[1]));
            return _validation.Validation.Failure(_classes.Tuple.Pair(label, res.value[1]));
        }, label);
    }

    function returnP(value) {
        return parser(function (str) {
            return _validation.Validation.Success(_classes.Tuple.Pair(value, str));
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
        return function (str) {
            var res1 = xP.run(str);
            if (res1.isFailure) return _validation.Validation.Success(_classes.Tuple.Pair([], str));
            var resN = zeroOrMore(xP)(res1.value[1]);
            return _validation.Validation.Success(_classes.Tuple.Pair([res1.value[0]].concat(resN.value[0]), resN.value[1]));
        };
    }

    function many(xP) {
        var label = 'many ' + xP.label;
        return parser(function (str) {
            return zeroOrMore(xP)(str);
        }, label).setLabel(label);
    }

    function many1(xP) {
        var label = 'many1 ' + xP.label;
        return parser(function (str) {
            var res1 = xP.run(str);
            if (res1.isFailure) return res1;
            var resN = zeroOrMore(xP)(res1.value[1]);
            return _validation.Validation.Success(_classes.Tuple.Pair([res1.value[0]].concat(resN.value[0]), resN.value[1]));
        }, label).setLabel(label);
    }

    function opt(xP) {
        var label = 'opt ' + xP.label;
        return parser(function (str) {
            var res = xP.fmap(function (x) {
                return _maybe.Maybe.Just(x);
            }).run(str);
            if (res.isSuccess) return res;
            return _validation.Validation.Success(_classes.Tuple.Pair(_maybe.Maybe.Nothing(), str));
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
        return parser(function (str) {
            return _andThen(p1, p2).fmap(function (_ref5) {
                var _ref6 = _slicedToArray(_ref5, 2),
                    x = _ref6[0],
                    y = _ref6[1];

                return x;
            }).run(str);
        }, label).setLabel(label);
    }

    exports.discardSecond = _discardSecond;
    function _discardFirst(p1, p2) {
        var label = p1.label + ' discardFirst ' + p2.label;
        return parser(function (str) {
            return _andThen(p1, p2).fmap(function (_ref7) {
                var _ref8 = _slicedToArray(_ref7, 2),
                    x = _ref8[0],
                    y = _ref8[1];

                return y;
            }).run(str);
        }, label).setLabel(label);
    }

    exports.discardFirst = _discardFirst;
    function between(p1, p2, p3) {
        return p1.discardFirst(p2).discardSecond(p3).setLabel('between ' + p1.label + '/' + p2.label + '/' + p3.label);
    }

    function betweenParens(px) {
        return between(pchar('('), px, pchar(')')).setLabel('betweenParens ' + px.label);
    }

    function bindP(famb, px) {
        var label = 'unknown';
        return parser(function (str) {
            var res = px.run(str);
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
        return parser(function (str) {
            var result = px.run(str);
            if (result.isFailure) return _validation.Validation.Failure(_classes.Tuple.Pair(newLabel, result.value[1]));
            return result;
        }, newLabel);
    }

    // the real thing...
    function parser(fn, label) {
        return {
            type: 'parser',
            label: label,
            run: function run(str) {
                return fn(str);
            },
            apply: function apply(px) {
                return applyP(this)(px);
                //return this.bind(andThen(this, px).fmap(([f, x]) => f(x))).run; // we are the fP
            },
            fmap: function fmap(fab) {
                //return fmap(fab, this);
                //return bindP(str => returnP(fab(str)), this);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2pzL3BhcnNlcnMuanMiXSwibmFtZXMiOlsicGNoYXIiLCJwZGlnaXQiLCJhbmRUaGVuWCIsImNob2ljZSIsImFueU9mIiwiZm1hcCIsInJldHVyblAiLCJhcHBseVB4IiwiYXBwbHlQIiwibGlmdDIiLCJzZXF1ZW5jZVAiLCJzZXF1ZW5jZVAyIiwicHN0cmluZyIsInplcm9Pck1vcmUiLCJtYW55IiwibWFueTEiLCJvcHQiLCJvcHRCb29rIiwiYmV0d2VlbiIsImJldHdlZW5QYXJlbnMiLCJiaW5kUCIsInBhcnNlciIsImNoYXJQYXJzZXIiLCJzdHIiLCJGYWlsdXJlIiwiUGFpciIsImNoYXIiLCJTdWNjZXNzIiwiZGlnaXRQYXJzZXIiLCJwYXJzZUludCIsImRpZ2l0IiwibGFiZWwiLCJyZXN1bHQiLCJzZXRMYWJlbCIsInAxIiwicDIiLCJyZXMxIiwicnVuIiwiaXNTdWNjZXNzIiwicmVzMiIsInZhbHVlIiwiYW5kVGhlbiIsImJpbmQiLCJwYXJzZWRWYWx1ZTEiLCJwYXJzZWRWYWx1ZTIiLCJvckVsc2UiLCJfZmFpbCIsIl9zdWNjZWVkIiwicGFyc2VycyIsInJlZHVjZVJpZ2h0IiwicmVzdCIsImN1cnIiLCJyZWR1Y2UiLCJhY2MiLCJjaGFycyIsIm1hcCIsImZhYiIsInBhcnNlcjEiLCJ0b1N0cmluZyIsInJlcyIsImZQIiwieFAiLCJmIiwieCIsInBhcnNlZFZhbHVlZiIsInBhcnNlZFZhbHVleCIsImZhYWIiLCJwYXJzZXIyIiwiYXBwbHkiLCJfY29ucyIsInkiLCJzcGxpdCIsImlzRmFpbHVyZSIsInJlc04iLCJjb25jYXQiLCJKdXN0IiwiTm90aGluZyIsInBYIiwic29tZVAiLCJub25lUCIsImRpc2NhcmRTZWNvbmQiLCJkaXNjYXJkRmlyc3QiLCJwMyIsInB4IiwiZmFtYiIsInhzIiwiX3NldExhYmVsIiwibmV3TGFiZWwiLCJmbiIsInR5cGUiLCJwYXJzZWRWYWx1ZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7OztZQTJCZ0JBLEssR0FBQUEs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c0MsRUFBYixDQUFQO0FBQ0gsYUFwQkU7QUFxQkhGLHdCQXJCRyx3QkFxQlVFLEVBckJWLEVBcUJjO0FBQ2IsdUJBQU9GLGNBQWEsSUFBYixFQUFtQkUsRUFBbkIsQ0FBUDtBQUNILGFBdkJFO0FBd0JISCx5QkF4QkcseUJBd0JXRyxFQXhCWCxFQXdCZTtBQUNkLHVCQUFPSCxlQUFjLElBQWQsRUFBb0JHLEVBQXBCLENBQVA7QUFDSCxhQTFCRTtBQTJCSHpDLGdCQTNCRyxnQkEyQkUwQyxJQTNCRixFQTJCUTtBQUNQLHVCQUFPaEUsTUFBTWdFLElBQU4sRUFBWSxJQUFaLENBQVA7QUFDSCxhQTdCRTtBQThCSG5ELG9CQTlCRyxvQkE4Qk1zRCxRQTlCTixFQThCZ0I7QUFDZix1QkFBT0QsVUFBVSxJQUFWLEVBQWdCQyxRQUFoQixDQUFQO0FBQ0g7QUFoQ0UsU0FBUDtBQWtDSCIsImZpbGUiOiJwYXJzZXJzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8gY2ZyLiBcIlVuZGVyc3RhbmRpbmcgUGFyc2VyIENvbWJpbmF0b3JzXCIgKEYjIGZvciBGdW4gYW5kIFByb2ZpdClcblxuaW1wb3J0IHtcbiAgICBoZWFkLFxuICAgIHRhaWwsXG59IGZyb20gJ3V0aWwnO1xuaW1wb3J0IHtcbiAgICBUdXBsZSxcbiAgICBQb3NpdGlvbixcbn0gZnJvbSAnY2xhc3Nlcyc7XG5pbXBvcnQge01heWJlfSBmcm9tICdtYXliZSc7IC8vIEp1c3Qgb3IgTm90aGluZ1xuaW1wb3J0IHtWYWxpZGF0aW9ufSBmcm9tICd2YWxpZGF0aW9uJzsgLy8gU3VjY2VzcyBvciBGYWlsdXJlXG5cbmNvbnN0IGNoYXJQYXJzZXIgPSBjaGFyID0+IHN0ciA9PiB7XG4gICAgaWYgKCcnID09PSBzdHIpIHJldHVybiBWYWxpZGF0aW9uLkZhaWx1cmUoVHVwbGUuUGFpcignY2hhclBhcnNlcicsICdubyBtb3JlIGlucHV0JykpO1xuICAgIGlmIChoZWFkKHN0cikgPT09IGNoYXIpIHJldHVybiBWYWxpZGF0aW9uLlN1Y2Nlc3MoVHVwbGUuUGFpcihjaGFyLCB0YWlsKHN0cikpKTtcbiAgICByZXR1cm4gVmFsaWRhdGlvbi5GYWlsdXJlKFR1cGxlLlBhaXIoJ2NoYXJQYXJzZXInLCAnd2FudGVkICcgKyBjaGFyICsgJzsgZ290ICcgKyBoZWFkKHN0cikpKTtcbn07XG5cbmNvbnN0IGRpZ2l0UGFyc2VyID0gZGlnaXQgPT4gc3RyID0+IHtcbiAgICBpZiAoJycgPT09IHN0cikgcmV0dXJuIFZhbGlkYXRpb24uRmFpbHVyZShUdXBsZS5QYWlyKCdkaWdpdFBhcnNlcicsICdubyBtb3JlIGlucHV0JykpO1xuICAgIGlmIChwYXJzZUludChoZWFkKHN0ciksIDEwKSA9PT0gZGlnaXQpIHJldHVybiBWYWxpZGF0aW9uLlN1Y2Nlc3MoVHVwbGUuUGFpcihkaWdpdCwgdGFpbChzdHIpKSk7XG4gICAgcmV0dXJuIFZhbGlkYXRpb24uRmFpbHVyZShUdXBsZS5QYWlyKCdkaWdpdFBhcnNlcicsICd3YW50ZWQgJyArIGRpZ2l0ICsgJzsgZ290ICcgKyBoZWFkKHN0cikpKTtcbn07XG5cbmV4cG9ydCB7Y2hhclBhcnNlciwgZGlnaXRQYXJzZXJ9O1xuXG5leHBvcnQgZnVuY3Rpb24gcGNoYXIoY2hhcikge1xuICAgIGNvbnN0IGxhYmVsID0gJ3BjaGFyXycgKyBjaGFyO1xuICAgIGxldCByZXN1bHQgPSBmdW5jdGlvbiAoc3RyKSB7XG4gICAgICAgIHJldHVybiBjaGFyUGFyc2VyKGNoYXIpKHN0cik7XG4gICAgfTtcbiAgICByZXR1cm4gcGFyc2VyKHJlc3VsdCwgbGFiZWwpLnNldExhYmVsKGxhYmVsKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHBkaWdpdChkaWdpdCkge1xuICAgIHJldHVybiBwYXJzZXIoc3RyID0+IGRpZ2l0UGFyc2VyKGRpZ2l0KShzdHIpLCAncGRpZ2l0XycgKyBkaWdpdCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhbmRUaGVuWChwMSwgcDIpIHtcbiAgICBjb25zdCBsYWJlbCA9IHAxLmxhYmVsICsgJyBhbmRUaGVuICcgKyBwMi5sYWJlbDtcbiAgICByZXR1cm4gcGFyc2VyKGZ1bmN0aW9uIChzdHIpIHtcbiAgICAgICAgbGV0IHJlczEgPSBwMS5ydW4oc3RyKTtcbiAgICAgICAgaWYgKHJlczEuaXNTdWNjZXNzKSB7XG4gICAgICAgICAgICBsZXQgcmVzMiA9IHAyLnJ1bihyZXMxLnZhbHVlWzFdKTtcbiAgICAgICAgICAgIGlmIChyZXMyLmlzU3VjY2Vzcykge1xuICAgICAgICAgICAgICAgIHJldHVybiBWYWxpZGF0aW9uLlN1Y2Nlc3MoVHVwbGUuUGFpcihUdXBsZS5QYWlyKHJlczEudmFsdWVbMF0sIHJlczIudmFsdWVbMF0pLCByZXMyLnZhbHVlWzFdKSk7XG4gICAgICAgICAgICB9IGVsc2UgcmV0dXJuIFZhbGlkYXRpb24uRmFpbHVyZShUdXBsZS5QYWlyKGxhYmVsLCByZXMyLnZhbHVlWzFdKSk7XG4gICAgICAgIH0gZWxzZSByZXR1cm4gVmFsaWRhdGlvbi5GYWlsdXJlKFR1cGxlLlBhaXIobGFiZWwsIHJlczEudmFsdWVbMV0pKTtcbiAgICB9LCBsYWJlbCk7XG59XG5cbi8vIHVzaW5nIGJpbmRcbmV4cG9ydCBmdW5jdGlvbiBhbmRUaGVuKHAxLCBwMikge1xuICAgIHJldHVybiBwMS5iaW5kKHBhcnNlZFZhbHVlMSA9PiB7XG4gICAgICAgIHJldHVybiBwMi5iaW5kKHBhcnNlZFZhbHVlMiA9PiB7XG4gICAgICAgICAgICByZXR1cm4gcmV0dXJuUChUdXBsZS5QYWlyKHBhcnNlZFZhbHVlMSwgcGFyc2VkVmFsdWUyKSk7XG4gICAgICAgIH0pO1xuICAgIH0pLnNldExhYmVsKHAxLmxhYmVsICsgJyBhbmRUaGVuICcgKyBwMi5sYWJlbCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBvckVsc2UocDEsIHAyKSB7XG4gICAgY29uc3QgbGFiZWwgPSBwMS5sYWJlbCArICcgb3JFbHNlICcgKyBwMi5sYWJlbDtcbiAgICByZXR1cm4gcGFyc2VyKHN0ciA9PiB7XG4gICAgICAgIGNvbnN0IHJlczEgPSBwMS5ydW4oc3RyKTtcbiAgICAgICAgaWYgKHJlczEuaXNTdWNjZXNzKSByZXR1cm4gcmVzMTtcbiAgICAgICAgY29uc3QgcmVzMiA9IHAyLnJ1bihzdHIpO1xuICAgICAgICBpZiAocmVzMi5pc1N1Y2Nlc3MpIHJldHVybiByZXMyO1xuICAgICAgICByZXR1cm4gVmFsaWRhdGlvbi5GYWlsdXJlKFR1cGxlLlBhaXIobGFiZWwsIHJlczIudmFsdWVbMV0pKTtcbiAgICB9LCBsYWJlbCkuc2V0TGFiZWwobGFiZWwpO1xufVxuXG5sZXQgX2ZhaWwgPSBwYXJzZXIoc3RyID0+IFZhbGlkYXRpb24uRmFpbHVyZShUdXBsZS5QYWlyKFR1cGxlLlBhaXIoJ3BhcnNpbmcgZmFpbGVkJywgJ19mYWlsJyksICdfZmFpbCcpKSk7XG5cbi8vIHJldHVybiBuZXV0cmFsIGVsZW1lbnQgaW5zdGVhZCBvZiBtZXNzYWdlXG5sZXQgX3N1Y2NlZWQgPSBwYXJzZXIoc3RyID0+IFZhbGlkYXRpb24uU3VjY2VzcyhUdXBsZS5QYWlyKFR1cGxlLlBhaXIoJ3BhcnNpbmcgc3VjY2VlZGVkJywgc3RyKSwgJ19zdWNjZWVkJykpKTtcblxuZXhwb3J0IGZ1bmN0aW9uIGNob2ljZShwYXJzZXJzKSB7XG4gICAgcmV0dXJuIHBhcnNlcnMucmVkdWNlUmlnaHQoKHJlc3QsIGN1cnIpID0+IG9yRWxzZShjdXJyLCByZXN0KSwgX2ZhaWwpXG4gICAgICAgIC5zZXRMYWJlbCgnY2hvaWNlICcgKyBwYXJzZXJzLnJlZHVjZSgoYWNjLCBjdXJyKSA9PiBhY2MgKyAnLycgKyBjdXJyLmxhYmVsLCAnJykpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYW55T2YoY2hhcnMpIHtcbiAgICByZXR1cm4gY2hvaWNlKGNoYXJzLm1hcChwY2hhcikpXG4gICAgICAgIC5zZXRMYWJlbCgnYW55T2YgJyArIGNoYXJzLnJlZHVjZSgoYWNjLCBjdXJyKSA9PiBhY2MgKyBjdXJyLCAnJykpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZm1hcChmYWIsIHBhcnNlcjEpIHtcbiAgICBjb25zdCBsYWJlbCA9IHBhcnNlcjEubGFiZWwgKyAnIGZtYXAgJyArIGZhYi50b1N0cmluZygpO1xuICAgIHJldHVybiBwYXJzZXIoc3RyID0+IHtcbiAgICAgICAgbGV0IHJlcyA9IHBhcnNlcjEucnVuKHN0cik7XG4gICAgICAgIGlmIChyZXMuaXNTdWNjZXNzKSByZXR1cm4gVmFsaWRhdGlvbi5TdWNjZXNzKFR1cGxlLlBhaXIoZmFiKHJlcy52YWx1ZVswXSksIHJlcy52YWx1ZVsxXSkpO1xuICAgICAgICByZXR1cm4gVmFsaWRhdGlvbi5GYWlsdXJlKFR1cGxlLlBhaXIobGFiZWwsIHJlcy52YWx1ZVsxXSkpO1xuICAgIH0sIGxhYmVsKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJldHVyblAodmFsdWUpIHtcbiAgICByZXR1cm4gcGFyc2VyKHN0ciA9PiBWYWxpZGF0aW9uLlN1Y2Nlc3MoVHVwbGUuUGFpcih2YWx1ZSwgc3RyKSksIHZhbHVlKTtcbn1cblxuLy8gcGFyc2VyKGEgLT4gYikgLT4gcGFyc2VyKGEpIC0+IHBhcnNlcihiKVxuZXhwb3J0IGZ1bmN0aW9uIGFwcGx5UHgoZlApIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKHhQKSB7XG4gICAgICAgIHJldHVybiBhbmRUaGVuKGZQLCB4UCkuZm1hcCgoW2YsIHhdKSA9PiBmKHgpKTtcbiAgICB9O1xufVxuXG4vLyB1c2luZyBiaW5kXG5leHBvcnQgZnVuY3Rpb24gYXBwbHlQKGZQKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uICh4UCkge1xuICAgICAgICByZXR1cm4gZlAuYmluZChwYXJzZWRWYWx1ZWYgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHhQLmJpbmQocGFyc2VkVmFsdWV4ID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmV0dXJuUChwYXJzZWRWYWx1ZWYocGFyc2VkVmFsdWV4KSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGxpZnQyKGZhYWIpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKHBhcnNlcjEpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChwYXJzZXIyKSB7XG4gICAgICAgICAgICAvL3JldHVybiBhcHBseVAoYXBwbHlQKHJldHVyblAoZmFhYikpKHBhcnNlcjEpKShwYXJzZXIyKTtcbiAgICAgICAgICAgIHJldHVybiByZXR1cm5QKGZhYWIpLmFwcGx5KHBhcnNlcjEpLmFwcGx5KHBhcnNlcjIpOyAvLyB1c2luZyBpbnN0YW5jZSBtZXRob2RzXG4gICAgICAgIH07XG4gICAgfTtcbn1cblxuLy8gdXNpbmcgbGlmdDIoY29ucylcbmV4cG9ydCBmdW5jdGlvbiBzZXF1ZW5jZVAocGFyc2Vycykge1xuICAgIHJldHVybiBwYXJzZXJzXG4gICAgICAgIC5yZWR1Y2VSaWdodCgocmVzdCwgY3VycikgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIGxpZnQyKF9jb25zKShjdXJyKShyZXN0KTtcbiAgICAgICAgfSwgcmV0dXJuUChbXSkpO1xufVxuXG4vLyB1c2luZyBuYWl2ZSBhbmRUaGVuICYmIGZtYXAgLS0+IHJldHVybnMgc3RyaW5ncywgbm90IGFycmF5cyFcbmV4cG9ydCBmdW5jdGlvbiBzZXF1ZW5jZVAyKHBhcnNlcnMpIHtcbiAgICByZXR1cm4gcGFyc2Vyc1xuICAgICAgICAucmVkdWNlUmlnaHQoKHJlc3QsIGN1cnIpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBmbWFwKChbeCwgeV0pID0+IHggKyB5LCBhbmRUaGVuKGN1cnIsIHJlc3QpKTtcbiAgICAgICAgfSwgcmV0dXJuUCgnJykpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcHN0cmluZyhzdHIpIHtcbiAgICByZXR1cm4gc2VxdWVuY2VQKHN0ci5zcGxpdCgnJykubWFwKHBjaGFyKSlcbiAgICAgICAgLnNldExhYmVsKCdwc3RyaW5nICcgKyBzdHIpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gemVyb09yTW9yZSh4UCkgeyAvLyB6ZXJvT3JNb3JlIDo6IHAgYSAtPiBbYV0gLT4gdHJ5IFthXSA9IHAgYSAtPiBwIFthXVxuICAgIHJldHVybiBzdHIgPT4ge1xuICAgICAgICBsZXQgcmVzMSA9IHhQLnJ1bihzdHIpO1xuICAgICAgICBpZiAocmVzMS5pc0ZhaWx1cmUpIHJldHVybiBWYWxpZGF0aW9uLlN1Y2Nlc3MoVHVwbGUuUGFpcihbXSwgc3RyKSk7XG4gICAgICAgIGxldCByZXNOID0gemVyb09yTW9yZSh4UCkocmVzMS52YWx1ZVsxXSk7XG4gICAgICAgIHJldHVybiBWYWxpZGF0aW9uLlN1Y2Nlc3MoVHVwbGUuUGFpcihbcmVzMS52YWx1ZVswXV0uY29uY2F0KHJlc04udmFsdWVbMF0pLCByZXNOLnZhbHVlWzFdKSk7XG4gICAgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1hbnkoeFApIHtcbiAgICBjb25zdCBsYWJlbCA9ICdtYW55ICcgKyB4UC5sYWJlbDtcbiAgICByZXR1cm4gcGFyc2VyKHN0ciA9PiB7XG4gICAgICAgIHJldHVybiB6ZXJvT3JNb3JlKHhQKShzdHIpO1xuICAgIH0sIGxhYmVsKS5zZXRMYWJlbChsYWJlbCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtYW55MSh4UCkge1xuICAgIGNvbnN0IGxhYmVsID0gJ21hbnkxICcgKyB4UC5sYWJlbDtcbiAgICByZXR1cm4gcGFyc2VyKHN0ciA9PiB7XG4gICAgICAgIGxldCByZXMxID0geFAucnVuKHN0cik7XG4gICAgICAgIGlmIChyZXMxLmlzRmFpbHVyZSkgcmV0dXJuIHJlczE7XG4gICAgICAgIGxldCByZXNOID0gemVyb09yTW9yZSh4UCkocmVzMS52YWx1ZVsxXSk7XG4gICAgICAgIHJldHVybiBWYWxpZGF0aW9uLlN1Y2Nlc3MoVHVwbGUuUGFpcihbcmVzMS52YWx1ZVswXV0uY29uY2F0KHJlc04udmFsdWVbMF0pLCByZXNOLnZhbHVlWzFdKSk7XG4gICAgfSwgbGFiZWwpLnNldExhYmVsKGxhYmVsKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG9wdCh4UCkge1xuICAgIGNvbnN0IGxhYmVsID0gJ29wdCAnICsgeFAubGFiZWw7XG4gICAgcmV0dXJuIHBhcnNlcihzdHIgPT4ge1xuICAgICAgICBsZXQgcmVzID0geFAuZm1hcCh4ID0+IE1heWJlLkp1c3QoeCkpLnJ1bihzdHIpO1xuICAgICAgICBpZiAocmVzLmlzU3VjY2VzcykgcmV0dXJuIHJlcztcbiAgICAgICAgcmV0dXJuIFZhbGlkYXRpb24uU3VjY2VzcyhUdXBsZS5QYWlyKE1heWJlLk5vdGhpbmcoKSwgc3RyKSk7XG4gICAgfSwgbGFiZWwpLnNldExhYmVsKGxhYmVsKTtcbn1cblxuLy8gb3B0IGZyb20gdGhlIGJvb2sgLSB3b3JrcyBvaywgYnV0IHRvU3RyaW5nKCkgZ2l2ZXMgc3RyYW5nZSByZXN1bHRzXG5leHBvcnQgZnVuY3Rpb24gb3B0Qm9vayhwWCkge1xuICAgIGNvbnN0IHNvbWVQID0gcFguZm1hcChNYXliZS5KdXN0KTtcbiAgICBjb25zdCBub25lUCA9IHJldHVyblAoTWF5YmUuTm90aGluZyk7XG4gICAgcmV0dXJuIHNvbWVQLm9yRWxzZShub25lUCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBkaXNjYXJkU2Vjb25kKHAxLCBwMikge1xuICAgIGNvbnN0IGxhYmVsID0gcDEubGFiZWwgKyAnIGRpc2NhcmRTZWNvbmQgJyArIHAyLmxhYmVsO1xuICAgIHJldHVybiBwYXJzZXIoc3RyID0+IHtcbiAgICAgICAgcmV0dXJuIGFuZFRoZW4ocDEsIHAyKS5mbWFwKChbeCwgeV0pID0+IHgpLnJ1bihzdHIpO1xuICAgIH0sIGxhYmVsKS5zZXRMYWJlbChsYWJlbCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBkaXNjYXJkRmlyc3QocDEsIHAyKSB7XG4gICAgY29uc3QgbGFiZWwgPSBwMS5sYWJlbCArICcgZGlzY2FyZEZpcnN0ICcgKyBwMi5sYWJlbDtcbiAgICByZXR1cm4gcGFyc2VyKHN0ciA9PiB7XG4gICAgICAgIHJldHVybiBhbmRUaGVuKHAxLCBwMikuZm1hcCgoW3gsIHldKSA9PiB5KS5ydW4oc3RyKTtcbiAgICB9LCBsYWJlbCkuc2V0TGFiZWwobGFiZWwpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYmV0d2VlbihwMSwgcDIsIHAzKSB7XG4gICAgcmV0dXJuIHAxLmRpc2NhcmRGaXJzdChwMikuZGlzY2FyZFNlY29uZChwMylcbiAgICAgICAgLnNldExhYmVsKCdiZXR3ZWVuICcgKyBwMS5sYWJlbCArICcvJyArIHAyLmxhYmVsICsgJy8nICsgcDMubGFiZWwpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYmV0d2VlblBhcmVucyhweCkge1xuICAgIHJldHVybiBiZXR3ZWVuKHBjaGFyKCcoJyksIHB4LCBwY2hhcignKScpKVxuICAgICAgICAuc2V0TGFiZWwoJ2JldHdlZW5QYXJlbnMgJyArIHB4LmxhYmVsKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGJpbmRQKGZhbWIsIHB4KSB7XG4gICAgbGV0IGxhYmVsID0gJ3Vua25vd24nO1xuICAgIHJldHVybiBwYXJzZXIoc3RyID0+IHtcbiAgICAgICAgY29uc3QgcmVzID0gcHgucnVuKHN0cik7XG4gICAgICAgIGlmIChyZXMuaXNGYWlsdXJlKSByZXR1cm4gcmVzO1xuICAgICAgICByZXR1cm4gZmFtYihyZXMudmFsdWVbMF0pLnJ1bihyZXMudmFsdWVbMV0pO1xuICAgIH0sIGxhYmVsKS5zZXRMYWJlbChsYWJlbCk7XG59XG5cbmZ1bmN0aW9uIF9jb25zKHgpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKHhzKSB7XG4gICAgICAgIHJldHVybiBbeF0uY29uY2F0KHhzKTtcbiAgICB9O1xufVxuXG5mdW5jdGlvbiBfc2V0TGFiZWwocHgsIG5ld0xhYmVsKSB7XG4gICAgcmV0dXJuIHBhcnNlcihzdHIgPT4ge1xuICAgICAgICBsZXQgcmVzdWx0ID0gcHgucnVuKHN0cik7XG4gICAgICAgIGlmIChyZXN1bHQuaXNGYWlsdXJlKSByZXR1cm4gVmFsaWRhdGlvbi5GYWlsdXJlKFR1cGxlLlBhaXIobmV3TGFiZWwsIHJlc3VsdC52YWx1ZVsxXSkpO1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sIG5ld0xhYmVsKTtcbn1cblxuLy8gdGhlIHJlYWwgdGhpbmcuLi5cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZXIoZm4sIGxhYmVsKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgdHlwZTogJ3BhcnNlcicsXG4gICAgICAgIGxhYmVsOiBsYWJlbCxcbiAgICAgICAgcnVuKHN0cikge1xuICAgICAgICAgICAgcmV0dXJuIGZuKHN0cik7XG4gICAgICAgIH0sXG4gICAgICAgIGFwcGx5KHB4KSB7XG4gICAgICAgICAgICByZXR1cm4gYXBwbHlQKHRoaXMpKHB4KTtcbiAgICAgICAgICAgIC8vcmV0dXJuIHRoaXMuYmluZChhbmRUaGVuKHRoaXMsIHB4KS5mbWFwKChbZiwgeF0pID0+IGYoeCkpKS5ydW47IC8vIHdlIGFyZSB0aGUgZlBcbiAgICAgICAgfSxcbiAgICAgICAgZm1hcChmYWIpIHtcbiAgICAgICAgICAgIC8vcmV0dXJuIGZtYXAoZmFiLCB0aGlzKTtcbiAgICAgICAgICAgIC8vcmV0dXJuIGJpbmRQKHN0ciA9PiByZXR1cm5QKGZhYihzdHIpKSwgdGhpcyk7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5iaW5kKHBhcnNlZFZhbHVlID0+IHJldHVyblAoZmFiKHBhcnNlZFZhbHVlKSkpO1xuICAgICAgICB9LFxuICAgICAgICBhbmRUaGVuKHB4KSB7XG4gICAgICAgICAgICByZXR1cm4gYW5kVGhlbih0aGlzLCBweCk7XG4gICAgICAgIH0sXG4gICAgICAgIG9yRWxzZShweCkge1xuICAgICAgICAgICAgcmV0dXJuIG9yRWxzZSh0aGlzLCBweCk7XG4gICAgICAgIH0sXG4gICAgICAgIGRpc2NhcmRGaXJzdChweCkge1xuICAgICAgICAgICAgcmV0dXJuIGRpc2NhcmRGaXJzdCh0aGlzLCBweCk7XG4gICAgICAgIH0sXG4gICAgICAgIGRpc2NhcmRTZWNvbmQocHgpIHtcbiAgICAgICAgICAgIHJldHVybiBkaXNjYXJkU2Vjb25kKHRoaXMsIHB4KTtcbiAgICAgICAgfSxcbiAgICAgICAgYmluZChmYW1iKSB7XG4gICAgICAgICAgICByZXR1cm4gYmluZFAoZmFtYiwgdGhpcyk7XG4gICAgICAgIH0sXG4gICAgICAgIHNldExhYmVsKG5ld0xhYmVsKSB7XG4gICAgICAgICAgICByZXR1cm4gX3NldExhYmVsKHRoaXMsIG5ld0xhYmVsKTtcbiAgICAgICAgfVxuICAgIH07XG59XG4iXX0=