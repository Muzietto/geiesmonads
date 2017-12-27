define(['exports', 'maybe', 'util'], function (exports, _maybe, _util) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2pzL2NsYXNzZXMuanMiXSwibmFtZXMiOlsiVHVwbGUiLCJQb3NpdGlvbiIsInBhaXIiLCJzdWNjZXNzIiwiZmFpbHVyZSIsInNvbWUiLCJub25lIiwidG9TdHJpbmciLCJBcnJheSIsInByb3RvdHlwZSIsImFwcGx5IiwiUGFpciIsImEiLCJiIiwicmVzdWx0IiwiX3BhaXIiLCJTeW1ib2wiLCJpdGVyYXRvciIsIk9iamVjdCIsImNyZWF0ZSIsImRlZmluZVByb3BlcnR5IiwidmFsdWUiLCJ3cml0YWJsZSIsImlzUGFpciIsInR5cGUiLCJUcmlwbGUiLCJjIiwiX3RyaXBsZSIsImlzVHJpcGxlIiwicm93cyIsInJvdyIsImNvbCIsIl9wb3NpdGlvbiIsImZyb21UZXh0IiwidGV4dCIsInNwbGl0IiwibWFwIiwiaXNQb3NpdGlvbiIsImNoYXIiLCJOb3RoaW5nIiwibmV3UmVzdWx0VmFsdWUiLCJKdXN0IiwiZXJyIiwiaW5jclBvcyIsIm5lZWRSb3dJbmNyZW1lbnQiLCJsZW5ndGgiLCJyZXN0Iiwic2VsZiIsInJlc3RfaGVscGVyIiwiam9pbiIsIm5leHQiLCJpc05vdGhpbmciLCJjb25jYXQiLCJ4IiwieSIsIm1hdGNoZWQiLCJzdHIiLCJwYXJzZXJMYWJlbCIsImVycm9yTXNnIiwidmFsIl0sIm1hcHBpbmdzIjoiOzs7Ozs7WUFZZ0JBLEssR0FBQUEsSztZQXVEQUMsUSxHQUFBQSxRO1lBc0RBQyxJLEdBQUFBLEk7WUFhQUMsTyxHQUFBQSxPO1lBTUFDLE8sR0FBQUEsTztZQU1BQyxJLEdBQUFBLEk7WUFZQUMsSSxHQUFBQSxJOzs7QUF4SmhCLFFBQU1DLFdBQVdDLE1BQU1DLFNBQU4sQ0FBZ0JGLFFBQWpDOztBQUVBQyxVQUFNQyxTQUFOLENBQWdCRixRQUFoQixHQUEyQixZQUFZO0FBQ25DLGVBQU8sTUFBTUEsU0FBU0csS0FBVCxDQUFlLElBQWYsQ0FBTixHQUE2QixHQUFwQztBQUNILEtBRkQ7O0FBSU8sYUFBU1YsS0FBVCxHQUFpQixDQUN2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SEcsa0JBQU0sTUFESDtBQUVIbUMsZUFGRyxpQkFFRztBQUNGLHVCQUFPdEMsS0FBUDtBQUNILGFBSkU7QUFLSGQsb0JBTEcsc0JBS1E7QUFDUCxpQ0FBZWMsS0FBZjtBQUNIO0FBUEUsU0FBUDtBQVNIOztBQUVNLGFBQVNmLElBQVQsR0FBZ0I7QUFDbkIsZUFBTztBQUNIa0Isa0JBQU0sTUFESDtBQUVIbUMsZUFGRyxpQkFFRztBQUNGLHVCQUFPLElBQVA7QUFDSCxhQUpFO0FBS0hwRCxvQkFMRyxzQkFLUTtBQUNQLHVCQUFPLFFBQVA7QUFDSDtBQVBFLFNBQVA7QUFTSCIsImZpbGUiOiJjbGFzc2VzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtNYXliZX0gZnJvbSAnbWF5YmUnO1xuXG5pbXBvcnQge1xuICAgIGlzUGFpcixcbn0gZnJvbSAndXRpbCc7XG5cbmNvbnN0IHRvU3RyaW5nID0gQXJyYXkucHJvdG90eXBlLnRvU3RyaW5nO1xuXG5BcnJheS5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuICdbJyArIHRvU3RyaW5nLmFwcGx5KHRoaXMpICsgJ10nO1xufTtcblxuZXhwb3J0IGZ1bmN0aW9uIFR1cGxlKCkge1xufVxuXG5mdW5jdGlvbiBQYWlyKGEsIGIpIHtcbiAgICBsZXQgcmVzdWx0ID0gbmV3IF9wYWlyKGEsIGIpO1xuICAgIHJlc3VsdFtTeW1ib2wuaXRlcmF0b3JdID0gZnVuY3Rpb24qKCkge1xuICAgICAgICB5aWVsZCBhO1xuICAgICAgICB5aWVsZCBiO1xuICAgIH07XG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cblBhaXIucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShUdXBsZS5wcm90b3R5cGUpO1xuXG5mdW5jdGlvbiBfcGFpcihhLCBiKSB7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsIDAsIHt2YWx1ZTogYSwgd3JpdGFibGU6IGZhbHNlfSk7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsIDEsIHt2YWx1ZTogYiwgd3JpdGFibGU6IGZhbHNlfSk7XG59XG5fcGFpci5wcm90b3R5cGUuaXNQYWlyID0gdHJ1ZTtcbl9wYWlyLnByb3RvdHlwZS50eXBlID0gJ3BhaXInO1xuX3BhaXIucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiAnWycgKyB0aGlzWzBdLnRvU3RyaW5nKCkgKyAnLCcgKyB0aGlzWzFdLnRvU3RyaW5nKCkgKyAnXSc7XG59O1xuXG5mdW5jdGlvbiBUcmlwbGUoYSwgYiwgYykge1xuICAgIGxldCByZXN1bHQgPSBuZXcgX3RyaXBsZShhLCBiLCBjKTtcbiAgICByZXN1bHRbU3ltYm9sLml0ZXJhdG9yXSA9IGZ1bmN0aW9uKigpIHtcbiAgICAgICAgeWllbGQgYTtcbiAgICAgICAgeWllbGQgYjtcbiAgICAgICAgeWllbGQgYztcbiAgICB9O1xuICAgIHJldHVybiByZXN1bHQ7XG59XG5UcmlwbGUucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShUdXBsZS5wcm90b3R5cGUpO1xuXG5mdW5jdGlvbiBfdHJpcGxlKGEsIGIsIGMpIHtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgMCwge3ZhbHVlOiBhLCB3cml0YWJsZTogZmFsc2V9KTtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgMSwge3ZhbHVlOiBiLCB3cml0YWJsZTogZmFsc2V9KTtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgMiwge3ZhbHVlOiBjLCB3cml0YWJsZTogZmFsc2V9KTtcbn1cbl90cmlwbGUucHJvdG90eXBlLmlzVHJpcGxlID0gdHJ1ZTtcbl90cmlwbGUucHJvdG90eXBlLnR5cGUgPSAndHJpcGxlJztcbl90cmlwbGUucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiAnWycgKyB0aGlzWzBdLnRvU3RyaW5nKCkgKyAnLCcgKyB0aGlzWzFdLnRvU3RyaW5nKCkgKyAnLCcgKyB0aGlzWzJdLnRvU3RyaW5nKCkgKyAnXSc7XG59O1xuXG5UdXBsZS5QYWlyID0gZnVuY3Rpb24gKGEsIGIpIHtcbiAgICByZXR1cm4gbmV3IFBhaXIoYSwgYik7XG59O1xuVHVwbGUucHJvdG90eXBlLlBhaXIgPSBUdXBsZS5QYWlyO1xuXG5UdXBsZS5UcmlwbGUgPSBmdW5jdGlvbiAoYSwgYiwgYykge1xuICAgIHJldHVybiBuZXcgVHJpcGxlKGEsIGIsIGMpO1xufTtcblR1cGxlLnByb3RvdHlwZS5UcmlwbGUgPSBUdXBsZS5UcmlwbGU7XG5cbmV4cG9ydCBmdW5jdGlvbiBQb3NpdGlvbihyb3dzID0gW10sIHJvdyA9IDAsIGNvbCA9IDApIHtcbiAgICByZXR1cm4gbmV3IF9wb3NpdGlvbihyb3dzLCByb3csIGNvbCk7XG59XG5cbi8vUG9zaXRpb24ucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZSh7fSk7XG5Qb3NpdGlvbi5mcm9tVGV4dCA9IGZ1bmN0aW9uICh0ZXh0KSB7XG4gICAgY29uc3Qgcm93cyA9IHRleHQuc3BsaXQoJ1xcbicpXG4gICAgICAgIC5tYXAocm93ID0+IHJvdy5zcGxpdCgnJykpO1xuICAgIHJldHVybiBuZXcgX3Bvc2l0aW9uKHJvd3MsIDAsIDApO1xufTtcblxuZnVuY3Rpb24gX3Bvc2l0aW9uKHJvd3MsIHJvdywgY29sKSB7XG4gICAgdGhpcy5yb3dzID0gcm93cztcbiAgICB0aGlzLnJvdyA9IHJvdztcbiAgICB0aGlzLmNvbCA9IGNvbDtcbn1cblxuX3Bvc2l0aW9uLnByb3RvdHlwZS5pc1Bvc2l0aW9uID0gdHJ1ZTtcbl9wb3NpdGlvbi5wcm90b3R5cGUuY2hhciA9IGZ1bmN0aW9uICgpIHtcbiAgICBsZXQgcmVzdWx0ID0gTWF5YmUuTm90aGluZygpO1xuICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IG5ld1Jlc3VsdFZhbHVlID0gdGhpcy5yb3dzW3RoaXMucm93XVt0aGlzLmNvbF07XG4gICAgICAgIGlmICh0eXBlb2YgbmV3UmVzdWx0VmFsdWUgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICByZXN1bHQgPSBNYXliZS5KdXN0KG5ld1Jlc3VsdFZhbHVlKTtcbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGVycikge1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xufTtcbl9wb3NpdGlvbi5wcm90b3R5cGUuaW5jclBvcyA9IGZ1bmN0aW9uICgpIHtcbiAgICBjb25zdCBuZWVkUm93SW5jcmVtZW50ID0gKHRoaXMuY29sID09PSB0aGlzLnJvd3NbdGhpcy5yb3ddLmxlbmd0aCAtIDEpO1xuICAgIHJldHVybiBQb3NpdGlvbihcbiAgICAgICAgdGhpcy5yb3dzLFxuICAgICAgICAobmVlZFJvd0luY3JlbWVudCA/IHRoaXMucm93ICsgMSA6IHRoaXMucm93KSxcbiAgICAgICAgKG5lZWRSb3dJbmNyZW1lbnQgPyAwIDogdGhpcy5jb2wgKyAxKVxuICAgICk7XG59O1xuX3Bvc2l0aW9uLnByb3RvdHlwZS5yZXN0ID0gZnVuY3Rpb24gKCkge1xuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuICAgIHJldHVybiByZXN0X2hlbHBlcigpLmpvaW4oJycpO1xuICAgIGZ1bmN0aW9uIHJlc3RfaGVscGVyKCkge1xuICAgICAgICBjb25zdCBuZXh0ID0gc2VsZi5jaGFyKCk7XG4gICAgICAgIGlmIChuZXh0LmlzTm90aGluZykgcmV0dXJuIFtdO1xuICAgICAgICByZXR1cm4gW25leHQudmFsdWVdLmNvbmNhdChzZWxmLmluY3JQb3MoKS5yZXN0KCkpO1xuICAgIH1cbn07XG5fcG9zaXRpb24ucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiAncm93PScgKyB0aGlzLnJvd1xuICAgICAgICArICc7Y29sPScgKyB0aGlzLmNvbFxuICAgICAgICArICc7cmVzdD0nICsgdGhpcy5yZXN0KCk7XG59O1xuXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBkZXByZWNhdGVkIGluIGZhdm91ciBvZiBUdXBsZSwgZGF0YS5NYXliZSBhbmQgZGF0YS5WYWxpZGF0aW9uXG5leHBvcnQgZnVuY3Rpb24gcGFpcih4LCB5KSB7XG4gICAgbGV0IHJlc3VsdCA9IFt4LCB5XTtcbiAgICByZXN1bHQudHlwZSA9ICdwYWlyJztcbiAgICByZXN1bHQudG9TdHJpbmcgPSAoKSA9PiB7XG4gICAgICAgIHJldHVybiAnWydcbiAgICAgICAgICAgICsgKGlzUGFpcihyZXN1bHRbMF0pID8gcmVzdWx0WzBdLnRvU3RyaW5nKCkgOiByZXN1bHRbMF0pXG4gICAgICAgICAgICArICcsJ1xuICAgICAgICAgICAgKyAoaXNQYWlyKHJlc3VsdFsxXSkgPyByZXN1bHRbMV0udG9TdHJpbmcoKSA6IHJlc3VsdFsxXSlcbiAgICAgICAgICAgICsgJ10nO1xuICAgIH07XG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHN1Y2Nlc3MobWF0Y2hlZCwgc3RyKSB7XG4gICAgbGV0IHJlc3VsdCA9IHBhaXIobWF0Y2hlZCwgc3RyKTtcbiAgICByZXN1bHQudHlwZSA9ICdzdWNjZXNzJztcbiAgICByZXR1cm4gcmVzdWx0O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZmFpbHVyZShwYXJzZXJMYWJlbCwgZXJyb3JNc2cpIHtcbiAgICBsZXQgcmVzdWx0ID0gcGFpcihwYXJzZXJMYWJlbCwgZXJyb3JNc2cpO1xuICAgIHJlc3VsdC50eXBlID0gJ2ZhaWx1cmUnO1xuICAgIHJldHVybiByZXN1bHQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzb21lKHZhbHVlKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgdHlwZTogJ3NvbWUnLFxuICAgICAgICB2YWwoKSB7XG4gICAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgIH0sXG4gICAgICAgIHRvU3RyaW5nKCkge1xuICAgICAgICAgICAgcmV0dXJuIGBzb21lKCR7dmFsdWV9KWA7XG4gICAgICAgIH1cbiAgICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbm9uZSgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICB0eXBlOiAnbm9uZScsXG4gICAgICAgIHZhbCgpIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9LFxuICAgICAgICB0b1N0cmluZygpIHtcbiAgICAgICAgICAgIHJldHVybiAnbm9uZSgpJztcbiAgICAgICAgfVxuICAgIH07XG59XG4iXX0=