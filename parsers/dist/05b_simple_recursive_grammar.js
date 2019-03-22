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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2V4YW1wbGVzLzA1Yl9zaW1wbGVfcmVjdXJzaXZlX2dyYW1tYXIuanMiXSwibmFtZXMiOlsicHJlZml4UCIsIm9yRWxzZSIsImZtYXAiLCJhcnJhIiwiam9pbiIsInNldExhYmVsIiwic3VmZml4UCIsImV4cHJlc3Npb25QIiwiYW5kVGhlbiIsImEiLCJiIiwiVHVwbGUiLCJQYWlyIiwicnVuIiwicG9zIiwiY29uc29sZSIsImxvZyIsImxvZ1RvU2NyZWVuIiwic3RyIiwicGFyc2VyIiwicmVzdWx0Iiwib3V0Y29tZSIsImlzU3VjY2VzcyIsInZhbHVlIiwidG9TdHJpbmciXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBa0RBO0FBQ0E7QUFDQSxRQUFNQSxVQUFVLG9CQUFNLE9BQU4sRUFDWEMsTUFEVyxDQUNKLG9CQUFNLFNBQU4sQ0FESSxFQUVYQyxJQUZXLENBRU47QUFBQSxlQUFRQyxLQUFLQyxJQUFMLENBQVUsRUFBVixDQUFSO0FBQUEsS0FGTSxFQUdYQyxRQUhXLENBR0YsU0FIRSxDQUFoQjs7QUFLQTtBQUNBLFFBQU1DLFVBQVUsb0JBQU0sT0FBTixFQUNYTCxNQURXLENBQ0osb0JBQU0sU0FBTixDQURJLEVBRVhDLElBRlcsQ0FFTjtBQUFBLGVBQVFDLEtBQUtDLElBQUwsQ0FBVSxFQUFWLENBQVI7QUFBQSxLQUZNLEVBR1hDLFFBSFcsQ0FHRixTQUhFLENBQWhCOztBQUtBLFFBQU1FLGNBQWMscUJBQU87QUFBQSxlQUFPLHFCQUFPLENBQUNQLE9BQUQsRUFBVSxvQkFBTSw0QkFBY08sV0FBZCxDQUFOLENBQVYsQ0FBUCxFQUM3QkMsT0FENkIsQ0FDckIscUJBQU8sQ0FBQ0YsT0FBRCxFQUFVLG9CQUFNLDRCQUFjQyxXQUFkLENBQU4sQ0FBVixDQUFQLENBRHFCLEVBRTdCTCxJQUY2QixDQUV4QjtBQUFBO0FBQUEsZ0JBQUVPLENBQUY7QUFBQSxnQkFBS0MsQ0FBTDs7QUFBQSxtQkFBWUMsZUFBTUMsSUFBTixDQUFXSCxDQUFYLEVBQWNDLENBQWQsQ0FBWjtBQUFBLFNBRndCLEVBRU1HLEdBRk4sQ0FFVUMsR0FGVixDQUFQO0FBQUEsS0FBUCxDQUFwQjs7QUFJQTtBQUNBO0FBQ0E7O0FBRUFDLFlBQVFDLEdBQVIsQ0FBWSxnQ0FBWjtBQUNBQyxnQkFBWSxlQUFaLEVBQTZCVixXQUE3QjtBQUNBVSxnQkFBWSxhQUFaLEVBQTJCVixXQUEzQjtBQUNBVSxnQkFBWSxlQUFaLEVBQTZCVixXQUE3QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBVSxnQkFBWSx5QkFBWixFQUF1Q1YsV0FBdkM7QUFDQVUsZ0JBQVksdUJBQVosRUFBcUNWLFdBQXJDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0FVLGdCQUFZLGtDQUFaLEVBQWdEVixXQUFoRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBVSxnQkFBWSwwQ0FBWixFQUF3RFYsV0FBeEQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLGFBQVNVLFdBQVQsQ0FBcUJDLEdBQXJCLEVBQTBCQyxNQUExQixFQUFrQztBQUM5QixZQUFNQyxTQUFTRCxPQUFPTixHQUFQLENBQVdLLEdBQVgsQ0FBZjtBQUNBLFlBQU1HLFVBQVdELE9BQU9FLFNBQVIsR0FBcUJGLE9BQU9HLEtBQVAsQ0FBYSxDQUFiLEVBQWdCQyxRQUFoQixFQUFyQixHQUFrRCxjQUFjSixPQUFPRyxLQUFQLENBQWEsQ0FBYixFQUFnQkMsUUFBaEIsRUFBaEY7QUFDQVQsZ0JBQVFDLEdBQVIsQ0FBWSxNQUFNRSxHQUFOLEdBQVksUUFBWixHQUF1QkcsT0FBbkM7QUFDSCIsImZpbGUiOiIwNWJfc2ltcGxlX3JlY3Vyc2l2ZV9ncmFtbWFyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8gaHR0cDovL3d3dy5saWhhb3lpLmNvbS9wb3N0L0Vhc3lQYXJzaW5nd2l0aFBhcnNlckNvbWJpbmF0b3JzLmh0bWwjcmVjdXJzaXZlLXBhcnNlcnNcblxuaW1wb3J0IHtcbiAgICBKVmFsdWUsXG4gICAgVHVwbGUsXG59IGZyb20gJ2NsYXNzZXMnO1xuaW1wb3J0IHtcbiAgICBWYWxpZGF0aW9uLFxufSBmcm9tICd2YWxpZGF0aW9uJztcbmltcG9ydCB7XG4gICAgcGFyc2VyLFxuICAgIGNoYXJQYXJzZXIsXG4gICAgZGlnaXRQYXJzZXIsXG4gICAgcHJlZGljYXRlQmFzZWRQYXJzZXIsXG4gICAgcGNoYXIsXG4gICAgcGRpZ2l0LFxuICAgIGFuZFRoZW4sXG4gICAgb3JFbHNlLFxuICAgIGNob2ljZSxcbiAgICBhbnlPZixcbiAgICBmbWFwLFxuICAgIHJldHVyblAsXG4gICAgYXBwbHlQLFxuICAgIGxpZnQyLFxuICAgIHNlcXVlbmNlUCxcbiAgICBzZXF1ZW5jZVAyLFxuICAgIHBzdHJpbmcsXG4gICAgemVyb09yTW9yZSxcbiAgICBtYW55LFxuICAgIG1hbnkxLFxuICAgIG1hbnlDaGFycyxcbiAgICBtYW55Q2hhcnMxLFxuICAgIG9wdCxcbiAgICBvcHRCb29rLFxuICAgIGRpc2NhcmRGaXJzdCxcbiAgICBkaXNjYXJkU2Vjb25kLFxuICAgIGJldHdlZW4sXG4gICAgYmV0d2VlblBhcmVucyxcbiAgICBzZXBCeTEsXG4gICAgbG93ZXJjYXNlUCxcbiAgICB1cHBlcmNhc2VQLFxuICAgIGxldHRlclAsXG4gICAgZGlnaXRQLFxuICAgIHdoaXRlUCxcbiAgICB0YXBQLFxuICAgIGxvZ1AsXG4gICAgcHdvcmQsXG4gICAgdHJpbVAsXG59IGZyb20gJ3BhcnNlcnMnO1xuXG4vLyBAIHtcbi8vICAgdmFsIHByZWZpeCA9IFAoIFwiaGVsbG9cIiB8IFwiZ29vZGJ5ZVwiICkuIS5tYXAoV29yZClcbmNvbnN0IHByZWZpeFAgPSBwd29yZCgnaGVsbG8nKVxuICAgIC5vckVsc2UocHdvcmQoJ2dvb2RieWUnKSlcbiAgICAuZm1hcChhcnJhID0+IGFycmEuam9pbignJykpXG4gICAgLnNldExhYmVsKCdwcmVmaXhQJyk7XG5cbi8vICAgdmFsIHN1ZmZpeCA9IFAoIFwid29ybGRcIiB8IFwic2VhdHRsZVwiICkuIS5tYXAoV29yZClcbmNvbnN0IHN1ZmZpeFAgPSBwd29yZCgnd29ybGQnKVxuICAgIC5vckVsc2UocHdvcmQoJ3NlYXR0bGUnKSlcbiAgICAuZm1hcChhcnJhID0+IGFycmEuam9pbignJykpXG4gICAgLnNldExhYmVsKCdzdWZmaXhQJyk7XG5cbmNvbnN0IGV4cHJlc3Npb25QID0gcGFyc2VyKHBvcyA9PiBjaG9pY2UoW3ByZWZpeFAsIHRyaW1QKGJldHdlZW5QYXJlbnMoZXhwcmVzc2lvblApKV0pXG4gICAgLmFuZFRoZW4oY2hvaWNlKFtzdWZmaXhQLCB0cmltUChiZXR3ZWVuUGFyZW5zKGV4cHJlc3Npb25QKSldKSlcbiAgICAuZm1hcCgoW2EsIGJdKSA9PiBUdXBsZS5QYWlyKGEsIGIpKS5ydW4ocG9zKSk7XG5cbi8vICAgdmFsIHBhcnNlcjogUGFyc2VyW1BocmFzZV0gPSBQKCAocGFyZW5lZCB8IHByZWZpeCkgfiB3cyB+IChwYXJlbmVkIHwgc3VmZml4KSApLm1hcHtcbi8vICAgICBjYXNlIChsaHMsIHJocykgPT4gUGFpcihsaHMsIHJocylcbi8vICAgfVxuXG5jb25zb2xlLmxvZygnXFxuMDViX3NpbXBsZV9yZWN1cnNpdmVfZ3JhbW1hcicpO1xubG9nVG9TY3JlZW4oJ2hlbGxvIHNlYXR0bGUnLCBleHByZXNzaW9uUCk7XG5sb2dUb1NjcmVlbignaGVsbG8gd29ybGQnLCBleHByZXNzaW9uUCk7XG5sb2dUb1NjcmVlbignZ29vZGJ5ZSB3b3JsZCcsIGV4cHJlc3Npb25QKTtcbi8vIEAgcGFyc2VyLnBhcnNlKFwiaGVsbG8gc2VhdHRsZVwiKVxuLy8gcmVzNjY6IFBhcnNlZFtQaHJhc2VdID0gU3VjY2Vzcyhcbi8vICAgUGFpcihXb3JkKFwiaGVsbG9cIiksIFdvcmQoXCJzZWF0dGxlXCIpKSxcbi8vICAgMTNcbi8vIClcbi8vXG5sb2dUb1NjcmVlbignaGVsbG8gKGdvb2RieWUgc2VhdHRsZSknLCBleHByZXNzaW9uUCk7XG5sb2dUb1NjcmVlbignKGhlbGxvIHdvcmxkKSBzZWF0dGxlJywgZXhwcmVzc2lvblApO1xuLy8gQCBwYXJzZXIucGFyc2UoXCJoZWxsbyAoZ29vZGJ5ZSBzZWF0dGxlKVwiKVxuLy8gcmVzNjc6IFBhcnNlZFtQaHJhc2VdID0gU3VjY2Vzcyhcbi8vICAgUGFpcihcbi8vICAgICBXb3JkKFwiaGVsbG9cIiksXG4vLyAgICAgUGFpcihXb3JkKFwiZ29vZGJ5ZVwiKSwgV29yZChcInNlYXR0bGVcIikpXG4vLyAgICksXG4vLyAgIDIzXG4vLyApXG4vL1xubG9nVG9TY3JlZW4oJyhoZWxsbyAgd29ybGQpIChnb29kYnllIHNlYXR0bGUpJywgZXhwcmVzc2lvblApO1xuLy8gQCBwYXJzZXIucGFyc2UoXCIoaGVsbG8gIHdvcmxkKSAgIChnb29kYnllIHNlYXR0bGUpXCIpXG4vLyByZXM2ODogUGFyc2VkW1BocmFzZV0gPSBTdWNjZXNzKFxuLy8gICBQYWlyKFxuLy8gICAgIFBhaXIoV29yZChcImhlbGxvXCIpLCBXb3JkKFwid29ybGRcIikpLFxuLy8gICAgIFBhaXIoV29yZChcImdvb2RieWVcIiksIFdvcmQoXCJzZWF0dGxlXCIpKVxuLy8gICApLFxuLy8gICAzNFxuLy8gKVxuLy9cbmxvZ1RvU2NyZWVuKCcoaGVsbG8gIHdvcmxkKSAoKGdvb2RieWUgc2VhdHRsZSkgd29ybGQpJywgZXhwcmVzc2lvblApO1xuLy8gQCBwYXJzZXIucGFyc2UoXCIoaGVsbG8gIHdvcmxkKSAgKChnb29kYnllIHNlYXR0bGUpIHdvcmxkKVwiKVxuLy8gcmVzNjk6IFBhcnNlZFtQaHJhc2VdID0gU3VjY2Vzcyhcbi8vICAgUGFpcihcbi8vICAgICBQYWlyKFdvcmQoXCJoZWxsb1wiKSwgV29yZChcIndvcmxkXCIpKSxcbi8vICAgICBQYWlyKFxuLy8gICAgICAgUGFpcihXb3JkKFwiZ29vZGJ5ZVwiKSwgV29yZChcInNlYXR0bGVcIikpLFxuLy8gICAgICAgV29yZChcIndvcmxkXCIpXG4vLyAgICAgKVxuLy8gICApLFxuLy8gICA0MVxuLy8gKVxuXG5mdW5jdGlvbiBsb2dUb1NjcmVlbihzdHIsIHBhcnNlcikge1xuICAgIGNvbnN0IHJlc3VsdCA9IHBhcnNlci5ydW4oc3RyKTtcbiAgICBjb25zdCBvdXRjb21lID0gKHJlc3VsdC5pc1N1Y2Nlc3MpID8gcmVzdWx0LnZhbHVlWzBdLnRvU3RyaW5nKCkgOiAnRmFpbHVyZTogJyArIHJlc3VsdC52YWx1ZVswXS50b1N0cmluZygpO1xuICAgIGNvbnNvbGUubG9nKCdcIicgKyBzdHIgKyAnXCIgLS0+ICcgKyBvdXRjb21lKTtcbn1cbiJdfQ==