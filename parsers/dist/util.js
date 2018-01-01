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

    var addOne = function addOne(x) {
        return x + 1;
    };

    var timesTwo = function timesTwo(x) {
        return x * 2;
    };

    // make x -> addOne -> addOne -> timesTwo
    // y = (x + 2) * 2

    var composable = [timesTwo, addOne, addOne];
    var pipable = [addOne, addOne, timesTwo];

    var composed = composable.reduce(function (acc, curr) {
        return function (x) {
            return acc(curr(x));
        };
    }, function (x) {
        return x;
    });

    var piped = pipable.reduce(function (acc, curr) {
        return function (x) {
            return curr(acc(x));
        };
    }, function (x) {
        return x;
    });
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2pzL3V0aWwuanMiXSwibmFtZXMiOlsiaXNQYWlyIiwiaXNUcmlwbGUiLCJpc1NvbWUiLCJpc05vbmUiLCJpc1N1Y2Nlc3MiLCJpc0ZhaWx1cmUiLCJpc1BhcnNlciIsInJuZCIsIklERU5USVRZIiwiTlVMTF9GVU5DVElPTiIsIlBSRVZFTlRfREVGQVVMVCIsInVuaXF1ZUlkZW50aWZpZXIiLCJpc09iamVjdCIsInRvSW50IiwiY2FwaXRhbGl6ZSIsImlzQm9vbGVhbiIsImlzU3RyaW5nIiwiaXNOdW1iZXIiLCJpc0Z1bmN0aW9uIiwiaXNVbmRlZmluZWQiLCJsYXN0IiwiaGVhZCIsInRhaWwiLCJjb250YWlucyIsImV4Y2VwdFRoZUxhc3QiLCJyZXZlcnNlZCIsImVudW1lcmF0aW9uIiwidGhpbmciLCJ0eXBlIiwic2l6ZSIsIk1hdGgiLCJmbG9vciIsInJhbmRvbSIsInBvdyIsIngiLCJldiIsInByZXZlbnREZWZhdWx0Iiwic3RyIiwibnVtIiwicHJlZml4Iiwic3RhcnQiLCJvIiwiQXJyYXkiLCJpc0FycmF5Iiwic3RyaW5nIiwicGFyc2VJbnQiLCJzIiwidG9VcHBlckNhc2UiLCJzbGljZSIsImV4cHIiLCJpc1h4eCIsImlzTmFOIiwic3RyaW5nT3JBcnJheSIsImxlbmd0aCIsImNoYXJzT3JJdGVtIiwiaW5kZXhPZiIsImFycmEiLCJyZWR1Y2VSaWdodCIsInJlc3QiLCJlbGVtIiwiaW5kZXgiLCJjb25jYXQiLCJmcm9tIiwia2V5cyIsImFkZE9uZSIsInRpbWVzVHdvIiwiY29tcG9zYWJsZSIsInBpcGFibGUiLCJjb21wb3NlZCIsInJlZHVjZSIsImFjYyIsImN1cnIiLCJwaXBlZCJdLCJtYXBwaW5ncyI6Ijs7Ozs7O1lBQWdCQSxNLEdBQUFBLE07WUFNQUMsUSxHQUFBQSxRO1lBSUFDLE0sR0FBQUEsTTtZQUlBQyxNLEdBQUFBLE07WUFJQUMsUyxHQUFBQSxTO1lBSUFDLFMsR0FBQUEsUztZQUlBQyxRLEdBQUFBLFE7WUFJQUMsRyxHQUFB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LGVBQU87QUFBQSxtQkFBS0QsSUFBSUMsS0FBS3JDLENBQUwsQ0FBSixDQUFMO0FBQUEsU0FBUDtBQUNILEtBRmdCLEVBRWQ7QUFBQSxlQUFLQSxDQUFMO0FBQUEsS0FGYyxDQUFqQjs7QUFJQSxRQUFNc0MsUUFBUUwsUUFBUUUsTUFBUixDQUFlLFVBQUNDLEdBQUQsRUFBTUMsSUFBTixFQUFlO0FBQ3hDLGVBQU87QUFBQSxtQkFBS0EsS0FBS0QsSUFBSXBDLENBQUosQ0FBTCxDQUFMO0FBQUEsU0FBUDtBQUNILEtBRmEsRUFFWDtBQUFBLGVBQUtBLENBQUw7QUFBQSxLQUZXLENBQWQiLCJmaWxlIjoidXRpbC5qcyIsInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBmdW5jdGlvbiBpc1BhaXIodGhpbmcpIHtcbiAgICByZXR1cm4gdGhpbmcudHlwZSA9PT0gJ3BhaXInXG4gICAgICAgIHx8IHRoaW5nLnR5cGUgPT09ICdzdWNjZXNzJ1xuICAgICAgICB8fCB0aGluZy50eXBlID09PSAnZmFpbHVyZSc7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc1RyaXBsZSh0aGluZykge1xuICAgIHJldHVybiB0aGluZy50eXBlID09PSAndHJpcGxlJztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzU29tZSh0aGluZykge1xuICAgIHJldHVybiB0aGluZy50eXBlID09PSAnc29tZSc7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc05vbmUodGhpbmcpIHtcbiAgICByZXR1cm4gdGhpbmcudHlwZSA9PT0gJ25vbmUnO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNTdWNjZXNzKHRoaW5nKSB7XG4gICAgcmV0dXJuIHRoaW5nLnR5cGUgPT09ICdzdWNjZXNzJztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzRmFpbHVyZSh0aGluZykge1xuICAgIHJldHVybiB0aGluZy50eXBlID09PSAnZmFpbHVyZSc7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc1BhcnNlcih0aGluZykge1xuICAgIHJldHVybiB0aGluZy50eXBlID09PSAncGFyc2VyJztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJuZChzaXplKSB7XG4gICAgc2l6ZSA9IHNpemUgfHwgNjtcbiAgICByZXR1cm4gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogTWF0aC5wb3coMTAsIHNpemUpKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIElERU5USVRZKHgpIHtcbiAgICByZXR1cm4geDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIE5VTExfRlVOQ1RJT04oKSB7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBQUkVWRU5UX0RFRkFVTFQoZXYpIHtcbiAgICBldi5wcmV2ZW50RGVmYXVsdCgpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdW5pcXVlSWRlbnRpZmllcihzdHIsIG51bSwgcHJlZml4KSB7XG4gICAgbGV0IHN0YXJ0ID0gKHByZWZpeCkgPyBwcmVmaXggKyAnLicgOiAnJztcbiAgICByZXR1cm4gc3RhcnQgKyBzdHIgKyAnIycgKyBudW07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc09iamVjdChvKSB7XG4gICAgcmV0dXJuIG51bGwgIT09IG8gJiYgdHlwZW9mIG8gPT09ICdvYmplY3QnICYmICFBcnJheS5pc0FycmF5KG8pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdG9JbnQoc3RyaW5nKSB7XG4gICAgcmV0dXJuIHBhcnNlSW50KHN0cmluZywgMTApO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY2FwaXRhbGl6ZShzKSB7XG4gICAgcmV0dXJuIHNbMF0udG9VcHBlckNhc2UoKSArIHMuc2xpY2UoMSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0Jvb2xlYW4oZXhwcikge1xuICAgIHJldHVybiBpc1h4eCgnYm9vbGVhbicpKGV4cHIpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNTdHJpbmcoZXhwcikge1xuICAgIHJldHVybiBpc1h4eCgnc3RyaW5nJykoZXhwcik7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc051bWJlcihleHByKSB7XG4gICAgaWYgKGlzTmFOKGV4cHIpKSByZXR1cm4gZmFsc2U7XG4gICAgcmV0dXJuIGlzWHh4KCdudW1iZXInKShleHByKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzRnVuY3Rpb24oZXhwcikge1xuICAgIHJldHVybiBpc1h4eCgnZnVuY3Rpb24nKShleHByKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzVW5kZWZpbmVkKGV4cHIpIHtcbiAgICByZXR1cm4gaXNYeHgoJ3VuZGVmaW5lZCcpKGV4cHIpO1xufVxuXG5mdW5jdGlvbiBpc1h4eCh0eXBlKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uIChleHByKSB7XG4gICAgICAgIHJldHVybiAodHlwZW9mIGV4cHIgPT09IHR5cGUpO1xuICAgIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBsYXN0KHN0cmluZ09yQXJyYXkpIHtcbiAgICBpZiAoc3RyaW5nT3JBcnJheS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgcmV0dXJuICcnO1xuICAgIH1cbiAgICByZXR1cm4gc3RyaW5nT3JBcnJheVtzdHJpbmdPckFycmF5Lmxlbmd0aCAtIDFdO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaGVhZChzdHJpbmdPckFycmF5KSB7XG4gICAgaWYgKHN0cmluZ09yQXJyYXkubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHJldHVybiAnJztcbiAgICB9XG4gICAgcmV0dXJuIHN0cmluZ09yQXJyYXlbMF07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB0YWlsKHN0cmluZ09yQXJyYXkpIHtcbiAgICBpZiAoc3RyaW5nT3JBcnJheS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgcmV0dXJuICcnO1xuICAgIH1cbiAgICByZXR1cm4gc3RyaW5nT3JBcnJheS5zbGljZSgxKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNvbnRhaW5zKHN0cmluZ09yQXJyYXksIGNoYXJzT3JJdGVtKSB7XG4gICAgcmV0dXJuIHN0cmluZ09yQXJyYXkuaW5kZXhPZihjaGFyc09ySXRlbSkgIT09IC0xO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZXhjZXB0VGhlTGFzdChhcnJhKSB7XG4gICAgcmV0dXJuIGFycmEuc2xpY2UoMCwgYXJyYS5sZW5ndGggLSAxKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJldmVyc2VkKGFycmEpIHtcbiAgICByZXR1cm4gYXJyYS5yZWR1Y2VSaWdodCgocmVzdCwgZWxlbSwgaW5kZXgpID0+IHtcbiAgICAgICAgcmV0dXJuIHJlc3QuY29uY2F0KFtlbGVtXSk7XG4gICAgfSwgW10pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZW51bWVyYXRpb24obGVuZ3RoKSB7XG4gICAgaWYgKCFpc051bWJlcihsZW5ndGgpKSByZXR1cm4gW107XG4gICAgcmV0dXJuIEFycmF5LmZyb20oQXJyYXkobGVuZ3RoKS5rZXlzKCkpO1xufVxuXG5jb25zdCBhZGRPbmUgPSB4ID0+IHggKyAxO1xuXG5jb25zdCB0aW1lc1R3byA9IHggPT4geCAqIDI7XG5cbi8vIG1ha2UgeCAtPiBhZGRPbmUgLT4gYWRkT25lIC0+IHRpbWVzVHdvXG4vLyB5ID0gKHggKyAyKSAqIDJcblxuY29uc3QgY29tcG9zYWJsZSA9IFt0aW1lc1R3bywgYWRkT25lLCBhZGRPbmVdO1xuY29uc3QgcGlwYWJsZSA9IFthZGRPbmUsIGFkZE9uZSwgdGltZXNUd29dO1xuXG5jb25zdCBjb21wb3NlZCA9IGNvbXBvc2FibGUucmVkdWNlKChhY2MsIGN1cnIpID0+IHtcbiAgICByZXR1cm4geCA9PiBhY2MoY3Vycih4KSk7XG59LCB4ID0+IHgpO1xuXG5jb25zdCBwaXBlZCA9IHBpcGFibGUucmVkdWNlKChhY2MsIGN1cnIpID0+IHtcbiAgICByZXR1cm4geCA9PiBjdXJyKGFjYyh4KSk7XG59LCB4ID0+IHgpO1xuIl19