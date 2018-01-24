// cfr. https://github.com/gabrielelana/paco/blob/master/examples/04_context_sensitive.exs

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

// The classical example of context sensitive grammars is: a{n}b{n}c{n}

// "a" repeated n times, followed by "b" repeated n times, followed by "c"
// repeated n times, where n is always the same number. So "abc" it's ok,
// "aaabbbccc" it's ok, "abbc" it's not

const consenP = manyChars1(pchar('a'))
    .bind(as => {//debugger;
        const char = as.charAt(0);
        const times = as.length;

        return manyChars(pchar('b'), times)
            .andThen(manyChars(pchar('c'), times))
            .fmap(([bs, cs]) => [as, bs, cs]);
    });

console.log('\n04_context_sensitive.js');
console.log('Using a very sophisticated bound parser');

logToScreen('abc', consenP);
logToScreen('aaabbbccc', consenP);
logToScreen('abbc', consenP);

function logToScreen(str, parser) {
    const result = parser.run(str);
    const outcome = (result.isSuccess) ? result.value[0].toString() : 'Failure';
    console.log('"' + str + '" --> ' + outcome);
}
