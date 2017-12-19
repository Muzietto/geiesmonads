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
            return (0, _classes.failure)('charParser', 'wanted ' + char + '; got ' + (0, _util.head)(str));
        };
    };

    var digitParser = function digitParser(digit) {
        return function (str) {
            if ('' === str) throw new Error('reached end of char stream');
            if (parseInt((0, _util.head)(str), 10) === digit) return (0, _classes.success)(digit, (0, _util.tail)(str));
            return (0, _classes.failure)('digitParser', 'wanted ' + digit + '; got ' + (0, _util.head)(str));
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

    function andThenX(p1, p2) {
        var label = p1.label + ' andThen ' + p2.label;
        return parser(function (str) {
            var res1 = p1.run(str);
            if ((0, _util.isSuccess)(res1)) {
                var res2 = p2.run(res1[1]);
                if ((0, _util.isSuccess)(res2)) {
                    return (0, _classes.success)((0, _classes.pair)(res1[0], res2[0]), res2[1]);
                } else return (0, _classes.failure)(label, res2[1]);
            } else return (0, _classes.failure)(label, res1[1]);
        }, label);
    }

    // using bind
    function _andThen(p1, p2) {
        return p1.bind(function (parsedValue1) {
            return p2.bind(function (parsedValue2) {
                return returnP((0, _classes.pair)(parsedValue1, parsedValue2));
            });
        }).setLabel(p1.label + ' andThen ' + p2.label);
    }

    exports.andThen = _andThen;
    function _orElse(p1, p2) {
        var label = p1.label + ' orElse ' + p2.label;
        return parser(function (str) {
            var res1 = p1.run(str);
            if ((0, _util.isSuccess)(res1)) return res1;
            var res2 = p2.run(str);
            if ((0, _util.isSuccess)(res2)) return res2;
            return (0, _classes.failure)(label, res2[1]);
        }, label).setLabel(label);
    }

    exports.orElse = _orElse;
    var _fail = parser(function (str) {
        return (0, _classes.failure)('parsing failed', '_fail');
    }, '_fail');

    // return neutral element instead of message
    var _succeed = parser(function (str) {
        return (0, _classes.success)('parsing succeeded', str);
    }, '_succeed');

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
            if ((0, _util.isSuccess)(res)) return (0, _classes.success)(fab(res[0]), res[1]);
            return (0, _classes.failure)(label, res[1]);
        }, label);
    }

    function returnP(value) {
        return parser(function (str) {
            return (0, _classes.success)(value, str);
        }, value);
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
        return sequenceP(str.split('').map(pchar)).setLabel('pstring ' + str);
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
        var label = 'many ' + xP.label;
        return parser(function (str) {
            return zeroOrMore(xP)(str);
        }, label).setLabel(label);
    }

    function many1(xP) {
        var label = 'many1 ' + xP.label;
        return parser(function (str) {
            var res1 = xP.run(str);
            if ((0, _util.isFailure)(res1)) return res1;
            var resN = zeroOrMore(xP)(res1[1]);
            return (0, _classes.success)([res1[0]].concat(resN[0]), resN[1]);
        }, label).setLabel(label);
    }

    function opt(xP) {
        var label = 'opt ' + xP.label;
        return parser(function (str) {
            var res = xP.fmap(function (x) {
                return (0, _classes.some)(x);
            }).run(str);
            if ((0, _util.isSuccess)(res)) return res;
            return (0, _classes.success)((0, _classes.none)(), str);
        }, label).setLabel(label);
    }

    // opt from the book
    function optBook(pX) {
        var someP = pX.fmap(_classes.some);
        var noneP = returnP(_classes.none);
        return someP.orElse(noneP);
    }

    function _discardSecond(p1, p2) {
        var label = p1.label + ' discardSecond ' + p2.label;
        return parser(function (str) {
            return _andThen(p1, p2).fmap(function (_ref5) {
                var _ref6 = _slicedToArray(_ref5, 2),
                    r1 = _ref6[0],
                    r2 = _ref6[1];

                return r1;
            }).run(str);
        }, label).setLabel(label);
    }

    exports.discardSecond = _discardSecond;
    function _discardFirst(p1, p2) {
        var label = p1.label + ' discardFirst ' + p2.label;
        return parser(function (str) {
            return _andThen(p1, p2).fmap(function (_ref7) {
                var _ref8 = _slicedToArray(_ref7, 2),
                    r1 = _ref8[0],
                    r2 = _ref8[1];

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
            if ((0, _util.isFailure)(res)) return res;
            return famb(res[0]).run(res[1]);
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
            if ((0, _util.isFailure)(result)) return (0, _classes.failure)(newLabel, result[1]);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2pzL3BhcnNlcnMuanMiXSwibmFtZXMiOlsicGNoYXIiLCJwZGlnaXQiLCJhbmRUaGVuWCIsImNob2ljZSIsImFueU9mIiwiZm1hcCIsInJldHVyblAiLCJhcHBseVB4IiwiYXBwbHlQIiwibGlmdDIiLCJzZXF1ZW5jZVAiLCJzZXF1ZW5jZVAyIiwicHN0cmluZyIsInplcm9Pck1vcmUiLCJtYW55IiwibWFueTEiLCJvcHQiLCJvcHRCb29rIiwiYmV0d2VlbiIsImJldHdlZW5QYXJlbnMiLCJiaW5kUCIsInBhcnNlciIsImNoYXJQYXJzZXIiLCJzdHIiLCJFcnJvciIsImNoYXIiLCJkaWdpdFBhcnNlciIsInBhcnNlSW50IiwiZGlnaXQiLCJsYWJlbCIsInJlc3VsdCIsInNldExhYmVsIiwicDEiLCJwMiIsInJlczEiLCJydW4iLCJyZXMyIiwiYW5kVGhlbiIsImJpbmQiLCJwYXJzZWRWYWx1ZTEiLCJwYXJzZWRWYWx1ZTIiLCJvckVsc2UiLCJfZmFpbCIsIl9zdWNjZWVkIiwicGFyc2VycyIsInJlZHVjZVJpZ2h0IiwicmVzdCIsImN1cnIiLCJyZWR1Y2UiLCJhY2MiLCJjaGFycyIsIm1hcCIsImZhYiIsInBhcnNlcjEiLCJ0b1N0cmluZyIsInJlcyIsInZhbHVlIiwiZlAiLCJ4UCIsImYiLCJ4IiwicGFyc2VkVmFsdWVmIiwicGFyc2VkVmFsdWV4IiwiZmFhYiIsInBhcnNlcjIiLCJhcHBseSIsIl9jb25zIiwieSIsInNwbGl0IiwicmVzTiIsImNvbmNhdCIsInBYIiwic29tZVAiLCJub25lUCIsImRpc2NhcmRTZWNvbmQiLCJyMSIsInIyIiwiZGlzY2FyZEZpcnN0IiwicDMiLCJweCIsImZhbWIiLCJ4cyIsIl9zZXRMYWJlbCIsIm5ld0xhYmVsIiwiZm4iLCJ0eXBlIiwicGFyc2VkVmFsdWUiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7WUE4QmdCQSxLLEdBQUFBLEs7WUFRQUMsTSxHQUFBQSxNO1lBSUFDLFEsR0FBQUEsUTtZQXNDQUMsTSxHQUFBQSxN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QVA7QUFDSCxhQTFCRTtBQTJCSHpDLGdCQTNCRyxnQkEyQkUwQyxJQTNCRixFQTJCUTtBQUNQLHVCQUFPNUQsTUFBTTRELElBQU4sRUFBWSxJQUFaLENBQVA7QUFDSCxhQTdCRTtBQThCSGpELG9CQTlCRyxvQkE4Qk1vRCxRQTlCTixFQThCZ0I7QUFDZix1QkFBT0QsVUFBVSxJQUFWLEVBQWdCQyxRQUFoQixDQUFQO0FBQ0g7QUFoQ0UsU0FBUDtBQWtDSCIsImZpbGUiOiJwYXJzZXJzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8gY2ZyLiBcIlVuZGVyc3RhbmRpbmcgUGFyc2VyIENvbWJpbmF0b3JzXCIgKEYjIGZvciBGdW4gYW5kIFByb2ZpdClcblxuaW1wb3J0IHtcbiAgICBoZWFkLFxuICAgIHRhaWwsXG4gICAgaXNTdWNjZXNzLFxuICAgIGlzRmFpbHVyZSxcbn0gZnJvbSAndXRpbCc7XG5pbXBvcnQge1xuICAgIHBhaXIsXG4gICAgc3VjY2VzcyxcbiAgICBmYWlsdXJlLFxuICAgIHNvbWUsXG4gICAgbm9uZSxcbn0gZnJvbSAnY2xhc3Nlcyc7XG5cbmNvbnN0IGNoYXJQYXJzZXIgPSBjaGFyID0+IHN0ciA9PiB7XG4gICAgaWYgKCcnID09PSBzdHIpIHRocm93IG5ldyBFcnJvcigncmVhY2hlZCBlbmQgb2YgY2hhciBzdHJlYW0nKTtcbiAgICBpZiAoaGVhZChzdHIpID09PSBjaGFyKSByZXR1cm4gc3VjY2VzcyhjaGFyLCB0YWlsKHN0cikpO1xuICAgIHJldHVybiBmYWlsdXJlKCdjaGFyUGFyc2VyJywgJ3dhbnRlZCAnICsgY2hhciArICc7IGdvdCAnICsgaGVhZChzdHIpKTtcbn07XG5cbmNvbnN0IGRpZ2l0UGFyc2VyID0gZGlnaXQgPT4gc3RyID0+IHtcbiAgICBpZiAoJycgPT09IHN0cikgdGhyb3cgbmV3IEVycm9yKCdyZWFjaGVkIGVuZCBvZiBjaGFyIHN0cmVhbScpO1xuICAgIGlmIChwYXJzZUludChoZWFkKHN0ciksIDEwKSA9PT0gZGlnaXQpIHJldHVybiBzdWNjZXNzKGRpZ2l0LCB0YWlsKHN0cikpO1xuICAgIHJldHVybiBmYWlsdXJlKCdkaWdpdFBhcnNlcicsICd3YW50ZWQgJyArIGRpZ2l0ICsgJzsgZ290ICcgKyBoZWFkKHN0cikpO1xufTtcblxuZXhwb3J0IHtjaGFyUGFyc2VyLCBkaWdpdFBhcnNlcn07XG5cbmV4cG9ydCBmdW5jdGlvbiBwY2hhcihjaGFyKSB7XG4gICAgY29uc3QgbGFiZWwgPSAncGNoYXJfJyArIGNoYXI7XG4gICAgbGV0IHJlc3VsdCA9IGZ1bmN0aW9uIChzdHIpIHtcbiAgICAgICAgcmV0dXJuIGNoYXJQYXJzZXIoY2hhcikoc3RyKTtcbiAgICB9O1xuICAgIHJldHVybiBwYXJzZXIocmVzdWx0LCBsYWJlbCkuc2V0TGFiZWwobGFiZWwpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcGRpZ2l0KGRpZ2l0KSB7XG4gICAgcmV0dXJuIHBhcnNlcihzdHIgPT4gZGlnaXRQYXJzZXIoZGlnaXQpKHN0ciksICdwZGlnaXRfJyArIGRpZ2l0KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGFuZFRoZW5YKHAxLCBwMikge1xuICAgIGNvbnN0IGxhYmVsID0gcDEubGFiZWwgKyAnIGFuZFRoZW4gJyArIHAyLmxhYmVsO1xuICAgIHJldHVybiBwYXJzZXIoZnVuY3Rpb24gKHN0cikge1xuICAgICAgICBsZXQgcmVzMSA9IHAxLnJ1bihzdHIpO1xuICAgICAgICBpZiAoaXNTdWNjZXNzKHJlczEpKSB7XG4gICAgICAgICAgICBsZXQgcmVzMiA9IHAyLnJ1bihyZXMxWzFdKTtcbiAgICAgICAgICAgIGlmIChpc1N1Y2Nlc3MocmVzMikpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gc3VjY2VzcyhwYWlyKHJlczFbMF0sIHJlczJbMF0pLCByZXMyWzFdKTtcbiAgICAgICAgICAgIH0gZWxzZSByZXR1cm4gZmFpbHVyZShsYWJlbCwgcmVzMlsxXSk7XG4gICAgICAgIH0gZWxzZSByZXR1cm4gZmFpbHVyZShsYWJlbCwgcmVzMVsxXSk7XG4gICAgfSwgbGFiZWwpO1xufVxuXG4vLyB1c2luZyBiaW5kXG5leHBvcnQgZnVuY3Rpb24gYW5kVGhlbihwMSwgcDIpIHtcbiAgICByZXR1cm4gcDEuYmluZChwYXJzZWRWYWx1ZTEgPT4ge1xuICAgICAgICByZXR1cm4gcDIuYmluZChwYXJzZWRWYWx1ZTIgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHJldHVyblAocGFpcihwYXJzZWRWYWx1ZTEsIHBhcnNlZFZhbHVlMikpO1xuICAgICAgICB9KTtcbiAgICB9KS5zZXRMYWJlbChwMS5sYWJlbCArICcgYW5kVGhlbiAnICsgcDIubGFiZWwpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gb3JFbHNlKHAxLCBwMikge1xuICAgIGNvbnN0IGxhYmVsID0gcDEubGFiZWwgKyAnIG9yRWxzZSAnICsgcDIubGFiZWw7XG4gICAgcmV0dXJuIHBhcnNlcihzdHIgPT4ge1xuICAgICAgICBjb25zdCByZXMxID0gcDEucnVuKHN0cik7XG4gICAgICAgIGlmIChpc1N1Y2Nlc3MocmVzMSkpIHJldHVybiByZXMxO1xuICAgICAgICBjb25zdCByZXMyID0gcDIucnVuKHN0cik7XG4gICAgICAgIGlmIChpc1N1Y2Nlc3MocmVzMikpIHJldHVybiByZXMyO1xuICAgICAgICByZXR1cm4gZmFpbHVyZShsYWJlbCwgcmVzMlsxXSk7XG4gICAgfSwgbGFiZWwpLnNldExhYmVsKGxhYmVsKTtcbn1cblxubGV0IF9mYWlsID0gcGFyc2VyKHN0ciA9PiBmYWlsdXJlKCdwYXJzaW5nIGZhaWxlZCcsICdfZmFpbCcpLCAnX2ZhaWwnKTtcblxuLy8gcmV0dXJuIG5ldXRyYWwgZWxlbWVudCBpbnN0ZWFkIG9mIG1lc3NhZ2VcbmxldCBfc3VjY2VlZCA9IHBhcnNlcihzdHIgPT4gc3VjY2VzcygncGFyc2luZyBzdWNjZWVkZWQnLCBzdHIpLCAnX3N1Y2NlZWQnKTtcblxuZXhwb3J0IGZ1bmN0aW9uIGNob2ljZShwYXJzZXJzKSB7XG4gICAgcmV0dXJuIHBhcnNlcnMucmVkdWNlUmlnaHQoKHJlc3QsIGN1cnIpID0+IG9yRWxzZShjdXJyLCByZXN0KSwgX2ZhaWwpXG4gICAgICAgIC5zZXRMYWJlbCgnY2hvaWNlICcgKyBwYXJzZXJzLnJlZHVjZSgoYWNjLCBjdXJyKSA9PiBhY2MgKyAnLycgKyBjdXJyLmxhYmVsLCAnJykpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYW55T2YoY2hhcnMpIHtcbiAgICByZXR1cm4gY2hvaWNlKGNoYXJzLm1hcChwY2hhcikpXG4gICAgICAgIC5zZXRMYWJlbCgnYW55T2YgJyArIGNoYXJzLnJlZHVjZSgoYWNjLCBjdXJyKSA9PiBhY2MgKyBjdXJyLCAnJykpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZm1hcChmYWIsIHBhcnNlcjEpIHtcbiAgICBjb25zdCBsYWJlbCA9IHBhcnNlcjEubGFiZWwgKyAnIGZtYXAgJyArIGZhYi50b1N0cmluZygpO1xuICAgIHJldHVybiBwYXJzZXIoc3RyID0+IHtcbiAgICAgICAgbGV0IHJlcyA9IHBhcnNlcjEucnVuKHN0cik7XG4gICAgICAgIGlmIChpc1N1Y2Nlc3MocmVzKSkgcmV0dXJuIHN1Y2Nlc3MoZmFiKHJlc1swXSksIHJlc1sxXSk7XG4gICAgICAgIHJldHVybiBmYWlsdXJlKGxhYmVsLCByZXNbMV0pO1xuICAgIH0sIGxhYmVsKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJldHVyblAodmFsdWUpIHtcbiAgICByZXR1cm4gcGFyc2VyKHN0ciA9PiBzdWNjZXNzKHZhbHVlLCBzdHIpLCB2YWx1ZSk7XG59XG5cbi8vIHBhcnNlcihhIC0+IGIpIC0+IHBhcnNlcihhKSAtPiBwYXJzZXIoYilcbmV4cG9ydCBmdW5jdGlvbiBhcHBseVB4KGZQKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uICh4UCkge1xuICAgICAgICByZXR1cm4gYW5kVGhlbihmUCwgeFApLmZtYXAoKFtmLCB4XSkgPT4gZih4KSk7XG4gICAgfTtcbn1cblxuLy8gdXNpbmcgYmluZFxuZXhwb3J0IGZ1bmN0aW9uIGFwcGx5UChmUCkge1xuICAgIHJldHVybiBmdW5jdGlvbiAoeFApIHtcbiAgICAgICAgcmV0dXJuIGZQLmJpbmQocGFyc2VkVmFsdWVmID0+IHtcbiAgICAgICAgICAgIHJldHVybiB4UC5iaW5kKHBhcnNlZFZhbHVleCA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJldHVyblAocGFyc2VkVmFsdWVmKHBhcnNlZFZhbHVleCkpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBsaWZ0MihmYWFiKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uIChwYXJzZXIxKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAocGFyc2VyMikge1xuICAgICAgICAgICAgLy9yZXR1cm4gYXBwbHlQKGFwcGx5UChyZXR1cm5QKGZhYWIpKShwYXJzZXIxKSkocGFyc2VyMik7XG4gICAgICAgICAgICByZXR1cm4gcmV0dXJuUChmYWFiKS5hcHBseShwYXJzZXIxKS5hcHBseShwYXJzZXIyKTsgLy8gdXNpbmcgaW5zdGFuY2UgbWV0aG9kc1xuICAgICAgICB9O1xuICAgIH07XG59XG5cbi8vIHVzaW5nIGxpZnQyKGNvbnMpXG5leHBvcnQgZnVuY3Rpb24gc2VxdWVuY2VQKHBhcnNlcnMpIHtcbiAgICByZXR1cm4gcGFyc2Vyc1xuICAgICAgICAucmVkdWNlUmlnaHQoKHJlc3QsIGN1cnIpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBsaWZ0MihfY29ucykoY3VycikocmVzdCk7XG4gICAgICAgIH0sIHJldHVyblAoW10pKTtcbn1cblxuLy8gdXNpbmcgbmFpdmUgYW5kVGhlbiAmJiBmbWFwIC0tPiByZXR1cm5zIHN0cmluZ3MsIG5vdCBhcnJheXMhXG5leHBvcnQgZnVuY3Rpb24gc2VxdWVuY2VQMihwYXJzZXJzKSB7XG4gICAgcmV0dXJuIHBhcnNlcnNcbiAgICAgICAgLnJlZHVjZVJpZ2h0KChyZXN0LCBjdXJyKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gZm1hcCgoW3gsIHldKSA9PiB4ICsgeSwgYW5kVGhlbihjdXJyLCByZXN0KSk7XG4gICAgICAgIH0sIHJldHVyblAoJycpKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHBzdHJpbmcoc3RyKSB7XG4gICAgcmV0dXJuIHNlcXVlbmNlUChzdHIuc3BsaXQoJycpLm1hcChwY2hhcikpXG4gICAgICAgIC5zZXRMYWJlbCgncHN0cmluZyAnICsgc3RyKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHplcm9Pck1vcmUoeFApIHsgLy8gemVyb09yTW9yZSA6OiBwIGEgLT4gW2FdIC0+IHRyeSBbYV0gPSBwIGEgLT4gcCBbYV1cbiAgICByZXR1cm4gc3RyID0+IHtcbiAgICAgICAgbGV0IHJlczEgPSB4UC5ydW4oc3RyKTtcbiAgICAgICAgaWYgKGlzRmFpbHVyZShyZXMxKSkgcmV0dXJuIHN1Y2Nlc3MoW10sIHN0cik7XG4gICAgICAgIGxldCByZXNOID0gemVyb09yTW9yZSh4UCkocmVzMVsxXSk7XG4gICAgICAgIHJldHVybiBzdWNjZXNzKFtyZXMxWzBdXS5jb25jYXQocmVzTlswXSksIHJlc05bMV0pO1xuICAgIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtYW55KHhQKSB7XG4gICAgY29uc3QgbGFiZWwgPSAnbWFueSAnICsgeFAubGFiZWw7XG4gICAgcmV0dXJuIHBhcnNlcihzdHIgPT4ge1xuICAgICAgICByZXR1cm4gemVyb09yTW9yZSh4UCkoc3RyKTtcbiAgICB9LCBsYWJlbCkuc2V0TGFiZWwobGFiZWwpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbWFueTEoeFApIHtcbiAgICBjb25zdCBsYWJlbCA9ICdtYW55MSAnICsgeFAubGFiZWw7XG4gICAgcmV0dXJuIHBhcnNlcihzdHIgPT4ge1xuICAgICAgICBsZXQgcmVzMSA9IHhQLnJ1bihzdHIpO1xuICAgICAgICBpZiAoaXNGYWlsdXJlKHJlczEpKSByZXR1cm4gcmVzMTtcbiAgICAgICAgbGV0IHJlc04gPSB6ZXJvT3JNb3JlKHhQKShyZXMxWzFdKTtcbiAgICAgICAgcmV0dXJuIHN1Y2Nlc3MoW3JlczFbMF1dLmNvbmNhdChyZXNOWzBdKSwgcmVzTlsxXSk7XG4gICAgfSwgbGFiZWwpLnNldExhYmVsKGxhYmVsKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG9wdCh4UCkge1xuICAgIGNvbnN0IGxhYmVsID0gJ29wdCAnICsgeFAubGFiZWw7XG4gICAgcmV0dXJuIHBhcnNlcihzdHIgPT4ge1xuICAgICAgICBsZXQgcmVzID0geFAuZm1hcCh4ID0+IHNvbWUoeCkpLnJ1bihzdHIpO1xuICAgICAgICBpZiAoaXNTdWNjZXNzKHJlcykpIHJldHVybiByZXM7XG4gICAgICAgIHJldHVybiBzdWNjZXNzKG5vbmUoKSwgc3RyKTtcbiAgICB9LCBsYWJlbCkuc2V0TGFiZWwobGFiZWwpO1xufVxuXG4vLyBvcHQgZnJvbSB0aGUgYm9va1xuZXhwb3J0IGZ1bmN0aW9uIG9wdEJvb2socFgpIHtcbiAgICBjb25zdCBzb21lUCA9IHBYLmZtYXAoc29tZSk7XG4gICAgY29uc3Qgbm9uZVAgPSByZXR1cm5QKG5vbmUpO1xuICAgIHJldHVybiBzb21lUC5vckVsc2Uobm9uZVApO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZGlzY2FyZFNlY29uZChwMSwgcDIpIHtcbiAgICBjb25zdCBsYWJlbCA9IHAxLmxhYmVsICsgJyBkaXNjYXJkU2Vjb25kICcgKyBwMi5sYWJlbDtcbiAgICByZXR1cm4gcGFyc2VyKHN0ciA9PiB7XG4gICAgICAgIHJldHVybiBhbmRUaGVuKHAxLCBwMikuZm1hcCgoW3IxLCByMl0pID0+IHIxKS5ydW4oc3RyKTtcbiAgICB9LCBsYWJlbCkuc2V0TGFiZWwobGFiZWwpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZGlzY2FyZEZpcnN0KHAxLCBwMikge1xuICAgIGNvbnN0IGxhYmVsID0gcDEubGFiZWwgKyAnIGRpc2NhcmRGaXJzdCAnICsgcDIubGFiZWw7XG4gICAgcmV0dXJuIHBhcnNlcihzdHIgPT4ge1xuICAgICAgICByZXR1cm4gYW5kVGhlbihwMSwgcDIpLmZtYXAoKFtyMSwgcjJdKSA9PiByMikucnVuKHN0cik7XG4gICAgfSwgbGFiZWwpLnNldExhYmVsKGxhYmVsKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGJldHdlZW4ocDEsIHAyLCBwMykge1xuICAgIHJldHVybiBwMS5kaXNjYXJkRmlyc3QocDIpLmRpc2NhcmRTZWNvbmQocDMpXG4gICAgICAgIC5zZXRMYWJlbCgnYmV0d2VlbiAnICsgcDEubGFiZWwgKyAnLycgKyBwMi5sYWJlbCArICcvJyArIHAzLmxhYmVsKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGJldHdlZW5QYXJlbnMocHgpIHtcbiAgICByZXR1cm4gYmV0d2VlbihwY2hhcignKCcpLCBweCwgcGNoYXIoJyknKSlcbiAgICAgICAgLnNldExhYmVsKCdiZXR3ZWVuUGFyZW5zICcgKyBweC5sYWJlbCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBiaW5kUChmYW1iLCBweCkge1xuICAgIGxldCBsYWJlbCA9ICd1bmtub3duJztcbiAgICByZXR1cm4gcGFyc2VyKHN0ciA9PiB7XG4gICAgICAgIGNvbnN0IHJlcyA9IHB4LnJ1bihzdHIpO1xuICAgICAgICBpZiAoaXNGYWlsdXJlKHJlcykpIHJldHVybiByZXM7XG4gICAgICAgIHJldHVybiBmYW1iKHJlc1swXSkucnVuKHJlc1sxXSk7XG4gICAgfSwgbGFiZWwpLnNldExhYmVsKGxhYmVsKTtcbn1cblxuZnVuY3Rpb24gX2NvbnMoeCkge1xuICAgIHJldHVybiBmdW5jdGlvbiAoeHMpIHtcbiAgICAgICAgcmV0dXJuIFt4XS5jb25jYXQoeHMpO1xuICAgIH07XG59XG5cbmZ1bmN0aW9uIF9zZXRMYWJlbChweCwgbmV3TGFiZWwpIHtcbiAgICByZXR1cm4gcGFyc2VyKHN0ciA9PiB7XG4gICAgICAgIGxldCByZXN1bHQgPSBweC5ydW4oc3RyKTtcbiAgICAgICAgaWYgKGlzRmFpbHVyZShyZXN1bHQpKSByZXR1cm4gZmFpbHVyZShuZXdMYWJlbCwgcmVzdWx0WzFdKTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LCBuZXdMYWJlbCk7XG59XG5cbi8vIHRoZSByZWFsIHRoaW5nLi4uXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VyKGZuLCBsYWJlbCkge1xuICAgIHJldHVybiB7XG4gICAgICAgIHR5cGU6ICdwYXJzZXInLFxuICAgICAgICBsYWJlbDogbGFiZWwsXG4gICAgICAgIHJ1bihzdHIpIHtcbiAgICAgICAgICAgIHJldHVybiBmbihzdHIpO1xuICAgICAgICB9LFxuICAgICAgICBhcHBseShweCkge1xuICAgICAgICAgICAgcmV0dXJuIGFwcGx5UCh0aGlzKShweCk7XG4gICAgICAgICAgICAvL3JldHVybiB0aGlzLmJpbmQoYW5kVGhlbih0aGlzLCBweCkuZm1hcCgoW2YsIHhdKSA9PiBmKHgpKSkucnVuOyAvLyB3ZSBhcmUgdGhlIGZQXG4gICAgICAgIH0sXG4gICAgICAgIGZtYXAoZmFiKSB7XG4gICAgICAgICAgICAvL3JldHVybiBmbWFwKGZhYiwgdGhpcyk7XG4gICAgICAgICAgICAvL3JldHVybiBiaW5kUChzdHIgPT4gcmV0dXJuUChmYWIoc3RyKSksIHRoaXMpO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuYmluZChwYXJzZWRWYWx1ZSA9PiByZXR1cm5QKGZhYihwYXJzZWRWYWx1ZSkpKTtcbiAgICAgICAgfSxcbiAgICAgICAgYW5kVGhlbihweCkge1xuICAgICAgICAgICAgcmV0dXJuIGFuZFRoZW4odGhpcywgcHgpO1xuICAgICAgICB9LFxuICAgICAgICBvckVsc2UocHgpIHtcbiAgICAgICAgICAgIHJldHVybiBvckVsc2UodGhpcywgcHgpO1xuICAgICAgICB9LFxuICAgICAgICBkaXNjYXJkRmlyc3QocHgpIHtcbiAgICAgICAgICAgIHJldHVybiBkaXNjYXJkRmlyc3QodGhpcywgcHgpO1xuICAgICAgICB9LFxuICAgICAgICBkaXNjYXJkU2Vjb25kKHB4KSB7XG4gICAgICAgICAgICByZXR1cm4gZGlzY2FyZFNlY29uZCh0aGlzLCBweCk7XG4gICAgICAgIH0sXG4gICAgICAgIGJpbmQoZmFtYikge1xuICAgICAgICAgICAgcmV0dXJuIGJpbmRQKGZhbWIsIHRoaXMpO1xuICAgICAgICB9LFxuICAgICAgICBzZXRMYWJlbChuZXdMYWJlbCkge1xuICAgICAgICAgICAgcmV0dXJuIF9zZXRMYWJlbCh0aGlzLCBuZXdMYWJlbCk7XG4gICAgICAgIH1cbiAgICB9O1xufVxuIl19