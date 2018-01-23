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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2pzL3BhcnNlcnMuanMiXSwibmFtZXMiOlsicGNoYXIiLCJwZGlnaXQiLCJhbmRUaGVuQmluZCIsImNob2ljZSIsImFueU9mIiwiZm1hcCIsInJldHVyblAiLCJhcHBseVB4IiwiYXBwbHlQIiwibGlmdDIiLCJzZXF1ZW5jZVAiLCJzZXF1ZW5jZVAyIiwicHN0cmluZyIsInplcm9Pck1vcmUiLCJtYW55IiwibWFueUNoYXJzIiwibWFueTEiLCJtYW55Q2hhcnMxIiwib3B0Iiwib3B0Qm9vayIsInNlcEJ5MUJvb2siLCJzZXBCeTEiLCJiZXR3ZWVuIiwiYmV0d2VlblBhcmVucyIsImJpbmRQIiwidGFwUCIsImxvZ1AiLCJwd29yZCIsInBhcnNlciIsImNoYXJQYXJzZXIiLCJwb3MiLCJmcm9tVGV4dCIsIm9wdENoYXIiLCJjaGFyIiwiaXNOb3RoaW5nIiwiRmFpbHVyZSIsIlRyaXBsZSIsInZhbHVlIiwiU3VjY2VzcyIsIlBhaXIiLCJpbmNyUG9zIiwiZGlnaXRQYXJzZXIiLCJwYXJzZUludCIsImRpZ2l0IiwicHJlZGljYXRlQmFzZWRQYXJzZXIiLCJwcmVkIiwibGFiZWwiLCJyZXN1bHQiLCJzZXRMYWJlbCIsImFuZFRoZW4iLCJwMSIsInAyIiwicmVzMSIsInJ1biIsImlzU3VjY2VzcyIsInJlczIiLCJiaW5kIiwicGFyc2VkVmFsdWUxIiwicGFyc2VkVmFsdWUyIiwib3JFbHNlIiwiX2ZhaWwiLCJfc3VjY2VlZCIsInBhcnNlcnMiLCJyZWR1Y2VSaWdodCIsInJlc3QiLCJjdXJyIiwicmVkdWNlIiwiYWNjIiwiY2hhcnMiLCJtYXAiLCJsb3dlcmNhc2VQIiwidXBwZXJjYXNlUCIsImxldHRlclAiLCJkaWdpdFAiLCJ3aGl0ZVAiLCJmYWIiLCJwYXJzZXIxIiwidG9TdHJpbmciLCJyZXMiLCJmUCIsInhQIiwiZiIsIngiLCJwYXJzZWRWYWx1ZWYiLCJwYXJzZWRWYWx1ZXgiLCJmYWFiIiwicGFyc2VyMiIsImFwcGx5IiwiX2NvbnMiLCJ5Iiwic3RyIiwic3BsaXQiLCJpc0ZhaWx1cmUiLCJyZXNOIiwiY29uY2F0IiwidGltZXMiLCJ0aW1lc19kZWZpbmVkIiwicmVzdWx0TGVuZ3RoIiwibGVuZ3RoIiwiYXJyYSIsImpvaW4iLCJkZWZhdWx0VmFsdWUiLCJpc0RlZmF1bHQiLCJKdXN0Iiwib3V0Y29tZSIsIk5vdGhpbmciLCJwWCIsInNvbWVQIiwibm9uZVAiLCJkaXNjYXJkU2Vjb25kIiwiZGlzY2FyZEZpcnN0IiwicHgiLCJzZXAiLCJyIiwicmxpc3QiLCJ2YWx1ZVAiLCJzZXBhcmF0b3JQIiwicDMiLCJmYW1iIiwiZm4iLCJjb25zb2xlIiwibG9nIiwid29yZCIsInhzIiwiX3NldExhYmVsIiwibmV3TGFiZWwiLCJ0eXBlIiwicGFyc2VkVmFsdWUiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7WUFtQ2dCQSxLLEdBQUFBLEs7WUFRQUMsTSxHQUFBQSxNO1lBa0JBQyxXLEdBQUFBLFc7WUF3QkFDLE0sR0FBQUEsTTtZQUtBQyxLLEdBQUFBLEs7WUFXQUMsSSxHQUFBQSxJO1lBU0FDLE8sR0FBQUEsTztZQUtBQyxPLEdBQUFBLE87WUFPQUMsTSxHQUFBQSxNO1lBVUFDLEssR0FBQUEsSztZQVVBQyxTLEdBQUFBLFM7WUFRQUMsVSxHQUFBQSxVO1lBT0FDLE8sR0FBQUEsTztZQUtBQyxVLEdBQUFBLFU7WUFTQUMsSSxHQUFBQSxJO1lBaUJBQyxTLEdBQUFBLFM7WUFPQUMsSyxHQUFBQSxLO1lBVUFDLFUsR0FBQUEsVTtZQU1BQyxHLEdBQUFBLEc7WUFhQUMsTyxHQUFBQSxPO1lBb0JBQyxVLEdBQUFBLFU7WUFLQUMsTSxHQUFBQSxNO1lBSUFDLE8sR0FBQUEsTztZQUtBQyxhLEdBQUFBLGE7WUFLQUMsSyxHQUFBQSxLO1lBU0FDLEksR0FBQUEsSTtZQU9BQyxJLEdBQUFBLEk7WUFJQUMsSyxHQUFBQSxLO1lBc0JBQyxNLEdBQUFBLE07Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUExU3VCOztBQUV2QyxRQUFNQyxhQUFhLFNBQWJB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QkF3QldFLEVBeEJYLEVBd0JlO0FBQ2QsdUJBQU9GLGVBQWMsSUFBZCxFQUFvQkUsRUFBcEIsQ0FBUDtBQUNILGFBMUJFO0FBMkJIdkQsZ0JBM0JHLGdCQTJCRThELElBM0JGLEVBMkJRO0FBQ1AsdUJBQU85RixNQUFNOEYsSUFBTixFQUFZLElBQVosQ0FBUDtBQUNILGFBN0JFO0FBOEJIdEUsb0JBOUJHLG9CQThCTTZFLFFBOUJOLEVBOEJnQjtBQUNmLHVCQUFPRCxVQUFVLElBQVYsRUFBZ0JDLFFBQWhCLENBQVA7QUFDSDtBQWhDRSxTQUFQO0FBa0NIIiwiZmlsZSI6InBhcnNlcnMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBjZnIuIFwiVW5kZXJzdGFuZGluZyBQYXJzZXIgQ29tYmluYXRvcnNcIiAoRiMgZm9yIEZ1biBhbmQgUHJvZml0KVxuXG5pbXBvcnQge1xuICAgIFR1cGxlLFxuICAgIFBvc2l0aW9uLFxufSBmcm9tICdjbGFzc2VzJztcbmltcG9ydCB7TWF5YmV9IGZyb20gJ21heWJlJzsgLy8gSnVzdCBvciBOb3RoaW5nXG5pbXBvcnQge1ZhbGlkYXRpb259IGZyb20gJ3ZhbGlkYXRpb24nOyAvLyBTdWNjZXNzIG9yIEZhaWx1cmVcblxuY29uc3QgY2hhclBhcnNlciA9IGNoYXIgPT4gcG9zID0+IHtcbiAgICBpZiAodHlwZW9mIHBvcyA9PT0gJ3N0cmluZycpIHBvcyA9IFBvc2l0aW9uLmZyb21UZXh0KHBvcyk7XG4gICAgY29uc3Qgb3B0Q2hhciA9IHBvcy5jaGFyKCk7XG4gICAgaWYgKG9wdENoYXIuaXNOb3RoaW5nKSByZXR1cm4gVmFsaWRhdGlvbi5GYWlsdXJlKFR1cGxlLlRyaXBsZSgnY2hhclBhcnNlcicsICdubyBtb3JlIGlucHV0JywgcG9zKSk7XG4gICAgaWYgKG9wdENoYXIudmFsdWUgPT09IGNoYXIpIHJldHVybiBWYWxpZGF0aW9uLlN1Y2Nlc3MoVHVwbGUuUGFpcihjaGFyLCBwb3MuaW5jclBvcygpKSk7XG4gICAgcmV0dXJuIFZhbGlkYXRpb24uRmFpbHVyZShUdXBsZS5UcmlwbGUoJ2NoYXJQYXJzZXInLCAnd2FudGVkICcgKyBjaGFyICsgJzsgZ290ICcgKyBvcHRDaGFyLnZhbHVlLCBwb3MpKTtcbn07XG5cbmNvbnN0IGRpZ2l0UGFyc2VyID0gZGlnaXQgPT4gcG9zID0+IHtcbiAgICBpZiAodHlwZW9mIHBvcyA9PT0gJ3N0cmluZycpIHBvcyA9IFBvc2l0aW9uLmZyb21UZXh0KHBvcyk7XG4gICAgY29uc3Qgb3B0Q2hhciA9IHBvcy5jaGFyKCk7XG4gICAgaWYgKG9wdENoYXIuaXNOb3RoaW5nKSByZXR1cm4gVmFsaWRhdGlvbi5GYWlsdXJlKFR1cGxlLlRyaXBsZSgnZGlnaXRQYXJzZXInLCAnbm8gbW9yZSBpbnB1dCcsIHBvcykpO1xuICAgIGlmIChwYXJzZUludChvcHRDaGFyLnZhbHVlLCAxMCkgPT09IGRpZ2l0KSByZXR1cm4gVmFsaWRhdGlvbi5TdWNjZXNzKFR1cGxlLlBhaXIoZGlnaXQsIHBvcy5pbmNyUG9zKCkpKTtcbiAgICByZXR1cm4gVmFsaWRhdGlvbi5GYWlsdXJlKFR1cGxlLlRyaXBsZSgnZGlnaXRQYXJzZXInLCAnd2FudGVkICcgKyBkaWdpdCArICc7IGdvdCAnICsgb3B0Q2hhci52YWx1ZSwgcG9zKSk7XG59O1xuXG5jb25zdCBwcmVkaWNhdGVCYXNlZFBhcnNlciA9IChwcmVkLCBsYWJlbCkgPT4gcG9zID0+IHtcbiAgICBpZiAodHlwZW9mIHBvcyA9PT0gJ3N0cmluZycpIHBvcyA9IFBvc2l0aW9uLmZyb21UZXh0KHBvcyk7XG4gICAgY29uc3Qgb3B0Q2hhciA9IHBvcy5jaGFyKCk7XG4gICAgaWYgKG9wdENoYXIuaXNOb3RoaW5nKSByZXR1cm4gVmFsaWRhdGlvbi5GYWlsdXJlKFR1cGxlLlRyaXBsZShsYWJlbCwgJ25vIG1vcmUgaW5wdXQnLCBwb3MpKTtcbiAgICBpZiAocHJlZChvcHRDaGFyLnZhbHVlKSkgcmV0dXJuIFZhbGlkYXRpb24uU3VjY2VzcyhUdXBsZS5QYWlyKG9wdENoYXIudmFsdWUsIHBvcy5pbmNyUG9zKCkpKTtcbiAgICByZXR1cm4gVmFsaWRhdGlvbi5GYWlsdXJlKFR1cGxlLlRyaXBsZShsYWJlbCwgJ3VuZXhwZWN0ZWQgY2hhcjogJyArIG9wdENoYXIudmFsdWUsIHBvcykpO1xufTtcblxuZXhwb3J0IHtjaGFyUGFyc2VyLCBkaWdpdFBhcnNlciwgcHJlZGljYXRlQmFzZWRQYXJzZXJ9O1xuXG5leHBvcnQgZnVuY3Rpb24gcGNoYXIoY2hhcikge1xuICAgIGNvbnN0IGxhYmVsID0gJ3BjaGFyXycgKyBjaGFyO1xuICAgIGxldCByZXN1bHQgPSBmdW5jdGlvbiAocG9zKSB7XG4gICAgICAgIHJldHVybiBjaGFyUGFyc2VyKGNoYXIpKHBvcyk7XG4gICAgfTtcbiAgICByZXR1cm4gcGFyc2VyKHJlc3VsdCwgbGFiZWwpLnNldExhYmVsKGxhYmVsKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHBkaWdpdChkaWdpdCkge1xuICAgIHJldHVybiBwYXJzZXIocG9zID0+IGRpZ2l0UGFyc2VyKGRpZ2l0KShwb3MpLCAncGRpZ2l0XycgKyBkaWdpdCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhbmRUaGVuKHAxLCBwMikge1xuICAgIGNvbnN0IGxhYmVsID0gcDEubGFiZWwgKyAnIGFuZFRoZW4gJyArIHAyLmxhYmVsO1xuICAgIHJldHVybiBwYXJzZXIoZnVuY3Rpb24gKHBvcykge1xuICAgICAgICBsZXQgcmVzMSA9IHAxLnJ1bihwb3MpO1xuICAgICAgICBpZiAocmVzMS5pc1N1Y2Nlc3MpIHtcbiAgICAgICAgICAgIGxldCByZXMyID0gcDIucnVuKHJlczEudmFsdWVbMV0pO1xuICAgICAgICAgICAgaWYgKHJlczIuaXNTdWNjZXNzKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFZhbGlkYXRpb24uU3VjY2VzcyhUdXBsZS5QYWlyKFR1cGxlLlBhaXIocmVzMS52YWx1ZVswXSwgcmVzMi52YWx1ZVswXSksIHJlczIudmFsdWVbMV0pKTtcbiAgICAgICAgICAgIH0gZWxzZSByZXR1cm4gVmFsaWRhdGlvbi5GYWlsdXJlKFR1cGxlLlRyaXBsZShsYWJlbCwgcmVzMi52YWx1ZVsxXSwgcmVzMi52YWx1ZVsyXSkpO1xuICAgICAgICB9IGVsc2UgcmV0dXJuIFZhbGlkYXRpb24uRmFpbHVyZShUdXBsZS5UcmlwbGUobGFiZWwsIHJlczEudmFsdWVbMV0sIHJlczEudmFsdWVbMl0pKTtcbiAgICB9LCBsYWJlbCk7XG59XG5cbi8vIHVzaW5nIGJpbmRcbmV4cG9ydCBmdW5jdGlvbiBhbmRUaGVuQmluZChwMSwgcDIpIHtcbiAgICByZXR1cm4gcDEuYmluZChwYXJzZWRWYWx1ZTEgPT4ge1xuICAgICAgICByZXR1cm4gcDIuYmluZChwYXJzZWRWYWx1ZTIgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHJldHVyblAoVHVwbGUuUGFpcihwYXJzZWRWYWx1ZTEsIHBhcnNlZFZhbHVlMikpO1xuICAgICAgICB9KTtcbiAgICB9KS5zZXRMYWJlbChwMS5sYWJlbCArICcgYW5kVGhlbiAnICsgcDIubGFiZWwpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gb3JFbHNlKHAxLCBwMikge1xuICAgIGNvbnN0IGxhYmVsID0gcDEubGFiZWwgKyAnIG9yRWxzZSAnICsgcDIubGFiZWw7XG4gICAgcmV0dXJuIHBhcnNlcihwb3MgPT4ge1xuICAgICAgICBjb25zdCByZXMxID0gcDEucnVuKHBvcyk7XG4gICAgICAgIGlmIChyZXMxLmlzU3VjY2VzcykgcmV0dXJuIHJlczE7XG4gICAgICAgIGNvbnN0IHJlczIgPSBwMi5ydW4ocG9zKTtcbiAgICAgICAgaWYgKHJlczIuaXNTdWNjZXNzKSByZXR1cm4gcmVzMjtcbiAgICAgICAgcmV0dXJuIFZhbGlkYXRpb24uRmFpbHVyZShUdXBsZS5UcmlwbGUobGFiZWwsIHJlczIudmFsdWVbMV0sIHJlczIudmFsdWVbMl0pKTtcbiAgICB9LCBsYWJlbCkuc2V0TGFiZWwobGFiZWwpO1xufVxuXG5sZXQgX2ZhaWwgPSBwYXJzZXIocG9zID0+IFZhbGlkYXRpb24uRmFpbHVyZShUdXBsZS5UcmlwbGUoJ3BhcnNpbmcgZmFpbGVkJywgJ19mYWlsJywgcG9zKSkpO1xuXG4vLyByZXR1cm4gbmV1dHJhbCBlbGVtZW50IGluc3RlYWQgb2YgbWVzc2FnZVxubGV0IF9zdWNjZWVkID0gcGFyc2VyKHBvcyA9PiBWYWxpZGF0aW9uLlN1Y2Nlc3MoVHVwbGUuUGFpcihUdXBsZS5QYWlyKCdwYXJzaW5nIHN1Y2NlZWRlZCcsIHBvcyksICdfc3VjY2VlZCcpKSk7XG5cbmV4cG9ydCBmdW5jdGlvbiBjaG9pY2UocGFyc2Vycykge1xuICAgIHJldHVybiBwYXJzZXJzLnJlZHVjZVJpZ2h0KChyZXN0LCBjdXJyKSA9PiBvckVsc2UoY3VyciwgcmVzdCksIF9mYWlsKVxuICAgICAgICAuc2V0TGFiZWwoJ2Nob2ljZSAnICsgcGFyc2Vycy5yZWR1Y2UoKGFjYywgY3VycikgPT4gYWNjICsgJy8nICsgY3Vyci5sYWJlbCwgJycpKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGFueU9mKGNoYXJzKSB7XG4gICAgcmV0dXJuIGNob2ljZShjaGFycy5tYXAocGNoYXIpKVxuICAgICAgICAuc2V0TGFiZWwoJ2FueU9mICcgKyBjaGFycy5yZWR1Y2UoKGFjYywgY3VycikgPT4gYWNjICsgY3VyciwgJycpKTtcbn1cblxuZXhwb3J0IGNvbnN0IGxvd2VyY2FzZVAgPSBhbnlPZihbJ2EnLCAnYicsICdjJywgJ2QnLCAnZScsICdmJywgJ2cnLCAnaCcsICdpJywgJ2onLCAnaycsICdsJywgJ20nLCAnbicsICdvJywgJ3AnLCAncScsICdyJywgJ3MnLCAndCcsICd1JywgJ3YnLCAndycsICd4JywgJ3knLCAneicsXSk7XG5leHBvcnQgY29uc3QgdXBwZXJjYXNlUCA9IGFueU9mKFsnQScsICdCJywgJ0MnLCAnRCcsICdFJywgJ0YnLCAnRycsICdIJywgJ0knLCAnSicsICdLJywgJ0wnLCAnTScsICdOJywgJ08nLCAnUCcsICdRJywgJ1InLCAnUycsICdUJywgJ1UnLCAnVicsICdXJywgJ1gnLCAnWScsICdaJyxdKTtcbmV4cG9ydCBjb25zdCBsZXR0ZXJQID0gbG93ZXJjYXNlUC5vckVsc2UodXBwZXJjYXNlUCk7XG5leHBvcnQgY29uc3QgZGlnaXRQID0gYW55T2YoWycwJywgJzEnLCAnMicsICczJywgJzQnLCAnNScsICc2JywgJzcnLCAnOCcsICc5J10pO1xuZXhwb3J0IGNvbnN0IHdoaXRlUCA9IGFueU9mKFsnICcsICdcXHQnLCAnXFxuJywgJ1xcciddKTtcblxuZXhwb3J0IGZ1bmN0aW9uIGZtYXAoZmFiLCBwYXJzZXIxKSB7XG4gICAgY29uc3QgbGFiZWwgPSBwYXJzZXIxLmxhYmVsICsgJyBmbWFwICcgKyBmYWIudG9TdHJpbmcoKTtcbiAgICByZXR1cm4gcGFyc2VyKHBvcyA9PiB7XG4gICAgICAgIGxldCByZXMgPSBwYXJzZXIxLnJ1bihwb3MpO1xuICAgICAgICBpZiAocmVzLmlzU3VjY2VzcykgcmV0dXJuIFZhbGlkYXRpb24uU3VjY2VzcyhUdXBsZS5QYWlyKGZhYihyZXMudmFsdWVbMF0pLCByZXMudmFsdWVbMV0pKTtcbiAgICAgICAgcmV0dXJuIFZhbGlkYXRpb24uRmFpbHVyZShUdXBsZS5UcmlwbGUobGFiZWwsIHJlcy52YWx1ZVsxXSwgcmVzLnZhbHVlWzJdKSk7XG4gICAgfSwgbGFiZWwpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcmV0dXJuUCh2YWx1ZSkge1xuICAgIHJldHVybiBwYXJzZXIocG9zID0+IFZhbGlkYXRpb24uU3VjY2VzcyhUdXBsZS5QYWlyKHZhbHVlLCBwb3MpKSwgdmFsdWUpO1xufVxuXG4vLyBwYXJzZXIoYSAtPiBiKSAtPiBwYXJzZXIoYSkgLT4gcGFyc2VyKGIpXG5leHBvcnQgZnVuY3Rpb24gYXBwbHlQeChmUCkge1xuICAgIHJldHVybiBmdW5jdGlvbiAoeFApIHtcbiAgICAgICAgcmV0dXJuIGFuZFRoZW4oZlAsIHhQKS5mbWFwKChbZiwgeF0pID0+IGYoeCkpO1xuICAgIH07XG59XG5cbi8vIHVzaW5nIGJpbmRcbmV4cG9ydCBmdW5jdGlvbiBhcHBseVAoZlApIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKHhQKSB7XG4gICAgICAgIHJldHVybiBmUC5iaW5kKHBhcnNlZFZhbHVlZiA9PiB7XG4gICAgICAgICAgICByZXR1cm4geFAuYmluZChwYXJzZWRWYWx1ZXggPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiByZXR1cm5QKHBhcnNlZFZhbHVlZihwYXJzZWRWYWx1ZXgpKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbGlmdDIoZmFhYikge1xuICAgIHJldHVybiBmdW5jdGlvbiAocGFyc2VyMSkge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKHBhcnNlcjIpIHtcbiAgICAgICAgICAgIC8vcmV0dXJuIGFwcGx5UChhcHBseVAocmV0dXJuUChmYWFiKSkocGFyc2VyMSkpKHBhcnNlcjIpO1xuICAgICAgICAgICAgcmV0dXJuIHJldHVyblAoZmFhYikuYXBwbHkocGFyc2VyMSkuYXBwbHkocGFyc2VyMik7IC8vIHVzaW5nIGluc3RhbmNlIG1ldGhvZHNcbiAgICAgICAgfTtcbiAgICB9O1xufVxuXG4vLyB1c2luZyBsaWZ0Mihjb25zKVxuZXhwb3J0IGZ1bmN0aW9uIHNlcXVlbmNlUChwYXJzZXJzKSB7XG4gICAgcmV0dXJuIHBhcnNlcnNcbiAgICAgICAgLnJlZHVjZVJpZ2h0KChyZXN0LCBjdXJyKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gbGlmdDIoX2NvbnMpKGN1cnIpKHJlc3QpO1xuICAgICAgICB9LCByZXR1cm5QKFtdKSk7XG59XG5cbi8vIHVzaW5nIG5haXZlIGFuZFRoZW4gJiYgZm1hcCAtLT4gcmV0dXJucyBzdHJpbmdzLCBub3QgYXJyYXlzIVxuZXhwb3J0IGZ1bmN0aW9uIHNlcXVlbmNlUDIocGFyc2Vycykge1xuICAgIHJldHVybiBwYXJzZXJzXG4gICAgICAgIC5yZWR1Y2VSaWdodCgocmVzdCwgY3VycikgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIGZtYXAoKFt4LCB5XSkgPT4geCArIHksIGFuZFRoZW4oY3VyciwgcmVzdCkpO1xuICAgICAgICB9LCByZXR1cm5QKCcnKSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwc3RyaW5nKHN0cikge1xuICAgIHJldHVybiBzZXF1ZW5jZVAoc3RyLnNwbGl0KCcnKS5tYXAocGNoYXIpKVxuICAgICAgICAuc2V0TGFiZWwoJ3BzdHJpbmcgJyArIHN0cik7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB6ZXJvT3JNb3JlKHhQKSB7IC8vIHplcm9Pck1vcmUgOjogcCBhIC0+IFthXSAtPiB0cnkgW2FdID0gcCBhIC0+IHAgW2FdXG4gICAgcmV0dXJuIHBvcyA9PiB7XG4gICAgICAgIGxldCByZXMxID0geFAucnVuKHBvcyk7XG4gICAgICAgIGlmIChyZXMxLmlzRmFpbHVyZSkgcmV0dXJuIFZhbGlkYXRpb24uU3VjY2VzcyhUdXBsZS5QYWlyKFtdLCBwb3MpKTtcbiAgICAgICAgbGV0IHJlc04gPSB6ZXJvT3JNb3JlKHhQKShyZXMxLnZhbHVlWzFdKTtcbiAgICAgICAgcmV0dXJuIFZhbGlkYXRpb24uU3VjY2VzcyhUdXBsZS5QYWlyKFtyZXMxLnZhbHVlWzBdXS5jb25jYXQocmVzTi52YWx1ZVswXSksIHJlc04udmFsdWVbMV0pKTtcbiAgICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbWFueSh4UCwgdGltZXMpIHtcbiAgICBjb25zdCB0aW1lc19kZWZpbmVkID0gKHR5cGVvZiB0aW1lcyAhPT0gJ3VuZGVmaW5lZCcpO1xuICAgIGNvbnN0IGxhYmVsID0gJ21hbnkgJyArIHhQLmxhYmVsXG4gICAgICAgICsgKCh0aW1lc19kZWZpbmVkKSA/ICcgdGltZXM9JyArIHRpbWVzIDogJycpO1xuICAgIHJldHVybiBwYXJzZXIocG9zID0+IHtcbiAgICAgICAgY29uc3QgcmVzID0gemVyb09yTW9yZSh4UCkocG9zKTtcbiAgICAgICAgaWYgKHRpbWVzX2RlZmluZWQpIHsvL2RlYnVnZ2VyO1xuICAgICAgICAgICAgaWYgKHJlcy5pc0ZhaWx1cmUpIHJldHVybiByZXM7XG4gICAgICAgICAgICBjb25zdCByZXN1bHRMZW5ndGggPSByZXMudmFsdWVbMF0ubGVuZ3RoO1xuICAgICAgICAgICAgcmV0dXJuIChyZXN1bHRMZW5ndGggPT09IHRpbWVzKVxuICAgICAgICAgICAgICAgID8gcmVzXG4gICAgICAgICAgICAgICAgOiBWYWxpZGF0aW9uLkZhaWx1cmUoVHVwbGUuVHJpcGxlKGxhYmVsLCAndGltZXMgcGFyYW0gd2FudGVkICcgKyB0aW1lcyArICc7IGdvdCAnICsgcmVzdWx0TGVuZ3RoLCBwb3MpKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzO1xuICAgIH0sIGxhYmVsKS5zZXRMYWJlbChsYWJlbCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtYW55Q2hhcnMoeFAsIHRpbWVzKSB7XG4gICAgcmV0dXJuIG1hbnkoeFAsIHRpbWVzKVxuICAgICAgICAuZm1hcChhcnJhID0+IGFycmEuam9pbignJykpXG4gICAgICAgIC5zZXRMYWJlbCgnbWFueUNoYXJzICcgKyB4UC5sYWJlbFxuICAgICAgICAgICAgKyAoKHR5cGVvZiB0aW1lcyAhPT0gJ3VuZGVmaW5lZCcpID8gJyB0aW1lcz0nICsgdGltZXMgOiAnJykpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbWFueTEoeFApIHtcbiAgICBjb25zdCBsYWJlbCA9ICdtYW55MSAnICsgeFAubGFiZWw7XG4gICAgcmV0dXJuIHBhcnNlcihwb3MgPT4ge1xuICAgICAgICBsZXQgcmVzMSA9IHhQLnJ1bihwb3MpO1xuICAgICAgICBpZiAocmVzMS5pc0ZhaWx1cmUpIHJldHVybiByZXMxO1xuICAgICAgICBsZXQgcmVzTiA9IHplcm9Pck1vcmUoeFApKHJlczEudmFsdWVbMV0pO1xuICAgICAgICByZXR1cm4gVmFsaWRhdGlvbi5TdWNjZXNzKFR1cGxlLlBhaXIoW3JlczEudmFsdWVbMF1dLmNvbmNhdChyZXNOLnZhbHVlWzBdKSwgcmVzTi52YWx1ZVsxXSkpO1xuICAgIH0sIGxhYmVsKS5zZXRMYWJlbChsYWJlbCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtYW55Q2hhcnMxKHhQKSB7XG4gICAgcmV0dXJuIG1hbnkxKHhQKVxuICAgICAgICAuZm1hcChhcnJhID0+IGFycmEuam9pbignJykpXG4gICAgICAgIC5zZXRMYWJlbCgnbWFueUNoYXJzMSAnICsgeFAubGFiZWwpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gb3B0KHhQLCBkZWZhdWx0VmFsdWUpIHtcbiAgICBjb25zdCBpc0RlZmF1bHQgPSAodHlwZW9mIGRlZmF1bHRWYWx1ZSAhPT0gJ3VuZGVmaW5lZCcpO1xuICAgIGNvbnN0IGxhYmVsID0gJ29wdCAnICsgeFAubGFiZWxcbiAgICAgICAgKyAoaXNEZWZhdWx0ID8gJyhkZWZhdWx0PScgKyBkZWZhdWx0VmFsdWUgKyAnKScgOiAnJyk7XG4gICAgcmV0dXJuIHBhcnNlcihwb3MgPT4ge1xuICAgICAgICBsZXQgcmVzID0geFAuZm1hcChNYXliZS5KdXN0KS5ydW4ocG9zKTtcbiAgICAgICAgaWYgKHJlcy5pc1N1Y2Nlc3MpIHJldHVybiByZXM7XG4gICAgICAgIGxldCBvdXRjb21lID0gKGlzRGVmYXVsdCkgPyBNYXliZS5KdXN0KGRlZmF1bHRWYWx1ZSkgOiBNYXliZS5Ob3RoaW5nKCk7XG4gICAgICAgIHJldHVybiBWYWxpZGF0aW9uLlN1Y2Nlc3MoVHVwbGUuUGFpcihvdXRjb21lLCBwb3MpKTtcbiAgICB9LCBsYWJlbCkuc2V0TGFiZWwobGFiZWwpO1xufVxuXG4vLyBvcHQgZnJvbSB0aGUgYm9vayAtIHdvcmtzIG9rLCBidXQgdG9TdHJpbmcoKSBnaXZlcyBzdHJhbmdlIHJlc3VsdHNcbmV4cG9ydCBmdW5jdGlvbiBvcHRCb29rKHBYKSB7XG4gICAgY29uc3Qgc29tZVAgPSBwWC5mbWFwKE1heWJlLkp1c3QpO1xuICAgIGNvbnN0IG5vbmVQID0gcmV0dXJuUChNYXliZS5Ob3RoaW5nKTtcbiAgICByZXR1cm4gc29tZVAub3JFbHNlKG5vbmVQKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRpc2NhcmRTZWNvbmQocDEsIHAyKSB7XG4gICAgY29uc3QgbGFiZWwgPSBwMS5sYWJlbCArICcgZGlzY2FyZFNlY29uZCAnICsgcDIubGFiZWw7XG4gICAgcmV0dXJuIHBhcnNlcihwb3MgPT4ge1xuICAgICAgICByZXR1cm4gYW5kVGhlbihwMSwgcDIpLmZtYXAoKFt4LCB5XSkgPT4geCkucnVuKHBvcyk7XG4gICAgfSwgbGFiZWwpLnNldExhYmVsKGxhYmVsKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRpc2NhcmRGaXJzdChwMSwgcDIpIHtcbiAgICBjb25zdCBsYWJlbCA9IHAxLmxhYmVsICsgJyBkaXNjYXJkRmlyc3QgJyArIHAyLmxhYmVsO1xuICAgIHJldHVybiBwYXJzZXIocG9zID0+IHtcbiAgICAgICAgcmV0dXJuIGFuZFRoZW4ocDEsIHAyKS5mbWFwKChbeCwgeV0pID0+IHkpLnJ1bihwb3MpO1xuICAgIH0sIGxhYmVsKS5zZXRMYWJlbChsYWJlbCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzZXBCeTFCb29rKHB4LCBzZXApIHtcbiAgICByZXR1cm4gcHguYW5kVGhlbihtYW55KHNlcC5kaXNjYXJkRmlyc3QocHgpKSkuZm1hcCgoW3IsIHJsaXN0XSkgPT4gW3JdLmNvbmNhdChybGlzdCkpO1xufVxuXG4vLyBteSB2ZXJzaW9uIHdvcmtzIGp1c3QgZmluZS4uLlxuZXhwb3J0IGZ1bmN0aW9uIHNlcEJ5MSh2YWx1ZVAsIHNlcGFyYXRvclApIHtcbiAgICByZXR1cm4gbWFueShtYW55MSh2YWx1ZVApLmRpc2NhcmRTZWNvbmQob3B0KHNlcGFyYXRvclApKSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBiZXR3ZWVuKHAxLCBwMiwgcDMpIHtcbiAgICByZXR1cm4gcDEuZGlzY2FyZEZpcnN0KHAyKS5kaXNjYXJkU2Vjb25kKHAzKVxuICAgICAgICAuc2V0TGFiZWwoJ2JldHdlZW4gJyArIHAxLmxhYmVsICsgJy8nICsgcDIubGFiZWwgKyAnLycgKyBwMy5sYWJlbCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBiZXR3ZWVuUGFyZW5zKHB4KSB7XG4gICAgcmV0dXJuIGJldHdlZW4ocGNoYXIoJygnKSwgcHgsIHBjaGFyKCcpJykpXG4gICAgICAgIC5zZXRMYWJlbCgnYmV0d2VlblBhcmVucyAnICsgcHgubGFiZWwpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYmluZFAoZmFtYiwgcHgpIHtcbiAgICBsZXQgbGFiZWwgPSAndW5rbm93bic7XG4gICAgcmV0dXJuIHBhcnNlcihwb3MgPT4ge1xuICAgICAgICBjb25zdCByZXMgPSBweC5ydW4ocG9zKTtcbiAgICAgICAgaWYgKHJlcy5pc0ZhaWx1cmUpIHJldHVybiByZXM7XG4gICAgICAgIHJldHVybiBmYW1iKHJlcy52YWx1ZVswXSkucnVuKHJlcy52YWx1ZVsxXSk7XG4gICAgfSwgbGFiZWwpLnNldExhYmVsKGxhYmVsKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHRhcFAocHgsIGZuKSB7XG4gICAgcmV0dXJuIHB4LmJpbmQocmVzID0+IHtcbiAgICAgICAgZm4ocmVzKTtcbiAgICAgICAgcmV0dXJuIHJldHVyblAocmVzKTtcbiAgICB9KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGxvZ1AocHgpIHtcbiAgICByZXR1cm4gdGFwUChweCwgcmVzID0+IGNvbnNvbGUubG9nKHB4LmxhYmVsICsgJzonICsgcmVzKSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwd29yZCh3b3JkKSB7XG4gICAgcmV0dXJuIG9wdChtYW55KHdoaXRlUCkpXG4gICAgICAgIC5kaXNjYXJkRmlyc3QocHN0cmluZyh3b3JkKSlcbiAgICAgICAgLmRpc2NhcmRTZWNvbmQob3B0KG1hbnkod2hpdGVQKSkpXG4gICAgICAgIC5zZXRMYWJlbCgncHdvcmQgJyArIHdvcmQpO1xufVxuXG5mdW5jdGlvbiBfY29ucyh4KSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uICh4cykge1xuICAgICAgICByZXR1cm4gW3hdLmNvbmNhdCh4cyk7XG4gICAgfTtcbn1cblxuZnVuY3Rpb24gX3NldExhYmVsKHB4LCBuZXdMYWJlbCkge1xuICAgIHJldHVybiBwYXJzZXIocG9zID0+IHtcbiAgICAgICAgbGV0IHJlc3VsdCA9IHB4LnJ1bihwb3MpO1xuICAgICAgICBpZiAocmVzdWx0LmlzRmFpbHVyZSkgcmV0dXJuIFZhbGlkYXRpb24uRmFpbHVyZShUdXBsZS5UcmlwbGUobmV3TGFiZWwsIHJlc3VsdC52YWx1ZVsxXSwgcmVzdWx0LnZhbHVlWzJdKSk7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSwgbmV3TGFiZWwpO1xufVxuXG4vLyB0aGUgcmVhbCB0aGluZy4uLlxuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlcihmbiwgbGFiZWwpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICB0eXBlOiAncGFyc2VyJyxcbiAgICAgICAgbGFiZWw6IGxhYmVsLFxuICAgICAgICBydW4ocG9zKSB7XG4gICAgICAgICAgICByZXR1cm4gZm4ocG9zKTtcbiAgICAgICAgfSxcbiAgICAgICAgYXBwbHkocHgpIHtcbiAgICAgICAgICAgIHJldHVybiBhcHBseVAodGhpcykocHgpO1xuICAgICAgICAgICAgLy9yZXR1cm4gdGhpcy5iaW5kKGFuZFRoZW4odGhpcywgcHgpLmZtYXAoKFtmLCB4XSkgPT4gZih4KSkpLnJ1bjsgLy8gd2UgYXJlIHRoZSBmUFxuICAgICAgICB9LFxuICAgICAgICBmbWFwKGZhYikge1xuICAgICAgICAgICAgLy9yZXR1cm4gZm1hcChmYWIsIHRoaXMpO1xuICAgICAgICAgICAgLy9yZXR1cm4gYmluZFAocG9zID0+IHJldHVyblAoZmFiKHBvcykpLCB0aGlzKTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmJpbmQocGFyc2VkVmFsdWUgPT4gcmV0dXJuUChmYWIocGFyc2VkVmFsdWUpKSk7XG4gICAgICAgIH0sXG4gICAgICAgIGFuZFRoZW4ocHgpIHtcbiAgICAgICAgICAgIHJldHVybiBhbmRUaGVuKHRoaXMsIHB4KTtcbiAgICAgICAgfSxcbiAgICAgICAgb3JFbHNlKHB4KSB7XG4gICAgICAgICAgICByZXR1cm4gb3JFbHNlKHRoaXMsIHB4KTtcbiAgICAgICAgfSxcbiAgICAgICAgZGlzY2FyZEZpcnN0KHB4KSB7XG4gICAgICAgICAgICByZXR1cm4gZGlzY2FyZEZpcnN0KHRoaXMsIHB4KTtcbiAgICAgICAgfSxcbiAgICAgICAgZGlzY2FyZFNlY29uZChweCkge1xuICAgICAgICAgICAgcmV0dXJuIGRpc2NhcmRTZWNvbmQodGhpcywgcHgpO1xuICAgICAgICB9LFxuICAgICAgICBiaW5kKGZhbWIpIHtcbiAgICAgICAgICAgIHJldHVybiBiaW5kUChmYW1iLCB0aGlzKTtcbiAgICAgICAgfSxcbiAgICAgICAgc2V0TGFiZWwobmV3TGFiZWwpIHtcbiAgICAgICAgICAgIHJldHVybiBfc2V0TGFiZWwodGhpcywgbmV3TGFiZWwpO1xuICAgICAgICB9XG4gICAgfTtcbn1cbiJdfQ==