define(['classes', 'validation', 'parsers'], function (_classes, _validation, _parsers) {
    'use strict';

    // word = while(letters, at_least: 1)
    var wordP = (0, _parsers.many1)(_parsers.letterP).fmap(function (arra) {
        return arra.join('');
    });

    // separator = lex(",") |> skip
    // cfr. https://github.com/gabrielelana/paco/blob/master/examples/01_hello_world.exs

    var separatorP = (0, _parsers.between)((0, _parsers.many)(_parsers.whiteP), (0, _parsers.pchar)(','), (0, _parsers.many)(_parsers.whiteP));

    // terminator = lex("!") |> one_or_more |> skip
    var terminatorP = (0, _parsers.many1)((0, _parsers.pchar)('!'));

    // greetings = sequence_of([word, separator, word, terminator])
    var greetingsP = wordP.discardSecond(separatorP).andThen(wordP).discardSecond(terminatorP);

    console.log('\n01_hello_world.js');
    console.log('Using wordP.discardSecond(separatorP).andThen(wordP).discardSecond(terminatorP);');

    logToScreen('Hello,World!');
    // # >> {:ok, ["Hello", "World"]}

    logToScreen('Hello, World!');
    // # >> {:ok, ["Hello", "World"]}

    logToScreen('Hello    ,    World!!!!!!!!!!');
    // # >> {:ok, ["Hello", "World"]}

    function logToScreen(str0) {
        console.log('"' + str0 + '" --> ' + greetingsP.run(str0).value[0].toString());
    }
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2V4YW1wbGVzLzAxX2hlbGxvX3dvcmxkLmpzIl0sIm5hbWVzIjpbIndvcmRQIiwibGV0dGVyUCIsImZtYXAiLCJhcnJhIiwiam9pbiIsInNlcGFyYXRvclAiLCJ3aGl0ZVAiLCJ0ZXJtaW5hdG9yUCIsImdyZWV0aW5nc1AiLCJkaXNjYXJkU2Vjb25kIiwiYW5kVGhlbiIsImNvbnNvbGUiLCJsb2ciLCJsb2dUb1NjcmVlbiIsInN0cjAiLCJydW4iLCJ2YWx1ZSIsInRvU3RyaW5nIl0sIm1hcHBpbmdzIjoiOzs7QUFpREE7QUFDQSxRQUFNQSxRQUFRLG9CQUFNQyxnQkFBTixFQUFlQyxJQUFmLENBQW9CO0FBQUEsZUFBUUMsS0FBS0MsSUFBTCxDQUFVLEVBQVYsQ0FBUjtBQUFBLEtBQXBCLENBQWQ7O0FBRUE7QUFwREE7O0FBcURBLFFBQU1DLGFBQWEsc0JBQVEsbUJBQUtDLGVBQUwsQ0FBUixFQUFzQixvQkFBTSxHQUFOLENBQXRCLEVBQWtDLG1CQUFLQSxlQUFMLENBQWxDLENBQW5COztBQUVBO0FBQ0EsUUFBTUMsY0FBYyxvQkFBTSxvQkFBTSxHQUFOLENBQU4sQ0FBcEI7O0FBRUE7QUFDQSxRQUFNQyxhQUFhUixNQUFNUyxhQUFOLENBQW9CSixVQUFwQixFQUFnQ0ssT0FBaEMsQ0FBd0NWLEtBQXhDLEVBQStDUyxhQUEvQyxDQUE2REYsV0FBN0QsQ0FBbkI7O0FBRUFJLFlBQVFDLEdBQVIsQ0FBWSxxQkFBWjtBQUNBRCxZQUFRQyxHQUFSLENBQVksa0ZBQVo7O0FBRUFDLGdCQUFZLGNBQVo7QUFDQTs7QUFFQUEsZ0JBQVksZUFBWjtBQUNBOztBQUVBQSxnQkFBWSwrQkFBWjtBQUNBOztBQUVBLGFBQVNBLFdBQVQsQ0FBcUJDLElBQXJCLEVBQTJCO0FBQ3ZCSCxnQkFBUUMsR0FBUixDQUFZLE1BQU1FLElBQU4sR0FBYSxRQUFiLEdBQXdCTixXQUFXTyxHQUFYLENBQWVELElBQWYsRUFBcUJFLEtBQXJCLENBQTJCLENBQTNCLEVBQThCQyxRQUE5QixFQUFwQztBQUNIIiwiZmlsZSI6IjAxX2hlbGxvX3dvcmxkLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8gY2ZyLiBodHRwczovL2dpdGh1Yi5jb20vZ2FicmllbGVsYW5hL3BhY28vYmxvYi9tYXN0ZXIvZXhhbXBsZXMvMDFfaGVsbG9fd29ybGQuZXhzXG5cbmltcG9ydCB7XG4gICAgSlZhbHVlLFxuICAgIFR1cGxlLFxufSBmcm9tICdjbGFzc2VzJztcbmltcG9ydCB7XG4gICAgVmFsaWRhdGlvbixcbn0gZnJvbSAndmFsaWRhdGlvbic7XG5pbXBvcnQge1xuICAgIHBhcnNlcixcbiAgICBjaGFyUGFyc2VyLFxuICAgIGRpZ2l0UGFyc2VyLFxuICAgIHByZWRpY2F0ZUJhc2VkUGFyc2VyLFxuICAgIHBjaGFyLFxuICAgIHBkaWdpdCxcbiAgICBhbmRUaGVuLFxuICAgIG9yRWxzZSxcbiAgICBjaG9pY2UsXG4gICAgYW55T2YsXG4gICAgZm1hcCxcbiAgICByZXR1cm5QLFxuICAgIGFwcGx5UCxcbiAgICBsaWZ0MixcbiAgICBzZXF1ZW5jZVAsXG4gICAgc2VxdWVuY2VQMixcbiAgICBwc3RyaW5nLFxuICAgIHplcm9Pck1vcmUsXG4gICAgbWFueSxcbiAgICBtYW55MSxcbiAgICBtYW55Q2hhcnMsXG4gICAgbWFueUNoYXJzMSxcbiAgICBvcHQsXG4gICAgb3B0Qm9vayxcbiAgICBkaXNjYXJkRmlyc3QsXG4gICAgZGlzY2FyZFNlY29uZCxcbiAgICBiZXR3ZWVuLFxuICAgIGJldHdlZW5QYXJlbnMsXG4gICAgc2VwQnkxLFxuICAgIGxvd2VyY2FzZVAsXG4gICAgdXBwZXJjYXNlUCxcbiAgICBsZXR0ZXJQLFxuICAgIGRpZ2l0UCxcbiAgICB3aGl0ZVAsXG4gICAgdGFwUCxcbiAgICBsb2dQLFxuICAgIHB3b3JkLFxufSBmcm9tICdwYXJzZXJzJztcblxuLy8gd29yZCA9IHdoaWxlKGxldHRlcnMsIGF0X2xlYXN0OiAxKVxuY29uc3Qgd29yZFAgPSBtYW55MShsZXR0ZXJQKS5mbWFwKGFycmEgPT4gYXJyYS5qb2luKCcnKSk7XG5cbi8vIHNlcGFyYXRvciA9IGxleChcIixcIikgfD4gc2tpcFxuY29uc3Qgc2VwYXJhdG9yUCA9IGJldHdlZW4obWFueSh3aGl0ZVApLCBwY2hhcignLCcpLCBtYW55KHdoaXRlUCkpO1xuXG4vLyB0ZXJtaW5hdG9yID0gbGV4KFwiIVwiKSB8PiBvbmVfb3JfbW9yZSB8PiBza2lwXG5jb25zdCB0ZXJtaW5hdG9yUCA9IG1hbnkxKHBjaGFyKCchJykpO1xuXG4vLyBncmVldGluZ3MgPSBzZXF1ZW5jZV9vZihbd29yZCwgc2VwYXJhdG9yLCB3b3JkLCB0ZXJtaW5hdG9yXSlcbmNvbnN0IGdyZWV0aW5nc1AgPSB3b3JkUC5kaXNjYXJkU2Vjb25kKHNlcGFyYXRvclApLmFuZFRoZW4od29yZFApLmRpc2NhcmRTZWNvbmQodGVybWluYXRvclApO1xuXG5jb25zb2xlLmxvZygnXFxuMDFfaGVsbG9fd29ybGQuanMnKTtcbmNvbnNvbGUubG9nKCdVc2luZyB3b3JkUC5kaXNjYXJkU2Vjb25kKHNlcGFyYXRvclApLmFuZFRoZW4od29yZFApLmRpc2NhcmRTZWNvbmQodGVybWluYXRvclApOycpO1xuXG5sb2dUb1NjcmVlbignSGVsbG8sV29ybGQhJyk7XG4vLyAjID4+IHs6b2ssIFtcIkhlbGxvXCIsIFwiV29ybGRcIl19XG5cbmxvZ1RvU2NyZWVuKCdIZWxsbywgV29ybGQhJyk7XG4vLyAjID4+IHs6b2ssIFtcIkhlbGxvXCIsIFwiV29ybGRcIl19XG5cbmxvZ1RvU2NyZWVuKCdIZWxsbyAgICAsICAgIFdvcmxkISEhISEhISEhIScpO1xuLy8gIyA+PiB7Om9rLCBbXCJIZWxsb1wiLCBcIldvcmxkXCJdfVxuXG5mdW5jdGlvbiBsb2dUb1NjcmVlbihzdHIwKSB7XG4gICAgY29uc29sZS5sb2coJ1wiJyArIHN0cjAgKyAnXCIgLS0+ICcgKyBncmVldGluZ3NQLnJ1bihzdHIwKS52YWx1ZVswXS50b1N0cmluZygpKTtcbn1cbiJdfQ==