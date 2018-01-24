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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2V4YW1wbGVzLzA1X3JlY3Vyc2l2ZV9ncmFtbWFyLmpzIl0sIm5hbWVzIjpbIm51bWJlclAxIiwiZm1hcCIsInBhcnNlRmxvYXQiLCJzZXRMYWJlbCIsImNvbnNvbGUiLCJsb2ciLCJsb2dUb1NjcmVlbiIsIm51bWJlclAyIiwicmVjdXJzaXZlIiwiZiIsImV4cHJlc3Npb25QMSIsInJ1biIsInBvcyIsImV4cHJlc3Npb25QIiwiZmFjdG9yUCIsIm11bHRpcGxpZWRzUCIsImFuZFRoZW4iLCJmMSIsIm9wIiwiZjIiLCJNYXRoIiwicm91bmQiLCJzdW1tZWRzUCIsInN0ciIsInBhcnNlciIsInJlc3VsdCIsImZyb21UZXh0Iiwib3V0Y29tZSIsImlzU3VjY2VzcyIsInZhbHVlIiwidG9TdHJpbmciXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBbURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsUUFBTUEsV0FBVywwQ0FBbUJDLElBQW5CLENBQXdCQyxVQUF4QixFQUFvQ0MsUUFBcEMsQ0FBNkMscUNBQTdDLENBQWpCOztBQUVBQyxZQUFRQyxHQUFSLENBQVksMkJBQVo7QUFDQUMsZ0JBQVksSUFBWixFQUFrQk4sUUFBbEI7QUFDQTtBQUNBO0FBQ0FNLGdCQUFZLGVBQVosRUFBNkJOLFFBQTdCOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxRQUFNTyxXQUFXLHNCQUFRLGtCQUFJLG1DQUFKLENBQVIsRUFBMkJQLFFBQTNCLEVBQXFDLGtCQUFJLG1DQUFKLENBQXJDLENBQWpCOztBQUVBTSxnQkFBWSxTQUFaLEVBQXVCQyxRQUF2QjtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7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QU1DLFNBQVNELE9BQU9iLEdBQVAsQ0FBVyxrQkFBU2UsUUFBVCxDQUFrQkgsR0FBbEIsQ0FBWCxDQUFmO0FBQ0EsWUFBTUksVUFBV0YsT0FBT0csU0FBUixHQUFxQkgsT0FBT0ksS0FBUCxDQUFhLENBQWIsRUFBZ0JDLFFBQWhCLEVBQXJCLEdBQWtELGNBQWNMLE9BQU9JLEtBQVAsQ0FBYSxDQUFiLEVBQWdCQyxRQUFoQixFQUFkLEdBQTJDTCxPQUFPSSxLQUFQLENBQWEsQ0FBYixFQUFnQkMsUUFBaEIsRUFBN0c7QUFDQTFCLGdCQUFRQyxHQUFSLENBQVksTUFBTWtCLEdBQU4sR0FBWSxRQUFaLEdBQXVCSSxPQUFuQztBQUNIIiwiZmlsZSI6IjA1X3JlY3Vyc2l2ZV9ncmFtbWFyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8gY2ZyLiBodHRwczovL2dpdGh1Yi5jb20vZ2FicmllbGVsYW5hL3BhY28vYmxvYi9tYXN0ZXIvZXhhbXBsZXMvMDVfcmVjdXJzaXZlX2dyYW1tYXIuZXhzXG5cbmltcG9ydCB7XG4gICAgSlZhbHVlLFxuICAgIFR1cGxlLFxuICAgIFBvc2l0aW9uLFxufSBmcm9tICdjbGFzc2VzJztcbmltcG9ydCB7XG4gICAgVmFsaWRhdGlvbixcbn0gZnJvbSAndmFsaWRhdGlvbic7XG5pbXBvcnQge1xuICAgIHBhcnNlcixcbiAgICBjaGFyUGFyc2VyLFxuICAgIGRpZ2l0UGFyc2VyLFxuICAgIHByZWRpY2F0ZUJhc2VkUGFyc2VyLFxuICAgIHBjaGFyLFxuICAgIHBkaWdpdCxcbiAgICBhbmRUaGVuLFxuICAgIG9yRWxzZSxcbiAgICBjaG9pY2UsXG4gICAgYW55T2YsXG4gICAgZm1hcCxcbiAgICByZXR1cm5QLFxuICAgIGFwcGx5UCxcbiAgICBsaWZ0MixcbiAgICBzZXF1ZW5jZVAsXG4gICAgc2VxdWVuY2VQMixcbiAgICBwc3RyaW5nLFxuICAgIHplcm9Pck1vcmUsXG4gICAgbWFueSxcbiAgICBtYW55MSxcbiAgICBtYW55Q2hhcnMsXG4gICAgbWFueUNoYXJzMSxcbiAgICBvcHQsXG4gICAgb3B0Qm9vayxcbiAgICBkaXNjYXJkRmlyc3QsXG4gICAgZGlzY2FyZFNlY29uZCxcbiAgICBiZXR3ZWVuLFxuICAgIGJldHdlZW5QYXJlbnMsXG4gICAgc2VwQnkxLFxuICAgIGxvd2VyY2FzZVAsXG4gICAgdXBwZXJjYXNlUCxcbiAgICBsZXR0ZXJQLFxuICAgIGRpZ2l0UCxcbiAgICB3aGl0ZVAsXG4gICAgdGFwUCxcbiAgICBsb2dQLFxuICAgIHB3b3JkLFxuICAgIHRyaW1QLFxufSBmcm9tICdwYXJzZXJzJztcblxuLy8gIyBTaW1wbGUgYWxnZWJyYWljIGV4cHJlc3Npb24gcGFyc2VyIHRoYXQgcGVyZm9ybXMgdGhlIGZvdXIgYmFzaWMgYXJpdGhtZXRpY1xuLy8gIyBvcGVyYXRpb25zOiBgK2AsIGAtYCwgYCpgIGFuZCBgL2AuIFRoZSBgKmAgYW5kIGAvYCBoYXZlIHByZWNlZGVuY2Ugb3ZlciBgK2Bcbi8vICMgYW5kIGAtYFxuLy9cbi8vICMgV2Ugd2lsbCBpbXBsZW1lbnQgdGhpcyBpbiB0aGUgbW9zdCBzdHJhaWdodGZvcndhcmQgd2F5LCB3ZSB3aWxsIGxlYXJuIHRoYXRcbi8vICMgUGFjbyBvZmZlcnMgYmV0dGVyIHdheXMgdG8gZG8gdGhlIHNhbWUgdGhpbmdcbi8vXG4vLyAjIEZpcnN0IG9mIGFsbCB3ZSBuZWVkIG51bWJlcnMsIG51bWJlcnMgcmVwcmVzZW50YXRpb24gY291bGQgYmUgbXVjaCBtb3JlXG4vLyAjIGNvbXBsZXggdGhhbiB0aGF0IGJ1dCBmb3Igbm93IHdlIGRvbid0IGNhcmUgYW5kIHdlIHdpbGwga2VlcCBpdCBzaW1wbGVcbi8vIG51bWJlciA9IHdoaWxlKFwiMDEyMzQ1Njc4OVwiLCBhdF9sZWFzdDogMSlcbi8vXG4vLyBwYXJzZShcIjFcIiwgbnVtYmVyKSB8PiBJTy5pbnNwZWN0XG4vLyAjID4+IHs6b2ssIFwiMVwifVxuLy8gcGFyc2UoXCI0MlwiLCBudW1iZXIpIHw+IElPLmluc3BlY3Rcbi8vICMgPj4gezpvaywgXCI0MlwifVxuLy8gcGFyc2UoXCIxMDI0XCIsIG51bWJlcikgfD4gSU8uaW5zcGVjdFxuLy8gIyA+PiB7Om9rLCBcIjEwMjRcIn1cbi8vXG4vLyAjIE9rLCBidXQgd2UgbmVlZCBudW1iZXJzIG5vdCBzdHJpbmdzLCB3ZSBuZWVkIHRvIGJlIGFibGUgdG8gdGFrZSB0aGUgcmVzdWx0IG9mXG4vLyAjIHRoZSBgbnVtYmVyYCBwYXJzZXIgYW5kIGNvbnZlcnQgaXQgdG8gYW4gaW50ZWdlci4gTHVja2lseSB3ZSBoYXZlIHRoZSBgYmluZGBcbi8vICMgY29tYmluYXRvclxuLy8gbnVtYmVyID0gd2hpbGUoXCIwMTIzNDU2Nzg5XCIsIGF0X2xlYXN0OiAxKVxuLy8gICAgICAgICAgfD4gYmluZCgmU3RyaW5nLnRvX2ludGVnZXIvMSlcblxuY29uc3QgbnVtYmVyUDEgPSBtYW55Q2hhcnMxKGRpZ2l0UCkuZm1hcChwYXJzZUZsb2F0KS5zZXRMYWJlbCgnbWFueUNoYXJzMShkaWdpdFApLmZtYXAocGFyc2VGbG9hdCknKTtcblxuY29uc29sZS5sb2coJ1xcbjA1X3JlY3Vyc2l2ZV9ncmFtbWFyLmpzJyk7XG5sb2dUb1NjcmVlbignNDInLCBudW1iZXJQMSk7XG4vLyBwYXJzZShcIjQyXCIsIG51bWJlcikgfD4gSU8uaW5zcGVjdFxuLy8gIyA+PiB7Om9rLCA0Mn1cbmxvZ1RvU2NyZWVuKCcxODM0Nzk4NTQyMjM0JywgbnVtYmVyUDEpO1xuXG4vLyAjIFdlIGFsc28gbmVlZCB0byBpZ25vcmUgd2hpdGVzcGFjZXMgYXJvdW5kIGEgbnVtYmVyLCB0byBkbyB0aGF0IHdlIHdpbGwgdXNlXG4vLyAjIHRoZSBgc3Vycm91bmRlZF9ieWAgY29tYmluYXRvciwgc2luY2UgdGhlIHdoaXRlc3BhY2VzIGFyZSBvcHRpb25hbHMgd2UgYWxzb1xuLy8gIyB1c2UgdGhlIGBtYXliZWAgY29tYmluYXRvclxuLy8gbnVtYmVyID0gd2hpbGUoXCIwMTIzNDU2Nzg5XCIsIGF0X2xlYXN0OiAxKVxuLy8gICAgICAgICAgfD4gc3Vycm91bmRlZF9ieShibHM/KVxuLy8gICAgICAgICAgfD4gYmluZCgmU3RyaW5nLnRvX2ludGVnZXIvMSlcblxuY29uc3QgbnVtYmVyUDIgPSBiZXR3ZWVuKG9wdChtYW55KHdoaXRlUCkpLCBudW1iZXJQMSwgb3B0KG1hbnkod2hpdGVQKSkpO1xuXG5sb2dUb1NjcmVlbignICAgNDIgICcsIG51bWJlclAyKTtcbi8vIHBhcnNlKFwiIDQyIFwiLCBudW1iZXIpIHw+IElPLmluc3BlY3Rcbi8vICMgPj4gezpvaywgNDJ9XG5cbi8vICMgQW4gZXhwcmVzc2lvbiBpcyBhIG51bWJlciwgYW4gb3BlcmF0aW9uIGJldHdlZW4gZXhwcmVzc2lvbnMgYW5kIGFuIGV4cHJlc3Npb25cbi8vICMgYmV0d2VlbiBwYXJlbnRoZXNlcy4gQW4gZXhwcmVzc2lvbiBpcyBkZWZpbmVkIGluIHRlcm1zIG9mIGl0c2VsZiBzbyBpdCdzIGFcbi8vICMgcmVjdXJzaXZlIGRlZmluaXRpb24uIEZvciBhIHJlY3Vyc2l2ZSBkZWZpbml0aW9uIHdlIG5lZWQgYSByZWN1cnNpdmUgcGFyc2VyXG4vL1xuLy8gIyBXZSBuZWVkIHRvIGJlIGFibGUgdG8gdGFsayBhYm91dCBhIHBhcnNlciBiZWZvcmUgaGF2aW5nIGNvbXBsZXRlZCBpdHNcbi8vICMgZGVmaW5pdGlvbiwgZm9yIHRoaXMgd2UgdXNlIHRoZSBgcmVjdXJzaXZlYCBjb21iaW5hdG9yXG4vL1xuLy9cbi8vICAgZGVmIGJveCglUGFyc2Vye30gPSBwKSwgZG86IHBcbi8vICAgZGVmIGJveCglUmVnZXh7fSA9IHIpLCBkbzogcmUocilcbi8vICAgZGVmIGJveChzKSB3aGVuIGlzX2JpbmFyeShzKSwgZG86IGxpdChzKVxuLy8gICBkZWYgYm94KG5pbCksIGRvOiBhbHdheXMobmlsKVxuLy8gICBkZWYgYm94KHQpLCBkbzogUGFjby5QYXJzYWJsZS50b19wYXJzZXIodClcbi8vXG4vLyBwYXJzZXIgcmVjdXJzaXZlKGYpIGRvXG4vLyAgIGZuIHN0YXRlLCB0aGlzIC0+XG4vLyAgICAgYm94KGYuKHRoaXMpKS5wYXJzZS4oc3RhdGUsIHRoaXMpXG4vLyAgIGVuZFxuLy8gZW5kXG5cbmZ1bmN0aW9uIHJlY3Vyc2l2ZShmKSB7XG4gICAgLy9yZXR1cm4gKHN0YXRlLCB0aGlzKSA9PiBib3goZih0aGlzKSkucnVuKHN0YXRlLCB0aGlzKVxufVxuLy8gZXhwcmVzc2lvbiA9XG4vLyAgIHJlY3Vyc2l2ZShcbi8vICAgICBmbihlKSAtPlxuLy8gICAgICAgb25lX29mKFtudW1iZXIsIGUgfD4gc3Vycm91bmRlZF9ieShsZXgoXCIoXCIpLCBsZXgoXCIpXCIpKV0pXG4vLyAgICAgZW5kKVxuLy9cbi8vICMgVGhlIGByZWN1cnNpdmVgIGNvbWJpbmF0b3IgdGFrZXMgYSBmdW5jdGlvbiB0aGF0IGlzIGNhbGxlZCB3aXRoIHRoZVxuLy8gIyBwYXJzZXIgaXRzZWxmIGFzIHRoZSBmaXJzdCBwYXJhbWV0ZXIuIEhlcmUgYGV4cHJlc3Npb25gIGFuZCBgZWAgYXJlIHRoZSBzYW1lXG4vLyAjIHBhcnNlclxuXG4vL2NvbnN0IGV4cHJlc3Npb25QID0gcmVjdXJzaXZlKGUgPT4gb3JFbHNlKG51bWJlclAyLCBiZXR3ZWVuUGFyZW5zKGUpKSk7XG5cbmNvbnN0IGV4cHJlc3Npb25QMSA9IHBhcnNlcihwb3MgPT4gb3JFbHNlKG51bWJlclAyLCBiZXR3ZWVuUGFyZW5zKGV4cHJlc3Npb25QMSkpLnJ1bihwb3MpKTtcblxubG9nVG9TY3JlZW4oJzQyJywgZXhwcmVzc2lvblAxKTtcbi8vIHBhcnNlKFwiNDJcIiwgZXhwcmVzc2lvbikgfD4gSU8uaW5zcGVjdFxuLy8gIyA+PiB7Om9rLCA0Mn1cblxubG9nVG9TY3JlZW4oJyg0MiknLCBleHByZXNzaW9uUDEpO1xuLy8gcGFyc2UoXCIoNDIpXCIsIGV4cHJlc3Npb24pIHw+IElPLmluc3BlY3Rcbi8vICMgPj4gezpvaywgNDJ9XG4vL1xuLy8gIyBOb3RlIHRoYXQgc3Vycm91bmRlZF9ieSB0YWtlcyB0d28gbGV4ZW1lcyB0aGF0IGFyZSBnb2luZyB0byBjb25zdW1lIHVzZWxlc3Ncbi8vICMgd2hpdGVzcGFjZXMuIEluIGZhY3QsIGJ5IGRlZmF1bHQgc3RyaW5ncyBpbiBzdXJyb3VuZGVkX2J5IGFyZSBjb252ZXJ0ZWQgaW5cbi8vICMgbGV4ZW1lcyBzbyB3ZSBjYW4gbGVhdmUgb3V0IHRoZSBgbGV4YCBjb21iaW5hdG9yXG4vLyBleHByZXNzaW9uID1cbi8vICAgcmVjdXJzaXZlKFxuLy8gICAgIGZuKGUpIC0+XG4vLyAgICAgICBvbmVfb2YoW251bWJlciwgZSB8PiBzdXJyb3VuZGVkX2J5KFwiKFwiLCBcIilcIildKVxuLy8gICAgIGVuZClcbi8vXG5cbmxvZ1RvU2NyZWVuKCcoICA0MiAgKScsIGV4cHJlc3Npb25QMSk7XG4vLyBwYXJzZShcIiggNDIgKVwiLCBleHByZXNzaW9uKSB8PiBJTy5pbnNwZWN0XG4vLyAjID4+IHs6b2ssIDQyfVxuLy9cbi8vICMgTm93IHdlIGFyZSBnb2luZyB0byBhZGQgdGhlIGAqYCBhbmQgYC9gIG9wZXJhdG9yLCB3aGF0IGlzIGdvaW5nIHRvIGJlXG4vLyAjIG11bHRpcGxpZWQgb3IgZGl2aWRlZD8gQSBudW1iZXIgb3IgYW4gZXhwcmVzc2lvbiBzdXJyb3VuZGVkIGJ5IHBhcmVudGhlc2VzLlxuLy8gIyBGb3Igbm93IGxldCdzIGZvY3VzIG9uIHJlY29nbml6aW5nIHRoZSBzdHJ1Y3R1cmVcbi8vIGV4cHJlc3Npb24gPVxuLy8gICByZWN1cnNpdmUoXG4vLyAgICAgZm4oZSkgLT5cbi8vICAgICAgIG11bHRpcGxpYWJsZXMgPSBvbmVfb2YoW251bWJlciwgZSB8PiBzdXJyb3VuZGVkX2J5KFwiKFwiLCBcIilcIildKVxuLy8gICAgICAgb25lX29mKFtcbi8vICAgICAgICAgbXVsdGlwbGlhYmxlcyB8PiBzZXBhcmF0ZWRfYnkoXCIqXCIsIGF0X2xlYXN0OiAyKSxcbi8vICAgICAgICAgbXVsdGlwbGlhYmxlcyB8PiBzZXBhcmF0ZWRfYnkoXCIvXCIsIGF0X2xlYXN0OiAyKVxuLy8gICAgICAgXSlcbi8vICAgICBlbmQpXG4vL1xuXG5jb25zdCBleHByZXNzaW9uUCA9IHBhcnNlcihwb3MgPT4ge1xuICAgIGNvbnN0IGZhY3RvclAgPSBvckVsc2UobnVtYmVyUDIsIGJldHdlZW5QYXJlbnMoZXhwcmVzc2lvblApKTtcbiAgICBjb25zdCBtdWx0aXBsaWVkc1AgPSBwYXJzZXIocG9zID0+IGZhY3RvclBcbiAgICAgICAgLmFuZFRoZW4odHJpbVAob3JFbHNlKHBjaGFyKCcqJyksIHBjaGFyKCcvJykpKSlcbiAgICAgICAgLmFuZFRoZW4oY2hvaWNlKFttdWx0aXBsaWVkc1AsIGZhY3RvclBdKSlcbiAgICAgICAgLmZtYXAoKFtbZjEsIG9wXSwgZjJdKSA9PiAob3AgPT09ICcqJykgPyBmMSAqIGYyIDogTWF0aC5yb3VuZChmMSAvIGYyKSlcbiAgICAgICAgLnJ1bihwb3MpLCAnbXVsdGlwbGllZHNQJyk7XG4gICAgY29uc3Qgc3VtbWVkc1AgPSBwYXJzZXIocG9zID0+IGZhY3RvclBcbiAgICAgICAgLmFuZFRoZW4odHJpbVAob3JFbHNlKHBjaGFyKCcrJyksIHBjaGFyKCctJykpKSlcbiAgICAgICAgLmFuZFRoZW4oY2hvaWNlKFtzdW1tZWRzUCwgZmFjdG9yUF0pKVxuICAgICAgICAuZm1hcCgoW1tmMSwgb3BdLCBmMl0pID0+IChvcCA9PT0gJysnKSA/IGYxICsgZjIgOiBmMSAtIGYyKVxuICAgICAgICAucnVuKHBvcyksICdzdW1tZWRzUCcpO1xuICAgIHJldHVybiBjaG9pY2UoW211bHRpcGxpZWRzUCwgc3VtbWVkc1AsIGZhY3RvclBdKS5ydW4ocG9zKTtcbn0pO1xuXG4vLyAjIFdlIG5lZWQgdG8gZm9yY2UgdGhlIGBzZXBhcmF0ZWRfYnlgIGNvbWJpbmF0b3IgdG8gbWF0Y2ggYXQgbGVhc3QgMSBzZXBhcmF0b3Jcbi8vICMgb3RoZXJ3aXNlIGl0IHdvdWxkIGJlIGhhcHB5IHRvIG1hdGNoIGEgc2luZ2xlIG51bWJlciBhcyBtdWx0aXBsaWNhdGlvbiBhbmQgc29cbi8vICMgdG8gbmV2ZXIgcGFyc2UgZGl2aXNpb25zXG4vL1xubG9nVG9TY3JlZW4oJzQyICogMicsIGV4cHJlc3Npb25QKTtcbmxvZ1RvU2NyZWVuKCc0MiArIDInLCBleHByZXNzaW9uUCk7XG4vLyBwYXJzZShcIjQyICogMlwiLCBleHByZXNzaW9uKSB8PiBJTy5pbnNwZWN0XG4vLyAjID4+IHs6b2ssIFs0MiwgMl19XG5sb2dUb1NjcmVlbignNDIgKiAyICogMicsIGV4cHJlc3Npb25QKTtcbmxvZ1RvU2NyZWVuKCc0MiAtIDIgLSAyJywgZXhwcmVzc2lvblApO1xuLy8gcGFyc2UoXCI0MiAqIDIgKiAyXCIsIGV4cHJlc3Npb24pIHw+IElPLmluc3BlY3Rcbi8vICMgPj4gezpvaywgWzQyLCAyLCAyXX1cbmxvZ1RvU2NyZWVuKCc0MiAvIDInLCBleHByZXNzaW9uUCk7XG5sb2dUb1NjcmVlbignNDIgLSAyJywgZXhwcmVzc2lvblApO1xuLy8gcGFyc2UoXCI0MiAvIDJcIiwgZXhwcmVzc2lvbikgfD4gSU8uaW5zcGVjdFxuLy8gIyA+PiB7Om9rLCBbNDIsIDJdfVxubG9nVG9TY3JlZW4oJzQyJywgZXhwcmVzc2lvblApO1xuLy8gcGFyc2UoXCI0MlwiLCBleHByZXNzaW9uKSB8PiBJTy5pbnNwZWN0XG4vLyAjID4+IHs6b2ssIDQyfVxubG9nVG9TY3JlZW4oJzE2JywgZXhwcmVzc2lvblApO1xuLy8gcGFyc2UoXCIxNlwiLCBleHByZXNzaW9uKSB8PiBJTy5pbnNwZWN0XG4vLyAjID4+IHs6b2ssIFsxNl19XG5sb2dUb1NjcmVlbignMTYqMicsIGV4cHJlc3Npb25QKTtcbmxvZ1RvU2NyZWVuKCcxNisyJywgZXhwcmVzc2lvblApO1xuLy8gcGFyc2UoXCIxNiAqIDJcIiwgZXhwcmVzc2lvbikgfD4gSU8uaW5zcGVjdFxuLy8gIyA+PiB7Om9rLCBbMTYsIDJdfVxubG9nVG9TY3JlZW4oJzE2LzInLCBleHByZXNzaW9uUCk7XG5sb2dUb1NjcmVlbignMTYtMicsIGV4cHJlc3Npb25QKTtcbi8vIHBhcnNlKFwiMTYgLyAyXCIsIGV4cHJlc3Npb24pIHw+IElPLmluc3BlY3Rcbi8vICMgPj4gezpvaywgWzE2LCAyXX1cbmxvZ1RvU2NyZWVuKCcoNDIgKiAyKSAvIDInLCBleHByZXNzaW9uUCk7XG5sb2dUb1NjcmVlbignNDIgLyAyICogMicsIGV4cHJlc3Npb25QKTtcbmxvZ1RvU2NyZWVuKCcoODQgLyAyKSAvIDInLCBleHByZXNzaW9uUCk7XG5sb2dUb1NjcmVlbignKDg0IC8gMikgLSAoMiArIDIpJywgZXhwcmVzc2lvblApO1xuXG4vLyAjIE5vdyB3ZSBjYW4gc3RhcnQgdG8gcmVkdWNlIHRoZSBleHByZXNzaW9uIHdpdGggdGhlIGhlbHAgb2Zcbi8vICMgYFBhY28uVHJhbnNmb3JtLnNlcGFyYXRlZF9ieWAgdHJhbnNmb3JtZXIgd2hpY2ggaXMgZ29pbmcgdG8gbWFrZSBvdXIgam9iXG4vLyAjIGVhc2llclxuLy9cbi8vIHJlZHVjZSA9ICZQYWNvLlRyYW5zZm9ybS5zZXBhcmF0ZWRfYnkoXG4vLyAgICAgICAgICAgICYxLFxuLy8gICAgICAgICAgICBmbihcIipcIiwgbiwgbSkgLT4gbiAqIG1cbi8vICAgICAgICAgICAgICAoXCIvXCIsIG4sIG0pIC0+IG4gLyBtIHw+IHJvdW5kXG4vLyAgICAgICAgICAgIGVuZClcbi8vXG4vLyBleHByZXNzaW9uID1cbi8vICAgcmVjdXJzaXZlKFxuLy8gICAgIGZuKGUpIC0+XG4vLyAgICAgICBtdWx0aXBsaWFibGVzID0gb25lX29mKFtudW1iZXIsIGUgfD4gc3Vycm91bmRlZF9ieShcIihcIiwgXCIpXCIpXSlcbi8vICAgICAgIG11bHRpcGxpYWJsZXMgfD4gc2VwYXJhdGVkX2J5KGtlZXAob25lX29mKFtcIipcIiwgXCIvXCJdKSkpIHw+IGJpbmQocmVkdWNlKVxuLy8gICAgIGVuZClcbi8vICAgfD4gZm9sbG93ZWRfYnkoZW9mKVxuLy9cbi8vIHBhcnNlKFwiNDIgKiAyXCIsIGV4cHJlc3Npb24pIHw+IElPLmluc3BlY3Rcbi8vICMgPj4gezpvaywgODR9XG4vLyBwYXJzZShcIjQyIC8gMlwiLCBleHByZXNzaW9uKSB8PiBJTy5pbnNwZWN0XG4vLyAjID4+IHs6b2ssIDIxfVxuLy9cbi8vICMgTmljZSwgdGltZSB0byBpbnRyb2R1Y2UgdGhlIGxhc3QgdHdvIG9wZXJhdG9ycyBmb2xsb3dpbmcgdGhlIHNhbWUgcGF0dGVyblxuLy9cbi8vIHJlZHVjZSA9ICZQYWNvLlRyYW5zZm9ybS5zZXBhcmF0ZWRfYnkoXG4vLyAgICAgICAgICAgICYxLFxuLy8gICAgICAgICAgICBmbihcIipcIiwgbiwgbSkgLT4gbiAqIG1cbi8vICAgICAgICAgICAgICAoXCIvXCIsIG4sIG0pIC0+IG4gLyBtIHw+IHJvdW5kXG4vLyAgICAgICAgICAgICAgKFwiK1wiLCBuLCBtKSAtPiBuICsgbVxuLy8gICAgICAgICAgICAgIChcIi1cIiwgbiwgbSkgLT4gbiAtIG1cbi8vICAgICAgICAgICAgZW5kKVxuLy9cbi8vIGV4cHJlc3Npb24gPVxuLy8gICByZWN1cnNpdmUoXG4vLyAgICAgZm4oZSkgLT5cbi8vICAgICAgIG11bHRpcGxpYWJsZXMgPSBvbmVfb2YoW251bWJlciwgZSB8PiBzdXJyb3VuZGVkX2J5KFwiKFwiLCBcIilcIildKVxuLy8gICAgICAgYWRkaXRpb25hYmxlcyA9IG11bHRpcGxpYWJsZXNcbi8vICAgICAgICAgICAgICAgICAgICAgICB8PiBzZXBhcmF0ZWRfYnkoa2VlcChvbmVfb2YoW1wiKlwiLCBcIi9cIl0pKSlcbi8vICAgICAgICAgICAgICAgICAgICAgICB8PiBiaW5kKHJlZHVjZSlcbi8vICAgICAgIGFkZGl0aW9uYWJsZXNcbi8vICAgICAgIHw+IHNlcGFyYXRlZF9ieShrZWVwKG9uZV9vZihbXCIrXCIsIFwiLVwiXSkpKVxuLy8gICAgICAgfD4gYmluZChyZWR1Y2UpXG4vLyAgICAgZW5kKVxuLy8gICB8PiBmb2xsb3dlZF9ieShlb2YpXG4vL1xuLy9cbmxvZ1RvU2NyZWVuKCc0MiArIDInLCBleHByZXNzaW9uUCk7XG4vLyBwYXJzZShcIjQyICsgMlwiLCBleHByZXNzaW9uKSB8PiBJTy5pbnNwZWN0XG4vLyAjID4+IHs6b2ssIDQ0fVxubG9nVG9TY3JlZW4oJzQyIC0gMicsIGV4cHJlc3Npb25QKTtcbi8vIHBhcnNlKFwiNDIgLSAyXCIsIGV4cHJlc3Npb24pIHw+IElPLmluc3BlY3Rcbi8vICMgPj4gezpvaywgNDB9XG4vL1xuLy8gIyBXaGF0IGFib3V0IHRoZSBvcGVyYXRvcnMgcHJlY2VkZW5jZT9cbmxvZ1RvU2NyZWVuKCc0MiAtIDIgKiA1JywgZXhwcmVzc2lvblApO1xuLy8gcGFyc2UoXCI0MiAtIDIgKiA1XCIsIGV4cHJlc3Npb24pIHw+IElPLmluc3BlY3Rcbi8vICMgPj4gezpvaywgMzJ9XG5sb2dUb1NjcmVlbignKDQyIC0gMikgKiA1JywgZXhwcmVzc2lvblApO1xuLy8gcGFyc2UoXCIoNDIgLSAyKSAqIDVcIiwgZXhwcmVzc2lvbikgfD4gSU8uaW5zcGVjdFxuLy8gIyA+PiB7Om9rLCAyMDB9XG4vL1xuLy8gIyBJdCB3b3JrcyEgTGV0J3MgY2hlY2sgaWYgYWxsIGl0J3Mgb2tcbi8vXG5sb2dUb1NjcmVlbignNDInLCBleHByZXNzaW9uUCk7XG4vLyBwYXJzZShcIjQyXCIsIGV4cHJlc3Npb24pIHw+IElPLmluc3BlY3Rcbi8vICMgPj4gezpvaywgNDJ9XG5sb2dUb1NjcmVlbignKDQyKScsIGV4cHJlc3Npb25QKTtcbi8vIHBhcnNlKFwiKDQyKVwiLCBleHByZXNzaW9uKSB8PiBJTy5pbnNwZWN0XG4vLyAjID4+IHs6b2ssIDQyfVxubG9nVG9TY3JlZW4oJzQyICsgMicsIGV4cHJlc3Npb25QKTtcbi8vIHBhcnNlKFwiNDIgKyAyXCIsIGV4cHJlc3Npb24pIHw+IElPLmluc3BlY3Rcbi8vICMgPj4gezpvaywgNDR9XG5sb2dUb1NjcmVlbignNDIgKyAyIC0gMicsIGV4cHJlc3Npb25QKTtcbi8vIHBhcnNlKFwiNDIgKyAyIC0gMlwiLCBleHByZXNzaW9uKSB8PiBJTy5pbnNwZWN0XG4vLyAjID4+IHs6b2ssIDQyfVxubG9nVG9TY3JlZW4oJyg0MikgKyAoMiknLCBleHByZXNzaW9uUCk7XG4vLyBwYXJzZShcIig0MikgKyAoMilcIiwgZXhwcmVzc2lvbikgfD4gSU8uaW5zcGVjdFxuLy8gIyA+PiB7Om9rLCA0NH1cbmxvZ1RvU2NyZWVuKCc0MiAqIDIgKyAxJywgZXhwcmVzc2lvblApO1xuLy8gcGFyc2UoXCI0MiAqIDIgKyAxXCIsIGV4cHJlc3Npb24pIHw+IElPLmluc3BlY3Rcbi8vICMgPj4gezpvaywgODV9XG5sb2dUb1NjcmVlbignNDIgKiAoMiArIDEpJywgZXhwcmVzc2lvblApO1xuLy8gcGFyc2UoXCI0MiAqICgyICsgMSlcIiwgZXhwcmVzc2lvbikgfD4gSU8uaW5zcGVjdFxuLy8gIyA+PiB7Om9rLCAxMjZ9XG5sb2dUb1NjcmVlbignKDQyICsgMikgLyAoMyAtIDEpJywgZXhwcmVzc2lvblApO1xuLy8gcGFyc2UoXCIoNDIgKyAyKSAvICgzIC0gMSlcIiwgZXhwcmVzc2lvbikgfD4gSU8uaW5zcGVjdFxuLy8gIyA+PiB7Om9rLCAyMn1cbmxvZ1RvU2NyZWVuKCcoKDQyICsgMikgLyAoMyAtIDEpKScsIGV4cHJlc3Npb25QKTtcbi8vIHBhcnNlKFwiKCg0MiArIDIpIC8gKDMgLSAxKSlcIiwgZXhwcmVzc2lvbikgfD4gSU8uaW5zcGVjdFxuLy8gIyA+PiB7Om9rLCAyMn1cbmxvZ1RvU2NyZWVuKCc0MiArIDIgKiAzICsgMTAwJywgZXhwcmVzc2lvblApO1xuLy8gcGFyc2UoXCI0MiArIDIgKiAzICsgMTAwXCIsIGV4cHJlc3Npb24pIHw+IElPLmluc3BlY3Rcbi8vICMgPj4gezpvaywgMTQ4fVxubG9nVG9TY3JlZW4oJygoNDIrMikvKDMtMSkpJywgZXhwcmVzc2lvblApO1xubG9nVG9TY3JlZW4oJygoKDQyKzIpLygzLTEpKSknLCBleHByZXNzaW9uUCk7XG4vLyBwYXJzZShcIigoNDIrMikvKDMtMSkpXCIsIGV4cHJlc3Npb24pIHw+IElPLmluc3BlY3Rcbi8vICMgPj4gezpvaywgMjJ9XG5sb2dUb1NjcmVlbignOSAtIDEyIC0gNicsIGV4cHJlc3Npb25QKTtcbi8vIHBhcnNlKFwiOSAtIDEyIC0gNlwiLCBleHByZXNzaW9uKSB8PiBJTy5pbnNwZWN0XG4vLyAjID4+IHs6b2ssIC05fVxubG9nVG9TY3JlZW4oJzkgLSAoMTIgLSA2KScsIGV4cHJlc3Npb25QKTtcbi8vIHBhcnNlKFwiOSAtICgxMiAtIDYpXCIsIGV4cHJlc3Npb24pIHw+IElPLmluc3BlY3Rcbi8vICMgPj4gezpvaywgM31cbmxvZ1RvU2NyZWVuKCcxKzEqMicsIGV4cHJlc3Npb25QKTtcbmxvZ1RvU2NyZWVuKCcxICsgMSAqIDInLCBleHByZXNzaW9uUCk7XG5sb2dUb1NjcmVlbignMSsoMSoyKScsIGV4cHJlc3Npb25QKTtcbmxvZ1RvU2NyZWVuKCcoMSsxKjIpJywgZXhwcmVzc2lvblApO1xubG9nVG9TY3JlZW4oJygxKygxKjIpKScsIGV4cHJlc3Npb25QKTtcbmxvZ1RvU2NyZWVuKCcoMyo0KjUpJywgZXhwcmVzc2lvblApO1xubG9nVG9TY3JlZW4oJygxKzEqMikrKDMqNCo1KScsIGV4cHJlc3Npb25QKTtcbmxvZ1RvU2NyZWVuKCcoMSsxKjIpKygzKjQqNSkvMjAnLCBleHByZXNzaW9uUCk7XG5sb2dUb1NjcmVlbignKDErKDEqMikpKygzKjQqNSkvMjAnLCBleHByZXNzaW9uUCk7XG5sb2dUb1NjcmVlbignKDErKDEqMikpKygoMyo0KjUpLzIwKScsIGV4cHJlc3Npb25QKTtcbi8vIHBhcnNlKFwiKDErMSoyKSsoMyo0KjUpLzIwXCIsIGV4cHJlc3Npb24pIHw+IElPLmluc3BlY3Rcbi8vICMgPj4gezpvaywgNn1cbmxvZ1RvU2NyZWVuKCcoKDErMSoyKSsoMyo0KjUpKS8zJywgZXhwcmVzc2lvblApO1xubG9nVG9TY3JlZW4oJygoMSsoMSoyKSkrKDMqNCo1KSkvMycsIGV4cHJlc3Npb25QKTtcbi8vIHBhcnNlKFwiKCgxKzEqMikrKDMqNCo1KSkvM1wiLCBleHByZXNzaW9uKSB8PiBJTy5pbnNwZWN0XG4vLyAjID4+IHs6b2ssIDIxfVxuLy9cbi8vICMgQWZ0ZXIgYSBsaXR0bGUgc2ltcGxpZmljYXRpb24gaGVyZSdzIHRoZSBmaW5hbCByZXN1bHRcbi8vIHJlZHVjZSA9ICZQYWNvLlRyYW5zZm9ybS5zZXBhcmF0ZWRfYnkoXG4vLyAgICAgICAgICAgICYxLFxuLy8gICAgICAgICAgICBmbihcIipcIiwgbiwgbSkgLT4gbiAqIG1cbi8vICAgICAgICAgICAgICAoXCIvXCIsIG4sIG0pIC0+IG4gLyBtIHw+IHJvdW5kXG4vLyAgICAgICAgICAgICAgKFwiK1wiLCBuLCBtKSAtPiBuICsgbVxuLy8gICAgICAgICAgICAgIChcIi1cIiwgbiwgbSkgLT4gbiAtIG1cbi8vICAgICAgICAgICAgZW5kKVxuLy9cbi8vIGV4cHJlc3Npb24gPVxuLy8gICByZWN1cnNpdmUoXG4vLyAgICAgZm4oZSkgLT5cbi8vICAgICAgIG9uZV9vZihbbnVtYmVyLCBlIHw+IHN1cnJvdW5kZWRfYnkoXCIoXCIsIFwiKVwiKV0pXG4vLyAgICAgICB8PiBzZXBhcmF0ZWRfYnkoa2VlcChvbmVfb2YoW1wiKlwiLCBcIi9cIl0pKSlcbi8vICAgICAgIHw+IGJpbmQocmVkdWNlKVxuLy8gICAgICAgfD4gc2VwYXJhdGVkX2J5KGtlZXAob25lX29mKFtcIitcIiwgXCItXCJdKSkpXG4vLyAgICAgICB8PiBiaW5kKHJlZHVjZSlcbi8vICAgICBlbmQpXG4vLyAgIHw+IGZvbGxvd2VkX2J5KGVvZilcbi8vXG4vLyAjIFRoYXQncyBwcmV0dHkgbmVhdCBidXQgd2UgY2FuIGRvIGV2ZW4gYmV0dGVyLCB3ZSB3aWxsIHNlZSBob3cuLi5cblxuZnVuY3Rpb24gbG9nVG9TY3JlZW4oc3RyLCBwYXJzZXIpIHtcbiAgICBjb25zdCByZXN1bHQgPSBwYXJzZXIucnVuKFBvc2l0aW9uLmZyb21UZXh0KHN0cikpO1xuICAgIGNvbnN0IG91dGNvbWUgPSAocmVzdWx0LmlzU3VjY2VzcykgPyByZXN1bHQudmFsdWVbMF0udG9TdHJpbmcoKSA6ICdGYWlsdXJlOiAnICsgcmVzdWx0LnZhbHVlWzBdLnRvU3RyaW5nKCkgKyByZXN1bHQudmFsdWVbMV0udG9TdHJpbmcoKTtcbiAgICBjb25zb2xlLmxvZygnXCInICsgc3RyICsgJ1wiIC0tPiAnICsgb3V0Y29tZSk7XG59XG4iXX0=