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
        for (var _len2 = arguments.length, jValues = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
            jValues[_key2] = arguments[_key2];
        }

        // args become a REAL array
        if (jValues.some(function (jval) {
            return !jval.isJValue;
        })) throw new Error('JArray: invalid content');
        Object.defineProperty(this, 'value', { value: [].concat(jValues), writable: false });
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
        var needRowIncrement = this.col === this.rows[this.row].length - 1;
        return Position(this.rows, needRowIncrement ? this.row + 1 : this.row, needRowIncrement ? 0 : this.col + 1);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2pzL2NsYXNzZXMuanMiXSwibmFtZXMiOlsiSlZhbHVlIiwiVHVwbGUiLCJQb3NpdGlvbiIsInBhaXIiLCJzdWNjZXNzIiwiZmFpbHVyZSIsInNvbWUiLCJub25lIiwidG9TdHJpbmciLCJBcnJheSIsInByb3RvdHlwZSIsImFwcGx5IiwiaXNKVmFsdWUiLCJKU3RyaW5nIiwic3RyIiwiX2pzdHJpbmciLCJFcnJvciIsIk9iamVjdCIsImRlZmluZVByb3BlcnR5IiwidmFsdWUiLCJ3cml0YWJsZSIsImNyZWF0ZSIsImlzSlN0cmluZyIsInR5cGUiLCJKTnVtYmVyIiwiZmxvYXQiLCJfam51bWJlciIsImlzTmFOIiwiaXNKTnVtYmVyIiwiSkJvb2wiLCJib29sIiwiX2pib29sIiwiaXNKQm9vbCIsIkpOdWxsIiwibnVsbFZhbHVlIiwiX2pudWxsIiwiaXNKTnVsbCIsIkpBcnJheSIsImpWYWx1ZXMiLCJfamFycmF5IiwianZhbCIsImlzSkFycmF5IiwicmVkdWNlIiwiYWNjIiwiY3VyciIsIkpPYmplY3QiLCJwYWlycyIsIl9qb2JqZWN0Iiwic2VsZiIsImlzUGFpciIsImZvckVhY2giLCJrZXkiLCJpc0pPYmplY3QiLCJPQkoiLCJQYWlyIiwiYSIsImIiLCJyZXN1bHQiLCJfcGFpciIsIlN5bWJvbCIsIml0ZXJhdG9yIiwiVHJpcGxlIiwiYyIsIl90cmlwbGUiLCJpc1RyaXBsZSIsInJvd3MiLCJyb3ciLCJjb2wiLCJfcG9zaXRpb24iLCJmcm9tVGV4dCIsInRleHQiLCJzcGxpdCIsIm1hcCIsImlzUG9zaXRpb24iLCJjaGFyIiwiTm90aGluZyIsIm5ld1Jlc3VsdFZhbHVlIiwiSnVzdCIsImVyciIsImluY3JQb3MiLCJuZWVkUm93SW5jcmVtZW50IiwibGVuZ3RoIiwicmVzdCIsInJlc3RfaGVscGVyIiwiam9pbiIsIm5leHQiLCJpc05vdGhpbmciLCJjb25jYXQiLCJ4IiwieSIsIm1hdGNoZWQiLCJwYXJzZXJMYWJlbCIsImVycm9yTXNnIiwidmFs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QUFmO0FBQ0g7QUFQRSxTQUFQO0FBU0g7O0FBRU0sYUFBU1osSUFBVCxHQUFnQjtBQUNuQixlQUFPO0FBQ0hnQixrQkFBTSxNQURIO0FBRUhzRSxlQUZHLGlCQUVHO0FBQ0YsdUJBQU8sSUFBUDtBQUNILGFBSkU7QUFLSHJGLG9CQUxHLHNCQUtRO0FBQ1AsdUJBQU8sUUFBUDtBQUNIO0FBUEUsU0FBUDtBQVNIIiwiZmlsZSI6ImNsYXNzZXMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge01heWJlfSBmcm9tICdtYXliZSc7XG5cbmltcG9ydCB7XG4gICAgaXNQYWlyLFxufSBmcm9tICd1dGlsJztcblxuY29uc3QgdG9TdHJpbmcgPSBBcnJheS5wcm90b3R5cGUudG9TdHJpbmc7XG5cbkFycmF5LnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gJ1snICsgdG9TdHJpbmcuYXBwbHkodGhpcykgKyAnXSc7XG59O1xuXG5leHBvcnQgZnVuY3Rpb24gSlZhbHVlKCkge1xufVxuSlZhbHVlLnByb3RvdHlwZS5pc0pWYWx1ZSA9IHRydWU7XG5cbmZ1bmN0aW9uIEpTdHJpbmcoc3RyKSB7XG4gICAgcmV0dXJuIG5ldyBfanN0cmluZyhzdHIpO1xufVxuXG5mdW5jdGlvbiBfanN0cmluZyhzdHIpIHtcbiAgICBpZiAodHlwZW9mIHN0ciAhPT0gJ3N0cmluZycpIHRocm93IG5ldyBFcnJvcignSlN0cmluZzogaW52YWxpZCB2YWx1ZScpO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCAndmFsdWUnLCB7dmFsdWU6IHN0ciwgd3JpdGFibGU6IGZhbHNlfSk7XG59XG5fanN0cmluZy5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKEpWYWx1ZS5wcm90b3R5cGUpO1xuX2pzdHJpbmcucHJvdG90eXBlLmlzSlN0cmluZyA9IHRydWU7XG5fanN0cmluZy5wcm90b3R5cGUudHlwZSA9ICdqc3RyaW5nJztcbl9qc3RyaW5nLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gJ0pTdHJpbmcoJyArIHRoaXMudmFsdWUudG9TdHJpbmcoKSArICcpJztcbn07XG5cbkpWYWx1ZS5KU3RyaW5nID0gSlN0cmluZztcbkpWYWx1ZS5wcm90b3R5cGUuSlN0cmluZyA9IEpWYWx1ZS5KU3RyaW5nO1xuXG5mdW5jdGlvbiBKTnVtYmVyKGZsb2F0KSB7XG4gICAgcmV0dXJuIG5ldyBfam51bWJlcihmbG9hdCk7XG59XG5cbmZ1bmN0aW9uIF9qbnVtYmVyKGZsb2F0KSB7XG4gICAgaWYgKHR5cGVvZiBmbG9hdCAhPT0gJ251bWJlcidcbiAgICAgICAgfHwgaXNOYU4oZmxvYXQpKSB0aHJvdyBuZXcgRXJyb3IoJ0pOdW1iZXI6IGludmFsaWQgdmFsdWUnKTtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgJ3ZhbHVlJywge3ZhbHVlOiBmbG9hdCwgd3JpdGFibGU6IGZhbHNlfSk7XG59XG5fam51bWJlci5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKEpWYWx1ZS5wcm90b3R5cGUpO1xuX2pudW1iZXIucHJvdG90eXBlLmlzSk51bWJlciA9IHRydWU7XG5fam51bWJlci5wcm90b3R5cGUudHlwZSA9ICdqbnVtYmVyJztcbl9qbnVtYmVyLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gJ0pOdW1iZXIoJyArIHRoaXMudmFsdWUudG9TdHJpbmcoKSArICcpJztcbn07XG5cbkpWYWx1ZS5KTnVtYmVyID0gSk51bWJlcjtcbkpWYWx1ZS5wcm90b3R5cGUuSk51bWJlciA9IEpWYWx1ZS5KTnVtYmVyO1xuXG5mdW5jdGlvbiBKQm9vbChib29sKSB7XG4gICAgcmV0dXJuIG5ldyBfamJvb2woYm9vbCk7XG59XG5cbmZ1bmN0aW9uIF9qYm9vbChib29sKSB7XG4gICAgaWYgKHR5cGVvZiBib29sICE9PSAnYm9vbGVhbicpIHRocm93IG5ldyBFcnJvcignSkJvb2w6IGludmFsaWQgdmFsdWUnKTtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgJ3ZhbHVlJywge3ZhbHVlOiBib29sLCB3cml0YWJsZTogZmFsc2V9KTtcbn1cbl9qYm9vbC5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKEpWYWx1ZS5wcm90b3R5cGUpO1xuX2pib29sLnByb3RvdHlwZS5pc0pCb29sID0gdHJ1ZTtcbl9qYm9vbC5wcm90b3R5cGUudHlwZSA9ICdqYm9vbCc7XG5famJvb2wucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiAnSkJvb2woJyArIHRoaXMudmFsdWUudG9TdHJpbmcoKSArICcpJztcbn07XG5cbkpWYWx1ZS5KQm9vbCA9IEpCb29sO1xuSlZhbHVlLnByb3RvdHlwZS5KQm9vbCA9IEpWYWx1ZS5KQm9vbDtcblxuZnVuY3Rpb24gSk51bGwobnVsbFZhbHVlKSB7XG4gICAgcmV0dXJuIG5ldyBfam51bGwobnVsbFZhbHVlKTtcbn1cblxuZnVuY3Rpb24gX2pudWxsKG51bGxWYWx1ZSkge1xuICAgIGlmIChudWxsVmFsdWUgIT09IG51bGwpIHRocm93IG5ldyBFcnJvcignSk51bGw6IGludmFsaWQgdmFsdWUnKTtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgJ3ZhbHVlJywge3ZhbHVlOiBudWxsVmFsdWUsIHdyaXRhYmxlOiBmYWxzZX0pO1xufVxuX2pudWxsLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoSlZhbHVlLnByb3RvdHlwZSk7XG5fam51bGwucHJvdG90eXBlLmlzSk51bGwgPSB0cnVlO1xuX2pudWxsLnByb3RvdHlwZS50eXBlID0gJ2pudWxsJztcbl9qbnVsbC5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuICdKTnVsbChudWxsKSc7XG59O1xuXG5KVmFsdWUuSk51bGwgPSBKTnVsbDtcbkpWYWx1ZS5wcm90b3R5cGUuSk51bGwgPSBKVmFsdWUuSk51bGw7XG5cbmZ1bmN0aW9uIEpBcnJheSguLi5qVmFsdWVzKSB7XG4gICAgcmV0dXJuIG5ldyBfamFycmF5KC4uLmpWYWx1ZXMpO1xufVxuXG4vLyBUT0RPIG1ha2UgaXQgd2l0aCBpdGVyYXRvciBhbmQgZXZlcnl0aGluZ1xuZnVuY3Rpb24gX2phcnJheSguLi5qVmFsdWVzKSB7ICAvLyBhcmdzIGJlY29tZSBhIFJFQUwgYXJyYXlcbiAgICBpZiAoalZhbHVlcy5zb21lKGp2YWwgPT4gKCFqdmFsLmlzSlZhbHVlKSkpIHRocm93IG5ldyBFcnJvcignSkFycmF5OiBpbnZhbGlkIGNvbnRlbnQnKTtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgJ3ZhbHVlJywge3ZhbHVlOiBbLi4ualZhbHVlc10sIHdyaXRhYmxlOiBmYWxzZX0pO1xufVxuX2phcnJheS5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKEpWYWx1ZS5wcm90b3R5cGUpO1xuX2phcnJheS5wcm90b3R5cGUuaXNKQXJyYXkgPSB0cnVlO1xuX2phcnJheS5wcm90b3R5cGUudHlwZSA9ICdqYXJyYXknO1xuX2phcnJheS5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuICdKQXJyYXkoWycgKyB0aGlzLnZhbHVlLnJlZHVjZSgoYWNjLCBjdXJyKSA9PiBhY2MgKyBjdXJyICsgJywnLCAnJykgKyAnXSknO1xufTtcblxuSlZhbHVlLkpBcnJheSA9IEpBcnJheTtcbkpWYWx1ZS5wcm90b3R5cGUuSkFycmF5ID0gSlZhbHVlLkpBcnJheTtcblxuZnVuY3Rpb24gSk9iamVjdCguLi5wYWlycykge1xuICAgIHJldHVybiBuZXcgX2pvYmplY3QoLi4ucGFpcnMpO1xufVxuXG5mdW5jdGlvbiBfam9iamVjdCguLi5wYWlycykge1xuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuICAgIGlmIChwYWlycy5zb21lKHBhaXIgPT4ge1xuICAgICAgICByZXR1cm4gKCFwYWlyLmlzUGFpclxuICAgICAgICAgICAgfHwgdHlwZW9mIHBhaXJbMF0gIT09ICdzdHJpbmcnXG4gICAgICAgICAgICB8fCAhcGFpclsxXS5pc0pWYWx1ZSlcbiAgICAgICAgfSkpIHRocm93IG5ldyBFcnJvcignSk9iamVjdDogaW52YWxpZCBjb250ZW50Jyk7XG4gICAgcGFpcnMuZm9yRWFjaCgoW2tleSwgdmFsdWVdKSA9PiB7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShzZWxmLCBrZXksIHt2YWx1ZTogdmFsdWUsIHdyaXRhYmxlOiBmYWxzZX0pO1xuICAgIH0pO1xufVxuX2pvYmplY3QucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShKVmFsdWUucHJvdG90eXBlKTtcbl9qb2JqZWN0LnByb3RvdHlwZS5pc0pPYmplY3QgPSB0cnVlO1xuX2pvYmplY3QucHJvdG90eXBlLnR5cGUgPSAnam9iamVjdCc7XG5fam9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuICdKT2JqZWN0KHsnICsgT0JKICsgJ30pJztcbn07XG5cbkpWYWx1ZS5KT2JqZWN0ID0gSk9iamVjdDtcbkpWYWx1ZS5wcm90b3R5cGUuSk9iamVjdCA9IEpWYWx1ZS5KT2JqZWN0O1xuXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuZXhwb3J0IGZ1bmN0aW9uIFR1cGxlKCkge1xufVxuXG5mdW5jdGlvbiBQYWlyKGEsIGIpIHtcbiAgICBsZXQgcmVzdWx0ID0gbmV3IF9wYWlyKGEsIGIpO1xuICAgIHJlc3VsdFtTeW1ib2wuaXRlcmF0b3JdID0gZnVuY3Rpb24qKCkge1xuICAgICAgICB5aWVsZCBhO1xuICAgICAgICB5aWVsZCBiO1xuICAgIH07XG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cblBhaXIucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShUdXBsZS5wcm90b3R5cGUpO1xuXG5mdW5jdGlvbiBfcGFpcihhLCBiKSB7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsIDAsIHt2YWx1ZTogYSwgd3JpdGFibGU6IGZhbHNlfSk7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsIDEsIHt2YWx1ZTogYiwgd3JpdGFibGU6IGZhbHNlfSk7XG59XG5fcGFpci5wcm90b3R5cGUuaXNQYWlyID0gdHJ1ZTtcbl9wYWlyLnByb3RvdHlwZS50eXBlID0gJ3BhaXInO1xuX3BhaXIucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiAnWycgKyB0aGlzWzBdLnRvU3RyaW5nKCkgKyAnLCcgKyB0aGlzWzFdLnRvU3RyaW5nKCkgKyAnXSc7XG59O1xuXG5mdW5jdGlvbiBUcmlwbGUoYSwgYiwgYykge1xuICAgIGxldCByZXN1bHQgPSBuZXcgX3RyaXBsZShhLCBiLCBjKTtcbiAgICByZXN1bHRbU3ltYm9sLml0ZXJhdG9yXSA9IGZ1bmN0aW9uKigpIHtcbiAgICAgICAgeWllbGQgYTtcbiAgICAgICAgeWllbGQgYjtcbiAgICAgICAgeWllbGQgYztcbiAgICB9O1xuICAgIHJldHVybiByZXN1bHQ7XG59XG5UcmlwbGUucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShUdXBsZS5wcm90b3R5cGUpO1xuXG5mdW5jdGlvbiBfdHJpcGxlKGEsIGIsIGMpIHtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgMCwge3ZhbHVlOiBhLCB3cml0YWJsZTogZmFsc2V9KTtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgMSwge3ZhbHVlOiBiLCB3cml0YWJsZTogZmFsc2V9KTtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgMiwge3ZhbHVlOiBjLCB3cml0YWJsZTogZmFsc2V9KTtcbn1cbl90cmlwbGUucHJvdG90eXBlLmlzVHJpcGxlID0gdHJ1ZTtcbl90cmlwbGUucHJvdG90eXBlLnR5cGUgPSAndHJpcGxlJztcbl90cmlwbGUucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiAnWycgKyB0aGlzWzBdLnRvU3RyaW5nKCkgKyAnLCcgKyB0aGlzWzFdLnRvU3RyaW5nKCkgKyAnLCcgKyB0aGlzWzJdLnRvU3RyaW5nKCkgKyAnXSc7XG59O1xuXG5UdXBsZS5QYWlyID0gUGFpcjtcblR1cGxlLnByb3RvdHlwZS5QYWlyID0gUGFpcjtcblxuVHVwbGUuVHJpcGxlID0gVHJpcGxlO1xuVHVwbGUucHJvdG90eXBlLlRyaXBsZSA9IFRyaXBsZTtcblxuZXhwb3J0IGZ1bmN0aW9uIFBvc2l0aW9uKHJvd3MgPSBbXSwgcm93ID0gMCwgY29sID0gMCkge1xuICAgIHJldHVybiBuZXcgX3Bvc2l0aW9uKHJvd3MsIHJvdywgY29sKTtcbn1cblxuLy9Qb3NpdGlvbi5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKHt9KTtcblBvc2l0aW9uLmZyb21UZXh0ID0gZnVuY3Rpb24gKHRleHQpIHtcbiAgICBjb25zdCByb3dzID0gdGV4dC5zcGxpdCgnXFxuJylcbiAgICAgICAgLm1hcChyb3cgPT4gcm93LnNwbGl0KCcnKSk7XG4gICAgcmV0dXJuIG5ldyBfcG9zaXRpb24ocm93cywgMCwgMCk7XG59O1xuXG5mdW5jdGlvbiBfcG9zaXRpb24ocm93cywgcm93LCBjb2wpIHtcbiAgICB0aGlzLnJvd3MgPSByb3dzO1xuICAgIHRoaXMucm93ID0gcm93O1xuICAgIHRoaXMuY29sID0gY29sO1xufVxuXG5fcG9zaXRpb24ucHJvdG90eXBlLmlzUG9zaXRpb24gPSB0cnVlO1xuX3Bvc2l0aW9uLnByb3RvdHlwZS5jaGFyID0gZnVuY3Rpb24gKCkge1xuICAgIGxldCByZXN1bHQgPSBNYXliZS5Ob3RoaW5nKCk7XG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgbmV3UmVzdWx0VmFsdWUgPSB0aGlzLnJvd3NbdGhpcy5yb3ddW3RoaXMuY29sXTtcbiAgICAgICAgaWYgKHR5cGVvZiBuZXdSZXN1bHRWYWx1ZSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgIHJlc3VsdCA9IE1heWJlLkp1c3QobmV3UmVzdWx0VmFsdWUpO1xuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG59O1xuX3Bvc2l0aW9uLnByb3RvdHlwZS5pbmNyUG9zID0gZnVuY3Rpb24gKCkge1xuICAgIGNvbnN0IG5lZWRSb3dJbmNyZW1lbnQgPSAodGhpcy5jb2wgPT09IHRoaXMucm93c1t0aGlzLnJvd10ubGVuZ3RoIC0gMSk7XG4gICAgcmV0dXJuIFBvc2l0aW9uKFxuICAgICAgICB0aGlzLnJvd3MsXG4gICAgICAgIChuZWVkUm93SW5jcmVtZW50ID8gdGhpcy5yb3cgKyAxIDogdGhpcy5yb3cpLFxuICAgICAgICAobmVlZFJvd0luY3JlbWVudCA/IDAgOiB0aGlzLmNvbCArIDEpXG4gICAgKTtcbn07XG5fcG9zaXRpb24ucHJvdG90eXBlLnJlc3QgPSBmdW5jdGlvbiAoKSB7XG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XG4gICAgcmV0dXJuIHJlc3RfaGVscGVyKCkuam9pbignJyk7XG4gICAgZnVuY3Rpb24gcmVzdF9oZWxwZXIoKSB7XG4gICAgICAgIGNvbnN0IG5leHQgPSBzZWxmLmNoYXIoKTtcbiAgICAgICAgaWYgKG5leHQuaXNOb3RoaW5nKSByZXR1cm4gW107XG4gICAgICAgIHJldHVybiBbbmV4dC52YWx1ZV0uY29uY2F0KHNlbGYuaW5jclBvcygpLnJlc3QoKSk7XG4gICAgfVxufTtcbl9wb3NpdGlvbi5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuICdyb3c9JyArIHRoaXMucm93XG4gICAgICAgICsgJztjb2w9JyArIHRoaXMuY29sXG4gICAgICAgICsgJztyZXN0PScgKyB0aGlzLnJlc3QoKTtcbn07XG5cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIGRlcHJlY2F0ZWQgaW4gZmF2b3VyIG9mIFR1cGxlLCBkYXRhLk1heWJlIGFuZCBkYXRhLlZhbGlkYXRpb25cbmV4cG9ydCBmdW5jdGlvbiBwYWlyKHgsIHkpIHtcbiAgICBsZXQgcmVzdWx0ID0gW3gsIHldO1xuICAgIHJlc3VsdC50eXBlID0gJ3BhaXInO1xuICAgIHJlc3VsdC50b1N0cmluZyA9ICgpID0+IHtcbiAgICAgICAgcmV0dXJuICdbJ1xuICAgICAgICAgICAgKyAoaXNQYWlyKHJlc3VsdFswXSkgPyByZXN1bHRbMF0udG9TdHJpbmcoKSA6IHJlc3VsdFswXSlcbiAgICAgICAgICAgICsgJywnXG4gICAgICAgICAgICArIChpc1BhaXIocmVzdWx0WzFdKSA/IHJlc3VsdFsxXS50b1N0cmluZygpIDogcmVzdWx0WzFdKVxuICAgICAgICAgICAgKyAnXSc7XG4gICAgfTtcbiAgICByZXR1cm4gcmVzdWx0O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc3VjY2VzcyhtYXRjaGVkLCBzdHIpIHtcbiAgICBsZXQgcmVzdWx0ID0gcGFpcihtYXRjaGVkLCBzdHIpO1xuICAgIHJlc3VsdC50eXBlID0gJ3N1Y2Nlc3MnO1xuICAgIHJldHVybiByZXN1bHQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBmYWlsdXJlKHBhcnNlckxhYmVsLCBlcnJvck1zZykge1xuICAgIGxldCByZXN1bHQgPSBwYWlyKHBhcnNlckxhYmVsLCBlcnJvck1zZyk7XG4gICAgcmVzdWx0LnR5cGUgPSAnZmFpbHVyZSc7XG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNvbWUodmFsdWUpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICB0eXBlOiAnc29tZScsXG4gICAgICAgIHZhbCgpIHtcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgICAgfSxcbiAgICAgICAgdG9TdHJpbmcoKSB7XG4gICAgICAgICAgICByZXR1cm4gYHNvbWUoJHt2YWx1ZX0pYDtcbiAgICAgICAgfVxuICAgIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBub25lKCkge1xuICAgIHJldHVybiB7XG4gICAgICAgIHR5cGU6ICdub25lJyxcbiAgICAgICAgdmFsKCkge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH0sXG4gICAgICAgIHRvU3RyaW5nKCkge1xuICAgICAgICAgICAgcmV0dXJuICdub25lKCknO1xuICAgICAgICB9XG4gICAgfTtcbn1cbiJdfQ==