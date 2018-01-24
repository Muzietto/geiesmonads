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
            return factorP.discardSecond((0, _parsers.trimP)((0, _parsers.pchar)('*'))).andThen((0, _parsers.orElse)(multipliedsP, factorP)).fmap(function (_ref) {
                var _ref2 = _slicedToArray(_ref, 2),
                    f1 = _ref2[0],
                    f2 = _ref2[1];

                return f1 * f2;
            }).setLabel('multipliedsP').run(pos);
        });
        var dividedsP = (0, _parsers.parser)(function (pos) {
            return factorP.discardSecond((0, _parsers.trimP)((0, _parsers.pchar)('/'))).andThen((0, _parsers.orElse)(dividedsP, factorP)).fmap(function (_ref3) {
                var _ref4 = _slicedToArray(_ref3, 2),
                    f1 = _ref4[0],
                    f2 = _ref4[1];

                return f1 / f2;
            }).setLabel('dividedsP').run(pos);
        });
        return (0, _parsers.orElse)(multipliedsP, dividedsP).run(pos);
    });

    // # We need to force the `separated_by` combinator to match at least 1 separator
    // # otherwise it would be happy to match a single number as multiplication and so
    // # to never parse divisions
    //
    logToScreen('42 * 2', expressionP);
    logToScreen('42 * 2 * 2', expressionP);
    logToScreen('42 * 2 / 2', expressionP);
    // parse("42 * 2", expression) |> IO.inspect
    // # >> {:ok, [42, 2]}
    // parse("42 * 2 * 2", expression) |> IO.inspect
    // # >> {:ok, [42, 2, 2]}
    // parse("42 / 2", expression) |> IO.inspect
    // # >> {:ok, [42, 2]}
    //
    // # We have a problem
    //
    // parse("42", expression) |> IO.inspect
    // # >> {:error, "expected one of [\"*\", \"/\"] at 1:3 but got the end of input"}
    //
    // # We have lost the power to match single numbers because the only parser we
    // # have requires at least one operator, we need to provide a parser for plain
    // # numbers
    //
    // expression =
    //   recursive(
    //     fn(e) ->
    //       multipliables = one_of([number, e |> surrounded_by("(", ")")])
    //       one_of([
    //         multipliables |> separated_by("*", at_least: 2),
    //         multipliables |> separated_by("/", at_least: 2),
    //         multipliables
    //       ])
    //     end)
    //
    // parse("42 * 2", expression) |> IO.inspect
    // # >> {:ok, [42, 2]}
    // parse("42 / 2", expression) |> IO.inspect
    // # >> {:ok, [42, 2]}
    // parse("42", expression) |> IO.inspect
    // # >> {:ok, 42}
    //
    // # Unfortunately we have another problem
    //
    // parse("42 * 2 / 2", expression) |> IO.inspect
    // # >> {:ok, [42, 2]}
    //
    // # The last expression should have been `{:ok, [42, 2, 2]}` why we didn't get a
    // # parser error? Parsing a part of the whole input is perfectly fine, if you
    // # want to make sure that your parser match the whole input we need to make sure
    // # that what follows is the end of input
    // expression =
    //   recursive(
    //     fn(e) ->
    //       multipliables = one_of([number, e |> surrounded_by("(", ")")])
    //       one_of([
    //         multipliables |> separated_by("*", at_least: 2),
    //         multipliables |> separated_by("/", at_least: 2),
    //         multipliables
    //       ])
    //     end)
    //   |> followed_by(eof)
    //
    // parse("42 * 2 / 2", expression) |> IO.inspect
    // # >> {:error, "expected the end of input at 1:8"}
    //
    // # Now it's clear, the `/` is not recognized... the problem is that once the
    // # multiplication alternative matched thanks to the first `*` what follows could
    // # only be: a continuation of the same multiplication, a number or an expression
    // # surrounded by parentheses, but not a division. In fact puting parentheses
    // # around the division solves the problem
    //
    // parse("42 * (2 * 2)", expression) |> IO.inspect
    // # >> {:ok, [42, [2, 2]]}
    //
    // # How do we solve this? Moving the `one_of` combinator inside the
    // # `separated_by` combinator will solve this and other problems we had before
    //
    // expression =
    //   recursive(
    //     fn(e) ->
    //       multipliables = one_of([number, e |> surrounded_by("(", ")")])
    //       multipliables |> separated_by(one_of(["*", "/"]))
    //     end)
    //   |> followed_by(eof)
    //
    // parse("16", expression) |> IO.inspect
    // # >> {:ok, [16]}
    // parse("16 * 2", expression) |> IO.inspect
    // # >> {:ok, [16, 2]}
    // parse("16 / 2", expression) |> IO.inspect
    // # >> {:ok, [16, 2]}
    // parse("16 * 2 / 2", expression) |> IO.inspect
    // # >> {:ok, [16, 2, 2]}
    //
    // # The only downside is that we need to keep the separator because now we can't
    // # discern between multiplication and division, to do this we will use the
    // # `keep` combinator that cancels the effect of the `skip` combinator used
    // # inside the `separated_by` combinator.
    //
    // expression =
    //   recursive(
    //     fn(e) ->
    //       multipliables = one_of([number, e |> surrounded_by("(", ")")])
    //       multipliables |> separated_by(keep(one_of(["*", "/"])))
    //     end)
    //   |> followed_by(eof)
    //
    // parse("42 * 2", expression) |> IO.inspect
    // # >> {:ok, [42, "*", 2]}
    // parse("42 / 2", expression) |> IO.inspect
    // # >> {:ok, [42, "/", 2]}
    //
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2V4YW1wbGVzLzA1X3JlY3Vyc2l2ZV9ncmFtbWFyLmpzIl0sIm5hbWVzIjpbIm51bWJlclAxIiwiZm1hcCIsInBhcnNlRmxvYXQiLCJzZXRMYWJlbCIsImxvZ1RvU2NyZWVuIiwibnVtYmVyUDIiLCJyZWN1cnNpdmUiLCJmIiwiZXhwcmVzc2lvblAxIiwicnVuIiwicG9zIiwiZXhwcmVzc2lvblAiLCJmYWN0b3JQIiwibXVsdGlwbGllZHNQIiwiZGlzY2FyZFNlY29uZCIsImFuZFRoZW4iLCJmMSIsImYyIiwiZGl2aWRlZHNQIiwic3RyIiwicGFyc2VyIiwicmVzdWx0IiwiZnJvbVRleHQiLCJvdXRjb21lIiwiaXNTdWNjZXNzIiwidmFsdWUiLCJ0b1N0cmluZyIsImNvbnNvbGUiLCJsb2ciXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBbURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsUUFBTUEsV0FBVywwQ0FBbUJDLElBQW5CLENBQXdCQyxVQUF4QixFQUFvQ0MsUUFBcEMsQ0FBNkMscUNBQTdDLENBQWpCOztBQUVBQyxnQkFBWSxJQUFaLEVBQWtCSixRQUFsQjtBQUNBO0FBQ0E7QUFDQUksZ0JBQVksZUFBWixFQUE2QkosUUFBN0I7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLFFBQU1LLFdBQVcsc0JBQVEsa0JBQUksbUNBQUosQ0FBUixFQUEyQkwsUUFBM0IsRUFBcUMsa0JBQUksbUNBQUosQ0FBckMsQ0FBakI7O0FBRUFJLGdCQUFZLFNBQVosRUFBdUJDLFFBQXZCO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtB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Q0FBWSxNQUFNVCxHQUFOLEdBQVksUUFBWixHQUF1QkksT0FBbkM7QUFDSCIsImZpbGUiOiIwNV9yZWN1cnNpdmVfZ3JhbW1hci5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vIGNmci4gaHR0cHM6Ly9naXRodWIuY29tL2dhYnJpZWxlbGFuYS9wYWNvL2Jsb2IvbWFzdGVyL2V4YW1wbGVzLzA1X3JlY3Vyc2l2ZV9ncmFtbWFyLmV4c1xuXG5pbXBvcnQge1xuICAgIEpWYWx1ZSxcbiAgICBUdXBsZSxcbiAgICBQb3NpdGlvbixcbn0gZnJvbSAnY2xhc3Nlcyc7XG5pbXBvcnQge1xuICAgIFZhbGlkYXRpb24sXG59IGZyb20gJ3ZhbGlkYXRpb24nO1xuaW1wb3J0IHtcbiAgICBwYXJzZXIsXG4gICAgY2hhclBhcnNlcixcbiAgICBkaWdpdFBhcnNlcixcbiAgICBwcmVkaWNhdGVCYXNlZFBhcnNlcixcbiAgICBwY2hhcixcbiAgICBwZGlnaXQsXG4gICAgYW5kVGhlbixcbiAgICBvckVsc2UsXG4gICAgY2hvaWNlLFxuICAgIGFueU9mLFxuICAgIGZtYXAsXG4gICAgcmV0dXJuUCxcbiAgICBhcHBseVAsXG4gICAgbGlmdDIsXG4gICAgc2VxdWVuY2VQLFxuICAgIHNlcXVlbmNlUDIsXG4gICAgcHN0cmluZyxcbiAgICB6ZXJvT3JNb3JlLFxuICAgIG1hbnksXG4gICAgbWFueTEsXG4gICAgbWFueUNoYXJzLFxuICAgIG1hbnlDaGFyczEsXG4gICAgb3B0LFxuICAgIG9wdEJvb2ssXG4gICAgZGlzY2FyZEZpcnN0LFxuICAgIGRpc2NhcmRTZWNvbmQsXG4gICAgYmV0d2VlbixcbiAgICBiZXR3ZWVuUGFyZW5zLFxuICAgIHNlcEJ5MSxcbiAgICBsb3dlcmNhc2VQLFxuICAgIHVwcGVyY2FzZVAsXG4gICAgbGV0dGVyUCxcbiAgICBkaWdpdFAsXG4gICAgd2hpdGVQLFxuICAgIHRhcFAsXG4gICAgbG9nUCxcbiAgICBwd29yZCxcbiAgICB0cmltUCxcbn0gZnJvbSAncGFyc2Vycyc7XG5cbi8vICMgU2ltcGxlIGFsZ2VicmFpYyBleHByZXNzaW9uIHBhcnNlciB0aGF0IHBlcmZvcm1zIHRoZSBmb3VyIGJhc2ljIGFyaXRobWV0aWNcbi8vICMgb3BlcmF0aW9uczogYCtgLCBgLWAsIGAqYCBhbmQgYC9gLiBUaGUgYCpgIGFuZCBgL2AgaGF2ZSBwcmVjZWRlbmNlIG92ZXIgYCtgXG4vLyAjIGFuZCBgLWBcbi8vXG4vLyAjIFdlIHdpbGwgaW1wbGVtZW50IHRoaXMgaW4gdGhlIG1vc3Qgc3RyYWlnaHRmb3J3YXJkIHdheSwgd2Ugd2lsbCBsZWFybiB0aGF0XG4vLyAjIFBhY28gb2ZmZXJzIGJldHRlciB3YXlzIHRvIGRvIHRoZSBzYW1lIHRoaW5nXG4vL1xuLy8gIyBGaXJzdCBvZiBhbGwgd2UgbmVlZCBudW1iZXJzLCBudW1iZXJzIHJlcHJlc2VudGF0aW9uIGNvdWxkIGJlIG11Y2ggbW9yZVxuLy8gIyBjb21wbGV4IHRoYW4gdGhhdCBidXQgZm9yIG5vdyB3ZSBkb24ndCBjYXJlIGFuZCB3ZSB3aWxsIGtlZXAgaXQgc2ltcGxlXG4vLyBudW1iZXIgPSB3aGlsZShcIjAxMjM0NTY3ODlcIiwgYXRfbGVhc3Q6IDEpXG4vL1xuLy8gcGFyc2UoXCIxXCIsIG51bWJlcikgfD4gSU8uaW5zcGVjdFxuLy8gIyA+PiB7Om9rLCBcIjFcIn1cbi8vIHBhcnNlKFwiNDJcIiwgbnVtYmVyKSB8PiBJTy5pbnNwZWN0XG4vLyAjID4+IHs6b2ssIFwiNDJcIn1cbi8vIHBhcnNlKFwiMTAyNFwiLCBudW1iZXIpIHw+IElPLmluc3BlY3Rcbi8vICMgPj4gezpvaywgXCIxMDI0XCJ9XG4vL1xuLy8gIyBPaywgYnV0IHdlIG5lZWQgbnVtYmVycyBub3Qgc3RyaW5ncywgd2UgbmVlZCB0byBiZSBhYmxlIHRvIHRha2UgdGhlIHJlc3VsdCBvZlxuLy8gIyB0aGUgYG51bWJlcmAgcGFyc2VyIGFuZCBjb252ZXJ0IGl0IHRvIGFuIGludGVnZXIuIEx1Y2tpbHkgd2UgaGF2ZSB0aGUgYGJpbmRgXG4vLyAjIGNvbWJpbmF0b3Jcbi8vIG51bWJlciA9IHdoaWxlKFwiMDEyMzQ1Njc4OVwiLCBhdF9sZWFzdDogMSlcbi8vICAgICAgICAgIHw+IGJpbmQoJlN0cmluZy50b19pbnRlZ2VyLzEpXG5cbmNvbnN0IG51bWJlclAxID0gbWFueUNoYXJzMShkaWdpdFApLmZtYXAocGFyc2VGbG9hdCkuc2V0TGFiZWwoJ21hbnlDaGFyczEoZGlnaXRQKS5mbWFwKHBhcnNlRmxvYXQpJyk7XG5cbmxvZ1RvU2NyZWVuKCc0MicsIG51bWJlclAxKTtcbi8vIHBhcnNlKFwiNDJcIiwgbnVtYmVyKSB8PiBJTy5pbnNwZWN0XG4vLyAjID4+IHs6b2ssIDQyfVxubG9nVG9TY3JlZW4oJzE4MzQ3OTg1NDIyMzQnLCBudW1iZXJQMSk7XG5cbi8vICMgV2UgYWxzbyBuZWVkIHRvIGlnbm9yZSB3aGl0ZXNwYWNlcyBhcm91bmQgYSBudW1iZXIsIHRvIGRvIHRoYXQgd2Ugd2lsbCB1c2Vcbi8vICMgdGhlIGBzdXJyb3VuZGVkX2J5YCBjb21iaW5hdG9yLCBzaW5jZSB0aGUgd2hpdGVzcGFjZXMgYXJlIG9wdGlvbmFscyB3ZSBhbHNvXG4vLyAjIHVzZSB0aGUgYG1heWJlYCBjb21iaW5hdG9yXG4vLyBudW1iZXIgPSB3aGlsZShcIjAxMjM0NTY3ODlcIiwgYXRfbGVhc3Q6IDEpXG4vLyAgICAgICAgICB8PiBzdXJyb3VuZGVkX2J5KGJscz8pXG4vLyAgICAgICAgICB8PiBiaW5kKCZTdHJpbmcudG9faW50ZWdlci8xKVxuXG5jb25zdCBudW1iZXJQMiA9IGJldHdlZW4ob3B0KG1hbnkod2hpdGVQKSksIG51bWJlclAxLCBvcHQobWFueSh3aGl0ZVApKSk7XG5cbmxvZ1RvU2NyZWVuKCcgICA0MiAgJywgbnVtYmVyUDIpO1xuLy8gcGFyc2UoXCIgNDIgXCIsIG51bWJlcikgfD4gSU8uaW5zcGVjdFxuLy8gIyA+PiB7Om9rLCA0Mn1cblxuLy8gIyBBbiBleHByZXNzaW9uIGlzIGEgbnVtYmVyLCBhbiBvcGVyYXRpb24gYmV0d2VlbiBleHByZXNzaW9ucyBhbmQgYW4gZXhwcmVzc2lvblxuLy8gIyBiZXR3ZWVuIHBhcmVudGhlc2VzLiBBbiBleHByZXNzaW9uIGlzIGRlZmluZWQgaW4gdGVybXMgb2YgaXRzZWxmIHNvIGl0J3MgYVxuLy8gIyByZWN1cnNpdmUgZGVmaW5pdGlvbi4gRm9yIGEgcmVjdXJzaXZlIGRlZmluaXRpb24gd2UgbmVlZCBhIHJlY3Vyc2l2ZSBwYXJzZXJcbi8vXG4vLyAjIFdlIG5lZWQgdG8gYmUgYWJsZSB0byB0YWxrIGFib3V0IGEgcGFyc2VyIGJlZm9yZSBoYXZpbmcgY29tcGxldGVkIGl0c1xuLy8gIyBkZWZpbml0aW9uLCBmb3IgdGhpcyB3ZSB1c2UgdGhlIGByZWN1cnNpdmVgIGNvbWJpbmF0b3Jcbi8vXG4vL1xuLy8gICBkZWYgYm94KCVQYXJzZXJ7fSA9IHApLCBkbzogcFxuLy8gICBkZWYgYm94KCVSZWdleHt9ID0gciksIGRvOiByZShyKVxuLy8gICBkZWYgYm94KHMpIHdoZW4gaXNfYmluYXJ5KHMpLCBkbzogbGl0KHMpXG4vLyAgIGRlZiBib3gobmlsKSwgZG86IGFsd2F5cyhuaWwpXG4vLyAgIGRlZiBib3godCksIGRvOiBQYWNvLlBhcnNhYmxlLnRvX3BhcnNlcih0KVxuLy9cbi8vIHBhcnNlciByZWN1cnNpdmUoZikgZG9cbi8vICAgZm4gc3RhdGUsIHRoaXMgLT5cbi8vICAgICBib3goZi4odGhpcykpLnBhcnNlLihzdGF0ZSwgdGhpcylcbi8vICAgZW5kXG4vLyBlbmRcblxuZnVuY3Rpb24gcmVjdXJzaXZlKGYpIHtcbiAgICAvL3JldHVybiAoc3RhdGUsIHRoaXMpID0+IGJveChmKHRoaXMpKS5ydW4oc3RhdGUsIHRoaXMpXG59XG4vLyBleHByZXNzaW9uID1cbi8vICAgcmVjdXJzaXZlKFxuLy8gICAgIGZuKGUpIC0+XG4vLyAgICAgICBvbmVfb2YoW251bWJlciwgZSB8PiBzdXJyb3VuZGVkX2J5KGxleChcIihcIiksIGxleChcIilcIikpXSlcbi8vICAgICBlbmQpXG4vL1xuLy8gIyBUaGUgYHJlY3Vyc2l2ZWAgY29tYmluYXRvciB0YWtlcyBhIGZ1bmN0aW9uIHRoYXQgaXMgY2FsbGVkIHdpdGggdGhlXG4vLyAjIHBhcnNlciBpdHNlbGYgYXMgdGhlIGZpcnN0IHBhcmFtZXRlci4gSGVyZSBgZXhwcmVzc2lvbmAgYW5kIGBlYCBhcmUgdGhlIHNhbWVcbi8vICMgcGFyc2VyXG5cbi8vY29uc3QgZXhwcmVzc2lvblAgPSByZWN1cnNpdmUoZSA9PiBvckVsc2UobnVtYmVyUDIsIGJldHdlZW5QYXJlbnMoZSkpKTtcblxuY29uc3QgZXhwcmVzc2lvblAxID0gcGFyc2VyKHBvcyA9PiBvckVsc2UobnVtYmVyUDIsIGJldHdlZW5QYXJlbnMoZXhwcmVzc2lvblAxKSkucnVuKHBvcykpO1xuXG5sb2dUb1NjcmVlbignNDInLCBleHByZXNzaW9uUDEpO1xuLy8gcGFyc2UoXCI0MlwiLCBleHByZXNzaW9uKSB8PiBJTy5pbnNwZWN0XG4vLyAjID4+IHs6b2ssIDQyfVxuXG5sb2dUb1NjcmVlbignKDQyKScsIGV4cHJlc3Npb25QMSk7XG4vLyBwYXJzZShcIig0MilcIiwgZXhwcmVzc2lvbikgfD4gSU8uaW5zcGVjdFxuLy8gIyA+PiB7Om9rLCA0Mn1cbi8vXG4vLyAjIE5vdGUgdGhhdCBzdXJyb3VuZGVkX2J5IHRha2VzIHR3byBsZXhlbWVzIHRoYXQgYXJlIGdvaW5nIHRvIGNvbnN1bWUgdXNlbGVzc1xuLy8gIyB3aGl0ZXNwYWNlcy4gSW4gZmFjdCwgYnkgZGVmYXVsdCBzdHJpbmdzIGluIHN1cnJvdW5kZWRfYnkgYXJlIGNvbnZlcnRlZCBpblxuLy8gIyBsZXhlbWVzIHNvIHdlIGNhbiBsZWF2ZSBvdXQgdGhlIGBsZXhgIGNvbWJpbmF0b3Jcbi8vIGV4cHJlc3Npb24gPVxuLy8gICByZWN1cnNpdmUoXG4vLyAgICAgZm4oZSkgLT5cbi8vICAgICAgIG9uZV9vZihbbnVtYmVyLCBlIHw+IHN1cnJvdW5kZWRfYnkoXCIoXCIsIFwiKVwiKV0pXG4vLyAgICAgZW5kKVxuLy9cblxubG9nVG9TY3JlZW4oJyggIDQyICApJywgZXhwcmVzc2lvblAxKTtcbi8vIHBhcnNlKFwiKCA0MiApXCIsIGV4cHJlc3Npb24pIHw+IElPLmluc3BlY3Rcbi8vICMgPj4gezpvaywgNDJ9XG4vL1xuLy8gIyBOb3cgd2UgYXJlIGdvaW5nIHRvIGFkZCB0aGUgYCpgIGFuZCBgL2Agb3BlcmF0b3IsIHdoYXQgaXMgZ29pbmcgdG8gYmVcbi8vICMgbXVsdGlwbGllZCBvciBkaXZpZGVkPyBBIG51bWJlciBvciBhbiBleHByZXNzaW9uIHN1cnJvdW5kZWQgYnkgcGFyZW50aGVzZXMuXG4vLyAjIEZvciBub3cgbGV0J3MgZm9jdXMgb24gcmVjb2duaXppbmcgdGhlIHN0cnVjdHVyZVxuLy8gZXhwcmVzc2lvbiA9XG4vLyAgIHJlY3Vyc2l2ZShcbi8vICAgICBmbihlKSAtPlxuLy8gICAgICAgbXVsdGlwbGlhYmxlcyA9IG9uZV9vZihbbnVtYmVyLCBlIHw+IHN1cnJvdW5kZWRfYnkoXCIoXCIsIFwiKVwiKV0pXG4vLyAgICAgICBvbmVfb2YoW1xuLy8gICAgICAgICBtdWx0aXBsaWFibGVzIHw+IHNlcGFyYXRlZF9ieShcIipcIiwgYXRfbGVhc3Q6IDIpLFxuLy8gICAgICAgICBtdWx0aXBsaWFibGVzIHw+IHNlcGFyYXRlZF9ieShcIi9cIiwgYXRfbGVhc3Q6IDIpXG4vLyAgICAgICBdKVxuLy8gICAgIGVuZClcbi8vXG5cbmNvbnN0IGV4cHJlc3Npb25QID0gcGFyc2VyKHBvcyA9PiB7XG4gICAgY29uc3QgZmFjdG9yUCA9IG9yRWxzZShudW1iZXJQMiwgYmV0d2VlblBhcmVucyhleHByZXNzaW9uUCkpO1xuICAgIGNvbnN0IG11bHRpcGxpZWRzUCA9IHBhcnNlcihwb3MgPT4gZmFjdG9yUFxuICAgICAgICAuZGlzY2FyZFNlY29uZCh0cmltUChwY2hhcignKicpKSlcbiAgICAgICAgLmFuZFRoZW4ob3JFbHNlKG11bHRpcGxpZWRzUCwgZmFjdG9yUCkpXG4gICAgICAgIC5mbWFwKChbZjEsIGYyXSkgPT4gZjEgKiBmMilcbiAgICAgICAgLnNldExhYmVsKCdtdWx0aXBsaWVkc1AnKS5ydW4ocG9zKSk7XG4gICAgY29uc3QgZGl2aWRlZHNQID0gcGFyc2VyKHBvcyA9PiBmYWN0b3JQXG4gICAgICAgIC5kaXNjYXJkU2Vjb25kKHRyaW1QKHBjaGFyKCcvJykpKVxuICAgICAgICAuYW5kVGhlbihvckVsc2UoZGl2aWRlZHNQLCBmYWN0b3JQKSlcbiAgICAgICAgLmZtYXAoKFtmMSwgZjJdKSA9PiBmMSAvIGYyKVxuICAgICAgICAuc2V0TGFiZWwoJ2RpdmlkZWRzUCcpLnJ1bihwb3MpKTtcbiAgICByZXR1cm4gb3JFbHNlKG11bHRpcGxpZWRzUCwgZGl2aWRlZHNQKS5ydW4ocG9zKTtcbn0pO1xuXG4vLyAjIFdlIG5lZWQgdG8gZm9yY2UgdGhlIGBzZXBhcmF0ZWRfYnlgIGNvbWJpbmF0b3IgdG8gbWF0Y2ggYXQgbGVhc3QgMSBzZXBhcmF0b3Jcbi8vICMgb3RoZXJ3aXNlIGl0IHdvdWxkIGJlIGhhcHB5IHRvIG1hdGNoIGEgc2luZ2xlIG51bWJlciBhcyBtdWx0aXBsaWNhdGlvbiBhbmQgc29cbi8vICMgdG8gbmV2ZXIgcGFyc2UgZGl2aXNpb25zXG4vL1xubG9nVG9TY3JlZW4oJzQyICogMicsIGV4cHJlc3Npb25QKTtcbmxvZ1RvU2NyZWVuKCc0MiAqIDIgKiAyJywgZXhwcmVzc2lvblApO1xubG9nVG9TY3JlZW4oJzQyICogMiAvIDInLCBleHByZXNzaW9uUCk7XG4vLyBwYXJzZShcIjQyICogMlwiLCBleHByZXNzaW9uKSB8PiBJTy5pbnNwZWN0XG4vLyAjID4+IHs6b2ssIFs0MiwgMl19XG4vLyBwYXJzZShcIjQyICogMiAqIDJcIiwgZXhwcmVzc2lvbikgfD4gSU8uaW5zcGVjdFxuLy8gIyA+PiB7Om9rLCBbNDIsIDIsIDJdfVxuLy8gcGFyc2UoXCI0MiAvIDJcIiwgZXhwcmVzc2lvbikgfD4gSU8uaW5zcGVjdFxuLy8gIyA+PiB7Om9rLCBbNDIsIDJdfVxuLy9cbi8vICMgV2UgaGF2ZSBhIHByb2JsZW1cbi8vXG4vLyBwYXJzZShcIjQyXCIsIGV4cHJlc3Npb24pIHw+IElPLmluc3BlY3Rcbi8vICMgPj4gezplcnJvciwgXCJleHBlY3RlZCBvbmUgb2YgW1xcXCIqXFxcIiwgXFxcIi9cXFwiXSBhdCAxOjMgYnV0IGdvdCB0aGUgZW5kIG9mIGlucHV0XCJ9XG4vL1xuLy8gIyBXZSBoYXZlIGxvc3QgdGhlIHBvd2VyIHRvIG1hdGNoIHNpbmdsZSBudW1iZXJzIGJlY2F1c2UgdGhlIG9ubHkgcGFyc2VyIHdlXG4vLyAjIGhhdmUgcmVxdWlyZXMgYXQgbGVhc3Qgb25lIG9wZXJhdG9yLCB3ZSBuZWVkIHRvIHByb3ZpZGUgYSBwYXJzZXIgZm9yIHBsYWluXG4vLyAjIG51bWJlcnNcbi8vXG4vLyBleHByZXNzaW9uID1cbi8vICAgcmVjdXJzaXZlKFxuLy8gICAgIGZuKGUpIC0+XG4vLyAgICAgICBtdWx0aXBsaWFibGVzID0gb25lX29mKFtudW1iZXIsIGUgfD4gc3Vycm91bmRlZF9ieShcIihcIiwgXCIpXCIpXSlcbi8vICAgICAgIG9uZV9vZihbXG4vLyAgICAgICAgIG11bHRpcGxpYWJsZXMgfD4gc2VwYXJhdGVkX2J5KFwiKlwiLCBhdF9sZWFzdDogMiksXG4vLyAgICAgICAgIG11bHRpcGxpYWJsZXMgfD4gc2VwYXJhdGVkX2J5KFwiL1wiLCBhdF9sZWFzdDogMiksXG4vLyAgICAgICAgIG11bHRpcGxpYWJsZXNcbi8vICAgICAgIF0pXG4vLyAgICAgZW5kKVxuLy9cbi8vIHBhcnNlKFwiNDIgKiAyXCIsIGV4cHJlc3Npb24pIHw+IElPLmluc3BlY3Rcbi8vICMgPj4gezpvaywgWzQyLCAyXX1cbi8vIHBhcnNlKFwiNDIgLyAyXCIsIGV4cHJlc3Npb24pIHw+IElPLmluc3BlY3Rcbi8vICMgPj4gezpvaywgWzQyLCAyXX1cbi8vIHBhcnNlKFwiNDJcIiwgZXhwcmVzc2lvbikgfD4gSU8uaW5zcGVjdFxuLy8gIyA+PiB7Om9rLCA0Mn1cbi8vXG4vLyAjIFVuZm9ydHVuYXRlbHkgd2UgaGF2ZSBhbm90aGVyIHByb2JsZW1cbi8vXG4vLyBwYXJzZShcIjQyICogMiAvIDJcIiwgZXhwcmVzc2lvbikgfD4gSU8uaW5zcGVjdFxuLy8gIyA+PiB7Om9rLCBbNDIsIDJdfVxuLy9cbi8vICMgVGhlIGxhc3QgZXhwcmVzc2lvbiBzaG91bGQgaGF2ZSBiZWVuIGB7Om9rLCBbNDIsIDIsIDJdfWAgd2h5IHdlIGRpZG4ndCBnZXQgYVxuLy8gIyBwYXJzZXIgZXJyb3I/IFBhcnNpbmcgYSBwYXJ0IG9mIHRoZSB3aG9sZSBpbnB1dCBpcyBwZXJmZWN0bHkgZmluZSwgaWYgeW91XG4vLyAjIHdhbnQgdG8gbWFrZSBzdXJlIHRoYXQgeW91ciBwYXJzZXIgbWF0Y2ggdGhlIHdob2xlIGlucHV0IHdlIG5lZWQgdG8gbWFrZSBzdXJlXG4vLyAjIHRoYXQgd2hhdCBmb2xsb3dzIGlzIHRoZSBlbmQgb2YgaW5wdXRcbi8vIGV4cHJlc3Npb24gPVxuLy8gICByZWN1cnNpdmUoXG4vLyAgICAgZm4oZSkgLT5cbi8vICAgICAgIG11bHRpcGxpYWJsZXMgPSBvbmVfb2YoW251bWJlciwgZSB8PiBzdXJyb3VuZGVkX2J5KFwiKFwiLCBcIilcIildKVxuLy8gICAgICAgb25lX29mKFtcbi8vICAgICAgICAgbXVsdGlwbGlhYmxlcyB8PiBzZXBhcmF0ZWRfYnkoXCIqXCIsIGF0X2xlYXN0OiAyKSxcbi8vICAgICAgICAgbXVsdGlwbGlhYmxlcyB8PiBzZXBhcmF0ZWRfYnkoXCIvXCIsIGF0X2xlYXN0OiAyKSxcbi8vICAgICAgICAgbXVsdGlwbGlhYmxlc1xuLy8gICAgICAgXSlcbi8vICAgICBlbmQpXG4vLyAgIHw+IGZvbGxvd2VkX2J5KGVvZilcbi8vXG4vLyBwYXJzZShcIjQyICogMiAvIDJcIiwgZXhwcmVzc2lvbikgfD4gSU8uaW5zcGVjdFxuLy8gIyA+PiB7OmVycm9yLCBcImV4cGVjdGVkIHRoZSBlbmQgb2YgaW5wdXQgYXQgMTo4XCJ9XG4vL1xuLy8gIyBOb3cgaXQncyBjbGVhciwgdGhlIGAvYCBpcyBub3QgcmVjb2duaXplZC4uLiB0aGUgcHJvYmxlbSBpcyB0aGF0IG9uY2UgdGhlXG4vLyAjIG11bHRpcGxpY2F0aW9uIGFsdGVybmF0aXZlIG1hdGNoZWQgdGhhbmtzIHRvIHRoZSBmaXJzdCBgKmAgd2hhdCBmb2xsb3dzIGNvdWxkXG4vLyAjIG9ubHkgYmU6IGEgY29udGludWF0aW9uIG9mIHRoZSBzYW1lIG11bHRpcGxpY2F0aW9uLCBhIG51bWJlciBvciBhbiBleHByZXNzaW9uXG4vLyAjIHN1cnJvdW5kZWQgYnkgcGFyZW50aGVzZXMsIGJ1dCBub3QgYSBkaXZpc2lvbi4gSW4gZmFjdCBwdXRpbmcgcGFyZW50aGVzZXNcbi8vICMgYXJvdW5kIHRoZSBkaXZpc2lvbiBzb2x2ZXMgdGhlIHByb2JsZW1cbi8vXG4vLyBwYXJzZShcIjQyICogKDIgKiAyKVwiLCBleHByZXNzaW9uKSB8PiBJTy5pbnNwZWN0XG4vLyAjID4+IHs6b2ssIFs0MiwgWzIsIDJdXX1cbi8vXG4vLyAjIEhvdyBkbyB3ZSBzb2x2ZSB0aGlzPyBNb3ZpbmcgdGhlIGBvbmVfb2ZgIGNvbWJpbmF0b3IgaW5zaWRlIHRoZVxuLy8gIyBgc2VwYXJhdGVkX2J5YCBjb21iaW5hdG9yIHdpbGwgc29sdmUgdGhpcyBhbmQgb3RoZXIgcHJvYmxlbXMgd2UgaGFkIGJlZm9yZVxuLy9cbi8vIGV4cHJlc3Npb24gPVxuLy8gICByZWN1cnNpdmUoXG4vLyAgICAgZm4oZSkgLT5cbi8vICAgICAgIG11bHRpcGxpYWJsZXMgPSBvbmVfb2YoW251bWJlciwgZSB8PiBzdXJyb3VuZGVkX2J5KFwiKFwiLCBcIilcIildKVxuLy8gICAgICAgbXVsdGlwbGlhYmxlcyB8PiBzZXBhcmF0ZWRfYnkob25lX29mKFtcIipcIiwgXCIvXCJdKSlcbi8vICAgICBlbmQpXG4vLyAgIHw+IGZvbGxvd2VkX2J5KGVvZilcbi8vXG4vLyBwYXJzZShcIjE2XCIsIGV4cHJlc3Npb24pIHw+IElPLmluc3BlY3Rcbi8vICMgPj4gezpvaywgWzE2XX1cbi8vIHBhcnNlKFwiMTYgKiAyXCIsIGV4cHJlc3Npb24pIHw+IElPLmluc3BlY3Rcbi8vICMgPj4gezpvaywgWzE2LCAyXX1cbi8vIHBhcnNlKFwiMTYgLyAyXCIsIGV4cHJlc3Npb24pIHw+IElPLmluc3BlY3Rcbi8vICMgPj4gezpvaywgWzE2LCAyXX1cbi8vIHBhcnNlKFwiMTYgKiAyIC8gMlwiLCBleHByZXNzaW9uKSB8PiBJTy5pbnNwZWN0XG4vLyAjID4+IHs6b2ssIFsxNiwgMiwgMl19XG4vL1xuLy8gIyBUaGUgb25seSBkb3duc2lkZSBpcyB0aGF0IHdlIG5lZWQgdG8ga2VlcCB0aGUgc2VwYXJhdG9yIGJlY2F1c2Ugbm93IHdlIGNhbid0XG4vLyAjIGRpc2Nlcm4gYmV0d2VlbiBtdWx0aXBsaWNhdGlvbiBhbmQgZGl2aXNpb24sIHRvIGRvIHRoaXMgd2Ugd2lsbCB1c2UgdGhlXG4vLyAjIGBrZWVwYCBjb21iaW5hdG9yIHRoYXQgY2FuY2VscyB0aGUgZWZmZWN0IG9mIHRoZSBgc2tpcGAgY29tYmluYXRvciB1c2VkXG4vLyAjIGluc2lkZSB0aGUgYHNlcGFyYXRlZF9ieWAgY29tYmluYXRvci5cbi8vXG4vLyBleHByZXNzaW9uID1cbi8vICAgcmVjdXJzaXZlKFxuLy8gICAgIGZuKGUpIC0+XG4vLyAgICAgICBtdWx0aXBsaWFibGVzID0gb25lX29mKFtudW1iZXIsIGUgfD4gc3Vycm91bmRlZF9ieShcIihcIiwgXCIpXCIpXSlcbi8vICAgICAgIG11bHRpcGxpYWJsZXMgfD4gc2VwYXJhdGVkX2J5KGtlZXAob25lX29mKFtcIipcIiwgXCIvXCJdKSkpXG4vLyAgICAgZW5kKVxuLy8gICB8PiBmb2xsb3dlZF9ieShlb2YpXG4vL1xuLy8gcGFyc2UoXCI0MiAqIDJcIiwgZXhwcmVzc2lvbikgfD4gSU8uaW5zcGVjdFxuLy8gIyA+PiB7Om9rLCBbNDIsIFwiKlwiLCAyXX1cbi8vIHBhcnNlKFwiNDIgLyAyXCIsIGV4cHJlc3Npb24pIHw+IElPLmluc3BlY3Rcbi8vICMgPj4gezpvaywgWzQyLCBcIi9cIiwgMl19XG4vL1xuLy8gIyBOb3cgd2UgY2FuIHN0YXJ0IHRvIHJlZHVjZSB0aGUgZXhwcmVzc2lvbiB3aXRoIHRoZSBoZWxwIG9mXG4vLyAjIGBQYWNvLlRyYW5zZm9ybS5zZXBhcmF0ZWRfYnlgIHRyYW5zZm9ybWVyIHdoaWNoIGlzIGdvaW5nIHRvIG1ha2Ugb3VyIGpvYlxuLy8gIyBlYXNpZXJcbi8vXG4vLyByZWR1Y2UgPSAmUGFjby5UcmFuc2Zvcm0uc2VwYXJhdGVkX2J5KFxuLy8gICAgICAgICAgICAmMSxcbi8vICAgICAgICAgICAgZm4oXCIqXCIsIG4sIG0pIC0+IG4gKiBtXG4vLyAgICAgICAgICAgICAgKFwiL1wiLCBuLCBtKSAtPiBuIC8gbSB8PiByb3VuZFxuLy8gICAgICAgICAgICBlbmQpXG4vL1xuLy8gZXhwcmVzc2lvbiA9XG4vLyAgIHJlY3Vyc2l2ZShcbi8vICAgICBmbihlKSAtPlxuLy8gICAgICAgbXVsdGlwbGlhYmxlcyA9IG9uZV9vZihbbnVtYmVyLCBlIHw+IHN1cnJvdW5kZWRfYnkoXCIoXCIsIFwiKVwiKV0pXG4vLyAgICAgICBtdWx0aXBsaWFibGVzIHw+IHNlcGFyYXRlZF9ieShrZWVwKG9uZV9vZihbXCIqXCIsIFwiL1wiXSkpKSB8PiBiaW5kKHJlZHVjZSlcbi8vICAgICBlbmQpXG4vLyAgIHw+IGZvbGxvd2VkX2J5KGVvZilcbi8vXG4vLyBwYXJzZShcIjQyICogMlwiLCBleHByZXNzaW9uKSB8PiBJTy5pbnNwZWN0XG4vLyAjID4+IHs6b2ssIDg0fVxuLy8gcGFyc2UoXCI0MiAvIDJcIiwgZXhwcmVzc2lvbikgfD4gSU8uaW5zcGVjdFxuLy8gIyA+PiB7Om9rLCAyMX1cbi8vXG4vLyAjIE5pY2UsIHRpbWUgdG8gaW50cm9kdWNlIHRoZSBsYXN0IHR3byBvcGVyYXRvcnMgZm9sbG93aW5nIHRoZSBzYW1lIHBhdHRlcm5cbi8vXG4vLyByZWR1Y2UgPSAmUGFjby5UcmFuc2Zvcm0uc2VwYXJhdGVkX2J5KFxuLy8gICAgICAgICAgICAmMSxcbi8vICAgICAgICAgICAgZm4oXCIqXCIsIG4sIG0pIC0+IG4gKiBtXG4vLyAgICAgICAgICAgICAgKFwiL1wiLCBuLCBtKSAtPiBuIC8gbSB8PiByb3VuZFxuLy8gICAgICAgICAgICAgIChcIitcIiwgbiwgbSkgLT4gbiArIG1cbi8vICAgICAgICAgICAgICAoXCItXCIsIG4sIG0pIC0+IG4gLSBtXG4vLyAgICAgICAgICAgIGVuZClcbi8vXG4vLyBleHByZXNzaW9uID1cbi8vICAgcmVjdXJzaXZlKFxuLy8gICAgIGZuKGUpIC0+XG4vLyAgICAgICBtdWx0aXBsaWFibGVzID0gb25lX29mKFtudW1iZXIsIGUgfD4gc3Vycm91bmRlZF9ieShcIihcIiwgXCIpXCIpXSlcbi8vICAgICAgIGFkZGl0aW9uYWJsZXMgPSBtdWx0aXBsaWFibGVzXG4vLyAgICAgICAgICAgICAgICAgICAgICAgfD4gc2VwYXJhdGVkX2J5KGtlZXAob25lX29mKFtcIipcIiwgXCIvXCJdKSkpXG4vLyAgICAgICAgICAgICAgICAgICAgICAgfD4gYmluZChyZWR1Y2UpXG4vLyAgICAgICBhZGRpdGlvbmFibGVzXG4vLyAgICAgICB8PiBzZXBhcmF0ZWRfYnkoa2VlcChvbmVfb2YoW1wiK1wiLCBcIi1cIl0pKSlcbi8vICAgICAgIHw+IGJpbmQocmVkdWNlKVxuLy8gICAgIGVuZClcbi8vICAgfD4gZm9sbG93ZWRfYnkoZW9mKVxuLy9cbi8vXG4vLyBwYXJzZShcIjQyICsgMlwiLCBleHByZXNzaW9uKSB8PiBJTy5pbnNwZWN0XG4vLyAjID4+IHs6b2ssIDQ0fVxuLy8gcGFyc2UoXCI0MiAtIDJcIiwgZXhwcmVzc2lvbikgfD4gSU8uaW5zcGVjdFxuLy8gIyA+PiB7Om9rLCA0MH1cbi8vXG4vLyAjIFdoYXQgYWJvdXQgdGhlIG9wZXJhdG9ycyBwcmVjZWRlbmNlP1xuLy8gcGFyc2UoXCI0MiAtIDIgKiA1XCIsIGV4cHJlc3Npb24pIHw+IElPLmluc3BlY3Rcbi8vICMgPj4gezpvaywgMzJ9XG4vLyBwYXJzZShcIig0MiAtIDIpICogNVwiLCBleHByZXNzaW9uKSB8PiBJTy5pbnNwZWN0XG4vLyAjID4+IHs6b2ssIDIwMH1cbi8vXG4vLyAjIEl0IHdvcmtzISBMZXQncyBjaGVjayBpZiBhbGwgaXQncyBva1xuLy9cbi8vIHBhcnNlKFwiNDJcIiwgZXhwcmVzc2lvbikgfD4gSU8uaW5zcGVjdFxuLy8gIyA+PiB7Om9rLCA0Mn1cbi8vIHBhcnNlKFwiKDQyKVwiLCBleHByZXNzaW9uKSB8PiBJTy5pbnNwZWN0XG4vLyAjID4+IHs6b2ssIDQyfVxuLy8gcGFyc2UoXCI0MiArIDJcIiwgZXhwcmVzc2lvbikgfD4gSU8uaW5zcGVjdFxuLy8gIyA+PiB7Om9rLCA0NH1cbi8vIHBhcnNlKFwiNDIgKyAyIC0gMlwiLCBleHByZXNzaW9uKSB8PiBJTy5pbnNwZWN0XG4vLyAjID4+IHs6b2ssIDQyfVxuLy8gcGFyc2UoXCIoNDIpICsgKDIpXCIsIGV4cHJlc3Npb24pIHw+IElPLmluc3BlY3Rcbi8vICMgPj4gezpvaywgNDR9XG4vLyBwYXJzZShcIjQyICogMiArIDFcIiwgZXhwcmVzc2lvbikgfD4gSU8uaW5zcGVjdFxuLy8gIyA+PiB7Om9rLCA4NX1cbi8vIHBhcnNlKFwiNDIgKiAoMiArIDEpXCIsIGV4cHJlc3Npb24pIHw+IElPLmluc3BlY3Rcbi8vICMgPj4gezpvaywgMTI2fVxuLy8gcGFyc2UoXCIoNDIgKyAyKSAvICgzIC0gMSlcIiwgZXhwcmVzc2lvbikgfD4gSU8uaW5zcGVjdFxuLy8gIyA+PiB7Om9rLCAyMn1cbi8vIHBhcnNlKFwiKCg0MiArIDIpIC8gKDMgLSAxKSlcIiwgZXhwcmVzc2lvbikgfD4gSU8uaW5zcGVjdFxuLy8gIyA+PiB7Om9rLCAyMn1cbi8vIHBhcnNlKFwiNDIgKyAyICogMyArIDEwMFwiLCBleHByZXNzaW9uKSB8PiBJTy5pbnNwZWN0XG4vLyAjID4+IHs6b2ssIDE0OH1cbi8vIHBhcnNlKFwiKCg0MisyKS8oMy0xKSlcIiwgZXhwcmVzc2lvbikgfD4gSU8uaW5zcGVjdFxuLy8gIyA+PiB7Om9rLCAyMn1cbi8vIHBhcnNlKFwiOSAtIDEyIC0gNlwiLCBleHByZXNzaW9uKSB8PiBJTy5pbnNwZWN0XG4vLyAjID4+IHs6b2ssIC05fVxuLy8gcGFyc2UoXCI5IC0gKDEyIC0gNilcIiwgZXhwcmVzc2lvbikgfD4gSU8uaW5zcGVjdFxuLy8gIyA+PiB7Om9rLCAzfVxuLy8gcGFyc2UoXCIoMSsxKjIpKygzKjQqNSkvMjBcIiwgZXhwcmVzc2lvbikgfD4gSU8uaW5zcGVjdFxuLy8gIyA+PiB7Om9rLCA2fVxuLy8gcGFyc2UoXCIoKDErMSoyKSsoMyo0KjUpKS8zXCIsIGV4cHJlc3Npb24pIHw+IElPLmluc3BlY3Rcbi8vICMgPj4gezpvaywgMjF9XG4vL1xuLy8gIyBBZnRlciBhIGxpdHRsZSBzaW1wbGlmaWNhdGlvbiBoZXJlJ3MgdGhlIGZpbmFsIHJlc3VsdFxuLy8gcmVkdWNlID0gJlBhY28uVHJhbnNmb3JtLnNlcGFyYXRlZF9ieShcbi8vICAgICAgICAgICAgJjEsXG4vLyAgICAgICAgICAgIGZuKFwiKlwiLCBuLCBtKSAtPiBuICogbVxuLy8gICAgICAgICAgICAgIChcIi9cIiwgbiwgbSkgLT4gbiAvIG0gfD4gcm91bmRcbi8vICAgICAgICAgICAgICAoXCIrXCIsIG4sIG0pIC0+IG4gKyBtXG4vLyAgICAgICAgICAgICAgKFwiLVwiLCBuLCBtKSAtPiBuIC0gbVxuLy8gICAgICAgICAgICBlbmQpXG4vL1xuLy8gZXhwcmVzc2lvbiA9XG4vLyAgIHJlY3Vyc2l2ZShcbi8vICAgICBmbihlKSAtPlxuLy8gICAgICAgb25lX29mKFtudW1iZXIsIGUgfD4gc3Vycm91bmRlZF9ieShcIihcIiwgXCIpXCIpXSlcbi8vICAgICAgIHw+IHNlcGFyYXRlZF9ieShrZWVwKG9uZV9vZihbXCIqXCIsIFwiL1wiXSkpKVxuLy8gICAgICAgfD4gYmluZChyZWR1Y2UpXG4vLyAgICAgICB8PiBzZXBhcmF0ZWRfYnkoa2VlcChvbmVfb2YoW1wiK1wiLCBcIi1cIl0pKSlcbi8vICAgICAgIHw+IGJpbmQocmVkdWNlKVxuLy8gICAgIGVuZClcbi8vICAgfD4gZm9sbG93ZWRfYnkoZW9mKVxuLy9cbi8vICMgVGhhdCdzIHByZXR0eSBuZWF0IGJ1dCB3ZSBjYW4gZG8gZXZlbiBiZXR0ZXIsIHdlIHdpbGwgc2VlIGhvdy4uLlxuXG5mdW5jdGlvbiBsb2dUb1NjcmVlbihzdHIsIHBhcnNlcikge1xuICAgIGNvbnN0IHJlc3VsdCA9IHBhcnNlci5ydW4oUG9zaXRpb24uZnJvbVRleHQoc3RyKSk7XG4gICAgY29uc3Qgb3V0Y29tZSA9IChyZXN1bHQuaXNTdWNjZXNzKSA/IHJlc3VsdC52YWx1ZVswXS50b1N0cmluZygpIDogJ0ZhaWx1cmU6ICcgKyByZXN1bHQudmFsdWVbMF0udG9TdHJpbmcoKTtcbiAgICBjb25zb2xlLmxvZygnXCInICsgc3RyICsgJ1wiIC0tPiAnICsgb3V0Y29tZSk7XG59XG4iXX0=