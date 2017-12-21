define(['exports', 'util', 'classes', 'maybe', 'validation'], function (exports, _util, _classes, _maybe, _validation) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.discardFirst = exports.discardSecond = exports.fmap = exports.orElse = exports.andThen = exports.digitParser = exports.charParser = undefined;
    exports.pchar = pchar;
    exports.pdigit = pdigit;
    exports.andThenBBB = andThenBBB;
    exports.choice = choice;
    exports.anyOf = anyOf;
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
            return _validation.Validation.Failure((0, _classes.Pair)('charParser', 'wanted ' + char + '; got ' + (0, _util.head)(str)));
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

    function _andThen(p1, p2) {
        var label = p1.label + ' andThen ' + p2.label;
        return parser(function (str) {
            var res1 = p1.run(str);
            if (res1.isSuccess) {
                var res2 = p2.run(res1.value[1]);
                if (res2.isSuccess) {
                    return _validation.Validation.Success((0, _classes.Pair)((0, _classes.Pair)(res1.value[0], res2.value[0]), res2.value[1]));
                } else return _validation.Validation.Failure((0, _classes.Pair)(label, res2.value[1]));
            } else return _validation.Validation.Failure((0, _classes.Pair)(label, res1.value[1]));
        }, label);
    }

    // using bind - TODO: make it work
    exports.andThen = _andThen;
    function andThenBBB(p1, p2) {
        return p1.bind(function (parsedValue1) {
            return p2.bind(function (parsedValue2) {
                return returnP((0, _classes.Pair)(parsedValue1, parsedValue2));
            });
        }).setLabel(p1.label + ' andThen ' + p2.label);
    }

    function _orElse(p1, p2) {
        var label = p1.label + ' orElse ' + p2.label;
        return parser(function (str) {
            var res1 = p1.run(str);
            if (res1.isSuccess) return res1;
            var res2 = p2.run(str);
            if (res2.isSuccess) return res2;
            return _validation.Validation.Failure((0, _classes.Pair)(label, res2.value[1]));
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

    function _fmap(fab, parser1) {
        var label = parser1.label + ' fmap ' + fab.toString();
        return parser(function (str) {
            var res = parser1.run(str);
            if (res.isSuccess) return _validation.Validation.Success((0, _classes.Pair)(fab(res.value[0]), res.value[1]));
            return _validation.Validation.Failure((0, _classes.Pair)(label, res.value[1]));
        }, label);
    }

    exports.fmap = _fmap;
    function returnP(value) {
        return parser(function (str) {
            return _validation.Validation.Success((0, _classes.Pair)(value, str));
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
            return _fmap(function (_ref3) {
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
                // TODO - make all this work
                return _fmap(fab, this);
                //return bindP(str => returnP(fab(str)), this);
                //return this.bind(parsedValue => returnP(fab(parsedValue)));
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2pzL3BhcnNlcnMuanMiXSwibmFtZXMiOlsicGNoYXIiLCJwZGlnaXQiLCJhbmRUaGVuQkJCIiwiY2hvaWNlIiwiYW55T2YiLCJyZXR1cm5QIiwiYXBwbHlQeCIsImFwcGx5UCIsImxpZnQyIiwic2VxdWVuY2VQIiwic2VxdWVuY2VQMiIsInBzdHJpbmciLCJ6ZXJvT3JNb3JlIiwibWFueSIsIm1hbnkxIiwib3B0Iiwib3B0Qm9vayIsImJldHdlZW4iLCJiZXR3ZWVuUGFyZW5zIiwiYmluZFAiLCJwYXJzZXIiLCJjaGFyUGFyc2VyIiwic3RyIiwiRXJyb3IiLCJjaGFyIiwiU3VjY2VzcyIsIkZhaWx1cmUiLCJkaWdpdFBhcnNlciIsInBhcnNlSW50IiwiZGlnaXQiLCJsYWJlbCIsInJlc3VsdCIsInNldExhYmVsIiwiYW5kVGhlbiIsInAxIiwicDIiLCJyZXMxIiwicnVuIiwiaXNTdWNjZXNzIiwicmVzMiIsInZhbHVlIiwiYmluZCIsInBhcnNlZFZhbHVlMSIsInBhcnNlZFZhbHVlMiIsIm9yRWxzZSIsIl9mYWlsIiwiX3N1Y2NlZWQiLCJwYXJzZXJzIiwicmVkdWNlUmlnaHQiLCJyZXN0IiwiY3VyciIsInJlZHVjZSIsImFjYyIsImNoYXJzIiwibWFwIiwiZm1hcCIsImZhYiIsInBhcnNlcjEiLCJ0b1N0cmluZyIsInJlcyIsImZQIiwieFAiLCJmIiwieCIsInBhcnNlZFZhbHVlZiIsInBhcnNlZFZhbHVleCIsImZhYWIiLCJwYXJzZXIyIiwiYXBwbHkiLCJfY29ucyIsInkiLCJzcGxpdCIsImlzRmFpbHVyZSIsInJlc04iLCJjb25jYXQiLCJKdXN0IiwiTm90aGluZyIsInBYIiwic29tZVAiLCJub25lUCIsImRpc2NhcmRTZWNvbmQiLCJyMSIsInIyIiwiZGlzY2FyZEZpcnN0IiwicDMiLCJweCIsImZhbWIiLCJ4cyIsIl9zZXRMYWJlbCIsIm5ld0xhYmVsIiwiZm4iLCJ0eXBlIl0sIm1hcHBpbmdzIjoiOzs7Ozs7O1lBaUNnQkEsSyxHQUFBQSxL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TztBQUNINkQsa0JBQU0sUUFESDtBQUVIN0QsbUJBQU9BLEtBRko7QUFHSE8sZUFIRyxlQUdDZixHQUhELEVBR007QUFDTCx1QkFBT29FLEdBQUdwRSxHQUFILENBQVA7QUFDSCxhQUxFO0FBTUg4QyxpQkFORyxpQkFNR2lCLEVBTkgsRUFNTztBQUNOLHVCQUFPOUUsT0FBTyxJQUFQLEVBQWE4RSxFQUFiLENBQVA7QUFDQTtBQUNILGFBVEU7QUFVSDlCLGdCQVZHLGdCQVVFQyxHQVZGLEVBVU87QUFBRTtBQUNSLHVCQUFPRCxNQUFLQyxHQUFMLEVBQVUsSUFBVixDQUFQO0FBQ0E7QUFDQTtBQUNILGFBZEU7QUFlSHZCLG1CQWZHLG1CQWVLb0QsRUFmTCxFQWVTO0FBQ1IsdUJBQU9wRCxTQUFRLElBQVIsRUFBY29ELEVBQWQsQ0FBUDtBQUNILGFBakJFO0FBa0JIekMsa0JBbEJHLGtCQWtCSXlDLEVBbEJKLEVBa0JRO0FBQ1AsdUJBQU96QyxRQUFPLElBQVAsRUFBYXlDLEVBQWIsQ0FBUDtBQUNILGFBcEJFO0FBcUJIRix3QkFyQkcsd0JBcUJVRSxFQXJCVixFQXFCYztBQUNiLHVCQUFPRixjQUFhLElBQWIsRUFBbUJFLEVBQW5CLENBQVA7QUFDSCxhQXZCRTtBQXdCSEwseUJBeEJHLHlCQXdCV0ssRUF4QlgsRUF3QmU7QUFDZCx1QkFBT0wsZUFBYyxJQUFkLEVBQW9CSyxFQUFwQixDQUFQO0FBQ0gsYUExQkU7QUEyQkg1QyxnQkEzQkcsZ0JBMkJFNkMsSUEzQkYsRUEyQlE7QUFDUCx1QkFBT25FLE1BQU1tRSxJQUFOLEVBQVksSUFBWixDQUFQO0FBQ0gsYUE3QkU7QUE4Qkh0RCxvQkE5Qkcsb0JBOEJNeUQsUUE5Qk4sRUE4QmdCO0FBQ2YsdUJBQU9ELFVBQVUsSUFBVixFQUFnQkMsUUFBaEIsQ0FBUDtBQUNIO0FBaENFLFNBQVA7QUFrQ0giLCJmaWxlIjoicGFyc2Vycy5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vIGNmci4gXCJVbmRlcnN0YW5kaW5nIFBhcnNlciBDb21iaW5hdG9yc1wiIChGIyBmb3IgRnVuIGFuZCBQcm9maXQpXG5cbmltcG9ydCB7XG4gICAgaGVhZCxcbiAgICB0YWlsLFxuICAgIGlzU3VjY2VzcyxcbiAgICBpc0ZhaWx1cmUsXG59IGZyb20gJ3V0aWwnO1xuaW1wb3J0IHtcbiAgICBwYWlyLFxuICAgIHN1Y2Nlc3MsXG4gICAgZmFpbHVyZSxcbiAgICBzb21lLFxuICAgIG5vbmUsXG4gICAgUGFpcixcbn0gZnJvbSAnY2xhc3Nlcyc7XG5pbXBvcnQge01heWJlfSBmcm9tICdtYXliZSc7IC8vIEp1c3Qgb3IgTm90aGluZ1xuaW1wb3J0IHtWYWxpZGF0aW9ufSBmcm9tICd2YWxpZGF0aW9uJzsgLy8gU3VjY2VzcyBvciBGYWlsdXJlXG5cbmNvbnN0IGNoYXJQYXJzZXIgPSBjaGFyID0+IHN0ciA9PiB7XG4gICAgaWYgKCcnID09PSBzdHIpIHRocm93IG5ldyBFcnJvcigncmVhY2hlZCBlbmQgb2YgY2hhciBzdHJlYW0nKTtcbiAgICBpZiAoaGVhZChzdHIpID09PSBjaGFyKSByZXR1cm4gVmFsaWRhdGlvbi5TdWNjZXNzKFBhaXIoY2hhciwgdGFpbChzdHIpKSk7XG4gICAgcmV0dXJuIFZhbGlkYXRpb24uRmFpbHVyZShQYWlyKCdjaGFyUGFyc2VyJywgJ3dhbnRlZCAnICsgY2hhciArICc7IGdvdCAnICsgaGVhZChzdHIpKSk7XG59O1xuXG5jb25zdCBkaWdpdFBhcnNlciA9IGRpZ2l0ID0+IHN0ciA9PiB7XG4gICAgaWYgKCcnID09PSBzdHIpIHRocm93IG5ldyBFcnJvcigncmVhY2hlZCBlbmQgb2YgY2hhciBzdHJlYW0nKTtcbiAgICBpZiAocGFyc2VJbnQoaGVhZChzdHIpLCAxMCkgPT09IGRpZ2l0KSByZXR1cm4gVmFsaWRhdGlvbi5TdWNjZXNzKFBhaXIoZGlnaXQsIHRhaWwoc3RyKSkpO1xuICAgIHJldHVybiBWYWxpZGF0aW9uLkZhaWx1cmUoUGFpcignZGlnaXRQYXJzZXInLCAnd2FudGVkICcgKyBkaWdpdCArICc7IGdvdCAnICsgaGVhZChzdHIpKSk7XG59O1xuXG5leHBvcnQge2NoYXJQYXJzZXIsIGRpZ2l0UGFyc2VyfTtcblxuZXhwb3J0IGZ1bmN0aW9uIHBjaGFyKGNoYXIpIHtcbiAgICBjb25zdCBsYWJlbCA9ICdwY2hhcl8nICsgY2hhcjtcbiAgICBsZXQgcmVzdWx0ID0gZnVuY3Rpb24gKHN0cikge1xuICAgICAgICByZXR1cm4gY2hhclBhcnNlcihjaGFyKShzdHIpO1xuICAgIH07XG4gICAgcmV0dXJuIHBhcnNlcihyZXN1bHQsIGxhYmVsKS5zZXRMYWJlbChsYWJlbCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwZGlnaXQoZGlnaXQpIHtcbiAgICByZXR1cm4gcGFyc2VyKHN0ciA9PiBkaWdpdFBhcnNlcihkaWdpdCkoc3RyKSwgJ3BkaWdpdF8nICsgZGlnaXQpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYW5kVGhlbihwMSwgcDIpIHtcbiAgICBjb25zdCBsYWJlbCA9IHAxLmxhYmVsICsgJyBhbmRUaGVuICcgKyBwMi5sYWJlbDtcbiAgICByZXR1cm4gcGFyc2VyKGZ1bmN0aW9uIChzdHIpIHtcbiAgICAgICAgbGV0IHJlczEgPSBwMS5ydW4oc3RyKTtcbiAgICAgICAgaWYgKHJlczEuaXNTdWNjZXNzKSB7XG4gICAgICAgICAgICBsZXQgcmVzMiA9IHAyLnJ1bihyZXMxLnZhbHVlWzFdKTtcbiAgICAgICAgICAgIGlmIChyZXMyLmlzU3VjY2Vzcykge1xuICAgICAgICAgICAgICAgIHJldHVybiBWYWxpZGF0aW9uLlN1Y2Nlc3MoUGFpcihQYWlyKHJlczEudmFsdWVbMF0sIHJlczIudmFsdWVbMF0pLCByZXMyLnZhbHVlWzFdKSk7XG4gICAgICAgICAgICB9IGVsc2UgcmV0dXJuIFZhbGlkYXRpb24uRmFpbHVyZShQYWlyKGxhYmVsLCByZXMyLnZhbHVlWzFdKSk7XG4gICAgICAgIH0gZWxzZSByZXR1cm4gVmFsaWRhdGlvbi5GYWlsdXJlKFBhaXIobGFiZWwsIHJlczEudmFsdWVbMV0pKTtcbiAgICB9LCBsYWJlbCk7XG59XG5cbi8vIHVzaW5nIGJpbmQgLSBUT0RPOiBtYWtlIGl0IHdvcmtcbmV4cG9ydCBmdW5jdGlvbiBhbmRUaGVuQkJCKHAxLCBwMikge1xuICAgIHJldHVybiBwMS5iaW5kKHBhcnNlZFZhbHVlMSA9PiB7XG4gICAgICAgIHJldHVybiBwMi5iaW5kKHBhcnNlZFZhbHVlMiA9PiB7XG4gICAgICAgICAgICByZXR1cm4gcmV0dXJuUChQYWlyKHBhcnNlZFZhbHVlMSwgcGFyc2VkVmFsdWUyKSk7XG4gICAgICAgIH0pO1xuICAgIH0pLnNldExhYmVsKHAxLmxhYmVsICsgJyBhbmRUaGVuICcgKyBwMi5sYWJlbCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBvckVsc2UocDEsIHAyKSB7XG4gICAgY29uc3QgbGFiZWwgPSBwMS5sYWJlbCArICcgb3JFbHNlICcgKyBwMi5sYWJlbDtcbiAgICByZXR1cm4gcGFyc2VyKHN0ciA9PiB7XG4gICAgICAgIGNvbnN0IHJlczEgPSBwMS5ydW4oc3RyKTtcbiAgICAgICAgaWYgKHJlczEuaXNTdWNjZXNzKSByZXR1cm4gcmVzMTtcbiAgICAgICAgY29uc3QgcmVzMiA9IHAyLnJ1bihzdHIpO1xuICAgICAgICBpZiAocmVzMi5pc1N1Y2Nlc3MpIHJldHVybiByZXMyO1xuICAgICAgICByZXR1cm4gVmFsaWRhdGlvbi5GYWlsdXJlKFBhaXIobGFiZWwsIHJlczIudmFsdWVbMV0pKTtcbiAgICB9LCBsYWJlbCkuc2V0TGFiZWwobGFiZWwpO1xufVxuXG5sZXQgX2ZhaWwgPSBwYXJzZXIoc3RyID0+IFZhbGlkYXRpb24uRmFpbHVyZShQYWlyKFBhaXIoJ3BhcnNpbmcgZmFpbGVkJywgJ19mYWlsJyksICdfZmFpbCcpKSk7XG5cbi8vIHJldHVybiBuZXV0cmFsIGVsZW1lbnQgaW5zdGVhZCBvZiBtZXNzYWdlXG5sZXQgX3N1Y2NlZWQgPSBwYXJzZXIoc3RyID0+IFZhbGlkYXRpb24uU3VjY2VzcyhQYWlyKFBhaXIoJ3BhcnNpbmcgc3VjY2VlZGVkJywgc3RyKSwgJ19zdWNjZWVkJykpKTtcblxuZXhwb3J0IGZ1bmN0aW9uIGNob2ljZShwYXJzZXJzKSB7XG4gICAgcmV0dXJuIHBhcnNlcnMucmVkdWNlUmlnaHQoKHJlc3QsIGN1cnIpID0+IG9yRWxzZShjdXJyLCByZXN0KSwgX2ZhaWwpXG4gICAgICAgIC5zZXRMYWJlbCgnY2hvaWNlICcgKyBwYXJzZXJzLnJlZHVjZSgoYWNjLCBjdXJyKSA9PiBhY2MgKyAnLycgKyBjdXJyLmxhYmVsLCAnJykpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYW55T2YoY2hhcnMpIHtcbiAgICByZXR1cm4gY2hvaWNlKGNoYXJzLm1hcChwY2hhcikpXG4gICAgICAgIC5zZXRMYWJlbCgnYW55T2YgJyArIGNoYXJzLnJlZHVjZSgoYWNjLCBjdXJyKSA9PiBhY2MgKyBjdXJyLCAnJykpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZm1hcChmYWIsIHBhcnNlcjEpIHtcbiAgICBjb25zdCBsYWJlbCA9IHBhcnNlcjEubGFiZWwgKyAnIGZtYXAgJyArIGZhYi50b1N0cmluZygpO1xuICAgIHJldHVybiBwYXJzZXIoc3RyID0+IHtcbiAgICAgICAgbGV0IHJlcyA9IHBhcnNlcjEucnVuKHN0cik7XG4gICAgICAgIGlmIChyZXMuaXNTdWNjZXNzKSByZXR1cm4gVmFsaWRhdGlvbi5TdWNjZXNzKFBhaXIoZmFiKHJlcy52YWx1ZVswXSksIHJlcy52YWx1ZVsxXSkpO1xuICAgICAgICByZXR1cm4gVmFsaWRhdGlvbi5GYWlsdXJlKFBhaXIobGFiZWwsIHJlcy52YWx1ZVsxXSkpO1xuICAgIH0sIGxhYmVsKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJldHVyblAodmFsdWUpIHtcbiAgICByZXR1cm4gcGFyc2VyKHN0ciA9PiBWYWxpZGF0aW9uLlN1Y2Nlc3MoUGFpcih2YWx1ZSwgc3RyKSksIHZhbHVlKTtcbn1cblxuLy8gcGFyc2VyKGEgLT4gYikgLT4gcGFyc2VyKGEpIC0+IHBhcnNlcihiKVxuZXhwb3J0IGZ1bmN0aW9uIGFwcGx5UHgoZlApIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKHhQKSB7XG4gICAgICAgIHJldHVybiBhbmRUaGVuKGZQLCB4UCkuZm1hcCgoW2YsIHhdKSA9PiBmKHgpKTtcbiAgICB9O1xufVxuXG4vLyB1c2luZyBiaW5kXG5leHBvcnQgZnVuY3Rpb24gYXBwbHlQKGZQKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uICh4UCkge1xuICAgICAgICByZXR1cm4gZlAuYmluZChwYXJzZWRWYWx1ZWYgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHhQLmJpbmQocGFyc2VkVmFsdWV4ID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmV0dXJuUChwYXJzZWRWYWx1ZWYocGFyc2VkVmFsdWV4KSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGxpZnQyKGZhYWIpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKHBhcnNlcjEpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChwYXJzZXIyKSB7XG4gICAgICAgICAgICAvL3JldHVybiBhcHBseVAoYXBwbHlQKHJldHVyblAoZmFhYikpKHBhcnNlcjEpKShwYXJzZXIyKTtcbiAgICAgICAgICAgIHJldHVybiByZXR1cm5QKGZhYWIpLmFwcGx5KHBhcnNlcjEpLmFwcGx5KHBhcnNlcjIpOyAvLyB1c2luZyBpbnN0YW5jZSBtZXRob2RzXG4gICAgICAgIH07XG4gICAgfTtcbn1cblxuLy8gdXNpbmcgbGlmdDIoY29ucylcbmV4cG9ydCBmdW5jdGlvbiBzZXF1ZW5jZVAocGFyc2Vycykge1xuICAgIHJldHVybiBwYXJzZXJzXG4gICAgICAgIC5yZWR1Y2VSaWdodCgocmVzdCwgY3VycikgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIGxpZnQyKF9jb25zKShjdXJyKShyZXN0KTtcbiAgICAgICAgfSwgcmV0dXJuUChbXSkpO1xufVxuXG4vLyB1c2luZyBuYWl2ZSBhbmRUaGVuICYmIGZtYXAgLS0+IHJldHVybnMgc3RyaW5ncywgbm90IGFycmF5cyFcbmV4cG9ydCBmdW5jdGlvbiBzZXF1ZW5jZVAyKHBhcnNlcnMpIHtcbiAgICByZXR1cm4gcGFyc2Vyc1xuICAgICAgICAucmVkdWNlUmlnaHQoKHJlc3QsIGN1cnIpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBmbWFwKChbeCwgeV0pID0+IHggKyB5LCBhbmRUaGVuKGN1cnIsIHJlc3QpKTtcbiAgICAgICAgfSwgcmV0dXJuUCgnJykpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcHN0cmluZyhzdHIpIHtcbiAgICByZXR1cm4gc2VxdWVuY2VQKHN0ci5zcGxpdCgnJykubWFwKHBjaGFyKSlcbiAgICAgICAgLnNldExhYmVsKCdwc3RyaW5nICcgKyBzdHIpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gemVyb09yTW9yZSh4UCkgeyAvLyB6ZXJvT3JNb3JlIDo6IHAgYSAtPiBbYV0gLT4gdHJ5IFthXSA9IHAgYSAtPiBwIFthXVxuICAgIHJldHVybiBzdHIgPT4ge1xuICAgICAgICBsZXQgcmVzMSA9IHhQLnJ1bihzdHIpO1xuICAgICAgICBpZiAocmVzMS5pc0ZhaWx1cmUpIHJldHVybiBWYWxpZGF0aW9uLlN1Y2Nlc3MoUGFpcihbXSwgc3RyKSk7XG4gICAgICAgIGxldCByZXNOID0gemVyb09yTW9yZSh4UCkocmVzMVsxXSk7XG4gICAgICAgIHJldHVybiBWYWxpZGF0aW9uLlN1Y2Nlc3MoUGFpcihbcmVzMVswXV0uY29uY2F0KHJlc05bMF0pLCByZXNOWzFdKSk7XG4gICAgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1hbnkoeFApIHtcbiAgICBjb25zdCBsYWJlbCA9ICdtYW55ICcgKyB4UC5sYWJlbDtcbiAgICByZXR1cm4gcGFyc2VyKHN0ciA9PiB7XG4gICAgICAgIHJldHVybiB6ZXJvT3JNb3JlKHhQKShzdHIpO1xuICAgIH0sIGxhYmVsKS5zZXRMYWJlbChsYWJlbCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtYW55MSh4UCkge1xuICAgIGNvbnN0IGxhYmVsID0gJ21hbnkxICcgKyB4UC5sYWJlbDtcbiAgICByZXR1cm4gcGFyc2VyKHN0ciA9PiB7XG4gICAgICAgIGxldCByZXMxID0geFAucnVuKHN0cik7XG4gICAgICAgIGlmIChyZXMxLmlzRmFpbHVyZSkgcmV0dXJuIHJlczE7XG4gICAgICAgIGxldCByZXNOID0gemVyb09yTW9yZSh4UCkocmVzMVsxXSk7XG4gICAgICAgIHJldHVybiBWYWxpZGF0aW9uLlN1Y2Nlc3MoUGFpcihbcmVzMVswXV0uY29uY2F0KHJlc05bMF0pLCByZXNOWzFdKSk7XG4gICAgfSwgbGFiZWwpLnNldExhYmVsKGxhYmVsKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG9wdCh4UCkge1xuICAgIGNvbnN0IGxhYmVsID0gJ29wdCAnICsgeFAubGFiZWw7XG4gICAgcmV0dXJuIHBhcnNlcihzdHIgPT4ge1xuICAgICAgICBsZXQgcmVzID0geFAuZm1hcCh4ID0+IE1heWJlLkp1c3QoeCkpLnJ1bihzdHIpO1xuICAgICAgICBpZiAocmVzLmlzU3VjY2VzcykgcmV0dXJuIHJlcztcbiAgICAgICAgcmV0dXJuIFZhbGlkYXRpb24uU3VjY2VzcyhQYWlyKE1heWJlLk5vdGhpbmcoKSwgc3RyKSk7XG4gICAgfSwgbGFiZWwpLnNldExhYmVsKGxhYmVsKTtcbn1cblxuLy8gb3B0IGZyb20gdGhlIGJvb2tcbmV4cG9ydCBmdW5jdGlvbiBvcHRCb29rKHBYKSB7XG4gICAgY29uc3Qgc29tZVAgPSBwWC5mbWFwKE1heWJlLkp1c3QpO1xuICAgIGNvbnN0IG5vbmVQID0gcmV0dXJuUChNYXliZS5Ob3RoaW5nKTtcbiAgICByZXR1cm4gc29tZVAub3JFbHNlKG5vbmVQKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRpc2NhcmRTZWNvbmQocDEsIHAyKSB7XG4gICAgY29uc3QgbGFiZWwgPSBwMS5sYWJlbCArICcgZGlzY2FyZFNlY29uZCAnICsgcDIubGFiZWw7XG4gICAgcmV0dXJuIHBhcnNlcihzdHIgPT4ge1xuICAgICAgICByZXR1cm4gYW5kVGhlbihwMSwgcDIpLmZtYXAoKFtyMSwgcjJdKSA9PiByMSkucnVuKHN0cik7XG4gICAgfSwgbGFiZWwpLnNldExhYmVsKGxhYmVsKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRpc2NhcmRGaXJzdChwMSwgcDIpIHtcbiAgICBjb25zdCBsYWJlbCA9IHAxLmxhYmVsICsgJyBkaXNjYXJkRmlyc3QgJyArIHAyLmxhYmVsO1xuICAgIHJldHVybiBwYXJzZXIoc3RyID0+IHtcbiAgICAgICAgcmV0dXJuIGFuZFRoZW4ocDEsIHAyKS5mbWFwKChbcjEsIHIyXSkgPT4gcjIpLnJ1bihzdHIpO1xuICAgIH0sIGxhYmVsKS5zZXRMYWJlbChsYWJlbCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBiZXR3ZWVuKHAxLCBwMiwgcDMpIHtcbiAgICByZXR1cm4gcDEuZGlzY2FyZEZpcnN0KHAyKS5kaXNjYXJkU2Vjb25kKHAzKVxuICAgICAgICAuc2V0TGFiZWwoJ2JldHdlZW4gJyArIHAxLmxhYmVsICsgJy8nICsgcDIubGFiZWwgKyAnLycgKyBwMy5sYWJlbCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBiZXR3ZWVuUGFyZW5zKHB4KSB7XG4gICAgcmV0dXJuIGJldHdlZW4ocGNoYXIoJygnKSwgcHgsIHBjaGFyKCcpJykpXG4gICAgICAgIC5zZXRMYWJlbCgnYmV0d2VlblBhcmVucyAnICsgcHgubGFiZWwpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYmluZFAoZmFtYiwgcHgpIHtcbiAgICBsZXQgbGFiZWwgPSAndW5rbm93bic7XG4gICAgcmV0dXJuIHBhcnNlcihzdHIgPT4ge1xuICAgICAgICBjb25zdCByZXMgPSBweC5ydW4oc3RyKTtcbiAgICAgICAgaWYgKHJlcy5pc0ZhaWx1cmUpIHJldHVybiByZXM7XG4gICAgICAgIHJldHVybiBmYW1iKHJlcy52YWx1ZVswXSkucnVuKHJlcy52YWx1ZVsxXSk7XG4gICAgfSwgbGFiZWwpLnNldExhYmVsKGxhYmVsKTtcbn1cblxuZnVuY3Rpb24gX2NvbnMoeCkge1xuICAgIHJldHVybiBmdW5jdGlvbiAoeHMpIHtcbiAgICAgICAgcmV0dXJuIFt4XS5jb25jYXQoeHMpO1xuICAgIH07XG59XG5cbmZ1bmN0aW9uIF9zZXRMYWJlbChweCwgbmV3TGFiZWwpIHtcbiAgICByZXR1cm4gcGFyc2VyKHN0ciA9PiB7XG4gICAgICAgIGxldCByZXN1bHQgPSBweC5ydW4oc3RyKTtcbiAgICAgICAgaWYgKHJlc3VsdC5pc0ZhaWx1cmUpIHJldHVybiBWYWxpZGF0aW9uLkZhaWx1cmUoUGFpcihuZXdMYWJlbCwgcmVzdWx0LnZhbHVlWzFdKSk7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSwgbmV3TGFiZWwpO1xufVxuXG4vLyB0aGUgcmVhbCB0aGluZy4uLlxuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlcihmbiwgbGFiZWwpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICB0eXBlOiAncGFyc2VyJyxcbiAgICAgICAgbGFiZWw6IGxhYmVsLFxuICAgICAgICBydW4oc3RyKSB7XG4gICAgICAgICAgICByZXR1cm4gZm4oc3RyKTtcbiAgICAgICAgfSxcbiAgICAgICAgYXBwbHkocHgpIHtcbiAgICAgICAgICAgIHJldHVybiBhcHBseVAodGhpcykocHgpO1xuICAgICAgICAgICAgLy9yZXR1cm4gdGhpcy5iaW5kKGFuZFRoZW4odGhpcywgcHgpLmZtYXAoKFtmLCB4XSkgPT4gZih4KSkpLnJ1bjsgLy8gd2UgYXJlIHRoZSBmUFxuICAgICAgICB9LFxuICAgICAgICBmbWFwKGZhYikgeyAvLyBUT0RPIC0gbWFrZSBhbGwgdGhpcyB3b3JrXG4gICAgICAgICAgICByZXR1cm4gZm1hcChmYWIsIHRoaXMpO1xuICAgICAgICAgICAgLy9yZXR1cm4gYmluZFAoc3RyID0+IHJldHVyblAoZmFiKHN0cikpLCB0aGlzKTtcbiAgICAgICAgICAgIC8vcmV0dXJuIHRoaXMuYmluZChwYXJzZWRWYWx1ZSA9PiByZXR1cm5QKGZhYihwYXJzZWRWYWx1ZSkpKTtcbiAgICAgICAgfSxcbiAgICAgICAgYW5kVGhlbihweCkge1xuICAgICAgICAgICAgcmV0dXJuIGFuZFRoZW4odGhpcywgcHgpO1xuICAgICAgICB9LFxuICAgICAgICBvckVsc2UocHgpIHtcbiAgICAgICAgICAgIHJldHVybiBvckVsc2UodGhpcywgcHgpO1xuICAgICAgICB9LFxuICAgICAgICBkaXNjYXJkRmlyc3QocHgpIHtcbiAgICAgICAgICAgIHJldHVybiBkaXNjYXJkRmlyc3QodGhpcywgcHgpO1xuICAgICAgICB9LFxuICAgICAgICBkaXNjYXJkU2Vjb25kKHB4KSB7XG4gICAgICAgICAgICByZXR1cm4gZGlzY2FyZFNlY29uZCh0aGlzLCBweCk7XG4gICAgICAgIH0sXG4gICAgICAgIGJpbmQoZmFtYikge1xuICAgICAgICAgICAgcmV0dXJuIGJpbmRQKGZhbWIsIHRoaXMpO1xuICAgICAgICB9LFxuICAgICAgICBzZXRMYWJlbChuZXdMYWJlbCkge1xuICAgICAgICAgICAgcmV0dXJuIF9zZXRMYWJlbCh0aGlzLCBuZXdMYWJlbCk7XG4gICAgICAgIH1cbiAgICB9O1xufVxuIl19