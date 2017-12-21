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
            if ((0, _util.head)(str) === char) return _validation.Validation.Success((0, _classes.Pair)(char, (0, _util.tail)(str)));
            var a = (0, _classes.Pair)('charParser', 'wanted ' + char + '; got ' + (0, _util.head)(str));
            return _validation.Validation.Failure(a);
        };
    };

    var digitParser = function digitParser(digit) {
        return function (str) {
            if ('' === str) throw new Error('reached end of char stream');
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
                var res2 = p2.run(res1[1]);
                if (res2.isSuccess) {
                    return _validation.Validation.Success((0, _classes.Pair)((0, _classes.Pair)(res1[0], res2[0]), res2[1]));
                } else return _validation.Validation.Failure((0, _classes.Pair)(label, res2[1]));
            } else return _validation.Validation.Failure((0, _classes.Pair)(label, res1[1]));
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
            return _validation.Validation.Failure((0, _classes.Pair)(label, res2[1]));
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
            if (_validation.Validation.isSuccess(res)) return _validation.Validation.Success((0, _classes.Pair)(fab(res[0]), res[1]));
            return _validation.Validation.Failure((0, _classes.Pair)(label, res[1]));
        }, label);
    }

    function returnP(value) {
        return parser(function (str) {
            return _validation.Validation.Success((0, _classes.Pair)((0, _classes.Pair)(value, str), value));
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
        return sequenceP(str.split('').map(pchar)).setLabel('pstring ' + str);
    }

    function zeroOrMore(xP) {
        // zeroOrMore :: p a -> [a] -> try [a] = p a -> p [a]
        return function (str) {
            var res1 = xP.run(str);
            if (res1.isFailure) return _validation.Validation.Success((0, _classes.Pair)([], str));
            var resN = zeroOrMore(xP)(res1[1]);
            return _validation.Validation.Success((0, _classes.Pair)([res1[0]].concat(resN[0]), resN[1]));
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
            return _validation.Validation.Success((0, _classes.Pair)([res1[0]].concat(resN[0]), resN[1]));
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2pzL3BhcnNlcnMuanMiXSwibmFtZXMiOlsicGNoYXIiLCJwZGlnaXQiLCJhbmRUaGVuWCIsImNob2ljZSIsImFueU9mIiwiZm1hcCIsInJldHVyblAiLCJhcHBseVB4IiwiYXBwbHlQIiwibGlmdDIiLCJzZXF1ZW5jZVAiLCJzZXF1ZW5jZVAyIiwicHN0cmluZyIsInplcm9Pck1vcmUiLCJtYW55IiwibWFueTEiLCJvcHQiLCJvcHRCb29rIiwiYmV0d2VlbiIsImJldHdlZW5QYXJlbnMiLCJiaW5kUCIsInBhcnNlciIsImNoYXJQYXJzZXIiLCJzdHIiLCJFcnJvciIsImNoYXIiLCJTdWNjZXNzIiwiYSIsIkZhaWx1cmUiLCJkaWdpdFBhcnNlciIsInBhcnNlSW50IiwiZGlnaXQiLCJsYWJlbCIsInJlc3VsdCIsInNldExhYmVsIiwicDEiLCJwMiIsInJlczEiLCJydW4iLCJpc1N1Y2Nlc3MiLCJyZXMyIiwiYW5kVGhlbiIsImJpbmQiLCJwYXJzZWRWYWx1ZTEiLCJwYXJzZWRWYWx1ZTIiLCJvckVsc2UiLCJfZmFpbCIsIl9zdWNjZWVkIiwicGFyc2VycyIsInJlZHVjZVJpZ2h0IiwicmVzdCIsImN1cnIiLCJyZWR1Y2UiLCJhY2MiLCJjaGFycyIsIm1hcCIsImZhYiIsInBhcnNlcjEiLCJ0b1N0cmluZyIsInJlcyIsInZhbHVlIiwiZlAiLCJ4UCIsImYiLCJ4IiwicGFyc2VkVmFsdWVmIiwicGFyc2VkVmFsdWV4IiwiZmFhYiIsInBhcnNlcjIiLCJhcHBseSIsIl9jb25zIiwieSIsInNwbGl0IiwiaXNGYWlsdXJlIiwicmVzTiIsImNvbmNhdCIsIkp1c3QiLCJOb3RoaW5nIiwicFgiLCJzb21lUCIsIm5vbmVQIiwiZGlzY2FyZFNlY29uZCIsInIxIiwicjIiLCJkaXNjYXJkRmlyc3QiLCJwMyIsInB4IiwiZmFtYiIsInhzIiwiX3NldExhYmVsIiwibmV3TGFiZWwiLCJmbiIsInR5cGUiLCJwYXJzZWRWYWx1ZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7OztZ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TSxlQUhHLGVBR0NmLEdBSEQsRUFHTTtBQUNMLHVCQUFPb0UsR0FBR3BFLEdBQUgsQ0FBUDtBQUNILGFBTEU7QUFNSDhDLGlCQU5HLGlCQU1HaUIsRUFOSCxFQU1PO0FBQ04sdUJBQU85RSxPQUFPLElBQVAsRUFBYThFLEVBQWIsQ0FBUDtBQUNBO0FBQ0gsYUFURTtBQVVIakYsZ0JBVkcsZ0JBVUVtRCxHQVZGLEVBVU87QUFDTjtBQUNBO0FBQ0EsdUJBQU8sS0FBS2QsSUFBTCxDQUFVO0FBQUEsMkJBQWVwQyxRQUFRa0QsSUFBSXFDLFdBQUosQ0FBUixDQUFmO0FBQUEsaUJBQVYsQ0FBUDtBQUNILGFBZEU7QUFlSHBELG1CQWZHLG1CQWVLNkMsRUFmTCxFQWVTO0FBQ1IsdUJBQU83QyxTQUFRLElBQVIsRUFBYzZDLEVBQWQsQ0FBUDtBQUNILGFBakJFO0FBa0JIekMsa0JBbEJHLGtCQWtCSXlDLEVBbEJKLEVBa0JRO0FBQ1AsdUJBQU96QyxRQUFPLElBQVAsRUFBYXlDLEVBQWIsQ0FBUDtBQUNILGFBcEJFO0FBcUJIRix3QkFyQkcsd0JBcUJVRSxFQXJCVixFQXFCYztBQUNiLHVCQUFPRixjQUFhLElBQWIsRUFBbUJFLEVBQW5CLENBQVA7QUFDSCxhQXZCRTtBQXdCSEwseUJBeEJHLHlCQXdCV0ssRUF4QlgsRUF3QmU7QUFDZCx1QkFBT0wsZUFBYyxJQUFkLEVBQW9CSyxFQUFwQixDQUFQO0FBQ0gsYUExQkU7QUEyQkg1QyxnQkEzQkcsZ0JBMkJFNkMsSUEzQkYsRUEyQlE7QUFDUCx1QkFBT25FLE1BQU1tRSxJQUFOLEVBQVksSUFBWixDQUFQO0FBQ0gsYUE3QkU7QUE4QkhyRCxvQkE5Qkcsb0JBOEJNd0QsUUE5Qk4sRUE4QmdCO0FBQ2YsdUJBQU9ELFVBQVUsSUFBVixFQUFnQkMsUUFBaEIsQ0FBUDtBQUNIO0FBaENFLFNBQVA7QUFrQ0giLCJmaWxlIjoicGFyc2Vycy5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vIGNmci4gXCJVbmRlcnN0YW5kaW5nIFBhcnNlciBDb21iaW5hdG9yc1wiIChGIyBmb3IgRnVuIGFuZCBQcm9maXQpXG5cbmltcG9ydCB7XG4gICAgaGVhZCxcbiAgICB0YWlsLFxuICAgIGlzU3VjY2VzcyxcbiAgICBpc0ZhaWx1cmUsXG59IGZyb20gJ3V0aWwnO1xuaW1wb3J0IHtcbiAgICBwYWlyLFxuICAgIHN1Y2Nlc3MsXG4gICAgZmFpbHVyZSxcbiAgICBzb21lLFxuICAgIG5vbmUsXG4gICAgUGFpcixcbn0gZnJvbSAnY2xhc3Nlcyc7XG5pbXBvcnQge01heWJlfSBmcm9tICdtYXliZSc7IC8vIEp1c3Qgb3IgTm90aGluZ1xuaW1wb3J0IHtWYWxpZGF0aW9ufSBmcm9tICd2YWxpZGF0aW9uJzsgLy8gU3VjY2VzcyBvciBGYWlsdXJlXG5cbmNvbnN0IGNoYXJQYXJzZXIgPSBjaGFyID0+IHN0ciA9PiB7XG4gICAgaWYgKCcnID09PSBzdHIpIHRocm93IG5ldyBFcnJvcigncmVhY2hlZCBlbmQgb2YgY2hhciBzdHJlYW0nKTtcbiAgICBpZiAoaGVhZChzdHIpID09PSBjaGFyKSByZXR1cm4gVmFsaWRhdGlvbi5TdWNjZXNzKFBhaXIoY2hhciwgdGFpbChzdHIpKSk7XG4gICAgY29uc3QgYSA9IFBhaXIoJ2NoYXJQYXJzZXInLCAnd2FudGVkICcgKyBjaGFyICsgJzsgZ290ICcgKyBoZWFkKHN0cikpO1xuICAgIHJldHVybiBWYWxpZGF0aW9uLkZhaWx1cmUoYSk7XG59O1xuXG5jb25zdCBkaWdpdFBhcnNlciA9IGRpZ2l0ID0+IHN0ciA9PiB7XG4gICAgaWYgKCcnID09PSBzdHIpIHRocm93IG5ldyBFcnJvcigncmVhY2hlZCBlbmQgb2YgY2hhciBzdHJlYW0nKTtcbiAgICBpZiAocGFyc2VJbnQoaGVhZChzdHIpLCAxMCkgPT09IGRpZ2l0KSByZXR1cm4gVmFsaWRhdGlvbi5TdWNjZXNzKFBhaXIoZGlnaXQsIHRhaWwoc3RyKSkpO1xuICAgIHJldHVybiBWYWxpZGF0aW9uLkZhaWx1cmUoUGFpcignZGlnaXRQYXJzZXInLCAnd2FudGVkICcgKyBkaWdpdCArICc7IGdvdCAnICsgaGVhZChzdHIpKSk7XG59O1xuXG5leHBvcnQge2NoYXJQYXJzZXIsIGRpZ2l0UGFyc2VyfTtcblxuZXhwb3J0IGZ1bmN0aW9uIHBjaGFyKGNoYXIpIHtcbiAgICBjb25zdCBsYWJlbCA9ICdwY2hhcl8nICsgY2hhcjtcbiAgICBsZXQgcmVzdWx0ID0gZnVuY3Rpb24gKHN0cikge1xuICAgICAgICByZXR1cm4gY2hhclBhcnNlcihjaGFyKShzdHIpO1xuICAgIH07XG4gICAgcmV0dXJuIHBhcnNlcihyZXN1bHQsIGxhYmVsKS5zZXRMYWJlbChsYWJlbCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwZGlnaXQoZGlnaXQpIHtcbiAgICByZXR1cm4gcGFyc2VyKHN0ciA9PiBkaWdpdFBhcnNlcihkaWdpdCkoc3RyKSwgJ3BkaWdpdF8nICsgZGlnaXQpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYW5kVGhlblgocDEsIHAyKSB7XG4gICAgY29uc3QgbGFiZWwgPSBwMS5sYWJlbCArICcgYW5kVGhlbiAnICsgcDIubGFiZWw7XG4gICAgcmV0dXJuIHBhcnNlcihmdW5jdGlvbiAoc3RyKSB7XG4gICAgICAgIGxldCByZXMxID0gcDEucnVuKHN0cik7XG4gICAgICAgIGlmIChyZXMxLmlzU3VjY2Vzcykge1xuICAgICAgICAgICAgbGV0IHJlczIgPSBwMi5ydW4ocmVzMVsxXSk7XG4gICAgICAgICAgICBpZiAocmVzMi5pc1N1Y2Nlc3MpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gVmFsaWRhdGlvbi5TdWNjZXNzKFBhaXIoUGFpcihyZXMxWzBdLCByZXMyWzBdKSwgcmVzMlsxXSkpO1xuICAgICAgICAgICAgfSBlbHNlIHJldHVybiBWYWxpZGF0aW9uLkZhaWx1cmUoUGFpcihsYWJlbCwgcmVzMlsxXSkpO1xuICAgICAgICB9IGVsc2UgcmV0dXJuIFZhbGlkYXRpb24uRmFpbHVyZShQYWlyKGxhYmVsLCByZXMxWzFdKSk7XG4gICAgfSwgbGFiZWwpO1xufVxuXG4vLyB1c2luZyBiaW5kXG5leHBvcnQgZnVuY3Rpb24gYW5kVGhlbihwMSwgcDIpIHtcbiAgICByZXR1cm4gcDEuYmluZChwYXJzZWRWYWx1ZTEgPT4ge1xuICAgICAgICByZXR1cm4gcDIuYmluZChwYXJzZWRWYWx1ZTIgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHJldHVyblAoUGFpcihwYXJzZWRWYWx1ZTEsIHBhcnNlZFZhbHVlMikpO1xuICAgICAgICB9KTtcbiAgICB9KS5zZXRMYWJlbChwMS5sYWJlbCArICcgYW5kVGhlbiAnICsgcDIubGFiZWwpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gb3JFbHNlKHAxLCBwMikge1xuICAgIGNvbnN0IGxhYmVsID0gcDEubGFiZWwgKyAnIG9yRWxzZSAnICsgcDIubGFiZWw7XG4gICAgcmV0dXJuIHBhcnNlcihzdHIgPT4ge1xuICAgICAgICBjb25zdCByZXMxID0gcDEucnVuKHN0cik7XG4gICAgICAgIGlmIChyZXMxLmlzU3VjY2VzcykgcmV0dXJuIHJlczE7XG4gICAgICAgIGNvbnN0IHJlczIgPSBwMi5ydW4oc3RyKTtcbiAgICAgICAgaWYgKHJlczIuaXNTdWNjZXNzKSByZXR1cm4gcmVzMjtcbiAgICAgICAgcmV0dXJuIFZhbGlkYXRpb24uRmFpbHVyZShQYWlyKGxhYmVsLCByZXMyWzFdKSk7XG4gICAgfSwgbGFiZWwpLnNldExhYmVsKGxhYmVsKTtcbn1cblxubGV0IF9mYWlsID0gcGFyc2VyKHN0ciA9PiBWYWxpZGF0aW9uLkZhaWx1cmUoUGFpcihQYWlyKCdwYXJzaW5nIGZhaWxlZCcsICdfZmFpbCcpLCAnX2ZhaWwnKSkpO1xuXG4vLyByZXR1cm4gbmV1dHJhbCBlbGVtZW50IGluc3RlYWQgb2YgbWVzc2FnZVxubGV0IF9zdWNjZWVkID0gcGFyc2VyKHN0ciA9PiBWYWxpZGF0aW9uLlN1Y2Nlc3MoUGFpcihQYWlyKCdwYXJzaW5nIHN1Y2NlZWRlZCcsIHN0ciksICdfc3VjY2VlZCcpKSk7XG5cbmV4cG9ydCBmdW5jdGlvbiBjaG9pY2UocGFyc2Vycykge1xuICAgIHJldHVybiBwYXJzZXJzLnJlZHVjZVJpZ2h0KChyZXN0LCBjdXJyKSA9PiBvckVsc2UoY3VyciwgcmVzdCksIF9mYWlsKVxuICAgICAgICAuc2V0TGFiZWwoJ2Nob2ljZSAnICsgcGFyc2Vycy5yZWR1Y2UoKGFjYywgY3VycikgPT4gYWNjICsgJy8nICsgY3Vyci5sYWJlbCwgJycpKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGFueU9mKGNoYXJzKSB7XG4gICAgcmV0dXJuIGNob2ljZShjaGFycy5tYXAocGNoYXIpKVxuICAgICAgICAuc2V0TGFiZWwoJ2FueU9mICcgKyBjaGFycy5yZWR1Y2UoKGFjYywgY3VycikgPT4gYWNjICsgY3VyciwgJycpKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGZtYXAoZmFiLCBwYXJzZXIxKSB7XG4gICAgY29uc3QgbGFiZWwgPSBwYXJzZXIxLmxhYmVsICsgJyBmbWFwICcgKyBmYWIudG9TdHJpbmcoKTtcbiAgICByZXR1cm4gcGFyc2VyKHN0ciA9PiB7XG4gICAgICAgIGxldCByZXMgPSBwYXJzZXIxLnJ1bihzdHIpO1xuICAgICAgICBpZiAoVmFsaWRhdGlvbi5pc1N1Y2Nlc3MocmVzKSkgcmV0dXJuIFZhbGlkYXRpb24uU3VjY2VzcyhQYWlyKGZhYihyZXNbMF0pLCByZXNbMV0pKTtcbiAgICAgICAgcmV0dXJuIFZhbGlkYXRpb24uRmFpbHVyZShQYWlyKGxhYmVsLCByZXNbMV0pKTtcbiAgICB9LCBsYWJlbCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZXR1cm5QKHZhbHVlKSB7XG4gICAgcmV0dXJuIHBhcnNlcihzdHIgPT4gVmFsaWRhdGlvbi5TdWNjZXNzKFBhaXIoUGFpcih2YWx1ZSwgc3RyKSwgdmFsdWUpKSk7XG59XG5cbi8vIHBhcnNlcihhIC0+IGIpIC0+IHBhcnNlcihhKSAtPiBwYXJzZXIoYilcbmV4cG9ydCBmdW5jdGlvbiBhcHBseVB4KGZQKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uICh4UCkge1xuICAgICAgICByZXR1cm4gYW5kVGhlbihmUCwgeFApLmZtYXAoKFtmLCB4XSkgPT4gZih4KSk7XG4gICAgfTtcbn1cblxuLy8gdXNpbmcgYmluZFxuZXhwb3J0IGZ1bmN0aW9uIGFwcGx5UChmUCkge1xuICAgIHJldHVybiBmdW5jdGlvbiAoeFApIHtcbiAgICAgICAgcmV0dXJuIGZQLmJpbmQocGFyc2VkVmFsdWVmID0+IHtcbiAgICAgICAgICAgIHJldHVybiB4UC5iaW5kKHBhcnNlZFZhbHVleCA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJldHVyblAocGFyc2VkVmFsdWVmKHBhcnNlZFZhbHVleCkpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBsaWZ0MihmYWFiKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uIChwYXJzZXIxKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAocGFyc2VyMikge1xuICAgICAgICAgICAgLy9yZXR1cm4gYXBwbHlQKGFwcGx5UChyZXR1cm5QKGZhYWIpKShwYXJzZXIxKSkocGFyc2VyMik7XG4gICAgICAgICAgICByZXR1cm4gcmV0dXJuUChmYWFiKS5hcHBseShwYXJzZXIxKS5hcHBseShwYXJzZXIyKTsgLy8gdXNpbmcgaW5zdGFuY2UgbWV0aG9kc1xuICAgICAgICB9O1xuICAgIH07XG59XG5cbi8vIHVzaW5nIGxpZnQyKGNvbnMpXG5leHBvcnQgZnVuY3Rpb24gc2VxdWVuY2VQKHBhcnNlcnMpIHtcbiAgICByZXR1cm4gcGFyc2Vyc1xuICAgICAgICAucmVkdWNlUmlnaHQoKHJlc3QsIGN1cnIpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBsaWZ0MihfY29ucykoY3VycikocmVzdCk7XG4gICAgICAgIH0sIHJldHVyblAoW10pKTtcbn1cblxuLy8gdXNpbmcgbmFpdmUgYW5kVGhlbiAmJiBmbWFwIC0tPiByZXR1cm5zIHN0cmluZ3MsIG5vdCBhcnJheXMhXG5leHBvcnQgZnVuY3Rpb24gc2VxdWVuY2VQMihwYXJzZXJzKSB7XG4gICAgcmV0dXJuIHBhcnNlcnNcbiAgICAgICAgLnJlZHVjZVJpZ2h0KChyZXN0LCBjdXJyKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gZm1hcCgoW3gsIHldKSA9PiB4ICsgeSwgYW5kVGhlbihjdXJyLCByZXN0KSk7XG4gICAgICAgIH0sIHJldHVyblAoJycpKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHBzdHJpbmcoc3RyKSB7XG4gICAgcmV0dXJuIHNlcXVlbmNlUChzdHIuc3BsaXQoJycpLm1hcChwY2hhcikpXG4gICAgICAgIC5zZXRMYWJlbCgncHN0cmluZyAnICsgc3RyKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHplcm9Pck1vcmUoeFApIHsgLy8gemVyb09yTW9yZSA6OiBwIGEgLT4gW2FdIC0+IHRyeSBbYV0gPSBwIGEgLT4gcCBbYV1cbiAgICByZXR1cm4gc3RyID0+IHtcbiAgICAgICAgbGV0IHJlczEgPSB4UC5ydW4oc3RyKTtcbiAgICAgICAgaWYgKHJlczEuaXNGYWlsdXJlKSByZXR1cm4gVmFsaWRhdGlvbi5TdWNjZXNzKFBhaXIoW10sIHN0cikpO1xuICAgICAgICBsZXQgcmVzTiA9IHplcm9Pck1vcmUoeFApKHJlczFbMV0pO1xuICAgICAgICByZXR1cm4gVmFsaWRhdGlvbi5TdWNjZXNzKFBhaXIoW3JlczFbMF1dLmNvbmNhdChyZXNOWzBdKSwgcmVzTlsxXSkpO1xuICAgIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtYW55KHhQKSB7XG4gICAgY29uc3QgbGFiZWwgPSAnbWFueSAnICsgeFAubGFiZWw7XG4gICAgcmV0dXJuIHBhcnNlcihzdHIgPT4ge1xuICAgICAgICByZXR1cm4gemVyb09yTW9yZSh4UCkoc3RyKTtcbiAgICB9LCBsYWJlbCkuc2V0TGFiZWwobGFiZWwpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbWFueTEoeFApIHtcbiAgICBjb25zdCBsYWJlbCA9ICdtYW55MSAnICsgeFAubGFiZWw7XG4gICAgcmV0dXJuIHBhcnNlcihzdHIgPT4ge1xuICAgICAgICBsZXQgcmVzMSA9IHhQLnJ1bihzdHIpO1xuICAgICAgICBpZiAocmVzMS5pc0ZhaWx1cmUpIHJldHVybiByZXMxO1xuICAgICAgICBsZXQgcmVzTiA9IHplcm9Pck1vcmUoeFApKHJlczFbMV0pO1xuICAgICAgICByZXR1cm4gVmFsaWRhdGlvbi5TdWNjZXNzKFBhaXIoW3JlczFbMF1dLmNvbmNhdChyZXNOWzBdKSwgcmVzTlsxXSkpO1xuICAgIH0sIGxhYmVsKS5zZXRMYWJlbChsYWJlbCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBvcHQoeFApIHtcbiAgICBjb25zdCBsYWJlbCA9ICdvcHQgJyArIHhQLmxhYmVsO1xuICAgIHJldHVybiBwYXJzZXIoc3RyID0+IHtcbiAgICAgICAgbGV0IHJlcyA9IHhQLmZtYXAoeCA9PiBNYXliZS5KdXN0KHgpKS5ydW4oc3RyKTtcbiAgICAgICAgaWYgKHJlcy5pc1N1Y2Nlc3MpIHJldHVybiByZXM7XG4gICAgICAgIHJldHVybiBWYWxpZGF0aW9uLlN1Y2Nlc3MoUGFpcihNYXliZS5Ob3RoaW5nKCksIHN0cikpO1xuICAgIH0sIGxhYmVsKS5zZXRMYWJlbChsYWJlbCk7XG59XG5cbi8vIG9wdCBmcm9tIHRoZSBib29rXG5leHBvcnQgZnVuY3Rpb24gb3B0Qm9vayhwWCkge1xuICAgIGNvbnN0IHNvbWVQID0gcFguZm1hcChNYXliZS5KdXN0KTtcbiAgICBjb25zdCBub25lUCA9IHJldHVyblAoTWF5YmUuTm90aGluZyk7XG4gICAgcmV0dXJuIHNvbWVQLm9yRWxzZShub25lUCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBkaXNjYXJkU2Vjb25kKHAxLCBwMikge1xuICAgIGNvbnN0IGxhYmVsID0gcDEubGFiZWwgKyAnIGRpc2NhcmRTZWNvbmQgJyArIHAyLmxhYmVsO1xuICAgIHJldHVybiBwYXJzZXIoc3RyID0+IHtcbiAgICAgICAgcmV0dXJuIGFuZFRoZW4ocDEsIHAyKS5mbWFwKChbcjEsIHIyXSkgPT4gcjEpLnJ1bihzdHIpO1xuICAgIH0sIGxhYmVsKS5zZXRMYWJlbChsYWJlbCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBkaXNjYXJkRmlyc3QocDEsIHAyKSB7XG4gICAgY29uc3QgbGFiZWwgPSBwMS5sYWJlbCArICcgZGlzY2FyZEZpcnN0ICcgKyBwMi5sYWJlbDtcbiAgICByZXR1cm4gcGFyc2VyKHN0ciA9PiB7XG4gICAgICAgIHJldHVybiBhbmRUaGVuKHAxLCBwMikuZm1hcCgoW3IxLCByMl0pID0+IHIyKS5ydW4oc3RyKTtcbiAgICB9LCBsYWJlbCkuc2V0TGFiZWwobGFiZWwpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYmV0d2VlbihwMSwgcDIsIHAzKSB7XG4gICAgcmV0dXJuIHAxLmRpc2NhcmRGaXJzdChwMikuZGlzY2FyZFNlY29uZChwMylcbiAgICAgICAgLnNldExhYmVsKCdiZXR3ZWVuICcgKyBwMS5sYWJlbCArICcvJyArIHAyLmxhYmVsICsgJy8nICsgcDMubGFiZWwpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYmV0d2VlblBhcmVucyhweCkge1xuICAgIHJldHVybiBiZXR3ZWVuKHBjaGFyKCcoJyksIHB4LCBwY2hhcignKScpKVxuICAgICAgICAuc2V0TGFiZWwoJ2JldHdlZW5QYXJlbnMgJyArIHB4LmxhYmVsKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGJpbmRQKGZhbWIsIHB4KSB7XG4gICAgbGV0IGxhYmVsID0gJ3Vua25vd24nO1xuICAgIHJldHVybiBwYXJzZXIoc3RyID0+IHtcbiAgICAgICAgY29uc3QgcmVzID0gcHgucnVuKHN0cik7XG4gICAgICAgIGlmIChyZXMuaXNGYWlsdXJlKSByZXR1cm4gcmVzO1xuICAgICAgICByZXR1cm4gZmFtYihyZXNbMF0pLnJ1bihyZXNbMV0pO1xuICAgIH0sIGxhYmVsKS5zZXRMYWJlbChsYWJlbCk7XG59XG5cbmZ1bmN0aW9uIF9jb25zKHgpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKHhzKSB7XG4gICAgICAgIHJldHVybiBbeF0uY29uY2F0KHhzKTtcbiAgICB9O1xufVxuXG5mdW5jdGlvbiBfc2V0TGFiZWwocHgsIG5ld0xhYmVsKSB7XG4gICAgcmV0dXJuIHBhcnNlcihzdHIgPT4ge1xuICAgICAgICBsZXQgcmVzdWx0ID0gcHgucnVuKHN0cik7XG4gICAgICAgIGlmIChyZXN1bHQuaXNGYWlsdXJlKSByZXR1cm4gVmFsaWRhdGlvbi5GYWlsdXJlKFBhaXIobmV3TGFiZWwsIHJlc3VsdC52YWx1ZVsxXSkpO1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sIG5ld0xhYmVsKTtcbn1cblxuLy8gdGhlIHJlYWwgdGhpbmcuLi5cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZXIoZm4sIGxhYmVsKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgdHlwZTogJ3BhcnNlcicsXG4gICAgICAgIGxhYmVsOiBsYWJlbCxcbiAgICAgICAgcnVuKHN0cikge1xuICAgICAgICAgICAgcmV0dXJuIGZuKHN0cik7XG4gICAgICAgIH0sXG4gICAgICAgIGFwcGx5KHB4KSB7XG4gICAgICAgICAgICByZXR1cm4gYXBwbHlQKHRoaXMpKHB4KTtcbiAgICAgICAgICAgIC8vcmV0dXJuIHRoaXMuYmluZChhbmRUaGVuKHRoaXMsIHB4KS5mbWFwKChbZiwgeF0pID0+IGYoeCkpKS5ydW47IC8vIHdlIGFyZSB0aGUgZlBcbiAgICAgICAgfSxcbiAgICAgICAgZm1hcChmYWIpIHtcbiAgICAgICAgICAgIC8vcmV0dXJuIGZtYXAoZmFiLCB0aGlzKTtcbiAgICAgICAgICAgIC8vcmV0dXJuIGJpbmRQKHN0ciA9PiByZXR1cm5QKGZhYihzdHIpKSwgdGhpcyk7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5iaW5kKHBhcnNlZFZhbHVlID0+IHJldHVyblAoZmFiKHBhcnNlZFZhbHVlKSkpO1xuICAgICAgICB9LFxuICAgICAgICBhbmRUaGVuKHB4KSB7XG4gICAgICAgICAgICByZXR1cm4gYW5kVGhlbih0aGlzLCBweCk7XG4gICAgICAgIH0sXG4gICAgICAgIG9yRWxzZShweCkge1xuICAgICAgICAgICAgcmV0dXJuIG9yRWxzZSh0aGlzLCBweCk7XG4gICAgICAgIH0sXG4gICAgICAgIGRpc2NhcmRGaXJzdChweCkge1xuICAgICAgICAgICAgcmV0dXJuIGRpc2NhcmRGaXJzdCh0aGlzLCBweCk7XG4gICAgICAgIH0sXG4gICAgICAgIGRpc2NhcmRTZWNvbmQocHgpIHtcbiAgICAgICAgICAgIHJldHVybiBkaXNjYXJkU2Vjb25kKHRoaXMsIHB4KTtcbiAgICAgICAgfSxcbiAgICAgICAgYmluZChmYW1iKSB7XG4gICAgICAgICAgICByZXR1cm4gYmluZFAoZmFtYiwgdGhpcyk7XG4gICAgICAgIH0sXG4gICAgICAgIHNldExhYmVsKG5ld0xhYmVsKSB7XG4gICAgICAgICAgICByZXR1cm4gX3NldExhYmVsKHRoaXMsIG5ld0xhYmVsKTtcbiAgICAgICAgfVxuICAgIH07XG59XG4iXX0=