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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2pzL2NsYXNzZXMuanMiXSwibmFtZXMiOlsicGFpciIsInN1Y2Nlc3MiLCJmYWlsdXJlIiwic29tZSIsIm5vbmUiLCJ0b1N0cmluZyIsIkFycmF5IiwicHJvdG90eXBlIiwiYXBwbHkiLCJ4IiwieSIsInJlc3VsdCIsInR5cGUiLCJtYXRjaGVkIiwic3RyIiwicGFyc2VyTGFiZWwiLCJlcnJvck1zZyIsInZhbHVlIiwidmFsIl0sIm1hcHBpbmdzIjoiOzs7Ozs7WUFxQmdCQSxJLEdBQUFBLEk7WUFhQUMsTyxHQUFBQSxPO1lBTUFDLE8sR0FBQUEsTztZQU1BQyxJLEdBQUFBLEk7WUFZQUMsSSxHQUFBQSxJOzs7QUEzQ2hCLFFBQU1DLFdBQVdDLE1BQU1DLFNBQU4sQ0FBZ0JGLFFBQWpDOztBQUVBQyxVQUFNQyxTQUFOLENBQWdCRixRQUFoQixHQUEyQixZQUFZO0FBQ25DLGVBQU8sTUFBTUEsU0FBU0csS0FBVCxDQUFlLElBQWYsQ0FBTixHQUE2QixHQUFwQztBQUNILEtBRkQ7O0FBSU8sYUFBU1IsSUFBVCxDQUFjUyxDQUFkLEVBQWlCQyxDQUFqQixFQUFvQjtBQUN2QixZQUFJQyxTQUFTLENBQUNGLENBQUQsRUFBSUMsQ0FBSixDQUFiO0FBQ0FDLGVBQU9DLElBQVAsR0FBYyxNQUFkO0FBQ0FELGVBQU9OLFFBQVAsR0FBa0IsWUFBTTtBQUNwQixtQkFBTyxPQUNBLGtCQUFPTSxPQUFPLENBQVAsQ0FBUCxJQUFvQkEsT0FBTyxDQUFQLEVBQVVOLFFBQVYsRUFBcEIsR0FBMkNNLE9BQU8sQ0FBUCxDQUQzQyxJQUVELEdBRkMsSUFHQSxrQkFBT0EsT0FBTyxDQUFQLENBQVAsSUFBb0JBLE9BQU8sQ0FBUCxFQUFVTixRQUFWLEVBQXBCLEdBQTJDTSxPQUFPLENBQVAsQ0FIM0MsSUFJRCxHQUpOO0FBS0gsU0FORDtBQU9BLGVBQU9BLE1BQVA7QUFDSDs7QUFFTSxhQUFTVixPQUFULENBQWlCWSxPQUFqQixFQUEwQkMsR0FBMUIsRUFBK0I7QUFDbEMsWUFBSUgsU0FBU1gsS0FBS2EsT0FBTCxFQUFjQyxHQUFkLENBQWI7QUFDQUgsZUFBT0MsSUFBUCxHQUFjLFNBQWQ7QUFDQSxlQUFPRCxNQUFQO0FBQ0g7O0FBRU0sYUFBU1QsT0FBVCxDQUFpQmEsV0FBakIsRUFBOEJDLFFBQTlCLEVBQXdDO0FBQzNDLFlBQUlMLFNBQVNYLEtBQUtlLFdBQUwsRUFBa0JDLFFBQWxCLENBQWI7QUFDQUwsZUFBT0MsSUFBUCxHQUFjLFNBQWQ7QUFDQSxlQUFPRCxNQUFQO0FBQ0g7O0FBRU0sYUFBU1IsSUFBVCxDQUFjYyxLQUFkLEVBQXFCO0FBQ3hCLGVBQU87QUFDSEwsa0JBQU0sTUFESDtBQUVITSxlQUZHLGlCQUVHO0FBQ0YsdUJBQU9ELEtBQVA7QUFDSCxhQUpFO0FBS0haLG9CQUxHLHNCQUtRO0FBQ1AsaUNBQWVZLEtBQWY7QUFDSDtBQVBFLFNBQVA7QUFTSDs7QUFFTSxhQUFTYixJQUFULEdBQWdCO0FBQ25CLGVBQU87QUFDSFEsa0JBQU0sTUFESDtBQUVITSxlQUZHLGlCQUVHO0FBQ0YsdUJBQU8sSUFBUDtBQUNILGFBSkU7QUFLSGIsb0JBTEcsc0JBS1E7QUFDUCx1QkFBTyxRQUFQO0FBQ0g7QUFQRSxTQUFQO0FBU0giLCJmaWxlIjoiY2xhc3Nlcy5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG4gICAgaXNQYWlyLFxufSBmcm9tICd1dGlsJztcblxuaW1wb3J0IHtcbiAgICBmbWFwLFxuICAgIHJldHVyblAsXG4gICAgYXBwbHlQLFxuICAgIGxpZnQyLCAvLyBmYWJjIC0+IHBhIC0+IHBiIC0+IChyZXR1cm5QIGZhYmMpIDwqPiBwYSA8Kj4gcGJcbiAgICBhbmRUaGVuLFxuICAgIG9yRWxzZSxcbiAgICBkaXNjYXJkRmlyc3QsXG4gICAgZGlzY2FyZFNlY29uZCxcbn0gZnJvbSAncGFyc2Vycyc7XG5cbmNvbnN0IHRvU3RyaW5nID0gQXJyYXkucHJvdG90eXBlLnRvU3RyaW5nO1xuXG5BcnJheS5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuICdbJyArIHRvU3RyaW5nLmFwcGx5KHRoaXMpICsgJ10nO1xufTtcblxuZXhwb3J0IGZ1bmN0aW9uIHBhaXIoeCwgeSkge1xuICAgIGxldCByZXN1bHQgPSBbeCwgeV07XG4gICAgcmVzdWx0LnR5cGUgPSAncGFpcic7XG4gICAgcmVzdWx0LnRvU3RyaW5nID0gKCkgPT4ge1xuICAgICAgICByZXR1cm4gJ1snXG4gICAgICAgICAgICArIChpc1BhaXIocmVzdWx0WzBdKSA/IHJlc3VsdFswXS50b1N0cmluZygpIDogcmVzdWx0WzBdKVxuICAgICAgICAgICAgKyAnLCdcbiAgICAgICAgICAgICsgKGlzUGFpcihyZXN1bHRbMV0pID8gcmVzdWx0WzFdLnRvU3RyaW5nKCkgOiByZXN1bHRbMV0pXG4gICAgICAgICAgICArICddJztcbiAgICB9O1xuICAgIHJldHVybiByZXN1bHQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzdWNjZXNzKG1hdGNoZWQsIHN0cikge1xuICAgIGxldCByZXN1bHQgPSBwYWlyKG1hdGNoZWQsIHN0cik7XG4gICAgcmVzdWx0LnR5cGUgPSAnc3VjY2Vzcyc7XG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGZhaWx1cmUocGFyc2VyTGFiZWwsIGVycm9yTXNnKSB7XG4gICAgbGV0IHJlc3VsdCA9IHBhaXIocGFyc2VyTGFiZWwsIGVycm9yTXNnKTtcbiAgICByZXN1bHQudHlwZSA9ICdmYWlsdXJlJztcbiAgICByZXR1cm4gcmVzdWx0O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc29tZSh2YWx1ZSkge1xuICAgIHJldHVybiB7XG4gICAgICAgIHR5cGU6ICdzb21lJyxcbiAgICAgICAgdmFsKCkge1xuICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICB9LFxuICAgICAgICB0b1N0cmluZygpIHtcbiAgICAgICAgICAgIHJldHVybiBgc29tZSgke3ZhbHVlfSlgO1xuICAgICAgICB9XG4gICAgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG5vbmUoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgdHlwZTogJ25vbmUnLFxuICAgICAgICB2YWwoKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfSxcbiAgICAgICAgdG9TdHJpbmcoKSB7XG4gICAgICAgICAgICByZXR1cm4gJ25vbmUoKSc7XG4gICAgICAgIH1cbiAgICB9O1xufVxuIl19