define(['exports'], function (exports) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.isPair = isPair;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2pzL3V0aWwuanMiXSwibmFtZXMiOlsiaXNQYWlyIiwiaXNTb21lIiwiaXNOb25lIiwiaXNTdWNjZXNzIiwiaXNGYWlsdXJlIiwiaXNQYXJzZXIiLCJybmQiLCJJREVOVElUWSIsIk5VTExfRlVOQ1RJT04iLCJQUkVWRU5UX0RFRkFVTFQiLCJ1bmlxdWVJZGVudGlmaWVyIiwiaXNPYmplY3QiLCJ0b0ludCIsImNhcGl0YWxpemUiLCJpc0Jvb2xlYW4iLCJpc1N0cmluZyIsImlzTnVtYmVyIiwiaXNGdW5jdGlvbiIsImlzVW5kZWZpbmVkIiwibGFzdCIsImhlYWQiLCJ0YWlsIiwiY29udGFpbnMiLCJleGNlcHRUaGVMYXN0IiwicmV2ZXJzZWQiLCJlbnVtZXJhdGlvbiIsInRoaW5nIiwidHlwZSIsInNpemUiLCJNYXRoIiwiZmxvb3IiLCJyYW5kb20iLCJwb3ciLCJ4IiwiZXYiLCJwcmV2ZW50RGVmYXVsdCIsInN0ciIsIm51bSIsInByZWZpeCIsInN0YXJ0IiwibyIsIkFycmF5IiwiaXNBcnJheSIsInN0cmluZyIsInBhcnNlSW50IiwicyIsInRvVXBwZXJDYXNlIiwic2xpY2UiLCJleHByIiwiaXNYeHgiLCJpc05hTiIsInN0cmluZ09yQXJyYXkiLCJsZW5ndGgiLCJjaGFyc09ySXRlbSIsImluZGV4T2YiLCJhcnJhIiwicmVkdWNlUmlnaHQiLCJyZXN0IiwiZWxlbSIsImluZGV4IiwiY29uY2F0IiwiZnJvbSIsImtleXMiXSwibWFwcGluZ3MiOiI7Ozs7OztZQUFnQkEsTSxHQUFBQSxNO1lBTUFDLE0sR0FBQUEsTTtZQUlBQyxNLEdBQUFBLE07WUFJQUMsUyxHQUFBQSxTO1lBSUFDLFMsR0FBQUEsUztZQUlBQyxRLEdBQUFBLFE7WUFJQUMsRyxHQUFBQSxHO1lBS0FDLFEsR0FBQUEsUTtZQUlBQyxhLEdBQUFBLGE7WUFHQUMsZSxHQUFBQSxlO1lBSUFDLGdCLEdBQUFBLGdCO1lBS0FDLFEsR0FBQUEsUTtZQUlBQyxLLEdBQUFBLEs7WUFJQUMsVSxH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QUFMLENBQVcsQ0FBWCxFQUFjUSxLQUFLSCxNQUFMLEdBQWMsQ0FBNUIsQ0FBUDtBQUNIOztBQUVNLGFBQVM1QixRQUFULENBQWtCK0IsSUFBbEIsRUFBd0I7QUFDM0IsZUFBT0EsS0FBS0MsV0FBTCxDQUFpQixVQUFDQyxJQUFELEVBQU9DLElBQVAsRUFBYUMsS0FBYixFQUF1QjtBQUMzQyxtQkFBT0YsS0FBS0csTUFBTCxDQUFZLENBQUNGLElBQUQsQ0FBWixDQUFQO0FBQ0gsU0FGTSxFQUVKLEVBRkksQ0FBUDtBQUdIOztBQUVNLGFBQVNqQyxXQUFULENBQXFCMkIsTUFBckIsRUFBNkI7QUFDaEMsWUFBSSxDQUFDcEMsU0FBU29DLE1BQVQsQ0FBTCxFQUF1QixPQUFPLEVBQVA7QUFDdkIsZUFBT1gsTUFBTW9CLElBQU4sQ0FBV3BCLE1BQU1XLE1BQU4sRUFBY1UsSUFBZCxFQUFYLENBQVA7QUFDSCIsImZpbGUiOiJ1dGlsLmpzIiwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGZ1bmN0aW9uIGlzUGFpcih0aGluZykge1xuICAgIHJldHVybiB0aGluZy50eXBlID09PSAncGFpcidcbiAgICAgICAgfHwgdGhpbmcudHlwZSA9PT0gJ3N1Y2Nlc3MnXG4gICAgICAgIHx8IHRoaW5nLnR5cGUgPT09ICdmYWlsdXJlJztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzU29tZSh0aGluZykge1xuICAgIHJldHVybiB0aGluZy50eXBlID09PSAnc29tZSc7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc05vbmUodGhpbmcpIHtcbiAgICByZXR1cm4gdGhpbmcudHlwZSA9PT0gJ25vbmUnO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNTdWNjZXNzKHRoaW5nKSB7XG4gICAgcmV0dXJuIHRoaW5nLnR5cGUgPT09ICdzdWNjZXNzJztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzRmFpbHVyZSh0aGluZykge1xuICAgIHJldHVybiB0aGluZy50eXBlID09PSAnZmFpbHVyZSc7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc1BhcnNlcih0aGluZykge1xuICAgIHJldHVybiB0aGluZy50eXBlID09PSAncGFyc2VyJztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJuZChzaXplKSB7XG4gICAgc2l6ZSA9IHNpemUgfHwgNjtcbiAgICByZXR1cm4gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogTWF0aC5wb3coMTAsIHNpemUpKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIElERU5USVRZKHgpIHtcbiAgICByZXR1cm4geDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIE5VTExfRlVOQ1RJT04oKSB7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBQUkVWRU5UX0RFRkFVTFQoZXYpIHtcbiAgICBldi5wcmV2ZW50RGVmYXVsdCgpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdW5pcXVlSWRlbnRpZmllcihzdHIsIG51bSwgcHJlZml4KSB7XG4gICAgbGV0IHN0YXJ0ID0gKHByZWZpeCkgPyBwcmVmaXggKyAnLicgOiAnJztcbiAgICByZXR1cm4gc3RhcnQgKyBzdHIgKyAnIycgKyBudW07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc09iamVjdChvKSB7XG4gICAgcmV0dXJuIG51bGwgIT09IG8gJiYgdHlwZW9mIG8gPT09ICdvYmplY3QnICYmICFBcnJheS5pc0FycmF5KG8pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdG9JbnQoc3RyaW5nKSB7XG4gICAgcmV0dXJuIHBhcnNlSW50KHN0cmluZywgMTApO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY2FwaXRhbGl6ZShzKSB7XG4gICAgcmV0dXJuIHNbMF0udG9VcHBlckNhc2UoKSArIHMuc2xpY2UoMSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0Jvb2xlYW4oZXhwcikge1xuICAgIHJldHVybiBpc1h4eCgnYm9vbGVhbicpKGV4cHIpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNTdHJpbmcoZXhwcikge1xuICAgIHJldHVybiBpc1h4eCgnc3RyaW5nJykoZXhwcik7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc051bWJlcihleHByKSB7XG4gICAgaWYgKGlzTmFOKGV4cHIpKSByZXR1cm4gZmFsc2U7XG4gICAgcmV0dXJuIGlzWHh4KCdudW1iZXInKShleHByKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzRnVuY3Rpb24oZXhwcikge1xuICAgIHJldHVybiBpc1h4eCgnZnVuY3Rpb24nKShleHByKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzVW5kZWZpbmVkKGV4cHIpIHtcbiAgICByZXR1cm4gaXNYeHgoJ3VuZGVmaW5lZCcpKGV4cHIpO1xufVxuXG5mdW5jdGlvbiBpc1h4eCh0eXBlKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKGV4cHIpIHtcbiAgICAgICAgcmV0dXJuICh0eXBlb2YgZXhwciA9PT0gdHlwZSk7XG4gICAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gbGFzdChzdHJpbmdPckFycmF5KSB7XG4gICAgaWYgKHN0cmluZ09yQXJyYXkubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHJldHVybiAnJztcbiAgICB9XG4gICAgcmV0dXJuIHN0cmluZ09yQXJyYXlbc3RyaW5nT3JBcnJheS5sZW5ndGggLSAxXTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGhlYWQoc3RyaW5nT3JBcnJheSkge1xuICAgIGlmIChzdHJpbmdPckFycmF5Lmxlbmd0aCA9PT0gMCkge1xuICAgICAgICByZXR1cm4gJyc7XG4gICAgfVxuICAgIHJldHVybiBzdHJpbmdPckFycmF5WzBdO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdGFpbChzdHJpbmdPckFycmF5KSB7XG4gICAgaWYgKHN0cmluZ09yQXJyYXkubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHJldHVybiAnJztcbiAgICB9XG4gICAgcmV0dXJuIHN0cmluZ09yQXJyYXkuc2xpY2UoMSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjb250YWlucyhzdHJpbmdPckFycmF5LCBjaGFyc09ySXRlbSkge1xuICAgIHJldHVybiBzdHJpbmdPckFycmF5LmluZGV4T2YoY2hhcnNPckl0ZW0pICE9PSAtMTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGV4Y2VwdFRoZUxhc3QoYXJyYSkge1xuICAgIHJldHVybiBhcnJhLnNsaWNlKDAsIGFycmEubGVuZ3RoIC0gMSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZXZlcnNlZChhcnJhKSB7XG4gICAgcmV0dXJuIGFycmEucmVkdWNlUmlnaHQoKHJlc3QsIGVsZW0sIGluZGV4KSA9PiB7XG4gICAgICAgIHJldHVybiByZXN0LmNvbmNhdChbZWxlbV0pXG4gICAgfSwgW10pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZW51bWVyYXRpb24obGVuZ3RoKSB7XG4gICAgaWYgKCFpc051bWJlcihsZW5ndGgpKSByZXR1cm4gW107XG4gICAgcmV0dXJuIEFycmF5LmZyb20oQXJyYXkobGVuZ3RoKS5rZXlzKCkpXG59XG4iXX0=