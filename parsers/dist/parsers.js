define(['exports', 'util', 'classes', 'maybe', 'validation'], function (exports, _util, _classes, _maybe, _validation) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.discardFirst = exports.discardSecond = exports.orElse = exports.andThen = exports.digitParser = exports.charParser = undefined;
    exports.pchar = pchar;
    exports.pdigit = pdigit;
    exports.andThenBBB = andThenBBB;
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
            if ('' === str) throw new Error('reached end of char stream');
            if ((0, _util.head)(str) === char) return _validation.Validation.Success((0, _classes.Pair)(char, (0, _util.tail)(str)));
            return _validation.Validation.Failure((0, _classes.Pair)('charParser', 'wanted ' + char + '; got ' + (0, _util.head)(str)));
        };
    };

    var digitParser = function digitParser(digit) {
        return function (str) {
            if ('' === str) throw new Error('reached end of char stream');
            if (parseInt((0, _util.head)(str), 10) === digit) return _validation.Validation.Success((0, _classes.Pair)(digit, (0, _util.tail)(str)));
            return _validation.Validation.Failure((0, _classes.Pair)('digitParser', 'wanted ' + digit + '; got ' + (0, _util.head)(str)));
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

    function _andThen(p1, p2) {
        var label = p1.label + ' andThen ' + p2.label;
        return parser(function (str) {
            var res1 = p1.run(str);
            if (res1.isSuccess) {
                var res2 = p2.run(res1.value[1]);
                if (res2.isSuccess) {
                    return _validation.Validation.Success((0, _classes.Pair)((0, _classes.Pair)(res1.value[0], res2.value[0]), res2.value[1]));
                } else return _validation.Validation.Failure((0, _classes.Pair)(label, res2.value[1]));
            } else return _validation.Validation.Failure((0, _classes.Pair)(label, res1.value[1]));
        }, label);
    }

    // using bind - TODO: make it work
    exports.andThen = _andThen;
    function andThenBBB(p1, p2) {
        return p1.bind(function (parsedValue1) {
            return p2.bind(function (parsedValue2) {
                return returnP((0, _classes.Pair)(parsedValue1, parsedValue2));
            });
        }).setLabel(p1.label + ' andThen ' + p2.label);
    }

    function _orElse(p1, p2) {
        var label = p1.label + ' orElse ' + p2.label;
        return parser(function (str) {
            var res1 = p1.run(str);
            if (res1.isSuccess) return res1;
            var res2 = p2.run(str);
            if (res2.isSuccess) return res2;
            return _validation.Validation.Failure((0, _classes.Pair)(label, res2.value[1]));
        }, label).setLabel(label);
    }

    exports.orElse = _orElse;
    var _fail = parser(function (str) {
        return _validation.Validation.Failure((0, _classes.Pair)((0, _classes.Pair)('parsing failed', '_fail'), '_fail'));
    });

    // return neutral element instead of message
    var _succeed = parser(function (str) {
        return _validation.Validation.Success((0, _classes.Pair)((0, _classes.Pair)('parsing succeeded', str), '_succeed'));
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
            if (_validation.Validation.isSuccess(res)) return _validation.Validation.Success((0, _classes.Pair)(fab(res.value[0]), res.value[1]));
            return _validation.Validation.Failure((0, _classes.Pair)(label, res.value[1]));
        }, label);
    }

    function returnP(value) {
        return parser(function (str) {
            return _validation.Validation.Success((0, _classes.Pair)(value, str));
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
            if (res1.isFailure) return _validation.Validation.Success((0, _classes.Pair)([], str));
            var resN = zeroOrMore(xP)(res1[1]);
            return _validation.Validation.Success((0, _classes.Pair)([res1[0]].concat(resN[0]), resN[1]));
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
            var resN = zeroOrMore(xP)(res1[1]);
            return _validation.Validation.Success((0, _classes.Pair)([res1[0]].concat(resN[0]), resN[1]));
        }, label).setLabel(label);
    }

    function opt(xP) {
        var label = 'opt ' + xP.label;
        return parser(function (str) {
            var res = xP.fmap(function (x) {
                return _maybe.Maybe.Just(x);
            }).run(str);
            if (res.isSuccess) return res;
            return _validation.Validation.Success((0, _classes.Pair)(_maybe.Maybe.Nothing(), str));
        }, label).setLabel(label);
    }

    // opt from the book
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
                    r1 = _ref6[0],
                    r2 = _ref6[1];

                return r1;
            }).run(str);
        }, label).setLabel(label);
    }

    exports.discardSecond = _discardSecond;
    function _discardFirst(p1, p2) {
        var label = p1.label + ' discardFirst ' + p2.label;
        return parser(function (str) {
            return _andThen(p1, p2).fmap(function (_ref7) {
                var _ref8 = _slicedToArray(_ref7, 2),
                    r1 = _ref8[0],
                    r2 = _ref8[1];

                return r2;
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
            if (result.isFailure) return _validation.Validation.Failure((0, _classes.Pair)(newLabel, result.value[1]));
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2pzL3BhcnNlcnMuanMiXSwibmFtZXMiOlsicGNoYXIiLCJwZGlnaXQiLCJhbmRUaGVuQkJCIiwiY2hvaWNlIiwiYW55T2YiLCJmbWFwIiwicmV0dXJuUCIsImFwcGx5UHgiLCJhcHBseVAiLCJsaWZ0MiIsInNlcXVlbmNlUCIsInNlcXVlbmNlUDIiLCJwc3RyaW5nIiwiemVyb09yTW9yZSIsIm1hbnkiLCJtYW55MSIsIm9wdCIsIm9wdEJvb2siLCJiZXR3ZWVuIiwiYmV0d2VlblBhcmVucyIsImJpbmRQIiwicGFyc2VyIiwiY2hhclBhcnNlciIsInN0ciIsIkVycm9yIiwiY2hhciIsIlN1Y2Nlc3MiLCJGYWlsdXJlIiwiZGlnaXRQYXJzZXIiLCJwYXJzZUludCIsImRpZ2l0IiwibGFiZWwiLCJyZXN1bHQiLCJzZXRMYWJlbCIsImFuZFRoZW4iLCJwMSIsInAyIiwicmVzMSIsInJ1biIsImlzU3VjY2VzcyIsInJlczIiLCJ2YWx1ZSIsImJpbmQiLCJwYXJzZWRWYWx1ZTEiLCJwYXJzZWRWYWx1ZTIiLCJvckVsc2UiLCJfZmFpbCIsIl9zdWNjZWVkIiwicGFyc2VycyIsInJlZHVjZVJpZ2h0IiwicmVzdCIsImN1cnIiLCJyZWR1Y2UiLCJhY2MiLCJjaGFycyIsIm1hcCIsImZhYiIsInBhcnNlcjEiLCJ0b1N0cmluZyIsInJlcyIsImZQIiwieFAiLCJmIiwieCIsInBhcnNlZFZhbHVlZiIsInBhcnNlZFZhbHVleCIsImZhYWIiLCJwYXJzZXIyIiwiYXBwbHkiLCJfY29ucyIsInkiLCJzcGxpdCIsImlzRmFpbHVyZSIsInJlc04iLCJjb25jYXQiLCJKdXN0IiwiTm90aGluZyIsInBYIiwic29tZVAiLCJub25lUCIsImRpc2NhcmRTZWNvbmQiLCJyMSIsInIyIiwiZGlzY2FyZEZpcnN0IiwicDMiLCJweCIsImZhbWIiLCJ4cyIsIl9zZXRMYWJlbCIsIm5ld0xhYmVsIiwiZm4iLCJ0eXBlIiwicGFyc2VkVmFsdWUiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7WUFp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UDtBQWtDSCIsImZpbGUiOiJwYXJzZXJzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8gY2ZyLiBcIlVuZGVyc3RhbmRpbmcgUGFyc2VyIENvbWJpbmF0b3JzXCIgKEYjIGZvciBGdW4gYW5kIFByb2ZpdClcblxuaW1wb3J0IHtcbiAgICBoZWFkLFxuICAgIHRhaWwsXG4gICAgaXNTdWNjZXNzLFxuICAgIGlzRmFpbHVyZSxcbn0gZnJvbSAndXRpbCc7XG5pbXBvcnQge1xuICAgIHBhaXIsXG4gICAgc3VjY2VzcyxcbiAgICBmYWlsdXJlLFxuICAgIHNvbWUsXG4gICAgbm9uZSxcbiAgICBQYWlyLFxufSBmcm9tICdjbGFzc2VzJztcbmltcG9ydCB7TWF5YmV9IGZyb20gJ21heWJlJzsgLy8gSnVzdCBvciBOb3RoaW5nXG5pbXBvcnQge1ZhbGlkYXRpb259IGZyb20gJ3ZhbGlkYXRpb24nOyAvLyBTdWNjZXNzIG9yIEZhaWx1cmVcblxuY29uc3QgY2hhclBhcnNlciA9IGNoYXIgPT4gc3RyID0+IHtcbiAgICBpZiAoJycgPT09IHN0cikgdGhyb3cgbmV3IEVycm9yKCdyZWFjaGVkIGVuZCBvZiBjaGFyIHN0cmVhbScpO1xuICAgIGlmIChoZWFkKHN0cikgPT09IGNoYXIpIHJldHVybiBWYWxpZGF0aW9uLlN1Y2Nlc3MoUGFpcihjaGFyLCB0YWlsKHN0cikpKTtcbiAgICByZXR1cm4gVmFsaWRhdGlvbi5GYWlsdXJlKFBhaXIoJ2NoYXJQYXJzZXInLCAnd2FudGVkICcgKyBjaGFyICsgJzsgZ290ICcgKyBoZWFkKHN0cikpKTtcbn07XG5cbmNvbnN0IGRpZ2l0UGFyc2VyID0gZGlnaXQgPT4gc3RyID0+IHtcbiAgICBpZiAoJycgPT09IHN0cikgdGhyb3cgbmV3IEVycm9yKCdyZWFjaGVkIGVuZCBvZiBjaGFyIHN0cmVhbScpO1xuICAgIGlmIChwYXJzZUludChoZWFkKHN0ciksIDEwKSA9PT0gZGlnaXQpIHJldHVybiBWYWxpZGF0aW9uLlN1Y2Nlc3MoUGFpcihkaWdpdCwgdGFpbChzdHIpKSk7XG4gICAgcmV0dXJuIFZhbGlkYXRpb24uRmFpbHVyZShQYWlyKCdkaWdpdFBhcnNlcicsICd3YW50ZWQgJyArIGRpZ2l0ICsgJzsgZ290ICcgKyBoZWFkKHN0cikpKTtcbn07XG5cbmV4cG9ydCB7Y2hhclBhcnNlciwgZGlnaXRQYXJzZXJ9O1xuXG5leHBvcnQgZnVuY3Rpb24gcGNoYXIoY2hhcikge1xuICAgIGNvbnN0IGxhYmVsID0gJ3BjaGFyXycgKyBjaGFyO1xuICAgIGxldCByZXN1bHQgPSBmdW5jdGlvbiAoc3RyKSB7XG4gICAgICAgIHJldHVybiBjaGFyUGFyc2VyKGNoYXIpKHN0cik7XG4gICAgfTtcbiAgICByZXR1cm4gcGFyc2VyKHJlc3VsdCwgbGFiZWwpLnNldExhYmVsKGxhYmVsKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHBkaWdpdChkaWdpdCkge1xuICAgIHJldHVybiBwYXJzZXIoc3RyID0+IGRpZ2l0UGFyc2VyKGRpZ2l0KShzdHIpLCAncGRpZ2l0XycgKyBkaWdpdCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhbmRUaGVuKHAxLCBwMikge1xuICAgIGNvbnN0IGxhYmVsID0gcDEubGFiZWwgKyAnIGFuZFRoZW4gJyArIHAyLmxhYmVsO1xuICAgIHJldHVybiBwYXJzZXIoZnVuY3Rpb24gKHN0cikge1xuICAgICAgICBsZXQgcmVzMSA9IHAxLnJ1bihzdHIpO1xuICAgICAgICBpZiAocmVzMS5pc1N1Y2Nlc3MpIHtcbiAgICAgICAgICAgIGxldCByZXMyID0gcDIucnVuKHJlczEudmFsdWVbMV0pO1xuICAgICAgICAgICAgaWYgKHJlczIuaXNTdWNjZXNzKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFZhbGlkYXRpb24uU3VjY2VzcyhQYWlyKFBhaXIocmVzMS52YWx1ZVswXSwgcmVzMi52YWx1ZVswXSksIHJlczIudmFsdWVbMV0pKTtcbiAgICAgICAgICAgIH0gZWxzZSByZXR1cm4gVmFsaWRhdGlvbi5GYWlsdXJlKFBhaXIobGFiZWwsIHJlczIudmFsdWVbMV0pKTtcbiAgICAgICAgfSBlbHNlIHJldHVybiBWYWxpZGF0aW9uLkZhaWx1cmUoUGFpcihsYWJlbCwgcmVzMS52YWx1ZVsxXSkpO1xuICAgIH0sIGxhYmVsKTtcbn1cblxuLy8gdXNpbmcgYmluZCAtIFRPRE86IG1ha2UgaXQgd29ya1xuZXhwb3J0IGZ1bmN0aW9uIGFuZFRoZW5CQkIocDEsIHAyKSB7XG4gICAgcmV0dXJuIHAxLmJpbmQocGFyc2VkVmFsdWUxID0+IHtcbiAgICAgICAgcmV0dXJuIHAyLmJpbmQocGFyc2VkVmFsdWUyID0+IHtcbiAgICAgICAgICAgIHJldHVybiByZXR1cm5QKFBhaXIocGFyc2VkVmFsdWUxLCBwYXJzZWRWYWx1ZTIpKTtcbiAgICAgICAgfSk7XG4gICAgfSkuc2V0TGFiZWwocDEubGFiZWwgKyAnIGFuZFRoZW4gJyArIHAyLmxhYmVsKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG9yRWxzZShwMSwgcDIpIHtcbiAgICBjb25zdCBsYWJlbCA9IHAxLmxhYmVsICsgJyBvckVsc2UgJyArIHAyLmxhYmVsO1xuICAgIHJldHVybiBwYXJzZXIoc3RyID0+IHtcbiAgICAgICAgY29uc3QgcmVzMSA9IHAxLnJ1bihzdHIpO1xuICAgICAgICBpZiAocmVzMS5pc1N1Y2Nlc3MpIHJldHVybiByZXMxO1xuICAgICAgICBjb25zdCByZXMyID0gcDIucnVuKHN0cik7XG4gICAgICAgIGlmIChyZXMyLmlzU3VjY2VzcykgcmV0dXJuIHJlczI7XG4gICAgICAgIHJldHVybiBWYWxpZGF0aW9uLkZhaWx1cmUoUGFpcihsYWJlbCwgcmVzMi52YWx1ZVsxXSkpO1xuICAgIH0sIGxhYmVsKS5zZXRMYWJlbChsYWJlbCk7XG59XG5cbmxldCBfZmFpbCA9IHBhcnNlcihzdHIgPT4gVmFsaWRhdGlvbi5GYWlsdXJlKFBhaXIoUGFpcigncGFyc2luZyBmYWlsZWQnLCAnX2ZhaWwnKSwgJ19mYWlsJykpKTtcblxuLy8gcmV0dXJuIG5ldXRyYWwgZWxlbWVudCBpbnN0ZWFkIG9mIG1lc3NhZ2VcbmxldCBfc3VjY2VlZCA9IHBhcnNlcihzdHIgPT4gVmFsaWRhdGlvbi5TdWNjZXNzKFBhaXIoUGFpcigncGFyc2luZyBzdWNjZWVkZWQnLCBzdHIpLCAnX3N1Y2NlZWQnKSkpO1xuXG5leHBvcnQgZnVuY3Rpb24gY2hvaWNlKHBhcnNlcnMpIHtcbiAgICByZXR1cm4gcGFyc2Vycy5yZWR1Y2VSaWdodCgocmVzdCwgY3VycikgPT4gb3JFbHNlKGN1cnIsIHJlc3QpLCBfZmFpbClcbiAgICAgICAgLnNldExhYmVsKCdjaG9pY2UgJyArIHBhcnNlcnMucmVkdWNlKChhY2MsIGN1cnIpID0+IGFjYyArICcvJyArIGN1cnIubGFiZWwsICcnKSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhbnlPZihjaGFycykge1xuICAgIHJldHVybiBjaG9pY2UoY2hhcnMubWFwKHBjaGFyKSlcbiAgICAgICAgLnNldExhYmVsKCdhbnlPZiAnICsgY2hhcnMucmVkdWNlKChhY2MsIGN1cnIpID0+IGFjYyArIGN1cnIsICcnKSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBmbWFwKGZhYiwgcGFyc2VyMSkge1xuICAgIGNvbnN0IGxhYmVsID0gcGFyc2VyMS5sYWJlbCArICcgZm1hcCAnICsgZmFiLnRvU3RyaW5nKCk7XG4gICAgcmV0dXJuIHBhcnNlcihzdHIgPT4ge1xuICAgICAgICBsZXQgcmVzID0gcGFyc2VyMS5ydW4oc3RyKTtcbiAgICAgICAgaWYgKFZhbGlkYXRpb24uaXNTdWNjZXNzKHJlcykpIHJldHVybiBWYWxpZGF0aW9uLlN1Y2Nlc3MoUGFpcihmYWIocmVzLnZhbHVlWzBdKSwgcmVzLnZhbHVlWzFdKSk7XG4gICAgICAgIHJldHVybiBWYWxpZGF0aW9uLkZhaWx1cmUoUGFpcihsYWJlbCwgcmVzLnZhbHVlWzFdKSk7XG4gICAgfSwgbGFiZWwpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcmV0dXJuUCh2YWx1ZSkge1xuICAgIHJldHVybiBwYXJzZXIoc3RyID0+IFZhbGlkYXRpb24uU3VjY2VzcyhQYWlyKHZhbHVlLCBzdHIpKSwgdmFsdWUpO1xufVxuXG4vLyBwYXJzZXIoYSAtPiBiKSAtPiBwYXJzZXIoYSkgLT4gcGFyc2VyKGIpXG5leHBvcnQgZnVuY3Rpb24gYXBwbHlQeChmUCkge1xuICAgIHJldHVybiBmdW5jdGlvbiAoeFApIHtcbiAgICAgICAgcmV0dXJuIGFuZFRoZW4oZlAsIHhQKS5mbWFwKChbZiwgeF0pID0+IGYoeCkpO1xuICAgIH07XG59XG5cbi8vIHVzaW5nIGJpbmRcbmV4cG9ydCBmdW5jdGlvbiBhcHBseVAoZlApIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKHhQKSB7XG4gICAgICAgIHJldHVybiBmUC5iaW5kKHBhcnNlZFZhbHVlZiA9PiB7XG4gICAgICAgICAgICByZXR1cm4geFAuYmluZChwYXJzZWRWYWx1ZXggPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiByZXR1cm5QKHBhcnNlZFZhbHVlZihwYXJzZWRWYWx1ZXgpKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbGlmdDIoZmFhYikge1xuICAgIHJldHVybiBmdW5jdGlvbiAocGFyc2VyMSkge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKHBhcnNlcjIpIHtcbiAgICAgICAgICAgIC8vcmV0dXJuIGFwcGx5UChhcHBseVAocmV0dXJuUChmYWFiKSkocGFyc2VyMSkpKHBhcnNlcjIpO1xuICAgICAgICAgICAgcmV0dXJuIHJldHVyblAoZmFhYikuYXBwbHkocGFyc2VyMSkuYXBwbHkocGFyc2VyMik7IC8vIHVzaW5nIGluc3RhbmNlIG1ldGhvZHNcbiAgICAgICAgfTtcbiAgICB9O1xufVxuXG4vLyB1c2luZyBsaWZ0Mihjb25zKVxuZXhwb3J0IGZ1bmN0aW9uIHNlcXVlbmNlUChwYXJzZXJzKSB7XG4gICAgcmV0dXJuIHBhcnNlcnNcbiAgICAgICAgLnJlZHVjZVJpZ2h0KChyZXN0LCBjdXJyKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gbGlmdDIoX2NvbnMpKGN1cnIpKHJlc3QpO1xuICAgICAgICB9LCByZXR1cm5QKFtdKSk7XG59XG5cbi8vIHVzaW5nIG5haXZlIGFuZFRoZW4gJiYgZm1hcCAtLT4gcmV0dXJucyBzdHJpbmdzLCBub3QgYXJyYXlzIVxuZXhwb3J0IGZ1bmN0aW9uIHNlcXVlbmNlUDIocGFyc2Vycykge1xuICAgIHJldHVybiBwYXJzZXJzXG4gICAgICAgIC5yZWR1Y2VSaWdodCgocmVzdCwgY3VycikgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIGZtYXAoKFt4LCB5XSkgPT4geCArIHksIGFuZFRoZW4oY3VyciwgcmVzdCkpO1xuICAgICAgICB9LCByZXR1cm5QKCcnKSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwc3RyaW5nKHN0cikge1xuICAgIHJldHVybiBzZXF1ZW5jZVAoc3RyLnNwbGl0KCcnKS5tYXAocGNoYXIpKVxuICAgICAgICAuc2V0TGFiZWwoJ3BzdHJpbmcgJyArIHN0cik7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB6ZXJvT3JNb3JlKHhQKSB7IC8vIHplcm9Pck1vcmUgOjogcCBhIC0+IFthXSAtPiB0cnkgW2FdID0gcCBhIC0+IHAgW2FdXG4gICAgcmV0dXJuIHN0ciA9PiB7XG4gICAgICAgIGxldCByZXMxID0geFAucnVuKHN0cik7XG4gICAgICAgIGlmIChyZXMxLmlzRmFpbHVyZSkgcmV0dXJuIFZhbGlkYXRpb24uU3VjY2VzcyhQYWlyKFtdLCBzdHIpKTtcbiAgICAgICAgbGV0IHJlc04gPSB6ZXJvT3JNb3JlKHhQKShyZXMxWzFdKTtcbiAgICAgICAgcmV0dXJuIFZhbGlkYXRpb24uU3VjY2VzcyhQYWlyKFtyZXMxWzBdXS5jb25jYXQocmVzTlswXSksIHJlc05bMV0pKTtcbiAgICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbWFueSh4UCkge1xuICAgIGNvbnN0IGxhYmVsID0gJ21hbnkgJyArIHhQLmxhYmVsO1xuICAgIHJldHVybiBwYXJzZXIoc3RyID0+IHtcbiAgICAgICAgcmV0dXJuIHplcm9Pck1vcmUoeFApKHN0cik7XG4gICAgfSwgbGFiZWwpLnNldExhYmVsKGxhYmVsKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1hbnkxKHhQKSB7XG4gICAgY29uc3QgbGFiZWwgPSAnbWFueTEgJyArIHhQLmxhYmVsO1xuICAgIHJldHVybiBwYXJzZXIoc3RyID0+IHtcbiAgICAgICAgbGV0IHJlczEgPSB4UC5ydW4oc3RyKTtcbiAgICAgICAgaWYgKHJlczEuaXNGYWlsdXJlKSByZXR1cm4gcmVzMTtcbiAgICAgICAgbGV0IHJlc04gPSB6ZXJvT3JNb3JlKHhQKShyZXMxWzFdKTtcbiAgICAgICAgcmV0dXJuIFZhbGlkYXRpb24uU3VjY2VzcyhQYWlyKFtyZXMxWzBdXS5jb25jYXQocmVzTlswXSksIHJlc05bMV0pKTtcbiAgICB9LCBsYWJlbCkuc2V0TGFiZWwobGFiZWwpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gb3B0KHhQKSB7XG4gICAgY29uc3QgbGFiZWwgPSAnb3B0ICcgKyB4UC5sYWJlbDtcbiAgICByZXR1cm4gcGFyc2VyKHN0ciA9PiB7XG4gICAgICAgIGxldCByZXMgPSB4UC5mbWFwKHggPT4gTWF5YmUuSnVzdCh4KSkucnVuKHN0cik7XG4gICAgICAgIGlmIChyZXMuaXNTdWNjZXNzKSByZXR1cm4gcmVzO1xuICAgICAgICByZXR1cm4gVmFsaWRhdGlvbi5TdWNjZXNzKFBhaXIoTWF5YmUuTm90aGluZygpLCBzdHIpKTtcbiAgICB9LCBsYWJlbCkuc2V0TGFiZWwobGFiZWwpO1xufVxuXG4vLyBvcHQgZnJvbSB0aGUgYm9va1xuZXhwb3J0IGZ1bmN0aW9uIG9wdEJvb2socFgpIHtcbiAgICBjb25zdCBzb21lUCA9IHBYLmZtYXAoTWF5YmUuSnVzdCk7XG4gICAgY29uc3Qgbm9uZVAgPSByZXR1cm5QKE1heWJlLk5vdGhpbmcpO1xuICAgIHJldHVybiBzb21lUC5vckVsc2Uobm9uZVApO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZGlzY2FyZFNlY29uZChwMSwgcDIpIHtcbiAgICBjb25zdCBsYWJlbCA9IHAxLmxhYmVsICsgJyBkaXNjYXJkU2Vjb25kICcgKyBwMi5sYWJlbDtcbiAgICByZXR1cm4gcGFyc2VyKHN0ciA9PiB7XG4gICAgICAgIHJldHVybiBhbmRUaGVuKHAxLCBwMikuZm1hcCgoW3IxLCByMl0pID0+IHIxKS5ydW4oc3RyKTtcbiAgICB9LCBsYWJlbCkuc2V0TGFiZWwobGFiZWwpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZGlzY2FyZEZpcnN0KHAxLCBwMikge1xuICAgIGNvbnN0IGxhYmVsID0gcDEubGFiZWwgKyAnIGRpc2NhcmRGaXJzdCAnICsgcDIubGFiZWw7XG4gICAgcmV0dXJuIHBhcnNlcihzdHIgPT4ge1xuICAgICAgICByZXR1cm4gYW5kVGhlbihwMSwgcDIpLmZtYXAoKFtyMSwgcjJdKSA9PiByMikucnVuKHN0cik7XG4gICAgfSwgbGFiZWwpLnNldExhYmVsKGxhYmVsKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGJldHdlZW4ocDEsIHAyLCBwMykge1xuICAgIHJldHVybiBwMS5kaXNjYXJkRmlyc3QocDIpLmRpc2NhcmRTZWNvbmQocDMpXG4gICAgICAgIC5zZXRMYWJlbCgnYmV0d2VlbiAnICsgcDEubGFiZWwgKyAnLycgKyBwMi5sYWJlbCArICcvJyArIHAzLmxhYmVsKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGJldHdlZW5QYXJlbnMocHgpIHtcbiAgICByZXR1cm4gYmV0d2VlbihwY2hhcignKCcpLCBweCwgcGNoYXIoJyknKSlcbiAgICAgICAgLnNldExhYmVsKCdiZXR3ZWVuUGFyZW5zICcgKyBweC5sYWJlbCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBiaW5kUChmYW1iLCBweCkge1xuICAgIGxldCBsYWJlbCA9ICd1bmtub3duJztcbiAgICByZXR1cm4gcGFyc2VyKHN0ciA9PiB7XG4gICAgICAgIGNvbnN0IHJlcyA9IHB4LnJ1bihzdHIpO1xuICAgICAgICBpZiAocmVzLmlzRmFpbHVyZSkgcmV0dXJuIHJlcztcbiAgICAgICAgcmV0dXJuIGZhbWIocmVzLnZhbHVlWzBdKS5ydW4ocmVzLnZhbHVlWzFdKTtcbiAgICB9LCBsYWJlbCkuc2V0TGFiZWwobGFiZWwpO1xufVxuXG5mdW5jdGlvbiBfY29ucyh4KSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uICh4cykge1xuICAgICAgICByZXR1cm4gW3hdLmNvbmNhdCh4cyk7XG4gICAgfTtcbn1cblxuZnVuY3Rpb24gX3NldExhYmVsKHB4LCBuZXdMYWJlbCkge1xuICAgIHJldHVybiBwYXJzZXIoc3RyID0+IHtcbiAgICAgICAgbGV0IHJlc3VsdCA9IHB4LnJ1bihzdHIpO1xuICAgICAgICBpZiAocmVzdWx0LmlzRmFpbHVyZSkgcmV0dXJuIFZhbGlkYXRpb24uRmFpbHVyZShQYWlyKG5ld0xhYmVsLCByZXN1bHQudmFsdWVbMV0pKTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LCBuZXdMYWJlbCk7XG59XG5cbi8vIHRoZSByZWFsIHRoaW5nLi4uXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VyKGZuLCBsYWJlbCkge1xuICAgIHJldHVybiB7XG4gICAgICAgIHR5cGU6ICdwYXJzZXInLFxuICAgICAgICBsYWJlbDogbGFiZWwsXG4gICAgICAgIHJ1bihzdHIpIHtcbiAgICAgICAgICAgIHJldHVybiBmbihzdHIpO1xuICAgICAgICB9LFxuICAgICAgICBhcHBseShweCkge1xuICAgICAgICAgICAgcmV0dXJuIGFwcGx5UCh0aGlzKShweCk7XG4gICAgICAgICAgICAvL3JldHVybiB0aGlzLmJpbmQoYW5kVGhlbih0aGlzLCBweCkuZm1hcCgoW2YsIHhdKSA9PiBmKHgpKSkucnVuOyAvLyB3ZSBhcmUgdGhlIGZQXG4gICAgICAgIH0sXG4gICAgICAgIGZtYXAoZmFiKSB7XG4gICAgICAgICAgICAvL3JldHVybiBmbWFwKGZhYiwgdGhpcyk7XG4gICAgICAgICAgICAvL3JldHVybiBiaW5kUChzdHIgPT4gcmV0dXJuUChmYWIoc3RyKSksIHRoaXMpO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuYmluZChwYXJzZWRWYWx1ZSA9PiByZXR1cm5QKGZhYihwYXJzZWRWYWx1ZSkpKTtcbiAgICAgICAgfSxcbiAgICAgICAgYW5kVGhlbihweCkge1xuICAgICAgICAgICAgcmV0dXJuIGFuZFRoZW4odGhpcywgcHgpO1xuICAgICAgICB9LFxuICAgICAgICBvckVsc2UocHgpIHtcbiAgICAgICAgICAgIHJldHVybiBvckVsc2UodGhpcywgcHgpO1xuICAgICAgICB9LFxuICAgICAgICBkaXNjYXJkRmlyc3QocHgpIHtcbiAgICAgICAgICAgIHJldHVybiBkaXNjYXJkRmlyc3QodGhpcywgcHgpO1xuICAgICAgICB9LFxuICAgICAgICBkaXNjYXJkU2Vjb25kKHB4KSB7XG4gICAgICAgICAgICByZXR1cm4gZGlzY2FyZFNlY29uZCh0aGlzLCBweCk7XG4gICAgICAgIH0sXG4gICAgICAgIGJpbmQoZmFtYikge1xuICAgICAgICAgICAgcmV0dXJuIGJpbmRQKGZhbWIsIHRoaXMpO1xuICAgICAgICB9LFxuICAgICAgICBzZXRMYWJlbChuZXdMYWJlbCkge1xuICAgICAgICAgICAgcmV0dXJuIF9zZXRMYWJlbCh0aGlzLCBuZXdMYWJlbCk7XG4gICAgICAgIH1cbiAgICB9O1xufVxuIl19