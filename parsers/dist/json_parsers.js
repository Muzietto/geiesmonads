define(['exports', 'classes', 'parsers'], function (exports, _classes, _parsers) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.jUnicodeChar = exports.jEscapedCharP = exports.jUnescapedCharP = exports.JBoolP = exports.JNullP = undefined;

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

    var jUnicodeChar = exports.jUnicodeChar = (0, _parsers.pchar)('\\').discardFirst((0, _parsers.pchar)('u')).discardFirst(hexDigitsP) //returns a
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
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2pzL2pzb25fcGFyc2Vycy5qcyJdLCJuYW1lcyI6WyJKTnVsbFAiLCJmbWFwIiwiSk51bGwiLCJzZXRMYWJlbCIsIkpUcnVlUCIsIkpCb29sIiwiSkZhbHNlUCIsIkpCb29sUCIsIm9yRWxzZSIsImpVbmVzY2FwZWRDaGFyUCIsImNoYXIiLCJlc2NhcGVkSlNPTkNoYXJzIiwiakVzY2FwZWRDaGFyUCIsIm1hcCIsImhleERpZ2l0c1AiLCJqVW5pY29kZUNoYXIiLCJkaXNjYXJkRmlyc3QiLCJhbmRUaGVuIiwiYSIsImIiLCJjIiwiZCIsInBhcnNlSW50Il0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBaUNPLFFBQU1BLDBCQUFTLHNCQUFRLE1BQVIsRUFBZ0JDLElBQWhCLENBQXFCO0FBQUEsZUFBSyxnQkFBT0MsS0FBUCxDQUFhLElBQWIsQ0FBTDtBQUFBLEtBQXJCLEVBQThDQyxRQUE5QyxDQUF1RCxNQUF2RCxDQUFmOztBQUVQLFFBQU1DLFNBQVMsc0JBQVEsTUFBUixFQUFnQkgsSUFBaEIsQ0FBcUI7QUFBQSxlQUFLLGdCQUFPSSxLQUFQLENBQWEsSUFBYixDQUFMO0FBQUEsS0FBckIsQ0FBZjtBQUNBLFFBQU1DLFVBQVUsc0JBQVEsT0FBUixFQUFpQkwsSUFBakIsQ0FBc0I7QUFBQSxlQUFLLGdCQUFPSSxLQUFQLENBQWEsS0FBYixDQUFMO0FBQUEsS0FBdEIsQ0FBaEI7QUFDTyxRQUFNRSwwQkFBU0gsT0FBT0ksTUFBUCxDQUFjRixPQUFkLEVBQXVCSCxRQUF2QixDQUFnQyxNQUFoQyxDQUFmOztBQUVBLFFBQU1NLDRDQUFrQixxQkFBTyxtQ0FBcUI7QUFBQSxlQUFTQyxTQUFTLElBQVQsSUFBaUJBLFNBQVMsR0FBbkM7QUFBQSxLQUFyQixFQUE4RCxpQkFBOUQsQ0FBUCxDQUF4QjtBQUNQLFFBQU1DLG1CQUFtQixDQUNyQixJQURxQixFQUVyQixJQUZxQixFQUdyQixJQUhxQixFQUlyQixJQUpxQixFQUtyQixJQUxxQjtBQU16QjtBQUNJLFFBUHFCLEVBUXJCLElBUnFCLENBQXpCO0FBVU8sUUFBTUMsd0NBQWdCLHFCQUFPRCxpQkFBaUJFLEdBQWpCLGdCQUFQLEVBQW9DVixRQUFwQyxDQUE2QyxjQUE3QyxDQUF0Qjs7QUFFUCxRQUFNVyxhQUFhLHFCQUFPLENBQ3RCLEdBRHNCLEVBQ2pCLEdBRGlCLEVBQ1osR0FEWSxFQUNQLEdBRE8sRUFDRixHQURFLEVBQ0csR0FESCxFQUNRLEdBRFIsRUFDYSxHQURiLEVBQ2tCLEdBRGxCLEVBQ3VCLEdBRHZCLEVBQzRCLEdBRDVCLEVBQ2lDLEdBRGpDLEVBQ3NDLEdBRHRDLEVBQzJDLEdBRDNDLEVBQ2dELEdBRGhELEVBQ3FELEdBRHJELEVBQzBELEdBRDFELEVBQytELEdBRC9ELEVBQ29FLEdBRHBFLEVBQ3lFLEdBRHpFLEVBQzhFLEdBRDlFLEVBQ21GLEdBRG5GLEVBRXhCRCxHQUZ3QixnQkFBUCxDQUFuQjs7QUFJTyxRQUFNRSxzQ0FBZSxvQkFBTSxJQUFOLEVBQ3ZCQyxZQUR1QixDQUNWLG9CQUFNLEdBQU4sQ0FEVSxFQUV2QkEsWUFGdUIsQ0FFVkYsVUFGVSxFQUVFO0FBRkYsS0FHdkJHLE9BSHVCLENBR2ZILFVBSGUsRUFHSDtBQUhHLEtBSXZCRyxPQUp1QixDQUlmSCxVQUplLEVBSUg7QUFKRyxLQUt2QkcsT0FMdUIsQ0FLZkgsVUFMZSxFQUtIO0FBTEcsS0FNdkJiLElBTnVCLENBTWxCO0FBQUE7QUFBQTtBQUFBO0FBQUEsWUFBSWlCLENBQUo7QUFBQSxZQUFPQyxDQUFQO0FBQUEsWUFBV0MsQ0FBWDtBQUFBLFlBQWVDLENBQWY7O0FBQUEsZUFBc0JDLFNBQVMsS0FBS0osQ0FBTCxHQUFTQyxDQUFULEdBQWFDLENBQWIsR0FBaUJDLENBQTFCLEVBQTZCLEVBQTdCLENBQXRCO0FBQUEsS0FOa0IsRUFPdkJsQixRQVB1QixDQU9kLGNBUGMsQ0FBckIiLCJmaWxlIjoianNvbl9wYXJzZXJzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgICBKVmFsdWUsXG4gICAgVHVwbGUsXG59IGZyb20gJ2NsYXNzZXMnO1xuaW1wb3J0IHtcbiAgICBwYXJzZXIsXG4gICAgY2hhclBhcnNlcixcbiAgICBkaWdpdFBhcnNlcixcbiAgICBwcmVkaWNhdGVCYXNlZFBhcnNlcixcbiAgICBwY2hhcixcbiAgICBwZGlnaXQsXG4gICAgYW5kVGhlbixcbiAgICBvckVsc2UsXG4gICAgY2hvaWNlLFxuICAgIGFueU9mLFxuICAgIGZtYXAsXG4gICAgcmV0dXJuUCxcbiAgICBhcHBseVAsXG4gICAgbGlmdDIsXG4gICAgc2VxdWVuY2VQLFxuICAgIHNlcXVlbmNlUDIsXG4gICAgcHN0cmluZyxcbiAgICB6ZXJvT3JNb3JlLFxuICAgIG1hbnksXG4gICAgbWFueTEsXG4gICAgb3B0LFxuICAgIG9wdEJvb2ssXG4gICAgZGlzY2FyZEZpcnN0LFxuICAgIGRpc2NhcmRTZWNvbmQsXG4gICAgYmV0d2VlbixcbiAgICBiZXR3ZWVuUGFyZW5zLFxufSBmcm9tICdwYXJzZXJzJztcblxuZXhwb3J0IGNvbnN0IEpOdWxsUCA9IHBzdHJpbmcoJ251bGwnKS5mbWFwKF8gPT4gSlZhbHVlLkpOdWxsKG51bGwpKS5zZXRMYWJlbCgnbnVsbCcpO1xuXG5jb25zdCBKVHJ1ZVAgPSBwc3RyaW5nKCd0cnVlJykuZm1hcChfID0+IEpWYWx1ZS5KQm9vbCh0cnVlKSk7XG5jb25zdCBKRmFsc2VQID0gcHN0cmluZygnZmFsc2UnKS5mbWFwKF8gPT4gSlZhbHVlLkpCb29sKGZhbHNlKSk7XG5leHBvcnQgY29uc3QgSkJvb2xQID0gSlRydWVQLm9yRWxzZShKRmFsc2VQKS5zZXRMYWJlbCgnYm9vbCcpO1xuXG5leHBvcnQgY29uc3QgalVuZXNjYXBlZENoYXJQID0gcGFyc2VyKHByZWRpY2F0ZUJhc2VkUGFyc2VyKGNoYXIgPT4gKGNoYXIgIT09ICdcXFxcJyAmJiBjaGFyICE9PSAnXCInKSwgJ2p1bmVzY2FwZWRDaGFyUCcpKTtcbmNvbnN0IGVzY2FwZWRKU09OQ2hhcnMgPSBbXG4gICAgJ1xcXCInLFxuICAgICdcXFxcJyxcbiAgICAnXFwvJyxcbiAgICAnXFxiJyxcbiAgICAnXFxmJyxcbi8vICAgICdcXG4nLCAvLyBuZXdsaW5lcyB3aWxsIGJlIHJlbW92ZWQgZHVyaW5nIHRleHQgLT4gcG9zaXRpb24gdHJhbnNmb3JtYXRpb25cbiAgICAnXFxyJyxcbiAgICAnXFx0Jyxcbl07XG5leHBvcnQgY29uc3QgakVzY2FwZWRDaGFyUCA9IGNob2ljZShlc2NhcGVkSlNPTkNoYXJzLm1hcChwY2hhcikpLnNldExhYmVsKCdlc2NhcGVkIGNoYXInKTtcblxuY29uc3QgaGV4RGlnaXRzUCA9IGNob2ljZShbXG4gICAgJzAnLCAnMScsICcyJywgJzMnLCAnNCcsICc1JywgJzYnLCAnNycsICc4JywgJzknLCAnYScsICdiJywgJ2MnLCAnZCcsICdlJywgJ2YnLCAnQScsICdCJywgJ0MnLCAnRCcsICdFJywgJ0YnLFxuXS5tYXAocGNoYXIpKTtcblxuZXhwb3J0IGNvbnN0IGpVbmljb2RlQ2hhciA9IHBjaGFyKCdcXFxcJylcbiAgICAuZGlzY2FyZEZpcnN0KHBjaGFyKCd1JykpXG4gICAgLmRpc2NhcmRGaXJzdChoZXhEaWdpdHNQKSAvL3JldHVybnMgYVxuICAgIC5hbmRUaGVuKGhleERpZ2l0c1ApIC8vcmV0dXJucyBiXG4gICAgLmFuZFRoZW4oaGV4RGlnaXRzUCkgLy9yZXR1cm5zIGNcbiAgICAuYW5kVGhlbihoZXhEaWdpdHNQKSAvL3JldHVybnMgZFxuICAgIC5mbWFwKChbW1thLCBiXSwgY10sIGRdKSA9PiBwYXJzZUludCgnJyArIGEgKyBiICsgYyArIGQsIDE2KSlcbiAgICAuc2V0TGFiZWwoJ3VuaWNvZGUgY2hhcicpO1xuIl19