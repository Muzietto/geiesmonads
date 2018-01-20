define(['classes', 'validation', 'parsers'], function (_classes, _validation, _parsers) {
    'use strict';

    // word = while(letters, at_least: 1)
    var wordP = (0, _parsers.many1)(_parsers.letterP).fmap(function (arra) {
        return arra.join('');
    });

    // separator = lex(",") |> skip
    var separatorP = (0, _parsers.between)((0, _parsers.many)(_parsers.whiteP), (0, _parsers.pchar)(','), (0, _parsers.many)(_parsers.whiteP));

    // terminator = lex("!") |> one_or_more |> skip
    var terminatorP = (0, _parsers.many1)((0, _parsers.pchar)('!'));

    // greetings = sequence_of([word, separator, word, terminator])
    var greetingsP = wordP.discardSecond(separatorP).andThen(wordP).discardSecond(terminatorP);

    console.log('01_hello_world.js');
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2V4YW1wbGVzLzAxX2hlbGxvX3dvcmxkLmpzIl0sIm5hbWVzIjpbIndvcmRQIiwiZm1hcCIsImFycmEiLCJqb2luIiwic2VwYXJhdG9yUCIsInRlcm1pbmF0b3JQIiwiZ3JlZXRpbmdzUCIsImRpc2NhcmRTZWNvbmQiLCJhbmRUaGVuIiwiY29uc29sZSIsImxvZyIsImxvZ1RvU2NyZWVuIiwic3RyMCIsInJ1biIsInZhbHVlIiwidG9TdHJpbmciXSwibWFwcGluZ3MiOiI7OztBQThDQTtBQUNBLFFBQU1BLFFBQVEsc0NBQWVDLElBQWYsQ0FBb0I7QUFBQSxlQUFRQyxLQUFLQyxJQUFMLENBQVUsRUFBVixDQUFSO0FBQUEsS0FBcEIsQ0FBZDs7QUFFQTtBQUNBLFFBQU1DLGFBQWEsc0JBQVEsbUNBQVIsRUFBc0Isb0JBQU0sR0FBTixDQUF0QixFQUFrQyxtQ0FBbEMsQ0FBbkI7O0FBRUE7QUFDQSxRQUFNQyxjQUFjLG9CQUFNLG9CQUFNLEdBQU4sQ0FBTixDQUFwQjs7QUFFQTtBQUNBLFFBQU1DLGFBQWFOLE1BQU1PLGFBQU4sQ0FBb0JILFVBQXBCLEVBQWdDSSxPQUFoQyxDQUF3Q1IsS0FBeEMsRUFBK0NPLGFBQS9DLENBQTZERixXQUE3RCxDQUFuQjs7QUFFQUksWUFBUUMsR0FBUixDQUFZLG1CQUFaO0FBQ0FELFlBQVFDLEdBQVIsQ0FBWSxrRkFBWjs7QUFFQUMsZ0JBQVksY0FBWjtBQUNBOztBQUVBQSxnQkFBWSxlQUFaO0FBQ0E7O0FBRUFBLGdCQUFZLCtCQUFaO0FBQ0E7O0FBRUEsYUFBU0EsV0FBVCxDQUFxQkMsSUFBckIsRUFBMkI7QUFDdkJILGdCQUFRQyxHQUFSLENBQVksTUFBTUUsSUFBTixHQUFhLFFBQWIsR0FBd0JOLFdBQVdPLEdBQVgsQ0FBZUQsSUFBZixFQUFxQkUsS0FBckIsQ0FBMkIsQ0FBM0IsRUFBOEJDLFFBQTlCLEVBQXBDO0FBQ0giLCJmaWxlIjoiMDFfaGVsbG9fd29ybGQuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICAgIEpWYWx1ZSxcbiAgICBUdXBsZSxcbn0gZnJvbSAnY2xhc3Nlcyc7XG5pbXBvcnQge1xuICAgIFZhbGlkYXRpb24sXG59IGZyb20gJ3ZhbGlkYXRpb24nO1xuaW1wb3J0IHtcbiAgICBwYXJzZXIsXG4gICAgY2hhclBhcnNlcixcbiAgICBkaWdpdFBhcnNlcixcbiAgICBwcmVkaWNhdGVCYXNlZFBhcnNlcixcbiAgICBwY2hhcixcbiAgICBwZGlnaXQsXG4gICAgYW5kVGhlbixcbiAgICBvckVsc2UsXG4gICAgY2hvaWNlLFxuICAgIGFueU9mLFxuICAgIGZtYXAsXG4gICAgcmV0dXJuUCxcbiAgICBhcHBseVAsXG4gICAgbGlmdDIsXG4gICAgc2VxdWVuY2VQLFxuICAgIHNlcXVlbmNlUDIsXG4gICAgcHN0cmluZyxcbiAgICB6ZXJvT3JNb3JlLFxuICAgIG1hbnksXG4gICAgbWFueTEsXG4gICAgbWFueUNoYXJzLFxuICAgIG1hbnlDaGFyczEsXG4gICAgb3B0LFxuICAgIG9wdEJvb2ssXG4gICAgZGlzY2FyZEZpcnN0LFxuICAgIGRpc2NhcmRTZWNvbmQsXG4gICAgYmV0d2VlbixcbiAgICBiZXR3ZWVuUGFyZW5zLFxuICAgIHNlcEJ5MSxcbiAgICBsb3dlcmNhc2VQLFxuICAgIHVwcGVyY2FzZVAsXG4gICAgbGV0dGVyUCxcbiAgICBkaWdpdFAsXG4gICAgd2hpdGVQLFxuICAgIHRhcFAsXG4gICAgbG9nUFxufSBmcm9tICdwYXJzZXJzJztcblxuLy8gd29yZCA9IHdoaWxlKGxldHRlcnMsIGF0X2xlYXN0OiAxKVxuY29uc3Qgd29yZFAgPSBtYW55MShsZXR0ZXJQKS5mbWFwKGFycmEgPT4gYXJyYS5qb2luKCcnKSk7XG5cbi8vIHNlcGFyYXRvciA9IGxleChcIixcIikgfD4gc2tpcFxuY29uc3Qgc2VwYXJhdG9yUCA9IGJldHdlZW4obWFueSh3aGl0ZVApLCBwY2hhcignLCcpLCBtYW55KHdoaXRlUCkpO1xuXG4vLyB0ZXJtaW5hdG9yID0gbGV4KFwiIVwiKSB8PiBvbmVfb3JfbW9yZSB8PiBza2lwXG5jb25zdCB0ZXJtaW5hdG9yUCA9IG1hbnkxKHBjaGFyKCchJykpO1xuXG4vLyBncmVldGluZ3MgPSBzZXF1ZW5jZV9vZihbd29yZCwgc2VwYXJhdG9yLCB3b3JkLCB0ZXJtaW5hdG9yXSlcbmNvbnN0IGdyZWV0aW5nc1AgPSB3b3JkUC5kaXNjYXJkU2Vjb25kKHNlcGFyYXRvclApLmFuZFRoZW4od29yZFApLmRpc2NhcmRTZWNvbmQodGVybWluYXRvclApO1xuXG5jb25zb2xlLmxvZygnMDFfaGVsbG9fd29ybGQuanMnKTtcbmNvbnNvbGUubG9nKCdVc2luZyB3b3JkUC5kaXNjYXJkU2Vjb25kKHNlcGFyYXRvclApLmFuZFRoZW4od29yZFApLmRpc2NhcmRTZWNvbmQodGVybWluYXRvclApOycpO1xuXG5sb2dUb1NjcmVlbignSGVsbG8sV29ybGQhJyk7XG4vLyAjID4+IHs6b2ssIFtcIkhlbGxvXCIsIFwiV29ybGRcIl19XG5cbmxvZ1RvU2NyZWVuKCdIZWxsbywgV29ybGQhJyk7XG4vLyAjID4+IHs6b2ssIFtcIkhlbGxvXCIsIFwiV29ybGRcIl19XG5cbmxvZ1RvU2NyZWVuKCdIZWxsbyAgICAsICAgIFdvcmxkISEhISEhISEhIScpO1xuLy8gIyA+PiB7Om9rLCBbXCJIZWxsb1wiLCBcIldvcmxkXCJdfVxuXG5mdW5jdGlvbiBsb2dUb1NjcmVlbihzdHIwKSB7XG4gICAgY29uc29sZS5sb2coJ1wiJyArIHN0cjAgKyAnXCIgLS0+ICcgKyBncmVldGluZ3NQLnJ1bihzdHIwKS52YWx1ZVswXS50b1N0cmluZygpKTtcbn1cbiJdfQ==