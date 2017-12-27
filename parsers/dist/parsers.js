define(['exports', 'classes', 'maybe', 'validation'], function (exports, _classes, _maybe, _validation) {
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

    // Success or Failure

    var charParser = function charParser(char) {
        return function (pos) {
            if (typeof pos === 'string') pos = _classes.Position.fromText(pos);
            var optChar = pos.char();
            if (optChar.isNothing) return _validation.Validation.Failure(_classes.Tuple.Triple('charParser', 'no more input', pos));
            if (optChar.value === char) return _validation.Validation.Success(_classes.Tuple.Pair(char, pos.incrPos()));
            return _validation.Validation.Failure(_classes.Tuple.Triple('charParser', 'wanted ' + char + '; got ' + optChar.value, pos));
        };
    };

    var digitParser = function digitParser(digit) {
        return function (pos) {
            if (typeof pos === 'string') pos = _classes.Position.fromText(pos);
            var optChar = pos.char();
            if (optChar.isNothing) return _validation.Validation.Failure(_classes.Tuple.Triple('digitParser', 'no more input', pos));
            if (parseInt(optChar.value, 10) === digit) return _validation.Validation.Success(_classes.Tuple.Pair(digit, pos.incrPos()));
            return _validation.Validation.Failure(_classes.Tuple.Triple('digitParser', 'wanted ' + digit + '; got ' + optChar.value, pos));
        };
    };

    exports.charParser = charParser;
    exports.digitParser = digitParser;
    function pchar(char) {
        var label = 'pchar_' + char;
        var result = function result(pos) {
            return charParser(char)(pos);
        };
        return parser(result, label).setLabel(label);
    }

    function pdigit(digit) {
        return parser(function (pos) {
            return digitParser(digit)(pos);
        }, 'pdigit_' + digit);
    }

    function andThenX(p1, p2) {
        var label = p1.label + ' andThen ' + p2.label;
        return parser(function (pos) {
            var res1 = p1.run(pos);
            if (res1.isSuccess) {
                var res2 = p2.run(res1.value[1]);
                if (res2.isSuccess) {
                    return _validation.Validation.Success(_classes.Tuple.Pair(_classes.Tuple.Pair(res1.value[0], res2.value[0]), res2.value[1]));
                } else return _validation.Validation.Failure(_classes.Tuple.Triple(label, res2.value[1], res2.value[2]));
            } else return _validation.Validation.Failure(_classes.Tuple.Triple(label, res1.value[1], res1.value[2]));
        }, label);
    }

    // using bind
    function _andThen(p1, p2) {
        return p1.bind(function (parsedValue1) {
            return p2.bind(function (parsedValue2) {
                return returnP(_classes.Tuple.Pair(parsedValue1, parsedValue2));
            });
        }).setLabel(p1.label + ' andThen ' + p2.label);
    }

    exports.andThen = _andThen;
    function _orElse(p1, p2) {
        var label = p1.label + ' orElse ' + p2.label;
        return parser(function (pos) {
            var res1 = p1.run(pos);
            if (res1.isSuccess) return res1;
            var res2 = p2.run(pos);
            if (res2.isSuccess) return res2;
            return _validation.Validation.Failure(_classes.Tuple.Triple(label, res2.value[1], res2.value[2]));
        }, label).setLabel(label);
    }

    exports.orElse = _orElse;
    var _fail = parser(function (pos) {
        return _validation.Validation.Failure(_classes.Tuple.Triple('parsing failed', '_fail', pos));
    });

    // return neutral element instead of message
    var _succeed = parser(function (pos) {
        return _validation.Validation.Success(_classes.Tuple.Pair(_classes.Tuple.Pair('parsing succeeded', pos), '_succeed'));
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
            if (res.isSuccess) return _validation.Validation.Success(_classes.Tuple.Pair(fab(res.value[0]), res.value[1]));
            return _validation.Validation.Failure(_classes.Tuple.Triple(label, res.value[1], res.value[2]));
        }, label);
    }

    function returnP(value) {
        return parser(function (str) {
            return _validation.Validation.Success(_classes.Tuple.Pair(value, str));
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
            if (res1.isFailure) return _validation.Validation.Success(_classes.Tuple.Pair([], str));
            var resN = zeroOrMore(xP)(res1.value[1]);
            return _validation.Validation.Success(_classes.Tuple.Pair([res1.value[0]].concat(resN.value[0]), resN.value[1]));
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
            return _validation.Validation.Success(_classes.Tuple.Pair([res1.value[0]].concat(resN.value[0]), resN.value[1]));
        }, label).setLabel(label);
    }

    function opt(xP) {
        var label = 'opt ' + xP.label;
        return parser(function (str) {
            var res = xP.fmap(function (x) {
                return _maybe.Maybe.Just(x);
            }).run(str);
            if (res.isSuccess) return res;
            return _validation.Validation.Success(_classes.Tuple.Pair(_maybe.Maybe.Nothing(), str));
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
            return _andThen(p1, p2).fmap(function (_ref5) {
                var _ref6 = _slicedToArray(_ref5, 2),
                    x = _ref6[0],
                    y = _ref6[1];

                return x;
            }).run(str);
        }, label).setLabel(label);
    }

    exports.discardSecond = _discardSecond;
    function _discardFirst(p1, p2) {
        var label = p1.label + ' discardFirst ' + p2.label;
        return parser(function (str) {
            return _andThen(p1, p2).fmap(function (_ref7) {
                var _ref8 = _slicedToArray(_ref7, 2),
                    x = _ref8[0],
                    y = _ref8[1];

                return y;
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
            if (result.isFailure) return _validation.Validation.Failure(_classes.Tuple.Triple(newLabel, result.value[1], result.value[2]));
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2pzL3BhcnNlcnMuanMiXSwibmFtZXMiOlsicGNoYXIiLCJwZGlnaXQiLCJhbmRUaGVuWCIsImNob2ljZSIsImFueU9mIiwiZm1hcCIsInJldHVyblAiLCJhcHBseVB4IiwiYXBwbHlQIiwibGlmdDIiLCJzZXF1ZW5jZVAiLCJzZXF1ZW5jZVAyIiwicHN0cmluZyIsInplcm9Pck1vcmUiLCJtYW55IiwibWFueTEiLCJvcHQiLCJvcHRCb29rIiwiYmV0d2VlbiIsImJldHdlZW5QYXJlbnMiLCJiaW5kUCIsInBhcnNlciIsImNoYXJQYXJzZXIiLCJwb3MiLCJmcm9tVGV4dCIsIm9wdENoYXIiLCJjaGFyIiwiaXNOb3RoaW5nIiwiRmFpbHVyZSIsIlRyaXBsZSIsInZhbHVlIiwiU3VjY2VzcyIsIlBhaXIiLCJpbmNyUG9zIiwiZGlnaXRQYXJzZXIiLCJwYXJzZUludCIsImRpZ2l0IiwibGFiZWwiLCJyZXN1bHQiLCJzZXRMYWJlbCIsInAxIiwicDIiLCJyZXMxIiwicnVuIiwiaXNTdWNjZXNzIiwicmVzMiIsImFuZFRoZW4iLCJiaW5kIiwicGFyc2VkVmFsdWUxIiwicGFyc2VkVmFsdWUyIiwib3JFbHNlIiwiX2ZhaWwiLCJfc3VjY2VlZCIsInBhcnNlcnMiLCJyZWR1Y2VSaWdodCIsInJlc3QiLCJjdXJyIiwicmVkdWNlIiwiYWNjIiwiY2hhcnMiLCJtYXAiLCJmYWIiLCJwYXJzZXIxIiwidG9TdHJpbmciLCJyZXMiLCJzdHIiLCJmUCIsInhQIiwiZiIsIngiLCJwYXJzZWRWYWx1ZWYiLCJwYXJzZWRWYWx1ZXgiLCJmYWFiIiwicGFyc2VyMiIsImFwcGx5IiwiX2NvbnMiLCJ5Iiwic3BsaXQiLCJpc0ZhaWx1cmUiLCJyZXNOIiwiY29uY2F0IiwiSnVzdCIsIk5vdGhpbmciLCJwWCIsInNvbWVQIiwibm9uZVAiLCJkaXNjYXJkU2Vjb25kIiwiZGlzY2FyZEZpcnN0IiwicDMiLCJweCIsImZhbWIiLCJ4cyIsIl9zZXRMYWJlbCIsIm5ld0xhYmVsIiwiZm4i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c2Vycy5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vIGNmci4gXCJVbmRlcnN0YW5kaW5nIFBhcnNlciBDb21iaW5hdG9yc1wiIChGIyBmb3IgRnVuIGFuZCBQcm9maXQpXG5cbmltcG9ydCB7XG4gICAgVHVwbGUsXG4gICAgUG9zaXRpb24sXG59IGZyb20gJ2NsYXNzZXMnO1xuaW1wb3J0IHtNYXliZX0gZnJvbSAnbWF5YmUnOyAvLyBKdXN0IG9yIE5vdGhpbmdcbmltcG9ydCB7VmFsaWRhdGlvbn0gZnJvbSAndmFsaWRhdGlvbic7IC8vIFN1Y2Nlc3Mgb3IgRmFpbHVyZVxuXG5jb25zdCBjaGFyUGFyc2VyID0gY2hhciA9PiBwb3MgPT4ge1xuICAgIGlmICh0eXBlb2YgcG9zID09PSAnc3RyaW5nJykgcG9zID0gUG9zaXRpb24uZnJvbVRleHQocG9zKTtcbiAgICBjb25zdCBvcHRDaGFyID0gcG9zLmNoYXIoKTtcbiAgICBpZiAob3B0Q2hhci5pc05vdGhpbmcpIHJldHVybiBWYWxpZGF0aW9uLkZhaWx1cmUoVHVwbGUuVHJpcGxlKCdjaGFyUGFyc2VyJywgJ25vIG1vcmUgaW5wdXQnLCBwb3MpKTtcbiAgICBpZiAob3B0Q2hhci52YWx1ZSA9PT0gY2hhcikgcmV0dXJuIFZhbGlkYXRpb24uU3VjY2VzcyhUdXBsZS5QYWlyKGNoYXIsIHBvcy5pbmNyUG9zKCkpKTtcbiAgICByZXR1cm4gVmFsaWRhdGlvbi5GYWlsdXJlKFR1cGxlLlRyaXBsZSgnY2hhclBhcnNlcicsICd3YW50ZWQgJyArIGNoYXIgKyAnOyBnb3QgJyArIG9wdENoYXIudmFsdWUsIHBvcykpO1xufTtcblxuY29uc3QgZGlnaXRQYXJzZXIgPSBkaWdpdCA9PiBwb3MgPT4ge1xuICAgIGlmICh0eXBlb2YgcG9zID09PSAnc3RyaW5nJykgcG9zID0gUG9zaXRpb24uZnJvbVRleHQocG9zKTtcbiAgICBjb25zdCBvcHRDaGFyID0gcG9zLmNoYXIoKTtcbiAgICBpZiAob3B0Q2hhci5pc05vdGhpbmcpIHJldHVybiBWYWxpZGF0aW9uLkZhaWx1cmUoVHVwbGUuVHJpcGxlKCdkaWdpdFBhcnNlcicsICdubyBtb3JlIGlucHV0JywgcG9zKSk7XG4gICAgaWYgKHBhcnNlSW50KG9wdENoYXIudmFsdWUsIDEwKSA9PT0gZGlnaXQpIHJldHVybiBWYWxpZGF0aW9uLlN1Y2Nlc3MoVHVwbGUuUGFpcihkaWdpdCwgcG9zLmluY3JQb3MoKSkpO1xuICAgIHJldHVybiBWYWxpZGF0aW9uLkZhaWx1cmUoVHVwbGUuVHJpcGxlKCdkaWdpdFBhcnNlcicsICd3YW50ZWQgJyArIGRpZ2l0ICsgJzsgZ290ICcgKyBvcHRDaGFyLnZhbHVlLCBwb3MpKTtcbn07XG5cbmV4cG9ydCB7Y2hhclBhcnNlciwgZGlnaXRQYXJzZXJ9O1xuXG5leHBvcnQgZnVuY3Rpb24gcGNoYXIoY2hhcikge1xuICAgIGNvbnN0IGxhYmVsID0gJ3BjaGFyXycgKyBjaGFyO1xuICAgIGxldCByZXN1bHQgPSBmdW5jdGlvbiAocG9zKSB7XG4gICAgICAgIHJldHVybiBjaGFyUGFyc2VyKGNoYXIpKHBvcyk7XG4gICAgfTtcbiAgICByZXR1cm4gcGFyc2VyKHJlc3VsdCwgbGFiZWwpLnNldExhYmVsKGxhYmVsKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHBkaWdpdChkaWdpdCkge1xuICAgIHJldHVybiBwYXJzZXIocG9zID0+IGRpZ2l0UGFyc2VyKGRpZ2l0KShwb3MpLCAncGRpZ2l0XycgKyBkaWdpdCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhbmRUaGVuWChwMSwgcDIpIHtcbiAgICBjb25zdCBsYWJlbCA9IHAxLmxhYmVsICsgJyBhbmRUaGVuICcgKyBwMi5sYWJlbDtcbiAgICByZXR1cm4gcGFyc2VyKGZ1bmN0aW9uIChwb3MpIHtcbiAgICAgICAgbGV0IHJlczEgPSBwMS5ydW4ocG9zKTtcbiAgICAgICAgaWYgKHJlczEuaXNTdWNjZXNzKSB7XG4gICAgICAgICAgICBsZXQgcmVzMiA9IHAyLnJ1bihyZXMxLnZhbHVlWzFdKTtcbiAgICAgICAgICAgIGlmIChyZXMyLmlzU3VjY2Vzcykge1xuICAgICAgICAgICAgICAgIHJldHVybiBWYWxpZGF0aW9uLlN1Y2Nlc3MoVHVwbGUuUGFpcihUdXBsZS5QYWlyKHJlczEudmFsdWVbMF0sIHJlczIudmFsdWVbMF0pLCByZXMyLnZhbHVlWzFdKSk7XG4gICAgICAgICAgICB9IGVsc2UgcmV0dXJuIFZhbGlkYXRpb24uRmFpbHVyZShUdXBsZS5UcmlwbGUobGFiZWwsIHJlczIudmFsdWVbMV0sIHJlczIudmFsdWVbMl0pKTtcbiAgICAgICAgfSBlbHNlIHJldHVybiBWYWxpZGF0aW9uLkZhaWx1cmUoVHVwbGUuVHJpcGxlKGxhYmVsLCByZXMxLnZhbHVlWzFdLCByZXMxLnZhbHVlWzJdKSk7XG4gICAgfSwgbGFiZWwpO1xufVxuXG4vLyB1c2luZyBiaW5kXG5leHBvcnQgZnVuY3Rpb24gYW5kVGhlbihwMSwgcDIpIHtcbiAgICByZXR1cm4gcDEuYmluZChwYXJzZWRWYWx1ZTEgPT4ge1xuICAgICAgICByZXR1cm4gcDIuYmluZChwYXJzZWRWYWx1ZTIgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHJldHVyblAoVHVwbGUuUGFpcihwYXJzZWRWYWx1ZTEsIHBhcnNlZFZhbHVlMikpO1xuICAgICAgICB9KTtcbiAgICB9KS5zZXRMYWJlbChwMS5sYWJlbCArICcgYW5kVGhlbiAnICsgcDIubGFiZWwpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gb3JFbHNlKHAxLCBwMikge1xuICAgIGNvbnN0IGxhYmVsID0gcDEubGFiZWwgKyAnIG9yRWxzZSAnICsgcDIubGFiZWw7XG4gICAgcmV0dXJuIHBhcnNlcihwb3MgPT4ge1xuICAgICAgICBjb25zdCByZXMxID0gcDEucnVuKHBvcyk7XG4gICAgICAgIGlmIChyZXMxLmlzU3VjY2VzcykgcmV0dXJuIHJlczE7XG4gICAgICAgIGNvbnN0IHJlczIgPSBwMi5ydW4ocG9zKTtcbiAgICAgICAgaWYgKHJlczIuaXNTdWNjZXNzKSByZXR1cm4gcmVzMjtcbiAgICAgICAgcmV0dXJuIFZhbGlkYXRpb24uRmFpbHVyZShUdXBsZS5UcmlwbGUobGFiZWwsIHJlczIudmFsdWVbMV0sIHJlczIudmFsdWVbMl0pKTtcbiAgICB9LCBsYWJlbCkuc2V0TGFiZWwobGFiZWwpO1xufVxuXG5sZXQgX2ZhaWwgPSBwYXJzZXIocG9zID0+IFZhbGlkYXRpb24uRmFpbHVyZShUdXBsZS5UcmlwbGUoJ3BhcnNpbmcgZmFpbGVkJywgJ19mYWlsJywgcG9zKSkpO1xuXG4vLyByZXR1cm4gbmV1dHJhbCBlbGVtZW50IGluc3RlYWQgb2YgbWVzc2FnZVxubGV0IF9zdWNjZWVkID0gcGFyc2VyKHBvcyA9PiBWYWxpZGF0aW9uLlN1Y2Nlc3MoVHVwbGUuUGFpcihUdXBsZS5QYWlyKCdwYXJzaW5nIHN1Y2NlZWRlZCcsIHBvcyksICdfc3VjY2VlZCcpKSk7XG5cbmV4cG9ydCBmdW5jdGlvbiBjaG9pY2UocGFyc2Vycykge1xuICAgIHJldHVybiBwYXJzZXJzLnJlZHVjZVJpZ2h0KChyZXN0LCBjdXJyKSA9PiBvckVsc2UoY3VyciwgcmVzdCksIF9mYWlsKVxuICAgICAgICAuc2V0TGFiZWwoJ2Nob2ljZSAnICsgcGFyc2Vycy5yZWR1Y2UoKGFjYywgY3VycikgPT4gYWNjICsgJy8nICsgY3Vyci5sYWJlbCwgJycpKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGFueU9mKGNoYXJzKSB7XG4gICAgcmV0dXJuIGNob2ljZShjaGFycy5tYXAocGNoYXIpKVxuICAgICAgICAuc2V0TGFiZWwoJ2FueU9mICcgKyBjaGFycy5yZWR1Y2UoKGFjYywgY3VycikgPT4gYWNjICsgY3VyciwgJycpKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGZtYXAoZmFiLCBwYXJzZXIxKSB7XG4gICAgY29uc3QgbGFiZWwgPSBwYXJzZXIxLmxhYmVsICsgJyBmbWFwICcgKyBmYWIudG9TdHJpbmcoKTtcbiAgICByZXR1cm4gcGFyc2VyKHN0ciA9PiB7XG4gICAgICAgIGxldCByZXMgPSBwYXJzZXIxLnJ1bihzdHIpO1xuICAgICAgICBpZiAocmVzLmlzU3VjY2VzcykgcmV0dXJuIFZhbGlkYXRpb24uU3VjY2VzcyhUdXBsZS5QYWlyKGZhYihyZXMudmFsdWVbMF0pLCByZXMudmFsdWVbMV0pKTtcbiAgICAgICAgcmV0dXJuIFZhbGlkYXRpb24uRmFpbHVyZShUdXBsZS5UcmlwbGUobGFiZWwsIHJlcy52YWx1ZVsxXSwgcmVzLnZhbHVlWzJdKSk7XG4gICAgfSwgbGFiZWwpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcmV0dXJuUCh2YWx1ZSkge1xuICAgIHJldHVybiBwYXJzZXIoc3RyID0+IFZhbGlkYXRpb24uU3VjY2VzcyhUdXBsZS5QYWlyKHZhbHVlLCBzdHIpKSwgdmFsdWUpO1xufVxuXG4vLyBwYXJzZXIoYSAtPiBiKSAtPiBwYXJzZXIoYSkgLT4gcGFyc2VyKGIpXG5leHBvcnQgZnVuY3Rpb24gYXBwbHlQeChmUCkge1xuICAgIHJldHVybiBmdW5jdGlvbiAoeFApIHtcbiAgICAgICAgcmV0dXJuIGFuZFRoZW4oZlAsIHhQKS5mbWFwKChbZiwgeF0pID0+IGYoeCkpO1xuICAgIH07XG59XG5cbi8vIHVzaW5nIGJpbmRcbmV4cG9ydCBmdW5jdGlvbiBhcHBseVAoZlApIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKHhQKSB7XG4gICAgICAgIHJldHVybiBmUC5iaW5kKHBhcnNlZFZhbHVlZiA9PiB7XG4gICAgICAgICAgICByZXR1cm4geFAuYmluZChwYXJzZWRWYWx1ZXggPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiByZXR1cm5QKHBhcnNlZFZhbHVlZihwYXJzZWRWYWx1ZXgpKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbGlmdDIoZmFhYikge1xuICAgIHJldHVybiBmdW5jdGlvbiAocGFyc2VyMSkge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKHBhcnNlcjIpIHtcbiAgICAgICAgICAgIC8vcmV0dXJuIGFwcGx5UChhcHBseVAocmV0dXJuUChmYWFiKSkocGFyc2VyMSkpKHBhcnNlcjIpO1xuICAgICAgICAgICAgcmV0dXJuIHJldHVyblAoZmFhYikuYXBwbHkocGFyc2VyMSkuYXBwbHkocGFyc2VyMik7IC8vIHVzaW5nIGluc3RhbmNlIG1ldGhvZHNcbiAgICAgICAgfTtcbiAgICB9O1xufVxuXG4vLyB1c2luZyBsaWZ0Mihjb25zKVxuZXhwb3J0IGZ1bmN0aW9uIHNlcXVlbmNlUChwYXJzZXJzKSB7XG4gICAgcmV0dXJuIHBhcnNlcnNcbiAgICAgICAgLnJlZHVjZVJpZ2h0KChyZXN0LCBjdXJyKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gbGlmdDIoX2NvbnMpKGN1cnIpKHJlc3QpO1xuICAgICAgICB9LCByZXR1cm5QKFtdKSk7XG59XG5cbi8vIHVzaW5nIG5haXZlIGFuZFRoZW4gJiYgZm1hcCAtLT4gcmV0dXJucyBzdHJpbmdzLCBub3QgYXJyYXlzIVxuZXhwb3J0IGZ1bmN0aW9uIHNlcXVlbmNlUDIocGFyc2Vycykge1xuICAgIHJldHVybiBwYXJzZXJzXG4gICAgICAgIC5yZWR1Y2VSaWdodCgocmVzdCwgY3VycikgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIGZtYXAoKFt4LCB5XSkgPT4geCArIHksIGFuZFRoZW4oY3VyciwgcmVzdCkpO1xuICAgICAgICB9LCByZXR1cm5QKCcnKSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwc3RyaW5nKHN0cikge1xuICAgIHJldHVybiBzZXF1ZW5jZVAoc3RyLnNwbGl0KCcnKS5tYXAocGNoYXIpKVxuICAgICAgICAuc2V0TGFiZWwoJ3BzdHJpbmcgJyArIHN0cik7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB6ZXJvT3JNb3JlKHhQKSB7IC8vIHplcm9Pck1vcmUgOjogcCBhIC0+IFthXSAtPiB0cnkgW2FdID0gcCBhIC0+IHAgW2FdXG4gICAgcmV0dXJuIHN0ciA9PiB7XG4gICAgICAgIGxldCByZXMxID0geFAucnVuKHN0cik7XG4gICAgICAgIGlmIChyZXMxLmlzRmFpbHVyZSkgcmV0dXJuIFZhbGlkYXRpb24uU3VjY2VzcyhUdXBsZS5QYWlyKFtdLCBzdHIpKTtcbiAgICAgICAgbGV0IHJlc04gPSB6ZXJvT3JNb3JlKHhQKShyZXMxLnZhbHVlWzFdKTtcbiAgICAgICAgcmV0dXJuIFZhbGlkYXRpb24uU3VjY2VzcyhUdXBsZS5QYWlyKFtyZXMxLnZhbHVlWzBdXS5jb25jYXQocmVzTi52YWx1ZVswXSksIHJlc04udmFsdWVbMV0pKTtcbiAgICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbWFueSh4UCkge1xuICAgIGNvbnN0IGxhYmVsID0gJ21hbnkgJyArIHhQLmxhYmVsO1xuICAgIHJldHVybiBwYXJzZXIoc3RyID0+IHtcbiAgICAgICAgcmV0dXJuIHplcm9Pck1vcmUoeFApKHN0cik7XG4gICAgfSwgbGFiZWwpLnNldExhYmVsKGxhYmVsKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1hbnkxKHhQKSB7XG4gICAgY29uc3QgbGFiZWwgPSAnbWFueTEgJyArIHhQLmxhYmVsO1xuICAgIHJldHVybiBwYXJzZXIoc3RyID0+IHtcbiAgICAgICAgbGV0IHJlczEgPSB4UC5ydW4oc3RyKTtcbiAgICAgICAgaWYgKHJlczEuaXNGYWlsdXJlKSByZXR1cm4gcmVzMTtcbiAgICAgICAgbGV0IHJlc04gPSB6ZXJvT3JNb3JlKHhQKShyZXMxLnZhbHVlWzFdKTtcbiAgICAgICAgcmV0dXJuIFZhbGlkYXRpb24uU3VjY2VzcyhUdXBsZS5QYWlyKFtyZXMxLnZhbHVlWzBdXS5jb25jYXQocmVzTi52YWx1ZVswXSksIHJlc04udmFsdWVbMV0pKTtcbiAgICB9LCBsYWJlbCkuc2V0TGFiZWwobGFiZWwpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gb3B0KHhQKSB7XG4gICAgY29uc3QgbGFiZWwgPSAnb3B0ICcgKyB4UC5sYWJlbDtcbiAgICByZXR1cm4gcGFyc2VyKHN0ciA9PiB7XG4gICAgICAgIGxldCByZXMgPSB4UC5mbWFwKHggPT4gTWF5YmUuSnVzdCh4KSkucnVuKHN0cik7XG4gICAgICAgIGlmIChyZXMuaXNTdWNjZXNzKSByZXR1cm4gcmVzO1xuICAgICAgICByZXR1cm4gVmFsaWRhdGlvbi5TdWNjZXNzKFR1cGxlLlBhaXIoTWF5YmUuTm90aGluZygpLCBzdHIpKTtcbiAgICB9LCBsYWJlbCkuc2V0TGFiZWwobGFiZWwpO1xufVxuXG4vLyBvcHQgZnJvbSB0aGUgYm9vayAtIHdvcmtzIG9rLCBidXQgdG9TdHJpbmcoKSBnaXZlcyBzdHJhbmdlIHJlc3VsdHNcbmV4cG9ydCBmdW5jdGlvbiBvcHRCb29rKHBYKSB7XG4gICAgY29uc3Qgc29tZVAgPSBwWC5mbWFwKE1heWJlLkp1c3QpO1xuICAgIGNvbnN0IG5vbmVQID0gcmV0dXJuUChNYXliZS5Ob3RoaW5nKTtcbiAgICByZXR1cm4gc29tZVAub3JFbHNlKG5vbmVQKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRpc2NhcmRTZWNvbmQocDEsIHAyKSB7XG4gICAgY29uc3QgbGFiZWwgPSBwMS5sYWJlbCArICcgZGlzY2FyZFNlY29uZCAnICsgcDIubGFiZWw7XG4gICAgcmV0dXJuIHBhcnNlcihzdHIgPT4ge1xuICAgICAgICByZXR1cm4gYW5kVGhlbihwMSwgcDIpLmZtYXAoKFt4LCB5XSkgPT4geCkucnVuKHN0cik7XG4gICAgfSwgbGFiZWwpLnNldExhYmVsKGxhYmVsKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRpc2NhcmRGaXJzdChwMSwgcDIpIHtcbiAgICBjb25zdCBsYWJlbCA9IHAxLmxhYmVsICsgJyBkaXNjYXJkRmlyc3QgJyArIHAyLmxhYmVsO1xuICAgIHJldHVybiBwYXJzZXIoc3RyID0+IHtcbiAgICAgICAgcmV0dXJuIGFuZFRoZW4ocDEsIHAyKS5mbWFwKChbeCwgeV0pID0+IHkpLnJ1bihzdHIpO1xuICAgIH0sIGxhYmVsKS5zZXRMYWJlbChsYWJlbCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBiZXR3ZWVuKHAxLCBwMiwgcDMpIHtcbiAgICByZXR1cm4gcDEuZGlzY2FyZEZpcnN0KHAyKS5kaXNjYXJkU2Vjb25kKHAzKVxuICAgICAgICAuc2V0TGFiZWwoJ2JldHdlZW4gJyArIHAxLmxhYmVsICsgJy8nICsgcDIubGFiZWwgKyAnLycgKyBwMy5sYWJlbCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBiZXR3ZWVuUGFyZW5zKHB4KSB7XG4gICAgcmV0dXJuIGJldHdlZW4ocGNoYXIoJygnKSwgcHgsIHBjaGFyKCcpJykpXG4gICAgICAgIC5zZXRMYWJlbCgnYmV0d2VlblBhcmVucyAnICsgcHgubGFiZWwpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYmluZFAoZmFtYiwgcHgpIHtcbiAgICBsZXQgbGFiZWwgPSAndW5rbm93bic7XG4gICAgcmV0dXJuIHBhcnNlcihzdHIgPT4ge1xuICAgICAgICBjb25zdCByZXMgPSBweC5ydW4oc3RyKTtcbiAgICAgICAgaWYgKHJlcy5pc0ZhaWx1cmUpIHJldHVybiByZXM7XG4gICAgICAgIHJldHVybiBmYW1iKHJlcy52YWx1ZVswXSkucnVuKHJlcy52YWx1ZVsxXSk7XG4gICAgfSwgbGFiZWwpLnNldExhYmVsKGxhYmVsKTtcbn1cblxuZnVuY3Rpb24gX2NvbnMoeCkge1xuICAgIHJldHVybiBmdW5jdGlvbiAoeHMpIHtcbiAgICAgICAgcmV0dXJuIFt4XS5jb25jYXQoeHMpO1xuICAgIH07XG59XG5cbmZ1bmN0aW9uIF9zZXRMYWJlbChweCwgbmV3TGFiZWwpIHtcbiAgICByZXR1cm4gcGFyc2VyKHN0ciA9PiB7XG4gICAgICAgIGxldCByZXN1bHQgPSBweC5ydW4oc3RyKTtcbiAgICAgICAgaWYgKHJlc3VsdC5pc0ZhaWx1cmUpIHJldHVybiBWYWxpZGF0aW9uLkZhaWx1cmUoVHVwbGUuVHJpcGxlKG5ld0xhYmVsLCByZXN1bHQudmFsdWVbMV0sIHJlc3VsdC52YWx1ZVsyXSkpO1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sIG5ld0xhYmVsKTtcbn1cblxuLy8gdGhlIHJlYWwgdGhpbmcuLi5cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZXIoZm4sIGxhYmVsKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgdHlwZTogJ3BhcnNlcicsXG4gICAgICAgIGxhYmVsOiBsYWJlbCxcbiAgICAgICAgcnVuKHN0cikge1xuICAgICAgICAgICAgcmV0dXJuIGZuKHN0cik7XG4gICAgICAgIH0sXG4gICAgICAgIGFwcGx5KHB4KSB7XG4gICAgICAgICAgICByZXR1cm4gYXBwbHlQKHRoaXMpKHB4KTtcbiAgICAgICAgICAgIC8vcmV0dXJuIHRoaXMuYmluZChhbmRUaGVuKHRoaXMsIHB4KS5mbWFwKChbZiwgeF0pID0+IGYoeCkpKS5ydW47IC8vIHdlIGFyZSB0aGUgZlBcbiAgICAgICAgfSxcbiAgICAgICAgZm1hcChmYWIpIHtcbiAgICAgICAgICAgIC8vcmV0dXJuIGZtYXAoZmFiLCB0aGlzKTtcbiAgICAgICAgICAgIC8vcmV0dXJuIGJpbmRQKHN0ciA9PiByZXR1cm5QKGZhYihzdHIpKSwgdGhpcyk7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5iaW5kKHBhcnNlZFZhbHVlID0+IHJldHVyblAoZmFiKHBhcnNlZFZhbHVlKSkpO1xuICAgICAgICB9LFxuICAgICAgICBhbmRUaGVuKHB4KSB7XG4gICAgICAgICAgICByZXR1cm4gYW5kVGhlbih0aGlzLCBweCk7XG4gICAgICAgIH0sXG4gICAgICAgIG9yRWxzZShweCkge1xuICAgICAgICAgICAgcmV0dXJuIG9yRWxzZSh0aGlzLCBweCk7XG4gICAgICAgIH0sXG4gICAgICAgIGRpc2NhcmRGaXJzdChweCkge1xuICAgICAgICAgICAgcmV0dXJuIGRpc2NhcmRGaXJzdCh0aGlzLCBweCk7XG4gICAgICAgIH0sXG4gICAgICAgIGRpc2NhcmRTZWNvbmQocHgpIHtcbiAgICAgICAgICAgIHJldHVybiBkaXNjYXJkU2Vjb25kKHRoaXMsIHB4KTtcbiAgICAgICAgfSxcbiAgICAgICAgYmluZChmYW1iKSB7XG4gICAgICAgICAgICByZXR1cm4gYmluZFAoZmFtYiwgdGhpcyk7XG4gICAgICAgIH0sXG4gICAgICAgIHNldExhYmVsKG5ld0xhYmVsKSB7XG4gICAgICAgICAgICByZXR1cm4gX3NldExhYmVsKHRoaXMsIG5ld0xhYmVsKTtcbiAgICAgICAgfVxuICAgIH07XG59XG4iXX0=