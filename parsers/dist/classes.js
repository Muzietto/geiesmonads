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
        Object.defineProperty(this, 'value', { value: str, writable: false });
    }
    _jstring.prototype.isJString = true;
    _jstring.prototype.type = 'jstring';
    _jstring.prototype.toString = function () {
        return 'JString ' + this.value.toString();
    };

    JValue.JString = JString;
    JValue.prototype.JString = JValue.JString;

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2pzL2NsYXNzZXMuanMiXSwibmFtZXMiOlsiSlZhbHVlIiwiVHVwbGUiLCJQb3NpdGlvbiIsInBhaXIiLCJzdWNjZXNzIiwiZmFpbHVyZSIsInNvbWUiLCJub25lIiwidG9TdHJpbmciLCJBcnJheSIsInByb3RvdHlwZSIsImFwcGx5IiwiaXNKVmFsdWUiLCJKU3RyaW5nIiwic3RyIiwiX2pzdHJpbmciLCJPYmplY3QiLCJjcmVhdGUiLCJkZWZpbmVQcm9wZXJ0eSIsInZhbHVlIiwid3JpdGFibGUiLCJpc0pTdHJpbmciLCJ0eXBlIiwiUGFpciIsImEiLCJiIiwicmVzdWx0IiwiX3BhaXIiLCJTeW1ib2wiLCJpdGVyYXRvciIsImlzUGFpciIsIlRyaXBsZSIsImMiLCJfdHJpcGxlIiwiaXNUcmlwbGUiLCJyb3dzIiwicm93IiwiY29sIiwiX3Bvc2l0aW9uIiwiZnJvbVRleHQiLCJ0ZXh0Iiwic3BsaXQiLCJtYXAiLCJpc1Bvc2l0aW9uIiwiY2hhciIsIk5vdGhpbmciLCJuZXdSZXN1bHRWYWx1ZSIsIkp1c3QiLCJlcnIiLCJpbmNyUG9zIiwibmVlZFJvd0luY3JlbWVudCIsImxlbmd0aCIsInJlc3QiLCJzZWxmIiwicmVzdF9oZWxwZXIiLCJqb2luIiwibmV4dCIsImlzTm90aGluZyIsImNvbmNhdCIsIngiLCJ5IiwibWF0Y2hlZCIsInBhcnNlckxhYmVsIiwiZXJyb3JNc2ciLCJ2YWwiXSwibWFwcGluZ3MiOiI7Ozs7OztZQVlnQkEsTSxHQUFBQSxNO1lBc0JBQyxLLEdBQUFBLEs7WUFtREFDLFEsR0FBQUEsUTtZQXNEQUMsSSxHQUFBQSxJO1lBYUFDLE8sR0FBQUEsTztZQU1BQyxPLEdBQUFBLE87WUFNQUMsSSxHQUFBQSxJO1lBWUFDLEksR0FBQUEsSTs7O0FBMUtoQixRQUFNQyxXQUFXQyxNQUFNQyxTQUFOLENBQWdCRixRQUFqQzs7QUFFQUMsVUFBTUMsU0FBTixDQUFnQkYsUUFBaEIsR0FBMkIsWUFBWTtBQUNuQyxlQUFPLE1BQU1BLFNBQVNH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LElBRUQsR0FGQyxJQUdBLGtCQUFPQSxPQUFPLENBQVAsQ0FBUCxJQUFvQkEsT0FBTyxDQUFQLEVBQVVsQixRQUFWLEVBQXBCLEdBQTJDa0IsT0FBTyxDQUFQLENBSDNDLElBSUQsR0FKTjtBQUtILFNBTkQ7QUFPQSxlQUFPQSxNQUFQO0FBQ0g7O0FBRU0sYUFBU3RCLE9BQVQsQ0FBaUJ5RCxPQUFqQixFQUEwQi9DLEdBQTFCLEVBQStCO0FBQ2xDLFlBQUlZLFNBQVN2QixLQUFLMEQsT0FBTCxFQUFjL0MsR0FBZCxDQUFiO0FBQ0FZLGVBQU9KLElBQVAsR0FBYyxTQUFkO0FBQ0EsZUFBT0ksTUFBUDtBQUNIOztBQUVNLGFBQVNyQixPQUFULENBQWlCeUQsV0FBakIsRUFBOEJDLFFBQTlCLEVBQXdDO0FBQzNDLFlBQUlyQyxTQUFTdkIsS0FBSzJELFdBQUwsRUFBa0JDLFFBQWxCLENBQWI7QUFDQXJDLGVBQU9KLElBQVAsR0FBYyxTQUFkO0FBQ0EsZUFBT0ksTUFBUDtBQUNIOztBQUVNLGFBQVNwQixJQUFULENBQWNhLEtBQWQsRUFBcUI7QUFDeEIsZUFBTztBQUNIRyxrQkFBTSxNQURIO0FBRUgwQyxlQUZHLGlCQUVHO0FBQ0YsdUJBQU83QyxLQUFQO0FBQ0gsYUFKRTtBQUtIWCxvQkFMRyxzQkFLUTtBQUNQLGlDQUFlVyxLQUFmO0FBQ0g7QUFQRSxTQUFQO0FBU0g7O0FBRU0sYUFBU1osSUFBVCxHQUFnQjtBQUNuQixlQUFPO0FBQ0hlLGtCQUFNLE1BREg7QUFFSDBDLGVBRkcsaUJBRUc7QUFDRix1QkFBTyxJQUFQO0FBQ0gsYUFKRTtBQUtIeEQsb0JBTEcsc0JBS1E7QUFDUCx1QkFBTyxRQUFQO0FBQ0g7QUFQRSxTQUFQO0FBU0giLCJmaWxlIjoiY2xhc3Nlcy5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7TWF5YmV9IGZyb20gJ21heWJlJztcblxuaW1wb3J0IHtcbiAgICBpc1BhaXIsXG59IGZyb20gJ3V0aWwnO1xuXG5jb25zdCB0b1N0cmluZyA9IEFycmF5LnByb3RvdHlwZS50b1N0cmluZztcblxuQXJyYXkucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiAnWycgKyB0b1N0cmluZy5hcHBseSh0aGlzKSArICddJztcbn07XG5cbmV4cG9ydCBmdW5jdGlvbiBKVmFsdWUoKSB7XG59XG5KVmFsdWUucHJvdG90eXBlLmlzSlZhbHVlID0gdHJ1ZTtcblxuZnVuY3Rpb24gSlN0cmluZyhzdHIpIHtcbiAgICByZXR1cm4gbmV3IF9qc3RyaW5nKHN0cik7XG59XG5KU3RyaW5nLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoSlZhbHVlLnByb3RvdHlwZSk7XG5cbmZ1bmN0aW9uIF9qc3RyaW5nKHN0cikge1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCAndmFsdWUnLCB7dmFsdWU6IHN0ciwgd3JpdGFibGU6IGZhbHNlfSk7XG59XG5fanN0cmluZy5wcm90b3R5cGUuaXNKU3RyaW5nID0gdHJ1ZTtcbl9qc3RyaW5nLnByb3RvdHlwZS50eXBlID0gJ2pzdHJpbmcnO1xuX2pzdHJpbmcucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiAnSlN0cmluZyAnICsgdGhpcy52YWx1ZS50b1N0cmluZygpO1xufTtcblxuSlZhbHVlLkpTdHJpbmcgPSBKU3RyaW5nO1xuSlZhbHVlLnByb3RvdHlwZS5KU3RyaW5nID0gSlZhbHVlLkpTdHJpbmc7XG5cblxuZXhwb3J0IGZ1bmN0aW9uIFR1cGxlKCkge1xufVxuXG5mdW5jdGlvbiBQYWlyKGEsIGIpIHtcbiAgICBsZXQgcmVzdWx0ID0gbmV3IF9wYWlyKGEsIGIpO1xuICAgIHJlc3VsdFtTeW1ib2wuaXRlcmF0b3JdID0gZnVuY3Rpb24qKCkge1xuICAgICAgICB5aWVsZCBhO1xuICAgICAgICB5aWVsZCBiO1xuICAgIH07XG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cblBhaXIucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShUdXBsZS5wcm90b3R5cGUpO1xuXG5mdW5jdGlvbiBfcGFpcihhLCBiKSB7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsIDAsIHt2YWx1ZTogYSwgd3JpdGFibGU6IGZhbHNlfSk7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsIDEsIHt2YWx1ZTogYiwgd3JpdGFibGU6IGZhbHNlfSk7XG59XG5fcGFpci5wcm90b3R5cGUuaXNQYWlyID0gdHJ1ZTtcbl9wYWlyLnByb3RvdHlwZS50eXBlID0gJ3BhaXInO1xuX3BhaXIucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiAnWycgKyB0aGlzWzBdLnRvU3RyaW5nKCkgKyAnLCcgKyB0aGlzWzFdLnRvU3RyaW5nKCkgKyAnXSc7XG59O1xuXG5mdW5jdGlvbiBUcmlwbGUoYSwgYiwgYykge1xuICAgIGxldCByZXN1bHQgPSBuZXcgX3RyaXBsZShhLCBiLCBjKTtcbiAgICByZXN1bHRbU3ltYm9sLml0ZXJhdG9yXSA9IGZ1bmN0aW9uKigpIHtcbiAgICAgICAgeWllbGQgYTtcbiAgICAgICAgeWllbGQgYjtcbiAgICAgICAgeWllbGQgYztcbiAgICB9O1xuICAgIHJldHVybiByZXN1bHQ7XG59XG5UcmlwbGUucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShUdXBsZS5wcm90b3R5cGUpO1xuXG5mdW5jdGlvbiBfdHJpcGxlKGEsIGIsIGMpIHtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgMCwge3ZhbHVlOiBhLCB3cml0YWJsZTogZmFsc2V9KTtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgMSwge3ZhbHVlOiBiLCB3cml0YWJsZTogZmFsc2V9KTtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgMiwge3ZhbHVlOiBjLCB3cml0YWJsZTogZmFsc2V9KTtcbn1cbl90cmlwbGUucHJvdG90eXBlLmlzVHJpcGxlID0gdHJ1ZTtcbl90cmlwbGUucHJvdG90eXBlLnR5cGUgPSAndHJpcGxlJztcbl90cmlwbGUucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiAnWycgKyB0aGlzWzBdLnRvU3RyaW5nKCkgKyAnLCcgKyB0aGlzWzFdLnRvU3RyaW5nKCkgKyAnLCcgKyB0aGlzWzJdLnRvU3RyaW5nKCkgKyAnXSc7XG59O1xuXG5UdXBsZS5QYWlyID0gUGFpcjtcblR1cGxlLnByb3RvdHlwZS5QYWlyID0gUGFpcjtcblxuVHVwbGUuVHJpcGxlID0gVHJpcGxlO1xuVHVwbGUucHJvdG90eXBlLlRyaXBsZSA9IFRyaXBsZTtcblxuZXhwb3J0IGZ1bmN0aW9uIFBvc2l0aW9uKHJvd3MgPSBbXSwgcm93ID0gMCwgY29sID0gMCkge1xuICAgIHJldHVybiBuZXcgX3Bvc2l0aW9uKHJvd3MsIHJvdywgY29sKTtcbn1cblxuLy9Qb3NpdGlvbi5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKHt9KTtcblBvc2l0aW9uLmZyb21UZXh0ID0gZnVuY3Rpb24gKHRleHQpIHtcbiAgICBjb25zdCByb3dzID0gdGV4dC5zcGxpdCgnXFxuJylcbiAgICAgICAgLm1hcChyb3cgPT4gcm93LnNwbGl0KCcnKSk7XG4gICAgcmV0dXJuIG5ldyBfcG9zaXRpb24ocm93cywgMCwgMCk7XG59O1xuXG5mdW5jdGlvbiBfcG9zaXRpb24ocm93cywgcm93LCBjb2wpIHtcbiAgICB0aGlzLnJvd3MgPSByb3dzO1xuICAgIHRoaXMucm93ID0gcm93O1xuICAgIHRoaXMuY29sID0gY29sO1xufVxuXG5fcG9zaXRpb24ucHJvdG90eXBlLmlzUG9zaXRpb24gPSB0cnVlO1xuX3Bvc2l0aW9uLnByb3RvdHlwZS5jaGFyID0gZnVuY3Rpb24gKCkge1xuICAgIGxldCByZXN1bHQgPSBNYXliZS5Ob3RoaW5nKCk7XG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgbmV3UmVzdWx0VmFsdWUgPSB0aGlzLnJvd3NbdGhpcy5yb3ddW3RoaXMuY29sXTtcbiAgICAgICAgaWYgKHR5cGVvZiBuZXdSZXN1bHRWYWx1ZSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgIHJlc3VsdCA9IE1heWJlLkp1c3QobmV3UmVzdWx0VmFsdWUpO1xuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG59O1xuX3Bvc2l0aW9uLnByb3RvdHlwZS5pbmNyUG9zID0gZnVuY3Rpb24gKCkge1xuICAgIGNvbnN0IG5lZWRSb3dJbmNyZW1lbnQgPSAodGhpcy5jb2wgPT09IHRoaXMucm93c1t0aGlzLnJvd10ubGVuZ3RoIC0gMSk7XG4gICAgcmV0dXJuIFBvc2l0aW9uKFxuICAgICAgICB0aGlzLnJvd3MsXG4gICAgICAgIChuZWVkUm93SW5jcmVtZW50ID8gdGhpcy5yb3cgKyAxIDogdGhpcy5yb3cpLFxuICAgICAgICAobmVlZFJvd0luY3JlbWVudCA/IDAgOiB0aGlzLmNvbCArIDEpXG4gICAgKTtcbn07XG5fcG9zaXRpb24ucHJvdG90eXBlLnJlc3QgPSBmdW5jdGlvbiAoKSB7XG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XG4gICAgcmV0dXJuIHJlc3RfaGVscGVyKCkuam9pbignJyk7XG4gICAgZnVuY3Rpb24gcmVzdF9oZWxwZXIoKSB7XG4gICAgICAgIGNvbnN0IG5leHQgPSBzZWxmLmNoYXIoKTtcbiAgICAgICAgaWYgKG5leHQuaXNOb3RoaW5nKSByZXR1cm4gW107XG4gICAgICAgIHJldHVybiBbbmV4dC52YWx1ZV0uY29uY2F0KHNlbGYuaW5jclBvcygpLnJlc3QoKSk7XG4gICAgfVxufTtcbl9wb3NpdGlvbi5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuICdyb3c9JyArIHRoaXMucm93XG4gICAgICAgICsgJztjb2w9JyArIHRoaXMuY29sXG4gICAgICAgICsgJztyZXN0PScgKyB0aGlzLnJlc3QoKTtcbn07XG5cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIGRlcHJlY2F0ZWQgaW4gZmF2b3VyIG9mIFR1cGxlLCBkYXRhLk1heWJlIGFuZCBkYXRhLlZhbGlkYXRpb25cbmV4cG9ydCBmdW5jdGlvbiBwYWlyKHgsIHkpIHtcbiAgICBsZXQgcmVzdWx0ID0gW3gsIHldO1xuICAgIHJlc3VsdC50eXBlID0gJ3BhaXInO1xuICAgIHJlc3VsdC50b1N0cmluZyA9ICgpID0+IHtcbiAgICAgICAgcmV0dXJuICdbJ1xuICAgICAgICAgICAgKyAoaXNQYWlyKHJlc3VsdFswXSkgPyByZXN1bHRbMF0udG9TdHJpbmcoKSA6IHJlc3VsdFswXSlcbiAgICAgICAgICAgICsgJywnXG4gICAgICAgICAgICArIChpc1BhaXIocmVzdWx0WzFdKSA/IHJlc3VsdFsxXS50b1N0cmluZygpIDogcmVzdWx0WzFdKVxuICAgICAgICAgICAgKyAnXSc7XG4gICAgfTtcbiAgICByZXR1cm4gcmVzdWx0O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc3VjY2VzcyhtYXRjaGVkLCBzdHIpIHtcbiAgICBsZXQgcmVzdWx0ID0gcGFpcihtYXRjaGVkLCBzdHIpO1xuICAgIHJlc3VsdC50eXBlID0gJ3N1Y2Nlc3MnO1xuICAgIHJldHVybiByZXN1bHQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBmYWlsdXJlKHBhcnNlckxhYmVsLCBlcnJvck1zZykge1xuICAgIGxldCByZXN1bHQgPSBwYWlyKHBhcnNlckxhYmVsLCBlcnJvck1zZyk7XG4gICAgcmVzdWx0LnR5cGUgPSAnZmFpbHVyZSc7XG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNvbWUodmFsdWUpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICB0eXBlOiAnc29tZScsXG4gICAgICAgIHZhbCgpIHtcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgICAgfSxcbiAgICAgICAgdG9TdHJpbmcoKSB7XG4gICAgICAgICAgICByZXR1cm4gYHNvbWUoJHt2YWx1ZX0pYDtcbiAgICAgICAgfVxuICAgIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBub25lKCkge1xuICAgIHJldHVybiB7XG4gICAgICAgIHR5cGU6ICdub25lJyxcbiAgICAgICAgdmFsKCkge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH0sXG4gICAgICAgIHRvU3RyaW5nKCkge1xuICAgICAgICAgICAgcmV0dXJuICdub25lKCknO1xuICAgICAgICB9XG4gICAgfTtcbn1cbiJdfQ==