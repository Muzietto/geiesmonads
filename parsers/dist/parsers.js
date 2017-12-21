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
    // Success or Failure

    // cfr. "Understanding Parser Combinators" (F# for Fun and Profit)

    var charParser = function charParser(char) {
        return function (str) {
            if ('' === str) throw new Error('reached end of char stream');
            if ((0, _util.head)(str) === char) return _validation.Validation.Success((0, _classes.Pair)(char, (0, _util.tail)(str)));
            return _validation.Validation.Failure((0, _classes.Pair)('charParser', 'wanted ' + char + '; got ' + (0, _util.head)(str)));
        };
    }; // Just or Nothing


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
            var resN = zeroOrMore(xP)(res1.value[1]);
            return _validation.Validation.Success((0, _classes.Pair)([res1.value[0]].concat(resN.value[0]), resN.value[1]));
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

    // opt from the book - works ok, but toString() gives strange results
    function optBook(pX) {
        var someP = pX.fmap(_maybe.Maybe.Just);
        var noneP = returnP(_maybe.Maybe.Nothing);
        return someP.orElse(noneP);
    }

    function _discardSecond(p1, p2) {
        var label = p1.label + ' discardSecond ' + p2.label;
        return parser(function (str) {
            return _andThen(p1, p2).fmap(function (pair) {
                return pair[0];
            }).run(str);
        }, label).setLabel(label);
    }

    exports.discardSecond = _discardSecond;
    function _discardFirst(p1, p2) {
        var label = p1.label + ' discardFirst ' + p2.label;
        return parser(function (str) {
            return _andThen(p1, p2).fmap(function (pair) {
                return pair[1];
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2pzL3BhcnNlcnMuanMiXSwibmFtZXMiOlsicGNoYXIiLCJwZGlnaXQiLCJhbmRUaGVuQkJCIiwiY2hvaWNlIiwiYW55T2YiLCJmbWFwIiwicmV0dXJuUCIsImFwcGx5UHgiLCJhcHBseVAiLCJsaWZ0MiIsInNlcXVlbmNlUCIsInNlcXVlbmNlUDIiLCJwc3RyaW5nIiwiemVyb09yTW9yZSIsIm1hbnkiLCJtYW55MSIsIm9wdCIsIm9wdEJvb2siLCJiZXR3ZWVuIiwiYmV0d2VlblBhcmVucyIsImJpbmRQIiwicGFyc2VyIiwiY2hhclBhcnNlciIsInN0ciIsIkVycm9yIiwiY2hhciIsIlN1Y2Nlc3MiLCJGYWlsdXJlIiwiZGlnaXRQYXJzZXIiLCJwYXJzZUludCIsImRpZ2l0IiwibGFiZWwiLCJyZXN1bHQiLCJzZXRMYWJlbCIsImFuZFRoZW4iLCJwMSIsInAyIiwicmVzMSIsInJ1biIsImlzU3VjY2VzcyIsInJlczIiLCJ2YWx1ZSIsImJpbmQiLCJwYXJzZWRWYWx1ZTEiLCJwYXJzZWRWYWx1ZTIiLCJvckVsc2UiLCJfZmFpbCIsIl9zdWNjZWVkIiwicGFyc2VycyIsInJlZHVjZVJpZ2h0IiwicmVzdCIsImN1cnIiLCJyZWR1Y2UiLCJhY2MiLCJjaGFycyIsIm1hcCIsImZhYiIsInBhcnNlcjEiLCJ0b1N0cmluZyIsInJlcyIsImZQIiwieFAiLCJwYWlyZngiLCJwYXJzZWRWYWx1ZWYiLCJwYXJzZWRWYWx1ZXgiLCJmYWFiIiwicGFyc2VyMiIsImFwcGx5IiwiX2NvbnMiLCJwYWlyIiwic3BsaXQiLCJpc0ZhaWx1cmUiLCJyZXNOIiwiY29uY2F0IiwiSnVzdCIsIngiLCJOb3RoaW5nIiwicFgiLCJzb21lUCIsIm5vbmVQIiwiZGlzY2FyZFNlY29uZCIsImRpc2NhcmRGaXJzdCIsInAzIiwicHgiLCJmYW1iIiwieHMiLCJfc2V0TGFiZWwiLCJuZXdMYWJlbCIsImZuIiwidHlwZSIsInBhcnNlZFZhbHVlIl0sIm1hcHBpbmdzIjoiOzs7Ozs7O1lBaUNn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Ly8gY2ZyLiBcIlVuZGVyc3RhbmRpbmcgUGFyc2VyIENvbWJpbmF0b3JzXCIgKEYjIGZvciBGdW4gYW5kIFByb2ZpdClcblxuaW1wb3J0IHtcbiAgICBoZWFkLFxuICAgIHRhaWwsXG4gICAgaXNTdWNjZXNzLFxuICAgIGlzRmFpbHVyZSxcbn0gZnJvbSAndXRpbCc7XG5pbXBvcnQge1xuICAgIHBhaXIsXG4gICAgc3VjY2VzcyxcbiAgICBmYWlsdXJlLFxuICAgIHNvbWUsXG4gICAgbm9uZSxcbiAgICBQYWlyLFxufSBmcm9tICdjbGFzc2VzJztcbmltcG9ydCB7TWF5YmV9IGZyb20gJ21heWJlJzsgLy8gSnVzdCBvciBOb3RoaW5nXG5pbXBvcnQge1ZhbGlkYXRpb259IGZyb20gJ3ZhbGlkYXRpb24nOyAvLyBTdWNjZXNzIG9yIEZhaWx1cmVcblxuY29uc3QgY2hhclBhcnNlciA9IGNoYXIgPT4gc3RyID0+IHtcbiAgICBpZiAoJycgPT09IHN0cikgdGhyb3cgbmV3IEVycm9yKCdyZWFjaGVkIGVuZCBvZiBjaGFyIHN0cmVhbScpO1xuICAgIGlmIChoZWFkKHN0cikgPT09IGNoYXIpIHJldHVybiBWYWxpZGF0aW9uLlN1Y2Nlc3MoUGFpcihjaGFyLCB0YWlsKHN0cikpKTtcbiAgICByZXR1cm4gVmFsaWRhdGlvbi5GYWlsdXJlKFBhaXIoJ2NoYXJQYXJzZXInLCAnd2FudGVkICcgKyBjaGFyICsgJzsgZ290ICcgKyBoZWFkKHN0cikpKTtcbn07XG5cbmNvbnN0IGRpZ2l0UGFyc2VyID0gZGlnaXQgPT4gc3RyID0+IHtcbiAgICBpZiAoJycgPT09IHN0cikgdGhyb3cgbmV3IEVycm9yKCdyZWFjaGVkIGVuZCBvZiBjaGFyIHN0cmVhbScpO1xuICAgIGlmIChwYXJzZUludChoZWFkKHN0ciksIDEwKSA9PT0gZGlnaXQpIHJldHVybiBWYWxpZGF0aW9uLlN1Y2Nlc3MoUGFpcihkaWdpdCwgdGFpbChzdHIpKSk7XG4gICAgcmV0dXJuIFZhbGlkYXRpb24uRmFpbHVyZShQYWlyKCdkaWdpdFBhcnNlcicsICd3YW50ZWQgJyArIGRpZ2l0ICsgJzsgZ290ICcgKyBoZWFkKHN0cikpKTtcbn07XG5cbmV4cG9ydCB7Y2hhclBhcnNlciwgZGlnaXRQYXJzZXJ9O1xuXG5leHBvcnQgZnVuY3Rpb24gcGNoYXIoY2hhcikge1xuICAgIGNvbnN0IGxhYmVsID0gJ3BjaGFyXycgKyBjaGFyO1xuICAgIGxldCByZXN1bHQgPSBmdW5jdGlvbiAoc3RyKSB7XG4gICAgICAgIHJldHVybiBjaGFyUGFyc2VyKGNoYXIpKHN0cik7XG4gICAgfTtcbiAgICByZXR1cm4gcGFyc2VyKHJlc3VsdCwgbGFiZWwpLnNldExhYmVsKGxhYmVsKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHBkaWdpdChkaWdpdCkge1xuICAgIHJldHVybiBwYXJzZXIoc3RyID0+IGRpZ2l0UGFyc2VyKGRpZ2l0KShzdHIpLCAncGRpZ2l0XycgKyBkaWdpdCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhbmRUaGVuKHAxLCBwMikge1xuICAgIGNvbnN0IGxhYmVsID0gcDEubGFiZWwgKyAnIGFuZFRoZW4gJyArIHAyLmxhYmVsO1xuICAgIHJldHVybiBwYXJzZXIoZnVuY3Rpb24gKHN0cikge1xuICAgICAgICBsZXQgcmVzMSA9IHAxLnJ1bihzdHIpO1xuICAgICAgICBpZiAocmVzMS5pc1N1Y2Nlc3MpIHtcbiAgICAgICAgICAgIGxldCByZXMyID0gcDIucnVuKHJlczEudmFsdWVbMV0pO1xuICAgICAgICAgICAgaWYgKHJlczIuaXNTdWNjZXNzKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFZhbGlkYXRpb24uU3VjY2VzcyhQYWlyKFBhaXIocmVzMS52YWx1ZVswXSwgcmVzMi52YWx1ZVswXSksIHJlczIudmFsdWVbMV0pKTtcbiAgICAgICAgICAgIH0gZWxzZSByZXR1cm4gVmFsaWRhdGlvbi5GYWlsdXJlKFBhaXIobGFiZWwsIHJlczIudmFsdWVbMV0pKTtcbiAgICAgICAgfSBlbHNlIHJldHVybiBWYWxpZGF0aW9uLkZhaWx1cmUoUGFpcihsYWJlbCwgcmVzMS52YWx1ZVsxXSkpO1xuICAgIH0sIGxhYmVsKTtcbn1cblxuLy8gdXNpbmcgYmluZCAtIFRPRE86IG1ha2UgaXQgd29ya1xuZXhwb3J0IGZ1bmN0aW9uIGFuZFRoZW5CQkIocDEsIHAyKSB7XG4gICAgcmV0dXJuIHAxLmJpbmQocGFyc2VkVmFsdWUxID0+IHtcbiAgICAgICAgcmV0dXJuIHAyLmJpbmQocGFyc2VkVmFsdWUyID0+IHtcbiAgICAgICAgICAgIHJldHVybiByZXR1cm5QKFBhaXIocGFyc2VkVmFsdWUxLCBwYXJzZWRWYWx1ZTIpKTtcbiAgICAgICAgfSk7XG4gICAgfSkuc2V0TGFiZWwocDEubGFiZWwgKyAnIGFuZFRoZW4gJyArIHAyLmxhYmVsKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG9yRWxzZShwMSwgcDIpIHtcbiAgICBjb25zdCBsYWJlbCA9IHAxLmxhYmVsICsgJyBvckVsc2UgJyArIHAyLmxhYmVsO1xuICAgIHJldHVybiBwYXJzZXIoc3RyID0+IHtcbiAgICAgICAgY29uc3QgcmVzMSA9IHAxLnJ1bihzdHIpO1xuICAgICAgICBpZiAocmVzMS5pc1N1Y2Nlc3MpIHJldHVybiByZXMxO1xuICAgICAgICBjb25zdCByZXMyID0gcDIucnVuKHN0cik7XG4gICAgICAgIGlmIChyZXMyLmlzU3VjY2VzcykgcmV0dXJuIHJlczI7XG4gICAgICAgIHJldHVybiBWYWxpZGF0aW9uLkZhaWx1cmUoUGFpcihsYWJlbCwgcmVzMi52YWx1ZVsxXSkpO1xuICAgIH0sIGxhYmVsKS5zZXRMYWJlbChsYWJlbCk7XG59XG5cbmxldCBfZmFpbCA9IHBhcnNlcihzdHIgPT4gVmFsaWRhdGlvbi5GYWlsdXJlKFBhaXIoUGFpcigncGFyc2luZyBmYWlsZWQnLCAnX2ZhaWwnKSwgJ19mYWlsJykpKTtcblxuLy8gcmV0dXJuIG5ldXRyYWwgZWxlbWVudCBpbnN0ZWFkIG9mIG1lc3NhZ2VcbmxldCBfc3VjY2VlZCA9IHBhcnNlcihzdHIgPT4gVmFsaWRhdGlvbi5TdWNjZXNzKFBhaXIoUGFpcigncGFyc2luZyBzdWNjZWVkZWQnLCBzdHIpLCAnX3N1Y2NlZWQnKSkpO1xuXG5leHBvcnQgZnVuY3Rpb24gY2hvaWNlKHBhcnNlcnMpIHtcbiAgICByZXR1cm4gcGFyc2Vycy5yZWR1Y2VSaWdodCgocmVzdCwgY3VycikgPT4gb3JFbHNlKGN1cnIsIHJlc3QpLCBfZmFpbClcbiAgICAgICAgLnNldExhYmVsKCdjaG9pY2UgJyArIHBhcnNlcnMucmVkdWNlKChhY2MsIGN1cnIpID0+IGFjYyArICcvJyArIGN1cnIubGFiZWwsICcnKSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhbnlPZihjaGFycykge1xuICAgIHJldHVybiBjaG9pY2UoY2hhcnMubWFwKHBjaGFyKSlcbiAgICAgICAgLnNldExhYmVsKCdhbnlPZiAnICsgY2hhcnMucmVkdWNlKChhY2MsIGN1cnIpID0+IGFjYyArIGN1cnIsICcnKSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBmbWFwKGZhYiwgcGFyc2VyMSkge1xuICAgIGNvbnN0IGxhYmVsID0gcGFyc2VyMS5sYWJlbCArICcgZm1hcCAnICsgZmFiLnRvU3RyaW5nKCk7XG4gICAgcmV0dXJuIHBhcnNlcihzdHIgPT4ge1xuICAgICAgICBsZXQgcmVzID0gcGFyc2VyMS5ydW4oc3RyKTtcbiAgICAgICAgaWYgKHJlcy5pc1N1Y2Nlc3MpIHJldHVybiBWYWxpZGF0aW9uLlN1Y2Nlc3MoUGFpcihmYWIocmVzLnZhbHVlWzBdKSwgcmVzLnZhbHVlWzFdKSk7XG4gICAgICAgIHJldHVybiBWYWxpZGF0aW9uLkZhaWx1cmUoUGFpcihsYWJlbCwgcmVzLnZhbHVlWzFdKSk7XG4gICAgfSwgbGFiZWwpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcmV0dXJuUCh2YWx1ZSkge1xuICAgIHJldHVybiBwYXJzZXIoc3RyID0+IFZhbGlkYXRpb24uU3VjY2VzcyhQYWlyKHZhbHVlLCBzdHIpKSwgdmFsdWUpO1xufVxuXG4vLyBwYXJzZXIoYSAtPiBiKSAtPiBwYXJzZXIoYSkgLT4gcGFyc2VyKGIpXG5leHBvcnQgZnVuY3Rpb24gYXBwbHlQeChmUCkge1xuICAgIHJldHVybiBmdW5jdGlvbiAoeFApIHtcbiAgICAgICAgcmV0dXJuIGFuZFRoZW4oZlAsIHhQKS5mbWFwKHBhaXJmeCA9PiBwYWlyZnhbMF0ocGFpcmZ4WzFdKSk7XG4gICAgfTtcbn1cblxuLy8gdXNpbmcgYmluZFxuZXhwb3J0IGZ1bmN0aW9uIGFwcGx5UChmUCkge1xuICAgIHJldHVybiBmdW5jdGlvbiAoeFApIHtcbiAgICAgICAgcmV0dXJuIGZQLmJpbmQocGFyc2VkVmFsdWVmID0+IHtcbiAgICAgICAgICAgIHJldHVybiB4UC5iaW5kKHBhcnNlZFZhbHVleCA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJldHVyblAocGFyc2VkVmFsdWVmKHBhcnNlZFZhbHVleCkpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBsaWZ0MihmYWFiKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uIChwYXJzZXIxKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAocGFyc2VyMikge1xuICAgICAgICAgICAgLy9yZXR1cm4gYXBwbHlQKGFwcGx5UChyZXR1cm5QKGZhYWIpKShwYXJzZXIxKSkocGFyc2VyMik7XG4gICAgICAgICAgICByZXR1cm4gcmV0dXJuUChmYWFiKS5hcHBseShwYXJzZXIxKS5hcHBseShwYXJzZXIyKTsgLy8gdXNpbmcgaW5zdGFuY2UgbWV0aG9kc1xuICAgICAgICB9O1xuICAgIH07XG59XG5cbi8vIHVzaW5nIGxpZnQyKGNvbnMpXG5leHBvcnQgZnVuY3Rpb24gc2VxdWVuY2VQKHBhcnNlcnMpIHtcbiAgICByZXR1cm4gcGFyc2Vyc1xuICAgICAgICAucmVkdWNlUmlnaHQoKHJlc3QsIGN1cnIpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBsaWZ0MihfY29ucykoY3VycikocmVzdCk7XG4gICAgICAgIH0sIHJldHVyblAoW10pKTtcbn1cblxuLy8gdXNpbmcgbmFpdmUgYW5kVGhlbiAmJiBmbWFwIC0tPiByZXR1cm5zIHN0cmluZ3MsIG5vdCBhcnJheXMhXG5leHBvcnQgZnVuY3Rpb24gc2VxdWVuY2VQMihwYXJzZXJzKSB7XG4gICAgcmV0dXJuIHBhcnNlcnNcbiAgICAgICAgLnJlZHVjZVJpZ2h0KChyZXN0LCBjdXJyKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gZm1hcChwYWlyID0+IHBhaXJbMF0gKyBwYWlyWzFdLCBhbmRUaGVuKGN1cnIsIHJlc3QpKTtcbiAgICAgICAgfSwgcmV0dXJuUCgnJykpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcHN0cmluZyhzdHIpIHtcbiAgICByZXR1cm4gc2VxdWVuY2VQKHN0ci5zcGxpdCgnJykubWFwKHBjaGFyKSlcbiAgICAgICAgLnNldExhYmVsKCdwc3RyaW5nICcgKyBzdHIpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gemVyb09yTW9yZSh4UCkgeyAvLyB6ZXJvT3JNb3JlIDo6IHAgYSAtPiBbYV0gLT4gdHJ5IFthXSA9IHAgYSAtPiBwIFthXVxuICAgIHJldHVybiBzdHIgPT4ge1xuICAgICAgICBsZXQgcmVzMSA9IHhQLnJ1bihzdHIpO1xuICAgICAgICBpZiAocmVzMS5pc0ZhaWx1cmUpIHJldHVybiBWYWxpZGF0aW9uLlN1Y2Nlc3MoUGFpcihbXSwgc3RyKSk7XG4gICAgICAgIGxldCByZXNOID0gemVyb09yTW9yZSh4UCkocmVzMS52YWx1ZVsxXSk7XG4gICAgICAgIHJldHVybiBWYWxpZGF0aW9uLlN1Y2Nlc3MoUGFpcihbcmVzMS52YWx1ZVswXV0uY29uY2F0KHJlc04udmFsdWVbMF0pLCByZXNOLnZhbHVlWzFdKSk7XG4gICAgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1hbnkoeFApIHtcbiAgICBjb25zdCBsYWJlbCA9ICdtYW55ICcgKyB4UC5sYWJlbDtcbiAgICByZXR1cm4gcGFyc2VyKHN0ciA9PiB7XG4gICAgICAgIHJldHVybiB6ZXJvT3JNb3JlKHhQKShzdHIpO1xuICAgIH0sIGxhYmVsKS5zZXRMYWJlbChsYWJlbCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtYW55MSh4UCkge1xuICAgIGNvbnN0IGxhYmVsID0gJ21hbnkxICcgKyB4UC5sYWJlbDtcbiAgICByZXR1cm4gcGFyc2VyKHN0ciA9PiB7XG4gICAgICAgIGxldCByZXMxID0geFAucnVuKHN0cik7XG4gICAgICAgIGlmIChyZXMxLmlzRmFpbHVyZSkgcmV0dXJuIHJlczE7XG4gICAgICAgIGxldCByZXNOID0gemVyb09yTW9yZSh4UCkocmVzMS52YWx1ZVsxXSk7XG4gICAgICAgIHJldHVybiBWYWxpZGF0aW9uLlN1Y2Nlc3MoUGFpcihbcmVzMS52YWx1ZVswXV0uY29uY2F0KHJlc04udmFsdWVbMF0pLCByZXNOLnZhbHVlWzFdKSk7XG4gICAgfSwgbGFiZWwpLnNldExhYmVsKGxhYmVsKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG9wdCh4UCkge1xuICAgIGNvbnN0IGxhYmVsID0gJ29wdCAnICsgeFAubGFiZWw7XG4gICAgcmV0dXJuIHBhcnNlcihzdHIgPT4ge1xuICAgICAgICBsZXQgcmVzID0geFAuZm1hcCh4ID0+IE1heWJlLkp1c3QoeCkpLnJ1bihzdHIpO1xuICAgICAgICBpZiAocmVzLmlzU3VjY2VzcykgcmV0dXJuIHJlcztcbiAgICAgICAgcmV0dXJuIFZhbGlkYXRpb24uU3VjY2VzcyhQYWlyKE1heWJlLk5vdGhpbmcoKSwgc3RyKSk7XG4gICAgfSwgbGFiZWwpLnNldExhYmVsKGxhYmVsKTtcbn1cblxuLy8gb3B0IGZyb20gdGhlIGJvb2sgLSB3b3JrcyBvaywgYnV0IHRvU3RyaW5nKCkgZ2l2ZXMgc3RyYW5nZSByZXN1bHRzXG5leHBvcnQgZnVuY3Rpb24gb3B0Qm9vayhwWCkge1xuICAgIGNvbnN0IHNvbWVQID0gcFguZm1hcChNYXliZS5KdXN0KTtcbiAgICBjb25zdCBub25lUCA9IHJldHVyblAoTWF5YmUuTm90aGluZyk7XG4gICAgcmV0dXJuIHNvbWVQLm9yRWxzZShub25lUCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBkaXNjYXJkU2Vjb25kKHAxLCBwMikge1xuICAgIGNvbnN0IGxhYmVsID0gcDEubGFiZWwgKyAnIGRpc2NhcmRTZWNvbmQgJyArIHAyLmxhYmVsO1xuICAgIHJldHVybiBwYXJzZXIoc3RyID0+IHtcbiAgICAgICAgcmV0dXJuIGFuZFRoZW4ocDEsIHAyKS5mbWFwKHBhaXIgPT4gcGFpclswXSkucnVuKHN0cik7XG4gICAgfSwgbGFiZWwpLnNldExhYmVsKGxhYmVsKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRpc2NhcmRGaXJzdChwMSwgcDIpIHtcbiAgICBjb25zdCBsYWJlbCA9IHAxLmxhYmVsICsgJyBkaXNjYXJkRmlyc3QgJyArIHAyLmxhYmVsO1xuICAgIHJldHVybiBwYXJzZXIoc3RyID0+IHtcbiAgICAgICAgcmV0dXJuIGFuZFRoZW4ocDEsIHAyKS5mbWFwKHBhaXIgPT4gcGFpclsxXSkucnVuKHN0cik7XG4gICAgfSwgbGFiZWwpLnNldExhYmVsKGxhYmVsKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGJldHdlZW4ocDEsIHAyLCBwMykge1xuICAgIHJldHVybiBwMS5kaXNjYXJkRmlyc3QocDIpLmRpc2NhcmRTZWNvbmQocDMpXG4gICAgICAgIC5zZXRMYWJlbCgnYmV0d2VlbiAnICsgcDEubGFiZWwgKyAnLycgKyBwMi5sYWJlbCArICcvJyArIHAzLmxhYmVsKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGJldHdlZW5QYXJlbnMocHgpIHtcbiAgICByZXR1cm4gYmV0d2VlbihwY2hhcignKCcpLCBweCwgcGNoYXIoJyknKSlcbiAgICAgICAgLnNldExhYmVsKCdiZXR3ZWVuUGFyZW5zICcgKyBweC5sYWJlbCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBiaW5kUChmYW1iLCBweCkge1xuICAgIGxldCBsYWJlbCA9ICd1bmtub3duJztcbiAgICByZXR1cm4gcGFyc2VyKHN0ciA9PiB7XG4gICAgICAgIGNvbnN0IHJlcyA9IHB4LnJ1bihzdHIpO1xuICAgICAgICBpZiAocmVzLmlzRmFpbHVyZSkgcmV0dXJuIHJlcztcbiAgICAgICAgcmV0dXJuIGZhbWIocmVzLnZhbHVlWzBdKS5ydW4ocmVzLnZhbHVlWzFdKTtcbiAgICB9LCBsYWJlbCkuc2V0TGFiZWwobGFiZWwpO1xufVxuXG5mdW5jdGlvbiBfY29ucyh4KSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uICh4cykge1xuICAgICAgICByZXR1cm4gW3hdLmNvbmNhdCh4cyk7XG4gICAgfTtcbn1cblxuZnVuY3Rpb24gX3NldExhYmVsKHB4LCBuZXdMYWJlbCkge1xuICAgIHJldHVybiBwYXJzZXIoc3RyID0+IHtcbiAgICAgICAgbGV0IHJlc3VsdCA9IHB4LnJ1bihzdHIpO1xuICAgICAgICBpZiAocmVzdWx0LmlzRmFpbHVyZSkgcmV0dXJuIFZhbGlkYXRpb24uRmFpbHVyZShQYWlyKG5ld0xhYmVsLCByZXN1bHQudmFsdWVbMV0pKTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LCBuZXdMYWJlbCk7XG59XG5cbi8vIHRoZSByZWFsIHRoaW5nLi4uXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VyKGZuLCBsYWJlbCkge1xuICAgIHJldHVybiB7XG4gICAgICAgIHR5cGU6ICdwYXJzZXInLFxuICAgICAgICBsYWJlbDogbGFiZWwsXG4gICAgICAgIHJ1bihzdHIpIHtcbiAgICAgICAgICAgIHJldHVybiBmbihzdHIpO1xuICAgICAgICB9LFxuICAgICAgICBhcHBseShweCkge1xuICAgICAgICAgICAgcmV0dXJuIGFwcGx5UCh0aGlzKShweCk7XG4gICAgICAgICAgICAvL3JldHVybiB0aGlzLmJpbmQoYW5kVGhlbih0aGlzLCBweCkuZm1hcCgoW2YsIHhdKSA9PiBmKHgpKSkucnVuOyAvLyB3ZSBhcmUgdGhlIGZQXG4gICAgICAgIH0sXG4gICAgICAgIGZtYXAoZmFiKSB7XG4gICAgICAgICAgICAvL3JldHVybiBmbWFwKGZhYiwgdGhpcyk7XG4gICAgICAgICAgICAvL3JldHVybiBiaW5kUChzdHIgPT4gcmV0dXJuUChmYWIoc3RyKSksIHRoaXMpO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuYmluZChwYXJzZWRWYWx1ZSA9PiByZXR1cm5QKGZhYihwYXJzZWRWYWx1ZSkpKTtcbiAgICAgICAgfSxcbiAgICAgICAgYW5kVGhlbihweCkge1xuICAgICAgICAgICAgcmV0dXJuIGFuZFRoZW4odGhpcywgcHgpO1xuICAgICAgICB9LFxuICAgICAgICBvckVsc2UocHgpIHtcbiAgICAgICAgICAgIHJldHVybiBvckVsc2UodGhpcywgcHgpO1xuICAgICAgICB9LFxuICAgICAgICBkaXNjYXJkRmlyc3QocHgpIHtcbiAgICAgICAgICAgIHJldHVybiBkaXNjYXJkRmlyc3QodGhpcywgcHgpO1xuICAgICAgICB9LFxuICAgICAgICBkaXNjYXJkU2Vjb25kKHB4KSB7XG4gICAgICAgICAgICByZXR1cm4gZGlzY2FyZFNlY29uZCh0aGlzLCBweCk7XG4gICAgICAgIH0sXG4gICAgICAgIGJpbmQoZmFtYikge1xuICAgICAgICAgICAgcmV0dXJuIGJpbmRQKGZhbWIsIHRoaXMpO1xuICAgICAgICB9LFxuICAgICAgICBzZXRMYWJlbChuZXdMYWJlbCkge1xuICAgICAgICAgICAgcmV0dXJuIF9zZXRMYWJlbCh0aGlzLCBuZXdMYWJlbCk7XG4gICAgICAgIH1cbiAgICB9O1xufVxuIl19