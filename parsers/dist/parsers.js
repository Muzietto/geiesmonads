define(['exports', 'util', 'classes'], function (exports, _util, _classes) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.discardFirst = exports.discardSecond = exports.fmap = exports.orElse = exports.andThen = exports.digitParser = exports.charParser = undefined;
    exports.pchar = pchar;
    exports.pdigit = pdigit;
    exports.choice = choice;
    exports.anyOf = anyOf;
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

    function _fmap(fab, parser1) {
        return parser(function (str) {
            var res = parser1.run(str);
            if ((0, _util.isSuccess)(res)) return (0, _classes.success)(fab(res[0]), res[1]);
            return res;
        });
    }

    exports.fmap = _fmap;
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
                return applyP(applyP(returnP(faab))(parser1))(parser2);
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
            return _fmap(function (_ref3) {
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
            fmap: function fmap(fab) {
                return _fmap(fab, this);
            },
            apply: function apply(px) {
                return applyP(this)(px);
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
            }
        };
    }
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2pzL3BhcnNlcnMuanMiXSwibmFtZXMiOlsicGNoYXIiLCJwZGlnaXQiLCJjaG9pY2UiLCJhbnlPZiIsInJldHVyblAiLCJhcHBseVAiLCJsaWZ0MiIsInNlcXVlbmNlUCIsInNlcXVlbmNlUDIiLCJwc3RyaW5nIiwiemVyb09yTW9yZSIsIm1hbnkiLCJtYW55MSIsIm9wdCIsIm9wdEJvb2siLCJiZXR3ZWVuIiwiYmV0d2VlblBhcmVucyIsInBhcnNlciIsImNoYXJQYXJzZXIiLCJzdHIiLCJFcnJvciIsImNoYXIiLCJkaWdpdFBhcnNlciIsInBhcnNlSW50IiwiZGlnaXQiLCJyZXN1bHQiLCJhbmRUaGVuIiwicGFyc2VyMSIsInBhcnNlcjIiLCJyZXMxIiwicnVuIiwicmVzMiIsIm9yRWxzZSIsIl9mYWlsIiwiX3N1Y2NlZWQiLCJwYXJzZXJzIiwicmVkdWNlUmlnaHQiLCJyZXN0IiwiY3VyciIsImNoYXJzIiwibWFwIiwiZm1hcCIsImZhYiIsInJlcyIsInZhbHVlIiwiZlAiLCJ4UCIsImYiLCJ4IiwiZmFhYiIsIl9jb25zIiwieSIsInNwbGl0IiwicmVzTiIsImNvbmNhdCIsInplcm9Pck1vcmVYIiwicFgiLCJzb21lUCIsIm5vbmVQIiwiZGlzY2FyZFNlY29uZCIsInAxIiwicDIiLCJyMSIsInIyIiwiZGlzY2FyZEZpcnN0IiwicDMiLCJweCIsInhzIiwiZm4iLCJ0eXBlIiwiYXBwbHkiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7WUE4QmdCQSxLLEdBQUFBLEs7WUFPQUMsTSxHQUFBQSxNO1lBNEJBQyxNLEdBQUFBLE07WUFJQUMsSyxHQUFBQSxLO1lBWUFDLE8sR0FBQUEsTztZQUtBQyxNLEdBQUFBLE07WUFNQUMsSyxHQUFBQSxLO1lBU0FDLFMsR0FBQUEsUztZQVFBQyxVLEdBQUFBLFU7WUFPQUMsTyxHQUFBQSxPO1lBSUFDLFUsR0FBQUEsVTtZQW1CQUMsSSxHQUFBQSxJO1lBTUFDLEssR0FBQUEsSztZQVNBQyxHLEdBQUFBLEc7WUFTQUMsTyxH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RyxrQkFjSWtDLEVBZEosRUFjUTtBQUNQLHVCQUFPbEMsUUFBTyxJQUFQLEVBQWFrQyxFQUFiLENBQVA7QUFDSCxhQWhCRTtBQWlCSEYsd0JBakJHLHdCQWlCVUUsRUFqQlYsRUFpQmM7QUFDYix1QkFBT0YsY0FBYSxJQUFiLEVBQW1CRSxFQUFuQixDQUFQO0FBQ0gsYUFuQkU7QUFvQkhQLHlCQXBCRyx5QkFvQldPLEVBcEJYLEVBb0JlO0FBQ2QsdUJBQU9QLGVBQWMsSUFBZCxFQUFvQk8sRUFBcEIsQ0FBUDtBQUNIO0FBdEJFLFNBQVA7QUF3QkgiLCJmaWxlIjoicGFyc2Vycy5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vIGNmci4gXCJVbmRlcnN0YW5kaW5nIFBhcnNlciBDb21iaW5hdG9yc1wiIChGIyBmb3IgRnVuIGFuZCBQcm9maXQpXG5cbmltcG9ydCB7XG4gICAgaGVhZCxcbiAgICB0YWlsLFxuICAgIGlzU3VjY2VzcyxcbiAgICBpc0ZhaWx1cmUsXG59IGZyb20gJ3V0aWwnO1xuaW1wb3J0IHtcbiAgICBwYWlyLFxuICAgIHN1Y2Nlc3MsXG4gICAgZmFpbHVyZSxcbiAgICBzb21lLFxuICAgIG5vbmUsXG59IGZyb20gJ2NsYXNzZXMnO1xuXG5jb25zdCBjaGFyUGFyc2VyID0gY2hhciA9PiBzdHIgPT4ge1xuICAgIGlmICgnJyA9PT0gc3RyKSB0aHJvdyBuZXcgRXJyb3IoJ3JlYWNoZWQgZW5kIG9mIGNoYXIgc3RyZWFtJyk7XG4gICAgaWYgKGhlYWQoc3RyKSA9PT0gY2hhcikgcmV0dXJuIHN1Y2Nlc3MoY2hhciwgdGFpbChzdHIpKTtcbiAgICByZXR1cm4gZmFpbHVyZSgnd2FudGVkICcgKyBjaGFyICsgJzsgZ290ICcgKyBoZWFkKHN0ciksIHN0cik7XG59O1xuXG5jb25zdCBkaWdpdFBhcnNlciA9IGRpZ2l0ID0+IHN0ciA9PiB7XG4gICAgaWYgKCcnID09PSBzdHIpIHRocm93IG5ldyBFcnJvcigncmVhY2hlZCBlbmQgb2YgY2hhciBzdHJlYW0nKTtcbiAgICBpZiAocGFyc2VJbnQoaGVhZChzdHIpLCAxMCkgPT09IGRpZ2l0KSByZXR1cm4gc3VjY2VzcyhkaWdpdCwgdGFpbChzdHIpKTtcbiAgICByZXR1cm4gZmFpbHVyZSgnd2FudGVkICcgKyBkaWdpdCArICc7IGdvdCAnICsgaGVhZChzdHIpLCBzdHIpO1xufTtcblxuZXhwb3J0IHtjaGFyUGFyc2VyLCBkaWdpdFBhcnNlcn07XG5cbmV4cG9ydCBmdW5jdGlvbiBwY2hhcihjaGFyKSB7XG4gICAgbGV0IHJlc3VsdCA9IGZ1bmN0aW9uIChzdHIpIHtcbiAgICAgICAgcmV0dXJuIGNoYXJQYXJzZXIoY2hhcikoc3RyKTtcbiAgICB9O1xuICAgIHJldHVybiBwYXJzZXIocmVzdWx0KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHBkaWdpdChkaWdpdCkge1xuICAgIHJldHVybiBwYXJzZXIoc3RyID0+IGRpZ2l0UGFyc2VyKGRpZ2l0KShzdHIpKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGFuZFRoZW4ocGFyc2VyMSwgcGFyc2VyMikge1xuICAgIHJldHVybiBwYXJzZXIoZnVuY3Rpb24gKHN0cikge1xuICAgICAgICBsZXQgcmVzMSA9IHBhcnNlcjEucnVuKHN0cik7XG4gICAgICAgIGlmIChpc1N1Y2Nlc3MocmVzMSkpIHtcbiAgICAgICAgICAgIGxldCByZXMyID0gcGFyc2VyMi5ydW4ocmVzMVsxXSk7XG4gICAgICAgICAgICBpZiAoaXNTdWNjZXNzKHJlczIpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHN1Y2Nlc3MocGFpcihyZXMxWzBdLCByZXMyWzBdKSwgcmVzMlsxXSk7XG4gICAgICAgICAgICB9IGVsc2UgcmV0dXJuIHJlczI7XG4gICAgICAgIH0gZWxzZSByZXR1cm4gcmVzMTtcbiAgICB9KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG9yRWxzZShwYXJzZXIxLCBwYXJzZXIyKSB7XG4gICAgcmV0dXJuIHBhcnNlcihzdHIgPT4ge1xuICAgICAgICBsZXQgcmVzMSA9IHBhcnNlcjEucnVuKHN0cik7XG4gICAgICAgIHJldHVybiAoaXNTdWNjZXNzKHJlczEpKSA/IHJlczEgOiBwYXJzZXIyLnJ1bihzdHIpO1xuICAgIH0pO1xufVxuXG5sZXQgX2ZhaWwgPSBwYXJzZXIoc3RyID0+IGZhaWx1cmUoJ3BhcnNpbmcgZmFpbGVkJywgc3RyKSk7XG5cbi8vIHJldHVybiBuZXV0cmFsIGVsZW1lbnQgaW5zdGVhZCBvZiBtZXNzYWdlXG5sZXQgX3N1Y2NlZWQgPSBwYXJzZXIoc3RyID0+IHN1Y2Nlc3MoJ3BhcnNpbmcgc3VjY2VlZGVkJywgc3RyKSk7XG5cbmV4cG9ydCBmdW5jdGlvbiBjaG9pY2UocGFyc2Vycykge1xuICAgIHJldHVybiBwYXJzZXJzLnJlZHVjZVJpZ2h0KChyZXN0LCBjdXJyKSA9PiBvckVsc2UoY3VyciwgcmVzdCksIF9mYWlsKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGFueU9mKGNoYXJzKSB7XG4gICAgcmV0dXJuIGNob2ljZShjaGFycy5tYXAocGNoYXIpKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGZtYXAoZmFiLCBwYXJzZXIxKSB7XG4gICAgcmV0dXJuIHBhcnNlcihzdHIgPT4ge1xuICAgICAgICBsZXQgcmVzID0gcGFyc2VyMS5ydW4oc3RyKTtcbiAgICAgICAgaWYgKGlzU3VjY2VzcyhyZXMpKSByZXR1cm4gc3VjY2VzcyhmYWIocmVzWzBdKSwgcmVzWzFdKTtcbiAgICAgICAgcmV0dXJuIHJlcztcbiAgICB9KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJldHVyblAodmFsdWUpIHtcbiAgICByZXR1cm4gcGFyc2VyKHN0ciA9PiBzdWNjZXNzKHZhbHVlLCBzdHIpKTtcbn1cblxuLy8gcGFyc2VyKGEgLT4gYikgLT4gcGFyc2VyKGEpIC0+IHBhcnNlcihiKVxuZXhwb3J0IGZ1bmN0aW9uIGFwcGx5UChmUCkge1xuICAgIHJldHVybiBmdW5jdGlvbiAoeFApIHtcbiAgICAgICAgcmV0dXJuIGFuZFRoZW4oZlAsIHhQKS5mbWFwKChbZiwgeF0pID0+IGYoeCkpO1xuICAgIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBsaWZ0MihmYWFiKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uIChwYXJzZXIxKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAocGFyc2VyMikge1xuICAgICAgICAgICAgcmV0dXJuIGFwcGx5UChhcHBseVAocmV0dXJuUChmYWFiKSkocGFyc2VyMSkpKHBhcnNlcjIpO1xuICAgICAgICB9O1xuICAgIH07XG59XG5cbi8vIHVzaW5nIGxpZnQyKGNvbnMpXG5leHBvcnQgZnVuY3Rpb24gc2VxdWVuY2VQKHBhcnNlcnMpIHtcbiAgICByZXR1cm4gcGFyc2Vyc1xuICAgICAgICAucmVkdWNlUmlnaHQoKHJlc3QsIGN1cnIpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBsaWZ0MihfY29ucykoY3VycikocmVzdCk7XG4gICAgICAgIH0sIHJldHVyblAoW10pKTtcbn1cblxuLy8gdXNpbmcgbmFpdmUgYW5kVGhlbiAmJiBmbWFwIC0tPiByZXR1cm5zIHN0cmluZ3MsIG5vdCBhcnJheXMhXG5leHBvcnQgZnVuY3Rpb24gc2VxdWVuY2VQMihwYXJzZXJzKSB7XG4gICAgcmV0dXJuIHBhcnNlcnNcbiAgICAgICAgLnJlZHVjZVJpZ2h0KChyZXN0LCBjdXJyKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gZm1hcCgoW3gsIHldKSA9PiB4ICsgeSwgYW5kVGhlbihjdXJyLCByZXN0KSk7XG4gICAgICAgIH0sIHJldHVyblAoJycpKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHBzdHJpbmcoc3RyKSB7XG4gICAgcmV0dXJuIHNlcXVlbmNlUChzdHIuc3BsaXQoJycpLm1hcChwY2hhcikpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gemVyb09yTW9yZSh4UCkgeyAvLyB6ZXJvT3JNb3JlIDo6IHAgYSAtPiBbYV0gLT4gdHJ5IFthXSA9IHAgYSAtPiBwIFthXVxuICAgIHJldHVybiBzdHIgPT4ge1xuICAgICAgICBsZXQgcmVzMSA9IHhQLnJ1bihzdHIpO1xuICAgICAgICBpZiAoaXNGYWlsdXJlKHJlczEpKSByZXR1cm4gc3VjY2VzcyhbXSwgc3RyKTtcbiAgICAgICAgbGV0IHJlc04gPSB6ZXJvT3JNb3JlKHhQKShyZXMxWzFdKTtcbiAgICAgICAgcmV0dXJuIHN1Y2Nlc3MoW3JlczFbMF1dLmNvbmNhdChyZXNOWzBdKSwgcmVzTlsxXSk7XG4gICAgfTtcbn1cblxuLy8gbm90IHdvcmtpbmcgIDotKFxuZnVuY3Rpb24gemVyb09yTW9yZVgoeFApIHsgLy8gemVyb09yTW9yZVggOjogcCBhIC0+IHAoYSAtPiBwIFthXSkgISEhXG4gICAgcmV0dXJuIHBhcnNlcihzdHIgPT4ge1xuICAgICAgICBsZXQgcmVzID0geFAucnVuKHN0cik7XG4gICAgICAgIGlmIChpc0ZhaWx1cmUocmVzKSkgcmV0dXJuIHN1Y2Nlc3MoW10sIHN0cik7XG4gICAgICAgIC8vIG5leHQgbGluZSByZXR1cm5zIGEgcGFyc2VyICh3cm9uZywgd3JvbmcsIHdyb25nLi4uKVxuICAgICAgICByZXR1cm4gbGlmdDIoX2NvbnMpKHJldHVyblAocmVzWzBdKSkoemVyb09yTW9yZVgoeFApLnJ1bihyZXNbMV0pKTtcbiAgICB9KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1hbnkoeFApIHtcbiAgICByZXR1cm4gcGFyc2VyKHN0ciA9PiB7XG4gICAgICAgIHJldHVybiB6ZXJvT3JNb3JlKHhQKShzdHIpO1xuICAgIH0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbWFueTEoeFApIHtcbiAgICByZXR1cm4gcGFyc2VyKHN0ciA9PiB7XG4gICAgICAgIGxldCByZXMxID0geFAucnVuKHN0cik7XG4gICAgICAgIGlmIChpc0ZhaWx1cmUocmVzMSkpIHJldHVybiByZXMxO1xuICAgICAgICBsZXQgcmVzTiA9IHplcm9Pck1vcmUoeFApKHJlczFbMV0pO1xuICAgICAgICByZXR1cm4gc3VjY2VzcyhbcmVzMVswXV0uY29uY2F0KHJlc05bMF0pLCByZXNOWzFdKTtcbiAgICB9KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG9wdCh4UCkge1xuICAgIHJldHVybiBwYXJzZXIoc3RyID0+IHtcbiAgICAgICAgbGV0IHJlcyA9IHhQLmZtYXAoeCA9PiBzb21lKHgpKS5ydW4oc3RyKTtcbiAgICAgICAgaWYgKGlzU3VjY2VzcyhyZXMpKSByZXR1cm4gcmVzO1xuICAgICAgICByZXR1cm4gc3VjY2Vzcyhub25lKCksIHN0cik7XG4gICAgfSk7XG59XG5cbi8vIG9wdCBmcm9tIHRoZSBib29rXG5leHBvcnQgZnVuY3Rpb24gb3B0Qm9vayhwWCkge1xuICAgIGNvbnN0IHNvbWVQID0gcFguZm1hcChzb21lKTtcbiAgICBjb25zdCBub25lUCA9IHJldHVyblAobm9uZSk7XG4gICAgcmV0dXJuIHNvbWVQLm9yRWxzZShub25lUCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBkaXNjYXJkU2Vjb25kKHAxLCBwMikge1xuICAgIHJldHVybiBwYXJzZXIoc3RyID0+IHtcbiAgICAgICAgcmV0dXJuIGFuZFRoZW4ocDEsIHAyKS5mbWFwKChbcjEsIHIyXSkgPT4gcjEpLnJ1bihzdHIpO1xuICAgIH0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZGlzY2FyZEZpcnN0KHAxLCBwMikge1xuICAgIHJldHVybiBwYXJzZXIoc3RyID0+IHtcbiAgICAgICAgcmV0dXJuIGFuZFRoZW4ocDEsIHAyKS5mbWFwKChbcjEsIHIyXSkgPT4gcjIpLnJ1bihzdHIpO1xuICAgIH0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYmV0d2VlbihwMSwgcDIsIHAzKSB7XG4gICAgcmV0dXJuIHAxLmRpc2NhcmRGaXJzdChwMikuZGlzY2FyZFNlY29uZChwMyk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBiZXR3ZWVuUGFyZW5zKHB4KSB7XG4gICAgcmV0dXJuIGJldHdlZW4ocGNoYXIoJygnKSwgcHgsIHBjaGFyKCcpJykpO1xufVxuXG5mdW5jdGlvbiBfY29ucyh4KSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uICh4cykge1xuICAgICAgICByZXR1cm4gW3hdLmNvbmNhdCh4cyk7XG4gICAgfTtcbn1cblxuLy8gdGhlIHJlYWwgdGhpbmcuLi5cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZXIoZm4pIHtcbiAgICByZXR1cm4ge1xuICAgICAgICB0eXBlOiAncGFyc2VyJyxcbiAgICAgICAgcnVuKHN0cikge1xuICAgICAgICAgICAgcmV0dXJuIGZuKHN0cik7XG4gICAgICAgIH0sXG4gICAgICAgIGZtYXAoZmFiKSB7XG4gICAgICAgICAgICByZXR1cm4gZm1hcChmYWIsIHRoaXMpO1xuICAgICAgICB9LFxuICAgICAgICBhcHBseShweCkge1xuICAgICAgICAgICAgcmV0dXJuIGFwcGx5UCh0aGlzKShweCk7XG4gICAgICAgIH0sXG4gICAgICAgIGFuZFRoZW4ocHgpIHtcbiAgICAgICAgICAgIHJldHVybiBhbmRUaGVuKHRoaXMsIHB4KTtcbiAgICAgICAgfSxcbiAgICAgICAgb3JFbHNlKHB4KSB7XG4gICAgICAgICAgICByZXR1cm4gb3JFbHNlKHRoaXMsIHB4KTtcbiAgICAgICAgfSxcbiAgICAgICAgZGlzY2FyZEZpcnN0KHB4KSB7XG4gICAgICAgICAgICByZXR1cm4gZGlzY2FyZEZpcnN0KHRoaXMsIHB4KTtcbiAgICAgICAgfSxcbiAgICAgICAgZGlzY2FyZFNlY29uZChweCkge1xuICAgICAgICAgICAgcmV0dXJuIGRpc2NhcmRTZWNvbmQodGhpcywgcHgpO1xuICAgICAgICB9LFxuICAgIH07XG59XG4iXX0=