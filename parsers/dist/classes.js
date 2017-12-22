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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2pzL2NsYXNzZXMuanMiXSwibmFtZXMiOlsiVHVwbGUiLCJQYWlyIiwiUG9zaXRpb24iLCJwYWlyIiwic3VjY2VzcyIsImZhaWx1cmUiLCJzb21lIiwibm9uZSIsInRvU3RyaW5nIiwiQXJyYXkiLCJwcm90b3R5cGUiLCJhcHBseSIsImEiLCJiIiwiX3BhaXIiLCJpc1BhaXIiLCJ0eXBlIiwicm93cyIsInJvdyIsImNvbCIsIl9wb3NpdGlvbiIsImlzUG9zaXRpb24iLCJjaGFyIiwicmVzdWx0IiwiTm90aGluZyIsIkp1c3QiLCJlcnIiLCJpbmNyUG9zIiwibmVlZFJvd0luY3JlbWVudCIsImxlbmd0aCIsIngiLCJ5IiwibWF0Y2hlZCIsInN0ciIsInBhcnNlckxhYmVsIiwiZXJyb3JNc2ciLCJ2YWx1ZSIsInZhbCJdLCJtYXBwaW5ncyI6Ijs7Ozs7O1lBWWdCQSxLLEdBQUFBLEs7WUFFQUMsSSxHQUFBQSxJO1lBZUFDLFEsR0FBQUEsUTtZQTJCQUMsSSxHQUFBQSxJO1lBYUFDLE8sR0FBQUEsTztZQU1BQyxPLEdBQUFBLE87WUFNQUMsSSxHQUFBQSxJO1lBWUFDLEksR0FBQUEsSTs7O0FBdkZoQixRQUFNQyxXQUFXQyxNQUFNQyxTQUFOLENBQWdCRixRQUFqQzs7QUFFQUMsVUFBTUMsU0FBTixDQUFnQkYsUUFBaEIsR0FBMkIsWUFBWTtBQUNuQyxlQUFPLE1BQU1BLFNBQVNHLEtBQVQsQ0FBZSxJQUFmLENBQU4sR0FBNkIsR0FBcEM7QUFDSCxLQUZEOztBQUlPLGFBQVNYLEtBQVQsR0FBaUIsQ0FBRTs7QUFFbkIsYUFBU0MsSUFBVCxDQUFjVyxDQUFkLEVBQWlCQyxDQUFqQixFQUFvQjtBQUN2QixlQUFPLElBQUlDLEtBQUosQ0FBVUYsQ0FBVixFQUFhQyxDQUFiLENBQVA7QUFDSDs7QUFFRCxhQUFTQyxLQUFULENBQWVGLENBQWYsRUFBa0JDLENBQWxCLEVBQXFCO0FBQ2pCLGFBQUssQ0FBTCxJQUFVRCxDQUFWO0FBQ0EsYUFBSyxDQUFMLElBQVVDLENBQVY7QUFDSDs7QUFFREMsVUFBTUosU0FBTixDQUFnQkssTUFBaEIsR0FBeUIsSUFBekI7QUFDQUQsVUFBTUosU0FBTixDQUFnQk0sSUFBaEIsR0FBdUIsTUFBdkI7QUFDQUYsVUFBTUosU0FBTixDQUFnQkYsUUFBaEIsR0FBMkIsWUFBWTtBQUNuQyxlQUFPLE1BQU0sS0FBSyxDQUFMLENBQU4sR0FBZ0IsR0FBaEIsR0FBc0IsS0FBSyxDQUFMLENBQXRCLEdBQWdDLEdBQXZDO0FBQ0gsS0FGRDs7QUFJTyxhQUFTTixRQUFULEdBQStDO0FBQUEsWUFBN0JlLElBQTZCLHVFQUF0QixFQUFzQjtBQUFBLFlBQWxCQyxHQUFrQix1RUFBWixDQUFZO0FBQUEsWUFBVEMsR0FBUyx1RUFBSCxDQUFHOztBQUNsRCxlQUFPLElBQUlDLFNBQUosQ0FBY0gsSUFBZCxFQUFvQkMsR0FBcEIsRUFBeUJDLEdBQXpCLENBQVA7QUFDSDs7QUFFRCxhQUFTQyxTQUFULENBQW1CSCxJQUFuQixFQUF5QkMsR0FBekIsRUFBOEJDLEdBQTlCLEVBQW1DO0FBQy9CLGFBQUtGLElBQUwsR0FBWUEsSUFBWjtBQUNBLGFBQUtDLEdBQUwsR0FBV0EsR0FBWDtBQUNBLGFBQUtDLEdBQUwsR0FBV0EsR0FBWDtBQUNIOztBQUVEQyxjQUFVVixTQUFWLENBQW9CVyxVQUFwQixHQUFpQyxJQUFqQztBQUNBRCxjQUFVVixTQUFWLENBQW9CWSxJQUFwQixHQUEyQixZQUFZO0FBQ25DLFlBQUlDLFNBQVMsYUFBTUMsT0FBTixFQUFiO0FBQ0EsWUFBSTtBQUNBRCxxQkFBUyxhQUFNRSxJQUFOLENBQVcsS0FBS1IsSUFBTCxDQUFVLEtBQUtDLEdBQWYsRUFBb0IsS0FBS0MsR0FBekIsQ0FBWCxDQUFUO0FBQ0gsU0FGRCxDQUVFLE9BQU9PLEdBQVAsRUFBWSxDQUFFO0FBQ2hCLGVBQU9ILE1BQVA7QUFDSCxLQU5EO0FBT0FILGNBQVVWLFNBQVYsQ0FBb0JpQixPQUFwQixHQUE4QixZQUFZO0FBQ3RDLFlBQU1DLG1CQUFvQixLQUFLVCxHQUFMLEtBQWEsS0FBS0YsSUFBTCxDQUFVLEtBQUtDLEdBQWYsRUFBb0JXLE1BQXBCLEdBQTZCLENBQXBFO0FBQ0EsZUFBTzNCLFNBQ0gsS0FBS2UsSUFERixFQUVGVyxtQkFBbUIsS0FBS1YsR0FBTCxHQUFXLENBQTlCLEdBQWtDLEtBQUtBLEdBRnJDLEVBR0ZVLG1CQUFtQixDQUFuQixHQUF1QixLQUFLVCxHQUFMLEdBQVcsQ0FIaEMsQ0FBUDtBQUtILEtBUEQ7O0FBU08sYUFBU2hCLElBQVQsQ0FBYzJCLENBQWQsRUFBaUJDLENBQWpCLEVBQW9CO0FBQ3ZCLFlBQUlSLFNBQVMsQ0FBQ08sQ0FBRCxFQUFJQyxDQUFKLENBQWI7QUFDQVIsZUFBT1AsSUFBUCxHQUFjLE1BQWQ7QUFDQU8sZUFBT2YsUUFBUCxHQUFrQixZQUFNO0FBQ3BCLG1CQUFPLE9BQ0Esa0JBQU9lLE9BQU8sQ0FBUCxDQUFQLElBQW9CQSxPQUFPLENBQVAsRUFBVWYsUUFBVixFQUFwQixHQUEyQ2UsT0FBTyxDQUFQLENBRDNDLElBRUQsR0FGQyxJQUdBLGtCQUFPQSxPQUFPLENBQVAsQ0FBUCxJQUFvQkEsT0FBTyxDQUFQLEVBQVVmLFFBQVYsRUFBcEIsR0FBMkNlLE9BQU8sQ0FBUCxDQUgzQyxJQUlELEdBSk47QUFLSCxTQU5EO0FBT0EsZUFBT0EsTUFBUDtBQUNIOztBQUVNLGFBQVNuQixPQUFULENBQWlCNEIsT0FBakIsRUFBMEJDLEdBQTFCLEVBQStCO0FBQ2xDLFlBQUlWLFNBQVNwQixLQUFLNkIsT0FBTCxFQUFjQyxHQUFkLENBQWI7QUFDQVYsZUFBT1AsSUFBUCxHQUFjLFNBQWQ7QUFDQSxlQUFPTyxNQUFQO0FBQ0g7O0FBRU0sYUFBU2xCLE9BQVQsQ0FBaUI2QixXQUFqQixFQUE4QkMsUUFBOUIsRUFBd0M7QUFDM0MsWUFBSVosU0FBU3BCLEtBQUsrQixXQUFMLEVBQWtCQyxRQUFsQixDQUFiO0FBQ0FaLGVBQU9QLElBQVAsR0FBYyxTQUFkO0FBQ0EsZUFBT08sTUFBUDtBQUNIOztBQUVNLGFBQVNqQixJQUFULENBQWM4QixLQUFkLEVBQXFCO0FBQ3hCLGVBQU87QUFDSHBCLGtCQUFNLE1BREg7QUFFSHFCLGVBRkcsaUJBRUc7QUFDRix1QkFBT0QsS0FBUDtBQUNILGFBSkU7QUFLSDVCLG9CQUxHLHNCQUtRO0FBQ1AsaUNBQWU0QixLQUFmO0FBQ0g7QUFQRSxTQUFQO0FBU0g7O0FBRU0sYUFBUzdCLElBQVQsR0FBZ0I7QUFDbkIsZUFBTztBQUNIUyxrQkFBTSxNQURIO0FBRUhxQixlQUZHLGlCQUVHO0FBQ0YsdUJBQU8sSUFBUDtBQUNILGFBSkU7QUFLSDdCLG9CQUxHLHNCQUtRO0FBQ1AsdUJBQU8sUUFBUDtBQUNIO0FBUEUsU0FBUDtBQVNIIiwiZmlsZSI6ImNsYXNzZXMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge01heWJlfSBmcm9tICdtYXliZSc7XG5cbmltcG9ydCB7XG4gICAgaXNQYWlyLFxufSBmcm9tICd1dGlsJztcblxuY29uc3QgdG9TdHJpbmcgPSBBcnJheS5wcm90b3R5cGUudG9TdHJpbmc7XG5cbkFycmF5LnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gJ1snICsgdG9TdHJpbmcuYXBwbHkodGhpcykgKyAnXSc7XG59O1xuXG5leHBvcnQgZnVuY3Rpb24gVHVwbGUoKSB7fVxuXG5leHBvcnQgZnVuY3Rpb24gUGFpcihhLCBiKSB7XG4gICAgcmV0dXJuIG5ldyBfcGFpcihhLCBiKTtcbn1cblxuZnVuY3Rpb24gX3BhaXIoYSwgYikge1xuICAgIHRoaXNbMF0gPSBhO1xuICAgIHRoaXNbMV0gPSBiO1xufVxuXG5fcGFpci5wcm90b3R5cGUuaXNQYWlyID0gdHJ1ZTtcbl9wYWlyLnByb3RvdHlwZS50eXBlID0gJ3BhaXInO1xuX3BhaXIucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiAnWycgKyB0aGlzWzBdICsgJywnICsgdGhpc1sxXSArICddJztcbn07XG5cbmV4cG9ydCBmdW5jdGlvbiBQb3NpdGlvbihyb3dzID0gW10sIHJvdyA9IDAsIGNvbCA9IDApIHtcbiAgICByZXR1cm4gbmV3IF9wb3NpdGlvbihyb3dzLCByb3csIGNvbCk7XG59XG5cbmZ1bmN0aW9uIF9wb3NpdGlvbihyb3dzLCByb3csIGNvbCkge1xuICAgIHRoaXMucm93cyA9IHJvd3M7XG4gICAgdGhpcy5yb3cgPSByb3c7XG4gICAgdGhpcy5jb2wgPSBjb2w7XG59XG5cbl9wb3NpdGlvbi5wcm90b3R5cGUuaXNQb3NpdGlvbiA9IHRydWU7XG5fcG9zaXRpb24ucHJvdG90eXBlLmNoYXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgbGV0IHJlc3VsdCA9IE1heWJlLk5vdGhpbmcoKTtcbiAgICB0cnkge1xuICAgICAgICByZXN1bHQgPSBNYXliZS5KdXN0KHRoaXMucm93c1t0aGlzLnJvd11bdGhpcy5jb2xdKTtcbiAgICB9IGNhdGNoIChlcnIpIHt9XG4gICAgcmV0dXJuIHJlc3VsdDtcbn07XG5fcG9zaXRpb24ucHJvdG90eXBlLmluY3JQb3MgPSBmdW5jdGlvbiAoKSB7XG4gICAgY29uc3QgbmVlZFJvd0luY3JlbWVudCA9ICh0aGlzLmNvbCA9PT0gdGhpcy5yb3dzW3RoaXMucm93XS5sZW5ndGggLSAxKTtcbiAgICByZXR1cm4gUG9zaXRpb24oXG4gICAgICAgIHRoaXMucm93cyxcbiAgICAgICAgKG5lZWRSb3dJbmNyZW1lbnQgPyB0aGlzLnJvdyArIDEgOiB0aGlzLnJvdyksXG4gICAgICAgIChuZWVkUm93SW5jcmVtZW50ID8gMCA6IHRoaXMuY29sICsgMSlcbiAgICApO1xufTtcblxuZXhwb3J0IGZ1bmN0aW9uIHBhaXIoeCwgeSkge1xuICAgIGxldCByZXN1bHQgPSBbeCwgeV07XG4gICAgcmVzdWx0LnR5cGUgPSAncGFpcic7XG4gICAgcmVzdWx0LnRvU3RyaW5nID0gKCkgPT4ge1xuICAgICAgICByZXR1cm4gJ1snXG4gICAgICAgICAgICArIChpc1BhaXIocmVzdWx0WzBdKSA/IHJlc3VsdFswXS50b1N0cmluZygpIDogcmVzdWx0WzBdKVxuICAgICAgICAgICAgKyAnLCdcbiAgICAgICAgICAgICsgKGlzUGFpcihyZXN1bHRbMV0pID8gcmVzdWx0WzFdLnRvU3RyaW5nKCkgOiByZXN1bHRbMV0pXG4gICAgICAgICAgICArICddJztcbiAgICB9O1xuICAgIHJldHVybiByZXN1bHQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzdWNjZXNzKG1hdGNoZWQsIHN0cikge1xuICAgIGxldCByZXN1bHQgPSBwYWlyKG1hdGNoZWQsIHN0cik7XG4gICAgcmVzdWx0LnR5cGUgPSAnc3VjY2Vzcyc7XG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGZhaWx1cmUocGFyc2VyTGFiZWwsIGVycm9yTXNnKSB7XG4gICAgbGV0IHJlc3VsdCA9IHBhaXIocGFyc2VyTGFiZWwsIGVycm9yTXNnKTtcbiAgICByZXN1bHQudHlwZSA9ICdmYWlsdXJlJztcbiAgICByZXR1cm4gcmVzdWx0O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc29tZSh2YWx1ZSkge1xuICAgIHJldHVybiB7XG4gICAgICAgIHR5cGU6ICdzb21lJyxcbiAgICAgICAgdmFsKCkge1xuICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICB9LFxuICAgICAgICB0b1N0cmluZygpIHtcbiAgICAgICAgICAgIHJldHVybiBgc29tZSgke3ZhbHVlfSlgO1xuICAgICAgICB9XG4gICAgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG5vbmUoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgdHlwZTogJ25vbmUnLFxuICAgICAgICB2YWwoKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfSxcbiAgICAgICAgdG9TdHJpbmcoKSB7XG4gICAgICAgICAgICByZXR1cm4gJ25vbmUoKSc7XG4gICAgICAgIH1cbiAgICB9O1xufVxuIl19