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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2V4YW1wbGVzLzAxX2hlbGxvX3dvcmxkLmpzIl0sIm5hbWVzIjpbIndvcmRQIiwibGV0dGVyUCIsImZtYXAiLCJhcnJhIiwiam9pbiIsInNlcGFyYXRvclAiLCJ3aGl0ZVAiLCJ0ZXJtaW5hdG9yUCIsImdyZWV0aW5nc1AiLCJkaXNjYXJkU2Vjb25kIiwiYW5kVGhlbiIsImNvbnNvbGUiLCJsb2ciLCJsb2dUb1NjcmVlbiIsInN0cjAiLCJydW4iLCJ2YWx1ZSIsInRvU3RyaW5nIl0sIm1hcHBpbmdzIjoiOzs7QUFpREE7QUFDQSxRQUFNQSxRQUFRLG9CQUFNQyxnQkFBTixFQUFlQyxJQUFmLENBQW9CO0FBQUEsZUFBUUMsS0FBS0MsSUFBTCxDQUFVLEVBQVYsQ0FBUjtBQUFBLEtBQXBCLENBQWQ7O0FBRUE7QUFwREE7O0FBcURBLFFBQU1DLGFBQWEsc0JBQVEsbUJBQUtDLGVBQUwsQ0FBUixFQUFzQixvQkFBTSxHQUFOLENBQXRCLEVBQWtDLG1CQUFLQSxlQUFMLENBQWxDLENBQW5COztBQUVBO0FBQ0EsUUFBTUMsY0FBYyxvQkFBTSxvQkFBTSxHQUFOLENBQU4sQ0FBcEI7O0FBRUE7QUFDQSxRQUFNQyxhQUFhUixNQUFNUyxhQUFOLENBQW9CSixVQUFwQixFQUFnQ0ssT0FBaEMsQ0FBd0NWLEtBQXhDLEVBQStDUyxhQUEvQyxDQUE2REYsV0FBN0QsQ0FBbkI7O0FBRUFJLFlBQVFDLEdBQVIsQ0FBWSxxQkFBWjtBQUNBRCxZQUFRQyxHQUFSLENBQVksa0ZBQVo7O0FBRUFDLGdCQUFZLGNBQVo7QUFDQTs7QUFFQUEsZ0JBQVksZUFBWjtBQUNBOztBQUVBQSxnQkFBWSwrQkFBWjtBQUNBOztBQUVBLGFBQVNBLFdBQVQsQ0FBcUJDLElBQXJCLEVBQTJCO0FBQ3ZCSCxnQkFBUUMsR0FBUixDQUFZLE1BQU1FLElBQU4sR0FBYSxRQUFiLEdBQXdCTixXQUFXTyxHQUFYLENBQWVELElBQWYsRUFBcUJFLEtBQXJCLENBQTJCLENBQTNCLEVBQThCQyxRQUE5QixFQUFwQztBQUNIIiwiZmlsZSI6IjAxX2hlbGxvX3dvcmxkLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8gY2ZyLiBodHRwczovL2dpdGh1Yi5jb20vZ2FicmllbGVsYW5hL3BhY28vYmxvYi9tYXN0ZXIvZXhhbXBsZXMvMDFfaGVsbG9fd29ybGQuZXhzXHJcblxyXG5pbXBvcnQge1xyXG4gICAgSlZhbHVlLFxyXG4gICAgVHVwbGUsXHJcbn0gZnJvbSAnY2xhc3Nlcyc7XHJcbmltcG9ydCB7XHJcbiAgICBWYWxpZGF0aW9uLFxyXG59IGZyb20gJ3ZhbGlkYXRpb24nO1xyXG5pbXBvcnQge1xyXG4gICAgcGFyc2VyLFxyXG4gICAgY2hhclBhcnNlcixcclxuICAgIGRpZ2l0UGFyc2VyLFxyXG4gICAgcHJlZGljYXRlQmFzZWRQYXJzZXIsXHJcbiAgICBwY2hhcixcclxuICAgIHBkaWdpdCxcclxuICAgIGFuZFRoZW4sXHJcbiAgICBvckVsc2UsXHJcbiAgICBjaG9pY2UsXHJcbiAgICBhbnlPZixcclxuICAgIGZtYXAsXHJcbiAgICByZXR1cm5QLFxyXG4gICAgYXBwbHlQLFxyXG4gICAgbGlmdDIsXHJcbiAgICBzZXF1ZW5jZVAsXHJcbiAgICBzZXF1ZW5jZVAyLFxyXG4gICAgcHN0cmluZyxcclxuICAgIHplcm9Pck1vcmUsXHJcbiAgICBtYW55LFxyXG4gICAgbWFueTEsXHJcbiAgICBtYW55Q2hhcnMsXHJcbiAgICBtYW55Q2hhcnMxLFxyXG4gICAgb3B0LFxyXG4gICAgb3B0Qm9vayxcclxuICAgIGRpc2NhcmRGaXJzdCxcclxuICAgIGRpc2NhcmRTZWNvbmQsXHJcbiAgICBiZXR3ZWVuLFxyXG4gICAgYmV0d2VlblBhcmVucyxcclxuICAgIHNlcEJ5MSxcclxuICAgIGxvd2VyY2FzZVAsXHJcbiAgICB1cHBlcmNhc2VQLFxyXG4gICAgbGV0dGVyUCxcclxuICAgIGRpZ2l0UCxcclxuICAgIHdoaXRlUCxcclxuICAgIHRhcFAsXHJcbiAgICBsb2dQLFxyXG4gICAgcHdvcmQsXHJcbn0gZnJvbSAncGFyc2Vycyc7XHJcblxyXG4vLyB3b3JkID0gd2hpbGUobGV0dGVycywgYXRfbGVhc3Q6IDEpXHJcbmNvbnN0IHdvcmRQID0gbWFueTEobGV0dGVyUCkuZm1hcChhcnJhID0+IGFycmEuam9pbignJykpO1xyXG5cclxuLy8gc2VwYXJhdG9yID0gbGV4KFwiLFwiKSB8PiBza2lwXHJcbmNvbnN0IHNlcGFyYXRvclAgPSBiZXR3ZWVuKG1hbnkod2hpdGVQKSwgcGNoYXIoJywnKSwgbWFueSh3aGl0ZVApKTtcclxuXHJcbi8vIHRlcm1pbmF0b3IgPSBsZXgoXCIhXCIpIHw+IG9uZV9vcl9tb3JlIHw+IHNraXBcclxuY29uc3QgdGVybWluYXRvclAgPSBtYW55MShwY2hhcignIScpKTtcclxuXHJcbi8vIGdyZWV0aW5ncyA9IHNlcXVlbmNlX29mKFt3b3JkLCBzZXBhcmF0b3IsIHdvcmQsIHRlcm1pbmF0b3JdKVxyXG5jb25zdCBncmVldGluZ3NQID0gd29yZFAuZGlzY2FyZFNlY29uZChzZXBhcmF0b3JQKS5hbmRUaGVuKHdvcmRQKS5kaXNjYXJkU2Vjb25kKHRlcm1pbmF0b3JQKTtcclxuXHJcbmNvbnNvbGUubG9nKCdcXG4wMV9oZWxsb193b3JsZC5qcycpO1xyXG5jb25zb2xlLmxvZygnVXNpbmcgd29yZFAuZGlzY2FyZFNlY29uZChzZXBhcmF0b3JQKS5hbmRUaGVuKHdvcmRQKS5kaXNjYXJkU2Vjb25kKHRlcm1pbmF0b3JQKTsnKTtcclxuXHJcbmxvZ1RvU2NyZWVuKCdIZWxsbyxXb3JsZCEnKTtcclxuLy8gIyA+PiB7Om9rLCBbXCJIZWxsb1wiLCBcIldvcmxkXCJdfVxyXG5cclxubG9nVG9TY3JlZW4oJ0hlbGxvLCBXb3JsZCEnKTtcclxuLy8gIyA+PiB7Om9rLCBbXCJIZWxsb1wiLCBcIldvcmxkXCJdfVxyXG5cclxubG9nVG9TY3JlZW4oJ0hlbGxvICAgICwgICAgV29ybGQhISEhISEhISEhJyk7XHJcbi8vICMgPj4gezpvaywgW1wiSGVsbG9cIiwgXCJXb3JsZFwiXX1cclxuXHJcbmZ1bmN0aW9uIGxvZ1RvU2NyZWVuKHN0cjApIHtcclxuICAgIGNvbnNvbGUubG9nKCdcIicgKyBzdHIwICsgJ1wiIC0tPiAnICsgZ3JlZXRpbmdzUC5ydW4oc3RyMCkudmFsdWVbMF0udG9TdHJpbmcoKSk7XHJcbn1cclxuIl19