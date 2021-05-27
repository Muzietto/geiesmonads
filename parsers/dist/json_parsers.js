define(['exports', 'classes', 'validation', 'parsers'], function (exports, _classes, _validation, _parsers) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.JArrayP = exports.JNumberP = exports.jNumberStringP = exports.JStringP = exports.jUnicodeCharP = exports.jEscapedCharP = exports.jUnescapedCharP = exports.JBoolP = exports.JNullP = undefined;

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

  var JNullP = exports.JNullP = (0, _parsers.pstring)('null').fmap(function (_) {
    return _classes.JValue.JNull(null);
  }).setLabel('null');

  var JTrueP = (0, _parsers.pstring)('true').fmap(function (_) {
    return _classes.JValue.JBool(true);
  });
  var JFalseP = (0, _parsers.pstring)('false').fmap(function (_) {
    return _classes.JValue.JBool(false);
  });
  var JBoolP = exports.JBoolP = JTrueP.orElse(JFalseP).setLabel('bool');

  var jUnescapedCharP = exports.jUnescapedCharP = (0, _parsers.parser)((0, _parsers.predicateBasedParser)(function (char) {
    return char !== '\\' && char !== '"';
  }, 'junescapedCharP'));
  var escapedJSONChars = ['\"', '\\', '\/', '\b', '\f',
  //    '\n', // newlines will be removed during text -> position transformation
  '\r', '\t'];
  var jEscapedCharP = exports.jEscapedCharP = (0, _parsers.choice)(escapedJSONChars.map(_parsers.pchar)).setLabel('escaped char');
  // actually here it is done differently:
  // https://fsharpforfunandprofit.com/posts/understanding-parser-combinators-4/#escaped-characters

  var hexDigitsP = (0, _parsers.choice)(['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f', 'A', 'B', 'C', 'D', 'E', 'F'].map(_parsers.pchar));

  var jUnicodeCharP = exports.jUnicodeCharP = (0, _parsers.pchar)('\\').discardFirst((0, _parsers.pchar)('u')).discardFirst(hexDigitsP) // returns a
  .andThen(hexDigitsP) // returns b
  .andThen(hexDigitsP) // returns c
  .andThen(hexDigitsP) // returns d
  .fmap(function (_ref) {
    var _ref2 = _slicedToArray(_ref, 2),
        _ref2$ = _slicedToArray(_ref2[0], 2),
        _ref2$$ = _slicedToArray(_ref2$[0], 2),
        a = _ref2$$[0],
        b = _ref2$$[1],
        c = _ref2$[1],
        d = _ref2[1];

    return parseInt('' + a + b + c + d, 16);
  }).setLabel('unicode char');

  var jCharP = jUnescapedCharP /* .orElse(jEscapedCharP) */.orElse(jUnicodeCharP);
  var doublequote = (0, _parsers.pchar)('"').setLabel('doublequote');

  var JStringP = exports.JStringP = doublequote.discardFirst((0, _parsers.manyChars)(jCharP)).discardSecond(doublequote).fmap(function (res) {
    return _classes.JValue.JString(res);
  }).setLabel('JSON string parser');

  var digits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  var digits19 = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

  // improvable all over the place by:
  // - using manyChars to process lists into strings right away
  // - discarding e/E's and dots, and composing the final number from NUMERICAL pieces
  var digitsP = (0, _parsers.many)((0, _parsers.anyOf)(digits));
  var digits1P = (0, _parsers.many1)((0, _parsers.anyOf)(digits));

  var optionalPlusMinusP = (0, _parsers.opt)((0, _parsers.pchar)('-').orElse((0, _parsers.pchar)('+')));
  var optionalMinusP = (0, _parsers.opt)((0, _parsers.pchar)('-'));

  var boxedJust = function boxedJust(x) {
    return x.isNothing ? [''] : [x.value];
  };
  var unboxedJust = function unboxedJust(x) {
    return x.isNothing ? [''] : x.value;
  };
  var unboxedNothing = function unboxedNothing(x) {
    return x.isNothing ? '' : x.value;
  };

  var exponentialP = (0, _parsers.choice)([(0, _parsers.pchar)('e'), (0, _parsers.pchar)('E')]).andThen(optionalPlusMinusP) // .fmap(boxedJust)
  .andThen(digits1P).fmap(function (_ref3) {
    var _ref4 = _slicedToArray(_ref3, 2),
        _ref4$ = _slicedToArray(_ref4[0], 2),
        ee = _ref4$[0],
        optPM = _ref4$[1],
        digs = _ref4[1];

    return [ee, unboxedNothing(optPM)].concat(digs).join('');
  });

  // returns Success(string)
  var jNumberStringP = exports.jNumberStringP = (0, _parsers.sequenceP)([optionalMinusP.fmap(boxedJust), digits1P, (0, _parsers.opt)((0, _parsers.pchar)('.').andThen(digits1P).fmap(function (_ref5) {
    var _ref6 = _slicedToArray(_ref5, 2),
        dot = _ref6[0],
        digs = _ref6[1];

    return [dot].concat(digs);
  })).fmap(unboxedJust), (0, _parsers.opt)(exponentialP).fmap(boxedJust)]).fmap(function (res) {
    return res.reduce(function (acc, curr) {
      return acc.concat(curr);
    }, []).join('');
  });

  // returns Success(parseFloat(string))
  var JNumberP = exports.JNumberP = jNumberStringP.fmap(parseFloat).fmap(_classes.JValue.JNumber).setLabel('JSON number parser');

  var _parserForwardedToRef = parserForwardedToRef(),
      _parserForwardedToRef2 = _slicedToArray(_parserForwardedToRef, 2),
      jValueP = _parserForwardedToRef2[0],
      parserRef = _parserForwardedToRef2[1];

  var leftSquareParensP = (0, _parsers.pchar)('[').discardSecond((0, _parsers.many)((0, _parsers.pchar)(' ')));
  var rightSquareParensP = (0, _parsers.pchar)(']').discardSecond((0, _parsers.many)((0, _parsers.pchar)(' ')));
  var commaP = (0, _parsers.pchar)(',').discardSecond((0, _parsers.many)((0, _parsers.pchar)(' ')));
  var jvalueP = jValueP.discardSecond((0, _parsers.many)((0, _parsers.pchar)(' ')));
  var jvaluesP = (0, _parsers.sepBy1)(jvalueP, commaP);

  var JArrayP = exports.JArrayP = (0, _parsers.between)(leftSquareParensP, jvaluesP, rightSquareParensP).fmap(_classes.JValue.JArray).setLabel('JSON array parser');

  // parserRef = JNullP
  //     .orElse(JBoolP)
  //     .orElse(JStringP)
  //     .orElse(JNumberP)
  //     .orElse(JArrayP);

  function parserForwardedToRef() {

    var dummyParser = (0, _parsers.parser)(function (pos) {
      return _validation.Validation.Failure(_classes.Tuple.Triple('unfixed forwarded parser', '_fail', pos));
    }, 'dummyParser');

    var parserRef = dummyParser;

    var wrapperParser = (0, _parsers.parser)(function (pos) {
      return parserRef.run(pos);
    }, 'wrapperParser');

    return _classes.Tuple.Pair(wrapperParser, parserRef);
  }
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2pzL2pzb25fcGFyc2Vycy5qcyJdLCJuYW1lcyI6WyJKTnVsbFAiLCJmbWFwIiwiSlZhbHVlIiwiSk51bGwiLCJzZXRMYWJlbCIsIkpUcnVlUCIsIkpCb29sIiwiSkZhbHNlUCIsIkpCb29sUCIsIm9yRWxzZSIsImpVbmVzY2FwZWRDaGFyUCIsImNoYXIiLCJlc2NhcGVkSlNPTkNoYXJzIiwiakVzY2FwZWRDaGFyUCIsIm1hcCIsInBjaGFyIiwiaGV4RGlnaXRzUCIsImpVbmljb2RlQ2hhclAiLCJkaXNjYXJkRmlyc3QiLCJhbmRUaGVuIiwiYSIsImIiLCJjIiwiZCIsInBhcnNlSW50IiwiakNoYXJQIiwiZG91YmxlcXVvdGUiLCJKU3RyaW5nUCIsImRpc2NhcmRTZWNvbmQiLCJKU3RyaW5nIiwicmVzIiwiZGlnaXRzIiwiZGlnaXRzMTkiLCJkaWdpdHNQIiwiZGlnaXRzMVAiLCJvcHRpb25hbFBsdXNNaW51c1AiLCJvcHRpb25hbE1pbnVzUCIsImJveGVkSnVzdCIsIngiLCJpc05vdGhpbmciLCJ2YWx1ZSIsInVuYm94ZWRKdXN0IiwidW5ib3hlZE5vdGhpbmciLCJleHBvbmVudGlhbFAiLCJlZSIsIm9wdFBNIiwiZGlncyIsImNvbmNhdCIsImpvaW4iLCJqTnVtYmVyU3RyaW5nUCIsImRvdCIsInJlZHVjZSIsImFjYyIsImN1cnIiLCJKTnVtYmVyUCIsInBhcnNlRmxvYXQiLCJKTnVtYmVyIiwicGFyc2VyRm9yd2FyZGVkVG9SZWYiLCJqVmFsdWVQIiwicGFyc2VyUmVmIiwibGVmdFNxdWFyZVBhcmVuc1AiLCJyaWdodFNxdWFyZVBhcmVuc1AiLCJjb21tYVAiLCJqdmFsdWVQIiwianZhbHVlc1AiLCJKQXJyYXlQIiwiSkFycmF5IiwiZHVtbXlQYXJzZXIiLCJWYWxpZGF0aW9uIiwiRmFpbHVyZSIsIlR1cGxlIiwiVHJpcGxlIiwicG9zIiwid3JhcHBlclBhcnNlciIsInJ1biIsIlBhaXIiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7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XHJcbiAgVHVwbGUsXHJcbn0gZnJvbSAnY2xhc3Nlcyc7XHJcbmltcG9ydCB7XHJcbiAgVmFsaWRhdGlvbixcclxufSBmcm9tICd2YWxpZGF0aW9uJztcclxuaW1wb3J0IHtcclxuICBwYXJzZXIsXHJcbiAgY2hhclBhcnNlcixcclxuICBkaWdpdFBhcnNlcixcclxuICBwcmVkaWNhdGVCYXNlZFBhcnNlcixcclxuICBwY2hhcixcclxuICBwZGlnaXQsXHJcbiAgYW5kVGhlbixcclxuICBvckVsc2UsXHJcbiAgY2hvaWNlLFxyXG4gIGFueU9mLFxyXG4gIGZtYXAsXHJcbiAgcmV0dXJuUCxcclxuICBhcHBseVAsXHJcbiAgbGlmdDIsXHJcbiAgc2VxdWVuY2VQLFxyXG4gIHNlcXVlbmNlUDIsXHJcbiAgcHN0cmluZyxcclxuICB6ZXJvT3JNb3JlLFxyXG4gIG1hbnksXHJcbiAgbWFueTEsXHJcbiAgbWFueUNoYXJzLFxyXG4gIG1hbnlDaGFyczEsXHJcbiAgb3B0LFxyXG4gIG9wdEJvb2ssXHJcbiAgZGlzY2FyZEZpcnN0LFxyXG4gIGRpc2NhcmRTZWNvbmQsXHJcbiAgYmV0d2VlbixcclxuICBiZXR3ZWVuUGFyZW5zLFxyXG4gIHNlcEJ5MSxcclxufSBmcm9tICdwYXJzZXJzJztcclxuXHJcbmV4cG9ydCBjb25zdCBKTnVsbFAgPSBwc3RyaW5nKCdudWxsJykuZm1hcChfID0+IEpWYWx1ZS5KTnVsbChudWxsKSkuc2V0TGFiZWwoJ251bGwnKTtcclxuXHJcbmNvbnN0IEpUcnVlUCA9IHBzdHJpbmcoJ3RydWUnKS5mbWFwKF8gPT4gSlZhbHVlLkpCb29sKHRydWUpKTtcclxuY29uc3QgSkZhbHNlUCA9IHBzdHJpbmcoJ2ZhbHNlJykuZm1hcChfID0+IEpWYWx1ZS5KQm9vbChmYWxzZSkpO1xyXG5leHBvcnQgY29uc3QgSkJvb2xQID0gSlRydWVQLm9yRWxzZShKRmFsc2VQKS5zZXRMYWJlbCgnYm9vbCcpO1xyXG5cclxuZXhwb3J0IGNvbnN0IGpVbmVzY2FwZWRDaGFyUCA9IHBhcnNlcihwcmVkaWNhdGVCYXNlZFBhcnNlcihjaGFyID0+IChjaGFyICE9PSAnXFxcXCcgJiYgY2hhciAhPT0gJ1wiJyksICdqdW5lc2NhcGVkQ2hhclAnKSk7XHJcbmNvbnN0IGVzY2FwZWRKU09OQ2hhcnMgPSBbXHJcbiAgJ1xcXCInLFxyXG4gICdcXFxcJyxcclxuICAnXFwvJyxcclxuICAnXFxiJyxcclxuICAnXFxmJyxcclxuICAvLyAgICAnXFxuJywgLy8gbmV3bGluZXMgd2lsbCBiZSByZW1vdmVkIGR1cmluZyB0ZXh0IC0+IHBvc2l0aW9uIHRyYW5zZm9ybWF0aW9uXHJcbiAgJ1xccicsXHJcbiAgJ1xcdCcsXHJcbl07XHJcbmV4cG9ydCBjb25zdCBqRXNjYXBlZENoYXJQID0gY2hvaWNlKGVzY2FwZWRKU09OQ2hhcnMubWFwKHBjaGFyKSkuc2V0TGFiZWwoJ2VzY2FwZWQgY2hhcicpO1xyXG4vLyBhY3R1YWxseSBoZXJlIGl0IGlzIGRvbmUgZGlmZmVyZW50bHk6XHJcbi8vIGh0dHBzOi8vZnNoYXJwZm9yZnVuYW5kcHJvZml0LmNvbS9wb3N0cy91bmRlcnN0YW5kaW5nLXBhcnNlci1jb21iaW5hdG9ycy00LyNlc2NhcGVkLWNoYXJhY3RlcnNcclxuXHJcbmNvbnN0IGhleERpZ2l0c1AgPSBjaG9pY2UoW1xyXG4gICcwJywgJzEnLCAnMicsICczJywgJzQnLCAnNScsICc2JywgJzcnLCAnOCcsICc5JywgJ2EnLCAnYicsICdjJywgJ2QnLCAnZScsICdmJywgJ0EnLCAnQicsICdDJywgJ0QnLCAnRScsICdGJyxcclxuXS5tYXAocGNoYXIpKTtcclxuXHJcbmV4cG9ydCBjb25zdCBqVW5pY29kZUNoYXJQID0gcGNoYXIoJ1xcXFwnKVxyXG4gIC5kaXNjYXJkRmlyc3QocGNoYXIoJ3UnKSlcclxuICAuZGlzY2FyZEZpcnN0KGhleERpZ2l0c1ApIC8vIHJldHVybnMgYVxyXG4gIC5hbmRUaGVuKGhleERpZ2l0c1ApIC8vIHJldHVybnMgYlxyXG4gIC5hbmRUaGVuKGhleERpZ2l0c1ApIC8vIHJldHVybnMgY1xyXG4gIC5hbmRUaGVuKGhleERpZ2l0c1ApIC8vIHJldHVybnMgZFxyXG4gIC5mbWFwKChbW1thLCBiXSwgY10sIGRdKSA9PiBwYXJzZUludCgnJyArIGEgKyBiICsgYyArIGQsIDE2KSlcclxuICAuc2V0TGFiZWwoJ3VuaWNvZGUgY2hhcicpO1xyXG5cclxuY29uc3QgakNoYXJQID0galVuZXNjYXBlZENoYXJQLyogLm9yRWxzZShqRXNjYXBlZENoYXJQKSAqLy5vckVsc2UoalVuaWNvZGVDaGFyUCk7XHJcbmNvbnN0IGRvdWJsZXF1b3RlID0gcGNoYXIoJ1wiJykuc2V0TGFiZWwoJ2RvdWJsZXF1b3RlJyk7XHJcblxyXG5leHBvcnQgY29uc3QgSlN0cmluZ1AgPSBkb3VibGVxdW90ZVxyXG4gIC5kaXNjYXJkRmlyc3QobWFueUNoYXJzKGpDaGFyUCkpXHJcbiAgLmRpc2NhcmRTZWNvbmQoZG91YmxlcXVvdGUpXHJcbiAgLmZtYXAocmVzID0+IEpWYWx1ZS5KU3RyaW5nKHJlcykpXHJcbiAgLnNldExhYmVsKCdKU09OIHN0cmluZyBwYXJzZXInKTtcclxuXHJcbmNvbnN0IGRpZ2l0cyA9IFsnMCcsICcxJywgJzInLCAnMycsICc0JywgJzUnLCAnNicsICc3JywgJzgnLCAnOSddO1xyXG5jb25zdCBkaWdpdHMxOSA9IFsnMScsICcyJywgJzMnLCAnNCcsICc1JywgJzYnLCAnNycsICc4JywgJzknXTtcclxuXHJcbi8vIGltcHJvdmFibGUgYWxsIG92ZXIgdGhlIHBsYWNlIGJ5OlxyXG4vLyAtIHVzaW5nIG1hbnlDaGFycyB0byBwcm9jZXNzIGxpc3RzIGludG8gc3RyaW5ncyByaWdodCBhd2F5XHJcbi8vIC0gZGlzY2FyZGluZyBlL0UncyBhbmQgZG90cywgYW5kIGNvbXBvc2luZyB0aGUgZmluYWwgbnVtYmVyIGZyb20gTlVNRVJJQ0FMIHBpZWNlc1xyXG5jb25zdCBkaWdpdHNQID0gbWFueShhbnlPZihkaWdpdHMpKTtcclxuY29uc3QgZGlnaXRzMVAgPSBtYW55MShhbnlPZihkaWdpdHMpKTtcclxuXHJcbmNvbnN0IG9wdGlvbmFsUGx1c01pbnVzUCA9IG9wdChwY2hhcignLScpLm9yRWxzZShwY2hhcignKycpKSk7XHJcbmNvbnN0IG9wdGlvbmFsTWludXNQID0gb3B0KHBjaGFyKCctJykpO1xyXG5cclxuY29uc3QgYm94ZWRKdXN0ID0geCA9PiAoeC5pc05vdGhpbmcgPyBbJyddIDogW3gudmFsdWVdKTtcclxuY29uc3QgdW5ib3hlZEp1c3QgPSB4ID0+ICh4LmlzTm90aGluZyA/IFsnJ10gOiB4LnZhbHVlKTtcclxuY29uc3QgdW5ib3hlZE5vdGhpbmcgPSB4ID0+ICh4LmlzTm90aGluZyA/ICcnIDogeC52YWx1ZSk7XHJcblxyXG5jb25zdCBleHBvbmVudGlhbFAgPSBjaG9pY2UoW3BjaGFyKCdlJyksIHBjaGFyKCdFJyldKVxyXG4gIC5hbmRUaGVuKG9wdGlvbmFsUGx1c01pbnVzUCkvLyAuZm1hcChib3hlZEp1c3QpXHJcbiAgLmFuZFRoZW4oZGlnaXRzMVApXHJcbiAgLmZtYXAoKFtbZWUsIG9wdFBNXSwgZGlnc10pID0+IFtlZSwgKHVuYm94ZWROb3RoaW5nKG9wdFBNKSldLmNvbmNhdChkaWdzKS5qb2luKCcnKSk7XHJcblxyXG4vLyByZXR1cm5zIFN1Y2Nlc3Moc3RyaW5nKVxyXG5leHBvcnQgY29uc3Qgak51bWJlclN0cmluZ1AgPSBzZXF1ZW5jZVAoW1xyXG4gIG9wdGlvbmFsTWludXNQLmZtYXAoYm94ZWRKdXN0KSxcclxuICBkaWdpdHMxUCxcclxuICBvcHQocGNoYXIoJy4nKS5hbmRUaGVuKGRpZ2l0czFQKS5mbWFwKChbZG90LCBkaWdzXSkgPT4gW2RvdF0uY29uY2F0KGRpZ3MpKSlcclxuICAgIC5mbWFwKHVuYm94ZWRKdXN0KSxcclxuICBvcHQoZXhwb25lbnRpYWxQKS5mbWFwKGJveGVkSnVzdCksXHJcbl0pLmZtYXAocmVzID0+IHJlcy5yZWR1Y2UoKGFjYywgY3VycikgPT4gYWNjLmNvbmNhdChjdXJyKSwgW10pLmpvaW4oJycpKTtcclxuXHJcbi8vIHJldHVybnMgU3VjY2VzcyhwYXJzZUZsb2F0KHN0cmluZykpXHJcbmV4cG9ydCBjb25zdCBKTnVtYmVyUCA9IGpOdW1iZXJTdHJpbmdQXHJcbiAgLmZtYXAocGFyc2VGbG9hdClcclxuICAuZm1hcChKVmFsdWUuSk51bWJlcilcclxuICAuc2V0TGFiZWwoJ0pTT04gbnVtYmVyIHBhcnNlcicpO1xyXG5cclxuY29uc3QgW2pWYWx1ZVAsIHBhcnNlclJlZl0gPSBwYXJzZXJGb3J3YXJkZWRUb1JlZigpO1xyXG5cclxuY29uc3QgbGVmdFNxdWFyZVBhcmVuc1AgPSBwY2hhcignWycpLmRpc2NhcmRTZWNvbmQobWFueShwY2hhcignICcpKSk7XHJcbmNvbnN0IHJpZ2h0U3F1YXJlUGFyZW5zUCA9IHBjaGFyKCddJykuZGlzY2FyZFNlY29uZChtYW55KHBjaGFyKCcgJykpKTtcclxuY29uc3QgY29tbWFQID0gcGNoYXIoJywnKS5kaXNjYXJkU2Vjb25kKG1hbnkocGNoYXIoJyAnKSkpO1xyXG5jb25zdCBqdmFsdWVQID0galZhbHVlUC5kaXNjYXJkU2Vjb25kKG1hbnkocGNoYXIoJyAnKSkpO1xyXG5jb25zdCBqdmFsdWVzUCA9IHNlcEJ5MShqdmFsdWVQLCBjb21tYVApO1xyXG5cclxuZXhwb3J0IGNvbnN0IEpBcnJheVAgPSBiZXR3ZWVuKGxlZnRTcXVhcmVQYXJlbnNQLCBqdmFsdWVzUCwgcmlnaHRTcXVhcmVQYXJlbnNQKVxyXG4gIC5mbWFwKEpWYWx1ZS5KQXJyYXkpXHJcbiAgLnNldExhYmVsKCdKU09OIGFycmF5IHBhcnNlcicpO1xyXG5cclxuLy8gcGFyc2VyUmVmID0gSk51bGxQXHJcbi8vICAgICAub3JFbHNlKEpCb29sUClcclxuLy8gICAgIC5vckVsc2UoSlN0cmluZ1ApXHJcbi8vICAgICAub3JFbHNlKEpOdW1iZXJQKVxyXG4vLyAgICAgLm9yRWxzZShKQXJyYXlQKTtcclxuXHJcbmZ1bmN0aW9uIHBhcnNlckZvcndhcmRlZFRvUmVmKCkge1xyXG5cclxuICBjb25zdCBkdW1teVBhcnNlciA9IHBhcnNlcihwb3MgPT5cclxuICAgIFZhbGlkYXRpb24uRmFpbHVyZShUdXBsZS5UcmlwbGUoJ3VuZml4ZWQgZm9yd2FyZGVkIHBhcnNlcicsICdfZmFpbCcsIHBvcykpLFxyXG4gICdkdW1teVBhcnNlcicpO1xyXG5cclxuICBjb25zdCBwYXJzZXJSZWYgPSBkdW1teVBhcnNlcjtcclxuXHJcbiAgY29uc3Qgd3JhcHBlclBhcnNlciA9IHBhcnNlcihwb3MgPT4ge1xyXG4gICAgcmV0dXJuIHBhcnNlclJlZi5ydW4ocG9zKTtcclxuICB9LCAnd3JhcHBlclBhcnNlcicpO1xyXG5cclxuICByZXR1cm4gVHVwbGUuUGFpcih3cmFwcGVyUGFyc2VyLCBwYXJzZXJSZWYpO1xyXG59XHJcbiJdfQ==