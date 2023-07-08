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
  }, 'jUnescapedCharP'));

  var escapedJSONChars = [
  // [stringToMatch, resultChar]
  ['\\\"', '\"'], // quote
  ['\\\\', '\\'], // reverse solidus
  ['\\/', '/'], // solidus
  ['\\b', '\b'], // backspace
  ['\\f', '\f'], // formfeed
  ['\\n', '\n'], // newline
  ['\\r', '\r'], // cr
  ['\\t', '\t']];
  var jEscapedCharP = exports.jEscapedCharP = (0, _parsers.choice)(escapedJSONChars.map(function (_ref) {
    var _ref2 = _slicedToArray(_ref, 2),
        stringToMatch = _ref2[0],
        resultChar = _ref2[1];

    return (0, _parsers.pstring)(stringToMatch).fmap(function () {
      return resultChar;
    });
  })).setLabel('escaped char');

  var hexDigitsP = (0, _parsers.choice)(['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f', 'A', 'B', 'C', 'D', 'E', 'F'].map(_parsers.pchar));

  var jUnicodeCharP = exports.jUnicodeCharP = (0, _parsers.pchar)('\\').discardFirst((0, _parsers.pchar)('u')).discardFirst(hexDigitsP) // returns a
  .andThen(hexDigitsP) // returns b
  .andThen(hexDigitsP) // returns c
  .andThen(hexDigitsP) // returns d
  .fmap(function (_ref3) {
    var _ref4 = _slicedToArray(_ref3, 2),
        _ref4$ = _slicedToArray(_ref4[0], 2),
        _ref4$$ = _slicedToArray(_ref4$[0], 2),
        a = _ref4$$[0],
        b = _ref4$$[1],
        c = _ref4$[1],
        d = _ref4[1];

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
  .andThen(digits1P).fmap(function (_ref5) {
    var _ref6 = _slicedToArray(_ref5, 2),
        _ref6$ = _slicedToArray(_ref6[0], 2),
        ee = _ref6$[0],
        optPM = _ref6$[1],
        digs = _ref6[1];

    return [ee, unboxedNothing(optPM)].concat(digs).join('');
  });

  // returns Success(string)
  var jNumberStringP = exports.jNumberStringP = (0, _parsers.sequenceP)([optionalMinusP.fmap(boxedJust), digits1P, (0, _parsers.opt)((0, _parsers.pchar)('.').andThen(digits1P).fmap(function (_ref7) {
    var _ref8 = _slicedToArray(_ref7, 2),
        dot = _ref8[0],
        digs = _ref8[1];

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2pzL2pzb25fcGFyc2Vycy5qcyJdLCJuYW1lcyI6WyJKTnVsbFAiLCJmbWFwIiwiSlZhbHVlIiwiSk51bGwiLCJzZXRMYWJlbCIsIkpUcnVlUCIsIkpCb29sIiwiSkZhbHNlUCIsIkpCb29sUCIsIm9yRWxzZSIsImpVbmVzY2FwZWRDaGFyUCIsImNoYXIiLCJlc2NhcGVkSlNPTkNoYXJzIiwiakVzY2FwZWRDaGFyUCIsIm1hcCIsInN0cmluZ1RvTWF0Y2giLCJyZXN1bHRDaGFyIiwiaGV4RGlnaXRzUCIsInBjaGFyIiwialVuaWNvZGVDaGFyUCIsImRpc2NhcmRGaXJzdCIsImFuZFRoZW4iLCJhIiwiYiIsImMiLCJkIiwicGFyc2VJbnQiLCJqQ2hhclAiLCJkb3VibGVxdW90ZSIsIkpTdHJpbmdQIiwiZGlzY2FyZFNlY29uZCIsIkpTdHJpbmciLCJyZXMiLCJkaWdpdHMiLCJkaWdpdHMxOSIsImRpZ2l0c1AiLCJkaWdpdHMxUCIsIm9wdGlvbmFsUGx1c01pbnVzUCIsIm9wdGlvbmFsTWludXNQIiwiYm94ZWRKdXN0IiwieCIsImlzTm90aGluZyIsInZhbHVlIiwidW5ib3hlZEp1c3QiLCJ1bmJveGVkTm90aGluZyIsImV4cG9uZW50aWFsUCIsImVlIiwib3B0UE0iLCJkaWdzIiwiY29uY2F0Iiwiam9pbiIsImpOdW1iZXJTdHJpbmdQIiwiZG90IiwicmVkdWNlIiwiYWNjIiwiY3VyciIsIkpOdW1iZXJQIiwicGFyc2VGbG9hdCIsIkpOdW1iZXIiLCJwYXJzZXJGb3J3YXJkZWRUb1JlZiIsImpWYWx1ZVAiLCJwYXJzZXJSZWYiLCJsZWZ0U3F1YXJlUGFyZW5zUCIsInJpZ2h0U3F1YXJlUGFyZW5zUCIsImNvbW1hUCIsImp2YWx1ZVAiLCJqdmFsdWVzUCIsIkpBcnJheVAiLCJKQXJyYXkiLCJkdW1teVBhcnNlciIsIlZhbGlkYXRpb24iLCJGYWlsdXJlIiwiVHVwbGUiLCJUcmlwbGUiLCJwb3MiLCJ3cmFwcGVyUGFyc2VyIiwicnVuIiwiUGFpciJdLCJt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QyxPQUFYLENBQW1CQyxlQUFNQyxNQUFOLENBQWEsMEJBQWIsRUFBeUMsT0FBekMsRUFBa0RDLEdBQWxELENBQW5CLENBRHlCO0FBQUEsS0FBUCxFQUVwQixhQUZvQixDQUFwQjs7QUFJQSxRQUFNYixZQUFZUSxXQUFsQjs7QUFFQSxRQUFNTSxnQkFBZ0IscUJBQU8sZUFBTztBQUNsQyxhQUFPZCxVQUFVZSxHQUFWLENBQWNGLEdBQWQsQ0FBUDtBQUNELEtBRnFCLEVBRW5CLGVBRm1CLENBQXRCOztBQUlBLFdBQU9GLGVBQU1LLElBQU4sQ0FBV0YsYUFBWCxFQUEwQmQsU0FBMUIsQ0FBUDtBQUNEIiwiZmlsZSI6Impzb25fcGFyc2Vycy5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG4gIEpWYWx1ZSxcbiAgVHVwbGUsXG59IGZyb20gJ2NsYXNzZXMnO1xuaW1wb3J0IHtcbiAgVmFsaWRhdGlvbixcbn0gZnJvbSAndmFsaWRhdGlvbic7XG5pbXBvcnQge1xuICBwYXJzZXIsXG4gIGNoYXJQYXJzZXIsXG4gIGRpZ2l0UGFyc2VyLFxuICBwcmVkaWNhdGVCYXNlZFBhcnNlcixcbiAgcGNoYXIsXG4gIHBkaWdpdCxcbiAgYW5kVGhlbixcbiAgb3JFbHNlLFxuICBjaG9pY2UsXG4gIGFueU9mLFxuICBmbWFwLFxuICByZXR1cm5QLFxuICBhcHBseVAsXG4gIGxpZnQyLFxuICBzZXF1ZW5jZVAsXG4gIHNlcXVlbmNlUDIsXG4gIHBzdHJpbmcsXG4gIHplcm9Pck1vcmUsXG4gIG1hbnksXG4gIG1hbnkxLFxuICBtYW55Q2hhcnMsXG4gIG1hbnlDaGFyczEsXG4gIG9wdCxcbiAgb3B0Qm9vayxcbiAgZGlzY2FyZEZpcnN0LFxuICBkaXNjYXJkU2Vjb25kLFxuICBiZXR3ZWVuLFxuICBiZXR3ZWVuUGFyZW5zLFxuICBzZXBCeTEsXG59IGZyb20gJ3BhcnNlcnMnO1xuXG5leHBvcnQgY29uc3QgSk51bGxQID0gcHN0cmluZygnbnVsbCcpLmZtYXAoXyA9PiBKVmFsdWUuSk51bGwobnVsbCkpLnNldExhYmVsKCdudWxsJyk7XG5cbmNvbnN0IEpUcnVlUCA9IHBzdHJpbmcoJ3RydWUnKS5mbWFwKF8gPT4gSlZhbHVlLkpCb29sKHRydWUpKTtcbmNvbnN0IEpGYWxzZVAgPSBwc3RyaW5nKCdmYWxzZScpLmZtYXAoXyA9PiBKVmFsdWUuSkJvb2woZmFsc2UpKTtcbmV4cG9ydCBjb25zdCBKQm9vbFAgPSBKVHJ1ZVAub3JFbHNlKEpGYWxzZVApLnNldExhYmVsKCdib29sJyk7XG5cbmV4cG9ydCBjb25zdCBqVW5lc2NhcGVkQ2hhclAgPSBwYXJzZXIocHJlZGljYXRlQmFzZWRQYXJzZXIoY2hhciA9PiAoY2hhciAhPT0gJ1xcXFwnICYmIGNoYXIgIT09ICdcIicpLCAnalVuZXNjYXBlZENoYXJQJykpO1xuXG5jb25zdCBlc2NhcGVkSlNPTkNoYXJzID0gW1xuICAvLyBbc3RyaW5nVG9NYXRjaCwgcmVzdWx0Q2hhcl1cbiAgWydcXFxcXFxcIicsICdcXFwiJ10sICAgICAgLy8gcXVvdGVcbiAgWydcXFxcXFxcXCcsICdcXFxcJ10sICAgICAgLy8gcmV2ZXJzZSBzb2xpZHVzXG4gIFsnXFxcXC8nLCAnLyddLCAgICAgICAgLy8gc29saWR1c1xuICBbJ1xcXFxiJywgJ1xcYiddLCAgICAgICAvLyBiYWNrc3BhY2VcbiAgWydcXFxcZicsICdcXGYnXSwgICAgICAgLy8gZm9ybWZlZWRcbiAgWydcXFxcbicsICdcXG4nXSwgICAgICAgLy8gbmV3bGluZVxuICBbJ1xcXFxyJywgJ1xcciddLCAgICAgICAvLyBjclxuICBbJ1xcXFx0JywgJ1xcdCddLCAgICAgICAvLyB0YWJcbl07XG5leHBvcnQgY29uc3QgakVzY2FwZWRDaGFyUCA9IGNob2ljZShlc2NhcGVkSlNPTkNoYXJzXG4gIC5tYXAoKFtzdHJpbmdUb01hdGNoLCByZXN1bHRDaGFyXSkgPT4gcHN0cmluZyhzdHJpbmdUb01hdGNoKS5mbWFwKCgpID0+IHJlc3VsdENoYXIpKSlcbiAgICAuc2V0TGFiZWwoJ2VzY2FwZWQgY2hhcicpO1xuXG5jb25zdCBoZXhEaWdpdHNQID0gY2hvaWNlKFtcbiAgJzAnLCAnMScsICcyJywgJzMnLCAnNCcsICc1JywgJzYnLCAnNycsICc4JywgJzknLCAnYScsICdiJywgJ2MnLCAnZCcsICdlJywgJ2YnLCAnQScsICdCJywgJ0MnLCAnRCcsICdFJywgJ0YnLFxuXS5tYXAocGNoYXIpKTtcblxuZXhwb3J0IGNvbnN0IGpVbmljb2RlQ2hhclAgPSBwY2hhcignXFxcXCcpXG4gIC5kaXNjYXJkRmlyc3QocGNoYXIoJ3UnKSlcbiAgLmRpc2NhcmRGaXJzdChoZXhEaWdpdHNQKSAvLyByZXR1cm5zIGFcbiAgLmFuZFRoZW4oaGV4RGlnaXRzUCkgLy8gcmV0dXJucyBiXG4gIC5hbmRUaGVuKGhleERpZ2l0c1ApIC8vIHJldHVybnMgY1xuICAuYW5kVGhlbihoZXhEaWdpdHNQKSAvLyByZXR1cm5zIGRcbiAgLmZtYXAoKFtbW2EsIGJdLCBjXSwgZF0pID0+IHBhcnNlSW50KCcnICsgYSArIGIgKyBjICsgZCwgMTYpKVxuICAuc2V0TGFiZWwoJ3VuaWNvZGUgY2hhcicpO1xuXG5jb25zdCBqQ2hhclAgPSBqVW5lc2NhcGVkQ2hhclAvKiAub3JFbHNlKGpFc2NhcGVkQ2hhclApICovLm9yRWxzZShqVW5pY29kZUNoYXJQKTtcbmNvbnN0IGRvdWJsZXF1b3RlID0gcGNoYXIoJ1wiJykuc2V0TGFiZWwoJ2RvdWJsZXF1b3RlJyk7XG5cbmV4cG9ydCBjb25zdCBKU3RyaW5nUCA9IGRvdWJsZXF1b3RlXG4gIC5kaXNjYXJkRmlyc3QobWFueUNoYXJzKGpDaGFyUCkpXG4gIC5kaXNjYXJkU2Vjb25kKGRvdWJsZXF1b3RlKVxuICAuZm1hcChyZXMgPT4gSlZhbHVlLkpTdHJpbmcocmVzKSlcbiAgLnNldExhYmVsKCdKU09OIHN0cmluZyBwYXJzZXInKTtcblxuY29uc3QgZGlnaXRzID0gWycwJywgJzEnLCAnMicsICczJywgJzQnLCAnNScsICc2JywgJzcnLCAnOCcsICc5J107XG5jb25zdCBkaWdpdHMxOSA9IFsnMScsICcyJywgJzMnLCAnNCcsICc1JywgJzYnLCAnNycsICc4JywgJzknXTtcblxuLy8gaW1wcm92YWJsZSBhbGwgb3ZlciB0aGUgcGxhY2UgYnk6XG4vLyAtIHVzaW5nIG1hbnlDaGFycyB0byBwcm9jZXNzIGxpc3RzIGludG8gc3RyaW5ncyByaWdodCBhd2F5XG4vLyAtIGRpc2NhcmRpbmcgZS9FJ3MgYW5kIGRvdHMsIGFuZCBjb21wb3NpbmcgdGhlIGZpbmFsIG51bWJlciBmcm9tIE5VTUVSSUNBTCBwaWVjZXNcbmNvbnN0IGRpZ2l0c1AgPSBtYW55KGFueU9mKGRpZ2l0cykpO1xuY29uc3QgZGlnaXRzMVAgPSBtYW55MShhbnlPZihkaWdpdHMpKTtcblxuY29uc3Qgb3B0aW9uYWxQbHVzTWludXNQID0gb3B0KHBjaGFyKCctJykub3JFbHNlKHBjaGFyKCcrJykpKTtcbmNvbnN0IG9wdGlvbmFsTWludXNQID0gb3B0KHBjaGFyKCctJykpO1xuXG5jb25zdCBib3hlZEp1c3QgPSB4ID0+ICh4LmlzTm90aGluZyA/IFsnJ10gOiBbeC52YWx1ZV0pO1xuY29uc3QgdW5ib3hlZEp1c3QgPSB4ID0+ICh4LmlzTm90aGluZyA/IFsnJ10gOiB4LnZhbHVlKTtcbmNvbnN0IHVuYm94ZWROb3RoaW5nID0geCA9PiAoeC5pc05vdGhpbmcgPyAnJyA6IHgudmFsdWUpO1xuXG5jb25zdCBleHBvbmVudGlhbFAgPSBjaG9pY2UoW3BjaGFyKCdlJyksIHBjaGFyKCdFJyldKVxuICAuYW5kVGhlbihvcHRpb25hbFBsdXNNaW51c1ApLy8gLmZtYXAoYm94ZWRKdXN0KVxuICAuYW5kVGhlbihkaWdpdHMxUClcbiAgLmZtYXAoKFtbZWUsIG9wdFBNXSwgZGlnc10pID0+IFtlZSwgKHVuYm94ZWROb3RoaW5nKG9wdFBNKSldLmNvbmNhdChkaWdzKS5qb2luKCcnKSk7XG5cbi8vIHJldHVybnMgU3VjY2VzcyhzdHJpbmcpXG5leHBvcnQgY29uc3Qgak51bWJlclN0cmluZ1AgPSBzZXF1ZW5jZVAoW1xuICBvcHRpb25hbE1pbnVzUC5mbWFwKGJveGVkSnVzdCksXG4gIGRpZ2l0czFQLFxuICBvcHQocGNoYXIoJy4nKS5hbmRUaGVuKGRpZ2l0czFQKS5mbWFwKChbZG90LCBkaWdzXSkgPT4gW2RvdF0uY29uY2F0KGRpZ3MpKSlcbiAgICAuZm1hcCh1bmJveGVkSnVzdCksXG4gIG9wdChleHBvbmVudGlhbFApLmZtYXAoYm94ZWRKdXN0KSxcbl0pLmZtYXAocmVzID0+IHJlcy5yZWR1Y2UoKGFjYywgY3VycikgPT4gYWNjLmNvbmNhdChjdXJyKSwgW10pLmpvaW4oJycpKTtcblxuLy8gcmV0dXJucyBTdWNjZXNzKHBhcnNlRmxvYXQoc3RyaW5nKSlcbmV4cG9ydCBjb25zdCBKTnVtYmVyUCA9IGpOdW1iZXJTdHJpbmdQXG4gIC5mbWFwKHBhcnNlRmxvYXQpXG4gIC5mbWFwKEpWYWx1ZS5KTnVtYmVyKVxuICAuc2V0TGFiZWwoJ0pTT04gbnVtYmVyIHBhcnNlcicpO1xuXG5jb25zdCBbalZhbHVlUCwgcGFyc2VyUmVmXSA9IHBhcnNlckZvcndhcmRlZFRvUmVmKCk7XG5cbmNvbnN0IGxlZnRTcXVhcmVQYXJlbnNQID0gcGNoYXIoJ1snKS5kaXNjYXJkU2Vjb25kKG1hbnkocGNoYXIoJyAnKSkpO1xuY29uc3QgcmlnaHRTcXVhcmVQYXJlbnNQID0gcGNoYXIoJ10nKS5kaXNjYXJkU2Vjb25kKG1hbnkocGNoYXIoJyAnKSkpO1xuY29uc3QgY29tbWFQID0gcGNoYXIoJywnKS5kaXNjYXJkU2Vjb25kKG1hbnkocGNoYXIoJyAnKSkpO1xuY29uc3QganZhbHVlUCA9IGpWYWx1ZVAuZGlzY2FyZFNlY29uZChtYW55KHBjaGFyKCcgJykpKTtcbmNvbnN0IGp2YWx1ZXNQID0gc2VwQnkxKGp2YWx1ZVAsIGNvbW1hUCk7XG5cbmV4cG9ydCBjb25zdCBKQXJyYXlQID0gYmV0d2VlbihsZWZ0U3F1YXJlUGFyZW5zUCwganZhbHVlc1AsIHJpZ2h0U3F1YXJlUGFyZW5zUClcbiAgLmZtYXAoSlZhbHVlLkpBcnJheSlcbiAgLnNldExhYmVsKCdKU09OIGFycmF5IHBhcnNlcicpO1xuXG4vLyBwYXJzZXJSZWYgPSBKTnVsbFBcbi8vICAgICAub3JFbHNlKEpCb29sUClcbi8vICAgICAub3JFbHNlKEpTdHJpbmdQKVxuLy8gICAgIC5vckVsc2UoSk51bWJlclApXG4vLyAgICAgLm9yRWxzZShKQXJyYXlQKTtcblxuZnVuY3Rpb24gcGFyc2VyRm9yd2FyZGVkVG9SZWYoKSB7XG5cbiAgY29uc3QgZHVtbXlQYXJzZXIgPSBwYXJzZXIocG9zID0+XG4gICAgVmFsaWRhdGlvbi5GYWlsdXJlKFR1cGxlLlRyaXBsZSgndW5maXhlZCBmb3J3YXJkZWQgcGFyc2VyJywgJ19mYWlsJywgcG9zKSksXG4gICdkdW1teVBhcnNlcicpO1xuXG4gIGNvbnN0IHBhcnNlclJlZiA9IGR1bW15UGFyc2VyO1xuXG4gIGNvbnN0IHdyYXBwZXJQYXJzZXIgPSBwYXJzZXIocG9zID0+IHtcbiAgICByZXR1cm4gcGFyc2VyUmVmLnJ1bihwb3MpO1xuICB9LCAnd3JhcHBlclBhcnNlcicpO1xuXG4gIHJldHVybiBUdXBsZS5QYWlyKHdyYXBwZXJQYXJzZXIsIHBhcnNlclJlZik7XG59XG4iXX0=