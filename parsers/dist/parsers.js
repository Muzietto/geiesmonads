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
            var optChar = pos.char();
            if (optChar.isNothing) return _validation.Validation.Failure(_classes.Tuple.Triple('charParser', 'no more input', pos));
            if (optChar.value === char) return _validation.Validation.Success(_classes.Tuple.Pair(char, pos.incrPos()));
            return _validation.Validation.Failure(_classes.Tuple.Triple('charParser', 'wanted ' + char + '; got ' + optChar.value, pos));
        };
    };

    var digitParser = function digitParser(digit) {
        return function (pos) {
            var optChar = pos.char();
            if (optChar.isNothing) return _validation.Validation.Failure(_classes.Tuple.Triple('digitParser', 'no more input', pos));
            if (parseInt(optChar.value, 10) === digit) return _validation.Validation.Success(_classes.Tuple.Pair(digit, pos.incrPos()));
            return _validation.Validation.Failure(_classes.Tuple.Triple('digitParser', 'wanted ' + digit + '; got ' + optChar.val(), pos));
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2pzL3BhcnNlcnMuanMiXSwibmFtZXMiOlsicGNoYXIiLCJwZGlnaXQiLCJhbmRUaGVuWCIsImNob2ljZSIsImFueU9mIiwiZm1hcCIsInJldHVyblAiLCJhcHBseVB4IiwiYXBwbHlQIiwibGlmdDIiLCJzZXF1ZW5jZVAiLCJzZXF1ZW5jZVAyIiwicHN0cmluZyIsInplcm9Pck1vcmUiLCJtYW55IiwibWFueTEiLCJvcHQiLCJvcHRCb29rIiwiYmV0d2VlbiIsImJldHdlZW5QYXJlbnMiLCJiaW5kUCIsInBhcnNlciIsImNoYXJQYXJzZXIiLCJvcHRDaGFyIiwicG9zIiwiY2hhciIsImlzTm90aGluZyIsIkZhaWx1cmUiLCJUcmlwbGUiLCJ2YWx1ZSIsIlN1Y2Nlc3MiLCJQYWlyIiwiaW5jclBvcyIsImRpZ2l0UGFyc2VyIiwicGFyc2VJbnQiLCJkaWdpdCIsInZhbCIsImxhYmVsIiwicmVzdWx0Iiwic3RyIiwic2V0TGFiZWwiLCJwMSIsInAyIiwicmVzMSIsInJ1biIsImlzU3VjY2VzcyIsInJlczIiLCJhbmRUaGVuIiwiYmluZCIsInBhcnNlZFZhbHVlMSIsInBhcnNlZFZhbHVlMiIsIm9yRWxzZSIsIl9mYWlsIiwiX3N1Y2NlZWQiLCJwYXJzZXJzIiwicmVkdWNlUmlnaHQiLCJyZXN0IiwiY3VyciIsInJlZHVjZSIsImFjYyIsImNoYXJzIiwibWFwIiwiZmFiIiwicGFyc2VyMSIsInRvU3RyaW5nIiwicmVzIiwiZlAiLCJ4UCIsImYiLCJ4IiwicGFyc2VkVmFsdWVmIiwicGFyc2VkVmFsdWV4IiwiZmFhYiIsInBhcnNlcjIiLCJhcHBseSIsIl9jb25zIiwieSIsInNwbGl0IiwiaXNGYWlsdXJlIiwicmVzTiIsImNvbmNhdCIsIkp1c3QiLCJOb3RoaW5nIiwicFgiLCJzb21lUCIsIm5vbmVQIiwiZGlzY2FyZFNlY29uZCIsImRpc2NhcmRGaXJzdCIsInAzIiwicHgiLCJmYW1iIiwieHMiLCJfc2V0TGFiZWwiLCJuZXdMYWJlbCIsImZuIiwidHlw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SUFBSWtDLFdBQUosQ0FBUixDQUFmO0FBQUEsaUJBQVYsQ0FBUDtBQUNILGFBZEU7QUFlSGpELG1CQWZHLG1CQWVLMEMsRUFmTCxFQWVTO0FBQ1IsdUJBQU8xQyxTQUFRLElBQVIsRUFBYzBDLEVBQWQsQ0FBUDtBQUNILGFBakJFO0FBa0JIdEMsa0JBbEJHLGtCQWtCSXNDLEVBbEJKLEVBa0JRO0FBQ1AsdUJBQU90QyxRQUFPLElBQVAsRUFBYXNDLEVBQWIsQ0FBUDtBQUNILGFBcEJFO0FBcUJIRix3QkFyQkcsd0JBcUJVRSxFQXJCVixFQXFCYztBQUNiLHVCQUFPRixjQUFhLElBQWIsRUFBbUJFLEVBQW5CLENBQVA7QUFDSCxhQXZCRTtBQXdCSEgseUJBeEJHLHlCQXdCV0csRUF4QlgsRUF3QmU7QUFDZCx1QkFBT0gsZUFBYyxJQUFkLEVBQW9CRyxFQUFwQixDQUFQO0FBQ0gsYUExQkU7QUEyQkh6QyxnQkEzQkcsZ0JBMkJFMEMsSUEzQkYsRUEyQlE7QUFDUCx1QkFBT3RFLE1BQU1zRSxJQUFOLEVBQVksSUFBWixDQUFQO0FBQ0gsYUE3QkU7QUE4QkhsRCxvQkE5Qkcsb0JBOEJNcUQsUUE5Qk4sRUE4QmdCO0FBQ2YsdUJBQU9ELFVBQVUsSUFBVixFQUFnQkMsUUFBaEIsQ0FBUDtBQUNIO0FBaENFLFNBQVA7QUFrQ0giLCJmaWxlIjoicGFyc2Vycy5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vIGNmci4gXCJVbmRlcnN0YW5kaW5nIFBhcnNlciBDb21iaW5hdG9yc1wiIChGIyBmb3IgRnVuIGFuZCBQcm9maXQpXG5cbmltcG9ydCB7XG4gICAgVHVwbGUsXG59IGZyb20gJ2NsYXNzZXMnO1xuaW1wb3J0IHtNYXliZX0gZnJvbSAnbWF5YmUnOyAvLyBKdXN0IG9yIE5vdGhpbmdcbmltcG9ydCB7VmFsaWRhdGlvbn0gZnJvbSAndmFsaWRhdGlvbic7IC8vIFN1Y2Nlc3Mgb3IgRmFpbHVyZVxuXG5jb25zdCBjaGFyUGFyc2VyID0gY2hhciA9PiBwb3MgPT4ge1xuICAgIGNvbnN0IG9wdENoYXIgPSBwb3MuY2hhcigpO1xuICAgIGlmIChvcHRDaGFyLmlzTm90aGluZykgcmV0dXJuIFZhbGlkYXRpb24uRmFpbHVyZShUdXBsZS5UcmlwbGUoJ2NoYXJQYXJzZXInLCAnbm8gbW9yZSBpbnB1dCcsIHBvcykpO1xuICAgIGlmIChvcHRDaGFyLnZhbHVlID09PSBjaGFyKSByZXR1cm4gVmFsaWRhdGlvbi5TdWNjZXNzKFR1cGxlLlBhaXIoY2hhciwgcG9zLmluY3JQb3MoKSkpO1xuICAgIHJldHVybiBWYWxpZGF0aW9uLkZhaWx1cmUoVHVwbGUuVHJpcGxlKCdjaGFyUGFyc2VyJywgJ3dhbnRlZCAnICsgY2hhciArICc7IGdvdCAnICsgb3B0Q2hhci52YWx1ZSwgcG9zKSk7XG59O1xuXG5jb25zdCBkaWdpdFBhcnNlciA9IGRpZ2l0ID0+IHBvcyA9PiB7XG4gICAgY29uc3Qgb3B0Q2hhciA9IHBvcy5jaGFyKCk7XG4gICAgaWYgKG9wdENoYXIuaXNOb3RoaW5nKSByZXR1cm4gVmFsaWRhdGlvbi5GYWlsdXJlKFR1cGxlLlRyaXBsZSgnZGlnaXRQYXJzZXInLCAnbm8gbW9yZSBpbnB1dCcsIHBvcykpO1xuICAgIGlmIChwYXJzZUludChvcHRDaGFyLnZhbHVlLCAxMCkgPT09IGRpZ2l0KSByZXR1cm4gVmFsaWRhdGlvbi5TdWNjZXNzKFR1cGxlLlBhaXIoZGlnaXQsIHBvcy5pbmNyUG9zKCkpKTtcbiAgICByZXR1cm4gVmFsaWRhdGlvbi5GYWlsdXJlKFR1cGxlLlRyaXBsZSgnZGlnaXRQYXJzZXInLCAnd2FudGVkICcgKyBkaWdpdCArICc7IGdvdCAnICsgb3B0Q2hhci52YWwoKSwgcG9zKSk7XG59O1xuXG5leHBvcnQge2NoYXJQYXJzZXIsIGRpZ2l0UGFyc2VyfTtcblxuZXhwb3J0IGZ1bmN0aW9uIHBjaGFyKGNoYXIpIHtcbiAgICBjb25zdCBsYWJlbCA9ICdwY2hhcl8nICsgY2hhcjtcbiAgICBsZXQgcmVzdWx0ID0gZnVuY3Rpb24gKHN0cikge1xuICAgICAgICByZXR1cm4gY2hhclBhcnNlcihjaGFyKShzdHIpO1xuICAgIH07XG4gICAgcmV0dXJuIHBhcnNlcihyZXN1bHQsIGxhYmVsKS5zZXRMYWJlbChsYWJlbCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwZGlnaXQoZGlnaXQpIHtcbiAgICByZXR1cm4gcGFyc2VyKHN0ciA9PiBkaWdpdFBhcnNlcihkaWdpdCkoc3RyKSwgJ3BkaWdpdF8nICsgZGlnaXQpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYW5kVGhlblgocDEsIHAyKSB7XG4gICAgY29uc3QgbGFiZWwgPSBwMS5sYWJlbCArICcgYW5kVGhlbiAnICsgcDIubGFiZWw7XG4gICAgcmV0dXJuIHBhcnNlcihmdW5jdGlvbiAoc3RyKSB7XG4gICAgICAgIGxldCByZXMxID0gcDEucnVuKHN0cik7XG4gICAgICAgIGlmIChyZXMxLmlzU3VjY2Vzcykge1xuICAgICAgICAgICAgbGV0IHJlczIgPSBwMi5ydW4ocmVzMS52YWx1ZVsxXSk7XG4gICAgICAgICAgICBpZiAocmVzMi5pc1N1Y2Nlc3MpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gVmFsaWRhdGlvbi5TdWNjZXNzKFR1cGxlLlBhaXIoVHVwbGUuUGFpcihyZXMxLnZhbHVlWzBdLCByZXMyLnZhbHVlWzBdKSwgcmVzMi52YWx1ZVsxXSkpO1xuICAgICAgICAgICAgfSBlbHNlIHJldHVybiBWYWxpZGF0aW9uLkZhaWx1cmUoVHVwbGUuUGFpcihsYWJlbCwgcmVzMi52YWx1ZVsxXSkpO1xuICAgICAgICB9IGVsc2UgcmV0dXJuIFZhbGlkYXRpb24uRmFpbHVyZShUdXBsZS5QYWlyKGxhYmVsLCByZXMxLnZhbHVlWzFdKSk7XG4gICAgfSwgbGFiZWwpO1xufVxuXG4vLyB1c2luZyBiaW5kXG5leHBvcnQgZnVuY3Rpb24gYW5kVGhlbihwMSwgcDIpIHtcbiAgICByZXR1cm4gcDEuYmluZChwYXJzZWRWYWx1ZTEgPT4ge1xuICAgICAgICByZXR1cm4gcDIuYmluZChwYXJzZWRWYWx1ZTIgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHJldHVyblAoVHVwbGUuUGFpcihwYXJzZWRWYWx1ZTEsIHBhcnNlZFZhbHVlMikpO1xuICAgICAgICB9KTtcbiAgICB9KS5zZXRMYWJlbChwMS5sYWJlbCArICcgYW5kVGhlbiAnICsgcDIubGFiZWwpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gb3JFbHNlKHAxLCBwMikge1xuICAgIGNvbnN0IGxhYmVsID0gcDEubGFiZWwgKyAnIG9yRWxzZSAnICsgcDIubGFiZWw7XG4gICAgcmV0dXJuIHBhcnNlcihzdHIgPT4ge1xuICAgICAgICBjb25zdCByZXMxID0gcDEucnVuKHN0cik7XG4gICAgICAgIGlmIChyZXMxLmlzU3VjY2VzcykgcmV0dXJuIHJlczE7XG4gICAgICAgIGNvbnN0IHJlczIgPSBwMi5ydW4oc3RyKTtcbiAgICAgICAgaWYgKHJlczIuaXNTdWNjZXNzKSByZXR1cm4gcmVzMjtcbiAgICAgICAgcmV0dXJuIFZhbGlkYXRpb24uRmFpbHVyZShUdXBsZS5QYWlyKGxhYmVsLCByZXMyLnZhbHVlWzFdKSk7XG4gICAgfSwgbGFiZWwpLnNldExhYmVsKGxhYmVsKTtcbn1cblxubGV0IF9mYWlsID0gcGFyc2VyKHN0ciA9PiBWYWxpZGF0aW9uLkZhaWx1cmUoVHVwbGUuUGFpcihUdXBsZS5QYWlyKCdwYXJzaW5nIGZhaWxlZCcsICdfZmFpbCcpLCAnX2ZhaWwnKSkpO1xuXG4vLyByZXR1cm4gbmV1dHJhbCBlbGVtZW50IGluc3RlYWQgb2YgbWVzc2FnZVxubGV0IF9zdWNjZWVkID0gcGFyc2VyKHN0ciA9PiBWYWxpZGF0aW9uLlN1Y2Nlc3MoVHVwbGUuUGFpcihUdXBsZS5QYWlyKCdwYXJzaW5nIHN1Y2NlZWRlZCcsIHN0ciksICdfc3VjY2VlZCcpKSk7XG5cbmV4cG9ydCBmdW5jdGlvbiBjaG9pY2UocGFyc2Vycykge1xuICAgIHJldHVybiBwYXJzZXJzLnJlZHVjZVJpZ2h0KChyZXN0LCBjdXJyKSA9PiBvckVsc2UoY3VyciwgcmVzdCksIF9mYWlsKVxuICAgICAgICAuc2V0TGFiZWwoJ2Nob2ljZSAnICsgcGFyc2Vycy5yZWR1Y2UoKGFjYywgY3VycikgPT4gYWNjICsgJy8nICsgY3Vyci5sYWJlbCwgJycpKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGFueU9mKGNoYXJzKSB7XG4gICAgcmV0dXJuIGNob2ljZShjaGFycy5tYXAocGNoYXIpKVxuICAgICAgICAuc2V0TGFiZWwoJ2FueU9mICcgKyBjaGFycy5yZWR1Y2UoKGFjYywgY3VycikgPT4gYWNjICsgY3VyciwgJycpKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGZtYXAoZmFiLCBwYXJzZXIxKSB7XG4gICAgY29uc3QgbGFiZWwgPSBwYXJzZXIxLmxhYmVsICsgJyBmbWFwICcgKyBmYWIudG9TdHJpbmcoKTtcbiAgICByZXR1cm4gcGFyc2VyKHN0ciA9PiB7XG4gICAgICAgIGxldCByZXMgPSBwYXJzZXIxLnJ1bihzdHIpO1xuICAgICAgICBpZiAocmVzLmlzU3VjY2VzcykgcmV0dXJuIFZhbGlkYXRpb24uU3VjY2VzcyhUdXBsZS5QYWlyKGZhYihyZXMudmFsdWVbMF0pLCByZXMudmFsdWVbMV0pKTtcbiAgICAgICAgcmV0dXJuIFZhbGlkYXRpb24uRmFpbHVyZShUdXBsZS5QYWlyKGxhYmVsLCByZXMudmFsdWVbMV0pKTtcbiAgICB9LCBsYWJlbCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZXR1cm5QKHZhbHVlKSB7XG4gICAgcmV0dXJuIHBhcnNlcihzdHIgPT4gVmFsaWRhdGlvbi5TdWNjZXNzKFR1cGxlLlBhaXIodmFsdWUsIHN0cikpLCB2YWx1ZSk7XG59XG5cbi8vIHBhcnNlcihhIC0+IGIpIC0+IHBhcnNlcihhKSAtPiBwYXJzZXIoYilcbmV4cG9ydCBmdW5jdGlvbiBhcHBseVB4KGZQKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uICh4UCkge1xuICAgICAgICByZXR1cm4gYW5kVGhlbihmUCwgeFApLmZtYXAoKFtmLCB4XSkgPT4gZih4KSk7XG4gICAgfTtcbn1cblxuLy8gdXNpbmcgYmluZFxuZXhwb3J0IGZ1bmN0aW9uIGFwcGx5UChmUCkge1xuICAgIHJldHVybiBmdW5jdGlvbiAoeFApIHtcbiAgICAgICAgcmV0dXJuIGZQLmJpbmQocGFyc2VkVmFsdWVmID0+IHtcbiAgICAgICAgICAgIHJldHVybiB4UC5iaW5kKHBhcnNlZFZhbHVleCA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJldHVyblAocGFyc2VkVmFsdWVmKHBhcnNlZFZhbHVleCkpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBsaWZ0MihmYWFiKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uIChwYXJzZXIxKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAocGFyc2VyMikge1xuICAgICAgICAgICAgLy9yZXR1cm4gYXBwbHlQKGFwcGx5UChyZXR1cm5QKGZhYWIpKShwYXJzZXIxKSkocGFyc2VyMik7XG4gICAgICAgICAgICByZXR1cm4gcmV0dXJuUChmYWFiKS5hcHBseShwYXJzZXIxKS5hcHBseShwYXJzZXIyKTsgLy8gdXNpbmcgaW5zdGFuY2UgbWV0aG9kc1xuICAgICAgICB9O1xuICAgIH07XG59XG5cbi8vIHVzaW5nIGxpZnQyKGNvbnMpXG5leHBvcnQgZnVuY3Rpb24gc2VxdWVuY2VQKHBhcnNlcnMpIHtcbiAgICByZXR1cm4gcGFyc2Vyc1xuICAgICAgICAucmVkdWNlUmlnaHQoKHJlc3QsIGN1cnIpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBsaWZ0MihfY29ucykoY3VycikocmVzdCk7XG4gICAgICAgIH0sIHJldHVyblAoW10pKTtcbn1cblxuLy8gdXNpbmcgbmFpdmUgYW5kVGhlbiAmJiBmbWFwIC0tPiByZXR1cm5zIHN0cmluZ3MsIG5vdCBhcnJheXMhXG5leHBvcnQgZnVuY3Rpb24gc2VxdWVuY2VQMihwYXJzZXJzKSB7XG4gICAgcmV0dXJuIHBhcnNlcnNcbiAgICAgICAgLnJlZHVjZVJpZ2h0KChyZXN0LCBjdXJyKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gZm1hcCgoW3gsIHldKSA9PiB4ICsgeSwgYW5kVGhlbihjdXJyLCByZXN0KSk7XG4gICAgICAgIH0sIHJldHVyblAoJycpKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHBzdHJpbmcoc3RyKSB7XG4gICAgcmV0dXJuIHNlcXVlbmNlUChzdHIuc3BsaXQoJycpLm1hcChwY2hhcikpXG4gICAgICAgIC5zZXRMYWJlbCgncHN0cmluZyAnICsgc3RyKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHplcm9Pck1vcmUoeFApIHsgLy8gemVyb09yTW9yZSA6OiBwIGEgLT4gW2FdIC0+IHRyeSBbYV0gPSBwIGEgLT4gcCBbYV1cbiAgICByZXR1cm4gc3RyID0+IHtcbiAgICAgICAgbGV0IHJlczEgPSB4UC5ydW4oc3RyKTtcbiAgICAgICAgaWYgKHJlczEuaXNGYWlsdXJlKSByZXR1cm4gVmFsaWRhdGlvbi5TdWNjZXNzKFR1cGxlLlBhaXIoW10sIHN0cikpO1xuICAgICAgICBsZXQgcmVzTiA9IHplcm9Pck1vcmUoeFApKHJlczEudmFsdWVbMV0pO1xuICAgICAgICByZXR1cm4gVmFsaWRhdGlvbi5TdWNjZXNzKFR1cGxlLlBhaXIoW3JlczEudmFsdWVbMF1dLmNvbmNhdChyZXNOLnZhbHVlWzBdKSwgcmVzTi52YWx1ZVsxXSkpO1xuICAgIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtYW55KHhQKSB7XG4gICAgY29uc3QgbGFiZWwgPSAnbWFueSAnICsgeFAubGFiZWw7XG4gICAgcmV0dXJuIHBhcnNlcihzdHIgPT4ge1xuICAgICAgICByZXR1cm4gemVyb09yTW9yZSh4UCkoc3RyKTtcbiAgICB9LCBsYWJlbCkuc2V0TGFiZWwobGFiZWwpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbWFueTEoeFApIHtcbiAgICBjb25zdCBsYWJlbCA9ICdtYW55MSAnICsgeFAubGFiZWw7XG4gICAgcmV0dXJuIHBhcnNlcihzdHIgPT4ge1xuICAgICAgICBsZXQgcmVzMSA9IHhQLnJ1bihzdHIpO1xuICAgICAgICBpZiAocmVzMS5pc0ZhaWx1cmUpIHJldHVybiByZXMxO1xuICAgICAgICBsZXQgcmVzTiA9IHplcm9Pck1vcmUoeFApKHJlczEudmFsdWVbMV0pO1xuICAgICAgICByZXR1cm4gVmFsaWRhdGlvbi5TdWNjZXNzKFR1cGxlLlBhaXIoW3JlczEudmFsdWVbMF1dLmNvbmNhdChyZXNOLnZhbHVlWzBdKSwgcmVzTi52YWx1ZVsxXSkpO1xuICAgIH0sIGxhYmVsKS5zZXRMYWJlbChsYWJlbCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBvcHQoeFApIHtcbiAgICBjb25zdCBsYWJlbCA9ICdvcHQgJyArIHhQLmxhYmVsO1xuICAgIHJldHVybiBwYXJzZXIoc3RyID0+IHtcbiAgICAgICAgbGV0IHJlcyA9IHhQLmZtYXAoeCA9PiBNYXliZS5KdXN0KHgpKS5ydW4oc3RyKTtcbiAgICAgICAgaWYgKHJlcy5pc1N1Y2Nlc3MpIHJldHVybiByZXM7XG4gICAgICAgIHJldHVybiBWYWxpZGF0aW9uLlN1Y2Nlc3MoVHVwbGUuUGFpcihNYXliZS5Ob3RoaW5nKCksIHN0cikpO1xuICAgIH0sIGxhYmVsKS5zZXRMYWJlbChsYWJlbCk7XG59XG5cbi8vIG9wdCBmcm9tIHRoZSBib29rIC0gd29ya3Mgb2ssIGJ1dCB0b1N0cmluZygpIGdpdmVzIHN0cmFuZ2UgcmVzdWx0c1xuZXhwb3J0IGZ1bmN0aW9uIG9wdEJvb2socFgpIHtcbiAgICBjb25zdCBzb21lUCA9IHBYLmZtYXAoTWF5YmUuSnVzdCk7XG4gICAgY29uc3Qgbm9uZVAgPSByZXR1cm5QKE1heWJlLk5vdGhpbmcpO1xuICAgIHJldHVybiBzb21lUC5vckVsc2Uobm9uZVApO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZGlzY2FyZFNlY29uZChwMSwgcDIpIHtcbiAgICBjb25zdCBsYWJlbCA9IHAxLmxhYmVsICsgJyBkaXNjYXJkU2Vjb25kICcgKyBwMi5sYWJlbDtcbiAgICByZXR1cm4gcGFyc2VyKHN0ciA9PiB7XG4gICAgICAgIHJldHVybiBhbmRUaGVuKHAxLCBwMikuZm1hcCgoW3gsIHldKSA9PiB4KS5ydW4oc3RyKTtcbiAgICB9LCBsYWJlbCkuc2V0TGFiZWwobGFiZWwpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZGlzY2FyZEZpcnN0KHAxLCBwMikge1xuICAgIGNvbnN0IGxhYmVsID0gcDEubGFiZWwgKyAnIGRpc2NhcmRGaXJzdCAnICsgcDIubGFiZWw7XG4gICAgcmV0dXJuIHBhcnNlcihzdHIgPT4ge1xuICAgICAgICByZXR1cm4gYW5kVGhlbihwMSwgcDIpLmZtYXAoKFt4LCB5XSkgPT4geSkucnVuKHN0cik7XG4gICAgfSwgbGFiZWwpLnNldExhYmVsKGxhYmVsKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGJldHdlZW4ocDEsIHAyLCBwMykge1xuICAgIHJldHVybiBwMS5kaXNjYXJkRmlyc3QocDIpLmRpc2NhcmRTZWNvbmQocDMpXG4gICAgICAgIC5zZXRMYWJlbCgnYmV0d2VlbiAnICsgcDEubGFiZWwgKyAnLycgKyBwMi5sYWJlbCArICcvJyArIHAzLmxhYmVsKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGJldHdlZW5QYXJlbnMocHgpIHtcbiAgICByZXR1cm4gYmV0d2VlbihwY2hhcignKCcpLCBweCwgcGNoYXIoJyknKSlcbiAgICAgICAgLnNldExhYmVsKCdiZXR3ZWVuUGFyZW5zICcgKyBweC5sYWJlbCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBiaW5kUChmYW1iLCBweCkge1xuICAgIGxldCBsYWJlbCA9ICd1bmtub3duJztcbiAgICByZXR1cm4gcGFyc2VyKHN0ciA9PiB7XG4gICAgICAgIGNvbnN0IHJlcyA9IHB4LnJ1bihzdHIpO1xuICAgICAgICBpZiAocmVzLmlzRmFpbHVyZSkgcmV0dXJuIHJlcztcbiAgICAgICAgcmV0dXJuIGZhbWIocmVzLnZhbHVlWzBdKS5ydW4ocmVzLnZhbHVlWzFdKTtcbiAgICB9LCBsYWJlbCkuc2V0TGFiZWwobGFiZWwpO1xufVxuXG5mdW5jdGlvbiBfY29ucyh4KSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uICh4cykge1xuICAgICAgICByZXR1cm4gW3hdLmNvbmNhdCh4cyk7XG4gICAgfTtcbn1cblxuZnVuY3Rpb24gX3NldExhYmVsKHB4LCBuZXdMYWJlbCkge1xuICAgIHJldHVybiBwYXJzZXIoc3RyID0+IHtcbiAgICAgICAgbGV0IHJlc3VsdCA9IHB4LnJ1bihzdHIpO1xuICAgICAgICBpZiAocmVzdWx0LmlzRmFpbHVyZSkgcmV0dXJuIFZhbGlkYXRpb24uRmFpbHVyZShUdXBsZS5QYWlyKG5ld0xhYmVsLCByZXN1bHQudmFsdWVbMV0pKTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LCBuZXdMYWJlbCk7XG59XG5cbi8vIHRoZSByZWFsIHRoaW5nLi4uXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VyKGZuLCBsYWJlbCkge1xuICAgIHJldHVybiB7XG4gICAgICAgIHR5cGU6ICdwYXJzZXInLFxuICAgICAgICBsYWJlbDogbGFiZWwsXG4gICAgICAgIHJ1bihzdHIpIHtcbiAgICAgICAgICAgIHJldHVybiBmbihzdHIpO1xuICAgICAgICB9LFxuICAgICAgICBhcHBseShweCkge1xuICAgICAgICAgICAgcmV0dXJuIGFwcGx5UCh0aGlzKShweCk7XG4gICAgICAgICAgICAvL3JldHVybiB0aGlzLmJpbmQoYW5kVGhlbih0aGlzLCBweCkuZm1hcCgoW2YsIHhdKSA9PiBmKHgpKSkucnVuOyAvLyB3ZSBhcmUgdGhlIGZQXG4gICAgICAgIH0sXG4gICAgICAgIGZtYXAoZmFiKSB7XG4gICAgICAgICAgICAvL3JldHVybiBmbWFwKGZhYiwgdGhpcyk7XG4gICAgICAgICAgICAvL3JldHVybiBiaW5kUChzdHIgPT4gcmV0dXJuUChmYWIoc3RyKSksIHRoaXMpO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuYmluZChwYXJzZWRWYWx1ZSA9PiByZXR1cm5QKGZhYihwYXJzZWRWYWx1ZSkpKTtcbiAgICAgICAgfSxcbiAgICAgICAgYW5kVGhlbihweCkge1xuICAgICAgICAgICAgcmV0dXJuIGFuZFRoZW4odGhpcywgcHgpO1xuICAgICAgICB9LFxuICAgICAgICBvckVsc2UocHgpIHtcbiAgICAgICAgICAgIHJldHVybiBvckVsc2UodGhpcywgcHgpO1xuICAgICAgICB9LFxuICAgICAgICBkaXNjYXJkRmlyc3QocHgpIHtcbiAgICAgICAgICAgIHJldHVybiBkaXNjYXJkRmlyc3QodGhpcywgcHgpO1xuICAgICAgICB9LFxuICAgICAgICBkaXNjYXJkU2Vjb25kKHB4KSB7XG4gICAgICAgICAgICByZXR1cm4gZGlzY2FyZFNlY29uZCh0aGlzLCBweCk7XG4gICAgICAgIH0sXG4gICAgICAgIGJpbmQoZmFtYikge1xuICAgICAgICAgICAgcmV0dXJuIGJpbmRQKGZhbWIsIHRoaXMpO1xuICAgICAgICB9LFxuICAgICAgICBzZXRMYWJlbChuZXdMYWJlbCkge1xuICAgICAgICAgICAgcmV0dXJuIF9zZXRMYWJlbCh0aGlzLCBuZXdMYWJlbCk7XG4gICAgICAgIH1cbiAgICB9O1xufVxuIl19