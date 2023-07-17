/*
The MIT License (MIT)

Copyright (c) 2014-2023 Marco Faustinelli

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

// cfr. "Understanding Parser Combinators" (F# for Fun and Profit)

import {
  Tuple, // couples and triples
  Position, // a 2D buffer and two pointers: Position(rows = [], row = 0, col = 0)
} from './tuples';
import { Maybe } from './maybe'; // Just or Nothing
import { Validation } from './validation'; // Success or Failure

const charParser = char => pos => {
  if (typeof pos === 'string') pos = Position.fromText(pos);
  const optChar = pos.char();
  if (optChar.isNothing) return Validation.Failure(Tuple.Triple('charParser', 'no more input', pos));
  if (optChar.value === char) return Validation.Success(Tuple.Pair(char, pos.incrPos()));
  return Validation.Failure(Tuple.Triple('charParser', 'wanted ' + char + '; got ' + optChar.value, pos));
};

const digitParser = digit => pos => {
  if (typeof pos === 'string') pos = Position.fromText(pos);
  const optChar = pos.char();
  if (optChar.isNothing) return Validation.Failure(Tuple.Triple('digitParser', 'no more input', pos));
  if (parseInt(optChar.value, 10) === digit) return Validation.Success(Tuple.Pair(digit, pos.incrPos()));
  return Validation.Failure(Tuple.Triple('digitParser', 'wanted ' + digit + '; got ' + optChar.value, pos));
};

const predicateBasedParser = (pred, label) => pos => {
  if (typeof pos === 'string') pos = Position.fromText(pos);
  const optChar = pos.char();
  if (optChar.isNothing) return Validation.Failure(Tuple.Triple(label, 'no more input', pos));
  if (pred(optChar.value)) return Validation.Success(Tuple.Pair(optChar.value, pos.incrPos()));
  return Validation.Failure(Tuple.Triple(label, 'unexpected char: ' + optChar.value, pos));
};

const startOfInputP =
  parser(pos => ((pos.decrPos().char().isNothing)
    ? succeedP.run(pos)
    : failP.run(pos))).setLabel('^');

const notStartOfInputP =
  parser(pos => ((pos.decrPos().char().isJust)
    ? succeedP.run(pos)
    : failP.run(pos))).setLabel('not^');

const endOfInputP =
  parser(pos => ((pos.rest() === '')
    ? succeedP.run(pos)
    : failP.run(pos))).setLabel('$');

const notEndOfInputP =
  parser(pos => ((pos.rest() !== '')
    ? succeedP.run(pos)
    : failP.run(pos))).setLabel('not$');

function pchar(char) {
  const label = 'pchar_' + char;
  const result = pos => charParser(char)(pos);
  return parser(result, label).setLabel(label);
}

function pdigit(digit) {
  return parser(pos => digitParser(digit)(pos), 'pdigit_' + digit);
}

function precededByP(c1, c2) {
  const label = c2 + ' preceded by ' + c1;
  return parser(pos => {
    const res2 = pchar(c2).run(pos);
    if (res2.isSuccess) {
      const res1 = pchar(c1).run(res2.value[1].decrPos(2));
      if (res1.isSuccess) {
        return Validation.Success(Tuple.Pair(c2, res2.value[1]));
      }
      return Validation.Failure(Tuple.Triple(label, res1.value[1], res1.value[2]));
    }
    return Validation.Failure(Tuple.Triple(label, res2.value[1], res2.value[2]));
  }, label);
}

function notPrecededByP(c1, c2) {
  const label = c2 + ' not preceded by ' + c1;
  return parser(pos => {
    const res2 = pchar(c2).run(pos);
    if (res2.isSuccess) {
      let res1 = Validation.Failure();
      try { // crash going back beyond start of input => ok
        res1 = pchar(c1).run(res2.value[1].decrPos(2));
      } catch (err) {}
      if (res1.isFailure) {
        return Validation.Success(Tuple.Pair(c2, res2.value[1]));
      }
      return Validation.Failure(Tuple.Triple(label, res1.value[1], res1.value[2]));
    }
    return Validation.Failure(Tuple.Triple(label, res2.value[1], res2.value[2]));
  }, label);
}

function followedByP(c1, c2) {
  const label = c2 + ' followed by ' + c1;
  return parser(pos => {
    const res2 = pchar(c2).run(pos);
    if (res2.isSuccess) {
      const res1 = pchar(c1).run(res2.value[1]); // no need to increment pos
      if (res1.isSuccess) {
        return Validation.Success(Tuple.Pair(c2, res2.value[1]));
      }
      return Validation.Failure(Tuple.Triple(label, res1.value[1], res1.value[2]));
    }
    return Validation.Failure(Tuple.Triple(label, res2.value[1], res2.value[2]));
  }, label);
}

function notFollowedByP(c1, c2) {
  const label = c2 + ' not followed by ' + c1;
  return parser(pos => {
    const res2 = pchar(c2).run(pos);
    if (res2.isSuccess) {
      let res1 = Validation.Failure();
      try { // crash going down beyond end of input => ok
        res1 = pchar(c1).run(res2.value[1]);
      } catch (err) {}
      if (res1.isFailure) {
        return Validation.Success(Tuple.Pair(c2, res2.value[1]));
      }
      return Validation.Failure(Tuple.Triple(label, res1.value[1], res1.value[2]));
    }
    return Validation.Failure(Tuple.Triple(label, res2.value[1], res2.value[2]));
  }, label);
}

function andThen(p1, p2) {
  const label = p1.label + ' andThen ' + p2.label;
  return parser(pos => {
    const res1 = p1.run(pos);
    if (res1.isSuccess) {
      const res2 = p2.run(res1.value[1]);
      if (res2.isSuccess) {
        return Validation.Success(Tuple.Pair(Tuple.Pair(res1.value[0], res2.value[0]), res2.value[1]));
      }
      return Validation.Failure(Tuple.Triple(label, res2.value[1], res2.value[2]));
    }
    return Validation.Failure(Tuple.Triple(label, res1.value[1], res1.value[2]));
  }, label);
}

// using bind
function andThenBind(p1, p2) {
  return p1.bind(parsedValue1 => {
    return p2.bind(parsedValue2 => {
      return returnP(Tuple.Pair(parsedValue1, parsedValue2));
    });
  }).setLabel(p1.label + ' andThen ' + p2.label);
}

function orElse(p1, p2) {
  const label = p1.label + ' orElse ' + p2.label;
  return parser(pos => {
    const res1 = p1.run(pos);
    if (res1.isSuccess) return res1;
    const res2 = p2.run(pos);
    if (res2.isSuccess) return res2;
    return Validation.Failure(Tuple.Triple(label, res2.value[1], res2.value[2]));
  }, label).setLabel(label);
}

const failP = parser(pos => Validation.Failure(Tuple.Triple('', 'fail', pos)))
  .setLabel('failP');

const succeedP = parser(pos => Validation.Success(Tuple.Pair('', pos), 'succeed'))
  .setLabel('succeedP');

function choice(parsers) {
  return parsers.reduceRight((rest, curr) => orElse(curr, rest), failP)
    .setLabel('choice ' + parsers.reduce((acc, curr) => acc + '/' + curr.label, ''));
}

function anyOf(charsArray) {
  return choice(charsArray.map(pchar))
    .setLabel('anyOf ' + charsArray.reduce((acc, curr) => acc + curr, ''));
}

const lowercaseP = anyOf(['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z']).setLabel('lowercaseP');
const uppercaseP = anyOf(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']).setLabel('uppercaseP');
const letterP = lowercaseP.orElse(uppercaseP).setLabel('letterP');
const digitP = anyOf(['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']).setLabel('digitP');
const whiteP = anyOf([' ', '\t', '\n', '\r']).setLabel('whiteP');

function fmap(fab, parser1) {
  const label = parser1.label + ' fmap ' + fab.toString();
  return parser(pos => {
    const res = parser1.run(pos);
    if (res.isSuccess) return Validation.Success(Tuple.Pair(fab(res.value[0]), res.value[1]));
    return Validation.Failure(Tuple.Triple(label, res.value[1], res.value[2]));
  }, label);
}

function returnP(value) {
  return parser(pos => Validation.Success(Tuple.Pair(value, pos)))
    .setLabel(`returnP ${value.toString()}`);
}

// parser(a -> b) -> parser(a) -> parser(b)
function applyPx(fP) {
  return function(xP) {
    return andThen(fP, xP).fmap(([f, x]) => f(x));
  };
}

// using bind
function applyP(fP) {
  return function(xP) {
    return fP.bind(parsedValuef => {
      return xP.bind(parsedValuex => {
        return returnP(parsedValuef(parsedValuex));
      });
    });
  };
}

function lift2(faab) {
  return function(parser1) {
    return function(parser2) {
      // return applyP(applyP(returnP(faab))(parser1))(parser2);
      return returnP(faab).apply(parser1).apply(parser2); // using instance methods
    };
  };
}

// using lift2(cons)
function sequenceP(parsers) {
  return parsers
    .reduceRight((rest, curr) => {
      return lift2(_cons)(curr)(rest);
    }, returnP([]));
}

// using naive andThen && fmap --> returns strings, not arrays!
function sequenceP2(parsers) {
  return parsers
    .reduceRight((rest, curr) => {
      return fmap(([x, y]) => x + y, andThen(curr, rest));
    }, returnP(''));
}

function pstring(str) {
  return sequenceP(str.split('').map(pchar))
    .setLabel('pstring ' + str);
}

function stringP(str) {
  return pstring(str)
    .fmap(res => res.join(''))
    .setLabel('stringP ' + str);
}

function zeroOrMore(xP) { // zeroOrMore :: p a -> [a] -> try [a] = p a -> p [a]
  return pos => {
    const res1 = xP.run(pos);
    if (res1.isFailure) return Validation.Success(Tuple.Pair([], pos));
    const resN = zeroOrMore(xP)(res1.value[1]);
    return Validation.Success(Tuple.Pair([res1.value[0]].concat(resN.value[0]), resN.value[1]));
  };
}

function many(xP, times) {
  const times_defined = (typeof times !== 'undefined');
  const label = 'many ' + xP.label
        + ((times_defined) ? ' times=' + times : '');
  return parser(pos => {
    const res = zeroOrMore(xP)(pos);
    if (times_defined) {// debugger;
      if (res.isFailure) return res;
      const resultLength = res.value[0].length;
      return (resultLength === times)
        ? res
        : Validation.Failure(Tuple.Triple(label, 'times param wanted ' + times + '; got ' + resultLength, pos));
    }
    return res;
  }, label).setLabel(label);
}

function manyChars(xP, times) {
  return many(xP, times)
    .fmap(arra => arra.join(''))
    .setLabel('manyChars ' + xP.label
            + ((typeof times !== 'undefined') ? ' times=' + times : ''));
}

function many1(xP) {
  const label = 'many1 ' + xP.label;
  return parser(pos => {
    const res1 = xP.run(pos);
    if (res1.isFailure) return res1;
    const resN = zeroOrMore(xP)(res1.value[1]);
    return Validation.Success(Tuple.Pair([res1.value[0]].concat(resN.value[0]), resN.value[1]));
  }, label).setLabel(label);
}

function manyChars1(xP) {
  return many1(xP)
    .fmap(arra => arra.join(''))
    .setLabel('manyChars1 ' + xP.label);
}

function opt(xP, defaultValue) {
  const isDefault = (typeof defaultValue !== 'undefined');
  const label = 'opt ' + xP.label
        + (isDefault ? '(default=' + defaultValue + ')' : '');
  return parser(pos => {
    const res = xP.fmap(Maybe.Just).run(pos);
    if (res.isSuccess) return res;
    const outcome = (isDefault) ? Maybe.Just(defaultValue) : Maybe.Nothing();
    return Validation.Success(Tuple.Pair(outcome, pos));
  }, label).setLabel(label);
}

// opt from the book - works ok, but toString() gives strange results
function optBook(pX) {
  const someP = pX.fmap(Maybe.Just);
  const noneP = returnP(Maybe.Nothing);
  return someP.orElse(noneP);
}

function discardSecond(p1, p2) {
  const label = p1.label + ' discardSecond ' + p2.label;
  return parser(pos => {
    // eslint-disable-next-line no-unused-vars
    return andThen(p1, p2).fmap(([x, y]) => x).run(pos);
  }, label).setLabel(label);
}

function discardFirst(p1, p2) {
  const label = p1.label + ' discardFirst ' + p2.label;
  return parser(pos => {
    // eslint-disable-next-line no-unused-vars
    return andThen(p1, p2).fmap(([x, y]) => y).run(pos);
  }, label).setLabel(label);
}

function sepBy1(px, sep) {
  return px.andThen(many(sep.discardFirst(px)))
    .fmap(([r, rlist]) => [r].concat(rlist));
}

// my version works just fine (almost - succeeds akso with zero matches)...
function sepBy1Marco(valueP, separatorP) {
  return many(many1(valueP).discardSecond(opt(separatorP)))
    .fmap(res => res.map(([x]) => x));
}

// sepBy1 working on zero occurrences
function sepBy(px, sep) {
  return sepBy1(px, sep).orElse(returnP([]));
}

function between(p1, p2, p3) {
  return p1.discardFirst(p2).discardSecond(p3)
    .setLabel('between ' + p1.label + '/' + p2.label + '/' + p3.label);
}

function betweenParens(px) {
  return between(pchar('('), px, pchar(')'))
    .setLabel('betweenParens ' + px.label);
}

function bindP(famb, px) {
  const label = 'bindP applied to ' + px.label;
  return parser(pos => {
    const res = px.run(pos);
    if (res.isFailure) return res;
    return famb(res.value[0]).run(res.value[1]);
  }, label).setLabel(label);
}

function tapP(px, fn) {
  return px.bind(res => {
    fn(res);
    return returnP(res);
  });
}

function logP(px) {
  // eslint-disable-next-line no-console
  return tapP(px, res => console.log(px.label + ':' + res));
}

function pword(word) {
  return trimP(pstring(word))
    .setLabel('pword ' + word);
}

function trimP(pX) {
  return opt(many(whiteP))
    .discardFirst(pX)
    .discardSecond(opt(many(whiteP)))
    .setLabel('trim ' + pX.label);
}

function _cons(x) {
  return function(xs) {
    return [x].concat(xs);
  };
}

function _setLabel(px, newLabel) {
  return parser(pos => {
    const result = px.run(pos);
    if (result.isFailure) return Validation.Failure(Tuple.Triple(newLabel, result.value[1], result.value[2]));
    return result;
  }, newLabel);
}

// the real thing...
function parser(fn, label) {
  return {
    type: 'parser',
    label,
    run(pos) {
      return fn(pos);
    },
    apply(px) {
      return applyP(this)(px);
      // return this.bind(andThen(this, px).fmap(([f, x]) => f(x))).run; // we are the fP
    },
    fmap(fab) {
      // return fmap(fab, this);
      // return bindP(pos => returnP(fab(pos)), this);
      return this.bind(parsedValue => returnP(fab(parsedValue)));
    },
    andThen(px) {
      return andThen(this, px);
    },
    orElse(px) {
      return orElse(this, px);
    },
    discardFirst(px) {
      return discardFirst(this, px);
    },
    discardSecond(px) {
      return discardSecond(this, px);
    },
    bind(famb) {
      return bindP(famb, this);
    },
    setLabel(newLabel) {
      return _setLabel(this, newLabel);
    },
  };
}

export default {
  charParser,
  digitParser,
  predicateBasedParser,
  startOfInputP,
  notStartOfInputP,
  endOfInputP,
  notEndOfInputP,
  pchar,
  pdigit,
  precededByP,
  notPrecededByP,
  followedByP,
  notFollowedByP,
  andThen,
  andThenBind,
  orElse,
  failP,
  succeedP,
  choice,
  anyOf,
  lowercaseP,
  uppercaseP,
  letterP,
  digitP,
  whiteP,
  fmap,
  returnP,
  applyPx,
  applyP,
  lift2,
  sequenceP,
  sequenceP2,
  pstring,
  stringP,
  zeroOrMore,
  many,
  manyChars,
  many1,
  manyChars1,
  opt,
  optBook,
  discardSecond,
  discardFirst,
  sepBy1,
  sepBy1Marco,
  sepBy,
  between,
  betweenParens,
  bindP,
  tapP,
  logP,
  pword,
  trimP,
  parser,
};
