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

    function anyOf(charsArray) {
        return choice(charsArray.map(pchar)).setLabel('anyOf ' + charsArray.reduce(function (acc, curr) {
            return acc + curr;
        }, ''));
    }

    var lowercaseP = exports.lowercaseP = anyOf(['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z']).setLabel('lowercaseP');
    var uppercaseP = exports.uppercaseP = anyOf(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']).setLabel('uppercaseP');
    var letterP = exports.letterP = lowercaseP.orElse(uppercaseP).setLabel('letterP');
    var digitP = exports.digitP = anyOf(['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']).setLabel('digitP');
    var whiteP = exports.whiteP = anyOf([' ', '\t', '\n', '\r']).setLabel('whiteP');

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

    function many(xP, times) {
        var times_defined = typeof times !== 'undefined';
        var label = 'many ' + xP.label + (times_defined ? ' times=' + times : '');
        return parser(function (pos) {
            var res = zeroOrMore(xP)(pos);
            if (times_defined) {
                //debugger;
                if (res.isFailure) return res;
                var resultLength = res.value[0].length;
                return resultLength === times ? res : _validation.Validation.Failure(_classes.Tuple.Triple(label, 'times param wanted ' + times + '; got ' + resultLength, pos));
            }
            return res;
        }, label).setLabel(label);
    }

    function manyChars(xP, times) {
        return many(xP, times).fmap(function (arra) {
            return arra.join('');
        }).setLabel('manyChars ' + xP.label + (typeof times !== 'undefined' ? ' times=' + times : ''));
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2pzL3BhcnNlcnMuanMiXSwibmFtZXMiOlsicGNoYXIiLCJwZGlnaXQiLCJhbmRUaGVuQmluZCIsImNob2ljZSIsImFueU9mIiwiZm1hcCIsInJldHVyblAiLCJhcHBseVB4IiwiYXBwbHlQIiwibGlmdDIiLCJzZXF1ZW5jZVAiLCJzZXF1ZW5jZVAyIiwicHN0cmluZyIsInplcm9Pck1vcmUiLCJtYW55IiwibWFueUNoYXJzIiwibWFueTEiLCJtYW55Q2hhcnMxIiwib3B0Iiwib3B0Qm9vayIsInNlcEJ5MUJvb2siLCJzZXBCeTEiLCJiZXR3ZWVuIiwiYmV0d2VlblBhcmVucyIsImJpbmRQIiwidGFwUCIsImxvZ1AiLCJwd29yZCIsInBhcnNlciIsImNoYXJQYXJzZXIiLCJwb3MiLCJmcm9tVGV4dCIsIm9wdENoYXIiLCJjaGFyIiwiaXNOb3RoaW5nIiwiRmFpbHVyZSIsIlRyaXBsZSIsInZhbHVlIiwiU3VjY2VzcyIsIlBhaXIiLCJpbmNyUG9zIiwiZGlnaXRQYXJzZXIiLCJwYXJzZUludCIsImRpZ2l0IiwicHJlZGljYXRlQmFzZWRQYXJzZXIiLCJwcmVkIiwibGFiZWwiLCJyZXN1bHQiLCJzZXRMYWJlbCIsImFuZFRoZW4iLCJwMSIsInAyIiwicmVzMSIsInJ1biIsImlzU3VjY2VzcyIsInJlczIiLCJiaW5kIiwicGFyc2VkVmFsdWUxIiwicGFyc2VkVmFsdWUyIiwib3JFbHNlIiwiX2ZhaWwiLCJfc3VjY2VlZCIsInBhcnNlcnMiLCJyZWR1Y2VSaWdodCIsInJlc3QiLCJjdXJyIiwicmVkdWNlIiwiYWNjIiwiY2hhcnNBcnJheSIsIm1hcCIsImxvd2VyY2FzZVAiLCJ1cHBlcmNhc2VQIiwibGV0dGVyUCIsImRpZ2l0UCIsIndoaXRlUCIsImZhYiIsInBhcnNlcjEiLCJ0b1N0cmluZyIsInJlcyIsImZQIiwieFAiLCJmIiwieCIsInBhcnNlZFZhbHVlZiIsInBhcnNlZFZhbHVleCIsImZhYWIiLCJwYXJzZXIyIiwiYXBwbHkiLCJfY29ucyIsInkiLCJzdHIiLCJzcGxpdCIsImlzRmFpbHVyZSIsInJlc04iLCJjb25jYXQiLCJ0aW1lcyIsInRpbWVzX2RlZmluZWQiLCJyZXN1bHRMZW5ndGgiLCJsZW5ndGgiLCJhcnJhIiwiam9pbiIsImRlZmF1bHRWYWx1ZSIsImlzRGVmYXVsdCIsIkp1c3QiLCJvdXRjb21lIiwiTm90aGluZyIsInBYIiwic29tZVAiLCJub25lUCIsImRpc2NhcmRTZWNvbmQiLCJkaXNjYXJkRmlyc3QiLCJweCIsInNlcCIsInIiLCJybGlzdCIsInZhbHVlUCIsInNlcGFyYXRvclAiLCJwMyIsImZhbWIiLCJmbiIsImNvbnNvbGUiLCJsb2ciLCJ3b3JkIiwieHMiLCJfc2V0TGFiZWwiLCJuZXdMYWJlbCIsInR5cGUiLCJwYXJzZWRWYWx1ZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7OztZQW1DZ0JBLEssR0FBQUEsSztZQVFBQyxNLEdBQUFBLE07WUFrQkFDLFcsR0FBQUEsVztZQXdCQUMsTSxHQUFBQSxNO1lBS0FDLEssR0FBQUEsSztZQVdBQyxJLEdBQUFBLEk7WUFTQUMsTyxHQUFBQSxPO1lBS0FDLE8sR0FBQUEsTztZQU9BQyxNLEdBQUFBLE07WUFVQUMsSyxHQUFBQSxLO1lBVUFDLFMsR0FBQUEsUztZQVFBQyxVLEdBQUFBLFU7WUFPQUMsTyxHQUFBQSxPO1lBS0FDLFUsR0FBQUEsVTtZQVNBQyxJLEdBQUFBLEk7WUFpQkFDLFMsR0FBQUEsUztZQU9BQyxLLEdBQUFBLEs7WUFVQUMsVSxHQUFBQSxVO1lBTUFDLEcsR0FBQUEsRztZQWFBQyxPLEdBQUFBLE87WUFvQkFDLFUsR0FBQUEsVTtZQUtBQyxNLEdBQUFBLE07WUFJQUMsTyxHQUFBQSxPO1lBS0FDLGEsR0FBQUEsYTtZQUtBQyxLLEdBQUFBLEs7WUFTQUMsSSxHQUFBQSxJO1lBT0FDLEksR0FBQUEsSTtZQUlBQyxLLEdBQUFBLEs7WUFzQkFDLE0sR0FBQUEsTTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQTFTdUI7O0FBRXZDLFFBQU1DLGFBQWEs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LFFBQU8sSUFBUCxFQUFhb0QsRUFBYixDQUFQO0FBQ0gsYUFwQkU7QUFxQkhELHdCQXJCRyx3QkFxQlVDLEVBckJWLEVBcUJjO0FBQ2IsdUJBQU9ELGNBQWEsSUFBYixFQUFtQkMsRUFBbkIsQ0FBUDtBQUNILGFBdkJFO0FBd0JIRix5QkF4QkcseUJBd0JXRSxFQXhCWCxFQXdCZTtBQUNkLHVCQUFPRixlQUFjLElBQWQsRUFBb0JFLEVBQXBCLENBQVA7QUFDSCxhQTFCRTtBQTJCSHZELGdCQTNCRyxnQkEyQkU4RCxJQTNCRixFQTJCUTtBQUNQLHVCQUFPOUYsTUFBTThGLElBQU4sRUFBWSxJQUFaLENBQVA7QUFDSCxhQTdCRTtBQThCSHRFLG9CQTlCRyxvQkE4Qk02RSxRQTlCTixFQThCZ0I7QUFDZix1QkFBT0QsVUFBVSxJQUFWLEVBQWdCQyxRQUFoQixDQUFQO0FBQ0g7QUFoQ0UsU0FBUDtBQWtDSCIsImZpbGUiOiJwYXJzZXJzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8gY2ZyLiBcIlVuZGVyc3RhbmRpbmcgUGFyc2VyIENvbWJpbmF0b3JzXCIgKEYjIGZvciBGdW4gYW5kIFByb2ZpdClcblxuaW1wb3J0IHtcbiAgICBUdXBsZSxcbiAgICBQb3NpdGlvbixcbn0gZnJvbSAnY2xhc3Nlcyc7XG5pbXBvcnQge01heWJlfSBmcm9tICdtYXliZSc7IC8vIEp1c3Qgb3IgTm90aGluZ1xuaW1wb3J0IHtWYWxpZGF0aW9ufSBmcm9tICd2YWxpZGF0aW9uJzsgLy8gU3VjY2VzcyBvciBGYWlsdXJlXG5cbmNvbnN0IGNoYXJQYXJzZXIgPSBjaGFyID0+IHBvcyA9PiB7XG4gICAgaWYgKHR5cGVvZiBwb3MgPT09ICdzdHJpbmcnKSBwb3MgPSBQb3NpdGlvbi5mcm9tVGV4dChwb3MpO1xuICAgIGNvbnN0IG9wdENoYXIgPSBwb3MuY2hhcigpO1xuICAgIGlmIChvcHRDaGFyLmlzTm90aGluZykgcmV0dXJuIFZhbGlkYXRpb24uRmFpbHVyZShUdXBsZS5UcmlwbGUoJ2NoYXJQYXJzZXInLCAnbm8gbW9yZSBpbnB1dCcsIHBvcykpO1xuICAgIGlmIChvcHRDaGFyLnZhbHVlID09PSBjaGFyKSByZXR1cm4gVmFsaWRhdGlvbi5TdWNjZXNzKFR1cGxlLlBhaXIoY2hhciwgcG9zLmluY3JQb3MoKSkpO1xuICAgIHJldHVybiBWYWxpZGF0aW9uLkZhaWx1cmUoVHVwbGUuVHJpcGxlKCdjaGFyUGFyc2VyJywgJ3dhbnRlZCAnICsgY2hhciArICc7IGdvdCAnICsgb3B0Q2hhci52YWx1ZSwgcG9zKSk7XG59O1xuXG5jb25zdCBkaWdpdFBhcnNlciA9IGRpZ2l0ID0+IHBvcyA9PiB7XG4gICAgaWYgKHR5cGVvZiBwb3MgPT09ICdzdHJpbmcnKSBwb3MgPSBQb3NpdGlvbi5mcm9tVGV4dChwb3MpO1xuICAgIGNvbnN0IG9wdENoYXIgPSBwb3MuY2hhcigpO1xuICAgIGlmIChvcHRDaGFyLmlzTm90aGluZykgcmV0dXJuIFZhbGlkYXRpb24uRmFpbHVyZShUdXBsZS5UcmlwbGUoJ2RpZ2l0UGFyc2VyJywgJ25vIG1vcmUgaW5wdXQnLCBwb3MpKTtcbiAgICBpZiAocGFyc2VJbnQob3B0Q2hhci52YWx1ZSwgMTApID09PSBkaWdpdCkgcmV0dXJuIFZhbGlkYXRpb24uU3VjY2VzcyhUdXBsZS5QYWlyKGRpZ2l0LCBwb3MuaW5jclBvcygpKSk7XG4gICAgcmV0dXJuIFZhbGlkYXRpb24uRmFpbHVyZShUdXBsZS5UcmlwbGUoJ2RpZ2l0UGFyc2VyJywgJ3dhbnRlZCAnICsgZGlnaXQgKyAnOyBnb3QgJyArIG9wdENoYXIudmFsdWUsIHBvcykpO1xufTtcblxuY29uc3QgcHJlZGljYXRlQmFzZWRQYXJzZXIgPSAocHJlZCwgbGFiZWwpID0+IHBvcyA9PiB7XG4gICAgaWYgKHR5cGVvZiBwb3MgPT09ICdzdHJpbmcnKSBwb3MgPSBQb3NpdGlvbi5mcm9tVGV4dChwb3MpO1xuICAgIGNvbnN0IG9wdENoYXIgPSBwb3MuY2hhcigpO1xuICAgIGlmIChvcHRDaGFyLmlzTm90aGluZykgcmV0dXJuIFZhbGlkYXRpb24uRmFpbHVyZShUdXBsZS5UcmlwbGUobGFiZWwsICdubyBtb3JlIGlucHV0JywgcG9zKSk7XG4gICAgaWYgKHByZWQob3B0Q2hhci52YWx1ZSkpIHJldHVybiBWYWxpZGF0aW9uLlN1Y2Nlc3MoVHVwbGUuUGFpcihvcHRDaGFyLnZhbHVlLCBwb3MuaW5jclBvcygpKSk7XG4gICAgcmV0dXJuIFZhbGlkYXRpb24uRmFpbHVyZShUdXBsZS5UcmlwbGUobGFiZWwsICd1bmV4cGVjdGVkIGNoYXI6ICcgKyBvcHRDaGFyLnZhbHVlLCBwb3MpKTtcbn07XG5cbmV4cG9ydCB7Y2hhclBhcnNlciwgZGlnaXRQYXJzZXIsIHByZWRpY2F0ZUJhc2VkUGFyc2VyfTtcblxuZXhwb3J0IGZ1bmN0aW9uIHBjaGFyKGNoYXIpIHtcbiAgICBjb25zdCBsYWJlbCA9ICdwY2hhcl8nICsgY2hhcjtcbiAgICBsZXQgcmVzdWx0ID0gZnVuY3Rpb24gKHBvcykge1xuICAgICAgICByZXR1cm4gY2hhclBhcnNlcihjaGFyKShwb3MpO1xuICAgIH07XG4gICAgcmV0dXJuIHBhcnNlcihyZXN1bHQsIGxhYmVsKS5zZXRMYWJlbChsYWJlbCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwZGlnaXQoZGlnaXQpIHtcbiAgICByZXR1cm4gcGFyc2VyKHBvcyA9PiBkaWdpdFBhcnNlcihkaWdpdCkocG9zKSwgJ3BkaWdpdF8nICsgZGlnaXQpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYW5kVGhlbihwMSwgcDIpIHtcbiAgICBjb25zdCBsYWJlbCA9IHAxLmxhYmVsICsgJyBhbmRUaGVuICcgKyBwMi5sYWJlbDtcbiAgICByZXR1cm4gcGFyc2VyKGZ1bmN0aW9uIChwb3MpIHtcbiAgICAgICAgbGV0IHJlczEgPSBwMS5ydW4ocG9zKTtcbiAgICAgICAgaWYgKHJlczEuaXNTdWNjZXNzKSB7XG4gICAgICAgICAgICBsZXQgcmVzMiA9IHAyLnJ1bihyZXMxLnZhbHVlWzFdKTtcbiAgICAgICAgICAgIGlmIChyZXMyLmlzU3VjY2Vzcykge1xuICAgICAgICAgICAgICAgIHJldHVybiBWYWxpZGF0aW9uLlN1Y2Nlc3MoVHVwbGUuUGFpcihUdXBsZS5QYWlyKHJlczEudmFsdWVbMF0sIHJlczIudmFsdWVbMF0pLCByZXMyLnZhbHVlWzFdKSk7XG4gICAgICAgICAgICB9IGVsc2UgcmV0dXJuIFZhbGlkYXRpb24uRmFpbHVyZShUdXBsZS5UcmlwbGUobGFiZWwsIHJlczIudmFsdWVbMV0sIHJlczIudmFsdWVbMl0pKTtcbiAgICAgICAgfSBlbHNlIHJldHVybiBWYWxpZGF0aW9uLkZhaWx1cmUoVHVwbGUuVHJpcGxlKGxhYmVsLCByZXMxLnZhbHVlWzFdLCByZXMxLnZhbHVlWzJdKSk7XG4gICAgfSwgbGFiZWwpO1xufVxuXG4vLyB1c2luZyBiaW5kXG5leHBvcnQgZnVuY3Rpb24gYW5kVGhlbkJpbmQocDEsIHAyKSB7XG4gICAgcmV0dXJuIHAxLmJpbmQocGFyc2VkVmFsdWUxID0+IHtcbiAgICAgICAgcmV0dXJuIHAyLmJpbmQocGFyc2VkVmFsdWUyID0+IHtcbiAgICAgICAgICAgIHJldHVybiByZXR1cm5QKFR1cGxlLlBhaXIocGFyc2VkVmFsdWUxLCBwYXJzZWRWYWx1ZTIpKTtcbiAgICAgICAgfSk7XG4gICAgfSkuc2V0TGFiZWwocDEubGFiZWwgKyAnIGFuZFRoZW4gJyArIHAyLmxhYmVsKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG9yRWxzZShwMSwgcDIpIHtcbiAgICBjb25zdCBsYWJlbCA9IHAxLmxhYmVsICsgJyBvckVsc2UgJyArIHAyLmxhYmVsO1xuICAgIHJldHVybiBwYXJzZXIocG9zID0+IHtcbiAgICAgICAgY29uc3QgcmVzMSA9IHAxLnJ1bihwb3MpO1xuICAgICAgICBpZiAocmVzMS5pc1N1Y2Nlc3MpIHJldHVybiByZXMxO1xuICAgICAgICBjb25zdCByZXMyID0gcDIucnVuKHBvcyk7XG4gICAgICAgIGlmIChyZXMyLmlzU3VjY2VzcykgcmV0dXJuIHJlczI7XG4gICAgICAgIHJldHVybiBWYWxpZGF0aW9uLkZhaWx1cmUoVHVwbGUuVHJpcGxlKGxhYmVsLCByZXMyLnZhbHVlWzFdLCByZXMyLnZhbHVlWzJdKSk7XG4gICAgfSwgbGFiZWwpLnNldExhYmVsKGxhYmVsKTtcbn1cblxubGV0IF9mYWlsID0gcGFyc2VyKHBvcyA9PiBWYWxpZGF0aW9uLkZhaWx1cmUoVHVwbGUuVHJpcGxlKCdwYXJzaW5nIGZhaWxlZCcsICdfZmFpbCcsIHBvcykpKTtcblxuLy8gcmV0dXJuIG5ldXRyYWwgZWxlbWVudCBpbnN0ZWFkIG9mIG1lc3NhZ2VcbmxldCBfc3VjY2VlZCA9IHBhcnNlcihwb3MgPT4gVmFsaWRhdGlvbi5TdWNjZXNzKFR1cGxlLlBhaXIoVHVwbGUuUGFpcigncGFyc2luZyBzdWNjZWVkZWQnLCBwb3MpLCAnX3N1Y2NlZWQnKSkpO1xuXG5leHBvcnQgZnVuY3Rpb24gY2hvaWNlKHBhcnNlcnMpIHtcbiAgICByZXR1cm4gcGFyc2Vycy5yZWR1Y2VSaWdodCgocmVzdCwgY3VycikgPT4gb3JFbHNlKGN1cnIsIHJlc3QpLCBfZmFpbClcbiAgICAgICAgLnNldExhYmVsKCdjaG9pY2UgJyArIHBhcnNlcnMucmVkdWNlKChhY2MsIGN1cnIpID0+IGFjYyArICcvJyArIGN1cnIubGFiZWwsICcnKSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhbnlPZihjaGFyc0FycmF5KSB7XG4gICAgcmV0dXJuIGNob2ljZShjaGFyc0FycmF5Lm1hcChwY2hhcikpXG4gICAgICAgIC5zZXRMYWJlbCgnYW55T2YgJyArIGNoYXJzQXJyYXkucmVkdWNlKChhY2MsIGN1cnIpID0+IGFjYyArIGN1cnIsICcnKSk7XG59XG5cbmV4cG9ydCBjb25zdCBsb3dlcmNhc2VQID0gYW55T2YoWydhJywgJ2InLCAnYycsICdkJywgJ2UnLCAnZicsICdnJywgJ2gnLCAnaScsICdqJywgJ2snLCAnbCcsICdtJywgJ24nLCAnbycsICdwJywgJ3EnLCAncicsICdzJywgJ3QnLCAndScsICd2JywgJ3cnLCAneCcsICd5JywgJ3onLF0pLnNldExhYmVsKCdsb3dlcmNhc2VQJyk7XG5leHBvcnQgY29uc3QgdXBwZXJjYXNlUCA9IGFueU9mKFsnQScsICdCJywgJ0MnLCAnRCcsICdFJywgJ0YnLCAnRycsICdIJywgJ0knLCAnSicsICdLJywgJ0wnLCAnTScsICdOJywgJ08nLCAnUCcsICdRJywgJ1InLCAnUycsICdUJywgJ1UnLCAnVicsICdXJywgJ1gnLCAnWScsICdaJyxdKS5zZXRMYWJlbCgndXBwZXJjYXNlUCcpO1xuZXhwb3J0IGNvbnN0IGxldHRlclAgPSBsb3dlcmNhc2VQLm9yRWxzZSh1cHBlcmNhc2VQKS5zZXRMYWJlbCgnbGV0dGVyUCcpO1xuZXhwb3J0IGNvbnN0IGRpZ2l0UCA9IGFueU9mKFsnMCcsICcxJywgJzInLCAnMycsICc0JywgJzUnLCAnNicsICc3JywgJzgnLCAnOSddKS5zZXRMYWJlbCgnZGlnaXRQJyk7XG5leHBvcnQgY29uc3Qgd2hpdGVQID0gYW55T2YoWycgJywgJ1xcdCcsICdcXG4nLCAnXFxyJ10pLnNldExhYmVsKCd3aGl0ZVAnKTtcblxuZXhwb3J0IGZ1bmN0aW9uIGZtYXAoZmFiLCBwYXJzZXIxKSB7XG4gICAgY29uc3QgbGFiZWwgPSBwYXJzZXIxLmxhYmVsICsgJyBmbWFwICcgKyBmYWIudG9TdHJpbmcoKTtcbiAgICByZXR1cm4gcGFyc2VyKHBvcyA9PiB7XG4gICAgICAgIGxldCByZXMgPSBwYXJzZXIxLnJ1bihwb3MpO1xuICAgICAgICBpZiAocmVzLmlzU3VjY2VzcykgcmV0dXJuIFZhbGlkYXRpb24uU3VjY2VzcyhUdXBsZS5QYWlyKGZhYihyZXMudmFsdWVbMF0pLCByZXMudmFsdWVbMV0pKTtcbiAgICAgICAgcmV0dXJuIFZhbGlkYXRpb24uRmFpbHVyZShUdXBsZS5UcmlwbGUobGFiZWwsIHJlcy52YWx1ZVsxXSwgcmVzLnZhbHVlWzJdKSk7XG4gICAgfSwgbGFiZWwpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcmV0dXJuUCh2YWx1ZSkge1xuICAgIHJldHVybiBwYXJzZXIocG9zID0+IFZhbGlkYXRpb24uU3VjY2VzcyhUdXBsZS5QYWlyKHZhbHVlLCBwb3MpKSwgdmFsdWUpO1xufVxuXG4vLyBwYXJzZXIoYSAtPiBiKSAtPiBwYXJzZXIoYSkgLT4gcGFyc2VyKGIpXG5leHBvcnQgZnVuY3Rpb24gYXBwbHlQeChmUCkge1xuICAgIHJldHVybiBmdW5jdGlvbiAoeFApIHtcbiAgICAgICAgcmV0dXJuIGFuZFRoZW4oZlAsIHhQKS5mbWFwKChbZiwgeF0pID0+IGYoeCkpO1xuICAgIH07XG59XG5cbi8vIHVzaW5nIGJpbmRcbmV4cG9ydCBmdW5jdGlvbiBhcHBseVAoZlApIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKHhQKSB7XG4gICAgICAgIHJldHVybiBmUC5iaW5kKHBhcnNlZFZhbHVlZiA9PiB7XG4gICAgICAgICAgICByZXR1cm4geFAuYmluZChwYXJzZWRWYWx1ZXggPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiByZXR1cm5QKHBhcnNlZFZhbHVlZihwYXJzZWRWYWx1ZXgpKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbGlmdDIoZmFhYikge1xuICAgIHJldHVybiBmdW5jdGlvbiAocGFyc2VyMSkge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKHBhcnNlcjIpIHtcbiAgICAgICAgICAgIC8vcmV0dXJuIGFwcGx5UChhcHBseVAocmV0dXJuUChmYWFiKSkocGFyc2VyMSkpKHBhcnNlcjIpO1xuICAgICAgICAgICAgcmV0dXJuIHJldHVyblAoZmFhYikuYXBwbHkocGFyc2VyMSkuYXBwbHkocGFyc2VyMik7IC8vIHVzaW5nIGluc3RhbmNlIG1ldGhvZHNcbiAgICAgICAgfTtcbiAgICB9O1xufVxuXG4vLyB1c2luZyBsaWZ0Mihjb25zKVxuZXhwb3J0IGZ1bmN0aW9uIHNlcXVlbmNlUChwYXJzZXJzKSB7XG4gICAgcmV0dXJuIHBhcnNlcnNcbiAgICAgICAgLnJlZHVjZVJpZ2h0KChyZXN0LCBjdXJyKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gbGlmdDIoX2NvbnMpKGN1cnIpKHJlc3QpO1xuICAgICAgICB9LCByZXR1cm5QKFtdKSk7XG59XG5cbi8vIHVzaW5nIG5haXZlIGFuZFRoZW4gJiYgZm1hcCAtLT4gcmV0dXJucyBzdHJpbmdzLCBub3QgYXJyYXlzIVxuZXhwb3J0IGZ1bmN0aW9uIHNlcXVlbmNlUDIocGFyc2Vycykge1xuICAgIHJldHVybiBwYXJzZXJzXG4gICAgICAgIC5yZWR1Y2VSaWdodCgocmVzdCwgY3VycikgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIGZtYXAoKFt4LCB5XSkgPT4geCArIHksIGFuZFRoZW4oY3VyciwgcmVzdCkpO1xuICAgICAgICB9LCByZXR1cm5QKCcnKSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwc3RyaW5nKHN0cikge1xuICAgIHJldHVybiBzZXF1ZW5jZVAoc3RyLnNwbGl0KCcnKS5tYXAocGNoYXIpKVxuICAgICAgICAuc2V0TGFiZWwoJ3BzdHJpbmcgJyArIHN0cik7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB6ZXJvT3JNb3JlKHhQKSB7IC8vIHplcm9Pck1vcmUgOjogcCBhIC0+IFthXSAtPiB0cnkgW2FdID0gcCBhIC0+IHAgW2FdXG4gICAgcmV0dXJuIHBvcyA9PiB7XG4gICAgICAgIGxldCByZXMxID0geFAucnVuKHBvcyk7XG4gICAgICAgIGlmIChyZXMxLmlzRmFpbHVyZSkgcmV0dXJuIFZhbGlkYXRpb24uU3VjY2VzcyhUdXBsZS5QYWlyKFtdLCBwb3MpKTtcbiAgICAgICAgbGV0IHJlc04gPSB6ZXJvT3JNb3JlKHhQKShyZXMxLnZhbHVlWzFdKTtcbiAgICAgICAgcmV0dXJuIFZhbGlkYXRpb24uU3VjY2VzcyhUdXBsZS5QYWlyKFtyZXMxLnZhbHVlWzBdXS5jb25jYXQocmVzTi52YWx1ZVswXSksIHJlc04udmFsdWVbMV0pKTtcbiAgICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbWFueSh4UCwgdGltZXMpIHtcbiAgICBjb25zdCB0aW1lc19kZWZpbmVkID0gKHR5cGVvZiB0aW1lcyAhPT0gJ3VuZGVmaW5lZCcpO1xuICAgIGNvbnN0IGxhYmVsID0gJ21hbnkgJyArIHhQLmxhYmVsXG4gICAgICAgICsgKCh0aW1lc19kZWZpbmVkKSA/ICcgdGltZXM9JyArIHRpbWVzIDogJycpO1xuICAgIHJldHVybiBwYXJzZXIocG9zID0+IHtcbiAgICAgICAgY29uc3QgcmVzID0gemVyb09yTW9yZSh4UCkocG9zKTtcbiAgICAgICAgaWYgKHRpbWVzX2RlZmluZWQpIHsvL2RlYnVnZ2VyO1xuICAgICAgICAgICAgaWYgKHJlcy5pc0ZhaWx1cmUpIHJldHVybiByZXM7XG4gICAgICAgICAgICBjb25zdCByZXN1bHRMZW5ndGggPSByZXMudmFsdWVbMF0ubGVuZ3RoO1xuICAgICAgICAgICAgcmV0dXJuIChyZXN1bHRMZW5ndGggPT09IHRpbWVzKVxuICAgICAgICAgICAgICAgID8gcmVzXG4gICAgICAgICAgICAgICAgOiBWYWxpZGF0aW9uLkZhaWx1cmUoVHVwbGUuVHJpcGxlKGxhYmVsLCAndGltZXMgcGFyYW0gd2FudGVkICcgKyB0aW1lcyArICc7IGdvdCAnICsgcmVzdWx0TGVuZ3RoLCBwb3MpKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzO1xuICAgIH0sIGxhYmVsKS5zZXRMYWJlbChsYWJlbCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtYW55Q2hhcnMoeFAsIHRpbWVzKSB7XG4gICAgcmV0dXJuIG1hbnkoeFAsIHRpbWVzKVxuICAgICAgICAuZm1hcChhcnJhID0+IGFycmEuam9pbignJykpXG4gICAgICAgIC5zZXRMYWJlbCgnbWFueUNoYXJzICcgKyB4UC5sYWJlbFxuICAgICAgICAgICAgKyAoKHR5cGVvZiB0aW1lcyAhPT0gJ3VuZGVmaW5lZCcpID8gJyB0aW1lcz0nICsgdGltZXMgOiAnJykpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbWFueTEoeFApIHtcbiAgICBjb25zdCBsYWJlbCA9ICdtYW55MSAnICsgeFAubGFiZWw7XG4gICAgcmV0dXJuIHBhcnNlcihwb3MgPT4ge1xuICAgICAgICBsZXQgcmVzMSA9IHhQLnJ1bihwb3MpO1xuICAgICAgICBpZiAocmVzMS5pc0ZhaWx1cmUpIHJldHVybiByZXMxO1xuICAgICAgICBsZXQgcmVzTiA9IHplcm9Pck1vcmUoeFApKHJlczEudmFsdWVbMV0pO1xuICAgICAgICByZXR1cm4gVmFsaWRhdGlvbi5TdWNjZXNzKFR1cGxlLlBhaXIoW3JlczEudmFsdWVbMF1dLmNvbmNhdChyZXNOLnZhbHVlWzBdKSwgcmVzTi52YWx1ZVsxXSkpO1xuICAgIH0sIGxhYmVsKS5zZXRMYWJlbChsYWJlbCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtYW55Q2hhcnMxKHhQKSB7XG4gICAgcmV0dXJuIG1hbnkxKHhQKVxuICAgICAgICAuZm1hcChhcnJhID0+IGFycmEuam9pbignJykpXG4gICAgICAgIC5zZXRMYWJlbCgnbWFueUNoYXJzMSAnICsgeFAubGFiZWwpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gb3B0KHhQLCBkZWZhdWx0VmFsdWUpIHtcbiAgICBjb25zdCBpc0RlZmF1bHQgPSAodHlwZW9mIGRlZmF1bHRWYWx1ZSAhPT0gJ3VuZGVmaW5lZCcpO1xuICAgIGNvbnN0IGxhYmVsID0gJ29wdCAnICsgeFAubGFiZWxcbiAgICAgICAgKyAoaXNEZWZhdWx0ID8gJyhkZWZhdWx0PScgKyBkZWZhdWx0VmFsdWUgKyAnKScgOiAnJyk7XG4gICAgcmV0dXJuIHBhcnNlcihwb3MgPT4ge1xuICAgICAgICBsZXQgcmVzID0geFAuZm1hcChNYXliZS5KdXN0KS5ydW4ocG9zKTtcbiAgICAgICAgaWYgKHJlcy5pc1N1Y2Nlc3MpIHJldHVybiByZXM7XG4gICAgICAgIGxldCBvdXRjb21lID0gKGlzRGVmYXVsdCkgPyBNYXliZS5KdXN0KGRlZmF1bHRWYWx1ZSkgOiBNYXliZS5Ob3RoaW5nKCk7XG4gICAgICAgIHJldHVybiBWYWxpZGF0aW9uLlN1Y2Nlc3MoVHVwbGUuUGFpcihvdXRjb21lLCBwb3MpKTtcbiAgICB9LCBsYWJlbCkuc2V0TGFiZWwobGFiZWwpO1xufVxuXG4vLyBvcHQgZnJvbSB0aGUgYm9vayAtIHdvcmtzIG9rLCBidXQgdG9TdHJpbmcoKSBnaXZlcyBzdHJhbmdlIHJlc3VsdHNcbmV4cG9ydCBmdW5jdGlvbiBvcHRCb29rKHBYKSB7XG4gICAgY29uc3Qgc29tZVAgPSBwWC5mbWFwKE1heWJlLkp1c3QpO1xuICAgIGNvbnN0IG5vbmVQID0gcmV0dXJuUChNYXliZS5Ob3RoaW5nKTtcbiAgICByZXR1cm4gc29tZVAub3JFbHNlKG5vbmVQKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRpc2NhcmRTZWNvbmQocDEsIHAyKSB7XG4gICAgY29uc3QgbGFiZWwgPSBwMS5sYWJlbCArICcgZGlzY2FyZFNlY29uZCAnICsgcDIubGFiZWw7XG4gICAgcmV0dXJuIHBhcnNlcihwb3MgPT4ge1xuICAgICAgICByZXR1cm4gYW5kVGhlbihwMSwgcDIpLmZtYXAoKFt4LCB5XSkgPT4geCkucnVuKHBvcyk7XG4gICAgfSwgbGFiZWwpLnNldExhYmVsKGxhYmVsKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRpc2NhcmRGaXJzdChwMSwgcDIpIHtcbiAgICBjb25zdCBsYWJlbCA9IHAxLmxhYmVsICsgJyBkaXNjYXJkRmlyc3QgJyArIHAyLmxhYmVsO1xuICAgIHJldHVybiBwYXJzZXIocG9zID0+IHtcbiAgICAgICAgcmV0dXJuIGFuZFRoZW4ocDEsIHAyKS5mbWFwKChbeCwgeV0pID0+IHkpLnJ1bihwb3MpO1xuICAgIH0sIGxhYmVsKS5zZXRMYWJlbChsYWJlbCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzZXBCeTFCb29rKHB4LCBzZXApIHtcbiAgICByZXR1cm4gcHguYW5kVGhlbihtYW55KHNlcC5kaXNjYXJkRmlyc3QocHgpKSkuZm1hcCgoW3IsIHJsaXN0XSkgPT4gW3JdLmNvbmNhdChybGlzdCkpO1xufVxuXG4vLyBteSB2ZXJzaW9uIHdvcmtzIGp1c3QgZmluZS4uLlxuZXhwb3J0IGZ1bmN0aW9uIHNlcEJ5MSh2YWx1ZVAsIHNlcGFyYXRvclApIHtcbiAgICByZXR1cm4gbWFueShtYW55MSh2YWx1ZVApLmRpc2NhcmRTZWNvbmQob3B0KHNlcGFyYXRvclApKSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBiZXR3ZWVuKHAxLCBwMiwgcDMpIHtcbiAgICByZXR1cm4gcDEuZGlzY2FyZEZpcnN0KHAyKS5kaXNjYXJkU2Vjb25kKHAzKVxuICAgICAgICAuc2V0TGFiZWwoJ2JldHdlZW4gJyArIHAxLmxhYmVsICsgJy8nICsgcDIubGFiZWwgKyAnLycgKyBwMy5sYWJlbCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBiZXR3ZWVuUGFyZW5zKHB4KSB7XG4gICAgcmV0dXJuIGJldHdlZW4ocGNoYXIoJygnKSwgcHgsIHBjaGFyKCcpJykpXG4gICAgICAgIC5zZXRMYWJlbCgnYmV0d2VlblBhcmVucyAnICsgcHgubGFiZWwpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYmluZFAoZmFtYiwgcHgpIHtcbiAgICBsZXQgbGFiZWwgPSAndW5rbm93bic7XG4gICAgcmV0dXJuIHBhcnNlcihwb3MgPT4ge1xuICAgICAgICBjb25zdCByZXMgPSBweC5ydW4ocG9zKTtcbiAgICAgICAgaWYgKHJlcy5pc0ZhaWx1cmUpIHJldHVybiByZXM7XG4gICAgICAgIHJldHVybiBmYW1iKHJlcy52YWx1ZVswXSkucnVuKHJlcy52YWx1ZVsxXSk7XG4gICAgfSwgbGFiZWwpLnNldExhYmVsKGxhYmVsKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHRhcFAocHgsIGZuKSB7XG4gICAgcmV0dXJuIHB4LmJpbmQocmVzID0+IHtcbiAgICAgICAgZm4ocmVzKTtcbiAgICAgICAgcmV0dXJuIHJldHVyblAocmVzKTtcbiAgICB9KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGxvZ1AocHgpIHtcbiAgICByZXR1cm4gdGFwUChweCwgcmVzID0+IGNvbnNvbGUubG9nKHB4LmxhYmVsICsgJzonICsgcmVzKSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwd29yZCh3b3JkKSB7XG4gICAgcmV0dXJuIG9wdChtYW55KHdoaXRlUCkpXG4gICAgICAgIC5kaXNjYXJkRmlyc3QocHN0cmluZyh3b3JkKSlcbiAgICAgICAgLmRpc2NhcmRTZWNvbmQob3B0KG1hbnkod2hpdGVQKSkpXG4gICAgICAgIC5zZXRMYWJlbCgncHdvcmQgJyArIHdvcmQpO1xufVxuXG5mdW5jdGlvbiBfY29ucyh4KSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uICh4cykge1xuICAgICAgICByZXR1cm4gW3hdLmNvbmNhdCh4cyk7XG4gICAgfTtcbn1cblxuZnVuY3Rpb24gX3NldExhYmVsKHB4LCBuZXdMYWJlbCkge1xuICAgIHJldHVybiBwYXJzZXIocG9zID0+IHtcbiAgICAgICAgbGV0IHJlc3VsdCA9IHB4LnJ1bihwb3MpO1xuICAgICAgICBpZiAocmVzdWx0LmlzRmFpbHVyZSkgcmV0dXJuIFZhbGlkYXRpb24uRmFpbHVyZShUdXBsZS5UcmlwbGUobmV3TGFiZWwsIHJlc3VsdC52YWx1ZVsxXSwgcmVzdWx0LnZhbHVlWzJdKSk7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSwgbmV3TGFiZWwpO1xufVxuXG4vLyB0aGUgcmVhbCB0aGluZy4uLlxuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlcihmbiwgbGFiZWwpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICB0eXBlOiAncGFyc2VyJyxcbiAgICAgICAgbGFiZWw6IGxhYmVsLFxuICAgICAgICBydW4ocG9zKSB7XG4gICAgICAgICAgICByZXR1cm4gZm4ocG9zKTtcbiAgICAgICAgfSxcbiAgICAgICAgYXBwbHkocHgpIHtcbiAgICAgICAgICAgIHJldHVybiBhcHBseVAodGhpcykocHgpO1xuICAgICAgICAgICAgLy9yZXR1cm4gdGhpcy5iaW5kKGFuZFRoZW4odGhpcywgcHgpLmZtYXAoKFtmLCB4XSkgPT4gZih4KSkpLnJ1bjsgLy8gd2UgYXJlIHRoZSBmUFxuICAgICAgICB9LFxuICAgICAgICBmbWFwKGZhYikge1xuICAgICAgICAgICAgLy9yZXR1cm4gZm1hcChmYWIsIHRoaXMpO1xuICAgICAgICAgICAgLy9yZXR1cm4gYmluZFAocG9zID0+IHJldHVyblAoZmFiKHBvcykpLCB0aGlzKTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmJpbmQocGFyc2VkVmFsdWUgPT4gcmV0dXJuUChmYWIocGFyc2VkVmFsdWUpKSk7XG4gICAgICAgIH0sXG4gICAgICAgIGFuZFRoZW4ocHgpIHtcbiAgICAgICAgICAgIHJldHVybiBhbmRUaGVuKHRoaXMsIHB4KTtcbiAgICAgICAgfSxcbiAgICAgICAgb3JFbHNlKHB4KSB7XG4gICAgICAgICAgICByZXR1cm4gb3JFbHNlKHRoaXMsIHB4KTtcbiAgICAgICAgfSxcbiAgICAgICAgZGlzY2FyZEZpcnN0KHB4KSB7XG4gICAgICAgICAgICByZXR1cm4gZGlzY2FyZEZpcnN0KHRoaXMsIHB4KTtcbiAgICAgICAgfSxcbiAgICAgICAgZGlzY2FyZFNlY29uZChweCkge1xuICAgICAgICAgICAgcmV0dXJuIGRpc2NhcmRTZWNvbmQodGhpcywgcHgpO1xuICAgICAgICB9LFxuICAgICAgICBiaW5kKGZhbWIpIHtcbiAgICAgICAgICAgIHJldHVybiBiaW5kUChmYW1iLCB0aGlzKTtcbiAgICAgICAgfSxcbiAgICAgICAgc2V0TGFiZWwobmV3TGFiZWwpIHtcbiAgICAgICAgICAgIHJldHVybiBfc2V0TGFiZWwodGhpcywgbmV3TGFiZWwpO1xuICAgICAgICB9XG4gICAgfTtcbn1cbiJdfQ==