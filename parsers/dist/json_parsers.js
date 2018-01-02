define(['exports', 'classes', 'parsers'], function (exports, _classes, _parsers) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.jNumberP = exports.jStringP = exports.jUnicodeCharP = exports.jEscapedCharP = exports.jUnescapedCharP = exports.JBoolP = exports.JNullP = undefined;

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

    var jStringP = exports.jStringP = doublequote.discardFirst((0, _parsers.manyChars)(jCharP)).discardSecond(doublequote).fmap(function (res) {
        return _classes.JValue.JString(res);
    }).setLabel('JSON string parser');

    var digits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

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

    var jNumberP = exports.jNumberP = (0, _parsers.sequenceP)([optionalMinusP.fmap(boxedJust), digits1P, (0, _parsers.opt)((0, _parsers.pchar)('.').andThen(digits1P).fmap(function (_ref5) {
        var _ref6 = _slicedToArray(_ref5, 2),
            dot = _ref6[0],
            digs = _ref6[1];

        return [dot].concat(digs);
    })).fmap(unboxedJust), (0, _parsers.opt)(exponentialP).fmap(boxedJust)]).fmap(function (res) {
        return res.reduce(function (acc, curr) {
            return acc.concat(curr);
        }, []).join('');
    }).setLabel('JSON number parser');
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2pzL2pzb25fcGFyc2Vycy5qcyJdLCJuYW1lcyI6WyJKTnVsbFAiLCJmbWFwIiwiSk51bGwiLCJzZXRMYWJlbCIsIkpUcnVlUCIsIkpCb29sIiwiSkZhbHNlUCIsIkpCb29sUCIsIm9yRWxzZSIsImpVbmVzY2FwZWRDaGFyUCIsImNoYXIiLCJlc2NhcGVkSlNPTkNoYXJzIiwiakVzY2FwZWRDaGFyUCIsIm1hcCIsImhleERpZ2l0c1AiLCJqVW5pY29kZUNoYXJQIiwiZGlzY2FyZEZpcnN0IiwiYW5kVGhlbiIsImEiLCJiIiwiYyIsImQiLCJwYXJzZUludCIsImpDaGFyUCIsImRvdWJsZXF1b3RlIiwialN0cmluZ1AiLCJkaXNjYXJkU2Vjb25kIiwiSlN0cmluZyIsInJlcyIsImRpZ2l0cyIsImRpZ2l0c1AiLCJkaWdpdHMxUCIsIm9wdGlvbmFsUGx1c01pbnVzUCIsIm9wdGlvbmFsTWludXNQIiwiYm94ZWRKdXN0IiwieCIsImlzTm90aGluZyIsInZhbHVlIiwidW5ib3hlZEp1c3QiLCJ1bmJveGVkTm90aGluZyIsImV4cG9uZW50aWFsUCIsImVlIiwib3B0UE0iLCJkaWdzIiwiY29uY2F0Iiwiam9pbiIsImpOdW1iZXJQIiwiZG90IiwicmVkdWNlIiwiYWNjIiwiY3VyciJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQW1DTyxRQUFNQSwwQkFBUyxzQkFBUSxNQUFSLEVBQWdCQyxJQUFoQixDQUFxQjtBQUFBLGVBQUssZ0JBQU9DLEtBQVAsQ0FBYSxJQUFiLENBQUw7QUFBQSxLQUFyQixFQUE4Q0MsUUFBOUMsQ0FBdUQsTUFBdkQsQ0FBZjs7QUFFUCxRQUFNQyxTQUFTLHNCQUFRLE1BQVIsRUFBZ0JILElBQWhCLENBQXFCO0FBQUEsZUFBSyxnQkFBT0ksS0FBUCxDQUFhLElBQWIsQ0FBTDtBQUFBLEtBQXJCLENBQWY7QUFDQSxRQUFNQyxVQUFVLHNCQUFRLE9BQVIsRUFBaUJMLElBQWpC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cUMsV0FEVixDQUg4QixFQUs5QixrQkFBSUUsWUFBSixFQUFrQnZDLElBQWxCLENBQXVCaUMsU0FBdkIsQ0FMOEIsQ0FBVixFQU1yQmpDLElBTnFCLENBTWhCO0FBQUEsZUFBTzJCLElBQUlvQixNQUFKLENBQVcsVUFBQ0MsR0FBRCxFQUFNQyxJQUFOO0FBQUEsbUJBQWVELElBQUlMLE1BQUosQ0FBV00sSUFBWCxDQUFmO0FBQUEsU0FBWCxFQUE0QyxFQUE1QyxFQUFnREwsSUFBaEQsQ0FBcUQsRUFBckQsQ0FBUDtBQUFBLEtBTmdCLEVBT25CMUMsUUFQbUIsQ0FPVixvQkFQVSxDQUFqQiIsImZpbGUiOiJqc29uX3BhcnNlcnMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICAgIEpWYWx1ZSxcbiAgICBUdXBsZSxcbn0gZnJvbSAnY2xhc3Nlcyc7XG5pbXBvcnQge1xuICAgIHBhcnNlcixcbiAgICBjaGFyUGFyc2VyLFxuICAgIGRpZ2l0UGFyc2VyLFxuICAgIHByZWRpY2F0ZUJhc2VkUGFyc2VyLFxuICAgIHBjaGFyLFxuICAgIHBkaWdpdCxcbiAgICBhbmRUaGVuLFxuICAgIG9yRWxzZSxcbiAgICBjaG9pY2UsXG4gICAgYW55T2YsXG4gICAgZm1hcCxcbiAgICByZXR1cm5QLFxuICAgIGFwcGx5UCxcbiAgICBsaWZ0MixcbiAgICBzZXF1ZW5jZVAsXG4gICAgc2VxdWVuY2VQMixcbiAgICBwc3RyaW5nLFxuICAgIHplcm9Pck1vcmUsXG4gICAgbWFueSxcbiAgICBtYW55MSxcbiAgICBtYW55Q2hhcnMsXG4gICAgbWFueUNoYXJzMSxcbiAgICBvcHQsXG4gICAgb3B0Qm9vayxcbiAgICBkaXNjYXJkRmlyc3QsXG4gICAgZGlzY2FyZFNlY29uZCxcbiAgICBiZXR3ZWVuLFxuICAgIGJldHdlZW5QYXJlbnMsXG59IGZyb20gJ3BhcnNlcnMnO1xuXG5leHBvcnQgY29uc3QgSk51bGxQID0gcHN0cmluZygnbnVsbCcpLmZtYXAoXyA9PiBKVmFsdWUuSk51bGwobnVsbCkpLnNldExhYmVsKCdudWxsJyk7XG5cbmNvbnN0IEpUcnVlUCA9IHBzdHJpbmcoJ3RydWUnKS5mbWFwKF8gPT4gSlZhbHVlLkpCb29sKHRydWUpKTtcbmNvbnN0IEpGYWxzZVAgPSBwc3RyaW5nKCdmYWxzZScpLmZtYXAoXyA9PiBKVmFsdWUuSkJvb2woZmFsc2UpKTtcbmV4cG9ydCBjb25zdCBKQm9vbFAgPSBKVHJ1ZVAub3JFbHNlKEpGYWxzZVApLnNldExhYmVsKCdib29sJyk7XG5cbmV4cG9ydCBjb25zdCBqVW5lc2NhcGVkQ2hhclAgPSBwYXJzZXIocHJlZGljYXRlQmFzZWRQYXJzZXIoY2hhciA9PiAoY2hhciAhPT0gJ1xcXFwnICYmIGNoYXIgIT09ICdcIicpLCAnanVuZXNjYXBlZENoYXJQJykpO1xuY29uc3QgZXNjYXBlZEpTT05DaGFycyA9IFtcbiAgICAnXFxcIicsXG4gICAgJ1xcXFwnLFxuICAgICdcXC8nLFxuICAgICdcXGInLFxuICAgICdcXGYnLFxuLy8gICAgJ1xcbicsIC8vIG5ld2xpbmVzIHdpbGwgYmUgcmVtb3ZlZCBkdXJpbmcgdGV4dCAtPiBwb3NpdGlvbiB0cmFuc2Zvcm1hdGlvblxuICAgICdcXHInLFxuICAgICdcXHQnLFxuXTtcbmV4cG9ydCBjb25zdCBqRXNjYXBlZENoYXJQID0gY2hvaWNlKGVzY2FwZWRKU09OQ2hhcnMubWFwKHBjaGFyKSkuc2V0TGFiZWwoJ2VzY2FwZWQgY2hhcicpO1xuXG5jb25zdCBoZXhEaWdpdHNQID0gY2hvaWNlKFtcbiAgICAnMCcsICcxJywgJzInLCAnMycsICc0JywgJzUnLCAnNicsICc3JywgJzgnLCAnOScsICdhJywgJ2InLCAnYycsICdkJywgJ2UnLCAnZicsICdBJywgJ0InLCAnQycsICdEJywgJ0UnLCAnRicsXG5dLm1hcChwY2hhcikpO1xuXG5leHBvcnQgY29uc3QgalVuaWNvZGVDaGFyUCA9IHBjaGFyKCdcXFxcJylcbiAgICAuZGlzY2FyZEZpcnN0KHBjaGFyKCd1JykpXG4gICAgLmRpc2NhcmRGaXJzdChoZXhEaWdpdHNQKSAvL3JldHVybnMgYVxuICAgIC5hbmRUaGVuKGhleERpZ2l0c1ApIC8vcmV0dXJucyBiXG4gICAgLmFuZFRoZW4oaGV4RGlnaXRzUCkgLy9yZXR1cm5zIGNcbiAgICAuYW5kVGhlbihoZXhEaWdpdHNQKSAvL3JldHVybnMgZFxuICAgIC5mbWFwKChbW1thLCBiXSwgY10sIGRdKSA9PiBwYXJzZUludCgnJyArIGEgKyBiICsgYyArIGQsIDE2KSlcbiAgICAuc2V0TGFiZWwoJ3VuaWNvZGUgY2hhcicpO1xuXG5jb25zdCBqQ2hhclAgPSBqVW5lc2NhcGVkQ2hhclAvKi5vckVsc2UoakVzY2FwZWRDaGFyUCkqLy5vckVsc2UoalVuaWNvZGVDaGFyUCk7XG5jb25zdCBkb3VibGVxdW90ZSA9IHBjaGFyKCdcIicpLnNldExhYmVsKCdkb3VibGVxdW90ZScpO1xuXG5leHBvcnQgY29uc3QgalN0cmluZ1AgPSBkb3VibGVxdW90ZVxuICAgIC5kaXNjYXJkRmlyc3QobWFueUNoYXJzKGpDaGFyUCkpXG4gICAgLmRpc2NhcmRTZWNvbmQoZG91YmxlcXVvdGUpXG4gICAgLmZtYXAocmVzID0+IEpWYWx1ZS5KU3RyaW5nKHJlcykpXG4gICAgLnNldExhYmVsKCdKU09OIHN0cmluZyBwYXJzZXInKTtcblxuY29uc3QgZGlnaXRzID0gWycwJywgJzEnLCAnMicsICczJywgJzQnLCAnNScsICc2JywgJzcnLCAnOCcsICc5J107XG5cbmNvbnN0IGRpZ2l0c1AgPSBtYW55KGFueU9mKGRpZ2l0cykpO1xuY29uc3QgZGlnaXRzMVAgPSBtYW55MShhbnlPZihkaWdpdHMpKTtcblxuY29uc3Qgb3B0aW9uYWxQbHVzTWludXNQID0gb3B0KHBjaGFyKCctJykub3JFbHNlKHBjaGFyKCcrJykpKTtcbmNvbnN0IG9wdGlvbmFsTWludXNQID0gb3B0KHBjaGFyKCctJykpO1xuXG5jb25zdCBib3hlZEp1c3QgPSB4ID0+IHguaXNOb3RoaW5nID8gWycnXSA6IFt4LnZhbHVlXTtcbmNvbnN0IHVuYm94ZWRKdXN0ID0geCA9PiB4LmlzTm90aGluZyA/IFsnJ10gOiB4LnZhbHVlO1xuY29uc3QgdW5ib3hlZE5vdGhpbmcgPSB4ID0+IHguaXNOb3RoaW5nID8gJycgOiB4LnZhbHVlO1xuXG5jb25zdCBleHBvbmVudGlhbFAgPSBjaG9pY2UoW3BjaGFyKCdlJyksIHBjaGFyKCdFJyldKVxuICAgIC5hbmRUaGVuKG9wdGlvbmFsUGx1c01pbnVzUCkvLy5mbWFwKGJveGVkSnVzdClcbiAgICAuYW5kVGhlbihkaWdpdHMxUClcbiAgICAuZm1hcCgoW1tlZSwgb3B0UE1dLCBkaWdzXSkgPT4gW2VlLCAodW5ib3hlZE5vdGhpbmcob3B0UE0pKV0uY29uY2F0KGRpZ3MpLmpvaW4oJycpKTtcblxuZXhwb3J0IGNvbnN0IGpOdW1iZXJQID0gc2VxdWVuY2VQKFtcbiAgICBvcHRpb25hbE1pbnVzUC5mbWFwKGJveGVkSnVzdCksXG4gICAgZGlnaXRzMVAsXG4gICAgb3B0KHBjaGFyKCcuJykuYW5kVGhlbihkaWdpdHMxUCkuZm1hcCgoW2RvdCwgZGlnc10pID0+IFtkb3RdLmNvbmNhdChkaWdzKSkpXG4gICAgICAgIC5mbWFwKHVuYm94ZWRKdXN0KSxcbiAgICBvcHQoZXhwb25lbnRpYWxQKS5mbWFwKGJveGVkSnVzdClcbl0pLmZtYXAocmVzID0+IHJlcy5yZWR1Y2UoKGFjYywgY3VycikgPT4gYWNjLmNvbmNhdChjdXJyKSwgW10pLmpvaW4oJycpKVxuICAgIC5zZXRMYWJlbCgnSlNPTiBudW1iZXIgcGFyc2VyJyk7XG4iXX0=