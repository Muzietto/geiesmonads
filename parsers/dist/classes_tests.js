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
            });
            it('return Nothing when position is beyond the contained rows content', function () {
                var pos1010 = (0, _classes.Position)(rows, 10, 10);
                (0, _chai.expect)(pos1010.char().isNothing).to.be.true;
                var pos23 = (0, _classes.Position)(rows, 2, 2).incrPos();
                (0, _chai.expect)(pos23.char().isNothing).to.be.true;
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
    });
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2pzLXNwZWMvY2xhc3Nlc190ZXN0cy5qcyJdLCJuYW1lcyI6WyJkZXNjcmliZSIsImpzdHJpbmciLCJKU3RyaW5nIiwiaXQiLCJ2YWx1ZSIsInRvIiwiYmUiLCJlcWwiLCJ0b1N0cmluZyIsInRocm93IiwiaXNKVmFsdWUiLCJ0cnVlIiwiaXNKU3RyaW5nIiwiam51bWJlciIsIkpOdW1iZXIiLCJpc0pOdW1iZXIiLCJOYU4iLCJqYm9vbCIsIkpCb29sIiwiaXNKQm9vbCIsImpudWxsIiwiSk51bGwiLCJudWxsIiwiaXNKTnVsbCIsInVuZGVmaW5lZCIsImphcnJheSIsIkpBcnJheSIsImphclZhbHVlIiwiaXNKQXJyYXkiLCJqb2JqZWN0IiwiSk9iamVjdCIsIlBhaXIiLCJpc0pPYmplY3QiLCJzdHJpbmciLCJUcmlwbGUiLCJyb3dzIiwicG9zMDAiLCJpc1Bvc2l0aW9uIiwiY2hhciIsImlzSnVzdCIsInBvczExIiwicG9zMDEiLCJpbmNyUG9zIiwicG9zMjAiLCJwb3MxMDEwIiwiaXNOb3RoaW5nIiwicG9zMjMiLCJmcm9tVGV4dCIsInJlc3QiLCJhU29tZSIsInZhbCIsImFOb25lIiwiYXBhaXIiLCJ0eXBlIiwiYSIsImIiLCJpc1BhaXIiLCJhdHJpcGxlIiwiaXNUcmlwbGUiLCJjIiwiYmVmb3JlRWFjaCIsInN1Y2MiLCJmYWlsIiwiZmFsc2UiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBbUJBQSxhQUFTLHNCQUFULEVBQWlDLFlBQU07O0FBRW5DQSxpQkFBUyxrQ0FBVCxFQUE2QyxZQUFNO0FBQy9DQSxxQkFBUyw4Q0FBVCxFQUF5RCxZQUFNO0FBQzNELG9CQUFNQyxVQUFVLGdCQUFPQyxPQUFQLENBQWUsS0FBZixDQUFoQjtBQUNBQyxtQkFBRyxzQkFBSCxFQUEyQixZQUFNO0FBQzdCLHNDQUFPRixRQUFRRyxLQUFmLEVBQXNCQyxFQUF0QixDQUF5QkMsRUFBekIsQ0FBNEJDLEdBQTVC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RUFBd0J6RCxFQUF4QixDQUEyQkMsRUFBM0IsQ0FBOEJLLElBQTlCO0FBQ0Esa0NBQU8sa0JBQU9tRCxJQUFQLENBQVAsRUFBcUJ6RCxFQUFyQixDQUF3QkMsRUFBeEIsQ0FBMkJLLElBQTNCO0FBQ0gsYUFQRDtBQVFILFNBbEJEO0FBbUJILEtBbFFEIiwiZmlsZSI6ImNsYXNzZXNfdGVzdHMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge2V4cGVjdH0gZnJvbSAnY2hhaSc7XG5pbXBvcnQge1xuICAgIGlzUGFpcixcbiAgICBpc1N1Y2Nlc3MsXG4gICAgaXNGYWlsdXJlLFxuICAgIGlzU29tZSxcbiAgICBpc05vbmUsXG59IGZyb20gJ3V0aWwnO1xuaW1wb3J0IHtcbiAgICBwYWlyLFxuICAgIHN1Y2Nlc3MsXG4gICAgZmFpbHVyZSxcbiAgICBzb21lLFxuICAgIG5vbmUsXG4gICAgUG9zaXRpb24sXG4gICAgVHVwbGUsXG4gICAgSlZhbHVlLFxufSBmcm9tICdjbGFzc2VzJztcblxuZGVzY3JpYmUoJ2Ftb25nIGhlbHBlciBjbGFzc2VzJywgKCkgPT4ge1xuXG4gICAgZGVzY3JpYmUoJ0pWYWx1ZVxcJ3MgYXJlIHBhcnNlZCBKU09OIHZhbHVlcycsICgpID0+IHtcbiAgICAgICAgZGVzY3JpYmUoJ3dpdGggSlN0cmluZ1xcJ3MgYXMgcGFyc2VkIEpTT04gc3RyaW5nIHZhbHVlcycsICgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGpzdHJpbmcgPSBKVmFsdWUuSlN0cmluZygnYWJjJyk7XG4gICAgICAgICAgICBpdCgndGhhdCBhcmUgcmV0cmlldmFibGUnLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgZXhwZWN0KGpzdHJpbmcudmFsdWUpLnRvLmJlLmVxbCgnYWJjJyk7XG4gICAgICAgICAgICAgICAgZXhwZWN0KGpzdHJpbmcudG9TdHJpbmcoKSkudG8uYmUuZXFsKCdKU3RyaW5nKGFiYyknKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaXQoJ3RoYXQgYXJlIGltbXV0YWJsZScsICgpID0+IHtcbiAgICAgICAgICAgICAgICBleHBlY3QoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBqc3RyaW5nLnZhbHVlID0gJ2RlZic7XG4gICAgICAgICAgICAgICAgfSkudG8udGhyb3c7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGl0KCd0aGF0IGdvdHRhIGJlIHN0cmluZ3MnLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgZXhwZWN0KCgpID0+IEpWYWx1ZS5KU3RyaW5nKDEyMykpLnRvLnRocm93O1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpdCgndGhhdCBnb3R0YSBieSB0eXBlcyB3aXRoIGEgc3VwZXJ0eXBlJywgKCkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IGpzdHJpbmcgPSBKVmFsdWUuSlN0cmluZygnMTIzJyk7XG4gICAgICAgICAgICAgICAgZXhwZWN0KGpzdHJpbmcuaXNKVmFsdWUpLnRvLmJlLnRydWU7XG4gICAgICAgICAgICAgICAgZXhwZWN0KGpzdHJpbmcuaXNKU3RyaW5nKS50by5iZS50cnVlO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgICBpdCgnd2l0aCBKTnVtYmVyXFwncyBhcyBwYXJzZWQgSlNPTiBmbG9hdCB2YWx1ZXMnLCAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBqbnVtYmVyID0gSlZhbHVlLkpOdW1iZXIoMTIzLjQ1ZS0yMyk7XG4gICAgICAgICAgICBleHBlY3Qoam51bWJlci52YWx1ZSkudG8uYmUuZXFsKDEyMy40NWUtMjMpO1xuICAgICAgICAgICAgZXhwZWN0KGpudW1iZXIudG9TdHJpbmcoKSkudG8uYmUuZXFsKCdKTnVtYmVyKDEuMjM0NWUtMjEpJyk7XG4gICAgICAgICAgICBleHBlY3Qoam51bWJlci5pc0pWYWx1ZSkudG8uYmUudHJ1ZTtcbiAgICAgICAgICAgIGV4cGVjdChqbnVtYmVyLmlzSk51bWJlcikudG8uYmUudHJ1ZTtcbiAgICAgICAgICAgIGV4cGVjdCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgam51bWJlci52YWx1ZSA9IDEyMztcbiAgICAgICAgICAgIH0pLnRvLnRocm93O1xuICAgICAgICAgICAgZXhwZWN0KCgpID0+IEpWYWx1ZS5KTnVtYmVyKCd4JykpLnRvLnRocm93O1xuICAgICAgICAgICAgZXhwZWN0KCgpID0+IEpWYWx1ZS5KTnVtYmVyKE5hTikpLnRvLnRocm93O1xuICAgICAgICB9KTtcbiAgICAgICAgaXQoJ3dpdGggSkJvb2xcXCdzIGFzIHBhcnNlZCBKU09OIGJvb2xlYW4gdmFsdWVzJywgKCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgamJvb2wgPSBKVmFsdWUuSkJvb2wodHJ1ZSk7XG4gICAgICAgICAgICBleHBlY3QoamJvb2wudmFsdWUpLnRvLmJlLnRydWU7XG4gICAgICAgICAgICBleHBlY3QoamJvb2wudG9TdHJpbmcoKSkudG8uYmUuZXFsKCdKQm9vbCh0cnVlKScpO1xuICAgICAgICAgICAgZXhwZWN0KGpib29sLmlzSlZhbHVlKS50by5iZS50cnVlO1xuICAgICAgICAgICAgZXhwZWN0KGpib29sLmlzSkJvb2wpLnRvLmJlLnRydWU7XG4gICAgICAgICAgICBleHBlY3QoKCkgPT4ge1xuICAgICAgICAgICAgICAgIGpib29sLnZhbHVlID0gZmFsc2U7XG4gICAgICAgICAgICB9KS50by50aHJvdztcbiAgICAgICAgICAgIGV4cGVjdCgoKSA9PiBKVmFsdWUuSkJvb2woJ3gnKSkudG8udGhyb3c7XG4gICAgICAgICAgICBleHBlY3QoKCkgPT4gSlZhbHVlLkpCb29sKDEyMykpLnRvLnRocm93O1xuICAgICAgICAgICAgZXhwZWN0KCgpID0+IEpWYWx1ZS5KQm9vbChOYU4pKS50by50aHJvdztcbiAgICAgICAgfSk7XG4gICAgICAgIGl0KCd3aXRoIEpOdWxsXFwncyBhcyBwYXJzZWQgSlNPTiBudWxsIHZhbHVlcycsICgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGpudWxsID0gSlZhbHVlLkpOdWxsKG51bGwpO1xuICAgICAgICAgICAgZXhwZWN0KGpudWxsLnZhbHVlKS50by5iZS5udWxsO1xuICAgICAgICAgICAgZXhwZWN0KGpudWxsLnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgnSk51bGwobnVsbCknKTtcbiAgICAgICAgICAgIGV4cGVjdChqbnVsbC5pc0pWYWx1ZSkudG8uYmUudHJ1ZTtcbiAgICAgICAgICAgIGV4cGVjdChqbnVsbC5pc0pOdWxsKS50by5iZS50cnVlO1xuICAgICAgICAgICAgZXhwZWN0KCgpID0+IHtcbiAgICAgICAgICAgICAgICBqbnVsbC52YWx1ZSA9IDEyMztcbiAgICAgICAgICAgIH0pLnRvLnRocm93O1xuICAgICAgICAgICAgZXhwZWN0KCgpID0+IEpWYWx1ZS5KTnVsbCgnJykpLnRvLnRocm93O1xuICAgICAgICAgICAgZXhwZWN0KCgpID0+IEpWYWx1ZS5KTnVsbCh1bmRlZmluZWQpKS50by50aHJvdztcbiAgICAgICAgICAgIGV4cGVjdCgoKSA9PiBKVmFsdWUuSk51bGwoTmFOKSkudG8udGhyb3c7XG4gICAgICAgIH0pO1xuICAgICAgICBpdCgnd2l0aCBKQXJyYXlcXCdzIGFzIHBhcnNlZCBKU09OIGFycmF5cycsICgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGphcnJheSA9IEpWYWx1ZS5KQXJyYXkoSlZhbHVlLkpTdHJpbmcoJ2EnKSwgSlZhbHVlLkpCb29sKGZhbHNlKSwgSlZhbHVlLkpOdWxsKG51bGwpKTtcbiAgICAgICAgICAgIGNvbnN0IGphclZhbHVlID0gamFycmF5LnZhbHVlO1xuICAgICAgICAgICAgZXhwZWN0KGphclZhbHVlWzBdLnZhbHVlKS50by5iZS5lcWwoJ2EnKTtcbiAgICAgICAgICAgIGV4cGVjdChqYXJWYWx1ZVsxXS52YWx1ZSkudG8uYmUuZXFsKGZhbHNlKTtcbiAgICAgICAgICAgIGV4cGVjdChqYXJWYWx1ZVsyXS52YWx1ZSkudG8uYmUuZXFsKG51bGwpO1xuICAgICAgICAgICAgZXhwZWN0KGphcnJheS50b1N0cmluZygpKS50by5iZS5lcWwoJ0pBcnJheShbSlN0cmluZyhhKSxKQm9vbChmYWxzZSksSk51bGwobnVsbCksXSknKTtcbiAgICAgICAgICAgIGV4cGVjdChqYXJyYXkuaXNKVmFsdWUpLnRvLmJlLnRydWU7XG4gICAgICAgICAgICBleHBlY3QoamFycmF5LmlzSkFycmF5KS50by5iZS50cnVlO1xuICAgICAgICAgICAgZXhwZWN0KCgpID0+IHtcbiAgICAgICAgICAgICAgICBqYXJyYXkudmFsdWUgPSAxMjM7XG4gICAgICAgICAgICB9KS50by50aHJvdztcbiAgICAgICAgICAgIGV4cGVjdCgoKSA9PiBKVmFsdWUuSkFycmF5KCcnKSkudG8udGhyb3c7XG4gICAgICAgICAgICBleHBlY3QoKCkgPT4gSlZhbHVlLkpBcnJheSh1bmRlZmluZWQpKS50by50aHJvdztcbiAgICAgICAgICAgIGV4cGVjdCgoKSA9PiBKVmFsdWUuSkFycmF5KE5hTikpLnRvLnRocm93O1xuICAgICAgICB9KTtcbiAgICAgICAgaXQoJ3dpdGggSk9iamVjdHNcXCdzIGFzIHBhcnNlZCBKU09OIG9iamVjdHMnLCAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBqb2JqZWN0ID0gSlZhbHVlLkpPYmplY3QoXG4gICAgICAgICAgICAgICAgVHVwbGUuUGFpcignc3RyaW5nJywgSlZhbHVlLkpTdHJpbmcoJ2EnKSksXG4gICAgICAgICAgICAgICAgVHVwbGUuUGFpcignYm9vbGVhbicsIEpWYWx1ZS5KQm9vbChmYWxzZSkpLFxuICAgICAgICAgICAgICAgIFR1cGxlLlBhaXIoJ251bGwnLCBKVmFsdWUuSk51bGwobnVsbCkpXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgZXhwZWN0KGpvYmplY3RbJ3N0cmluZyddLnZhbHVlKS50by5iZS5lcWwoJ2EnKTtcbiAgICAgICAgICAgIGV4cGVjdChqb2JqZWN0Wydib29sZWFuJ10udmFsdWUpLnRvLmJlLmVxbChmYWxzZSk7XG4gICAgICAgICAgICBleHBlY3Qoam9iamVjdFsnbnVsbCddLnZhbHVlKS50by5iZS5lcWwobnVsbCk7XG4gICAgICAgICAgICAvL2V4cGVjdChqb2JqZWN0LnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgnSkFycmF5KFtKU3RyaW5nKGEpLEpCb29sKGZhbHNlKSxKTnVsbChudWxsKSxdKScpO1xuICAgICAgICAgICAgZXhwZWN0KGpvYmplY3QuaXNKVmFsdWUpLnRvLmJlLnRydWU7XG4gICAgICAgICAgICBleHBlY3Qoam9iamVjdC5pc0pPYmplY3QpLnRvLmJlLnRydWU7XG4gICAgICAgICAgICBleHBlY3QoKCkgPT4ge1xuICAgICAgICAgICAgICAgIGpvYmplY3Quc3RyaW5nID0gJ2FiYyc7XG4gICAgICAgICAgICB9KS50by50aHJvdztcbiAgICAgICAgICAgIGV4cGVjdCgoKSA9PiBKVmFsdWUuSk9iamVjdChKVmFsdWUuSk9iamVjdChcbiAgICAgICAgICAgICAgICBUdXBsZS5QYWlyKCdzdHJpbmcnLCBKVmFsdWUuSlN0cmluZygnYScpKSxcbiAgICAgICAgICAgICAgICBUdXBsZS5QYWlyKCdib29sZWFuJywgZmFsc2UpLCAvLyB2YWx1ZSBtdXN0IGJlIGEgSlZhbHVlXG4gICAgICAgICAgICAgICAgVHVwbGUuUGFpcignbnVsbCcsIEpWYWx1ZS5KTnVsbChudWxsKSlcbiAgICAgICAgICAgICkpKS50by50aHJvdztcbiAgICAgICAgICAgIGV4cGVjdCgoKSA9PiBKVmFsdWUuSk9iamVjdChKVmFsdWUuSk9iamVjdChcbiAgICAgICAgICAgICAgICBUdXBsZS5QYWlyKCdzdHJpbmcnLCBKVmFsdWUuSlN0cmluZygnYScpKSxcbiAgICAgICAgICAgICAgICBUdXBsZS5QYWlyKDEyMywgSlZhbHVlLkpOdWxsKG51bGwpKSAvLyBrZXkgbXVzdCBiZSBhIHN0cmluZ1xuICAgICAgICAgICAgKSkpLnRvLnRocm93O1xuICAgICAgICAgICAgZXhwZWN0KCgpID0+IEpWYWx1ZS5KTnVsbChUdXBsZS5UcmlwbGUoMSwyLDMpKSkudG8udGhyb3c7XG4gICAgICAgIH0pO1xuXG4gICAgfSk7XG5cbiAgICBkZXNjcmliZSgnUG9zaXRpb25cXCdzJywgKCkgPT4ge1xuICAgICAgICBjb25zdCByb3dzID0gW1xuICAgICAgICAgICAgWzEsIDIsIDNdLFxuICAgICAgICAgICAgWydhJywgJ2InLCAnYycsICdkJ10sXG4gICAgICAgICAgICBbJ0EnLCAnQicsICdDJ10sXG4gICAgICAgIF07XG4gICAgICAgIGl0KCdpbmNsdWRlIHRhYmxlcyBvZiBjaGFycyBhbmQgYWxsb3cgdG8gcmV0cmlldmUgY2hhciBvcHRpb25zJywgKCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgcG9zMDAgPSBQb3NpdGlvbihyb3dzLCAwLCAwKTtcbiAgICAgICAgICAgIGV4cGVjdChwb3MwMC5pc1Bvc2l0aW9uKS50by5iZS50cnVlO1xuICAgICAgICAgICAgZXhwZWN0KHBvczAwLmNoYXIoKS5pc0p1c3QpLnRvLmJlLnRydWU7XG4gICAgICAgICAgICBleHBlY3QocG9zMDAuY2hhcigpLnZhbHVlKS50by5iZS5lcWwoMSk7XG4gICAgICAgICAgICBjb25zdCBwb3MxMSA9IFBvc2l0aW9uKHJvd3MsIDEsIDEpO1xuICAgICAgICAgICAgZXhwZWN0KHBvczExLmNoYXIoKS5pc0p1c3QpLnRvLmJlLnRydWU7XG4gICAgICAgICAgICBleHBlY3QocG9zMTEuY2hhcigpLnZhbHVlKS50by5iZS5lcWwoJ2InKTtcbiAgICAgICAgfSk7XG4gICAgICAgIGl0KCdhbGxvdyB0byBpbmNyZW1lbnQgdGhlIHBvc2l0aW9uIGFuZCByZXRyaWV2ZSBmdXJ0aGVyIGNoYXJzJywgKCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgcG9zMDEgPSBQb3NpdGlvbihyb3dzLCAwLCAwKS5pbmNyUG9zKCk7XG4gICAgICAgICAgICBleHBlY3QocG9zMDEuY2hhcigpLnZhbHVlKS50by5iZS5lcWwoMik7XG4gICAgICAgICAgICBjb25zdCBwb3MyMCA9IFBvc2l0aW9uKHJvd3MsIDEsIDMpLmluY3JQb3MoKTtcbiAgICAgICAgICAgIGV4cGVjdChwb3MyMC5jaGFyKCkudmFsdWUpLnRvLmJlLmVxbCgnQScpO1xuICAgICAgICB9KTtcbiAgICAgICAgaXQoJ3JldHVybiBOb3RoaW5nIHdoZW4gcG9zaXRpb24gaXMgYmV5b25kIHRoZSBjb250YWluZWQgcm93cyBjb250ZW50JywgKCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgcG9zMTAxMCA9IFBvc2l0aW9uKHJvd3MsIDEwLCAxMCk7XG4gICAgICAgICAgICBleHBlY3QocG9zMTAxMC5jaGFyKCkuaXNOb3RoaW5nKS50by5iZS50cnVlO1xuICAgICAgICAgICAgY29uc3QgcG9zMjMgPSBQb3NpdGlvbihyb3dzLCAyLCAyKS5pbmNyUG9zKCk7XG4gICAgICAgICAgICBleHBlY3QocG9zMjMuY2hhcigpLmlzTm90aGluZykudG8uYmUudHJ1ZTtcbiAgICAgICAgfSk7XG4gICAgICAgIGl0KCdjYW4gYmUgaW5pdGlhbGl6ZWQgZnJvbSB0ZXh0IHN0cmluZ3MnLCAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBwb3MwMCA9IFBvc2l0aW9uLmZyb21UZXh0KCdMb3JlbSBpcHN1bSBkb2xvciBzaXQgYW1ldCcpO1xuICAgICAgICAgICAgZXhwZWN0KHBvczAwLmNoYXIoKS52YWx1ZSkudG8uYmUuZXFsKCdMJyk7XG4gICAgICAgICAgICBleHBlY3QocG9zMDAuaW5jclBvcygpLmluY3JQb3MoKS5pbmNyUG9zKCkuaW5jclBvcygpXG4gICAgICAgICAgICAgICAgLmNoYXIoKS52YWx1ZSkudG8uYmUuZXFsKCdtJyk7XG4gICAgICAgIH0pO1xuICAgICAgICBpdCgnY2FuIGJlIGluaXRpYWxpemVkIGFsc28gZnJvbSBtdWx0aWxpbmUgdGV4dCBzdHJpbmdzLCBzdHJpcHBpbmcgbmV3bGluZXMgYXdheScsICgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHBvczAwID0gUG9zaXRpb24uZnJvbVRleHQoJ0xvcmVtIFxcbmlwc3VtJyk7XG4gICAgICAgICAgICBleHBlY3QocG9zMDAuY2hhcigpLnZhbHVlKS50by5iZS5lcWwoJ0wnKTtcbiAgICAgICAgICAgIGV4cGVjdChwb3MwMC5pbmNyUG9zKCkuaW5jclBvcygpLmluY3JQb3MoKS5pbmNyUG9zKCkuaW5jclBvcygpLmluY3JQb3MoKVxuICAgICAgICAgICAgICAgIC5jaGFyKCkudmFsdWUpLnRvLmJlLmVxbCgnaScpO1xuICAgICAgICB9KTtcbiAgICAgICAgaXQoJ3JldHVybiBzdHJpbmdzIGNvbnRhaW5pbmcgYWxsIGNoYXJhY3RlcnMgc3RhcnRpbmcgZnJvbSBhIGdpdmVuIHBvc2l0aW9uLCBmb3IgdGhlIHNha2Ugb2YgdGVzdGluZycsICgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHBvczAxID0gUG9zaXRpb24uZnJvbVRleHQoJ0xvcmVtJykuaW5jclBvcygpO1xuICAgICAgICAgICAgZXhwZWN0KHBvczAxLnJlc3QoKSkudG8uYmUuZXFsKCdvcmVtJyk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgZGVzY3JpYmUoJ3NvbWVzJywgKCkgPT4ge1xuICAgICAgICBpdCgnaW5jbHVkZSBhIHZhbHVlIGFuZCBhbGxvdyB0byByZXRyaWV2ZSBpdCcsICgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGFTb21lID0gc29tZSgxMik7XG4gICAgICAgICAgICBleHBlY3QoYVNvbWUudmFsKCkpLnRvLmJlLmVxbCgxMik7XG4gICAgICAgICAgICBleHBlY3QoaXNTb21lKGFTb21lKSkudG8uYmUudHJ1ZTtcbiAgICAgICAgICAgIGV4cGVjdChhU29tZS50b1N0cmluZygpKS50by5iZS5lcWwoJ3NvbWUoMTIpJyk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgZGVzY3JpYmUoJ25vbmVzJywgKCkgPT4ge1xuICAgICAgICBpdCgnYXJlIGp1c3QgYSBzaWducG9zdCcsICgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGFOb25lID0gbm9uZSgpO1xuICAgICAgICAgICAgZXhwZWN0KGFOb25lLnZhbCgpKS50by5iZS5udWxsO1xuICAgICAgICAgICAgZXhwZWN0KGlzTm9uZShhTm9uZSkpLnRvLmJlLnRydWU7XG4gICAgICAgICAgICBleHBlY3QoYU5vbmUudG9TdHJpbmcoKSkudG8uYmUuZXFsKCdub25lKCknKTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICBkZXNjcmliZSgncGFpcnMnLCAoKSA9PiB7XG4gICAgICAgIGl0KCdpbmNsdWRlIDIgdmFsdWVzIGFuZCBhbGxvdyB0byByZXRyaWV2ZSB0aGVtJywgKCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgYXBhaXIgPSBwYWlyKHRydWUsIDEyKTtcbiAgICAgICAgICAgIGV4cGVjdChhcGFpclswXSkudG8uYmUuZXFsKHRydWUpO1xuICAgICAgICAgICAgZXhwZWN0KGFwYWlyWzFdKS50by5iZS5lcWwoMTIpO1xuICAgICAgICAgICAgZXhwZWN0KGFwYWlyLnR5cGUpLnRvLmJlLmVxbCgncGFpcicpO1xuICAgICAgICAgICAgZXhwZWN0KGlzUGFpcihhcGFpcikpLnRvLmJlLnRydWU7XG4gICAgICAgIH0pO1xuICAgICAgICBpdCgnYXJlIGFjdHVhbGx5IGFycmF5cywgYW5kIHRoZXJlZm9yZSBhbGxvdyBwb3NpdGlvbmFsIGRlc3RydWN0dXJpbmcnLCAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBbYSwgYl0gPSBwYWlyKHRydWUsIDEyKTtcbiAgICAgICAgICAgIGV4cGVjdChhKS50by5iZS5lcWwodHJ1ZSk7XG4gICAgICAgICAgICBleHBlY3QoYikudG8uYmUuZXFsKDEyKTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICBkZXNjcmliZSgnUGFpclxcJ3MnLCAoKSA9PiB7XG4gICAgICAgIGl0KCdpbmNsdWRlIDIgdmFsdWVzIGFuZCBhbGxvdyB0byByZXRyaWV2ZSB0aGVtJywgKCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgYXBhaXIgPSBUdXBsZS5QYWlyKHRydWUsIDEyKTtcbiAgICAgICAgICAgIGV4cGVjdChhcGFpclswXSkudG8uYmUuZXFsKHRydWUpO1xuICAgICAgICAgICAgZXhwZWN0KGFwYWlyWzFdKS50by5iZS5lcWwoMTIpO1xuICAgICAgICAgICAgZXhwZWN0KGFwYWlyLnR5cGUpLnRvLmJlLmVxbCgncGFpcicpO1xuICAgICAgICAgICAgZXhwZWN0KGFwYWlyLmlzUGFpcikudG8uYmUudHJ1ZTtcbiAgICAgICAgICAgIGV4cGVjdChhcGFpci50b1N0cmluZygpKS50by5iZS5lcWwoJ1t0cnVlLDEyXScpO1xuICAgICAgICB9KTtcbiAgICAgICAgaXQoJ2FyZSBpbW11dGFibGUsIGFuZCB0aHJvdyBpZiB5b3UgdHJ5IHRvIGNoYW5nZSB0aGVtJywgKCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgYXBhaXIgPSBUdXBsZS5QYWlyKHRydWUsIDEyKTtcbiAgICAgICAgICAgIGV4cGVjdCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgYXRyaXBsZVswXSA9IGZhbHNlO1xuICAgICAgICAgICAgfSkudG8udGhyb3c7XG4gICAgICAgICAgICBleHBlY3QoKCkgPT4ge1xuICAgICAgICAgICAgICAgIGF0cmlwbGVbMV0gPSAxMztcbiAgICAgICAgICAgIH0pLnRvLnRocm93O1xuICAgICAgICB9KTtcbiAgICAgICAgaXQoJ2FyZSB0cnVlIGl0ZXJhYmxlcywgYW5kIHRoZXJlZm9yZSBhbGxvdyBwb3NpdGlvbmFsIGRlc3RydWN0dXJpbmcnLCAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBbYSwgYl0gPSBUdXBsZS5QYWlyKHRydWUsIDEyKTtcbiAgICAgICAgICAgIGV4cGVjdChhKS50by5iZS5lcWwodHJ1ZSk7XG4gICAgICAgICAgICBleHBlY3QoYikudG8uYmUuZXFsKDEyKTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICBkZXNjcmliZSgnVHJpcGxlXFwncycsICgpID0+IHtcbiAgICAgICAgaXQoJ2luY2x1ZGUgMyB2YWx1ZXMgYW5kIGFsbG93IHRvIHJldHJpZXZlIHRoZW0nLCAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBhdHJpcGxlID0gVHVwbGUuVHJpcGxlKHRydWUsIDEyLCAnYScpO1xuICAgICAgICAgICAgZXhwZWN0KGF0cmlwbGVbMF0pLnRvLmJlLmVxbCh0cnVlKTtcbiAgICAgICAgICAgIGV4cGVjdChhdHJpcGxlWzFdKS50by5iZS5lcWwoMTIpO1xuICAgICAgICAgICAgZXhwZWN0KGF0cmlwbGVbMl0pLnRvLmJlLmVxbCgnYScpO1xuICAgICAgICAgICAgZXhwZWN0KGF0cmlwbGUudHlwZSkudG8uYmUuZXFsKCd0cmlwbGUnKTtcbiAgICAgICAgICAgIGV4cGVjdChhdHJpcGxlLmlzVHJpcGxlKS50by5iZS50cnVlO1xuICAgICAgICAgICAgZXhwZWN0KGF0cmlwbGUudG9TdHJpbmcoKSkudG8uYmUuZXFsKCdbdHJ1ZSwxMixhXScpO1xuICAgICAgICB9KTtcbiAgICAgICAgaXQoJ2FyZSBpbW11dGFibGUsIGFuZCB0aHJvdyBpZiB5b3UgdHJ5IHRvIGNoYW5nZSB0aGVtJywgKCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgYXRyaXBsZSA9IFR1cGxlLlRyaXBsZSh0cnVlLCAxMiwgJ2EnKTtcbiAgICAgICAgICAgIGV4cGVjdCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgYXRyaXBsZVswXSA9IGZhbHNlO1xuICAgICAgICAgICAgfSkudG8udGhyb3c7XG4gICAgICAgICAgICBleHBlY3QoKCkgPT4ge1xuICAgICAgICAgICAgICAgIGF0cmlwbGVbMV0gPSAxMztcbiAgICAgICAgICAgIH0pLnRvLnRocm93O1xuICAgICAgICAgICAgZXhwZWN0KCgpID0+IHtcbiAgICAgICAgICAgICAgICBhdHJpcGxlWzJdID0gJ2InO1xuICAgICAgICAgICAgfSkudG8udGhyb3c7XG4gICAgICAgIH0pO1xuICAgICAgICBpdCgnYXJlIHRydWUgaXRlcmFibGVzLCBhbmQgdGhlcmVmb3JlIGFsbG93IHBvc2l0aW9uYWwgZGVzdHJ1Y3R1cmluZycsICgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IFthLCBiLCBjXSA9IFR1cGxlLlRyaXBsZSh0cnVlLCAxMiwgJ2EnKTtcbiAgICAgICAgICAgIGV4cGVjdChhKS50by5iZS5lcWwodHJ1ZSk7XG4gICAgICAgICAgICBleHBlY3QoYikudG8uYmUuZXFsKDEyKTtcbiAgICAgICAgICAgIGV4cGVjdChjKS50by5iZS5lcWwoJ2EnKTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICBkZXNjcmliZSgnc3VjY2VzcyBhbmQgZmFpbHVyZScsICgpID0+IHtcbiAgICAgICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICAgIH0pO1xuICAgICAgICBpdCgnbWF5IHJlcHJlc2VudCBzdWNjZXNzZXMnLCAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBzdWNjID0gc3VjY2Vzcyh0cnVlLCAxMik7XG4gICAgICAgICAgICBleHBlY3Qoc3VjY1swXSkudG8uYmUudHJ1ZTtcbiAgICAgICAgICAgIGV4cGVjdChzdWNjWzFdKS50by5iZS5lcWwoMTIpO1xuICAgICAgICAgICAgZXhwZWN0KGlzU3VjY2VzcyhzdWNjKSkudG8uYmUudHJ1ZTtcbiAgICAgICAgICAgIGV4cGVjdChpc1BhaXIoc3VjYykpLnRvLmJlLnRydWU7XG4gICAgICAgIH0pO1xuICAgICAgICBpdCgnbWF5IHJlcHJlc2VudCBmYWlsdXJlcycsICgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGZhaWwgPSBmYWlsdXJlKCdhJywgMTIpO1xuICAgICAgICAgICAgZXhwZWN0KGZhaWxbMF0pLnRvLmJlLmVxbCgnYScpO1xuICAgICAgICAgICAgZXhwZWN0KGZhaWxbMV0pLnRvLmJlLmVxbCgxMik7XG4gICAgICAgICAgICBleHBlY3QoaXNTdWNjZXNzKGZhaWwpKS50by5iZS5mYWxzZTtcbiAgICAgICAgICAgIGV4cGVjdChpc0ZhaWx1cmUoZmFpbCkpLnRvLmJlLnRydWU7XG4gICAgICAgICAgICBleHBlY3QoaXNQYWlyKGZhaWwpKS50by5iZS50cnVlO1xuICAgICAgICB9KTtcbiAgICB9KTtcbn0pO1xuIl19