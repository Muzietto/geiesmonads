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

  function JArray() {
    for (var _len = arguments.length, jValues = Array(_len), _key = 0; _key < _len; _key++) {
      jValues[_key] = arguments[_key];
    }

    return new (Function.prototype.bind.apply(_jarray, [null].concat(jValues)))();
  }

  // TODO make it with iterator and everything
  function _jarray() {
    // args become a REAL array
    if (typeof jValue === 'undefined') {
      // empty JSON array
      Object.defineProperty(this, 'value', { value: [], writable: false });
    } else {
      for (var _len2 = arguments.length, jValues = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        jValues[_key2] = arguments[_key2];
      }

      if (jValues.some(function (jval) {
        return !jval.isJValue;
      })) throw new Error('JArray: invalid content');
      Object.defineProperty(this, 'value', { value: [].concat(jValues), writable: false });
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

  function JObject() {
    for (var _len3 = arguments.length, pairs = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
      pairs[_key3] = arguments[_key3];
    }

    return new (Function.prototype.bind.apply(_jobject, [null].concat(pairs)))();
  }

  function _jobject() {
    var self = this;

    for (var _len4 = arguments.length, pairs = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
      pairs[_key4] = arguments[_key4];
    }

    if (pairs.some(function (pair) {
      return !pair.isPair || typeof pair[0] !== 'string' || !pair[1].isJValue;
    })) throw new Error('JObject: invalid content');
    pairs.forEach(function (_ref) {
      var _ref2 = _slicedToArray(_ref, 2),
          key = _ref2[0],
          value = _ref2[1];

      Object.defineProperty(self, key, { value: value, writable: false });
    });
  }
  _jobject.prototype = Object.create(JValue.prototype);
  _jobject.prototype.isJObject = true;
  _jobject.prototype.type = 'jobject';
  _jobject.prototype.toString = function () {
    // eslint-disable-next-line no-undef
    return 'JObject({' + OBJ + '})'; // TODO - complete me!
  };

  JValue.JObject = JObject;
  JValue.prototype.JObject = JValue.JObject;
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2pzL2NsYXNzZXMuanMiXSwibmFtZXMiOlsiVHVwbGUiLCJQb3NpdGlvbiIsInBhaXIiLCJzdWNjZXNzIiwiZmFpbHVyZSIsInNvbWUiLCJub25lIiwiSlZhbHVlIiwidG9TdHJpbmciLCJBcnJheSIsInByb3RvdHlwZSIsImFwcGx5IiwiUGFpciIsImEiLCJiIiwicmVzdWx0IiwiX3BhaXIiLCJTeW1ib2wiLCJpdGVyYXRvciIsIk9iamVjdCIsImNyZWF0ZSIsImRlZmluZVByb3BlcnR5IiwidmFsdWUiLCJ3cml0YWJsZSIsImlzUGFpciIsInR5cGUiLCJUcmlwbGUiLCJjIiwiX3RyaXBsZSIsImlzVHJpcGxlIiwicm93cyIsInJvdyIsImNvbCIsIl9wb3NpdGlvbiIsImZyb21UZXh0IiwidGV4dCIsInNwbGl0IiwibWFwIiwiaXNQb3NpdGlvbiIsImNoYXIiLCJNYXliZSIsIk5vdGhpbmciLCJuZXdSZXN1bHRWYWx1ZSIsIkp1c3QiLCJlcnIiLCJpbmNyUG9zIiwidGltZXMiLCJsYXN0Um93SW5kZXgiLCJsZW5ndGgiLCJsYXN0Q29sdW1uSW5kZXgiLCJuZWVkc1Jvd0luY3JlbWVudCIsImluY3JQb3NIZWxwZXIiLCJwb3MiLCJkZWNyUG9zIiwibmVlZHNSb3dEZWNyZW1lbnQiLCJkZWNyUG9zSGVscGVyIiwicmVzdCIsInNlbGYiLCJyZXN0X2hlbHBlciIsImpvaW4iLCJuZXh0IiwiaXNOb3RoaW5nIiwiY29uY2F0IiwieCIsInkiLCJtYXRjaGVkIiwic3RyIiwicGFyc2VyTGFiZWwiLCJlcnJvck1zZyIsInZhbCIsImlzSlZhbHVlIiwiSlN0cmluZyIsIl9qc3RyaW5nIiwiRXJyb3IiLCJpc0pTdHJpbmciLCJKTnVtYmVyIiwiZmxvYXQiLCJfam51bWJlciIsImlzTmFOIiwiaXNKTnVtYmVyIiwiSkJvb2wiLCJib29sIiwiX2pib29sIiwiaXNKQm9vbCIsIkpOdWxsIiwibnVsbFZhbHVlIiwiX2pudWxsIiwiaXNKTnVsbCIsIkpBcnJheSIsImpWYWx1ZXMiLCJfamFycmF5IiwialZhbHVlIiwianZhbCIsImlzSkFycmF5IiwicmVkdWNlIiwiYWNjIiwiY3VyciIsIkpPYmplY3QiLCJwYWlycyIsIl9qb2JqZWN0IiwiZm9yRWFjaCIsImtleSIsImlzSk9iamVjdCIsIk9CSiJdLCJtYXBwaW5ncyI6Ijs7Ozs7O1VBYWdCQSxLLEdBQUFBLEs7VUFtREFDLFEsR0FBQUEsUTtVQXdGQUMsSSxHQUFBQSxJO1VBYUFDLE8sR0FBQUEsTztVQU1BQyxPLEdBQUFBLE87VUFNQUMsSSxHQUFBQSxJO1VBWUFDLEksR0FBQUEsSTtVQVlBQyxNLEdBQUFBLE07Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7TUFuTVJDLFEsR0FBYUMsTUFBTUMsUyxDQUFuQkYsUTs7O0FBRVJDLFFBQU1DLFNBQU4sQ0FBZ0JGLFFBQWhCLEdBQTJCLFlBQVc7QUFDcEMsV0FBTyxNQUFNQSxTQUFTRyxLQUFULENBQWUsSUFBZixDQUFOLEdBQTZCLEdBQXBDO0FBQ0QsR0FGRDs7QUFJQTtBQUNPLFdBQVNYLEtBQVQsR0FBaUIsQ0FDdkI7O0FBRUQsV0FBU1ksSUFBVCxDQUFjQyxDQUFkLEVBQWlCQyxDQUFqQixFQUFvQjtBQUNsQixRQUFNQyxTQUFTLElBQUlDLEtBQUosQ0FBVUgsQ0FBVixFQUFhQyxDQUFiLENBQWY7QUFDQUMsV0FBT0UsT0FBT0MsUUFBZCw0QkFBMEI7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEscUJBQ2xCTCxDQURrQjs7QUFBQTtBQUFBO0FBQUEscUJBRWxCQyxDQUZrQjs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxLQUExQjtBQUlBLFdBQU9DLE1BQVA7QUFDRDtBQUNESCxPQUFLRixTQUFMLEdBQWlCUyxPQUFPQyxNQUFQLENBQWNwQixNQUFNVSxTQUFwQixDQUFqQjs7QUFFQSxXQUFTTSxLQUFULENBQWVILENBQWYsRUFBa0JDLENBQWxCLEVBQXFCO0FBQ25CSyxXQUFPRSxjQUFQLENBQXNCLElBQXRCLEVB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QUFEMEIsdUNBQVB5QyxLQUFPO0FBQVBBLFdBQU87QUFBQTs7QUFFMUIsUUFBSUEsTUFBTTdGLElBQU4sQ0FBVyxnQkFBUTtBQUNyQixhQUFRLENBQUNILEtBQUtzQixNQUFOLElBQ0csT0FBT3RCLEtBQUssQ0FBTCxDQUFQLEtBQW1CLFFBRHRCLElBRUcsQ0FBQ0EsS0FBSyxDQUFMLEVBQVFvRSxRQUZwQjtBQUdELEtBSkcsQ0FBSixFQUlJLE1BQU0sSUFBSUcsS0FBSixDQUFVLDBCQUFWLENBQU47QUFDSnlCLFVBQU1FLE9BQU4sQ0FBYyxnQkFBa0I7QUFBQTtBQUFBLFVBQWhCQyxHQUFnQjtBQUFBLFVBQVgvRSxLQUFXOztBQUM5QkgsYUFBT0UsY0FBUCxDQUFzQm9DLElBQXRCLEVBQTRCNEMsR0FBNUIsRUFBaUMsRUFBRS9FLFlBQUYsRUFBU0MsVUFBVSxLQUFuQixFQUFqQztBQUNELEtBRkQ7QUFHRDtBQUNENEUsV0FBU3pGLFNBQVQsR0FBcUJTLE9BQU9DLE1BQVAsQ0FBY2IsT0FBT0csU0FBckIsQ0FBckI7QUFDQXlGLFdBQVN6RixTQUFULENBQW1CNEYsU0FBbkIsR0FBK0IsSUFBL0I7QUFDQUgsV0FBU3pGLFNBQVQsQ0FBbUJlLElBQW5CLEdBQTBCLFNBQTFCO0FBQ0EwRSxXQUFTekYsU0FBVCxDQUFtQkYsUUFBbkIsR0FBOEIsWUFBVztBQUN2QztBQUNBLFdBQU8sY0FBYytGLEdBQWQsR0FBb0IsSUFBM0IsQ0FGdUMsQ0FFTjtBQUNsQyxHQUhEOztBQUtBaEcsU0FBTzBGLE9BQVAsR0FBaUJBLE9BQWpCO0FBQ0ExRixTQUFPRyxTQUFQLENBQWlCdUYsT0FBakIsR0FBMkIxRixPQUFPMEYsT0FBbEMiLCJmaWxlIjoiY2xhc3Nlcy5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IE1heWJlIH0gZnJvbSAnbWF5YmUnO1xyXG5cclxuaW1wb3J0IHtcclxuICBpc1BhaXIsXHJcbn0gZnJvbSAndXRpbCc7XHJcblxyXG5jb25zdCB7IHRvU3RyaW5nIH0gPSBBcnJheS5wcm90b3R5cGU7XHJcblxyXG5BcnJheS5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbigpIHtcclxuICByZXR1cm4gJ1snICsgdG9TdHJpbmcuYXBwbHkodGhpcykgKyAnXSc7XHJcbn07XHJcblxyXG4vLyAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cclxuZXhwb3J0IGZ1bmN0aW9uIFR1cGxlKCkge1xyXG59XHJcblxyXG5mdW5jdGlvbiBQYWlyKGEsIGIpIHtcclxuICBjb25zdCByZXN1bHQgPSBuZXcgX3BhaXIoYSwgYik7XHJcbiAgcmVzdWx0W1N5bWJvbC5pdGVyYXRvcl0gPSBmdW5jdGlvbiooKSB7XHJcbiAgICB5aWVsZCBhO1xyXG4gICAgeWllbGQgYjtcclxuICB9O1xyXG4gIHJldHVybiByZXN1bHQ7XHJcbn1cclxuUGFpci5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFR1cGxlLnByb3RvdHlwZSk7XHJcblxyXG5mdW5jdGlvbiBfcGFpcihhLCBiKSB7XHJcbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsIDAsIHsgdmFsdWU6IGEsIHdyaXRhYmxlOiBmYWxzZSB9KTtcclxuICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgMSwgeyB2YWx1ZTogYiwgd3JpdGFibGU6IGZhbHNlIH0pO1xyXG59XHJcbl9wYWlyLnByb3RvdHlwZS5pc1BhaXIgPSB0cnVlO1xyXG5fcGFpci5wcm90b3R5cGUudHlwZSA9ICdwYWlyJztcclxuX3BhaXIucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24oKSB7XHJcbiAgcmV0dXJuICdbJyArIHRoaXNbMF0udG9TdHJpbmcoKSArICcsJyArIHRoaXNbMV0udG9TdHJpbmcoKSArICddJztcclxufTtcclxuXHJcbmZ1bmN0aW9uIFRyaXBsZShhLCBiLCBjKSB7XHJcbiAgY29uc3QgcmVzdWx0ID0gbmV3IF90cmlwbGUoYSwgYiwgYyk7XHJcbiAgcmVzdWx0W1N5bWJvbC5pdGVyYXRvcl0gPSBmdW5jdGlvbiooKSB7XHJcbiAgICB5aWVsZCBhO1xyXG4gICAgeWllbGQgYjtcclxuICAgIHlpZWxkIGM7XHJcbiAgfTtcclxuICByZXR1cm4gcmVzdWx0O1xyXG59XHJcblRyaXBsZS5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFR1cGxlLnByb3RvdHlwZSk7XHJcblxyXG5mdW5jdGlvbiBfdHJpcGxlKGEsIGIsIGMpIHtcclxuICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgMCwgeyB2YWx1ZTogYSwgd3JpdGFibGU6IGZhbHNlIH0pO1xyXG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCAxLCB7IHZhbHVlOiBiLCB3cml0YWJsZTogZmFsc2UgfSk7XHJcbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsIDIsIHsgdmFsdWU6IGMsIHdyaXRhYmxlOiBmYWxzZSB9KTtcclxufVxyXG5fdHJpcGxlLnByb3RvdHlwZS5pc1RyaXBsZSA9IHRydWU7XHJcbl90cmlwbGUucHJvdG90eXBlLnR5cGUgPSAndHJpcGxlJztcclxuX3RyaXBsZS5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbigpIHtcclxuICByZXR1cm4gJ1snICsgdGhpc1swXS50b1N0cmluZygpICsgJywnICsgdGhpc1sxXS50b1N0cmluZygpICsgJywnICsgdGhpc1syXS50b1N0cmluZygpICsgJ10nO1xyXG59O1xyXG5cclxuVHVwbGUuUGFpciA9IFBhaXI7XHJcblR1cGxlLnByb3RvdHlwZS5QYWlyID0gUGFpcjtcclxuXHJcblR1cGxlLlRyaXBsZSA9IFRyaXBsZTtcclxuVHVwbGUucHJvdG90eXBlLlRyaXBsZSA9IFRyaXBsZTtcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBQb3NpdGlvbihyb3dzID0gW10sIHJvdyA9IDAsIGNvbCA9IDApIHtcclxuICByZXR1cm4gbmV3IF9wb3NpdGlvbihyb3dzLCByb3csIGNvbCk7XHJcbn1cclxuXHJcbi8vIFBvc2l0aW9uLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoe30pO1xyXG5Qb3NpdGlvbi5mcm9tVGV4dCA9IGZ1bmN0aW9uKHRleHQpIHtcclxuICBjb25zdCByb3dzID0gdGV4dC5zcGxpdCgnXFxuJylcclxuICAgIC5tYXAocm93ID0+IHJvdy5zcGxpdCgnJykpO1xyXG4gIHJldHVybiBuZXcgX3Bvc2l0aW9uKHJvd3MsIDAsIDApO1xyXG59O1xyXG5cclxuZnVuY3Rpb24gX3Bvc2l0aW9uKHJvd3MsIHJvdywgY29sKSB7XHJcbiAgdGhpcy5yb3dzID0gcm93cztcclxuICB0aGlzLnJvdyA9IHJvdztcclxuICB0aGlzLmNvbCA9IGNvbDtcclxufVxyXG5cclxuX3Bvc2l0aW9uLnByb3RvdHlwZS5pc1Bvc2l0aW9uID0gdHJ1ZTtcclxuX3Bvc2l0aW9uLnByb3RvdHlwZS5jaGFyID0gZnVuY3Rpb24oKSB7XHJcbiAgbGV0IHJlc3VsdCA9IE1heWJlLk5vdGhpbmcoKTtcclxuICB0cnkge1xyXG4gICAgY29uc3QgbmV3UmVzdWx0VmFsdWUgPSB0aGlzLnJvd3NbdGhpcy5yb3ddW3RoaXMuY29sXTtcclxuICAgIGlmICh0eXBlb2YgbmV3UmVzdWx0VmFsdWUgIT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgIHJlc3VsdCA9IE1heWJlLkp1c3QobmV3UmVzdWx0VmFsdWUpO1xyXG4gICAgfVxyXG4gIH0gY2F0Y2ggKGVycikge1xyXG4gIH1cclxuICByZXR1cm4gcmVzdWx0O1xyXG59O1xyXG5fcG9zaXRpb24ucHJvdG90eXBlLmluY3JQb3MgPSBmdW5jdGlvbih0aW1lcyA9IDApIHtcclxuICBjb25zdCBsYXN0Um93SW5kZXggPSB0aGlzLnJvd3MubGVuZ3RoIC0gMTtcclxuICBjb25zdCBsYXN0Q29sdW1uSW5kZXggPSB0aGlzLnJvd3NbbGFzdFJvd0luZGV4XS5sZW5ndGggLSAxO1xyXG4gIGxldCByZXN1bHQgPSBQb3NpdGlvbih0aGlzLnJvd3MsIGxhc3RSb3dJbmRleCwgbGFzdENvbHVtbkluZGV4ICsgMSk7XHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IG5lZWRzUm93SW5jcmVtZW50ID0gKHRoaXMuY29sID09PSB0aGlzLnJvd3NbdGhpcy5yb3ddLmxlbmd0aCAtIDEpO1xyXG4gICAgcmVzdWx0ID0gKHRpbWVzICogMSlcclxuICAgICAgPyBpbmNyUG9zSGVscGVyKHRoaXMsIHRpbWVzKVxyXG4gICAgICA6IFBvc2l0aW9uKFxyXG4gICAgICAgIHRoaXMucm93cyxcclxuICAgICAgICAobmVlZHNSb3dJbmNyZW1lbnQgPyB0aGlzLnJvdyArIDEgOiB0aGlzLnJvdyksXHJcbiAgICAgICAgKG5lZWRzUm93SW5jcmVtZW50ID8gMCA6IHRoaXMuY29sICsgMSksXHJcbiAgICAgICk7XHJcbiAgICByZXR1cm4gcmVzdWx0O1xyXG4gIH0gY2F0Y2ggKGVycikge31cclxuICByZXR1cm4gcmVzdWx0O1xyXG5cclxuICBmdW5jdGlvbiBpbmNyUG9zSGVscGVyKHBvcywgdGltZXMgPSAwKSB7XHJcbiAgICBpZiAodGltZXMgPT09IDApIHJldHVybiBwb3M7XHJcbiAgICByZXR1cm4gaW5jclBvc0hlbHBlcihwb3MuaW5jclBvcygpLCB0aW1lcyAtIDEpO1xyXG4gIH1cclxufTtcclxuX3Bvc2l0aW9uLnByb3RvdHlwZS5kZWNyUG9zID0gZnVuY3Rpb24odGltZXMgPSAwKSB7XHJcbiAgbGV0IHJlc3VsdCA9IFBvc2l0aW9uKHRoaXMucm93cywgLTEsIC0xKTtcclxuICB0cnkge1xyXG4gICAgY29uc3QgbmVlZHNSb3dEZWNyZW1lbnQgPSAodGhpcy5jb2wgPT09IDApO1xyXG4gICAgcmVzdWx0ID0gdGltZXNcclxuICAgICAgPyBkZWNyUG9zSGVscGVyKHRoaXMsIHRpbWVzKVxyXG4gICAgICA6IFBvc2l0aW9uKFxyXG4gICAgICAgIHRoaXMucm93cyxcclxuICAgICAgICAobmVlZHNSb3dEZWNyZW1lbnQgPyB0aGlzLnJvdyAtIDEgOiB0aGlzLnJvdyksXHJcbiAgICAgICAgKG5lZWRzUm93RGVjcmVtZW50ID8gdGhpcy5yb3dzW3RoaXMucm93IC0gMV0ubGVuZ3RoIC0gMSA6IHRoaXMuY29sIC0gMSksXHJcbiAgICAgICk7XHJcbiAgICByZXR1cm4gcmVzdWx0O1xyXG4gIH0gY2F0Y2ggKGVycikge31cclxuICByZXR1cm4gcmVzdWx0O1xyXG5cclxuICBmdW5jdGlvbiBkZWNyUG9zSGVscGVyKHBvcywgdGltZXMgPSAwKSB7XHJcbiAgICBpZiAodGltZXMgPT09IDApIHJldHVybiBwb3M7XHJcbiAgICByZXR1cm4gZGVjclBvc0hlbHBlcihwb3MuZGVjclBvcygpLCB0aW1lcyAtIDEpO1xyXG4gIH1cclxufTtcclxuX3Bvc2l0aW9uLnByb3RvdHlwZS5yZXN0ID0gZnVuY3Rpb24oKSB7XHJcbiAgY29uc3Qgc2VsZiA9IHRoaXM7XHJcbiAgcmV0dXJuIHJlc3RfaGVscGVyKCkuam9pbignJyk7XHJcbiAgZnVuY3Rpb24gcmVzdF9oZWxwZXIoKSB7XHJcbiAgICBjb25zdCBuZXh0ID0gc2VsZi5jaGFyKCk7XHJcbiAgICBpZiAobmV4dC5pc05vdGhpbmcpIHJldHVybiBbXTtcclxuICAgIHJldHVybiBbbmV4dC52YWx1ZV0uY29uY2F0KHNlbGYuaW5jclBvcygpLnJlc3QoKSk7XHJcbiAgfVxyXG59O1xyXG5fcG9zaXRpb24ucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24oKSB7XHJcbiAgcmV0dXJuICdyb3c9JyArIHRoaXMucm93XHJcbiAgICAgICAgKyAnO2NvbD0nICsgdGhpcy5jb2xcclxuICAgICAgICArICc7cmVzdD0nICsgdGhpcy5yZXN0KCk7XHJcbn07XHJcblxyXG4vLyAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xyXG4vLyBkZXByZWNhdGVkIGluIGZhdm91ciBvZiBUdXBsZSwgZGF0YS5NYXliZSBhbmQgZGF0YS5WYWxpZGF0aW9uXHJcbmV4cG9ydCBmdW5jdGlvbiBwYWlyKHgsIHkpIHtcclxuICBjb25zdCByZXN1bHQgPSBbeCwgeV07XHJcbiAgcmVzdWx0LnR5cGUgPSAncGFpcic7XHJcbiAgcmVzdWx0LnRvU3RyaW5nID0gKCkgPT4ge1xyXG4gICAgcmV0dXJuICdbJ1xyXG4gICAgICAgICAgICArIChpc1BhaXIocmVzdWx0WzBdKSA/IHJlc3VsdFswXS50b1N0cmluZygpIDogcmVzdWx0WzBdKVxyXG4gICAgICAgICAgICArICcsJ1xyXG4gICAgICAgICAgICArIChpc1BhaXIocmVzdWx0WzFdKSA/IHJlc3VsdFsxXS50b1N0cmluZygpIDogcmVzdWx0WzFdKVxyXG4gICAgICAgICAgICArICddJztcclxuICB9O1xyXG4gIHJldHVybiByZXN1bHQ7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBzdWNjZXNzKG1hdGNoZWQsIHN0cikge1xyXG4gIGNvbnN0IHJlc3VsdCA9IHBhaXIobWF0Y2hlZCwgc3RyKTtcclxuICByZXN1bHQudHlwZSA9ICdzdWNjZXNzJztcclxuICByZXR1cm4gcmVzdWx0O1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZmFpbHVyZShwYXJzZXJMYWJlbCwgZXJyb3JNc2cpIHtcclxuICBjb25zdCByZXN1bHQgPSBwYWlyKHBhcnNlckxhYmVsLCBlcnJvck1zZyk7XHJcbiAgcmVzdWx0LnR5cGUgPSAnZmFpbHVyZSc7XHJcbiAgcmV0dXJuIHJlc3VsdDtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHNvbWUodmFsdWUpIHtcclxuICByZXR1cm4ge1xyXG4gICAgdHlwZTogJ3NvbWUnLFxyXG4gICAgdmFsKCkge1xyXG4gICAgICByZXR1cm4gdmFsdWU7XHJcbiAgICB9LFxyXG4gICAgdG9TdHJpbmcoKSB7XHJcbiAgICAgIHJldHVybiBgc29tZSgke3ZhbHVlfSlgO1xyXG4gICAgfSxcclxuICB9O1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gbm9uZSgpIHtcclxuICByZXR1cm4ge1xyXG4gICAgdHlwZTogJ25vbmUnLFxyXG4gICAgdmFsKCkge1xyXG4gICAgICByZXR1cm4gbnVsbDtcclxuICAgIH0sXHJcbiAgICB0b1N0cmluZygpIHtcclxuICAgICAgcmV0dXJuICdub25lKCknO1xyXG4gICAgfSxcclxuICB9O1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gSlZhbHVlKCkge1xyXG59XHJcbkpWYWx1ZS5wcm90b3R5cGUuaXNKVmFsdWUgPSB0cnVlO1xyXG5cclxuZnVuY3Rpb24gSlN0cmluZyhzdHIpIHtcclxuICByZXR1cm4gbmV3IF9qc3RyaW5nKHN0cik7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIF9qc3RyaW5nKHN0cikge1xyXG4gIGlmICh0eXBlb2Ygc3RyICE9PSAnc3RyaW5nJykgdGhyb3cgbmV3IEVycm9yKCdKU3RyaW5nOiBpbnZhbGlkIHZhbHVlJyk7XHJcbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsICd2YWx1ZScsIHsgdmFsdWU6IHN0ciwgd3JpdGFibGU6IGZhbHNlIH0pO1xyXG59XHJcbl9qc3RyaW5nLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoSlZhbHVlLnByb3RvdHlwZSk7XHJcbl9qc3RyaW5nLnByb3RvdHlwZS5pc0pTdHJpbmcgPSB0cnVlO1xyXG5fanN0cmluZy5wcm90b3R5cGUudHlwZSA9ICdqc3RyaW5nJztcclxuX2pzdHJpbmcucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24oKSB7XHJcbiAgcmV0dXJuICdKU3RyaW5nKCcgKyB0aGlzLnZhbHVlLnRvU3RyaW5nKCkgKyAnKSc7XHJcbn07XHJcblxyXG5KVmFsdWUuSlN0cmluZyA9IEpTdHJpbmc7XHJcbkpWYWx1ZS5wcm90b3R5cGUuSlN0cmluZyA9IEpWYWx1ZS5KU3RyaW5nO1xyXG5cclxuZnVuY3Rpb24gSk51bWJlcihmbG9hdCkge1xyXG4gIHJldHVybiBuZXcgX2pudW1iZXIoZmxvYXQpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBfam51bWJlcihmbG9hdCkge1xyXG4gIGlmICh0eXBlb2YgZmxvYXQgIT09ICdudW1iZXInXHJcbiAgICAgICAgfHwgaXNOYU4oZmxvYXQpKSB0aHJvdyBuZXcgRXJyb3IoJ0pOdW1iZXI6IGludmFsaWQgdmFsdWUnKTtcclxuICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgJ3ZhbHVlJywgeyB2YWx1ZTogZmxvYXQsIHdyaXRhYmxlOiBmYWxzZSB9KTtcclxufVxyXG5fam51bWJlci5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKEpWYWx1ZS5wcm90b3R5cGUpO1xyXG5fam51bWJlci5wcm90b3R5cGUuaXNKTnVtYmVyID0gdHJ1ZTtcclxuX2pudW1iZXIucHJvdG90eXBlLnR5cGUgPSAnam51bWJlcic7XHJcbl9qbnVtYmVyLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uKCkge1xyXG4gIHJldHVybiAnSk51bWJlcignICsgdGhpcy52YWx1ZS50b1N0cmluZygpICsgJyknO1xyXG59O1xyXG5cclxuSlZhbHVlLkpOdW1iZXIgPSBKTnVtYmVyO1xyXG5KVmFsdWUucHJvdG90eXBlLkpOdW1iZXIgPSBKVmFsdWUuSk51bWJlcjtcclxuXHJcbmZ1bmN0aW9uIEpCb29sKGJvb2wpIHtcclxuICByZXR1cm4gbmV3IF9qYm9vbChib29sKTtcclxufVxyXG5cclxuZnVuY3Rpb24gX2pib29sKGJvb2wpIHtcclxuICBpZiAodHlwZW9mIGJvb2wgIT09ICdib29sZWFuJykgdGhyb3cgbmV3IEVycm9yKCdKQm9vbDogaW52YWxpZCB2YWx1ZScpO1xyXG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCAndmFsdWUnLCB7IHZhbHVlOiBib29sLCB3cml0YWJsZTogZmFsc2UgfSk7XHJcbn1cclxuX2pib29sLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoSlZhbHVlLnByb3RvdHlwZSk7XHJcbl9qYm9vbC5wcm90b3R5cGUuaXNKQm9vbCA9IHRydWU7XHJcbl9qYm9vbC5wcm90b3R5cGUudHlwZSA9ICdqYm9vbCc7XHJcbl9qYm9vbC5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbigpIHtcclxuICByZXR1cm4gJ0pCb29sKCcgKyB0aGlzLnZhbHVlLnRvU3RyaW5nKCkgKyAnKSc7XHJcbn07XHJcblxyXG5KVmFsdWUuSkJvb2wgPSBKQm9vbDtcclxuSlZhbHVlLnByb3RvdHlwZS5KQm9vbCA9IEpWYWx1ZS5KQm9vbDtcclxuXHJcbmZ1bmN0aW9uIEpOdWxsKG51bGxWYWx1ZSkge1xyXG4gIHJldHVybiBuZXcgX2pudWxsKG51bGxWYWx1ZSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIF9qbnVsbChudWxsVmFsdWUpIHtcclxuICBpZiAobnVsbFZhbHVlICE9PSBudWxsKSB0aHJvdyBuZXcgRXJyb3IoJ0pOdWxsOiBpbnZhbGlkIHZhbHVlJyk7XHJcbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsICd2YWx1ZScsIHsgdmFsdWU6IG51bGxWYWx1ZSwgd3JpdGFibGU6IGZhbHNlIH0pO1xyXG59XHJcbl9qbnVsbC5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKEpWYWx1ZS5wcm90b3R5cGUpO1xyXG5fam51bGwucHJvdG90eXBlLmlzSk51bGwgPSB0cnVlO1xyXG5fam51bGwucHJvdG90eXBlLnR5cGUgPSAnam51bGwnO1xyXG5fam51bGwucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24oKSB7XHJcbiAgcmV0dXJuICdKTnVsbChudWxsKSc7XHJcbn07XHJcblxyXG5KVmFsdWUuSk51bGwgPSBKTnVsbDtcclxuSlZhbHVlLnByb3RvdHlwZS5KTnVsbCA9IEpWYWx1ZS5KTnVsbDtcclxuXHJcbmZ1bmN0aW9uIEpBcnJheSguLi5qVmFsdWVzKSB7XHJcbiAgcmV0dXJuIG5ldyBfamFycmF5KC4uLmpWYWx1ZXMpO1xyXG59XHJcblxyXG4vLyBUT0RPIG1ha2UgaXQgd2l0aCBpdGVyYXRvciBhbmQgZXZlcnl0aGluZ1xyXG5mdW5jdGlvbiBfamFycmF5KC4uLmpWYWx1ZXMpIHsgLy8gYXJncyBiZWNvbWUgYSBSRUFMIGFycmF5XHJcbiAgaWYgKHR5cGVvZiBqVmFsdWUgPT09ICd1bmRlZmluZWQnKSB7IC8vIGVtcHR5IEpTT04gYXJyYXlcclxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCAndmFsdWUnLCB7IHZhbHVlOiBbXSwgd3JpdGFibGU6IGZhbHNlIH0pO1xyXG4gIH0gZWxzZSB7XHJcbiAgICBpZiAoalZhbHVlcy5zb21lKGp2YWwgPT4gKCFqdmFsLmlzSlZhbHVlKSkpIHRocm93IG5ldyBFcnJvcignSkFycmF5OiBpbnZhbGlkIGNvbnRlbnQnKTtcclxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCAndmFsdWUnLCB7IHZhbHVlOiBbLi4ualZhbHVlc10sIHdyaXRhYmxlOiBmYWxzZSB9KTtcclxuICB9XHJcbn1cclxuX2phcnJheS5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKEpWYWx1ZS5wcm90b3R5cGUpO1xyXG5famFycmF5LnByb3RvdHlwZS5pc0pBcnJheSA9IHRydWU7XHJcbl9qYXJyYXkucHJvdG90eXBlLnR5cGUgPSAnamFycmF5JztcclxuX2phcnJheS5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbigpIHtcclxuICByZXR1cm4gJ0pBcnJheShbJyArIHRoaXMudmFsdWUucmVkdWNlKChhY2MsIGN1cnIpID0+IGFjYyArIGN1cnIgKyAnLCcsICcnKSArICddKSc7XHJcbn07XHJcblxyXG5KVmFsdWUuSkFycmF5ID0gSkFycmF5O1xyXG5KVmFsdWUucHJvdG90eXBlLkpBcnJheSA9IEpWYWx1ZS5KQXJyYXk7XHJcblxyXG5mdW5jdGlvbiBKT2JqZWN0KC4uLnBhaXJzKSB7XHJcbiAgcmV0dXJuIG5ldyBfam9iamVjdCguLi5wYWlycyk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIF9qb2JqZWN0KC4uLnBhaXJzKSB7XHJcbiAgY29uc3Qgc2VsZiA9IHRoaXM7XHJcbiAgaWYgKHBhaXJzLnNvbWUocGFpciA9PiB7XHJcbiAgICByZXR1cm4gKCFwYWlyLmlzUGFpclxyXG4gICAgICAgICAgICB8fCB0eXBlb2YgcGFpclswXSAhPT0gJ3N0cmluZydcclxuICAgICAgICAgICAgfHwgIXBhaXJbMV0uaXNKVmFsdWUpO1xyXG4gIH0pKSB0aHJvdyBuZXcgRXJyb3IoJ0pPYmplY3Q6IGludmFsaWQgY29udGVudCcpO1xyXG4gIHBhaXJzLmZvckVhY2goKFtrZXksIHZhbHVlXSkgPT4ge1xyXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHNlbGYsIGtleSwgeyB2YWx1ZSwgd3JpdGFibGU6IGZhbHNlIH0pO1xyXG4gIH0pO1xyXG59XHJcbl9qb2JqZWN0LnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoSlZhbHVlLnByb3RvdHlwZSk7XHJcbl9qb2JqZWN0LnByb3RvdHlwZS5pc0pPYmplY3QgPSB0cnVlO1xyXG5fam9iamVjdC5wcm90b3R5cGUudHlwZSA9ICdqb2JqZWN0JztcclxuX2pvYmplY3QucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24oKSB7XHJcbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXVuZGVmXHJcbiAgcmV0dXJuICdKT2JqZWN0KHsnICsgT0JKICsgJ30pJzsgLy8gVE9ETyAtIGNvbXBsZXRlIG1lIVxyXG59O1xyXG5cclxuSlZhbHVlLkpPYmplY3QgPSBKT2JqZWN0O1xyXG5KVmFsdWUucHJvdG90eXBlLkpPYmplY3QgPSBKVmFsdWUuSk9iamVjdDtcclxuIl19