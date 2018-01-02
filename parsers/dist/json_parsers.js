define(['exports', 'classes', 'parsers'], function (exports, _classes, _parsers) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.JNumberP = exports.jNumberStringP = exports.JStringP = exports.jUnicodeCharP = exports.jEscapedCharP = exports.jUnescapedCharP = exports.JBoolP = exports.JNullP = undefined;

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
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2pzL2pzb25fcGFyc2Vycy5qcyJdLCJuYW1lcyI6WyJKTnVsbFAiLCJmbWFwIiwiSk51bGwiLCJzZXRMYWJlbCIsIkpUcnVlUCIsIkpCb29sIiwiSkZhbHNlUCIsIkpCb29sUCIsIm9yRWxzZSIsImpVbmVzY2FwZWRDaGFyUCIsImNoYXIiLCJlc2NhcGVkSlNPTkNoYXJzIiwiakVzY2FwZWRDaGFyUCIsIm1hcCIsImhleERpZ2l0c1AiLCJqVW5pY29kZUNoYXJQIiwiZGlzY2FyZEZpcnN0IiwiYW5kVGhlbiIsImEiLCJiIiwiYyIsImQiLCJwYXJzZUludCIsImpDaGFyUCIsImRvdWJsZXF1b3RlIiwiSlN0cmluZ1AiLCJkaXNjYXJkU2Vjb25kIiwiSlN0cmluZyIsInJlcyIsImRpZ2l0cyIsImRpZ2l0czE5IiwiZGlnaXRzUCIsImRpZ2l0czFQIiwib3B0aW9uYWxQbHVzTWludXNQIiwib3B0aW9uYWxNaW51c1AiLCJib3hlZEp1c3QiLCJ4IiwiaXNOb3RoaW5nIiwidmFsdWUiLCJ1bmJveGVkSnVzdCIsInVuYm94ZWROb3RoaW5nIiwiZXhwb25lbnRpYWxQIiwiZWUiLCJvcHRQTSIsImRpZ3MiLCJjb25jYXQiLCJqb2luIiwiak51bWJlclN0cmluZ1AiLCJkb3QiLCJyZWR1Y2UiLCJhY2MiLCJjdXJyIiwiSk51bWJlclAiLCJwYXJzZUZsb2F0IiwiSk51bWJlciJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQW1DTyxRQUFNQSwwQkFBUyxzQkFBUSxNQUFSLEVBQWdCQyxJQUFoQixDQUFxQjtBQUFBLGVBQUssZ0JBQU9DLEtBQVAsQ0FBYSxJQUFiLENBQUw7QUFBQSxLQUFyQixFQUE4Q0MsUUFBOUMsQ0FBdUQsTUFBdkQsQ0FBZjs7QUFFUCxRQUFNQyxTQUFTLHNCQUFRLE1BQVIsRUFBZ0JILElBQWhCLENBQXFCO0FBQUEsZUFBSyxnQkFBT0ksS0FBUCxDQUFhLElBQWIsQ0FBTDtBQUFB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cENILFFBRm9DLEVBR3BDLGtCQUFJLG9CQUFNLEdBQU4sRUFBV2YsT0FBWCxDQUFtQmUsUUFBbkIsRUFBNkIvQixJQUE3QixDQUFrQztBQUFBO0FBQUEsWUFBRStDLEdBQUY7QUFBQSxZQUFPSixJQUFQOztBQUFBLGVBQWlCLENBQUNJLEdBQUQsRUFBTUgsTUFBTixDQUFhRCxJQUFiLENBQWpCO0FBQUEsS0FBbEMsQ0FBSixFQUNLM0MsSUFETCxDQUNVc0MsV0FEVixDQUhvQyxFQUtwQyxrQkFBSUUsWUFBSixFQUFrQnhDLElBQWxCLENBQXVCa0MsU0FBdkIsQ0FMb0MsQ0FBVixFQU0zQmxDLElBTjJCLENBTXRCO0FBQUEsZUFBTzJCLElBQUlxQixNQUFKLENBQVcsVUFBQ0MsR0FBRCxFQUFNQyxJQUFOO0FBQUEsbUJBQWVELElBQUlMLE1BQUosQ0FBV00sSUFBWCxDQUFmO0FBQUEsU0FBWCxFQUE0QyxFQUE1QyxFQUFnREwsSUFBaEQsQ0FBcUQsRUFBckQsQ0FBUDtBQUFBLEtBTnNCLENBQXZCOztBQVFQO0FBQ08sUUFBTU0sOEJBQVdMLGVBQ25COUMsSUFEbUIsQ0FDZG9ELFVBRGMsRUFFbkJwRCxJQUZtQixDQUVkLGdCQUFPcUQsT0FGTyxFQUduQm5ELFFBSG1CLENBR1Ysb0JBSFUsQ0FBakIiLCJmaWxlIjoianNvbl9wYXJzZXJzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgICBKVmFsdWUsXG4gICAgVHVwbGUsXG59IGZyb20gJ2NsYXNzZXMnO1xuaW1wb3J0IHtcbiAgICBwYXJzZXIsXG4gICAgY2hhclBhcnNlcixcbiAgICBkaWdpdFBhcnNlcixcbiAgICBwcmVkaWNhdGVCYXNlZFBhcnNlcixcbiAgICBwY2hhcixcbiAgICBwZGlnaXQsXG4gICAgYW5kVGhlbixcbiAgICBvckVsc2UsXG4gICAgY2hvaWNlLFxuICAgIGFueU9mLFxuICAgIGZtYXAsXG4gICAgcmV0dXJuUCxcbiAgICBhcHBseVAsXG4gICAgbGlmdDIsXG4gICAgc2VxdWVuY2VQLFxuICAgIHNlcXVlbmNlUDIsXG4gICAgcHN0cmluZyxcbiAgICB6ZXJvT3JNb3JlLFxuICAgIG1hbnksXG4gICAgbWFueTEsXG4gICAgbWFueUNoYXJzLFxuICAgIG1hbnlDaGFyczEsXG4gICAgb3B0LFxuICAgIG9wdEJvb2ssXG4gICAgZGlzY2FyZEZpcnN0LFxuICAgIGRpc2NhcmRTZWNvbmQsXG4gICAgYmV0d2VlbixcbiAgICBiZXR3ZWVuUGFyZW5zLFxufSBmcm9tICdwYXJzZXJzJztcblxuZXhwb3J0IGNvbnN0IEpOdWxsUCA9IHBzdHJpbmcoJ251bGwnKS5mbWFwKF8gPT4gSlZhbHVlLkpOdWxsKG51bGwpKS5zZXRMYWJlbCgnbnVsbCcpO1xuXG5jb25zdCBKVHJ1ZVAgPSBwc3RyaW5nKCd0cnVlJykuZm1hcChfID0+IEpWYWx1ZS5KQm9vbCh0cnVlKSk7XG5jb25zdCBKRmFsc2VQID0gcHN0cmluZygnZmFsc2UnKS5mbWFwKF8gPT4gSlZhbHVlLkpCb29sKGZhbHNlKSk7XG5leHBvcnQgY29uc3QgSkJvb2xQID0gSlRydWVQLm9yRWxzZShKRmFsc2VQKS5zZXRMYWJlbCgnYm9vbCcpO1xuXG5leHBvcnQgY29uc3QgalVuZXNjYXBlZENoYXJQID0gcGFyc2VyKHByZWRpY2F0ZUJhc2VkUGFyc2VyKGNoYXIgPT4gKGNoYXIgIT09ICdcXFxcJyAmJiBjaGFyICE9PSAnXCInKSwgJ2p1bmVzY2FwZWRDaGFyUCcpKTtcbmNvbnN0IGVzY2FwZWRKU09OQ2hhcnMgPSBbXG4gICAgJ1xcXCInLFxuICAgICdcXFxcJyxcbiAgICAnXFwvJyxcbiAgICAnXFxiJyxcbiAgICAnXFxmJyxcbi8vICAgICdcXG4nLCAvLyBuZXdsaW5lcyB3aWxsIGJlIHJlbW92ZWQgZHVyaW5nIHRleHQgLT4gcG9zaXRpb24gdHJhbnNmb3JtYXRpb25cbiAgICAnXFxyJyxcbiAgICAnXFx0Jyxcbl07XG5leHBvcnQgY29uc3QgakVzY2FwZWRDaGFyUCA9IGNob2ljZShlc2NhcGVkSlNPTkNoYXJzLm1hcChwY2hhcikpLnNldExhYmVsKCdlc2NhcGVkIGNoYXInKTtcblxuY29uc3QgaGV4RGlnaXRzUCA9IGNob2ljZShbXG4gICAgJzAnLCAnMScsICcyJywgJzMnLCAnNCcsICc1JywgJzYnLCAnNycsICc4JywgJzknLCAnYScsICdiJywgJ2MnLCAnZCcsICdlJywgJ2YnLCAnQScsICdCJywgJ0MnLCAnRCcsICdFJywgJ0YnLFxuXS5tYXAocGNoYXIpKTtcblxuZXhwb3J0IGNvbnN0IGpVbmljb2RlQ2hhclAgPSBwY2hhcignXFxcXCcpXG4gICAgLmRpc2NhcmRGaXJzdChwY2hhcigndScpKVxuICAgIC5kaXNjYXJkRmlyc3QoaGV4RGlnaXRzUCkgLy9yZXR1cm5zIGFcbiAgICAuYW5kVGhlbihoZXhEaWdpdHNQKSAvL3JldHVybnMgYlxuICAgIC5hbmRUaGVuKGhleERpZ2l0c1ApIC8vcmV0dXJucyBjXG4gICAgLmFuZFRoZW4oaGV4RGlnaXRzUCkgLy9yZXR1cm5zIGRcbiAgICAuZm1hcCgoW1tbYSwgYl0sIGNdLCBkXSkgPT4gcGFyc2VJbnQoJycgKyBhICsgYiArIGMgKyBkLCAxNikpXG4gICAgLnNldExhYmVsKCd1bmljb2RlIGNoYXInKTtcblxuY29uc3QgakNoYXJQID0galVuZXNjYXBlZENoYXJQLyoub3JFbHNlKGpFc2NhcGVkQ2hhclApKi8ub3JFbHNlKGpVbmljb2RlQ2hhclApO1xuY29uc3QgZG91YmxlcXVvdGUgPSBwY2hhcignXCInKS5zZXRMYWJlbCgnZG91YmxlcXVvdGUnKTtcblxuZXhwb3J0IGNvbnN0IEpTdHJpbmdQID0gZG91YmxlcXVvdGVcbiAgICAuZGlzY2FyZEZpcnN0KG1hbnlDaGFycyhqQ2hhclApKVxuICAgIC5kaXNjYXJkU2Vjb25kKGRvdWJsZXF1b3RlKVxuICAgIC5mbWFwKHJlcyA9PiBKVmFsdWUuSlN0cmluZyhyZXMpKVxuICAgIC5zZXRMYWJlbCgnSlNPTiBzdHJpbmcgcGFyc2VyJyk7XG5cbmNvbnN0IGRpZ2l0cyA9IFsnMCcsICcxJywgJzInLCAnMycsICc0JywgJzUnLCAnNicsICc3JywgJzgnLCAnOSddO1xuY29uc3QgZGlnaXRzMTkgPSBbJzEnLCAnMicsICczJywgJzQnLCAnNScsICc2JywgJzcnLCAnOCcsICc5J107XG5cbi8vIGltcHJvdmFibGUgYWxsIG92ZXIgdGhlIHBsYWNlIGJ5OlxuLy8gLSB1c2luZyBtYW55Q2hhcnMgdG8gcHJvY2VzcyBsaXN0cyBpbnRvIHN0cmluZ3MgcmlnaHQgYXdheVxuLy8gLSBkaXNjYXJkaW5nIGUvRSdzIGFuZCBkb3RzLCBhbmQgY29tcG9zaW5nIHRoZSBmaW5hbCBudW1iZXIgZnJvbSBOVU1FUklDQUwgcGllY2VzXG5jb25zdCBkaWdpdHNQID0gbWFueShhbnlPZihkaWdpdHMpKTtcbmNvbnN0IGRpZ2l0czFQID0gbWFueTEoYW55T2YoZGlnaXRzKSk7XG5cbmNvbnN0IG9wdGlvbmFsUGx1c01pbnVzUCA9IG9wdChwY2hhcignLScpLm9yRWxzZShwY2hhcignKycpKSk7XG5jb25zdCBvcHRpb25hbE1pbnVzUCA9IG9wdChwY2hhcignLScpKTtcblxuY29uc3QgYm94ZWRKdXN0ID0geCA9PiB4LmlzTm90aGluZyA/IFsnJ10gOiBbeC52YWx1ZV07XG5jb25zdCB1bmJveGVkSnVzdCA9IHggPT4geC5pc05vdGhpbmcgPyBbJyddIDogeC52YWx1ZTtcbmNvbnN0IHVuYm94ZWROb3RoaW5nID0geCA9PiB4LmlzTm90aGluZyA/ICcnIDogeC52YWx1ZTtcblxuY29uc3QgZXhwb25lbnRpYWxQID0gY2hvaWNlKFtwY2hhcignZScpLCBwY2hhcignRScpXSlcbiAgICAuYW5kVGhlbihvcHRpb25hbFBsdXNNaW51c1ApLy8uZm1hcChib3hlZEp1c3QpXG4gICAgLmFuZFRoZW4oZGlnaXRzMVApXG4gICAgLmZtYXAoKFtbZWUsIG9wdFBNXSwgZGlnc10pID0+IFtlZSwgKHVuYm94ZWROb3RoaW5nKG9wdFBNKSldLmNvbmNhdChkaWdzKS5qb2luKCcnKSk7XG5cbi8vIHJldHVybnMgU3VjY2VzcyhzdHJpbmcpXG5leHBvcnQgY29uc3Qgak51bWJlclN0cmluZ1AgPSBzZXF1ZW5jZVAoW1xuICAgIG9wdGlvbmFsTWludXNQLmZtYXAoYm94ZWRKdXN0KSxcbiAgICBkaWdpdHMxUCxcbiAgICBvcHQocGNoYXIoJy4nKS5hbmRUaGVuKGRpZ2l0czFQKS5mbWFwKChbZG90LCBkaWdzXSkgPT4gW2RvdF0uY29uY2F0KGRpZ3MpKSlcbiAgICAgICAgLmZtYXAodW5ib3hlZEp1c3QpLFxuICAgIG9wdChleHBvbmVudGlhbFApLmZtYXAoYm94ZWRKdXN0KVxuXSkuZm1hcChyZXMgPT4gcmVzLnJlZHVjZSgoYWNjLCBjdXJyKSA9PiBhY2MuY29uY2F0KGN1cnIpLCBbXSkuam9pbignJykpO1xuXG4vLyByZXR1cm5zIFN1Y2Nlc3MocGFyc2VGbG9hdChzdHJpbmcpKVxuZXhwb3J0IGNvbnN0IEpOdW1iZXJQID0gak51bWJlclN0cmluZ1BcbiAgICAuZm1hcChwYXJzZUZsb2F0KVxuICAgIC5mbWFwKEpWYWx1ZS5KTnVtYmVyKVxuICAgIC5zZXRMYWJlbCgnSlNPTiBudW1iZXIgcGFyc2VyJyk7XG4iXX0=