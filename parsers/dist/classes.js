define(['exports', 'maybe', 'util'], function (exports, _maybe, _util) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.Tuple = Tuple;
  exports.Position = Position;
  exports.pair = pair;
  exports.success = success;
  exports.failure = failure;
  exports.some = some;
  exports.none = none;
  exports.JValue = JValue;

  var _slicedToArray = function () {
    function sliceIterator(arr, i) {
      var _arr = [];
      var _n = true;
      var _d = false;
      var _e = undefined;

      try {
        for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
          _arr.push(_s.value);

          if (i && _arr.length === i) break;
        }
      } catch (err) {
        _d = true;
        _e = err;
      } finally {
        try {
          if (!_n && _i["return"]) _i["return"]();
        } finally {
          if (_d) throw _e;
        }
      }

      return _arr;
    }

    return function (arr, i) {
      if (Array.isArray(arr)) {
        return arr;
      } else if (Symbol.iterator in Object(arr)) {
        return sliceIterator(arr, i);
      } else {
        throw new TypeError("Invalid attempt to destructure non-iterable instance");
      }
    };
  }();

  function _toConsumableArray(arr) {
    if (Array.isArray(arr)) {
      for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) {
        arr2[i] = arr[i];
      }

      return arr2;
    } else {
      return Array.from(arr);
    }
  }

  var toString = Array.prototype.toString;


  Array.prototype.toString = function () {
    return '[' + toString.apply(this) + ']';
  };

  // ///////////////////////////
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
    Object.defineProperty(this, 0, { value: a, writable: false });
    Object.defineProperty(this, 1, { value: b, writable: false });
  }
  _pair.prototype.isPair = true;
  _pair.prototype.type = 'pair';
  _pair.prototype.toString = function () {
    return '[' + this[0].toString() + ',' + this[1].toString() + ']';
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
    Object.defineProperty(this, 0, { value: a, writable: false });
    Object.defineProperty(this, 1, { value: b, writable: false });
    Object.defineProperty(this, 2, { value: c, writable: false });
  }
  _triple.prototype.isTriple = true;
  _triple.prototype.type = 'triple';
  _triple.prototype.toString = function () {
    return '[' + this[0].toString() + ',' + this[1].toString() + ',' + this[2].toString() + ']';
  };

  Tuple.Pair = Pair;
  Tuple.prototype.Pair = Pair;

  Tuple.Triple = Triple;
  Tuple.prototype.Triple = Triple;

  function Position() {
    var rows = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
    var row = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
    var col = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;

    return new _position(rows, row, col);
  }

  // Position.prototype = Object.create({});
  Position.fromText = function (text) {
    var rows = text.split('\n').map(function (row) {
      return row.split('');
    });
    return new _position(rows, 0, 0);
  };

  function _position(rows, row, col) {
    this.rows = rows;
    this.row = row;
    this.col = col;
  }

  _position.prototype.isPosition = true;
  _position.prototype.char = function () {
    var result = _maybe.Maybe.Nothing();
    try {
      var newResultValue = this.rows[this.row][this.col];
      if (typeof newResultValue !== 'undefined') {
        result = _maybe.Maybe.Just(newResultValue);
      }
    } catch (err) {}
    return result;
  };
  _position.prototype.incrPos = function () {
    var times = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;

    var lastRowIndex = this.rows.length - 1;
    var lastColumnIndex = this.rows[lastRowIndex].length - 1;
    var result = Position(this.rows, lastRowIndex, lastColumnIndex + 1);
    try {
      var needsRowIncrement = this.col === this.rows[this.row].length - 1;
      result = times * 1 ? incrPosHelper(this, times) : Position(this.rows, needsRowIncrement ? this.row + 1 : this.row, needsRowIncrement ? 0 : this.col + 1);
      return result;
    } catch (err) {}
    return result;

    function incrPosHelper(pos) {
      var times = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

      if (times === 0) return pos;
      return incrPosHelper(pos.incrPos(), times - 1);
    }
  };
  _position.prototype.decrPos = function () {
    var times = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;

    var result = Position(this.rows, -1, -1);
    try {
      var needsRowDecrement = this.col === 0;
      result = times ? decrPosHelper(this, times) : Position(this.rows, needsRowDecrement ? this.row - 1 : this.row, needsRowDecrement ? this.rows[this.row - 1].length - 1 : this.col - 1);
      return result;
    } catch (err) {}
    return result;

    function decrPosHelper(pos) {
      var times = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

      if (times === 0) return pos;
      return decrPosHelper(pos.decrPos(), times - 1);
    }
  };
  _position.prototype.rest = function () {
    var self = this;
    return rest_helper().join('');
    function rest_helper() {
      var next = self.char();
      if (next.isNothing) return [];
      return [next.value].concat(self.incrPos().rest());
    }
  };
  _position.prototype.toString = function () {
    return 'row=' + this.row + ';col=' + this.col + ';rest=' + this.rest();
  };

  // //////////////////////////////////////////////////////////////
  // deprecated in favour of Tuple, data.Maybe and data.Validation
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

  function JValue() {}
  JValue.prototype.isJValue = true;

  function JString(str) {
    return new _jstring(str);
  }

  function _jstring(str) {
    if (typeof str !== 'string') throw new Error('JString: invalid value');
    Object.defineProperty(this, 'value', { value: str, writable: false });
  }
  _jstring.prototype = Object.create(JValue.prototype);
  _jstring.prototype.isJString = true;
  _jstring.prototype.type = 'jstring';
  _jstring.prototype.toString = function () {
    return 'JString(' + this.value.toString() + ')';
  };

  JValue.JString = JString;
  JValue.prototype.JString = JValue.JString;

  function JNumber(float) {
    return new _jnumber(float);
  }

  function _jnumber(float) {
    if (typeof float !== 'number' || isNaN(float)) throw new Error('JNumber: invalid value');
    Object.defineProperty(this, 'value', { value: float, writable: false });
  }
  _jnumber.prototype = Object.create(JValue.prototype);
  _jnumber.prototype.isJNumber = true;
  _jnumber.prototype.type = 'jnumber';
  _jnumber.prototype.toString = function () {
    return 'JNumber(' + this.value.toString() + ')';
  };

  JValue.JNumber = JNumber;
  JValue.prototype.JNumber = JValue.JNumber;

  function JBool(bool) {
    return new _jbool(bool);
  }

  function _jbool(bool) {
    if (typeof bool !== 'boolean') throw new Error('JBool: invalid value');
    Object.defineProperty(this, 'value', { value: bool, writable: false });
  }
  _jbool.prototype = Object.create(JValue.prototype);
  _jbool.prototype.isJBool = true;
  _jbool.prototype.type = 'jbool';
  _jbool.prototype.toString = function () {
    return 'JBool(' + this.value.toString() + ')';
  };

  JValue.JBool = JBool;
  JValue.prototype.JBool = JValue.JBool;

  function JNull(nullValue) {
    return new _jnull(nullValue);
  }

  function _jnull(nullValue) {
    if (nullValue !== null) throw new Error('JNull: invalid value');
    Object.defineProperty(this, 'value', { value: nullValue, writable: false });
  }
  _jnull.prototype = Object.create(JValue.prototype);
  _jnull.prototype.isJNull = true;
  _jnull.prototype.type = 'jnull';
  _jnull.prototype.toString = function () {
    return 'JNull(null)';
  };

  JValue.JNull = JNull;
  JValue.prototype.JNull = JValue.JNull;

  function JArray(jValues) {
    return new _jarray(jValues);
  }

  function _jarray(jValues) {
    if (typeof jValues === 'undefined') {
      Object.defineProperty(this, 'value', { value: [], writable: false });
    } else {
      if (jValues.some(function (jval) {
        return !jval.isJValue;
      })) throw new Error('JArray: invalid content');
      Object.defineProperty(this, 'value', { value: [].concat(_toConsumableArray(jValues)), writable: false });
    }
  }
  _jarray.prototype = Object.create(JValue.prototype);
  _jarray.prototype.isJArray = true;
  _jarray.prototype.type = 'jarray';
  _jarray.prototype.toString = function () {
    return 'JArray([' + this.value.reduce(function (acc, curr) {
      return acc + curr + ',';
    }, '') + '])';
  };

  JValue.JArray = JArray;
  JValue.prototype.JArray = JValue.JArray;

  function JObject(keyValuePairs) {
    // [Pair(key1,value1),Pair(key2,value2)]
    return new _jobject(keyValuePairs);
  }

  function _jobject(keyValuePairs) {
    if (keyValuePairs.some(function (pair) {
      return !pair.isPair || !pair[0].isJString || !pair[1].isJValue;
    })) throw new Error('JObject: invalid content');
    var dict = keyValuePairs.reduce(function (acc, _ref) {
      var _ref2 = _slicedToArray(_ref, 2),
          jstring = _ref2[0],
          jvalue = _ref2[1];

      acc[jstring.value] = jvalue.value;
      return acc;
    }, {});
    Object.defineProperty(this, 'value', { value: dict, writable: false });
  }
  _jobject.prototype = Object.create(JValue.prototype);
  _jobject.prototype.isJObject = true;
  _jobject.prototype.type = 'jobject';
  _jobject.prototype.toString = function () {
    var OBJ = '';
    return 'JObject({' + OBJ + '})';
  };

  JValue.JObject = JObject;
  JValue.prototype.JObject = JValue.JObject;
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2pzL2NsYXNzZXMuanMiXSwibmFtZXMiOlsiVHVwbGUiLCJQb3NpdGlvbiIsInBhaXIiLCJzdWNjZXNzIiwiZmFpbHVyZSIsInNvbWUiLCJub25lIiwiSlZhbHVlIiwidG9TdHJpbmciLCJBcnJheSIsInByb3RvdHlwZSIsImFwcGx5IiwiUGFpciIsImEiLCJiIiwicmVzdWx0IiwiX3BhaXIiLCJTeW1ib2wiLCJpdGVyYXRvciIsIk9iamVjdCIsImNyZWF0ZSIsImRlZmluZVByb3BlcnR5IiwidmFsdWUiLCJ3cml0YWJsZSIsImlzUGFpciIsInR5cGUiLCJUcmlwbGUiLCJjIiwiX3RyaXBsZSIsImlzVHJpcGxlIiwicm93cyIsInJvdyIsImNvbCIsIl9wb3NpdGlvbiIsImZyb21UZXh0IiwidGV4dCIsInNwbGl0IiwibWFwIiwiaXNQb3NpdGlvbiIsImNoYXIiLCJNYXliZSIsIk5vdGhpbmciLCJuZXdSZXN1bHRWYWx1ZSIsIkp1c3QiLCJlcnIiLCJpbmNyUG9zIiwidGltZXMiLCJsYXN0Um93SW5kZXgiLCJsZW5ndGgiLCJsYXN0Q29sdW1uSW5kZXgiLCJuZWVkc1Jvd0luY3JlbWVudCIsImluY3JQb3NIZWxwZXIiLCJwb3MiLCJkZWNyUG9zIiwibmVlZHNSb3dEZWNyZW1lbnQiLCJkZWNyUG9zSGVscGVyIiwicmVzdCIsInNlbGYiLCJyZXN0X2hlbHBlciIsImpvaW4iLCJuZXh0IiwiaXNOb3RoaW5nIiwiY29uY2F0IiwieCIsInkiLCJtYXRjaGVkIiwic3RyIiwicGFyc2VyTGFiZWwiLCJlcnJvck1zZyIsInZhbCIsImlzSlZhbHVlIiwiSlN0cmluZyIsIl9qc3RyaW5nIiwiRXJyb3IiLCJpc0pTdHJpbmciLCJKTnVtYmVyIiwiZmxvYXQiLCJfam51bWJlciIsImlzTmFOIiwiaXNKTnVtYmVyIiwiSkJvb2wiLCJib29sIiwiX2pib29sIiwiaXNKQm9vbCIsIkpOdWxsIiwibnVsbFZhbHVlIiwiX2pudWxsIiwiaXNKTnVsbCIsIkpBcnJheSIsImpWYWx1ZXMiLCJfamFycmF5IiwianZhbCIsImlzSkFycmF5IiwicmVkdWNlIiwiYWNjIiwiY3VyciIsIkpPYmplY3QiLCJrZXlWYWx1ZVBhaXJzIiwiX2pvYmplY3QiLCJkaWN0IiwianN0cmluZyIsImp2YWx1ZSIsImlzSk9iamVjdCIsIk9CSiJdLCJtYXBwaW5ncyI6Ijs7Ozs7O1VBYWdCQSxLLEdBQUFBLEs7VUFtREFDLFEsR0FBQUEsUTtVQXdGQUMsSSxHQUFBQSxJO1VBYUFDLE8sR0FBQUEsTztVQU1BQyxPLEdBQUFBLE87VUFNQUMsSSxHQUFBQSxJO1VBWUFDLEksR0FBQUEsSTtVQVlBQyxNLEdBQUFBLE07Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7TUFuTVJDLFEsR0FBYUMsTUFBTUMsUyxDQUFuQkYsUTs7O0FBRVJDLFFBQU1DLFNBQU4sQ0FBZ0JGLFFBQWhCLEdBQTJCLFlBQVc7QUFDcEMsV0FBTyxNQUFNQSxTQUFTRyxLQUFULENBQWUsSUFBZixDQUFOLEdBQTZCLEdBQXBDO0FBQ0QsR0FGRDs7QUFJQTtBQUNPLFdBQVNYLEtBQVQsR0FBaUIsQ0FDdkI7O0FBRUQsV0FBU1ksSUFBVCxDQUFjQyxDQUFkLEVBQWlCQyxDQUFqQixFQUFvQjtBQUNsQixRQUFNQyxTQUFTLElBQUlDLEtBQUosQ0FBVUgsQ0FBVixFQUFhQyxDQUFiLENBQWY7QUFDQUMsV0FBT0UsT0FBT0MsUUFBZCw0QkFBMEI7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEscUJBQ2xCTCxDQURrQjs7QUFBQTtBQUFBO0FBQUEscUJBRWxCQyxDQUZrQjs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxLQUExQjtBQUlBLFdBQU9DLE1BQVA7QUFDRDtBQUNESCxPQUFLRixTQUFMLEdBQWlCUyxPQUFPQyxNQUFQLENBQWNwQixNQUFNVSxTQUFwQixDQUFqQjs7QUFFQSxXQUFTTSxLQUFULENBQWVILENBQWYsRUFBa0JDLENBQWxCLEVBQXFCO0FBQ25CSyxXQUFP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SCxLQUFLc0IsTUFBTixJQUNHLENBQUN0QixLQUFLLENBQUwsRUFBUXdFLFNBRFosSUFFRyxDQUFDeEUsS0FBSyxDQUFMLEVBQVFvRSxRQUZwQjtBQUdELEtBSkcsQ0FBSixFQUlJLE1BQU0sSUFBSUcsS0FBSixDQUFVLDBCQUFWLENBQU47QUFDSixRQUFNMEIsT0FBT0YsY0FBY0osTUFBZCxDQUFxQixVQUFDQyxHQUFELFFBQTJCO0FBQUE7QUFBQSxVQUFwQk0sT0FBb0I7QUFBQSxVQUFaQyxNQUFZOztBQUMzRFAsVUFBSU0sUUFBUTlFLEtBQVosSUFBcUIrRSxPQUFPL0UsS0FBNUI7QUFDQSxhQUFPd0UsR0FBUDtBQUNELEtBSFksRUFHVixFQUhVLENBQWI7QUFJQTNFLFdBQU9FLGNBQVAsQ0FBc0IsSUFBdEIsRUFBNEIsT0FBNUIsRUFBcUMsRUFBRUMsT0FBTzZFLElBQVQsRUFBZTVFLFVBQVUsS0FBekIsRUFBckM7QUFDRDtBQUNEMkUsV0FBU3hGLFNBQVQsR0FBcUJTLE9BQU9DLE1BQVAsQ0FBY2IsT0FBT0csU0FBckIsQ0FBckI7QUFDQXdGLFdBQVN4RixTQUFULENBQW1CNEYsU0FBbkIsR0FBK0IsSUFBL0I7QUFDQUosV0FBU3hGLFNBQVQsQ0FBbUJlLElBQW5CLEdBQTBCLFNBQTFCO0FBQ0F5RSxXQUFTeEYsU0FBVCxDQUFtQkYsUUFBbkIsR0FBOEIsWUFBVztBQUN2QyxRQUFNK0YsTUFBTSxFQUFaO0FBQ0EsV0FBTyxjQUFjQSxHQUFkLEdBQW9CLElBQTNCO0FBQ0QsR0FIRDs7QUFLQWhHLFNBQU95RixPQUFQLEdBQWlCQSxPQUFqQjtBQUNBekYsU0FBT0csU0FBUCxDQUFpQnNGLE9BQWpCLEdBQTJCekYsT0FBT3lGLE9BQWxDIiwiZmlsZSI6ImNsYXNzZXMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBNYXliZSB9IGZyb20gJ21heWJlJztcblxuaW1wb3J0IHtcbiAgaXNQYWlyLFxufSBmcm9tICd1dGlsJztcblxuY29uc3QgeyB0b1N0cmluZyB9ID0gQXJyYXkucHJvdG90eXBlO1xuXG5BcnJheS5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuICdbJyArIHRvU3RyaW5nLmFwcGx5KHRoaXMpICsgJ10nO1xufTtcblxuLy8gLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5leHBvcnQgZnVuY3Rpb24gVHVwbGUoKSB7XG59XG5cbmZ1bmN0aW9uIFBhaXIoYSwgYikge1xuICBjb25zdCByZXN1bHQgPSBuZXcgX3BhaXIoYSwgYik7XG4gIHJlc3VsdFtTeW1ib2wuaXRlcmF0b3JdID0gZnVuY3Rpb24qKCkge1xuICAgIHlpZWxkIGE7XG4gICAgeWllbGQgYjtcbiAgfTtcbiAgcmV0dXJuIHJlc3VsdDtcbn1cblBhaXIucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShUdXBsZS5wcm90b3R5cGUpO1xuXG5mdW5jdGlvbiBfcGFpcihhLCBiKSB7XG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCAwLCB7IHZhbHVlOiBhLCB3cml0YWJsZTogZmFsc2UgfSk7XG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCAxLCB7IHZhbHVlOiBiLCB3cml0YWJsZTogZmFsc2UgfSk7XG59XG5fcGFpci5wcm90b3R5cGUuaXNQYWlyID0gdHJ1ZTtcbl9wYWlyLnByb3RvdHlwZS50eXBlID0gJ3BhaXInO1xuX3BhaXIucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiAnWycgKyB0aGlzWzBdLnRvU3RyaW5nKCkgKyAnLCcgKyB0aGlzWzFdLnRvU3RyaW5nKCkgKyAnXSc7XG59O1xuXG5mdW5jdGlvbiBUcmlwbGUoYSwgYiwgYykge1xuICBjb25zdCByZXN1bHQgPSBuZXcgX3RyaXBsZShhLCBiLCBjKTtcbiAgcmVzdWx0W1N5bWJvbC5pdGVyYXRvcl0gPSBmdW5jdGlvbiooKSB7XG4gICAgeWllbGQgYTtcbiAgICB5aWVsZCBiO1xuICAgIHlpZWxkIGM7XG4gIH07XG4gIHJldHVybiByZXN1bHQ7XG59XG5UcmlwbGUucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShUdXBsZS5wcm90b3R5cGUpO1xuXG5mdW5jdGlvbiBfdHJpcGxlKGEsIGIsIGMpIHtcbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsIDAsIHsgdmFsdWU6IGEsIHdyaXRhYmxlOiBmYWxzZSB9KTtcbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsIDEsIHsgdmFsdWU6IGIsIHdyaXRhYmxlOiBmYWxzZSB9KTtcbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsIDIsIHsgdmFsdWU6IGMsIHdyaXRhYmxlOiBmYWxzZSB9KTtcbn1cbl90cmlwbGUucHJvdG90eXBlLmlzVHJpcGxlID0gdHJ1ZTtcbl90cmlwbGUucHJvdG90eXBlLnR5cGUgPSAndHJpcGxlJztcbl90cmlwbGUucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiAnWycgKyB0aGlzWzBdLnRvU3RyaW5nKCkgKyAnLCcgKyB0aGlzWzFdLnRvU3RyaW5nKCkgKyAnLCcgKyB0aGlzWzJdLnRvU3RyaW5nKCkgKyAnXSc7XG59O1xuXG5UdXBsZS5QYWlyID0gUGFpcjtcblR1cGxlLnByb3RvdHlwZS5QYWlyID0gUGFpcjtcblxuVHVwbGUuVHJpcGxlID0gVHJpcGxlO1xuVHVwbGUucHJvdG90eXBlLlRyaXBsZSA9IFRyaXBsZTtcblxuZXhwb3J0IGZ1bmN0aW9uIFBvc2l0aW9uKHJvd3MgPSBbXSwgcm93ID0gMCwgY29sID0gMCkge1xuICByZXR1cm4gbmV3IF9wb3NpdGlvbihyb3dzLCByb3csIGNvbCk7XG59XG5cbi8vIFBvc2l0aW9uLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoe30pO1xuUG9zaXRpb24uZnJvbVRleHQgPSBmdW5jdGlvbih0ZXh0KSB7XG4gIGNvbnN0IHJvd3MgPSB0ZXh0LnNwbGl0KCdcXG4nKVxuICAgIC5tYXAocm93ID0+IHJvdy5zcGxpdCgnJykpO1xuICByZXR1cm4gbmV3IF9wb3NpdGlvbihyb3dzLCAwLCAwKTtcbn07XG5cbmZ1bmN0aW9uIF9wb3NpdGlvbihyb3dzLCByb3csIGNvbCkge1xuICB0aGlzLnJvd3MgPSByb3dzO1xuICB0aGlzLnJvdyA9IHJvdztcbiAgdGhpcy5jb2wgPSBjb2w7XG59XG5cbl9wb3NpdGlvbi5wcm90b3R5cGUuaXNQb3NpdGlvbiA9IHRydWU7XG5fcG9zaXRpb24ucHJvdG90eXBlLmNoYXIgPSBmdW5jdGlvbigpIHtcbiAgbGV0IHJlc3VsdCA9IE1heWJlLk5vdGhpbmcoKTtcbiAgdHJ5IHtcbiAgICBjb25zdCBuZXdSZXN1bHRWYWx1ZSA9IHRoaXMucm93c1t0aGlzLnJvd11bdGhpcy5jb2xdO1xuICAgIGlmICh0eXBlb2YgbmV3UmVzdWx0VmFsdWUgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICByZXN1bHQgPSBNYXliZS5KdXN0KG5ld1Jlc3VsdFZhbHVlKTtcbiAgICB9XG4gIH0gY2F0Y2ggKGVycikge1xuICB9XG4gIHJldHVybiByZXN1bHQ7XG59O1xuX3Bvc2l0aW9uLnByb3RvdHlwZS5pbmNyUG9zID0gZnVuY3Rpb24odGltZXMgPSAwKSB7XG4gIGNvbnN0IGxhc3RSb3dJbmRleCA9IHRoaXMucm93cy5sZW5ndGggLSAxO1xuICBjb25zdCBsYXN0Q29sdW1uSW5kZXggPSB0aGlzLnJvd3NbbGFzdFJvd0luZGV4XS5sZW5ndGggLSAxO1xuICBsZXQgcmVzdWx0ID0gUG9zaXRpb24odGhpcy5yb3dzLCBsYXN0Um93SW5kZXgsIGxhc3RDb2x1bW5JbmRleCArIDEpO1xuICB0cnkge1xuICAgIGNvbnN0IG5lZWRzUm93SW5jcmVtZW50ID0gKHRoaXMuY29sID09PSB0aGlzLnJvd3NbdGhpcy5yb3ddLmxlbmd0aCAtIDEpO1xuICAgIHJlc3VsdCA9ICh0aW1lcyAqIDEpXG4gICAgICA/IGluY3JQb3NIZWxwZXIodGhpcywgdGltZXMpXG4gICAgICA6IFBvc2l0aW9uKFxuICAgICAgICB0aGlzLnJvd3MsXG4gICAgICAgIChuZWVkc1Jvd0luY3JlbWVudCA/IHRoaXMucm93ICsgMSA6IHRoaXMucm93KSxcbiAgICAgICAgKG5lZWRzUm93SW5jcmVtZW50ID8gMCA6IHRoaXMuY29sICsgMSksXG4gICAgICApO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH0gY2F0Y2ggKGVycikge31cbiAgcmV0dXJuIHJlc3VsdDtcblxuICBmdW5jdGlvbiBpbmNyUG9zSGVscGVyKHBvcywgdGltZXMgPSAwKSB7XG4gICAgaWYgKHRpbWVzID09PSAwKSByZXR1cm4gcG9zO1xuICAgIHJldHVybiBpbmNyUG9zSGVscGVyKHBvcy5pbmNyUG9zKCksIHRpbWVzIC0gMSk7XG4gIH1cbn07XG5fcG9zaXRpb24ucHJvdG90eXBlLmRlY3JQb3MgPSBmdW5jdGlvbih0aW1lcyA9IDApIHtcbiAgbGV0IHJlc3VsdCA9IFBvc2l0aW9uKHRoaXMucm93cywgLTEsIC0xKTtcbiAgdHJ5IHtcbiAgICBjb25zdCBuZWVkc1Jvd0RlY3JlbWVudCA9ICh0aGlzLmNvbCA9PT0gMCk7XG4gICAgcmVzdWx0ID0gdGltZXNcbiAgICAgID8gZGVjclBvc0hlbHBlcih0aGlzLCB0aW1lcylcbiAgICAgIDogUG9zaXRpb24oXG4gICAgICAgIHRoaXMucm93cyxcbiAgICAgICAgKG5lZWRzUm93RGVjcmVtZW50ID8gdGhpcy5yb3cgLSAxIDogdGhpcy5yb3cpLFxuICAgICAgICAobmVlZHNSb3dEZWNyZW1lbnQgPyB0aGlzLnJvd3NbdGhpcy5yb3cgLSAxXS5sZW5ndGggLSAxIDogdGhpcy5jb2wgLSAxKSxcbiAgICAgICk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfSBjYXRjaCAoZXJyKSB7fVxuICByZXR1cm4gcmVzdWx0O1xuXG4gIGZ1bmN0aW9uIGRlY3JQb3NIZWxwZXIocG9zLCB0aW1lcyA9IDApIHtcbiAgICBpZiAodGltZXMgPT09IDApIHJldHVybiBwb3M7XG4gICAgcmV0dXJuIGRlY3JQb3NIZWxwZXIocG9zLmRlY3JQb3MoKSwgdGltZXMgLSAxKTtcbiAgfVxufTtcbl9wb3NpdGlvbi5wcm90b3R5cGUucmVzdCA9IGZ1bmN0aW9uKCkge1xuICBjb25zdCBzZWxmID0gdGhpcztcbiAgcmV0dXJuIHJlc3RfaGVscGVyKCkuam9pbignJyk7XG4gIGZ1bmN0aW9uIHJlc3RfaGVscGVyKCkge1xuICAgIGNvbnN0IG5leHQgPSBzZWxmLmNoYXIoKTtcbiAgICBpZiAobmV4dC5pc05vdGhpbmcpIHJldHVybiBbXTtcbiAgICByZXR1cm4gW25leHQudmFsdWVdLmNvbmNhdChzZWxmLmluY3JQb3MoKS5yZXN0KCkpO1xuICB9XG59O1xuX3Bvc2l0aW9uLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gJ3Jvdz0nICsgdGhpcy5yb3dcbiAgICAgICAgKyAnO2NvbD0nICsgdGhpcy5jb2xcbiAgICAgICAgKyAnO3Jlc3Q9JyArIHRoaXMucmVzdCgpO1xufTtcblxuLy8gLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIGRlcHJlY2F0ZWQgaW4gZmF2b3VyIG9mIFR1cGxlLCBkYXRhLk1heWJlIGFuZCBkYXRhLlZhbGlkYXRpb25cbmV4cG9ydCBmdW5jdGlvbiBwYWlyKHgsIHkpIHtcbiAgY29uc3QgcmVzdWx0ID0gW3gsIHldO1xuICByZXN1bHQudHlwZSA9ICdwYWlyJztcbiAgcmVzdWx0LnRvU3RyaW5nID0gKCkgPT4ge1xuICAgIHJldHVybiAnWydcbiAgICAgICAgICAgICsgKGlzUGFpcihyZXN1bHRbMF0pID8gcmVzdWx0WzBdLnRvU3RyaW5nKCkgOiByZXN1bHRbMF0pXG4gICAgICAgICAgICArICcsJ1xuICAgICAgICAgICAgKyAoaXNQYWlyKHJlc3VsdFsxXSkgPyByZXN1bHRbMV0udG9TdHJpbmcoKSA6IHJlc3VsdFsxXSlcbiAgICAgICAgICAgICsgJ10nO1xuICB9O1xuICByZXR1cm4gcmVzdWx0O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc3VjY2VzcyhtYXRjaGVkLCBzdHIpIHtcbiAgY29uc3QgcmVzdWx0ID0gcGFpcihtYXRjaGVkLCBzdHIpO1xuICByZXN1bHQudHlwZSA9ICdzdWNjZXNzJztcbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGZhaWx1cmUocGFyc2VyTGFiZWwsIGVycm9yTXNnKSB7XG4gIGNvbnN0IHJlc3VsdCA9IHBhaXIocGFyc2VyTGFiZWwsIGVycm9yTXNnKTtcbiAgcmVzdWx0LnR5cGUgPSAnZmFpbHVyZSc7XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzb21lKHZhbHVlKSB7XG4gIHJldHVybiB7XG4gICAgdHlwZTogJ3NvbWUnLFxuICAgIHZhbCgpIHtcbiAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9LFxuICAgIHRvU3RyaW5nKCkge1xuICAgICAgcmV0dXJuIGBzb21lKCR7dmFsdWV9KWA7XG4gICAgfSxcbiAgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG5vbmUoKSB7XG4gIHJldHVybiB7XG4gICAgdHlwZTogJ25vbmUnLFxuICAgIHZhbCgpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH0sXG4gICAgdG9TdHJpbmcoKSB7XG4gICAgICByZXR1cm4gJ25vbmUoKSc7XG4gICAgfSxcbiAgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIEpWYWx1ZSgpIHtcbn1cbkpWYWx1ZS5wcm90b3R5cGUuaXNKVmFsdWUgPSB0cnVlO1xuXG5mdW5jdGlvbiBKU3RyaW5nKHN0cikge1xuICByZXR1cm4gbmV3IF9qc3RyaW5nKHN0cik7XG59XG5cbmZ1bmN0aW9uIF9qc3RyaW5nKHN0cikge1xuICBpZiAodHlwZW9mIHN0ciAhPT0gJ3N0cmluZycpIHRocm93IG5ldyBFcnJvcignSlN0cmluZzogaW52YWxpZCB2YWx1ZScpO1xuICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgJ3ZhbHVlJywgeyB2YWx1ZTogc3RyLCB3cml0YWJsZTogZmFsc2UgfSk7XG59XG5fanN0cmluZy5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKEpWYWx1ZS5wcm90b3R5cGUpO1xuX2pzdHJpbmcucHJvdG90eXBlLmlzSlN0cmluZyA9IHRydWU7XG5fanN0cmluZy5wcm90b3R5cGUudHlwZSA9ICdqc3RyaW5nJztcbl9qc3RyaW5nLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gJ0pTdHJpbmcoJyArIHRoaXMudmFsdWUudG9TdHJpbmcoKSArICcpJztcbn07XG5cbkpWYWx1ZS5KU3RyaW5nID0gSlN0cmluZztcbkpWYWx1ZS5wcm90b3R5cGUuSlN0cmluZyA9IEpWYWx1ZS5KU3RyaW5nO1xuXG5mdW5jdGlvbiBKTnVtYmVyKGZsb2F0KSB7XG4gIHJldHVybiBuZXcgX2pudW1iZXIoZmxvYXQpO1xufVxuXG5mdW5jdGlvbiBfam51bWJlcihmbG9hdCkge1xuICBpZiAodHlwZW9mIGZsb2F0ICE9PSAnbnVtYmVyJ1xuICAgICAgICB8fCBpc05hTihmbG9hdCkpIHRocm93IG5ldyBFcnJvcignSk51bWJlcjogaW52YWxpZCB2YWx1ZScpO1xuICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgJ3ZhbHVlJywgeyB2YWx1ZTogZmxvYXQsIHdyaXRhYmxlOiBmYWxzZSB9KTtcbn1cbl9qbnVtYmVyLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoSlZhbHVlLnByb3RvdHlwZSk7XG5fam51bWJlci5wcm90b3R5cGUuaXNKTnVtYmVyID0gdHJ1ZTtcbl9qbnVtYmVyLnByb3RvdHlwZS50eXBlID0gJ2pudW1iZXInO1xuX2pudW1iZXIucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiAnSk51bWJlcignICsgdGhpcy52YWx1ZS50b1N0cmluZygpICsgJyknO1xufTtcblxuSlZhbHVlLkpOdW1iZXIgPSBKTnVtYmVyO1xuSlZhbHVlLnByb3RvdHlwZS5KTnVtYmVyID0gSlZhbHVlLkpOdW1iZXI7XG5cbmZ1bmN0aW9uIEpCb29sKGJvb2wpIHtcbiAgcmV0dXJuIG5ldyBfamJvb2woYm9vbCk7XG59XG5cbmZ1bmN0aW9uIF9qYm9vbChib29sKSB7XG4gIGlmICh0eXBlb2YgYm9vbCAhPT0gJ2Jvb2xlYW4nKSB0aHJvdyBuZXcgRXJyb3IoJ0pCb29sOiBpbnZhbGlkIHZhbHVlJyk7XG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCAndmFsdWUnLCB7IHZhbHVlOiBib29sLCB3cml0YWJsZTogZmFsc2UgfSk7XG59XG5famJvb2wucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShKVmFsdWUucHJvdG90eXBlKTtcbl9qYm9vbC5wcm90b3R5cGUuaXNKQm9vbCA9IHRydWU7XG5famJvb2wucHJvdG90eXBlLnR5cGUgPSAnamJvb2wnO1xuX2pib29sLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gJ0pCb29sKCcgKyB0aGlzLnZhbHVlLnRvU3RyaW5nKCkgKyAnKSc7XG59O1xuXG5KVmFsdWUuSkJvb2wgPSBKQm9vbDtcbkpWYWx1ZS5wcm90b3R5cGUuSkJvb2wgPSBKVmFsdWUuSkJvb2w7XG5cbmZ1bmN0aW9uIEpOdWxsKG51bGxWYWx1ZSkge1xuICByZXR1cm4gbmV3IF9qbnVsbChudWxsVmFsdWUpO1xufVxuXG5mdW5jdGlvbiBfam51bGwobnVsbFZhbHVlKSB7XG4gIGlmIChudWxsVmFsdWUgIT09IG51bGwpIHRocm93IG5ldyBFcnJvcignSk51bGw6IGludmFsaWQgdmFsdWUnKTtcbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsICd2YWx1ZScsIHsgdmFsdWU6IG51bGxWYWx1ZSwgd3JpdGFibGU6IGZhbHNlIH0pO1xufVxuX2pudWxsLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoSlZhbHVlLnByb3RvdHlwZSk7XG5fam51bGwucHJvdG90eXBlLmlzSk51bGwgPSB0cnVlO1xuX2pudWxsLnByb3RvdHlwZS50eXBlID0gJ2pudWxsJztcbl9qbnVsbC5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuICdKTnVsbChudWxsKSc7XG59O1xuXG5KVmFsdWUuSk51bGwgPSBKTnVsbDtcbkpWYWx1ZS5wcm90b3R5cGUuSk51bGwgPSBKVmFsdWUuSk51bGw7XG5cbmZ1bmN0aW9uIEpBcnJheShqVmFsdWVzKSB7XG4gIHJldHVybiBuZXcgX2phcnJheShqVmFsdWVzKTtcbn1cblxuZnVuY3Rpb24gX2phcnJheShqVmFsdWVzKSB7XG4gIGlmICh0eXBlb2YgalZhbHVlcyA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgJ3ZhbHVlJywgeyB2YWx1ZTogW10sIHdyaXRhYmxlOiBmYWxzZSB9KTtcbiAgfSBlbHNlIHtcbiAgICBpZiAoalZhbHVlcy5zb21lKGp2YWwgPT4gKCFqdmFsLmlzSlZhbHVlKSkpIHRocm93IG5ldyBFcnJvcignSkFycmF5OiBpbnZhbGlkIGNvbnRlbnQnKTtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgJ3ZhbHVlJywgeyB2YWx1ZTogWy4uLmpWYWx1ZXNdLCB3cml0YWJsZTogZmFsc2UgfSk7XG4gIH1cbn1cbl9qYXJyYXkucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShKVmFsdWUucHJvdG90eXBlKTtcbl9qYXJyYXkucHJvdG90eXBlLmlzSkFycmF5ID0gdHJ1ZTtcbl9qYXJyYXkucHJvdG90eXBlLnR5cGUgPSAnamFycmF5Jztcbl9qYXJyYXkucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiAnSkFycmF5KFsnICsgdGhpcy52YWx1ZS5yZWR1Y2UoKGFjYywgY3VycikgPT4gYWNjICsgY3VyciArICcsJywgJycpICsgJ10pJztcbn07XG5cbkpWYWx1ZS5KQXJyYXkgPSBKQXJyYXk7XG5KVmFsdWUucHJvdG90eXBlLkpBcnJheSA9IEpWYWx1ZS5KQXJyYXk7XG5cbmZ1bmN0aW9uIEpPYmplY3Qoa2V5VmFsdWVQYWlycykgeyAvLyBbUGFpcihrZXkxLHZhbHVlMSksUGFpcihrZXkyLHZhbHVlMildXG4gIHJldHVybiBuZXcgX2pvYmplY3Qoa2V5VmFsdWVQYWlycyk7XG59XG5cbmZ1bmN0aW9uIF9qb2JqZWN0KGtleVZhbHVlUGFpcnMpIHtcbiAgaWYgKGtleVZhbHVlUGFpcnMuc29tZShwYWlyID0+IHtcbiAgICByZXR1cm4gKCFwYWlyLmlzUGFpclxuICAgICAgICAgICAgfHwgIXBhaXJbMF0uaXNKU3RyaW5nXG4gICAgICAgICAgICB8fCAhcGFpclsxXS5pc0pWYWx1ZSk7XG4gIH0pKSB0aHJvdyBuZXcgRXJyb3IoJ0pPYmplY3Q6IGludmFsaWQgY29udGVudCcpO1xuICBjb25zdCBkaWN0ID0ga2V5VmFsdWVQYWlycy5yZWR1Y2UoKGFjYywgW2pzdHJpbmcsanZhbHVlXSkgPT4ge1xuICAgIGFjY1tqc3RyaW5nLnZhbHVlXSA9IGp2YWx1ZS52YWx1ZTtcbiAgICByZXR1cm4gYWNjO1xuICB9LCB7fSk7XG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCAndmFsdWUnLCB7IHZhbHVlOiBkaWN0LCB3cml0YWJsZTogZmFsc2UgfSk7XG59XG5fam9iamVjdC5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKEpWYWx1ZS5wcm90b3R5cGUpO1xuX2pvYmplY3QucHJvdG90eXBlLmlzSk9iamVjdCA9IHRydWU7XG5fam9iamVjdC5wcm90b3R5cGUudHlwZSA9ICdqb2JqZWN0Jztcbl9qb2JqZWN0LnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uKCkge1xuICBjb25zdCBPQkogPSAnJztcbiAgcmV0dXJuICdKT2JqZWN0KHsnICsgT0JKICsgJ30pJztcbn07XG5cbkpWYWx1ZS5KT2JqZWN0ID0gSk9iamVjdDtcbkpWYWx1ZS5wcm90b3R5cGUuSk9iamVjdCA9IEpWYWx1ZS5KT2JqZWN0O1xuIl19