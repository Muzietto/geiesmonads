define(['exports', 'maybe', 'util'], function (exports, _maybe, _util) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.JValue = JValue;
    exports.Tuple = Tuple;
    exports.Position = Position;
    exports.pair = pair;
    exports.success = success;
    exports.failure = failure;
    exports.some = some;
    exports.none = none;


    var toString = Array.prototype.toString;

    Array.prototype.toString = function () {
        return '[' + toString.apply(this) + ']';
    };

    function JValue() {}
    JValue.prototype.isJValue = true;

    function JString(str) {
        return new _jstring(str);
    }

    function _jstring(str) {
        if (typeof str !== 'string') throw new Error('JString: invalid value');
        Object.defineProperty(this, 'value', { value: str, writable: false });
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
        if (typeof float !== 'number' || isNaN(float)) throw new Error('JNumber: invalid value');
        Object.defineProperty(this, 'value', { value: float, writable: false });
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
        Object.defineProperty(this, 'value', { value: bool, writable: false });
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
        Object.defineProperty(this, 'value', { value: nullValue, writable: false });
    }
    _jnull.prototype = Object.create(JValue.prototype);
    _jnull.prototype.isJNull = true;
    _jnull.prototype.type = 'jnull';
    _jnull.prototype.toString = function () {
        return 'JNull(null)';
    };

    JValue.JNull = JNull;
    JValue.prototype.JNull = JValue.JNull;

    function JArray() {
        for (var _len = arguments.length, jValues = Array(_len), _key = 0; _key < _len; _key++) {
            jValues[_key] = arguments[_key];
        }

        return new (Function.prototype.bind.apply(_jarray, [null].concat(jValues)))();
    }

    // TODO make it with iterator and everything
    function _jarray() {
        for (var _len2 = arguments.length, jValues = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
            jValues[_key2] = arguments[_key2];
        }

        if (jValues.some(function (jval) {
            return !jval.isJValue;
        })) throw new Error('JArray: invalid content');
        Object.defineProperty(this, 'value', { value: [].concat(jValues), writable: false });
    }
    _jarray.prototype = Object.create(JValue.prototype);
    _jarray.prototype.isJArray = true;
    _jarray.prototype.type = 'jarray';
    _jarray.prototype.toString = function () {
        return 'JArray([' + this.value.reduce(function (acc, curr) {
            return acc + curr + ',';
        }, '') + '])';
    };

    JValue.JArray = JArray;
    JValue.prototype.JArray = JValue.JArray;

    /////////////////////////////
    function Tuple() {}

    function Pair(a, b) {
        var result = new _pair(a, b);
        result[Symbol.iterator] = regeneratorRuntime.mark(function _callee() {
            return regeneratorRuntime.wrap(function _callee$(_context) {
                while (1) {
                    switch (_context.prev = _context.next) {
                        case 0:
                            _context.next = 2;
                            return a;

                        case 2:
                            _context.next = 4;
                            return b;

                        case 4:
                        case 'end':
                            return _context.stop();
                    }
                }
            }, _callee, this);
        });
        return result;
    }
    Pair.prototype = Object.create(Tuple.prototype);

    function _pair(a, b) {
        Object.defineProperty(this, 0, { value: a, writable: false });
        Object.defineProperty(this, 1, { value: b, writable: false });
    }
    _pair.prototype.isPair = true;
    _pair.prototype.type = 'pair';
    _pair.prototype.toString = function () {
        return '[' + this[0].toString() + ',' + this[1].toString() + ']';
    };

    function Triple(a, b, c) {
        var result = new _triple(a, b, c);
        result[Symbol.iterator] = regeneratorRuntime.mark(function _callee2() {
            return regeneratorRuntime.wrap(function _callee2$(_context2) {
                while (1) {
                    switch (_context2.prev = _context2.next) {
                        case 0:
                            _context2.next = 2;
                            return a;

                        case 2:
                            _context2.next = 4;
                            return b;

                        case 4:
                            _context2.next = 6;
                            return c;

                        case 6:
                        case 'end':
                            return _context2.stop();
                    }
                }
            }, _callee2, this);
        });
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
    _triple.prototype.toString = function () {
        return '[' + this[0].toString() + ',' + this[1].toString() + ',' + this[2].toString() + ']';
    };

    Tuple.Pair = Pair;
    Tuple.prototype.Pair = Pair;

    Tuple.Triple = Triple;
    Tuple.prototype.Triple = Triple;

    function Position() {
        var rows = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
        var row = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
        var col = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;

        return new _position(rows, row, col);
    }

    //Position.prototype = Object.create({});
    Position.fromText = function (text) {
        var rows = text.split('\n').map(function (row) {
            return row.split('');
        });
        return new _position(rows, 0, 0);
    };

    function _position(rows, row, col) {
        this.rows = rows;
        this.row = row;
        this.col = col;
    }

    _position.prototype.isPosition = true;
    _position.prototype.char = function () {
        var result = _maybe.Maybe.Nothing();
        try {
            var newResultValue = this.rows[this.row][this.col];
            if (typeof newResultValue !== 'undefined') {
                result = _maybe.Maybe.Just(newResultValue);
            }
        } catch (err) {}
        return result;
    };
    _position.prototype.incrPos = function () {
        var needRowIncrement = this.col === this.rows[this.row].length - 1;
        return Position(this.rows, needRowIncrement ? this.row + 1 : this.row, needRowIncrement ? 0 : this.col + 1);
    };
    _position.prototype.rest = function () {
        var self = this;
        return rest_helper().join('');
        function rest_helper() {
            var next = self.char();
            if (next.isNothing) return [];
            return [next.value].concat(self.incrPos().rest());
        }
    };
    _position.prototype.toString = function () {
        return 'row=' + this.row + ';col=' + this.col + ';rest=' + this.rest();
    };

    ////////////////////////////////////////////////////////////////
    // deprecated in favour of Tuple, data.Maybe and data.Validation
    function pair(x, y) {
        var result = [x, y];
        result.type = 'pair';
        result.toString = function () {
            return '[' + ((0, _util.isPair)(result[0]) ? result[0].toString() : result[0]) + ',' + ((0, _util.isPair)(result[1]) ? result[1].toString() : result[1]) + ']';
        };
        return result;
    }

    function success(matched, str) {
        var result = pair(matched, str);
        result.type = 'success';
        return result;
    }

    function failure(parserLabel, errorMsg) {
        var result = pair(parserLabel, errorMsg);
        result.type = 'failure';
        return result;
    }

    function some(value) {
        return {
            type: 'some',
            val: function val() {
                return value;
            },
            toString: function toString() {
                return 'some(' + value + ')';
            }
        };
    }

    function none() {
        return {
            type: 'none',
            val: function val() {
                return null;
            },
            toString: function toString() {
                return 'none()';
            }
        };
    }
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2pzL2NsYXNzZXMuanMiXSwibmFtZXMiOlsiSlZhbHVlIiwiVHVwbGUiLCJQb3NpdGlvbiIsInBhaXIiLCJzdWNjZXNzIiwiZmFpbHVyZSIsInNvbWUiLCJub25lIiwidG9TdHJpbmciLCJBcnJheSIsInByb3RvdHlwZSIsImFwcGx5IiwiaXNKVmFsdWUiLCJKU3RyaW5nIiwic3RyIiwiX2pzdHJpbmciLCJFcnJvciIsIk9iamVjdCIsImRlZmluZVByb3BlcnR5IiwidmFsdWUiLCJ3cml0YWJsZSIsImNyZWF0ZSIsImlzSlN0cmluZyIsInR5cGUiLCJKTnVtYmVyIiwiZmxvYXQiLCJfam51bWJlciIsImlzTmFOIiwiaXNKTnVtYmVyIiwiSkJvb2wiLCJib29sIiwiX2pib29sIiwiaXNKQm9vbCIsIkpOdWxsIiwibnVsbFZhbHVlIiwiX2pudWxsIiwiaXNKTnVsbCIsIkpBcnJheSIsImpWYWx1ZXMiLCJfamFycmF5IiwianZhbCIsImlzSkFycmF5IiwicmVkdWNlIiwiYWNjIiwiY3VyciIsIlBhaXIiLCJhIiwiYiIsInJlc3VsdCIsIl9wYWlyIiwiU3ltYm9sIiwiaXRlcmF0b3IiLCJpc1BhaXIiLCJUcmlwbGUiLCJjIiwiX3RyaXBsZSIsImlzVHJpcGxlIiwicm93cyIsInJvdyIsImNvbCIsIl9wb3NpdGlvbiIsImZyb21UZXh0IiwidGV4dCIsInNwbGl0IiwibWFwIiwiaXNQb3NpdGlvbiIsImNoYXIiLCJOb3RoaW5nIiwibmV3UmVzdWx0VmFsdWUiLCJKdXN0IiwiZXJyIiwiaW5jclBvcyIsIm5lZWRSb3dJbmNyZW1lbnQiLCJsZW5ndGgiLCJyZXN0Iiwic2VsZiIsInJlc3RfaGVscGVyIiwiam9pbiIsIm5leHQiLCJpc05vdGhpbmciLCJjb25jYXQiLCJ4IiwieSIsIm1hdGNoZWQiLCJwYXJzZXJMYWJlbCIsImVycm9yTXNnIiwidmFsIl0sIm1hcHBpbmdzIjoiOzs7Ozs7WUFZZ0JBLE0sR0FBQUEsTTtZQWlHQUMsSyxHQUFBQSxLO1lBbURBQyxR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LGVBRkcsaUJBRUc7QUFDRix1QkFBTyxJQUFQO0FBQ0gsYUFKRTtBQUtIOUUsb0JBTEcsc0JBS1E7QUFDUCx1QkFBTyxRQUFQO0FBQ0g7QUFQRSxTQUFQO0FBU0giLCJmaWxlIjoiY2xhc3Nlcy5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7TWF5YmV9IGZyb20gJ21heWJlJztcblxuaW1wb3J0IHtcbiAgICBpc1BhaXIsXG59IGZyb20gJ3V0aWwnO1xuXG5jb25zdCB0b1N0cmluZyA9IEFycmF5LnByb3RvdHlwZS50b1N0cmluZztcblxuQXJyYXkucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiAnWycgKyB0b1N0cmluZy5hcHBseSh0aGlzKSArICddJztcbn07XG5cbmV4cG9ydCBmdW5jdGlvbiBKVmFsdWUoKSB7XG59XG5KVmFsdWUucHJvdG90eXBlLmlzSlZhbHVlID0gdHJ1ZTtcblxuZnVuY3Rpb24gSlN0cmluZyhzdHIpIHtcbiAgICByZXR1cm4gbmV3IF9qc3RyaW5nKHN0cik7XG59XG5cbmZ1bmN0aW9uIF9qc3RyaW5nKHN0cikge1xuICAgIGlmICh0eXBlb2Ygc3RyICE9PSAnc3RyaW5nJykgdGhyb3cgbmV3IEVycm9yKCdKU3RyaW5nOiBpbnZhbGlkIHZhbHVlJyk7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsICd2YWx1ZScsIHt2YWx1ZTogc3RyLCB3cml0YWJsZTogZmFsc2V9KTtcbn1cbl9qc3RyaW5nLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoSlZhbHVlLnByb3RvdHlwZSk7XG5fanN0cmluZy5wcm90b3R5cGUuaXNKU3RyaW5nID0gdHJ1ZTtcbl9qc3RyaW5nLnByb3RvdHlwZS50eXBlID0gJ2pzdHJpbmcnO1xuX2pzdHJpbmcucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiAnSlN0cmluZygnICsgdGhpcy52YWx1ZS50b1N0cmluZygpICsgJyknO1xufTtcblxuSlZhbHVlLkpTdHJpbmcgPSBKU3RyaW5nO1xuSlZhbHVlLnByb3RvdHlwZS5KU3RyaW5nID0gSlZhbHVlLkpTdHJpbmc7XG5cbmZ1bmN0aW9uIEpOdW1iZXIoZmxvYXQpIHtcbiAgICByZXR1cm4gbmV3IF9qbnVtYmVyKGZsb2F0KTtcbn1cblxuZnVuY3Rpb24gX2pudW1iZXIoZmxvYXQpIHtcbiAgICBpZiAodHlwZW9mIGZsb2F0ICE9PSAnbnVtYmVyJ1xuICAgICAgICB8fCBpc05hTihmbG9hdCkpIHRocm93IG5ldyBFcnJvcignSk51bWJlcjogaW52YWxpZCB2YWx1ZScpO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCAndmFsdWUnLCB7dmFsdWU6IGZsb2F0LCB3cml0YWJsZTogZmFsc2V9KTtcbn1cbl9qbnVtYmVyLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoSlZhbHVlLnByb3RvdHlwZSk7XG5fam51bWJlci5wcm90b3R5cGUuaXNKTnVtYmVyID0gdHJ1ZTtcbl9qbnVtYmVyLnByb3RvdHlwZS50eXBlID0gJ2pudW1iZXInO1xuX2pudW1iZXIucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiAnSk51bWJlcignICsgdGhpcy52YWx1ZS50b1N0cmluZygpICsgJyknO1xufTtcblxuSlZhbHVlLkpOdW1iZXIgPSBKTnVtYmVyO1xuSlZhbHVlLnByb3RvdHlwZS5KTnVtYmVyID0gSlZhbHVlLkpOdW1iZXI7XG5cbmZ1bmN0aW9uIEpCb29sKGJvb2wpIHtcbiAgICByZXR1cm4gbmV3IF9qYm9vbChib29sKTtcbn1cblxuZnVuY3Rpb24gX2pib29sKGJvb2wpIHtcbiAgICBpZiAodHlwZW9mIGJvb2wgIT09ICdib29sZWFuJykgdGhyb3cgbmV3IEVycm9yKCdKQm9vbDogaW52YWxpZCB2YWx1ZScpO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCAndmFsdWUnLCB7dmFsdWU6IGJvb2wsIHdyaXRhYmxlOiBmYWxzZX0pO1xufVxuX2pib29sLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoSlZhbHVlLnByb3RvdHlwZSk7XG5famJvb2wucHJvdG90eXBlLmlzSkJvb2wgPSB0cnVlO1xuX2pib29sLnByb3RvdHlwZS50eXBlID0gJ2pib29sJztcbl9qYm9vbC5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuICdKQm9vbCgnICsgdGhpcy52YWx1ZS50b1N0cmluZygpICsgJyknO1xufTtcblxuSlZhbHVlLkpCb29sID0gSkJvb2w7XG5KVmFsdWUucHJvdG90eXBlLkpCb29sID0gSlZhbHVlLkpCb29sO1xuXG5mdW5jdGlvbiBKTnVsbChudWxsVmFsdWUpIHtcbiAgICByZXR1cm4gbmV3IF9qbnVsbChudWxsVmFsdWUpO1xufVxuXG5mdW5jdGlvbiBfam51bGwobnVsbFZhbHVlKSB7XG4gICAgaWYgKG51bGxWYWx1ZSAhPT0gbnVsbCkgdGhyb3cgbmV3IEVycm9yKCdKTnVsbDogaW52YWxpZCB2YWx1ZScpO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCAndmFsdWUnLCB7dmFsdWU6IG51bGxWYWx1ZSwgd3JpdGFibGU6IGZhbHNlfSk7XG59XG5fam51bGwucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShKVmFsdWUucHJvdG90eXBlKTtcbl9qbnVsbC5wcm90b3R5cGUuaXNKTnVsbCA9IHRydWU7XG5fam51bGwucHJvdG90eXBlLnR5cGUgPSAnam51bGwnO1xuX2pudWxsLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gJ0pOdWxsKG51bGwpJztcbn07XG5cbkpWYWx1ZS5KTnVsbCA9IEpOdWxsO1xuSlZhbHVlLnByb3RvdHlwZS5KTnVsbCA9IEpWYWx1ZS5KTnVsbDtcblxuZnVuY3Rpb24gSkFycmF5KC4uLmpWYWx1ZXMpIHtcbiAgICByZXR1cm4gbmV3IF9qYXJyYXkoLi4ualZhbHVlcyk7XG59XG5cbi8vIFRPRE8gbWFrZSBpdCB3aXRoIGl0ZXJhdG9yIGFuZCBldmVyeXRoaW5nXG5mdW5jdGlvbiBfamFycmF5KC4uLmpWYWx1ZXMpIHtcbiAgICBpZiAoalZhbHVlcy5zb21lKGp2YWwgPT4gKCFqdmFsLmlzSlZhbHVlKSkpIHRocm93IG5ldyBFcnJvcignSkFycmF5OiBpbnZhbGlkIGNvbnRlbnQnKTtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgJ3ZhbHVlJywge3ZhbHVlOiBbLi4ualZhbHVlc10sIHdyaXRhYmxlOiBmYWxzZX0pO1xufVxuX2phcnJheS5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKEpWYWx1ZS5wcm90b3R5cGUpO1xuX2phcnJheS5wcm90b3R5cGUuaXNKQXJyYXkgPSB0cnVlO1xuX2phcnJheS5wcm90b3R5cGUudHlwZSA9ICdqYXJyYXknO1xuX2phcnJheS5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuICdKQXJyYXkoWycgKyB0aGlzLnZhbHVlLnJlZHVjZSgoYWNjLCBjdXJyKSA9PiBhY2MgKyBjdXJyICsgJywnLCAnJykgKyAnXSknO1xufTtcblxuSlZhbHVlLkpBcnJheSA9IEpBcnJheTtcbkpWYWx1ZS5wcm90b3R5cGUuSkFycmF5ID0gSlZhbHVlLkpBcnJheTtcblxuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbmV4cG9ydCBmdW5jdGlvbiBUdXBsZSgpIHtcbn1cblxuZnVuY3Rpb24gUGFpcihhLCBiKSB7XG4gICAgbGV0IHJlc3VsdCA9IG5ldyBfcGFpcihhLCBiKTtcbiAgICByZXN1bHRbU3ltYm9sLml0ZXJhdG9yXSA9IGZ1bmN0aW9uKigpIHtcbiAgICAgICAgeWllbGQgYTtcbiAgICAgICAgeWllbGQgYjtcbiAgICB9O1xuICAgIHJldHVybiByZXN1bHQ7XG59XG5QYWlyLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoVHVwbGUucHJvdG90eXBlKTtcblxuZnVuY3Rpb24gX3BhaXIoYSwgYikge1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCAwLCB7dmFsdWU6IGEsIHdyaXRhYmxlOiBmYWxzZX0pO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCAxLCB7dmFsdWU6IGIsIHdyaXRhYmxlOiBmYWxzZX0pO1xufVxuX3BhaXIucHJvdG90eXBlLmlzUGFpciA9IHRydWU7XG5fcGFpci5wcm90b3R5cGUudHlwZSA9ICdwYWlyJztcbl9wYWlyLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gJ1snICsgdGhpc1swXS50b1N0cmluZygpICsgJywnICsgdGhpc1sxXS50b1N0cmluZygpICsgJ10nO1xufTtcblxuZnVuY3Rpb24gVHJpcGxlKGEsIGIsIGMpIHtcbiAgICBsZXQgcmVzdWx0ID0gbmV3IF90cmlwbGUoYSwgYiwgYyk7XG4gICAgcmVzdWx0W1N5bWJvbC5pdGVyYXRvcl0gPSBmdW5jdGlvbiooKSB7XG4gICAgICAgIHlpZWxkIGE7XG4gICAgICAgIHlpZWxkIGI7XG4gICAgICAgIHlpZWxkIGM7XG4gICAgfTtcbiAgICByZXR1cm4gcmVzdWx0O1xufVxuVHJpcGxlLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoVHVwbGUucHJvdG90eXBlKTtcblxuZnVuY3Rpb24gX3RyaXBsZShhLCBiLCBjKSB7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsIDAsIHt2YWx1ZTogYSwgd3JpdGFibGU6IGZhbHNlfSk7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsIDEsIHt2YWx1ZTogYiwgd3JpdGFibGU6IGZhbHNlfSk7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsIDIsIHt2YWx1ZTogYywgd3JpdGFibGU6IGZhbHNlfSk7XG59XG5fdHJpcGxlLnByb3RvdHlwZS5pc1RyaXBsZSA9IHRydWU7XG5fdHJpcGxlLnByb3RvdHlwZS50eXBlID0gJ3RyaXBsZSc7XG5fdHJpcGxlLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gJ1snICsgdGhpc1swXS50b1N0cmluZygpICsgJywnICsgdGhpc1sxXS50b1N0cmluZygpICsgJywnICsgdGhpc1syXS50b1N0cmluZygpICsgJ10nO1xufTtcblxuVHVwbGUuUGFpciA9IFBhaXI7XG5UdXBsZS5wcm90b3R5cGUuUGFpciA9IFBhaXI7XG5cblR1cGxlLlRyaXBsZSA9IFRyaXBsZTtcblR1cGxlLnByb3RvdHlwZS5UcmlwbGUgPSBUcmlwbGU7XG5cbmV4cG9ydCBmdW5jdGlvbiBQb3NpdGlvbihyb3dzID0gW10sIHJvdyA9IDAsIGNvbCA9IDApIHtcbiAgICByZXR1cm4gbmV3IF9wb3NpdGlvbihyb3dzLCByb3csIGNvbCk7XG59XG5cbi8vUG9zaXRpb24ucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZSh7fSk7XG5Qb3NpdGlvbi5mcm9tVGV4dCA9IGZ1bmN0aW9uICh0ZXh0KSB7XG4gICAgY29uc3Qgcm93cyA9IHRleHQuc3BsaXQoJ1xcbicpXG4gICAgICAgIC5tYXAocm93ID0+IHJvdy5zcGxpdCgnJykpO1xuICAgIHJldHVybiBuZXcgX3Bvc2l0aW9uKHJvd3MsIDAsIDApO1xufTtcblxuZnVuY3Rpb24gX3Bvc2l0aW9uKHJvd3MsIHJvdywgY29sKSB7XG4gICAgdGhpcy5yb3dzID0gcm93cztcbiAgICB0aGlzLnJvdyA9IHJvdztcbiAgICB0aGlzLmNvbCA9IGNvbDtcbn1cblxuX3Bvc2l0aW9uLnByb3RvdHlwZS5pc1Bvc2l0aW9uID0gdHJ1ZTtcbl9wb3NpdGlvbi5wcm90b3R5cGUuY2hhciA9IGZ1bmN0aW9uICgpIHtcbiAgICBsZXQgcmVzdWx0ID0gTWF5YmUuTm90aGluZygpO1xuICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IG5ld1Jlc3VsdFZhbHVlID0gdGhpcy5yb3dzW3RoaXMucm93XVt0aGlzLmNvbF07XG4gICAgICAgIGlmICh0eXBlb2YgbmV3UmVzdWx0VmFsdWUgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICByZXN1bHQgPSBNYXliZS5KdXN0KG5ld1Jlc3VsdFZhbHVlKTtcbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGVycikge1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xufTtcbl9wb3NpdGlvbi5wcm90b3R5cGUuaW5jclBvcyA9IGZ1bmN0aW9uICgpIHtcbiAgICBjb25zdCBuZWVkUm93SW5jcmVtZW50ID0gKHRoaXMuY29sID09PSB0aGlzLnJvd3NbdGhpcy5yb3ddLmxlbmd0aCAtIDEpO1xuICAgIHJldHVybiBQb3NpdGlvbihcbiAgICAgICAgdGhpcy5yb3dzLFxuICAgICAgICAobmVlZFJvd0luY3JlbWVudCA/IHRoaXMucm93ICsgMSA6IHRoaXMucm93KSxcbiAgICAgICAgKG5lZWRSb3dJbmNyZW1lbnQgPyAwIDogdGhpcy5jb2wgKyAxKVxuICAgICk7XG59O1xuX3Bvc2l0aW9uLnByb3RvdHlwZS5yZXN0ID0gZnVuY3Rpb24gKCkge1xuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuICAgIHJldHVybiByZXN0X2hlbHBlcigpLmpvaW4oJycpO1xuICAgIGZ1bmN0aW9uIHJlc3RfaGVscGVyKCkge1xuICAgICAgICBjb25zdCBuZXh0ID0gc2VsZi5jaGFyKCk7XG4gICAgICAgIGlmIChuZXh0LmlzTm90aGluZykgcmV0dXJuIFtdO1xuICAgICAgICByZXR1cm4gW25leHQudmFsdWVdLmNvbmNhdChzZWxmLmluY3JQb3MoKS5yZXN0KCkpO1xuICAgIH1cbn07XG5fcG9zaXRpb24ucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiAncm93PScgKyB0aGlzLnJvd1xuICAgICAgICArICc7Y29sPScgKyB0aGlzLmNvbFxuICAgICAgICArICc7cmVzdD0nICsgdGhpcy5yZXN0KCk7XG59O1xuXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBkZXByZWNhdGVkIGluIGZhdm91ciBvZiBUdXBsZSwgZGF0YS5NYXliZSBhbmQgZGF0YS5WYWxpZGF0aW9uXG5leHBvcnQgZnVuY3Rpb24gcGFpcih4LCB5KSB7XG4gICAgbGV0IHJlc3VsdCA9IFt4LCB5XTtcbiAgICByZXN1bHQudHlwZSA9ICdwYWlyJztcbiAgICByZXN1bHQudG9TdHJpbmcgPSAoKSA9PiB7XG4gICAgICAgIHJldHVybiAnWydcbiAgICAgICAgICAgICsgKGlzUGFpcihyZXN1bHRbMF0pID8gcmVzdWx0WzBdLnRvU3RyaW5nKCkgOiByZXN1bHRbMF0pXG4gICAgICAgICAgICArICcsJ1xuICAgICAgICAgICAgKyAoaXNQYWlyKHJlc3VsdFsxXSkgPyByZXN1bHRbMV0udG9TdHJpbmcoKSA6IHJlc3VsdFsxXSlcbiAgICAgICAgICAgICsgJ10nO1xuICAgIH07XG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHN1Y2Nlc3MobWF0Y2hlZCwgc3RyKSB7XG4gICAgbGV0IHJlc3VsdCA9IHBhaXIobWF0Y2hlZCwgc3RyKTtcbiAgICByZXN1bHQudHlwZSA9ICdzdWNjZXNzJztcbiAgICByZXR1cm4gcmVzdWx0O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZmFpbHVyZShwYXJzZXJMYWJlbCwgZXJyb3JNc2cpIHtcbiAgICBsZXQgcmVzdWx0ID0gcGFpcihwYXJzZXJMYWJlbCwgZXJyb3JNc2cpO1xuICAgIHJlc3VsdC50eXBlID0gJ2ZhaWx1cmUnO1xuICAgIHJldHVybiByZXN1bHQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzb21lKHZhbHVlKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgdHlwZTogJ3NvbWUnLFxuICAgICAgICB2YWwoKSB7XG4gICAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgIH0sXG4gICAgICAgIHRvU3RyaW5nKCkge1xuICAgICAgICAgICAgcmV0dXJuIGBzb21lKCR7dmFsdWV9KWA7XG4gICAgICAgIH1cbiAgICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbm9uZSgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICB0eXBlOiAnbm9uZScsXG4gICAgICAgIHZhbCgpIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9LFxuICAgICAgICB0b1N0cmluZygpIHtcbiAgICAgICAgICAgIHJldHVybiAnbm9uZSgpJztcbiAgICAgICAgfVxuICAgIH07XG59XG4iXX0=