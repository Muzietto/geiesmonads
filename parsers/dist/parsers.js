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
            return fmap(function (_ref) {
                var _ref2 = _slicedToArray(_ref, 2),
                    x = _ref2[0],
                    y = _ref2[1];

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
            return _andThen(p1, p2).fmap(function (_ref3) {
                var _ref4 = _slicedToArray(_ref3, 2),
                    r1 = _ref4[0],
                    r2 = _ref4[1];

                return r1;
            }).run(str);
        }, label).setLabel(label);
    }

    exports.discardSecond = _discardSecond;
    function _discardFirst(p1, p2) {
        var label = p1.label + ' discardFirst ' + p2.label;
        return parser(function (str) {
            return _andThen(p1, p2).fmap(function (_ref5) {
                var _ref6 = _slicedToArray(_ref5, 2),
                    r1 = _ref6[0],
                    r2 = _ref6[1];

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2pzL3BhcnNlcnMuanMiXSwibmFtZXMiOlsicGNoYXIiLCJwZGlnaXQiLCJhbmRUaGVuQkJCIiwiY2hvaWNlIiwiYW55T2YiLCJmbWFwIiwicmV0dXJuUCIsImFwcGx5UHgiLCJhcHBseVAiLCJsaWZ0MiIsInNlcXVlbmNlUCIsInNlcXVlbmNlUDIiLCJwc3RyaW5nIiwiemVyb09yTW9yZSIsIm1hbnkiLCJtYW55MSIsIm9wdCIsIm9wdEJvb2siLCJiZXR3ZWVuIiwiYmV0d2VlblBhcmVucyIsImJpbmRQIiwicGFyc2VyIiwiY2hhclBhcnNlciIsInN0ciIsIkVycm9yIiwiY2hhciIsIlN1Y2Nlc3MiLCJGYWlsdXJlIiwiZGlnaXRQYXJzZXIiLCJwYXJzZUludCIsImRpZ2l0IiwibGFiZWwiLCJyZXN1bHQiLCJzZXRMYWJlbCIsImFuZFRoZW4iLCJwMSIsInAyIiwicmVzMSIsInJ1biIsImlzU3VjY2VzcyIsInJlczIiLCJ2YWx1ZSIsImJpbmQiLCJwYXJzZWRWYWx1ZTEiLCJwYXJzZWRWYWx1ZTIiLCJvckVsc2UiLCJfZmFpbCIsIl9zdWNjZWVkIiwicGFyc2VycyIsInJlZHVjZVJpZ2h0IiwicmVzdCIsImN1cnIiLCJyZWR1Y2UiLCJhY2MiLCJjaGFycyIsIm1hcCIsImZhYiIsInBhcnNlcjEiLCJ0b1N0cmluZyIsInJlcyIsImZQIiwieFAiLCJwYWlyZngiLCJwYXJzZWRWYWx1ZWYiLCJwYXJzZWRWYWx1ZXgiLCJmYWFiIiwicGFyc2VyMiIsImFwcGx5IiwiX2NvbnMiLCJ4IiwieSIsInNwbGl0IiwiaXNGYWlsdXJlIiwicmVzTiIsImNvbmNhdCIsIkp1c3QiLCJOb3RoaW5nIiwicFgiLCJzb21lUCIsIm5vbmVQIiwiZGlzY2FyZFNlY29uZCIsInIxIiwicjIiLCJkaXNjYXJkRmlyc3QiLCJwMyIsInB4IiwiZmFtYiIsInhzIiwiX3NldExhYmVsIiwibmV3TGFiZWwiLCJmbiIsInR5cGUiLCJwYXJzZWRWYWx1ZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7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Y2VzQ29udGVudCI6WyIvLyBjZnIuIFwiVW5kZXJzdGFuZGluZyBQYXJzZXIgQ29tYmluYXRvcnNcIiAoRiMgZm9yIEZ1biBhbmQgUHJvZml0KVxuXG5pbXBvcnQge1xuICAgIGhlYWQsXG4gICAgdGFpbCxcbiAgICBpc1N1Y2Nlc3MsXG4gICAgaXNGYWlsdXJlLFxufSBmcm9tICd1dGlsJztcbmltcG9ydCB7XG4gICAgcGFpcixcbiAgICBzdWNjZXNzLFxuICAgIGZhaWx1cmUsXG4gICAgc29tZSxcbiAgICBub25lLFxuICAgIFBhaXIsXG59IGZyb20gJ2NsYXNzZXMnO1xuaW1wb3J0IHtNYXliZX0gZnJvbSAnbWF5YmUnOyAvLyBKdXN0IG9yIE5vdGhpbmdcbmltcG9ydCB7VmFsaWRhdGlvbn0gZnJvbSAndmFsaWRhdGlvbic7IC8vIFN1Y2Nlc3Mgb3IgRmFpbHVyZVxuXG5jb25zdCBjaGFyUGFyc2VyID0gY2hhciA9PiBzdHIgPT4ge1xuICAgIGlmICgnJyA9PT0gc3RyKSB0aHJvdyBuZXcgRXJyb3IoJ3JlYWNoZWQgZW5kIG9mIGNoYXIgc3RyZWFtJyk7XG4gICAgaWYgKGhlYWQoc3RyKSA9PT0gY2hhcikgcmV0dXJuIFZhbGlkYXRpb24uU3VjY2VzcyhQYWlyKGNoYXIsIHRhaWwoc3RyKSkpO1xuICAgIHJldHVybiBWYWxpZGF0aW9uLkZhaWx1cmUoUGFpcignY2hhclBhcnNlcicsICd3YW50ZWQgJyArIGNoYXIgKyAnOyBnb3QgJyArIGhlYWQoc3RyKSkpO1xufTtcblxuY29uc3QgZGlnaXRQYXJzZXIgPSBkaWdpdCA9PiBzdHIgPT4ge1xuICAgIGlmICgnJyA9PT0gc3RyKSB0aHJvdyBuZXcgRXJyb3IoJ3JlYWNoZWQgZW5kIG9mIGNoYXIgc3RyZWFtJyk7XG4gICAgaWYgKHBhcnNlSW50KGhlYWQoc3RyKSwgMTApID09PSBkaWdpdCkgcmV0dXJuIFZhbGlkYXRpb24uU3VjY2VzcyhQYWlyKGRpZ2l0LCB0YWlsKHN0cikpKTtcbiAgICByZXR1cm4gVmFsaWRhdGlvbi5GYWlsdXJlKFBhaXIoJ2RpZ2l0UGFyc2VyJywgJ3dhbnRlZCAnICsgZGlnaXQgKyAnOyBnb3QgJyArIGhlYWQoc3RyKSkpO1xufTtcblxuZXhwb3J0IHtjaGFyUGFyc2VyLCBkaWdpdFBhcnNlcn07XG5cbmV4cG9ydCBmdW5jdGlvbiBwY2hhcihjaGFyKSB7XG4gICAgY29uc3QgbGFiZWwgPSAncGNoYXJfJyArIGNoYXI7XG4gICAgbGV0IHJlc3VsdCA9IGZ1bmN0aW9uIChzdHIpIHtcbiAgICAgICAgcmV0dXJuIGNoYXJQYXJzZXIoY2hhcikoc3RyKTtcbiAgICB9O1xuICAgIHJldHVybiBwYXJzZXIocmVzdWx0LCBsYWJlbCkuc2V0TGFiZWwobGFiZWwpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcGRpZ2l0KGRpZ2l0KSB7XG4gICAgcmV0dXJuIHBhcnNlcihzdHIgPT4gZGlnaXRQYXJzZXIoZGlnaXQpKHN0ciksICdwZGlnaXRfJyArIGRpZ2l0KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGFuZFRoZW4ocDEsIHAyKSB7XG4gICAgY29uc3QgbGFiZWwgPSBwMS5sYWJlbCArICcgYW5kVGhlbiAnICsgcDIubGFiZWw7XG4gICAgcmV0dXJuIHBhcnNlcihmdW5jdGlvbiAoc3RyKSB7XG4gICAgICAgIGxldCByZXMxID0gcDEucnVuKHN0cik7XG4gICAgICAgIGlmIChyZXMxLmlzU3VjY2Vzcykge1xuICAgICAgICAgICAgbGV0IHJlczIgPSBwMi5ydW4ocmVzMS52YWx1ZVsxXSk7XG4gICAgICAgICAgICBpZiAocmVzMi5pc1N1Y2Nlc3MpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gVmFsaWRhdGlvbi5TdWNjZXNzKFBhaXIoUGFpcihyZXMxLnZhbHVlWzBdLCByZXMyLnZhbHVlWzBdKSwgcmVzMi52YWx1ZVsxXSkpO1xuICAgICAgICAgICAgfSBlbHNlIHJldHVybiBWYWxpZGF0aW9uLkZhaWx1cmUoUGFpcihsYWJlbCwgcmVzMi52YWx1ZVsxXSkpO1xuICAgICAgICB9IGVsc2UgcmV0dXJuIFZhbGlkYXRpb24uRmFpbHVyZShQYWlyKGxhYmVsLCByZXMxLnZhbHVlWzFdKSk7XG4gICAgfSwgbGFiZWwpO1xufVxuXG4vLyB1c2luZyBiaW5kIC0gVE9ETzogbWFrZSBpdCB3b3JrXG5leHBvcnQgZnVuY3Rpb24gYW5kVGhlbkJCQihwMSwgcDIpIHtcbiAgICByZXR1cm4gcDEuYmluZChwYXJzZWRWYWx1ZTEgPT4ge1xuICAgICAgICByZXR1cm4gcDIuYmluZChwYXJzZWRWYWx1ZTIgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHJldHVyblAoUGFpcihwYXJzZWRWYWx1ZTEsIHBhcnNlZFZhbHVlMikpO1xuICAgICAgICB9KTtcbiAgICB9KS5zZXRMYWJlbChwMS5sYWJlbCArICcgYW5kVGhlbiAnICsgcDIubGFiZWwpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gb3JFbHNlKHAxLCBwMikge1xuICAgIGNvbnN0IGxhYmVsID0gcDEubGFiZWwgKyAnIG9yRWxzZSAnICsgcDIubGFiZWw7XG4gICAgcmV0dXJuIHBhcnNlcihzdHIgPT4ge1xuICAgICAgICBjb25zdCByZXMxID0gcDEucnVuKHN0cik7XG4gICAgICAgIGlmIChyZXMxLmlzU3VjY2VzcykgcmV0dXJuIHJlczE7XG4gICAgICAgIGNvbnN0IHJlczIgPSBwMi5ydW4oc3RyKTtcbiAgICAgICAgaWYgKHJlczIuaXNTdWNjZXNzKSByZXR1cm4gcmVzMjtcbiAgICAgICAgcmV0dXJuIFZhbGlkYXRpb24uRmFpbHVyZShQYWlyKGxhYmVsLCByZXMyLnZhbHVlWzFdKSk7XG4gICAgfSwgbGFiZWwpLnNldExhYmVsKGxhYmVsKTtcbn1cblxubGV0IF9mYWlsID0gcGFyc2VyKHN0ciA9PiBWYWxpZGF0aW9uLkZhaWx1cmUoUGFpcihQYWlyKCdwYXJzaW5nIGZhaWxlZCcsICdfZmFpbCcpLCAnX2ZhaWwnKSkpO1xuXG4vLyByZXR1cm4gbmV1dHJhbCBlbGVtZW50IGluc3RlYWQgb2YgbWVzc2FnZVxubGV0IF9zdWNjZWVkID0gcGFyc2VyKHN0ciA9PiBWYWxpZGF0aW9uLlN1Y2Nlc3MoUGFpcihQYWlyKCdwYXJzaW5nIHN1Y2NlZWRlZCcsIHN0ciksICdfc3VjY2VlZCcpKSk7XG5cbmV4cG9ydCBmdW5jdGlvbiBjaG9pY2UocGFyc2Vycykge1xuICAgIHJldHVybiBwYXJzZXJzLnJlZHVjZVJpZ2h0KChyZXN0LCBjdXJyKSA9PiBvckVsc2UoY3VyciwgcmVzdCksIF9mYWlsKVxuICAgICAgICAuc2V0TGFiZWwoJ2Nob2ljZSAnICsgcGFyc2Vycy5yZWR1Y2UoKGFjYywgY3VycikgPT4gYWNjICsgJy8nICsgY3Vyci5sYWJlbCwgJycpKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGFueU9mKGNoYXJzKSB7XG4gICAgcmV0dXJuIGNob2ljZShjaGFycy5tYXAocGNoYXIpKVxuICAgICAgICAuc2V0TGFiZWwoJ2FueU9mICcgKyBjaGFycy5yZWR1Y2UoKGFjYywgY3VycikgPT4gYWNjICsgY3VyciwgJycpKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGZtYXAoZmFiLCBwYXJzZXIxKSB7XG4gICAgY29uc3QgbGFiZWwgPSBwYXJzZXIxLmxhYmVsICsgJyBmbWFwICcgKyBmYWIudG9TdHJpbmcoKTtcbiAgICByZXR1cm4gcGFyc2VyKHN0ciA9PiB7XG4gICAgICAgIGxldCByZXMgPSBwYXJzZXIxLnJ1bihzdHIpO1xuICAgICAgICBpZiAocmVzLmlzU3VjY2VzcykgcmV0dXJuIFZhbGlkYXRpb24uU3VjY2VzcyhQYWlyKGZhYihyZXMudmFsdWVbMF0pLCByZXMudmFsdWVbMV0pKTtcbiAgICAgICAgcmV0dXJuIFZhbGlkYXRpb24uRmFpbHVyZShQYWlyKGxhYmVsLCByZXMudmFsdWVbMV0pKTtcbiAgICB9LCBsYWJlbCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZXR1cm5QKHZhbHVlKSB7XG4gICAgcmV0dXJuIHBhcnNlcihzdHIgPT4gVmFsaWRhdGlvbi5TdWNjZXNzKFBhaXIodmFsdWUsIHN0cikpLCB2YWx1ZSk7XG59XG5cbi8vIHBhcnNlcihhIC0+IGIpIC0+IHBhcnNlcihhKSAtPiBwYXJzZXIoYilcbmV4cG9ydCBmdW5jdGlvbiBhcHBseVB4KGZQKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uICh4UCkge1xuICAgICAgICByZXR1cm4gYW5kVGhlbihmUCwgeFApLmZtYXAocGFpcmZ4ID0+IHBhaXJmeFswXShwYWlyZnhbMV0pKTtcbiAgICB9O1xufVxuXG4vLyB1c2luZyBiaW5kXG5leHBvcnQgZnVuY3Rpb24gYXBwbHlQKGZQKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uICh4UCkge1xuICAgICAgICByZXR1cm4gZlAuYmluZChwYXJzZWRWYWx1ZWYgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHhQLmJpbmQocGFyc2VkVmFsdWV4ID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmV0dXJuUChwYXJzZWRWYWx1ZWYocGFyc2VkVmFsdWV4KSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGxpZnQyKGZhYWIpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKHBhcnNlcjEpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChwYXJzZXIyKSB7XG4gICAgICAgICAgICAvL3JldHVybiBhcHBseVAoYXBwbHlQKHJldHVyblAoZmFhYikpKHBhcnNlcjEpKShwYXJzZXIyKTtcbiAgICAgICAgICAgIHJldHVybiByZXR1cm5QKGZhYWIpLmFwcGx5KHBhcnNlcjEpLmFwcGx5KHBhcnNlcjIpOyAvLyB1c2luZyBpbnN0YW5jZSBtZXRob2RzXG4gICAgICAgIH07XG4gICAgfTtcbn1cblxuLy8gdXNpbmcgbGlmdDIoY29ucylcbmV4cG9ydCBmdW5jdGlvbiBzZXF1ZW5jZVAocGFyc2Vycykge1xuICAgIHJldHVybiBwYXJzZXJzXG4gICAgICAgIC5yZWR1Y2VSaWdodCgocmVzdCwgY3VycikgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIGxpZnQyKF9jb25zKShjdXJyKShyZXN0KTtcbiAgICAgICAgfSwgcmV0dXJuUChbXSkpO1xufVxuXG4vLyB1c2luZyBuYWl2ZSBhbmRUaGVuICYmIGZtYXAgLS0+IHJldHVybnMgc3RyaW5ncywgbm90IGFycmF5cyFcbmV4cG9ydCBmdW5jdGlvbiBzZXF1ZW5jZVAyKHBhcnNlcnMpIHtcbiAgICByZXR1cm4gcGFyc2Vyc1xuICAgICAgICAucmVkdWNlUmlnaHQoKHJlc3QsIGN1cnIpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBmbWFwKChbeCwgeV0pID0+IHggKyB5LCBhbmRUaGVuKGN1cnIsIHJlc3QpKTtcbiAgICAgICAgfSwgcmV0dXJuUCgnJykpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcHN0cmluZyhzdHIpIHtcbiAgICByZXR1cm4gc2VxdWVuY2VQKHN0ci5zcGxpdCgnJykubWFwKHBjaGFyKSlcbiAgICAgICAgLnNldExhYmVsKCdwc3RyaW5nICcgKyBzdHIpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gemVyb09yTW9yZSh4UCkgeyAvLyB6ZXJvT3JNb3JlIDo6IHAgYSAtPiBbYV0gLT4gdHJ5IFthXSA9IHAgYSAtPiBwIFthXVxuICAgIHJldHVybiBzdHIgPT4ge1xuICAgICAgICBsZXQgcmVzMSA9IHhQLnJ1bihzdHIpO1xuICAgICAgICBpZiAocmVzMS5pc0ZhaWx1cmUpIHJldHVybiBWYWxpZGF0aW9uLlN1Y2Nlc3MoUGFpcihbXSwgc3RyKSk7XG4gICAgICAgIGxldCByZXNOID0gemVyb09yTW9yZSh4UCkocmVzMVsxXSk7XG4gICAgICAgIHJldHVybiBWYWxpZGF0aW9uLlN1Y2Nlc3MoUGFpcihbcmVzMVswXV0uY29uY2F0KHJlc05bMF0pLCByZXNOWzFdKSk7XG4gICAgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1hbnkoeFApIHtcbiAgICBjb25zdCBsYWJlbCA9ICdtYW55ICcgKyB4UC5sYWJlbDtcbiAgICByZXR1cm4gcGFyc2VyKHN0ciA9PiB7XG4gICAgICAgIHJldHVybiB6ZXJvT3JNb3JlKHhQKShzdHIpO1xuICAgIH0sIGxhYmVsKS5zZXRMYWJlbChsYWJlbCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtYW55MSh4UCkge1xuICAgIGNvbnN0IGxhYmVsID0gJ21hbnkxICcgKyB4UC5sYWJlbDtcbiAgICByZXR1cm4gcGFyc2VyKHN0ciA9PiB7XG4gICAgICAgIGxldCByZXMxID0geFAucnVuKHN0cik7XG4gICAgICAgIGlmIChyZXMxLmlzRmFpbHVyZSkgcmV0dXJuIHJlczE7XG4gICAgICAgIGxldCByZXNOID0gemVyb09yTW9yZSh4UCkocmVzMVsxXSk7XG4gICAgICAgIHJldHVybiBWYWxpZGF0aW9uLlN1Y2Nlc3MoUGFpcihbcmVzMVswXV0uY29uY2F0KHJlc05bMF0pLCByZXNOWzFdKSk7XG4gICAgfSwgbGFiZWwpLnNldExhYmVsKGxhYmVsKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG9wdCh4UCkge1xuICAgIGNvbnN0IGxhYmVsID0gJ29wdCAnICsgeFAubGFiZWw7XG4gICAgcmV0dXJuIHBhcnNlcihzdHIgPT4ge1xuICAgICAgICBsZXQgcmVzID0geFAuZm1hcCh4ID0+IE1heWJlLkp1c3QoeCkpLnJ1bihzdHIpO1xuICAgICAgICBpZiAocmVzLmlzU3VjY2VzcykgcmV0dXJuIHJlcztcbiAgICAgICAgcmV0dXJuIFZhbGlkYXRpb24uU3VjY2VzcyhQYWlyKE1heWJlLk5vdGhpbmcoKSwgc3RyKSk7XG4gICAgfSwgbGFiZWwpLnNldExhYmVsKGxhYmVsKTtcbn1cblxuLy8gb3B0IGZyb20gdGhlIGJvb2tcbmV4cG9ydCBmdW5jdGlvbiBvcHRCb29rKHBYKSB7XG4gICAgY29uc3Qgc29tZVAgPSBwWC5mbWFwKE1heWJlLkp1c3QpO1xuICAgIGNvbnN0IG5vbmVQID0gcmV0dXJuUChNYXliZS5Ob3RoaW5nKTtcbiAgICByZXR1cm4gc29tZVAub3JFbHNlKG5vbmVQKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRpc2NhcmRTZWNvbmQocDEsIHAyKSB7XG4gICAgY29uc3QgbGFiZWwgPSBwMS5sYWJlbCArICcgZGlzY2FyZFNlY29uZCAnICsgcDIubGFiZWw7XG4gICAgcmV0dXJuIHBhcnNlcihzdHIgPT4ge1xuICAgICAgICByZXR1cm4gYW5kVGhlbihwMSwgcDIpLmZtYXAoKFtyMSwgcjJdKSA9PiByMSkucnVuKHN0cik7XG4gICAgfSwgbGFiZWwpLnNldExhYmVsKGxhYmVsKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRpc2NhcmRGaXJzdChwMSwgcDIpIHtcbiAgICBjb25zdCBsYWJlbCA9IHAxLmxhYmVsICsgJyBkaXNjYXJkRmlyc3QgJyArIHAyLmxhYmVsO1xuICAgIHJldHVybiBwYXJzZXIoc3RyID0+IHtcbiAgICAgICAgcmV0dXJuIGFuZFRoZW4ocDEsIHAyKS5mbWFwKChbcjEsIHIyXSkgPT4gcjIpLnJ1bihzdHIpO1xuICAgIH0sIGxhYmVsKS5zZXRMYWJlbChsYWJlbCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBiZXR3ZWVuKHAxLCBwMiwgcDMpIHtcbiAgICByZXR1cm4gcDEuZGlzY2FyZEZpcnN0KHAyKS5kaXNjYXJkU2Vjb25kKHAzKVxuICAgICAgICAuc2V0TGFiZWwoJ2JldHdlZW4gJyArIHAxLmxhYmVsICsgJy8nICsgcDIubGFiZWwgKyAnLycgKyBwMy5sYWJlbCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBiZXR3ZWVuUGFyZW5zKHB4KSB7XG4gICAgcmV0dXJuIGJldHdlZW4ocGNoYXIoJygnKSwgcHgsIHBjaGFyKCcpJykpXG4gICAgICAgIC5zZXRMYWJlbCgnYmV0d2VlblBhcmVucyAnICsgcHgubGFiZWwpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYmluZFAoZmFtYiwgcHgpIHtcbiAgICBsZXQgbGFiZWwgPSAndW5rbm93bic7XG4gICAgcmV0dXJuIHBhcnNlcihzdHIgPT4ge1xuICAgICAgICBjb25zdCByZXMgPSBweC5ydW4oc3RyKTtcbiAgICAgICAgaWYgKHJlcy5pc0ZhaWx1cmUpIHJldHVybiByZXM7XG4gICAgICAgIHJldHVybiBmYW1iKHJlcy52YWx1ZVswXSkucnVuKHJlcy52YWx1ZVsxXSk7XG4gICAgfSwgbGFiZWwpLnNldExhYmVsKGxhYmVsKTtcbn1cblxuZnVuY3Rpb24gX2NvbnMoeCkge1xuICAgIHJldHVybiBmdW5jdGlvbiAoeHMpIHtcbiAgICAgICAgcmV0dXJuIFt4XS5jb25jYXQoeHMpO1xuICAgIH07XG59XG5cbmZ1bmN0aW9uIF9zZXRMYWJlbChweCwgbmV3TGFiZWwpIHtcbiAgICByZXR1cm4gcGFyc2VyKHN0ciA9PiB7XG4gICAgICAgIGxldCByZXN1bHQgPSBweC5ydW4oc3RyKTtcbiAgICAgICAgaWYgKHJlc3VsdC5pc0ZhaWx1cmUpIHJldHVybiBWYWxpZGF0aW9uLkZhaWx1cmUoUGFpcihuZXdMYWJlbCwgcmVzdWx0LnZhbHVlWzFdKSk7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSwgbmV3TGFiZWwpO1xufVxuXG4vLyB0aGUgcmVhbCB0aGluZy4uLlxuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlcihmbiwgbGFiZWwpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICB0eXBlOiAncGFyc2VyJyxcbiAgICAgICAgbGFiZWw6IGxhYmVsLFxuICAgICAgICBydW4oc3RyKSB7XG4gICAgICAgICAgICByZXR1cm4gZm4oc3RyKTtcbiAgICAgICAgfSxcbiAgICAgICAgYXBwbHkocHgpIHtcbiAgICAgICAgICAgIHJldHVybiBhcHBseVAodGhpcykocHgpO1xuICAgICAgICAgICAgLy9yZXR1cm4gdGhpcy5iaW5kKGFuZFRoZW4odGhpcywgcHgpLmZtYXAoKFtmLCB4XSkgPT4gZih4KSkpLnJ1bjsgLy8gd2UgYXJlIHRoZSBmUFxuICAgICAgICB9LFxuICAgICAgICBmbWFwKGZhYikge1xuICAgICAgICAgICAgLy9yZXR1cm4gZm1hcChmYWIsIHRoaXMpO1xuICAgICAgICAgICAgLy9yZXR1cm4gYmluZFAoc3RyID0+IHJldHVyblAoZmFiKHN0cikpLCB0aGlzKTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmJpbmQocGFyc2VkVmFsdWUgPT4gcmV0dXJuUChmYWIocGFyc2VkVmFsdWUpKSk7XG4gICAgICAgIH0sXG4gICAgICAgIGFuZFRoZW4ocHgpIHtcbiAgICAgICAgICAgIHJldHVybiBhbmRUaGVuKHRoaXMsIHB4KTtcbiAgICAgICAgfSxcbiAgICAgICAgb3JFbHNlKHB4KSB7XG4gICAgICAgICAgICByZXR1cm4gb3JFbHNlKHRoaXMsIHB4KTtcbiAgICAgICAgfSxcbiAgICAgICAgZGlzY2FyZEZpcnN0KHB4KSB7XG4gICAgICAgICAgICByZXR1cm4gZGlzY2FyZEZpcnN0KHRoaXMsIHB4KTtcbiAgICAgICAgfSxcbiAgICAgICAgZGlzY2FyZFNlY29uZChweCkge1xuICAgICAgICAgICAgcmV0dXJuIGRpc2NhcmRTZWNvbmQodGhpcywgcHgpO1xuICAgICAgICB9LFxuICAgICAgICBiaW5kKGZhbWIpIHtcbiAgICAgICAgICAgIHJldHVybiBiaW5kUChmYW1iLCB0aGlzKTtcbiAgICAgICAgfSxcbiAgICAgICAgc2V0TGFiZWwobmV3TGFiZWwpIHtcbiAgICAgICAgICAgIHJldHVybiBfc2V0TGFiZWwodGhpcywgbmV3TGFiZWwpO1xuICAgICAgICB9XG4gICAgfTtcbn1cbiJdfQ==