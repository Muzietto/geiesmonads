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
    _jnull.prototype.type = 'jbool';
    _jnull.prototype.toString = function () {
        return 'JNull(null)';
    };

    JValue.JNull = JNull;
    JValue.prototype.JNull = JValue.JNull;

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2pzL2NsYXNzZXMuanMiXSwibmFtZXMiOlsiSlZhbHVlIiwiVHVwbGUiLCJQb3NpdGlvbiIsInBhaXIiLCJzdWNjZXNzIiwiZmFpbHVyZSIsInNvbWUiLCJub25lIiwidG9TdHJpbmciLCJBcnJheSIsInByb3RvdHlwZSIsImFwcGx5IiwiaXNKVmFsdWUiLCJKU3RyaW5nIiwic3RyIiwiX2pzdHJpbmciLCJFcnJvciIsIk9iamVjdCIsImRlZmluZVByb3BlcnR5IiwidmFsdWUiLCJ3cml0YWJsZSIsImNyZWF0ZSIsImlzSlN0cmluZyIsInR5cGUiLCJKTnVtYmVyIiwiZmxvYXQiLCJfam51bWJlciIsImlzTmFOIiwiaXNKTnVtYmVyIiwiSkJvb2wiLCJib29sIiwiX2pib29sIiwiaXNKQm9vbCIsIkpOdWxsIiwibnVsbFZhbHVlIiwiX2pudWxsIiwiaXNKTnVsbCIsIlBhaXIiLCJhIiwiYiIsInJlc3VsdCIsIl9wYWlyIiwiU3ltYm9sIiwiaXRlcmF0b3IiLCJpc1BhaXIiLCJUcmlwbGUiLCJjIiwiX3RyaXBsZSIsImlzVHJpcGxlIiwicm93cyIsInJvdyIsImNvbCIsIl9wb3NpdGlvbiIsImZyb21UZXh0IiwidGV4dCIsInNwbGl0IiwibWFwIiwiaXNQb3NpdGlvbiIsImNoYXIiLCJOb3RoaW5nIiwibmV3UmVzdWx0VmFsdWUiLCJKdXN0IiwiZXJyIiwiaW5jclBvcyIsIm5lZWRSb3dJbmNyZW1lbnQiLCJsZW5ndGgiLCJyZXN0Iiwic2VsZiIsInJlc3RfaGVscGVyIiwiam9pbiIsIm5leHQiLCJpc05vdGhpbmciLCJjb25jYXQiLCJ4IiwieSIsIm1hdGNoZWQiLCJwYXJzZXJMYWJlbCIsImVycm9yTXNnIiwidmFsIl0sIm1hcHBpbmdzIjoiOzs7Ozs7WUFZZ0JBLE0sR0FBQUEsTTtZQThFQUMsSyxHQUFBQSxLO1lBbURBQyxRLEdBQUFBLFE7WUFzREFDLEksR0FBQUEsSTtZQWFBQyxPLEdBQUFBLE87WUFNQUMsTyxHQUFBQSxPO1lBTUFDLEksR0FB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ZUFBTztBQUNIZ0Isa0JBQU0sTUFESDtBQUVIdUQsZUFGRyxpQkFFRztBQUNGLHVCQUFPLElBQVA7QUFDSCxhQUpFO0FBS0h0RSxvQkFMRyxzQkFLUTtBQUNQLHVCQUFPLFFBQVA7QUFDSDtBQVBFLFNBQVA7QUFTSCIsImZpbGUiOiJjbGFzc2VzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtNYXliZX0gZnJvbSAnbWF5YmUnO1xuXG5pbXBvcnQge1xuICAgIGlzUGFpcixcbn0gZnJvbSAndXRpbCc7XG5cbmNvbnN0IHRvU3RyaW5nID0gQXJyYXkucHJvdG90eXBlLnRvU3RyaW5nO1xuXG5BcnJheS5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuICdbJyArIHRvU3RyaW5nLmFwcGx5KHRoaXMpICsgJ10nO1xufTtcblxuZXhwb3J0IGZ1bmN0aW9uIEpWYWx1ZSgpIHtcbn1cbkpWYWx1ZS5wcm90b3R5cGUuaXNKVmFsdWUgPSB0cnVlO1xuXG5mdW5jdGlvbiBKU3RyaW5nKHN0cikge1xuICAgIHJldHVybiBuZXcgX2pzdHJpbmcoc3RyKTtcbn1cblxuZnVuY3Rpb24gX2pzdHJpbmcoc3RyKSB7XG4gICAgaWYgKHR5cGVvZiBzdHIgIT09ICdzdHJpbmcnKSB0aHJvdyBuZXcgRXJyb3IoJ0pTdHJpbmc6IGludmFsaWQgdmFsdWUnKTtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgJ3ZhbHVlJywge3ZhbHVlOiBzdHIsIHdyaXRhYmxlOiBmYWxzZX0pO1xufVxuX2pzdHJpbmcucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShKVmFsdWUucHJvdG90eXBlKTtcbl9qc3RyaW5nLnByb3RvdHlwZS5pc0pTdHJpbmcgPSB0cnVlO1xuX2pzdHJpbmcucHJvdG90eXBlLnR5cGUgPSAnanN0cmluZyc7XG5fanN0cmluZy5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuICdKU3RyaW5nKCcgKyB0aGlzLnZhbHVlLnRvU3RyaW5nKCkgKyAnKSc7XG59O1xuXG5KVmFsdWUuSlN0cmluZyA9IEpTdHJpbmc7XG5KVmFsdWUucHJvdG90eXBlLkpTdHJpbmcgPSBKVmFsdWUuSlN0cmluZztcblxuZnVuY3Rpb24gSk51bWJlcihmbG9hdCkge1xuICAgIHJldHVybiBuZXcgX2pudW1iZXIoZmxvYXQpO1xufVxuXG5mdW5jdGlvbiBfam51bWJlcihmbG9hdCkge1xuICAgIGlmICh0eXBlb2YgZmxvYXQgIT09ICdudW1iZXInXG4gICAgICAgIHx8IGlzTmFOKGZsb2F0KSkgdGhyb3cgbmV3IEVycm9yKCdKTnVtYmVyOiBpbnZhbGlkIHZhbHVlJyk7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsICd2YWx1ZScsIHt2YWx1ZTogZmxvYXQsIHdyaXRhYmxlOiBmYWxzZX0pO1xufVxuX2pudW1iZXIucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShKVmFsdWUucHJvdG90eXBlKTtcbl9qbnVtYmVyLnByb3RvdHlwZS5pc0pOdW1iZXIgPSB0cnVlO1xuX2pudW1iZXIucHJvdG90eXBlLnR5cGUgPSAnam51bWJlcic7XG5fam51bWJlci5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuICdKTnVtYmVyKCcgKyB0aGlzLnZhbHVlLnRvU3RyaW5nKCkgKyAnKSc7XG59O1xuXG5KVmFsdWUuSk51bWJlciA9IEpOdW1iZXI7XG5KVmFsdWUucHJvdG90eXBlLkpOdW1iZXIgPSBKVmFsdWUuSk51bWJlcjtcblxuZnVuY3Rpb24gSkJvb2woYm9vbCkge1xuICAgIHJldHVybiBuZXcgX2pib29sKGJvb2wpO1xufVxuXG5mdW5jdGlvbiBfamJvb2woYm9vbCkge1xuICAgIGlmICh0eXBlb2YgYm9vbCAhPT0gJ2Jvb2xlYW4nKSB0aHJvdyBuZXcgRXJyb3IoJ0pCb29sOiBpbnZhbGlkIHZhbHVlJyk7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsICd2YWx1ZScsIHt2YWx1ZTogYm9vbCwgd3JpdGFibGU6IGZhbHNlfSk7XG59XG5famJvb2wucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShKVmFsdWUucHJvdG90eXBlKTtcbl9qYm9vbC5wcm90b3R5cGUuaXNKQm9vbCA9IHRydWU7XG5famJvb2wucHJvdG90eXBlLnR5cGUgPSAnamJvb2wnO1xuX2pib29sLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gJ0pCb29sKCcgKyB0aGlzLnZhbHVlLnRvU3RyaW5nKCkgKyAnKSc7XG59O1xuXG5KVmFsdWUuSkJvb2wgPSBKQm9vbDtcbkpWYWx1ZS5wcm90b3R5cGUuSkJvb2wgPSBKVmFsdWUuSkJvb2w7XG5cbmZ1bmN0aW9uIEpOdWxsKG51bGxWYWx1ZSkge1xuICAgIHJldHVybiBuZXcgX2pudWxsKG51bGxWYWx1ZSk7XG59XG5cbmZ1bmN0aW9uIF9qbnVsbChudWxsVmFsdWUpIHtcbiAgICBpZiAobnVsbFZhbHVlICE9PSBudWxsKSB0aHJvdyBuZXcgRXJyb3IoJ0pOdWxsOiBpbnZhbGlkIHZhbHVlJyk7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsICd2YWx1ZScsIHt2YWx1ZTogbnVsbFZhbHVlLCB3cml0YWJsZTogZmFsc2V9KTtcbn1cbl9qbnVsbC5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKEpWYWx1ZS5wcm90b3R5cGUpO1xuX2pudWxsLnByb3RvdHlwZS5pc0pOdWxsID0gdHJ1ZTtcbl9qbnVsbC5wcm90b3R5cGUudHlwZSA9ICdqYm9vbCc7XG5fam51bGwucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiAnSk51bGwobnVsbCknO1xufTtcblxuSlZhbHVlLkpOdWxsID0gSk51bGw7XG5KVmFsdWUucHJvdG90eXBlLkpOdWxsID0gSlZhbHVlLkpOdWxsO1xuXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuZXhwb3J0IGZ1bmN0aW9uIFR1cGxlKCkge1xufVxuXG5mdW5jdGlvbiBQYWlyKGEsIGIpIHtcbiAgICBsZXQgcmVzdWx0ID0gbmV3IF9wYWlyKGEsIGIpO1xuICAgIHJlc3VsdFtTeW1ib2wuaXRlcmF0b3JdID0gZnVuY3Rpb24qKCkge1xuICAgICAgICB5aWVsZCBhO1xuICAgICAgICB5aWVsZCBiO1xuICAgIH07XG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cblBhaXIucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShUdXBsZS5wcm90b3R5cGUpO1xuXG5mdW5jdGlvbiBfcGFpcihhLCBiKSB7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsIDAsIHt2YWx1ZTogYSwgd3JpdGFibGU6IGZhbHNlfSk7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsIDEsIHt2YWx1ZTogYiwgd3JpdGFibGU6IGZhbHNlfSk7XG59XG5fcGFpci5wcm90b3R5cGUuaXNQYWlyID0gdHJ1ZTtcbl9wYWlyLnByb3RvdHlwZS50eXBlID0gJ3BhaXInO1xuX3BhaXIucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiAnWycgKyB0aGlzWzBdLnRvU3RyaW5nKCkgKyAnLCcgKyB0aGlzWzFdLnRvU3RyaW5nKCkgKyAnXSc7XG59O1xuXG5mdW5jdGlvbiBUcmlwbGUoYSwgYiwgYykge1xuICAgIGxldCByZXN1bHQgPSBuZXcgX3RyaXBsZShhLCBiLCBjKTtcbiAgICByZXN1bHRbU3ltYm9sLml0ZXJhdG9yXSA9IGZ1bmN0aW9uKigpIHtcbiAgICAgICAgeWllbGQgYTtcbiAgICAgICAgeWllbGQgYjtcbiAgICAgICAgeWllbGQgYztcbiAgICB9O1xuICAgIHJldHVybiByZXN1bHQ7XG59XG5UcmlwbGUucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShUdXBsZS5wcm90b3R5cGUpO1xuXG5mdW5jdGlvbiBfdHJpcGxlKGEsIGIsIGMpIHtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgMCwge3ZhbHVlOiBhLCB3cml0YWJsZTogZmFsc2V9KTtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgMSwge3ZhbHVlOiBiLCB3cml0YWJsZTogZmFsc2V9KTtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgMiwge3ZhbHVlOiBjLCB3cml0YWJsZTogZmFsc2V9KTtcbn1cbl90cmlwbGUucHJvdG90eXBlLmlzVHJpcGxlID0gdHJ1ZTtcbl90cmlwbGUucHJvdG90eXBlLnR5cGUgPSAndHJpcGxlJztcbl90cmlwbGUucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiAnWycgKyB0aGlzWzBdLnRvU3RyaW5nKCkgKyAnLCcgKyB0aGlzWzFdLnRvU3RyaW5nKCkgKyAnLCcgKyB0aGlzWzJdLnRvU3RyaW5nKCkgKyAnXSc7XG59O1xuXG5UdXBsZS5QYWlyID0gUGFpcjtcblR1cGxlLnByb3RvdHlwZS5QYWlyID0gUGFpcjtcblxuVHVwbGUuVHJpcGxlID0gVHJpcGxlO1xuVHVwbGUucHJvdG90eXBlLlRyaXBsZSA9IFRyaXBsZTtcblxuZXhwb3J0IGZ1bmN0aW9uIFBvc2l0aW9uKHJvd3MgPSBbXSwgcm93ID0gMCwgY29sID0gMCkge1xuICAgIHJldHVybiBuZXcgX3Bvc2l0aW9uKHJvd3MsIHJvdywgY29sKTtcbn1cblxuLy9Qb3NpdGlvbi5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKHt9KTtcblBvc2l0aW9uLmZyb21UZXh0ID0gZnVuY3Rpb24gKHRleHQpIHtcbiAgICBjb25zdCByb3dzID0gdGV4dC5zcGxpdCgnXFxuJylcbiAgICAgICAgLm1hcChyb3cgPT4gcm93LnNwbGl0KCcnKSk7XG4gICAgcmV0dXJuIG5ldyBfcG9zaXRpb24ocm93cywgMCwgMCk7XG59O1xuXG5mdW5jdGlvbiBfcG9zaXRpb24ocm93cywgcm93LCBjb2wpIHtcbiAgICB0aGlzLnJvd3MgPSByb3dzO1xuICAgIHRoaXMucm93ID0gcm93O1xuICAgIHRoaXMuY29sID0gY29sO1xufVxuXG5fcG9zaXRpb24ucHJvdG90eXBlLmlzUG9zaXRpb24gPSB0cnVlO1xuX3Bvc2l0aW9uLnByb3RvdHlwZS5jaGFyID0gZnVuY3Rpb24gKCkge1xuICAgIGxldCByZXN1bHQgPSBNYXliZS5Ob3RoaW5nKCk7XG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgbmV3UmVzdWx0VmFsdWUgPSB0aGlzLnJvd3NbdGhpcy5yb3ddW3RoaXMuY29sXTtcbiAgICAgICAgaWYgKHR5cGVvZiBuZXdSZXN1bHRWYWx1ZSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgIHJlc3VsdCA9IE1heWJlLkp1c3QobmV3UmVzdWx0VmFsdWUpO1xuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG59O1xuX3Bvc2l0aW9uLnByb3RvdHlwZS5pbmNyUG9zID0gZnVuY3Rpb24gKCkge1xuICAgIGNvbnN0IG5lZWRSb3dJbmNyZW1lbnQgPSAodGhpcy5jb2wgPT09IHRoaXMucm93c1t0aGlzLnJvd10ubGVuZ3RoIC0gMSk7XG4gICAgcmV0dXJuIFBvc2l0aW9uKFxuICAgICAgICB0aGlzLnJvd3MsXG4gICAgICAgIChuZWVkUm93SW5jcmVtZW50ID8gdGhpcy5yb3cgKyAxIDogdGhpcy5yb3cpLFxuICAgICAgICAobmVlZFJvd0luY3JlbWVudCA/IDAgOiB0aGlzLmNvbCArIDEpXG4gICAgKTtcbn07XG5fcG9zaXRpb24ucHJvdG90eXBlLnJlc3QgPSBmdW5jdGlvbiAoKSB7XG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XG4gICAgcmV0dXJuIHJlc3RfaGVscGVyKCkuam9pbignJyk7XG4gICAgZnVuY3Rpb24gcmVzdF9oZWxwZXIoKSB7XG4gICAgICAgIGNvbnN0IG5leHQgPSBzZWxmLmNoYXIoKTtcbiAgICAgICAgaWYgKG5leHQuaXNOb3RoaW5nKSByZXR1cm4gW107XG4gICAgICAgIHJldHVybiBbbmV4dC52YWx1ZV0uY29uY2F0KHNlbGYuaW5jclBvcygpLnJlc3QoKSk7XG4gICAgfVxufTtcbl9wb3NpdGlvbi5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuICdyb3c9JyArIHRoaXMucm93XG4gICAgICAgICsgJztjb2w9JyArIHRoaXMuY29sXG4gICAgICAgICsgJztyZXN0PScgKyB0aGlzLnJlc3QoKTtcbn07XG5cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIGRlcHJlY2F0ZWQgaW4gZmF2b3VyIG9mIFR1cGxlLCBkYXRhLk1heWJlIGFuZCBkYXRhLlZhbGlkYXRpb25cbmV4cG9ydCBmdW5jdGlvbiBwYWlyKHgsIHkpIHtcbiAgICBsZXQgcmVzdWx0ID0gW3gsIHldO1xuICAgIHJlc3VsdC50eXBlID0gJ3BhaXInO1xuICAgIHJlc3VsdC50b1N0cmluZyA9ICgpID0+IHtcbiAgICAgICAgcmV0dXJuICdbJ1xuICAgICAgICAgICAgKyAoaXNQYWlyKHJlc3VsdFswXSkgPyByZXN1bHRbMF0udG9TdHJpbmcoKSA6IHJlc3VsdFswXSlcbiAgICAgICAgICAgICsgJywnXG4gICAgICAgICAgICArIChpc1BhaXIocmVzdWx0WzFdKSA/IHJlc3VsdFsxXS50b1N0cmluZygpIDogcmVzdWx0WzFdKVxuICAgICAgICAgICAgKyAnXSc7XG4gICAgfTtcbiAgICByZXR1cm4gcmVzdWx0O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc3VjY2VzcyhtYXRjaGVkLCBzdHIpIHtcbiAgICBsZXQgcmVzdWx0ID0gcGFpcihtYXRjaGVkLCBzdHIpO1xuICAgIHJlc3VsdC50eXBlID0gJ3N1Y2Nlc3MnO1xuICAgIHJldHVybiByZXN1bHQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBmYWlsdXJlKHBhcnNlckxhYmVsLCBlcnJvck1zZykge1xuICAgIGxldCByZXN1bHQgPSBwYWlyKHBhcnNlckxhYmVsLCBlcnJvck1zZyk7XG4gICAgcmVzdWx0LnR5cGUgPSAnZmFpbHVyZSc7XG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNvbWUodmFsdWUpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICB0eXBlOiAnc29tZScsXG4gICAgICAgIHZhbCgpIHtcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgICAgfSxcbiAgICAgICAgdG9TdHJpbmcoKSB7XG4gICAgICAgICAgICByZXR1cm4gYHNvbWUoJHt2YWx1ZX0pYDtcbiAgICAgICAgfVxuICAgIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBub25lKCkge1xuICAgIHJldHVybiB7XG4gICAgICAgIHR5cGU6ICdub25lJyxcbiAgICAgICAgdmFsKCkge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH0sXG4gICAgICAgIHRvU3RyaW5nKCkge1xuICAgICAgICAgICAgcmV0dXJuICdub25lKCknO1xuICAgICAgICB9XG4gICAgfTtcbn1cbiJdfQ==