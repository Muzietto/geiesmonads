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

    console.log('\n02_chemical_formulas.js');

    // # An `element` is a word beginning with one uppercase letter followed by zero
    // # or more lowercase letters
    // element = [while(uppers, 1), while(lowers)] |> join
    var elementP = _parsers.uppercaseP.andThen((0, _parsers.manyChars)(_parsers.lowercaseP)).fmap(function (_ref) {
        var _ref2 = _slicedToArray(_ref, 2),
            u = _ref2[0],
            l = _ref2[1];

        return u + l;
    });

    console.log('Using uppercaseP.andThen(manyChars(lowercaseP)).fmap(([u, l]) => u + l)');
    logToScreen('He', elementP);
    logToScreen('H', elementP);

    // # A `quantity` is a number greater than zero
    // quantity = while(digits, {:at_least, 1})
    //            |> bind(&String.to_integer/1)
    //            |> only_if(&(&1 > 0))
    var integerP = (0, _parsers.manyChars1)(_parsers.digitP).fmap(function (str) {
        return parseInt(str, 10);
    });

    console.log('Using manyChars1(digitP).fmap(str => parseInt(str, 10))');
    logToScreen('123', integerP);
    logToScreen('1', integerP);

    // # A `reference` is an element optionally followed by a quantity. If the
    // # quantity is omitted assume the value of 1 as default
    // reference = {element, maybe(quantity, default: 1)}
    var referenceP = elementP.andThen((0, _parsers.opt)(integerP)).fmap(function (_ref3) {
        var _ref4 = _slicedToArray(_ref3, 2),
            u = _ref4[0],
            l = _ref4[1];

        return l.isJust ? [u, l.value] : [u, 1];
    });

    console.log('Using elementP.andThen(opt(integerP)).fmap(([u, l]) => (l.isJust) ? [u, l.value] : [u, 1])');
    logToScreen('He123', referenceP);
    logToScreen('Ar', referenceP);

    // # A chemical formula is just one or more elements
    // formula = one_or_more(reference)
    var formulaP = (0, _parsers.many1)(referenceP);

    console.log('Using many1(elementP.andThen(opt(integerP)).fmap(([u, l]) => (l.isJust) ? [u, l.value] : [u, 1]))');

    // parse("H2O", formula) |> IO.inspect
    // # >> {:ok, [{"H", 2}, {"O", 1}]}
    logToScreen('H2O', formulaP);

    // parse("NaCl", formula) |> IO.inspect
    // # >> {:ok, [{"Na", 1}, {"Cl", 1}]}
    logToScreen('NaCl', formulaP);

    // parse("C6H5OH", formula) |> IO.inspect
    // # >> {:ok, [{"C", 6}, {"H", 5}, {"O", 1}, {"H", 1}]}
    logToScreen('C6H5OH', formulaP);

    // # Calculate molecular weight
    var atomic_weights = {
        'O': 15.9994,
        'H': 1.00794,
        'Na': 22.9897,
        'Cl': 35.4527,
        'C': 12.0107,
        'S': 32.0655
    };
    // [[C,6],[H,5],[O,1],[H,1]]

    // calculate_weight = &(&1 |> Enum.map(fn({e, q}) -> Map.fetch!(atomic_weight, e) * q end)
    //                         |> Enum.sum)
    //
    // weight = formula |> bind(calculate_weight)
    var weightP = formulaP.fmap(function (arra) {
        return arra.reduce(function (acc, _ref5) {
            var _ref6 = _slicedToArray(_ref5, 2),
                el = _ref6[0],
                qty = _ref6[1];

            return acc + atomic_weights[el] * qty;
        }, 0);
    });

    console.log('Using formulaP.fmap(arra => arra.reduce((acc, [el, qty]) => acc + atomic_weights[el] * qty, 0))');
    // parse("C6H5OH", weight) |> IO.inspect
    // # >> {:ok, 94.11124}
    logToScreen('C6H5OH', weightP);

    function logToScreen(str, parser) {
        console.log('"' + str + '" --> ' + parser.run(str).value[0].toString());
    }
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2V4YW1wbGVzLzAyX2NoZW1pY2FsX2Zvcm11bGFzLmpzIl0sIm5hbWVzIjpbImNvbnNvbGUiLCJsb2ciLCJlbGVtZW50UCIsInVwcGVyY2FzZVAiLCJhbmRUaGVuIiwibG93ZXJjYXNlUCIsImZtYXAiLCJ1IiwibCIsImxvZ1RvU2NyZWVuIiwiaW50ZWdlclAiLCJkaWdpdFAiLCJwYXJzZUludCIsInN0ciIsInJlZmVyZW5jZVAiLCJpc0p1c3QiLCJ2YWx1ZSIsImZvcm11bGFQIiwiYXRvbWljX3dlaWdodHMiLCJ3ZWlnaHRQIiwiYXJyYSIsInJlZHVjZSIsImFjYyIsImVsIiwicXR5IiwicGFyc2VyIiwicnVuIiwidG9TdHJpbmciXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBaURBQSxZQUFRQyxHQUFSLENBQVksMkJBQVo7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsUUFBTUMsV0FBV0Msb0JBQVdDLE9BQVgsQ0FBbUIsd0JBQVVDLG1CQUFWLENBQW5CLEVBQTBDQyxJQUExQyxDQUErQztBQUFBO0FBQUEsWUFBRUMsQ0FBRjtBQUFBLFlBQUtDLENBQUw7O0FBQUEsZUFBWUQsSUFBSUMsQ0FBaEI7QUFBQSxLQUEvQyxDQUFqQjs7QUFFQVIsWUFBUUMsR0FBUixDQUFZLHlFQUFaO0FBQ0FRLGdCQUFZLElBQVosRUFBa0JQLFFBQWxCO0FBQ0FPLGdCQUFZLEdBQVosRUFBaUJQLFFBQWpCOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsUUFBTVEsV0FBVyx5QkFBV0MsZUFBWCxFQUFtQkwsSUFBbkIsQ0FBd0I7QUFBQSxlQUFPTSxTQUFTQyxHQUFULEVBQWMsRUFBZCxDQUFQO0FBQUEsS0FBeEIsQ0FBakI7O0FBRUFiLFlBQVFDLEdBQVIsQ0FBWSx5REFBWjtBQUNBUSxnQkFBWSxLQUFaLEVBQW1CQyxRQUFuQjtBQUNBRCxnQkFBWSxHQUFaLEVBQWlCQyxRQUFqQjs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxRQUFNSSxhQUFhWixTQUFTRSxPQUFULENBQWlCLGtCQUFJTSxRQUFKLENBQWpCLEVBQWdDSixJQUFoQyxDQUFxQztBQUFBO0FBQUEsWUFBRUMsQ0FBRjtBQUFBLFlBQUtDLENBQUw7O0FBQUEsZUFBYUEsRUFBRU8sTUFBSCxHQUFhLENBQUNSLENBQUQsRUFBSUMsRUFBRVEsS0FBTixDQUFiLEdBQTRCLENBQUNULENBQUQsRUFBSSxDQUFKLENBQXhDO0FBQUEsS0FBckMsQ0FBbkI7O0FBRUFQLFlBQVFDLEdBQVIsQ0FBWSw0RkFBWjtBQUNBUSxnQkFBWSxPQUFaLEVBQXFCSyxVQUFyQjtBQUNBTCxnQkFBWSxJQUFaLEVBQWtCSyxVQUFsQjs7QUFFQTtBQUNBO0FBQ0EsUUFBTUcsV0FBVyxvQkFBTUgsVUFBTixDQUFqQjs7QUFFQWQsWUFBUUMsR0FBUixDQUFZLG1HQUFaOztBQUVBO0FBQ0E7QUFDQVEsZ0JBQVksS0FBWixFQUFtQlEsUUFBbkI7O0FBRUE7QUFDQTtBQUNBUixnQkFBWSxNQUFaLEVBQW9CUSxRQUFwQjs7QUFFQTtBQUNBO0FBQ0FSLGdCQUFZLFFBQVosRUFBc0JRLFFBQXRCOztBQUVBO0FBQ0EsUUFBTUMsaUJBQWlCO0FBQ25CLGFBQUssT0FEYztBQUVuQixhQUFLLE9BRmM7QUFHbkIsY0FBTSxPQUhhO0FBSW5CLGNBQU0sT0FKYTtBQUtuQixhQUFLLE9BTGM7QUFNbkIsYUFBSztBQU5jLEtBQXZCO0FBUUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxRQUFNQyxVQUFVRixTQUFTWCxJQUFULENBQWM7QUFBQSxlQUFRYyxLQUFLQyxNQUFMLENBQVksVUFBQ0MsR0FBRDtBQUFBO0FBQUEsZ0JBQU9DLEVBQVA7QUFBQSxnQkFBV0MsR0FBWDs7QUFBQSxtQkFBb0JGLE1BQU1KLGVBQWVLLEVBQWYsSUFBcUJDLEdBQS9DO0FBQUEsU0FBWixFQUFnRSxDQUFoRSxDQUFSO0FBQUEsS0FBZCxDQUFoQjs7QUFFQXhCLFlBQVFDLEdBQVIsQ0FBWSxpR0FBWjtBQUNBO0FBQ0E7QUFDQVEsZ0JBQVksUUFBWixFQUFzQlUsT0FBdEI7O0FBRUEsYUFBU1YsV0FBVCxDQUFxQkksR0FBckIsRUFBMEJZLE1BQTFCLEVBQWtDO0FBQzlCekIsZ0JBQVFDLEdBQVIsQ0FBWSxNQUFNWSxHQUFOLEdBQVksUUFBWixHQUF1QlksT0FBT0MsR0FBUCxDQUFXYixHQUFYLEVBQWdCRyxLQUFoQixDQUFzQixDQUF0QixFQUF5QlcsUUFBekIsRUFBbkM7QUFDSCIsImZpbGUiOiIwMl9jaGVtaWNhbF9mb3JtdWxhcy5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vIGNmci4gaHR0cHM6Ly9naXRodWIuY29tL2dhYnJpZWxlbGFuYS9wYWNvL2Jsb2IvbWFzdGVyL2V4YW1wbGVzLzAyX2NoZW1pY2FsX2Zvcm11bGFzLmV4c1xyXG5cclxuaW1wb3J0IHtcclxuICAgIEpWYWx1ZSxcclxuICAgIFR1cGxlLFxyXG59IGZyb20gJ2NsYXNzZXMnO1xyXG5pbXBvcnQge1xyXG4gICAgVmFsaWRhdGlvbixcclxufSBmcm9tICd2YWxpZGF0aW9uJztcclxuaW1wb3J0IHtcclxuICAgIHBhcnNlcixcclxuICAgIGNoYXJQYXJzZXIsXHJcbiAgICBkaWdpdFBhcnNlcixcclxuICAgIHByZWRpY2F0ZUJhc2VkUGFyc2VyLFxyXG4gICAgcGNoYXIsXHJcbiAgICBwZGlnaXQsXHJcbiAgICBhbmRUaGVuLFxyXG4gICAgb3JFbHNlLFxyXG4gICAgY2hvaWNlLFxyXG4gICAgYW55T2YsXHJcbiAgICBmbWFwLFxyXG4gICAgcmV0dXJuUCxcclxuICAgIGFwcGx5UCxcclxuICAgIGxpZnQyLFxyXG4gICAgc2VxdWVuY2VQLFxyXG4gICAgc2VxdWVuY2VQMixcclxuICAgIHBzdHJpbmcsXHJcbiAgICB6ZXJvT3JNb3JlLFxyXG4gICAgbWFueSxcclxuICAgIG1hbnkxLFxyXG4gICAgbWFueUNoYXJzLFxyXG4gICAgbWFueUNoYXJzMSxcclxuICAgIG9wdCxcclxuICAgIG9wdEJvb2ssXHJcbiAgICBkaXNjYXJkRmlyc3QsXHJcbiAgICBkaXNjYXJkU2Vjb25kLFxyXG4gICAgYmV0d2VlbixcclxuICAgIGJldHdlZW5QYXJlbnMsXHJcbiAgICBzZXBCeTEsXHJcbiAgICBsb3dlcmNhc2VQLFxyXG4gICAgdXBwZXJjYXNlUCxcclxuICAgIGxldHRlclAsXHJcbiAgICBkaWdpdFAsXHJcbiAgICB3aGl0ZVAsXHJcbiAgICB0YXBQLFxyXG4gICAgbG9nUCxcclxuICAgIHB3b3JkLFxyXG59IGZyb20gJ3BhcnNlcnMnO1xyXG5cclxuY29uc29sZS5sb2coJ1xcbjAyX2NoZW1pY2FsX2Zvcm11bGFzLmpzJyk7XHJcblxyXG4vLyAjIEFuIGBlbGVtZW50YCBpcyBhIHdvcmQgYmVnaW5uaW5nIHdpdGggb25lIHVwcGVyY2FzZSBsZXR0ZXIgZm9sbG93ZWQgYnkgemVyb1xyXG4vLyAjIG9yIG1vcmUgbG93ZXJjYXNlIGxldHRlcnNcclxuLy8gZWxlbWVudCA9IFt3aGlsZSh1cHBlcnMsIDEpLCB3aGlsZShsb3dlcnMpXSB8PiBqb2luXHJcbmNvbnN0IGVsZW1lbnRQID0gdXBwZXJjYXNlUC5hbmRUaGVuKG1hbnlDaGFycyhsb3dlcmNhc2VQKSkuZm1hcCgoW3UsIGxdKSA9PiB1ICsgbCk7XHJcblxyXG5jb25zb2xlLmxvZygnVXNpbmcgdXBwZXJjYXNlUC5hbmRUaGVuKG1hbnlDaGFycyhsb3dlcmNhc2VQKSkuZm1hcCgoW3UsIGxdKSA9PiB1ICsgbCknKTtcclxubG9nVG9TY3JlZW4oJ0hlJywgZWxlbWVudFApO1xyXG5sb2dUb1NjcmVlbignSCcsIGVsZW1lbnRQKTtcclxuXHJcbi8vICMgQSBgcXVhbnRpdHlgIGlzIGEgbnVtYmVyIGdyZWF0ZXIgdGhhbiB6ZXJvXHJcbi8vIHF1YW50aXR5ID0gd2hpbGUoZGlnaXRzLCB7OmF0X2xlYXN0LCAxfSlcclxuLy8gICAgICAgICAgICB8PiBiaW5kKCZTdHJpbmcudG9faW50ZWdlci8xKVxyXG4vLyAgICAgICAgICAgIHw+IG9ubHlfaWYoJigmMSA+IDApKVxyXG5jb25zdCBpbnRlZ2VyUCA9IG1hbnlDaGFyczEoZGlnaXRQKS5mbWFwKHN0ciA9PiBwYXJzZUludChzdHIsIDEwKSk7XHJcblxyXG5jb25zb2xlLmxvZygnVXNpbmcgbWFueUNoYXJzMShkaWdpdFApLmZtYXAoc3RyID0+IHBhcnNlSW50KHN0ciwgMTApKScpO1xyXG5sb2dUb1NjcmVlbignMTIzJywgaW50ZWdlclApO1xyXG5sb2dUb1NjcmVlbignMScsIGludGVnZXJQKTtcclxuXHJcbi8vICMgQSBgcmVmZXJlbmNlYCBpcyBhbiBlbGVtZW50IG9wdGlvbmFsbHkgZm9sbG93ZWQgYnkgYSBxdWFudGl0eS4gSWYgdGhlXHJcbi8vICMgcXVhbnRpdHkgaXMgb21pdHRlZCBhc3N1bWUgdGhlIHZhbHVlIG9mIDEgYXMgZGVmYXVsdFxyXG4vLyByZWZlcmVuY2UgPSB7ZWxlbWVudCwgbWF5YmUocXVhbnRpdHksIGRlZmF1bHQ6IDEpfVxyXG5jb25zdCByZWZlcmVuY2VQID0gZWxlbWVudFAuYW5kVGhlbihvcHQoaW50ZWdlclApKS5mbWFwKChbdSwgbF0pID0+IChsLmlzSnVzdCkgPyBbdSwgbC52YWx1ZV0gOiBbdSwgMV0pO1xyXG5cclxuY29uc29sZS5sb2coJ1VzaW5nIGVsZW1lbnRQLmFuZFRoZW4ob3B0KGludGVnZXJQKSkuZm1hcCgoW3UsIGxdKSA9PiAobC5pc0p1c3QpID8gW3UsIGwudmFsdWVdIDogW3UsIDFdKScpO1xyXG5sb2dUb1NjcmVlbignSGUxMjMnLCByZWZlcmVuY2VQKTtcclxubG9nVG9TY3JlZW4oJ0FyJywgcmVmZXJlbmNlUCk7XHJcblxyXG4vLyAjIEEgY2hlbWljYWwgZm9ybXVsYSBpcyBqdXN0IG9uZSBvciBtb3JlIGVsZW1lbnRzXHJcbi8vIGZvcm11bGEgPSBvbmVfb3JfbW9yZShyZWZlcmVuY2UpXHJcbmNvbnN0IGZvcm11bGFQID0gbWFueTEocmVmZXJlbmNlUCk7XHJcblxyXG5jb25zb2xlLmxvZygnVXNpbmcgbWFueTEoZWxlbWVudFAuYW5kVGhlbihvcHQoaW50ZWdlclApKS5mbWFwKChbdSwgbF0pID0+IChsLmlzSnVzdCkgPyBbdSwgbC52YWx1ZV0gOiBbdSwgMV0pKScpO1xyXG5cclxuLy8gcGFyc2UoXCJIMk9cIiwgZm9ybXVsYSkgfD4gSU8uaW5zcGVjdFxyXG4vLyAjID4+IHs6b2ssIFt7XCJIXCIsIDJ9LCB7XCJPXCIsIDF9XX1cclxubG9nVG9TY3JlZW4oJ0gyTycsIGZvcm11bGFQKTtcclxuXHJcbi8vIHBhcnNlKFwiTmFDbFwiLCBmb3JtdWxhKSB8PiBJTy5pbnNwZWN0XHJcbi8vICMgPj4gezpvaywgW3tcIk5hXCIsIDF9LCB7XCJDbFwiLCAxfV19XHJcbmxvZ1RvU2NyZWVuKCdOYUNsJywgZm9ybXVsYVApO1xyXG5cclxuLy8gcGFyc2UoXCJDNkg1T0hcIiwgZm9ybXVsYSkgfD4gSU8uaW5zcGVjdFxyXG4vLyAjID4+IHs6b2ssIFt7XCJDXCIsIDZ9LCB7XCJIXCIsIDV9LCB7XCJPXCIsIDF9LCB7XCJIXCIsIDF9XX1cclxubG9nVG9TY3JlZW4oJ0M2SDVPSCcsIGZvcm11bGFQKTtcclxuXHJcbi8vICMgQ2FsY3VsYXRlIG1vbGVjdWxhciB3ZWlnaHRcclxuY29uc3QgYXRvbWljX3dlaWdodHMgPSB7XHJcbiAgICAnTyc6IDE1Ljk5OTQsXHJcbiAgICAnSCc6IDEuMDA3OTQsXHJcbiAgICAnTmEnOiAyMi45ODk3LFxyXG4gICAgJ0NsJzogMzUuNDUyNyxcclxuICAgICdDJzogMTIuMDEwNyxcclxuICAgICdTJzogMzIuMDY1NSxcclxufTtcclxuLy8gW1tDLDZdLFtILDVdLFtPLDFdLFtILDFdXVxyXG5cclxuLy8gY2FsY3VsYXRlX3dlaWdodCA9ICYoJjEgfD4gRW51bS5tYXAoZm4oe2UsIHF9KSAtPiBNYXAuZmV0Y2ghKGF0b21pY193ZWlnaHQsIGUpICogcSBlbmQpXHJcbi8vICAgICAgICAgICAgICAgICAgICAgICAgIHw+IEVudW0uc3VtKVxyXG4vL1xyXG4vLyB3ZWlnaHQgPSBmb3JtdWxhIHw+IGJpbmQoY2FsY3VsYXRlX3dlaWdodClcclxuY29uc3Qgd2VpZ2h0UCA9IGZvcm11bGFQLmZtYXAoYXJyYSA9PiBhcnJhLnJlZHVjZSgoYWNjLCBbZWwsIHF0eV0pID0+IGFjYyArIGF0b21pY193ZWlnaHRzW2VsXSAqIHF0eSwgMCkpO1xyXG5cclxuY29uc29sZS5sb2coJ1VzaW5nIGZvcm11bGFQLmZtYXAoYXJyYSA9PiBhcnJhLnJlZHVjZSgoYWNjLCBbZWwsIHF0eV0pID0+IGFjYyArIGF0b21pY193ZWlnaHRzW2VsXSAqIHF0eSwgMCkpJyk7XHJcbi8vIHBhcnNlKFwiQzZINU9IXCIsIHdlaWdodCkgfD4gSU8uaW5zcGVjdFxyXG4vLyAjID4+IHs6b2ssIDk0LjExMTI0fVxyXG5sb2dUb1NjcmVlbignQzZINU9IJywgd2VpZ2h0UCk7XHJcblxyXG5mdW5jdGlvbiBsb2dUb1NjcmVlbihzdHIsIHBhcnNlcikge1xyXG4gICAgY29uc29sZS5sb2coJ1wiJyArIHN0ciArICdcIiAtLT4gJyArIHBhcnNlci5ydW4oc3RyKS52YWx1ZVswXS50b1N0cmluZygpKTtcclxufVxyXG4iXX0=