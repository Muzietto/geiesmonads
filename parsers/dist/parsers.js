define(['exports', 'util', 'classes'], function (exports, _util, _classes) {
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

    var charParser = function charParser(char) {
        return function (str) {
            if ('' === str) throw new Error('reached end of char stream');
            if ((0, _util.head)(str) === char) return (0, _classes.success)(char, (0, _util.tail)(str));
            return (0, _classes.failure)('wanted ' + char + '; got ' + (0, _util.head)(str), str);
        };
    };

    var digitParser = function digitParser(digit) {
        return function (str) {
            if ('' === str) throw new Error('reached end of char stream');
            if (parseInt((0, _util.head)(str), 10) === digit) return (0, _classes.success)(digit, (0, _util.tail)(str));
            return (0, _classes.failure)('wanted ' + digit + '; got ' + (0, _util.head)(str), str);
        };
    };

    exports.charParser = charParser;
    exports.digitParser = digitParser;
    function pchar(char) {
        var result = function result(str) {
            return charParser(char)(str);
        };
        return parser(result);
    }

    function pdigit(digit) {
        return parser(function (str) {
            return digitParser(digit)(str);
        });
    }

    function andThenX(p1, p2) {
        return parser(function (str) {
            var res1 = p1.run(str);
            if ((0, _util.isSuccess)(res1)) {
                var res2 = p2.run(res1[1]);
                return returnP();
                if ((0, _util.isSuccess)(res2)) {
                    return (0, _classes.success)((0, _classes.pair)(res1[0], res2[0]), res2[1]);
                } else return res2;
            } else return res1;
        });
    }

    function _andThen(p1, p2) {
        return p1.bind(function (res1) {
            return p2.bind(function (res2) {
                return returnP((0, _classes.pair)(res1, res2));
            });
        });
    }

    exports.andThen = _andThen;
    function _orElse(parser1, parser2) {
        return parser(function (str) {
            var res1 = parser1.run(str);
            return (0, _util.isSuccess)(res1) ? res1 : parser2.run(str);
        });
    }

    exports.orElse = _orElse;
    var _fail = parser(function (str) {
        return (0, _classes.failure)('parsing failed', str);
    });

    // return neutral element instead of message
    var _succeed = parser(function (str) {
        return (0, _classes.success)('parsing succeeded', str);
    });

    function choice(parsers) {
        return parsers.reduceRight(function (rest, curr) {
            return _orElse(curr, rest);
        }, _fail);
    }

    function anyOf(chars) {
        return choice(chars.map(pchar));
    }

    function fmap(fab, parser1) {
        return parser(function (str) {
            var res = parser1.run(str);
            if ((0, _util.isSuccess)(res)) return (0, _classes.success)(fab(res[0]), res[1]);
            return res;
        });
    }

    function returnP(value) {
        return parser(function (str) {
            return (0, _classes.success)(value, str);
        });
    }

    // parser(a -> b) -> parser(a) -> parser(b)
    function applyP(fP) {
        return function (xP) {
            return _andThen(fP, xP).fmap(function (_ref) {
                var _ref2 = _slicedToArray(_ref, 2),
                    f = _ref2[0],
                    x = _ref2[1];

                return f(x);
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
        return sequenceP(str.split('').map(pchar));
    }

    function zeroOrMore(xP) {
        // zeroOrMore :: p a -> [a] -> try [a] = p a -> p [a]
        return function (str) {
            var res1 = xP.run(str);
            if ((0, _util.isFailure)(res1)) return (0, _classes.success)([], str);
            var resN = zeroOrMore(xP)(res1[1]);
            return (0, _classes.success)([res1[0]].concat(resN[0]), resN[1]);
        };
    }

    // not working  :-(
    function zeroOrMoreX(xP) {
        // zeroOrMoreX :: p a -> p(a -> p [a]) !!!
        return parser(function (str) {
            var res = xP.run(str);
            if ((0, _util.isFailure)(res)) return (0, _classes.success)([], str);
            // next line returns a parser (wrong, wrong, wrong...)
            return lift2(_cons)(returnP(res[0]))(zeroOrMoreX(xP).run(res[1]));
        });
    }

    function many(xP) {
        return parser(function (str) {
            return zeroOrMore(xP)(str);
        });
    }

    function many1(xP) {
        return parser(function (str) {
            var res1 = xP.run(str);
            if ((0, _util.isFailure)(res1)) return res1;
            var resN = zeroOrMore(xP)(res1[1]);
            return (0, _classes.success)([res1[0]].concat(resN[0]), resN[1]);
        });
    }

    function opt(xP) {
        return parser(function (str) {
            var res = xP.fmap(function (x) {
                return (0, _classes.some)(x);
            }).run(str);
            if ((0, _util.isSuccess)(res)) return res;
            return (0, _classes.success)((0, _classes.none)(), str);
        });
    }

    // opt from the book
    function optBook(pX) {
        var someP = pX.fmap(_classes.some);
        var noneP = returnP(_classes.none);
        return someP.orElse(noneP);
    }

    function _discardSecond(p1, p2) {
        return parser(function (str) {
            return _andThen(p1, p2).fmap(function (_ref5) {
                var _ref6 = _slicedToArray(_ref5, 2),
                    r1 = _ref6[0],
                    r2 = _ref6[1];

                return r1;
            }).run(str);
        });
    }

    exports.discardSecond = _discardSecond;
    function _discardFirst(p1, p2) {
        return parser(function (str) {
            return _andThen(p1, p2).fmap(function (_ref7) {
                var _ref8 = _slicedToArray(_ref7, 2),
                    r1 = _ref8[0],
                    r2 = _ref8[1];

                return r2;
            }).run(str);
        });
    }

    exports.discardFirst = _discardFirst;
    function between(p1, p2, p3) {
        return p1.discardFirst(p2).discardSecond(p3);
    }

    function betweenParens(px) {
        return between(pchar('('), px, pchar(')'));
    }

    function bindP(famb, px) {
        return parser(function (str) {
            var res = px.run(str);
            if ((0, _util.isFailure)(res)) return res;
            return famb(res[0]).run(res[1]);
        });
    }

    function _cons(x) {
        return function (xs) {
            return [x].concat(xs);
        };
    }

    // the real thing...
    function parser(fn) {
        return {
            type: 'parser',
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
                return this.bind(function (str) {
                    return returnP(fab(str));
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
            }
        };
    }
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2pzL3BhcnNlcnMuanMiXSwibmFtZXMiOlsicGNoYXIiLCJwZGlnaXQiLCJhbmRUaGVuWCIsImNob2ljZSIsImFueU9mIiwiZm1hcCIsInJldHVyblAiLCJhcHBseVAiLCJsaWZ0MiIsInNlcXVlbmNlUCIsInNlcXVlbmNlUDIiLCJwc3RyaW5nIiwiemVyb09yTW9yZSIsIm1hbnkiLCJtYW55MSIsIm9wdCIsIm9wdEJvb2siLCJiZXR3ZWVuIiwiYmV0d2VlblBhcmVucyIsImJpbmRQIiwicGFyc2VyIiwiY2hhclBhcnNlciIsInN0ciIsIkVycm9yIiwiY2hhciIsImRpZ2l0UGFyc2VyIiwicGFyc2VJbnQiLCJkaWdpdCIsInJlc3VsdCIsInAxIiwicDIiLCJyZXMxIiwicnVuIiwicmVzMiIsImFuZFRoZW4iLCJiaW5kIiwib3JFbHNlIiwicGFyc2VyMSIsInBhcnNlcjIiLCJfZmFpbCIsIl9zdWNjZWVkIiwicGFyc2VycyIsInJlZHVjZVJpZ2h0IiwicmVzdCIsImN1cnIiLCJjaGFycyIsIm1hcCIsImZhYiIsInJlcyIsInZhbHVlIiwiZlAiLCJ4UCIsImYiLCJ4IiwiZmFhYiIsImFwcGx5IiwiX2NvbnMiLCJ5Iiwic3BsaXQiLCJyZXNOIiwiY29uY2F0IiwiemVyb09yTW9yZVgiLCJwWCIsInNvbWVQIiwibm9uZVAiLCJkaXNjYXJkU2Vjb25kIiwicjEiLCJyMiIsImRpc2NhcmRGaXJzdCIsInAzIiwicHgiLCJmYW1iIiwieHMiLCJmbiIsInR5cGUiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7WUE4QmdCQSxLLEdBQUFBLEs7WUFPQUMsTSxHQUFBQSxNO1lBSUFDLFEsR0FBQUEsUTtZQWlDQUMsTSxHQUFBQSxNO1lBSUFDLEssR0FBQUEsSztZQUlBQyxJLEdBQUFBLEk7WUFRQUMsTyxHQUFBQSxPO1lBS0FDLE0sR0FBQUEsTTtZQU1BQyxLLEdBQUFBLEs7WUFVQUMsUyxHQUFBQSxTO1lBUUFDLFUsR0FBQUEsVTtZQU9BQyxPLEdBQUFBLE87WUFJQUMsVSxH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QUFQO0FBQ0gsYUF6QkU7QUEwQkhuQyxnQkExQkcsZ0JBMEJFb0MsSUExQkYsRUEwQlE7QUFDUCx1QkFBT3BELE1BQU1vRCxJQUFOLEVBQVksSUFBWixDQUFQO0FBQ0g7QUE1QkUsU0FBUDtBQThCSCIsImZpbGUiOiJwYXJzZXJzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8gY2ZyLiBcIlVuZGVyc3RhbmRpbmcgUGFyc2VyIENvbWJpbmF0b3JzXCIgKEYjIGZvciBGdW4gYW5kIFByb2ZpdClcblxuaW1wb3J0IHtcbiAgICBoZWFkLFxuICAgIHRhaWwsXG4gICAgaXNTdWNjZXNzLFxuICAgIGlzRmFpbHVyZSxcbn0gZnJvbSAndXRpbCc7XG5pbXBvcnQge1xuICAgIHBhaXIsXG4gICAgc3VjY2VzcyxcbiAgICBmYWlsdXJlLFxuICAgIHNvbWUsXG4gICAgbm9uZSxcbn0gZnJvbSAnY2xhc3Nlcyc7XG5cbmNvbnN0IGNoYXJQYXJzZXIgPSBjaGFyID0+IHN0ciA9PiB7XG4gICAgaWYgKCcnID09PSBzdHIpIHRocm93IG5ldyBFcnJvcigncmVhY2hlZCBlbmQgb2YgY2hhciBzdHJlYW0nKTtcbiAgICBpZiAoaGVhZChzdHIpID09PSBjaGFyKSByZXR1cm4gc3VjY2VzcyhjaGFyLCB0YWlsKHN0cikpO1xuICAgIHJldHVybiBmYWlsdXJlKCd3YW50ZWQgJyArIGNoYXIgKyAnOyBnb3QgJyArIGhlYWQoc3RyKSwgc3RyKTtcbn07XG5cbmNvbnN0IGRpZ2l0UGFyc2VyID0gZGlnaXQgPT4gc3RyID0+IHtcbiAgICBpZiAoJycgPT09IHN0cikgdGhyb3cgbmV3IEVycm9yKCdyZWFjaGVkIGVuZCBvZiBjaGFyIHN0cmVhbScpO1xuICAgIGlmIChwYXJzZUludChoZWFkKHN0ciksIDEwKSA9PT0gZGlnaXQpIHJldHVybiBzdWNjZXNzKGRpZ2l0LCB0YWlsKHN0cikpO1xuICAgIHJldHVybiBmYWlsdXJlKCd3YW50ZWQgJyArIGRpZ2l0ICsgJzsgZ290ICcgKyBoZWFkKHN0ciksIHN0cik7XG59O1xuXG5leHBvcnQge2NoYXJQYXJzZXIsIGRpZ2l0UGFyc2VyfTtcblxuZXhwb3J0IGZ1bmN0aW9uIHBjaGFyKGNoYXIpIHtcbiAgICBsZXQgcmVzdWx0ID0gZnVuY3Rpb24gKHN0cikge1xuICAgICAgICByZXR1cm4gY2hhclBhcnNlcihjaGFyKShzdHIpO1xuICAgIH07XG4gICAgcmV0dXJuIHBhcnNlcihyZXN1bHQpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcGRpZ2l0KGRpZ2l0KSB7XG4gICAgcmV0dXJuIHBhcnNlcihzdHIgPT4gZGlnaXRQYXJzZXIoZGlnaXQpKHN0cikpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYW5kVGhlblgocDEsIHAyKSB7XG4gICAgcmV0dXJuIHBhcnNlcihmdW5jdGlvbiAoc3RyKSB7XG4gICAgICAgIGxldCByZXMxID0gcDEucnVuKHN0cik7XG4gICAgICAgIGlmIChpc1N1Y2Nlc3MocmVzMSkpIHtcbiAgICAgICAgICAgIGxldCByZXMyID0gcDIucnVuKHJlczFbMV0pO1xuICAgICAgICAgICAgcmV0dXJuIHJldHVyblAoKVxuICAgICAgICAgICAgaWYgKGlzU3VjY2VzcyhyZXMyKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBzdWNjZXNzKHBhaXIocmVzMVswXSwgcmVzMlswXSksIHJlczJbMV0pO1xuICAgICAgICAgICAgfSBlbHNlIHJldHVybiByZXMyO1xuICAgICAgICB9IGVsc2UgcmV0dXJuIHJlczE7XG4gICAgfSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhbmRUaGVuKHAxLCBwMikge1xuICAgIHJldHVybiBwMS5iaW5kKHJlczEgPT4ge1xuICAgICAgICByZXR1cm4gcDIuYmluZChyZXMyID0+IHtcbiAgICAgICAgICAgIHJldHVybiByZXR1cm5QKHBhaXIocmVzMSwgcmVzMikpO1xuICAgICAgICB9KTtcbiAgICB9KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG9yRWxzZShwYXJzZXIxLCBwYXJzZXIyKSB7XG4gICAgcmV0dXJuIHBhcnNlcihzdHIgPT4ge1xuICAgICAgICBsZXQgcmVzMSA9IHBhcnNlcjEucnVuKHN0cik7XG4gICAgICAgIHJldHVybiAoaXNTdWNjZXNzKHJlczEpKSA/IHJlczEgOiBwYXJzZXIyLnJ1bihzdHIpO1xuICAgIH0pO1xufVxuXG5sZXQgX2ZhaWwgPSBwYXJzZXIoc3RyID0+IGZhaWx1cmUoJ3BhcnNpbmcgZmFpbGVkJywgc3RyKSk7XG5cbi8vIHJldHVybiBuZXV0cmFsIGVsZW1lbnQgaW5zdGVhZCBvZiBtZXNzYWdlXG5sZXQgX3N1Y2NlZWQgPSBwYXJzZXIoc3RyID0+IHN1Y2Nlc3MoJ3BhcnNpbmcgc3VjY2VlZGVkJywgc3RyKSk7XG5cbmV4cG9ydCBmdW5jdGlvbiBjaG9pY2UocGFyc2Vycykge1xuICAgIHJldHVybiBwYXJzZXJzLnJlZHVjZVJpZ2h0KChyZXN0LCBjdXJyKSA9PiBvckVsc2UoY3VyciwgcmVzdCksIF9mYWlsKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGFueU9mKGNoYXJzKSB7XG4gICAgcmV0dXJuIGNob2ljZShjaGFycy5tYXAocGNoYXIpKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGZtYXAoZmFiLCBwYXJzZXIxKSB7XG4gICAgcmV0dXJuIHBhcnNlcihzdHIgPT4ge1xuICAgICAgICBsZXQgcmVzID0gcGFyc2VyMS5ydW4oc3RyKTtcbiAgICAgICAgaWYgKGlzU3VjY2VzcyhyZXMpKSByZXR1cm4gc3VjY2VzcyhmYWIocmVzWzBdKSwgcmVzWzFdKTtcbiAgICAgICAgcmV0dXJuIHJlcztcbiAgICB9KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJldHVyblAodmFsdWUpIHtcbiAgICByZXR1cm4gcGFyc2VyKHN0ciA9PiBzdWNjZXNzKHZhbHVlLCBzdHIpKTtcbn1cblxuLy8gcGFyc2VyKGEgLT4gYikgLT4gcGFyc2VyKGEpIC0+IHBhcnNlcihiKVxuZXhwb3J0IGZ1bmN0aW9uIGFwcGx5UChmUCkge1xuICAgIHJldHVybiBmdW5jdGlvbiAoeFApIHtcbiAgICAgICAgcmV0dXJuIGFuZFRoZW4oZlAsIHhQKS5mbWFwKChbZiwgeF0pID0+IGYoeCkpO1xuICAgIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBsaWZ0MihmYWFiKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uIChwYXJzZXIxKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAocGFyc2VyMikge1xuICAgICAgICAgICAgLy9yZXR1cm4gYXBwbHlQKGFwcGx5UChyZXR1cm5QKGZhYWIpKShwYXJzZXIxKSkocGFyc2VyMik7XG4gICAgICAgICAgICByZXR1cm4gcmV0dXJuUChmYWFiKS5hcHBseShwYXJzZXIxKS5hcHBseShwYXJzZXIyKTsgLy8gdXNpbmcgaW5zdGFuY2UgbWV0aG9kc1xuICAgICAgICB9O1xuICAgIH07XG59XG5cbi8vIHVzaW5nIGxpZnQyKGNvbnMpXG5leHBvcnQgZnVuY3Rpb24gc2VxdWVuY2VQKHBhcnNlcnMpIHtcbiAgICByZXR1cm4gcGFyc2Vyc1xuICAgICAgICAucmVkdWNlUmlnaHQoKHJlc3QsIGN1cnIpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBsaWZ0MihfY29ucykoY3VycikocmVzdCk7XG4gICAgICAgIH0sIHJldHVyblAoW10pKTtcbn1cblxuLy8gdXNpbmcgbmFpdmUgYW5kVGhlbiAmJiBmbWFwIC0tPiByZXR1cm5zIHN0cmluZ3MsIG5vdCBhcnJheXMhXG5leHBvcnQgZnVuY3Rpb24gc2VxdWVuY2VQMihwYXJzZXJzKSB7XG4gICAgcmV0dXJuIHBhcnNlcnNcbiAgICAgICAgLnJlZHVjZVJpZ2h0KChyZXN0LCBjdXJyKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gZm1hcCgoW3gsIHldKSA9PiB4ICsgeSwgYW5kVGhlbihjdXJyLCByZXN0KSk7XG4gICAgICAgIH0sIHJldHVyblAoJycpKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHBzdHJpbmcoc3RyKSB7XG4gICAgcmV0dXJuIHNlcXVlbmNlUChzdHIuc3BsaXQoJycpLm1hcChwY2hhcikpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gemVyb09yTW9yZSh4UCkgeyAvLyB6ZXJvT3JNb3JlIDo6IHAgYSAtPiBbYV0gLT4gdHJ5IFthXSA9IHAgYSAtPiBwIFthXVxuICAgIHJldHVybiBzdHIgPT4ge1xuICAgICAgICBsZXQgcmVzMSA9IHhQLnJ1bihzdHIpO1xuICAgICAgICBpZiAoaXNGYWlsdXJlKHJlczEpKSByZXR1cm4gc3VjY2VzcyhbXSwgc3RyKTtcbiAgICAgICAgbGV0IHJlc04gPSB6ZXJvT3JNb3JlKHhQKShyZXMxWzFdKTtcbiAgICAgICAgcmV0dXJuIHN1Y2Nlc3MoW3JlczFbMF1dLmNvbmNhdChyZXNOWzBdKSwgcmVzTlsxXSk7XG4gICAgfTtcbn1cblxuLy8gbm90IHdvcmtpbmcgIDotKFxuZnVuY3Rpb24gemVyb09yTW9yZVgoeFApIHsgLy8gemVyb09yTW9yZVggOjogcCBhIC0+IHAoYSAtPiBwIFthXSkgISEhXG4gICAgcmV0dXJuIHBhcnNlcihzdHIgPT4ge1xuICAgICAgICBsZXQgcmVzID0geFAucnVuKHN0cik7XG4gICAgICAgIGlmIChpc0ZhaWx1cmUocmVzKSkgcmV0dXJuIHN1Y2Nlc3MoW10sIHN0cik7XG4gICAgICAgIC8vIG5leHQgbGluZSByZXR1cm5zIGEgcGFyc2VyICh3cm9uZywgd3JvbmcsIHdyb25nLi4uKVxuICAgICAgICByZXR1cm4gbGlmdDIoX2NvbnMpKHJldHVyblAocmVzWzBdKSkoemVyb09yTW9yZVgoeFApLnJ1bihyZXNbMV0pKTtcbiAgICB9KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1hbnkoeFApIHtcbiAgICByZXR1cm4gcGFyc2VyKHN0ciA9PiB7XG4gICAgICAgIHJldHVybiB6ZXJvT3JNb3JlKHhQKShzdHIpO1xuICAgIH0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbWFueTEoeFApIHtcbiAgICByZXR1cm4gcGFyc2VyKHN0ciA9PiB7XG4gICAgICAgIGxldCByZXMxID0geFAucnVuKHN0cik7XG4gICAgICAgIGlmIChpc0ZhaWx1cmUocmVzMSkpIHJldHVybiByZXMxO1xuICAgICAgICBsZXQgcmVzTiA9IHplcm9Pck1vcmUoeFApKHJlczFbMV0pO1xuICAgICAgICByZXR1cm4gc3VjY2VzcyhbcmVzMVswXV0uY29uY2F0KHJlc05bMF0pLCByZXNOWzFdKTtcbiAgICB9KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG9wdCh4UCkge1xuICAgIHJldHVybiBwYXJzZXIoc3RyID0+IHtcbiAgICAgICAgbGV0IHJlcyA9IHhQLmZtYXAoeCA9PiBzb21lKHgpKS5ydW4oc3RyKTtcbiAgICAgICAgaWYgKGlzU3VjY2VzcyhyZXMpKSByZXR1cm4gcmVzO1xuICAgICAgICByZXR1cm4gc3VjY2Vzcyhub25lKCksIHN0cik7XG4gICAgfSk7XG59XG5cbi8vIG9wdCBmcm9tIHRoZSBib29rXG5leHBvcnQgZnVuY3Rpb24gb3B0Qm9vayhwWCkge1xuICAgIGNvbnN0IHNvbWVQID0gcFguZm1hcChzb21lKTtcbiAgICBjb25zdCBub25lUCA9IHJldHVyblAobm9uZSk7XG4gICAgcmV0dXJuIHNvbWVQLm9yRWxzZShub25lUCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBkaXNjYXJkU2Vjb25kKHAxLCBwMikge1xuICAgIHJldHVybiBwYXJzZXIoc3RyID0+IHtcbiAgICAgICAgcmV0dXJuIGFuZFRoZW4ocDEsIHAyKS5mbWFwKChbcjEsIHIyXSkgPT4gcjEpLnJ1bihzdHIpO1xuICAgIH0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZGlzY2FyZEZpcnN0KHAxLCBwMikge1xuICAgIHJldHVybiBwYXJzZXIoc3RyID0+IHtcbiAgICAgICAgcmV0dXJuIGFuZFRoZW4ocDEsIHAyKS5mbWFwKChbcjEsIHIyXSkgPT4gcjIpLnJ1bihzdHIpO1xuICAgIH0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYmV0d2VlbihwMSwgcDIsIHAzKSB7XG4gICAgcmV0dXJuIHAxLmRpc2NhcmRGaXJzdChwMikuZGlzY2FyZFNlY29uZChwMyk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBiZXR3ZWVuUGFyZW5zKHB4KSB7XG4gICAgcmV0dXJuIGJldHdlZW4ocGNoYXIoJygnKSwgcHgsIHBjaGFyKCcpJykpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYmluZFAoZmFtYiwgcHgpIHtcbiAgICByZXR1cm4gcGFyc2VyKHN0ciA9PiB7XG4gICAgICAgIGNvbnN0IHJlcyA9IHB4LnJ1bihzdHIpO1xuICAgICAgICBpZiAoaXNGYWlsdXJlKHJlcykpIHJldHVybiByZXM7XG4gICAgICAgIHJldHVybiBmYW1iKHJlc1swXSkucnVuKHJlc1sxXSk7XG4gICAgfSk7XG59XG5cbmZ1bmN0aW9uIF9jb25zKHgpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKHhzKSB7XG4gICAgICAgIHJldHVybiBbeF0uY29uY2F0KHhzKTtcbiAgICB9O1xufVxuXG4vLyB0aGUgcmVhbCB0aGluZy4uLlxuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlcihmbikge1xuICAgIHJldHVybiB7XG4gICAgICAgIHR5cGU6ICdwYXJzZXInLFxuICAgICAgICBydW4oc3RyKSB7XG4gICAgICAgICAgICByZXR1cm4gZm4oc3RyKTtcbiAgICAgICAgfSxcbiAgICAgICAgYXBwbHkocHgpIHtcbiAgICAgICAgICAgIHJldHVybiBhcHBseVAodGhpcykocHgpO1xuICAgICAgICAgICAgLy9yZXR1cm4gdGhpcy5iaW5kKGFuZFRoZW4odGhpcywgcHgpLmZtYXAoKFtmLCB4XSkgPT4gZih4KSkpLnJ1bjsgLy8gd2UgYXJlIHRoZSBmUFxuICAgICAgICB9LFxuICAgICAgICBmbWFwKGZhYikge1xuICAgICAgICAgICAgLy9yZXR1cm4gZm1hcChmYWIsIHRoaXMpO1xuICAgICAgICAgICAgLy9yZXR1cm4gYmluZFAoc3RyID0+IHJldHVyblAoZmFiKHN0cikpLCB0aGlzKTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmJpbmQoc3RyID0+IHJldHVyblAoZmFiKHN0cikpKTtcbiAgICAgICAgfSxcbiAgICAgICAgYW5kVGhlbihweCkge1xuICAgICAgICAgICAgcmV0dXJuIGFuZFRoZW4odGhpcywgcHgpO1xuICAgICAgICB9LFxuICAgICAgICBvckVsc2UocHgpIHtcbiAgICAgICAgICAgIHJldHVybiBvckVsc2UodGhpcywgcHgpO1xuICAgICAgICB9LFxuICAgICAgICBkaXNjYXJkRmlyc3QocHgpIHtcbiAgICAgICAgICAgIHJldHVybiBkaXNjYXJkRmlyc3QodGhpcywgcHgpO1xuICAgICAgICB9LFxuICAgICAgICBkaXNjYXJkU2Vjb25kKHB4KSB7XG4gICAgICAgICAgICByZXR1cm4gZGlzY2FyZFNlY29uZCh0aGlzLCBweCk7XG4gICAgICAgIH0sXG4gICAgICAgIGJpbmQoZmFtYikge1xuICAgICAgICAgICAgcmV0dXJuIGJpbmRQKGZhbWIsIHRoaXMpO1xuICAgICAgICB9XG4gICAgfTtcbn1cbiJdfQ==