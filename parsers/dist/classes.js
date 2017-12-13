define(['exports', 'util', 'parsers'], function (exports, _util, _parsers) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.pair = pair;
    exports.success = success;
    exports.failure = failure;
    exports.some = some;
    exports.none = none;


    var toString = Array.prototype.toString;

    Array.prototype.toString = function () {
        return '[' + toString.apply(this) + ']';
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

    function failure(matched, str) {
        var result = pair(matched, str);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2pzL2NsYXNzZXMuanMiXSwibmFtZXMiOlsicGFpciIsInN1Y2Nlc3MiLCJmYWlsdXJlIiwic29tZSIsIm5vbmUiLCJ0b1N0cmluZyIsIkFycmF5IiwicHJvdG90eXBlIiwiYXBwbHkiLCJ4IiwieSIsInJlc3VsdCIsInR5cGUiLCJtYXRjaGVkIiwic3RyIiwidmFsdWUiLCJ2YWwiXSwibWFwcGluZ3MiOiI7Ozs7OztZQXFCZ0JBLEksR0FBQUEsSTtZQWFBQyxPLEdBQUFBLE87WUFNQUMsTyxHQUFBQSxPO1lBTUFDLEksR0FBQUEsSTtZQVlBQyxJLEdBQUFBLEk7OztBQTNDaEIsUUFBTUMsV0FBV0MsTUFBTUMsU0FBTixDQUFnQkYsUUFBakM7O0FBRUFDLFVBQU1DLFNBQU4sQ0FBZ0JGLFFBQWhCLEdBQTJCLFlBQVk7QUFDbkMsZUFBTyxNQUFNQSxTQUFTRyxLQUFULENBQWUsSUFBZixDQUFOLEdBQTZCLEdBQXBDO0FBQ0gsS0FGRDs7QUFJTyxhQUFTUixJQUFULENBQWNTLENBQWQsRUFBaUJDLENBQWpCLEVBQW9CO0FBQ3ZCLFlBQUlDLFNBQVMsQ0FBQ0YsQ0FBRCxFQUFJQyxDQUFKLENBQWI7QUFDQUMsZUFBT0MsSUFBUCxHQUFjLE1BQWQ7QUFDQUQsZUFBT04sUUFBUCxHQUFrQixZQUFNO0FBQ3BCLG1CQUFPLE9BQ0Esa0JBQU9NLE9BQU8sQ0FBUCxDQUFQLElBQW9CQSxPQUFPLENBQVAsRUFBVU4sUUFBVixFQUFwQixHQUEyQ00sT0FBTyxDQUFQLENBRDNDLElBRUQsR0FGQyxJQUdBLGtCQUFPQSxPQUFPLENBQVAsQ0FBUCxJQUFvQkEsT0FBTyxDQUFQLEVBQVVOLFFBQVYsRUFBcEIsR0FBMkNNLE9BQU8sQ0FBUCxDQUgzQyxJQUlELEdBSk47QUFLSCxTQU5EO0FBT0EsZUFBT0EsTUFBUDtBQUNIOztBQUVNLGFBQVNWLE9BQVQsQ0FBaUJZLE9BQWpCLEVBQTBCQyxHQUExQixFQUErQjtBQUNsQyxZQUFJSCxTQUFTWCxLQUFLYSxPQUFMLEVBQWNDLEdBQWQsQ0FBYjtBQUNBSCxlQUFPQyxJQUFQLEdBQWMsU0FBZDtBQUNBLGVBQU9ELE1BQVA7QUFDSDs7QUFFTSxhQUFTVCxPQUFULENBQWlCVyxPQUFqQixFQUEwQkMsR0FBMUIsRUFBK0I7QUFDbEMsWUFBSUgsU0FBU1gsS0FBS2EsT0FBTCxFQUFjQyxHQUFkLENBQWI7QUFDQUgsZUFBT0MsSUFBUCxHQUFjLFNBQWQ7QUFDQSxlQUFPRCxNQUFQO0FBQ0g7O0FBRU0sYUFBU1IsSUFBVCxDQUFjWSxLQUFkLEVBQXFCO0FBQ3hCLGVBQU87QUFDSEgsa0JBQU0sTUFESDtBQUVISSxlQUZHLGlCQUVHO0FBQ0YsdUJBQU9ELEtBQVA7QUFDSCxhQUpFO0FBS0hWLG9CQUxHLHNCQUtRO0FBQ1AsaUNBQWVVLEtBQWY7QUFDSDtBQVBFLFNBQVA7QUFTSDs7QUFFTSxhQUFTWCxJQUFULEdBQWdCO0FBQ25CLGVBQU87QUFDSFEsa0JBQU0sTUFESDtBQUVISSxlQUZHLGlCQUVHO0FBQ0YsdUJBQU8sSUFBUDtBQUNILGFBSkU7QUFLSFgsb0JBTEcsc0JBS1E7QUFDUCx1QkFBTyxRQUFQO0FBQ0g7QUFQRSxTQUFQO0FBU0giLCJmaWxlIjoiY2xhc3Nlcy5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG4gICAgaXNQYWlyLFxufSBmcm9tICd1dGlsJztcblxuaW1wb3J0IHtcbiAgICBmbWFwLFxuICAgIHJldHVyblAsXG4gICAgYXBwbHlQLFxuICAgIGxpZnQyLCAvLyBmYWJjIC0+IHBhIC0+IHBiIC0+IChyZXR1cm5QIGZhYmMpIDwqPiBwYSA8Kj4gcGJcbiAgICBhbmRUaGVuLFxuICAgIG9yRWxzZSxcbiAgICBkaXNjYXJkRmlyc3QsXG4gICAgZGlzY2FyZFNlY29uZCxcbn0gZnJvbSAncGFyc2Vycyc7XG5cbmNvbnN0IHRvU3RyaW5nID0gQXJyYXkucHJvdG90eXBlLnRvU3RyaW5nO1xuXG5BcnJheS5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuICdbJyArIHRvU3RyaW5nLmFwcGx5KHRoaXMpICsgJ10nO1xufTtcblxuZXhwb3J0IGZ1bmN0aW9uIHBhaXIoeCwgeSkge1xuICAgIGxldCByZXN1bHQgPSBbeCwgeV07XG4gICAgcmVzdWx0LnR5cGUgPSAncGFpcic7XG4gICAgcmVzdWx0LnRvU3RyaW5nID0gKCkgPT4ge1xuICAgICAgICByZXR1cm4gJ1snXG4gICAgICAgICAgICArIChpc1BhaXIocmVzdWx0WzBdKSA/IHJlc3VsdFswXS50b1N0cmluZygpIDogcmVzdWx0WzBdKVxuICAgICAgICAgICAgKyAnLCdcbiAgICAgICAgICAgICsgKGlzUGFpcihyZXN1bHRbMV0pID8gcmVzdWx0WzFdLnRvU3RyaW5nKCkgOiByZXN1bHRbMV0pXG4gICAgICAgICAgICArICddJztcbiAgICB9O1xuICAgIHJldHVybiByZXN1bHQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzdWNjZXNzKG1hdGNoZWQsIHN0cikge1xuICAgIGxldCByZXN1bHQgPSBwYWlyKG1hdGNoZWQsIHN0cik7XG4gICAgcmVzdWx0LnR5cGUgPSAnc3VjY2Vzcyc7XG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGZhaWx1cmUobWF0Y2hlZCwgc3RyKSB7XG4gICAgbGV0IHJlc3VsdCA9IHBhaXIobWF0Y2hlZCwgc3RyKTtcbiAgICByZXN1bHQudHlwZSA9ICdmYWlsdXJlJztcbiAgICByZXR1cm4gcmVzdWx0O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc29tZSh2YWx1ZSkge1xuICAgIHJldHVybiB7XG4gICAgICAgIHR5cGU6ICdzb21lJyxcbiAgICAgICAgdmFsKCkge1xuICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICB9LFxuICAgICAgICB0b1N0cmluZygpIHtcbiAgICAgICAgICAgIHJldHVybiBgc29tZSgke3ZhbHVlfSlgO1xuICAgICAgICB9XG4gICAgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG5vbmUoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgdHlwZTogJ25vbmUnLFxuICAgICAgICB2YWwoKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfSxcbiAgICAgICAgdG9TdHJpbmcoKSB7XG4gICAgICAgICAgICByZXR1cm4gJ25vbmUoKSc7XG4gICAgICAgIH1cbiAgICB9O1xufVxuIl19