define(['classes', 'validation', 'parsers'], function (_classes, _validation, _parsers) {
    'use strict';

    // word = while(letters, at_least: 1)
    var wordP = (0, _parsers.many1)(_parsers.letterP);

    // separator = lex(",") |> skip
    var separatorP = (0, _parsers.between)((0, _parsers.many)(_parsers.whiteP), (0, _parsers.pchar)(','), (0, _parsers.many)(_parsers.whiteP));

    // terminator = lex("!") |> one_or_more |> skip
    var terminatorP = (0, _parsers.many1)((0, _parsers.pchar)('!'));

    // greetings = sequence_of([word, separator, word, terminator])
    var greetingsP = wordP.discardSecond(separatorP).andThen(wordP).discardSecond(terminatorP);

    console.log('01_hello_world.js');
    console.log('parser is: wordP.discardSecond(separatorP).andThen(wordP).discardSecond(terminatorP);');

    logToScreen('Hello,World!');
    // # >> {:ok, ["Hello", "World"]}

    logToScreen('Hello, World!');
    // # >> {:ok, ["Hello", "World"]}

    logToScreen('Hello    ,    World!!!!!!!!!!');
    // # >> {:ok, ["Hello", "World"]}

    function logToScreen(str0) {
        console.log(str0 + ' --> ' + greetingsP.run(str0).value[0].toString());
    }
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2V4YW1wbGVzLzAxX2hlbGxvX3dvcmxkLmpzIl0sIm5hbWVzIjpbIndvcmRQIiwic2VwYXJhdG9yUCIsInRlcm1pbmF0b3JQIiwiZ3JlZXRpbmdzUCIsImRpc2NhcmRTZWNvbmQiLCJhbmRUaGVuIiwiY29uc29sZSIsImxvZyIsImxvZ1RvU2NyZWVuIiwic3RyMCIsInJ1biIsInZhbHVlIiwidG9TdHJpbmciXSwibWFwcGluZ3MiOiI7OztBQTRDQTtBQUNBLFFBQU1BLFFBQVEscUNBQWQ7O0FBRUE7QUFDQSxRQUFNQyxhQUFhLHNCQUFRLG1DQUFSLEVBQXNCLG9CQUFNLEdBQU4sQ0FBdEIsRUFBa0MsbUNBQWxDLENBQW5COztBQUVBO0FBQ0EsUUFBTUMsY0FBYyxvQkFBTSxvQkFBTSxHQUFOLENBQU4sQ0FBcEI7O0FBRUE7QUFDQSxRQUFNQyxhQUFhSCxNQUFNSSxhQUFOLENBQW9CSCxVQUFwQixFQUFnQ0ksT0FBaEMsQ0FBd0NMLEtBQXhDLEVBQStDSSxhQUEvQyxDQUE2REYsV0FBN0QsQ0FBbkI7O0FBRUFJLFlBQVFDLEdBQVIsQ0FBWSxtQkFBWjtBQUNBRCxZQUFRQyxHQUFSLENBQVksdUZBQVo7O0FBRUFDLGdCQUFZLGNBQVo7QUFDQTs7QUFFQUEsZ0JBQVksZUFBWjtBQUNBOztBQUVBQSxnQkFBWSwrQkFBWjtBQUNBOztBQUVBLGFBQVNBLFdBQVQsQ0FBcUJDLElBQXJCLEVBQTJCO0FBQ3ZCSCxnQkFBUUMsR0FBUixDQUFZRSxPQUFPLE9BQVAsR0FBaUJOLFdBQVdPLEdBQVgsQ0FBZUQsSUFBZixFQUFxQkUsS0FBckIsQ0FBMkIsQ0FBM0IsRUFBOEJDLFFBQTlCLEVBQTdCO0FBQ0giLCJmaWxlIjoiMDFfaGVsbG9fd29ybGQuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICAgIEpWYWx1ZSxcbiAgICBUdXBsZSxcbn0gZnJvbSAnY2xhc3Nlcyc7XG5pbXBvcnQge1xuICAgIFZhbGlkYXRpb24sXG59IGZyb20gJ3ZhbGlkYXRpb24nO1xuaW1wb3J0IHtcbiAgICBwYXJzZXIsXG4gICAgY2hhclBhcnNlcixcbiAgICBkaWdpdFBhcnNlcixcbiAgICBwcmVkaWNhdGVCYXNlZFBhcnNlcixcbiAgICBwY2hhcixcbiAgICBwZGlnaXQsXG4gICAgYW5kVGhlbixcbiAgICBvckVsc2UsXG4gICAgY2hvaWNlLFxuICAgIGFueU9mLFxuICAgIGZtYXAsXG4gICAgcmV0dXJuUCxcbiAgICBhcHBseVAsXG4gICAgbGlmdDIsXG4gICAgc2VxdWVuY2VQLFxuICAgIHNlcXVlbmNlUDIsXG4gICAgcHN0cmluZyxcbiAgICB6ZXJvT3JNb3JlLFxuICAgIG1hbnksXG4gICAgbWFueTEsXG4gICAgbWFueUNoYXJzLFxuICAgIG1hbnlDaGFyczEsXG4gICAgb3B0LFxuICAgIG9wdEJvb2ssXG4gICAgZGlzY2FyZEZpcnN0LFxuICAgIGRpc2NhcmRTZWNvbmQsXG4gICAgYmV0d2VlbixcbiAgICBiZXR3ZWVuUGFyZW5zLFxuICAgIHNlcEJ5MSxcbiAgICBsb3dlcmNhc2VQLFxuICAgIHVwcGVyY2FzZVAsXG4gICAgbGV0dGVyUCxcbiAgICBkaWdpdFAsXG4gICAgd2hpdGVQLFxufSBmcm9tICdwYXJzZXJzJztcblxuLy8gd29yZCA9IHdoaWxlKGxldHRlcnMsIGF0X2xlYXN0OiAxKVxuY29uc3Qgd29yZFAgPSBtYW55MShsZXR0ZXJQKTtcblxuLy8gc2VwYXJhdG9yID0gbGV4KFwiLFwiKSB8PiBza2lwXG5jb25zdCBzZXBhcmF0b3JQID0gYmV0d2VlbihtYW55KHdoaXRlUCksIHBjaGFyKCcsJyksIG1hbnkod2hpdGVQKSk7XG5cbi8vIHRlcm1pbmF0b3IgPSBsZXgoXCIhXCIpIHw+IG9uZV9vcl9tb3JlIHw+IHNraXBcbmNvbnN0IHRlcm1pbmF0b3JQID0gbWFueTEocGNoYXIoJyEnKSk7XG5cbi8vIGdyZWV0aW5ncyA9IHNlcXVlbmNlX29mKFt3b3JkLCBzZXBhcmF0b3IsIHdvcmQsIHRlcm1pbmF0b3JdKVxuY29uc3QgZ3JlZXRpbmdzUCA9IHdvcmRQLmRpc2NhcmRTZWNvbmQoc2VwYXJhdG9yUCkuYW5kVGhlbih3b3JkUCkuZGlzY2FyZFNlY29uZCh0ZXJtaW5hdG9yUCk7XG5cbmNvbnNvbGUubG9nKCcwMV9oZWxsb193b3JsZC5qcycpO1xuY29uc29sZS5sb2coJ3BhcnNlciBpczogd29yZFAuZGlzY2FyZFNlY29uZChzZXBhcmF0b3JQKS5hbmRUaGVuKHdvcmRQKS5kaXNjYXJkU2Vjb25kKHRlcm1pbmF0b3JQKTsnKTtcblxubG9nVG9TY3JlZW4oJ0hlbGxvLFdvcmxkIScpO1xuLy8gIyA+PiB7Om9rLCBbXCJIZWxsb1wiLCBcIldvcmxkXCJdfVxuXG5sb2dUb1NjcmVlbignSGVsbG8sIFdvcmxkIScpO1xuLy8gIyA+PiB7Om9rLCBbXCJIZWxsb1wiLCBcIldvcmxkXCJdfVxuXG5sb2dUb1NjcmVlbignSGVsbG8gICAgLCAgICBXb3JsZCEhISEhISEhISEnKTtcbi8vICMgPj4gezpvaywgW1wiSGVsbG9cIiwgXCJXb3JsZFwiXX1cblxuZnVuY3Rpb24gbG9nVG9TY3JlZW4oc3RyMCkge1xuICAgIGNvbnNvbGUubG9nKHN0cjAgKyAnIC0tPiAnICsgZ3JlZXRpbmdzUC5ydW4oc3RyMCkudmFsdWVbMF0udG9TdHJpbmcoKSk7XG59XG4iXX0=