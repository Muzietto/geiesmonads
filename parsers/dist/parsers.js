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
    exports.trimP = trimP;
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
        return trimP(pstring(word)).setLabel('pword ' + word);
    }

    function trimP(pX) {
        return opt(many(whiteP)).discardFirst(pX).discardSecond(opt(many(whiteP))).setLabel('trim ' + pX.label);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2pzL3BhcnNlcnMuanMiXSwibmFtZXMiOlsicGNoYXIiLCJwZGlnaXQiLCJhbmRUaGVuQmluZCIsImNob2ljZSIsImFueU9mIiwiZm1hcCIsInJldHVyblAiLCJhcHBseVB4IiwiYXBwbHlQIiwibGlmdDIiLCJzZXF1ZW5jZVAiLCJzZXF1ZW5jZVAyIiwicHN0cmluZyIsInplcm9Pck1vcmUiLCJtYW55IiwibWFueUNoYXJzIiwibWFueTEiLCJtYW55Q2hhcnMxIiwib3B0Iiwib3B0Qm9vayIsInNlcEJ5MUJvb2siLCJzZXBCeTEiLCJiZXR3ZWVuIiwiYmV0d2VlblBhcmVucyIsImJpbmRQIiwidGFwUCIsImxvZ1AiLCJwd29yZCIsInRyaW1QIiwicGFyc2VyIiwiY2hhclBhcnNlciIsInBvcyIsImZyb21UZXh0Iiwib3B0Q2hhciIsImNoYXIiLCJpc05vdGhpbmciLCJGYWlsdXJlIiwiVHJpcGxlIiwidmFsdWUiLCJTdWNjZXNzIiwiUGFpciIsImluY3JQb3MiLCJkaWdpdFBhcnNlciIsInBhcnNlSW50IiwiZGlnaXQiLCJwcmVkaWNhdGVCYXNlZFBhcnNlciIsInByZWQiLCJsYWJlbCIsInJlc3VsdCIsInNldExhYmVsIiwiYW5kVGhlbiIsInAxIiwicDIiLCJyZXMxIiwicnVuIiwiaXNTdWNjZXNzIiwicmVzMiIsImJpbmQiLCJwYXJzZWRWYWx1ZTEiLCJwYXJzZWRWYWx1ZTIiLCJvckVsc2UiLCJfZmFpbCIsIl9zdWNjZWVkIiwicGFyc2VycyIsInJlZHVjZVJpZ2h0IiwicmVzdCIsImN1cnIiLCJyZWR1Y2UiLCJhY2MiLCJjaGFyc0FycmF5IiwibWFwIiwibG93ZXJjYXNlUCIsInVwcGVyY2FzZVAiLCJsZXR0ZXJQIiwiZGlnaXRQIiwid2hpdGVQIiwiZmFiIiwicGFyc2VyMSIsInRvU3RyaW5nIiwicmVzIiwiZlAiLCJ4UCIsImYiLCJ4IiwicGFyc2VkVmFsdWVmIiwicGFyc2VkVmFsdWV4IiwiZmFhYiIsInBhcnNlcjIiLCJhcHBseSIsIl9jb25zIiwieSIsInN0ciIsInNwbGl0IiwiaXNGYWlsdXJlIiwicmVzTiIsImNvbmNhdCIsInRpbWVzIiwidGltZXNfZGVmaW5lZCIsInJlc3VsdExlbmd0aCIsImxlbmd0aCIsImFycmEiLCJqb2luIiwiZGVmYXVsdFZhbHVlIiwiaXNEZWZhdWx0IiwiSnVzdCIsIm91dGNvbWUiLCJOb3RoaW5nIiwicFgiLCJzb21lUCIsIm5vbmVQIiwiZGlzY2FyZFNlY29uZCIsImRpc2NhcmRGaXJzdCIsInB4Iiwic2VwIiwiciIsInJsaXN0IiwidmFsdWVQIiwic2VwYXJhdG9yUCIsInAzIiwiZmFtYiIsImZuIiwiY29uc29sZSIsImxvZyIsIndvcmQiLCJ4cyIsIl9zZXRMYWJlbCIsIm5ld0xhYmVsIiwidHlwZSIsInBhcnNlZFZhbHVlIl0sIm1hcHBpbmdzIjoiOzs7Ozs7O1lBbUNnQkEsSyxHQUFBQSxLO1lBUUFDLE0sR0FBQUEsTTtZQWtCQUMsVyxHQUFBQSxXO1lBd0JBQyxNLEdBQUFBLE07WUFLQUMsSyxHQUFBQSxLO1lBV0FDLEksR0FBQUEsSTtZQVNBQyxPLEdBQUFBLE87WUFLQUMsTyxHQUFBQSxPO1lBT0FDLE0sR0FBQUEsTTtZQVVBQyxLLEdBQUFBLEs7WUFVQUMsUyxHQUFBQSxTO1lBUUFDLFUsR0FBQUEsVTtZQU9BQyxPLEdBQUFBLE87WUFLQUMsVSxHQUFBQSxVO1lBU0FDLEksR0FBQUEsSTtZQWlCQUMsUyxHQUFBQSxTO1lBT0FDLEssR0FBQUEsSztZQVVBQyxVLEdBQUFBLFU7WUFNQUMsRyxHQUFBQSxHO1lBYUFDLE8sR0FBQUEsTztZQW9CQUMsVSxHQUFBQSxVO1lBS0FDLE0sR0FBQUEsTTtZQUlBQyxPLEdBQUFBLE87WUFLQUMsYSxHQUFBQSxhO1lBS0FDLEssR0FBQUEsSztZQVNBQyxJLEdBQUFBLEk7WUFPQUMsSSxHQUFBQSxJO1lBSUFDLEssR0FBQUEsSztZQUtBQyxLLEdBQUFBLEs7WUFzQkFDLE0sR0FBQUEsTTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQS9TdUI7O0FBRXZDLFFBQU1DLGFBQWEsU0FBYkEsVUFBYTtBQUFBLGVBQVEsZUFBTztBQUM5QixnQkFBSSxPQUFPQyxHQUFQLEtBQWUsUUFBbkIsRUFBNkJBLE1BQU0sa0JBQVNDLFFBQVQsQ0FBa0JELEdBQWxCLENBQU47QUFDN0IsZ0JBQU1FLFVBQVVGLElBQUlHLElBQUosRUFBaEI7QUFDQSxnQkFBSUQsUUFBUUUsU0FBWixFQUF1QixPQUFPLHVCQUFXQyxPQUFYLENBQW1CLGVBQU1DLE1BQU4sQ0FBYSxZQUFiLEVBQTJCLGVBQTNCLEVBQTRDTixHQUE1QyxDQUFuQixDQUFQO0FBQ3ZCLGdCQUFJRSxRQUFRSyxLQUFSLEtBQWtCSixJQUF0QixFQUE0QixPQUFPLHVCQUFXSyxPQUFYLENBQW1CLGVBQU1DLElBQU4sQ0FBV04sSUFBWCxFQUFpQkgsSUFBSVUsT0FBSixFQUFqQixDQUFuQixDQUFQO0FBQzVCLG1CQUFPLHVCQUFXTCxPQUFYLENBQW1CLGVBQU1DLE1BQU4sQ0FBYSxZQUFiLEVBQTJCLFlBQVlILElBQVosR0FBbUIsUUFBbkIsR0FBOEJELFFBQVFLLEtBQWpFLEVBQXdFUCxHQUF4RSxDQUFuQixDQUFQO0FBQ0gsU0FOa0I7QUFBQSxLQUFuQjs7QUFRQSxRQUFNVyxjQUFjLFNBQWRBLFdBQWM7QUFBQSxlQUFTLGVBQU87QUFDaEMsZ0JBQUksT0FBT1gsR0FBUCxLQUFlLFFBQW5CLEVBQTZCQSxNQUFNLGtCQUFTQyxRQUFULENBQWtCRCxHQUFsQixDQUFOO0FBQzdCLGdCQUFNRSxVQUFVRixJQUFJRyxJQUFKLEVBQWhCO0FBQ0EsZ0JBQUlELFFBQVFFLFNBQVosRUFBdUIsT0FBTyx1QkFBV0MsT0FBWCxDQUFtQixlQUFNQyxNQUFOLENBQWEsYUFBYixFQUE0QixlQUE1QixFQUE2Q04sR0FBN0MsQ0FBbkIsQ0FBUDtBQUN2QixnQkFBSVksU0FBU1YsUUFBUUssS0FBakIsRUFBd0IsRUFBeEIsTUFBZ0NNLEtBQXBDLEVBQTJDLE9BQU8sdUJBQVdMLE9BQVgsQ0FBbUIsZUFBTUMsSUFBTixDQUFXSSxLQUFYLEVBQWtCYixJQUFJVSxPQUFKLEVBQWxCLENBQW5CLENBQVA7QUFDM0MsbUJBQU8sdUJBQVdMLE9BQVgsQ0FBbUIsZUFBTUMsTUFBTixDQUFhLGFBQWIsRUFBNEIsWUFBWU8sS0FBWixHQUFvQixRQUFwQixHQUErQlgsUUFBUUssS0FBbkUsRUFBMEVQLEdBQTFFLENBQW5CLENBQVA7QUFDSCxTQU5tQjtBQUFBLEtBQXBCOztBQVFBLFFBQU1jLHVCQUF1QixTQUF2QkEsb0JBQXVCLENBQUNDLElBQUQsRUFBT0MsS0FBUDtBQUFBLGVBQWlCLGVBQU87QUFDakQsZ0JBQUksT0FBT2hCLEdBQVAsS0FBZSxRQUFuQixFQUE2QkEsTUFBTSxrQkFBU0MsUUFBVCxDQUFrQkQsR0FBbEIsQ0FBTjtBQUM3QixnQkFBTUUsVUFBVUYsSUFBSUcsSUFBSixFQUFoQjtBQUNBLGdCQUFJRCxRQUFRRSxTQUFaLEVBQXVCLE9BQU8sdUJBQVdDLE9BQVgsQ0FBbUIsZUFBTUMsTUFBTixDQUFhVSxLQUFiLEVBQW9CLGVBQXBCLEVBQXFDaEIsR0FBckMsQ0FBbkIsQ0FBUDtBQUN2QixnQkFBSWUsS0FBS2IsUUFBUUssS0FBYixDQUFKLEVBQXlCLE9BQU8sdUJBQVdDLE9BQVgsQ0FBbUIsZUFBTUMsSUFBTixDQUFXUCxRQUFRSyxLQUFuQixFQUEwQlAsSUFBSVUsT0FBSixFQUExQixDQUFuQixDQUFQO0FBQ3pCLG1CQUFPLHVCQUFXTCxPQUFYLENBQW1CLGVBQU1DLE1BQU4sQ0FBYVUsS0FBYixFQUFvQixzQkFBc0JkLFFBQVFLLEtBQWxELEVBQXlEUCxHQUF6RCxDQUFuQixDQUFQO0FBQ0gsU0FONEI7QUFBQSxLQUE3Qjs7WUFRUUQsVSxHQUFBQSxVO1lBQVlZLFcsR0FBQUEsVztZQUFhRyxvQixHQUFBQSxvQjtBQUUxQixhQUFTN0MsS0FBVCxDQUFla0MsSUFBZixFQUFxQjtBQUN4QixZQUFNYSxRQUFRLFdBQVdiLElBQXpCO0FBQ0EsWUFBSWMsU0FBUyxTQUFUQSxNQUFTLENBQVVqQixHQUFWLEVBQWU7QUFDeEIsbUJBQU9ELFdBQVdJLElBQVgsRUFBaUJILEdBQWpCLENBQVA7QUFDSCxTQUZEO0FBR0EsZUFBT0YsT0FBT21CLE1BQVAsRUFBZUQsS0FBZixFQUFzQkUsUUFBdEIsQ0FBK0JGLEtBQS9CLENBQVA7QUFDSDs7QUFFTSxhQUFTOUMsTUFBVCxDQUFnQjJDLEtBQWhCLEVBQXVCO0FBQzFCLGVBQU9mLE9BQU87QUFBQSxtQkFBT2EsWUFBWUUsS0FBWixFQUFtQmIsR0FBbkIsQ0FBUDtBQUFBLFNBQVAsRUFBdUMsWUFBWWEsS0FBbkQsQ0FBUDtBQUNIOztBQUVNLGFBQVNNLFFBQVQsQ0FBaUJDLEVBQWpCLEVBQXFCQyxFQUFyQixFQUF5QjtBQUM1QixZQUFNTCxRQUFRSSxHQUFHSixLQUFILEdBQVcsV0FBWCxHQUF5QkssR0FBR0wsS0FBMUM7QUFDQSxlQUFPbEIsT0FBTyxVQUFVRSxHQUFWLEVBQWU7QUFDekIsZ0JBQUlzQixPQUFPRixHQUFHRyxHQUFILENBQU92QixHQUFQLENBQVg7QUFDQSxnQkFBSXNCLEtBQUtFLFNBQVQsRUFBb0I7QUFDaEIsb0JBQUlDLE9BQU9KLEdBQUdFLEdBQUgsQ0FBT0QsS0FBS2YsS0FBTCxDQUFXLENBQVgsQ0FBUCxDQUFYO0FBQ0Esb0JBQUlrQixLQUFLRCxTQUFULEVBQW9CO0FBQ2hCLDJCQUFPLHVCQUFXaEIsT0FBWCxDQUFtQixlQUFNQyxJQUFOLENBQVcsZUFBTUEsSUFBTixDQUFXYSxLQUFLZixLQUFMLENBQVcsQ0FBWCxDQUFYLEVBQTBCa0IsS0FBS2xCLEtBQUwsQ0FBVyxDQUFYLENBQTFCLENBQVgsRUFBcURrQixLQUFLbEIsS0FBTCxDQUFXLENBQVgsQ0FBckQsQ0FBbkIsQ0FBUDtBQUNILGlCQUZELE1BRU8sT0FBTyx1QkFBV0YsT0FBWCxDQUFtQixlQUFNQyxNQUFOLENBQWFVLEtBQWIsRUFBb0JTLEtBQUtsQixLQUFMLENBQVcsQ0FBWCxDQUFwQixFQUFtQ2tCLEtBQUtsQixLQUFMLENBQVcsQ0FBWCxDQUFuQyxDQUFuQixDQUFQO0FBQ1YsYUFMRCxNQUtPLE9BQU8sdUJBQVdGLE9BQVgsQ0FBbUIsZUFBTUMsTUFBTixDQUFhVSxLQUFiLEVBQW9CTSxLQUFLZixLQUFMLENBQVcsQ0FBWCxDQUFwQixFQUFtQ2UsS0FBS2YsS0FBTCxDQUFXLENBQVgsQ0FBbkMsQ0FBbkIsQ0FBUDtBQUNWLFNBUk0sRUFRSlMsS0FSSSxDQUFQO0FBU0g7O0FBRUQ7O0FBQ08sYUFBUzdDLFdBQVQsQ0FBcUJpRCxFQUFyQixFQUF5QkMsRUFBekIsRUFBNkI7QUFDaEMsZUFBT0QsR0FBR00sSUFBSCxDQUFRLHdCQUFnQjtBQUMzQixtQkFBT0wsR0FBR0ssSUFBSCxDQUFRLHdCQUFnQjtBQUMzQix1QkFBT25ELFFBQVEsZUFBTWtDLElBQU4sQ0FBV2tCLFlBQVgsRUFBeUJDLFlBQXpCLENBQVIsQ0FBUDtBQUNILGFBRk0sQ0FBUDtBQUdILFNBSk0sRUFJSlYsUUFKSSxDQUlLRSxHQUFHSixLQUFILEdBQVcsV0FBWCxHQUF5QkssR0FBR0wsS0FKakMsQ0FBUDtBQUtIOztBQUVNLGFBQVNhLE9BQVQsQ0FBZ0JULEVBQWhCLEVBQW9CQyxFQUFwQixFQUF3QjtBQUMzQixZQUFNTCxRQUFRSSxHQUFHSixLQUFILEdBQVcsVUFBWCxHQUF3QkssR0FBR0wsS0FBekM7QUFDQSxlQUFPbEIsT0FBTyxlQUFPO0FBQ2pCLGdCQUFNd0IsT0FBT0YsR0FBR0csR0FBSCxDQUFPdkIsR0FBUCxDQUFiO0FBQ0EsZ0JBQUlzQixLQUFLRSxTQUFULEVBQW9CLE9BQU9GLElBQVA7QUFDcEIsZ0JBQU1HLE9BQU9KLEdBQUdFLEdBQUgsQ0FBT3ZCLEdBQVAsQ0FBYjtBQUNBLGdCQUFJeUIsS0FBS0QsU0FBVCxFQUFvQixPQUFPQyxJQUFQO0FBQ3BCLG1CQUFPLHVCQUFXcEIsT0FBWCxDQUFtQixlQUFNQyxNQUFOLENBQWFVLEtBQWIsRUFBb0JTLEtBQUtsQixLQUFMLENBQVcsQ0FBWCxDQUFwQixFQUFtQ2tCLEtBQUtsQixLQUFMLENBQVcsQ0FBWCxDQUFuQyxDQUFuQixDQUFQO0FBQ0gsU0FOTSxFQU1KUyxLQU5JLEVBTUdFLFFBTkgsQ0FNWUYsS0FOWixDQUFQO0FBT0g7OztBQUVELFFBQUljLFFBQVFoQyxPQUFPO0FBQUEsZUFBTyx1QkFBV08sT0FBWCxDQUFtQixlQUFNQyxNQUFOLENBQWEsZ0JBQWIsRUFBK0IsT0FBL0IsRUFBd0NOLEdBQXhDLENBQW5CLENBQVA7QUFBQSxLQUFQLENBQVo7O0FBRUE7QUFDQSxRQUFJK0IsV0FBV2pDLE9BQU87QUFBQSxlQUFPLHVCQUFXVSxPQUFYLENBQW1CLGVBQU1DLElBQU4sQ0FBVyxlQUFNQSxJQUFOLENBQVcsbUJBQVgsRUFBZ0NULEdBQWhDLENBQVgsRUFBaUQsVUFBakQsQ0FBbkIsQ0FBUDtBQUFBLEtBQVAsQ0FBZjs7QUFFTyxhQUFTNUIsTUFBVCxDQUFnQjRELE9BQWhCLEVBQXlCO0FBQzVCLGVBQU9BLFFBQVFDLFdBQVIsQ0FBb0IsVUFBQ0MsSUFBRCxFQUFPQyxJQUFQO0FBQUEsbUJBQWdCTixRQUFPTSxJQUFQLEVBQWFELElBQWIsQ0FBaEI7QUFBQSxTQUFwQixFQUF3REosS0FBeEQsRUFDRlosUUFERSxDQUNPLFlBQVljLFFBQVFJLE1BQVIsQ0FBZSxVQUFDQyxHQUFELEVBQU1GLElBQU47QUFBQSxtQkFBZUUsTUFBTSxHQUFOLEdBQVlGLEtBQUtuQixLQUFoQztBQUFBLFNBQWYsRUFBc0QsRUFBdEQsQ0FEbkIsQ0FBUDtBQUVIOztBQUVNLGFBQVMzQyxLQUFULENBQWVpRSxVQUFmLEVBQTJCO0FBQzlCLGVBQU9sRSxPQUFPa0UsV0FBV0MsR0FBWCxDQUFldEUsS0FBZixDQUFQLEVBQ0ZpRCxRQURFLENBQ08sV0FBV29CLFdBQVdGLE1BQVgsQ0FBa0IsVUFBQ0MsR0FBRCxFQUFNRixJQUFOO0FBQUEsbUJBQWVFLE1BQU1GLElBQXJCO0FBQUEsU0FBbEIsRUFBNkMsRUFBN0MsQ0FEbEIsQ0FBUDtBQUVIOztBQUVNLFFBQU1LLGtDQUFhbkUsTUFBTSxDQUFDLEdBQUQsRUFBTSxHQUFOLEVBQVcsR0FBWCxFQUFnQixHQUFoQixFQUFxQixHQUFyQixFQUEwQixHQUExQixFQUErQixHQUEvQixFQUFvQyxHQUFwQyxFQUF5QyxHQUF6QyxFQUE4QyxHQUE5QyxFQUFtRCxHQUFuRCxFQUF3RCxHQUF4RCxFQUE2RCxHQUE3RCxFQUFrRSxHQUFsRSxFQUF1RSxHQUF2RSxFQUE0RSxHQUE1RSxFQUFpRixHQUFqRixFQUFzRixHQUF0RixFQUEyRixHQUEzRixFQUFnRyxHQUFoRyxFQUFxRyxHQUFyRyxFQUEwRyxHQUExRyxFQUErRyxHQUEvRyxFQUFvSCxHQUFwSCxFQUF5SCxHQUF6SCxFQUE4SCxHQUE5SCxDQUFOLEVBQTJJNkMsUUFBM0ksQ0FBb0osWUFBcEosQ0FBbkI7QUFDQSxRQUFNdUIsa0NBQWFwRSxNQUFNLENBQUMsR0FBRCxFQUFNLEdBQU4sRUFBVyxHQUFYLEVBQWdCLEdBQWhCLEVBQXFCLEdBQXJCLEVBQTBCLEdBQTFCLEVBQStCLEdBQS9CLEVBQW9DLEdBQXBDLEVBQXlDLEdBQXpDLEVBQThDLEdBQTlDLEVBQW1ELEdBQW5ELEVBQXdELEdBQXhELEVBQTZELEdBQTdELEVBQWtFLEdBQWxFLEVBQXVFLEdBQXZFLEVBQTRFLEdBQTVFLEVBQWlGLEdBQWpGLEVBQXNGLEdBQXRGLEVBQTJGLEdBQTNGLEVBQWdHLEdBQWhHLEVBQXFHLEdBQXJHLEVBQTBHLEdBQTFHLEVBQStHLEdBQS9HLEVBQW9ILEdBQXBILEVBQXlILEdBQXpILEVBQThILEdBQTlILENBQU4sRUFBMkk2QyxRQUEzSSxDQUFvSixZQUFwSixDQUFuQjtBQUNBLFFBQU13Qiw0QkFBVUYsV0FBV1gsTUFBWCxDQUFrQlksVUFBbEIsRUFBOEJ2QixRQUE5QixDQUF1QyxTQUF2QyxDQUFoQjtBQUNBLFFBQU15QiwwQkFBU3RFLE1BQU0sQ0FBQyxHQUFELEVBQU0sR0FBTixFQUFXLEdBQVgsRUFBZ0IsR0FBaEIsRUFBcUIsR0FBckIsRUFBMEIsR0FBMUIsRUFBK0IsR0FBL0IsRUFBb0MsR0FBcEMsRUFBeUMsR0FBekMsRUFBOEMsR0FBOUMsQ0FBTixFQUEwRDZDLFFBQTFELENBQW1FLFFBQW5FLENBQWY7QUFDQSxRQUFNMEIsMEJBQVN2RSxNQUFNLENBQUMsR0FBRCxFQUFNLElBQU4sRUFBWSxJQUFaLEVBQWtCLElBQWxCLENBQU4sRUFBK0I2QyxRQUEvQixDQUF3QyxRQUF4QyxDQUFmOztBQUVBLGFBQVM1QyxJQUFULENBQWN1RSxHQUFkLEVBQW1CQyxPQUFuQixFQUE0QjtBQUMvQixZQUFNOUIsUUFBUThCLFFBQVE5QixLQUFSLEdBQWdCLFFBQWhCLEdBQTJCNkIsSUFBSUUsUUFBSixFQUF6QztBQUNBLGVBQU9qRCxPQUFPLGVBQU87QUFDakIsZ0JBQUlrRCxNQUFNRixRQUFRdkIsR0FBUixDQUFZdkIsR0FBWixDQUFWO0FBQ0EsZ0JBQUlnRCxJQUFJeEIsU0FBUixFQUFtQixPQUFPLHVCQUFXaEIsT0FBWCxDQUFtQixlQUFNQyxJQUFOLENBQVdvQyxJQUFJRyxJQUFJekMsS0FBSixDQUFVLENBQVYsQ0FBSixDQUFYLEVBQThCeUMsSUFBSXpDLEtBQUosQ0FBVSxDQUFWLENBQTlCLENBQW5CLENBQVA7QUFDbkIsbUJBQU8sdUJBQVdGLE9BQVgsQ0FBbUIsZUFBTUMsTUFBTixDQUFhVSxLQUFiLEVBQW9CZ0MsSUFBSXpDLEtBQUosQ0FBVSxDQUFWLENBQXBCLEVBQWtDeUMsSUFBSXpDLEtBQUosQ0FBVSxDQUFWLENBQWxDLENBQW5CLENBQVA7QUFDSCxTQUpNLEVBSUpTLEtBSkksQ0FBUDtBQUtIOztBQUVNLGFBQVN6QyxPQUFULENBQWlCZ0MsS0FBakIsRUFBd0I7QUFDM0IsZUFBT1QsT0FBTztBQUFBLG1CQUFPLHVCQUFXVSxPQUFYLENBQW1CLGVBQU1DLElBQU4sQ0FBV0YsS0FBWCxFQUFrQlAsR0FBbEIsQ0FBbkIsQ0FBUDtBQUFBLFNBQVAsRUFBMERPLEtBQTFELENBQVA7QUFDSDs7QUFFRDtBQUNPLGFBQVMvQixPQUFULENBQWlCeUUsRUFBakIsRUFBcUI7QUFDeEIsZUFBTyxVQUFVQyxFQUFWLEVBQWM7QUFDakIsbUJBQU8vQixTQUFROEIsRUFBUixFQUFZQyxFQUFaLEVBQWdCNUUsSUFBaEIsQ0FBcUI7QUFBQTtBQUFBLG9CQUFFNkUsQ0FBRjtBQUFBLG9CQUFLQyxDQUFMOztBQUFBLHVCQUFZRCxFQUFFQyxDQUFGLENBQVo7QUFBQSxhQUFyQixDQUFQO0FBQ0gsU0FGRDtBQUdIOztBQUVEO0FBQ08sYUFBUzNFLE1BQVQsQ0FBZ0J3RSxFQUFoQixFQUFvQjtBQUN2QixlQUFPLFVBQVVDLEVBQVYsRUFBYztBQUNqQixtQkFBT0QsR0FBR3ZCLElBQUgsQ0FBUSx3QkFBZ0I7QUFDM0IsdUJBQU93QixHQUFHeEIsSUFBSCxDQUFRLHdCQUFnQjtBQUMzQiwyQkFBT25ELFFBQVE4RSxhQUFhQyxZQUFiLENBQVIsQ0FBUDtBQUNILGlCQUZNLENBQVA7QUFHSCxhQUpNLENBQVA7QUFLSCxTQU5EO0FBT0g7O0FBRU0sYUFBUzVFLEtBQVQsQ0FBZTZFLElBQWYsRUFBcUI7QUFDeEIsZUFBTyxVQUFVVCxPQUFWLEVBQW1CO0FBQ3RCLG1CQUFPLFVBQVVVLE9BQVYsRUFBbUI7QUFDdEI7QUFDQSx1QkFBT2pGLFFBQVFnRixJQUFSLEVBQWNFLEtBQWQsQ0FBb0JYLE9BQXBCLEVBQTZCVyxLQUE3QixDQUFtQ0QsT0FBbkMsQ0FBUCxDQUZzQixDQUU4QjtBQUN2RCxhQUhEO0FBSUgsU0FMRDtBQU1IOztBQUVEO0FBQ08sYUFBUzdFLFNBQVQsQ0FBbUJxRCxPQUFuQixFQUE0QjtBQUMvQixlQUFPQSxRQUNGQyxXQURFLENBQ1UsVUFBQ0MsSUFBRCxFQUFPQyxJQUFQLEVBQWdCO0FBQ3pCLG1CQUFPekQsTUFBTWdGLEtBQU4sRUFBYXZCLElBQWIsRUFBbUJELElBQW5CLENBQVA7QUFDSCxTQUhFLEVBR0EzRCxRQUFRLEVBQVIsQ0FIQSxDQUFQO0FBSUg7O0FBRUQ7QUFDTyxhQUFTSyxVQUFULENBQW9Cb0QsT0FBcEIsRUFBNkI7QUFDaEMsZUFBT0EsUUFDRkMsV0FERSxDQUNVLFVBQUNDLElBQUQsRUFBT0MsSUFBUCxFQUFnQjtBQUN6QixtQkFBTzdELEtBQUs7QUFBQTtBQUFBLG9CQUFFOEUsQ0FBRjtBQUFBLG9CQUFLTyxDQUFMOztBQUFBLHVCQUFZUCxJQUFJTyxDQUFoQjtBQUFBLGFBQUwsRUFBd0J4QyxTQUFRZ0IsSUFBUixFQUFjRCxJQUFkLENBQXhCLENBQVA7QUFDSCxTQUhFLEVBR0EzRCxRQUFRLEVBQVIsQ0FIQSxDQUFQO0FBSUg7O0FBRU0sYUFBU00sT0FBVCxDQUFpQitFLEdBQWpCLEVBQXNCO0FBQ3pCLGVBQU9qRixVQUFVaUYsSUFBSUMsS0FBSixDQUFVLEVBQVYsRUFBY3RCLEdBQWQsQ0FBa0J0RSxLQUFsQixDQUFWLEVBQ0ZpRCxRQURFLENBQ08sYUFBYTBDLEdBRHBCLENBQVA7QUFFSDs7QUFFTSxhQUFTOUUsVUFBVCxDQUFvQm9FLEVBQXBCLEVBQXdCO0FBQUU7QUFDN0IsZUFBTyxlQUFPO0FBQ1YsZ0JBQUk1QixPQUFPNEIsR0FBRzNCLEdBQUgsQ0FBT3ZCLEdBQVAsQ0FBWDtBQUNBLGdCQUFJc0IsS0FBS3dDLFNBQVQsRUFBb0IsT0FBTyx1QkFBV3RELE9BQVgsQ0FBbUIsZUFBTUMsSUFBTixDQUFXLEVBQVgsRUFBZVQsR0FBZixDQUFuQixDQUFQO0FBQ3BCLGdCQUFJK0QsT0FBT2pGLFdBQVdvRSxFQUFYLEVBQWU1QixLQUFLZixLQUFMLENBQVcsQ0FBWCxDQUFmLENBQVg7QUFDQSxtQkFBTyx1QkFBV0MsT0FBWCxDQUFtQixlQUFNQyxJQUFOLENBQVcsQ0FBQ2EsS0FBS2YsS0FBTCxDQUFXLENBQVgsQ0FBRCxFQUFnQnlELE1BQWhCLENBQXVCRCxLQUFLeEQsS0FBTCxDQUFXLENBQVgsQ0FBdkIsQ0FBWCxFQUFrRHdELEtBQUt4RCxLQUFMLENBQVcsQ0FBWCxDQUFsRCxDQUFuQixDQUFQO0FBQ0gsU0FMRDtBQU1IOztBQUVNLGFBQVN4QixJQUFULENBQWNtRSxFQUFkLEVBQWtCZSxLQUFsQixFQUF5QjtBQUM1QixZQUFNQyxnQkFBaUIsT0FBT0QsS0FBUCxLQUFpQixXQUF4QztBQUNBLFlBQU1qRCxRQUFRLFVBQVVrQyxHQUFHbEMsS0FBYixJQUNOa0QsYUFBRCxHQUFrQixZQUFZRCxLQUE5QixHQUFzQyxFQUQvQixDQUFkO0FBRUEsZUFBT25FLE9BQU8sZUFBTztBQUNqQixnQkFBTWtELE1BQU1sRSxXQUFXb0UsRUFBWCxFQUFlbEQsR0FBZixDQUFaO0FBQ0EsZ0JBQUlrRSxhQUFKLEVBQW1CO0FBQUM7QUFDaEIsb0JBQUlsQixJQUFJYyxTQUFSLEVBQW1CLE9BQU9kLEdBQVA7QUFDbkIsb0JBQU1tQixlQUFlbkIsSUFBSXpDLEtBQUosQ0FBVSxDQUFWLEVBQWE2RCxNQUFsQztBQUNBLHVCQUFRRCxpQkFBaUJGLEtBQWxCLEdBQ0RqQixHQURDLEdBRUQsdUJBQVczQyxPQUFYLENBQW1CLGVBQU1DLE1BQU4sQ0FBYVUsS0FBYixFQUFvQix3QkFBd0JpRCxLQUF4QixHQUFnQyxRQUFoQyxHQUEyQ0UsWUFBL0QsRUFBNkVuRSxHQUE3RSxDQUFuQixDQUZOO0FBR0g7QUFDRCxtQkFBT2dELEdBQVA7QUFDSCxTQVZNLEVBVUpoQyxLQVZJLEVBVUdFLFFBVkgsQ0FVWUYsS0FWWixDQUFQO0FBV0g7O0FBRU0sYUFBU2hDLFNBQVQsQ0FBbUJrRSxFQUFuQixFQUF1QmUsS0FBdkIsRUFBOEI7QUFDakMsZUFBT2xGLEtBQUttRSxFQUFMLEVBQVNlLEtBQVQsRUFDRjNGLElBREUsQ0FDRztBQUFBLG1CQUFRK0YsS0FBS0MsSUFBTCxDQUFVLEVBQVYsQ0FBUjtBQUFBLFNBREgsRUFFRnBELFFBRkUsQ0FFTyxlQUFlZ0MsR0FBR2xDLEtBQWxCLElBQ0YsT0FBT2lELEtBQVAsS0FBaUIsV0FBbEIsR0FBaUMsWUFBWUEsS0FBN0MsR0FBcUQsRUFEbEQsQ0FGUCxDQUFQO0FBSUg7O0FBRU0sYUFBU2hGLEtBQVQsQ0FBZWlFLEVBQWYsRUFBbUI7QUFDdEIsWUFBTWxDLFFBQVEsV0FBV2tDLEdBQUdsQyxLQUE1QjtBQUNBLGVBQU9sQixPQUFPLGVBQU87QUFDakIsZ0JBQUl3QixPQUFPNEIsR0FBRzNCLEdBQUgsQ0FBT3ZCLEdBQVAsQ0FBWDtBQUNBLGdCQUFJc0IsS0FBS3dDLFNBQVQsRUFBb0IsT0FBT3hDLElBQVA7QUFDcEIsZ0JBQUl5QyxPQUFPakYsV0FBV29FLEVBQVgsRUFBZTVCLEtBQUtmLEtBQUwsQ0FBVyxDQUFYLENBQWYsQ0FBWDtBQUNBLG1CQUFPLHVCQUFXQyxPQUFYLENBQW1CLGVBQU1DLElBQU4sQ0FBVyxDQUFDYSxLQUFLZixLQUFMLENBQVcsQ0FBWCxDQUFELEVBQWdCeUQsTUFBaEIsQ0FBdUJELEtBQUt4RCxLQUFMLENBQVcsQ0FBWCxDQUF2QixDQUFYLEVBQWtEd0QsS0FBS3hELEtBQUwsQ0FBVyxDQUFYLENBQWxELENBQW5CLENBQVA7QUFDSCxTQUxNLEVBS0pTLEtBTEksRUFLR0UsUUFMSCxDQUtZRixLQUxaLENBQVA7QUFNSDs7QUFFTSxhQUFTOUIsVUFBVCxDQUFvQmdFLEVBQXBCLEVBQXdCO0FBQzNCLGVBQU9qRSxNQUFNaUUsRUFBTixFQUNGNUUsSUFERSxDQUNHO0FBQUEsbUJBQVErRixLQUFLQyxJQUFMLENBQVUsRUFBVixDQUFSO0FBQUEsU0FESCxFQUVGcEQsUUFGRSxDQUVPLGdCQUFnQmdDLEdBQUdsQyxLQUYxQixDQUFQO0FBR0g7O0FBRU0sYUFBUzdCLEdBQVQsQ0FBYStELEVBQWIsRUFBaUJxQixZQUFqQixFQUErQjtBQUNsQyxZQUFNQyxZQUFhLE9BQU9ELFlBQVAsS0FBd0IsV0FBM0M7QUFDQSxZQUFNdkQsUUFBUSxTQUFTa0MsR0FBR2xDLEtBQVosSUFDUHdELFlBQVksY0FBY0QsWUFBZCxHQUE2QixHQUF6QyxHQUErQyxFQUR4QyxDQUFkO0FBRUEsZUFBT3pFLE9BQU8sZUFBTztBQUNqQixnQkFBSWtELE1BQU1FLEdBQUc1RSxJQUFILENBQVEsYUFBTW1HLElBQWQsRUFBb0JsRCxHQUFwQixDQUF3QnZCLEdBQXhCLENBQVY7QUFDQSxnQkFBSWdELElBQUl4QixTQUFSLEVBQW1CLE9BQU93QixHQUFQO0FBQ25CLGdCQUFJMEIsVUFBV0YsU0FBRCxHQUFjLGFBQU1DLElBQU4sQ0FBV0YsWUFBWCxDQUFkLEdBQXlDLGFBQU1JLE9BQU4sRUFBdkQ7QUFDQSxtQkFBTyx1QkFBV25FLE9BQVgsQ0FBbUIsZUFBTUMsSUFBTixDQUFXaUUsT0FBWCxFQUFvQjFFLEdBQXBCLENBQW5CLENBQVA7QUFDSCxTQUxNLEVBS0pnQixLQUxJLEVBS0dFLFFBTEgsQ0FLWUYsS0FMWixDQUFQO0FBTUg7O0FBRUQ7QUFDTyxhQUFTNUIsT0FBVCxDQUFpQndGLEVBQWpCLEVBQXFCO0FBQ3hCLFlBQU1DLFFBQVFELEdBQUd0RyxJQUFILENBQVEsYUFBTW1HLElBQWQsQ0FBZDtBQUNBLFlBQU1LLFFBQVF2RyxRQUFRLGFBQU1vRyxPQUFkLENBQWQ7QUFDQSxlQUFPRSxNQUFNaEQsTUFBTixDQUFhaUQsS0FBYixDQUFQO0FBQ0g7O0FBRU0sYUFBU0MsY0FBVCxDQUF1QjNELEVBQXZCLEVBQTJCQyxFQUEzQixFQUErQjtBQUNsQyxZQUFNTCxRQUFRSSxHQUFHSixLQUFILEdBQVcsaUJBQVgsR0FBK0JLLEdBQUdMLEtBQWhEO0FBQ0EsZUFBT2xCLE9BQU8sZUFBTztBQUNqQixtQkFBT3FCLFNBQVFDLEVBQVIsRUFBWUMsRUFBWixFQUFnQi9DLElBQWhCLENBQXFCO0FBQUE7QUFBQSxvQkFBRThFLENBQUY7QUFBQSxvQkFBS08sQ0FBTDs7QUFBQSx1QkFBWVAsQ0FBWjtBQUFBLGFBQXJCLEVBQW9DN0IsR0FBcEMsQ0FBd0N2QixHQUF4QyxDQUFQO0FBQ0gsU0FGTSxFQUVKZ0IsS0FGSSxFQUVHRSxRQUZILENBRVlGLEtBRlosQ0FBUDtBQUdIOzs7QUFFTSxhQUFTZ0UsYUFBVCxDQUFzQjVELEVBQXRCLEVBQTBCQyxFQUExQixFQUE4QjtBQUNqQyxZQUFNTCxRQUFRSSxHQUFHSixLQUFILEdBQVcsZ0JBQVgsR0FBOEJLLEdBQUdMLEtBQS9DO0FBQ0EsZUFBT2xCLE9BQU8sZUFBTztBQUNqQixtQkFBT3FCLFNBQVFDLEVBQVIsRUFBWUMsRUFBWixFQUFnQi9DLElBQWhCLENBQXFCO0FBQUE7QUFBQSxvQkFBRThFLENBQUY7QUFBQSxvQkFBS08sQ0FBTDs7QUFBQSx1QkFBWUEsQ0FBWjtBQUFBLGFBQXJCLEVBQW9DcEMsR0FBcEMsQ0FBd0N2QixHQUF4QyxDQUFQO0FBQ0gsU0FGTSxFQUVKZ0IsS0FGSSxFQUVHRSxRQUZILENBRVlGLEtBRlosQ0FBUDtBQUdIOzs7QUFFTSxhQUFTM0IsVUFBVCxDQUFvQjRGLEVBQXBCLEVBQXdCQyxHQUF4QixFQUE2QjtBQUNoQyxlQUFPRCxHQUFHOUQsT0FBSCxDQUFXcEMsS0FBS21HLElBQUlGLFlBQUosQ0FBaUJDLEVBQWpCLENBQUwsQ0FBWCxFQUF1QzNHLElBQXZDLENBQTRDO0FBQUE7QUFBQSxnQkFBRTZHLENBQUY7QUFBQSxnQkFBS0MsS0FBTDs7QUFBQSxtQkFBZ0IsQ0FBQ0QsQ0FBRCxFQUFJbkIsTUFBSixDQUFXb0IsS0FBWCxDQUFoQjtBQUFBLFNBQTVDLENBQVA7QUFDSDs7QUFFRDtBQUNPLGFBQVM5RixNQUFULENBQWdCK0YsTUFBaEIsRUFBd0JDLFVBQXhCLEVBQW9DO0FBQ3ZDLGVBQU92RyxLQUFLRSxNQUFNb0csTUFBTixFQUFjTixhQUFkLENBQTRCNUYsSUFBSW1HLFVBQUosQ0FBNUIsQ0FBTCxDQUFQO0FBQ0g7O0FBRU0sYUFBUy9GLE9BQVQsQ0FBaUI2QixFQUFqQixFQUFxQkMsRUFBckIsRUFBeUJrRSxFQUF6QixFQUE2QjtBQUNoQyxlQUFPbkUsR0FBRzRELFlBQUgsQ0FBZ0IzRCxFQUFoQixFQUFvQjBELGFBQXBCLENBQWtDUSxFQUFsQyxFQUNGckUsUUFERSxDQUNPLGFBQWFFLEdBQUdKLEtBQWhCLEdBQXdCLEdBQXhCLEdBQThCSyxHQUFHTCxLQUFqQyxHQUF5QyxHQUF6QyxHQUErQ3VFLEdBQUd2RSxLQUR6RCxDQUFQO0FBRUg7O0FBRU0sYUFBU3hCLGFBQVQsQ0FBdUJ5RixFQUF2QixFQUEyQjtBQUM5QixlQUFPMUYsUUFBUXRCLE1BQU0sR0FBTixDQUFSLEVBQW9CZ0gsRUFBcEIsRUFBd0JoSCxNQUFNLEdBQU4sQ0FBeEIsRUFDRmlELFFBREUsQ0FDTyxtQkFBbUIrRCxHQUFHakUsS0FEN0IsQ0FBUDtBQUVIOztBQUVNLGFBQVN2QixLQUFULENBQWUrRixJQUFmLEVBQXFCUCxFQUFyQixFQUF5QjtBQUM1QixZQUFJakUsUUFBUSxTQUFaO0FBQ0EsZUFBT2xCLE9BQU8sZUFBTztBQUNqQixnQkFBTWtELE1BQU1pQyxHQUFHMUQsR0FBSCxDQUFPdkIsR0FBUCxDQUFaO0FBQ0EsZ0JBQUlnRCxJQUFJYyxTQUFSLEVBQW1CLE9BQU9kLEdBQVA7QUFDbkIsbUJBQU93QyxLQUFLeEMsSUFBSXpDLEtBQUosQ0FBVSxDQUFWLENBQUwsRUFBbUJnQixHQUFuQixDQUF1QnlCLElBQUl6QyxLQUFKLENBQVUsQ0FBVixDQUF2QixDQUFQO0FBQ0gsU0FKTSxFQUlKUyxLQUpJLEVBSUdFLFFBSkgsQ0FJWUYsS0FKWixDQUFQO0FBS0g7O0FBRU0sYUFBU3RCLElBQVQsQ0FBY3VGLEVBQWQsRUFBa0JRLEVBQWxCLEVBQXNCO0FBQ3pCLGVBQU9SLEdBQUd2RCxJQUFILENBQVEsZUFBTztBQUNsQitELGVBQUd6QyxHQUFIO0FBQ0EsbUJBQU96RSxRQUFReUUsR0FBUixDQUFQO0FBQ0gsU0FITSxDQUFQO0FBSUg7O0FBRU0sYUFBU3JELElBQVQsQ0FBY3NGLEVBQWQsRUFBa0I7QUFDckIsZUFBT3ZGLEtBQUt1RixFQUFMLEVBQVM7QUFBQSxtQkFBT1MsUUFBUUMsR0FBUixDQUFZVixHQUFHakUsS0FBSCxHQUFXLEdBQVgsR0FBaUJnQyxHQUE3QixDQUFQO0FBQUEsU0FBVCxDQUFQO0FBQ0g7O0FBRU0sYUFBU3BELEtBQVQsQ0FBZWdHLElBQWYsRUFBcUI7QUFDeEIsZUFBTy9GLE1BQU1oQixRQUFRK0csSUFBUixDQUFOLEVBQ0YxRSxRQURFLENBQ08sV0FBVzBFLElBRGxCLENBQVA7QUFFSDs7QUFFTSxhQUFTL0YsS0FBVCxDQUFlK0UsRUFBZixFQUFtQjtBQUN0QixlQUFPekYsSUFBSUosS0FBSzZELE1BQUwsQ0FBSixFQUNGb0MsWUFERSxDQUNXSixFQURYLEVBRUZHLGFBRkUsQ0FFWTVGLElBQUlKLEtBQUs2RCxNQUFMLENBQUosQ0FGWixFQUdGMUIsUUFIRSxDQUdPLFVBQVUwRCxHQUFHNUQsS0FIcEIsQ0FBUDtBQUlIOztBQUVELGFBQVMwQyxLQUFULENBQWVOLENBQWYsRUFBa0I7QUFDZCxlQUFPLFVBQVV5QyxFQUFWLEVBQWM7QUFDakIsbUJBQU8sQ0FBQ3pDLENBQUQsRUFBSVksTUFBSixDQUFXNkIsRUFBWCxDQUFQO0FBQ0gsU0FGRDtBQUdIOztBQUVELGFBQVNDLFNBQVQsQ0FBbUJiLEVBQW5CLEVBQXVCYyxRQUF2QixFQUFpQztBQUM3QixlQUFPakcsT0FBTyxlQUFPO0FBQ2pCLGdCQUFJbUIsU0FBU2dFLEdBQUcxRCxHQUFILENBQU92QixHQUFQLENBQWI7QUFDQSxnQkFBSWlCLE9BQU82QyxTQUFYLEVBQXNCLE9BQU8sdUJBQVd6RCxPQUFYLENBQW1CLGVBQU1DLE1BQU4sQ0FBYXlGLFFBQWIsRUFBdUI5RSxPQUFPVixLQUFQLENBQWEsQ0FBYixDQUF2QixFQUF3Q1UsT0FBT1YsS0FBUCxDQUFhLENBQWIsQ0FBeEMsQ0FBbkIsQ0FBUDtBQUN0QixtQkFBT1UsTUFBUDtBQUNILFNBSk0sRUFJSjhFLFFBSkksQ0FBUDtBQUtIOztBQUVEO0FBQ08sYUFBU2pHLE1BQVQsQ0FBZ0IyRixFQUFoQixFQUFvQnpFLEtBQXBCLEVBQTJCO0FBQzlCLGVBQU87QUFDSGdGLGtCQUFNLFFBREg7QUFFSGhGLG1CQUFPQSxLQUZKO0FBR0hPLGVBSEcsZUFHQ3ZCLEdBSEQsRUFHTTtBQUNMLHVCQUFPeUYsR0FBR3pGLEdBQUgsQ0FBUDtBQUNILGFBTEU7QUFNSHlELGlCQU5HLGlCQU1Hd0IsRUFOSCxFQU1PO0FBQ04sdUJBQU94RyxPQUFPLElBQVAsRUFBYXdHLEVBQWIsQ0FBUDtBQUNBO0FBQ0gsYUFURTtBQVVIM0csZ0JBVkcsZ0JBVUV1RSxHQVZGLEVBVU87QUFDTjtBQUNBO0FBQ0EsdUJBQU8sS0FBS25CLElBQUwsQ0FBVTtBQUFBLDJCQUFlbkQsUUFBUXNFLElBQUlvRCxXQUFKLENBQVIsQ0FBZjtBQUFBLGlCQUFWLENBQVA7QUFDSCxhQWRFO0FBZUg5RSxtQkFmRyxtQkFlSzhELEVBZkwsRUFlUztBQUNSLHVCQUFPOUQsU0FBUSxJQUFSLEVBQWM4RCxFQUFkLENBQVA7QUFDSCxhQWpCRTtBQWtCSHBELGtCQWxCRyxrQkFrQklvRCxFQWxCSixFQWtCUTtBQUNQLHVCQUFPcEQsUUFBTyxJQUFQLEVBQWFvRCxFQUFiLENBQVA7QUFDSCxhQXBCRTtBQXFCSEQsd0JBckJHLHdCQXFCVUMsRUFyQlYsRUFxQmM7QUFDYix1QkFBT0QsY0FBYSxJQUFiLEVBQW1CQyxFQUFuQixDQUFQO0FBQ0gsYUF2QkU7QUF3QkhGLHlCQXhCRyx5QkF3QldFLEVBeEJYLEVBd0JlO0FBQ2QsdUJBQU9GLGVBQWMsSUFBZCxFQUFvQkUsRUFBcEIsQ0FBUDtBQUNILGFBMUJFO0FBMkJIdkQsZ0JBM0JHLGdCQTJCRThELElBM0JGLEVBMkJRO0FBQ1AsdUJBQU8vRixNQUFNK0YsSUFBTixFQUFZLElBQVosQ0FBUDtBQUNILGFBN0JFO0FBOEJIdEUsb0JBOUJHLG9CQThCTTZFLFFBOUJOLEVBOEJnQjtBQUNmLHVCQUFPRCxVQUFVLElBQVYsRUFBZ0JDLFFBQWhCLENBQVA7QUFDSDtBQWhDRSxTQUFQO0FBa0NIIiwiZmlsZSI6InBhcnNlcnMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBjZnIuIFwiVW5kZXJzdGFuZGluZyBQYXJzZXIgQ29tYmluYXRvcnNcIiAoRiMgZm9yIEZ1biBhbmQgUHJvZml0KVxuXG5pbXBvcnQge1xuICAgIFR1cGxlLFxuICAgIFBvc2l0aW9uLFxufSBmcm9tICdjbGFzc2VzJztcbmltcG9ydCB7TWF5YmV9IGZyb20gJ21heWJlJzsgLy8gSnVzdCBvciBOb3RoaW5nXG5pbXBvcnQge1ZhbGlkYXRpb259IGZyb20gJ3ZhbGlkYXRpb24nOyAvLyBTdWNjZXNzIG9yIEZhaWx1cmVcblxuY29uc3QgY2hhclBhcnNlciA9IGNoYXIgPT4gcG9zID0+IHtcbiAgICBpZiAodHlwZW9mIHBvcyA9PT0gJ3N0cmluZycpIHBvcyA9IFBvc2l0aW9uLmZyb21UZXh0KHBvcyk7XG4gICAgY29uc3Qgb3B0Q2hhciA9IHBvcy5jaGFyKCk7XG4gICAgaWYgKG9wdENoYXIuaXNOb3RoaW5nKSByZXR1cm4gVmFsaWRhdGlvbi5GYWlsdXJlKFR1cGxlLlRyaXBsZSgnY2hhclBhcnNlcicsICdubyBtb3JlIGlucHV0JywgcG9zKSk7XG4gICAgaWYgKG9wdENoYXIudmFsdWUgPT09IGNoYXIpIHJldHVybiBWYWxpZGF0aW9uLlN1Y2Nlc3MoVHVwbGUuUGFpcihjaGFyLCBwb3MuaW5jclBvcygpKSk7XG4gICAgcmV0dXJuIFZhbGlkYXRpb24uRmFpbHVyZShUdXBsZS5UcmlwbGUoJ2NoYXJQYXJzZXInLCAnd2FudGVkICcgKyBjaGFyICsgJzsgZ290ICcgKyBvcHRDaGFyLnZhbHVlLCBwb3MpKTtcbn07XG5cbmNvbnN0IGRpZ2l0UGFyc2VyID0gZGlnaXQgPT4gcG9zID0+IHtcbiAgICBpZiAodHlwZW9mIHBvcyA9PT0gJ3N0cmluZycpIHBvcyA9IFBvc2l0aW9uLmZyb21UZXh0KHBvcyk7XG4gICAgY29uc3Qgb3B0Q2hhciA9IHBvcy5jaGFyKCk7XG4gICAgaWYgKG9wdENoYXIuaXNOb3RoaW5nKSByZXR1cm4gVmFsaWRhdGlvbi5GYWlsdXJlKFR1cGxlLlRyaXBsZSgnZGlnaXRQYXJzZXInLCAnbm8gbW9yZSBpbnB1dCcsIHBvcykpO1xuICAgIGlmIChwYXJzZUludChvcHRDaGFyLnZhbHVlLCAxMCkgPT09IGRpZ2l0KSByZXR1cm4gVmFsaWRhdGlvbi5TdWNjZXNzKFR1cGxlLlBhaXIoZGlnaXQsIHBvcy5pbmNyUG9zKCkpKTtcbiAgICByZXR1cm4gVmFsaWRhdGlvbi5GYWlsdXJlKFR1cGxlLlRyaXBsZSgnZGlnaXRQYXJzZXInLCAnd2FudGVkICcgKyBkaWdpdCArICc7IGdvdCAnICsgb3B0Q2hhci52YWx1ZSwgcG9zKSk7XG59O1xuXG5jb25zdCBwcmVkaWNhdGVCYXNlZFBhcnNlciA9IChwcmVkLCBsYWJlbCkgPT4gcG9zID0+IHtcbiAgICBpZiAodHlwZW9mIHBvcyA9PT0gJ3N0cmluZycpIHBvcyA9IFBvc2l0aW9uLmZyb21UZXh0KHBvcyk7XG4gICAgY29uc3Qgb3B0Q2hhciA9IHBvcy5jaGFyKCk7XG4gICAgaWYgKG9wdENoYXIuaXNOb3RoaW5nKSByZXR1cm4gVmFsaWRhdGlvbi5GYWlsdXJlKFR1cGxlLlRyaXBsZShsYWJlbCwgJ25vIG1vcmUgaW5wdXQnLCBwb3MpKTtcbiAgICBpZiAocHJlZChvcHRDaGFyLnZhbHVlKSkgcmV0dXJuIFZhbGlkYXRpb24uU3VjY2VzcyhUdXBsZS5QYWlyKG9wdENoYXIudmFsdWUsIHBvcy5pbmNyUG9zKCkpKTtcbiAgICByZXR1cm4gVmFsaWRhdGlvbi5GYWlsdXJlKFR1cGxlLlRyaXBsZShsYWJlbCwgJ3VuZXhwZWN0ZWQgY2hhcjogJyArIG9wdENoYXIudmFsdWUsIHBvcykpO1xufTtcblxuZXhwb3J0IHtjaGFyUGFyc2VyLCBkaWdpdFBhcnNlciwgcHJlZGljYXRlQmFzZWRQYXJzZXJ9O1xuXG5leHBvcnQgZnVuY3Rpb24gcGNoYXIoY2hhcikge1xuICAgIGNvbnN0IGxhYmVsID0gJ3BjaGFyXycgKyBjaGFyO1xuICAgIGxldCByZXN1bHQgPSBmdW5jdGlvbiAocG9zKSB7XG4gICAgICAgIHJldHVybiBjaGFyUGFyc2VyKGNoYXIpKHBvcyk7XG4gICAgfTtcbiAgICByZXR1cm4gcGFyc2VyKHJlc3VsdCwgbGFiZWwpLnNldExhYmVsKGxhYmVsKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHBkaWdpdChkaWdpdCkge1xuICAgIHJldHVybiBwYXJzZXIocG9zID0+IGRpZ2l0UGFyc2VyKGRpZ2l0KShwb3MpLCAncGRpZ2l0XycgKyBkaWdpdCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhbmRUaGVuKHAxLCBwMikge1xuICAgIGNvbnN0IGxhYmVsID0gcDEubGFiZWwgKyAnIGFuZFRoZW4gJyArIHAyLmxhYmVsO1xuICAgIHJldHVybiBwYXJzZXIoZnVuY3Rpb24gKHBvcykge1xuICAgICAgICBsZXQgcmVzMSA9IHAxLnJ1bihwb3MpO1xuICAgICAgICBpZiAocmVzMS5pc1N1Y2Nlc3MpIHtcbiAgICAgICAgICAgIGxldCByZXMyID0gcDIucnVuKHJlczEudmFsdWVbMV0pO1xuICAgICAgICAgICAgaWYgKHJlczIuaXNTdWNjZXNzKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFZhbGlkYXRpb24uU3VjY2VzcyhUdXBsZS5QYWlyKFR1cGxlLlBhaXIocmVzMS52YWx1ZVswXSwgcmVzMi52YWx1ZVswXSksIHJlczIudmFsdWVbMV0pKTtcbiAgICAgICAgICAgIH0gZWxzZSByZXR1cm4gVmFsaWRhdGlvbi5GYWlsdXJlKFR1cGxlLlRyaXBsZShsYWJlbCwgcmVzMi52YWx1ZVsxXSwgcmVzMi52YWx1ZVsyXSkpO1xuICAgICAgICB9IGVsc2UgcmV0dXJuIFZhbGlkYXRpb24uRmFpbHVyZShUdXBsZS5UcmlwbGUobGFiZWwsIHJlczEudmFsdWVbMV0sIHJlczEudmFsdWVbMl0pKTtcbiAgICB9LCBsYWJlbCk7XG59XG5cbi8vIHVzaW5nIGJpbmRcbmV4cG9ydCBmdW5jdGlvbiBhbmRUaGVuQmluZChwMSwgcDIpIHtcbiAgICByZXR1cm4gcDEuYmluZChwYXJzZWRWYWx1ZTEgPT4ge1xuICAgICAgICByZXR1cm4gcDIuYmluZChwYXJzZWRWYWx1ZTIgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHJldHVyblAoVHVwbGUuUGFpcihwYXJzZWRWYWx1ZTEsIHBhcnNlZFZhbHVlMikpO1xuICAgICAgICB9KTtcbiAgICB9KS5zZXRMYWJlbChwMS5sYWJlbCArICcgYW5kVGhlbiAnICsgcDIubGFiZWwpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gb3JFbHNlKHAxLCBwMikge1xuICAgIGNvbnN0IGxhYmVsID0gcDEubGFiZWwgKyAnIG9yRWxzZSAnICsgcDIubGFiZWw7XG4gICAgcmV0dXJuIHBhcnNlcihwb3MgPT4ge1xuICAgICAgICBjb25zdCByZXMxID0gcDEucnVuKHBvcyk7XG4gICAgICAgIGlmIChyZXMxLmlzU3VjY2VzcykgcmV0dXJuIHJlczE7XG4gICAgICAgIGNvbnN0IHJlczIgPSBwMi5ydW4ocG9zKTtcbiAgICAgICAgaWYgKHJlczIuaXNTdWNjZXNzKSByZXR1cm4gcmVzMjtcbiAgICAgICAgcmV0dXJuIFZhbGlkYXRpb24uRmFpbHVyZShUdXBsZS5UcmlwbGUobGFiZWwsIHJlczIudmFsdWVbMV0sIHJlczIudmFsdWVbMl0pKTtcbiAgICB9LCBsYWJlbCkuc2V0TGFiZWwobGFiZWwpO1xufVxuXG5sZXQgX2ZhaWwgPSBwYXJzZXIocG9zID0+IFZhbGlkYXRpb24uRmFpbHVyZShUdXBsZS5UcmlwbGUoJ3BhcnNpbmcgZmFpbGVkJywgJ19mYWlsJywgcG9zKSkpO1xuXG4vLyByZXR1cm4gbmV1dHJhbCBlbGVtZW50IGluc3RlYWQgb2YgbWVzc2FnZVxubGV0IF9zdWNjZWVkID0gcGFyc2VyKHBvcyA9PiBWYWxpZGF0aW9uLlN1Y2Nlc3MoVHVwbGUuUGFpcihUdXBsZS5QYWlyKCdwYXJzaW5nIHN1Y2NlZWRlZCcsIHBvcyksICdfc3VjY2VlZCcpKSk7XG5cbmV4cG9ydCBmdW5jdGlvbiBjaG9pY2UocGFyc2Vycykge1xuICAgIHJldHVybiBwYXJzZXJzLnJlZHVjZVJpZ2h0KChyZXN0LCBjdXJyKSA9PiBvckVsc2UoY3VyciwgcmVzdCksIF9mYWlsKVxuICAgICAgICAuc2V0TGFiZWwoJ2Nob2ljZSAnICsgcGFyc2Vycy5yZWR1Y2UoKGFjYywgY3VycikgPT4gYWNjICsgJy8nICsgY3Vyci5sYWJlbCwgJycpKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGFueU9mKGNoYXJzQXJyYXkpIHtcbiAgICByZXR1cm4gY2hvaWNlKGNoYXJzQXJyYXkubWFwKHBjaGFyKSlcbiAgICAgICAgLnNldExhYmVsKCdhbnlPZiAnICsgY2hhcnNBcnJheS5yZWR1Y2UoKGFjYywgY3VycikgPT4gYWNjICsgY3VyciwgJycpKTtcbn1cblxuZXhwb3J0IGNvbnN0IGxvd2VyY2FzZVAgPSBhbnlPZihbJ2EnLCAnYicsICdjJywgJ2QnLCAnZScsICdmJywgJ2cnLCAnaCcsICdpJywgJ2onLCAnaycsICdsJywgJ20nLCAnbicsICdvJywgJ3AnLCAncScsICdyJywgJ3MnLCAndCcsICd1JywgJ3YnLCAndycsICd4JywgJ3knLCAneicsXSkuc2V0TGFiZWwoJ2xvd2VyY2FzZVAnKTtcbmV4cG9ydCBjb25zdCB1cHBlcmNhc2VQID0gYW55T2YoWydBJywgJ0InLCAnQycsICdEJywgJ0UnLCAnRicsICdHJywgJ0gnLCAnSScsICdKJywgJ0snLCAnTCcsICdNJywgJ04nLCAnTycsICdQJywgJ1EnLCAnUicsICdTJywgJ1QnLCAnVScsICdWJywgJ1cnLCAnWCcsICdZJywgJ1onLF0pLnNldExhYmVsKCd1cHBlcmNhc2VQJyk7XG5leHBvcnQgY29uc3QgbGV0dGVyUCA9IGxvd2VyY2FzZVAub3JFbHNlKHVwcGVyY2FzZVApLnNldExhYmVsKCdsZXR0ZXJQJyk7XG5leHBvcnQgY29uc3QgZGlnaXRQID0gYW55T2YoWycwJywgJzEnLCAnMicsICczJywgJzQnLCAnNScsICc2JywgJzcnLCAnOCcsICc5J10pLnNldExhYmVsKCdkaWdpdFAnKTtcbmV4cG9ydCBjb25zdCB3aGl0ZVAgPSBhbnlPZihbJyAnLCAnXFx0JywgJ1xcbicsICdcXHInXSkuc2V0TGFiZWwoJ3doaXRlUCcpO1xuXG5leHBvcnQgZnVuY3Rpb24gZm1hcChmYWIsIHBhcnNlcjEpIHtcbiAgICBjb25zdCBsYWJlbCA9IHBhcnNlcjEubGFiZWwgKyAnIGZtYXAgJyArIGZhYi50b1N0cmluZygpO1xuICAgIHJldHVybiBwYXJzZXIocG9zID0+IHtcbiAgICAgICAgbGV0IHJlcyA9IHBhcnNlcjEucnVuKHBvcyk7XG4gICAgICAgIGlmIChyZXMuaXNTdWNjZXNzKSByZXR1cm4gVmFsaWRhdGlvbi5TdWNjZXNzKFR1cGxlLlBhaXIoZmFiKHJlcy52YWx1ZVswXSksIHJlcy52YWx1ZVsxXSkpO1xuICAgICAgICByZXR1cm4gVmFsaWRhdGlvbi5GYWlsdXJlKFR1cGxlLlRyaXBsZShsYWJlbCwgcmVzLnZhbHVlWzFdLCByZXMudmFsdWVbMl0pKTtcbiAgICB9LCBsYWJlbCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZXR1cm5QKHZhbHVlKSB7XG4gICAgcmV0dXJuIHBhcnNlcihwb3MgPT4gVmFsaWRhdGlvbi5TdWNjZXNzKFR1cGxlLlBhaXIodmFsdWUsIHBvcykpLCB2YWx1ZSk7XG59XG5cbi8vIHBhcnNlcihhIC0+IGIpIC0+IHBhcnNlcihhKSAtPiBwYXJzZXIoYilcbmV4cG9ydCBmdW5jdGlvbiBhcHBseVB4KGZQKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uICh4UCkge1xuICAgICAgICByZXR1cm4gYW5kVGhlbihmUCwgeFApLmZtYXAoKFtmLCB4XSkgPT4gZih4KSk7XG4gICAgfTtcbn1cblxuLy8gdXNpbmcgYmluZFxuZXhwb3J0IGZ1bmN0aW9uIGFwcGx5UChmUCkge1xuICAgIHJldHVybiBmdW5jdGlvbiAoeFApIHtcbiAgICAgICAgcmV0dXJuIGZQLmJpbmQocGFyc2VkVmFsdWVmID0+IHtcbiAgICAgICAgICAgIHJldHVybiB4UC5iaW5kKHBhcnNlZFZhbHVleCA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJldHVyblAocGFyc2VkVmFsdWVmKHBhcnNlZFZhbHVleCkpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBsaWZ0MihmYWFiKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uIChwYXJzZXIxKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAocGFyc2VyMikge1xuICAgICAgICAgICAgLy9yZXR1cm4gYXBwbHlQKGFwcGx5UChyZXR1cm5QKGZhYWIpKShwYXJzZXIxKSkocGFyc2VyMik7XG4gICAgICAgICAgICByZXR1cm4gcmV0dXJuUChmYWFiKS5hcHBseShwYXJzZXIxKS5hcHBseShwYXJzZXIyKTsgLy8gdXNpbmcgaW5zdGFuY2UgbWV0aG9kc1xuICAgICAgICB9O1xuICAgIH07XG59XG5cbi8vIHVzaW5nIGxpZnQyKGNvbnMpXG5leHBvcnQgZnVuY3Rpb24gc2VxdWVuY2VQKHBhcnNlcnMpIHtcbiAgICByZXR1cm4gcGFyc2Vyc1xuICAgICAgICAucmVkdWNlUmlnaHQoKHJlc3QsIGN1cnIpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBsaWZ0MihfY29ucykoY3VycikocmVzdCk7XG4gICAgICAgIH0sIHJldHVyblAoW10pKTtcbn1cblxuLy8gdXNpbmcgbmFpdmUgYW5kVGhlbiAmJiBmbWFwIC0tPiByZXR1cm5zIHN0cmluZ3MsIG5vdCBhcnJheXMhXG5leHBvcnQgZnVuY3Rpb24gc2VxdWVuY2VQMihwYXJzZXJzKSB7XG4gICAgcmV0dXJuIHBhcnNlcnNcbiAgICAgICAgLnJlZHVjZVJpZ2h0KChyZXN0LCBjdXJyKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gZm1hcCgoW3gsIHldKSA9PiB4ICsgeSwgYW5kVGhlbihjdXJyLCByZXN0KSk7XG4gICAgICAgIH0sIHJldHVyblAoJycpKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHBzdHJpbmcoc3RyKSB7XG4gICAgcmV0dXJuIHNlcXVlbmNlUChzdHIuc3BsaXQoJycpLm1hcChwY2hhcikpXG4gICAgICAgIC5zZXRMYWJlbCgncHN0cmluZyAnICsgc3RyKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHplcm9Pck1vcmUoeFApIHsgLy8gemVyb09yTW9yZSA6OiBwIGEgLT4gW2FdIC0+IHRyeSBbYV0gPSBwIGEgLT4gcCBbYV1cbiAgICByZXR1cm4gcG9zID0+IHtcbiAgICAgICAgbGV0IHJlczEgPSB4UC5ydW4ocG9zKTtcbiAgICAgICAgaWYgKHJlczEuaXNGYWlsdXJlKSByZXR1cm4gVmFsaWRhdGlvbi5TdWNjZXNzKFR1cGxlLlBhaXIoW10sIHBvcykpO1xuICAgICAgICBsZXQgcmVzTiA9IHplcm9Pck1vcmUoeFApKHJlczEudmFsdWVbMV0pO1xuICAgICAgICByZXR1cm4gVmFsaWRhdGlvbi5TdWNjZXNzKFR1cGxlLlBhaXIoW3JlczEudmFsdWVbMF1dLmNvbmNhdChyZXNOLnZhbHVlWzBdKSwgcmVzTi52YWx1ZVsxXSkpO1xuICAgIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtYW55KHhQLCB0aW1lcykge1xuICAgIGNvbnN0IHRpbWVzX2RlZmluZWQgPSAodHlwZW9mIHRpbWVzICE9PSAndW5kZWZpbmVkJyk7XG4gICAgY29uc3QgbGFiZWwgPSAnbWFueSAnICsgeFAubGFiZWxcbiAgICAgICAgKyAoKHRpbWVzX2RlZmluZWQpID8gJyB0aW1lcz0nICsgdGltZXMgOiAnJyk7XG4gICAgcmV0dXJuIHBhcnNlcihwb3MgPT4ge1xuICAgICAgICBjb25zdCByZXMgPSB6ZXJvT3JNb3JlKHhQKShwb3MpO1xuICAgICAgICBpZiAodGltZXNfZGVmaW5lZCkgey8vZGVidWdnZXI7XG4gICAgICAgICAgICBpZiAocmVzLmlzRmFpbHVyZSkgcmV0dXJuIHJlcztcbiAgICAgICAgICAgIGNvbnN0IHJlc3VsdExlbmd0aCA9IHJlcy52YWx1ZVswXS5sZW5ndGg7XG4gICAgICAgICAgICByZXR1cm4gKHJlc3VsdExlbmd0aCA9PT0gdGltZXMpXG4gICAgICAgICAgICAgICAgPyByZXNcbiAgICAgICAgICAgICAgICA6IFZhbGlkYXRpb24uRmFpbHVyZShUdXBsZS5UcmlwbGUobGFiZWwsICd0aW1lcyBwYXJhbSB3YW50ZWQgJyArIHRpbWVzICsgJzsgZ290ICcgKyByZXN1bHRMZW5ndGgsIHBvcykpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXM7XG4gICAgfSwgbGFiZWwpLnNldExhYmVsKGxhYmVsKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1hbnlDaGFycyh4UCwgdGltZXMpIHtcbiAgICByZXR1cm4gbWFueSh4UCwgdGltZXMpXG4gICAgICAgIC5mbWFwKGFycmEgPT4gYXJyYS5qb2luKCcnKSlcbiAgICAgICAgLnNldExhYmVsKCdtYW55Q2hhcnMgJyArIHhQLmxhYmVsXG4gICAgICAgICAgICArICgodHlwZW9mIHRpbWVzICE9PSAndW5kZWZpbmVkJykgPyAnIHRpbWVzPScgKyB0aW1lcyA6ICcnKSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtYW55MSh4UCkge1xuICAgIGNvbnN0IGxhYmVsID0gJ21hbnkxICcgKyB4UC5sYWJlbDtcbiAgICByZXR1cm4gcGFyc2VyKHBvcyA9PiB7XG4gICAgICAgIGxldCByZXMxID0geFAucnVuKHBvcyk7XG4gICAgICAgIGlmIChyZXMxLmlzRmFpbHVyZSkgcmV0dXJuIHJlczE7XG4gICAgICAgIGxldCByZXNOID0gemVyb09yTW9yZSh4UCkocmVzMS52YWx1ZVsxXSk7XG4gICAgICAgIHJldHVybiBWYWxpZGF0aW9uLlN1Y2Nlc3MoVHVwbGUuUGFpcihbcmVzMS52YWx1ZVswXV0uY29uY2F0KHJlc04udmFsdWVbMF0pLCByZXNOLnZhbHVlWzFdKSk7XG4gICAgfSwgbGFiZWwpLnNldExhYmVsKGxhYmVsKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1hbnlDaGFyczEoeFApIHtcbiAgICByZXR1cm4gbWFueTEoeFApXG4gICAgICAgIC5mbWFwKGFycmEgPT4gYXJyYS5qb2luKCcnKSlcbiAgICAgICAgLnNldExhYmVsKCdtYW55Q2hhcnMxICcgKyB4UC5sYWJlbCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBvcHQoeFAsIGRlZmF1bHRWYWx1ZSkge1xuICAgIGNvbnN0IGlzRGVmYXVsdCA9ICh0eXBlb2YgZGVmYXVsdFZhbHVlICE9PSAndW5kZWZpbmVkJyk7XG4gICAgY29uc3QgbGFiZWwgPSAnb3B0ICcgKyB4UC5sYWJlbFxuICAgICAgICArIChpc0RlZmF1bHQgPyAnKGRlZmF1bHQ9JyArIGRlZmF1bHRWYWx1ZSArICcpJyA6ICcnKTtcbiAgICByZXR1cm4gcGFyc2VyKHBvcyA9PiB7XG4gICAgICAgIGxldCByZXMgPSB4UC5mbWFwKE1heWJlLkp1c3QpLnJ1bihwb3MpO1xuICAgICAgICBpZiAocmVzLmlzU3VjY2VzcykgcmV0dXJuIHJlcztcbiAgICAgICAgbGV0IG91dGNvbWUgPSAoaXNEZWZhdWx0KSA/IE1heWJlLkp1c3QoZGVmYXVsdFZhbHVlKSA6IE1heWJlLk5vdGhpbmcoKTtcbiAgICAgICAgcmV0dXJuIFZhbGlkYXRpb24uU3VjY2VzcyhUdXBsZS5QYWlyKG91dGNvbWUsIHBvcykpO1xuICAgIH0sIGxhYmVsKS5zZXRMYWJlbChsYWJlbCk7XG59XG5cbi8vIG9wdCBmcm9tIHRoZSBib29rIC0gd29ya3Mgb2ssIGJ1dCB0b1N0cmluZygpIGdpdmVzIHN0cmFuZ2UgcmVzdWx0c1xuZXhwb3J0IGZ1bmN0aW9uIG9wdEJvb2socFgpIHtcbiAgICBjb25zdCBzb21lUCA9IHBYLmZtYXAoTWF5YmUuSnVzdCk7XG4gICAgY29uc3Qgbm9uZVAgPSByZXR1cm5QKE1heWJlLk5vdGhpbmcpO1xuICAgIHJldHVybiBzb21lUC5vckVsc2Uobm9uZVApO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZGlzY2FyZFNlY29uZChwMSwgcDIpIHtcbiAgICBjb25zdCBsYWJlbCA9IHAxLmxhYmVsICsgJyBkaXNjYXJkU2Vjb25kICcgKyBwMi5sYWJlbDtcbiAgICByZXR1cm4gcGFyc2VyKHBvcyA9PiB7XG4gICAgICAgIHJldHVybiBhbmRUaGVuKHAxLCBwMikuZm1hcCgoW3gsIHldKSA9PiB4KS5ydW4ocG9zKTtcbiAgICB9LCBsYWJlbCkuc2V0TGFiZWwobGFiZWwpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZGlzY2FyZEZpcnN0KHAxLCBwMikge1xuICAgIGNvbnN0IGxhYmVsID0gcDEubGFiZWwgKyAnIGRpc2NhcmRGaXJzdCAnICsgcDIubGFiZWw7XG4gICAgcmV0dXJuIHBhcnNlcihwb3MgPT4ge1xuICAgICAgICByZXR1cm4gYW5kVGhlbihwMSwgcDIpLmZtYXAoKFt4LCB5XSkgPT4geSkucnVuKHBvcyk7XG4gICAgfSwgbGFiZWwpLnNldExhYmVsKGxhYmVsKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNlcEJ5MUJvb2socHgsIHNlcCkge1xuICAgIHJldHVybiBweC5hbmRUaGVuKG1hbnkoc2VwLmRpc2NhcmRGaXJzdChweCkpKS5mbWFwKChbciwgcmxpc3RdKSA9PiBbcl0uY29uY2F0KHJsaXN0KSk7XG59XG5cbi8vIG15IHZlcnNpb24gd29ya3MganVzdCBmaW5lLi4uXG5leHBvcnQgZnVuY3Rpb24gc2VwQnkxKHZhbHVlUCwgc2VwYXJhdG9yUCkge1xuICAgIHJldHVybiBtYW55KG1hbnkxKHZhbHVlUCkuZGlzY2FyZFNlY29uZChvcHQoc2VwYXJhdG9yUCkpKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGJldHdlZW4ocDEsIHAyLCBwMykge1xuICAgIHJldHVybiBwMS5kaXNjYXJkRmlyc3QocDIpLmRpc2NhcmRTZWNvbmQocDMpXG4gICAgICAgIC5zZXRMYWJlbCgnYmV0d2VlbiAnICsgcDEubGFiZWwgKyAnLycgKyBwMi5sYWJlbCArICcvJyArIHAzLmxhYmVsKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGJldHdlZW5QYXJlbnMocHgpIHtcbiAgICByZXR1cm4gYmV0d2VlbihwY2hhcignKCcpLCBweCwgcGNoYXIoJyknKSlcbiAgICAgICAgLnNldExhYmVsKCdiZXR3ZWVuUGFyZW5zICcgKyBweC5sYWJlbCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBiaW5kUChmYW1iLCBweCkge1xuICAgIGxldCBsYWJlbCA9ICd1bmtub3duJztcbiAgICByZXR1cm4gcGFyc2VyKHBvcyA9PiB7XG4gICAgICAgIGNvbnN0IHJlcyA9IHB4LnJ1bihwb3MpO1xuICAgICAgICBpZiAocmVzLmlzRmFpbHVyZSkgcmV0dXJuIHJlcztcbiAgICAgICAgcmV0dXJuIGZhbWIocmVzLnZhbHVlWzBdKS5ydW4ocmVzLnZhbHVlWzFdKTtcbiAgICB9LCBsYWJlbCkuc2V0TGFiZWwobGFiZWwpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdGFwUChweCwgZm4pIHtcbiAgICByZXR1cm4gcHguYmluZChyZXMgPT4ge1xuICAgICAgICBmbihyZXMpO1xuICAgICAgICByZXR1cm4gcmV0dXJuUChyZXMpO1xuICAgIH0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbG9nUChweCkge1xuICAgIHJldHVybiB0YXBQKHB4LCByZXMgPT4gY29uc29sZS5sb2cocHgubGFiZWwgKyAnOicgKyByZXMpKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHB3b3JkKHdvcmQpIHtcbiAgICByZXR1cm4gdHJpbVAocHN0cmluZyh3b3JkKSlcbiAgICAgICAgLnNldExhYmVsKCdwd29yZCAnICsgd29yZCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB0cmltUChwWCkge1xuICAgIHJldHVybiBvcHQobWFueSh3aGl0ZVApKVxuICAgICAgICAuZGlzY2FyZEZpcnN0KHBYKVxuICAgICAgICAuZGlzY2FyZFNlY29uZChvcHQobWFueSh3aGl0ZVApKSlcbiAgICAgICAgLnNldExhYmVsKCd0cmltICcgKyBwWC5sYWJlbCk7XG59XG5cbmZ1bmN0aW9uIF9jb25zKHgpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKHhzKSB7XG4gICAgICAgIHJldHVybiBbeF0uY29uY2F0KHhzKTtcbiAgICB9O1xufVxuXG5mdW5jdGlvbiBfc2V0TGFiZWwocHgsIG5ld0xhYmVsKSB7XG4gICAgcmV0dXJuIHBhcnNlcihwb3MgPT4ge1xuICAgICAgICBsZXQgcmVzdWx0ID0gcHgucnVuKHBvcyk7XG4gICAgICAgIGlmIChyZXN1bHQuaXNGYWlsdXJlKSByZXR1cm4gVmFsaWRhdGlvbi5GYWlsdXJlKFR1cGxlLlRyaXBsZShuZXdMYWJlbCwgcmVzdWx0LnZhbHVlWzFdLCByZXN1bHQudmFsdWVbMl0pKTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LCBuZXdMYWJlbCk7XG59XG5cbi8vIHRoZSByZWFsIHRoaW5nLi4uXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VyKGZuLCBsYWJlbCkge1xuICAgIHJldHVybiB7XG4gICAgICAgIHR5cGU6ICdwYXJzZXInLFxuICAgICAgICBsYWJlbDogbGFiZWwsXG4gICAgICAgIHJ1bihwb3MpIHtcbiAgICAgICAgICAgIHJldHVybiBmbihwb3MpO1xuICAgICAgICB9LFxuICAgICAgICBhcHBseShweCkge1xuICAgICAgICAgICAgcmV0dXJuIGFwcGx5UCh0aGlzKShweCk7XG4gICAgICAgICAgICAvL3JldHVybiB0aGlzLmJpbmQoYW5kVGhlbih0aGlzLCBweCkuZm1hcCgoW2YsIHhdKSA9PiBmKHgpKSkucnVuOyAvLyB3ZSBhcmUgdGhlIGZQXG4gICAgICAgIH0sXG4gICAgICAgIGZtYXAoZmFiKSB7XG4gICAgICAgICAgICAvL3JldHVybiBmbWFwKGZhYiwgdGhpcyk7XG4gICAgICAgICAgICAvL3JldHVybiBiaW5kUChwb3MgPT4gcmV0dXJuUChmYWIocG9zKSksIHRoaXMpO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuYmluZChwYXJzZWRWYWx1ZSA9PiByZXR1cm5QKGZhYihwYXJzZWRWYWx1ZSkpKTtcbiAgICAgICAgfSxcbiAgICAgICAgYW5kVGhlbihweCkge1xuICAgICAgICAgICAgcmV0dXJuIGFuZFRoZW4odGhpcywgcHgpO1xuICAgICAgICB9LFxuICAgICAgICBvckVsc2UocHgpIHtcbiAgICAgICAgICAgIHJldHVybiBvckVsc2UodGhpcywgcHgpO1xuICAgICAgICB9LFxuICAgICAgICBkaXNjYXJkRmlyc3QocHgpIHtcbiAgICAgICAgICAgIHJldHVybiBkaXNjYXJkRmlyc3QodGhpcywgcHgpO1xuICAgICAgICB9LFxuICAgICAgICBkaXNjYXJkU2Vjb25kKHB4KSB7XG4gICAgICAgICAgICByZXR1cm4gZGlzY2FyZFNlY29uZCh0aGlzLCBweCk7XG4gICAgICAgIH0sXG4gICAgICAgIGJpbmQoZmFtYikge1xuICAgICAgICAgICAgcmV0dXJuIGJpbmRQKGZhbWIsIHRoaXMpO1xuICAgICAgICB9LFxuICAgICAgICBzZXRMYWJlbChuZXdMYWJlbCkge1xuICAgICAgICAgICAgcmV0dXJuIF9zZXRMYWJlbCh0aGlzLCBuZXdMYWJlbCk7XG4gICAgICAgIH1cbiAgICB9O1xufVxuIl19