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

      acc[jstring.value] = jvalue;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2pzL2NsYXNzZXMuanMiXSwibmFtZXMiOlsiVHVwbGUiLCJQb3NpdGlvbiIsInBhaXIiLCJzdWNjZXNzIiwiZmFpbHVyZSIsInNvbWUiLCJub25lIiwiSlZhbHVlIiwidG9TdHJpbmciLCJBcnJheSIsInByb3RvdHlwZSIsImFwcGx5IiwiUGFpciIsImEiLCJiIiwicmVzdWx0IiwiX3BhaXIiLCJTeW1ib2wiLCJpdGVyYXRvciIsIk9iamVjdCIsImNyZWF0ZSIsImRlZmluZVByb3BlcnR5IiwidmFsdWUiLCJ3cml0YWJsZSIsImlzUGFpciIsInR5cGUiLCJUcmlwbGUiLCJjIiwiX3RyaXBsZSIsImlzVHJpcGxlIiwicm93cyIsInJvdyIsImNvbCIsIl9wb3NpdGlvbiIsImZyb21UZXh0IiwidGV4dCIsInNwbGl0IiwibWFwIiwiaXNQb3NpdGlvbiIsImNoYXIiLCJNYXliZSIsIk5vdGhpbmciLCJuZXdSZXN1bHRWYWx1ZSIsIkp1c3QiLCJlcnIiLCJpbmNyUG9zIiwidGltZXMiLCJsYXN0Um93SW5kZXgiLCJsZW5ndGgiLCJsYXN0Q29sdW1uSW5kZXgiLCJuZWVkc1Jvd0luY3JlbWVudCIsImluY3JQb3NIZWxwZXIiLCJwb3MiLCJkZWNyUG9zIiwibmVlZHNSb3dEZWNyZW1lbnQiLCJkZWNyUG9zSGVscGVyIiwicmVzdCIsInNlbGYiLCJyZXN0X2hlbHBlciIsImpvaW4iLCJuZXh0IiwiaXNOb3RoaW5nIiwiY29uY2F0IiwieCIsInkiLCJtYXRjaGVkIiwic3RyIiwicGFyc2VyTGFiZWwiLCJlcnJvck1zZyIsInZhbCIsImlzSlZhbHVlIiwiSlN0cmluZyIsIl9qc3RyaW5nIiwiRXJyb3IiLCJpc0pTdHJpbmciLCJKTnVtYmVyIiwiZmxvYXQiLCJfam51bWJlciIsImlzTmFOIiwiaXNKTnVtYmVyIiwiSkJvb2wiLCJib29sIiwiX2pib29sIiwiaXNKQm9vbCIsIkpOdWxsIiwibnVsbFZhbHVlIiwiX2pudWxsIiwiaXNKTnVsbCIsIkpBcnJheSIsImpWYWx1ZXMiLCJfamFycmF5IiwianZhbCIsImlzSkFycmF5IiwicmVkdWNlIiwiYWNjIiwiY3VyciIsIkpPYmplY3QiLCJrZXlWYWx1ZVBhaXJzIiwiX2pvYmplY3QiLCJkaWN0IiwianN0cmluZyIsImp2YWx1ZSIsImlzSk9iamVjdCIsIk9CSiJdLCJtYXBwaW5ncyI6Ijs7Ozs7O1VBYWdCQSxLLEdBQUFBLEs7VUFtREFDLFEsR0FBQUEsUTtVQXdGQUMsSSxHQUFBQSxJO1VBYUFDLE8sR0FBQUEsTztVQU1BQyxPLEdBQUFBLE87VUFNQUMsSSxHQUFBQSxJO1VBWUFDLEksR0FBQUEsSTtVQVlBQyxNLEdBQUFBLE07Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7TUFuTVJDLFEsR0FBYUMsTUFBTUMsUyxDQUFuQkYsUTs7O0FBRVJDLFFBQU1DLFNBQU4sQ0FBZ0JGLFFBQWhCLEdBQTJCLFlBQVc7QUFDcEMsV0FBTyxNQUFNQSxTQUFTRyxLQUFULENBQWUsSUFBZixDQUFOLEdBQTZCLEdBQXBDO0FBQ0QsR0FGRDs7QUFJQTtBQUNPLFdBQVNYLEtBQVQsR0FBaUIsQ0FDdkI7O0FBRUQsV0FBU1ksSUFBVCxDQUFjQyxDQUFkLEVBQWlCQyxDQUFqQixFQUFvQjtBQUNsQixRQUFNQyxTQUFTLElBQUlDLEtBQUosQ0FBVUgsQ0FBVixFQUFhQyxDQUFiLENBQWY7QUFDQUMsV0FBT0UsT0FBT0MsUUFBZCw0QkFBMEI7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEscUJBQ2xCTCxDQURrQjs7QUFBQTtBQUFBO0FBQUEscUJBRWxCQyxDQUZrQjs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxLQUExQjtBQUlBLFdBQU9DLE1BQVA7QUFDRDtBQUNESCxPQUFLRixTQUFMLEdBQWlCUyxPQUFPQyxNQUFQLENBQWNwQixNQUFNVSxTQUFwQixDQUFqQjs7QUFFQSxXQUFTTSxLQUFULENBQWVILENBQWYsRUFBa0JDLENBQWxCLEVBQXFCO0FBQ25CSyxXQUFP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SCxLQUFLc0IsTUFBTixJQUNHLENBQUN0QixLQUFLLENBQUwsRUFBUXdFLFNBRFosSUFFRyxDQUFDeEUsS0FBSyxDQUFMLEVBQVFvRSxRQUZwQjtBQUdELEtBSkcsQ0FBSixFQUlJLE1BQU0sSUFBSUcsS0FBSixDQUFVLDBCQUFWLENBQU47QUFDSixRQUFNMEIsT0FBT0YsY0FBY0osTUFBZCxDQUFxQixVQUFDQyxHQUFELFFBQTJCO0FBQUE7QUFBQSxVQUFwQk0sT0FBb0I7QUFBQSxVQUFaQyxNQUFZOztBQUMzRFAsVUFBSU0sUUFBUTlFLEtBQVosSUFBcUIrRSxNQUFyQjtBQUNBLGFBQU9QLEdBQVA7QUFDRCxLQUhZLEVBR1YsRUFIVSxDQUFiO0FBSUEzRSxXQUFPRSxjQUFQLENBQXNCLElBQXRCLEVBQTRCLE9BQTVCLEVBQXFDLEVBQUVDLE9BQU82RSxJQUFULEVBQWU1RSxVQUFVLEtBQXpCLEVBQXJDO0FBQ0Q7QUFDRDJFLFdBQVN4RixTQUFULEdBQXFCUyxPQUFPQyxNQUFQLENBQWNiLE9BQU9HLFNBQXJCLENBQXJCO0FBQ0F3RixXQUFTeEYsU0FBVCxDQUFtQjRGLFNBQW5CLEdBQStCLElBQS9CO0FBQ0FKLFdBQVN4RixTQUFULENBQW1CZSxJQUFuQixHQUEwQixTQUExQjtBQUNBeUUsV0FBU3hGLFNBQVQsQ0FBbUJGLFFBQW5CLEdBQThCLFlBQVc7QUFDdkMsUUFBTStGLE1BQU0sRUFBWjtBQUNBLFdBQU8sY0FBY0EsR0FBZCxHQUFvQixJQUEzQjtBQUNELEdBSEQ7O0FBS0FoRyxTQUFPeUYsT0FBUCxHQUFpQkEsT0FBakI7QUFDQXpGLFNBQU9HLFNBQVAsQ0FBaUJzRixPQUFqQixHQUEyQnpGLE9BQU95RixPQUFsQyIsImZpbGUiOiJjbGFzc2VzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgTWF5YmUgfSBmcm9tICdtYXliZSc7XG5cbmltcG9ydCB7XG4gIGlzUGFpcixcbn0gZnJvbSAndXRpbCc7XG5cbmNvbnN0IHsgdG9TdHJpbmcgfSA9IEFycmF5LnByb3RvdHlwZTtcblxuQXJyYXkucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiAnWycgKyB0b1N0cmluZy5hcHBseSh0aGlzKSArICddJztcbn07XG5cbi8vIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuZXhwb3J0IGZ1bmN0aW9uIFR1cGxlKCkge1xufVxuXG5mdW5jdGlvbiBQYWlyKGEsIGIpIHtcbiAgY29uc3QgcmVzdWx0ID0gbmV3IF9wYWlyKGEsIGIpO1xuICByZXN1bHRbU3ltYm9sLml0ZXJhdG9yXSA9IGZ1bmN0aW9uKigpIHtcbiAgICB5aWVsZCBhO1xuICAgIHlpZWxkIGI7XG4gIH07XG4gIHJldHVybiByZXN1bHQ7XG59XG5QYWlyLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoVHVwbGUucHJvdG90eXBlKTtcblxuZnVuY3Rpb24gX3BhaXIoYSwgYikge1xuICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgMCwgeyB2YWx1ZTogYSwgd3JpdGFibGU6IGZhbHNlIH0pO1xuICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgMSwgeyB2YWx1ZTogYiwgd3JpdGFibGU6IGZhbHNlIH0pO1xufVxuX3BhaXIucHJvdG90eXBlLmlzUGFpciA9IHRydWU7XG5fcGFpci5wcm90b3R5cGUudHlwZSA9ICdwYWlyJztcbl9wYWlyLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gJ1snICsgdGhpc1swXS50b1N0cmluZygpICsgJywnICsgdGhpc1sxXS50b1N0cmluZygpICsgJ10nO1xufTtcblxuZnVuY3Rpb24gVHJpcGxlKGEsIGIsIGMpIHtcbiAgY29uc3QgcmVzdWx0ID0gbmV3IF90cmlwbGUoYSwgYiwgYyk7XG4gIHJlc3VsdFtTeW1ib2wuaXRlcmF0b3JdID0gZnVuY3Rpb24qKCkge1xuICAgIHlpZWxkIGE7XG4gICAgeWllbGQgYjtcbiAgICB5aWVsZCBjO1xuICB9O1xuICByZXR1cm4gcmVzdWx0O1xufVxuVHJpcGxlLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoVHVwbGUucHJvdG90eXBlKTtcblxuZnVuY3Rpb24gX3RyaXBsZShhLCBiLCBjKSB7XG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCAwLCB7IHZhbHVlOiBhLCB3cml0YWJsZTogZmFsc2UgfSk7XG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCAxLCB7IHZhbHVlOiBiLCB3cml0YWJsZTogZmFsc2UgfSk7XG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCAyLCB7IHZhbHVlOiBjLCB3cml0YWJsZTogZmFsc2UgfSk7XG59XG5fdHJpcGxlLnByb3RvdHlwZS5pc1RyaXBsZSA9IHRydWU7XG5fdHJpcGxlLnByb3RvdHlwZS50eXBlID0gJ3RyaXBsZSc7XG5fdHJpcGxlLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gJ1snICsgdGhpc1swXS50b1N0cmluZygpICsgJywnICsgdGhpc1sxXS50b1N0cmluZygpICsgJywnICsgdGhpc1syXS50b1N0cmluZygpICsgJ10nO1xufTtcblxuVHVwbGUuUGFpciA9IFBhaXI7XG5UdXBsZS5wcm90b3R5cGUuUGFpciA9IFBhaXI7XG5cblR1cGxlLlRyaXBsZSA9IFRyaXBsZTtcblR1cGxlLnByb3RvdHlwZS5UcmlwbGUgPSBUcmlwbGU7XG5cbmV4cG9ydCBmdW5jdGlvbiBQb3NpdGlvbihyb3dzID0gW10sIHJvdyA9IDAsIGNvbCA9IDApIHtcbiAgcmV0dXJuIG5ldyBfcG9zaXRpb24ocm93cywgcm93LCBjb2wpO1xufVxuXG4vLyBQb3NpdGlvbi5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKHt9KTtcblBvc2l0aW9uLmZyb21UZXh0ID0gZnVuY3Rpb24odGV4dCkge1xuICBjb25zdCByb3dzID0gdGV4dC5zcGxpdCgnXFxuJylcbiAgICAubWFwKHJvdyA9PiByb3cuc3BsaXQoJycpKTtcbiAgcmV0dXJuIG5ldyBfcG9zaXRpb24ocm93cywgMCwgMCk7XG59O1xuXG5mdW5jdGlvbiBfcG9zaXRpb24ocm93cywgcm93LCBjb2wpIHtcbiAgdGhpcy5yb3dzID0gcm93cztcbiAgdGhpcy5yb3cgPSByb3c7XG4gIHRoaXMuY29sID0gY29sO1xufVxuXG5fcG9zaXRpb24ucHJvdG90eXBlLmlzUG9zaXRpb24gPSB0cnVlO1xuX3Bvc2l0aW9uLnByb3RvdHlwZS5jaGFyID0gZnVuY3Rpb24oKSB7XG4gIGxldCByZXN1bHQgPSBNYXliZS5Ob3RoaW5nKCk7XG4gIHRyeSB7XG4gICAgY29uc3QgbmV3UmVzdWx0VmFsdWUgPSB0aGlzLnJvd3NbdGhpcy5yb3ddW3RoaXMuY29sXTtcbiAgICBpZiAodHlwZW9mIG5ld1Jlc3VsdFZhbHVlICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgcmVzdWx0ID0gTWF5YmUuSnVzdChuZXdSZXN1bHRWYWx1ZSk7XG4gICAgfVxuICB9IGNhdGNoIChlcnIpIHtcbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufTtcbl9wb3NpdGlvbi5wcm90b3R5cGUuaW5jclBvcyA9IGZ1bmN0aW9uKHRpbWVzID0gMCkge1xuICBjb25zdCBsYXN0Um93SW5kZXggPSB0aGlzLnJvd3MubGVuZ3RoIC0gMTtcbiAgY29uc3QgbGFzdENvbHVtbkluZGV4ID0gdGhpcy5yb3dzW2xhc3RSb3dJbmRleF0ubGVuZ3RoIC0gMTtcbiAgbGV0IHJlc3VsdCA9IFBvc2l0aW9uKHRoaXMucm93cywgbGFzdFJvd0luZGV4LCBsYXN0Q29sdW1uSW5kZXggKyAxKTtcbiAgdHJ5IHtcbiAgICBjb25zdCBuZWVkc1Jvd0luY3JlbWVudCA9ICh0aGlzLmNvbCA9PT0gdGhpcy5yb3dzW3RoaXMucm93XS5sZW5ndGggLSAxKTtcbiAgICByZXN1bHQgPSAodGltZXMgKiAxKVxuICAgICAgPyBpbmNyUG9zSGVscGVyKHRoaXMsIHRpbWVzKVxuICAgICAgOiBQb3NpdGlvbihcbiAgICAgICAgdGhpcy5yb3dzLFxuICAgICAgICAobmVlZHNSb3dJbmNyZW1lbnQgPyB0aGlzLnJvdyArIDEgOiB0aGlzLnJvdyksXG4gICAgICAgIChuZWVkc1Jvd0luY3JlbWVudCA/IDAgOiB0aGlzLmNvbCArIDEpLFxuICAgICAgKTtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9IGNhdGNoIChlcnIpIHt9XG4gIHJldHVybiByZXN1bHQ7XG5cbiAgZnVuY3Rpb24gaW5jclBvc0hlbHBlcihwb3MsIHRpbWVzID0gMCkge1xuICAgIGlmICh0aW1lcyA9PT0gMCkgcmV0dXJuIHBvcztcbiAgICByZXR1cm4gaW5jclBvc0hlbHBlcihwb3MuaW5jclBvcygpLCB0aW1lcyAtIDEpO1xuICB9XG59O1xuX3Bvc2l0aW9uLnByb3RvdHlwZS5kZWNyUG9zID0gZnVuY3Rpb24odGltZXMgPSAwKSB7XG4gIGxldCByZXN1bHQgPSBQb3NpdGlvbih0aGlzLnJvd3MsIC0xLCAtMSk7XG4gIHRyeSB7XG4gICAgY29uc3QgbmVlZHNSb3dEZWNyZW1lbnQgPSAodGhpcy5jb2wgPT09IDApO1xuICAgIHJlc3VsdCA9IHRpbWVzXG4gICAgICA/IGRlY3JQb3NIZWxwZXIodGhpcywgdGltZXMpXG4gICAgICA6IFBvc2l0aW9uKFxuICAgICAgICB0aGlzLnJvd3MsXG4gICAgICAgIChuZWVkc1Jvd0RlY3JlbWVudCA/IHRoaXMucm93IC0gMSA6IHRoaXMucm93KSxcbiAgICAgICAgKG5lZWRzUm93RGVjcmVtZW50ID8gdGhpcy5yb3dzW3RoaXMucm93IC0gMV0ubGVuZ3RoIC0gMSA6IHRoaXMuY29sIC0gMSksXG4gICAgICApO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH0gY2F0Y2ggKGVycikge31cbiAgcmV0dXJuIHJlc3VsdDtcblxuICBmdW5jdGlvbiBkZWNyUG9zSGVscGVyKHBvcywgdGltZXMgPSAwKSB7XG4gICAgaWYgKHRpbWVzID09PSAwKSByZXR1cm4gcG9zO1xuICAgIHJldHVybiBkZWNyUG9zSGVscGVyKHBvcy5kZWNyUG9zKCksIHRpbWVzIC0gMSk7XG4gIH1cbn07XG5fcG9zaXRpb24ucHJvdG90eXBlLnJlc3QgPSBmdW5jdGlvbigpIHtcbiAgY29uc3Qgc2VsZiA9IHRoaXM7XG4gIHJldHVybiByZXN0X2hlbHBlcigpLmpvaW4oJycpO1xuICBmdW5jdGlvbiByZXN0X2hlbHBlcigpIHtcbiAgICBjb25zdCBuZXh0ID0gc2VsZi5jaGFyKCk7XG4gICAgaWYgKG5leHQuaXNOb3RoaW5nKSByZXR1cm4gW107XG4gICAgcmV0dXJuIFtuZXh0LnZhbHVlXS5jb25jYXQoc2VsZi5pbmNyUG9zKCkucmVzdCgpKTtcbiAgfVxufTtcbl9wb3NpdGlvbi5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuICdyb3c9JyArIHRoaXMucm93XG4gICAgICAgICsgJztjb2w9JyArIHRoaXMuY29sXG4gICAgICAgICsgJztyZXN0PScgKyB0aGlzLnJlc3QoKTtcbn07XG5cbi8vIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBkZXByZWNhdGVkIGluIGZhdm91ciBvZiBUdXBsZSwgZGF0YS5NYXliZSBhbmQgZGF0YS5WYWxpZGF0aW9uXG5leHBvcnQgZnVuY3Rpb24gcGFpcih4LCB5KSB7XG4gIGNvbnN0IHJlc3VsdCA9IFt4LCB5XTtcbiAgcmVzdWx0LnR5cGUgPSAncGFpcic7XG4gIHJlc3VsdC50b1N0cmluZyA9ICgpID0+IHtcbiAgICByZXR1cm4gJ1snXG4gICAgICAgICAgICArIChpc1BhaXIocmVzdWx0WzBdKSA/IHJlc3VsdFswXS50b1N0cmluZygpIDogcmVzdWx0WzBdKVxuICAgICAgICAgICAgKyAnLCdcbiAgICAgICAgICAgICsgKGlzUGFpcihyZXN1bHRbMV0pID8gcmVzdWx0WzFdLnRvU3RyaW5nKCkgOiByZXN1bHRbMV0pXG4gICAgICAgICAgICArICddJztcbiAgfTtcbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHN1Y2Nlc3MobWF0Y2hlZCwgc3RyKSB7XG4gIGNvbnN0IHJlc3VsdCA9IHBhaXIobWF0Y2hlZCwgc3RyKTtcbiAgcmVzdWx0LnR5cGUgPSAnc3VjY2Vzcyc7XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBmYWlsdXJlKHBhcnNlckxhYmVsLCBlcnJvck1zZykge1xuICBjb25zdCByZXN1bHQgPSBwYWlyKHBhcnNlckxhYmVsLCBlcnJvck1zZyk7XG4gIHJlc3VsdC50eXBlID0gJ2ZhaWx1cmUnO1xuICByZXR1cm4gcmVzdWx0O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc29tZSh2YWx1ZSkge1xuICByZXR1cm4ge1xuICAgIHR5cGU6ICdzb21lJyxcbiAgICB2YWwoKSB7XG4gICAgICByZXR1cm4gdmFsdWU7XG4gICAgfSxcbiAgICB0b1N0cmluZygpIHtcbiAgICAgIHJldHVybiBgc29tZSgke3ZhbHVlfSlgO1xuICAgIH0sXG4gIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBub25lKCkge1xuICByZXR1cm4ge1xuICAgIHR5cGU6ICdub25lJyxcbiAgICB2YWwoKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9LFxuICAgIHRvU3RyaW5nKCkge1xuICAgICAgcmV0dXJuICdub25lKCknO1xuICAgIH0sXG4gIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBKVmFsdWUoKSB7XG59XG5KVmFsdWUucHJvdG90eXBlLmlzSlZhbHVlID0gdHJ1ZTtcblxuZnVuY3Rpb24gSlN0cmluZyhzdHIpIHtcbiAgcmV0dXJuIG5ldyBfanN0cmluZyhzdHIpO1xufVxuXG5mdW5jdGlvbiBfanN0cmluZyhzdHIpIHtcbiAgaWYgKHR5cGVvZiBzdHIgIT09ICdzdHJpbmcnKSB0aHJvdyBuZXcgRXJyb3IoJ0pTdHJpbmc6IGludmFsaWQgdmFsdWUnKTtcbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsICd2YWx1ZScsIHsgdmFsdWU6IHN0ciwgd3JpdGFibGU6IGZhbHNlIH0pO1xufVxuX2pzdHJpbmcucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShKVmFsdWUucHJvdG90eXBlKTtcbl9qc3RyaW5nLnByb3RvdHlwZS5pc0pTdHJpbmcgPSB0cnVlO1xuX2pzdHJpbmcucHJvdG90eXBlLnR5cGUgPSAnanN0cmluZyc7XG5fanN0cmluZy5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuICdKU3RyaW5nKCcgKyB0aGlzLnZhbHVlLnRvU3RyaW5nKCkgKyAnKSc7XG59O1xuXG5KVmFsdWUuSlN0cmluZyA9IEpTdHJpbmc7XG5KVmFsdWUucHJvdG90eXBlLkpTdHJpbmcgPSBKVmFsdWUuSlN0cmluZztcblxuZnVuY3Rpb24gSk51bWJlcihmbG9hdCkge1xuICByZXR1cm4gbmV3IF9qbnVtYmVyKGZsb2F0KTtcbn1cblxuZnVuY3Rpb24gX2pudW1iZXIoZmxvYXQpIHtcbiAgaWYgKHR5cGVvZiBmbG9hdCAhPT0gJ251bWJlcidcbiAgICAgICAgfHwgaXNOYU4oZmxvYXQpKSB0aHJvdyBuZXcgRXJyb3IoJ0pOdW1iZXI6IGludmFsaWQgdmFsdWUnKTtcbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsICd2YWx1ZScsIHsgdmFsdWU6IGZsb2F0LCB3cml0YWJsZTogZmFsc2UgfSk7XG59XG5fam51bWJlci5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKEpWYWx1ZS5wcm90b3R5cGUpO1xuX2pudW1iZXIucHJvdG90eXBlLmlzSk51bWJlciA9IHRydWU7XG5fam51bWJlci5wcm90b3R5cGUudHlwZSA9ICdqbnVtYmVyJztcbl9qbnVtYmVyLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gJ0pOdW1iZXIoJyArIHRoaXMudmFsdWUudG9TdHJpbmcoKSArICcpJztcbn07XG5cbkpWYWx1ZS5KTnVtYmVyID0gSk51bWJlcjtcbkpWYWx1ZS5wcm90b3R5cGUuSk51bWJlciA9IEpWYWx1ZS5KTnVtYmVyO1xuXG5mdW5jdGlvbiBKQm9vbChib29sKSB7XG4gIHJldHVybiBuZXcgX2pib29sKGJvb2wpO1xufVxuXG5mdW5jdGlvbiBfamJvb2woYm9vbCkge1xuICBpZiAodHlwZW9mIGJvb2wgIT09ICdib29sZWFuJykgdGhyb3cgbmV3IEVycm9yKCdKQm9vbDogaW52YWxpZCB2YWx1ZScpO1xuICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgJ3ZhbHVlJywgeyB2YWx1ZTogYm9vbCwgd3JpdGFibGU6IGZhbHNlIH0pO1xufVxuX2pib29sLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoSlZhbHVlLnByb3RvdHlwZSk7XG5famJvb2wucHJvdG90eXBlLmlzSkJvb2wgPSB0cnVlO1xuX2pib29sLnByb3RvdHlwZS50eXBlID0gJ2pib29sJztcbl9qYm9vbC5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuICdKQm9vbCgnICsgdGhpcy52YWx1ZS50b1N0cmluZygpICsgJyknO1xufTtcblxuSlZhbHVlLkpCb29sID0gSkJvb2w7XG5KVmFsdWUucHJvdG90eXBlLkpCb29sID0gSlZhbHVlLkpCb29sO1xuXG5mdW5jdGlvbiBKTnVsbChudWxsVmFsdWUpIHtcbiAgcmV0dXJuIG5ldyBfam51bGwobnVsbFZhbHVlKTtcbn1cblxuZnVuY3Rpb24gX2pudWxsKG51bGxWYWx1ZSkge1xuICBpZiAobnVsbFZhbHVlICE9PSBudWxsKSB0aHJvdyBuZXcgRXJyb3IoJ0pOdWxsOiBpbnZhbGlkIHZhbHVlJyk7XG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCAndmFsdWUnLCB7IHZhbHVlOiBudWxsVmFsdWUsIHdyaXRhYmxlOiBmYWxzZSB9KTtcbn1cbl9qbnVsbC5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKEpWYWx1ZS5wcm90b3R5cGUpO1xuX2pudWxsLnByb3RvdHlwZS5pc0pOdWxsID0gdHJ1ZTtcbl9qbnVsbC5wcm90b3R5cGUudHlwZSA9ICdqbnVsbCc7XG5fam51bGwucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiAnSk51bGwobnVsbCknO1xufTtcblxuSlZhbHVlLkpOdWxsID0gSk51bGw7XG5KVmFsdWUucHJvdG90eXBlLkpOdWxsID0gSlZhbHVlLkpOdWxsO1xuXG5mdW5jdGlvbiBKQXJyYXkoalZhbHVlcykge1xuICByZXR1cm4gbmV3IF9qYXJyYXkoalZhbHVlcyk7XG59XG5cbmZ1bmN0aW9uIF9qYXJyYXkoalZhbHVlcykge1xuICBpZiAodHlwZW9mIGpWYWx1ZXMgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsICd2YWx1ZScsIHsgdmFsdWU6IFtdLCB3cml0YWJsZTogZmFsc2UgfSk7XG4gIH0gZWxzZSB7XG4gICAgaWYgKGpWYWx1ZXMuc29tZShqdmFsID0+ICghanZhbC5pc0pWYWx1ZSkpKSB0aHJvdyBuZXcgRXJyb3IoJ0pBcnJheTogaW52YWxpZCBjb250ZW50Jyk7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsICd2YWx1ZScsIHsgdmFsdWU6IFsuLi5qVmFsdWVzXSwgd3JpdGFibGU6IGZhbHNlIH0pO1xuICB9XG59XG5famFycmF5LnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoSlZhbHVlLnByb3RvdHlwZSk7XG5famFycmF5LnByb3RvdHlwZS5pc0pBcnJheSA9IHRydWU7XG5famFycmF5LnByb3RvdHlwZS50eXBlID0gJ2phcnJheSc7XG5famFycmF5LnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gJ0pBcnJheShbJyArIHRoaXMudmFsdWUucmVkdWNlKChhY2MsIGN1cnIpID0+IGFjYyArIGN1cnIgKyAnLCcsICcnKSArICddKSc7XG59O1xuXG5KVmFsdWUuSkFycmF5ID0gSkFycmF5O1xuSlZhbHVlLnByb3RvdHlwZS5KQXJyYXkgPSBKVmFsdWUuSkFycmF5O1xuXG5mdW5jdGlvbiBKT2JqZWN0KGtleVZhbHVlUGFpcnMpIHsgLy8gW1BhaXIoa2V5MSx2YWx1ZTEpLFBhaXIoa2V5Mix2YWx1ZTIpXVxuICByZXR1cm4gbmV3IF9qb2JqZWN0KGtleVZhbHVlUGFpcnMpO1xufVxuXG5mdW5jdGlvbiBfam9iamVjdChrZXlWYWx1ZVBhaXJzKSB7XG4gIGlmIChrZXlWYWx1ZVBhaXJzLnNvbWUocGFpciA9PiB7XG4gICAgcmV0dXJuICghcGFpci5pc1BhaXJcbiAgICAgICAgICAgIHx8ICFwYWlyWzBdLmlzSlN0cmluZ1xuICAgICAgICAgICAgfHwgIXBhaXJbMV0uaXNKVmFsdWUpO1xuICB9KSkgdGhyb3cgbmV3IEVycm9yKCdKT2JqZWN0OiBpbnZhbGlkIGNvbnRlbnQnKTtcbiAgY29uc3QgZGljdCA9IGtleVZhbHVlUGFpcnMucmVkdWNlKChhY2MsIFtqc3RyaW5nLGp2YWx1ZV0pID0+IHtcbiAgICBhY2NbanN0cmluZy52YWx1ZV0gPSBqdmFsdWU7XG4gICAgcmV0dXJuIGFjYztcbiAgfSwge30pO1xuICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgJ3ZhbHVlJywgeyB2YWx1ZTogZGljdCwgd3JpdGFibGU6IGZhbHNlIH0pO1xufVxuX2pvYmplY3QucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShKVmFsdWUucHJvdG90eXBlKTtcbl9qb2JqZWN0LnByb3RvdHlwZS5pc0pPYmplY3QgPSB0cnVlO1xuX2pvYmplY3QucHJvdG90eXBlLnR5cGUgPSAnam9iamVjdCc7XG5fam9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbigpIHtcbiAgY29uc3QgT0JKID0gJyc7XG4gIHJldHVybiAnSk9iamVjdCh7JyArIE9CSiArICd9KSc7XG59O1xuXG5KVmFsdWUuSk9iamVjdCA9IEpPYmplY3Q7XG5KVmFsdWUucHJvdG90eXBlLkpPYmplY3QgPSBKVmFsdWUuSk9iamVjdDtcbiJdfQ==