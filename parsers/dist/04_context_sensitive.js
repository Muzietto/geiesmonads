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

    // The classical example of context sensitive grammars is: a{n}b{n}c{n}

    // "a" repeated n times, followed by "b" repeated n times, followed by "c"
    // repeated n times, where n is always the same number. So "abc" it's ok,
    // "aaabbbccc" it's ok, "abbc" it's not

    var consenP = (0, _parsers.manyChars1)((0, _parsers.pchar)('a')).bind(function (as) {
        //debugger;
        var char = as.charAt(0);
        var times = as.length;

        return (0, _parsers.manyChars)((0, _parsers.pchar)('b'), times).andThen((0, _parsers.manyChars)((0, _parsers.pchar)('c'), times)).fmap(function (_ref) {
            var _ref2 = _slicedToArray(_ref, 2),
                bs = _ref2[0],
                cs = _ref2[1];

            return [as, bs, cs];
        });
    });

    console.log('\n04_context_sensitive.js');
    console.log('Using a very sophisticated bound parser');

    logToScreen('abc', consenP);
    logToScreen('aaabbbccc', consenP);
    logToScreen('abbc', consenP);

    function logToScreen(str, parser) {
        var result = parser.run(str);
        var outcome = result.isSuccess ? result.value[0].toString() : 'Failure';
        console.log('"' + str + '" --> ' + outcome);
    }
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2V4YW1wbGVzLzA0X2NvbnRleHRfc2Vuc2l0aXZlLmpzIl0sIm5hbWVzIjpbImNvbnNlblAiLCJiaW5kIiwiY2hhciIsImFzIiwiY2hhckF0IiwidGltZXMiLCJsZW5ndGgiLCJhbmRUaGVuIiwiZm1hcCIsImJzIiwiY3MiLCJjb25zb2xlIiwibG9nIiwibG9nVG9TY3JlZW4iLCJzdHIiLCJwYXJzZXIiLCJyZXN1bHQiLCJydW4iLCJvdXRjb21lIiwiaXNTdWNjZXNzIiwidmFsdWUiLCJ0b1N0cmluZyJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFpREE7O0FBRUE7QUFDQTtBQUNBOztBQUVBLFFBQU1BLFVBQVUseUJBQVcsb0JBQU0sR0FBTixDQUFYLEVBQ1hDLElBRFcsQ0FDTixjQUFNO0FBQUM7QUFDVCxZQUFNQyxPQUFPQyxHQUFHQyxNQUFILENBQVUsQ0FBVixDQUFiO0FBQ0EsWUFBTUMsUUFBUUYsR0FBR0csTUFBakI7O0FBRUEsZUFBTyx3QkFBVSxvQkFBTSxHQUFOLENBQVYsRUFBc0JELEtBQXRCLEVBQ0ZFLE9BREUsQ0FDTSx3QkFBVSxvQkFBTSxHQUFOLENBQVYsRUFBc0JGLEtBQXRCLENBRE4sRUFFRkcsSUFGRSxDQUVHO0FBQUE7QUFBQSxnQkFBRUMsRUFBRjtBQUFBLGdCQUFNQyxFQUFOOztBQUFBLG1CQUFjLENBQUNQLEVBQUQsRUFBS00sRUFBTCxFQUFTQyxFQUFULENBQWQ7QUFBQSxTQUZILENBQVA7QUFHSCxLQVJXLENBQWhCOztBQVVBQyxZQUFRQyxHQUFSLENBQVksMkJBQVo7QUFDQUQsWUFBUUMsR0FBUixDQUFZLHlDQUFaOztBQUVBQyxnQkFBWSxLQUFaLEVBQW1CYixPQUFuQjtBQUNBYSxnQkFBWSxXQUFaLEVBQXlCYixPQUF6QjtBQUNBYSxnQkFBWSxNQUFaLEVBQW9CYixPQUFwQjs7QUFFQSxhQUFTYSxXQUFULENBQXFCQyxHQUFyQixFQUEwQkMsTUFBMUIsRUFBa0M7QUFDOUIsWUFBTUMsU0FBU0QsT0FBT0UsR0FBUCxDQUFXSCxHQUFYLENBQWY7QUFDQSxZQUFNSSxVQUFXRixPQUFPRyxTQUFSLEdBQXFCSCxPQUFPSSxLQUFQLENBQWEsQ0FBYixFQUFnQkMsUUFBaEIsRUFBckIsR0FBa0QsU0FBbEU7QUFDQVYsZ0JBQVFDLEdBQVIsQ0FBWSxNQUFNRSxHQUFOLEdBQVksUUFBWixHQUF1QkksT0FBbkM7QUFDSCIsImZpbGUiOiIwNF9jb250ZXh0X3NlbnNpdGl2ZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vIGNmci4gaHR0cHM6Ly9naXRodWIuY29tL2dhYnJpZWxlbGFuYS9wYWNvL2Jsb2IvbWFzdGVyL2V4YW1wbGVzLzA0X2NvbnRleHRfc2Vuc2l0aXZlLmV4c1xuXG5pbXBvcnQge1xuICAgIEpWYWx1ZSxcbiAgICBUdXBsZSxcbn0gZnJvbSAnY2xhc3Nlcyc7XG5pbXBvcnQge1xuICAgIFZhbGlkYXRpb24sXG59IGZyb20gJ3ZhbGlkYXRpb24nO1xuaW1wb3J0IHtcbiAgICBwYXJzZXIsXG4gICAgY2hhclBhcnNlcixcbiAgICBkaWdpdFBhcnNlcixcbiAgICBwcmVkaWNhdGVCYXNlZFBhcnNlcixcbiAgICBwY2hhcixcbiAgICBwZGlnaXQsXG4gICAgYW5kVGhlbixcbiAgICBvckVsc2UsXG4gICAgY2hvaWNlLFxuICAgIGFueU9mLFxuICAgIGZtYXAsXG4gICAgcmV0dXJuUCxcbiAgICBhcHBseVAsXG4gICAgbGlmdDIsXG4gICAgc2VxdWVuY2VQLFxuICAgIHNlcXVlbmNlUDIsXG4gICAgcHN0cmluZyxcbiAgICB6ZXJvT3JNb3JlLFxuICAgIG1hbnksXG4gICAgbWFueTEsXG4gICAgbWFueUNoYXJzLFxuICAgIG1hbnlDaGFyczEsXG4gICAgb3B0LFxuICAgIG9wdEJvb2ssXG4gICAgZGlzY2FyZEZpcnN0LFxuICAgIGRpc2NhcmRTZWNvbmQsXG4gICAgYmV0d2VlbixcbiAgICBiZXR3ZWVuUGFyZW5zLFxuICAgIHNlcEJ5MSxcbiAgICBsb3dlcmNhc2VQLFxuICAgIHVwcGVyY2FzZVAsXG4gICAgbGV0dGVyUCxcbiAgICBkaWdpdFAsXG4gICAgd2hpdGVQLFxuICAgIHRhcFAsXG4gICAgbG9nUCxcbiAgICBwd29yZCxcbn0gZnJvbSAncGFyc2Vycyc7XG5cbi8vIFRoZSBjbGFzc2ljYWwgZXhhbXBsZSBvZiBjb250ZXh0IHNlbnNpdGl2ZSBncmFtbWFycyBpczogYXtufWJ7bn1je259XG5cbi8vIFwiYVwiIHJlcGVhdGVkIG4gdGltZXMsIGZvbGxvd2VkIGJ5IFwiYlwiIHJlcGVhdGVkIG4gdGltZXMsIGZvbGxvd2VkIGJ5IFwiY1wiXG4vLyByZXBlYXRlZCBuIHRpbWVzLCB3aGVyZSBuIGlzIGFsd2F5cyB0aGUgc2FtZSBudW1iZXIuIFNvIFwiYWJjXCIgaXQncyBvayxcbi8vIFwiYWFhYmJiY2NjXCIgaXQncyBvaywgXCJhYmJjXCIgaXQncyBub3RcblxuY29uc3QgY29uc2VuUCA9IG1hbnlDaGFyczEocGNoYXIoJ2EnKSlcbiAgICAuYmluZChhcyA9PiB7Ly9kZWJ1Z2dlcjtcbiAgICAgICAgY29uc3QgY2hhciA9IGFzLmNoYXJBdCgwKTtcbiAgICAgICAgY29uc3QgdGltZXMgPSBhcy5sZW5ndGg7XG5cbiAgICAgICAgcmV0dXJuIG1hbnlDaGFycyhwY2hhcignYicpLCB0aW1lcylcbiAgICAgICAgICAgIC5hbmRUaGVuKG1hbnlDaGFycyhwY2hhcignYycpLCB0aW1lcykpXG4gICAgICAgICAgICAuZm1hcCgoW2JzLCBjc10pID0+IFthcywgYnMsIGNzXSk7XG4gICAgfSk7XG5cbmNvbnNvbGUubG9nKCdcXG4wNF9jb250ZXh0X3NlbnNpdGl2ZS5qcycpO1xuY29uc29sZS5sb2coJ1VzaW5nIGEgdmVyeSBzb3BoaXN0aWNhdGVkIGJvdW5kIHBhcnNlcicpO1xuXG5sb2dUb1NjcmVlbignYWJjJywgY29uc2VuUCk7XG5sb2dUb1NjcmVlbignYWFhYmJiY2NjJywgY29uc2VuUCk7XG5sb2dUb1NjcmVlbignYWJiYycsIGNvbnNlblApO1xuXG5mdW5jdGlvbiBsb2dUb1NjcmVlbihzdHIsIHBhcnNlcikge1xuICAgIGNvbnN0IHJlc3VsdCA9IHBhcnNlci5ydW4oc3RyKTtcbiAgICBjb25zdCBvdXRjb21lID0gKHJlc3VsdC5pc1N1Y2Nlc3MpID8gcmVzdWx0LnZhbHVlWzBdLnRvU3RyaW5nKCkgOiAnRmFpbHVyZSc7XG4gICAgY29uc29sZS5sb2coJ1wiJyArIHN0ciArICdcIiAtLT4gJyArIG91dGNvbWUpO1xufVxuIl19