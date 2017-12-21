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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2pzL2NsYXNzZXMuanMiXSwibmFtZXMiOlsiUGFpciIsInBhaXIiLCJzdWNjZXNzIiwiZmFpbHVyZSIsInNvbWUiLCJub25lIiwidG9TdHJpbmciLCJBcnJheSIsInByb3RvdHlwZSIsImFwcGx5IiwiYSIsImIiLCJfcGFpciIsImlzUGFpciIsInR5cGUiLCJ4IiwieSIsInJlc3VsdCIsIm1hdGNoZWQiLCJzdHIiLCJwYXJzZXJMYWJlbCIsImVycm9yTXNnIiwidmFsdWUiLCJ2YWwiXSwibWFwcGluZ3MiOiI7Ozs7OztZQXFCZ0JBLEksR0FBQUEsSTtZQWVBQyxJLEdBQUFBLEk7WUFhQUMsTyxHQUFBQSxPO1lBTUFDLE8sR0FBQUEsTztZQU1BQyxJLEdBQUFBLEk7WUFZQUMsSSxHQUFBQSxJOzs7QUExRGhCLFFBQU1DLFdBQVdDLE1BQU1DLFNBQU4sQ0FBZ0JGLFFBQWpDOztBQUVBQyxVQUFNQyxTQUFOLENBQWdCRixRQUFoQixHQUEyQixZQUFZO0FBQ25DLGVBQU8sTUFBTUEsU0FBU0csS0FBVCxDQUFlLElBQWYsQ0FBTixHQUE2QixHQUFwQztBQUNILEtBRkQ7O0FBSU8sYUFBU1QsSUFBVCxDQUFjVSxDQUFkLEVBQWlCQyxDQUFqQixFQUFvQjtBQUN2QixlQUFPLElBQUlDLEtBQUosQ0FBVUYsQ0FBVixFQUFhQyxDQUFiLENBQVA7QUFDSDs7QUFFRCxhQUFTQyxLQUFULENBQWVGLENBQWYsRUFBa0JDLENBQWxCLEVBQXFCO0FBQ2pCLGFBQUssQ0FBTCxJQUFVRCxDQUFWO0FBQ0EsYUFBSyxDQUFMLElBQVVDLENBQVY7QUFDSDs7QUFFREMsVUFBTUosU0FBTixDQUFnQkssTUFBaEIsR0FBeUIsSUFBekI7QUFDQUQsVUFBTUosU0FBTixDQUFnQk0sSUFBaEIsR0FBdUIsTUFBdkI7QUFDQUYsVUFBTUosU0FBTixDQUFnQkYsUUFBaEIsR0FBMkIsWUFBVztBQUNsQyxlQUFPLE1BQU0sS0FBSyxDQUFMLENBQU4sR0FBZ0IsR0FBaEIsR0FBc0IsS0FBSyxDQUFMLENBQXRCLEdBQWdDLEdBQXZDO0FBQ0gsS0FGRDs7QUFJTyxhQUFTTCxJQUFULENBQWNjLENBQWQsRUFBaUJDLENBQWpCLEVBQW9CO0FBQ3ZCLFlBQUlDLFNBQVMsQ0FBQ0YsQ0FBRCxFQUFJQyxDQUFKLENBQWI7QUFDQUMsZUFBT0gsSUFBUCxHQUFjLE1BQWQ7QUFDQUcsZUFBT1gsUUFBUCxHQUFrQixZQUFNO0FBQ3BCLG1CQUFPLE9BQ0Esa0JBQU9XLE9BQU8sQ0FBUCxDQUFQLElBQW9CQSxPQUFPLENBQVAsRUFBVVgsUUFBVixFQUFwQixHQUEyQ1csT0FBTyxDQUFQLENBRDNDLElBRUQsR0FGQyxJQUdBLGtCQUFPQSxPQUFPLENBQVAsQ0FBUCxJQUFvQkEsT0FBTyxDQUFQLEVBQVVYLFFBQVYsRUFBcEIsR0FBMkNXLE9BQU8sQ0FBUCxDQUgzQyxJQUlELEdBSk47QUFLSCxTQU5EO0FBT0EsZUFBT0EsTUFBUDtBQUNIOztBQUVNLGFBQVNmLE9BQVQsQ0FBaUJnQixPQUFqQixFQUEwQkMsR0FBMUIsRUFBK0I7QUFDbEMsWUFBSUYsU0FBU2hCLEtBQUtpQixPQUFMLEVBQWNDLEdBQWQsQ0FBYjtBQUNBRixlQUFPSCxJQUFQLEdBQWMsU0FBZDtBQUNBLGVBQU9HLE1BQVA7QUFDSDs7QUFFTSxhQUFTZCxPQUFULENBQWlCaUIsV0FBakIsRUFBOEJDLFFBQTlCLEVBQXdDO0FBQzNDLFlBQUlKLFNBQVNoQixLQUFLbUIsV0FBTCxFQUFrQkMsUUFBbEIsQ0FBYjtBQUNBSixlQUFPSCxJQUFQLEdBQWMsU0FBZDtBQUNBLGVBQU9HLE1BQVA7QUFDSDs7QUFFTSxhQUFTYixJQUFULENBQWNrQixLQUFkLEVBQXFCO0FBQ3hCLGVBQU87QUFDSFIsa0JBQU0sTUFESDtBQUVIUyxlQUZHLGlCQUVHO0FBQ0YsdUJBQU9ELEtBQVA7QUFDSCxhQUpFO0FBS0hoQixvQkFMRyxzQkFLUTtBQUNQLGlDQUFlZ0IsS0FBZjtBQUNIO0FBUEUsU0FBUDtBQVNIOztBQUVNLGFBQVNqQixJQUFULEdBQWdCO0FBQ25CLGVBQU87QUFDSFMsa0JBQU0sTUFESDtBQUVIUyxlQUZHLGlCQUVHO0FBQ0YsdUJBQU8sSUFBUDtBQUNILGFBSkU7QUFLSGpCLG9CQUxHLHNCQUtRO0FBQ1AsdUJBQU8sUUFBUDtBQUNIO0FBUEUsU0FBUDtBQVNIIiwiZmlsZSI6ImNsYXNzZXMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICAgIGlzUGFpcixcbn0gZnJvbSAndXRpbCc7XG5cbmltcG9ydCB7XG4gICAgZm1hcCxcbiAgICByZXR1cm5QLFxuICAgIGFwcGx5UCxcbiAgICBsaWZ0MiwgLy8gZmFiYyAtPiBwYSAtPiBwYiAtPiAocmV0dXJuUCBmYWJjKSA8Kj4gcGEgPCo+IHBiXG4gICAgYW5kVGhlbixcbiAgICBvckVsc2UsXG4gICAgZGlzY2FyZEZpcnN0LFxuICAgIGRpc2NhcmRTZWNvbmQsXG59IGZyb20gJ3BhcnNlcnMnO1xuXG5jb25zdCB0b1N0cmluZyA9IEFycmF5LnByb3RvdHlwZS50b1N0cmluZztcblxuQXJyYXkucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiAnWycgKyB0b1N0cmluZy5hcHBseSh0aGlzKSArICddJztcbn07XG5cbmV4cG9ydCBmdW5jdGlvbiBQYWlyKGEsIGIpIHtcbiAgICByZXR1cm4gbmV3IF9wYWlyKGEsIGIpO1xufVxuXG5mdW5jdGlvbiBfcGFpcihhLCBiKSB7XG4gICAgdGhpc1swXSA9IGE7XG4gICAgdGhpc1sxXSA9IGI7XG59XG5cbl9wYWlyLnByb3RvdHlwZS5pc1BhaXIgPSB0cnVlO1xuX3BhaXIucHJvdG90eXBlLnR5cGUgPSAncGFpcic7XG5fcGFpci5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gJ1snICsgdGhpc1swXSArICcsJyArIHRoaXNbMV0gKyAnXSc7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwYWlyKHgsIHkpIHtcbiAgICBsZXQgcmVzdWx0ID0gW3gsIHldO1xuICAgIHJlc3VsdC50eXBlID0gJ3BhaXInO1xuICAgIHJlc3VsdC50b1N0cmluZyA9ICgpID0+IHtcbiAgICAgICAgcmV0dXJuICdbJ1xuICAgICAgICAgICAgKyAoaXNQYWlyKHJlc3VsdFswXSkgPyByZXN1bHRbMF0udG9TdHJpbmcoKSA6IHJlc3VsdFswXSlcbiAgICAgICAgICAgICsgJywnXG4gICAgICAgICAgICArIChpc1BhaXIocmVzdWx0WzFdKSA/IHJlc3VsdFsxXS50b1N0cmluZygpIDogcmVzdWx0WzFdKVxuICAgICAgICAgICAgKyAnXSc7XG4gICAgfTtcbiAgICByZXR1cm4gcmVzdWx0O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc3VjY2VzcyhtYXRjaGVkLCBzdHIpIHtcbiAgICBsZXQgcmVzdWx0ID0gcGFpcihtYXRjaGVkLCBzdHIpO1xuICAgIHJlc3VsdC50eXBlID0gJ3N1Y2Nlc3MnO1xuICAgIHJldHVybiByZXN1bHQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBmYWlsdXJlKHBhcnNlckxhYmVsLCBlcnJvck1zZykge1xuICAgIGxldCByZXN1bHQgPSBwYWlyKHBhcnNlckxhYmVsLCBlcnJvck1zZyk7XG4gICAgcmVzdWx0LnR5cGUgPSAnZmFpbHVyZSc7XG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNvbWUodmFsdWUpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICB0eXBlOiAnc29tZScsXG4gICAgICAgIHZhbCgpIHtcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgICAgfSxcbiAgICAgICAgdG9TdHJpbmcoKSB7XG4gICAgICAgICAgICByZXR1cm4gYHNvbWUoJHt2YWx1ZX0pYDtcbiAgICAgICAgfVxuICAgIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBub25lKCkge1xuICAgIHJldHVybiB7XG4gICAgICAgIHR5cGU6ICdub25lJyxcbiAgICAgICAgdmFsKCkge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH0sXG4gICAgICAgIHRvU3RyaW5nKCkge1xuICAgICAgICAgICAgcmV0dXJuICdub25lKCknO1xuICAgICAgICB9XG4gICAgfTtcbn1cbiJdfQ==