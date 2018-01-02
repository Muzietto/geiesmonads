define(['exports', 'classes', 'parsers'], function (exports, _classes, _parsers) {
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

    var hexDigitsP = (0, _parsers.choice)(['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f', 'A', 'B', 'C', 'D', 'E', 'F'].map(_parsers.pchar));

    var jUnicodeCharP = exports.jUnicodeCharP = (0, _parsers.pchar)('\\').discardFirst((0, _parsers.pchar)('u')).discardFirst(hexDigitsP) //returns a
    .andThen(hexDigitsP) //returns b
    .andThen(hexDigitsP) //returns c
    .andThen(hexDigitsP) //returns d
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

    var jCharP = jUnescapedCharP /*.orElse(jEscapedCharP)*/.orElse(jUnicodeCharP);
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

    var exponentialP = (0, _parsers.choice)([(0, _parsers.pchar)('e'), (0, _parsers.pchar)('E')]).andThen(optionalPlusMinusP) //.fmap(boxedJust)
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

    var arrayValueP = JNullP.orElse(JBoolP).orElse(JStringP).orElse(JNumberP);

    var trimmedCommaP = (0, _parsers.opt)((0, _parsers.manyChars)((0, _parsers.pchar)(' '))).discardFirst((0, _parsers.pchar)(',')).discardSecond((0, _parsers.opt)((0, _parsers.manyChars)((0, _parsers.pchar)(' '))));

    var emptyArrayP = (0, _parsers.pstring)('[]').fmap(function (_) {
        return _classes.JValue.JArray();
    });
    var fullArrayP = (0, _parsers.pchar)('[').discardFirst((0, _parsers.andThen)(arrayValueP, (0, _parsers.many)(trimmedCommaP.discardFirst(arrayValueP))).fmap(function (_ref7) {
        var _ref8 = _slicedToArray(_ref7, 2),
            value = _ref8[0],
            values = _ref8[1];

        return [value].concat(values);
    })).discardSecond((0, _parsers.pchar)(']')).fmap(function (_ref9) {
        var _ref10 = _slicedToArray(_ref9, 1),
            xs = _ref10[0];

        return _classes.JValue.JArray(xs);
    });

    var JArrayP = exports.JArrayP = emptyArrayP.orElse(fullArrayP).setLabel('JSON array parser');
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2pzL2pzb25fcGFyc2Vycy5qcyJdLCJuYW1lcyI6WyJKTnVsbFAiLCJmbWFwIiwiSk51bGwiLCJzZXRMYWJlbCIsIkpUcnVlUCIsIkpCb29sIiwiSkZhbHNlUCIsIkpCb29sUCIsIm9yRWxzZSIsImpVbmVzY2FwZWRDaGFyUCIsImNoYXIiLCJlc2NhcGVkSlNPTkNoYXJzIiwiakVzY2FwZWRDaGFyUCIsIm1hcCIsImhleERpZ2l0c1AiLCJqVW5pY29kZUNoYXJQIiwiZGlzY2FyZEZpcnN0IiwiYW5kVGhlbiIsImEiLCJiIiwiYyIsImQiLCJwYXJzZUludCIsImpDaGFyUCIsImRvdWJsZXF1b3RlIiwiSlN0cmluZ1AiLCJkaXNjYXJkU2Vjb25kIiwiSlN0cmluZyIsInJlcyIsImRpZ2l0cyIsImRpZ2l0czE5IiwiZGlnaXRzUCIsImRpZ2l0czFQIiwib3B0aW9uYWxQbHVzTWludXNQIiwib3B0aW9uYWxNaW51c1AiLCJib3hlZEp1c3QiLCJ4IiwiaXNOb3RoaW5nIiwidmFsdWUiLCJ1bmJveGVkSnVzdCIsInVuYm94ZWROb3RoaW5nIiwiZXhwb25lbnRpYWxQIiwiZWUiLCJvcHRQTSIsImRpZ3MiLCJjb25jYXQiLCJqb2luIiwiak51bWJlclN0cmluZ1AiLCJkb3QiLCJyZWR1Y2UiLCJhY2MiLCJjdXJyIiwiSk51bWJlclAiLCJwYXJzZUZsb2F0IiwiSk51bWJlciIsImFycmF5VmFsdWVQIiwidHJpbW1lZENvbW1hUCIsImVtcHR5QXJyYXlQIiwiSkFycmF5IiwiZnVsbEFycmF5UCIsInZhbHVlcyIsInhzIiwiSkFycmF5UCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQW1DTyxRQUFNQSwwQkFBUyxzQkFBUSxNQUFSLEVBQWdCQyxJQUFoQixDQUFxQjtBQUFBLGVBQUssZ0JBQU9DLEtBQVAsQ0FBYSxJQUFiLENBQUw7QUFBQSxLQUFyQixFQUE4Q0MsUUFBOUMsQ0FBdUQsTUFBdkQsQ0FB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LFFBQU0rQixjQUFjLHNCQUFRLElBQVIsRUFBY3hELElBQWQsQ0FBbUI7QUFBQSxlQUFLLGdCQUFPeUQsTUFBUCxFQUFMO0FBQUEsS0FBbkIsQ0FBcEI7QUFDQSxRQUFNQyxhQUFhLG9CQUFNLEdBQU4sRUFDZDNDLFlBRGMsQ0FDRCxzQkFDVnVDLFdBRFUsRUFFVixtQkFBS0MsY0FBY3hDLFlBQWQsQ0FBMkJ1QyxXQUEzQixDQUFMLENBRlUsRUFHWnRELElBSFksQ0FHUDtBQUFBO0FBQUEsWUFBRXFDLEtBQUY7QUFBQSxZQUFTc0IsTUFBVDs7QUFBQSxlQUFxQixDQUFDdEIsS0FBRCxFQUFRTyxNQUFSLENBQWVlLE1BQWYsQ0FBckI7QUFBQSxLQUhPLENBREMsRUFLZGxDLGFBTGMsQ0FLQSxvQkFBTSxHQUFOLENBTEEsRUFNZHpCLElBTmMsQ0FNVDtBQUFBO0FBQUEsWUFBRTRELEVBQUY7O0FBQUEsZUFBVSxnQkFBT0gsTUFBUCxDQUFjRyxFQUFkLENBQVY7QUFBQSxLQU5TLENBQW5COztBQVFPLFFBQU1DLDRCQUFVTCxZQUNsQmpELE1BRGtCLENBQ1htRCxVQURXLEVBRWxCeEQsUUFGa0IsQ0FFVCxtQkFGUyxDQUFoQiIsImZpbGUiOiJqc29uX3BhcnNlcnMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICAgIEpWYWx1ZSxcbiAgICBUdXBsZSxcbn0gZnJvbSAnY2xhc3Nlcyc7XG5pbXBvcnQge1xuICAgIHBhcnNlcixcbiAgICBjaGFyUGFyc2VyLFxuICAgIGRpZ2l0UGFyc2VyLFxuICAgIHByZWRpY2F0ZUJhc2VkUGFyc2VyLFxuICAgIHBjaGFyLFxuICAgIHBkaWdpdCxcbiAgICBhbmRUaGVuLFxuICAgIG9yRWxzZSxcbiAgICBjaG9pY2UsXG4gICAgYW55T2YsXG4gICAgZm1hcCxcbiAgICByZXR1cm5QLFxuICAgIGFwcGx5UCxcbiAgICBsaWZ0MixcbiAgICBzZXF1ZW5jZVAsXG4gICAgc2VxdWVuY2VQMixcbiAgICBwc3RyaW5nLFxuICAgIHplcm9Pck1vcmUsXG4gICAgbWFueSxcbiAgICBtYW55MSxcbiAgICBtYW55Q2hhcnMsXG4gICAgbWFueUNoYXJzMSxcbiAgICBvcHQsXG4gICAgb3B0Qm9vayxcbiAgICBkaXNjYXJkRmlyc3QsXG4gICAgZGlzY2FyZFNlY29uZCxcbiAgICBiZXR3ZWVuLFxuICAgIGJldHdlZW5QYXJlbnMsXG59IGZyb20gJ3BhcnNlcnMnO1xuXG5leHBvcnQgY29uc3QgSk51bGxQID0gcHN0cmluZygnbnVsbCcpLmZtYXAoXyA9PiBKVmFsdWUuSk51bGwobnVsbCkpLnNldExhYmVsKCdudWxsJyk7XG5cbmNvbnN0IEpUcnVlUCA9IHBzdHJpbmcoJ3RydWUnKS5mbWFwKF8gPT4gSlZhbHVlLkpCb29sKHRydWUpKTtcbmNvbnN0IEpGYWxzZVAgPSBwc3RyaW5nKCdmYWxzZScpLmZtYXAoXyA9PiBKVmFsdWUuSkJvb2woZmFsc2UpKTtcbmV4cG9ydCBjb25zdCBKQm9vbFAgPSBKVHJ1ZVAub3JFbHNlKEpGYWxzZVApLnNldExhYmVsKCdib29sJyk7XG5cbmV4cG9ydCBjb25zdCBqVW5lc2NhcGVkQ2hhclAgPSBwYXJzZXIocHJlZGljYXRlQmFzZWRQYXJzZXIoY2hhciA9PiAoY2hhciAhPT0gJ1xcXFwnICYmIGNoYXIgIT09ICdcIicpLCAnanVuZXNjYXBlZENoYXJQJykpO1xuY29uc3QgZXNjYXBlZEpTT05DaGFycyA9IFtcbiAgICAnXFxcIicsXG4gICAgJ1xcXFwnLFxuICAgICdcXC8nLFxuICAgICdcXGInLFxuICAgICdcXGYnLFxuLy8gICAgJ1xcbicsIC8vIG5ld2xpbmVzIHdpbGwgYmUgcmVtb3ZlZCBkdXJpbmcgdGV4dCAtPiBwb3NpdGlvbiB0cmFuc2Zvcm1hdGlvblxuICAgICdcXHInLFxuICAgICdcXHQnLFxuXTtcbmV4cG9ydCBjb25zdCBqRXNjYXBlZENoYXJQID0gY2hvaWNlKGVzY2FwZWRKU09OQ2hhcnMubWFwKHBjaGFyKSkuc2V0TGFiZWwoJ2VzY2FwZWQgY2hhcicpO1xuXG5jb25zdCBoZXhEaWdpdHNQID0gY2hvaWNlKFtcbiAgICAnMCcsICcxJywgJzInLCAnMycsICc0JywgJzUnLCAnNicsICc3JywgJzgnLCAnOScsICdhJywgJ2InLCAnYycsICdkJywgJ2UnLCAnZicsICdBJywgJ0InLCAnQycsICdEJywgJ0UnLCAnRicsXG5dLm1hcChwY2hhcikpO1xuXG5leHBvcnQgY29uc3QgalVuaWNvZGVDaGFyUCA9IHBjaGFyKCdcXFxcJylcbiAgICAuZGlzY2FyZEZpcnN0KHBjaGFyKCd1JykpXG4gICAgLmRpc2NhcmRGaXJzdChoZXhEaWdpdHNQKSAvL3JldHVybnMgYVxuICAgIC5hbmRUaGVuKGhleERpZ2l0c1ApIC8vcmV0dXJucyBiXG4gICAgLmFuZFRoZW4oaGV4RGlnaXRzUCkgLy9yZXR1cm5zIGNcbiAgICAuYW5kVGhlbihoZXhEaWdpdHNQKSAvL3JldHVybnMgZFxuICAgIC5mbWFwKChbW1thLCBiXSwgY10sIGRdKSA9PiBwYXJzZUludCgnJyArIGEgKyBiICsgYyArIGQsIDE2KSlcbiAgICAuc2V0TGFiZWwoJ3VuaWNvZGUgY2hhcicpO1xuXG5jb25zdCBqQ2hhclAgPSBqVW5lc2NhcGVkQ2hhclAvKi5vckVsc2UoakVzY2FwZWRDaGFyUCkqLy5vckVsc2UoalVuaWNvZGVDaGFyUCk7XG5jb25zdCBkb3VibGVxdW90ZSA9IHBjaGFyKCdcIicpLnNldExhYmVsKCdkb3VibGVxdW90ZScpO1xuXG5leHBvcnQgY29uc3QgSlN0cmluZ1AgPSBkb3VibGVxdW90ZVxuICAgIC5kaXNjYXJkRmlyc3QobWFueUNoYXJzKGpDaGFyUCkpXG4gICAgLmRpc2NhcmRTZWNvbmQoZG91YmxlcXVvdGUpXG4gICAgLmZtYXAocmVzID0+IEpWYWx1ZS5KU3RyaW5nKHJlcykpXG4gICAgLnNldExhYmVsKCdKU09OIHN0cmluZyBwYXJzZXInKTtcblxuY29uc3QgZGlnaXRzID0gWycwJywgJzEnLCAnMicsICczJywgJzQnLCAnNScsICc2JywgJzcnLCAnOCcsICc5J107XG5jb25zdCBkaWdpdHMxOSA9IFsnMScsICcyJywgJzMnLCAnNCcsICc1JywgJzYnLCAnNycsICc4JywgJzknXTtcblxuLy8gaW1wcm92YWJsZSBhbGwgb3ZlciB0aGUgcGxhY2UgYnk6XG4vLyAtIHVzaW5nIG1hbnlDaGFycyB0byBwcm9jZXNzIGxpc3RzIGludG8gc3RyaW5ncyByaWdodCBhd2F5XG4vLyAtIGRpc2NhcmRpbmcgZS9FJ3MgYW5kIGRvdHMsIGFuZCBjb21wb3NpbmcgdGhlIGZpbmFsIG51bWJlciBmcm9tIE5VTUVSSUNBTCBwaWVjZXNcbmNvbnN0IGRpZ2l0c1AgPSBtYW55KGFueU9mKGRpZ2l0cykpO1xuY29uc3QgZGlnaXRzMVAgPSBtYW55MShhbnlPZihkaWdpdHMpKTtcblxuY29uc3Qgb3B0aW9uYWxQbHVzTWludXNQID0gb3B0KHBjaGFyKCctJykub3JFbHNlKHBjaGFyKCcrJykpKTtcbmNvbnN0IG9wdGlvbmFsTWludXNQID0gb3B0KHBjaGFyKCctJykpO1xuXG5jb25zdCBib3hlZEp1c3QgPSB4ID0+IHguaXNOb3RoaW5nID8gWycnXSA6IFt4LnZhbHVlXTtcbmNvbnN0IHVuYm94ZWRKdXN0ID0geCA9PiB4LmlzTm90aGluZyA/IFsnJ10gOiB4LnZhbHVlO1xuY29uc3QgdW5ib3hlZE5vdGhpbmcgPSB4ID0+IHguaXNOb3RoaW5nID8gJycgOiB4LnZhbHVlO1xuXG5jb25zdCBleHBvbmVudGlhbFAgPSBjaG9pY2UoW3BjaGFyKCdlJyksIHBjaGFyKCdFJyldKVxuICAgIC5hbmRUaGVuKG9wdGlvbmFsUGx1c01pbnVzUCkvLy5mbWFwKGJveGVkSnVzdClcbiAgICAuYW5kVGhlbihkaWdpdHMxUClcbiAgICAuZm1hcCgoW1tlZSwgb3B0UE1dLCBkaWdzXSkgPT4gW2VlLCAodW5ib3hlZE5vdGhpbmcob3B0UE0pKV0uY29uY2F0KGRpZ3MpLmpvaW4oJycpKTtcblxuLy8gcmV0dXJucyBTdWNjZXNzKHN0cmluZylcbmV4cG9ydCBjb25zdCBqTnVtYmVyU3RyaW5nUCA9IHNlcXVlbmNlUChbXG4gICAgb3B0aW9uYWxNaW51c1AuZm1hcChib3hlZEp1c3QpLFxuICAgIGRpZ2l0czFQLFxuICAgIG9wdChwY2hhcignLicpLmFuZFRoZW4oZGlnaXRzMVApLmZtYXAoKFtkb3QsIGRpZ3NdKSA9PiBbZG90XS5jb25jYXQoZGlncykpKVxuICAgICAgICAuZm1hcCh1bmJveGVkSnVzdCksXG4gICAgb3B0KGV4cG9uZW50aWFsUCkuZm1hcChib3hlZEp1c3QpXG5dKS5mbWFwKHJlcyA9PiByZXMucmVkdWNlKChhY2MsIGN1cnIpID0+IGFjYy5jb25jYXQoY3VyciksIFtdKS5qb2luKCcnKSk7XG5cbi8vIHJldHVybnMgU3VjY2VzcyhwYXJzZUZsb2F0KHN0cmluZykpXG5leHBvcnQgY29uc3QgSk51bWJlclAgPSBqTnVtYmVyU3RyaW5nUFxuICAgIC5mbWFwKHBhcnNlRmxvYXQpXG4gICAgLmZtYXAoSlZhbHVlLkpOdW1iZXIpXG4gICAgLnNldExhYmVsKCdKU09OIG51bWJlciBwYXJzZXInKTtcblxuY29uc3QgYXJyYXlWYWx1ZVAgPSBKTnVsbFBcbiAgICAub3JFbHNlKEpCb29sUClcbiAgICAub3JFbHNlKEpTdHJpbmdQKVxuICAgIC5vckVsc2UoSk51bWJlclApO1xuXG5jb25zdCB0cmltbWVkQ29tbWFQID0gb3B0KG1hbnlDaGFycyhwY2hhcignICcpKSlcbiAgICAuZGlzY2FyZEZpcnN0KHBjaGFyKCcsJykpXG4gICAgLmRpc2NhcmRTZWNvbmQob3B0KG1hbnlDaGFycyhwY2hhcignICcpKSkpO1xuXG5jb25zdCBlbXB0eUFycmF5UCA9IHBzdHJpbmcoJ1tdJykuZm1hcChfID0+IEpWYWx1ZS5KQXJyYXkoKSk7XG5jb25zdCBmdWxsQXJyYXlQID0gcGNoYXIoJ1snKVxuICAgIC5kaXNjYXJkRmlyc3QoYW5kVGhlbihcbiAgICAgICAgYXJyYXlWYWx1ZVAsXG4gICAgICAgIG1hbnkodHJpbW1lZENvbW1hUC5kaXNjYXJkRmlyc3QoYXJyYXlWYWx1ZVApKVxuICAgICkuZm1hcCgoW3ZhbHVlLCB2YWx1ZXNdKSA9PiBbdmFsdWVdLmNvbmNhdCh2YWx1ZXMpKSlcbiAgICAuZGlzY2FyZFNlY29uZChwY2hhcignXScpKVxuICAgIC5mbWFwKChbeHNdKSA9PiBKVmFsdWUuSkFycmF5KHhzKSk7XG5cbmV4cG9ydCBjb25zdCBKQXJyYXlQID0gZW1wdHlBcnJheVBcbiAgICAub3JFbHNlKGZ1bGxBcnJheVApXG4gICAgLnNldExhYmVsKCdKU09OIGFycmF5IHBhcnNlcicpO1xuIl19