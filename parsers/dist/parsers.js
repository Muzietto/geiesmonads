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
            if ('' === str) throw new Error('reached end of char stream');
            if ((0, _util.head)(str) === char) return _validation.Validation.Success(char, (0, _util.tail)(str));
            return (0, _classes.failure)('charParser', 'wanted ' + char + '; got ' + (0, _util.head)(str));
        };
    };

    var digitParser = function digitParser(digit) {
        return function (str) {
            if ('' === str) throw new Error('reached end of char stream');
            if (parseInt((0, _util.head)(str), 10) === digit) return _validation.Validation.Success(digit, (0, _util.tail)(str));
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
            if (res1.isSuccess) {
                var res2 = p2.run(res1[1]);
                if (res2.isSuccess) {
                    return _validation.Validation.Success((0, _classes.pair)(res1[0], res2[0]), res2[1]);
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
            if (res1.isSuccess) return res1;
            var res2 = p2.run(str);
            if (res2.isSuccess) return res2;
            return (0, _classes.failure)(label, res2[1]);
        }, label).setLabel(label);
    }

    exports.orElse = _orElse;
    var _fail = parser(function (str) {
        return (0, _classes.failure)('parsing failed', '_fail');
    }, '_fail');

    // return neutral element instead of message
    var _succeed = parser(function (str) {
        return _validation.Validation.Success('parsing succeeded', str);
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
            if (_validation.Validation.isSuccess(res)) return _validation.Validation.Success(fab(res[0]), res[1]);
            return (0, _classes.failure)(label, res[1]);
        }, label);
    }

    function returnP(value) {
        return parser(function (str) {
            return _validation.Validation.Success(value, str);
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
            if (res1.isFailure) return _validation.Validation.Success([], str);
            var resN = zeroOrMore(xP)(res1[1]);
            return _validation.Validation.Success([res1[0]].concat(resN[0]), resN[1]);
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
            var resN = zeroOrMore(xP)(res1[1]);
            return _validation.Validation.Success([res1[0]].concat(resN[0]), resN[1]);
        }, label).setLabel(label);
    }

    function opt(xP) {
        var label = 'opt ' + xP.label;
        return parser(function (str) {
            var res = xP.fmap(function (x) {
                return _maybe.Maybe.Just(x);
            }).run(str);
            if (res.isSuccess) return res;
            return _validation.Validation.Success(_maybe.Maybe.Nothing(), str);
        }, label).setLabel(label);
    }

    // opt from the book
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
            if (res.isFailure) return res;
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
            if (result.isFailure) return (0, _classes.failure)(newLabel, result[1]);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2pzL3BhcnNlcnMuanMiXSwibmFtZXMiOlsicGNoYXIiLCJwZGlnaXQiLCJhbmRUaGVuWCIsImNob2ljZSIsImFueU9mIiwiZm1hcCIsInJldHVyblAiLCJhcHBseVB4IiwiYXBwbHlQIiwibGlmdDIiLCJzZXF1ZW5jZVAiLCJzZXF1ZW5jZVAyIiwicHN0cmluZyIsInplcm9Pck1vcmUiLCJtYW55IiwibWFueTEiLCJvcHQiLCJvcHRCb29rIiwiYmV0d2VlbiIsImJldHdlZW5QYXJlbnMiLCJiaW5kUCIsInBhcnNlciIsImNoYXJQYXJzZXIiLCJzdHIiLCJFcnJvciIsImNoYXIiLCJTdWNjZXNzIiwiZGlnaXRQYXJzZXIiLCJwYXJzZUludCIsImRpZ2l0IiwibGFiZWwiLCJyZXN1bHQiLCJzZXRMYWJlbCIsInAxIiwicDIiLCJyZXMxIiwicnVuIiwiaXNTdWNjZXNzIiwicmVzMiIsImFuZFRoZW4iLCJiaW5kIiwicGFyc2VkVmFsdWUxIiwicGFyc2VkVmFsdWUyIiwib3JFbHNlIiwiX2ZhaWwiLCJfc3VjY2VlZCIsInBhcnNlcnMiLCJyZWR1Y2VSaWdodCIsInJlc3QiLCJjdXJyIiwicmVkdWNlIiwiYWNjIiwiY2hhcnMiLCJtYXAiLCJmYWIiLCJwYXJzZXIxIiwidG9TdHJpbmciLCJyZXMiLCJ2YWx1ZSIsImZQIiwieFAiLCJmIiwieCIsInBhcnNlZFZhbHVlZiIsInBhcnNlZFZhbHVleCIsImZhYWIiLCJwYXJzZXIyIiwiYXBwbHkiLCJfY29ucyIsInkiLCJzcGxpdCIsImlzRmFpbHVyZSIsInJlc04iLCJjb25jYXQiLCJKdXN0IiwiTm90aGluZyIsInBYIiwic29tZVAiLCJub25lUCIsImRpc2NhcmRTZWNvbmQiLCJyMSIsInIyIiwiZGlzY2FyZEZpcnN0IiwicDMiLCJweCIsImZhbWIiLCJ4cyIsIl9zZXRMYWJlbCIsIm5ld0xhYmVsIiwiZm4iLCJ0eXBlIiwicGFyc2VkVmFsdWUiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7WUFnQ2dCQSxLLEdBQUFB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QkFrQkl5QyxFQWxCSixFQWtCUTtBQUNQLHVCQUFPekMsUUFBTyxJQUFQLEVBQWF5QyxFQUFiLENBQVA7QUFDSCxhQXBCRTtBQXFCSEYsd0JBckJHLHdCQXFCVUUsRUFyQlYsRUFxQmM7QUFDYix1QkFBT0YsY0FBYSxJQUFiLEVBQW1CRSxFQUFuQixDQUFQO0FBQ0gsYUF2QkU7QUF3QkhMLHlCQXhCRyx5QkF3QldLLEVBeEJYLEVBd0JlO0FBQ2QsdUJBQU9MLGVBQWMsSUFBZCxFQUFvQkssRUFBcEIsQ0FBUDtBQUNILGFBMUJFO0FBMkJINUMsZ0JBM0JHLGdCQTJCRTZDLElBM0JGLEVBMkJRO0FBQ1AsdUJBQU9qRSxNQUFNaUUsSUFBTixFQUFZLElBQVosQ0FBUDtBQUNILGFBN0JFO0FBOEJIckQsb0JBOUJHLG9CQThCTXdELFFBOUJOLEVBOEJnQjtBQUNmLHVCQUFPRCxVQUFVLElBQVYsRUFBZ0JDLFFBQWhCLENBQVA7QUFDSDtBQWhDRSxTQUFQO0FBa0NIIiwiZmlsZSI6InBhcnNlcnMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBjZnIuIFwiVW5kZXJzdGFuZGluZyBQYXJzZXIgQ29tYmluYXRvcnNcIiAoRiMgZm9yIEZ1biBhbmQgUHJvZml0KVxuXG5pbXBvcnQge1xuICAgIGhlYWQsXG4gICAgdGFpbCxcbiAgICBpc1N1Y2Nlc3MsXG4gICAgaXNGYWlsdXJlLFxufSBmcm9tICd1dGlsJztcbmltcG9ydCB7XG4gICAgcGFpcixcbiAgICBzdWNjZXNzLFxuICAgIGZhaWx1cmUsXG4gICAgc29tZSxcbiAgICBub25lLFxufSBmcm9tICdjbGFzc2VzJztcbmltcG9ydCB7TWF5YmV9IGZyb20gJ21heWJlJzsgLy8gSnVzdCBvciBOb3RoaW5nXG5pbXBvcnQge1ZhbGlkYXRpb259IGZyb20gJ3ZhbGlkYXRpb24nOyAvLyBTdWNjZXNzIG9yIEZhaWx1cmVcblxuY29uc3QgY2hhclBhcnNlciA9IGNoYXIgPT4gc3RyID0+IHtcbiAgICBpZiAoJycgPT09IHN0cikgdGhyb3cgbmV3IEVycm9yKCdyZWFjaGVkIGVuZCBvZiBjaGFyIHN0cmVhbScpO1xuICAgIGlmIChoZWFkKHN0cikgPT09IGNoYXIpIHJldHVybiBWYWxpZGF0aW9uLlN1Y2Nlc3MoY2hhciwgdGFpbChzdHIpKTtcbiAgICByZXR1cm4gZmFpbHVyZSgnY2hhclBhcnNlcicsICd3YW50ZWQgJyArIGNoYXIgKyAnOyBnb3QgJyArIGhlYWQoc3RyKSk7XG59O1xuXG5jb25zdCBkaWdpdFBhcnNlciA9IGRpZ2l0ID0+IHN0ciA9PiB7XG4gICAgaWYgKCcnID09PSBzdHIpIHRocm93IG5ldyBFcnJvcigncmVhY2hlZCBlbmQgb2YgY2hhciBzdHJlYW0nKTtcbiAgICBpZiAocGFyc2VJbnQoaGVhZChzdHIpLCAxMCkgPT09IGRpZ2l0KSByZXR1cm4gVmFsaWRhdGlvbi5TdWNjZXNzKGRpZ2l0LCB0YWlsKHN0cikpO1xuICAgIHJldHVybiBmYWlsdXJlKCdkaWdpdFBhcnNlcicsICd3YW50ZWQgJyArIGRpZ2l0ICsgJzsgZ290ICcgKyBoZWFkKHN0cikpO1xufTtcblxuZXhwb3J0IHtjaGFyUGFyc2VyLCBkaWdpdFBhcnNlcn07XG5cbmV4cG9ydCBmdW5jdGlvbiBwY2hhcihjaGFyKSB7XG4gICAgY29uc3QgbGFiZWwgPSAncGNoYXJfJyArIGNoYXI7XG4gICAgbGV0IHJlc3VsdCA9IGZ1bmN0aW9uIChzdHIpIHtcbiAgICAgICAgcmV0dXJuIGNoYXJQYXJzZXIoY2hhcikoc3RyKTtcbiAgICB9O1xuICAgIHJldHVybiBwYXJzZXIocmVzdWx0LCBsYWJlbCkuc2V0TGFiZWwobGFiZWwpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcGRpZ2l0KGRpZ2l0KSB7XG4gICAgcmV0dXJuIHBhcnNlcihzdHIgPT4gZGlnaXRQYXJzZXIoZGlnaXQpKHN0ciksICdwZGlnaXRfJyArIGRpZ2l0KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGFuZFRoZW5YKHAxLCBwMikge1xuICAgIGNvbnN0IGxhYmVsID0gcDEubGFiZWwgKyAnIGFuZFRoZW4gJyArIHAyLmxhYmVsO1xuICAgIHJldHVybiBwYXJzZXIoZnVuY3Rpb24gKHN0cikge1xuICAgICAgICBsZXQgcmVzMSA9IHAxLnJ1bihzdHIpO1xuICAgICAgICBpZiAocmVzMS5pc1N1Y2Nlc3MpIHtcbiAgICAgICAgICAgIGxldCByZXMyID0gcDIucnVuKHJlczFbMV0pO1xuICAgICAgICAgICAgaWYgKHJlczIuaXNTdWNjZXNzKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFZhbGlkYXRpb24uU3VjY2VzcyhwYWlyKHJlczFbMF0sIHJlczJbMF0pLCByZXMyWzFdKTtcbiAgICAgICAgICAgIH0gZWxzZSByZXR1cm4gZmFpbHVyZShsYWJlbCwgcmVzMlsxXSk7XG4gICAgICAgIH0gZWxzZSByZXR1cm4gZmFpbHVyZShsYWJlbCwgcmVzMVsxXSk7XG4gICAgfSwgbGFiZWwpO1xufVxuXG4vLyB1c2luZyBiaW5kXG5leHBvcnQgZnVuY3Rpb24gYW5kVGhlbihwMSwgcDIpIHtcbiAgICByZXR1cm4gcDEuYmluZChwYXJzZWRWYWx1ZTEgPT4ge1xuICAgICAgICByZXR1cm4gcDIuYmluZChwYXJzZWRWYWx1ZTIgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHJldHVyblAocGFpcihwYXJzZWRWYWx1ZTEsIHBhcnNlZFZhbHVlMikpO1xuICAgICAgICB9KTtcbiAgICB9KS5zZXRMYWJlbChwMS5sYWJlbCArICcgYW5kVGhlbiAnICsgcDIubGFiZWwpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gb3JFbHNlKHAxLCBwMikge1xuICAgIGNvbnN0IGxhYmVsID0gcDEubGFiZWwgKyAnIG9yRWxzZSAnICsgcDIubGFiZWw7XG4gICAgcmV0dXJuIHBhcnNlcihzdHIgPT4ge1xuICAgICAgICBjb25zdCByZXMxID0gcDEucnVuKHN0cik7XG4gICAgICAgIGlmIChyZXMxLmlzU3VjY2VzcykgcmV0dXJuIHJlczE7XG4gICAgICAgIGNvbnN0IHJlczIgPSBwMi5ydW4oc3RyKTtcbiAgICAgICAgaWYgKHJlczIuaXNTdWNjZXNzKSByZXR1cm4gcmVzMjtcbiAgICAgICAgcmV0dXJuIGZhaWx1cmUobGFiZWwsIHJlczJbMV0pO1xuICAgIH0sIGxhYmVsKS5zZXRMYWJlbChsYWJlbCk7XG59XG5cbmxldCBfZmFpbCA9IHBhcnNlcihzdHIgPT4gZmFpbHVyZSgncGFyc2luZyBmYWlsZWQnLCAnX2ZhaWwnKSwgJ19mYWlsJyk7XG5cbi8vIHJldHVybiBuZXV0cmFsIGVsZW1lbnQgaW5zdGVhZCBvZiBtZXNzYWdlXG5sZXQgX3N1Y2NlZWQgPSBwYXJzZXIoc3RyID0+IFZhbGlkYXRpb24uU3VjY2VzcygncGFyc2luZyBzdWNjZWVkZWQnLCBzdHIpLCAnX3N1Y2NlZWQnKTtcblxuZXhwb3J0IGZ1bmN0aW9uIGNob2ljZShwYXJzZXJzKSB7XG4gICAgcmV0dXJuIHBhcnNlcnMucmVkdWNlUmlnaHQoKHJlc3QsIGN1cnIpID0+IG9yRWxzZShjdXJyLCByZXN0KSwgX2ZhaWwpXG4gICAgICAgIC5zZXRMYWJlbCgnY2hvaWNlICcgKyBwYXJzZXJzLnJlZHVjZSgoYWNjLCBjdXJyKSA9PiBhY2MgKyAnLycgKyBjdXJyLmxhYmVsLCAnJykpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYW55T2YoY2hhcnMpIHtcbiAgICByZXR1cm4gY2hvaWNlKGNoYXJzLm1hcChwY2hhcikpXG4gICAgICAgIC5zZXRMYWJlbCgnYW55T2YgJyArIGNoYXJzLnJlZHVjZSgoYWNjLCBjdXJyKSA9PiBhY2MgKyBjdXJyLCAnJykpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZm1hcChmYWIsIHBhcnNlcjEpIHtcbiAgICBjb25zdCBsYWJlbCA9IHBhcnNlcjEubGFiZWwgKyAnIGZtYXAgJyArIGZhYi50b1N0cmluZygpO1xuICAgIHJldHVybiBwYXJzZXIoc3RyID0+IHtcbiAgICAgICAgbGV0IHJlcyA9IHBhcnNlcjEucnVuKHN0cik7XG4gICAgICAgIGlmIChWYWxpZGF0aW9uLmlzU3VjY2VzcyhyZXMpKSByZXR1cm4gVmFsaWRhdGlvbi5TdWNjZXNzKGZhYihyZXNbMF0pLCByZXNbMV0pO1xuICAgICAgICByZXR1cm4gZmFpbHVyZShsYWJlbCwgcmVzWzFdKTtcbiAgICB9LCBsYWJlbCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZXR1cm5QKHZhbHVlKSB7XG4gICAgcmV0dXJuIHBhcnNlcihzdHIgPT4gVmFsaWRhdGlvbi5TdWNjZXNzKHZhbHVlLCBzdHIpLCB2YWx1ZSk7XG59XG5cbi8vIHBhcnNlcihhIC0+IGIpIC0+IHBhcnNlcihhKSAtPiBwYXJzZXIoYilcbmV4cG9ydCBmdW5jdGlvbiBhcHBseVB4KGZQKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uICh4UCkge1xuICAgICAgICByZXR1cm4gYW5kVGhlbihmUCwgeFApLmZtYXAoKFtmLCB4XSkgPT4gZih4KSk7XG4gICAgfTtcbn1cblxuLy8gdXNpbmcgYmluZFxuZXhwb3J0IGZ1bmN0aW9uIGFwcGx5UChmUCkge1xuICAgIHJldHVybiBmdW5jdGlvbiAoeFApIHtcbiAgICAgICAgcmV0dXJuIGZQLmJpbmQocGFyc2VkVmFsdWVmID0+IHtcbiAgICAgICAgICAgIHJldHVybiB4UC5iaW5kKHBhcnNlZFZhbHVleCA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJldHVyblAocGFyc2VkVmFsdWVmKHBhcnNlZFZhbHVleCkpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBsaWZ0MihmYWFiKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uIChwYXJzZXIxKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAocGFyc2VyMikge1xuICAgICAgICAgICAgLy9yZXR1cm4gYXBwbHlQKGFwcGx5UChyZXR1cm5QKGZhYWIpKShwYXJzZXIxKSkocGFyc2VyMik7XG4gICAgICAgICAgICByZXR1cm4gcmV0dXJuUChmYWFiKS5hcHBseShwYXJzZXIxKS5hcHBseShwYXJzZXIyKTsgLy8gdXNpbmcgaW5zdGFuY2UgbWV0aG9kc1xuICAgICAgICB9O1xuICAgIH07XG59XG5cbi8vIHVzaW5nIGxpZnQyKGNvbnMpXG5leHBvcnQgZnVuY3Rpb24gc2VxdWVuY2VQKHBhcnNlcnMpIHtcbiAgICByZXR1cm4gcGFyc2Vyc1xuICAgICAgICAucmVkdWNlUmlnaHQoKHJlc3QsIGN1cnIpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBsaWZ0MihfY29ucykoY3VycikocmVzdCk7XG4gICAgICAgIH0sIHJldHVyblAoW10pKTtcbn1cblxuLy8gdXNpbmcgbmFpdmUgYW5kVGhlbiAmJiBmbWFwIC0tPiByZXR1cm5zIHN0cmluZ3MsIG5vdCBhcnJheXMhXG5leHBvcnQgZnVuY3Rpb24gc2VxdWVuY2VQMihwYXJzZXJzKSB7XG4gICAgcmV0dXJuIHBhcnNlcnNcbiAgICAgICAgLnJlZHVjZVJpZ2h0KChyZXN0LCBjdXJyKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gZm1hcCgoW3gsIHldKSA9PiB4ICsgeSwgYW5kVGhlbihjdXJyLCByZXN0KSk7XG4gICAgICAgIH0sIHJldHVyblAoJycpKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHBzdHJpbmcoc3RyKSB7XG4gICAgcmV0dXJuIHNlcXVlbmNlUChzdHIuc3BsaXQoJycpLm1hcChwY2hhcikpXG4gICAgICAgIC5zZXRMYWJlbCgncHN0cmluZyAnICsgc3RyKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHplcm9Pck1vcmUoeFApIHsgLy8gemVyb09yTW9yZSA6OiBwIGEgLT4gW2FdIC0+IHRyeSBbYV0gPSBwIGEgLT4gcCBbYV1cbiAgICByZXR1cm4gc3RyID0+IHtcbiAgICAgICAgbGV0IHJlczEgPSB4UC5ydW4oc3RyKTtcbiAgICAgICAgaWYgKHJlczEuaXNGYWlsdXJlKSByZXR1cm4gVmFsaWRhdGlvbi5TdWNjZXNzKFtdLCBzdHIpO1xuICAgICAgICBsZXQgcmVzTiA9IHplcm9Pck1vcmUoeFApKHJlczFbMV0pO1xuICAgICAgICByZXR1cm4gVmFsaWRhdGlvbi5TdWNjZXNzKFtyZXMxWzBdXS5jb25jYXQocmVzTlswXSksIHJlc05bMV0pO1xuICAgIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtYW55KHhQKSB7XG4gICAgY29uc3QgbGFiZWwgPSAnbWFueSAnICsgeFAubGFiZWw7XG4gICAgcmV0dXJuIHBhcnNlcihzdHIgPT4ge1xuICAgICAgICByZXR1cm4gemVyb09yTW9yZSh4UCkoc3RyKTtcbiAgICB9LCBsYWJlbCkuc2V0TGFiZWwobGFiZWwpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbWFueTEoeFApIHtcbiAgICBjb25zdCBsYWJlbCA9ICdtYW55MSAnICsgeFAubGFiZWw7XG4gICAgcmV0dXJuIHBhcnNlcihzdHIgPT4ge1xuICAgICAgICBsZXQgcmVzMSA9IHhQLnJ1bihzdHIpO1xuICAgICAgICBpZiAocmVzMS5pc0ZhaWx1cmUpIHJldHVybiByZXMxO1xuICAgICAgICBsZXQgcmVzTiA9IHplcm9Pck1vcmUoeFApKHJlczFbMV0pO1xuICAgICAgICByZXR1cm4gVmFsaWRhdGlvbi5TdWNjZXNzKFtyZXMxWzBdXS5jb25jYXQocmVzTlswXSksIHJlc05bMV0pO1xuICAgIH0sIGxhYmVsKS5zZXRMYWJlbChsYWJlbCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBvcHQoeFApIHtcbiAgICBjb25zdCBsYWJlbCA9ICdvcHQgJyArIHhQLmxhYmVsO1xuICAgIHJldHVybiBwYXJzZXIoc3RyID0+IHtcbiAgICAgICAgbGV0IHJlcyA9IHhQLmZtYXAoeCA9PiBNYXliZS5KdXN0KHgpKS5ydW4oc3RyKTtcbiAgICAgICAgaWYgKHJlcy5pc1N1Y2Nlc3MpIHJldHVybiByZXM7XG4gICAgICAgIHJldHVybiBWYWxpZGF0aW9uLlN1Y2Nlc3MoTWF5YmUuTm90aGluZygpLCBzdHIpO1xuICAgIH0sIGxhYmVsKS5zZXRMYWJlbChsYWJlbCk7XG59XG5cbi8vIG9wdCBmcm9tIHRoZSBib29rXG5leHBvcnQgZnVuY3Rpb24gb3B0Qm9vayhwWCkge1xuICAgIGNvbnN0IHNvbWVQID0gcFguZm1hcChNYXliZS5KdXN0KTtcbiAgICBjb25zdCBub25lUCA9IHJldHVyblAoTWF5YmUuTm90aGluZyk7XG4gICAgcmV0dXJuIHNvbWVQLm9yRWxzZShub25lUCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBkaXNjYXJkU2Vjb25kKHAxLCBwMikge1xuICAgIGNvbnN0IGxhYmVsID0gcDEubGFiZWwgKyAnIGRpc2NhcmRTZWNvbmQgJyArIHAyLmxhYmVsO1xuICAgIHJldHVybiBwYXJzZXIoc3RyID0+IHtcbiAgICAgICAgcmV0dXJuIGFuZFRoZW4ocDEsIHAyKS5mbWFwKChbcjEsIHIyXSkgPT4gcjEpLnJ1bihzdHIpO1xuICAgIH0sIGxhYmVsKS5zZXRMYWJlbChsYWJlbCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBkaXNjYXJkRmlyc3QocDEsIHAyKSB7XG4gICAgY29uc3QgbGFiZWwgPSBwMS5sYWJlbCArICcgZGlzY2FyZEZpcnN0ICcgKyBwMi5sYWJlbDtcbiAgICByZXR1cm4gcGFyc2VyKHN0ciA9PiB7XG4gICAgICAgIHJldHVybiBhbmRUaGVuKHAxLCBwMikuZm1hcCgoW3IxLCByMl0pID0+IHIyKS5ydW4oc3RyKTtcbiAgICB9LCBsYWJlbCkuc2V0TGFiZWwobGFiZWwpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYmV0d2VlbihwMSwgcDIsIHAzKSB7XG4gICAgcmV0dXJuIHAxLmRpc2NhcmRGaXJzdChwMikuZGlzY2FyZFNlY29uZChwMylcbiAgICAgICAgLnNldExhYmVsKCdiZXR3ZWVuICcgKyBwMS5sYWJlbCArICcvJyArIHAyLmxhYmVsICsgJy8nICsgcDMubGFiZWwpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYmV0d2VlblBhcmVucyhweCkge1xuICAgIHJldHVybiBiZXR3ZWVuKHBjaGFyKCcoJyksIHB4LCBwY2hhcignKScpKVxuICAgICAgICAuc2V0TGFiZWwoJ2JldHdlZW5QYXJlbnMgJyArIHB4LmxhYmVsKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGJpbmRQKGZhbWIsIHB4KSB7XG4gICAgbGV0IGxhYmVsID0gJ3Vua25vd24nO1xuICAgIHJldHVybiBwYXJzZXIoc3RyID0+IHtcbiAgICAgICAgY29uc3QgcmVzID0gcHgucnVuKHN0cik7XG4gICAgICAgIGlmIChyZXMuaXNGYWlsdXJlKSByZXR1cm4gcmVzO1xuICAgICAgICByZXR1cm4gZmFtYihyZXNbMF0pLnJ1bihyZXNbMV0pO1xuICAgIH0sIGxhYmVsKS5zZXRMYWJlbChsYWJlbCk7XG59XG5cbmZ1bmN0aW9uIF9jb25zKHgpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKHhzKSB7XG4gICAgICAgIHJldHVybiBbeF0uY29uY2F0KHhzKTtcbiAgICB9O1xufVxuXG5mdW5jdGlvbiBfc2V0TGFiZWwocHgsIG5ld0xhYmVsKSB7XG4gICAgcmV0dXJuIHBhcnNlcihzdHIgPT4ge1xuICAgICAgICBsZXQgcmVzdWx0ID0gcHgucnVuKHN0cik7XG4gICAgICAgIGlmIChyZXN1bHQuaXNGYWlsdXJlKSByZXR1cm4gZmFpbHVyZShuZXdMYWJlbCwgcmVzdWx0WzFdKTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LCBuZXdMYWJlbCk7XG59XG5cbi8vIHRoZSByZWFsIHRoaW5nLi4uXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VyKGZuLCBsYWJlbCkge1xuICAgIHJldHVybiB7XG4gICAgICAgIHR5cGU6ICdwYXJzZXInLFxuICAgICAgICBsYWJlbDogbGFiZWwsXG4gICAgICAgIHJ1bihzdHIpIHtcbiAgICAgICAgICAgIHJldHVybiBmbihzdHIpO1xuICAgICAgICB9LFxuICAgICAgICBhcHBseShweCkge1xuICAgICAgICAgICAgcmV0dXJuIGFwcGx5UCh0aGlzKShweCk7XG4gICAgICAgICAgICAvL3JldHVybiB0aGlzLmJpbmQoYW5kVGhlbih0aGlzLCBweCkuZm1hcCgoW2YsIHhdKSA9PiBmKHgpKSkucnVuOyAvLyB3ZSBhcmUgdGhlIGZQXG4gICAgICAgIH0sXG4gICAgICAgIGZtYXAoZmFiKSB7XG4gICAgICAgICAgICAvL3JldHVybiBmbWFwKGZhYiwgdGhpcyk7XG4gICAgICAgICAgICAvL3JldHVybiBiaW5kUChzdHIgPT4gcmV0dXJuUChmYWIoc3RyKSksIHRoaXMpO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuYmluZChwYXJzZWRWYWx1ZSA9PiByZXR1cm5QKGZhYihwYXJzZWRWYWx1ZSkpKTtcbiAgICAgICAgfSxcbiAgICAgICAgYW5kVGhlbihweCkge1xuICAgICAgICAgICAgcmV0dXJuIGFuZFRoZW4odGhpcywgcHgpO1xuICAgICAgICB9LFxuICAgICAgICBvckVsc2UocHgpIHtcbiAgICAgICAgICAgIHJldHVybiBvckVsc2UodGhpcywgcHgpO1xuICAgICAgICB9LFxuICAgICAgICBkaXNjYXJkRmlyc3QocHgpIHtcbiAgICAgICAgICAgIHJldHVybiBkaXNjYXJkRmlyc3QodGhpcywgcHgpO1xuICAgICAgICB9LFxuICAgICAgICBkaXNjYXJkU2Vjb25kKHB4KSB7XG4gICAgICAgICAgICByZXR1cm4gZGlzY2FyZFNlY29uZCh0aGlzLCBweCk7XG4gICAgICAgIH0sXG4gICAgICAgIGJpbmQoZmFtYikge1xuICAgICAgICAgICAgcmV0dXJuIGJpbmRQKGZhbWIsIHRoaXMpO1xuICAgICAgICB9LFxuICAgICAgICBzZXRMYWJlbChuZXdMYWJlbCkge1xuICAgICAgICAgICAgcmV0dXJuIF9zZXRMYWJlbCh0aGlzLCBuZXdMYWJlbCk7XG4gICAgICAgIH1cbiAgICB9O1xufVxuIl19