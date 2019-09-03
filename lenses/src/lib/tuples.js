/*
The MIT License (MIT)

Copyright (c) 2014 Marco Faustinelli

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

import { Maybe } from './maybe';

export function Tuple() {
}

function Pair(a, b) {
  const result = new _pair(a, b);
  result[Symbol.iterator] = function*() {
    yield a;
    yield b;
  };
  return result;
}
Pair.prototype = Object.create(Tuple.prototype);

function _pair(a, b) {
  Object.defineProperty(this, 0, { value: a, writable: false });
  Object.defineProperty(this, 1, { value: b, writable: false });
}
_pair.prototype.isPair = true;
_pair.prototype.type = 'pair';
_pair.prototype.toString = function() {
  return '[' + this[0].toString() + ',' + this[1].toString() + ']';
};

function Triple(a, b, c) {
  const result = new _triple(a, b, c);
  result[Symbol.iterator] = function*() {
    yield a;
    yield b;
    yield c;
  };
  return result;
}
Triple.prototype = Object.create(Tuple.prototype);

function _triple(a, b, c) {
  Object.defineProperty(this, 0, { value: a, writable: false });
  Object.defineProperty(this, 1, { value: b, writable: false });
  Object.defineProperty(this, 2, { value: c, writable: false });
}
_triple.prototype.isTriple = true;
_triple.prototype.type = 'triple';
_triple.prototype.toString = function() {
  return '[' + this[0].toString() + ',' + this[1].toString() + ',' + this[2].toString() + ']';
};

Tuple.Pair = Pair;
Tuple.prototype.Pair = Pair;

Tuple.Triple = Triple;
Tuple.prototype.Triple = Triple;

export function Position(rows = [], row = 0, col = 0) {
  return new _position(rows, row, col);
}

// Position.prototype = Object.create({});
Position.fromText = function(text) {
  const rows = text.split('\n')
    .map(row => row.split(''));
  return new _position(rows, 0, 0);
};

function _position(rows, row, col) {
  this.rows = rows;
  this.row = row;
  this.col = col;
}

_position.prototype.isPosition = true;
_position.prototype.char = function() {
  let result = Maybe.Nothing();
  try {
    const newResultValue = this.rows[this.row][this.col];
    if (typeof newResultValue !== 'undefined') {
      result = Maybe.Just(newResultValue);
    }
  } catch (err) {
  }
  return result;
};
_position.prototype.incrPos = function() {
  const needRowIncrement = (this.col === this.rows[this.row].length - 1);
  return Position(
    this.rows,
    (needRowIncrement ? this.row + 1 : this.row),
    (needRowIncrement ? 0 : this.col + 1)
  );
};
_position.prototype.rest = function() {
  const self = this;
  return rest_helper().join('');
  function rest_helper() {
    const next = self.char();
    if (next.isNothing) return [];
    return [next.value].concat(self.incrPos().rest());
  }
};
_position.prototype.toString = function() {
  return 'row=' + this.row
        + ';col=' + this.col
        + ';rest=' + this.rest();
};
