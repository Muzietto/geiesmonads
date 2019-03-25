define(['exports', './tuples', './maybe', './validation'], function (exports, _tuples, _maybe, _validation) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.discardFirst = exports.discardSecond = exports.whiteP = exports.digitP = exports.letterP = exports.uppercaseP = exports.lowercaseP = exports.succeedP = exports.failP = exports.orElse = exports.andThen = exports.notEndOfInputP = exports.endOfInputP = exports.notStartOfInputP = exports.startOfInputP = exports.predicateBasedParser = exports.digitParser = exports.charParser = undefined;
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

  var notStartOfInputP = exports.notStartOfInputP = parser(function (pos) {
    return pos.decrPos().char().isJust ? succeedP.run(pos) : failP.run(pos);
  }).setLabel('not^');

  var endOfInputP = exports.endOfInputP = parser(function (pos) {
    return pos.rest() === '' ? succeedP.run(pos) : failP.run(pos);
  }).setLabel('$');

  var notEndOfInputP = exports.notEndOfInputP = parser(function (pos) {
    return pos.rest() !== '' ? succeedP.run(pos) : failP.run(pos);
  }).setLabel('not$');

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2pzL3BhcnNlcnMuanMiXSwibmFtZXMiOlsicGNoYXIiLCJwZGlnaXQiLCJwcmVjZWRlZEJ5UCIsIm5vdFByZWNlZGVkQnlQIiwiYW5kVGhlbkJpbmQiLCJjaG9pY2UiLCJhbnlPZiIsImZtYXAiLCJyZXR1cm5QIiwiYXBwbHlQeCIsImFwcGx5UCIsImxpZnQyIiwic2VxdWVuY2VQIiwic2VxdWVuY2VQMiIsInBzdHJpbmciLCJzdHJpbmdQIiwiemVyb09yTW9yZSIsIm1hbnkiLCJtYW55Q2hhcnMiLCJtYW55MSIsIm1hbnlDaGFyczEiLCJvcHQiLCJvcHRCb29rIiwic2VwQnkxQm9vayIsInNlcEJ5MSIsImJldHdlZW4iLCJiZXR3ZWVuUGFyZW5zIiwiYmluZFAiLCJ0YXBQIiwibG9nUCIsInB3b3JkIiwidHJpbVAiLCJwYXJzZXIiLCJjaGFyUGFyc2VyIiwicG9zIiwiUG9zaXRpb24iLCJmcm9tVGV4dCIsIm9wdENoYXIiLCJjaGFyIiwiaXNOb3RoaW5nIiwiVmFsaWRhdGlvbiIsIkZhaWx1cmUiLCJUdXBsZSIsIlRyaXBsZSIsInZhbHVlIiwiU3VjY2VzcyIsIlBhaXIiLCJpbmNyUG9zIiwiZGlnaXRQYXJzZXIiLCJwYXJzZUludCIsImRpZ2l0IiwicHJlZGljYXRlQmFzZWRQYXJzZXIiLCJwcmVkIiwibGFiZWwiLCJzdGFydE9mSW5wdXRQIiwiZGVjclBvcyIsInN1Y2NlZWRQIiwicnVuIiwiZmFpbFAiLCJzZXRMYWJlbCIsIm5vdFN0YXJ0T2ZJbnB1dFAiLCJpc0p1c3QiLCJlbmRPZklucHV0UCIsInJlc3QiLCJub3RFbmRPZklucHV0UCIsInJlc3VsdCIsImMxIiwiYzIiLCJyZXMyIiwiaXNTdWNjZXNzIiwicmVzMSIsImVyciIsImlzRmFpbHVyZSIsImFuZFRoZW4iLCJwMSIsInAyIiwiYmluZCIsInBhcnNlZFZhbHVlMSIsInBhcnNlZFZhbHVlMiIsIm9yRWxzZSIsInBhcnNlcnMiLCJyZWR1Y2VSaWdodCIsImN1cnIiLCJyZWR1Y2UiLCJhY2MiLCJjaGFyc0FycmF5IiwibWFwIiwibG93ZXJjYXNlUCIsInVwcGVyY2FzZVAiLCJsZXR0ZXJQIiwiZGlnaXRQIiwid2hpdGVQIiwiZmFiIiwicGFyc2VyMSIsInRvU3RyaW5nIiwicmVzIiwiZlAiLCJ4UCIsImYiLCJ4IiwicGFyc2VkVmFsdWVmIiwicGFyc2VkVmFsdWV4IiwiZmFhYiIsInBhcnNlcjIiLCJhcHBseSIsIl9jb25zIiwieSIsInN0ciIsInNwbGl0Iiwiam9pbiIsInJlc04iLCJjb25jYXQiLCJ0aW1lcyIsInRpbWVzX2RlZmluZWQiLCJyZXN1bHRMZW5ndGgiLCJsZW5ndGgiLCJhcnJhIiwiZGVmYXVsdFZhbHVlIiwiaXNEZWZhdWx0IiwiTWF5YmUiLCJKdXN0Iiwib3V0Y29tZSIsIk5vdGhpbmciLCJwWCIsInNvbWVQIiwibm9uZVAiLCJkaXNjYXJkU2Vjb25kIiwiZGlzY2FyZEZpcnN0IiwicHgiLCJzZXAiLCJyIiwicmxpc3QiLCJ2YWx1ZVAiLCJzZXBhcmF0b3JQIiwicDMiLCJmYW1iIiwiZm4iLCJjb25zb2xlIiwibG9nIiwid29yZCIsInhzIiwiX3NldExhYmVsIiwibmV3TGFiZWwiLCJ0eXBlIiwicGFyc2VkVmFsdWUiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7VUErRWdCQSxLLEdBQUFBLEs7VUFNQUMsTSxHQUFBQSxNO1VBSUFDLFcsR0FBQUEsVztVQWVBQyxjLEdBQUFBLGM7VUFrQ0FDLFcsR0FBQUEsVztVQXVCQUMsTSxHQUFBQSxNO1VBS0FDLEssR0FBQUEsSztVQVdBQyxJLEdBQUFBLEk7VUFTQUMsTyxHQUFBQSxPO1VBS0FDLE8sR0FBQUEsTztVQU9BQyxNLEdBQUFBLE07VUFVQUMsSyxHQUFBQSxLO1VBVUFDLFMsR0FBQUEsUztVQVFBQyxVLEdBQUFBLFU7VUFPQUMsTyxHQUFBQSxPO1VBS0FDLE8sR0FBQUEsTztVQU1BQyxVLEdBQUFBLFU7VUFTQUMsSSxHQUFBQSxJO1VBaUJBQyxTLEdBQUFBLFM7VUFPQUMsSyxHQUFBQSxLO1VBVUFDLFUsR0FBQUEsVTtVQU1B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QUFSLEVBQWN1RCxFQUFkLENBQVA7QUFDRCxPQWpCSTtBQWtCTGpELFlBbEJLLGtCQWtCRWlELEVBbEJGLEVBa0JNO0FBQ1QsZUFBT2pELFFBQU8sSUFBUCxFQUFhaUQsRUFBYixDQUFQO0FBQ0QsT0FwQkk7QUFxQkxELGtCQXJCSyx3QkFxQlFDLEVBckJSLEVBcUJZO0FBQ2YsZUFBT0QsY0FBYSxJQUFiLEVBQW1CQyxFQUFuQixDQUFQO0FBQ0QsT0F2Qkk7QUF3QkxGLG1CQXhCSyx5QkF3QlNFLEVBeEJULEVBd0JhO0FBQ2hCLGVBQU9GLGVBQWMsSUFBZCxFQUFvQkUsRUFBcEIsQ0FBUDtBQUNELE9BMUJJO0FBMkJMcEQsVUEzQkssZ0JBMkJBMkQsSUEzQkEsRUEyQk07QUFDVCxlQUFPNUcsTUFBTTRHLElBQU4sRUFBWSxJQUFaLENBQVA7QUFDRCxPQTdCSTtBQThCTDVFLGNBOUJLLG9CQThCSW1GLFFBOUJKLEVBOEJjO0FBQ2pCLGVBQU9ELFVBQVUsSUFBVixFQUFnQkMsUUFBaEIsQ0FBUDtBQUNEO0FBaENJLEtBQVA7QUFrQ0QiLCJmaWxlIjoicGFyc2Vycy5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qXG5UaGUgTUlUIExpY2Vuc2UgKE1JVClcblxuQ29weXJpZ2h0IChjKSAyMDE0IE1hcmNvIEZhdXN0aW5lbGxpXG5cblBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcbm9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWxcbmluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcbnRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcbmNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xuZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcblxuVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW4gYWxsXG5jb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuXG5USEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG5JTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbkZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcbk9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFXG5TT0ZUV0FSRS5cbiovXG5cbi8vIGNmci4gXCJVbmRlcnN0YW5kaW5nIFBhcnNlciBDb21iaW5hdG9yc1wiIChGIyBmb3IgRnVuIGFuZCBQcm9maXQpXG5cbmltcG9ydCB7XG4gIFR1cGxlLFxuICBQb3NpdGlvbixcbn0gZnJvbSAnLi90dXBsZXMnO1xuaW1wb3J0IHsgTWF5YmUgfSBmcm9tICcuL21heWJlJzsgLy8gSnVzdCBvciBOb3RoaW5nXG5pbXBvcnQgeyBWYWxpZGF0aW9uIH0gZnJvbSAnLi92YWxpZGF0aW9uJzsgLy8gU3VjY2VzcyBvciBGYWlsdXJlXG5cbmNvbnN0IGNoYXJQYXJzZXIgPSBjaGFyID0+IHBvcyA9PiB7XG4gIGlmICh0eXBlb2YgcG9zID09PSAnc3RyaW5nJykgcG9zID0gUG9zaXRpb24uZnJvbVRleHQocG9zKTtcbiAgY29uc3Qgb3B0Q2hhciA9IHBvcy5jaGFyKCk7XG4gIGlmIChvcHRDaGFyLmlzTm90aGluZykgcmV0dXJuIFZhbGlkYXRpb24uRmFpbHVyZShUdXBsZS5UcmlwbGUoJ2NoYXJQYXJzZXInLCAnbm8gbW9yZSBpbnB1dCcsIHBvcykpO1xuICBpZiAob3B0Q2hhci52YWx1ZSA9PT0gY2hhcikgcmV0dXJuIFZhbGlkYXRpb24uU3VjY2VzcyhUdXBsZS5QYWlyKGNoYXIsIHBvcy5pbmNyUG9zKCkpKTtcbiAgcmV0dXJuIFZhbGlkYXRpb24uRmFpbHVyZShUdXBsZS5UcmlwbGUoJ2NoYXJQYXJzZXInLCAnd2FudGVkICcgKyBjaGFyICsgJzsgZ290ICcgKyBvcHRDaGFyLnZhbHVlLCBwb3MpKTtcbn07XG5cbmNvbnN0IGRpZ2l0UGFyc2VyID0gZGlnaXQgPT4gcG9zID0+IHtcbiAgaWYgKHR5cGVvZiBwb3MgPT09ICdzdHJpbmcnKSBwb3MgPSBQb3NpdGlvbi5mcm9tVGV4dChwb3MpO1xuICBjb25zdCBvcHRDaGFyID0gcG9zLmNoYXIoKTtcbiAgaWYgKG9wdENoYXIuaXNOb3RoaW5nKSByZXR1cm4gVmFsaWRhdGlvbi5GYWlsdXJlKFR1cGxlLlRyaXBsZSgnZGlnaXRQYXJzZXInLCAnbm8gbW9yZSBpbnB1dCcsIHBvcykpO1xuICBpZiAocGFyc2VJbnQob3B0Q2hhci52YWx1ZSwgMTApID09PSBkaWdpdCkgcmV0dXJuIFZhbGlkYXRpb24uU3VjY2VzcyhUdXBsZS5QYWlyKGRpZ2l0LCBwb3MuaW5jclBvcygpKSk7XG4gIHJldHVybiBWYWxpZGF0aW9uLkZhaWx1cmUoVHVwbGUuVHJpcGxlKCdkaWdpdFBhcnNlcicsICd3YW50ZWQgJyArIGRpZ2l0ICsgJzsgZ290ICcgKyBvcHRDaGFyLnZhbHVlLCBwb3MpKTtcbn07XG5cbmNvbnN0IHByZWRpY2F0ZUJhc2VkUGFyc2VyID0gKHByZWQsIGxhYmVsKSA9PiBwb3MgPT4ge1xuICBpZiAodHlwZW9mIHBvcyA9PT0gJ3N0cmluZycpIHBvcyA9IFBvc2l0aW9uLmZyb21UZXh0KHBvcyk7XG4gIGNvbnN0IG9wdENoYXIgPSBwb3MuY2hhcigpO1xuICBpZiAob3B0Q2hhci5pc05vdGhpbmcpIHJldHVybiBWYWxpZGF0aW9uLkZhaWx1cmUoVHVwbGUuVHJpcGxlKGxhYmVsLCAnbm8gbW9yZSBpbnB1dCcsIHBvcykpO1xuICBpZiAocHJlZChvcHRDaGFyLnZhbHVlKSkgcmV0dXJuIFZhbGlkYXRpb24uU3VjY2VzcyhUdXBsZS5QYWlyKG9wdENoYXIudmFsdWUsIHBvcy5pbmNyUG9zKCkpKTtcbiAgcmV0dXJuIFZhbGlkYXRpb24uRmFpbHVyZShUdXBsZS5UcmlwbGUobGFiZWwsICd1bmV4cGVjdGVkIGNoYXI6ICcgKyBvcHRDaGFyLnZhbHVlLCBwb3MpKTtcbn07XG5cbmV4cG9ydCB7IGNoYXJQYXJzZXIsIGRpZ2l0UGFyc2VyLCBwcmVkaWNhdGVCYXNlZFBhcnNlciB9O1xuXG5leHBvcnQgY29uc3Qgc3RhcnRPZklucHV0UCA9XG4gIHBhcnNlcihwb3MgPT4gKHBvcy5kZWNyUG9zKCkuY2hhcigpLmlzTm90aGluZylcbiAgICA/IHN1Y2NlZWRQLnJ1bihwb3MpXG4gICAgOiBmYWlsUC5ydW4ocG9zKSkuc2V0TGFiZWwoJ14nKTtcblxuZXhwb3J0IGNvbnN0IG5vdFN0YXJ0T2ZJbnB1dFAgPVxuICBwYXJzZXIocG9zID0+IChwb3MuZGVjclBvcygpLmNoYXIoKS5pc0p1c3QpXG4gICAgPyBzdWNjZWVkUC5ydW4ocG9zKVxuICAgIDogZmFpbFAucnVuKHBvcykpLnNldExhYmVsKCdub3ReJyk7XG5cbmV4cG9ydCBjb25zdCBlbmRPZklucHV0UCA9XG4gIHBhcnNlcihwb3MgPT4gKHBvcy5yZXN0KCkgPT09ICcnKVxuICAgID8gc3VjY2VlZFAucnVuKHBvcylcbiAgICA6IGZhaWxQLnJ1bihwb3MpKS5zZXRMYWJlbCgnJCcpO1xuXG5leHBvcnQgY29uc3Qgbm90RW5kT2ZJbnB1dFAgPVxuICBwYXJzZXIocG9zID0+IChwb3MucmVzdCgpICE9PSAnJylcbiAgICA/IHN1Y2NlZWRQLnJ1bihwb3MpXG4gICAgOiBmYWlsUC5ydW4ocG9zKSkuc2V0TGFiZWwoJ25vdCQnKTtcblxuZXhwb3J0IGZ1bmN0aW9uIHBjaGFyKGNoYXIpIHtcbiAgY29uc3QgbGFiZWwgPSAncGNoYXJfJyArIGNoYXI7XG4gIGNvbnN0IHJlc3VsdCA9IHBvcyA9PiBjaGFyUGFyc2VyKGNoYXIpKHBvcyk7XG4gIHJldHVybiBwYXJzZXIocmVzdWx0LCBsYWJlbCkuc2V0TGFiZWwobGFiZWwpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcGRpZ2l0KGRpZ2l0KSB7XG4gIHJldHVybiBwYXJzZXIocG9zID0+IGRpZ2l0UGFyc2VyKGRpZ2l0KShwb3MpLCAncGRpZ2l0XycgKyBkaWdpdCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwcmVjZWRlZEJ5UChjMSwgYzIpIHtcbiAgY29uc3QgbGFiZWwgPSBjMiArICcgcHJlY2VkZWQgYnkgJyArIGMxO1xuICByZXR1cm4gcGFyc2VyKHBvcyA9PiB7XG4gICAgY29uc3QgcmVzMiA9IHBjaGFyKGMyKS5ydW4ocG9zKTtcbiAgICBpZiAocmVzMi5pc1N1Y2Nlc3MpIHtcbiAgICAgIGNvbnN0IHJlczEgPSBwY2hhcihjMSkucnVuKHJlczIudmFsdWVbMV0uZGVjclBvcygyKSk7XG4gICAgICBpZiAocmVzMS5pc1N1Y2Nlc3MpIHtcbiAgICAgICAgcmV0dXJuIFZhbGlkYXRpb24uU3VjY2VzcyhUdXBsZS5QYWlyKGMyLCByZXMyLnZhbHVlWzFdKSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gVmFsaWRhdGlvbi5GYWlsdXJlKFR1cGxlLlRyaXBsZShsYWJlbCwgcmVzMS52YWx1ZVsxXSwgcmVzMS52YWx1ZVsyXSkpO1xuICAgIH1cbiAgICByZXR1cm4gVmFsaWRhdGlvbi5GYWlsdXJlKFR1cGxlLlRyaXBsZShsYWJlbCwgcmVzMi52YWx1ZVsxXSwgcmVzMi52YWx1ZVsyXSkpO1xuICB9LCBsYWJlbCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBub3RQcmVjZWRlZEJ5UChjMSwgYzIpIHtcbiAgY29uc3QgbGFiZWwgPSBjMiArICcgbm90IHByZWNlZGVkIGJ5ICcgKyBjMTtcbiAgcmV0dXJuIHBhcnNlcihwb3MgPT4ge1xuICAgIGNvbnN0IHJlczIgPSBwY2hhcihjMikucnVuKHBvcyk7XG4gICAgaWYgKHJlczIuaXNTdWNjZXNzKSB7XG4gICAgICBsZXQgcmVzMSA9IFZhbGlkYXRpb24uRmFpbHVyZSgpO1xuICAgICAgdHJ5IHsgLy8gY3Jhc2ggZ29pbmcgYmFjayBiZXlvbmQgc3RhcnQgb2YgaW5wdXQgPT4gb2tcbiAgICAgICAgcmVzMSA9IHBjaGFyKGMxKS5ydW4ocmVzMi52YWx1ZVsxXS5kZWNyUG9zKDIpKTtcbiAgICAgIH0gY2F0Y2ggKGVycikge31cbiAgICAgIGlmIChyZXMxLmlzRmFpbHVyZSkge1xuICAgICAgICByZXR1cm4gVmFsaWRhdGlvbi5TdWNjZXNzKFR1cGxlLlBhaXIoYzIsIHJlczIudmFsdWVbMV0pKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBWYWxpZGF0aW9uLkZhaWx1cmUoVHVwbGUuVHJpcGxlKGxhYmVsLCByZXMxLnZhbHVlWzFdLCByZXMxLnZhbHVlWzJdKSk7XG4gICAgfVxuICAgIHJldHVybiBWYWxpZGF0aW9uLkZhaWx1cmUoVHVwbGUuVHJpcGxlKGxhYmVsLCByZXMyLnZhbHVlWzFdLCByZXMyLnZhbHVlWzJdKSk7XG4gIH0sIGxhYmVsKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGFuZFRoZW4ocDEsIHAyKSB7XG4gIGNvbnN0IGxhYmVsID0gcDEubGFiZWwgKyAnIGFuZFRoZW4gJyArIHAyLmxhYmVsO1xuICByZXR1cm4gcGFyc2VyKHBvcyA9PiB7XG4gICAgY29uc3QgcmVzMSA9IHAxLnJ1bihwb3MpO1xuICAgIGlmIChyZXMxLmlzU3VjY2Vzcykge1xuICAgICAgY29uc3QgcmVzMiA9IHAyLnJ1bihyZXMxLnZhbHVlWzFdKTtcbiAgICAgIGlmIChyZXMyLmlzU3VjY2Vzcykge1xuICAgICAgICByZXR1cm4gVmFsaWRhdGlvbi5TdWNjZXNzKFR1cGxlLlBhaXIoVHVwbGUuUGFpcihyZXMxLnZhbHVlWzBdLCByZXMyLnZhbHVlWzBdKSwgcmVzMi52YWx1ZVsxXSkpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIFZhbGlkYXRpb24uRmFpbHVyZShUdXBsZS5UcmlwbGUobGFiZWwsIHJlczIudmFsdWVbMV0sIHJlczIudmFsdWVbMl0pKTtcbiAgICB9XG4gICAgcmV0dXJuIFZhbGlkYXRpb24uRmFpbHVyZShUdXBsZS5UcmlwbGUobGFiZWwsIHJlczEudmFsdWVbMV0sIHJlczEudmFsdWVbMl0pKTtcbiAgfSwgbGFiZWwpO1xufVxuXG4vLyB1c2luZyBiaW5kXG5leHBvcnQgZnVuY3Rpb24gYW5kVGhlbkJpbmQocDEsIHAyKSB7XG4gIHJldHVybiBwMS5iaW5kKHBhcnNlZFZhbHVlMSA9PiB7XG4gICAgcmV0dXJuIHAyLmJpbmQocGFyc2VkVmFsdWUyID0+IHtcbiAgICAgIHJldHVybiByZXR1cm5QKFR1cGxlLlBhaXIocGFyc2VkVmFsdWUxLCBwYXJzZWRWYWx1ZTIpKTtcbiAgICB9KTtcbiAgfSkuc2V0TGFiZWwocDEubGFiZWwgKyAnIGFuZFRoZW4gJyArIHAyLmxhYmVsKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG9yRWxzZShwMSwgcDIpIHtcbiAgY29uc3QgbGFiZWwgPSBwMS5sYWJlbCArICcgb3JFbHNlICcgKyBwMi5sYWJlbDtcbiAgcmV0dXJuIHBhcnNlcihwb3MgPT4ge1xuICAgIGNvbnN0IHJlczEgPSBwMS5ydW4ocG9zKTtcbiAgICBpZiAocmVzMS5pc1N1Y2Nlc3MpIHJldHVybiByZXMxO1xuICAgIGNvbnN0IHJlczIgPSBwMi5ydW4ocG9zKTtcbiAgICBpZiAocmVzMi5pc1N1Y2Nlc3MpIHJldHVybiByZXMyO1xuICAgIHJldHVybiBWYWxpZGF0aW9uLkZhaWx1cmUoVHVwbGUuVHJpcGxlKGxhYmVsLCByZXMyLnZhbHVlWzFdLCByZXMyLnZhbHVlWzJdKSk7XG4gIH0sIGxhYmVsKS5zZXRMYWJlbChsYWJlbCk7XG59XG5cbmV4cG9ydCBjb25zdCBmYWlsUCA9IHBhcnNlcihwb3MgPT4gVmFsaWRhdGlvbi5GYWlsdXJlKFR1cGxlLlRyaXBsZSgnJywgJ2ZhaWwnLCBwb3MpKSk7XG5cbmV4cG9ydCBjb25zdCBzdWNjZWVkUCA9IHBhcnNlcihwb3MgPT4gVmFsaWRhdGlvbi5TdWNjZXNzKFR1cGxlLlBhaXIoJycsIHBvcyksICdzdWNjZWVkJykpO1xuXG5leHBvcnQgZnVuY3Rpb24gY2hvaWNlKHBhcnNlcnMpIHtcbiAgcmV0dXJuIHBhcnNlcnMucmVkdWNlUmlnaHQoKHJlc3QsIGN1cnIpID0+IG9yRWxzZShjdXJyLCByZXN0KSwgZmFpbFApXG4gICAgLnNldExhYmVsKCdjaG9pY2UgJyArIHBhcnNlcnMucmVkdWNlKChhY2MsIGN1cnIpID0+IGFjYyArICcvJyArIGN1cnIubGFiZWwsICcnKSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhbnlPZihjaGFyc0FycmF5KSB7XG4gIHJldHVybiBjaG9pY2UoY2hhcnNBcnJheS5tYXAocGNoYXIpKVxuICAgIC5zZXRMYWJlbCgnYW55T2YgJyArIGNoYXJzQXJyYXkucmVkdWNlKChhY2MsIGN1cnIpID0+IGFjYyArIGN1cnIsICcnKSk7XG59XG5cbmV4cG9ydCBjb25zdCBsb3dlcmNhc2VQID0gYW55T2YoWydhJywgJ2InLCAnYycsICdkJywgJ2UnLCAnZicsICdnJywgJ2gnLCAnaScsICdqJywgJ2snLCAnbCcsICdtJywgJ24nLCAnbycsICdwJywgJ3EnLCAncicsICdzJywgJ3QnLCAndScsICd2JywgJ3cnLCAneCcsICd5JywgJ3onXSkuc2V0TGFiZWwoJ2xvd2VyY2FzZVAnKTtcbmV4cG9ydCBjb25zdCB1cHBlcmNhc2VQID0gYW55T2YoWydBJywgJ0InLCAnQycsICdEJywgJ0UnLCAnRicsICdHJywgJ0gnLCAnSScsICdKJywgJ0snLCAnTCcsICdNJywgJ04nLCAnTycsICdQJywgJ1EnLCAnUicsICdTJywgJ1QnLCAnVScsICdWJywgJ1cnLCAnWCcsICdZJywgJ1onXSkuc2V0TGFiZWwoJ3VwcGVyY2FzZVAnKTtcbmV4cG9ydCBjb25zdCBsZXR0ZXJQID0gbG93ZXJjYXNlUC5vckVsc2UodXBwZXJjYXNlUCkuc2V0TGFiZWwoJ2xldHRlclAnKTtcbmV4cG9ydCBjb25zdCBkaWdpdFAgPSBhbnlPZihbJzAnLCAnMScsICcyJywgJzMnLCAnNCcsICc1JywgJzYnLCAnNycsICc4JywgJzknXSkuc2V0TGFiZWwoJ2RpZ2l0UCcpO1xuZXhwb3J0IGNvbnN0IHdoaXRlUCA9IGFueU9mKFsnICcsICdcXHQnLCAnXFxuJywgJ1xcciddKS5zZXRMYWJlbCgnd2hpdGVQJyk7XG5cbmV4cG9ydCBmdW5jdGlvbiBmbWFwKGZhYiwgcGFyc2VyMSkge1xuICBjb25zdCBsYWJlbCA9IHBhcnNlcjEubGFiZWwgKyAnIGZtYXAgJyArIGZhYi50b1N0cmluZygpO1xuICByZXR1cm4gcGFyc2VyKHBvcyA9PiB7XG4gICAgY29uc3QgcmVzID0gcGFyc2VyMS5ydW4ocG9zKTtcbiAgICBpZiAocmVzLmlzU3VjY2VzcykgcmV0dXJuIFZhbGlkYXRpb24uU3VjY2VzcyhUdXBsZS5QYWlyKGZhYihyZXMudmFsdWVbMF0pLCByZXMudmFsdWVbMV0pKTtcbiAgICByZXR1cm4gVmFsaWRhdGlvbi5GYWlsdXJlKFR1cGxlLlRyaXBsZShsYWJlbCwgcmVzLnZhbHVlWzFdLCByZXMudmFsdWVbMl0pKTtcbiAgfSwgbGFiZWwpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcmV0dXJuUCh2YWx1ZSkge1xuICByZXR1cm4gcGFyc2VyKHBvcyA9PiBWYWxpZGF0aW9uLlN1Y2Nlc3MoVHVwbGUuUGFpcih2YWx1ZSwgcG9zKSksIHZhbHVlKTtcbn1cblxuLy8gcGFyc2VyKGEgLT4gYikgLT4gcGFyc2VyKGEpIC0+IHBhcnNlcihiKVxuZXhwb3J0IGZ1bmN0aW9uIGFwcGx5UHgoZlApIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKHhQKSB7XG4gICAgcmV0dXJuIGFuZFRoZW4oZlAsIHhQKS5mbWFwKChbZiwgeF0pID0+IGYoeCkpO1xuICB9O1xufVxuXG4vLyB1c2luZyBiaW5kXG5leHBvcnQgZnVuY3Rpb24gYXBwbHlQKGZQKSB7XG4gIHJldHVybiBmdW5jdGlvbih4UCkge1xuICAgIHJldHVybiBmUC5iaW5kKHBhcnNlZFZhbHVlZiA9PiB7XG4gICAgICByZXR1cm4geFAuYmluZChwYXJzZWRWYWx1ZXggPT4ge1xuICAgICAgICByZXR1cm4gcmV0dXJuUChwYXJzZWRWYWx1ZWYocGFyc2VkVmFsdWV4KSk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGxpZnQyKGZhYWIpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKHBhcnNlcjEpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24ocGFyc2VyMikge1xuICAgICAgLy8gcmV0dXJuIGFwcGx5UChhcHBseVAocmV0dXJuUChmYWFiKSkocGFyc2VyMSkpKHBhcnNlcjIpO1xuICAgICAgcmV0dXJuIHJldHVyblAoZmFhYikuYXBwbHkocGFyc2VyMSkuYXBwbHkocGFyc2VyMik7IC8vIHVzaW5nIGluc3RhbmNlIG1ldGhvZHNcbiAgICB9O1xuICB9O1xufVxuXG4vLyB1c2luZyBsaWZ0Mihjb25zKVxuZXhwb3J0IGZ1bmN0aW9uIHNlcXVlbmNlUChwYXJzZXJzKSB7XG4gIHJldHVybiBwYXJzZXJzXG4gICAgLnJlZHVjZVJpZ2h0KChyZXN0LCBjdXJyKSA9PiB7XG4gICAgICByZXR1cm4gbGlmdDIoX2NvbnMpKGN1cnIpKHJlc3QpO1xuICAgIH0sIHJldHVyblAoW10pKTtcbn1cblxuLy8gdXNpbmcgbmFpdmUgYW5kVGhlbiAmJiBmbWFwIC0tPiByZXR1cm5zIHN0cmluZ3MsIG5vdCBhcnJheXMhXG5leHBvcnQgZnVuY3Rpb24gc2VxdWVuY2VQMihwYXJzZXJzKSB7XG4gIHJldHVybiBwYXJzZXJzXG4gICAgLnJlZHVjZVJpZ2h0KChyZXN0LCBjdXJyKSA9PiB7XG4gICAgICByZXR1cm4gZm1hcCgoW3gsIHldKSA9PiB4ICsgeSwgYW5kVGhlbihjdXJyLCByZXN0KSk7XG4gICAgfSwgcmV0dXJuUCgnJykpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcHN0cmluZyhzdHIpIHtcbiAgcmV0dXJuIHNlcXVlbmNlUChzdHIuc3BsaXQoJycpLm1hcChwY2hhcikpXG4gICAgLnNldExhYmVsKCdwc3RyaW5nICcgKyBzdHIpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc3RyaW5nUChzdHIpIHtcbiAgcmV0dXJuIHBzdHJpbmcoc3RyKVxuICAgIC5mbWFwKHJlcyA9PiByZXMuam9pbignJykpXG4gICAgLnNldExhYmVsKCdzdHJpbmdQICcgKyBzdHIpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gemVyb09yTW9yZSh4UCkgeyAvLyB6ZXJvT3JNb3JlIDo6IHAgYSAtPiBbYV0gLT4gdHJ5IFthXSA9IHAgYSAtPiBwIFthXVxuICByZXR1cm4gcG9zID0+IHtcbiAgICBjb25zdCByZXMxID0geFAucnVuKHBvcyk7XG4gICAgaWYgKHJlczEuaXNGYWlsdXJlKSByZXR1cm4gVmFsaWRhdGlvbi5TdWNjZXNzKFR1cGxlLlBhaXIoW10sIHBvcykpO1xuICAgIGNvbnN0IHJlc04gPSB6ZXJvT3JNb3JlKHhQKShyZXMxLnZhbHVlWzFdKTtcbiAgICByZXR1cm4gVmFsaWRhdGlvbi5TdWNjZXNzKFR1cGxlLlBhaXIoW3JlczEudmFsdWVbMF1dLmNvbmNhdChyZXNOLnZhbHVlWzBdKSwgcmVzTi52YWx1ZVsxXSkpO1xuICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbWFueSh4UCwgdGltZXMpIHtcbiAgY29uc3QgdGltZXNfZGVmaW5lZCA9ICh0eXBlb2YgdGltZXMgIT09ICd1bmRlZmluZWQnKTtcbiAgY29uc3QgbGFiZWwgPSAnbWFueSAnICsgeFAubGFiZWxcbiAgICAgICAgKyAoKHRpbWVzX2RlZmluZWQpID8gJyB0aW1lcz0nICsgdGltZXMgOiAnJyk7XG4gIHJldHVybiBwYXJzZXIocG9zID0+IHtcbiAgICBjb25zdCByZXMgPSB6ZXJvT3JNb3JlKHhQKShwb3MpO1xuICAgIGlmICh0aW1lc19kZWZpbmVkKSB7Ly8gZGVidWdnZXI7XG4gICAgICBpZiAocmVzLmlzRmFpbHVyZSkgcmV0dXJuIHJlcztcbiAgICAgIGNvbnN0IHJlc3VsdExlbmd0aCA9IHJlcy52YWx1ZVswXS5sZW5ndGg7XG4gICAgICByZXR1cm4gKHJlc3VsdExlbmd0aCA9PT0gdGltZXMpXG4gICAgICAgID8gcmVzXG4gICAgICAgIDogVmFsaWRhdGlvbi5GYWlsdXJlKFR1cGxlLlRyaXBsZShsYWJlbCwgJ3RpbWVzIHBhcmFtIHdhbnRlZCAnICsgdGltZXMgKyAnOyBnb3QgJyArIHJlc3VsdExlbmd0aCwgcG9zKSk7XG4gICAgfVxuICAgIHJldHVybiByZXM7XG4gIH0sIGxhYmVsKS5zZXRMYWJlbChsYWJlbCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtYW55Q2hhcnMoeFAsIHRpbWVzKSB7XG4gIHJldHVybiBtYW55KHhQLCB0aW1lcylcbiAgICAuZm1hcChhcnJhID0+IGFycmEuam9pbignJykpXG4gICAgLnNldExhYmVsKCdtYW55Q2hhcnMgJyArIHhQLmxhYmVsXG4gICAgICAgICAgICArICgodHlwZW9mIHRpbWVzICE9PSAndW5kZWZpbmVkJykgPyAnIHRpbWVzPScgKyB0aW1lcyA6ICcnKSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtYW55MSh4UCkge1xuICBjb25zdCBsYWJlbCA9ICdtYW55MSAnICsgeFAubGFiZWw7XG4gIHJldHVybiBwYXJzZXIocG9zID0+IHtcbiAgICBjb25zdCByZXMxID0geFAucnVuKHBvcyk7XG4gICAgaWYgKHJlczEuaXNGYWlsdXJlKSByZXR1cm4gcmVzMTtcbiAgICBjb25zdCByZXNOID0gemVyb09yTW9yZSh4UCkocmVzMS52YWx1ZVsxXSk7XG4gICAgcmV0dXJuIFZhbGlkYXRpb24uU3VjY2VzcyhUdXBsZS5QYWlyKFtyZXMxLnZhbHVlWzBdXS5jb25jYXQocmVzTi52YWx1ZVswXSksIHJlc04udmFsdWVbMV0pKTtcbiAgfSwgbGFiZWwpLnNldExhYmVsKGxhYmVsKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1hbnlDaGFyczEoeFApIHtcbiAgcmV0dXJuIG1hbnkxKHhQKVxuICAgIC5mbWFwKGFycmEgPT4gYXJyYS5qb2luKCcnKSlcbiAgICAuc2V0TGFiZWwoJ21hbnlDaGFyczEgJyArIHhQLmxhYmVsKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG9wdCh4UCwgZGVmYXVsdFZhbHVlKSB7XG4gIGNvbnN0IGlzRGVmYXVsdCA9ICh0eXBlb2YgZGVmYXVsdFZhbHVlICE9PSAndW5kZWZpbmVkJyk7XG4gIGNvbnN0IGxhYmVsID0gJ29wdCAnICsgeFAubGFiZWxcbiAgICAgICAgKyAoaXNEZWZhdWx0ID8gJyhkZWZhdWx0PScgKyBkZWZhdWx0VmFsdWUgKyAnKScgOiAnJyk7XG4gIHJldHVybiBwYXJzZXIocG9zID0+IHtcbiAgICBjb25zdCByZXMgPSB4UC5mbWFwKE1heWJlLkp1c3QpLnJ1bihwb3MpO1xuICAgIGlmIChyZXMuaXNTdWNjZXNzKSByZXR1cm4gcmVzO1xuICAgIGNvbnN0IG91dGNvbWUgPSAoaXNEZWZhdWx0KSA/IE1heWJlLkp1c3QoZGVmYXVsdFZhbHVlKSA6IE1heWJlLk5vdGhpbmcoKTtcbiAgICByZXR1cm4gVmFsaWRhdGlvbi5TdWNjZXNzKFR1cGxlLlBhaXIob3V0Y29tZSwgcG9zKSk7XG4gIH0sIGxhYmVsKS5zZXRMYWJlbChsYWJlbCk7XG59XG5cbi8vIG9wdCBmcm9tIHRoZSBib29rIC0gd29ya3Mgb2ssIGJ1dCB0b1N0cmluZygpIGdpdmVzIHN0cmFuZ2UgcmVzdWx0c1xuZXhwb3J0IGZ1bmN0aW9uIG9wdEJvb2socFgpIHtcbiAgY29uc3Qgc29tZVAgPSBwWC5mbWFwKE1heWJlLkp1c3QpO1xuICBjb25zdCBub25lUCA9IHJldHVyblAoTWF5YmUuTm90aGluZyk7XG4gIHJldHVybiBzb21lUC5vckVsc2Uobm9uZVApO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZGlzY2FyZFNlY29uZChwMSwgcDIpIHtcbiAgY29uc3QgbGFiZWwgPSBwMS5sYWJlbCArICcgZGlzY2FyZFNlY29uZCAnICsgcDIubGFiZWw7XG4gIHJldHVybiBwYXJzZXIocG9zID0+IHtcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tdW51c2VkLXZhcnNcbiAgICByZXR1cm4gYW5kVGhlbihwMSwgcDIpLmZtYXAoKFt4LCB5XSkgPT4geCkucnVuKHBvcyk7XG4gIH0sIGxhYmVsKS5zZXRMYWJlbChsYWJlbCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBkaXNjYXJkRmlyc3QocDEsIHAyKSB7XG4gIGNvbnN0IGxhYmVsID0gcDEubGFiZWwgKyAnIGRpc2NhcmRGaXJzdCAnICsgcDIubGFiZWw7XG4gIHJldHVybiBwYXJzZXIocG9zID0+IHtcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tdW51c2VkLXZhcnNcbiAgICByZXR1cm4gYW5kVGhlbihwMSwgcDIpLmZtYXAoKFt4LCB5XSkgPT4geSkucnVuKHBvcyk7XG4gIH0sIGxhYmVsKS5zZXRMYWJlbChsYWJlbCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzZXBCeTFCb29rKHB4LCBzZXApIHtcbiAgcmV0dXJuIHB4LmFuZFRoZW4obWFueShzZXAuZGlzY2FyZEZpcnN0KHB4KSkpLmZtYXAoKFtyLCBybGlzdF0pID0+IFtyXS5jb25jYXQocmxpc3QpKTtcbn1cblxuLy8gbXkgdmVyc2lvbiB3b3JrcyBqdXN0IGZpbmUuLi5cbmV4cG9ydCBmdW5jdGlvbiBzZXBCeTEodmFsdWVQLCBzZXBhcmF0b3JQKSB7XG4gIHJldHVybiBtYW55KG1hbnkxKHZhbHVlUCkuZGlzY2FyZFNlY29uZChvcHQoc2VwYXJhdG9yUCkpKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGJldHdlZW4ocDEsIHAyLCBwMykge1xuICByZXR1cm4gcDEuZGlzY2FyZEZpcnN0KHAyKS5kaXNjYXJkU2Vjb25kKHAzKVxuICAgIC5zZXRMYWJlbCgnYmV0d2VlbiAnICsgcDEubGFiZWwgKyAnLycgKyBwMi5sYWJlbCArICcvJyArIHAzLmxhYmVsKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGJldHdlZW5QYXJlbnMocHgpIHtcbiAgcmV0dXJuIGJldHdlZW4ocGNoYXIoJygnKSwgcHgsIHBjaGFyKCcpJykpXG4gICAgLnNldExhYmVsKCdiZXR3ZWVuUGFyZW5zICcgKyBweC5sYWJlbCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBiaW5kUChmYW1iLCBweCkge1xuICBjb25zdCBsYWJlbCA9ICd1bmtub3duJztcbiAgcmV0dXJuIHBhcnNlcihwb3MgPT4ge1xuICAgIGNvbnN0IHJlcyA9IHB4LnJ1bihwb3MpO1xuICAgIGlmIChyZXMuaXNGYWlsdXJlKSByZXR1cm4gcmVzO1xuICAgIHJldHVybiBmYW1iKHJlcy52YWx1ZVswXSkucnVuKHJlcy52YWx1ZVsxXSk7XG4gIH0sIGxhYmVsKS5zZXRMYWJlbChsYWJlbCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB0YXBQKHB4LCBmbikge1xuICByZXR1cm4gcHguYmluZChyZXMgPT4ge1xuICAgIGZuKHJlcyk7XG4gICAgcmV0dXJuIHJldHVyblAocmVzKTtcbiAgfSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBsb2dQKHB4KSB7XG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1jb25zb2xlXG4gIHJldHVybiB0YXBQKHB4LCByZXMgPT4gY29uc29sZS5sb2cocHgubGFiZWwgKyAnOicgKyByZXMpKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHB3b3JkKHdvcmQpIHtcbiAgcmV0dXJuIHRyaW1QKHBzdHJpbmcod29yZCkpXG4gICAgLnNldExhYmVsKCdwd29yZCAnICsgd29yZCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB0cmltUChwWCkge1xuICByZXR1cm4gb3B0KG1hbnkod2hpdGVQKSlcbiAgICAuZGlzY2FyZEZpcnN0KHBYKVxuICAgIC5kaXNjYXJkU2Vjb25kKG9wdChtYW55KHdoaXRlUCkpKVxuICAgIC5zZXRMYWJlbCgndHJpbSAnICsgcFgubGFiZWwpO1xufVxuXG5mdW5jdGlvbiBfY29ucyh4KSB7XG4gIHJldHVybiBmdW5jdGlvbih4cykge1xuICAgIHJldHVybiBbeF0uY29uY2F0KHhzKTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gX3NldExhYmVsKHB4LCBuZXdMYWJlbCkge1xuICByZXR1cm4gcGFyc2VyKHBvcyA9PiB7XG4gICAgY29uc3QgcmVzdWx0ID0gcHgucnVuKHBvcyk7XG4gICAgaWYgKHJlc3VsdC5pc0ZhaWx1cmUpIHJldHVybiBWYWxpZGF0aW9uLkZhaWx1cmUoVHVwbGUuVHJpcGxlKG5ld0xhYmVsLCByZXN1bHQudmFsdWVbMV0sIHJlc3VsdC52YWx1ZVsyXSkpO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH0sIG5ld0xhYmVsKTtcbn1cblxuLy8gdGhlIHJlYWwgdGhpbmcuLi5cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZXIoZm4sIGxhYmVsKSB7XG4gIHJldHVybiB7XG4gICAgdHlwZTogJ3BhcnNlcicsXG4gICAgbGFiZWwsXG4gICAgcnVuKHBvcykge1xuICAgICAgcmV0dXJuIGZuKHBvcyk7XG4gICAgfSxcbiAgICBhcHBseShweCkge1xuICAgICAgcmV0dXJuIGFwcGx5UCh0aGlzKShweCk7XG4gICAgICAvLyByZXR1cm4gdGhpcy5iaW5kKGFuZFRoZW4odGhpcywgcHgpLmZtYXAoKFtmLCB4XSkgPT4gZih4KSkpLnJ1bjsgLy8gd2UgYXJlIHRoZSBmUFxuICAgIH0sXG4gICAgZm1hcChmYWIpIHtcbiAgICAgIC8vIHJldHVybiBmbWFwKGZhYiwgdGhpcyk7XG4gICAgICAvLyByZXR1cm4gYmluZFAocG9zID0+IHJldHVyblAoZmFiKHBvcykpLCB0aGlzKTtcbiAgICAgIHJldHVybiB0aGlzLmJpbmQocGFyc2VkVmFsdWUgPT4gcmV0dXJuUChmYWIocGFyc2VkVmFsdWUpKSk7XG4gICAgfSxcbiAgICBhbmRUaGVuKHB4KSB7XG4gICAgICByZXR1cm4gYW5kVGhlbih0aGlzLCBweCk7XG4gICAgfSxcbiAgICBvckVsc2UocHgpIHtcbiAgICAgIHJldHVybiBvckVsc2UodGhpcywgcHgpO1xuICAgIH0sXG4gICAgZGlzY2FyZEZpcnN0KHB4KSB7XG4gICAgICByZXR1cm4gZGlzY2FyZEZpcnN0KHRoaXMsIHB4KTtcbiAgICB9LFxuICAgIGRpc2NhcmRTZWNvbmQocHgpIHtcbiAgICAgIHJldHVybiBkaXNjYXJkU2Vjb25kKHRoaXMsIHB4KTtcbiAgICB9LFxuICAgIGJpbmQoZmFtYikge1xuICAgICAgcmV0dXJuIGJpbmRQKGZhbWIsIHRoaXMpO1xuICAgIH0sXG4gICAgc2V0TGFiZWwobmV3TGFiZWwpIHtcbiAgICAgIHJldHVybiBfc2V0TGFiZWwodGhpcywgbmV3TGFiZWwpO1xuICAgIH0sXG4gIH07XG59XG4iXX0=