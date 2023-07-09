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
  exports.sepBy1 = sepBy1;
  exports.sepBy1Marco = sepBy1Marco;
  exports.sepBy = sepBy;
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
    }).setLabel('returnP ' + value.toString());
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
  function sepBy1(px, sep) {
    return px.andThen(many(sep.discardFirst(px))).fmap(function (_ref9) {
      var _ref10 = _slicedToArray(_ref9, 2),
          r = _ref10[0],
          rlist = _ref10[1];

      return [r].concat(rlist);
    });
  }

  // my version works just fine (almost - succeeds akso with zero matches)...
  function sepBy1Marco(valueP, separatorP) {
    return many(many1(valueP).discardSecond(opt(separatorP))).fmap(function (res) {
      return res.map(function (_ref11) {
        var _ref12 = _slicedToArray(_ref11, 1),
            x = _ref12[0];

        return x;
      });
    });
  }

  // sepBy1 working on zero occurrences
  function sepBy(px, sep) {
    return sepBy1(px, sep).orElse(returnP([]));
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2pzL3BhcnNlcnMuanMiXSwibmFtZXMiOlsicGNoYXIiLCJwZGlnaXQiLCJwcmVjZWRlZEJ5UCIsIm5vdFByZWNlZGVkQnlQIiwiZm9sbG93ZWRCeVAiLCJub3RGb2xsb3dlZEJ5UCIsImFuZFRoZW5CaW5kIiwiY2hvaWNlIiwiYW55T2YiLCJmbWFwIiwicmV0dXJuUCIsImFwcGx5UHgiLCJhcHBseVAiLCJsaWZ0MiIsInNlcXVlbmNlUCIsInNlcXVlbmNlUDIiLCJwc3RyaW5nIiwic3RyaW5nUCIsInplcm9Pck1vcmUiLCJtYW55IiwibWFueUNoYXJzIiwibWFueTEiLCJtYW55Q2hhcnMxIiwib3B0Iiwib3B0Qm9vayIsInNlcEJ5MSIsInNlcEJ5MU1hcmNvIiwic2VwQnkiLCJiZXR3ZWVuIiwiYmV0d2VlblBhcmVucyIsImJpbmRQIiwidGFwUCIsImxvZ1AiLCJwd29yZCIsInRyaW1QIiwicGFyc2VyIiwiY2hhclBhcnNlciIsInBvcyIsIlBvc2l0aW9uIiwiZnJvbVRleHQiLCJvcHRDaGFyIiwiY2hhciIsImlzTm90aGluZyIsIlZhbGlkYXRpb24iLCJGYWlsdXJlIiwiVHVwbGUiLCJUcmlwbGUiLCJ2YWx1ZSIsIlN1Y2Nlc3MiLCJQYWlyIiwiaW5jclBvcyIsImRpZ2l0UGFyc2VyIiwicGFyc2VJbnQiLCJkaWdpdCIsInByZWRpY2F0ZUJhc2VkUGFyc2VyIiwicHJlZCIsImxhYmVsIiwic3RhcnRPZklucHV0UCIsImRlY3JQb3MiLCJzdWNjZWVkUCIsInJ1biIsImZhaWxQIiwic2V0TGFiZWwiLCJub3RTdGFydE9mSW5wdXRQIiwiaXNKdXN0IiwiZW5kT2ZJbnB1dFAiLCJyZXN0Iiwibm90RW5kT2ZJbnB1dFAiLCJyZXN1bHQiLCJjMSIsImMyIiwicmVzMiIsImlzU3VjY2VzcyIsInJlczEiLCJlcnIiLCJpc0ZhaWx1cmUiLCJhbmRUaGVuIiwicDEiLCJwMiIsImJpbmQiLCJwYXJzZWRWYWx1ZTEiLCJwYXJzZWRWYWx1ZTIiLCJvckVsc2UiLCJwYXJzZXJzIiwicmVkdWNlUmlnaHQiLCJjdXJyIiwicmVkdWNlIiwiYWNjIiwiY2hhcnNBcnJheSIsIm1hcCIsImxvd2VyY2FzZVAiLCJ1cHBlcmNhc2VQIiwibGV0dGVyUCIsImRpZ2l0UCIsIndoaXRlUCIsImZhYiIsInBhcnNlcjEiLCJ0b1N0cmluZyIsInJlcyIsImZQIiwieFAiLCJmIiwieCIsInBhcnNlZFZhbHVlZiIsInBhcnNlZFZhbHVleCIsImZhYWIiLCJwYXJzZXIyIiwiYXBwbHkiLCJfY29ucyIsInkiLCJzdHIiLCJzcGxpdCIsImpvaW4iLCJyZXNOIiwiY29uY2F0IiwidGltZXMiLCJ0aW1lc19kZWZpbmVkIiwicmVzdWx0TGVuZ3RoIiwibGVuZ3RoIiwiYXJyYSIsImRlZmF1bHRWYWx1ZSIsImlzRGVmYXVsdCIsIk1heWJlIiwiSnVzdCIsIm91dGNvbWUiLCJOb3RoaW5nIiwicFgiLCJzb21lUCIsIm5vbmVQIiwiZGlzY2FyZFNlY29uZCIsImRpc2NhcmRGaXJzdCIsInB4Iiwic2VwIiwiciIsInJsaXN0IiwidmFsdWVQIiwic2VwYXJhdG9yUCIsInAzIiwiZmFtYiIsImZuIiwiY29uc29sZSIsImxvZyIsIndvcmQiLCJ4cyIsIl9zZXRMYWJlbCIsIm5ld0xhYmVsIiwidHlwZSIsInBhcnNlZFZhbHVlIl0sIm1hcHBpbmdzIjoiOzs7Ozs7O1VBK0VnQkEsSyxHQUFBQSxLO1VBTUFDLE0sR0FBQUEsTTtVQUlBQyxXLEdBQUFBLFc7VUFlQUMsYyxHQUFBQSxjO1VBa0JBQyxXLEdBQUFBLFc7VUFlQUMsYyxHQUFBQSxjO1VBa0NBQyxXLEdBQUFBLFc7VUF5QkFDLE0sR0FBQUEsTTtVQUtBQyxLLEdBQUFBLEs7VUFXQUMsSSxHQUFBQSxJO1VBU0FDLE8sR0FBQUEsTztVQU1BQyxPLEdBQUFBLE87VUFPQUMsTSxHQUFBQSxNO1VBVUFDLEssR0FBQUEsSztVQVVBQyxTLEdBQUFBLFM7VUFRQUMsVSxHQUFBQSxVO1VBT0FDLE8sR0FBQUEsTztVQUtBQyxPLEdBQUFBLE87VUFNQUMsVSxHQUFB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QVZBLEVBVUs7QUFDUjtBQUNBO0FBQ0EsZUFBTyxLQUFLaEIsSUFBTCxDQUFVO0FBQUEsaUJBQWVyRSxRQUFRcUYsSUFBSW9ELFdBQUosQ0FBUixDQUFmO0FBQUEsU0FBVixDQUFQO0FBQ0QsT0FkSTtBQWVMdkUsYUFmSyxtQkFlR3VELEVBZkgsRUFlTztBQUNWLGVBQU92RCxTQUFRLElBQVIsRUFBY3VELEVBQWQsQ0FBUDtBQUNELE9BakJJO0FBa0JMakQsWUFsQkssa0JBa0JFaUQsRUFsQkYsRUFrQk07QUFDVCxlQUFPakQsUUFBTyxJQUFQLEVBQWFpRCxFQUFiLENBQVA7QUFDRCxPQXBCSTtBQXFCTEQsa0JBckJLLHdCQXFCUUMsRUFyQlIsRUFxQlk7QUFDZixlQUFPRCxjQUFhLElBQWIsRUFBbUJDLEVBQW5CLENBQVA7QUFDRCxPQXZCSTtBQXdCTEYsbUJBeEJLLHlCQXdCU0UsRUF4QlQsRUF3QmE7QUFDaEIsZUFBT0YsZUFBYyxJQUFkLEVBQW9CRSxFQUFwQixDQUFQO0FBQ0QsT0ExQkk7QUEyQkxwRCxVQTNCSyxnQkEyQkEyRCxJQTNCQSxFQTJCTTtBQUNULGVBQU81RyxNQUFNNEcsSUFBTixFQUFZLElBQVosQ0FBUDtBQUNELE9BN0JJO0FBOEJMNUUsY0E5Qkssb0JBOEJJbUYsUUE5QkosRUE4QmM7QUFDakIsZUFBT0QsVUFBVSxJQUFWLEVBQWdCQyxRQUFoQixDQUFQO0FBQ0Q7QUFoQ0ksS0FBUDtBQWtDRCIsImZpbGUiOiJwYXJzZXJzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLypcblRoZSBNSVQgTGljZW5zZSAoTUlUKVxuXG5Db3B5cmlnaHQgKGMpIDIwMTQgTWFyY28gRmF1c3RpbmVsbGlcblxuUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxub2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxuaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xudG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG5mdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuXG5UaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpbiBhbGxcbmNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG5cblRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1JcbklNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxuRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXG5BVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSXG5MSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLFxuT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEVcblNPRlRXQVJFLlxuKi9cblxuLy8gY2ZyLiBcIlVuZGVyc3RhbmRpbmcgUGFyc2VyIENvbWJpbmF0b3JzXCIgKEYjIGZvciBGdW4gYW5kIFByb2ZpdClcblxuaW1wb3J0IHtcbiAgVHVwbGUsIC8vIGNvdXBsZXMgYW5kIHRyaXBsZXNcbiAgUG9zaXRpb24sIC8vIGEgMkQgYnVmZmVyIGFuZCB0d28gcG9pbnRlcnM6IFBvc2l0aW9uKHJvd3MgPSBbXSwgcm93ID0gMCwgY29sID0gMClcbn0gZnJvbSAnLi90dXBsZXMnO1xuaW1wb3J0IHsgTWF5YmUgfSBmcm9tICcuL21heWJlJzsgLy8gSnVzdCBvciBOb3RoaW5nXG5pbXBvcnQgeyBWYWxpZGF0aW9uIH0gZnJvbSAnLi92YWxpZGF0aW9uJzsgLy8gU3VjY2VzcyBvciBGYWlsdXJlXG5cbmNvbnN0IGNoYXJQYXJzZXIgPSBjaGFyID0+IHBvcyA9PiB7XG4gIGlmICh0eXBlb2YgcG9zID09PSAnc3RyaW5nJykgcG9zID0gUG9zaXRpb24uZnJvbVRleHQocG9zKTtcbiAgY29uc3Qgb3B0Q2hhciA9IHBvcy5jaGFyKCk7XG4gIGlmIChvcHRDaGFyLmlzTm90aGluZykgcmV0dXJuIFZhbGlkYXRpb24uRmFpbHVyZShUdXBsZS5UcmlwbGUoJ2NoYXJQYXJzZXInLCAnbm8gbW9yZSBpbnB1dCcsIHBvcykpO1xuICBpZiAob3B0Q2hhci52YWx1ZSA9PT0gY2hhcikgcmV0dXJuIFZhbGlkYXRpb24uU3VjY2VzcyhUdXBsZS5QYWlyKGNoYXIsIHBvcy5pbmNyUG9zKCkpKTtcbiAgcmV0dXJuIFZhbGlkYXRpb24uRmFpbHVyZShUdXBsZS5UcmlwbGUoJ2NoYXJQYXJzZXInLCAnd2FudGVkICcgKyBjaGFyICsgJzsgZ290ICcgKyBvcHRDaGFyLnZhbHVlLCBwb3MpKTtcbn07XG5cbmNvbnN0IGRpZ2l0UGFyc2VyID0gZGlnaXQgPT4gcG9zID0+IHtcbiAgaWYgKHR5cGVvZiBwb3MgPT09ICdzdHJpbmcnKSBwb3MgPSBQb3NpdGlvbi5mcm9tVGV4dChwb3MpO1xuICBjb25zdCBvcHRDaGFyID0gcG9zLmNoYXIoKTtcbiAgaWYgKG9wdENoYXIuaXNOb3RoaW5nKSByZXR1cm4gVmFsaWRhdGlvbi5GYWlsdXJlKFR1cGxlLlRyaXBsZSgnZGlnaXRQYXJzZXInLCAnbm8gbW9yZSBpbnB1dCcsIHBvcykpO1xuICBpZiAocGFyc2VJbnQob3B0Q2hhci52YWx1ZSwgMTApID09PSBkaWdpdCkgcmV0dXJuIFZhbGlkYXRpb24uU3VjY2VzcyhUdXBsZS5QYWlyKGRpZ2l0LCBwb3MuaW5jclBvcygpKSk7XG4gIHJldHVybiBWYWxpZGF0aW9uLkZhaWx1cmUoVHVwbGUuVHJpcGxlKCdkaWdpdFBhcnNlcicsICd3YW50ZWQgJyArIGRpZ2l0ICsgJzsgZ290ICcgKyBvcHRDaGFyLnZhbHVlLCBwb3MpKTtcbn07XG5cbmNvbnN0IHByZWRpY2F0ZUJhc2VkUGFyc2VyID0gKHByZWQsIGxhYmVsKSA9PiBwb3MgPT4ge1xuICBpZiAodHlwZW9mIHBvcyA9PT0gJ3N0cmluZycpIHBvcyA9IFBvc2l0aW9uLmZyb21UZXh0KHBvcyk7XG4gIGNvbnN0IG9wdENoYXIgPSBwb3MuY2hhcigpO1xuICBpZiAob3B0Q2hhci5pc05vdGhpbmcpIHJldHVybiBWYWxpZGF0aW9uLkZhaWx1cmUoVHVwbGUuVHJpcGxlKGxhYmVsLCAnbm8gbW9yZSBpbnB1dCcsIHBvcykpO1xuICBpZiAocHJlZChvcHRDaGFyLnZhbHVlKSkgcmV0dXJuIFZhbGlkYXRpb24uU3VjY2VzcyhUdXBsZS5QYWlyKG9wdENoYXIudmFsdWUsIHBvcy5pbmNyUG9zKCkpKTtcbiAgcmV0dXJuIFZhbGlkYXRpb24uRmFpbHVyZShUdXBsZS5UcmlwbGUobGFiZWwsICd1bmV4cGVjdGVkIGNoYXI6ICcgKyBvcHRDaGFyLnZhbHVlLCBwb3MpKTtcbn07XG5cbmV4cG9ydCB7IGNoYXJQYXJzZXIsIGRpZ2l0UGFyc2VyLCBwcmVkaWNhdGVCYXNlZFBhcnNlciB9O1xuXG5leHBvcnQgY29uc3Qgc3RhcnRPZklucHV0UCA9XG4gIHBhcnNlcihwb3MgPT4gKChwb3MuZGVjclBvcygpLmNoYXIoKS5pc05vdGhpbmcpXG4gICAgPyBzdWNjZWVkUC5ydW4ocG9zKVxuICAgIDogZmFpbFAucnVuKHBvcykpKS5zZXRMYWJlbCgnXicpO1xuXG5leHBvcnQgY29uc3Qgbm90U3RhcnRPZklucHV0UCA9XG4gIHBhcnNlcihwb3MgPT4gKChwb3MuZGVjclBvcygpLmNoYXIoKS5pc0p1c3QpXG4gICAgPyBzdWNjZWVkUC5ydW4ocG9zKVxuICAgIDogZmFpbFAucnVuKHBvcykpKS5zZXRMYWJlbCgnbm90XicpO1xuXG5leHBvcnQgY29uc3QgZW5kT2ZJbnB1dFAgPVxuICBwYXJzZXIocG9zID0+ICgocG9zLnJlc3QoKSA9PT0gJycpXG4gICAgPyBzdWNjZWVkUC5ydW4ocG9zKVxuICAgIDogZmFpbFAucnVuKHBvcykpKS5zZXRMYWJlbCgnJCcpO1xuXG5leHBvcnQgY29uc3Qgbm90RW5kT2ZJbnB1dFAgPVxuICBwYXJzZXIocG9zID0+ICgocG9zLnJlc3QoKSAhPT0gJycpXG4gICAgPyBzdWNjZWVkUC5ydW4ocG9zKVxuICAgIDogZmFpbFAucnVuKHBvcykpKS5zZXRMYWJlbCgnbm90JCcpO1xuXG5leHBvcnQgZnVuY3Rpb24gcGNoYXIoY2hhcikge1xuICBjb25zdCBsYWJlbCA9ICdwY2hhcl8nICsgY2hhcjtcbiAgY29uc3QgcmVzdWx0ID0gcG9zID0+IGNoYXJQYXJzZXIoY2hhcikocG9zKTtcbiAgcmV0dXJuIHBhcnNlcihyZXN1bHQsIGxhYmVsKS5zZXRMYWJlbChsYWJlbCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwZGlnaXQoZGlnaXQpIHtcbiAgcmV0dXJuIHBhcnNlcihwb3MgPT4gZGlnaXRQYXJzZXIoZGlnaXQpKHBvcyksICdwZGlnaXRfJyArIGRpZ2l0KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHByZWNlZGVkQnlQKGMxLCBjMikge1xuICBjb25zdCBsYWJlbCA9IGMyICsgJyBwcmVjZWRlZCBieSAnICsgYzE7XG4gIHJldHVybiBwYXJzZXIocG9zID0+IHtcbiAgICBjb25zdCByZXMyID0gcGNoYXIoYzIpLnJ1bihwb3MpO1xuICAgIGlmIChyZXMyLmlzU3VjY2Vzcykge1xuICAgICAgY29uc3QgcmVzMSA9IHBjaGFyKGMxKS5ydW4ocmVzMi52YWx1ZVsxXS5kZWNyUG9zKDIpKTtcbiAgICAgIGlmIChyZXMxLmlzU3VjY2Vzcykge1xuICAgICAgICByZXR1cm4gVmFsaWRhdGlvbi5TdWNjZXNzKFR1cGxlLlBhaXIoYzIsIHJlczIudmFsdWVbMV0pKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBWYWxpZGF0aW9uLkZhaWx1cmUoVHVwbGUuVHJpcGxlKGxhYmVsLCByZXMxLnZhbHVlWzFdLCByZXMxLnZhbHVlWzJdKSk7XG4gICAgfVxuICAgIHJldHVybiBWYWxpZGF0aW9uLkZhaWx1cmUoVHVwbGUuVHJpcGxlKGxhYmVsLCByZXMyLnZhbHVlWzFdLCByZXMyLnZhbHVlWzJdKSk7XG4gIH0sIGxhYmVsKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG5vdFByZWNlZGVkQnlQKGMxLCBjMikge1xuICBjb25zdCBsYWJlbCA9IGMyICsgJyBub3QgcHJlY2VkZWQgYnkgJyArIGMxO1xuICByZXR1cm4gcGFyc2VyKHBvcyA9PiB7XG4gICAgY29uc3QgcmVzMiA9IHBjaGFyKGMyKS5ydW4ocG9zKTtcbiAgICBpZiAocmVzMi5pc1N1Y2Nlc3MpIHtcbiAgICAgIGxldCByZXMxID0gVmFsaWRhdGlvbi5GYWlsdXJlKCk7XG4gICAgICB0cnkgeyAvLyBjcmFzaCBnb2luZyBiYWNrIGJleW9uZCBzdGFydCBvZiBpbnB1dCA9PiBva1xuICAgICAgICByZXMxID0gcGNoYXIoYzEpLnJ1bihyZXMyLnZhbHVlWzFdLmRlY3JQb3MoMikpO1xuICAgICAgfSBjYXRjaCAoZXJyKSB7fVxuICAgICAgaWYgKHJlczEuaXNGYWlsdXJlKSB7XG4gICAgICAgIHJldHVybiBWYWxpZGF0aW9uLlN1Y2Nlc3MoVHVwbGUuUGFpcihjMiwgcmVzMi52YWx1ZVsxXSkpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIFZhbGlkYXRpb24uRmFpbHVyZShUdXBsZS5UcmlwbGUobGFiZWwsIHJlczEudmFsdWVbMV0sIHJlczEudmFsdWVbMl0pKTtcbiAgICB9XG4gICAgcmV0dXJuIFZhbGlkYXRpb24uRmFpbHVyZShUdXBsZS5UcmlwbGUobGFiZWwsIHJlczIudmFsdWVbMV0sIHJlczIudmFsdWVbMl0pKTtcbiAgfSwgbGFiZWwpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZm9sbG93ZWRCeVAoYzEsIGMyKSB7XG4gIGNvbnN0IGxhYmVsID0gYzIgKyAnIGZvbGxvd2VkIGJ5ICcgKyBjMTtcbiAgcmV0dXJuIHBhcnNlcihwb3MgPT4ge1xuICAgIGNvbnN0IHJlczIgPSBwY2hhcihjMikucnVuKHBvcyk7XG4gICAgaWYgKHJlczIuaXNTdWNjZXNzKSB7XG4gICAgICBjb25zdCByZXMxID0gcGNoYXIoYzEpLnJ1bihyZXMyLnZhbHVlWzFdKTsgLy8gbm8gbmVlZCB0byBpbmNyZW1lbnQgcG9zXG4gICAgICBpZiAocmVzMS5pc1N1Y2Nlc3MpIHtcbiAgICAgICAgcmV0dXJuIFZhbGlkYXRpb24uU3VjY2VzcyhUdXBsZS5QYWlyKGMyLCByZXMyLnZhbHVlWzFdKSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gVmFsaWRhdGlvbi5GYWlsdXJlKFR1cGxlLlRyaXBsZShsYWJlbCwgcmVzMS52YWx1ZVsxXSwgcmVzMS52YWx1ZVsyXSkpO1xuICAgIH1cbiAgICByZXR1cm4gVmFsaWRhdGlvbi5GYWlsdXJlKFR1cGxlLlRyaXBsZShsYWJlbCwgcmVzMi52YWx1ZVsxXSwgcmVzMi52YWx1ZVsyXSkpO1xuICB9LCBsYWJlbCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBub3RGb2xsb3dlZEJ5UChjMSwgYzIpIHtcbiAgY29uc3QgbGFiZWwgPSBjMiArICcgbm90IGZvbGxvd2VkIGJ5ICcgKyBjMTtcbiAgcmV0dXJuIHBhcnNlcihwb3MgPT4ge1xuICAgIGNvbnN0IHJlczIgPSBwY2hhcihjMikucnVuKHBvcyk7XG4gICAgaWYgKHJlczIuaXNTdWNjZXNzKSB7XG4gICAgICBsZXQgcmVzMSA9IFZhbGlkYXRpb24uRmFpbHVyZSgpO1xuICAgICAgdHJ5IHsgLy8gY3Jhc2ggZ29pbmcgZG93biBiZXlvbmQgZW5kIG9mIGlucHV0ID0+IG9rXG4gICAgICAgIHJlczEgPSBwY2hhcihjMSkucnVuKHJlczIudmFsdWVbMV0pO1xuICAgICAgfSBjYXRjaCAoZXJyKSB7fVxuICAgICAgaWYgKHJlczEuaXNGYWlsdXJlKSB7XG4gICAgICAgIHJldHVybiBWYWxpZGF0aW9uLlN1Y2Nlc3MoVHVwbGUuUGFpcihjMiwgcmVzMi52YWx1ZVsxXSkpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIFZhbGlkYXRpb24uRmFpbHVyZShUdXBsZS5UcmlwbGUobGFiZWwsIHJlczEudmFsdWVbMV0sIHJlczEudmFsdWVbMl0pKTtcbiAgICB9XG4gICAgcmV0dXJuIFZhbGlkYXRpb24uRmFpbHVyZShUdXBsZS5UcmlwbGUobGFiZWwsIHJlczIudmFsdWVbMV0sIHJlczIudmFsdWVbMl0pKTtcbiAgfSwgbGFiZWwpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYW5kVGhlbihwMSwgcDIpIHtcbiAgY29uc3QgbGFiZWwgPSBwMS5sYWJlbCArICcgYW5kVGhlbiAnICsgcDIubGFiZWw7XG4gIHJldHVybiBwYXJzZXIocG9zID0+IHtcbiAgICBjb25zdCByZXMxID0gcDEucnVuKHBvcyk7XG4gICAgaWYgKHJlczEuaXNTdWNjZXNzKSB7XG4gICAgICBjb25zdCByZXMyID0gcDIucnVuKHJlczEudmFsdWVbMV0pO1xuICAgICAgaWYgKHJlczIuaXNTdWNjZXNzKSB7XG4gICAgICAgIHJldHVybiBWYWxpZGF0aW9uLlN1Y2Nlc3MoVHVwbGUuUGFpcihUdXBsZS5QYWlyKHJlczEudmFsdWVbMF0sIHJlczIudmFsdWVbMF0pLCByZXMyLnZhbHVlWzFdKSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gVmFsaWRhdGlvbi5GYWlsdXJlKFR1cGxlLlRyaXBsZShsYWJlbCwgcmVzMi52YWx1ZVsxXSwgcmVzMi52YWx1ZVsyXSkpO1xuICAgIH1cbiAgICByZXR1cm4gVmFsaWRhdGlvbi5GYWlsdXJlKFR1cGxlLlRyaXBsZShsYWJlbCwgcmVzMS52YWx1ZVsxXSwgcmVzMS52YWx1ZVsyXSkpO1xuICB9LCBsYWJlbCk7XG59XG5cbi8vIHVzaW5nIGJpbmRcbmV4cG9ydCBmdW5jdGlvbiBhbmRUaGVuQmluZChwMSwgcDIpIHtcbiAgcmV0dXJuIHAxLmJpbmQocGFyc2VkVmFsdWUxID0+IHtcbiAgICByZXR1cm4gcDIuYmluZChwYXJzZWRWYWx1ZTIgPT4ge1xuICAgICAgcmV0dXJuIHJldHVyblAoVHVwbGUuUGFpcihwYXJzZWRWYWx1ZTEsIHBhcnNlZFZhbHVlMikpO1xuICAgIH0pO1xuICB9KS5zZXRMYWJlbChwMS5sYWJlbCArICcgYW5kVGhlbiAnICsgcDIubGFiZWwpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gb3JFbHNlKHAxLCBwMikge1xuICBjb25zdCBsYWJlbCA9IHAxLmxhYmVsICsgJyBvckVsc2UgJyArIHAyLmxhYmVsO1xuICByZXR1cm4gcGFyc2VyKHBvcyA9PiB7XG4gICAgY29uc3QgcmVzMSA9IHAxLnJ1bihwb3MpO1xuICAgIGlmIChyZXMxLmlzU3VjY2VzcykgcmV0dXJuIHJlczE7XG4gICAgY29uc3QgcmVzMiA9IHAyLnJ1bihwb3MpO1xuICAgIGlmIChyZXMyLmlzU3VjY2VzcykgcmV0dXJuIHJlczI7XG4gICAgcmV0dXJuIFZhbGlkYXRpb24uRmFpbHVyZShUdXBsZS5UcmlwbGUobGFiZWwsIHJlczIudmFsdWVbMV0sIHJlczIudmFsdWVbMl0pKTtcbiAgfSwgbGFiZWwpLnNldExhYmVsKGxhYmVsKTtcbn1cblxuZXhwb3J0IGNvbnN0IGZhaWxQID0gcGFyc2VyKHBvcyA9PiBWYWxpZGF0aW9uLkZhaWx1cmUoVHVwbGUuVHJpcGxlKCcnLCAnZmFpbCcsIHBvcykpKVxuICAuc2V0TGFiZWwoJ2ZhaWxQJyk7XG5cbmV4cG9ydCBjb25zdCBzdWNjZWVkUCA9IHBhcnNlcihwb3MgPT4gVmFsaWRhdGlvbi5TdWNjZXNzKFR1cGxlLlBhaXIoJycsIHBvcyksICdzdWNjZWVkJykpXG4gIC5zZXRMYWJlbCgnc3VjY2VlZFAnKTtcblxuZXhwb3J0IGZ1bmN0aW9uIGNob2ljZShwYXJzZXJzKSB7XG4gIHJldHVybiBwYXJzZXJzLnJlZHVjZVJpZ2h0KChyZXN0LCBjdXJyKSA9PiBvckVsc2UoY3VyciwgcmVzdCksIGZhaWxQKVxuICAgIC5zZXRMYWJlbCgnY2hvaWNlICcgKyBwYXJzZXJzLnJlZHVjZSgoYWNjLCBjdXJyKSA9PiBhY2MgKyAnLycgKyBjdXJyLmxhYmVsLCAnJykpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYW55T2YoY2hhcnNBcnJheSkge1xuICByZXR1cm4gY2hvaWNlKGNoYXJzQXJyYXkubWFwKHBjaGFyKSlcbiAgICAuc2V0TGFiZWwoJ2FueU9mICcgKyBjaGFyc0FycmF5LnJlZHVjZSgoYWNjLCBjdXJyKSA9PiBhY2MgKyBjdXJyLCAnJykpO1xufVxuXG5leHBvcnQgY29uc3QgbG93ZXJjYXNlUCA9IGFueU9mKFsnYScsICdiJywgJ2MnLCAnZCcsICdlJywgJ2YnLCAnZycsICdoJywgJ2knLCAnaicsICdrJywgJ2wnLCAnbScsICduJywgJ28nLCAncCcsICdxJywgJ3InLCAncycsICd0JywgJ3UnLCAndicsICd3JywgJ3gnLCAneScsICd6J10pLnNldExhYmVsKCdsb3dlcmNhc2VQJyk7XG5leHBvcnQgY29uc3QgdXBwZXJjYXNlUCA9IGFueU9mKFsnQScsICdCJywgJ0MnLCAnRCcsICdFJywgJ0YnLCAnRycsICdIJywgJ0knLCAnSicsICdLJywgJ0wnLCAnTScsICdOJywgJ08nLCAnUCcsICdRJywgJ1InLCAnUycsICdUJywgJ1UnLCAnVicsICdXJywgJ1gnLCAnWScsICdaJ10pLnNldExhYmVsKCd1cHBlcmNhc2VQJyk7XG5leHBvcnQgY29uc3QgbGV0dGVyUCA9IGxvd2VyY2FzZVAub3JFbHNlKHVwcGVyY2FzZVApLnNldExhYmVsKCdsZXR0ZXJQJyk7XG5leHBvcnQgY29uc3QgZGlnaXRQID0gYW55T2YoWycwJywgJzEnLCAnMicsICczJywgJzQnLCAnNScsICc2JywgJzcnLCAnOCcsICc5J10pLnNldExhYmVsKCdkaWdpdFAnKTtcbmV4cG9ydCBjb25zdCB3aGl0ZVAgPSBhbnlPZihbJyAnLCAnXFx0JywgJ1xcbicsICdcXHInXSkuc2V0TGFiZWwoJ3doaXRlUCcpO1xuXG5leHBvcnQgZnVuY3Rpb24gZm1hcChmYWIsIHBhcnNlcjEpIHtcbiAgY29uc3QgbGFiZWwgPSBwYXJzZXIxLmxhYmVsICsgJyBmbWFwICcgKyBmYWIudG9TdHJpbmcoKTtcbiAgcmV0dXJuIHBhcnNlcihwb3MgPT4ge1xuICAgIGNvbnN0IHJlcyA9IHBhcnNlcjEucnVuKHBvcyk7XG4gICAgaWYgKHJlcy5pc1N1Y2Nlc3MpIHJldHVybiBWYWxpZGF0aW9uLlN1Y2Nlc3MoVHVwbGUuUGFpcihmYWIocmVzLnZhbHVlWzBdKSwgcmVzLnZhbHVlWzFdKSk7XG4gICAgcmV0dXJuIFZhbGlkYXRpb24uRmFpbHVyZShUdXBsZS5UcmlwbGUobGFiZWwsIHJlcy52YWx1ZVsxXSwgcmVzLnZhbHVlWzJdKSk7XG4gIH0sIGxhYmVsKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJldHVyblAodmFsdWUpIHtcbiAgcmV0dXJuIHBhcnNlcihwb3MgPT4gVmFsaWRhdGlvbi5TdWNjZXNzKFR1cGxlLlBhaXIodmFsdWUsIHBvcykpKVxuICAgIC5zZXRMYWJlbChgcmV0dXJuUCAke3ZhbHVlLnRvU3RyaW5nKCl9YCk7XG59XG5cbi8vIHBhcnNlcihhIC0+IGIpIC0+IHBhcnNlcihhKSAtPiBwYXJzZXIoYilcbmV4cG9ydCBmdW5jdGlvbiBhcHBseVB4KGZQKSB7XG4gIHJldHVybiBmdW5jdGlvbih4UCkge1xuICAgIHJldHVybiBhbmRUaGVuKGZQLCB4UCkuZm1hcCgoW2YsIHhdKSA9PiBmKHgpKTtcbiAgfTtcbn1cblxuLy8gdXNpbmcgYmluZFxuZXhwb3J0IGZ1bmN0aW9uIGFwcGx5UChmUCkge1xuICByZXR1cm4gZnVuY3Rpb24oeFApIHtcbiAgICByZXR1cm4gZlAuYmluZChwYXJzZWRWYWx1ZWYgPT4ge1xuICAgICAgcmV0dXJuIHhQLmJpbmQocGFyc2VkVmFsdWV4ID0+IHtcbiAgICAgICAgcmV0dXJuIHJldHVyblAocGFyc2VkVmFsdWVmKHBhcnNlZFZhbHVleCkpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBsaWZ0MihmYWFiKSB7XG4gIHJldHVybiBmdW5jdGlvbihwYXJzZXIxKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKHBhcnNlcjIpIHtcbiAgICAgIC8vIHJldHVybiBhcHBseVAoYXBwbHlQKHJldHVyblAoZmFhYikpKHBhcnNlcjEpKShwYXJzZXIyKTtcbiAgICAgIHJldHVybiByZXR1cm5QKGZhYWIpLmFwcGx5KHBhcnNlcjEpLmFwcGx5KHBhcnNlcjIpOyAvLyB1c2luZyBpbnN0YW5jZSBtZXRob2RzXG4gICAgfTtcbiAgfTtcbn1cblxuLy8gdXNpbmcgbGlmdDIoY29ucylcbmV4cG9ydCBmdW5jdGlvbiBzZXF1ZW5jZVAocGFyc2Vycykge1xuICByZXR1cm4gcGFyc2Vyc1xuICAgIC5yZWR1Y2VSaWdodCgocmVzdCwgY3VycikgPT4ge1xuICAgICAgcmV0dXJuIGxpZnQyKF9jb25zKShjdXJyKShyZXN0KTtcbiAgICB9LCByZXR1cm5QKFtdKSk7XG59XG5cbi8vIHVzaW5nIG5haXZlIGFuZFRoZW4gJiYgZm1hcCAtLT4gcmV0dXJucyBzdHJpbmdzLCBub3QgYXJyYXlzIVxuZXhwb3J0IGZ1bmN0aW9uIHNlcXVlbmNlUDIocGFyc2Vycykge1xuICByZXR1cm4gcGFyc2Vyc1xuICAgIC5yZWR1Y2VSaWdodCgocmVzdCwgY3VycikgPT4ge1xuICAgICAgcmV0dXJuIGZtYXAoKFt4LCB5XSkgPT4geCArIHksIGFuZFRoZW4oY3VyciwgcmVzdCkpO1xuICAgIH0sIHJldHVyblAoJycpKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHBzdHJpbmcoc3RyKSB7XG4gIHJldHVybiBzZXF1ZW5jZVAoc3RyLnNwbGl0KCcnKS5tYXAocGNoYXIpKVxuICAgIC5zZXRMYWJlbCgncHN0cmluZyAnICsgc3RyKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHN0cmluZ1Aoc3RyKSB7XG4gIHJldHVybiBwc3RyaW5nKHN0cilcbiAgICAuZm1hcChyZXMgPT4gcmVzLmpvaW4oJycpKVxuICAgIC5zZXRMYWJlbCgnc3RyaW5nUCAnICsgc3RyKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHplcm9Pck1vcmUoeFApIHsgLy8gemVyb09yTW9yZSA6OiBwIGEgLT4gW2FdIC0+IHRyeSBbYV0gPSBwIGEgLT4gcCBbYV1cbiAgcmV0dXJuIHBvcyA9PiB7XG4gICAgY29uc3QgcmVzMSA9IHhQLnJ1bihwb3MpO1xuICAgIGlmIChyZXMxLmlzRmFpbHVyZSkgcmV0dXJuIFZhbGlkYXRpb24uU3VjY2VzcyhUdXBsZS5QYWlyKFtdLCBwb3MpKTtcbiAgICBjb25zdCByZXNOID0gemVyb09yTW9yZSh4UCkocmVzMS52YWx1ZVsxXSk7XG4gICAgcmV0dXJuIFZhbGlkYXRpb24uU3VjY2VzcyhUdXBsZS5QYWlyKFtyZXMxLnZhbHVlWzBdXS5jb25jYXQocmVzTi52YWx1ZVswXSksIHJlc04udmFsdWVbMV0pKTtcbiAgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1hbnkoeFAsIHRpbWVzKSB7XG4gIGNvbnN0IHRpbWVzX2RlZmluZWQgPSAodHlwZW9mIHRpbWVzICE9PSAndW5kZWZpbmVkJyk7XG4gIGNvbnN0IGxhYmVsID0gJ21hbnkgJyArIHhQLmxhYmVsXG4gICAgICAgICsgKCh0aW1lc19kZWZpbmVkKSA/ICcgdGltZXM9JyArIHRpbWVzIDogJycpO1xuICByZXR1cm4gcGFyc2VyKHBvcyA9PiB7XG4gICAgY29uc3QgcmVzID0gemVyb09yTW9yZSh4UCkocG9zKTtcbiAgICBpZiAodGltZXNfZGVmaW5lZCkgey8vIGRlYnVnZ2VyO1xuICAgICAgaWYgKHJlcy5pc0ZhaWx1cmUpIHJldHVybiByZXM7XG4gICAgICBjb25zdCByZXN1bHRMZW5ndGggPSByZXMudmFsdWVbMF0ubGVuZ3RoO1xuICAgICAgcmV0dXJuIChyZXN1bHRMZW5ndGggPT09IHRpbWVzKVxuICAgICAgICA/IHJlc1xuICAgICAgICA6IFZhbGlkYXRpb24uRmFpbHVyZShUdXBsZS5UcmlwbGUobGFiZWwsICd0aW1lcyBwYXJhbSB3YW50ZWQgJyArIHRpbWVzICsgJzsgZ290ICcgKyByZXN1bHRMZW5ndGgsIHBvcykpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzO1xuICB9LCBsYWJlbCkuc2V0TGFiZWwobGFiZWwpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbWFueUNoYXJzKHhQLCB0aW1lcykge1xuICByZXR1cm4gbWFueSh4UCwgdGltZXMpXG4gICAgLmZtYXAoYXJyYSA9PiBhcnJhLmpvaW4oJycpKVxuICAgIC5zZXRMYWJlbCgnbWFueUNoYXJzICcgKyB4UC5sYWJlbFxuICAgICAgICAgICAgKyAoKHR5cGVvZiB0aW1lcyAhPT0gJ3VuZGVmaW5lZCcpID8gJyB0aW1lcz0nICsgdGltZXMgOiAnJykpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbWFueTEoeFApIHtcbiAgY29uc3QgbGFiZWwgPSAnbWFueTEgJyArIHhQLmxhYmVsO1xuICByZXR1cm4gcGFyc2VyKHBvcyA9PiB7XG4gICAgY29uc3QgcmVzMSA9IHhQLnJ1bihwb3MpO1xuICAgIGlmIChyZXMxLmlzRmFpbHVyZSkgcmV0dXJuIHJlczE7XG4gICAgY29uc3QgcmVzTiA9IHplcm9Pck1vcmUoeFApKHJlczEudmFsdWVbMV0pO1xuICAgIHJldHVybiBWYWxpZGF0aW9uLlN1Y2Nlc3MoVHVwbGUuUGFpcihbcmVzMS52YWx1ZVswXV0uY29uY2F0KHJlc04udmFsdWVbMF0pLCByZXNOLnZhbHVlWzFdKSk7XG4gIH0sIGxhYmVsKS5zZXRMYWJlbChsYWJlbCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtYW55Q2hhcnMxKHhQKSB7XG4gIHJldHVybiBtYW55MSh4UClcbiAgICAuZm1hcChhcnJhID0+IGFycmEuam9pbignJykpXG4gICAgLnNldExhYmVsKCdtYW55Q2hhcnMxICcgKyB4UC5sYWJlbCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBvcHQoeFAsIGRlZmF1bHRWYWx1ZSkge1xuICBjb25zdCBpc0RlZmF1bHQgPSAodHlwZW9mIGRlZmF1bHRWYWx1ZSAhPT0gJ3VuZGVmaW5lZCcpO1xuICBjb25zdCBsYWJlbCA9ICdvcHQgJyArIHhQLmxhYmVsXG4gICAgICAgICsgKGlzRGVmYXVsdCA/ICcoZGVmYXVsdD0nICsgZGVmYXVsdFZhbHVlICsgJyknIDogJycpO1xuICByZXR1cm4gcGFyc2VyKHBvcyA9PiB7XG4gICAgY29uc3QgcmVzID0geFAuZm1hcChNYXliZS5KdXN0KS5ydW4ocG9zKTtcbiAgICBpZiAocmVzLmlzU3VjY2VzcykgcmV0dXJuIHJlcztcbiAgICBjb25zdCBvdXRjb21lID0gKGlzRGVmYXVsdCkgPyBNYXliZS5KdXN0KGRlZmF1bHRWYWx1ZSkgOiBNYXliZS5Ob3RoaW5nKCk7XG4gICAgcmV0dXJuIFZhbGlkYXRpb24uU3VjY2VzcyhUdXBsZS5QYWlyKG91dGNvbWUsIHBvcykpO1xuICB9LCBsYWJlbCkuc2V0TGFiZWwobGFiZWwpO1xufVxuXG4vLyBvcHQgZnJvbSB0aGUgYm9vayAtIHdvcmtzIG9rLCBidXQgdG9TdHJpbmcoKSBnaXZlcyBzdHJhbmdlIHJlc3VsdHNcbmV4cG9ydCBmdW5jdGlvbiBvcHRCb29rKHBYKSB7XG4gIGNvbnN0IHNvbWVQID0gcFguZm1hcChNYXliZS5KdXN0KTtcbiAgY29uc3Qgbm9uZVAgPSByZXR1cm5QKE1heWJlLk5vdGhpbmcpO1xuICByZXR1cm4gc29tZVAub3JFbHNlKG5vbmVQKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRpc2NhcmRTZWNvbmQocDEsIHAyKSB7XG4gIGNvbnN0IGxhYmVsID0gcDEubGFiZWwgKyAnIGRpc2NhcmRTZWNvbmQgJyArIHAyLmxhYmVsO1xuICByZXR1cm4gcGFyc2VyKHBvcyA9PiB7XG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXVudXNlZC12YXJzXG4gICAgcmV0dXJuIGFuZFRoZW4ocDEsIHAyKS5mbWFwKChbeCwgeV0pID0+IHgpLnJ1bihwb3MpO1xuICB9LCBsYWJlbCkuc2V0TGFiZWwobGFiZWwpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZGlzY2FyZEZpcnN0KHAxLCBwMikge1xuICBjb25zdCBsYWJlbCA9IHAxLmxhYmVsICsgJyBkaXNjYXJkRmlyc3QgJyArIHAyLmxhYmVsO1xuICByZXR1cm4gcGFyc2VyKHBvcyA9PiB7XG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXVudXNlZC12YXJzXG4gICAgcmV0dXJuIGFuZFRoZW4ocDEsIHAyKS5mbWFwKChbeCwgeV0pID0+IHkpLnJ1bihwb3MpO1xuICB9LCBsYWJlbCkuc2V0TGFiZWwobGFiZWwpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc2VwQnkxKHB4LCBzZXApIHtcbiAgcmV0dXJuIHB4LmFuZFRoZW4obWFueShzZXAuZGlzY2FyZEZpcnN0KHB4KSkpXG4gICAgLmZtYXAoKFtyLCBybGlzdF0pID0+IFtyXS5jb25jYXQocmxpc3QpKTtcbn1cblxuLy8gbXkgdmVyc2lvbiB3b3JrcyBqdXN0IGZpbmUgKGFsbW9zdCAtIHN1Y2NlZWRzIGFrc28gd2l0aCB6ZXJvIG1hdGNoZXMpLi4uXG5leHBvcnQgZnVuY3Rpb24gc2VwQnkxTWFyY28odmFsdWVQLCBzZXBhcmF0b3JQKSB7XG4gIHJldHVybiBtYW55KG1hbnkxKHZhbHVlUCkuZGlzY2FyZFNlY29uZChvcHQoc2VwYXJhdG9yUCkpKVxuICAgIC5mbWFwKHJlcyA9PiByZXMubWFwKChbeF0pID0+IHgpKTtcbn1cblxuLy8gc2VwQnkxIHdvcmtpbmcgb24gemVybyBvY2N1cnJlbmNlc1xuZXhwb3J0IGZ1bmN0aW9uIHNlcEJ5KHB4LCBzZXApIHtcbiAgcmV0dXJuIHNlcEJ5MShweCwgc2VwKS5vckVsc2UocmV0dXJuUChbXSkpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYmV0d2VlbihwMSwgcDIsIHAzKSB7XG4gIHJldHVybiBwMS5kaXNjYXJkRmlyc3QocDIpLmRpc2NhcmRTZWNvbmQocDMpXG4gICAgLnNldExhYmVsKCdiZXR3ZWVuICcgKyBwMS5sYWJlbCArICcvJyArIHAyLmxhYmVsICsgJy8nICsgcDMubGFiZWwpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYmV0d2VlblBhcmVucyhweCkge1xuICByZXR1cm4gYmV0d2VlbihwY2hhcignKCcpLCBweCwgcGNoYXIoJyknKSlcbiAgICAuc2V0TGFiZWwoJ2JldHdlZW5QYXJlbnMgJyArIHB4LmxhYmVsKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGJpbmRQKGZhbWIsIHB4KSB7XG4gIGNvbnN0IGxhYmVsID0gJ2JpbmRQIGFwcGxpZWQgdG8gJyArIHB4LmxhYmVsO1xuICByZXR1cm4gcGFyc2VyKHBvcyA9PiB7XG4gICAgY29uc3QgcmVzID0gcHgucnVuKHBvcyk7XG4gICAgaWYgKHJlcy5pc0ZhaWx1cmUpIHJldHVybiByZXM7XG4gICAgcmV0dXJuIGZhbWIocmVzLnZhbHVlWzBdKS5ydW4ocmVzLnZhbHVlWzFdKTtcbiAgfSwgbGFiZWwpLnNldExhYmVsKGxhYmVsKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHRhcFAocHgsIGZuKSB7XG4gIHJldHVybiBweC5iaW5kKHJlcyA9PiB7XG4gICAgZm4ocmVzKTtcbiAgICByZXR1cm4gcmV0dXJuUChyZXMpO1xuICB9KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGxvZ1AocHgpIHtcbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWNvbnNvbGVcbiAgcmV0dXJuIHRhcFAocHgsIHJlcyA9PiBjb25zb2xlLmxvZyhweC5sYWJlbCArICc6JyArIHJlcykpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcHdvcmQod29yZCkge1xuICByZXR1cm4gdHJpbVAocHN0cmluZyh3b3JkKSlcbiAgICAuc2V0TGFiZWwoJ3B3b3JkICcgKyB3b3JkKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHRyaW1QKHBYKSB7XG4gIHJldHVybiBvcHQobWFueSh3aGl0ZVApKVxuICAgIC5kaXNjYXJkRmlyc3QocFgpXG4gICAgLmRpc2NhcmRTZWNvbmQob3B0KG1hbnkod2hpdGVQKSkpXG4gICAgLnNldExhYmVsKCd0cmltICcgKyBwWC5sYWJlbCk7XG59XG5cbmZ1bmN0aW9uIF9jb25zKHgpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKHhzKSB7XG4gICAgcmV0dXJuIFt4XS5jb25jYXQoeHMpO1xuICB9O1xufVxuXG5mdW5jdGlvbiBfc2V0TGFiZWwocHgsIG5ld0xhYmVsKSB7XG4gIHJldHVybiBwYXJzZXIocG9zID0+IHtcbiAgICBjb25zdCByZXN1bHQgPSBweC5ydW4ocG9zKTtcbiAgICBpZiAocmVzdWx0LmlzRmFpbHVyZSkgcmV0dXJuIFZhbGlkYXRpb24uRmFpbHVyZShUdXBsZS5UcmlwbGUobmV3TGFiZWwsIHJlc3VsdC52YWx1ZVsxXSwgcmVzdWx0LnZhbHVlWzJdKSk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfSwgbmV3TGFiZWwpO1xufVxuXG4vLyB0aGUgcmVhbCB0aGluZy4uLlxuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlcihmbiwgbGFiZWwpIHtcbiAgcmV0dXJuIHtcbiAgICB0eXBlOiAncGFyc2VyJyxcbiAgICBsYWJlbCxcbiAgICBydW4ocG9zKSB7XG4gICAgICByZXR1cm4gZm4ocG9zKTtcbiAgICB9LFxuICAgIGFwcGx5KHB4KSB7XG4gICAgICByZXR1cm4gYXBwbHlQKHRoaXMpKHB4KTtcbiAgICAgIC8vIHJldHVybiB0aGlzLmJpbmQoYW5kVGhlbih0aGlzLCBweCkuZm1hcCgoW2YsIHhdKSA9PiBmKHgpKSkucnVuOyAvLyB3ZSBhcmUgdGhlIGZQXG4gICAgfSxcbiAgICBmbWFwKGZhYikge1xuICAgICAgLy8gcmV0dXJuIGZtYXAoZmFiLCB0aGlzKTtcbiAgICAgIC8vIHJldHVybiBiaW5kUChwb3MgPT4gcmV0dXJuUChmYWIocG9zKSksIHRoaXMpO1xuICAgICAgcmV0dXJuIHRoaXMuYmluZChwYXJzZWRWYWx1ZSA9PiByZXR1cm5QKGZhYihwYXJzZWRWYWx1ZSkpKTtcbiAgICB9LFxuICAgIGFuZFRoZW4ocHgpIHtcbiAgICAgIHJldHVybiBhbmRUaGVuKHRoaXMsIHB4KTtcbiAgICB9LFxuICAgIG9yRWxzZShweCkge1xuICAgICAgcmV0dXJuIG9yRWxzZSh0aGlzLCBweCk7XG4gICAgfSxcbiAgICBkaXNjYXJkRmlyc3QocHgpIHtcbiAgICAgIHJldHVybiBkaXNjYXJkRmlyc3QodGhpcywgcHgpO1xuICAgIH0sXG4gICAgZGlzY2FyZFNlY29uZChweCkge1xuICAgICAgcmV0dXJuIGRpc2NhcmRTZWNvbmQodGhpcywgcHgpO1xuICAgIH0sXG4gICAgYmluZChmYW1iKSB7XG4gICAgICByZXR1cm4gYmluZFAoZmFtYiwgdGhpcyk7XG4gICAgfSxcbiAgICBzZXRMYWJlbChuZXdMYWJlbCkge1xuICAgICAgcmV0dXJuIF9zZXRMYWJlbCh0aGlzLCBuZXdMYWJlbCk7XG4gICAgfSxcbiAgfTtcbn1cbiJdfQ==