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
                    atriple[0] = false;
                }).to.throw;
                (0, _chai.expect)(function () {
                    atriple[1] = 13;
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
                (0, _chai.expect)(jobject['string'].value).to.be.eql('a');
                (0, _chai.expect)(jobject['boolean'].value).to.be.eql(false);
                (0, _chai.expect)(jobject['null'].value).to.be.eql(null);
                //expect(jobject.toString()).to.be.eql('JArray([JString(a),JBool(false),JNull(null),])');
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2pzLXNwZWMvY2xhc3Nlc190ZXN0cy5qcyJdLCJuYW1lcyI6WyJkZXNjcmliZSIsInJvd3MiLCJpdCIsInBvczAwIiwiaXNQb3NpdGlvbiIsInRvIiwiYmUiLCJ0cnVlIiwiY2hhciIsImlzSnVzdCIsInZhbHVlIiwiZXFsIiwicG9zMTEiLCJwb3MwMSIsImluY3JQb3MiLCJwb3MyMCIsInBvczIyIiwiZGVjclBvcyIsInBvczEzIiwicG9zMDIiLCJwb3MxMDEwIiwiaXNOb3RoaW5nIiwicG9zMjMiLCJwb3NCZXlvbmQxIiwicG9zQmV5b25kQUxvdCIsInBvc01pbnVzMSIsInBvc01pbnVzMTAiLCJQb3NpdGlvbiIsImZyb21UZXh0IiwicmVzdCIsImFTb21lIiwidmFsIiwidG9TdHJpbmciLCJhTm9uZSIsIm51bGwiLCJhcGFpciIsInR5cGUiLCJhIiwiYiIsIlR1cGxlIiwiUGFpciIsImlzUGFpciIsImF0cmlwbGUiLCJ0aHJvdyIsIlRyaXBsZSIsImlzVHJpcGxlIiwiYyIsImJlZm9yZUVhY2giLCJzdWNjIiwiZmFpbCIsImZhbHNlIiwianN0cmluZyIsIkpWYWx1ZSIsIkpTdHJpbmciLCJpc0pWYWx1ZSIsImlzSlN0cmluZyIsImpudW1iZXIiLCJKTnVtYmVyIiwiaXNKTnVtYmVyIiwiTmFOIiwiamJvb2wiLCJKQm9vbCIsImlzSkJvb2wiLCJqbnVsbCIsIkpOdWxsIiwiaXNKTnVsbCIsInVuZGVmaW5lZCIsImphcnJheSIsIkpBcnJheSIsImphclZhbHVlIiwiaXNKQXJyYXkiLCJqb2JqZWN0IiwiSk9iamVjdCIsImlzSk9iamVjdCIsInN0cmluZyJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFtQkFBLGFBQVMsc0JBQVQsRUFBaUMsWUFBTTs7QUFFbkNBLGlCQUFTLGFBQVQsRUFBd0IsWUFBTTtBQUMxQixnQkFBTUMsT0FBTyxDQUNULENBQUMsQ0FBRCxFQUFJLENBQUosRUFBTyxDQUFQ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T1ksS0FBUCxDQUFhekIsZUFBTUssTUFBTixDQUFhLENBQWIsRUFBZSxDQUFmLEVBQWlCLENBQWpCLENBQWIsQ0FBTjtBQUFBLGlCQUFQLEVBQWdEdkMsRUFBaEQsQ0FBbURzQyxLQUFuRDtBQUNILGFBekJEO0FBMkJILFNBdEdEO0FBdUdILEtBNVJEIiwiZmlsZSI6ImNsYXNzZXNfdGVzdHMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge2V4cGVjdH0gZnJvbSAnY2hhaSc7XG5pbXBvcnQge1xuICAgIGlzUGFpcixcbiAgICBpc1N1Y2Nlc3MsXG4gICAgaXNGYWlsdXJlLFxuICAgIGlzU29tZSxcbiAgICBpc05vbmUsXG59IGZyb20gJ3V0aWwnO1xuaW1wb3J0IHtcbiAgICBwYWlyLFxuICAgIHN1Y2Nlc3MsXG4gICAgZmFpbHVyZSxcbiAgICBzb21lLFxuICAgIG5vbmUsXG4gICAgUG9zaXRpb24sXG4gICAgVHVwbGUsXG4gICAgSlZhbHVlLFxufSBmcm9tICdjbGFzc2VzJztcblxuZGVzY3JpYmUoJ2Ftb25nIGhlbHBlciBjbGFzc2VzJywgKCkgPT4ge1xuXG4gICAgZGVzY3JpYmUoJ1Bvc2l0aW9uXFwncycsICgpID0+IHtcbiAgICAgICAgY29uc3Qgcm93cyA9IFtcbiAgICAgICAgICAgIFsxLCAyLCAzXSxcbiAgICAgICAgICAgIFsnYScsICdiJywgJ2MnLCAnZCddLFxuICAgICAgICAgICAgWydBJywgJ0InLCAnQyddLFxuICAgICAgICBdO1xuICAgICAgICBpdCgnaW5jbHVkZSB0YWJsZXMgb2YgY2hhcnMgYW5kIGFsbG93IHRvIHJldHJpZXZlIGNoYXIgb3B0aW9ucycsICgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHBvczAwID0gUG9zaXRpb24ocm93cywgMCwgMCk7XG4gICAgICAgICAgICBleHBlY3QocG9zMDAuaXNQb3NpdGlvbikudG8uYmUudHJ1ZTtcbiAgICAgICAgICAgIGV4cGVjdChwb3MwMC5jaGFyKCkuaXNKdXN0KS50by5iZS50cnVlO1xuICAgICAgICAgICAgZXhwZWN0KHBvczAwLmNoYXIoKS52YWx1ZSkudG8uYmUuZXFsKDEpO1xuICAgICAgICAgICAgY29uc3QgcG9zMTEgPSBQb3NpdGlvbihyb3dzLCAxLCAxKTtcbiAgICAgICAgICAgIGV4cGVjdChwb3MxMS5jaGFyKCkuaXNKdXN0KS50by5iZS50cnVlO1xuICAgICAgICAgICAgZXhwZWN0KHBvczExLmNoYXIoKS52YWx1ZSkudG8uYmUuZXFsKCdiJyk7XG4gICAgICAgIH0pO1xuICAgICAgICBpdCgnYWxsb3cgdG8gaW5jcmVtZW50IHRoZSBwb3NpdGlvbiBhbmQgcmV0cmlldmUgZnVydGhlciBjaGFycycsICgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHBvczAxID0gUG9zaXRpb24ocm93cywgMCwgMCkuaW5jclBvcygpO1xuICAgICAgICAgICAgZXhwZWN0KHBvczAxLmNoYXIoKS52YWx1ZSkudG8uYmUuZXFsKDIpO1xuICAgICAgICAgICAgY29uc3QgcG9zMjAgPSBQb3NpdGlvbihyb3dzLCAxLCAzKS5pbmNyUG9zKCk7XG4gICAgICAgICAgICBleHBlY3QocG9zMjAuY2hhcigpLnZhbHVlKS50by5iZS5lcWwoJ0EnKTtcbiAgICAgICAgICAgIGNvbnN0IHBvczIyID0gUG9zaXRpb24ocm93cywgMSwgMykuaW5jclBvcygzKTtcbiAgICAgICAgICAgIGV4cGVjdChwb3MyMi5jaGFyKCkudmFsdWUpLnRvLmJlLmVxbCgnQycpO1xuICAgICAgICB9KTtcbiAgICAgICAgaXQoJ2FsbG93IHRvIGRlY3JlbWVudCB0aGUgcG9zaXRpb24gYW5kIHJldHJpZXZlIGZ1cnRoZXIgY2hhcnMnLCAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBwb3MwMSA9IFBvc2l0aW9uKHJvd3MsIDAsIDIpLmRlY3JQb3MoKTtcbiAgICAgICAgICAgIGV4cGVjdChwb3MwMS5jaGFyKCkudmFsdWUpLnRvLmJlLmVxbCgyKTtcbiAgICAgICAgICAgIGNvbnN0IHBvczEzID0gUG9zaXRpb24ocm93cywgMiwgMCkuZGVjclBvcygpO1xuICAgICAgICAgICAgZXhwZWN0KHBvczEzLmNoYXIoKS52YWx1ZSkudG8uYmUuZXFsKCdkJyk7XG4gICAgICAgICAgICBjb25zdCBwb3MwMiA9IFBvc2l0aW9uKHJvd3MsIDIsIDApLmRlY3JQb3MoNSk7XG4gICAgICAgICAgICBleHBlY3QocG9zMDIuY2hhcigpLnZhbHVlKS50by5iZS5lcWwoMyk7XG4gICAgICAgIH0pO1xuICAgICAgICBpdCgncmV0dXJuIGNoYXIoKSA9PT0gTm90aGluZyB3aGVuIHBvc2l0aW9uIGlzIGJleW9uZCB0aGUgY29udGFpbmVkIHJvd3MgY29udGVudCcsICgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHBvczEwMTAgPSBQb3NpdGlvbihyb3dzLCAxMCwgMTApO1xuICAgICAgICAgICAgZXhwZWN0KHBvczEwMTAuY2hhcigpLmlzTm90aGluZykudG8uYmUudHJ1ZTtcbiAgICAgICAgICAgIGNvbnN0IHBvczIzID0gUG9zaXRpb24ocm93cywgMiwgMikuaW5jclBvcygpO1xuICAgICAgICAgICAgZXhwZWN0KHBvczIzLmNoYXIoKS5pc05vdGhpbmcpLnRvLmJlLnRydWU7XG4gICAgICAgIH0pO1xuICAgICAgICBpdCgncmV0dXJuIGNoYXIoKSA9PT0gTm90aGluZyB3aGVuIGluY3JlbWVudGluZyBhdCB0aGUgZW5kJywgKCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgcG9zQmV5b25kMSA9IFBvc2l0aW9uKHJvd3MsIDIsIDIpLmluY3JQb3MoKTtcbiAgICAgICAgICAgIGV4cGVjdChwb3NCZXlvbmQxLmNoYXIoKS5pc05vdGhpbmcpLnRvLmJlLnRydWU7XG4gICAgICAgICAgICBjb25zdCBwb3NCZXlvbmRBTG90ID0gUG9zaXRpb24ocm93cywgMCwgMCkuaW5jclBvcygxMDApO1xuICAgICAgICAgICAgZXhwZWN0KHBvc0JleW9uZEFMb3QuY2hhcigpLmlzTm90aGluZykudG8uYmUudHJ1ZTtcbiAgICAgICAgfSk7XG4gICAgICAgIGl0KCdyZXR1cm4gY2hhcigpID09PSBOb3RoaW5nIHdoZW4gZGVjcmVtZW50aW5nIGF0IHRoZSBzdGFydCcsICgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHBvc01pbnVzMSA9IFBvc2l0aW9uKHJvd3MsIDAsIDApLmRlY3JQb3MoKTtcbiAgICAgICAgICAgIGV4cGVjdChwb3NNaW51czEuY2hhcigpLmlzTm90aGluZykudG8uYmUudHJ1ZTtcbiAgICAgICAgICAgIGNvbnN0IHBvc01pbnVzMTAgPSBQb3NpdGlvbihyb3dzLCAwLCAwKS5kZWNyUG9zKDEwKTtcbiAgICAgICAgICAgIGV4cGVjdChwb3NNaW51czEwLmNoYXIoKS5pc05vdGhpbmcpLnRvLmJlLnRydWU7XG4gICAgICAgIH0pO1xuICAgICAgICBpdCgnY2FuIGJlIGluaXRpYWxpemVkIGZyb20gdGV4dCBzdHJpbmdzJywgKCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgcG9zMDAgPSBQb3NpdGlvbi5mcm9tVGV4dCgnTG9yZW0gaXBzdW0gZG9sb3Igc2l0IGFtZXQnKTtcbiAgICAgICAgICAgIGV4cGVjdChwb3MwMC5jaGFyKCkudmFsdWUpLnRvLmJlLmVxbCgnTCcpO1xuICAgICAgICAgICAgZXhwZWN0KHBvczAwLmluY3JQb3MoKS5pbmNyUG9zKCkuaW5jclBvcygpLmluY3JQb3MoKVxuICAgICAgICAgICAgICAgIC5jaGFyKCkudmFsdWUpLnRvLmJlLmVxbCgnbScpO1xuICAgICAgICB9KTtcbiAgICAgICAgaXQoJ2NhbiBiZSBpbml0aWFsaXplZCBhbHNvIGZyb20gbXVsdGlsaW5lIHRleHQgc3RyaW5ncywgc3RyaXBwaW5nIG5ld2xpbmVzIGF3YXknLCAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBwb3MwMCA9IFBvc2l0aW9uLmZyb21UZXh0KCdMb3JlbSBcXG5pcHN1bScpO1xuICAgICAgICAgICAgZXhwZWN0KHBvczAwLmNoYXIoKS52YWx1ZSkudG8uYmUuZXFsKCdMJyk7XG4gICAgICAgICAgICBleHBlY3QocG9zMDAuaW5jclBvcygpLmluY3JQb3MoKS5pbmNyUG9zKCkuaW5jclBvcygpLmluY3JQb3MoKS5pbmNyUG9zKClcbiAgICAgICAgICAgICAgICAuY2hhcigpLnZhbHVlKS50by5iZS5lcWwoJ2knKTtcbiAgICAgICAgfSk7XG4gICAgICAgIGl0KCdyZXR1cm4gc3RyaW5ncyBjb250YWluaW5nIGFsbCBjaGFyYWN0ZXJzIHN0YXJ0aW5nIGZyb20gYSBnaXZlbiBwb3NpdGlvbiwgZm9yIHRoZSBzYWtlIG9mIHRlc3RpbmcnLCAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBwb3MwMSA9IFBvc2l0aW9uLmZyb21UZXh0KCdMb3JlbScpLmluY3JQb3MoKTtcbiAgICAgICAgICAgIGV4cGVjdChwb3MwMS5yZXN0KCkpLnRvLmJlLmVxbCgnb3JlbScpO1xuICAgICAgICB9KTtcbiAgICAgICAgaXQoJ3JldHVybnMgcmVzdCA9PT0gXFwnXFwnIHdoZW4gd2UgZ2V0IHRvIHRoZSBlbmQnLCAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBwb3MwMSA9IFBvc2l0aW9uLmZyb21UZXh0KCdMJykuaW5jclBvcygpO1xuICAgICAgICAgICAgZXhwZWN0KHBvczAxLnJlc3QoKSkudG8uYmUuZXFsKCcnKTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICBkZXNjcmliZSgnc29tZXMnLCAoKSA9PiB7XG4gICAgICAgIGl0KCdpbmNsdWRlIGEgdmFsdWUgYW5kIGFsbG93IHRvIHJldHJpZXZlIGl0JywgKCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgYVNvbWUgPSBzb21lKDEyKTtcbiAgICAgICAgICAgIGV4cGVjdChhU29tZS52YWwoKSkudG8uYmUuZXFsKDEyKTtcbiAgICAgICAgICAgIGV4cGVjdChpc1NvbWUoYVNvbWUpKS50by5iZS50cnVlO1xuICAgICAgICAgICAgZXhwZWN0KGFTb21lLnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgnc29tZSgxMiknKTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICBkZXNjcmliZSgnbm9uZXMnLCAoKSA9PiB7XG4gICAgICAgIGl0KCdhcmUganVzdCBhIHNpZ25wb3N0JywgKCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgYU5vbmUgPSBub25lKCk7XG4gICAgICAgICAgICBleHBlY3QoYU5vbmUudmFsKCkpLnRvLmJlLm51bGw7XG4gICAgICAgICAgICBleHBlY3QoaXNOb25lKGFOb25lKSkudG8uYmUudHJ1ZTtcbiAgICAgICAgICAgIGV4cGVjdChhTm9uZS50b1N0cmluZygpKS50by5iZS5lcWwoJ25vbmUoKScpO1xuICAgICAgICB9KTtcbiAgICB9KTtcblxuICAgIGRlc2NyaWJlKCdwYWlycycsICgpID0+IHtcbiAgICAgICAgaXQoJ2luY2x1ZGUgMiB2YWx1ZXMgYW5kIGFsbG93IHRvIHJldHJpZXZlIHRoZW0nLCAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBhcGFpciA9IHBhaXIodHJ1ZSwgMTIpO1xuICAgICAgICAgICAgZXhwZWN0KGFwYWlyWzBdKS50by5iZS5lcWwodHJ1ZSk7XG4gICAgICAgICAgICBleHBlY3QoYXBhaXJbMV0pLnRvLmJlLmVxbCgxMik7XG4gICAgICAgICAgICBleHBlY3QoYXBhaXIudHlwZSkudG8uYmUuZXFsKCdwYWlyJyk7XG4gICAgICAgICAgICBleHBlY3QoaXNQYWlyKGFwYWlyKSkudG8uYmUudHJ1ZTtcbiAgICAgICAgfSk7XG4gICAgICAgIGl0KCdhcmUgYWN0dWFsbHkgYXJyYXlzLCBhbmQgdGhlcmVmb3JlIGFsbG93IHBvc2l0aW9uYWwgZGVzdHJ1Y3R1cmluZycsICgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IFthLCBiXSA9IHBhaXIodHJ1ZSwgMTIpO1xuICAgICAgICAgICAgZXhwZWN0KGEpLnRvLmJlLmVxbCh0cnVlKTtcbiAgICAgICAgICAgIGV4cGVjdChiKS50by5iZS5lcWwoMTIpO1xuICAgICAgICB9KTtcbiAgICB9KTtcblxuICAgIGRlc2NyaWJlKCdQYWlyXFwncycsICgpID0+IHtcbiAgICAgICAgaXQoJ2luY2x1ZGUgMiB2YWx1ZXMgYW5kIGFsbG93IHRvIHJldHJpZXZlIHRoZW0nLCAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBhcGFpciA9IFR1cGxlLlBhaXIodHJ1ZSwgMTIpO1xuICAgICAgICAgICAgZXhwZWN0KGFwYWlyWzBdKS50by5iZS5lcWwodHJ1ZSk7XG4gICAgICAgICAgICBleHBlY3QoYXBhaXJbMV0pLnRvLmJlLmVxbCgxMik7XG4gICAgICAgICAgICBleHBlY3QoYXBhaXIudHlwZSkudG8uYmUuZXFsKCdwYWlyJyk7XG4gICAgICAgICAgICBleHBlY3QoYXBhaXIuaXNQYWlyKS50by5iZS50cnVlO1xuICAgICAgICAgICAgZXhwZWN0KGFwYWlyLnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgnW3RydWUsMTJdJyk7XG4gICAgICAgIH0pO1xuICAgICAgICBpdCgnYXJlIGltbXV0YWJsZSwgYW5kIHRocm93IGlmIHlvdSB0cnkgdG8gY2hhbmdlIHRoZW0nLCAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBhcGFpciA9IFR1cGxlLlBhaXIodHJ1ZSwgMTIpO1xuICAgICAgICAgICAgZXhwZWN0KCgpID0+IHtcbiAgICAgICAgICAgICAgICBhdHJpcGxlWzBdID0gZmFsc2U7XG4gICAgICAgICAgICB9KS50by50aHJvdztcbiAgICAgICAgICAgIGV4cGVjdCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgYXRyaXBsZVsxXSA9IDEzO1xuICAgICAgICAgICAgfSkudG8udGhyb3c7XG4gICAgICAgIH0pO1xuICAgICAgICBpdCgnYXJlIHRydWUgaXRlcmFibGVzLCBhbmQgdGhlcmVmb3JlIGFsbG93IHBvc2l0aW9uYWwgZGVzdHJ1Y3R1cmluZycsICgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IFthLCBiXSA9IFR1cGxlLlBhaXIodHJ1ZSwgMTIpO1xuICAgICAgICAgICAgZXhwZWN0KGEpLnRvLmJlLmVxbCh0cnVlKTtcbiAgICAgICAgICAgIGV4cGVjdChiKS50by5iZS5lcWwoMTIpO1xuICAgICAgICB9KTtcbiAgICB9KTtcblxuICAgIGRlc2NyaWJlKCdUcmlwbGVcXCdzJywgKCkgPT4ge1xuICAgICAgICBpdCgnaW5jbHVkZSAzIHZhbHVlcyBhbmQgYWxsb3cgdG8gcmV0cmlldmUgdGhlbScsICgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGF0cmlwbGUgPSBUdXBsZS5UcmlwbGUodHJ1ZSwgMTIsICdhJyk7XG4gICAgICAgICAgICBleHBlY3QoYXRyaXBsZVswXSkudG8uYmUuZXFsKHRydWUpO1xuICAgICAgICAgICAgZXhwZWN0KGF0cmlwbGVbMV0pLnRvLmJlLmVxbCgxMik7XG4gICAgICAgICAgICBleHBlY3QoYXRyaXBsZVsyXSkudG8uYmUuZXFsKCdhJyk7XG4gICAgICAgICAgICBleHBlY3QoYXRyaXBsZS50eXBlKS50by5iZS5lcWwoJ3RyaXBsZScpO1xuICAgICAgICAgICAgZXhwZWN0KGF0cmlwbGUuaXNUcmlwbGUpLnRvLmJlLnRydWU7XG4gICAgICAgICAgICBleHBlY3QoYXRyaXBsZS50b1N0cmluZygpKS50by5iZS5lcWwoJ1t0cnVlLDEyLGFdJyk7XG4gICAgICAgIH0pO1xuICAgICAgICBpdCgnYXJlIGltbXV0YWJsZSwgYW5kIHRocm93IGlmIHlvdSB0cnkgdG8gY2hhbmdlIHRoZW0nLCAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBhdHJpcGxlID0gVHVwbGUuVHJpcGxlKHRydWUsIDEyLCAnYScpO1xuICAgICAgICAgICAgZXhwZWN0KCgpID0+IHtcbiAgICAgICAgICAgICAgICBhdHJpcGxlWzBdID0gZmFsc2U7XG4gICAgICAgICAgICB9KS50by50aHJvdztcbiAgICAgICAgICAgIGV4cGVjdCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgYXRyaXBsZVsxXSA9IDEzO1xuICAgICAgICAgICAgfSkudG8udGhyb3c7XG4gICAgICAgICAgICBleHBlY3QoKCkgPT4ge1xuICAgICAgICAgICAgICAgIGF0cmlwbGVbMl0gPSAnYic7XG4gICAgICAgICAgICB9KS50by50aHJvdztcbiAgICAgICAgfSk7XG4gICAgICAgIGl0KCdhcmUgdHJ1ZSBpdGVyYWJsZXMsIGFuZCB0aGVyZWZvcmUgYWxsb3cgcG9zaXRpb25hbCBkZXN0cnVjdHVyaW5nJywgKCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgW2EsIGIsIGNdID0gVHVwbGUuVHJpcGxlKHRydWUsIDEyLCAnYScpO1xuICAgICAgICAgICAgZXhwZWN0KGEpLnRvLmJlLmVxbCh0cnVlKTtcbiAgICAgICAgICAgIGV4cGVjdChiKS50by5iZS5lcWwoMTIpO1xuICAgICAgICAgICAgZXhwZWN0KGMpLnRvLmJlLmVxbCgnYScpO1xuICAgICAgICB9KTtcbiAgICB9KTtcblxuICAgIGRlc2NyaWJlKCdzdWNjZXNzIGFuZCBmYWlsdXJlJywgKCkgPT4ge1xuICAgICAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgICAgfSk7XG4gICAgICAgIGl0KCdtYXkgcmVwcmVzZW50IHN1Y2Nlc3NlcycsICgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHN1Y2MgPSBzdWNjZXNzKHRydWUsIDEyKTtcbiAgICAgICAgICAgIGV4cGVjdChzdWNjWzBdKS50by5iZS50cnVlO1xuICAgICAgICAgICAgZXhwZWN0KHN1Y2NbMV0pLnRvLmJlLmVxbCgxMik7XG4gICAgICAgICAgICBleHBlY3QoaXNTdWNjZXNzKHN1Y2MpKS50by5iZS50cnVlO1xuICAgICAgICAgICAgZXhwZWN0KGlzUGFpcihzdWNjKSkudG8uYmUudHJ1ZTtcbiAgICAgICAgfSk7XG4gICAgICAgIGl0KCdtYXkgcmVwcmVzZW50IGZhaWx1cmVzJywgKCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgZmFpbCA9IGZhaWx1cmUoJ2EnLCAxMik7XG4gICAgICAgICAgICBleHBlY3QoZmFpbFswXSkudG8uYmUuZXFsKCdhJyk7XG4gICAgICAgICAgICBleHBlY3QoZmFpbFsxXSkudG8uYmUuZXFsKDEyKTtcbiAgICAgICAgICAgIGV4cGVjdChpc1N1Y2Nlc3MoZmFpbCkpLnRvLmJlLmZhbHNlO1xuICAgICAgICAgICAgZXhwZWN0KGlzRmFpbHVyZShmYWlsKSkudG8uYmUudHJ1ZTtcbiAgICAgICAgICAgIGV4cGVjdChpc1BhaXIoZmFpbCkpLnRvLmJlLnRydWU7XG4gICAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgZGVzY3JpYmUoJ0pWYWx1ZVxcJ3MgYXJlIHBhcnNlZCBKU09OIHZhbHVlcycsICgpID0+IHtcbiAgICAgICAgZGVzY3JpYmUoJ3dpdGggSlN0cmluZ1xcJ3MgYXMgcGFyc2VkIEpTT04gc3RyaW5nIHZhbHVlcycsICgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGpzdHJpbmcgPSBKVmFsdWUuSlN0cmluZygnYWJjJyk7XG4gICAgICAgICAgICBpdCgndGhhdCBhcmUgcmV0cmlldmFibGUnLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgZXhwZWN0KGpzdHJpbmcudmFsdWUpLnRvLmJlLmVxbCgnYWJjJyk7XG4gICAgICAgICAgICAgICAgZXhwZWN0KGpzdHJpbmcudG9TdHJpbmcoKSkudG8uYmUuZXFsKCdKU3RyaW5nKGFiYyknKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaXQoJ3RoYXQgYXJlIGltbXV0YWJsZScsICgpID0+IHtcbiAgICAgICAgICAgICAgICBleHBlY3QoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBqc3RyaW5nLnZhbHVlID0gJ2RlZic7XG4gICAgICAgICAgICAgICAgfSkudG8udGhyb3c7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGl0KCd0aGF0IGdvdHRhIGJlIHN0cmluZ3MnLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgZXhwZWN0KCgpID0+IEpWYWx1ZS5KU3RyaW5nKDEyMykpLnRvLnRocm93O1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpdCgndGhhdCBnb3R0YSBieSB0eXBlcyB3aXRoIGEgc3VwZXJ0eXBlJywgKCkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IGpzdHJpbmcgPSBKVmFsdWUuSlN0cmluZygnMTIzJyk7XG4gICAgICAgICAgICAgICAgZXhwZWN0KGpzdHJpbmcuaXNKVmFsdWUpLnRvLmJlLnRydWU7XG4gICAgICAgICAgICAgICAgZXhwZWN0KGpzdHJpbmcuaXNKU3RyaW5nKS50by5iZS50cnVlO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgICBpdCgnd2l0aCBKTnVtYmVyXFwncyBhcyBwYXJzZWQgSlNPTiBmbG9hdCB2YWx1ZXMnLCAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBqbnVtYmVyID0gSlZhbHVlLkpOdW1iZXIoMTIzLjQ1ZS0yMyk7XG4gICAgICAgICAgICBleHBlY3Qoam51bWJlci52YWx1ZSkudG8uYmUuZXFsKDEyMy40NWUtMjMpO1xuICAgICAgICAgICAgZXhwZWN0KGpudW1iZXIudG9TdHJpbmcoKSkudG8uYmUuZXFsKCdKTnVtYmVyKDEuMjM0NWUtMjEpJyk7XG4gICAgICAgICAgICBleHBlY3Qoam51bWJlci5pc0pWYWx1ZSkudG8uYmUudHJ1ZTtcbiAgICAgICAgICAgIGV4cGVjdChqbnVtYmVyLmlzSk51bWJlcikudG8uYmUudHJ1ZTtcbiAgICAgICAgICAgIGV4cGVjdCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgam51bWJlci52YWx1ZSA9IDEyMztcbiAgICAgICAgICAgIH0pLnRvLnRocm93O1xuICAgICAgICAgICAgZXhwZWN0KCgpID0+IEpWYWx1ZS5KTnVtYmVyKCd4JykpLnRvLnRocm93O1xuICAgICAgICAgICAgZXhwZWN0KCgpID0+IEpWYWx1ZS5KTnVtYmVyKE5hTikpLnRvLnRocm93O1xuICAgICAgICB9KTtcbiAgICAgICAgaXQoJ3dpdGggSkJvb2xcXCdzIGFzIHBhcnNlZCBKU09OIGJvb2xlYW4gdmFsdWVzJywgKCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgamJvb2wgPSBKVmFsdWUuSkJvb2wodHJ1ZSk7XG4gICAgICAgICAgICBleHBlY3QoamJvb2wudmFsdWUpLnRvLmJlLnRydWU7XG4gICAgICAgICAgICBleHBlY3QoamJvb2wudG9TdHJpbmcoKSkudG8uYmUuZXFsKCdKQm9vbCh0cnVlKScpO1xuICAgICAgICAgICAgZXhwZWN0KGpib29sLmlzSlZhbHVlKS50by5iZS50cnVlO1xuICAgICAgICAgICAgZXhwZWN0KGpib29sLmlzSkJvb2wpLnRvLmJlLnRydWU7XG4gICAgICAgICAgICBleHBlY3QoKCkgPT4ge1xuICAgICAgICAgICAgICAgIGpib29sLnZhbHVlID0gZmFsc2U7XG4gICAgICAgICAgICB9KS50by50aHJvdztcbiAgICAgICAgICAgIGV4cGVjdCgoKSA9PiBKVmFsdWUuSkJvb2woJ3gnKSkudG8udGhyb3c7XG4gICAgICAgICAgICBleHBlY3QoKCkgPT4gSlZhbHVlLkpCb29sKDEyMykpLnRvLnRocm93O1xuICAgICAgICAgICAgZXhwZWN0KCgpID0+IEpWYWx1ZS5KQm9vbChOYU4pKS50by50aHJvdztcbiAgICAgICAgfSk7XG4gICAgICAgIGl0KCd3aXRoIEpOdWxsXFwncyBhcyBwYXJzZWQgSlNPTiBudWxsIHZhbHVlcycsICgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGpudWxsID0gSlZhbHVlLkpOdWxsKG51bGwpO1xuICAgICAgICAgICAgZXhwZWN0KGpudWxsLnZhbHVlKS50by5iZS5udWxsO1xuICAgICAgICAgICAgZXhwZWN0KGpudWxsLnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgnSk51bGwobnVsbCknKTtcbiAgICAgICAgICAgIGV4cGVjdChqbnVsbC5pc0pWYWx1ZSkudG8uYmUudHJ1ZTtcbiAgICAgICAgICAgIGV4cGVjdChqbnVsbC5pc0pOdWxsKS50by5iZS50cnVlO1xuICAgICAgICAgICAgZXhwZWN0KCgpID0+IHtcbiAgICAgICAgICAgICAgICBqbnVsbC52YWx1ZSA9IDEyMztcbiAgICAgICAgICAgIH0pLnRvLnRocm93O1xuICAgICAgICAgICAgZXhwZWN0KCgpID0+IEpWYWx1ZS5KTnVsbCgnJykpLnRvLnRocm93O1xuICAgICAgICAgICAgZXhwZWN0KCgpID0+IEpWYWx1ZS5KTnVsbCh1bmRlZmluZWQpKS50by50aHJvdztcbiAgICAgICAgICAgIGV4cGVjdCgoKSA9PiBKVmFsdWUuSk51bGwoTmFOKSkudG8udGhyb3c7XG4gICAgICAgIH0pO1xuICAgICAgICBpdCgnd2l0aCBKQXJyYXlcXCdzIGFzIHBhcnNlZCBKU09OIGFycmF5cycsICgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGphcnJheSA9IEpWYWx1ZS5KQXJyYXkoSlZhbHVlLkpTdHJpbmcoJ2EnKSwgSlZhbHVlLkpCb29sKGZhbHNlKSwgSlZhbHVlLkpOdWxsKG51bGwpKTtcbiAgICAgICAgICAgIGNvbnN0IGphclZhbHVlID0gamFycmF5LnZhbHVlO1xuICAgICAgICAgICAgZXhwZWN0KGphclZhbHVlWzBdLnZhbHVlKS50by5iZS5lcWwoJ2EnKTtcbiAgICAgICAgICAgIGV4cGVjdChqYXJWYWx1ZVsxXS52YWx1ZSkudG8uYmUuZXFsKGZhbHNlKTtcbiAgICAgICAgICAgIGV4cGVjdChqYXJWYWx1ZVsyXS52YWx1ZSkudG8uYmUuZXFsKG51bGwpO1xuICAgICAgICAgICAgZXhwZWN0KGphcnJheS50b1N0cmluZygpKS50by5iZS5lcWwoJ0pBcnJheShbSlN0cmluZyhhKSxKQm9vbChmYWxzZSksSk51bGwobnVsbCksXSknKTtcbiAgICAgICAgICAgIGV4cGVjdChqYXJyYXkuaXNKVmFsdWUpLnRvLmJlLnRydWU7XG4gICAgICAgICAgICBleHBlY3QoamFycmF5LmlzSkFycmF5KS50by5iZS50cnVlO1xuICAgICAgICAgICAgZXhwZWN0KCgpID0+IHtcbiAgICAgICAgICAgICAgICBqYXJyYXkudmFsdWUgPSAxMjM7XG4gICAgICAgICAgICB9KS50by50aHJvdztcbiAgICAgICAgICAgIGV4cGVjdCgoKSA9PiBKVmFsdWUuSkFycmF5KCcnKSkudG8udGhyb3c7XG4gICAgICAgICAgICBleHBlY3QoKCkgPT4gSlZhbHVlLkpBcnJheSh1bmRlZmluZWQpKS50by50aHJvdztcbiAgICAgICAgICAgIGV4cGVjdCgoKSA9PiBKVmFsdWUuSkFycmF5KE5hTikpLnRvLnRocm93O1xuICAgICAgICB9KTtcbiAgICAgICAgaXQoJ3dpdGggSk9iamVjdHNcXCdzIGFzIHBhcnNlZCBKU09OIG9iamVjdHMnLCAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBqb2JqZWN0ID0gSlZhbHVlLkpPYmplY3QoXG4gICAgICAgICAgICAgICAgVHVwbGUuUGFpcignc3RyaW5nJywgSlZhbHVlLkpTdHJpbmcoJ2EnKSksXG4gICAgICAgICAgICAgICAgVHVwbGUuUGFpcignYm9vbGVhbicsIEpWYWx1ZS5KQm9vbChmYWxzZSkpLFxuICAgICAgICAgICAgICAgIFR1cGxlLlBhaXIoJ251bGwnLCBKVmFsdWUuSk51bGwobnVsbCkpXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgZXhwZWN0KGpvYmplY3RbJ3N0cmluZyddLnZhbHVlKS50by5iZS5lcWwoJ2EnKTtcbiAgICAgICAgICAgIGV4cGVjdChqb2JqZWN0Wydib29sZWFuJ10udmFsdWUpLnRvLmJlLmVxbChmYWxzZSk7XG4gICAgICAgICAgICBleHBlY3Qoam9iamVjdFsnbnVsbCddLnZhbHVlKS50by5iZS5lcWwobnVsbCk7XG4gICAgICAgICAgICAvL2V4cGVjdChqb2JqZWN0LnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgnSkFycmF5KFtKU3RyaW5nKGEpLEpCb29sKGZhbHNlKSxKTnVsbChudWxsKSxdKScpO1xuICAgICAgICAgICAgZXhwZWN0KGpvYmplY3QuaXNKVmFsdWUpLnRvLmJlLnRydWU7XG4gICAgICAgICAgICBleHBlY3Qoam9iamVjdC5pc0pPYmplY3QpLnRvLmJlLnRydWU7XG4gICAgICAgICAgICBleHBlY3QoKCkgPT4ge1xuICAgICAgICAgICAgICAgIGpvYmplY3Quc3RyaW5nID0gJ2FiYyc7XG4gICAgICAgICAgICB9KS50by50aHJvdztcbiAgICAgICAgICAgIGV4cGVjdCgoKSA9PiBKVmFsdWUuSk9iamVjdChKVmFsdWUuSk9iamVjdChcbiAgICAgICAgICAgICAgICBUdXBsZS5QYWlyKCdzdHJpbmcnLCBKVmFsdWUuSlN0cmluZygnYScpKSxcbiAgICAgICAgICAgICAgICBUdXBsZS5QYWlyKCdib29sZWFuJywgZmFsc2UpLCAvLyB2YWx1ZSBtdXN0IGJlIGEgSlZhbHVlXG4gICAgICAgICAgICAgICAgVHVwbGUuUGFpcignbnVsbCcsIEpWYWx1ZS5KTnVsbChudWxsKSlcbiAgICAgICAgICAgICkpKS50by50aHJvdztcbiAgICAgICAgICAgIGV4cGVjdCgoKSA9PiBKVmFsdWUuSk9iamVjdChKVmFsdWUuSk9iamVjdChcbiAgICAgICAgICAgICAgICBUdXBsZS5QYWlyKCdzdHJpbmcnLCBKVmFsdWUuSlN0cmluZygnYScpKSxcbiAgICAgICAgICAgICAgICBUdXBsZS5QYWlyKDEyMywgSlZhbHVlLkpOdWxsKG51bGwpKSAvLyBrZXkgbXVzdCBiZSBhIHN0cmluZ1xuICAgICAgICAgICAgKSkpLnRvLnRocm93O1xuICAgICAgICAgICAgZXhwZWN0KCgpID0+IEpWYWx1ZS5KTnVsbChUdXBsZS5UcmlwbGUoMSwyLDMpKSkudG8udGhyb3c7XG4gICAgICAgIH0pO1xuXG4gICAgfSk7XG59KTtcbiJdfQ==