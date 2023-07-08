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
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2pzL3R1cGxlcy5qcyJdLCJuYW1lcyI6WyJUdXBsZSIsIlBvc2l0aW9uIiwiUGFpciIsImEiLCJiIiwicmVzdWx0IiwiX3BhaXIiLCJTeW1ib2wiLCJpdGVyYXRvciIsInByb3RvdHlwZSIsIk9iamVjdCIsImNyZWF0ZSIsImRlZmluZVByb3BlcnR5IiwidmFsdWUiLCJ3cml0YWJsZSIsImlzUGFpciIsInR5cGUiLCJ0b1N0cmluZyIsIlRyaXBsZSIsImMiLCJfdHJpcGxlIiwiaXNUcmlwbGUiLCJyb3dzIiwicm93IiwiY29sIiwiX3Bvc2l0aW9uIiwiZnJvbVRleHQiLCJ0ZXh0Iiwic3BsaXQiLCJtYXAiLCJpc1Bvc2l0aW9uIiwiY2hhciIsIk1heWJlIiwiTm90aGluZyIsIm5ld1Jlc3VsdFZhbHVlIiwiSnVzdCIsImVyciIsImluY3JQb3MiLCJ0aW1lcyIsImxhc3RSb3dJbmRleCIsImxlbmd0aCIsImxhc3RDb2x1bW5JbmRleCIsIm5lZWRzUm93SW5jcmVtZW50IiwiaW5jclBvc0hlbHBlciIsInBvcyIsImRlY3JQb3MiLCJuZWVkc1Jvd0RlY3JlbWVudCIsImRlY3JQb3NIZWxwZXIiLCJyZXN0Iiwic2VsZiIsInJlc3RfaGVscGVyIiwiam9pbiIsIm5leHQiLCJpc05vdGhpbmciLCJjb25jYXQiXSwibWFwcGluZ3MiOiI7Ozs7OztVQTBCZ0JBLEssR0FBQUEsSztVQW1EQUMsUSxHQUFBQSxRO0FBbkRULFdBQVNELEtBQVQsR0FBaUIsQ0FDdkIsQyxDQTNCRDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBNkJBLFdBQVNFLElBQVQsQ0FBY0MsQ0FBZCxFQUFpQkMsQ0FBakIsRUFBb0I7QUFDbEIsUUFBTUMsU0FBUyxJQUFJQyxLQUFKLENBQVVILENBQVYsRUFBYUMsQ0FBYixDQUFmO0FBQ0FDLFdBQU9FLE9BQU9DLFFBQWQsNEJBQTBCO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLHFCQUNsQkwsQ0FEa0I7O0FBQUE7QUFBQTtBQUFBLHFC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S00sR0FBZCxHQUNDLE9BREQsR0FDVyxLQUFLQyxHQURoQixHQUVDLFFBRkQsR0FFWSxLQUFLd0IsSUFBTCxFQUZuQjtBQUdELEdBSkQiLCJmaWxlIjoidHVwbGVzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLypcblRoZSBNSVQgTGljZW5zZSAoTUlUKVxuXG5Db3B5cmlnaHQgKGMpIDIwMTQgTWFyY28gRmF1c3RpbmVsbGlcblxuUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxub2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxuaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xudG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG5mdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuXG5UaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpbiBhbGxcbmNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG5cblRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1JcbklNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxuRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXG5BVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSXG5MSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLFxuT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEVcblNPRlRXQVJFLlxuKi9cblxuaW1wb3J0IHsgTWF5YmUgfSBmcm9tICdtYXliZSc7XG5cbmV4cG9ydCBmdW5jdGlvbiBUdXBsZSgpIHtcbn1cblxuZnVuY3Rpb24gUGFpcihhLCBiKSB7XG4gIGNvbnN0IHJlc3VsdCA9IG5ldyBfcGFpcihhLCBiKTtcbiAgcmVzdWx0W1N5bWJvbC5pdGVyYXRvcl0gPSBmdW5jdGlvbiooKSB7XG4gICAgeWllbGQgYTtcbiAgICB5aWVsZCBiO1xuICB9O1xuICByZXR1cm4gcmVzdWx0O1xufVxuUGFpci5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFR1cGxlLnByb3RvdHlwZSk7XG5cbmZ1bmN0aW9uIF9wYWlyKGEsIGIpIHtcbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsIDAsIHsgdmFsdWU6IGEsIHdyaXRhYmxlOiBmYWxzZSB9KTtcbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsIDEsIHsgdmFsdWU6IGIsIHdyaXRhYmxlOiBmYWxzZSB9KTtcbn1cbl9wYWlyLnByb3RvdHlwZS5pc1BhaXIgPSB0cnVlO1xuX3BhaXIucHJvdG90eXBlLnR5cGUgPSAncGFpcic7XG5fcGFpci5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuICdbJyArIHRoaXNbMF0udG9TdHJpbmcoKSArICcsJyArIHRoaXNbMV0udG9TdHJpbmcoKSArICddJztcbn07XG5cbmZ1bmN0aW9uIFRyaXBsZShhLCBiLCBjKSB7XG4gIGNvbnN0IHJlc3VsdCA9IG5ldyBfdHJpcGxlKGEsIGIsIGMpO1xuICByZXN1bHRbU3ltYm9sLml0ZXJhdG9yXSA9IGZ1bmN0aW9uKigpIHtcbiAgICB5aWVsZCBhO1xuICAgIHlpZWxkIGI7XG4gICAgeWllbGQgYztcbiAgfTtcbiAgcmV0dXJuIHJlc3VsdDtcbn1cblRyaXBsZS5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFR1cGxlLnByb3RvdHlwZSk7XG5cbmZ1bmN0aW9uIF90cmlwbGUoYSwgYiwgYykge1xuICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgMCwgeyB2YWx1ZTogYSwgd3JpdGFibGU6IGZhbHNlIH0pO1xuICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgMSwgeyB2YWx1ZTogYiwgd3JpdGFibGU6IGZhbHNlIH0pO1xuICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgMiwgeyB2YWx1ZTogYywgd3JpdGFibGU6IGZhbHNlIH0pO1xufVxuX3RyaXBsZS5wcm90b3R5cGUuaXNUcmlwbGUgPSB0cnVlO1xuX3RyaXBsZS5wcm90b3R5cGUudHlwZSA9ICd0cmlwbGUnO1xuX3RyaXBsZS5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuICdbJyArIHRoaXNbMF0udG9TdHJpbmcoKSArICcsJyArIHRoaXNbMV0udG9TdHJpbmcoKSArICcsJyArIHRoaXNbMl0udG9TdHJpbmcoKSArICddJztcbn07XG5cblR1cGxlLlBhaXIgPSBQYWlyO1xuVHVwbGUucHJvdG90eXBlLlBhaXIgPSBQYWlyO1xuXG5UdXBsZS5UcmlwbGUgPSBUcmlwbGU7XG5UdXBsZS5wcm90b3R5cGUuVHJpcGxlID0gVHJpcGxlO1xuXG5leHBvcnQgZnVuY3Rpb24gUG9zaXRpb24ocm93cyA9IFtdLCByb3cgPSAwLCBjb2wgPSAwKSB7XG4gIHJldHVybiBuZXcgX3Bvc2l0aW9uKHJvd3MsIHJvdywgY29sKTtcbn1cblxuLy8gUG9zaXRpb24ucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZSh7fSk7XG5Qb3NpdGlvbi5mcm9tVGV4dCA9IGZ1bmN0aW9uKHRleHQpIHtcbiAgY29uc3Qgcm93cyA9IHRleHQuc3BsaXQoJ1xcbicpXG4gICAgLm1hcChyb3cgPT4gcm93LnNwbGl0KCcnKSk7XG4gIHJldHVybiBuZXcgX3Bvc2l0aW9uKHJvd3MsIDAsIDApO1xufTtcblxuZnVuY3Rpb24gX3Bvc2l0aW9uKHJvd3MsIHJvdywgY29sKSB7XG4gIHRoaXMucm93cyA9IHJvd3M7XG4gIHRoaXMucm93ID0gcm93O1xuICB0aGlzLmNvbCA9IGNvbDtcbn1cblxuX3Bvc2l0aW9uLnByb3RvdHlwZS5pc1Bvc2l0aW9uID0gdHJ1ZTtcbl9wb3NpdGlvbi5wcm90b3R5cGUuY2hhciA9IGZ1bmN0aW9uKCkge1xuICBsZXQgcmVzdWx0ID0gTWF5YmUuTm90aGluZygpO1xuICB0cnkge1xuICAgIGNvbnN0IG5ld1Jlc3VsdFZhbHVlID0gdGhpcy5yb3dzW3RoaXMucm93XVt0aGlzLmNvbF07XG4gICAgaWYgKHR5cGVvZiBuZXdSZXN1bHRWYWx1ZSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHJlc3VsdCA9IE1heWJlLkp1c3QobmV3UmVzdWx0VmFsdWUpO1xuICAgIH1cbiAgfSBjYXRjaCAoZXJyKSB7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn07XG5fcG9zaXRpb24ucHJvdG90eXBlLmluY3JQb3MgPSBmdW5jdGlvbih0aW1lcyA9IDApIHtcbiAgY29uc3QgbGFzdFJvd0luZGV4ID0gdGhpcy5yb3dzLmxlbmd0aCAtIDE7XG4gIGNvbnN0IGxhc3RDb2x1bW5JbmRleCA9IHRoaXMucm93c1tsYXN0Um93SW5kZXhdLmxlbmd0aCAtIDE7XG4gIGxldCByZXN1bHQgPSBQb3NpdGlvbih0aGlzLnJvd3MsIGxhc3RSb3dJbmRleCwgbGFzdENvbHVtbkluZGV4ICsgMSk7XG4gIHRyeSB7XG4gICAgY29uc3QgbmVlZHNSb3dJbmNyZW1lbnQgPSAodGhpcy5jb2wgPT09IHRoaXMucm93c1t0aGlzLnJvd10ubGVuZ3RoIC0gMSk7XG4gICAgcmVzdWx0ID0gKHRpbWVzICogMSlcbiAgICAgID8gaW5jclBvc0hlbHBlcih0aGlzLCB0aW1lcylcbiAgICAgIDogUG9zaXRpb24oXG4gICAgICAgIHRoaXMucm93cyxcbiAgICAgICAgKG5lZWRzUm93SW5jcmVtZW50ID8gdGhpcy5yb3cgKyAxIDogdGhpcy5yb3cpLFxuICAgICAgICAobmVlZHNSb3dJbmNyZW1lbnQgPyAwIDogdGhpcy5jb2wgKyAxKSxcbiAgICAgICk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfSBjYXRjaCAoZXJyKSB7fVxuICByZXR1cm4gcmVzdWx0O1xuXG4gIGZ1bmN0aW9uIGluY3JQb3NIZWxwZXIocG9zLCB0aW1lcyA9IDApIHtcbiAgICBpZiAodGltZXMgPT09IDApIHJldHVybiBwb3M7XG4gICAgcmV0dXJuIGluY3JQb3NIZWxwZXIocG9zLmluY3JQb3MoKSwgdGltZXMgLSAxKTtcbiAgfVxufTtcbl9wb3NpdGlvbi5wcm90b3R5cGUuZGVjclBvcyA9IGZ1bmN0aW9uKHRpbWVzID0gMCkge1xuICBsZXQgcmVzdWx0ID0gUG9zaXRpb24odGhpcy5yb3dzLCAtMSwgLTEpO1xuICB0cnkge1xuICAgIGNvbnN0IG5lZWRzUm93RGVjcmVtZW50ID0gKHRoaXMuY29sID09PSAwKTtcbiAgICByZXN1bHQgPSB0aW1lc1xuICAgICAgPyBkZWNyUG9zSGVscGVyKHRoaXMsIHRpbWVzKVxuICAgICAgOiBQb3NpdGlvbihcbiAgICAgICAgdGhpcy5yb3dzLFxuICAgICAgICAobmVlZHNSb3dEZWNyZW1lbnQgPyB0aGlzLnJvdyAtIDEgOiB0aGlzLnJvdyksXG4gICAgICAgIChuZWVkc1Jvd0RlY3JlbWVudCA/IHRoaXMucm93c1t0aGlzLnJvdyAtIDFdLmxlbmd0aCAtIDEgOiB0aGlzLmNvbCAtIDEpLFxuICAgICAgKTtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9IGNhdGNoIChlcnIpIHt9XG4gIHJldHVybiByZXN1bHQ7XG5cbiAgZnVuY3Rpb24gZGVjclBvc0hlbHBlcihwb3MsIHRpbWVzID0gMCkge1xuICAgIGlmICh0aW1lcyA9PT0gMCkgcmV0dXJuIHBvcztcbiAgICByZXR1cm4gZGVjclBvc0hlbHBlcihwb3MuZGVjclBvcygpLCB0aW1lcyAtIDEpO1xuICB9XG59O1xuX3Bvc2l0aW9uLnByb3RvdHlwZS5yZXN0ID0gZnVuY3Rpb24oKSB7XG4gIGNvbnN0IHNlbGYgPSB0aGlzO1xuICByZXR1cm4gcmVzdF9oZWxwZXIoKS5qb2luKCcnKTtcbiAgZnVuY3Rpb24gcmVzdF9oZWxwZXIoKSB7XG4gICAgY29uc3QgbmV4dCA9IHNlbGYuY2hhcigpO1xuICAgIGlmIChuZXh0LmlzTm90aGluZykgcmV0dXJuIFtdO1xuICAgIHJldHVybiBbbmV4dC52YWx1ZV0uY29uY2F0KHNlbGYuaW5jclBvcygpLnJlc3QoKSk7XG4gIH1cbn07XG5fcG9zaXRpb24ucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiAncm93PScgKyB0aGlzLnJvd1xuICAgICAgICArICc7Y29sPScgKyB0aGlzLmNvbFxuICAgICAgICArICc7cmVzdD0nICsgdGhpcy5yZXN0KCk7XG59O1xuIl19