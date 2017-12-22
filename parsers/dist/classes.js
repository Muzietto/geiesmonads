define(['exports', 'util'], function (exports, _util) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.Tuple = Tuple;
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

    /////////////////////////////////////////////////////////
    // deprecated in favour of data.Maybe and data.Validation
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2pzL2NsYXNzZXMuanMiXSwibmFtZXMiOlsiVHVwbGUiLCJwYWlyIiwic3VjY2VzcyIsImZhaWx1cmUiLCJzb21lIiwibm9uZSIsInRvU3RyaW5nIiwiQXJyYXkiLCJwcm90b3R5cGUiLCJhcHBseSIsIlBhaXIiLCJhIiwiYiIsInJlc3VsdCIsIl9wYWlyIiwiU3ltYm9sIiwiaXRlcmF0b3IiLCJPYmplY3QiLCJjcmVhdGUiLCJpc1BhaXIiLCJ0eXBlIiwiVHJpcGxlIiwiYyIsIl90cmlwbGUiLCJpc1RyaXBsZSIsIngiLCJ5IiwibWF0Y2hlZCIsInN0ciIsInBhcnNlckxhYmVsIiwiZXJyb3JNc2ciLCJ2YWx1ZSIsInZhbCJdLCJtYXBwaW5ncyI6Ijs7Ozs7O1lBV2dCQSxLLEdBQUFBLEs7WUF5REFDLEksR0FBQUEsSTtZQWFBQyxPLEdBQUFBLE87WUFNQUMsTyxHQUFBQSxPO1lBTUFDLEksR0FBQUEsSTtZQVlBQyxJLEdBQUFBLEk7OztBQXBHaEIsUUFBTUMsV0FBV0MsTUFBTUMsU0FBTixDQUFnQkYsUUFBakM7O0FBRUFDLFVBQU1DLFNBQU4sQ0FBZ0JGLFFBQWhCLEdBQTJCLFlBQVk7QUFDbkMsZUFBTyxNQUFNQSxTQUFTRyxLQUFULENBQWUsSUFBZixDQUFOLEdBQTZCLEdBQXBDO0FBQ0gsS0FGRDs7QUFJTyxhQUFTVCxLQUFULEdBQWlCLENBQ3ZCOztBQUVELGFBQVNVLElBQVQsQ0FBY0MsQ0FBZCxFQUFpQkMsQ0FBakIsRUFBb0I7QUFDaEIsWUFBSUMsU0FBUyxJQUFJQyxLQUFKLENBQVVILENBQVYsRUFBYUMsQ0FBYixDQUFiO0FBQ0FDLGVBQU9FLE9BQU9DLFFBQWQsNEJBQTBCO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLG1DQUNoQkwsQ0FEZ0I7O0FBQUE7QUFBQTtBQUFBLG1DQUVoQkMsQ0FGZ0I7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsU0FBMUI7QUFJQSxlQUFPQyxNQUFQO0FBQ0g7QUFDREgsU0FB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QUFQLEVBQVVQLFFBQVYsRUFBcEIsR0FBMkNPLE9BQU8sQ0FBUCxDQUgzQyxJQUlELEdBSk47QUFLSCxTQU5EO0FBT0EsZUFBT0EsTUFBUDtBQUNIOztBQUVNLGFBQVNYLE9BQVQsQ0FBaUJ5QixPQUFqQixFQUEwQkMsR0FBMUIsRUFBK0I7QUFDbEMsWUFBSWYsU0FBU1osS0FBSzBCLE9BQUwsRUFBY0MsR0FBZCxDQUFiO0FBQ0FmLGVBQU9PLElBQVAsR0FBYyxTQUFkO0FBQ0EsZUFBT1AsTUFBUDtBQUNIOztBQUVNLGFBQVNWLE9BQVQsQ0FBaUIwQixXQUFqQixFQUE4QkMsUUFBOUIsRUFBd0M7QUFDM0MsWUFBSWpCLFNBQVNaLEtBQUs0QixXQUFMLEVBQWtCQyxRQUFsQixDQUFiO0FBQ0FqQixlQUFPTyxJQUFQLEdBQWMsU0FBZDtBQUNBLGVBQU9QLE1BQVA7QUFDSDs7QUFFTSxhQUFTVCxJQUFULENBQWMyQixLQUFkLEVBQXFCO0FBQ3hCLGVBQU87QUFDSFgsa0JBQU0sTUFESDtBQUVIWSxlQUZHLGlCQUVHO0FBQ0YsdUJBQU9ELEtBQVA7QUFDSCxhQUpFO0FBS0h6QixvQkFMRyxzQkFLUTtBQUNQLGlDQUFleUIsS0FBZjtBQUNIO0FBUEUsU0FBUDtBQVNIOztBQUVNLGFBQVMxQixJQUFULEdBQWdCO0FBQ25CLGVBQU87QUFDSGUsa0JBQU0sTUFESDtBQUVIWSxlQUZHLGlCQUVHO0FBQ0YsdUJBQU8sSUFBUDtBQUNILGFBSkU7QUFLSDFCLG9CQUxHLHNCQUtRO0FBQ1AsdUJBQU8sUUFBUDtBQUNIO0FBUEUsU0FBUDtBQVNIIiwiZmlsZSI6ImNsYXNzZXMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICAgIGlzUGFpcixcbiAgICBpc1RyaXBsZSxcbn0gZnJvbSAndXRpbCc7XG5cbmNvbnN0IHRvU3RyaW5nID0gQXJyYXkucHJvdG90eXBlLnRvU3RyaW5nO1xuXG5BcnJheS5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuICdbJyArIHRvU3RyaW5nLmFwcGx5KHRoaXMpICsgJ10nO1xufTtcblxuZXhwb3J0IGZ1bmN0aW9uIFR1cGxlKCkge1xufVxuXG5mdW5jdGlvbiBQYWlyKGEsIGIpIHtcbiAgICBsZXQgcmVzdWx0ID0gbmV3IF9wYWlyKGEsIGIpO1xuICAgIHJlc3VsdFtTeW1ib2wuaXRlcmF0b3JdID0gZnVuY3Rpb24qKCkge1xuICAgICAgICB5aWVsZCBhO1xuICAgICAgICB5aWVsZCBiO1xuICAgIH07XG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cblBhaXIucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShUdXBsZS5wcm90b3R5cGUpO1xuXG5mdW5jdGlvbiBfcGFpcihhLCBiKSB7XG4gICAgdGhpc1swXSA9IGE7XG4gICAgdGhpc1sxXSA9IGI7XG59XG5fcGFpci5wcm90b3R5cGUuaXNQYWlyID0gdHJ1ZTtcbl9wYWlyLnByb3RvdHlwZS50eXBlID0gJ3BhaXInO1xuX3BhaXIucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiAnWycgKyB0aGlzWzBdICsgJywnICsgdGhpc1sxXSArICddJztcbn07XG5cbmZ1bmN0aW9uIFRyaXBsZShhLCBiLCBjKSB7XG4gICAgbGV0IHJlc3VsdCA9IG5ldyBfdHJpcGxlKGEsIGIsIGMpO1xuICAgIHJlc3VsdFtTeW1ib2wuaXRlcmF0b3JdID0gZnVuY3Rpb24qKCkge1xuICAgICAgICB5aWVsZCBhO1xuICAgICAgICB5aWVsZCBiO1xuICAgICAgICB5aWVsZCBjO1xuICAgIH07XG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cblRyaXBsZS5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFR1cGxlLnByb3RvdHlwZSk7XG5cbmZ1bmN0aW9uIF90cmlwbGUoYSwgYiwgYykge1xuICAgIHRoaXNbMF0gPSBhO1xuICAgIHRoaXNbMV0gPSBiO1xuICAgIHRoaXNbMl0gPSBjO1xufVxuX3RyaXBsZS5wcm90b3R5cGUuaXNUcmlwbGUgPSB0cnVlO1xuX3RyaXBsZS5wcm90b3R5cGUudHlwZSA9ICd0cmlwbGUnO1xuX3RyaXBsZS5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuICdbJyArIHRoaXNbMF0gKyAnLCcgKyB0aGlzWzFdICsgJywnICsgdGhpc1syXSArICddJztcbn07XG5cblR1cGxlLlBhaXIgPSBmdW5jdGlvbiAoYSwgYikge1xuICAgIHJldHVybiBuZXcgUGFpcihhLCBiKTtcbn07XG5UdXBsZS5wcm90b3R5cGUuUGFpciA9IFR1cGxlLlBhaXI7XG5cblR1cGxlLlRyaXBsZSA9IGZ1bmN0aW9uIChhLCBiLCBjKSB7XG4gICAgcmV0dXJuIG5ldyBUcmlwbGUoYSwgYiwgYyk7XG59O1xuVHVwbGUucHJvdG90eXBlLlRyaXBsZSA9IFR1cGxlLlRyaXBsZTtcblxuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBkZXByZWNhdGVkIGluIGZhdm91ciBvZiBkYXRhLk1heWJlIGFuZCBkYXRhLlZhbGlkYXRpb25cbmV4cG9ydCBmdW5jdGlvbiBwYWlyKHgsIHkpIHtcbiAgICBsZXQgcmVzdWx0ID0gW3gsIHldO1xuICAgIHJlc3VsdC50eXBlID0gJ3BhaXInO1xuICAgIHJlc3VsdC50b1N0cmluZyA9ICgpID0+IHtcbiAgICAgICAgcmV0dXJuICdbJ1xuICAgICAgICAgICAgKyAoaXNQYWlyKHJlc3VsdFswXSkgPyByZXN1bHRbMF0udG9TdHJpbmcoKSA6IHJlc3VsdFswXSlcbiAgICAgICAgICAgICsgJywnXG4gICAgICAgICAgICArIChpc1BhaXIocmVzdWx0WzFdKSA/IHJlc3VsdFsxXS50b1N0cmluZygpIDogcmVzdWx0WzFdKVxuICAgICAgICAgICAgKyAnXSc7XG4gICAgfTtcbiAgICByZXR1cm4gcmVzdWx0O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc3VjY2VzcyhtYXRjaGVkLCBzdHIpIHtcbiAgICBsZXQgcmVzdWx0ID0gcGFpcihtYXRjaGVkLCBzdHIpO1xuICAgIHJlc3VsdC50eXBlID0gJ3N1Y2Nlc3MnO1xuICAgIHJldHVybiByZXN1bHQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBmYWlsdXJlKHBhcnNlckxhYmVsLCBlcnJvck1zZykge1xuICAgIGxldCByZXN1bHQgPSBwYWlyKHBhcnNlckxhYmVsLCBlcnJvck1zZyk7XG4gICAgcmVzdWx0LnR5cGUgPSAnZmFpbHVyZSc7XG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNvbWUodmFsdWUpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICB0eXBlOiAnc29tZScsXG4gICAgICAgIHZhbCgpIHtcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgICAgfSxcbiAgICAgICAgdG9TdHJpbmcoKSB7XG4gICAgICAgICAgICByZXR1cm4gYHNvbWUoJHt2YWx1ZX0pYDtcbiAgICAgICAgfVxuICAgIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBub25lKCkge1xuICAgIHJldHVybiB7XG4gICAgICAgIHR5cGU6ICdub25lJyxcbiAgICAgICAgdmFsKCkge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH0sXG4gICAgICAgIHRvU3RyaW5nKCkge1xuICAgICAgICAgICAgcmV0dXJuICdub25lKCknO1xuICAgICAgICB9XG4gICAgfTtcbn1cbiJdfQ==