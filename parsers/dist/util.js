define(['exports'], function (exports) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.isPair = isPair;
    exports.isTriple = isTriple;
    exports.isSome = isSome;
    exports.isNone = isNone;
    exports.isSuccess = isSuccess;
    exports.isFailure = isFailure;
    exports.isParser = isParser;
    exports.rnd = rnd;
    exports.IDENTITY = IDENTITY;
    exports.NULL_FUNCTION = NULL_FUNCTION;
    exports.PREVENT_DEFAULT = PREVENT_DEFAULT;
    exports.uniqueIdentifier = uniqueIdentifier;
    exports.isObject = isObject;
    exports.toInt = toInt;
    exports.capitalize = capitalize;
    exports.isBoolean = isBoolean;
    exports.isString = isString;
    exports.isNumber = isNumber;
    exports.isFunction = isFunction;
    exports.isUndefined = isUndefined;
    exports.last = last;
    exports.head = head;
    exports.tail = tail;
    exports.contains = contains;
    exports.exceptTheLast = exceptTheLast;
    exports.reversed = reversed;
    exports.enumeration = enumeration;

    var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
        return typeof obj;
    } : function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };

    function isPair(thing) {
        return thing.type === 'pair' || thing.type === 'success' || thing.type === 'failure';
    }

    function isTriple(thing) {
        return thing.type === 'triple';
    }

    function isSome(thing) {
        return thing.type === 'some';
    }

    function isNone(thing) {
        return thing.type === 'none';
    }

    function isSuccess(thing) {
        return thing.type === 'success';
    }

    function isFailure(thing) {
        return thing.type === 'failure';
    }

    function isParser(thing) {
        return thing.type === 'parser';
    }

    function rnd(size) {
        size = size || 6;
        return Math.floor(Math.random() * Math.pow(10, size));
    }

    function IDENTITY(x) {
        return x;
    }

    function NULL_FUNCTION() {}

    function PREVENT_DEFAULT(ev) {
        ev.preventDefault();
    }

    function uniqueIdentifier(str, num, prefix) {
        var start = prefix ? prefix + '.' : '';
        return start + str + '#' + num;
    }

    function isObject(o) {
        return null !== o && (typeof o === 'undefined' ? 'undefined' : _typeof(o)) === 'object' && !Array.isArray(o);
    }

    function toInt(string) {
        return parseInt(string, 10);
    }

    function capitalize(s) {
        return s[0].toUpperCase() + s.slice(1);
    }

    function isBoolean(expr) {
        return isXxx('boolean')(expr);
    }

    function isString(expr) {
        return isXxx('string')(expr);
    }

    function isNumber(expr) {
        if (isNaN(expr)) return false;
        return isXxx('number')(expr);
    }

    function isFunction(expr) {
        return isXxx('function')(expr);
    }

    function isUndefined(expr) {
        return isXxx('undefined')(expr);
    }

    function isXxx(type) {
        return function (expr) {
            return (typeof expr === 'undefined' ? 'undefined' : _typeof(expr)) === type;
        };
    }

    function last(stringOrArray) {
        if (stringOrArray.length === 0) {
            return '';
        }
        return stringOrArray[stringOrArray.length - 1];
    }

    function head(stringOrArray) {
        if (stringOrArray.length === 0) {
            return '';
        }
        return stringOrArray[0];
    }

    function tail(stringOrArray) {
        if (stringOrArray.length === 0) {
            return '';
        }
        return stringOrArray.slice(1);
    }

    function contains(stringOrArray, charsOrItem) {
        return stringOrArray.indexOf(charsOrItem) !== -1;
    }

    function exceptTheLast(arra) {
        return arra.slice(0, arra.length - 1);
    }

    function reversed(arra) {
        return arra.reduceRight(function (rest, elem, index) {
            return rest.concat([elem]);
        }, []);
    }

    function enumeration(length) {
        if (!isNumber(length)) return [];
        return Array.from(Array(length).keys());
    }
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2pzL3V0aWwuanMiXSwibmFtZXMiOlsiaXNQYWlyIiwiaXNUcmlwbGUiLCJpc1NvbWUiLCJpc05vbmUiLCJpc1N1Y2Nlc3MiLCJpc0ZhaWx1cmUiLCJpc1BhcnNlciIsInJuZCIsIklERU5USVRZIiwiTlVMTF9GVU5DVElPTiIsIlBSRVZFTlRfREVGQVVMVCIsInVuaXF1ZUlkZW50aWZpZXIiLCJpc09iamVjdCIsInRvSW50IiwiY2FwaXRhbGl6ZSIsImlzQm9vbGVhbiIsImlzU3RyaW5nIiwiaXNOdW1iZXIiLCJpc0Z1bmN0aW9uIiwiaXNVbmRlZmluZWQiLCJsYXN0IiwiaGVhZCIsInRhaWwiLCJjb250YWlucyIsImV4Y2VwdFRoZUxhc3QiLCJyZXZlcnNlZCIsImVudW1lcmF0aW9uIiwidGhpbmciLCJ0eXBlIiwic2l6ZSIsIk1hdGgiLCJmbG9vciIsInJhbmRvbSIsInBvdyIsIngiLCJldiIsInByZXZlbnREZWZhdWx0Iiwic3RyIiwibnVtIiwicHJlZml4Iiwic3RhcnQiLCJvIiwiQXJyYXkiLCJpc0FycmF5Iiwic3RyaW5nIiwicGFyc2VJbnQiLCJzIiwidG9VcHBlckNhc2UiLCJzbGljZSIsImV4cHIiLCJpc1h4eCIsImlzTmFOIiwic3RyaW5nT3JBcnJheSIsImxlbmd0aCIsImNoYXJzT3JJdGVtIiwiaW5kZXhPZiIsImFycmEiLCJyZWR1Y2VSaWdodCIsInJlc3QiLCJlbGVtIiwiaW5kZXgiLCJjb25jYXQiLCJmcm9tIiwia2V5cyJdLCJtYXBwaW5ncyI6Ijs7Ozs7O1lBQWdCQSxNLEdBQUFBLE07WUFNQUMsUSxHQUFBQSxRO1lBSUFDLE0sR0FBQUEsTTtZQUlBQyxNLEdBQUFBLE07WUFJQUMsUyxHQUFBQSxTO1lBSUFDLFMsR0FBQUEsUztZQUlBQyxRLEdBQUFBLFE7WUFJQUMsRyxHQUFBQSxHO1lBS0FDLFEsR0FBQUEsUTtZQUlBQyxhLEdBQUFBLGE7WUFHQUMsZSxHQUFBQSxlO1lBSUFDLGdCLEdBQUFBLGdCO1lBS0FDLFEsR0FBQUEs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LGNBQWNHLE9BQWQsQ0FBc0JELFdBQXRCLE1BQXVDLENBQUMsQ0FBL0M7QUFDSDs7QUFFTSxhQUFTOUIsYUFBVCxDQUF1QmdDLElBQXZCLEVBQTZCO0FBQ2hDLGVBQU9BLEtBQUtSLEtBQUwsQ0FBVyxDQUFYLEVBQWNRLEtBQUtILE1BQUwsR0FBYyxDQUE1QixDQUFQO0FBQ0g7O0FBRU0sYUFBUzVCLFFBQVQsQ0FBa0IrQixJQUFsQixFQUF3QjtBQUMzQixlQUFPQSxLQUFLQyxXQUFMLENBQWlCLFVBQUNDLElBQUQsRUFBT0MsSUFBUCxFQUFhQyxLQUFiLEVBQXVCO0FBQzNDLG1CQUFPRixLQUFLRyxNQUFMLENBQVksQ0FBQ0YsSUFBRCxDQUFaLENBQVA7QUFDSCxTQUZNLEVBRUosRUFGSSxDQUFQO0FBR0g7O0FBRU0sYUFBU2pDLFdBQVQsQ0FBcUIyQixNQUFyQixFQUE2QjtBQUNoQyxZQUFJLENBQUNwQyxTQUFTb0MsTUFBVCxDQUFMLEVBQXVCLE9BQU8sRUFBUDtBQUN2QixlQUFPWCxNQUFNb0IsSUFBTixDQUFXcEIsTUFBTVcsTUFBTixFQUFjVSxJQUFkLEVBQVgsQ0FBUDtBQUNIIiwiZmlsZSI6InV0aWwuanMiLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgZnVuY3Rpb24gaXNQYWlyKHRoaW5nKSB7XG4gICAgcmV0dXJuIHRoaW5nLnR5cGUgPT09ICdwYWlyJ1xuICAgICAgICB8fCB0aGluZy50eXBlID09PSAnc3VjY2VzcydcbiAgICAgICAgfHwgdGhpbmcudHlwZSA9PT0gJ2ZhaWx1cmUnO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNUcmlwbGUodGhpbmcpIHtcbiAgICByZXR1cm4gdGhpbmcudHlwZSA9PT0gJ3RyaXBsZSc7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc1NvbWUodGhpbmcpIHtcbiAgICByZXR1cm4gdGhpbmcudHlwZSA9PT0gJ3NvbWUnO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNOb25lKHRoaW5nKSB7XG4gICAgcmV0dXJuIHRoaW5nLnR5cGUgPT09ICdub25lJztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzU3VjY2Vzcyh0aGluZykge1xuICAgIHJldHVybiB0aGluZy50eXBlID09PSAnc3VjY2Vzcyc7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0ZhaWx1cmUodGhpbmcpIHtcbiAgICByZXR1cm4gdGhpbmcudHlwZSA9PT0gJ2ZhaWx1cmUnO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNQYXJzZXIodGhpbmcpIHtcbiAgICByZXR1cm4gdGhpbmcudHlwZSA9PT0gJ3BhcnNlcic7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBybmQoc2l6ZSkge1xuICAgIHNpemUgPSBzaXplIHx8IDY7XG4gICAgcmV0dXJuIE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIE1hdGgucG93KDEwLCBzaXplKSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBJREVOVElUWSh4KSB7XG4gICAgcmV0dXJuIHg7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBOVUxMX0ZVTkNUSU9OKCkge1xufVxuXG5leHBvcnQgZnVuY3Rpb24gUFJFVkVOVF9ERUZBVUxUKGV2KSB7XG4gICAgZXYucHJldmVudERlZmF1bHQoKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHVuaXF1ZUlkZW50aWZpZXIoc3RyLCBudW0sIHByZWZpeCkge1xuICAgIGxldCBzdGFydCA9IChwcmVmaXgpID8gcHJlZml4ICsgJy4nIDogJyc7XG4gICAgcmV0dXJuIHN0YXJ0ICsgc3RyICsgJyMnICsgbnVtO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNPYmplY3Qobykge1xuICAgIHJldHVybiBudWxsICE9PSBvICYmIHR5cGVvZiBvID09PSAnb2JqZWN0JyAmJiAhQXJyYXkuaXNBcnJheShvKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHRvSW50KHN0cmluZykge1xuICAgIHJldHVybiBwYXJzZUludChzdHJpbmcsIDEwKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNhcGl0YWxpemUocykge1xuICAgIHJldHVybiBzWzBdLnRvVXBwZXJDYXNlKCkgKyBzLnNsaWNlKDEpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNCb29sZWFuKGV4cHIpIHtcbiAgICByZXR1cm4gaXNYeHgoJ2Jvb2xlYW4nKShleHByKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzU3RyaW5nKGV4cHIpIHtcbiAgICByZXR1cm4gaXNYeHgoJ3N0cmluZycpKGV4cHIpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNOdW1iZXIoZXhwcikge1xuICAgIGlmIChpc05hTihleHByKSkgcmV0dXJuIGZhbHNlO1xuICAgIHJldHVybiBpc1h4eCgnbnVtYmVyJykoZXhwcik7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0Z1bmN0aW9uKGV4cHIpIHtcbiAgICByZXR1cm4gaXNYeHgoJ2Z1bmN0aW9uJykoZXhwcik7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc1VuZGVmaW5lZChleHByKSB7XG4gICAgcmV0dXJuIGlzWHh4KCd1bmRlZmluZWQnKShleHByKTtcbn1cblxuZnVuY3Rpb24gaXNYeHgodHlwZSkge1xuICAgIHJldHVybiBmdW5jdGlvbihleHByKSB7XG4gICAgICAgIHJldHVybiAodHlwZW9mIGV4cHIgPT09IHR5cGUpO1xuICAgIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGxhc3Qoc3RyaW5nT3JBcnJheSkge1xuICAgIGlmIChzdHJpbmdPckFycmF5Lmxlbmd0aCA9PT0gMCkge1xuICAgICAgICByZXR1cm4gJyc7XG4gICAgfVxuICAgIHJldHVybiBzdHJpbmdPckFycmF5W3N0cmluZ09yQXJyYXkubGVuZ3RoIC0gMV07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBoZWFkKHN0cmluZ09yQXJyYXkpIHtcbiAgICBpZiAoc3RyaW5nT3JBcnJheS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgcmV0dXJuICcnO1xuICAgIH1cbiAgICByZXR1cm4gc3RyaW5nT3JBcnJheVswXTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHRhaWwoc3RyaW5nT3JBcnJheSkge1xuICAgIGlmIChzdHJpbmdPckFycmF5Lmxlbmd0aCA9PT0gMCkge1xuICAgICAgICByZXR1cm4gJyc7XG4gICAgfVxuICAgIHJldHVybiBzdHJpbmdPckFycmF5LnNsaWNlKDEpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY29udGFpbnMoc3RyaW5nT3JBcnJheSwgY2hhcnNPckl0ZW0pIHtcbiAgICByZXR1cm4gc3RyaW5nT3JBcnJheS5pbmRleE9mKGNoYXJzT3JJdGVtKSAhPT0gLTE7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBleGNlcHRUaGVMYXN0KGFycmEpIHtcbiAgICByZXR1cm4gYXJyYS5zbGljZSgwLCBhcnJhLmxlbmd0aCAtIDEpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcmV2ZXJzZWQoYXJyYSkge1xuICAgIHJldHVybiBhcnJhLnJlZHVjZVJpZ2h0KChyZXN0LCBlbGVtLCBpbmRleCkgPT4ge1xuICAgICAgICByZXR1cm4gcmVzdC5jb25jYXQoW2VsZW1dKVxuICAgIH0sIFtdKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGVudW1lcmF0aW9uKGxlbmd0aCkge1xuICAgIGlmICghaXNOdW1iZXIobGVuZ3RoKSkgcmV0dXJuIFtdO1xuICAgIHJldHVybiBBcnJheS5mcm9tKEFycmF5KGxlbmd0aCkua2V5cygpKVxufVxuIl19