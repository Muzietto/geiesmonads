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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2pzL3BhcnNlcnMuanMiXSwibmFtZXMiOlsicGNoYXIiLCJwZGlnaXQiLCJhbmRUaGVuWCIsImNob2ljZSIsImFueU9mIiwiZm1hcCIsInJldHVyblAiLCJhcHBseVB4IiwiYXBwbHlQIiwibGlmdDIiLCJzZXF1ZW5jZVAiLCJzZXF1ZW5jZVAyIiwicHN0cmluZyIsInplcm9Pck1vcmUiLCJtYW55IiwibWFueTEiLCJvcHQiLCJvcHRCb29rIiwiYmV0d2VlbiIsImJldHdlZW5QYXJlbnMiLCJiaW5kUCIsInBhcnNlciIsImNoYXJQYXJzZXIiLCJzdHIiLCJFcnJvciIsImNoYXIiLCJkaWdpdFBhcnNlciIsInBhcnNlSW50IiwiZGlnaXQiLCJyZXN1bHQiLCJwMSIsInAyIiwicmVzMSIsInJ1biIsInJlczIiLCJhbmRUaGVuIiwiYmluZCIsInBhcnNlZFZhbHVlMSIsInBhcnNlZFZhbHVlMiIsIm9yRWxzZSIsInBhcnNlcjEiLCJwYXJzZXIyIiwiX2ZhaWwiLCJfc3VjY2VlZCIsInBhcnNlcnMiLCJyZWR1Y2VSaWdodCIsInJlc3QiLCJjdXJyIiwiY2hhcnMiLCJtYXAiLCJmYWIiLCJyZXMiLCJ2YWx1ZSIsImZQIiwieFAiLCJmIiwieCIsInBhcnNlZFZhbHVlZiIsInBhcnNlZFZhbHVleCIsImZhYWIiLCJhcHBseSIsIl9jb25zIiwieSIsInNwbGl0IiwicmVzTiIsImNvbmNhdCIsInBYIiwic29tZVAiLCJub25lUCIsImRpc2NhcmRTZWNvbmQiLCJyMSIsInIyIiwiZGlzY2FyZEZpcnN0IiwicDMiLCJweCIsImZhbWIiLCJ4cyIsImZuIiwidHlwZSIsInBhcnNlZFZhbHVlIl0sIm1hcHBpbmdzIjoiOzs7Ozs7O1lBOEJnQkEsSyxHQUFBQSxLO1lBT0FDLE0sR0FBQUEsTTtZQUlBQyxRLEdBQUFBLFE7WUFpQ0FDLE0sR0FBQUEsTTtZQUlBQyxLLEdBQUFBLEs7WUFJQUMsSSxHQUFBQSxJO1lBUUFDLE8sR0FBQUEsTztZQUtBQyxPLEdBQUFBLE87WUFP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MUJHLGdCQTBCRXVDLElBMUJGLEVBMEJRO0FBQ1AsdUJBQU92RCxNQUFNdUQsSUFBTixFQUFZLElBQVosQ0FBUDtBQUNIO0FBNUJFLFNBQVA7QUE4QkgiLCJmaWxlIjoicGFyc2Vycy5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vIGNmci4gXCJVbmRlcnN0YW5kaW5nIFBhcnNlciBDb21iaW5hdG9yc1wiIChGIyBmb3IgRnVuIGFuZCBQcm9maXQpXG5cbmltcG9ydCB7XG4gICAgaGVhZCxcbiAgICB0YWlsLFxuICAgIGlzU3VjY2VzcyxcbiAgICBpc0ZhaWx1cmUsXG59IGZyb20gJ3V0aWwnO1xuaW1wb3J0IHtcbiAgICBwYWlyLFxuICAgIHN1Y2Nlc3MsXG4gICAgZmFpbHVyZSxcbiAgICBzb21lLFxuICAgIG5vbmUsXG59IGZyb20gJ2NsYXNzZXMnO1xuXG5jb25zdCBjaGFyUGFyc2VyID0gY2hhciA9PiBzdHIgPT4ge1xuICAgIGlmICgnJyA9PT0gc3RyKSB0aHJvdyBuZXcgRXJyb3IoJ3JlYWNoZWQgZW5kIG9mIGNoYXIgc3RyZWFtJyk7XG4gICAgaWYgKGhlYWQoc3RyKSA9PT0gY2hhcikgcmV0dXJuIHN1Y2Nlc3MoY2hhciwgdGFpbChzdHIpKTtcbiAgICByZXR1cm4gZmFpbHVyZSgnd2FudGVkICcgKyBjaGFyICsgJzsgZ290ICcgKyBoZWFkKHN0ciksIHN0cik7XG59O1xuXG5jb25zdCBkaWdpdFBhcnNlciA9IGRpZ2l0ID0+IHN0ciA9PiB7XG4gICAgaWYgKCcnID09PSBzdHIpIHRocm93IG5ldyBFcnJvcigncmVhY2hlZCBlbmQgb2YgY2hhciBzdHJlYW0nKTtcbiAgICBpZiAocGFyc2VJbnQoaGVhZChzdHIpLCAxMCkgPT09IGRpZ2l0KSByZXR1cm4gc3VjY2VzcyhkaWdpdCwgdGFpbChzdHIpKTtcbiAgICByZXR1cm4gZmFpbHVyZSgnd2FudGVkICcgKyBkaWdpdCArICc7IGdvdCAnICsgaGVhZChzdHIpLCBzdHIpO1xufTtcblxuZXhwb3J0IHtjaGFyUGFyc2VyLCBkaWdpdFBhcnNlcn07XG5cbmV4cG9ydCBmdW5jdGlvbiBwY2hhcihjaGFyKSB7XG4gICAgbGV0IHJlc3VsdCA9IGZ1bmN0aW9uIChzdHIpIHtcbiAgICAgICAgcmV0dXJuIGNoYXJQYXJzZXIoY2hhcikoc3RyKTtcbiAgICB9O1xuICAgIHJldHVybiBwYXJzZXIocmVzdWx0KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHBkaWdpdChkaWdpdCkge1xuICAgIHJldHVybiBwYXJzZXIoc3RyID0+IGRpZ2l0UGFyc2VyKGRpZ2l0KShzdHIpKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGFuZFRoZW5YKHAxLCBwMikge1xuICAgIHJldHVybiBwYXJzZXIoZnVuY3Rpb24gKHN0cikge1xuICAgICAgICBsZXQgcmVzMSA9IHAxLnJ1bihzdHIpO1xuICAgICAgICBpZiAoaXNTdWNjZXNzKHJlczEpKSB7XG4gICAgICAgICAgICBsZXQgcmVzMiA9IHAyLnJ1bihyZXMxWzFdKTtcbiAgICAgICAgICAgIGlmIChpc1N1Y2Nlc3MocmVzMikpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gc3VjY2VzcyhwYWlyKHJlczFbMF0sIHJlczJbMF0pLCByZXMyWzFdKTtcbiAgICAgICAgICAgIH0gZWxzZSByZXR1cm4gcmVzMjtcbiAgICAgICAgfSBlbHNlIHJldHVybiByZXMxO1xuICAgIH0pO1xufVxuXG4vLyB1c2luZyBiaW5kXG5leHBvcnQgZnVuY3Rpb24gYW5kVGhlbihwMSwgcDIpIHtcbiAgICByZXR1cm4gcDEuYmluZChwYXJzZWRWYWx1ZTEgPT4ge1xuICAgICAgICByZXR1cm4gcDIuYmluZChwYXJzZWRWYWx1ZTIgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHJldHVyblAocGFpcihwYXJzZWRWYWx1ZTEsIHBhcnNlZFZhbHVlMikpO1xuICAgICAgICB9KTtcbiAgICB9KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG9yRWxzZShwYXJzZXIxLCBwYXJzZXIyKSB7XG4gICAgcmV0dXJuIHBhcnNlcihzdHIgPT4ge1xuICAgICAgICBsZXQgcmVzMSA9IHBhcnNlcjEucnVuKHN0cik7XG4gICAgICAgIHJldHVybiAoaXNTdWNjZXNzKHJlczEpKSA/IHJlczEgOiBwYXJzZXIyLnJ1bihzdHIpO1xuICAgIH0pO1xufVxuXG5sZXQgX2ZhaWwgPSBwYXJzZXIoc3RyID0+IGZhaWx1cmUoJ3BhcnNpbmcgZmFpbGVkJywgc3RyKSk7XG5cbi8vIHJldHVybiBuZXV0cmFsIGVsZW1lbnQgaW5zdGVhZCBvZiBtZXNzYWdlXG5sZXQgX3N1Y2NlZWQgPSBwYXJzZXIoc3RyID0+IHN1Y2Nlc3MoJ3BhcnNpbmcgc3VjY2VlZGVkJywgc3RyKSk7XG5cbmV4cG9ydCBmdW5jdGlvbiBjaG9pY2UocGFyc2Vycykge1xuICAgIHJldHVybiBwYXJzZXJzLnJlZHVjZVJpZ2h0KChyZXN0LCBjdXJyKSA9PiBvckVsc2UoY3VyciwgcmVzdCksIF9mYWlsKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGFueU9mKGNoYXJzKSB7XG4gICAgcmV0dXJuIGNob2ljZShjaGFycy5tYXAocGNoYXIpKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGZtYXAoZmFiLCBwYXJzZXIxKSB7XG4gICAgcmV0dXJuIHBhcnNlcihzdHIgPT4ge1xuICAgICAgICBsZXQgcmVzID0gcGFyc2VyMS5ydW4oc3RyKTtcbiAgICAgICAgaWYgKGlzU3VjY2VzcyhyZXMpKSByZXR1cm4gc3VjY2VzcyhmYWIocmVzWzBdKSwgcmVzWzFdKTtcbiAgICAgICAgcmV0dXJuIHJlcztcbiAgICB9KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJldHVyblAodmFsdWUpIHtcbiAgICByZXR1cm4gcGFyc2VyKHN0ciA9PiBzdWNjZXNzKHZhbHVlLCBzdHIpKTtcbn1cblxuLy8gcGFyc2VyKGEgLT4gYikgLT4gcGFyc2VyKGEpIC0+IHBhcnNlcihiKVxuZXhwb3J0IGZ1bmN0aW9uIGFwcGx5UHgoZlApIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKHhQKSB7XG4gICAgICAgIHJldHVybiBhbmRUaGVuKGZQLCB4UCkuZm1hcCgoW2YsIHhdKSA9PiBmKHgpKTtcbiAgICB9O1xufVxuXG4vLyB1c2luZyBiaW5kXG5leHBvcnQgZnVuY3Rpb24gYXBwbHlQKGZQKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uICh4UCkge1xuICAgICAgICByZXR1cm4gZlAuYmluZChwYXJzZWRWYWx1ZWYgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHhQLmJpbmQocGFyc2VkVmFsdWV4ID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmV0dXJuUChwYXJzZWRWYWx1ZWYocGFyc2VkVmFsdWV4KSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGxpZnQyKGZhYWIpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKHBhcnNlcjEpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChwYXJzZXIyKSB7XG4gICAgICAgICAgICAvL3JldHVybiBhcHBseVAoYXBwbHlQKHJldHVyblAoZmFhYikpKHBhcnNlcjEpKShwYXJzZXIyKTtcbiAgICAgICAgICAgIHJldHVybiByZXR1cm5QKGZhYWIpLmFwcGx5KHBhcnNlcjEpLmFwcGx5KHBhcnNlcjIpOyAvLyB1c2luZyBpbnN0YW5jZSBtZXRob2RzXG4gICAgICAgIH07XG4gICAgfTtcbn1cblxuLy8gdXNpbmcgbGlmdDIoY29ucylcbmV4cG9ydCBmdW5jdGlvbiBzZXF1ZW5jZVAocGFyc2Vycykge1xuICAgIHJldHVybiBwYXJzZXJzXG4gICAgICAgIC5yZWR1Y2VSaWdodCgocmVzdCwgY3VycikgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIGxpZnQyKF9jb25zKShjdXJyKShyZXN0KTtcbiAgICAgICAgfSwgcmV0dXJuUChbXSkpO1xufVxuXG4vLyB1c2luZyBuYWl2ZSBhbmRUaGVuICYmIGZtYXAgLS0+IHJldHVybnMgc3RyaW5ncywgbm90IGFycmF5cyFcbmV4cG9ydCBmdW5jdGlvbiBzZXF1ZW5jZVAyKHBhcnNlcnMpIHtcbiAgICByZXR1cm4gcGFyc2Vyc1xuICAgICAgICAucmVkdWNlUmlnaHQoKHJlc3QsIGN1cnIpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBmbWFwKChbeCwgeV0pID0+IHggKyB5LCBhbmRUaGVuKGN1cnIsIHJlc3QpKTtcbiAgICAgICAgfSwgcmV0dXJuUCgnJykpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcHN0cmluZyhzdHIpIHtcbiAgICByZXR1cm4gc2VxdWVuY2VQKHN0ci5zcGxpdCgnJykubWFwKHBjaGFyKSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB6ZXJvT3JNb3JlKHhQKSB7IC8vIHplcm9Pck1vcmUgOjogcCBhIC0+IFthXSAtPiB0cnkgW2FdID0gcCBhIC0+IHAgW2FdXG4gICAgcmV0dXJuIHN0ciA9PiB7XG4gICAgICAgIGxldCByZXMxID0geFAucnVuKHN0cik7XG4gICAgICAgIGlmIChpc0ZhaWx1cmUocmVzMSkpIHJldHVybiBzdWNjZXNzKFtdLCBzdHIpO1xuICAgICAgICBsZXQgcmVzTiA9IHplcm9Pck1vcmUoeFApKHJlczFbMV0pO1xuICAgICAgICByZXR1cm4gc3VjY2VzcyhbcmVzMVswXV0uY29uY2F0KHJlc05bMF0pLCByZXNOWzFdKTtcbiAgICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbWFueSh4UCkge1xuICAgIHJldHVybiBwYXJzZXIoc3RyID0+IHtcbiAgICAgICAgcmV0dXJuIHplcm9Pck1vcmUoeFApKHN0cik7XG4gICAgfSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtYW55MSh4UCkge1xuICAgIHJldHVybiBwYXJzZXIoc3RyID0+IHtcbiAgICAgICAgbGV0IHJlczEgPSB4UC5ydW4oc3RyKTtcbiAgICAgICAgaWYgKGlzRmFpbHVyZShyZXMxKSkgcmV0dXJuIHJlczE7XG4gICAgICAgIGxldCByZXNOID0gemVyb09yTW9yZSh4UCkocmVzMVsxXSk7XG4gICAgICAgIHJldHVybiBzdWNjZXNzKFtyZXMxWzBdXS5jb25jYXQocmVzTlswXSksIHJlc05bMV0pO1xuICAgIH0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gb3B0KHhQKSB7XG4gICAgcmV0dXJuIHBhcnNlcihzdHIgPT4ge1xuICAgICAgICBsZXQgcmVzID0geFAuZm1hcCh4ID0+IHNvbWUoeCkpLnJ1bihzdHIpO1xuICAgICAgICBpZiAoaXNTdWNjZXNzKHJlcykpIHJldHVybiByZXM7XG4gICAgICAgIHJldHVybiBzdWNjZXNzKG5vbmUoKSwgc3RyKTtcbiAgICB9KTtcbn1cblxuLy8gb3B0IGZyb20gdGhlIGJvb2tcbmV4cG9ydCBmdW5jdGlvbiBvcHRCb29rKHBYKSB7XG4gICAgY29uc3Qgc29tZVAgPSBwWC5mbWFwKHNvbWUpO1xuICAgIGNvbnN0IG5vbmVQID0gcmV0dXJuUChub25lKTtcbiAgICByZXR1cm4gc29tZVAub3JFbHNlKG5vbmVQKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRpc2NhcmRTZWNvbmQocDEsIHAyKSB7XG4gICAgcmV0dXJuIHBhcnNlcihzdHIgPT4ge1xuICAgICAgICByZXR1cm4gYW5kVGhlbihwMSwgcDIpLmZtYXAoKFtyMSwgcjJdKSA9PiByMSkucnVuKHN0cik7XG4gICAgfSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBkaXNjYXJkRmlyc3QocDEsIHAyKSB7XG4gICAgcmV0dXJuIHBhcnNlcihzdHIgPT4ge1xuICAgICAgICByZXR1cm4gYW5kVGhlbihwMSwgcDIpLmZtYXAoKFtyMSwgcjJdKSA9PiByMikucnVuKHN0cik7XG4gICAgfSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBiZXR3ZWVuKHAxLCBwMiwgcDMpIHtcbiAgICByZXR1cm4gcDEuZGlzY2FyZEZpcnN0KHAyKS5kaXNjYXJkU2Vjb25kKHAzKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGJldHdlZW5QYXJlbnMocHgpIHtcbiAgICByZXR1cm4gYmV0d2VlbihwY2hhcignKCcpLCBweCwgcGNoYXIoJyknKSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBiaW5kUChmYW1iLCBweCkge1xuICAgIHJldHVybiBwYXJzZXIoc3RyID0+IHtcbiAgICAgICAgY29uc3QgcmVzID0gcHgucnVuKHN0cik7XG4gICAgICAgIGlmIChpc0ZhaWx1cmUocmVzKSkgcmV0dXJuIHJlcztcbiAgICAgICAgcmV0dXJuIGZhbWIocmVzWzBdKS5ydW4ocmVzWzFdKTtcbiAgICB9KTtcbn1cblxuZnVuY3Rpb24gX2NvbnMoeCkge1xuICAgIHJldHVybiBmdW5jdGlvbiAoeHMpIHtcbiAgICAgICAgcmV0dXJuIFt4XS5jb25jYXQoeHMpO1xuICAgIH07XG59XG5cbi8vIHRoZSByZWFsIHRoaW5nLi4uXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VyKGZuKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgdHlwZTogJ3BhcnNlcicsXG4gICAgICAgIHJ1bihzdHIpIHtcbiAgICAgICAgICAgIHJldHVybiBmbihzdHIpO1xuICAgICAgICB9LFxuICAgICAgICBhcHBseShweCkge1xuICAgICAgICAgICAgcmV0dXJuIGFwcGx5UCh0aGlzKShweCk7XG4gICAgICAgICAgICAvL3JldHVybiB0aGlzLmJpbmQoYW5kVGhlbih0aGlzLCBweCkuZm1hcCgoW2YsIHhdKSA9PiBmKHgpKSkucnVuOyAvLyB3ZSBhcmUgdGhlIGZQXG4gICAgICAgIH0sXG4gICAgICAgIGZtYXAoZmFiKSB7XG4gICAgICAgICAgICAvL3JldHVybiBmbWFwKGZhYiwgdGhpcyk7XG4gICAgICAgICAgICAvL3JldHVybiBiaW5kUChzdHIgPT4gcmV0dXJuUChmYWIoc3RyKSksIHRoaXMpO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuYmluZChwYXJzZWRWYWx1ZSA9PiByZXR1cm5QKGZhYihwYXJzZWRWYWx1ZSkpKTtcbiAgICAgICAgfSxcbiAgICAgICAgYW5kVGhlbihweCkge1xuICAgICAgICAgICAgcmV0dXJuIGFuZFRoZW4odGhpcywgcHgpO1xuICAgICAgICB9LFxuICAgICAgICBvckVsc2UocHgpIHtcbiAgICAgICAgICAgIHJldHVybiBvckVsc2UodGhpcywgcHgpO1xuICAgICAgICB9LFxuICAgICAgICBkaXNjYXJkRmlyc3QocHgpIHtcbiAgICAgICAgICAgIHJldHVybiBkaXNjYXJkRmlyc3QodGhpcywgcHgpO1xuICAgICAgICB9LFxuICAgICAgICBkaXNjYXJkU2Vjb25kKHB4KSB7XG4gICAgICAgICAgICByZXR1cm4gZGlzY2FyZFNlY29uZCh0aGlzLCBweCk7XG4gICAgICAgIH0sXG4gICAgICAgIGJpbmQoZmFtYikge1xuICAgICAgICAgICAgcmV0dXJuIGJpbmRQKGZhbWIsIHRoaXMpO1xuICAgICAgICB9XG4gICAgfTtcbn1cbiJdfQ==