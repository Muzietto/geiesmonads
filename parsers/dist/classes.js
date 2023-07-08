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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2pzL2NsYXNzZXMuanMiXSwibmFtZXMiOlsiVHVwbGUiLCJQb3NpdGlvbiIsInBhaXIiLCJzdWNjZXNzIiwiZmFpbHVyZSIsInNvbWUiLCJub25lIiwiSlZhbHVlIiwidG9TdHJpbmciLCJBcnJheSIsInByb3RvdHlwZSIsImFwcGx5IiwiUGFpciIsImEiLCJiIiwicmVzdWx0IiwiX3BhaXIiLCJTeW1ib2wiLCJpdGVyYXRvciIsIk9iamVjdCIsImNyZWF0ZSIsImRlZmluZVByb3BlcnR5IiwidmFsdWUiLCJ3cml0YWJsZSIsImlzUGFpciIsInR5cGUiLCJUcmlwbGUiLCJjIiwiX3RyaXBsZSIsImlzVHJpcGxlIiwicm93cyIsInJvdyIsImNvbCIsIl9wb3NpdGlvbiIsImZyb21UZXh0IiwidGV4dCIsInNwbGl0IiwibWFwIiwiaXNQb3NpdGlvbiIsImNoYXIiLCJNYXliZSIsIk5vdGhpbmciLCJuZXdSZXN1bHRWYWx1ZSIsIkp1c3QiLCJlcnIiLCJpbmNyUG9zIiwidGltZXMiLCJsYXN0Um93SW5kZXgiLCJsZW5ndGgiLCJsYXN0Q29sdW1uSW5kZXgiLCJuZWVkc1Jvd0luY3JlbWVudCIsImluY3JQb3NIZWxwZXIiLCJwb3MiLCJkZWNyUG9zIiwibmVlZHNSb3dEZWNyZW1lbnQiLCJkZWNyUG9zSGVscGVyIiwicmVzdCIsInNlbGYiLCJyZXN0X2hlbHBlciIsImpvaW4iLCJuZXh0IiwiaXNOb3RoaW5nIiwiY29uY2F0IiwieCIsInkiLCJtYXRjaGVkIiwic3RyIiwicGFyc2VyTGFiZWwiLCJlcnJvck1zZyIsInZhbCIsImlzSlZhbHVlIiwiSlN0cmluZyIsIl9qc3RyaW5nIiwiRXJyb3IiLCJpc0pTdHJpbmciLCJKTnVtYmVyIiwiZmxvYXQiLCJfam51bWJlciIsImlzTmFOIiwiaXNKTnVtYmVyIiwiSkJvb2wiLCJib29sIiwiX2pib29sIiwiaXNKQm9vbCIsIkpOdWxsIiwibnVsbFZhbHVlIiwiX2pudWxsIiwiaXNKTnVsbCIsIkpBcnJheSIsImpWYWx1ZXMiLCJfamFycmF5IiwialZhbHVlIiwianZhbCIsImlzSkFycmF5IiwicmVkdWNlIiwiYWNjIiwiY3VyciIsIkpPYmplY3QiLCJwYWlycyIsIl9qb2JqZWN0IiwiZm9yRWFjaCIsImtleSIsImlzSk9iamVjdCIsIk9CSiJdLCJtYXBwaW5ncyI6Ijs7Ozs7O1VBYWdCQSxLLEdBQUFBLEs7VUFtREFDLFEsR0FBQUEsUTtVQXdGQUMsSSxHQUFBQSxJO1VBYUFDLE8sR0FBQUEsTztVQU1BQyxPLEdBQUFBLE87VUFNQUMsSSxHQUFBQSxJO1VBWUFDLEksR0FBQUEsSTtVQVlBQyxNLEdBQUFBLE07Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7TUFuTVJDLFEsR0FBYUMsTUFBTUMsUyxDQUFuQkYsUTs7O0FBRVJDLFFBQU1DLFNBQU4sQ0FBZ0JGLFFBQWhCLEdBQTJCLFlBQVc7QUFDcEMsV0FBTyxNQUFNQSxTQUFTRyxLQUFULENBQWUsSUFBZixDQUFOLEdBQTZCLEdBQXBDO0FBQ0QsR0FGRDs7QUFJQTtBQUNPLFdBQVNYLEtBQVQsR0FBaUIsQ0FDdkI7O0FBRUQsV0FBU1ksSUFBVCxDQUFjQyxDQUFkLEVBQWlCQyxDQUFqQixFQUFvQjtBQUNsQixRQUFNQyxTQUFTLElBQUlDLEtBQUosQ0FBVUgsQ0FBVixFQUFhQyxDQUFiLENBQWY7QUFDQUMsV0FBT0UsT0FBT0MsUUFBZCw0QkFBMEI7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEscUJBQ2xCTCxDQURrQjs7QUFBQTtBQUFBO0FBQUEscUJBRWxCQyxDQUZrQjs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxLQUExQjtBQUlBLFdBQU9DLE1BQVA7QUFDRDtBQUNESCxPQUFLRixTQUFMLEdBQWlCUyxPQUFPQyxNQUFQLENBQWNwQixNQUFNVSxTQUFwQixDQUFqQjs7QUFFQSxXQUFTTSxLQUFULENBQWVILENBQWYsRUFBa0JDLENBQWxCLEVBQXFCO0FBQ25CSyxXQUFPRSxjQUFQLENBQXNCLElBQXRCLEVB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QUFEMEIsdUNBQVB5QyxLQUFPO0FBQVBBLFdBQU87QUFBQTs7QUFFMUIsUUFBSUEsTUFBTTdGLElBQU4sQ0FBVyxnQkFBUTtBQUNyQixhQUFRLENBQUNILEtBQUtzQixNQUFOLElBQ0csT0FBT3RCLEtBQUssQ0FBTCxDQUFQLEtBQW1CLFFBRHRCLElBRUcsQ0FBQ0EsS0FBSyxDQUFMLEVBQVFvRSxRQUZwQjtBQUdELEtBSkcsQ0FBSixFQUlJLE1BQU0sSUFBSUcsS0FBSixDQUFVLDBCQUFWLENBQU47QUFDSnlCLFVBQU1FLE9BQU4sQ0FBYyxnQkFBa0I7QUFBQTtBQUFBLFVBQWhCQyxHQUFnQjtBQUFBLFVBQVgvRSxLQUFXOztBQUM5QkgsYUFBT0UsY0FBUCxDQUFzQm9DLElBQXRCLEVBQTRCNEMsR0FBNUIsRUFBaUMsRUFBRS9FLFlBQUYsRUFBU0MsVUFBVSxLQUFuQixFQUFqQztBQUNELEtBRkQ7QUFHRDtBQUNENEUsV0FBU3pGLFNBQVQsR0FBcUJTLE9BQU9DLE1BQVAsQ0FBY2IsT0FBT0csU0FBckIsQ0FBckI7QUFDQXlGLFdBQVN6RixTQUFULENBQW1CNEYsU0FBbkIsR0FBK0IsSUFBL0I7QUFDQUgsV0FBU3pGLFNBQVQsQ0FBbUJlLElBQW5CLEdBQTBCLFNBQTFCO0FBQ0EwRSxXQUFTekYsU0FBVCxDQUFtQkYsUUFBbkIsR0FBOEIsWUFBVztBQUN2QztBQUNBLFdBQU8sY0FBYytGLEdBQWQsR0FBb0IsSUFBM0IsQ0FGdUMsQ0FFTjtBQUNsQyxHQUhEOztBQUtBaEcsU0FBTzBGLE9BQVAsR0FBaUJBLE9BQWpCO0FBQ0ExRixTQUFPRyxTQUFQLENBQWlCdUYsT0FBakIsR0FBMkIxRixPQUFPMEYsT0FBbEMiLCJmaWxlIjoiY2xhc3Nlcy5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IE1heWJlIH0gZnJvbSAnbWF5YmUnO1xuXG5pbXBvcnQge1xuICBpc1BhaXIsXG59IGZyb20gJ3V0aWwnO1xuXG5jb25zdCB7IHRvU3RyaW5nIH0gPSBBcnJheS5wcm90b3R5cGU7XG5cbkFycmF5LnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gJ1snICsgdG9TdHJpbmcuYXBwbHkodGhpcykgKyAnXSc7XG59O1xuXG4vLyAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbmV4cG9ydCBmdW5jdGlvbiBUdXBsZSgpIHtcbn1cblxuZnVuY3Rpb24gUGFpcihhLCBiKSB7XG4gIGNvbnN0IHJlc3VsdCA9IG5ldyBfcGFpcihhLCBiKTtcbiAgcmVzdWx0W1N5bWJvbC5pdGVyYXRvcl0gPSBmdW5jdGlvbiooKSB7XG4gICAgeWllbGQgYTtcbiAgICB5aWVsZCBiO1xuICB9O1xuICByZXR1cm4gcmVzdWx0O1xufVxuUGFpci5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFR1cGxlLnByb3RvdHlwZSk7XG5cbmZ1bmN0aW9uIF9wYWlyKGEsIGIpIHtcbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsIDAsIHsgdmFsdWU6IGEsIHdyaXRhYmxlOiBmYWxzZSB9KTtcbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsIDEsIHsgdmFsdWU6IGIsIHdyaXRhYmxlOiBmYWxzZSB9KTtcbn1cbl9wYWlyLnByb3RvdHlwZS5pc1BhaXIgPSB0cnVlO1xuX3BhaXIucHJvdG90eXBlLnR5cGUgPSAncGFpcic7XG5fcGFpci5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuICdbJyArIHRoaXNbMF0udG9TdHJpbmcoKSArICcsJyArIHRoaXNbMV0udG9TdHJpbmcoKSArICddJztcbn07XG5cbmZ1bmN0aW9uIFRyaXBsZShhLCBiLCBjKSB7XG4gIGNvbnN0IHJlc3VsdCA9IG5ldyBfdHJpcGxlKGEsIGIsIGMpO1xuICByZXN1bHRbU3ltYm9sLml0ZXJhdG9yXSA9IGZ1bmN0aW9uKigpIHtcbiAgICB5aWVsZCBhO1xuICAgIHlpZWxkIGI7XG4gICAgeWllbGQgYztcbiAgfTtcbiAgcmV0dXJuIHJlc3VsdDtcbn1cblRyaXBsZS5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFR1cGxlLnByb3RvdHlwZSk7XG5cbmZ1bmN0aW9uIF90cmlwbGUoYSwgYiwgYykge1xuICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgMCwgeyB2YWx1ZTogYSwgd3JpdGFibGU6IGZhbHNlIH0pO1xuICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgMSwgeyB2YWx1ZTogYiwgd3JpdGFibGU6IGZhbHNlIH0pO1xuICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgMiwgeyB2YWx1ZTogYywgd3JpdGFibGU6IGZhbHNlIH0pO1xufVxuX3RyaXBsZS5wcm90b3R5cGUuaXNUcmlwbGUgPSB0cnVlO1xuX3RyaXBsZS5wcm90b3R5cGUudHlwZSA9ICd0cmlwbGUnO1xuX3RyaXBsZS5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuICdbJyArIHRoaXNbMF0udG9TdHJpbmcoKSArICcsJyArIHRoaXNbMV0udG9TdHJpbmcoKSArICcsJyArIHRoaXNbMl0udG9TdHJpbmcoKSArICddJztcbn07XG5cblR1cGxlLlBhaXIgPSBQYWlyO1xuVHVwbGUucHJvdG90eXBlLlBhaXIgPSBQYWlyO1xuXG5UdXBsZS5UcmlwbGUgPSBUcmlwbGU7XG5UdXBsZS5wcm90b3R5cGUuVHJpcGxlID0gVHJpcGxlO1xuXG5leHBvcnQgZnVuY3Rpb24gUG9zaXRpb24ocm93cyA9IFtdLCByb3cgPSAwLCBjb2wgPSAwKSB7XG4gIHJldHVybiBuZXcgX3Bvc2l0aW9uKHJvd3MsIHJvdywgY29sKTtcbn1cblxuLy8gUG9zaXRpb24ucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZSh7fSk7XG5Qb3NpdGlvbi5mcm9tVGV4dCA9IGZ1bmN0aW9uKHRleHQpIHtcbiAgY29uc3Qgcm93cyA9IHRleHQuc3BsaXQoJ1xcbicpXG4gICAgLm1hcChyb3cgPT4gcm93LnNwbGl0KCcnKSk7XG4gIHJldHVybiBuZXcgX3Bvc2l0aW9uKHJvd3MsIDAsIDApO1xufTtcblxuZnVuY3Rpb24gX3Bvc2l0aW9uKHJvd3MsIHJvdywgY29sKSB7XG4gIHRoaXMucm93cyA9IHJvd3M7XG4gIHRoaXMucm93ID0gcm93O1xuICB0aGlzLmNvbCA9IGNvbDtcbn1cblxuX3Bvc2l0aW9uLnByb3RvdHlwZS5pc1Bvc2l0aW9uID0gdHJ1ZTtcbl9wb3NpdGlvbi5wcm90b3R5cGUuY2hhciA9IGZ1bmN0aW9uKCkge1xuICBsZXQgcmVzdWx0ID0gTWF5YmUuTm90aGluZygpO1xuICB0cnkge1xuICAgIGNvbnN0IG5ld1Jlc3VsdFZhbHVlID0gdGhpcy5yb3dzW3RoaXMucm93XVt0aGlzLmNvbF07XG4gICAgaWYgKHR5cGVvZiBuZXdSZXN1bHRWYWx1ZSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHJlc3VsdCA9IE1heWJlLkp1c3QobmV3UmVzdWx0VmFsdWUpO1xuICAgIH1cbiAgfSBjYXRjaCAoZXJyKSB7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn07XG5fcG9zaXRpb24ucHJvdG90eXBlLmluY3JQb3MgPSBmdW5jdGlvbih0aW1lcyA9IDApIHtcbiAgY29uc3QgbGFzdFJvd0luZGV4ID0gdGhpcy5yb3dzLmxlbmd0aCAtIDE7XG4gIGNvbnN0IGxhc3RDb2x1bW5JbmRleCA9IHRoaXMucm93c1tsYXN0Um93SW5kZXhdLmxlbmd0aCAtIDE7XG4gIGxldCByZXN1bHQgPSBQb3NpdGlvbih0aGlzLnJvd3MsIGxhc3RSb3dJbmRleCwgbGFzdENvbHVtbkluZGV4ICsgMSk7XG4gIHRyeSB7XG4gICAgY29uc3QgbmVlZHNSb3dJbmNyZW1lbnQgPSAodGhpcy5jb2wgPT09IHRoaXMucm93c1t0aGlzLnJvd10ubGVuZ3RoIC0gMSk7XG4gICAgcmVzdWx0ID0gKHRpbWVzICogMSlcbiAgICAgID8gaW5jclBvc0hlbHBlcih0aGlzLCB0aW1lcylcbiAgICAgIDogUG9zaXRpb24oXG4gICAgICAgIHRoaXMucm93cyxcbiAgICAgICAgKG5lZWRzUm93SW5jcmVtZW50ID8gdGhpcy5yb3cgKyAxIDogdGhpcy5yb3cpLFxuICAgICAgICAobmVlZHNSb3dJbmNyZW1lbnQgPyAwIDogdGhpcy5jb2wgKyAxKSxcbiAgICAgICk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfSBjYXRjaCAoZXJyKSB7fVxuICByZXR1cm4gcmVzdWx0O1xuXG4gIGZ1bmN0aW9uIGluY3JQb3NIZWxwZXIocG9zLCB0aW1lcyA9IDApIHtcbiAgICBpZiAodGltZXMgPT09IDApIHJldHVybiBwb3M7XG4gICAgcmV0dXJuIGluY3JQb3NIZWxwZXIocG9zLmluY3JQb3MoKSwgdGltZXMgLSAxKTtcbiAgfVxufTtcbl9wb3NpdGlvbi5wcm90b3R5cGUuZGVjclBvcyA9IGZ1bmN0aW9uKHRpbWVzID0gMCkge1xuICBsZXQgcmVzdWx0ID0gUG9zaXRpb24odGhpcy5yb3dzLCAtMSwgLTEpO1xuICB0cnkge1xuICAgIGNvbnN0IG5lZWRzUm93RGVjcmVtZW50ID0gKHRoaXMuY29sID09PSAwKTtcbiAgICByZXN1bHQgPSB0aW1lc1xuICAgICAgPyBkZWNyUG9zSGVscGVyKHRoaXMsIHRpbWVzKVxuICAgICAgOiBQb3NpdGlvbihcbiAgICAgICAgdGhpcy5yb3dzLFxuICAgICAgICAobmVlZHNSb3dEZWNyZW1lbnQgPyB0aGlzLnJvdyAtIDEgOiB0aGlzLnJvdyksXG4gICAgICAgIChuZWVkc1Jvd0RlY3JlbWVudCA/IHRoaXMucm93c1t0aGlzLnJvdyAtIDFdLmxlbmd0aCAtIDEgOiB0aGlzLmNvbCAtIDEpLFxuICAgICAgKTtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9IGNhdGNoIChlcnIpIHt9XG4gIHJldHVybiByZXN1bHQ7XG5cbiAgZnVuY3Rpb24gZGVjclBvc0hlbHBlcihwb3MsIHRpbWVzID0gMCkge1xuICAgIGlmICh0aW1lcyA9PT0gMCkgcmV0dXJuIHBvcztcbiAgICByZXR1cm4gZGVjclBvc0hlbHBlcihwb3MuZGVjclBvcygpLCB0aW1lcyAtIDEpO1xuICB9XG59O1xuX3Bvc2l0aW9uLnByb3RvdHlwZS5yZXN0ID0gZnVuY3Rpb24oKSB7XG4gIGNvbnN0IHNlbGYgPSB0aGlzO1xuICByZXR1cm4gcmVzdF9oZWxwZXIoKS5qb2luKCcnKTtcbiAgZnVuY3Rpb24gcmVzdF9oZWxwZXIoKSB7XG4gICAgY29uc3QgbmV4dCA9IHNlbGYuY2hhcigpO1xuICAgIGlmIChuZXh0LmlzTm90aGluZykgcmV0dXJuIFtdO1xuICAgIHJldHVybiBbbmV4dC52YWx1ZV0uY29uY2F0KHNlbGYuaW5jclBvcygpLnJlc3QoKSk7XG4gIH1cbn07XG5fcG9zaXRpb24ucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiAncm93PScgKyB0aGlzLnJvd1xuICAgICAgICArICc7Y29sPScgKyB0aGlzLmNvbFxuICAgICAgICArICc7cmVzdD0nICsgdGhpcy5yZXN0KCk7XG59O1xuXG4vLyAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gZGVwcmVjYXRlZCBpbiBmYXZvdXIgb2YgVHVwbGUsIGRhdGEuTWF5YmUgYW5kIGRhdGEuVmFsaWRhdGlvblxuZXhwb3J0IGZ1bmN0aW9uIHBhaXIoeCwgeSkge1xuICBjb25zdCByZXN1bHQgPSBbeCwgeV07XG4gIHJlc3VsdC50eXBlID0gJ3BhaXInO1xuICByZXN1bHQudG9TdHJpbmcgPSAoKSA9PiB7XG4gICAgcmV0dXJuICdbJ1xuICAgICAgICAgICAgKyAoaXNQYWlyKHJlc3VsdFswXSkgPyByZXN1bHRbMF0udG9TdHJpbmcoKSA6IHJlc3VsdFswXSlcbiAgICAgICAgICAgICsgJywnXG4gICAgICAgICAgICArIChpc1BhaXIocmVzdWx0WzFdKSA/IHJlc3VsdFsxXS50b1N0cmluZygpIDogcmVzdWx0WzFdKVxuICAgICAgICAgICAgKyAnXSc7XG4gIH07XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzdWNjZXNzKG1hdGNoZWQsIHN0cikge1xuICBjb25zdCByZXN1bHQgPSBwYWlyKG1hdGNoZWQsIHN0cik7XG4gIHJlc3VsdC50eXBlID0gJ3N1Y2Nlc3MnO1xuICByZXR1cm4gcmVzdWx0O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZmFpbHVyZShwYXJzZXJMYWJlbCwgZXJyb3JNc2cpIHtcbiAgY29uc3QgcmVzdWx0ID0gcGFpcihwYXJzZXJMYWJlbCwgZXJyb3JNc2cpO1xuICByZXN1bHQudHlwZSA9ICdmYWlsdXJlJztcbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNvbWUodmFsdWUpIHtcbiAgcmV0dXJuIHtcbiAgICB0eXBlOiAnc29tZScsXG4gICAgdmFsKCkge1xuICAgICAgcmV0dXJuIHZhbHVlO1xuICAgIH0sXG4gICAgdG9TdHJpbmcoKSB7XG4gICAgICByZXR1cm4gYHNvbWUoJHt2YWx1ZX0pYDtcbiAgICB9LFxuICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbm9uZSgpIHtcbiAgcmV0dXJuIHtcbiAgICB0eXBlOiAnbm9uZScsXG4gICAgdmFsKCkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfSxcbiAgICB0b1N0cmluZygpIHtcbiAgICAgIHJldHVybiAnbm9uZSgpJztcbiAgICB9LFxuICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gSlZhbHVlKCkge1xufVxuSlZhbHVlLnByb3RvdHlwZS5pc0pWYWx1ZSA9IHRydWU7XG5cbmZ1bmN0aW9uIEpTdHJpbmcoc3RyKSB7XG4gIHJldHVybiBuZXcgX2pzdHJpbmcoc3RyKTtcbn1cblxuZnVuY3Rpb24gX2pzdHJpbmcoc3RyKSB7XG4gIGlmICh0eXBlb2Ygc3RyICE9PSAnc3RyaW5nJykgdGhyb3cgbmV3IEVycm9yKCdKU3RyaW5nOiBpbnZhbGlkIHZhbHVlJyk7XG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCAndmFsdWUnLCB7IHZhbHVlOiBzdHIsIHdyaXRhYmxlOiBmYWxzZSB9KTtcbn1cbl9qc3RyaW5nLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoSlZhbHVlLnByb3RvdHlwZSk7XG5fanN0cmluZy5wcm90b3R5cGUuaXNKU3RyaW5nID0gdHJ1ZTtcbl9qc3RyaW5nLnByb3RvdHlwZS50eXBlID0gJ2pzdHJpbmcnO1xuX2pzdHJpbmcucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiAnSlN0cmluZygnICsgdGhpcy52YWx1ZS50b1N0cmluZygpICsgJyknO1xufTtcblxuSlZhbHVlLkpTdHJpbmcgPSBKU3RyaW5nO1xuSlZhbHVlLnByb3RvdHlwZS5KU3RyaW5nID0gSlZhbHVlLkpTdHJpbmc7XG5cbmZ1bmN0aW9uIEpOdW1iZXIoZmxvYXQpIHtcbiAgcmV0dXJuIG5ldyBfam51bWJlcihmbG9hdCk7XG59XG5cbmZ1bmN0aW9uIF9qbnVtYmVyKGZsb2F0KSB7XG4gIGlmICh0eXBlb2YgZmxvYXQgIT09ICdudW1iZXInXG4gICAgICAgIHx8IGlzTmFOKGZsb2F0KSkgdGhyb3cgbmV3IEVycm9yKCdKTnVtYmVyOiBpbnZhbGlkIHZhbHVlJyk7XG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCAndmFsdWUnLCB7IHZhbHVlOiBmbG9hdCwgd3JpdGFibGU6IGZhbHNlIH0pO1xufVxuX2pudW1iZXIucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShKVmFsdWUucHJvdG90eXBlKTtcbl9qbnVtYmVyLnByb3RvdHlwZS5pc0pOdW1iZXIgPSB0cnVlO1xuX2pudW1iZXIucHJvdG90eXBlLnR5cGUgPSAnam51bWJlcic7XG5fam51bWJlci5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuICdKTnVtYmVyKCcgKyB0aGlzLnZhbHVlLnRvU3RyaW5nKCkgKyAnKSc7XG59O1xuXG5KVmFsdWUuSk51bWJlciA9IEpOdW1iZXI7XG5KVmFsdWUucHJvdG90eXBlLkpOdW1iZXIgPSBKVmFsdWUuSk51bWJlcjtcblxuZnVuY3Rpb24gSkJvb2woYm9vbCkge1xuICByZXR1cm4gbmV3IF9qYm9vbChib29sKTtcbn1cblxuZnVuY3Rpb24gX2pib29sKGJvb2wpIHtcbiAgaWYgKHR5cGVvZiBib29sICE9PSAnYm9vbGVhbicpIHRocm93IG5ldyBFcnJvcignSkJvb2w6IGludmFsaWQgdmFsdWUnKTtcbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsICd2YWx1ZScsIHsgdmFsdWU6IGJvb2wsIHdyaXRhYmxlOiBmYWxzZSB9KTtcbn1cbl9qYm9vbC5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKEpWYWx1ZS5wcm90b3R5cGUpO1xuX2pib29sLnByb3RvdHlwZS5pc0pCb29sID0gdHJ1ZTtcbl9qYm9vbC5wcm90b3R5cGUudHlwZSA9ICdqYm9vbCc7XG5famJvb2wucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiAnSkJvb2woJyArIHRoaXMudmFsdWUudG9TdHJpbmcoKSArICcpJztcbn07XG5cbkpWYWx1ZS5KQm9vbCA9IEpCb29sO1xuSlZhbHVlLnByb3RvdHlwZS5KQm9vbCA9IEpWYWx1ZS5KQm9vbDtcblxuZnVuY3Rpb24gSk51bGwobnVsbFZhbHVlKSB7XG4gIHJldHVybiBuZXcgX2pudWxsKG51bGxWYWx1ZSk7XG59XG5cbmZ1bmN0aW9uIF9qbnVsbChudWxsVmFsdWUpIHtcbiAgaWYgKG51bGxWYWx1ZSAhPT0gbnVsbCkgdGhyb3cgbmV3IEVycm9yKCdKTnVsbDogaW52YWxpZCB2YWx1ZScpO1xuICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgJ3ZhbHVlJywgeyB2YWx1ZTogbnVsbFZhbHVlLCB3cml0YWJsZTogZmFsc2UgfSk7XG59XG5fam51bGwucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShKVmFsdWUucHJvdG90eXBlKTtcbl9qbnVsbC5wcm90b3R5cGUuaXNKTnVsbCA9IHRydWU7XG5fam51bGwucHJvdG90eXBlLnR5cGUgPSAnam51bGwnO1xuX2pudWxsLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gJ0pOdWxsKG51bGwpJztcbn07XG5cbkpWYWx1ZS5KTnVsbCA9IEpOdWxsO1xuSlZhbHVlLnByb3RvdHlwZS5KTnVsbCA9IEpWYWx1ZS5KTnVsbDtcblxuZnVuY3Rpb24gSkFycmF5KC4uLmpWYWx1ZXMpIHtcbiAgcmV0dXJuIG5ldyBfamFycmF5KC4uLmpWYWx1ZXMpO1xufVxuXG4vLyBUT0RPIG1ha2UgaXQgd2l0aCBpdGVyYXRvciBhbmQgZXZlcnl0aGluZ1xuZnVuY3Rpb24gX2phcnJheSguLi5qVmFsdWVzKSB7IC8vIGFyZ3MgYmVjb21lIGEgUkVBTCBhcnJheVxuICBpZiAodHlwZW9mIGpWYWx1ZSA9PT0gJ3VuZGVmaW5lZCcpIHsgLy8gZW1wdHkgSlNPTiBhcnJheVxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCAndmFsdWUnLCB7IHZhbHVlOiBbXSwgd3JpdGFibGU6IGZhbHNlIH0pO1xuICB9IGVsc2Uge1xuICAgIGlmIChqVmFsdWVzLnNvbWUoanZhbCA9PiAoIWp2YWwuaXNKVmFsdWUpKSkgdGhyb3cgbmV3IEVycm9yKCdKQXJyYXk6IGludmFsaWQgY29udGVudCcpO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCAndmFsdWUnLCB7IHZhbHVlOiBbLi4ualZhbHVlc10sIHdyaXRhYmxlOiBmYWxzZSB9KTtcbiAgfVxufVxuX2phcnJheS5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKEpWYWx1ZS5wcm90b3R5cGUpO1xuX2phcnJheS5wcm90b3R5cGUuaXNKQXJyYXkgPSB0cnVlO1xuX2phcnJheS5wcm90b3R5cGUudHlwZSA9ICdqYXJyYXknO1xuX2phcnJheS5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuICdKQXJyYXkoWycgKyB0aGlzLnZhbHVlLnJlZHVjZSgoYWNjLCBjdXJyKSA9PiBhY2MgKyBjdXJyICsgJywnLCAnJykgKyAnXSknO1xufTtcblxuSlZhbHVlLkpBcnJheSA9IEpBcnJheTtcbkpWYWx1ZS5wcm90b3R5cGUuSkFycmF5ID0gSlZhbHVlLkpBcnJheTtcblxuZnVuY3Rpb24gSk9iamVjdCguLi5wYWlycykge1xuICByZXR1cm4gbmV3IF9qb2JqZWN0KC4uLnBhaXJzKTtcbn1cblxuZnVuY3Rpb24gX2pvYmplY3QoLi4ucGFpcnMpIHtcbiAgY29uc3Qgc2VsZiA9IHRoaXM7XG4gIGlmIChwYWlycy5zb21lKHBhaXIgPT4ge1xuICAgIHJldHVybiAoIXBhaXIuaXNQYWlyXG4gICAgICAgICAgICB8fCB0eXBlb2YgcGFpclswXSAhPT0gJ3N0cmluZydcbiAgICAgICAgICAgIHx8ICFwYWlyWzFdLmlzSlZhbHVlKTtcbiAgfSkpIHRocm93IG5ldyBFcnJvcignSk9iamVjdDogaW52YWxpZCBjb250ZW50Jyk7XG4gIHBhaXJzLmZvckVhY2goKFtrZXksIHZhbHVlXSkgPT4ge1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShzZWxmLCBrZXksIHsgdmFsdWUsIHdyaXRhYmxlOiBmYWxzZSB9KTtcbiAgfSk7XG59XG5fam9iamVjdC5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKEpWYWx1ZS5wcm90b3R5cGUpO1xuX2pvYmplY3QucHJvdG90eXBlLmlzSk9iamVjdCA9IHRydWU7XG5fam9iamVjdC5wcm90b3R5cGUudHlwZSA9ICdqb2JqZWN0Jztcbl9qb2JqZWN0LnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uKCkge1xuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tdW5kZWZcbiAgcmV0dXJuICdKT2JqZWN0KHsnICsgT0JKICsgJ30pJzsgLy8gVE9ETyAtIGNvbXBsZXRlIG1lIVxufTtcblxuSlZhbHVlLkpPYmplY3QgPSBKT2JqZWN0O1xuSlZhbHVlLnByb3RvdHlwZS5KT2JqZWN0ID0gSlZhbHVlLkpPYmplY3Q7XG4iXX0=