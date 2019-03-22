define(['exports', './tuples', './maybe', './validation'], function (exports, _tuples, _maybe, _validation) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.discardFirst = exports.discardSecond = exports.whiteP = exports.digitP = exports.letterP = exports.uppercaseP = exports.lowercaseP = exports.succeed = exports.fail = exports.orElse = exports.andThen = exports.predicateBasedParser = exports.digitParser = exports.charParser = undefined;
  exports.pchar = pchar;
  exports.pdigit = pdigit;
  exports.precededByP = precededByP;
  exports.notPrecededByP = notPrecededByP;
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
  exports.stringP = stringP;
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
      if (typeof pos === 'string') pos = _tuples.Position.fromText(pos);
      var optChar = pos.char();
      if (optChar.isNothing) return _validation.Validation.Failure(_tuples.Tuple.Triple('charParser', 'no more input', pos));
      if (optChar.value === char) return _validation.Validation.Success(_tuples.Tuple.Pair(char, pos.incrPos()));
      return _validation.Validation.Failure(_tuples.Tuple.Triple('charParser', 'wanted ' + char + '; got ' + optChar.value, pos));
    };
  };

  var digitParser = function digitParser(digit) {
    return function (pos) {
      if (typeof pos === 'string') pos = _tuples.Position.fromText(pos);
      var optChar = pos.char();
      if (optChar.isNothing) return _validation.Validation.Failure(_tuples.Tuple.Triple('digitParser', 'no more input', pos));
      if (parseInt(optChar.value, 10) === digit) return _validation.Validation.Success(_tuples.Tuple.Pair(digit, pos.incrPos()));
      return _validation.Validation.Failure(_tuples.Tuple.Triple('digitParser', 'wanted ' + digit + '; got ' + optChar.value, pos));
    };
  };

  var predicateBasedParser = function predicateBasedParser(pred, label) {
    return function (pos) {
      if (typeof pos === 'string') pos = _tuples.Position.fromText(pos);
      var optChar = pos.char();
      if (optChar.isNothing) return _validation.Validation.Failure(_tuples.Tuple.Triple(label, 'no more input', pos));
      if (pred(optChar.value)) return _validation.Validation.Success(_tuples.Tuple.Pair(optChar.value, pos.incrPos()));
      return _validation.Validation.Failure(_tuples.Tuple.Triple(label, 'unexpected char: ' + optChar.value, pos));
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

  function precededByP(c1, c2) {
    var label = c2 + ' preceded by ' + c1;
    return parser(function (pos) {
      var res2 = pchar(c2).run(pos);
      if (res2.isSuccess) {
        var res1 = pchar(c1).run(res2.value[1].decrPos(2));
        if (res1.isSuccess) {
          return _validation.Validation.Success(_tuples.Tuple.Pair(c2, res2.value[1]));
        }
        return _validation.Validation.Failure(_tuples.Tuple.Triple(label, res1.value[1], res1.value[2]));
      }
      return _validation.Validation.Failure(_tuples.Tuple.Triple(label, res2.value[1], res2.value[2]));
    }, label);
  }

  function notPrecededByP(c1, c2) {
    var label = c2 + ' not preceded by ' + c1;
    return parser(function (pos) {
      var res2 = pchar(c2).run(pos);
      if (res2.isSuccess) {
        var res1 = pchar(c1).run(res2.value[1].decrPos(2));
        if (res1.isFailure) {
          return _validation.Validation.Success(_tuples.Tuple.Pair(c2, res2.value[1]));
        }
        return _validation.Validation.Failure(_tuples.Tuple.Triple(label, res1.value[1], res1.value[2]));
      }
      return _validation.Validation.Failure(_tuples.Tuple.Triple(label, res2.value[1], res2.value[2]));
    }, label);
  }

  function _andThen(p1, p2) {
    var label = p1.label + ' andThen ' + p2.label;
    return parser(function (pos) {
      var res1 = p1.run(pos);
      if (res1.isSuccess) {
        var res2 = p2.run(res1.value[1]);
        if (res2.isSuccess) {
          return _validation.Validation.Success(_tuples.Tuple.Pair(_tuples.Tuple.Pair(res1.value[0], res2.value[0]), res2.value[1]));
        }
        return _validation.Validation.Failure(_tuples.Tuple.Triple(label, res2.value[1], res2.value[2]));
      }
      return _validation.Validation.Failure(_tuples.Tuple.Triple(label, res1.value[1], res1.value[2]));
    }, label);
  }

  // using bind
  exports.andThen = _andThen;
  function andThenBind(p1, p2) {
    return p1.bind(function (parsedValue1) {
      return p2.bind(function (parsedValue2) {
        return returnP(_tuples.Tuple.Pair(parsedValue1, parsedValue2));
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
      return _validation.Validation.Failure(_tuples.Tuple.Triple(label, res2.value[1], res2.value[2]));
    }, label).setLabel(label);
  }

  exports.orElse = _orElse;
  var fail = exports.fail = parser(function (pos) {
    return _validation.Validation.Failure(_tuples.Tuple.Triple('', 'fail', pos));
  });

  var succeed = exports.succeed = parser(function (pos) {
    return _validation.Validation.Success(_tuples.Tuple.Pair(_tuples.Tuple.Pair('', pos), 'succeed'));
  });

  function choice(parsers) {
    return parsers.reduceRight(function (rest, curr) {
      return _orElse(curr, rest);
    }, fail).setLabel('choice ' + parsers.reduce(function (acc, curr) {
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
      if (res.isSuccess) return _validation.Validation.Success(_tuples.Tuple.Pair(fab(res.value[0]), res.value[1]));
      return _validation.Validation.Failure(_tuples.Tuple.Triple(label, res.value[1], res.value[2]));
    }, label);
  }

  function returnP(value) {
    return parser(function (pos) {
      return _validation.Validation.Success(_tuples.Tuple.Pair(value, pos));
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
        // return applyP(applyP(returnP(faab))(parser1))(parser2);
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

  function stringP(str) {
    return pstring(str).fmap(function (res) {
      return res.join('');
    }).setLabel('stringP ' + str);
  }

  function zeroOrMore(xP) {
    // zeroOrMore :: p a -> [a] -> try [a] = p a -> p [a]
    return function (pos) {
      var res1 = xP.run(pos);
      if (res1.isFailure) return _validation.Validation.Success(_tuples.Tuple.Pair([], pos));
      var resN = zeroOrMore(xP)(res1.value[1]);
      return _validation.Validation.Success(_tuples.Tuple.Pair([res1.value[0]].concat(resN.value[0]), resN.value[1]));
    };
  }

  function many(xP, times) {
    var times_defined = typeof times !== 'undefined';
    var label = 'many ' + xP.label + (times_defined ? ' times=' + times : '');
    return parser(function (pos) {
      var res = zeroOrMore(xP)(pos);
      if (times_defined) {
        // debugger;
        if (res.isFailure) return res;
        var resultLength = res.value[0].length;
        return resultLength === times ? res : _validation.Validation.Failure(_tuples.Tuple.Triple(label, 'times param wanted ' + times + '; got ' + resultLength, pos));
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
      return _validation.Validation.Success(_tuples.Tuple.Pair([res1.value[0]].concat(resN.value[0]), resN.value[1]));
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
      return _validation.Validation.Success(_tuples.Tuple.Pair(outcome, pos));
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
      // eslint-disable-next-line no-unused-vars
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
      // eslint-disable-next-line no-unused-vars
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
    // eslint-disable-next-line no-console
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
      if (result.isFailure) return _validation.Validation.Failure(_tuples.Tuple.Triple(newLabel, result.value[1], result.value[2]));
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
        // return this.bind(andThen(this, px).fmap(([f, x]) => f(x))).run; // we are the fP
      },
      fmap: function fmap(fab) {
        // return fmap(fab, this);
        // return bindP(pos => returnP(fab(pos)), this);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2pzL3BhcnNlcnMuanMiXSwibmFtZXMiOlsicGNoYXIiLCJwZGlnaXQiLCJwcmVjZWRlZEJ5UCIsIm5vdFByZWNlZGVkQnlQIiwiYW5kVGhlbkJpbmQiLCJjaG9pY2UiLCJhbnlPZiIsImZtYXAiLCJyZXR1cm5QIiwiYXBwbHlQeCIsImFwcGx5UCIsImxpZnQyIiwic2VxdWVuY2VQIiwic2VxdWVuY2VQMiIsInBzdHJpbmciLCJzdHJpbmdQIiwiemVyb09yTW9yZSIsIm1hbnkiLCJtYW55Q2hhcnMiLCJtYW55MSIsIm1hbnlDaGFyczEiLCJvcHQiLCJvcHRCb29rIiwic2VwQnkxQm9vayIsInNlcEJ5MSIsImJldHdlZW4iLCJiZXR3ZWVuUGFyZW5zIiwiYmluZFAiLCJ0YXBQIiwibG9nUCIsInB3b3JkIiwidHJpbVAiLCJwYXJzZXIiLCJjaGFyUGFyc2VyIiwicG9zIiwiUG9zaXRpb24iLCJmcm9tVGV4dCIsIm9wdENoYXIiLCJjaGFyIiwiaXNOb3RoaW5nIiwiVmFsaWRhdGlvbiIsIkZhaWx1cmUiLCJUdXBsZSIsIlRyaXBsZSIsInZhbHVlIiwiU3VjY2VzcyIsIlBhaXIiLCJpbmNyUG9zIiwiZGlnaXRQYXJzZXIiLCJwYXJzZUludCIsImRpZ2l0IiwicHJlZGljYXRlQmFzZWRQYXJzZXIiLCJwcmVkIiwibGFiZWwiLCJyZXN1bHQiLCJzZXRMYWJlbCIsImMxIiwiYzIiLCJyZXMyIiwicnVuIiwiaXNTdWNjZXNzIiwicmVzMSIsImRlY3JQb3MiLCJpc0ZhaWx1cmUiLCJhbmRUaGVuIiwicDEiLCJwMiIsImJpbmQiLCJwYXJzZWRWYWx1ZTEiLCJwYXJzZWRWYWx1ZTIiLCJvckVsc2UiLCJmYWlsIiwic3VjY2VlZCIsInBhcnNlcnMiLCJyZWR1Y2VSaWdodCIsInJlc3QiLCJjdXJyIiwicmVkdWNlIiwiYWNjIiwiY2hhcnNBcnJheSIsIm1hcCIsImxvd2VyY2FzZVAiLCJ1cHBlcmNhc2VQIiwibGV0dGVyUCIsImRpZ2l0UCIsIndoaXRlUCIsImZhYiIsInBhcnNlcjEiLCJ0b1N0cmluZyIsInJlcyIsImZQIiwieFAiLCJmIiwieCIsInBhcnNlZFZhbHVlZiIsInBhcnNlZFZhbHVleCIsImZhYWIiLCJwYXJzZXIyIiwiYXBwbHkiLCJfY29ucyIsInkiLCJzdHIiLCJzcGxpdCIsImpvaW4iLCJyZXNOIiwiY29uY2F0IiwidGltZXMiLCJ0aW1lc19kZWZpbmVkIiwicmVzdWx0TGVuZ3RoIiwibGVuZ3RoIiwiYXJyYSIsImRlZmF1bHRWYWx1ZSIsImlzRGVmYXVsdCIsIk1heWJlIiwiSnVzdCIsIm91dGNvbWUiLCJOb3RoaW5nIiwicFgiLCJzb21lUCIsIm5vbmVQIiwiZGlzY2FyZFNlY29uZCIsImRpc2NhcmRGaXJzdCIsInB4Iiwic2VwIiwiciIsInJsaXN0IiwidmFsdWVQIiwic2VwYXJhdG9yUCIsInAzIiwiZmFtYiIsImZuIiwiY29uc29sZSIsImxvZyIsIndvcmQiLCJ4cyIsIl9zZXRMYWJlbCIsIm5ld0xhYmVsIiwidHlwZSIsInBhcnNlZFZhbHVlIl0sIm1hcHBpbmdzIjoiOzs7Ozs7O1VBMkRnQkEsSyxHQUFBQSxLO1VBTUFDLE0sR0FBQUEsTTtVQUlBQyxXLEdBQUFBLFc7VUFlQUMsYyxHQUFBQSxjO1VBK0JBQyxXLEdBQUFBLFc7VUF1QkFDLE0sR0FBQUEsTTtVQUtBQyxLLEdBQUFBLEs7VUFXQUMsSSxHQUFBQSxJO1VBU0FDLE8sR0FBQUEsTztVQUtBQyxPLEdBQUFBLE87VUFPQUMsTSxHQUFBQSxNO1VBVUFDLEssR0FBQUEsSztVQVVBQyxTLEdBQUFBLFM7VUFRQUMsVSxHQUFBQSxVO1VBT0FDLE8sR0FBQUEsTztVQUtBQyxPLEdBQUFBLE87VUFNQUMsVSxHQUFBQSxVO1VBU0FDLEksR0FBQUEsSTtVQWlCQUMsUyxHQUFBQSxTO1VBT0FDLEssR0FBQUEsSztVQVVBQyxVLEdBQUFBLFU7VUFNQUMsRyxHQUFBQSxHO1VBYUFDLE8sR0FBQUEsTztVQXNCQUMsVSxHQUFBQSxVO1VBS0FDLE0sR0FBQUEsTTtVQUlBQyxPLEdBQUFBLE87VUFLQUMs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QUNELE9BakJJO0FBa0JMcEQsWUFsQkssa0JBa0JFb0QsRUFsQkYsRUFrQk07QUFDVCxlQUFPcEQsUUFBTyxJQUFQLEVBQWFvRCxFQUFiLENBQVA7QUFDRCxPQXBCSTtBQXFCTEQsa0JBckJLLHdCQXFCUUMsRUFyQlIsRUFxQlk7QUFDZixlQUFPRCxjQUFhLElBQWIsRUFBbUJDLEVBQW5CLENBQVA7QUFDRCxPQXZCSTtBQXdCTEYsbUJBeEJLLHlCQXdCU0UsRUF4QlQsRUF3QmE7QUFDaEIsZUFBT0YsZUFBYyxJQUFkLEVBQW9CRSxFQUFwQixDQUFQO0FBQ0QsT0ExQkk7QUEyQkx2RCxVQTNCSyxnQkEyQkE4RCxJQTNCQSxFQTJCTTtBQUNULGVBQU90RyxNQUFNc0csSUFBTixFQUFZLElBQVosQ0FBUDtBQUNELE9BN0JJO0FBOEJMMUUsY0E5Qkssb0JBOEJJaUYsUUE5QkosRUE4QmM7QUFDakIsZUFBT0QsVUFBVSxJQUFWLEVBQWdCQyxRQUFoQixDQUFQO0FBQ0Q7QUFoQ0ksS0FBUDtBQWtDRCIsImZpbGUiOiJwYXJzZXJzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLypcblRoZSBNSVQgTGljZW5zZSAoTUlUKVxuXG5Db3B5cmlnaHQgKGMpIDIwMTQgTWFyY28gRmF1c3RpbmVsbGlcblxuUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxub2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxuaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xudG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG5mdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuXG5UaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpbiBhbGxcbmNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG5cblRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1JcbklNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxuRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXG5BVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSXG5MSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLFxuT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEVcblNPRlRXQVJFLlxuKi9cblxuLy8gY2ZyLiBcIlVuZGVyc3RhbmRpbmcgUGFyc2VyIENvbWJpbmF0b3JzXCIgKEYjIGZvciBGdW4gYW5kIFByb2ZpdClcblxuaW1wb3J0IHtcbiAgVHVwbGUsXG4gIFBvc2l0aW9uLFxufSBmcm9tICcuL3R1cGxlcyc7XG5pbXBvcnQgeyBNYXliZSB9IGZyb20gJy4vbWF5YmUnOyAvLyBKdXN0IG9yIE5vdGhpbmdcbmltcG9ydCB7IFZhbGlkYXRpb24gfSBmcm9tICcuL3ZhbGlkYXRpb24nOyAvLyBTdWNjZXNzIG9yIEZhaWx1cmVcblxuY29uc3QgY2hhclBhcnNlciA9IGNoYXIgPT4gcG9zID0+IHtcbiAgaWYgKHR5cGVvZiBwb3MgPT09ICdzdHJpbmcnKSBwb3MgPSBQb3NpdGlvbi5mcm9tVGV4dChwb3MpO1xuICBjb25zdCBvcHRDaGFyID0gcG9zLmNoYXIoKTtcbiAgaWYgKG9wdENoYXIuaXNOb3RoaW5nKSByZXR1cm4gVmFsaWRhdGlvbi5GYWlsdXJlKFR1cGxlLlRyaXBsZSgnY2hhclBhcnNlcicsICdubyBtb3JlIGlucHV0JywgcG9zKSk7XG4gIGlmIChvcHRDaGFyLnZhbHVlID09PSBjaGFyKSByZXR1cm4gVmFsaWRhdGlvbi5TdWNjZXNzKFR1cGxlLlBhaXIoY2hhciwgcG9zLmluY3JQb3MoKSkpO1xuICByZXR1cm4gVmFsaWRhdGlvbi5GYWlsdXJlKFR1cGxlLlRyaXBsZSgnY2hhclBhcnNlcicsICd3YW50ZWQgJyArIGNoYXIgKyAnOyBnb3QgJyArIG9wdENoYXIudmFsdWUsIHBvcykpO1xufTtcblxuY29uc3QgZGlnaXRQYXJzZXIgPSBkaWdpdCA9PiBwb3MgPT4ge1xuICBpZiAodHlwZW9mIHBvcyA9PT0gJ3N0cmluZycpIHBvcyA9IFBvc2l0aW9uLmZyb21UZXh0KHBvcyk7XG4gIGNvbnN0IG9wdENoYXIgPSBwb3MuY2hhcigpO1xuICBpZiAob3B0Q2hhci5pc05vdGhpbmcpIHJldHVybiBWYWxpZGF0aW9uLkZhaWx1cmUoVHVwbGUuVHJpcGxlKCdkaWdpdFBhcnNlcicsICdubyBtb3JlIGlucHV0JywgcG9zKSk7XG4gIGlmIChwYXJzZUludChvcHRDaGFyLnZhbHVlLCAxMCkgPT09IGRpZ2l0KSByZXR1cm4gVmFsaWRhdGlvbi5TdWNjZXNzKFR1cGxlLlBhaXIoZGlnaXQsIHBvcy5pbmNyUG9zKCkpKTtcbiAgcmV0dXJuIFZhbGlkYXRpb24uRmFpbHVyZShUdXBsZS5UcmlwbGUoJ2RpZ2l0UGFyc2VyJywgJ3dhbnRlZCAnICsgZGlnaXQgKyAnOyBnb3QgJyArIG9wdENoYXIudmFsdWUsIHBvcykpO1xufTtcblxuY29uc3QgcHJlZGljYXRlQmFzZWRQYXJzZXIgPSAocHJlZCwgbGFiZWwpID0+IHBvcyA9PiB7XG4gIGlmICh0eXBlb2YgcG9zID09PSAnc3RyaW5nJykgcG9zID0gUG9zaXRpb24uZnJvbVRleHQocG9zKTtcbiAgY29uc3Qgb3B0Q2hhciA9IHBvcy5jaGFyKCk7XG4gIGlmIChvcHRDaGFyLmlzTm90aGluZykgcmV0dXJuIFZhbGlkYXRpb24uRmFpbHVyZShUdXBsZS5UcmlwbGUobGFiZWwsICdubyBtb3JlIGlucHV0JywgcG9zKSk7XG4gIGlmIChwcmVkKG9wdENoYXIudmFsdWUpKSByZXR1cm4gVmFsaWRhdGlvbi5TdWNjZXNzKFR1cGxlLlBhaXIob3B0Q2hhci52YWx1ZSwgcG9zLmluY3JQb3MoKSkpO1xuICByZXR1cm4gVmFsaWRhdGlvbi5GYWlsdXJlKFR1cGxlLlRyaXBsZShsYWJlbCwgJ3VuZXhwZWN0ZWQgY2hhcjogJyArIG9wdENoYXIudmFsdWUsIHBvcykpO1xufTtcblxuZXhwb3J0IHsgY2hhclBhcnNlciwgZGlnaXRQYXJzZXIsIHByZWRpY2F0ZUJhc2VkUGFyc2VyIH07XG5cbmV4cG9ydCBmdW5jdGlvbiBwY2hhcihjaGFyKSB7XG4gIGNvbnN0IGxhYmVsID0gJ3BjaGFyXycgKyBjaGFyO1xuICBjb25zdCByZXN1bHQgPSBwb3MgPT4gY2hhclBhcnNlcihjaGFyKShwb3MpO1xuICByZXR1cm4gcGFyc2VyKHJlc3VsdCwgbGFiZWwpLnNldExhYmVsKGxhYmVsKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHBkaWdpdChkaWdpdCkge1xuICByZXR1cm4gcGFyc2VyKHBvcyA9PiBkaWdpdFBhcnNlcihkaWdpdCkocG9zKSwgJ3BkaWdpdF8nICsgZGlnaXQpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcHJlY2VkZWRCeVAoYzEsIGMyKSB7XG4gIGNvbnN0IGxhYmVsID0gYzIgKyAnIHByZWNlZGVkIGJ5ICcgKyBjMTtcbiAgcmV0dXJuIHBhcnNlcihwb3MgPT4ge1xuICAgIGNvbnN0IHJlczIgPSBwY2hhcihjMikucnVuKHBvcyk7XG4gICAgaWYgKHJlczIuaXNTdWNjZXNzKSB7XG4gICAgICBjb25zdCByZXMxID0gcGNoYXIoYzEpLnJ1bihyZXMyLnZhbHVlWzFdLmRlY3JQb3MoMikpO1xuICAgICAgaWYgKHJlczEuaXNTdWNjZXNzKSB7XG4gICAgICAgIHJldHVybiBWYWxpZGF0aW9uLlN1Y2Nlc3MoVHVwbGUuUGFpcihjMiwgcmVzMi52YWx1ZVsxXSkpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIFZhbGlkYXRpb24uRmFpbHVyZShUdXBsZS5UcmlwbGUobGFiZWwsIHJlczEudmFsdWVbMV0sIHJlczEudmFsdWVbMl0pKTtcbiAgICB9XG4gICAgcmV0dXJuIFZhbGlkYXRpb24uRmFpbHVyZShUdXBsZS5UcmlwbGUobGFiZWwsIHJlczIudmFsdWVbMV0sIHJlczIudmFsdWVbMl0pKTtcbiAgfSwgbGFiZWwpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbm90UHJlY2VkZWRCeVAoYzEsIGMyKSB7XG4gIGNvbnN0IGxhYmVsID0gYzIgKyAnIG5vdCBwcmVjZWRlZCBieSAnICsgYzE7XG4gIHJldHVybiBwYXJzZXIocG9zID0+IHtcbiAgICBjb25zdCByZXMyID0gcGNoYXIoYzIpLnJ1bihwb3MpO1xuICAgIGlmIChyZXMyLmlzU3VjY2Vzcykge1xuICAgICAgY29uc3QgcmVzMSA9IHBjaGFyKGMxKS5ydW4ocmVzMi52YWx1ZVsxXS5kZWNyUG9zKDIpKTtcbiAgICAgIGlmIChyZXMxLmlzRmFpbHVyZSkge1xuICAgICAgICByZXR1cm4gVmFsaWRhdGlvbi5TdWNjZXNzKFR1cGxlLlBhaXIoYzIsIHJlczIudmFsdWVbMV0pKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBWYWxpZGF0aW9uLkZhaWx1cmUoVHVwbGUuVHJpcGxlKGxhYmVsLCByZXMxLnZhbHVlWzFdLCByZXMxLnZhbHVlWzJdKSk7XG4gICAgfVxuICAgIHJldHVybiBWYWxpZGF0aW9uLkZhaWx1cmUoVHVwbGUuVHJpcGxlKGxhYmVsLCByZXMyLnZhbHVlWzFdLCByZXMyLnZhbHVlWzJdKSk7XG4gIH0sIGxhYmVsKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGFuZFRoZW4ocDEsIHAyKSB7XG4gIGNvbnN0IGxhYmVsID0gcDEubGFiZWwgKyAnIGFuZFRoZW4gJyArIHAyLmxhYmVsO1xuICByZXR1cm4gcGFyc2VyKHBvcyA9PiB7XG4gICAgY29uc3QgcmVzMSA9IHAxLnJ1bihwb3MpO1xuICAgIGlmIChyZXMxLmlzU3VjY2Vzcykge1xuICAgICAgY29uc3QgcmVzMiA9IHAyLnJ1bihyZXMxLnZhbHVlWzFdKTtcbiAgICAgIGlmIChyZXMyLmlzU3VjY2Vzcykge1xuICAgICAgICByZXR1cm4gVmFsaWRhdGlvbi5TdWNjZXNzKFR1cGxlLlBhaXIoVHVwbGUuUGFpcihyZXMxLnZhbHVlWzBdLCByZXMyLnZhbHVlWzBdKSwgcmVzMi52YWx1ZVsxXSkpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIFZhbGlkYXRpb24uRmFpbHVyZShUdXBsZS5UcmlwbGUobGFiZWwsIHJlczIudmFsdWVbMV0sIHJlczIudmFsdWVbMl0pKTtcbiAgICB9XG4gICAgcmV0dXJuIFZhbGlkYXRpb24uRmFpbHVyZShUdXBsZS5UcmlwbGUobGFiZWwsIHJlczEudmFsdWVbMV0sIHJlczEudmFsdWVbMl0pKTtcbiAgfSwgbGFiZWwpO1xufVxuXG4vLyB1c2luZyBiaW5kXG5leHBvcnQgZnVuY3Rpb24gYW5kVGhlbkJpbmQocDEsIHAyKSB7XG4gIHJldHVybiBwMS5iaW5kKHBhcnNlZFZhbHVlMSA9PiB7XG4gICAgcmV0dXJuIHAyLmJpbmQocGFyc2VkVmFsdWUyID0+IHtcbiAgICAgIHJldHVybiByZXR1cm5QKFR1cGxlLlBhaXIocGFyc2VkVmFsdWUxLCBwYXJzZWRWYWx1ZTIpKTtcbiAgICB9KTtcbiAgfSkuc2V0TGFiZWwocDEubGFiZWwgKyAnIGFuZFRoZW4gJyArIHAyLmxhYmVsKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG9yRWxzZShwMSwgcDIpIHtcbiAgY29uc3QgbGFiZWwgPSBwMS5sYWJlbCArICcgb3JFbHNlICcgKyBwMi5sYWJlbDtcbiAgcmV0dXJuIHBhcnNlcihwb3MgPT4ge1xuICAgIGNvbnN0IHJlczEgPSBwMS5ydW4ocG9zKTtcbiAgICBpZiAocmVzMS5pc1N1Y2Nlc3MpIHJldHVybiByZXMxO1xuICAgIGNvbnN0IHJlczIgPSBwMi5ydW4ocG9zKTtcbiAgICBpZiAocmVzMi5pc1N1Y2Nlc3MpIHJldHVybiByZXMyO1xuICAgIHJldHVybiBWYWxpZGF0aW9uLkZhaWx1cmUoVHVwbGUuVHJpcGxlKGxhYmVsLCByZXMyLnZhbHVlWzFdLCByZXMyLnZhbHVlWzJdKSk7XG4gIH0sIGxhYmVsKS5zZXRMYWJlbChsYWJlbCk7XG59XG5cbmV4cG9ydCBjb25zdCBmYWlsID0gcGFyc2VyKHBvcyA9PiBWYWxpZGF0aW9uLkZhaWx1cmUoVHVwbGUuVHJpcGxlKCcnLCAnZmFpbCcsIHBvcykpKTtcblxuZXhwb3J0IGNvbnN0IHN1Y2NlZWQgPSBwYXJzZXIocG9zID0+IFZhbGlkYXRpb24uU3VjY2VzcyhUdXBsZS5QYWlyKFR1cGxlLlBhaXIoJycsIHBvcyksICdzdWNjZWVkJykpKTtcblxuZXhwb3J0IGZ1bmN0aW9uIGNob2ljZShwYXJzZXJzKSB7XG4gIHJldHVybiBwYXJzZXJzLnJlZHVjZVJpZ2h0KChyZXN0LCBjdXJyKSA9PiBvckVsc2UoY3VyciwgcmVzdCksIGZhaWwpXG4gICAgLnNldExhYmVsKCdjaG9pY2UgJyArIHBhcnNlcnMucmVkdWNlKChhY2MsIGN1cnIpID0+IGFjYyArICcvJyArIGN1cnIubGFiZWwsICcnKSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhbnlPZihjaGFyc0FycmF5KSB7XG4gIHJldHVybiBjaG9pY2UoY2hhcnNBcnJheS5tYXAocGNoYXIpKVxuICAgIC5zZXRMYWJlbCgnYW55T2YgJyArIGNoYXJzQXJyYXkucmVkdWNlKChhY2MsIGN1cnIpID0+IGFjYyArIGN1cnIsICcnKSk7XG59XG5cbmV4cG9ydCBjb25zdCBsb3dlcmNhc2VQID0gYW55T2YoWydhJywgJ2InLCAnYycsICdkJywgJ2UnLCAnZicsICdnJywgJ2gnLCAnaScsICdqJywgJ2snLCAnbCcsICdtJywgJ24nLCAnbycsICdwJywgJ3EnLCAncicsICdzJywgJ3QnLCAndScsICd2JywgJ3cnLCAneCcsICd5JywgJ3onXSkuc2V0TGFiZWwoJ2xvd2VyY2FzZVAnKTtcbmV4cG9ydCBjb25zdCB1cHBlcmNhc2VQID0gYW55T2YoWydBJywgJ0InLCAnQycsICdEJywgJ0UnLCAnRicsICdHJywgJ0gnLCAnSScsICdKJywgJ0snLCAnTCcsICdNJywgJ04nLCAnTycsICdQJywgJ1EnLCAnUicsICdTJywgJ1QnLCAnVScsICdWJywgJ1cnLCAnWCcsICdZJywgJ1onXSkuc2V0TGFiZWwoJ3VwcGVyY2FzZVAnKTtcbmV4cG9ydCBjb25zdCBsZXR0ZXJQID0gbG93ZXJjYXNlUC5vckVsc2UodXBwZXJjYXNlUCkuc2V0TGFiZWwoJ2xldHRlclAnKTtcbmV4cG9ydCBjb25zdCBkaWdpdFAgPSBhbnlPZihbJzAnLCAnMScsICcyJywgJzMnLCAnNCcsICc1JywgJzYnLCAnNycsICc4JywgJzknXSkuc2V0TGFiZWwoJ2RpZ2l0UCcpO1xuZXhwb3J0IGNvbnN0IHdoaXRlUCA9IGFueU9mKFsnICcsICdcXHQnLCAnXFxuJywgJ1xcciddKS5zZXRMYWJlbCgnd2hpdGVQJyk7XG5cbmV4cG9ydCBmdW5jdGlvbiBmbWFwKGZhYiwgcGFyc2VyMSkge1xuICBjb25zdCBsYWJlbCA9IHBhcnNlcjEubGFiZWwgKyAnIGZtYXAgJyArIGZhYi50b1N0cmluZygpO1xuICByZXR1cm4gcGFyc2VyKHBvcyA9PiB7XG4gICAgY29uc3QgcmVzID0gcGFyc2VyMS5ydW4ocG9zKTtcbiAgICBpZiAocmVzLmlzU3VjY2VzcykgcmV0dXJuIFZhbGlkYXRpb24uU3VjY2VzcyhUdXBsZS5QYWlyKGZhYihyZXMudmFsdWVbMF0pLCByZXMudmFsdWVbMV0pKTtcbiAgICByZXR1cm4gVmFsaWRhdGlvbi5GYWlsdXJlKFR1cGxlLlRyaXBsZShsYWJlbCwgcmVzLnZhbHVlWzFdLCByZXMudmFsdWVbMl0pKTtcbiAgfSwgbGFiZWwpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcmV0dXJuUCh2YWx1ZSkge1xuICByZXR1cm4gcGFyc2VyKHBvcyA9PiBWYWxpZGF0aW9uLlN1Y2Nlc3MoVHVwbGUuUGFpcih2YWx1ZSwgcG9zKSksIHZhbHVlKTtcbn1cblxuLy8gcGFyc2VyKGEgLT4gYikgLT4gcGFyc2VyKGEpIC0+IHBhcnNlcihiKVxuZXhwb3J0IGZ1bmN0aW9uIGFwcGx5UHgoZlApIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKHhQKSB7XG4gICAgcmV0dXJuIGFuZFRoZW4oZlAsIHhQKS5mbWFwKChbZiwgeF0pID0+IGYoeCkpO1xuICB9O1xufVxuXG4vLyB1c2luZyBiaW5kXG5leHBvcnQgZnVuY3Rpb24gYXBwbHlQKGZQKSB7XG4gIHJldHVybiBmdW5jdGlvbih4UCkge1xuICAgIHJldHVybiBmUC5iaW5kKHBhcnNlZFZhbHVlZiA9PiB7XG4gICAgICByZXR1cm4geFAuYmluZChwYXJzZWRWYWx1ZXggPT4ge1xuICAgICAgICByZXR1cm4gcmV0dXJuUChwYXJzZWRWYWx1ZWYocGFyc2VkVmFsdWV4KSk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGxpZnQyKGZhYWIpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKHBhcnNlcjEpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24ocGFyc2VyMikge1xuICAgICAgLy8gcmV0dXJuIGFwcGx5UChhcHBseVAocmV0dXJuUChmYWFiKSkocGFyc2VyMSkpKHBhcnNlcjIpO1xuICAgICAgcmV0dXJuIHJldHVyblAoZmFhYikuYXBwbHkocGFyc2VyMSkuYXBwbHkocGFyc2VyMik7IC8vIHVzaW5nIGluc3RhbmNlIG1ldGhvZHNcbiAgICB9O1xuICB9O1xufVxuXG4vLyB1c2luZyBsaWZ0Mihjb25zKVxuZXhwb3J0IGZ1bmN0aW9uIHNlcXVlbmNlUChwYXJzZXJzKSB7XG4gIHJldHVybiBwYXJzZXJzXG4gICAgLnJlZHVjZVJpZ2h0KChyZXN0LCBjdXJyKSA9PiB7XG4gICAgICByZXR1cm4gbGlmdDIoX2NvbnMpKGN1cnIpKHJlc3QpO1xuICAgIH0sIHJldHVyblAoW10pKTtcbn1cblxuLy8gdXNpbmcgbmFpdmUgYW5kVGhlbiAmJiBmbWFwIC0tPiByZXR1cm5zIHN0cmluZ3MsIG5vdCBhcnJheXMhXG5leHBvcnQgZnVuY3Rpb24gc2VxdWVuY2VQMihwYXJzZXJzKSB7XG4gIHJldHVybiBwYXJzZXJzXG4gICAgLnJlZHVjZVJpZ2h0KChyZXN0LCBjdXJyKSA9PiB7XG4gICAgICByZXR1cm4gZm1hcCgoW3gsIHldKSA9PiB4ICsgeSwgYW5kVGhlbihjdXJyLCByZXN0KSk7XG4gICAgfSwgcmV0dXJuUCgnJykpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcHN0cmluZyhzdHIpIHtcbiAgcmV0dXJuIHNlcXVlbmNlUChzdHIuc3BsaXQoJycpLm1hcChwY2hhcikpXG4gICAgLnNldExhYmVsKCdwc3RyaW5nICcgKyBzdHIpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc3RyaW5nUChzdHIpIHtcbiAgcmV0dXJuIHBzdHJpbmcoc3RyKVxuICAgIC5mbWFwKHJlcyA9PiByZXMuam9pbignJykpXG4gICAgLnNldExhYmVsKCdzdHJpbmdQICcgKyBzdHIpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gemVyb09yTW9yZSh4UCkgeyAvLyB6ZXJvT3JNb3JlIDo6IHAgYSAtPiBbYV0gLT4gdHJ5IFthXSA9IHAgYSAtPiBwIFthXVxuICByZXR1cm4gcG9zID0+IHtcbiAgICBjb25zdCByZXMxID0geFAucnVuKHBvcyk7XG4gICAgaWYgKHJlczEuaXNGYWlsdXJlKSByZXR1cm4gVmFsaWRhdGlvbi5TdWNjZXNzKFR1cGxlLlBhaXIoW10sIHBvcykpO1xuICAgIGNvbnN0IHJlc04gPSB6ZXJvT3JNb3JlKHhQKShyZXMxLnZhbHVlWzFdKTtcbiAgICByZXR1cm4gVmFsaWRhdGlvbi5TdWNjZXNzKFR1cGxlLlBhaXIoW3JlczEudmFsdWVbMF1dLmNvbmNhdChyZXNOLnZhbHVlWzBdKSwgcmVzTi52YWx1ZVsxXSkpO1xuICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbWFueSh4UCwgdGltZXMpIHtcbiAgY29uc3QgdGltZXNfZGVmaW5lZCA9ICh0eXBlb2YgdGltZXMgIT09ICd1bmRlZmluZWQnKTtcbiAgY29uc3QgbGFiZWwgPSAnbWFueSAnICsgeFAubGFiZWxcbiAgICAgICAgKyAoKHRpbWVzX2RlZmluZWQpID8gJyB0aW1lcz0nICsgdGltZXMgOiAnJyk7XG4gIHJldHVybiBwYXJzZXIocG9zID0+IHtcbiAgICBjb25zdCByZXMgPSB6ZXJvT3JNb3JlKHhQKShwb3MpO1xuICAgIGlmICh0aW1lc19kZWZpbmVkKSB7Ly8gZGVidWdnZXI7XG4gICAgICBpZiAocmVzLmlzRmFpbHVyZSkgcmV0dXJuIHJlcztcbiAgICAgIGNvbnN0IHJlc3VsdExlbmd0aCA9IHJlcy52YWx1ZVswXS5sZW5ndGg7XG4gICAgICByZXR1cm4gKHJlc3VsdExlbmd0aCA9PT0gdGltZXMpXG4gICAgICAgID8gcmVzXG4gICAgICAgIDogVmFsaWRhdGlvbi5GYWlsdXJlKFR1cGxlLlRyaXBsZShsYWJlbCwgJ3RpbWVzIHBhcmFtIHdhbnRlZCAnICsgdGltZXMgKyAnOyBnb3QgJyArIHJlc3VsdExlbmd0aCwgcG9zKSk7XG4gICAgfVxuICAgIHJldHVybiByZXM7XG4gIH0sIGxhYmVsKS5zZXRMYWJlbChsYWJlbCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtYW55Q2hhcnMoeFAsIHRpbWVzKSB7XG4gIHJldHVybiBtYW55KHhQLCB0aW1lcylcbiAgICAuZm1hcChhcnJhID0+IGFycmEuam9pbignJykpXG4gICAgLnNldExhYmVsKCdtYW55Q2hhcnMgJyArIHhQLmxhYmVsXG4gICAgICAgICAgICArICgodHlwZW9mIHRpbWVzICE9PSAndW5kZWZpbmVkJykgPyAnIHRpbWVzPScgKyB0aW1lcyA6ICcnKSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtYW55MSh4UCkge1xuICBjb25zdCBsYWJlbCA9ICdtYW55MSAnICsgeFAubGFiZWw7XG4gIHJldHVybiBwYXJzZXIocG9zID0+IHtcbiAgICBjb25zdCByZXMxID0geFAucnVuKHBvcyk7XG4gICAgaWYgKHJlczEuaXNGYWlsdXJlKSByZXR1cm4gcmVzMTtcbiAgICBjb25zdCByZXNOID0gemVyb09yTW9yZSh4UCkocmVzMS52YWx1ZVsxXSk7XG4gICAgcmV0dXJuIFZhbGlkYXRpb24uU3VjY2VzcyhUdXBsZS5QYWlyKFtyZXMxLnZhbHVlWzBdXS5jb25jYXQocmVzTi52YWx1ZVswXSksIHJlc04udmFsdWVbMV0pKTtcbiAgfSwgbGFiZWwpLnNldExhYmVsKGxhYmVsKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1hbnlDaGFyczEoeFApIHtcbiAgcmV0dXJuIG1hbnkxKHhQKVxuICAgIC5mbWFwKGFycmEgPT4gYXJyYS5qb2luKCcnKSlcbiAgICAuc2V0TGFiZWwoJ21hbnlDaGFyczEgJyArIHhQLmxhYmVsKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG9wdCh4UCwgZGVmYXVsdFZhbHVlKSB7XG4gIGNvbnN0IGlzRGVmYXVsdCA9ICh0eXBlb2YgZGVmYXVsdFZhbHVlICE9PSAndW5kZWZpbmVkJyk7XG4gIGNvbnN0IGxhYmVsID0gJ29wdCAnICsgeFAubGFiZWxcbiAgICAgICAgKyAoaXNEZWZhdWx0ID8gJyhkZWZhdWx0PScgKyBkZWZhdWx0VmFsdWUgKyAnKScgOiAnJyk7XG4gIHJldHVybiBwYXJzZXIocG9zID0+IHtcbiAgICBjb25zdCByZXMgPSB4UC5mbWFwKE1heWJlLkp1c3QpLnJ1bihwb3MpO1xuICAgIGlmIChyZXMuaXNTdWNjZXNzKSByZXR1cm4gcmVzO1xuICAgIGNvbnN0IG91dGNvbWUgPSAoaXNEZWZhdWx0KSA/IE1heWJlLkp1c3QoZGVmYXVsdFZhbHVlKSA6IE1heWJlLk5vdGhpbmcoKTtcbiAgICByZXR1cm4gVmFsaWRhdGlvbi5TdWNjZXNzKFR1cGxlLlBhaXIob3V0Y29tZSwgcG9zKSk7XG4gIH0sIGxhYmVsKS5zZXRMYWJlbChsYWJlbCk7XG59XG5cbi8vIG9wdCBmcm9tIHRoZSBib29rIC0gd29ya3Mgb2ssIGJ1dCB0b1N0cmluZygpIGdpdmVzIHN0cmFuZ2UgcmVzdWx0c1xuZXhwb3J0IGZ1bmN0aW9uIG9wdEJvb2socFgpIHtcbiAgY29uc3Qgc29tZVAgPSBwWC5mbWFwKE1heWJlLkp1c3QpO1xuICBjb25zdCBub25lUCA9IHJldHVyblAoTWF5YmUuTm90aGluZyk7XG4gIHJldHVybiBzb21lUC5vckVsc2Uobm9uZVApO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZGlzY2FyZFNlY29uZChwMSwgcDIpIHtcbiAgY29uc3QgbGFiZWwgPSBwMS5sYWJlbCArICcgZGlzY2FyZFNlY29uZCAnICsgcDIubGFiZWw7XG4gIHJldHVybiBwYXJzZXIocG9zID0+IHtcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tdW51c2VkLXZhcnNcbiAgICByZXR1cm4gYW5kVGhlbihwMSwgcDIpLmZtYXAoKFt4LCB5XSkgPT4geCkucnVuKHBvcyk7XG4gIH0sIGxhYmVsKS5zZXRMYWJlbChsYWJlbCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBkaXNjYXJkRmlyc3QocDEsIHAyKSB7XG4gIGNvbnN0IGxhYmVsID0gcDEubGFiZWwgKyAnIGRpc2NhcmRGaXJzdCAnICsgcDIubGFiZWw7XG4gIHJldHVybiBwYXJzZXIocG9zID0+IHtcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tdW51c2VkLXZhcnNcbiAgICByZXR1cm4gYW5kVGhlbihwMSwgcDIpLmZtYXAoKFt4LCB5XSkgPT4geSkucnVuKHBvcyk7XG4gIH0sIGxhYmVsKS5zZXRMYWJlbChsYWJlbCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzZXBCeTFCb29rKHB4LCBzZXApIHtcbiAgcmV0dXJuIHB4LmFuZFRoZW4obWFueShzZXAuZGlzY2FyZEZpcnN0KHB4KSkpLmZtYXAoKFtyLCBybGlzdF0pID0+IFtyXS5jb25jYXQocmxpc3QpKTtcbn1cblxuLy8gbXkgdmVyc2lvbiB3b3JrcyBqdXN0IGZpbmUuLi5cbmV4cG9ydCBmdW5jdGlvbiBzZXBCeTEodmFsdWVQLCBzZXBhcmF0b3JQKSB7XG4gIHJldHVybiBtYW55KG1hbnkxKHZhbHVlUCkuZGlzY2FyZFNlY29uZChvcHQoc2VwYXJhdG9yUCkpKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGJldHdlZW4ocDEsIHAyLCBwMykge1xuICByZXR1cm4gcDEuZGlzY2FyZEZpcnN0KHAyKS5kaXNjYXJkU2Vjb25kKHAzKVxuICAgIC5zZXRMYWJlbCgnYmV0d2VlbiAnICsgcDEubGFiZWwgKyAnLycgKyBwMi5sYWJlbCArICcvJyArIHAzLmxhYmVsKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGJldHdlZW5QYXJlbnMocHgpIHtcbiAgcmV0dXJuIGJldHdlZW4ocGNoYXIoJygnKSwgcHgsIHBjaGFyKCcpJykpXG4gICAgLnNldExhYmVsKCdiZXR3ZWVuUGFyZW5zICcgKyBweC5sYWJlbCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBiaW5kUChmYW1iLCBweCkge1xuICBjb25zdCBsYWJlbCA9ICd1bmtub3duJztcbiAgcmV0dXJuIHBhcnNlcihwb3MgPT4ge1xuICAgIGNvbnN0IHJlcyA9IHB4LnJ1bihwb3MpO1xuICAgIGlmIChyZXMuaXNGYWlsdXJlKSByZXR1cm4gcmVzO1xuICAgIHJldHVybiBmYW1iKHJlcy52YWx1ZVswXSkucnVuKHJlcy52YWx1ZVsxXSk7XG4gIH0sIGxhYmVsKS5zZXRMYWJlbChsYWJlbCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB0YXBQKHB4LCBmbikge1xuICByZXR1cm4gcHguYmluZChyZXMgPT4ge1xuICAgIGZuKHJlcyk7XG4gICAgcmV0dXJuIHJldHVyblAocmVzKTtcbiAgfSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBsb2dQKHB4KSB7XG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1jb25zb2xlXG4gIHJldHVybiB0YXBQKHB4LCByZXMgPT4gY29uc29sZS5sb2cocHgubGFiZWwgKyAnOicgKyByZXMpKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHB3b3JkKHdvcmQpIHtcbiAgcmV0dXJuIHRyaW1QKHBzdHJpbmcod29yZCkpXG4gICAgLnNldExhYmVsKCdwd29yZCAnICsgd29yZCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB0cmltUChwWCkge1xuICByZXR1cm4gb3B0KG1hbnkod2hpdGVQKSlcbiAgICAuZGlzY2FyZEZpcnN0KHBYKVxuICAgIC5kaXNjYXJkU2Vjb25kKG9wdChtYW55KHdoaXRlUCkpKVxuICAgIC5zZXRMYWJlbCgndHJpbSAnICsgcFgubGFiZWwpO1xufVxuXG5mdW5jdGlvbiBfY29ucyh4KSB7XG4gIHJldHVybiBmdW5jdGlvbih4cykge1xuICAgIHJldHVybiBbeF0uY29uY2F0KHhzKTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gX3NldExhYmVsKHB4LCBuZXdMYWJlbCkge1xuICByZXR1cm4gcGFyc2VyKHBvcyA9PiB7XG4gICAgY29uc3QgcmVzdWx0ID0gcHgucnVuKHBvcyk7XG4gICAgaWYgKHJlc3VsdC5pc0ZhaWx1cmUpIHJldHVybiBWYWxpZGF0aW9uLkZhaWx1cmUoVHVwbGUuVHJpcGxlKG5ld0xhYmVsLCByZXN1bHQudmFsdWVbMV0sIHJlc3VsdC52YWx1ZVsyXSkpO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH0sIG5ld0xhYmVsKTtcbn1cblxuLy8gdGhlIHJlYWwgdGhpbmcuLi5cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZXIoZm4sIGxhYmVsKSB7XG4gIHJldHVybiB7XG4gICAgdHlwZTogJ3BhcnNlcicsXG4gICAgbGFiZWwsXG4gICAgcnVuKHBvcykge1xuICAgICAgcmV0dXJuIGZuKHBvcyk7XG4gICAgfSxcbiAgICBhcHBseShweCkge1xuICAgICAgcmV0dXJuIGFwcGx5UCh0aGlzKShweCk7XG4gICAgICAvLyByZXR1cm4gdGhpcy5iaW5kKGFuZFRoZW4odGhpcywgcHgpLmZtYXAoKFtmLCB4XSkgPT4gZih4KSkpLnJ1bjsgLy8gd2UgYXJlIHRoZSBmUFxuICAgIH0sXG4gICAgZm1hcChmYWIpIHtcbiAgICAgIC8vIHJldHVybiBmbWFwKGZhYiwgdGhpcyk7XG4gICAgICAvLyByZXR1cm4gYmluZFAocG9zID0+IHJldHVyblAoZmFiKHBvcykpLCB0aGlzKTtcbiAgICAgIHJldHVybiB0aGlzLmJpbmQocGFyc2VkVmFsdWUgPT4gcmV0dXJuUChmYWIocGFyc2VkVmFsdWUpKSk7XG4gICAgfSxcbiAgICBhbmRUaGVuKHB4KSB7XG4gICAgICByZXR1cm4gYW5kVGhlbih0aGlzLCBweCk7XG4gICAgfSxcbiAgICBvckVsc2UocHgpIHtcbiAgICAgIHJldHVybiBvckVsc2UodGhpcywgcHgpO1xuICAgIH0sXG4gICAgZGlzY2FyZEZpcnN0KHB4KSB7XG4gICAgICByZXR1cm4gZGlzY2FyZEZpcnN0KHRoaXMsIHB4KTtcbiAgICB9LFxuICAgIGRpc2NhcmRTZWNvbmQocHgpIHtcbiAgICAgIHJldHVybiBkaXNjYXJkU2Vjb25kKHRoaXMsIHB4KTtcbiAgICB9LFxuICAgIGJpbmQoZmFtYikge1xuICAgICAgcmV0dXJuIGJpbmRQKGZhbWIsIHRoaXMpO1xuICAgIH0sXG4gICAgc2V0TGFiZWwobmV3TGFiZWwpIHtcbiAgICAgIHJldHVybiBfc2V0TGFiZWwodGhpcywgbmV3TGFiZWwpO1xuICAgIH0sXG4gIH07XG59XG4iXX0=