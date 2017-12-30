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

    Tuple.Pair = function (a, b) {
        return new Pair(a, b);
    };
    Tuple.prototype.Pair = Tuple.Pair;

    Tuple.Triple = function (a, b, c) {
        return new Triple(a, b, c);
    };
    Tuple.prototype.Triple = Tuple.Triple;

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2pzL2NsYXNzZXMuanMiXSwibmFtZXMiOlsiSlZhbHVlIiwiVHVwbGUiLCJQb3NpdGlvbiIsInBhaXIiLCJzdWNjZXNzIiwiZmFpbHVyZSIsInNvbWUiLCJub25lIiwidG9TdHJpbmciLCJBcnJheSIsInByb3RvdHlwZSIsImFwcGx5IiwiaXNKVmFsdWUiLCJKU3RyaW5nIiwic3RyIiwiX2pzdHJpbmciLCJPYmplY3QiLCJjcmVhdGUiLCJkZWZpbmVQcm9wZXJ0eSIsInZhbHVlIiwid3JpdGFibGUiLCJpc0pTdHJpbmciLCJ0eXBlIiwiUGFpciIsImEiLCJiIiwicmVzdWx0IiwiX3BhaXIiLCJTeW1ib2wiLCJpdGVyYXRvciIsImlzUGFpciIsIlRyaXBsZSIsImMiLCJfdHJpcGxlIiwiaXNUcmlwbGUiLCJyb3dzIiwicm93IiwiY29sIiwiX3Bvc2l0aW9uIiwiZnJvbVRleHQiLCJ0ZXh0Iiwic3BsaXQiLCJtYXAiLCJpc1Bvc2l0aW9uIiwiY2hhciIsIk5vdGhpbmciLCJuZXdSZXN1bHRWYWx1ZSIsIkp1c3QiLCJlcnIiLCJpbmNyUG9zIiwibmVlZFJvd0luY3JlbWVudCIsImxlbmd0aCIsInJlc3QiLCJzZWxmIiwicmVzdF9oZWxwZXIiLCJqb2luIiwibmV4dCIsImlzTm90aGluZyIsImNvbmNhdCIsIngiLCJ5IiwibWF0Y2hlZCIsInBhcnNlckxhYmVsIiwiZXJyb3JNc2ciLCJ2YWwiXSwibWFwcGluZ3MiOiI7Ozs7OztZQVlnQkEsTSxHQUFBQSxNO1lBa0JBQyxLLEdBQUFBLEs7WUF1REFDLFEsR0FBQUEsUTtZQXNEQUMsSSxHQUFBQSxJO1lBYUFDLE8sR0FBQUEsTztZQU1BQyxPLEdBQUFBLE87WUFNQUMsSSxHQUFBQSxJO1lBWUFDLEksR0FBQUEsSTs7O0FBMUtoQixRQUFNQyxXQUFXQyxNQUFNQyxTQUFOLENBQWdCRixRQUFqQzs7QUFFQUMsVUFBTUMsU0FBTixDQUFnQkYsUUFBaEIsR0FBMkIsWUFBWTtBQUNuQyxlQUFPLE1BQU1BLFNBQVNH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Y2VzQ29udGVudCI6WyJpbXBvcnQge01heWJlfSBmcm9tICdtYXliZSc7XG5cbmltcG9ydCB7XG4gICAgaXNQYWlyLFxufSBmcm9tICd1dGlsJztcblxuY29uc3QgdG9TdHJpbmcgPSBBcnJheS5wcm90b3R5cGUudG9TdHJpbmc7XG5cbkFycmF5LnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gJ1snICsgdG9TdHJpbmcuYXBwbHkodGhpcykgKyAnXSc7XG59O1xuXG5leHBvcnQgZnVuY3Rpb24gSlZhbHVlKCkge1xufVxuSlZhbHVlLnByb3RvdHlwZS5pc0pWYWx1ZSA9IHRydWU7XG5cbmZ1bmN0aW9uIEpTdHJpbmcoc3RyKSB7XG4gICAgcmV0dXJuIG5ldyBfanN0cmluZyhzdHIpO1xufVxuSlN0cmluZy5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKEpWYWx1ZS5wcm90b3R5cGUpO1xuXG5mdW5jdGlvbiBfanN0cmluZyhzdHIpIHtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgJ3ZhbHVlJywge3ZhbHVlOiBzdHIsIHdyaXRhYmxlOiBmYWxzZX0pO1xufVxuX2pzdHJpbmcucHJvdG90eXBlLmlzSlN0cmluZyA9IHRydWU7XG5fanN0cmluZy5wcm90b3R5cGUudHlwZSA9ICdqc3RyaW5nJztcbl9qc3RyaW5nLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gJ0pTdHJpbmcgJyArIHRoaXMudmFsdWUudG9TdHJpbmcoKTtcbn07XG5cbmV4cG9ydCBmdW5jdGlvbiBUdXBsZSgpIHtcbn1cblxuZnVuY3Rpb24gUGFpcihhLCBiKSB7XG4gICAgbGV0IHJlc3VsdCA9IG5ldyBfcGFpcihhLCBiKTtcbiAgICByZXN1bHRbU3ltYm9sLml0ZXJhdG9yXSA9IGZ1bmN0aW9uKigpIHtcbiAgICAgICAgeWllbGQgYTtcbiAgICAgICAgeWllbGQgYjtcbiAgICB9O1xuICAgIHJldHVybiByZXN1bHQ7XG59XG5QYWlyLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoVHVwbGUucHJvdG90eXBlKTtcblxuZnVuY3Rpb24gX3BhaXIoYSwgYikge1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCAwLCB7dmFsdWU6IGEsIHdyaXRhYmxlOiBmYWxzZX0pO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCAxLCB7dmFsdWU6IGIsIHdyaXRhYmxlOiBmYWxzZX0pO1xufVxuX3BhaXIucHJvdG90eXBlLmlzUGFpciA9IHRydWU7XG5fcGFpci5wcm90b3R5cGUudHlwZSA9ICdwYWlyJztcbl9wYWlyLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gJ1snICsgdGhpc1swXS50b1N0cmluZygpICsgJywnICsgdGhpc1sxXS50b1N0cmluZygpICsgJ10nO1xufTtcblxuZnVuY3Rpb24gVHJpcGxlKGEsIGIsIGMpIHtcbiAgICBsZXQgcmVzdWx0ID0gbmV3IF90cmlwbGUoYSwgYiwgYyk7XG4gICAgcmVzdWx0W1N5bWJvbC5pdGVyYXRvcl0gPSBmdW5jdGlvbiooKSB7XG4gICAgICAgIHlpZWxkIGE7XG4gICAgICAgIHlpZWxkIGI7XG4gICAgICAgIHlpZWxkIGM7XG4gICAgfTtcbiAgICByZXR1cm4gcmVzdWx0O1xufVxuVHJpcGxlLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoVHVwbGUucHJvdG90eXBlKTtcblxuZnVuY3Rpb24gX3RyaXBsZShhLCBiLCBjKSB7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsIDAsIHt2YWx1ZTogYSwgd3JpdGFibGU6IGZhbHNlfSk7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsIDEsIHt2YWx1ZTogYiwgd3JpdGFibGU6IGZhbHNlfSk7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsIDIsIHt2YWx1ZTogYywgd3JpdGFibGU6IGZhbHNlfSk7XG59XG5fdHJpcGxlLnByb3RvdHlwZS5pc1RyaXBsZSA9IHRydWU7XG5fdHJpcGxlLnByb3RvdHlwZS50eXBlID0gJ3RyaXBsZSc7XG5fdHJpcGxlLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gJ1snICsgdGhpc1swXS50b1N0cmluZygpICsgJywnICsgdGhpc1sxXS50b1N0cmluZygpICsgJywnICsgdGhpc1syXS50b1N0cmluZygpICsgJ10nO1xufTtcblxuVHVwbGUuUGFpciA9IGZ1bmN0aW9uIChhLCBiKSB7XG4gICAgcmV0dXJuIG5ldyBQYWlyKGEsIGIpO1xufTtcblR1cGxlLnByb3RvdHlwZS5QYWlyID0gVHVwbGUuUGFpcjtcblxuVHVwbGUuVHJpcGxlID0gZnVuY3Rpb24gKGEsIGIsIGMpIHtcbiAgICByZXR1cm4gbmV3IFRyaXBsZShhLCBiLCBjKTtcbn07XG5UdXBsZS5wcm90b3R5cGUuVHJpcGxlID0gVHVwbGUuVHJpcGxlO1xuXG5leHBvcnQgZnVuY3Rpb24gUG9zaXRpb24ocm93cyA9IFtdLCByb3cgPSAwLCBjb2wgPSAwKSB7XG4gICAgcmV0dXJuIG5ldyBfcG9zaXRpb24ocm93cywgcm93LCBjb2wpO1xufVxuXG4vL1Bvc2l0aW9uLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoe30pO1xuUG9zaXRpb24uZnJvbVRleHQgPSBmdW5jdGlvbiAodGV4dCkge1xuICAgIGNvbnN0IHJvd3MgPSB0ZXh0LnNwbGl0KCdcXG4nKVxuICAgICAgICAubWFwKHJvdyA9PiByb3cuc3BsaXQoJycpKTtcbiAgICByZXR1cm4gbmV3IF9wb3NpdGlvbihyb3dzLCAwLCAwKTtcbn07XG5cbmZ1bmN0aW9uIF9wb3NpdGlvbihyb3dzLCByb3csIGNvbCkge1xuICAgIHRoaXMucm93cyA9IHJvd3M7XG4gICAgdGhpcy5yb3cgPSByb3c7XG4gICAgdGhpcy5jb2wgPSBjb2w7XG59XG5cbl9wb3NpdGlvbi5wcm90b3R5cGUuaXNQb3NpdGlvbiA9IHRydWU7XG5fcG9zaXRpb24ucHJvdG90eXBlLmNoYXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgbGV0IHJlc3VsdCA9IE1heWJlLk5vdGhpbmcoKTtcbiAgICB0cnkge1xuICAgICAgICBjb25zdCBuZXdSZXN1bHRWYWx1ZSA9IHRoaXMucm93c1t0aGlzLnJvd11bdGhpcy5jb2xdO1xuICAgICAgICBpZiAodHlwZW9mIG5ld1Jlc3VsdFZhbHVlICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgcmVzdWx0ID0gTWF5YmUuSnVzdChuZXdSZXN1bHRWYWx1ZSk7XG4gICAgICAgIH1cbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbn07XG5fcG9zaXRpb24ucHJvdG90eXBlLmluY3JQb3MgPSBmdW5jdGlvbiAoKSB7XG4gICAgY29uc3QgbmVlZFJvd0luY3JlbWVudCA9ICh0aGlzLmNvbCA9PT0gdGhpcy5yb3dzW3RoaXMucm93XS5sZW5ndGggLSAxKTtcbiAgICByZXR1cm4gUG9zaXRpb24oXG4gICAgICAgIHRoaXMucm93cyxcbiAgICAgICAgKG5lZWRSb3dJbmNyZW1lbnQgPyB0aGlzLnJvdyArIDEgOiB0aGlzLnJvdyksXG4gICAgICAgIChuZWVkUm93SW5jcmVtZW50ID8gMCA6IHRoaXMuY29sICsgMSlcbiAgICApO1xufTtcbl9wb3NpdGlvbi5wcm90b3R5cGUucmVzdCA9IGZ1bmN0aW9uICgpIHtcbiAgICBjb25zdCBzZWxmID0gdGhpcztcbiAgICByZXR1cm4gcmVzdF9oZWxwZXIoKS5qb2luKCcnKTtcbiAgICBmdW5jdGlvbiByZXN0X2hlbHBlcigpIHtcbiAgICAgICAgY29uc3QgbmV4dCA9IHNlbGYuY2hhcigpO1xuICAgICAgICBpZiAobmV4dC5pc05vdGhpbmcpIHJldHVybiBbXTtcbiAgICAgICAgcmV0dXJuIFtuZXh0LnZhbHVlXS5jb25jYXQoc2VsZi5pbmNyUG9zKCkucmVzdCgpKTtcbiAgICB9XG59O1xuX3Bvc2l0aW9uLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gJ3Jvdz0nICsgdGhpcy5yb3dcbiAgICAgICAgKyAnO2NvbD0nICsgdGhpcy5jb2xcbiAgICAgICAgKyAnO3Jlc3Q9JyArIHRoaXMucmVzdCgpO1xufTtcblxuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gZGVwcmVjYXRlZCBpbiBmYXZvdXIgb2YgVHVwbGUsIGRhdGEuTWF5YmUgYW5kIGRhdGEuVmFsaWRhdGlvblxuZXhwb3J0IGZ1bmN0aW9uIHBhaXIoeCwgeSkge1xuICAgIGxldCByZXN1bHQgPSBbeCwgeV07XG4gICAgcmVzdWx0LnR5cGUgPSAncGFpcic7XG4gICAgcmVzdWx0LnRvU3RyaW5nID0gKCkgPT4ge1xuICAgICAgICByZXR1cm4gJ1snXG4gICAgICAgICAgICArIChpc1BhaXIocmVzdWx0WzBdKSA/IHJlc3VsdFswXS50b1N0cmluZygpIDogcmVzdWx0WzBdKVxuICAgICAgICAgICAgKyAnLCdcbiAgICAgICAgICAgICsgKGlzUGFpcihyZXN1bHRbMV0pID8gcmVzdWx0WzFdLnRvU3RyaW5nKCkgOiByZXN1bHRbMV0pXG4gICAgICAgICAgICArICddJztcbiAgICB9O1xuICAgIHJldHVybiByZXN1bHQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzdWNjZXNzKG1hdGNoZWQsIHN0cikge1xuICAgIGxldCByZXN1bHQgPSBwYWlyKG1hdGNoZWQsIHN0cik7XG4gICAgcmVzdWx0LnR5cGUgPSAnc3VjY2Vzcyc7XG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGZhaWx1cmUocGFyc2VyTGFiZWwsIGVycm9yTXNnKSB7XG4gICAgbGV0IHJlc3VsdCA9IHBhaXIocGFyc2VyTGFiZWwsIGVycm9yTXNnKTtcbiAgICByZXN1bHQudHlwZSA9ICdmYWlsdXJlJztcbiAgICByZXR1cm4gcmVzdWx0O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc29tZSh2YWx1ZSkge1xuICAgIHJldHVybiB7XG4gICAgICAgIHR5cGU6ICdzb21lJyxcbiAgICAgICAgdmFsKCkge1xuICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICB9LFxuICAgICAgICB0b1N0cmluZygpIHtcbiAgICAgICAgICAgIHJldHVybiBgc29tZSgke3ZhbHVlfSlgO1xuICAgICAgICB9XG4gICAgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG5vbmUoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgdHlwZTogJ25vbmUnLFxuICAgICAgICB2YWwoKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfSxcbiAgICAgICAgdG9TdHJpbmcoKSB7XG4gICAgICAgICAgICByZXR1cm4gJ25vbmUoKSc7XG4gICAgICAgIH1cbiAgICB9O1xufVxuIl19