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
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2pzL3R1cGxlcy5qcyJdLCJuYW1lcyI6WyJUdXBsZSIsIlBvc2l0aW9uIiwiUGFpciIsImEiLCJiIiwicmVzdWx0IiwiX3BhaXIiLCJTeW1ib2wiLCJpdGVyYXRvciIsInByb3RvdHlwZSIsIk9iamVjdCIsImNyZWF0ZSIsImRlZmluZVByb3BlcnR5IiwidmFsdWUiLCJ3cml0YWJsZSIsImlzUGFpciIsInR5cGUiLCJ0b1N0cmluZyIsIlRyaXBsZSIsImMiLCJfdHJpcGxlIiwiaXNUcmlwbGUiLCJyb3dzIiwicm93IiwiY29sIiwiX3Bvc2l0aW9uIiwiZnJvbVRleHQiLCJ0ZXh0Iiwic3BsaXQiLCJtYXAiLCJpc1Bvc2l0aW9uIiwiY2hhciIsIk1heWJlIiwiTm90aGluZyIsIm5ld1Jlc3VsdFZhbHVlIiwiSnVzdCIsImVyciIsImluY3JQb3MiLCJ0aW1lcyIsImxhc3RSb3dJbmRleCIsImxlbmd0aCIsImxhc3RDb2x1bW5JbmRleCIsIm5lZWRzUm93SW5jcmVtZW50IiwiaW5jclBvc0hlbHBlciIsInBvcyIsImRlY3JQb3MiLCJuZWVkc1Jvd0RlY3JlbWVudCIsImRlY3JQb3NIZWxwZXIiLCJyZXN0Iiwic2VsZiIsInJlc3RfaGVscGVyIiwiam9pbiIsIm5leHQiLCJpc05vdGhpbmciLCJjb25jYXQiXSwibWFwcGluZ3MiOiI7Ozs7OztZQTBCZ0JBLEssR0FBQUEsSztZQW1EQUMsUSxHQUFBQSxRO0FBbkRULGFBQVNELEtBQVQsR0FBaUIsQ0FDdkIsQyxDQTNCRDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBNkJBLGFBQVNFLElBQVQsQ0FBY0MsQ0FBZCxFQUFpQkMsQ0FBakIsRUFBb0I7QUFDaEIsWUFBSUMsU0FBUyxJQUFJQyxLQUFKLENBQVVILENBQVYsRUFBYUMsQ0FBYixDQUFiO0FBQ0FDLGVBQU9FLE9BQU9DLFFBQWQsNEJBQTBCO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLG1DQUNoQkwsQ0FEZ0I7O0FBQUE7QUFBQTtBQUFBLG1D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QVk7QUFDdkMsZUFBTyxTQUFTLEtBQUtNLEdBQWQsR0FDRCxPQURDLEdBQ1MsS0FBS0MsR0FEZCxHQUVELFFBRkMsR0FFVSxLQUFLd0IsSUFBTCxFQUZqQjtBQUdILEtBSkQiLCJmaWxlIjoidHVwbGVzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLypcblRoZSBNSVQgTGljZW5zZSAoTUlUKVxuXG5Db3B5cmlnaHQgKGMpIDIwMTQgTWFyY28gRmF1c3RpbmVsbGlcblxuUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxub2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxuaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xudG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG5mdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuXG5UaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpbiBhbGxcbmNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG5cblRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1JcbklNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxuRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXG5BVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSXG5MSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLFxuT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEVcblNPRlRXQVJFLlxuKi9cblxuaW1wb3J0IHtNYXliZX0gZnJvbSAnbWF5YmUnO1xuXG5leHBvcnQgZnVuY3Rpb24gVHVwbGUoKSB7XG59XG5cbmZ1bmN0aW9uIFBhaXIoYSwgYikge1xuICAgIGxldCByZXN1bHQgPSBuZXcgX3BhaXIoYSwgYik7XG4gICAgcmVzdWx0W1N5bWJvbC5pdGVyYXRvcl0gPSBmdW5jdGlvbiooKSB7XG4gICAgICAgIHlpZWxkIGE7XG4gICAgICAgIHlpZWxkIGI7XG4gICAgfTtcbiAgICByZXR1cm4gcmVzdWx0O1xufVxuUGFpci5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFR1cGxlLnByb3RvdHlwZSk7XG5cbmZ1bmN0aW9uIF9wYWlyKGEsIGIpIHtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgMCwge3ZhbHVlOiBhLCB3cml0YWJsZTogZmFsc2V9KTtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgMSwge3ZhbHVlOiBiLCB3cml0YWJsZTogZmFsc2V9KTtcbn1cbl9wYWlyLnByb3RvdHlwZS5pc1BhaXIgPSB0cnVlO1xuX3BhaXIucHJvdG90eXBlLnR5cGUgPSAncGFpcic7XG5fcGFpci5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuICdbJyArIHRoaXNbMF0udG9TdHJpbmcoKSArICcsJyArIHRoaXNbMV0udG9TdHJpbmcoKSArICddJztcbn07XG5cbmZ1bmN0aW9uIFRyaXBsZShhLCBiLCBjKSB7XG4gICAgbGV0IHJlc3VsdCA9IG5ldyBfdHJpcGxlKGEsIGIsIGMpO1xuICAgIHJlc3VsdFtTeW1ib2wuaXRlcmF0b3JdID0gZnVuY3Rpb24qKCkge1xuICAgICAgICB5aWVsZCBhO1xuICAgICAgICB5aWVsZCBiO1xuICAgICAgICB5aWVsZCBjO1xuICAgIH07XG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cblRyaXBsZS5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFR1cGxlLnByb3RvdHlwZSk7XG5cbmZ1bmN0aW9uIF90cmlwbGUoYSwgYiwgYykge1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCAwLCB7dmFsdWU6IGEsIHdyaXRhYmxlOiBmYWxzZX0pO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCAxLCB7dmFsdWU6IGIsIHdyaXRhYmxlOiBmYWxzZX0pO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCAyLCB7dmFsdWU6IGMsIHdyaXRhYmxlOiBmYWxzZX0pO1xufVxuX3RyaXBsZS5wcm90b3R5cGUuaXNUcmlwbGUgPSB0cnVlO1xuX3RyaXBsZS5wcm90b3R5cGUudHlwZSA9ICd0cmlwbGUnO1xuX3RyaXBsZS5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuICdbJyArIHRoaXNbMF0udG9TdHJpbmcoKSArICcsJyArIHRoaXNbMV0udG9TdHJpbmcoKSArICcsJyArIHRoaXNbMl0udG9TdHJpbmcoKSArICddJztcbn07XG5cblR1cGxlLlBhaXIgPSBQYWlyO1xuVHVwbGUucHJvdG90eXBlLlBhaXIgPSBQYWlyO1xuXG5UdXBsZS5UcmlwbGUgPSBUcmlwbGU7XG5UdXBsZS5wcm90b3R5cGUuVHJpcGxlID0gVHJpcGxlO1xuXG5leHBvcnQgZnVuY3Rpb24gUG9zaXRpb24ocm93cyA9IFtdLCByb3cgPSAwLCBjb2wgPSAwKSB7XG4gICAgcmV0dXJuIG5ldyBfcG9zaXRpb24ocm93cywgcm93LCBjb2wpO1xufVxuXG4vL1Bvc2l0aW9uLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoe30pO1xuUG9zaXRpb24uZnJvbVRleHQgPSBmdW5jdGlvbiAodGV4dCkge1xuICAgIGNvbnN0IHJvd3MgPSB0ZXh0LnNwbGl0KCdcXG4nKVxuICAgICAgICAubWFwKHJvdyA9PiByb3cuc3BsaXQoJycpKTtcbiAgICByZXR1cm4gbmV3IF9wb3NpdGlvbihyb3dzLCAwLCAwKTtcbn07XG5cbmZ1bmN0aW9uIF9wb3NpdGlvbihyb3dzLCByb3csIGNvbCkge1xuICAgIHRoaXMucm93cyA9IHJvd3M7XG4gICAgdGhpcy5yb3cgPSByb3c7XG4gICAgdGhpcy5jb2wgPSBjb2w7XG59XG5cbl9wb3NpdGlvbi5wcm90b3R5cGUuaXNQb3NpdGlvbiA9IHRydWU7XG5fcG9zaXRpb24ucHJvdG90eXBlLmNoYXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgbGV0IHJlc3VsdCA9IE1heWJlLk5vdGhpbmcoKTtcbiAgICB0cnkge1xuICAgICAgICBjb25zdCBuZXdSZXN1bHRWYWx1ZSA9IHRoaXMucm93c1t0aGlzLnJvd11bdGhpcy5jb2xdO1xuICAgICAgICBpZiAodHlwZW9mIG5ld1Jlc3VsdFZhbHVlICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgcmVzdWx0ID0gTWF5YmUuSnVzdChuZXdSZXN1bHRWYWx1ZSk7XG4gICAgICAgIH1cbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbn07XG5fcG9zaXRpb24ucHJvdG90eXBlLmluY3JQb3MgPSBmdW5jdGlvbiAodGltZXMgPSAwKSB7XG4gIGNvbnN0IGxhc3RSb3dJbmRleCA9IHRoaXMucm93cy5sZW5ndGggLTE7XG4gIGNvbnN0IGxhc3RDb2x1bW5JbmRleCA9IHRoaXMucm93c1tsYXN0Um93SW5kZXhdLmxlbmd0aCAtMVxuICBsZXQgcmVzdWx0ID0gUG9zaXRpb24odGhpcy5yb3dzLCBsYXN0Um93SW5kZXgsIGxhc3RDb2x1bW5JbmRleCArIDEpO1xuICB0cnkge1xuICAgIGNvbnN0IG5lZWRzUm93SW5jcmVtZW50ID0gKHRoaXMuY29sID09PSB0aGlzLnJvd3NbdGhpcy5yb3ddLmxlbmd0aCAtIDEpO1xuICAgIHJlc3VsdCA9ICh0aW1lcyAqIDEpXG4gICAgICA/IGluY3JQb3NIZWxwZXIodGhpcywgdGltZXMpXG4gICAgICA6IFBvc2l0aW9uKFxuICAgICAgICB0aGlzLnJvd3MsXG4gICAgICAgIChuZWVkc1Jvd0luY3JlbWVudCA/IHRoaXMucm93ICsgMSA6IHRoaXMucm93KSxcbiAgICAgICAgKG5lZWRzUm93SW5jcmVtZW50ID8gMCA6IHRoaXMuY29sICsgMSlcbiAgICApO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH0gY2F0Y2ggKGVycikge31cbiAgcmV0dXJuIHJlc3VsdDtcblxuICBmdW5jdGlvbiBpbmNyUG9zSGVscGVyKHBvcywgdGltZXMgPSAwKSB7XG4gICAgaWYgKHRpbWVzID09PSAwKSByZXR1cm4gcG9zO1xuICAgIHJldHVybiBpbmNyUG9zSGVscGVyKHBvcy5pbmNyUG9zKCksIHRpbWVzIC0gMSlcbiAgfVxufTtcbl9wb3NpdGlvbi5wcm90b3R5cGUuZGVjclBvcyA9IGZ1bmN0aW9uICh0aW1lcyA9IDApIHtcbiAgbGV0IHJlc3VsdCA9IFBvc2l0aW9uKHRoaXMucm93cywgLTEsIC0xKTtcbiAgdHJ5IHtcbiAgICBjb25zdCBuZWVkc1Jvd0RlY3JlbWVudCA9ICh0aGlzLmNvbCA9PT0gMCk7XG4gICAgcmVzdWx0ID0gdGltZXNcbiAgICAgID8gZGVjclBvc0hlbHBlcih0aGlzLCB0aW1lcylcbiAgICAgIDogUG9zaXRpb24oXG4gICAgICAgIHRoaXMucm93cyxcbiAgICAgICAgKG5lZWRzUm93RGVjcmVtZW50ID8gdGhpcy5yb3cgLSAxIDogdGhpcy5yb3cpLFxuICAgICAgICAobmVlZHNSb3dEZWNyZW1lbnQgPyB0aGlzLnJvd3NbdGhpcy5yb3cgLTFdLmxlbmd0aCAtIDEgOiB0aGlzLmNvbCAtIDEpXG4gICAgKTtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9IGNhdGNoIChlcnIpIHt9XG4gIHJldHVybiByZXN1bHQ7XG5cbiAgZnVuY3Rpb24gZGVjclBvc0hlbHBlcihwb3MsIHRpbWVzID0gMCkge1xuICAgIGlmICh0aW1lcyA9PT0gMCkgcmV0dXJuIHBvcztcbiAgICByZXR1cm4gZGVjclBvc0hlbHBlcihwb3MuZGVjclBvcygpLCB0aW1lcyAtIDEpXG4gIH1cbn07XG5fcG9zaXRpb24ucHJvdG90eXBlLnJlc3QgPSBmdW5jdGlvbiAoKSB7XG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XG4gICAgcmV0dXJuIHJlc3RfaGVscGVyKCkuam9pbignJyk7XG4gICAgZnVuY3Rpb24gcmVzdF9oZWxwZXIoKSB7XG4gICAgICAgIGNvbnN0IG5leHQgPSBzZWxmLmNoYXIoKTtcbiAgICAgICAgaWYgKG5leHQuaXNOb3RoaW5nKSByZXR1cm4gW107XG4gICAgICAgIHJldHVybiBbbmV4dC52YWx1ZV0uY29uY2F0KHNlbGYuaW5jclBvcygpLnJlc3QoKSk7XG4gICAgfVxufTtcbl9wb3NpdGlvbi5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuICdyb3c9JyArIHRoaXMucm93XG4gICAgICAgICsgJztjb2w9JyArIHRoaXMuY29sXG4gICAgICAgICsgJztyZXN0PScgKyB0aGlzLnJlc3QoKTtcbn07XG4iXX0=