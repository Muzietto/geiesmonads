define(['exports', './tuples', './maybe', './validation'], function (exports, _tuples, _maybe, _validation) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.discardFirst = exports.discardSecond = exports.whiteP = exports.digitP = exports.letterP = exports.uppercaseP = exports.lowercaseP = exports.succeed = exports.fail = exports.orElse = exports.andThen = exports.endOfInputP = exports.startOfInputP = exports.predicateBasedParser = exports.digitParser = exports.charParser = undefined;
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
  var startOfInputP = exports.startOfInputP = parser(function (pos) {
    return pos.decrPos().char().isNothing ? succeed.run(pos) : fail.run(pos);
  }).setLabel('^');

  var endOfInputP = exports.endOfInputP = parser(function (pos) {
    return pos.incrPos().char().isNothing ? succeed.run(pos) : fail.run(pos);
  }).setLabel('$');

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
        var res1 = _validation.Validation.Failure();
        try {
          // crash going back beyond start of input => ok
          res1 = pchar(c1).run(res2.value[1].decrPos(2));
        } catch (err) {}
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2pzL3BhcnNlcnMuanMiXSwibmFtZXMiOlsicGNoYXIiLCJwZGlnaXQiLCJwcmVjZWRlZEJ5UCIsIm5vdFByZWNlZGVkQnlQIiwiYW5kVGhlbkJpbmQiLCJjaG9pY2UiLCJhbnlPZiIsImZtYXAiLCJyZXR1cm5QIiwiYXBwbHlQeCIsImFwcGx5UCIsImxpZnQyIiwic2VxdWVuY2VQIiwic2VxdWVuY2VQMiIsInBzdHJpbmciLCJzdHJpbmdQIiwiemVyb09yTW9yZSIsIm1hbnkiLCJtYW55Q2hhcnMiLCJtYW55MSIsIm1hbnlDaGFyczEiLCJvcHQiLCJvcHRCb29rIiwic2VwQnkxQm9vayIsInNlcEJ5MSIsImJldHdlZW4iLCJiZXR3ZWVuUGFyZW5zIiwiYmluZFAiLCJ0YXBQIiwibG9nUCIsInB3b3JkIiwidHJpbVAiLCJwYXJzZXIiLCJjaGFyUGFyc2VyIiwicG9zIiwiUG9zaXRpb24iLCJmcm9tVGV4dCIsIm9wdENoYXIiLCJjaGFyIiwiaXNOb3RoaW5nIiwiVmFsaWRhdGlvbiIsIkZhaWx1cmUiLCJUdXBsZSIsIlRyaXBsZSIsInZhbHVlIiwiU3VjY2VzcyIsIlBhaXIiLCJpbmNyUG9zIiwiZGlnaXRQYXJzZXIiLCJwYXJzZUludCIsImRpZ2l0IiwicHJlZGljYXRlQmFzZWRQYXJzZXIiLCJwcmVkIiwibGFiZWwiLCJzdGFydE9mSW5wdXRQIiwiZGVjclBvcyIsInN1Y2NlZWQiLCJydW4iLCJmYWlsIiwic2V0TGFiZWwiLCJlbmRPZklucHV0UCIsInJlc3VsdCIsImMxIiwiYzIiLCJyZXMyIiwiaXNTdWNjZXNzIiwicmVzMSIsImVyciIsImlzRmFpbHVyZSIsImFuZFRoZW4iLCJwMSIsInAyIiwiYmluZCIsInBhcnNlZFZhbHVlMSIsInBhcnNlZFZhbHVlMiIsIm9yRWxzZSIsInBhcnNlcnMiLCJyZWR1Y2VSaWdodCIsInJlc3QiLCJjdXJyIiwicmVkdWNlIiwiYWNjIiwiY2hhcnNBcnJheSIsIm1hcCIsImxvd2VyY2FzZVAiLCJ1cHBlcmNhc2VQIiwibGV0dGVyUCIsImRpZ2l0UCIsIndoaXRlUCIsImZhYiIsInBhcnNlcjEiLCJ0b1N0cmluZyIsInJlcyIsImZQIiwieFAiLCJmIiwieCIsInBhcnNlZFZhbHVlZiIsInBhcnNlZFZhbHVleCIsImZhYWIiLCJwYXJzZXIyIiwiYXBwbHkiLCJfY29ucyIsInkiLCJzdHIiLCJzcGxpdCIsImpvaW4iLCJyZXNOIiwiY29uY2F0IiwidGltZXMiLCJ0aW1lc19kZWZpbmVkIiwicmVzdWx0TGVuZ3RoIiwibGVuZ3RoIiwiYXJyYSIsImRlZmF1bHRWYWx1ZSIsImlzRGVmYXVsdCIsIk1heWJlIiwiSnVzdCIsIm91dGNvbWUiLCJOb3RoaW5nIiwicFgiLCJzb21lUCIsIm5vbmVQIiwiZGlzY2FyZFNlY29uZCIsImRpc2NhcmRGaXJzdCIsInB4Iiwic2VwIiwiciIsInJsaXN0IiwidmFsdWVQIiwic2VwYXJhdG9yUCIsInAzIiwiZmFtYiIsImZuIiwiY29uc29sZSIsImxvZyIsIndvcmQiLCJ4cyIsIl9zZXRMYWJlbCIsIm5ld0xhYmVsIiwidHlwZSIsInBhcnNlZFZhbHVlIl0sIm1hcHBpbmdzIjoiOzs7Ozs7O1VBcUVnQkEsSyxHQUFBQSxLO1VBTUFDLE0sR0FBQUEsTTtVQUlBQyxXLEdBQUFBLFc7VUFlQUMsYyxHQUFBQSxjO1VBa0NBQyxXLEdBQUFBLFc7VUF1QkFDLE0sR0FBQUEsTTtVQUtBQyxLLEdBQUFBLEs7VUFXQUMsSSxHQUFBQSxJO1VBU0FDLE8sR0FBQUEsTztVQUtBQyxPLEdBQUFBLE87VUFPQUMsTSxHQUFBQSxNO1VBVUFDLEssR0FBQUEsSztVQVVBQyxTLEdBQUFBLFM7VUFRQUMsVSxHQUFBQSxVO1VBT0FDLE8sR0FBQUEsTztVQUtBQyxPLEdBQUFBLE87VUFNQUMsVSxHQUFBQSxVO1VBU0FDLEksR0FBQUEsSTtVQWlCQUMsUyxHQUFBQSxTO1VBT0FDLEssR0FBQUEsSztVQVVBQyxVLEdBQUFBLFU7VUFNQUMsRyxHQUFBQSxHO1VBYUFDLE8sR0FBQUEsTztVQXNCQUMsVSxHQUFBQSxVO1VB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Qkssb0JBOEJJZ0YsUUE5QkosRUE4QmM7QUFDakIsZUFBT0QsVUFBVSxJQUFWLEVBQWdCQyxRQUFoQixDQUFQO0FBQ0Q7QUFoQ0ksS0FBUDtBQWtDRCIsImZpbGUiOiJwYXJzZXJzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLypcblRoZSBNSVQgTGljZW5zZSAoTUlUKVxuXG5Db3B5cmlnaHQgKGMpIDIwMTQgTWFyY28gRmF1c3RpbmVsbGlcblxuUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxub2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxuaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xudG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG5mdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuXG5UaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpbiBhbGxcbmNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG5cblRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1JcbklNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxuRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXG5BVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSXG5MSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLFxuT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEVcblNPRlRXQVJFLlxuKi9cblxuLy8gY2ZyLiBcIlVuZGVyc3RhbmRpbmcgUGFyc2VyIENvbWJpbmF0b3JzXCIgKEYjIGZvciBGdW4gYW5kIFByb2ZpdClcblxuaW1wb3J0IHtcbiAgVHVwbGUsXG4gIFBvc2l0aW9uLFxufSBmcm9tICcuL3R1cGxlcyc7XG5pbXBvcnQgeyBNYXliZSB9IGZyb20gJy4vbWF5YmUnOyAvLyBKdXN0IG9yIE5vdGhpbmdcbmltcG9ydCB7IFZhbGlkYXRpb24gfSBmcm9tICcuL3ZhbGlkYXRpb24nOyAvLyBTdWNjZXNzIG9yIEZhaWx1cmVcblxuY29uc3QgY2hhclBhcnNlciA9IGNoYXIgPT4gcG9zID0+IHtcbiAgaWYgKHR5cGVvZiBwb3MgPT09ICdzdHJpbmcnKSBwb3MgPSBQb3NpdGlvbi5mcm9tVGV4dChwb3MpO1xuICBjb25zdCBvcHRDaGFyID0gcG9zLmNoYXIoKTtcbiAgaWYgKG9wdENoYXIuaXNOb3RoaW5nKSByZXR1cm4gVmFsaWRhdGlvbi5GYWlsdXJlKFR1cGxlLlRyaXBsZSgnY2hhclBhcnNlcicsICdubyBtb3JlIGlucHV0JywgcG9zKSk7XG4gIGlmIChvcHRDaGFyLnZhbHVlID09PSBjaGFyKSByZXR1cm4gVmFsaWRhdGlvbi5TdWNjZXNzKFR1cGxlLlBhaXIoY2hhciwgcG9zLmluY3JQb3MoKSkpO1xuICByZXR1cm4gVmFsaWRhdGlvbi5GYWlsdXJlKFR1cGxlLlRyaXBsZSgnY2hhclBhcnNlcicsICd3YW50ZWQgJyArIGNoYXIgKyAnOyBnb3QgJyArIG9wdENoYXIudmFsdWUsIHBvcykpO1xufTtcblxuY29uc3QgZGlnaXRQYXJzZXIgPSBkaWdpdCA9PiBwb3MgPT4ge1xuICBpZiAodHlwZW9mIHBvcyA9PT0gJ3N0cmluZycpIHBvcyA9IFBvc2l0aW9uLmZyb21UZXh0KHBvcyk7XG4gIGNvbnN0IG9wdENoYXIgPSBwb3MuY2hhcigpO1xuICBpZiAob3B0Q2hhci5pc05vdGhpbmcpIHJldHVybiBWYWxpZGF0aW9uLkZhaWx1cmUoVHVwbGUuVHJpcGxlKCdkaWdpdFBhcnNlcicsICdubyBtb3JlIGlucHV0JywgcG9zKSk7XG4gIGlmIChwYXJzZUludChvcHRDaGFyLnZhbHVlLCAxMCkgPT09IGRpZ2l0KSByZXR1cm4gVmFsaWRhdGlvbi5TdWNjZXNzKFR1cGxlLlBhaXIoZGlnaXQsIHBvcy5pbmNyUG9zKCkpKTtcbiAgcmV0dXJuIFZhbGlkYXRpb24uRmFpbHVyZShUdXBsZS5UcmlwbGUoJ2RpZ2l0UGFyc2VyJywgJ3dhbnRlZCAnICsgZGlnaXQgKyAnOyBnb3QgJyArIG9wdENoYXIudmFsdWUsIHBvcykpO1xufTtcblxuY29uc3QgcHJlZGljYXRlQmFzZWRQYXJzZXIgPSAocHJlZCwgbGFiZWwpID0+IHBvcyA9PiB7XG4gIGlmICh0eXBlb2YgcG9zID09PSAnc3RyaW5nJykgcG9zID0gUG9zaXRpb24uZnJvbVRleHQocG9zKTtcbiAgY29uc3Qgb3B0Q2hhciA9IHBvcy5jaGFyKCk7XG4gIGlmIChvcHRDaGFyLmlzTm90aGluZykgcmV0dXJuIFZhbGlkYXRpb24uRmFpbHVyZShUdXBsZS5UcmlwbGUobGFiZWwsICdubyBtb3JlIGlucHV0JywgcG9zKSk7XG4gIGlmIChwcmVkKG9wdENoYXIudmFsdWUpKSByZXR1cm4gVmFsaWRhdGlvbi5TdWNjZXNzKFR1cGxlLlBhaXIob3B0Q2hhci52YWx1ZSwgcG9zLmluY3JQb3MoKSkpO1xuICByZXR1cm4gVmFsaWRhdGlvbi5GYWlsdXJlKFR1cGxlLlRyaXBsZShsYWJlbCwgJ3VuZXhwZWN0ZWQgY2hhcjogJyArIG9wdENoYXIudmFsdWUsIHBvcykpO1xufTtcblxuZXhwb3J0IHsgY2hhclBhcnNlciwgZGlnaXRQYXJzZXIsIHByZWRpY2F0ZUJhc2VkUGFyc2VyIH07XG5cbmV4cG9ydCBjb25zdCBzdGFydE9mSW5wdXRQID1cbiAgcGFyc2VyKHBvcyA9PiAocG9zLmRlY3JQb3MoKS5jaGFyKCkuaXNOb3RoaW5nKVxuICAgID8gc3VjY2VlZC5ydW4ocG9zKVxuICAgIDogZmFpbC5ydW4ocG9zKSkuc2V0TGFiZWwoJ14nKTtcblxuZXhwb3J0IGNvbnN0IGVuZE9mSW5wdXRQID1cbiAgcGFyc2VyKHBvcyA9PiAocG9zLmluY3JQb3MoKS5jaGFyKCkuaXNOb3RoaW5nKVxuICAgID8gc3VjY2VlZC5ydW4ocG9zKVxuICAgIDogZmFpbC5ydW4ocG9zKSkuc2V0TGFiZWwoJyQnKTtcblxuZXhwb3J0IGZ1bmN0aW9uIHBjaGFyKGNoYXIpIHtcbiAgY29uc3QgbGFiZWwgPSAncGNoYXJfJyArIGNoYXI7XG4gIGNvbnN0IHJlc3VsdCA9IHBvcyA9PiBjaGFyUGFyc2VyKGNoYXIpKHBvcyk7XG4gIHJldHVybiBwYXJzZXIocmVzdWx0LCBsYWJlbCkuc2V0TGFiZWwobGFiZWwpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcGRpZ2l0KGRpZ2l0KSB7XG4gIHJldHVybiBwYXJzZXIocG9zID0+IGRpZ2l0UGFyc2VyKGRpZ2l0KShwb3MpLCAncGRpZ2l0XycgKyBkaWdpdCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwcmVjZWRlZEJ5UChjMSwgYzIpIHtcbiAgY29uc3QgbGFiZWwgPSBjMiArICcgcHJlY2VkZWQgYnkgJyArIGMxO1xuICByZXR1cm4gcGFyc2VyKHBvcyA9PiB7XG4gICAgY29uc3QgcmVzMiA9IHBjaGFyKGMyKS5ydW4ocG9zKTtcbiAgICBpZiAocmVzMi5pc1N1Y2Nlc3MpIHtcbiAgICAgIGNvbnN0IHJlczEgPSBwY2hhcihjMSkucnVuKHJlczIudmFsdWVbMV0uZGVjclBvcygyKSk7XG4gICAgICBpZiAocmVzMS5pc1N1Y2Nlc3MpIHtcbiAgICAgICAgcmV0dXJuIFZhbGlkYXRpb24uU3VjY2VzcyhUdXBsZS5QYWlyKGMyLCByZXMyLnZhbHVlWzFdKSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gVmFsaWRhdGlvbi5GYWlsdXJlKFR1cGxlLlRyaXBsZShsYWJlbCwgcmVzMS52YWx1ZVsxXSwgcmVzMS52YWx1ZVsyXSkpO1xuICAgIH1cbiAgICByZXR1cm4gVmFsaWRhdGlvbi5GYWlsdXJlKFR1cGxlLlRyaXBsZShsYWJlbCwgcmVzMi52YWx1ZVsxXSwgcmVzMi52YWx1ZVsyXSkpO1xuICB9LCBsYWJlbCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBub3RQcmVjZWRlZEJ5UChjMSwgYzIpIHtcbiAgY29uc3QgbGFiZWwgPSBjMiArICcgbm90IHByZWNlZGVkIGJ5ICcgKyBjMTtcbiAgcmV0dXJuIHBhcnNlcihwb3MgPT4ge1xuICAgIGNvbnN0IHJlczIgPSBwY2hhcihjMikucnVuKHBvcyk7XG4gICAgaWYgKHJlczIuaXNTdWNjZXNzKSB7XG4gICAgICBsZXQgcmVzMSA9IFZhbGlkYXRpb24uRmFpbHVyZSgpO1xuICAgICAgdHJ5IHsgLy8gY3Jhc2ggZ29pbmcgYmFjayBiZXlvbmQgc3RhcnQgb2YgaW5wdXQgPT4gb2tcbiAgICAgICAgcmVzMSA9IHBjaGFyKGMxKS5ydW4ocmVzMi52YWx1ZVsxXS5kZWNyUG9zKDIpKTtcbiAgICAgIH0gY2F0Y2ggKGVycikge31cbiAgICAgIGlmIChyZXMxLmlzRmFpbHVyZSkge1xuICAgICAgICByZXR1cm4gVmFsaWRhdGlvbi5TdWNjZXNzKFR1cGxlLlBhaXIoYzIsIHJlczIudmFsdWVbMV0pKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBWYWxpZGF0aW9uLkZhaWx1cmUoVHVwbGUuVHJpcGxlKGxhYmVsLCByZXMxLnZhbHVlWzFdLCByZXMxLnZhbHVlWzJdKSk7XG4gICAgfVxuICAgIHJldHVybiBWYWxpZGF0aW9uLkZhaWx1cmUoVHVwbGUuVHJpcGxlKGxhYmVsLCByZXMyLnZhbHVlWzFdLCByZXMyLnZhbHVlWzJdKSk7XG4gIH0sIGxhYmVsKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGFuZFRoZW4ocDEsIHAyKSB7XG4gIGNvbnN0IGxhYmVsID0gcDEubGFiZWwgKyAnIGFuZFRoZW4gJyArIHAyLmxhYmVsO1xuICByZXR1cm4gcGFyc2VyKHBvcyA9PiB7XG4gICAgY29uc3QgcmVzMSA9IHAxLnJ1bihwb3MpO1xuICAgIGlmIChyZXMxLmlzU3VjY2Vzcykge1xuICAgICAgY29uc3QgcmVzMiA9IHAyLnJ1bihyZXMxLnZhbHVlWzFdKTtcbiAgICAgIGlmIChyZXMyLmlzU3VjY2Vzcykge1xuICAgICAgICByZXR1cm4gVmFsaWRhdGlvbi5TdWNjZXNzKFR1cGxlLlBhaXIoVHVwbGUuUGFpcihyZXMxLnZhbHVlWzBdLCByZXMyLnZhbHVlWzBdKSwgcmVzMi52YWx1ZVsxXSkpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIFZhbGlkYXRpb24uRmFpbHVyZShUdXBsZS5UcmlwbGUobGFiZWwsIHJlczIudmFsdWVbMV0sIHJlczIudmFsdWVbMl0pKTtcbiAgICB9XG4gICAgcmV0dXJuIFZhbGlkYXRpb24uRmFpbHVyZShUdXBsZS5UcmlwbGUobGFiZWwsIHJlczEudmFsdWVbMV0sIHJlczEudmFsdWVbMl0pKTtcbiAgfSwgbGFiZWwpO1xufVxuXG4vLyB1c2luZyBiaW5kXG5leHBvcnQgZnVuY3Rpb24gYW5kVGhlbkJpbmQocDEsIHAyKSB7XG4gIHJldHVybiBwMS5iaW5kKHBhcnNlZFZhbHVlMSA9PiB7XG4gICAgcmV0dXJuIHAyLmJpbmQocGFyc2VkVmFsdWUyID0+IHtcbiAgICAgIHJldHVybiByZXR1cm5QKFR1cGxlLlBhaXIocGFyc2VkVmFsdWUxLCBwYXJzZWRWYWx1ZTIpKTtcbiAgICB9KTtcbiAgfSkuc2V0TGFiZWwocDEubGFiZWwgKyAnIGFuZFRoZW4gJyArIHAyLmxhYmVsKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG9yRWxzZShwMSwgcDIpIHtcbiAgY29uc3QgbGFiZWwgPSBwMS5sYWJlbCArICcgb3JFbHNlICcgKyBwMi5sYWJlbDtcbiAgcmV0dXJuIHBhcnNlcihwb3MgPT4ge1xuICAgIGNvbnN0IHJlczEgPSBwMS5ydW4ocG9zKTtcbiAgICBpZiAocmVzMS5pc1N1Y2Nlc3MpIHJldHVybiByZXMxO1xuICAgIGNvbnN0IHJlczIgPSBwMi5ydW4ocG9zKTtcbiAgICBpZiAocmVzMi5pc1N1Y2Nlc3MpIHJldHVybiByZXMyO1xuICAgIHJldHVybiBWYWxpZGF0aW9uLkZhaWx1cmUoVHVwbGUuVHJpcGxlKGxhYmVsLCByZXMyLnZhbHVlWzFdLCByZXMyLnZhbHVlWzJdKSk7XG4gIH0sIGxhYmVsKS5zZXRMYWJlbChsYWJlbCk7XG59XG5cbmV4cG9ydCBjb25zdCBmYWlsID0gcGFyc2VyKHBvcyA9PiBWYWxpZGF0aW9uLkZhaWx1cmUoVHVwbGUuVHJpcGxlKCcnLCAnZmFpbCcsIHBvcykpKTtcblxuZXhwb3J0IGNvbnN0IHN1Y2NlZWQgPSBwYXJzZXIocG9zID0+IFZhbGlkYXRpb24uU3VjY2VzcyhUdXBsZS5QYWlyKFR1cGxlLlBhaXIoJycsIHBvcyksICdzdWNjZWVkJykpKTtcblxuZXhwb3J0IGZ1bmN0aW9uIGNob2ljZShwYXJzZXJzKSB7XG4gIHJldHVybiBwYXJzZXJzLnJlZHVjZVJpZ2h0KChyZXN0LCBjdXJyKSA9PiBvckVsc2UoY3VyciwgcmVzdCksIGZhaWwpXG4gICAgLnNldExhYmVsKCdjaG9pY2UgJyArIHBhcnNlcnMucmVkdWNlKChhY2MsIGN1cnIpID0+IGFjYyArICcvJyArIGN1cnIubGFiZWwsICcnKSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhbnlPZihjaGFyc0FycmF5KSB7XG4gIHJldHVybiBjaG9pY2UoY2hhcnNBcnJheS5tYXAocGNoYXIpKVxuICAgIC5zZXRMYWJlbCgnYW55T2YgJyArIGNoYXJzQXJyYXkucmVkdWNlKChhY2MsIGN1cnIpID0+IGFjYyArIGN1cnIsICcnKSk7XG59XG5cbmV4cG9ydCBjb25zdCBsb3dlcmNhc2VQID0gYW55T2YoWydhJywgJ2InLCAnYycsICdkJywgJ2UnLCAnZicsICdnJywgJ2gnLCAnaScsICdqJywgJ2snLCAnbCcsICdtJywgJ24nLCAnbycsICdwJywgJ3EnLCAncicsICdzJywgJ3QnLCAndScsICd2JywgJ3cnLCAneCcsICd5JywgJ3onXSkuc2V0TGFiZWwoJ2xvd2VyY2FzZVAnKTtcbmV4cG9ydCBjb25zdCB1cHBlcmNhc2VQID0gYW55T2YoWydBJywgJ0InLCAnQycsICdEJywgJ0UnLCAnRicsICdHJywgJ0gnLCAnSScsICdKJywgJ0snLCAnTCcsICdNJywgJ04nLCAnTycsICdQJywgJ1EnLCAnUicsICdTJywgJ1QnLCAnVScsICdWJywgJ1cnLCAnWCcsICdZJywgJ1onXSkuc2V0TGFiZWwoJ3VwcGVyY2FzZVAnKTtcbmV4cG9ydCBjb25zdCBsZXR0ZXJQID0gbG93ZXJjYXNlUC5vckVsc2UodXBwZXJjYXNlUCkuc2V0TGFiZWwoJ2xldHRlclAnKTtcbmV4cG9ydCBjb25zdCBkaWdpdFAgPSBhbnlPZihbJzAnLCAnMScsICcyJywgJzMnLCAnNCcsICc1JywgJzYnLCAnNycsICc4JywgJzknXSkuc2V0TGFiZWwoJ2RpZ2l0UCcpO1xuZXhwb3J0IGNvbnN0IHdoaXRlUCA9IGFueU9mKFsnICcsICdcXHQnLCAnXFxuJywgJ1xcciddKS5zZXRMYWJlbCgnd2hpdGVQJyk7XG5cbmV4cG9ydCBmdW5jdGlvbiBmbWFwKGZhYiwgcGFyc2VyMSkge1xuICBjb25zdCBsYWJlbCA9IHBhcnNlcjEubGFiZWwgKyAnIGZtYXAgJyArIGZhYi50b1N0cmluZygpO1xuICByZXR1cm4gcGFyc2VyKHBvcyA9PiB7XG4gICAgY29uc3QgcmVzID0gcGFyc2VyMS5ydW4ocG9zKTtcbiAgICBpZiAocmVzLmlzU3VjY2VzcykgcmV0dXJuIFZhbGlkYXRpb24uU3VjY2VzcyhUdXBsZS5QYWlyKGZhYihyZXMudmFsdWVbMF0pLCByZXMudmFsdWVbMV0pKTtcbiAgICByZXR1cm4gVmFsaWRhdGlvbi5GYWlsdXJlKFR1cGxlLlRyaXBsZShsYWJlbCwgcmVzLnZhbHVlWzFdLCByZXMudmFsdWVbMl0pKTtcbiAgfSwgbGFiZWwpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcmV0dXJuUCh2YWx1ZSkge1xuICByZXR1cm4gcGFyc2VyKHBvcyA9PiBWYWxpZGF0aW9uLlN1Y2Nlc3MoVHVwbGUuUGFpcih2YWx1ZSwgcG9zKSksIHZhbHVlKTtcbn1cblxuLy8gcGFyc2VyKGEgLT4gYikgLT4gcGFyc2VyKGEpIC0+IHBhcnNlcihiKVxuZXhwb3J0IGZ1bmN0aW9uIGFwcGx5UHgoZlApIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKHhQKSB7XG4gICAgcmV0dXJuIGFuZFRoZW4oZlAsIHhQKS5mbWFwKChbZiwgeF0pID0+IGYoeCkpO1xuICB9O1xufVxuXG4vLyB1c2luZyBiaW5kXG5leHBvcnQgZnVuY3Rpb24gYXBwbHlQKGZQKSB7XG4gIHJldHVybiBmdW5jdGlvbih4UCkge1xuICAgIHJldHVybiBmUC5iaW5kKHBhcnNlZFZhbHVlZiA9PiB7XG4gICAgICByZXR1cm4geFAuYmluZChwYXJzZWRWYWx1ZXggPT4ge1xuICAgICAgICByZXR1cm4gcmV0dXJuUChwYXJzZWRWYWx1ZWYocGFyc2VkVmFsdWV4KSk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGxpZnQyKGZhYWIpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKHBhcnNlcjEpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24ocGFyc2VyMikge1xuICAgICAgLy8gcmV0dXJuIGFwcGx5UChhcHBseVAocmV0dXJuUChmYWFiKSkocGFyc2VyMSkpKHBhcnNlcjIpO1xuICAgICAgcmV0dXJuIHJldHVyblAoZmFhYikuYXBwbHkocGFyc2VyMSkuYXBwbHkocGFyc2VyMik7IC8vIHVzaW5nIGluc3RhbmNlIG1ldGhvZHNcbiAgICB9O1xuICB9O1xufVxuXG4vLyB1c2luZyBsaWZ0Mihjb25zKVxuZXhwb3J0IGZ1bmN0aW9uIHNlcXVlbmNlUChwYXJzZXJzKSB7XG4gIHJldHVybiBwYXJzZXJzXG4gICAgLnJlZHVjZVJpZ2h0KChyZXN0LCBjdXJyKSA9PiB7XG4gICAgICByZXR1cm4gbGlmdDIoX2NvbnMpKGN1cnIpKHJlc3QpO1xuICAgIH0sIHJldHVyblAoW10pKTtcbn1cblxuLy8gdXNpbmcgbmFpdmUgYW5kVGhlbiAmJiBmbWFwIC0tPiByZXR1cm5zIHN0cmluZ3MsIG5vdCBhcnJheXMhXG5leHBvcnQgZnVuY3Rpb24gc2VxdWVuY2VQMihwYXJzZXJzKSB7XG4gIHJldHVybiBwYXJzZXJzXG4gICAgLnJlZHVjZVJpZ2h0KChyZXN0LCBjdXJyKSA9PiB7XG4gICAgICByZXR1cm4gZm1hcCgoW3gsIHldKSA9PiB4ICsgeSwgYW5kVGhlbihjdXJyLCByZXN0KSk7XG4gICAgfSwgcmV0dXJuUCgnJykpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcHN0cmluZyhzdHIpIHtcbiAgcmV0dXJuIHNlcXVlbmNlUChzdHIuc3BsaXQoJycpLm1hcChwY2hhcikpXG4gICAgLnNldExhYmVsKCdwc3RyaW5nICcgKyBzdHIpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc3RyaW5nUChzdHIpIHtcbiAgcmV0dXJuIHBzdHJpbmcoc3RyKVxuICAgIC5mbWFwKHJlcyA9PiByZXMuam9pbignJykpXG4gICAgLnNldExhYmVsKCdzdHJpbmdQICcgKyBzdHIpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gemVyb09yTW9yZSh4UCkgeyAvLyB6ZXJvT3JNb3JlIDo6IHAgYSAtPiBbYV0gLT4gdHJ5IFthXSA9IHAgYSAtPiBwIFthXVxuICByZXR1cm4gcG9zID0+IHtcbiAgICBjb25zdCByZXMxID0geFAucnVuKHBvcyk7XG4gICAgaWYgKHJlczEuaXNGYWlsdXJlKSByZXR1cm4gVmFsaWRhdGlvbi5TdWNjZXNzKFR1cGxlLlBhaXIoW10sIHBvcykpO1xuICAgIGNvbnN0IHJlc04gPSB6ZXJvT3JNb3JlKHhQKShyZXMxLnZhbHVlWzFdKTtcbiAgICByZXR1cm4gVmFsaWRhdGlvbi5TdWNjZXNzKFR1cGxlLlBhaXIoW3JlczEudmFsdWVbMF1dLmNvbmNhdChyZXNOLnZhbHVlWzBdKSwgcmVzTi52YWx1ZVsxXSkpO1xuICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbWFueSh4UCwgdGltZXMpIHtcbiAgY29uc3QgdGltZXNfZGVmaW5lZCA9ICh0eXBlb2YgdGltZXMgIT09ICd1bmRlZmluZWQnKTtcbiAgY29uc3QgbGFiZWwgPSAnbWFueSAnICsgeFAubGFiZWxcbiAgICAgICAgKyAoKHRpbWVzX2RlZmluZWQpID8gJyB0aW1lcz0nICsgdGltZXMgOiAnJyk7XG4gIHJldHVybiBwYXJzZXIocG9zID0+IHtcbiAgICBjb25zdCByZXMgPSB6ZXJvT3JNb3JlKHhQKShwb3MpO1xuICAgIGlmICh0aW1lc19kZWZpbmVkKSB7Ly8gZGVidWdnZXI7XG4gICAgICBpZiAocmVzLmlzRmFpbHVyZSkgcmV0dXJuIHJlcztcbiAgICAgIGNvbnN0IHJlc3VsdExlbmd0aCA9IHJlcy52YWx1ZVswXS5sZW5ndGg7XG4gICAgICByZXR1cm4gKHJlc3VsdExlbmd0aCA9PT0gdGltZXMpXG4gICAgICAgID8gcmVzXG4gICAgICAgIDogVmFsaWRhdGlvbi5GYWlsdXJlKFR1cGxlLlRyaXBsZShsYWJlbCwgJ3RpbWVzIHBhcmFtIHdhbnRlZCAnICsgdGltZXMgKyAnOyBnb3QgJyArIHJlc3VsdExlbmd0aCwgcG9zKSk7XG4gICAgfVxuICAgIHJldHVybiByZXM7XG4gIH0sIGxhYmVsKS5zZXRMYWJlbChsYWJlbCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtYW55Q2hhcnMoeFAsIHRpbWVzKSB7XG4gIHJldHVybiBtYW55KHhQLCB0aW1lcylcbiAgICAuZm1hcChhcnJhID0+IGFycmEuam9pbignJykpXG4gICAgLnNldExhYmVsKCdtYW55Q2hhcnMgJyArIHhQLmxhYmVsXG4gICAgICAgICAgICArICgodHlwZW9mIHRpbWVzICE9PSAndW5kZWZpbmVkJykgPyAnIHRpbWVzPScgKyB0aW1lcyA6ICcnKSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtYW55MSh4UCkge1xuICBjb25zdCBsYWJlbCA9ICdtYW55MSAnICsgeFAubGFiZWw7XG4gIHJldHVybiBwYXJzZXIocG9zID0+IHtcbiAgICBjb25zdCByZXMxID0geFAucnVuKHBvcyk7XG4gICAgaWYgKHJlczEuaXNGYWlsdXJlKSByZXR1cm4gcmVzMTtcbiAgICBjb25zdCByZXNOID0gemVyb09yTW9yZSh4UCkocmVzMS52YWx1ZVsxXSk7XG4gICAgcmV0dXJuIFZhbGlkYXRpb24uU3VjY2VzcyhUdXBsZS5QYWlyKFtyZXMxLnZhbHVlWzBdXS5jb25jYXQocmVzTi52YWx1ZVswXSksIHJlc04udmFsdWVbMV0pKTtcbiAgfSwgbGFiZWwpLnNldExhYmVsKGxhYmVsKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1hbnlDaGFyczEoeFApIHtcbiAgcmV0dXJuIG1hbnkxKHhQKVxuICAgIC5mbWFwKGFycmEgPT4gYXJyYS5qb2luKCcnKSlcbiAgICAuc2V0TGFiZWwoJ21hbnlDaGFyczEgJyArIHhQLmxhYmVsKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG9wdCh4UCwgZGVmYXVsdFZhbHVlKSB7XG4gIGNvbnN0IGlzRGVmYXVsdCA9ICh0eXBlb2YgZGVmYXVsdFZhbHVlICE9PSAndW5kZWZpbmVkJyk7XG4gIGNvbnN0IGxhYmVsID0gJ29wdCAnICsgeFAubGFiZWxcbiAgICAgICAgKyAoaXNEZWZhdWx0ID8gJyhkZWZhdWx0PScgKyBkZWZhdWx0VmFsdWUgKyAnKScgOiAnJyk7XG4gIHJldHVybiBwYXJzZXIocG9zID0+IHtcbiAgICBjb25zdCByZXMgPSB4UC5mbWFwKE1heWJlLkp1c3QpLnJ1bihwb3MpO1xuICAgIGlmIChyZXMuaXNTdWNjZXNzKSByZXR1cm4gcmVzO1xuICAgIGNvbnN0IG91dGNvbWUgPSAoaXNEZWZhdWx0KSA/IE1heWJlLkp1c3QoZGVmYXVsdFZhbHVlKSA6IE1heWJlLk5vdGhpbmcoKTtcbiAgICByZXR1cm4gVmFsaWRhdGlvbi5TdWNjZXNzKFR1cGxlLlBhaXIob3V0Y29tZSwgcG9zKSk7XG4gIH0sIGxhYmVsKS5zZXRMYWJlbChsYWJlbCk7XG59XG5cbi8vIG9wdCBmcm9tIHRoZSBib29rIC0gd29ya3Mgb2ssIGJ1dCB0b1N0cmluZygpIGdpdmVzIHN0cmFuZ2UgcmVzdWx0c1xuZXhwb3J0IGZ1bmN0aW9uIG9wdEJvb2socFgpIHtcbiAgY29uc3Qgc29tZVAgPSBwWC5mbWFwKE1heWJlLkp1c3QpO1xuICBjb25zdCBub25lUCA9IHJldHVyblAoTWF5YmUuTm90aGluZyk7XG4gIHJldHVybiBzb21lUC5vckVsc2Uobm9uZVApO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZGlzY2FyZFNlY29uZChwMSwgcDIpIHtcbiAgY29uc3QgbGFiZWwgPSBwMS5sYWJlbCArICcgZGlzY2FyZFNlY29uZCAnICsgcDIubGFiZWw7XG4gIHJldHVybiBwYXJzZXIocG9zID0+IHtcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tdW51c2VkLXZhcnNcbiAgICByZXR1cm4gYW5kVGhlbihwMSwgcDIpLmZtYXAoKFt4LCB5XSkgPT4geCkucnVuKHBvcyk7XG4gIH0sIGxhYmVsKS5zZXRMYWJlbChsYWJlbCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBkaXNjYXJkRmlyc3QocDEsIHAyKSB7XG4gIGNvbnN0IGxhYmVsID0gcDEubGFiZWwgKyAnIGRpc2NhcmRGaXJzdCAnICsgcDIubGFiZWw7XG4gIHJldHVybiBwYXJzZXIocG9zID0+IHtcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tdW51c2VkLXZhcnNcbiAgICByZXR1cm4gYW5kVGhlbihwMSwgcDIpLmZtYXAoKFt4LCB5XSkgPT4geSkucnVuKHBvcyk7XG4gIH0sIGxhYmVsKS5zZXRMYWJlbChsYWJlbCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzZXBCeTFCb29rKHB4LCBzZXApIHtcbiAgcmV0dXJuIHB4LmFuZFRoZW4obWFueShzZXAuZGlzY2FyZEZpcnN0KHB4KSkpLmZtYXAoKFtyLCBybGlzdF0pID0+IFtyXS5jb25jYXQocmxpc3QpKTtcbn1cblxuLy8gbXkgdmVyc2lvbiB3b3JrcyBqdXN0IGZpbmUuLi5cbmV4cG9ydCBmdW5jdGlvbiBzZXBCeTEodmFsdWVQLCBzZXBhcmF0b3JQKSB7XG4gIHJldHVybiBtYW55KG1hbnkxKHZhbHVlUCkuZGlzY2FyZFNlY29uZChvcHQoc2VwYXJhdG9yUCkpKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGJldHdlZW4ocDEsIHAyLCBwMykge1xuICByZXR1cm4gcDEuZGlzY2FyZEZpcnN0KHAyKS5kaXNjYXJkU2Vjb25kKHAzKVxuICAgIC5zZXRMYWJlbCgnYmV0d2VlbiAnICsgcDEubGFiZWwgKyAnLycgKyBwMi5sYWJlbCArICcvJyArIHAzLmxhYmVsKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGJldHdlZW5QYXJlbnMocHgpIHtcbiAgcmV0dXJuIGJldHdlZW4ocGNoYXIoJygnKSwgcHgsIHBjaGFyKCcpJykpXG4gICAgLnNldExhYmVsKCdiZXR3ZWVuUGFyZW5zICcgKyBweC5sYWJlbCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBiaW5kUChmYW1iLCBweCkge1xuICBjb25zdCBsYWJlbCA9ICd1bmtub3duJztcbiAgcmV0dXJuIHBhcnNlcihwb3MgPT4ge1xuICAgIGNvbnN0IHJlcyA9IHB4LnJ1bihwb3MpO1xuICAgIGlmIChyZXMuaXNGYWlsdXJlKSByZXR1cm4gcmVzO1xuICAgIHJldHVybiBmYW1iKHJlcy52YWx1ZVswXSkucnVuKHJlcy52YWx1ZVsxXSk7XG4gIH0sIGxhYmVsKS5zZXRMYWJlbChsYWJlbCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB0YXBQKHB4LCBmbikge1xuICByZXR1cm4gcHguYmluZChyZXMgPT4ge1xuICAgIGZuKHJlcyk7XG4gICAgcmV0dXJuIHJldHVyblAocmVzKTtcbiAgfSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBsb2dQKHB4KSB7XG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1jb25zb2xlXG4gIHJldHVybiB0YXBQKHB4LCByZXMgPT4gY29uc29sZS5sb2cocHgubGFiZWwgKyAnOicgKyByZXMpKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHB3b3JkKHdvcmQpIHtcbiAgcmV0dXJuIHRyaW1QKHBzdHJpbmcod29yZCkpXG4gICAgLnNldExhYmVsKCdwd29yZCAnICsgd29yZCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB0cmltUChwWCkge1xuICByZXR1cm4gb3B0KG1hbnkod2hpdGVQKSlcbiAgICAuZGlzY2FyZEZpcnN0KHBYKVxuICAgIC5kaXNjYXJkU2Vjb25kKG9wdChtYW55KHdoaXRlUCkpKVxuICAgIC5zZXRMYWJlbCgndHJpbSAnICsgcFgubGFiZWwpO1xufVxuXG5mdW5jdGlvbiBfY29ucyh4KSB7XG4gIHJldHVybiBmdW5jdGlvbih4cykge1xuICAgIHJldHVybiBbeF0uY29uY2F0KHhzKTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gX3NldExhYmVsKHB4LCBuZXdMYWJlbCkge1xuICByZXR1cm4gcGFyc2VyKHBvcyA9PiB7XG4gICAgY29uc3QgcmVzdWx0ID0gcHgucnVuKHBvcyk7XG4gICAgaWYgKHJlc3VsdC5pc0ZhaWx1cmUpIHJldHVybiBWYWxpZGF0aW9uLkZhaWx1cmUoVHVwbGUuVHJpcGxlKG5ld0xhYmVsLCByZXN1bHQudmFsdWVbMV0sIHJlc3VsdC52YWx1ZVsyXSkpO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH0sIG5ld0xhYmVsKTtcbn1cblxuLy8gdGhlIHJlYWwgdGhpbmcuLi5cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZXIoZm4sIGxhYmVsKSB7XG4gIHJldHVybiB7XG4gICAgdHlwZTogJ3BhcnNlcicsXG4gICAgbGFiZWwsXG4gICAgcnVuKHBvcykge1xuICAgICAgcmV0dXJuIGZuKHBvcyk7XG4gICAgfSxcbiAgICBhcHBseShweCkge1xuICAgICAgcmV0dXJuIGFwcGx5UCh0aGlzKShweCk7XG4gICAgICAvLyByZXR1cm4gdGhpcy5iaW5kKGFuZFRoZW4odGhpcywgcHgpLmZtYXAoKFtmLCB4XSkgPT4gZih4KSkpLnJ1bjsgLy8gd2UgYXJlIHRoZSBmUFxuICAgIH0sXG4gICAgZm1hcChmYWIpIHtcbiAgICAgIC8vIHJldHVybiBmbWFwKGZhYiwgdGhpcyk7XG4gICAgICAvLyByZXR1cm4gYmluZFAocG9zID0+IHJldHVyblAoZmFiKHBvcykpLCB0aGlzKTtcbiAgICAgIHJldHVybiB0aGlzLmJpbmQocGFyc2VkVmFsdWUgPT4gcmV0dXJuUChmYWIocGFyc2VkVmFsdWUpKSk7XG4gICAgfSxcbiAgICBhbmRUaGVuKHB4KSB7XG4gICAgICByZXR1cm4gYW5kVGhlbih0aGlzLCBweCk7XG4gICAgfSxcbiAgICBvckVsc2UocHgpIHtcbiAgICAgIHJldHVybiBvckVsc2UodGhpcywgcHgpO1xuICAgIH0sXG4gICAgZGlzY2FyZEZpcnN0KHB4KSB7XG4gICAgICByZXR1cm4gZGlzY2FyZEZpcnN0KHRoaXMsIHB4KTtcbiAgICB9LFxuICAgIGRpc2NhcmRTZWNvbmQocHgpIHtcbiAgICAgIHJldHVybiBkaXNjYXJkU2Vjb25kKHRoaXMsIHB4KTtcbiAgICB9LFxuICAgIGJpbmQoZmFtYikge1xuICAgICAgcmV0dXJuIGJpbmRQKGZhbWIsIHRoaXMpO1xuICAgIH0sXG4gICAgc2V0TGFiZWwobmV3TGFiZWwpIHtcbiAgICAgIHJldHVybiBfc2V0TGFiZWwodGhpcywgbmV3TGFiZWwpO1xuICAgIH0sXG4gIH07XG59XG4iXX0=