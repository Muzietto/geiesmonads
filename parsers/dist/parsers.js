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
            if ('' === str) return _validation.Validation.Failure((0, _classes.Pair)('charParser', 'no more input'));
            if ((0, _util.head)(str) === char) return _validation.Validation.Success((0, _classes.Pair)(char, (0, _util.tail)(str)));
            return _validation.Validation.Failure((0, _classes.Pair)('charParser', 'wanted ' + char + '; got ' + (0, _util.head)(str)));
        };
    }; // Just or Nothing


    var digitParser = function digitParser(digit) {
        return function (str) {
            if ('' === str) return _validation.Validation.Failure((0, _classes.Pair)('digitParser', 'no more input'));
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2pzL3BhcnNlcnMuanMiXSwibmFtZXMiOlsicGNoYXIiLCJwZGlnaXQiLCJhbmRUaGVuQkJCIiwiY2hvaWNlIiwiYW55T2YiLCJmbWFwIiwicmV0dXJuUCIsImFwcGx5UHgiLCJhcHBseVAiLCJsaWZ0MiIsInNlcXVlbmNlUCIsInNlcXVlbmNlUDIiLCJwc3RyaW5nIiwiemVyb09yTW9yZSIsIm1hbnkiLCJtYW55MSIsIm9wdCIsIm9wdEJvb2siLCJiZXR3ZWVuIiwiYmV0d2VlblBhcmVucyIsImJpbmRQIiwicGFyc2VyIiwiY2hhclBhcnNlciIsInN0ciIsIkZhaWx1cmUiLCJjaGFyIiwiU3VjY2VzcyIsImRpZ2l0UGFyc2VyIiwicGFyc2VJbnQiLCJkaWdpdCIsImxhYmVsIiwicmVzdWx0Iiwic2V0TGFiZWwiLCJhbmRUaGVuIiwicDEiLCJwMiIsInJlczEiLCJydW4iLCJpc1N1Y2Nlc3MiLCJyZXMyIiwidmFsdWUiLCJiaW5kIiwicGFyc2VkVmFsdWUxIiwicGFyc2VkVmFsdWUyIiwib3JFbHNlIiwiX2ZhaWwiLCJfc3VjY2VlZCIsInBhcnNlcnMiLCJyZWR1Y2VSaWdodCIsInJlc3QiLCJjdXJyIiwicmVkdWNlIiwiYWNjIiwiY2hhcnMiLCJtYXAiLCJmYWIiLCJwYXJzZXIxIiwidG9TdHJpbmciLCJyZXMiLCJmUCIsInhQIiwicGFpcmZ4IiwicGFyc2VkVmFsdWVmIiwicGFyc2VkVmFsdWV4IiwiZmFhYiIsInBhcnNlcjIiLCJhcHBseSIsIl9jb25zIiwicGFpciIsInNwbGl0IiwiaXNGYWlsdXJlIiwicmVzTiIsImNvbmNhdCIsIkp1c3QiLCJ4IiwiTm90aGluZyIsInBYIiwic29tZVAiLCJub25lUCIsImRpc2NhcmRTZWNvbmQiLCJkaXNjYXJkRmlyc3QiLCJwMyIsInB4IiwiZmFtYiIsInhzIiwiX3NldExhYmVsIiwibmV3TGFiZWwiLCJmbiIsInR5cGUiLCJwYXJzZWRWYWx1ZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7OztZQTJCZ0JBLEssR0FB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LCJmaWxlIjoicGFyc2Vycy5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vIGNmci4gXCJVbmRlcnN0YW5kaW5nIFBhcnNlciBDb21iaW5hdG9yc1wiIChGIyBmb3IgRnVuIGFuZCBQcm9maXQpXG5cbmltcG9ydCB7XG4gICAgaGVhZCxcbiAgICB0YWlsLFxufSBmcm9tICd1dGlsJztcbmltcG9ydCB7XG4gICAgUGFpcixcbiAgICBQb3NpdGlvbixcbn0gZnJvbSAnY2xhc3Nlcyc7XG5pbXBvcnQge01heWJlfSBmcm9tICdtYXliZSc7IC8vIEp1c3Qgb3IgTm90aGluZ1xuaW1wb3J0IHtWYWxpZGF0aW9ufSBmcm9tICd2YWxpZGF0aW9uJzsgLy8gU3VjY2VzcyBvciBGYWlsdXJlXG5cbmNvbnN0IGNoYXJQYXJzZXIgPSBjaGFyID0+IHN0ciA9PiB7XG4gICAgaWYgKCcnID09PSBzdHIpIHJldHVybiBWYWxpZGF0aW9uLkZhaWx1cmUoUGFpcignY2hhclBhcnNlcicsICdubyBtb3JlIGlucHV0JykpO1xuICAgIGlmIChoZWFkKHN0cikgPT09IGNoYXIpIHJldHVybiBWYWxpZGF0aW9uLlN1Y2Nlc3MoUGFpcihjaGFyLCB0YWlsKHN0cikpKTtcbiAgICByZXR1cm4gVmFsaWRhdGlvbi5GYWlsdXJlKFBhaXIoJ2NoYXJQYXJzZXInLCAnd2FudGVkICcgKyBjaGFyICsgJzsgZ290ICcgKyBoZWFkKHN0cikpKTtcbn07XG5cbmNvbnN0IGRpZ2l0UGFyc2VyID0gZGlnaXQgPT4gc3RyID0+IHtcbiAgICBpZiAoJycgPT09IHN0cikgcmV0dXJuIFZhbGlkYXRpb24uRmFpbHVyZShQYWlyKCdkaWdpdFBhcnNlcicsICdubyBtb3JlIGlucHV0JykpO1xuICAgIGlmIChwYXJzZUludChoZWFkKHN0ciksIDEwKSA9PT0gZGlnaXQpIHJldHVybiBWYWxpZGF0aW9uLlN1Y2Nlc3MoUGFpcihkaWdpdCwgdGFpbChzdHIpKSk7XG4gICAgcmV0dXJuIFZhbGlkYXRpb24uRmFpbHVyZShQYWlyKCdkaWdpdFBhcnNlcicsICd3YW50ZWQgJyArIGRpZ2l0ICsgJzsgZ290ICcgKyBoZWFkKHN0cikpKTtcbn07XG5cbmV4cG9ydCB7Y2hhclBhcnNlciwgZGlnaXRQYXJzZXJ9O1xuXG5leHBvcnQgZnVuY3Rpb24gcGNoYXIoY2hhcikge1xuICAgIGNvbnN0IGxhYmVsID0gJ3BjaGFyXycgKyBjaGFyO1xuICAgIGxldCByZXN1bHQgPSBmdW5jdGlvbiAoc3RyKSB7XG4gICAgICAgIHJldHVybiBjaGFyUGFyc2VyKGNoYXIpKHN0cik7XG4gICAgfTtcbiAgICByZXR1cm4gcGFyc2VyKHJlc3VsdCwgbGFiZWwpLnNldExhYmVsKGxhYmVsKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHBkaWdpdChkaWdpdCkge1xuICAgIHJldHVybiBwYXJzZXIoc3RyID0+IGRpZ2l0UGFyc2VyKGRpZ2l0KShzdHIpLCAncGRpZ2l0XycgKyBkaWdpdCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhbmRUaGVuKHAxLCBwMikge1xuICAgIGNvbnN0IGxhYmVsID0gcDEubGFiZWwgKyAnIGFuZFRoZW4gJyArIHAyLmxhYmVsO1xuICAgIHJldHVybiBwYXJzZXIoZnVuY3Rpb24gKHN0cikge1xuICAgICAgICBsZXQgcmVzMSA9IHAxLnJ1bihzdHIpO1xuICAgICAgICBpZiAocmVzMS5pc1N1Y2Nlc3MpIHtcbiAgICAgICAgICAgIGxldCByZXMyID0gcDIucnVuKHJlczEudmFsdWVbMV0pO1xuICAgICAgICAgICAgaWYgKHJlczIuaXNTdWNjZXNzKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFZhbGlkYXRpb24uU3VjY2VzcyhQYWlyKFBhaXIocmVzMS52YWx1ZVswXSwgcmVzMi52YWx1ZVswXSksIHJlczIudmFsdWVbMV0pKTtcbiAgICAgICAgICAgIH0gZWxzZSByZXR1cm4gVmFsaWRhdGlvbi5GYWlsdXJlKFBhaXIobGFiZWwsIHJlczIudmFsdWVbMV0pKTtcbiAgICAgICAgfSBlbHNlIHJldHVybiBWYWxpZGF0aW9uLkZhaWx1cmUoUGFpcihsYWJlbCwgcmVzMS52YWx1ZVsxXSkpO1xuICAgIH0sIGxhYmVsKTtcbn1cblxuLy8gdXNpbmcgYmluZCAtIFRPRE86IG1ha2UgaXQgd29ya1xuZXhwb3J0IGZ1bmN0aW9uIGFuZFRoZW5CQkIocDEsIHAyKSB7XG4gICAgcmV0dXJuIHAxLmJpbmQocGFyc2VkVmFsdWUxID0+IHtcbiAgICAgICAgcmV0dXJuIHAyLmJpbmQocGFyc2VkVmFsdWUyID0+IHtcbiAgICAgICAgICAgIHJldHVybiByZXR1cm5QKFBhaXIocGFyc2VkVmFsdWUxLCBwYXJzZWRWYWx1ZTIpKTtcbiAgICAgICAgfSk7XG4gICAgfSkuc2V0TGFiZWwocDEubGFiZWwgKyAnIGFuZFRoZW4gJyArIHAyLmxhYmVsKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG9yRWxzZShwMSwgcDIpIHtcbiAgICBjb25zdCBsYWJlbCA9IHAxLmxhYmVsICsgJyBvckVsc2UgJyArIHAyLmxhYmVsO1xuICAgIHJldHVybiBwYXJzZXIoc3RyID0+IHtcbiAgICAgICAgY29uc3QgcmVzMSA9IHAxLnJ1bihzdHIpO1xuICAgICAgICBpZiAocmVzMS5pc1N1Y2Nlc3MpIHJldHVybiByZXMxO1xuICAgICAgICBjb25zdCByZXMyID0gcDIucnVuKHN0cik7XG4gICAgICAgIGlmIChyZXMyLmlzU3VjY2VzcykgcmV0dXJuIHJlczI7XG4gICAgICAgIHJldHVybiBWYWxpZGF0aW9uLkZhaWx1cmUoUGFpcihsYWJlbCwgcmVzMi52YWx1ZVsxXSkpO1xuICAgIH0sIGxhYmVsKS5zZXRMYWJlbChsYWJlbCk7XG59XG5cbmxldCBfZmFpbCA9IHBhcnNlcihzdHIgPT4gVmFsaWRhdGlvbi5GYWlsdXJlKFBhaXIoUGFpcigncGFyc2luZyBmYWlsZWQnLCAnX2ZhaWwnKSwgJ19mYWlsJykpKTtcblxuLy8gcmV0dXJuIG5ldXRyYWwgZWxlbWVudCBpbnN0ZWFkIG9mIG1lc3NhZ2VcbmxldCBfc3VjY2VlZCA9IHBhcnNlcihzdHIgPT4gVmFsaWRhdGlvbi5TdWNjZXNzKFBhaXIoUGFpcigncGFyc2luZyBzdWNjZWVkZWQnLCBzdHIpLCAnX3N1Y2NlZWQnKSkpO1xuXG5leHBvcnQgZnVuY3Rpb24gY2hvaWNlKHBhcnNlcnMpIHtcbiAgICByZXR1cm4gcGFyc2Vycy5yZWR1Y2VSaWdodCgocmVzdCwgY3VycikgPT4gb3JFbHNlKGN1cnIsIHJlc3QpLCBfZmFpbClcbiAgICAgICAgLnNldExhYmVsKCdjaG9pY2UgJyArIHBhcnNlcnMucmVkdWNlKChhY2MsIGN1cnIpID0+IGFjYyArICcvJyArIGN1cnIubGFiZWwsICcnKSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhbnlPZihjaGFycykge1xuICAgIHJldHVybiBjaG9pY2UoY2hhcnMubWFwKHBjaGFyKSlcbiAgICAgICAgLnNldExhYmVsKCdhbnlPZiAnICsgY2hhcnMucmVkdWNlKChhY2MsIGN1cnIpID0+IGFjYyArIGN1cnIsICcnKSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBmbWFwKGZhYiwgcGFyc2VyMSkge1xuICAgIGNvbnN0IGxhYmVsID0gcGFyc2VyMS5sYWJlbCArICcgZm1hcCAnICsgZmFiLnRvU3RyaW5nKCk7XG4gICAgcmV0dXJuIHBhcnNlcihzdHIgPT4ge1xuICAgICAgICBsZXQgcmVzID0gcGFyc2VyMS5ydW4oc3RyKTtcbiAgICAgICAgaWYgKHJlcy5pc1N1Y2Nlc3MpIHJldHVybiBWYWxpZGF0aW9uLlN1Y2Nlc3MoUGFpcihmYWIocmVzLnZhbHVlWzBdKSwgcmVzLnZhbHVlWzFdKSk7XG4gICAgICAgIHJldHVybiBWYWxpZGF0aW9uLkZhaWx1cmUoUGFpcihsYWJlbCwgcmVzLnZhbHVlWzFdKSk7XG4gICAgfSwgbGFiZWwpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcmV0dXJuUCh2YWx1ZSkge1xuICAgIHJldHVybiBwYXJzZXIoc3RyID0+IFZhbGlkYXRpb24uU3VjY2VzcyhQYWlyKHZhbHVlLCBzdHIpKSwgdmFsdWUpO1xufVxuXG4vLyBwYXJzZXIoYSAtPiBiKSAtPiBwYXJzZXIoYSkgLT4gcGFyc2VyKGIpXG5leHBvcnQgZnVuY3Rpb24gYXBwbHlQeChmUCkge1xuICAgIHJldHVybiBmdW5jdGlvbiAoeFApIHtcbiAgICAgICAgcmV0dXJuIGFuZFRoZW4oZlAsIHhQKS5mbWFwKHBhaXJmeCA9PiBwYWlyZnhbMF0ocGFpcmZ4WzFdKSk7XG4gICAgfTtcbn1cblxuLy8gdXNpbmcgYmluZFxuZXhwb3J0IGZ1bmN0aW9uIGFwcGx5UChmUCkge1xuICAgIHJldHVybiBmdW5jdGlvbiAoeFApIHtcbiAgICAgICAgcmV0dXJuIGZQLmJpbmQocGFyc2VkVmFsdWVmID0+IHtcbiAgICAgICAgICAgIHJldHVybiB4UC5iaW5kKHBhcnNlZFZhbHVleCA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJldHVyblAocGFyc2VkVmFsdWVmKHBhcnNlZFZhbHVleCkpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBsaWZ0MihmYWFiKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uIChwYXJzZXIxKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAocGFyc2VyMikge1xuICAgICAgICAgICAgLy9yZXR1cm4gYXBwbHlQKGFwcGx5UChyZXR1cm5QKGZhYWIpKShwYXJzZXIxKSkocGFyc2VyMik7XG4gICAgICAgICAgICByZXR1cm4gcmV0dXJuUChmYWFiKS5hcHBseShwYXJzZXIxKS5hcHBseShwYXJzZXIyKTsgLy8gdXNpbmcgaW5zdGFuY2UgbWV0aG9kc1xuICAgICAgICB9O1xuICAgIH07XG59XG5cbi8vIHVzaW5nIGxpZnQyKGNvbnMpXG5leHBvcnQgZnVuY3Rpb24gc2VxdWVuY2VQKHBhcnNlcnMpIHtcbiAgICByZXR1cm4gcGFyc2Vyc1xuICAgICAgICAucmVkdWNlUmlnaHQoKHJlc3QsIGN1cnIpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBsaWZ0MihfY29ucykoY3VycikocmVzdCk7XG4gICAgICAgIH0sIHJldHVyblAoW10pKTtcbn1cblxuLy8gdXNpbmcgbmFpdmUgYW5kVGhlbiAmJiBmbWFwIC0tPiByZXR1cm5zIHN0cmluZ3MsIG5vdCBhcnJheXMhXG5leHBvcnQgZnVuY3Rpb24gc2VxdWVuY2VQMihwYXJzZXJzKSB7XG4gICAgcmV0dXJuIHBhcnNlcnNcbiAgICAgICAgLnJlZHVjZVJpZ2h0KChyZXN0LCBjdXJyKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gZm1hcChwYWlyID0+IHBhaXJbMF0gKyBwYWlyWzFdLCBhbmRUaGVuKGN1cnIsIHJlc3QpKTtcbiAgICAgICAgfSwgcmV0dXJuUCgnJykpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcHN0cmluZyhzdHIpIHtcbiAgICByZXR1cm4gc2VxdWVuY2VQKHN0ci5zcGxpdCgnJykubWFwKHBjaGFyKSlcbiAgICAgICAgLnNldExhYmVsKCdwc3RyaW5nICcgKyBzdHIpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gemVyb09yTW9yZSh4UCkgeyAvLyB6ZXJvT3JNb3JlIDo6IHAgYSAtPiBbYV0gLT4gdHJ5IFthXSA9IHAgYSAtPiBwIFthXVxuICAgIHJldHVybiBzdHIgPT4ge1xuICAgICAgICBsZXQgcmVzMSA9IHhQLnJ1bihzdHIpO1xuICAgICAgICBpZiAocmVzMS5pc0ZhaWx1cmUpIHJldHVybiBWYWxpZGF0aW9uLlN1Y2Nlc3MoUGFpcihbXSwgc3RyKSk7XG4gICAgICAgIGxldCByZXNOID0gemVyb09yTW9yZSh4UCkocmVzMS52YWx1ZVsxXSk7XG4gICAgICAgIHJldHVybiBWYWxpZGF0aW9uLlN1Y2Nlc3MoUGFpcihbcmVzMS52YWx1ZVswXV0uY29uY2F0KHJlc04udmFsdWVbMF0pLCByZXNOLnZhbHVlWzFdKSk7XG4gICAgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1hbnkoeFApIHtcbiAgICBjb25zdCBsYWJlbCA9ICdtYW55ICcgKyB4UC5sYWJlbDtcbiAgICByZXR1cm4gcGFyc2VyKHN0ciA9PiB7XG4gICAgICAgIHJldHVybiB6ZXJvT3JNb3JlKHhQKShzdHIpO1xuICAgIH0sIGxhYmVsKS5zZXRMYWJlbChsYWJlbCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtYW55MSh4UCkge1xuICAgIGNvbnN0IGxhYmVsID0gJ21hbnkxICcgKyB4UC5sYWJlbDtcbiAgICByZXR1cm4gcGFyc2VyKHN0ciA9PiB7XG4gICAgICAgIGxldCByZXMxID0geFAucnVuKHN0cik7XG4gICAgICAgIGlmIChyZXMxLmlzRmFpbHVyZSkgcmV0dXJuIHJlczE7XG4gICAgICAgIGxldCByZXNOID0gemVyb09yTW9yZSh4UCkocmVzMS52YWx1ZVsxXSk7XG4gICAgICAgIHJldHVybiBWYWxpZGF0aW9uLlN1Y2Nlc3MoUGFpcihbcmVzMS52YWx1ZVswXV0uY29uY2F0KHJlc04udmFsdWVbMF0pLCByZXNOLnZhbHVlWzFdKSk7XG4gICAgfSwgbGFiZWwpLnNldExhYmVsKGxhYmVsKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG9wdCh4UCkge1xuICAgIGNvbnN0IGxhYmVsID0gJ29wdCAnICsgeFAubGFiZWw7XG4gICAgcmV0dXJuIHBhcnNlcihzdHIgPT4ge1xuICAgICAgICBsZXQgcmVzID0geFAuZm1hcCh4ID0+IE1heWJlLkp1c3QoeCkpLnJ1bihzdHIpO1xuICAgICAgICBpZiAocmVzLmlzU3VjY2VzcykgcmV0dXJuIHJlcztcbiAgICAgICAgcmV0dXJuIFZhbGlkYXRpb24uU3VjY2VzcyhQYWlyKE1heWJlLk5vdGhpbmcoKSwgc3RyKSk7XG4gICAgfSwgbGFiZWwpLnNldExhYmVsKGxhYmVsKTtcbn1cblxuLy8gb3B0IGZyb20gdGhlIGJvb2sgLSB3b3JrcyBvaywgYnV0IHRvU3RyaW5nKCkgZ2l2ZXMgc3RyYW5nZSByZXN1bHRzXG5leHBvcnQgZnVuY3Rpb24gb3B0Qm9vayhwWCkge1xuICAgIGNvbnN0IHNvbWVQID0gcFguZm1hcChNYXliZS5KdXN0KTtcbiAgICBjb25zdCBub25lUCA9IHJldHVyblAoTWF5YmUuTm90aGluZyk7XG4gICAgcmV0dXJuIHNvbWVQLm9yRWxzZShub25lUCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBkaXNjYXJkU2Vjb25kKHAxLCBwMikge1xuICAgIGNvbnN0IGxhYmVsID0gcDEubGFiZWwgKyAnIGRpc2NhcmRTZWNvbmQgJyArIHAyLmxhYmVsO1xuICAgIHJldHVybiBwYXJzZXIoc3RyID0+IHtcbiAgICAgICAgcmV0dXJuIGFuZFRoZW4ocDEsIHAyKS5mbWFwKHBhaXIgPT4gcGFpclswXSkucnVuKHN0cik7XG4gICAgfSwgbGFiZWwpLnNldExhYmVsKGxhYmVsKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRpc2NhcmRGaXJzdChwMSwgcDIpIHtcbiAgICBjb25zdCBsYWJlbCA9IHAxLmxhYmVsICsgJyBkaXNjYXJkRmlyc3QgJyArIHAyLmxhYmVsO1xuICAgIHJldHVybiBwYXJzZXIoc3RyID0+IHtcbiAgICAgICAgcmV0dXJuIGFuZFRoZW4ocDEsIHAyKS5mbWFwKHBhaXIgPT4gcGFpclsxXSkucnVuKHN0cik7XG4gICAgfSwgbGFiZWwpLnNldExhYmVsKGxhYmVsKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGJldHdlZW4ocDEsIHAyLCBwMykge1xuICAgIHJldHVybiBwMS5kaXNjYXJkRmlyc3QocDIpLmRpc2NhcmRTZWNvbmQocDMpXG4gICAgICAgIC5zZXRMYWJlbCgnYmV0d2VlbiAnICsgcDEubGFiZWwgKyAnLycgKyBwMi5sYWJlbCArICcvJyArIHAzLmxhYmVsKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGJldHdlZW5QYXJlbnMocHgpIHtcbiAgICByZXR1cm4gYmV0d2VlbihwY2hhcignKCcpLCBweCwgcGNoYXIoJyknKSlcbiAgICAgICAgLnNldExhYmVsKCdiZXR3ZWVuUGFyZW5zICcgKyBweC5sYWJlbCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBiaW5kUChmYW1iLCBweCkge1xuICAgIGxldCBsYWJlbCA9ICd1bmtub3duJztcbiAgICByZXR1cm4gcGFyc2VyKHN0ciA9PiB7XG4gICAgICAgIGNvbnN0IHJlcyA9IHB4LnJ1bihzdHIpO1xuICAgICAgICBpZiAocmVzLmlzRmFpbHVyZSkgcmV0dXJuIHJlcztcbiAgICAgICAgcmV0dXJuIGZhbWIocmVzLnZhbHVlWzBdKS5ydW4ocmVzLnZhbHVlWzFdKTtcbiAgICB9LCBsYWJlbCkuc2V0TGFiZWwobGFiZWwpO1xufVxuXG5mdW5jdGlvbiBfY29ucyh4KSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uICh4cykge1xuICAgICAgICByZXR1cm4gW3hdLmNvbmNhdCh4cyk7XG4gICAgfTtcbn1cblxuZnVuY3Rpb24gX3NldExhYmVsKHB4LCBuZXdMYWJlbCkge1xuICAgIHJldHVybiBwYXJzZXIoc3RyID0+IHtcbiAgICAgICAgbGV0IHJlc3VsdCA9IHB4LnJ1bihzdHIpO1xuICAgICAgICBpZiAocmVzdWx0LmlzRmFpbHVyZSkgcmV0dXJuIFZhbGlkYXRpb24uRmFpbHVyZShQYWlyKG5ld0xhYmVsLCByZXN1bHQudmFsdWVbMV0pKTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LCBuZXdMYWJlbCk7XG59XG5cbi8vIHRoZSByZWFsIHRoaW5nLi4uXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VyKGZuLCBsYWJlbCkge1xuICAgIHJldHVybiB7XG4gICAgICAgIHR5cGU6ICdwYXJzZXInLFxuICAgICAgICBsYWJlbDogbGFiZWwsXG4gICAgICAgIHJ1bihzdHIpIHtcbiAgICAgICAgICAgIHJldHVybiBmbihzdHIpO1xuICAgICAgICB9LFxuICAgICAgICBhcHBseShweCkge1xuICAgICAgICAgICAgcmV0dXJuIGFwcGx5UCh0aGlzKShweCk7XG4gICAgICAgICAgICAvL3JldHVybiB0aGlzLmJpbmQoYW5kVGhlbih0aGlzLCBweCkuZm1hcCgoW2YsIHhdKSA9PiBmKHgpKSkucnVuOyAvLyB3ZSBhcmUgdGhlIGZQXG4gICAgICAgIH0sXG4gICAgICAgIGZtYXAoZmFiKSB7XG4gICAgICAgICAgICAvL3JldHVybiBmbWFwKGZhYiwgdGhpcyk7XG4gICAgICAgICAgICAvL3JldHVybiBiaW5kUChzdHIgPT4gcmV0dXJuUChmYWIoc3RyKSksIHRoaXMpO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuYmluZChwYXJzZWRWYWx1ZSA9PiByZXR1cm5QKGZhYihwYXJzZWRWYWx1ZSkpKTtcbiAgICAgICAgfSxcbiAgICAgICAgYW5kVGhlbihweCkge1xuICAgICAgICAgICAgcmV0dXJuIGFuZFRoZW4odGhpcywgcHgpO1xuICAgICAgICB9LFxuICAgICAgICBvckVsc2UocHgpIHtcbiAgICAgICAgICAgIHJldHVybiBvckVsc2UodGhpcywgcHgpO1xuICAgICAgICB9LFxuICAgICAgICBkaXNjYXJkRmlyc3QocHgpIHtcbiAgICAgICAgICAgIHJldHVybiBkaXNjYXJkRmlyc3QodGhpcywgcHgpO1xuICAgICAgICB9LFxuICAgICAgICBkaXNjYXJkU2Vjb25kKHB4KSB7XG4gICAgICAgICAgICByZXR1cm4gZGlzY2FyZFNlY29uZCh0aGlzLCBweCk7XG4gICAgICAgIH0sXG4gICAgICAgIGJpbmQoZmFtYikge1xuICAgICAgICAgICAgcmV0dXJuIGJpbmRQKGZhbWIsIHRoaXMpO1xuICAgICAgICB9LFxuICAgICAgICBzZXRMYWJlbChuZXdMYWJlbCkge1xuICAgICAgICAgICAgcmV0dXJuIF9zZXRMYWJlbCh0aGlzLCBuZXdMYWJlbCk7XG4gICAgICAgIH1cbiAgICB9O1xufVxuIl19