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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2V4YW1wbGVzLzAyX2NoZW1pY2FsX2Zvcm11bGFzLmpzIl0sIm5hbWVzIjpbImNvbnNvbGUiLCJsb2ciLCJlbGVtZW50UCIsImFuZFRoZW4iLCJmbWFwIiwidSIsImwiLCJsb2dUb1NjcmVlbiIsImludGVnZXJQIiwicGFyc2VJbnQiLCJzdHIiLCJyZWZlcmVuY2VQIiwiaXNKdXN0IiwidmFsdWUiLCJmb3JtdWxhUCIsImF0b21pY193ZWlnaHRzIiwid2VpZ2h0UCIsImFycmEiLCJyZWR1Y2UiLCJhY2MiLCJlbCIsInF0eSIsInBhcnNlciIsInJ1biIsInRvU3RyaW5nIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQTRDQUEsWUFBUUMsR0FBUixDQUFZLDJCQUFaOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFFBQU1DLFdBQVcsb0JBQVdDLE9BQVgsQ0FBbUIsNENBQW5CLEVBQTBDQyxJQUExQyxDQUErQztBQUFBO0FBQUEsWUFBRUMsQ0FBRjtBQUFBLFlBQUtDLENBQUw7O0FBQUEsZUFBWUQsSUFBSUMsQ0FBaEI7QUFBQSxLQUEvQyxDQUFqQjs7QUFFQU4sWUFBUUMsR0FBUixDQUFZLHlFQUFaO0FBQ0FNLGdCQUFZLElBQVosRUFBa0JMLFFBQWxCO0FBQ0FLLGdCQUFZLEdBQVosRUFBaUJMLFFBQWpCOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsUUFBTU0sV0FBVywwQ0FBbUJKLElBQW5CLENBQXdCO0FBQUEsZUFBT0ssU0FBU0MsR0FBVCxFQUFjLEVBQWQsQ0FBUDtBQUFBLEtBQXhCLENBQWpCOztBQUVBVixZQUFRQyxHQUFSLENBQVkseURBQVo7QUFDQU0sZ0JBQVksS0FBWixFQUFtQkMsUUFBbkI7QUFDQUQsZ0JBQVksR0FBWixFQUFpQkMsUUFBakI7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsUUFBTUcsYUFBYVQsU0FBU0MsT0FBVCxDQUFpQixrQkFBSUssUUFBSixDQUFqQixFQUFnQ0osSUFBaEMsQ0FBcUM7QUFBQTtBQUFBLFlBQUVDLENBQUY7QUFBQSxZQUFLQyxDQUFMOztBQUFBLGVBQWFBLEVBQUVNLE1BQUgsR0FBYSxDQUFDUCxDQUFELEVBQUlDLEVBQUVPLEtBQU4sQ0FBYixHQUE0QixDQUFDUixDQUFELEVBQUksQ0FBSixDQUF4QztBQUFBLEtBQXJDLENBQW5COztBQUVBTCxZQUFRQyxHQUFSLENBQVksNEZBQVo7QUFDQU0sZ0JBQVksT0FBWixFQUFxQkksVUFBckI7QUFDQUosZ0JBQVksSUFBWixFQUFrQkksVUFBbEI7O0FBRUE7QUFDQTtBQUNBLFFBQU1HLFdBQVcsb0JBQU1ILFVBQU4sQ0FBakI7O0FBRUFYLFlBQVFDLEdBQVIsQ0FBWSxtR0FBWjs7QUFFQTtBQUNBO0FBQ0FNLGdCQUFZLEtBQVosRUFBbUJPLFFBQW5COztBQUVBO0FBQ0E7QUFDQVAsZ0JBQVksTUFBWixFQUFvQk8sUUFBcEI7O0FBRUE7QUFDQTtBQUNBUCxnQkFBWSxRQUFaLEVBQXNCTyxRQUF0Qjs7QUFFQTtBQUNBLFFBQU1DLGlCQUFpQjtBQUNuQixhQUFLLE9BRGM7QUFFbkIsYUFBSyxPQUZjO0FBR25CLGNBQU0sT0FIYTtBQUluQixjQUFNLE9BSmE7QUFLbkIsYUFBSyxPQUxjO0FBTW5CLGFBQUs7QUFOYyxLQUF2QjtBQVFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsUUFBTUMsVUFBVUYsU0FBU1YsSUFBVCxDQUFjO0FBQUEsZUFBUWEsS0FBS0MsTUFBTCxDQUFZLFVBQUNDLEdBQUQ7QUFBQTtBQUFBLGdCQUFPQyxFQUFQO0FBQUEsZ0JBQVdDLEdBQVg7O0FBQUEsbUJBQW9CRixNQUFNSixlQUFlSyxFQUFmLElBQXFCQyxHQUEvQztBQUFBLFNBQVosRUFBZ0UsQ0FBaEUsQ0FBUjtBQUFBLEtBQWQsQ0FBaEI7O0FBRUFyQixZQUFRQyxHQUFSLENBQVksaUdBQVo7QUFDQTtBQUNBO0FBQ0FNLGdCQUFZLFFBQVosRUFBc0JTLE9BQXRCOztBQUVBLGFBQVNULFdBQVQsQ0FBcUJHLEdBQXJCLEVBQTBCWSxNQUExQixFQUFrQztBQUM5QnRCLGdCQUFRQyxHQUFSLENBQVksTUFBTVMsR0FBTixHQUFZLFFBQVosR0FBdUJZLE9BQU9DLEdBQVAsQ0FBV2IsR0FBWCxFQUFnQkcsS0FBaEIsQ0FBc0IsQ0FBdEIsRUFBeUJXLFFBQXpCLEVBQW5DO0FBQ0giLCJmaWxlIjoiMDJfY2hlbWljYWxfZm9ybXVsYXMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICAgIEpWYWx1ZSxcbiAgICBUdXBsZSxcbn0gZnJvbSAnY2xhc3Nlcyc7XG5pbXBvcnQge1xuICAgIFZhbGlkYXRpb24sXG59IGZyb20gJ3ZhbGlkYXRpb24nO1xuaW1wb3J0IHtcbiAgICBwYXJzZXIsXG4gICAgY2hhclBhcnNlcixcbiAgICBkaWdpdFBhcnNlcixcbiAgICBwcmVkaWNhdGVCYXNlZFBhcnNlcixcbiAgICBwY2hhcixcbiAgICBwZGlnaXQsXG4gICAgYW5kVGhlbixcbiAgICBvckVsc2UsXG4gICAgY2hvaWNlLFxuICAgIGFueU9mLFxuICAgIGZtYXAsXG4gICAgcmV0dXJuUCxcbiAgICBhcHBseVAsXG4gICAgbGlmdDIsXG4gICAgc2VxdWVuY2VQLFxuICAgIHNlcXVlbmNlUDIsXG4gICAgcHN0cmluZyxcbiAgICB6ZXJvT3JNb3JlLFxuICAgIG1hbnksXG4gICAgbWFueTEsXG4gICAgbWFueUNoYXJzLFxuICAgIG1hbnlDaGFyczEsXG4gICAgb3B0LFxuICAgIG9wdEJvb2ssXG4gICAgZGlzY2FyZEZpcnN0LFxuICAgIGRpc2NhcmRTZWNvbmQsXG4gICAgYmV0d2VlbixcbiAgICBiZXR3ZWVuUGFyZW5zLFxuICAgIHNlcEJ5MSxcbiAgICBsb3dlcmNhc2VQLFxuICAgIHVwcGVyY2FzZVAsXG4gICAgbGV0dGVyUCxcbiAgICBkaWdpdFAsXG4gICAgd2hpdGVQLFxufSBmcm9tICdwYXJzZXJzJztcblxuY29uc29sZS5sb2coJ1xcbjAyX2NoZW1pY2FsX2Zvcm11bGFzLmpzJyk7XG5cbi8vICMgQW4gYGVsZW1lbnRgIGlzIGEgd29yZCBiZWdpbm5pbmcgd2l0aCBvbmUgdXBwZXJjYXNlIGxldHRlciBmb2xsb3dlZCBieSB6ZXJvXG4vLyAjIG9yIG1vcmUgbG93ZXJjYXNlIGxldHRlcnNcbi8vIGVsZW1lbnQgPSBbd2hpbGUodXBwZXJzLCAxKSwgd2hpbGUobG93ZXJzKV0gfD4gam9pblxuY29uc3QgZWxlbWVudFAgPSB1cHBlcmNhc2VQLmFuZFRoZW4obWFueUNoYXJzKGxvd2VyY2FzZVApKS5mbWFwKChbdSwgbF0pID0+IHUgKyBsKTtcblxuY29uc29sZS5sb2coJ1VzaW5nIHVwcGVyY2FzZVAuYW5kVGhlbihtYW55Q2hhcnMobG93ZXJjYXNlUCkpLmZtYXAoKFt1LCBsXSkgPT4gdSArIGwpJyk7XG5sb2dUb1NjcmVlbignSGUnLCBlbGVtZW50UCk7XG5sb2dUb1NjcmVlbignSCcsIGVsZW1lbnRQKTtcblxuLy8gIyBBIGBxdWFudGl0eWAgaXMgYSBudW1iZXIgZ3JlYXRlciB0aGFuIHplcm9cbi8vIHF1YW50aXR5ID0gd2hpbGUoZGlnaXRzLCB7OmF0X2xlYXN0LCAxfSlcbi8vICAgICAgICAgICAgfD4gYmluZCgmU3RyaW5nLnRvX2ludGVnZXIvMSlcbi8vICAgICAgICAgICAgfD4gb25seV9pZigmKCYxID4gMCkpXG5jb25zdCBpbnRlZ2VyUCA9IG1hbnlDaGFyczEoZGlnaXRQKS5mbWFwKHN0ciA9PiBwYXJzZUludChzdHIsIDEwKSk7XG5cbmNvbnNvbGUubG9nKCdVc2luZyBtYW55Q2hhcnMxKGRpZ2l0UCkuZm1hcChzdHIgPT4gcGFyc2VJbnQoc3RyLCAxMCkpJyk7XG5sb2dUb1NjcmVlbignMTIzJywgaW50ZWdlclApO1xubG9nVG9TY3JlZW4oJzEnLCBpbnRlZ2VyUCk7XG5cbi8vICMgQSBgcmVmZXJlbmNlYCBpcyBhbiBlbGVtZW50IG9wdGlvbmFsbHkgZm9sbG93ZWQgYnkgYSBxdWFudGl0eS4gSWYgdGhlXG4vLyAjIHF1YW50aXR5IGlzIG9taXR0ZWQgYXNzdW1lIHRoZSB2YWx1ZSBvZiAxIGFzIGRlZmF1bHRcbi8vIHJlZmVyZW5jZSA9IHtlbGVtZW50LCBtYXliZShxdWFudGl0eSwgZGVmYXVsdDogMSl9XG5jb25zdCByZWZlcmVuY2VQID0gZWxlbWVudFAuYW5kVGhlbihvcHQoaW50ZWdlclApKS5mbWFwKChbdSwgbF0pID0+IChsLmlzSnVzdCkgPyBbdSwgbC52YWx1ZV0gOiBbdSwgMV0pO1xuXG5jb25zb2xlLmxvZygnVXNpbmcgZWxlbWVudFAuYW5kVGhlbihvcHQoaW50ZWdlclApKS5mbWFwKChbdSwgbF0pID0+IChsLmlzSnVzdCkgPyBbdSwgbC52YWx1ZV0gOiBbdSwgMV0pJyk7XG5sb2dUb1NjcmVlbignSGUxMjMnLCByZWZlcmVuY2VQKTtcbmxvZ1RvU2NyZWVuKCdBcicsIHJlZmVyZW5jZVApO1xuXG4vLyAjIEEgY2hlbWljYWwgZm9ybXVsYSBpcyBqdXN0IG9uZSBvciBtb3JlIGVsZW1lbnRzXG4vLyBmb3JtdWxhID0gb25lX29yX21vcmUocmVmZXJlbmNlKVxuY29uc3QgZm9ybXVsYVAgPSBtYW55MShyZWZlcmVuY2VQKTtcblxuY29uc29sZS5sb2coJ1VzaW5nIG1hbnkxKGVsZW1lbnRQLmFuZFRoZW4ob3B0KGludGVnZXJQKSkuZm1hcCgoW3UsIGxdKSA9PiAobC5pc0p1c3QpID8gW3UsIGwudmFsdWVdIDogW3UsIDFdKSknKTtcblxuLy8gcGFyc2UoXCJIMk9cIiwgZm9ybXVsYSkgfD4gSU8uaW5zcGVjdFxuLy8gIyA+PiB7Om9rLCBbe1wiSFwiLCAyfSwge1wiT1wiLCAxfV19XG5sb2dUb1NjcmVlbignSDJPJywgZm9ybXVsYVApO1xuXG4vLyBwYXJzZShcIk5hQ2xcIiwgZm9ybXVsYSkgfD4gSU8uaW5zcGVjdFxuLy8gIyA+PiB7Om9rLCBbe1wiTmFcIiwgMX0sIHtcIkNsXCIsIDF9XX1cbmxvZ1RvU2NyZWVuKCdOYUNsJywgZm9ybXVsYVApO1xuXG4vLyBwYXJzZShcIkM2SDVPSFwiLCBmb3JtdWxhKSB8PiBJTy5pbnNwZWN0XG4vLyAjID4+IHs6b2ssIFt7XCJDXCIsIDZ9LCB7XCJIXCIsIDV9LCB7XCJPXCIsIDF9LCB7XCJIXCIsIDF9XX1cbmxvZ1RvU2NyZWVuKCdDNkg1T0gnLCBmb3JtdWxhUCk7XG5cbi8vICMgQ2FsY3VsYXRlIG1vbGVjdWxhciB3ZWlnaHRcbmNvbnN0IGF0b21pY193ZWlnaHRzID0ge1xuICAgICdPJzogMTUuOTk5NCxcbiAgICAnSCc6IDEuMDA3OTQsXG4gICAgJ05hJzogMjIuOTg5NyxcbiAgICAnQ2wnOiAzNS40NTI3LFxuICAgICdDJzogMTIuMDEwNyxcbiAgICAnUyc6IDMyLjA2NTUsXG59O1xuLy8gW1tDLDZdLFtILDVdLFtPLDFdLFtILDFdXVxuXG4vLyBjYWxjdWxhdGVfd2VpZ2h0ID0gJigmMSB8PiBFbnVtLm1hcChmbih7ZSwgcX0pIC0+IE1hcC5mZXRjaCEoYXRvbWljX3dlaWdodCwgZSkgKiBxIGVuZClcbi8vICAgICAgICAgICAgICAgICAgICAgICAgIHw+IEVudW0uc3VtKVxuLy9cbi8vIHdlaWdodCA9IGZvcm11bGEgfD4gYmluZChjYWxjdWxhdGVfd2VpZ2h0KVxuY29uc3Qgd2VpZ2h0UCA9IGZvcm11bGFQLmZtYXAoYXJyYSA9PiBhcnJhLnJlZHVjZSgoYWNjLCBbZWwsIHF0eV0pID0+IGFjYyArIGF0b21pY193ZWlnaHRzW2VsXSAqIHF0eSwgMCkpO1xuXG5jb25zb2xlLmxvZygnVXNpbmcgZm9ybXVsYVAuZm1hcChhcnJhID0+IGFycmEucmVkdWNlKChhY2MsIFtlbCwgcXR5XSkgPT4gYWNjICsgYXRvbWljX3dlaWdodHNbZWxdICogcXR5LCAwKSknKTtcbi8vIHBhcnNlKFwiQzZINU9IXCIsIHdlaWdodCkgfD4gSU8uaW5zcGVjdFxuLy8gIyA+PiB7Om9rLCA5NC4xMTEyNH1cbmxvZ1RvU2NyZWVuKCdDNkg1T0gnLCB3ZWlnaHRQKTtcblxuZnVuY3Rpb24gbG9nVG9TY3JlZW4oc3RyLCBwYXJzZXIpIHtcbiAgICBjb25zb2xlLmxvZygnXCInICsgc3RyICsgJ1wiIC0tPiAnICsgcGFyc2VyLnJ1bihzdHIpLnZhbHVlWzBdLnRvU3RyaW5nKCkpO1xufVxuIl19