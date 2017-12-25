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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2pzL2NsYXNzZXMuanMiXSwibmFtZXMiOlsiVHVwbGUiLCJQb3NpdGlvbiIsInBhaXIiLCJzdWNjZXNzIiwiZmFpbHVyZSIsInNvbWUiLCJub25lIiwidG9TdHJpbmciLCJBcnJheSIsInByb3RvdHlwZSIsImFwcGx5IiwiUGFpciIsImEiLCJiIiwicmVzdWx0IiwiX3BhaXIiLCJTeW1ib2wiLCJpdGVyYXRvciIsIk9iamVjdCIsImNyZWF0ZSIsImlzUGFpciIsInR5cGUiLCJUcmlwbGUiLCJjIiwiX3RyaXBsZSIsImlzVHJpcGxlIiwicm93cyIsInJvdyIsImNvbCIsIl9wb3NpdGlvbiIsImZyb21UZXh0IiwidGV4dCIsInNwbGl0IiwibWFwIiwiaXNQb3NpdGlvbiIsImNoYXIiLCJOb3RoaW5nIiwibmV3UmVzdWx0VmFsdWUiLCJKdXN0IiwiZXJyIiwiaW5jclBvcyIsIm5lZWRSb3dJbmNyZW1lbnQiLCJsZW5ndGgiLCJyZXN0Iiwic2VsZiIsInJlc3RfaGVscGVyIiwiam9pbiIsIm5leHQiLCJpc05vdGhpbmciLCJ2YWx1ZSIsImNvbmNhdCIsIngiLCJ5IiwibWF0Y2hlZCIsInN0ciIsInBhcnNlckxhYmVsIiwiZXJyb3JNc2ciLCJ2YWwiXSwibWFwcGluZ3MiOiI7Ozs7OztZQVlnQkEsSyxHQUFBQSxLO1lBdURBQyxRLEdBQUFBLFE7WUFzREFDLEksR0FBQUEsSTtZQWFBQyxPLEdBQUFBLE87WUFNQUMsTyxHQUFBQSxPO1lBTUFDLEksR0FBQUEsSTtZQVlBQyxJLEdBQUFBLEk7OztBQXhKaEIsUUFBTUMsV0FBV0MsTUFBTUMsU0FBTixDQUFnQkYsUUFBakM7O0FBRUFDLFVBQU1DLFNBQU4sQ0FBZ0JGLFFBQWhCLEdBQTJCLFlBQVk7QUFDbkMsZUFBTyxNQUFNQSxTQUFTRyxLQUFULENBQWUsSUFBZixDQUFOLEdBQTZCLEdBQXBDO0FBQ0gsS0FGRDs7QUFJTyxhQUFTVixLQUFULEdBQWlCLENBQ3ZCOztBQUVELGFBQVNXLElBQVQsQ0FBY0MsQ0FB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a0JBQU9PLE9BQU8sQ0FBUCxDQUFQLElBQW9CQSxPQUFPLENBQVAsRUFBVVAsUUFBVixFQUFwQixHQUEyQ08sT0FBTyxDQUFQLENBRDNDLElBRUQsR0FGQyxJQUdBLGtCQUFPQSxPQUFPLENBQVAsQ0FBUCxJQUFvQkEsT0FBTyxDQUFQLEVBQVVQLFFBQVYsRUFBcEIsR0FBMkNPLE9BQU8sQ0FBUCxDQUgzQyxJQUlELEdBSk47QUFLSCxTQU5EO0FBT0EsZUFBT0EsTUFBUDtBQUNIOztBQUVNLGFBQVNYLE9BQVQsQ0FBaUJrRCxPQUFqQixFQUEwQkMsR0FBMUIsRUFBK0I7QUFDbEMsWUFBSXhDLFNBQVNaLEtBQUttRCxPQUFMLEVBQWNDLEdBQWQsQ0FBYjtBQUNBeEMsZUFBT08sSUFBUCxHQUFjLFNBQWQ7QUFDQSxlQUFPUCxNQUFQO0FBQ0g7O0FBRU0sYUFBU1YsT0FBVCxDQUFpQm1ELFdBQWpCLEVBQThCQyxRQUE5QixFQUF3QztBQUMzQyxZQUFJMUMsU0FBU1osS0FBS3FELFdBQUwsRUFBa0JDLFFBQWxCLENBQWI7QUFDQTFDLGVBQU9PLElBQVAsR0FBYyxTQUFkO0FBQ0EsZUFBT1AsTUFBUDtBQUNIOztBQUVNLGFBQVNULElBQVQsQ0FBYzRDLEtBQWQsRUFBcUI7QUFDeEIsZUFBTztBQUNINUIsa0JBQU0sTUFESDtBQUVIb0MsZUFGRyxpQkFFRztBQUNGLHVCQUFPUixLQUFQO0FBQ0gsYUFKRTtBQUtIMUMsb0JBTEcsc0JBS1E7QUFDUCxpQ0FBZTBDLEtBQWY7QUFDSDtBQVBFLFNBQVA7QUFTSDs7QUFFTSxhQUFTM0MsSUFBVCxHQUFnQjtBQUNuQixlQUFPO0FBQ0hlLGtCQUFNLE1BREg7QUFFSG9DLGVBRkcsaUJBRUc7QUFDRix1QkFBTyxJQUFQO0FBQ0gsYUFKRTtBQUtIbEQsb0JBTEcsc0JBS1E7QUFDUCx1QkFBTyxRQUFQO0FBQ0g7QUFQRSxTQUFQO0FBU0giLCJmaWxlIjoiY2xhc3Nlcy5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7TWF5YmV9IGZyb20gJ21heWJlJztcblxuaW1wb3J0IHtcbiAgICBpc1BhaXIsXG59IGZyb20gJ3V0aWwnO1xuXG5jb25zdCB0b1N0cmluZyA9IEFycmF5LnByb3RvdHlwZS50b1N0cmluZztcblxuQXJyYXkucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiAnWycgKyB0b1N0cmluZy5hcHBseSh0aGlzKSArICddJztcbn07XG5cbmV4cG9ydCBmdW5jdGlvbiBUdXBsZSgpIHtcbn1cblxuZnVuY3Rpb24gUGFpcihhLCBiKSB7XG4gICAgbGV0IHJlc3VsdCA9IG5ldyBfcGFpcihhLCBiKTtcbiAgICByZXN1bHRbU3ltYm9sLml0ZXJhdG9yXSA9IGZ1bmN0aW9uKigpIHtcbiAgICAgICAgeWllbGQgYTtcbiAgICAgICAgeWllbGQgYjtcbiAgICB9O1xuICAgIHJldHVybiByZXN1bHQ7XG59XG5QYWlyLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoVHVwbGUucHJvdG90eXBlKTtcblxuZnVuY3Rpb24gX3BhaXIoYSwgYikge1xuICAgIHRoaXNbMF0gPSBhO1xuICAgIHRoaXNbMV0gPSBiO1xufVxuX3BhaXIucHJvdG90eXBlLmlzUGFpciA9IHRydWU7XG5fcGFpci5wcm90b3R5cGUudHlwZSA9ICdwYWlyJztcbl9wYWlyLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gJ1snICsgdGhpc1swXS50b1N0cmluZygpICsgJywnICsgdGhpc1sxXS50b1N0cmluZygpICsgJ10nO1xufTtcblxuZnVuY3Rpb24gVHJpcGxlKGEsIGIsIGMpIHtcbiAgICBsZXQgcmVzdWx0ID0gbmV3IF90cmlwbGUoYSwgYiwgYyk7XG4gICAgcmVzdWx0W1N5bWJvbC5pdGVyYXRvcl0gPSBmdW5jdGlvbiooKSB7XG4gICAgICAgIHlpZWxkIGE7XG4gICAgICAgIHlpZWxkIGI7XG4gICAgICAgIHlpZWxkIGM7XG4gICAgfTtcbiAgICByZXR1cm4gcmVzdWx0O1xufVxuVHJpcGxlLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoVHVwbGUucHJvdG90eXBlKTtcblxuZnVuY3Rpb24gX3RyaXBsZShhLCBiLCBjKSB7XG4gICAgdGhpc1swXSA9IGE7XG4gICAgdGhpc1sxXSA9IGI7XG4gICAgdGhpc1syXSA9IGM7XG59XG5fdHJpcGxlLnByb3RvdHlwZS5pc1RyaXBsZSA9IHRydWU7XG5fdHJpcGxlLnByb3RvdHlwZS50eXBlID0gJ3RyaXBsZSc7XG5fdHJpcGxlLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gJ1snICsgdGhpc1swXS50b1N0cmluZygpICsgJywnICsgdGhpc1sxXS50b1N0cmluZygpICsgJywnICsgdGhpc1syXS50b1N0cmluZygpICsgJ10nO1xufTtcblxuVHVwbGUuUGFpciA9IGZ1bmN0aW9uIChhLCBiKSB7XG4gICAgcmV0dXJuIG5ldyBQYWlyKGEsIGIpO1xufTtcblR1cGxlLnByb3RvdHlwZS5QYWlyID0gVHVwbGUuUGFpcjtcblxuVHVwbGUuVHJpcGxlID0gZnVuY3Rpb24gKGEsIGIsIGMpIHtcbiAgICByZXR1cm4gbmV3IFRyaXBsZShhLCBiLCBjKTtcbn07XG5UdXBsZS5wcm90b3R5cGUuVHJpcGxlID0gVHVwbGUuVHJpcGxlO1xuXG5leHBvcnQgZnVuY3Rpb24gUG9zaXRpb24ocm93cyA9IFtdLCByb3cgPSAwLCBjb2wgPSAwKSB7XG4gICAgcmV0dXJuIG5ldyBfcG9zaXRpb24ocm93cywgcm93LCBjb2wpO1xufVxuXG4vL1Bvc2l0aW9uLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoe30pO1xuUG9zaXRpb24uZnJvbVRleHQgPSBmdW5jdGlvbiAodGV4dCkge1xuICAgIGNvbnN0IHJvd3MgPSB0ZXh0LnNwbGl0KCdcXG4nKVxuICAgICAgICAubWFwKHJvdyA9PiByb3cuc3BsaXQoJycpKTtcbiAgICByZXR1cm4gbmV3IF9wb3NpdGlvbihyb3dzLCAwLCAwKTtcbn07XG5cbmZ1bmN0aW9uIF9wb3NpdGlvbihyb3dzLCByb3csIGNvbCkge1xuICAgIHRoaXMucm93cyA9IHJvd3M7XG4gICAgdGhpcy5yb3cgPSByb3c7XG4gICAgdGhpcy5jb2wgPSBjb2w7XG59XG5cbl9wb3NpdGlvbi5wcm90b3R5cGUuaXNQb3NpdGlvbiA9IHRydWU7XG5fcG9zaXRpb24ucHJvdG90eXBlLmNoYXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgbGV0IHJlc3VsdCA9IE1heWJlLk5vdGhpbmcoKTtcbiAgICB0cnkge1xuICAgICAgICBjb25zdCBuZXdSZXN1bHRWYWx1ZSA9IHRoaXMucm93c1t0aGlzLnJvd11bdGhpcy5jb2xdO1xuICAgICAgICBpZiAodHlwZW9mIG5ld1Jlc3VsdFZhbHVlICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgcmVzdWx0ID0gTWF5YmUuSnVzdChuZXdSZXN1bHRWYWx1ZSk7XG4gICAgICAgIH1cbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbn07XG5fcG9zaXRpb24ucHJvdG90eXBlLmluY3JQb3MgPSBmdW5jdGlvbiAoKSB7XG4gICAgY29uc3QgbmVlZFJvd0luY3JlbWVudCA9ICh0aGlzLmNvbCA9PT0gdGhpcy5yb3dzW3RoaXMucm93XS5sZW5ndGggLSAxKTtcbiAgICByZXR1cm4gUG9zaXRpb24oXG4gICAgICAgIHRoaXMucm93cyxcbiAgICAgICAgKG5lZWRSb3dJbmNyZW1lbnQgPyB0aGlzLnJvdyArIDEgOiB0aGlzLnJvdyksXG4gICAgICAgIChuZWVkUm93SW5jcmVtZW50ID8gMCA6IHRoaXMuY29sICsgMSlcbiAgICApO1xufTtcbl9wb3NpdGlvbi5wcm90b3R5cGUucmVzdCA9IGZ1bmN0aW9uICgpIHtcbiAgICBjb25zdCBzZWxmID0gdGhpcztcbiAgICByZXR1cm4gcmVzdF9oZWxwZXIoKS5qb2luKCcnKTtcbiAgICBmdW5jdGlvbiByZXN0X2hlbHBlcigpIHtcbiAgICAgICAgY29uc3QgbmV4dCA9IHNlbGYuY2hhcigpO1xuICAgICAgICBpZiAobmV4dC5pc05vdGhpbmcpIHJldHVybiBbXTtcbiAgICAgICAgcmV0dXJuIFtuZXh0LnZhbHVlXS5jb25jYXQoc2VsZi5pbmNyUG9zKCkucmVzdCgpKTtcbiAgICB9XG59O1xuX3Bvc2l0aW9uLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gJ3Jvdz0nICsgdGhpcy5yb3dcbiAgICAgICAgKyAnO2NvbD0nICsgdGhpcy5jb2xcbiAgICAgICAgKyAnO3Jlc3Q9JyArIHRoaXMucmVzdCgpO1xufTtcblxuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gZGVwcmVjYXRlZCBpbiBmYXZvdXIgb2YgVHVwbGUsIGRhdGEuTWF5YmUgYW5kIGRhdGEuVmFsaWRhdGlvblxuZXhwb3J0IGZ1bmN0aW9uIHBhaXIoeCwgeSkge1xuICAgIGxldCByZXN1bHQgPSBbeCwgeV07XG4gICAgcmVzdWx0LnR5cGUgPSAncGFpcic7XG4gICAgcmVzdWx0LnRvU3RyaW5nID0gKCkgPT4ge1xuICAgICAgICByZXR1cm4gJ1snXG4gICAgICAgICAgICArIChpc1BhaXIocmVzdWx0WzBdKSA/IHJlc3VsdFswXS50b1N0cmluZygpIDogcmVzdWx0WzBdKVxuICAgICAgICAgICAgKyAnLCdcbiAgICAgICAgICAgICsgKGlzUGFpcihyZXN1bHRbMV0pID8gcmVzdWx0WzFdLnRvU3RyaW5nKCkgOiByZXN1bHRbMV0pXG4gICAgICAgICAgICArICddJztcbiAgICB9O1xuICAgIHJldHVybiByZXN1bHQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzdWNjZXNzKG1hdGNoZWQsIHN0cikge1xuICAgIGxldCByZXN1bHQgPSBwYWlyKG1hdGNoZWQsIHN0cik7XG4gICAgcmVzdWx0LnR5cGUgPSAnc3VjY2Vzcyc7XG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGZhaWx1cmUocGFyc2VyTGFiZWwsIGVycm9yTXNnKSB7XG4gICAgbGV0IHJlc3VsdCA9IHBhaXIocGFyc2VyTGFiZWwsIGVycm9yTXNnKTtcbiAgICByZXN1bHQudHlwZSA9ICdmYWlsdXJlJztcbiAgICByZXR1cm4gcmVzdWx0O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc29tZSh2YWx1ZSkge1xuICAgIHJldHVybiB7XG4gICAgICAgIHR5cGU6ICdzb21lJyxcbiAgICAgICAgdmFsKCkge1xuICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICB9LFxuICAgICAgICB0b1N0cmluZygpIHtcbiAgICAgICAgICAgIHJldHVybiBgc29tZSgke3ZhbHVlfSlgO1xuICAgICAgICB9XG4gICAgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG5vbmUoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgdHlwZTogJ25vbmUnLFxuICAgICAgICB2YWwoKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfSxcbiAgICAgICAgdG9TdHJpbmcoKSB7XG4gICAgICAgICAgICByZXR1cm4gJ25vbmUoKSc7XG4gICAgICAgIH1cbiAgICB9O1xufVxuIl19