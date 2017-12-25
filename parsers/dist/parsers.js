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
                    return _validation.Validation.Success(_classes.Tuple.Pair(_classes.Tuple.Pair(res1.value[0], res2.value[0]), res2.value[1]));
                } else return _validation.Validation.Failure(_classes.Tuple.Pair(label, res2.value[1]));
            } else return _validation.Validation.Failure(_classes.Tuple.Pair(label, res1.value[1]));
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
        return parser(function (str) {
            var res1 = p1.run(str);
            if (res1.isSuccess) return res1;
            var res2 = p2.run(str);
            if (res2.isSuccess) return res2;
            return _validation.Validation.Failure(_classes.Tuple.Pair(label, res2.value[1]));
        }, label).setLabel(label);
    }

    exports.orElse = _orElse;
    var _fail = parser(function (str) {
        return _validation.Validation.Failure(_classes.Tuple.Pair(_classes.Tuple.Pair('parsing failed', '_fail'), '_fail'));
    });

    // return neutral element instead of message
    var _succeed = parser(function (str) {
        return _validation.Validation.Success(_classes.Tuple.Pair(_classes.Tuple.Pair('parsing succeeded', str), '_succeed'));
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
            return _validation.Validation.Failure(_classes.Tuple.Pair(label, res.value[1]));
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
            if (result.isFailure) return _validation.Validation.Failure(_classes.Tuple.Pair(newLabel, result.value[1]));
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2pzL3BhcnNlcnMuanMiXSwibmFtZXMiOlsicGNoYXIiLCJwZGlnaXQiLCJhbmRUaGVuWCIsImNob2ljZSIsImFueU9mIiwiZm1hcCIsInJldHVyblAiLCJhcHBseVB4IiwiYXBwbHlQIiwibGlmdDIiLCJzZXF1ZW5jZVAiLCJzZXF1ZW5jZVAyIiwicHN0cmluZyIsInplcm9Pck1vcmUiLCJtYW55IiwibWFueTEiLCJvcHQiLCJvcHRCb29rIiwiYmV0d2VlbiIsImJldHdlZW5QYXJlbnMiLCJiaW5kUCIsInBhcnNlciIsImNoYXJQYXJzZXIiLCJwb3MiLCJmcm9tVGV4dCIsIm9wdENoYXIiLCJjaGFyIiwiaXNOb3RoaW5nIiwiRmFpbHVyZSIsIlRyaXBsZSIsInZhbHVlIiwiU3VjY2VzcyIsIlBhaXIiLCJpbmNyUG9zIiwiZGlnaXRQYXJzZXIiLCJwYXJzZUludCIsImRpZ2l0IiwibGFiZWwiLCJyZXN1bHQiLCJzdHIiLCJzZXRMYWJlbCIsInAxIiwicDIiLCJyZXMxIiwicnVuIiwiaXNTdWNjZXNzIiwicmVzMiIsImFuZFRoZW4iLCJiaW5kIiwicGFyc2VkVmFsdWUxIiwicGFyc2VkVmFsdWUyIiwib3JFbHNlIiwiX2ZhaWwiLCJfc3VjY2VlZCIsInBhcnNlcnMiLCJyZWR1Y2VSaWdodCIsInJlc3QiLCJjdXJyIiwicmVkdWNlIiwiYWNjIiwiY2hhcnMiLCJtYXAiLCJmYWIiLCJwYXJzZXIxIiwidG9TdHJpbmciLCJyZXMiLCJmUCIsInhQIiwiZiIsIngiLCJwYXJzZWRWYWx1ZWYiLCJwYXJzZWRWYWx1ZXgiLCJmYWFiIiwicGFyc2VyMiIsImFwcGx5IiwiX2NvbnMiLCJ5Iiwic3BsaXQiLCJpc0ZhaWx1cmUiLCJyZXNOIiwiY29uY2F0IiwiSnVzdCIsIk5vdGhpbmciLCJwWCIsInNvbWVQIiwibm9uZVAiLCJkaXNjYXJkU2Vjb25kIiwiZGlzY2FyZEZpcnN0IiwicDMiLCJweCIsImZhbWIiLCJ4cyIsIl9zZXRMYWJlbCIsIm5ld0xhYmVsIiwiZm4i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RUFOSCxFQU1PO0FBQ04sdUJBQU9qRixPQUFPLElBQVAsRUFBYWlGLEVBQWIsQ0FBUDtBQUNBO0FBQ0gsYUFURTtBQVVIcEYsZ0JBVkcsZ0JBVUV5RCxHQVZGLEVBVU87QUFDTjtBQUNBO0FBQ0EsdUJBQU8sS0FBS2QsSUFBTCxDQUFVO0FBQUEsMkJBQWUxQyxRQUFRd0QsSUFBSWtDLFdBQUosQ0FBUixDQUFmO0FBQUEsaUJBQVYsQ0FBUDtBQUNILGFBZEU7QUFlSGpELG1CQWZHLG1CQWVLMEMsRUFmTCxFQWVTO0FBQ1IsdUJBQU8xQyxTQUFRLElBQVIsRUFBYzBDLEVBQWQsQ0FBUDtBQUNILGFBakJFO0FBa0JIdEMsa0JBbEJHLGtCQWtCSXNDLEVBbEJKLEVBa0JRO0FBQ1AsdUJBQU90QyxRQUFPLElBQVAsRUFBYXNDLEVBQWIsQ0FBUDtBQUNILGFBcEJFO0FBcUJIRix3QkFyQkcsd0JBcUJVRSxFQXJCVixFQXFCYztBQUNiLHVCQUFPRixjQUFhLElBQWIsRUFBbUJFLEVBQW5CLENBQVA7QUFDSCxhQXZCRTtBQXdCSEgseUJBeEJHLHlCQXdCV0csRUF4QlgsRUF3QmU7QUFDZCx1QkFBT0gsZUFBYyxJQUFkLEVBQW9CRyxFQUFwQixDQUFQO0FBQ0gsYUExQkU7QUEyQkh6QyxnQkEzQkcsZ0JBMkJFMEMsSUEzQkYsRUEyQlE7QUFDUCx1QkFBT3RFLE1BQU1zRSxJQUFOLEVBQVksSUFBWixDQUFQO0FBQ0gsYUE3QkU7QUE4QkhsRCxvQkE5Qkcsb0JBOEJNcUQsUUE5Qk4sRUE4QmdCO0FBQ2YsdUJBQU9ELFVBQVUsSUFBVixFQUFnQkMsUUFBaEIsQ0FBUDtBQUNIO0FBaENFLFNBQVA7QUFrQ0giLCJmaWxlIjoicGFyc2Vycy5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vIGNmci4gXCJVbmRlcnN0YW5kaW5nIFBhcnNlciBDb21iaW5hdG9yc1wiIChGIyBmb3IgRnVuIGFuZCBQcm9maXQpXG5cbmltcG9ydCB7XG4gICAgVHVwbGUsXG4gICAgUG9zaXRpb24sXG59IGZyb20gJ2NsYXNzZXMnO1xuaW1wb3J0IHtNYXliZX0gZnJvbSAnbWF5YmUnOyAvLyBKdXN0IG9yIE5vdGhpbmdcbmltcG9ydCB7VmFsaWRhdGlvbn0gZnJvbSAndmFsaWRhdGlvbic7IC8vIFN1Y2Nlc3Mgb3IgRmFpbHVyZVxuXG5jb25zdCBjaGFyUGFyc2VyID0gY2hhciA9PiBwb3MgPT4ge1xuICAgIGlmICh0eXBlb2YgcG9zID09PSAnc3RyaW5nJykgcG9zID0gUG9zaXRpb24uZnJvbVRleHQocG9zKTtcbiAgICBjb25zdCBvcHRDaGFyID0gcG9zLmNoYXIoKTtcbiAgICBpZiAob3B0Q2hhci5pc05vdGhpbmcpIHJldHVybiBWYWxpZGF0aW9uLkZhaWx1cmUoVHVwbGUuVHJpcGxlKCdjaGFyUGFyc2VyJywgJ25vIG1vcmUgaW5wdXQnLCBwb3MpKTtcbiAgICBpZiAob3B0Q2hhci52YWx1ZSA9PT0gY2hhcikgcmV0dXJuIFZhbGlkYXRpb24uU3VjY2VzcyhUdXBsZS5QYWlyKGNoYXIsIHBvcy5pbmNyUG9zKCkpKTtcbiAgICByZXR1cm4gVmFsaWRhdGlvbi5GYWlsdXJlKFR1cGxlLlRyaXBsZSgnY2hhclBhcnNlcicsICd3YW50ZWQgJyArIGNoYXIgKyAnOyBnb3QgJyArIG9wdENoYXIudmFsdWUsIHBvcykpO1xufTtcblxuY29uc3QgZGlnaXRQYXJzZXIgPSBkaWdpdCA9PiBwb3MgPT4ge1xuICAgIGlmICh0eXBlb2YgcG9zID09PSAnc3RyaW5nJykgcG9zID0gUG9zaXRpb24uZnJvbVRleHQocG9zKTtcbiAgICBjb25zdCBvcHRDaGFyID0gcG9zLmNoYXIoKTtcbiAgICBpZiAob3B0Q2hhci5pc05vdGhpbmcpIHJldHVybiBWYWxpZGF0aW9uLkZhaWx1cmUoVHVwbGUuVHJpcGxlKCdkaWdpdFBhcnNlcicsICdubyBtb3JlIGlucHV0JywgcG9zKSk7XG4gICAgaWYgKHBhcnNlSW50KG9wdENoYXIudmFsdWUsIDEwKSA9PT0gZGlnaXQpIHJldHVybiBWYWxpZGF0aW9uLlN1Y2Nlc3MoVHVwbGUuUGFpcihkaWdpdCwgcG9zLmluY3JQb3MoKSkpO1xuICAgIHJldHVybiBWYWxpZGF0aW9uLkZhaWx1cmUoVHVwbGUuVHJpcGxlKCdkaWdpdFBhcnNlcicsICd3YW50ZWQgJyArIGRpZ2l0ICsgJzsgZ290ICcgKyBvcHRDaGFyLnZhbHVlLCBwb3MpKTtcbn07XG5cbmV4cG9ydCB7Y2hhclBhcnNlciwgZGlnaXRQYXJzZXJ9O1xuXG5leHBvcnQgZnVuY3Rpb24gcGNoYXIoY2hhcikge1xuICAgIGNvbnN0IGxhYmVsID0gJ3BjaGFyXycgKyBjaGFyO1xuICAgIGxldCByZXN1bHQgPSBmdW5jdGlvbiAoc3RyKSB7XG4gICAgICAgIHJldHVybiBjaGFyUGFyc2VyKGNoYXIpKHN0cik7XG4gICAgfTtcbiAgICByZXR1cm4gcGFyc2VyKHJlc3VsdCwgbGFiZWwpLnNldExhYmVsKGxhYmVsKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHBkaWdpdChkaWdpdCkge1xuICAgIHJldHVybiBwYXJzZXIoc3RyID0+IGRpZ2l0UGFyc2VyKGRpZ2l0KShzdHIpLCAncGRpZ2l0XycgKyBkaWdpdCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhbmRUaGVuWChwMSwgcDIpIHtcbiAgICBjb25zdCBsYWJlbCA9IHAxLmxhYmVsICsgJyBhbmRUaGVuICcgKyBwMi5sYWJlbDtcbiAgICByZXR1cm4gcGFyc2VyKGZ1bmN0aW9uIChzdHIpIHtcbiAgICAgICAgbGV0IHJlczEgPSBwMS5ydW4oc3RyKTtcbiAgICAgICAgaWYgKHJlczEuaXNTdWNjZXNzKSB7XG4gICAgICAgICAgICBsZXQgcmVzMiA9IHAyLnJ1bihyZXMxLnZhbHVlWzFdKTtcbiAgICAgICAgICAgIGlmIChyZXMyLmlzU3VjY2Vzcykge1xuICAgICAgICAgICAgICAgIHJldHVybiBWYWxpZGF0aW9uLlN1Y2Nlc3MoVHVwbGUuUGFpcihUdXBsZS5QYWlyKHJlczEudmFsdWVbMF0sIHJlczIudmFsdWVbMF0pLCByZXMyLnZhbHVlWzFdKSk7XG4gICAgICAgICAgICB9IGVsc2UgcmV0dXJuIFZhbGlkYXRpb24uRmFpbHVyZShUdXBsZS5QYWlyKGxhYmVsLCByZXMyLnZhbHVlWzFdKSk7XG4gICAgICAgIH0gZWxzZSByZXR1cm4gVmFsaWRhdGlvbi5GYWlsdXJlKFR1cGxlLlBhaXIobGFiZWwsIHJlczEudmFsdWVbMV0pKTtcbiAgICB9LCBsYWJlbCk7XG59XG5cbi8vIHVzaW5nIGJpbmRcbmV4cG9ydCBmdW5jdGlvbiBhbmRUaGVuKHAxLCBwMikge1xuICAgIHJldHVybiBwMS5iaW5kKHBhcnNlZFZhbHVlMSA9PiB7XG4gICAgICAgIHJldHVybiBwMi5iaW5kKHBhcnNlZFZhbHVlMiA9PiB7XG4gICAgICAgICAgICByZXR1cm4gcmV0dXJuUChUdXBsZS5QYWlyKHBhcnNlZFZhbHVlMSwgcGFyc2VkVmFsdWUyKSk7XG4gICAgICAgIH0pO1xuICAgIH0pLnNldExhYmVsKHAxLmxhYmVsICsgJyBhbmRUaGVuICcgKyBwMi5sYWJlbCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBvckVsc2UocDEsIHAyKSB7XG4gICAgY29uc3QgbGFiZWwgPSBwMS5sYWJlbCArICcgb3JFbHNlICcgKyBwMi5sYWJlbDtcbiAgICByZXR1cm4gcGFyc2VyKHN0ciA9PiB7XG4gICAgICAgIGNvbnN0IHJlczEgPSBwMS5ydW4oc3RyKTtcbiAgICAgICAgaWYgKHJlczEuaXNTdWNjZXNzKSByZXR1cm4gcmVzMTtcbiAgICAgICAgY29uc3QgcmVzMiA9IHAyLnJ1bihzdHIpO1xuICAgICAgICBpZiAocmVzMi5pc1N1Y2Nlc3MpIHJldHVybiByZXMyO1xuICAgICAgICByZXR1cm4gVmFsaWRhdGlvbi5GYWlsdXJlKFR1cGxlLlBhaXIobGFiZWwsIHJlczIudmFsdWVbMV0pKTtcbiAgICB9LCBsYWJlbCkuc2V0TGFiZWwobGFiZWwpO1xufVxuXG5sZXQgX2ZhaWwgPSBwYXJzZXIoc3RyID0+IFZhbGlkYXRpb24uRmFpbHVyZShUdXBsZS5QYWlyKFR1cGxlLlBhaXIoJ3BhcnNpbmcgZmFpbGVkJywgJ19mYWlsJyksICdfZmFpbCcpKSk7XG5cbi8vIHJldHVybiBuZXV0cmFsIGVsZW1lbnQgaW5zdGVhZCBvZiBtZXNzYWdlXG5sZXQgX3N1Y2NlZWQgPSBwYXJzZXIoc3RyID0+IFZhbGlkYXRpb24uU3VjY2VzcyhUdXBsZS5QYWlyKFR1cGxlLlBhaXIoJ3BhcnNpbmcgc3VjY2VlZGVkJywgc3RyKSwgJ19zdWNjZWVkJykpKTtcblxuZXhwb3J0IGZ1bmN0aW9uIGNob2ljZShwYXJzZXJzKSB7XG4gICAgcmV0dXJuIHBhcnNlcnMucmVkdWNlUmlnaHQoKHJlc3QsIGN1cnIpID0+IG9yRWxzZShjdXJyLCByZXN0KSwgX2ZhaWwpXG4gICAgICAgIC5zZXRMYWJlbCgnY2hvaWNlICcgKyBwYXJzZXJzLnJlZHVjZSgoYWNjLCBjdXJyKSA9PiBhY2MgKyAnLycgKyBjdXJyLmxhYmVsLCAnJykpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYW55T2YoY2hhcnMpIHtcbiAgICByZXR1cm4gY2hvaWNlKGNoYXJzLm1hcChwY2hhcikpXG4gICAgICAgIC5zZXRMYWJlbCgnYW55T2YgJyArIGNoYXJzLnJlZHVjZSgoYWNjLCBjdXJyKSA9PiBhY2MgKyBjdXJyLCAnJykpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZm1hcChmYWIsIHBhcnNlcjEpIHtcbiAgICBjb25zdCBsYWJlbCA9IHBhcnNlcjEubGFiZWwgKyAnIGZtYXAgJyArIGZhYi50b1N0cmluZygpO1xuICAgIHJldHVybiBwYXJzZXIoc3RyID0+IHtcbiAgICAgICAgbGV0IHJlcyA9IHBhcnNlcjEucnVuKHN0cik7XG4gICAgICAgIGlmIChyZXMuaXNTdWNjZXNzKSByZXR1cm4gVmFsaWRhdGlvbi5TdWNjZXNzKFR1cGxlLlBhaXIoZmFiKHJlcy52YWx1ZVswXSksIHJlcy52YWx1ZVsxXSkpO1xuICAgICAgICByZXR1cm4gVmFsaWRhdGlvbi5GYWlsdXJlKFR1cGxlLlBhaXIobGFiZWwsIHJlcy52YWx1ZVsxXSkpO1xuICAgIH0sIGxhYmVsKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJldHVyblAodmFsdWUpIHtcbiAgICByZXR1cm4gcGFyc2VyKHN0ciA9PiBWYWxpZGF0aW9uLlN1Y2Nlc3MoVHVwbGUuUGFpcih2YWx1ZSwgc3RyKSksIHZhbHVlKTtcbn1cblxuLy8gcGFyc2VyKGEgLT4gYikgLT4gcGFyc2VyKGEpIC0+IHBhcnNlcihiKVxuZXhwb3J0IGZ1bmN0aW9uIGFwcGx5UHgoZlApIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKHhQKSB7XG4gICAgICAgIHJldHVybiBhbmRUaGVuKGZQLCB4UCkuZm1hcCgoW2YsIHhdKSA9PiBmKHgpKTtcbiAgICB9O1xufVxuXG4vLyB1c2luZyBiaW5kXG5leHBvcnQgZnVuY3Rpb24gYXBwbHlQKGZQKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uICh4UCkge1xuICAgICAgICByZXR1cm4gZlAuYmluZChwYXJzZWRWYWx1ZWYgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHhQLmJpbmQocGFyc2VkVmFsdWV4ID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmV0dXJuUChwYXJzZWRWYWx1ZWYocGFyc2VkVmFsdWV4KSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGxpZnQyKGZhYWIpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKHBhcnNlcjEpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChwYXJzZXIyKSB7XG4gICAgICAgICAgICAvL3JldHVybiBhcHBseVAoYXBwbHlQKHJldHVyblAoZmFhYikpKHBhcnNlcjEpKShwYXJzZXIyKTtcbiAgICAgICAgICAgIHJldHVybiByZXR1cm5QKGZhYWIpLmFwcGx5KHBhcnNlcjEpLmFwcGx5KHBhcnNlcjIpOyAvLyB1c2luZyBpbnN0YW5jZSBtZXRob2RzXG4gICAgICAgIH07XG4gICAgfTtcbn1cblxuLy8gdXNpbmcgbGlmdDIoY29ucylcbmV4cG9ydCBmdW5jdGlvbiBzZXF1ZW5jZVAocGFyc2Vycykge1xuICAgIHJldHVybiBwYXJzZXJzXG4gICAgICAgIC5yZWR1Y2VSaWdodCgocmVzdCwgY3VycikgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIGxpZnQyKF9jb25zKShjdXJyKShyZXN0KTtcbiAgICAgICAgfSwgcmV0dXJuUChbXSkpO1xufVxuXG4vLyB1c2luZyBuYWl2ZSBhbmRUaGVuICYmIGZtYXAgLS0+IHJldHVybnMgc3RyaW5ncywgbm90IGFycmF5cyFcbmV4cG9ydCBmdW5jdGlvbiBzZXF1ZW5jZVAyKHBhcnNlcnMpIHtcbiAgICByZXR1cm4gcGFyc2Vyc1xuICAgICAgICAucmVkdWNlUmlnaHQoKHJlc3QsIGN1cnIpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBmbWFwKChbeCwgeV0pID0+IHggKyB5LCBhbmRUaGVuKGN1cnIsIHJlc3QpKTtcbiAgICAgICAgfSwgcmV0dXJuUCgnJykpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcHN0cmluZyhzdHIpIHtcbiAgICByZXR1cm4gc2VxdWVuY2VQKHN0ci5zcGxpdCgnJykubWFwKHBjaGFyKSlcbiAgICAgICAgLnNldExhYmVsKCdwc3RyaW5nICcgKyBzdHIpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gemVyb09yTW9yZSh4UCkgeyAvLyB6ZXJvT3JNb3JlIDo6IHAgYSAtPiBbYV0gLT4gdHJ5IFthXSA9IHAgYSAtPiBwIFthXVxuICAgIHJldHVybiBzdHIgPT4ge1xuICAgICAgICBsZXQgcmVzMSA9IHhQLnJ1bihzdHIpO1xuICAgICAgICBpZiAocmVzMS5pc0ZhaWx1cmUpIHJldHVybiBWYWxpZGF0aW9uLlN1Y2Nlc3MoVHVwbGUuUGFpcihbXSwgc3RyKSk7XG4gICAgICAgIGxldCByZXNOID0gemVyb09yTW9yZSh4UCkocmVzMS52YWx1ZVsxXSk7XG4gICAgICAgIHJldHVybiBWYWxpZGF0aW9uLlN1Y2Nlc3MoVHVwbGUuUGFpcihbcmVzMS52YWx1ZVswXV0uY29uY2F0KHJlc04udmFsdWVbMF0pLCByZXNOLnZhbHVlWzFdKSk7XG4gICAgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1hbnkoeFApIHtcbiAgICBjb25zdCBsYWJlbCA9ICdtYW55ICcgKyB4UC5sYWJlbDtcbiAgICByZXR1cm4gcGFyc2VyKHN0ciA9PiB7XG4gICAgICAgIHJldHVybiB6ZXJvT3JNb3JlKHhQKShzdHIpO1xuICAgIH0sIGxhYmVsKS5zZXRMYWJlbChsYWJlbCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtYW55MSh4UCkge1xuICAgIGNvbnN0IGxhYmVsID0gJ21hbnkxICcgKyB4UC5sYWJlbDtcbiAgICByZXR1cm4gcGFyc2VyKHN0ciA9PiB7XG4gICAgICAgIGxldCByZXMxID0geFAucnVuKHN0cik7XG4gICAgICAgIGlmIChyZXMxLmlzRmFpbHVyZSkgcmV0dXJuIHJlczE7XG4gICAgICAgIGxldCByZXNOID0gemVyb09yTW9yZSh4UCkocmVzMS52YWx1ZVsxXSk7XG4gICAgICAgIHJldHVybiBWYWxpZGF0aW9uLlN1Y2Nlc3MoVHVwbGUuUGFpcihbcmVzMS52YWx1ZVswXV0uY29uY2F0KHJlc04udmFsdWVbMF0pLCByZXNOLnZhbHVlWzFdKSk7XG4gICAgfSwgbGFiZWwpLnNldExhYmVsKGxhYmVsKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG9wdCh4UCkge1xuICAgIGNvbnN0IGxhYmVsID0gJ29wdCAnICsgeFAubGFiZWw7XG4gICAgcmV0dXJuIHBhcnNlcihzdHIgPT4ge1xuICAgICAgICBsZXQgcmVzID0geFAuZm1hcCh4ID0+IE1heWJlLkp1c3QoeCkpLnJ1bihzdHIpO1xuICAgICAgICBpZiAocmVzLmlzU3VjY2VzcykgcmV0dXJuIHJlcztcbiAgICAgICAgcmV0dXJuIFZhbGlkYXRpb24uU3VjY2VzcyhUdXBsZS5QYWlyKE1heWJlLk5vdGhpbmcoKSwgc3RyKSk7XG4gICAgfSwgbGFiZWwpLnNldExhYmVsKGxhYmVsKTtcbn1cblxuLy8gb3B0IGZyb20gdGhlIGJvb2sgLSB3b3JrcyBvaywgYnV0IHRvU3RyaW5nKCkgZ2l2ZXMgc3RyYW5nZSByZXN1bHRzXG5leHBvcnQgZnVuY3Rpb24gb3B0Qm9vayhwWCkge1xuICAgIGNvbnN0IHNvbWVQID0gcFguZm1hcChNYXliZS5KdXN0KTtcbiAgICBjb25zdCBub25lUCA9IHJldHVyblAoTWF5YmUuTm90aGluZyk7XG4gICAgcmV0dXJuIHNvbWVQLm9yRWxzZShub25lUCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBkaXNjYXJkU2Vjb25kKHAxLCBwMikge1xuICAgIGNvbnN0IGxhYmVsID0gcDEubGFiZWwgKyAnIGRpc2NhcmRTZWNvbmQgJyArIHAyLmxhYmVsO1xuICAgIHJldHVybiBwYXJzZXIoc3RyID0+IHtcbiAgICAgICAgcmV0dXJuIGFuZFRoZW4ocDEsIHAyKS5mbWFwKChbeCwgeV0pID0+IHgpLnJ1bihzdHIpO1xuICAgIH0sIGxhYmVsKS5zZXRMYWJlbChsYWJlbCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBkaXNjYXJkRmlyc3QocDEsIHAyKSB7XG4gICAgY29uc3QgbGFiZWwgPSBwMS5sYWJlbCArICcgZGlzY2FyZEZpcnN0ICcgKyBwMi5sYWJlbDtcbiAgICByZXR1cm4gcGFyc2VyKHN0ciA9PiB7XG4gICAgICAgIHJldHVybiBhbmRUaGVuKHAxLCBwMikuZm1hcCgoW3gsIHldKSA9PiB5KS5ydW4oc3RyKTtcbiAgICB9LCBsYWJlbCkuc2V0TGFiZWwobGFiZWwpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYmV0d2VlbihwMSwgcDIsIHAzKSB7XG4gICAgcmV0dXJuIHAxLmRpc2NhcmRGaXJzdChwMikuZGlzY2FyZFNlY29uZChwMylcbiAgICAgICAgLnNldExhYmVsKCdiZXR3ZWVuICcgKyBwMS5sYWJlbCArICcvJyArIHAyLmxhYmVsICsgJy8nICsgcDMubGFiZWwpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYmV0d2VlblBhcmVucyhweCkge1xuICAgIHJldHVybiBiZXR3ZWVuKHBjaGFyKCcoJyksIHB4LCBwY2hhcignKScpKVxuICAgICAgICAuc2V0TGFiZWwoJ2JldHdlZW5QYXJlbnMgJyArIHB4LmxhYmVsKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGJpbmRQKGZhbWIsIHB4KSB7XG4gICAgbGV0IGxhYmVsID0gJ3Vua25vd24nO1xuICAgIHJldHVybiBwYXJzZXIoc3RyID0+IHtcbiAgICAgICAgY29uc3QgcmVzID0gcHgucnVuKHN0cik7XG4gICAgICAgIGlmIChyZXMuaXNGYWlsdXJlKSByZXR1cm4gcmVzO1xuICAgICAgICByZXR1cm4gZmFtYihyZXMudmFsdWVbMF0pLnJ1bihyZXMudmFsdWVbMV0pO1xuICAgIH0sIGxhYmVsKS5zZXRMYWJlbChsYWJlbCk7XG59XG5cbmZ1bmN0aW9uIF9jb25zKHgpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKHhzKSB7XG4gICAgICAgIHJldHVybiBbeF0uY29uY2F0KHhzKTtcbiAgICB9O1xufVxuXG5mdW5jdGlvbiBfc2V0TGFiZWwocHgsIG5ld0xhYmVsKSB7XG4gICAgcmV0dXJuIHBhcnNlcihzdHIgPT4ge1xuICAgICAgICBsZXQgcmVzdWx0ID0gcHgucnVuKHN0cik7XG4gICAgICAgIGlmIChyZXN1bHQuaXNGYWlsdXJlKSByZXR1cm4gVmFsaWRhdGlvbi5GYWlsdXJlKFR1cGxlLlBhaXIobmV3TGFiZWwsIHJlc3VsdC52YWx1ZVsxXSkpO1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sIG5ld0xhYmVsKTtcbn1cblxuLy8gdGhlIHJlYWwgdGhpbmcuLi5cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZXIoZm4sIGxhYmVsKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgdHlwZTogJ3BhcnNlcicsXG4gICAgICAgIGxhYmVsOiBsYWJlbCxcbiAgICAgICAgcnVuKHN0cikge1xuICAgICAgICAgICAgcmV0dXJuIGZuKHN0cik7XG4gICAgICAgIH0sXG4gICAgICAgIGFwcGx5KHB4KSB7XG4gICAgICAgICAgICByZXR1cm4gYXBwbHlQKHRoaXMpKHB4KTtcbiAgICAgICAgICAgIC8vcmV0dXJuIHRoaXMuYmluZChhbmRUaGVuKHRoaXMsIHB4KS5mbWFwKChbZiwgeF0pID0+IGYoeCkpKS5ydW47IC8vIHdlIGFyZSB0aGUgZlBcbiAgICAgICAgfSxcbiAgICAgICAgZm1hcChmYWIpIHtcbiAgICAgICAgICAgIC8vcmV0dXJuIGZtYXAoZmFiLCB0aGlzKTtcbiAgICAgICAgICAgIC8vcmV0dXJuIGJpbmRQKHN0ciA9PiByZXR1cm5QKGZhYihzdHIpKSwgdGhpcyk7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5iaW5kKHBhcnNlZFZhbHVlID0+IHJldHVyblAoZmFiKHBhcnNlZFZhbHVlKSkpO1xuICAgICAgICB9LFxuICAgICAgICBhbmRUaGVuKHB4KSB7XG4gICAgICAgICAgICByZXR1cm4gYW5kVGhlbih0aGlzLCBweCk7XG4gICAgICAgIH0sXG4gICAgICAgIG9yRWxzZShweCkge1xuICAgICAgICAgICAgcmV0dXJuIG9yRWxzZSh0aGlzLCBweCk7XG4gICAgICAgIH0sXG4gICAgICAgIGRpc2NhcmRGaXJzdChweCkge1xuICAgICAgICAgICAgcmV0dXJuIGRpc2NhcmRGaXJzdCh0aGlzLCBweCk7XG4gICAgICAgIH0sXG4gICAgICAgIGRpc2NhcmRTZWNvbmQocHgpIHtcbiAgICAgICAgICAgIHJldHVybiBkaXNjYXJkU2Vjb25kKHRoaXMsIHB4KTtcbiAgICAgICAgfSxcbiAgICAgICAgYmluZChmYW1iKSB7XG4gICAgICAgICAgICByZXR1cm4gYmluZFAoZmFtYiwgdGhpcyk7XG4gICAgICAgIH0sXG4gICAgICAgIHNldExhYmVsKG5ld0xhYmVsKSB7XG4gICAgICAgICAgICByZXR1cm4gX3NldExhYmVsKHRoaXMsIG5ld0xhYmVsKTtcbiAgICAgICAgfVxuICAgIH07XG59XG4iXX0=