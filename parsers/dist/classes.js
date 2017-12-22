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


    var toString = Array.prototype.toString;

    Array.prototype.toString = function () {
        return '[' + toString.apply(this) + ']';
    };

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
        this[0] = a;
        this[1] = b;
    }
    _pair.prototype.isPair = true;
    _pair.prototype.type = 'pair';
    _pair.prototype.toString = function () {
        return '[' + this[0] + ',' + this[1] + ']';
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
        this[0] = a;
        this[1] = b;
        this[2] = c;
    }
    _triple.prototype.isTriple = true;
    _triple.prototype.type = 'triple';
    _triple.prototype.toString = function () {
        return '[' + this[0] + ',' + this[1] + ',' + this[2] + ']';
    };

    Tuple.Pair = function (a, b) {
        return new Pair(a, b);
    };
    Tuple.prototype.Pair = Tuple.Pair;

    Tuple.Triple = function (a, b, c) {
        return new Triple(a, b, c);
    };
    Tuple.prototype.Triple = Tuple.Triple;

    function Position() {
        var rows = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
        var row = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
        var col = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;

        return new _position(rows, row, col);
    }

    function _position(rows, row, col) {
        this.rows = rows;
        this.row = row;
        this.col = col;
    }

    _position.prototype.isPosition = true;
    _position.prototype.char = function () {
        var result = _maybe.Maybe.Nothing();
        try {
            result = _maybe.Maybe.Just(this.rows[this.row][this.col]);
        } catch (err) {}
        return result;
    };
    _position.prototype.incrPos = function () {
        var needRowIncrement = this.col === this.rows[this.row].length - 1;
        return Position(this.rows, needRowIncrement ? this.row + 1 : this.row, needRowIncrement ? 0 : this.col + 1);
    };

    /////////////////////////////////////////////////////////
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2pzL2NsYXNzZXMuanMiXSwibmFtZXMiOlsiVHVwbGUiLCJQb3NpdGlvbiIsInBhaXIiLCJzdWNjZXNzIiwiZmFpbHVyZSIsInNvbWUiLCJub25lIiwidG9TdHJpbmciLCJBcnJheSIsInByb3RvdHlwZSIsImFwcGx5IiwiUGFpciIsImEiLCJiIiwicmVzdWx0IiwiX3BhaXIiLCJTeW1ib2wiLCJpdGVyYXRvciIsIk9iamVjdCIsImNyZWF0ZSIsImlzUGFpciIsInR5cGUiLCJUcmlwbGUiLCJjIiwiX3RyaXBsZSIsImlzVHJpcGxlIiwicm93cyIsInJvdyIsImNvbCIsIl9wb3NpdGlvbiIsImlzUG9zaXRpb24iLCJjaGFyIiwiTm90aGluZyIsIkp1c3QiLCJlcnIiLCJpbmNyUG9zIiwibmVlZFJvd0luY3JlbWVudCIsImxlbmd0aCIsIngiLCJ5IiwibWF0Y2hlZCIsInN0ciIsInBhcnNlckxhYmVsIiwiZXJyb3JNc2ciLCJ2YWx1ZSIsInZhbCJdLCJtYXBwaW5ncyI6Ijs7Ozs7O1lBWWdCQSxLLEdBQUFBLEs7WUF1REFDLFEsR0FBQUEsUTtZQTZCQUMsSSxHQUFBQSxJO1lBYUFDLE8sR0FBQUEsTztZQU1BQyxPLEdBQUFBLE87WUFNQUMsSSxHQUFBQSxJO1lBWUFDLEksR0FBQUEsSTs7O0FBL0hoQixRQUFNQyxXQUFXQyxNQUFNQyxTQUFOLENBQWdCRixRQUFqQzs7QUFFQUMsVUFBTUMsU0FBTixDQUFnQkYsUUFBaEIsR0FBMkIsWUFBWTtBQUNuQyxlQUFPLE1BQU1BLFNBQVNHLEtBQVQsQ0FBZSxJQUFmLENBQU4sR0FBNkIsR0FBcEM7QUFDSCxLQUZEOztBQUlPLGFBQVNWLEtBQVQsR0FBaUIsQ0FDdkI7O0FBRUQsYUFBU1csSUFBVCxDQUFjQyxDQUFkLEVBQWlCQyxDQUFqQixFQUFvQjtBQUNoQixZQUFJQyxTQUFTLElBQUlDLEtBQUosQ0FBVUgsQ0FBVixFQUFhQyxDQUFiLENBQWI7QUFDQUMsZUFBT0UsT0FBT0MsUUFBZCw0QkFBMEI7QUFBQTtB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LGtCQUFPTyxPQUFPLENBQVAsQ0FBUCxJQUFvQkEsT0FBTyxDQUFQLEVBQVVQLFFBQVYsRUFBcEIsR0FBMkNPLE9BQU8sQ0FBUCxDQUQzQyxJQUVELEdBRkMsSUFHQSxrQkFBT0EsT0FBTyxDQUFQLENBQVAsSUFBb0JBLE9BQU8sQ0FBUCxFQUFVUCxRQUFWLEVBQXBCLEdBQTJDTyxPQUFPLENBQVAsQ0FIM0MsSUFJRCxHQUpOO0FBS0gsU0FORDtBQU9BLGVBQU9BLE1BQVA7QUFDSDs7QUFFTSxhQUFTWCxPQUFULENBQWlCcUMsT0FBakIsRUFBMEJDLEdBQTFCLEVBQStCO0FBQ2xDLFlBQUkzQixTQUFTWixLQUFLc0MsT0FBTCxFQUFjQyxHQUFkLENBQWI7QUFDQTNCLGVBQU9PLElBQVAsR0FBYyxTQUFkO0FBQ0EsZUFBT1AsTUFBUDtBQUNIOztBQUVNLGFBQVNWLE9BQVQsQ0FBaUJzQyxXQUFqQixFQUE4QkMsUUFBOUIsRUFBd0M7QUFDM0MsWUFBSTdCLFNBQVNaLEtBQUt3QyxXQUFMLEVBQWtCQyxRQUFsQixDQUFiO0FBQ0E3QixlQUFPTyxJQUFQLEdBQWMsU0FBZDtBQUNBLGVBQU9QLE1BQVA7QUFDSDs7QUFFTSxhQUFTVCxJQUFULENBQWN1QyxLQUFkLEVBQXFCO0FBQ3hCLGVBQU87QUFDSHZCLGtCQUFNLE1BREg7QUFFSHdCLGVBRkcsaUJBRUc7QUFDRix1QkFBT0QsS0FBUDtBQUNILGFBSkU7QUFLSHJDLG9CQUxHLHNCQUtRO0FBQ1AsaUNBQWVxQyxLQUFmO0FBQ0g7QUFQRSxTQUFQO0FBU0g7O0FBRU0sYUFBU3RDLElBQVQsR0FBZ0I7QUFDbkIsZUFBTztBQUNIZSxrQkFBTSxNQURIO0FBRUh3QixlQUZHLGlCQUVHO0FBQ0YsdUJBQU8sSUFBUDtBQUNILGFBSkU7QUFLSHRDLG9CQUxHLHNCQUtRO0FBQ1AsdUJBQU8sUUFBUDtBQUNIO0FBUEUsU0FBUDtBQVNIIiwiZmlsZSI6ImNsYXNzZXMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge01heWJlfSBmcm9tICdtYXliZSc7XG5cbmltcG9ydCB7XG4gICAgaXNQYWlyLFxufSBmcm9tICd1dGlsJztcblxuY29uc3QgdG9TdHJpbmcgPSBBcnJheS5wcm90b3R5cGUudG9TdHJpbmc7XG5cbkFycmF5LnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gJ1snICsgdG9TdHJpbmcuYXBwbHkodGhpcykgKyAnXSc7XG59O1xuXG5leHBvcnQgZnVuY3Rpb24gVHVwbGUoKSB7XG59XG5cbmZ1bmN0aW9uIFBhaXIoYSwgYikge1xuICAgIGxldCByZXN1bHQgPSBuZXcgX3BhaXIoYSwgYik7XG4gICAgcmVzdWx0W1N5bWJvbC5pdGVyYXRvcl0gPSBmdW5jdGlvbiooKSB7XG4gICAgICAgIHlpZWxkIGE7XG4gICAgICAgIHlpZWxkIGI7XG4gICAgfTtcbiAgICByZXR1cm4gcmVzdWx0O1xufVxuUGFpci5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFR1cGxlLnByb3RvdHlwZSk7XG5cbmZ1bmN0aW9uIF9wYWlyKGEsIGIpIHtcbiAgICB0aGlzWzBdID0gYTtcbiAgICB0aGlzWzFdID0gYjtcbn1cbl9wYWlyLnByb3RvdHlwZS5pc1BhaXIgPSB0cnVlO1xuX3BhaXIucHJvdG90eXBlLnR5cGUgPSAncGFpcic7XG5fcGFpci5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuICdbJyArIHRoaXNbMF0gKyAnLCcgKyB0aGlzWzFdICsgJ10nO1xufTtcblxuZnVuY3Rpb24gVHJpcGxlKGEsIGIsIGMpIHtcbiAgICBsZXQgcmVzdWx0ID0gbmV3IF90cmlwbGUoYSwgYiwgYyk7XG4gICAgcmVzdWx0W1N5bWJvbC5pdGVyYXRvcl0gPSBmdW5jdGlvbiooKSB7XG4gICAgICAgIHlpZWxkIGE7XG4gICAgICAgIHlpZWxkIGI7XG4gICAgICAgIHlpZWxkIGM7XG4gICAgfTtcbiAgICByZXR1cm4gcmVzdWx0O1xufVxuVHJpcGxlLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoVHVwbGUucHJvdG90eXBlKTtcblxuZnVuY3Rpb24gX3RyaXBsZShhLCBiLCBjKSB7XG4gICAgdGhpc1swXSA9IGE7XG4gICAgdGhpc1sxXSA9IGI7XG4gICAgdGhpc1syXSA9IGM7XG59XG5fdHJpcGxlLnByb3RvdHlwZS5pc1RyaXBsZSA9IHRydWU7XG5fdHJpcGxlLnByb3RvdHlwZS50eXBlID0gJ3RyaXBsZSc7XG5fdHJpcGxlLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gJ1snICsgdGhpc1swXSArICcsJyArIHRoaXNbMV0gKyAnLCcgKyB0aGlzWzJdICsgJ10nO1xufTtcblxuVHVwbGUuUGFpciA9IGZ1bmN0aW9uIChhLCBiKSB7XG4gICAgcmV0dXJuIG5ldyBQYWlyKGEsIGIpO1xufTtcblR1cGxlLnByb3RvdHlwZS5QYWlyID0gVHVwbGUuUGFpcjtcblxuVHVwbGUuVHJpcGxlID0gZnVuY3Rpb24gKGEsIGIsIGMpIHtcbiAgICByZXR1cm4gbmV3IFRyaXBsZShhLCBiLCBjKTtcbn07XG5UdXBsZS5wcm90b3R5cGUuVHJpcGxlID0gVHVwbGUuVHJpcGxlO1xuXG5leHBvcnQgZnVuY3Rpb24gUG9zaXRpb24ocm93cyA9IFtdLCByb3cgPSAwLCBjb2wgPSAwKSB7XG4gICAgcmV0dXJuIG5ldyBfcG9zaXRpb24ocm93cywgcm93LCBjb2wpO1xufVxuXG5mdW5jdGlvbiBfcG9zaXRpb24ocm93cywgcm93LCBjb2wpIHtcbiAgICB0aGlzLnJvd3MgPSByb3dzO1xuICAgIHRoaXMucm93ID0gcm93O1xuICAgIHRoaXMuY29sID0gY29sO1xufVxuXG5fcG9zaXRpb24ucHJvdG90eXBlLmlzUG9zaXRpb24gPSB0cnVlO1xuX3Bvc2l0aW9uLnByb3RvdHlwZS5jaGFyID0gZnVuY3Rpb24gKCkge1xuICAgIGxldCByZXN1bHQgPSBNYXliZS5Ob3RoaW5nKCk7XG4gICAgdHJ5IHtcbiAgICAgICAgcmVzdWx0ID0gTWF5YmUuSnVzdCh0aGlzLnJvd3NbdGhpcy5yb3ddW3RoaXMuY29sXSk7XG4gICAgfSBjYXRjaCAoZXJyKSB7fVxuICAgIHJldHVybiByZXN1bHQ7XG59O1xuX3Bvc2l0aW9uLnByb3RvdHlwZS5pbmNyUG9zID0gZnVuY3Rpb24gKCkge1xuICAgIGNvbnN0IG5lZWRSb3dJbmNyZW1lbnQgPSAodGhpcy5jb2wgPT09IHRoaXMucm93c1t0aGlzLnJvd10ubGVuZ3RoIC0gMSk7XG4gICAgcmV0dXJuIFBvc2l0aW9uKFxuICAgICAgICB0aGlzLnJvd3MsXG4gICAgICAgIChuZWVkUm93SW5jcmVtZW50ID8gdGhpcy5yb3cgKyAxIDogdGhpcy5yb3cpLFxuICAgICAgICAobmVlZFJvd0luY3JlbWVudCA/IDAgOiB0aGlzLmNvbCArIDEpXG4gICAgKTtcbn07XG5cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gZGVwcmVjYXRlZCBpbiBmYXZvdXIgb2YgVHVwbGUsIGRhdGEuTWF5YmUgYW5kIGRhdGEuVmFsaWRhdGlvblxuZXhwb3J0IGZ1bmN0aW9uIHBhaXIoeCwgeSkge1xuICAgIGxldCByZXN1bHQgPSBbeCwgeV07XG4gICAgcmVzdWx0LnR5cGUgPSAncGFpcic7XG4gICAgcmVzdWx0LnRvU3RyaW5nID0gKCkgPT4ge1xuICAgICAgICByZXR1cm4gJ1snXG4gICAgICAgICAgICArIChpc1BhaXIocmVzdWx0WzBdKSA/IHJlc3VsdFswXS50b1N0cmluZygpIDogcmVzdWx0WzBdKVxuICAgICAgICAgICAgKyAnLCdcbiAgICAgICAgICAgICsgKGlzUGFpcihyZXN1bHRbMV0pID8gcmVzdWx0WzFdLnRvU3RyaW5nKCkgOiByZXN1bHRbMV0pXG4gICAgICAgICAgICArICddJztcbiAgICB9O1xuICAgIHJldHVybiByZXN1bHQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzdWNjZXNzKG1hdGNoZWQsIHN0cikge1xuICAgIGxldCByZXN1bHQgPSBwYWlyKG1hdGNoZWQsIHN0cik7XG4gICAgcmVzdWx0LnR5cGUgPSAnc3VjY2Vzcyc7XG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGZhaWx1cmUocGFyc2VyTGFiZWwsIGVycm9yTXNnKSB7XG4gICAgbGV0IHJlc3VsdCA9IHBhaXIocGFyc2VyTGFiZWwsIGVycm9yTXNnKTtcbiAgICByZXN1bHQudHlwZSA9ICdmYWlsdXJlJztcbiAgICByZXR1cm4gcmVzdWx0O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc29tZSh2YWx1ZSkge1xuICAgIHJldHVybiB7XG4gICAgICAgIHR5cGU6ICdzb21lJyxcbiAgICAgICAgdmFsKCkge1xuICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICB9LFxuICAgICAgICB0b1N0cmluZygpIHtcbiAgICAgICAgICAgIHJldHVybiBgc29tZSgke3ZhbHVlfSlgO1xuICAgICAgICB9XG4gICAgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG5vbmUoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgdHlwZTogJ25vbmUnLFxuICAgICAgICB2YWwoKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfSxcbiAgICAgICAgdG9TdHJpbmcoKSB7XG4gICAgICAgICAgICByZXR1cm4gJ25vbmUoKSc7XG4gICAgICAgIH1cbiAgICB9O1xufVxuIl19