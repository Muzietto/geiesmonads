define(['exports', 'classes', 'maybe', 'validation'], function (exports, _classes, _maybe, _validation) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.discardFirst = exports.discardSecond = exports.orElse = exports.andThen = exports.predicateBasedParser = exports.digitParser = exports.charParser = undefined;
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

    var predicateBasedParser = function predicateBasedParser(pred, label) {
        return function (pos) {
            if (typeof pos === 'string') pos = _classes.Position.fromText(pos);
            var optChar = pos.char();
            if (optChar.isNothing) return _validation.Validation.Failure(_classes.Tuple.Triple(label, 'no more input', pos));
            if (pred(optChar.value)) return _validation.Validation.Success(_classes.Tuple.Pair(optChar.value, pos.incrPos()));
            return _validation.Validation.Failure(_classes.Tuple.Triple(label, 'unexpected char: ' + optChar.value, pos));
        };
    };

    exports.charParser = charParser;
    exports.digitParser = digitParser;
    exports.predicateBasedParser = predicateBasedParser;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2pzL3BhcnNlcnMuanMiXSwibmFtZXMiOlsicGNoYXIiLCJwZGlnaXQiLCJhbmRUaGVuWCIsImNob2ljZSIsImFueU9mIiwiZm1hcCIsInJldHVyblAiLCJhcHBseVB4IiwiYXBwbHlQIiwibGlmdDIiLCJzZXF1ZW5jZVAiLCJzZXF1ZW5jZVAyIiwicHN0cmluZyIsInplcm9Pck1vcmUiLCJtYW55IiwibWFueTEiLCJvcHQiLCJvcHRCb29rIiwiYmV0d2VlbiIsImJldHdlZW5QYXJlbnMiLCJiaW5kUCIsInBhcnNlciIsImNoYXJQYXJzZXIiLCJwb3MiLCJmcm9tVGV4dCIsIm9wdENoYXIiLCJjaGFyIiwiaXNOb3RoaW5nIiwiRmFpbHVyZSIsIlRyaXBsZSIsInZhbHVlIiwiU3VjY2VzcyIsIlBhaXIiLCJpbmNyUG9zIiwiZGlnaXRQYXJzZXIiLCJwYXJzZUludCIsImRpZ2l0IiwicHJlZGljYXRlQmFzZWRQYXJzZXIiLCJwcmVkIiwibGFiZWwiLCJyZXN1bHQiLCJzZXRMYWJlbCIsInAxIiwicDIiLCJyZXMxIiwicnVuIiwiaXNTdWNjZXNzIiwicmVzMiIsImFuZFRoZW4iLCJiaW5kIiwicGFyc2VkVmFsdWUxIiwicGFyc2VkVmFsdWUyIiwib3JFbHNlIiwiX2ZhaWwiLCJfc3VjY2VlZCIsInBhcnNlcnMiLCJyZWR1Y2VSaWdodCIsInJlc3QiLCJjdXJyIiwicmVkdWNlIiwiYWNjIiwiY2hhcnMiLCJtYXAiLCJmYWIiLCJwYXJzZXIxIiwidG9TdHJpbmciLCJyZXMiLCJzdHIiLCJmUCIsInhQIiwiZiIsIngiLCJwYXJzZWRWYWx1ZWYiLCJwYXJzZWRWYWx1ZXgiLCJmYWFiIiwicGFyc2VyMiIsImFwcGx5IiwiX2NvbnMiLCJ5Iiwic3BsaXQiLCJpc0ZhaWx1cmUiLCJyZXNOIiwiY29uY2F0IiwiSnVzdCIsIk5vdGhpbmciLCJwWCIsInNvbWVQIiwibm9uZVAiLCJkaXNjYXJkU2Vjb25kIiwiZGlzY2FyZEZpcnN0IiwicDMiLCJweCIsImZhbWIiLCJ4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QVU7QUFBQSwyQkFBZTNDLFFBQVF5RCxJQUFJbUMsV0FBSixDQUFSLENBQWY7QUFBQSxpQkFBVixDQUFQO0FBQ0gsYUFkRTtBQWVIbEQsbUJBZkcsbUJBZUsyQyxFQWZMLEVBZVM7QUFDUix1QkFBTzNDLFNBQVEsSUFBUixFQUFjMkMsRUFBZCxDQUFQO0FBQ0gsYUFqQkU7QUFrQkh2QyxrQkFsQkcsa0JBa0JJdUMsRUFsQkosRUFrQlE7QUFDUCx1QkFBT3ZDLFFBQU8sSUFBUCxFQUFhdUMsRUFBYixDQUFQO0FBQ0gsYUFwQkU7QUFxQkhGLHdCQXJCRyx3QkFxQlVFLEVBckJWLEVBcUJjO0FBQ2IsdUJBQU9GLGNBQWEsSUFBYixFQUFtQkUsRUFBbkIsQ0FBUDtBQUNILGFBdkJFO0FBd0JISCx5QkF4QkcseUJBd0JXRyxFQXhCWCxFQXdCZTtBQUNkLHVCQUFPSCxlQUFjLElBQWQsRUFBb0JHLEVBQXBCLENBQVA7QUFDSCxhQTFCRTtBQTJCSDFDLGdCQTNCRyxnQkEyQkUyQyxJQTNCRixFQTJCUTtBQUNQLHVCQUFPeEUsTUFBTXdFLElBQU4sRUFBWSxJQUFaLENBQVA7QUFDSCxhQTdCRTtBQThCSG5ELG9CQTlCRyxvQkE4Qk1zRCxRQTlCTixFQThCZ0I7QUFDZix1QkFBT0QsVUFBVSxJQUFWLEVBQWdCQyxRQUFoQixDQUFQO0FBQ0g7QUFoQ0UsU0FBUDtBQWtDSCIsImZpbGUiOiJwYXJzZXJzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8gY2ZyLiBcIlVuZGVyc3RhbmRpbmcgUGFyc2VyIENvbWJpbmF0b3JzXCIgKEYjIGZvciBGdW4gYW5kIFByb2ZpdClcblxuaW1wb3J0IHtcbiAgICBUdXBsZSxcbiAgICBQb3NpdGlvbixcbn0gZnJvbSAnY2xhc3Nlcyc7XG5pbXBvcnQge01heWJlfSBmcm9tICdtYXliZSc7IC8vIEp1c3Qgb3IgTm90aGluZ1xuaW1wb3J0IHtWYWxpZGF0aW9ufSBmcm9tICd2YWxpZGF0aW9uJzsgLy8gU3VjY2VzcyBvciBGYWlsdXJlXG5cbmNvbnN0IGNoYXJQYXJzZXIgPSBjaGFyID0+IHBvcyA9PiB7XG4gICAgaWYgKHR5cGVvZiBwb3MgPT09ICdzdHJpbmcnKSBwb3MgPSBQb3NpdGlvbi5mcm9tVGV4dChwb3MpO1xuICAgIGNvbnN0IG9wdENoYXIgPSBwb3MuY2hhcigpO1xuICAgIGlmIChvcHRDaGFyLmlzTm90aGluZykgcmV0dXJuIFZhbGlkYXRpb24uRmFpbHVyZShUdXBsZS5UcmlwbGUoJ2NoYXJQYXJzZXInLCAnbm8gbW9yZSBpbnB1dCcsIHBvcykpO1xuICAgIGlmIChvcHRDaGFyLnZhbHVlID09PSBjaGFyKSByZXR1cm4gVmFsaWRhdGlvbi5TdWNjZXNzKFR1cGxlLlBhaXIoY2hhciwgcG9zLmluY3JQb3MoKSkpO1xuICAgIHJldHVybiBWYWxpZGF0aW9uLkZhaWx1cmUoVHVwbGUuVHJpcGxlKCdjaGFyUGFyc2VyJywgJ3dhbnRlZCAnICsgY2hhciArICc7IGdvdCAnICsgb3B0Q2hhci52YWx1ZSwgcG9zKSk7XG59O1xuXG5jb25zdCBkaWdpdFBhcnNlciA9IGRpZ2l0ID0+IHBvcyA9PiB7XG4gICAgaWYgKHR5cGVvZiBwb3MgPT09ICdzdHJpbmcnKSBwb3MgPSBQb3NpdGlvbi5mcm9tVGV4dChwb3MpO1xuICAgIGNvbnN0IG9wdENoYXIgPSBwb3MuY2hhcigpO1xuICAgIGlmIChvcHRDaGFyLmlzTm90aGluZykgcmV0dXJuIFZhbGlkYXRpb24uRmFpbHVyZShUdXBsZS5UcmlwbGUoJ2RpZ2l0UGFyc2VyJywgJ25vIG1vcmUgaW5wdXQnLCBwb3MpKTtcbiAgICBpZiAocGFyc2VJbnQob3B0Q2hhci52YWx1ZSwgMTApID09PSBkaWdpdCkgcmV0dXJuIFZhbGlkYXRpb24uU3VjY2VzcyhUdXBsZS5QYWlyKGRpZ2l0LCBwb3MuaW5jclBvcygpKSk7XG4gICAgcmV0dXJuIFZhbGlkYXRpb24uRmFpbHVyZShUdXBsZS5UcmlwbGUoJ2RpZ2l0UGFyc2VyJywgJ3dhbnRlZCAnICsgZGlnaXQgKyAnOyBnb3QgJyArIG9wdENoYXIudmFsdWUsIHBvcykpO1xufTtcblxuY29uc3QgcHJlZGljYXRlQmFzZWRQYXJzZXIgPSAocHJlZCwgbGFiZWwpID0+IHBvcyA9PiB7XG4gICAgaWYgKHR5cGVvZiBwb3MgPT09ICdzdHJpbmcnKSBwb3MgPSBQb3NpdGlvbi5mcm9tVGV4dChwb3MpO1xuICAgIGNvbnN0IG9wdENoYXIgPSBwb3MuY2hhcigpO1xuICAgIGlmIChvcHRDaGFyLmlzTm90aGluZykgcmV0dXJuIFZhbGlkYXRpb24uRmFpbHVyZShUdXBsZS5UcmlwbGUobGFiZWwsICdubyBtb3JlIGlucHV0JywgcG9zKSk7XG4gICAgaWYgKHByZWQob3B0Q2hhci52YWx1ZSkpIHJldHVybiBWYWxpZGF0aW9uLlN1Y2Nlc3MoVHVwbGUuUGFpcihvcHRDaGFyLnZhbHVlLCBwb3MuaW5jclBvcygpKSk7XG4gICAgcmV0dXJuIFZhbGlkYXRpb24uRmFpbHVyZShUdXBsZS5UcmlwbGUobGFiZWwsICd1bmV4cGVjdGVkIGNoYXI6ICcgKyBvcHRDaGFyLnZhbHVlLCBwb3MpKTtcbn07XG5cbmV4cG9ydCB7Y2hhclBhcnNlciwgZGlnaXRQYXJzZXIsIHByZWRpY2F0ZUJhc2VkUGFyc2VyfTtcblxuZXhwb3J0IGZ1bmN0aW9uIHBjaGFyKGNoYXIpIHtcbiAgICBjb25zdCBsYWJlbCA9ICdwY2hhcl8nICsgY2hhcjtcbiAgICBsZXQgcmVzdWx0ID0gZnVuY3Rpb24gKHBvcykge1xuICAgICAgICByZXR1cm4gY2hhclBhcnNlcihjaGFyKShwb3MpO1xuICAgIH07XG4gICAgcmV0dXJuIHBhcnNlcihyZXN1bHQsIGxhYmVsKS5zZXRMYWJlbChsYWJlbCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwZGlnaXQoZGlnaXQpIHtcbiAgICByZXR1cm4gcGFyc2VyKHBvcyA9PiBkaWdpdFBhcnNlcihkaWdpdCkocG9zKSwgJ3BkaWdpdF8nICsgZGlnaXQpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYW5kVGhlblgocDEsIHAyKSB7XG4gICAgY29uc3QgbGFiZWwgPSBwMS5sYWJlbCArICcgYW5kVGhlbiAnICsgcDIubGFiZWw7XG4gICAgcmV0dXJuIHBhcnNlcihmdW5jdGlvbiAocG9zKSB7XG4gICAgICAgIGxldCByZXMxID0gcDEucnVuKHBvcyk7XG4gICAgICAgIGlmIChyZXMxLmlzU3VjY2Vzcykge1xuICAgICAgICAgICAgbGV0IHJlczIgPSBwMi5ydW4ocmVzMS52YWx1ZVsxXSk7XG4gICAgICAgICAgICBpZiAocmVzMi5pc1N1Y2Nlc3MpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gVmFsaWRhdGlvbi5TdWNjZXNzKFR1cGxlLlBhaXIoVHVwbGUuUGFpcihyZXMxLnZhbHVlWzBdLCByZXMyLnZhbHVlWzBdKSwgcmVzMi52YWx1ZVsxXSkpO1xuICAgICAgICAgICAgfSBlbHNlIHJldHVybiBWYWxpZGF0aW9uLkZhaWx1cmUoVHVwbGUuVHJpcGxlKGxhYmVsLCByZXMyLnZhbHVlWzFdLCByZXMyLnZhbHVlWzJdKSk7XG4gICAgICAgIH0gZWxzZSByZXR1cm4gVmFsaWRhdGlvbi5GYWlsdXJlKFR1cGxlLlRyaXBsZShsYWJlbCwgcmVzMS52YWx1ZVsxXSwgcmVzMS52YWx1ZVsyXSkpO1xuICAgIH0sIGxhYmVsKTtcbn1cblxuLy8gdXNpbmcgYmluZFxuZXhwb3J0IGZ1bmN0aW9uIGFuZFRoZW4ocDEsIHAyKSB7XG4gICAgcmV0dXJuIHAxLmJpbmQocGFyc2VkVmFsdWUxID0+IHtcbiAgICAgICAgcmV0dXJuIHAyLmJpbmQocGFyc2VkVmFsdWUyID0+IHtcbiAgICAgICAgICAgIHJldHVybiByZXR1cm5QKFR1cGxlLlBhaXIocGFyc2VkVmFsdWUxLCBwYXJzZWRWYWx1ZTIpKTtcbiAgICAgICAgfSk7XG4gICAgfSkuc2V0TGFiZWwocDEubGFiZWwgKyAnIGFuZFRoZW4gJyArIHAyLmxhYmVsKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG9yRWxzZShwMSwgcDIpIHtcbiAgICBjb25zdCBsYWJlbCA9IHAxLmxhYmVsICsgJyBvckVsc2UgJyArIHAyLmxhYmVsO1xuICAgIHJldHVybiBwYXJzZXIocG9zID0+IHtcbiAgICAgICAgY29uc3QgcmVzMSA9IHAxLnJ1bihwb3MpO1xuICAgICAgICBpZiAocmVzMS5pc1N1Y2Nlc3MpIHJldHVybiByZXMxO1xuICAgICAgICBjb25zdCByZXMyID0gcDIucnVuKHBvcyk7XG4gICAgICAgIGlmIChyZXMyLmlzU3VjY2VzcykgcmV0dXJuIHJlczI7XG4gICAgICAgIHJldHVybiBWYWxpZGF0aW9uLkZhaWx1cmUoVHVwbGUuVHJpcGxlKGxhYmVsLCByZXMyLnZhbHVlWzFdLCByZXMyLnZhbHVlWzJdKSk7XG4gICAgfSwgbGFiZWwpLnNldExhYmVsKGxhYmVsKTtcbn1cblxubGV0IF9mYWlsID0gcGFyc2VyKHBvcyA9PiBWYWxpZGF0aW9uLkZhaWx1cmUoVHVwbGUuVHJpcGxlKCdwYXJzaW5nIGZhaWxlZCcsICdfZmFpbCcsIHBvcykpKTtcblxuLy8gcmV0dXJuIG5ldXRyYWwgZWxlbWVudCBpbnN0ZWFkIG9mIG1lc3NhZ2VcbmxldCBfc3VjY2VlZCA9IHBhcnNlcihwb3MgPT4gVmFsaWRhdGlvbi5TdWNjZXNzKFR1cGxlLlBhaXIoVHVwbGUuUGFpcigncGFyc2luZyBzdWNjZWVkZWQnLCBwb3MpLCAnX3N1Y2NlZWQnKSkpO1xuXG5leHBvcnQgZnVuY3Rpb24gY2hvaWNlKHBhcnNlcnMpIHtcbiAgICByZXR1cm4gcGFyc2Vycy5yZWR1Y2VSaWdodCgocmVzdCwgY3VycikgPT4gb3JFbHNlKGN1cnIsIHJlc3QpLCBfZmFpbClcbiAgICAgICAgLnNldExhYmVsKCdjaG9pY2UgJyArIHBhcnNlcnMucmVkdWNlKChhY2MsIGN1cnIpID0+IGFjYyArICcvJyArIGN1cnIubGFiZWwsICcnKSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhbnlPZihjaGFycykge1xuICAgIHJldHVybiBjaG9pY2UoY2hhcnMubWFwKHBjaGFyKSlcbiAgICAgICAgLnNldExhYmVsKCdhbnlPZiAnICsgY2hhcnMucmVkdWNlKChhY2MsIGN1cnIpID0+IGFjYyArIGN1cnIsICcnKSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBmbWFwKGZhYiwgcGFyc2VyMSkge1xuICAgIGNvbnN0IGxhYmVsID0gcGFyc2VyMS5sYWJlbCArICcgZm1hcCAnICsgZmFiLnRvU3RyaW5nKCk7XG4gICAgcmV0dXJuIHBhcnNlcihzdHIgPT4ge1xuICAgICAgICBsZXQgcmVzID0gcGFyc2VyMS5ydW4oc3RyKTtcbiAgICAgICAgaWYgKHJlcy5pc1N1Y2Nlc3MpIHJldHVybiBWYWxpZGF0aW9uLlN1Y2Nlc3MoVHVwbGUuUGFpcihmYWIocmVzLnZhbHVlWzBdKSwgcmVzLnZhbHVlWzFdKSk7XG4gICAgICAgIHJldHVybiBWYWxpZGF0aW9uLkZhaWx1cmUoVHVwbGUuVHJpcGxlKGxhYmVsLCByZXMudmFsdWVbMV0sIHJlcy52YWx1ZVsyXSkpO1xuICAgIH0sIGxhYmVsKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJldHVyblAodmFsdWUpIHtcbiAgICByZXR1cm4gcGFyc2VyKHN0ciA9PiBWYWxpZGF0aW9uLlN1Y2Nlc3MoVHVwbGUuUGFpcih2YWx1ZSwgc3RyKSksIHZhbHVlKTtcbn1cblxuLy8gcGFyc2VyKGEgLT4gYikgLT4gcGFyc2VyKGEpIC0+IHBhcnNlcihiKVxuZXhwb3J0IGZ1bmN0aW9uIGFwcGx5UHgoZlApIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKHhQKSB7XG4gICAgICAgIHJldHVybiBhbmRUaGVuKGZQLCB4UCkuZm1hcCgoW2YsIHhdKSA9PiBmKHgpKTtcbiAgICB9O1xufVxuXG4vLyB1c2luZyBiaW5kXG5leHBvcnQgZnVuY3Rpb24gYXBwbHlQKGZQKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uICh4UCkge1xuICAgICAgICByZXR1cm4gZlAuYmluZChwYXJzZWRWYWx1ZWYgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHhQLmJpbmQocGFyc2VkVmFsdWV4ID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmV0dXJuUChwYXJzZWRWYWx1ZWYocGFyc2VkVmFsdWV4KSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGxpZnQyKGZhYWIpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKHBhcnNlcjEpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChwYXJzZXIyKSB7XG4gICAgICAgICAgICAvL3JldHVybiBhcHBseVAoYXBwbHlQKHJldHVyblAoZmFhYikpKHBhcnNlcjEpKShwYXJzZXIyKTtcbiAgICAgICAgICAgIHJldHVybiByZXR1cm5QKGZhYWIpLmFwcGx5KHBhcnNlcjEpLmFwcGx5KHBhcnNlcjIpOyAvLyB1c2luZyBpbnN0YW5jZSBtZXRob2RzXG4gICAgICAgIH07XG4gICAgfTtcbn1cblxuLy8gdXNpbmcgbGlmdDIoY29ucylcbmV4cG9ydCBmdW5jdGlvbiBzZXF1ZW5jZVAocGFyc2Vycykge1xuICAgIHJldHVybiBwYXJzZXJzXG4gICAgICAgIC5yZWR1Y2VSaWdodCgocmVzdCwgY3VycikgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIGxpZnQyKF9jb25zKShjdXJyKShyZXN0KTtcbiAgICAgICAgfSwgcmV0dXJuUChbXSkpO1xufVxuXG4vLyB1c2luZyBuYWl2ZSBhbmRUaGVuICYmIGZtYXAgLS0+IHJldHVybnMgc3RyaW5ncywgbm90IGFycmF5cyFcbmV4cG9ydCBmdW5jdGlvbiBzZXF1ZW5jZVAyKHBhcnNlcnMpIHtcbiAgICByZXR1cm4gcGFyc2Vyc1xuICAgICAgICAucmVkdWNlUmlnaHQoKHJlc3QsIGN1cnIpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBmbWFwKChbeCwgeV0pID0+IHggKyB5LCBhbmRUaGVuKGN1cnIsIHJlc3QpKTtcbiAgICAgICAgfSwgcmV0dXJuUCgnJykpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcHN0cmluZyhzdHIpIHtcbiAgICByZXR1cm4gc2VxdWVuY2VQKHN0ci5zcGxpdCgnJykubWFwKHBjaGFyKSlcbiAgICAgICAgLnNldExhYmVsKCdwc3RyaW5nICcgKyBzdHIpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gemVyb09yTW9yZSh4UCkgeyAvLyB6ZXJvT3JNb3JlIDo6IHAgYSAtPiBbYV0gLT4gdHJ5IFthXSA9IHAgYSAtPiBwIFthXVxuICAgIHJldHVybiBzdHIgPT4ge1xuICAgICAgICBsZXQgcmVzMSA9IHhQLnJ1bihzdHIpO1xuICAgICAgICBpZiAocmVzMS5pc0ZhaWx1cmUpIHJldHVybiBWYWxpZGF0aW9uLlN1Y2Nlc3MoVHVwbGUuUGFpcihbXSwgc3RyKSk7XG4gICAgICAgIGxldCByZXNOID0gemVyb09yTW9yZSh4UCkocmVzMS52YWx1ZVsxXSk7XG4gICAgICAgIHJldHVybiBWYWxpZGF0aW9uLlN1Y2Nlc3MoVHVwbGUuUGFpcihbcmVzMS52YWx1ZVswXV0uY29uY2F0KHJlc04udmFsdWVbMF0pLCByZXNOLnZhbHVlWzFdKSk7XG4gICAgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1hbnkoeFApIHtcbiAgICBjb25zdCBsYWJlbCA9ICdtYW55ICcgKyB4UC5sYWJlbDtcbiAgICByZXR1cm4gcGFyc2VyKHN0ciA9PiB7XG4gICAgICAgIHJldHVybiB6ZXJvT3JNb3JlKHhQKShzdHIpO1xuICAgIH0sIGxhYmVsKS5zZXRMYWJlbChsYWJlbCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtYW55MSh4UCkge1xuICAgIGNvbnN0IGxhYmVsID0gJ21hbnkxICcgKyB4UC5sYWJlbDtcbiAgICByZXR1cm4gcGFyc2VyKHN0ciA9PiB7XG4gICAgICAgIGxldCByZXMxID0geFAucnVuKHN0cik7XG4gICAgICAgIGlmIChyZXMxLmlzRmFpbHVyZSkgcmV0dXJuIHJlczE7XG4gICAgICAgIGxldCByZXNOID0gemVyb09yTW9yZSh4UCkocmVzMS52YWx1ZVsxXSk7XG4gICAgICAgIHJldHVybiBWYWxpZGF0aW9uLlN1Y2Nlc3MoVHVwbGUuUGFpcihbcmVzMS52YWx1ZVswXV0uY29uY2F0KHJlc04udmFsdWVbMF0pLCByZXNOLnZhbHVlWzFdKSk7XG4gICAgfSwgbGFiZWwpLnNldExhYmVsKGxhYmVsKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG9wdCh4UCkge1xuICAgIGNvbnN0IGxhYmVsID0gJ29wdCAnICsgeFAubGFiZWw7XG4gICAgcmV0dXJuIHBhcnNlcihzdHIgPT4ge1xuICAgICAgICBsZXQgcmVzID0geFAuZm1hcCh4ID0+IE1heWJlLkp1c3QoeCkpLnJ1bihzdHIpO1xuICAgICAgICBpZiAocmVzLmlzU3VjY2VzcykgcmV0dXJuIHJlcztcbiAgICAgICAgcmV0dXJuIFZhbGlkYXRpb24uU3VjY2VzcyhUdXBsZS5QYWlyKE1heWJlLk5vdGhpbmcoKSwgc3RyKSk7XG4gICAgfSwgbGFiZWwpLnNldExhYmVsKGxhYmVsKTtcbn1cblxuLy8gb3B0IGZyb20gdGhlIGJvb2sgLSB3b3JrcyBvaywgYnV0IHRvU3RyaW5nKCkgZ2l2ZXMgc3RyYW5nZSByZXN1bHRzXG5leHBvcnQgZnVuY3Rpb24gb3B0Qm9vayhwWCkge1xuICAgIGNvbnN0IHNvbWVQID0gcFguZm1hcChNYXliZS5KdXN0KTtcbiAgICBjb25zdCBub25lUCA9IHJldHVyblAoTWF5YmUuTm90aGluZyk7XG4gICAgcmV0dXJuIHNvbWVQLm9yRWxzZShub25lUCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBkaXNjYXJkU2Vjb25kKHAxLCBwMikge1xuICAgIGNvbnN0IGxhYmVsID0gcDEubGFiZWwgKyAnIGRpc2NhcmRTZWNvbmQgJyArIHAyLmxhYmVsO1xuICAgIHJldHVybiBwYXJzZXIoc3RyID0+IHtcbiAgICAgICAgcmV0dXJuIGFuZFRoZW4ocDEsIHAyKS5mbWFwKChbeCwgeV0pID0+IHgpLnJ1bihzdHIpO1xuICAgIH0sIGxhYmVsKS5zZXRMYWJlbChsYWJlbCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBkaXNjYXJkRmlyc3QocDEsIHAyKSB7XG4gICAgY29uc3QgbGFiZWwgPSBwMS5sYWJlbCArICcgZGlzY2FyZEZpcnN0ICcgKyBwMi5sYWJlbDtcbiAgICByZXR1cm4gcGFyc2VyKHN0ciA9PiB7XG4gICAgICAgIHJldHVybiBhbmRUaGVuKHAxLCBwMikuZm1hcCgoW3gsIHldKSA9PiB5KS5ydW4oc3RyKTtcbiAgICB9LCBsYWJlbCkuc2V0TGFiZWwobGFiZWwpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYmV0d2VlbihwMSwgcDIsIHAzKSB7XG4gICAgcmV0dXJuIHAxLmRpc2NhcmRGaXJzdChwMikuZGlzY2FyZFNlY29uZChwMylcbiAgICAgICAgLnNldExhYmVsKCdiZXR3ZWVuICcgKyBwMS5sYWJlbCArICcvJyArIHAyLmxhYmVsICsgJy8nICsgcDMubGFiZWwpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYmV0d2VlblBhcmVucyhweCkge1xuICAgIHJldHVybiBiZXR3ZWVuKHBjaGFyKCcoJyksIHB4LCBwY2hhcignKScpKVxuICAgICAgICAuc2V0TGFiZWwoJ2JldHdlZW5QYXJlbnMgJyArIHB4LmxhYmVsKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGJpbmRQKGZhbWIsIHB4KSB7XG4gICAgbGV0IGxhYmVsID0gJ3Vua25vd24nO1xuICAgIHJldHVybiBwYXJzZXIoc3RyID0+IHtcbiAgICAgICAgY29uc3QgcmVzID0gcHgucnVuKHN0cik7XG4gICAgICAgIGlmIChyZXMuaXNGYWlsdXJlKSByZXR1cm4gcmVzO1xuICAgICAgICByZXR1cm4gZmFtYihyZXMudmFsdWVbMF0pLnJ1bihyZXMudmFsdWVbMV0pO1xuICAgIH0sIGxhYmVsKS5zZXRMYWJlbChsYWJlbCk7XG59XG5cbmZ1bmN0aW9uIF9jb25zKHgpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKHhzKSB7XG4gICAgICAgIHJldHVybiBbeF0uY29uY2F0KHhzKTtcbiAgICB9O1xufVxuXG5mdW5jdGlvbiBfc2V0TGFiZWwocHgsIG5ld0xhYmVsKSB7XG4gICAgcmV0dXJuIHBhcnNlcihzdHIgPT4ge1xuICAgICAgICBsZXQgcmVzdWx0ID0gcHgucnVuKHN0cik7XG4gICAgICAgIGlmIChyZXN1bHQuaXNGYWlsdXJlKSByZXR1cm4gVmFsaWRhdGlvbi5GYWlsdXJlKFR1cGxlLlRyaXBsZShuZXdMYWJlbCwgcmVzdWx0LnZhbHVlWzFdLCByZXN1bHQudmFsdWVbMl0pKTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LCBuZXdMYWJlbCk7XG59XG5cbi8vIHRoZSByZWFsIHRoaW5nLi4uXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VyKGZuLCBsYWJlbCkge1xuICAgIHJldHVybiB7XG4gICAgICAgIHR5cGU6ICdwYXJzZXInLFxuICAgICAgICBsYWJlbDogbGFiZWwsXG4gICAgICAgIHJ1bihzdHIpIHtcbiAgICAgICAgICAgIHJldHVybiBmbihzdHIpO1xuICAgICAgICB9LFxuICAgICAgICBhcHBseShweCkge1xuICAgICAgICAgICAgcmV0dXJuIGFwcGx5UCh0aGlzKShweCk7XG4gICAgICAgICAgICAvL3JldHVybiB0aGlzLmJpbmQoYW5kVGhlbih0aGlzLCBweCkuZm1hcCgoW2YsIHhdKSA9PiBmKHgpKSkucnVuOyAvLyB3ZSBhcmUgdGhlIGZQXG4gICAgICAgIH0sXG4gICAgICAgIGZtYXAoZmFiKSB7XG4gICAgICAgICAgICAvL3JldHVybiBmbWFwKGZhYiwgdGhpcyk7XG4gICAgICAgICAgICAvL3JldHVybiBiaW5kUChzdHIgPT4gcmV0dXJuUChmYWIoc3RyKSksIHRoaXMpO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuYmluZChwYXJzZWRWYWx1ZSA9PiByZXR1cm5QKGZhYihwYXJzZWRWYWx1ZSkpKTtcbiAgICAgICAgfSxcbiAgICAgICAgYW5kVGhlbihweCkge1xuICAgICAgICAgICAgcmV0dXJuIGFuZFRoZW4odGhpcywgcHgpO1xuICAgICAgICB9LFxuICAgICAgICBvckVsc2UocHgpIHtcbiAgICAgICAgICAgIHJldHVybiBvckVsc2UodGhpcywgcHgpO1xuICAgICAgICB9LFxuICAgICAgICBkaXNjYXJkRmlyc3QocHgpIHtcbiAgICAgICAgICAgIHJldHVybiBkaXNjYXJkRmlyc3QodGhpcywgcHgpO1xuICAgICAgICB9LFxuICAgICAgICBkaXNjYXJkU2Vjb25kKHB4KSB7XG4gICAgICAgICAgICByZXR1cm4gZGlzY2FyZFNlY29uZCh0aGlzLCBweCk7XG4gICAgICAgIH0sXG4gICAgICAgIGJpbmQoZmFtYikge1xuICAgICAgICAgICAgcmV0dXJuIGJpbmRQKGZhbWIsIHRoaXMpO1xuICAgICAgICB9LFxuICAgICAgICBzZXRMYWJlbChuZXdMYWJlbCkge1xuICAgICAgICAgICAgcmV0dXJuIF9zZXRMYWJlbCh0aGlzLCBuZXdMYWJlbCk7XG4gICAgICAgIH1cbiAgICB9O1xufVxuIl19