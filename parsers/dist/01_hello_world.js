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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2V4YW1wbGVzLzAxX2hlbGxvX3dvcmxkLmpzIl0sIm5hbWVzIjpbIndvcmRQIiwic2VwYXJhdG9yUCIsInRlcm1pbmF0b3JQIiwiZ3JlZXRpbmdzUCIsImRpc2NhcmRTZWNvbmQiLCJhbmRUaGVuIiwiY29uc29sZSIsImxvZyIsImxvZ1RvU2NyZWVuIiwic3RyMCIsInJ1biIsInZhbHVlIiwidG9TdHJpbmciXSwibWFwcGluZ3MiOiI7OztBQTRDQTtBQUNBLFFBQU1BLFFBQVEscUNBQWQ7O0FBRUE7QUFDQSxRQUFNQyxhQUFhLHNCQUFRLG1DQUFSLEVBQXNCLG9CQUFNLEdBQU4sQ0FBdEIsRUFBa0MsbUNBQWxDLENBQW5COztBQUVBO0FBQ0EsUUFBTUMsY0FBYyxvQkFBTSxvQkFBTSxHQUFOLENBQU4sQ0FBcEI7O0FBRUE7QUFDQSxRQUFNQyxhQUFhSCxNQUFNSSxhQUFOLENBQW9CSCxVQUFwQixFQUFnQ0ksT0FBaEMsQ0FBd0NMLEtBQXhDLEVBQStDSSxhQUEvQyxDQUE2REYsV0FBN0QsQ0FBbkI7O0FBRUFJLFlBQVFDLEdBQVIsQ0FBWSxtQkFBWjtBQUNBRCxZQUFRQyxHQUFSLENBQVksa0ZBQVo7O0FBRUFDLGdCQUFZLGNBQVo7QUFDQTs7QUFFQUEsZ0JBQVksZUFBWjtBQUNBOztBQUVBQSxnQkFBWSwrQkFBWjtBQUNBOztBQUVBLGFBQVNBLFdBQVQsQ0FBcUJDLElBQXJCLEVBQTJCO0FBQ3ZCSCxnQkFBUUMsR0FBUixDQUFZLE1BQU1FLElBQU4sR0FBYSxRQUFiLEdBQXdCTixXQUFXTyxHQUFYLENBQWVELElBQWYsRUFBcUJFLEtBQXJCLENBQTJCLENBQTNCLEVBQThCQyxRQUE5QixFQUFwQztBQUNIIiwiZmlsZSI6IjAxX2hlbGxvX3dvcmxkLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgICBKVmFsdWUsXG4gICAgVHVwbGUsXG59IGZyb20gJ2NsYXNzZXMnO1xuaW1wb3J0IHtcbiAgICBWYWxpZGF0aW9uLFxufSBmcm9tICd2YWxpZGF0aW9uJztcbmltcG9ydCB7XG4gICAgcGFyc2VyLFxuICAgIGNoYXJQYXJzZXIsXG4gICAgZGlnaXRQYXJzZXIsXG4gICAgcHJlZGljYXRlQmFzZWRQYXJzZXIsXG4gICAgcGNoYXIsXG4gICAgcGRpZ2l0LFxuICAgIGFuZFRoZW4sXG4gICAgb3JFbHNlLFxuICAgIGNob2ljZSxcbiAgICBhbnlPZixcbiAgICBmbWFwLFxuICAgIHJldHVyblAsXG4gICAgYXBwbHlQLFxuICAgIGxpZnQyLFxuICAgIHNlcXVlbmNlUCxcbiAgICBzZXF1ZW5jZVAyLFxuICAgIHBzdHJpbmcsXG4gICAgemVyb09yTW9yZSxcbiAgICBtYW55LFxuICAgIG1hbnkxLFxuICAgIG1hbnlDaGFycyxcbiAgICBtYW55Q2hhcnMxLFxuICAgIG9wdCxcbiAgICBvcHRCb29rLFxuICAgIGRpc2NhcmRGaXJzdCxcbiAgICBkaXNjYXJkU2Vjb25kLFxuICAgIGJldHdlZW4sXG4gICAgYmV0d2VlblBhcmVucyxcbiAgICBzZXBCeTEsXG4gICAgbG93ZXJjYXNlUCxcbiAgICB1cHBlcmNhc2VQLFxuICAgIGxldHRlclAsXG4gICAgZGlnaXRQLFxuICAgIHdoaXRlUCxcbn0gZnJvbSAncGFyc2Vycyc7XG5cbi8vIHdvcmQgPSB3aGlsZShsZXR0ZXJzLCBhdF9sZWFzdDogMSlcbmNvbnN0IHdvcmRQID0gbWFueTEobGV0dGVyUCk7XG5cbi8vIHNlcGFyYXRvciA9IGxleChcIixcIikgfD4gc2tpcFxuY29uc3Qgc2VwYXJhdG9yUCA9IGJldHdlZW4obWFueSh3aGl0ZVApLCBwY2hhcignLCcpLCBtYW55KHdoaXRlUCkpO1xuXG4vLyB0ZXJtaW5hdG9yID0gbGV4KFwiIVwiKSB8PiBvbmVfb3JfbW9yZSB8PiBza2lwXG5jb25zdCB0ZXJtaW5hdG9yUCA9IG1hbnkxKHBjaGFyKCchJykpO1xuXG4vLyBncmVldGluZ3MgPSBzZXF1ZW5jZV9vZihbd29yZCwgc2VwYXJhdG9yLCB3b3JkLCB0ZXJtaW5hdG9yXSlcbmNvbnN0IGdyZWV0aW5nc1AgPSB3b3JkUC5kaXNjYXJkU2Vjb25kKHNlcGFyYXRvclApLmFuZFRoZW4od29yZFApLmRpc2NhcmRTZWNvbmQodGVybWluYXRvclApO1xuXG5jb25zb2xlLmxvZygnMDFfaGVsbG9fd29ybGQuanMnKTtcbmNvbnNvbGUubG9nKCdVc2luZyB3b3JkUC5kaXNjYXJkU2Vjb25kKHNlcGFyYXRvclApLmFuZFRoZW4od29yZFApLmRpc2NhcmRTZWNvbmQodGVybWluYXRvclApOycpO1xuXG5sb2dUb1NjcmVlbignSGVsbG8sV29ybGQhJyk7XG4vLyAjID4+IHs6b2ssIFtcIkhlbGxvXCIsIFwiV29ybGRcIl19XG5cbmxvZ1RvU2NyZWVuKCdIZWxsbywgV29ybGQhJyk7XG4vLyAjID4+IHs6b2ssIFtcIkhlbGxvXCIsIFwiV29ybGRcIl19XG5cbmxvZ1RvU2NyZWVuKCdIZWxsbyAgICAsICAgIFdvcmxkISEhISEhISEhIScpO1xuLy8gIyA+PiB7Om9rLCBbXCJIZWxsb1wiLCBcIldvcmxkXCJdfVxuXG5mdW5jdGlvbiBsb2dUb1NjcmVlbihzdHIwKSB7XG4gICAgY29uc29sZS5sb2coJ1wiJyArIHN0cjAgKyAnXCIgLS0+ICcgKyBncmVldGluZ3NQLnJ1bihzdHIwKS52YWx1ZVswXS50b1N0cmluZygpKTtcbn1cbiJdfQ==