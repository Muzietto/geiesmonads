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
            fmap: function fmap(fab) {
                //return fmap(fab, this);
                return bindP(function (str) {
                    return returnP(fab(str));
                }, this);
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
            },
            bind: function bind(famb) {
                return bindP(famb, this);
            }
        };
    }
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2pzL3BhcnNlcnMuanMiXSwibmFtZXMiOlsicGNoYXIiLCJwZGlnaXQiLCJjaG9pY2UiLCJhbnlPZiIsImZtYXAiLCJyZXR1cm5QIiwiYXBwbHlQIiwibGlmdDIiLCJzZXF1ZW5jZVAiLCJzZXF1ZW5jZVAyIiwicHN0cmluZyIsInplcm9Pck1vcmUiLCJtYW55IiwibWFueTEiLCJvcHQiLCJvcHRCb29rIiwiYmV0d2VlbiIsImJldHdlZW5QYXJlbnMiLCJiaW5kUCIsInBhcnNlciIsImNoYXJQYXJzZXIiLCJzdHIiLCJFcnJvciIsImNoYXIiLCJkaWdpdFBhcnNlciIsInBhcnNlSW50IiwiZGlnaXQiLCJyZXN1bHQiLCJhbmRUaGVuIiwicGFyc2VyMSIsInBhcnNlcjIiLCJyZXMxIiwicnVuIiwicmVzMiIsIm9yRWxzZSIsIl9mYWlsIiwiX3N1Y2NlZWQiLCJwYXJzZXJzIiwicmVkdWNlUmlnaHQiLCJyZXN0IiwiY3VyciIsImNoYXJzIiwibWFwIiwiZmFiIiwicmVzIiwidmFsdWUiLCJmUCIsInhQIiwiZiIsIngiLCJmYWFiIiwiX2NvbnMiLCJ5Iiwic3BsaXQiLCJyZXNOIiwiY29uY2F0IiwiemVyb09yTW9yZVgiLCJwWCIsInNvbWVQIiwibm9uZVAiLCJkaXNjYXJkU2Vjb25kIiwicDEiLCJwMiIsInIxIiwicjIiLCJkaXNjYXJkRmlyc3QiLCJwMyIsInB4IiwiZmFtYiIsInhzIiwiZm4iLCJ0eXBlIiwiYXBwbHkiLCJiaW5kIl0sIm1hcHBpbmdzIjoiOzs7Ozs7O1lBOEJnQkEsSyxHQUFBQSxLO1lBT0FDLE0sR0FBQUEsTTtZQTRCQUMsTSxHQUFBQSxNO1lBSUFDLEssR0FBQUEsSztZQUlBQyxJLEdBQUFBLEk7WUFRQUMsTyxHQUFBQSxPO1lBS0FDLE0sR0FBQUEsTTtZQU1BQyxLLEdBQUFBLEs7WUFTQUMsUyxHQUFBQSxTO1lBUUFDLFUsR0FBQUEsVTtZQU9BQyxPLEdBQUFBLE87WUFJQUMsVSxHQUFBQSxVO1lBbUJBQyxJLEdBQUFBLEk7WUFN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O0FBRUh2QyxlQUZHLGVBRUNYLEdBRkQsRUFFTTtBQUNMLHVCQUFPaUQsR0FBR2pELEdBQUgsQ0FBUDtBQUNILGFBSkU7QUFLSGpCLGdCQUxHLGdCQUtFdUMsR0FMRixFQUtPO0FBQ047QUFDQSx1QkFBT3pCLE1BQU07QUFBQSwyQkFBT2IsUUFBUXNDLElBQUl0QixHQUFKLENBQVIsQ0FBUDtBQUFBLGlCQUFOLEVBQWdDLElBQWhDLENBQVA7QUFDSCxhQVJFO0FBU0htRCxpQkFURyxpQkFTR0wsRUFUSCxFQVNPO0FBQ04sdUJBQU83RCxPQUFPLElBQVAsRUFBYTZELEVBQWIsQ0FBUDtBQUNILGFBWEU7QUFZSHZDLG1CQVpHLG1CQVlLdUMsRUFaTCxFQVlTO0FBQ1IsdUJBQU92QyxTQUFRLElBQVIsRUFBY3VDLEVBQWQsQ0FBUDtBQUNILGFBZEU7QUFlSGpDLGtCQWZHLGtCQWVJaUMsRUFmSixFQWVRO0FBQ1AsdUJBQU9qQyxRQUFPLElBQVAsRUFBYWlDLEVBQWIsQ0FBUDtBQUNILGFBakJFO0FBa0JIRix3QkFsQkcsd0JBa0JVRSxFQWxCVixFQWtCYztBQUNiLHVCQUFPRixjQUFhLElBQWIsRUFBbUJFLEVBQW5CLENBQVA7QUFDSCxhQXBCRTtBQXFCSFAseUJBckJHLHlCQXFCV08sRUFyQlgsRUFxQmU7QUFDZCx1QkFBT1AsZUFBYyxJQUFkLEVBQW9CTyxFQUFwQixDQUFQO0FBQ0gsYUF2QkU7QUF3QkhNLGdCQXhCRyxnQkF3QkVMLElBeEJGLEVBd0JRO0FBQ1AsdUJBQU9sRCxNQUFNa0QsSUFBTixFQUFZLElBQVosQ0FBUDtBQUNIO0FBMUJFLFNBQVA7QUE0QkgiLCJmaWxlIjoicGFyc2Vycy5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vIGNmci4gXCJVbmRlcnN0YW5kaW5nIFBhcnNlciBDb21iaW5hdG9yc1wiIChGIyBmb3IgRnVuIGFuZCBQcm9maXQpXG5cbmltcG9ydCB7XG4gICAgaGVhZCxcbiAgICB0YWlsLFxuICAgIGlzU3VjY2VzcyxcbiAgICBpc0ZhaWx1cmUsXG59IGZyb20gJ3V0aWwnO1xuaW1wb3J0IHtcbiAgICBwYWlyLFxuICAgIHN1Y2Nlc3MsXG4gICAgZmFpbHVyZSxcbiAgICBzb21lLFxuICAgIG5vbmUsXG59IGZyb20gJ2NsYXNzZXMnO1xuXG5jb25zdCBjaGFyUGFyc2VyID0gY2hhciA9PiBzdHIgPT4ge1xuICAgIGlmICgnJyA9PT0gc3RyKSB0aHJvdyBuZXcgRXJyb3IoJ3JlYWNoZWQgZW5kIG9mIGNoYXIgc3RyZWFtJyk7XG4gICAgaWYgKGhlYWQoc3RyKSA9PT0gY2hhcikgcmV0dXJuIHN1Y2Nlc3MoY2hhciwgdGFpbChzdHIpKTtcbiAgICByZXR1cm4gZmFpbHVyZSgnd2FudGVkICcgKyBjaGFyICsgJzsgZ290ICcgKyBoZWFkKHN0ciksIHN0cik7XG59O1xuXG5jb25zdCBkaWdpdFBhcnNlciA9IGRpZ2l0ID0+IHN0ciA9PiB7XG4gICAgaWYgKCcnID09PSBzdHIpIHRocm93IG5ldyBFcnJvcigncmVhY2hlZCBlbmQgb2YgY2hhciBzdHJlYW0nKTtcbiAgICBpZiAocGFyc2VJbnQoaGVhZChzdHIpLCAxMCkgPT09IGRpZ2l0KSByZXR1cm4gc3VjY2VzcyhkaWdpdCwgdGFpbChzdHIpKTtcbiAgICByZXR1cm4gZmFpbHVyZSgnd2FudGVkICcgKyBkaWdpdCArICc7IGdvdCAnICsgaGVhZChzdHIpLCBzdHIpO1xufTtcblxuZXhwb3J0IHtjaGFyUGFyc2VyLCBkaWdpdFBhcnNlcn07XG5cbmV4cG9ydCBmdW5jdGlvbiBwY2hhcihjaGFyKSB7XG4gICAgbGV0IHJlc3VsdCA9IGZ1bmN0aW9uIChzdHIpIHtcbiAgICAgICAgcmV0dXJuIGNoYXJQYXJzZXIoY2hhcikoc3RyKTtcbiAgICB9O1xuICAgIHJldHVybiBwYXJzZXIocmVzdWx0KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHBkaWdpdChkaWdpdCkge1xuICAgIHJldHVybiBwYXJzZXIoc3RyID0+IGRpZ2l0UGFyc2VyKGRpZ2l0KShzdHIpKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGFuZFRoZW4ocGFyc2VyMSwgcGFyc2VyMikge1xuICAgIHJldHVybiBwYXJzZXIoZnVuY3Rpb24gKHN0cikge1xuICAgICAgICBsZXQgcmVzMSA9IHBhcnNlcjEucnVuKHN0cik7XG4gICAgICAgIGlmIChpc1N1Y2Nlc3MocmVzMSkpIHtcbiAgICAgICAgICAgIGxldCByZXMyID0gcGFyc2VyMi5ydW4ocmVzMVsxXSk7XG4gICAgICAgICAgICBpZiAoaXNTdWNjZXNzKHJlczIpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHN1Y2Nlc3MocGFpcihyZXMxWzBdLCByZXMyWzBdKSwgcmVzMlsxXSk7XG4gICAgICAgICAgICB9IGVsc2UgcmV0dXJuIHJlczI7XG4gICAgICAgIH0gZWxzZSByZXR1cm4gcmVzMTtcbiAgICB9KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG9yRWxzZShwYXJzZXIxLCBwYXJzZXIyKSB7XG4gICAgcmV0dXJuIHBhcnNlcihzdHIgPT4ge1xuICAgICAgICBsZXQgcmVzMSA9IHBhcnNlcjEucnVuKHN0cik7XG4gICAgICAgIHJldHVybiAoaXNTdWNjZXNzKHJlczEpKSA/IHJlczEgOiBwYXJzZXIyLnJ1bihzdHIpO1xuICAgIH0pO1xufVxuXG5sZXQgX2ZhaWwgPSBwYXJzZXIoc3RyID0+IGZhaWx1cmUoJ3BhcnNpbmcgZmFpbGVkJywgc3RyKSk7XG5cbi8vIHJldHVybiBuZXV0cmFsIGVsZW1lbnQgaW5zdGVhZCBvZiBtZXNzYWdlXG5sZXQgX3N1Y2NlZWQgPSBwYXJzZXIoc3RyID0+IHN1Y2Nlc3MoJ3BhcnNpbmcgc3VjY2VlZGVkJywgc3RyKSk7XG5cbmV4cG9ydCBmdW5jdGlvbiBjaG9pY2UocGFyc2Vycykge1xuICAgIHJldHVybiBwYXJzZXJzLnJlZHVjZVJpZ2h0KChyZXN0LCBjdXJyKSA9PiBvckVsc2UoY3VyciwgcmVzdCksIF9mYWlsKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGFueU9mKGNoYXJzKSB7XG4gICAgcmV0dXJuIGNob2ljZShjaGFycy5tYXAocGNoYXIpKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGZtYXAoZmFiLCBwYXJzZXIxKSB7XG4gICAgcmV0dXJuIHBhcnNlcihzdHIgPT4ge1xuICAgICAgICBsZXQgcmVzID0gcGFyc2VyMS5ydW4oc3RyKTtcbiAgICAgICAgaWYgKGlzU3VjY2VzcyhyZXMpKSByZXR1cm4gc3VjY2VzcyhmYWIocmVzWzBdKSwgcmVzWzFdKTtcbiAgICAgICAgcmV0dXJuIHJlcztcbiAgICB9KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJldHVyblAodmFsdWUpIHtcbiAgICByZXR1cm4gcGFyc2VyKHN0ciA9PiBzdWNjZXNzKHZhbHVlLCBzdHIpKTtcbn1cblxuLy8gcGFyc2VyKGEgLT4gYikgLT4gcGFyc2VyKGEpIC0+IHBhcnNlcihiKVxuZXhwb3J0IGZ1bmN0aW9uIGFwcGx5UChmUCkge1xuICAgIHJldHVybiBmdW5jdGlvbiAoeFApIHtcbiAgICAgICAgcmV0dXJuIGFuZFRoZW4oZlAsIHhQKS5mbWFwKChbZiwgeF0pID0+IGYoeCkpO1xuICAgIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBsaWZ0MihmYWFiKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uIChwYXJzZXIxKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAocGFyc2VyMikge1xuICAgICAgICAgICAgcmV0dXJuIGFwcGx5UChhcHBseVAocmV0dXJuUChmYWFiKSkocGFyc2VyMSkpKHBhcnNlcjIpO1xuICAgICAgICB9O1xuICAgIH07XG59XG5cbi8vIHVzaW5nIGxpZnQyKGNvbnMpXG5leHBvcnQgZnVuY3Rpb24gc2VxdWVuY2VQKHBhcnNlcnMpIHtcbiAgICByZXR1cm4gcGFyc2Vyc1xuICAgICAgICAucmVkdWNlUmlnaHQoKHJlc3QsIGN1cnIpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBsaWZ0MihfY29ucykoY3VycikocmVzdCk7XG4gICAgICAgIH0sIHJldHVyblAoW10pKTtcbn1cblxuLy8gdXNpbmcgbmFpdmUgYW5kVGhlbiAmJiBmbWFwIC0tPiByZXR1cm5zIHN0cmluZ3MsIG5vdCBhcnJheXMhXG5leHBvcnQgZnVuY3Rpb24gc2VxdWVuY2VQMihwYXJzZXJzKSB7XG4gICAgcmV0dXJuIHBhcnNlcnNcbiAgICAgICAgLnJlZHVjZVJpZ2h0KChyZXN0LCBjdXJyKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gZm1hcCgoW3gsIHldKSA9PiB4ICsgeSwgYW5kVGhlbihjdXJyLCByZXN0KSk7XG4gICAgICAgIH0sIHJldHVyblAoJycpKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHBzdHJpbmcoc3RyKSB7XG4gICAgcmV0dXJuIHNlcXVlbmNlUChzdHIuc3BsaXQoJycpLm1hcChwY2hhcikpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gemVyb09yTW9yZSh4UCkgeyAvLyB6ZXJvT3JNb3JlIDo6IHAgYSAtPiBbYV0gLT4gdHJ5IFthXSA9IHAgYSAtPiBwIFthXVxuICAgIHJldHVybiBzdHIgPT4ge1xuICAgICAgICBsZXQgcmVzMSA9IHhQLnJ1bihzdHIpO1xuICAgICAgICBpZiAoaXNGYWlsdXJlKHJlczEpKSByZXR1cm4gc3VjY2VzcyhbXSwgc3RyKTtcbiAgICAgICAgbGV0IHJlc04gPSB6ZXJvT3JNb3JlKHhQKShyZXMxWzFdKTtcbiAgICAgICAgcmV0dXJuIHN1Y2Nlc3MoW3JlczFbMF1dLmNvbmNhdChyZXNOWzBdKSwgcmVzTlsxXSk7XG4gICAgfTtcbn1cblxuLy8gbm90IHdvcmtpbmcgIDotKFxuZnVuY3Rpb24gemVyb09yTW9yZVgoeFApIHsgLy8gemVyb09yTW9yZVggOjogcCBhIC0+IHAoYSAtPiBwIFthXSkgISEhXG4gICAgcmV0dXJuIHBhcnNlcihzdHIgPT4ge1xuICAgICAgICBsZXQgcmVzID0geFAucnVuKHN0cik7XG4gICAgICAgIGlmIChpc0ZhaWx1cmUocmVzKSkgcmV0dXJuIHN1Y2Nlc3MoW10sIHN0cik7XG4gICAgICAgIC8vIG5leHQgbGluZSByZXR1cm5zIGEgcGFyc2VyICh3cm9uZywgd3JvbmcsIHdyb25nLi4uKVxuICAgICAgICByZXR1cm4gbGlmdDIoX2NvbnMpKHJldHVyblAocmVzWzBdKSkoemVyb09yTW9yZVgoeFApLnJ1bihyZXNbMV0pKTtcbiAgICB9KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1hbnkoeFApIHtcbiAgICByZXR1cm4gcGFyc2VyKHN0ciA9PiB7XG4gICAgICAgIHJldHVybiB6ZXJvT3JNb3JlKHhQKShzdHIpO1xuICAgIH0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbWFueTEoeFApIHtcbiAgICByZXR1cm4gcGFyc2VyKHN0ciA9PiB7XG4gICAgICAgIGxldCByZXMxID0geFAucnVuKHN0cik7XG4gICAgICAgIGlmIChpc0ZhaWx1cmUocmVzMSkpIHJldHVybiByZXMxO1xuICAgICAgICBsZXQgcmVzTiA9IHplcm9Pck1vcmUoeFApKHJlczFbMV0pO1xuICAgICAgICByZXR1cm4gc3VjY2VzcyhbcmVzMVswXV0uY29uY2F0KHJlc05bMF0pLCByZXNOWzFdKTtcbiAgICB9KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG9wdCh4UCkge1xuICAgIHJldHVybiBwYXJzZXIoc3RyID0+IHtcbiAgICAgICAgbGV0IHJlcyA9IHhQLmZtYXAoeCA9PiBzb21lKHgpKS5ydW4oc3RyKTtcbiAgICAgICAgaWYgKGlzU3VjY2VzcyhyZXMpKSByZXR1cm4gcmVzO1xuICAgICAgICByZXR1cm4gc3VjY2Vzcyhub25lKCksIHN0cik7XG4gICAgfSk7XG59XG5cbi8vIG9wdCBmcm9tIHRoZSBib29rXG5leHBvcnQgZnVuY3Rpb24gb3B0Qm9vayhwWCkge1xuICAgIGNvbnN0IHNvbWVQID0gcFguZm1hcChzb21lKTtcbiAgICBjb25zdCBub25lUCA9IHJldHVyblAobm9uZSk7XG4gICAgcmV0dXJuIHNvbWVQLm9yRWxzZShub25lUCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBkaXNjYXJkU2Vjb25kKHAxLCBwMikge1xuICAgIHJldHVybiBwYXJzZXIoc3RyID0+IHtcbiAgICAgICAgcmV0dXJuIGFuZFRoZW4ocDEsIHAyKS5mbWFwKChbcjEsIHIyXSkgPT4gcjEpLnJ1bihzdHIpO1xuICAgIH0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZGlzY2FyZEZpcnN0KHAxLCBwMikge1xuICAgIHJldHVybiBwYXJzZXIoc3RyID0+IHtcbiAgICAgICAgcmV0dXJuIGFuZFRoZW4ocDEsIHAyKS5mbWFwKChbcjEsIHIyXSkgPT4gcjIpLnJ1bihzdHIpO1xuICAgIH0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYmV0d2VlbihwMSwgcDIsIHAzKSB7XG4gICAgcmV0dXJuIHAxLmRpc2NhcmRGaXJzdChwMikuZGlzY2FyZFNlY29uZChwMyk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBiZXR3ZWVuUGFyZW5zKHB4KSB7XG4gICAgcmV0dXJuIGJldHdlZW4ocGNoYXIoJygnKSwgcHgsIHBjaGFyKCcpJykpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYmluZFAoZmFtYiwgcHgpIHtcbiAgICByZXR1cm4gcGFyc2VyKHN0ciA9PiB7XG4gICAgICAgIGNvbnN0IHJlcyA9IHB4LnJ1bihzdHIpO1xuICAgICAgICBpZiAoaXNGYWlsdXJlKHJlcykpIHJldHVybiByZXM7XG5cbiAgICAgICAgcmV0dXJuIGZhbWIocmVzWzBdKS5ydW4ocmVzWzFdKTtcbiAgICB9KTtcbn1cblxuZnVuY3Rpb24gX2NvbnMoeCkge1xuICAgIHJldHVybiBmdW5jdGlvbiAoeHMpIHtcbiAgICAgICAgcmV0dXJuIFt4XS5jb25jYXQoeHMpO1xuICAgIH07XG59XG5cbi8vIHRoZSByZWFsIHRoaW5nLi4uXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VyKGZuKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgdHlwZTogJ3BhcnNlcicsXG4gICAgICAgIHJ1bihzdHIpIHtcbiAgICAgICAgICAgIHJldHVybiBmbihzdHIpO1xuICAgICAgICB9LFxuICAgICAgICBmbWFwKGZhYikge1xuICAgICAgICAgICAgLy9yZXR1cm4gZm1hcChmYWIsIHRoaXMpO1xuICAgICAgICAgICAgcmV0dXJuIGJpbmRQKHN0ciA9PiByZXR1cm5QKGZhYihzdHIpKSwgdGhpcyk7XG4gICAgICAgIH0sXG4gICAgICAgIGFwcGx5KHB4KSB7XG4gICAgICAgICAgICByZXR1cm4gYXBwbHlQKHRoaXMpKHB4KTtcbiAgICAgICAgfSxcbiAgICAgICAgYW5kVGhlbihweCkge1xuICAgICAgICAgICAgcmV0dXJuIGFuZFRoZW4odGhpcywgcHgpO1xuICAgICAgICB9LFxuICAgICAgICBvckVsc2UocHgpIHtcbiAgICAgICAgICAgIHJldHVybiBvckVsc2UodGhpcywgcHgpO1xuICAgICAgICB9LFxuICAgICAgICBkaXNjYXJkRmlyc3QocHgpIHtcbiAgICAgICAgICAgIHJldHVybiBkaXNjYXJkRmlyc3QodGhpcywgcHgpO1xuICAgICAgICB9LFxuICAgICAgICBkaXNjYXJkU2Vjb25kKHB4KSB7XG4gICAgICAgICAgICByZXR1cm4gZGlzY2FyZFNlY29uZCh0aGlzLCBweCk7XG4gICAgICAgIH0sXG4gICAgICAgIGJpbmQoZmFtYikge1xuICAgICAgICAgICAgcmV0dXJuIGJpbmRQKGZhbWIsIHRoaXMpO1xuICAgICAgICB9XG4gICAgfTtcbn1cbiJdfQ==