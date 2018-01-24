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
            return factorP.discardSecond((0, _parsers.trimP)((0, _parsers.pchar)('*'))).andThen((0, _parsers.choice)([multipliedsP, dividedsP, factorP])).fmap(function (_ref) {
                var _ref2 = _slicedToArray(_ref, 2),
                    f1 = _ref2[0],
                    f2 = _ref2[1];

                return f1 * f2;
            }).run(pos);
        }, 'multipliedsP');
        var dividedsP = (0, _parsers.parser)(function (pos) {
            return factorP.discardSecond((0, _parsers.trimP)((0, _parsers.pchar)('/'))).andThen((0, _parsers.choice)([multipliedsP, dividedsP, factorP])).fmap(function (_ref3) {
                var _ref4 = _slicedToArray(_ref3, 2),
                    f1 = _ref4[0],
                    f2 = _ref4[1];

                return f1 / f2;
            }).run(pos);
        }, 'dividedsP');
        return (0, _parsers.choice)([multipliedsP, dividedsP, factorP]).run(pos);
    });

    // # We need to force the `separated_by` combinator to match at least 1 separator
    // # otherwise it would be happy to match a single number as multiplication and so
    // # to never parse divisions
    //
    logToScreen('42 * 2', expressionP);
    // parse("42 * 2", expression) |> IO.inspect
    // # >> {:ok, [42, 2]}
    logToScreen('42 * 2 * 2', expressionP);
    // parse("42 * 2 * 2", expression) |> IO.inspect
    // # >> {:ok, [42, 2, 2]}
    logToScreen('42 / 2', expressionP);
    // parse("42 / 2", expression) |> IO.inspect
    // # >> {:ok, [42, 2]}
    logToScreen('42', expressionP);
    // parse("42", expression) |> IO.inspect
    // # >> {:ok, 42}
    logToScreen('16', expressionP);
    // parse("16", expression) |> IO.inspect
    // # >> {:ok, [16]}
    logToScreen('16*2', expressionP);
    // parse("16 * 2", expression) |> IO.inspect
    // # >> {:ok, [16, 2]}
    logToScreen('16/2', expressionP);
    // parse("16 / 2", expression) |> IO.inspect
    // # >> {:ok, [16, 2]}
    logToScreen('(42 * 2) / 2', expressionP);
    logToScreen('42 / 2 * 2', expressionP);
    logToScreen('(84 / 2) / 2', expressionP);

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
    // parse("42 + 2", expression) |> IO.inspect
    // # >> {:ok, 44}
    // parse("42 - 2", expression) |> IO.inspect
    // # >> {:ok, 40}
    //
    // # What about the operators precedence?
    // parse("42 - 2 * 5", expression) |> IO.inspect
    // # >> {:ok, 32}
    // parse("(42 - 2) * 5", expression) |> IO.inspect
    // # >> {:ok, 200}
    //
    // # It works! Let's check if all it's ok
    //
    // parse("42", expression) |> IO.inspect
    // # >> {:ok, 42}
    // parse("(42)", expression) |> IO.inspect
    // # >> {:ok, 42}
    // parse("42 + 2", expression) |> IO.inspect
    // # >> {:ok, 44}
    // parse("42 + 2 - 2", expression) |> IO.inspect
    // # >> {:ok, 42}
    // parse("(42) + (2)", expression) |> IO.inspect
    // # >> {:ok, 44}
    // parse("42 * 2 + 1", expression) |> IO.inspect
    // # >> {:ok, 85}
    // parse("42 * (2 + 1)", expression) |> IO.inspect
    // # >> {:ok, 126}
    // parse("(42 + 2) / (3 - 1)", expression) |> IO.inspect
    // # >> {:ok, 22}
    // parse("((42 + 2) / (3 - 1))", expression) |> IO.inspect
    // # >> {:ok, 22}
    // parse("42 + 2 * 3 + 100", expression) |> IO.inspect
    // # >> {:ok, 148}
    // parse("((42+2)/(3-1))", expression) |> IO.inspect
    // # >> {:ok, 22}
    // parse("9 - 12 - 6", expression) |> IO.inspect
    // # >> {:ok, -9}
    // parse("9 - (12 - 6)", expression) |> IO.inspect
    // # >> {:ok, 3}
    // parse("(1+1*2)+(3*4*5)/20", expression) |> IO.inspect
    // # >> {:ok, 6}
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
        var outcome = result.isSuccess ? result.value[0].toString() : 'Failure: ' + result.value[0].toString();
        console.log('"' + str + '" --> ' + outcome);
    }
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2V4YW1wbGVzLzA1X3JlY3Vyc2l2ZV9ncmFtbWFyLmpzIl0sIm5hbWVzIjpbIm51bWJlclAxIiwiZm1hcCIsInBhcnNlRmxvYXQiLCJzZXRMYWJlbCIsImxvZ1RvU2NyZWVuIiwibnVtYmVyUDIiLCJyZWN1cnNpdmUiLCJmIiwiZXhwcmVzc2lvblAxIiwicnVuIiwicG9zIiwiZXhwcmVzc2lvblAiLCJmYWN0b3JQIiwibXVsdGlwbGllZHNQIiwiZGlzY2FyZFNlY29uZCIsImFuZFRoZW4iLCJkaXZpZGVkc1AiLCJmMSIsImYyIiwic3RyIiwicGFyc2VyIiwicmVzdWx0IiwiZnJvbVRleHQiLCJvdXRjb21lIiwiaXNTdWNjZXNzIiwidmFsdWUiLCJ0b1N0cmluZyIsImNvbnNvbGUiLCJsb2ciXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBbURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsUUFBTUEsV0FBVywwQ0FBbUJDLElBQW5CLENBQXdCQyxVQUF4QixFQUFvQ0MsUUFBcEMsQ0FBNkMscUNBQTdDLENBQWpCOztBQUVBQyxnQkFBWSxJQUFaLEVBQWtCSixRQUFsQjtBQUNBO0FBQ0E7QUFDQUksZ0JBQVksZUFBWixFQUE2QkosUUFBN0I7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLFFBQU1LLFdBQVcsc0JBQVEsa0JBQUksbUNBQUosQ0FBUixFQUEyQkwsUUFBM0IsRUFBcUMsa0JBQUksbUNBQUosQ0FBckMsQ0FBakI7O0FBRUFJLGdCQUFZLFNBQVosRUFBdUJDLFFBQXZCO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtB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QTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsYUFBU1AsV0FBVCxDQUFxQmUsR0FBckIsRUFBMEJDLE1BQTFCLEVBQWtDO0FBQzlCLFlBQU1DLFNBQVNELE9BQU9YLEdBQVAsQ0FBVyxrQkFBU2EsUUFBVCxDQUFrQkgsR0FBbEIsQ0FBWCxDQUFmO0FBQ0EsWUFBTUksVUFBV0YsT0FBT0csU0FBUixHQUFxQkgsT0FBT0ksS0FBUCxDQUFhLENBQWIsRUFBZ0JDLFFBQWhCLEVBQXJCLEdBQWtELGNBQWNMLE9BQU9JLEtBQVAsQ0FBYSxDQUFiLEVBQWdCQyxRQUFoQixFQUFoRjtBQUNBQyxnQkFBUUMsR0FBUixDQUFZLE1BQU1ULEdBQU4sR0FBWSxRQUFaLEdBQXVCSSxPQUFuQztBQUNIIiwiZmlsZSI6IjA1X3JlY3Vyc2l2ZV9ncmFtbWFyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8gY2ZyLiBodHRwczovL2dpdGh1Yi5jb20vZ2FicmllbGVsYW5hL3BhY28vYmxvYi9tYXN0ZXIvZXhhbXBsZXMvMDVfcmVjdXJzaXZlX2dyYW1tYXIuZXhzXG5cbmltcG9ydCB7XG4gICAgSlZhbHVlLFxuICAgIFR1cGxlLFxuICAgIFBvc2l0aW9uLFxufSBmcm9tICdjbGFzc2VzJztcbmltcG9ydCB7XG4gICAgVmFsaWRhdGlvbixcbn0gZnJvbSAndmFsaWRhdGlvbic7XG5pbXBvcnQge1xuICAgIHBhcnNlcixcbiAgICBjaGFyUGFyc2VyLFxuICAgIGRpZ2l0UGFyc2VyLFxuICAgIHByZWRpY2F0ZUJhc2VkUGFyc2VyLFxuICAgIHBjaGFyLFxuICAgIHBkaWdpdCxcbiAgICBhbmRUaGVuLFxuICAgIG9yRWxzZSxcbiAgICBjaG9pY2UsXG4gICAgYW55T2YsXG4gICAgZm1hcCxcbiAgICByZXR1cm5QLFxuICAgIGFwcGx5UCxcbiAgICBsaWZ0MixcbiAgICBzZXF1ZW5jZVAsXG4gICAgc2VxdWVuY2VQMixcbiAgICBwc3RyaW5nLFxuICAgIHplcm9Pck1vcmUsXG4gICAgbWFueSxcbiAgICBtYW55MSxcbiAgICBtYW55Q2hhcnMsXG4gICAgbWFueUNoYXJzMSxcbiAgICBvcHQsXG4gICAgb3B0Qm9vayxcbiAgICBkaXNjYXJkRmlyc3QsXG4gICAgZGlzY2FyZFNlY29uZCxcbiAgICBiZXR3ZWVuLFxuICAgIGJldHdlZW5QYXJlbnMsXG4gICAgc2VwQnkxLFxuICAgIGxvd2VyY2FzZVAsXG4gICAgdXBwZXJjYXNlUCxcbiAgICBsZXR0ZXJQLFxuICAgIGRpZ2l0UCxcbiAgICB3aGl0ZVAsXG4gICAgdGFwUCxcbiAgICBsb2dQLFxuICAgIHB3b3JkLFxuICAgIHRyaW1QLFxufSBmcm9tICdwYXJzZXJzJztcblxuLy8gIyBTaW1wbGUgYWxnZWJyYWljIGV4cHJlc3Npb24gcGFyc2VyIHRoYXQgcGVyZm9ybXMgdGhlIGZvdXIgYmFzaWMgYXJpdGhtZXRpY1xuLy8gIyBvcGVyYXRpb25zOiBgK2AsIGAtYCwgYCpgIGFuZCBgL2AuIFRoZSBgKmAgYW5kIGAvYCBoYXZlIHByZWNlZGVuY2Ugb3ZlciBgK2Bcbi8vICMgYW5kIGAtYFxuLy9cbi8vICMgV2Ugd2lsbCBpbXBsZW1lbnQgdGhpcyBpbiB0aGUgbW9zdCBzdHJhaWdodGZvcndhcmQgd2F5LCB3ZSB3aWxsIGxlYXJuIHRoYXRcbi8vICMgUGFjbyBvZmZlcnMgYmV0dGVyIHdheXMgdG8gZG8gdGhlIHNhbWUgdGhpbmdcbi8vXG4vLyAjIEZpcnN0IG9mIGFsbCB3ZSBuZWVkIG51bWJlcnMsIG51bWJlcnMgcmVwcmVzZW50YXRpb24gY291bGQgYmUgbXVjaCBtb3JlXG4vLyAjIGNvbXBsZXggdGhhbiB0aGF0IGJ1dCBmb3Igbm93IHdlIGRvbid0IGNhcmUgYW5kIHdlIHdpbGwga2VlcCBpdCBzaW1wbGVcbi8vIG51bWJlciA9IHdoaWxlKFwiMDEyMzQ1Njc4OVwiLCBhdF9sZWFzdDogMSlcbi8vXG4vLyBwYXJzZShcIjFcIiwgbnVtYmVyKSB8PiBJTy5pbnNwZWN0XG4vLyAjID4+IHs6b2ssIFwiMVwifVxuLy8gcGFyc2UoXCI0MlwiLCBudW1iZXIpIHw+IElPLmluc3BlY3Rcbi8vICMgPj4gezpvaywgXCI0MlwifVxuLy8gcGFyc2UoXCIxMDI0XCIsIG51bWJlcikgfD4gSU8uaW5zcGVjdFxuLy8gIyA+PiB7Om9rLCBcIjEwMjRcIn1cbi8vXG4vLyAjIE9rLCBidXQgd2UgbmVlZCBudW1iZXJzIG5vdCBzdHJpbmdzLCB3ZSBuZWVkIHRvIGJlIGFibGUgdG8gdGFrZSB0aGUgcmVzdWx0IG9mXG4vLyAjIHRoZSBgbnVtYmVyYCBwYXJzZXIgYW5kIGNvbnZlcnQgaXQgdG8gYW4gaW50ZWdlci4gTHVja2lseSB3ZSBoYXZlIHRoZSBgYmluZGBcbi8vICMgY29tYmluYXRvclxuLy8gbnVtYmVyID0gd2hpbGUoXCIwMTIzNDU2Nzg5XCIsIGF0X2xlYXN0OiAxKVxuLy8gICAgICAgICAgfD4gYmluZCgmU3RyaW5nLnRvX2ludGVnZXIvMSlcblxuY29uc3QgbnVtYmVyUDEgPSBtYW55Q2hhcnMxKGRpZ2l0UCkuZm1hcChwYXJzZUZsb2F0KS5zZXRMYWJlbCgnbWFueUNoYXJzMShkaWdpdFApLmZtYXAocGFyc2VGbG9hdCknKTtcblxubG9nVG9TY3JlZW4oJzQyJywgbnVtYmVyUDEpO1xuLy8gcGFyc2UoXCI0MlwiLCBudW1iZXIpIHw+IElPLmluc3BlY3Rcbi8vICMgPj4gezpvaywgNDJ9XG5sb2dUb1NjcmVlbignMTgzNDc5ODU0MjIzNCcsIG51bWJlclAxKTtcblxuLy8gIyBXZSBhbHNvIG5lZWQgdG8gaWdub3JlIHdoaXRlc3BhY2VzIGFyb3VuZCBhIG51bWJlciwgdG8gZG8gdGhhdCB3ZSB3aWxsIHVzZVxuLy8gIyB0aGUgYHN1cnJvdW5kZWRfYnlgIGNvbWJpbmF0b3IsIHNpbmNlIHRoZSB3aGl0ZXNwYWNlcyBhcmUgb3B0aW9uYWxzIHdlIGFsc29cbi8vICMgdXNlIHRoZSBgbWF5YmVgIGNvbWJpbmF0b3Jcbi8vIG51bWJlciA9IHdoaWxlKFwiMDEyMzQ1Njc4OVwiLCBhdF9sZWFzdDogMSlcbi8vICAgICAgICAgIHw+IHN1cnJvdW5kZWRfYnkoYmxzPylcbi8vICAgICAgICAgIHw+IGJpbmQoJlN0cmluZy50b19pbnRlZ2VyLzEpXG5cbmNvbnN0IG51bWJlclAyID0gYmV0d2VlbihvcHQobWFueSh3aGl0ZVApKSwgbnVtYmVyUDEsIG9wdChtYW55KHdoaXRlUCkpKTtcblxubG9nVG9TY3JlZW4oJyAgIDQyICAnLCBudW1iZXJQMik7XG4vLyBwYXJzZShcIiA0MiBcIiwgbnVtYmVyKSB8PiBJTy5pbnNwZWN0XG4vLyAjID4+IHs6b2ssIDQyfVxuXG4vLyAjIEFuIGV4cHJlc3Npb24gaXMgYSBudW1iZXIsIGFuIG9wZXJhdGlvbiBiZXR3ZWVuIGV4cHJlc3Npb25zIGFuZCBhbiBleHByZXNzaW9uXG4vLyAjIGJldHdlZW4gcGFyZW50aGVzZXMuIEFuIGV4cHJlc3Npb24gaXMgZGVmaW5lZCBpbiB0ZXJtcyBvZiBpdHNlbGYgc28gaXQncyBhXG4vLyAjIHJlY3Vyc2l2ZSBkZWZpbml0aW9uLiBGb3IgYSByZWN1cnNpdmUgZGVmaW5pdGlvbiB3ZSBuZWVkIGEgcmVjdXJzaXZlIHBhcnNlclxuLy9cbi8vICMgV2UgbmVlZCB0byBiZSBhYmxlIHRvIHRhbGsgYWJvdXQgYSBwYXJzZXIgYmVmb3JlIGhhdmluZyBjb21wbGV0ZWQgaXRzXG4vLyAjIGRlZmluaXRpb24sIGZvciB0aGlzIHdlIHVzZSB0aGUgYHJlY3Vyc2l2ZWAgY29tYmluYXRvclxuLy9cbi8vXG4vLyAgIGRlZiBib3goJVBhcnNlcnt9ID0gcCksIGRvOiBwXG4vLyAgIGRlZiBib3goJVJlZ2V4e30gPSByKSwgZG86IHJlKHIpXG4vLyAgIGRlZiBib3gocykgd2hlbiBpc19iaW5hcnkocyksIGRvOiBsaXQocylcbi8vICAgZGVmIGJveChuaWwpLCBkbzogYWx3YXlzKG5pbClcbi8vICAgZGVmIGJveCh0KSwgZG86IFBhY28uUGFyc2FibGUudG9fcGFyc2VyKHQpXG4vL1xuLy8gcGFyc2VyIHJlY3Vyc2l2ZShmKSBkb1xuLy8gICBmbiBzdGF0ZSwgdGhpcyAtPlxuLy8gICAgIGJveChmLih0aGlzKSkucGFyc2UuKHN0YXRlLCB0aGlzKVxuLy8gICBlbmRcbi8vIGVuZFxuXG5mdW5jdGlvbiByZWN1cnNpdmUoZikge1xuICAgIC8vcmV0dXJuIChzdGF0ZSwgdGhpcykgPT4gYm94KGYodGhpcykpLnJ1bihzdGF0ZSwgdGhpcylcbn1cbi8vIGV4cHJlc3Npb24gPVxuLy8gICByZWN1cnNpdmUoXG4vLyAgICAgZm4oZSkgLT5cbi8vICAgICAgIG9uZV9vZihbbnVtYmVyLCBlIHw+IHN1cnJvdW5kZWRfYnkobGV4KFwiKFwiKSwgbGV4KFwiKVwiKSldKVxuLy8gICAgIGVuZClcbi8vXG4vLyAjIFRoZSBgcmVjdXJzaXZlYCBjb21iaW5hdG9yIHRha2VzIGEgZnVuY3Rpb24gdGhhdCBpcyBjYWxsZWQgd2l0aCB0aGVcbi8vICMgcGFyc2VyIGl0c2VsZiBhcyB0aGUgZmlyc3QgcGFyYW1ldGVyLiBIZXJlIGBleHByZXNzaW9uYCBhbmQgYGVgIGFyZSB0aGUgc2FtZVxuLy8gIyBwYXJzZXJcblxuLy9jb25zdCBleHByZXNzaW9uUCA9IHJlY3Vyc2l2ZShlID0+IG9yRWxzZShudW1iZXJQMiwgYmV0d2VlblBhcmVucyhlKSkpO1xuXG5jb25zdCBleHByZXNzaW9uUDEgPSBwYXJzZXIocG9zID0+IG9yRWxzZShudW1iZXJQMiwgYmV0d2VlblBhcmVucyhleHByZXNzaW9uUDEpKS5ydW4ocG9zKSk7XG5cbmxvZ1RvU2NyZWVuKCc0MicsIGV4cHJlc3Npb25QMSk7XG4vLyBwYXJzZShcIjQyXCIsIGV4cHJlc3Npb24pIHw+IElPLmluc3BlY3Rcbi8vICMgPj4gezpvaywgNDJ9XG5cbmxvZ1RvU2NyZWVuKCcoNDIpJywgZXhwcmVzc2lvblAxKTtcbi8vIHBhcnNlKFwiKDQyKVwiLCBleHByZXNzaW9uKSB8PiBJTy5pbnNwZWN0XG4vLyAjID4+IHs6b2ssIDQyfVxuLy9cbi8vICMgTm90ZSB0aGF0IHN1cnJvdW5kZWRfYnkgdGFrZXMgdHdvIGxleGVtZXMgdGhhdCBhcmUgZ29pbmcgdG8gY29uc3VtZSB1c2VsZXNzXG4vLyAjIHdoaXRlc3BhY2VzLiBJbiBmYWN0LCBieSBkZWZhdWx0IHN0cmluZ3MgaW4gc3Vycm91bmRlZF9ieSBhcmUgY29udmVydGVkIGluXG4vLyAjIGxleGVtZXMgc28gd2UgY2FuIGxlYXZlIG91dCB0aGUgYGxleGAgY29tYmluYXRvclxuLy8gZXhwcmVzc2lvbiA9XG4vLyAgIHJlY3Vyc2l2ZShcbi8vICAgICBmbihlKSAtPlxuLy8gICAgICAgb25lX29mKFtudW1iZXIsIGUgfD4gc3Vycm91bmRlZF9ieShcIihcIiwgXCIpXCIpXSlcbi8vICAgICBlbmQpXG4vL1xuXG5sb2dUb1NjcmVlbignKCAgNDIgICknLCBleHByZXNzaW9uUDEpO1xuLy8gcGFyc2UoXCIoIDQyIClcIiwgZXhwcmVzc2lvbikgfD4gSU8uaW5zcGVjdFxuLy8gIyA+PiB7Om9rLCA0Mn1cbi8vXG4vLyAjIE5vdyB3ZSBhcmUgZ29pbmcgdG8gYWRkIHRoZSBgKmAgYW5kIGAvYCBvcGVyYXRvciwgd2hhdCBpcyBnb2luZyB0byBiZVxuLy8gIyBtdWx0aXBsaWVkIG9yIGRpdmlkZWQ/IEEgbnVtYmVyIG9yIGFuIGV4cHJlc3Npb24gc3Vycm91bmRlZCBieSBwYXJlbnRoZXNlcy5cbi8vICMgRm9yIG5vdyBsZXQncyBmb2N1cyBvbiByZWNvZ25pemluZyB0aGUgc3RydWN0dXJlXG4vLyBleHByZXNzaW9uID1cbi8vICAgcmVjdXJzaXZlKFxuLy8gICAgIGZuKGUpIC0+XG4vLyAgICAgICBtdWx0aXBsaWFibGVzID0gb25lX29mKFtudW1iZXIsIGUgfD4gc3Vycm91bmRlZF9ieShcIihcIiwgXCIpXCIpXSlcbi8vICAgICAgIG9uZV9vZihbXG4vLyAgICAgICAgIG11bHRpcGxpYWJsZXMgfD4gc2VwYXJhdGVkX2J5KFwiKlwiLCBhdF9sZWFzdDogMiksXG4vLyAgICAgICAgIG11bHRpcGxpYWJsZXMgfD4gc2VwYXJhdGVkX2J5KFwiL1wiLCBhdF9sZWFzdDogMilcbi8vICAgICAgIF0pXG4vLyAgICAgZW5kKVxuLy9cblxuY29uc3QgZXhwcmVzc2lvblAgPSBwYXJzZXIocG9zID0+IHtcbiAgICBjb25zdCBmYWN0b3JQID0gb3JFbHNlKG51bWJlclAyLCBiZXR3ZWVuUGFyZW5zKGV4cHJlc3Npb25QKSk7XG4gICAgY29uc3QgbXVsdGlwbGllZHNQID0gcGFyc2VyKHBvcyA9PiBmYWN0b3JQXG4gICAgICAgIC5kaXNjYXJkU2Vjb25kKHRyaW1QKHBjaGFyKCcqJykpKVxuICAgICAgICAuYW5kVGhlbihjaG9pY2UoW211bHRpcGxpZWRzUCwgZGl2aWRlZHNQLCBmYWN0b3JQXSkpXG4gICAgICAgIC5mbWFwKChbZjEsIGYyXSkgPT4gZjEgKiBmMikucnVuKHBvcyksICdtdWx0aXBsaWVkc1AnKTtcbiAgICBjb25zdCBkaXZpZGVkc1AgPSBwYXJzZXIocG9zID0+IGZhY3RvclBcbiAgICAgICAgLmRpc2NhcmRTZWNvbmQodHJpbVAocGNoYXIoJy8nKSkpXG4gICAgICAgIC5hbmRUaGVuKGNob2ljZShbbXVsdGlwbGllZHNQLCBkaXZpZGVkc1AsIGZhY3RvclBdKSlcbiAgICAgICAgLmZtYXAoKFtmMSwgZjJdKSA9PiBmMSAvIGYyKS5ydW4ocG9zKSwgJ2RpdmlkZWRzUCcpO1xuICAgIHJldHVybiBjaG9pY2UoW211bHRpcGxpZWRzUCwgZGl2aWRlZHNQLCBmYWN0b3JQXSkucnVuKHBvcyk7XG59KTtcblxuLy8gIyBXZSBuZWVkIHRvIGZvcmNlIHRoZSBgc2VwYXJhdGVkX2J5YCBjb21iaW5hdG9yIHRvIG1hdGNoIGF0IGxlYXN0IDEgc2VwYXJhdG9yXG4vLyAjIG90aGVyd2lzZSBpdCB3b3VsZCBiZSBoYXBweSB0byBtYXRjaCBhIHNpbmdsZSBudW1iZXIgYXMgbXVsdGlwbGljYXRpb24gYW5kIHNvXG4vLyAjIHRvIG5ldmVyIHBhcnNlIGRpdmlzaW9uc1xuLy9cbmxvZ1RvU2NyZWVuKCc0MiAqIDInLCBleHByZXNzaW9uUCk7XG4vLyBwYXJzZShcIjQyICogMlwiLCBleHByZXNzaW9uKSB8PiBJTy5pbnNwZWN0XG4vLyAjID4+IHs6b2ssIFs0MiwgMl19XG5sb2dUb1NjcmVlbignNDIgKiAyICogMicsIGV4cHJlc3Npb25QKTtcbi8vIHBhcnNlKFwiNDIgKiAyICogMlwiLCBleHByZXNzaW9uKSB8PiBJTy5pbnNwZWN0XG4vLyAjID4+IHs6b2ssIFs0MiwgMiwgMl19XG5sb2dUb1NjcmVlbignNDIgLyAyJywgZXhwcmVzc2lvblApO1xuLy8gcGFyc2UoXCI0MiAvIDJcIiwgZXhwcmVzc2lvbikgfD4gSU8uaW5zcGVjdFxuLy8gIyA+PiB7Om9rLCBbNDIsIDJdfVxubG9nVG9TY3JlZW4oJzQyJywgZXhwcmVzc2lvblApO1xuLy8gcGFyc2UoXCI0MlwiLCBleHByZXNzaW9uKSB8PiBJTy5pbnNwZWN0XG4vLyAjID4+IHs6b2ssIDQyfVxubG9nVG9TY3JlZW4oJzE2JywgZXhwcmVzc2lvblApO1xuLy8gcGFyc2UoXCIxNlwiLCBleHByZXNzaW9uKSB8PiBJTy5pbnNwZWN0XG4vLyAjID4+IHs6b2ssIFsxNl19XG5sb2dUb1NjcmVlbignMTYqMicsIGV4cHJlc3Npb25QKTtcbi8vIHBhcnNlKFwiMTYgKiAyXCIsIGV4cHJlc3Npb24pIHw+IElPLmluc3BlY3Rcbi8vICMgPj4gezpvaywgWzE2LCAyXX1cbmxvZ1RvU2NyZWVuKCcxNi8yJywgZXhwcmVzc2lvblApO1xuLy8gcGFyc2UoXCIxNiAvIDJcIiwgZXhwcmVzc2lvbikgfD4gSU8uaW5zcGVjdFxuLy8gIyA+PiB7Om9rLCBbMTYsIDJdfVxubG9nVG9TY3JlZW4oJyg0MiAqIDIpIC8gMicsIGV4cHJlc3Npb25QKTtcbmxvZ1RvU2NyZWVuKCc0MiAvIDIgKiAyJywgZXhwcmVzc2lvblApO1xubG9nVG9TY3JlZW4oJyg4NCAvIDIpIC8gMicsIGV4cHJlc3Npb25QKTtcblxuLy8gIyBOb3cgd2UgY2FuIHN0YXJ0IHRvIHJlZHVjZSB0aGUgZXhwcmVzc2lvbiB3aXRoIHRoZSBoZWxwIG9mXG4vLyAjIGBQYWNvLlRyYW5zZm9ybS5zZXBhcmF0ZWRfYnlgIHRyYW5zZm9ybWVyIHdoaWNoIGlzIGdvaW5nIHRvIG1ha2Ugb3VyIGpvYlxuLy8gIyBlYXNpZXJcbi8vXG4vLyByZWR1Y2UgPSAmUGFjby5UcmFuc2Zvcm0uc2VwYXJhdGVkX2J5KFxuLy8gICAgICAgICAgICAmMSxcbi8vICAgICAgICAgICAgZm4oXCIqXCIsIG4sIG0pIC0+IG4gKiBtXG4vLyAgICAgICAgICAgICAgKFwiL1wiLCBuLCBtKSAtPiBuIC8gbSB8PiByb3VuZFxuLy8gICAgICAgICAgICBlbmQpXG4vL1xuLy8gZXhwcmVzc2lvbiA9XG4vLyAgIHJlY3Vyc2l2ZShcbi8vICAgICBmbihlKSAtPlxuLy8gICAgICAgbXVsdGlwbGlhYmxlcyA9IG9uZV9vZihbbnVtYmVyLCBlIHw+IHN1cnJvdW5kZWRfYnkoXCIoXCIsIFwiKVwiKV0pXG4vLyAgICAgICBtdWx0aXBsaWFibGVzIHw+IHNlcGFyYXRlZF9ieShrZWVwKG9uZV9vZihbXCIqXCIsIFwiL1wiXSkpKSB8PiBiaW5kKHJlZHVjZSlcbi8vICAgICBlbmQpXG4vLyAgIHw+IGZvbGxvd2VkX2J5KGVvZilcbi8vXG4vLyBwYXJzZShcIjQyICogMlwiLCBleHByZXNzaW9uKSB8PiBJTy5pbnNwZWN0XG4vLyAjID4+IHs6b2ssIDg0fVxuLy8gcGFyc2UoXCI0MiAvIDJcIiwgZXhwcmVzc2lvbikgfD4gSU8uaW5zcGVjdFxuLy8gIyA+PiB7Om9rLCAyMX1cbi8vXG4vLyAjIE5pY2UsIHRpbWUgdG8gaW50cm9kdWNlIHRoZSBsYXN0IHR3byBvcGVyYXRvcnMgZm9sbG93aW5nIHRoZSBzYW1lIHBhdHRlcm5cbi8vXG4vLyByZWR1Y2UgPSAmUGFjby5UcmFuc2Zvcm0uc2VwYXJhdGVkX2J5KFxuLy8gICAgICAgICAgICAmMSxcbi8vICAgICAgICAgICAgZm4oXCIqXCIsIG4sIG0pIC0+IG4gKiBtXG4vLyAgICAgICAgICAgICAgKFwiL1wiLCBuLCBtKSAtPiBuIC8gbSB8PiByb3VuZFxuLy8gICAgICAgICAgICAgIChcIitcIiwgbiwgbSkgLT4gbiArIG1cbi8vICAgICAgICAgICAgICAoXCItXCIsIG4sIG0pIC0+IG4gLSBtXG4vLyAgICAgICAgICAgIGVuZClcbi8vXG4vLyBleHByZXNzaW9uID1cbi8vICAgcmVjdXJzaXZlKFxuLy8gICAgIGZuKGUpIC0+XG4vLyAgICAgICBtdWx0aXBsaWFibGVzID0gb25lX29mKFtudW1iZXIsIGUgfD4gc3Vycm91bmRlZF9ieShcIihcIiwgXCIpXCIpXSlcbi8vICAgICAgIGFkZGl0aW9uYWJsZXMgPSBtdWx0aXBsaWFibGVzXG4vLyAgICAgICAgICAgICAgICAgICAgICAgfD4gc2VwYXJhdGVkX2J5KGtlZXAob25lX29mKFtcIipcIiwgXCIvXCJdKSkpXG4vLyAgICAgICAgICAgICAgICAgICAgICAgfD4gYmluZChyZWR1Y2UpXG4vLyAgICAgICBhZGRpdGlvbmFibGVzXG4vLyAgICAgICB8PiBzZXBhcmF0ZWRfYnkoa2VlcChvbmVfb2YoW1wiK1wiLCBcIi1cIl0pKSlcbi8vICAgICAgIHw+IGJpbmQocmVkdWNlKVxuLy8gICAgIGVuZClcbi8vICAgfD4gZm9sbG93ZWRfYnkoZW9mKVxuLy9cbi8vXG4vLyBwYXJzZShcIjQyICsgMlwiLCBleHByZXNzaW9uKSB8PiBJTy5pbnNwZWN0XG4vLyAjID4+IHs6b2ssIDQ0fVxuLy8gcGFyc2UoXCI0MiAtIDJcIiwgZXhwcmVzc2lvbikgfD4gSU8uaW5zcGVjdFxuLy8gIyA+PiB7Om9rLCA0MH1cbi8vXG4vLyAjIFdoYXQgYWJvdXQgdGhlIG9wZXJhdG9ycyBwcmVjZWRlbmNlP1xuLy8gcGFyc2UoXCI0MiAtIDIgKiA1XCIsIGV4cHJlc3Npb24pIHw+IElPLmluc3BlY3Rcbi8vICMgPj4gezpvaywgMzJ9XG4vLyBwYXJzZShcIig0MiAtIDIpICogNVwiLCBleHByZXNzaW9uKSB8PiBJTy5pbnNwZWN0XG4vLyAjID4+IHs6b2ssIDIwMH1cbi8vXG4vLyAjIEl0IHdvcmtzISBMZXQncyBjaGVjayBpZiBhbGwgaXQncyBva1xuLy9cbi8vIHBhcnNlKFwiNDJcIiwgZXhwcmVzc2lvbikgfD4gSU8uaW5zcGVjdFxuLy8gIyA+PiB7Om9rLCA0Mn1cbi8vIHBhcnNlKFwiKDQyKVwiLCBleHByZXNzaW9uKSB8PiBJTy5pbnNwZWN0XG4vLyAjID4+IHs6b2ssIDQyfVxuLy8gcGFyc2UoXCI0MiArIDJcIiwgZXhwcmVzc2lvbikgfD4gSU8uaW5zcGVjdFxuLy8gIyA+PiB7Om9rLCA0NH1cbi8vIHBhcnNlKFwiNDIgKyAyIC0gMlwiLCBleHByZXNzaW9uKSB8PiBJTy5pbnNwZWN0XG4vLyAjID4+IHs6b2ssIDQyfVxuLy8gcGFyc2UoXCIoNDIpICsgKDIpXCIsIGV4cHJlc3Npb24pIHw+IElPLmluc3BlY3Rcbi8vICMgPj4gezpvaywgNDR9XG4vLyBwYXJzZShcIjQyICogMiArIDFcIiwgZXhwcmVzc2lvbikgfD4gSU8uaW5zcGVjdFxuLy8gIyA+PiB7Om9rLCA4NX1cbi8vIHBhcnNlKFwiNDIgKiAoMiArIDEpXCIsIGV4cHJlc3Npb24pIHw+IElPLmluc3BlY3Rcbi8vICMgPj4gezpvaywgMTI2fVxuLy8gcGFyc2UoXCIoNDIgKyAyKSAvICgzIC0gMSlcIiwgZXhwcmVzc2lvbikgfD4gSU8uaW5zcGVjdFxuLy8gIyA+PiB7Om9rLCAyMn1cbi8vIHBhcnNlKFwiKCg0MiArIDIpIC8gKDMgLSAxKSlcIiwgZXhwcmVzc2lvbikgfD4gSU8uaW5zcGVjdFxuLy8gIyA+PiB7Om9rLCAyMn1cbi8vIHBhcnNlKFwiNDIgKyAyICogMyArIDEwMFwiLCBleHByZXNzaW9uKSB8PiBJTy5pbnNwZWN0XG4vLyAjID4+IHs6b2ssIDE0OH1cbi8vIHBhcnNlKFwiKCg0MisyKS8oMy0xKSlcIiwgZXhwcmVzc2lvbikgfD4gSU8uaW5zcGVjdFxuLy8gIyA+PiB7Om9rLCAyMn1cbi8vIHBhcnNlKFwiOSAtIDEyIC0gNlwiLCBleHByZXNzaW9uKSB8PiBJTy5pbnNwZWN0XG4vLyAjID4+IHs6b2ssIC05fVxuLy8gcGFyc2UoXCI5IC0gKDEyIC0gNilcIiwgZXhwcmVzc2lvbikgfD4gSU8uaW5zcGVjdFxuLy8gIyA+PiB7Om9rLCAzfVxuLy8gcGFyc2UoXCIoMSsxKjIpKygzKjQqNSkvMjBcIiwgZXhwcmVzc2lvbikgfD4gSU8uaW5zcGVjdFxuLy8gIyA+PiB7Om9rLCA2fVxuLy8gcGFyc2UoXCIoKDErMSoyKSsoMyo0KjUpKS8zXCIsIGV4cHJlc3Npb24pIHw+IElPLmluc3BlY3Rcbi8vICMgPj4gezpvaywgMjF9XG4vL1xuLy8gIyBBZnRlciBhIGxpdHRsZSBzaW1wbGlmaWNhdGlvbiBoZXJlJ3MgdGhlIGZpbmFsIHJlc3VsdFxuLy8gcmVkdWNlID0gJlBhY28uVHJhbnNmb3JtLnNlcGFyYXRlZF9ieShcbi8vICAgICAgICAgICAgJjEsXG4vLyAgICAgICAgICAgIGZuKFwiKlwiLCBuLCBtKSAtPiBuICogbVxuLy8gICAgICAgICAgICAgIChcIi9cIiwgbiwgbSkgLT4gbiAvIG0gfD4gcm91bmRcbi8vICAgICAgICAgICAgICAoXCIrXCIsIG4sIG0pIC0+IG4gKyBtXG4vLyAgICAgICAgICAgICAgKFwiLVwiLCBuLCBtKSAtPiBuIC0gbVxuLy8gICAgICAgICAgICBlbmQpXG4vL1xuLy8gZXhwcmVzc2lvbiA9XG4vLyAgIHJlY3Vyc2l2ZShcbi8vICAgICBmbihlKSAtPlxuLy8gICAgICAgb25lX29mKFtudW1iZXIsIGUgfD4gc3Vycm91bmRlZF9ieShcIihcIiwgXCIpXCIpXSlcbi8vICAgICAgIHw+IHNlcGFyYXRlZF9ieShrZWVwKG9uZV9vZihbXCIqXCIsIFwiL1wiXSkpKVxuLy8gICAgICAgfD4gYmluZChyZWR1Y2UpXG4vLyAgICAgICB8PiBzZXBhcmF0ZWRfYnkoa2VlcChvbmVfb2YoW1wiK1wiLCBcIi1cIl0pKSlcbi8vICAgICAgIHw+IGJpbmQocmVkdWNlKVxuLy8gICAgIGVuZClcbi8vICAgfD4gZm9sbG93ZWRfYnkoZW9mKVxuLy9cbi8vICMgVGhhdCdzIHByZXR0eSBuZWF0IGJ1dCB3ZSBjYW4gZG8gZXZlbiBiZXR0ZXIsIHdlIHdpbGwgc2VlIGhvdy4uLlxuXG5mdW5jdGlvbiBsb2dUb1NjcmVlbihzdHIsIHBhcnNlcikge1xuICAgIGNvbnN0IHJlc3VsdCA9IHBhcnNlci5ydW4oUG9zaXRpb24uZnJvbVRleHQoc3RyKSk7XG4gICAgY29uc3Qgb3V0Y29tZSA9IChyZXN1bHQuaXNTdWNjZXNzKSA/IHJlc3VsdC52YWx1ZVswXS50b1N0cmluZygpIDogJ0ZhaWx1cmU6ICcgKyByZXN1bHQudmFsdWVbMF0udG9TdHJpbmcoKTtcbiAgICBjb25zb2xlLmxvZygnXCInICsgc3RyICsgJ1wiIC0tPiAnICsgb3V0Y29tZSk7XG59XG4iXX0=