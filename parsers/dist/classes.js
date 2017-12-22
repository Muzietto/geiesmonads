define(['exports', 'maybe', 'util'], function (exports, _maybe, _util) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.Tuple = Tuple;
    exports.Pair = Pair;
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
        return new _pair(a, b);
    }

    function _pair(a, b) {
        this[0] = a;
        this[1] = b;
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

    function Position() {
        var rows = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
        var row = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
        var col = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;

        return new _position(rows, row, col);
    }

    function _position(rows, row, col) {
        this.rows = rows;
        this.row = row;
        this.col = col;
    }

    _position.prototype.isPosition = true;
    _position.prototype.char = function () {
        var result = _maybe.Maybe.Nothing();
        try {
            result = _maybe.Maybe.Just(this.rows[this.row][this.col]);
        } catch (err) {}
        return result;
    };
    _position.prototype.incrPos = function () {
        var needRowIncrement = this.col === this.rows[this.row].length - 1;
        return Position(this.rows, needRowIncrement ? this.row + 1 : this.row, needRowIncrement ? 0 : this.col + 1);
    };

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2pzL2NsYXNzZXMuanMiXSwibmFtZXMiOlsiVHVwbGUiLCJQYWlyIiwiUG9zaXRpb24iLCJwYWlyIiwic3VjY2VzcyIsImZhaWx1cmUiLCJzb21lIiwibm9uZSIsInRvU3RyaW5nIiwiQXJyYXkiLCJwcm90b3R5cGUiLCJhcHBseSIsImEiLCJiIiwiX3BhaXIiLCJfdHJpcGxlIiwiYyIsImlzUGFpciIsInR5cGUiLCJyb3dzIiwicm93IiwiY29sIiwiX3Bvc2l0aW9uIiwiaXNQb3NpdGlvbiIsImNoYXIiLCJyZXN1bHQiLCJOb3RoaW5nIiwiSnVzdCIsImVyciIsImluY3JQb3MiLCJuZWVkUm93SW5jcmVtZW50IiwibGVuZ3RoIiwieCIsInkiLCJtYXRjaGVkIiwic3RyIiwicGFyc2VyTGFiZWwiLCJlcnJvck1zZyIsInZhbHVlIiwidmFsIl0sIm1hcHBpbmdzIjoiOzs7Ozs7WUFZZ0JBLEssR0FBQUEsSztZQUVBQyxJLEdBQUFBLEk7WUFxQkFDLFEsR0FBQUEsUTtZQTJCQUMsSSxHQUFBQSxJO1lBYUFDLE8sR0FBQUEsTztZQU1BQyxPLEdBQUFBLE87WUFNQUMsSSxHQUFBQSxJO1lBWUFDLEksR0FBQUEsSTs7O0FBN0ZoQixRQUFNQyxXQUFXQyxNQUFNQyxTQUFOLENBQWdCRixRQUFqQzs7QUFFQUMsVUFBTUMsU0FBTixDQUFnQkYsUUFBaEIsR0FBMkIsWUFBWTtBQUNuQyxlQUFPLE1BQU1BLFNBQVNHLEtBQVQsQ0FBZSxJQUFmLENBQU4sR0FBNkIsR0FBcEM7QUFDSCxLQUZEOztBQUlPLGFBQVNYLEtBQVQsR0FBaUIsQ0FBRTs7QUFFbkIsYUFBU0MsSUFBVCxDQUFjVyxDQUFkLEVBQWlCQyxDQUFqQixFQUFvQjtBQUN2QixlQUFPLElBQUlDLEtBQUosQ0FBVUYsQ0FBVixFQUFhQyxDQUFiLENBQVA7QUFDSDs7QUFFRCxhQUFTQyxLQUFULENBQWVGLENBQWYsRUFBa0JDLENBQWxCLEVBQXFCO0FBQ2pCLGFBQUssQ0FBTCxJQUFVRCxDQUFWO0FBQ0Es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QVNwQixPQUFULENBQWlCK0IsV0FBakIsRUFBOEJDLFFBQTlCLEVBQXdDO0FBQzNDLFlBQUlaLFNBQVN0QixLQUFLaUMsV0FBTCxFQUFrQkMsUUFBbEIsQ0FBYjtBQUNBWixlQUFPUCxJQUFQLEdBQWMsU0FBZDtBQUNBLGVBQU9PLE1BQVA7QUFDSDs7QUFFTSxhQUFTbkIsSUFBVCxDQUFjZ0MsS0FBZCxFQUFxQjtBQUN4QixlQUFPO0FBQ0hwQixrQkFBTSxNQURIO0FBRUhxQixlQUZHLGlCQUVHO0FBQ0YsdUJBQU9ELEtBQVA7QUFDSCxhQUpFO0FBS0g5QixvQkFMRyxzQkFLUTtBQUNQLGlDQUFlOEIsS0FBZjtBQUNIO0FBUEUsU0FBUDtBQVNIOztBQUVNLGFBQVMvQixJQUFULEdBQWdCO0FBQ25CLGVBQU87QUFDSFcsa0JBQU0sTUFESDtBQUVIcUIsZUFGRyxpQkFFRztBQUNGLHVCQUFPLElBQVA7QUFDSCxhQUpFO0FBS0gvQixvQkFMRyxzQkFLUTtBQUNQLHVCQUFPLFFBQVA7QUFDSDtBQVBFLFNBQVA7QUFTSCIsImZpbGUiOiJjbGFzc2VzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtNYXliZX0gZnJvbSAnbWF5YmUnO1xuXG5pbXBvcnQge1xuICAgIGlzUGFpcixcbn0gZnJvbSAndXRpbCc7XG5cbmNvbnN0IHRvU3RyaW5nID0gQXJyYXkucHJvdG90eXBlLnRvU3RyaW5nO1xuXG5BcnJheS5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuICdbJyArIHRvU3RyaW5nLmFwcGx5KHRoaXMpICsgJ10nO1xufTtcblxuZXhwb3J0IGZ1bmN0aW9uIFR1cGxlKCkge31cblxuZXhwb3J0IGZ1bmN0aW9uIFBhaXIoYSwgYikge1xuICAgIHJldHVybiBuZXcgX3BhaXIoYSwgYik7XG59XG5cbmZ1bmN0aW9uIF9wYWlyKGEsIGIpIHtcbiAgICB0aGlzWzBdID0gYTtcbiAgICB0aGlzWzFdID0gYjtcbn1cblxuZnVuY3Rpb24gX3RyaXBsZShhLCBiLCBjKSB7XG4gICAgdGhpc1swXSA9IGE7XG4gICAgdGhpc1sxXSA9IGI7XG4gICAgdGhpc1syXSA9IGM7XG59XG5cbl9wYWlyLnByb3RvdHlwZS5pc1BhaXIgPSB0cnVlO1xuX3BhaXIucHJvdG90eXBlLnR5cGUgPSAncGFpcic7XG5fcGFpci5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuICdbJyArIHRoaXNbMF0gKyAnLCcgKyB0aGlzWzFdICsgJ10nO1xufTtcblxuZXhwb3J0IGZ1bmN0aW9uIFBvc2l0aW9uKHJvd3MgPSBbXSwgcm93ID0gMCwgY29sID0gMCkge1xuICAgIHJldHVybiBuZXcgX3Bvc2l0aW9uKHJvd3MsIHJvdywgY29sKTtcbn1cblxuZnVuY3Rpb24gX3Bvc2l0aW9uKHJvd3MsIHJvdywgY29sKSB7XG4gICAgdGhpcy5yb3dzID0gcm93cztcbiAgICB0aGlzLnJvdyA9IHJvdztcbiAgICB0aGlzLmNvbCA9IGNvbDtcbn1cblxuX3Bvc2l0aW9uLnByb3RvdHlwZS5pc1Bvc2l0aW9uID0gdHJ1ZTtcbl9wb3NpdGlvbi5wcm90b3R5cGUuY2hhciA9IGZ1bmN0aW9uICgpIHtcbiAgICBsZXQgcmVzdWx0ID0gTWF5YmUuTm90aGluZygpO1xuICAgIHRyeSB7XG4gICAgICAgIHJlc3VsdCA9IE1heWJlLkp1c3QodGhpcy5yb3dzW3RoaXMucm93XVt0aGlzLmNvbF0pO1xuICAgIH0gY2F0Y2ggKGVycikge31cbiAgICByZXR1cm4gcmVzdWx0O1xufTtcbl9wb3NpdGlvbi5wcm90b3R5cGUuaW5jclBvcyA9IGZ1bmN0aW9uICgpIHtcbiAgICBjb25zdCBuZWVkUm93SW5jcmVtZW50ID0gKHRoaXMuY29sID09PSB0aGlzLnJvd3NbdGhpcy5yb3ddLmxlbmd0aCAtIDEpO1xuICAgIHJldHVybiBQb3NpdGlvbihcbiAgICAgICAgdGhpcy5yb3dzLFxuICAgICAgICAobmVlZFJvd0luY3JlbWVudCA/IHRoaXMucm93ICsgMSA6IHRoaXMucm93KSxcbiAgICAgICAgKG5lZWRSb3dJbmNyZW1lbnQgPyAwIDogdGhpcy5jb2wgKyAxKVxuICAgICk7XG59O1xuXG5leHBvcnQgZnVuY3Rpb24gcGFpcih4LCB5KSB7XG4gICAgbGV0IHJlc3VsdCA9IFt4LCB5XTtcbiAgICByZXN1bHQudHlwZSA9ICdwYWlyJztcbiAgICByZXN1bHQudG9TdHJpbmcgPSAoKSA9PiB7XG4gICAgICAgIHJldHVybiAnWydcbiAgICAgICAgICAgICsgKGlzUGFpcihyZXN1bHRbMF0pID8gcmVzdWx0WzBdLnRvU3RyaW5nKCkgOiByZXN1bHRbMF0pXG4gICAgICAgICAgICArICcsJ1xuICAgICAgICAgICAgKyAoaXNQYWlyKHJlc3VsdFsxXSkgPyByZXN1bHRbMV0udG9TdHJpbmcoKSA6IHJlc3VsdFsxXSlcbiAgICAgICAgICAgICsgJ10nO1xuICAgIH07XG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHN1Y2Nlc3MobWF0Y2hlZCwgc3RyKSB7XG4gICAgbGV0IHJlc3VsdCA9IHBhaXIobWF0Y2hlZCwgc3RyKTtcbiAgICByZXN1bHQudHlwZSA9ICdzdWNjZXNzJztcbiAgICByZXR1cm4gcmVzdWx0O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZmFpbHVyZShwYXJzZXJMYWJlbCwgZXJyb3JNc2cpIHtcbiAgICBsZXQgcmVzdWx0ID0gcGFpcihwYXJzZXJMYWJlbCwgZXJyb3JNc2cpO1xuICAgIHJlc3VsdC50eXBlID0gJ2ZhaWx1cmUnO1xuICAgIHJldHVybiByZXN1bHQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzb21lKHZhbHVlKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgdHlwZTogJ3NvbWUnLFxuICAgICAgICB2YWwoKSB7XG4gICAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgIH0sXG4gICAgICAgIHRvU3RyaW5nKCkge1xuICAgICAgICAgICAgcmV0dXJuIGBzb21lKCR7dmFsdWV9KWA7XG4gICAgICAgIH1cbiAgICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbm9uZSgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICB0eXBlOiAnbm9uZScsXG4gICAgICAgIHZhbCgpIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9LFxuICAgICAgICB0b1N0cmluZygpIHtcbiAgICAgICAgICAgIHJldHVybiAnbm9uZSgpJztcbiAgICAgICAgfVxuICAgIH07XG59XG4iXX0=