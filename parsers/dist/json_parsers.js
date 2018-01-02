define(['exports', 'classes', 'parsers'], function (exports, _classes, _parsers) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.jStringP = exports.jUnicodeCharP = exports.jEscapedCharP = exports.jUnescapedCharP = exports.JBoolP = exports.JNullP = undefined;

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

    var jCharP = jUnescapedCharP.orElse(jEscapedCharP).orElse(jUnicodeCharP);
    var doublequote = (0, _parsers.pchar)('"').setLabel('doublequote');

    var jStringP = exports.jStringP = doublequote.discardFirst((0, _parsers.manyChars)(jUnescapedCharP)).discardSecond(doublequote).fmap(function (res) {
        return _classes.JValue.JString(res);
    }).setLabel('JSON string parser');
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2pzL2pzb25fcGFyc2Vycy5qcyJdLCJuYW1lcyI6WyJKTnVsbFAiLCJmbWFwIiwiSk51bGwiLCJzZXRMYWJlbCIsIkpUcnVlUCIsIkpCb29sIiwiSkZhbHNlUCIsIkpCb29sUCIsIm9yRWxzZSIsImpVbmVzY2FwZWRDaGFyUCIsImNoYXIiLCJlc2NhcGVkSlNPTkNoYXJzIiwiakVzY2FwZWRDaGFyUCIsIm1hcCIsImhleERpZ2l0c1AiLCJqVW5pY29kZUNoYXJQIiwiZGlzY2FyZEZpcnN0IiwiYW5kVGhlbiIsImEiLCJiIiwiYyIsImQiLCJwYXJzZUludCIsImpDaGFyUCIsImRvdWJsZXF1b3RlIiwialN0cmluZ1AiLCJkaXNjYXJkU2Vjb25kIiwiSlN0cmluZyIsInJlcyJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQW1DTyxRQUFNQSwwQkFBUyxzQkFBUSxNQUFSLEVBQWdCQyxJQUFoQixDQUFxQjtBQUFBLGVBQUssZ0JBQU9DLEtBQVAsQ0FBYSxJQUFiLENBQUw7QUFBQSxLQUFyQixFQUE4Q0MsUUFBOUMsQ0FBdUQsTUFBdkQsQ0FBZjs7QUFFUCxRQUFNQyxTQUFTLHNCQUFRLE1BQVIsRUFBZ0JILElBQWhCLENBQXFCO0FBQUEsZUFBSyxnQkFBT0ksS0FBUCxDQUFhLElBQWIsQ0FBTDtBQUFBLEtBQXJCLENBQWY7QUFDQSxRQUFNQyxVQUFVLHNCQUFRLE9BQVIsRUFBaUJMLElBQWpCLENBQXNCO0FBQUEsZUFBSyxnQkFBT0ksS0FBUCxDQUFhLEtBQWIsQ0FBTDtBQUFBLEtBQXRCLENBQWhCO0FBQ08sUUFBTUUsMEJBQVNILE9BQU9JLE1BQVAsQ0FBY0YsT0FBZCxFQUF1QkgsUUFBdkIsQ0FBZ0MsTUFBaEMsQ0FBZjs7QUFFQSxRQUFNTSw0Q0FBa0IscUJBQU8sbUNBQXFCO0FBQUEsZUFBU0MsU0FBUyxJQUFULElBQWlCQSxTQUFTLEdBQW5DO0FBQUEsS0FBckIsRUFBOEQsaUJBQTlELENBQVAsQ0FBeEI7QUFDUCxRQUFNQyxtQkFBbUIsQ0FDckIsSUFEcUIsRUFFckIsSUFGcUIsRUFHckIsSUFIcUIsRUFJckIsSUFKcUIsRUFLckIsSUFMcUI7QUFNekI7QUFDSSxRQVBxQixFQVFyQixJQVJxQixDQUF6QjtBQVVPLFFBQU1DLHdDQUFnQixxQkFBT0QsaUJBQWlCRSxHQUFqQixnQkFBUCxFQUFvQ1YsUUFBcEMsQ0FBNkMsY0FBN0MsQ0FBdEI7O0FBRVAsUUFBTVcsYUFBYSxxQkFBTyxDQUN0QixHQURzQixFQUNqQixHQURpQixFQUNaLEdBRFksRUFDUCxHQURPLEVBQ0YsR0FERSxFQUNHLEdBREgsRUFDUSxHQURSLEVBQ2EsR0FEYixFQUNrQixHQURsQixFQUN1QixHQUR2QixFQUM0QixHQUQ1QixFQUNpQyxHQURqQyxFQUNzQyxHQUR0QyxFQUMyQyxHQUQzQyxFQUNnRCxHQURoRCxFQUNxRCxHQURyRCxFQUMwRCxHQUQxRCxFQUMrRCxHQUQvRCxFQUNvRSxHQURwRSxFQUN5RSxHQUR6RSxFQUM4RSxHQUQ5RSxFQUNtRixHQURuRixFQUV4QkQsR0FGd0IsZ0JBQVAsQ0FBbkI7O0FBSU8sUUFBTUUsd0NBQWdCLG9CQUFNLElBQU4sRUFDeEJDLFlBRHdCLENBQ1gsb0JBQU0sR0FBTixDQURXLEVBRXhCQSxZQUZ3QixDQUVYRixVQUZXLEVBRUM7QUFGRCxLQUd4QkcsT0FId0IsQ0FHaEJILFVBSGdCLEVBR0o7QUFISSxLQUl4QkcsT0FKd0IsQ0FJaEJILFVBSmdCLEVBSUo7QUFKSSxLQUt4QkcsT0FMd0IsQ0FLaEJILFVBTGdCLEVBS0o7QUFMSSxLQU14QmIsSUFOd0IsQ0FNbkI7QUFBQTtBQUFBO0FBQUE7QUFBQSxZQUFJaUIsQ0FBSjtBQUFBLFlBQU9DLENBQVA7QUFBQSxZQUFXQyxDQUFYO0FBQUEsWUFBZUMsQ0FBZjs7QUFBQSxlQUFzQkMsU0FBUyxLQUFLSixDQUFMLEdBQVNDLENBQVQsR0FBYUMsQ0FBYixHQUFpQkMsQ0FBMUIsRUFBNkIsRUFBN0IsQ0FBdEI7QUFBQSxLQU5tQixFQU94QmxCLFFBUHdCLENBT2YsY0FQZSxDQUF0Qjs7QUFTUCxRQUFNb0IsU0FBU2QsZ0JBQWdCRCxNQUFoQixDQUF1QkksYUFBdkIsRUFBc0NKLE1BQXRDLENBQTZDTyxhQUE3QyxDQUFmO0FBQ0EsUUFBTVMsY0FBYyxvQkFBTSxHQUFOLEVBQVdyQixRQUFYLENBQW9CLGFBQXBCLENBQXBCOztBQUVPLFFBQU1zQiw4QkFBV0QsWUFDbkJSLFlBRG1CLENBQ04sd0JBQVVQLGVBQVYsQ0FETSxFQUVuQmlCLGFBRm1CLENBRUxGLFdBRkssRUFHbkJ2QixJQUhtQixDQUdkO0FBQUEsZUFBTyxnQkFBTzBCLE9BQVAsQ0FBZUMsR0FBZixDQUFQO0FBQUEsS0FIYyxFQUluQnpCLFFBSm1CLENBSVYsb0JBSlUsQ0FBakIiLCJmaWxlIjoianNvbl9wYXJzZXJzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgICBKVmFsdWUsXG4gICAgVHVwbGUsXG59IGZyb20gJ2NsYXNzZXMnO1xuaW1wb3J0IHtcbiAgICBwYXJzZXIsXG4gICAgY2hhclBhcnNlcixcbiAgICBkaWdpdFBhcnNlcixcbiAgICBwcmVkaWNhdGVCYXNlZFBhcnNlcixcbiAgICBwY2hhcixcbiAgICBwZGlnaXQsXG4gICAgYW5kVGhlbixcbiAgICBvckVsc2UsXG4gICAgY2hvaWNlLFxuICAgIGFueU9mLFxuICAgIGZtYXAsXG4gICAgcmV0dXJuUCxcbiAgICBhcHBseVAsXG4gICAgbGlmdDIsXG4gICAgc2VxdWVuY2VQLFxuICAgIHNlcXVlbmNlUDIsXG4gICAgcHN0cmluZyxcbiAgICB6ZXJvT3JNb3JlLFxuICAgIG1hbnksXG4gICAgbWFueTEsXG4gICAgbWFueUNoYXJzLFxuICAgIG1hbnlDaGFyczEsXG4gICAgb3B0LFxuICAgIG9wdEJvb2ssXG4gICAgZGlzY2FyZEZpcnN0LFxuICAgIGRpc2NhcmRTZWNvbmQsXG4gICAgYmV0d2VlbixcbiAgICBiZXR3ZWVuUGFyZW5zLFxufSBmcm9tICdwYXJzZXJzJztcblxuZXhwb3J0IGNvbnN0IEpOdWxsUCA9IHBzdHJpbmcoJ251bGwnKS5mbWFwKF8gPT4gSlZhbHVlLkpOdWxsKG51bGwpKS5zZXRMYWJlbCgnbnVsbCcpO1xuXG5jb25zdCBKVHJ1ZVAgPSBwc3RyaW5nKCd0cnVlJykuZm1hcChfID0+IEpWYWx1ZS5KQm9vbCh0cnVlKSk7XG5jb25zdCBKRmFsc2VQID0gcHN0cmluZygnZmFsc2UnKS5mbWFwKF8gPT4gSlZhbHVlLkpCb29sKGZhbHNlKSk7XG5leHBvcnQgY29uc3QgSkJvb2xQID0gSlRydWVQLm9yRWxzZShKRmFsc2VQKS5zZXRMYWJlbCgnYm9vbCcpO1xuXG5leHBvcnQgY29uc3QgalVuZXNjYXBlZENoYXJQID0gcGFyc2VyKHByZWRpY2F0ZUJhc2VkUGFyc2VyKGNoYXIgPT4gKGNoYXIgIT09ICdcXFxcJyAmJiBjaGFyICE9PSAnXCInKSwgJ2p1bmVzY2FwZWRDaGFyUCcpKTtcbmNvbnN0IGVzY2FwZWRKU09OQ2hhcnMgPSBbXG4gICAgJ1xcXCInLFxuICAgICdcXFxcJyxcbiAgICAnXFwvJyxcbiAgICAnXFxiJyxcbiAgICAnXFxmJyxcbi8vICAgICdcXG4nLCAvLyBuZXdsaW5lcyB3aWxsIGJlIHJlbW92ZWQgZHVyaW5nIHRleHQgLT4gcG9zaXRpb24gdHJhbnNmb3JtYXRpb25cbiAgICAnXFxyJyxcbiAgICAnXFx0Jyxcbl07XG5leHBvcnQgY29uc3QgakVzY2FwZWRDaGFyUCA9IGNob2ljZShlc2NhcGVkSlNPTkNoYXJzLm1hcChwY2hhcikpLnNldExhYmVsKCdlc2NhcGVkIGNoYXInKTtcblxuY29uc3QgaGV4RGlnaXRzUCA9IGNob2ljZShbXG4gICAgJzAnLCAnMScsICcyJywgJzMnLCAnNCcsICc1JywgJzYnLCAnNycsICc4JywgJzknLCAnYScsICdiJywgJ2MnLCAnZCcsICdlJywgJ2YnLCAnQScsICdCJywgJ0MnLCAnRCcsICdFJywgJ0YnLFxuXS5tYXAocGNoYXIpKTtcblxuZXhwb3J0IGNvbnN0IGpVbmljb2RlQ2hhclAgPSBwY2hhcignXFxcXCcpXG4gICAgLmRpc2NhcmRGaXJzdChwY2hhcigndScpKVxuICAgIC5kaXNjYXJkRmlyc3QoaGV4RGlnaXRzUCkgLy9yZXR1cm5zIGFcbiAgICAuYW5kVGhlbihoZXhEaWdpdHNQKSAvL3JldHVybnMgYlxuICAgIC5hbmRUaGVuKGhleERpZ2l0c1ApIC8vcmV0dXJucyBjXG4gICAgLmFuZFRoZW4oaGV4RGlnaXRzUCkgLy9yZXR1cm5zIGRcbiAgICAuZm1hcCgoW1tbYSwgYl0sIGNdLCBkXSkgPT4gcGFyc2VJbnQoJycgKyBhICsgYiArIGMgKyBkLCAxNikpXG4gICAgLnNldExhYmVsKCd1bmljb2RlIGNoYXInKTtcblxuY29uc3QgakNoYXJQID0galVuZXNjYXBlZENoYXJQLm9yRWxzZShqRXNjYXBlZENoYXJQKS5vckVsc2UoalVuaWNvZGVDaGFyUCk7XG5jb25zdCBkb3VibGVxdW90ZSA9IHBjaGFyKCdcIicpLnNldExhYmVsKCdkb3VibGVxdW90ZScpO1xuXG5leHBvcnQgY29uc3QgalN0cmluZ1AgPSBkb3VibGVxdW90ZVxuICAgIC5kaXNjYXJkRmlyc3QobWFueUNoYXJzKGpVbmVzY2FwZWRDaGFyUCkpXG4gICAgLmRpc2NhcmRTZWNvbmQoZG91YmxlcXVvdGUpXG4gICAgLmZtYXAocmVzID0+IEpWYWx1ZS5KU3RyaW5nKHJlcykpXG4gICAgLnNldExhYmVsKCdKU09OIHN0cmluZyBwYXJzZXInKTtcblxuIl19