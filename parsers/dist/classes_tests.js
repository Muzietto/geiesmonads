define(['chai', 'util', 'classes'], function (_chai, _util, _classes) {
  'use strict';

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

  describe('among helper classes', function () {

    describe('Position\'s', function () {
      var rows = [[1, 2, 3], ['a', 'b', 'c', 'd'], ['A', 'B', 'C']];
      it('include tables of chars and allow to retrieve char options', function () {
        var pos00 = (0, _classes.Position)(rows, 0, 0);
        (0, _chai.expect)(pos00.isPosition).to.be.true;
        (0, _chai.expect)(pos00.char().isJust).to.be.true;
        (0, _chai.expect)(pos00.char().value).to.be.eql(1);
        var pos11 = (0, _classes.Position)(rows, 1, 1);
        (0, _chai.expect)(pos11.char().isJust).to.be.true;
        (0, _chai.expect)(pos11.char().value).to.be.eql('b');
      });
      it('allow to increment the position and retrieve further chars', function () {
        var pos01 = (0, _classes.Position)(rows, 0, 0).incrPos();
        (0, _chai.expect)(pos01.char().value).to.be.eql(2);
        var pos20 = (0, _classes.Position)(rows, 1, 3).incrPos();
        (0, _chai.expect)(pos20.char().value).to.be.eql('A');
        var pos22 = (0, _classes.Position)(rows, 1, 3).incrPos(3);
        (0, _chai.expect)(pos22.char().value).to.be.eql('C');
      });
      it('allow to decrement the position and retrieve further chars', function () {
        var pos01 = (0, _classes.Position)(rows, 0, 2).decrPos();
        (0, _chai.expect)(pos01.char().value).to.be.eql(2);
        var pos13 = (0, _classes.Position)(rows, 2, 0).decrPos();
        (0, _chai.expect)(pos13.char().value).to.be.eql('d');
        var pos02 = (0, _classes.Position)(rows, 2, 0).decrPos(5);
        (0, _chai.expect)(pos02.char().value).to.be.eql(3);
      });
      it('return char() === Nothing when position is beyond the contained rows content', function () {
        var pos1010 = (0, _classes.Position)(rows, 10, 10);
        (0, _chai.expect)(pos1010.char().isNothing).to.be.true;
        var pos23 = (0, _classes.Position)(rows, 2, 2).incrPos();
        (0, _chai.expect)(pos23.char().isNothing).to.be.true;
      });
      it('return char() === Nothing when incrementing at the end', function () {
        var posBeyond1 = (0, _classes.Position)(rows, 2, 2).incrPos();
        (0, _chai.expect)(posBeyond1.char().isNothing).to.be.true;
        var posBeyondALot = (0, _classes.Position)(rows, 0, 0).incrPos(100);
        (0, _chai.expect)(posBeyondALot.char().isNothing).to.be.true;
      });
      it('return char() === Nothing when decrementing at the start', function () {
        var posMinus1 = (0, _classes.Position)(rows, 0, 0).decrPos();
        (0, _chai.expect)(posMinus1.char().isNothing).to.be.true;
        var posMinus10 = (0, _classes.Position)(rows, 0, 0).decrPos(10);
        (0, _chai.expect)(posMinus10.char().isNothing).to.be.true;
      });
      it('can be initialized from text strings', function () {
        var pos00 = _classes.Position.fromText('Lorem ipsum dolor sit amet');
        (0, _chai.expect)(pos00.char().value).to.be.eql('L');
        (0, _chai.expect)(pos00.incrPos().incrPos().incrPos().incrPos().char().value).to.be.eql('m');
      });
      it('can be initialized also from multiline text strings, stripping newlines away', function () {
        var pos00 = _classes.Position.fromText('Lorem \nipsum');
        (0, _chai.expect)(pos00.char().value).to.be.eql('L');
        (0, _chai.expect)(pos00.incrPos().incrPos().incrPos().incrPos().incrPos().incrPos().char().value).to.be.eql('i');
      });
      it('return strings containing all characters starting from a given position, for the sake of testing', function () {
        var pos01 = _classes.Position.fromText('Lorem').incrPos();
        (0, _chai.expect)(pos01.rest()).to.be.eql('orem');
      });
      it('returns rest === \'\' when we get to the end', function () {
        var pos01 = _classes.Position.fromText('L').incrPos();
        (0, _chai.expect)(pos01.rest()).to.be.eql('');
      });
    });

    describe('somes', function () {
      it('include a value and allow to retrieve it', function () {
        var aSome = (0, _classes.some)(12);
        (0, _chai.expect)(aSome.val()).to.be.eql(12);
        (0, _chai.expect)((0, _util.isSome)(aSome)).to.be.true;
        (0, _chai.expect)(aSome.toString()).to.be.eql('some(12)');
      });
    });

    describe('nones', function () {
      it('are just a signpost', function () {
        var aNone = (0, _classes.none)();
        (0, _chai.expect)(aNone.val()).to.be.null;
        (0, _chai.expect)((0, _util.isNone)(aNone)).to.be.true;
        (0, _chai.expect)(aNone.toString()).to.be.eql('none()');
      });
    });

    describe('pairs', function () {
      it('include 2 values and allow to retrieve them', function () {
        var apair = (0, _classes.pair)(true, 12);
        (0, _chai.expect)(apair[0]).to.be.eql(true);
        (0, _chai.expect)(apair[1]).to.be.eql(12);
        (0, _chai.expect)(apair.type).to.be.eql('pair');
        (0, _chai.expect)((0, _util.isPair)(apair)).to.be.true;
      });
      it('are actually arrays, and therefore allow positional destructuring', function () {
        var _pair = (0, _classes.pair)(true, 12),
            _pair2 = _slicedToArray(_pair, 2),
            a = _pair2[0],
            b = _pair2[1];

        (0, _chai.expect)(a).to.be.eql(true);
        (0, _chai.expect)(b).to.be.eql(12);
      });
    });

    describe('Pair\'s', function () {
      it('include 2 values and allow to retrieve them', function () {
        var apair = _classes.Tuple.Pair(true, 12);
        (0, _chai.expect)(apair[0]).to.be.eql(true);
        (0, _chai.expect)(apair[1]).to.be.eql(12);
        (0, _chai.expect)(apair.type).to.be.eql('pair');
        (0, _chai.expect)(apair.isPair).to.be.true;
        (0, _chai.expect)(apair.toString()).to.be.eql('[true,12]');
      });
      it('are immutable, and throw if you try to change them', function () {
        var apair = _classes.Tuple.Pair(true, 12);
        (0, _chai.expect)(function () {
          apair[0] = false;
        }).to.throw;
        (0, _chai.expect)(function () {
          apair[1] = 13;
        }).to.throw;
      });
      it('are true iterables, and therefore allow positional destructuring', function () {
        var _Tuple$Pair = _classes.Tuple.Pair(true, 12),
            _Tuple$Pair2 = _slicedToArray(_Tuple$Pair, 2),
            a = _Tuple$Pair2[0],
            b = _Tuple$Pair2[1];

        (0, _chai.expect)(a).to.be.eql(true);
        (0, _chai.expect)(b).to.be.eql(12);
      });
    });

    describe('Triple\'s', function () {
      it('include 3 values and allow to retrieve them', function () {
        var atriple = _classes.Tuple.Triple(true, 12, 'a');
        (0, _chai.expect)(atriple[0]).to.be.eql(true);
        (0, _chai.expect)(atriple[1]).to.be.eql(12);
        (0, _chai.expect)(atriple[2]).to.be.eql('a');
        (0, _chai.expect)(atriple.type).to.be.eql('triple');
        (0, _chai.expect)(atriple.isTriple).to.be.true;
        (0, _chai.expect)(atriple.toString()).to.be.eql('[true,12,a]');
      });
      it('are immutable, and throw if you try to change them', function () {
        var atriple = _classes.Tuple.Triple(true, 12, 'a');
        (0, _chai.expect)(function () {
          atriple[0] = false;
        }).to.throw;
        (0, _chai.expect)(function () {
          atriple[1] = 13;
        }).to.throw;
        (0, _chai.expect)(function () {
          atriple[2] = 'b';
        }).to.throw;
      });
      it('are true iterables, and therefore allow positional destructuring', function () {
        var _Tuple$Triple = _classes.Tuple.Triple(true, 12, 'a'),
            _Tuple$Triple2 = _slicedToArray(_Tuple$Triple, 3),
            a = _Tuple$Triple2[0],
            b = _Tuple$Triple2[1],
            c = _Tuple$Triple2[2];

        (0, _chai.expect)(a).to.be.eql(true);
        (0, _chai.expect)(b).to.be.eql(12);
        (0, _chai.expect)(c).to.be.eql('a');
      });
    });

    describe('success and failure', function () {
      beforeEach(function () {});
      it('may represent successes', function () {
        var succ = (0, _classes.success)(true, 12);
        (0, _chai.expect)(succ[0]).to.be.true;
        (0, _chai.expect)(succ[1]).to.be.eql(12);
        (0, _chai.expect)((0, _util.isSuccess)(succ)).to.be.true;
        (0, _chai.expect)((0, _util.isPair)(succ)).to.be.true;
      });
      it('may represent failures', function () {
        var fail = (0, _classes.failure)('a', 12);
        (0, _chai.expect)(fail[0]).to.be.eql('a');
        (0, _chai.expect)(fail[1]).to.be.eql(12);
        (0, _chai.expect)((0, _util.isSuccess)(fail)).to.be.false;
        (0, _chai.expect)((0, _util.isFailure)(fail)).to.be.true;
        (0, _chai.expect)((0, _util.isPair)(fail)).to.be.true;
      });
    });

    describe('JValue\'s are parsed JSON values', function () {
      describe('with JString\'s as parsed JSON string values', function () {
        var jstring = _classes.JValue.JString('abc');
        it('that are retrievable', function () {
          (0, _chai.expect)(jstring.value).to.be.eql('abc');
          (0, _chai.expect)(jstring.toString()).to.be.eql('JString(abc)');
        });
        it('that are immutable', function () {
          (0, _chai.expect)(function () {
            jstring.value = 'def';
          }).to.throw;
        });
        it('that gotta be strings', function () {
          (0, _chai.expect)(function () {
            return _classes.JValue.JString(123);
          }).to.throw;
        });
        it('that gotta by types with a supertype', function () {
          var jstring = _classes.JValue.JString('123');
          (0, _chai.expect)(jstring.isJValue).to.be.true;
          (0, _chai.expect)(jstring.isJString).to.be.true;
        });
      });
      it('with JNumber\'s as parsed JSON float values', function () {
        var jnumber = _classes.JValue.JNumber(123.45e-23);
        (0, _chai.expect)(jnumber.value).to.be.eql(123.45e-23);
        (0, _chai.expect)(jnumber.toString()).to.be.eql('JNumber(1.2345e-21)');
        (0, _chai.expect)(jnumber.isJValue).to.be.true;
        (0, _chai.expect)(jnumber.isJNumber).to.be.true;
        (0, _chai.expect)(function () {
          jnumber.value = 123;
        }).to.throw;
        (0, _chai.expect)(function () {
          return _classes.JValue.JNumber('x');
        }).to.throw;
        (0, _chai.expect)(function () {
          return _classes.JValue.JNumber(NaN);
        }).to.throw;
      });
      it('with JBool\'s as parsed JSON boolean values', function () {
        var jbool = _classes.JValue.JBool(true);
        (0, _chai.expect)(jbool.value).to.be.true;
        (0, _chai.expect)(jbool.toString()).to.be.eql('JBool(true)');
        (0, _chai.expect)(jbool.isJValue).to.be.true;
        (0, _chai.expect)(jbool.isJBool).to.be.true;
        (0, _chai.expect)(function () {
          jbool.value = false;
        }).to.throw;
        (0, _chai.expect)(function () {
          return _classes.JValue.JBool('x');
        }).to.throw;
        (0, _chai.expect)(function () {
          return _classes.JValue.JBool(123);
        }).to.throw;
        (0, _chai.expect)(function () {
          return _classes.JValue.JBool(NaN);
        }).to.throw;
      });
      it('with JNull\'s as parsed JSON null values', function () {
        var jnull = _classes.JValue.JNull(null);
        (0, _chai.expect)(jnull.value).to.be.null;
        (0, _chai.expect)(jnull.toString()).to.be.eql('JNull(null)');
        (0, _chai.expect)(jnull.isJValue).to.be.true;
        (0, _chai.expect)(jnull.isJNull).to.be.true;
        (0, _chai.expect)(function () {
          jnull.value = 123;
        }).to.throw;
        (0, _chai.expect)(function () {
          return _classes.JValue.JNull('');
        }).to.throw;
        (0, _chai.expect)(function () {
          return _classes.JValue.JNull(undefined);
        }).to.throw;
        (0, _chai.expect)(function () {
          return _classes.JValue.JNull(NaN);
        }).to.throw;
      });
      it('with JArray\'s as parsed JSON arrays', function () {
        var jarray = _classes.JValue.JArray(_classes.JValue.JString('a'), _classes.JValue.JBool(false), _classes.JValue.JNull(null));
        var jarValue = jarray.value;
        (0, _chai.expect)(jarValue[0].value).to.be.eql('a');
        (0, _chai.expect)(jarValue[1].value).to.be.eql(false);
        (0, _chai.expect)(jarValue[2].value).to.be.eql(null);
        (0, _chai.expect)(jarray.toString()).to.be.eql('JArray([JString(a),JBool(false),JNull(null),])');
        (0, _chai.expect)(jarray.isJValue).to.be.true;
        (0, _chai.expect)(jarray.isJArray).to.be.true;
        (0, _chai.expect)(function () {
          jarray.value = 123;
        }).to.throw;
        (0, _chai.expect)(function () {
          return _classes.JValue.JArray('');
        }).to.throw;
        (0, _chai.expect)(function () {
          return _classes.JValue.JArray(undefined);
        }).to.throw;
        (0, _chai.expect)(function () {
          return _classes.JValue.JArray(NaN);
        }).to.throw;
      });
      it('with JObjects\'s as parsed JSON objects', function () {
        var jobject = _classes.JValue.JObject(_classes.Tuple.Pair('string', _classes.JValue.JString('a')), _classes.Tuple.Pair('boolean', _classes.JValue.JBool(false)), _classes.Tuple.Pair('null', _classes.JValue.JNull(null)));
        (0, _chai.expect)(jobject.string.value).to.be.eql('a');
        (0, _chai.expect)(jobject.boolean.value).to.be.eql(false);
        (0, _chai.expect)(jobject.null.value).to.be.eql(null);
        // expect(jobject.toString()).to.be.eql('JArray([JString(a),JBool(false),JNull(null),])');
        (0, _chai.expect)(jobject.isJValue).to.be.true;
        (0, _chai.expect)(jobject.isJObject).to.be.true;
        (0, _chai.expect)(function () {
          jobject.string = 'abc';
        }).to.throw;
        (0, _chai.expect)(function () {
          return _classes.JValue.JObject(_classes.JValue.JObject(_classes.Tuple.Pair('string', _classes.JValue.JString('a')), _classes.Tuple.Pair('boolean', false), // value must be a JValue
          _classes.Tuple.Pair('null', _classes.JValue.JNull(null))));
        }).to.throw;
        (0, _chai.expect)(function () {
          return _classes.JValue.JObject(_classes.JValue.JObject(_classes.Tuple.Pair('string', _classes.JValue.JString('a')), _classes.Tuple.Pair(123, _classes.JValue.JNull(null)) // key must be a string
          ));
        }).to.throw;
        (0, _chai.expect)(function () {
          return _classes.JValue.JNull(_classes.Tuple.Triple(1, 2, 3));
        }).to.throw;
      });
    });
  });
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2pzLXNwZWMvY2xhc3Nlc190ZXN0cy5qcyJdLCJuYW1lcyI6WyJkZXNjcmliZSIsInJvd3MiLCJpdCIsInBvczAwIiwiaXNQb3NpdGlvbiIsInRvIiwiYmUiLCJ0cnVlIiwiY2hhciIsImlzSnVzdCIsInZhbHVlIiwiZXFsIiwicG9zMTEiLCJwb3MwMSIsImluY3JQb3MiLCJwb3MyMCIsInBvczIyIiwiZGVjclBvcyIsInBvczEzIiwicG9zMDIiLCJwb3MxMDEwIiwiaXNOb3RoaW5nIiwicG9zMjMiLCJwb3NCZXlvbmQxIiwicG9zQmV5b25kQUxvdCIsInBvc01pbnVzMSIsInBvc01pbnVzMTAiLCJQb3NpdGlvbiIsImZyb21UZXh0IiwicmVzdCIsImFTb21lIiwidmFsIiwidG9TdHJpbmciLCJhTm9uZSIsIm51bGwiLCJhcGFpciIsInR5cGUiLCJhIiwiYiIsIlR1cGxlIiwiUGFpciIsImlzUGFpciIsInRocm93IiwiYXRyaXBsZSIsIlRyaXBsZSIsImlzVHJpcGxlIiwiYyIsImJlZm9yZUVhY2giLCJzdWNjIiwiZmFpbCIsImZhbHNlIiwianN0cmluZyIsIkpWYWx1ZSIsIkpTdHJpbmciLCJpc0pWYWx1ZSIsImlzSlN0cmluZyIsImpudW1iZXIiLCJKTnVtYmVyIiwiaXNKTnVtYmVyIiwiTmFOIiwiamJvb2wiLCJKQm9vbCIsImlzSkJvb2wiLCJqbnVsbCIsIkpOdWxsIiwiaXNKTnVsbCIsInVuZGVmaW5lZCIsImphcnJheSIsIkpBcnJheSIsImphclZhbHVlIiwiaXNKQXJyYXkiLCJqb2JqZWN0IiwiSk9iamVjdCIsInN0cmluZyIsImJvb2xlYW4iLCJpc0pPYmplY3QiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBbUJBQSxXQUFTLHNCQUFULEVBQWlDLFlBQU07O0FBRXJDQSxhQUFTLGFBQVQsRUFBd0IsWUFBTTtBQUM1QixVQUFNQyxPQUFPLENBQ1gsQ0FBQyxDQUFELEVBQUksQ0FBSixF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LFNBQVAsRUFBa0R2QyxFQUFsRCxDQUFxRHFDLEtBQXJEO0FBQ0QsT0F6QkQ7QUEyQkQsS0F0R0Q7QUF1R0QsR0E1UkQiLCJmaWxlIjoiY2xhc3Nlc190ZXN0cy5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGV4cGVjdCB9IGZyb20gJ2NoYWknO1xyXG5pbXBvcnQge1xyXG4gIGlzUGFpcixcclxuICBpc1N1Y2Nlc3MsXHJcbiAgaXNGYWlsdXJlLFxyXG4gIGlzU29tZSxcclxuICBpc05vbmUsXHJcbn0gZnJvbSAndXRpbCc7XHJcbmltcG9ydCB7XHJcbiAgcGFpcixcclxuICBzdWNjZXNzLFxyXG4gIGZhaWx1cmUsXHJcbiAgc29tZSxcclxuICBub25lLFxyXG4gIFBvc2l0aW9uLFxyXG4gIFR1cGxlLFxyXG4gIEpWYWx1ZSxcclxufSBmcm9tICdjbGFzc2VzJztcclxuXHJcbmRlc2NyaWJlKCdhbW9uZyBoZWxwZXIgY2xhc3NlcycsICgpID0+IHtcclxuXHJcbiAgZGVzY3JpYmUoJ1Bvc2l0aW9uXFwncycsICgpID0+IHtcclxuICAgIGNvbnN0IHJvd3MgPSBbXHJcbiAgICAgIFsxLCAyLCAzXSxcclxuICAgICAgWydhJywgJ2InLCAnYycsICdkJ10sXHJcbiAgICAgIFsnQScsICdCJywgJ0MnXSxcclxuICAgIF07XHJcbiAgICBpdCgnaW5jbHVkZSB0YWJsZXMgb2YgY2hhcnMgYW5kIGFsbG93IHRvIHJldHJpZXZlIGNoYXIgb3B0aW9ucycsICgpID0+IHtcclxuICAgICAgY29uc3QgcG9zMDAgPSBQb3NpdGlvbihyb3dzLCAwLCAwKTtcclxuICAgICAgZXhwZWN0KHBvczAwLmlzUG9zaXRpb24pLnRvLmJlLnRydWU7XHJcbiAgICAgIGV4cGVjdChwb3MwMC5jaGFyKCkuaXNKdXN0KS50by5iZS50cnVlO1xyXG4gICAgICBleHBlY3QocG9zMDAuY2hhcigpLnZhbHVlKS50by5iZS5lcWwoMSk7XHJcbiAgICAgIGNvbnN0IHBvczExID0gUG9zaXRpb24ocm93cywgMSwgMSk7XHJcbiAgICAgIGV4cGVjdChwb3MxMS5jaGFyKCkuaXNKdXN0KS50by5iZS50cnVlO1xyXG4gICAgICBleHBlY3QocG9zMTEuY2hhcigpLnZhbHVlKS50by5iZS5lcWwoJ2InKTtcclxuICAgIH0pO1xyXG4gICAgaXQoJ2FsbG93IHRvIGluY3JlbWVudCB0aGUgcG9zaXRpb24gYW5kIHJldHJpZXZlIGZ1cnRoZXIgY2hhcnMnLCAoKSA9PiB7XHJcbiAgICAgIGNvbnN0IHBvczAxID0gUG9zaXRpb24ocm93cywgMCwgMCkuaW5jclBvcygpO1xyXG4gICAgICBleHBlY3QocG9zMDEuY2hhcigpLnZhbHVlKS50by5iZS5lcWwoMik7XHJcbiAgICAgIGNvbnN0IHBvczIwID0gUG9zaXRpb24ocm93cywgMSwgMykuaW5jclBvcygpO1xyXG4gICAgICBleHBlY3QocG9zMjAuY2hhcigpLnZhbHVlKS50by5iZS5lcWwoJ0EnKTtcclxuICAgICAgY29uc3QgcG9zMjIgPSBQb3NpdGlvbihyb3dzLCAxLCAzKS5pbmNyUG9zKDMpO1xyXG4gICAgICBleHBlY3QocG9zMjIuY2hhcigpLnZhbHVlKS50by5iZS5lcWwoJ0MnKTtcclxuICAgIH0pO1xyXG4gICAgaXQoJ2FsbG93IHRvIGRlY3JlbWVudCB0aGUgcG9zaXRpb24gYW5kIHJldHJpZXZlIGZ1cnRoZXIgY2hhcnMnLCAoKSA9PiB7XHJcbiAgICAgIGNvbnN0IHBvczAxID0gUG9zaXRpb24ocm93cywgMCwgMikuZGVjclBvcygpO1xyXG4gICAgICBleHBlY3QocG9zMDEuY2hhcigpLnZhbHVlKS50by5iZS5lcWwoMik7XHJcbiAgICAgIGNvbnN0IHBvczEzID0gUG9zaXRpb24ocm93cywgMiwgMCkuZGVjclBvcygpO1xyXG4gICAgICBleHBlY3QocG9zMTMuY2hhcigpLnZhbHVlKS50by5iZS5lcWwoJ2QnKTtcclxuICAgICAgY29uc3QgcG9zMDIgPSBQb3NpdGlvbihyb3dzLCAyLCAwKS5kZWNyUG9zKDUpO1xyXG4gICAgICBleHBlY3QocG9zMDIuY2hhcigpLnZhbHVlKS50by5iZS5lcWwoMyk7XHJcbiAgICB9KTtcclxuICAgIGl0KCdyZXR1cm4gY2hhcigpID09PSBOb3RoaW5nIHdoZW4gcG9zaXRpb24gaXMgYmV5b25kIHRoZSBjb250YWluZWQgcm93cyBjb250ZW50JywgKCkgPT4ge1xyXG4gICAgICBjb25zdCBwb3MxMDEwID0gUG9zaXRpb24ocm93cywgMTAsIDEwKTtcclxuICAgICAgZXhwZWN0KHBvczEwMTAuY2hhcigpLmlzTm90aGluZykudG8uYmUudHJ1ZTtcclxuICAgICAgY29uc3QgcG9zMjMgPSBQb3NpdGlvbihyb3dzLCAyLCAyKS5pbmNyUG9zKCk7XHJcbiAgICAgIGV4cGVjdChwb3MyMy5jaGFyKCkuaXNOb3RoaW5nKS50by5iZS50cnVlO1xyXG4gICAgfSk7XHJcbiAgICBpdCgncmV0dXJuIGNoYXIoKSA9PT0gTm90aGluZyB3aGVuIGluY3JlbWVudGluZyBhdCB0aGUgZW5kJywgKCkgPT4ge1xyXG4gICAgICBjb25zdCBwb3NCZXlvbmQxID0gUG9zaXRpb24ocm93cywgMiwgMikuaW5jclBvcygpO1xyXG4gICAgICBleHBlY3QocG9zQmV5b25kMS5jaGFyKCkuaXNOb3RoaW5nKS50by5iZS50cnVlO1xyXG4gICAgICBjb25zdCBwb3NCZXlvbmRBTG90ID0gUG9zaXRpb24ocm93cywgMCwgMCkuaW5jclBvcygxMDApO1xyXG4gICAgICBleHBlY3QocG9zQmV5b25kQUxvdC5jaGFyKCkuaXNOb3RoaW5nKS50by5iZS50cnVlO1xyXG4gICAgfSk7XHJcbiAgICBpdCgncmV0dXJuIGNoYXIoKSA9PT0gTm90aGluZyB3aGVuIGRlY3JlbWVudGluZyBhdCB0aGUgc3RhcnQnLCAoKSA9PiB7XHJcbiAgICAgIGNvbnN0IHBvc01pbnVzMSA9IFBvc2l0aW9uKHJvd3MsIDAsIDApLmRlY3JQb3MoKTtcclxuICAgICAgZXhwZWN0KHBvc01pbnVzMS5jaGFyKCkuaXNOb3RoaW5nKS50by5iZS50cnVlO1xyXG4gICAgICBjb25zdCBwb3NNaW51czEwID0gUG9zaXRpb24ocm93cywgMCwgMCkuZGVjclBvcygxMCk7XHJcbiAgICAgIGV4cGVjdChwb3NNaW51czEwLmNoYXIoKS5pc05vdGhpbmcpLnRvLmJlLnRydWU7XHJcbiAgICB9KTtcclxuICAgIGl0KCdjYW4gYmUgaW5pdGlhbGl6ZWQgZnJvbSB0ZXh0IHN0cmluZ3MnLCAoKSA9PiB7XHJcbiAgICAgIGNvbnN0IHBvczAwID0gUG9zaXRpb24uZnJvbVRleHQoJ0xvcmVtIGlwc3VtIGRvbG9yIHNpdCBhbWV0Jyk7XHJcbiAgICAgIGV4cGVjdChwb3MwMC5jaGFyKCkudmFsdWUpLnRvLmJlLmVxbCgnTCcpO1xyXG4gICAgICBleHBlY3QocG9zMDAuaW5jclBvcygpLmluY3JQb3MoKS5pbmNyUG9zKCkuaW5jclBvcygpXHJcbiAgICAgICAgLmNoYXIoKS52YWx1ZSkudG8uYmUuZXFsKCdtJyk7XHJcbiAgICB9KTtcclxuICAgIGl0KCdjYW4gYmUgaW5pdGlhbGl6ZWQgYWxzbyBmcm9tIG11bHRpbGluZSB0ZXh0IHN0cmluZ3MsIHN0cmlwcGluZyBuZXdsaW5lcyBhd2F5JywgKCkgPT4ge1xyXG4gICAgICBjb25zdCBwb3MwMCA9IFBvc2l0aW9uLmZyb21UZXh0KCdMb3JlbSBcXG5pcHN1bScpO1xyXG4gICAgICBleHBlY3QocG9zMDAuY2hhcigpLnZhbHVlKS50by5iZS5lcWwoJ0wnKTtcclxuICAgICAgZXhwZWN0KHBvczAwLmluY3JQb3MoKS5pbmNyUG9zKCkuaW5jclBvcygpLmluY3JQb3MoKS5pbmNyUG9zKCkuaW5jclBvcygpXHJcbiAgICAgICAgLmNoYXIoKS52YWx1ZSkudG8uYmUuZXFsKCdpJyk7XHJcbiAgICB9KTtcclxuICAgIGl0KCdyZXR1cm4gc3RyaW5ncyBjb250YWluaW5nIGFsbCBjaGFyYWN0ZXJzIHN0YXJ0aW5nIGZyb20gYSBnaXZlbiBwb3NpdGlvbiwgZm9yIHRoZSBzYWtlIG9mIHRlc3RpbmcnLCAoKSA9PiB7XHJcbiAgICAgIGNvbnN0IHBvczAxID0gUG9zaXRpb24uZnJvbVRleHQoJ0xvcmVtJykuaW5jclBvcygpO1xyXG4gICAgICBleHBlY3QocG9zMDEucmVzdCgpKS50by5iZS5lcWwoJ29yZW0nKTtcclxuICAgIH0pO1xyXG4gICAgaXQoJ3JldHVybnMgcmVzdCA9PT0gXFwnXFwnIHdoZW4gd2UgZ2V0IHRvIHRoZSBlbmQnLCAoKSA9PiB7XHJcbiAgICAgIGNvbnN0IHBvczAxID0gUG9zaXRpb24uZnJvbVRleHQoJ0wnKS5pbmNyUG9zKCk7XHJcbiAgICAgIGV4cGVjdChwb3MwMS5yZXN0KCkpLnRvLmJlLmVxbCgnJyk7XHJcbiAgICB9KTtcclxuICB9KTtcclxuXHJcbiAgZGVzY3JpYmUoJ3NvbWVzJywgKCkgPT4ge1xyXG4gICAgaXQoJ2luY2x1ZGUgYSB2YWx1ZSBhbmQgYWxsb3cgdG8gcmV0cmlldmUgaXQnLCAoKSA9PiB7XHJcbiAgICAgIGNvbnN0IGFTb21lID0gc29tZSgxMik7XHJcbiAgICAgIGV4cGVjdChhU29tZS52YWwoKSkudG8uYmUuZXFsKDEyKTtcclxuICAgICAgZXhwZWN0KGlzU29tZShhU29tZSkpLnRvLmJlLnRydWU7XHJcbiAgICAgIGV4cGVjdChhU29tZS50b1N0cmluZygpKS50by5iZS5lcWwoJ3NvbWUoMTIpJyk7XHJcbiAgICB9KTtcclxuICB9KTtcclxuXHJcbiAgZGVzY3JpYmUoJ25vbmVzJywgKCkgPT4ge1xyXG4gICAgaXQoJ2FyZSBqdXN0IGEgc2lnbnBvc3QnLCAoKSA9PiB7XHJcbiAgICAgIGNvbnN0IGFOb25lID0gbm9uZSgpO1xyXG4gICAgICBleHBlY3QoYU5vbmUudmFsKCkpLnRvLmJlLm51bGw7XHJcbiAgICAgIGV4cGVjdChpc05vbmUoYU5vbmUpKS50by5iZS50cnVlO1xyXG4gICAgICBleHBlY3QoYU5vbmUudG9TdHJpbmcoKSkudG8uYmUuZXFsKCdub25lKCknKTtcclxuICAgIH0pO1xyXG4gIH0pO1xyXG5cclxuICBkZXNjcmliZSgncGFpcnMnLCAoKSA9PiB7XHJcbiAgICBpdCgnaW5jbHVkZSAyIHZhbHVlcyBhbmQgYWxsb3cgdG8gcmV0cmlldmUgdGhlbScsICgpID0+IHtcclxuICAgICAgY29uc3QgYXBhaXIgPSBwYWlyKHRydWUsIDEyKTtcclxuICAgICAgZXhwZWN0KGFwYWlyWzBdKS50by5iZS5lcWwodHJ1ZSk7XHJcbiAgICAgIGV4cGVjdChhcGFpclsxXSkudG8uYmUuZXFsKDEyKTtcclxuICAgICAgZXhwZWN0KGFwYWlyLnR5cGUpLnRvLmJlLmVxbCgncGFpcicpO1xyXG4gICAgICBleHBlY3QoaXNQYWlyKGFwYWlyKSkudG8uYmUudHJ1ZTtcclxuICAgIH0pO1xyXG4gICAgaXQoJ2FyZSBhY3R1YWxseSBhcnJheXMsIGFuZCB0aGVyZWZvcmUgYWxsb3cgcG9zaXRpb25hbCBkZXN0cnVjdHVyaW5nJywgKCkgPT4ge1xyXG4gICAgICBjb25zdCBbYSwgYl0gPSBwYWlyKHRydWUsIDEyKTtcclxuICAgICAgZXhwZWN0KGEpLnRvLmJlLmVxbCh0cnVlKTtcclxuICAgICAgZXhwZWN0KGIpLnRvLmJlLmVxbCgxMik7XHJcbiAgICB9KTtcclxuICB9KTtcclxuXHJcbiAgZGVzY3JpYmUoJ1BhaXJcXCdzJywgKCkgPT4ge1xyXG4gICAgaXQoJ2luY2x1ZGUgMiB2YWx1ZXMgYW5kIGFsbG93IHRvIHJldHJpZXZlIHRoZW0nLCAoKSA9PiB7XHJcbiAgICAgIGNvbnN0IGFwYWlyID0gVHVwbGUuUGFpcih0cnVlLCAxMik7XHJcbiAgICAgIGV4cGVjdChhcGFpclswXSkudG8uYmUuZXFsKHRydWUpO1xyXG4gICAgICBleHBlY3QoYXBhaXJbMV0pLnRvLmJlLmVxbCgxMik7XHJcbiAgICAgIGV4cGVjdChhcGFpci50eXBlKS50by5iZS5lcWwoJ3BhaXInKTtcclxuICAgICAgZXhwZWN0KGFwYWlyLmlzUGFpcikudG8uYmUudHJ1ZTtcclxuICAgICAgZXhwZWN0KGFwYWlyLnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgnW3RydWUsMTJdJyk7XHJcbiAgICB9KTtcclxuICAgIGl0KCdhcmUgaW1tdXRhYmxlLCBhbmQgdGhyb3cgaWYgeW91IHRyeSB0byBjaGFuZ2UgdGhlbScsICgpID0+IHtcclxuICAgICAgY29uc3QgYXBhaXIgPSBUdXBsZS5QYWlyKHRydWUsIDEyKTtcclxuICAgICAgZXhwZWN0KCgpID0+IHtcclxuICAgICAgICBhcGFpclswXSA9IGZhbHNlO1xyXG4gICAgICB9KS50by50aHJvdztcclxuICAgICAgZXhwZWN0KCgpID0+IHtcclxuICAgICAgICBhcGFpclsxXSA9IDEzO1xyXG4gICAgICB9KS50by50aHJvdztcclxuICAgIH0pO1xyXG4gICAgaXQoJ2FyZSB0cnVlIGl0ZXJhYmxlcywgYW5kIHRoZXJlZm9yZSBhbGxvdyBwb3NpdGlvbmFsIGRlc3RydWN0dXJpbmcnLCAoKSA9PiB7XHJcbiAgICAgIGNvbnN0IFthLCBiXSA9IFR1cGxlLlBhaXIodHJ1ZSwgMTIpO1xyXG4gICAgICBleHBlY3QoYSkudG8uYmUuZXFsKHRydWUpO1xyXG4gICAgICBleHBlY3QoYikudG8uYmUuZXFsKDEyKTtcclxuICAgIH0pO1xyXG4gIH0pO1xyXG5cclxuICBkZXNjcmliZSgnVHJpcGxlXFwncycsICgpID0+IHtcclxuICAgIGl0KCdpbmNsdWRlIDMgdmFsdWVzIGFuZCBhbGxvdyB0byByZXRyaWV2ZSB0aGVtJywgKCkgPT4ge1xyXG4gICAgICBjb25zdCBhdHJpcGxlID0gVHVwbGUuVHJpcGxlKHRydWUsIDEyLCAnYScpO1xyXG4gICAgICBleHBlY3QoYXRyaXBsZVswXSkudG8uYmUuZXFsKHRydWUpO1xyXG4gICAgICBleHBlY3QoYXRyaXBsZVsxXSkudG8uYmUuZXFsKDEyKTtcclxuICAgICAgZXhwZWN0KGF0cmlwbGVbMl0pLnRvLmJlLmVxbCgnYScpO1xyXG4gICAgICBleHBlY3QoYXRyaXBsZS50eXBlKS50by5iZS5lcWwoJ3RyaXBsZScpO1xyXG4gICAgICBleHBlY3QoYXRyaXBsZS5pc1RyaXBsZSkudG8uYmUudHJ1ZTtcclxuICAgICAgZXhwZWN0KGF0cmlwbGUudG9TdHJpbmcoKSkudG8uYmUuZXFsKCdbdHJ1ZSwxMixhXScpO1xyXG4gICAgfSk7XHJcbiAgICBpdCgnYXJlIGltbXV0YWJsZSwgYW5kIHRocm93IGlmIHlvdSB0cnkgdG8gY2hhbmdlIHRoZW0nLCAoKSA9PiB7XHJcbiAgICAgIGNvbnN0IGF0cmlwbGUgPSBUdXBsZS5UcmlwbGUodHJ1ZSwgMTIsICdhJyk7XHJcbiAgICAgIGV4cGVjdCgoKSA9PiB7XHJcbiAgICAgICAgYXRyaXBsZVswXSA9IGZhbHNlO1xyXG4gICAgICB9KS50by50aHJvdztcclxuICAgICAgZXhwZWN0KCgpID0+IHtcclxuICAgICAgICBhdHJpcGxlWzFdID0gMTM7XHJcbiAgICAgIH0pLnRvLnRocm93O1xyXG4gICAgICBleHBlY3QoKCkgPT4ge1xyXG4gICAgICAgIGF0cmlwbGVbMl0gPSAnYic7XHJcbiAgICAgIH0pLnRvLnRocm93O1xyXG4gICAgfSk7XHJcbiAgICBpdCgnYXJlIHRydWUgaXRlcmFibGVzLCBhbmQgdGhlcmVmb3JlIGFsbG93IHBvc2l0aW9uYWwgZGVzdHJ1Y3R1cmluZycsICgpID0+IHtcclxuICAgICAgY29uc3QgW2EsIGIsIGNdID0gVHVwbGUuVHJpcGxlKHRydWUsIDEyLCAnYScpO1xyXG4gICAgICBleHBlY3QoYSkudG8uYmUuZXFsKHRydWUpO1xyXG4gICAgICBleHBlY3QoYikudG8uYmUuZXFsKDEyKTtcclxuICAgICAgZXhwZWN0KGMpLnRvLmJlLmVxbCgnYScpO1xyXG4gICAgfSk7XHJcbiAgfSk7XHJcblxyXG4gIGRlc2NyaWJlKCdzdWNjZXNzIGFuZCBmYWlsdXJlJywgKCkgPT4ge1xyXG4gICAgYmVmb3JlRWFjaCgoKSA9PiB7XHJcbiAgICB9KTtcclxuICAgIGl0KCdtYXkgcmVwcmVzZW50IHN1Y2Nlc3NlcycsICgpID0+IHtcclxuICAgICAgY29uc3Qgc3VjYyA9IHN1Y2Nlc3ModHJ1ZSwgMTIpO1xyXG4gICAgICBleHBlY3Qoc3VjY1swXSkudG8uYmUudHJ1ZTtcclxuICAgICAgZXhwZWN0KHN1Y2NbMV0pLnRvLmJlLmVxbCgxMik7XHJcbiAgICAgIGV4cGVjdChpc1N1Y2Nlc3Moc3VjYykpLnRvLmJlLnRydWU7XHJcbiAgICAgIGV4cGVjdChpc1BhaXIoc3VjYykpLnRvLmJlLnRydWU7XHJcbiAgICB9KTtcclxuICAgIGl0KCdtYXkgcmVwcmVzZW50IGZhaWx1cmVzJywgKCkgPT4ge1xyXG4gICAgICBjb25zdCBmYWlsID0gZmFpbHVyZSgnYScsIDEyKTtcclxuICAgICAgZXhwZWN0KGZhaWxbMF0pLnRvLmJlLmVxbCgnYScpO1xyXG4gICAgICBleHBlY3QoZmFpbFsxXSkudG8uYmUuZXFsKDEyKTtcclxuICAgICAgZXhwZWN0KGlzU3VjY2VzcyhmYWlsKSkudG8uYmUuZmFsc2U7XHJcbiAgICAgIGV4cGVjdChpc0ZhaWx1cmUoZmFpbCkpLnRvLmJlLnRydWU7XHJcbiAgICAgIGV4cGVjdChpc1BhaXIoZmFpbCkpLnRvLmJlLnRydWU7XHJcbiAgICB9KTtcclxuICB9KTtcclxuXHJcbiAgZGVzY3JpYmUoJ0pWYWx1ZVxcJ3MgYXJlIHBhcnNlZCBKU09OIHZhbHVlcycsICgpID0+IHtcclxuICAgIGRlc2NyaWJlKCd3aXRoIEpTdHJpbmdcXCdzIGFzIHBhcnNlZCBKU09OIHN0cmluZyB2YWx1ZXMnLCAoKSA9PiB7XHJcbiAgICAgIGNvbnN0IGpzdHJpbmcgPSBKVmFsdWUuSlN0cmluZygnYWJjJyk7XHJcbiAgICAgIGl0KCd0aGF0IGFyZSByZXRyaWV2YWJsZScsICgpID0+IHtcclxuICAgICAgICBleHBlY3QoanN0cmluZy52YWx1ZSkudG8uYmUuZXFsKCdhYmMnKTtcclxuICAgICAgICBleHBlY3QoanN0cmluZy50b1N0cmluZygpKS50by5iZS5lcWwoJ0pTdHJpbmcoYWJjKScpO1xyXG4gICAgICB9KTtcclxuICAgICAgaXQoJ3RoYXQgYXJlIGltbXV0YWJsZScsICgpID0+IHtcclxuICAgICAgICBleHBlY3QoKCkgPT4ge1xyXG4gICAgICAgICAganN0cmluZy52YWx1ZSA9ICdkZWYnO1xyXG4gICAgICAgIH0pLnRvLnRocm93O1xyXG4gICAgICB9KTtcclxuICAgICAgaXQoJ3RoYXQgZ290dGEgYmUgc3RyaW5ncycsICgpID0+IHtcclxuICAgICAgICBleHBlY3QoKCkgPT4gSlZhbHVlLkpTdHJpbmcoMTIzKSkudG8udGhyb3c7XHJcbiAgICAgIH0pO1xyXG4gICAgICBpdCgndGhhdCBnb3R0YSBieSB0eXBlcyB3aXRoIGEgc3VwZXJ0eXBlJywgKCkgPT4ge1xyXG4gICAgICAgIGNvbnN0IGpzdHJpbmcgPSBKVmFsdWUuSlN0cmluZygnMTIzJyk7XHJcbiAgICAgICAgZXhwZWN0KGpzdHJpbmcuaXNKVmFsdWUpLnRvLmJlLnRydWU7XHJcbiAgICAgICAgZXhwZWN0KGpzdHJpbmcuaXNKU3RyaW5nKS50by5iZS50cnVlO1xyXG4gICAgICB9KTtcclxuICAgIH0pO1xyXG4gICAgaXQoJ3dpdGggSk51bWJlclxcJ3MgYXMgcGFyc2VkIEpTT04gZmxvYXQgdmFsdWVzJywgKCkgPT4ge1xyXG4gICAgICBjb25zdCBqbnVtYmVyID0gSlZhbHVlLkpOdW1iZXIoMTIzLjQ1ZS0yMyk7XHJcbiAgICAgIGV4cGVjdChqbnVtYmVyLnZhbHVlKS50by5iZS5lcWwoMTIzLjQ1ZS0yMyk7XHJcbiAgICAgIGV4cGVjdChqbnVtYmVyLnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgnSk51bWJlcigxLjIzNDVlLTIxKScpO1xyXG4gICAgICBleHBlY3Qoam51bWJlci5pc0pWYWx1ZSkudG8uYmUudHJ1ZTtcclxuICAgICAgZXhwZWN0KGpudW1iZXIuaXNKTnVtYmVyKS50by5iZS50cnVlO1xyXG4gICAgICBleHBlY3QoKCkgPT4ge1xyXG4gICAgICAgIGpudW1iZXIudmFsdWUgPSAxMjM7XHJcbiAgICAgIH0pLnRvLnRocm93O1xyXG4gICAgICBleHBlY3QoKCkgPT4gSlZhbHVlLkpOdW1iZXIoJ3gnKSkudG8udGhyb3c7XHJcbiAgICAgIGV4cGVjdCgoKSA9PiBKVmFsdWUuSk51bWJlcihOYU4pKS50by50aHJvdztcclxuICAgIH0pO1xyXG4gICAgaXQoJ3dpdGggSkJvb2xcXCdzIGFzIHBhcnNlZCBKU09OIGJvb2xlYW4gdmFsdWVzJywgKCkgPT4ge1xyXG4gICAgICBjb25zdCBqYm9vbCA9IEpWYWx1ZS5KQm9vbCh0cnVlKTtcclxuICAgICAgZXhwZWN0KGpib29sLnZhbHVlKS50by5iZS50cnVlO1xyXG4gICAgICBleHBlY3QoamJvb2wudG9TdHJpbmcoKSkudG8uYmUuZXFsKCdKQm9vbCh0cnVlKScpO1xyXG4gICAgICBleHBlY3QoamJvb2wuaXNKVmFsdWUpLnRvLmJlLnRydWU7XHJcbiAgICAgIGV4cGVjdChqYm9vbC5pc0pCb29sKS50by5iZS50cnVlO1xyXG4gICAgICBleHBlY3QoKCkgPT4ge1xyXG4gICAgICAgIGpib29sLnZhbHVlID0gZmFsc2U7XHJcbiAgICAgIH0pLnRvLnRocm93O1xyXG4gICAgICBleHBlY3QoKCkgPT4gSlZhbHVlLkpCb29sKCd4JykpLnRvLnRocm93O1xyXG4gICAgICBleHBlY3QoKCkgPT4gSlZhbHVlLkpCb29sKDEyMykpLnRvLnRocm93O1xyXG4gICAgICBleHBlY3QoKCkgPT4gSlZhbHVlLkpCb29sKE5hTikpLnRvLnRocm93O1xyXG4gICAgfSk7XHJcbiAgICBpdCgnd2l0aCBKTnVsbFxcJ3MgYXMgcGFyc2VkIEpTT04gbnVsbCB2YWx1ZXMnLCAoKSA9PiB7XHJcbiAgICAgIGNvbnN0IGpudWxsID0gSlZhbHVlLkpOdWxsKG51bGwpO1xyXG4gICAgICBleHBlY3Qoam51bGwudmFsdWUpLnRvLmJlLm51bGw7XHJcbiAgICAgIGV4cGVjdChqbnVsbC50b1N0cmluZygpKS50by5iZS5lcWwoJ0pOdWxsKG51bGwpJyk7XHJcbiAgICAgIGV4cGVjdChqbnVsbC5pc0pWYWx1ZSkudG8uYmUudHJ1ZTtcclxuICAgICAgZXhwZWN0KGpudWxsLmlzSk51bGwpLnRvLmJlLnRydWU7XHJcbiAgICAgIGV4cGVjdCgoKSA9PiB7XHJcbiAgICAgICAgam51bGwudmFsdWUgPSAxMjM7XHJcbiAgICAgIH0pLnRvLnRocm93O1xyXG4gICAgICBleHBlY3QoKCkgPT4gSlZhbHVlLkpOdWxsKCcnKSkudG8udGhyb3c7XHJcbiAgICAgIGV4cGVjdCgoKSA9PiBKVmFsdWUuSk51bGwodW5kZWZpbmVkKSkudG8udGhyb3c7XHJcbiAgICAgIGV4cGVjdCgoKSA9PiBKVmFsdWUuSk51bGwoTmFOKSkudG8udGhyb3c7XHJcbiAgICB9KTtcclxuICAgIGl0KCd3aXRoIEpBcnJheVxcJ3MgYXMgcGFyc2VkIEpTT04gYXJyYXlzJywgKCkgPT4ge1xyXG4gICAgICBjb25zdCBqYXJyYXkgPSBKVmFsdWUuSkFycmF5KEpWYWx1ZS5KU3RyaW5nKCdhJyksIEpWYWx1ZS5KQm9vbChmYWxzZSksIEpWYWx1ZS5KTnVsbChudWxsKSk7XHJcbiAgICAgIGNvbnN0IGphclZhbHVlID0gamFycmF5LnZhbHVlO1xyXG4gICAgICBleHBlY3QoamFyVmFsdWVbMF0udmFsdWUpLnRvLmJlLmVxbCgnYScpO1xyXG4gICAgICBleHBlY3QoamFyVmFsdWVbMV0udmFsdWUpLnRvLmJlLmVxbChmYWxzZSk7XHJcbiAgICAgIGV4cGVjdChqYXJWYWx1ZVsyXS52YWx1ZSkudG8uYmUuZXFsKG51bGwpO1xyXG4gICAgICBleHBlY3QoamFycmF5LnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgnSkFycmF5KFtKU3RyaW5nKGEpLEpCb29sKGZhbHNlKSxKTnVsbChudWxsKSxdKScpO1xyXG4gICAgICBleHBlY3QoamFycmF5LmlzSlZhbHVlKS50by5iZS50cnVlO1xyXG4gICAgICBleHBlY3QoamFycmF5LmlzSkFycmF5KS50by5iZS50cnVlO1xyXG4gICAgICBleHBlY3QoKCkgPT4ge1xyXG4gICAgICAgIGphcnJheS52YWx1ZSA9IDEyMztcclxuICAgICAgfSkudG8udGhyb3c7XHJcbiAgICAgIGV4cGVjdCgoKSA9PiBKVmFsdWUuSkFycmF5KCcnKSkudG8udGhyb3c7XHJcbiAgICAgIGV4cGVjdCgoKSA9PiBKVmFsdWUuSkFycmF5KHVuZGVmaW5lZCkpLnRvLnRocm93O1xyXG4gICAgICBleHBlY3QoKCkgPT4gSlZhbHVlLkpBcnJheShOYU4pKS50by50aHJvdztcclxuICAgIH0pO1xyXG4gICAgaXQoJ3dpdGggSk9iamVjdHNcXCdzIGFzIHBhcnNlZCBKU09OIG9iamVjdHMnLCAoKSA9PiB7XHJcbiAgICAgIGNvbnN0IGpvYmplY3QgPSBKVmFsdWUuSk9iamVjdChcclxuICAgICAgICBUdXBsZS5QYWlyKCdzdHJpbmcnLCBKVmFsdWUuSlN0cmluZygnYScpKSxcclxuICAgICAgICBUdXBsZS5QYWlyKCdib29sZWFuJywgSlZhbHVlLkpCb29sKGZhbHNlKSksXHJcbiAgICAgICAgVHVwbGUuUGFpcignbnVsbCcsIEpWYWx1ZS5KTnVsbChudWxsKSksXHJcbiAgICAgICk7XHJcbiAgICAgIGV4cGVjdChqb2JqZWN0LnN0cmluZy52YWx1ZSkudG8uYmUuZXFsKCdhJyk7XHJcbiAgICAgIGV4cGVjdChqb2JqZWN0LmJvb2xlYW4udmFsdWUpLnRvLmJlLmVxbChmYWxzZSk7XHJcbiAgICAgIGV4cGVjdChqb2JqZWN0Lm51bGwudmFsdWUpLnRvLmJlLmVxbChudWxsKTtcclxuICAgICAgLy8gZXhwZWN0KGpvYmplY3QudG9TdHJpbmcoKSkudG8uYmUuZXFsKCdKQXJyYXkoW0pTdHJpbmcoYSksSkJvb2woZmFsc2UpLEpOdWxsKG51bGwpLF0pJyk7XHJcbiAgICAgIGV4cGVjdChqb2JqZWN0LmlzSlZhbHVlKS50by5iZS50cnVlO1xyXG4gICAgICBleHBlY3Qoam9iamVjdC5pc0pPYmplY3QpLnRvLmJlLnRydWU7XHJcbiAgICAgIGV4cGVjdCgoKSA9PiB7XHJcbiAgICAgICAgam9iamVjdC5zdHJpbmcgPSAnYWJjJztcclxuICAgICAgfSkudG8udGhyb3c7XHJcbiAgICAgIGV4cGVjdCgoKSA9PiBKVmFsdWUuSk9iamVjdChKVmFsdWUuSk9iamVjdChcclxuICAgICAgICBUdXBsZS5QYWlyKCdzdHJpbmcnLCBKVmFsdWUuSlN0cmluZygnYScpKSxcclxuICAgICAgICBUdXBsZS5QYWlyKCdib29sZWFuJywgZmFsc2UpLCAvLyB2YWx1ZSBtdXN0IGJlIGEgSlZhbHVlXHJcbiAgICAgICAgVHVwbGUuUGFpcignbnVsbCcsIEpWYWx1ZS5KTnVsbChudWxsKSksXHJcbiAgICAgICkpKS50by50aHJvdztcclxuICAgICAgZXhwZWN0KCgpID0+IEpWYWx1ZS5KT2JqZWN0KEpWYWx1ZS5KT2JqZWN0KFxyXG4gICAgICAgIFR1cGxlLlBhaXIoJ3N0cmluZycsIEpWYWx1ZS5KU3RyaW5nKCdhJykpLFxyXG4gICAgICAgIFR1cGxlLlBhaXIoMTIzLCBKVmFsdWUuSk51bGwobnVsbCkpLCAvLyBrZXkgbXVzdCBiZSBhIHN0cmluZ1xyXG4gICAgICApKSkudG8udGhyb3c7XHJcbiAgICAgIGV4cGVjdCgoKSA9PiBKVmFsdWUuSk51bGwoVHVwbGUuVHJpcGxlKDEsIDIsIDMpKSkudG8udGhyb3c7XHJcbiAgICB9KTtcclxuXHJcbiAgfSk7XHJcbn0pO1xyXG4iXX0=