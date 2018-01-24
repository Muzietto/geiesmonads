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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2V4YW1wbGVzLzAyX2NoZW1pY2FsX2Zvcm11bGFzLmpzIl0sIm5hbWVzIjpbImNvbnNvbGUiLCJsb2ciLCJlbGVtZW50UCIsImFuZFRoZW4iLCJmbWFwIiwidSIsImwiLCJsb2dUb1NjcmVlbiIsImludGVnZXJQIiwicGFyc2VJbnQiLCJzdHIiLCJyZWZlcmVuY2VQIiwiaXNKdXN0IiwidmFsdWUiLCJmb3JtdWxhUCIsImF0b21pY193ZWlnaHRzIiwid2VpZ2h0UCIsImFycmEiLCJyZWR1Y2UiLCJhY2MiLCJlbCIsInF0eSIsInBhcnNlciIsInJ1biIsInRvU3RyaW5nIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQWlEQUEsWUFBUUMsR0FBUixDQUFZLDJCQUFaOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFFBQU1DLFdBQVcsb0JBQVdDLE9BQVgsQ0FBbUIsNENBQW5CLEVBQTBDQyxJQUExQyxDQUErQztBQUFBO0FBQUEsWUFBRUMsQ0FBRjtBQUFBLFlBQUtDLENBQUw7O0FBQUEsZUFBWUQsSUFBSUMsQ0FBaEI7QUFBQSxLQUEvQyxDQUFqQjs7QUFFQU4sWUFBUUMsR0FBUixDQUFZLHlFQUFaO0FBQ0FNLGdCQUFZLElBQVosRUFBa0JMLFFBQWxCO0FBQ0FLLGdCQUFZLEdBQVosRUFBaUJMLFFBQWpCOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsUUFBTU0sV0FBVywwQ0FBbUJKLElBQW5CLENBQXdCO0FBQUEsZUFBT0ssU0FBU0MsR0FBVCxFQUFjLEVBQWQsQ0FBUDtBQUFBLEtBQXhCLENBQWpCOztBQUVBVixZQUFRQyxHQUFSLENBQVkseURBQVo7QUFDQU0sZ0JBQVksS0FBWixFQUFtQkMsUUFBbkI7QUFDQUQsZ0JBQVksR0FBWixFQUFpQkMsUUFBakI7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsUUFBTUcsYUFBYVQsU0FBU0MsT0FBVCxDQUFpQixrQkFBSUssUUFBSixDQUFqQixFQUFnQ0osSUFBaEMsQ0FBcUM7QUFBQTtBQUFBLFlBQUVDLENBQUY7QUFBQSxZQUFLQyxDQUFMOztBQUFBLGVBQWFBLEVBQUVNLE1BQUgsR0FBYSxDQUFDUCxDQUFELEVBQUlDLEVBQUVPLEtBQU4sQ0FBYixHQUE0QixDQUFDUixDQUFELEVBQUksQ0FBSixDQUF4QztBQUFBLEtBQXJDLENBQW5COztBQUVBTCxZQUFRQyxHQUFSLENBQVksNEZBQVo7QUFDQU0sZ0JBQVksT0FBWixFQUFxQkksVUFBckI7QUFDQUosZ0JBQVksSUFBWixFQUFrQkksVUFBbEI7O0FBRUE7QUFDQTtBQUNBLFFBQU1HLFdBQVcsb0JBQU1ILFVBQU4sQ0FBakI7O0FBRUFYLFlBQVFDLEdBQVIsQ0FBWSxtR0FBWjs7QUFFQTtBQUNBO0FBQ0FNLGdCQUFZLEtBQVosRUFBbUJPLFFBQW5COztBQUVBO0FBQ0E7QUFDQVAsZ0JBQVksTUFBWixFQUFvQk8sUUFBcEI7O0FBRUE7QUFDQTtBQUNBUCxnQkFBWSxRQUFaLEVBQXNCTyxRQUF0Qjs7QUFFQTtBQUNBLFFBQU1DLGlCQUFpQjtBQUNuQixhQUFLLE9BRGM7QUFFbkIsYUFBSyxPQUZjO0FBR25CLGNBQU0sT0FIYTtBQUluQixjQUFNLE9BSmE7QUFLbkIsYUFBSyxPQUxjO0FBTW5CLGFBQUs7QUFOYyxLQUF2QjtBQVFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsUUFBTUMsVUFBVUYsU0FBU1YsSUFBVCxDQUFjO0FBQUEsZUFBUWEsS0FBS0MsTUFBTCxDQUFZLFVBQUNDLEdBQUQ7QUFBQTtBQUFBLGdCQUFPQyxFQUFQO0FBQUEsZ0JBQVdDLEdBQVg7O0FBQUEsbUJBQW9CRixNQUFNSixlQUFlSyxFQUFmLElBQXFCQyxHQUEvQztBQUFBLFNBQVosRUFBZ0UsQ0FBaEUsQ0FBUjtBQUFBLEtBQWQsQ0FBaEI7O0FBRUFyQixZQUFRQyxHQUFSLENBQVksaUdBQVo7QUFDQTtBQUNBO0FBQ0FNLGdCQUFZLFFBQVosRUFBc0JTLE9BQXRCOztBQUVBLGFBQVNULFdBQVQsQ0FBcUJHLEdBQXJCLEVBQTBCWSxNQUExQixFQUFrQztBQUM5QnRCLGdCQUFRQyxHQUFSLENBQVksTUFBTVMsR0FBTixHQUFZLFFBQVosR0FBdUJZLE9BQU9DLEdBQVAsQ0FBV2IsR0FBWCxFQUFnQkcsS0FBaEIsQ0FBc0IsQ0FBdEIsRUFBeUJXLFFBQXpCLEVBQW5DO0FBQ0giLCJmaWxlIjoiMDJfY2hlbWljYWxfZm9ybXVsYXMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBjZnIuIGh0dHBzOi8vZ2l0aHViLmNvbS9nYWJyaWVsZWxhbmEvcGFjby9ibG9iL21hc3Rlci9leGFtcGxlcy8wMl9jaGVtaWNhbF9mb3JtdWxhcy5leHNcblxuaW1wb3J0IHtcbiAgICBKVmFsdWUsXG4gICAgVHVwbGUsXG59IGZyb20gJ2NsYXNzZXMnO1xuaW1wb3J0IHtcbiAgICBWYWxpZGF0aW9uLFxufSBmcm9tICd2YWxpZGF0aW9uJztcbmltcG9ydCB7XG4gICAgcGFyc2VyLFxuICAgIGNoYXJQYXJzZXIsXG4gICAgZGlnaXRQYXJzZXIsXG4gICAgcHJlZGljYXRlQmFzZWRQYXJzZXIsXG4gICAgcGNoYXIsXG4gICAgcGRpZ2l0LFxuICAgIGFuZFRoZW4sXG4gICAgb3JFbHNlLFxuICAgIGNob2ljZSxcbiAgICBhbnlPZixcbiAgICBmbWFwLFxuICAgIHJldHVyblAsXG4gICAgYXBwbHlQLFxuICAgIGxpZnQyLFxuICAgIHNlcXVlbmNlUCxcbiAgICBzZXF1ZW5jZVAyLFxuICAgIHBzdHJpbmcsXG4gICAgemVyb09yTW9yZSxcbiAgICBtYW55LFxuICAgIG1hbnkxLFxuICAgIG1hbnlDaGFycyxcbiAgICBtYW55Q2hhcnMxLFxuICAgIG9wdCxcbiAgICBvcHRCb29rLFxuICAgIGRpc2NhcmRGaXJzdCxcbiAgICBkaXNjYXJkU2Vjb25kLFxuICAgIGJldHdlZW4sXG4gICAgYmV0d2VlblBhcmVucyxcbiAgICBzZXBCeTEsXG4gICAgbG93ZXJjYXNlUCxcbiAgICB1cHBlcmNhc2VQLFxuICAgIGxldHRlclAsXG4gICAgZGlnaXRQLFxuICAgIHdoaXRlUCxcbiAgICB0YXBQLFxuICAgIGxvZ1AsXG4gICAgcHdvcmQsXG59IGZyb20gJ3BhcnNlcnMnO1xuXG5jb25zb2xlLmxvZygnXFxuMDJfY2hlbWljYWxfZm9ybXVsYXMuanMnKTtcblxuLy8gIyBBbiBgZWxlbWVudGAgaXMgYSB3b3JkIGJlZ2lubmluZyB3aXRoIG9uZSB1cHBlcmNhc2UgbGV0dGVyIGZvbGxvd2VkIGJ5IHplcm9cbi8vICMgb3IgbW9yZSBsb3dlcmNhc2UgbGV0dGVyc1xuLy8gZWxlbWVudCA9IFt3aGlsZSh1cHBlcnMsIDEpLCB3aGlsZShsb3dlcnMpXSB8PiBqb2luXG5jb25zdCBlbGVtZW50UCA9IHVwcGVyY2FzZVAuYW5kVGhlbihtYW55Q2hhcnMobG93ZXJjYXNlUCkpLmZtYXAoKFt1LCBsXSkgPT4gdSArIGwpO1xuXG5jb25zb2xlLmxvZygnVXNpbmcgdXBwZXJjYXNlUC5hbmRUaGVuKG1hbnlDaGFycyhsb3dlcmNhc2VQKSkuZm1hcCgoW3UsIGxdKSA9PiB1ICsgbCknKTtcbmxvZ1RvU2NyZWVuKCdIZScsIGVsZW1lbnRQKTtcbmxvZ1RvU2NyZWVuKCdIJywgZWxlbWVudFApO1xuXG4vLyAjIEEgYHF1YW50aXR5YCBpcyBhIG51bWJlciBncmVhdGVyIHRoYW4gemVyb1xuLy8gcXVhbnRpdHkgPSB3aGlsZShkaWdpdHMsIHs6YXRfbGVhc3QsIDF9KVxuLy8gICAgICAgICAgICB8PiBiaW5kKCZTdHJpbmcudG9faW50ZWdlci8xKVxuLy8gICAgICAgICAgICB8PiBvbmx5X2lmKCYoJjEgPiAwKSlcbmNvbnN0IGludGVnZXJQID0gbWFueUNoYXJzMShkaWdpdFApLmZtYXAoc3RyID0+IHBhcnNlSW50KHN0ciwgMTApKTtcblxuY29uc29sZS5sb2coJ1VzaW5nIG1hbnlDaGFyczEoZGlnaXRQKS5mbWFwKHN0ciA9PiBwYXJzZUludChzdHIsIDEwKSknKTtcbmxvZ1RvU2NyZWVuKCcxMjMnLCBpbnRlZ2VyUCk7XG5sb2dUb1NjcmVlbignMScsIGludGVnZXJQKTtcblxuLy8gIyBBIGByZWZlcmVuY2VgIGlzIGFuIGVsZW1lbnQgb3B0aW9uYWxseSBmb2xsb3dlZCBieSBhIHF1YW50aXR5LiBJZiB0aGVcbi8vICMgcXVhbnRpdHkgaXMgb21pdHRlZCBhc3N1bWUgdGhlIHZhbHVlIG9mIDEgYXMgZGVmYXVsdFxuLy8gcmVmZXJlbmNlID0ge2VsZW1lbnQsIG1heWJlKHF1YW50aXR5LCBkZWZhdWx0OiAxKX1cbmNvbnN0IHJlZmVyZW5jZVAgPSBlbGVtZW50UC5hbmRUaGVuKG9wdChpbnRlZ2VyUCkpLmZtYXAoKFt1LCBsXSkgPT4gKGwuaXNKdXN0KSA/IFt1LCBsLnZhbHVlXSA6IFt1LCAxXSk7XG5cbmNvbnNvbGUubG9nKCdVc2luZyBlbGVtZW50UC5hbmRUaGVuKG9wdChpbnRlZ2VyUCkpLmZtYXAoKFt1LCBsXSkgPT4gKGwuaXNKdXN0KSA/IFt1LCBsLnZhbHVlXSA6IFt1LCAxXSknKTtcbmxvZ1RvU2NyZWVuKCdIZTEyMycsIHJlZmVyZW5jZVApO1xubG9nVG9TY3JlZW4oJ0FyJywgcmVmZXJlbmNlUCk7XG5cbi8vICMgQSBjaGVtaWNhbCBmb3JtdWxhIGlzIGp1c3Qgb25lIG9yIG1vcmUgZWxlbWVudHNcbi8vIGZvcm11bGEgPSBvbmVfb3JfbW9yZShyZWZlcmVuY2UpXG5jb25zdCBmb3JtdWxhUCA9IG1hbnkxKHJlZmVyZW5jZVApO1xuXG5jb25zb2xlLmxvZygnVXNpbmcgbWFueTEoZWxlbWVudFAuYW5kVGhlbihvcHQoaW50ZWdlclApKS5mbWFwKChbdSwgbF0pID0+IChsLmlzSnVzdCkgPyBbdSwgbC52YWx1ZV0gOiBbdSwgMV0pKScpO1xuXG4vLyBwYXJzZShcIkgyT1wiLCBmb3JtdWxhKSB8PiBJTy5pbnNwZWN0XG4vLyAjID4+IHs6b2ssIFt7XCJIXCIsIDJ9LCB7XCJPXCIsIDF9XX1cbmxvZ1RvU2NyZWVuKCdIMk8nLCBmb3JtdWxhUCk7XG5cbi8vIHBhcnNlKFwiTmFDbFwiLCBmb3JtdWxhKSB8PiBJTy5pbnNwZWN0XG4vLyAjID4+IHs6b2ssIFt7XCJOYVwiLCAxfSwge1wiQ2xcIiwgMX1dfVxubG9nVG9TY3JlZW4oJ05hQ2wnLCBmb3JtdWxhUCk7XG5cbi8vIHBhcnNlKFwiQzZINU9IXCIsIGZvcm11bGEpIHw+IElPLmluc3BlY3Rcbi8vICMgPj4gezpvaywgW3tcIkNcIiwgNn0sIHtcIkhcIiwgNX0sIHtcIk9cIiwgMX0sIHtcIkhcIiwgMX1dfVxubG9nVG9TY3JlZW4oJ0M2SDVPSCcsIGZvcm11bGFQKTtcblxuLy8gIyBDYWxjdWxhdGUgbW9sZWN1bGFyIHdlaWdodFxuY29uc3QgYXRvbWljX3dlaWdodHMgPSB7XG4gICAgJ08nOiAxNS45OTk0LFxuICAgICdIJzogMS4wMDc5NCxcbiAgICAnTmEnOiAyMi45ODk3LFxuICAgICdDbCc6IDM1LjQ1MjcsXG4gICAgJ0MnOiAxMi4wMTA3LFxuICAgICdTJzogMzIuMDY1NSxcbn07XG4vLyBbW0MsNl0sW0gsNV0sW08sMV0sW0gsMV1dXG5cbi8vIGNhbGN1bGF0ZV93ZWlnaHQgPSAmKCYxIHw+IEVudW0ubWFwKGZuKHtlLCBxfSkgLT4gTWFwLmZldGNoIShhdG9taWNfd2VpZ2h0LCBlKSAqIHEgZW5kKVxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgfD4gRW51bS5zdW0pXG4vL1xuLy8gd2VpZ2h0ID0gZm9ybXVsYSB8PiBiaW5kKGNhbGN1bGF0ZV93ZWlnaHQpXG5jb25zdCB3ZWlnaHRQID0gZm9ybXVsYVAuZm1hcChhcnJhID0+IGFycmEucmVkdWNlKChhY2MsIFtlbCwgcXR5XSkgPT4gYWNjICsgYXRvbWljX3dlaWdodHNbZWxdICogcXR5LCAwKSk7XG5cbmNvbnNvbGUubG9nKCdVc2luZyBmb3JtdWxhUC5mbWFwKGFycmEgPT4gYXJyYS5yZWR1Y2UoKGFjYywgW2VsLCBxdHldKSA9PiBhY2MgKyBhdG9taWNfd2VpZ2h0c1tlbF0gKiBxdHksIDApKScpO1xuLy8gcGFyc2UoXCJDNkg1T0hcIiwgd2VpZ2h0KSB8PiBJTy5pbnNwZWN0XG4vLyAjID4+IHs6b2ssIDk0LjExMTI0fVxubG9nVG9TY3JlZW4oJ0M2SDVPSCcsIHdlaWdodFApO1xuXG5mdW5jdGlvbiBsb2dUb1NjcmVlbihzdHIsIHBhcnNlcikge1xuICAgIGNvbnNvbGUubG9nKCdcIicgKyBzdHIgKyAnXCIgLS0+ICcgKyBwYXJzZXIucnVuKHN0cikudmFsdWVbMF0udG9TdHJpbmcoKSk7XG59XG4iXX0=