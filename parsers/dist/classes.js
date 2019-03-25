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

    /////////////////////////////
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

    //Position.prototype = Object.create({});
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

    ////////////////////////////////////////////////////////////////
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
        return 'JObject({' + OBJ + '})';
    };

    JValue.JObject = JObject;
    JValue.prototype.JObject = JValue.JObject;
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2pzL2NsYXNzZXMuanMiXSwibmFtZXMiOlsiVHVwbGUiLCJQb3NpdGlvbiIsInBhaXIiLCJzdWNjZXNzIiwiZmFpbHVyZSIsInNvbWUiLCJub25lIiwiSlZhbHVlIiwidG9TdHJpbmciLCJBcnJheSIsInByb3RvdHlwZSIsImFwcGx5IiwiUGFpciIsImEiLCJiIiwicmVzdWx0IiwiX3BhaXIiLCJTeW1ib2wiLCJpdGVyYXRvciIsIk9iamVjdCIsImNyZWF0ZSIsImRlZmluZVByb3BlcnR5IiwidmFsdWUiLCJ3cml0YWJsZSIsImlzUGFpciIsInR5cGUiLCJUcmlwbGUiLCJjIiwiX3RyaXBsZSIsImlzVHJpcGxlIiwicm93cyIsInJvdyIsImNvbCIsIl9wb3NpdGlvbiIsImZyb21UZXh0IiwidGV4dCIsInNwbGl0IiwibWFwIiwiaXNQb3NpdGlvbiIsImNoYXIiLCJNYXliZSIsIk5vdGhpbmciLCJuZXdSZXN1bHRWYWx1ZSIsIkp1c3QiLCJlcnIiLCJpbmNyUG9zIiwidGltZXMiLCJsYXN0Um93SW5kZXgiLCJsZW5ndGgiLCJsYXN0Q29sdW1uSW5kZXgiLCJuZWVkc1Jvd0luY3JlbWVudCIsImluY3JQb3NIZWxwZXIiLCJwb3MiLCJkZWNyUG9zIiwibmVlZHNSb3dEZWNyZW1lbnQiLCJkZWNyUG9zSGVscGVyIiwicmVzdCIsInNlbGYiLCJyZXN0X2hlbHBlciIsImpvaW4iLCJuZXh0IiwiaXNOb3RoaW5nIiwiY29uY2F0IiwieCIsInkiLCJtYXRjaGVkIiwic3RyIiwicGFyc2VyTGFiZWwiLCJlcnJvck1zZyIsInZhbCIsImlzSlZhbHVlIiwiSlN0cmluZyIsIl9qc3RyaW5nIiwiRXJyb3IiLCJpc0pTdHJpbmciLCJKTnVtYmVyIiwiZmxvYXQiLCJfam51bWJlciIsImlzTmFOIiwiaXNKTnVtYmVyIiwiSkJvb2wiLCJib29sIiwiX2pib29sIiwiaXNKQm9vbCIsIkpOdWxsIiwibnVsbFZhbHVlIiwiX2pudWxsIiwiaXNKTnVsbCIsIkpBcnJheSIsImpWYWx1ZXMiLCJfamFycmF5IiwialZhbHVlIiwianZhbCIsImlzSkFycmF5IiwicmVkdWNlIiwiYWNjIiwiY3VyciIsIkpPYmplY3QiLCJwYWlycyIsIl9qb2JqZWN0IiwiZm9yRWFjaCIsImtleSIsImlzSk9iamVjdCIsIk9CSiJdLCJtYXBwaW5ncyI6Ijs7Ozs7O1lBYWdCQSxLLEdBQUFBLEs7WUFtREFDLFEsR0FBQUEsUTtZQXdGQUMsSSxHQUFBQSxJO1lBYUFDLE8sR0FBQUEsTztZQU1BQyxPLEdBQUFBLE87WUFNQUMsSSxHQUFBQSxJO1lBWUFDLEksR0FBQUEsSTtZQVlBQyxNLEdBQUFBLE07Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFuTWhCLFFBQU1DLFdBQVdDLE1BQU1DLFNBQU4sQ0FBZ0JGLFFBQWpDOztBQUVBQyxVQUFNQyxTQUFOLENBQWdCRixRQUFoQixHQUEyQixZQUFZO0FBQ25DLGVBQU8sTUFBTUEsU0FBU0csS0FBVCxDQUFlLElBQWYsQ0FBTixHQUE2QixHQUFwQztBQUNILEtBRkQ7O0FBSUE7QUFDTyxhQUFTWCxLQUFULEdBQWlCLENBQ3ZCOztBQUVELGFBQVNZLElBQVQsQ0FBY0MsQ0FBZCxFQUFpQkMsQ0FBakIsRUFBb0I7QUFDaEIsWUFBSUMsU0FBUyxJQUFJQyxLQUFKLENBQVVILENBQVYsRUFBYUMsQ0FBYixDQUFiO0FBQ0FDLGVBQU9FLE9BQU9DLFFBQWQsNEJBQTBCO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLG1DQUNoQkwsQ0FEZ0I7O0FBQUE7QUFBQTtBQUFBLG1DQUVoQkMsQ0FGZ0I7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsU0FBMUI7QUFJQSxlQUFPQyxNQUFQO0FBQ0g7QUFDREgsU0FBS0YsU0FBTCxHQUFpQlMsT0FBT0MsTUFBUCxDQUFjcEIsTUFBTVUsU0FBcEIsQ0FBakI7O0FBRUEsYUFBU00sS0FBVCxDQUFlSCxDQUFmLEVBQWtCQyxDQUFsQixFQUFxQjtBQUNqQkssZUFBT0UsY0FBUCxDQUFz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QUFFRCxhQUFTQyxRQUFULEdBQTRCO0FBQ3hCLFlBQU0xQyxPQUFPLElBQWI7O0FBRHdCLDJDQUFQeUMsS0FBTztBQUFQQSxpQkFBTztBQUFBOztBQUV4QixZQUFJQSxNQUFNN0YsSUFBTixDQUFXLGdCQUFRO0FBQ2YsbUJBQVEsQ0FBQ0gsS0FBS3NCLE1BQU4sSUFDTCxPQUFPdEIsS0FBSyxDQUFMLENBQVAsS0FBbUIsUUFEZCxJQUVMLENBQUNBLEtBQUssQ0FBTCxFQUFRb0UsUUFGWjtBQUdILFNBSkQsQ0FBSixFQUlRLE1BQU0sSUFBSUcsS0FBSixDQUFVLDBCQUFWLENBQU47QUFDUnlCLGNBQU1FLE9BQU4sQ0FBYyxnQkFBa0I7QUFBQTtBQUFBLGdCQUFoQkMsR0FBZ0I7QUFBQSxnQkFBWC9FLEtBQVc7O0FBQzVCSCxtQkFBT0UsY0FBUCxDQUFzQm9DLElBQXRCLEVBQTRCNEMsR0FBNUIsRUFBaUMsRUFBQy9FLE9BQU9BLEtBQVIsRUFBZUMsVUFBVSxLQUF6QixFQUFqQztBQUNILFNBRkQ7QUFHSDtBQUNENEUsYUFBU3pGLFNBQVQsR0FBcUJTLE9BQU9DLE1BQVAsQ0FBY2IsT0FBT0csU0FBckIsQ0FBckI7QUFDQXlGLGFBQVN6RixTQUFULENBQW1CNEYsU0FBbkIsR0FBK0IsSUFBL0I7QUFDQUgsYUFBU3pGLFNBQVQsQ0FBbUJlLElBQW5CLEdBQTBCLFNBQTFCO0FBQ0EwRSxhQUFTekYsU0FBVCxDQUFtQkYsUUFBbkIsR0FBOEIsWUFBWTtBQUN0QyxlQUFPLGNBQWMrRixHQUFkLEdBQW9CLElBQTNCO0FBQ0gsS0FGRDs7QUFJQWhHLFdBQU8wRixPQUFQLEdBQWlCQSxPQUFqQjtBQUNBMUYsV0FBT0csU0FBUCxDQUFpQnVGLE9BQWpCLEdBQTJCMUYsT0FBTzBGLE9BQWxDIiwiZmlsZSI6ImNsYXNzZXMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge01heWJlfSBmcm9tICdtYXliZSc7XG5cbmltcG9ydCB7XG4gICAgaXNQYWlyLFxufSBmcm9tICd1dGlsJztcblxuY29uc3QgdG9TdHJpbmcgPSBBcnJheS5wcm90b3R5cGUudG9TdHJpbmc7XG5cbkFycmF5LnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gJ1snICsgdG9TdHJpbmcuYXBwbHkodGhpcykgKyAnXSc7XG59O1xuXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuZXhwb3J0IGZ1bmN0aW9uIFR1cGxlKCkge1xufVxuXG5mdW5jdGlvbiBQYWlyKGEsIGIpIHtcbiAgICBsZXQgcmVzdWx0ID0gbmV3IF9wYWlyKGEsIGIpO1xuICAgIHJlc3VsdFtTeW1ib2wuaXRlcmF0b3JdID0gZnVuY3Rpb24qKCkge1xuICAgICAgICB5aWVsZCBhO1xuICAgICAgICB5aWVsZCBiO1xuICAgIH07XG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cblBhaXIucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShUdXBsZS5wcm90b3R5cGUpO1xuXG5mdW5jdGlvbiBfcGFpcihhLCBiKSB7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsIDAsIHt2YWx1ZTogYSwgd3JpdGFibGU6IGZhbHNlfSk7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsIDEsIHt2YWx1ZTogYiwgd3JpdGFibGU6IGZhbHNlfSk7XG59XG5fcGFpci5wcm90b3R5cGUuaXNQYWlyID0gdHJ1ZTtcbl9wYWlyLnByb3RvdHlwZS50eXBlID0gJ3BhaXInO1xuX3BhaXIucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiAnWycgKyB0aGlzWzBdLnRvU3RyaW5nKCkgKyAnLCcgKyB0aGlzWzFdLnRvU3RyaW5nKCkgKyAnXSc7XG59O1xuXG5mdW5jdGlvbiBUcmlwbGUoYSwgYiwgYykge1xuICAgIGxldCByZXN1bHQgPSBuZXcgX3RyaXBsZShhLCBiLCBjKTtcbiAgICByZXN1bHRbU3ltYm9sLml0ZXJhdG9yXSA9IGZ1bmN0aW9uKigpIHtcbiAgICAgICAgeWllbGQgYTtcbiAgICAgICAgeWllbGQgYjtcbiAgICAgICAgeWllbGQgYztcbiAgICB9O1xuICAgIHJldHVybiByZXN1bHQ7XG59XG5UcmlwbGUucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShUdXBsZS5wcm90b3R5cGUpO1xuXG5mdW5jdGlvbiBfdHJpcGxlKGEsIGIsIGMpIHtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgMCwge3ZhbHVlOiBhLCB3cml0YWJsZTogZmFsc2V9KTtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgMSwge3ZhbHVlOiBiLCB3cml0YWJsZTogZmFsc2V9KTtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgMiwge3ZhbHVlOiBjLCB3cml0YWJsZTogZmFsc2V9KTtcbn1cbl90cmlwbGUucHJvdG90eXBlLmlzVHJpcGxlID0gdHJ1ZTtcbl90cmlwbGUucHJvdG90eXBlLnR5cGUgPSAndHJpcGxlJztcbl90cmlwbGUucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiAnWycgKyB0aGlzWzBdLnRvU3RyaW5nKCkgKyAnLCcgKyB0aGlzWzFdLnRvU3RyaW5nKCkgKyAnLCcgKyB0aGlzWzJdLnRvU3RyaW5nKCkgKyAnXSc7XG59O1xuXG5UdXBsZS5QYWlyID0gUGFpcjtcblR1cGxlLnByb3RvdHlwZS5QYWlyID0gUGFpcjtcblxuVHVwbGUuVHJpcGxlID0gVHJpcGxlO1xuVHVwbGUucHJvdG90eXBlLlRyaXBsZSA9IFRyaXBsZTtcblxuZXhwb3J0IGZ1bmN0aW9uIFBvc2l0aW9uKHJvd3MgPSBbXSwgcm93ID0gMCwgY29sID0gMCkge1xuICAgIHJldHVybiBuZXcgX3Bvc2l0aW9uKHJvd3MsIHJvdywgY29sKTtcbn1cblxuLy9Qb3NpdGlvbi5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKHt9KTtcblBvc2l0aW9uLmZyb21UZXh0ID0gZnVuY3Rpb24gKHRleHQpIHtcbiAgICBjb25zdCByb3dzID0gdGV4dC5zcGxpdCgnXFxuJylcbiAgICAgICAgLm1hcChyb3cgPT4gcm93LnNwbGl0KCcnKSk7XG4gICAgcmV0dXJuIG5ldyBfcG9zaXRpb24ocm93cywgMCwgMCk7XG59O1xuXG5mdW5jdGlvbiBfcG9zaXRpb24ocm93cywgcm93LCBjb2wpIHtcbiAgICB0aGlzLnJvd3MgPSByb3dzO1xuICAgIHRoaXMucm93ID0gcm93O1xuICAgIHRoaXMuY29sID0gY29sO1xufVxuXG5fcG9zaXRpb24ucHJvdG90eXBlLmlzUG9zaXRpb24gPSB0cnVlO1xuX3Bvc2l0aW9uLnByb3RvdHlwZS5jaGFyID0gZnVuY3Rpb24gKCkge1xuICAgIGxldCByZXN1bHQgPSBNYXliZS5Ob3RoaW5nKCk7XG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgbmV3UmVzdWx0VmFsdWUgPSB0aGlzLnJvd3NbdGhpcy5yb3ddW3RoaXMuY29sXTtcbiAgICAgICAgaWYgKHR5cGVvZiBuZXdSZXN1bHRWYWx1ZSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgIHJlc3VsdCA9IE1heWJlLkp1c3QobmV3UmVzdWx0VmFsdWUpO1xuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG59O1xuX3Bvc2l0aW9uLnByb3RvdHlwZS5pbmNyUG9zID0gZnVuY3Rpb24gKHRpbWVzID0gMCkge1xuICBjb25zdCBsYXN0Um93SW5kZXggPSB0aGlzLnJvd3MubGVuZ3RoIC0xO1xuICBjb25zdCBsYXN0Q29sdW1uSW5kZXggPSB0aGlzLnJvd3NbbGFzdFJvd0luZGV4XS5sZW5ndGggLTFcbiAgbGV0IHJlc3VsdCA9IFBvc2l0aW9uKHRoaXMucm93cywgbGFzdFJvd0luZGV4LCBsYXN0Q29sdW1uSW5kZXggKyAxKTtcbiAgdHJ5IHtcbiAgICBjb25zdCBuZWVkc1Jvd0luY3JlbWVudCA9ICh0aGlzLmNvbCA9PT0gdGhpcy5yb3dzW3RoaXMucm93XS5sZW5ndGggLSAxKTtcbiAgICByZXN1bHQgPSAodGltZXMgKiAxKVxuICAgICAgPyBpbmNyUG9zSGVscGVyKHRoaXMsIHRpbWVzKVxuICAgICAgOiBQb3NpdGlvbihcbiAgICAgICAgdGhpcy5yb3dzLFxuICAgICAgICAobmVlZHNSb3dJbmNyZW1lbnQgPyB0aGlzLnJvdyArIDEgOiB0aGlzLnJvdyksXG4gICAgICAgIChuZWVkc1Jvd0luY3JlbWVudCA/IDAgOiB0aGlzLmNvbCArIDEpXG4gICAgKTtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9IGNhdGNoIChlcnIpIHt9XG4gIHJldHVybiByZXN1bHQ7XG5cbiAgZnVuY3Rpb24gaW5jclBvc0hlbHBlcihwb3MsIHRpbWVzID0gMCkge1xuICAgIGlmICh0aW1lcyA9PT0gMCkgcmV0dXJuIHBvcztcbiAgICByZXR1cm4gaW5jclBvc0hlbHBlcihwb3MuaW5jclBvcygpLCB0aW1lcyAtIDEpXG4gIH1cbn07XG5fcG9zaXRpb24ucHJvdG90eXBlLmRlY3JQb3MgPSBmdW5jdGlvbiAodGltZXMgPSAwKSB7XG4gIGxldCByZXN1bHQgPSBQb3NpdGlvbih0aGlzLnJvd3MsIC0xLCAtMSk7XG4gIHRyeSB7XG4gICAgY29uc3QgbmVlZHNSb3dEZWNyZW1lbnQgPSAodGhpcy5jb2wgPT09IDApO1xuICAgIHJlc3VsdCA9IHRpbWVzXG4gICAgICA/IGRlY3JQb3NIZWxwZXIodGhpcywgdGltZXMpXG4gICAgICA6IFBvc2l0aW9uKFxuICAgICAgICB0aGlzLnJvd3MsXG4gICAgICAgIChuZWVkc1Jvd0RlY3JlbWVudCA/IHRoaXMucm93IC0gMSA6IHRoaXMucm93KSxcbiAgICAgICAgKG5lZWRzUm93RGVjcmVtZW50ID8gdGhpcy5yb3dzW3RoaXMucm93IC0xXS5sZW5ndGggLSAxIDogdGhpcy5jb2wgLSAxKVxuICAgICk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfSBjYXRjaCAoZXJyKSB7fVxuICByZXR1cm4gcmVzdWx0O1xuXG4gIGZ1bmN0aW9uIGRlY3JQb3NIZWxwZXIocG9zLCB0aW1lcyA9IDApIHtcbiAgICBpZiAodGltZXMgPT09IDApIHJldHVybiBwb3M7XG4gICAgcmV0dXJuIGRlY3JQb3NIZWxwZXIocG9zLmRlY3JQb3MoKSwgdGltZXMgLSAxKVxuICB9XG59O1xuX3Bvc2l0aW9uLnByb3RvdHlwZS5yZXN0ID0gZnVuY3Rpb24gKCkge1xuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuICAgIHJldHVybiByZXN0X2hlbHBlcigpLmpvaW4oJycpO1xuICAgIGZ1bmN0aW9uIHJlc3RfaGVscGVyKCkge1xuICAgICAgICBjb25zdCBuZXh0ID0gc2VsZi5jaGFyKCk7XG4gICAgICAgIGlmIChuZXh0LmlzTm90aGluZykgcmV0dXJuIFtdO1xuICAgICAgICByZXR1cm4gW25leHQudmFsdWVdLmNvbmNhdChzZWxmLmluY3JQb3MoKS5yZXN0KCkpO1xuICAgIH1cbn07XG5fcG9zaXRpb24ucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiAncm93PScgKyB0aGlzLnJvd1xuICAgICAgICArICc7Y29sPScgKyB0aGlzLmNvbFxuICAgICAgICArICc7cmVzdD0nICsgdGhpcy5yZXN0KCk7XG59O1xuXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBkZXByZWNhdGVkIGluIGZhdm91ciBvZiBUdXBsZSwgZGF0YS5NYXliZSBhbmQgZGF0YS5WYWxpZGF0aW9uXG5leHBvcnQgZnVuY3Rpb24gcGFpcih4LCB5KSB7XG4gICAgbGV0IHJlc3VsdCA9IFt4LCB5XTtcbiAgICByZXN1bHQudHlwZSA9ICdwYWlyJztcbiAgICByZXN1bHQudG9TdHJpbmcgPSAoKSA9PiB7XG4gICAgICAgIHJldHVybiAnWydcbiAgICAgICAgICAgICsgKGlzUGFpcihyZXN1bHRbMF0pID8gcmVzdWx0WzBdLnRvU3RyaW5nKCkgOiByZXN1bHRbMF0pXG4gICAgICAgICAgICArICcsJ1xuICAgICAgICAgICAgKyAoaXNQYWlyKHJlc3VsdFsxXSkgPyByZXN1bHRbMV0udG9TdHJpbmcoKSA6IHJlc3VsdFsxXSlcbiAgICAgICAgICAgICsgJ10nO1xuICAgIH07XG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHN1Y2Nlc3MobWF0Y2hlZCwgc3RyKSB7XG4gICAgbGV0IHJlc3VsdCA9IHBhaXIobWF0Y2hlZCwgc3RyKTtcbiAgICByZXN1bHQudHlwZSA9ICdzdWNjZXNzJztcbiAgICByZXR1cm4gcmVzdWx0O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZmFpbHVyZShwYXJzZXJMYWJlbCwgZXJyb3JNc2cpIHtcbiAgICBsZXQgcmVzdWx0ID0gcGFpcihwYXJzZXJMYWJlbCwgZXJyb3JNc2cpO1xuICAgIHJlc3VsdC50eXBlID0gJ2ZhaWx1cmUnO1xuICAgIHJldHVybiByZXN1bHQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzb21lKHZhbHVlKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgdHlwZTogJ3NvbWUnLFxuICAgICAgICB2YWwoKSB7XG4gICAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgIH0sXG4gICAgICAgIHRvU3RyaW5nKCkge1xuICAgICAgICAgICAgcmV0dXJuIGBzb21lKCR7dmFsdWV9KWA7XG4gICAgICAgIH1cbiAgICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbm9uZSgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICB0eXBlOiAnbm9uZScsXG4gICAgICAgIHZhbCgpIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9LFxuICAgICAgICB0b1N0cmluZygpIHtcbiAgICAgICAgICAgIHJldHVybiAnbm9uZSgpJztcbiAgICAgICAgfVxuICAgIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBKVmFsdWUoKSB7XG59XG5KVmFsdWUucHJvdG90eXBlLmlzSlZhbHVlID0gdHJ1ZTtcblxuZnVuY3Rpb24gSlN0cmluZyhzdHIpIHtcbiAgICByZXR1cm4gbmV3IF9qc3RyaW5nKHN0cik7XG59XG5cbmZ1bmN0aW9uIF9qc3RyaW5nKHN0cikge1xuICAgIGlmICh0eXBlb2Ygc3RyICE9PSAnc3RyaW5nJykgdGhyb3cgbmV3IEVycm9yKCdKU3RyaW5nOiBpbnZhbGlkIHZhbHVlJyk7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsICd2YWx1ZScsIHt2YWx1ZTogc3RyLCB3cml0YWJsZTogZmFsc2V9KTtcbn1cbl9qc3RyaW5nLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoSlZhbHVlLnByb3RvdHlwZSk7XG5fanN0cmluZy5wcm90b3R5cGUuaXNKU3RyaW5nID0gdHJ1ZTtcbl9qc3RyaW5nLnByb3RvdHlwZS50eXBlID0gJ2pzdHJpbmcnO1xuX2pzdHJpbmcucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiAnSlN0cmluZygnICsgdGhpcy52YWx1ZS50b1N0cmluZygpICsgJyknO1xufTtcblxuSlZhbHVlLkpTdHJpbmcgPSBKU3RyaW5nO1xuSlZhbHVlLnByb3RvdHlwZS5KU3RyaW5nID0gSlZhbHVlLkpTdHJpbmc7XG5cbmZ1bmN0aW9uIEpOdW1iZXIoZmxvYXQpIHtcbiAgICByZXR1cm4gbmV3IF9qbnVtYmVyKGZsb2F0KTtcbn1cblxuZnVuY3Rpb24gX2pudW1iZXIoZmxvYXQpIHtcbiAgICBpZiAodHlwZW9mIGZsb2F0ICE9PSAnbnVtYmVyJ1xuICAgICAgICB8fCBpc05hTihmbG9hdCkpIHRocm93IG5ldyBFcnJvcignSk51bWJlcjogaW52YWxpZCB2YWx1ZScpO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCAndmFsdWUnLCB7dmFsdWU6IGZsb2F0LCB3cml0YWJsZTogZmFsc2V9KTtcbn1cbl9qbnVtYmVyLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoSlZhbHVlLnByb3RvdHlwZSk7XG5fam51bWJlci5wcm90b3R5cGUuaXNKTnVtYmVyID0gdHJ1ZTtcbl9qbnVtYmVyLnByb3RvdHlwZS50eXBlID0gJ2pudW1iZXInO1xuX2pudW1iZXIucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiAnSk51bWJlcignICsgdGhpcy52YWx1ZS50b1N0cmluZygpICsgJyknO1xufTtcblxuSlZhbHVlLkpOdW1iZXIgPSBKTnVtYmVyO1xuSlZhbHVlLnByb3RvdHlwZS5KTnVtYmVyID0gSlZhbHVlLkpOdW1iZXI7XG5cbmZ1bmN0aW9uIEpCb29sKGJvb2wpIHtcbiAgICByZXR1cm4gbmV3IF9qYm9vbChib29sKTtcbn1cblxuZnVuY3Rpb24gX2pib29sKGJvb2wpIHtcbiAgICBpZiAodHlwZW9mIGJvb2wgIT09ICdib29sZWFuJykgdGhyb3cgbmV3IEVycm9yKCdKQm9vbDogaW52YWxpZCB2YWx1ZScpO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCAndmFsdWUnLCB7dmFsdWU6IGJvb2wsIHdyaXRhYmxlOiBmYWxzZX0pO1xufVxuX2pib29sLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoSlZhbHVlLnByb3RvdHlwZSk7XG5famJvb2wucHJvdG90eXBlLmlzSkJvb2wgPSB0cnVlO1xuX2pib29sLnByb3RvdHlwZS50eXBlID0gJ2pib29sJztcbl9qYm9vbC5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuICdKQm9vbCgnICsgdGhpcy52YWx1ZS50b1N0cmluZygpICsgJyknO1xufTtcblxuSlZhbHVlLkpCb29sID0gSkJvb2w7XG5KVmFsdWUucHJvdG90eXBlLkpCb29sID0gSlZhbHVlLkpCb29sO1xuXG5mdW5jdGlvbiBKTnVsbChudWxsVmFsdWUpIHtcbiAgICByZXR1cm4gbmV3IF9qbnVsbChudWxsVmFsdWUpO1xufVxuXG5mdW5jdGlvbiBfam51bGwobnVsbFZhbHVlKSB7XG4gICAgaWYgKG51bGxWYWx1ZSAhPT0gbnVsbCkgdGhyb3cgbmV3IEVycm9yKCdKTnVsbDogaW52YWxpZCB2YWx1ZScpO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCAndmFsdWUnLCB7dmFsdWU6IG51bGxWYWx1ZSwgd3JpdGFibGU6IGZhbHNlfSk7XG59XG5fam51bGwucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShKVmFsdWUucHJvdG90eXBlKTtcbl9qbnVsbC5wcm90b3R5cGUuaXNKTnVsbCA9IHRydWU7XG5fam51bGwucHJvdG90eXBlLnR5cGUgPSAnam51bGwnO1xuX2pudWxsLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gJ0pOdWxsKG51bGwpJztcbn07XG5cbkpWYWx1ZS5KTnVsbCA9IEpOdWxsO1xuSlZhbHVlLnByb3RvdHlwZS5KTnVsbCA9IEpWYWx1ZS5KTnVsbDtcblxuZnVuY3Rpb24gSkFycmF5KC4uLmpWYWx1ZXMpIHtcbiAgICByZXR1cm4gbmV3IF9qYXJyYXkoLi4ualZhbHVlcyk7XG59XG5cbi8vIFRPRE8gbWFrZSBpdCB3aXRoIGl0ZXJhdG9yIGFuZCBldmVyeXRoaW5nXG5mdW5jdGlvbiBfamFycmF5KC4uLmpWYWx1ZXMpIHsgIC8vIGFyZ3MgYmVjb21lIGEgUkVBTCBhcnJheVxuICAgIGlmICh0eXBlb2YgalZhbHVlID09PSAndW5kZWZpbmVkJykgeyAvLyBlbXB0eSBKU09OIGFycmF5XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCAndmFsdWUnLCB7dmFsdWU6IFtdLCB3cml0YWJsZTogZmFsc2V9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBpZiAoalZhbHVlcy5zb21lKGp2YWwgPT4gKCFqdmFsLmlzSlZhbHVlKSkpIHRocm93IG5ldyBFcnJvcignSkFycmF5OiBpbnZhbGlkIGNvbnRlbnQnKTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsICd2YWx1ZScsIHt2YWx1ZTogWy4uLmpWYWx1ZXNdLCB3cml0YWJsZTogZmFsc2V9KTtcbiAgICB9XG59XG5famFycmF5LnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoSlZhbHVlLnByb3RvdHlwZSk7XG5famFycmF5LnByb3RvdHlwZS5pc0pBcnJheSA9IHRydWU7XG5famFycmF5LnByb3RvdHlwZS50eXBlID0gJ2phcnJheSc7XG5famFycmF5LnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gJ0pBcnJheShbJyArIHRoaXMudmFsdWUucmVkdWNlKChhY2MsIGN1cnIpID0+IGFjYyArIGN1cnIgKyAnLCcsICcnKSArICddKSc7XG59O1xuXG5KVmFsdWUuSkFycmF5ID0gSkFycmF5O1xuSlZhbHVlLnByb3RvdHlwZS5KQXJyYXkgPSBKVmFsdWUuSkFycmF5O1xuXG5mdW5jdGlvbiBKT2JqZWN0KC4uLnBhaXJzKSB7XG4gICAgcmV0dXJuIG5ldyBfam9iamVjdCguLi5wYWlycyk7XG59XG5cbmZ1bmN0aW9uIF9qb2JqZWN0KC4uLnBhaXJzKSB7XG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XG4gICAgaWYgKHBhaXJzLnNvbWUocGFpciA9PiB7XG4gICAgICAgICAgICByZXR1cm4gKCFwYWlyLmlzUGFpclxuICAgICAgICAgICAgfHwgdHlwZW9mIHBhaXJbMF0gIT09ICdzdHJpbmcnXG4gICAgICAgICAgICB8fCAhcGFpclsxXS5pc0pWYWx1ZSk7XG4gICAgICAgIH0pKSB0aHJvdyBuZXcgRXJyb3IoJ0pPYmplY3Q6IGludmFsaWQgY29udGVudCcpO1xuICAgIHBhaXJzLmZvckVhY2goKFtrZXksIHZhbHVlXSkgPT4ge1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoc2VsZiwga2V5LCB7dmFsdWU6IHZhbHVlLCB3cml0YWJsZTogZmFsc2V9KTtcbiAgICB9KTtcbn1cbl9qb2JqZWN0LnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoSlZhbHVlLnByb3RvdHlwZSk7XG5fam9iamVjdC5wcm90b3R5cGUuaXNKT2JqZWN0ID0gdHJ1ZTtcbl9qb2JqZWN0LnByb3RvdHlwZS50eXBlID0gJ2pvYmplY3QnO1xuX2pvYmplY3QucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiAnSk9iamVjdCh7JyArIE9CSiArICd9KSc7XG59O1xuXG5KVmFsdWUuSk9iamVjdCA9IEpPYmplY3Q7XG5KVmFsdWUucHJvdG90eXBlLkpPYmplY3QgPSBKVmFsdWUuSk9iamVjdDtcbiJdfQ==