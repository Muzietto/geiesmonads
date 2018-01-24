// cfr. https://github.com/gabrielelana/paco/blob/master/examples/02_chemical_formulas.exs

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

console.log('\n02_chemical_formulas.js');

// # An `element` is a word beginning with one uppercase letter followed by zero
// # or more lowercase letters
// element = [while(uppers, 1), while(lowers)] |> join
const elementP = uppercaseP.andThen(manyChars(lowercaseP)).fmap(([u, l]) => u + l);

console.log('Using uppercaseP.andThen(manyChars(lowercaseP)).fmap(([u, l]) => u + l)');
logToScreen('He', elementP);
logToScreen('H', elementP);

// # A `quantity` is a number greater than zero
// quantity = while(digits, {:at_least, 1})
//            |> bind(&String.to_integer/1)
//            |> only_if(&(&1 > 0))
const integerP = manyChars1(digitP).fmap(str => parseInt(str, 10));

console.log('Using manyChars1(digitP).fmap(str => parseInt(str, 10))');
logToScreen('123', integerP);
logToScreen('1', integerP);

// # A `reference` is an element optionally followed by a quantity. If the
// # quantity is omitted assume the value of 1 as default
// reference = {element, maybe(quantity, default: 1)}
const referenceP = elementP.andThen(opt(integerP)).fmap(([u, l]) => (l.isJust) ? [u, l.value] : [u, 1]);

console.log('Using elementP.andThen(opt(integerP)).fmap(([u, l]) => (l.isJust) ? [u, l.value] : [u, 1])');
logToScreen('He123', referenceP);
logToScreen('Ar', referenceP);

// # A chemical formula is just one or more elements
// formula = one_or_more(reference)
const formulaP = many1(referenceP);

console.log('Using many1(elementP.andThen(opt(integerP)).fmap(([u, l]) => (l.isJust) ? [u, l.value] : [u, 1]))');

// parse("H2O", formula) |> IO.inspect
// # >> {:ok, [{"H", 2}, {"O", 1}]}
logToScreen('H2O', formulaP);

// parse("NaCl", formula) |> IO.inspect
// # >> {:ok, [{"Na", 1}, {"Cl", 1}]}
logToScreen('NaCl', formulaP);

// parse("C6H5OH", formula) |> IO.inspect
// # >> {:ok, [{"C", 6}, {"H", 5}, {"O", 1}, {"H", 1}]}
logToScreen('C6H5OH', formulaP);

// # Calculate molecular weight
const atomic_weights = {
    'O': 15.9994,
    'H': 1.00794,
    'Na': 22.9897,
    'Cl': 35.4527,
    'C': 12.0107,
    'S': 32.0655,
};
// [[C,6],[H,5],[O,1],[H,1]]

// calculate_weight = &(&1 |> Enum.map(fn({e, q}) -> Map.fetch!(atomic_weight, e) * q end)
//                         |> Enum.sum)
//
// weight = formula |> bind(calculate_weight)
const weightP = formulaP.fmap(arra => arra.reduce((acc, [el, qty]) => acc + atomic_weights[el] * qty, 0));

console.log('Using formulaP.fmap(arra => arra.reduce((acc, [el, qty]) => acc + atomic_weights[el] * qty, 0))');
// parse("C6H5OH", weight) |> IO.inspect
// # >> {:ok, 94.11124}
logToScreen('C6H5OH', weightP);

function logToScreen(str, parser) {
    console.log('"' + str + '" --> ' + parser.run(str).value[0].toString());
}
