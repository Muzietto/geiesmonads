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

export function Pair(a, b) {
    return new _pair(a, b);
}

function _pair(a, b) {
    return [a, b];
}

function _triple(a, b, c) {
    this[0] = a;
    this[1] = b;
    this[2] = c;
}

_pair.prototype.isPair = true;
_pair.prototype.type = 'pair';
_pair.prototype.toString = function () {
    return '[' + this[0] + ',' + this[1] + ']';
};

export function Position(rows = [], row = 0, col = 0) {
    return new _position(rows, row, col);
}

function _position(rows, row, col) {
    this.rows = rows;
    this.row = row;
    this.col = col;
}

_position.prototype.isPosition = true;
_position.prototype.char = function () {
    let result = Maybe.Nothing();
    try {
        result = Maybe.Just(this.rows[this.row][this.col]);
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
