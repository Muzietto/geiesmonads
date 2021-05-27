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

    console.log('\n05b_simple_recursive_grammar');
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2V4YW1wbGVzLzA1Yl9zaW1wbGVfcmVjdXJzaXZlX2dyYW1tYXIuanMiXSwibmFtZXMiOlsicHJlZml4UCIsIm9yRWxzZSIsImZtYXAiLCJhcnJhIiwiam9pbiIsInNldExhYmVsIiwic3VmZml4UCIsImV4cHJlc3Npb25QIiwiYW5kVGhlbiIsImEiLCJiIiwiVHVwbGUiLCJQYWlyIiwicnVuIiwicG9zIiwiY29uc29sZSIsImxvZyIsImxvZ1RvU2NyZWVuIiwic3RyIiwicGFyc2VyIiwicmVzdWx0Iiwib3V0Y29tZSIsImlzU3VjY2VzcyIsInZhbHVlIiwidG9TdHJpbmciXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBa0RBO0FBQ0E7QUFDQSxRQUFNQSxVQUFVLG9CQUFNLE9BQU4sRUFDWEMsTUFEVyxDQUNKLG9CQUFNLFNBQU4sQ0FESSxFQUVYQyxJQUZXLENBRU47QUFBQSxlQUFRQyxLQUFLQyxJQUFMLENBQVUsRUFBVixDQUFSO0FBQUEsS0FGTSxFQUdYQyxRQUhXLENBR0YsU0FIRSxDQUFoQjs7QUFLQTtBQUNBLFFBQU1DLFVBQVUsb0JBQU0sT0FBTixFQUNYTCxNQURXLENBQ0osb0JBQU0sU0FBTixDQURJLEVBRVhDLElBRlcsQ0FFTjtBQUFBLGVBQVFDLEtBQUtDLElBQUwsQ0FBVSxFQUFWLENBQVI7QUFBQSxLQUZNLEVBR1hDLFFBSFcsQ0FHRixTQUhFLENBQWhCOztBQUtBLFFBQU1FLGNBQWMscUJBQU87QUFBQSxlQUFPLHFCQUFPLENBQUNQLE9BQUQsRUFBVSxvQkFBTSw0QkFBY08sV0FBZCxDQUFOLENBQVYsQ0FBUCxFQUM3QkMsT0FENkIsQ0FDckIscUJBQU8sQ0FBQ0YsT0FBRCxFQUFVLG9CQUFNLDRCQUFjQyxXQUFkLENBQU4sQ0FBVixDQUFQLENBRHFCLEVBRTdCTCxJQUY2QixDQUV4QjtBQUFBO0FBQUEsZ0JBQUVPLENBQUY7QUFBQSxnQkFBS0MsQ0FBTDs7QUFBQSxtQkFBWUMsZUFBTUMsSUFBTixDQUFXSCxDQUFYLEVBQWNDLENBQWQsQ0FBWjtBQUFBLFNBRndCLEVBRU1HLEdBRk4sQ0FFVUMsR0FGVixDQUFQO0FBQUEsS0FBUCxDQUFwQjs7QUFJQTtBQUNBO0FBQ0E7O0FBRUFDLFlBQVFDLEdBQVIsQ0FBWSxnQ0FBWjtBQUNBQyxnQkFBWSxlQUFaLEVBQTZCVixXQUE3QjtBQUNBVSxnQkFBWSxhQUFaLEVBQTJCVixXQUEzQjtBQUNBVSxnQkFBWSxlQUFaLEVBQTZCVixXQUE3QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBVSxnQkFBWSx5QkFBWixFQUF1Q1YsV0FBdkM7QUFDQVUsZ0JBQVksdUJBQVosRUFBcUNWLFdBQXJDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0FVLGdCQUFZLGtDQUFaLEVBQWdEVixXQUFoRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBVSxnQkFBWSwwQ0FBWixFQUF3RFYsV0FBeEQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLGFBQVNVLFdBQVQsQ0FBcUJDLEdBQXJCLEVBQTBCQyxNQUExQixFQUFrQztBQUM5QixZQUFNQyxTQUFTRCxPQUFPTixHQUFQLENBQVdLLEdBQVgsQ0FBZjtBQUNBLFlBQU1HLFVBQVdELE9BQU9FLFNBQVIsR0FBcUJGLE9BQU9HLEtBQVAsQ0FBYSxDQUFiLEVBQWdCQyxRQUFoQixFQUFyQixHQUFrRCxjQUFjSixPQUFPRyxLQUFQLENBQWEsQ0FBYixFQUFnQkMsUUFBaEIsRUFBaEY7QUFDQVQsZ0JBQVFDLEdBQVIsQ0FBWSxNQUFNRSxHQUFOLEdBQVksUUFBWixHQUF1QkcsT0FBbkM7QUFDSCIsImZpbGUiOiIwNWJfc2ltcGxlX3JlY3Vyc2l2ZV9ncmFtbWFyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8gaHR0cDovL3d3dy5saWhhb3lpLmNvbS9wb3N0L0Vhc3lQYXJzaW5nd2l0aFBhcnNlckNvbWJpbmF0b3JzLmh0bWwjcmVjdXJzaXZlLXBhcnNlcnNcclxuXHJcbmltcG9ydCB7XHJcbiAgICBKVmFsdWUsXHJcbiAgICBUdXBsZSxcclxufSBmcm9tICdjbGFzc2VzJztcclxuaW1wb3J0IHtcclxuICAgIFZhbGlkYXRpb24sXHJcbn0gZnJvbSAndmFsaWRhdGlvbic7XHJcbmltcG9ydCB7XHJcbiAgICBwYXJzZXIsXHJcbiAgICBjaGFyUGFyc2VyLFxyXG4gICAgZGlnaXRQYXJzZXIsXHJcbiAgICBwcmVkaWNhdGVCYXNlZFBhcnNlcixcclxuICAgIHBjaGFyLFxyXG4gICAgcGRpZ2l0LFxyXG4gICAgYW5kVGhlbixcclxuICAgIG9yRWxzZSxcclxuICAgIGNob2ljZSxcclxuICAgIGFueU9mLFxyXG4gICAgZm1hcCxcclxuICAgIHJldHVyblAsXHJcbiAgICBhcHBseVAsXHJcbiAgICBsaWZ0MixcclxuICAgIHNlcXVlbmNlUCxcclxuICAgIHNlcXVlbmNlUDIsXHJcbiAgICBwc3RyaW5nLFxyXG4gICAgemVyb09yTW9yZSxcclxuICAgIG1hbnksXHJcbiAgICBtYW55MSxcclxuICAgIG1hbnlDaGFycyxcclxuICAgIG1hbnlDaGFyczEsXHJcbiAgICBvcHQsXHJcbiAgICBvcHRCb29rLFxyXG4gICAgZGlzY2FyZEZpcnN0LFxyXG4gICAgZGlzY2FyZFNlY29uZCxcclxuICAgIGJldHdlZW4sXHJcbiAgICBiZXR3ZWVuUGFyZW5zLFxyXG4gICAgc2VwQnkxLFxyXG4gICAgbG93ZXJjYXNlUCxcclxuICAgIHVwcGVyY2FzZVAsXHJcbiAgICBsZXR0ZXJQLFxyXG4gICAgZGlnaXRQLFxyXG4gICAgd2hpdGVQLFxyXG4gICAgdGFwUCxcclxuICAgIGxvZ1AsXHJcbiAgICBwd29yZCxcclxuICAgIHRyaW1QLFxyXG59IGZyb20gJ3BhcnNlcnMnO1xyXG5cclxuLy8gQCB7XHJcbi8vICAgdmFsIHByZWZpeCA9IFAoIFwiaGVsbG9cIiB8IFwiZ29vZGJ5ZVwiICkuIS5tYXAoV29yZClcclxuY29uc3QgcHJlZml4UCA9IHB3b3JkKCdoZWxsbycpXHJcbiAgICAub3JFbHNlKHB3b3JkKCdnb29kYnllJykpXHJcbiAgICAuZm1hcChhcnJhID0+IGFycmEuam9pbignJykpXHJcbiAgICAuc2V0TGFiZWwoJ3ByZWZpeFAnKTtcclxuXHJcbi8vICAgdmFsIHN1ZmZpeCA9IFAoIFwid29ybGRcIiB8IFwic2VhdHRsZVwiICkuIS5tYXAoV29yZClcclxuY29uc3Qgc3VmZml4UCA9IHB3b3JkKCd3b3JsZCcpXHJcbiAgICAub3JFbHNlKHB3b3JkKCdzZWF0dGxlJykpXHJcbiAgICAuZm1hcChhcnJhID0+IGFycmEuam9pbignJykpXHJcbiAgICAuc2V0TGFiZWwoJ3N1ZmZpeFAnKTtcclxuXHJcbmNvbnN0IGV4cHJlc3Npb25QID0gcGFyc2VyKHBvcyA9PiBjaG9pY2UoW3ByZWZpeFAsIHRyaW1QKGJldHdlZW5QYXJlbnMoZXhwcmVzc2lvblApKV0pXHJcbiAgICAuYW5kVGhlbihjaG9pY2UoW3N1ZmZpeFAsIHRyaW1QKGJldHdlZW5QYXJlbnMoZXhwcmVzc2lvblApKV0pKVxyXG4gICAgLmZtYXAoKFthLCBiXSkgPT4gVHVwbGUuUGFpcihhLCBiKSkucnVuKHBvcykpO1xyXG5cclxuLy8gICB2YWwgcGFyc2VyOiBQYXJzZXJbUGhyYXNlXSA9IFAoIChwYXJlbmVkIHwgcHJlZml4KSB+IHdzIH4gKHBhcmVuZWQgfCBzdWZmaXgpICkubWFwe1xyXG4vLyAgICAgY2FzZSAobGhzLCByaHMpID0+IFBhaXIobGhzLCByaHMpXHJcbi8vICAgfVxyXG5cclxuY29uc29sZS5sb2coJ1xcbjA1Yl9zaW1wbGVfcmVjdXJzaXZlX2dyYW1tYXInKTtcclxubG9nVG9TY3JlZW4oJ2hlbGxvIHNlYXR0bGUnLCBleHByZXNzaW9uUCk7XHJcbmxvZ1RvU2NyZWVuKCdoZWxsbyB3b3JsZCcsIGV4cHJlc3Npb25QKTtcclxubG9nVG9TY3JlZW4oJ2dvb2RieWUgd29ybGQnLCBleHByZXNzaW9uUCk7XHJcbi8vIEAgcGFyc2VyLnBhcnNlKFwiaGVsbG8gc2VhdHRsZVwiKVxyXG4vLyByZXM2NjogUGFyc2VkW1BocmFzZV0gPSBTdWNjZXNzKFxyXG4vLyAgIFBhaXIoV29yZChcImhlbGxvXCIpLCBXb3JkKFwic2VhdHRsZVwiKSksXHJcbi8vICAgMTNcclxuLy8gKVxyXG4vL1xyXG5sb2dUb1NjcmVlbignaGVsbG8gKGdvb2RieWUgc2VhdHRsZSknLCBleHByZXNzaW9uUCk7XHJcbmxvZ1RvU2NyZWVuKCcoaGVsbG8gd29ybGQpIHNlYXR0bGUnLCBleHByZXNzaW9uUCk7XHJcbi8vIEAgcGFyc2VyLnBhcnNlKFwiaGVsbG8gKGdvb2RieWUgc2VhdHRsZSlcIilcclxuLy8gcmVzNjc6IFBhcnNlZFtQaHJhc2VdID0gU3VjY2VzcyhcclxuLy8gICBQYWlyKFxyXG4vLyAgICAgV29yZChcImhlbGxvXCIpLFxyXG4vLyAgICAgUGFpcihXb3JkKFwiZ29vZGJ5ZVwiKSwgV29yZChcInNlYXR0bGVcIikpXHJcbi8vICAgKSxcclxuLy8gICAyM1xyXG4vLyApXHJcbi8vXHJcbmxvZ1RvU2NyZWVuKCcoaGVsbG8gIHdvcmxkKSAoZ29vZGJ5ZSBzZWF0dGxlKScsIGV4cHJlc3Npb25QKTtcclxuLy8gQCBwYXJzZXIucGFyc2UoXCIoaGVsbG8gIHdvcmxkKSAgIChnb29kYnllIHNlYXR0bGUpXCIpXHJcbi8vIHJlczY4OiBQYXJzZWRbUGhyYXNlXSA9IFN1Y2Nlc3MoXHJcbi8vICAgUGFpcihcclxuLy8gICAgIFBhaXIoV29yZChcImhlbGxvXCIpLCBXb3JkKFwid29ybGRcIikpLFxyXG4vLyAgICAgUGFpcihXb3JkKFwiZ29vZGJ5ZVwiKSwgV29yZChcInNlYXR0bGVcIikpXHJcbi8vICAgKSxcclxuLy8gICAzNFxyXG4vLyApXHJcbi8vXHJcbmxvZ1RvU2NyZWVuKCcoaGVsbG8gIHdvcmxkKSAoKGdvb2RieWUgc2VhdHRsZSkgd29ybGQpJywgZXhwcmVzc2lvblApO1xyXG4vLyBAIHBhcnNlci5wYXJzZShcIihoZWxsbyAgd29ybGQpICAoKGdvb2RieWUgc2VhdHRsZSkgd29ybGQpXCIpXHJcbi8vIHJlczY5OiBQYXJzZWRbUGhyYXNlXSA9IFN1Y2Nlc3MoXHJcbi8vICAgUGFpcihcclxuLy8gICAgIFBhaXIoV29yZChcImhlbGxvXCIpLCBXb3JkKFwid29ybGRcIikpLFxyXG4vLyAgICAgUGFpcihcclxuLy8gICAgICAgUGFpcihXb3JkKFwiZ29vZGJ5ZVwiKSwgV29yZChcInNlYXR0bGVcIikpLFxyXG4vLyAgICAgICBXb3JkKFwid29ybGRcIilcclxuLy8gICAgIClcclxuLy8gICApLFxyXG4vLyAgIDQxXHJcbi8vIClcclxuXHJcbmZ1bmN0aW9uIGxvZ1RvU2NyZWVuKHN0ciwgcGFyc2VyKSB7XHJcbiAgICBjb25zdCByZXN1bHQgPSBwYXJzZXIucnVuKHN0cik7XHJcbiAgICBjb25zdCBvdXRjb21lID0gKHJlc3VsdC5pc1N1Y2Nlc3MpID8gcmVzdWx0LnZhbHVlWzBdLnRvU3RyaW5nKCkgOiAnRmFpbHVyZTogJyArIHJlc3VsdC52YWx1ZVswXS50b1N0cmluZygpO1xyXG4gICAgY29uc29sZS5sb2coJ1wiJyArIHN0ciArICdcIiAtLT4gJyArIG91dGNvbWUpO1xyXG59XHJcbiJdfQ==