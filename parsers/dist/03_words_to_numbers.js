define(['classes', 'validation', 'parsers'], function (_classes, _validation, _parsers) {
    'use strict';

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
    // tens = [tens, units] |> one_of
    var tensP = (0, _parsers.choice)([tensP1]);

    logToScreen('twenty', tensP);
    logToScreen('ninety', tensP);

    // hundreds = lex("hundred") |> replace_with(100)
    var hundredsP1 = (0, _parsers.pstring)('hundred').fmap(function (_) {
        return 100;
    });
    // hundreds = [tens, maybe(hundreds, default: 1)] |> bind(mul)
    // hundreds = [hundreds, skip(maybe(lex("and"))), maybe(tens, default: 0)] |> bind(sum)
    var hundredsP = (0, _parsers.choice)([hundredsP1]);

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2V4YW1wbGVzLzAzX3dvcmRzX3RvX251bWJlcnMuanMiXSwibmFtZXMiOlsidW5pdF92YWx1ZXMiLCJ6ZXJvIiwib25lIiwidHdvIiwidGhyZWUiLCJmb3VyIiwiZml2ZSIsInNpeCIsInNldmVuIiwiZWlnaHQiLCJuaW5lIiwidGVuIiwiZWxldmVuIiwidHdlbHZlIiwidGhpcnRlZW4iLCJmb3VydGVlbiIsImZpZnRlZW4iLCJzaXh0ZWVuIiwic2V2ZW50ZWVuIiwiZWlnaHRlZW4iLCJuaW5ldGVlbiIsInRlbnNfdmFsdWVzIiwidHdlbnR5IiwidGhpcnR5IiwiZm9ydHkiLCJmaWZ0eSIsInNpeHR5Iiwic2V2ZW50eSIsImVpZ2h0eSIsIm5pbmV0eSIsInNjYWxlX3ZhbHVlcyIsInRob3VzYW5kIiwibWlsbGlvbiIsImJpbGxpb24iLCJ0cmlsbGlvbiIsImNvbnNvbGUiLCJsb2ciLCJwcm9kdWN0UmVkdWNlciIsImFycmEiLCJyZWR1Y2UiLCJhY2MiLCJjdXJyIiwic3VtUmVkdWNlciIsInVuaXRzIiwiT2JqZWN0Iiwia2V5cyIsIm1hcCIsInZhbHVlIiwiZm1hcCIsInVuaXRzUCIsImxvZ1RvU2NyZWVuIiwidGVucyIsInRlbnNQMSIsInRlbnNQIiwiaHVuZHJlZHNQMSIsImh1bmRyZWRzUCIsInNjYWxlcyIsInNjYWxlc1AiLCJzdHIiLCJwYXJzZXIiLCJydW4iLCJ0b1N0cmluZyJdLCJtYXBwaW5ncyI6Ijs7O0FBNENBLFFBQU1BLGNBQWM7QUFDaEJDLGNBQU0sQ0FEVTtBQUVoQkMsYUFBSyxDQUZXO0FBR2hCQyxhQUFLLENBSFc7QUFJaEJDLGVBQU8sQ0FKUztBQUtoQkMsY0FBTSxDQUxVO0FBTWhCQyxjQUFNLENBTlU7QUFPaEJDLGFBQUssQ0FQVztBQVFoQkMsZUFBTyxDQVJTO0FBU2hCQyxlQUFPLENBVFM7QUFVaEJDLGNBQU0sQ0FWVTtBQVdoQkMsYUFBSyxFQVhXO0FBWWhCQyxnQkFBUSxFQVpRO0FBYWhCQyxnQkFBUSxFQWJRO0FBY2hC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QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLGFBQVNQLFdBQVQsQ0FBcUJRLEdBQXJCLEVBQTBCQyxNQUExQixFQUFrQztBQUM5QnhCLGdCQUFRQyxHQUFSLENBQVksTUFBTXNCLEdBQU4sR0FBWSxRQUFaLEdBQXVCQyxPQUFPQyxHQUFQLENBQVdGLEdBQVgsRUFBZ0JYLEtBQWhCLENBQXNCLENBQXRCLEVBQXlCYyxRQUF6QixFQUFuQztBQUNIIiwiZmlsZSI6IjAzX3dvcmRzX3RvX251bWJlcnMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICAgIEpWYWx1ZSxcbiAgICBUdXBsZSxcbn0gZnJvbSAnY2xhc3Nlcyc7XG5pbXBvcnQge1xuICAgIFZhbGlkYXRpb24sXG59IGZyb20gJ3ZhbGlkYXRpb24nO1xuaW1wb3J0IHtcbiAgICBwYXJzZXIsXG4gICAgY2hhclBhcnNlcixcbiAgICBkaWdpdFBhcnNlcixcbiAgICBwcmVkaWNhdGVCYXNlZFBhcnNlcixcbiAgICBwY2hhcixcbiAgICBwZGlnaXQsXG4gICAgYW5kVGhlbixcbiAgICBvckVsc2UsXG4gICAgY2hvaWNlLFxuICAgIGFueU9mLFxuICAgIGZtYXAsXG4gICAgcmV0dXJuUCxcbiAgICBhcHBseVAsXG4gICAgbGlmdDIsXG4gICAgc2VxdWVuY2VQLFxuICAgIHNlcXVlbmNlUDIsXG4gICAgcHN0cmluZyxcbiAgICB6ZXJvT3JNb3JlLFxuICAgIG1hbnksXG4gICAgbWFueTEsXG4gICAgbWFueUNoYXJzLFxuICAgIG1hbnlDaGFyczEsXG4gICAgb3B0LFxuICAgIG9wdEJvb2ssXG4gICAgZGlzY2FyZEZpcnN0LFxuICAgIGRpc2NhcmRTZWNvbmQsXG4gICAgYmV0d2VlbixcbiAgICBiZXR3ZWVuUGFyZW5zLFxuICAgIHNlcEJ5MSxcbiAgICBsb3dlcmNhc2VQLFxuICAgIHVwcGVyY2FzZVAsXG4gICAgbGV0dGVyUCxcbiAgICBkaWdpdFAsXG4gICAgd2hpdGVQLFxufSBmcm9tICdwYXJzZXJzJztcblxuY29uc3QgdW5pdF92YWx1ZXMgPSB7XG4gICAgemVybzogMCxcbiAgICBvbmU6IDEsXG4gICAgdHdvOiAyLFxuICAgIHRocmVlOiAzLFxuICAgIGZvdXI6IDQsXG4gICAgZml2ZTogNSxcbiAgICBzaXg6IDYsXG4gICAgc2V2ZW46IDcsXG4gICAgZWlnaHQ6IDgsXG4gICAgbmluZTogOSxcbiAgICB0ZW46IDEwLFxuICAgIGVsZXZlbjogMTEsXG4gICAgdHdlbHZlOiAxMixcbiAgICB0aGlydGVlbjogMTMsXG4gICAgZm91cnRlZW46IDE0LFxuICAgIGZpZnRlZW46IDE1LFxuICAgIHNpeHRlZW46IDE2LFxuICAgIHNldmVudGVlbjogMTcsXG4gICAgZWlnaHRlZW46IDE4LFxuICAgIG5pbmV0ZWVuOiAxOSxcbn07XG5cbmNvbnN0IHRlbnNfdmFsdWVzID0ge1xuICAgIHR3ZW50eTogMjAsXG4gICAgdGhpcnR5OiAzMCxcbiAgICBmb3J0eTogNDAsXG4gICAgZmlmdHk6IDUwLFxuICAgIHNpeHR5OiA2MCxcbiAgICBzZXZlbnR5OiA3MCxcbiAgICBlaWdodHk6IDgwLFxuICAgIG5pbmV0eTogOTAsXG59O1xuXG5jb25zdCBzY2FsZV92YWx1ZXMgPSB7XG4gICAgdGhvdXNhbmQ6IDEwMDAsXG4gICAgbWlsbGlvbjogMTAwMDAwMCxcbiAgICBiaWxsaW9uOiAxMDAwMDAwMDAwLFxuICAgIHRyaWxsaW9uOiAxMDAwMDAwMDAwMDAwLFxufTtcblxuY29uc29sZS5sb2coJ1xcbjAzX3dvcmRzX3RvX251bWJlcnMuanMnKTtcblxuLy8gbXVsID0gZm4gbnMgLT4gRW51bS5yZWR1Y2UobnMsIDEsICZLZXJuZWwuKi8yKSBlbmRcbmNvbnN0IHByb2R1Y3RSZWR1Y2VyID0gYXJyYSA9PiBhcnJhLnJlZHVjZSgoYWNjLCBjdXJyKSA9PiBhY2MgKiBjdXJyLCAxKTtcbi8vIHN1bSA9IGZuIG5zIC0+IEVudW0ucmVkdWNlKG5zLCAwLCAmS2VybmVsLisvMikgZW5kXG5jb25zdCBzdW1SZWR1Y2VyID0gYXJyYSA9PiBhcnJhLnJlZHVjZSgoYWNjLCBjdXJyKSA9PiBhY2MgKyBjdXJyLCAwKTtcblxuLy8gdW5pdHMgPSBvbmVfb2YoZm9yIHt3b3JkLCB2YWx1ZX0gPC0gdW5pdF92YWx1ZXMsIGRvOiBsZXgod29yZCkgfD4gcmVwbGFjZV93aXRoKHZhbHVlKSlcbmNvbnN0IHVuaXRzID0gT2JqZWN0LmtleXModW5pdF92YWx1ZXMpLm1hcCh2YWx1ZSA9PiBwc3RyaW5nKHZhbHVlKS5mbWFwKF8gPT4gdW5pdF92YWx1ZXNbdmFsdWVdKSk7XG5jb25zdCB1bml0c1AgPSBjaG9pY2UodW5pdHMpO1xuXG5jb25zb2xlLmxvZygnVXNpbmcgY2hvaWNlKE9iamVjdC5rZXlzKHVuaXRfdmFsdWVzKS5tYXAodmFsdWUgPT4gcHN0cmluZyh2YWx1ZSkuZm1hcChfID0+IHVuaXRfdmFsdWVzW3ZhbHVlXSkpKTsnKTtcbmxvZ1RvU2NyZWVuKCdvbmUnLCB1bml0c1ApO1xubG9nVG9TY3JlZW4oJ3RoaXJ0ZWVuJywgdW5pdHNQKTtcblxuLy8gdGVucyA9IG9uZV9vZihmb3Ige3dvcmQsIHZhbHVlfSA8LSB0ZW5zX3ZhbHVlcywgZG86IGxleCh3b3JkKSB8PiByZXBsYWNlX3dpdGgodmFsdWUpKVxuY29uc3QgdGVucyA9IE9iamVjdC5rZXlzKHRlbnNfdmFsdWVzKS5tYXAodmFsdWUgPT4gcHN0cmluZyh2YWx1ZSkuZm1hcChfID0+IHRlbnNfdmFsdWVzW3ZhbHVlXSkpO1xuY29uc3QgdGVuc1AxID0gY2hvaWNlKHRlbnMpO1xuLy8gdGVucyA9IFt0ZW5zLCBza2lwKG1heWJlKGxleChcIi1cIikpKSwgbWF5YmUodW5pdHMsIGRlZmF1bHQ6IDApXSB8PiBiaW5kKHN1bSlcbi8vIHRlbnMgPSBbdGVucywgdW5pdHNdIHw+IG9uZV9vZlxuY29uc3QgdGVuc1AgPSBjaG9pY2UoW3RlbnNQMV0pO1xuXG5sb2dUb1NjcmVlbigndHdlbnR5JywgdGVuc1ApO1xubG9nVG9TY3JlZW4oJ25pbmV0eScsIHRlbnNQKTtcblxuLy8gaHVuZHJlZHMgPSBsZXgoXCJodW5kcmVkXCIpIHw+IHJlcGxhY2Vfd2l0aCgxMDApXG5jb25zdCBodW5kcmVkc1AxID0gcHN0cmluZygnaHVuZHJlZCcpLmZtYXAoXyA9PiAxMDApO1xuLy8gaHVuZHJlZHMgPSBbdGVucywgbWF5YmUoaHVuZHJlZHMsIGRlZmF1bHQ6IDEpXSB8PiBiaW5kKG11bClcbi8vIGh1bmRyZWRzID0gW2h1bmRyZWRzLCBza2lwKG1heWJlKGxleChcImFuZFwiKSkpLCBtYXliZSh0ZW5zLCBkZWZhdWx0OiAwKV0gfD4gYmluZChzdW0pXG5jb25zdCBodW5kcmVkc1AgPSBjaG9pY2UoW2h1bmRyZWRzUDFdKTtcblxubG9nVG9TY3JlZW4oJ2h1bmRyZWQnLCBodW5kcmVkc1ApO1xuXG4vLyBzY2FsZXMgPSBvbmVfb2YoZm9yIHt3b3JkLCB2YWx1ZX0gPC0gc2NhbGVfdmFsdWVzLCBkbzogbGV4KHdvcmQpIHw+IHJlcGxhY2Vfd2l0aCh2YWx1ZSkpXG5jb25zdCBzY2FsZXMgPSBPYmplY3Qua2V5cyhzY2FsZV92YWx1ZXMpLm1hcCh2YWx1ZSA9PiBwc3RyaW5nKHZhbHVlKS5mbWFwKF8gPT4gc2NhbGVfdmFsdWVzW3ZhbHVlXSkpO1xuY29uc3Qgc2NhbGVzUCA9IGNob2ljZShzY2FsZXMpO1xuXG5jb25zb2xlLmxvZygnVXNpbmcgY2hvaWNlKE9iamVjdC5rZXlzKHNjYWxlX3ZhbHVlcykubWFwKHZhbHVlID0+IHBzdHJpbmcodmFsdWUpLmZtYXAoXyA9PiBzY2FsZV92YWx1ZXNbdmFsdWVdKSkpOycpO1xubG9nVG9TY3JlZW4oJ21pbGxpb24nLCBzY2FsZXNQKTtcbmxvZ1RvU2NyZWVuKCd0cmlsbGlvbicsIHNjYWxlc1ApO1xuXG4vLyBudW1iZXIgPSBbb25lX29mKFtodW5kcmVkcywgdGVuc10pLCBtYXliZShzY2FsZXMsIGRlZmF1bHQ6IDEpXSB8PiBiaW5kKG11bClcbi8vIG51bWJlciA9IG51bWJlciB8PiBzZXBhcmF0ZWRfYnkobWF5YmUobGV4KFwiYW5kXCIpKSkgfD4gYmluZChzdW0pXG4vL1xuLy9cbi8vIHBhcnNlKFwib25lXCIsIG51bWJlcikgfD4gSU8uaW5zcGVjdFxuLy8gIyA+PiB7Om9rLCAxfVxuLy8gcGFyc2UoXCJ0d2VudHlcIiwgbnVtYmVyKSB8PiBJTy5pbnNwZWN0XG4vLyAjID4+IHs6b2ssIDIwfVxuLy8gcGFyc2UoXCJ0d2VudHktdHdvXCIsIG51bWJlcikgfD4gSU8uaW5zcGVjdFxuLy8gIyA+PiB7Om9rLCAyMn1cbi8vIHBhcnNlKFwic2V2ZW50eS1zZXZlblwiLCBudW1iZXIpIHw+IElPLmluc3BlY3Rcbi8vICMgPj4gezpvaywgNzd9XG4vLyBwYXJzZShcIm9uZSBodW5kcmVkXCIsIG51bWJlcikgfD4gSU8uaW5zcGVjdFxuLy8gIyA+PiB7Om9rLCAxMDB9XG4vLyBwYXJzZShcIm9uZSBodW5kcmVkIHR3ZW50eVwiLCBudW1iZXIpIHw+IElPLmluc3BlY3Rcbi8vICMgPj4gezpvaywgMTIwfVxuLy8gcGFyc2UoXCJvbmUgaHVuZHJlZCBhbmQgdHdlbnR5XCIsIG51bWJlcikgfD4gSU8uaW5zcGVjdFxuLy8gIyA+PiB7Om9rLCAxMjB9XG4vLyBwYXJzZShcIm9uZSBodW5kcmVkIGFuZCB0d2VudHktdHdvXCIsIG51bWJlcikgfD4gSU8uaW5zcGVjdFxuLy8gIyA+PiB7Om9rLCAxMjJ9XG4vLyBwYXJzZShcIm9uZSBodW5kcmVkIGFuZCB0d2VudHkgdGhyZWVcIiwgbnVtYmVyKSB8PiBJTy5pbnNwZWN0XG4vLyAjID4+IHs6b2ssIDEyM31cbi8vIHBhcnNlKFwidHdlbHZlIGh1bmRyZWQgYW5kIHR3ZW50eS10d29cIiwgbnVtYmVyKSB8PiBJTy5pbnNwZWN0XG4vLyAjID4+IHs6b2ssIDEyMjJ9XG4vLyBwYXJzZShcIm9uZSB0aG91c2FuZFwiLCBudW1iZXIpIHw+IElPLmluc3BlY3Rcbi8vICMgPj4gezpvaywgMTAwMH1cbi8vIHBhcnNlKFwidHdlbnR5IHRob3VzYW5kXCIsIG51bWJlcikgfD4gSU8uaW5zcGVjdFxuLy8gIyA+PiB7Om9rLCAyMDAwMH1cbi8vIHBhcnNlKFwidHdlbnR5LXR3byB0aG91c2FuZFwiLCBudW1iZXIpIHw+IElPLmluc3BlY3Rcbi8vICMgPj4gezpvaywgMjIwMDB9XG4vLyBwYXJzZShcIm9uZSBodW5kcmVkIHRob3VzYW5kXCIsIG51bWJlcikgfD4gSU8uaW5zcGVjdFxuLy8gIyA+PiB7Om9rLCAxMDAwMDB9XG4vLyBwYXJzZShcInR3ZWx2ZSBodW5kcmVkIGFuZCB0d2VudHktdHdvIHRob3VzYW5kXCIsIG51bWJlcikgfD4gSU8uaW5zcGVjdFxuLy8gIyA+PiB7Om9rLCAxMjIyMDAwfVxuLy8gcGFyc2UoXCJvbmUgaHVuZHJlZCBhbmQgdHdlbnR5IHRocmVlIG1pbGxpb25cIiwgbnVtYmVyKSB8PiBJTy5pbnNwZWN0XG4vLyAjID4+IHs6b2ssIDEyMzAwMDAwMH1cbi8vIHBhcnNlKFwib25lIGh1bmRyZWQgYW5kIHR3ZW50eSB0aHJlZSBtaWxsaW9uIGFuZCB0aHJlZVwiLCBudW1iZXIpIHw+IElPLmluc3BlY3Rcbi8vICMgPj4gezpvaywgMTIzMDAwMDAzfVxuLy8gcGFyc2UoXCJzZXZlbnR5LXNldmVuIHRob3VzYW5kIGVpZ2h0IGh1bmRyZWQgYW5kIG5pbmV0ZWVuXCIsIG51bWJlcikgfD4gSU8uaW5zcGVjdFxuLy8gIyA+PiB7Om9rLCA3NzgxOX1cbi8vIHBhcnNlKFwic2V2ZW4gaHVuZHJlZCBzZXZlbnR5LXNldmVuIHRob3VzYW5kIHNldmVuIGh1bmRyZWQgYW5kIHNldmVudHktc2V2ZW5cIiwgbnVtYmVyKSB8PiBJTy5pbnNwZWN0XG4vLyAjID4+IHs6b2ssIDc3Nzc3N31cblxuZnVuY3Rpb24gbG9nVG9TY3JlZW4oc3RyLCBwYXJzZXIpIHtcbiAgICBjb25zb2xlLmxvZygnXCInICsgc3RyICsgJ1wiIC0tPiAnICsgcGFyc2VyLnJ1bihzdHIpLnZhbHVlWzBdLnRvU3RyaW5nKCkpO1xufVxuIl19