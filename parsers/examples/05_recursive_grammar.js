// cfr. https://github.com/gabrielelana/paco/blob/master/examples/05_recursive_grammar.exs

import {
    JValue,
    Tuple,
    Position,
} from 'classes';
import {
    Validation,
} from 'validation';
import {
    parser,
    charParser,
    digitParser,
    predicateBasedParser,
    pchar,
    pdigit,
    andThen,
    orElse,
    choice,
    anyOf,
    fmap,
    returnP,
    applyP,
    lift2,
    sequenceP,
    sequenceP2,
    pstring,
    zeroOrMore,
    many,
    many1,
    manyChars,
    manyChars1,
    opt,
    optBook,
    discardFirst,
    discardSecond,
    between,
    betweenParens,
    sepBy1,
    lowercaseP,
    uppercaseP,
    letterP,
    digitP,
    whiteP,
    tapP,
    logP,
    pword,
    trimP,
} from 'parsers';

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

const numberP1 = manyChars1(digitP).fmap(parseFloat).setLabel('manyChars1(digitP).fmap(parseFloat)');

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

const numberP2 = between(opt(many(whiteP)), numberP1, opt(many(whiteP)));

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

function recursive(f) {
    //return (state, this) => box(f(this)).run(state, this)
}
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

const expressionP1 = parser(pos => orElse(numberP2, betweenParens(expressionP1)).run(pos));

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

const expressionP = parser(pos => {
    const factorP = orElse(numberP2, betweenParens(expressionP));
    const multipliedsP = parser(pos => factorP
        .andThen(trimP(orElse(pchar('*'), pchar('/'))))
        .andThen(choice([multipliedsP, factorP]))
        .fmap(([[f1, op], f2]) => (op === '*') ? f1 * f2 : Math.round(f1 / f2))
        .run(pos), 'multipliedsP');
    const summedsP = parser(pos => factorP
        .andThen(trimP(orElse(pchar('+'), pchar('-'))))
        .andThen(choice([summedsP, factorP]))
        .fmap(([[f1, op], f2]) => (op === '+') ? f1 + f2 : f1 - f2)
        .run(pos), 'summedsP');
    return choice([multipliedsP, summedsP, factorP]).run(pos);
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
    const result = parser.run(Position.fromText(str));
    const outcome = (result.isSuccess) ? result.value[0].toString() : 'Failure: ' + result.value[0].toString() + result.value[1].toString();
    console.log('"' + str + '" --> ' + outcome);
}
