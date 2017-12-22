define(['exports', 'maybe', 'util'], function (exports, _maybe, _util) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
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

    function Pair(a, b) {
        return new _pair(a, b);
    }

    function _pair(a, b) {
        this[0] = a;
        this[1] = b;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2pzL2NsYXNzZXMuanMiXSwibmFtZXMiOlsiUGFpciIsIlBvc2l0aW9uIiwicGFpciIsInN1Y2Nlc3MiLCJmYWlsdXJlIiwic29tZSIsIm5vbmUiLCJ0b1N0cmluZyIsIkFycmF5IiwicHJvdG90eXBlIiwiYXBwbHkiLCJhIiwiYiIsIl9wYWlyIiwiaXNQYWlyIiwidHlwZSIsInJvd3MiLCJyb3ciLCJjb2wiLCJfcG9zaXRpb24iLCJpc1Bvc2l0aW9uIiwiY2hhciIsInJlc3VsdCIsIk5vdGhpbmciLCJKdXN0IiwiZXJyIiwiaW5jclBvcyIsIm5lZWRSb3dJbmNyZW1lbnQiLCJsZW5ndGgiLCJ4IiwieSIsIm1hdGNoZWQiLCJzdHIiLCJwYXJzZXJMYWJlbCIsImVycm9yTXNnIiwidmFsdWUiLCJ2YWwiXSwibWFwcGluZ3MiOiI7Ozs7OztZQVlnQkEsSSxHQUFBQSxJO1lBZUFDLFEsR0FBQUEsUTtZQTJCQUMsSSxHQUFBQSxJO1lBYUFDLE8sR0FBQUEsTztZQU1BQyxPLEdBQUFBLE87WUFNQUMsSSxHQUFBQSxJO1lBWUFDLEksR0FBQUEsSTs7O0FBckZoQixRQUFNQyxXQUFXQyxNQUFNQyxTQUFOLENBQWdCRixRQUFqQzs7QUFFQUMsVUFBTUMsU0FBTixDQUFnQkYsUUFBaEIsR0FBMkIsWUFBWTtBQUNuQyxlQUFPLE1BQU1BLFNBQVNHLEtBQVQsQ0FBZSxJQUFmLENBQU4sR0FBNkIsR0FBcEM7QUFDSCxLQUZEOztBQUlPLGFBQVNWLElBQVQsQ0FBY1csQ0FBZCxFQUFpQkMsQ0FBakIsRUFBb0I7QUFDdkIsZUFBTyxJQUFJQyxLQUFKLENBQVVGLENBQVYsRUFBYUMsQ0FBYixDQUFQO0FBQ0g7O0FBRUQsYUFBU0MsS0FBVCxDQUFlRixDQUFmLEVBQWtCQyxDQUFsQixFQUFxQjtBQUNqQixhQUFLLENBQUwsSUFBVUQsQ0FBVjtBQUNBLGFBQUssQ0FBTCxJQUFVQyxDQUFWO0FBQ0g7O0FBRURDLFVBQU1KLFNBQU4sQ0FBZ0JLLE1BQWhCLEdBQXlCLElBQXpC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O0FBQ0YsdUJBQU9ELEtBQVA7QUFDSCxhQUpFO0FBS0g1QixvQkFMRyxzQkFLUTtBQUNQLGlDQUFlNEIsS0FBZjtBQUNIO0FBUEUsU0FBUDtBQVNIOztBQUVNLGFBQVM3QixJQUFULEdBQWdCO0FBQ25CLGVBQU87QUFDSFMsa0JBQU0sTUFESDtBQUVIcUIsZUFGRyxpQkFFRztBQUNGLHVCQUFPLElBQVA7QUFDSCxhQUpFO0FBS0g3QixvQkFMRyxzQkFLUTtBQUNQLHVCQUFPLFFBQVA7QUFDSDtBQVBFLFNBQVA7QUFTSCIsImZpbGUiOiJjbGFzc2VzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtNYXliZX0gZnJvbSAnbWF5YmUnO1xuXG5pbXBvcnQge1xuICAgIGlzUGFpcixcbn0gZnJvbSAndXRpbCc7XG5cbmNvbnN0IHRvU3RyaW5nID0gQXJyYXkucHJvdG90eXBlLnRvU3RyaW5nO1xuXG5BcnJheS5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuICdbJyArIHRvU3RyaW5nLmFwcGx5KHRoaXMpICsgJ10nO1xufTtcblxuZXhwb3J0IGZ1bmN0aW9uIFBhaXIoYSwgYikge1xuICAgIHJldHVybiBuZXcgX3BhaXIoYSwgYik7XG59XG5cbmZ1bmN0aW9uIF9wYWlyKGEsIGIpIHtcbiAgICB0aGlzWzBdID0gYTtcbiAgICB0aGlzWzFdID0gYjtcbn1cblxuX3BhaXIucHJvdG90eXBlLmlzUGFpciA9IHRydWU7XG5fcGFpci5wcm90b3R5cGUudHlwZSA9ICdwYWlyJztcbl9wYWlyLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gJ1snICsgdGhpc1swXSArICcsJyArIHRoaXNbMV0gKyAnXSc7XG59O1xuXG5leHBvcnQgZnVuY3Rpb24gUG9zaXRpb24ocm93cyA9IFtdLCByb3cgPSAwLCBjb2wgPSAwKSB7XG4gICAgcmV0dXJuIG5ldyBfcG9zaXRpb24ocm93cywgcm93LCBjb2wpO1xufVxuXG5mdW5jdGlvbiBfcG9zaXRpb24ocm93cywgcm93LCBjb2wpIHtcbiAgICB0aGlzLnJvd3MgPSByb3dzO1xuICAgIHRoaXMucm93ID0gcm93O1xuICAgIHRoaXMuY29sID0gY29sO1xufVxuXG5fcG9zaXRpb24ucHJvdG90eXBlLmlzUG9zaXRpb24gPSB0cnVlO1xuX3Bvc2l0aW9uLnByb3RvdHlwZS5jaGFyID0gZnVuY3Rpb24gKCkge1xuICAgIGxldCByZXN1bHQgPSBNYXliZS5Ob3RoaW5nKCk7XG4gICAgdHJ5IHtcbiAgICAgICAgcmVzdWx0ID0gTWF5YmUuSnVzdCh0aGlzLnJvd3NbdGhpcy5yb3ddW3RoaXMuY29sXSk7XG4gICAgfSBjYXRjaCAoZXJyKSB7fVxuICAgIHJldHVybiByZXN1bHQ7XG59O1xuX3Bvc2l0aW9uLnByb3RvdHlwZS5pbmNyUG9zID0gZnVuY3Rpb24gKCkge1xuICAgIGNvbnN0IG5lZWRSb3dJbmNyZW1lbnQgPSAodGhpcy5jb2wgPT09IHRoaXMucm93c1t0aGlzLnJvd10ubGVuZ3RoIC0gMSk7XG4gICAgcmV0dXJuIFBvc2l0aW9uKFxuICAgICAgICB0aGlzLnJvd3MsXG4gICAgICAgIChuZWVkUm93SW5jcmVtZW50ID8gdGhpcy5yb3cgKyAxIDogdGhpcy5yb3cpLFxuICAgICAgICAobmVlZFJvd0luY3JlbWVudCA/IDAgOiB0aGlzLmNvbCArIDEpXG4gICAgKTtcbn07XG5cbmV4cG9ydCBmdW5jdGlvbiBwYWlyKHgsIHkpIHtcbiAgICBsZXQgcmVzdWx0ID0gW3gsIHldO1xuICAgIHJlc3VsdC50eXBlID0gJ3BhaXInO1xuICAgIHJlc3VsdC50b1N0cmluZyA9ICgpID0+IHtcbiAgICAgICAgcmV0dXJuICdbJ1xuICAgICAgICAgICAgKyAoaXNQYWlyKHJlc3VsdFswXSkgPyByZXN1bHRbMF0udG9TdHJpbmcoKSA6IHJlc3VsdFswXSlcbiAgICAgICAgICAgICsgJywnXG4gICAgICAgICAgICArIChpc1BhaXIocmVzdWx0WzFdKSA/IHJlc3VsdFsxXS50b1N0cmluZygpIDogcmVzdWx0WzFdKVxuICAgICAgICAgICAgKyAnXSc7XG4gICAgfTtcbiAgICByZXR1cm4gcmVzdWx0O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc3VjY2VzcyhtYXRjaGVkLCBzdHIpIHtcbiAgICBsZXQgcmVzdWx0ID0gcGFpcihtYXRjaGVkLCBzdHIpO1xuICAgIHJlc3VsdC50eXBlID0gJ3N1Y2Nlc3MnO1xuICAgIHJldHVybiByZXN1bHQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBmYWlsdXJlKHBhcnNlckxhYmVsLCBlcnJvck1zZykge1xuICAgIGxldCByZXN1bHQgPSBwYWlyKHBhcnNlckxhYmVsLCBlcnJvck1zZyk7XG4gICAgcmVzdWx0LnR5cGUgPSAnZmFpbHVyZSc7XG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNvbWUodmFsdWUpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICB0eXBlOiAnc29tZScsXG4gICAgICAgIHZhbCgpIHtcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgICAgfSxcbiAgICAgICAgdG9TdHJpbmcoKSB7XG4gICAgICAgICAgICByZXR1cm4gYHNvbWUoJHt2YWx1ZX0pYDtcbiAgICAgICAgfVxuICAgIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBub25lKCkge1xuICAgIHJldHVybiB7XG4gICAgICAgIHR5cGU6ICdub25lJyxcbiAgICAgICAgdmFsKCkge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH0sXG4gICAgICAgIHRvU3RyaW5nKCkge1xuICAgICAgICAgICAgcmV0dXJuICdub25lKCknO1xuICAgICAgICB9XG4gICAgfTtcbn1cbiJdfQ==