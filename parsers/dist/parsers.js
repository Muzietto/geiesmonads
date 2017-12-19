define(['exports', 'util', 'classes'], function (exports, _util, _classes) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.discardFirst = exports.discardSecond = exports.orElse = exports.andThen = exports.digitParser = exports.charParser = undefined;
    exports.pchar = pchar;
    exports.pdigit = pdigit;
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

    function _andThen(parser1, parser2) {
        return parser(function (str) {
            var res1 = parser1.run(str);
            if ((0, _util.isSuccess)(res1)) {
                var res2 = parser2.run(res1[1]);
                if ((0, _util.isSuccess)(res2)) {
                    return (0, _classes.success)((0, _classes.pair)(res1[0], res2[0]), res2[1]);
                } else return res2;
            } else return res1;
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
                //return applyP(this)(px);
                return this.bind(_andThen(this, px).fmap(function (_ref9) {
                    var _ref10 = _slicedToArray(_ref9, 2),
                        f = _ref10[0],
                        x = _ref10[1];

                    return f(x);
                })).run; // we are the fP
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2pzL3BhcnNlcnMuanMiXSwibmFtZXMiOlsicGNoYXIiLCJwZGlnaXQiLCJjaG9pY2UiLCJhbnlPZiIsImZtYXAiLCJyZXR1cm5QIiwiYXBwbHlQIiwibGlmdDIiLCJzZXF1ZW5jZVAiLCJzZXF1ZW5jZVAyIiwicHN0cmluZyIsInplcm9Pck1vcmUiLCJtYW55IiwibWFueTEiLCJvcHQiLCJvcHRCb29rIiwiYmV0d2VlbiIsImJldHdlZW5QYXJlbnMiLCJiaW5kUCIsInBhcnNlciIsImNoYXJQYXJzZXIiLCJzdHIiLCJFcnJvciIsImNoYXIiLCJkaWdpdFBhcnNlciIsInBhcnNlSW50IiwiZGlnaXQiLCJyZXN1bHQiLCJhbmRUaGVuIiwicGFyc2VyMSIsInBhcnNlcjIiLCJyZXMxIiwicnVuIiwicmVzMiIsIm9yRWxzZSIsIl9mYWlsIiwiX3N1Y2NlZWQiLCJwYXJzZXJzIiwicmVkdWNlUmlnaHQiLCJyZXN0IiwiY3VyciIsImNoYXJzIiwibWFwIiwiZmFiIiwicmVzIiwidmFsdWUiLCJmUCIsInhQIiwiZiIsIngiLCJmYWFiIiwiYXBwbHkiLCJfY29ucyIsInkiLCJzcGxpdCIsInJlc04iLCJjb25jYXQiLCJ6ZXJvT3JNb3JlWCIsInBYIiwic29tZVAiLCJub25lUCIsImRpc2NhcmRTZWNvbmQiLCJwMSIsInAyIiwicjEiLCJyMiIsImRpc2NhcmRGaXJzdCIsInAzIiwicHgiLCJmYW1iIiwieHMiLCJmbiIsInR5cGUiLCJiaW5kIl0sIm1hcHBpbmdzIjoiOzs7Ozs7O1lBOEJnQkEsSyxHQUFBQSxLO1lBT0FDLE0sR0FBQUEsTTtZQTRCQUMsTSxHQUFBQSxNO1lBSUFDLEssR0FBQUEsSztZQUlBQyxJLEdBQUFBLEk7WUFRQUMsTyxHQUFBQSxPO1lBS0FDLE0sR0FBQUEsTTtZQU1BQyxLLEdBQUFBLEs7WUFVQUMsUyxHQUFBQSxTO1lBUUFDLFUsR0FBQUEsVTtZQU9BQyxPLEdBQUFBLE87WUFJQUMsVSxHQUFBQSxVO1lBbUJBQyxJLEdBQUFBLEk7WUFN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cnNlcnMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBjZnIuIFwiVW5kZXJzdGFuZGluZyBQYXJzZXIgQ29tYmluYXRvcnNcIiAoRiMgZm9yIEZ1biBhbmQgUHJvZml0KVxuXG5pbXBvcnQge1xuICAgIGhlYWQsXG4gICAgdGFpbCxcbiAgICBpc1N1Y2Nlc3MsXG4gICAgaXNGYWlsdXJlLFxufSBmcm9tICd1dGlsJztcbmltcG9ydCB7XG4gICAgcGFpcixcbiAgICBzdWNjZXNzLFxuICAgIGZhaWx1cmUsXG4gICAgc29tZSxcbiAgICBub25lLFxufSBmcm9tICdjbGFzc2VzJztcblxuY29uc3QgY2hhclBhcnNlciA9IGNoYXIgPT4gc3RyID0+IHtcbiAgICBpZiAoJycgPT09IHN0cikgdGhyb3cgbmV3IEVycm9yKCdyZWFjaGVkIGVuZCBvZiBjaGFyIHN0cmVhbScpO1xuICAgIGlmIChoZWFkKHN0cikgPT09IGNoYXIpIHJldHVybiBzdWNjZXNzKGNoYXIsIHRhaWwoc3RyKSk7XG4gICAgcmV0dXJuIGZhaWx1cmUoJ3dhbnRlZCAnICsgY2hhciArICc7IGdvdCAnICsgaGVhZChzdHIpLCBzdHIpO1xufTtcblxuY29uc3QgZGlnaXRQYXJzZXIgPSBkaWdpdCA9PiBzdHIgPT4ge1xuICAgIGlmICgnJyA9PT0gc3RyKSB0aHJvdyBuZXcgRXJyb3IoJ3JlYWNoZWQgZW5kIG9mIGNoYXIgc3RyZWFtJyk7XG4gICAgaWYgKHBhcnNlSW50KGhlYWQoc3RyKSwgMTApID09PSBkaWdpdCkgcmV0dXJuIHN1Y2Nlc3MoZGlnaXQsIHRhaWwoc3RyKSk7XG4gICAgcmV0dXJuIGZhaWx1cmUoJ3dhbnRlZCAnICsgZGlnaXQgKyAnOyBnb3QgJyArIGhlYWQoc3RyKSwgc3RyKTtcbn07XG5cbmV4cG9ydCB7Y2hhclBhcnNlciwgZGlnaXRQYXJzZXJ9O1xuXG5leHBvcnQgZnVuY3Rpb24gcGNoYXIoY2hhcikge1xuICAgIGxldCByZXN1bHQgPSBmdW5jdGlvbiAoc3RyKSB7XG4gICAgICAgIHJldHVybiBjaGFyUGFyc2VyKGNoYXIpKHN0cik7XG4gICAgfTtcbiAgICByZXR1cm4gcGFyc2VyKHJlc3VsdCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwZGlnaXQoZGlnaXQpIHtcbiAgICByZXR1cm4gcGFyc2VyKHN0ciA9PiBkaWdpdFBhcnNlcihkaWdpdCkoc3RyKSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhbmRUaGVuKHBhcnNlcjEsIHBhcnNlcjIpIHtcbiAgICByZXR1cm4gcGFyc2VyKGZ1bmN0aW9uIChzdHIpIHtcbiAgICAgICAgbGV0IHJlczEgPSBwYXJzZXIxLnJ1bihzdHIpO1xuICAgICAgICBpZiAoaXNTdWNjZXNzKHJlczEpKSB7XG4gICAgICAgICAgICBsZXQgcmVzMiA9IHBhcnNlcjIucnVuKHJlczFbMV0pO1xuICAgICAgICAgICAgaWYgKGlzU3VjY2VzcyhyZXMyKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBzdWNjZXNzKHBhaXIocmVzMVswXSwgcmVzMlswXSksIHJlczJbMV0pO1xuICAgICAgICAgICAgfSBlbHNlIHJldHVybiByZXMyO1xuICAgICAgICB9IGVsc2UgcmV0dXJuIHJlczE7XG4gICAgfSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBvckVsc2UocGFyc2VyMSwgcGFyc2VyMikge1xuICAgIHJldHVybiBwYXJzZXIoc3RyID0+IHtcbiAgICAgICAgbGV0IHJlczEgPSBwYXJzZXIxLnJ1bihzdHIpO1xuICAgICAgICByZXR1cm4gKGlzU3VjY2VzcyhyZXMxKSkgPyByZXMxIDogcGFyc2VyMi5ydW4oc3RyKTtcbiAgICB9KTtcbn1cblxubGV0IF9mYWlsID0gcGFyc2VyKHN0ciA9PiBmYWlsdXJlKCdwYXJzaW5nIGZhaWxlZCcsIHN0cikpO1xuXG4vLyByZXR1cm4gbmV1dHJhbCBlbGVtZW50IGluc3RlYWQgb2YgbWVzc2FnZVxubGV0IF9zdWNjZWVkID0gcGFyc2VyKHN0ciA9PiBzdWNjZXNzKCdwYXJzaW5nIHN1Y2NlZWRlZCcsIHN0cikpO1xuXG5leHBvcnQgZnVuY3Rpb24gY2hvaWNlKHBhcnNlcnMpIHtcbiAgICByZXR1cm4gcGFyc2Vycy5yZWR1Y2VSaWdodCgocmVzdCwgY3VycikgPT4gb3JFbHNlKGN1cnIsIHJlc3QpLCBfZmFpbCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhbnlPZihjaGFycykge1xuICAgIHJldHVybiBjaG9pY2UoY2hhcnMubWFwKHBjaGFyKSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBmbWFwKGZhYiwgcGFyc2VyMSkge1xuICAgIHJldHVybiBwYXJzZXIoc3RyID0+IHtcbiAgICAgICAgbGV0IHJlcyA9IHBhcnNlcjEucnVuKHN0cik7XG4gICAgICAgIGlmIChpc1N1Y2Nlc3MocmVzKSkgcmV0dXJuIHN1Y2Nlc3MoZmFiKHJlc1swXSksIHJlc1sxXSk7XG4gICAgICAgIHJldHVybiByZXM7XG4gICAgfSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZXR1cm5QKHZhbHVlKSB7XG4gICAgcmV0dXJuIHBhcnNlcihzdHIgPT4gc3VjY2Vzcyh2YWx1ZSwgc3RyKSk7XG59XG5cbi8vIHBhcnNlcihhIC0+IGIpIC0+IHBhcnNlcihhKSAtPiBwYXJzZXIoYilcbmV4cG9ydCBmdW5jdGlvbiBhcHBseVAoZlApIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKHhQKSB7XG4gICAgICAgIHJldHVybiBhbmRUaGVuKGZQLCB4UCkuZm1hcCgoW2YsIHhdKSA9PiBmKHgpKTtcbiAgICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbGlmdDIoZmFhYikge1xuICAgIHJldHVybiBmdW5jdGlvbiAocGFyc2VyMSkge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKHBhcnNlcjIpIHtcbiAgICAgICAgICAgIC8vcmV0dXJuIGFwcGx5UChhcHBseVAocmV0dXJuUChmYWFiKSkocGFyc2VyMSkpKHBhcnNlcjIpO1xuICAgICAgICAgICAgcmV0dXJuIHJldHVyblAoZmFhYikuYXBwbHkocGFyc2VyMSkuYXBwbHkocGFyc2VyMik7IC8vIHVzaW5nIGluc3RhbmNlIG1ldGhvZHNcbiAgICAgICAgfTtcbiAgICB9O1xufVxuXG4vLyB1c2luZyBsaWZ0Mihjb25zKVxuZXhwb3J0IGZ1bmN0aW9uIHNlcXVlbmNlUChwYXJzZXJzKSB7XG4gICAgcmV0dXJuIHBhcnNlcnNcbiAgICAgICAgLnJlZHVjZVJpZ2h0KChyZXN0LCBjdXJyKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gbGlmdDIoX2NvbnMpKGN1cnIpKHJlc3QpO1xuICAgICAgICB9LCByZXR1cm5QKFtdKSk7XG59XG5cbi8vIHVzaW5nIG5haXZlIGFuZFRoZW4gJiYgZm1hcCAtLT4gcmV0dXJucyBzdHJpbmdzLCBub3QgYXJyYXlzIVxuZXhwb3J0IGZ1bmN0aW9uIHNlcXVlbmNlUDIocGFyc2Vycykge1xuICAgIHJldHVybiBwYXJzZXJzXG4gICAgICAgIC5yZWR1Y2VSaWdodCgocmVzdCwgY3VycikgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIGZtYXAoKFt4LCB5XSkgPT4geCArIHksIGFuZFRoZW4oY3VyciwgcmVzdCkpO1xuICAgICAgICB9LCByZXR1cm5QKCcnKSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwc3RyaW5nKHN0cikge1xuICAgIHJldHVybiBzZXF1ZW5jZVAoc3RyLnNwbGl0KCcnKS5tYXAocGNoYXIpKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHplcm9Pck1vcmUoeFApIHsgLy8gemVyb09yTW9yZSA6OiBwIGEgLT4gW2FdIC0+IHRyeSBbYV0gPSBwIGEgLT4gcCBbYV1cbiAgICByZXR1cm4gc3RyID0+IHtcbiAgICAgICAgbGV0IHJlczEgPSB4UC5ydW4oc3RyKTtcbiAgICAgICAgaWYgKGlzRmFpbHVyZShyZXMxKSkgcmV0dXJuIHN1Y2Nlc3MoW10sIHN0cik7XG4gICAgICAgIGxldCByZXNOID0gemVyb09yTW9yZSh4UCkocmVzMVsxXSk7XG4gICAgICAgIHJldHVybiBzdWNjZXNzKFtyZXMxWzBdXS5jb25jYXQocmVzTlswXSksIHJlc05bMV0pO1xuICAgIH07XG59XG5cbi8vIG5vdCB3b3JraW5nICA6LShcbmZ1bmN0aW9uIHplcm9Pck1vcmVYKHhQKSB7IC8vIHplcm9Pck1vcmVYIDo6IHAgYSAtPiBwKGEgLT4gcCBbYV0pICEhIVxuICAgIHJldHVybiBwYXJzZXIoc3RyID0+IHtcbiAgICAgICAgbGV0IHJlcyA9IHhQLnJ1bihzdHIpO1xuICAgICAgICBpZiAoaXNGYWlsdXJlKHJlcykpIHJldHVybiBzdWNjZXNzKFtdLCBzdHIpO1xuICAgICAgICAvLyBuZXh0IGxpbmUgcmV0dXJucyBhIHBhcnNlciAod3JvbmcsIHdyb25nLCB3cm9uZy4uLilcbiAgICAgICAgcmV0dXJuIGxpZnQyKF9jb25zKShyZXR1cm5QKHJlc1swXSkpKHplcm9Pck1vcmVYKHhQKS5ydW4ocmVzWzFdKSk7XG4gICAgfSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtYW55KHhQKSB7XG4gICAgcmV0dXJuIHBhcnNlcihzdHIgPT4ge1xuICAgICAgICByZXR1cm4gemVyb09yTW9yZSh4UCkoc3RyKTtcbiAgICB9KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1hbnkxKHhQKSB7XG4gICAgcmV0dXJuIHBhcnNlcihzdHIgPT4ge1xuICAgICAgICBsZXQgcmVzMSA9IHhQLnJ1bihzdHIpO1xuICAgICAgICBpZiAoaXNGYWlsdXJlKHJlczEpKSByZXR1cm4gcmVzMTtcbiAgICAgICAgbGV0IHJlc04gPSB6ZXJvT3JNb3JlKHhQKShyZXMxWzFdKTtcbiAgICAgICAgcmV0dXJuIHN1Y2Nlc3MoW3JlczFbMF1dLmNvbmNhdChyZXNOWzBdKSwgcmVzTlsxXSk7XG4gICAgfSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBvcHQoeFApIHtcbiAgICByZXR1cm4gcGFyc2VyKHN0ciA9PiB7XG4gICAgICAgIGxldCByZXMgPSB4UC5mbWFwKHggPT4gc29tZSh4KSkucnVuKHN0cik7XG4gICAgICAgIGlmIChpc1N1Y2Nlc3MocmVzKSkgcmV0dXJuIHJlcztcbiAgICAgICAgcmV0dXJuIHN1Y2Nlc3Mobm9uZSgpLCBzdHIpO1xuICAgIH0pO1xufVxuXG4vLyBvcHQgZnJvbSB0aGUgYm9va1xuZXhwb3J0IGZ1bmN0aW9uIG9wdEJvb2socFgpIHtcbiAgICBjb25zdCBzb21lUCA9IHBYLmZtYXAoc29tZSk7XG4gICAgY29uc3Qgbm9uZVAgPSByZXR1cm5QKG5vbmUpO1xuICAgIHJldHVybiBzb21lUC5vckVsc2Uobm9uZVApO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZGlzY2FyZFNlY29uZChwMSwgcDIpIHtcbiAgICByZXR1cm4gcGFyc2VyKHN0ciA9PiB7XG4gICAgICAgIHJldHVybiBhbmRUaGVuKHAxLCBwMikuZm1hcCgoW3IxLCByMl0pID0+IHIxKS5ydW4oc3RyKTtcbiAgICB9KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRpc2NhcmRGaXJzdChwMSwgcDIpIHtcbiAgICByZXR1cm4gcGFyc2VyKHN0ciA9PiB7XG4gICAgICAgIHJldHVybiBhbmRUaGVuKHAxLCBwMikuZm1hcCgoW3IxLCByMl0pID0+IHIyKS5ydW4oc3RyKTtcbiAgICB9KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGJldHdlZW4ocDEsIHAyLCBwMykge1xuICAgIHJldHVybiBwMS5kaXNjYXJkRmlyc3QocDIpLmRpc2NhcmRTZWNvbmQocDMpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYmV0d2VlblBhcmVucyhweCkge1xuICAgIHJldHVybiBiZXR3ZWVuKHBjaGFyKCcoJyksIHB4LCBwY2hhcignKScpKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGJpbmRQKGZhbWIsIHB4KSB7XG4gICAgcmV0dXJuIHBhcnNlcihzdHIgPT4ge1xuICAgICAgICBjb25zdCByZXMgPSBweC5ydW4oc3RyKTtcbiAgICAgICAgaWYgKGlzRmFpbHVyZShyZXMpKSByZXR1cm4gcmVzO1xuICAgICAgICByZXR1cm4gZmFtYihyZXNbMF0pLnJ1bihyZXNbMV0pO1xuICAgIH0pO1xufVxuXG5mdW5jdGlvbiBfY29ucyh4KSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uICh4cykge1xuICAgICAgICByZXR1cm4gW3hdLmNvbmNhdCh4cyk7XG4gICAgfTtcbn1cblxuLy8gdGhlIHJlYWwgdGhpbmcuLi5cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZXIoZm4pIHtcbiAgICByZXR1cm4ge1xuICAgICAgICB0eXBlOiAncGFyc2VyJyxcbiAgICAgICAgcnVuKHN0cikge1xuICAgICAgICAgICAgcmV0dXJuIGZuKHN0cik7XG4gICAgICAgIH0sXG4gICAgICAgIGFwcGx5KHB4KSB7XG4gICAgICAgICAgICAvL3JldHVybiBhcHBseVAodGhpcykocHgpO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuYmluZChhbmRUaGVuKHRoaXMsIHB4KS5mbWFwKChbZiwgeF0pID0+IGYoeCkpKS5ydW47IC8vIHdlIGFyZSB0aGUgZlBcbiAgICAgICAgfSxcbiAgICAgICAgZm1hcChmYWIpIHtcbiAgICAgICAgICAgIC8vcmV0dXJuIGZtYXAoZmFiLCB0aGlzKTtcbiAgICAgICAgICAgIC8vcmV0dXJuIGJpbmRQKHN0ciA9PiByZXR1cm5QKGZhYihzdHIpKSwgdGhpcyk7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5iaW5kKHN0ciA9PiByZXR1cm5QKGZhYihzdHIpKSk7XG4gICAgICAgIH0sXG4gICAgICAgIGFuZFRoZW4ocHgpIHtcbiAgICAgICAgICAgIHJldHVybiBhbmRUaGVuKHRoaXMsIHB4KTtcbiAgICAgICAgfSxcbiAgICAgICAgb3JFbHNlKHB4KSB7XG4gICAgICAgICAgICByZXR1cm4gb3JFbHNlKHRoaXMsIHB4KTtcbiAgICAgICAgfSxcbiAgICAgICAgZGlzY2FyZEZpcnN0KHB4KSB7XG4gICAgICAgICAgICByZXR1cm4gZGlzY2FyZEZpcnN0KHRoaXMsIHB4KTtcbiAgICAgICAgfSxcbiAgICAgICAgZGlzY2FyZFNlY29uZChweCkge1xuICAgICAgICAgICAgcmV0dXJuIGRpc2NhcmRTZWNvbmQodGhpcywgcHgpO1xuICAgICAgICB9LFxuICAgICAgICBiaW5kKGZhbWIpIHtcbiAgICAgICAgICAgIHJldHVybiBiaW5kUChmYW1iLCB0aGlzKTtcbiAgICAgICAgfVxuICAgIH07XG59XG4iXX0=