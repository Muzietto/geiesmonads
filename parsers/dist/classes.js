define(['exports', 'maybe', 'util'], function (exports, _maybe, _util) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.JValue = JValue;
    exports.Tuple = Tuple;
    exports.Position = Position;
    exports.pair = pair;
    exports.success = success;
    exports.failure = failure;
    exports.some = some;
    exports.none = none;

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

        var needsRowIncrement = this.col === this.rows[this.row].length - 1;
        return times ? incrPosHelper(this, times) : Position(this.rows, needsRowIncrement ? this.row + 1 : this.row, needsRowIncrement ? 0 : this.col + 1);

        function incrPosHelper(pos) {
            var times = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

            if (times === 0) return pos;
            return incrPosHelper(pos.incrPos(), times - 1);
        }
    };
    _position.prototype.decrPos = function () {
        var times = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;

        var needsRowDecrement = this.col === 0;
        return times ? decrPosHelper(this, times) : Position(this.rows, needsRowDecrement ? this.row - 1 : this.row, needsRowDecrement ? this.rows[this.row - 1].length - 1 : this.col - 1);

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
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2pzL2NsYXNzZXMuanMiXSwibmFtZXMiOlsiSlZhbHVlIiwiVHVwbGUiLCJQb3NpdGlvbiIsInBhaXIiLCJzdWNjZXNzIiwiZmFpbHVyZSIsInNvbWUiLCJub25lIiwidG9TdHJpbmciLCJBcnJheSIsInByb3RvdHlwZSIsImFwcGx5IiwiaXNKVmFsdWUiLCJKU3RyaW5nIiwic3RyIiwiX2pzdHJpbmciLCJFcnJvciIsIk9iamVjdCIsImRlZmluZVByb3BlcnR5IiwidmFsdWUiLCJ3cml0YWJsZSIsImNyZWF0ZSIsImlzSlN0cmluZyIsInR5cGUiLCJKTnVtYmVyIiwiZmxvYXQiLCJfam51bWJlciIsImlzTmFOIiwiaXNKTnVtYmVyIiwiSkJvb2wiLCJib29sIiwiX2pib29sIiwiaXNKQm9vbCIsIkpOdWxsIiwibnVsbFZhbHVlIiwiX2pudWxsIiwiaXNKTnVsbCIsIkpBcnJheSIsImpWYWx1ZXMiLCJfamFycmF5IiwialZhbHVlIiwianZhbCIsImlzSkFycmF5IiwicmVkdWNlIiwiYWNjIiwiY3VyciIsIkpPYmplY3QiLCJwYWlycyIsIl9qb2JqZWN0Iiwic2VsZiIsImlzUGFpciIsImZvckVhY2giLCJrZXkiLCJpc0pPYmplY3QiLCJPQkoiLCJQYWlyIiwiYSIsImIiLCJyZXN1bHQiLCJfcGFpciIsIlN5bWJvbCIsIml0ZXJhdG9yIiwiVHJpcGxlIiwiYyIsIl90cmlwbGUiLCJpc1RyaXBsZSIsInJvd3MiLCJyb3ciLCJjb2wiLCJfcG9zaXRpb24iLCJmcm9tVGV4dCIsInRleHQiLCJzcGxpdCIsIm1hcCIsImlzUG9zaXRpb24iLCJjaGFyIiwiTWF5YmUiLCJOb3RoaW5nIiwibmV3UmVzdWx0VmFsdWUiLCJKdXN0IiwiZXJyIiwiaW5jclBvcyIsInRpbWVzIiwibmVlZHNSb3dJbmNyZW1lbnQiLCJsZW5ndGgiLCJpbmNyUG9zSGVscGVyIiwicG9zIiwiZGVjclBvcyIsIm5lZWRzUm93RGVjcmVtZW50IiwiZGVjclBvc0hlbHBlciIsInJlc3QiLCJyZXN0X2hlbHBlciIsImpvaW4iLCJuZXh0IiwiaXNOb3RoaW5nIiwiY29uY2F0IiwieCIsInkiLCJtYXRjaGVkIiwicGFyc2VyTGFiZWwiLCJlcnJvck1zZyIsInZhbCJdLCJtYXBwaW5ncyI6Ijs7Ozs7O1lBWWdCQSxNLEdBQUFBLE07WUE4SEFDLEssR0FBQUEsSztZQW1EQUMsUSxHQUFBQSxRO1lBNEVBQyxJLEdBQUFBLEk7WUFhQUMsTyxHQUFBQSxPO1lBTUFDLE8sR0FBQUEsTztZQU1BQyxJLEdBQUFBLEk7WUFZQUMsSSxHQUFBQSxJOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBeFNoQixRQUFNQyxXQUFXQyxNQUFNQyxTQUFOLENBQWdCRixRQUFqQzs7QUFFQUMsVUFBTUMsU0FBTixDQUFnQkYsUUFBaEIsR0FBMkIsWUFBWTtBQUNuQyxlQUFPLE1BQU1BLFNBQVNHLEtBQVQsQ0FBZSxJQUFmLENBQU4sR0FBNkIsR0FBcEM7QUFDSCxLQUZEOztBQUlPLGFBQVNYLE1BQVQsR0FBa0IsQ0FDeEI7QUFDREEsV0FBT1UsU0FBUCxDQUFpQkUsUUFBakIsR0FBNEIsSUFBNUI7O0FBRUEsYUFBU0MsT0FBVCxDQUFpQkMsR0FBakIsRUFBc0I7QUFDbEIsZUFBTyxJQUFJQyxRQUFKLENBQWFELEdBQWIsQ0FBUDtBQUNIOztBQUVELGFBQVNDLFFBQVQsQ0FBa0JELEdBQWxCLEVBQXVCO0FBQ25CLFlBQUksT0FBT0EsR0FBUCxLQUFlLFFBQW5CLEVBQTZCLE1BQU0sSUFBSUUsS0FBSixDQUFVLHdCQUFWLENBQU47QUFDN0JDLGVBQU9DLGNBQVAsQ0FBc0IsSUFBdEIsRUFBNEIsT0FBNUIsRUFBcUMsRUFBQ0MsT0FBT0wsR0FBUixFQUFhTSxVQUFVLEtBQXZCLEVBQXJDO0FBQ0g7QUFDREwsYUFBU0wsU0FBVCxHQUFxQk8sT0FBT0ksTUFBUCxDQUFjckIsT0FBT1UsU0FBckIsQ0FBckI7QUFDQUssYUFBU0wsU0FBVCxDQUFtQlksU0FBbkIsR0FBK0IsSUFBL0I7QUFDQVAsYUFBU0ws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QUFULENBQWNhLEtBQWQsRUFBcUI7QUFDeEIsZUFBTztBQUNISSxrQkFBTSxNQURIO0FBRUg4RSxlQUZHLGlCQUVHO0FBQ0YsdUJBQU9sRixLQUFQO0FBQ0gsYUFKRTtBQUtIWCxvQkFMRyxzQkFLUTtBQUNQLGlDQUFlVyxLQUFmO0FBQ0g7QUFQRSxTQUFQO0FBU0g7O0FBRU0sYUFBU1osSUFBVCxHQUFnQjtBQUNuQixlQUFPO0FBQ0hnQixrQkFBTSxNQURIO0FBRUg4RSxlQUZHLGlCQUVHO0FBQ0YsdUJBQU8sSUFBUDtBQUNILGFBSkU7QUFLSDdGLG9CQUxHLHNCQUtRO0FBQ1AsdUJBQU8sUUFBUDtBQUNIO0FBUEUsU0FBUDtBQVNIIiwiZmlsZSI6ImNsYXNzZXMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge01heWJlfSBmcm9tICdtYXliZSc7XG5cbmltcG9ydCB7XG4gICAgaXNQYWlyLFxufSBmcm9tICd1dGlsJztcblxuY29uc3QgdG9TdHJpbmcgPSBBcnJheS5wcm90b3R5cGUudG9TdHJpbmc7XG5cbkFycmF5LnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gJ1snICsgdG9TdHJpbmcuYXBwbHkodGhpcykgKyAnXSc7XG59O1xuXG5leHBvcnQgZnVuY3Rpb24gSlZhbHVlKCkge1xufVxuSlZhbHVlLnByb3RvdHlwZS5pc0pWYWx1ZSA9IHRydWU7XG5cbmZ1bmN0aW9uIEpTdHJpbmcoc3RyKSB7XG4gICAgcmV0dXJuIG5ldyBfanN0cmluZyhzdHIpO1xufVxuXG5mdW5jdGlvbiBfanN0cmluZyhzdHIpIHtcbiAgICBpZiAodHlwZW9mIHN0ciAhPT0gJ3N0cmluZycpIHRocm93IG5ldyBFcnJvcignSlN0cmluZzogaW52YWxpZCB2YWx1ZScpO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCAndmFsdWUnLCB7dmFsdWU6IHN0ciwgd3JpdGFibGU6IGZhbHNlfSk7XG59XG5fanN0cmluZy5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKEpWYWx1ZS5wcm90b3R5cGUpO1xuX2pzdHJpbmcucHJvdG90eXBlLmlzSlN0cmluZyA9IHRydWU7XG5fanN0cmluZy5wcm90b3R5cGUudHlwZSA9ICdqc3RyaW5nJztcbl9qc3RyaW5nLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gJ0pTdHJpbmcoJyArIHRoaXMudmFsdWUudG9TdHJpbmcoKSArICcpJztcbn07XG5cbkpWYWx1ZS5KU3RyaW5nID0gSlN0cmluZztcbkpWYWx1ZS5wcm90b3R5cGUuSlN0cmluZyA9IEpWYWx1ZS5KU3RyaW5nO1xuXG5mdW5jdGlvbiBKTnVtYmVyKGZsb2F0KSB7XG4gICAgcmV0dXJuIG5ldyBfam51bWJlcihmbG9hdCk7XG59XG5cbmZ1bmN0aW9uIF9qbnVtYmVyKGZsb2F0KSB7XG4gICAgaWYgKHR5cGVvZiBmbG9hdCAhPT0gJ251bWJlcidcbiAgICAgICAgfHwgaXNOYU4oZmxvYXQpKSB0aHJvdyBuZXcgRXJyb3IoJ0pOdW1iZXI6IGludmFsaWQgdmFsdWUnKTtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgJ3ZhbHVlJywge3ZhbHVlOiBmbG9hdCwgd3JpdGFibGU6IGZhbHNlfSk7XG59XG5fam51bWJlci5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKEpWYWx1ZS5wcm90b3R5cGUpO1xuX2pudW1iZXIucHJvdG90eXBlLmlzSk51bWJlciA9IHRydWU7XG5fam51bWJlci5wcm90b3R5cGUudHlwZSA9ICdqbnVtYmVyJztcbl9qbnVtYmVyLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gJ0pOdW1iZXIoJyArIHRoaXMudmFsdWUudG9TdHJpbmcoKSArICcpJztcbn07XG5cbkpWYWx1ZS5KTnVtYmVyID0gSk51bWJlcjtcbkpWYWx1ZS5wcm90b3R5cGUuSk51bWJlciA9IEpWYWx1ZS5KTnVtYmVyO1xuXG5mdW5jdGlvbiBKQm9vbChib29sKSB7XG4gICAgcmV0dXJuIG5ldyBfamJvb2woYm9vbCk7XG59XG5cbmZ1bmN0aW9uIF9qYm9vbChib29sKSB7XG4gICAgaWYgKHR5cGVvZiBib29sICE9PSAnYm9vbGVhbicpIHRocm93IG5ldyBFcnJvcignSkJvb2w6IGludmFsaWQgdmFsdWUnKTtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgJ3ZhbHVlJywge3ZhbHVlOiBib29sLCB3cml0YWJsZTogZmFsc2V9KTtcbn1cbl9qYm9vbC5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKEpWYWx1ZS5wcm90b3R5cGUpO1xuX2pib29sLnByb3RvdHlwZS5pc0pCb29sID0gdHJ1ZTtcbl9qYm9vbC5wcm90b3R5cGUudHlwZSA9ICdqYm9vbCc7XG5famJvb2wucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiAnSkJvb2woJyArIHRoaXMudmFsdWUudG9TdHJpbmcoKSArICcpJztcbn07XG5cbkpWYWx1ZS5KQm9vbCA9IEpCb29sO1xuSlZhbHVlLnByb3RvdHlwZS5KQm9vbCA9IEpWYWx1ZS5KQm9vbDtcblxuZnVuY3Rpb24gSk51bGwobnVsbFZhbHVlKSB7XG4gICAgcmV0dXJuIG5ldyBfam51bGwobnVsbFZhbHVlKTtcbn1cblxuZnVuY3Rpb24gX2pudWxsKG51bGxWYWx1ZSkge1xuICAgIGlmIChudWxsVmFsdWUgIT09IG51bGwpIHRocm93IG5ldyBFcnJvcignSk51bGw6IGludmFsaWQgdmFsdWUnKTtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgJ3ZhbHVlJywge3ZhbHVlOiBudWxsVmFsdWUsIHdyaXRhYmxlOiBmYWxzZX0pO1xufVxuX2pudWxsLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoSlZhbHVlLnByb3RvdHlwZSk7XG5fam51bGwucHJvdG90eXBlLmlzSk51bGwgPSB0cnVlO1xuX2pudWxsLnByb3RvdHlwZS50eXBlID0gJ2pudWxsJztcbl9qbnVsbC5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuICdKTnVsbChudWxsKSc7XG59O1xuXG5KVmFsdWUuSk51bGwgPSBKTnVsbDtcbkpWYWx1ZS5wcm90b3R5cGUuSk51bGwgPSBKVmFsdWUuSk51bGw7XG5cbmZ1bmN0aW9uIEpBcnJheSguLi5qVmFsdWVzKSB7XG4gICAgcmV0dXJuIG5ldyBfamFycmF5KC4uLmpWYWx1ZXMpO1xufVxuXG4vLyBUT0RPIG1ha2UgaXQgd2l0aCBpdGVyYXRvciBhbmQgZXZlcnl0aGluZ1xuZnVuY3Rpb24gX2phcnJheSguLi5qVmFsdWVzKSB7ICAvLyBhcmdzIGJlY29tZSBhIFJFQUwgYXJyYXlcbiAgICBpZiAodHlwZW9mIGpWYWx1ZSA9PT0gJ3VuZGVmaW5lZCcpIHsgLy8gZW1wdHkgSlNPTiBhcnJheVxuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgJ3ZhbHVlJywge3ZhbHVlOiBbXSwgd3JpdGFibGU6IGZhbHNlfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKGpWYWx1ZXMuc29tZShqdmFsID0+ICghanZhbC5pc0pWYWx1ZSkpKSB0aHJvdyBuZXcgRXJyb3IoJ0pBcnJheTogaW52YWxpZCBjb250ZW50Jyk7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCAndmFsdWUnLCB7dmFsdWU6IFsuLi5qVmFsdWVzXSwgd3JpdGFibGU6IGZhbHNlfSk7XG4gICAgfVxufVxuX2phcnJheS5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKEpWYWx1ZS5wcm90b3R5cGUpO1xuX2phcnJheS5wcm90b3R5cGUuaXNKQXJyYXkgPSB0cnVlO1xuX2phcnJheS5wcm90b3R5cGUudHlwZSA9ICdqYXJyYXknO1xuX2phcnJheS5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuICdKQXJyYXkoWycgKyB0aGlzLnZhbHVlLnJlZHVjZSgoYWNjLCBjdXJyKSA9PiBhY2MgKyBjdXJyICsgJywnLCAnJykgKyAnXSknO1xufTtcblxuSlZhbHVlLkpBcnJheSA9IEpBcnJheTtcbkpWYWx1ZS5wcm90b3R5cGUuSkFycmF5ID0gSlZhbHVlLkpBcnJheTtcblxuZnVuY3Rpb24gSk9iamVjdCguLi5wYWlycykge1xuICAgIHJldHVybiBuZXcgX2pvYmplY3QoLi4ucGFpcnMpO1xufVxuXG5mdW5jdGlvbiBfam9iamVjdCguLi5wYWlycykge1xuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuICAgIGlmIChwYWlycy5zb21lKHBhaXIgPT4ge1xuICAgICAgICAgICAgcmV0dXJuICghcGFpci5pc1BhaXJcbiAgICAgICAgICAgIHx8IHR5cGVvZiBwYWlyWzBdICE9PSAnc3RyaW5nJ1xuICAgICAgICAgICAgfHwgIXBhaXJbMV0uaXNKVmFsdWUpO1xuICAgICAgICB9KSkgdGhyb3cgbmV3IEVycm9yKCdKT2JqZWN0OiBpbnZhbGlkIGNvbnRlbnQnKTtcbiAgICBwYWlycy5mb3JFYWNoKChba2V5LCB2YWx1ZV0pID0+IHtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHNlbGYsIGtleSwge3ZhbHVlOiB2YWx1ZSwgd3JpdGFibGU6IGZhbHNlfSk7XG4gICAgfSk7XG59XG5fam9iamVjdC5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKEpWYWx1ZS5wcm90b3R5cGUpO1xuX2pvYmplY3QucHJvdG90eXBlLmlzSk9iamVjdCA9IHRydWU7XG5fam9iamVjdC5wcm90b3R5cGUudHlwZSA9ICdqb2JqZWN0Jztcbl9qb2JqZWN0LnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gJ0pPYmplY3QoeycgKyBPQkogKyAnfSknO1xufTtcblxuSlZhbHVlLkpPYmplY3QgPSBKT2JqZWN0O1xuSlZhbHVlLnByb3RvdHlwZS5KT2JqZWN0ID0gSlZhbHVlLkpPYmplY3Q7XG5cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5leHBvcnQgZnVuY3Rpb24gVHVwbGUoKSB7XG59XG5cbmZ1bmN0aW9uIFBhaXIoYSwgYikge1xuICAgIGxldCByZXN1bHQgPSBuZXcgX3BhaXIoYSwgYik7XG4gICAgcmVzdWx0W1N5bWJvbC5pdGVyYXRvcl0gPSBmdW5jdGlvbiooKSB7XG4gICAgICAgIHlpZWxkIGE7XG4gICAgICAgIHlpZWxkIGI7XG4gICAgfTtcbiAgICByZXR1cm4gcmVzdWx0O1xufVxuUGFpci5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFR1cGxlLnByb3RvdHlwZSk7XG5cbmZ1bmN0aW9uIF9wYWlyKGEsIGIpIHtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgMCwge3ZhbHVlOiBhLCB3cml0YWJsZTogZmFsc2V9KTtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgMSwge3ZhbHVlOiBiLCB3cml0YWJsZTogZmFsc2V9KTtcbn1cbl9wYWlyLnByb3RvdHlwZS5pc1BhaXIgPSB0cnVlO1xuX3BhaXIucHJvdG90eXBlLnR5cGUgPSAncGFpcic7XG5fcGFpci5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuICdbJyArIHRoaXNbMF0udG9TdHJpbmcoKSArICcsJyArIHRoaXNbMV0udG9TdHJpbmcoKSArICddJztcbn07XG5cbmZ1bmN0aW9uIFRyaXBsZShhLCBiLCBjKSB7XG4gICAgbGV0IHJlc3VsdCA9IG5ldyBfdHJpcGxlKGEsIGIsIGMpO1xuICAgIHJlc3VsdFtTeW1ib2wuaXRlcmF0b3JdID0gZnVuY3Rpb24qKCkge1xuICAgICAgICB5aWVsZCBhO1xuICAgICAgICB5aWVsZCBiO1xuICAgICAgICB5aWVsZCBjO1xuICAgIH07XG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cblRyaXBsZS5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFR1cGxlLnByb3RvdHlwZSk7XG5cbmZ1bmN0aW9uIF90cmlwbGUoYSwgYiwgYykge1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCAwLCB7dmFsdWU6IGEsIHdyaXRhYmxlOiBmYWxzZX0pO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCAxLCB7dmFsdWU6IGIsIHdyaXRhYmxlOiBmYWxzZX0pO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCAyLCB7dmFsdWU6IGMsIHdyaXRhYmxlOiBmYWxzZX0pO1xufVxuX3RyaXBsZS5wcm90b3R5cGUuaXNUcmlwbGUgPSB0cnVlO1xuX3RyaXBsZS5wcm90b3R5cGUudHlwZSA9ICd0cmlwbGUnO1xuX3RyaXBsZS5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuICdbJyArIHRoaXNbMF0udG9TdHJpbmcoKSArICcsJyArIHRoaXNbMV0udG9TdHJpbmcoKSArICcsJyArIHRoaXNbMl0udG9TdHJpbmcoKSArICddJztcbn07XG5cblR1cGxlLlBhaXIgPSBQYWlyO1xuVHVwbGUucHJvdG90eXBlLlBhaXIgPSBQYWlyO1xuXG5UdXBsZS5UcmlwbGUgPSBUcmlwbGU7XG5UdXBsZS5wcm90b3R5cGUuVHJpcGxlID0gVHJpcGxlO1xuXG5leHBvcnQgZnVuY3Rpb24gUG9zaXRpb24ocm93cyA9IFtdLCByb3cgPSAwLCBjb2wgPSAwKSB7XG4gICAgcmV0dXJuIG5ldyBfcG9zaXRpb24ocm93cywgcm93LCBjb2wpO1xufVxuXG4vL1Bvc2l0aW9uLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoe30pO1xuUG9zaXRpb24uZnJvbVRleHQgPSBmdW5jdGlvbiAodGV4dCkge1xuICAgIGNvbnN0IHJvd3MgPSB0ZXh0LnNwbGl0KCdcXG4nKVxuICAgICAgICAubWFwKHJvdyA9PiByb3cuc3BsaXQoJycpKTtcbiAgICByZXR1cm4gbmV3IF9wb3NpdGlvbihyb3dzLCAwLCAwKTtcbn07XG5cbmZ1bmN0aW9uIF9wb3NpdGlvbihyb3dzLCByb3csIGNvbCkge1xuICAgIHRoaXMucm93cyA9IHJvd3M7XG4gICAgdGhpcy5yb3cgPSByb3c7XG4gICAgdGhpcy5jb2wgPSBjb2w7XG59XG5cbl9wb3NpdGlvbi5wcm90b3R5cGUuaXNQb3NpdGlvbiA9IHRydWU7XG5fcG9zaXRpb24ucHJvdG90eXBlLmNoYXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgbGV0IHJlc3VsdCA9IE1heWJlLk5vdGhpbmcoKTtcbiAgICB0cnkge1xuICAgICAgICBjb25zdCBuZXdSZXN1bHRWYWx1ZSA9IHRoaXMucm93c1t0aGlzLnJvd11bdGhpcy5jb2xdO1xuICAgICAgICBpZiAodHlwZW9mIG5ld1Jlc3VsdFZhbHVlICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgcmVzdWx0ID0gTWF5YmUuSnVzdChuZXdSZXN1bHRWYWx1ZSk7XG4gICAgICAgIH1cbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbn07XG5fcG9zaXRpb24ucHJvdG90eXBlLmluY3JQb3MgPSBmdW5jdGlvbiAodGltZXMgPSAwKSB7XG4gICAgY29uc3QgbmVlZHNSb3dJbmNyZW1lbnQgPSAodGhpcy5jb2wgPT09IHRoaXMucm93c1t0aGlzLnJvd10ubGVuZ3RoIC0gMSk7XG4gICAgcmV0dXJuIHRpbWVzXG4gICAgID8gaW5jclBvc0hlbHBlcih0aGlzLCB0aW1lcylcbiAgICAgOiBQb3NpdGlvbihcbiAgICAgICAgdGhpcy5yb3dzLFxuICAgICAgICAobmVlZHNSb3dJbmNyZW1lbnQgPyB0aGlzLnJvdyArIDEgOiB0aGlzLnJvdyksXG4gICAgICAgIChuZWVkc1Jvd0luY3JlbWVudCA/IDAgOiB0aGlzLmNvbCArIDEpXG4gICAgKTtcblxuICAgIGZ1bmN0aW9uIGluY3JQb3NIZWxwZXIocG9zLCB0aW1lcyA9IDApIHtcbiAgICAgIGlmICh0aW1lcyA9PT0gMCkgcmV0dXJuIHBvcztcbiAgICAgIHJldHVybiBpbmNyUG9zSGVscGVyKHBvcy5pbmNyUG9zKCksIHRpbWVzIC0gMSlcbiAgICB9XG59O1xuX3Bvc2l0aW9uLnByb3RvdHlwZS5kZWNyUG9zID0gZnVuY3Rpb24gKHRpbWVzID0gMCkge1xuICAgIGNvbnN0IG5lZWRzUm93RGVjcmVtZW50ID0gKHRoaXMuY29sID09PSAwKTtcbiAgICByZXR1cm4gdGltZXNcbiAgICAgPyBkZWNyUG9zSGVscGVyKHRoaXMsIHRpbWVzKVxuICAgICA6IFBvc2l0aW9uKFxuICAgICAgICB0aGlzLnJvd3MsXG4gICAgICAgIChuZWVkc1Jvd0RlY3JlbWVudCA/IHRoaXMucm93IC0gMSA6IHRoaXMucm93KSxcbiAgICAgICAgKG5lZWRzUm93RGVjcmVtZW50ID8gdGhpcy5yb3dzW3RoaXMucm93IC0xXS5sZW5ndGggLSAxIDogdGhpcy5jb2wgLSAxKVxuICAgICk7XG5cbiAgICBmdW5jdGlvbiBkZWNyUG9zSGVscGVyKHBvcywgdGltZXMgPSAwKSB7XG4gICAgICBpZiAodGltZXMgPT09IDApIHJldHVybiBwb3M7XG4gICAgICByZXR1cm4gZGVjclBvc0hlbHBlcihwb3MuZGVjclBvcygpLCB0aW1lcyAtIDEpXG4gICAgfVxufTtcbl9wb3NpdGlvbi5wcm90b3R5cGUucmVzdCA9IGZ1bmN0aW9uICgpIHtcbiAgICBjb25zdCBzZWxmID0gdGhpcztcbiAgICByZXR1cm4gcmVzdF9oZWxwZXIoKS5qb2luKCcnKTtcbiAgICBmdW5jdGlvbiByZXN0X2hlbHBlcigpIHtcbiAgICAgICAgY29uc3QgbmV4dCA9IHNlbGYuY2hhcigpO1xuICAgICAgICBpZiAobmV4dC5pc05vdGhpbmcpIHJldHVybiBbXTtcbiAgICAgICAgcmV0dXJuIFtuZXh0LnZhbHVlXS5jb25jYXQoc2VsZi5pbmNyUG9zKCkucmVzdCgpKTtcbiAgICB9XG59O1xuX3Bvc2l0aW9uLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gJ3Jvdz0nICsgdGhpcy5yb3dcbiAgICAgICAgKyAnO2NvbD0nICsgdGhpcy5jb2xcbiAgICAgICAgKyAnO3Jlc3Q9JyArIHRoaXMucmVzdCgpO1xufTtcblxuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gZGVwcmVjYXRlZCBpbiBmYXZvdXIgb2YgVHVwbGUsIGRhdGEuTWF5YmUgYW5kIGRhdGEuVmFsaWRhdGlvblxuZXhwb3J0IGZ1bmN0aW9uIHBhaXIoeCwgeSkge1xuICAgIGxldCByZXN1bHQgPSBbeCwgeV07XG4gICAgcmVzdWx0LnR5cGUgPSAncGFpcic7XG4gICAgcmVzdWx0LnRvU3RyaW5nID0gKCkgPT4ge1xuICAgICAgICByZXR1cm4gJ1snXG4gICAgICAgICAgICArIChpc1BhaXIocmVzdWx0WzBdKSA/IHJlc3VsdFswXS50b1N0cmluZygpIDogcmVzdWx0WzBdKVxuICAgICAgICAgICAgKyAnLCdcbiAgICAgICAgICAgICsgKGlzUGFpcihyZXN1bHRbMV0pID8gcmVzdWx0WzFdLnRvU3RyaW5nKCkgOiByZXN1bHRbMV0pXG4gICAgICAgICAgICArICddJztcbiAgICB9O1xuICAgIHJldHVybiByZXN1bHQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzdWNjZXNzKG1hdGNoZWQsIHN0cikge1xuICAgIGxldCByZXN1bHQgPSBwYWlyKG1hdGNoZWQsIHN0cik7XG4gICAgcmVzdWx0LnR5cGUgPSAnc3VjY2Vzcyc7XG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGZhaWx1cmUocGFyc2VyTGFiZWwsIGVycm9yTXNnKSB7XG4gICAgbGV0IHJlc3VsdCA9IHBhaXIocGFyc2VyTGFiZWwsIGVycm9yTXNnKTtcbiAgICByZXN1bHQudHlwZSA9ICdmYWlsdXJlJztcbiAgICByZXR1cm4gcmVzdWx0O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc29tZSh2YWx1ZSkge1xuICAgIHJldHVybiB7XG4gICAgICAgIHR5cGU6ICdzb21lJyxcbiAgICAgICAgdmFsKCkge1xuICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICB9LFxuICAgICAgICB0b1N0cmluZygpIHtcbiAgICAgICAgICAgIHJldHVybiBgc29tZSgke3ZhbHVlfSlgO1xuICAgICAgICB9XG4gICAgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG5vbmUoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgdHlwZTogJ25vbmUnLFxuICAgICAgICB2YWwoKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfSxcbiAgICAgICAgdG9TdHJpbmcoKSB7XG4gICAgICAgICAgICByZXR1cm4gJ25vbmUoKSc7XG4gICAgICAgIH1cbiAgICB9O1xufVxuIl19