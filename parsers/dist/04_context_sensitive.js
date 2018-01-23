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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2V4YW1wbGVzLzA0X2NvbnRleHRfc2Vuc2l0aXZlLmpzIl0sIm5hbWVzIjpbImNvbnNlblAiLCJiaW5kIiwiY2hhciIsImFzIiwiY2hhckF0IiwidGltZXMiLCJsZW5ndGgiLCJhbmRUaGVuIiwiZm1hcCIsImJzIiwiY3MiLCJjb25zb2xlIiwibG9nIiwibG9nVG9TY3JlZW4iLCJzdHIiLCJwYXJzZXIiLCJyZXN1bHQiLCJydW4iLCJvdXRjb21lIiwiaXNTdWNjZXNzIiwidmFsdWUiLCJ0b1N0cmluZyJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUErQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBLFFBQU1BLFVBQVUseUJBQVcsb0JBQU0sR0FBTixDQUFYLEVBQ1hDLElBRFcsQ0FDTixjQUFNO0FBQUM7QUFDVCxZQUFNQyxPQUFPQyxHQUFHQyxNQUFILENBQVUsQ0FBVixDQUFiO0FBQ0EsWUFBTUMsUUFBUUYsR0FBR0csTUFBakI7O0FBRUEsZUFBTyx3QkFBVSxvQkFBTSxHQUFOLENBQVYsRUFBc0JELEtBQXRCLEVBQ0ZFLE9BREUsQ0FDTSx3QkFBVSxvQkFBTSxHQUFOLENBQVYsRUFBc0JGLEtBQXRCLENBRE4sRUFFRkcsSUFGRSxDQUVHO0FBQUE7QUFBQSxnQkFBRUMsRUFBRjtBQUFBLGdCQUFNQyxFQUFOOztBQUFBLG1CQUFjLENBQUNQLEVBQUQsRUFBS00sRUFBTCxFQUFTQyxFQUFULENBQWQ7QUFBQSxTQUZILENBQVA7QUFHSCxLQVJXLENBQWhCOztBQVVBQyxZQUFRQyxHQUFSLENBQVksMkJBQVo7QUFDQUQsWUFBUUMsR0FBUixDQUFZLHlDQUFaOztBQUVBQyxnQkFBWSxLQUFaLEVBQW1CYixPQUFuQjtBQUNBYSxnQkFBWSxXQUFaLEVBQXlCYixPQUF6QjtBQUNBYSxnQkFBWSxNQUFaLEVBQW9CYixPQUFwQjs7QUFFQSxhQUFTYSxXQUFULENBQXFCQyxHQUFyQixFQUEwQkMsTUFBMUIsRUFBa0M7QUFDOUIsWUFBTUMsU0FBU0QsT0FBT0UsR0FBUCxDQUFXSCxHQUFYLENBQWY7QUFDQSxZQUFNSSxVQUFXRixPQUFPRyxTQUFSLEdBQXFCSCxPQUFPSSxLQUFQLENBQWEsQ0FBYixFQUFnQkMsUUFBaEIsRUFBckIsR0FBa0QsU0FBbEU7QUFDQVYsZ0JBQVFDLEdBQVIsQ0FBWSxNQUFNRSxHQUFOLEdBQVksUUFBWixHQUF1QkksT0FBbkM7QUFDSCIsImZpbGUiOiIwNF9jb250ZXh0X3NlbnNpdGl2ZS5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG4gICAgSlZhbHVlLFxuICAgIFR1cGxlLFxufSBmcm9tICdjbGFzc2VzJztcbmltcG9ydCB7XG4gICAgVmFsaWRhdGlvbixcbn0gZnJvbSAndmFsaWRhdGlvbic7XG5pbXBvcnQge1xuICAgIHBhcnNlcixcbiAgICBjaGFyUGFyc2VyLFxuICAgIGRpZ2l0UGFyc2VyLFxuICAgIHByZWRpY2F0ZUJhc2VkUGFyc2VyLFxuICAgIHBjaGFyLFxuICAgIHBkaWdpdCxcbiAgICBhbmRUaGVuLFxuICAgIG9yRWxzZSxcbiAgICBjaG9pY2UsXG4gICAgYW55T2YsXG4gICAgZm1hcCxcbiAgICByZXR1cm5QLFxuICAgIGFwcGx5UCxcbiAgICBsaWZ0MixcbiAgICBzZXF1ZW5jZVAsXG4gICAgc2VxdWVuY2VQMixcbiAgICBwc3RyaW5nLFxuICAgIHplcm9Pck1vcmUsXG4gICAgbWFueSxcbiAgICBtYW55MSxcbiAgICBtYW55Q2hhcnMsXG4gICAgbWFueUNoYXJzMSxcbiAgICBvcHQsXG4gICAgb3B0Qm9vayxcbiAgICBkaXNjYXJkRmlyc3QsXG4gICAgZGlzY2FyZFNlY29uZCxcbiAgICBiZXR3ZWVuLFxuICAgIGJldHdlZW5QYXJlbnMsXG4gICAgc2VwQnkxLFxuICAgIGxvd2VyY2FzZVAsXG4gICAgdXBwZXJjYXNlUCxcbiAgICBsZXR0ZXJQLFxuICAgIGRpZ2l0UCxcbiAgICB3aGl0ZVAsXG4gICAgdGFwUCxcbiAgICBsb2dQLFxuICAgIHB3b3JkLFxufSBmcm9tICdwYXJzZXJzJztcblxuLy8gVGhlIGNsYXNzaWNhbCBleGFtcGxlIG9mIGNvbnRleHQgc2Vuc2l0aXZlIGdyYW1tYXJzIGlzOiBhe259YntufWN7bn1cblxuLy8gXCJhXCIgcmVwZWF0ZWQgbiB0aW1lcywgZm9sbG93ZWQgYnkgXCJiXCIgcmVwZWF0ZWQgbiB0aW1lcywgZm9sbG93ZWQgYnkgXCJjXCJcbi8vIHJlcGVhdGVkIG4gdGltZXMsIHdoZXJlIG4gaXMgYWx3YXlzIHRoZSBzYW1lIG51bWJlci4gU28gXCJhYmNcIiBpdCdzIG9rLFxuLy8gXCJhYWFiYmJjY2NcIiBpdCdzIG9rLCBcImFiYmNcIiBpdCdzIG5vdFxuXG5jb25zdCBjb25zZW5QID0gbWFueUNoYXJzMShwY2hhcignYScpKVxuICAgIC5iaW5kKGFzID0+IHsvL2RlYnVnZ2VyO1xuICAgICAgICBjb25zdCBjaGFyID0gYXMuY2hhckF0KDApO1xuICAgICAgICBjb25zdCB0aW1lcyA9IGFzLmxlbmd0aDtcblxuICAgICAgICByZXR1cm4gbWFueUNoYXJzKHBjaGFyKCdiJyksIHRpbWVzKVxuICAgICAgICAgICAgLmFuZFRoZW4obWFueUNoYXJzKHBjaGFyKCdjJyksIHRpbWVzKSlcbiAgICAgICAgICAgIC5mbWFwKChbYnMsIGNzXSkgPT4gW2FzLCBicywgY3NdKTtcbiAgICB9KTtcblxuY29uc29sZS5sb2coJ1xcbjA0X2NvbnRleHRfc2Vuc2l0aXZlLmpzJyk7XG5jb25zb2xlLmxvZygnVXNpbmcgYSB2ZXJ5IHNvcGhpc3RpY2F0ZWQgYm91bmQgcGFyc2VyJyk7XG5cbmxvZ1RvU2NyZWVuKCdhYmMnLCBjb25zZW5QKTtcbmxvZ1RvU2NyZWVuKCdhYWFiYmJjY2MnLCBjb25zZW5QKTtcbmxvZ1RvU2NyZWVuKCdhYmJjJywgY29uc2VuUCk7XG5cbmZ1bmN0aW9uIGxvZ1RvU2NyZWVuKHN0ciwgcGFyc2VyKSB7XG4gICAgY29uc3QgcmVzdWx0ID0gcGFyc2VyLnJ1bihzdHIpO1xuICAgIGNvbnN0IG91dGNvbWUgPSAocmVzdWx0LmlzU3VjY2VzcykgPyByZXN1bHQudmFsdWVbMF0udG9TdHJpbmcoKSA6ICdGYWlsdXJlJztcbiAgICBjb25zb2xlLmxvZygnXCInICsgc3RyICsgJ1wiIC0tPiAnICsgb3V0Y29tZSk7XG59XG4iXX0=