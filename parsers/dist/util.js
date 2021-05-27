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
    return arra.reduceRight(function (rest, elem) {
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

  // eslint-disable-next-line no-unused-vars
  var composed = composable.reduce(function (acc, curr) {
    return function (x) {
      return acc(curr(x));
    };
  }, function (x) {
    return x;
  });

  // eslint-disable-next-line no-unused-vars
  var piped = pipable.reduce(function (acc, curr) {
    return function (x) {
      return curr(acc(x));
    };
  }, function (x) {
    return x;
  });
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2pzL3V0aWwuanMiXSwibmFtZXMiOlsiaXNQYWlyIiwiaXNUcmlwbGUiLCJpc1NvbWUiLCJpc05vbmUiLCJpc1N1Y2Nlc3MiLCJpc0ZhaWx1cmUiLCJpc1BhcnNlciIsInJuZCIsIklERU5USVRZIiwiTlVMTF9GVU5DVElPTiIsIlBSRVZFTlRfREVGQVVMVCIsInVuaXF1ZUlkZW50aWZpZXIiLCJpc09iamVjdCIsInRvSW50IiwiY2FwaXRhbGl6ZSIsImlzQm9vbGVhbiIsImlzU3RyaW5nIiwiaXNOdW1iZXIiLCJpc0Z1bmN0aW9uIiwiaXNVbmRlZmluZWQiLCJsYXN0IiwiaGVhZCIsInRhaWwiLCJjb250YWlucyIsImV4Y2VwdFRoZUxhc3QiLCJyZXZlcnNlZCIsImVudW1lcmF0aW9uIiwidGhpbmciLCJ0eXBlIiwic2l6ZSIsIk1hdGgiLCJmbG9vciIsInJhbmRvbSIsInBvdyIsIngiLCJldiIsInByZXZlbnREZWZhdWx0Iiwic3RyIiwibnVtIiwicHJlZml4Iiwic3RhcnQiLCJvIiwiQXJyYXkiLCJpc0FycmF5Iiwic3RyaW5nIiwicGFyc2VJbnQiLCJzIiwidG9VcHBlckNhc2UiLCJzbGljZSIsImV4cHIiLCJpc1h4eCIsImlzTmFOIiwic3RyaW5nT3JBcnJheSIsImxlbmd0aCIsImNoYXJzT3JJdGVtIiwiaW5kZXhPZiIsImFycmEiLCJyZWR1Y2VSaWdodCIsInJlc3QiLCJlbGVtIiwiY29uY2F0IiwiZnJvbSIsImtleXMiLCJhZGRPbmUiLCJ0aW1lc1R3byIsImNvbXBvc2FibGUiLCJwaXBhYmxlIiwiY29tcG9zZWQiLCJyZWR1Y2UiLCJhY2MiLCJjdXJyIiwicGlwZWQiXSwibWFwcGluZ3MiOiI7Ozs7OztVQXdCZ0JBLE0sR0FBQUEsTTtVQU1BQyxRLEdBQUFBLFE7VUFJQUMsTSxHQUFBQSxNO1VBSUFDLE0sR0FBQUEsTTtVQUlBQyxTLEdBQUFBLFM7VUFJQUMsUyxHQUFBQSxTO1VBSUFDLFEsR0FBQUEsUTtVQUlBQyxHLEdBQUFBLEc7VUFL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TixFQUFlO0FBQ2hELFdBQU87QUFBQSxhQUFLRCxJQUFJQyxLQUFLcEMsQ0FBTCxDQUFKLENBQUw7QUFBQSxLQUFQO0FBQ0QsR0FGZ0IsRUFFZDtBQUFBLFdBQUtBLENBQUw7QUFBQSxHQUZjLENBQWpCOztBQUlBO0FBQ0EsTUFBTXFDLFFBQVFMLFFBQVFFLE1BQVIsQ0FBZSxVQUFDQyxHQUFELEVBQU1DLElBQU4sRUFBZTtBQUMxQyxXQUFPO0FBQUEsYUFBS0EsS0FBS0QsSUFBSW5DLENBQUosQ0FBTCxDQUFMO0FBQUEsS0FBUDtBQUNELEdBRmEsRUFFWDtBQUFBLFdBQUtBLENBQUw7QUFBQSxHQUZXLENBQWQiLCJmaWxlIjoidXRpbC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qXHJcblRoZSBNSVQgTGljZW5zZSAoTUlUKVxyXG5cclxuQ29weXJpZ2h0IChjKSAyMDE0IE1hcmNvIEZhdXN0aW5lbGxpXHJcblxyXG5QZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XHJcbm9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWxcclxuaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xyXG50byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsXHJcbmNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xyXG5mdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxyXG5cclxuVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW4gYWxsXHJcbmNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXHJcblxyXG5USEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXHJcbklNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxyXG5GSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcclxuQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxyXG5MSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLFxyXG5PVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRVxyXG5TT0ZUV0FSRS5cclxuKi9cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBpc1BhaXIodGhpbmcpIHtcclxuICByZXR1cm4gdGhpbmcudHlwZSA9PT0gJ3BhaXInXHJcbiAgICAgICAgfHwgdGhpbmcudHlwZSA9PT0gJ3N1Y2Nlc3MnXHJcbiAgICAgICAgfHwgdGhpbmcudHlwZSA9PT0gJ2ZhaWx1cmUnO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gaXNUcmlwbGUodGhpbmcpIHtcclxuICByZXR1cm4gdGhpbmcudHlwZSA9PT0gJ3RyaXBsZSc7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBpc1NvbWUodGhpbmcpIHtcclxuICByZXR1cm4gdGhpbmcudHlwZSA9PT0gJ3NvbWUnO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gaXNOb25lKHRoaW5nKSB7XHJcbiAgcmV0dXJuIHRoaW5nLnR5cGUgPT09ICdub25lJztcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGlzU3VjY2Vzcyh0aGluZykge1xyXG4gIHJldHVybiB0aGluZy50eXBlID09PSAnc3VjY2Vzcyc7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBpc0ZhaWx1cmUodGhpbmcpIHtcclxuICByZXR1cm4gdGhpbmcudHlwZSA9PT0gJ2ZhaWx1cmUnO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gaXNQYXJzZXIodGhpbmcpIHtcclxuICByZXR1cm4gdGhpbmcudHlwZSA9PT0gJ3BhcnNlcic7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBybmQoc2l6ZSkge1xyXG4gIHNpemUgPSBzaXplIHx8IDY7XHJcbiAgcmV0dXJuIE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIE1hdGgucG93KDEwLCBzaXplKSk7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBJREVOVElUWSh4KSB7XHJcbiAgcmV0dXJuIHg7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBOVUxMX0ZVTkNUSU9OKCkge1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gUFJFVkVOVF9ERUZBVUxUKGV2KSB7XHJcbiAgZXYucHJldmVudERlZmF1bHQoKTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHVuaXF1ZUlkZW50aWZpZXIoc3RyLCBudW0sIHByZWZpeCkge1xyXG4gIGNvbnN0IHN0YXJ0ID0gKHByZWZpeCkgPyBwcmVmaXggKyAnLicgOiAnJztcclxuICByZXR1cm4gc3RhcnQgKyBzdHIgKyAnIycgKyBudW07XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBpc09iamVjdChvKSB7XHJcbiAgcmV0dXJuIG51bGwgIT09IG8gJiYgdHlwZW9mIG8gPT09ICdvYmplY3QnICYmICFBcnJheS5pc0FycmF5KG8pO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gdG9JbnQoc3RyaW5nKSB7XHJcbiAgcmV0dXJuIHBhcnNlSW50KHN0cmluZywgMTApO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gY2FwaXRhbGl6ZShzKSB7XHJcbiAgcmV0dXJuIHNbMF0udG9VcHBlckNhc2UoKSArIHMuc2xpY2UoMSk7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBpc0Jvb2xlYW4oZXhwcikge1xyXG4gIHJldHVybiBpc1h4eCgnYm9vbGVhbicpKGV4cHIpO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gaXNTdHJpbmcoZXhwcikge1xyXG4gIHJldHVybiBpc1h4eCgnc3RyaW5nJykoZXhwcik7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBpc051bWJlcihleHByKSB7XHJcbiAgaWYgKGlzTmFOKGV4cHIpKSByZXR1cm4gZmFsc2U7XHJcbiAgcmV0dXJuIGlzWHh4KCdudW1iZXInKShleHByKTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGlzRnVuY3Rpb24oZXhwcikge1xyXG4gIHJldHVybiBpc1h4eCgnZnVuY3Rpb24nKShleHByKTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGlzVW5kZWZpbmVkKGV4cHIpIHtcclxuICByZXR1cm4gaXNYeHgoJ3VuZGVmaW5lZCcpKGV4cHIpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBpc1h4eCh0eXBlKSB7XHJcbiAgcmV0dXJuIGZ1bmN0aW9uKGV4cHIpIHtcclxuICAgIHJldHVybiAodHlwZW9mIGV4cHIgPT09IHR5cGUpO1xyXG4gIH07XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBsYXN0KHN0cmluZ09yQXJyYXkpIHtcclxuICBpZiAoc3RyaW5nT3JBcnJheS5sZW5ndGggPT09IDApIHtcclxuICAgIHJldHVybiAnJztcclxuICB9XHJcbiAgcmV0dXJuIHN0cmluZ09yQXJyYXlbc3RyaW5nT3JBcnJheS5sZW5ndGggLSAxXTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGhlYWQoc3RyaW5nT3JBcnJheSkge1xyXG4gIGlmIChzdHJpbmdPckFycmF5Lmxlbmd0aCA9PT0gMCkge1xyXG4gICAgcmV0dXJuICcnO1xyXG4gIH1cclxuICByZXR1cm4gc3RyaW5nT3JBcnJheVswXTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHRhaWwoc3RyaW5nT3JBcnJheSkge1xyXG4gIGlmIChzdHJpbmdPckFycmF5Lmxlbmd0aCA9PT0gMCkge1xyXG4gICAgcmV0dXJuICcnO1xyXG4gIH1cclxuICByZXR1cm4gc3RyaW5nT3JBcnJheS5zbGljZSgxKTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGNvbnRhaW5zKHN0cmluZ09yQXJyYXksIGNoYXJzT3JJdGVtKSB7XHJcbiAgcmV0dXJuIHN0cmluZ09yQXJyYXkuaW5kZXhPZihjaGFyc09ySXRlbSkgIT09IC0xO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZXhjZXB0VGhlTGFzdChhcnJhKSB7XHJcbiAgcmV0dXJuIGFycmEuc2xpY2UoMCwgYXJyYS5sZW5ndGggLSAxKTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHJldmVyc2VkKGFycmEpIHtcclxuICByZXR1cm4gYXJyYS5yZWR1Y2VSaWdodCgocmVzdCwgZWxlbSkgPT4ge1xyXG4gICAgcmV0dXJuIHJlc3QuY29uY2F0KFtlbGVtXSk7XHJcbiAgfSwgW10pO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZW51bWVyYXRpb24obGVuZ3RoKSB7XHJcbiAgaWYgKCFpc051bWJlcihsZW5ndGgpKSByZXR1cm4gW107XHJcbiAgcmV0dXJuIEFycmF5LmZyb20oQXJyYXkobGVuZ3RoKS5rZXlzKCkpO1xyXG59XHJcblxyXG5jb25zdCBhZGRPbmUgPSB4ID0+IHggKyAxO1xyXG5cclxuY29uc3QgdGltZXNUd28gPSB4ID0+IHggKiAyO1xyXG5cclxuLy8gbWFrZSB4IC0+IGFkZE9uZSAtPiBhZGRPbmUgLT4gdGltZXNUd29cclxuLy8geSA9ICh4ICsgMikgKiAyXHJcblxyXG5jb25zdCBjb21wb3NhYmxlID0gW3RpbWVzVHdvLCBhZGRPbmUsIGFkZE9uZV07XHJcbmNvbnN0IHBpcGFibGUgPSBbYWRkT25lLCBhZGRPbmUsIHRpbWVzVHdvXTtcclxuXHJcbi8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby11bnVzZWQtdmFyc1xyXG5jb25zdCBjb21wb3NlZCA9IGNvbXBvc2FibGUucmVkdWNlKChhY2MsIGN1cnIpID0+IHtcclxuICByZXR1cm4geCA9PiBhY2MoY3Vycih4KSk7XHJcbn0sIHggPT4geCk7XHJcblxyXG4vLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tdW51c2VkLXZhcnNcclxuY29uc3QgcGlwZWQgPSBwaXBhYmxlLnJlZHVjZSgoYWNjLCBjdXJyKSA9PiB7XHJcbiAgcmV0dXJuIHggPT4gY3VycihhY2MoeCkpO1xyXG59LCB4ID0+IHgpO1xyXG4iXX0=