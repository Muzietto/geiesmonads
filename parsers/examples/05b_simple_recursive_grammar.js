// http://www.lihaoyi.com/post/EasyParsingwithParserCombinators.html#recursive-parsers

import {
    JValue,
    Tuple,
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

// @ {
//   val prefix = P( "hello" | "goodbye" ).!.map(Word)
const prefixP = pword('hello')
    .orElse(pword('goodbye'))
    .fmap(arra => arra.join(''))
    .setLabel('prefixP');

//   val suffix = P( "world" | "seattle" ).!.map(Word)
const suffixP = pword('world')
    .orElse(pword('seattle'))
    .fmap(arra => arra.join(''))
    .setLabel('suffixP');

const expressionP = parser(pos => choice([prefixP, trimP(betweenParens(expressionP))])
    .andThen(choice([suffixP, trimP(betweenParens(expressionP))]))
    .fmap(([a, b]) => Tuple.Pair(a, b)).run(pos));

//   val parser: Parser[Phrase] = P( (parened | prefix) ~ ws ~ (parened | suffix) ).map{
//     case (lhs, rhs) => Pair(lhs, rhs)
//   }

console.log('\n05b_simple_recursive_grammar');
logToScreen('hello seattle', expressionP);
logToScreen('hello world', expressionP);
logToScreen('goodbye world', expressionP);
// @ parser.parse("hello seattle")
// res66: Parsed[Phrase] = Success(
//   Pair(Word("hello"), Word("seattle")),
//   13
// )
//
logToScreen('hello (goodbye seattle)', expressionP);
logToScreen('(hello world) seattle', expressionP);
// @ parser.parse("hello (goodbye seattle)")
// res67: Parsed[Phrase] = Success(
//   Pair(
//     Word("hello"),
//     Pair(Word("goodbye"), Word("seattle"))
//   ),
//   23
// )
//
logToScreen('(hello  world) (goodbye seattle)', expressionP);
// @ parser.parse("(hello  world)   (goodbye seattle)")
// res68: Parsed[Phrase] = Success(
//   Pair(
//     Pair(Word("hello"), Word("world")),
//     Pair(Word("goodbye"), Word("seattle"))
//   ),
//   34
// )
//
logToScreen('(hello  world) ((goodbye seattle) world)', expressionP);
// @ parser.parse("(hello  world)  ((goodbye seattle) world)")
// res69: Parsed[Phrase] = Success(
//   Pair(
//     Pair(Word("hello"), Word("world")),
//     Pair(
//       Pair(Word("goodbye"), Word("seattle")),
//       Word("world")
//     )
//   ),
//   41
// )

function logToScreen(str, parser) {
    const result = parser.run(str);
    const outcome = (result.isSuccess) ? result.value[0].toString() : 'Failure: ' + result.value[0].toString();
    console.log('"' + str + '" --> ' + outcome);
}
