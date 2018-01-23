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
    var units = Object.keys(unit_values).reverse().map(function (value) {
        return (0, _parsers.pword)(value).fmap(function (_) {
            return unit_values[value];
        });
    });
    var unitsP = (0, _parsers.choice)(units).setLabel('unitsP');

    console.log('Using choice(Object.keys(unit_values).map(value => pword(value).fmap(_ => unit_values[value])));');
    logToScreen('one', unitsP);
    logToScreen('thirteen', unitsP);
    logToScreen('eighteen', unitsP);

    // tens = one_of(for {word, value} <- tens_values, do: lex(word) |> replace_with(value))
    var tens = Object.keys(tens_values).map(function (value) {
        return (0, _parsers.pword)(value).fmap(function (_) {
            return tens_values[value];
        });
    });
    var tensP1 = (0, _parsers.choice)(tens);
    // tens = [tens, skip(maybe(lex("-"))), maybe(units, default: 0)] |> bind(sum)
    var tensP2 = tensP1.discardSecond((0, _parsers.opt)((0, _parsers.pchar)('-'))).andThen((0, _parsers.opt)(unitsP, 0)).fmap(function (_ref) {
        var _ref2 = _slicedToArray(_ref, 2),
            a = _ref2[0],
            mb = _ref2[1];

        return a + mb.value;
    }).setLabel('tensP2');
    // tens = [tens, units] |> one_of
    var tensP = (0, _parsers.choice)([tensP2, unitsP]);

    console.log('Using tensP');
    logToScreen('ten', tensP);
    logToScreen('eleven', tensP);
    logToScreen('twenty', tensP);
    logToScreen('twentyfour', tensP);
    logToScreen('twenty four', tensP);
    logToScreen('twenty-three', tensP);
    logToScreen('ninety', tensP);
    logToScreen('ninetyseven', tensP);
    logToScreen('ninety-seven', tensP);
    logToScreen('seventeen', tensP);

    // hundreds = lex("hundred") |> replace_with(100)
    var hundredsP1 = (0, _parsers.pword)('hundred').fmap(function (_) {
        return 100;
    });
    // hundreds = [tens, maybe(hundreds, default: 1)] |> bind(mul)
    var hundredsP2 = (0, _parsers.opt)(tensP, 1).andThen((0, _parsers.opt)(hundredsP1, 100)).fmap(function (_ref3) {
        var _ref4 = _slicedToArray(_ref3, 2),
            mt = _ref4[0],
            mh = _ref4[1];

        return mt.value * mh.value;
    }).setLabel('hundredsP2');
    // hundreds = [hundreds, skip(maybe(lex("and"))), maybe(tens, default: 0)] |> bind(sum)
    var hundredsP = hundredsP2.discardSecond((0, _parsers.opt)((0, _parsers.pword)('and'))).andThen((0, _parsers.opt)(tensP, 0)).fmap(function (_ref5) {
        var _ref6 = _slicedToArray(_ref5, 2),
            h = _ref6[0],
            mt = _ref6[1];

        return h + mt.value;
    }).setLabel('hundredsP');

    console.log('Using hundredsP');
    // logToScreen('hundred', hundredsP);
    //logToScreen('one hundred', hundredsP);
    logToScreen('hundredten', hundredsP);
    logToScreen('hundred ten', hundredsP);
    logToScreen('hundred eleven', hundredsP);
    logToScreen('one hundredeleven', hundredsP);
    logToScreen('one hundred and ten', hundredsP);
    logToScreen('two hundred and ten', hundredsP);
    logToScreen('nine hundred and twentyfour', hundredsP);
    logToScreen('nine hundred and twenty-four', hundredsP);
    logToScreen('nine hundred and twenty four', hundredsP);

    // scales = one_of(for {word, value} <- scale_values, do: lex(word) |> replace_with(value))
    var scales = Object.keys(scale_values).map(function (value) {
        return (0, _parsers.pword)(value).fmap(function (_) {
            return scale_values[value];
        }).setLabel('scale_value(' + value + ')');
    });
    var scalesP = (0, _parsers.choice)(scales);

    console.log('Using choice(Object.keys(scale_values).map(value => pword(value).fmap(_ => scale_values[value])));');
    logToScreen('thousand', scalesP);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2V4YW1wbGVzLzAzX3dvcmRzX3RvX251bWJlcnMuanMiXSwibmFtZXMiOlsidW5pdF92YWx1ZXMiLCJ6ZXJvIiwib25lIiwidHdvIiwidGhyZWUiLCJmb3VyIiwiZml2ZSIsInNpeCIsInNldmVuIiwiZWlnaHQiLCJuaW5lIiwidGVuIiwiZWxldmVuIiwidHdlbHZlIiwidGhpcnRlZW4iLCJmb3VydGVlbiIsImZpZnRlZW4iLCJzaXh0ZWVuIiwic2V2ZW50ZWVuIiwiZWlnaHRlZW4iLCJuaW5ldGVlbiIsInRlbnNfdmFsdWVzIiwidHdlbnR5IiwidGhpcnR5IiwiZm9ydHkiLCJmaWZ0eSIsInNpeHR5Iiwic2V2ZW50eSIsImVpZ2h0eSIsIm5pbmV0eSIsInNjYWxlX3ZhbHVlcyIsInRob3VzYW5kIiwibWlsbGlvbiIsImJpbGxpb24iLCJ0cmlsbGlvbiIsImNvbnNvbGUiLCJsb2ciLCJwcm9kdWN0UmVkdWNlciIsImFycmEiLCJyZWR1Y2UiLCJhY2MiLCJjdXJyIiwic3VtUmVkdWNlciIsInVuaXRzIiwiT2JqZWN0Iiwia2V5cyIsInJldmVyc2UiLCJtYXAiLCJ2YWx1ZSIsImZtYXAiLCJ1bml0c1AiLCJzZXRMYWJlbCIsImxvZ1RvU2NyZWVuIiwidGVucyIsInRlbnNQMSIsInRlbnNQMiIsImRpc2NhcmRTZWNvbmQiLCJhbmRUaGVuIiwiYSIsIm1iIiwidGVuc1AiLCJodW5kcmVkc1AxIiwiaHVuZHJlZHNQMiIsIm10IiwibWgiLCJodW5kcmVkc1AiLCJoIiwic2NhbGVzIiwic2NhbGVzUCIsInN0ciIsInBhcnNlciIsInJ1biIsInRvU3RyaW5nIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQStDQSxRQUFNQSxjQUFjO0FBQ2hCQyxjQUFNLENBRFU7QUFFaEJDLGFBQUssQ0FGVztBQUdoQkMsYUFBSyxDQUhXO0FBSWhCQyxlQUFPLENBSlM7QUFLaEJDLGNBQU0sQ0FMVTtBQU1oQkMsY0FBTSxD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QWdCckIsS0FBaEIsQ0FBc0IsQ0FBdEIsRUFBeUJ3QixRQUF6QixFQUFuQztBQUNIIiwiZmlsZSI6IjAzX3dvcmRzX3RvX251bWJlcnMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICAgIEpWYWx1ZSxcbiAgICBUdXBsZSxcbn0gZnJvbSAnY2xhc3Nlcyc7XG5pbXBvcnQge1xuICAgIFZhbGlkYXRpb24sXG59IGZyb20gJ3ZhbGlkYXRpb24nO1xuaW1wb3J0IHtcbiAgICBwYXJzZXIsXG4gICAgY2hhclBhcnNlcixcbiAgICBkaWdpdFBhcnNlcixcbiAgICBwcmVkaWNhdGVCYXNlZFBhcnNlcixcbiAgICBwY2hhcixcbiAgICBwZGlnaXQsXG4gICAgYW5kVGhlbixcbiAgICBvckVsc2UsXG4gICAgY2hvaWNlLFxuICAgIGFueU9mLFxuICAgIGZtYXAsXG4gICAgcmV0dXJuUCxcbiAgICBhcHBseVAsXG4gICAgbGlmdDIsXG4gICAgc2VxdWVuY2VQLFxuICAgIHNlcXVlbmNlUDIsXG4gICAgcHN0cmluZyxcbiAgICB6ZXJvT3JNb3JlLFxuICAgIG1hbnksXG4gICAgbWFueTEsXG4gICAgbWFueUNoYXJzLFxuICAgIG1hbnlDaGFyczEsXG4gICAgb3B0LFxuICAgIG9wdEJvb2ssXG4gICAgZGlzY2FyZEZpcnN0LFxuICAgIGRpc2NhcmRTZWNvbmQsXG4gICAgYmV0d2VlbixcbiAgICBiZXR3ZWVuUGFyZW5zLFxuICAgIHNlcEJ5MSxcbiAgICBsb3dlcmNhc2VQLFxuICAgIHVwcGVyY2FzZVAsXG4gICAgbGV0dGVyUCxcbiAgICBkaWdpdFAsXG4gICAgd2hpdGVQLFxuICAgIHRhcFAsXG4gICAgbG9nUCxcbiAgICBwd29yZCxcbn0gZnJvbSAncGFyc2Vycyc7XG5cbmNvbnN0IHVuaXRfdmFsdWVzID0ge1xuICAgIHplcm86IDAsXG4gICAgb25lOiAxLFxuICAgIHR3bzogMixcbiAgICB0aHJlZTogMyxcbiAgICBmb3VyOiA0LFxuICAgIGZpdmU6IDUsXG4gICAgc2l4OiA2LFxuICAgIHNldmVuOiA3LFxuICAgIGVpZ2h0OiA4LFxuICAgIG5pbmU6IDksXG4gICAgdGVuOiAxMCxcbiAgICBlbGV2ZW46IDExLFxuICAgIHR3ZWx2ZTogMTIsXG4gICAgdGhpcnRlZW46IDEzLFxuICAgIGZvdXJ0ZWVuOiAxNCxcbiAgICBmaWZ0ZWVuOiAxNSxcbiAgICBzaXh0ZWVuOiAxNixcbiAgICBzZXZlbnRlZW46IDE3LFxuICAgIGVpZ2h0ZWVuOiAxOCxcbiAgICBuaW5ldGVlbjogMTksXG59O1xuXG5jb25zdCB0ZW5zX3ZhbHVlcyA9IHtcbiAgICB0d2VudHk6IDIwLFxuICAgIHRoaXJ0eTogMzAsXG4gICAgZm9ydHk6IDQwLFxuICAgIGZpZnR5OiA1MCxcbiAgICBzaXh0eTogNjAsXG4gICAgc2V2ZW50eTogNzAsXG4gICAgZWlnaHR5OiA4MCxcbiAgICBuaW5ldHk6IDkwLFxufTtcblxuY29uc3Qgc2NhbGVfdmFsdWVzID0ge1xuICAgIHRob3VzYW5kOiAxMDAwLFxuICAgIG1pbGxpb246IDEwMDAwMDAsXG4gICAgYmlsbGlvbjogMTAwMDAwMDAwMCxcbiAgICB0cmlsbGlvbjogMTAwMDAwMDAwMDAwMCxcbn07XG5cbmNvbnNvbGUubG9nKCdcXG4wM193b3Jkc190b19udW1iZXJzLmpzJyk7XG5cbi8vIG11bCA9IGZuIG5zIC0+IEVudW0ucmVkdWNlKG5zLCAxLCAmS2VybmVsLiovMikgZW5kXG5jb25zdCBwcm9kdWN0UmVkdWNlciA9IGFycmEgPT4gYXJyYS5yZWR1Y2UoKGFjYywgY3VycikgPT4gYWNjICogY3VyciwgMSk7XG4vLyBzdW0gPSBmbiBucyAtPiBFbnVtLnJlZHVjZShucywgMCwgJktlcm5lbC4rLzIpIGVuZFxuY29uc3Qgc3VtUmVkdWNlciA9IGFycmEgPT4gYXJyYS5yZWR1Y2UoKGFjYywgY3VycikgPT4gYWNjICsgY3VyciwgMCk7XG5cbi8vIHVuaXRzID0gb25lX29mKGZvciB7d29yZCwgdmFsdWV9IDwtIHVuaXRfdmFsdWVzLCBkbzogbGV4KHdvcmQpIHw+IHJlcGxhY2Vfd2l0aCh2YWx1ZSkpXG5jb25zdCB1bml0cyA9IE9iamVjdC5rZXlzKHVuaXRfdmFsdWVzKS5yZXZlcnNlKClcbiAgICAubWFwKHZhbHVlID0+IHB3b3JkKHZhbHVlKS5mbWFwKF8gPT4gdW5pdF92YWx1ZXNbdmFsdWVdKSk7XG5jb25zdCB1bml0c1AgPSBjaG9pY2UodW5pdHMpLnNldExhYmVsKCd1bml0c1AnKTtcblxuY29uc29sZS5sb2coJ1VzaW5nIGNob2ljZShPYmplY3Qua2V5cyh1bml0X3ZhbHVlcykubWFwKHZhbHVlID0+IHB3b3JkKHZhbHVlKS5mbWFwKF8gPT4gdW5pdF92YWx1ZXNbdmFsdWVdKSkpOycpO1xubG9nVG9TY3JlZW4oJ29uZScsIHVuaXRzUCk7XG5sb2dUb1NjcmVlbigndGhpcnRlZW4nLCB1bml0c1ApO1xubG9nVG9TY3JlZW4oJ2VpZ2h0ZWVuJywgdW5pdHNQKTtcblxuLy8gdGVucyA9IG9uZV9vZihmb3Ige3dvcmQsIHZhbHVlfSA8LSB0ZW5zX3ZhbHVlcywgZG86IGxleCh3b3JkKSB8PiByZXBsYWNlX3dpdGgodmFsdWUpKVxuY29uc3QgdGVucyA9IE9iamVjdC5rZXlzKHRlbnNfdmFsdWVzKS5tYXAodmFsdWUgPT4gcHdvcmQodmFsdWUpLmZtYXAoXyA9PiB0ZW5zX3ZhbHVlc1t2YWx1ZV0pKTtcbmNvbnN0IHRlbnNQMSA9IGNob2ljZSh0ZW5zKTtcbi8vIHRlbnMgPSBbdGVucywgc2tpcChtYXliZShsZXgoXCItXCIpKSksIG1heWJlKHVuaXRzLCBkZWZhdWx0OiAwKV0gfD4gYmluZChzdW0pXG5jb25zdCB0ZW5zUDIgPSB0ZW5zUDEuZGlzY2FyZFNlY29uZChvcHQocGNoYXIoJy0nKSkpXG4gICAgLmFuZFRoZW4ob3B0KHVuaXRzUCwgMCkpLmZtYXAoKFthLCBtYl0pID0+IHtcbiAgICAgICAgcmV0dXJuIGEgKyBtYi52YWx1ZTtcbiAgICB9KS5zZXRMYWJlbCgndGVuc1AyJyk7XG4vLyB0ZW5zID0gW3RlbnMsIHVuaXRzXSB8PiBvbmVfb2ZcbmNvbnN0IHRlbnNQID0gY2hvaWNlKFt0ZW5zUDIsIHVuaXRzUF0pO1xuXG5jb25zb2xlLmxvZygnVXNpbmcgdGVuc1AnKTtcbmxvZ1RvU2NyZWVuKCd0ZW4nLCB0ZW5zUCk7XG5sb2dUb1NjcmVlbignZWxldmVuJywgdGVuc1ApO1xubG9nVG9TY3JlZW4oJ3R3ZW50eScsIHRlbnNQKTtcbmxvZ1RvU2NyZWVuKCd0d2VudHlmb3VyJywgdGVuc1ApO1xubG9nVG9TY3JlZW4oJ3R3ZW50eSBmb3VyJywgdGVuc1ApO1xubG9nVG9TY3JlZW4oJ3R3ZW50eS10aHJlZScsIHRlbnNQKTtcbmxvZ1RvU2NyZWVuKCduaW5ldHknLCB0ZW5zUCk7XG5sb2dUb1NjcmVlbignbmluZXR5c2V2ZW4nLCB0ZW5zUCk7XG5sb2dUb1NjcmVlbignbmluZXR5LXNldmVuJywgdGVuc1ApO1xubG9nVG9TY3JlZW4oJ3NldmVudGVlbicsIHRlbnNQKTtcblxuLy8gaHVuZHJlZHMgPSBsZXgoXCJodW5kcmVkXCIpIHw+IHJlcGxhY2Vfd2l0aCgxMDApXG5jb25zdCBodW5kcmVkc1AxID0gcHdvcmQoJ2h1bmRyZWQnKS5mbWFwKF8gPT4gMTAwKTtcbi8vIGh1bmRyZWRzID0gW3RlbnMsIG1heWJlKGh1bmRyZWRzLCBkZWZhdWx0OiAxKV0gfD4gYmluZChtdWwpXG5jb25zdCBodW5kcmVkc1AyID0gb3B0KHRlbnNQLCAxKVxuICAgIC5hbmRUaGVuKG9wdChodW5kcmVkc1AxLCAxMDApKS5mbWFwKChbbXQsIG1oXSkgPT4gbXQudmFsdWUgKiBtaC52YWx1ZSlcbiAgICAuc2V0TGFiZWwoJ2h1bmRyZWRzUDInKTtcbi8vIGh1bmRyZWRzID0gW2h1bmRyZWRzLCBza2lwKG1heWJlKGxleChcImFuZFwiKSkpLCBtYXliZSh0ZW5zLCBkZWZhdWx0OiAwKV0gfD4gYmluZChzdW0pXG5jb25zdCBodW5kcmVkc1AgPSBodW5kcmVkc1AyXG4gICAgLmRpc2NhcmRTZWNvbmQob3B0KHB3b3JkKCdhbmQnKSkpXG4gICAgLmFuZFRoZW4ob3B0KHRlbnNQLCAwKSkuZm1hcCgoW2gsIG10XSkgPT4ge1xuICAgICAgICByZXR1cm4gaCArIG10LnZhbHVlO1xuICAgIH0pXG4gICAgLnNldExhYmVsKCdodW5kcmVkc1AnKTtcblxuY29uc29sZS5sb2coJ1VzaW5nIGh1bmRyZWRzUCcpO1xuLy8gbG9nVG9TY3JlZW4oJ2h1bmRyZWQnLCBodW5kcmVkc1ApO1xuLy9sb2dUb1NjcmVlbignb25lIGh1bmRyZWQnLCBodW5kcmVkc1ApO1xubG9nVG9TY3JlZW4oJ2h1bmRyZWR0ZW4nLCBodW5kcmVkc1ApO1xubG9nVG9TY3JlZW4oJ2h1bmRyZWQgdGVuJywgaHVuZHJlZHNQKTtcbmxvZ1RvU2NyZWVuKCdodW5kcmVkIGVsZXZlbicsIGh1bmRyZWRzUCk7XG5sb2dUb1NjcmVlbignb25lIGh1bmRyZWRlbGV2ZW4nLCBodW5kcmVkc1ApO1xubG9nVG9TY3JlZW4oJ29uZSBodW5kcmVkIGFuZCB0ZW4nLCBodW5kcmVkc1ApO1xubG9nVG9TY3JlZW4oJ3R3byBodW5kcmVkIGFuZCB0ZW4nLCBodW5kcmVkc1ApO1xubG9nVG9TY3JlZW4oJ25pbmUgaHVuZHJlZCBhbmQgdHdlbnR5Zm91cicsIGh1bmRyZWRzUCk7XG5sb2dUb1NjcmVlbignbmluZSBodW5kcmVkIGFuZCB0d2VudHktZm91cicsIGh1bmRyZWRzUCk7XG5sb2dUb1NjcmVlbignbmluZSBodW5kcmVkIGFuZCB0d2VudHkgZm91cicsIGh1bmRyZWRzUCk7XG5cbi8vIHNjYWxlcyA9IG9uZV9vZihmb3Ige3dvcmQsIHZhbHVlfSA8LSBzY2FsZV92YWx1ZXMsIGRvOiBsZXgod29yZCkgfD4gcmVwbGFjZV93aXRoKHZhbHVlKSlcbmNvbnN0IHNjYWxlcyA9IE9iamVjdC5rZXlzKHNjYWxlX3ZhbHVlcykubWFwKHZhbHVlID0+IHB3b3JkKHZhbHVlKVxuICAgIC5mbWFwKF8gPT4gc2NhbGVfdmFsdWVzW3ZhbHVlXSkuc2V0TGFiZWwoJ3NjYWxlX3ZhbHVlKCcgKyB2YWx1ZSArICcpJykpO1xuY29uc3Qgc2NhbGVzUCA9IGNob2ljZShzY2FsZXMpO1xuXG5jb25zb2xlLmxvZygnVXNpbmcgY2hvaWNlKE9iamVjdC5rZXlzKHNjYWxlX3ZhbHVlcykubWFwKHZhbHVlID0+IHB3b3JkKHZhbHVlKS5mbWFwKF8gPT4gc2NhbGVfdmFsdWVzW3ZhbHVlXSkpKTsnKTtcbmxvZ1RvU2NyZWVuKCd0aG91c2FuZCcsIHNjYWxlc1ApO1xubG9nVG9TY3JlZW4oJ21pbGxpb24nLCBzY2FsZXNQKTtcbmxvZ1RvU2NyZWVuKCd0cmlsbGlvbicsIHNjYWxlc1ApO1xuXG4vLyBudW1iZXIgPSBbb25lX29mKFtodW5kcmVkcywgdGVuc10pLCBtYXliZShzY2FsZXMsIGRlZmF1bHQ6IDEpXSB8PiBiaW5kKG11bClcbi8vIG51bWJlciA9IG51bWJlciB8PiBzZXBhcmF0ZWRfYnkobWF5YmUobGV4KFwiYW5kXCIpKSkgfD4gYmluZChzdW0pXG4vL1xuLy9cbi8vIHBhcnNlKFwib25lXCIsIG51bWJlcikgfD4gSU8uaW5zcGVjdFxuLy8gIyA+PiB7Om9rLCAxfVxuLy8gcGFyc2UoXCJ0d2VudHlcIiwgbnVtYmVyKSB8PiBJTy5pbnNwZWN0XG4vLyAjID4+IHs6b2ssIDIwfVxuLy8gcGFyc2UoXCJ0d2VudHktdHdvXCIsIG51bWJlcikgfD4gSU8uaW5zcGVjdFxuLy8gIyA+PiB7Om9rLCAyMn1cbi8vIHBhcnNlKFwic2V2ZW50eS1zZXZlblwiLCBudW1iZXIpIHw+IElPLmluc3BlY3Rcbi8vICMgPj4gezpvaywgNzd9XG4vLyBwYXJzZShcIm9uZSBodW5kcmVkXCIsIG51bWJlcikgfD4gSU8uaW5zcGVjdFxuLy8gIyA+PiB7Om9rLCAxMDB9XG4vLyBwYXJzZShcIm9uZSBodW5kcmVkIHR3ZW50eVwiLCBudW1iZXIpIHw+IElPLmluc3BlY3Rcbi8vICMgPj4gezpvaywgMTIwfVxuLy8gcGFyc2UoXCJvbmUgaHVuZHJlZCBhbmQgdHdlbnR5XCIsIG51bWJlcikgfD4gSU8uaW5zcGVjdFxuLy8gIyA+PiB7Om9rLCAxMjB9XG4vLyBwYXJzZShcIm9uZSBodW5kcmVkIGFuZCB0d2VudHktdHdvXCIsIG51bWJlcikgfD4gSU8uaW5zcGVjdFxuLy8gIyA+PiB7Om9rLCAxMjJ9XG4vLyBwYXJzZShcIm9uZSBodW5kcmVkIGFuZCB0d2VudHkgdGhyZWVcIiwgbnVtYmVyKSB8PiBJTy5pbnNwZWN0XG4vLyAjID4+IHs6b2ssIDEyM31cbi8vIHBhcnNlKFwidHdlbHZlIGh1bmRyZWQgYW5kIHR3ZW50eS10d29cIiwgbnVtYmVyKSB8PiBJTy5pbnNwZWN0XG4vLyAjID4+IHs6b2ssIDEyMjJ9XG4vLyBwYXJzZShcIm9uZSB0aG91c2FuZFwiLCBudW1iZXIpIHw+IElPLmluc3BlY3Rcbi8vICMgPj4gezpvaywgMTAwMH1cbi8vIHBhcnNlKFwidHdlbnR5IHRob3VzYW5kXCIsIG51bWJlcikgfD4gSU8uaW5zcGVjdFxuLy8gIyA+PiB7Om9rLCAyMDAwMH1cbi8vIHBhcnNlKFwidHdlbnR5LXR3byB0aG91c2FuZFwiLCBudW1iZXIpIHw+IElPLmluc3BlY3Rcbi8vICMgPj4gezpvaywgMjIwMDB9XG4vLyBwYXJzZShcIm9uZSBodW5kcmVkIHRob3VzYW5kXCIsIG51bWJlcikgfD4gSU8uaW5zcGVjdFxuLy8gIyA+PiB7Om9rLCAxMDAwMDB9XG4vLyBwYXJzZShcInR3ZWx2ZSBodW5kcmVkIGFuZCB0d2VudHktdHdvIHRob3VzYW5kXCIsIG51bWJlcikgfD4gSU8uaW5zcGVjdFxuLy8gIyA+PiB7Om9rLCAxMjIyMDAwfVxuLy8gcGFyc2UoXCJvbmUgaHVuZHJlZCBhbmQgdHdlbnR5IHRocmVlIG1pbGxpb25cIiwgbnVtYmVyKSB8PiBJTy5pbnNwZWN0XG4vLyAjID4+IHs6b2ssIDEyMzAwMDAwMH1cbi8vIHBhcnNlKFwib25lIGh1bmRyZWQgYW5kIHR3ZW50eSB0aHJlZSBtaWxsaW9uIGFuZCB0aHJlZVwiLCBudW1iZXIpIHw+IElPLmluc3BlY3Rcbi8vICMgPj4gezpvaywgMTIzMDAwMDAzfVxuLy8gcGFyc2UoXCJzZXZlbnR5LXNldmVuIHRob3VzYW5kIGVpZ2h0IGh1bmRyZWQgYW5kIG5pbmV0ZWVuXCIsIG51bWJlcikgfD4gSU8uaW5zcGVjdFxuLy8gIyA+PiB7Om9rLCA3NzgxOX1cbi8vIHBhcnNlKFwic2V2ZW4gaHVuZHJlZCBzZXZlbnR5LXNldmVuIHRob3VzYW5kIHNldmVuIGh1bmRyZWQgYW5kIHNldmVudHktc2V2ZW5cIiwgbnVtYmVyKSB8PiBJTy5pbnNwZWN0XG4vLyAjID4+IHs6b2ssIDc3Nzc3N31cblxuZnVuY3Rpb24gbG9nVG9TY3JlZW4oc3RyLCBwYXJzZXIpIHtcbiAgICBjb25zb2xlLmxvZygnXCInICsgc3RyICsgJ1wiIC0tPiAnICsgcGFyc2VyLnJ1bihzdHIpLnZhbHVlWzBdLnRvU3RyaW5nKCkpO1xufVxuIl19