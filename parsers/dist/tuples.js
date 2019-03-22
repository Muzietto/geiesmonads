define(['exports', 'maybe'], function (exports, _maybe) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.Tuple = Tuple;
    exports.Position = Position;
    function Tuple() {} /*
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
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2pzL3R1cGxlcy5qcyJdLCJuYW1lcyI6WyJUdXBsZSIsIlBvc2l0aW9uIiwiUGFpciIsImEiLCJiIiwicmVzdWx0IiwiX3BhaXIiLCJTeW1ib2wiLCJpdGVyYXRvciIsInByb3RvdHlwZSIsIk9iamVjdCIsImNyZWF0ZSIsImRlZmluZVByb3BlcnR5IiwidmFsdWUiLCJ3cml0YWJsZSIsImlzUGFpciIsInR5cGUiLCJ0b1N0cmluZyIsIlRyaXBsZSIsImMiLCJfdHJpcGxlIiwiaXNUcmlwbGUiLCJyb3dzIiwicm93IiwiY29sIiwiX3Bvc2l0aW9uIiwiZnJvbVRleHQiLCJ0ZXh0Iiwic3BsaXQiLCJtYXAiLCJpc1Bvc2l0aW9uIiwiY2hhciIsIk1heWJlIiwiTm90aGluZyIsIm5ld1Jlc3VsdFZhbHVlIiwiSnVzdCIsImVyciIsImluY3JQb3MiLCJuZWVkUm93SW5jcmVtZW50IiwibGVuZ3RoIiwicmVzdCIsInNlbGYiLCJyZXN0X2hlbHBlciIsImpvaW4iLCJuZXh0IiwiaXNOb3RoaW5nIiwiY29uY2F0Il0sIm1hcHBpbmdzIjoiOzs7Ozs7WUEwQmdCQSxLLEdBQUFBLEs7WUFtREFDLFEsR0FBQUEsUTtBQW5EVCxhQUFTRCxLQUFULEdBQWlCLENBQ3ZCLEMsQ0EzQkQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQTZCQSxhQUFTRSxJQUFULENBQWNDLENBQWQsRUFBaUJDLENBQWpCLEVBQW9CO0FBQ2hCLFlBQUlDLFNBQVMsSUFBSUMsS0FBSixDQUFVSCxDQUFWLEVBQWFDLENBQWIsQ0FBYjtBQUNBQyxlQUFPRSxPQUFPQyxRQUFkLDRCQUEwQjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxtQ0FDaEJMLENBRGdCOztBQUFBO0FBQUE7QUFBQSxtQ0FFaEJDLENBRmdCOztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLFNBQTFCO0FBSUEsZUFBT0MsTUFBUDtBQUNIO0FBQ0RILFNBQUtPLFNBQUwsR0FBaUJDLE9BQU9DLE1BQVAs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RixFQUVGZ0IsbUJBQW1CLEtBQUtmLEdBQUwsR0FBVyxDQUE5QixHQUFrQyxLQUFLQSxHQUZyQyxFQUdGZSxtQkFBbUIsQ0FBbkIsR0FBdUIsS0FBS2QsR0FBTCxHQUFXLENBSGhDLENBQVA7QUFLSCxLQVBEO0FBUUFDLGNBQVVoQixTQUFWLENBQW9CK0IsSUFBcEIsR0FBMkIsWUFBWTtBQUNuQyxZQUFNQyxPQUFPLElBQWI7QUFDQSxlQUFPQyxjQUFjQyxJQUFkLENBQW1CLEVBQW5CLENBQVA7QUFDQSxpQkFBU0QsV0FBVCxHQUF1QjtBQUNuQixnQkFBTUUsT0FBT0gsS0FBS1YsSUFBTCxFQUFiO0FBQ0EsZ0JBQUlhLEtBQUtDLFNBQVQsRUFBb0IsT0FBTyxFQUFQO0FBQ3BCLG1CQUFPLENBQUNELEtBQUsvQixLQUFOLEVBQWFpQyxNQUFiLENBQW9CTCxLQUFLSixPQUFMLEdBQWVHLElBQWYsRUFBcEIsQ0FBUDtBQUNIO0FBQ0osS0FSRDtBQVNBZixjQUFVaEIsU0FBVixDQUFvQlEsUUFBcEIsR0FBK0IsWUFBWTtBQUN2QyxlQUFPLFNBQVMsS0FBS00sR0FBZCxHQUNELE9BREMsR0FDUyxLQUFLQyxHQURkLEdBRUQsUUFGQyxHQUVVLEtBQUtnQixJQUFMLEVBRmpCO0FBR0gsS0FKRCIsImZpbGUiOiJ0dXBsZXMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuVGhlIE1JVCBMaWNlbnNlIChNSVQpXG5cbkNvcHlyaWdodCAoYykgMjAxNCBNYXJjbyBGYXVzdGluZWxsaVxuXG5QZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XG5vZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSBcIlNvZnR3YXJlXCIpLCB0byBkZWFsXG5pbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzXG50byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsXG5jb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcbmZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XG5cblRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluIGFsbFxuY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cblxuVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxuSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXG5GSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcbkFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcbkxJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXG5PVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRVxuU09GVFdBUkUuXG4qL1xuXG5pbXBvcnQge01heWJlfSBmcm9tICdtYXliZSc7XG5cbmV4cG9ydCBmdW5jdGlvbiBUdXBsZSgpIHtcbn1cblxuZnVuY3Rpb24gUGFpcihhLCBiKSB7XG4gICAgbGV0IHJlc3VsdCA9IG5ldyBfcGFpcihhLCBiKTtcbiAgICByZXN1bHRbU3ltYm9sLml0ZXJhdG9yXSA9IGZ1bmN0aW9uKigpIHtcbiAgICAgICAgeWllbGQgYTtcbiAgICAgICAgeWllbGQgYjtcbiAgICB9O1xuICAgIHJldHVybiByZXN1bHQ7XG59XG5QYWlyLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoVHVwbGUucHJvdG90eXBlKTtcblxuZnVuY3Rpb24gX3BhaXIoYSwgYikge1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCAwLCB7dmFsdWU6IGEsIHdyaXRhYmxlOiBmYWxzZX0pO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCAxLCB7dmFsdWU6IGIsIHdyaXRhYmxlOiBmYWxzZX0pO1xufVxuX3BhaXIucHJvdG90eXBlLmlzUGFpciA9IHRydWU7XG5fcGFpci5wcm90b3R5cGUudHlwZSA9ICdwYWlyJztcbl9wYWlyLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gJ1snICsgdGhpc1swXS50b1N0cmluZygpICsgJywnICsgdGhpc1sxXS50b1N0cmluZygpICsgJ10nO1xufTtcblxuZnVuY3Rpb24gVHJpcGxlKGEsIGIsIGMpIHtcbiAgICBsZXQgcmVzdWx0ID0gbmV3IF90cmlwbGUoYSwgYiwgYyk7XG4gICAgcmVzdWx0W1N5bWJvbC5pdGVyYXRvcl0gPSBmdW5jdGlvbiooKSB7XG4gICAgICAgIHlpZWxkIGE7XG4gICAgICAgIHlpZWxkIGI7XG4gICAgICAgIHlpZWxkIGM7XG4gICAgfTtcbiAgICByZXR1cm4gcmVzdWx0O1xufVxuVHJpcGxlLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoVHVwbGUucHJvdG90eXBlKTtcblxuZnVuY3Rpb24gX3RyaXBsZShhLCBiLCBjKSB7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsIDAsIHt2YWx1ZTogYSwgd3JpdGFibGU6IGZhbHNlfSk7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsIDEsIHt2YWx1ZTogYiwgd3JpdGFibGU6IGZhbHNlfSk7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsIDIsIHt2YWx1ZTogYywgd3JpdGFibGU6IGZhbHNlfSk7XG59XG5fdHJpcGxlLnByb3RvdHlwZS5pc1RyaXBsZSA9IHRydWU7XG5fdHJpcGxlLnByb3RvdHlwZS50eXBlID0gJ3RyaXBsZSc7XG5fdHJpcGxlLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gJ1snICsgdGhpc1swXS50b1N0cmluZygpICsgJywnICsgdGhpc1sxXS50b1N0cmluZygpICsgJywnICsgdGhpc1syXS50b1N0cmluZygpICsgJ10nO1xufTtcblxuVHVwbGUuUGFpciA9IFBhaXI7XG5UdXBsZS5wcm90b3R5cGUuUGFpciA9IFBhaXI7XG5cblR1cGxlLlRyaXBsZSA9IFRyaXBsZTtcblR1cGxlLnByb3RvdHlwZS5UcmlwbGUgPSBUcmlwbGU7XG5cbmV4cG9ydCBmdW5jdGlvbiBQb3NpdGlvbihyb3dzID0gW10sIHJvdyA9IDAsIGNvbCA9IDApIHtcbiAgICByZXR1cm4gbmV3IF9wb3NpdGlvbihyb3dzLCByb3csIGNvbCk7XG59XG5cbi8vUG9zaXRpb24ucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZSh7fSk7XG5Qb3NpdGlvbi5mcm9tVGV4dCA9IGZ1bmN0aW9uICh0ZXh0KSB7XG4gICAgY29uc3Qgcm93cyA9IHRleHQuc3BsaXQoJ1xcbicpXG4gICAgICAgIC5tYXAocm93ID0+IHJvdy5zcGxpdCgnJykpO1xuICAgIHJldHVybiBuZXcgX3Bvc2l0aW9uKHJvd3MsIDAsIDApO1xufTtcblxuZnVuY3Rpb24gX3Bvc2l0aW9uKHJvd3MsIHJvdywgY29sKSB7XG4gICAgdGhpcy5yb3dzID0gcm93cztcbiAgICB0aGlzLnJvdyA9IHJvdztcbiAgICB0aGlzLmNvbCA9IGNvbDtcbn1cblxuX3Bvc2l0aW9uLnByb3RvdHlwZS5pc1Bvc2l0aW9uID0gdHJ1ZTtcbl9wb3NpdGlvbi5wcm90b3R5cGUuY2hhciA9IGZ1bmN0aW9uICgpIHtcbiAgICBsZXQgcmVzdWx0ID0gTWF5YmUuTm90aGluZygpO1xuICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IG5ld1Jlc3VsdFZhbHVlID0gdGhpcy5yb3dzW3RoaXMucm93XVt0aGlzLmNvbF07XG4gICAgICAgIGlmICh0eXBlb2YgbmV3UmVzdWx0VmFsdWUgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICByZXN1bHQgPSBNYXliZS5KdXN0KG5ld1Jlc3VsdFZhbHVlKTtcbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGVycikge1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xufTtcbl9wb3NpdGlvbi5wcm90b3R5cGUuaW5jclBvcyA9IGZ1bmN0aW9uICgpIHtcbiAgICBjb25zdCBuZWVkUm93SW5jcmVtZW50ID0gKHRoaXMuY29sID09PSB0aGlzLnJvd3NbdGhpcy5yb3ddLmxlbmd0aCAtIDEpO1xuICAgIHJldHVybiBQb3NpdGlvbihcbiAgICAgICAgdGhpcy5yb3dzLFxuICAgICAgICAobmVlZFJvd0luY3JlbWVudCA/IHRoaXMucm93ICsgMSA6IHRoaXMucm93KSxcbiAgICAgICAgKG5lZWRSb3dJbmNyZW1lbnQgPyAwIDogdGhpcy5jb2wgKyAxKVxuICAgICk7XG59O1xuX3Bvc2l0aW9uLnByb3RvdHlwZS5yZXN0ID0gZnVuY3Rpb24gKCkge1xuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuICAgIHJldHVybiByZXN0X2hlbHBlcigpLmpvaW4oJycpO1xuICAgIGZ1bmN0aW9uIHJlc3RfaGVscGVyKCkge1xuICAgICAgICBjb25zdCBuZXh0ID0gc2VsZi5jaGFyKCk7XG4gICAgICAgIGlmIChuZXh0LmlzTm90aGluZykgcmV0dXJuIFtdO1xuICAgICAgICByZXR1cm4gW25leHQudmFsdWVdLmNvbmNhdChzZWxmLmluY3JQb3MoKS5yZXN0KCkpO1xuICAgIH1cbn07XG5fcG9zaXRpb24ucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiAncm93PScgKyB0aGlzLnJvd1xuICAgICAgICArICc7Y29sPScgKyB0aGlzLmNvbFxuICAgICAgICArICc7cmVzdD0nICsgdGhpcy5yZXN0KCk7XG59O1xuIl19