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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2pzL2NsYXNzZXMuanMiXSwibmFtZXMiOlsiSlZhbHVlIiwiVHVwbGUiLCJQb3NpdGlvbiIsInBhaXIiLCJzdWNjZXNzIiwiZmFpbHVyZSIsInNvbWUiLCJub25lIiwidG9TdHJpbmciLCJBcnJheSIsInByb3RvdHlwZSIsImFwcGx5IiwiaXNKVmFsdWUiLCJKU3RyaW5nIiwic3RyIiwiX2pzdHJpbmciLCJFcnJvciIsIk9iamVjdCIsImRlZmluZVByb3BlcnR5IiwidmFsdWUiLCJ3cml0YWJsZSIsImNyZWF0ZSIsImlzSlN0cmluZyIsInR5cGUiLCJKTnVtYmVyIiwiZmxvYXQiLCJfam51bWJlciIsImlzTmFOIiwiaXNKTnVtYmVyIiwiSkJvb2wiLCJib29sIiwiX2pib29sIiwiaXNKQm9vbCIsIkpOdWxsIiwibnVsbFZhbHVlIiwiX2pudWxsIiwiaXNKTnVsbCIsIkpBcnJheSIsImpWYWx1ZXMiLCJfamFycmF5IiwianZhbCIsImlzSkFycmF5IiwicmVkdWNlIiwiYWNjIiwiY3VyciIsIkpPYmplY3QiLCJwYWlycyIsIl9qb2JqZWN0Iiwic2VsZiIsImlzUGFpciIsImZvckVhY2giLCJrZXkiLCJpc0pPYmplY3QiLCJPQkoiLCJQYWlyIiwiYSIsImIiLCJyZXN1bHQiLCJfcGFpciIsIlN5bWJvbCIsIml0ZXJhdG9yIiwiVHJpcGxlIiwiYyIsIl90cmlwbGUiLCJpc1RyaXBsZSIsInJvd3MiLCJyb3ciLCJjb2wiLCJfcG9zaXRpb24iLCJmcm9tVGV4dCIsInRleHQiLCJzcGxpdCIsIm1hcCIsImlzUG9zaXRpb24iLCJjaGFyIiwiTm90aGluZyIsIm5ld1Jlc3VsdFZhbHVlIiwiSnVzdCIsImVyciIsImluY3JQb3MiLCJuZWVkUm93SW5jcmVtZW50IiwibGVuZ3RoIiwicmVzdCIsInJlc3RfaGVscGVyIiwiam9pbiIsIm5leHQiLCJpc05vdGhpbmciLCJjb25jYXQiLCJ4IiwieSIsIm1hdGNoZWQiLCJwYXJzZXJMYWJlbCIsImVycm9yTXNnIiwidmFs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QUNIO0FBUEUsU0FBUDtBQVNIOztBQUVNLGFBQVNaLElBQVQsR0FBZ0I7QUFDbkIsZUFBTztBQUNIZ0Isa0JBQU0sTUFESDtBQUVIc0UsZUFGRyxpQkFFRztBQUNGLHVCQUFPLElBQVA7QUFDSCxhQUpFO0FBS0hyRixvQkFMRyxzQkFLUTtBQUNQLHVCQUFPLFFBQVA7QUFDSDtBQVBFLFNBQVA7QUFTSCIsImZpbGUiOiJjbGFzc2VzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtNYXliZX0gZnJvbSAnbWF5YmUnO1xuXG5pbXBvcnQge1xuICAgIGlzUGFpcixcbn0gZnJvbSAndXRpbCc7XG5cbmNvbnN0IHRvU3RyaW5nID0gQXJyYXkucHJvdG90eXBlLnRvU3RyaW5nO1xuXG5BcnJheS5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuICdbJyArIHRvU3RyaW5nLmFwcGx5KHRoaXMpICsgJ10nO1xufTtcblxuZXhwb3J0IGZ1bmN0aW9uIEpWYWx1ZSgpIHtcbn1cbkpWYWx1ZS5wcm90b3R5cGUuaXNKVmFsdWUgPSB0cnVlO1xuXG5mdW5jdGlvbiBKU3RyaW5nKHN0cikge1xuICAgIHJldHVybiBuZXcgX2pzdHJpbmcoc3RyKTtcbn1cblxuZnVuY3Rpb24gX2pzdHJpbmcoc3RyKSB7XG4gICAgaWYgKHR5cGVvZiBzdHIgIT09ICdzdHJpbmcnKSB0aHJvdyBuZXcgRXJyb3IoJ0pTdHJpbmc6IGludmFsaWQgdmFsdWUnKTtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgJ3ZhbHVlJywge3ZhbHVlOiBzdHIsIHdyaXRhYmxlOiBmYWxzZX0pO1xufVxuX2pzdHJpbmcucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShKVmFsdWUucHJvdG90eXBlKTtcbl9qc3RyaW5nLnByb3RvdHlwZS5pc0pTdHJpbmcgPSB0cnVlO1xuX2pzdHJpbmcucHJvdG90eXBlLnR5cGUgPSAnanN0cmluZyc7XG5fanN0cmluZy5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuICdKU3RyaW5nKCcgKyB0aGlzLnZhbHVlLnRvU3RyaW5nKCkgKyAnKSc7XG59O1xuXG5KVmFsdWUuSlN0cmluZyA9IEpTdHJpbmc7XG5KVmFsdWUucHJvdG90eXBlLkpTdHJpbmcgPSBKVmFsdWUuSlN0cmluZztcblxuZnVuY3Rpb24gSk51bWJlcihmbG9hdCkge1xuICAgIHJldHVybiBuZXcgX2pudW1iZXIoZmxvYXQpO1xufVxuXG5mdW5jdGlvbiBfam51bWJlcihmbG9hdCkge1xuICAgIGlmICh0eXBlb2YgZmxvYXQgIT09ICdudW1iZXInXG4gICAgICAgIHx8IGlzTmFOKGZsb2F0KSkgdGhyb3cgbmV3IEVycm9yKCdKTnVtYmVyOiBpbnZhbGlkIHZhbHVlJyk7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsICd2YWx1ZScsIHt2YWx1ZTogZmxvYXQsIHdyaXRhYmxlOiBmYWxzZX0pO1xufVxuX2pudW1iZXIucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShKVmFsdWUucHJvdG90eXBlKTtcbl9qbnVtYmVyLnByb3RvdHlwZS5pc0pOdW1iZXIgPSB0cnVlO1xuX2pudW1iZXIucHJvdG90eXBlLnR5cGUgPSAnam51bWJlcic7XG5fam51bWJlci5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuICdKTnVtYmVyKCcgKyB0aGlzLnZhbHVlLnRvU3RyaW5nKCkgKyAnKSc7XG59O1xuXG5KVmFsdWUuSk51bWJlciA9IEpOdW1iZXI7XG5KVmFsdWUucHJvdG90eXBlLkpOdW1iZXIgPSBKVmFsdWUuSk51bWJlcjtcblxuZnVuY3Rpb24gSkJvb2woYm9vbCkge1xuICAgIHJldHVybiBuZXcgX2pib29sKGJvb2wpO1xufVxuXG5mdW5jdGlvbiBfamJvb2woYm9vbCkge1xuICAgIGlmICh0eXBlb2YgYm9vbCAhPT0gJ2Jvb2xlYW4nKSB0aHJvdyBuZXcgRXJyb3IoJ0pCb29sOiBpbnZhbGlkIHZhbHVlJyk7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsICd2YWx1ZScsIHt2YWx1ZTogYm9vbCwgd3JpdGFibGU6IGZhbHNlfSk7XG59XG5famJvb2wucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShKVmFsdWUucHJvdG90eXBlKTtcbl9qYm9vbC5wcm90b3R5cGUuaXNKQm9vbCA9IHRydWU7XG5famJvb2wucHJvdG90eXBlLnR5cGUgPSAnamJvb2wnO1xuX2pib29sLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gJ0pCb29sKCcgKyB0aGlzLnZhbHVlLnRvU3RyaW5nKCkgKyAnKSc7XG59O1xuXG5KVmFsdWUuSkJvb2wgPSBKQm9vbDtcbkpWYWx1ZS5wcm90b3R5cGUuSkJvb2wgPSBKVmFsdWUuSkJvb2w7XG5cbmZ1bmN0aW9uIEpOdWxsKG51bGxWYWx1ZSkge1xuICAgIHJldHVybiBuZXcgX2pudWxsKG51bGxWYWx1ZSk7XG59XG5cbmZ1bmN0aW9uIF9qbnVsbChudWxsVmFsdWUpIHtcbiAgICBpZiAobnVsbFZhbHVlICE9PSBudWxsKSB0aHJvdyBuZXcgRXJyb3IoJ0pOdWxsOiBpbnZhbGlkIHZhbHVlJyk7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsICd2YWx1ZScsIHt2YWx1ZTogbnVsbFZhbHVlLCB3cml0YWJsZTogZmFsc2V9KTtcbn1cbl9qbnVsbC5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKEpWYWx1ZS5wcm90b3R5cGUpO1xuX2pudWxsLnByb3RvdHlwZS5pc0pOdWxsID0gdHJ1ZTtcbl9qbnVsbC5wcm90b3R5cGUudHlwZSA9ICdqbnVsbCc7XG5fam51bGwucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiAnSk51bGwobnVsbCknO1xufTtcblxuSlZhbHVlLkpOdWxsID0gSk51bGw7XG5KVmFsdWUucHJvdG90eXBlLkpOdWxsID0gSlZhbHVlLkpOdWxsO1xuXG5mdW5jdGlvbiBKQXJyYXkoLi4ualZhbHVlcykge1xuICAgIHJldHVybiBuZXcgX2phcnJheSguLi5qVmFsdWVzKTtcbn1cblxuLy8gVE9ETyBtYWtlIGl0IHdpdGggaXRlcmF0b3IgYW5kIGV2ZXJ5dGhpbmdcbmZ1bmN0aW9uIF9qYXJyYXkoLi4ualZhbHVlcykge1xuICAgIGlmIChqVmFsdWVzLnNvbWUoanZhbCA9PiAoIWp2YWwuaXNKVmFsdWUpKSkgdGhyb3cgbmV3IEVycm9yKCdKQXJyYXk6IGludmFsaWQgY29udGVudCcpO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCAndmFsdWUnLCB7dmFsdWU6IFsuLi5qVmFsdWVzXSwgd3JpdGFibGU6IGZhbHNlfSk7XG59XG5famFycmF5LnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoSlZhbHVlLnByb3RvdHlwZSk7XG5famFycmF5LnByb3RvdHlwZS5pc0pBcnJheSA9IHRydWU7XG5famFycmF5LnByb3RvdHlwZS50eXBlID0gJ2phcnJheSc7XG5famFycmF5LnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gJ0pBcnJheShbJyArIHRoaXMudmFsdWUucmVkdWNlKChhY2MsIGN1cnIpID0+IGFjYyArIGN1cnIgKyAnLCcsICcnKSArICddKSc7XG59O1xuXG5KVmFsdWUuSkFycmF5ID0gSkFycmF5O1xuSlZhbHVlLnByb3RvdHlwZS5KQXJyYXkgPSBKVmFsdWUuSkFycmF5O1xuXG5mdW5jdGlvbiBKT2JqZWN0KC4uLnBhaXJzKSB7XG4gICAgcmV0dXJuIG5ldyBfam9iamVjdCguLi5wYWlycyk7XG59XG5cbmZ1bmN0aW9uIF9qb2JqZWN0KC4uLnBhaXJzKSB7XG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XG4gICAgaWYgKHBhaXJzLnNvbWUocGFpciA9PiB7XG4gICAgICAgIHJldHVybiAoIXBhaXIuaXNQYWlyXG4gICAgICAgICAgICB8fCB0eXBlb2YgcGFpclswXSAhPT0gJ3N0cmluZydcbiAgICAgICAgICAgIHx8ICFwYWlyWzFdLmlzSlZhbHVlKVxuICAgICAgICB9KSkgdGhyb3cgbmV3IEVycm9yKCdKT2JqZWN0OiBpbnZhbGlkIGNvbnRlbnQnKTtcbiAgICBwYWlycy5mb3JFYWNoKChba2V5LCB2YWx1ZV0pID0+IHtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHNlbGYsIGtleSwge3ZhbHVlOiB2YWx1ZSwgd3JpdGFibGU6IGZhbHNlfSk7XG4gICAgfSk7XG59XG5fam9iamVjdC5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKEpWYWx1ZS5wcm90b3R5cGUpO1xuX2pvYmplY3QucHJvdG90eXBlLmlzSk9iamVjdCA9IHRydWU7XG5fam9iamVjdC5wcm90b3R5cGUudHlwZSA9ICdqb2JqZWN0Jztcbl9qb2JqZWN0LnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gJ0pPYmplY3QoeycgKyBPQkogKyAnfSknO1xufTtcblxuSlZhbHVlLkpPYmplY3QgPSBKT2JqZWN0O1xuSlZhbHVlLnByb3RvdHlwZS5KT2JqZWN0ID0gSlZhbHVlLkpPYmplY3Q7XG5cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5leHBvcnQgZnVuY3Rpb24gVHVwbGUoKSB7XG59XG5cbmZ1bmN0aW9uIFBhaXIoYSwgYikge1xuICAgIGxldCByZXN1bHQgPSBuZXcgX3BhaXIoYSwgYik7XG4gICAgcmVzdWx0W1N5bWJvbC5pdGVyYXRvcl0gPSBmdW5jdGlvbiooKSB7XG4gICAgICAgIHlpZWxkIGE7XG4gICAgICAgIHlpZWxkIGI7XG4gICAgfTtcbiAgICByZXR1cm4gcmVzdWx0O1xufVxuUGFpci5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFR1cGxlLnByb3RvdHlwZSk7XG5cbmZ1bmN0aW9uIF9wYWlyKGEsIGIpIHtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgMCwge3ZhbHVlOiBhLCB3cml0YWJsZTogZmFsc2V9KTtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgMSwge3ZhbHVlOiBiLCB3cml0YWJsZTogZmFsc2V9KTtcbn1cbl9wYWlyLnByb3RvdHlwZS5pc1BhaXIgPSB0cnVlO1xuX3BhaXIucHJvdG90eXBlLnR5cGUgPSAncGFpcic7XG5fcGFpci5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuICdbJyArIHRoaXNbMF0udG9TdHJpbmcoKSArICcsJyArIHRoaXNbMV0udG9TdHJpbmcoKSArICddJztcbn07XG5cbmZ1bmN0aW9uIFRyaXBsZShhLCBiLCBjKSB7XG4gICAgbGV0IHJlc3VsdCA9IG5ldyBfdHJpcGxlKGEsIGIsIGMpO1xuICAgIHJlc3VsdFtTeW1ib2wuaXRlcmF0b3JdID0gZnVuY3Rpb24qKCkge1xuICAgICAgICB5aWVsZCBhO1xuICAgICAgICB5aWVsZCBiO1xuICAgICAgICB5aWVsZCBjO1xuICAgIH07XG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cblRyaXBsZS5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFR1cGxlLnByb3RvdHlwZSk7XG5cbmZ1bmN0aW9uIF90cmlwbGUoYSwgYiwgYykge1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCAwLCB7dmFsdWU6IGEsIHdyaXRhYmxlOiBmYWxzZX0pO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCAxLCB7dmFsdWU6IGIsIHdyaXRhYmxlOiBmYWxzZX0pO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCAyLCB7dmFsdWU6IGMsIHdyaXRhYmxlOiBmYWxzZX0pO1xufVxuX3RyaXBsZS5wcm90b3R5cGUuaXNUcmlwbGUgPSB0cnVlO1xuX3RyaXBsZS5wcm90b3R5cGUudHlwZSA9ICd0cmlwbGUnO1xuX3RyaXBsZS5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuICdbJyArIHRoaXNbMF0udG9TdHJpbmcoKSArICcsJyArIHRoaXNbMV0udG9TdHJpbmcoKSArICcsJyArIHRoaXNbMl0udG9TdHJpbmcoKSArICddJztcbn07XG5cblR1cGxlLlBhaXIgPSBQYWlyO1xuVHVwbGUucHJvdG90eXBlLlBhaXIgPSBQYWlyO1xuXG5UdXBsZS5UcmlwbGUgPSBUcmlwbGU7XG5UdXBsZS5wcm90b3R5cGUuVHJpcGxlID0gVHJpcGxlO1xuXG5leHBvcnQgZnVuY3Rpb24gUG9zaXRpb24ocm93cyA9IFtdLCByb3cgPSAwLCBjb2wgPSAwKSB7XG4gICAgcmV0dXJuIG5ldyBfcG9zaXRpb24ocm93cywgcm93LCBjb2wpO1xufVxuXG4vL1Bvc2l0aW9uLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoe30pO1xuUG9zaXRpb24uZnJvbVRleHQgPSBmdW5jdGlvbiAodGV4dCkge1xuICAgIGNvbnN0IHJvd3MgPSB0ZXh0LnNwbGl0KCdcXG4nKVxuICAgICAgICAubWFwKHJvdyA9PiByb3cuc3BsaXQoJycpKTtcbiAgICByZXR1cm4gbmV3IF9wb3NpdGlvbihyb3dzLCAwLCAwKTtcbn07XG5cbmZ1bmN0aW9uIF9wb3NpdGlvbihyb3dzLCByb3csIGNvbCkge1xuICAgIHRoaXMucm93cyA9IHJvd3M7XG4gICAgdGhpcy5yb3cgPSByb3c7XG4gICAgdGhpcy5jb2wgPSBjb2w7XG59XG5cbl9wb3NpdGlvbi5wcm90b3R5cGUuaXNQb3NpdGlvbiA9IHRydWU7XG5fcG9zaXRpb24ucHJvdG90eXBlLmNoYXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgbGV0IHJlc3VsdCA9IE1heWJlLk5vdGhpbmcoKTtcbiAgICB0cnkge1xuICAgICAgICBjb25zdCBuZXdSZXN1bHRWYWx1ZSA9IHRoaXMucm93c1t0aGlzLnJvd11bdGhpcy5jb2xdO1xuICAgICAgICBpZiAodHlwZW9mIG5ld1Jlc3VsdFZhbHVlICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgcmVzdWx0ID0gTWF5YmUuSnVzdChuZXdSZXN1bHRWYWx1ZSk7XG4gICAgICAgIH1cbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbn07XG5fcG9zaXRpb24ucHJvdG90eXBlLmluY3JQb3MgPSBmdW5jdGlvbiAoKSB7XG4gICAgY29uc3QgbmVlZFJvd0luY3JlbWVudCA9ICh0aGlzLmNvbCA9PT0gdGhpcy5yb3dzW3RoaXMucm93XS5sZW5ndGggLSAxKTtcbiAgICByZXR1cm4gUG9zaXRpb24oXG4gICAgICAgIHRoaXMucm93cyxcbiAgICAgICAgKG5lZWRSb3dJbmNyZW1lbnQgPyB0aGlzLnJvdyArIDEgOiB0aGlzLnJvdyksXG4gICAgICAgIChuZWVkUm93SW5jcmVtZW50ID8gMCA6IHRoaXMuY29sICsgMSlcbiAgICApO1xufTtcbl9wb3NpdGlvbi5wcm90b3R5cGUucmVzdCA9IGZ1bmN0aW9uICgpIHtcbiAgICBjb25zdCBzZWxmID0gdGhpcztcbiAgICByZXR1cm4gcmVzdF9oZWxwZXIoKS5qb2luKCcnKTtcbiAgICBmdW5jdGlvbiByZXN0X2hlbHBlcigpIHtcbiAgICAgICAgY29uc3QgbmV4dCA9IHNlbGYuY2hhcigpO1xuICAgICAgICBpZiAobmV4dC5pc05vdGhpbmcpIHJldHVybiBbXTtcbiAgICAgICAgcmV0dXJuIFtuZXh0LnZhbHVlXS5jb25jYXQoc2VsZi5pbmNyUG9zKCkucmVzdCgpKTtcbiAgICB9XG59O1xuX3Bvc2l0aW9uLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gJ3Jvdz0nICsgdGhpcy5yb3dcbiAgICAgICAgKyAnO2NvbD0nICsgdGhpcy5jb2xcbiAgICAgICAgKyAnO3Jlc3Q9JyArIHRoaXMucmVzdCgpO1xufTtcblxuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gZGVwcmVjYXRlZCBpbiBmYXZvdXIgb2YgVHVwbGUsIGRhdGEuTWF5YmUgYW5kIGRhdGEuVmFsaWRhdGlvblxuZXhwb3J0IGZ1bmN0aW9uIHBhaXIoeCwgeSkge1xuICAgIGxldCByZXN1bHQgPSBbeCwgeV07XG4gICAgcmVzdWx0LnR5cGUgPSAncGFpcic7XG4gICAgcmVzdWx0LnRvU3RyaW5nID0gKCkgPT4ge1xuICAgICAgICByZXR1cm4gJ1snXG4gICAgICAgICAgICArIChpc1BhaXIocmVzdWx0WzBdKSA/IHJlc3VsdFswXS50b1N0cmluZygpIDogcmVzdWx0WzBdKVxuICAgICAgICAgICAgKyAnLCdcbiAgICAgICAgICAgICsgKGlzUGFpcihyZXN1bHRbMV0pID8gcmVzdWx0WzFdLnRvU3RyaW5nKCkgOiByZXN1bHRbMV0pXG4gICAgICAgICAgICArICddJztcbiAgICB9O1xuICAgIHJldHVybiByZXN1bHQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzdWNjZXNzKG1hdGNoZWQsIHN0cikge1xuICAgIGxldCByZXN1bHQgPSBwYWlyKG1hdGNoZWQsIHN0cik7XG4gICAgcmVzdWx0LnR5cGUgPSAnc3VjY2Vzcyc7XG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGZhaWx1cmUocGFyc2VyTGFiZWwsIGVycm9yTXNnKSB7XG4gICAgbGV0IHJlc3VsdCA9IHBhaXIocGFyc2VyTGFiZWwsIGVycm9yTXNnKTtcbiAgICByZXN1bHQudHlwZSA9ICdmYWlsdXJlJztcbiAgICByZXR1cm4gcmVzdWx0O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc29tZSh2YWx1ZSkge1xuICAgIHJldHVybiB7XG4gICAgICAgIHR5cGU6ICdzb21lJyxcbiAgICAgICAgdmFsKCkge1xuICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICB9LFxuICAgICAgICB0b1N0cmluZygpIHtcbiAgICAgICAgICAgIHJldHVybiBgc29tZSgke3ZhbHVlfSlgO1xuICAgICAgICB9XG4gICAgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG5vbmUoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgdHlwZTogJ25vbmUnLFxuICAgICAgICB2YWwoKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfSxcbiAgICAgICAgdG9TdHJpbmcoKSB7XG4gICAgICAgICAgICByZXR1cm4gJ25vbmUoKSc7XG4gICAgICAgIH1cbiAgICB9O1xufVxuIl19