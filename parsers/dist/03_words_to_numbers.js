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
    var hundredsP2 = (0, _parsers.opt)(tensP, 1).andThen(hundredsP1).fmap(function (_ref3) {
        var _ref4 = _slicedToArray(_ref3, 2),
            mt = _ref4[0],
            h = _ref4[1];

        return mt.value * h;
    }).setLabel('hundredsP2');
    // hundreds = [hundreds, skip(maybe(lex("and"))), maybe(tens, default: 0)] |> bind(sum)
    var hundredsP = hundredsP2.discardSecond((0, _parsers.opt)((0, _parsers.pword)('and'))).andThen((0, _parsers.opt)(tensP, 0)).fmap(function (_ref5) {
        var _ref6 = _slicedToArray(_ref5, 2),
            h = _ref6[0],
            mt = _ref6[1];

        return h + mt.value;
    }).setLabel('hundredsP');

    console.log('Using hundredsP');
    logToScreen('one', hundredsP);
    logToScreen('hundred', hundredsP);
    logToScreen('one hundred', hundredsP);
    logToScreen('hundredten', hundredsP);
    logToScreen('hundred ten', hundredsP);
    logToScreen('hundred eleven', hundredsP);
    logToScreen('one hundredeleven', hundredsP);
    logToScreen('one hundred and ten', hundredsP);
    logToScreen('two hundred and ten', hundredsP);
    logToScreen('nine hundred and twentyfour', hundredsP);
    logToScreen('nine hundred and twenty-four', hundredsP);
    logToScreen('nine hundred and twenty four', hundredsP);
    logToScreen('twelve hundred and twenty-two', hundredsP);

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

    var numberP1 = (0, _parsers.choice)([hundredsP, tensP]).andThen((0, _parsers.opt)(scalesP, 1)).fmap(function (_ref7) {
        var _ref8 = _slicedToArray(_ref7, 2),
            n = _ref8[0],
            ms = _ref8[1];

        /*debugger;*/
        return n * ms.value;
    }).setLabel('numberP1');
    var numberP = numberP1.discardSecond((0, _parsers.opt)((0, _parsers.pword)('and'))).andThen((0, _parsers.opt)(hundredsP, 0)).fmap(function (_ref9) {
        var _ref10 = _slicedToArray(_ref9, 2),
            n = _ref10[0],
            mh = _ref10[1];

        /*debugger;*/
        return n + mh.value;
    }).setLabel('numberP');
    console.log('Using (choice(hundredsP, tensP).andThen(opt(scalesP, 1)).fmap(([n, ms]) => n * ms.value)).discardSecond(opt(pword(\'and\'))).andThen(opt(hundredsP, 0)).fmap(([n, mh]) => n + mh.value);');

    logToScreen('one', numberP);
    // parse("one", number) |> IO.inspect
    // # >> {:ok, 1}
    logToScreen('twenty', numberP);
    // parse("twenty", number) |> IO.inspect
    // # >> {:ok, 20}
    logToScreen('twenty-two', numberP);
    // parse("twenty-two", number) |> IO.inspect
    // # >> {:ok, 22}
    logToScreen('seventy-seven', numberP);
    // parse("seventy-seven", number) |> IO.inspect
    // # >> {:ok, 77}
    logToScreen('one hundred', numberP);
    // parse("one hundred", number) |> IO.inspect
    // # >> {:ok, 100}
    logToScreen('one hundred twenty', numberP);
    // parse("one hundred twenty", number) |> IO.inspect
    // # >> {:ok, 120}
    logToScreen('one hundred and twenty', numberP);
    // parse("one hundred and twenty", number) |> IO.inspect
    // # >> {:ok, 120}
    logToScreen('one hundred and twenty-two', numberP);
    // parse("one hundred and twenty-two", number) |> IO.inspect
    // # >> {:ok, 122}
    logToScreen('one hundred and twenty three', numberP);
    // parse("one hundred and twenty three", number) |> IO.inspect
    // # >> {:ok, 123}
    logToScreen('twelve hundred and twenty-two', numberP);
    // parse("twelve hundred and twenty-two", number) |> IO.inspect
    // # >> {:ok, 1222}
    logToScreen('one thousand', numberP);
    // parse("one thousand", number) |> IO.inspect
    // # >> {:ok, 1000}
    logToScreen('twenty thousand', numberP);
    // parse("twenty thousand", number) |> IO.inspect
    // # >> {:ok, 20000}
    logToScreen('twenty-two thousand', numberP);
    // parse("twenty-two thousand", number) |> IO.inspect
    // # >> {:ok, 22000}
    logToScreen('one hundred thousand', numberP);
    // parse("one hundred thousand", number) |> IO.inspect
    // # >> {:ok, 100000}
    logToScreen('twelve hundred and twenty-two thousand', numberP);
    // parse("twelve hundred and twenty-two thousand", number) |> IO.inspect
    // # >> {:ok, 1222000}
    logToScreen('one hundred and twenty three million', numberP);
    // parse("one hundred and twenty three million", number) |> IO.inspect
    // # >> {:ok, 123000000}
    logToScreen('one hundred and twenty three million and three', numberP);
    // parse("one hundred and twenty three million and three", number) |> IO.inspect
    // # >> {:ok, 123000003}
    logToScreen('seventy-seven thousand eight hundred and nineteen', numberP);
    // parse("seventy-seven thousand eight hundred and nineteen", number) |> IO.inspect
    // # >> {:ok, 77819}
    logToScreen('seven hundred seventy-seven thousand seven hundred and seventy-seven', numberP);
    // parse("seven hundred seventy-seven thousand seven hundred and seventy-seven", number) |> IO.inspect
    // # >> {:ok, 777777}

    function logToScreen(str, parser) {
        var result = parser.run(str);
        var outcome = result.isSuccess ? result.value[0].toString() : 'Failure';
        console.log('"' + str + '" --> ' + outcome);
    }
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2V4YW1wbGVzLzAzX3dvcmRzX3RvX251bWJlcnMuanMiXSwibmFtZXMiOlsidW5pdF92YWx1ZXMiLCJ6ZXJvIiwib25lIiwidHdvIiwidGhyZWUiLCJmb3VyIiwiZml2ZSIsInNpeCIsInNldmVuIiwiZWlnaHQiLCJuaW5lIiwidGVuIiwiZWxldmVuIiwidHdlbHZlIiwidGhpcnRlZW4iLCJmb3VydGVlbiIsImZpZnRlZW4iLCJzaXh0ZWVuIiwic2V2ZW50ZWVuIiwiZWlnaHRlZW4iLCJuaW5ldGVlbiIsInRlbnNfdmFsdWVzIiwidHdlbnR5IiwidGhpcnR5IiwiZm9ydHkiLCJmaWZ0eSIsInNpeHR5Iiwic2V2ZW50eSIsImVpZ2h0eSIsIm5pbmV0eSIsInNjYWxlX3ZhbHVlcyIsInRob3VzYW5kIiwibWlsbGlvbiIsImJpbGxpb24iLCJ0cmlsbGlvbiIsImNvbnNvbGUiLCJsb2ciLCJ1bml0cyIsIk9iamVjdCIsImtleXMiLCJyZXZlcnNlIiwibWFwIiwidmFsdWUiLCJmbWFwIiwidW5pdHNQIiwic2V0TGFiZWwiLCJsb2dUb1NjcmVlbiIsInRlbnMiLCJ0ZW5zUDEiLCJ0ZW5zUDIiLCJkaXNjYXJkU2Vjb25kIiwiYW5kVGhlbiIsImEiLCJtYiIsInRlbnNQIiwiaHVuZHJlZHNQMSIsImh1bmRyZWRzUDIiLCJtdCIsImgiLCJodW5kcmVkc1AiLCJzY2FsZXMiLCJzY2FsZXNQIiwibnVtYmVyUDEiLCJuIiwibXMiLCJudW1iZXJQIiwibWgiLCJzdHIiLCJwYXJzZXIiLCJyZXN1bHQiLCJydW4iLCJvdXRjb21lIiwiaXNTdWNjZXNzIiwidG9TdHJpbmciXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBK0NBLFFBQU1BLGNBQWM7QUFDaEJDLGNBQU0sQ0FEVTtBQUVoQkMsYUFBSyxDQUZXO0FBR2hCQyxhQUFLLENBSFc7QUFJaEJDLGVBQU8sQ0FKUztBQUtoQkMsY0FBTSxDQUxVO0FBTWhCQyxjQUFN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YSxDQUFiLEVBQWdCK0IsUUFBaEIsRUFBckIsR0FBa0QsU0FBbEU7QUFDQXRDLGdCQUFRQyxHQUFSLENBQVksTUFBTStCLEdBQU4sR0FBWSxRQUFaLEdBQXVCSSxPQUFuQztBQUNIIiwiZmlsZSI6IjAzX3dvcmRzX3RvX251bWJlcnMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICAgIEpWYWx1ZSxcbiAgICBUdXBsZSxcbn0gZnJvbSAnY2xhc3Nlcyc7XG5pbXBvcnQge1xuICAgIFZhbGlkYXRpb24sXG59IGZyb20gJ3ZhbGlkYXRpb24nO1xuaW1wb3J0IHtcbiAgICBwYXJzZXIsXG4gICAgY2hhclBhcnNlcixcbiAgICBkaWdpdFBhcnNlcixcbiAgICBwcmVkaWNhdGVCYXNlZFBhcnNlcixcbiAgICBwY2hhcixcbiAgICBwZGlnaXQsXG4gICAgYW5kVGhlbixcbiAgICBvckVsc2UsXG4gICAgY2hvaWNlLFxuICAgIGFueU9mLFxuICAgIGZtYXAsXG4gICAgcmV0dXJuUCxcbiAgICBhcHBseVAsXG4gICAgbGlmdDIsXG4gICAgc2VxdWVuY2VQLFxuICAgIHNlcXVlbmNlUDIsXG4gICAgcHN0cmluZyxcbiAgICB6ZXJvT3JNb3JlLFxuICAgIG1hbnksXG4gICAgbWFueTEsXG4gICAgbWFueUNoYXJzLFxuICAgIG1hbnlDaGFyczEsXG4gICAgb3B0LFxuICAgIG9wdEJvb2ssXG4gICAgZGlzY2FyZEZpcnN0LFxuICAgIGRpc2NhcmRTZWNvbmQsXG4gICAgYmV0d2VlbixcbiAgICBiZXR3ZWVuUGFyZW5zLFxuICAgIHNlcEJ5MSxcbiAgICBsb3dlcmNhc2VQLFxuICAgIHVwcGVyY2FzZVAsXG4gICAgbGV0dGVyUCxcbiAgICBkaWdpdFAsXG4gICAgd2hpdGVQLFxuICAgIHRhcFAsXG4gICAgbG9nUCxcbiAgICBwd29yZCxcbn0gZnJvbSAncGFyc2Vycyc7XG5cbmNvbnN0IHVuaXRfdmFsdWVzID0ge1xuICAgIHplcm86IDAsXG4gICAgb25lOiAxLFxuICAgIHR3bzogMixcbiAgICB0aHJlZTogMyxcbiAgICBmb3VyOiA0LFxuICAgIGZpdmU6IDUsXG4gICAgc2l4OiA2LFxuICAgIHNldmVuOiA3LFxuICAgIGVpZ2h0OiA4LFxuICAgIG5pbmU6IDksXG4gICAgdGVuOiAxMCxcbiAgICBlbGV2ZW46IDExLFxuICAgIHR3ZWx2ZTogMTIsXG4gICAgdGhpcnRlZW46IDEzLFxuICAgIGZvdXJ0ZWVuOiAxNCxcbiAgICBmaWZ0ZWVuOiAxNSxcbiAgICBzaXh0ZWVuOiAxNixcbiAgICBzZXZlbnRlZW46IDE3LFxuICAgIGVpZ2h0ZWVuOiAxOCxcbiAgICBuaW5ldGVlbjogMTksXG59O1xuXG5jb25zdCB0ZW5zX3ZhbHVlcyA9IHtcbiAgICB0d2VudHk6IDIwLFxuICAgIHRoaXJ0eTogMzAsXG4gICAgZm9ydHk6IDQwLFxuICAgIGZpZnR5OiA1MCxcbiAgICBzaXh0eTogNjAsXG4gICAgc2V2ZW50eTogNzAsXG4gICAgZWlnaHR5OiA4MCxcbiAgICBuaW5ldHk6IDkwLFxufTtcblxuY29uc3Qgc2NhbGVfdmFsdWVzID0ge1xuICAgIHRob3VzYW5kOiAxMDAwLFxuICAgIG1pbGxpb246IDEwMDAwMDAsXG4gICAgYmlsbGlvbjogMTAwMDAwMDAwMCxcbiAgICB0cmlsbGlvbjogMTAwMDAwMDAwMDAwMCxcbn07XG5cbmNvbnNvbGUubG9nKCdcXG4wM193b3Jkc190b19udW1iZXJzLmpzJyk7XG5cbi8vIHVuaXRzID0gb25lX29mKGZvciB7d29yZCwgdmFsdWV9IDwtIHVuaXRfdmFsdWVzLCBkbzogbGV4KHdvcmQpIHw+IHJlcGxhY2Vfd2l0aCh2YWx1ZSkpXG5jb25zdCB1bml0cyA9IE9iamVjdC5rZXlzKHVuaXRfdmFsdWVzKS5yZXZlcnNlKClcbiAgICAubWFwKHZhbHVlID0+IHB3b3JkKHZhbHVlKS5mbWFwKF8gPT4gdW5pdF92YWx1ZXNbdmFsdWVdKSk7XG5jb25zdCB1bml0c1AgPSBjaG9pY2UodW5pdHMpLnNldExhYmVsKCd1bml0c1AnKTtcblxuY29uc29sZS5sb2coJ1VzaW5nIGNob2ljZShPYmplY3Qua2V5cyh1bml0X3ZhbHVlcykubWFwKHZhbHVlID0+IHB3b3JkKHZhbHVlKS5mbWFwKF8gPT4gdW5pdF92YWx1ZXNbdmFsdWVdKSkpOycpO1xubG9nVG9TY3JlZW4oJ29uZScsIHVuaXRzUCk7XG5sb2dUb1NjcmVlbigndGhpcnRlZW4nLCB1bml0c1ApO1xubG9nVG9TY3JlZW4oJ2VpZ2h0ZWVuJywgdW5pdHNQKTtcblxuLy8gdGVucyA9IG9uZV9vZihmb3Ige3dvcmQsIHZhbHVlfSA8LSB0ZW5zX3ZhbHVlcywgZG86IGxleCh3b3JkKSB8PiByZXBsYWNlX3dpdGgodmFsdWUpKVxuY29uc3QgdGVucyA9IE9iamVjdC5rZXlzKHRlbnNfdmFsdWVzKS5tYXAodmFsdWUgPT4gcHdvcmQodmFsdWUpLmZtYXAoXyA9PiB0ZW5zX3ZhbHVlc1t2YWx1ZV0pKTtcbmNvbnN0IHRlbnNQMSA9IGNob2ljZSh0ZW5zKTtcbi8vIHRlbnMgPSBbdGVucywgc2tpcChtYXliZShsZXgoXCItXCIpKSksIG1heWJlKHVuaXRzLCBkZWZhdWx0OiAwKV0gfD4gYmluZChzdW0pXG5jb25zdCB0ZW5zUDIgPSB0ZW5zUDEuZGlzY2FyZFNlY29uZChvcHQocGNoYXIoJy0nKSkpXG4gICAgLmFuZFRoZW4ob3B0KHVuaXRzUCwgMCkpLmZtYXAoKFthLCBtYl0pID0+IHtcbiAgICAgICAgcmV0dXJuIGEgKyBtYi52YWx1ZTtcbiAgICB9KS5zZXRMYWJlbCgndGVuc1AyJyk7XG4vLyB0ZW5zID0gW3RlbnMsIHVuaXRzXSB8PiBvbmVfb2ZcbmNvbnN0IHRlbnNQID0gY2hvaWNlKFt0ZW5zUDIsIHVuaXRzUF0pO1xuXG5jb25zb2xlLmxvZygnVXNpbmcgdGVuc1AnKTtcbmxvZ1RvU2NyZWVuKCd0ZW4nLCB0ZW5zUCk7XG5sb2dUb1NjcmVlbignZWxldmVuJywgdGVuc1ApO1xubG9nVG9TY3JlZW4oJ3R3ZW50eScsIHRlbnNQKTtcbmxvZ1RvU2NyZWVuKCd0d2VudHlmb3VyJywgdGVuc1ApO1xubG9nVG9TY3JlZW4oJ3R3ZW50eSBmb3VyJywgdGVuc1ApO1xubG9nVG9TY3JlZW4oJ3R3ZW50eS10aHJlZScsIHRlbnNQKTtcbmxvZ1RvU2NyZWVuKCduaW5ldHknLCB0ZW5zUCk7XG5sb2dUb1NjcmVlbignbmluZXR5c2V2ZW4nLCB0ZW5zUCk7XG5sb2dUb1NjcmVlbignbmluZXR5LXNldmVuJywgdGVuc1ApO1xubG9nVG9TY3JlZW4oJ3NldmVudGVlbicsIHRlbnNQKTtcblxuLy8gaHVuZHJlZHMgPSBsZXgoXCJodW5kcmVkXCIpIHw+IHJlcGxhY2Vfd2l0aCgxMDApXG5jb25zdCBodW5kcmVkc1AxID0gcHdvcmQoJ2h1bmRyZWQnKS5mbWFwKF8gPT4gMTAwKTtcbi8vIGh1bmRyZWRzID0gW3RlbnMsIG1heWJlKGh1bmRyZWRzLCBkZWZhdWx0OiAxKV0gfD4gYmluZChtdWwpXG5jb25zdCBodW5kcmVkc1AyID0gb3B0KHRlbnNQLCAxKVxuICAgIC5hbmRUaGVuKGh1bmRyZWRzUDEpLmZtYXAoKFttdCwgaF0pID0+IG10LnZhbHVlICogaClcbiAgICAuc2V0TGFiZWwoJ2h1bmRyZWRzUDInKTtcbi8vIGh1bmRyZWRzID0gW2h1bmRyZWRzLCBza2lwKG1heWJlKGxleChcImFuZFwiKSkpLCBtYXliZSh0ZW5zLCBkZWZhdWx0OiAwKV0gfD4gYmluZChzdW0pXG5jb25zdCBodW5kcmVkc1AgPSBodW5kcmVkc1AyXG4gICAgLmRpc2NhcmRTZWNvbmQob3B0KHB3b3JkKCdhbmQnKSkpXG4gICAgLmFuZFRoZW4ob3B0KHRlbnNQLCAwKSkuZm1hcCgoW2gsIG10XSkgPT4ge1xuICAgICAgICByZXR1cm4gaCArIG10LnZhbHVlO1xuICAgIH0pXG4gICAgLnNldExhYmVsKCdodW5kcmVkc1AnKTtcblxuY29uc29sZS5sb2coJ1VzaW5nIGh1bmRyZWRzUCcpO1xubG9nVG9TY3JlZW4oJ29uZScsIGh1bmRyZWRzUCk7XG5sb2dUb1NjcmVlbignaHVuZHJlZCcsIGh1bmRyZWRzUCk7XG5sb2dUb1NjcmVlbignb25lIGh1bmRyZWQnLCBodW5kcmVkc1ApO1xubG9nVG9TY3JlZW4oJ2h1bmRyZWR0ZW4nLCBodW5kcmVkc1ApO1xubG9nVG9TY3JlZW4oJ2h1bmRyZWQgdGVuJywgaHVuZHJlZHNQKTtcbmxvZ1RvU2NyZWVuKCdodW5kcmVkIGVsZXZlbicsIGh1bmRyZWRzUCk7XG5sb2dUb1NjcmVlbignb25lIGh1bmRyZWRlbGV2ZW4nLCBodW5kcmVkc1ApO1xubG9nVG9TY3JlZW4oJ29uZSBodW5kcmVkIGFuZCB0ZW4nLCBodW5kcmVkc1ApO1xubG9nVG9TY3JlZW4oJ3R3byBodW5kcmVkIGFuZCB0ZW4nLCBodW5kcmVkc1ApO1xubG9nVG9TY3JlZW4oJ25pbmUgaHVuZHJlZCBhbmQgdHdlbnR5Zm91cicsIGh1bmRyZWRzUCk7XG5sb2dUb1NjcmVlbignbmluZSBodW5kcmVkIGFuZCB0d2VudHktZm91cicsIGh1bmRyZWRzUCk7XG5sb2dUb1NjcmVlbignbmluZSBodW5kcmVkIGFuZCB0d2VudHkgZm91cicsIGh1bmRyZWRzUCk7XG5sb2dUb1NjcmVlbigndHdlbHZlIGh1bmRyZWQgYW5kIHR3ZW50eS10d28nLCBodW5kcmVkc1ApO1xuXG4vLyBzY2FsZXMgPSBvbmVfb2YoZm9yIHt3b3JkLCB2YWx1ZX0gPC0gc2NhbGVfdmFsdWVzLCBkbzogbGV4KHdvcmQpIHw+IHJlcGxhY2Vfd2l0aCh2YWx1ZSkpXG5jb25zdCBzY2FsZXMgPSBPYmplY3Qua2V5cyhzY2FsZV92YWx1ZXMpLm1hcCh2YWx1ZSA9PiBwd29yZCh2YWx1ZSlcbiAgICAuZm1hcChfID0+IHNjYWxlX3ZhbHVlc1t2YWx1ZV0pLnNldExhYmVsKCdzY2FsZV92YWx1ZSgnICsgdmFsdWUgKyAnKScpKTtcbmNvbnN0IHNjYWxlc1AgPSBjaG9pY2Uoc2NhbGVzKTtcblxuY29uc29sZS5sb2coJ1VzaW5nIGNob2ljZShPYmplY3Qua2V5cyhzY2FsZV92YWx1ZXMpLm1hcCh2YWx1ZSA9PiBwd29yZCh2YWx1ZSkuZm1hcChfID0+IHNjYWxlX3ZhbHVlc1t2YWx1ZV0pKSk7Jyk7XG5sb2dUb1NjcmVlbigndGhvdXNhbmQnLCBzY2FsZXNQKTtcbmxvZ1RvU2NyZWVuKCdtaWxsaW9uJywgc2NhbGVzUCk7XG5sb2dUb1NjcmVlbigndHJpbGxpb24nLCBzY2FsZXNQKTtcblxuLy8gbnVtYmVyID0gW29uZV9vZihbaHVuZHJlZHMsIHRlbnNdKSwgbWF5YmUoc2NhbGVzLCBkZWZhdWx0OiAxKV0gfD4gYmluZChtdWwpXG4vLyBudW1iZXIgPSBudW1iZXIgfD4gc2VwYXJhdGVkX2J5KG1heWJlKGxleChcImFuZFwiKSkpIHw+IGJpbmQoc3VtKVxuXG5jb25zdCBudW1iZXJQMSA9IGNob2ljZShbaHVuZHJlZHNQLCB0ZW5zUF0pXG4gICAgLmFuZFRoZW4ob3B0KHNjYWxlc1AsIDEpKS5mbWFwKChbbiwgbXNdKSA9PiB7LypkZWJ1Z2dlcjsqL1xuICAgICAgICByZXR1cm4gbiAqIG1zLnZhbHVlO1xuICAgIH0pXG4gICAgLnNldExhYmVsKCdudW1iZXJQMScpO1xuY29uc3QgbnVtYmVyUCA9IG51bWJlclAxLmRpc2NhcmRTZWNvbmQob3B0KHB3b3JkKCdhbmQnKSkpXG4gICAgLmFuZFRoZW4ob3B0KGh1bmRyZWRzUCwgMCkpLmZtYXAoKFtuLCBtaF0pID0+IHsvKmRlYnVnZ2VyOyovXG4gICAgICAgIHJldHVybiBuICsgbWgudmFsdWU7XG4gICAgfSlcbiAgICAuc2V0TGFiZWwoJ251bWJlclAnKTtcbmNvbnNvbGUubG9nKCdVc2luZyAoY2hvaWNlKGh1bmRyZWRzUCwgdGVuc1ApLmFuZFRoZW4ob3B0KHNjYWxlc1AsIDEpKS5mbWFwKChbbiwgbXNdKSA9PiBuICogbXMudmFsdWUpKS5kaXNjYXJkU2Vjb25kKG9wdChwd29yZChcXCdhbmRcXCcpKSkuYW5kVGhlbihvcHQoaHVuZHJlZHNQLCAwKSkuZm1hcCgoW24sIG1oXSkgPT4gbiArIG1oLnZhbHVlKTsnKTtcblxubG9nVG9TY3JlZW4oJ29uZScsIG51bWJlclApO1xuLy8gcGFyc2UoXCJvbmVcIiwgbnVtYmVyKSB8PiBJTy5pbnNwZWN0XG4vLyAjID4+IHs6b2ssIDF9XG5sb2dUb1NjcmVlbigndHdlbnR5JywgbnVtYmVyUCk7XG4vLyBwYXJzZShcInR3ZW50eVwiLCBudW1iZXIpIHw+IElPLmluc3BlY3Rcbi8vICMgPj4gezpvaywgMjB9XG5sb2dUb1NjcmVlbigndHdlbnR5LXR3bycsIG51bWJlclApO1xuLy8gcGFyc2UoXCJ0d2VudHktdHdvXCIsIG51bWJlcikgfD4gSU8uaW5zcGVjdFxuLy8gIyA+PiB7Om9rLCAyMn1cbmxvZ1RvU2NyZWVuKCdzZXZlbnR5LXNldmVuJywgbnVtYmVyUCk7XG4vLyBwYXJzZShcInNldmVudHktc2V2ZW5cIiwgbnVtYmVyKSB8PiBJTy5pbnNwZWN0XG4vLyAjID4+IHs6b2ssIDc3fVxubG9nVG9TY3JlZW4oJ29uZSBodW5kcmVkJywgbnVtYmVyUCk7XG4vLyBwYXJzZShcIm9uZSBodW5kcmVkXCIsIG51bWJlcikgfD4gSU8uaW5zcGVjdFxuLy8gIyA+PiB7Om9rLCAxMDB9XG5sb2dUb1NjcmVlbignb25lIGh1bmRyZWQgdHdlbnR5JywgbnVtYmVyUCk7XG4vLyBwYXJzZShcIm9uZSBodW5kcmVkIHR3ZW50eVwiLCBudW1iZXIpIHw+IElPLmluc3BlY3Rcbi8vICMgPj4gezpvaywgMTIwfVxubG9nVG9TY3JlZW4oJ29uZSBodW5kcmVkIGFuZCB0d2VudHknLCBudW1iZXJQKTtcbi8vIHBhcnNlKFwib25lIGh1bmRyZWQgYW5kIHR3ZW50eVwiLCBudW1iZXIpIHw+IElPLmluc3BlY3Rcbi8vICMgPj4gezpvaywgMTIwfVxubG9nVG9TY3JlZW4oJ29uZSBodW5kcmVkIGFuZCB0d2VudHktdHdvJywgbnVtYmVyUCk7XG4vLyBwYXJzZShcIm9uZSBodW5kcmVkIGFuZCB0d2VudHktdHdvXCIsIG51bWJlcikgfD4gSU8uaW5zcGVjdFxuLy8gIyA+PiB7Om9rLCAxMjJ9XG5sb2dUb1NjcmVlbignb25lIGh1bmRyZWQgYW5kIHR3ZW50eSB0aHJlZScsIG51bWJlclApO1xuLy8gcGFyc2UoXCJvbmUgaHVuZHJlZCBhbmQgdHdlbnR5IHRocmVlXCIsIG51bWJlcikgfD4gSU8uaW5zcGVjdFxuLy8gIyA+PiB7Om9rLCAxMjN9XG5sb2dUb1NjcmVlbigndHdlbHZlIGh1bmRyZWQgYW5kIHR3ZW50eS10d28nLCBudW1iZXJQKTtcbi8vIHBhcnNlKFwidHdlbHZlIGh1bmRyZWQgYW5kIHR3ZW50eS10d29cIiwgbnVtYmVyKSB8PiBJTy5pbnNwZWN0XG4vLyAjID4+IHs6b2ssIDEyMjJ9XG5sb2dUb1NjcmVlbignb25lIHRob3VzYW5kJywgbnVtYmVyUCk7XG4vLyBwYXJzZShcIm9uZSB0aG91c2FuZFwiLCBudW1iZXIpIHw+IElPLmluc3BlY3Rcbi8vICMgPj4gezpvaywgMTAwMH1cbmxvZ1RvU2NyZWVuKCd0d2VudHkgdGhvdXNhbmQnLCBudW1iZXJQKTtcbi8vIHBhcnNlKFwidHdlbnR5IHRob3VzYW5kXCIsIG51bWJlcikgfD4gSU8uaW5zcGVjdFxuLy8gIyA+PiB7Om9rLCAyMDAwMH1cbmxvZ1RvU2NyZWVuKCd0d2VudHktdHdvIHRob3VzYW5kJywgbnVtYmVyUCk7XG4vLyBwYXJzZShcInR3ZW50eS10d28gdGhvdXNhbmRcIiwgbnVtYmVyKSB8PiBJTy5pbnNwZWN0XG4vLyAjID4+IHs6b2ssIDIyMDAwfVxubG9nVG9TY3JlZW4oJ29uZSBodW5kcmVkIHRob3VzYW5kJywgbnVtYmVyUCk7XG4vLyBwYXJzZShcIm9uZSBodW5kcmVkIHRob3VzYW5kXCIsIG51bWJlcikgfD4gSU8uaW5zcGVjdFxuLy8gIyA+PiB7Om9rLCAxMDAwMDB9XG5sb2dUb1NjcmVlbigndHdlbHZlIGh1bmRyZWQgYW5kIHR3ZW50eS10d28gdGhvdXNhbmQnLCBudW1iZXJQKTtcbi8vIHBhcnNlKFwidHdlbHZlIGh1bmRyZWQgYW5kIHR3ZW50eS10d28gdGhvdXNhbmRcIiwgbnVtYmVyKSB8PiBJTy5pbnNwZWN0XG4vLyAjID4+IHs6b2ssIDEyMjIwMDB9XG5sb2dUb1NjcmVlbignb25lIGh1bmRyZWQgYW5kIHR3ZW50eSB0aHJlZSBtaWxsaW9uJywgbnVtYmVyUCk7XG4vLyBwYXJzZShcIm9uZSBodW5kcmVkIGFuZCB0d2VudHkgdGhyZWUgbWlsbGlvblwiLCBudW1iZXIpIHw+IElPLmluc3BlY3Rcbi8vICMgPj4gezpvaywgMTIzMDAwMDAwfVxubG9nVG9TY3JlZW4oJ29uZSBodW5kcmVkIGFuZCB0d2VudHkgdGhyZWUgbWlsbGlvbiBhbmQgdGhyZWUnLCBudW1iZXJQKTtcbi8vIHBhcnNlKFwib25lIGh1bmRyZWQgYW5kIHR3ZW50eSB0aHJlZSBtaWxsaW9uIGFuZCB0aHJlZVwiLCBudW1iZXIpIHw+IElPLmluc3BlY3Rcbi8vICMgPj4gezpvaywgMTIzMDAwMDAzfVxubG9nVG9TY3JlZW4oJ3NldmVudHktc2V2ZW4gdGhvdXNhbmQgZWlnaHQgaHVuZHJlZCBhbmQgbmluZXRlZW4nLCBudW1iZXJQKTtcbi8vIHBhcnNlKFwic2V2ZW50eS1zZXZlbiB0aG91c2FuZCBlaWdodCBodW5kcmVkIGFuZCBuaW5ldGVlblwiLCBudW1iZXIpIHw+IElPLmluc3BlY3Rcbi8vICMgPj4gezpvaywgNzc4MTl9XG5sb2dUb1NjcmVlbignc2V2ZW4gaHVuZHJlZCBzZXZlbnR5LXNldmVuIHRob3VzYW5kIHNldmVuIGh1bmRyZWQgYW5kIHNldmVudHktc2V2ZW4nLCBudW1iZXJQKTtcbi8vIHBhcnNlKFwic2V2ZW4gaHVuZHJlZCBzZXZlbnR5LXNldmVuIHRob3VzYW5kIHNldmVuIGh1bmRyZWQgYW5kIHNldmVudHktc2V2ZW5cIiwgbnVtYmVyKSB8PiBJTy5pbnNwZWN0XG4vLyAjID4+IHs6b2ssIDc3Nzc3N31cblxuZnVuY3Rpb24gbG9nVG9TY3JlZW4oc3RyLCBwYXJzZXIpIHtcbiAgICBjb25zdCByZXN1bHQgPSBwYXJzZXIucnVuKHN0cik7XG4gICAgY29uc3Qgb3V0Y29tZSA9IChyZXN1bHQuaXNTdWNjZXNzKSA/IHJlc3VsdC52YWx1ZVswXS50b1N0cmluZygpIDogJ0ZhaWx1cmUnO1xuICAgIGNvbnNvbGUubG9nKCdcIicgKyBzdHIgKyAnXCIgLS0+ICcgKyBvdXRjb21lKTtcbn1cbiJdfQ==