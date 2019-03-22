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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2pzL2pzb25fcGFyc2Vycy5qcyJdLCJuYW1lcyI6WyJKTnVsbFAiLCJmbWFwIiwiSlZhbHVlIiwiSk51bGwiLCJzZXRMYWJlbCIsIkpUcnVlUCIsIkpCb29sIiwiSkZhbHNlUCIsIkpCb29sUCIsIm9yRWxzZSIsImpVbmVzY2FwZWRDaGFyUCIsImNoYXIiLCJlc2NhcGVkSlNPTkNoYXJzIiwiakVzY2FwZWRDaGFyUCIsIm1hcCIsInBjaGFyIiwiaGV4RGlnaXRzUCIsImpVbmljb2RlQ2hhclAiLCJkaXNjYXJkRmlyc3QiLCJhbmRUaGVuIiwiYSIsImIiLCJjIiwiZCIsInBhcnNlSW50IiwiakNoYXJQIiwiZG91YmxlcXVvdGUiLCJKU3RyaW5nUCIsImRpc2NhcmRTZWNvbmQiLCJKU3RyaW5nIiwicmVzIiwiZGlnaXRzIiwiZGlnaXRzMTkiLCJkaWdpdHNQIiwiZGlnaXRzMVAiLCJvcHRpb25hbFBsdXNNaW51c1AiLCJvcHRpb25hbE1pbnVzUCIsImJveGVkSnVzdCIsIngiLCJpc05vdGhpbmciLCJ2YWx1ZSIsInVuYm94ZWRKdXN0IiwidW5ib3hlZE5vdGhpbmciLCJleHBvbmVudGlhbFAiLCJlZSIsIm9wdFBNIiwiZGlncyIsImNvbmNhdCIsImpvaW4iLCJqTnVtYmVyU3RyaW5nUCIsImRvdCIsInJlZHVjZSIsImFjYyIsImN1cnIiLCJKTnVtYmVyUCIsInBhcnNlRmxvYXQiLCJKTnVtYmVyIiwicGFyc2VyRm9yd2FyZGVkVG9SZWYiLCJqVmFsdWVQIiwicGFyc2VyUmVmIiwibGVmdFNxdWFyZVBhcmVuc1AiLCJyaWdodFNxdWFyZVBhcmVuc1AiLCJjb21tYVAiLCJqdmFsdWVQIiwianZhbHVlc1AiLCJKQXJyYXlQIiwiSkFycmF5IiwiZHVtbXlQYXJzZXIiLCJWYWxpZGF0aW9uIiwiRmFpbHVyZSIsIlR1cGxlIiwiVHJpcGxlIiwicG9zIiwid3JhcHBlclBhcnNlciIsInJ1biIsIlBhaXIiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7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TixFQUFXaEMsYUFBWCxDQUF5QixtQkFBSyxvQkFBTSxHQUFOLENBQUwsQ0FBekIsQ0FBMUI7QUFDQSxRQUFNaUMscUJBQXFCLG9CQUFNLEdBQU4sRUFBV2pDLGFBQVgsQ0FBeUIsbUJBQUssb0JBQU0sR0FBTixDQUFMLENBQXpCLENBQTNCO0FBQ0EsUUFBTWtDLFNBQVMsb0JBQU0sR0FBTixFQUFXbEMsYUFBWCxDQUF5QixtQkFBSyxvQkFBTSxHQUFOLENBQUwsQ0FBekIsQ0FBZjtBQUNBLFFBQU1tQyxVQUFVTCxRQUFROUIsYUFBUixDQUFzQixtQkFBSyxvQkFBTSxHQUFOLENBQUwsQ0FBdEIsQ0FBaEI7QUFDQSxRQUFNb0MsV0FBVyxxQkFBT0QsT0FBUCxFQUFnQkQsTUFBaEIsQ0FBakI7O0FBRU8sUUFBTUcsNEJBQVUsc0JBQVFMLGlCQUFSLEVBQTJCSSxRQUEzQixFQUFxQ0gsa0JBQXJDLEVBQ2xCNUQsSUFEa0IsQ0FDYkMsZ0JBQU9nRSxNQURNLEVBRWxCOUQsUUFGa0IsQ0FFVCxtQkFGUyxDQUFoQjs7QUFJUDtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLGFBQVNxRCxvQkFBVCxHQUFnQzs7QUFFNUIsWUFBTVUsY0FBYyxxQkFBTztBQUFBLG1CQUNuQkMsdUJBQVdDLE9BQVgsQ0FBbUJDLGVBQU1DLE1BQU4sQ0FBYSwwQkFBYixFQUF5QyxPQUF6QyxFQUFrREMsR0FBbEQsQ0FBbkIsQ0FEbUI7QUFBQSxTQUFQLEVBRWhCLGFBRmdCLENBQXBCOztBQUlBLFlBQUliLFlBQVlRLFdBQWhCOztBQUVBLFlBQU1NLGdCQUFnQixxQkFBTyxlQUFPO0FBQ2hDLG1CQUFPZCxVQUFVZSxHQUFWLENBQWNGLEdBQWQsQ0FBUDtBQUNDLFNBRmlCLEVBRWYsZUFGZSxDQUF0Qjs7QUFJQSxlQUFPRixlQUFNSyxJQUFOLENBQVdGLGFBQVgsRUFBMEJkLFNBQTFCLENBQVA7QUFDSCIsImZpbGUiOiJqc29uX3BhcnNlcnMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICAgIEpWYWx1ZSxcbiAgICBUdXBsZSxcbn0gZnJvbSAnY2xhc3Nlcyc7XG5pbXBvcnQge1xuICAgIFZhbGlkYXRpb24sXG59IGZyb20gJ3ZhbGlkYXRpb24nO1xuaW1wb3J0IHtcbiAgICBwYXJzZXIsXG4gICAgY2hhclBhcnNlcixcbiAgICBkaWdpdFBhcnNlcixcbiAgICBwcmVkaWNhdGVCYXNlZFBhcnNlcixcbiAgICBwY2hhcixcbiAgICBwZGlnaXQsXG4gICAgYW5kVGhlbixcbiAgICBvckVsc2UsXG4gICAgY2hvaWNlLFxuICAgIGFueU9mLFxuICAgIGZtYXAsXG4gICAgcmV0dXJuUCxcbiAgICBhcHBseVAsXG4gICAgbGlmdDIsXG4gICAgc2VxdWVuY2VQLFxuICAgIHNlcXVlbmNlUDIsXG4gICAgcHN0cmluZyxcbiAgICB6ZXJvT3JNb3JlLFxuICAgIG1hbnksXG4gICAgbWFueTEsXG4gICAgbWFueUNoYXJzLFxuICAgIG1hbnlDaGFyczEsXG4gICAgb3B0LFxuICAgIG9wdEJvb2ssXG4gICAgZGlzY2FyZEZpcnN0LFxuICAgIGRpc2NhcmRTZWNvbmQsXG4gICAgYmV0d2VlbixcbiAgICBiZXR3ZWVuUGFyZW5zLFxuICAgIHNlcEJ5MSxcbn0gZnJvbSAncGFyc2Vycyc7XG5cbmV4cG9ydCBjb25zdCBKTnVsbFAgPSBwc3RyaW5nKCdudWxsJykuZm1hcChfID0+IEpWYWx1ZS5KTnVsbChudWxsKSkuc2V0TGFiZWwoJ251bGwnKTtcblxuY29uc3QgSlRydWVQID0gcHN0cmluZygndHJ1ZScpLmZtYXAoXyA9PiBKVmFsdWUuSkJvb2wodHJ1ZSkpO1xuY29uc3QgSkZhbHNlUCA9IHBzdHJpbmcoJ2ZhbHNlJykuZm1hcChfID0+IEpWYWx1ZS5KQm9vbChmYWxzZSkpO1xuZXhwb3J0IGNvbnN0IEpCb29sUCA9IEpUcnVlUC5vckVsc2UoSkZhbHNlUCkuc2V0TGFiZWwoJ2Jvb2wnKTtcblxuZXhwb3J0IGNvbnN0IGpVbmVzY2FwZWRDaGFyUCA9IHBhcnNlcihwcmVkaWNhdGVCYXNlZFBhcnNlcihjaGFyID0+IChjaGFyICE9PSAnXFxcXCcgJiYgY2hhciAhPT0gJ1wiJyksICdqdW5lc2NhcGVkQ2hhclAnKSk7XG5jb25zdCBlc2NhcGVkSlNPTkNoYXJzID0gW1xuICAgICdcXFwiJyxcbiAgICAnXFxcXCcsXG4gICAgJ1xcLycsXG4gICAgJ1xcYicsXG4gICAgJ1xcZicsXG4vLyAgICAnXFxuJywgLy8gbmV3bGluZXMgd2lsbCBiZSByZW1vdmVkIGR1cmluZyB0ZXh0IC0+IHBvc2l0aW9uIHRyYW5zZm9ybWF0aW9uXG4gICAgJ1xccicsXG4gICAgJ1xcdCcsXG5dO1xuZXhwb3J0IGNvbnN0IGpFc2NhcGVkQ2hhclAgPSBjaG9pY2UoZXNjYXBlZEpTT05DaGFycy5tYXAocGNoYXIpKS5zZXRMYWJlbCgnZXNjYXBlZCBjaGFyJyk7XG4vLyBhY3R1YWxseSBoZXJlIGl0IGlzIGRvbmUgZGlmZmVyZW50bHk6XG4vLyBodHRwczovL2ZzaGFycGZvcmZ1bmFuZHByb2ZpdC5jb20vcG9zdHMvdW5kZXJzdGFuZGluZy1wYXJzZXItY29tYmluYXRvcnMtNC8jZXNjYXBlZC1jaGFyYWN0ZXJzXG5cbmNvbnN0IGhleERpZ2l0c1AgPSBjaG9pY2UoW1xuICAgICcwJywgJzEnLCAnMicsICczJywgJzQnLCAnNScsICc2JywgJzcnLCAnOCcsICc5JywgJ2EnLCAnYicsICdjJywgJ2QnLCAnZScsICdmJywgJ0EnLCAnQicsICdDJywgJ0QnLCAnRScsICdGJyxcbl0ubWFwKHBjaGFyKSk7XG5cbmV4cG9ydCBjb25zdCBqVW5pY29kZUNoYXJQID0gcGNoYXIoJ1xcXFwnKVxuICAgIC5kaXNjYXJkRmlyc3QocGNoYXIoJ3UnKSlcbiAgICAuZGlzY2FyZEZpcnN0KGhleERpZ2l0c1ApIC8vcmV0dXJucyBhXG4gICAgLmFuZFRoZW4oaGV4RGlnaXRzUCkgLy9yZXR1cm5zIGJcbiAgICAuYW5kVGhlbihoZXhEaWdpdHNQKSAvL3JldHVybnMgY1xuICAgIC5hbmRUaGVuKGhleERpZ2l0c1ApIC8vcmV0dXJucyBkXG4gICAgLmZtYXAoKFtbW2EsIGJdLCBjXSwgZF0pID0+IHBhcnNlSW50KCcnICsgYSArIGIgKyBjICsgZCwgMTYpKVxuICAgIC5zZXRMYWJlbCgndW5pY29kZSBjaGFyJyk7XG5cbmNvbnN0IGpDaGFyUCA9IGpVbmVzY2FwZWRDaGFyUC8qLm9yRWxzZShqRXNjYXBlZENoYXJQKSovLm9yRWxzZShqVW5pY29kZUNoYXJQKTtcbmNvbnN0IGRvdWJsZXF1b3RlID0gcGNoYXIoJ1wiJykuc2V0TGFiZWwoJ2RvdWJsZXF1b3RlJyk7XG5cbmV4cG9ydCBjb25zdCBKU3RyaW5nUCA9IGRvdWJsZXF1b3RlXG4gICAgLmRpc2NhcmRGaXJzdChtYW55Q2hhcnMoakNoYXJQKSlcbiAgICAuZGlzY2FyZFNlY29uZChkb3VibGVxdW90ZSlcbiAgICAuZm1hcChyZXMgPT4gSlZhbHVlLkpTdHJpbmcocmVzKSlcbiAgICAuc2V0TGFiZWwoJ0pTT04gc3RyaW5nIHBhcnNlcicpO1xuXG5jb25zdCBkaWdpdHMgPSBbJzAnLCAnMScsICcyJywgJzMnLCAnNCcsICc1JywgJzYnLCAnNycsICc4JywgJzknXTtcbmNvbnN0IGRpZ2l0czE5ID0gWycxJywgJzInLCAnMycsICc0JywgJzUnLCAnNicsICc3JywgJzgnLCAnOSddO1xuXG4vLyBpbXByb3ZhYmxlIGFsbCBvdmVyIHRoZSBwbGFjZSBieTpcbi8vIC0gdXNpbmcgbWFueUNoYXJzIHRvIHByb2Nlc3MgbGlzdHMgaW50byBzdHJpbmdzIHJpZ2h0IGF3YXlcbi8vIC0gZGlzY2FyZGluZyBlL0UncyBhbmQgZG90cywgYW5kIGNvbXBvc2luZyB0aGUgZmluYWwgbnVtYmVyIGZyb20gTlVNRVJJQ0FMIHBpZWNlc1xuY29uc3QgZGlnaXRzUCA9IG1hbnkoYW55T2YoZGlnaXRzKSk7XG5jb25zdCBkaWdpdHMxUCA9IG1hbnkxKGFueU9mKGRpZ2l0cykpO1xuXG5jb25zdCBvcHRpb25hbFBsdXNNaW51c1AgPSBvcHQocGNoYXIoJy0nKS5vckVsc2UocGNoYXIoJysnKSkpO1xuY29uc3Qgb3B0aW9uYWxNaW51c1AgPSBvcHQocGNoYXIoJy0nKSk7XG5cbmNvbnN0IGJveGVkSnVzdCA9IHggPT4geC5pc05vdGhpbmcgPyBbJyddIDogW3gudmFsdWVdO1xuY29uc3QgdW5ib3hlZEp1c3QgPSB4ID0+IHguaXNOb3RoaW5nID8gWycnXSA6IHgudmFsdWU7XG5jb25zdCB1bmJveGVkTm90aGluZyA9IHggPT4geC5pc05vdGhpbmcgPyAnJyA6IHgudmFsdWU7XG5cbmNvbnN0IGV4cG9uZW50aWFsUCA9IGNob2ljZShbcGNoYXIoJ2UnKSwgcGNoYXIoJ0UnKV0pXG4gICAgLmFuZFRoZW4ob3B0aW9uYWxQbHVzTWludXNQKS8vLmZtYXAoYm94ZWRKdXN0KVxuICAgIC5hbmRUaGVuKGRpZ2l0czFQKVxuICAgIC5mbWFwKChbW2VlLCBvcHRQTV0sIGRpZ3NdKSA9PiBbZWUsICh1bmJveGVkTm90aGluZyhvcHRQTSkpXS5jb25jYXQoZGlncykuam9pbignJykpO1xuXG4vLyByZXR1cm5zIFN1Y2Nlc3Moc3RyaW5nKVxuZXhwb3J0IGNvbnN0IGpOdW1iZXJTdHJpbmdQID0gc2VxdWVuY2VQKFtcbiAgICBvcHRpb25hbE1pbnVzUC5mbWFwKGJveGVkSnVzdCksXG4gICAgZGlnaXRzMVAsXG4gICAgb3B0KHBjaGFyKCcuJykuYW5kVGhlbihkaWdpdHMxUCkuZm1hcCgoW2RvdCwgZGlnc10pID0+IFtkb3RdLmNvbmNhdChkaWdzKSkpXG4gICAgICAgIC5mbWFwKHVuYm94ZWRKdXN0KSxcbiAgICBvcHQoZXhwb25lbnRpYWxQKS5mbWFwKGJveGVkSnVzdClcbl0pLmZtYXAocmVzID0+IHJlcy5yZWR1Y2UoKGFjYywgY3VycikgPT4gYWNjLmNvbmNhdChjdXJyKSwgW10pLmpvaW4oJycpKTtcblxuLy8gcmV0dXJucyBTdWNjZXNzKHBhcnNlRmxvYXQoc3RyaW5nKSlcbmV4cG9ydCBjb25zdCBKTnVtYmVyUCA9IGpOdW1iZXJTdHJpbmdQXG4gICAgLmZtYXAocGFyc2VGbG9hdClcbiAgICAuZm1hcChKVmFsdWUuSk51bWJlcilcbiAgICAuc2V0TGFiZWwoJ0pTT04gbnVtYmVyIHBhcnNlcicpO1xuXG5sZXQgW2pWYWx1ZVAsIHBhcnNlclJlZl0gPSBwYXJzZXJGb3J3YXJkZWRUb1JlZigpO1xuXG5jb25zdCBsZWZ0U3F1YXJlUGFyZW5zUCA9IHBjaGFyKCdbJykuZGlzY2FyZFNlY29uZChtYW55KHBjaGFyKCcgJykpKTtcbmNvbnN0IHJpZ2h0U3F1YXJlUGFyZW5zUCA9IHBjaGFyKCddJykuZGlzY2FyZFNlY29uZChtYW55KHBjaGFyKCcgJykpKTtcbmNvbnN0IGNvbW1hUCA9IHBjaGFyKCcsJykuZGlzY2FyZFNlY29uZChtYW55KHBjaGFyKCcgJykpKTtcbmNvbnN0IGp2YWx1ZVAgPSBqVmFsdWVQLmRpc2NhcmRTZWNvbmQobWFueShwY2hhcignICcpKSk7XG5jb25zdCBqdmFsdWVzUCA9IHNlcEJ5MShqdmFsdWVQLCBjb21tYVApO1xuXG5leHBvcnQgY29uc3QgSkFycmF5UCA9IGJldHdlZW4obGVmdFNxdWFyZVBhcmVuc1AsIGp2YWx1ZXNQLCByaWdodFNxdWFyZVBhcmVuc1ApXG4gICAgLmZtYXAoSlZhbHVlLkpBcnJheSlcbiAgICAuc2V0TGFiZWwoJ0pTT04gYXJyYXkgcGFyc2VyJyk7XG5cbi8vIHBhcnNlclJlZiA9IEpOdWxsUFxuLy8gICAgIC5vckVsc2UoSkJvb2xQKVxuLy8gICAgIC5vckVsc2UoSlN0cmluZ1ApXG4vLyAgICAgLm9yRWxzZShKTnVtYmVyUClcbi8vICAgICAub3JFbHNlKEpBcnJheVApO1xuXG5mdW5jdGlvbiBwYXJzZXJGb3J3YXJkZWRUb1JlZigpIHtcblxuICAgIGNvbnN0IGR1bW15UGFyc2VyID0gcGFyc2VyKHBvcyA9PlxuICAgICAgICAgICAgVmFsaWRhdGlvbi5GYWlsdXJlKFR1cGxlLlRyaXBsZSgndW5maXhlZCBmb3J3YXJkZWQgcGFyc2VyJywgJ19mYWlsJywgcG9zKSksXG4gICAgICAgICdkdW1teVBhcnNlcicpO1xuXG4gICAgbGV0IHBhcnNlclJlZiA9IGR1bW15UGFyc2VyO1xuXG4gICAgY29uc3Qgd3JhcHBlclBhcnNlciA9IHBhcnNlcihwb3MgPT4ge1xuICAgICAgICByZXR1cm4gcGFyc2VyUmVmLnJ1bihwb3MpO1xuICAgICAgICB9LCAnd3JhcHBlclBhcnNlcicpO1xuXG4gICAgcmV0dXJuIFR1cGxlLlBhaXIod3JhcHBlclBhcnNlciwgcGFyc2VyUmVmKTtcbn1cbiJdfQ==