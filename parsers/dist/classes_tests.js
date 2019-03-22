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
    });
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2pzLXNwZWMvY2xhc3Nlc190ZXN0cy5qcyJdLCJuYW1lcyI6WyJkZXNjcmliZSIsImpzdHJpbmciLCJKVmFsdWUiLCJKU3RyaW5nIiwiaXQiLCJ2YWx1ZSIsInRvIiwiYmUiLCJlcWwiLCJ0b1N0cmluZyIsInRocm93IiwiaXNKVmFsdWUiLCJ0cnVlIiwiaXNKU3RyaW5nIiwiam51bWJlciIsIkpOdW1iZXIiLCJpc0pOdW1iZXIiLCJOYU4iLCJqYm9vbCIsIkpCb29sIiwiaXNKQm9vbCIsImpudWxsIiwiSk51bGwiLCJudWxsIiwiaXNKTnVsbCIsInVuZGVmaW5lZCIsImphcnJheSIsIkpBcnJheSIsImphclZhbHVlIiwiaXNKQXJyYXkiLCJqb2JqZWN0IiwiSk9iamVjdCIsIlR1cGxlIiwiUGFpciIsImlzSk9iamVjdCIsInN0cmluZyIsIlRyaXBsZSIsInJvd3MiLCJwb3MwMCIsImlzUG9zaXRpb24iLCJjaGFyIiwiaXNKdXN0IiwicG9zMTEiLCJwb3MwMSIsImluY3JQb3MiLCJwb3MyMCIsInBvczIyIiwiZGVjclBvcyIsInBvczEzIiwicG9zMDIiLCJwb3MxMDEwIiwiaXNOb3RoaW5nIiwicG9zMjMiLCJQb3NpdGlvbiIsImZyb21UZXh0IiwicmVzdCIsImFTb21lIiwidmFsIiwiYU5vbmUiLCJhcGFpciIsInR5cGUiLCJhIiwiYiIsImlzUGFpciIsImF0cmlwbGUiLCJpc1RyaXBsZSIsImMiLCJiZWZvcmVFYWNoIiwic3VjYyIsImZhaWwiLCJmYWxzZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFtQkFBLGFBQVMsc0JBQVQsRUFBaUMsWUFBTTs7QUFFbkNBLGlCQUFTLGtDQUFULEVBQTZDLFlBQU07QUFDL0NBLHFCQUFTLDhDQUFULEVBQXlELFlBQU07QUFDM0Qsb0JBQU1DLFVBQVVDLGdCQUFPQyxPQUFQLENBQWUsS0FBZixDQUFoQjtBQUNBQyxtQkFBRyxzQkFBSCxFQUEyQixZQUFN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R0FBdEIsQ0FBMEIsRUFBMUI7QUFDQSxrQ0FBTyxxQkFBVTZELElBQVYsQ0FBUCxFQUF3Qi9ELEVBQXhCLENBQTJCQyxFQUEzQixDQUE4QitELEtBQTlCO0FBQ0Esa0NBQU8scUJBQVVELElBQVYsQ0FBUCxFQUF3Qi9ELEVBQXhCLENBQTJCQyxFQUEzQixDQUE4QkssSUFBOUI7QUFDQSxrQ0FBTyxrQkFBT3lELElBQVAsQ0FBUCxFQUFxQi9ELEVBQXJCLENBQXdCQyxFQUF4QixDQUEyQkssSUFBM0I7QUFDSCxhQVBEO0FBUUgsU0FsQkQ7QUFtQkgsS0FoUkQiLCJmaWxlIjoiY2xhc3Nlc190ZXN0cy5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7ZXhwZWN0fSBmcm9tICdjaGFpJztcbmltcG9ydCB7XG4gICAgaXNQYWlyLFxuICAgIGlzU3VjY2VzcyxcbiAgICBpc0ZhaWx1cmUsXG4gICAgaXNTb21lLFxuICAgIGlzTm9uZSxcbn0gZnJvbSAndXRpbCc7XG5pbXBvcnQge1xuICAgIHBhaXIsXG4gICAgc3VjY2VzcyxcbiAgICBmYWlsdXJlLFxuICAgIHNvbWUsXG4gICAgbm9uZSxcbiAgICBQb3NpdGlvbixcbiAgICBUdXBsZSxcbiAgICBKVmFsdWUsXG59IGZyb20gJ2NsYXNzZXMnO1xuXG5kZXNjcmliZSgnYW1vbmcgaGVscGVyIGNsYXNzZXMnLCAoKSA9PiB7XG5cbiAgICBkZXNjcmliZSgnSlZhbHVlXFwncyBhcmUgcGFyc2VkIEpTT04gdmFsdWVzJywgKCkgPT4ge1xuICAgICAgICBkZXNjcmliZSgnd2l0aCBKU3RyaW5nXFwncyBhcyBwYXJzZWQgSlNPTiBzdHJpbmcgdmFsdWVzJywgKCkgPT4ge1xuICAgICAgICAgICAgY29uc3QganN0cmluZyA9IEpWYWx1ZS5KU3RyaW5nKCdhYmMnKTtcbiAgICAgICAgICAgIGl0KCd0aGF0IGFyZSByZXRyaWV2YWJsZScsICgpID0+IHtcbiAgICAgICAgICAgICAgICBleHBlY3QoanN0cmluZy52YWx1ZSkudG8uYmUuZXFsKCdhYmMnKTtcbiAgICAgICAgICAgICAgICBleHBlY3QoanN0cmluZy50b1N0cmluZygpKS50by5iZS5lcWwoJ0pTdHJpbmcoYWJjKScpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpdCgndGhhdCBhcmUgaW1tdXRhYmxlJywgKCkgPT4ge1xuICAgICAgICAgICAgICAgIGV4cGVjdCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGpzdHJpbmcudmFsdWUgPSAnZGVmJztcbiAgICAgICAgICAgICAgICB9KS50by50aHJvdztcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaXQoJ3RoYXQgZ290dGEgYmUgc3RyaW5ncycsICgpID0+IHtcbiAgICAgICAgICAgICAgICBleHBlY3QoKCkgPT4gSlZhbHVlLkpTdHJpbmcoMTIzKSkudG8udGhyb3c7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGl0KCd0aGF0IGdvdHRhIGJ5IHR5cGVzIHdpdGggYSBzdXBlcnR5cGUnLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QganN0cmluZyA9IEpWYWx1ZS5KU3RyaW5nKCcxMjMnKTtcbiAgICAgICAgICAgICAgICBleHBlY3QoanN0cmluZy5pc0pWYWx1ZSkudG8uYmUudHJ1ZTtcbiAgICAgICAgICAgICAgICBleHBlY3QoanN0cmluZy5pc0pTdHJpbmcpLnRvLmJlLnRydWU7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICAgIGl0KCd3aXRoIEpOdW1iZXJcXCdzIGFzIHBhcnNlZCBKU09OIGZsb2F0IHZhbHVlcycsICgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGpudW1iZXIgPSBKVmFsdWUuSk51bWJlcigxMjMuNDVlLTIzKTtcbiAgICAgICAgICAgIGV4cGVjdChqbnVtYmVyLnZhbHVlKS50by5iZS5lcWwoMTIzLjQ1ZS0yMyk7XG4gICAgICAgICAgICBleHBlY3Qoam51bWJlci50b1N0cmluZygpKS50by5iZS5lcWwoJ0pOdW1iZXIoMS4yMzQ1ZS0yMSknKTtcbiAgICAgICAgICAgIGV4cGVjdChqbnVtYmVyLmlzSlZhbHVlKS50by5iZS50cnVlO1xuICAgICAgICAgICAgZXhwZWN0KGpudW1iZXIuaXNKTnVtYmVyKS50by5iZS50cnVlO1xuICAgICAgICAgICAgZXhwZWN0KCgpID0+IHtcbiAgICAgICAgICAgICAgICBqbnVtYmVyLnZhbHVlID0gMTIzO1xuICAgICAgICAgICAgfSkudG8udGhyb3c7XG4gICAgICAgICAgICBleHBlY3QoKCkgPT4gSlZhbHVlLkpOdW1iZXIoJ3gnKSkudG8udGhyb3c7XG4gICAgICAgICAgICBleHBlY3QoKCkgPT4gSlZhbHVlLkpOdW1iZXIoTmFOKSkudG8udGhyb3c7XG4gICAgICAgIH0pO1xuICAgICAgICBpdCgnd2l0aCBKQm9vbFxcJ3MgYXMgcGFyc2VkIEpTT04gYm9vbGVhbiB2YWx1ZXMnLCAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBqYm9vbCA9IEpWYWx1ZS5KQm9vbCh0cnVlKTtcbiAgICAgICAgICAgIGV4cGVjdChqYm9vbC52YWx1ZSkudG8uYmUudHJ1ZTtcbiAgICAgICAgICAgIGV4cGVjdChqYm9vbC50b1N0cmluZygpKS50by5iZS5lcWwoJ0pCb29sKHRydWUpJyk7XG4gICAgICAgICAgICBleHBlY3QoamJvb2wuaXNKVmFsdWUpLnRvLmJlLnRydWU7XG4gICAgICAgICAgICBleHBlY3QoamJvb2wuaXNKQm9vbCkudG8uYmUudHJ1ZTtcbiAgICAgICAgICAgIGV4cGVjdCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgamJvb2wudmFsdWUgPSBmYWxzZTtcbiAgICAgICAgICAgIH0pLnRvLnRocm93O1xuICAgICAgICAgICAgZXhwZWN0KCgpID0+IEpWYWx1ZS5KQm9vbCgneCcpKS50by50aHJvdztcbiAgICAgICAgICAgIGV4cGVjdCgoKSA9PiBKVmFsdWUuSkJvb2woMTIzKSkudG8udGhyb3c7XG4gICAgICAgICAgICBleHBlY3QoKCkgPT4gSlZhbHVlLkpCb29sKE5hTikpLnRvLnRocm93O1xuICAgICAgICB9KTtcbiAgICAgICAgaXQoJ3dpdGggSk51bGxcXCdzIGFzIHBhcnNlZCBKU09OIG51bGwgdmFsdWVzJywgKCkgPT4ge1xuICAgICAgICAgICAgY29uc3Qgam51bGwgPSBKVmFsdWUuSk51bGwobnVsbCk7XG4gICAgICAgICAgICBleHBlY3Qoam51bGwudmFsdWUpLnRvLmJlLm51bGw7XG4gICAgICAgICAgICBleHBlY3Qoam51bGwudG9TdHJpbmcoKSkudG8uYmUuZXFsKCdKTnVsbChudWxsKScpO1xuICAgICAgICAgICAgZXhwZWN0KGpudWxsLmlzSlZhbHVlKS50by5iZS50cnVlO1xuICAgICAgICAgICAgZXhwZWN0KGpudWxsLmlzSk51bGwpLnRvLmJlLnRydWU7XG4gICAgICAgICAgICBleHBlY3QoKCkgPT4ge1xuICAgICAgICAgICAgICAgIGpudWxsLnZhbHVlID0gMTIzO1xuICAgICAgICAgICAgfSkudG8udGhyb3c7XG4gICAgICAgICAgICBleHBlY3QoKCkgPT4gSlZhbHVlLkpOdWxsKCcnKSkudG8udGhyb3c7XG4gICAgICAgICAgICBleHBlY3QoKCkgPT4gSlZhbHVlLkpOdWxsKHVuZGVmaW5lZCkpLnRvLnRocm93O1xuICAgICAgICAgICAgZXhwZWN0KCgpID0+IEpWYWx1ZS5KTnVsbChOYU4pKS50by50aHJvdztcbiAgICAgICAgfSk7XG4gICAgICAgIGl0KCd3aXRoIEpBcnJheVxcJ3MgYXMgcGFyc2VkIEpTT04gYXJyYXlzJywgKCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgamFycmF5ID0gSlZhbHVlLkpBcnJheShKVmFsdWUuSlN0cmluZygnYScpLCBKVmFsdWUuSkJvb2woZmFsc2UpLCBKVmFsdWUuSk51bGwobnVsbCkpO1xuICAgICAgICAgICAgY29uc3QgamFyVmFsdWUgPSBqYXJyYXkudmFsdWU7XG4gICAgICAgICAgICBleHBlY3QoamFyVmFsdWVbMF0udmFsdWUpLnRvLmJlLmVxbCgnYScpO1xuICAgICAgICAgICAgZXhwZWN0KGphclZhbHVlWzFdLnZhbHVlKS50by5iZS5lcWwoZmFsc2UpO1xuICAgICAgICAgICAgZXhwZWN0KGphclZhbHVlWzJdLnZhbHVlKS50by5iZS5lcWwobnVsbCk7XG4gICAgICAgICAgICBleHBlY3QoamFycmF5LnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgnSkFycmF5KFtKU3RyaW5nKGEpLEpCb29sKGZhbHNlKSxKTnVsbChudWxsKSxdKScpO1xuICAgICAgICAgICAgZXhwZWN0KGphcnJheS5pc0pWYWx1ZSkudG8uYmUudHJ1ZTtcbiAgICAgICAgICAgIGV4cGVjdChqYXJyYXkuaXNKQXJyYXkpLnRvLmJlLnRydWU7XG4gICAgICAgICAgICBleHBlY3QoKCkgPT4ge1xuICAgICAgICAgICAgICAgIGphcnJheS52YWx1ZSA9IDEyMztcbiAgICAgICAgICAgIH0pLnRvLnRocm93O1xuICAgICAgICAgICAgZXhwZWN0KCgpID0+IEpWYWx1ZS5KQXJyYXkoJycpKS50by50aHJvdztcbiAgICAgICAgICAgIGV4cGVjdCgoKSA9PiBKVmFsdWUuSkFycmF5KHVuZGVmaW5lZCkpLnRvLnRocm93O1xuICAgICAgICAgICAgZXhwZWN0KCgpID0+IEpWYWx1ZS5KQXJyYXkoTmFOKSkudG8udGhyb3c7XG4gICAgICAgIH0pO1xuICAgICAgICBpdCgnd2l0aCBKT2JqZWN0c1xcJ3MgYXMgcGFyc2VkIEpTT04gb2JqZWN0cycsICgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGpvYmplY3QgPSBKVmFsdWUuSk9iamVjdChcbiAgICAgICAgICAgICAgICBUdXBsZS5QYWlyKCdzdHJpbmcnLCBKVmFsdWUuSlN0cmluZygnYScpKSxcbiAgICAgICAgICAgICAgICBUdXBsZS5QYWlyKCdib29sZWFuJywgSlZhbHVlLkpCb29sKGZhbHNlKSksXG4gICAgICAgICAgICAgICAgVHVwbGUuUGFpcignbnVsbCcsIEpWYWx1ZS5KTnVsbChudWxsKSlcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICBleHBlY3Qoam9iamVjdFsnc3RyaW5nJ10udmFsdWUpLnRvLmJlLmVxbCgnYScpO1xuICAgICAgICAgICAgZXhwZWN0KGpvYmplY3RbJ2Jvb2xlYW4nXS52YWx1ZSkudG8uYmUuZXFsKGZhbHNlKTtcbiAgICAgICAgICAgIGV4cGVjdChqb2JqZWN0WydudWxsJ10udmFsdWUpLnRvLmJlLmVxbChudWxsKTtcbiAgICAgICAgICAgIC8vZXhwZWN0KGpvYmplY3QudG9TdHJpbmcoKSkudG8uYmUuZXFsKCdKQXJyYXkoW0pTdHJpbmcoYSksSkJvb2woZmFsc2UpLEpOdWxsKG51bGwpLF0pJyk7XG4gICAgICAgICAgICBleHBlY3Qoam9iamVjdC5pc0pWYWx1ZSkudG8uYmUudHJ1ZTtcbiAgICAgICAgICAgIGV4cGVjdChqb2JqZWN0LmlzSk9iamVjdCkudG8uYmUudHJ1ZTtcbiAgICAgICAgICAgIGV4cGVjdCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgam9iamVjdC5zdHJpbmcgPSAnYWJjJztcbiAgICAgICAgICAgIH0pLnRvLnRocm93O1xuICAgICAgICAgICAgZXhwZWN0KCgpID0+IEpWYWx1ZS5KT2JqZWN0KEpWYWx1ZS5KT2JqZWN0KFxuICAgICAgICAgICAgICAgIFR1cGxlLlBhaXIoJ3N0cmluZycsIEpWYWx1ZS5KU3RyaW5nKCdhJykpLFxuICAgICAgICAgICAgICAgIFR1cGxlLlBhaXIoJ2Jvb2xlYW4nLCBmYWxzZSksIC8vIHZhbHVlIG11c3QgYmUgYSBKVmFsdWVcbiAgICAgICAgICAgICAgICBUdXBsZS5QYWlyKCdudWxsJywgSlZhbHVlLkpOdWxsKG51bGwpKVxuICAgICAgICAgICAgKSkpLnRvLnRocm93O1xuICAgICAgICAgICAgZXhwZWN0KCgpID0+IEpWYWx1ZS5KT2JqZWN0KEpWYWx1ZS5KT2JqZWN0KFxuICAgICAgICAgICAgICAgIFR1cGxlLlBhaXIoJ3N0cmluZycsIEpWYWx1ZS5KU3RyaW5nKCdhJykpLFxuICAgICAgICAgICAgICAgIFR1cGxlLlBhaXIoMTIzLCBKVmFsdWUuSk51bGwobnVsbCkpIC8vIGtleSBtdXN0IGJlIGEgc3RyaW5nXG4gICAgICAgICAgICApKSkudG8udGhyb3c7XG4gICAgICAgICAgICBleHBlY3QoKCkgPT4gSlZhbHVlLkpOdWxsKFR1cGxlLlRyaXBsZSgxLDIsMykpKS50by50aHJvdztcbiAgICAgICAgfSk7XG5cbiAgICB9KTtcblxuICAgIGRlc2NyaWJlKCdQb3NpdGlvblxcJ3MnLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHJvd3MgPSBbXG4gICAgICAgICAgICBbMSwgMiwgM10sXG4gICAgICAgICAgICBbJ2EnLCAnYicsICdjJywgJ2QnXSxcbiAgICAgICAgICAgIFsnQScsICdCJywgJ0MnXSxcbiAgICAgICAgXTtcbiAgICAgICAgaXQoJ2luY2x1ZGUgdGFibGVzIG9mIGNoYXJzIGFuZCBhbGxvdyB0byByZXRyaWV2ZSBjaGFyIG9wdGlvbnMnLCAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBwb3MwMCA9IFBvc2l0aW9uKHJvd3MsIDAsIDApO1xuICAgICAgICAgICAgZXhwZWN0KHBvczAwLmlzUG9zaXRpb24pLnRvLmJlLnRydWU7XG4gICAgICAgICAgICBleHBlY3QocG9zMDAuY2hhcigpLmlzSnVzdCkudG8uYmUudHJ1ZTtcbiAgICAgICAgICAgIGV4cGVjdChwb3MwMC5jaGFyKCkudmFsdWUpLnRvLmJlLmVxbCgxKTtcbiAgICAgICAgICAgIGNvbnN0IHBvczExID0gUG9zaXRpb24ocm93cywgMSwgMSk7XG4gICAgICAgICAgICBleHBlY3QocG9zMTEuY2hhcigpLmlzSnVzdCkudG8uYmUudHJ1ZTtcbiAgICAgICAgICAgIGV4cGVjdChwb3MxMS5jaGFyKCkudmFsdWUpLnRvLmJlLmVxbCgnYicpO1xuICAgICAgICB9KTtcbiAgICAgICAgaXQoJ2FsbG93IHRvIGluY3JlbWVudCB0aGUgcG9zaXRpb24gYW5kIHJldHJpZXZlIGZ1cnRoZXIgY2hhcnMnLCAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBwb3MwMSA9IFBvc2l0aW9uKHJvd3MsIDAsIDApLmluY3JQb3MoKTtcbiAgICAgICAgICAgIGV4cGVjdChwb3MwMS5jaGFyKCkudmFsdWUpLnRvLmJlLmVxbCgyKTtcbiAgICAgICAgICAgIGNvbnN0IHBvczIwID0gUG9zaXRpb24ocm93cywgMSwgMykuaW5jclBvcygpO1xuICAgICAgICAgICAgZXhwZWN0KHBvczIwLmNoYXIoKS52YWx1ZSkudG8uYmUuZXFsKCdBJyk7XG4gICAgICAgICAgICBjb25zdCBwb3MyMiA9IFBvc2l0aW9uKHJvd3MsIDEsIDMpLmluY3JQb3MoMyk7XG4gICAgICAgICAgICBleHBlY3QocG9zMjIuY2hhcigpLnZhbHVlKS50by5iZS5lcWwoJ0MnKTtcbiAgICAgICAgfSk7XG4gICAgICAgIGl0KCdhbGxvdyB0byBkZWNyZW1lbnQgdGhlIHBvc2l0aW9uIGFuZCByZXRyaWV2ZSBmdXJ0aGVyIGNoYXJzJywgKCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgcG9zMDEgPSBQb3NpdGlvbihyb3dzLCAwLCAyKS5kZWNyUG9zKCk7XG4gICAgICAgICAgICBleHBlY3QocG9zMDEuY2hhcigpLnZhbHVlKS50by5iZS5lcWwoMik7XG4gICAgICAgICAgICBjb25zdCBwb3MxMyA9IFBvc2l0aW9uKHJvd3MsIDIsIDApLmRlY3JQb3MoKTtcbiAgICAgICAgICAgIGV4cGVjdChwb3MxMy5jaGFyKCkudmFsdWUpLnRvLmJlLmVxbCgnZCcpO1xuICAgICAgICAgICAgY29uc3QgcG9zMDIgPSBQb3NpdGlvbihyb3dzLCAyLCAwKS5kZWNyUG9zKDUpO1xuICAgICAgICAgICAgZXhwZWN0KHBvczAyLmNoYXIoKS52YWx1ZSkudG8uYmUuZXFsKDMpO1xuICAgICAgICB9KTtcbiAgICAgICAgaXQoJ3JldHVybiBOb3RoaW5nIHdoZW4gcG9zaXRpb24gaXMgYmV5b25kIHRoZSBjb250YWluZWQgcm93cyBjb250ZW50JywgKCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgcG9zMTAxMCA9IFBvc2l0aW9uKHJvd3MsIDEwLCAxMCk7XG4gICAgICAgICAgICBleHBlY3QocG9zMTAxMC5jaGFyKCkuaXNOb3RoaW5nKS50by5iZS50cnVlO1xuICAgICAgICAgICAgY29uc3QgcG9zMjMgPSBQb3NpdGlvbihyb3dzLCAyLCAyKS5pbmNyUG9zKCk7XG4gICAgICAgICAgICBleHBlY3QocG9zMjMuY2hhcigpLmlzTm90aGluZykudG8uYmUudHJ1ZTtcbiAgICAgICAgfSk7XG4gICAgICAgIGl0KCdjYW4gYmUgaW5pdGlhbGl6ZWQgZnJvbSB0ZXh0IHN0cmluZ3MnLCAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBwb3MwMCA9IFBvc2l0aW9uLmZyb21UZXh0KCdMb3JlbSBpcHN1bSBkb2xvciBzaXQgYW1ldCcpO1xuICAgICAgICAgICAgZXhwZWN0KHBvczAwLmNoYXIoKS52YWx1ZSkudG8uYmUuZXFsKCdMJyk7XG4gICAgICAgICAgICBleHBlY3QocG9zMDAuaW5jclBvcygpLmluY3JQb3MoKS5pbmNyUG9zKCkuaW5jclBvcygpXG4gICAgICAgICAgICAgICAgLmNoYXIoKS52YWx1ZSkudG8uYmUuZXFsKCdtJyk7XG4gICAgICAgIH0pO1xuICAgICAgICBpdCgnY2FuIGJlIGluaXRpYWxpemVkIGFsc28gZnJvbSBtdWx0aWxpbmUgdGV4dCBzdHJpbmdzLCBzdHJpcHBpbmcgbmV3bGluZXMgYXdheScsICgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHBvczAwID0gUG9zaXRpb24uZnJvbVRleHQoJ0xvcmVtIFxcbmlwc3VtJyk7XG4gICAgICAgICAgICBleHBlY3QocG9zMDAuY2hhcigpLnZhbHVlKS50by5iZS5lcWwoJ0wnKTtcbiAgICAgICAgICAgIGV4cGVjdChwb3MwMC5pbmNyUG9zKCkuaW5jclBvcygpLmluY3JQb3MoKS5pbmNyUG9zKCkuaW5jclBvcygpLmluY3JQb3MoKVxuICAgICAgICAgICAgICAgIC5jaGFyKCkudmFsdWUpLnRvLmJlLmVxbCgnaScpO1xuICAgICAgICB9KTtcbiAgICAgICAgaXQoJ3JldHVybiBzdHJpbmdzIGNvbnRhaW5pbmcgYWxsIGNoYXJhY3RlcnMgc3RhcnRpbmcgZnJvbSBhIGdpdmVuIHBvc2l0aW9uLCBmb3IgdGhlIHNha2Ugb2YgdGVzdGluZycsICgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHBvczAxID0gUG9zaXRpb24uZnJvbVRleHQoJ0xvcmVtJykuaW5jclBvcygpO1xuICAgICAgICAgICAgZXhwZWN0KHBvczAxLnJlc3QoKSkudG8uYmUuZXFsKCdvcmVtJyk7XG4gICAgICAgIH0pO1xuICAgICAgICBpdCgncmV0dXJucyByZXN0ID09PSBcXCdcXCcgd2hlbiB3ZSBnZXQgdG8gdGhlIGVuZCcsICgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHBvczAxID0gUG9zaXRpb24uZnJvbVRleHQoJ0wnKS5pbmNyUG9zKCk7XG4gICAgICAgICAgICBleHBlY3QocG9zMDEucmVzdCgpKS50by5iZS5lcWwoJycpO1xuICAgICAgICB9KTtcbiAgICB9KTtcblxuICAgIGRlc2NyaWJlKCdzb21lcycsICgpID0+IHtcbiAgICAgICAgaXQoJ2luY2x1ZGUgYSB2YWx1ZSBhbmQgYWxsb3cgdG8gcmV0cmlldmUgaXQnLCAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBhU29tZSA9IHNvbWUoMTIpO1xuICAgICAgICAgICAgZXhwZWN0KGFTb21lLnZhbCgpKS50by5iZS5lcWwoMTIpO1xuICAgICAgICAgICAgZXhwZWN0KGlzU29tZShhU29tZSkpLnRvLmJlLnRydWU7XG4gICAgICAgICAgICBleHBlY3QoYVNvbWUudG9TdHJpbmcoKSkudG8uYmUuZXFsKCdzb21lKDEyKScpO1xuICAgICAgICB9KTtcbiAgICB9KTtcblxuICAgIGRlc2NyaWJlKCdub25lcycsICgpID0+IHtcbiAgICAgICAgaXQoJ2FyZSBqdXN0IGEgc2lnbnBvc3QnLCAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBhTm9uZSA9IG5vbmUoKTtcbiAgICAgICAgICAgIGV4cGVjdChhTm9uZS52YWwoKSkudG8uYmUubnVsbDtcbiAgICAgICAgICAgIGV4cGVjdChpc05vbmUoYU5vbmUpKS50by5iZS50cnVlO1xuICAgICAgICAgICAgZXhwZWN0KGFOb25lLnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgnbm9uZSgpJyk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgZGVzY3JpYmUoJ3BhaXJzJywgKCkgPT4ge1xuICAgICAgICBpdCgnaW5jbHVkZSAyIHZhbHVlcyBhbmQgYWxsb3cgdG8gcmV0cmlldmUgdGhlbScsICgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGFwYWlyID0gcGFpcih0cnVlLCAxMik7XG4gICAgICAgICAgICBleHBlY3QoYXBhaXJbMF0pLnRvLmJlLmVxbCh0cnVlKTtcbiAgICAgICAgICAgIGV4cGVjdChhcGFpclsxXSkudG8uYmUuZXFsKDEyKTtcbiAgICAgICAgICAgIGV4cGVjdChhcGFpci50eXBlKS50by5iZS5lcWwoJ3BhaXInKTtcbiAgICAgICAgICAgIGV4cGVjdChpc1BhaXIoYXBhaXIpKS50by5iZS50cnVlO1xuICAgICAgICB9KTtcbiAgICAgICAgaXQoJ2FyZSBhY3R1YWxseSBhcnJheXMsIGFuZCB0aGVyZWZvcmUgYWxsb3cgcG9zaXRpb25hbCBkZXN0cnVjdHVyaW5nJywgKCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgW2EsIGJdID0gcGFpcih0cnVlLCAxMik7XG4gICAgICAgICAgICBleHBlY3QoYSkudG8uYmUuZXFsKHRydWUpO1xuICAgICAgICAgICAgZXhwZWN0KGIpLnRvLmJlLmVxbCgxMik7XG4gICAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgZGVzY3JpYmUoJ1BhaXJcXCdzJywgKCkgPT4ge1xuICAgICAgICBpdCgnaW5jbHVkZSAyIHZhbHVlcyBhbmQgYWxsb3cgdG8gcmV0cmlldmUgdGhlbScsICgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGFwYWlyID0gVHVwbGUuUGFpcih0cnVlLCAxMik7XG4gICAgICAgICAgICBleHBlY3QoYXBhaXJbMF0pLnRvLmJlLmVxbCh0cnVlKTtcbiAgICAgICAgICAgIGV4cGVjdChhcGFpclsxXSkudG8uYmUuZXFsKDEyKTtcbiAgICAgICAgICAgIGV4cGVjdChhcGFpci50eXBlKS50by5iZS5lcWwoJ3BhaXInKTtcbiAgICAgICAgICAgIGV4cGVjdChhcGFpci5pc1BhaXIpLnRvLmJlLnRydWU7XG4gICAgICAgICAgICBleHBlY3QoYXBhaXIudG9TdHJpbmcoKSkudG8uYmUuZXFsKCdbdHJ1ZSwxMl0nKTtcbiAgICAgICAgfSk7XG4gICAgICAgIGl0KCdhcmUgaW1tdXRhYmxlLCBhbmQgdGhyb3cgaWYgeW91IHRyeSB0byBjaGFuZ2UgdGhlbScsICgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGFwYWlyID0gVHVwbGUuUGFpcih0cnVlLCAxMik7XG4gICAgICAgICAgICBleHBlY3QoKCkgPT4ge1xuICAgICAgICAgICAgICAgIGF0cmlwbGVbMF0gPSBmYWxzZTtcbiAgICAgICAgICAgIH0pLnRvLnRocm93O1xuICAgICAgICAgICAgZXhwZWN0KCgpID0+IHtcbiAgICAgICAgICAgICAgICBhdHJpcGxlWzFdID0gMTM7XG4gICAgICAgICAgICB9KS50by50aHJvdztcbiAgICAgICAgfSk7XG4gICAgICAgIGl0KCdhcmUgdHJ1ZSBpdGVyYWJsZXMsIGFuZCB0aGVyZWZvcmUgYWxsb3cgcG9zaXRpb25hbCBkZXN0cnVjdHVyaW5nJywgKCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgW2EsIGJdID0gVHVwbGUuUGFpcih0cnVlLCAxMik7XG4gICAgICAgICAgICBleHBlY3QoYSkudG8uYmUuZXFsKHRydWUpO1xuICAgICAgICAgICAgZXhwZWN0KGIpLnRvLmJlLmVxbCgxMik7XG4gICAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgZGVzY3JpYmUoJ1RyaXBsZVxcJ3MnLCAoKSA9PiB7XG4gICAgICAgIGl0KCdpbmNsdWRlIDMgdmFsdWVzIGFuZCBhbGxvdyB0byByZXRyaWV2ZSB0aGVtJywgKCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgYXRyaXBsZSA9IFR1cGxlLlRyaXBsZSh0cnVlLCAxMiwgJ2EnKTtcbiAgICAgICAgICAgIGV4cGVjdChhdHJpcGxlWzBdKS50by5iZS5lcWwodHJ1ZSk7XG4gICAgICAgICAgICBleHBlY3QoYXRyaXBsZVsxXSkudG8uYmUuZXFsKDEyKTtcbiAgICAgICAgICAgIGV4cGVjdChhdHJpcGxlWzJdKS50by5iZS5lcWwoJ2EnKTtcbiAgICAgICAgICAgIGV4cGVjdChhdHJpcGxlLnR5cGUpLnRvLmJlLmVxbCgndHJpcGxlJyk7XG4gICAgICAgICAgICBleHBlY3QoYXRyaXBsZS5pc1RyaXBsZSkudG8uYmUudHJ1ZTtcbiAgICAgICAgICAgIGV4cGVjdChhdHJpcGxlLnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgnW3RydWUsMTIsYV0nKTtcbiAgICAgICAgfSk7XG4gICAgICAgIGl0KCdhcmUgaW1tdXRhYmxlLCBhbmQgdGhyb3cgaWYgeW91IHRyeSB0byBjaGFuZ2UgdGhlbScsICgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGF0cmlwbGUgPSBUdXBsZS5UcmlwbGUodHJ1ZSwgMTIsICdhJyk7XG4gICAgICAgICAgICBleHBlY3QoKCkgPT4ge1xuICAgICAgICAgICAgICAgIGF0cmlwbGVbMF0gPSBmYWxzZTtcbiAgICAgICAgICAgIH0pLnRvLnRocm93O1xuICAgICAgICAgICAgZXhwZWN0KCgpID0+IHtcbiAgICAgICAgICAgICAgICBhdHJpcGxlWzFdID0gMTM7XG4gICAgICAgICAgICB9KS50by50aHJvdztcbiAgICAgICAgICAgIGV4cGVjdCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgYXRyaXBsZVsyXSA9ICdiJztcbiAgICAgICAgICAgIH0pLnRvLnRocm93O1xuICAgICAgICB9KTtcbiAgICAgICAgaXQoJ2FyZSB0cnVlIGl0ZXJhYmxlcywgYW5kIHRoZXJlZm9yZSBhbGxvdyBwb3NpdGlvbmFsIGRlc3RydWN0dXJpbmcnLCAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBbYSwgYiwgY10gPSBUdXBsZS5UcmlwbGUodHJ1ZSwgMTIsICdhJyk7XG4gICAgICAgICAgICBleHBlY3QoYSkudG8uYmUuZXFsKHRydWUpO1xuICAgICAgICAgICAgZXhwZWN0KGIpLnRvLmJlLmVxbCgxMik7XG4gICAgICAgICAgICBleHBlY3QoYykudG8uYmUuZXFsKCdhJyk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgZGVzY3JpYmUoJ3N1Y2Nlc3MgYW5kIGZhaWx1cmUnLCAoKSA9PiB7XG4gICAgICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgICB9KTtcbiAgICAgICAgaXQoJ21heSByZXByZXNlbnQgc3VjY2Vzc2VzJywgKCkgPT4ge1xuICAgICAgICAgICAgY29uc3Qgc3VjYyA9IHN1Y2Nlc3ModHJ1ZSwgMTIpO1xuICAgICAgICAgICAgZXhwZWN0KHN1Y2NbMF0pLnRvLmJlLnRydWU7XG4gICAgICAgICAgICBleHBlY3Qoc3VjY1sxXSkudG8uYmUuZXFsKDEyKTtcbiAgICAgICAgICAgIGV4cGVjdChpc1N1Y2Nlc3Moc3VjYykpLnRvLmJlLnRydWU7XG4gICAgICAgICAgICBleHBlY3QoaXNQYWlyKHN1Y2MpKS50by5iZS50cnVlO1xuICAgICAgICB9KTtcbiAgICAgICAgaXQoJ21heSByZXByZXNlbnQgZmFpbHVyZXMnLCAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBmYWlsID0gZmFpbHVyZSgnYScsIDEyKTtcbiAgICAgICAgICAgIGV4cGVjdChmYWlsWzBdKS50by5iZS5lcWwoJ2EnKTtcbiAgICAgICAgICAgIGV4cGVjdChmYWlsWzFdKS50by5iZS5lcWwoMTIpO1xuICAgICAgICAgICAgZXhwZWN0KGlzU3VjY2VzcyhmYWlsKSkudG8uYmUuZmFsc2U7XG4gICAgICAgICAgICBleHBlY3QoaXNGYWlsdXJlKGZhaWwpKS50by5iZS50cnVlO1xuICAgICAgICAgICAgZXhwZWN0KGlzUGFpcihmYWlsKSkudG8uYmUudHJ1ZTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG59KTtcbiJdfQ==