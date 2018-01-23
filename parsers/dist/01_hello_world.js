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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2V4YW1wbGVzLzAxX2hlbGxvX3dvcmxkLmpzIl0sIm5hbWVzIjpbIndvcmRQIiwiZm1hcCIsImFycmEiLCJqb2luIiwic2VwYXJhdG9yUCIsInRlcm1pbmF0b3JQIiwiZ3JlZXRpbmdzUCIsImRpc2NhcmRTZWNvbmQiLCJhbmRUaGVuIiwiY29uc29sZSIsImxvZyIsImxvZ1RvU2NyZWVuIiwic3RyMCIsInJ1biIsInZhbHVlIiwidG9TdHJpbmciXSwibWFwcGluZ3MiOiI7OztBQStDQTtBQUNBLFFBQU1BLFFBQVEsc0NBQWVDLElBQWYsQ0FBb0I7QUFBQSxlQUFRQyxLQUFLQyxJQUFMLENBQVUsRUFBVixDQUFSO0FBQUEsS0FBcEIsQ0FBZDs7QUFFQTtBQUNBLFFBQU1DLGFBQWEsc0JBQVEsbUNBQVIsRUFBc0Isb0JBQU0sR0FBTixDQUF0QixFQUFrQyxtQ0FBbEMsQ0FBbkI7O0FBRUE7QUFDQSxRQUFNQyxjQUFjLG9CQUFNLG9CQUFNLEdBQU4sQ0FBTixDQUFwQjs7QUFFQTtBQUNBLFFBQU1DLGFBQWFOLE1BQU1PLGFBQU4sQ0FBb0JILFVBQXBCLEVBQWdDSSxPQUFoQyxDQUF3Q1IsS0FBeEMsRUFBK0NPLGFBQS9DLENBQTZERixXQUE3RCxDQUFuQjs7QUFFQUksWUFBUUMsR0FBUixDQUFZLHFCQUFaO0FBQ0FELFlBQVFDLEdBQVIsQ0FBWSxrRkFBWjs7QUFFQUMsZ0JBQVksY0FBWjtBQUNBOztBQUVBQSxnQkFBWSxlQUFaO0FBQ0E7O0FBRUFBLGdCQUFZLCtCQUFaO0FBQ0E7O0FBRUEsYUFBU0EsV0FBVCxDQUFxQkMsSUFBckIsRUFBMkI7QUFDdkJILGdCQUFRQyxHQUFSLENBQVksTUFBTUUsSUFBTixHQUFhLFFBQWIsR0FBd0JOLFdBQVdPLEdBQVgsQ0FBZUQsSUFBZixFQUFxQkUsS0FBckIsQ0FBMkIsQ0FBM0IsRUFBOEJDLFFBQTlCLEVBQXBDO0FBQ0giLCJmaWxlIjoiMDFfaGVsbG9fd29ybGQuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICAgIEpWYWx1ZSxcbiAgICBUdXBsZSxcbn0gZnJvbSAnY2xhc3Nlcyc7XG5pbXBvcnQge1xuICAgIFZhbGlkYXRpb24sXG59IGZyb20gJ3ZhbGlkYXRpb24nO1xuaW1wb3J0IHtcbiAgICBwYXJzZXIsXG4gICAgY2hhclBhcnNlcixcbiAgICBkaWdpdFBhcnNlcixcbiAgICBwcmVkaWNhdGVCYXNlZFBhcnNlcixcbiAgICBwY2hhcixcbiAgICBwZGlnaXQsXG4gICAgYW5kVGhlbixcbiAgICBvckVsc2UsXG4gICAgY2hvaWNlLFxuICAgIGFueU9mLFxuICAgIGZtYXAsXG4gICAgcmV0dXJuUCxcbiAgICBhcHBseVAsXG4gICAgbGlmdDIsXG4gICAgc2VxdWVuY2VQLFxuICAgIHNlcXVlbmNlUDIsXG4gICAgcHN0cmluZyxcbiAgICB6ZXJvT3JNb3JlLFxuICAgIG1hbnksXG4gICAgbWFueTEsXG4gICAgbWFueUNoYXJzLFxuICAgIG1hbnlDaGFyczEsXG4gICAgb3B0LFxuICAgIG9wdEJvb2ssXG4gICAgZGlzY2FyZEZpcnN0LFxuICAgIGRpc2NhcmRTZWNvbmQsXG4gICAgYmV0d2VlbixcbiAgICBiZXR3ZWVuUGFyZW5zLFxuICAgIHNlcEJ5MSxcbiAgICBsb3dlcmNhc2VQLFxuICAgIHVwcGVyY2FzZVAsXG4gICAgbGV0dGVyUCxcbiAgICBkaWdpdFAsXG4gICAgd2hpdGVQLFxuICAgIHRhcFAsXG4gICAgbG9nUCxcbiAgICBwd29yZCxcbn0gZnJvbSAncGFyc2Vycyc7XG5cbi8vIHdvcmQgPSB3aGlsZShsZXR0ZXJzLCBhdF9sZWFzdDogMSlcbmNvbnN0IHdvcmRQID0gbWFueTEobGV0dGVyUCkuZm1hcChhcnJhID0+IGFycmEuam9pbignJykpO1xuXG4vLyBzZXBhcmF0b3IgPSBsZXgoXCIsXCIpIHw+IHNraXBcbmNvbnN0IHNlcGFyYXRvclAgPSBiZXR3ZWVuKG1hbnkod2hpdGVQKSwgcGNoYXIoJywnKSwgbWFueSh3aGl0ZVApKTtcblxuLy8gdGVybWluYXRvciA9IGxleChcIiFcIikgfD4gb25lX29yX21vcmUgfD4gc2tpcFxuY29uc3QgdGVybWluYXRvclAgPSBtYW55MShwY2hhcignIScpKTtcblxuLy8gZ3JlZXRpbmdzID0gc2VxdWVuY2Vfb2YoW3dvcmQsIHNlcGFyYXRvciwgd29yZCwgdGVybWluYXRvcl0pXG5jb25zdCBncmVldGluZ3NQID0gd29yZFAuZGlzY2FyZFNlY29uZChzZXBhcmF0b3JQKS5hbmRUaGVuKHdvcmRQKS5kaXNjYXJkU2Vjb25kKHRlcm1pbmF0b3JQKTtcblxuY29uc29sZS5sb2coJ1xcbjAxX2hlbGxvX3dvcmxkLmpzJyk7XG5jb25zb2xlLmxvZygnVXNpbmcgd29yZFAuZGlzY2FyZFNlY29uZChzZXBhcmF0b3JQKS5hbmRUaGVuKHdvcmRQKS5kaXNjYXJkU2Vjb25kKHRlcm1pbmF0b3JQKTsnKTtcblxubG9nVG9TY3JlZW4oJ0hlbGxvLFdvcmxkIScpO1xuLy8gIyA+PiB7Om9rLCBbXCJIZWxsb1wiLCBcIldvcmxkXCJdfVxuXG5sb2dUb1NjcmVlbignSGVsbG8sIFdvcmxkIScpO1xuLy8gIyA+PiB7Om9rLCBbXCJIZWxsb1wiLCBcIldvcmxkXCJdfVxuXG5sb2dUb1NjcmVlbignSGVsbG8gICAgLCAgICBXb3JsZCEhISEhISEhISEnKTtcbi8vICMgPj4gezpvaywgW1wiSGVsbG9cIiwgXCJXb3JsZFwiXX1cblxuZnVuY3Rpb24gbG9nVG9TY3JlZW4oc3RyMCkge1xuICAgIGNvbnNvbGUubG9nKCdcIicgKyBzdHIwICsgJ1wiIC0tPiAnICsgZ3JlZXRpbmdzUC5ydW4oc3RyMCkudmFsdWVbMF0udG9TdHJpbmcoKSk7XG59XG4iXX0=