define(['exports', 'util', 'classes', 'maybe', 'validation'], function (exports, _util, _classes, _maybe, _validation) {
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
        return function (str) {
            if ('' === str) return _validation.Validation.Failure((0, _classes.Pair)('charParser', 'no more input'));
            if ((0, _util.head)(str) === char) return _validation.Validation.Success((0, _classes.Pair)(char, (0, _util.tail)(str)));
            return _validation.Validation.Failure((0, _classes.Pair)('charParser', 'wanted ' + char + '; got ' + (0, _util.head)(str)));
        };
    };

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

    function andThenX(p1, p2) {
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

    // using bind
    function _andThen(p1, p2) {
        return p1.bind(function (parsedValue1) {
            return p2.bind(function (parsedValue2) {
                return returnP((0, _classes.Pair)(parsedValue1, parsedValue2));
            });
        }).setLabel(p1.label + ' andThen ' + p2.label);
    }

    exports.andThen = _andThen;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2pzL3BhcnNlcnMuanMiXSwibmFtZXMiOlsicGNoYXIiLCJwZGlnaXQiLCJhbmRUaGVuWCIsImNob2ljZSIsImFueU9mIiwiZm1hcCIsInJldHVyblAiLCJhcHBseVB4IiwiYXBwbHlQIiwibGlmdDIiLCJzZXF1ZW5jZVAiLCJzZXF1ZW5jZVAyIiwicHN0cmluZyIsInplcm9Pck1vcmUiLCJtYW55IiwibWFueTEiLCJvcHQiLCJvcHRCb29rIiwiYmV0d2VlbiIsImJldHdlZW5QYXJlbnMiLCJiaW5kUCIsInBhcnNlciIsImNoYXJQYXJzZXIiLCJzdHIiLCJGYWlsdXJlIiwiY2hhciIsIlN1Y2Nlc3MiLCJkaWdpdFBhcnNlciIsInBhcnNlSW50IiwiZGlnaXQiLCJsYWJlbCIsInJlc3VsdCIsInNldExhYmVsIiwicDEiLCJwMiIsInJlczEiLCJydW4iLCJpc1N1Y2Nlc3MiLCJyZXMyIiwidmFsdWUiLCJhbmRUaGVuIiwiYmluZCIsInBhcnNlZFZhbHVlMSIsInBhcnNlZFZhbHVlMiIsIm9yRWxzZSIsIl9mYWlsIiwiX3N1Y2NlZWQiLCJwYXJzZXJzIiwicmVkdWNlUmlnaHQiLCJyZXN0IiwiY3VyciIsInJlZHVjZSIsImFjYyIsImNoYXJzIiwibWFwIiwiZmFiIiwicGFyc2VyMSIsInRvU3RyaW5nIiwicmVzIiwiZlAiLCJ4UCIsImYiLCJ4IiwicGFyc2VkVmFsdWVmIiwicGFyc2VkVmFsdWV4IiwiZmFhYiIsInBhcnNlcjIiLCJhcHBseSIsIl9jb25zIiwieSIsInNwbGl0IiwiaXNGYWlsdXJlIiwicmVzTiIsImNvbmNhdCIsIkp1c3QiLCJOb3RoaW5nIiwicFgiLCJzb21lUCIsIm5vbmVQIiwiZGlzY2FyZFNlY29uZCIsImRpc2NhcmRGaXJzdCIsInAzIiwicHgiLCJmYW1iIiwieHMiLCJfc2V0TGFiZWwiLCJuZXdMYWJlbCIsImZuIiwidHlwZSIsInBhcnNlZFZhbHVlIl0sIm1hcHBpbmdzIjoiOzs7Ozs7O1lBd0JnQkEsSyxHQUFBQSxLO1lBUUFD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QUFDSCxhQTdCRTtBQThCSG5ELG9CQTlCRyxvQkE4Qk1zRCxRQTlCTixFQThCZ0I7QUFDZix1QkFBT0QsVUFBVSxJQUFWLEVBQWdCQyxRQUFoQixDQUFQO0FBQ0g7QUFoQ0UsU0FBUDtBQWtDSCIsImZpbGUiOiJwYXJzZXJzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8gY2ZyLiBcIlVuZGVyc3RhbmRpbmcgUGFyc2VyIENvbWJpbmF0b3JzXCIgKEYjIGZvciBGdW4gYW5kIFByb2ZpdClcblxuaW1wb3J0IHtcbiAgICBoZWFkLFxuICAgIHRhaWwsXG59IGZyb20gJ3V0aWwnO1xuaW1wb3J0IHtQYWlyfSBmcm9tICdjbGFzc2VzJztcbmltcG9ydCB7TWF5YmV9IGZyb20gJ21heWJlJzsgLy8gSnVzdCBvciBOb3RoaW5nXG5pbXBvcnQge1ZhbGlkYXRpb259IGZyb20gJ3ZhbGlkYXRpb24nOyAvLyBTdWNjZXNzIG9yIEZhaWx1cmVcblxuY29uc3QgY2hhclBhcnNlciA9IGNoYXIgPT4gc3RyID0+IHtcbiAgICBpZiAoJycgPT09IHN0cikgcmV0dXJuIFZhbGlkYXRpb24uRmFpbHVyZShQYWlyKCdjaGFyUGFyc2VyJywgJ25vIG1vcmUgaW5wdXQnKSk7XG4gICAgaWYgKGhlYWQoc3RyKSA9PT0gY2hhcikgcmV0dXJuIFZhbGlkYXRpb24uU3VjY2VzcyhQYWlyKGNoYXIsIHRhaWwoc3RyKSkpO1xuICAgIHJldHVybiBWYWxpZGF0aW9uLkZhaWx1cmUoUGFpcignY2hhclBhcnNlcicsICd3YW50ZWQgJyArIGNoYXIgKyAnOyBnb3QgJyArIGhlYWQoc3RyKSkpO1xufTtcblxuY29uc3QgZGlnaXRQYXJzZXIgPSBkaWdpdCA9PiBzdHIgPT4ge1xuICAgIGlmICgnJyA9PT0gc3RyKSByZXR1cm4gVmFsaWRhdGlvbi5GYWlsdXJlKFBhaXIoJ2RpZ2l0UGFyc2VyJywgJ25vIG1vcmUgaW5wdXQnKSk7XG4gICAgaWYgKHBhcnNlSW50KGhlYWQoc3RyKSwgMTApID09PSBkaWdpdCkgcmV0dXJuIFZhbGlkYXRpb24uU3VjY2VzcyhQYWlyKGRpZ2l0LCB0YWlsKHN0cikpKTtcbiAgICByZXR1cm4gVmFsaWRhdGlvbi5GYWlsdXJlKFBhaXIoJ2RpZ2l0UGFyc2VyJywgJ3dhbnRlZCAnICsgZGlnaXQgKyAnOyBnb3QgJyArIGhlYWQoc3RyKSkpO1xufTtcblxuZXhwb3J0IHtjaGFyUGFyc2VyLCBkaWdpdFBhcnNlcn07XG5cbmV4cG9ydCBmdW5jdGlvbiBwY2hhcihjaGFyKSB7XG4gICAgY29uc3QgbGFiZWwgPSAncGNoYXJfJyArIGNoYXI7XG4gICAgbGV0IHJlc3VsdCA9IGZ1bmN0aW9uIChzdHIpIHtcbiAgICAgICAgcmV0dXJuIGNoYXJQYXJzZXIoY2hhcikoc3RyKTtcbiAgICB9O1xuICAgIHJldHVybiBwYXJzZXIocmVzdWx0LCBsYWJlbCkuc2V0TGFiZWwobGFiZWwpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcGRpZ2l0KGRpZ2l0KSB7XG4gICAgcmV0dXJuIHBhcnNlcihzdHIgPT4gZGlnaXRQYXJzZXIoZGlnaXQpKHN0ciksICdwZGlnaXRfJyArIGRpZ2l0KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGFuZFRoZW5YKHAxLCBwMikge1xuICAgIGNvbnN0IGxhYmVsID0gcDEubGFiZWwgKyAnIGFuZFRoZW4gJyArIHAyLmxhYmVsO1xuICAgIHJldHVybiBwYXJzZXIoZnVuY3Rpb24gKHN0cikge1xuICAgICAgICBsZXQgcmVzMSA9IHAxLnJ1bihzdHIpO1xuICAgICAgICBpZiAocmVzMS5pc1N1Y2Nlc3MpIHtcbiAgICAgICAgICAgIGxldCByZXMyID0gcDIucnVuKHJlczEudmFsdWVbMV0pO1xuICAgICAgICAgICAgaWYgKHJlczIuaXNTdWNjZXNzKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFZhbGlkYXRpb24uU3VjY2VzcyhQYWlyKFBhaXIocmVzMS52YWx1ZVswXSwgcmVzMi52YWx1ZVswXSksIHJlczIudmFsdWVbMV0pKTtcbiAgICAgICAgICAgIH0gZWxzZSByZXR1cm4gVmFsaWRhdGlvbi5GYWlsdXJlKFBhaXIobGFiZWwsIHJlczIudmFsdWVbMV0pKTtcbiAgICAgICAgfSBlbHNlIHJldHVybiBWYWxpZGF0aW9uLkZhaWx1cmUoUGFpcihsYWJlbCwgcmVzMS52YWx1ZVsxXSkpO1xuICAgIH0sIGxhYmVsKTtcbn1cblxuLy8gdXNpbmcgYmluZFxuZXhwb3J0IGZ1bmN0aW9uIGFuZFRoZW4ocDEsIHAyKSB7XG4gICAgcmV0dXJuIHAxLmJpbmQocGFyc2VkVmFsdWUxID0+IHtcbiAgICAgICAgcmV0dXJuIHAyLmJpbmQocGFyc2VkVmFsdWUyID0+IHtcbiAgICAgICAgICAgIHJldHVybiByZXR1cm5QKFBhaXIocGFyc2VkVmFsdWUxLCBwYXJzZWRWYWx1ZTIpKTtcbiAgICAgICAgfSk7XG4gICAgfSkuc2V0TGFiZWwocDEubGFiZWwgKyAnIGFuZFRoZW4gJyArIHAyLmxhYmVsKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG9yRWxzZShwMSwgcDIpIHtcbiAgICBjb25zdCBsYWJlbCA9IHAxLmxhYmVsICsgJyBvckVsc2UgJyArIHAyLmxhYmVsO1xuICAgIHJldHVybiBwYXJzZXIoc3RyID0+IHtcbiAgICAgICAgY29uc3QgcmVzMSA9IHAxLnJ1bihzdHIpO1xuICAgICAgICBpZiAocmVzMS5pc1N1Y2Nlc3MpIHJldHVybiByZXMxO1xuICAgICAgICBjb25zdCByZXMyID0gcDIucnVuKHN0cik7XG4gICAgICAgIGlmIChyZXMyLmlzU3VjY2VzcykgcmV0dXJuIHJlczI7XG4gICAgICAgIHJldHVybiBWYWxpZGF0aW9uLkZhaWx1cmUoUGFpcihsYWJlbCwgcmVzMi52YWx1ZVsxXSkpO1xuICAgIH0sIGxhYmVsKS5zZXRMYWJlbChsYWJlbCk7XG59XG5cbmxldCBfZmFpbCA9IHBhcnNlcihzdHIgPT4gVmFsaWRhdGlvbi5GYWlsdXJlKFBhaXIoUGFpcigncGFyc2luZyBmYWlsZWQnLCAnX2ZhaWwnKSwgJ19mYWlsJykpKTtcblxuLy8gcmV0dXJuIG5ldXRyYWwgZWxlbWVudCBpbnN0ZWFkIG9mIG1lc3NhZ2VcbmxldCBfc3VjY2VlZCA9IHBhcnNlcihzdHIgPT4gVmFsaWRhdGlvbi5TdWNjZXNzKFBhaXIoUGFpcigncGFyc2luZyBzdWNjZWVkZWQnLCBzdHIpLCAnX3N1Y2NlZWQnKSkpO1xuXG5leHBvcnQgZnVuY3Rpb24gY2hvaWNlKHBhcnNlcnMpIHtcbiAgICByZXR1cm4gcGFyc2Vycy5yZWR1Y2VSaWdodCgocmVzdCwgY3VycikgPT4gb3JFbHNlKGN1cnIsIHJlc3QpLCBfZmFpbClcbiAgICAgICAgLnNldExhYmVsKCdjaG9pY2UgJyArIHBhcnNlcnMucmVkdWNlKChhY2MsIGN1cnIpID0+IGFjYyArICcvJyArIGN1cnIubGFiZWwsICcnKSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhbnlPZihjaGFycykge1xuICAgIHJldHVybiBjaG9pY2UoY2hhcnMubWFwKHBjaGFyKSlcbiAgICAgICAgLnNldExhYmVsKCdhbnlPZiAnICsgY2hhcnMucmVkdWNlKChhY2MsIGN1cnIpID0+IGFjYyArIGN1cnIsICcnKSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBmbWFwKGZhYiwgcGFyc2VyMSkge1xuICAgIGNvbnN0IGxhYmVsID0gcGFyc2VyMS5sYWJlbCArICcgZm1hcCAnICsgZmFiLnRvU3RyaW5nKCk7XG4gICAgcmV0dXJuIHBhcnNlcihzdHIgPT4ge1xuICAgICAgICBsZXQgcmVzID0gcGFyc2VyMS5ydW4oc3RyKTtcbiAgICAgICAgaWYgKHJlcy5pc1N1Y2Nlc3MpIHJldHVybiBWYWxpZGF0aW9uLlN1Y2Nlc3MoUGFpcihmYWIocmVzLnZhbHVlWzBdKSwgcmVzLnZhbHVlWzFdKSk7XG4gICAgICAgIHJldHVybiBWYWxpZGF0aW9uLkZhaWx1cmUoUGFpcihsYWJlbCwgcmVzLnZhbHVlWzFdKSk7XG4gICAgfSwgbGFiZWwpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcmV0dXJuUCh2YWx1ZSkge1xuICAgIHJldHVybiBwYXJzZXIoc3RyID0+IFZhbGlkYXRpb24uU3VjY2VzcyhQYWlyKHZhbHVlLCBzdHIpKSwgdmFsdWUpO1xufVxuXG4vLyBwYXJzZXIoYSAtPiBiKSAtPiBwYXJzZXIoYSkgLT4gcGFyc2VyKGIpXG5leHBvcnQgZnVuY3Rpb24gYXBwbHlQeChmUCkge1xuICAgIHJldHVybiBmdW5jdGlvbiAoeFApIHtcbiAgICAgICAgcmV0dXJuIGFuZFRoZW4oZlAsIHhQKS5mbWFwKChbZiwgeF0pID0+IGYoeCkpO1xuICAgIH07XG59XG5cbi8vIHVzaW5nIGJpbmRcbmV4cG9ydCBmdW5jdGlvbiBhcHBseVAoZlApIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKHhQKSB7XG4gICAgICAgIHJldHVybiBmUC5iaW5kKHBhcnNlZFZhbHVlZiA9PiB7XG4gICAgICAgICAgICByZXR1cm4geFAuYmluZChwYXJzZWRWYWx1ZXggPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiByZXR1cm5QKHBhcnNlZFZhbHVlZihwYXJzZWRWYWx1ZXgpKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbGlmdDIoZmFhYikge1xuICAgIHJldHVybiBmdW5jdGlvbiAocGFyc2VyMSkge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKHBhcnNlcjIpIHtcbiAgICAgICAgICAgIC8vcmV0dXJuIGFwcGx5UChhcHBseVAocmV0dXJuUChmYWFiKSkocGFyc2VyMSkpKHBhcnNlcjIpO1xuICAgICAgICAgICAgcmV0dXJuIHJldHVyblAoZmFhYikuYXBwbHkocGFyc2VyMSkuYXBwbHkocGFyc2VyMik7IC8vIHVzaW5nIGluc3RhbmNlIG1ldGhvZHNcbiAgICAgICAgfTtcbiAgICB9O1xufVxuXG4vLyB1c2luZyBsaWZ0Mihjb25zKVxuZXhwb3J0IGZ1bmN0aW9uIHNlcXVlbmNlUChwYXJzZXJzKSB7XG4gICAgcmV0dXJuIHBhcnNlcnNcbiAgICAgICAgLnJlZHVjZVJpZ2h0KChyZXN0LCBjdXJyKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gbGlmdDIoX2NvbnMpKGN1cnIpKHJlc3QpO1xuICAgICAgICB9LCByZXR1cm5QKFtdKSk7XG59XG5cbi8vIHVzaW5nIG5haXZlIGFuZFRoZW4gJiYgZm1hcCAtLT4gcmV0dXJucyBzdHJpbmdzLCBub3QgYXJyYXlzIVxuZXhwb3J0IGZ1bmN0aW9uIHNlcXVlbmNlUDIocGFyc2Vycykge1xuICAgIHJldHVybiBwYXJzZXJzXG4gICAgICAgIC5yZWR1Y2VSaWdodCgocmVzdCwgY3VycikgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIGZtYXAoKFt4LCB5XSkgPT4geCArIHksIGFuZFRoZW4oY3VyciwgcmVzdCkpO1xuICAgICAgICB9LCByZXR1cm5QKCcnKSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwc3RyaW5nKHN0cikge1xuICAgIHJldHVybiBzZXF1ZW5jZVAoc3RyLnNwbGl0KCcnKS5tYXAocGNoYXIpKVxuICAgICAgICAuc2V0TGFiZWwoJ3BzdHJpbmcgJyArIHN0cik7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB6ZXJvT3JNb3JlKHhQKSB7IC8vIHplcm9Pck1vcmUgOjogcCBhIC0+IFthXSAtPiB0cnkgW2FdID0gcCBhIC0+IHAgW2FdXG4gICAgcmV0dXJuIHN0ciA9PiB7XG4gICAgICAgIGxldCByZXMxID0geFAucnVuKHN0cik7XG4gICAgICAgIGlmIChyZXMxLmlzRmFpbHVyZSkgcmV0dXJuIFZhbGlkYXRpb24uU3VjY2VzcyhQYWlyKFtdLCBzdHIpKTtcbiAgICAgICAgbGV0IHJlc04gPSB6ZXJvT3JNb3JlKHhQKShyZXMxLnZhbHVlWzFdKTtcbiAgICAgICAgcmV0dXJuIFZhbGlkYXRpb24uU3VjY2VzcyhQYWlyKFtyZXMxLnZhbHVlWzBdXS5jb25jYXQocmVzTi52YWx1ZVswXSksIHJlc04udmFsdWVbMV0pKTtcbiAgICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbWFueSh4UCkge1xuICAgIGNvbnN0IGxhYmVsID0gJ21hbnkgJyArIHhQLmxhYmVsO1xuICAgIHJldHVybiBwYXJzZXIoc3RyID0+IHtcbiAgICAgICAgcmV0dXJuIHplcm9Pck1vcmUoeFApKHN0cik7XG4gICAgfSwgbGFiZWwpLnNldExhYmVsKGxhYmVsKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1hbnkxKHhQKSB7XG4gICAgY29uc3QgbGFiZWwgPSAnbWFueTEgJyArIHhQLmxhYmVsO1xuICAgIHJldHVybiBwYXJzZXIoc3RyID0+IHtcbiAgICAgICAgbGV0IHJlczEgPSB4UC5ydW4oc3RyKTtcbiAgICAgICAgaWYgKHJlczEuaXNGYWlsdXJlKSByZXR1cm4gcmVzMTtcbiAgICAgICAgbGV0IHJlc04gPSB6ZXJvT3JNb3JlKHhQKShyZXMxLnZhbHVlWzFdKTtcbiAgICAgICAgcmV0dXJuIFZhbGlkYXRpb24uU3VjY2VzcyhQYWlyKFtyZXMxLnZhbHVlWzBdXS5jb25jYXQocmVzTi52YWx1ZVswXSksIHJlc04udmFsdWVbMV0pKTtcbiAgICB9LCBsYWJlbCkuc2V0TGFiZWwobGFiZWwpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gb3B0KHhQKSB7XG4gICAgY29uc3QgbGFiZWwgPSAnb3B0ICcgKyB4UC5sYWJlbDtcbiAgICByZXR1cm4gcGFyc2VyKHN0ciA9PiB7XG4gICAgICAgIGxldCByZXMgPSB4UC5mbWFwKHggPT4gTWF5YmUuSnVzdCh4KSkucnVuKHN0cik7XG4gICAgICAgIGlmIChyZXMuaXNTdWNjZXNzKSByZXR1cm4gcmVzO1xuICAgICAgICByZXR1cm4gVmFsaWRhdGlvbi5TdWNjZXNzKFBhaXIoTWF5YmUuTm90aGluZygpLCBzdHIpKTtcbiAgICB9LCBsYWJlbCkuc2V0TGFiZWwobGFiZWwpO1xufVxuXG4vLyBvcHQgZnJvbSB0aGUgYm9vayAtIHdvcmtzIG9rLCBidXQgdG9TdHJpbmcoKSBnaXZlcyBzdHJhbmdlIHJlc3VsdHNcbmV4cG9ydCBmdW5jdGlvbiBvcHRCb29rKHBYKSB7XG4gICAgY29uc3Qgc29tZVAgPSBwWC5mbWFwKE1heWJlLkp1c3QpO1xuICAgIGNvbnN0IG5vbmVQID0gcmV0dXJuUChNYXliZS5Ob3RoaW5nKTtcbiAgICByZXR1cm4gc29tZVAub3JFbHNlKG5vbmVQKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRpc2NhcmRTZWNvbmQocDEsIHAyKSB7XG4gICAgY29uc3QgbGFiZWwgPSBwMS5sYWJlbCArICcgZGlzY2FyZFNlY29uZCAnICsgcDIubGFiZWw7XG4gICAgcmV0dXJuIHBhcnNlcihzdHIgPT4ge1xuICAgICAgICByZXR1cm4gYW5kVGhlbihwMSwgcDIpLmZtYXAoKFt4LCB5XSkgPT4geCkucnVuKHN0cik7XG4gICAgfSwgbGFiZWwpLnNldExhYmVsKGxhYmVsKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRpc2NhcmRGaXJzdChwMSwgcDIpIHtcbiAgICBjb25zdCBsYWJlbCA9IHAxLmxhYmVsICsgJyBkaXNjYXJkRmlyc3QgJyArIHAyLmxhYmVsO1xuICAgIHJldHVybiBwYXJzZXIoc3RyID0+IHtcbiAgICAgICAgcmV0dXJuIGFuZFRoZW4ocDEsIHAyKS5mbWFwKChbeCwgeV0pID0+IHkpLnJ1bihzdHIpO1xuICAgIH0sIGxhYmVsKS5zZXRMYWJlbChsYWJlbCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBiZXR3ZWVuKHAxLCBwMiwgcDMpIHtcbiAgICByZXR1cm4gcDEuZGlzY2FyZEZpcnN0KHAyKS5kaXNjYXJkU2Vjb25kKHAzKVxuICAgICAgICAuc2V0TGFiZWwoJ2JldHdlZW4gJyArIHAxLmxhYmVsICsgJy8nICsgcDIubGFiZWwgKyAnLycgKyBwMy5sYWJlbCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBiZXR3ZWVuUGFyZW5zKHB4KSB7XG4gICAgcmV0dXJuIGJldHdlZW4ocGNoYXIoJygnKSwgcHgsIHBjaGFyKCcpJykpXG4gICAgICAgIC5zZXRMYWJlbCgnYmV0d2VlblBhcmVucyAnICsgcHgubGFiZWwpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYmluZFAoZmFtYiwgcHgpIHtcbiAgICBsZXQgbGFiZWwgPSAndW5rbm93bic7XG4gICAgcmV0dXJuIHBhcnNlcihzdHIgPT4ge1xuICAgICAgICBjb25zdCByZXMgPSBweC5ydW4oc3RyKTtcbiAgICAgICAgaWYgKHJlcy5pc0ZhaWx1cmUpIHJldHVybiByZXM7XG4gICAgICAgIHJldHVybiBmYW1iKHJlcy52YWx1ZVswXSkucnVuKHJlcy52YWx1ZVsxXSk7XG4gICAgfSwgbGFiZWwpLnNldExhYmVsKGxhYmVsKTtcbn1cblxuZnVuY3Rpb24gX2NvbnMoeCkge1xuICAgIHJldHVybiBmdW5jdGlvbiAoeHMpIHtcbiAgICAgICAgcmV0dXJuIFt4XS5jb25jYXQoeHMpO1xuICAgIH07XG59XG5cbmZ1bmN0aW9uIF9zZXRMYWJlbChweCwgbmV3TGFiZWwpIHtcbiAgICByZXR1cm4gcGFyc2VyKHN0ciA9PiB7XG4gICAgICAgIGxldCByZXN1bHQgPSBweC5ydW4oc3RyKTtcbiAgICAgICAgaWYgKHJlc3VsdC5pc0ZhaWx1cmUpIHJldHVybiBWYWxpZGF0aW9uLkZhaWx1cmUoUGFpcihuZXdMYWJlbCwgcmVzdWx0LnZhbHVlWzFdKSk7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSwgbmV3TGFiZWwpO1xufVxuXG4vLyB0aGUgcmVhbCB0aGluZy4uLlxuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlcihmbiwgbGFiZWwpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICB0eXBlOiAncGFyc2VyJyxcbiAgICAgICAgbGFiZWw6IGxhYmVsLFxuICAgICAgICBydW4oc3RyKSB7XG4gICAgICAgICAgICByZXR1cm4gZm4oc3RyKTtcbiAgICAgICAgfSxcbiAgICAgICAgYXBwbHkocHgpIHtcbiAgICAgICAgICAgIHJldHVybiBhcHBseVAodGhpcykocHgpO1xuICAgICAgICAgICAgLy9yZXR1cm4gdGhpcy5iaW5kKGFuZFRoZW4odGhpcywgcHgpLmZtYXAoKFtmLCB4XSkgPT4gZih4KSkpLnJ1bjsgLy8gd2UgYXJlIHRoZSBmUFxuICAgICAgICB9LFxuICAgICAgICBmbWFwKGZhYikge1xuICAgICAgICAgICAgLy9yZXR1cm4gZm1hcChmYWIsIHRoaXMpO1xuICAgICAgICAgICAgLy9yZXR1cm4gYmluZFAoc3RyID0+IHJldHVyblAoZmFiKHN0cikpLCB0aGlzKTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmJpbmQocGFyc2VkVmFsdWUgPT4gcmV0dXJuUChmYWIocGFyc2VkVmFsdWUpKSk7XG4gICAgICAgIH0sXG4gICAgICAgIGFuZFRoZW4ocHgpIHtcbiAgICAgICAgICAgIHJldHVybiBhbmRUaGVuKHRoaXMsIHB4KTtcbiAgICAgICAgfSxcbiAgICAgICAgb3JFbHNlKHB4KSB7XG4gICAgICAgICAgICByZXR1cm4gb3JFbHNlKHRoaXMsIHB4KTtcbiAgICAgICAgfSxcbiAgICAgICAgZGlzY2FyZEZpcnN0KHB4KSB7XG4gICAgICAgICAgICByZXR1cm4gZGlzY2FyZEZpcnN0KHRoaXMsIHB4KTtcbiAgICAgICAgfSxcbiAgICAgICAgZGlzY2FyZFNlY29uZChweCkge1xuICAgICAgICAgICAgcmV0dXJuIGRpc2NhcmRTZWNvbmQodGhpcywgcHgpO1xuICAgICAgICB9LFxuICAgICAgICBiaW5kKGZhbWIpIHtcbiAgICAgICAgICAgIHJldHVybiBiaW5kUChmYW1iLCB0aGlzKTtcbiAgICAgICAgfSxcbiAgICAgICAgc2V0TGFiZWwobmV3TGFiZWwpIHtcbiAgICAgICAgICAgIHJldHVybiBfc2V0TGFiZWwodGhpcywgbmV3TGFiZWwpO1xuICAgICAgICB9XG4gICAgfTtcbn1cbiJdfQ==