define(['exports', 'classes', 'maybe', 'validation'], function (exports, _classes, _maybe, _validation) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.whiteP = exports.digitP = exports.letterP = exports.uppercaseP = exports.lowercaseP = exports.discardFirst = exports.discardSecond = exports.orElse = exports.andThen = exports.predicateBasedParser = exports.digitParser = exports.charParser = undefined;
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
        var label = 'opt ' + xP.label + isDefault ? 'default=' + defaultValue : '';
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
        return tapP(px, console.log);
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

    var lowercaseP = exports.lowercaseP = anyOf(['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z']);
    var uppercaseP = exports.uppercaseP = anyOf(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']);
    var letterP = exports.letterP = lowercaseP.orElse(uppercaseP);
    var digitP = exports.digitP = anyOf(['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']);
    var whiteP = exports.whiteP = anyOf([' ', '\t', '\n', '\r']);
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2pzL3BhcnNlcnMuanMiXSwibmFtZXMiOlsicGNoYXIiLCJwZGlnaXQiLCJhbmRUaGVuQmluZCIsImNob2ljZSIsImFueU9mIiwiZm1hcCIsInJldHVyblAiLCJhcHBseVB4IiwiYXBwbHlQIiwibGlmdDIiLCJzZXF1ZW5jZVAiLCJzZXF1ZW5jZVAyIiwicHN0cmluZyIsInplcm9Pck1vcmUiLCJtYW55IiwibWFueUNoYXJzIiwibWFueTEiLCJtYW55Q2hhcnMxIiwib3B0Iiwib3B0Qm9vayIsInNlcEJ5MUJvb2siLCJzZXBCeTEiLCJiZXR3ZWVuIiwiYmV0d2VlblBhcmVucyIsImJpbmRQIiwidGFwUCIsImxvZ1AiLCJwYXJzZXIiLCJjaGFyUGFyc2VyIiwicG9zIiwiZnJvbVRleHQiLCJvcHRDaGFyIiwiY2hhciIsImlzTm90aGluZyIsIkZhaWx1cmUiLCJUcmlwbGUiLCJ2YWx1ZSIsIlN1Y2Nlc3MiLCJQYWlyIiwiaW5jclBvcyIsImRpZ2l0UGFyc2VyIiwicGFyc2VJbnQiLCJkaWdpdCIsInByZWRpY2F0ZUJhc2VkUGFyc2VyIiwicHJlZCIsImxhYmVsIiwicmVzdWx0Iiwic2V0TGFiZWwiLCJhbmRUaGVuIiwicDEiLCJwMiIsInJlczEiLCJydW4iLCJpc1N1Y2Nlc3MiLCJyZXMyIiwiYmluZCIsInBhcnNlZFZhbHVlMSIsInBhcnNlZFZhbHVlMiIsIm9yRWxzZSIsIl9mYWlsIiwiX3N1Y2NlZWQiLCJwYXJzZXJzIiwicmVkdWNlUmlnaHQiLCJyZXN0IiwiY3VyciIsInJlZHVjZSIsImFjYyIsImNoYXJzIiwibWFwIiwiZmFiIiwicGFyc2VyMSIsInRvU3RyaW5nIiwicmVzIiwiZlAiLCJ4UCIsImYiLCJ4IiwicGFyc2VkVmFsdWVmIiwicGFyc2VkVmFsdWV4IiwiZmFhYiIsInBhcnNlcjIiLCJhcHBseSIsIl9jb25zIiwieSIsInN0ciIsInNwbGl0IiwiaXNGYWlsdXJlIiwicmVzTiIsImNvbmNhdCIsImFycmEiLCJqb2luIiwiZGVmYXVsdFZhbHVlIiwiaXNEZWZhdWx0IiwiSnVzdCIsIm91dGNvbWUiLCJOb3RoaW5nIiwicFgiLCJzb21lUCIsIm5vbmVQIiwiZGlzY2FyZFNlY29uZCIsImRpc2NhcmRGaXJzdCIsInB4Iiwic2VwIiwiciIsInJsaXN0IiwidmFsdWVQIiwic2VwYXJhdG9yUCIsInAzIiwiZmFtYiIsImZuIiwiY29uc29sZSIsImxvZyIsInhzIiwiX3NldExhYmVsIiwibmV3TGFiZWwiLCJ0eXBlIiwicGFyc2VkVmFsdWUiLCJsb3dlcmNhc2VQIiwidXBwZXJjYXNlUCIsImxldHRlclAiLCJkaWdpdFAiLCJ3aGl0ZVAiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7WUFtQ2dCQSxLLEdBQUFBLEs7WUFRQUMsTSxHQUFBQSxNO1lBa0JBQyxXLEdBQUFBLFc7WUF3QkFDLE0sR0FBQUEsTTtZQUtBQyxLLEdBQUFBLEs7WUFLQUMsSSxHQUFBQSxJO1lBU0FDLE8sR0FBQUEsTztZQUtBQyxPLEdBQUFBLE87WUFPQUMsTSxHQUFBQSxNO1lBVUFDLEssR0FBQUEsSztZQVVBQyxTLEdBQUFBLFM7WUFRQUMsVSxHQUFBQSxVO1lBT0FDLE8sR0FBQUEsTztZQUtBQyxVLEdBQUFBLFU7WUFTQUMsSSxHQUFBQSxJO1lBT0FDLFMsR0FBQUEsUztZQU1BQyxLLEdBQUFBLEs7WUFVQUMsVSxHQUFBQSxVO1lBTUFDLEcsR0FBQUEsRztZQWFBQyxPLEdBQUFBLE87WUFvQkFDLFUsR0FBQUEsVTtZQUtBQyxNLEdBQUFBLE07WUFJQUMsTyxHQUFBQSxPO1lBS0FDLGEsR0FBQUEsYTtZQUtBQyxLLEdBQUFBLEs7WUFTQUMsSSxHQUFBQSxJO1lBT0FDLEksR0FBQUEsSTtZQW1CQUMsTSxHQUFBQSxNOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBbFJ1Qjs7QUFFdkMsUUFBTUMsYUFBYSxTQUFiQSxVQUFhO0FBQUEsZUFBUSxlQUFPO0FBQzlCLGdCQUFJLE9BQU9DLEdBQVAsS0FBZSxRQUFuQixFQUE2QkEsTUFBTSxrQkFBU0MsUUFBVCxD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QUF6SCxFQUE4SCxHQUE5SCxDQUFOLENBQW5CO0FBQ0EsUUFBTW1ILDRCQUFVRixXQUFXM0QsTUFBWCxDQUFrQjRELFVBQWxCLENBQWhCO0FBQ0EsUUFBTUUsMEJBQVNwSCxNQUFNLENBQUMsR0FBRCxFQUFNLEdBQU4sRUFBVyxHQUFYLEVBQWdCLEdBQWhCLEVBQXFCLEdBQXJCLEVBQTBCLEdBQTFCLEVBQStCLEdBQS9CLEVBQW9DLEdBQXBDLEVBQXlDLEdBQXpDLEVBQThDLEdBQTlDLENBQU4sQ0FBZjtBQUNBLFFBQU1xSCwwQkFBU3JILE1BQU0sQ0FBQyxHQUFELEVBQU0sSUFBTixFQUFZLElBQVosRUFBa0IsSUFBbEIsQ0FBTixDQUFmIiwiZmlsZSI6InBhcnNlcnMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBjZnIuIFwiVW5kZXJzdGFuZGluZyBQYXJzZXIgQ29tYmluYXRvcnNcIiAoRiMgZm9yIEZ1biBhbmQgUHJvZml0KVxuXG5pbXBvcnQge1xuICAgIFR1cGxlLFxuICAgIFBvc2l0aW9uLFxufSBmcm9tICdjbGFzc2VzJztcbmltcG9ydCB7TWF5YmV9IGZyb20gJ21heWJlJzsgLy8gSnVzdCBvciBOb3RoaW5nXG5pbXBvcnQge1ZhbGlkYXRpb259IGZyb20gJ3ZhbGlkYXRpb24nOyAvLyBTdWNjZXNzIG9yIEZhaWx1cmVcblxuY29uc3QgY2hhclBhcnNlciA9IGNoYXIgPT4gcG9zID0+IHtcbiAgICBpZiAodHlwZW9mIHBvcyA9PT0gJ3N0cmluZycpIHBvcyA9IFBvc2l0aW9uLmZyb21UZXh0KHBvcyk7XG4gICAgY29uc3Qgb3B0Q2hhciA9IHBvcy5jaGFyKCk7XG4gICAgaWYgKG9wdENoYXIuaXNOb3RoaW5nKSByZXR1cm4gVmFsaWRhdGlvbi5GYWlsdXJlKFR1cGxlLlRyaXBsZSgnY2hhclBhcnNlcicsICdubyBtb3JlIGlucHV0JywgcG9zKSk7XG4gICAgaWYgKG9wdENoYXIudmFsdWUgPT09IGNoYXIpIHJldHVybiBWYWxpZGF0aW9uLlN1Y2Nlc3MoVHVwbGUuUGFpcihjaGFyLCBwb3MuaW5jclBvcygpKSk7XG4gICAgcmV0dXJuIFZhbGlkYXRpb24uRmFpbHVyZShUdXBsZS5UcmlwbGUoJ2NoYXJQYXJzZXInLCAnd2FudGVkICcgKyBjaGFyICsgJzsgZ290ICcgKyBvcHRDaGFyLnZhbHVlLCBwb3MpKTtcbn07XG5cbmNvbnN0IGRpZ2l0UGFyc2VyID0gZGlnaXQgPT4gcG9zID0+IHtcbiAgICBpZiAodHlwZW9mIHBvcyA9PT0gJ3N0cmluZycpIHBvcyA9IFBvc2l0aW9uLmZyb21UZXh0KHBvcyk7XG4gICAgY29uc3Qgb3B0Q2hhciA9IHBvcy5jaGFyKCk7XG4gICAgaWYgKG9wdENoYXIuaXNOb3RoaW5nKSByZXR1cm4gVmFsaWRhdGlvbi5GYWlsdXJlKFR1cGxlLlRyaXBsZSgnZGlnaXRQYXJzZXInLCAnbm8gbW9yZSBpbnB1dCcsIHBvcykpO1xuICAgIGlmIChwYXJzZUludChvcHRDaGFyLnZhbHVlLCAxMCkgPT09IGRpZ2l0KSByZXR1cm4gVmFsaWRhdGlvbi5TdWNjZXNzKFR1cGxlLlBhaXIoZGlnaXQsIHBvcy5pbmNyUG9zKCkpKTtcbiAgICByZXR1cm4gVmFsaWRhdGlvbi5GYWlsdXJlKFR1cGxlLlRyaXBsZSgnZGlnaXRQYXJzZXInLCAnd2FudGVkICcgKyBkaWdpdCArICc7IGdvdCAnICsgb3B0Q2hhci52YWx1ZSwgcG9zKSk7XG59O1xuXG5jb25zdCBwcmVkaWNhdGVCYXNlZFBhcnNlciA9IChwcmVkLCBsYWJlbCkgPT4gcG9zID0+IHtcbiAgICBpZiAodHlwZW9mIHBvcyA9PT0gJ3N0cmluZycpIHBvcyA9IFBvc2l0aW9uLmZyb21UZXh0KHBvcyk7XG4gICAgY29uc3Qgb3B0Q2hhciA9IHBvcy5jaGFyKCk7XG4gICAgaWYgKG9wdENoYXIuaXNOb3RoaW5nKSByZXR1cm4gVmFsaWRhdGlvbi5GYWlsdXJlKFR1cGxlLlRyaXBsZShsYWJlbCwgJ25vIG1vcmUgaW5wdXQnLCBwb3MpKTtcbiAgICBpZiAocHJlZChvcHRDaGFyLnZhbHVlKSkgcmV0dXJuIFZhbGlkYXRpb24uU3VjY2VzcyhUdXBsZS5QYWlyKG9wdENoYXIudmFsdWUsIHBvcy5pbmNyUG9zKCkpKTtcbiAgICByZXR1cm4gVmFsaWRhdGlvbi5GYWlsdXJlKFR1cGxlLlRyaXBsZShsYWJlbCwgJ3VuZXhwZWN0ZWQgY2hhcjogJyArIG9wdENoYXIudmFsdWUsIHBvcykpO1xufTtcblxuZXhwb3J0IHtjaGFyUGFyc2VyLCBkaWdpdFBhcnNlciwgcHJlZGljYXRlQmFzZWRQYXJzZXJ9O1xuXG5leHBvcnQgZnVuY3Rpb24gcGNoYXIoY2hhcikge1xuICAgIGNvbnN0IGxhYmVsID0gJ3BjaGFyXycgKyBjaGFyO1xuICAgIGxldCByZXN1bHQgPSBmdW5jdGlvbiAocG9zKSB7XG4gICAgICAgIHJldHVybiBjaGFyUGFyc2VyKGNoYXIpKHBvcyk7XG4gICAgfTtcbiAgICByZXR1cm4gcGFyc2VyKHJlc3VsdCwgbGFiZWwpLnNldExhYmVsKGxhYmVsKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHBkaWdpdChkaWdpdCkge1xuICAgIHJldHVybiBwYXJzZXIocG9zID0+IGRpZ2l0UGFyc2VyKGRpZ2l0KShwb3MpLCAncGRpZ2l0XycgKyBkaWdpdCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhbmRUaGVuKHAxLCBwMikge1xuICAgIGNvbnN0IGxhYmVsID0gcDEubGFiZWwgKyAnIGFuZFRoZW4gJyArIHAyLmxhYmVsO1xuICAgIHJldHVybiBwYXJzZXIoZnVuY3Rpb24gKHBvcykge1xuICAgICAgICBsZXQgcmVzMSA9IHAxLnJ1bihwb3MpO1xuICAgICAgICBpZiAocmVzMS5pc1N1Y2Nlc3MpIHtcbiAgICAgICAgICAgIGxldCByZXMyID0gcDIucnVuKHJlczEudmFsdWVbMV0pO1xuICAgICAgICAgICAgaWYgKHJlczIuaXNTdWNjZXNzKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFZhbGlkYXRpb24uU3VjY2VzcyhUdXBsZS5QYWlyKFR1cGxlLlBhaXIocmVzMS52YWx1ZVswXSwgcmVzMi52YWx1ZVswXSksIHJlczIudmFsdWVbMV0pKTtcbiAgICAgICAgICAgIH0gZWxzZSByZXR1cm4gVmFsaWRhdGlvbi5GYWlsdXJlKFR1cGxlLlRyaXBsZShsYWJlbCwgcmVzMi52YWx1ZVsxXSwgcmVzMi52YWx1ZVsyXSkpO1xuICAgICAgICB9IGVsc2UgcmV0dXJuIFZhbGlkYXRpb24uRmFpbHVyZShUdXBsZS5UcmlwbGUobGFiZWwsIHJlczEudmFsdWVbMV0sIHJlczEudmFsdWVbMl0pKTtcbiAgICB9LCBsYWJlbCk7XG59XG5cbi8vIHVzaW5nIGJpbmRcbmV4cG9ydCBmdW5jdGlvbiBhbmRUaGVuQmluZChwMSwgcDIpIHtcbiAgICByZXR1cm4gcDEuYmluZChwYXJzZWRWYWx1ZTEgPT4ge1xuICAgICAgICByZXR1cm4gcDIuYmluZChwYXJzZWRWYWx1ZTIgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHJldHVyblAoVHVwbGUuUGFpcihwYXJzZWRWYWx1ZTEsIHBhcnNlZFZhbHVlMikpO1xuICAgICAgICB9KTtcbiAgICB9KS5zZXRMYWJlbChwMS5sYWJlbCArICcgYW5kVGhlbiAnICsgcDIubGFiZWwpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gb3JFbHNlKHAxLCBwMikge1xuICAgIGNvbnN0IGxhYmVsID0gcDEubGFiZWwgKyAnIG9yRWxzZSAnICsgcDIubGFiZWw7XG4gICAgcmV0dXJuIHBhcnNlcihwb3MgPT4ge1xuICAgICAgICBjb25zdCByZXMxID0gcDEucnVuKHBvcyk7XG4gICAgICAgIGlmIChyZXMxLmlzU3VjY2VzcykgcmV0dXJuIHJlczE7XG4gICAgICAgIGNvbnN0IHJlczIgPSBwMi5ydW4ocG9zKTtcbiAgICAgICAgaWYgKHJlczIuaXNTdWNjZXNzKSByZXR1cm4gcmVzMjtcbiAgICAgICAgcmV0dXJuIFZhbGlkYXRpb24uRmFpbHVyZShUdXBsZS5UcmlwbGUobGFiZWwsIHJlczIudmFsdWVbMV0sIHJlczIudmFsdWVbMl0pKTtcbiAgICB9LCBsYWJlbCkuc2V0TGFiZWwobGFiZWwpO1xufVxuXG5sZXQgX2ZhaWwgPSBwYXJzZXIocG9zID0+IFZhbGlkYXRpb24uRmFpbHVyZShUdXBsZS5UcmlwbGUoJ3BhcnNpbmcgZmFpbGVkJywgJ19mYWlsJywgcG9zKSkpO1xuXG4vLyByZXR1cm4gbmV1dHJhbCBlbGVtZW50IGluc3RlYWQgb2YgbWVzc2FnZVxubGV0IF9zdWNjZWVkID0gcGFyc2VyKHBvcyA9PiBWYWxpZGF0aW9uLlN1Y2Nlc3MoVHVwbGUuUGFpcihUdXBsZS5QYWlyKCdwYXJzaW5nIHN1Y2NlZWRlZCcsIHBvcyksICdfc3VjY2VlZCcpKSk7XG5cbmV4cG9ydCBmdW5jdGlvbiBjaG9pY2UocGFyc2Vycykge1xuICAgIHJldHVybiBwYXJzZXJzLnJlZHVjZVJpZ2h0KChyZXN0LCBjdXJyKSA9PiBvckVsc2UoY3VyciwgcmVzdCksIF9mYWlsKVxuICAgICAgICAuc2V0TGFiZWwoJ2Nob2ljZSAnICsgcGFyc2Vycy5yZWR1Y2UoKGFjYywgY3VycikgPT4gYWNjICsgJy8nICsgY3Vyci5sYWJlbCwgJycpKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGFueU9mKGNoYXJzKSB7XG4gICAgcmV0dXJuIGNob2ljZShjaGFycy5tYXAocGNoYXIpKVxuICAgICAgICAuc2V0TGFiZWwoJ2FueU9mICcgKyBjaGFycy5yZWR1Y2UoKGFjYywgY3VycikgPT4gYWNjICsgY3VyciwgJycpKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGZtYXAoZmFiLCBwYXJzZXIxKSB7XG4gICAgY29uc3QgbGFiZWwgPSBwYXJzZXIxLmxhYmVsICsgJyBmbWFwICcgKyBmYWIudG9TdHJpbmcoKTtcbiAgICByZXR1cm4gcGFyc2VyKHBvcyA9PiB7XG4gICAgICAgIGxldCByZXMgPSBwYXJzZXIxLnJ1bihwb3MpO1xuICAgICAgICBpZiAocmVzLmlzU3VjY2VzcykgcmV0dXJuIFZhbGlkYXRpb24uU3VjY2VzcyhUdXBsZS5QYWlyKGZhYihyZXMudmFsdWVbMF0pLCByZXMudmFsdWVbMV0pKTtcbiAgICAgICAgcmV0dXJuIFZhbGlkYXRpb24uRmFpbHVyZShUdXBsZS5UcmlwbGUobGFiZWwsIHJlcy52YWx1ZVsxXSwgcmVzLnZhbHVlWzJdKSk7XG4gICAgfSwgbGFiZWwpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcmV0dXJuUCh2YWx1ZSkge1xuICAgIHJldHVybiBwYXJzZXIocG9zID0+IFZhbGlkYXRpb24uU3VjY2VzcyhUdXBsZS5QYWlyKHZhbHVlLCBwb3MpKSwgdmFsdWUpO1xufVxuXG4vLyBwYXJzZXIoYSAtPiBiKSAtPiBwYXJzZXIoYSkgLT4gcGFyc2VyKGIpXG5leHBvcnQgZnVuY3Rpb24gYXBwbHlQeChmUCkge1xuICAgIHJldHVybiBmdW5jdGlvbiAoeFApIHtcbiAgICAgICAgcmV0dXJuIGFuZFRoZW4oZlAsIHhQKS5mbWFwKChbZiwgeF0pID0+IGYoeCkpO1xuICAgIH07XG59XG5cbi8vIHVzaW5nIGJpbmRcbmV4cG9ydCBmdW5jdGlvbiBhcHBseVAoZlApIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKHhQKSB7XG4gICAgICAgIHJldHVybiBmUC5iaW5kKHBhcnNlZFZhbHVlZiA9PiB7XG4gICAgICAgICAgICByZXR1cm4geFAuYmluZChwYXJzZWRWYWx1ZXggPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiByZXR1cm5QKHBhcnNlZFZhbHVlZihwYXJzZWRWYWx1ZXgpKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbGlmdDIoZmFhYikge1xuICAgIHJldHVybiBmdW5jdGlvbiAocGFyc2VyMSkge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKHBhcnNlcjIpIHtcbiAgICAgICAgICAgIC8vcmV0dXJuIGFwcGx5UChhcHBseVAocmV0dXJuUChmYWFiKSkocGFyc2VyMSkpKHBhcnNlcjIpO1xuICAgICAgICAgICAgcmV0dXJuIHJldHVyblAoZmFhYikuYXBwbHkocGFyc2VyMSkuYXBwbHkocGFyc2VyMik7IC8vIHVzaW5nIGluc3RhbmNlIG1ldGhvZHNcbiAgICAgICAgfTtcbiAgICB9O1xufVxuXG4vLyB1c2luZyBsaWZ0Mihjb25zKVxuZXhwb3J0IGZ1bmN0aW9uIHNlcXVlbmNlUChwYXJzZXJzKSB7XG4gICAgcmV0dXJuIHBhcnNlcnNcbiAgICAgICAgLnJlZHVjZVJpZ2h0KChyZXN0LCBjdXJyKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gbGlmdDIoX2NvbnMpKGN1cnIpKHJlc3QpO1xuICAgICAgICB9LCByZXR1cm5QKFtdKSk7XG59XG5cbi8vIHVzaW5nIG5haXZlIGFuZFRoZW4gJiYgZm1hcCAtLT4gcmV0dXJucyBzdHJpbmdzLCBub3QgYXJyYXlzIVxuZXhwb3J0IGZ1bmN0aW9uIHNlcXVlbmNlUDIocGFyc2Vycykge1xuICAgIHJldHVybiBwYXJzZXJzXG4gICAgICAgIC5yZWR1Y2VSaWdodCgocmVzdCwgY3VycikgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIGZtYXAoKFt4LCB5XSkgPT4geCArIHksIGFuZFRoZW4oY3VyciwgcmVzdCkpO1xuICAgICAgICB9LCByZXR1cm5QKCcnKSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwc3RyaW5nKHN0cikge1xuICAgIHJldHVybiBzZXF1ZW5jZVAoc3RyLnNwbGl0KCcnKS5tYXAocGNoYXIpKVxuICAgICAgICAuc2V0TGFiZWwoJ3BzdHJpbmcgJyArIHN0cik7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB6ZXJvT3JNb3JlKHhQKSB7IC8vIHplcm9Pck1vcmUgOjogcCBhIC0+IFthXSAtPiB0cnkgW2FdID0gcCBhIC0+IHAgW2FdXG4gICAgcmV0dXJuIHBvcyA9PiB7XG4gICAgICAgIGxldCByZXMxID0geFAucnVuKHBvcyk7XG4gICAgICAgIGlmIChyZXMxLmlzRmFpbHVyZSkgcmV0dXJuIFZhbGlkYXRpb24uU3VjY2VzcyhUdXBsZS5QYWlyKFtdLCBwb3MpKTtcbiAgICAgICAgbGV0IHJlc04gPSB6ZXJvT3JNb3JlKHhQKShyZXMxLnZhbHVlWzFdKTtcbiAgICAgICAgcmV0dXJuIFZhbGlkYXRpb24uU3VjY2VzcyhUdXBsZS5QYWlyKFtyZXMxLnZhbHVlWzBdXS5jb25jYXQocmVzTi52YWx1ZVswXSksIHJlc04udmFsdWVbMV0pKTtcbiAgICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbWFueSh4UCkge1xuICAgIGNvbnN0IGxhYmVsID0gJ21hbnkgJyArIHhQLmxhYmVsO1xuICAgIHJldHVybiBwYXJzZXIocG9zID0+IHtcbiAgICAgICAgcmV0dXJuIHplcm9Pck1vcmUoeFApKHBvcyk7XG4gICAgfSwgbGFiZWwpLnNldExhYmVsKGxhYmVsKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1hbnlDaGFycyh4UCkge1xuICAgIHJldHVybiBtYW55KHhQKVxuICAgICAgICAuZm1hcChhcnJhID0+IGFycmEuam9pbignJykpXG4gICAgICAgIC5zZXRMYWJlbCgnbWFueUNoYXJzICcgKyB4UC5sYWJlbCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtYW55MSh4UCkge1xuICAgIGNvbnN0IGxhYmVsID0gJ21hbnkxICcgKyB4UC5sYWJlbDtcbiAgICByZXR1cm4gcGFyc2VyKHBvcyA9PiB7XG4gICAgICAgIGxldCByZXMxID0geFAucnVuKHBvcyk7XG4gICAgICAgIGlmIChyZXMxLmlzRmFpbHVyZSkgcmV0dXJuIHJlczE7XG4gICAgICAgIGxldCByZXNOID0gemVyb09yTW9yZSh4UCkocmVzMS52YWx1ZVsxXSk7XG4gICAgICAgIHJldHVybiBWYWxpZGF0aW9uLlN1Y2Nlc3MoVHVwbGUuUGFpcihbcmVzMS52YWx1ZVswXV0uY29uY2F0KHJlc04udmFsdWVbMF0pLCByZXNOLnZhbHVlWzFdKSk7XG4gICAgfSwgbGFiZWwpLnNldExhYmVsKGxhYmVsKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1hbnlDaGFyczEoeFApIHtcbiAgICByZXR1cm4gbWFueTEoeFApXG4gICAgICAgIC5mbWFwKGFycmEgPT4gYXJyYS5qb2luKCcnKSlcbiAgICAgICAgLnNldExhYmVsKCdtYW55Q2hhcnMxICcgKyB4UC5sYWJlbCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBvcHQoeFAsIGRlZmF1bHRWYWx1ZSkge1xuICAgIGNvbnN0IGlzRGVmYXVsdCA9ICh0eXBlb2YgZGVmYXVsdFZhbHVlICE9PSAndW5kZWZpbmVkJyk7XG4gICAgY29uc3QgbGFiZWwgPSAnb3B0ICcgKyB4UC5sYWJlbFxuICAgICAgICArIGlzRGVmYXVsdCA/ICdkZWZhdWx0PScgKyBkZWZhdWx0VmFsdWUgOiAnJztcbiAgICByZXR1cm4gcGFyc2VyKHBvcyA9PiB7XG4gICAgICAgIGxldCByZXMgPSB4UC5mbWFwKE1heWJlLkp1c3QpLnJ1bihwb3MpO1xuICAgICAgICBpZiAocmVzLmlzU3VjY2VzcykgcmV0dXJuIHJlcztcbiAgICAgICAgbGV0IG91dGNvbWUgPSAoaXNEZWZhdWx0KSA/IE1heWJlLkp1c3QoZGVmYXVsdFZhbHVlKSA6IE1heWJlLk5vdGhpbmcoKTtcbiAgICAgICAgcmV0dXJuIFZhbGlkYXRpb24uU3VjY2VzcyhUdXBsZS5QYWlyKG91dGNvbWUsIHBvcykpO1xuICAgIH0sIGxhYmVsKS5zZXRMYWJlbChsYWJlbCk7XG59XG5cbi8vIG9wdCBmcm9tIHRoZSBib29rIC0gd29ya3Mgb2ssIGJ1dCB0b1N0cmluZygpIGdpdmVzIHN0cmFuZ2UgcmVzdWx0c1xuZXhwb3J0IGZ1bmN0aW9uIG9wdEJvb2socFgpIHtcbiAgICBjb25zdCBzb21lUCA9IHBYLmZtYXAoTWF5YmUuSnVzdCk7XG4gICAgY29uc3Qgbm9uZVAgPSByZXR1cm5QKE1heWJlLk5vdGhpbmcpO1xuICAgIHJldHVybiBzb21lUC5vckVsc2Uobm9uZVApO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZGlzY2FyZFNlY29uZChwMSwgcDIpIHtcbiAgICBjb25zdCBsYWJlbCA9IHAxLmxhYmVsICsgJyBkaXNjYXJkU2Vjb25kICcgKyBwMi5sYWJlbDtcbiAgICByZXR1cm4gcGFyc2VyKHBvcyA9PiB7XG4gICAgICAgIHJldHVybiBhbmRUaGVuKHAxLCBwMikuZm1hcCgoW3gsIHldKSA9PiB4KS5ydW4ocG9zKTtcbiAgICB9LCBsYWJlbCkuc2V0TGFiZWwobGFiZWwpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZGlzY2FyZEZpcnN0KHAxLCBwMikge1xuICAgIGNvbnN0IGxhYmVsID0gcDEubGFiZWwgKyAnIGRpc2NhcmRGaXJzdCAnICsgcDIubGFiZWw7XG4gICAgcmV0dXJuIHBhcnNlcihwb3MgPT4ge1xuICAgICAgICByZXR1cm4gYW5kVGhlbihwMSwgcDIpLmZtYXAoKFt4LCB5XSkgPT4geSkucnVuKHBvcyk7XG4gICAgfSwgbGFiZWwpLnNldExhYmVsKGxhYmVsKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNlcEJ5MUJvb2socHgsIHNlcCkge1xuICAgIHJldHVybiBweC5hbmRUaGVuKG1hbnkoc2VwLmRpc2NhcmRGaXJzdChweCkpKS5mbWFwKChbciwgcmxpc3RdKSA9PiBbcl0uY29uY2F0KHJsaXN0KSk7XG59XG5cbi8vIG15IHZlcnNpb24gd29ya3MganVzdCBmaW5lLi4uXG5leHBvcnQgZnVuY3Rpb24gc2VwQnkxKHZhbHVlUCwgc2VwYXJhdG9yUCkge1xuICAgIHJldHVybiBtYW55KG1hbnkxKHZhbHVlUCkuZGlzY2FyZFNlY29uZChvcHQoc2VwYXJhdG9yUCkpKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGJldHdlZW4ocDEsIHAyLCBwMykge1xuICAgIHJldHVybiBwMS5kaXNjYXJkRmlyc3QocDIpLmRpc2NhcmRTZWNvbmQocDMpXG4gICAgICAgIC5zZXRMYWJlbCgnYmV0d2VlbiAnICsgcDEubGFiZWwgKyAnLycgKyBwMi5sYWJlbCArICcvJyArIHAzLmxhYmVsKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGJldHdlZW5QYXJlbnMocHgpIHtcbiAgICByZXR1cm4gYmV0d2VlbihwY2hhcignKCcpLCBweCwgcGNoYXIoJyknKSlcbiAgICAgICAgLnNldExhYmVsKCdiZXR3ZWVuUGFyZW5zICcgKyBweC5sYWJlbCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBiaW5kUChmYW1iLCBweCkge1xuICAgIGxldCBsYWJlbCA9ICd1bmtub3duJztcbiAgICByZXR1cm4gcGFyc2VyKHBvcyA9PiB7XG4gICAgICAgIGNvbnN0IHJlcyA9IHB4LnJ1bihwb3MpO1xuICAgICAgICBpZiAocmVzLmlzRmFpbHVyZSkgcmV0dXJuIHJlcztcbiAgICAgICAgcmV0dXJuIGZhbWIocmVzLnZhbHVlWzBdKS5ydW4ocmVzLnZhbHVlWzFdKTtcbiAgICB9LCBsYWJlbCkuc2V0TGFiZWwobGFiZWwpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdGFwUChweCwgZm4pIHtcbiAgICByZXR1cm4gcHguYmluZChyZXMgPT4ge1xuICAgICAgICBmbihyZXMpO1xuICAgICAgICByZXR1cm4gcmV0dXJuUChyZXMpO1xuICAgIH0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbG9nUChweCkge1xuICAgIHJldHVybiB0YXBQKHB4LCBjb25zb2xlLmxvZyk7XG59XG5cbmZ1bmN0aW9uIF9jb25zKHgpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKHhzKSB7XG4gICAgICAgIHJldHVybiBbeF0uY29uY2F0KHhzKTtcbiAgICB9O1xufVxuXG5mdW5jdGlvbiBfc2V0TGFiZWwocHgsIG5ld0xhYmVsKSB7XG4gICAgcmV0dXJuIHBhcnNlcihwb3MgPT4ge1xuICAgICAgICBsZXQgcmVzdWx0ID0gcHgucnVuKHBvcyk7XG4gICAgICAgIGlmIChyZXN1bHQuaXNGYWlsdXJlKSByZXR1cm4gVmFsaWRhdGlvbi5GYWlsdXJlKFR1cGxlLlRyaXBsZShuZXdMYWJlbCwgcmVzdWx0LnZhbHVlWzFdLCByZXN1bHQudmFsdWVbMl0pKTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LCBuZXdMYWJlbCk7XG59XG5cbi8vIHRoZSByZWFsIHRoaW5nLi4uXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VyKGZuLCBsYWJlbCkge1xuICAgIHJldHVybiB7XG4gICAgICAgIHR5cGU6ICdwYXJzZXInLFxuICAgICAgICBsYWJlbDogbGFiZWwsXG4gICAgICAgIHJ1bihwb3MpIHtcbiAgICAgICAgICAgIHJldHVybiBmbihwb3MpO1xuICAgICAgICB9LFxuICAgICAgICBhcHBseShweCkge1xuICAgICAgICAgICAgcmV0dXJuIGFwcGx5UCh0aGlzKShweCk7XG4gICAgICAgICAgICAvL3JldHVybiB0aGlzLmJpbmQoYW5kVGhlbih0aGlzLCBweCkuZm1hcCgoW2YsIHhdKSA9PiBmKHgpKSkucnVuOyAvLyB3ZSBhcmUgdGhlIGZQXG4gICAgICAgIH0sXG4gICAgICAgIGZtYXAoZmFiKSB7XG4gICAgICAgICAgICAvL3JldHVybiBmbWFwKGZhYiwgdGhpcyk7XG4gICAgICAgICAgICAvL3JldHVybiBiaW5kUChwb3MgPT4gcmV0dXJuUChmYWIocG9zKSksIHRoaXMpO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuYmluZChwYXJzZWRWYWx1ZSA9PiByZXR1cm5QKGZhYihwYXJzZWRWYWx1ZSkpKTtcbiAgICAgICAgfSxcbiAgICAgICAgYW5kVGhlbihweCkge1xuICAgICAgICAgICAgcmV0dXJuIGFuZFRoZW4odGhpcywgcHgpO1xuICAgICAgICB9LFxuICAgICAgICBvckVsc2UocHgpIHtcbiAgICAgICAgICAgIHJldHVybiBvckVsc2UodGhpcywgcHgpO1xuICAgICAgICB9LFxuICAgICAgICBkaXNjYXJkRmlyc3QocHgpIHtcbiAgICAgICAgICAgIHJldHVybiBkaXNjYXJkRmlyc3QodGhpcywgcHgpO1xuICAgICAgICB9LFxuICAgICAgICBkaXNjYXJkU2Vjb25kKHB4KSB7XG4gICAgICAgICAgICByZXR1cm4gZGlzY2FyZFNlY29uZCh0aGlzLCBweCk7XG4gICAgICAgIH0sXG4gICAgICAgIGJpbmQoZmFtYikge1xuICAgICAgICAgICAgcmV0dXJuIGJpbmRQKGZhbWIsIHRoaXMpO1xuICAgICAgICB9LFxuICAgICAgICBzZXRMYWJlbChuZXdMYWJlbCkge1xuICAgICAgICAgICAgcmV0dXJuIF9zZXRMYWJlbCh0aGlzLCBuZXdMYWJlbCk7XG4gICAgICAgIH1cbiAgICB9O1xufVxuXG5leHBvcnQgY29uc3QgbG93ZXJjYXNlUCA9IGFueU9mKFsnYScsICdiJywgJ2MnLCAnZCcsICdlJywgJ2YnLCAnZycsICdoJywgJ2knLCAnaicsICdrJywgJ2wnLCAnbScsICduJywgJ28nLCAncCcsICdxJywgJ3InLCAncycsICd0JywgJ3UnLCAndicsICd3JywgJ3gnLCAneScsICd6JyxdKTtcbmV4cG9ydCBjb25zdCB1cHBlcmNhc2VQID0gYW55T2YoWydBJywgJ0InLCAnQycsICdEJywgJ0UnLCAnRicsICdHJywgJ0gnLCAnSScsICdKJywgJ0snLCAnTCcsICdNJywgJ04nLCAnTycsICdQJywgJ1EnLCAnUicsICdTJywgJ1QnLCAnVScsICdWJywgJ1cnLCAnWCcsICdZJywgJ1onLF0pO1xuZXhwb3J0IGNvbnN0IGxldHRlclAgPSBsb3dlcmNhc2VQLm9yRWxzZSh1cHBlcmNhc2VQKTtcbmV4cG9ydCBjb25zdCBkaWdpdFAgPSBhbnlPZihbJzAnLCAnMScsICcyJywgJzMnLCAnNCcsICc1JywgJzYnLCAnNycsICc4JywgJzknXSk7XG5leHBvcnQgY29uc3Qgd2hpdGVQID0gYW55T2YoWycgJywgJ1xcdCcsICdcXG4nLCAnXFxyJ10pO1xuIl19