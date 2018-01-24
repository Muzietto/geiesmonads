// cfr. https://github.com/gabrielelana/paco/blob/master/examples/01_hello_world.exs

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
} from 'parsers';

// word = while(letters, at_least: 1)
const wordP = many1(letterP).fmap(arra => arra.join(''));

// separator = lex(",") |> skip
const separatorP = between(many(whiteP), pchar(','), many(whiteP));

// terminator = lex("!") |> one_or_more |> skip
const terminatorP = many1(pchar('!'));

// greetings = sequence_of([word, separator, word, terminator])
const greetingsP = wordP.discardSecond(separatorP).andThen(wordP).discardSecond(terminatorP);

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
