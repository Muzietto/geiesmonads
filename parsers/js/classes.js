import {Maybe} from 'maybe';

import {
    isPair,
} from 'util';

const toString = Array.prototype.toString;

Array.prototype.toString = function () {
    return '[' + toString.apply(this) + ']';
};

export function Tuple() {
}

function Pair(a, b) {
    let result = new _pair(a, b);
    result[Symbol.iterator] = function*() {
        yield a;
        yield b;
    };
    return result;
}
Pair.prototype = Object.create(Tuple.prototype);

function _pair(a, b) {
    this[0] = a;
    this[1] = b;
}
_pair.prototype.isPair = true;
_pair.prototype.type = 'pair';
_pair.prototype.toString = function () {
    return '[' + this[0].toString() + ',' + this[1].toString() + ']';
};

function Triple(a, b, c) {
    let result = new _triple(a, b, c);
    result[Symbol.iterator] = function*() {
        yield a;
        yield b;
        yield c;
    };
    return result;
}
Triple.prototype = Object.create(Tuple.prototype);

function _triple(a, b, c) {
    this[0] = a;
    this[1] = b;
    this[2] = c;
}
_triple.prototype.isTriple = true;
_triple.prototype.type = 'triple';
_triple.prototype.toString = function () {
    return '[' + this[0].toString() + ',' + this[1].toString() + ',' + this[2].toString() + ']';
};

Tuple.Pair = function (a, b) {
    return new Pair(a, b);
};
Tuple.prototype.Pair = Tuple.Pair;

Tuple.Triple = function (a, b, c) {
    return new Triple(a, b, c);
};
Tuple.prototype.Triple = Tuple.Triple;

export function Position(rows = [], row = 0, col = 0) {
    return new _position(rows, row, col);
}

//Position.prototype = Object.create({});
Position.fromText = function (text) {
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
_position.prototype.char = function () {
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
_position.prototype.incrPos = function () {
    const needRowIncrement = (this.col === this.rows[this.row].length - 1);
    return Position(
        this.rows,
        (needRowIncrement ? this.row + 1 : this.row),
        (needRowIncrement ? 0 : this.col + 1)
    );
};
_position.prototype.rest = function () {
    const self = this;
    return rest_helper().join('');
    function rest_helper() {
        const next = self.char();
        if (next.isNothing) return [];
        return [next.value].concat(self.incrPos().rest());
    }
};
_position.prototype.toString = function () {
    return 'row=' + this.row
        + ';col=' + this.col
        + ';rest=' + this.rest();
};

////////////////////////////////////////////////////////////////
// deprecated in favour of Tuple, data.Maybe and data.Validation
export function pair(x, y) {
    let result = [x, y];
    result.type = 'pair';
    result.toString = () => {
        return '['
            + (isPair(result[0]) ? result[0].toString() : result[0])
            + ','
            + (isPair(result[1]) ? result[1].toString() : result[1])
            + ']';
    };
    return result;
}

export function success(matched, str) {
    let result = pair(matched, str);
    result.type = 'success';
    return result;
}

export function failure(parserLabel, errorMsg) {
    let result = pair(parserLabel, errorMsg);
    result.type = 'failure';
    return result;
}

export function some(value) {
    return {
        type: 'some',
        val() {
            return value;
        },
        toString() {
            return `some(${value})`;
        }
    };
}

export function none() {
    return {
        type: 'none',
        val() {
            return null;
        },
        toString() {
            return 'none()';
        }
    };
}
