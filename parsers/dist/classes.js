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
        this[0] = a;
        this[1] = b;
    }
    _pair.prototype.isPair = true;
    _pair.prototype.type = 'pair';
    _pair.prototype.toString = function () {
        return '[' + this[0] + ',' + this[1] + ']';
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
        this[0] = a;
        this[1] = b;
        this[2] = c;
    }
    _triple.prototype.isTriple = true;
    _triple.prototype.type = 'triple';
    _triple.prototype.toString = function () {
        return '[' + this[0] + ',' + this[1] + ',' + this[2] + ']';
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2pzL2NsYXNzZXMuanMiXSwibmFtZXMiOlsiVHVwbGUiLCJQb3NpdGlvbiIsInBhaXIiLCJzdWNjZXNzIiwiZmFpbHVyZSIsInNvbWUiLCJub25lIiwidG9TdHJpbmciLCJBcnJheSIsInByb3RvdHlwZSIsImFwcGx5IiwiUGFpciIsImEiLCJiIiwicmVzdWx0IiwiX3BhaXIiLCJTeW1ib2wiLCJpdGVyYXRvciIsIk9iamVjdCIsImNyZWF0ZSIsImlzUGFpciIsInR5cGUiLCJUcmlwbGUiLCJjIiwiX3RyaXBsZSIsImlzVHJpcGxlIiwicm93cyIsInJvdyIsImNvbCIsIl9wb3NpdGlvbiIsImZyb21UZXh0IiwidGV4dCIsInNwbGl0IiwibWFwIiwiaXNQb3NpdGlvbiIsImNoYXIiLCJOb3RoaW5nIiwibmV3UmVzdWx0VmFsdWUiLCJKdXN0IiwiZXJyIiwiaW5jclBvcyIsIm5lZWRSb3dJbmNyZW1lbnQiLCJsZW5ndGgiLCJ4IiwieSIsIm1hdGNoZWQiLCJzdHIiLCJwYXJzZXJMYWJlbCIsImVycm9yTXNnIiwidmFsdWUiLCJ2YWwiXSwibWFwcGluZ3MiOiI7Ozs7OztZQVlnQkEsSyxHQUFBQSxLO1lBdURBQyxRLEdBQUFBLFE7WUF3Q0FDLEksR0FBQUEsSTtZQWFBQyxPLEdBQUFBLE87WUFNQUMsTyxHQUFBQSxPO1lBTUFDLEksR0FBQUEsSTtZQVlBQyxJLEdBQUFBLEk7OztBQTFJaEIsUUFBTUMsV0FBV0MsTUFBTUMsU0FBTixDQUFnQkYsUUFBakM7O0FBRUFDLFVBQU1DLFNBQU4sQ0FBZ0JGLFFBQWhCLEdBQTJCLFlBQVk7QUFDbkMsZUFBTyxNQUFNQSxTQUFTRyxLQUFULENBQWUsSUFBZixDQUFOLEdBQTZCLEdBQXBDO0FBQ0gsS0FGRDs7QUFJTyxhQUFTVixLQUFULEdBQWlCLENBQ3ZCOztBQUVELGFBQVNXLElBQVQsQ0FBY0MsQ0FBZCxFQUFpQkMsQ0FBakIsRUFBb0I7QUFDaEIsWUFBSUMsU0FBUyxJQUFJQyxLQUFKLENBQVVILENBQVYsRUFB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O0FBQ0g1QixrQkFBTSxNQURIO0FBRUg2QixlQUZHLGlCQUVHO0FBQ0YsdUJBQU9ELEtBQVA7QUFDSCxhQUpFO0FBS0gxQyxvQkFMRyxzQkFLUTtBQUNQLGlDQUFlMEMsS0FBZjtBQUNIO0FBUEUsU0FBUDtBQVNIOztBQUVNLGFBQVMzQyxJQUFULEdBQWdCO0FBQ25CLGVBQU87QUFDSGUsa0JBQU0sTUFESDtBQUVINkIsZUFGRyxpQkFFRztBQUNGLHVCQUFPLElBQVA7QUFDSCxhQUpFO0FBS0gzQyxvQkFMRyxzQkFLUTtBQUNQLHVCQUFPLFFBQVA7QUFDSDtBQVBFLFNBQVA7QUFTSCIsImZpbGUiOiJjbGFzc2VzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtNYXliZX0gZnJvbSAnbWF5YmUnO1xuXG5pbXBvcnQge1xuICAgIGlzUGFpcixcbn0gZnJvbSAndXRpbCc7XG5cbmNvbnN0IHRvU3RyaW5nID0gQXJyYXkucHJvdG90eXBlLnRvU3RyaW5nO1xuXG5BcnJheS5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuICdbJyArIHRvU3RyaW5nLmFwcGx5KHRoaXMpICsgJ10nO1xufTtcblxuZXhwb3J0IGZ1bmN0aW9uIFR1cGxlKCkge1xufVxuXG5mdW5jdGlvbiBQYWlyKGEsIGIpIHtcbiAgICBsZXQgcmVzdWx0ID0gbmV3IF9wYWlyKGEsIGIpO1xuICAgIHJlc3VsdFtTeW1ib2wuaXRlcmF0b3JdID0gZnVuY3Rpb24qKCkge1xuICAgICAgICB5aWVsZCBhO1xuICAgICAgICB5aWVsZCBiO1xuICAgIH07XG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cblBhaXIucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShUdXBsZS5wcm90b3R5cGUpO1xuXG5mdW5jdGlvbiBfcGFpcihhLCBiKSB7XG4gICAgdGhpc1swXSA9IGE7XG4gICAgdGhpc1sxXSA9IGI7XG59XG5fcGFpci5wcm90b3R5cGUuaXNQYWlyID0gdHJ1ZTtcbl9wYWlyLnByb3RvdHlwZS50eXBlID0gJ3BhaXInO1xuX3BhaXIucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiAnWycgKyB0aGlzWzBdICsgJywnICsgdGhpc1sxXSArICddJztcbn07XG5cbmZ1bmN0aW9uIFRyaXBsZShhLCBiLCBjKSB7XG4gICAgbGV0IHJlc3VsdCA9IG5ldyBfdHJpcGxlKGEsIGIsIGMpO1xuICAgIHJlc3VsdFtTeW1ib2wuaXRlcmF0b3JdID0gZnVuY3Rpb24qKCkge1xuICAgICAgICB5aWVsZCBhO1xuICAgICAgICB5aWVsZCBiO1xuICAgICAgICB5aWVsZCBjO1xuICAgIH07XG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cblRyaXBsZS5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFR1cGxlLnByb3RvdHlwZSk7XG5cbmZ1bmN0aW9uIF90cmlwbGUoYSwgYiwgYykge1xuICAgIHRoaXNbMF0gPSBhO1xuICAgIHRoaXNbMV0gPSBiO1xuICAgIHRoaXNbMl0gPSBjO1xufVxuX3RyaXBsZS5wcm90b3R5cGUuaXNUcmlwbGUgPSB0cnVlO1xuX3RyaXBsZS5wcm90b3R5cGUudHlwZSA9ICd0cmlwbGUnO1xuX3RyaXBsZS5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuICdbJyArIHRoaXNbMF0gKyAnLCcgKyB0aGlzWzFdICsgJywnICsgdGhpc1syXSArICddJztcbn07XG5cblR1cGxlLlBhaXIgPSBmdW5jdGlvbiAoYSwgYikge1xuICAgIHJldHVybiBuZXcgUGFpcihhLCBiKTtcbn07XG5UdXBsZS5wcm90b3R5cGUuUGFpciA9IFR1cGxlLlBhaXI7XG5cblR1cGxlLlRyaXBsZSA9IGZ1bmN0aW9uIChhLCBiLCBjKSB7XG4gICAgcmV0dXJuIG5ldyBUcmlwbGUoYSwgYiwgYyk7XG59O1xuVHVwbGUucHJvdG90eXBlLlRyaXBsZSA9IFR1cGxlLlRyaXBsZTtcblxuZXhwb3J0IGZ1bmN0aW9uIFBvc2l0aW9uKHJvd3MgPSBbXSwgcm93ID0gMCwgY29sID0gMCkge1xuICAgIHJldHVybiBuZXcgX3Bvc2l0aW9uKHJvd3MsIHJvdywgY29sKTtcbn1cblxuLy9Qb3NpdGlvbi5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKHt9KTtcblBvc2l0aW9uLmZyb21UZXh0ID0gZnVuY3Rpb24odGV4dCkge1xuICAgIGNvbnN0IHJvd3MgPSB0ZXh0LnNwbGl0KCdcXG4nKVxuICAgICAgICAubWFwKHJvdyA9PiByb3cuc3BsaXQoJycpKTtcbiAgICByZXR1cm4gbmV3IF9wb3NpdGlvbihyb3dzLCAwLCAwKTtcbn07XG5cbmZ1bmN0aW9uIF9wb3NpdGlvbihyb3dzLCByb3csIGNvbCkge1xuICAgIHRoaXMucm93cyA9IHJvd3M7XG4gICAgdGhpcy5yb3cgPSByb3c7XG4gICAgdGhpcy5jb2wgPSBjb2w7XG59XG5cbl9wb3NpdGlvbi5wcm90b3R5cGUuaXNQb3NpdGlvbiA9IHRydWU7XG5fcG9zaXRpb24ucHJvdG90eXBlLmNoYXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgbGV0IHJlc3VsdCA9IE1heWJlLk5vdGhpbmcoKTtcbiAgICB0cnkge1xuICAgICAgICBjb25zdCBuZXdSZXN1bHRWYWx1ZSA9IHRoaXMucm93c1t0aGlzLnJvd11bdGhpcy5jb2xdO1xuICAgICAgICBpZiAodHlwZW9mIG5ld1Jlc3VsdFZhbHVlICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgcmVzdWx0ID0gTWF5YmUuSnVzdChuZXdSZXN1bHRWYWx1ZSk7XG4gICAgICAgIH1cbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbn07XG5fcG9zaXRpb24ucHJvdG90eXBlLmluY3JQb3MgPSBmdW5jdGlvbiAoKSB7XG4gICAgY29uc3QgbmVlZFJvd0luY3JlbWVudCA9ICh0aGlzLmNvbCA9PT0gdGhpcy5yb3dzW3RoaXMucm93XS5sZW5ndGggLSAxKTtcbiAgICByZXR1cm4gUG9zaXRpb24oXG4gICAgICAgIHRoaXMucm93cyxcbiAgICAgICAgKG5lZWRSb3dJbmNyZW1lbnQgPyB0aGlzLnJvdyArIDEgOiB0aGlzLnJvdyksXG4gICAgICAgIChuZWVkUm93SW5jcmVtZW50ID8gMCA6IHRoaXMuY29sICsgMSlcbiAgICApO1xufTtcblxuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gZGVwcmVjYXRlZCBpbiBmYXZvdXIgb2YgVHVwbGUsIGRhdGEuTWF5YmUgYW5kIGRhdGEuVmFsaWRhdGlvblxuZXhwb3J0IGZ1bmN0aW9uIHBhaXIoeCwgeSkge1xuICAgIGxldCByZXN1bHQgPSBbeCwgeV07XG4gICAgcmVzdWx0LnR5cGUgPSAncGFpcic7XG4gICAgcmVzdWx0LnRvU3RyaW5nID0gKCkgPT4ge1xuICAgICAgICByZXR1cm4gJ1snXG4gICAgICAgICAgICArIChpc1BhaXIocmVzdWx0WzBdKSA/IHJlc3VsdFswXS50b1N0cmluZygpIDogcmVzdWx0WzBdKVxuICAgICAgICAgICAgKyAnLCdcbiAgICAgICAgICAgICsgKGlzUGFpcihyZXN1bHRbMV0pID8gcmVzdWx0WzFdLnRvU3RyaW5nKCkgOiByZXN1bHRbMV0pXG4gICAgICAgICAgICArICddJztcbiAgICB9O1xuICAgIHJldHVybiByZXN1bHQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzdWNjZXNzKG1hdGNoZWQsIHN0cikge1xuICAgIGxldCByZXN1bHQgPSBwYWlyKG1hdGNoZWQsIHN0cik7XG4gICAgcmVzdWx0LnR5cGUgPSAnc3VjY2Vzcyc7XG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGZhaWx1cmUocGFyc2VyTGFiZWwsIGVycm9yTXNnKSB7XG4gICAgbGV0IHJlc3VsdCA9IHBhaXIocGFyc2VyTGFiZWwsIGVycm9yTXNnKTtcbiAgICByZXN1bHQudHlwZSA9ICdmYWlsdXJlJztcbiAgICByZXR1cm4gcmVzdWx0O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc29tZSh2YWx1ZSkge1xuICAgIHJldHVybiB7XG4gICAgICAgIHR5cGU6ICdzb21lJyxcbiAgICAgICAgdmFsKCkge1xuICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICB9LFxuICAgICAgICB0b1N0cmluZygpIHtcbiAgICAgICAgICAgIHJldHVybiBgc29tZSgke3ZhbHVlfSlgO1xuICAgICAgICB9XG4gICAgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG5vbmUoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgdHlwZTogJ25vbmUnLFxuICAgICAgICB2YWwoKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfSxcbiAgICAgICAgdG9TdHJpbmcoKSB7XG4gICAgICAgICAgICByZXR1cm4gJ25vbmUoKSc7XG4gICAgICAgIH1cbiAgICB9O1xufVxuIl19