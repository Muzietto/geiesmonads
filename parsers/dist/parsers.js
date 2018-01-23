define(['exports', 'classes', 'maybe', 'validation'], function (exports, _classes, _maybe, _validation) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.discardFirst = exports.discardSecond = exports.whiteP = exports.digitP = exports.letterP = exports.uppercaseP = exports.lowercaseP = exports.orElse = exports.andThen = exports.predicateBasedParser = exports.digitParser = exports.charParser = undefined;
    exports.pchar = pchar;
    exports.pdigit = pdigit;
    exports.andThenBind = andThenBind;
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
    exports.manyChars = manyChars;
    exports.many1 = many1;
    exports.manyChars1 = manyChars1;
    exports.opt = opt;
    exports.optBook = optBook;
    exports.sepBy1Book = sepBy1Book;
    exports.sepBy1 = sepBy1;
    exports.between = between;
    exports.betweenParens = betweenParens;
    exports.bindP = bindP;
    exports.tapP = tapP;
    exports.logP = logP;
    exports.pword = pword;
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

    function _andThen(p1, p2) {
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
    exports.andThen = _andThen;
    function andThenBind(p1, p2) {
        return p1.bind(function (parsedValue1) {
            return p2.bind(function (parsedValue2) {
                return returnP(_classes.Tuple.Pair(parsedValue1, parsedValue2));
            });
        }).setLabel(p1.label + ' andThen ' + p2.label);
    }

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

    var lowercaseP = exports.lowercaseP = anyOf(['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z']);
    var uppercaseP = exports.uppercaseP = anyOf(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']);
    var letterP = exports.letterP = lowercaseP.orElse(uppercaseP);
    var digitP = exports.digitP = anyOf(['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']);
    var whiteP = exports.whiteP = anyOf([' ', '\t', '\n', '\r']);

    function fmap(fab, parser1) {
        var label = parser1.label + ' fmap ' + fab.toString();
        return parser(function (pos) {
            var res = parser1.run(pos);
            if (res.isSuccess) return _validation.Validation.Success(_classes.Tuple.Pair(fab(res.value[0]), res.value[1]));
            return _validation.Validation.Failure(_classes.Tuple.Triple(label, res.value[1], res.value[2]));
        }, label);
    }

    function returnP(value) {
        return parser(function (pos) {
            return _validation.Validation.Success(_classes.Tuple.Pair(value, pos));
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
        return function (pos) {
            var res1 = xP.run(pos);
            if (res1.isFailure) return _validation.Validation.Success(_classes.Tuple.Pair([], pos));
            var resN = zeroOrMore(xP)(res1.value[1]);
            return _validation.Validation.Success(_classes.Tuple.Pair([res1.value[0]].concat(resN.value[0]), resN.value[1]));
        };
    }

    function many(xP) {
        var label = 'many ' + xP.label;
        return parser(function (pos) {
            return zeroOrMore(xP)(pos);
        }, label).setLabel(label);
    }

    function manyChars(xP) {
        return many(xP).fmap(function (arra) {
            return arra.join('');
        }).setLabel('manyChars ' + xP.label);
    }

    function many1(xP) {
        var label = 'many1 ' + xP.label;
        return parser(function (pos) {
            var res1 = xP.run(pos);
            if (res1.isFailure) return res1;
            var resN = zeroOrMore(xP)(res1.value[1]);
            return _validation.Validation.Success(_classes.Tuple.Pair([res1.value[0]].concat(resN.value[0]), resN.value[1]));
        }, label).setLabel(label);
    }

    function manyChars1(xP) {
        return many1(xP).fmap(function (arra) {
            return arra.join('');
        }).setLabel('manyChars1 ' + xP.label);
    }

    function opt(xP, defaultValue) {
        var isDefault = typeof defaultValue !== 'undefined';
        var label = 'opt ' + xP.label + (isDefault ? '(default=' + defaultValue + ')' : '');
        return parser(function (pos) {
            var res = xP.fmap(_maybe.Maybe.Just).run(pos);
            if (res.isSuccess) return res;
            var outcome = isDefault ? _maybe.Maybe.Just(defaultValue) : _maybe.Maybe.Nothing();
            return _validation.Validation.Success(_classes.Tuple.Pair(outcome, pos));
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
        return parser(function (pos) {
            return _andThen(p1, p2).fmap(function (_ref5) {
                var _ref6 = _slicedToArray(_ref5, 2),
                    x = _ref6[0],
                    y = _ref6[1];

                return x;
            }).run(pos);
        }, label).setLabel(label);
    }

    exports.discardSecond = _discardSecond;
    function _discardFirst(p1, p2) {
        var label = p1.label + ' discardFirst ' + p2.label;
        return parser(function (pos) {
            return _andThen(p1, p2).fmap(function (_ref7) {
                var _ref8 = _slicedToArray(_ref7, 2),
                    x = _ref8[0],
                    y = _ref8[1];

                return y;
            }).run(pos);
        }, label).setLabel(label);
    }

    exports.discardFirst = _discardFirst;
    function sepBy1Book(px, sep) {
        return px.andThen(many(sep.discardFirst(px))).fmap(function (_ref9) {
            var _ref10 = _slicedToArray(_ref9, 2),
                r = _ref10[0],
                rlist = _ref10[1];

            return [r].concat(rlist);
        });
    }

    // my version works just fine...
    function sepBy1(valueP, separatorP) {
        return many(many1(valueP).discardSecond(opt(separatorP)));
    }

    function between(p1, p2, p3) {
        return p1.discardFirst(p2).discardSecond(p3).setLabel('between ' + p1.label + '/' + p2.label + '/' + p3.label);
    }

    function betweenParens(px) {
        return between(pchar('('), px, pchar(')')).setLabel('betweenParens ' + px.label);
    }

    function bindP(famb, px) {
        var label = 'unknown';
        return parser(function (pos) {
            var res = px.run(pos);
            if (res.isFailure) return res;
            return famb(res.value[0]).run(res.value[1]);
        }, label).setLabel(label);
    }

    function tapP(px, fn) {
        return px.bind(function (res) {
            fn(res);
            return returnP(res);
        });
    }

    function logP(px) {
        return tapP(px, function (res) {
            return console.log(px.label + ':' + res);
        });
    }

    function pword(word) {
        return opt(many(whiteP)).discardFirst(pstring(word)).discardSecond(opt(many(whiteP))).setLabel('pword ' + word);
    }

    function _cons(x) {
        return function (xs) {
            return [x].concat(xs);
        };
    }

    function _setLabel(px, newLabel) {
        return parser(function (pos) {
            var result = px.run(pos);
            if (result.isFailure) return _validation.Validation.Failure(_classes.Tuple.Triple(newLabel, result.value[1], result.value[2]));
            return result;
        }, newLabel);
    }

    // the real thing...
    function parser(fn, label) {
        return {
            type: 'parser',
            label: label,
            run: function run(pos) {
                return fn(pos);
            },
            apply: function apply(px) {
                return applyP(this)(px);
                //return this.bind(andThen(this, px).fmap(([f, x]) => f(x))).run; // we are the fP
            },
            fmap: function fmap(fab) {
                //return fmap(fab, this);
                //return bindP(pos => returnP(fab(pos)), this);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2pzL3BhcnNlcnMuanMiXSwibmFtZXMiOlsicGNoYXIiLCJwZGlnaXQiLCJhbmRUaGVuQmluZCIsImNob2ljZSIsImFueU9mIiwiZm1hcCIsInJldHVyblAiLCJhcHBseVB4IiwiYXBwbHlQIiwibGlmdDIiLCJzZXF1ZW5jZVAiLCJzZXF1ZW5jZVAyIiwicHN0cmluZyIsInplcm9Pck1vcmUiLCJtYW55IiwibWFueUNoYXJzIiwibWFueTEiLCJtYW55Q2hhcnMxIiwib3B0Iiwib3B0Qm9vayIsInNlcEJ5MUJvb2siLCJzZXBCeTEiLCJiZXR3ZWVuIiwiYmV0d2VlblBhcmVucyIsImJpbmRQIiwidGFwUCIsImxvZ1AiLCJwd29yZCIsInBhcnNlciIsImNoYXJQYXJzZXIiLCJwb3MiLCJmcm9tVGV4dCIsIm9wdENoYXIiLCJjaGFyIiwiaXNOb3RoaW5nIiwiRmFpbHVyZSIsIlRyaXBsZSIsInZhbHVlIiwiU3VjY2VzcyIsIlBhaXIiLCJpbmNyUG9zIiwiZGlnaXRQYXJzZXIiLCJwYXJzZUludCIsImRpZ2l0IiwicHJlZGljYXRlQmFzZWRQYXJzZXIiLCJwcmVkIiwibGFiZWwiLCJyZXN1bHQiLCJzZXRMYWJlbCIsImFuZFRoZW4iLCJwMSIsInAyIiwicmVzMSIsInJ1biIsImlzU3VjY2VzcyIsInJlczIiLCJiaW5kIiwicGFyc2VkVmFsdWUxIiwicGFyc2VkVmFsdWUyIiwib3JFbHNlIiwiX2ZhaWwiLCJfc3VjY2VlZCIsInBhcnNlcnMiLCJyZWR1Y2VSaWdodCIsInJlc3QiLCJjdXJyIiwicmVkdWNlIiwiYWNjIiwiY2hhcnMiLCJtYXAiLCJsb3dlcmNhc2VQIiwidXBwZXJjYXNlUCIsImxldHRlclAiLCJkaWdpdFAiLCJ3aGl0ZVAiLCJmYWIiLCJwYXJzZXIxIiwidG9TdHJpbmciLCJyZXMiLCJmUCIsInhQIiwiZiIsIngiLCJwYXJzZWRWYWx1ZWYiLCJwYXJzZWRWYWx1ZXgiLCJmYWFiIiwicGFyc2VyMiIsImFwcGx5IiwiX2NvbnMiLCJ5Iiwic3RyIiwic3BsaXQiLCJpc0ZhaWx1cmUiLCJyZXNOIiwiY29uY2F0IiwiYXJyYSIsImpvaW4iLCJkZWZhdWx0VmFsdWUiLCJpc0RlZmF1bHQiLCJKdXN0Iiwib3V0Y29tZSIsIk5vdGhpbmciLCJwWCIsInNvbWVQIiwibm9uZVAiLCJkaXNjYXJkU2Vjb25kIiwiZGlzY2FyZEZpcnN0IiwicHgiLCJzZXAiLCJyIiwicmxpc3QiLCJ2YWx1ZVAiLCJzZXBhcmF0b3JQIiwicDMiLCJmYW1iIiwiZm4iLCJjb25zb2xlIiwibG9nIiwid29yZCIsInhzIiwiX3NldExhYmVsIiwibmV3TGFiZWwiLCJ0eXBlIiwicGFyc2VkVmFsdWUiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7WUFtQ2dCQSxLLEdBQUFBLEs7WUFRQUMsTSxHQUFBQSxNO1lBa0JBQyxXLEdBQUFBLFc7WUF3QkFDLE0sR0FBQUEsTTtZQUtBQyxLLEdBQUFBLEs7WUFXQUMsSSxHQUFBQSxJO1lBU0FDLE8sR0FBQUEsTztZQUtBQyxPLEdBQUFBLE87WUFPQUMsTSxHQUFBQSxNO1lBVUFDLEssR0FBQUEsSztZQVVBQyxTLEdBQUFBLFM7WUFRQUMsVSxHQUFBQSxVO1lBT0FDLE8sR0FBQUEsTztZQUtBQyxVLEdBQUFBLFU7WUFTQUMsSSxHQUFBQSxJO1lBT0FDLFMsR0FBQUEsUztZQU1BQyxLLEdBQUFBLEs7WUFVQUMsVSxHQUFBQSxVO1lBTUFDLEcsR0FBQUEsRztZQWFBQyxPLEdBQUFBLE87WUFvQkFDLFUsR0FBQUEsVTtZQUtBQyxNLEdBQUFBLE07WUFJQUMsTyxHQUFBQSxPO1lBS0FDLGEsR0FBQUEsYTtZQUtBQyxLLEdBQUFBLEs7WUFTQUMsSSxHQUFBQSxJO1lBT0FDLEksR0FBQUEsSTtZQUlBQyxLLEdBQUFBLEs7WUFzQkFDLE0sR0FBQUEsTTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQS9SdUI7O0FBRXZDLFFBQU1DLGFBQWEsU0FBYkEsVUFBYTtBQUFBLGVBQVEsZUFBTztBQUM5QixnQkFBSSxPQUFPQyxHQUFQLEtBQWUs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QixJQUFMLENBQVU7QUFBQSwyQkFBZWxELFFBQVFxRSxJQUFJZ0QsV0FBSixDQUFSLENBQWY7QUFBQSxpQkFBVixDQUFQO0FBQ0gsYUFkRTtBQWVIMUUsbUJBZkcsbUJBZUswRCxFQWZMLEVBZVM7QUFDUix1QkFBTzFELFNBQVEsSUFBUixFQUFjMEQsRUFBZCxDQUFQO0FBQ0gsYUFqQkU7QUFrQkhoRCxrQkFsQkcsa0JBa0JJZ0QsRUFsQkosRUFrQlE7QUFDUCx1QkFBT2hELFFBQU8sSUFBUCxFQUFhZ0QsRUFBYixDQUFQO0FBQ0gsYUFwQkU7QUFxQkhELHdCQXJCRyx3QkFxQlVDLEVBckJWLEVBcUJjO0FBQ2IsdUJBQU9ELGNBQWEsSUFBYixFQUFtQkMsRUFBbkIsQ0FBUDtBQUNILGFBdkJFO0FBd0JIRix5QkF4QkcseUJBd0JXRSxFQXhCWCxFQXdCZTtBQUNkLHVCQUFPRixlQUFjLElBQWQsRUFBb0JFLEVBQXBCLENBQVA7QUFDSCxhQTFCRTtBQTJCSG5ELGdCQTNCRyxnQkEyQkUwRCxJQTNCRixFQTJCUTtBQUNQLHVCQUFPMUYsTUFBTTBGLElBQU4sRUFBWSxJQUFaLENBQVA7QUFDSCxhQTdCRTtBQThCSGxFLG9CQTlCRyxvQkE4Qk15RSxRQTlCTixFQThCZ0I7QUFDZix1QkFBT0QsVUFBVSxJQUFWLEVBQWdCQyxRQUFoQixDQUFQO0FBQ0g7QUFoQ0UsU0FBUDtBQWtDSCIsImZpbGUiOiJwYXJzZXJzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8gY2ZyLiBcIlVuZGVyc3RhbmRpbmcgUGFyc2VyIENvbWJpbmF0b3JzXCIgKEYjIGZvciBGdW4gYW5kIFByb2ZpdClcblxuaW1wb3J0IHtcbiAgICBUdXBsZSxcbiAgICBQb3NpdGlvbixcbn0gZnJvbSAnY2xhc3Nlcyc7XG5pbXBvcnQge01heWJlfSBmcm9tICdtYXliZSc7IC8vIEp1c3Qgb3IgTm90aGluZ1xuaW1wb3J0IHtWYWxpZGF0aW9ufSBmcm9tICd2YWxpZGF0aW9uJzsgLy8gU3VjY2VzcyBvciBGYWlsdXJlXG5cbmNvbnN0IGNoYXJQYXJzZXIgPSBjaGFyID0+IHBvcyA9PiB7XG4gICAgaWYgKHR5cGVvZiBwb3MgPT09ICdzdHJpbmcnKSBwb3MgPSBQb3NpdGlvbi5mcm9tVGV4dChwb3MpO1xuICAgIGNvbnN0IG9wdENoYXIgPSBwb3MuY2hhcigpO1xuICAgIGlmIChvcHRDaGFyLmlzTm90aGluZykgcmV0dXJuIFZhbGlkYXRpb24uRmFpbHVyZShUdXBsZS5UcmlwbGUoJ2NoYXJQYXJzZXInLCAnbm8gbW9yZSBpbnB1dCcsIHBvcykpO1xuICAgIGlmIChvcHRDaGFyLnZhbHVlID09PSBjaGFyKSByZXR1cm4gVmFsaWRhdGlvbi5TdWNjZXNzKFR1cGxlLlBhaXIoY2hhciwgcG9zLmluY3JQb3MoKSkpO1xuICAgIHJldHVybiBWYWxpZGF0aW9uLkZhaWx1cmUoVHVwbGUuVHJpcGxlKCdjaGFyUGFyc2VyJywgJ3dhbnRlZCAnICsgY2hhciArICc7IGdvdCAnICsgb3B0Q2hhci52YWx1ZSwgcG9zKSk7XG59O1xuXG5jb25zdCBkaWdpdFBhcnNlciA9IGRpZ2l0ID0+IHBvcyA9PiB7XG4gICAgaWYgKHR5cGVvZiBwb3MgPT09ICdzdHJpbmcnKSBwb3MgPSBQb3NpdGlvbi5mcm9tVGV4dChwb3MpO1xuICAgIGNvbnN0IG9wdENoYXIgPSBwb3MuY2hhcigpO1xuICAgIGlmIChvcHRDaGFyLmlzTm90aGluZykgcmV0dXJuIFZhbGlkYXRpb24uRmFpbHVyZShUdXBsZS5UcmlwbGUoJ2RpZ2l0UGFyc2VyJywgJ25vIG1vcmUgaW5wdXQnLCBwb3MpKTtcbiAgICBpZiAocGFyc2VJbnQob3B0Q2hhci52YWx1ZSwgMTApID09PSBkaWdpdCkgcmV0dXJuIFZhbGlkYXRpb24uU3VjY2VzcyhUdXBsZS5QYWlyKGRpZ2l0LCBwb3MuaW5jclBvcygpKSk7XG4gICAgcmV0dXJuIFZhbGlkYXRpb24uRmFpbHVyZShUdXBsZS5UcmlwbGUoJ2RpZ2l0UGFyc2VyJywgJ3dhbnRlZCAnICsgZGlnaXQgKyAnOyBnb3QgJyArIG9wdENoYXIudmFsdWUsIHBvcykpO1xufTtcblxuY29uc3QgcHJlZGljYXRlQmFzZWRQYXJzZXIgPSAocHJlZCwgbGFiZWwpID0+IHBvcyA9PiB7XG4gICAgaWYgKHR5cGVvZiBwb3MgPT09ICdzdHJpbmcnKSBwb3MgPSBQb3NpdGlvbi5mcm9tVGV4dChwb3MpO1xuICAgIGNvbnN0IG9wdENoYXIgPSBwb3MuY2hhcigpO1xuICAgIGlmIChvcHRDaGFyLmlzTm90aGluZykgcmV0dXJuIFZhbGlkYXRpb24uRmFpbHVyZShUdXBsZS5UcmlwbGUobGFiZWwsICdubyBtb3JlIGlucHV0JywgcG9zKSk7XG4gICAgaWYgKHByZWQob3B0Q2hhci52YWx1ZSkpIHJldHVybiBWYWxpZGF0aW9uLlN1Y2Nlc3MoVHVwbGUuUGFpcihvcHRDaGFyLnZhbHVlLCBwb3MuaW5jclBvcygpKSk7XG4gICAgcmV0dXJuIFZhbGlkYXRpb24uRmFpbHVyZShUdXBsZS5UcmlwbGUobGFiZWwsICd1bmV4cGVjdGVkIGNoYXI6ICcgKyBvcHRDaGFyLnZhbHVlLCBwb3MpKTtcbn07XG5cbmV4cG9ydCB7Y2hhclBhcnNlciwgZGlnaXRQYXJzZXIsIHByZWRpY2F0ZUJhc2VkUGFyc2VyfTtcblxuZXhwb3J0IGZ1bmN0aW9uIHBjaGFyKGNoYXIpIHtcbiAgICBjb25zdCBsYWJlbCA9ICdwY2hhcl8nICsgY2hhcjtcbiAgICBsZXQgcmVzdWx0ID0gZnVuY3Rpb24gKHBvcykge1xuICAgICAgICByZXR1cm4gY2hhclBhcnNlcihjaGFyKShwb3MpO1xuICAgIH07XG4gICAgcmV0dXJuIHBhcnNlcihyZXN1bHQsIGxhYmVsKS5zZXRMYWJlbChsYWJlbCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwZGlnaXQoZGlnaXQpIHtcbiAgICByZXR1cm4gcGFyc2VyKHBvcyA9PiBkaWdpdFBhcnNlcihkaWdpdCkocG9zKSwgJ3BkaWdpdF8nICsgZGlnaXQpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYW5kVGhlbihwMSwgcDIpIHtcbiAgICBjb25zdCBsYWJlbCA9IHAxLmxhYmVsICsgJyBhbmRUaGVuICcgKyBwMi5sYWJlbDtcbiAgICByZXR1cm4gcGFyc2VyKGZ1bmN0aW9uIChwb3MpIHtcbiAgICAgICAgbGV0IHJlczEgPSBwMS5ydW4ocG9zKTtcbiAgICAgICAgaWYgKHJlczEuaXNTdWNjZXNzKSB7XG4gICAgICAgICAgICBsZXQgcmVzMiA9IHAyLnJ1bihyZXMxLnZhbHVlWzFdKTtcbiAgICAgICAgICAgIGlmIChyZXMyLmlzU3VjY2Vzcykge1xuICAgICAgICAgICAgICAgIHJldHVybiBWYWxpZGF0aW9uLlN1Y2Nlc3MoVHVwbGUuUGFpcihUdXBsZS5QYWlyKHJlczEudmFsdWVbMF0sIHJlczIudmFsdWVbMF0pLCByZXMyLnZhbHVlWzFdKSk7XG4gICAgICAgICAgICB9IGVsc2UgcmV0dXJuIFZhbGlkYXRpb24uRmFpbHVyZShUdXBsZS5UcmlwbGUobGFiZWwsIHJlczIudmFsdWVbMV0sIHJlczIudmFsdWVbMl0pKTtcbiAgICAgICAgfSBlbHNlIHJldHVybiBWYWxpZGF0aW9uLkZhaWx1cmUoVHVwbGUuVHJpcGxlKGxhYmVsLCByZXMxLnZhbHVlWzFdLCByZXMxLnZhbHVlWzJdKSk7XG4gICAgfSwgbGFiZWwpO1xufVxuXG4vLyB1c2luZyBiaW5kXG5leHBvcnQgZnVuY3Rpb24gYW5kVGhlbkJpbmQocDEsIHAyKSB7XG4gICAgcmV0dXJuIHAxLmJpbmQocGFyc2VkVmFsdWUxID0+IHtcbiAgICAgICAgcmV0dXJuIHAyLmJpbmQocGFyc2VkVmFsdWUyID0+IHtcbiAgICAgICAgICAgIHJldHVybiByZXR1cm5QKFR1cGxlLlBhaXIocGFyc2VkVmFsdWUxLCBwYXJzZWRWYWx1ZTIpKTtcbiAgICAgICAgfSk7XG4gICAgfSkuc2V0TGFiZWwocDEubGFiZWwgKyAnIGFuZFRoZW4gJyArIHAyLmxhYmVsKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG9yRWxzZShwMSwgcDIpIHtcbiAgICBjb25zdCBsYWJlbCA9IHAxLmxhYmVsICsgJyBvckVsc2UgJyArIHAyLmxhYmVsO1xuICAgIHJldHVybiBwYXJzZXIocG9zID0+IHtcbiAgICAgICAgY29uc3QgcmVzMSA9IHAxLnJ1bihwb3MpO1xuICAgICAgICBpZiAocmVzMS5pc1N1Y2Nlc3MpIHJldHVybiByZXMxO1xuICAgICAgICBjb25zdCByZXMyID0gcDIucnVuKHBvcyk7XG4gICAgICAgIGlmIChyZXMyLmlzU3VjY2VzcykgcmV0dXJuIHJlczI7XG4gICAgICAgIHJldHVybiBWYWxpZGF0aW9uLkZhaWx1cmUoVHVwbGUuVHJpcGxlKGxhYmVsLCByZXMyLnZhbHVlWzFdLCByZXMyLnZhbHVlWzJdKSk7XG4gICAgfSwgbGFiZWwpLnNldExhYmVsKGxhYmVsKTtcbn1cblxubGV0IF9mYWlsID0gcGFyc2VyKHBvcyA9PiBWYWxpZGF0aW9uLkZhaWx1cmUoVHVwbGUuVHJpcGxlKCdwYXJzaW5nIGZhaWxlZCcsICdfZmFpbCcsIHBvcykpKTtcblxuLy8gcmV0dXJuIG5ldXRyYWwgZWxlbWVudCBpbnN0ZWFkIG9mIG1lc3NhZ2VcbmxldCBfc3VjY2VlZCA9IHBhcnNlcihwb3MgPT4gVmFsaWRhdGlvbi5TdWNjZXNzKFR1cGxlLlBhaXIoVHVwbGUuUGFpcigncGFyc2luZyBzdWNjZWVkZWQnLCBwb3MpLCAnX3N1Y2NlZWQnKSkpO1xuXG5leHBvcnQgZnVuY3Rpb24gY2hvaWNlKHBhcnNlcnMpIHtcbiAgICByZXR1cm4gcGFyc2Vycy5yZWR1Y2VSaWdodCgocmVzdCwgY3VycikgPT4gb3JFbHNlKGN1cnIsIHJlc3QpLCBfZmFpbClcbiAgICAgICAgLnNldExhYmVsKCdjaG9pY2UgJyArIHBhcnNlcnMucmVkdWNlKChhY2MsIGN1cnIpID0+IGFjYyArICcvJyArIGN1cnIubGFiZWwsICcnKSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhbnlPZihjaGFycykge1xuICAgIHJldHVybiBjaG9pY2UoY2hhcnMubWFwKHBjaGFyKSlcbiAgICAgICAgLnNldExhYmVsKCdhbnlPZiAnICsgY2hhcnMucmVkdWNlKChhY2MsIGN1cnIpID0+IGFjYyArIGN1cnIsICcnKSk7XG59XG5cbmV4cG9ydCBjb25zdCBsb3dlcmNhc2VQID0gYW55T2YoWydhJywgJ2InLCAnYycsICdkJywgJ2UnLCAnZicsICdnJywgJ2gnLCAnaScsICdqJywgJ2snLCAnbCcsICdtJywgJ24nLCAnbycsICdwJywgJ3EnLCAncicsICdzJywgJ3QnLCAndScsICd2JywgJ3cnLCAneCcsICd5JywgJ3onLF0pO1xuZXhwb3J0IGNvbnN0IHVwcGVyY2FzZVAgPSBhbnlPZihbJ0EnLCAnQicsICdDJywgJ0QnLCAnRScsICdGJywgJ0cnLCAnSCcsICdJJywgJ0onLCAnSycsICdMJywgJ00nLCAnTicsICdPJywgJ1AnLCAnUScsICdSJywgJ1MnLCAnVCcsICdVJywgJ1YnLCAnVycsICdYJywgJ1knLCAnWicsXSk7XG5leHBvcnQgY29uc3QgbGV0dGVyUCA9IGxvd2VyY2FzZVAub3JFbHNlKHVwcGVyY2FzZVApO1xuZXhwb3J0IGNvbnN0IGRpZ2l0UCA9IGFueU9mKFsnMCcsICcxJywgJzInLCAnMycsICc0JywgJzUnLCAnNicsICc3JywgJzgnLCAnOSddKTtcbmV4cG9ydCBjb25zdCB3aGl0ZVAgPSBhbnlPZihbJyAnLCAnXFx0JywgJ1xcbicsICdcXHInXSk7XG5cbmV4cG9ydCBmdW5jdGlvbiBmbWFwKGZhYiwgcGFyc2VyMSkge1xuICAgIGNvbnN0IGxhYmVsID0gcGFyc2VyMS5sYWJlbCArICcgZm1hcCAnICsgZmFiLnRvU3RyaW5nKCk7XG4gICAgcmV0dXJuIHBhcnNlcihwb3MgPT4ge1xuICAgICAgICBsZXQgcmVzID0gcGFyc2VyMS5ydW4ocG9zKTtcbiAgICAgICAgaWYgKHJlcy5pc1N1Y2Nlc3MpIHJldHVybiBWYWxpZGF0aW9uLlN1Y2Nlc3MoVHVwbGUuUGFpcihmYWIocmVzLnZhbHVlWzBdKSwgcmVzLnZhbHVlWzFdKSk7XG4gICAgICAgIHJldHVybiBWYWxpZGF0aW9uLkZhaWx1cmUoVHVwbGUuVHJpcGxlKGxhYmVsLCByZXMudmFsdWVbMV0sIHJlcy52YWx1ZVsyXSkpO1xuICAgIH0sIGxhYmVsKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJldHVyblAodmFsdWUpIHtcbiAgICByZXR1cm4gcGFyc2VyKHBvcyA9PiBWYWxpZGF0aW9uLlN1Y2Nlc3MoVHVwbGUuUGFpcih2YWx1ZSwgcG9zKSksIHZhbHVlKTtcbn1cblxuLy8gcGFyc2VyKGEgLT4gYikgLT4gcGFyc2VyKGEpIC0+IHBhcnNlcihiKVxuZXhwb3J0IGZ1bmN0aW9uIGFwcGx5UHgoZlApIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKHhQKSB7XG4gICAgICAgIHJldHVybiBhbmRUaGVuKGZQLCB4UCkuZm1hcCgoW2YsIHhdKSA9PiBmKHgpKTtcbiAgICB9O1xufVxuXG4vLyB1c2luZyBiaW5kXG5leHBvcnQgZnVuY3Rpb24gYXBwbHlQKGZQKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uICh4UCkge1xuICAgICAgICByZXR1cm4gZlAuYmluZChwYXJzZWRWYWx1ZWYgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHhQLmJpbmQocGFyc2VkVmFsdWV4ID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmV0dXJuUChwYXJzZWRWYWx1ZWYocGFyc2VkVmFsdWV4KSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGxpZnQyKGZhYWIpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKHBhcnNlcjEpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChwYXJzZXIyKSB7XG4gICAgICAgICAgICAvL3JldHVybiBhcHBseVAoYXBwbHlQKHJldHVyblAoZmFhYikpKHBhcnNlcjEpKShwYXJzZXIyKTtcbiAgICAgICAgICAgIHJldHVybiByZXR1cm5QKGZhYWIpLmFwcGx5KHBhcnNlcjEpLmFwcGx5KHBhcnNlcjIpOyAvLyB1c2luZyBpbnN0YW5jZSBtZXRob2RzXG4gICAgICAgIH07XG4gICAgfTtcbn1cblxuLy8gdXNpbmcgbGlmdDIoY29ucylcbmV4cG9ydCBmdW5jdGlvbiBzZXF1ZW5jZVAocGFyc2Vycykge1xuICAgIHJldHVybiBwYXJzZXJzXG4gICAgICAgIC5yZWR1Y2VSaWdodCgocmVzdCwgY3VycikgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIGxpZnQyKF9jb25zKShjdXJyKShyZXN0KTtcbiAgICAgICAgfSwgcmV0dXJuUChbXSkpO1xufVxuXG4vLyB1c2luZyBuYWl2ZSBhbmRUaGVuICYmIGZtYXAgLS0+IHJldHVybnMgc3RyaW5ncywgbm90IGFycmF5cyFcbmV4cG9ydCBmdW5jdGlvbiBzZXF1ZW5jZVAyKHBhcnNlcnMpIHtcbiAgICByZXR1cm4gcGFyc2Vyc1xuICAgICAgICAucmVkdWNlUmlnaHQoKHJlc3QsIGN1cnIpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBmbWFwKChbeCwgeV0pID0+IHggKyB5LCBhbmRUaGVuKGN1cnIsIHJlc3QpKTtcbiAgICAgICAgfSwgcmV0dXJuUCgnJykpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcHN0cmluZyhzdHIpIHtcbiAgICByZXR1cm4gc2VxdWVuY2VQKHN0ci5zcGxpdCgnJykubWFwKHBjaGFyKSlcbiAgICAgICAgLnNldExhYmVsKCdwc3RyaW5nICcgKyBzdHIpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gemVyb09yTW9yZSh4UCkgeyAvLyB6ZXJvT3JNb3JlIDo6IHAgYSAtPiBbYV0gLT4gdHJ5IFthXSA9IHAgYSAtPiBwIFthXVxuICAgIHJldHVybiBwb3MgPT4ge1xuICAgICAgICBsZXQgcmVzMSA9IHhQLnJ1bihwb3MpO1xuICAgICAgICBpZiAocmVzMS5pc0ZhaWx1cmUpIHJldHVybiBWYWxpZGF0aW9uLlN1Y2Nlc3MoVHVwbGUuUGFpcihbXSwgcG9zKSk7XG4gICAgICAgIGxldCByZXNOID0gemVyb09yTW9yZSh4UCkocmVzMS52YWx1ZVsxXSk7XG4gICAgICAgIHJldHVybiBWYWxpZGF0aW9uLlN1Y2Nlc3MoVHVwbGUuUGFpcihbcmVzMS52YWx1ZVswXV0uY29uY2F0KHJlc04udmFsdWVbMF0pLCByZXNOLnZhbHVlWzFdKSk7XG4gICAgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1hbnkoeFApIHtcbiAgICBjb25zdCBsYWJlbCA9ICdtYW55ICcgKyB4UC5sYWJlbDtcbiAgICByZXR1cm4gcGFyc2VyKHBvcyA9PiB7XG4gICAgICAgIHJldHVybiB6ZXJvT3JNb3JlKHhQKShwb3MpO1xuICAgIH0sIGxhYmVsKS5zZXRMYWJlbChsYWJlbCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtYW55Q2hhcnMoeFApIHtcbiAgICByZXR1cm4gbWFueSh4UClcbiAgICAgICAgLmZtYXAoYXJyYSA9PiBhcnJhLmpvaW4oJycpKVxuICAgICAgICAuc2V0TGFiZWwoJ21hbnlDaGFycyAnICsgeFAubGFiZWwpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbWFueTEoeFApIHtcbiAgICBjb25zdCBsYWJlbCA9ICdtYW55MSAnICsgeFAubGFiZWw7XG4gICAgcmV0dXJuIHBhcnNlcihwb3MgPT4ge1xuICAgICAgICBsZXQgcmVzMSA9IHhQLnJ1bihwb3MpO1xuICAgICAgICBpZiAocmVzMS5pc0ZhaWx1cmUpIHJldHVybiByZXMxO1xuICAgICAgICBsZXQgcmVzTiA9IHplcm9Pck1vcmUoeFApKHJlczEudmFsdWVbMV0pO1xuICAgICAgICByZXR1cm4gVmFsaWRhdGlvbi5TdWNjZXNzKFR1cGxlLlBhaXIoW3JlczEudmFsdWVbMF1dLmNvbmNhdChyZXNOLnZhbHVlWzBdKSwgcmVzTi52YWx1ZVsxXSkpO1xuICAgIH0sIGxhYmVsKS5zZXRMYWJlbChsYWJlbCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtYW55Q2hhcnMxKHhQKSB7XG4gICAgcmV0dXJuIG1hbnkxKHhQKVxuICAgICAgICAuZm1hcChhcnJhID0+IGFycmEuam9pbignJykpXG4gICAgICAgIC5zZXRMYWJlbCgnbWFueUNoYXJzMSAnICsgeFAubGFiZWwpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gb3B0KHhQLCBkZWZhdWx0VmFsdWUpIHtcbiAgICBjb25zdCBpc0RlZmF1bHQgPSAodHlwZW9mIGRlZmF1bHRWYWx1ZSAhPT0gJ3VuZGVmaW5lZCcpO1xuICAgIGNvbnN0IGxhYmVsID0gJ29wdCAnICsgeFAubGFiZWxcbiAgICAgICAgKyAoaXNEZWZhdWx0ID8gJyhkZWZhdWx0PScgKyBkZWZhdWx0VmFsdWUgKyAnKScgOiAnJyk7XG4gICAgcmV0dXJuIHBhcnNlcihwb3MgPT4ge1xuICAgICAgICBsZXQgcmVzID0geFAuZm1hcChNYXliZS5KdXN0KS5ydW4ocG9zKTtcbiAgICAgICAgaWYgKHJlcy5pc1N1Y2Nlc3MpIHJldHVybiByZXM7XG4gICAgICAgIGxldCBvdXRjb21lID0gKGlzRGVmYXVsdCkgPyBNYXliZS5KdXN0KGRlZmF1bHRWYWx1ZSkgOiBNYXliZS5Ob3RoaW5nKCk7XG4gICAgICAgIHJldHVybiBWYWxpZGF0aW9uLlN1Y2Nlc3MoVHVwbGUuUGFpcihvdXRjb21lLCBwb3MpKTtcbiAgICB9LCBsYWJlbCkuc2V0TGFiZWwobGFiZWwpO1xufVxuXG4vLyBvcHQgZnJvbSB0aGUgYm9vayAtIHdvcmtzIG9rLCBidXQgdG9TdHJpbmcoKSBnaXZlcyBzdHJhbmdlIHJlc3VsdHNcbmV4cG9ydCBmdW5jdGlvbiBvcHRCb29rKHBYKSB7XG4gICAgY29uc3Qgc29tZVAgPSBwWC5mbWFwKE1heWJlLkp1c3QpO1xuICAgIGNvbnN0IG5vbmVQID0gcmV0dXJuUChNYXliZS5Ob3RoaW5nKTtcbiAgICByZXR1cm4gc29tZVAub3JFbHNlKG5vbmVQKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRpc2NhcmRTZWNvbmQocDEsIHAyKSB7XG4gICAgY29uc3QgbGFiZWwgPSBwMS5sYWJlbCArICcgZGlzY2FyZFNlY29uZCAnICsgcDIubGFiZWw7XG4gICAgcmV0dXJuIHBhcnNlcihwb3MgPT4ge1xuICAgICAgICByZXR1cm4gYW5kVGhlbihwMSwgcDIpLmZtYXAoKFt4LCB5XSkgPT4geCkucnVuKHBvcyk7XG4gICAgfSwgbGFiZWwpLnNldExhYmVsKGxhYmVsKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRpc2NhcmRGaXJzdChwMSwgcDIpIHtcbiAgICBjb25zdCBsYWJlbCA9IHAxLmxhYmVsICsgJyBkaXNjYXJkRmlyc3QgJyArIHAyLmxhYmVsO1xuICAgIHJldHVybiBwYXJzZXIocG9zID0+IHtcbiAgICAgICAgcmV0dXJuIGFuZFRoZW4ocDEsIHAyKS5mbWFwKChbeCwgeV0pID0+IHkpLnJ1bihwb3MpO1xuICAgIH0sIGxhYmVsKS5zZXRMYWJlbChsYWJlbCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzZXBCeTFCb29rKHB4LCBzZXApIHtcbiAgICByZXR1cm4gcHguYW5kVGhlbihtYW55KHNlcC5kaXNjYXJkRmlyc3QocHgpKSkuZm1hcCgoW3IsIHJsaXN0XSkgPT4gW3JdLmNvbmNhdChybGlzdCkpO1xufVxuXG4vLyBteSB2ZXJzaW9uIHdvcmtzIGp1c3QgZmluZS4uLlxuZXhwb3J0IGZ1bmN0aW9uIHNlcEJ5MSh2YWx1ZVAsIHNlcGFyYXRvclApIHtcbiAgICByZXR1cm4gbWFueShtYW55MSh2YWx1ZVApLmRpc2NhcmRTZWNvbmQob3B0KHNlcGFyYXRvclApKSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBiZXR3ZWVuKHAxLCBwMiwgcDMpIHtcbiAgICByZXR1cm4gcDEuZGlzY2FyZEZpcnN0KHAyKS5kaXNjYXJkU2Vjb25kKHAzKVxuICAgICAgICAuc2V0TGFiZWwoJ2JldHdlZW4gJyArIHAxLmxhYmVsICsgJy8nICsgcDIubGFiZWwgKyAnLycgKyBwMy5sYWJlbCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBiZXR3ZWVuUGFyZW5zKHB4KSB7XG4gICAgcmV0dXJuIGJldHdlZW4ocGNoYXIoJygnKSwgcHgsIHBjaGFyKCcpJykpXG4gICAgICAgIC5zZXRMYWJlbCgnYmV0d2VlblBhcmVucyAnICsgcHgubGFiZWwpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYmluZFAoZmFtYiwgcHgpIHtcbiAgICBsZXQgbGFiZWwgPSAndW5rbm93bic7XG4gICAgcmV0dXJuIHBhcnNlcihwb3MgPT4ge1xuICAgICAgICBjb25zdCByZXMgPSBweC5ydW4ocG9zKTtcbiAgICAgICAgaWYgKHJlcy5pc0ZhaWx1cmUpIHJldHVybiByZXM7XG4gICAgICAgIHJldHVybiBmYW1iKHJlcy52YWx1ZVswXSkucnVuKHJlcy52YWx1ZVsxXSk7XG4gICAgfSwgbGFiZWwpLnNldExhYmVsKGxhYmVsKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHRhcFAocHgsIGZuKSB7XG4gICAgcmV0dXJuIHB4LmJpbmQocmVzID0+IHtcbiAgICAgICAgZm4ocmVzKTtcbiAgICAgICAgcmV0dXJuIHJldHVyblAocmVzKTtcbiAgICB9KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGxvZ1AocHgpIHtcbiAgICByZXR1cm4gdGFwUChweCwgcmVzID0+IGNvbnNvbGUubG9nKHB4LmxhYmVsICsgJzonICsgcmVzKSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwd29yZCh3b3JkKSB7XG4gICAgcmV0dXJuIG9wdChtYW55KHdoaXRlUCkpXG4gICAgICAgIC5kaXNjYXJkRmlyc3QocHN0cmluZyh3b3JkKSlcbiAgICAgICAgLmRpc2NhcmRTZWNvbmQob3B0KG1hbnkod2hpdGVQKSkpXG4gICAgICAgIC5zZXRMYWJlbCgncHdvcmQgJyArIHdvcmQpO1xufVxuXG5mdW5jdGlvbiBfY29ucyh4KSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uICh4cykge1xuICAgICAgICByZXR1cm4gW3hdLmNvbmNhdCh4cyk7XG4gICAgfTtcbn1cblxuZnVuY3Rpb24gX3NldExhYmVsKHB4LCBuZXdMYWJlbCkge1xuICAgIHJldHVybiBwYXJzZXIocG9zID0+IHtcbiAgICAgICAgbGV0IHJlc3VsdCA9IHB4LnJ1bihwb3MpO1xuICAgICAgICBpZiAocmVzdWx0LmlzRmFpbHVyZSkgcmV0dXJuIFZhbGlkYXRpb24uRmFpbHVyZShUdXBsZS5UcmlwbGUobmV3TGFiZWwsIHJlc3VsdC52YWx1ZVsxXSwgcmVzdWx0LnZhbHVlWzJdKSk7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSwgbmV3TGFiZWwpO1xufVxuXG4vLyB0aGUgcmVhbCB0aGluZy4uLlxuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlcihmbiwgbGFiZWwpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICB0eXBlOiAncGFyc2VyJyxcbiAgICAgICAgbGFiZWw6IGxhYmVsLFxuICAgICAgICBydW4ocG9zKSB7XG4gICAgICAgICAgICByZXR1cm4gZm4ocG9zKTtcbiAgICAgICAgfSxcbiAgICAgICAgYXBwbHkocHgpIHtcbiAgICAgICAgICAgIHJldHVybiBhcHBseVAodGhpcykocHgpO1xuICAgICAgICAgICAgLy9yZXR1cm4gdGhpcy5iaW5kKGFuZFRoZW4odGhpcywgcHgpLmZtYXAoKFtmLCB4XSkgPT4gZih4KSkpLnJ1bjsgLy8gd2UgYXJlIHRoZSBmUFxuICAgICAgICB9LFxuICAgICAgICBmbWFwKGZhYikge1xuICAgICAgICAgICAgLy9yZXR1cm4gZm1hcChmYWIsIHRoaXMpO1xuICAgICAgICAgICAgLy9yZXR1cm4gYmluZFAocG9zID0+IHJldHVyblAoZmFiKHBvcykpLCB0aGlzKTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmJpbmQocGFyc2VkVmFsdWUgPT4gcmV0dXJuUChmYWIocGFyc2VkVmFsdWUpKSk7XG4gICAgICAgIH0sXG4gICAgICAgIGFuZFRoZW4ocHgpIHtcbiAgICAgICAgICAgIHJldHVybiBhbmRUaGVuKHRoaXMsIHB4KTtcbiAgICAgICAgfSxcbiAgICAgICAgb3JFbHNlKHB4KSB7XG4gICAgICAgICAgICByZXR1cm4gb3JFbHNlKHRoaXMsIHB4KTtcbiAgICAgICAgfSxcbiAgICAgICAgZGlzY2FyZEZpcnN0KHB4KSB7XG4gICAgICAgICAgICByZXR1cm4gZGlzY2FyZEZpcnN0KHRoaXMsIHB4KTtcbiAgICAgICAgfSxcbiAgICAgICAgZGlzY2FyZFNlY29uZChweCkge1xuICAgICAgICAgICAgcmV0dXJuIGRpc2NhcmRTZWNvbmQodGhpcywgcHgpO1xuICAgICAgICB9LFxuICAgICAgICBiaW5kKGZhbWIpIHtcbiAgICAgICAgICAgIHJldHVybiBiaW5kUChmYW1iLCB0aGlzKTtcbiAgICAgICAgfSxcbiAgICAgICAgc2V0TGFiZWwobmV3TGFiZWwpIHtcbiAgICAgICAgICAgIHJldHVybiBfc2V0TGFiZWwodGhpcywgbmV3TGFiZWwpO1xuICAgICAgICB9XG4gICAgfTtcbn1cbiJdfQ==