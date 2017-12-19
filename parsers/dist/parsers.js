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

    // using bind
    function _andThen(p1, p2) {
        return p1.bind(function (parsedValue1) {
            return p2.bind(function (parsedValue2) {
                return returnP((0, _classes.pair)(parsedValue1, parsedValue2));
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
            }
        };
    }
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2pzL3BhcnNlcnMuanMiXSwibmFtZXMiOlsicGNoYXIiLCJwZGlnaXQiLCJhbmRUaGVuWCIsImNob2ljZSIsImFueU9mIiwiZm1hcCIsInJldHVyblAiLCJhcHBseVB4IiwiYXBwbHlQIiwibGlmdDIiLCJzZXF1ZW5jZVAiLCJzZXF1ZW5jZVAyIiwicHN0cmluZyIsInplcm9Pck1vcmUiLCJtYW55IiwibWFueTEiLCJvcHQiLCJvcHRCb29rIiwiYmV0d2VlbiIsImJldHdlZW5QYXJlbnMiLCJiaW5kUCIsInBhcnNlciIsImNoYXJQYXJzZXIiLCJzdHIiLCJFcnJvciIsImNoYXIiLCJkaWdpdFBhcnNlciIsInBhcnNlSW50IiwiZGlnaXQiLCJyZXN1bHQiLCJwMSIsInAyIiwicmVzMSIsInJ1biIsInJlczIiLCJhbmRUaGVuIiwiYmluZCIsInBhcnNlZFZhbHVlMSIsInBhcnNlZFZhbHVlMiIsIm9yRWxzZSIsInBhcnNlcjEiLCJwYXJzZXIyIiwiX2ZhaWwiLCJfc3VjY2VlZCIsInBhcnNlcnMiLCJyZWR1Y2VSaWdodCIsInJlc3QiLCJjdXJyIiwiY2hhcnMiLCJtYXAiLCJmYWIiLCJyZXMiLCJ2YWx1ZSIsImZQIiwieFAiLCJmIiwieCIsInBhcnNlZFZhbHVlZiIsInBhcnNlZFZhbHVleCIsImZhYWIiLCJhcHBseSIsIl9jb25zIiwieSIsInNwbGl0IiwicmVzTiIsImNvbmNhdCIsInplcm9Pck1vcmVYIiwicFgiLCJzb21lUCIsIm5vbmVQIiwiZGlzY2FyZFNlY29uZCIsInIxIiwicjIiLCJkaXNjYXJkRmlyc3QiLCJwMyIsInB4IiwiZmFtYiIsInhzIiwiZm4iLCJ0eXBlIiwicGFyc2VkVmFsdWUiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7WUE4QmdCQSxLLEdBQUFBLEs7WUFPQUMsTSxHQUFBQSxNO1lBSUFDLFEsR0FBQUEsUTtZQWtDQUMsTSxHQUFBQSxNO1lBSUFDLEssR0FBQUEsSztZQUlBQyxJLEdBQUFBLEk7WUFRQUMsTyxHQUFBQSxPO1lBS0FD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QkFBVixDQUFQO0FBQ0gsYUFiRTtBQWNIN0MsbUJBZEcsbUJBY0t3QyxFQWRMLEVBY1M7QUFDUix1QkFBT3hDLFNBQVEsSUFBUixFQUFjd0MsRUFBZCxDQUFQO0FBQ0gsYUFoQkU7QUFpQkhwQyxrQkFqQkcsa0JBaUJJb0MsRUFqQkosRUFpQlE7QUFDUCx1QkFBT3BDLFFBQU8sSUFBUCxFQUFhb0MsRUFBYixDQUFQO0FBQ0gsYUFuQkU7QUFvQkhGLHdCQXBCRyx3QkFvQlVFLEVBcEJWLEVBb0JjO0FBQ2IsdUJBQU9GLGNBQWEsSUFBYixFQUFtQkUsRUFBbkIsQ0FBUDtBQUNILGFBdEJFO0FBdUJITCx5QkF2QkcseUJBdUJXSyxFQXZCWCxFQXVCZTtBQUNkLHVCQUFPTCxlQUFjLElBQWQsRUFBb0JLLEVBQXBCLENBQVA7QUFDSCxhQXpCRTtBQTBCSHZDLGdCQTFCRyxnQkEwQkV3QyxJQTFCRixFQTBCUTtBQUNQLHVCQUFPeEQsTUFBTXdELElBQU4sRUFBWSxJQUFaLENBQVA7QUFDSDtBQTVCRSxTQUFQO0FBOEJIIiwiZmlsZSI6InBhcnNlcnMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBjZnIuIFwiVW5kZXJzdGFuZGluZyBQYXJzZXIgQ29tYmluYXRvcnNcIiAoRiMgZm9yIEZ1biBhbmQgUHJvZml0KVxuXG5pbXBvcnQge1xuICAgIGhlYWQsXG4gICAgdGFpbCxcbiAgICBpc1N1Y2Nlc3MsXG4gICAgaXNGYWlsdXJlLFxufSBmcm9tICd1dGlsJztcbmltcG9ydCB7XG4gICAgcGFpcixcbiAgICBzdWNjZXNzLFxuICAgIGZhaWx1cmUsXG4gICAgc29tZSxcbiAgICBub25lLFxufSBmcm9tICdjbGFzc2VzJztcblxuY29uc3QgY2hhclBhcnNlciA9IGNoYXIgPT4gc3RyID0+IHtcbiAgICBpZiAoJycgPT09IHN0cikgdGhyb3cgbmV3IEVycm9yKCdyZWFjaGVkIGVuZCBvZiBjaGFyIHN0cmVhbScpO1xuICAgIGlmIChoZWFkKHN0cikgPT09IGNoYXIpIHJldHVybiBzdWNjZXNzKGNoYXIsIHRhaWwoc3RyKSk7XG4gICAgcmV0dXJuIGZhaWx1cmUoJ3dhbnRlZCAnICsgY2hhciArICc7IGdvdCAnICsgaGVhZChzdHIpLCBzdHIpO1xufTtcblxuY29uc3QgZGlnaXRQYXJzZXIgPSBkaWdpdCA9PiBzdHIgPT4ge1xuICAgIGlmICgnJyA9PT0gc3RyKSB0aHJvdyBuZXcgRXJyb3IoJ3JlYWNoZWQgZW5kIG9mIGNoYXIgc3RyZWFtJyk7XG4gICAgaWYgKHBhcnNlSW50KGhlYWQoc3RyKSwgMTApID09PSBkaWdpdCkgcmV0dXJuIHN1Y2Nlc3MoZGlnaXQsIHRhaWwoc3RyKSk7XG4gICAgcmV0dXJuIGZhaWx1cmUoJ3dhbnRlZCAnICsgZGlnaXQgKyAnOyBnb3QgJyArIGhlYWQoc3RyKSwgc3RyKTtcbn07XG5cbmV4cG9ydCB7Y2hhclBhcnNlciwgZGlnaXRQYXJzZXJ9O1xuXG5leHBvcnQgZnVuY3Rpb24gcGNoYXIoY2hhcikge1xuICAgIGxldCByZXN1bHQgPSBmdW5jdGlvbiAoc3RyKSB7XG4gICAgICAgIHJldHVybiBjaGFyUGFyc2VyKGNoYXIpKHN0cik7XG4gICAgfTtcbiAgICByZXR1cm4gcGFyc2VyKHJlc3VsdCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwZGlnaXQoZGlnaXQpIHtcbiAgICByZXR1cm4gcGFyc2VyKHN0ciA9PiBkaWdpdFBhcnNlcihkaWdpdCkoc3RyKSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhbmRUaGVuWChwMSwgcDIpIHtcbiAgICByZXR1cm4gcGFyc2VyKGZ1bmN0aW9uIChzdHIpIHtcbiAgICAgICAgbGV0IHJlczEgPSBwMS5ydW4oc3RyKTtcbiAgICAgICAgaWYgKGlzU3VjY2VzcyhyZXMxKSkge1xuICAgICAgICAgICAgbGV0IHJlczIgPSBwMi5ydW4ocmVzMVsxXSk7XG4gICAgICAgICAgICByZXR1cm4gcmV0dXJuUCgpXG4gICAgICAgICAgICBpZiAoaXNTdWNjZXNzKHJlczIpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHN1Y2Nlc3MocGFpcihyZXMxWzBdLCByZXMyWzBdKSwgcmVzMlsxXSk7XG4gICAgICAgICAgICB9IGVsc2UgcmV0dXJuIHJlczI7XG4gICAgICAgIH0gZWxzZSByZXR1cm4gcmVzMTtcbiAgICB9KTtcbn1cblxuLy8gdXNpbmcgYmluZFxuZXhwb3J0IGZ1bmN0aW9uIGFuZFRoZW4ocDEsIHAyKSB7XG4gICAgcmV0dXJuIHAxLmJpbmQocGFyc2VkVmFsdWUxID0+IHtcbiAgICAgICAgcmV0dXJuIHAyLmJpbmQocGFyc2VkVmFsdWUyID0+IHtcbiAgICAgICAgICAgIHJldHVybiByZXR1cm5QKHBhaXIocGFyc2VkVmFsdWUxLCBwYXJzZWRWYWx1ZTIpKTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBvckVsc2UocGFyc2VyMSwgcGFyc2VyMikge1xuICAgIHJldHVybiBwYXJzZXIoc3RyID0+IHtcbiAgICAgICAgbGV0IHJlczEgPSBwYXJzZXIxLnJ1bihzdHIpO1xuICAgICAgICByZXR1cm4gKGlzU3VjY2VzcyhyZXMxKSkgPyByZXMxIDogcGFyc2VyMi5ydW4oc3RyKTtcbiAgICB9KTtcbn1cblxubGV0IF9mYWlsID0gcGFyc2VyKHN0ciA9PiBmYWlsdXJlKCdwYXJzaW5nIGZhaWxlZCcsIHN0cikpO1xuXG4vLyByZXR1cm4gbmV1dHJhbCBlbGVtZW50IGluc3RlYWQgb2YgbWVzc2FnZVxubGV0IF9zdWNjZWVkID0gcGFyc2VyKHN0ciA9PiBzdWNjZXNzKCdwYXJzaW5nIHN1Y2NlZWRlZCcsIHN0cikpO1xuXG5leHBvcnQgZnVuY3Rpb24gY2hvaWNlKHBhcnNlcnMpIHtcbiAgICByZXR1cm4gcGFyc2Vycy5yZWR1Y2VSaWdodCgocmVzdCwgY3VycikgPT4gb3JFbHNlKGN1cnIsIHJlc3QpLCBfZmFpbCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhbnlPZihjaGFycykge1xuICAgIHJldHVybiBjaG9pY2UoY2hhcnMubWFwKHBjaGFyKSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBmbWFwKGZhYiwgcGFyc2VyMSkge1xuICAgIHJldHVybiBwYXJzZXIoc3RyID0+IHtcbiAgICAgICAgbGV0IHJlcyA9IHBhcnNlcjEucnVuKHN0cik7XG4gICAgICAgIGlmIChpc1N1Y2Nlc3MocmVzKSkgcmV0dXJuIHN1Y2Nlc3MoZmFiKHJlc1swXSksIHJlc1sxXSk7XG4gICAgICAgIHJldHVybiByZXM7XG4gICAgfSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZXR1cm5QKHZhbHVlKSB7XG4gICAgcmV0dXJuIHBhcnNlcihzdHIgPT4gc3VjY2Vzcyh2YWx1ZSwgc3RyKSk7XG59XG5cbi8vIHBhcnNlcihhIC0+IGIpIC0+IHBhcnNlcihhKSAtPiBwYXJzZXIoYilcbmV4cG9ydCBmdW5jdGlvbiBhcHBseVB4KGZQKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uICh4UCkge1xuICAgICAgICByZXR1cm4gYW5kVGhlbihmUCwgeFApLmZtYXAoKFtmLCB4XSkgPT4gZih4KSk7XG4gICAgfTtcbn1cblxuLy8gdXNpbmcgYmluZFxuZXhwb3J0IGZ1bmN0aW9uIGFwcGx5UChmUCkge1xuICAgIHJldHVybiBmdW5jdGlvbiAoeFApIHtcbiAgICAgICAgcmV0dXJuIGZQLmJpbmQocGFyc2VkVmFsdWVmID0+IHtcbiAgICAgICAgICAgIHJldHVybiB4UC5iaW5kKHBhcnNlZFZhbHVleCA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJldHVyblAocGFyc2VkVmFsdWVmKHBhcnNlZFZhbHVleCkpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBsaWZ0MihmYWFiKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uIChwYXJzZXIxKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAocGFyc2VyMikge1xuICAgICAgICAgICAgLy9yZXR1cm4gYXBwbHlQKGFwcGx5UChyZXR1cm5QKGZhYWIpKShwYXJzZXIxKSkocGFyc2VyMik7XG4gICAgICAgICAgICByZXR1cm4gcmV0dXJuUChmYWFiKS5hcHBseShwYXJzZXIxKS5hcHBseShwYXJzZXIyKTsgLy8gdXNpbmcgaW5zdGFuY2UgbWV0aG9kc1xuICAgICAgICB9O1xuICAgIH07XG59XG5cbi8vIHVzaW5nIGxpZnQyKGNvbnMpXG5leHBvcnQgZnVuY3Rpb24gc2VxdWVuY2VQKHBhcnNlcnMpIHtcbiAgICByZXR1cm4gcGFyc2Vyc1xuICAgICAgICAucmVkdWNlUmlnaHQoKHJlc3QsIGN1cnIpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBsaWZ0MihfY29ucykoY3VycikocmVzdCk7XG4gICAgICAgIH0sIHJldHVyblAoW10pKTtcbn1cblxuLy8gdXNpbmcgbmFpdmUgYW5kVGhlbiAmJiBmbWFwIC0tPiByZXR1cm5zIHN0cmluZ3MsIG5vdCBhcnJheXMhXG5leHBvcnQgZnVuY3Rpb24gc2VxdWVuY2VQMihwYXJzZXJzKSB7XG4gICAgcmV0dXJuIHBhcnNlcnNcbiAgICAgICAgLnJlZHVjZVJpZ2h0KChyZXN0LCBjdXJyKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gZm1hcCgoW3gsIHldKSA9PiB4ICsgeSwgYW5kVGhlbihjdXJyLCByZXN0KSk7XG4gICAgICAgIH0sIHJldHVyblAoJycpKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHBzdHJpbmcoc3RyKSB7XG4gICAgcmV0dXJuIHNlcXVlbmNlUChzdHIuc3BsaXQoJycpLm1hcChwY2hhcikpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gemVyb09yTW9yZSh4UCkgeyAvLyB6ZXJvT3JNb3JlIDo6IHAgYSAtPiBbYV0gLT4gdHJ5IFthXSA9IHAgYSAtPiBwIFthXVxuICAgIHJldHVybiBzdHIgPT4ge1xuICAgICAgICBsZXQgcmVzMSA9IHhQLnJ1bihzdHIpO1xuICAgICAgICBpZiAoaXNGYWlsdXJlKHJlczEpKSByZXR1cm4gc3VjY2VzcyhbXSwgc3RyKTtcbiAgICAgICAgbGV0IHJlc04gPSB6ZXJvT3JNb3JlKHhQKShyZXMxWzFdKTtcbiAgICAgICAgcmV0dXJuIHN1Y2Nlc3MoW3JlczFbMF1dLmNvbmNhdChyZXNOWzBdKSwgcmVzTlsxXSk7XG4gICAgfTtcbn1cblxuLy8gbm90IHdvcmtpbmcgIDotKFxuZnVuY3Rpb24gemVyb09yTW9yZVgoeFApIHsgLy8gemVyb09yTW9yZVggOjogcCBhIC0+IHAoYSAtPiBwIFthXSkgISEhXG4gICAgcmV0dXJuIHBhcnNlcihzdHIgPT4ge1xuICAgICAgICBsZXQgcmVzID0geFAucnVuKHN0cik7XG4gICAgICAgIGlmIChpc0ZhaWx1cmUocmVzKSkgcmV0dXJuIHN1Y2Nlc3MoW10sIHN0cik7XG4gICAgICAgIC8vIG5leHQgbGluZSByZXR1cm5zIGEgcGFyc2VyICh3cm9uZywgd3JvbmcsIHdyb25nLi4uKVxuICAgICAgICByZXR1cm4gbGlmdDIoX2NvbnMpKHJldHVyblAocmVzWzBdKSkoemVyb09yTW9yZVgoeFApLnJ1bihyZXNbMV0pKTtcbiAgICB9KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1hbnkoeFApIHtcbiAgICByZXR1cm4gcGFyc2VyKHN0ciA9PiB7XG4gICAgICAgIHJldHVybiB6ZXJvT3JNb3JlKHhQKShzdHIpO1xuICAgIH0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbWFueTEoeFApIHtcbiAgICByZXR1cm4gcGFyc2VyKHN0ciA9PiB7XG4gICAgICAgIGxldCByZXMxID0geFAucnVuKHN0cik7XG4gICAgICAgIGlmIChpc0ZhaWx1cmUocmVzMSkpIHJldHVybiByZXMxO1xuICAgICAgICBsZXQgcmVzTiA9IHplcm9Pck1vcmUoeFApKHJlczFbMV0pO1xuICAgICAgICByZXR1cm4gc3VjY2VzcyhbcmVzMVswXV0uY29uY2F0KHJlc05bMF0pLCByZXNOWzFdKTtcbiAgICB9KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG9wdCh4UCkge1xuICAgIHJldHVybiBwYXJzZXIoc3RyID0+IHtcbiAgICAgICAgbGV0IHJlcyA9IHhQLmZtYXAoeCA9PiBzb21lKHgpKS5ydW4oc3RyKTtcbiAgICAgICAgaWYgKGlzU3VjY2VzcyhyZXMpKSByZXR1cm4gcmVzO1xuICAgICAgICByZXR1cm4gc3VjY2Vzcyhub25lKCksIHN0cik7XG4gICAgfSk7XG59XG5cbi8vIG9wdCBmcm9tIHRoZSBib29rXG5leHBvcnQgZnVuY3Rpb24gb3B0Qm9vayhwWCkge1xuICAgIGNvbnN0IHNvbWVQID0gcFguZm1hcChzb21lKTtcbiAgICBjb25zdCBub25lUCA9IHJldHVyblAobm9uZSk7XG4gICAgcmV0dXJuIHNvbWVQLm9yRWxzZShub25lUCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBkaXNjYXJkU2Vjb25kKHAxLCBwMikge1xuICAgIHJldHVybiBwYXJzZXIoc3RyID0+IHtcbiAgICAgICAgcmV0dXJuIGFuZFRoZW4ocDEsIHAyKS5mbWFwKChbcjEsIHIyXSkgPT4gcjEpLnJ1bihzdHIpO1xuICAgIH0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZGlzY2FyZEZpcnN0KHAxLCBwMikge1xuICAgIHJldHVybiBwYXJzZXIoc3RyID0+IHtcbiAgICAgICAgcmV0dXJuIGFuZFRoZW4ocDEsIHAyKS5mbWFwKChbcjEsIHIyXSkgPT4gcjIpLnJ1bihzdHIpO1xuICAgIH0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYmV0d2VlbihwMSwgcDIsIHAzKSB7XG4gICAgcmV0dXJuIHAxLmRpc2NhcmRGaXJzdChwMikuZGlzY2FyZFNlY29uZChwMyk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBiZXR3ZWVuUGFyZW5zKHB4KSB7XG4gICAgcmV0dXJuIGJldHdlZW4ocGNoYXIoJygnKSwgcHgsIHBjaGFyKCcpJykpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYmluZFAoZmFtYiwgcHgpIHtcbiAgICByZXR1cm4gcGFyc2VyKHN0ciA9PiB7XG4gICAgICAgIGNvbnN0IHJlcyA9IHB4LnJ1bihzdHIpO1xuICAgICAgICBpZiAoaXNGYWlsdXJlKHJlcykpIHJldHVybiByZXM7XG4gICAgICAgIHJldHVybiBmYW1iKHJlc1swXSkucnVuKHJlc1sxXSk7XG4gICAgfSk7XG59XG5cbmZ1bmN0aW9uIF9jb25zKHgpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKHhzKSB7XG4gICAgICAgIHJldHVybiBbeF0uY29uY2F0KHhzKTtcbiAgICB9O1xufVxuXG4vLyB0aGUgcmVhbCB0aGluZy4uLlxuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlcihmbikge1xuICAgIHJldHVybiB7XG4gICAgICAgIHR5cGU6ICdwYXJzZXInLFxuICAgICAgICBydW4oc3RyKSB7XG4gICAgICAgICAgICByZXR1cm4gZm4oc3RyKTtcbiAgICAgICAgfSxcbiAgICAgICAgYXBwbHkocHgpIHtcbiAgICAgICAgICAgIHJldHVybiBhcHBseVAodGhpcykocHgpO1xuICAgICAgICAgICAgLy9yZXR1cm4gdGhpcy5iaW5kKGFuZFRoZW4odGhpcywgcHgpLmZtYXAoKFtmLCB4XSkgPT4gZih4KSkpLnJ1bjsgLy8gd2UgYXJlIHRoZSBmUFxuICAgICAgICB9LFxuICAgICAgICBmbWFwKGZhYikge1xuICAgICAgICAgICAgLy9yZXR1cm4gZm1hcChmYWIsIHRoaXMpO1xuICAgICAgICAgICAgLy9yZXR1cm4gYmluZFAoc3RyID0+IHJldHVyblAoZmFiKHN0cikpLCB0aGlzKTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmJpbmQocGFyc2VkVmFsdWUgPT4gcmV0dXJuUChmYWIocGFyc2VkVmFsdWUpKSk7XG4gICAgICAgIH0sXG4gICAgICAgIGFuZFRoZW4ocHgpIHtcbiAgICAgICAgICAgIHJldHVybiBhbmRUaGVuKHRoaXMsIHB4KTtcbiAgICAgICAgfSxcbiAgICAgICAgb3JFbHNlKHB4KSB7XG4gICAgICAgICAgICByZXR1cm4gb3JFbHNlKHRoaXMsIHB4KTtcbiAgICAgICAgfSxcbiAgICAgICAgZGlzY2FyZEZpcnN0KHB4KSB7XG4gICAgICAgICAgICByZXR1cm4gZGlzY2FyZEZpcnN0KHRoaXMsIHB4KTtcbiAgICAgICAgfSxcbiAgICAgICAgZGlzY2FyZFNlY29uZChweCkge1xuICAgICAgICAgICAgcmV0dXJuIGRpc2NhcmRTZWNvbmQodGhpcywgcHgpO1xuICAgICAgICB9LFxuICAgICAgICBiaW5kKGZhbWIpIHtcbiAgICAgICAgICAgIHJldHVybiBiaW5kUChmYW1iLCB0aGlzKTtcbiAgICAgICAgfVxuICAgIH07XG59XG4iXX0=