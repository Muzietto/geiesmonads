define(['exports', './tuples', './maybe', './validation'], function (exports, _tuples, _maybe, _validation) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.discardFirst = exports.discardSecond = exports.whiteP = exports.digitP = exports.letterP = exports.uppercaseP = exports.lowercaseP = exports.succeed = exports.fail = exports.orElse = exports.andThen = exports.predicateBasedParser = exports.digitParser = exports.charParser = undefined;
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

  function _andThen(p1, p2) {
    var label = p1.label + ' andThen ' + p2.label;
    return parser(function (pos) {
      var res1 = p1.run(pos);
      if (res1.isSuccess) {
        var res2 = p2.run(res1.value[1]);
        if (res2.isSuccess) {
          return _validation.Validation.Success(_tuples.Tuple.Pair(_tuples.Tuple.Pair(res1.value[0], res2.value[0]), res2.value[1]));
        }return _validation.Validation.Failure(_tuples.Tuple.Triple(label, res2.value[1], res2.value[2]));
      }return _validation.Validation.Failure(_tuples.Tuple.Triple(label, res1.value[1], res1.value[2]));
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2pzL3BhcnNlcnMuanMiXSwibmFtZXMiOlsicGNoYXIiLCJwZGlnaXQiLCJhbmRUaGVuQmluZCIsImNob2ljZSIsImFueU9mIiwiZm1hcCIsInJldHVyblAiLCJhcHBseVB4IiwiYXBwbHlQIiwibGlmdDIiLCJzZXF1ZW5jZVAiLCJzZXF1ZW5jZVAyIiwicHN0cmluZyIsInN0cmluZ1AiLCJ6ZXJvT3JNb3JlIiwibWFueSIsIm1hbnlDaGFycyIsIm1hbnkxIiwibWFueUNoYXJzMSIsIm9wdCIsIm9wdEJvb2siLCJzZXBCeTFCb29rIiwic2VwQnkxIiwiYmV0d2VlbiIsImJldHdlZW5QYXJlbnMiLCJiaW5kUCIsInRhcFAiLCJsb2dQIiwicHdvcmQiLCJ0cmltUCIsInBhcnNlciIsImNoYXJQYXJzZXIiLCJwb3MiLCJQb3NpdGlvbiIsImZyb21UZXh0Iiwib3B0Q2hhciIsImNoYXIiLCJpc05vdGhpbmciLCJWYWxpZGF0aW9uIiwiRmFpbHVyZSIsIlR1cGxlIiwiVHJpcGxlIiwidmFsdWUiLCJTdWNjZXNzIiwiUGFpciIsImluY3JQb3MiLCJkaWdpdFBhcnNlciIsInBhcnNlSW50IiwiZGlnaXQiLCJwcmVkaWNhdGVCYXNlZFBhcnNlciIsInByZWQiLCJsYWJlbCIsInJlc3VsdCIsInNldExhYmVsIiwiYW5kVGhlbiIsInAxIiwicDIiLCJyZXMxIiwicnVuIiwiaXNTdWNjZXNzIiwicmVzMiIsImJpbmQiLCJwYXJzZWRWYWx1ZTEiLCJwYXJzZWRWYWx1ZTIiLCJvckVsc2UiLCJmYWlsIiwic3VjY2VlZCIsInBhcnNlcnMiLCJyZWR1Y2VSaWdodCIsInJlc3QiLCJjdXJyIiwicmVkdWNlIiwiYWNjIiwiY2hhcnNBcnJheSIsIm1hcCIsImxvd2VyY2FzZVAiLCJ1cHBlcmNhc2VQIiwibGV0dGVyUCIsImRpZ2l0UCIsIndoaXRlUCIsImZhYiIsInBhcnNlcjEiLCJ0b1N0cmluZyIsInJlcyIsImZQIiwieFAiLCJmIiwieCIsInBhcnNlZFZhbHVlZiIsInBhcnNlZFZhbHVleCIsImZhYWIiLCJwYXJzZXIyIiwiYXBwbHkiLCJfY29ucyIsInkiLCJzdHIiLCJzcGxpdCIsImpvaW4iLCJpc0ZhaWx1cmUiLCJyZXNOIiwiY29uY2F0IiwidGltZXMiLCJ0aW1lc19kZWZpbmVkIiwicmVzdWx0TGVuZ3RoIiwibGVuZ3RoIiwiYXJyYSIsImRlZmF1bHRWYWx1ZSIsImlzRGVmYXVsdCIsIk1heWJlIiwiSnVzdCIsIm91dGNvbWUiLCJOb3RoaW5nIiwicFgiLCJzb21lUCIsIm5vbmVQIiwiZGlzY2FyZFNlY29uZCIsImRpc2NhcmRGaXJzdCIsInB4Iiwic2VwIiwiciIsInJsaXN0IiwidmFsdWVQIiwic2VwYXJhdG9yUCIsInAzIiwiZmFtYiIsImZuIiwiY29uc29sZSIsImxvZyIsIndvcmQiLCJ4cyIsIl9zZXRMYWJlbCIsIm5ld0xhYmVsIiwidHlwZSIsInBhcnNlZFZhbHVlIl0sIm1hcHBpbmdzIjoiOzs7Ozs7O1VBMkRnQkEsSyxHQUFBQSxLO1VBTUFDLE0sR0FBQUEsTTtVQWtCQUMsVyxHQUFBQSxXO1VBdUJBQyxNLEdBQUFBLE07VUFLQUMsSyxHQUFBQSxLO1VBV0FDLEksR0FBQUEsSTtVQVNBQyxPLEdBQUFBLE87VUFLQUMsTyxHQUFBQSxPO1VBT0FDLE0sR0FBQUEsTTtVQVVBQyxLLEdBQUFBLEs7VUFVQUMsUyxHQUFBQSxTO1VBUUFDLFUsR0FBQUEsVTtVQU9BQyxPLEdBQUFBLE87VUFLQUMsTyxHQUFBQSxPO1VBTUFDLFUsR0FBQUEsVTtVQVNBQyxJLEdBQUFBLEk7VUFpQkFDLFMsR0FBQUEsUztVQU9BQyxLLEdBQUFBLEs7VUFVQUMsVSxHQUFBQSxVO1VBTUFDLEcsR0FBQUEsRztVQWFBQyxPLEdBQUFBLE87VUFzQkFDLFUsR0FBQUEsVTtVQUtBQyxNLEdBQUFBLE07VUFJQUMsTyxHQUFBQSxPO1VBS0FDLGEsR0FBQUEsYTtVQUtBQyxLLEdBQUFBLEs7VUFTQUMsSSxHQUFBQSxJO1VBT0FDLEksR0FBQUEsSTtVQUtBQyxLLEdBQUFBLEs7VUFLQUMsSyxH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TyxJQUFQLEVBQWE2RyxFQUFiLENBQVA7QUFDQTtBQUNELE9BVEk7QUFVTGhILFVBVkssZ0JBVUEyRSxHQVZBLEVBVUs7QUFDUjtBQUNBO0FBQ0EsZUFBTyxLQUFLbkIsSUFBTCxDQUFVO0FBQUEsaUJBQWV2RCxRQUFRMEUsSUFBSXFELFdBQUosQ0FBUixDQUFmO0FBQUEsU0FBVixDQUFQO0FBQ0QsT0FkSTtBQWVML0UsYUFmSyxtQkFlRytELEVBZkgsRUFlTztBQUNWLGVBQU8vRCxTQUFRLElBQVIsRUFBYytELEVBQWQsQ0FBUDtBQUNELE9BakJJO0FBa0JMckQsWUFsQkssa0JBa0JFcUQsRUFsQkYsRUFrQk07QUFDVCxlQUFPckQsUUFBTyxJQUFQLEVBQWFxRCxFQUFiLENBQVA7QUFDRCxPQXBCSTtBQXFCTEQsa0JBckJLLHdCQXFCUUMsRUFyQlIsRUFxQlk7QUFDZixlQUFPRCxjQUFhLElBQWIsRUFBbUJDLEVBQW5CLENBQVA7QUFDRCxPQXZCSTtBQXdCTEYsbUJBeEJLLHlCQXdCU0UsRUF4QlQsRUF3QmE7QUFDaEIsZUFBT0YsZUFBYyxJQUFkLEVBQW9CRSxFQUFwQixDQUFQO0FBQ0QsT0ExQkk7QUEyQkx4RCxVQTNCSyxnQkEyQkErRCxJQTNCQSxFQTJCTTtBQUNULGVBQU9uRyxNQUFNbUcsSUFBTixFQUFZLElBQVosQ0FBUDtBQUNELE9BN0JJO0FBOEJMdkUsY0E5Qkssb0JBOEJJOEUsUUE5QkosRUE4QmM7QUFDakIsZUFBT0QsVUFBVSxJQUFWLEVBQWdCQyxRQUFoQixDQUFQO0FBQ0Q7QUFoQ0ksS0FBUDtBQWtDRCIsImZpbGUiOiJwYXJzZXJzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLypcblRoZSBNSVQgTGljZW5zZSAoTUlUKVxuXG5Db3B5cmlnaHQgKGMpIDIwMTQgTWFyY28gRmF1c3RpbmVsbGlcblxuUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxub2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxuaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xudG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG5mdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuXG5UaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpbiBhbGxcbmNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG5cblRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1JcbklNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxuRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXG5BVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSXG5MSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLFxuT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEVcblNPRlRXQVJFLlxuKi9cblxuLy8gY2ZyLiBcIlVuZGVyc3RhbmRpbmcgUGFyc2VyIENvbWJpbmF0b3JzXCIgKEYjIGZvciBGdW4gYW5kIFByb2ZpdClcblxuaW1wb3J0IHtcbiAgVHVwbGUsXG4gIFBvc2l0aW9uLFxufSBmcm9tICcuL3R1cGxlcyc7XG5pbXBvcnQgeyBNYXliZSB9IGZyb20gJy4vbWF5YmUnOyAvLyBKdXN0IG9yIE5vdGhpbmdcbmltcG9ydCB7IFZhbGlkYXRpb24gfSBmcm9tICcuL3ZhbGlkYXRpb24nOyAvLyBTdWNjZXNzIG9yIEZhaWx1cmVcblxuY29uc3QgY2hhclBhcnNlciA9IGNoYXIgPT4gcG9zID0+IHtcbiAgaWYgKHR5cGVvZiBwb3MgPT09ICdzdHJpbmcnKSBwb3MgPSBQb3NpdGlvbi5mcm9tVGV4dChwb3MpO1xuICBjb25zdCBvcHRDaGFyID0gcG9zLmNoYXIoKTtcbiAgaWYgKG9wdENoYXIuaXNOb3RoaW5nKSByZXR1cm4gVmFsaWRhdGlvbi5GYWlsdXJlKFR1cGxlLlRyaXBsZSgnY2hhclBhcnNlcicsICdubyBtb3JlIGlucHV0JywgcG9zKSk7XG4gIGlmIChvcHRDaGFyLnZhbHVlID09PSBjaGFyKSByZXR1cm4gVmFsaWRhdGlvbi5TdWNjZXNzKFR1cGxlLlBhaXIoY2hhciwgcG9zLmluY3JQb3MoKSkpO1xuICByZXR1cm4gVmFsaWRhdGlvbi5GYWlsdXJlKFR1cGxlLlRyaXBsZSgnY2hhclBhcnNlcicsICd3YW50ZWQgJyArIGNoYXIgKyAnOyBnb3QgJyArIG9wdENoYXIudmFsdWUsIHBvcykpO1xufTtcblxuY29uc3QgZGlnaXRQYXJzZXIgPSBkaWdpdCA9PiBwb3MgPT4ge1xuICBpZiAodHlwZW9mIHBvcyA9PT0gJ3N0cmluZycpIHBvcyA9IFBvc2l0aW9uLmZyb21UZXh0KHBvcyk7XG4gIGNvbnN0IG9wdENoYXIgPSBwb3MuY2hhcigpO1xuICBpZiAob3B0Q2hhci5pc05vdGhpbmcpIHJldHVybiBWYWxpZGF0aW9uLkZhaWx1cmUoVHVwbGUuVHJpcGxlKCdkaWdpdFBhcnNlcicsICdubyBtb3JlIGlucHV0JywgcG9zKSk7XG4gIGlmIChwYXJzZUludChvcHRDaGFyLnZhbHVlLCAxMCkgPT09IGRpZ2l0KSByZXR1cm4gVmFsaWRhdGlvbi5TdWNjZXNzKFR1cGxlLlBhaXIoZGlnaXQsIHBvcy5pbmNyUG9zKCkpKTtcbiAgcmV0dXJuIFZhbGlkYXRpb24uRmFpbHVyZShUdXBsZS5UcmlwbGUoJ2RpZ2l0UGFyc2VyJywgJ3dhbnRlZCAnICsgZGlnaXQgKyAnOyBnb3QgJyArIG9wdENoYXIudmFsdWUsIHBvcykpO1xufTtcblxuY29uc3QgcHJlZGljYXRlQmFzZWRQYXJzZXIgPSAocHJlZCwgbGFiZWwpID0+IHBvcyA9PiB7XG4gIGlmICh0eXBlb2YgcG9zID09PSAnc3RyaW5nJykgcG9zID0gUG9zaXRpb24uZnJvbVRleHQocG9zKTtcbiAgY29uc3Qgb3B0Q2hhciA9IHBvcy5jaGFyKCk7XG4gIGlmIChvcHRDaGFyLmlzTm90aGluZykgcmV0dXJuIFZhbGlkYXRpb24uRmFpbHVyZShUdXBsZS5UcmlwbGUobGFiZWwsICdubyBtb3JlIGlucHV0JywgcG9zKSk7XG4gIGlmIChwcmVkKG9wdENoYXIudmFsdWUpKSByZXR1cm4gVmFsaWRhdGlvbi5TdWNjZXNzKFR1cGxlLlBhaXIob3B0Q2hhci52YWx1ZSwgcG9zLmluY3JQb3MoKSkpO1xuICByZXR1cm4gVmFsaWRhdGlvbi5GYWlsdXJlKFR1cGxlLlRyaXBsZShsYWJlbCwgJ3VuZXhwZWN0ZWQgY2hhcjogJyArIG9wdENoYXIudmFsdWUsIHBvcykpO1xufTtcblxuZXhwb3J0IHsgY2hhclBhcnNlciwgZGlnaXRQYXJzZXIsIHByZWRpY2F0ZUJhc2VkUGFyc2VyIH07XG5cbmV4cG9ydCBmdW5jdGlvbiBwY2hhcihjaGFyKSB7XG4gIGNvbnN0IGxhYmVsID0gJ3BjaGFyXycgKyBjaGFyO1xuICBjb25zdCByZXN1bHQgPSBwb3MgPT4gY2hhclBhcnNlcihjaGFyKShwb3MpO1xuICByZXR1cm4gcGFyc2VyKHJlc3VsdCwgbGFiZWwpLnNldExhYmVsKGxhYmVsKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHBkaWdpdChkaWdpdCkge1xuICByZXR1cm4gcGFyc2VyKHBvcyA9PiBkaWdpdFBhcnNlcihkaWdpdCkocG9zKSwgJ3BkaWdpdF8nICsgZGlnaXQpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYW5kVGhlbihwMSwgcDIpIHtcbiAgY29uc3QgbGFiZWwgPSBwMS5sYWJlbCArICcgYW5kVGhlbiAnICsgcDIubGFiZWw7XG4gIHJldHVybiBwYXJzZXIocG9zID0+IHtcbiAgICBjb25zdCByZXMxID0gcDEucnVuKHBvcyk7XG4gICAgaWYgKHJlczEuaXNTdWNjZXNzKSB7XG4gICAgICBjb25zdCByZXMyID0gcDIucnVuKHJlczEudmFsdWVbMV0pO1xuICAgICAgaWYgKHJlczIuaXNTdWNjZXNzKSB7XG4gICAgICAgIHJldHVybiBWYWxpZGF0aW9uLlN1Y2Nlc3MoVHVwbGUuUGFpcihUdXBsZS5QYWlyKHJlczEudmFsdWVbMF0sIHJlczIudmFsdWVbMF0pLCByZXMyLnZhbHVlWzFdKSk7XG4gICAgICB9IHJldHVybiBWYWxpZGF0aW9uLkZhaWx1cmUoVHVwbGUuVHJpcGxlKGxhYmVsLCByZXMyLnZhbHVlWzFdLCByZXMyLnZhbHVlWzJdKSk7XG4gICAgfSByZXR1cm4gVmFsaWRhdGlvbi5GYWlsdXJlKFR1cGxlLlRyaXBsZShsYWJlbCwgcmVzMS52YWx1ZVsxXSwgcmVzMS52YWx1ZVsyXSkpO1xuICB9LCBsYWJlbCk7XG59XG5cbi8vIHVzaW5nIGJpbmRcbmV4cG9ydCBmdW5jdGlvbiBhbmRUaGVuQmluZChwMSwgcDIpIHtcbiAgcmV0dXJuIHAxLmJpbmQocGFyc2VkVmFsdWUxID0+IHtcbiAgICByZXR1cm4gcDIuYmluZChwYXJzZWRWYWx1ZTIgPT4ge1xuICAgICAgcmV0dXJuIHJldHVyblAoVHVwbGUuUGFpcihwYXJzZWRWYWx1ZTEsIHBhcnNlZFZhbHVlMikpO1xuICAgIH0pO1xuICB9KS5zZXRMYWJlbChwMS5sYWJlbCArICcgYW5kVGhlbiAnICsgcDIubGFiZWwpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gb3JFbHNlKHAxLCBwMikge1xuICBjb25zdCBsYWJlbCA9IHAxLmxhYmVsICsgJyBvckVsc2UgJyArIHAyLmxhYmVsO1xuICByZXR1cm4gcGFyc2VyKHBvcyA9PiB7XG4gICAgY29uc3QgcmVzMSA9IHAxLnJ1bihwb3MpO1xuICAgIGlmIChyZXMxLmlzU3VjY2VzcykgcmV0dXJuIHJlczE7XG4gICAgY29uc3QgcmVzMiA9IHAyLnJ1bihwb3MpO1xuICAgIGlmIChyZXMyLmlzU3VjY2VzcykgcmV0dXJuIHJlczI7XG4gICAgcmV0dXJuIFZhbGlkYXRpb24uRmFpbHVyZShUdXBsZS5UcmlwbGUobGFiZWwsIHJlczIudmFsdWVbMV0sIHJlczIudmFsdWVbMl0pKTtcbiAgfSwgbGFiZWwpLnNldExhYmVsKGxhYmVsKTtcbn1cblxuZXhwb3J0IGNvbnN0IGZhaWwgPSBwYXJzZXIocG9zID0+IFZhbGlkYXRpb24uRmFpbHVyZShUdXBsZS5UcmlwbGUoJycsICdmYWlsJywgcG9zKSkpO1xuXG5leHBvcnQgY29uc3Qgc3VjY2VlZCA9IHBhcnNlcihwb3MgPT4gVmFsaWRhdGlvbi5TdWNjZXNzKFR1cGxlLlBhaXIoVHVwbGUuUGFpcignJywgcG9zKSwgJ3N1Y2NlZWQnKSkpO1xuXG5leHBvcnQgZnVuY3Rpb24gY2hvaWNlKHBhcnNlcnMpIHtcbiAgcmV0dXJuIHBhcnNlcnMucmVkdWNlUmlnaHQoKHJlc3QsIGN1cnIpID0+IG9yRWxzZShjdXJyLCByZXN0KSwgZmFpbClcbiAgICAuc2V0TGFiZWwoJ2Nob2ljZSAnICsgcGFyc2Vycy5yZWR1Y2UoKGFjYywgY3VycikgPT4gYWNjICsgJy8nICsgY3Vyci5sYWJlbCwgJycpKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGFueU9mKGNoYXJzQXJyYXkpIHtcbiAgcmV0dXJuIGNob2ljZShjaGFyc0FycmF5Lm1hcChwY2hhcikpXG4gICAgLnNldExhYmVsKCdhbnlPZiAnICsgY2hhcnNBcnJheS5yZWR1Y2UoKGFjYywgY3VycikgPT4gYWNjICsgY3VyciwgJycpKTtcbn1cblxuZXhwb3J0IGNvbnN0IGxvd2VyY2FzZVAgPSBhbnlPZihbJ2EnLCAnYicsICdjJywgJ2QnLCAnZScsICdmJywgJ2cnLCAnaCcsICdpJywgJ2onLCAnaycsICdsJywgJ20nLCAnbicsICdvJywgJ3AnLCAncScsICdyJywgJ3MnLCAndCcsICd1JywgJ3YnLCAndycsICd4JywgJ3knLCAneiddKS5zZXRMYWJlbCgnbG93ZXJjYXNlUCcpO1xuZXhwb3J0IGNvbnN0IHVwcGVyY2FzZVAgPSBhbnlPZihbJ0EnLCAnQicsICdDJywgJ0QnLCAnRScsICdGJywgJ0cnLCAnSCcsICdJJywgJ0onLCAnSycsICdMJywgJ00nLCAnTicsICdPJywgJ1AnLCAnUScsICdSJywgJ1MnLCAnVCcsICdVJywgJ1YnLCAnVycsICdYJywgJ1knLCAnWiddKS5zZXRMYWJlbCgndXBwZXJjYXNlUCcpO1xuZXhwb3J0IGNvbnN0IGxldHRlclAgPSBsb3dlcmNhc2VQLm9yRWxzZSh1cHBlcmNhc2VQKS5zZXRMYWJlbCgnbGV0dGVyUCcpO1xuZXhwb3J0IGNvbnN0IGRpZ2l0UCA9IGFueU9mKFsnMCcsICcxJywgJzInLCAnMycsICc0JywgJzUnLCAnNicsICc3JywgJzgnLCAnOSddKS5zZXRMYWJlbCgnZGlnaXRQJyk7XG5leHBvcnQgY29uc3Qgd2hpdGVQID0gYW55T2YoWycgJywgJ1xcdCcsICdcXG4nLCAnXFxyJ10pLnNldExhYmVsKCd3aGl0ZVAnKTtcblxuZXhwb3J0IGZ1bmN0aW9uIGZtYXAoZmFiLCBwYXJzZXIxKSB7XG4gIGNvbnN0IGxhYmVsID0gcGFyc2VyMS5sYWJlbCArICcgZm1hcCAnICsgZmFiLnRvU3RyaW5nKCk7XG4gIHJldHVybiBwYXJzZXIocG9zID0+IHtcbiAgICBjb25zdCByZXMgPSBwYXJzZXIxLnJ1bihwb3MpO1xuICAgIGlmIChyZXMuaXNTdWNjZXNzKSByZXR1cm4gVmFsaWRhdGlvbi5TdWNjZXNzKFR1cGxlLlBhaXIoZmFiKHJlcy52YWx1ZVswXSksIHJlcy52YWx1ZVsxXSkpO1xuICAgIHJldHVybiBWYWxpZGF0aW9uLkZhaWx1cmUoVHVwbGUuVHJpcGxlKGxhYmVsLCByZXMudmFsdWVbMV0sIHJlcy52YWx1ZVsyXSkpO1xuICB9LCBsYWJlbCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZXR1cm5QKHZhbHVlKSB7XG4gIHJldHVybiBwYXJzZXIocG9zID0+IFZhbGlkYXRpb24uU3VjY2VzcyhUdXBsZS5QYWlyKHZhbHVlLCBwb3MpKSwgdmFsdWUpO1xufVxuXG4vLyBwYXJzZXIoYSAtPiBiKSAtPiBwYXJzZXIoYSkgLT4gcGFyc2VyKGIpXG5leHBvcnQgZnVuY3Rpb24gYXBwbHlQeChmUCkge1xuICByZXR1cm4gZnVuY3Rpb24oeFApIHtcbiAgICByZXR1cm4gYW5kVGhlbihmUCwgeFApLmZtYXAoKFtmLCB4XSkgPT4gZih4KSk7XG4gIH07XG59XG5cbi8vIHVzaW5nIGJpbmRcbmV4cG9ydCBmdW5jdGlvbiBhcHBseVAoZlApIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKHhQKSB7XG4gICAgcmV0dXJuIGZQLmJpbmQocGFyc2VkVmFsdWVmID0+IHtcbiAgICAgIHJldHVybiB4UC5iaW5kKHBhcnNlZFZhbHVleCA9PiB7XG4gICAgICAgIHJldHVybiByZXR1cm5QKHBhcnNlZFZhbHVlZihwYXJzZWRWYWx1ZXgpKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbGlmdDIoZmFhYikge1xuICByZXR1cm4gZnVuY3Rpb24ocGFyc2VyMSkge1xuICAgIHJldHVybiBmdW5jdGlvbihwYXJzZXIyKSB7XG4gICAgICAvLyByZXR1cm4gYXBwbHlQKGFwcGx5UChyZXR1cm5QKGZhYWIpKShwYXJzZXIxKSkocGFyc2VyMik7XG4gICAgICByZXR1cm4gcmV0dXJuUChmYWFiKS5hcHBseShwYXJzZXIxKS5hcHBseShwYXJzZXIyKTsgLy8gdXNpbmcgaW5zdGFuY2UgbWV0aG9kc1xuICAgIH07XG4gIH07XG59XG5cbi8vIHVzaW5nIGxpZnQyKGNvbnMpXG5leHBvcnQgZnVuY3Rpb24gc2VxdWVuY2VQKHBhcnNlcnMpIHtcbiAgcmV0dXJuIHBhcnNlcnNcbiAgICAucmVkdWNlUmlnaHQoKHJlc3QsIGN1cnIpID0+IHtcbiAgICAgIHJldHVybiBsaWZ0MihfY29ucykoY3VycikocmVzdCk7XG4gICAgfSwgcmV0dXJuUChbXSkpO1xufVxuXG4vLyB1c2luZyBuYWl2ZSBhbmRUaGVuICYmIGZtYXAgLS0+IHJldHVybnMgc3RyaW5ncywgbm90IGFycmF5cyFcbmV4cG9ydCBmdW5jdGlvbiBzZXF1ZW5jZVAyKHBhcnNlcnMpIHtcbiAgcmV0dXJuIHBhcnNlcnNcbiAgICAucmVkdWNlUmlnaHQoKHJlc3QsIGN1cnIpID0+IHtcbiAgICAgIHJldHVybiBmbWFwKChbeCwgeV0pID0+IHggKyB5LCBhbmRUaGVuKGN1cnIsIHJlc3QpKTtcbiAgICB9LCByZXR1cm5QKCcnKSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwc3RyaW5nKHN0cikge1xuICByZXR1cm4gc2VxdWVuY2VQKHN0ci5zcGxpdCgnJykubWFwKHBjaGFyKSlcbiAgICAuc2V0TGFiZWwoJ3BzdHJpbmcgJyArIHN0cik7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzdHJpbmdQKHN0cikge1xuICByZXR1cm4gcHN0cmluZyhzdHIpXG4gICAgLmZtYXAocmVzID0+IHJlcy5qb2luKCcnKSlcbiAgICAuc2V0TGFiZWwoJ3N0cmluZ1AgJyArIHN0cik7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB6ZXJvT3JNb3JlKHhQKSB7IC8vIHplcm9Pck1vcmUgOjogcCBhIC0+IFthXSAtPiB0cnkgW2FdID0gcCBhIC0+IHAgW2FdXG4gIHJldHVybiBwb3MgPT4ge1xuICAgIGNvbnN0IHJlczEgPSB4UC5ydW4ocG9zKTtcbiAgICBpZiAocmVzMS5pc0ZhaWx1cmUpIHJldHVybiBWYWxpZGF0aW9uLlN1Y2Nlc3MoVHVwbGUuUGFpcihbXSwgcG9zKSk7XG4gICAgY29uc3QgcmVzTiA9IHplcm9Pck1vcmUoeFApKHJlczEudmFsdWVbMV0pO1xuICAgIHJldHVybiBWYWxpZGF0aW9uLlN1Y2Nlc3MoVHVwbGUuUGFpcihbcmVzMS52YWx1ZVswXV0uY29uY2F0KHJlc04udmFsdWVbMF0pLCByZXNOLnZhbHVlWzFdKSk7XG4gIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtYW55KHhQLCB0aW1lcykge1xuICBjb25zdCB0aW1lc19kZWZpbmVkID0gKHR5cGVvZiB0aW1lcyAhPT0gJ3VuZGVmaW5lZCcpO1xuICBjb25zdCBsYWJlbCA9ICdtYW55ICcgKyB4UC5sYWJlbFxuICAgICAgICArICgodGltZXNfZGVmaW5lZCkgPyAnIHRpbWVzPScgKyB0aW1lcyA6ICcnKTtcbiAgcmV0dXJuIHBhcnNlcihwb3MgPT4ge1xuICAgIGNvbnN0IHJlcyA9IHplcm9Pck1vcmUoeFApKHBvcyk7XG4gICAgaWYgKHRpbWVzX2RlZmluZWQpIHsvLyBkZWJ1Z2dlcjtcbiAgICAgIGlmIChyZXMuaXNGYWlsdXJlKSByZXR1cm4gcmVzO1xuICAgICAgY29uc3QgcmVzdWx0TGVuZ3RoID0gcmVzLnZhbHVlWzBdLmxlbmd0aDtcbiAgICAgIHJldHVybiAocmVzdWx0TGVuZ3RoID09PSB0aW1lcylcbiAgICAgICAgPyByZXNcbiAgICAgICAgOiBWYWxpZGF0aW9uLkZhaWx1cmUoVHVwbGUuVHJpcGxlKGxhYmVsLCAndGltZXMgcGFyYW0gd2FudGVkICcgKyB0aW1lcyArICc7IGdvdCAnICsgcmVzdWx0TGVuZ3RoLCBwb3MpKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlcztcbiAgfSwgbGFiZWwpLnNldExhYmVsKGxhYmVsKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1hbnlDaGFycyh4UCwgdGltZXMpIHtcbiAgcmV0dXJuIG1hbnkoeFAsIHRpbWVzKVxuICAgIC5mbWFwKGFycmEgPT4gYXJyYS5qb2luKCcnKSlcbiAgICAuc2V0TGFiZWwoJ21hbnlDaGFycyAnICsgeFAubGFiZWxcbiAgICAgICAgICAgICsgKCh0eXBlb2YgdGltZXMgIT09ICd1bmRlZmluZWQnKSA/ICcgdGltZXM9JyArIHRpbWVzIDogJycpKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1hbnkxKHhQKSB7XG4gIGNvbnN0IGxhYmVsID0gJ21hbnkxICcgKyB4UC5sYWJlbDtcbiAgcmV0dXJuIHBhcnNlcihwb3MgPT4ge1xuICAgIGNvbnN0IHJlczEgPSB4UC5ydW4ocG9zKTtcbiAgICBpZiAocmVzMS5pc0ZhaWx1cmUpIHJldHVybiByZXMxO1xuICAgIGNvbnN0IHJlc04gPSB6ZXJvT3JNb3JlKHhQKShyZXMxLnZhbHVlWzFdKTtcbiAgICByZXR1cm4gVmFsaWRhdGlvbi5TdWNjZXNzKFR1cGxlLlBhaXIoW3JlczEudmFsdWVbMF1dLmNvbmNhdChyZXNOLnZhbHVlWzBdKSwgcmVzTi52YWx1ZVsxXSkpO1xuICB9LCBsYWJlbCkuc2V0TGFiZWwobGFiZWwpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbWFueUNoYXJzMSh4UCkge1xuICByZXR1cm4gbWFueTEoeFApXG4gICAgLmZtYXAoYXJyYSA9PiBhcnJhLmpvaW4oJycpKVxuICAgIC5zZXRMYWJlbCgnbWFueUNoYXJzMSAnICsgeFAubGFiZWwpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gb3B0KHhQLCBkZWZhdWx0VmFsdWUpIHtcbiAgY29uc3QgaXNEZWZhdWx0ID0gKHR5cGVvZiBkZWZhdWx0VmFsdWUgIT09ICd1bmRlZmluZWQnKTtcbiAgY29uc3QgbGFiZWwgPSAnb3B0ICcgKyB4UC5sYWJlbFxuICAgICAgICArIChpc0RlZmF1bHQgPyAnKGRlZmF1bHQ9JyArIGRlZmF1bHRWYWx1ZSArICcpJyA6ICcnKTtcbiAgcmV0dXJuIHBhcnNlcihwb3MgPT4ge1xuICAgIGNvbnN0IHJlcyA9IHhQLmZtYXAoTWF5YmUuSnVzdCkucnVuKHBvcyk7XG4gICAgaWYgKHJlcy5pc1N1Y2Nlc3MpIHJldHVybiByZXM7XG4gICAgY29uc3Qgb3V0Y29tZSA9IChpc0RlZmF1bHQpID8gTWF5YmUuSnVzdChkZWZhdWx0VmFsdWUpIDogTWF5YmUuTm90aGluZygpO1xuICAgIHJldHVybiBWYWxpZGF0aW9uLlN1Y2Nlc3MoVHVwbGUuUGFpcihvdXRjb21lLCBwb3MpKTtcbiAgfSwgbGFiZWwpLnNldExhYmVsKGxhYmVsKTtcbn1cblxuLy8gb3B0IGZyb20gdGhlIGJvb2sgLSB3b3JrcyBvaywgYnV0IHRvU3RyaW5nKCkgZ2l2ZXMgc3RyYW5nZSByZXN1bHRzXG5leHBvcnQgZnVuY3Rpb24gb3B0Qm9vayhwWCkge1xuICBjb25zdCBzb21lUCA9IHBYLmZtYXAoTWF5YmUuSnVzdCk7XG4gIGNvbnN0IG5vbmVQID0gcmV0dXJuUChNYXliZS5Ob3RoaW5nKTtcbiAgcmV0dXJuIHNvbWVQLm9yRWxzZShub25lUCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBkaXNjYXJkU2Vjb25kKHAxLCBwMikge1xuICBjb25zdCBsYWJlbCA9IHAxLmxhYmVsICsgJyBkaXNjYXJkU2Vjb25kICcgKyBwMi5sYWJlbDtcbiAgcmV0dXJuIHBhcnNlcihwb3MgPT4ge1xuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby11bnVzZWQtdmFyc1xuICAgIHJldHVybiBhbmRUaGVuKHAxLCBwMikuZm1hcCgoW3gsIHldKSA9PiB4KS5ydW4ocG9zKTtcbiAgfSwgbGFiZWwpLnNldExhYmVsKGxhYmVsKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRpc2NhcmRGaXJzdChwMSwgcDIpIHtcbiAgY29uc3QgbGFiZWwgPSBwMS5sYWJlbCArICcgZGlzY2FyZEZpcnN0ICcgKyBwMi5sYWJlbDtcbiAgcmV0dXJuIHBhcnNlcihwb3MgPT4ge1xuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby11bnVzZWQtdmFyc1xuICAgIHJldHVybiBhbmRUaGVuKHAxLCBwMikuZm1hcCgoW3gsIHldKSA9PiB5KS5ydW4ocG9zKTtcbiAgfSwgbGFiZWwpLnNldExhYmVsKGxhYmVsKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNlcEJ5MUJvb2socHgsIHNlcCkge1xuICByZXR1cm4gcHguYW5kVGhlbihtYW55KHNlcC5kaXNjYXJkRmlyc3QocHgpKSkuZm1hcCgoW3IsIHJsaXN0XSkgPT4gW3JdLmNvbmNhdChybGlzdCkpO1xufVxuXG4vLyBteSB2ZXJzaW9uIHdvcmtzIGp1c3QgZmluZS4uLlxuZXhwb3J0IGZ1bmN0aW9uIHNlcEJ5MSh2YWx1ZVAsIHNlcGFyYXRvclApIHtcbiAgcmV0dXJuIG1hbnkobWFueTEodmFsdWVQKS5kaXNjYXJkU2Vjb25kKG9wdChzZXBhcmF0b3JQKSkpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYmV0d2VlbihwMSwgcDIsIHAzKSB7XG4gIHJldHVybiBwMS5kaXNjYXJkRmlyc3QocDIpLmRpc2NhcmRTZWNvbmQocDMpXG4gICAgLnNldExhYmVsKCdiZXR3ZWVuICcgKyBwMS5sYWJlbCArICcvJyArIHAyLmxhYmVsICsgJy8nICsgcDMubGFiZWwpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYmV0d2VlblBhcmVucyhweCkge1xuICByZXR1cm4gYmV0d2VlbihwY2hhcignKCcpLCBweCwgcGNoYXIoJyknKSlcbiAgICAuc2V0TGFiZWwoJ2JldHdlZW5QYXJlbnMgJyArIHB4LmxhYmVsKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGJpbmRQKGZhbWIsIHB4KSB7XG4gIGNvbnN0IGxhYmVsID0gJ3Vua25vd24nO1xuICByZXR1cm4gcGFyc2VyKHBvcyA9PiB7XG4gICAgY29uc3QgcmVzID0gcHgucnVuKHBvcyk7XG4gICAgaWYgKHJlcy5pc0ZhaWx1cmUpIHJldHVybiByZXM7XG4gICAgcmV0dXJuIGZhbWIocmVzLnZhbHVlWzBdKS5ydW4ocmVzLnZhbHVlWzFdKTtcbiAgfSwgbGFiZWwpLnNldExhYmVsKGxhYmVsKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHRhcFAocHgsIGZuKSB7XG4gIHJldHVybiBweC5iaW5kKHJlcyA9PiB7XG4gICAgZm4ocmVzKTtcbiAgICByZXR1cm4gcmV0dXJuUChyZXMpO1xuICB9KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGxvZ1AocHgpIHtcbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWNvbnNvbGVcbiAgcmV0dXJuIHRhcFAocHgsIHJlcyA9PiBjb25zb2xlLmxvZyhweC5sYWJlbCArICc6JyArIHJlcykpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcHdvcmQod29yZCkge1xuICByZXR1cm4gdHJpbVAocHN0cmluZyh3b3JkKSlcbiAgICAuc2V0TGFiZWwoJ3B3b3JkICcgKyB3b3JkKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHRyaW1QKHBYKSB7XG4gIHJldHVybiBvcHQobWFueSh3aGl0ZVApKVxuICAgIC5kaXNjYXJkRmlyc3QocFgpXG4gICAgLmRpc2NhcmRTZWNvbmQob3B0KG1hbnkod2hpdGVQKSkpXG4gICAgLnNldExhYmVsKCd0cmltICcgKyBwWC5sYWJlbCk7XG59XG5cbmZ1bmN0aW9uIF9jb25zKHgpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKHhzKSB7XG4gICAgcmV0dXJuIFt4XS5jb25jYXQoeHMpO1xuICB9O1xufVxuXG5mdW5jdGlvbiBfc2V0TGFiZWwocHgsIG5ld0xhYmVsKSB7XG4gIHJldHVybiBwYXJzZXIocG9zID0+IHtcbiAgICBjb25zdCByZXN1bHQgPSBweC5ydW4ocG9zKTtcbiAgICBpZiAocmVzdWx0LmlzRmFpbHVyZSkgcmV0dXJuIFZhbGlkYXRpb24uRmFpbHVyZShUdXBsZS5UcmlwbGUobmV3TGFiZWwsIHJlc3VsdC52YWx1ZVsxXSwgcmVzdWx0LnZhbHVlWzJdKSk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfSwgbmV3TGFiZWwpO1xufVxuXG4vLyB0aGUgcmVhbCB0aGluZy4uLlxuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlcihmbiwgbGFiZWwpIHtcbiAgcmV0dXJuIHtcbiAgICB0eXBlOiAncGFyc2VyJyxcbiAgICBsYWJlbCxcbiAgICBydW4ocG9zKSB7XG4gICAgICByZXR1cm4gZm4ocG9zKTtcbiAgICB9LFxuICAgIGFwcGx5KHB4KSB7XG4gICAgICByZXR1cm4gYXBwbHlQKHRoaXMpKHB4KTtcbiAgICAgIC8vIHJldHVybiB0aGlzLmJpbmQoYW5kVGhlbih0aGlzLCBweCkuZm1hcCgoW2YsIHhdKSA9PiBmKHgpKSkucnVuOyAvLyB3ZSBhcmUgdGhlIGZQXG4gICAgfSxcbiAgICBmbWFwKGZhYikge1xuICAgICAgLy8gcmV0dXJuIGZtYXAoZmFiLCB0aGlzKTtcbiAgICAgIC8vIHJldHVybiBiaW5kUChwb3MgPT4gcmV0dXJuUChmYWIocG9zKSksIHRoaXMpO1xuICAgICAgcmV0dXJuIHRoaXMuYmluZChwYXJzZWRWYWx1ZSA9PiByZXR1cm5QKGZhYihwYXJzZWRWYWx1ZSkpKTtcbiAgICB9LFxuICAgIGFuZFRoZW4ocHgpIHtcbiAgICAgIHJldHVybiBhbmRUaGVuKHRoaXMsIHB4KTtcbiAgICB9LFxuICAgIG9yRWxzZShweCkge1xuICAgICAgcmV0dXJuIG9yRWxzZSh0aGlzLCBweCk7XG4gICAgfSxcbiAgICBkaXNjYXJkRmlyc3QocHgpIHtcbiAgICAgIHJldHVybiBkaXNjYXJkRmlyc3QodGhpcywgcHgpO1xuICAgIH0sXG4gICAgZGlzY2FyZFNlY29uZChweCkge1xuICAgICAgcmV0dXJuIGRpc2NhcmRTZWNvbmQodGhpcywgcHgpO1xuICAgIH0sXG4gICAgYmluZChmYW1iKSB7XG4gICAgICByZXR1cm4gYmluZFAoZmFtYiwgdGhpcyk7XG4gICAgfSxcbiAgICBzZXRMYWJlbChuZXdMYWJlbCkge1xuICAgICAgcmV0dXJuIF9zZXRMYWJlbCh0aGlzLCBuZXdMYWJlbCk7XG4gICAgfSxcbiAgfTtcbn1cbiJdfQ==