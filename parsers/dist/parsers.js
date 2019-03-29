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
  exports.followedByP = followedByP;
  exports.notFollowedByP = notFollowedByP;
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

  function followedByP(c1, c2) {
    var label = c2 + ' followed by ' + c1;
    return parser(function (pos) {
      var res2 = pchar(c2).run(pos);
      if (res2.isSuccess) {
        var res1 = pchar(c1).run(res2.value[1]); // no need to increment pos
        if (res1.isSuccess) {
          return _validation.Validation.Success(_tuples.Tuple.Pair(c2, res2.value[1]));
        }
        return _validation.Validation.Failure(_tuples.Tuple.Triple(label, res1.value[1], res1.value[2]));
      }
      return _validation.Validation.Failure(_tuples.Tuple.Triple(label, res2.value[1], res2.value[2]));
    }, label);
  }

  function notFollowedByP(c1, c2) {
    var label = c2 + ' not followed by ' + c1;
    return parser(function (pos) {
      var res2 = pchar(c2).run(pos);
      if (res2.isSuccess) {
        var res1 = _validation.Validation.Failure();
        try {
          // crash going down beyond end of input => ok
          res1 = pchar(c1).run(res2.value[1]);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2pzL3BhcnNlcnMuanMiXSwibmFtZXMiOlsicGNoYXIiLCJwZGlnaXQiLCJwcmVjZWRlZEJ5UCIsIm5vdFByZWNlZGVkQnlQIiwiZm9sbG93ZWRCeVAiLCJub3RGb2xsb3dlZEJ5UCIsImFuZFRoZW5CaW5kIiwiY2hvaWNlIiwiYW55T2YiLCJmbWFwIiwicmV0dXJuUCIsImFwcGx5UHgiLCJhcHBseVAiLCJsaWZ0MiIsInNlcXVlbmNlUCIsInNlcXVlbmNlUDIiLCJwc3RyaW5nIiwic3RyaW5nUCIsInplcm9Pck1vcmUiLCJtYW55IiwibWFueUNoYXJzIiwibWFueTEiLCJtYW55Q2hhcnMxIiwib3B0Iiwib3B0Qm9vayIsInNlcEJ5MUJvb2siLCJzZXBCeTEiLCJiZXR3ZWVuIiwiYmV0d2VlblBhcmVucyIsImJpbmRQIiwidGFwUCIsImxvZ1AiLCJwd29yZCIsInRyaW1QIiwicGFyc2VyIiwiY2hhclBhcnNlciIsInBvcyIsIlBvc2l0aW9uIiwiZnJvbVRleHQiLCJvcHRDaGFyIiwiY2hhciIsImlzTm90aGluZyIsIlZhbGlkYXRpb24iLCJGYWlsdXJlIiwiVHVwbGUiLCJUcmlwbGUiLCJ2YWx1ZSIsIlN1Y2Nlc3MiLCJQYWlyIiwiaW5jclBvcyIsImRpZ2l0UGFyc2VyIiwicGFyc2VJbnQiLCJkaWdpdCIsInByZWRpY2F0ZUJhc2VkUGFyc2VyIiwicHJlZCIsImxhYmVsIiwic3RhcnRPZklucHV0UCIsImRlY3JQb3MiLCJzdWNjZWVkUCIsInJ1biIsImZhaWxQIiwic2V0TGFiZWwiLCJub3RTdGFydE9mSW5wdXRQIiwiaXNKdXN0IiwiZW5kT2ZJbnB1dFAiLCJyZXN0Iiwibm90RW5kT2ZJbnB1dFAiLCJyZXN1bHQiLCJjMSIsImMyIiwicmVzMiIsImlzU3VjY2VzcyIsInJlczEiLCJlcnIiLCJpc0ZhaWx1cmUiLCJhbmRUaGVuIiwicDEiLCJwMiIsImJpbmQiLCJwYXJzZWRWYWx1ZTEiLCJwYXJzZWRWYWx1ZTIiLCJvckVsc2UiLCJwYXJzZXJzIiwicmVkdWNlUmlnaHQiLCJjdXJyIiwicmVkdWNlIiwiYWNjIiwiY2hhcnNBcnJheSIsIm1hcCIsImxvd2VyY2FzZVAiLCJ1cHBlcmNhc2VQIiwibGV0dGVyUCIsImRpZ2l0UCIsIndoaXRlUCIsImZhYiIsInBhcnNlcjEiLCJ0b1N0cmluZyIsInJlcyIsImZQIiwieFAiLCJmIiwieCIsInBhcnNlZFZhbHVlZiIsInBhcnNlZFZhbHVleCIsImZhYWIiLCJwYXJzZXIyIiwiYXBwbHkiLCJfY29ucyIsInkiLCJzdHIiLCJzcGxpdCIsImpvaW4iLCJyZXNOIiwiY29uY2F0IiwidGltZXMiLCJ0aW1lc19kZWZpbmVkIiwicmVzdWx0TGVuZ3RoIiwibGVuZ3RoIiwiYXJyYSIsImRlZmF1bHRWYWx1ZSIsImlzRGVmYXVsdCIsIk1heWJlIiwiSnVzdCIsIm91dGNvbWUiLCJOb3RoaW5nIiwicFgiLCJzb21lUCIsIm5vbmVQIiwiZGlzY2FyZFNlY29uZCIsImRpc2NhcmRGaXJzdCIsInB4Iiwic2VwIiwiciIsInJsaXN0IiwidmFsdWVQIiwic2VwYXJhdG9yUCIsInAzIiwiZmFtYiIsImZuIiwiY29uc29sZSIsImxvZyIsIndvcmQiLCJ4cyIsIl9zZXRMYWJlbCIsIm5ld0xhYmVsIiwidHlwZSIsInBhcnNlZFZhbHVlIl0sIm1hcHBpbmdzIjoiOzs7Ozs7O1VBK0VnQkEsSyxHQUFBQSxLO1VBTUFDLE0sR0FBQUEsTTtVQUlBQyxXLEdBQUFBLFc7VUFlQUMsYyxHQUFBQSxjO1VBa0JBQyxXLEdBQUFBLFc7VUFlQUMsYyxHQUFBQSxjO1VBa0NBQyxXLEdBQUFBLFc7VUF1QkFDLE0sR0FBQUEsTTtVQUtBQyxLLEdBQUFBLEs7VUFXQUMsSSxHQUFBQSxJO1VBU0FDLE8sR0FBQUEsTztVQUtBQyxPLEdBQUFBLE87VUFPQUMsTSxHQUFBQSxNO1VBVUFDLEssR0FBQUEsSztVQVVBQyxTLEdBQUFBLFM7VUFRQUMsVSxHQUFBQSxVO1VBT0FDLE8sR0FBQUEsTztVQUtBQyxPLEdBQUFBLE87VUFNQUMsVSxHQUFBQSxVO1VBU0FDLEksR0FBQUEsSTtVQWlCQUMsUyxHQUFBQSxTO1VBT0FDLEssR0FBQUEsSztVQVVBQyxVLEdBQUFBLFU7VUFNQUMsRyxHQUFBQSxHO1VBYUFDLE8sR0FBQUEsTztVQXNCQUMsVSxHQUFBQSxVO1VBS0FDLE0sR0FBQUEsTTtVQUlBQyxPLEdBQUFBLE87VUFLQUMsYSxHQUFBQSxhO1VBS0FDLEssR0FBQUEsSztVQVNBQyxJLEdBQUFBLEk7VUFPQUMsSSxHQUFBQSxJO1VBS0FDLEssR0FBQUEsSztVQUtBQyxLLEdBQUFBLEs7VUFzQkFDLE0sR0FBQUEsTTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQTdZMkI7O0FBRTNDLE1BQU1DLGFBQWEsU0FBYkEsVUFBYTtBQUFBLFdBQVEsZUFBTztBQUNoQyxVQUFJLE9BQU9DLEdBQVAsS0FBZSxRQUFuQixFQUE2QkEsTUFBTUMsaUJBQVNDLFFBQVQsQ0FBa0JGLEdBQWxCLENBQU47QUFDN0IsVUFBTUcsVUFBVUgsSUFBSUksSUFBSixFQUFoQjtBQUNBLFVBQUlELFFBQVFFLFNBQVosRUFBdUIsT0FBT0MsdUJBQVdDLE9BQVgsQ0FBbUJDLGNBQU1DLE1BQU4sQ0FBYSxZQUFiLEVBQTJCLGVBQTNCLEVBQTRDVCxHQUE1QyxDQUFuQixDQUFQO0FBQ3ZCLFVBQUlHLFFBQVFPLEtBQVIsS0FBa0JOLElBQXRCLEVBQTRCLE9BQU9FLHVCQUFXSyxPQUFYLENBQW1CSCxjQUFNSSxJQUFOLENBQVdSLElBQVgsRUFBaUJKLElBQUlhLE9BQUosRUFBakIsQ0FBbkIsQ0FBUDtBQUM1QixhQUFPUCx1QkFBV0MsT0FBWCxDQUFtQkMsY0FBTUMsTUFBTixDQUFhLFlBQWIsRUFBMkIsWUFBWUwsSUFBWixHQUFtQixRQUFuQixHQUE4QkQsUUFBUU8sS0FBakUsRUFBd0VWLEdBQXhFLENBQW5CLENBQVA7QUFDRCxLQU5rQjtBQUFBLEdBQW5COztBQVFBLE1BQU1jLGNBQWMsU0FBZEEsV0FBYztBQUFBLFdBQVMsZUFBTztBQUNsQyxVQUFJLE9BQU9kLEdBQVAsS0FBZSxRQUFuQixFQUE2QkEsTUFBTUMsaUJBQVNDLFFBQVQsQ0FBa0JGLEdBQWxCLENBQU47QUFDN0IsVUFBTUcsVUFBVUgsSUFBSUksSUFBSixFQUFoQjtBQUNBLFVBQUlELFFBQVFFLFNBQVosRUFBdUIsT0FBT0MsdUJBQVdDLE9BQVgsQ0FBbUJDLGNBQU1DLE1BQU4sQ0FBYSxhQUFiLEVBQTRCLGVBQTVCLEVBQTZDVCxHQUE3QyxDQUFuQixDQUFQO0FBQ3ZCLFVBQUllLFNBQVNaLFFBQVFPLEtBQWpCLEVBQXdCLEVBQXhCLE1BQWdDTSxLQUFwQyxFQUEyQyxPQUFPVix1QkFBV0ssT0FBWCxDQUFtQkgsY0FBTUksSUFBTixDQUFXSSxLQUFYLEVBQWtCaEIsSUFBSWEsT0FBSixFQUFsQixDQUFuQixDQUFQO0FBQzNDLGFBQU9QLHVCQUFXQyxPQUFYLENBQW1CQyxjQUFNQyxNQUFOLENBQWEsYUFBYixFQUE0QixZQUFZTyxLQUFaLEdBQW9CLFFBQXBCLEdBQStCYixRQUFRTyxLQUFuRSxFQUEwRVYsR0FBMUUsQ0FBbkIsQ0FBUDtBQUNELEtBTm1CO0FBQUEsR0FBcEI7O0FBUUEsTUFBTWlCLHVCQUF1QixTQUF2QkEsb0JBQXVCLENBQUNDLElBQUQsRUFBT0MsS0FBUDtBQUFBLFdBQWlCLGVBQU87QUFDbkQsVUFBSSxPQUFPbkIsR0FBUCxLQUFlLFFBQW5CLEVBQTZCQSxNQUFNQyxpQkFBU0MsUUFBVCxDQUFrQkYsR0FBbEIsQ0FBTjtBQUM3QixVQUFNRyxVQUFVSCxJQUFJSSxJQUFKLEVBQWhCO0FBQ0EsVUFBSUQsUUFBUUUsU0FBWixFQUF1QixPQUFPQyx1QkFBV0MsT0FBWCxDQUFtQkMsY0FBTUMsTUFBTixDQUFhVSxLQUFiLEVBQW9CLGVBQXBCLEVBQXFDbkIsR0FBckMsQ0FBbkIsQ0FBUDtBQUN2QixVQUFJa0IsS0FBS2YsUUFBUU8sS0FBYixDQUFKLEVBQXlCLE9BQU9KLHVCQUFXSyxPQUFYLENBQW1CSCxjQUFNSSxJQUFOLENBQVdULFFBQVFPLEtBQW5CLEVBQTBCVixJQUFJYSxPQUFKLEVBQTFCLENBQW5CLENBQVA7QUFDekIsYUFBT1AsdUJBQVdDLE9BQVgsQ0FBbUJDLGNBQU1DLE1BQU4sQ0FBYVUsS0FBYixFQUFvQixzQkFBc0JoQixRQUFRTyxLQUFsRCxFQUF5RFYsR0FBekQsQ0FBbkIsQ0FBUDtBQUNELEtBTjRCO0FBQUEsR0FBN0I7O1VBUVNELFUsR0FBQUEsVTtVQUFZZSxXLEdBQUFBLFc7VUFBYUcsb0IsR0FBQUEsb0I7QUFFM0IsTUFBTUcsd0NBQ1h0QixPQUFPO0FBQUEsV0FBUUUsSUFBSXFCLE9BQUosR0FBY2pCLElBQWQsR0FBcUJDLFNBQXRCLEdBQ1ZpQixTQUFTQyxHQUFULENBQWF2QixHQUFiLENBRFUsR0FFVndCLE1BQU1ELEdBQU4sQ0FBVXZCLEdBQVYsQ0FGRztBQUFBLEdBQVAsRUFFb0J5QixRQUZwQixDQUU2QixHQUY3QixDQURLOztBQUtBLE1BQU1DLDhDQUNYNUIsT0FBTztBQUFBLFdBQVFFLElBQUlxQixPQUFKLEdBQWNqQixJQUFkLEdBQXFCdUIsTUFBdEIsR0FDVkwsU0FBU0MsR0FBVCxDQUFhdkIsR0FBYixDQURVLEdBRVZ3QixNQUFNRCxHQUFOLENBQVV2QixHQUFWLENBRkc7QUFBQSxHQUFQLEVBRW9CeUIsUUFGcEIsQ0FFNkIsTUFGN0IsQ0FESzs7QUFLQSxNQUFNRyxvQ0FDWDlCLE9BQU87QUFBQSxXQUFRRSxJQUFJNkIsSUFBSixPQUFlLEVBQWhCLEdBQ1ZQLFNBQVNDLEdBQVQsQ0FBYXZCLEdBQWIsQ0FEVSxHQUVWd0IsTUFBTUQsR0FBTixDQUFVdkIsR0FBVixDQUZHO0FBQUEsR0FBUCxFQUVvQnlCLFFBRnBCLENBRTZCLEdBRjdCLENBREs7O0FBS0EsTUFBTUssMENBQ1hoQyxPQUFPO0FBQUEsV0FBUUUsSUFBSTZCLElBQUosT0FBZSxFQUFoQixHQUNWUCxTQUFTQyxHQUFULENBQWF2QixHQUFiLENBRFUsR0FFVndCLE1BQU1ELEdBQU4sQ0FBVXZCLEdBQVYsQ0FGRztBQUFBLEdBQVAsRUFFb0J5QixRQUZwQixDQUU2QixNQUY3QixDQURLOztBQUtBLFdBQVM3RCxLQUFULENBQWV3QyxJQUFmLEVBQXFCO0FBQzFCLFFBQU1lLFFBQVEsV0FBV2YsSUFBekI7QUFDQSxRQUFNMkIsU0FBUyxTQUFUQSxNQUFTO0FBQUEsYUFBT2hDLFdBQVdLLElBQVgsRUFBaUJKLEdBQWpCLENBQVA7QUFBQSxLQUFmO0FBQ0EsV0FBT0YsT0FBT2lDLE1BQVAsRUFBZVosS0FBZixFQUFzQk0sUUFBdEIsQ0FBK0JOLEtBQS9CLENBQVA7QUFDRDs7QUFFTSxXQUFTdEQsTUFBVCxDQUFnQm1ELEtBQWhCLEVBQXVCO0FBQzVCLFdBQU9sQixPQUFPO0FBQUEsYUFBT2dCLFlBQVlFLEtBQVosRUFBbUJoQixHQUFuQixDQUFQO0FBQUEsS0FBUCxFQUF1QyxZQUFZZ0IsS0FBbkQsQ0FBUDtBQUNEOztBQUVNLFdBQVNsRCxXQUFULENBQXFCa0UsRUFBckIsRUFBeUJDLEVBQXpCLEVBQTZCO0FBQ2xDLFFBQU1kLFFBQVFjLEtBQUssZUFBTCxHQUF1QkQsRUFBckM7QUFDQSxXQUFPbEMsT0FBTyxlQUFPO0FBQ25CLFVBQU1vQyxPQUFPdEUsTUFBTXFFLEVBQU4sRUFBVVYsR0FBVixDQUFjdkIsR0FBZCxDQUFiO0FBQ0EsVUFBSWtDLEtBQUtDLFNBQVQsRUFBb0I7QUFDbEIsWUFBTUMsT0FBT3hFLE1BQU1vRSxFQUFOLEVBQVVULEdBQVYsQ0FBY1csS0FBS3hCLEtBQUwsQ0FBVyxDQUFYLEVBQWNXLE9BQWQsQ0FBc0IsQ0FBdEIsQ0FBZCxDQUFiO0FBQ0EsWUFBSWUsS0FBS0QsU0FBVCxFQUFvQjtBQUNsQixpQkFBTzdCLHVCQUFXSyxPQUFYLENBQW1CSCxjQUFNSSxJQUFOLENBQVdxQixFQUFYLEVBQWVDLEtBQUt4QixLQUFMLENBQVcsQ0FBWCxDQUFmLENBQW5CLENBQVA7QUFDRDtBQUNELGVBQU9KLHVCQUFXQyxPQUFYLENBQW1CQyxjQUFNQyxNQUFOLENBQWFVLEtBQWIsRUFBb0JpQixLQUFLMUIsS0FBTCxDQUFXLENBQVgsQ0FBcEIsRUFBbUMwQixLQUFLMUIsS0FBTCxDQUFXLENBQVgsQ0FBbkMsQ0FBbkIsQ0FBUDtBQUNEO0FBQ0QsYUFBT0osdUJBQVdDLE9BQVgsQ0FBbUJDLGNBQU1DLE1BQU4sQ0FBYVUsS0FBYixFQUFvQmUsS0FBS3hCLEtBQUwsQ0FBVyxDQUFYLENBQXBCLEVBQW1Dd0IsS0FBS3hCLEtBQUwsQ0FBVyxDQUFYLENBQW5DLENBQW5CLENBQVA7QUFDRCxLQVZNLEVBVUpTLEtBVkksQ0FBUDtBQVdEOztBQUVNLFdBQVNwRCxjQUFULENBQXdCaUUsRUFBeEIsRUFBNEJDLEVBQTVCLEVBQWdDO0FBQ3JDLFFBQU1kLFFBQVFjLEtBQUssbUJBQUwsR0FBMkJELEVBQXpDO0FBQ0EsV0FBT2xDLE9BQU8sZUFBTztBQUNuQixVQUFNb0MsT0FBT3RFLE1BQU1xRSxFQUFOLEVBQVVWLEdBQVYsQ0FBY3ZCLEdBQWQsQ0FBYjtBQUNBLFVBQUlrQyxLQUFLQyxTQUFULEVBQW9CO0FBQ2xCLFlBQUlDLE9BQU85Qix1QkFBV0MsT0FBWCxFQUFYO0FBQ0EsWUFBSTtBQUFFO0FBQ0o2QixpQkFBT3hFLE1BQU1vRSxFQUFOLEVBQVVULEdBQVYsQ0FBY1csS0FBS3hCLEtBQUwsQ0FBVyxDQUFYLEVBQWNXLE9BQWQsQ0FBc0IsQ0FBdEIsQ0FBZCxDQUFQO0FBQ0QsU0FGRCxDQUVFLE9BQU9nQixHQUFQLEVBQVksQ0FBRTtBQUNoQixZQUFJRCxLQUFLRSxTQUFULEVBQW9CO0FBQ2xCLGlCQUFPaEMsdUJBQVdLLE9BQVgsQ0FBbUJILGNBQU1JLElBQU4sQ0FBV3FCLEVBQVgsRUFBZUMsS0FBS3hCLEtBQUwsQ0FBVyxDQUFYLENBQWYsQ0FBbkIsQ0FBUDtBQUNEO0FBQ0QsZUFBT0osdUJBQVdDLE9BQVgsQ0FBbUJDLGNBQU1DLE1BQU4sQ0FBYVUsS0FBYixFQUFvQmlCLEtBQUsxQixLQUFMLENBQVcsQ0FBWCxDQUFwQixFQUFtQzBCLEtBQUsxQixLQUFMLENBQVcsQ0FBWCxDQUFuQyxDQUFuQixDQUFQO0FBQ0Q7QUFDRCxhQUFPSix1QkFBV0MsT0FBWCxDQUFtQkMsY0FBTUMsTUFBTixDQUFhVSxLQUFiLEVBQW9CZSxLQUFLeEIsS0FBTCxDQUFXLENBQVgsQ0FBcEIsRUFBbUN3QixLQUFLeEIsS0FBTCxDQUFXLENBQVgsQ0FBbkMsQ0FBbkIsQ0FBUDtBQUNELEtBYk0sRUFhSlMsS0FiSSxDQUFQO0FBY0Q7O0FBRU0sV0FBU25ELFdBQVQsQ0FBcUJnRSxFQUFyQixFQUF5QkMsRUFBekIsRUFBNkI7QUFDbEMsUUFBTWQsUUFBUWMsS0FBSyxlQUFMLEdBQXVCRCxFQUFyQztBQUNBLFdBQU9sQyxPQUFPLGVBQU87QUFDbkIsVUFBTW9DLE9BQU90RSxNQUFNcUUsRUFBTixFQUFVVixHQUFWLENBQWN2QixHQUFkLENBQWI7QUFDQSxVQUFJa0MsS0FBS0MsU0FBVCxFQUFvQjtBQUNsQixZQUFNQyxPQUFPeEUsTUFBTW9FLEVBQU4sRUFBVVQsR0FBVixDQUFjVyxLQUFLeEIsS0FBTCxDQUFXLENBQVgsQ0FBZCxDQUFiLENBRGtCLENBQ3lCO0FBQzNDLFlBQUkwQixLQUFLRCxTQUFULEVBQW9CO0FBQ2xCLGlCQUFPN0IsdUJBQVdLLE9BQVgsQ0FBbUJILGNBQU1JLElBQU4sQ0FBV3FCLEVBQVgsRUFBZUMsS0FBS3hCLEtBQUwsQ0FBVyxDQUFYLENBQWYsQ0FBbkIsQ0FBUDtBQUNEO0FBQ0QsZUFBT0osdUJBQVdDLE9BQVgsQ0FBbUJDLGNBQU1DLE1BQU4sQ0FBYVUsS0FBYixFQUFvQmlCLEtBQUsxQixLQUFMLENBQVcsQ0FBWCxDQUFwQixFQUFtQzBCLEtBQUsxQixLQUFMLENBQVcsQ0FBWCxDQUFuQyxDQUFuQixDQUFQO0FBQ0Q7QUFDRCxhQUFPSix1QkFBV0MsT0FBWCxDQUFtQkMsY0FBTUMsTUFBTixDQUFhVSxLQUFiLEVBQW9CZSxLQUFLeEIsS0FBTCxDQUFXLENBQVgsQ0FBcEIsRUFBbUN3QixLQUFLeEIsS0FBTCxDQUFXLENBQVgsQ0FBbkMsQ0FBbkIsQ0FBUDtBQUNELEtBVk0sRUFVSlMsS0FWSSxDQUFQO0FBV0Q7O0FBRU0sV0FBU2xELGNBQVQsQ0FBd0IrRCxFQUF4QixFQUE0QkMsRUFBNUIsRUFBZ0M7QUFDckMsUUFBTWQsUUFBUWMsS0FBSyxtQkFBTCxHQUEyQkQsRUFBekM7QUFDQSxXQUFPbEMsT0FBTyxlQUFPO0FBQ25CLFVBQU1vQyxPQUFPdEUsTUFBTXFFLEVBQU4sRUFBVVYsR0FBVixDQUFjdkIsR0FBZCxDQUFiO0FBQ0EsVUFBSWtDLEtBQUtDLFNBQVQsRUFBb0I7QUFDbEIsWUFBSUMsT0FBTzlCLHVCQUFXQyxPQUFYLEVBQVg7QUFDQSxZQUFJO0FBQUU7QUFDSjZCLGlCQUFPeEUsTUFBTW9FLEVBQU4sRUFBVVQsR0FBVixDQUFjVyxLQUFLeEIsS0FBTCxDQUFXLENBQVgsQ0FBZCxDQUFQO0FBQ0QsU0FGRCxDQUVFLE9BQU8yQixHQUFQLEVBQVksQ0FBRTtBQUNoQixZQUFJRCxLQUFLRSxTQUFULEVBQW9CO0FBQ2xCLGlCQUFPaEMsdUJBQVdLLE9BQVgsQ0FBbUJILGNBQU1JLElBQU4sQ0FBV3FCLEVBQVgsRUFBZUMsS0FBS3hCLEtBQUwsQ0FBVyxDQUFYLENBQWYsQ0FBbkIsQ0FBUDtBQUNEO0FBQ0QsZUFBT0osdUJBQVdDLE9BQVgsQ0FBbUJDLGNBQU1DLE1BQU4sQ0FBYVUsS0FBYixFQUFvQmlCLEtBQUsxQixLQUFMLENBQVcsQ0FBWCxDQUFwQixFQUFtQzBCLEtBQUsxQixLQUFMLENBQVcsQ0FBWCxDQUFuQyxDQUFuQixDQUFQO0FBQ0Q7QUFDRCxhQUFPSix1QkFBV0MsT0FBWCxDQUFtQkMsY0FBTUMsTUFBTixDQUFhVSxLQUFiLEVBQW9CZSxLQUFLeEIsS0FBTCxDQUFXLENBQVgsQ0FBcEIsRUFBbUN3QixLQUFLeEIsS0FBTCxDQUFXLENBQVgsQ0FBbkMsQ0FBbkIsQ0FBUDtBQUNELEtBYk0sRUFhSlMsS0FiSSxDQUFQO0FBY0Q7O0FBRU0sV0FBU29CLFFBQVQsQ0FBaUJDLEVBQWpCLEVBQXFCQyxFQUFyQixFQUF5QjtBQUM5QixRQUFNdEIsUUFBUXFCLEdBQUdyQixLQUFILEdBQVcsV0FBWCxHQUF5QnNCLEdBQUd0QixLQUExQztBQUNBLFdBQU9yQixPQUFPLGVBQU87QUFDbkIsVUFBTXNDLE9BQU9JLEdBQUdqQixHQUFILENBQU92QixHQUFQLENBQWI7QUFDQSxVQUFJb0MsS0FBS0QsU0FBVCxFQUFvQjtBQUNsQixZQUFNRCxPQUFPTyxHQUFHbEIsR0FBSCxDQUFPYSxLQUFLMUIsS0FBTCxDQUFXLENBQVgsQ0FBUCxDQUFiO0FBQ0EsWUFBSXdCLEtBQUtDLFNBQVQsRUFBb0I7QUFDbEIsaUJBQU83Qix1QkFBV0ssT0FBWCxDQUFtQkgsY0FBTUksSUFBTixDQUFXSixjQUFNSSxJQUFOLENBQVd3QixLQUFLMUIsS0FBTCxDQUFXLENBQVgsQ0FBWCxFQUEwQndCLEtBQUt4QixLQUFMLENBQVcsQ0FBWCxDQUExQixDQUFYLEVBQXFEd0IsS0FBS3hCLEtBQUwsQ0FBVyxDQUFYLENBQXJELENBQW5CLENBQVA7QUFDRDtBQUNELGVBQU9KLHVCQUFXQyxPQUFYLENBQW1CQyxjQUFNQyxNQUFOLENBQWFVLEtBQWIsRUFBb0JlLEtBQUt4QixLQUFMLENBQVcsQ0FBWCxDQUFwQixFQUFtQ3dCLEtBQUt4QixLQUFMLENBQVcsQ0FBWCxDQUFuQyxDQUFuQixDQUFQO0FBQ0Q7QUFDRCxhQUFPSix1QkFBV0MsT0FBWCxDQUFtQkMsY0FBTUMsTUFBTixDQUFhVSxLQUFiLEVBQW9CaUIsS0FBSzFCLEtBQUwsQ0FBVyxDQUFYLENBQXBCLEVBQW1DMEIsS0FBSzFCLEtBQUwsQ0FBVyxDQUFYLENBQW5DLENBQW5CLENBQVA7QUFDRCxLQVZNLEVBVUpTLEtBVkksQ0FBUDtBQVdEOztBQUVEOztBQUNPLFdBQVNqRCxXQUFULENBQXFCc0UsRUFBckIsRUFBeUJDLEVBQXpCLEVBQTZCO0FBQ2xDLFdBQU9ELEdBQUdFLElBQUgsQ0FBUSx3QkFBZ0I7QUFDN0IsYUFBT0QsR0FBR0MsSUFBSCxDQUFRLHdCQUFnQjtBQUM3QixlQUFPcEUsUUFBUWtDLGNBQU1JLElBQU4sQ0FBVytCLFlBQVgsRUFBeUJDLFlBQXpCLENBQVIsQ0FBUDtBQUNELE9BRk0sQ0FBUDtBQUdELEtBSk0sRUFJSm5CLFFBSkksQ0FJS2UsR0FBR3JCLEtBQUgsR0FBVyxXQUFYLEdBQXlCc0IsR0FBR3RCLEtBSmpDLENBQVA7QUFLRDs7QUFFTSxXQUFTMEIsT0FBVCxDQUFnQkwsRUFBaEIsRUFBb0JDLEVBQXBCLEVBQXdCO0FBQzdCLFFBQU10QixRQUFRcUIsR0FBR3JCLEtBQUgsR0FBVyxVQUFYLEdBQXdCc0IsR0FBR3RCLEtBQXpDO0FBQ0EsV0FBT3JCLE9BQU8sZUFBTztBQUNuQixVQUFNc0MsT0FBT0ksR0FBR2pCLEdBQUgsQ0FBT3ZCLEdBQVAsQ0FBYjtBQUNBLFVBQUlvQyxLQUFLRCxTQUFULEVBQW9CLE9BQU9DLElBQVA7QUFDcEIsVUFBTUYsT0FBT08sR0FBR2xCLEdBQUgsQ0FBT3ZCLEdBQVAsQ0FBYjtBQUNBLFVBQUlrQyxLQUFLQyxTQUFULEVBQW9CLE9BQU9ELElBQVA7QUFDcEIsYUFBTzVCLHVCQUFXQyxPQUFYLENBQW1CQyxjQUFNQyxNQUFOLENBQWFVLEtBQWIsRUFBb0JlLEtBQUt4QixLQUFMLENBQVcsQ0FBWCxDQUFwQixFQUFtQ3dCLEtBQUt4QixLQUFMLENBQVcsQ0FBWCxDQUFuQyxDQUFuQixDQUFQO0FBQ0QsS0FOTSxFQU1KUyxLQU5JLEVBTUdNLFFBTkgsQ0FNWU4sS0FOWixDQUFQO0FBT0Q7OztBQUVNLE1BQU1LLHdCQUFRMUIsT0FBTztBQUFBLFdBQU9RLHVCQUFXQyxPQUFYLENBQW1CQyxjQUFNQyxNQUFOLENBQWEsRUFBYixFQUFpQixNQUFqQixFQUF5QlQsR0FBekIsQ0FBbkIsQ0FBUDtBQUFBLEdBQVAsQ0FBZDs7QUFFQSxNQUFNc0IsOEJBQVd4QixPQUFPO0FBQUEsV0FBT1EsdUJBQVdLLE9BQVgsQ0FBbUJILGNBQU1JLElBQU4sQ0FBVyxFQUFYLEVBQWVaLEdBQWYsQ0FBbkIsRUFBd0MsU0FBeEMsQ0FBUDtBQUFBLEdBQVAsQ0FBakI7O0FBRUEsV0FBUzdCLE1BQVQsQ0FBZ0IyRSxPQUFoQixFQUF5QjtBQUM5QixXQUFPQSxRQUFRQyxXQUFSLENBQW9CLFVBQUNsQixJQUFELEVBQU9tQixJQUFQO0FBQUEsYUFBZ0JILFFBQU9HLElBQVAsRUFBYW5CLElBQWIsQ0FBaEI7QUFBQSxLQUFwQixFQUF3REwsS0FBeEQsRUFDSkMsUUFESSxDQUNLLFlBQVlxQixRQUFRRyxNQUFSLENBQWUsVUFBQ0MsR0FBRCxFQUFNRixJQUFOO0FBQUEsYUFBZUUsTUFBTSxHQUFOLEdBQVlGLEtBQUs3QixLQUFoQztBQUFBLEtBQWYsRUFBc0QsRUFBdEQsQ0FEakIsQ0FBUDtBQUVEOztBQUVNLFdBQVMvQyxLQUFULENBQWUrRSxVQUFmLEVBQTJCO0FBQ2hDLFdBQU9oRixPQUFPZ0YsV0FBV0MsR0FBWCxDQUFleEYsS0FBZixDQUFQLEVBQ0o2RCxRQURJLENBQ0ssV0FBVzBCLFdBQVdGLE1BQVgsQ0FBa0IsVUFBQ0MsR0FBRCxFQUFNRixJQUFOO0FBQUEsYUFBZUUsTUFBTUYsSUFBckI7QUFBQSxLQUFsQixFQUE2QyxFQUE3QyxDQURoQixDQUFQO0FBRUQ7O0FBRU0sTUFBTUssa0NBQWFqRixNQUFNLENBQUMsR0FBRCxFQUFNLEdBQU4sRUFBVyxHQUFYLEVBQWdCLEdBQWhCLEVBQXFCLEdBQXJCLEVBQTBCLEdBQTFCLEVBQStCLEdBQS9CLEVBQW9DLEdBQXBDLEVBQXlDLEdBQXpDLEVBQThDLEdBQTlDLEVBQW1ELEdBQW5ELEVBQXdELEdBQXhELEVBQTZELEdBQTdELEVBQWtFLEdBQWxFLEVBQXVFLEdBQXZFLEVBQTRFLEdBQTVFLEVBQWlGLEdBQWpGLEVBQXNGLEdBQXRGLEVBQTJGLEdBQTNGLEVBQWdHLEdBQWhHLEVBQXFHLEdBQXJHLEVBQTBHLEdBQTFHLEVBQStHLEdBQS9HLEVBQW9ILEdBQXBILEVBQXlILEdBQXpILEVBQThILEdBQTlILENBQU4sRUFBMElxRCxRQUExSSxDQUFtSixZQUFuSixDQUFuQjtBQUNBLE1BQU02QixrQ0FBYWxGLE1BQU0sQ0FBQyxHQUFELEVBQU0sR0FBTixFQUFXLEdBQVgsRUFBZ0IsR0FBaEIsRUFBcUIsR0FBckIsRUFBMEIsR0FBMUIsRUFBK0IsR0FBL0IsRUFBb0MsR0FBcEMsRUFBeUMsR0FBekMsRUFBOEMsR0FBOUMsRUFBbUQsR0FBbkQsRUFBd0QsR0FBeEQsRUFBNkQsR0FBN0QsRUFBa0UsR0FBbEUsRUFBdUUsR0FBdkUsRUFBNEUsR0FBNUUsRUFBaUYsR0FBakYsRUFBc0YsR0FBdEYsRUFBMkYsR0FBM0YsRUFBZ0csR0FBaEcsRUFBcUcsR0FBckcsRUFBMEcsR0FBMUcsRUFBK0csR0FBL0csRUFBb0gsR0FBcEgsRUFBeUgsR0FBekgsRUFBOEgsR0FBOUgsQ0FBTixFQUEwSXFELFFBQTFJLENBQW1KLFlBQW5KLENBQW5CO0FBQ0EsTUFBTThCLDRCQUFVRixXQUFXUixNQUFYLENBQWtCUyxVQUFsQixFQUE4QjdCLFFBQTlCLENBQXVDLFNBQXZDLENBQWhCO0FBQ0EsTUFBTStCLDBCQUFTcEYsTUFBTSxDQUFDLEdBQUQsRUFBTSxHQUFOLEVBQVcsR0FBWCxFQUFnQixHQUFoQixFQUFxQixHQUFyQixFQUEwQixHQUExQixFQUErQixHQUEvQixFQUFvQyxHQUFwQyxFQUF5QyxHQUF6QyxFQUE4QyxHQUE5QyxDQUFOLEVBQTBEcUQsUUFBMUQsQ0FBbUUsUUFBbkUsQ0FBZjtBQUNBLE1BQU1nQywwQkFBU3JGLE1BQU0sQ0FBQyxHQUFELEVBQU0sSUFBTixFQUFZLElBQVosRUFBa0IsSUFBbEIsQ0FBTixFQUErQnFELFFBQS9CLENBQXdDLFFBQXhDLENBQWY7O0FBRUEsV0FBU3BELElBQVQsQ0FBY3FGLEdBQWQsRUFBbUJDLE9BQW5CLEVBQTRCO0FBQ2pDLFFBQU14QyxRQUFRd0MsUUFBUXhDLEtBQVIsR0FBZ0IsUUFBaEIsR0FBMkJ1QyxJQUFJRSxRQUFKLEVBQXpDO0FBQ0EsV0FBTzlELE9BQU8sZUFBTztBQUNuQixVQUFNK0QsTUFBTUYsUUFBUXBDLEdBQVIsQ0FBWXZCLEdBQVosQ0FBWjtBQUNBLFVBQUk2RCxJQUFJMUIsU0FBUixFQUFtQixPQUFPN0IsdUJBQVdLLE9BQVgsQ0FBbUJILGNBQU1JLElBQU4sQ0FBVzhDLElBQUlHLElBQUluRCxLQUFKLENBQVUsQ0FBVixDQUFKLENBQVgsRUFBOEJtRCxJQUFJbkQsS0FBSixDQUFVLENBQVYsQ0FBOUIsQ0FBbkIsQ0FBUDtBQUNuQixhQUFPSix1QkFBV0MsT0FBWCxDQUFtQkMsY0FBTUMsTUFBTixDQUFhVSxLQUFiLEVBQW9CMEMsSUFBSW5ELEtBQUosQ0FBVSxDQUFWLENBQXBCLEVBQWtDbUQsSUFBSW5ELEtBQUosQ0FBVSxDQUFWLENBQWxDLENBQW5CLENBQVA7QUFDRCxLQUpNLEVBSUpTLEtBSkksQ0FBUDtBQUtEOztBQUVNLFdBQVM3QyxPQUFULENBQWlCb0MsS0FBakIsRUFBd0I7QUFDN0IsV0FBT1osT0FBTztBQUFBLGFBQU9RLHVCQUFXSyxPQUFYLENBQW1CSCxjQUFNSSxJQUFOLENBQVdGLEtBQVgsRUFBa0JWLEdBQWxCLENBQW5CLENBQVA7QUFBQSxLQUFQLEVBQTBEVSxLQUExRCxDQUFQO0FBQ0Q7O0FBRUQ7QUFDTyxXQUFTbkMsT0FBVCxDQUFpQnVGLEVBQWpCLEVBQXFCO0FBQzFCLFdBQU8sVUFBU0MsRUFBVCxFQUFhO0FBQ2xCLGFBQU94QixTQUFRdUIsRUFBUixFQUFZQyxFQUFaLEVBQWdCMUYsSUFBaEIsQ0FBcUI7QUFBQTtBQUFBLFlBQUUyRixDQUFGO0FBQUEsWUFBS0MsQ0FBTDs7QUFBQSxlQUFZRCxFQUFFQyxDQUFGLENBQVo7QUFBQSxPQUFyQixDQUFQO0FBQ0QsS0FGRDtBQUdEOztBQUVEO0FBQ08sV0FBU3pGLE1BQVQsQ0FBZ0JzRixFQUFoQixFQUFvQjtBQUN6QixXQUFPLFVBQVNDLEVBQVQsRUFBYTtBQUNsQixhQUFPRCxHQUFHcEIsSUFBSCxDQUFRLHdCQUFnQjtBQUM3QixlQUFPcUIsR0FBR3JCLElBQUgsQ0FBUSx3QkFBZ0I7QUFDN0IsaUJBQU9wRSxRQUFRNEYsYUFBYUMsWUFBYixDQUFSLENBQVA7QUFDRCxTQUZNLENBQVA7QUFHRCxPQUpNLENBQVA7QUFLRCxLQU5EO0FBT0Q7O0FBRU0sV0FBUzFGLEtBQVQsQ0FBZTJGLElBQWYsRUFBcUI7QUFDMUIsV0FBTyxVQUFTVCxPQUFULEVBQWtCO0FBQ3ZCLGFBQU8sVUFBU1UsT0FBVCxFQUFrQjtBQUN2QjtBQUNBLGVBQU8vRixRQUFROEYsSUFBUixFQUFjRSxLQUFkLENBQW9CWCxPQUFwQixFQUE2QlcsS0FBN0IsQ0FBbUNELE9BQW5DLENBQVAsQ0FGdUIsQ0FFNkI7QUFDckQsT0FIRDtBQUlELEtBTEQ7QUFNRDs7QUFFRDtBQUNPLFdBQVMzRixTQUFULENBQW1Cb0UsT0FBbkIsRUFBNEI7QUFDakMsV0FBT0EsUUFDSkMsV0FESSxDQUNRLFVBQUNsQixJQUFELEVBQU9tQixJQUFQLEVBQWdCO0FBQzNCLGFBQU92RSxNQUFNOEYsS0FBTixFQUFhdkIsSUFBYixFQUFtQm5CLElBQW5CLENBQVA7QUFDRCxLQUhJLEVBR0Z2RCxRQUFRLEVBQVIsQ0FIRSxDQUFQO0FBSUQ7O0FBRUQ7QUFDTyxXQUFTSyxVQUFULENBQW9CbUUsT0FBcEIsRUFBNkI7QUFDbEMsV0FBT0EsUUFDSkMsV0FESSxDQUNRLFVBQUNsQixJQUFELEVBQU9tQixJQUFQLEVBQWdCO0FBQzNCLGFBQU8zRSxLQUFLO0FBQUE7QUFBQSxZQUFFNEYsQ0FBRjtBQUFBLFlBQUtPLENBQUw7O0FBQUEsZUFBWVAsSUFBSU8sQ0FBaEI7QUFBQSxPQUFMLEVBQXdCakMsU0FBUVMsSUFBUixFQUFjbkIsSUFBZCxDQUF4QixDQUFQO0FBQ0QsS0FISSxFQUdGdkQsUUFBUSxFQUFSLENBSEUsQ0FBUDtBQUlEOztBQUVNLFdBQVNNLE9BQVQsQ0FBaUI2RixHQUFqQixFQUFzQjtBQUMzQixXQUFPL0YsVUFBVStGLElBQUlDLEtBQUosQ0FBVSxFQUFWLEVBQWN0QixHQUFkLENBQWtCeEYsS0FBbEIsQ0FBVixFQUNKNkQsUUFESSxDQUNLLGFBQWFnRCxHQURsQixDQUFQO0FBRUQ7O0FBRU0sV0FBUzVGLE9BQVQsQ0FBaUI0RixHQUFqQixFQUFzQjtBQUMzQixXQUFPN0YsUUFBUTZGLEdBQVIsRUFDSnBHLElBREksQ0FDQztBQUFBLGFBQU93RixJQUFJYyxJQUFKLENBQVMsRUFBVCxDQUFQO0FBQUEsS0FERCxFQUVKbEQsUUFGSSxDQUVLLGFBQWFnRCxHQUZsQixDQUFQO0FBR0Q7O0FBRU0sV0FBUzNGLFVBQVQsQ0FBb0JpRixFQUFwQixFQUF3QjtBQUFFO0FBQy9CLFdBQU8sZUFBTztBQUNaLFVBQU0zQixPQUFPMkIsR0FBR3hDLEdBQUgsQ0FBT3ZCLEdBQVAsQ0FBYjtBQUNBLFVBQUlvQyxLQUFLRSxTQUFULEVBQW9CLE9BQU9oQyx1QkFBV0ssT0FBWCxDQUFtQkgsY0FBTUksSUFBTixDQUFXLEVBQVgsRUFBZVosR0FBZixDQUFuQixDQUFQO0FBQ3BCLFVBQU00RSxPQUFPOUYsV0FBV2lGLEVBQVgsRUFBZTNCLEtBQUsxQixLQUFMLENBQVcsQ0FBWCxDQUFmLENBQWI7QUFDQSxhQUFPSix1QkFBV0ssT0FBWCxDQUFtQkgsY0FBTUksSUFBTixDQUFXLENBQUN3QixLQUFLMUIsS0FBTCxDQUFXLENBQVgsQ0FBRCxFQUFnQm1FLE1BQWhCLENBQXVCRCxLQUFLbEUsS0FBTCxDQUFXLENBQVgsQ0FBdkIsQ0FBWCxFQUFrRGtFLEtBQUtsRSxLQUFMLENBQVcsQ0FBWCxDQUFsRCxDQUFuQixDQUFQO0FBQ0QsS0FMRDtBQU1EOztBQUVNLFdBQVMzQixJQUFULENBQWNnRixFQUFkLEVBQWtCZSxLQUFsQixFQUF5QjtBQUM5QixRQUFNQyxnQkFBaUIsT0FBT0QsS0FBUCxLQUFpQixXQUF4QztBQUNBLFFBQU0zRCxRQUFRLFVBQVU0QyxHQUFHNUMsS0FBYixJQUNKNEQsYUFBRCxHQUFrQixZQUFZRCxLQUE5QixHQUFzQyxFQURqQyxDQUFkO0FBRUEsV0FBT2hGLE9BQU8sZUFBTztBQUNuQixVQUFNK0QsTUFBTS9FLFdBQVdpRixFQUFYLEVBQWUvRCxHQUFmLENBQVo7QUFDQSxVQUFJK0UsYUFBSixFQUFtQjtBQUFDO0FBQ2xCLFlBQUlsQixJQUFJdkIsU0FBUixFQUFtQixPQUFPdUIsR0FBUDtBQUNuQixZQUFNbUIsZUFBZW5CLElBQUluRCxLQUFKLENBQVUsQ0FBVixFQUFhdUUsTUFBbEM7QUFDQSxlQUFRRCxpQkFBaUJGLEtBQWxCLEdBQ0hqQixHQURHLEdBRUh2RCx1QkFBV0MsT0FBWCxDQUFtQkMsY0FBTUMsTUFBTixDQUFhVSxLQUFiLEVBQW9CLHdCQUF3QjJELEtBQXhCLEdBQWdDLFFBQWhDLEdBQTJDRSxZQUEvRCxFQUE2RWhGLEdBQTdFLENBQW5CLENBRko7QUFHRDtBQUNELGFBQU82RCxHQUFQO0FBQ0QsS0FWTSxFQVVKMUMsS0FWSSxFQVVHTSxRQVZILENBVVlOLEtBVlosQ0FBUDtBQVdEOztBQUVNLFdBQVNuQyxTQUFULENBQW1CK0UsRUFBbkIsRUFBdUJlLEtBQXZCLEVBQThCO0FBQ25DLFdBQU8vRixLQUFLZ0YsRUFBTCxFQUFTZSxLQUFULEVBQ0p6RyxJQURJLENBQ0M7QUFBQSxhQUFRNkcsS0FBS1AsSUFBTCxDQUFVLEVBQVYsQ0FBUjtBQUFBLEtBREQsRUFFSmxELFFBRkksQ0FFSyxlQUFlc0MsR0FBRzVDLEtBQWxCLElBQ0UsT0FBTzJELEtBQVAsS0FBaUIsV0FBbEIsR0FBaUMsWUFBWUEsS0FBN0MsR0FBcUQsRUFEdEQsQ0FGTCxDQUFQO0FBSUQ7O0FBRU0sV0FBUzdGLEtBQVQsQ0FBZThFLEVBQWYsRUFBbUI7QUFDeEIsUUFBTTVDLFFBQVEsV0FBVzRDLEdBQUc1QyxLQUE1QjtBQUNBLFdBQU9yQixPQUFPLGVBQU87QUFDbkIsVUFBTXNDLE9BQU8yQixHQUFHeEMsR0FBSCxDQUFPdkIsR0FBUCxDQUFiO0FBQ0EsVUFBSW9DLEtBQUtFLFNBQVQsRUFBb0IsT0FBT0YsSUFBUDtBQUNwQixVQUFNd0MsT0FBTzlGLFdBQVdpRixFQUFYLEVBQWUzQixLQUFLMUIsS0FBTCxDQUFXLENBQVgsQ0FBZixDQUFiO0FBQ0EsYUFBT0osdUJBQVdLLE9BQVgsQ0FBbUJILGNBQU1JLElBQU4sQ0FBVyxDQUFDd0IsS0FBSzFCLEtBQUwsQ0FBVyxDQUFYLENBQUQsRUFBZ0JtRSxNQUFoQixDQUF1QkQsS0FBS2xFLEtBQUwsQ0FBVyxDQUFYLENBQXZCLENBQVgsRUFBa0RrRSxLQUFLbEUsS0FBTCxDQUFXLENBQVgsQ0FBbEQsQ0FBbkIsQ0FBUDtBQUNELEtBTE0sRUFLSlMsS0FMSSxFQUtHTSxRQUxILENBS1lOLEtBTFosQ0FBUDtBQU1EOztBQUVNLFdBQVNqQyxVQUFULENBQW9CNkUsRUFBcEIsRUFBd0I7QUFDN0IsV0FBTzlFLE1BQU04RSxFQUFOLEVBQ0oxRixJQURJLENBQ0M7QUFBQSxhQUFRNkcsS0FBS1AsSUFBTCxDQUFVLEVBQVYsQ0FBUjtBQUFBLEtBREQsRUFFSmxELFFBRkksQ0FFSyxnQkFBZ0JzQyxHQUFHNUMsS0FGeEIsQ0FBUDtBQUdEOztBQUVNLFdBQVNoQyxHQUFULENBQWE0RSxFQUFiLEVBQWlCb0IsWUFBakIsRUFBK0I7QUFDcEMsUUFBTUMsWUFBYSxPQUFPRCxZQUFQLEtBQXdCLFdBQTNDO0FBQ0EsUUFBTWhFLFFBQVEsU0FBUzRDLEdBQUc1QyxLQUFaLElBQ0xpRSxZQUFZLGNBQWNELFlBQWQsR0FBNkIsR0FBekMsR0FBK0MsRUFEMUMsQ0FBZDtBQUVBLFdBQU9yRixPQUFPLGVBQU87QUFDbkIsVUFBTStELE1BQU1FLEdBQUcxRixJQUFILENBQVFnSCxhQUFNQyxJQUFkLEVBQW9CL0QsR0FBcEIsQ0FBd0J2QixHQUF4QixDQUFaO0FBQ0EsVUFBSTZELElBQUkxQixTQUFSLEVBQW1CLE9BQU8wQixHQUFQO0FBQ25CLFVBQU0wQixVQUFXSCxTQUFELEdBQWNDLGFBQU1DLElBQU4sQ0FBV0gsWUFBWCxDQUFkLEdBQXlDRSxhQUFNRyxPQUFOLEVBQXpEO0FBQ0EsYUFBT2xGLHVCQUFXSyxPQUFYLENBQW1CSCxjQUFNSSxJQUFOLENBQVcyRSxPQUFYLEVBQW9CdkYsR0FBcEIsQ0FBbkIsQ0FBUDtBQUNELEtBTE0sRUFLSm1CLEtBTEksRUFLR00sUUFMSCxDQUtZTixLQUxaLENBQVA7QUFNRDs7QUFFRDtBQUNPLFdBQVMvQixPQUFULENBQWlCcUcsRUFBakIsRUFBcUI7QUFDMUIsUUFBTUMsUUFBUUQsR0FBR3BILElBQUgsQ0FBUWdILGFBQU1DLElBQWQsQ0FBZDtBQUNBLFFBQU1LLFFBQVFySCxRQUFRK0csYUFBTUcsT0FBZCxDQUFkO0FBQ0EsV0FBT0UsTUFBTTdDLE1BQU4sQ0FBYThDLEtBQWIsQ0FBUDtBQUNEOztBQUVNLFdBQVNDLGNBQVQsQ0FBdUJwRCxFQUF2QixFQUEyQkMsRUFBM0IsRUFBK0I7QUFDcEMsUUFBTXRCLFFBQVFxQixHQUFHckIsS0FBSCxHQUFXLGlCQUFYLEdBQStCc0IsR0FBR3RCLEtBQWhEO0FBQ0EsV0FBT3JCLE9BQU8sZUFBTztBQUNuQjtBQUNBLGFBQU95QyxTQUFRQyxFQUFSLEVBQVlDLEVBQVosRUFBZ0JwRSxJQUFoQixDQUFxQjtBQUFBO0FBQUEsWUFBRTRGLENBQUY7QUFBQSxZQUFLTyxDQUFMOztBQUFBLGVBQVlQLENBQVo7QUFBQSxPQUFyQixFQUFvQzFDLEdBQXBDLENBQXdDdkIsR0FBeEMsQ0FBUDtBQUNELEtBSE0sRUFHSm1CLEtBSEksRUFHR00sUUFISCxDQUdZTixLQUhaLENBQVA7QUFJRDs7O0FBRU0sV0FBUzBFLGFBQVQsQ0FBc0JyRCxFQUF0QixFQUEwQkMsRUFBMUIsRUFBOEI7QUFDbkMsUUFBTXRCLFFBQVFxQixHQUFHckIsS0FBSCxHQUFXLGdCQUFYLEdBQThCc0IsR0FBR3RCLEtBQS9DO0FBQ0EsV0FBT3JCLE9BQU8sZUFBTztBQUNuQjtBQUNBLGFBQU95QyxTQUFRQyxFQUFSLEVBQVlDLEVBQVosRUFBZ0JwRSxJQUFoQixDQUFxQjtBQUFBO0FBQUEsWUFBRTRGLENBQUY7QUFBQSxZQUFLTyxDQUFMOztBQUFBLGVBQVlBLENBQVo7QUFBQSxPQUFyQixFQUFvQ2pELEdBQXBDLENBQXdDdkIsR0FBeEMsQ0FBUDtBQUNELEtBSE0sRUFHSm1CLEtBSEksRUFHR00sUUFISCxDQUdZTixLQUhaLENBQVA7QUFJRDs7O0FBRU0sV0FBUzlCLFVBQVQsQ0FBb0J5RyxFQUFwQixFQUF3QkMsR0FBeEIsRUFBNkI7QUFDbEMsV0FBT0QsR0FBR3ZELE9BQUgsQ0FBV3hELEtBQUtnSCxJQUFJRixZQUFKLENBQWlCQyxFQUFqQixDQUFMLENBQVgsRUFBdUN6SCxJQUF2QyxDQUE0QztBQUFBO0FBQUEsVUFBRTJILENBQUY7QUFBQSxVQUFLQyxLQUFMOztBQUFBLGFBQWdCLENBQUNELENBQUQsRUFBSW5CLE1BQUosQ0FBV29CLEtBQVgsQ0FBaEI7QUFBQSxLQUE1QyxDQUFQO0FBQ0Q7O0FBRUQ7QUFDTyxXQUFTM0csTUFBVCxDQUFnQjRHLE1BQWhCLEVBQXdCQyxVQUF4QixFQUFvQztBQUN6QyxXQUFPcEgsS0FBS0UsTUFBTWlILE1BQU4sRUFBY04sYUFBZCxDQUE0QnpHLElBQUlnSCxVQUFKLENBQTVCLENBQUwsQ0FBUDtBQUNEOztBQUVNLFdBQVM1RyxPQUFULENBQWlCaUQsRUFBakIsRUFBcUJDLEVBQXJCLEVBQXlCMkQsRUFBekIsRUFBNkI7QUFDbEMsV0FBTzVELEdBQUdxRCxZQUFILENBQWdCcEQsRUFBaEIsRUFBb0JtRCxhQUFwQixDQUFrQ1EsRUFBbEMsRUFDSjNFLFFBREksQ0FDSyxhQUFhZSxHQUFHckIsS0FBaEIsR0FBd0IsR0FBeEIsR0FBOEJzQixHQUFHdEIsS0FBakMsR0FBeUMsR0FBekMsR0FBK0NpRixHQUFHakYsS0FEdkQsQ0FBUDtBQUVEOztBQUVNLFdBQVMzQixhQUFULENBQXVCc0csRUFBdkIsRUFBMkI7QUFDaEMsV0FBT3ZHLFFBQVEzQixNQUFNLEdBQU4sQ0FBUixFQUFvQmtJLEVBQXBCLEVBQXdCbEksTUFBTSxHQUFOLENBQXhCLEVBQ0o2RCxRQURJLENBQ0ssbUJBQW1CcUUsR0FBRzNFLEtBRDNCLENBQVA7QUFFRDs7QUFFTSxXQUFTMUIsS0FBVCxDQUFlNEcsSUFBZixFQUFxQlAsRUFBckIsRUFBeUI7QUFDOUIsUUFBTTNFLFFBQVEsU0FBZDtBQUNBLFdBQU9yQixPQUFPLGVBQU87QUFDbkIsVUFBTStELE1BQU1pQyxHQUFHdkUsR0FBSCxDQUFPdkIsR0FBUCxDQUFaO0FBQ0EsVUFBSTZELElBQUl2QixTQUFSLEVBQW1CLE9BQU91QixHQUFQO0FBQ25CLGFBQU93QyxLQUFLeEMsSUFBSW5ELEtBQUosQ0FBVSxDQUFWLENBQUwsRUFBbUJhLEdBQW5CLENBQXVCc0MsSUFBSW5ELEtBQUosQ0FBVSxDQUFWLENBQXZCLENBQVA7QUFDRCxLQUpNLEVBSUpTLEtBSkksRUFJR00sUUFKSCxDQUlZTixLQUpaLENBQVA7QUFLRDs7QUFFTSxXQUFTekIsSUFBVCxDQUFjb0csRUFBZCxFQUFrQlEsRUFBbEIsRUFBc0I7QUFDM0IsV0FBT1IsR0FBR3BELElBQUgsQ0FBUSxlQUFPO0FBQ3BCNEQsU0FBR3pDLEdBQUg7QUFDQSxhQUFPdkYsUUFBUXVGLEdBQVIsQ0FBUDtBQUNELEtBSE0sQ0FBUDtBQUlEOztBQUVNLFdBQVNsRSxJQUFULENBQWNtRyxFQUFkLEVBQWtCO0FBQ3ZCO0FBQ0EsV0FBT3BHLEtBQUtvRyxFQUFMLEVBQVM7QUFBQSxhQUFPUyxRQUFRQyxHQUFSLENBQVlWLEdBQUczRSxLQUFILEdBQVcsR0FBWCxHQUFpQjBDLEdBQTdCLENBQVA7QUFBQSxLQUFULENBQVA7QUFDRDs7QUFFTSxXQUFTakUsS0FBVCxDQUFlNkcsSUFBZixFQUFxQjtBQUMxQixXQUFPNUcsTUFBTWpCLFFBQVE2SCxJQUFSLENBQU4sRUFDSmhGLFFBREksQ0FDSyxXQUFXZ0YsSUFEaEIsQ0FBUDtBQUVEOztBQUVNLFdBQVM1RyxLQUFULENBQWU0RixFQUFmLEVBQW1CO0FBQ3hCLFdBQU90RyxJQUFJSixLQUFLMEUsTUFBTCxDQUFKLEVBQ0pvQyxZQURJLENBQ1NKLEVBRFQsRUFFSkcsYUFGSSxDQUVVekcsSUFBSUosS0FBSzBFLE1BQUwsQ0FBSixDQUZWLEVBR0poQyxRQUhJLENBR0ssVUFBVWdFLEdBQUd0RSxLQUhsQixDQUFQO0FBSUQ7O0FBRUQsV0FBU29ELEtBQVQsQ0FBZU4sQ0FBZixFQUFrQjtBQUNoQixXQUFPLFVBQVN5QyxFQUFULEVBQWE7QUFDbEIsYUFBTyxDQUFDekMsQ0FBRCxFQUFJWSxNQUFKLENBQVc2QixFQUFYLENBQVA7QUFDRCxLQUZEO0FBR0Q7O0FBRUQsV0FBU0MsU0FBVCxDQUFtQmIsRUFBbkIsRUFBdUJjLFFBQXZCLEVBQWlDO0FBQy9CLFdBQU85RyxPQUFPLGVBQU87QUFDbkIsVUFBTWlDLFNBQVMrRCxHQUFHdkUsR0FBSCxDQUFPdkIsR0FBUCxDQUFmO0FBQ0EsVUFBSStCLE9BQU9PLFNBQVgsRUFBc0IsT0FBT2hDLHVCQUFXQyxPQUFYLENBQW1CQyxjQUFNQyxNQUFOLENBQWFtRyxRQUFiLEVBQXVCN0UsT0FBT3JCLEtBQVAsQ0FBYSxDQUFiLENBQXZCLEVBQXdDcUIsT0FBT3JCLEtBQVAsQ0FBYSxDQUFiLENBQXhDLENBQW5CLENBQVA7QUFDdEIsYUFBT3FCLE1BQVA7QUFDRCxLQUpNLEVBSUo2RSxRQUpJLENBQVA7QUFLRDs7QUFFRDtBQUNPLFdBQVM5RyxNQUFULENBQWdCd0csRUFBaEIsRUFBb0JuRixLQUFwQixFQUEyQjtBQUNoQyxXQUFPO0FBQ0wwRixZQUFNLFFBREQ7QUFFTDFGLGtCQUZLO0FBR0xJLFNBSEssZUFHRHZCLEdBSEMsRUFHSTtBQUNQLGVBQU9zRyxHQUFHdEcsR0FBSCxDQUFQO0FBQ0QsT0FMSTtBQU1Mc0UsV0FOSyxpQkFNQ3dCLEVBTkQsRUFNSztBQUNSLGVBQU90SCxPQUFPLElBQVAsRUFBYXNILEVBQWIsQ0FBUDtBQUNBO0FBQ0QsT0FUSTtBQVVMekgsVUFWSyxnQkFVQXFGLEdBVkEsRUFVSztBQUNSO0FBQ0E7QUFDQSxlQUFPLEtBQUtoQixJQUFMLENBQVU7QUFBQSxpQkFBZXBFLFFBQVFvRixJQUFJb0QsV0FBSixDQUFSLENBQWY7QUFBQSxTQUFWLENBQVA7QUFDRCxPQWRJO0FBZUx2RSxhQWZLLG1CQWVHdUQsRUFmSCxFQWVPO0FBQ1YsZUFBT3ZELFNBQVEsSUFBUixFQUFjdUQsRUFBZCxDQUFQO0FBQ0QsT0FqQkk7QUFrQkxqRCxZQWxCSyxrQkFrQkVpRCxFQWxCRixFQWtCTTtBQUNULGVBQU9qRCxRQUFPLElBQVAsRUFBYWlELEVBQWIsQ0FBUDtBQUNELE9BcEJJO0FBcUJMRCxrQkFyQkssd0JBcUJRQyxFQXJCUixFQXFCWTtBQUNmLGVBQU9ELGNBQWEsSUFBYixFQUFtQkMsRUFBbkIsQ0FBUDtBQUNELE9BdkJJO0FBd0JMRixtQkF4QksseUJBd0JTRSxFQXhCVCxFQXdCYTtBQUNoQixlQUFPRixlQUFjLElBQWQsRUFBb0JFLEVBQXBCLENBQVA7QUFDRCxPQTFCSTtBQTJCTHBELFVBM0JLLGdCQTJCQTJELElBM0JBLEVBMkJNO0FBQ1QsZUFBTzVHLE1BQU00RyxJQUFOLEVBQVksSUFBWixDQUFQO0FBQ0QsT0E3Qkk7QUE4Qkw1RSxjQTlCSyxvQkE4QkltRixRQTlCSixFQThCYztBQUNqQixlQUFPRCxVQUFVLElBQVYsRUFBZ0JDLFFBQWhCLENBQVA7QUFDRDtBQWhDSSxLQUFQO0FBa0NEIiwiZmlsZSI6InBhcnNlcnMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuVGhlIE1JVCBMaWNlbnNlIChNSVQpXG5cbkNvcHlyaWdodCAoYykgMjAxNCBNYXJjbyBGYXVzdGluZWxsaVxuXG5QZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XG5vZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSBcIlNvZnR3YXJlXCIpLCB0byBkZWFsXG5pbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzXG50byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsXG5jb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcbmZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XG5cblRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluIGFsbFxuY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cblxuVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxuSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXG5GSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcbkFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcbkxJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXG5PVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRVxuU09GVFdBUkUuXG4qL1xuXG4vLyBjZnIuIFwiVW5kZXJzdGFuZGluZyBQYXJzZXIgQ29tYmluYXRvcnNcIiAoRiMgZm9yIEZ1biBhbmQgUHJvZml0KVxuXG5pbXBvcnQge1xuICBUdXBsZSxcbiAgUG9zaXRpb24sXG59IGZyb20gJy4vdHVwbGVzJztcbmltcG9ydCB7IE1heWJlIH0gZnJvbSAnLi9tYXliZSc7IC8vIEp1c3Qgb3IgTm90aGluZ1xuaW1wb3J0IHsgVmFsaWRhdGlvbiB9IGZyb20gJy4vdmFsaWRhdGlvbic7IC8vIFN1Y2Nlc3Mgb3IgRmFpbHVyZVxuXG5jb25zdCBjaGFyUGFyc2VyID0gY2hhciA9PiBwb3MgPT4ge1xuICBpZiAodHlwZW9mIHBvcyA9PT0gJ3N0cmluZycpIHBvcyA9IFBvc2l0aW9uLmZyb21UZXh0KHBvcyk7XG4gIGNvbnN0IG9wdENoYXIgPSBwb3MuY2hhcigpO1xuICBpZiAob3B0Q2hhci5pc05vdGhpbmcpIHJldHVybiBWYWxpZGF0aW9uLkZhaWx1cmUoVHVwbGUuVHJpcGxlKCdjaGFyUGFyc2VyJywgJ25vIG1vcmUgaW5wdXQnLCBwb3MpKTtcbiAgaWYgKG9wdENoYXIudmFsdWUgPT09IGNoYXIpIHJldHVybiBWYWxpZGF0aW9uLlN1Y2Nlc3MoVHVwbGUuUGFpcihjaGFyLCBwb3MuaW5jclBvcygpKSk7XG4gIHJldHVybiBWYWxpZGF0aW9uLkZhaWx1cmUoVHVwbGUuVHJpcGxlKCdjaGFyUGFyc2VyJywgJ3dhbnRlZCAnICsgY2hhciArICc7IGdvdCAnICsgb3B0Q2hhci52YWx1ZSwgcG9zKSk7XG59O1xuXG5jb25zdCBkaWdpdFBhcnNlciA9IGRpZ2l0ID0+IHBvcyA9PiB7XG4gIGlmICh0eXBlb2YgcG9zID09PSAnc3RyaW5nJykgcG9zID0gUG9zaXRpb24uZnJvbVRleHQocG9zKTtcbiAgY29uc3Qgb3B0Q2hhciA9IHBvcy5jaGFyKCk7XG4gIGlmIChvcHRDaGFyLmlzTm90aGluZykgcmV0dXJuIFZhbGlkYXRpb24uRmFpbHVyZShUdXBsZS5UcmlwbGUoJ2RpZ2l0UGFyc2VyJywgJ25vIG1vcmUgaW5wdXQnLCBwb3MpKTtcbiAgaWYgKHBhcnNlSW50KG9wdENoYXIudmFsdWUsIDEwKSA9PT0gZGlnaXQpIHJldHVybiBWYWxpZGF0aW9uLlN1Y2Nlc3MoVHVwbGUuUGFpcihkaWdpdCwgcG9zLmluY3JQb3MoKSkpO1xuICByZXR1cm4gVmFsaWRhdGlvbi5GYWlsdXJlKFR1cGxlLlRyaXBsZSgnZGlnaXRQYXJzZXInLCAnd2FudGVkICcgKyBkaWdpdCArICc7IGdvdCAnICsgb3B0Q2hhci52YWx1ZSwgcG9zKSk7XG59O1xuXG5jb25zdCBwcmVkaWNhdGVCYXNlZFBhcnNlciA9IChwcmVkLCBsYWJlbCkgPT4gcG9zID0+IHtcbiAgaWYgKHR5cGVvZiBwb3MgPT09ICdzdHJpbmcnKSBwb3MgPSBQb3NpdGlvbi5mcm9tVGV4dChwb3MpO1xuICBjb25zdCBvcHRDaGFyID0gcG9zLmNoYXIoKTtcbiAgaWYgKG9wdENoYXIuaXNOb3RoaW5nKSByZXR1cm4gVmFsaWRhdGlvbi5GYWlsdXJlKFR1cGxlLlRyaXBsZShsYWJlbCwgJ25vIG1vcmUgaW5wdXQnLCBwb3MpKTtcbiAgaWYgKHByZWQob3B0Q2hhci52YWx1ZSkpIHJldHVybiBWYWxpZGF0aW9uLlN1Y2Nlc3MoVHVwbGUuUGFpcihvcHRDaGFyLnZhbHVlLCBwb3MuaW5jclBvcygpKSk7XG4gIHJldHVybiBWYWxpZGF0aW9uLkZhaWx1cmUoVHVwbGUuVHJpcGxlKGxhYmVsLCAndW5leHBlY3RlZCBjaGFyOiAnICsgb3B0Q2hhci52YWx1ZSwgcG9zKSk7XG59O1xuXG5leHBvcnQgeyBjaGFyUGFyc2VyLCBkaWdpdFBhcnNlciwgcHJlZGljYXRlQmFzZWRQYXJzZXIgfTtcblxuZXhwb3J0IGNvbnN0IHN0YXJ0T2ZJbnB1dFAgPVxuICBwYXJzZXIocG9zID0+IChwb3MuZGVjclBvcygpLmNoYXIoKS5pc05vdGhpbmcpXG4gICAgPyBzdWNjZWVkUC5ydW4ocG9zKVxuICAgIDogZmFpbFAucnVuKHBvcykpLnNldExhYmVsKCdeJyk7XG5cbmV4cG9ydCBjb25zdCBub3RTdGFydE9mSW5wdXRQID1cbiAgcGFyc2VyKHBvcyA9PiAocG9zLmRlY3JQb3MoKS5jaGFyKCkuaXNKdXN0KVxuICAgID8gc3VjY2VlZFAucnVuKHBvcylcbiAgICA6IGZhaWxQLnJ1bihwb3MpKS5zZXRMYWJlbCgnbm90XicpO1xuXG5leHBvcnQgY29uc3QgZW5kT2ZJbnB1dFAgPVxuICBwYXJzZXIocG9zID0+IChwb3MucmVzdCgpID09PSAnJylcbiAgICA/IHN1Y2NlZWRQLnJ1bihwb3MpXG4gICAgOiBmYWlsUC5ydW4ocG9zKSkuc2V0TGFiZWwoJyQnKTtcblxuZXhwb3J0IGNvbnN0IG5vdEVuZE9mSW5wdXRQID1cbiAgcGFyc2VyKHBvcyA9PiAocG9zLnJlc3QoKSAhPT0gJycpXG4gICAgPyBzdWNjZWVkUC5ydW4ocG9zKVxuICAgIDogZmFpbFAucnVuKHBvcykpLnNldExhYmVsKCdub3QkJyk7XG5cbmV4cG9ydCBmdW5jdGlvbiBwY2hhcihjaGFyKSB7XG4gIGNvbnN0IGxhYmVsID0gJ3BjaGFyXycgKyBjaGFyO1xuICBjb25zdCByZXN1bHQgPSBwb3MgPT4gY2hhclBhcnNlcihjaGFyKShwb3MpO1xuICByZXR1cm4gcGFyc2VyKHJlc3VsdCwgbGFiZWwpLnNldExhYmVsKGxhYmVsKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHBkaWdpdChkaWdpdCkge1xuICByZXR1cm4gcGFyc2VyKHBvcyA9PiBkaWdpdFBhcnNlcihkaWdpdCkocG9zKSwgJ3BkaWdpdF8nICsgZGlnaXQpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcHJlY2VkZWRCeVAoYzEsIGMyKSB7XG4gIGNvbnN0IGxhYmVsID0gYzIgKyAnIHByZWNlZGVkIGJ5ICcgKyBjMTtcbiAgcmV0dXJuIHBhcnNlcihwb3MgPT4ge1xuICAgIGNvbnN0IHJlczIgPSBwY2hhcihjMikucnVuKHBvcyk7XG4gICAgaWYgKHJlczIuaXNTdWNjZXNzKSB7XG4gICAgICBjb25zdCByZXMxID0gcGNoYXIoYzEpLnJ1bihyZXMyLnZhbHVlWzFdLmRlY3JQb3MoMikpO1xuICAgICAgaWYgKHJlczEuaXNTdWNjZXNzKSB7XG4gICAgICAgIHJldHVybiBWYWxpZGF0aW9uLlN1Y2Nlc3MoVHVwbGUuUGFpcihjMiwgcmVzMi52YWx1ZVsxXSkpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIFZhbGlkYXRpb24uRmFpbHVyZShUdXBsZS5UcmlwbGUobGFiZWwsIHJlczEudmFsdWVbMV0sIHJlczEudmFsdWVbMl0pKTtcbiAgICB9XG4gICAgcmV0dXJuIFZhbGlkYXRpb24uRmFpbHVyZShUdXBsZS5UcmlwbGUobGFiZWwsIHJlczIudmFsdWVbMV0sIHJlczIudmFsdWVbMl0pKTtcbiAgfSwgbGFiZWwpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbm90UHJlY2VkZWRCeVAoYzEsIGMyKSB7XG4gIGNvbnN0IGxhYmVsID0gYzIgKyAnIG5vdCBwcmVjZWRlZCBieSAnICsgYzE7XG4gIHJldHVybiBwYXJzZXIocG9zID0+IHtcbiAgICBjb25zdCByZXMyID0gcGNoYXIoYzIpLnJ1bihwb3MpO1xuICAgIGlmIChyZXMyLmlzU3VjY2Vzcykge1xuICAgICAgbGV0IHJlczEgPSBWYWxpZGF0aW9uLkZhaWx1cmUoKTtcbiAgICAgIHRyeSB7IC8vIGNyYXNoIGdvaW5nIGJhY2sgYmV5b25kIHN0YXJ0IG9mIGlucHV0ID0+IG9rXG4gICAgICAgIHJlczEgPSBwY2hhcihjMSkucnVuKHJlczIudmFsdWVbMV0uZGVjclBvcygyKSk7XG4gICAgICB9IGNhdGNoIChlcnIpIHt9XG4gICAgICBpZiAocmVzMS5pc0ZhaWx1cmUpIHtcbiAgICAgICAgcmV0dXJuIFZhbGlkYXRpb24uU3VjY2VzcyhUdXBsZS5QYWlyKGMyLCByZXMyLnZhbHVlWzFdKSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gVmFsaWRhdGlvbi5GYWlsdXJlKFR1cGxlLlRyaXBsZShsYWJlbCwgcmVzMS52YWx1ZVsxXSwgcmVzMS52YWx1ZVsyXSkpO1xuICAgIH1cbiAgICByZXR1cm4gVmFsaWRhdGlvbi5GYWlsdXJlKFR1cGxlLlRyaXBsZShsYWJlbCwgcmVzMi52YWx1ZVsxXSwgcmVzMi52YWx1ZVsyXSkpO1xuICB9LCBsYWJlbCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBmb2xsb3dlZEJ5UChjMSwgYzIpIHtcbiAgY29uc3QgbGFiZWwgPSBjMiArICcgZm9sbG93ZWQgYnkgJyArIGMxO1xuICByZXR1cm4gcGFyc2VyKHBvcyA9PiB7XG4gICAgY29uc3QgcmVzMiA9IHBjaGFyKGMyKS5ydW4ocG9zKTtcbiAgICBpZiAocmVzMi5pc1N1Y2Nlc3MpIHtcbiAgICAgIGNvbnN0IHJlczEgPSBwY2hhcihjMSkucnVuKHJlczIudmFsdWVbMV0pOyAvLyBubyBuZWVkIHRvIGluY3JlbWVudCBwb3NcbiAgICAgIGlmIChyZXMxLmlzU3VjY2Vzcykge1xuICAgICAgICByZXR1cm4gVmFsaWRhdGlvbi5TdWNjZXNzKFR1cGxlLlBhaXIoYzIsIHJlczIudmFsdWVbMV0pKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBWYWxpZGF0aW9uLkZhaWx1cmUoVHVwbGUuVHJpcGxlKGxhYmVsLCByZXMxLnZhbHVlWzFdLCByZXMxLnZhbHVlWzJdKSk7XG4gICAgfVxuICAgIHJldHVybiBWYWxpZGF0aW9uLkZhaWx1cmUoVHVwbGUuVHJpcGxlKGxhYmVsLCByZXMyLnZhbHVlWzFdLCByZXMyLnZhbHVlWzJdKSk7XG4gIH0sIGxhYmVsKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG5vdEZvbGxvd2VkQnlQKGMxLCBjMikge1xuICBjb25zdCBsYWJlbCA9IGMyICsgJyBub3QgZm9sbG93ZWQgYnkgJyArIGMxO1xuICByZXR1cm4gcGFyc2VyKHBvcyA9PiB7XG4gICAgY29uc3QgcmVzMiA9IHBjaGFyKGMyKS5ydW4ocG9zKTtcbiAgICBpZiAocmVzMi5pc1N1Y2Nlc3MpIHtcbiAgICAgIGxldCByZXMxID0gVmFsaWRhdGlvbi5GYWlsdXJlKCk7XG4gICAgICB0cnkgeyAvLyBjcmFzaCBnb2luZyBkb3duIGJleW9uZCBlbmQgb2YgaW5wdXQgPT4gb2tcbiAgICAgICAgcmVzMSA9IHBjaGFyKGMxKS5ydW4ocmVzMi52YWx1ZVsxXSk7XG4gICAgICB9IGNhdGNoIChlcnIpIHt9XG4gICAgICBpZiAocmVzMS5pc0ZhaWx1cmUpIHtcbiAgICAgICAgcmV0dXJuIFZhbGlkYXRpb24uU3VjY2VzcyhUdXBsZS5QYWlyKGMyLCByZXMyLnZhbHVlWzFdKSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gVmFsaWRhdGlvbi5GYWlsdXJlKFR1cGxlLlRyaXBsZShsYWJlbCwgcmVzMS52YWx1ZVsxXSwgcmVzMS52YWx1ZVsyXSkpO1xuICAgIH1cbiAgICByZXR1cm4gVmFsaWRhdGlvbi5GYWlsdXJlKFR1cGxlLlRyaXBsZShsYWJlbCwgcmVzMi52YWx1ZVsxXSwgcmVzMi52YWx1ZVsyXSkpO1xuICB9LCBsYWJlbCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhbmRUaGVuKHAxLCBwMikge1xuICBjb25zdCBsYWJlbCA9IHAxLmxhYmVsICsgJyBhbmRUaGVuICcgKyBwMi5sYWJlbDtcbiAgcmV0dXJuIHBhcnNlcihwb3MgPT4ge1xuICAgIGNvbnN0IHJlczEgPSBwMS5ydW4ocG9zKTtcbiAgICBpZiAocmVzMS5pc1N1Y2Nlc3MpIHtcbiAgICAgIGNvbnN0IHJlczIgPSBwMi5ydW4ocmVzMS52YWx1ZVsxXSk7XG4gICAgICBpZiAocmVzMi5pc1N1Y2Nlc3MpIHtcbiAgICAgICAgcmV0dXJuIFZhbGlkYXRpb24uU3VjY2VzcyhUdXBsZS5QYWlyKFR1cGxlLlBhaXIocmVzMS52YWx1ZVswXSwgcmVzMi52YWx1ZVswXSksIHJlczIudmFsdWVbMV0pKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBWYWxpZGF0aW9uLkZhaWx1cmUoVHVwbGUuVHJpcGxlKGxhYmVsLCByZXMyLnZhbHVlWzFdLCByZXMyLnZhbHVlWzJdKSk7XG4gICAgfVxuICAgIHJldHVybiBWYWxpZGF0aW9uLkZhaWx1cmUoVHVwbGUuVHJpcGxlKGxhYmVsLCByZXMxLnZhbHVlWzFdLCByZXMxLnZhbHVlWzJdKSk7XG4gIH0sIGxhYmVsKTtcbn1cblxuLy8gdXNpbmcgYmluZFxuZXhwb3J0IGZ1bmN0aW9uIGFuZFRoZW5CaW5kKHAxLCBwMikge1xuICByZXR1cm4gcDEuYmluZChwYXJzZWRWYWx1ZTEgPT4ge1xuICAgIHJldHVybiBwMi5iaW5kKHBhcnNlZFZhbHVlMiA9PiB7XG4gICAgICByZXR1cm4gcmV0dXJuUChUdXBsZS5QYWlyKHBhcnNlZFZhbHVlMSwgcGFyc2VkVmFsdWUyKSk7XG4gICAgfSk7XG4gIH0pLnNldExhYmVsKHAxLmxhYmVsICsgJyBhbmRUaGVuICcgKyBwMi5sYWJlbCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBvckVsc2UocDEsIHAyKSB7XG4gIGNvbnN0IGxhYmVsID0gcDEubGFiZWwgKyAnIG9yRWxzZSAnICsgcDIubGFiZWw7XG4gIHJldHVybiBwYXJzZXIocG9zID0+IHtcbiAgICBjb25zdCByZXMxID0gcDEucnVuKHBvcyk7XG4gICAgaWYgKHJlczEuaXNTdWNjZXNzKSByZXR1cm4gcmVzMTtcbiAgICBjb25zdCByZXMyID0gcDIucnVuKHBvcyk7XG4gICAgaWYgKHJlczIuaXNTdWNjZXNzKSByZXR1cm4gcmVzMjtcbiAgICByZXR1cm4gVmFsaWRhdGlvbi5GYWlsdXJlKFR1cGxlLlRyaXBsZShsYWJlbCwgcmVzMi52YWx1ZVsxXSwgcmVzMi52YWx1ZVsyXSkpO1xuICB9LCBsYWJlbCkuc2V0TGFiZWwobGFiZWwpO1xufVxuXG5leHBvcnQgY29uc3QgZmFpbFAgPSBwYXJzZXIocG9zID0+IFZhbGlkYXRpb24uRmFpbHVyZShUdXBsZS5UcmlwbGUoJycsICdmYWlsJywgcG9zKSkpO1xuXG5leHBvcnQgY29uc3Qgc3VjY2VlZFAgPSBwYXJzZXIocG9zID0+IFZhbGlkYXRpb24uU3VjY2VzcyhUdXBsZS5QYWlyKCcnLCBwb3MpLCAnc3VjY2VlZCcpKTtcblxuZXhwb3J0IGZ1bmN0aW9uIGNob2ljZShwYXJzZXJzKSB7XG4gIHJldHVybiBwYXJzZXJzLnJlZHVjZVJpZ2h0KChyZXN0LCBjdXJyKSA9PiBvckVsc2UoY3VyciwgcmVzdCksIGZhaWxQKVxuICAgIC5zZXRMYWJlbCgnY2hvaWNlICcgKyBwYXJzZXJzLnJlZHVjZSgoYWNjLCBjdXJyKSA9PiBhY2MgKyAnLycgKyBjdXJyLmxhYmVsLCAnJykpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYW55T2YoY2hhcnNBcnJheSkge1xuICByZXR1cm4gY2hvaWNlKGNoYXJzQXJyYXkubWFwKHBjaGFyKSlcbiAgICAuc2V0TGFiZWwoJ2FueU9mICcgKyBjaGFyc0FycmF5LnJlZHVjZSgoYWNjLCBjdXJyKSA9PiBhY2MgKyBjdXJyLCAnJykpO1xufVxuXG5leHBvcnQgY29uc3QgbG93ZXJjYXNlUCA9IGFueU9mKFsnYScsICdiJywgJ2MnLCAnZCcsICdlJywgJ2YnLCAnZycsICdoJywgJ2knLCAnaicsICdrJywgJ2wnLCAnbScsICduJywgJ28nLCAncCcsICdxJywgJ3InLCAncycsICd0JywgJ3UnLCAndicsICd3JywgJ3gnLCAneScsICd6J10pLnNldExhYmVsKCdsb3dlcmNhc2VQJyk7XG5leHBvcnQgY29uc3QgdXBwZXJjYXNlUCA9IGFueU9mKFsnQScsICdCJywgJ0MnLCAnRCcsICdFJywgJ0YnLCAnRycsICdIJywgJ0knLCAnSicsICdLJywgJ0wnLCAnTScsICdOJywgJ08nLCAnUCcsICdRJywgJ1InLCAnUycsICdUJywgJ1UnLCAnVicsICdXJywgJ1gnLCAnWScsICdaJ10pLnNldExhYmVsKCd1cHBlcmNhc2VQJyk7XG5leHBvcnQgY29uc3QgbGV0dGVyUCA9IGxvd2VyY2FzZVAub3JFbHNlKHVwcGVyY2FzZVApLnNldExhYmVsKCdsZXR0ZXJQJyk7XG5leHBvcnQgY29uc3QgZGlnaXRQID0gYW55T2YoWycwJywgJzEnLCAnMicsICczJywgJzQnLCAnNScsICc2JywgJzcnLCAnOCcsICc5J10pLnNldExhYmVsKCdkaWdpdFAnKTtcbmV4cG9ydCBjb25zdCB3aGl0ZVAgPSBhbnlPZihbJyAnLCAnXFx0JywgJ1xcbicsICdcXHInXSkuc2V0TGFiZWwoJ3doaXRlUCcpO1xuXG5leHBvcnQgZnVuY3Rpb24gZm1hcChmYWIsIHBhcnNlcjEpIHtcbiAgY29uc3QgbGFiZWwgPSBwYXJzZXIxLmxhYmVsICsgJyBmbWFwICcgKyBmYWIudG9TdHJpbmcoKTtcbiAgcmV0dXJuIHBhcnNlcihwb3MgPT4ge1xuICAgIGNvbnN0IHJlcyA9IHBhcnNlcjEucnVuKHBvcyk7XG4gICAgaWYgKHJlcy5pc1N1Y2Nlc3MpIHJldHVybiBWYWxpZGF0aW9uLlN1Y2Nlc3MoVHVwbGUuUGFpcihmYWIocmVzLnZhbHVlWzBdKSwgcmVzLnZhbHVlWzFdKSk7XG4gICAgcmV0dXJuIFZhbGlkYXRpb24uRmFpbHVyZShUdXBsZS5UcmlwbGUobGFiZWwsIHJlcy52YWx1ZVsxXSwgcmVzLnZhbHVlWzJdKSk7XG4gIH0sIGxhYmVsKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJldHVyblAodmFsdWUpIHtcbiAgcmV0dXJuIHBhcnNlcihwb3MgPT4gVmFsaWRhdGlvbi5TdWNjZXNzKFR1cGxlLlBhaXIodmFsdWUsIHBvcykpLCB2YWx1ZSk7XG59XG5cbi8vIHBhcnNlcihhIC0+IGIpIC0+IHBhcnNlcihhKSAtPiBwYXJzZXIoYilcbmV4cG9ydCBmdW5jdGlvbiBhcHBseVB4KGZQKSB7XG4gIHJldHVybiBmdW5jdGlvbih4UCkge1xuICAgIHJldHVybiBhbmRUaGVuKGZQLCB4UCkuZm1hcCgoW2YsIHhdKSA9PiBmKHgpKTtcbiAgfTtcbn1cblxuLy8gdXNpbmcgYmluZFxuZXhwb3J0IGZ1bmN0aW9uIGFwcGx5UChmUCkge1xuICByZXR1cm4gZnVuY3Rpb24oeFApIHtcbiAgICByZXR1cm4gZlAuYmluZChwYXJzZWRWYWx1ZWYgPT4ge1xuICAgICAgcmV0dXJuIHhQLmJpbmQocGFyc2VkVmFsdWV4ID0+IHtcbiAgICAgICAgcmV0dXJuIHJldHVyblAocGFyc2VkVmFsdWVmKHBhcnNlZFZhbHVleCkpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBsaWZ0MihmYWFiKSB7XG4gIHJldHVybiBmdW5jdGlvbihwYXJzZXIxKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKHBhcnNlcjIpIHtcbiAgICAgIC8vIHJldHVybiBhcHBseVAoYXBwbHlQKHJldHVyblAoZmFhYikpKHBhcnNlcjEpKShwYXJzZXIyKTtcbiAgICAgIHJldHVybiByZXR1cm5QKGZhYWIpLmFwcGx5KHBhcnNlcjEpLmFwcGx5KHBhcnNlcjIpOyAvLyB1c2luZyBpbnN0YW5jZSBtZXRob2RzXG4gICAgfTtcbiAgfTtcbn1cblxuLy8gdXNpbmcgbGlmdDIoY29ucylcbmV4cG9ydCBmdW5jdGlvbiBzZXF1ZW5jZVAocGFyc2Vycykge1xuICByZXR1cm4gcGFyc2Vyc1xuICAgIC5yZWR1Y2VSaWdodCgocmVzdCwgY3VycikgPT4ge1xuICAgICAgcmV0dXJuIGxpZnQyKF9jb25zKShjdXJyKShyZXN0KTtcbiAgICB9LCByZXR1cm5QKFtdKSk7XG59XG5cbi8vIHVzaW5nIG5haXZlIGFuZFRoZW4gJiYgZm1hcCAtLT4gcmV0dXJucyBzdHJpbmdzLCBub3QgYXJyYXlzIVxuZXhwb3J0IGZ1bmN0aW9uIHNlcXVlbmNlUDIocGFyc2Vycykge1xuICByZXR1cm4gcGFyc2Vyc1xuICAgIC5yZWR1Y2VSaWdodCgocmVzdCwgY3VycikgPT4ge1xuICAgICAgcmV0dXJuIGZtYXAoKFt4LCB5XSkgPT4geCArIHksIGFuZFRoZW4oY3VyciwgcmVzdCkpO1xuICAgIH0sIHJldHVyblAoJycpKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHBzdHJpbmcoc3RyKSB7XG4gIHJldHVybiBzZXF1ZW5jZVAoc3RyLnNwbGl0KCcnKS5tYXAocGNoYXIpKVxuICAgIC5zZXRMYWJlbCgncHN0cmluZyAnICsgc3RyKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHN0cmluZ1Aoc3RyKSB7XG4gIHJldHVybiBwc3RyaW5nKHN0cilcbiAgICAuZm1hcChyZXMgPT4gcmVzLmpvaW4oJycpKVxuICAgIC5zZXRMYWJlbCgnc3RyaW5nUCAnICsgc3RyKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHplcm9Pck1vcmUoeFApIHsgLy8gemVyb09yTW9yZSA6OiBwIGEgLT4gW2FdIC0+IHRyeSBbYV0gPSBwIGEgLT4gcCBbYV1cbiAgcmV0dXJuIHBvcyA9PiB7XG4gICAgY29uc3QgcmVzMSA9IHhQLnJ1bihwb3MpO1xuICAgIGlmIChyZXMxLmlzRmFpbHVyZSkgcmV0dXJuIFZhbGlkYXRpb24uU3VjY2VzcyhUdXBsZS5QYWlyKFtdLCBwb3MpKTtcbiAgICBjb25zdCByZXNOID0gemVyb09yTW9yZSh4UCkocmVzMS52YWx1ZVsxXSk7XG4gICAgcmV0dXJuIFZhbGlkYXRpb24uU3VjY2VzcyhUdXBsZS5QYWlyKFtyZXMxLnZhbHVlWzBdXS5jb25jYXQocmVzTi52YWx1ZVswXSksIHJlc04udmFsdWVbMV0pKTtcbiAgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1hbnkoeFAsIHRpbWVzKSB7XG4gIGNvbnN0IHRpbWVzX2RlZmluZWQgPSAodHlwZW9mIHRpbWVzICE9PSAndW5kZWZpbmVkJyk7XG4gIGNvbnN0IGxhYmVsID0gJ21hbnkgJyArIHhQLmxhYmVsXG4gICAgICAgICsgKCh0aW1lc19kZWZpbmVkKSA/ICcgdGltZXM9JyArIHRpbWVzIDogJycpO1xuICByZXR1cm4gcGFyc2VyKHBvcyA9PiB7XG4gICAgY29uc3QgcmVzID0gemVyb09yTW9yZSh4UCkocG9zKTtcbiAgICBpZiAodGltZXNfZGVmaW5lZCkgey8vIGRlYnVnZ2VyO1xuICAgICAgaWYgKHJlcy5pc0ZhaWx1cmUpIHJldHVybiByZXM7XG4gICAgICBjb25zdCByZXN1bHRMZW5ndGggPSByZXMudmFsdWVbMF0ubGVuZ3RoO1xuICAgICAgcmV0dXJuIChyZXN1bHRMZW5ndGggPT09IHRpbWVzKVxuICAgICAgICA/IHJlc1xuICAgICAgICA6IFZhbGlkYXRpb24uRmFpbHVyZShUdXBsZS5UcmlwbGUobGFiZWwsICd0aW1lcyBwYXJhbSB3YW50ZWQgJyArIHRpbWVzICsgJzsgZ290ICcgKyByZXN1bHRMZW5ndGgsIHBvcykpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzO1xuICB9LCBsYWJlbCkuc2V0TGFiZWwobGFiZWwpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbWFueUNoYXJzKHhQLCB0aW1lcykge1xuICByZXR1cm4gbWFueSh4UCwgdGltZXMpXG4gICAgLmZtYXAoYXJyYSA9PiBhcnJhLmpvaW4oJycpKVxuICAgIC5zZXRMYWJlbCgnbWFueUNoYXJzICcgKyB4UC5sYWJlbFxuICAgICAgICAgICAgKyAoKHR5cGVvZiB0aW1lcyAhPT0gJ3VuZGVmaW5lZCcpID8gJyB0aW1lcz0nICsgdGltZXMgOiAnJykpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbWFueTEoeFApIHtcbiAgY29uc3QgbGFiZWwgPSAnbWFueTEgJyArIHhQLmxhYmVsO1xuICByZXR1cm4gcGFyc2VyKHBvcyA9PiB7XG4gICAgY29uc3QgcmVzMSA9IHhQLnJ1bihwb3MpO1xuICAgIGlmIChyZXMxLmlzRmFpbHVyZSkgcmV0dXJuIHJlczE7XG4gICAgY29uc3QgcmVzTiA9IHplcm9Pck1vcmUoeFApKHJlczEudmFsdWVbMV0pO1xuICAgIHJldHVybiBWYWxpZGF0aW9uLlN1Y2Nlc3MoVHVwbGUuUGFpcihbcmVzMS52YWx1ZVswXV0uY29uY2F0KHJlc04udmFsdWVbMF0pLCByZXNOLnZhbHVlWzFdKSk7XG4gIH0sIGxhYmVsKS5zZXRMYWJlbChsYWJlbCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtYW55Q2hhcnMxKHhQKSB7XG4gIHJldHVybiBtYW55MSh4UClcbiAgICAuZm1hcChhcnJhID0+IGFycmEuam9pbignJykpXG4gICAgLnNldExhYmVsKCdtYW55Q2hhcnMxICcgKyB4UC5sYWJlbCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBvcHQoeFAsIGRlZmF1bHRWYWx1ZSkge1xuICBjb25zdCBpc0RlZmF1bHQgPSAodHlwZW9mIGRlZmF1bHRWYWx1ZSAhPT0gJ3VuZGVmaW5lZCcpO1xuICBjb25zdCBsYWJlbCA9ICdvcHQgJyArIHhQLmxhYmVsXG4gICAgICAgICsgKGlzRGVmYXVsdCA/ICcoZGVmYXVsdD0nICsgZGVmYXVsdFZhbHVlICsgJyknIDogJycpO1xuICByZXR1cm4gcGFyc2VyKHBvcyA9PiB7XG4gICAgY29uc3QgcmVzID0geFAuZm1hcChNYXliZS5KdXN0KS5ydW4ocG9zKTtcbiAgICBpZiAocmVzLmlzU3VjY2VzcykgcmV0dXJuIHJlcztcbiAgICBjb25zdCBvdXRjb21lID0gKGlzRGVmYXVsdCkgPyBNYXliZS5KdXN0KGRlZmF1bHRWYWx1ZSkgOiBNYXliZS5Ob3RoaW5nKCk7XG4gICAgcmV0dXJuIFZhbGlkYXRpb24uU3VjY2VzcyhUdXBsZS5QYWlyKG91dGNvbWUsIHBvcykpO1xuICB9LCBsYWJlbCkuc2V0TGFiZWwobGFiZWwpO1xufVxuXG4vLyBvcHQgZnJvbSB0aGUgYm9vayAtIHdvcmtzIG9rLCBidXQgdG9TdHJpbmcoKSBnaXZlcyBzdHJhbmdlIHJlc3VsdHNcbmV4cG9ydCBmdW5jdGlvbiBvcHRCb29rKHBYKSB7XG4gIGNvbnN0IHNvbWVQID0gcFguZm1hcChNYXliZS5KdXN0KTtcbiAgY29uc3Qgbm9uZVAgPSByZXR1cm5QKE1heWJlLk5vdGhpbmcpO1xuICByZXR1cm4gc29tZVAub3JFbHNlKG5vbmVQKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRpc2NhcmRTZWNvbmQocDEsIHAyKSB7XG4gIGNvbnN0IGxhYmVsID0gcDEubGFiZWwgKyAnIGRpc2NhcmRTZWNvbmQgJyArIHAyLmxhYmVsO1xuICByZXR1cm4gcGFyc2VyKHBvcyA9PiB7XG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXVudXNlZC12YXJzXG4gICAgcmV0dXJuIGFuZFRoZW4ocDEsIHAyKS5mbWFwKChbeCwgeV0pID0+IHgpLnJ1bihwb3MpO1xuICB9LCBsYWJlbCkuc2V0TGFiZWwobGFiZWwpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZGlzY2FyZEZpcnN0KHAxLCBwMikge1xuICBjb25zdCBsYWJlbCA9IHAxLmxhYmVsICsgJyBkaXNjYXJkRmlyc3QgJyArIHAyLmxhYmVsO1xuICByZXR1cm4gcGFyc2VyKHBvcyA9PiB7XG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXVudXNlZC12YXJzXG4gICAgcmV0dXJuIGFuZFRoZW4ocDEsIHAyKS5mbWFwKChbeCwgeV0pID0+IHkpLnJ1bihwb3MpO1xuICB9LCBsYWJlbCkuc2V0TGFiZWwobGFiZWwpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc2VwQnkxQm9vayhweCwgc2VwKSB7XG4gIHJldHVybiBweC5hbmRUaGVuKG1hbnkoc2VwLmRpc2NhcmRGaXJzdChweCkpKS5mbWFwKChbciwgcmxpc3RdKSA9PiBbcl0uY29uY2F0KHJsaXN0KSk7XG59XG5cbi8vIG15IHZlcnNpb24gd29ya3MganVzdCBmaW5lLi4uXG5leHBvcnQgZnVuY3Rpb24gc2VwQnkxKHZhbHVlUCwgc2VwYXJhdG9yUCkge1xuICByZXR1cm4gbWFueShtYW55MSh2YWx1ZVApLmRpc2NhcmRTZWNvbmQob3B0KHNlcGFyYXRvclApKSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBiZXR3ZWVuKHAxLCBwMiwgcDMpIHtcbiAgcmV0dXJuIHAxLmRpc2NhcmRGaXJzdChwMikuZGlzY2FyZFNlY29uZChwMylcbiAgICAuc2V0TGFiZWwoJ2JldHdlZW4gJyArIHAxLmxhYmVsICsgJy8nICsgcDIubGFiZWwgKyAnLycgKyBwMy5sYWJlbCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBiZXR3ZWVuUGFyZW5zKHB4KSB7XG4gIHJldHVybiBiZXR3ZWVuKHBjaGFyKCcoJyksIHB4LCBwY2hhcignKScpKVxuICAgIC5zZXRMYWJlbCgnYmV0d2VlblBhcmVucyAnICsgcHgubGFiZWwpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYmluZFAoZmFtYiwgcHgpIHtcbiAgY29uc3QgbGFiZWwgPSAndW5rbm93bic7XG4gIHJldHVybiBwYXJzZXIocG9zID0+IHtcbiAgICBjb25zdCByZXMgPSBweC5ydW4ocG9zKTtcbiAgICBpZiAocmVzLmlzRmFpbHVyZSkgcmV0dXJuIHJlcztcbiAgICByZXR1cm4gZmFtYihyZXMudmFsdWVbMF0pLnJ1bihyZXMudmFsdWVbMV0pO1xuICB9LCBsYWJlbCkuc2V0TGFiZWwobGFiZWwpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdGFwUChweCwgZm4pIHtcbiAgcmV0dXJuIHB4LmJpbmQocmVzID0+IHtcbiAgICBmbihyZXMpO1xuICAgIHJldHVybiByZXR1cm5QKHJlcyk7XG4gIH0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbG9nUChweCkge1xuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tY29uc29sZVxuICByZXR1cm4gdGFwUChweCwgcmVzID0+IGNvbnNvbGUubG9nKHB4LmxhYmVsICsgJzonICsgcmVzKSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwd29yZCh3b3JkKSB7XG4gIHJldHVybiB0cmltUChwc3RyaW5nKHdvcmQpKVxuICAgIC5zZXRMYWJlbCgncHdvcmQgJyArIHdvcmQpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdHJpbVAocFgpIHtcbiAgcmV0dXJuIG9wdChtYW55KHdoaXRlUCkpXG4gICAgLmRpc2NhcmRGaXJzdChwWClcbiAgICAuZGlzY2FyZFNlY29uZChvcHQobWFueSh3aGl0ZVApKSlcbiAgICAuc2V0TGFiZWwoJ3RyaW0gJyArIHBYLmxhYmVsKTtcbn1cblxuZnVuY3Rpb24gX2NvbnMoeCkge1xuICByZXR1cm4gZnVuY3Rpb24oeHMpIHtcbiAgICByZXR1cm4gW3hdLmNvbmNhdCh4cyk7XG4gIH07XG59XG5cbmZ1bmN0aW9uIF9zZXRMYWJlbChweCwgbmV3TGFiZWwpIHtcbiAgcmV0dXJuIHBhcnNlcihwb3MgPT4ge1xuICAgIGNvbnN0IHJlc3VsdCA9IHB4LnJ1bihwb3MpO1xuICAgIGlmIChyZXN1bHQuaXNGYWlsdXJlKSByZXR1cm4gVmFsaWRhdGlvbi5GYWlsdXJlKFR1cGxlLlRyaXBsZShuZXdMYWJlbCwgcmVzdWx0LnZhbHVlWzFdLCByZXN1bHQudmFsdWVbMl0pKTtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9LCBuZXdMYWJlbCk7XG59XG5cbi8vIHRoZSByZWFsIHRoaW5nLi4uXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VyKGZuLCBsYWJlbCkge1xuICByZXR1cm4ge1xuICAgIHR5cGU6ICdwYXJzZXInLFxuICAgIGxhYmVsLFxuICAgIHJ1bihwb3MpIHtcbiAgICAgIHJldHVybiBmbihwb3MpO1xuICAgIH0sXG4gICAgYXBwbHkocHgpIHtcbiAgICAgIHJldHVybiBhcHBseVAodGhpcykocHgpO1xuICAgICAgLy8gcmV0dXJuIHRoaXMuYmluZChhbmRUaGVuKHRoaXMsIHB4KS5mbWFwKChbZiwgeF0pID0+IGYoeCkpKS5ydW47IC8vIHdlIGFyZSB0aGUgZlBcbiAgICB9LFxuICAgIGZtYXAoZmFiKSB7XG4gICAgICAvLyByZXR1cm4gZm1hcChmYWIsIHRoaXMpO1xuICAgICAgLy8gcmV0dXJuIGJpbmRQKHBvcyA9PiByZXR1cm5QKGZhYihwb3MpKSwgdGhpcyk7XG4gICAgICByZXR1cm4gdGhpcy5iaW5kKHBhcnNlZFZhbHVlID0+IHJldHVyblAoZmFiKHBhcnNlZFZhbHVlKSkpO1xuICAgIH0sXG4gICAgYW5kVGhlbihweCkge1xuICAgICAgcmV0dXJuIGFuZFRoZW4odGhpcywgcHgpO1xuICAgIH0sXG4gICAgb3JFbHNlKHB4KSB7XG4gICAgICByZXR1cm4gb3JFbHNlKHRoaXMsIHB4KTtcbiAgICB9LFxuICAgIGRpc2NhcmRGaXJzdChweCkge1xuICAgICAgcmV0dXJuIGRpc2NhcmRGaXJzdCh0aGlzLCBweCk7XG4gICAgfSxcbiAgICBkaXNjYXJkU2Vjb25kKHB4KSB7XG4gICAgICByZXR1cm4gZGlzY2FyZFNlY29uZCh0aGlzLCBweCk7XG4gICAgfSxcbiAgICBiaW5kKGZhbWIpIHtcbiAgICAgIHJldHVybiBiaW5kUChmYW1iLCB0aGlzKTtcbiAgICB9LFxuICAgIHNldExhYmVsKG5ld0xhYmVsKSB7XG4gICAgICByZXR1cm4gX3NldExhYmVsKHRoaXMsIG5ld0xhYmVsKTtcbiAgICB9LFxuICB9O1xufVxuIl19