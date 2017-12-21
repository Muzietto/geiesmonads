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
            var resN = zeroOrMore(xP)(res1.value[1]);
            return _validation.Validation.Success((0, _classes.Pair)([res1.value[0]].concat(resN.value[0]), resN.value[1]));
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2pzL3BhcnNlcnMuanMiXSwibmFtZXMiOlsicGNoYXIiLCJwZGlnaXQiLCJhbmRUaGVuQkJCIiwiY2hvaWNlIiwiYW55T2YiLCJmbWFwIiwicmV0dXJuUCIsImFwcGx5UHgiLCJhcHBseVAiLCJsaWZ0MiIsInNlcXVlbmNlUCIsInNlcXVlbmNlUDIiLCJwc3RyaW5nIiwiemVyb09yTW9yZSIsIm1hbnkiLCJtYW55MSIsIm9wdCIsIm9wdEJvb2siLCJiZXR3ZWVuIiwiYmV0d2VlblBhcmVucyIsImJpbmRQIiwicGFyc2VyIiwiY2hhclBhcnNlciIsInN0ciIsIkVycm9yIiwiY2hhciIsIlN1Y2Nlc3MiLCJGYWlsdXJlIiwiZGlnaXRQYXJzZXIiLCJwYXJzZUludCIsImRpZ2l0IiwibGFiZWwiLCJyZXN1bHQiLCJzZXRMYWJlbCIsImFuZFRoZW4iLCJwMSIsInAyIiwicmVzMSIsInJ1biIsImlzU3VjY2VzcyIsInJlczIiLCJ2YWx1ZSIsImJpbmQiLCJwYXJzZWRWYWx1ZTEiLCJwYXJzZWRWYWx1ZTIiLCJvckVsc2UiLCJfZmFpbCIsIl9zdWNjZWVkIiwicGFyc2VycyIsInJlZHVjZVJpZ2h0IiwicmVzdCIsImN1cnIiLCJyZWR1Y2UiLCJhY2MiLCJjaGFycyIsIm1hcCIsImZhYiIsInBhcnNlcjEiLCJ0b1N0cmluZyIsInJlcyIsImZQIiwieFAiLCJwYWlyZngiLCJwYXJzZWRWYWx1ZWYiLCJwYXJzZWRWYWx1ZXgiLCJmYWFiIiwicGFyc2VyMiIsImFwcGx5IiwiX2NvbnMiLCJwYWlyIiwic3BsaXQiLCJpc0ZhaWx1cmUiLCJyZXNOIiwiY29uY2F0IiwiSnVzdCIsIngiLCJOb3RoaW5nIiwicFgiLCJzb21lUCIsIm5vbmVQIiwiZGlzY2FyZFNlY29uZCIsInIxIiwicjIiLCJkaXNjYXJkRmlyc3QiLCJwMyIsInB4IiwiZmFtYiIsInhzIiwiX3NldExhYmVsIiwibmV3TGFiZWwiLCJmbiIsInR5cGUiLCJwYXJzZWRWYWx1ZSJdLCJtYXBwaW5ncyI6Ijs7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Q0giLCJmaWxlIjoicGFyc2Vycy5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vIGNmci4gXCJVbmRlcnN0YW5kaW5nIFBhcnNlciBDb21iaW5hdG9yc1wiIChGIyBmb3IgRnVuIGFuZCBQcm9maXQpXG5cbmltcG9ydCB7XG4gICAgaGVhZCxcbiAgICB0YWlsLFxuICAgIGlzU3VjY2VzcyxcbiAgICBpc0ZhaWx1cmUsXG59IGZyb20gJ3V0aWwnO1xuaW1wb3J0IHtcbiAgICBwYWlyLFxuICAgIHN1Y2Nlc3MsXG4gICAgZmFpbHVyZSxcbiAgICBzb21lLFxuICAgIG5vbmUsXG4gICAgUGFpcixcbn0gZnJvbSAnY2xhc3Nlcyc7XG5pbXBvcnQge01heWJlfSBmcm9tICdtYXliZSc7IC8vIEp1c3Qgb3IgTm90aGluZ1xuaW1wb3J0IHtWYWxpZGF0aW9ufSBmcm9tICd2YWxpZGF0aW9uJzsgLy8gU3VjY2VzcyBvciBGYWlsdXJlXG5cbmNvbnN0IGNoYXJQYXJzZXIgPSBjaGFyID0+IHN0ciA9PiB7XG4gICAgaWYgKCcnID09PSBzdHIpIHRocm93IG5ldyBFcnJvcigncmVhY2hlZCBlbmQgb2YgY2hhciBzdHJlYW0nKTtcbiAgICBpZiAoaGVhZChzdHIpID09PSBjaGFyKSByZXR1cm4gVmFsaWRhdGlvbi5TdWNjZXNzKFBhaXIoY2hhciwgdGFpbChzdHIpKSk7XG4gICAgcmV0dXJuIFZhbGlkYXRpb24uRmFpbHVyZShQYWlyKCdjaGFyUGFyc2VyJywgJ3dhbnRlZCAnICsgY2hhciArICc7IGdvdCAnICsgaGVhZChzdHIpKSk7XG59O1xuXG5jb25zdCBkaWdpdFBhcnNlciA9IGRpZ2l0ID0+IHN0ciA9PiB7XG4gICAgaWYgKCcnID09PSBzdHIpIHRocm93IG5ldyBFcnJvcigncmVhY2hlZCBlbmQgb2YgY2hhciBzdHJlYW0nKTtcbiAgICBpZiAocGFyc2VJbnQoaGVhZChzdHIpLCAxMCkgPT09IGRpZ2l0KSByZXR1cm4gVmFsaWRhdGlvbi5TdWNjZXNzKFBhaXIoZGlnaXQsIHRhaWwoc3RyKSkpO1xuICAgIHJldHVybiBWYWxpZGF0aW9uLkZhaWx1cmUoUGFpcignZGlnaXRQYXJzZXInLCAnd2FudGVkICcgKyBkaWdpdCArICc7IGdvdCAnICsgaGVhZChzdHIpKSk7XG59O1xuXG5leHBvcnQge2NoYXJQYXJzZXIsIGRpZ2l0UGFyc2VyfTtcblxuZXhwb3J0IGZ1bmN0aW9uIHBjaGFyKGNoYXIpIHtcbiAgICBjb25zdCBsYWJlbCA9ICdwY2hhcl8nICsgY2hhcjtcbiAgICBsZXQgcmVzdWx0ID0gZnVuY3Rpb24gKHN0cikge1xuICAgICAgICByZXR1cm4gY2hhclBhcnNlcihjaGFyKShzdHIpO1xuICAgIH07XG4gICAgcmV0dXJuIHBhcnNlcihyZXN1bHQsIGxhYmVsKS5zZXRMYWJlbChsYWJlbCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwZGlnaXQoZGlnaXQpIHtcbiAgICByZXR1cm4gcGFyc2VyKHN0ciA9PiBkaWdpdFBhcnNlcihkaWdpdCkoc3RyKSwgJ3BkaWdpdF8nICsgZGlnaXQpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYW5kVGhlbihwMSwgcDIpIHtcbiAgICBjb25zdCBsYWJlbCA9IHAxLmxhYmVsICsgJyBhbmRUaGVuICcgKyBwMi5sYWJlbDtcbiAgICByZXR1cm4gcGFyc2VyKGZ1bmN0aW9uIChzdHIpIHtcbiAgICAgICAgbGV0IHJlczEgPSBwMS5ydW4oc3RyKTtcbiAgICAgICAgaWYgKHJlczEuaXNTdWNjZXNzKSB7XG4gICAgICAgICAgICBsZXQgcmVzMiA9IHAyLnJ1bihyZXMxLnZhbHVlWzFdKTtcbiAgICAgICAgICAgIGlmIChyZXMyLmlzU3VjY2Vzcykge1xuICAgICAgICAgICAgICAgIHJldHVybiBWYWxpZGF0aW9uLlN1Y2Nlc3MoUGFpcihQYWlyKHJlczEudmFsdWVbMF0sIHJlczIudmFsdWVbMF0pLCByZXMyLnZhbHVlWzFdKSk7XG4gICAgICAgICAgICB9IGVsc2UgcmV0dXJuIFZhbGlkYXRpb24uRmFpbHVyZShQYWlyKGxhYmVsLCByZXMyLnZhbHVlWzFdKSk7XG4gICAgICAgIH0gZWxzZSByZXR1cm4gVmFsaWRhdGlvbi5GYWlsdXJlKFBhaXIobGFiZWwsIHJlczEudmFsdWVbMV0pKTtcbiAgICB9LCBsYWJlbCk7XG59XG5cbi8vIHVzaW5nIGJpbmQgLSBUT0RPOiBtYWtlIGl0IHdvcmtcbmV4cG9ydCBmdW5jdGlvbiBhbmRUaGVuQkJCKHAxLCBwMikge1xuICAgIHJldHVybiBwMS5iaW5kKHBhcnNlZFZhbHVlMSA9PiB7XG4gICAgICAgIHJldHVybiBwMi5iaW5kKHBhcnNlZFZhbHVlMiA9PiB7XG4gICAgICAgICAgICByZXR1cm4gcmV0dXJuUChQYWlyKHBhcnNlZFZhbHVlMSwgcGFyc2VkVmFsdWUyKSk7XG4gICAgICAgIH0pO1xuICAgIH0pLnNldExhYmVsKHAxLmxhYmVsICsgJyBhbmRUaGVuICcgKyBwMi5sYWJlbCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBvckVsc2UocDEsIHAyKSB7XG4gICAgY29uc3QgbGFiZWwgPSBwMS5sYWJlbCArICcgb3JFbHNlICcgKyBwMi5sYWJlbDtcbiAgICByZXR1cm4gcGFyc2VyKHN0ciA9PiB7XG4gICAgICAgIGNvbnN0IHJlczEgPSBwMS5ydW4oc3RyKTtcbiAgICAgICAgaWYgKHJlczEuaXNTdWNjZXNzKSByZXR1cm4gcmVzMTtcbiAgICAgICAgY29uc3QgcmVzMiA9IHAyLnJ1bihzdHIpO1xuICAgICAgICBpZiAocmVzMi5pc1N1Y2Nlc3MpIHJldHVybiByZXMyO1xuICAgICAgICByZXR1cm4gVmFsaWRhdGlvbi5GYWlsdXJlKFBhaXIobGFiZWwsIHJlczIudmFsdWVbMV0pKTtcbiAgICB9LCBsYWJlbCkuc2V0TGFiZWwobGFiZWwpO1xufVxuXG5sZXQgX2ZhaWwgPSBwYXJzZXIoc3RyID0+IFZhbGlkYXRpb24uRmFpbHVyZShQYWlyKFBhaXIoJ3BhcnNpbmcgZmFpbGVkJywgJ19mYWlsJyksICdfZmFpbCcpKSk7XG5cbi8vIHJldHVybiBuZXV0cmFsIGVsZW1lbnQgaW5zdGVhZCBvZiBtZXNzYWdlXG5sZXQgX3N1Y2NlZWQgPSBwYXJzZXIoc3RyID0+IFZhbGlkYXRpb24uU3VjY2VzcyhQYWlyKFBhaXIoJ3BhcnNpbmcgc3VjY2VlZGVkJywgc3RyKSwgJ19zdWNjZWVkJykpKTtcblxuZXhwb3J0IGZ1bmN0aW9uIGNob2ljZShwYXJzZXJzKSB7XG4gICAgcmV0dXJuIHBhcnNlcnMucmVkdWNlUmlnaHQoKHJlc3QsIGN1cnIpID0+IG9yRWxzZShjdXJyLCByZXN0KSwgX2ZhaWwpXG4gICAgICAgIC5zZXRMYWJlbCgnY2hvaWNlICcgKyBwYXJzZXJzLnJlZHVjZSgoYWNjLCBjdXJyKSA9PiBhY2MgKyAnLycgKyBjdXJyLmxhYmVsLCAnJykpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYW55T2YoY2hhcnMpIHtcbiAgICByZXR1cm4gY2hvaWNlKGNoYXJzLm1hcChwY2hhcikpXG4gICAgICAgIC5zZXRMYWJlbCgnYW55T2YgJyArIGNoYXJzLnJlZHVjZSgoYWNjLCBjdXJyKSA9PiBhY2MgKyBjdXJyLCAnJykpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZm1hcChmYWIsIHBhcnNlcjEpIHtcbiAgICBjb25zdCBsYWJlbCA9IHBhcnNlcjEubGFiZWwgKyAnIGZtYXAgJyArIGZhYi50b1N0cmluZygpO1xuICAgIHJldHVybiBwYXJzZXIoc3RyID0+IHtcbiAgICAgICAgbGV0IHJlcyA9IHBhcnNlcjEucnVuKHN0cik7XG4gICAgICAgIGlmIChyZXMuaXNTdWNjZXNzKSByZXR1cm4gVmFsaWRhdGlvbi5TdWNjZXNzKFBhaXIoZmFiKHJlcy52YWx1ZVswXSksIHJlcy52YWx1ZVsxXSkpO1xuICAgICAgICByZXR1cm4gVmFsaWRhdGlvbi5GYWlsdXJlKFBhaXIobGFiZWwsIHJlcy52YWx1ZVsxXSkpO1xuICAgIH0sIGxhYmVsKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJldHVyblAodmFsdWUpIHtcbiAgICByZXR1cm4gcGFyc2VyKHN0ciA9PiBWYWxpZGF0aW9uLlN1Y2Nlc3MoUGFpcih2YWx1ZSwgc3RyKSksIHZhbHVlKTtcbn1cblxuLy8gcGFyc2VyKGEgLT4gYikgLT4gcGFyc2VyKGEpIC0+IHBhcnNlcihiKVxuZXhwb3J0IGZ1bmN0aW9uIGFwcGx5UHgoZlApIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKHhQKSB7XG4gICAgICAgIHJldHVybiBhbmRUaGVuKGZQLCB4UCkuZm1hcChwYWlyZnggPT4gcGFpcmZ4WzBdKHBhaXJmeFsxXSkpO1xuICAgIH07XG59XG5cbi8vIHVzaW5nIGJpbmRcbmV4cG9ydCBmdW5jdGlvbiBhcHBseVAoZlApIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKHhQKSB7XG4gICAgICAgIHJldHVybiBmUC5iaW5kKHBhcnNlZFZhbHVlZiA9PiB7XG4gICAgICAgICAgICByZXR1cm4geFAuYmluZChwYXJzZWRWYWx1ZXggPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiByZXR1cm5QKHBhcnNlZFZhbHVlZihwYXJzZWRWYWx1ZXgpKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbGlmdDIoZmFhYikge1xuICAgIHJldHVybiBmdW5jdGlvbiAocGFyc2VyMSkge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKHBhcnNlcjIpIHtcbiAgICAgICAgICAgIC8vcmV0dXJuIGFwcGx5UChhcHBseVAocmV0dXJuUChmYWFiKSkocGFyc2VyMSkpKHBhcnNlcjIpO1xuICAgICAgICAgICAgcmV0dXJuIHJldHVyblAoZmFhYikuYXBwbHkocGFyc2VyMSkuYXBwbHkocGFyc2VyMik7IC8vIHVzaW5nIGluc3RhbmNlIG1ldGhvZHNcbiAgICAgICAgfTtcbiAgICB9O1xufVxuXG4vLyB1c2luZyBsaWZ0Mihjb25zKVxuZXhwb3J0IGZ1bmN0aW9uIHNlcXVlbmNlUChwYXJzZXJzKSB7XG4gICAgcmV0dXJuIHBhcnNlcnNcbiAgICAgICAgLnJlZHVjZVJpZ2h0KChyZXN0LCBjdXJyKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gbGlmdDIoX2NvbnMpKGN1cnIpKHJlc3QpO1xuICAgICAgICB9LCByZXR1cm5QKFtdKSk7XG59XG5cbi8vIHVzaW5nIG5haXZlIGFuZFRoZW4gJiYgZm1hcCAtLT4gcmV0dXJucyBzdHJpbmdzLCBub3QgYXJyYXlzIVxuZXhwb3J0IGZ1bmN0aW9uIHNlcXVlbmNlUDIocGFyc2Vycykge1xuICAgIHJldHVybiBwYXJzZXJzXG4gICAgICAgIC5yZWR1Y2VSaWdodCgocmVzdCwgY3VycikgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIGZtYXAocGFpciA9PiBwYWlyWzBdICsgcGFpclsxXSwgYW5kVGhlbihjdXJyLCByZXN0KSk7XG4gICAgICAgIH0sIHJldHVyblAoJycpKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHBzdHJpbmcoc3RyKSB7XG4gICAgcmV0dXJuIHNlcXVlbmNlUChzdHIuc3BsaXQoJycpLm1hcChwY2hhcikpXG4gICAgICAgIC5zZXRMYWJlbCgncHN0cmluZyAnICsgc3RyKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHplcm9Pck1vcmUoeFApIHsgLy8gemVyb09yTW9yZSA6OiBwIGEgLT4gW2FdIC0+IHRyeSBbYV0gPSBwIGEgLT4gcCBbYV1cbiAgICByZXR1cm4gc3RyID0+IHtcbiAgICAgICAgbGV0IHJlczEgPSB4UC5ydW4oc3RyKTtcbiAgICAgICAgaWYgKHJlczEuaXNGYWlsdXJlKSByZXR1cm4gVmFsaWRhdGlvbi5TdWNjZXNzKFBhaXIoW10sIHN0cikpO1xuICAgICAgICBsZXQgcmVzTiA9IHplcm9Pck1vcmUoeFApKHJlczEudmFsdWVbMV0pO1xuICAgICAgICByZXR1cm4gVmFsaWRhdGlvbi5TdWNjZXNzKFBhaXIoW3JlczEudmFsdWVbMF1dLmNvbmNhdChyZXNOLnZhbHVlWzBdKSwgcmVzTi52YWx1ZVsxXSkpO1xuICAgIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtYW55KHhQKSB7XG4gICAgY29uc3QgbGFiZWwgPSAnbWFueSAnICsgeFAubGFiZWw7XG4gICAgcmV0dXJuIHBhcnNlcihzdHIgPT4ge1xuICAgICAgICByZXR1cm4gemVyb09yTW9yZSh4UCkoc3RyKTtcbiAgICB9LCBsYWJlbCkuc2V0TGFiZWwobGFiZWwpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbWFueTEoeFApIHtcbiAgICBjb25zdCBsYWJlbCA9ICdtYW55MSAnICsgeFAubGFiZWw7XG4gICAgcmV0dXJuIHBhcnNlcihzdHIgPT4ge1xuICAgICAgICBsZXQgcmVzMSA9IHhQLnJ1bihzdHIpO1xuICAgICAgICBpZiAocmVzMS5pc0ZhaWx1cmUpIHJldHVybiByZXMxO1xuICAgICAgICBsZXQgcmVzTiA9IHplcm9Pck1vcmUoeFApKHJlczFbMV0pO1xuICAgICAgICByZXR1cm4gVmFsaWRhdGlvbi5TdWNjZXNzKFBhaXIoW3JlczFbMF1dLmNvbmNhdChyZXNOWzBdKSwgcmVzTlsxXSkpO1xuICAgIH0sIGxhYmVsKS5zZXRMYWJlbChsYWJlbCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBvcHQoeFApIHtcbiAgICBjb25zdCBsYWJlbCA9ICdvcHQgJyArIHhQLmxhYmVsO1xuICAgIHJldHVybiBwYXJzZXIoc3RyID0+IHtcbiAgICAgICAgbGV0IHJlcyA9IHhQLmZtYXAoeCA9PiBNYXliZS5KdXN0KHgpKS5ydW4oc3RyKTtcbiAgICAgICAgaWYgKHJlcy5pc1N1Y2Nlc3MpIHJldHVybiByZXM7XG4gICAgICAgIHJldHVybiBWYWxpZGF0aW9uLlN1Y2Nlc3MoUGFpcihNYXliZS5Ob3RoaW5nKCksIHN0cikpO1xuICAgIH0sIGxhYmVsKS5zZXRMYWJlbChsYWJlbCk7XG59XG5cbi8vIG9wdCBmcm9tIHRoZSBib29rXG5leHBvcnQgZnVuY3Rpb24gb3B0Qm9vayhwWCkge1xuICAgIGNvbnN0IHNvbWVQID0gcFguZm1hcChNYXliZS5KdXN0KTtcbiAgICBjb25zdCBub25lUCA9IHJldHVyblAoTWF5YmUuTm90aGluZyk7XG4gICAgcmV0dXJuIHNvbWVQLm9yRWxzZShub25lUCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBkaXNjYXJkU2Vjb25kKHAxLCBwMikge1xuICAgIGNvbnN0IGxhYmVsID0gcDEubGFiZWwgKyAnIGRpc2NhcmRTZWNvbmQgJyArIHAyLmxhYmVsO1xuICAgIHJldHVybiBwYXJzZXIoc3RyID0+IHtcbiAgICAgICAgcmV0dXJuIGFuZFRoZW4ocDEsIHAyKS5mbWFwKChbcjEsIHIyXSkgPT4gcjEpLnJ1bihzdHIpO1xuICAgIH0sIGxhYmVsKS5zZXRMYWJlbChsYWJlbCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBkaXNjYXJkRmlyc3QocDEsIHAyKSB7XG4gICAgY29uc3QgbGFiZWwgPSBwMS5sYWJlbCArICcgZGlzY2FyZEZpcnN0ICcgKyBwMi5sYWJlbDtcbiAgICByZXR1cm4gcGFyc2VyKHN0ciA9PiB7XG4gICAgICAgIHJldHVybiBhbmRUaGVuKHAxLCBwMikuZm1hcCgoW3IxLCByMl0pID0+IHIyKS5ydW4oc3RyKTtcbiAgICB9LCBsYWJlbCkuc2V0TGFiZWwobGFiZWwpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYmV0d2VlbihwMSwgcDIsIHAzKSB7XG4gICAgcmV0dXJuIHAxLmRpc2NhcmRGaXJzdChwMikuZGlzY2FyZFNlY29uZChwMylcbiAgICAgICAgLnNldExhYmVsKCdiZXR3ZWVuICcgKyBwMS5sYWJlbCArICcvJyArIHAyLmxhYmVsICsgJy8nICsgcDMubGFiZWwpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYmV0d2VlblBhcmVucyhweCkge1xuICAgIHJldHVybiBiZXR3ZWVuKHBjaGFyKCcoJyksIHB4LCBwY2hhcignKScpKVxuICAgICAgICAuc2V0TGFiZWwoJ2JldHdlZW5QYXJlbnMgJyArIHB4LmxhYmVsKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGJpbmRQKGZhbWIsIHB4KSB7XG4gICAgbGV0IGxhYmVsID0gJ3Vua25vd24nO1xuICAgIHJldHVybiBwYXJzZXIoc3RyID0+IHtcbiAgICAgICAgY29uc3QgcmVzID0gcHgucnVuKHN0cik7XG4gICAgICAgIGlmIChyZXMuaXNGYWlsdXJlKSByZXR1cm4gcmVzO1xuICAgICAgICByZXR1cm4gZmFtYihyZXMudmFsdWVbMF0pLnJ1bihyZXMudmFsdWVbMV0pO1xuICAgIH0sIGxhYmVsKS5zZXRMYWJlbChsYWJlbCk7XG59XG5cbmZ1bmN0aW9uIF9jb25zKHgpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKHhzKSB7XG4gICAgICAgIHJldHVybiBbeF0uY29uY2F0KHhzKTtcbiAgICB9O1xufVxuXG5mdW5jdGlvbiBfc2V0TGFiZWwocHgsIG5ld0xhYmVsKSB7XG4gICAgcmV0dXJuIHBhcnNlcihzdHIgPT4ge1xuICAgICAgICBsZXQgcmVzdWx0ID0gcHgucnVuKHN0cik7XG4gICAgICAgIGlmIChyZXN1bHQuaXNGYWlsdXJlKSByZXR1cm4gVmFsaWRhdGlvbi5GYWlsdXJlKFBhaXIobmV3TGFiZWwsIHJlc3VsdC52YWx1ZVsxXSkpO1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sIG5ld0xhYmVsKTtcbn1cblxuLy8gdGhlIHJlYWwgdGhpbmcuLi5cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZXIoZm4sIGxhYmVsKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgdHlwZTogJ3BhcnNlcicsXG4gICAgICAgIGxhYmVsOiBsYWJlbCxcbiAgICAgICAgcnVuKHN0cikge1xuICAgICAgICAgICAgcmV0dXJuIGZuKHN0cik7XG4gICAgICAgIH0sXG4gICAgICAgIGFwcGx5KHB4KSB7XG4gICAgICAgICAgICByZXR1cm4gYXBwbHlQKHRoaXMpKHB4KTtcbiAgICAgICAgICAgIC8vcmV0dXJuIHRoaXMuYmluZChhbmRUaGVuKHRoaXMsIHB4KS5mbWFwKChbZiwgeF0pID0+IGYoeCkpKS5ydW47IC8vIHdlIGFyZSB0aGUgZlBcbiAgICAgICAgfSxcbiAgICAgICAgZm1hcChmYWIpIHtcbiAgICAgICAgICAgIC8vcmV0dXJuIGZtYXAoZmFiLCB0aGlzKTtcbiAgICAgICAgICAgIC8vcmV0dXJuIGJpbmRQKHN0ciA9PiByZXR1cm5QKGZhYihzdHIpKSwgdGhpcyk7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5iaW5kKHBhcnNlZFZhbHVlID0+IHJldHVyblAoZmFiKHBhcnNlZFZhbHVlKSkpO1xuICAgICAgICB9LFxuICAgICAgICBhbmRUaGVuKHB4KSB7XG4gICAgICAgICAgICByZXR1cm4gYW5kVGhlbih0aGlzLCBweCk7XG4gICAgICAgIH0sXG4gICAgICAgIG9yRWxzZShweCkge1xuICAgICAgICAgICAgcmV0dXJuIG9yRWxzZSh0aGlzLCBweCk7XG4gICAgICAgIH0sXG4gICAgICAgIGRpc2NhcmRGaXJzdChweCkge1xuICAgICAgICAgICAgcmV0dXJuIGRpc2NhcmRGaXJzdCh0aGlzLCBweCk7XG4gICAgICAgIH0sXG4gICAgICAgIGRpc2NhcmRTZWNvbmQocHgpIHtcbiAgICAgICAgICAgIHJldHVybiBkaXNjYXJkU2Vjb25kKHRoaXMsIHB4KTtcbiAgICAgICAgfSxcbiAgICAgICAgYmluZChmYW1iKSB7XG4gICAgICAgICAgICByZXR1cm4gYmluZFAoZmFtYiwgdGhpcyk7XG4gICAgICAgIH0sXG4gICAgICAgIHNldExhYmVsKG5ld0xhYmVsKSB7XG4gICAgICAgICAgICByZXR1cm4gX3NldExhYmVsKHRoaXMsIG5ld0xhYmVsKTtcbiAgICAgICAgfVxuICAgIH07XG59XG4iXX0=