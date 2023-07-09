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

  var _parserForwardedToRef = parserForwardedToRef(),
      _parserForwardedToRef2 = _slicedToArray(_parserForwardedToRef, 2),
      jValueP = _parserForwardedToRef2[0],
      parserRef = _parserForwardedToRef2[1];

  var leftSquareParensP = (0, _parsers.pchar)('[').discardSecond((0, _parsers.many)((0, _parsers.pchar)(' ')));
  var rightSquareParensP = (0, _parsers.pchar)(']').discardSecond((0, _parsers.many)((0, _parsers.pchar)(' ')));
  var commaP = (0, _parsers.pchar)(',').discardSecond((0, _parsers.many)((0, _parsers.pchar)(' ')));
  var jvalueP = jValueP.discardSecond((0, _parsers.many)((0, _parsers.pchar)(' ')));
  var jvaluesP = (0, _parsers.sepBy)(jvalueP, commaP);

  exports.JArrayP = JArrayP = (0, _parsers.between)(leftSquareParensP, jvaluesP, rightSquareParensP).fmap(_classes.JValue.JArray) // we want result to be a JS array
  .setLabel('JSON array parser');

  function parserForwardedToRef() {

    var dummyParser = (0, _parsers.parser)(function (pos) {
      throw 'unfixed forwarded parser';
    }).setLabel('dummyParser');

    var parserRefFun = function parserRefFun() {
      return (0, _parsers.choice)([JNumberP, JNullP, JBoolP, JStringP, JArrayP]);
    };

    var wrapperParser = (0, _parsers.parser)(function (pos) {
      var parserRef = parserRefFun();
      var result = parserRef.run(pos);
      return result;
    }).setLabel('wrapper parser');

    return _classes.Tuple.Pair(wrapperParser, parserRef);
  }
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2pzL2pzb25fcGFyc2Vycy5qcyJdLCJuYW1lcyI6WyJKTnVsbFAiLCJmbWFwIiwiSlZhbHVlIiwiSk51bGwiLCJzZXRMYWJlbCIsIkpUcnVlUCIsIkpCb29sIiwiSkZhbHNlUCIsIkpCb29sUCIsIm9yRWxzZSIsImpVbmVzY2FwZWRDaGFyUCIsImNoYXIiLCJlc2NhcGVkSlNPTkNoYXJzIiwiakVzY2FwZWRDaGFyUCIsIm1hcCIsInN0cmluZ1RvTWF0Y2giLCJyZXN1bHRDaGFyIiwiaGV4RGlnaXRzUCIsInBjaGFyIiwialVuaWNvZGVDaGFyUCIsImRpc2NhcmRGaXJzdCIsImFuZFRoZW4iLCJhIiwiYiIsImMiLCJkIiwicGFyc2VJbnQiLCJqQ2hhclAiLCJkb3VibGVxdW90ZSIsIkpTdHJpbmdQIiwiZGlzY2FyZFNlY29uZCIsIkpTdHJpbmciLCJyZXMiLCJkaWdpdHMiLCJkaWdpdHMxOSIsImRpZ2l0c1AiLCJkaWdpdHMxUCIsIm9wdGlvbmFsUGx1c01pbnVzUCIsIm9wdGlvbmFsTWludXNQIiwiYm94ZWRKdXN0IiwieCIsImlzTm90aGluZyIsInZhbHVlIiwidW5ib3hlZEp1c3QiLCJ1bmJveGVkTm90aGluZyIsImV4cG9uZW50aWFsUCIsImVlIiwib3B0UE0iLCJkaWdzIiwiY29uY2F0Iiwiam9pbiIsImpOdW1iZXJTdHJpbmdQIiwiZG90IiwicmVkdWNlIiwiYWNjIiwiY3VyciIsIkpOdW1iZXJQIiwicGFyc2VGbG9hdCIsIkpOdW1iZXIiLCJKQXJyYXlQIiwicGFyc2VyRm9yd2FyZGVkVG9SZWYiLCJqVmFsdWVQIiwicGFyc2VyUmVmIiwibGVmdFNxdWFyZVBhcmVuc1AiLCJyaWdodFNxdWFyZVBhcmVuc1AiLCJjb21tYVAiLCJqdmFsdWVQIiwianZhbHVlc1AiLCJKQXJyYXkiLCJkdW1teVBhcnNlciIsInBhcnNlclJlZkZ1biIsIndyYXBwZXJQYXJzZXIiLCJyZXN1bHQiLCJydW4iLCJwb3MiLCJUdXBsZSIsIlBhaXIiXSwibWFwcGluZ3Mi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ZUFBTztBQUFFLFlBQU0sMEJBQU47QUFBbUMsS0FBbkQsRUFDakJqRSxRQURpQixDQUNSLGFBRFEsQ0FBcEI7O0FBR0EsUUFBTWtFLGVBQWUsU0FBZkEsWUFBZTtBQUFBLGFBQU0scUJBQU8sQ0FDaENkLFFBRGdDLEVBRWhDeEQsTUFGZ0MsRUFHaENRLE1BSGdDLEVBSWhDcUIsUUFKZ0MsRUFLaEM4QixPQUxnQyxDQUFQLENBQU47QUFBQSxLQUFyQjs7QUFRQSxRQUFNWSxnQkFBZ0IscUJBQU8sZUFBTztBQUNsQyxVQUFNVCxZQUFZUSxjQUFsQjtBQUNBLFVBQU1FLFNBQVNWLFVBQVVXLEdBQVYsQ0FBY0MsR0FBZCxDQUFmO0FBQ0EsYUFBT0YsTUFBUDtBQUNELEtBSnFCLEVBSW5CcEUsUUFKbUIsQ0FJVixnQkFKVSxDQUF0Qjs7QUFNQSxXQUFPdUUsZUFBTUMsSUFBTixDQUFXTCxhQUFYLEVBQTBCVCxTQUExQixDQUFQO0FBQ0QiLCJmaWxlIjoianNvbl9wYXJzZXJzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgSlZhbHVlLFxuICBUdXBsZSxcbn0gZnJvbSAnY2xhc3Nlcyc7XG5pbXBvcnQge1xuICBWYWxpZGF0aW9uLFxufSBmcm9tICd2YWxpZGF0aW9uJztcbmltcG9ydCB7XG4gIHBhcnNlcixcbiAgY2hhclBhcnNlcixcbiAgZGlnaXRQYXJzZXIsXG4gIHByZWRpY2F0ZUJhc2VkUGFyc2VyLFxuICBwY2hhcixcbiAgcGRpZ2l0LFxuICBhbmRUaGVuLFxuICBvckVsc2UsXG4gIGNob2ljZSxcbiAgYW55T2YsXG4gIGZtYXAsXG4gIHJldHVyblAsXG4gIGFwcGx5UCxcbiAgbGlmdDIsXG4gIHNlcXVlbmNlUCxcbiAgc2VxdWVuY2VQMixcbiAgcHN0cmluZyxcbiAgemVyb09yTW9yZSxcbiAgbWFueSxcbiAgbWFueTEsXG4gIG1hbnlDaGFycyxcbiAgbWFueUNoYXJzMSxcbiAgb3B0LFxuICBvcHRCb29rLFxuICBkaXNjYXJkRmlyc3QsXG4gIGRpc2NhcmRTZWNvbmQsXG4gIGJldHdlZW4sXG4gIGJldHdlZW5QYXJlbnMsXG4gIHNlcEJ5MSxcbiAgc2VwQnksXG59IGZyb20gJ3BhcnNlcnMnO1xuXG5leHBvcnQgY29uc3QgSk51bGxQID0gcHN0cmluZygnbnVsbCcpLmZtYXAoXyA9PiBKVmFsdWUuSk51bGwobnVsbCkpLnNldExhYmVsKCdKU09OIG51bGwgcGFyc2VyJyk7XG5cbmNvbnN0IEpUcnVlUCA9IHBzdHJpbmcoJ3RydWUnKS5mbWFwKF8gPT4gSlZhbHVlLkpCb29sKHRydWUpKTtcbmNvbnN0IEpGYWxzZVAgPSBwc3RyaW5nKCdmYWxzZScpLmZtYXAoXyA9PiBKVmFsdWUuSkJvb2woZmFsc2UpKTtcbmV4cG9ydCBjb25zdCBKQm9vbFAgPSBKVHJ1ZVAub3JFbHNlKEpGYWxzZVApLnNldExhYmVsKCdKU09OIGJvb2xlYW4gcGFyc2VyJyk7XG5cbmV4cG9ydCBjb25zdCBqVW5lc2NhcGVkQ2hhclAgPSBwYXJzZXIocHJlZGljYXRlQmFzZWRQYXJzZXIoY2hhciA9PiAoY2hhciAhPT0gJ1xcXFwnICYmIGNoYXIgIT09ICdcIicpKSkuc2V0TGFiZWwoJ2pVbmVzY2FwZWRDaGFyUCcpO1xuXG5jb25zdCBlc2NhcGVkSlNPTkNoYXJzID0gW1xuICAvLyBbc3RyaW5nVG9NYXRjaCwgcmVzdWx0Q2hhcl1cbiAgWydcXFxcXFxcIicsICdcXFwiJ10sICAgICAgLy8gcXVvdGVcbiAgWydcXFxcXFxcXCcsICdcXFxcJ10sICAgICAgLy8gcmV2ZXJzZSBzb2xpZHVzXG4gIFsnXFxcXC8nLCAnLyddLCAgICAgICAgLy8gc29saWR1c1xuICBbJ1xcXFxiJywgJ1xcYiddLCAgICAgICAvLyBiYWNrc3BhY2VcbiAgWydcXFxcZicsICdcXGYnXSwgICAgICAgLy8gZm9ybWZlZWRcbiAgWydcXFxcbicsICdcXG4nXSwgICAgICAgLy8gbmV3bGluZVxuICBbJ1xcXFxyJywgJ1xcciddLCAgICAgICAvLyBjclxuICBbJ1xcXFx0JywgJ1xcdCddLCAgICAgICAvLyB0YWJcbl07XG5leHBvcnQgY29uc3QgakVzY2FwZWRDaGFyUCA9IGNob2ljZShlc2NhcGVkSlNPTkNoYXJzXG4gIC5tYXAoKFtzdHJpbmdUb01hdGNoLCByZXN1bHRDaGFyXSkgPT4gcHN0cmluZyhzdHJpbmdUb01hdGNoKVxuICAgIC5mbWFwKCgpID0+IHJlc3VsdENoYXIpKSlcbiAgICAgIC5zZXRMYWJlbCgnSlNPTiBlc2NhcGVkIGNoYXIgcGFyc2VyJyk7XG5cbmNvbnN0IGhleERpZ2l0c1AgPSBjaG9pY2UoW1xuICAnMCcsICcxJywgJzInLCAnMycsICc0JywgJzUnLCAnNicsICc3JywgJzgnLCAnOScsICdhJywgJ2InLCAnYycsICdkJywgJ2UnLCAnZicsICdBJywgJ0InLCAnQycsICdEJywgJ0UnLCAnRicsXG5dLm1hcChwY2hhcikpO1xuXG5leHBvcnQgY29uc3QgalVuaWNvZGVDaGFyUCA9IHBjaGFyKCdcXFxcJylcbiAgLmRpc2NhcmRGaXJzdChwY2hhcigndScpKVxuICAuZGlzY2FyZEZpcnN0KGhleERpZ2l0c1ApIC8vIHJldHVybnMgYVxuICAuYW5kVGhlbihoZXhEaWdpdHNQKSAvLyByZXR1cm5zIGJcbiAgLmFuZFRoZW4oaGV4RGlnaXRzUCkgLy8gcmV0dXJucyBjXG4gIC5hbmRUaGVuKGhleERpZ2l0c1ApIC8vIHJldHVybnMgZFxuICAuZm1hcCgoW1tbYSwgYl0sIGNdLCBkXSkgPT4gcGFyc2VJbnQoJycgKyBhICsgYiArIGMgKyBkLCAxNikpXG4gIC5zZXRMYWJlbCgnSlNPTiB1bmljb2RlIGNoYXIgcGFyc2VyJyk7XG5cbmNvbnN0IGpDaGFyUCA9IGNob2ljZShbXG4gIGpVbmVzY2FwZWRDaGFyUCxcbiAgakVzY2FwZWRDaGFyUCxcbiAgalVuaWNvZGVDaGFyUFxuXSk7XG5cbmNvbnN0IGRvdWJsZXF1b3RlID0gcGNoYXIoJ1wiJykuc2V0TGFiZWwoJ2RvdWJsZXF1b3RlIHBhcnNlcicpO1xuXG5leHBvcnQgY29uc3QgSlN0cmluZ1AgPSBkb3VibGVxdW90ZVxuICAuZGlzY2FyZEZpcnN0KG1hbnlDaGFycyhqQ2hhclApKVxuICAuZGlzY2FyZFNlY29uZChkb3VibGVxdW90ZSlcbiAgLmZtYXAocmVzID0+IEpWYWx1ZS5KU3RyaW5nKHJlcykpXG4gIC5zZXRMYWJlbCgnSlNPTiBzdHJpbmcgcGFyc2VyJyk7XG5cbmNvbnN0IGRpZ2l0cyA9IFsnMCcsICcxJywgJzInLCAnMycsICc0JywgJzUnLCAnNicsICc3JywgJzgnLCAnOSddO1xuY29uc3QgZGlnaXRzMTkgPSBbJzEnLCAnMicsICczJywgJzQnLCAnNScsICc2JywgJzcnLCAnOCcsICc5J107XG5cbi8vIGltcHJvdmFibGUgYWxsIG92ZXIgdGhlIHBsYWNlIGJ5OlxuLy8gLSB1c2luZyBtYW55Q2hhcnMgdG8gcHJvY2VzcyBsaXN0cyBpbnRvIHN0cmluZ3MgcmlnaHQgYXdheVxuLy8gLSBkaXNjYXJkaW5nIGUvRSdzIGFuZCBkb3RzLCBhbmQgY29tcG9zaW5nIHRoZSBmaW5hbCBudW1iZXIgZnJvbSBOVU1FUklDQUwgcGllY2VzXG5jb25zdCBkaWdpdHNQID0gbWFueShhbnlPZihkaWdpdHMpKTtcbmNvbnN0IGRpZ2l0czFQID0gbWFueTEoYW55T2YoZGlnaXRzKSk7XG5cbmNvbnN0IG9wdGlvbmFsUGx1c01pbnVzUCA9IG9wdChwY2hhcignLScpLm9yRWxzZShwY2hhcignKycpKSk7XG5jb25zdCBvcHRpb25hbE1pbnVzUCA9IG9wdChwY2hhcignLScpKTtcblxuY29uc3QgYm94ZWRKdXN0ID0geCA9PiAoeC5pc05vdGhpbmcgPyBbJyddIDogW3gudmFsdWVdKTtcbmNvbnN0IHVuYm94ZWRKdXN0ID0geCA9PiAoeC5pc05vdGhpbmcgPyBbJyddIDogeC52YWx1ZSk7XG5jb25zdCB1bmJveGVkTm90aGluZyA9IHggPT4gKHguaXNOb3RoaW5nID8gJycgOiB4LnZhbHVlKTtcblxuY29uc3QgZXhwb25lbnRpYWxQID0gY2hvaWNlKFtwY2hhcignZScpLCBwY2hhcignRScpXSlcbiAgLmFuZFRoZW4ob3B0aW9uYWxQbHVzTWludXNQKS8vIC5mbWFwKGJveGVkSnVzdClcbiAgLmFuZFRoZW4oZGlnaXRzMVApXG4gIC5mbWFwKChbW2VlLCBvcHRQTV0sIGRpZ3NdKSA9PiBbZWUsICh1bmJveGVkTm90aGluZyhvcHRQTSkpXS5jb25jYXQoZGlncykuam9pbignJykpO1xuXG4vLyByZXR1cm5zIFN1Y2Nlc3Moc3RyaW5nKVxuZXhwb3J0IGNvbnN0IGpOdW1iZXJTdHJpbmdQID0gc2VxdWVuY2VQKFtcbiAgb3B0aW9uYWxNaW51c1AuZm1hcChib3hlZEp1c3QpLFxuICBkaWdpdHMxUCxcbiAgb3B0KHBjaGFyKCcuJykuYW5kVGhlbihkaWdpdHMxUCkuZm1hcCgoW2RvdCwgZGlnc10pID0+IFtkb3RdLmNvbmNhdChkaWdzKSkpXG4gICAgLmZtYXAodW5ib3hlZEp1c3QpLFxuICBvcHQoZXhwb25lbnRpYWxQKS5mbWFwKGJveGVkSnVzdCksXG5dKS5mbWFwKHJlcyA9PiByZXMucmVkdWNlKChhY2MsIGN1cnIpID0+IGFjYy5jb25jYXQoY3VyciksIFtdKS5qb2luKCcnKSk7XG5cbi8vIHJldHVybnMgU3VjY2VzcyhwYXJzZUZsb2F0KHN0cmluZykpXG5leHBvcnQgY29uc3QgSk51bWJlclAgPSBqTnVtYmVyU3RyaW5nUFxuICAuZm1hcChwYXJzZUZsb2F0KVxuICAuZm1hcChKVmFsdWUuSk51bWJlcilcbiAgLnNldExhYmVsKCdKU09OIG51bWJlciBwYXJzZXInKTtcblxuZXhwb3J0IGxldCBKQXJyYXlQO1xuXG5jb25zdCBbalZhbHVlUCwgcGFyc2VyUmVmXSA9IHBhcnNlckZvcndhcmRlZFRvUmVmKCk7XG5cbmNvbnN0IGxlZnRTcXVhcmVQYXJlbnNQID0gcGNoYXIoJ1snKS5kaXNjYXJkU2Vjb25kKG1hbnkocGNoYXIoJyAnKSkpO1xuY29uc3QgcmlnaHRTcXVhcmVQYXJlbnNQID0gcGNoYXIoJ10nKS5kaXNjYXJkU2Vjb25kKG1hbnkocGNoYXIoJyAnKSkpO1xuY29uc3QgY29tbWFQID0gcGNoYXIoJywnKS5kaXNjYXJkU2Vjb25kKG1hbnkocGNoYXIoJyAnKSkpO1xuY29uc3QganZhbHVlUCA9IGpWYWx1ZVAuZGlzY2FyZFNlY29uZChtYW55KHBjaGFyKCcgJykpKTtcbmNvbnN0IGp2YWx1ZXNQID0gc2VwQnkoanZhbHVlUCwgY29tbWFQKTtcblxuSkFycmF5UCA9IGJldHdlZW4oXG4gIGxlZnRTcXVhcmVQYXJlbnNQLFxuICBqdmFsdWVzUCxcbiAgcmlnaHRTcXVhcmVQYXJlbnNQXG4pXG4gIC5mbWFwKEpWYWx1ZS5KQXJyYXkpIC8vIHdlIHdhbnQgcmVzdWx0IHRvIGJlIGEgSlMgYXJyYXlcbiAgLnNldExhYmVsKCdKU09OIGFycmF5IHBhcnNlcicpO1xuXG5mdW5jdGlvbiBwYXJzZXJGb3J3YXJkZWRUb1JlZigpIHtcblxuICBjb25zdCBkdW1teVBhcnNlciA9IHBhcnNlcihwb3MgPT4geyB0aHJvdyAndW5maXhlZCBmb3J3YXJkZWQgcGFyc2VyJzsgfSlcbiAgICAuc2V0TGFiZWwoJ2R1bW15UGFyc2VyJyk7XG5cbiAgY29uc3QgcGFyc2VyUmVmRnVuID0gKCkgPT4gY2hvaWNlKFtcbiAgICBKTnVtYmVyUCxcbiAgICBKTnVsbFAsXG4gICAgSkJvb2xQLFxuICAgIEpTdHJpbmdQLFxuICAgIEpBcnJheVAsXG4gIF0pO1xuXG4gIGNvbnN0IHdyYXBwZXJQYXJzZXIgPSBwYXJzZXIocG9zID0+IHtcbiAgICBjb25zdCBwYXJzZXJSZWYgPSBwYXJzZXJSZWZGdW4oKTtcbiAgICBjb25zdCByZXN1bHQgPSBwYXJzZXJSZWYucnVuKHBvcyk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfSkuc2V0TGFiZWwoJ3dyYXBwZXIgcGFyc2VyJyk7XG5cbiAgcmV0dXJuIFR1cGxlLlBhaXIod3JhcHBlclBhcnNlciwgcGFyc2VyUmVmKTtcbn1cbiJdfQ==