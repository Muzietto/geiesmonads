import {Maybe} from 'maybe';

import {
    isPair,
} from 'util';

const toString = Array.prototype.toString;

Array.prototype.toString = function () {
    return '[' + toString.apply(this) + ']';
};

export function JValue() {
}
JValue.prototype.isJValue = true;

function JString(str) {
    return new _jstring(str);
}

function _jstring(str) {
    if (typeof str !== 'string') throw new Error('JString: invalid value');
    Object.defineProperty(this, 'value', {value: str, writable: false});
}
_jstring.prototype = Object.create(JValue.prototype);
_jstring.prototype.isJString = true;
_jstring.prototype.type = 'jstring';
_jstring.prototype.toString = function () {
    return 'JString(' + this.value.toString() + ')';
};

JValue.JString = JString;
JValue.prototype.JString = JValue.JString;

function JNumber(float) {
    return new _jnumber(float);
}

function _jnumber(float) {
    if (typeof float !== 'number'
        || isNaN(float)) throw new Error('JNumber: invalid value');
    Object.defineProperty(this, 'value', {value: float, writable: false});
}
_jnumber.prototype = Object.create(JValue.prototype);
_jnumber.prototype.isJNumber = true;
_jnumber.prototype.type = 'jnumber';
_jnumber.prototype.toString = function () {
    return 'JNumber(' + this.value.toString() + ')';
};

JValue.JNumber = JNumber;
JValue.prototype.JNumber = JValue.JNumber;

function JBool(bool) {
    return new _jbool(bool);
}

function _jbool(bool) {
    if (typeof bool !== 'boolean') throw new Error('JBool: invalid value');
    Object.defineProperty(this, 'value', {value: bool, writable: false});
}
_jbool.prototype = Object.create(JValue.prototype);
_jbool.prototype.isJBool = true;
_jbool.prototype.type = 'jbool';
_jbool.prototype.toString = function () {
    return 'JBool(' + this.value.toString() + ')';
};

JValue.JBool = JBool;
JValue.prototype.JBool = JValue.JBool;

function JNull(nullValue) {
    return new _jnull(nullValue);
}

function _jnull(nullValue) {
    if (nullValue !== null) throw new Error('JNull: invalid value');
    Object.defineProperty(this, 'value', {value: nullValue, writable: false});
}
_jnull.prototype = Object.create(JValue.prototype);
_jnull.prototype.isJNull = true;
_jnull.prototype.type = 'jnull';
_jnull.prototype.toString = function () {
    return 'JNull(null)';
};

JValue.JNull = JNull;
JValue.prototype.JNull = JValue.JNull;

function JArray(...jValues) {
    return new _jarray(...jValues);
}

// TODO make it with iterator and everything
function _jarray(...jValues) {  // args become a REAL array
    if (typeof jValue === 'undefined') { // empty JSON array
        Object.defineProperty(this, 'value', {value: [], writable: false});
    } else {
        if (jValues.some(jval => (!jval.isJValue))) throw new Error('JArray: invalid content');
        Object.defineProperty(this, 'value', {value: [...jValues], writable: false});
    }
}
_jarray.prototype = Object.create(JValue.prototype);
_jarray.prototype.isJArray = true;
_jarray.prototype.type = 'jarray';
_jarray.prototype.toString = function () {
    return 'JArray([' + this.value.reduce((acc, curr) => acc + curr + ',', '') + '])';
};

JValue.JArray = JArray;
JValue.prototype.JArray = JValue.JArray;

function JObject(...pairs) {
    return new _jobject(...pairs);
}

function _jobject(...pairs) {
    const self = this;
    if (pairs.some(pair => {
            return (!pair.isPair
            || typeof pair[0] !== 'string'
            || !pair[1].isJValue);
        })) throw new Error('JObject: invalid content');
    pairs.forEach(([key, value]) => {
        Object.defineProperty(self, key, {value: value, writable: false});
    });
}
_jobject.prototype = Object.create(JValue.prototype);
_jobject.prototype.isJObject = true;
_jobject.prototype.type = 'jobject';
_jobject.prototype.toString = function () {
    return 'JObject({' + OBJ + '})';
};

JValue.JObject = JObject;
JValue.prototype.JObject = JValue.JObject;

/////////////////////////////
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
    Object.defineProperty(this, 0, {value: a, writable: false});
    Object.defineProperty(this, 1, {value: b, writable: false});
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
    Object.defineProperty(this, 0, {value: a, writable: false});
    Object.defineProperty(this, 1, {value: b, writable: false});
    Object.defineProperty(this, 2, {value: c, writable: false});
}
_triple.prototype.isTriple = true;
_triple.prototype.type = 'triple';
_triple.prototype.toString = function () {
    return '[' + this[0].toString() + ',' + this[1].toString() + ',' + this[2].toString() + ']';
};

Tuple.Pair = Pair;
Tuple.prototype.Pair = Pair;

Tuple.Triple = Triple;
Tuple.prototype.Triple = Triple;

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
