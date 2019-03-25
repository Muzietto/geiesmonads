define(['exports', './tuples', './maybe', './validation'], function (exports, _tuples, _maybe, _validation) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.discardFirst = exports.discardSecond = exports.whiteP = exports.digitP = exports.letterP = exports.uppercaseP = exports.lowercaseP = exports.succeedP = exports.failP = exports.orElse = exports.andThen = exports.endOfInputP = exports.startOfInputP = exports.predicateBasedParser = exports.digitParser = exports.charParser = undefined;
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
    return pos.decrPos().char().isNothing ? succeedP.run(pos) : failP.run(pos);
  }).setLabel('^');

  var endOfInputP = exports.endOfInputP = parser(function (pos) {
    return pos.incrPos().char().isNothing ? succeedP.run(pos) : failP.run(pos);
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
  var failP = exports.failP = parser(function (pos) {
    return _validation.Validation.Failure(_tuples.Tuple.Triple('', 'fail', pos));
  });

  var succeedP = exports.succeedP = parser(function (pos) {
    return _validation.Validation.Success(_tuples.Tuple.Pair('', pos), 'succeed');
  });

  function choice(parsers) {
    return parsers.reduceRight(function (rest, curr) {
      return _orElse(curr, rest);
    }, failP).setLabel('choice ' + parsers.reduce(function (acc, curr) {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2pzL3BhcnNlcnMuanMiXSwibmFtZXMiOlsicGNoYXIiLCJwZGlnaXQiLCJwcmVjZWRlZEJ5UCIsIm5vdFByZWNlZGVkQnlQIiwiYW5kVGhlbkJpbmQiLCJjaG9pY2UiLCJhbnlPZiIsImZtYXAiLCJyZXR1cm5QIiwiYXBwbHlQeCIsImFwcGx5UCIsImxpZnQyIiwic2VxdWVuY2VQIiwic2VxdWVuY2VQMiIsInBzdHJpbmciLCJzdHJpbmdQIiwiemVyb09yTW9yZSIsIm1hbnkiLCJtYW55Q2hhcnMiLCJtYW55MSIsIm1hbnlDaGFyczEiLCJvcHQiLCJvcHRCb29rIiwic2VwQnkxQm9vayIsInNlcEJ5MSIsImJldHdlZW4iLCJiZXR3ZWVuUGFyZW5zIiwiYmluZFAiLCJ0YXBQIiwibG9nUCIsInB3b3JkIiwidHJpbVAiLCJwYXJzZXIiLCJjaGFyUGFyc2VyIiwicG9zIiwiUG9zaXRpb24iLCJmcm9tVGV4dCIsIm9wdENoYXIiLCJjaGFyIiwiaXNOb3RoaW5nIiwiVmFsaWRhdGlvbiIsIkZhaWx1cmUiLCJUdXBsZSIsIlRyaXBsZSIsInZhbHVlIiwiU3VjY2VzcyIsIlBhaXIiLCJpbmNyUG9zIiwiZGlnaXRQYXJzZXIiLCJwYXJzZUludCIsImRpZ2l0IiwicHJlZGljYXRlQmFzZWRQYXJzZXIiLCJwcmVkIiwibGFiZWwiLCJzdGFydE9mSW5wdXRQIiwiZGVjclBvcyIsInN1Y2NlZWRQIiwicnVuIiwiZmFpbFAiLCJzZXRMYWJlbCIsImVuZE9mSW5wdXRQIiwicmVzdWx0IiwiYzEiLCJjMiIsInJlczIiLCJpc1N1Y2Nlc3MiLCJyZXMxIiwiZXJyIiwiaXNGYWlsdXJlIiwiYW5kVGhlbiIsInAxIiwicDIiLCJiaW5kIiwicGFyc2VkVmFsdWUxIiwicGFyc2VkVmFsdWUyIiwib3JFbHNlIiwicGFyc2VycyIsInJlZHVjZVJpZ2h0IiwicmVzdCIsImN1cnIiLCJyZWR1Y2UiLCJhY2MiLCJjaGFyc0FycmF5IiwibWFwIiwibG93ZXJjYXNlUCIsInVwcGVyY2FzZVAiLCJsZXR0ZXJQIiwiZGlnaXRQIiwid2hpdGVQIiwiZmFiIiwicGFyc2VyMSIsInRvU3RyaW5nIiwicmVzIiwiZlAiLCJ4UCIsImYiLCJ4IiwicGFyc2VkVmFsdWVmIiwicGFyc2VkVmFsdWV4IiwiZmFhYiIsInBhcnNlcjIiLCJhcHBseSIsIl9jb25zIiwieSIsInN0ciIsInNwbGl0Iiwiam9pbiIsInJlc04iLCJjb25jYXQiLCJ0aW1lcyIsInRpbWVzX2RlZmluZWQiLCJyZXN1bHRMZW5ndGgiLCJsZW5ndGgiLCJhcnJhIiwiZGVmYXVsdFZhbHVlIiwiaXNEZWZhdWx0IiwiTWF5YmUiLCJKdXN0Iiwib3V0Y29tZSIsIk5vdGhpbmciLCJwWCIsInNvbWVQIiwibm9uZVAiLCJkaXNjYXJkU2Vjb25kIiwiZGlzY2FyZEZpcnN0IiwicHgiLCJzZXAiLCJyIiwicmxpc3QiLCJ2YWx1ZVAiLCJzZXBhcmF0b3JQIiwicDMiLCJmYW1iIiwiZm4iLCJjb25zb2xlIiwibG9nIiwid29yZCIsInhzIiwiX3NldExhYmVsIiwibmV3TGFiZWwiLCJ0eXBlIiwicGFyc2VkVmFsdWUiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7VUFxRWdCQSxLLEdBQUFBLEs7VUFNQUMsTSxHQUFBQSxNO1VBSUFDLFcsR0FBQUEsVztVQWVBQyxjLEdBQUFBLGM7VUFrQ0FDLFcsR0FBQUEsVztVQXVCQUMsTSxHQUFBQSxNO1VBS0FDLEssR0FBQUEsSztVQVdBQyxJLEdBQUFBLEk7VUFTQUMsTyxHQUFBQSxPO1VBS0FDLE8sR0FBQUEsTztVQU9BQyxNLEdBQUFBLE07VUFVQUMsSyxHQUFBQSxLO1VBVUFDLFMsR0FBQUEsUztVQVFBQyxVLEdBQUFBLFU7VUFPQUMsTyxHQUFBQSxPO1VBS0FDLE8sR0FBQUEsTztVQU1BQyxVLEdBQUFBLFU7VUFTQUMsSSxHQUFBQSxJO1VBaUJBQyxTLEdBQUFBLFM7VUFPQUMsSyxHQUFBQSxLO1VBVUFDLFUsR0FBQUEsVTtVQU1BQyxHLEdBQUFBLEc7VUFhQUMsTyxHQUFBQSxPO1VBc0JBQyxVLEdBQUFBLFU7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OEJjO0FBQ2pCLGVBQU9ELFVBQVUsSUFBVixFQUFnQkMsUUFBaEIsQ0FBUDtBQUNEO0FBaENJLEtBQVA7QUFrQ0QiLCJmaWxlIjoicGFyc2Vycy5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qXG5UaGUgTUlUIExpY2Vuc2UgKE1JVClcblxuQ29weXJpZ2h0IChjKSAyMDE0IE1hcmNvIEZhdXN0aW5lbGxpXG5cblBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcbm9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWxcbmluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcbnRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcbmNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xuZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcblxuVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW4gYWxsXG5jb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuXG5USEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG5JTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbkZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcbk9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFXG5TT0ZUV0FSRS5cbiovXG5cbi8vIGNmci4gXCJVbmRlcnN0YW5kaW5nIFBhcnNlciBDb21iaW5hdG9yc1wiIChGIyBmb3IgRnVuIGFuZCBQcm9maXQpXG5cbmltcG9ydCB7XG4gIFR1cGxlLFxuICBQb3NpdGlvbixcbn0gZnJvbSAnLi90dXBsZXMnO1xuaW1wb3J0IHsgTWF5YmUgfSBmcm9tICcuL21heWJlJzsgLy8gSnVzdCBvciBOb3RoaW5nXG5pbXBvcnQgeyBWYWxpZGF0aW9uIH0gZnJvbSAnLi92YWxpZGF0aW9uJzsgLy8gU3VjY2VzcyBvciBGYWlsdXJlXG5cbmNvbnN0IGNoYXJQYXJzZXIgPSBjaGFyID0+IHBvcyA9PiB7XG4gIGlmICh0eXBlb2YgcG9zID09PSAnc3RyaW5nJykgcG9zID0gUG9zaXRpb24uZnJvbVRleHQocG9zKTtcbiAgY29uc3Qgb3B0Q2hhciA9IHBvcy5jaGFyKCk7XG4gIGlmIChvcHRDaGFyLmlzTm90aGluZykgcmV0dXJuIFZhbGlkYXRpb24uRmFpbHVyZShUdXBsZS5UcmlwbGUoJ2NoYXJQYXJzZXInLCAnbm8gbW9yZSBpbnB1dCcsIHBvcykpO1xuICBpZiAob3B0Q2hhci52YWx1ZSA9PT0gY2hhcikgcmV0dXJuIFZhbGlkYXRpb24uU3VjY2VzcyhUdXBsZS5QYWlyKGNoYXIsIHBvcy5pbmNyUG9zKCkpKTtcbiAgcmV0dXJuIFZhbGlkYXRpb24uRmFpbHVyZShUdXBsZS5UcmlwbGUoJ2NoYXJQYXJzZXInLCAnd2FudGVkICcgKyBjaGFyICsgJzsgZ290ICcgKyBvcHRDaGFyLnZhbHVlLCBwb3MpKTtcbn07XG5cbmNvbnN0IGRpZ2l0UGFyc2VyID0gZGlnaXQgPT4gcG9zID0+IHtcbiAgaWYgKHR5cGVvZiBwb3MgPT09ICdzdHJpbmcnKSBwb3MgPSBQb3NpdGlvbi5mcm9tVGV4dChwb3MpO1xuICBjb25zdCBvcHRDaGFyID0gcG9zLmNoYXIoKTtcbiAgaWYgKG9wdENoYXIuaXNOb3RoaW5nKSByZXR1cm4gVmFsaWRhdGlvbi5GYWlsdXJlKFR1cGxlLlRyaXBsZSgnZGlnaXRQYXJzZXInLCAnbm8gbW9yZSBpbnB1dCcsIHBvcykpO1xuICBpZiAocGFyc2VJbnQob3B0Q2hhci52YWx1ZSwgMTApID09PSBkaWdpdCkgcmV0dXJuIFZhbGlkYXRpb24uU3VjY2VzcyhUdXBsZS5QYWlyKGRpZ2l0LCBwb3MuaW5jclBvcygpKSk7XG4gIHJldHVybiBWYWxpZGF0aW9uLkZhaWx1cmUoVHVwbGUuVHJpcGxlKCdkaWdpdFBhcnNlcicsICd3YW50ZWQgJyArIGRpZ2l0ICsgJzsgZ290ICcgKyBvcHRDaGFyLnZhbHVlLCBwb3MpKTtcbn07XG5cbmNvbnN0IHByZWRpY2F0ZUJhc2VkUGFyc2VyID0gKHByZWQsIGxhYmVsKSA9PiBwb3MgPT4ge1xuICBpZiAodHlwZW9mIHBvcyA9PT0gJ3N0cmluZycpIHBvcyA9IFBvc2l0aW9uLmZyb21UZXh0KHBvcyk7XG4gIGNvbnN0IG9wdENoYXIgPSBwb3MuY2hhcigpO1xuICBpZiAob3B0Q2hhci5pc05vdGhpbmcpIHJldHVybiBWYWxpZGF0aW9uLkZhaWx1cmUoVHVwbGUuVHJpcGxlKGxhYmVsLCAnbm8gbW9yZSBpbnB1dCcsIHBvcykpO1xuICBpZiAocHJlZChvcHRDaGFyLnZhbHVlKSkgcmV0dXJuIFZhbGlkYXRpb24uU3VjY2VzcyhUdXBsZS5QYWlyKG9wdENoYXIudmFsdWUsIHBvcy5pbmNyUG9zKCkpKTtcbiAgcmV0dXJuIFZhbGlkYXRpb24uRmFpbHVyZShUdXBsZS5UcmlwbGUobGFiZWwsICd1bmV4cGVjdGVkIGNoYXI6ICcgKyBvcHRDaGFyLnZhbHVlLCBwb3MpKTtcbn07XG5cbmV4cG9ydCB7IGNoYXJQYXJzZXIsIGRpZ2l0UGFyc2VyLCBwcmVkaWNhdGVCYXNlZFBhcnNlciB9O1xuXG5leHBvcnQgY29uc3Qgc3RhcnRPZklucHV0UCA9XG4gIHBhcnNlcihwb3MgPT4gKHBvcy5kZWNyUG9zKCkuY2hhcigpLmlzTm90aGluZylcbiAgICA/IHN1Y2NlZWRQLnJ1bihwb3MpXG4gICAgOiBmYWlsUC5ydW4ocG9zKSkuc2V0TGFiZWwoJ14nKTtcblxuZXhwb3J0IGNvbnN0IGVuZE9mSW5wdXRQID1cbiAgcGFyc2VyKHBvcyA9PiAocG9zLmluY3JQb3MoKS5jaGFyKCkuaXNOb3RoaW5nKVxuICAgID8gc3VjY2VlZFAucnVuKHBvcylcbiAgICA6IGZhaWxQLnJ1bihwb3MpKS5zZXRMYWJlbCgnJCcpO1xuXG5leHBvcnQgZnVuY3Rpb24gcGNoYXIoY2hhcikge1xuICBjb25zdCBsYWJlbCA9ICdwY2hhcl8nICsgY2hhcjtcbiAgY29uc3QgcmVzdWx0ID0gcG9zID0+IGNoYXJQYXJzZXIoY2hhcikocG9zKTtcbiAgcmV0dXJuIHBhcnNlcihyZXN1bHQsIGxhYmVsKS5zZXRMYWJlbChsYWJlbCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwZGlnaXQoZGlnaXQpIHtcbiAgcmV0dXJuIHBhcnNlcihwb3MgPT4gZGlnaXRQYXJzZXIoZGlnaXQpKHBvcyksICdwZGlnaXRfJyArIGRpZ2l0KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHByZWNlZGVkQnlQKGMxLCBjMikge1xuICBjb25zdCBsYWJlbCA9IGMyICsgJyBwcmVjZWRlZCBieSAnICsgYzE7XG4gIHJldHVybiBwYXJzZXIocG9zID0+IHtcbiAgICBjb25zdCByZXMyID0gcGNoYXIoYzIpLnJ1bihwb3MpO1xuICAgIGlmIChyZXMyLmlzU3VjY2Vzcykge1xuICAgICAgY29uc3QgcmVzMSA9IHBjaGFyKGMxKS5ydW4ocmVzMi52YWx1ZVsxXS5kZWNyUG9zKDIpKTtcbiAgICAgIGlmIChyZXMxLmlzU3VjY2Vzcykge1xuICAgICAgICByZXR1cm4gVmFsaWRhdGlvbi5TdWNjZXNzKFR1cGxlLlBhaXIoYzIsIHJlczIudmFsdWVbMV0pKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBWYWxpZGF0aW9uLkZhaWx1cmUoVHVwbGUuVHJpcGxlKGxhYmVsLCByZXMxLnZhbHVlWzFdLCByZXMxLnZhbHVlWzJdKSk7XG4gICAgfVxuICAgIHJldHVybiBWYWxpZGF0aW9uLkZhaWx1cmUoVHVwbGUuVHJpcGxlKGxhYmVsLCByZXMyLnZhbHVlWzFdLCByZXMyLnZhbHVlWzJdKSk7XG4gIH0sIGxhYmVsKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG5vdFByZWNlZGVkQnlQKGMxLCBjMikge1xuICBjb25zdCBsYWJlbCA9IGMyICsgJyBub3QgcHJlY2VkZWQgYnkgJyArIGMxO1xuICByZXR1cm4gcGFyc2VyKHBvcyA9PiB7XG4gICAgY29uc3QgcmVzMiA9IHBjaGFyKGMyKS5ydW4ocG9zKTtcbiAgICBpZiAocmVzMi5pc1N1Y2Nlc3MpIHtcbiAgICAgIGxldCByZXMxID0gVmFsaWRhdGlvbi5GYWlsdXJlKCk7XG4gICAgICB0cnkgeyAvLyBjcmFzaCBnb2luZyBiYWNrIGJleW9uZCBzdGFydCBvZiBpbnB1dCA9PiBva1xuICAgICAgICByZXMxID0gcGNoYXIoYzEpLnJ1bihyZXMyLnZhbHVlWzFdLmRlY3JQb3MoMikpO1xuICAgICAgfSBjYXRjaCAoZXJyKSB7fVxuICAgICAgaWYgKHJlczEuaXNGYWlsdXJlKSB7XG4gICAgICAgIHJldHVybiBWYWxpZGF0aW9uLlN1Y2Nlc3MoVHVwbGUuUGFpcihjMiwgcmVzMi52YWx1ZVsxXSkpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIFZhbGlkYXRpb24uRmFpbHVyZShUdXBsZS5UcmlwbGUobGFiZWwsIHJlczEudmFsdWVbMV0sIHJlczEudmFsdWVbMl0pKTtcbiAgICB9XG4gICAgcmV0dXJuIFZhbGlkYXRpb24uRmFpbHVyZShUdXBsZS5UcmlwbGUobGFiZWwsIHJlczIudmFsdWVbMV0sIHJlczIudmFsdWVbMl0pKTtcbiAgfSwgbGFiZWwpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYW5kVGhlbihwMSwgcDIpIHtcbiAgY29uc3QgbGFiZWwgPSBwMS5sYWJlbCArICcgYW5kVGhlbiAnICsgcDIubGFiZWw7XG4gIHJldHVybiBwYXJzZXIocG9zID0+IHtcbiAgICBjb25zdCByZXMxID0gcDEucnVuKHBvcyk7XG4gICAgaWYgKHJlczEuaXNTdWNjZXNzKSB7XG4gICAgICBjb25zdCByZXMyID0gcDIucnVuKHJlczEudmFsdWVbMV0pO1xuICAgICAgaWYgKHJlczIuaXNTdWNjZXNzKSB7XG4gICAgICAgIHJldHVybiBWYWxpZGF0aW9uLlN1Y2Nlc3MoVHVwbGUuUGFpcihUdXBsZS5QYWlyKHJlczEudmFsdWVbMF0sIHJlczIudmFsdWVbMF0pLCByZXMyLnZhbHVlWzFdKSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gVmFsaWRhdGlvbi5GYWlsdXJlKFR1cGxlLlRyaXBsZShsYWJlbCwgcmVzMi52YWx1ZVsxXSwgcmVzMi52YWx1ZVsyXSkpO1xuICAgIH1cbiAgICByZXR1cm4gVmFsaWRhdGlvbi5GYWlsdXJlKFR1cGxlLlRyaXBsZShsYWJlbCwgcmVzMS52YWx1ZVsxXSwgcmVzMS52YWx1ZVsyXSkpO1xuICB9LCBsYWJlbCk7XG59XG5cbi8vIHVzaW5nIGJpbmRcbmV4cG9ydCBmdW5jdGlvbiBhbmRUaGVuQmluZChwMSwgcDIpIHtcbiAgcmV0dXJuIHAxLmJpbmQocGFyc2VkVmFsdWUxID0+IHtcbiAgICByZXR1cm4gcDIuYmluZChwYXJzZWRWYWx1ZTIgPT4ge1xuICAgICAgcmV0dXJuIHJldHVyblAoVHVwbGUuUGFpcihwYXJzZWRWYWx1ZTEsIHBhcnNlZFZhbHVlMikpO1xuICAgIH0pO1xuICB9KS5zZXRMYWJlbChwMS5sYWJlbCArICcgYW5kVGhlbiAnICsgcDIubGFiZWwpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gb3JFbHNlKHAxLCBwMikge1xuICBjb25zdCBsYWJlbCA9IHAxLmxhYmVsICsgJyBvckVsc2UgJyArIHAyLmxhYmVsO1xuICByZXR1cm4gcGFyc2VyKHBvcyA9PiB7XG4gICAgY29uc3QgcmVzMSA9IHAxLnJ1bihwb3MpO1xuICAgIGlmIChyZXMxLmlzU3VjY2VzcykgcmV0dXJuIHJlczE7XG4gICAgY29uc3QgcmVzMiA9IHAyLnJ1bihwb3MpO1xuICAgIGlmIChyZXMyLmlzU3VjY2VzcykgcmV0dXJuIHJlczI7XG4gICAgcmV0dXJuIFZhbGlkYXRpb24uRmFpbHVyZShUdXBsZS5UcmlwbGUobGFiZWwsIHJlczIudmFsdWVbMV0sIHJlczIudmFsdWVbMl0pKTtcbiAgfSwgbGFiZWwpLnNldExhYmVsKGxhYmVsKTtcbn1cblxuZXhwb3J0IGNvbnN0IGZhaWxQID0gcGFyc2VyKHBvcyA9PiBWYWxpZGF0aW9uLkZhaWx1cmUoVHVwbGUuVHJpcGxlKCcnLCAnZmFpbCcsIHBvcykpKTtcblxuZXhwb3J0IGNvbnN0IHN1Y2NlZWRQID0gcGFyc2VyKHBvcyA9PiBWYWxpZGF0aW9uLlN1Y2Nlc3MoVHVwbGUuUGFpcignJywgcG9zKSwgJ3N1Y2NlZWQnKSk7XG5cbmV4cG9ydCBmdW5jdGlvbiBjaG9pY2UocGFyc2Vycykge1xuICByZXR1cm4gcGFyc2Vycy5yZWR1Y2VSaWdodCgocmVzdCwgY3VycikgPT4gb3JFbHNlKGN1cnIsIHJlc3QpLCBmYWlsUClcbiAgICAuc2V0TGFiZWwoJ2Nob2ljZSAnICsgcGFyc2Vycy5yZWR1Y2UoKGFjYywgY3VycikgPT4gYWNjICsgJy8nICsgY3Vyci5sYWJlbCwgJycpKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGFueU9mKGNoYXJzQXJyYXkpIHtcbiAgcmV0dXJuIGNob2ljZShjaGFyc0FycmF5Lm1hcChwY2hhcikpXG4gICAgLnNldExhYmVsKCdhbnlPZiAnICsgY2hhcnNBcnJheS5yZWR1Y2UoKGFjYywgY3VycikgPT4gYWNjICsgY3VyciwgJycpKTtcbn1cblxuZXhwb3J0IGNvbnN0IGxvd2VyY2FzZVAgPSBhbnlPZihbJ2EnLCAnYicsICdjJywgJ2QnLCAnZScsICdmJywgJ2cnLCAnaCcsICdpJywgJ2onLCAnaycsICdsJywgJ20nLCAnbicsICdvJywgJ3AnLCAncScsICdyJywgJ3MnLCAndCcsICd1JywgJ3YnLCAndycsICd4JywgJ3knLCAneiddKS5zZXRMYWJlbCgnbG93ZXJjYXNlUCcpO1xuZXhwb3J0IGNvbnN0IHVwcGVyY2FzZVAgPSBhbnlPZihbJ0EnLCAnQicsICdDJywgJ0QnLCAnRScsICdGJywgJ0cnLCAnSCcsICdJJywgJ0onLCAnSycsICdMJywgJ00nLCAnTicsICdPJywgJ1AnLCAnUScsICdSJywgJ1MnLCAnVCcsICdVJywgJ1YnLCAnVycsICdYJywgJ1knLCAnWiddKS5zZXRMYWJlbCgndXBwZXJjYXNlUCcpO1xuZXhwb3J0IGNvbnN0IGxldHRlclAgPSBsb3dlcmNhc2VQLm9yRWxzZSh1cHBlcmNhc2VQKS5zZXRMYWJlbCgnbGV0dGVyUCcpO1xuZXhwb3J0IGNvbnN0IGRpZ2l0UCA9IGFueU9mKFsnMCcsICcxJywgJzInLCAnMycsICc0JywgJzUnLCAnNicsICc3JywgJzgnLCAnOSddKS5zZXRMYWJlbCgnZGlnaXRQJyk7XG5leHBvcnQgY29uc3Qgd2hpdGVQID0gYW55T2YoWycgJywgJ1xcdCcsICdcXG4nLCAnXFxyJ10pLnNldExhYmVsKCd3aGl0ZVAnKTtcblxuZXhwb3J0IGZ1bmN0aW9uIGZtYXAoZmFiLCBwYXJzZXIxKSB7XG4gIGNvbnN0IGxhYmVsID0gcGFyc2VyMS5sYWJlbCArICcgZm1hcCAnICsgZmFiLnRvU3RyaW5nKCk7XG4gIHJldHVybiBwYXJzZXIocG9zID0+IHtcbiAgICBjb25zdCByZXMgPSBwYXJzZXIxLnJ1bihwb3MpO1xuICAgIGlmIChyZXMuaXNTdWNjZXNzKSByZXR1cm4gVmFsaWRhdGlvbi5TdWNjZXNzKFR1cGxlLlBhaXIoZmFiKHJlcy52YWx1ZVswXSksIHJlcy52YWx1ZVsxXSkpO1xuICAgIHJldHVybiBWYWxpZGF0aW9uLkZhaWx1cmUoVHVwbGUuVHJpcGxlKGxhYmVsLCByZXMudmFsdWVbMV0sIHJlcy52YWx1ZVsyXSkpO1xuICB9LCBsYWJlbCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZXR1cm5QKHZhbHVlKSB7XG4gIHJldHVybiBwYXJzZXIocG9zID0+IFZhbGlkYXRpb24uU3VjY2VzcyhUdXBsZS5QYWlyKHZhbHVlLCBwb3MpKSwgdmFsdWUpO1xufVxuXG4vLyBwYXJzZXIoYSAtPiBiKSAtPiBwYXJzZXIoYSkgLT4gcGFyc2VyKGIpXG5leHBvcnQgZnVuY3Rpb24gYXBwbHlQeChmUCkge1xuICByZXR1cm4gZnVuY3Rpb24oeFApIHtcbiAgICByZXR1cm4gYW5kVGhlbihmUCwgeFApLmZtYXAoKFtmLCB4XSkgPT4gZih4KSk7XG4gIH07XG59XG5cbi8vIHVzaW5nIGJpbmRcbmV4cG9ydCBmdW5jdGlvbiBhcHBseVAoZlApIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKHhQKSB7XG4gICAgcmV0dXJuIGZQLmJpbmQocGFyc2VkVmFsdWVmID0+IHtcbiAgICAgIHJldHVybiB4UC5iaW5kKHBhcnNlZFZhbHVleCA9PiB7XG4gICAgICAgIHJldHVybiByZXR1cm5QKHBhcnNlZFZhbHVlZihwYXJzZWRWYWx1ZXgpKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbGlmdDIoZmFhYikge1xuICByZXR1cm4gZnVuY3Rpb24ocGFyc2VyMSkge1xuICAgIHJldHVybiBmdW5jdGlvbihwYXJzZXIyKSB7XG4gICAgICAvLyByZXR1cm4gYXBwbHlQKGFwcGx5UChyZXR1cm5QKGZhYWIpKShwYXJzZXIxKSkocGFyc2VyMik7XG4gICAgICByZXR1cm4gcmV0dXJuUChmYWFiKS5hcHBseShwYXJzZXIxKS5hcHBseShwYXJzZXIyKTsgLy8gdXNpbmcgaW5zdGFuY2UgbWV0aG9kc1xuICAgIH07XG4gIH07XG59XG5cbi8vIHVzaW5nIGxpZnQyKGNvbnMpXG5leHBvcnQgZnVuY3Rpb24gc2VxdWVuY2VQKHBhcnNlcnMpIHtcbiAgcmV0dXJuIHBhcnNlcnNcbiAgICAucmVkdWNlUmlnaHQoKHJlc3QsIGN1cnIpID0+IHtcbiAgICAgIHJldHVybiBsaWZ0MihfY29ucykoY3VycikocmVzdCk7XG4gICAgfSwgcmV0dXJuUChbXSkpO1xufVxuXG4vLyB1c2luZyBuYWl2ZSBhbmRUaGVuICYmIGZtYXAgLS0+IHJldHVybnMgc3RyaW5ncywgbm90IGFycmF5cyFcbmV4cG9ydCBmdW5jdGlvbiBzZXF1ZW5jZVAyKHBhcnNlcnMpIHtcbiAgcmV0dXJuIHBhcnNlcnNcbiAgICAucmVkdWNlUmlnaHQoKHJlc3QsIGN1cnIpID0+IHtcbiAgICAgIHJldHVybiBmbWFwKChbeCwgeV0pID0+IHggKyB5LCBhbmRUaGVuKGN1cnIsIHJlc3QpKTtcbiAgICB9LCByZXR1cm5QKCcnKSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwc3RyaW5nKHN0cikge1xuICByZXR1cm4gc2VxdWVuY2VQKHN0ci5zcGxpdCgnJykubWFwKHBjaGFyKSlcbiAgICAuc2V0TGFiZWwoJ3BzdHJpbmcgJyArIHN0cik7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzdHJpbmdQKHN0cikge1xuICByZXR1cm4gcHN0cmluZyhzdHIpXG4gICAgLmZtYXAocmVzID0+IHJlcy5qb2luKCcnKSlcbiAgICAuc2V0TGFiZWwoJ3N0cmluZ1AgJyArIHN0cik7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB6ZXJvT3JNb3JlKHhQKSB7IC8vIHplcm9Pck1vcmUgOjogcCBhIC0+IFthXSAtPiB0cnkgW2FdID0gcCBhIC0+IHAgW2FdXG4gIHJldHVybiBwb3MgPT4ge1xuICAgIGNvbnN0IHJlczEgPSB4UC5ydW4ocG9zKTtcbiAgICBpZiAocmVzMS5pc0ZhaWx1cmUpIHJldHVybiBWYWxpZGF0aW9uLlN1Y2Nlc3MoVHVwbGUuUGFpcihbXSwgcG9zKSk7XG4gICAgY29uc3QgcmVzTiA9IHplcm9Pck1vcmUoeFApKHJlczEudmFsdWVbMV0pO1xuICAgIHJldHVybiBWYWxpZGF0aW9uLlN1Y2Nlc3MoVHVwbGUuUGFpcihbcmVzMS52YWx1ZVswXV0uY29uY2F0KHJlc04udmFsdWVbMF0pLCByZXNOLnZhbHVlWzFdKSk7XG4gIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtYW55KHhQLCB0aW1lcykge1xuICBjb25zdCB0aW1lc19kZWZpbmVkID0gKHR5cGVvZiB0aW1lcyAhPT0gJ3VuZGVmaW5lZCcpO1xuICBjb25zdCBsYWJlbCA9ICdtYW55ICcgKyB4UC5sYWJlbFxuICAgICAgICArICgodGltZXNfZGVmaW5lZCkgPyAnIHRpbWVzPScgKyB0aW1lcyA6ICcnKTtcbiAgcmV0dXJuIHBhcnNlcihwb3MgPT4ge1xuICAgIGNvbnN0IHJlcyA9IHplcm9Pck1vcmUoeFApKHBvcyk7XG4gICAgaWYgKHRpbWVzX2RlZmluZWQpIHsvLyBkZWJ1Z2dlcjtcbiAgICAgIGlmIChyZXMuaXNGYWlsdXJlKSByZXR1cm4gcmVzO1xuICAgICAgY29uc3QgcmVzdWx0TGVuZ3RoID0gcmVzLnZhbHVlWzBdLmxlbmd0aDtcbiAgICAgIHJldHVybiAocmVzdWx0TGVuZ3RoID09PSB0aW1lcylcbiAgICAgICAgPyByZXNcbiAgICAgICAgOiBWYWxpZGF0aW9uLkZhaWx1cmUoVHVwbGUuVHJpcGxlKGxhYmVsLCAndGltZXMgcGFyYW0gd2FudGVkICcgKyB0aW1lcyArICc7IGdvdCAnICsgcmVzdWx0TGVuZ3RoLCBwb3MpKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlcztcbiAgfSwgbGFiZWwpLnNldExhYmVsKGxhYmVsKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1hbnlDaGFycyh4UCwgdGltZXMpIHtcbiAgcmV0dXJuIG1hbnkoeFAsIHRpbWVzKVxuICAgIC5mbWFwKGFycmEgPT4gYXJyYS5qb2luKCcnKSlcbiAgICAuc2V0TGFiZWwoJ21hbnlDaGFycyAnICsgeFAubGFiZWxcbiAgICAgICAgICAgICsgKCh0eXBlb2YgdGltZXMgIT09ICd1bmRlZmluZWQnKSA/ICcgdGltZXM9JyArIHRpbWVzIDogJycpKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1hbnkxKHhQKSB7XG4gIGNvbnN0IGxhYmVsID0gJ21hbnkxICcgKyB4UC5sYWJlbDtcbiAgcmV0dXJuIHBhcnNlcihwb3MgPT4ge1xuICAgIGNvbnN0IHJlczEgPSB4UC5ydW4ocG9zKTtcbiAgICBpZiAocmVzMS5pc0ZhaWx1cmUpIHJldHVybiByZXMxO1xuICAgIGNvbnN0IHJlc04gPSB6ZXJvT3JNb3JlKHhQKShyZXMxLnZhbHVlWzFdKTtcbiAgICByZXR1cm4gVmFsaWRhdGlvbi5TdWNjZXNzKFR1cGxlLlBhaXIoW3JlczEudmFsdWVbMF1dLmNvbmNhdChyZXNOLnZhbHVlWzBdKSwgcmVzTi52YWx1ZVsxXSkpO1xuICB9LCBsYWJlbCkuc2V0TGFiZWwobGFiZWwpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbWFueUNoYXJzMSh4UCkge1xuICByZXR1cm4gbWFueTEoeFApXG4gICAgLmZtYXAoYXJyYSA9PiBhcnJhLmpvaW4oJycpKVxuICAgIC5zZXRMYWJlbCgnbWFueUNoYXJzMSAnICsgeFAubGFiZWwpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gb3B0KHhQLCBkZWZhdWx0VmFsdWUpIHtcbiAgY29uc3QgaXNEZWZhdWx0ID0gKHR5cGVvZiBkZWZhdWx0VmFsdWUgIT09ICd1bmRlZmluZWQnKTtcbiAgY29uc3QgbGFiZWwgPSAnb3B0ICcgKyB4UC5sYWJlbFxuICAgICAgICArIChpc0RlZmF1bHQgPyAnKGRlZmF1bHQ9JyArIGRlZmF1bHRWYWx1ZSArICcpJyA6ICcnKTtcbiAgcmV0dXJuIHBhcnNlcihwb3MgPT4ge1xuICAgIGNvbnN0IHJlcyA9IHhQLmZtYXAoTWF5YmUuSnVzdCkucnVuKHBvcyk7XG4gICAgaWYgKHJlcy5pc1N1Y2Nlc3MpIHJldHVybiByZXM7XG4gICAgY29uc3Qgb3V0Y29tZSA9IChpc0RlZmF1bHQpID8gTWF5YmUuSnVzdChkZWZhdWx0VmFsdWUpIDogTWF5YmUuTm90aGluZygpO1xuICAgIHJldHVybiBWYWxpZGF0aW9uLlN1Y2Nlc3MoVHVwbGUuUGFpcihvdXRjb21lLCBwb3MpKTtcbiAgfSwgbGFiZWwpLnNldExhYmVsKGxhYmVsKTtcbn1cblxuLy8gb3B0IGZyb20gdGhlIGJvb2sgLSB3b3JrcyBvaywgYnV0IHRvU3RyaW5nKCkgZ2l2ZXMgc3RyYW5nZSByZXN1bHRzXG5leHBvcnQgZnVuY3Rpb24gb3B0Qm9vayhwWCkge1xuICBjb25zdCBzb21lUCA9IHBYLmZtYXAoTWF5YmUuSnVzdCk7XG4gIGNvbnN0IG5vbmVQID0gcmV0dXJuUChNYXliZS5Ob3RoaW5nKTtcbiAgcmV0dXJuIHNvbWVQLm9yRWxzZShub25lUCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBkaXNjYXJkU2Vjb25kKHAxLCBwMikge1xuICBjb25zdCBsYWJlbCA9IHAxLmxhYmVsICsgJyBkaXNjYXJkU2Vjb25kICcgKyBwMi5sYWJlbDtcbiAgcmV0dXJuIHBhcnNlcihwb3MgPT4ge1xuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby11bnVzZWQtdmFyc1xuICAgIHJldHVybiBhbmRUaGVuKHAxLCBwMikuZm1hcCgoW3gsIHldKSA9PiB4KS5ydW4ocG9zKTtcbiAgfSwgbGFiZWwpLnNldExhYmVsKGxhYmVsKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRpc2NhcmRGaXJzdChwMSwgcDIpIHtcbiAgY29uc3QgbGFiZWwgPSBwMS5sYWJlbCArICcgZGlzY2FyZEZpcnN0ICcgKyBwMi5sYWJlbDtcbiAgcmV0dXJuIHBhcnNlcihwb3MgPT4ge1xuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby11bnVzZWQtdmFyc1xuICAgIHJldHVybiBhbmRUaGVuKHAxLCBwMikuZm1hcCgoW3gsIHldKSA9PiB5KS5ydW4ocG9zKTtcbiAgfSwgbGFiZWwpLnNldExhYmVsKGxhYmVsKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNlcEJ5MUJvb2socHgsIHNlcCkge1xuICByZXR1cm4gcHguYW5kVGhlbihtYW55KHNlcC5kaXNjYXJkRmlyc3QocHgpKSkuZm1hcCgoW3IsIHJsaXN0XSkgPT4gW3JdLmNvbmNhdChybGlzdCkpO1xufVxuXG4vLyBteSB2ZXJzaW9uIHdvcmtzIGp1c3QgZmluZS4uLlxuZXhwb3J0IGZ1bmN0aW9uIHNlcEJ5MSh2YWx1ZVAsIHNlcGFyYXRvclApIHtcbiAgcmV0dXJuIG1hbnkobWFueTEodmFsdWVQKS5kaXNjYXJkU2Vjb25kKG9wdChzZXBhcmF0b3JQKSkpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYmV0d2VlbihwMSwgcDIsIHAzKSB7XG4gIHJldHVybiBwMS5kaXNjYXJkRmlyc3QocDIpLmRpc2NhcmRTZWNvbmQocDMpXG4gICAgLnNldExhYmVsKCdiZXR3ZWVuICcgKyBwMS5sYWJlbCArICcvJyArIHAyLmxhYmVsICsgJy8nICsgcDMubGFiZWwpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYmV0d2VlblBhcmVucyhweCkge1xuICByZXR1cm4gYmV0d2VlbihwY2hhcignKCcpLCBweCwgcGNoYXIoJyknKSlcbiAgICAuc2V0TGFiZWwoJ2JldHdlZW5QYXJlbnMgJyArIHB4LmxhYmVsKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGJpbmRQKGZhbWIsIHB4KSB7XG4gIGNvbnN0IGxhYmVsID0gJ3Vua25vd24nO1xuICByZXR1cm4gcGFyc2VyKHBvcyA9PiB7XG4gICAgY29uc3QgcmVzID0gcHgucnVuKHBvcyk7XG4gICAgaWYgKHJlcy5pc0ZhaWx1cmUpIHJldHVybiByZXM7XG4gICAgcmV0dXJuIGZhbWIocmVzLnZhbHVlWzBdKS5ydW4ocmVzLnZhbHVlWzFdKTtcbiAgfSwgbGFiZWwpLnNldExhYmVsKGxhYmVsKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHRhcFAocHgsIGZuKSB7XG4gIHJldHVybiBweC5iaW5kKHJlcyA9PiB7XG4gICAgZm4ocmVzKTtcbiAgICByZXR1cm4gcmV0dXJuUChyZXMpO1xuICB9KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGxvZ1AocHgpIHtcbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWNvbnNvbGVcbiAgcmV0dXJuIHRhcFAocHgsIHJlcyA9PiBjb25zb2xlLmxvZyhweC5sYWJlbCArICc6JyArIHJlcykpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcHdvcmQod29yZCkge1xuICByZXR1cm4gdHJpbVAocHN0cmluZyh3b3JkKSlcbiAgICAuc2V0TGFiZWwoJ3B3b3JkICcgKyB3b3JkKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHRyaW1QKHBYKSB7XG4gIHJldHVybiBvcHQobWFueSh3aGl0ZVApKVxuICAgIC5kaXNjYXJkRmlyc3QocFgpXG4gICAgLmRpc2NhcmRTZWNvbmQob3B0KG1hbnkod2hpdGVQKSkpXG4gICAgLnNldExhYmVsKCd0cmltICcgKyBwWC5sYWJlbCk7XG59XG5cbmZ1bmN0aW9uIF9jb25zKHgpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKHhzKSB7XG4gICAgcmV0dXJuIFt4XS5jb25jYXQoeHMpO1xuICB9O1xufVxuXG5mdW5jdGlvbiBfc2V0TGFiZWwocHgsIG5ld0xhYmVsKSB7XG4gIHJldHVybiBwYXJzZXIocG9zID0+IHtcbiAgICBjb25zdCByZXN1bHQgPSBweC5ydW4ocG9zKTtcbiAgICBpZiAocmVzdWx0LmlzRmFpbHVyZSkgcmV0dXJuIFZhbGlkYXRpb24uRmFpbHVyZShUdXBsZS5UcmlwbGUobmV3TGFiZWwsIHJlc3VsdC52YWx1ZVsxXSwgcmVzdWx0LnZhbHVlWzJdKSk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfSwgbmV3TGFiZWwpO1xufVxuXG4vLyB0aGUgcmVhbCB0aGluZy4uLlxuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlcihmbiwgbGFiZWwpIHtcbiAgcmV0dXJuIHtcbiAgICB0eXBlOiAncGFyc2VyJyxcbiAgICBsYWJlbCxcbiAgICBydW4ocG9zKSB7XG4gICAgICByZXR1cm4gZm4ocG9zKTtcbiAgICB9LFxuICAgIGFwcGx5KHB4KSB7XG4gICAgICByZXR1cm4gYXBwbHlQKHRoaXMpKHB4KTtcbiAgICAgIC8vIHJldHVybiB0aGlzLmJpbmQoYW5kVGhlbih0aGlzLCBweCkuZm1hcCgoW2YsIHhdKSA9PiBmKHgpKSkucnVuOyAvLyB3ZSBhcmUgdGhlIGZQXG4gICAgfSxcbiAgICBmbWFwKGZhYikge1xuICAgICAgLy8gcmV0dXJuIGZtYXAoZmFiLCB0aGlzKTtcbiAgICAgIC8vIHJldHVybiBiaW5kUChwb3MgPT4gcmV0dXJuUChmYWIocG9zKSksIHRoaXMpO1xuICAgICAgcmV0dXJuIHRoaXMuYmluZChwYXJzZWRWYWx1ZSA9PiByZXR1cm5QKGZhYihwYXJzZWRWYWx1ZSkpKTtcbiAgICB9LFxuICAgIGFuZFRoZW4ocHgpIHtcbiAgICAgIHJldHVybiBhbmRUaGVuKHRoaXMsIHB4KTtcbiAgICB9LFxuICAgIG9yRWxzZShweCkge1xuICAgICAgcmV0dXJuIG9yRWxzZSh0aGlzLCBweCk7XG4gICAgfSxcbiAgICBkaXNjYXJkRmlyc3QocHgpIHtcbiAgICAgIHJldHVybiBkaXNjYXJkRmlyc3QodGhpcywgcHgpO1xuICAgIH0sXG4gICAgZGlzY2FyZFNlY29uZChweCkge1xuICAgICAgcmV0dXJuIGRpc2NhcmRTZWNvbmQodGhpcywgcHgpO1xuICAgIH0sXG4gICAgYmluZChmYW1iKSB7XG4gICAgICByZXR1cm4gYmluZFAoZmFtYiwgdGhpcyk7XG4gICAgfSxcbiAgICBzZXRMYWJlbChuZXdMYWJlbCkge1xuICAgICAgcmV0dXJuIF9zZXRMYWJlbCh0aGlzLCBuZXdMYWJlbCk7XG4gICAgfSxcbiAgfTtcbn1cbiJdfQ==