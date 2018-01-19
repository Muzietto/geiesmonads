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

    var unit_values = {
        zero: 0,
        one: 1,
        two: 2,
        three: 3,
        four: 4,
        five: 5,
        six: 6,
        seven: 7,
        eight: 8,
        nine: 9,
        ten: 10,
        eleven: 11,
        twelve: 12,
        thirteen: 13,
        fourteen: 14,
        fifteen: 15,
        sixteen: 16,
        seventeen: 17,
        eighteen: 18,
        nineteen: 19
    };

    var tens_values = {
        twenty: 20,
        thirty: 30,
        forty: 40,
        fifty: 50,
        sixty: 60,
        seventy: 70,
        eighty: 80,
        ninety: 90
    };

    var scale_values = {
        thousand: 1000,
        million: 1000000,
        billion: 1000000000,
        trillion: 1000000000000
    };

    console.log('\n03_words_to_numbers.js');

    // mul = fn ns -> Enum.reduce(ns, 1, &Kernel.*/2) end
    var productReducer = function productReducer(arra) {
        return arra.reduce(function (acc, curr) {
            return acc * curr;
        }, 1);
    };
    // sum = fn ns -> Enum.reduce(ns, 0, &Kernel.+/2) end
    var sumReducer = function sumReducer(arra) {
        return arra.reduce(function (acc, curr) {
            return acc + curr;
        }, 0);
    };

    // units = one_of(for {word, value} <- unit_values, do: lex(word) |> replace_with(value))
    var units = Object.keys(unit_values).map(function (value) {
        return (0, _parsers.pstring)(value).fmap(function (_) {
            return unit_values[value];
        });
    });
    var unitsP = (0, _parsers.choice)(units);

    console.log('Using choice(Object.keys(unit_values).map(value => pstring(value).fmap(_ => unit_values[value])));');
    logToScreen('one', unitsP);
    logToScreen('thirteen', unitsP);

    // tens = one_of(for {word, value} <- tens_values, do: lex(word) |> replace_with(value))
    var tens = Object.keys(tens_values).map(function (value) {
        return (0, _parsers.pstring)(value).fmap(function (_) {
            return tens_values[value];
        });
    });
    var tensP1 = (0, _parsers.choice)(tens);
    // tens = [tens, skip(maybe(lex("-"))), maybe(units, default: 0)] |> bind(sum)
    var tensP2 = tensP1.discardSecond((0, _parsers.opt)((0, _parsers.pchar)('-'))).andThen((0, _parsers.opt)(unitsP)).fmap(function (_ref) {
        var _ref2 = _slicedToArray(_ref, 2),
            a = _ref2[0],
            mb = _ref2[1];

        return mb.isJust ? a + mb.value : a;
    });
    // tens = [tens, units] |> one_of
    var tensP = (0, _parsers.choice)([tensP1, tensP2]);

    console.log('Using tensP');
    logToScreen('twenty', tensP);
    logToScreen('twentythree', tensP);
    logToScreen('twenty-three', tensP);
    logToScreen('ninety', tensP);
    logToScreen('ninetyseven', tensP);
    logToScreen('ninety-seven', tensP);

    // hundreds = lex("hundred") |> replace_with(100)
    var hundredsP1 = (0, _parsers.pstring)('hundred').fmap(function (_) {
        return 100;
    });
    // hundreds = [tens, maybe(hundreds, default: 1)] |> bind(mul)
    // hundreds = [hundreds, skip(maybe(lex("and"))), maybe(tens, default: 0)] |> bind(sum)
    var hundredsP = (0, _parsers.choice)([hundredsP1]);

    console.log('Using hundredsP');
    logToScreen('hundred', hundredsP);

    // scales = one_of(for {word, value} <- scale_values, do: lex(word) |> replace_with(value))
    var scales = Object.keys(scale_values).map(function (value) {
        return (0, _parsers.pstring)(value).fmap(function (_) {
            return scale_values[value];
        });
    });
    var scalesP = (0, _parsers.choice)(scales);

    console.log('Using choice(Object.keys(scale_values).map(value => pstring(value).fmap(_ => scale_values[value])));');
    logToScreen('million', scalesP);
    logToScreen('trillion', scalesP);

    // number = [one_of([hundreds, tens]), maybe(scales, default: 1)] |> bind(mul)
    // number = number |> separated_by(maybe(lex("and"))) |> bind(sum)
    //
    //
    // parse("one", number) |> IO.inspect
    // # >> {:ok, 1}
    // parse("twenty", number) |> IO.inspect
    // # >> {:ok, 20}
    // parse("twenty-two", number) |> IO.inspect
    // # >> {:ok, 22}
    // parse("seventy-seven", number) |> IO.inspect
    // # >> {:ok, 77}
    // parse("one hundred", number) |> IO.inspect
    // # >> {:ok, 100}
    // parse("one hundred twenty", number) |> IO.inspect
    // # >> {:ok, 120}
    // parse("one hundred and twenty", number) |> IO.inspect
    // # >> {:ok, 120}
    // parse("one hundred and twenty-two", number) |> IO.inspect
    // # >> {:ok, 122}
    // parse("one hundred and twenty three", number) |> IO.inspect
    // # >> {:ok, 123}
    // parse("twelve hundred and twenty-two", number) |> IO.inspect
    // # >> {:ok, 1222}
    // parse("one thousand", number) |> IO.inspect
    // # >> {:ok, 1000}
    // parse("twenty thousand", number) |> IO.inspect
    // # >> {:ok, 20000}
    // parse("twenty-two thousand", number) |> IO.inspect
    // # >> {:ok, 22000}
    // parse("one hundred thousand", number) |> IO.inspect
    // # >> {:ok, 100000}
    // parse("twelve hundred and twenty-two thousand", number) |> IO.inspect
    // # >> {:ok, 1222000}
    // parse("one hundred and twenty three million", number) |> IO.inspect
    // # >> {:ok, 123000000}
    // parse("one hundred and twenty three million and three", number) |> IO.inspect
    // # >> {:ok, 123000003}
    // parse("seventy-seven thousand eight hundred and nineteen", number) |> IO.inspect
    // # >> {:ok, 77819}
    // parse("seven hundred seventy-seven thousand seven hundred and seventy-seven", number) |> IO.inspect
    // # >> {:ok, 777777}

    function logToScreen(str, parser) {
        console.log('"' + str + '" --> ' + parser.run(str).value[0].toString());
    }
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2V4YW1wbGVzLzAzX3dvcmRzX3RvX251bWJlcnMuanMiXSwibmFtZXMiOlsidW5pdF92YWx1ZXMiLCJ6ZXJvIiwib25lIiwidHdvIiwidGhyZWUiLCJmb3VyIiwiZml2ZSIsInNpeCIsInNldmVuIiwiZWlnaHQiLCJuaW5lIiwidGVuIiwiZWxldmVuIiwidHdlbHZlIiwidGhpcnRlZW4iLCJmb3VydGVlbiIsImZpZnRlZW4iLCJzaXh0ZWVuIiwic2V2ZW50ZWVuIiwiZWlnaHRlZW4iLCJuaW5ldGVlbiIsInRlbnNfdmFsdWVzIiwidHdlbnR5IiwidGhpcnR5IiwiZm9ydHkiLCJmaWZ0eSIsInNpeHR5Iiwic2V2ZW50eSIsImVpZ2h0eSIsIm5pbmV0eSIsInNjYWxlX3ZhbHVlcyIsInRob3VzYW5kIiwibWlsbGlvbiIsImJpbGxpb24iLCJ0cmlsbGlvbiIsImNvbnNvbGUiLCJsb2ciLCJwcm9kdWN0UmVkdWNlciIsImFycmEiLCJyZWR1Y2UiLCJhY2MiLCJjdXJyIiwic3VtUmVkdWNlciIsInVuaXRzIiwiT2JqZWN0Iiwia2V5cyIsIm1hcCIsInZhbHVlIiwiZm1hcCIsInVuaXRzUCIsImxvZ1RvU2NyZWVuIiwidGVucyIsInRlbnNQMSIsInRlbnNQMiIsImRpc2NhcmRTZWNvbmQiLCJhbmRUaGVuIiwiYSIsIm1iIiwiaXNKdXN0IiwidGVuc1AiLCJodW5kcmVkc1AxIiwiaHVuZHJlZHNQIiwic2NhbGVzIiwic2NhbGVzUCIsInN0ciIsInBhcnNlciIsInJ1biIsInRvU3RyaW5nIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQTRDQSxRQUFNQSxjQUFjO0FBQ2hCQyxjQUFNLENBRFU7QUFFaEJDLGFBQUssQ0FGVztBQUdoQkMsYUFBSyxDQUhXO0FBSWhCQyxlQUFPLENBSlM7QUFLaEJDLGNBQU0sQ0FMVTtBQU1oQkMsY0FBTSxDQU5VO0FBT2hCQyxhQUFLLENBUFc7QUFRaEJDLGVBQU8sQ0FSUztB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dW1iZXJzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgICBKVmFsdWUsXG4gICAgVHVwbGUsXG59IGZyb20gJ2NsYXNzZXMnO1xuaW1wb3J0IHtcbiAgICBWYWxpZGF0aW9uLFxufSBmcm9tICd2YWxpZGF0aW9uJztcbmltcG9ydCB7XG4gICAgcGFyc2VyLFxuICAgIGNoYXJQYXJzZXIsXG4gICAgZGlnaXRQYXJzZXIsXG4gICAgcHJlZGljYXRlQmFzZWRQYXJzZXIsXG4gICAgcGNoYXIsXG4gICAgcGRpZ2l0LFxuICAgIGFuZFRoZW4sXG4gICAgb3JFbHNlLFxuICAgIGNob2ljZSxcbiAgICBhbnlPZixcbiAgICBmbWFwLFxuICAgIHJldHVyblAsXG4gICAgYXBwbHlQLFxuICAgIGxpZnQyLFxuICAgIHNlcXVlbmNlUCxcbiAgICBzZXF1ZW5jZVAyLFxuICAgIHBzdHJpbmcsXG4gICAgemVyb09yTW9yZSxcbiAgICBtYW55LFxuICAgIG1hbnkxLFxuICAgIG1hbnlDaGFycyxcbiAgICBtYW55Q2hhcnMxLFxuICAgIG9wdCxcbiAgICBvcHRCb29rLFxuICAgIGRpc2NhcmRGaXJzdCxcbiAgICBkaXNjYXJkU2Vjb25kLFxuICAgIGJldHdlZW4sXG4gICAgYmV0d2VlblBhcmVucyxcbiAgICBzZXBCeTEsXG4gICAgbG93ZXJjYXNlUCxcbiAgICB1cHBlcmNhc2VQLFxuICAgIGxldHRlclAsXG4gICAgZGlnaXRQLFxuICAgIHdoaXRlUCxcbn0gZnJvbSAncGFyc2Vycyc7XG5cbmNvbnN0IHVuaXRfdmFsdWVzID0ge1xuICAgIHplcm86IDAsXG4gICAgb25lOiAxLFxuICAgIHR3bzogMixcbiAgICB0aHJlZTogMyxcbiAgICBmb3VyOiA0LFxuICAgIGZpdmU6IDUsXG4gICAgc2l4OiA2LFxuICAgIHNldmVuOiA3LFxuICAgIGVpZ2h0OiA4LFxuICAgIG5pbmU6IDksXG4gICAgdGVuOiAxMCxcbiAgICBlbGV2ZW46IDExLFxuICAgIHR3ZWx2ZTogMTIsXG4gICAgdGhpcnRlZW46IDEzLFxuICAgIGZvdXJ0ZWVuOiAxNCxcbiAgICBmaWZ0ZWVuOiAxNSxcbiAgICBzaXh0ZWVuOiAxNixcbiAgICBzZXZlbnRlZW46IDE3LFxuICAgIGVpZ2h0ZWVuOiAxOCxcbiAgICBuaW5ldGVlbjogMTksXG59O1xuXG5jb25zdCB0ZW5zX3ZhbHVlcyA9IHtcbiAgICB0d2VudHk6IDIwLFxuICAgIHRoaXJ0eTogMzAsXG4gICAgZm9ydHk6IDQwLFxuICAgIGZpZnR5OiA1MCxcbiAgICBzaXh0eTogNjAsXG4gICAgc2V2ZW50eTogNzAsXG4gICAgZWlnaHR5OiA4MCxcbiAgICBuaW5ldHk6IDkwLFxufTtcblxuY29uc3Qgc2NhbGVfdmFsdWVzID0ge1xuICAgIHRob3VzYW5kOiAxMDAwLFxuICAgIG1pbGxpb246IDEwMDAwMDAsXG4gICAgYmlsbGlvbjogMTAwMDAwMDAwMCxcbiAgICB0cmlsbGlvbjogMTAwMDAwMDAwMDAwMCxcbn07XG5cbmNvbnNvbGUubG9nKCdcXG4wM193b3Jkc190b19udW1iZXJzLmpzJyk7XG5cbi8vIG11bCA9IGZuIG5zIC0+IEVudW0ucmVkdWNlKG5zLCAxLCAmS2VybmVsLiovMikgZW5kXG5jb25zdCBwcm9kdWN0UmVkdWNlciA9IGFycmEgPT4gYXJyYS5yZWR1Y2UoKGFjYywgY3VycikgPT4gYWNjICogY3VyciwgMSk7XG4vLyBzdW0gPSBmbiBucyAtPiBFbnVtLnJlZHVjZShucywgMCwgJktlcm5lbC4rLzIpIGVuZFxuY29uc3Qgc3VtUmVkdWNlciA9IGFycmEgPT4gYXJyYS5yZWR1Y2UoKGFjYywgY3VycikgPT4gYWNjICsgY3VyciwgMCk7XG5cbi8vIHVuaXRzID0gb25lX29mKGZvciB7d29yZCwgdmFsdWV9IDwtIHVuaXRfdmFsdWVzLCBkbzogbGV4KHdvcmQpIHw+IHJlcGxhY2Vfd2l0aCh2YWx1ZSkpXG5jb25zdCB1bml0cyA9IE9iamVjdC5rZXlzKHVuaXRfdmFsdWVzKS5tYXAodmFsdWUgPT4gcHN0cmluZyh2YWx1ZSkuZm1hcChfID0+IHVuaXRfdmFsdWVzW3ZhbHVlXSkpO1xuY29uc3QgdW5pdHNQID0gY2hvaWNlKHVuaXRzKTtcblxuY29uc29sZS5sb2coJ1VzaW5nIGNob2ljZShPYmplY3Qua2V5cyh1bml0X3ZhbHVlcykubWFwKHZhbHVlID0+IHBzdHJpbmcodmFsdWUpLmZtYXAoXyA9PiB1bml0X3ZhbHVlc1t2YWx1ZV0pKSk7Jyk7XG5sb2dUb1NjcmVlbignb25lJywgdW5pdHNQKTtcbmxvZ1RvU2NyZWVuKCd0aGlydGVlbicsIHVuaXRzUCk7XG5cbi8vIHRlbnMgPSBvbmVfb2YoZm9yIHt3b3JkLCB2YWx1ZX0gPC0gdGVuc192YWx1ZXMsIGRvOiBsZXgod29yZCkgfD4gcmVwbGFjZV93aXRoKHZhbHVlKSlcbmNvbnN0IHRlbnMgPSBPYmplY3Qua2V5cyh0ZW5zX3ZhbHVlcykubWFwKHZhbHVlID0+IHBzdHJpbmcodmFsdWUpLmZtYXAoXyA9PiB0ZW5zX3ZhbHVlc1t2YWx1ZV0pKTtcbmNvbnN0IHRlbnNQMSA9IGNob2ljZSh0ZW5zKTtcbi8vIHRlbnMgPSBbdGVucywgc2tpcChtYXliZShsZXgoXCItXCIpKSksIG1heWJlKHVuaXRzLCBkZWZhdWx0OiAwKV0gfD4gYmluZChzdW0pXG5jb25zdCB0ZW5zUDIgPSB0ZW5zUDEuZGlzY2FyZFNlY29uZChvcHQocGNoYXIoJy0nKSkpLmFuZFRoZW4ob3B0KHVuaXRzUCkpLmZtYXAoKFthLCBtYl0pID0+IChtYi5pc0p1c3QpID8gYSArIG1iLnZhbHVlIDogYSk7XG4vLyB0ZW5zID0gW3RlbnMsIHVuaXRzXSB8PiBvbmVfb2ZcbmNvbnN0IHRlbnNQID0gY2hvaWNlKFt0ZW5zUDEsIHRlbnNQMl0pO1xuXG5jb25zb2xlLmxvZygnVXNpbmcgdGVuc1AnKTtcbmxvZ1RvU2NyZWVuKCd0d2VudHknLCB0ZW5zUCk7XG5sb2dUb1NjcmVlbigndHdlbnR5dGhyZWUnLCB0ZW5zUCk7XG5sb2dUb1NjcmVlbigndHdlbnR5LXRocmVlJywgdGVuc1ApO1xubG9nVG9TY3JlZW4oJ25pbmV0eScsIHRlbnNQKTtcbmxvZ1RvU2NyZWVuKCduaW5ldHlzZXZlbicsIHRlbnNQKTtcbmxvZ1RvU2NyZWVuKCduaW5ldHktc2V2ZW4nLCB0ZW5zUCk7XG5cbi8vIGh1bmRyZWRzID0gbGV4KFwiaHVuZHJlZFwiKSB8PiByZXBsYWNlX3dpdGgoMTAwKVxuY29uc3QgaHVuZHJlZHNQMSA9IHBzdHJpbmcoJ2h1bmRyZWQnKS5mbWFwKF8gPT4gMTAwKTtcbi8vIGh1bmRyZWRzID0gW3RlbnMsIG1heWJlKGh1bmRyZWRzLCBkZWZhdWx0OiAxKV0gfD4gYmluZChtdWwpXG4vLyBodW5kcmVkcyA9IFtodW5kcmVkcywgc2tpcChtYXliZShsZXgoXCJhbmRcIikpKSwgbWF5YmUodGVucywgZGVmYXVsdDogMCldIHw+IGJpbmQoc3VtKVxuY29uc3QgaHVuZHJlZHNQID0gY2hvaWNlKFtodW5kcmVkc1AxXSk7XG5cbmNvbnNvbGUubG9nKCdVc2luZyBodW5kcmVkc1AnKTtcbmxvZ1RvU2NyZWVuKCdodW5kcmVkJywgaHVuZHJlZHNQKTtcblxuLy8gc2NhbGVzID0gb25lX29mKGZvciB7d29yZCwgdmFsdWV9IDwtIHNjYWxlX3ZhbHVlcywgZG86IGxleCh3b3JkKSB8PiByZXBsYWNlX3dpdGgodmFsdWUpKVxuY29uc3Qgc2NhbGVzID0gT2JqZWN0LmtleXMoc2NhbGVfdmFsdWVzKS5tYXAodmFsdWUgPT4gcHN0cmluZyh2YWx1ZSkuZm1hcChfID0+IHNjYWxlX3ZhbHVlc1t2YWx1ZV0pKTtcbmNvbnN0IHNjYWxlc1AgPSBjaG9pY2Uoc2NhbGVzKTtcblxuY29uc29sZS5sb2coJ1VzaW5nIGNob2ljZShPYmplY3Qua2V5cyhzY2FsZV92YWx1ZXMpLm1hcCh2YWx1ZSA9PiBwc3RyaW5nKHZhbHVlKS5mbWFwKF8gPT4gc2NhbGVfdmFsdWVzW3ZhbHVlXSkpKTsnKTtcbmxvZ1RvU2NyZWVuKCdtaWxsaW9uJywgc2NhbGVzUCk7XG5sb2dUb1NjcmVlbigndHJpbGxpb24nLCBzY2FsZXNQKTtcblxuLy8gbnVtYmVyID0gW29uZV9vZihbaHVuZHJlZHMsIHRlbnNdKSwgbWF5YmUoc2NhbGVzLCBkZWZhdWx0OiAxKV0gfD4gYmluZChtdWwpXG4vLyBudW1iZXIgPSBudW1iZXIgfD4gc2VwYXJhdGVkX2J5KG1heWJlKGxleChcImFuZFwiKSkpIHw+IGJpbmQoc3VtKVxuLy9cbi8vXG4vLyBwYXJzZShcIm9uZVwiLCBudW1iZXIpIHw+IElPLmluc3BlY3Rcbi8vICMgPj4gezpvaywgMX1cbi8vIHBhcnNlKFwidHdlbnR5XCIsIG51bWJlcikgfD4gSU8uaW5zcGVjdFxuLy8gIyA+PiB7Om9rLCAyMH1cbi8vIHBhcnNlKFwidHdlbnR5LXR3b1wiLCBudW1iZXIpIHw+IElPLmluc3BlY3Rcbi8vICMgPj4gezpvaywgMjJ9XG4vLyBwYXJzZShcInNldmVudHktc2V2ZW5cIiwgbnVtYmVyKSB8PiBJTy5pbnNwZWN0XG4vLyAjID4+IHs6b2ssIDc3fVxuLy8gcGFyc2UoXCJvbmUgaHVuZHJlZFwiLCBudW1iZXIpIHw+IElPLmluc3BlY3Rcbi8vICMgPj4gezpvaywgMTAwfVxuLy8gcGFyc2UoXCJvbmUgaHVuZHJlZCB0d2VudHlcIiwgbnVtYmVyKSB8PiBJTy5pbnNwZWN0XG4vLyAjID4+IHs6b2ssIDEyMH1cbi8vIHBhcnNlKFwib25lIGh1bmRyZWQgYW5kIHR3ZW50eVwiLCBudW1iZXIpIHw+IElPLmluc3BlY3Rcbi8vICMgPj4gezpvaywgMTIwfVxuLy8gcGFyc2UoXCJvbmUgaHVuZHJlZCBhbmQgdHdlbnR5LXR3b1wiLCBudW1iZXIpIHw+IElPLmluc3BlY3Rcbi8vICMgPj4gezpvaywgMTIyfVxuLy8gcGFyc2UoXCJvbmUgaHVuZHJlZCBhbmQgdHdlbnR5IHRocmVlXCIsIG51bWJlcikgfD4gSU8uaW5zcGVjdFxuLy8gIyA+PiB7Om9rLCAxMjN9XG4vLyBwYXJzZShcInR3ZWx2ZSBodW5kcmVkIGFuZCB0d2VudHktdHdvXCIsIG51bWJlcikgfD4gSU8uaW5zcGVjdFxuLy8gIyA+PiB7Om9rLCAxMjIyfVxuLy8gcGFyc2UoXCJvbmUgdGhvdXNhbmRcIiwgbnVtYmVyKSB8PiBJTy5pbnNwZWN0XG4vLyAjID4+IHs6b2ssIDEwMDB9XG4vLyBwYXJzZShcInR3ZW50eSB0aG91c2FuZFwiLCBudW1iZXIpIHw+IElPLmluc3BlY3Rcbi8vICMgPj4gezpvaywgMjAwMDB9XG4vLyBwYXJzZShcInR3ZW50eS10d28gdGhvdXNhbmRcIiwgbnVtYmVyKSB8PiBJTy5pbnNwZWN0XG4vLyAjID4+IHs6b2ssIDIyMDAwfVxuLy8gcGFyc2UoXCJvbmUgaHVuZHJlZCB0aG91c2FuZFwiLCBudW1iZXIpIHw+IElPLmluc3BlY3Rcbi8vICMgPj4gezpvaywgMTAwMDAwfVxuLy8gcGFyc2UoXCJ0d2VsdmUgaHVuZHJlZCBhbmQgdHdlbnR5LXR3byB0aG91c2FuZFwiLCBudW1iZXIpIHw+IElPLmluc3BlY3Rcbi8vICMgPj4gezpvaywgMTIyMjAwMH1cbi8vIHBhcnNlKFwib25lIGh1bmRyZWQgYW5kIHR3ZW50eSB0aHJlZSBtaWxsaW9uXCIsIG51bWJlcikgfD4gSU8uaW5zcGVjdFxuLy8gIyA+PiB7Om9rLCAxMjMwMDAwMDB9XG4vLyBwYXJzZShcIm9uZSBodW5kcmVkIGFuZCB0d2VudHkgdGhyZWUgbWlsbGlvbiBhbmQgdGhyZWVcIiwgbnVtYmVyKSB8PiBJTy5pbnNwZWN0XG4vLyAjID4+IHs6b2ssIDEyMzAwMDAwM31cbi8vIHBhcnNlKFwic2V2ZW50eS1zZXZlbiB0aG91c2FuZCBlaWdodCBodW5kcmVkIGFuZCBuaW5ldGVlblwiLCBudW1iZXIpIHw+IElPLmluc3BlY3Rcbi8vICMgPj4gezpvaywgNzc4MTl9XG4vLyBwYXJzZShcInNldmVuIGh1bmRyZWQgc2V2ZW50eS1zZXZlbiB0aG91c2FuZCBzZXZlbiBodW5kcmVkIGFuZCBzZXZlbnR5LXNldmVuXCIsIG51bWJlcikgfD4gSU8uaW5zcGVjdFxuLy8gIyA+PiB7Om9rLCA3Nzc3Nzd9XG5cbmZ1bmN0aW9uIGxvZ1RvU2NyZWVuKHN0ciwgcGFyc2VyKSB7XG4gICAgY29uc29sZS5sb2coJ1wiJyArIHN0ciArICdcIiAtLT4gJyArIHBhcnNlci5ydW4oc3RyKS52YWx1ZVswXS50b1N0cmluZygpKTtcbn1cbiJdfQ==