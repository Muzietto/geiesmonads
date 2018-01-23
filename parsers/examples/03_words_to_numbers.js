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

const unit_values = {
    zero: 0,
    one: 1,
    two: 2,
    three: 3,
    four: 4,
    five: 5,
    six: 6,
    seven: 7,
    eight: 8,
    nine: 9,
    ten: 10,
    eleven: 11,
    twelve: 12,
    thirteen: 13,
    fourteen: 14,
    fifteen: 15,
    sixteen: 16,
    seventeen: 17,
    eighteen: 18,
    nineteen: 19,
};

const tens_values = {
    twenty: 20,
    thirty: 30,
    forty: 40,
    fifty: 50,
    sixty: 60,
    seventy: 70,
    eighty: 80,
    ninety: 90,
};

const scale_values = {
    thousand: 1000,
    million: 1000000,
    billion: 1000000000,
    trillion: 1000000000000,
};

console.log('\n03_words_to_numbers.js');

// mul = fn ns -> Enum.reduce(ns, 1, &Kernel.*/2) end
const productReducer = arra => arra.reduce((acc, curr) => acc * curr, 1);
// sum = fn ns -> Enum.reduce(ns, 0, &Kernel.+/2) end
const sumReducer = arra => arra.reduce((acc, curr) => acc + curr, 0);

// units = one_of(for {word, value} <- unit_values, do: lex(word) |> replace_with(value))
const units = Object.keys(unit_values).reverse()
    .map(value => pword(value).fmap(_ => unit_values[value]));
const unitsP = choice(units).setLabel('unitsP');

console.log('Using choice(Object.keys(unit_values).map(value => pword(value).fmap(_ => unit_values[value])));');
logToScreen('one', unitsP);
logToScreen('thirteen', unitsP);
logToScreen('eighteen', unitsP);

// tens = one_of(for {word, value} <- tens_values, do: lex(word) |> replace_with(value))
const tens = Object.keys(tens_values).map(value => pword(value).fmap(_ => tens_values[value]));
const tensP1 = choice(tens);
// tens = [tens, skip(maybe(lex("-"))), maybe(units, default: 0)] |> bind(sum)
const tensP2 = tensP1.discardSecond(opt(pchar('-')))
    .andThen(opt(unitsP, 0)).fmap(([a, mb]) => {
        return a + mb.value;
    }).setLabel('tensP2');
// tens = [tens, units] |> one_of
const tensP = choice([tensP2, unitsP]);

console.log('Using tensP');
logToScreen('ten', tensP);
logToScreen('eleven', tensP);
logToScreen('twenty', tensP);
logToScreen('twentyfour', tensP);
logToScreen('twenty four', tensP);
logToScreen('twenty-three', tensP);
logToScreen('ninety', tensP);
logToScreen('ninetyseven', tensP);
logToScreen('ninety-seven', tensP);
logToScreen('seventeen', tensP);

// hundreds = lex("hundred") |> replace_with(100)
const hundredsP1 = pword('hundred').fmap(_ => 100);
// hundreds = [tens, maybe(hundreds, default: 1)] |> bind(mul)
const hundredsP2 = opt(tensP, 1)
    .andThen(opt(hundredsP1, 100)).fmap(([mt, mh]) => mt.value * mh.value)
    .setLabel('hundredsP2');
// hundreds = [hundreds, skip(maybe(lex("and"))), maybe(tens, default: 0)] |> bind(sum)
const hundredsP = hundredsP2
    .discardSecond(opt(pword('and')))
    .andThen(opt(tensP, 0)).fmap(([h, mt]) => {
        return h + mt.value;
    })
    .setLabel('hundredsP');

console.log('Using hundredsP');
// logToScreen('hundred', hundredsP);
//logToScreen('one hundred', hundredsP);
logToScreen('hundredten', hundredsP);
logToScreen('hundred ten', hundredsP);
logToScreen('hundred eleven', hundredsP);
logToScreen('one hundredeleven', hundredsP);
logToScreen('one hundred and ten', hundredsP);
logToScreen('two hundred and ten', hundredsP);
logToScreen('nine hundred and twentyfour', hundredsP);
logToScreen('nine hundred and twenty-four', hundredsP);
logToScreen('nine hundred and twenty four', hundredsP);

// scales = one_of(for {word, value} <- scale_values, do: lex(word) |> replace_with(value))
const scales = Object.keys(scale_values).map(value => pword(value)
    .fmap(_ => scale_values[value]).setLabel('scale_value(' + value + ')'));
const scalesP = choice(scales);

console.log('Using choice(Object.keys(scale_values).map(value => pword(value).fmap(_ => scale_values[value])));');
logToScreen('thousand', scalesP);
logToScreen('million', scalesP);
logToScreen('trillion', scalesP);

// number = [one_of([hundreds, tens]), maybe(scales, default: 1)] |> bind(mul)
// number = number |> separated_by(maybe(lex("and"))) |> bind(sum)
//
//
// parse("one", number) |> IO.inspect
// # >> {:ok, 1}
// parse("twenty", number) |> IO.inspect
// # >> {:ok, 20}
// parse("twenty-two", number) |> IO.inspect
// # >> {:ok, 22}
// parse("seventy-seven", number) |> IO.inspect
// # >> {:ok, 77}
// parse("one hundred", number) |> IO.inspect
// # >> {:ok, 100}
// parse("one hundred twenty", number) |> IO.inspect
// # >> {:ok, 120}
// parse("one hundred and twenty", number) |> IO.inspect
// # >> {:ok, 120}
// parse("one hundred and twenty-two", number) |> IO.inspect
// # >> {:ok, 122}
// parse("one hundred and twenty three", number) |> IO.inspect
// # >> {:ok, 123}
// parse("twelve hundred and twenty-two", number) |> IO.inspect
// # >> {:ok, 1222}
// parse("one thousand", number) |> IO.inspect
// # >> {:ok, 1000}
// parse("twenty thousand", number) |> IO.inspect
// # >> {:ok, 20000}
// parse("twenty-two thousand", number) |> IO.inspect
// # >> {:ok, 22000}
// parse("one hundred thousand", number) |> IO.inspect
// # >> {:ok, 100000}
// parse("twelve hundred and twenty-two thousand", number) |> IO.inspect
// # >> {:ok, 1222000}
// parse("one hundred and twenty three million", number) |> IO.inspect
// # >> {:ok, 123000000}
// parse("one hundred and twenty three million and three", number) |> IO.inspect
// # >> {:ok, 123000003}
// parse("seventy-seven thousand eight hundred and nineteen", number) |> IO.inspect
// # >> {:ok, 77819}
// parse("seven hundred seventy-seven thousand seven hundred and seventy-seven", number) |> IO.inspect
// # >> {:ok, 777777}

function logToScreen(str, parser) {
    console.log('"' + str + '" --> ' + parser.run(str).value[0].toString());
}
