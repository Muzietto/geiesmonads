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

    var _parserForwardedToRef = parserForwardedToRef(),
        _parserForwardedToRef2 = _slicedToArray(_parserForwardedToRef, 2),
        arrayParser = _parserForwardedToRef2[0],
        parserRef = _parserForwardedToRef2[1];

    var trimmedCommaP = (0, _parsers.opt)((0, _parsers.manyChars)((0, _parsers.pchar)(' '))).discardFirst((0, _parsers.pchar)(',')).discardSecond((0, _parsers.opt)((0, _parsers.manyChars)((0, _parsers.pchar)(' '))));

    var emptyArrayP = (0, _parsers.pstring)('[]').fmap(function (_) {
        return _classes.JValue.JArray();
    });
    var fullArrayP = (0, _parsers.pchar)('[').discardFirst((0, _parsers.andThen)(arrayParser, (0, _parsers.many)(trimmedCommaP.discardFirst(arrayParser))).fmap(function (_ref7) {
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

    parserRef = JNullP.orElse(JBoolP).orElse(JStringP).orElse(JNumberP).orElse(JArrayP);

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2pzL2pzb25fcGFyc2Vycy5qcyJdLCJuYW1lcyI6WyJKTnVsbFAiLCJmbWFwIiwiSk51bGwiLCJzZXRMYWJlbCIsIkpUcnVlUCIsIkpCb29sIiwiSkZhbHNlUCIsIkpCb29sUCIsIm9yRWxzZSIsImpVbmVzY2FwZWRDaGFyUCIsImNoYXIiLCJlc2NhcGVkSlNPTkNoYXJzIiwiakVzY2FwZWRDaGFyUCIsIm1hcCIsImhleERpZ2l0c1AiLCJqVW5pY29kZUNoYXJQIiwiZGlzY2FyZEZpcnN0IiwiYW5kVGhlbiIsImEiLCJiIiwiYyIsImQiLCJwYXJzZUludCIsImpDaGFyUCIsImRvdWJsZXF1b3RlIiwiSlN0cmluZ1AiLCJkaXNjYXJkU2Vjb25kIiwiSlN0cmluZyIsInJlcyIsImRpZ2l0cyIsImRpZ2l0czE5IiwiZGlnaXRzUCIsImRpZ2l0czFQIiwib3B0aW9uYWxQbHVzTWludXNQIiwib3B0aW9uYWxNaW51c1AiLCJib3hlZEp1c3QiLCJ4IiwiaXNOb3RoaW5nIiwidmFsdWUiLCJ1bmJveGVkSnVzdCIsInVuYm94ZWROb3RoaW5nIiwiZXhwb25lbnRpYWxQIiwiZWUiLCJvcHRQTSIsImRpZ3MiLCJjb25jYXQiLCJqb2luIiwiak51bWJlclN0cmluZ1AiLCJkb3QiLCJyZWR1Y2UiLCJhY2MiLCJjdXJyIiwiSk51bWJlclAiLCJwYXJzZUZsb2F0IiwiSk51bWJlciIsInBhcnNlckZvcndhcmRlZFRvUmVmIiwiYXJyYXlQYXJzZXIiLCJwYXJzZXJSZWYiLCJ0cmltbWVkQ29tbWFQIiwiZW1wdHlBcnJheVAiLCJKQXJyYXkiLCJmdWxsQXJyYXlQIiwidmFsdWVzIiwieHMiLCJKQXJyYXlQIiwiZHVtbXlQYXJzZXIiLCJGYWlsdXJlIiwiVHJpcGxlIiwicG9zIiwid3JhcHBlclBhcnNlciIsInJ1biIsIlBhaXIiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFzQ08sUUFBTUEsMEJBQVMsc0JB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QUFVYSxHQUFWLENBQWNGLEdBQWQsQ0FBUDtBQUFBLFNBQVAsRUFBa0MsZUFBbEMsQ0FBdEI7O0FBRUEsZUFBTyxlQUFNRyxJQUFOLENBQVdGLGFBQVgsRUFBMEJaLFNBQTFCLENBQVA7QUFDSCIsImZpbGUiOiJqc29uX3BhcnNlcnMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICAgIEpWYWx1ZSxcbiAgICBUdXBsZSxcbn0gZnJvbSAnY2xhc3Nlcyc7XG5pbXBvcnQge1xuICAgIFZhbGlkYXRpb24sXG59IGZyb20gJ3ZhbGlkYXRpb24nO1xuaW1wb3J0IHtcbiAgICBwYXJzZXIsXG4gICAgY2hhclBhcnNlcixcbiAgICBkaWdpdFBhcnNlcixcbiAgICBwcmVkaWNhdGVCYXNlZFBhcnNlcixcbiAgICBwY2hhcixcbiAgICBwZGlnaXQsXG4gICAgYW5kVGhlbixcbiAgICBvckVsc2UsXG4gICAgY2hvaWNlLFxuICAgIGFueU9mLFxuICAgIGZtYXAsXG4gICAgcmV0dXJuUCxcbiAgICBhcHBseVAsXG4gICAgbGlmdDIsXG4gICAgc2VxdWVuY2VQLFxuICAgIHNlcXVlbmNlUDIsXG4gICAgcHN0cmluZyxcbiAgICB6ZXJvT3JNb3JlLFxuICAgIG1hbnksXG4gICAgbWFueTEsXG4gICAgbWFueUNoYXJzLFxuICAgIG1hbnlDaGFyczEsXG4gICAgb3B0LFxuICAgIG9wdEJvb2ssXG4gICAgZGlzY2FyZEZpcnN0LFxuICAgIGRpc2NhcmRTZWNvbmQsXG4gICAgYmV0d2VlbixcbiAgICBiZXR3ZWVuUGFyZW5zLFxufSBmcm9tICdwYXJzZXJzJztcblxuZXhwb3J0IGNvbnN0IEpOdWxsUCA9IHBzdHJpbmcoJ251bGwnKS5mbWFwKF8gPT4gSlZhbHVlLkpOdWxsKG51bGwpKS5zZXRMYWJlbCgnbnVsbCcpO1xuXG5jb25zdCBKVHJ1ZVAgPSBwc3RyaW5nKCd0cnVlJykuZm1hcChfID0+IEpWYWx1ZS5KQm9vbCh0cnVlKSk7XG5jb25zdCBKRmFsc2VQID0gcHN0cmluZygnZmFsc2UnKS5mbWFwKF8gPT4gSlZhbHVlLkpCb29sKGZhbHNlKSk7XG5leHBvcnQgY29uc3QgSkJvb2xQID0gSlRydWVQLm9yRWxzZShKRmFsc2VQKS5zZXRMYWJlbCgnYm9vbCcpO1xuXG5leHBvcnQgY29uc3QgalVuZXNjYXBlZENoYXJQID0gcGFyc2VyKHByZWRpY2F0ZUJhc2VkUGFyc2VyKGNoYXIgPT4gKGNoYXIgIT09ICdcXFxcJyAmJiBjaGFyICE9PSAnXCInKSwgJ2p1bmVzY2FwZWRDaGFyUCcpKTtcbmNvbnN0IGVzY2FwZWRKU09OQ2hhcnMgPSBbXG4gICAgJ1xcXCInLFxuICAgICdcXFxcJyxcbiAgICAnXFwvJyxcbiAgICAnXFxiJyxcbiAgICAnXFxmJyxcbi8vICAgICdcXG4nLCAvLyBuZXdsaW5lcyB3aWxsIGJlIHJlbW92ZWQgZHVyaW5nIHRleHQgLT4gcG9zaXRpb24gdHJhbnNmb3JtYXRpb25cbiAgICAnXFxyJyxcbiAgICAnXFx0Jyxcbl07XG5leHBvcnQgY29uc3QgakVzY2FwZWRDaGFyUCA9IGNob2ljZShlc2NhcGVkSlNPTkNoYXJzLm1hcChwY2hhcikpLnNldExhYmVsKCdlc2NhcGVkIGNoYXInKTtcblxuY29uc3QgaGV4RGlnaXRzUCA9IGNob2ljZShbXG4gICAgJzAnLCAnMScsICcyJywgJzMnLCAnNCcsICc1JywgJzYnLCAnNycsICc4JywgJzknLCAnYScsICdiJywgJ2MnLCAnZCcsICdlJywgJ2YnLCAnQScsICdCJywgJ0MnLCAnRCcsICdFJywgJ0YnLFxuXS5tYXAocGNoYXIpKTtcblxuZXhwb3J0IGNvbnN0IGpVbmljb2RlQ2hhclAgPSBwY2hhcignXFxcXCcpXG4gICAgLmRpc2NhcmRGaXJzdChwY2hhcigndScpKVxuICAgIC5kaXNjYXJkRmlyc3QoaGV4RGlnaXRzUCkgLy9yZXR1cm5zIGFcbiAgICAuYW5kVGhlbihoZXhEaWdpdHNQKSAvL3JldHVybnMgYlxuICAgIC5hbmRUaGVuKGhleERpZ2l0c1ApIC8vcmV0dXJucyBjXG4gICAgLmFuZFRoZW4oaGV4RGlnaXRzUCkgLy9yZXR1cm5zIGRcbiAgICAuZm1hcCgoW1tbYSwgYl0sIGNdLCBkXSkgPT4gcGFyc2VJbnQoJycgKyBhICsgYiArIGMgKyBkLCAxNikpXG4gICAgLnNldExhYmVsKCd1bmljb2RlIGNoYXInKTtcblxuY29uc3QgakNoYXJQID0galVuZXNjYXBlZENoYXJQLyoub3JFbHNlKGpFc2NhcGVkQ2hhclApKi8ub3JFbHNlKGpVbmljb2RlQ2hhclApO1xuY29uc3QgZG91YmxlcXVvdGUgPSBwY2hhcignXCInKS5zZXRMYWJlbCgnZG91YmxlcXVvdGUnKTtcblxuZXhwb3J0IGNvbnN0IEpTdHJpbmdQID0gZG91YmxlcXVvdGVcbiAgICAuZGlzY2FyZEZpcnN0KG1hbnlDaGFycyhqQ2hhclApKVxuICAgIC5kaXNjYXJkU2Vjb25kKGRvdWJsZXF1b3RlKVxuICAgIC5mbWFwKHJlcyA9PiBKVmFsdWUuSlN0cmluZyhyZXMpKVxuICAgIC5zZXRMYWJlbCgnSlNPTiBzdHJpbmcgcGFyc2VyJyk7XG5cbmNvbnN0IGRpZ2l0cyA9IFsnMCcsICcxJywgJzInLCAnMycsICc0JywgJzUnLCAnNicsICc3JywgJzgnLCAnOSddO1xuY29uc3QgZGlnaXRzMTkgPSBbJzEnLCAnMicsICczJywgJzQnLCAnNScsICc2JywgJzcnLCAnOCcsICc5J107XG5cbi8vIGltcHJvdmFibGUgYWxsIG92ZXIgdGhlIHBsYWNlIGJ5OlxuLy8gLSB1c2luZyBtYW55Q2hhcnMgdG8gcHJvY2VzcyBsaXN0cyBpbnRvIHN0cmluZ3MgcmlnaHQgYXdheVxuLy8gLSBkaXNjYXJkaW5nIGUvRSdzIGFuZCBkb3RzLCBhbmQgY29tcG9zaW5nIHRoZSBmaW5hbCBudW1iZXIgZnJvbSBOVU1FUklDQUwgcGllY2VzXG5jb25zdCBkaWdpdHNQID0gbWFueShhbnlPZihkaWdpdHMpKTtcbmNvbnN0IGRpZ2l0czFQID0gbWFueTEoYW55T2YoZGlnaXRzKSk7XG5cbmNvbnN0IG9wdGlvbmFsUGx1c01pbnVzUCA9IG9wdChwY2hhcignLScpLm9yRWxzZShwY2hhcignKycpKSk7XG5jb25zdCBvcHRpb25hbE1pbnVzUCA9IG9wdChwY2hhcignLScpKTtcblxuY29uc3QgYm94ZWRKdXN0ID0geCA9PiB4LmlzTm90aGluZyA/IFsnJ10gOiBbeC52YWx1ZV07XG5jb25zdCB1bmJveGVkSnVzdCA9IHggPT4geC5pc05vdGhpbmcgPyBbJyddIDogeC52YWx1ZTtcbmNvbnN0IHVuYm94ZWROb3RoaW5nID0geCA9PiB4LmlzTm90aGluZyA/ICcnIDogeC52YWx1ZTtcblxuY29uc3QgZXhwb25lbnRpYWxQID0gY2hvaWNlKFtwY2hhcignZScpLCBwY2hhcignRScpXSlcbiAgICAuYW5kVGhlbihvcHRpb25hbFBsdXNNaW51c1ApLy8uZm1hcChib3hlZEp1c3QpXG4gICAgLmFuZFRoZW4oZGlnaXRzMVApXG4gICAgLmZtYXAoKFtbZWUsIG9wdFBNXSwgZGlnc10pID0+IFtlZSwgKHVuYm94ZWROb3RoaW5nKG9wdFBNKSldLmNvbmNhdChkaWdzKS5qb2luKCcnKSk7XG5cbi8vIHJldHVybnMgU3VjY2VzcyhzdHJpbmcpXG5leHBvcnQgY29uc3Qgak51bWJlclN0cmluZ1AgPSBzZXF1ZW5jZVAoW1xuICAgIG9wdGlvbmFsTWludXNQLmZtYXAoYm94ZWRKdXN0KSxcbiAgICBkaWdpdHMxUCxcbiAgICBvcHQocGNoYXIoJy4nKS5hbmRUaGVuKGRpZ2l0czFQKS5mbWFwKChbZG90LCBkaWdzXSkgPT4gW2RvdF0uY29uY2F0KGRpZ3MpKSlcbiAgICAgICAgLmZtYXAodW5ib3hlZEp1c3QpLFxuICAgIG9wdChleHBvbmVudGlhbFApLmZtYXAoYm94ZWRKdXN0KVxuXSkuZm1hcChyZXMgPT4gcmVzLnJlZHVjZSgoYWNjLCBjdXJyKSA9PiBhY2MuY29uY2F0KGN1cnIpLCBbXSkuam9pbignJykpO1xuXG4vLyByZXR1cm5zIFN1Y2Nlc3MocGFyc2VGbG9hdChzdHJpbmcpKVxuZXhwb3J0IGNvbnN0IEpOdW1iZXJQID0gak51bWJlclN0cmluZ1BcbiAgICAuZm1hcChwYXJzZUZsb2F0KVxuICAgIC5mbWFwKEpWYWx1ZS5KTnVtYmVyKVxuICAgIC5zZXRMYWJlbCgnSlNPTiBudW1iZXIgcGFyc2VyJyk7XG5cbmxldCBbYXJyYXlQYXJzZXIsIHBhcnNlclJlZl0gPSBwYXJzZXJGb3J3YXJkZWRUb1JlZigpO1xuXG5jb25zdCB0cmltbWVkQ29tbWFQID0gb3B0KG1hbnlDaGFycyhwY2hhcignICcpKSlcbiAgICAuZGlzY2FyZEZpcnN0KHBjaGFyKCcsJykpXG4gICAgLmRpc2NhcmRTZWNvbmQob3B0KG1hbnlDaGFycyhwY2hhcignICcpKSkpO1xuXG5jb25zdCBlbXB0eUFycmF5UCA9IHBzdHJpbmcoJ1tdJykuZm1hcChfID0+IEpWYWx1ZS5KQXJyYXkoKSk7XG5jb25zdCBmdWxsQXJyYXlQID0gcGNoYXIoJ1snKVxuICAgIC5kaXNjYXJkRmlyc3QoYW5kVGhlbihcbiAgICAgICAgYXJyYXlQYXJzZXIsXG4gICAgICAgIG1hbnkodHJpbW1lZENvbW1hUC5kaXNjYXJkRmlyc3QoYXJyYXlQYXJzZXIpKVxuICAgICkuZm1hcCgoW3ZhbHVlLCB2YWx1ZXNdKSA9PiBbdmFsdWVdLmNvbmNhdCh2YWx1ZXMpKSlcbiAgICAuZGlzY2FyZFNlY29uZChwY2hhcignXScpKVxuICAgIC5mbWFwKChbeHNdKSA9PiBKVmFsdWUuSkFycmF5KHhzKSk7XG5cbmV4cG9ydCBjb25zdCBKQXJyYXlQID0gZW1wdHlBcnJheVBcbiAgICAub3JFbHNlKGZ1bGxBcnJheVApXG4gICAgLnNldExhYmVsKCdKU09OIGFycmF5IHBhcnNlcicpO1xuXG5wYXJzZXJSZWYgPSBKTnVsbFBcbiAgICAub3JFbHNlKEpCb29sUClcbiAgICAub3JFbHNlKEpTdHJpbmdQKVxuICAgIC5vckVsc2UoSk51bWJlclApXG4gICAgLm9yRWxzZShKQXJyYXlQKTtcblxuZnVuY3Rpb24gcGFyc2VyRm9yd2FyZGVkVG9SZWYoKSB7XG5cbiAgICBjb25zdCBkdW1teVBhcnNlciA9IHBhcnNlcihwb3MgPT5cbiAgICAgICAgICAgIFZhbGlkYXRpb24uRmFpbHVyZShUdXBsZS5UcmlwbGUoJ3VuZml4ZWQgZm9yd2FyZGVkIHBhcnNlcicsICdfZmFpbCcsIHBvcykpLFxuICAgICAgICAnZHVtbXlQYXJzZXInKTtcblxuICAgIGxldCBwYXJzZXJSZWYgPSBkdW1teVBhcnNlcjtcblxuICAgIGNvbnN0IHdyYXBwZXJQYXJzZXIgPSBwYXJzZXIocG9zID0+IHBhcnNlclJlZi5ydW4ocG9zKSwgJ3dyYXBwZXJQYXJzZXInKTtcblxuICAgIHJldHVybiBUdXBsZS5QYWlyKHdyYXBwZXJQYXJzZXIsIHBhcnNlclJlZik7XG59XG4iXX0=