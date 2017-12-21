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
            if (res.isSuccess) return _validation.Validation.Success((0, _classes.Pair)(fab(res.value[0]), res.value[1]));
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
            return _andThen(fP, xP).fmap(function (pairfx) {
                return pairfx[0](pairfx[1]);
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
            return fmap(function (pair) {
                return pair[0] + pair[1];
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
            return _andThen(p1, p2).fmap(function (_ref) {
                var _ref2 = _slicedToArray(_ref, 2),
                    r1 = _ref2[0],
                    r2 = _ref2[1];

                return r1;
            }).run(str);
        }, label).setLabel(label);
    }

    exports.discardSecond = _discardSecond;
    function _discardFirst(p1, p2) {
        var label = p1.label + ' discardFirst ' + p2.label;
        return parser(function (str) {
            return _andThen(p1, p2).fmap(function (_ref3) {
                var _ref4 = _slicedToArray(_ref3, 2),
                    r1 = _ref4[0],
                    r2 = _ref4[1];

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2pzL3BhcnNlcnMuanMiXSwibmFtZXMiOlsicGNoYXIiLCJwZGlnaXQiLCJhbmRUaGVuQkJCIiwiY2hvaWNlIiwiYW55T2YiLCJmbWFwIiwicmV0dXJuUCIsImFwcGx5UHgiLCJhcHBseVAiLCJsaWZ0MiIsInNlcXVlbmNlUCIsInNlcXVlbmNlUDIiLCJwc3RyaW5nIiwiemVyb09yTW9yZSIsIm1hbnkiLCJtYW55MSIsIm9wdCIsIm9wdEJvb2siLCJiZXR3ZWVuIiwiYmV0d2VlblBhcmVucyIsImJpbmRQIiwicGFyc2VyIiwiY2hhclBhcnNlciIsInN0ciIsIkVycm9yIiwiY2hhciIsIlN1Y2Nlc3MiLCJGYWlsdXJlIiwiZGlnaXRQYXJzZXIiLCJwYXJzZUludCIsImRpZ2l0IiwibGFiZWwiLCJyZXN1bHQiLCJzZXRMYWJlbCIsImFuZFRoZW4iLCJwMSIsInAyIiwicmVzMSIsInJ1biIsImlzU3VjY2VzcyIsInJlczIiLCJ2YWx1ZSIsImJpbmQiLCJwYXJzZWRWYWx1ZTEiLCJwYXJzZWRWYWx1ZTIiLCJvckVsc2UiLCJfZmFpbCIsIl9zdWNjZWVkIiwicGFyc2VycyIsInJlZHVjZVJpZ2h0IiwicmVzdCIsImN1cnIiLCJyZWR1Y2UiLCJhY2MiLCJjaGFycyIsIm1hcCIsImZhYiIsInBhcnNlcjEiLCJ0b1N0cmluZyIsInJlcyIsImZQIiwieFAiLCJwYWlyZngiLCJwYXJzZWRWYWx1ZWYiLCJwYXJzZWRWYWx1ZXgiLCJmYWFiIiwicGFyc2VyMiIsImFwcGx5IiwiX2NvbnMiLCJwYWlyIiwic3BsaXQiLCJpc0ZhaWx1cmUiLCJyZXNOIiwiY29uY2F0IiwiSnVzdCIsIngiLCJOb3RoaW5nIiwicFgiLCJzb21lUCIsIm5vbmVQIiwiZGlzY2FyZFNlY29uZCIsInIxIiwicjIiLCJkaXNjYXJkRmlyc3QiLCJwMyIsInB4IiwiZmFtYiIsInhzIiwiX3NldExhYmVsIiwibmV3TGFiZWwiLCJmbiIsInR5cGUiLCJwYXJzZWRWYWx1ZSJdLCJtYXBwaW5ncyI6Ijs7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LiBcIlVuZGVyc3RhbmRpbmcgUGFyc2VyIENvbWJpbmF0b3JzXCIgKEYjIGZvciBGdW4gYW5kIFByb2ZpdClcblxuaW1wb3J0IHtcbiAgICBoZWFkLFxuICAgIHRhaWwsXG4gICAgaXNTdWNjZXNzLFxuICAgIGlzRmFpbHVyZSxcbn0gZnJvbSAndXRpbCc7XG5pbXBvcnQge1xuICAgIHBhaXIsXG4gICAgc3VjY2VzcyxcbiAgICBmYWlsdXJlLFxuICAgIHNvbWUsXG4gICAgbm9uZSxcbiAgICBQYWlyLFxufSBmcm9tICdjbGFzc2VzJztcbmltcG9ydCB7TWF5YmV9IGZyb20gJ21heWJlJzsgLy8gSnVzdCBvciBOb3RoaW5nXG5pbXBvcnQge1ZhbGlkYXRpb259IGZyb20gJ3ZhbGlkYXRpb24nOyAvLyBTdWNjZXNzIG9yIEZhaWx1cmVcblxuY29uc3QgY2hhclBhcnNlciA9IGNoYXIgPT4gc3RyID0+IHtcbiAgICBpZiAoJycgPT09IHN0cikgdGhyb3cgbmV3IEVycm9yKCdyZWFjaGVkIGVuZCBvZiBjaGFyIHN0cmVhbScpO1xuICAgIGlmIChoZWFkKHN0cikgPT09IGNoYXIpIHJldHVybiBWYWxpZGF0aW9uLlN1Y2Nlc3MoUGFpcihjaGFyLCB0YWlsKHN0cikpKTtcbiAgICByZXR1cm4gVmFsaWRhdGlvbi5GYWlsdXJlKFBhaXIoJ2NoYXJQYXJzZXInLCAnd2FudGVkICcgKyBjaGFyICsgJzsgZ290ICcgKyBoZWFkKHN0cikpKTtcbn07XG5cbmNvbnN0IGRpZ2l0UGFyc2VyID0gZGlnaXQgPT4gc3RyID0+IHtcbiAgICBpZiAoJycgPT09IHN0cikgdGhyb3cgbmV3IEVycm9yKCdyZWFjaGVkIGVuZCBvZiBjaGFyIHN0cmVhbScpO1xuICAgIGlmIChwYXJzZUludChoZWFkKHN0ciksIDEwKSA9PT0gZGlnaXQpIHJldHVybiBWYWxpZGF0aW9uLlN1Y2Nlc3MoUGFpcihkaWdpdCwgdGFpbChzdHIpKSk7XG4gICAgcmV0dXJuIFZhbGlkYXRpb24uRmFpbHVyZShQYWlyKCdkaWdpdFBhcnNlcicsICd3YW50ZWQgJyArIGRpZ2l0ICsgJzsgZ290ICcgKyBoZWFkKHN0cikpKTtcbn07XG5cbmV4cG9ydCB7Y2hhclBhcnNlciwgZGlnaXRQYXJzZXJ9O1xuXG5leHBvcnQgZnVuY3Rpb24gcGNoYXIoY2hhcikge1xuICAgIGNvbnN0IGxhYmVsID0gJ3BjaGFyXycgKyBjaGFyO1xuICAgIGxldCByZXN1bHQgPSBmdW5jdGlvbiAoc3RyKSB7XG4gICAgICAgIHJldHVybiBjaGFyUGFyc2VyKGNoYXIpKHN0cik7XG4gICAgfTtcbiAgICByZXR1cm4gcGFyc2VyKHJlc3VsdCwgbGFiZWwpLnNldExhYmVsKGxhYmVsKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHBkaWdpdChkaWdpdCkge1xuICAgIHJldHVybiBwYXJzZXIoc3RyID0+IGRpZ2l0UGFyc2VyKGRpZ2l0KShzdHIpLCAncGRpZ2l0XycgKyBkaWdpdCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhbmRUaGVuKHAxLCBwMikge1xuICAgIGNvbnN0IGxhYmVsID0gcDEubGFiZWwgKyAnIGFuZFRoZW4gJyArIHAyLmxhYmVsO1xuICAgIHJldHVybiBwYXJzZXIoZnVuY3Rpb24gKHN0cikge1xuICAgICAgICBsZXQgcmVzMSA9IHAxLnJ1bihzdHIpO1xuICAgICAgICBpZiAocmVzMS5pc1N1Y2Nlc3MpIHtcbiAgICAgICAgICAgIGxldCByZXMyID0gcDIucnVuKHJlczEudmFsdWVbMV0pO1xuICAgICAgICAgICAgaWYgKHJlczIuaXNTdWNjZXNzKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFZhbGlkYXRpb24uU3VjY2VzcyhQYWlyKFBhaXIocmVzMS52YWx1ZVswXSwgcmVzMi52YWx1ZVswXSksIHJlczIudmFsdWVbMV0pKTtcbiAgICAgICAgICAgIH0gZWxzZSByZXR1cm4gVmFsaWRhdGlvbi5GYWlsdXJlKFBhaXIobGFiZWwsIHJlczIudmFsdWVbMV0pKTtcbiAgICAgICAgfSBlbHNlIHJldHVybiBWYWxpZGF0aW9uLkZhaWx1cmUoUGFpcihsYWJlbCwgcmVzMS52YWx1ZVsxXSkpO1xuICAgIH0sIGxhYmVsKTtcbn1cblxuLy8gdXNpbmcgYmluZCAtIFRPRE86IG1ha2UgaXQgd29ya1xuZXhwb3J0IGZ1bmN0aW9uIGFuZFRoZW5CQkIocDEsIHAyKSB7XG4gICAgcmV0dXJuIHAxLmJpbmQocGFyc2VkVmFsdWUxID0+IHtcbiAgICAgICAgcmV0dXJuIHAyLmJpbmQocGFyc2VkVmFsdWUyID0+IHtcbiAgICAgICAgICAgIHJldHVybiByZXR1cm5QKFBhaXIocGFyc2VkVmFsdWUxLCBwYXJzZWRWYWx1ZTIpKTtcbiAgICAgICAgfSk7XG4gICAgfSkuc2V0TGFiZWwocDEubGFiZWwgKyAnIGFuZFRoZW4gJyArIHAyLmxhYmVsKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG9yRWxzZShwMSwgcDIpIHtcbiAgICBjb25zdCBsYWJlbCA9IHAxLmxhYmVsICsgJyBvckVsc2UgJyArIHAyLmxhYmVsO1xuICAgIHJldHVybiBwYXJzZXIoc3RyID0+IHtcbiAgICAgICAgY29uc3QgcmVzMSA9IHAxLnJ1bihzdHIpO1xuICAgICAgICBpZiAocmVzMS5pc1N1Y2Nlc3MpIHJldHVybiByZXMxO1xuICAgICAgICBjb25zdCByZXMyID0gcDIucnVuKHN0cik7XG4gICAgICAgIGlmIChyZXMyLmlzU3VjY2VzcykgcmV0dXJuIHJlczI7XG4gICAgICAgIHJldHVybiBWYWxpZGF0aW9uLkZhaWx1cmUoUGFpcihsYWJlbCwgcmVzMi52YWx1ZVsxXSkpO1xuICAgIH0sIGxhYmVsKS5zZXRMYWJlbChsYWJlbCk7XG59XG5cbmxldCBfZmFpbCA9IHBhcnNlcihzdHIgPT4gVmFsaWRhdGlvbi5GYWlsdXJlKFBhaXIoUGFpcigncGFyc2luZyBmYWlsZWQnLCAnX2ZhaWwnKSwgJ19mYWlsJykpKTtcblxuLy8gcmV0dXJuIG5ldXRyYWwgZWxlbWVudCBpbnN0ZWFkIG9mIG1lc3NhZ2VcbmxldCBfc3VjY2VlZCA9IHBhcnNlcihzdHIgPT4gVmFsaWRhdGlvbi5TdWNjZXNzKFBhaXIoUGFpcigncGFyc2luZyBzdWNjZWVkZWQnLCBzdHIpLCAnX3N1Y2NlZWQnKSkpO1xuXG5leHBvcnQgZnVuY3Rpb24gY2hvaWNlKHBhcnNlcnMpIHtcbiAgICByZXR1cm4gcGFyc2Vycy5yZWR1Y2VSaWdodCgocmVzdCwgY3VycikgPT4gb3JFbHNlKGN1cnIsIHJlc3QpLCBfZmFpbClcbiAgICAgICAgLnNldExhYmVsKCdjaG9pY2UgJyArIHBhcnNlcnMucmVkdWNlKChhY2MsIGN1cnIpID0+IGFjYyArICcvJyArIGN1cnIubGFiZWwsICcnKSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhbnlPZihjaGFycykge1xuICAgIHJldHVybiBjaG9pY2UoY2hhcnMubWFwKHBjaGFyKSlcbiAgICAgICAgLnNldExhYmVsKCdhbnlPZiAnICsgY2hhcnMucmVkdWNlKChhY2MsIGN1cnIpID0+IGFjYyArIGN1cnIsICcnKSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBmbWFwKGZhYiwgcGFyc2VyMSkge1xuICAgIGNvbnN0IGxhYmVsID0gcGFyc2VyMS5sYWJlbCArICcgZm1hcCAnICsgZmFiLnRvU3RyaW5nKCk7XG4gICAgcmV0dXJuIHBhcnNlcihzdHIgPT4ge1xuICAgICAgICBsZXQgcmVzID0gcGFyc2VyMS5ydW4oc3RyKTtcbiAgICAgICAgaWYgKHJlcy5pc1N1Y2Nlc3MpIHJldHVybiBWYWxpZGF0aW9uLlN1Y2Nlc3MoUGFpcihmYWIocmVzLnZhbHVlWzBdKSwgcmVzLnZhbHVlWzFdKSk7XG4gICAgICAgIHJldHVybiBWYWxpZGF0aW9uLkZhaWx1cmUoUGFpcihsYWJlbCwgcmVzLnZhbHVlWzFdKSk7XG4gICAgfSwgbGFiZWwpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcmV0dXJuUCh2YWx1ZSkge1xuICAgIHJldHVybiBwYXJzZXIoc3RyID0+IFZhbGlkYXRpb24uU3VjY2VzcyhQYWlyKHZhbHVlLCBzdHIpKSwgdmFsdWUpO1xufVxuXG4vLyBwYXJzZXIoYSAtPiBiKSAtPiBwYXJzZXIoYSkgLT4gcGFyc2VyKGIpXG5leHBvcnQgZnVuY3Rpb24gYXBwbHlQeChmUCkge1xuICAgIHJldHVybiBmdW5jdGlvbiAoeFApIHtcbiAgICAgICAgcmV0dXJuIGFuZFRoZW4oZlAsIHhQKS5mbWFwKHBhaXJmeCA9PiBwYWlyZnhbMF0ocGFpcmZ4WzFdKSk7XG4gICAgfTtcbn1cblxuLy8gdXNpbmcgYmluZFxuZXhwb3J0IGZ1bmN0aW9uIGFwcGx5UChmUCkge1xuICAgIHJldHVybiBmdW5jdGlvbiAoeFApIHtcbiAgICAgICAgcmV0dXJuIGZQLmJpbmQocGFyc2VkVmFsdWVmID0+IHtcbiAgICAgICAgICAgIHJldHVybiB4UC5iaW5kKHBhcnNlZFZhbHVleCA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJldHVyblAocGFyc2VkVmFsdWVmKHBhcnNlZFZhbHVleCkpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBsaWZ0MihmYWFiKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uIChwYXJzZXIxKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAocGFyc2VyMikge1xuICAgICAgICAgICAgLy9yZXR1cm4gYXBwbHlQKGFwcGx5UChyZXR1cm5QKGZhYWIpKShwYXJzZXIxKSkocGFyc2VyMik7XG4gICAgICAgICAgICByZXR1cm4gcmV0dXJuUChmYWFiKS5hcHBseShwYXJzZXIxKS5hcHBseShwYXJzZXIyKTsgLy8gdXNpbmcgaW5zdGFuY2UgbWV0aG9kc1xuICAgICAgICB9O1xuICAgIH07XG59XG5cbi8vIHVzaW5nIGxpZnQyKGNvbnMpXG5leHBvcnQgZnVuY3Rpb24gc2VxdWVuY2VQKHBhcnNlcnMpIHtcbiAgICByZXR1cm4gcGFyc2Vyc1xuICAgICAgICAucmVkdWNlUmlnaHQoKHJlc3QsIGN1cnIpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBsaWZ0MihfY29ucykoY3VycikocmVzdCk7XG4gICAgICAgIH0sIHJldHVyblAoW10pKTtcbn1cblxuLy8gdXNpbmcgbmFpdmUgYW5kVGhlbiAmJiBmbWFwIC0tPiByZXR1cm5zIHN0cmluZ3MsIG5vdCBhcnJheXMhXG5leHBvcnQgZnVuY3Rpb24gc2VxdWVuY2VQMihwYXJzZXJzKSB7XG4gICAgcmV0dXJuIHBhcnNlcnNcbiAgICAgICAgLnJlZHVjZVJpZ2h0KChyZXN0LCBjdXJyKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gZm1hcChwYWlyID0+IHBhaXJbMF0gKyBwYWlyWzFdLCBhbmRUaGVuKGN1cnIsIHJlc3QpKTtcbiAgICAgICAgfSwgcmV0dXJuUCgnJykpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcHN0cmluZyhzdHIpIHtcbiAgICByZXR1cm4gc2VxdWVuY2VQKHN0ci5zcGxpdCgnJykubWFwKHBjaGFyKSlcbiAgICAgICAgLnNldExhYmVsKCdwc3RyaW5nICcgKyBzdHIpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gemVyb09yTW9yZSh4UCkgeyAvLyB6ZXJvT3JNb3JlIDo6IHAgYSAtPiBbYV0gLT4gdHJ5IFthXSA9IHAgYSAtPiBwIFthXVxuICAgIHJldHVybiBzdHIgPT4ge1xuICAgICAgICBsZXQgcmVzMSA9IHhQLnJ1bihzdHIpO1xuICAgICAgICBpZiAocmVzMS5pc0ZhaWx1cmUpIHJldHVybiBWYWxpZGF0aW9uLlN1Y2Nlc3MoUGFpcihbXSwgc3RyKSk7XG4gICAgICAgIGxldCByZXNOID0gemVyb09yTW9yZSh4UCkocmVzMVsxXSk7XG4gICAgICAgIHJldHVybiBWYWxpZGF0aW9uLlN1Y2Nlc3MoUGFpcihbcmVzMVswXV0uY29uY2F0KHJlc05bMF0pLCByZXNOWzFdKSk7XG4gICAgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1hbnkoeFApIHtcbiAgICBjb25zdCBsYWJlbCA9ICdtYW55ICcgKyB4UC5sYWJlbDtcbiAgICByZXR1cm4gcGFyc2VyKHN0ciA9PiB7XG4gICAgICAgIHJldHVybiB6ZXJvT3JNb3JlKHhQKShzdHIpO1xuICAgIH0sIGxhYmVsKS5zZXRMYWJlbChsYWJlbCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtYW55MSh4UCkge1xuICAgIGNvbnN0IGxhYmVsID0gJ21hbnkxICcgKyB4UC5sYWJlbDtcbiAgICByZXR1cm4gcGFyc2VyKHN0ciA9PiB7XG4gICAgICAgIGxldCByZXMxID0geFAucnVuKHN0cik7XG4gICAgICAgIGlmIChyZXMxLmlzRmFpbHVyZSkgcmV0dXJuIHJlczE7XG4gICAgICAgIGxldCByZXNOID0gemVyb09yTW9yZSh4UCkocmVzMVsxXSk7XG4gICAgICAgIHJldHVybiBWYWxpZGF0aW9uLlN1Y2Nlc3MoUGFpcihbcmVzMVswXV0uY29uY2F0KHJlc05bMF0pLCByZXNOWzFdKSk7XG4gICAgfSwgbGFiZWwpLnNldExhYmVsKGxhYmVsKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG9wdCh4UCkge1xuICAgIGNvbnN0IGxhYmVsID0gJ29wdCAnICsgeFAubGFiZWw7XG4gICAgcmV0dXJuIHBhcnNlcihzdHIgPT4ge1xuICAgICAgICBsZXQgcmVzID0geFAuZm1hcCh4ID0+IE1heWJlLkp1c3QoeCkpLnJ1bihzdHIpO1xuICAgICAgICBpZiAocmVzLmlzU3VjY2VzcykgcmV0dXJuIHJlcztcbiAgICAgICAgcmV0dXJuIFZhbGlkYXRpb24uU3VjY2VzcyhQYWlyKE1heWJlLk5vdGhpbmcoKSwgc3RyKSk7XG4gICAgfSwgbGFiZWwpLnNldExhYmVsKGxhYmVsKTtcbn1cblxuLy8gb3B0IGZyb20gdGhlIGJvb2tcbmV4cG9ydCBmdW5jdGlvbiBvcHRCb29rKHBYKSB7XG4gICAgY29uc3Qgc29tZVAgPSBwWC5mbWFwKE1heWJlLkp1c3QpO1xuICAgIGNvbnN0IG5vbmVQID0gcmV0dXJuUChNYXliZS5Ob3RoaW5nKTtcbiAgICByZXR1cm4gc29tZVAub3JFbHNlKG5vbmVQKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRpc2NhcmRTZWNvbmQocDEsIHAyKSB7XG4gICAgY29uc3QgbGFiZWwgPSBwMS5sYWJlbCArICcgZGlzY2FyZFNlY29uZCAnICsgcDIubGFiZWw7XG4gICAgcmV0dXJuIHBhcnNlcihzdHIgPT4ge1xuICAgICAgICByZXR1cm4gYW5kVGhlbihwMSwgcDIpLmZtYXAoKFtyMSwgcjJdKSA9PiByMSkucnVuKHN0cik7XG4gICAgfSwgbGFiZWwpLnNldExhYmVsKGxhYmVsKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRpc2NhcmRGaXJzdChwMSwgcDIpIHtcbiAgICBjb25zdCBsYWJlbCA9IHAxLmxhYmVsICsgJyBkaXNjYXJkRmlyc3QgJyArIHAyLmxhYmVsO1xuICAgIHJldHVybiBwYXJzZXIoc3RyID0+IHtcbiAgICAgICAgcmV0dXJuIGFuZFRoZW4ocDEsIHAyKS5mbWFwKChbcjEsIHIyXSkgPT4gcjIpLnJ1bihzdHIpO1xuICAgIH0sIGxhYmVsKS5zZXRMYWJlbChsYWJlbCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBiZXR3ZWVuKHAxLCBwMiwgcDMpIHtcbiAgICByZXR1cm4gcDEuZGlzY2FyZEZpcnN0KHAyKS5kaXNjYXJkU2Vjb25kKHAzKVxuICAgICAgICAuc2V0TGFiZWwoJ2JldHdlZW4gJyArIHAxLmxhYmVsICsgJy8nICsgcDIubGFiZWwgKyAnLycgKyBwMy5sYWJlbCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBiZXR3ZWVuUGFyZW5zKHB4KSB7XG4gICAgcmV0dXJuIGJldHdlZW4ocGNoYXIoJygnKSwgcHgsIHBjaGFyKCcpJykpXG4gICAgICAgIC5zZXRMYWJlbCgnYmV0d2VlblBhcmVucyAnICsgcHgubGFiZWwpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYmluZFAoZmFtYiwgcHgpIHtcbiAgICBsZXQgbGFiZWwgPSAndW5rbm93bic7XG4gICAgcmV0dXJuIHBhcnNlcihzdHIgPT4ge1xuICAgICAgICBjb25zdCByZXMgPSBweC5ydW4oc3RyKTtcbiAgICAgICAgaWYgKHJlcy5pc0ZhaWx1cmUpIHJldHVybiByZXM7XG4gICAgICAgIHJldHVybiBmYW1iKHJlcy52YWx1ZVswXSkucnVuKHJlcy52YWx1ZVsxXSk7XG4gICAgfSwgbGFiZWwpLnNldExhYmVsKGxhYmVsKTtcbn1cblxuZnVuY3Rpb24gX2NvbnMoeCkge1xuICAgIHJldHVybiBmdW5jdGlvbiAoeHMpIHtcbiAgICAgICAgcmV0dXJuIFt4XS5jb25jYXQoeHMpO1xuICAgIH07XG59XG5cbmZ1bmN0aW9uIF9zZXRMYWJlbChweCwgbmV3TGFiZWwpIHtcbiAgICByZXR1cm4gcGFyc2VyKHN0ciA9PiB7XG4gICAgICAgIGxldCByZXN1bHQgPSBweC5ydW4oc3RyKTtcbiAgICAgICAgaWYgKHJlc3VsdC5pc0ZhaWx1cmUpIHJldHVybiBWYWxpZGF0aW9uLkZhaWx1cmUoUGFpcihuZXdMYWJlbCwgcmVzdWx0LnZhbHVlWzFdKSk7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSwgbmV3TGFiZWwpO1xufVxuXG4vLyB0aGUgcmVhbCB0aGluZy4uLlxuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlcihmbiwgbGFiZWwpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICB0eXBlOiAncGFyc2VyJyxcbiAgICAgICAgbGFiZWw6IGxhYmVsLFxuICAgICAgICBydW4oc3RyKSB7XG4gICAgICAgICAgICByZXR1cm4gZm4oc3RyKTtcbiAgICAgICAgfSxcbiAgICAgICAgYXBwbHkocHgpIHtcbiAgICAgICAgICAgIHJldHVybiBhcHBseVAodGhpcykocHgpO1xuICAgICAgICAgICAgLy9yZXR1cm4gdGhpcy5iaW5kKGFuZFRoZW4odGhpcywgcHgpLmZtYXAoKFtmLCB4XSkgPT4gZih4KSkpLnJ1bjsgLy8gd2UgYXJlIHRoZSBmUFxuICAgICAgICB9LFxuICAgICAgICBmbWFwKGZhYikge1xuICAgICAgICAgICAgLy9yZXR1cm4gZm1hcChmYWIsIHRoaXMpO1xuICAgICAgICAgICAgLy9yZXR1cm4gYmluZFAoc3RyID0+IHJldHVyblAoZmFiKHN0cikpLCB0aGlzKTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmJpbmQocGFyc2VkVmFsdWUgPT4gcmV0dXJuUChmYWIocGFyc2VkVmFsdWUpKSk7XG4gICAgICAgIH0sXG4gICAgICAgIGFuZFRoZW4ocHgpIHtcbiAgICAgICAgICAgIHJldHVybiBhbmRUaGVuKHRoaXMsIHB4KTtcbiAgICAgICAgfSxcbiAgICAgICAgb3JFbHNlKHB4KSB7XG4gICAgICAgICAgICByZXR1cm4gb3JFbHNlKHRoaXMsIHB4KTtcbiAgICAgICAgfSxcbiAgICAgICAgZGlzY2FyZEZpcnN0KHB4KSB7XG4gICAgICAgICAgICByZXR1cm4gZGlzY2FyZEZpcnN0KHRoaXMsIHB4KTtcbiAgICAgICAgfSxcbiAgICAgICAgZGlzY2FyZFNlY29uZChweCkge1xuICAgICAgICAgICAgcmV0dXJuIGRpc2NhcmRTZWNvbmQodGhpcywgcHgpO1xuICAgICAgICB9LFxuICAgICAgICBiaW5kKGZhbWIpIHtcbiAgICAgICAgICAgIHJldHVybiBiaW5kUChmYW1iLCB0aGlzKTtcbiAgICAgICAgfSxcbiAgICAgICAgc2V0TGFiZWwobmV3TGFiZWwpIHtcbiAgICAgICAgICAgIHJldHVybiBfc2V0TGFiZWwodGhpcywgbmV3TGFiZWwpO1xuICAgICAgICB9XG4gICAgfTtcbn1cbiJdfQ==