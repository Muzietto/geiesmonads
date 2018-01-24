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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2V4YW1wbGVzLzAzX3dvcmRzX3RvX251bWJlcnMuanMiXSwibmFtZXMiOlsidW5pdF92YWx1ZXMiLCJ6ZXJvIiwib25lIiwidHdvIiwidGhyZWUiLCJmb3VyIiwiZml2ZSIsInNpeCIsInNldmVuIiwiZWlnaHQiLCJuaW5lIiwidGVuIiwiZWxldmVuIiwidHdlbHZlIiwidGhpcnRlZW4iLCJmb3VydGVlbiIsImZpZnRlZW4iLCJzaXh0ZWVuIiwic2V2ZW50ZWVuIiwiZWlnaHRlZW4iLCJuaW5ldGVlbiIsInRlbnNfdmFsdWVzIiwidHdlbnR5IiwidGhpcnR5IiwiZm9ydHkiLCJmaWZ0eSIsInNpeHR5Iiwic2V2ZW50eSIsImVpZ2h0eSIsIm5pbmV0eSIsInNjYWxlX3ZhbHVlcyIsInRob3VzYW5kIiwibWlsbGlvbiIsImJpbGxpb24iLCJ0cmlsbGlvbiIsImNvbnNvbGUiLCJsb2ciLCJ1bml0cyIsIk9iamVjdCIsImtleXMiLCJyZXZlcnNlIiwibWFwIiwidmFsdWUiLCJmbWFwIiwidW5pdHNQIiwic2V0TGFiZWwiLCJsb2dUb1NjcmVlbiIsInRlbnMiLCJ0ZW5zUDEiLCJ0ZW5zUDIiLCJkaXNjYXJkU2Vjb25kIiwiYW5kVGhlbiIsImEiLCJtYiIsInRlbnNQIiwiaHVuZHJlZHNQMSIsImh1bmRyZWRzUDIiLCJtdCIsImgiLCJodW5kcmVkc1AiLCJzY2FsZXMiLCJzY2FsZXNQIiwibnVtYmVyUDEiLCJuIiwibXMiLCJudW1iZXJQIiwibWgiLCJzdHIiLCJwYXJzZXIiLCJyZXN1bHQiLCJydW4iLCJvdXRjb21lIiwiaXNTdWNjZXNzIiwidG9TdHJpbmciXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBaURBLFFBQU1BLGNBQWM7QUFDaEJDLGNBQU0sQ0FEVTtBQUVoQkMsYUFBSyxDQUZXO0FBR2hCQyxhQUFLLENBSFc7QUFJaEJDLGVBQU8sQ0FKUztBQUtoQkMsY0FBTSxDQUxVO0FBTWhCQyxjQUFN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YSxDQUFiLEVBQWdCK0IsUUFBaEIsRUFBckIsR0FBa0QsU0FBbEU7QUFDQXRDLGdCQUFRQyxHQUFSLENBQVksTUFBTStCLEdBQU4sR0FBWSxRQUFaLEdBQXVCSSxPQUFuQztBQUNIIiwiZmlsZSI6IjAzX3dvcmRzX3RvX251bWJlcnMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBjZnIuIGh0dHBzOi8vZ2l0aHViLmNvbS9nYWJyaWVsZWxhbmEvcGFjby9ibG9iL21hc3Rlci9leGFtcGxlcy8wM193b3JkX3RvX251bWJlcnMuZXhzXG5cbmltcG9ydCB7XG4gICAgSlZhbHVlLFxuICAgIFR1cGxlLFxufSBmcm9tICdjbGFzc2VzJztcbmltcG9ydCB7XG4gICAgVmFsaWRhdGlvbixcbn0gZnJvbSAndmFsaWRhdGlvbic7XG5pbXBvcnQge1xuICAgIHBhcnNlcixcbiAgICBjaGFyUGFyc2VyLFxuICAgIGRpZ2l0UGFyc2VyLFxuICAgIHByZWRpY2F0ZUJhc2VkUGFyc2VyLFxuICAgIHBjaGFyLFxuICAgIHBkaWdpdCxcbiAgICBhbmRUaGVuLFxuICAgIG9yRWxzZSxcbiAgICBjaG9pY2UsXG4gICAgYW55T2YsXG4gICAgZm1hcCxcbiAgICByZXR1cm5QLFxuICAgIGFwcGx5UCxcbiAgICBsaWZ0MixcbiAgICBzZXF1ZW5jZVAsXG4gICAgc2VxdWVuY2VQMixcbiAgICBwc3RyaW5nLFxuICAgIHplcm9Pck1vcmUsXG4gICAgbWFueSxcbiAgICBtYW55MSxcbiAgICBtYW55Q2hhcnMsXG4gICAgbWFueUNoYXJzMSxcbiAgICBvcHQsXG4gICAgb3B0Qm9vayxcbiAgICBkaXNjYXJkRmlyc3QsXG4gICAgZGlzY2FyZFNlY29uZCxcbiAgICBiZXR3ZWVuLFxuICAgIGJldHdlZW5QYXJlbnMsXG4gICAgc2VwQnkxLFxuICAgIGxvd2VyY2FzZVAsXG4gICAgdXBwZXJjYXNlUCxcbiAgICBsZXR0ZXJQLFxuICAgIGRpZ2l0UCxcbiAgICB3aGl0ZVAsXG4gICAgdGFwUCxcbiAgICBsb2dQLFxuICAgIHB3b3JkLFxufSBmcm9tICdwYXJzZXJzJztcblxuY29uc3QgdW5pdF92YWx1ZXMgPSB7XG4gICAgemVybzogMCxcbiAgICBvbmU6IDEsXG4gICAgdHdvOiAyLFxuICAgIHRocmVlOiAzLFxuICAgIGZvdXI6IDQsXG4gICAgZml2ZTogNSxcbiAgICBzaXg6IDYsXG4gICAgc2V2ZW46IDcsXG4gICAgZWlnaHQ6IDgsXG4gICAgbmluZTogOSxcbiAgICB0ZW46IDEwLFxuICAgIGVsZXZlbjogMTEsXG4gICAgdHdlbHZlOiAxMixcbiAgICB0aGlydGVlbjogMTMsXG4gICAgZm91cnRlZW46IDE0LFxuICAgIGZpZnRlZW46IDE1LFxuICAgIHNpeHRlZW46IDE2LFxuICAgIHNldmVudGVlbjogMTcsXG4gICAgZWlnaHRlZW46IDE4LFxuICAgIG5pbmV0ZWVuOiAxOSxcbn07XG5cbmNvbnN0IHRlbnNfdmFsdWVzID0ge1xuICAgIHR3ZW50eTogMjAsXG4gICAgdGhpcnR5OiAzMCxcbiAgICBmb3J0eTogNDAsXG4gICAgZmlmdHk6IDUwLFxuICAgIHNpeHR5OiA2MCxcbiAgICBzZXZlbnR5OiA3MCxcbiAgICBlaWdodHk6IDgwLFxuICAgIG5pbmV0eTogOTAsXG59O1xuXG5jb25zdCBzY2FsZV92YWx1ZXMgPSB7XG4gICAgdGhvdXNhbmQ6IDEwMDAsXG4gICAgbWlsbGlvbjogMTAwMDAwMCxcbiAgICBiaWxsaW9uOiAxMDAwMDAwMDAwLFxuICAgIHRyaWxsaW9uOiAxMDAwMDAwMDAwMDAwLFxufTtcblxuY29uc29sZS5sb2coJ1xcbjAzX3dvcmRzX3RvX251bWJlcnMuanMnKTtcblxuLy8gdW5pdHMgPSBvbmVfb2YoZm9yIHt3b3JkLCB2YWx1ZX0gPC0gdW5pdF92YWx1ZXMsIGRvOiBsZXgod29yZCkgfD4gcmVwbGFjZV93aXRoKHZhbHVlKSlcbmNvbnN0IHVuaXRzID0gT2JqZWN0LmtleXModW5pdF92YWx1ZXMpLnJldmVyc2UoKVxuICAgIC5tYXAodmFsdWUgPT4gcHdvcmQodmFsdWUpLmZtYXAoXyA9PiB1bml0X3ZhbHVlc1t2YWx1ZV0pKTtcbmNvbnN0IHVuaXRzUCA9IGNob2ljZSh1bml0cykuc2V0TGFiZWwoJ3VuaXRzUCcpO1xuXG5jb25zb2xlLmxvZygnVXNpbmcgY2hvaWNlKE9iamVjdC5rZXlzKHVuaXRfdmFsdWVzKS5tYXAodmFsdWUgPT4gcHdvcmQodmFsdWUpLmZtYXAoXyA9PiB1bml0X3ZhbHVlc1t2YWx1ZV0pKSk7Jyk7XG5sb2dUb1NjcmVlbignb25lJywgdW5pdHNQKTtcbmxvZ1RvU2NyZWVuKCd0aGlydGVlbicsIHVuaXRzUCk7XG5sb2dUb1NjcmVlbignZWlnaHRlZW4nLCB1bml0c1ApO1xuXG4vLyB0ZW5zID0gb25lX29mKGZvciB7d29yZCwgdmFsdWV9IDwtIHRlbnNfdmFsdWVzLCBkbzogbGV4KHdvcmQpIHw+IHJlcGxhY2Vfd2l0aCh2YWx1ZSkpXG5jb25zdCB0ZW5zID0gT2JqZWN0LmtleXModGVuc192YWx1ZXMpLm1hcCh2YWx1ZSA9PiBwd29yZCh2YWx1ZSkuZm1hcChfID0+IHRlbnNfdmFsdWVzW3ZhbHVlXSkpO1xuY29uc3QgdGVuc1AxID0gY2hvaWNlKHRlbnMpO1xuLy8gdGVucyA9IFt0ZW5zLCBza2lwKG1heWJlKGxleChcIi1cIikpKSwgbWF5YmUodW5pdHMsIGRlZmF1bHQ6IDApXSB8PiBiaW5kKHN1bSlcbmNvbnN0IHRlbnNQMiA9IHRlbnNQMS5kaXNjYXJkU2Vjb25kKG9wdChwY2hhcignLScpKSlcbiAgICAuYW5kVGhlbihvcHQodW5pdHNQLCAwKSkuZm1hcCgoW2EsIG1iXSkgPT4ge1xuICAgICAgICByZXR1cm4gYSArIG1iLnZhbHVlO1xuICAgIH0pLnNldExhYmVsKCd0ZW5zUDInKTtcbi8vIHRlbnMgPSBbdGVucywgdW5pdHNdIHw+IG9uZV9vZlxuY29uc3QgdGVuc1AgPSBjaG9pY2UoW3RlbnNQMiwgdW5pdHNQXSk7XG5cbmNvbnNvbGUubG9nKCdVc2luZyB0ZW5zUCcpO1xubG9nVG9TY3JlZW4oJ3RlbicsIHRlbnNQKTtcbmxvZ1RvU2NyZWVuKCdlbGV2ZW4nLCB0ZW5zUCk7XG5sb2dUb1NjcmVlbigndHdlbnR5JywgdGVuc1ApO1xubG9nVG9TY3JlZW4oJ3R3ZW50eWZvdXInLCB0ZW5zUCk7XG5sb2dUb1NjcmVlbigndHdlbnR5IGZvdXInLCB0ZW5zUCk7XG5sb2dUb1NjcmVlbigndHdlbnR5LXRocmVlJywgdGVuc1ApO1xubG9nVG9TY3JlZW4oJ25pbmV0eScsIHRlbnNQKTtcbmxvZ1RvU2NyZWVuKCduaW5ldHlzZXZlbicsIHRlbnNQKTtcbmxvZ1RvU2NyZWVuKCduaW5ldHktc2V2ZW4nLCB0ZW5zUCk7XG5sb2dUb1NjcmVlbignc2V2ZW50ZWVuJywgdGVuc1ApO1xuXG4vLyBodW5kcmVkcyA9IGxleChcImh1bmRyZWRcIikgfD4gcmVwbGFjZV93aXRoKDEwMClcbmNvbnN0IGh1bmRyZWRzUDEgPSBwd29yZCgnaHVuZHJlZCcpLmZtYXAoXyA9PiAxMDApO1xuLy8gaHVuZHJlZHMgPSBbdGVucywgbWF5YmUoaHVuZHJlZHMsIGRlZmF1bHQ6IDEpXSB8PiBiaW5kKG11bClcbmNvbnN0IGh1bmRyZWRzUDIgPSBvcHQodGVuc1AsIDEpXG4gICAgLmFuZFRoZW4oaHVuZHJlZHNQMSkuZm1hcCgoW210LCBoXSkgPT4gbXQudmFsdWUgKiBoKVxuICAgIC5zZXRMYWJlbCgnaHVuZHJlZHNQMicpO1xuLy8gaHVuZHJlZHMgPSBbaHVuZHJlZHMsIHNraXAobWF5YmUobGV4KFwiYW5kXCIpKSksIG1heWJlKHRlbnMsIGRlZmF1bHQ6IDApXSB8PiBiaW5kKHN1bSlcbmNvbnN0IGh1bmRyZWRzUCA9IGh1bmRyZWRzUDJcbiAgICAuZGlzY2FyZFNlY29uZChvcHQocHdvcmQoJ2FuZCcpKSlcbiAgICAuYW5kVGhlbihvcHQodGVuc1AsIDApKS5mbWFwKChbaCwgbXRdKSA9PiB7XG4gICAgICAgIHJldHVybiBoICsgbXQudmFsdWU7XG4gICAgfSlcbiAgICAuc2V0TGFiZWwoJ2h1bmRyZWRzUCcpO1xuXG5jb25zb2xlLmxvZygnVXNpbmcgaHVuZHJlZHNQJyk7XG5sb2dUb1NjcmVlbignb25lJywgaHVuZHJlZHNQKTtcbmxvZ1RvU2NyZWVuKCdodW5kcmVkJywgaHVuZHJlZHNQKTtcbmxvZ1RvU2NyZWVuKCdvbmUgaHVuZHJlZCcsIGh1bmRyZWRzUCk7XG5sb2dUb1NjcmVlbignaHVuZHJlZHRlbicsIGh1bmRyZWRzUCk7XG5sb2dUb1NjcmVlbignaHVuZHJlZCB0ZW4nLCBodW5kcmVkc1ApO1xubG9nVG9TY3JlZW4oJ2h1bmRyZWQgZWxldmVuJywgaHVuZHJlZHNQKTtcbmxvZ1RvU2NyZWVuKCdvbmUgaHVuZHJlZGVsZXZlbicsIGh1bmRyZWRzUCk7XG5sb2dUb1NjcmVlbignb25lIGh1bmRyZWQgYW5kIHRlbicsIGh1bmRyZWRzUCk7XG5sb2dUb1NjcmVlbigndHdvIGh1bmRyZWQgYW5kIHRlbicsIGh1bmRyZWRzUCk7XG5sb2dUb1NjcmVlbignbmluZSBodW5kcmVkIGFuZCB0d2VudHlmb3VyJywgaHVuZHJlZHNQKTtcbmxvZ1RvU2NyZWVuKCduaW5lIGh1bmRyZWQgYW5kIHR3ZW50eS1mb3VyJywgaHVuZHJlZHNQKTtcbmxvZ1RvU2NyZWVuKCduaW5lIGh1bmRyZWQgYW5kIHR3ZW50eSBmb3VyJywgaHVuZHJlZHNQKTtcbmxvZ1RvU2NyZWVuKCd0d2VsdmUgaHVuZHJlZCBhbmQgdHdlbnR5LXR3bycsIGh1bmRyZWRzUCk7XG5cbi8vIHNjYWxlcyA9IG9uZV9vZihmb3Ige3dvcmQsIHZhbHVlfSA8LSBzY2FsZV92YWx1ZXMsIGRvOiBsZXgod29yZCkgfD4gcmVwbGFjZV93aXRoKHZhbHVlKSlcbmNvbnN0IHNjYWxlcyA9IE9iamVjdC5rZXlzKHNjYWxlX3ZhbHVlcykubWFwKHZhbHVlID0+IHB3b3JkKHZhbHVlKVxuICAgIC5mbWFwKF8gPT4gc2NhbGVfdmFsdWVzW3ZhbHVlXSkuc2V0TGFiZWwoJ3NjYWxlX3ZhbHVlKCcgKyB2YWx1ZSArICcpJykpO1xuY29uc3Qgc2NhbGVzUCA9IGNob2ljZShzY2FsZXMpO1xuXG5jb25zb2xlLmxvZygnVXNpbmcgY2hvaWNlKE9iamVjdC5rZXlzKHNjYWxlX3ZhbHVlcykubWFwKHZhbHVlID0+IHB3b3JkKHZhbHVlKS5mbWFwKF8gPT4gc2NhbGVfdmFsdWVzW3ZhbHVlXSkpKTsnKTtcbmxvZ1RvU2NyZWVuKCd0aG91c2FuZCcsIHNjYWxlc1ApO1xubG9nVG9TY3JlZW4oJ21pbGxpb24nLCBzY2FsZXNQKTtcbmxvZ1RvU2NyZWVuKCd0cmlsbGlvbicsIHNjYWxlc1ApO1xuXG4vLyBudW1iZXIgPSBbb25lX29mKFtodW5kcmVkcywgdGVuc10pLCBtYXliZShzY2FsZXMsIGRlZmF1bHQ6IDEpXSB8PiBiaW5kKG11bClcbi8vIG51bWJlciA9IG51bWJlciB8PiBzZXBhcmF0ZWRfYnkobWF5YmUobGV4KFwiYW5kXCIpKSkgfD4gYmluZChzdW0pXG5cbmNvbnN0IG51bWJlclAxID0gY2hvaWNlKFtodW5kcmVkc1AsIHRlbnNQXSlcbiAgICAuYW5kVGhlbihvcHQoc2NhbGVzUCwgMSkpLmZtYXAoKFtuLCBtc10pID0+IHsvKmRlYnVnZ2VyOyovXG4gICAgICAgIHJldHVybiBuICogbXMudmFsdWU7XG4gICAgfSlcbiAgICAuc2V0TGFiZWwoJ251bWJlclAxJyk7XG5jb25zdCBudW1iZXJQID0gbnVtYmVyUDEuZGlzY2FyZFNlY29uZChvcHQocHdvcmQoJ2FuZCcpKSlcbiAgICAuYW5kVGhlbihvcHQoaHVuZHJlZHNQLCAwKSkuZm1hcCgoW24sIG1oXSkgPT4gey8qZGVidWdnZXI7Ki9cbiAgICAgICAgcmV0dXJuIG4gKyBtaC52YWx1ZTtcbiAgICB9KVxuICAgIC5zZXRMYWJlbCgnbnVtYmVyUCcpO1xuY29uc29sZS5sb2coJ1VzaW5nIChjaG9pY2UoaHVuZHJlZHNQLCB0ZW5zUCkuYW5kVGhlbihvcHQoc2NhbGVzUCwgMSkpLmZtYXAoKFtuLCBtc10pID0+IG4gKiBtcy52YWx1ZSkpLmRpc2NhcmRTZWNvbmQob3B0KHB3b3JkKFxcJ2FuZFxcJykpKS5hbmRUaGVuKG9wdChodW5kcmVkc1AsIDApKS5mbWFwKChbbiwgbWhdKSA9PiBuICsgbWgudmFsdWUpOycpO1xuXG5sb2dUb1NjcmVlbignb25lJywgbnVtYmVyUCk7XG4vLyBwYXJzZShcIm9uZVwiLCBudW1iZXIpIHw+IElPLmluc3BlY3Rcbi8vICMgPj4gezpvaywgMX1cbmxvZ1RvU2NyZWVuKCd0d2VudHknLCBudW1iZXJQKTtcbi8vIHBhcnNlKFwidHdlbnR5XCIsIG51bWJlcikgfD4gSU8uaW5zcGVjdFxuLy8gIyA+PiB7Om9rLCAyMH1cbmxvZ1RvU2NyZWVuKCd0d2VudHktdHdvJywgbnVtYmVyUCk7XG4vLyBwYXJzZShcInR3ZW50eS10d29cIiwgbnVtYmVyKSB8PiBJTy5pbnNwZWN0XG4vLyAjID4+IHs6b2ssIDIyfVxubG9nVG9TY3JlZW4oJ3NldmVudHktc2V2ZW4nLCBudW1iZXJQKTtcbi8vIHBhcnNlKFwic2V2ZW50eS1zZXZlblwiLCBudW1iZXIpIHw+IElPLmluc3BlY3Rcbi8vICMgPj4gezpvaywgNzd9XG5sb2dUb1NjcmVlbignb25lIGh1bmRyZWQnLCBudW1iZXJQKTtcbi8vIHBhcnNlKFwib25lIGh1bmRyZWRcIiwgbnVtYmVyKSB8PiBJTy5pbnNwZWN0XG4vLyAjID4+IHs6b2ssIDEwMH1cbmxvZ1RvU2NyZWVuKCdvbmUgaHVuZHJlZCB0d2VudHknLCBudW1iZXJQKTtcbi8vIHBhcnNlKFwib25lIGh1bmRyZWQgdHdlbnR5XCIsIG51bWJlcikgfD4gSU8uaW5zcGVjdFxuLy8gIyA+PiB7Om9rLCAxMjB9XG5sb2dUb1NjcmVlbignb25lIGh1bmRyZWQgYW5kIHR3ZW50eScsIG51bWJlclApO1xuLy8gcGFyc2UoXCJvbmUgaHVuZHJlZCBhbmQgdHdlbnR5XCIsIG51bWJlcikgfD4gSU8uaW5zcGVjdFxuLy8gIyA+PiB7Om9rLCAxMjB9XG5sb2dUb1NjcmVlbignb25lIGh1bmRyZWQgYW5kIHR3ZW50eS10d28nLCBudW1iZXJQKTtcbi8vIHBhcnNlKFwib25lIGh1bmRyZWQgYW5kIHR3ZW50eS10d29cIiwgbnVtYmVyKSB8PiBJTy5pbnNwZWN0XG4vLyAjID4+IHs6b2ssIDEyMn1cbmxvZ1RvU2NyZWVuKCdvbmUgaHVuZHJlZCBhbmQgdHdlbnR5IHRocmVlJywgbnVtYmVyUCk7XG4vLyBwYXJzZShcIm9uZSBodW5kcmVkIGFuZCB0d2VudHkgdGhyZWVcIiwgbnVtYmVyKSB8PiBJTy5pbnNwZWN0XG4vLyAjID4+IHs6b2ssIDEyM31cbmxvZ1RvU2NyZWVuKCd0d2VsdmUgaHVuZHJlZCBhbmQgdHdlbnR5LXR3bycsIG51bWJlclApO1xuLy8gcGFyc2UoXCJ0d2VsdmUgaHVuZHJlZCBhbmQgdHdlbnR5LXR3b1wiLCBudW1iZXIpIHw+IElPLmluc3BlY3Rcbi8vICMgPj4gezpvaywgMTIyMn1cbmxvZ1RvU2NyZWVuKCdvbmUgdGhvdXNhbmQnLCBudW1iZXJQKTtcbi8vIHBhcnNlKFwib25lIHRob3VzYW5kXCIsIG51bWJlcikgfD4gSU8uaW5zcGVjdFxuLy8gIyA+PiB7Om9rLCAxMDAwfVxubG9nVG9TY3JlZW4oJ3R3ZW50eSB0aG91c2FuZCcsIG51bWJlclApO1xuLy8gcGFyc2UoXCJ0d2VudHkgdGhvdXNhbmRcIiwgbnVtYmVyKSB8PiBJTy5pbnNwZWN0XG4vLyAjID4+IHs6b2ssIDIwMDAwfVxubG9nVG9TY3JlZW4oJ3R3ZW50eS10d28gdGhvdXNhbmQnLCBudW1iZXJQKTtcbi8vIHBhcnNlKFwidHdlbnR5LXR3byB0aG91c2FuZFwiLCBudW1iZXIpIHw+IElPLmluc3BlY3Rcbi8vICMgPj4gezpvaywgMjIwMDB9XG5sb2dUb1NjcmVlbignb25lIGh1bmRyZWQgdGhvdXNhbmQnLCBudW1iZXJQKTtcbi8vIHBhcnNlKFwib25lIGh1bmRyZWQgdGhvdXNhbmRcIiwgbnVtYmVyKSB8PiBJTy5pbnNwZWN0XG4vLyAjID4+IHs6b2ssIDEwMDAwMH1cbmxvZ1RvU2NyZWVuKCd0d2VsdmUgaHVuZHJlZCBhbmQgdHdlbnR5LXR3byB0aG91c2FuZCcsIG51bWJlclApO1xuLy8gcGFyc2UoXCJ0d2VsdmUgaHVuZHJlZCBhbmQgdHdlbnR5LXR3byB0aG91c2FuZFwiLCBudW1iZXIpIHw+IElPLmluc3BlY3Rcbi8vICMgPj4gezpvaywgMTIyMjAwMH1cbmxvZ1RvU2NyZWVuKCdvbmUgaHVuZHJlZCBhbmQgdHdlbnR5IHRocmVlIG1pbGxpb24nLCBudW1iZXJQKTtcbi8vIHBhcnNlKFwib25lIGh1bmRyZWQgYW5kIHR3ZW50eSB0aHJlZSBtaWxsaW9uXCIsIG51bWJlcikgfD4gSU8uaW5zcGVjdFxuLy8gIyA+PiB7Om9rLCAxMjMwMDAwMDB9XG5sb2dUb1NjcmVlbignb25lIGh1bmRyZWQgYW5kIHR3ZW50eSB0aHJlZSBtaWxsaW9uIGFuZCB0aHJlZScsIG51bWJlclApO1xuLy8gcGFyc2UoXCJvbmUgaHVuZHJlZCBhbmQgdHdlbnR5IHRocmVlIG1pbGxpb24gYW5kIHRocmVlXCIsIG51bWJlcikgfD4gSU8uaW5zcGVjdFxuLy8gIyA+PiB7Om9rLCAxMjMwMDAwMDN9XG5sb2dUb1NjcmVlbignc2V2ZW50eS1zZXZlbiB0aG91c2FuZCBlaWdodCBodW5kcmVkIGFuZCBuaW5ldGVlbicsIG51bWJlclApO1xuLy8gcGFyc2UoXCJzZXZlbnR5LXNldmVuIHRob3VzYW5kIGVpZ2h0IGh1bmRyZWQgYW5kIG5pbmV0ZWVuXCIsIG51bWJlcikgfD4gSU8uaW5zcGVjdFxuLy8gIyA+PiB7Om9rLCA3NzgxOX1cbmxvZ1RvU2NyZWVuKCdzZXZlbiBodW5kcmVkIHNldmVudHktc2V2ZW4gdGhvdXNhbmQgc2V2ZW4gaHVuZHJlZCBhbmQgc2V2ZW50eS1zZXZlbicsIG51bWJlclApO1xuLy8gcGFyc2UoXCJzZXZlbiBodW5kcmVkIHNldmVudHktc2V2ZW4gdGhvdXNhbmQgc2V2ZW4gaHVuZHJlZCBhbmQgc2V2ZW50eS1zZXZlblwiLCBudW1iZXIpIHw+IElPLmluc3BlY3Rcbi8vICMgPj4gezpvaywgNzc3Nzc3fVxuXG5mdW5jdGlvbiBsb2dUb1NjcmVlbihzdHIsIHBhcnNlcikge1xuICAgIGNvbnN0IHJlc3VsdCA9IHBhcnNlci5ydW4oc3RyKTtcbiAgICBjb25zdCBvdXRjb21lID0gKHJlc3VsdC5pc1N1Y2Nlc3MpID8gcmVzdWx0LnZhbHVlWzBdLnRvU3RyaW5nKCkgOiAnRmFpbHVyZSc7XG4gICAgY29uc29sZS5sb2coJ1wiJyArIHN0ciArICdcIiAtLT4gJyArIG91dGNvbWUpO1xufVxuIl19