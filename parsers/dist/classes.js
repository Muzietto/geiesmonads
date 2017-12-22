define(['exports', 'util', 'parsers'], function (exports, _util, _parsers) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.Pair = Pair;
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

    function _pair(a, b) {
        this[0] = a;
        this[1] = b;
    }

    _pair.prototype.isPair = true;
    _pair.prototype.type = 'pair';
    _pair.prototype.toString = function () {
        return '[' + this[0] + ',' + this[1] + ']';
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2pzL2NsYXNzZXMuanMiXSwibmFtZXMiOlsiUGFpciIsInBhaXIiLCJzdWNjZXNzIiwiZmFpbHVyZSIsInNvbWUiLCJub25lIiwidG9TdHJpbmciLCJBcnJheSIsInByb3RvdHlwZSIsImFwcGx5IiwiYSIsImIiLCJyZXN1bHQiLCJfcGFpciIsIlN5bWJvbCIsIml0ZXJhdG9yIiwiaXNQYWlyIiwidHlwZSIsIngiLCJ5IiwibWF0Y2hlZCIsInN0ciIsInBhcnNlckxhYmVsIiwiZXJyb3JNc2ciLCJ2YWx1ZSIsInZhbCJdLCJtYXBwaW5ncyI6Ijs7Ozs7O1lBcUJnQkEsSSxHQUFBQSxJO1lBcUJBQyxJLEdBQUFBLEk7WUFhQUMsTyxHQUFBQSxPO1lBTUFDLE8sR0FBQUEsTztZQU1BQyxJLEdBQUFBLEk7WUFZQUMsSSxHQUFBQSxJOzs7QUFoRWhCLFFBQU1DLFdBQVdDLE1BQU1DLFNBQU4sQ0FBZ0JGLFFBQWpDOztBQUVBQyxVQUFNQyxTQUFOLENBQWdCRixRQUFoQixHQUEyQixZQUFZO0FBQ25DLGVBQU8sTUFBTUEsU0FBU0csS0FBVCxDQUFlLElBQWYsQ0FBTixHQUE2QixHQUFwQztBQUNILEtBRkQ7O0FBSU8sYUFBU1QsSUFBVCxDQUFjVSxDQUFkLEVBQWlCQyxDQUFqQixFQUFvQjtBQUN2QixZQUFJQyxTQUFTLElBQUlDLEtBQUosQ0FBVUgsQ0FBVixFQUFhQyxDQUFiLENBQWI7QUFDQUMsZUFBT0UsT0FBT0MsUUFBZCw0QkFBMEI7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsbUNBQ2hCTCxDQURnQjs7QUFBQTtBQUFBO0FBQUEsbUNBRWhCQyxDQUZnQjs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxTQUExQjtBQUlBLGVBQU9DLE1BQVA7QUFDSDs7QUFFRCxhQUFTQyxLQUFULENBQWVILENBQWYsRUFBa0JDLENBQWxCLEVBQXFCO0FBQ2pCLGFBQUssQ0FBTCxJQUFVRCxDQUFWO0FBQ0EsYUFBSyxDQUFMLElBQVVDLENBQVY7QUFDSDs7QUFFREUsVUFBTUwsU0FBTixDQUFnQlEsTUFBaEIsR0FBeUIsSUFBekI7QUFDQUgsVUFBTUwsU0FBTixDQUFnQlMsSUFBaEIsR0FBdUIsTUFBdkI7QUFDQUosVUFBTUwsU0FBTixDQUFnQkYsUUFBaEIsR0FBMkIsWUFBWTtBQUNuQyxlQUFPLE1BQU0sS0FBSyxDQUFMLENBQU4sR0FBZ0IsR0FBaEIsR0FBc0IsS0FBSyxDQUFMLENBQXRCLEdBQWdDLEdBQXZDO0FBQ0gsS0FGRDs7QUFLTyxhQUFTTCxJQUFULENBQWNpQixDQUFkLEVBQWlCQyxDQUFqQixFQUFvQjtBQUN2QixZQUFJUCxTQUFTLENBQUNNLENBQUQsRUFBSUMsQ0FBSixDQUFiO0FBQ0FQLGVBQU9LLElBQVAsR0FBYyxNQUFkO0FBQ0FMLGVBQU9OLFFBQVAsR0FBa0IsWUFBTTtBQUNwQixtQkFBTyxPQUNBLGtCQUFPTSxPQUFPLENBQVAsQ0FBUCxJQUFvQkEsT0FBTyxDQUFQLEVBQVVOLFFBQVYsRUFBcEIsR0FBMkNNLE9BQU8sQ0FBUCxDQUQzQyxJQUVELEdBRkMsSUFHQSxrQkFBT0EsT0FBTyxDQUFQLENBQVAsSUFBb0JBLE9BQU8sQ0FBUCxFQUFVTixRQUFWLEVBQXBCLEdBQTJDTSxPQUFPLENBQVAsQ0FIM0MsSUFJRCxHQUpOO0FBS0gsU0FORDtBQU9BLGVBQU9BLE1BQVA7QUFDSDs7QUFFTSxhQUFTVixPQUFULENBQWlCa0IsT0FBakIsRUFBMEJDLEdBQTFCLEVBQStCO0FBQ2xDLFlBQUlULFNBQVNYLEtBQUttQixPQUFMLEVBQWNDLEdBQWQsQ0FBYjtBQUNBVCxlQUFPSyxJQUFQLEdBQWMsU0FBZDtBQUNBLGVBQU9MLE1BQVA7QUFDSDs7QUFFTSxhQUFTVCxPQUFULENBQWlCbUIsV0FBakIsRUFBOEJDLFFBQTlCLEVBQXdDO0FBQzNDLFlBQUlYLFNBQVNYLEtBQUtxQixXQUFMLEVBQWtCQyxRQUFsQixDQUFiO0FBQ0FYLGVBQU9LLElBQVAsR0FBYyxTQUFkO0FBQ0EsZUFBT0wsTUFBUDtBQUNIOztBQUVNLGFBQVNSLElBQVQsQ0FBY29CLEtBQWQsRUFBcUI7QUFDeEIsZUFBTztBQUNIUCxrQkFBTSxNQURIO0FBRUhRLGVBRkcsaUJBRUc7QUFDRix1QkFBT0QsS0FBUDtBQUNILGFBSkU7QUFLSGxCLG9CQUxHLHNCQUtRO0FBQ1AsaUNBQWVrQixLQUFmO0FBQ0g7QUFQRSxTQUFQO0FBU0g7O0FBRU0sYUFBU25CLElBQVQsR0FBZ0I7QUFDbkIsZUFBTztBQUNIWSxrQkFBTSxNQURIO0FBRUhRLGVBRkcsaUJBRUc7QUFDRix1QkFBTyxJQUFQO0FBQ0gsYUFKRTtBQUtIbkIsb0JBTEcsc0JBS1E7QUFDUCx1QkFBTyxRQUFQO0FBQ0g7QUFQRSxTQUFQO0FBU0giLCJmaWxlIjoiY2xhc3Nlcy5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG4gICAgaXNQYWlyLFxufSBmcm9tICd1dGlsJztcblxuaW1wb3J0IHtcbiAgICBmbWFwLFxuICAgIHJldHVyblAsXG4gICAgYXBwbHlQLFxuICAgIGxpZnQyLCAvLyBmYWJjIC0+IHBhIC0+IHBiIC0+IChyZXR1cm5QIGZhYmMpIDwqPiBwYSA8Kj4gcGJcbiAgICBhbmRUaGVuLFxuICAgIG9yRWxzZSxcbiAgICBkaXNjYXJkRmlyc3QsXG4gICAgZGlzY2FyZFNlY29uZCxcbn0gZnJvbSAncGFyc2Vycyc7XG5cbmNvbnN0IHRvU3RyaW5nID0gQXJyYXkucHJvdG90eXBlLnRvU3RyaW5nO1xuXG5BcnJheS5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuICdbJyArIHRvU3RyaW5nLmFwcGx5KHRoaXMpICsgJ10nO1xufTtcblxuZXhwb3J0IGZ1bmN0aW9uIFBhaXIoYSwgYikge1xuICAgIGxldCByZXN1bHQgPSBuZXcgX3BhaXIoYSwgYik7XG4gICAgcmVzdWx0W1N5bWJvbC5pdGVyYXRvcl0gPSBmdW5jdGlvbiooKSB7XG4gICAgICAgIHlpZWxkIGE7XG4gICAgICAgIHlpZWxkIGI7XG4gICAgfTtcbiAgICByZXR1cm4gcmVzdWx0O1xufVxuXG5mdW5jdGlvbiBfcGFpcihhLCBiKSB7XG4gICAgdGhpc1swXSA9IGE7XG4gICAgdGhpc1sxXSA9IGI7XG59XG5cbl9wYWlyLnByb3RvdHlwZS5pc1BhaXIgPSB0cnVlO1xuX3BhaXIucHJvdG90eXBlLnR5cGUgPSAncGFpcic7XG5fcGFpci5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuICdbJyArIHRoaXNbMF0gKyAnLCcgKyB0aGlzWzFdICsgJ10nO1xufTtcblxuXG5leHBvcnQgZnVuY3Rpb24gcGFpcih4LCB5KSB7XG4gICAgbGV0IHJlc3VsdCA9IFt4LCB5XTtcbiAgICByZXN1bHQudHlwZSA9ICdwYWlyJztcbiAgICByZXN1bHQudG9TdHJpbmcgPSAoKSA9PiB7XG4gICAgICAgIHJldHVybiAnWydcbiAgICAgICAgICAgICsgKGlzUGFpcihyZXN1bHRbMF0pID8gcmVzdWx0WzBdLnRvU3RyaW5nKCkgOiByZXN1bHRbMF0pXG4gICAgICAgICAgICArICcsJ1xuICAgICAgICAgICAgKyAoaXNQYWlyKHJlc3VsdFsxXSkgPyByZXN1bHRbMV0udG9TdHJpbmcoKSA6IHJlc3VsdFsxXSlcbiAgICAgICAgICAgICsgJ10nO1xuICAgIH07XG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHN1Y2Nlc3MobWF0Y2hlZCwgc3RyKSB7XG4gICAgbGV0IHJlc3VsdCA9IHBhaXIobWF0Y2hlZCwgc3RyKTtcbiAgICByZXN1bHQudHlwZSA9ICdzdWNjZXNzJztcbiAgICByZXR1cm4gcmVzdWx0O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZmFpbHVyZShwYXJzZXJMYWJlbCwgZXJyb3JNc2cpIHtcbiAgICBsZXQgcmVzdWx0ID0gcGFpcihwYXJzZXJMYWJlbCwgZXJyb3JNc2cpO1xuICAgIHJlc3VsdC50eXBlID0gJ2ZhaWx1cmUnO1xuICAgIHJldHVybiByZXN1bHQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzb21lKHZhbHVlKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgdHlwZTogJ3NvbWUnLFxuICAgICAgICB2YWwoKSB7XG4gICAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgIH0sXG4gICAgICAgIHRvU3RyaW5nKCkge1xuICAgICAgICAgICAgcmV0dXJuIGBzb21lKCR7dmFsdWV9KWA7XG4gICAgICAgIH1cbiAgICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbm9uZSgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICB0eXBlOiAnbm9uZScsXG4gICAgICAgIHZhbCgpIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9LFxuICAgICAgICB0b1N0cmluZygpIHtcbiAgICAgICAgICAgIHJldHVybiAnbm9uZSgpJztcbiAgICAgICAgfVxuICAgIH07XG59XG4iXX0=