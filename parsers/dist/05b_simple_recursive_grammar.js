define(['classes', 'validation', 'parsers'], function (_classes, _validation, _parsers) {
    'use strict';

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

    // @ {
    //   val prefix = P( "hello" | "goodbye" ).!.map(Word)
    var prefixP = (0, _parsers.pword)('hello').orElse((0, _parsers.pword)('goodbye')).fmap(function (arra) {
        return arra.join('');
    }).setLabel('prefixP');

    //   val suffix = P( "world" | "seattle" ).!.map(Word)
    var suffixP = (0, _parsers.pword)('world').orElse((0, _parsers.pword)('seattle')).fmap(function (arra) {
        return arra.join('');
    }).setLabel('suffixP');

    var expressionP = (0, _parsers.parser)(function (pos) {
        return (0, _parsers.choice)([prefixP, (0, _parsers.trimP)((0, _parsers.betweenParens)(expressionP))]).andThen((0, _parsers.choice)([suffixP, (0, _parsers.trimP)((0, _parsers.betweenParens)(expressionP))])).fmap(function (_ref) {
            var _ref2 = _slicedToArray(_ref, 2),
                a = _ref2[0],
                b = _ref2[1];

            return _classes.Tuple.Pair(a, b);
        }).run(pos);
    });

    //   val parser: Parser[Phrase] = P( (parened | prefix) ~ ws ~ (parened | suffix) ).map{
    //     case (lhs, rhs) => Pair(lhs, rhs)
    //   }

    logToScreen('hello seattle', expressionP);
    logToScreen('hello world', expressionP);
    logToScreen('goodbye world', expressionP);
    // @ parser.parse("hello seattle")
    // res66: Parsed[Phrase] = Success(
    //   Pair(Word("hello"), Word("seattle")),
    //   13
    // )
    //
    logToScreen('hello (goodbye seattle)', expressionP);
    logToScreen('(hello world) seattle', expressionP);
    // @ parser.parse("hello (goodbye seattle)")
    // res67: Parsed[Phrase] = Success(
    //   Pair(
    //     Word("hello"),
    //     Pair(Word("goodbye"), Word("seattle"))
    //   ),
    //   23
    // )
    //
    logToScreen('(hello  world) (goodbye seattle)', expressionP);
    // @ parser.parse("(hello  world)   (goodbye seattle)")
    // res68: Parsed[Phrase] = Success(
    //   Pair(
    //     Pair(Word("hello"), Word("world")),
    //     Pair(Word("goodbye"), Word("seattle"))
    //   ),
    //   34
    // )
    //
    logToScreen('(hello  world) ((goodbye seattle) world)', expressionP);
    // @ parser.parse("(hello  world)  ((goodbye seattle) world)")
    // res69: Parsed[Phrase] = Success(
    //   Pair(
    //     Pair(Word("hello"), Word("world")),
    //     Pair(
    //       Pair(Word("goodbye"), Word("seattle")),
    //       Word("world")
    //     )
    //   ),
    //   41
    // )

    function logToScreen(str, parser) {
        var result = parser.run(str);
        var outcome = result.isSuccess ? result.value[0].toString() : 'Failure: ' + result.value[0].toString();
        console.log('"' + str + '" --> ' + outcome);
    }
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2V4YW1wbGVzLzA1Yl9zaW1wbGVfcmVjdXJzaXZlX2dyYW1tYXIuanMiXSwibmFtZXMiOlsicHJlZml4UCIsIm9yRWxzZSIsImZtYXAiLCJhcnJhIiwiam9pbiIsInNldExhYmVsIiwic3VmZml4UCIsImV4cHJlc3Npb25QIiwiYW5kVGhlbiIsImEiLCJiIiwiUGFpciIsInJ1biIsInBvcyIsImxvZ1RvU2NyZWVuIiwic3RyIiwicGFyc2VyIiwicmVzdWx0Iiwib3V0Y29tZSIsImlzU3VjY2VzcyIsInZhbHVlIiwidG9TdHJpbmciLCJjb25zb2xlIiwibG9nIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQWtEQTtBQUNBO0FBQ0EsUUFBTUEsVUFBVSxvQkFBTSxPQUFOLEVBQ1hDLE1BRFcsQ0FDSixvQkFBTSxTQUFOLENBREksRUFFWEMsSUFGVyxDQUVOO0FBQUEsZUFBUUMsS0FBS0MsSUFBTCxDQUFVLEVBQVYsQ0FBUjtBQUFBLEtBRk0sRUFHWEMsUUFIVyxDQUdGLFNBSEUsQ0FBaEI7O0FBS0E7QUFDQSxRQUFNQyxVQUFVLG9CQUFNLE9BQU4sRUFDWEwsTUFEVyxDQUNKLG9CQUFNLFNBQU4sQ0FESSxFQUVYQyxJQUZXLENBRU47QUFBQSxlQUFRQyxLQUFLQyxJQUFMLENBQVUsRUFBVixDQUFSO0FBQUEsS0FGTSxFQUdYQyxRQUhXLENBR0YsU0FIRSxDQUFoQjs7QUFLQSxRQUFNRSxjQUFjLHFCQUFPO0FBQUEsZUFBTyxxQkFBTyxDQUFDUCxPQUFELEVBQVUsb0JBQU0sNEJBQWNPLFdBQWQsQ0FBTixDQUFWLENBQVAsRUFDN0JDLE9BRDZCLENBQ3JCLHFCQUFPLENBQUNGLE9BQUQsRUFBVSxvQkFBTSw0QkFBY0MsV0FBZCxDQUFOLENBQVYsQ0FBUCxDQURxQixFQUU3QkwsSUFGNkIsQ0FFeEI7QUFBQTtBQUFBLGdCQUFFTyxDQUFGO0FBQUEsZ0JBQUtDLENBQUw7O0FBQUEsbUJBQVksZUFBTUMsSUFBTixDQUFXRixDQUFYLEVBQWNDLENBQWQsQ0FBWjtBQUFBLFNBRndCLEVBRU1FLEdBRk4sQ0FFVUMsR0FGVixDQUFQO0FBQUEsS0FBUCxDQUFwQjs7QUFJQTtBQUNBO0FBQ0E7O0FBRUFDLGdCQUFZLGVBQVosRUFBNkJQLFdBQTdCO0FBQ0FPLGdCQUFZLGFBQVosRUFBMkJQLFdBQTNCO0FBQ0FPLGdCQUFZLGVBQVosRUFBNkJQLFdBQTdCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0FPLGdCQUFZLHlCQUFaLEVBQXVDUCxXQUF2QztBQUNBTyxnQkFBWSx1QkFBWixFQUFxQ1AsV0FBckM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQU8sZ0JBQVksa0NBQVosRUFBZ0RQLFdBQWhEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0FPLGdCQUFZLDBDQUFaLEVBQXdEUCxXQUF4RDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsYUFBU08sV0FBVCxDQUFxQkMsR0FBckIsRUFBMEJDLE1BQTFCLEVBQWtDO0FBQzlCLFlBQU1DLFNBQVNELE9BQU9KLEdBQVAsQ0FBV0csR0FBWCxDQUFmO0FBQ0EsWUFBTUcsVUFBV0QsT0FBT0UsU0FBUixHQUFxQkYsT0FBT0csS0FBUCxDQUFhLENBQWIsRUFBZ0JDLFFBQWhCLEVBQXJCLEdBQWtELGNBQWNKLE9BQU9HLEtBQVAsQ0FBYSxDQUFiLEVBQWdCQyxRQUFoQixFQUFoRjtBQUNBQyxnQkFBUUMsR0FBUixDQUFZLE1BQU1SLEdBQU4sR0FBWSxRQUFaLEdBQXVCRyxPQUFuQztBQUNIIiwiZmlsZSI6IjA1Yl9zaW1wbGVfcmVjdXJzaXZlX2dyYW1tYXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBodHRwOi8vd3d3LmxpaGFveWkuY29tL3Bvc3QvRWFzeVBhcnNpbmd3aXRoUGFyc2VyQ29tYmluYXRvcnMuaHRtbCNyZWN1cnNpdmUtcGFyc2Vyc1xuXG5pbXBvcnQge1xuICAgIEpWYWx1ZSxcbiAgICBUdXBsZSxcbn0gZnJvbSAnY2xhc3Nlcyc7XG5pbXBvcnQge1xuICAgIFZhbGlkYXRpb24sXG59IGZyb20gJ3ZhbGlkYXRpb24nO1xuaW1wb3J0IHtcbiAgICBwYXJzZXIsXG4gICAgY2hhclBhcnNlcixcbiAgICBkaWdpdFBhcnNlcixcbiAgICBwcmVkaWNhdGVCYXNlZFBhcnNlcixcbiAgICBwY2hhcixcbiAgICBwZGlnaXQsXG4gICAgYW5kVGhlbixcbiAgICBvckVsc2UsXG4gICAgY2hvaWNlLFxuICAgIGFueU9mLFxuICAgIGZtYXAsXG4gICAgcmV0dXJuUCxcbiAgICBhcHBseVAsXG4gICAgbGlmdDIsXG4gICAgc2VxdWVuY2VQLFxuICAgIHNlcXVlbmNlUDIsXG4gICAgcHN0cmluZyxcbiAgICB6ZXJvT3JNb3JlLFxuICAgIG1hbnksXG4gICAgbWFueTEsXG4gICAgbWFueUNoYXJzLFxuICAgIG1hbnlDaGFyczEsXG4gICAgb3B0LFxuICAgIG9wdEJvb2ssXG4gICAgZGlzY2FyZEZpcnN0LFxuICAgIGRpc2NhcmRTZWNvbmQsXG4gICAgYmV0d2VlbixcbiAgICBiZXR3ZWVuUGFyZW5zLFxuICAgIHNlcEJ5MSxcbiAgICBsb3dlcmNhc2VQLFxuICAgIHVwcGVyY2FzZVAsXG4gICAgbGV0dGVyUCxcbiAgICBkaWdpdFAsXG4gICAgd2hpdGVQLFxuICAgIHRhcFAsXG4gICAgbG9nUCxcbiAgICBwd29yZCxcbiAgICB0cmltUCxcbn0gZnJvbSAncGFyc2Vycyc7XG5cbi8vIEAge1xuLy8gICB2YWwgcHJlZml4ID0gUCggXCJoZWxsb1wiIHwgXCJnb29kYnllXCIgKS4hLm1hcChXb3JkKVxuY29uc3QgcHJlZml4UCA9IHB3b3JkKCdoZWxsbycpXG4gICAgLm9yRWxzZShwd29yZCgnZ29vZGJ5ZScpKVxuICAgIC5mbWFwKGFycmEgPT4gYXJyYS5qb2luKCcnKSlcbiAgICAuc2V0TGFiZWwoJ3ByZWZpeFAnKTtcblxuLy8gICB2YWwgc3VmZml4ID0gUCggXCJ3b3JsZFwiIHwgXCJzZWF0dGxlXCIgKS4hLm1hcChXb3JkKVxuY29uc3Qgc3VmZml4UCA9IHB3b3JkKCd3b3JsZCcpXG4gICAgLm9yRWxzZShwd29yZCgnc2VhdHRsZScpKVxuICAgIC5mbWFwKGFycmEgPT4gYXJyYS5qb2luKCcnKSlcbiAgICAuc2V0TGFiZWwoJ3N1ZmZpeFAnKTtcblxuY29uc3QgZXhwcmVzc2lvblAgPSBwYXJzZXIocG9zID0+IGNob2ljZShbcHJlZml4UCwgdHJpbVAoYmV0d2VlblBhcmVucyhleHByZXNzaW9uUCkpXSlcbiAgICAuYW5kVGhlbihjaG9pY2UoW3N1ZmZpeFAsIHRyaW1QKGJldHdlZW5QYXJlbnMoZXhwcmVzc2lvblApKV0pKVxuICAgIC5mbWFwKChbYSwgYl0pID0+IFR1cGxlLlBhaXIoYSwgYikpLnJ1bihwb3MpKTtcblxuLy8gICB2YWwgcGFyc2VyOiBQYXJzZXJbUGhyYXNlXSA9IFAoIChwYXJlbmVkIHwgcHJlZml4KSB+IHdzIH4gKHBhcmVuZWQgfCBzdWZmaXgpICkubWFwe1xuLy8gICAgIGNhc2UgKGxocywgcmhzKSA9PiBQYWlyKGxocywgcmhzKVxuLy8gICB9XG5cbmxvZ1RvU2NyZWVuKCdoZWxsbyBzZWF0dGxlJywgZXhwcmVzc2lvblApO1xubG9nVG9TY3JlZW4oJ2hlbGxvIHdvcmxkJywgZXhwcmVzc2lvblApO1xubG9nVG9TY3JlZW4oJ2dvb2RieWUgd29ybGQnLCBleHByZXNzaW9uUCk7XG4vLyBAIHBhcnNlci5wYXJzZShcImhlbGxvIHNlYXR0bGVcIilcbi8vIHJlczY2OiBQYXJzZWRbUGhyYXNlXSA9IFN1Y2Nlc3MoXG4vLyAgIFBhaXIoV29yZChcImhlbGxvXCIpLCBXb3JkKFwic2VhdHRsZVwiKSksXG4vLyAgIDEzXG4vLyApXG4vL1xubG9nVG9TY3JlZW4oJ2hlbGxvIChnb29kYnllIHNlYXR0bGUpJywgZXhwcmVzc2lvblApO1xubG9nVG9TY3JlZW4oJyhoZWxsbyB3b3JsZCkgc2VhdHRsZScsIGV4cHJlc3Npb25QKTtcbi8vIEAgcGFyc2VyLnBhcnNlKFwiaGVsbG8gKGdvb2RieWUgc2VhdHRsZSlcIilcbi8vIHJlczY3OiBQYXJzZWRbUGhyYXNlXSA9IFN1Y2Nlc3MoXG4vLyAgIFBhaXIoXG4vLyAgICAgV29yZChcImhlbGxvXCIpLFxuLy8gICAgIFBhaXIoV29yZChcImdvb2RieWVcIiksIFdvcmQoXCJzZWF0dGxlXCIpKVxuLy8gICApLFxuLy8gICAyM1xuLy8gKVxuLy9cbmxvZ1RvU2NyZWVuKCcoaGVsbG8gIHdvcmxkKSAoZ29vZGJ5ZSBzZWF0dGxlKScsIGV4cHJlc3Npb25QKTtcbi8vIEAgcGFyc2VyLnBhcnNlKFwiKGhlbGxvICB3b3JsZCkgICAoZ29vZGJ5ZSBzZWF0dGxlKVwiKVxuLy8gcmVzNjg6IFBhcnNlZFtQaHJhc2VdID0gU3VjY2Vzcyhcbi8vICAgUGFpcihcbi8vICAgICBQYWlyKFdvcmQoXCJoZWxsb1wiKSwgV29yZChcIndvcmxkXCIpKSxcbi8vICAgICBQYWlyKFdvcmQoXCJnb29kYnllXCIpLCBXb3JkKFwic2VhdHRsZVwiKSlcbi8vICAgKSxcbi8vICAgMzRcbi8vIClcbi8vXG5sb2dUb1NjcmVlbignKGhlbGxvICB3b3JsZCkgKChnb29kYnllIHNlYXR0bGUpIHdvcmxkKScsIGV4cHJlc3Npb25QKTtcbi8vIEAgcGFyc2VyLnBhcnNlKFwiKGhlbGxvICB3b3JsZCkgICgoZ29vZGJ5ZSBzZWF0dGxlKSB3b3JsZClcIilcbi8vIHJlczY5OiBQYXJzZWRbUGhyYXNlXSA9IFN1Y2Nlc3MoXG4vLyAgIFBhaXIoXG4vLyAgICAgUGFpcihXb3JkKFwiaGVsbG9cIiksIFdvcmQoXCJ3b3JsZFwiKSksXG4vLyAgICAgUGFpcihcbi8vICAgICAgIFBhaXIoV29yZChcImdvb2RieWVcIiksIFdvcmQoXCJzZWF0dGxlXCIpKSxcbi8vICAgICAgIFdvcmQoXCJ3b3JsZFwiKVxuLy8gICAgIClcbi8vICAgKSxcbi8vICAgNDFcbi8vIClcblxuZnVuY3Rpb24gbG9nVG9TY3JlZW4oc3RyLCBwYXJzZXIpIHtcbiAgICBjb25zdCByZXN1bHQgPSBwYXJzZXIucnVuKHN0cik7XG4gICAgY29uc3Qgb3V0Y29tZSA9IChyZXN1bHQuaXNTdWNjZXNzKSA/IHJlc3VsdC52YWx1ZVswXS50b1N0cmluZygpIDogJ0ZhaWx1cmU6ICcgKyByZXN1bHQudmFsdWVbMF0udG9TdHJpbmcoKTtcbiAgICBjb25zb2xlLmxvZygnXCInICsgc3RyICsgJ1wiIC0tPiAnICsgb3V0Y29tZSk7XG59XG4iXX0=