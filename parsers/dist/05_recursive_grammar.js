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

    // # Simple algebraic expression parser that performs the four basic arithmetic
    // # operations: `+`, `-`, `*` and `/`. The `*` and `/` have precedence over `+`
    // # and `-`
    //
    // # We will implement this in the most straightforward way, we will learn that
    // # Paco offers better ways to do the same thing
    //
    // # First of all we need numbers, numbers representation could be much more
    // # complex than that but for now we don't care and we will keep it simple
    // number = while("0123456789", at_least: 1)
    //
    // parse("1", number) |> IO.inspect
    // # >> {:ok, "1"}
    // parse("42", number) |> IO.inspect
    // # >> {:ok, "42"}
    // parse("1024", number) |> IO.inspect
    // # >> {:ok, "1024"}
    //
    // # Ok, but we need numbers not strings, we need to be able to take the result of
    // # the `number` parser and convert it to an integer. Luckily we have the `bind`
    // # combinator
    // number = while("0123456789", at_least: 1)
    //          |> bind(&String.to_integer/1)

    var numberP1 = (0, _parsers.manyChars1)(_parsers.digitP).fmap(parseFloat).setLabel('manyChars1(digitP).fmap(parseFloat)');

    console.log('\n05_recursive_grammar.js');
    logToScreen('42', numberP1);
    // parse("42", number) |> IO.inspect
    // # >> {:ok, 42}
    logToScreen('1834798542234', numberP1);

    // # We also need to ignore whitespaces around a number, to do that we will use
    // # the `surrounded_by` combinator, since the whitespaces are optionals we also
    // # use the `maybe` combinator
    // number = while("0123456789", at_least: 1)
    //          |> surrounded_by(bls?)
    //          |> bind(&String.to_integer/1)

    var numberP2 = (0, _parsers.between)((0, _parsers.opt)((0, _parsers.many)(_parsers.whiteP)), numberP1, (0, _parsers.opt)((0, _parsers.many)(_parsers.whiteP)));

    logToScreen('   42  ', numberP2);
    // parse(" 42 ", number) |> IO.inspect
    // # >> {:ok, 42}

    // # An expression is a number, an operation between expressions and an expression
    // # between parentheses. An expression is defined in terms of itself so it's a
    // # recursive definition. For a recursive definition we need a recursive parser
    //
    // # We need to be able to talk about a parser before having completed its
    // # definition, for this we use the `recursive` combinator
    //
    //
    //   def box(%Parser{} = p), do: p
    //   def box(%Regex{} = r), do: re(r)
    //   def box(s) when is_binary(s), do: lit(s)
    //   def box(nil), do: always(nil)
    //   def box(t), do: Paco.Parsable.to_parser(t)
    //
    // parser recursive(f) do
    //   fn state, this ->
    //     box(f.(this)).parse.(state, this)
    //   end
    // end

    function recursive(f) {}
    //return (state, this) => box(f(this)).run(state, this)

    // expression =
    //   recursive(
    //     fn(e) ->
    //       one_of([number, e |> surrounded_by(lex("("), lex(")"))])
    //     end)
    //
    // # The `recursive` combinator takes a function that is called with the
    // # parser itself as the first parameter. Here `expression` and `e` are the same
    // # parser

    //const expressionP = recursive(e => orElse(numberP2, betweenParens(e)));

    var expressionP1 = (0, _parsers.parser)(function (pos) {
        return (0, _parsers.orElse)(numberP2, (0, _parsers.betweenParens)(expressionP1)).run(pos);
    });

    logToScreen('42', expressionP1);
    // parse("42", expression) |> IO.inspect
    // # >> {:ok, 42}

    logToScreen('(42)', expressionP1);
    // parse("(42)", expression) |> IO.inspect
    // # >> {:ok, 42}
    //
    // # Note that surrounded_by takes two lexemes that are going to consume useless
    // # whitespaces. In fact, by default strings in surrounded_by are converted in
    // # lexemes so we can leave out the `lex` combinator
    // expression =
    //   recursive(
    //     fn(e) ->
    //       one_of([number, e |> surrounded_by("(", ")")])
    //     end)
    //

    logToScreen('(  42  )', expressionP1);
    // parse("( 42 )", expression) |> IO.inspect
    // # >> {:ok, 42}
    //
    // # Now we are going to add the `*` and `/` operator, what is going to be
    // # multiplied or divided? A number or an expression surrounded by parentheses.
    // # For now let's focus on recognizing the structure
    // expression =
    //   recursive(
    //     fn(e) ->
    //       multipliables = one_of([number, e |> surrounded_by("(", ")")])
    //       one_of([
    //         multipliables |> separated_by("*", at_least: 2),
    //         multipliables |> separated_by("/", at_least: 2)
    //       ])
    //     end)
    //

    var expressionP = (0, _parsers.parser)(function (pos) {
        var factorP = (0, _parsers.orElse)(numberP2, (0, _parsers.betweenParens)(expressionP));
        var multipliedsP = (0, _parsers.parser)(function (pos) {
            return factorP.andThen((0, _parsers.trimP)((0, _parsers.orElse)((0, _parsers.pchar)('*'), (0, _parsers.pchar)('/')))).andThen((0, _parsers.choice)([multipliedsP, factorP])).fmap(function (_ref) {
                var _ref2 = _slicedToArray(_ref, 2),
                    _ref2$ = _slicedToArray(_ref2[0], 2),
                    f1 = _ref2$[0],
                    op = _ref2$[1],
                    f2 = _ref2[1];

                return op === '*' ? f1 * f2 : Math.round(f1 / f2);
            }).run(pos);
        }, 'multipliedsP');
        var summedsP = (0, _parsers.parser)(function (pos) {
            return factorP.andThen((0, _parsers.trimP)((0, _parsers.orElse)((0, _parsers.pchar)('+'), (0, _parsers.pchar)('-')))).andThen((0, _parsers.choice)([summedsP, factorP])).fmap(function (_ref3) {
                var _ref4 = _slicedToArray(_ref3, 2),
                    _ref4$ = _slicedToArray(_ref4[0], 2),
                    f1 = _ref4$[0],
                    op = _ref4$[1],
                    f2 = _ref4[1];

                return op === '+' ? f1 + f2 : f1 - f2;
            }).run(pos);
        }, 'summedsP');
        return (0, _parsers.choice)([multipliedsP, summedsP, factorP]).run(pos);
    });

    // # We need to force the `separated_by` combinator to match at least 1 separator
    // # otherwise it would be happy to match a single number as multiplication and so
    // # to never parse divisions
    //
    logToScreen('42 * 2', expressionP);
    logToScreen('42 + 2', expressionP);
    // parse("42 * 2", expression) |> IO.inspect
    // # >> {:ok, [42, 2]}
    logToScreen('42 * 2 * 2', expressionP);
    logToScreen('42 - 2 - 2', expressionP);
    // parse("42 * 2 * 2", expression) |> IO.inspect
    // # >> {:ok, [42, 2, 2]}
    logToScreen('42 / 2', expressionP);
    logToScreen('42 - 2', expressionP);
    // parse("42 / 2", expression) |> IO.inspect
    // # >> {:ok, [42, 2]}
    logToScreen('42', expressionP);
    // parse("42", expression) |> IO.inspect
    // # >> {:ok, 42}
    logToScreen('16', expressionP);
    // parse("16", expression) |> IO.inspect
    // # >> {:ok, [16]}
    logToScreen('16*2', expressionP);
    logToScreen('16+2', expressionP);
    // parse("16 * 2", expression) |> IO.inspect
    // # >> {:ok, [16, 2]}
    logToScreen('16/2', expressionP);
    logToScreen('16-2', expressionP);
    // parse("16 / 2", expression) |> IO.inspect
    // # >> {:ok, [16, 2]}
    logToScreen('(42 * 2) / 2', expressionP);
    logToScreen('42 / 2 * 2', expressionP);
    logToScreen('(84 / 2) / 2', expressionP);
    logToScreen('(84 / 2) - (2 + 2)', expressionP);

    // # Now we can start to reduce the expression with the help of
    // # `Paco.Transform.separated_by` transformer which is going to make our job
    // # easier
    //
    // reduce = &Paco.Transform.separated_by(
    //            &1,
    //            fn("*", n, m) -> n * m
    //              ("/", n, m) -> n / m |> round
    //            end)
    //
    // expression =
    //   recursive(
    //     fn(e) ->
    //       multipliables = one_of([number, e |> surrounded_by("(", ")")])
    //       multipliables |> separated_by(keep(one_of(["*", "/"]))) |> bind(reduce)
    //     end)
    //   |> followed_by(eof)
    //
    // parse("42 * 2", expression) |> IO.inspect
    // # >> {:ok, 84}
    // parse("42 / 2", expression) |> IO.inspect
    // # >> {:ok, 21}
    //
    // # Nice, time to introduce the last two operators following the same pattern
    //
    // reduce = &Paco.Transform.separated_by(
    //            &1,
    //            fn("*", n, m) -> n * m
    //              ("/", n, m) -> n / m |> round
    //              ("+", n, m) -> n + m
    //              ("-", n, m) -> n - m
    //            end)
    //
    // expression =
    //   recursive(
    //     fn(e) ->
    //       multipliables = one_of([number, e |> surrounded_by("(", ")")])
    //       additionables = multipliables
    //                       |> separated_by(keep(one_of(["*", "/"])))
    //                       |> bind(reduce)
    //       additionables
    //       |> separated_by(keep(one_of(["+", "-"])))
    //       |> bind(reduce)
    //     end)
    //   |> followed_by(eof)
    //
    //
    logToScreen('42 + 2', expressionP);
    // parse("42 + 2", expression) |> IO.inspect
    // # >> {:ok, 44}
    logToScreen('42 - 2', expressionP);
    // parse("42 - 2", expression) |> IO.inspect
    // # >> {:ok, 40}
    //
    // # What about the operators precedence?
    logToScreen('42 - 2 * 5', expressionP);
    // parse("42 - 2 * 5", expression) |> IO.inspect
    // # >> {:ok, 32}
    logToScreen('(42 - 2) * 5', expressionP);
    // parse("(42 - 2) * 5", expression) |> IO.inspect
    // # >> {:ok, 200}
    //
    // # It works! Let's check if all it's ok
    //
    logToScreen('42', expressionP);
    // parse("42", expression) |> IO.inspect
    // # >> {:ok, 42}
    logToScreen('(42)', expressionP);
    // parse("(42)", expression) |> IO.inspect
    // # >> {:ok, 42}
    logToScreen('42 + 2', expressionP);
    // parse("42 + 2", expression) |> IO.inspect
    // # >> {:ok, 44}
    logToScreen('42 + 2 - 2', expressionP);
    // parse("42 + 2 - 2", expression) |> IO.inspect
    // # >> {:ok, 42}
    logToScreen('(42) + (2)', expressionP);
    // parse("(42) + (2)", expression) |> IO.inspect
    // # >> {:ok, 44}
    logToScreen('42 * 2 + 1', expressionP);
    // parse("42 * 2 + 1", expression) |> IO.inspect
    // # >> {:ok, 85}
    logToScreen('42 * (2 + 1)', expressionP);
    // parse("42 * (2 + 1)", expression) |> IO.inspect
    // # >> {:ok, 126}
    logToScreen('(42 + 2) / (3 - 1)', expressionP);
    // parse("(42 + 2) / (3 - 1)", expression) |> IO.inspect
    // # >> {:ok, 22}
    logToScreen('((42 + 2) / (3 - 1))', expressionP);
    // parse("((42 + 2) / (3 - 1))", expression) |> IO.inspect
    // # >> {:ok, 22}
    logToScreen('42 + 2 * 3 + 100', expressionP);
    // parse("42 + 2 * 3 + 100", expression) |> IO.inspect
    // # >> {:ok, 148}
    logToScreen('((42+2)/(3-1))', expressionP);
    logToScreen('(((42+2)/(3-1)))', expressionP);
    // parse("((42+2)/(3-1))", expression) |> IO.inspect
    // # >> {:ok, 22}
    logToScreen('9 - 12 - 6', expressionP);
    // parse("9 - 12 - 6", expression) |> IO.inspect
    // # >> {:ok, -9}
    logToScreen('9 - (12 - 6)', expressionP);
    // parse("9 - (12 - 6)", expression) |> IO.inspect
    // # >> {:ok, 3}
    logToScreen('1+1*2', expressionP);
    logToScreen('1 + 1 * 2', expressionP);
    logToScreen('1+(1*2)', expressionP);
    logToScreen('(1+1*2)', expressionP);
    logToScreen('(1+(1*2))', expressionP);
    logToScreen('(3*4*5)', expressionP);
    logToScreen('(1+1*2)+(3*4*5)', expressionP);
    logToScreen('(1+1*2)+(3*4*5)/20', expressionP);
    logToScreen('(1+(1*2))+(3*4*5)/20', expressionP);
    logToScreen('(1+(1*2))+((3*4*5)/20)', expressionP);
    // parse("(1+1*2)+(3*4*5)/20", expression) |> IO.inspect
    // # >> {:ok, 6}
    logToScreen('((1+1*2)+(3*4*5))/3', expressionP);
    logToScreen('((1+(1*2))+(3*4*5))/3', expressionP);
    // parse("((1+1*2)+(3*4*5))/3", expression) |> IO.inspect
    // # >> {:ok, 21}
    //
    // # After a little simplification here's the final result
    // reduce = &Paco.Transform.separated_by(
    //            &1,
    //            fn("*", n, m) -> n * m
    //              ("/", n, m) -> n / m |> round
    //              ("+", n, m) -> n + m
    //              ("-", n, m) -> n - m
    //            end)
    //
    // expression =
    //   recursive(
    //     fn(e) ->
    //       one_of([number, e |> surrounded_by("(", ")")])
    //       |> separated_by(keep(one_of(["*", "/"])))
    //       |> bind(reduce)
    //       |> separated_by(keep(one_of(["+", "-"])))
    //       |> bind(reduce)
    //     end)
    //   |> followed_by(eof)
    //
    // # That's pretty neat but we can do even better, we will see how...

    function logToScreen(str, parser) {
        var result = parser.run(_classes.Position.fromText(str));
        var outcome = result.isSuccess ? result.value[0].toString() : 'Failure: ' + result.value[0].toString() + result.value[1].toString();
        console.log('"' + str + '" --> ' + outcome);
    }
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2V4YW1wbGVzLzA1X3JlY3Vyc2l2ZV9ncmFtbWFyLmpzIl0sIm5hbWVzIjpbIm51bWJlclAxIiwiZGlnaXRQIiwiZm1hcCIsInBhcnNlRmxvYXQiLCJzZXRMYWJlbCIsImNvbnNvbGUiLCJsb2ciLCJsb2dUb1NjcmVlbiIsIm51bWJlclAyIiwid2hpdGVQIiwicmVjdXJzaXZlIiwiZiIsImV4cHJlc3Npb25QMSIsInJ1biIsInBvcyIsImV4cHJlc3Npb25QIiwiZmFjdG9yUCIsIm11bHRpcGxpZWRzUCIsImFuZFRoZW4iLCJmMSIsIm9wIiwiZjIiLCJNYXRoIiwicm91bmQiLCJzdW1tZWRzUCIsInN0ciIsInBhcnNlciIsInJlc3VsdCIsIlBvc2l0aW9uIiwiZnJvbVRleHQiLCJvdXRjb21lIiwiaXNTdWNjZXNzIiwidmFsdWUiLCJ0b1N0cmluZyJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFtREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxRQUFNQSxXQUFXLHlCQUFXQyxlQUFYLEVBQW1CQyxJQUFuQixDQUF3QkMsVUFBeEIsRUFBb0NDLFFBQXBDLENBQTZDLHFDQUE3QyxDQUFqQjs7QUFFQUMsWUFBUUMsR0FBUixDQUFZLDJCQUFaO0FBQ0FDLGdCQUFZLElBQVosRUFBa0JQLFFBQWxCO0FBQ0E7QUFDQTtBQUNBTyxnQkFBWSxlQUFaLEVBQTZCUCxRQUE3Qjs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsUUFBTVEsV0FBVyxzQkFBUSxrQkFBSSxtQkFBS0MsZUFBTCxDQUFKLENBQVIsRUFBMkJULFFBQTNCLEVBQXFDLGtCQUFJLG1CQUFLUyxlQUFMLENBQUosQ0FBckMsQ0FBakI7O0FBRUFGLGdCQUFZLFNB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QUNBOztBQUVBLGFBQVNSLFdBQVQsQ0FBcUJrQixHQUFyQixFQUEwQkMsTUFBMUIsRUFBa0M7QUFDOUIsWUFBTUMsU0FBU0QsT0FBT2IsR0FBUCxDQUFXZSxrQkFBU0MsUUFBVCxDQUFrQkosR0FBbEIsQ0FBWCxDQUFmO0FBQ0EsWUFBTUssVUFBV0gsT0FBT0ksU0FBUixHQUFxQkosT0FBT0ssS0FBUCxDQUFhLENBQWIsRUFBZ0JDLFFBQWhCLEVBQXJCLEdBQWtELGNBQWNOLE9BQU9LLEtBQVAsQ0FBYSxDQUFiLEVBQWdCQyxRQUFoQixFQUFkLEdBQTJDTixPQUFPSyxLQUFQLENBQWEsQ0FBYixFQUFnQkMsUUFBaEIsRUFBN0c7QUFDQTVCLGdCQUFRQyxHQUFSLENBQVksTUFBTW1CLEdBQU4sR0FBWSxRQUFaLEdBQXVCSyxPQUFuQztBQUNIIiwiZmlsZSI6IjA1X3JlY3Vyc2l2ZV9ncmFtbWFyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8gY2ZyLiBodHRwczovL2dpdGh1Yi5jb20vZ2FicmllbGVsYW5hL3BhY28vYmxvYi9tYXN0ZXIvZXhhbXBsZXMvMDVfcmVjdXJzaXZlX2dyYW1tYXIuZXhzXHJcblxyXG5pbXBvcnQge1xyXG4gICAgSlZhbHVlLFxyXG4gICAgVHVwbGUsXHJcbiAgICBQb3NpdGlvbixcclxufSBmcm9tICdjbGFzc2VzJztcclxuaW1wb3J0IHtcclxuICAgIFZhbGlkYXRpb24sXHJcbn0gZnJvbSAndmFsaWRhdGlvbic7XHJcbmltcG9ydCB7XHJcbiAgICBwYXJzZXIsXHJcbiAgICBjaGFyUGFyc2VyLFxyXG4gICAgZGlnaXRQYXJzZXIsXHJcbiAgICBwcmVkaWNhdGVCYXNlZFBhcnNlcixcclxuICAgIHBjaGFyLFxyXG4gICAgcGRpZ2l0LFxyXG4gICAgYW5kVGhlbixcclxuICAgIG9yRWxzZSxcclxuICAgIGNob2ljZSxcclxuICAgIGFueU9mLFxyXG4gICAgZm1hcCxcclxuICAgIHJldHVyblAsXHJcbiAgICBhcHBseVAsXHJcbiAgICBsaWZ0MixcclxuICAgIHNlcXVlbmNlUCxcclxuICAgIHNlcXVlbmNlUDIsXHJcbiAgICBwc3RyaW5nLFxyXG4gICAgemVyb09yTW9yZSxcclxuICAgIG1hbnksXHJcbiAgICBtYW55MSxcclxuICAgIG1hbnlDaGFycyxcclxuICAgIG1hbnlDaGFyczEsXHJcbiAgICBvcHQsXHJcbiAgICBvcHRCb29rLFxyXG4gICAgZGlzY2FyZEZpcnN0LFxyXG4gICAgZGlzY2FyZFNlY29uZCxcclxuICAgIGJldHdlZW4sXHJcbiAgICBiZXR3ZWVuUGFyZW5zLFxyXG4gICAgc2VwQnkxLFxyXG4gICAgbG93ZXJjYXNlUCxcclxuICAgIHVwcGVyY2FzZVAsXHJcbiAgICBsZXR0ZXJQLFxyXG4gICAgZGlnaXRQLFxyXG4gICAgd2hpdGVQLFxyXG4gICAgdGFwUCxcclxuICAgIGxvZ1AsXHJcbiAgICBwd29yZCxcclxuICAgIHRyaW1QLFxyXG59IGZyb20gJ3BhcnNlcnMnO1xyXG5cclxuLy8gIyBTaW1wbGUgYWxnZWJyYWljIGV4cHJlc3Npb24gcGFyc2VyIHRoYXQgcGVyZm9ybXMgdGhlIGZvdXIgYmFzaWMgYXJpdGhtZXRpY1xyXG4vLyAjIG9wZXJhdGlvbnM6IGArYCwgYC1gLCBgKmAgYW5kIGAvYC4gVGhlIGAqYCBhbmQgYC9gIGhhdmUgcHJlY2VkZW5jZSBvdmVyIGArYFxyXG4vLyAjIGFuZCBgLWBcclxuLy9cclxuLy8gIyBXZSB3aWxsIGltcGxlbWVudCB0aGlzIGluIHRoZSBtb3N0IHN0cmFpZ2h0Zm9yd2FyZCB3YXksIHdlIHdpbGwgbGVhcm4gdGhhdFxyXG4vLyAjIFBhY28gb2ZmZXJzIGJldHRlciB3YXlzIHRvIGRvIHRoZSBzYW1lIHRoaW5nXHJcbi8vXHJcbi8vICMgRmlyc3Qgb2YgYWxsIHdlIG5lZWQgbnVtYmVycywgbnVtYmVycyByZXByZXNlbnRhdGlvbiBjb3VsZCBiZSBtdWNoIG1vcmVcclxuLy8gIyBjb21wbGV4IHRoYW4gdGhhdCBidXQgZm9yIG5vdyB3ZSBkb24ndCBjYXJlIGFuZCB3ZSB3aWxsIGtlZXAgaXQgc2ltcGxlXHJcbi8vIG51bWJlciA9IHdoaWxlKFwiMDEyMzQ1Njc4OVwiLCBhdF9sZWFzdDogMSlcclxuLy9cclxuLy8gcGFyc2UoXCIxXCIsIG51bWJlcikgfD4gSU8uaW5zcGVjdFxyXG4vLyAjID4+IHs6b2ssIFwiMVwifVxyXG4vLyBwYXJzZShcIjQyXCIsIG51bWJlcikgfD4gSU8uaW5zcGVjdFxyXG4vLyAjID4+IHs6b2ssIFwiNDJcIn1cclxuLy8gcGFyc2UoXCIxMDI0XCIsIG51bWJlcikgfD4gSU8uaW5zcGVjdFxyXG4vLyAjID4+IHs6b2ssIFwiMTAyNFwifVxyXG4vL1xyXG4vLyAjIE9rLCBidXQgd2UgbmVlZCBudW1iZXJzIG5vdCBzdHJpbmdzLCB3ZSBuZWVkIHRvIGJlIGFibGUgdG8gdGFrZSB0aGUgcmVzdWx0IG9mXHJcbi8vICMgdGhlIGBudW1iZXJgIHBhcnNlciBhbmQgY29udmVydCBpdCB0byBhbiBpbnRlZ2VyLiBMdWNraWx5IHdlIGhhdmUgdGhlIGBiaW5kYFxyXG4vLyAjIGNvbWJpbmF0b3JcclxuLy8gbnVtYmVyID0gd2hpbGUoXCIwMTIzNDU2Nzg5XCIsIGF0X2xlYXN0OiAxKVxyXG4vLyAgICAgICAgICB8PiBiaW5kKCZTdHJpbmcudG9faW50ZWdlci8xKVxyXG5cclxuY29uc3QgbnVtYmVyUDEgPSBtYW55Q2hhcnMxKGRpZ2l0UCkuZm1hcChwYXJzZUZsb2F0KS5zZXRMYWJlbCgnbWFueUNoYXJzMShkaWdpdFApLmZtYXAocGFyc2VGbG9hdCknKTtcclxuXHJcbmNvbnNvbGUubG9nKCdcXG4wNV9yZWN1cnNpdmVfZ3JhbW1hci5qcycpO1xyXG5sb2dUb1NjcmVlbignNDInLCBudW1iZXJQMSk7XHJcbi8vIHBhcnNlKFwiNDJcIiwgbnVtYmVyKSB8PiBJTy5pbnNwZWN0XHJcbi8vICMgPj4gezpvaywgNDJ9XHJcbmxvZ1RvU2NyZWVuKCcxODM0Nzk4NTQyMjM0JywgbnVtYmVyUDEpO1xyXG5cclxuLy8gIyBXZSBhbHNvIG5lZWQgdG8gaWdub3JlIHdoaXRlc3BhY2VzIGFyb3VuZCBhIG51bWJlciwgdG8gZG8gdGhhdCB3ZSB3aWxsIHVzZVxyXG4vLyAjIHRoZSBgc3Vycm91bmRlZF9ieWAgY29tYmluYXRvciwgc2luY2UgdGhlIHdoaXRlc3BhY2VzIGFyZSBvcHRpb25hbHMgd2UgYWxzb1xyXG4vLyAjIHVzZSB0aGUgYG1heWJlYCBjb21iaW5hdG9yXHJcbi8vIG51bWJlciA9IHdoaWxlKFwiMDEyMzQ1Njc4OVwiLCBhdF9sZWFzdDogMSlcclxuLy8gICAgICAgICAgfD4gc3Vycm91bmRlZF9ieShibHM/KVxyXG4vLyAgICAgICAgICB8PiBiaW5kKCZTdHJpbmcudG9faW50ZWdlci8xKVxyXG5cclxuY29uc3QgbnVtYmVyUDIgPSBiZXR3ZWVuKG9wdChtYW55KHdoaXRlUCkpLCBudW1iZXJQMSwgb3B0KG1hbnkod2hpdGVQKSkpO1xyXG5cclxubG9nVG9TY3JlZW4oJyAgIDQyICAnLCBudW1iZXJQMik7XHJcbi8vIHBhcnNlKFwiIDQyIFwiLCBudW1iZXIpIHw+IElPLmluc3BlY3RcclxuLy8gIyA+PiB7Om9rLCA0Mn1cclxuXHJcbi8vICMgQW4gZXhwcmVzc2lvbiBpcyBhIG51bWJlciwgYW4gb3BlcmF0aW9uIGJldHdlZW4gZXhwcmVzc2lvbnMgYW5kIGFuIGV4cHJlc3Npb25cclxuLy8gIyBiZXR3ZWVuIHBhcmVudGhlc2VzLiBBbiBleHByZXNzaW9uIGlzIGRlZmluZWQgaW4gdGVybXMgb2YgaXRzZWxmIHNvIGl0J3MgYVxyXG4vLyAjIHJlY3Vyc2l2ZSBkZWZpbml0aW9uLiBGb3IgYSByZWN1cnNpdmUgZGVmaW5pdGlvbiB3ZSBuZWVkIGEgcmVjdXJzaXZlIHBhcnNlclxyXG4vL1xyXG4vLyAjIFdlIG5lZWQgdG8gYmUgYWJsZSB0byB0YWxrIGFib3V0IGEgcGFyc2VyIGJlZm9yZSBoYXZpbmcgY29tcGxldGVkIGl0c1xyXG4vLyAjIGRlZmluaXRpb24sIGZvciB0aGlzIHdlIHVzZSB0aGUgYHJlY3Vyc2l2ZWAgY29tYmluYXRvclxyXG4vL1xyXG4vL1xyXG4vLyAgIGRlZiBib3goJVBhcnNlcnt9ID0gcCksIGRvOiBwXHJcbi8vICAgZGVmIGJveCglUmVnZXh7fSA9IHIpLCBkbzogcmUocilcclxuLy8gICBkZWYgYm94KHMpIHdoZW4gaXNfYmluYXJ5KHMpLCBkbzogbGl0KHMpXHJcbi8vICAgZGVmIGJveChuaWwpLCBkbzogYWx3YXlzKG5pbClcclxuLy8gICBkZWYgYm94KHQpLCBkbzogUGFjby5QYXJzYWJsZS50b19wYXJzZXIodClcclxuLy9cclxuLy8gcGFyc2VyIHJlY3Vyc2l2ZShmKSBkb1xyXG4vLyAgIGZuIHN0YXRlLCB0aGlzIC0+XHJcbi8vICAgICBib3goZi4odGhpcykpLnBhcnNlLihzdGF0ZSwgdGhpcylcclxuLy8gICBlbmRcclxuLy8gZW5kXHJcblxyXG5mdW5jdGlvbiByZWN1cnNpdmUoZikge1xyXG4gICAgLy9yZXR1cm4gKHN0YXRlLCB0aGlzKSA9PiBib3goZih0aGlzKSkucnVuKHN0YXRlLCB0aGlzKVxyXG59XHJcbi8vIGV4cHJlc3Npb24gPVxyXG4vLyAgIHJlY3Vyc2l2ZShcclxuLy8gICAgIGZuKGUpIC0+XHJcbi8vICAgICAgIG9uZV9vZihbbnVtYmVyLCBlIHw+IHN1cnJvdW5kZWRfYnkobGV4KFwiKFwiKSwgbGV4KFwiKVwiKSldKVxyXG4vLyAgICAgZW5kKVxyXG4vL1xyXG4vLyAjIFRoZSBgcmVjdXJzaXZlYCBjb21iaW5hdG9yIHRha2VzIGEgZnVuY3Rpb24gdGhhdCBpcyBjYWxsZWQgd2l0aCB0aGVcclxuLy8gIyBwYXJzZXIgaXRzZWxmIGFzIHRoZSBmaXJzdCBwYXJhbWV0ZXIuIEhlcmUgYGV4cHJlc3Npb25gIGFuZCBgZWAgYXJlIHRoZSBzYW1lXHJcbi8vICMgcGFyc2VyXHJcblxyXG4vL2NvbnN0IGV4cHJlc3Npb25QID0gcmVjdXJzaXZlKGUgPT4gb3JFbHNlKG51bWJlclAyLCBiZXR3ZWVuUGFyZW5zKGUpKSk7XHJcblxyXG5jb25zdCBleHByZXNzaW9uUDEgPSBwYXJzZXIocG9zID0+IG9yRWxzZShudW1iZXJQMiwgYmV0d2VlblBhcmVucyhleHByZXNzaW9uUDEpKS5ydW4ocG9zKSk7XHJcblxyXG5sb2dUb1NjcmVlbignNDInLCBleHByZXNzaW9uUDEpO1xyXG4vLyBwYXJzZShcIjQyXCIsIGV4cHJlc3Npb24pIHw+IElPLmluc3BlY3RcclxuLy8gIyA+PiB7Om9rLCA0Mn1cclxuXHJcbmxvZ1RvU2NyZWVuKCcoNDIpJywgZXhwcmVzc2lvblAxKTtcclxuLy8gcGFyc2UoXCIoNDIpXCIsIGV4cHJlc3Npb24pIHw+IElPLmluc3BlY3RcclxuLy8gIyA+PiB7Om9rLCA0Mn1cclxuLy9cclxuLy8gIyBOb3RlIHRoYXQgc3Vycm91bmRlZF9ieSB0YWtlcyB0d28gbGV4ZW1lcyB0aGF0IGFyZSBnb2luZyB0byBjb25zdW1lIHVzZWxlc3NcclxuLy8gIyB3aGl0ZXNwYWNlcy4gSW4gZmFjdCwgYnkgZGVmYXVsdCBzdHJpbmdzIGluIHN1cnJvdW5kZWRfYnkgYXJlIGNvbnZlcnRlZCBpblxyXG4vLyAjIGxleGVtZXMgc28gd2UgY2FuIGxlYXZlIG91dCB0aGUgYGxleGAgY29tYmluYXRvclxyXG4vLyBleHByZXNzaW9uID1cclxuLy8gICByZWN1cnNpdmUoXHJcbi8vICAgICBmbihlKSAtPlxyXG4vLyAgICAgICBvbmVfb2YoW251bWJlciwgZSB8PiBzdXJyb3VuZGVkX2J5KFwiKFwiLCBcIilcIildKVxyXG4vLyAgICAgZW5kKVxyXG4vL1xyXG5cclxubG9nVG9TY3JlZW4oJyggIDQyICApJywgZXhwcmVzc2lvblAxKTtcclxuLy8gcGFyc2UoXCIoIDQyIClcIiwgZXhwcmVzc2lvbikgfD4gSU8uaW5zcGVjdFxyXG4vLyAjID4+IHs6b2ssIDQyfVxyXG4vL1xyXG4vLyAjIE5vdyB3ZSBhcmUgZ29pbmcgdG8gYWRkIHRoZSBgKmAgYW5kIGAvYCBvcGVyYXRvciwgd2hhdCBpcyBnb2luZyB0byBiZVxyXG4vLyAjIG11bHRpcGxpZWQgb3IgZGl2aWRlZD8gQSBudW1iZXIgb3IgYW4gZXhwcmVzc2lvbiBzdXJyb3VuZGVkIGJ5IHBhcmVudGhlc2VzLlxyXG4vLyAjIEZvciBub3cgbGV0J3MgZm9jdXMgb24gcmVjb2duaXppbmcgdGhlIHN0cnVjdHVyZVxyXG4vLyBleHByZXNzaW9uID1cclxuLy8gICByZWN1cnNpdmUoXHJcbi8vICAgICBmbihlKSAtPlxyXG4vLyAgICAgICBtdWx0aXBsaWFibGVzID0gb25lX29mKFtudW1iZXIsIGUgfD4gc3Vycm91bmRlZF9ieShcIihcIiwgXCIpXCIpXSlcclxuLy8gICAgICAgb25lX29mKFtcclxuLy8gICAgICAgICBtdWx0aXBsaWFibGVzIHw+IHNlcGFyYXRlZF9ieShcIipcIiwgYXRfbGVhc3Q6IDIpLFxyXG4vLyAgICAgICAgIG11bHRpcGxpYWJsZXMgfD4gc2VwYXJhdGVkX2J5KFwiL1wiLCBhdF9sZWFzdDogMilcclxuLy8gICAgICAgXSlcclxuLy8gICAgIGVuZClcclxuLy9cclxuXHJcbmNvbnN0IGV4cHJlc3Npb25QID0gcGFyc2VyKHBvcyA9PiB7XHJcbiAgICBjb25zdCBmYWN0b3JQID0gb3JFbHNlKG51bWJlclAyLCBiZXR3ZWVuUGFyZW5zKGV4cHJlc3Npb25QKSk7XHJcbiAgICBjb25zdCBtdWx0aXBsaWVkc1AgPSBwYXJzZXIocG9zID0+IGZhY3RvclBcclxuICAgICAgICAuYW5kVGhlbih0cmltUChvckVsc2UocGNoYXIoJyonKSwgcGNoYXIoJy8nKSkpKVxyXG4gICAgICAgIC5hbmRUaGVuKGNob2ljZShbbXVsdGlwbGllZHNQLCBmYWN0b3JQXSkpXHJcbiAgICAgICAgLmZtYXAoKFtbZjEsIG9wXSwgZjJdKSA9PiAob3AgPT09ICcqJykgPyBmMSAqIGYyIDogTWF0aC5yb3VuZChmMSAvIGYyKSlcclxuICAgICAgICAucnVuKHBvcyksICdtdWx0aXBsaWVkc1AnKTtcclxuICAgIGNvbnN0IHN1bW1lZHNQID0gcGFyc2VyKHBvcyA9PiBmYWN0b3JQXHJcbiAgICAgICAgLmFuZFRoZW4odHJpbVAob3JFbHNlKHBjaGFyKCcrJyksIHBjaGFyKCctJykpKSlcclxuICAgICAgICAuYW5kVGhlbihjaG9pY2UoW3N1bW1lZHNQLCBmYWN0b3JQXSkpXHJcbiAgICAgICAgLmZtYXAoKFtbZjEsIG9wXSwgZjJdKSA9PiAob3AgPT09ICcrJykgPyBmMSArIGYyIDogZjEgLSBmMilcclxuICAgICAgICAucnVuKHBvcyksICdzdW1tZWRzUCcpO1xyXG4gICAgcmV0dXJuIGNob2ljZShbbXVsdGlwbGllZHNQLCBzdW1tZWRzUCwgZmFjdG9yUF0pLnJ1bihwb3MpO1xyXG59KTtcclxuXHJcbi8vICMgV2UgbmVlZCB0byBmb3JjZSB0aGUgYHNlcGFyYXRlZF9ieWAgY29tYmluYXRvciB0byBtYXRjaCBhdCBsZWFzdCAxIHNlcGFyYXRvclxyXG4vLyAjIG90aGVyd2lzZSBpdCB3b3VsZCBiZSBoYXBweSB0byBtYXRjaCBhIHNpbmdsZSBudW1iZXIgYXMgbXVsdGlwbGljYXRpb24gYW5kIHNvXHJcbi8vICMgdG8gbmV2ZXIgcGFyc2UgZGl2aXNpb25zXHJcbi8vXHJcbmxvZ1RvU2NyZWVuKCc0MiAqIDInLCBleHByZXNzaW9uUCk7XHJcbmxvZ1RvU2NyZWVuKCc0MiArIDInLCBleHByZXNzaW9uUCk7XHJcbi8vIHBhcnNlKFwiNDIgKiAyXCIsIGV4cHJlc3Npb24pIHw+IElPLmluc3BlY3RcclxuLy8gIyA+PiB7Om9rLCBbNDIsIDJdfVxyXG5sb2dUb1NjcmVlbignNDIgKiAyICogMicsIGV4cHJlc3Npb25QKTtcclxubG9nVG9TY3JlZW4oJzQyIC0gMiAtIDInLCBleHByZXNzaW9uUCk7XHJcbi8vIHBhcnNlKFwiNDIgKiAyICogMlwiLCBleHByZXNzaW9uKSB8PiBJTy5pbnNwZWN0XHJcbi8vICMgPj4gezpvaywgWzQyLCAyLCAyXX1cclxubG9nVG9TY3JlZW4oJzQyIC8gMicsIGV4cHJlc3Npb25QKTtcclxubG9nVG9TY3JlZW4oJzQyIC0gMicsIGV4cHJlc3Npb25QKTtcclxuLy8gcGFyc2UoXCI0MiAvIDJcIiwgZXhwcmVzc2lvbikgfD4gSU8uaW5zcGVjdFxyXG4vLyAjID4+IHs6b2ssIFs0MiwgMl19XHJcbmxvZ1RvU2NyZWVuKCc0MicsIGV4cHJlc3Npb25QKTtcclxuLy8gcGFyc2UoXCI0MlwiLCBleHByZXNzaW9uKSB8PiBJTy5pbnNwZWN0XHJcbi8vICMgPj4gezpvaywgNDJ9XHJcbmxvZ1RvU2NyZWVuKCcxNicsIGV4cHJlc3Npb25QKTtcclxuLy8gcGFyc2UoXCIxNlwiLCBleHByZXNzaW9uKSB8PiBJTy5pbnNwZWN0XHJcbi8vICMgPj4gezpvaywgWzE2XX1cclxubG9nVG9TY3JlZW4oJzE2KjInLCBleHByZXNzaW9uUCk7XHJcbmxvZ1RvU2NyZWVuKCcxNisyJywgZXhwcmVzc2lvblApO1xyXG4vLyBwYXJzZShcIjE2ICogMlwiLCBleHByZXNzaW9uKSB8PiBJTy5pbnNwZWN0XHJcbi8vICMgPj4gezpvaywgWzE2LCAyXX1cclxubG9nVG9TY3JlZW4oJzE2LzInLCBleHByZXNzaW9uUCk7XHJcbmxvZ1RvU2NyZWVuKCcxNi0yJywgZXhwcmVzc2lvblApO1xyXG4vLyBwYXJzZShcIjE2IC8gMlwiLCBleHByZXNzaW9uKSB8PiBJTy5pbnNwZWN0XHJcbi8vICMgPj4gezpvaywgWzE2LCAyXX1cclxubG9nVG9TY3JlZW4oJyg0MiAqIDIpIC8gMicsIGV4cHJlc3Npb25QKTtcclxubG9nVG9TY3JlZW4oJzQyIC8gMiAqIDInLCBleHByZXNzaW9uUCk7XHJcbmxvZ1RvU2NyZWVuKCcoODQgLyAyKSAvIDInLCBleHByZXNzaW9uUCk7XHJcbmxvZ1RvU2NyZWVuKCcoODQgLyAyKSAtICgyICsgMiknLCBleHByZXNzaW9uUCk7XHJcblxyXG4vLyAjIE5vdyB3ZSBjYW4gc3RhcnQgdG8gcmVkdWNlIHRoZSBleHByZXNzaW9uIHdpdGggdGhlIGhlbHAgb2ZcclxuLy8gIyBgUGFjby5UcmFuc2Zvcm0uc2VwYXJhdGVkX2J5YCB0cmFuc2Zvcm1lciB3aGljaCBpcyBnb2luZyB0byBtYWtlIG91ciBqb2JcclxuLy8gIyBlYXNpZXJcclxuLy9cclxuLy8gcmVkdWNlID0gJlBhY28uVHJhbnNmb3JtLnNlcGFyYXRlZF9ieShcclxuLy8gICAgICAgICAgICAmMSxcclxuLy8gICAgICAgICAgICBmbihcIipcIiwgbiwgbSkgLT4gbiAqIG1cclxuLy8gICAgICAgICAgICAgIChcIi9cIiwgbiwgbSkgLT4gbiAvIG0gfD4gcm91bmRcclxuLy8gICAgICAgICAgICBlbmQpXHJcbi8vXHJcbi8vIGV4cHJlc3Npb24gPVxyXG4vLyAgIHJlY3Vyc2l2ZShcclxuLy8gICAgIGZuKGUpIC0+XHJcbi8vICAgICAgIG11bHRpcGxpYWJsZXMgPSBvbmVfb2YoW251bWJlciwgZSB8PiBzdXJyb3VuZGVkX2J5KFwiKFwiLCBcIilcIildKVxyXG4vLyAgICAgICBtdWx0aXBsaWFibGVzIHw+IHNlcGFyYXRlZF9ieShrZWVwKG9uZV9vZihbXCIqXCIsIFwiL1wiXSkpKSB8PiBiaW5kKHJlZHVjZSlcclxuLy8gICAgIGVuZClcclxuLy8gICB8PiBmb2xsb3dlZF9ieShlb2YpXHJcbi8vXHJcbi8vIHBhcnNlKFwiNDIgKiAyXCIsIGV4cHJlc3Npb24pIHw+IElPLmluc3BlY3RcclxuLy8gIyA+PiB7Om9rLCA4NH1cclxuLy8gcGFyc2UoXCI0MiAvIDJcIiwgZXhwcmVzc2lvbikgfD4gSU8uaW5zcGVjdFxyXG4vLyAjID4+IHs6b2ssIDIxfVxyXG4vL1xyXG4vLyAjIE5pY2UsIHRpbWUgdG8gaW50cm9kdWNlIHRoZSBsYXN0IHR3byBvcGVyYXRvcnMgZm9sbG93aW5nIHRoZSBzYW1lIHBhdHRlcm5cclxuLy9cclxuLy8gcmVkdWNlID0gJlBhY28uVHJhbnNmb3JtLnNlcGFyYXRlZF9ieShcclxuLy8gICAgICAgICAgICAmMSxcclxuLy8gICAgICAgICAgICBmbihcIipcIiwgbiwgbSkgLT4gbiAqIG1cclxuLy8gICAgICAgICAgICAgIChcIi9cIiwgbiwgbSkgLT4gbiAvIG0gfD4gcm91bmRcclxuLy8gICAgICAgICAgICAgIChcIitcIiwgbiwgbSkgLT4gbiArIG1cclxuLy8gICAgICAgICAgICAgIChcIi1cIiwgbiwgbSkgLT4gbiAtIG1cclxuLy8gICAgICAgICAgICBlbmQpXHJcbi8vXHJcbi8vIGV4cHJlc3Npb24gPVxyXG4vLyAgIHJlY3Vyc2l2ZShcclxuLy8gICAgIGZuKGUpIC0+XHJcbi8vICAgICAgIG11bHRpcGxpYWJsZXMgPSBvbmVfb2YoW251bWJlciwgZSB8PiBzdXJyb3VuZGVkX2J5KFwiKFwiLCBcIilcIildKVxyXG4vLyAgICAgICBhZGRpdGlvbmFibGVzID0gbXVsdGlwbGlhYmxlc1xyXG4vLyAgICAgICAgICAgICAgICAgICAgICAgfD4gc2VwYXJhdGVkX2J5KGtlZXAob25lX29mKFtcIipcIiwgXCIvXCJdKSkpXHJcbi8vICAgICAgICAgICAgICAgICAgICAgICB8PiBiaW5kKHJlZHVjZSlcclxuLy8gICAgICAgYWRkaXRpb25hYmxlc1xyXG4vLyAgICAgICB8PiBzZXBhcmF0ZWRfYnkoa2VlcChvbmVfb2YoW1wiK1wiLCBcIi1cIl0pKSlcclxuLy8gICAgICAgfD4gYmluZChyZWR1Y2UpXHJcbi8vICAgICBlbmQpXHJcbi8vICAgfD4gZm9sbG93ZWRfYnkoZW9mKVxyXG4vL1xyXG4vL1xyXG5sb2dUb1NjcmVlbignNDIgKyAyJywgZXhwcmVzc2lvblApO1xyXG4vLyBwYXJzZShcIjQyICsgMlwiLCBleHByZXNzaW9uKSB8PiBJTy5pbnNwZWN0XHJcbi8vICMgPj4gezpvaywgNDR9XHJcbmxvZ1RvU2NyZWVuKCc0MiAtIDInLCBleHByZXNzaW9uUCk7XHJcbi8vIHBhcnNlKFwiNDIgLSAyXCIsIGV4cHJlc3Npb24pIHw+IElPLmluc3BlY3RcclxuLy8gIyA+PiB7Om9rLCA0MH1cclxuLy9cclxuLy8gIyBXaGF0IGFib3V0IHRoZSBvcGVyYXRvcnMgcHJlY2VkZW5jZT9cclxubG9nVG9TY3JlZW4oJzQyIC0gMiAqIDUnLCBleHByZXNzaW9uUCk7XHJcbi8vIHBhcnNlKFwiNDIgLSAyICogNVwiLCBleHByZXNzaW9uKSB8PiBJTy5pbnNwZWN0XHJcbi8vICMgPj4gezpvaywgMzJ9XHJcbmxvZ1RvU2NyZWVuKCcoNDIgLSAyKSAqIDUnLCBleHByZXNzaW9uUCk7XHJcbi8vIHBhcnNlKFwiKDQyIC0gMikgKiA1XCIsIGV4cHJlc3Npb24pIHw+IElPLmluc3BlY3RcclxuLy8gIyA+PiB7Om9rLCAyMDB9XHJcbi8vXHJcbi8vICMgSXQgd29ya3MhIExldCdzIGNoZWNrIGlmIGFsbCBpdCdzIG9rXHJcbi8vXHJcbmxvZ1RvU2NyZWVuKCc0MicsIGV4cHJlc3Npb25QKTtcclxuLy8gcGFyc2UoXCI0MlwiLCBleHByZXNzaW9uKSB8PiBJTy5pbnNwZWN0XHJcbi8vICMgPj4gezpvaywgNDJ9XHJcbmxvZ1RvU2NyZWVuKCcoNDIpJywgZXhwcmVzc2lvblApO1xyXG4vLyBwYXJzZShcIig0MilcIiwgZXhwcmVzc2lvbikgfD4gSU8uaW5zcGVjdFxyXG4vLyAjID4+IHs6b2ssIDQyfVxyXG5sb2dUb1NjcmVlbignNDIgKyAyJywgZXhwcmVzc2lvblApO1xyXG4vLyBwYXJzZShcIjQyICsgMlwiLCBleHByZXNzaW9uKSB8PiBJTy5pbnNwZWN0XHJcbi8vICMgPj4gezpvaywgNDR9XHJcbmxvZ1RvU2NyZWVuKCc0MiArIDIgLSAyJywgZXhwcmVzc2lvblApO1xyXG4vLyBwYXJzZShcIjQyICsgMiAtIDJcIiwgZXhwcmVzc2lvbikgfD4gSU8uaW5zcGVjdFxyXG4vLyAjID4+IHs6b2ssIDQyfVxyXG5sb2dUb1NjcmVlbignKDQyKSArICgyKScsIGV4cHJlc3Npb25QKTtcclxuLy8gcGFyc2UoXCIoNDIpICsgKDIpXCIsIGV4cHJlc3Npb24pIHw+IElPLmluc3BlY3RcclxuLy8gIyA+PiB7Om9rLCA0NH1cclxubG9nVG9TY3JlZW4oJzQyICogMiArIDEnLCBleHByZXNzaW9uUCk7XHJcbi8vIHBhcnNlKFwiNDIgKiAyICsgMVwiLCBleHByZXNzaW9uKSB8PiBJTy5pbnNwZWN0XHJcbi8vICMgPj4gezpvaywgODV9XHJcbmxvZ1RvU2NyZWVuKCc0MiAqICgyICsgMSknLCBleHByZXNzaW9uUCk7XHJcbi8vIHBhcnNlKFwiNDIgKiAoMiArIDEpXCIsIGV4cHJlc3Npb24pIHw+IElPLmluc3BlY3RcclxuLy8gIyA+PiB7Om9rLCAxMjZ9XHJcbmxvZ1RvU2NyZWVuKCcoNDIgKyAyKSAvICgzIC0gMSknLCBleHByZXNzaW9uUCk7XHJcbi8vIHBhcnNlKFwiKDQyICsgMikgLyAoMyAtIDEpXCIsIGV4cHJlc3Npb24pIHw+IElPLmluc3BlY3RcclxuLy8gIyA+PiB7Om9rLCAyMn1cclxubG9nVG9TY3JlZW4oJygoNDIgKyAyKSAvICgzIC0gMSkpJywgZXhwcmVzc2lvblApO1xyXG4vLyBwYXJzZShcIigoNDIgKyAyKSAvICgzIC0gMSkpXCIsIGV4cHJlc3Npb24pIHw+IElPLmluc3BlY3RcclxuLy8gIyA+PiB7Om9rLCAyMn1cclxubG9nVG9TY3JlZW4oJzQyICsgMiAqIDMgKyAxMDAnLCBleHByZXNzaW9uUCk7XHJcbi8vIHBhcnNlKFwiNDIgKyAyICogMyArIDEwMFwiLCBleHByZXNzaW9uKSB8PiBJTy5pbnNwZWN0XHJcbi8vICMgPj4gezpvaywgMTQ4fVxyXG5sb2dUb1NjcmVlbignKCg0MisyKS8oMy0xKSknLCBleHByZXNzaW9uUCk7XHJcbmxvZ1RvU2NyZWVuKCcoKCg0MisyKS8oMy0xKSkpJywgZXhwcmVzc2lvblApO1xyXG4vLyBwYXJzZShcIigoNDIrMikvKDMtMSkpXCIsIGV4cHJlc3Npb24pIHw+IElPLmluc3BlY3RcclxuLy8gIyA+PiB7Om9rLCAyMn1cclxubG9nVG9TY3JlZW4oJzkgLSAxMiAtIDYnLCBleHByZXNzaW9uUCk7XHJcbi8vIHBhcnNlKFwiOSAtIDEyIC0gNlwiLCBleHByZXNzaW9uKSB8PiBJTy5pbnNwZWN0XHJcbi8vICMgPj4gezpvaywgLTl9XHJcbmxvZ1RvU2NyZWVuKCc5IC0gKDEyIC0gNiknLCBleHByZXNzaW9uUCk7XHJcbi8vIHBhcnNlKFwiOSAtICgxMiAtIDYpXCIsIGV4cHJlc3Npb24pIHw+IElPLmluc3BlY3RcclxuLy8gIyA+PiB7Om9rLCAzfVxyXG5sb2dUb1NjcmVlbignMSsxKjInLCBleHByZXNzaW9uUCk7XHJcbmxvZ1RvU2NyZWVuKCcxICsgMSAqIDInLCBleHByZXNzaW9uUCk7XHJcbmxvZ1RvU2NyZWVuKCcxKygxKjIpJywgZXhwcmVzc2lvblApO1xyXG5sb2dUb1NjcmVlbignKDErMSoyKScsIGV4cHJlc3Npb25QKTtcclxubG9nVG9TY3JlZW4oJygxKygxKjIpKScsIGV4cHJlc3Npb25QKTtcclxubG9nVG9TY3JlZW4oJygzKjQqNSknLCBleHByZXNzaW9uUCk7XHJcbmxvZ1RvU2NyZWVuKCcoMSsxKjIpKygzKjQqNSknLCBleHByZXNzaW9uUCk7XHJcbmxvZ1RvU2NyZWVuKCcoMSsxKjIpKygzKjQqNSkvMjAnLCBleHByZXNzaW9uUCk7XHJcbmxvZ1RvU2NyZWVuKCcoMSsoMSoyKSkrKDMqNCo1KS8yMCcsIGV4cHJlc3Npb25QKTtcclxubG9nVG9TY3JlZW4oJygxKygxKjIpKSsoKDMqNCo1KS8yMCknLCBleHByZXNzaW9uUCk7XHJcbi8vIHBhcnNlKFwiKDErMSoyKSsoMyo0KjUpLzIwXCIsIGV4cHJlc3Npb24pIHw+IElPLmluc3BlY3RcclxuLy8gIyA+PiB7Om9rLCA2fVxyXG5sb2dUb1NjcmVlbignKCgxKzEqMikrKDMqNCo1KSkvMycsIGV4cHJlc3Npb25QKTtcclxubG9nVG9TY3JlZW4oJygoMSsoMSoyKSkrKDMqNCo1KSkvMycsIGV4cHJlc3Npb25QKTtcclxuLy8gcGFyc2UoXCIoKDErMSoyKSsoMyo0KjUpKS8zXCIsIGV4cHJlc3Npb24pIHw+IElPLmluc3BlY3RcclxuLy8gIyA+PiB7Om9rLCAyMX1cclxuLy9cclxuLy8gIyBBZnRlciBhIGxpdHRsZSBzaW1wbGlmaWNhdGlvbiBoZXJlJ3MgdGhlIGZpbmFsIHJlc3VsdFxyXG4vLyByZWR1Y2UgPSAmUGFjby5UcmFuc2Zvcm0uc2VwYXJhdGVkX2J5KFxyXG4vLyAgICAgICAgICAgICYxLFxyXG4vLyAgICAgICAgICAgIGZuKFwiKlwiLCBuLCBtKSAtPiBuICogbVxyXG4vLyAgICAgICAgICAgICAgKFwiL1wiLCBuLCBtKSAtPiBuIC8gbSB8PiByb3VuZFxyXG4vLyAgICAgICAgICAgICAgKFwiK1wiLCBuLCBtKSAtPiBuICsgbVxyXG4vLyAgICAgICAgICAgICAgKFwiLVwiLCBuLCBtKSAtPiBuIC0gbVxyXG4vLyAgICAgICAgICAgIGVuZClcclxuLy9cclxuLy8gZXhwcmVzc2lvbiA9XHJcbi8vICAgcmVjdXJzaXZlKFxyXG4vLyAgICAgZm4oZSkgLT5cclxuLy8gICAgICAgb25lX29mKFtudW1iZXIsIGUgfD4gc3Vycm91bmRlZF9ieShcIihcIiwgXCIpXCIpXSlcclxuLy8gICAgICAgfD4gc2VwYXJhdGVkX2J5KGtlZXAob25lX29mKFtcIipcIiwgXCIvXCJdKSkpXHJcbi8vICAgICAgIHw+IGJpbmQocmVkdWNlKVxyXG4vLyAgICAgICB8PiBzZXBhcmF0ZWRfYnkoa2VlcChvbmVfb2YoW1wiK1wiLCBcIi1cIl0pKSlcclxuLy8gICAgICAgfD4gYmluZChyZWR1Y2UpXHJcbi8vICAgICBlbmQpXHJcbi8vICAgfD4gZm9sbG93ZWRfYnkoZW9mKVxyXG4vL1xyXG4vLyAjIFRoYXQncyBwcmV0dHkgbmVhdCBidXQgd2UgY2FuIGRvIGV2ZW4gYmV0dGVyLCB3ZSB3aWxsIHNlZSBob3cuLi5cclxuXHJcbmZ1bmN0aW9uIGxvZ1RvU2NyZWVuKHN0ciwgcGFyc2VyKSB7XHJcbiAgICBjb25zdCByZXN1bHQgPSBwYXJzZXIucnVuKFBvc2l0aW9uLmZyb21UZXh0KHN0cikpO1xyXG4gICAgY29uc3Qgb3V0Y29tZSA9IChyZXN1bHQuaXNTdWNjZXNzKSA/IHJlc3VsdC52YWx1ZVswXS50b1N0cmluZygpIDogJ0ZhaWx1cmU6ICcgKyByZXN1bHQudmFsdWVbMF0udG9TdHJpbmcoKSArIHJlc3VsdC52YWx1ZVsxXS50b1N0cmluZygpO1xyXG4gICAgY29uc29sZS5sb2coJ1wiJyArIHN0ciArICdcIiAtLT4gJyArIG91dGNvbWUpO1xyXG59XHJcbiJdfQ==