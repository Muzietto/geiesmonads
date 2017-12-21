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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2pzL3BhcnNlcnMuanMiXSwibmFtZXMiOlsicGNoYXIiLCJwZGlnaXQiLCJhbmRUaGVuQkJCIiwiY2hvaWNlIiwiYW55T2YiLCJmbWFwIiwicmV0dXJuUCIsImFwcGx5UHgiLCJhcHBseVAiLCJsaWZ0MiIsInNlcXVlbmNlUCIsInNlcXVlbmNlUDIiLCJwc3RyaW5nIiwiemVyb09yTW9yZSIsIm1hbnkiLCJtYW55MSIsIm9wdCIsIm9wdEJvb2siLCJiZXR3ZWVuIiwiYmV0d2VlblBhcmVucyIsImJpbmRQIiwicGFyc2VyIiwiY2hhclBhcnNlciIsInN0ciIsIkZhaWx1cmUiLCJjaGFyIiwiU3VjY2VzcyIsImRpZ2l0UGFyc2VyIiwicGFyc2VJbnQiLCJkaWdpdCIsImxhYmVsIiwicmVzdWx0Iiwic2V0TGFiZWwiLCJhbmRUaGVuIiwicDEiLCJwMiIsInJlczEiLCJydW4iLCJpc1N1Y2Nlc3MiLCJyZXMyIiwidmFsdWUiLCJiaW5kIiwicGFyc2VkVmFsdWUxIiwicGFyc2VkVmFsdWUyIiwib3JFbHNlIiwiX2ZhaWwiLCJfc3VjY2VlZCIsInBhcnNlcnMiLCJyZWR1Y2VSaWdodCIsInJlc3QiLCJjdXJyIiwicmVkdWNlIiwiYWNjIiwiY2hhcnMiLCJtYXAiLCJmYWIiLCJwYXJzZXIxIiwidG9TdHJpbmciLCJyZXMiLCJmUCIsInhQIiwicGFpcmZ4IiwicGFyc2VkVmFsdWVmIiwicGFyc2VkVmFsdWV4IiwiZmFhYiIsInBhcnNlcjIiLCJhcHBseSIsIl9jb25zIiwicGFpciIsInNwbGl0IiwiaXNGYWlsdXJlIiwicmVzTiIsImNvbmNhdCIsIkp1c3QiLCJ4IiwiTm90aGluZyIsInBYIiwic29tZVAiLCJub25lUCIsImRpc2NhcmRTZWNvbmQiLCJkaXNjYXJkRmlyc3QiLCJwMyIsInB4IiwiZmFtYiIsInhzIiwiX3NldExhYmVsIiwibmV3TGFiZWwiLCJmbiIsInR5cGUiLCJwYXJzZWRWYWx1ZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7OztZQWlDZ0JBLEssR0FB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SCIsImZpbGUiOiJwYXJzZXJzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8gY2ZyLiBcIlVuZGVyc3RhbmRpbmcgUGFyc2VyIENvbWJpbmF0b3JzXCIgKEYjIGZvciBGdW4gYW5kIFByb2ZpdClcblxuaW1wb3J0IHtcbiAgICBoZWFkLFxuICAgIHRhaWwsXG4gICAgaXNTdWNjZXNzLFxuICAgIGlzRmFpbHVyZSxcbn0gZnJvbSAndXRpbCc7XG5pbXBvcnQge1xuICAgIHBhaXIsXG4gICAgc3VjY2VzcyxcbiAgICBmYWlsdXJlLFxuICAgIHNvbWUsXG4gICAgbm9uZSxcbiAgICBQYWlyLFxufSBmcm9tICdjbGFzc2VzJztcbmltcG9ydCB7TWF5YmV9IGZyb20gJ21heWJlJzsgLy8gSnVzdCBvciBOb3RoaW5nXG5pbXBvcnQge1ZhbGlkYXRpb259IGZyb20gJ3ZhbGlkYXRpb24nOyAvLyBTdWNjZXNzIG9yIEZhaWx1cmVcblxuY29uc3QgY2hhclBhcnNlciA9IGNoYXIgPT4gc3RyID0+IHtcbiAgICBpZiAoJycgPT09IHN0cikgcmV0dXJuIFZhbGlkYXRpb24uRmFpbHVyZShQYWlyKCdjaGFyUGFyc2VyJywgJ25vIG1vcmUgaW5wdXQnKSk7XG4gICAgaWYgKGhlYWQoc3RyKSA9PT0gY2hhcikgcmV0dXJuIFZhbGlkYXRpb24uU3VjY2VzcyhQYWlyKGNoYXIsIHRhaWwoc3RyKSkpO1xuICAgIHJldHVybiBWYWxpZGF0aW9uLkZhaWx1cmUoUGFpcignY2hhclBhcnNlcicsICd3YW50ZWQgJyArIGNoYXIgKyAnOyBnb3QgJyArIGhlYWQoc3RyKSkpO1xufTtcblxuY29uc3QgZGlnaXRQYXJzZXIgPSBkaWdpdCA9PiBzdHIgPT4ge1xuICAgIGlmICgnJyA9PT0gc3RyKSByZXR1cm4gVmFsaWRhdGlvbi5GYWlsdXJlKFBhaXIoJ2RpZ2l0UGFyc2VyJywgJ25vIG1vcmUgaW5wdXQnKSk7XG4gICAgaWYgKHBhcnNlSW50KGhlYWQoc3RyKSwgMTApID09PSBkaWdpdCkgcmV0dXJuIFZhbGlkYXRpb24uU3VjY2VzcyhQYWlyKGRpZ2l0LCB0YWlsKHN0cikpKTtcbiAgICByZXR1cm4gVmFsaWRhdGlvbi5GYWlsdXJlKFBhaXIoJ2RpZ2l0UGFyc2VyJywgJ3dhbnRlZCAnICsgZGlnaXQgKyAnOyBnb3QgJyArIGhlYWQoc3RyKSkpO1xufTtcblxuZXhwb3J0IHtjaGFyUGFyc2VyLCBkaWdpdFBhcnNlcn07XG5cbmV4cG9ydCBmdW5jdGlvbiBwY2hhcihjaGFyKSB7XG4gICAgY29uc3QgbGFiZWwgPSAncGNoYXJfJyArIGNoYXI7XG4gICAgbGV0IHJlc3VsdCA9IGZ1bmN0aW9uIChzdHIpIHtcbiAgICAgICAgcmV0dXJuIGNoYXJQYXJzZXIoY2hhcikoc3RyKTtcbiAgICB9O1xuICAgIHJldHVybiBwYXJzZXIocmVzdWx0LCBsYWJlbCkuc2V0TGFiZWwobGFiZWwpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcGRpZ2l0KGRpZ2l0KSB7XG4gICAgcmV0dXJuIHBhcnNlcihzdHIgPT4gZGlnaXRQYXJzZXIoZGlnaXQpKHN0ciksICdwZGlnaXRfJyArIGRpZ2l0KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGFuZFRoZW4ocDEsIHAyKSB7XG4gICAgY29uc3QgbGFiZWwgPSBwMS5sYWJlbCArICcgYW5kVGhlbiAnICsgcDIubGFiZWw7XG4gICAgcmV0dXJuIHBhcnNlcihmdW5jdGlvbiAoc3RyKSB7XG4gICAgICAgIGxldCByZXMxID0gcDEucnVuKHN0cik7XG4gICAgICAgIGlmIChyZXMxLmlzU3VjY2Vzcykge1xuICAgICAgICAgICAgbGV0IHJlczIgPSBwMi5ydW4ocmVzMS52YWx1ZVsxXSk7XG4gICAgICAgICAgICBpZiAocmVzMi5pc1N1Y2Nlc3MpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gVmFsaWRhdGlvbi5TdWNjZXNzKFBhaXIoUGFpcihyZXMxLnZhbHVlWzBdLCByZXMyLnZhbHVlWzBdKSwgcmVzMi52YWx1ZVsxXSkpO1xuICAgICAgICAgICAgfSBlbHNlIHJldHVybiBWYWxpZGF0aW9uLkZhaWx1cmUoUGFpcihsYWJlbCwgcmVzMi52YWx1ZVsxXSkpO1xuICAgICAgICB9IGVsc2UgcmV0dXJuIFZhbGlkYXRpb24uRmFpbHVyZShQYWlyKGxhYmVsLCByZXMxLnZhbHVlWzFdKSk7XG4gICAgfSwgbGFiZWwpO1xufVxuXG4vLyB1c2luZyBiaW5kIC0gVE9ETzogbWFrZSBpdCB3b3JrXG5leHBvcnQgZnVuY3Rpb24gYW5kVGhlbkJCQihwMSwgcDIpIHtcbiAgICByZXR1cm4gcDEuYmluZChwYXJzZWRWYWx1ZTEgPT4ge1xuICAgICAgICByZXR1cm4gcDIuYmluZChwYXJzZWRWYWx1ZTIgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHJldHVyblAoUGFpcihwYXJzZWRWYWx1ZTEsIHBhcnNlZFZhbHVlMikpO1xuICAgICAgICB9KTtcbiAgICB9KS5zZXRMYWJlbChwMS5sYWJlbCArICcgYW5kVGhlbiAnICsgcDIubGFiZWwpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gb3JFbHNlKHAxLCBwMikge1xuICAgIGNvbnN0IGxhYmVsID0gcDEubGFiZWwgKyAnIG9yRWxzZSAnICsgcDIubGFiZWw7XG4gICAgcmV0dXJuIHBhcnNlcihzdHIgPT4ge1xuICAgICAgICBjb25zdCByZXMxID0gcDEucnVuKHN0cik7XG4gICAgICAgIGlmIChyZXMxLmlzU3VjY2VzcykgcmV0dXJuIHJlczE7XG4gICAgICAgIGNvbnN0IHJlczIgPSBwMi5ydW4oc3RyKTtcbiAgICAgICAgaWYgKHJlczIuaXNTdWNjZXNzKSByZXR1cm4gcmVzMjtcbiAgICAgICAgcmV0dXJuIFZhbGlkYXRpb24uRmFpbHVyZShQYWlyKGxhYmVsLCByZXMyLnZhbHVlWzFdKSk7XG4gICAgfSwgbGFiZWwpLnNldExhYmVsKGxhYmVsKTtcbn1cblxubGV0IF9mYWlsID0gcGFyc2VyKHN0ciA9PiBWYWxpZGF0aW9uLkZhaWx1cmUoUGFpcihQYWlyKCdwYXJzaW5nIGZhaWxlZCcsICdfZmFpbCcpLCAnX2ZhaWwnKSkpO1xuXG4vLyByZXR1cm4gbmV1dHJhbCBlbGVtZW50IGluc3RlYWQgb2YgbWVzc2FnZVxubGV0IF9zdWNjZWVkID0gcGFyc2VyKHN0ciA9PiBWYWxpZGF0aW9uLlN1Y2Nlc3MoUGFpcihQYWlyKCdwYXJzaW5nIHN1Y2NlZWRlZCcsIHN0ciksICdfc3VjY2VlZCcpKSk7XG5cbmV4cG9ydCBmdW5jdGlvbiBjaG9pY2UocGFyc2Vycykge1xuICAgIHJldHVybiBwYXJzZXJzLnJlZHVjZVJpZ2h0KChyZXN0LCBjdXJyKSA9PiBvckVsc2UoY3VyciwgcmVzdCksIF9mYWlsKVxuICAgICAgICAuc2V0TGFiZWwoJ2Nob2ljZSAnICsgcGFyc2Vycy5yZWR1Y2UoKGFjYywgY3VycikgPT4gYWNjICsgJy8nICsgY3Vyci5sYWJlbCwgJycpKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGFueU9mKGNoYXJzKSB7XG4gICAgcmV0dXJuIGNob2ljZShjaGFycy5tYXAocGNoYXIpKVxuICAgICAgICAuc2V0TGFiZWwoJ2FueU9mICcgKyBjaGFycy5yZWR1Y2UoKGFjYywgY3VycikgPT4gYWNjICsgY3VyciwgJycpKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGZtYXAoZmFiLCBwYXJzZXIxKSB7XG4gICAgY29uc3QgbGFiZWwgPSBwYXJzZXIxLmxhYmVsICsgJyBmbWFwICcgKyBmYWIudG9TdHJpbmcoKTtcbiAgICByZXR1cm4gcGFyc2VyKHN0ciA9PiB7XG4gICAgICAgIGxldCByZXMgPSBwYXJzZXIxLnJ1bihzdHIpO1xuICAgICAgICBpZiAocmVzLmlzU3VjY2VzcykgcmV0dXJuIFZhbGlkYXRpb24uU3VjY2VzcyhQYWlyKGZhYihyZXMudmFsdWVbMF0pLCByZXMudmFsdWVbMV0pKTtcbiAgICAgICAgcmV0dXJuIFZhbGlkYXRpb24uRmFpbHVyZShQYWlyKGxhYmVsLCByZXMudmFsdWVbMV0pKTtcbiAgICB9LCBsYWJlbCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZXR1cm5QKHZhbHVlKSB7XG4gICAgcmV0dXJuIHBhcnNlcihzdHIgPT4gVmFsaWRhdGlvbi5TdWNjZXNzKFBhaXIodmFsdWUsIHN0cikpLCB2YWx1ZSk7XG59XG5cbi8vIHBhcnNlcihhIC0+IGIpIC0+IHBhcnNlcihhKSAtPiBwYXJzZXIoYilcbmV4cG9ydCBmdW5jdGlvbiBhcHBseVB4KGZQKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uICh4UCkge1xuICAgICAgICByZXR1cm4gYW5kVGhlbihmUCwgeFApLmZtYXAocGFpcmZ4ID0+IHBhaXJmeFswXShwYWlyZnhbMV0pKTtcbiAgICB9O1xufVxuXG4vLyB1c2luZyBiaW5kXG5leHBvcnQgZnVuY3Rpb24gYXBwbHlQKGZQKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uICh4UCkge1xuICAgICAgICByZXR1cm4gZlAuYmluZChwYXJzZWRWYWx1ZWYgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHhQLmJpbmQocGFyc2VkVmFsdWV4ID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmV0dXJuUChwYXJzZWRWYWx1ZWYocGFyc2VkVmFsdWV4KSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGxpZnQyKGZhYWIpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKHBhcnNlcjEpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChwYXJzZXIyKSB7XG4gICAgICAgICAgICAvL3JldHVybiBhcHBseVAoYXBwbHlQKHJldHVyblAoZmFhYikpKHBhcnNlcjEpKShwYXJzZXIyKTtcbiAgICAgICAgICAgIHJldHVybiByZXR1cm5QKGZhYWIpLmFwcGx5KHBhcnNlcjEpLmFwcGx5KHBhcnNlcjIpOyAvLyB1c2luZyBpbnN0YW5jZSBtZXRob2RzXG4gICAgICAgIH07XG4gICAgfTtcbn1cblxuLy8gdXNpbmcgbGlmdDIoY29ucylcbmV4cG9ydCBmdW5jdGlvbiBzZXF1ZW5jZVAocGFyc2Vycykge1xuICAgIHJldHVybiBwYXJzZXJzXG4gICAgICAgIC5yZWR1Y2VSaWdodCgocmVzdCwgY3VycikgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIGxpZnQyKF9jb25zKShjdXJyKShyZXN0KTtcbiAgICAgICAgfSwgcmV0dXJuUChbXSkpO1xufVxuXG4vLyB1c2luZyBuYWl2ZSBhbmRUaGVuICYmIGZtYXAgLS0+IHJldHVybnMgc3RyaW5ncywgbm90IGFycmF5cyFcbmV4cG9ydCBmdW5jdGlvbiBzZXF1ZW5jZVAyKHBhcnNlcnMpIHtcbiAgICByZXR1cm4gcGFyc2Vyc1xuICAgICAgICAucmVkdWNlUmlnaHQoKHJlc3QsIGN1cnIpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBmbWFwKHBhaXIgPT4gcGFpclswXSArIHBhaXJbMV0sIGFuZFRoZW4oY3VyciwgcmVzdCkpO1xuICAgICAgICB9LCByZXR1cm5QKCcnKSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwc3RyaW5nKHN0cikge1xuICAgIHJldHVybiBzZXF1ZW5jZVAoc3RyLnNwbGl0KCcnKS5tYXAocGNoYXIpKVxuICAgICAgICAuc2V0TGFiZWwoJ3BzdHJpbmcgJyArIHN0cik7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB6ZXJvT3JNb3JlKHhQKSB7IC8vIHplcm9Pck1vcmUgOjogcCBhIC0+IFthXSAtPiB0cnkgW2FdID0gcCBhIC0+IHAgW2FdXG4gICAgcmV0dXJuIHN0ciA9PiB7XG4gICAgICAgIGxldCByZXMxID0geFAucnVuKHN0cik7XG4gICAgICAgIGlmIChyZXMxLmlzRmFpbHVyZSkgcmV0dXJuIFZhbGlkYXRpb24uU3VjY2VzcyhQYWlyKFtdLCBzdHIpKTtcbiAgICAgICAgbGV0IHJlc04gPSB6ZXJvT3JNb3JlKHhQKShyZXMxLnZhbHVlWzFdKTtcbiAgICAgICAgcmV0dXJuIFZhbGlkYXRpb24uU3VjY2VzcyhQYWlyKFtyZXMxLnZhbHVlWzBdXS5jb25jYXQocmVzTi52YWx1ZVswXSksIHJlc04udmFsdWVbMV0pKTtcbiAgICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbWFueSh4UCkge1xuICAgIGNvbnN0IGxhYmVsID0gJ21hbnkgJyArIHhQLmxhYmVsO1xuICAgIHJldHVybiBwYXJzZXIoc3RyID0+IHtcbiAgICAgICAgcmV0dXJuIHplcm9Pck1vcmUoeFApKHN0cik7XG4gICAgfSwgbGFiZWwpLnNldExhYmVsKGxhYmVsKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1hbnkxKHhQKSB7XG4gICAgY29uc3QgbGFiZWwgPSAnbWFueTEgJyArIHhQLmxhYmVsO1xuICAgIHJldHVybiBwYXJzZXIoc3RyID0+IHtcbiAgICAgICAgbGV0IHJlczEgPSB4UC5ydW4oc3RyKTtcbiAgICAgICAgaWYgKHJlczEuaXNGYWlsdXJlKSByZXR1cm4gcmVzMTtcbiAgICAgICAgbGV0IHJlc04gPSB6ZXJvT3JNb3JlKHhQKShyZXMxLnZhbHVlWzFdKTtcbiAgICAgICAgcmV0dXJuIFZhbGlkYXRpb24uU3VjY2VzcyhQYWlyKFtyZXMxLnZhbHVlWzBdXS5jb25jYXQocmVzTi52YWx1ZVswXSksIHJlc04udmFsdWVbMV0pKTtcbiAgICB9LCBsYWJlbCkuc2V0TGFiZWwobGFiZWwpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gb3B0KHhQKSB7XG4gICAgY29uc3QgbGFiZWwgPSAnb3B0ICcgKyB4UC5sYWJlbDtcbiAgICByZXR1cm4gcGFyc2VyKHN0ciA9PiB7XG4gICAgICAgIGxldCByZXMgPSB4UC5mbWFwKHggPT4gTWF5YmUuSnVzdCh4KSkucnVuKHN0cik7XG4gICAgICAgIGlmIChyZXMuaXNTdWNjZXNzKSByZXR1cm4gcmVzO1xuICAgICAgICByZXR1cm4gVmFsaWRhdGlvbi5TdWNjZXNzKFBhaXIoTWF5YmUuTm90aGluZygpLCBzdHIpKTtcbiAgICB9LCBsYWJlbCkuc2V0TGFiZWwobGFiZWwpO1xufVxuXG4vLyBvcHQgZnJvbSB0aGUgYm9vayAtIHdvcmtzIG9rLCBidXQgdG9TdHJpbmcoKSBnaXZlcyBzdHJhbmdlIHJlc3VsdHNcbmV4cG9ydCBmdW5jdGlvbiBvcHRCb29rKHBYKSB7XG4gICAgY29uc3Qgc29tZVAgPSBwWC5mbWFwKE1heWJlLkp1c3QpO1xuICAgIGNvbnN0IG5vbmVQID0gcmV0dXJuUChNYXliZS5Ob3RoaW5nKTtcbiAgICByZXR1cm4gc29tZVAub3JFbHNlKG5vbmVQKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRpc2NhcmRTZWNvbmQocDEsIHAyKSB7XG4gICAgY29uc3QgbGFiZWwgPSBwMS5sYWJlbCArICcgZGlzY2FyZFNlY29uZCAnICsgcDIubGFiZWw7XG4gICAgcmV0dXJuIHBhcnNlcihzdHIgPT4ge1xuICAgICAgICByZXR1cm4gYW5kVGhlbihwMSwgcDIpLmZtYXAocGFpciA9PiBwYWlyWzBdKS5ydW4oc3RyKTtcbiAgICB9LCBsYWJlbCkuc2V0TGFiZWwobGFiZWwpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZGlzY2FyZEZpcnN0KHAxLCBwMikge1xuICAgIGNvbnN0IGxhYmVsID0gcDEubGFiZWwgKyAnIGRpc2NhcmRGaXJzdCAnICsgcDIubGFiZWw7XG4gICAgcmV0dXJuIHBhcnNlcihzdHIgPT4ge1xuICAgICAgICByZXR1cm4gYW5kVGhlbihwMSwgcDIpLmZtYXAocGFpciA9PiBwYWlyWzFdKS5ydW4oc3RyKTtcbiAgICB9LCBsYWJlbCkuc2V0TGFiZWwobGFiZWwpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYmV0d2VlbihwMSwgcDIsIHAzKSB7XG4gICAgcmV0dXJuIHAxLmRpc2NhcmRGaXJzdChwMikuZGlzY2FyZFNlY29uZChwMylcbiAgICAgICAgLnNldExhYmVsKCdiZXR3ZWVuICcgKyBwMS5sYWJlbCArICcvJyArIHAyLmxhYmVsICsgJy8nICsgcDMubGFiZWwpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYmV0d2VlblBhcmVucyhweCkge1xuICAgIHJldHVybiBiZXR3ZWVuKHBjaGFyKCcoJyksIHB4LCBwY2hhcignKScpKVxuICAgICAgICAuc2V0TGFiZWwoJ2JldHdlZW5QYXJlbnMgJyArIHB4LmxhYmVsKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGJpbmRQKGZhbWIsIHB4KSB7XG4gICAgbGV0IGxhYmVsID0gJ3Vua25vd24nO1xuICAgIHJldHVybiBwYXJzZXIoc3RyID0+IHtcbiAgICAgICAgY29uc3QgcmVzID0gcHgucnVuKHN0cik7XG4gICAgICAgIGlmIChyZXMuaXNGYWlsdXJlKSByZXR1cm4gcmVzO1xuICAgICAgICByZXR1cm4gZmFtYihyZXMudmFsdWVbMF0pLnJ1bihyZXMudmFsdWVbMV0pO1xuICAgIH0sIGxhYmVsKS5zZXRMYWJlbChsYWJlbCk7XG59XG5cbmZ1bmN0aW9uIF9jb25zKHgpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKHhzKSB7XG4gICAgICAgIHJldHVybiBbeF0uY29uY2F0KHhzKTtcbiAgICB9O1xufVxuXG5mdW5jdGlvbiBfc2V0TGFiZWwocHgsIG5ld0xhYmVsKSB7XG4gICAgcmV0dXJuIHBhcnNlcihzdHIgPT4ge1xuICAgICAgICBsZXQgcmVzdWx0ID0gcHgucnVuKHN0cik7XG4gICAgICAgIGlmIChyZXN1bHQuaXNGYWlsdXJlKSByZXR1cm4gVmFsaWRhdGlvbi5GYWlsdXJlKFBhaXIobmV3TGFiZWwsIHJlc3VsdC52YWx1ZVsxXSkpO1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sIG5ld0xhYmVsKTtcbn1cblxuLy8gdGhlIHJlYWwgdGhpbmcuLi5cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZXIoZm4sIGxhYmVsKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgdHlwZTogJ3BhcnNlcicsXG4gICAgICAgIGxhYmVsOiBsYWJlbCxcbiAgICAgICAgcnVuKHN0cikge1xuICAgICAgICAgICAgcmV0dXJuIGZuKHN0cik7XG4gICAgICAgIH0sXG4gICAgICAgIGFwcGx5KHB4KSB7XG4gICAgICAgICAgICByZXR1cm4gYXBwbHlQKHRoaXMpKHB4KTtcbiAgICAgICAgICAgIC8vcmV0dXJuIHRoaXMuYmluZChhbmRUaGVuKHRoaXMsIHB4KS5mbWFwKChbZiwgeF0pID0+IGYoeCkpKS5ydW47IC8vIHdlIGFyZSB0aGUgZlBcbiAgICAgICAgfSxcbiAgICAgICAgZm1hcChmYWIpIHtcbiAgICAgICAgICAgIC8vcmV0dXJuIGZtYXAoZmFiLCB0aGlzKTtcbiAgICAgICAgICAgIC8vcmV0dXJuIGJpbmRQKHN0ciA9PiByZXR1cm5QKGZhYihzdHIpKSwgdGhpcyk7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5iaW5kKHBhcnNlZFZhbHVlID0+IHJldHVyblAoZmFiKHBhcnNlZFZhbHVlKSkpO1xuICAgICAgICB9LFxuICAgICAgICBhbmRUaGVuKHB4KSB7XG4gICAgICAgICAgICByZXR1cm4gYW5kVGhlbih0aGlzLCBweCk7XG4gICAgICAgIH0sXG4gICAgICAgIG9yRWxzZShweCkge1xuICAgICAgICAgICAgcmV0dXJuIG9yRWxzZSh0aGlzLCBweCk7XG4gICAgICAgIH0sXG4gICAgICAgIGRpc2NhcmRGaXJzdChweCkge1xuICAgICAgICAgICAgcmV0dXJuIGRpc2NhcmRGaXJzdCh0aGlzLCBweCk7XG4gICAgICAgIH0sXG4gICAgICAgIGRpc2NhcmRTZWNvbmQocHgpIHtcbiAgICAgICAgICAgIHJldHVybiBkaXNjYXJkU2Vjb25kKHRoaXMsIHB4KTtcbiAgICAgICAgfSxcbiAgICAgICAgYmluZChmYW1iKSB7XG4gICAgICAgICAgICByZXR1cm4gYmluZFAoZmFtYiwgdGhpcyk7XG4gICAgICAgIH0sXG4gICAgICAgIHNldExhYmVsKG5ld0xhYmVsKSB7XG4gICAgICAgICAgICByZXR1cm4gX3NldExhYmVsKHRoaXMsIG5ld0xhYmVsKTtcbiAgICAgICAgfVxuICAgIH07XG59XG4iXX0=