define(['exports', 'classes', 'validation', 'parsers'], function (exports, _classes, _validation, _parsers) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.JObjectP = exports.JArrayP = exports.JNumberP = exports.jNumberStringP = exports.JStringP = exports.jUnicodeCharP = exports.jEscapedCharP = exports.jUnescapedCharP = exports.JBoolP = exports.JNullP = undefined;

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
  }).setLabel('JSON null parser');

  var JTrueP = (0, _parsers.pstring)('true').fmap(function (_) {
    return _classes.JValue.JBool(true);
  });
  var JFalseP = (0, _parsers.pstring)('false').fmap(function (_) {
    return _classes.JValue.JBool(false);
  });
  var JBoolP = exports.JBoolP = JTrueP.orElse(JFalseP).setLabel('JSON boolean parser');

  var jUnescapedCharP = exports.jUnescapedCharP = (0, _parsers.parser)((0, _parsers.predicateBasedParser)(function (char) {
    return char !== '\\' && char !== '"';
  })).setLabel('jUnescapedCharP');

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
  })).setLabel('JSON escaped char parser');

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
  }).setLabel('JSON unicode char parser');

  var jCharP = (0, _parsers.choice)([jUnescapedCharP, jEscapedCharP, jUnicodeCharP]);

  var doublequote = (0, _parsers.pchar)('"').setLabel('doublequote parser');

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

  var JArrayP = exports.JArrayP = void 0;
  var JObjectP = exports.JObjectP = void 0;

  var _parserForwardedToRef = parserForwardedToRef(),
      _parserForwardedToRef2 = _slicedToArray(_parserForwardedToRef, 2),
      jValueP = _parserForwardedToRef2[0],
      parserRef = _parserForwardedToRef2[1];

  var spacesP = (0, _parsers.many)((0, _parsers.pchar)(' '));
  var leftSquareParensP = (0, _parsers.pchar)('[').discardSecond(spacesP);
  var rightSquareParensP = (0, _parsers.pchar)(']').discardSecond(spacesP);
  var commaP = (0, _parsers.pchar)(',').discardSecond(spacesP);

  var jvalueP = jValueP.discardSecond(spacesP);
  var jvaluesP = (0, _parsers.sepBy)(jvalueP, commaP);

  exports.JArrayP = JArrayP = (0, _parsers.between)(leftSquareParensP, jvaluesP, rightSquareParensP).fmap(_classes.JValue.JArray) // we want result to be a JS array
  .setLabel('JSON array parser');

  var leftCurlyParensP = (0, _parsers.pchar)('{').discardSecond(spacesP);
  var rightCurlyParensP = (0, _parsers.pchar)('}').discardSecond(spacesP);
  var colonP = (0, _parsers.pchar)(':').discardSecond(spacesP);
  var jkeyValueP = JStringP.discardSecond(spacesP).discardSecond(colonP).andThen(jValueP).discardSecond(spacesP);
  var jkeyValuesP = (0, _parsers.sepBy)(jkeyValueP, commaP);

  exports.JObjectP = JObjectP = (0, _parsers.between)(leftCurlyParensP, jkeyValuesP, rightCurlyParensP).fmap(_classes.JValue.JObject).setLabel('JSON object parser');

  function parserForwardedToRef() {

    var dummyParser = (0, _parsers.parser)(function (pos) {
      throw 'unfixed forwarded parser';
    }).setLabel('dummyParser');

    var parserRefFun = function parserRefFun() {
      return (0, _parsers.choice)([JNumberP, JNullP, JBoolP, JStringP, JArrayP, JObjectP]);
    };

    var wrapperParser = (0, _parsers.parser)(function (pos) {
      var parserRef = parserRefFun();
      var result = parserRef.run(pos);
      return result;
    }).setLabel('wrapper parser');

    return _classes.Tuple.Pair(wrapperParser, parserRef);
  }
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2pzL2pzb25fcGFyc2Vycy5qcyJdLCJuYW1lcyI6WyJKTnVsbFAiLCJmbWFwIiwiSlZhbHVlIiwiSk51bGwiLCJzZXRMYWJlbCIsIkpUcnVlUCIsIkpCb29sIiwiSkZhbHNlUCIsIkpCb29sUCIsIm9yRWxzZSIsImpVbmVzY2FwZWRDaGFyUCIsImNoYXIiLCJlc2NhcGVkSlNPTkNoYXJzIiwiakVzY2FwZWRDaGFyUCIsIm1hcCIsInN0cmluZ1RvTWF0Y2giLCJyZXN1bHRDaGFyIiwiaGV4RGlnaXRzUCIsInBjaGFyIiwialVuaWNvZGVDaGFyUCIsImRpc2NhcmRGaXJzdCIsImFuZFRoZW4iLCJhIiwiYiIsImMiLCJkIiwicGFyc2VJbnQiLCJqQ2hhclAiLCJkb3VibGVxdW90ZSIsIkpTdHJpbmdQIiwiZGlzY2FyZFNlY29uZCIsIkpTdHJpbmciLCJyZXMiLCJkaWdpdHMiLCJkaWdpdHMxOSIsImRpZ2l0c1AiLCJkaWdpdHMxUCIsIm9wdGlvbmFsUGx1c01pbnVzUCIsIm9wdGlvbmFsTWludXNQIiwiYm94ZWRKdXN0IiwieCIsImlzTm90aGluZyIsInZhbHVlIiwidW5ib3hlZEp1c3QiLCJ1bmJveGVkTm90aGluZyIsImV4cG9uZW50aWFsUCIsImVlIiwib3B0UE0iLCJkaWdzIiwiY29uY2F0Iiwiam9pbiIsImpOdW1iZXJTdHJpbmdQIiwiZG90IiwicmVkdWNlIiwiYWNjIiwiY3VyciIsIkpOdW1iZXJQIiwicGFyc2VGbG9hdCIsIkpOdW1iZXIiLCJKQXJyYXlQIiwiSk9iamVjdFAiLCJwYXJzZXJGb3J3YXJkZWRUb1JlZiIsImpWYWx1ZVAiLCJwYXJzZXJSZWYiLCJzcGFjZXNQIiwibGVmdFNxdWFyZVBhcmVuc1AiLCJyaWdodFNxdWFyZVBhcmVuc1AiLCJjb21tYVAiLCJqdmFsdWVQIiwianZhbHVlc1AiLCJKQXJyYXkiLCJsZWZ0Q3VybHlQYXJlbnNQIiwicmlnaHRDdXJseVBhcmVuc1AiLCJjb2xvblAiLCJqa2V5VmFsdWVQIiwiamtleVZhbHVlc1AiLCJKT2JqZWN0IiwiZHVtbXlQYXJzZXIiLCJwYXJzZXJSZWZGdW4iLCJ3cmFwcGVyUGFyc2VyIiwicmVzdWx0IiwicnVuIiwicG9zIiwiVHVwbGUiLCJQYWlyIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBd0NPLE1BQU1BLDBCQUFTLHNCQUFRLE1BQVIsRUFBZ0JDLElBQWhCLENBQXFCO0FBQUEsV0FBS0MsZ0JBQU9DLEtBQVAsQ0FBYSxJQUFiLENBQUw7QUFBQSxHQUFyQixFQUE4Q0MsUUFBOUMsQ0FBdUQsa0JBQXZELENBQWY7O0FBRVAsTUFBTUMsU0FBUyxzQkFBUSxNQUFSLEVBQWdCSixJQUFoQixDQUFxQjtBQUFBLFdBQUtDLGdCQUFPSSxLQUFQLENBQWEsSUFBYixDQUFMO0FBQUEsR0FBckIsQ0FBZjtBQUNBLE1BQU1DLFVBQVUsc0JBQVEsT0FBUixFQUFpQk4sSUFBakIsQ0FBc0I7QUFBQSxXQUFLQyxnQkFBT0ksS0FBUCxDQUFhLEtBQWIsQ0FBTDtBQUFBLEdBQXRCLENBQWhCO0FBQ08sTUFBTUUsMEJBQVNILE9BQU9JLE1BQVAsQ0FBY0YsT0FBZCxFQUF1QkgsUUFBdkIsQ0FBZ0MscUJBQWhDLENBQWY7O0FBRUEsTUFBTU0sNENBQWtCLHFCQUFPLG1DQUFxQjtBQUFBLFdBQVNDLFNBQVMsSUFBVCxJQUFpQkEsU0FBUyxHQUFuQztBQUFBLEdBQXJCLENBQVAsRUFBc0VQLFFBQXRFLENBQStFLGlCQUEvRSxDQUF4Qjs7QUFFUCxNQUFNUSxtQkFBbUI7QUFDdkI7QUFDQSxHQUFDLE1BQUQsRUFBUyxJQUFULENBRnVCLEVBRUY7QUFDckIsR0FBQyxNQUFELEVBQVMsSUFBVCxDQUh1QixFQUdGO0FBQ3JCLEdBQUMsS0FBRCxFQUFRLEdBQVIsQ0FKdUIsRUFJRjtBQUNyQixHQUFDLEtBQUQsRUFBUSxJQUFSLENBTHVCLEVBS0Y7QUFDckIsR0FBQyxLQUFELEVBQVEsSUFBUixDQU51QixFQU1GO0FBQ3JCLEdBQUMsS0FBRCxF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RUFJbkI1RSxRQUptQixDQUlWLGdCQUpVLENBQXRCOztBQU1BLFdBQU8rRSxlQUFNQyxJQUFOLENBQVdMLGFBQVgsRUFBMEJoQixTQUExQixDQUFQO0FBQ0QiLCJmaWxlIjoianNvbl9wYXJzZXJzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgSlZhbHVlLFxuICBUdXBsZSxcbn0gZnJvbSAnY2xhc3Nlcyc7XG5pbXBvcnQge1xuICBWYWxpZGF0aW9uLFxufSBmcm9tICd2YWxpZGF0aW9uJztcbmltcG9ydCB7XG4gIHBhcnNlcixcbiAgY2hhclBhcnNlcixcbiAgZGlnaXRQYXJzZXIsXG4gIHByZWRpY2F0ZUJhc2VkUGFyc2VyLFxuICBwY2hhcixcbiAgcGRpZ2l0LFxuICBhbmRUaGVuLFxuICBvckVsc2UsXG4gIGNob2ljZSxcbiAgYW55T2YsXG4gIGZtYXAsXG4gIHJldHVyblAsXG4gIGFwcGx5UCxcbiAgbGlmdDIsXG4gIHNlcXVlbmNlUCxcbiAgc2VxdWVuY2VQMixcbiAgcHN0cmluZyxcbiAgemVyb09yTW9yZSxcbiAgbWFueSxcbiAgbWFueTEsXG4gIG1hbnlDaGFycyxcbiAgbWFueUNoYXJzMSxcbiAgb3B0LFxuICBvcHRCb29rLFxuICBkaXNjYXJkRmlyc3QsXG4gIGRpc2NhcmRTZWNvbmQsXG4gIGJldHdlZW4sXG4gIGJldHdlZW5QYXJlbnMsXG4gIHNlcEJ5MSxcbiAgc2VwQnksXG59IGZyb20gJ3BhcnNlcnMnO1xuXG5leHBvcnQgY29uc3QgSk51bGxQID0gcHN0cmluZygnbnVsbCcpLmZtYXAoXyA9PiBKVmFsdWUuSk51bGwobnVsbCkpLnNldExhYmVsKCdKU09OIG51bGwgcGFyc2VyJyk7XG5cbmNvbnN0IEpUcnVlUCA9IHBzdHJpbmcoJ3RydWUnKS5mbWFwKF8gPT4gSlZhbHVlLkpCb29sKHRydWUpKTtcbmNvbnN0IEpGYWxzZVAgPSBwc3RyaW5nKCdmYWxzZScpLmZtYXAoXyA9PiBKVmFsdWUuSkJvb2woZmFsc2UpKTtcbmV4cG9ydCBjb25zdCBKQm9vbFAgPSBKVHJ1ZVAub3JFbHNlKEpGYWxzZVApLnNldExhYmVsKCdKU09OIGJvb2xlYW4gcGFyc2VyJyk7XG5cbmV4cG9ydCBjb25zdCBqVW5lc2NhcGVkQ2hhclAgPSBwYXJzZXIocHJlZGljYXRlQmFzZWRQYXJzZXIoY2hhciA9PiAoY2hhciAhPT0gJ1xcXFwnICYmIGNoYXIgIT09ICdcIicpKSkuc2V0TGFiZWwoJ2pVbmVzY2FwZWRDaGFyUCcpO1xuXG5jb25zdCBlc2NhcGVkSlNPTkNoYXJzID0gW1xuICAvLyBbc3RyaW5nVG9NYXRjaCwgcmVzdWx0Q2hhcl1cbiAgWydcXFxcXFxcIicsICdcXFwiJ10sICAgICAgLy8gcXVvdGVcbiAgWydcXFxcXFxcXCcsICdcXFxcJ10sICAgICAgLy8gcmV2ZXJzZSBzb2xpZHVzXG4gIFsnXFxcXC8nLCAnLyddLCAgICAgICAgLy8gc29saWR1c1xuICBbJ1xcXFxiJywgJ1xcYiddLCAgICAgICAvLyBiYWNrc3BhY2VcbiAgWydcXFxcZicsICdcXGYnXSwgICAgICAgLy8gZm9ybWZlZWRcbiAgWydcXFxcbicsICdcXG4nXSwgICAgICAgLy8gbmV3bGluZVxuICBbJ1xcXFxyJywgJ1xcciddLCAgICAgICAvLyBjclxuICBbJ1xcXFx0JywgJ1xcdCddLCAgICAgICAvLyB0YWJcbl07XG5leHBvcnQgY29uc3QgakVzY2FwZWRDaGFyUCA9IGNob2ljZShlc2NhcGVkSlNPTkNoYXJzXG4gIC5tYXAoKFtzdHJpbmdUb01hdGNoLCByZXN1bHRDaGFyXSkgPT4gcHN0cmluZyhzdHJpbmdUb01hdGNoKVxuICAgIC5mbWFwKCgpID0+IHJlc3VsdENoYXIpKSlcbiAgICAgIC5zZXRMYWJlbCgnSlNPTiBlc2NhcGVkIGNoYXIgcGFyc2VyJyk7XG5cbmNvbnN0IGhleERpZ2l0c1AgPSBjaG9pY2UoW1xuICAnMCcsICcxJywgJzInLCAnMycsICc0JywgJzUnLCAnNicsICc3JywgJzgnLCAnOScsICdhJywgJ2InLCAnYycsICdkJywgJ2UnLCAnZicsICdBJywgJ0InLCAnQycsICdEJywgJ0UnLCAnRicsXG5dLm1hcChwY2hhcikpO1xuXG5leHBvcnQgY29uc3QgalVuaWNvZGVDaGFyUCA9IHBjaGFyKCdcXFxcJylcbiAgLmRpc2NhcmRGaXJzdChwY2hhcigndScpKVxuICAuZGlzY2FyZEZpcnN0KGhleERpZ2l0c1ApIC8vIHJldHVybnMgYVxuICAuYW5kVGhlbihoZXhEaWdpdHNQKSAvLyByZXR1cm5zIGJcbiAgLmFuZFRoZW4oaGV4RGlnaXRzUCkgLy8gcmV0dXJucyBjXG4gIC5hbmRUaGVuKGhleERpZ2l0c1ApIC8vIHJldHVybnMgZFxuICAuZm1hcCgoW1tbYSwgYl0sIGNdLCBkXSkgPT4gcGFyc2VJbnQoJycgKyBhICsgYiArIGMgKyBkLCAxNikpXG4gIC5zZXRMYWJlbCgnSlNPTiB1bmljb2RlIGNoYXIgcGFyc2VyJyk7XG5cbmNvbnN0IGpDaGFyUCA9IGNob2ljZShbXG4gIGpVbmVzY2FwZWRDaGFyUCxcbiAgakVzY2FwZWRDaGFyUCxcbiAgalVuaWNvZGVDaGFyUFxuXSk7XG5cbmNvbnN0IGRvdWJsZXF1b3RlID0gcGNoYXIoJ1wiJykuc2V0TGFiZWwoJ2RvdWJsZXF1b3RlIHBhcnNlcicpO1xuXG5leHBvcnQgY29uc3QgSlN0cmluZ1AgPSBkb3VibGVxdW90ZVxuICAuZGlzY2FyZEZpcnN0KG1hbnlDaGFycyhqQ2hhclApKVxuICAuZGlzY2FyZFNlY29uZChkb3VibGVxdW90ZSlcbiAgLmZtYXAocmVzID0+IEpWYWx1ZS5KU3RyaW5nKHJlcykpXG4gIC5zZXRMYWJlbCgnSlNPTiBzdHJpbmcgcGFyc2VyJyk7XG5cbmNvbnN0IGRpZ2l0cyA9IFsnMCcsICcxJywgJzInLCAnMycsICc0JywgJzUnLCAnNicsICc3JywgJzgnLCAnOSddO1xuY29uc3QgZGlnaXRzMTkgPSBbJzEnLCAnMicsICczJywgJzQnLCAnNScsICc2JywgJzcnLCAnOCcsICc5J107XG5cbi8vIGltcHJvdmFibGUgYWxsIG92ZXIgdGhlIHBsYWNlIGJ5OlxuLy8gLSB1c2luZyBtYW55Q2hhcnMgdG8gcHJvY2VzcyBsaXN0cyBpbnRvIHN0cmluZ3MgcmlnaHQgYXdheVxuLy8gLSBkaXNjYXJkaW5nIGUvRSdzIGFuZCBkb3RzLCBhbmQgY29tcG9zaW5nIHRoZSBmaW5hbCBudW1iZXIgZnJvbSBOVU1FUklDQUwgcGllY2VzXG5jb25zdCBkaWdpdHNQID0gbWFueShhbnlPZihkaWdpdHMpKTtcbmNvbnN0IGRpZ2l0czFQID0gbWFueTEoYW55T2YoZGlnaXRzKSk7XG5cbmNvbnN0IG9wdGlvbmFsUGx1c01pbnVzUCA9IG9wdChwY2hhcignLScpLm9yRWxzZShwY2hhcignKycpKSk7XG5jb25zdCBvcHRpb25hbE1pbnVzUCA9IG9wdChwY2hhcignLScpKTtcblxuY29uc3QgYm94ZWRKdXN0ID0geCA9PiAoeC5pc05vdGhpbmcgPyBbJyddIDogW3gudmFsdWVdKTtcbmNvbnN0IHVuYm94ZWRKdXN0ID0geCA9PiAoeC5pc05vdGhpbmcgPyBbJyddIDogeC52YWx1ZSk7XG5jb25zdCB1bmJveGVkTm90aGluZyA9IHggPT4gKHguaXNOb3RoaW5nID8gJycgOiB4LnZhbHVlKTtcblxuY29uc3QgZXhwb25lbnRpYWxQID0gY2hvaWNlKFtwY2hhcignZScpLCBwY2hhcignRScpXSlcbiAgLmFuZFRoZW4ob3B0aW9uYWxQbHVzTWludXNQKS8vIC5mbWFwKGJveGVkSnVzdClcbiAgLmFuZFRoZW4oZGlnaXRzMVApXG4gIC5mbWFwKChbW2VlLCBvcHRQTV0sIGRpZ3NdKSA9PiBbZWUsICh1bmJveGVkTm90aGluZyhvcHRQTSkpXS5jb25jYXQoZGlncykuam9pbignJykpO1xuXG4vLyByZXR1cm5zIFN1Y2Nlc3Moc3RyaW5nKVxuZXhwb3J0IGNvbnN0IGpOdW1iZXJTdHJpbmdQID0gc2VxdWVuY2VQKFtcbiAgb3B0aW9uYWxNaW51c1AuZm1hcChib3hlZEp1c3QpLFxuICBkaWdpdHMxUCxcbiAgb3B0KHBjaGFyKCcuJykuYW5kVGhlbihkaWdpdHMxUCkuZm1hcCgoW2RvdCwgZGlnc10pID0+IFtkb3RdLmNvbmNhdChkaWdzKSkpXG4gICAgLmZtYXAodW5ib3hlZEp1c3QpLFxuICBvcHQoZXhwb25lbnRpYWxQKS5mbWFwKGJveGVkSnVzdCksXG5dKS5mbWFwKHJlcyA9PiByZXMucmVkdWNlKChhY2MsIGN1cnIpID0+IGFjYy5jb25jYXQoY3VyciksIFtdKS5qb2luKCcnKSk7XG5cbi8vIHJldHVybnMgU3VjY2VzcyhwYXJzZUZsb2F0KHN0cmluZykpXG5leHBvcnQgY29uc3QgSk51bWJlclAgPSBqTnVtYmVyU3RyaW5nUFxuICAuZm1hcChwYXJzZUZsb2F0KVxuICAuZm1hcChKVmFsdWUuSk51bWJlcilcbiAgLnNldExhYmVsKCdKU09OIG51bWJlciBwYXJzZXInKTtcblxuZXhwb3J0IGxldCBKQXJyYXlQO1xuZXhwb3J0IGxldCBKT2JqZWN0UDtcblxuY29uc3QgW2pWYWx1ZVAsIHBhcnNlclJlZl0gPSBwYXJzZXJGb3J3YXJkZWRUb1JlZigpO1xuXG5jb25zdCBzcGFjZXNQID0gbWFueShwY2hhcignICcpKTtcbmNvbnN0IGxlZnRTcXVhcmVQYXJlbnNQID0gcGNoYXIoJ1snKS5kaXNjYXJkU2Vjb25kKHNwYWNlc1ApO1xuY29uc3QgcmlnaHRTcXVhcmVQYXJlbnNQID0gcGNoYXIoJ10nKS5kaXNjYXJkU2Vjb25kKHNwYWNlc1ApO1xuY29uc3QgY29tbWFQID0gcGNoYXIoJywnKS5kaXNjYXJkU2Vjb25kKHNwYWNlc1ApO1xuXG5jb25zdCBqdmFsdWVQID0galZhbHVlUC5kaXNjYXJkU2Vjb25kKHNwYWNlc1ApO1xuY29uc3QganZhbHVlc1AgPSBzZXBCeShqdmFsdWVQLCBjb21tYVApO1xuXG5KQXJyYXlQID0gYmV0d2VlbihcbiAgbGVmdFNxdWFyZVBhcmVuc1AsXG4gIGp2YWx1ZXNQLFxuICByaWdodFNxdWFyZVBhcmVuc1BcbilcbiAgLmZtYXAoSlZhbHVlLkpBcnJheSkgLy8gd2Ugd2FudCByZXN1bHQgdG8gYmUgYSBKUyBhcnJheVxuICAuc2V0TGFiZWwoJ0pTT04gYXJyYXkgcGFyc2VyJyk7XG5cbmNvbnN0IGxlZnRDdXJseVBhcmVuc1AgPSBwY2hhcigneycpLmRpc2NhcmRTZWNvbmQoc3BhY2VzUCk7XG5jb25zdCByaWdodEN1cmx5UGFyZW5zUCA9IHBjaGFyKCd9JykuZGlzY2FyZFNlY29uZChzcGFjZXNQKTtcbmNvbnN0IGNvbG9uUCA9IHBjaGFyKCc6JykuZGlzY2FyZFNlY29uZChzcGFjZXNQKTtcbmNvbnN0IGprZXlWYWx1ZVAgPSBKU3RyaW5nUFxuICAuZGlzY2FyZFNlY29uZChzcGFjZXNQKVxuICAuZGlzY2FyZFNlY29uZChjb2xvblApXG4gIC5hbmRUaGVuKGpWYWx1ZVApXG4gIC5kaXNjYXJkU2Vjb25kKHNwYWNlc1ApO1xuY29uc3QgamtleVZhbHVlc1AgPSBzZXBCeShqa2V5VmFsdWVQLCBjb21tYVApO1xuXG5KT2JqZWN0UCA9IGJldHdlZW4oXG4gIGxlZnRDdXJseVBhcmVuc1AsXG4gIGprZXlWYWx1ZXNQLFxuICByaWdodEN1cmx5UGFyZW5zUFxuKVxuICAuZm1hcChKVmFsdWUuSk9iamVjdClcbiAgLnNldExhYmVsKCdKU09OIG9iamVjdCBwYXJzZXInKTtcblxuZnVuY3Rpb24gcGFyc2VyRm9yd2FyZGVkVG9SZWYoKSB7XG5cbiAgY29uc3QgZHVtbXlQYXJzZXIgPSBwYXJzZXIocG9zID0+IHsgdGhyb3cgJ3VuZml4ZWQgZm9yd2FyZGVkIHBhcnNlcic7IH0pXG4gICAgLnNldExhYmVsKCdkdW1teVBhcnNlcicpO1xuXG4gIGNvbnN0IHBhcnNlclJlZkZ1biA9ICgpID0+IGNob2ljZShbXG4gICAgSk51bWJlclAsXG4gICAgSk51bGxQLFxuICAgIEpCb29sUCxcbiAgICBKU3RyaW5nUCxcbiAgICBKQXJyYXlQLFxuICAgIEpPYmplY3RQLFxuICBdKTtcblxuICBjb25zdCB3cmFwcGVyUGFyc2VyID0gcGFyc2VyKHBvcyA9PiB7XG4gICAgY29uc3QgcGFyc2VyUmVmID0gcGFyc2VyUmVmRnVuKCk7XG4gICAgY29uc3QgcmVzdWx0ID0gcGFyc2VyUmVmLnJ1bihwb3MpO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH0pLnNldExhYmVsKCd3cmFwcGVyIHBhcnNlcicpO1xuXG4gIHJldHVybiBUdXBsZS5QYWlyKHdyYXBwZXJQYXJzZXIsIHBhcnNlclJlZik7XG59XG4iXX0=