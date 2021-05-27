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
  }).setLabel('failP');

  var succeedP = exports.succeedP = parser(function (pos) {
    return _validation.Validation.Success(_tuples.Tuple.Pair('', pos), 'succeed');
  }).setLabel('succeedP');

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
    });
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
    var label = 'bindP applied to ' + px.label;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2pzL3BhcnNlcnMuanMiXSwibmFtZXMiOlsicGNoYXIiLCJwZGlnaXQiLCJwcmVjZWRlZEJ5UCIsIm5vdFByZWNlZGVkQnlQIiwiZm9sbG93ZWRCeVAiLCJub3RGb2xsb3dlZEJ5UCIsImFuZFRoZW5CaW5kIiwiY2hvaWNlIiwiYW55T2YiLCJmbWFwIiwicmV0dXJuUCIsImFwcGx5UHgiLCJhcHBseVAiLCJsaWZ0MiIsInNlcXVlbmNlUCIsInNlcXVlbmNlUDIiLCJwc3RyaW5nIiwic3RyaW5nUCIsInplcm9Pck1vcmUiLCJtYW55IiwibWFueUNoYXJzIiwibWFueTEiLCJtYW55Q2hhcnMxIiwib3B0Iiwib3B0Qm9vayIsInNlcEJ5MUJvb2siLCJzZXBCeTEiLCJiZXR3ZWVuIiwiYmV0d2VlblBhcmVucyIsImJpbmRQIiwidGFwUCIsImxvZ1AiLCJwd29yZCIsInRyaW1QIiwicGFyc2VyIiwiY2hhclBhcnNlciIsInBvcyIsIlBvc2l0aW9uIiwiZnJvbVRleHQiLCJvcHRDaGFyIiwiY2hhciIsImlzTm90aGluZyIsIlZhbGlkYXRpb24iLCJGYWlsdXJlIiwiVHVwbGUiLCJUcmlwbGUiLCJ2YWx1ZSIsIlN1Y2Nlc3MiLCJQYWlyIiwiaW5jclBvcyIsImRpZ2l0UGFyc2VyIiwicGFyc2VJbnQiLCJkaWdpdCIsInByZWRpY2F0ZUJhc2VkUGFyc2VyIiwicHJlZCIsImxhYmVsIiwic3RhcnRPZklucHV0UCIsImRlY3JQb3MiLCJzdWNjZWVkUCIsInJ1biIsImZhaWxQIiwic2V0TGFiZWwiLCJub3RTdGFydE9mSW5wdXRQIiwiaXNKdXN0IiwiZW5kT2ZJbnB1dFAiLCJyZXN0Iiwibm90RW5kT2ZJbnB1dFAiLCJyZXN1bHQiLCJjMSIsImMyIiwicmVzMiIsImlzU3VjY2VzcyIsInJlczEiLCJlcnIiLCJpc0ZhaWx1cmUiLCJhbmRUaGVuIiwicDEiLCJwMiIsImJpbmQiLCJwYXJzZWRWYWx1ZTEiLCJwYXJzZWRWYWx1ZTIiLCJvckVsc2UiLCJwYXJzZXJzIiwicmVkdWNlUmlnaHQiLCJjdXJyIiwicmVkdWNlIiwiYWNjIiwiY2hhcnNBcnJheSIsIm1hcCIsImxvd2VyY2FzZVAiLCJ1cHBlcmNhc2VQIiwibGV0dGVyUCIsImRpZ2l0UCIsIndoaXRlUCIsImZhYiIsInBhcnNlcjEiLCJ0b1N0cmluZyIsInJlcyIsImZQIiwieFAiLCJmIiwieCIsInBhcnNlZFZhbHVlZiIsInBhcnNlZFZhbHVleCIsImZhYWIiLCJwYXJzZXIyIiwiYXBwbHkiLCJfY29ucyIsInkiLCJzdHIiLCJzcGxpdCIsImpvaW4iLCJyZXNOIiwiY29uY2F0IiwidGltZXMiLCJ0aW1lc19kZWZpbmVkIiwicmVzdWx0TGVuZ3RoIiwibGVuZ3RoIiwiYXJyYSIsImRlZmF1bHRWYWx1ZSIsImlzRGVmYXVsdCIsIk1heWJlIiwiSnVzdCIsIm91dGNvbWUiLCJOb3RoaW5nIiwicFgiLCJzb21lUCIsIm5vbmVQIiwiZGlzY2FyZFNlY29uZCIsImRpc2NhcmRGaXJzdCIsInB4Iiwic2VwIiwiciIsInJsaXN0IiwidmFsdWVQIiwic2VwYXJhdG9yUCIsInAzIiwiZmFtYiIsImZuIiwiY29uc29sZSIsImxvZyIsIndvcmQiLCJ4cyIsIl9zZXRMYWJlbCIsIm5ld0xhYmVsIiwidHlwZSIsInBhcnNlZFZhbHVlIl0sIm1hcHBpbmdzIjoiOzs7Ozs7O1VBK0VnQkEsSyxHQUFBQSxLO1VBTUFDLE0sR0FBQUEsTTtVQUlBQyxXLEdBQUFBLFc7VUFlQUMsYyxHQUFBQSxjO1VBa0JBQyxXLEdBQUFBLFc7VUFlQUMsYyxHQUFBQSxjO1VBa0NBQyxXLEdBQUFBLFc7VUF5QkFDLE0sR0FBQUEsTTtVQUtBQyxLLEdBQUFBLEs7VUFXQUMsSSxHQUFBQSxJO1VBU0FDLE8sR0FBQUEsTztVQUtBQyxPLEdBQUFBLE87VUFPQUMsTSxHQUFBQSxNO1VBVUFDLEssR0FBQUEsSztVQVVBQyxTLEdBQUFBLFM7VUFRQUMsVSxHQUFBQSxVO1VBT0FDLE8sR0FBQUEsTztVQUtBQyxPLEdBQUFBLE87VUFNQUMsVSxHQUFBQSxVO1VBU0FD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UixFQXFCWTtBQUNmLGVBQU9ELGNBQWEsSUFBYixFQUFtQkMsRUFBbkIsQ0FBUDtBQUNELE9BdkJJO0FBd0JMRixtQkF4QksseUJBd0JTRSxFQXhCVCxFQXdCYTtBQUNoQixlQUFPRixlQUFjLElBQWQsRUFBb0JFLEVBQXBCLENBQVA7QUFDRCxPQTFCSTtBQTJCTHBELFVBM0JLLGdCQTJCQTJELElBM0JBLEVBMkJNO0FBQ1QsZUFBTzVHLE1BQU00RyxJQUFOLEVBQVksSUFBWixDQUFQO0FBQ0QsT0E3Qkk7QUE4Qkw1RSxjQTlCSyxvQkE4QkltRixRQTlCSixFQThCYztBQUNqQixlQUFPRCxVQUFVLElBQVYsRUFBZ0JDLFFBQWhCLENBQVA7QUFDRDtBQWhDSSxLQUFQO0FBa0NEIiwiZmlsZSI6InBhcnNlcnMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxyXG5UaGUgTUlUIExpY2Vuc2UgKE1JVClcclxuXHJcbkNvcHlyaWdodCAoYykgMjAxNCBNYXJjbyBGYXVzdGluZWxsaVxyXG5cclxuUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxyXG5vZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSBcIlNvZnR3YXJlXCIpLCB0byBkZWFsXHJcbmluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcclxudG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxyXG5jb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcclxuZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcclxuXHJcblRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluIGFsbFxyXG5jb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxyXG5cclxuVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxyXG5JTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcclxuRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXHJcbkFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcclxuTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcclxuT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEVcclxuU09GVFdBUkUuXHJcbiovXHJcblxyXG4vLyBjZnIuIFwiVW5kZXJzdGFuZGluZyBQYXJzZXIgQ29tYmluYXRvcnNcIiAoRiMgZm9yIEZ1biBhbmQgUHJvZml0KVxyXG5cclxuaW1wb3J0IHtcclxuICBUdXBsZSwgLy8gY291cGxlcyBhbmQgdHJpcGxlc1xyXG4gIFBvc2l0aW9uLCAvLyBhIDJEIGJ1ZmZlciBhbmQgdHdvIHBvaW50ZXJzOiBQb3NpdGlvbihyb3dzID0gW10sIHJvdyA9IDAsIGNvbCA9IDApXHJcbn0gZnJvbSAnLi90dXBsZXMnO1xyXG5pbXBvcnQgeyBNYXliZSB9IGZyb20gJy4vbWF5YmUnOyAvLyBKdXN0IG9yIE5vdGhpbmdcclxuaW1wb3J0IHsgVmFsaWRhdGlvbiB9IGZyb20gJy4vdmFsaWRhdGlvbic7IC8vIFN1Y2Nlc3Mgb3IgRmFpbHVyZVxyXG5cclxuY29uc3QgY2hhclBhcnNlciA9IGNoYXIgPT4gcG9zID0+IHtcclxuICBpZiAodHlwZW9mIHBvcyA9PT0gJ3N0cmluZycpIHBvcyA9IFBvc2l0aW9uLmZyb21UZXh0KHBvcyk7XHJcbiAgY29uc3Qgb3B0Q2hhciA9IHBvcy5jaGFyKCk7XHJcbiAgaWYgKG9wdENoYXIuaXNOb3RoaW5nKSByZXR1cm4gVmFsaWRhdGlvbi5GYWlsdXJlKFR1cGxlLlRyaXBsZSgnY2hhclBhcnNlcicsICdubyBtb3JlIGlucHV0JywgcG9zKSk7XHJcbiAgaWYgKG9wdENoYXIudmFsdWUgPT09IGNoYXIpIHJldHVybiBWYWxpZGF0aW9uLlN1Y2Nlc3MoVHVwbGUuUGFpcihjaGFyLCBwb3MuaW5jclBvcygpKSk7XHJcbiAgcmV0dXJuIFZhbGlkYXRpb24uRmFpbHVyZShUdXBsZS5UcmlwbGUoJ2NoYXJQYXJzZXInLCAnd2FudGVkICcgKyBjaGFyICsgJzsgZ290ICcgKyBvcHRDaGFyLnZhbHVlLCBwb3MpKTtcclxufTtcclxuXHJcbmNvbnN0IGRpZ2l0UGFyc2VyID0gZGlnaXQgPT4gcG9zID0+IHtcclxuICBpZiAodHlwZW9mIHBvcyA9PT0gJ3N0cmluZycpIHBvcyA9IFBvc2l0aW9uLmZyb21UZXh0KHBvcyk7XHJcbiAgY29uc3Qgb3B0Q2hhciA9IHBvcy5jaGFyKCk7XHJcbiAgaWYgKG9wdENoYXIuaXNOb3RoaW5nKSByZXR1cm4gVmFsaWRhdGlvbi5GYWlsdXJlKFR1cGxlLlRyaXBsZSgnZGlnaXRQYXJzZXInLCAnbm8gbW9yZSBpbnB1dCcsIHBvcykpO1xyXG4gIGlmIChwYXJzZUludChvcHRDaGFyLnZhbHVlLCAxMCkgPT09IGRpZ2l0KSByZXR1cm4gVmFsaWRhdGlvbi5TdWNjZXNzKFR1cGxlLlBhaXIoZGlnaXQsIHBvcy5pbmNyUG9zKCkpKTtcclxuICByZXR1cm4gVmFsaWRhdGlvbi5GYWlsdXJlKFR1cGxlLlRyaXBsZSgnZGlnaXRQYXJzZXInLCAnd2FudGVkICcgKyBkaWdpdCArICc7IGdvdCAnICsgb3B0Q2hhci52YWx1ZSwgcG9zKSk7XHJcbn07XHJcblxyXG5jb25zdCBwcmVkaWNhdGVCYXNlZFBhcnNlciA9IChwcmVkLCBsYWJlbCkgPT4gcG9zID0+IHtcclxuICBpZiAodHlwZW9mIHBvcyA9PT0gJ3N0cmluZycpIHBvcyA9IFBvc2l0aW9uLmZyb21UZXh0KHBvcyk7XHJcbiAgY29uc3Qgb3B0Q2hhciA9IHBvcy5jaGFyKCk7XHJcbiAgaWYgKG9wdENoYXIuaXNOb3RoaW5nKSByZXR1cm4gVmFsaWRhdGlvbi5GYWlsdXJlKFR1cGxlLlRyaXBsZShsYWJlbCwgJ25vIG1vcmUgaW5wdXQnLCBwb3MpKTtcclxuICBpZiAocHJlZChvcHRDaGFyLnZhbHVlKSkgcmV0dXJuIFZhbGlkYXRpb24uU3VjY2VzcyhUdXBsZS5QYWlyKG9wdENoYXIudmFsdWUsIHBvcy5pbmNyUG9zKCkpKTtcclxuICByZXR1cm4gVmFsaWRhdGlvbi5GYWlsdXJlKFR1cGxlLlRyaXBsZShsYWJlbCwgJ3VuZXhwZWN0ZWQgY2hhcjogJyArIG9wdENoYXIudmFsdWUsIHBvcykpO1xyXG59O1xyXG5cclxuZXhwb3J0IHsgY2hhclBhcnNlciwgZGlnaXRQYXJzZXIsIHByZWRpY2F0ZUJhc2VkUGFyc2VyIH07XHJcblxyXG5leHBvcnQgY29uc3Qgc3RhcnRPZklucHV0UCA9XHJcbiAgcGFyc2VyKHBvcyA9PiAoKHBvcy5kZWNyUG9zKCkuY2hhcigpLmlzTm90aGluZylcclxuICAgID8gc3VjY2VlZFAucnVuKHBvcylcclxuICAgIDogZmFpbFAucnVuKHBvcykpKS5zZXRMYWJlbCgnXicpO1xyXG5cclxuZXhwb3J0IGNvbnN0IG5vdFN0YXJ0T2ZJbnB1dFAgPVxyXG4gIHBhcnNlcihwb3MgPT4gKChwb3MuZGVjclBvcygpLmNoYXIoKS5pc0p1c3QpXHJcbiAgICA/IHN1Y2NlZWRQLnJ1bihwb3MpXHJcbiAgICA6IGZhaWxQLnJ1bihwb3MpKSkuc2V0TGFiZWwoJ25vdF4nKTtcclxuXHJcbmV4cG9ydCBjb25zdCBlbmRPZklucHV0UCA9XHJcbiAgcGFyc2VyKHBvcyA9PiAoKHBvcy5yZXN0KCkgPT09ICcnKVxyXG4gICAgPyBzdWNjZWVkUC5ydW4ocG9zKVxyXG4gICAgOiBmYWlsUC5ydW4ocG9zKSkpLnNldExhYmVsKCckJyk7XHJcblxyXG5leHBvcnQgY29uc3Qgbm90RW5kT2ZJbnB1dFAgPVxyXG4gIHBhcnNlcihwb3MgPT4gKChwb3MucmVzdCgpICE9PSAnJylcclxuICAgID8gc3VjY2VlZFAucnVuKHBvcylcclxuICAgIDogZmFpbFAucnVuKHBvcykpKS5zZXRMYWJlbCgnbm90JCcpO1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHBjaGFyKGNoYXIpIHtcclxuICBjb25zdCBsYWJlbCA9ICdwY2hhcl8nICsgY2hhcjtcclxuICBjb25zdCByZXN1bHQgPSBwb3MgPT4gY2hhclBhcnNlcihjaGFyKShwb3MpO1xyXG4gIHJldHVybiBwYXJzZXIocmVzdWx0LCBsYWJlbCkuc2V0TGFiZWwobGFiZWwpO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gcGRpZ2l0KGRpZ2l0KSB7XHJcbiAgcmV0dXJuIHBhcnNlcihwb3MgPT4gZGlnaXRQYXJzZXIoZGlnaXQpKHBvcyksICdwZGlnaXRfJyArIGRpZ2l0KTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHByZWNlZGVkQnlQKGMxLCBjMikge1xyXG4gIGNvbnN0IGxhYmVsID0gYzIgKyAnIHByZWNlZGVkIGJ5ICcgKyBjMTtcclxuICByZXR1cm4gcGFyc2VyKHBvcyA9PiB7XHJcbiAgICBjb25zdCByZXMyID0gcGNoYXIoYzIpLnJ1bihwb3MpO1xyXG4gICAgaWYgKHJlczIuaXNTdWNjZXNzKSB7XHJcbiAgICAgIGNvbnN0IHJlczEgPSBwY2hhcihjMSkucnVuKHJlczIudmFsdWVbMV0uZGVjclBvcygyKSk7XHJcbiAgICAgIGlmIChyZXMxLmlzU3VjY2Vzcykge1xyXG4gICAgICAgIHJldHVybiBWYWxpZGF0aW9uLlN1Y2Nlc3MoVHVwbGUuUGFpcihjMiwgcmVzMi52YWx1ZVsxXSkpO1xyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBWYWxpZGF0aW9uLkZhaWx1cmUoVHVwbGUuVHJpcGxlKGxhYmVsLCByZXMxLnZhbHVlWzFdLCByZXMxLnZhbHVlWzJdKSk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gVmFsaWRhdGlvbi5GYWlsdXJlKFR1cGxlLlRyaXBsZShsYWJlbCwgcmVzMi52YWx1ZVsxXSwgcmVzMi52YWx1ZVsyXSkpO1xyXG4gIH0sIGxhYmVsKTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIG5vdFByZWNlZGVkQnlQKGMxLCBjMikge1xyXG4gIGNvbnN0IGxhYmVsID0gYzIgKyAnIG5vdCBwcmVjZWRlZCBieSAnICsgYzE7XHJcbiAgcmV0dXJuIHBhcnNlcihwb3MgPT4ge1xyXG4gICAgY29uc3QgcmVzMiA9IHBjaGFyKGMyKS5ydW4ocG9zKTtcclxuICAgIGlmIChyZXMyLmlzU3VjY2Vzcykge1xyXG4gICAgICBsZXQgcmVzMSA9IFZhbGlkYXRpb24uRmFpbHVyZSgpO1xyXG4gICAgICB0cnkgeyAvLyBjcmFzaCBnb2luZyBiYWNrIGJleW9uZCBzdGFydCBvZiBpbnB1dCA9PiBva1xyXG4gICAgICAgIHJlczEgPSBwY2hhcihjMSkucnVuKHJlczIudmFsdWVbMV0uZGVjclBvcygyKSk7XHJcbiAgICAgIH0gY2F0Y2ggKGVycikge31cclxuICAgICAgaWYgKHJlczEuaXNGYWlsdXJlKSB7XHJcbiAgICAgICAgcmV0dXJuIFZhbGlkYXRpb24uU3VjY2VzcyhUdXBsZS5QYWlyKGMyLCByZXMyLnZhbHVlWzFdKSk7XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIFZhbGlkYXRpb24uRmFpbHVyZShUdXBsZS5UcmlwbGUobGFiZWwsIHJlczEudmFsdWVbMV0sIHJlczEudmFsdWVbMl0pKTtcclxuICAgIH1cclxuICAgIHJldHVybiBWYWxpZGF0aW9uLkZhaWx1cmUoVHVwbGUuVHJpcGxlKGxhYmVsLCByZXMyLnZhbHVlWzFdLCByZXMyLnZhbHVlWzJdKSk7XHJcbiAgfSwgbGFiZWwpO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZm9sbG93ZWRCeVAoYzEsIGMyKSB7XHJcbiAgY29uc3QgbGFiZWwgPSBjMiArICcgZm9sbG93ZWQgYnkgJyArIGMxO1xyXG4gIHJldHVybiBwYXJzZXIocG9zID0+IHtcclxuICAgIGNvbnN0IHJlczIgPSBwY2hhcihjMikucnVuKHBvcyk7XHJcbiAgICBpZiAocmVzMi5pc1N1Y2Nlc3MpIHtcclxuICAgICAgY29uc3QgcmVzMSA9IHBjaGFyKGMxKS5ydW4ocmVzMi52YWx1ZVsxXSk7IC8vIG5vIG5lZWQgdG8gaW5jcmVtZW50IHBvc1xyXG4gICAgICBpZiAocmVzMS5pc1N1Y2Nlc3MpIHtcclxuICAgICAgICByZXR1cm4gVmFsaWRhdGlvbi5TdWNjZXNzKFR1cGxlLlBhaXIoYzIsIHJlczIudmFsdWVbMV0pKTtcclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gVmFsaWRhdGlvbi5GYWlsdXJlKFR1cGxlLlRyaXBsZShsYWJlbCwgcmVzMS52YWx1ZVsxXSwgcmVzMS52YWx1ZVsyXSkpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIFZhbGlkYXRpb24uRmFpbHVyZShUdXBsZS5UcmlwbGUobGFiZWwsIHJlczIudmFsdWVbMV0sIHJlczIudmFsdWVbMl0pKTtcclxuICB9LCBsYWJlbCk7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBub3RGb2xsb3dlZEJ5UChjMSwgYzIpIHtcclxuICBjb25zdCBsYWJlbCA9IGMyICsgJyBub3QgZm9sbG93ZWQgYnkgJyArIGMxO1xyXG4gIHJldHVybiBwYXJzZXIocG9zID0+IHtcclxuICAgIGNvbnN0IHJlczIgPSBwY2hhcihjMikucnVuKHBvcyk7XHJcbiAgICBpZiAocmVzMi5pc1N1Y2Nlc3MpIHtcclxuICAgICAgbGV0IHJlczEgPSBWYWxpZGF0aW9uLkZhaWx1cmUoKTtcclxuICAgICAgdHJ5IHsgLy8gY3Jhc2ggZ29pbmcgZG93biBiZXlvbmQgZW5kIG9mIGlucHV0ID0+IG9rXHJcbiAgICAgICAgcmVzMSA9IHBjaGFyKGMxKS5ydW4ocmVzMi52YWx1ZVsxXSk7XHJcbiAgICAgIH0gY2F0Y2ggKGVycikge31cclxuICAgICAgaWYgKHJlczEuaXNGYWlsdXJlKSB7XHJcbiAgICAgICAgcmV0dXJuIFZhbGlkYXRpb24uU3VjY2VzcyhUdXBsZS5QYWlyKGMyLCByZXMyLnZhbHVlWzFdKSk7XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIFZhbGlkYXRpb24uRmFpbHVyZShUdXBsZS5UcmlwbGUobGFiZWwsIHJlczEudmFsdWVbMV0sIHJlczEudmFsdWVbMl0pKTtcclxuICAgIH1cclxuICAgIHJldHVybiBWYWxpZGF0aW9uLkZhaWx1cmUoVHVwbGUuVHJpcGxlKGxhYmVsLCByZXMyLnZhbHVlWzFdLCByZXMyLnZhbHVlWzJdKSk7XHJcbiAgfSwgbGFiZWwpO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gYW5kVGhlbihwMSwgcDIpIHtcclxuICBjb25zdCBsYWJlbCA9IHAxLmxhYmVsICsgJyBhbmRUaGVuICcgKyBwMi5sYWJlbDtcclxuICByZXR1cm4gcGFyc2VyKHBvcyA9PiB7XHJcbiAgICBjb25zdCByZXMxID0gcDEucnVuKHBvcyk7XHJcbiAgICBpZiAocmVzMS5pc1N1Y2Nlc3MpIHtcclxuICAgICAgY29uc3QgcmVzMiA9IHAyLnJ1bihyZXMxLnZhbHVlWzFdKTtcclxuICAgICAgaWYgKHJlczIuaXNTdWNjZXNzKSB7XHJcbiAgICAgICAgcmV0dXJuIFZhbGlkYXRpb24uU3VjY2VzcyhUdXBsZS5QYWlyKFR1cGxlLlBhaXIocmVzMS52YWx1ZVswXSwgcmVzMi52YWx1ZVswXSksIHJlczIudmFsdWVbMV0pKTtcclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gVmFsaWRhdGlvbi5GYWlsdXJlKFR1cGxlLlRyaXBsZShsYWJlbCwgcmVzMi52YWx1ZVsxXSwgcmVzMi52YWx1ZVsyXSkpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIFZhbGlkYXRpb24uRmFpbHVyZShUdXBsZS5UcmlwbGUobGFiZWwsIHJlczEudmFsdWVbMV0sIHJlczEudmFsdWVbMl0pKTtcclxuICB9LCBsYWJlbCk7XHJcbn1cclxuXHJcbi8vIHVzaW5nIGJpbmRcclxuZXhwb3J0IGZ1bmN0aW9uIGFuZFRoZW5CaW5kKHAxLCBwMikge1xyXG4gIHJldHVybiBwMS5iaW5kKHBhcnNlZFZhbHVlMSA9PiB7XHJcbiAgICByZXR1cm4gcDIuYmluZChwYXJzZWRWYWx1ZTIgPT4ge1xyXG4gICAgICByZXR1cm4gcmV0dXJuUChUdXBsZS5QYWlyKHBhcnNlZFZhbHVlMSwgcGFyc2VkVmFsdWUyKSk7XHJcbiAgICB9KTtcclxuICB9KS5zZXRMYWJlbChwMS5sYWJlbCArICcgYW5kVGhlbiAnICsgcDIubGFiZWwpO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gb3JFbHNlKHAxLCBwMikge1xyXG4gIGNvbnN0IGxhYmVsID0gcDEubGFiZWwgKyAnIG9yRWxzZSAnICsgcDIubGFiZWw7XHJcbiAgcmV0dXJuIHBhcnNlcihwb3MgPT4ge1xyXG4gICAgY29uc3QgcmVzMSA9IHAxLnJ1bihwb3MpO1xyXG4gICAgaWYgKHJlczEuaXNTdWNjZXNzKSByZXR1cm4gcmVzMTtcclxuICAgIGNvbnN0IHJlczIgPSBwMi5ydW4ocG9zKTtcclxuICAgIGlmIChyZXMyLmlzU3VjY2VzcykgcmV0dXJuIHJlczI7XHJcbiAgICByZXR1cm4gVmFsaWRhdGlvbi5GYWlsdXJlKFR1cGxlLlRyaXBsZShsYWJlbCwgcmVzMi52YWx1ZVsxXSwgcmVzMi52YWx1ZVsyXSkpO1xyXG4gIH0sIGxhYmVsKS5zZXRMYWJlbChsYWJlbCk7XHJcbn1cclxuXHJcbmV4cG9ydCBjb25zdCBmYWlsUCA9IHBhcnNlcihwb3MgPT4gVmFsaWRhdGlvbi5GYWlsdXJlKFR1cGxlLlRyaXBsZSgnJywgJ2ZhaWwnLCBwb3MpKSlcclxuICAuc2V0TGFiZWwoJ2ZhaWxQJyk7XHJcblxyXG5leHBvcnQgY29uc3Qgc3VjY2VlZFAgPSBwYXJzZXIocG9zID0+IFZhbGlkYXRpb24uU3VjY2VzcyhUdXBsZS5QYWlyKCcnLCBwb3MpLCAnc3VjY2VlZCcpKVxyXG4gIC5zZXRMYWJlbCgnc3VjY2VlZFAnKTtcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBjaG9pY2UocGFyc2Vycykge1xyXG4gIHJldHVybiBwYXJzZXJzLnJlZHVjZVJpZ2h0KChyZXN0LCBjdXJyKSA9PiBvckVsc2UoY3VyciwgcmVzdCksIGZhaWxQKVxyXG4gICAgLnNldExhYmVsKCdjaG9pY2UgJyArIHBhcnNlcnMucmVkdWNlKChhY2MsIGN1cnIpID0+IGFjYyArICcvJyArIGN1cnIubGFiZWwsICcnKSk7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBhbnlPZihjaGFyc0FycmF5KSB7XHJcbiAgcmV0dXJuIGNob2ljZShjaGFyc0FycmF5Lm1hcChwY2hhcikpXHJcbiAgICAuc2V0TGFiZWwoJ2FueU9mICcgKyBjaGFyc0FycmF5LnJlZHVjZSgoYWNjLCBjdXJyKSA9PiBhY2MgKyBjdXJyLCAnJykpO1xyXG59XHJcblxyXG5leHBvcnQgY29uc3QgbG93ZXJjYXNlUCA9IGFueU9mKFsnYScsICdiJywgJ2MnLCAnZCcsICdlJywgJ2YnLCAnZycsICdoJywgJ2knLCAnaicsICdrJywgJ2wnLCAnbScsICduJywgJ28nLCAncCcsICdxJywgJ3InLCAncycsICd0JywgJ3UnLCAndicsICd3JywgJ3gnLCAneScsICd6J10pLnNldExhYmVsKCdsb3dlcmNhc2VQJyk7XHJcbmV4cG9ydCBjb25zdCB1cHBlcmNhc2VQID0gYW55T2YoWydBJywgJ0InLCAnQycsICdEJywgJ0UnLCAnRicsICdHJywgJ0gnLCAnSScsICdKJywgJ0snLCAnTCcsICdNJywgJ04nLCAnTycsICdQJywgJ1EnLCAnUicsICdTJywgJ1QnLCAnVScsICdWJywgJ1cnLCAnWCcsICdZJywgJ1onXSkuc2V0TGFiZWwoJ3VwcGVyY2FzZVAnKTtcclxuZXhwb3J0IGNvbnN0IGxldHRlclAgPSBsb3dlcmNhc2VQLm9yRWxzZSh1cHBlcmNhc2VQKS5zZXRMYWJlbCgnbGV0dGVyUCcpO1xyXG5leHBvcnQgY29uc3QgZGlnaXRQID0gYW55T2YoWycwJywgJzEnLCAnMicsICczJywgJzQnLCAnNScsICc2JywgJzcnLCAnOCcsICc5J10pLnNldExhYmVsKCdkaWdpdFAnKTtcclxuZXhwb3J0IGNvbnN0IHdoaXRlUCA9IGFueU9mKFsnICcsICdcXHQnLCAnXFxuJywgJ1xcciddKS5zZXRMYWJlbCgnd2hpdGVQJyk7XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZm1hcChmYWIsIHBhcnNlcjEpIHtcclxuICBjb25zdCBsYWJlbCA9IHBhcnNlcjEubGFiZWwgKyAnIGZtYXAgJyArIGZhYi50b1N0cmluZygpO1xyXG4gIHJldHVybiBwYXJzZXIocG9zID0+IHtcclxuICAgIGNvbnN0IHJlcyA9IHBhcnNlcjEucnVuKHBvcyk7XHJcbiAgICBpZiAocmVzLmlzU3VjY2VzcykgcmV0dXJuIFZhbGlkYXRpb24uU3VjY2VzcyhUdXBsZS5QYWlyKGZhYihyZXMudmFsdWVbMF0pLCByZXMudmFsdWVbMV0pKTtcclxuICAgIHJldHVybiBWYWxpZGF0aW9uLkZhaWx1cmUoVHVwbGUuVHJpcGxlKGxhYmVsLCByZXMudmFsdWVbMV0sIHJlcy52YWx1ZVsyXSkpO1xyXG4gIH0sIGxhYmVsKTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHJldHVyblAodmFsdWUpIHtcclxuICByZXR1cm4gcGFyc2VyKHBvcyA9PiBWYWxpZGF0aW9uLlN1Y2Nlc3MoVHVwbGUuUGFpcih2YWx1ZSwgcG9zKSkpO1xyXG59XHJcblxyXG4vLyBwYXJzZXIoYSAtPiBiKSAtPiBwYXJzZXIoYSkgLT4gcGFyc2VyKGIpXHJcbmV4cG9ydCBmdW5jdGlvbiBhcHBseVB4KGZQKSB7XHJcbiAgcmV0dXJuIGZ1bmN0aW9uKHhQKSB7XHJcbiAgICByZXR1cm4gYW5kVGhlbihmUCwgeFApLmZtYXAoKFtmLCB4XSkgPT4gZih4KSk7XHJcbiAgfTtcclxufVxyXG5cclxuLy8gdXNpbmcgYmluZFxyXG5leHBvcnQgZnVuY3Rpb24gYXBwbHlQKGZQKSB7XHJcbiAgcmV0dXJuIGZ1bmN0aW9uKHhQKSB7XHJcbiAgICByZXR1cm4gZlAuYmluZChwYXJzZWRWYWx1ZWYgPT4ge1xyXG4gICAgICByZXR1cm4geFAuYmluZChwYXJzZWRWYWx1ZXggPT4ge1xyXG4gICAgICAgIHJldHVybiByZXR1cm5QKHBhcnNlZFZhbHVlZihwYXJzZWRWYWx1ZXgpKTtcclxuICAgICAgfSk7XHJcbiAgICB9KTtcclxuICB9O1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gbGlmdDIoZmFhYikge1xyXG4gIHJldHVybiBmdW5jdGlvbihwYXJzZXIxKSB7XHJcbiAgICByZXR1cm4gZnVuY3Rpb24ocGFyc2VyMikge1xyXG4gICAgICAvLyByZXR1cm4gYXBwbHlQKGFwcGx5UChyZXR1cm5QKGZhYWIpKShwYXJzZXIxKSkocGFyc2VyMik7XHJcbiAgICAgIHJldHVybiByZXR1cm5QKGZhYWIpLmFwcGx5KHBhcnNlcjEpLmFwcGx5KHBhcnNlcjIpOyAvLyB1c2luZyBpbnN0YW5jZSBtZXRob2RzXHJcbiAgICB9O1xyXG4gIH07XHJcbn1cclxuXHJcbi8vIHVzaW5nIGxpZnQyKGNvbnMpXHJcbmV4cG9ydCBmdW5jdGlvbiBzZXF1ZW5jZVAocGFyc2Vycykge1xyXG4gIHJldHVybiBwYXJzZXJzXHJcbiAgICAucmVkdWNlUmlnaHQoKHJlc3QsIGN1cnIpID0+IHtcclxuICAgICAgcmV0dXJuIGxpZnQyKF9jb25zKShjdXJyKShyZXN0KTtcclxuICAgIH0sIHJldHVyblAoW10pKTtcclxufVxyXG5cclxuLy8gdXNpbmcgbmFpdmUgYW5kVGhlbiAmJiBmbWFwIC0tPiByZXR1cm5zIHN0cmluZ3MsIG5vdCBhcnJheXMhXHJcbmV4cG9ydCBmdW5jdGlvbiBzZXF1ZW5jZVAyKHBhcnNlcnMpIHtcclxuICByZXR1cm4gcGFyc2Vyc1xyXG4gICAgLnJlZHVjZVJpZ2h0KChyZXN0LCBjdXJyKSA9PiB7XHJcbiAgICAgIHJldHVybiBmbWFwKChbeCwgeV0pID0+IHggKyB5LCBhbmRUaGVuKGN1cnIsIHJlc3QpKTtcclxuICAgIH0sIHJldHVyblAoJycpKTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHBzdHJpbmcoc3RyKSB7XHJcbiAgcmV0dXJuIHNlcXVlbmNlUChzdHIuc3BsaXQoJycpLm1hcChwY2hhcikpXHJcbiAgICAuc2V0TGFiZWwoJ3BzdHJpbmcgJyArIHN0cik7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBzdHJpbmdQKHN0cikge1xyXG4gIHJldHVybiBwc3RyaW5nKHN0cilcclxuICAgIC5mbWFwKHJlcyA9PiByZXMuam9pbignJykpXHJcbiAgICAuc2V0TGFiZWwoJ3N0cmluZ1AgJyArIHN0cik7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiB6ZXJvT3JNb3JlKHhQKSB7IC8vIHplcm9Pck1vcmUgOjogcCBhIC0+IFthXSAtPiB0cnkgW2FdID0gcCBhIC0+IHAgW2FdXHJcbiAgcmV0dXJuIHBvcyA9PiB7XHJcbiAgICBjb25zdCByZXMxID0geFAucnVuKHBvcyk7XHJcbiAgICBpZiAocmVzMS5pc0ZhaWx1cmUpIHJldHVybiBWYWxpZGF0aW9uLlN1Y2Nlc3MoVHVwbGUuUGFpcihbXSwgcG9zKSk7XHJcbiAgICBjb25zdCByZXNOID0gemVyb09yTW9yZSh4UCkocmVzMS52YWx1ZVsxXSk7XHJcbiAgICByZXR1cm4gVmFsaWRhdGlvbi5TdWNjZXNzKFR1cGxlLlBhaXIoW3JlczEudmFsdWVbMF1dLmNvbmNhdChyZXNOLnZhbHVlWzBdKSwgcmVzTi52YWx1ZVsxXSkpO1xyXG4gIH07XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBtYW55KHhQLCB0aW1lcykge1xyXG4gIGNvbnN0IHRpbWVzX2RlZmluZWQgPSAodHlwZW9mIHRpbWVzICE9PSAndW5kZWZpbmVkJyk7XHJcbiAgY29uc3QgbGFiZWwgPSAnbWFueSAnICsgeFAubGFiZWxcclxuICAgICAgICArICgodGltZXNfZGVmaW5lZCkgPyAnIHRpbWVzPScgKyB0aW1lcyA6ICcnKTtcclxuICByZXR1cm4gcGFyc2VyKHBvcyA9PiB7XHJcbiAgICBjb25zdCByZXMgPSB6ZXJvT3JNb3JlKHhQKShwb3MpO1xyXG4gICAgaWYgKHRpbWVzX2RlZmluZWQpIHsvLyBkZWJ1Z2dlcjtcclxuICAgICAgaWYgKHJlcy5pc0ZhaWx1cmUpIHJldHVybiByZXM7XHJcbiAgICAgIGNvbnN0IHJlc3VsdExlbmd0aCA9IHJlcy52YWx1ZVswXS5sZW5ndGg7XHJcbiAgICAgIHJldHVybiAocmVzdWx0TGVuZ3RoID09PSB0aW1lcylcclxuICAgICAgICA/IHJlc1xyXG4gICAgICAgIDogVmFsaWRhdGlvbi5GYWlsdXJlKFR1cGxlLlRyaXBsZShsYWJlbCwgJ3RpbWVzIHBhcmFtIHdhbnRlZCAnICsgdGltZXMgKyAnOyBnb3QgJyArIHJlc3VsdExlbmd0aCwgcG9zKSk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gcmVzO1xyXG4gIH0sIGxhYmVsKS5zZXRMYWJlbChsYWJlbCk7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBtYW55Q2hhcnMoeFAsIHRpbWVzKSB7XHJcbiAgcmV0dXJuIG1hbnkoeFAsIHRpbWVzKVxyXG4gICAgLmZtYXAoYXJyYSA9PiBhcnJhLmpvaW4oJycpKVxyXG4gICAgLnNldExhYmVsKCdtYW55Q2hhcnMgJyArIHhQLmxhYmVsXHJcbiAgICAgICAgICAgICsgKCh0eXBlb2YgdGltZXMgIT09ICd1bmRlZmluZWQnKSA/ICcgdGltZXM9JyArIHRpbWVzIDogJycpKTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIG1hbnkxKHhQKSB7XHJcbiAgY29uc3QgbGFiZWwgPSAnbWFueTEgJyArIHhQLmxhYmVsO1xyXG4gIHJldHVybiBwYXJzZXIocG9zID0+IHtcclxuICAgIGNvbnN0IHJlczEgPSB4UC5ydW4ocG9zKTtcclxuICAgIGlmIChyZXMxLmlzRmFpbHVyZSkgcmV0dXJuIHJlczE7XHJcbiAgICBjb25zdCByZXNOID0gemVyb09yTW9yZSh4UCkocmVzMS52YWx1ZVsxXSk7XHJcbiAgICByZXR1cm4gVmFsaWRhdGlvbi5TdWNjZXNzKFR1cGxlLlBhaXIoW3JlczEudmFsdWVbMF1dLmNvbmNhdChyZXNOLnZhbHVlWzBdKSwgcmVzTi52YWx1ZVsxXSkpO1xyXG4gIH0sIGxhYmVsKS5zZXRMYWJlbChsYWJlbCk7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBtYW55Q2hhcnMxKHhQKSB7XHJcbiAgcmV0dXJuIG1hbnkxKHhQKVxyXG4gICAgLmZtYXAoYXJyYSA9PiBhcnJhLmpvaW4oJycpKVxyXG4gICAgLnNldExhYmVsKCdtYW55Q2hhcnMxICcgKyB4UC5sYWJlbCk7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBvcHQoeFAsIGRlZmF1bHRWYWx1ZSkge1xyXG4gIGNvbnN0IGlzRGVmYXVsdCA9ICh0eXBlb2YgZGVmYXVsdFZhbHVlICE9PSAndW5kZWZpbmVkJyk7XHJcbiAgY29uc3QgbGFiZWwgPSAnb3B0ICcgKyB4UC5sYWJlbFxyXG4gICAgICAgICsgKGlzRGVmYXVsdCA/ICcoZGVmYXVsdD0nICsgZGVmYXVsdFZhbHVlICsgJyknIDogJycpO1xyXG4gIHJldHVybiBwYXJzZXIocG9zID0+IHtcclxuICAgIGNvbnN0IHJlcyA9IHhQLmZtYXAoTWF5YmUuSnVzdCkucnVuKHBvcyk7XHJcbiAgICBpZiAocmVzLmlzU3VjY2VzcykgcmV0dXJuIHJlcztcclxuICAgIGNvbnN0IG91dGNvbWUgPSAoaXNEZWZhdWx0KSA/IE1heWJlLkp1c3QoZGVmYXVsdFZhbHVlKSA6IE1heWJlLk5vdGhpbmcoKTtcclxuICAgIHJldHVybiBWYWxpZGF0aW9uLlN1Y2Nlc3MoVHVwbGUuUGFpcihvdXRjb21lLCBwb3MpKTtcclxuICB9LCBsYWJlbCkuc2V0TGFiZWwobGFiZWwpO1xyXG59XHJcblxyXG4vLyBvcHQgZnJvbSB0aGUgYm9vayAtIHdvcmtzIG9rLCBidXQgdG9TdHJpbmcoKSBnaXZlcyBzdHJhbmdlIHJlc3VsdHNcclxuZXhwb3J0IGZ1bmN0aW9uIG9wdEJvb2socFgpIHtcclxuICBjb25zdCBzb21lUCA9IHBYLmZtYXAoTWF5YmUuSnVzdCk7XHJcbiAgY29uc3Qgbm9uZVAgPSByZXR1cm5QKE1heWJlLk5vdGhpbmcpO1xyXG4gIHJldHVybiBzb21lUC5vckVsc2Uobm9uZVApO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZGlzY2FyZFNlY29uZChwMSwgcDIpIHtcclxuICBjb25zdCBsYWJlbCA9IHAxLmxhYmVsICsgJyBkaXNjYXJkU2Vjb25kICcgKyBwMi5sYWJlbDtcclxuICByZXR1cm4gcGFyc2VyKHBvcyA9PiB7XHJcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tdW51c2VkLXZhcnNcclxuICAgIHJldHVybiBhbmRUaGVuKHAxLCBwMikuZm1hcCgoW3gsIHldKSA9PiB4KS5ydW4ocG9zKTtcclxuICB9LCBsYWJlbCkuc2V0TGFiZWwobGFiZWwpO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZGlzY2FyZEZpcnN0KHAxLCBwMikge1xyXG4gIGNvbnN0IGxhYmVsID0gcDEubGFiZWwgKyAnIGRpc2NhcmRGaXJzdCAnICsgcDIubGFiZWw7XHJcbiAgcmV0dXJuIHBhcnNlcihwb3MgPT4ge1xyXG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXVudXNlZC12YXJzXHJcbiAgICByZXR1cm4gYW5kVGhlbihwMSwgcDIpLmZtYXAoKFt4LCB5XSkgPT4geSkucnVuKHBvcyk7XHJcbiAgfSwgbGFiZWwpLnNldExhYmVsKGxhYmVsKTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHNlcEJ5MUJvb2socHgsIHNlcCkge1xyXG4gIHJldHVybiBweC5hbmRUaGVuKG1hbnkoc2VwLmRpc2NhcmRGaXJzdChweCkpKS5mbWFwKChbciwgcmxpc3RdKSA9PiBbcl0uY29uY2F0KHJsaXN0KSk7XHJcbn1cclxuXHJcbi8vIG15IHZlcnNpb24gd29ya3MganVzdCBmaW5lLi4uXHJcbmV4cG9ydCBmdW5jdGlvbiBzZXBCeTEodmFsdWVQLCBzZXBhcmF0b3JQKSB7XHJcbiAgcmV0dXJuIG1hbnkobWFueTEodmFsdWVQKS5kaXNjYXJkU2Vjb25kKG9wdChzZXBhcmF0b3JQKSkpO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gYmV0d2VlbihwMSwgcDIsIHAzKSB7XHJcbiAgcmV0dXJuIHAxLmRpc2NhcmRGaXJzdChwMikuZGlzY2FyZFNlY29uZChwMylcclxuICAgIC5zZXRMYWJlbCgnYmV0d2VlbiAnICsgcDEubGFiZWwgKyAnLycgKyBwMi5sYWJlbCArICcvJyArIHAzLmxhYmVsKTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGJldHdlZW5QYXJlbnMocHgpIHtcclxuICByZXR1cm4gYmV0d2VlbihwY2hhcignKCcpLCBweCwgcGNoYXIoJyknKSlcclxuICAgIC5zZXRMYWJlbCgnYmV0d2VlblBhcmVucyAnICsgcHgubGFiZWwpO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gYmluZFAoZmFtYiwgcHgpIHtcclxuICBjb25zdCBsYWJlbCA9ICdiaW5kUCBhcHBsaWVkIHRvICcgKyBweC5sYWJlbDtcclxuICByZXR1cm4gcGFyc2VyKHBvcyA9PiB7XHJcbiAgICBjb25zdCByZXMgPSBweC5ydW4ocG9zKTtcclxuICAgIGlmIChyZXMuaXNGYWlsdXJlKSByZXR1cm4gcmVzO1xyXG4gICAgcmV0dXJuIGZhbWIocmVzLnZhbHVlWzBdKS5ydW4ocmVzLnZhbHVlWzFdKTtcclxuICB9LCBsYWJlbCkuc2V0TGFiZWwobGFiZWwpO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gdGFwUChweCwgZm4pIHtcclxuICByZXR1cm4gcHguYmluZChyZXMgPT4ge1xyXG4gICAgZm4ocmVzKTtcclxuICAgIHJldHVybiByZXR1cm5QKHJlcyk7XHJcbiAgfSk7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBsb2dQKHB4KSB7XHJcbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWNvbnNvbGVcclxuICByZXR1cm4gdGFwUChweCwgcmVzID0+IGNvbnNvbGUubG9nKHB4LmxhYmVsICsgJzonICsgcmVzKSk7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBwd29yZCh3b3JkKSB7XHJcbiAgcmV0dXJuIHRyaW1QKHBzdHJpbmcod29yZCkpXHJcbiAgICAuc2V0TGFiZWwoJ3B3b3JkICcgKyB3b3JkKTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHRyaW1QKHBYKSB7XHJcbiAgcmV0dXJuIG9wdChtYW55KHdoaXRlUCkpXHJcbiAgICAuZGlzY2FyZEZpcnN0KHBYKVxyXG4gICAgLmRpc2NhcmRTZWNvbmQob3B0KG1hbnkod2hpdGVQKSkpXHJcbiAgICAuc2V0TGFiZWwoJ3RyaW0gJyArIHBYLmxhYmVsKTtcclxufVxyXG5cclxuZnVuY3Rpb24gX2NvbnMoeCkge1xyXG4gIHJldHVybiBmdW5jdGlvbih4cykge1xyXG4gICAgcmV0dXJuIFt4XS5jb25jYXQoeHMpO1xyXG4gIH07XHJcbn1cclxuXHJcbmZ1bmN0aW9uIF9zZXRMYWJlbChweCwgbmV3TGFiZWwpIHtcclxuICByZXR1cm4gcGFyc2VyKHBvcyA9PiB7XHJcbiAgICBjb25zdCByZXN1bHQgPSBweC5ydW4ocG9zKTtcclxuICAgIGlmIChyZXN1bHQuaXNGYWlsdXJlKSByZXR1cm4gVmFsaWRhdGlvbi5GYWlsdXJlKFR1cGxlLlRyaXBsZShuZXdMYWJlbCwgcmVzdWx0LnZhbHVlWzFdLCByZXN1bHQudmFsdWVbMl0pKTtcclxuICAgIHJldHVybiByZXN1bHQ7XHJcbiAgfSwgbmV3TGFiZWwpO1xyXG59XHJcblxyXG4vLyB0aGUgcmVhbCB0aGluZy4uLlxyXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VyKGZuLCBsYWJlbCkge1xyXG4gIHJldHVybiB7XHJcbiAgICB0eXBlOiAncGFyc2VyJyxcclxuICAgIGxhYmVsLFxyXG4gICAgcnVuKHBvcykge1xyXG4gICAgICByZXR1cm4gZm4ocG9zKTtcclxuICAgIH0sXHJcbiAgICBhcHBseShweCkge1xyXG4gICAgICByZXR1cm4gYXBwbHlQKHRoaXMpKHB4KTtcclxuICAgICAgLy8gcmV0dXJuIHRoaXMuYmluZChhbmRUaGVuKHRoaXMsIHB4KS5mbWFwKChbZiwgeF0pID0+IGYoeCkpKS5ydW47IC8vIHdlIGFyZSB0aGUgZlBcclxuICAgIH0sXHJcbiAgICBmbWFwKGZhYikge1xyXG4gICAgICAvLyByZXR1cm4gZm1hcChmYWIsIHRoaXMpO1xyXG4gICAgICAvLyByZXR1cm4gYmluZFAocG9zID0+IHJldHVyblAoZmFiKHBvcykpLCB0aGlzKTtcclxuICAgICAgcmV0dXJuIHRoaXMuYmluZChwYXJzZWRWYWx1ZSA9PiByZXR1cm5QKGZhYihwYXJzZWRWYWx1ZSkpKTtcclxuICAgIH0sXHJcbiAgICBhbmRUaGVuKHB4KSB7XHJcbiAgICAgIHJldHVybiBhbmRUaGVuKHRoaXMsIHB4KTtcclxuICAgIH0sXHJcbiAgICBvckVsc2UocHgpIHtcclxuICAgICAgcmV0dXJuIG9yRWxzZSh0aGlzLCBweCk7XHJcbiAgICB9LFxyXG4gICAgZGlzY2FyZEZpcnN0KHB4KSB7XHJcbiAgICAgIHJldHVybiBkaXNjYXJkRmlyc3QodGhpcywgcHgpO1xyXG4gICAgfSxcclxuICAgIGRpc2NhcmRTZWNvbmQocHgpIHtcclxuICAgICAgcmV0dXJuIGRpc2NhcmRTZWNvbmQodGhpcywgcHgpO1xyXG4gICAgfSxcclxuICAgIGJpbmQoZmFtYikge1xyXG4gICAgICByZXR1cm4gYmluZFAoZmFtYiwgdGhpcyk7XHJcbiAgICB9LFxyXG4gICAgc2V0TGFiZWwobmV3TGFiZWwpIHtcclxuICAgICAgcmV0dXJuIF9zZXRMYWJlbCh0aGlzLCBuZXdMYWJlbCk7XHJcbiAgICB9LFxyXG4gIH07XHJcbn1cclxuIl19