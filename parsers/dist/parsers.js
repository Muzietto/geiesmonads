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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2pzL3BhcnNlcnMuanMiXSwibmFtZXMiOlsicGNoYXIiLCJwZGlnaXQiLCJwcmVjZWRlZEJ5UCIsIm5vdFByZWNlZGVkQnlQIiwiZm9sbG93ZWRCeVAiLCJub3RGb2xsb3dlZEJ5UCIsImFuZFRoZW5CaW5kIiwiY2hvaWNlIiwiYW55T2YiLCJmbWFwIiwicmV0dXJuUCIsImFwcGx5UHgiLCJhcHBseVAiLCJsaWZ0MiIsInNlcXVlbmNlUCIsInNlcXVlbmNlUDIiLCJwc3RyaW5nIiwic3RyaW5nUCIsInplcm9Pck1vcmUiLCJtYW55IiwibWFueUNoYXJzIiwibWFueTEiLCJtYW55Q2hhcnMxIiwib3B0Iiwib3B0Qm9vayIsInNlcEJ5MSIsInNlcEJ5MU1hcmNvIiwic2VwQnkiLCJiZXR3ZWVuIiwiYmV0d2VlblBhcmVucyIsImJpbmRQIiwidGFwUCIsImxvZ1AiLCJwd29yZCIsInRyaW1QIiwicGFyc2VyIiwiY2hhclBhcnNlciIsInBvcyIsIlBvc2l0aW9uIiwiZnJvbVRleHQiLCJvcHRDaGFyIiwiY2hhciIsImlzTm90aGluZyIsIlZhbGlkYXRpb24iLCJGYWlsdXJlIiwiVHVwbGUiLCJUcmlwbGUiLCJ2YWx1ZSIsIlN1Y2Nlc3MiLCJQYWlyIiwiaW5jclBvcyIsImRpZ2l0UGFyc2VyIiwicGFyc2VJbnQiLCJkaWdpdCIsInByZWRpY2F0ZUJhc2VkUGFyc2VyIiwicHJlZCIsImxhYmVsIiwic3RhcnRPZklucHV0UCIsImRlY3JQb3MiLCJzdWNjZWVkUCIsInJ1biIsImZhaWxQIiwic2V0TGFiZWwiLCJub3RTdGFydE9mSW5wdXRQIiwiaXNKdXN0IiwiZW5kT2ZJbnB1dFAiLCJyZXN0Iiwibm90RW5kT2ZJbnB1dFAiLCJyZXN1bHQiLCJjMSIsImMyIiwicmVzMiIsImlzU3VjY2VzcyIsInJlczEiLCJlcnIiLCJpc0ZhaWx1cmUiLCJhbmRUaGVuIiwicDEiLCJwMiIsImJpbmQiLCJwYXJzZWRWYWx1ZTEiLCJwYXJzZWRWYWx1ZTIiLCJvckVsc2UiLCJwYXJzZXJzIiwicmVkdWNlUmlnaHQiLCJjdXJyIiwicmVkdWNlIiwiYWNjIiwiY2hhcnNBcnJheSIsIm1hcCIsImxvd2VyY2FzZVAiLCJ1cHBlcmNhc2VQIiwibGV0dGVyUCIsImRpZ2l0UCIsIndoaXRlUCIsImZhYiIsInBhcnNlcjEiLCJ0b1N0cmluZyIsInJlcyIsImZQIiwieFAiLCJmIiwieCIsInBhcnNlZFZhbHVlZiIsInBhcnNlZFZhbHVleCIsImZhYWIiLCJwYXJzZXIyIiwiYXBwbHkiLCJfY29ucyIsInkiLCJzdHIiLCJzcGxpdCIsImpvaW4iLCJyZXNOIiwiY29uY2F0IiwidGltZXMiLCJ0aW1lc19kZWZpbmVkIiwicmVzdWx0TGVuZ3RoIiwibGVuZ3RoIiwiYXJyYSIsImRlZmF1bHRWYWx1ZSIsImlzRGVmYXVsdCIsIk1heWJlIiwiSnVzdCIsIm91dGNvbWUiLCJOb3RoaW5nIiwicFgiLCJzb21lUCIsIm5vbmVQIiwiZGlzY2FyZFNlY29uZCIsImRpc2NhcmRGaXJzdCIsInB4Iiwic2VwIiwiciIsInJsaXN0IiwidmFsdWVQIiwic2VwYXJhdG9yUCIsInAzIiwiZmFtYiIsImZuIiwiY29uc29sZSIsImxvZyIsIndvcmQiLCJ4cyIsIl9zZXRMYWJlbCIsIm5ld0xhYmVsIiwidHlwZSIsInBhcnNlZFZhbHVlIl0sIm1hcHBpbmdzIjoiOzs7Ozs7O1VBK0VnQkEsSyxHQUFBQSxLO1VBTUFDLE0sR0FBQUEsTTtVQUlBQyxXLEdBQUFBLFc7VUFlQUMsYyxHQUFBQSxjO1VBa0JBQyxXLEdBQUFBLFc7VUFlQUMsYyxHQUFBQSxjO1VBa0NBQyxXLEdBQUFBLFc7VUF5QkFDLE0sR0FBQUEsTTtVQUtBQyxLLEdBQUFBLEs7VUFXQUMsSSxHQUFBQSxJO1VBU0FDLE8sR0FBQUEsTztVQUtBQyxPLEdBQUFBLE87VUFPQUMsTSxHQUFBQSxNO1VBVUFDLEssR0FBQUEsSztVQVVBQyxTLEdBQUFBLFM7VUFRQUMsVSxHQUFBQSxVO1VBT0FDLE8sR0FBQUEsTztVQUtBQyxPLEdBQUFBLE87VUFNQUMsVSxHQUFB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QUFMLENBQVU7QUFBQSxpQkFBZXJFLFFBQVFxRixJQUFJb0QsV0FBSixDQUFSLENBQWY7QUFBQSxTQUFWLENBQVA7QUFDRCxPQWRJO0FBZUx2RSxhQWZLLG1CQWVHdUQsRUFmSCxFQWVPO0FBQ1YsZUFBT3ZELFNBQVEsSUFBUixFQUFjdUQsRUFBZCxDQUFQO0FBQ0QsT0FqQkk7QUFrQkxqRCxZQWxCSyxrQkFrQkVpRCxFQWxCRixFQWtCTTtBQUNULGVBQU9qRCxRQUFPLElBQVAsRUFBYWlELEVBQWIsQ0FBUDtBQUNELE9BcEJJO0FBcUJMRCxrQkFyQkssd0JBcUJRQyxFQXJCUixFQXFCWTtBQUNmLGVBQU9ELGNBQWEsSUFBYixFQUFtQkMsRUFBbkIsQ0FBUDtBQUNELE9BdkJJO0FBd0JMRixtQkF4QksseUJBd0JTRSxFQXhCVCxFQXdCYTtBQUNoQixlQUFPRixlQUFjLElBQWQsRUFBb0JFLEVBQXBCLENBQVA7QUFDRCxPQTFCSTtBQTJCTHBELFVBM0JLLGdCQTJCQTJELElBM0JBLEVBMkJNO0FBQ1QsZUFBTzVHLE1BQU00RyxJQUFOLEVBQVksSUFBWixDQUFQO0FBQ0QsT0E3Qkk7QUE4Qkw1RSxjQTlCSyxvQkE4QkltRixRQTlCSixFQThCYztBQUNqQixlQUFPRCxVQUFVLElBQVYsRUFBZ0JDLFFBQWhCLENBQVA7QUFDRDtBQWhDSSxLQUFQO0FBa0NEIiwiZmlsZSI6InBhcnNlcnMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuVGhlIE1JVCBMaWNlbnNlIChNSVQpXG5cbkNvcHlyaWdodCAoYykgMjAxNCBNYXJjbyBGYXVzdGluZWxsaVxuXG5QZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XG5vZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSBcIlNvZnR3YXJlXCIpLCB0byBkZWFsXG5pbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzXG50byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsXG5jb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcbmZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XG5cblRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluIGFsbFxuY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cblxuVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxuSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXG5GSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcbkFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcbkxJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXG5PVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRVxuU09GVFdBUkUuXG4qL1xuXG4vLyBjZnIuIFwiVW5kZXJzdGFuZGluZyBQYXJzZXIgQ29tYmluYXRvcnNcIiAoRiMgZm9yIEZ1biBhbmQgUHJvZml0KVxuXG5pbXBvcnQge1xuICBUdXBsZSwgLy8gY291cGxlcyBhbmQgdHJpcGxlc1xuICBQb3NpdGlvbiwgLy8gYSAyRCBidWZmZXIgYW5kIHR3byBwb2ludGVyczogUG9zaXRpb24ocm93cyA9IFtdLCByb3cgPSAwLCBjb2wgPSAwKVxufSBmcm9tICcuL3R1cGxlcyc7XG5pbXBvcnQgeyBNYXliZSB9IGZyb20gJy4vbWF5YmUnOyAvLyBKdXN0IG9yIE5vdGhpbmdcbmltcG9ydCB7IFZhbGlkYXRpb24gfSBmcm9tICcuL3ZhbGlkYXRpb24nOyAvLyBTdWNjZXNzIG9yIEZhaWx1cmVcblxuY29uc3QgY2hhclBhcnNlciA9IGNoYXIgPT4gcG9zID0+IHtcbiAgaWYgKHR5cGVvZiBwb3MgPT09ICdzdHJpbmcnKSBwb3MgPSBQb3NpdGlvbi5mcm9tVGV4dChwb3MpO1xuICBjb25zdCBvcHRDaGFyID0gcG9zLmNoYXIoKTtcbiAgaWYgKG9wdENoYXIuaXNOb3RoaW5nKSByZXR1cm4gVmFsaWRhdGlvbi5GYWlsdXJlKFR1cGxlLlRyaXBsZSgnY2hhclBhcnNlcicsICdubyBtb3JlIGlucHV0JywgcG9zKSk7XG4gIGlmIChvcHRDaGFyLnZhbHVlID09PSBjaGFyKSByZXR1cm4gVmFsaWRhdGlvbi5TdWNjZXNzKFR1cGxlLlBhaXIoY2hhciwgcG9zLmluY3JQb3MoKSkpO1xuICByZXR1cm4gVmFsaWRhdGlvbi5GYWlsdXJlKFR1cGxlLlRyaXBsZSgnY2hhclBhcnNlcicsICd3YW50ZWQgJyArIGNoYXIgKyAnOyBnb3QgJyArIG9wdENoYXIudmFsdWUsIHBvcykpO1xufTtcblxuY29uc3QgZGlnaXRQYXJzZXIgPSBkaWdpdCA9PiBwb3MgPT4ge1xuICBpZiAodHlwZW9mIHBvcyA9PT0gJ3N0cmluZycpIHBvcyA9IFBvc2l0aW9uLmZyb21UZXh0KHBvcyk7XG4gIGNvbnN0IG9wdENoYXIgPSBwb3MuY2hhcigpO1xuICBpZiAob3B0Q2hhci5pc05vdGhpbmcpIHJldHVybiBWYWxpZGF0aW9uLkZhaWx1cmUoVHVwbGUuVHJpcGxlKCdkaWdpdFBhcnNlcicsICdubyBtb3JlIGlucHV0JywgcG9zKSk7XG4gIGlmIChwYXJzZUludChvcHRDaGFyLnZhbHVlLCAxMCkgPT09IGRpZ2l0KSByZXR1cm4gVmFsaWRhdGlvbi5TdWNjZXNzKFR1cGxlLlBhaXIoZGlnaXQsIHBvcy5pbmNyUG9zKCkpKTtcbiAgcmV0dXJuIFZhbGlkYXRpb24uRmFpbHVyZShUdXBsZS5UcmlwbGUoJ2RpZ2l0UGFyc2VyJywgJ3dhbnRlZCAnICsgZGlnaXQgKyAnOyBnb3QgJyArIG9wdENoYXIudmFsdWUsIHBvcykpO1xufTtcblxuY29uc3QgcHJlZGljYXRlQmFzZWRQYXJzZXIgPSAocHJlZCwgbGFiZWwpID0+IHBvcyA9PiB7XG4gIGlmICh0eXBlb2YgcG9zID09PSAnc3RyaW5nJykgcG9zID0gUG9zaXRpb24uZnJvbVRleHQocG9zKTtcbiAgY29uc3Qgb3B0Q2hhciA9IHBvcy5jaGFyKCk7XG4gIGlmIChvcHRDaGFyLmlzTm90aGluZykgcmV0dXJuIFZhbGlkYXRpb24uRmFpbHVyZShUdXBsZS5UcmlwbGUobGFiZWwsICdubyBtb3JlIGlucHV0JywgcG9zKSk7XG4gIGlmIChwcmVkKG9wdENoYXIudmFsdWUpKSByZXR1cm4gVmFsaWRhdGlvbi5TdWNjZXNzKFR1cGxlLlBhaXIob3B0Q2hhci52YWx1ZSwgcG9zLmluY3JQb3MoKSkpO1xuICByZXR1cm4gVmFsaWRhdGlvbi5GYWlsdXJlKFR1cGxlLlRyaXBsZShsYWJlbCwgJ3VuZXhwZWN0ZWQgY2hhcjogJyArIG9wdENoYXIudmFsdWUsIHBvcykpO1xufTtcblxuZXhwb3J0IHsgY2hhclBhcnNlciwgZGlnaXRQYXJzZXIsIHByZWRpY2F0ZUJhc2VkUGFyc2VyIH07XG5cbmV4cG9ydCBjb25zdCBzdGFydE9mSW5wdXRQID1cbiAgcGFyc2VyKHBvcyA9PiAoKHBvcy5kZWNyUG9zKCkuY2hhcigpLmlzTm90aGluZylcbiAgICA/IHN1Y2NlZWRQLnJ1bihwb3MpXG4gICAgOiBmYWlsUC5ydW4ocG9zKSkpLnNldExhYmVsKCdeJyk7XG5cbmV4cG9ydCBjb25zdCBub3RTdGFydE9mSW5wdXRQID1cbiAgcGFyc2VyKHBvcyA9PiAoKHBvcy5kZWNyUG9zKCkuY2hhcigpLmlzSnVzdClcbiAgICA/IHN1Y2NlZWRQLnJ1bihwb3MpXG4gICAgOiBmYWlsUC5ydW4ocG9zKSkpLnNldExhYmVsKCdub3ReJyk7XG5cbmV4cG9ydCBjb25zdCBlbmRPZklucHV0UCA9XG4gIHBhcnNlcihwb3MgPT4gKChwb3MucmVzdCgpID09PSAnJylcbiAgICA/IHN1Y2NlZWRQLnJ1bihwb3MpXG4gICAgOiBmYWlsUC5ydW4ocG9zKSkpLnNldExhYmVsKCckJyk7XG5cbmV4cG9ydCBjb25zdCBub3RFbmRPZklucHV0UCA9XG4gIHBhcnNlcihwb3MgPT4gKChwb3MucmVzdCgpICE9PSAnJylcbiAgICA/IHN1Y2NlZWRQLnJ1bihwb3MpXG4gICAgOiBmYWlsUC5ydW4ocG9zKSkpLnNldExhYmVsKCdub3QkJyk7XG5cbmV4cG9ydCBmdW5jdGlvbiBwY2hhcihjaGFyKSB7XG4gIGNvbnN0IGxhYmVsID0gJ3BjaGFyXycgKyBjaGFyO1xuICBjb25zdCByZXN1bHQgPSBwb3MgPT4gY2hhclBhcnNlcihjaGFyKShwb3MpO1xuICByZXR1cm4gcGFyc2VyKHJlc3VsdCwgbGFiZWwpLnNldExhYmVsKGxhYmVsKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHBkaWdpdChkaWdpdCkge1xuICByZXR1cm4gcGFyc2VyKHBvcyA9PiBkaWdpdFBhcnNlcihkaWdpdCkocG9zKSwgJ3BkaWdpdF8nICsgZGlnaXQpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcHJlY2VkZWRCeVAoYzEsIGMyKSB7XG4gIGNvbnN0IGxhYmVsID0gYzIgKyAnIHByZWNlZGVkIGJ5ICcgKyBjMTtcbiAgcmV0dXJuIHBhcnNlcihwb3MgPT4ge1xuICAgIGNvbnN0IHJlczIgPSBwY2hhcihjMikucnVuKHBvcyk7XG4gICAgaWYgKHJlczIuaXNTdWNjZXNzKSB7XG4gICAgICBjb25zdCByZXMxID0gcGNoYXIoYzEpLnJ1bihyZXMyLnZhbHVlWzFdLmRlY3JQb3MoMikpO1xuICAgICAgaWYgKHJlczEuaXNTdWNjZXNzKSB7XG4gICAgICAgIHJldHVybiBWYWxpZGF0aW9uLlN1Y2Nlc3MoVHVwbGUuUGFpcihjMiwgcmVzMi52YWx1ZVsxXSkpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIFZhbGlkYXRpb24uRmFpbHVyZShUdXBsZS5UcmlwbGUobGFiZWwsIHJlczEudmFsdWVbMV0sIHJlczEudmFsdWVbMl0pKTtcbiAgICB9XG4gICAgcmV0dXJuIFZhbGlkYXRpb24uRmFpbHVyZShUdXBsZS5UcmlwbGUobGFiZWwsIHJlczIudmFsdWVbMV0sIHJlczIudmFsdWVbMl0pKTtcbiAgfSwgbGFiZWwpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbm90UHJlY2VkZWRCeVAoYzEsIGMyKSB7XG4gIGNvbnN0IGxhYmVsID0gYzIgKyAnIG5vdCBwcmVjZWRlZCBieSAnICsgYzE7XG4gIHJldHVybiBwYXJzZXIocG9zID0+IHtcbiAgICBjb25zdCByZXMyID0gcGNoYXIoYzIpLnJ1bihwb3MpO1xuICAgIGlmIChyZXMyLmlzU3VjY2Vzcykge1xuICAgICAgbGV0IHJlczEgPSBWYWxpZGF0aW9uLkZhaWx1cmUoKTtcbiAgICAgIHRyeSB7IC8vIGNyYXNoIGdvaW5nIGJhY2sgYmV5b25kIHN0YXJ0IG9mIGlucHV0ID0+IG9rXG4gICAgICAgIHJlczEgPSBwY2hhcihjMSkucnVuKHJlczIudmFsdWVbMV0uZGVjclBvcygyKSk7XG4gICAgICB9IGNhdGNoIChlcnIpIHt9XG4gICAgICBpZiAocmVzMS5pc0ZhaWx1cmUpIHtcbiAgICAgICAgcmV0dXJuIFZhbGlkYXRpb24uU3VjY2VzcyhUdXBsZS5QYWlyKGMyLCByZXMyLnZhbHVlWzFdKSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gVmFsaWRhdGlvbi5GYWlsdXJlKFR1cGxlLlRyaXBsZShsYWJlbCwgcmVzMS52YWx1ZVsxXSwgcmVzMS52YWx1ZVsyXSkpO1xuICAgIH1cbiAgICByZXR1cm4gVmFsaWRhdGlvbi5GYWlsdXJlKFR1cGxlLlRyaXBsZShsYWJlbCwgcmVzMi52YWx1ZVsxXSwgcmVzMi52YWx1ZVsyXSkpO1xuICB9LCBsYWJlbCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBmb2xsb3dlZEJ5UChjMSwgYzIpIHtcbiAgY29uc3QgbGFiZWwgPSBjMiArICcgZm9sbG93ZWQgYnkgJyArIGMxO1xuICByZXR1cm4gcGFyc2VyKHBvcyA9PiB7XG4gICAgY29uc3QgcmVzMiA9IHBjaGFyKGMyKS5ydW4ocG9zKTtcbiAgICBpZiAocmVzMi5pc1N1Y2Nlc3MpIHtcbiAgICAgIGNvbnN0IHJlczEgPSBwY2hhcihjMSkucnVuKHJlczIudmFsdWVbMV0pOyAvLyBubyBuZWVkIHRvIGluY3JlbWVudCBwb3NcbiAgICAgIGlmIChyZXMxLmlzU3VjY2Vzcykge1xuICAgICAgICByZXR1cm4gVmFsaWRhdGlvbi5TdWNjZXNzKFR1cGxlLlBhaXIoYzIsIHJlczIudmFsdWVbMV0pKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBWYWxpZGF0aW9uLkZhaWx1cmUoVHVwbGUuVHJpcGxlKGxhYmVsLCByZXMxLnZhbHVlWzFdLCByZXMxLnZhbHVlWzJdKSk7XG4gICAgfVxuICAgIHJldHVybiBWYWxpZGF0aW9uLkZhaWx1cmUoVHVwbGUuVHJpcGxlKGxhYmVsLCByZXMyLnZhbHVlWzFdLCByZXMyLnZhbHVlWzJdKSk7XG4gIH0sIGxhYmVsKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG5vdEZvbGxvd2VkQnlQKGMxLCBjMikge1xuICBjb25zdCBsYWJlbCA9IGMyICsgJyBub3QgZm9sbG93ZWQgYnkgJyArIGMxO1xuICByZXR1cm4gcGFyc2VyKHBvcyA9PiB7XG4gICAgY29uc3QgcmVzMiA9IHBjaGFyKGMyKS5ydW4ocG9zKTtcbiAgICBpZiAocmVzMi5pc1N1Y2Nlc3MpIHtcbiAgICAgIGxldCByZXMxID0gVmFsaWRhdGlvbi5GYWlsdXJlKCk7XG4gICAgICB0cnkgeyAvLyBjcmFzaCBnb2luZyBkb3duIGJleW9uZCBlbmQgb2YgaW5wdXQgPT4gb2tcbiAgICAgICAgcmVzMSA9IHBjaGFyKGMxKS5ydW4ocmVzMi52YWx1ZVsxXSk7XG4gICAgICB9IGNhdGNoIChlcnIpIHt9XG4gICAgICBpZiAocmVzMS5pc0ZhaWx1cmUpIHtcbiAgICAgICAgcmV0dXJuIFZhbGlkYXRpb24uU3VjY2VzcyhUdXBsZS5QYWlyKGMyLCByZXMyLnZhbHVlWzFdKSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gVmFsaWRhdGlvbi5GYWlsdXJlKFR1cGxlLlRyaXBsZShsYWJlbCwgcmVzMS52YWx1ZVsxXSwgcmVzMS52YWx1ZVsyXSkpO1xuICAgIH1cbiAgICByZXR1cm4gVmFsaWRhdGlvbi5GYWlsdXJlKFR1cGxlLlRyaXBsZShsYWJlbCwgcmVzMi52YWx1ZVsxXSwgcmVzMi52YWx1ZVsyXSkpO1xuICB9LCBsYWJlbCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhbmRUaGVuKHAxLCBwMikge1xuICBjb25zdCBsYWJlbCA9IHAxLmxhYmVsICsgJyBhbmRUaGVuICcgKyBwMi5sYWJlbDtcbiAgcmV0dXJuIHBhcnNlcihwb3MgPT4ge1xuICAgIGNvbnN0IHJlczEgPSBwMS5ydW4ocG9zKTtcbiAgICBpZiAocmVzMS5pc1N1Y2Nlc3MpIHtcbiAgICAgIGNvbnN0IHJlczIgPSBwMi5ydW4ocmVzMS52YWx1ZVsxXSk7XG4gICAgICBpZiAocmVzMi5pc1N1Y2Nlc3MpIHtcbiAgICAgICAgcmV0dXJuIFZhbGlkYXRpb24uU3VjY2VzcyhUdXBsZS5QYWlyKFR1cGxlLlBhaXIocmVzMS52YWx1ZVswXSwgcmVzMi52YWx1ZVswXSksIHJlczIudmFsdWVbMV0pKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBWYWxpZGF0aW9uLkZhaWx1cmUoVHVwbGUuVHJpcGxlKGxhYmVsLCByZXMyLnZhbHVlWzFdLCByZXMyLnZhbHVlWzJdKSk7XG4gICAgfVxuICAgIHJldHVybiBWYWxpZGF0aW9uLkZhaWx1cmUoVHVwbGUuVHJpcGxlKGxhYmVsLCByZXMxLnZhbHVlWzFdLCByZXMxLnZhbHVlWzJdKSk7XG4gIH0sIGxhYmVsKTtcbn1cblxuLy8gdXNpbmcgYmluZFxuZXhwb3J0IGZ1bmN0aW9uIGFuZFRoZW5CaW5kKHAxLCBwMikge1xuICByZXR1cm4gcDEuYmluZChwYXJzZWRWYWx1ZTEgPT4ge1xuICAgIHJldHVybiBwMi5iaW5kKHBhcnNlZFZhbHVlMiA9PiB7XG4gICAgICByZXR1cm4gcmV0dXJuUChUdXBsZS5QYWlyKHBhcnNlZFZhbHVlMSwgcGFyc2VkVmFsdWUyKSk7XG4gICAgfSk7XG4gIH0pLnNldExhYmVsKHAxLmxhYmVsICsgJyBhbmRUaGVuICcgKyBwMi5sYWJlbCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBvckVsc2UocDEsIHAyKSB7XG4gIGNvbnN0IGxhYmVsID0gcDEubGFiZWwgKyAnIG9yRWxzZSAnICsgcDIubGFiZWw7XG4gIHJldHVybiBwYXJzZXIocG9zID0+IHtcbiAgICBjb25zdCByZXMxID0gcDEucnVuKHBvcyk7XG4gICAgaWYgKHJlczEuaXNTdWNjZXNzKSByZXR1cm4gcmVzMTtcbiAgICBjb25zdCByZXMyID0gcDIucnVuKHBvcyk7XG4gICAgaWYgKHJlczIuaXNTdWNjZXNzKSByZXR1cm4gcmVzMjtcbiAgICByZXR1cm4gVmFsaWRhdGlvbi5GYWlsdXJlKFR1cGxlLlRyaXBsZShsYWJlbCwgcmVzMi52YWx1ZVsxXSwgcmVzMi52YWx1ZVsyXSkpO1xuICB9LCBsYWJlbCkuc2V0TGFiZWwobGFiZWwpO1xufVxuXG5leHBvcnQgY29uc3QgZmFpbFAgPSBwYXJzZXIocG9zID0+IFZhbGlkYXRpb24uRmFpbHVyZShUdXBsZS5UcmlwbGUoJycsICdmYWlsJywgcG9zKSkpXG4gIC5zZXRMYWJlbCgnZmFpbFAnKTtcblxuZXhwb3J0IGNvbnN0IHN1Y2NlZWRQID0gcGFyc2VyKHBvcyA9PiBWYWxpZGF0aW9uLlN1Y2Nlc3MoVHVwbGUuUGFpcignJywgcG9zKSwgJ3N1Y2NlZWQnKSlcbiAgLnNldExhYmVsKCdzdWNjZWVkUCcpO1xuXG5leHBvcnQgZnVuY3Rpb24gY2hvaWNlKHBhcnNlcnMpIHtcbiAgcmV0dXJuIHBhcnNlcnMucmVkdWNlUmlnaHQoKHJlc3QsIGN1cnIpID0+IG9yRWxzZShjdXJyLCByZXN0KSwgZmFpbFApXG4gICAgLnNldExhYmVsKCdjaG9pY2UgJyArIHBhcnNlcnMucmVkdWNlKChhY2MsIGN1cnIpID0+IGFjYyArICcvJyArIGN1cnIubGFiZWwsICcnKSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhbnlPZihjaGFyc0FycmF5KSB7XG4gIHJldHVybiBjaG9pY2UoY2hhcnNBcnJheS5tYXAocGNoYXIpKVxuICAgIC5zZXRMYWJlbCgnYW55T2YgJyArIGNoYXJzQXJyYXkucmVkdWNlKChhY2MsIGN1cnIpID0+IGFjYyArIGN1cnIsICcnKSk7XG59XG5cbmV4cG9ydCBjb25zdCBsb3dlcmNhc2VQID0gYW55T2YoWydhJywgJ2InLCAnYycsICdkJywgJ2UnLCAnZicsICdnJywgJ2gnLCAnaScsICdqJywgJ2snLCAnbCcsICdtJywgJ24nLCAnbycsICdwJywgJ3EnLCAncicsICdzJywgJ3QnLCAndScsICd2JywgJ3cnLCAneCcsICd5JywgJ3onXSkuc2V0TGFiZWwoJ2xvd2VyY2FzZVAnKTtcbmV4cG9ydCBjb25zdCB1cHBlcmNhc2VQID0gYW55T2YoWydBJywgJ0InLCAnQycsICdEJywgJ0UnLCAnRicsICdHJywgJ0gnLCAnSScsICdKJywgJ0snLCAnTCcsICdNJywgJ04nLCAnTycsICdQJywgJ1EnLCAnUicsICdTJywgJ1QnLCAnVScsICdWJywgJ1cnLCAnWCcsICdZJywgJ1onXSkuc2V0TGFiZWwoJ3VwcGVyY2FzZVAnKTtcbmV4cG9ydCBjb25zdCBsZXR0ZXJQID0gbG93ZXJjYXNlUC5vckVsc2UodXBwZXJjYXNlUCkuc2V0TGFiZWwoJ2xldHRlclAnKTtcbmV4cG9ydCBjb25zdCBkaWdpdFAgPSBhbnlPZihbJzAnLCAnMScsICcyJywgJzMnLCAnNCcsICc1JywgJzYnLCAnNycsICc4JywgJzknXSkuc2V0TGFiZWwoJ2RpZ2l0UCcpO1xuZXhwb3J0IGNvbnN0IHdoaXRlUCA9IGFueU9mKFsnICcsICdcXHQnLCAnXFxuJywgJ1xcciddKS5zZXRMYWJlbCgnd2hpdGVQJyk7XG5cbmV4cG9ydCBmdW5jdGlvbiBmbWFwKGZhYiwgcGFyc2VyMSkge1xuICBjb25zdCBsYWJlbCA9IHBhcnNlcjEubGFiZWwgKyAnIGZtYXAgJyArIGZhYi50b1N0cmluZygpO1xuICByZXR1cm4gcGFyc2VyKHBvcyA9PiB7XG4gICAgY29uc3QgcmVzID0gcGFyc2VyMS5ydW4ocG9zKTtcbiAgICBpZiAocmVzLmlzU3VjY2VzcykgcmV0dXJuIFZhbGlkYXRpb24uU3VjY2VzcyhUdXBsZS5QYWlyKGZhYihyZXMudmFsdWVbMF0pLCByZXMudmFsdWVbMV0pKTtcbiAgICByZXR1cm4gVmFsaWRhdGlvbi5GYWlsdXJlKFR1cGxlLlRyaXBsZShsYWJlbCwgcmVzLnZhbHVlWzFdLCByZXMudmFsdWVbMl0pKTtcbiAgfSwgbGFiZWwpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcmV0dXJuUCh2YWx1ZSkge1xuICByZXR1cm4gcGFyc2VyKHBvcyA9PiBWYWxpZGF0aW9uLlN1Y2Nlc3MoVHVwbGUuUGFpcih2YWx1ZSwgcG9zKSkpO1xufVxuXG4vLyBwYXJzZXIoYSAtPiBiKSAtPiBwYXJzZXIoYSkgLT4gcGFyc2VyKGIpXG5leHBvcnQgZnVuY3Rpb24gYXBwbHlQeChmUCkge1xuICByZXR1cm4gZnVuY3Rpb24oeFApIHtcbiAgICByZXR1cm4gYW5kVGhlbihmUCwgeFApLmZtYXAoKFtmLCB4XSkgPT4gZih4KSk7XG4gIH07XG59XG5cbi8vIHVzaW5nIGJpbmRcbmV4cG9ydCBmdW5jdGlvbiBhcHBseVAoZlApIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKHhQKSB7XG4gICAgcmV0dXJuIGZQLmJpbmQocGFyc2VkVmFsdWVmID0+IHtcbiAgICAgIHJldHVybiB4UC5iaW5kKHBhcnNlZFZhbHVleCA9PiB7XG4gICAgICAgIHJldHVybiByZXR1cm5QKHBhcnNlZFZhbHVlZihwYXJzZWRWYWx1ZXgpKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbGlmdDIoZmFhYikge1xuICByZXR1cm4gZnVuY3Rpb24ocGFyc2VyMSkge1xuICAgIHJldHVybiBmdW5jdGlvbihwYXJzZXIyKSB7XG4gICAgICAvLyByZXR1cm4gYXBwbHlQKGFwcGx5UChyZXR1cm5QKGZhYWIpKShwYXJzZXIxKSkocGFyc2VyMik7XG4gICAgICByZXR1cm4gcmV0dXJuUChmYWFiKS5hcHBseShwYXJzZXIxKS5hcHBseShwYXJzZXIyKTsgLy8gdXNpbmcgaW5zdGFuY2UgbWV0aG9kc1xuICAgIH07XG4gIH07XG59XG5cbi8vIHVzaW5nIGxpZnQyKGNvbnMpXG5leHBvcnQgZnVuY3Rpb24gc2VxdWVuY2VQKHBhcnNlcnMpIHtcbiAgcmV0dXJuIHBhcnNlcnNcbiAgICAucmVkdWNlUmlnaHQoKHJlc3QsIGN1cnIpID0+IHtcbiAgICAgIHJldHVybiBsaWZ0MihfY29ucykoY3VycikocmVzdCk7XG4gICAgfSwgcmV0dXJuUChbXSkpO1xufVxuXG4vLyB1c2luZyBuYWl2ZSBhbmRUaGVuICYmIGZtYXAgLS0+IHJldHVybnMgc3RyaW5ncywgbm90IGFycmF5cyFcbmV4cG9ydCBmdW5jdGlvbiBzZXF1ZW5jZVAyKHBhcnNlcnMpIHtcbiAgcmV0dXJuIHBhcnNlcnNcbiAgICAucmVkdWNlUmlnaHQoKHJlc3QsIGN1cnIpID0+IHtcbiAgICAgIHJldHVybiBmbWFwKChbeCwgeV0pID0+IHggKyB5LCBhbmRUaGVuKGN1cnIsIHJlc3QpKTtcbiAgICB9LCByZXR1cm5QKCcnKSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwc3RyaW5nKHN0cikge1xuICByZXR1cm4gc2VxdWVuY2VQKHN0ci5zcGxpdCgnJykubWFwKHBjaGFyKSlcbiAgICAuc2V0TGFiZWwoJ3BzdHJpbmcgJyArIHN0cik7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzdHJpbmdQKHN0cikge1xuICByZXR1cm4gcHN0cmluZyhzdHIpXG4gICAgLmZtYXAocmVzID0+IHJlcy5qb2luKCcnKSlcbiAgICAuc2V0TGFiZWwoJ3N0cmluZ1AgJyArIHN0cik7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB6ZXJvT3JNb3JlKHhQKSB7IC8vIHplcm9Pck1vcmUgOjogcCBhIC0+IFthXSAtPiB0cnkgW2FdID0gcCBhIC0+IHAgW2FdXG4gIHJldHVybiBwb3MgPT4ge1xuICAgIGNvbnN0IHJlczEgPSB4UC5ydW4ocG9zKTtcbiAgICBpZiAocmVzMS5pc0ZhaWx1cmUpIHJldHVybiBWYWxpZGF0aW9uLlN1Y2Nlc3MoVHVwbGUuUGFpcihbXSwgcG9zKSk7XG4gICAgY29uc3QgcmVzTiA9IHplcm9Pck1vcmUoeFApKHJlczEudmFsdWVbMV0pO1xuICAgIHJldHVybiBWYWxpZGF0aW9uLlN1Y2Nlc3MoVHVwbGUuUGFpcihbcmVzMS52YWx1ZVswXV0uY29uY2F0KHJlc04udmFsdWVbMF0pLCByZXNOLnZhbHVlWzFdKSk7XG4gIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtYW55KHhQLCB0aW1lcykge1xuICBjb25zdCB0aW1lc19kZWZpbmVkID0gKHR5cGVvZiB0aW1lcyAhPT0gJ3VuZGVmaW5lZCcpO1xuICBjb25zdCBsYWJlbCA9ICdtYW55ICcgKyB4UC5sYWJlbFxuICAgICAgICArICgodGltZXNfZGVmaW5lZCkgPyAnIHRpbWVzPScgKyB0aW1lcyA6ICcnKTtcbiAgcmV0dXJuIHBhcnNlcihwb3MgPT4ge1xuICAgIGNvbnN0IHJlcyA9IHplcm9Pck1vcmUoeFApKHBvcyk7XG4gICAgaWYgKHRpbWVzX2RlZmluZWQpIHsvLyBkZWJ1Z2dlcjtcbiAgICAgIGlmIChyZXMuaXNGYWlsdXJlKSByZXR1cm4gcmVzO1xuICAgICAgY29uc3QgcmVzdWx0TGVuZ3RoID0gcmVzLnZhbHVlWzBdLmxlbmd0aDtcbiAgICAgIHJldHVybiAocmVzdWx0TGVuZ3RoID09PSB0aW1lcylcbiAgICAgICAgPyByZXNcbiAgICAgICAgOiBWYWxpZGF0aW9uLkZhaWx1cmUoVHVwbGUuVHJpcGxlKGxhYmVsLCAndGltZXMgcGFyYW0gd2FudGVkICcgKyB0aW1lcyArICc7IGdvdCAnICsgcmVzdWx0TGVuZ3RoLCBwb3MpKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlcztcbiAgfSwgbGFiZWwpLnNldExhYmVsKGxhYmVsKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1hbnlDaGFycyh4UCwgdGltZXMpIHtcbiAgcmV0dXJuIG1hbnkoeFAsIHRpbWVzKVxuICAgIC5mbWFwKGFycmEgPT4gYXJyYS5qb2luKCcnKSlcbiAgICAuc2V0TGFiZWwoJ21hbnlDaGFycyAnICsgeFAubGFiZWxcbiAgICAgICAgICAgICsgKCh0eXBlb2YgdGltZXMgIT09ICd1bmRlZmluZWQnKSA/ICcgdGltZXM9JyArIHRpbWVzIDogJycpKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1hbnkxKHhQKSB7XG4gIGNvbnN0IGxhYmVsID0gJ21hbnkxICcgKyB4UC5sYWJlbDtcbiAgcmV0dXJuIHBhcnNlcihwb3MgPT4ge1xuICAgIGNvbnN0IHJlczEgPSB4UC5ydW4ocG9zKTtcbiAgICBpZiAocmVzMS5pc0ZhaWx1cmUpIHJldHVybiByZXMxO1xuICAgIGNvbnN0IHJlc04gPSB6ZXJvT3JNb3JlKHhQKShyZXMxLnZhbHVlWzFdKTtcbiAgICByZXR1cm4gVmFsaWRhdGlvbi5TdWNjZXNzKFR1cGxlLlBhaXIoW3JlczEudmFsdWVbMF1dLmNvbmNhdChyZXNOLnZhbHVlWzBdKSwgcmVzTi52YWx1ZVsxXSkpO1xuICB9LCBsYWJlbCkuc2V0TGFiZWwobGFiZWwpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbWFueUNoYXJzMSh4UCkge1xuICByZXR1cm4gbWFueTEoeFApXG4gICAgLmZtYXAoYXJyYSA9PiBhcnJhLmpvaW4oJycpKVxuICAgIC5zZXRMYWJlbCgnbWFueUNoYXJzMSAnICsgeFAubGFiZWwpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gb3B0KHhQLCBkZWZhdWx0VmFsdWUpIHtcbiAgY29uc3QgaXNEZWZhdWx0ID0gKHR5cGVvZiBkZWZhdWx0VmFsdWUgIT09ICd1bmRlZmluZWQnKTtcbiAgY29uc3QgbGFiZWwgPSAnb3B0ICcgKyB4UC5sYWJlbFxuICAgICAgICArIChpc0RlZmF1bHQgPyAnKGRlZmF1bHQ9JyArIGRlZmF1bHRWYWx1ZSArICcpJyA6ICcnKTtcbiAgcmV0dXJuIHBhcnNlcihwb3MgPT4ge1xuICAgIGNvbnN0IHJlcyA9IHhQLmZtYXAoTWF5YmUuSnVzdCkucnVuKHBvcyk7XG4gICAgaWYgKHJlcy5pc1N1Y2Nlc3MpIHJldHVybiByZXM7XG4gICAgY29uc3Qgb3V0Y29tZSA9IChpc0RlZmF1bHQpID8gTWF5YmUuSnVzdChkZWZhdWx0VmFsdWUpIDogTWF5YmUuTm90aGluZygpO1xuICAgIHJldHVybiBWYWxpZGF0aW9uLlN1Y2Nlc3MoVHVwbGUuUGFpcihvdXRjb21lLCBwb3MpKTtcbiAgfSwgbGFiZWwpLnNldExhYmVsKGxhYmVsKTtcbn1cblxuLy8gb3B0IGZyb20gdGhlIGJvb2sgLSB3b3JrcyBvaywgYnV0IHRvU3RyaW5nKCkgZ2l2ZXMgc3RyYW5nZSByZXN1bHRzXG5leHBvcnQgZnVuY3Rpb24gb3B0Qm9vayhwWCkge1xuICBjb25zdCBzb21lUCA9IHBYLmZtYXAoTWF5YmUuSnVzdCk7XG4gIGNvbnN0IG5vbmVQID0gcmV0dXJuUChNYXliZS5Ob3RoaW5nKTtcbiAgcmV0dXJuIHNvbWVQLm9yRWxzZShub25lUCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBkaXNjYXJkU2Vjb25kKHAxLCBwMikge1xuICBjb25zdCBsYWJlbCA9IHAxLmxhYmVsICsgJyBkaXNjYXJkU2Vjb25kICcgKyBwMi5sYWJlbDtcbiAgcmV0dXJuIHBhcnNlcihwb3MgPT4ge1xuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby11bnVzZWQtdmFyc1xuICAgIHJldHVybiBhbmRUaGVuKHAxLCBwMikuZm1hcCgoW3gsIHldKSA9PiB4KS5ydW4ocG9zKTtcbiAgfSwgbGFiZWwpLnNldExhYmVsKGxhYmVsKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRpc2NhcmRGaXJzdChwMSwgcDIpIHtcbiAgY29uc3QgbGFiZWwgPSBwMS5sYWJlbCArICcgZGlzY2FyZEZpcnN0ICcgKyBwMi5sYWJlbDtcbiAgcmV0dXJuIHBhcnNlcihwb3MgPT4ge1xuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby11bnVzZWQtdmFyc1xuICAgIHJldHVybiBhbmRUaGVuKHAxLCBwMikuZm1hcCgoW3gsIHldKSA9PiB5KS5ydW4ocG9zKTtcbiAgfSwgbGFiZWwpLnNldExhYmVsKGxhYmVsKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNlcEJ5MShweCwgc2VwKSB7XG4gIHJldHVybiBweC5hbmRUaGVuKG1hbnkoc2VwLmRpc2NhcmRGaXJzdChweCkpKVxuICAgIC5mbWFwKChbciwgcmxpc3RdKSA9PiBbcl0uY29uY2F0KHJsaXN0KSk7XG59XG5cbi8vIG15IHZlcnNpb24gd29ya3MganVzdCBmaW5lIChhbG1vc3QgLSBzdWNjZWVkcyBha3NvIHdpdGggemVybyBtYXRjaGVzKS4uLlxuZXhwb3J0IGZ1bmN0aW9uIHNlcEJ5MU1hcmNvKHZhbHVlUCwgc2VwYXJhdG9yUCkge1xuICByZXR1cm4gbWFueShtYW55MSh2YWx1ZVApLmRpc2NhcmRTZWNvbmQob3B0KHNlcGFyYXRvclApKSlcbiAgICAuZm1hcChyZXMgPT4gcmVzLm1hcCgoW3hdKSA9PiB4KSk7XG59XG5cbi8vIHNlcEJ5MSB3b3JraW5nIG9uIHplcm8gb2NjdXJyZW5jZXNcbmV4cG9ydCBmdW5jdGlvbiBzZXBCeShweCwgc2VwKSB7XG4gIHJldHVybiBzZXBCeTEocHgsIHNlcCkub3JFbHNlKHJldHVyblAoW10pKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGJldHdlZW4ocDEsIHAyLCBwMykge1xuICByZXR1cm4gcDEuZGlzY2FyZEZpcnN0KHAyKS5kaXNjYXJkU2Vjb25kKHAzKVxuICAgIC5zZXRMYWJlbCgnYmV0d2VlbiAnICsgcDEubGFiZWwgKyAnLycgKyBwMi5sYWJlbCArICcvJyArIHAzLmxhYmVsKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGJldHdlZW5QYXJlbnMocHgpIHtcbiAgcmV0dXJuIGJldHdlZW4ocGNoYXIoJygnKSwgcHgsIHBjaGFyKCcpJykpXG4gICAgLnNldExhYmVsKCdiZXR3ZWVuUGFyZW5zICcgKyBweC5sYWJlbCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBiaW5kUChmYW1iLCBweCkge1xuICBjb25zdCBsYWJlbCA9ICdiaW5kUCBhcHBsaWVkIHRvICcgKyBweC5sYWJlbDtcbiAgcmV0dXJuIHBhcnNlcihwb3MgPT4ge1xuICAgIGNvbnN0IHJlcyA9IHB4LnJ1bihwb3MpO1xuICAgIGlmIChyZXMuaXNGYWlsdXJlKSByZXR1cm4gcmVzO1xuICAgIHJldHVybiBmYW1iKHJlcy52YWx1ZVswXSkucnVuKHJlcy52YWx1ZVsxXSk7XG4gIH0sIGxhYmVsKS5zZXRMYWJlbChsYWJlbCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB0YXBQKHB4LCBmbikge1xuICByZXR1cm4gcHguYmluZChyZXMgPT4ge1xuICAgIGZuKHJlcyk7XG4gICAgcmV0dXJuIHJldHVyblAocmVzKTtcbiAgfSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBsb2dQKHB4KSB7XG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1jb25zb2xlXG4gIHJldHVybiB0YXBQKHB4LCByZXMgPT4gY29uc29sZS5sb2cocHgubGFiZWwgKyAnOicgKyByZXMpKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHB3b3JkKHdvcmQpIHtcbiAgcmV0dXJuIHRyaW1QKHBzdHJpbmcod29yZCkpXG4gICAgLnNldExhYmVsKCdwd29yZCAnICsgd29yZCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB0cmltUChwWCkge1xuICByZXR1cm4gb3B0KG1hbnkod2hpdGVQKSlcbiAgICAuZGlzY2FyZEZpcnN0KHBYKVxuICAgIC5kaXNjYXJkU2Vjb25kKG9wdChtYW55KHdoaXRlUCkpKVxuICAgIC5zZXRMYWJlbCgndHJpbSAnICsgcFgubGFiZWwpO1xufVxuXG5mdW5jdGlvbiBfY29ucyh4KSB7XG4gIHJldHVybiBmdW5jdGlvbih4cykge1xuICAgIHJldHVybiBbeF0uY29uY2F0KHhzKTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gX3NldExhYmVsKHB4LCBuZXdMYWJlbCkge1xuICByZXR1cm4gcGFyc2VyKHBvcyA9PiB7XG4gICAgY29uc3QgcmVzdWx0ID0gcHgucnVuKHBvcyk7XG4gICAgaWYgKHJlc3VsdC5pc0ZhaWx1cmUpIHJldHVybiBWYWxpZGF0aW9uLkZhaWx1cmUoVHVwbGUuVHJpcGxlKG5ld0xhYmVsLCByZXN1bHQudmFsdWVbMV0sIHJlc3VsdC52YWx1ZVsyXSkpO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH0sIG5ld0xhYmVsKTtcbn1cblxuLy8gdGhlIHJlYWwgdGhpbmcuLi5cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZXIoZm4sIGxhYmVsKSB7XG4gIHJldHVybiB7XG4gICAgdHlwZTogJ3BhcnNlcicsXG4gICAgbGFiZWwsXG4gICAgcnVuKHBvcykge1xuICAgICAgcmV0dXJuIGZuKHBvcyk7XG4gICAgfSxcbiAgICBhcHBseShweCkge1xuICAgICAgcmV0dXJuIGFwcGx5UCh0aGlzKShweCk7XG4gICAgICAvLyByZXR1cm4gdGhpcy5iaW5kKGFuZFRoZW4odGhpcywgcHgpLmZtYXAoKFtmLCB4XSkgPT4gZih4KSkpLnJ1bjsgLy8gd2UgYXJlIHRoZSBmUFxuICAgIH0sXG4gICAgZm1hcChmYWIpIHtcbiAgICAgIC8vIHJldHVybiBmbWFwKGZhYiwgdGhpcyk7XG4gICAgICAvLyByZXR1cm4gYmluZFAocG9zID0+IHJldHVyblAoZmFiKHBvcykpLCB0aGlzKTtcbiAgICAgIHJldHVybiB0aGlzLmJpbmQocGFyc2VkVmFsdWUgPT4gcmV0dXJuUChmYWIocGFyc2VkVmFsdWUpKSk7XG4gICAgfSxcbiAgICBhbmRUaGVuKHB4KSB7XG4gICAgICByZXR1cm4gYW5kVGhlbih0aGlzLCBweCk7XG4gICAgfSxcbiAgICBvckVsc2UocHgpIHtcbiAgICAgIHJldHVybiBvckVsc2UodGhpcywgcHgpO1xuICAgIH0sXG4gICAgZGlzY2FyZEZpcnN0KHB4KSB7XG4gICAgICByZXR1cm4gZGlzY2FyZEZpcnN0KHRoaXMsIHB4KTtcbiAgICB9LFxuICAgIGRpc2NhcmRTZWNvbmQocHgpIHtcbiAgICAgIHJldHVybiBkaXNjYXJkU2Vjb25kKHRoaXMsIHB4KTtcbiAgICB9LFxuICAgIGJpbmQoZmFtYikge1xuICAgICAgcmV0dXJuIGJpbmRQKGZhbWIsIHRoaXMpO1xuICAgIH0sXG4gICAgc2V0TGFiZWwobmV3TGFiZWwpIHtcbiAgICAgIHJldHVybiBfc2V0TGFiZWwodGhpcywgbmV3TGFiZWwpO1xuICAgIH0sXG4gIH07XG59XG4iXX0=