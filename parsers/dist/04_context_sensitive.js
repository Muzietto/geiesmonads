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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2V4YW1wbGVzLzA0X2NvbnRleHRfc2Vuc2l0aXZlLmpzIl0sIm5hbWVzIjpbImNvbnNlblAiLCJiaW5kIiwiY2hhciIsImFzIiwiY2hhckF0IiwidGltZXMiLCJsZW5ndGgiLCJhbmRUaGVuIiwiZm1hcCIsImJzIiwiY3MiLCJjb25zb2xlIiwibG9nIiwibG9nVG9TY3JlZW4iLCJzdHIiLCJwYXJzZXIiLCJyZXN1bHQiLCJydW4iLCJvdXRjb21lIiwiaXNTdWNjZXNzIiwidmFsdWUiLCJ0b1N0cmluZyJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFpREE7O0FBRUE7QUFDQTtBQUNBOztBQUVBLFFBQU1BLFVBQVUseUJBQVcsb0JBQU0sR0FBTixDQUFYLEVBQ1hDLElBRFcsQ0FDTixjQUFNO0FBQUM7QUFDVCxZQUFNQyxPQUFPQyxHQUFHQyxNQUFILENBQVUsQ0FBVixDQUFiO0FBQ0EsWUFBTUMsUUFBUUYsR0FBR0csTUFBakI7O0FBRUEsZUFBTyx3QkFBVSxvQkFBTSxHQUFOLENBQVYsRUFBc0JELEtBQXRCLEVBQ0ZFLE9BREUsQ0FDTSx3QkFBVSxvQkFBTSxHQUFOLENBQVYsRUFBc0JGLEtBQXRCLENBRE4sRUFFRkcsSUFGRSxDQUVHO0FBQUE7QUFBQSxnQkFBRUMsRUFBRjtBQUFBLGdCQUFNQyxFQUFOOztBQUFBLG1CQUFjLENBQUNQLEVBQUQsRUFBS00sRUFBTCxFQUFTQyxFQUFULENBQWQ7QUFBQSxTQUZILENBQVA7QUFHSCxLQVJXLENBQWhCOztBQVVBQyxZQUFRQyxHQUFSLENBQVksMkJBQVo7QUFDQUQsWUFBUUMsR0FBUixDQUFZLHlDQUFaOztBQUVBQyxnQkFBWSxLQUFaLEVBQW1CYixPQUFuQjtBQUNBYSxnQkFBWSxXQUFaLEVBQXlCYixPQUF6QjtBQUNBYSxnQkFBWSxNQUFaLEVBQW9CYixPQUFwQjs7QUFFQSxhQUFTYSxXQUFULENBQXFCQyxHQUFyQixFQUEwQkMsTUFBMUIsRUFBa0M7QUFDOUIsWUFBTUMsU0FBU0QsT0FBT0UsR0FBUCxDQUFXSCxHQUFYLENBQWY7QUFDQSxZQUFNSSxVQUFXRixPQUFPRyxTQUFSLEdBQXFCSCxPQUFPSSxLQUFQLENBQWEsQ0FBYixFQUFnQkMsUUFBaEIsRUFBckIsR0FBa0QsU0FBbEU7QUFDQVYsZ0JBQVFDLEdBQVIsQ0FBWSxNQUFNRSxHQUFOLEdBQVksUUFBWixHQUF1QkksT0FBbkM7QUFDSCIsImZpbGUiOiIwNF9jb250ZXh0X3NlbnNpdGl2ZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vIGNmci4gaHR0cHM6Ly9naXRodWIuY29tL2dhYnJpZWxlbGFuYS9wYWNvL2Jsb2IvbWFzdGVyL2V4YW1wbGVzLzA0X2NvbnRleHRfc2Vuc2l0aXZlLmV4c1xyXG5cclxuaW1wb3J0IHtcclxuICAgIEpWYWx1ZSxcclxuICAgIFR1cGxlLFxyXG59IGZyb20gJ2NsYXNzZXMnO1xyXG5pbXBvcnQge1xyXG4gICAgVmFsaWRhdGlvbixcclxufSBmcm9tICd2YWxpZGF0aW9uJztcclxuaW1wb3J0IHtcclxuICAgIHBhcnNlcixcclxuICAgIGNoYXJQYXJzZXIsXHJcbiAgICBkaWdpdFBhcnNlcixcclxuICAgIHByZWRpY2F0ZUJhc2VkUGFyc2VyLFxyXG4gICAgcGNoYXIsXHJcbiAgICBwZGlnaXQsXHJcbiAgICBhbmRUaGVuLFxyXG4gICAgb3JFbHNlLFxyXG4gICAgY2hvaWNlLFxyXG4gICAgYW55T2YsXHJcbiAgICBmbWFwLFxyXG4gICAgcmV0dXJuUCxcclxuICAgIGFwcGx5UCxcclxuICAgIGxpZnQyLFxyXG4gICAgc2VxdWVuY2VQLFxyXG4gICAgc2VxdWVuY2VQMixcclxuICAgIHBzdHJpbmcsXHJcbiAgICB6ZXJvT3JNb3JlLFxyXG4gICAgbWFueSxcclxuICAgIG1hbnkxLFxyXG4gICAgbWFueUNoYXJzLFxyXG4gICAgbWFueUNoYXJzMSxcclxuICAgIG9wdCxcclxuICAgIG9wdEJvb2ssXHJcbiAgICBkaXNjYXJkRmlyc3QsXHJcbiAgICBkaXNjYXJkU2Vjb25kLFxyXG4gICAgYmV0d2VlbixcclxuICAgIGJldHdlZW5QYXJlbnMsXHJcbiAgICBzZXBCeTEsXHJcbiAgICBsb3dlcmNhc2VQLFxyXG4gICAgdXBwZXJjYXNlUCxcclxuICAgIGxldHRlclAsXHJcbiAgICBkaWdpdFAsXHJcbiAgICB3aGl0ZVAsXHJcbiAgICB0YXBQLFxyXG4gICAgbG9nUCxcclxuICAgIHB3b3JkLFxyXG59IGZyb20gJ3BhcnNlcnMnO1xyXG5cclxuLy8gVGhlIGNsYXNzaWNhbCBleGFtcGxlIG9mIGNvbnRleHQgc2Vuc2l0aXZlIGdyYW1tYXJzIGlzOiBhe259YntufWN7bn1cclxuXHJcbi8vIFwiYVwiIHJlcGVhdGVkIG4gdGltZXMsIGZvbGxvd2VkIGJ5IFwiYlwiIHJlcGVhdGVkIG4gdGltZXMsIGZvbGxvd2VkIGJ5IFwiY1wiXHJcbi8vIHJlcGVhdGVkIG4gdGltZXMsIHdoZXJlIG4gaXMgYWx3YXlzIHRoZSBzYW1lIG51bWJlci4gU28gXCJhYmNcIiBpdCdzIG9rLFxyXG4vLyBcImFhYWJiYmNjY1wiIGl0J3Mgb2ssIFwiYWJiY1wiIGl0J3Mgbm90XHJcblxyXG5jb25zdCBjb25zZW5QID0gbWFueUNoYXJzMShwY2hhcignYScpKVxyXG4gICAgLmJpbmQoYXMgPT4gey8vZGVidWdnZXI7XHJcbiAgICAgICAgY29uc3QgY2hhciA9IGFzLmNoYXJBdCgwKTtcclxuICAgICAgICBjb25zdCB0aW1lcyA9IGFzLmxlbmd0aDtcclxuXHJcbiAgICAgICAgcmV0dXJuIG1hbnlDaGFycyhwY2hhcignYicpLCB0aW1lcylcclxuICAgICAgICAgICAgLmFuZFRoZW4obWFueUNoYXJzKHBjaGFyKCdjJyksIHRpbWVzKSlcclxuICAgICAgICAgICAgLmZtYXAoKFticywgY3NdKSA9PiBbYXMsIGJzLCBjc10pO1xyXG4gICAgfSk7XHJcblxyXG5jb25zb2xlLmxvZygnXFxuMDRfY29udGV4dF9zZW5zaXRpdmUuanMnKTtcclxuY29uc29sZS5sb2coJ1VzaW5nIGEgdmVyeSBzb3BoaXN0aWNhdGVkIGJvdW5kIHBhcnNlcicpO1xyXG5cclxubG9nVG9TY3JlZW4oJ2FiYycsIGNvbnNlblApO1xyXG5sb2dUb1NjcmVlbignYWFhYmJiY2NjJywgY29uc2VuUCk7XHJcbmxvZ1RvU2NyZWVuKCdhYmJjJywgY29uc2VuUCk7XHJcblxyXG5mdW5jdGlvbiBsb2dUb1NjcmVlbihzdHIsIHBhcnNlcikge1xyXG4gICAgY29uc3QgcmVzdWx0ID0gcGFyc2VyLnJ1bihzdHIpO1xyXG4gICAgY29uc3Qgb3V0Y29tZSA9IChyZXN1bHQuaXNTdWNjZXNzKSA/IHJlc3VsdC52YWx1ZVswXS50b1N0cmluZygpIDogJ0ZhaWx1cmUnO1xyXG4gICAgY29uc29sZS5sb2coJ1wiJyArIHN0ciArICdcIiAtLT4gJyArIG91dGNvbWUpO1xyXG59XHJcbiJdfQ==