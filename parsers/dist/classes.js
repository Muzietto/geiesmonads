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
    JString.prototype = Object.create(JValue.prototype);

    function _jstring(str) {
        if (typeof str !== 'string') throw new Error('JString: invalid value');
        Object.defineProperty(this, 'value', { value: str, writable: false });
    }
    _jstring.prototype.isJString = true;
    _jstring.prototype.type = 'jstring';
    _jstring.prototype.toString = function () {
        return 'JString ' + this.value.toString();
    };

    JValue.JString = JString;
    JValue.prototype.JString = JValue.JString;

    function JNumber(float) {
        return new _jnumber(float);
    }
    JNumber.prototype = Object.create(JValue.prototype);

    function _jnumber(float) {
        if (typeof float !== 'number' || isNaN(float)) throw new Error('JNumber: invalid value');
        Object.defineProperty(this, 'value', { value: float, writable: false });
    }
    _jnumber.prototype.isJNumber = true;
    _jnumber.prototype.type = 'jnumber';
    _jnumber.prototype.toString = function () {
        return 'JNumber ' + this.value.toString();
    };

    JValue.JNumber = JNumber;
    JValue.prototype.JNumber = JValue.JNumber;

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2pzL2NsYXNzZXMuanMiXSwibmFtZXMiOlsiSlZhbHVlIiwiVHVwbGUiLCJQb3NpdGlvbiIsInBhaXIiLCJzdWNjZXNzIiwiZmFpbHVyZSIsInNvbWUiLCJub25lIiwidG9TdHJpbmciLCJBcnJheSIsInByb3RvdHlwZSIsImFwcGx5IiwiaXNKVmFsdWUiLCJKU3RyaW5nIiwic3RyIiwiX2pzdHJpbmciLCJPYmplY3QiLCJjcmVhdGUiLCJFcnJvciIsImRlZmluZVByb3BlcnR5IiwidmFsdWUiLCJ3cml0YWJsZSIsImlzSlN0cmluZyIsInR5cGUiLCJKTnVtYmVyIiwiZmxvYXQiLCJfam51bWJlciIsImlzTmFOIiwiaXNKTnVtYmVyIiwiUGFpciIsImEiLCJiIiwicmVzdWx0IiwiX3BhaXIiLCJTeW1ib2wiLCJpdGVyYXRvciIsImlzUGFpciIsIlRyaXBsZSIsImMiLCJfdHJpcGxlIiwiaXNUcmlwbGUiLCJyb3dzIiwicm93IiwiY29sIiwiX3Bvc2l0aW9uIiwiZnJvbVRleHQiLCJ0ZXh0Iiwic3BsaXQiLCJtYXAiLCJpc1Bvc2l0aW9uIiwiY2hhciIsIk5vdGhpbmciLCJuZXdSZXN1bHRWYWx1ZSIsIkp1c3QiLCJlcnIiLCJpbmNyUG9zIiwibmVlZFJvd0luY3JlbWVudCIsImxlbmd0aCIsInJlc3QiLCJzZWxmIiwicmVzdF9oZWxwZXIiLCJqb2luIiwibmV4dCIsImlzTm90aGluZyIsImNvbmNhdCIsIngiLCJ5IiwibWF0Y2hlZCIsInBhcnNlckxhYmVsIiwiZXJyb3JNc2ciLCJ2YWwiXSwibWFwcGluZ3MiOiI7Ozs7OztZQVlnQkEsTSxHQUFBQSxNO1lBMENBQyxLLEdBQUFBLEs7WUFtREFDLFEsR0FBQUEsUTtZQXNEQUMsSSxHQUFBQSxJO1lBYUFDLE8sR0FBQUEsTztZQU1BQyxPLEdBQUFBLE87WUFNQUMsSSxHQUFBQSxJO1lBWUFDLEksR0FBQUEsSTs7O0FBOUxoQixRQUFNQyxXQUFXQyxNQUFNQyxTQUFOLENBQWdCRixRQUFqQzs7QUFFQUMs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QVA7QUFDSDs7QUFFTSxhQUFTNUIsT0FBVCxDQUFpQitELE9BQWpCLEVBQTBCckQsR0FBMUIsRUFBK0I7QUFDbEMsWUFBSWtCLFNBQVM3QixLQUFLZ0UsT0FBTCxFQUFjckQsR0FBZCxDQUFiO0FBQ0FrQixlQUFPVCxJQUFQLEdBQWMsU0FBZDtBQUNBLGVBQU9TLE1BQVA7QUFDSDs7QUFFTSxhQUFTM0IsT0FBVCxDQUFpQitELFdBQWpCLEVBQThCQyxRQUE5QixFQUF3QztBQUMzQyxZQUFJckMsU0FBUzdCLEtBQUtpRSxXQUFMLEVBQWtCQyxRQUFsQixDQUFiO0FBQ0FyQyxlQUFPVCxJQUFQLEdBQWMsU0FBZDtBQUNBLGVBQU9TLE1BQVA7QUFDSDs7QUFFTSxhQUFTMUIsSUFBVCxDQUFjYyxLQUFkLEVBQXFCO0FBQ3hCLGVBQU87QUFDSEcsa0JBQU0sTUFESDtBQUVIK0MsZUFGRyxpQkFFRztBQUNGLHVCQUFPbEQsS0FBUDtBQUNILGFBSkU7QUFLSFosb0JBTEcsc0JBS1E7QUFDUCxpQ0FBZVksS0FBZjtBQUNIO0FBUEUsU0FBUDtBQVNIOztBQUVNLGFBQVNiLElBQVQsR0FBZ0I7QUFDbkIsZUFBTztBQUNIZ0Isa0JBQU0sTUFESDtBQUVIK0MsZUFGRyxpQkFFRztBQUNGLHVCQUFPLElBQVA7QUFDSCxhQUpFO0FBS0g5RCxvQkFMRyxzQkFLUTtBQUNQLHVCQUFPLFFBQVA7QUFDSDtBQVBFLFNBQVA7QUFTSCIsImZpbGUiOiJjbGFzc2VzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtNYXliZX0gZnJvbSAnbWF5YmUnO1xuXG5pbXBvcnQge1xuICAgIGlzUGFpcixcbn0gZnJvbSAndXRpbCc7XG5cbmNvbnN0IHRvU3RyaW5nID0gQXJyYXkucHJvdG90eXBlLnRvU3RyaW5nO1xuXG5BcnJheS5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuICdbJyArIHRvU3RyaW5nLmFwcGx5KHRoaXMpICsgJ10nO1xufTtcblxuZXhwb3J0IGZ1bmN0aW9uIEpWYWx1ZSgpIHtcbn1cbkpWYWx1ZS5wcm90b3R5cGUuaXNKVmFsdWUgPSB0cnVlO1xuXG5mdW5jdGlvbiBKU3RyaW5nKHN0cikge1xuICAgIHJldHVybiBuZXcgX2pzdHJpbmcoc3RyKTtcbn1cbkpTdHJpbmcucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShKVmFsdWUucHJvdG90eXBlKTtcblxuZnVuY3Rpb24gX2pzdHJpbmcoc3RyKSB7XG4gICAgaWYgKHR5cGVvZiBzdHIgIT09ICdzdHJpbmcnKSB0aHJvdyBuZXcgRXJyb3IoJ0pTdHJpbmc6IGludmFsaWQgdmFsdWUnKTtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgJ3ZhbHVlJywge3ZhbHVlOiBzdHIsIHdyaXRhYmxlOiBmYWxzZX0pO1xufVxuX2pzdHJpbmcucHJvdG90eXBlLmlzSlN0cmluZyA9IHRydWU7XG5fanN0cmluZy5wcm90b3R5cGUudHlwZSA9ICdqc3RyaW5nJztcbl9qc3RyaW5nLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gJ0pTdHJpbmcgJyArIHRoaXMudmFsdWUudG9TdHJpbmcoKTtcbn07XG5cbkpWYWx1ZS5KU3RyaW5nID0gSlN0cmluZztcbkpWYWx1ZS5wcm90b3R5cGUuSlN0cmluZyA9IEpWYWx1ZS5KU3RyaW5nO1xuXG5mdW5jdGlvbiBKTnVtYmVyKGZsb2F0KSB7XG4gICAgcmV0dXJuIG5ldyBfam51bWJlcihmbG9hdCk7XG59XG5KTnVtYmVyLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoSlZhbHVlLnByb3RvdHlwZSk7XG5cbmZ1bmN0aW9uIF9qbnVtYmVyKGZsb2F0KSB7XG4gICAgaWYgKHR5cGVvZiBmbG9hdCAhPT0gJ251bWJlcidcbiAgICAgICAgfHwgaXNOYU4oZmxvYXQpKSB0aHJvdyBuZXcgRXJyb3IoJ0pOdW1iZXI6IGludmFsaWQgdmFsdWUnKTtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgJ3ZhbHVlJywge3ZhbHVlOiBmbG9hdCwgd3JpdGFibGU6IGZhbHNlfSk7XG59XG5fam51bWJlci5wcm90b3R5cGUuaXNKTnVtYmVyID0gdHJ1ZTtcbl9qbnVtYmVyLnByb3RvdHlwZS50eXBlID0gJ2pudW1iZXInO1xuX2pudW1iZXIucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiAnSk51bWJlciAnICsgdGhpcy52YWx1ZS50b1N0cmluZygpO1xufTtcblxuSlZhbHVlLkpOdW1iZXIgPSBKTnVtYmVyO1xuSlZhbHVlLnByb3RvdHlwZS5KTnVtYmVyID0gSlZhbHVlLkpOdW1iZXI7XG5cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5leHBvcnQgZnVuY3Rpb24gVHVwbGUoKSB7XG59XG5cbmZ1bmN0aW9uIFBhaXIoYSwgYikge1xuICAgIGxldCByZXN1bHQgPSBuZXcgX3BhaXIoYSwgYik7XG4gICAgcmVzdWx0W1N5bWJvbC5pdGVyYXRvcl0gPSBmdW5jdGlvbiooKSB7XG4gICAgICAgIHlpZWxkIGE7XG4gICAgICAgIHlpZWxkIGI7XG4gICAgfTtcbiAgICByZXR1cm4gcmVzdWx0O1xufVxuUGFpci5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFR1cGxlLnByb3RvdHlwZSk7XG5cbmZ1bmN0aW9uIF9wYWlyKGEsIGIpIHtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgMCwge3ZhbHVlOiBhLCB3cml0YWJsZTogZmFsc2V9KTtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgMSwge3ZhbHVlOiBiLCB3cml0YWJsZTogZmFsc2V9KTtcbn1cbl9wYWlyLnByb3RvdHlwZS5pc1BhaXIgPSB0cnVlO1xuX3BhaXIucHJvdG90eXBlLnR5cGUgPSAncGFpcic7XG5fcGFpci5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuICdbJyArIHRoaXNbMF0udG9TdHJpbmcoKSArICcsJyArIHRoaXNbMV0udG9TdHJpbmcoKSArICddJztcbn07XG5cbmZ1bmN0aW9uIFRyaXBsZShhLCBiLCBjKSB7XG4gICAgbGV0IHJlc3VsdCA9IG5ldyBfdHJpcGxlKGEsIGIsIGMpO1xuICAgIHJlc3VsdFtTeW1ib2wuaXRlcmF0b3JdID0gZnVuY3Rpb24qKCkge1xuICAgICAgICB5aWVsZCBhO1xuICAgICAgICB5aWVsZCBiO1xuICAgICAgICB5aWVsZCBjO1xuICAgIH07XG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cblRyaXBsZS5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFR1cGxlLnByb3RvdHlwZSk7XG5cbmZ1bmN0aW9uIF90cmlwbGUoYSwgYiwgYykge1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCAwLCB7dmFsdWU6IGEsIHdyaXRhYmxlOiBmYWxzZX0pO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCAxLCB7dmFsdWU6IGIsIHdyaXRhYmxlOiBmYWxzZX0pO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCAyLCB7dmFsdWU6IGMsIHdyaXRhYmxlOiBmYWxzZX0pO1xufVxuX3RyaXBsZS5wcm90b3R5cGUuaXNUcmlwbGUgPSB0cnVlO1xuX3RyaXBsZS5wcm90b3R5cGUudHlwZSA9ICd0cmlwbGUnO1xuX3RyaXBsZS5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuICdbJyArIHRoaXNbMF0udG9TdHJpbmcoKSArICcsJyArIHRoaXNbMV0udG9TdHJpbmcoKSArICcsJyArIHRoaXNbMl0udG9TdHJpbmcoKSArICddJztcbn07XG5cblR1cGxlLlBhaXIgPSBQYWlyO1xuVHVwbGUucHJvdG90eXBlLlBhaXIgPSBQYWlyO1xuXG5UdXBsZS5UcmlwbGUgPSBUcmlwbGU7XG5UdXBsZS5wcm90b3R5cGUuVHJpcGxlID0gVHJpcGxlO1xuXG5leHBvcnQgZnVuY3Rpb24gUG9zaXRpb24ocm93cyA9IFtdLCByb3cgPSAwLCBjb2wgPSAwKSB7XG4gICAgcmV0dXJuIG5ldyBfcG9zaXRpb24ocm93cywgcm93LCBjb2wpO1xufVxuXG4vL1Bvc2l0aW9uLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoe30pO1xuUG9zaXRpb24uZnJvbVRleHQgPSBmdW5jdGlvbiAodGV4dCkge1xuICAgIGNvbnN0IHJvd3MgPSB0ZXh0LnNwbGl0KCdcXG4nKVxuICAgICAgICAubWFwKHJvdyA9PiByb3cuc3BsaXQoJycpKTtcbiAgICByZXR1cm4gbmV3IF9wb3NpdGlvbihyb3dzLCAwLCAwKTtcbn07XG5cbmZ1bmN0aW9uIF9wb3NpdGlvbihyb3dzLCByb3csIGNvbCkge1xuICAgIHRoaXMucm93cyA9IHJvd3M7XG4gICAgdGhpcy5yb3cgPSByb3c7XG4gICAgdGhpcy5jb2wgPSBjb2w7XG59XG5cbl9wb3NpdGlvbi5wcm90b3R5cGUuaXNQb3NpdGlvbiA9IHRydWU7XG5fcG9zaXRpb24ucHJvdG90eXBlLmNoYXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgbGV0IHJlc3VsdCA9IE1heWJlLk5vdGhpbmcoKTtcbiAgICB0cnkge1xuICAgICAgICBjb25zdCBuZXdSZXN1bHRWYWx1ZSA9IHRoaXMucm93c1t0aGlzLnJvd11bdGhpcy5jb2xdO1xuICAgICAgICBpZiAodHlwZW9mIG5ld1Jlc3VsdFZhbHVlICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgcmVzdWx0ID0gTWF5YmUuSnVzdChuZXdSZXN1bHRWYWx1ZSk7XG4gICAgICAgIH1cbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbn07XG5fcG9zaXRpb24ucHJvdG90eXBlLmluY3JQb3MgPSBmdW5jdGlvbiAoKSB7XG4gICAgY29uc3QgbmVlZFJvd0luY3JlbWVudCA9ICh0aGlzLmNvbCA9PT0gdGhpcy5yb3dzW3RoaXMucm93XS5sZW5ndGggLSAxKTtcbiAgICByZXR1cm4gUG9zaXRpb24oXG4gICAgICAgIHRoaXMucm93cyxcbiAgICAgICAgKG5lZWRSb3dJbmNyZW1lbnQgPyB0aGlzLnJvdyArIDEgOiB0aGlzLnJvdyksXG4gICAgICAgIChuZWVkUm93SW5jcmVtZW50ID8gMCA6IHRoaXMuY29sICsgMSlcbiAgICApO1xufTtcbl9wb3NpdGlvbi5wcm90b3R5cGUucmVzdCA9IGZ1bmN0aW9uICgpIHtcbiAgICBjb25zdCBzZWxmID0gdGhpcztcbiAgICByZXR1cm4gcmVzdF9oZWxwZXIoKS5qb2luKCcnKTtcbiAgICBmdW5jdGlvbiByZXN0X2hlbHBlcigpIHtcbiAgICAgICAgY29uc3QgbmV4dCA9IHNlbGYuY2hhcigpO1xuICAgICAgICBpZiAobmV4dC5pc05vdGhpbmcpIHJldHVybiBbXTtcbiAgICAgICAgcmV0dXJuIFtuZXh0LnZhbHVlXS5jb25jYXQoc2VsZi5pbmNyUG9zKCkucmVzdCgpKTtcbiAgICB9XG59O1xuX3Bvc2l0aW9uLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gJ3Jvdz0nICsgdGhpcy5yb3dcbiAgICAgICAgKyAnO2NvbD0nICsgdGhpcy5jb2xcbiAgICAgICAgKyAnO3Jlc3Q9JyArIHRoaXMucmVzdCgpO1xufTtcblxuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gZGVwcmVjYXRlZCBpbiBmYXZvdXIgb2YgVHVwbGUsIGRhdGEuTWF5YmUgYW5kIGRhdGEuVmFsaWRhdGlvblxuZXhwb3J0IGZ1bmN0aW9uIHBhaXIoeCwgeSkge1xuICAgIGxldCByZXN1bHQgPSBbeCwgeV07XG4gICAgcmVzdWx0LnR5cGUgPSAncGFpcic7XG4gICAgcmVzdWx0LnRvU3RyaW5nID0gKCkgPT4ge1xuICAgICAgICByZXR1cm4gJ1snXG4gICAgICAgICAgICArIChpc1BhaXIocmVzdWx0WzBdKSA/IHJlc3VsdFswXS50b1N0cmluZygpIDogcmVzdWx0WzBdKVxuICAgICAgICAgICAgKyAnLCdcbiAgICAgICAgICAgICsgKGlzUGFpcihyZXN1bHRbMV0pID8gcmVzdWx0WzFdLnRvU3RyaW5nKCkgOiByZXN1bHRbMV0pXG4gICAgICAgICAgICArICddJztcbiAgICB9O1xuICAgIHJldHVybiByZXN1bHQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzdWNjZXNzKG1hdGNoZWQsIHN0cikge1xuICAgIGxldCByZXN1bHQgPSBwYWlyKG1hdGNoZWQsIHN0cik7XG4gICAgcmVzdWx0LnR5cGUgPSAnc3VjY2Vzcyc7XG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGZhaWx1cmUocGFyc2VyTGFiZWwsIGVycm9yTXNnKSB7XG4gICAgbGV0IHJlc3VsdCA9IHBhaXIocGFyc2VyTGFiZWwsIGVycm9yTXNnKTtcbiAgICByZXN1bHQudHlwZSA9ICdmYWlsdXJlJztcbiAgICByZXR1cm4gcmVzdWx0O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc29tZSh2YWx1ZSkge1xuICAgIHJldHVybiB7XG4gICAgICAgIHR5cGU6ICdzb21lJyxcbiAgICAgICAgdmFsKCkge1xuICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICB9LFxuICAgICAgICB0b1N0cmluZygpIHtcbiAgICAgICAgICAgIHJldHVybiBgc29tZSgke3ZhbHVlfSlgO1xuICAgICAgICB9XG4gICAgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG5vbmUoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgdHlwZTogJ25vbmUnLFxuICAgICAgICB2YWwoKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfSxcbiAgICAgICAgdG9TdHJpbmcoKSB7XG4gICAgICAgICAgICByZXR1cm4gJ25vbmUoKSc7XG4gICAgICAgIH1cbiAgICB9O1xufVxuIl19