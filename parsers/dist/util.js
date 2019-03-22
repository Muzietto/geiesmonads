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

    /*
    The MIT License (MIT)
    
    Copyright (c) 2014 Marco Faustinelli
    
    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:
    
    The above copyright notice and this permission notice shall be included in all
    copies or substantial portions of the Software.
    
    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
    SOFTWARE.
    */

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2pzL3V0aWwuanMiXSwibmFtZXMiOlsiaXNQYWlyIiwiaXNUcmlwbGUiLCJpc1NvbWUiLCJpc05vbmUiLCJpc1N1Y2Nlc3MiLCJpc0ZhaWx1cmUiLCJpc1BhcnNlciIsInJuZCIsIklERU5USVRZIiwiTlVMTF9GVU5DVElPTiIsIlBSRVZFTlRfREVGQVVMVCIsInVuaXF1ZUlkZW50aWZpZXIiLCJpc09iamVjdCIsInRvSW50IiwiY2FwaXRhbGl6ZSIsImlzQm9vbGVhbiIsImlzU3RyaW5nIiwiaXNOdW1iZXIiLCJpc0Z1bmN0aW9uIiwiaXNVbmRlZmluZWQiLCJsYXN0IiwiaGVhZCIsInRhaWwiLCJjb250YWlucyIsImV4Y2VwdFRoZUxhc3QiLCJyZXZlcnNlZCIsImVudW1lcmF0aW9uIiwidGhpbmciLCJ0eXBlIiwic2l6ZSIsIk1hdGgiLCJmbG9vciIsInJhbmRvbSIsInBvdyIsIngiLCJldiIsInByZXZlbnREZWZhdWx0Iiwic3RyIiwibnVtIiwicHJlZml4Iiwic3RhcnQiLCJvIiwiQXJyYXkiLCJpc0FycmF5Iiwic3RyaW5nIiwicGFyc2VJbnQiLCJzIiwidG9VcHBlckNhc2UiLCJzbGljZSIsImV4cHIiLCJpc1h4eCIsImlzTmFOIiwic3RyaW5nT3JBcnJheSIsImxlbmd0aCIsImNoYXJzT3JJdGVtIiwiaW5kZXhPZiIsImFycmEiLCJyZWR1Y2VSaWdodCIsInJlc3QiLCJlbGVtIiwiaW5kZXgiLCJjb25jYXQiLCJmcm9tIiwia2V5cyIsImFkZE9uZSIsInRpbWVzVHdvIiwiY29tcG9zYWJsZSIsInBpcGFibGUiLCJjb21wb3NlZCIsInJlZHVjZSIsImFjYyIsImN1cnIiLCJwaXBlZCJdLCJtYXBwaW5ncyI6Ijs7Ozs7O1lBd0JnQkEsTSxHQUFBQSxNO1lBTUFDLFEsR0FBQUEsUTtZQUlBQyxNLEdBQUFBLE07WUFJQUMsTSxHQUFBQSxNO1lBSUFDLFMsR0FBQUEsUztZQUlBQyxTLEdBQUFBLFM7WUFJQUMsUSxHQUFBQSxRO1lBSUFDLEcsR0FBQUEsRztZQUtBQyxRLEdBQUFBLFE7WUFJQUMsYSxHQUFBQSxhO1lBR0FDLGUsR0FBQUEsZTtZQUlBQyxnQixHQUFBQSxnQjtZQUtBQyxRLEdBQUFBLFE7WUFJQUMsSyxHQUFBQSxLO1lBSUFDLFUsR0FBQUEsVTtZQUlBQyxTLEdBQUFBLFM7WUFJQUMsUSxHQUFBQSxRO1lBSUFDLFEsR0FBQUEsUTtZQUtBQyxVLEdBQUFBLFU7WUFJQUMsVyxHQUFBQSxXO1lBVUFDLEksR0FBQUEsSTtZQU9BQyxJLEdBQUFBLEk7WUFPQUMsSSxHQUFBQSxJO1lBT0FDLFEsR0FBQUEsUTtZQUlBQyxhLEdBQUFBLGE7WUFJQUMsUSxHQUFBQSxRO1lBTUFDLFcsR0FBQUEsVzs7Ozs7Ozs7QUFySmhCOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUF3Qk8sYUFBUzFCLE1BQVQsQ0FBZ0IyQixLQUFoQixFQUF1QjtBQUMxQixlQUFPQSxNQUFNQyxJQUFOLEtBQWUsTUFBZixJQUNBRCxNQUFNQyxJQUFOLEtBQWUsU0FEZixJQUVBRCxNQUFNQyxJQUFOLEtBQWUsU0FGdEI7QUFHSDs7QUFFTSxhQUFTM0IsUUFBVCxDQUFrQjBCLEtBQWxCLEVBQXlCO0FBQzVCLGVBQU9BLE1BQU1DLElBQU4sS0FBZSxRQUF0QjtBQUNIOztBQUVNLGFBQVMxQixNQUFULENBQWdCeUIsS0FBaEIsRUFBdUI7QUFDMUIsZUFBT0EsTUFBTUMsSUFBTixLQUFlLE1BQXRCO0FBQ0g7O0FBRU0sYUFBU3pCLE1BQVQsQ0FBZ0J3QixLQUFoQixFQUF1QjtBQUMxQixlQUFPQSxNQUFNQyxJQUFOLEtBQWUsTUFBdEI7QUFDSDs7QUFFTSxhQUFTeEIsU0FBVCxDQUFtQnVCLEtBQW5CLEVBQTBCO0FBQzdCLGVBQU9BLE1BQU1DLElBQU4sS0FBZSxTQUF0QjtBQUNIOztBQUVNLGFBQVN2QixTQUFULENBQW1Cc0IsS0FBbkIsRUFBMEI7QUFDN0IsZUFBT0EsTUFBTUMsSUFBTixLQUFlLFNBQXRCO0FBQ0g7O0FBRU0sYUFBU3RCLFFBQVQsQ0FBa0JxQixLQUFsQixFQUF5QjtBQUM1QixlQUFPQSxNQUFNQyxJQUFOLEtBQWUsUUFBdEI7QUFDSDs7QUFFTSxhQUFTckIsR0FBVCxDQUFhc0IsSUFBYixFQUFtQjtBQUN0QkEsZUFBT0EsUUFBUSxDQUFmO0FBQ0EsZUFBT0MsS0FBS0MsS0FBTCxDQUFXRCxLQUFLRSxNQUFMLEtBQWdCRixLQUFLRyxHQUFMLENBQVMsRUFBVCxFQUFhSixJQUFiLENBQTNCLENBQVA7QUFDSDs7QUFFTSxhQUFTckIsUUFBVCxDQUFrQjBCLENBQWxCLEVBQXFCO0FBQ3hCLGVBQU9BLENBQVA7QUFDSDs7QUFFTSxhQUFTekIsYUFBVCxHQUF5QixDQUMvQjs7QUFFTSxhQUFTQyxlQUFULENBQXlCeUIsRUFBekIsRUFBNkI7QUFDaENBLFdBQUdDLGNBQUg7QUFDSDs7QUFFTSxhQUFTekIsZ0JBQVQsQ0FBMEIwQixHQUExQixFQUErQkMsR0FBL0IsRUFBb0NDLE1BQXBDLEVBQTRDO0FBQy9DLFlBQUlDLFFBQVNELE1BQUQsR0FBV0EsU0FBUyxHQUFwQixHQUEwQixFQUF0QztBQUNBLGVBQU9DLFFBQVFILEdBQVIsR0FBYyxHQUFkLEdBQW9CQyxHQUEzQjtBQUNIOztBQUVNLGFBQVMxQixRQUFULENBQWtCNkIsQ0FBbEIsRUFBcUI7QUFDeEIsZUFBTyxTQUFTQSxDQUFULElBQWMsUUFBT0EsQ0FBUCx5Q0FBT0EsQ0FBUCxPQUFhLFFBQTNCLElBQXVDLENBQUNDLE1BQU1DLE9BQU4sQ0FBY0YsQ0FBZCxDQUEvQztBQUNIOztBQUVNLGFBQVM1QixLQUFULENBQWUrQixNQUFmLEVBQXVCO0FBQzFCLGVBQU9DLFNBQVNELE1BQVQsRUFBaUIsRUFBakIsQ0FBUDtBQUNIOztBQUVNLGFBQVM5QixVQUFULENBQW9CZ0MsQ0FBcEIsRUFBdUI7QUFDMUIsZUFBT0EsRUFBRSxDQUFGLEVBQUtDLFdBQUwsS0FBcUJELEVBQUVFLEtBQUYsQ0FBUSxDQUFSLENBQTVCO0FBQ0g7O0FBRU0sYUFBU2pDLFNBQVQsQ0FBbUJrQyxJQUFuQixFQUF5QjtBQUM1QixlQUFPQyxNQUFNLFNBQU4sRUFBaUJELElBQWpCLENBQVA7QUFDSDs7QUFFTSxhQUFTakMsUUFBVCxDQUFrQmlDLElBQWxCLEVBQXdCO0FBQzNCLGVBQU9DLE1BQU0sUUFBTixFQUFnQkQsSUFBaEIsQ0FBUDtBQUNIOztBQUVNLGFBQVNoQyxRQUFULENBQWtCZ0MsSUFBbEIsRUFBd0I7QUFDM0IsWUFBSUUsTUFBTUYsSUFBTixDQUFKLEVBQWlCLE9BQU8sS0FBUDtBQUNqQixlQUFPQyxNQUFNLFFBQU4sRUFBZ0JELElBQWhCLENBQVA7QUFDSDs7QUFFTSxhQUFTL0IsVUFBVCxDQUFvQitCLElBQXBCLEVBQTBCO0FBQzdCLGVBQU9DLE1BQU0sVUFBTixFQUFrQkQsSUFBbEIsQ0FBUDtBQUNIOztBQUVNLGFBQVM5QixXQUFULENBQXFCOEIsSUFBckIsRUFBMkI7QUFDOUIsZUFBT0MsTUFBTSxXQUFOLEVBQW1CRCxJQUFuQixDQUFQO0FBQ0g7O0FBRUQsYUFBU0MsS0FBVCxDQUFldEIsSUFBZixFQUFxQjtBQUNqQixlQUFPLFVBQVVxQixJQUFWLEVBQWdCO0FBQ25CLG1CQUFRLFFBQU9BLElBQVAseUNBQU9BLElBQVAsT0FBZ0JyQixJQUF4QjtBQUNILFNBRkQ7QUFHSDs7QUFFTSxhQUFTUixJQUFULENBQWNnQyxhQUFkLEVBQTZCO0FBQ2hDLFlBQUlBLGNBQWNDLE1BQWQsS0FBeUIsQ0FBN0IsRUFBZ0M7QUFDNUIsbUJBQU8sRUFBUDtBQUNIO0FBQ0QsZUFBT0QsY0FBY0EsY0FBY0MsTUFBZCxHQUF1QixDQUFyQyxDQUFQO0FBQ0g7O0FBRU0sYUFBU2hDLElBQVQsQ0FBYytCLGFBQWQsRUFBNkI7QUFDaEMsWUFBSUEsY0FBY0MsTUFBZCxLQUF5QixDQUE3QixFQUFnQztBQUM1QixtQkFBTyxFQUFQO0FBQ0g7QUFDRCxlQUFPRCxjQUFjLENBQWQsQ0FBUDtBQUNIOztBQUVNLGFBQVM5QixJQUFULENBQWM4QixhQUFkLEVBQTZCO0FBQ2hDLFlBQUlBLGNBQWNDLE1BQWQsS0FBeUIsQ0FBN0IsRUFBZ0M7QUFDNUIsbUJBQU8sRUFBUDtBQUNIO0FBQ0QsZUFBT0QsY0FBY0osS0FBZCxDQUFvQixDQUFwQixDQUFQO0FBQ0g7O0FBRU0sYUFBU3pCLFFBQVQsQ0FBa0I2QixhQUFsQixFQUFpQ0UsV0FBakMsRUFBOEM7QUFDakQsZUFBT0YsY0FBY0csT0FBZCxDQUFzQkQsV0FBdEIsTUFBdUMsQ0FBQyxDQUEvQztBQUNIOztBQUVNLGFBQVM5QixhQUFULENBQXVCZ0MsSUFBdkIsRUFBNkI7QUFDaEMsZUFBT0EsS0FBS1IsS0FBTCxDQUFXLENBQVgsRUFBY1EsS0FBS0gsTUFBTCxHQUFjLENBQTVCLENBQVA7QUFDSDs7QUFFTSxhQUFTNUIsUUFBVCxDQUFrQitCLElBQWxCLEVBQXdCO0FBQzNCLGVBQU9BLEtBQUtDLFdBQUwsQ0FBaUIsVUFBQ0MsSUFBRCxFQUFPQyxJQUFQLEVBQWFDLEtBQWIsRUFBdUI7QUFDM0MsbUJBQU9GLEtBQUtHLE1BQUwsQ0FBWSxDQUFDRixJQUFELENBQVosQ0FBUDtBQUNILFNBRk0sRUFFSixFQUZJLENBQVA7QUFHSDs7QUFFTSxhQUFTakMsV0FBVCxDQUFxQjJCLE1BQXJCLEVBQTZCO0FBQ2hDLFlBQUksQ0FBQ3BDLFNBQVNvQyxNQUFULENBQUwsRUFBdUIsT0FBTyxFQUFQO0FBQ3ZCLGVBQU9YLE1BQU1vQixJQUFOLENBQVdwQixNQUFNVyxNQUFOLEVBQWNVLElBQWQsRUFBWCxDQUFQO0FBQ0g7O0FBRUQsUUFBTUMsU0FBUyxTQUFUQSxNQUFTO0FBQUEsZUFBSzlCLElBQUksQ0FBVDtBQUFBLEtBQWY7O0FBRUEsUUFBTStCLFdBQVcsU0FBWEEsUUFBVztBQUFBLGVBQUsvQixJQUFJLENBQVQ7QUFBQSxLQUFqQjs7QUFFQTtBQUNBOztBQUVBLFFBQU1nQyxhQUFhLENBQUNELFFBQUQsRUFBV0QsTUFBWCxFQUFtQkEsTUFBbkIsQ0FBbkI7QUFDQSxRQUFNRyxVQUFVLENBQUNILE1BQUQsRUFBU0EsTUFBVCxFQUFpQkMsUUFBakIsQ0FBaEI7O0FBRUEsUUFBTUcsV0FBV0YsV0FBV0csTUFBWCxDQUFrQixVQUFDQyxHQUFELEVBQU1DLElBQU4sRUFBZTtBQUM5QyxlQUFPO0FBQUEsbUJBQUtELElBQUlDLEtBQUtyQyxDQUFMLENBQUosQ0FBTDtBQUFBLFNBQVA7QUFDSCxLQUZnQixFQUVkO0FBQUEsZUFBS0EsQ0FBTDtBQUFBLEtBRmMsQ0FBakI7O0FBSUEsUUFBTXNDLFFBQVFMLFFBQVFFLE1BQVIsQ0FBZSxVQUFDQyxHQUFELEVBQU1DLElBQU4sRUFBZTtBQUN4QyxlQUFPO0FBQUEsbUJBQUtBLEtBQUtELElBQUlwQyxDQUFKLENBQUwsQ0FBTDtBQUFBLFNBQVA7QUFDSCxLQUZhLEVBRVg7QUFBQSxlQUFLQSxDQUFMO0FBQUEsS0FGVyxDQUFkIiwiZmlsZSI6InV0aWwuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuVGhlIE1JVCBMaWNlbnNlIChNSVQpXG5cbkNvcHlyaWdodCAoYykgMjAxNCBNYXJjbyBGYXVzdGluZWxsaVxuXG5QZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XG5vZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSBcIlNvZnR3YXJlXCIpLCB0byBkZWFsXG5pbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzXG50byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsXG5jb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcbmZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XG5cblRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluIGFsbFxuY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cblxuVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxuSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXG5GSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcbkFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcbkxJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXG5PVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRVxuU09GVFdBUkUuXG4qL1xuXG5leHBvcnQgZnVuY3Rpb24gaXNQYWlyKHRoaW5nKSB7XG4gICAgcmV0dXJuIHRoaW5nLnR5cGUgPT09ICdwYWlyJ1xuICAgICAgICB8fCB0aGluZy50eXBlID09PSAnc3VjY2VzcydcbiAgICAgICAgfHwgdGhpbmcudHlwZSA9PT0gJ2ZhaWx1cmUnO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNUcmlwbGUodGhpbmcpIHtcbiAgICByZXR1cm4gdGhpbmcudHlwZSA9PT0gJ3RyaXBsZSc7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc1NvbWUodGhpbmcpIHtcbiAgICByZXR1cm4gdGhpbmcudHlwZSA9PT0gJ3NvbWUnO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNOb25lKHRoaW5nKSB7XG4gICAgcmV0dXJuIHRoaW5nLnR5cGUgPT09ICdub25lJztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzU3VjY2Vzcyh0aGluZykge1xuICAgIHJldHVybiB0aGluZy50eXBlID09PSAnc3VjY2Vzcyc7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0ZhaWx1cmUodGhpbmcpIHtcbiAgICByZXR1cm4gdGhpbmcudHlwZSA9PT0gJ2ZhaWx1cmUnO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNQYXJzZXIodGhpbmcpIHtcbiAgICByZXR1cm4gdGhpbmcudHlwZSA9PT0gJ3BhcnNlcic7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBybmQoc2l6ZSkge1xuICAgIHNpemUgPSBzaXplIHx8IDY7XG4gICAgcmV0dXJuIE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIE1hdGgucG93KDEwLCBzaXplKSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBJREVOVElUWSh4KSB7XG4gICAgcmV0dXJuIHg7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBOVUxMX0ZVTkNUSU9OKCkge1xufVxuXG5leHBvcnQgZnVuY3Rpb24gUFJFVkVOVF9ERUZBVUxUKGV2KSB7XG4gICAgZXYucHJldmVudERlZmF1bHQoKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHVuaXF1ZUlkZW50aWZpZXIoc3RyLCBudW0sIHByZWZpeCkge1xuICAgIGxldCBzdGFydCA9IChwcmVmaXgpID8gcHJlZml4ICsgJy4nIDogJyc7XG4gICAgcmV0dXJuIHN0YXJ0ICsgc3RyICsgJyMnICsgbnVtO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNPYmplY3Qobykge1xuICAgIHJldHVybiBudWxsICE9PSBvICYmIHR5cGVvZiBvID09PSAnb2JqZWN0JyAmJiAhQXJyYXkuaXNBcnJheShvKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHRvSW50KHN0cmluZykge1xuICAgIHJldHVybiBwYXJzZUludChzdHJpbmcsIDEwKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNhcGl0YWxpemUocykge1xuICAgIHJldHVybiBzWzBdLnRvVXBwZXJDYXNlKCkgKyBzLnNsaWNlKDEpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNCb29sZWFuKGV4cHIpIHtcbiAgICByZXR1cm4gaXNYeHgoJ2Jvb2xlYW4nKShleHByKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzU3RyaW5nKGV4cHIpIHtcbiAgICByZXR1cm4gaXNYeHgoJ3N0cmluZycpKGV4cHIpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNOdW1iZXIoZXhwcikge1xuICAgIGlmIChpc05hTihleHByKSkgcmV0dXJuIGZhbHNlO1xuICAgIHJldHVybiBpc1h4eCgnbnVtYmVyJykoZXhwcik7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0Z1bmN0aW9uKGV4cHIpIHtcbiAgICByZXR1cm4gaXNYeHgoJ2Z1bmN0aW9uJykoZXhwcik7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc1VuZGVmaW5lZChleHByKSB7XG4gICAgcmV0dXJuIGlzWHh4KCd1bmRlZmluZWQnKShleHByKTtcbn1cblxuZnVuY3Rpb24gaXNYeHgodHlwZSkge1xuICAgIHJldHVybiBmdW5jdGlvbiAoZXhwcikge1xuICAgICAgICByZXR1cm4gKHR5cGVvZiBleHByID09PSB0eXBlKTtcbiAgICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbGFzdChzdHJpbmdPckFycmF5KSB7XG4gICAgaWYgKHN0cmluZ09yQXJyYXkubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHJldHVybiAnJztcbiAgICB9XG4gICAgcmV0dXJuIHN0cmluZ09yQXJyYXlbc3RyaW5nT3JBcnJheS5sZW5ndGggLSAxXTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGhlYWQoc3RyaW5nT3JBcnJheSkge1xuICAgIGlmIChzdHJpbmdPckFycmF5Lmxlbmd0aCA9PT0gMCkge1xuICAgICAgICByZXR1cm4gJyc7XG4gICAgfVxuICAgIHJldHVybiBzdHJpbmdPckFycmF5WzBdO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdGFpbChzdHJpbmdPckFycmF5KSB7XG4gICAgaWYgKHN0cmluZ09yQXJyYXkubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHJldHVybiAnJztcbiAgICB9XG4gICAgcmV0dXJuIHN0cmluZ09yQXJyYXkuc2xpY2UoMSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjb250YWlucyhzdHJpbmdPckFycmF5LCBjaGFyc09ySXRlbSkge1xuICAgIHJldHVybiBzdHJpbmdPckFycmF5LmluZGV4T2YoY2hhcnNPckl0ZW0pICE9PSAtMTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGV4Y2VwdFRoZUxhc3QoYXJyYSkge1xuICAgIHJldHVybiBhcnJhLnNsaWNlKDAsIGFycmEubGVuZ3RoIC0gMSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZXZlcnNlZChhcnJhKSB7XG4gICAgcmV0dXJuIGFycmEucmVkdWNlUmlnaHQoKHJlc3QsIGVsZW0sIGluZGV4KSA9PiB7XG4gICAgICAgIHJldHVybiByZXN0LmNvbmNhdChbZWxlbV0pO1xuICAgIH0sIFtdKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGVudW1lcmF0aW9uKGxlbmd0aCkge1xuICAgIGlmICghaXNOdW1iZXIobGVuZ3RoKSkgcmV0dXJuIFtdO1xuICAgIHJldHVybiBBcnJheS5mcm9tKEFycmF5KGxlbmd0aCkua2V5cygpKTtcbn1cblxuY29uc3QgYWRkT25lID0geCA9PiB4ICsgMTtcblxuY29uc3QgdGltZXNUd28gPSB4ID0+IHggKiAyO1xuXG4vLyBtYWtlIHggLT4gYWRkT25lIC0+IGFkZE9uZSAtPiB0aW1lc1R3b1xuLy8geSA9ICh4ICsgMikgKiAyXG5cbmNvbnN0IGNvbXBvc2FibGUgPSBbdGltZXNUd28sIGFkZE9uZSwgYWRkT25lXTtcbmNvbnN0IHBpcGFibGUgPSBbYWRkT25lLCBhZGRPbmUsIHRpbWVzVHdvXTtcblxuY29uc3QgY29tcG9zZWQgPSBjb21wb3NhYmxlLnJlZHVjZSgoYWNjLCBjdXJyKSA9PiB7XG4gICAgcmV0dXJuIHggPT4gYWNjKGN1cnIoeCkpO1xufSwgeCA9PiB4KTtcblxuY29uc3QgcGlwZWQgPSBwaXBhYmxlLnJlZHVjZSgoYWNjLCBjdXJyKSA9PiB7XG4gICAgcmV0dXJuIHggPT4gY3VycihhY2MoeCkpO1xufSwgeCA9PiB4KTtcbiJdfQ==