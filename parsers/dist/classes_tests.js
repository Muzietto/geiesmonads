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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2pzLXNwZWMvY2xhc3Nlc190ZXN0cy5qcyJdLCJuYW1lcyI6WyJkZXNjcmliZSIsImpzdHJpbmciLCJKU3RyaW5nIiwiaXQiLCJ2YWx1ZSIsInRvIiwiYmUiLCJlcWwiLCJ0b1N0cmluZyIsInRocm93IiwiaXNKVmFsdWUiLCJ0cnVlIiwiaXNKU3RyaW5nIiwiam51bWJlciIsIkpOdW1iZXIiLCJpc0pOdW1iZXIiLCJOYU4iLCJqYm9vbCIsIkpCb29sIiwiaXNKQm9vbCIsImpudWxsIiwiSk51bGwiLCJudWxsIiwiaXNKTnVsbCIsInVuZGVmaW5lZCIsInJvd3MiLCJwb3MwMCIsImlzUG9zaXRpb24iLCJjaGFyIiwiaXNKdXN0IiwicG9zMTEiLCJwb3MwMSIsImluY3JQb3MiLCJwb3MyMCIsInBvczEwMTAiLCJpc05vdGhpbmciLCJwb3MyMyIsImZyb21UZXh0IiwicmVzdCIsImFTb21lIiwidmFsIiwiYU5vbmUiLCJhcGFpciIsInR5cGUiLCJhIiwiYiIsIlBhaXIiLCJpc1BhaXIiLCJhdHJpcGxlIiwiVHJpcGxlIiwiaXNUcmlwbGUiLCJjIiwiYmVmb3JlRWFjaCIsInN1Y2MiLCJmYWlsIiwiZmFsc2UiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBbUJBQSxhQUFTLHNCQUFULEVBQWlDLFlBQU07O0FBRW5DQSxpQkFBUyxrQ0FBVCxFQUE2QyxZQUFNO0FBQy9DQSxxQkFBUyw4Q0FBVCxFQUF5RCxZQUFNO0FBQzNELG9CQUFNQyxVQUFVLGdCQUFPQyxPQUFQLENBQWUsS0FBZixDQUFoQjtBQUNBQyxtQkFBRyxzQkFBSCxFQUEyQixZQUFNO0FBQzdCLHNDQUFPRixRQUFRRyxLQUFmLEVBQXNCQyxFQUF0QixDQUF5QkMsRUFBekIsQ0FBNEJDLEdBQTVCLENBQWdDLEtBQWhDO0FBQ0Esc0NBQU9OLFFBQVFPLFFBQVIsRUFBUCxFQUEyQkgsRUFBM0IsQ0FBOEJDLEVBQTlCLENBQWlDQyxHQUFqQyxD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QjtBQUNBLGtDQUFPK0MsS0FBSyxDQUFMLENBQVAsRUFBZ0JqRCxFQUFoQixDQUFtQkMsRUFBbkIsQ0FBc0JDLEdBQXRCLENBQTBCLEVBQTFCO0FBQ0Esa0NBQU8scUJBQVUrQyxJQUFWLENBQVAsRUFBd0JqRCxFQUF4QixDQUEyQkMsRUFBM0IsQ0FBOEJpRCxLQUE5QjtBQUNBLGtDQUFPLHFCQUFVRCxJQUFWLENBQVAsRUFBd0JqRCxFQUF4QixDQUEyQkMsRUFBM0IsQ0FBOEJLLElBQTlCO0FBQ0Esa0NBQU8sa0JBQU8yQyxJQUFQLENBQVAsRUFBcUJqRCxFQUFyQixDQUF3QkMsRUFBeEIsQ0FBMkJLLElBQTNCO0FBQ0gsYUFQRDtBQVFILFNBbEJEO0FBbUJILEtBeE5EIiwiZmlsZSI6ImNsYXNzZXNfdGVzdHMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge2V4cGVjdH0gZnJvbSAnY2hhaSc7XG5pbXBvcnQge1xuICAgIGlzUGFpcixcbiAgICBpc1N1Y2Nlc3MsXG4gICAgaXNGYWlsdXJlLFxuICAgIGlzU29tZSxcbiAgICBpc05vbmUsXG59IGZyb20gJ3V0aWwnO1xuaW1wb3J0IHtcbiAgICBwYWlyLFxuICAgIHN1Y2Nlc3MsXG4gICAgZmFpbHVyZSxcbiAgICBzb21lLFxuICAgIG5vbmUsXG4gICAgUG9zaXRpb24sXG4gICAgVHVwbGUsXG4gICAgSlZhbHVlLFxufSBmcm9tICdjbGFzc2VzJztcblxuZGVzY3JpYmUoJ2Ftb25nIGhlbHBlciBjbGFzc2VzJywgKCkgPT4ge1xuXG4gICAgZGVzY3JpYmUoJ0pWYWx1ZVxcJ3MgYXJlIHBhcnNlZCBKU09OIHZhbHVlcycsICgpID0+IHtcbiAgICAgICAgZGVzY3JpYmUoJ3dpdGggSlN0cmluZ1xcJ3MgYXMgcGFyc2VkIEpTT04gc3RyaW5nIHZhbHVlcycsICgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGpzdHJpbmcgPSBKVmFsdWUuSlN0cmluZygnYWJjJyk7XG4gICAgICAgICAgICBpdCgndGhhdCBhcmUgcmV0cmlldmFibGUnLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgZXhwZWN0KGpzdHJpbmcudmFsdWUpLnRvLmJlLmVxbCgnYWJjJyk7XG4gICAgICAgICAgICAgICAgZXhwZWN0KGpzdHJpbmcudG9TdHJpbmcoKSkudG8uYmUuZXFsKCdKU3RyaW5nKGFiYyknKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaXQoJ3RoYXQgYXJlIGltbXV0YWJsZScsICgpID0+IHtcbiAgICAgICAgICAgICAgICBleHBlY3QoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBqc3RyaW5nLnZhbHVlID0gJ2RlZic7XG4gICAgICAgICAgICAgICAgfSkudG8udGhyb3c7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGl0KCd0aGF0IGdvdHRhIGJlIHN0cmluZ3MnLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgZXhwZWN0KCgpID0+IEpWYWx1ZS5KU3RyaW5nKDEyMykpLnRvLnRocm93O1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpdCgndGhhdCBnb3R0YSBieSB0eXBlcyB3aXRoIGEgc3VwZXJ0eXBlJywgKCkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IGpzdHJpbmcgPSBKVmFsdWUuSlN0cmluZygnMTIzJyk7XG4gICAgICAgICAgICAgICAgZXhwZWN0KGpzdHJpbmcuaXNKVmFsdWUpLnRvLmJlLnRydWU7XG4gICAgICAgICAgICAgICAgZXhwZWN0KGpzdHJpbmcuaXNKU3RyaW5nKS50by5iZS50cnVlO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgICBpdCgnd2l0aCBKTnVtYmVyXFwncyBhcyBwYXJzZWQgSlNPTiBmbG9hdCB2YWx1ZXMnLCAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBqbnVtYmVyID0gSlZhbHVlLkpOdW1iZXIoMTIzLjQ1ZS0yMyk7XG4gICAgICAgICAgICBleHBlY3Qoam51bWJlci52YWx1ZSkudG8uYmUuZXFsKDEyMy40NWUtMjMpO1xuICAgICAgICAgICAgZXhwZWN0KGpudW1iZXIudG9TdHJpbmcoKSkudG8uYmUuZXFsKCdKTnVtYmVyKDEuMjM0NWUtMjEpJyk7XG4gICAgICAgICAgICBleHBlY3Qoam51bWJlci5pc0pWYWx1ZSkudG8uYmUudHJ1ZTtcbiAgICAgICAgICAgIGV4cGVjdChqbnVtYmVyLmlzSk51bWJlcikudG8uYmUudHJ1ZTtcbiAgICAgICAgICAgIGV4cGVjdCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgam51bWJlci52YWx1ZSA9IDEyMztcbiAgICAgICAgICAgIH0pLnRvLnRocm93O1xuICAgICAgICAgICAgZXhwZWN0KCgpID0+IEpWYWx1ZS5KTnVtYmVyKCd4JykpLnRvLnRocm93O1xuICAgICAgICAgICAgZXhwZWN0KCgpID0+IEpWYWx1ZS5KTnVtYmVyKE5hTikpLnRvLnRocm93O1xuICAgICAgICB9KTtcbiAgICAgICAgaXQoJ3dpdGggSkJvb2xcXCdzIGFzIHBhcnNlZCBKU09OIGJvb2xlYW4gdmFsdWVzJywgKCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgamJvb2wgPSBKVmFsdWUuSkJvb2wodHJ1ZSk7XG4gICAgICAgICAgICBleHBlY3QoamJvb2wudmFsdWUpLnRvLmJlLnRydWU7XG4gICAgICAgICAgICBleHBlY3QoamJvb2wudG9TdHJpbmcoKSkudG8uYmUuZXFsKCdKQm9vbCh0cnVlKScpO1xuICAgICAgICAgICAgZXhwZWN0KGpib29sLmlzSlZhbHVlKS50by5iZS50cnVlO1xuICAgICAgICAgICAgZXhwZWN0KGpib29sLmlzSkJvb2wpLnRvLmJlLnRydWU7XG4gICAgICAgICAgICBleHBlY3QoKCkgPT4ge1xuICAgICAgICAgICAgICAgIGpib29sLnZhbHVlID0gZmFsc2U7XG4gICAgICAgICAgICB9KS50by50aHJvdztcbiAgICAgICAgICAgIGV4cGVjdCgoKSA9PiBKVmFsdWUuSkJvb2woJ3gnKSkudG8udGhyb3c7XG4gICAgICAgICAgICBleHBlY3QoKCkgPT4gSlZhbHVlLkpCb29sKDEyMykpLnRvLnRocm93O1xuICAgICAgICAgICAgZXhwZWN0KCgpID0+IEpWYWx1ZS5KQm9vbChOYU4pKS50by50aHJvdztcbiAgICAgICAgfSk7XG4gICAgICAgIGl0KCd3aXRoIEpOdWxsXFwncyBhcyBwYXJzZWQgSlNPTiBudWxsIHZhbHVlcycsICgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGpudWxsID0gSlZhbHVlLkpOdWxsKG51bGwpO1xuICAgICAgICAgICAgZXhwZWN0KGpudWxsLnZhbHVlKS50by5iZS5udWxsO1xuICAgICAgICAgICAgZXhwZWN0KGpudWxsLnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgnSk51bGwobnVsbCknKTtcbiAgICAgICAgICAgIGV4cGVjdChqbnVsbC5pc0pWYWx1ZSkudG8uYmUudHJ1ZTtcbiAgICAgICAgICAgIGV4cGVjdChqbnVsbC5pc0pOdWxsKS50by5iZS50cnVlO1xuICAgICAgICAgICAgZXhwZWN0KCgpID0+IHtcbiAgICAgICAgICAgICAgICBqbnVsbC52YWx1ZSA9IDEyMztcbiAgICAgICAgICAgIH0pLnRvLnRocm93O1xuICAgICAgICAgICAgZXhwZWN0KCgpID0+IEpWYWx1ZS5KTnVsbCgnJykpLnRvLnRocm93O1xuICAgICAgICAgICAgZXhwZWN0KCgpID0+IEpWYWx1ZS5KTnVsbCh1bmRlZmluZWQpKS50by50aHJvdztcbiAgICAgICAgICAgIGV4cGVjdCgoKSA9PiBKVmFsdWUuSk51bGwoTmFOKSkudG8udGhyb3c7XG4gICAgICAgIH0pO1xuXG4gICAgfSk7XG5cbiAgICBkZXNjcmliZSgnUG9zaXRpb25cXCdzJywgKCkgPT4ge1xuICAgICAgICBjb25zdCByb3dzID0gW1xuICAgICAgICAgICAgWzEsIDIsIDNdLFxuICAgICAgICAgICAgWydhJywgJ2InLCAnYycsICdkJ10sXG4gICAgICAgICAgICBbJ0EnLCAnQicsICdDJ10sXG4gICAgICAgIF07XG4gICAgICAgIGl0KCdpbmNsdWRlIHRhYmxlcyBvZiBjaGFycyBhbmQgYWxsb3cgdG8gcmV0cmlldmUgY2hhciBvcHRpb25zJywgKCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgcG9zMDAgPSBQb3NpdGlvbihyb3dzLCAwLCAwKTtcbiAgICAgICAgICAgIGV4cGVjdChwb3MwMC5pc1Bvc2l0aW9uKS50by5iZS50cnVlO1xuICAgICAgICAgICAgZXhwZWN0KHBvczAwLmNoYXIoKS5pc0p1c3QpLnRvLmJlLnRydWU7XG4gICAgICAgICAgICBleHBlY3QocG9zMDAuY2hhcigpLnZhbHVlKS50by5iZS5lcWwoMSk7XG4gICAgICAgICAgICBjb25zdCBwb3MxMSA9IFBvc2l0aW9uKHJvd3MsIDEsIDEpO1xuICAgICAgICAgICAgZXhwZWN0KHBvczExLmNoYXIoKS5pc0p1c3QpLnRvLmJlLnRydWU7XG4gICAgICAgICAgICBleHBlY3QocG9zMTEuY2hhcigpLnZhbHVlKS50by5iZS5lcWwoJ2InKTtcbiAgICAgICAgfSk7XG4gICAgICAgIGl0KCdhbGxvdyB0byBpbmNyZW1lbnQgdGhlIHBvc2l0aW9uIGFuZCByZXRyaWV2ZSBmdXJ0aGVyIGNoYXJzJywgKCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgcG9zMDEgPSBQb3NpdGlvbihyb3dzLCAwLCAwKS5pbmNyUG9zKCk7XG4gICAgICAgICAgICBleHBlY3QocG9zMDEuY2hhcigpLnZhbHVlKS50by5iZS5lcWwoMik7XG4gICAgICAgICAgICBjb25zdCBwb3MyMCA9IFBvc2l0aW9uKHJvd3MsIDEsIDMpLmluY3JQb3MoKTtcbiAgICAgICAgICAgIGV4cGVjdChwb3MyMC5jaGFyKCkudmFsdWUpLnRvLmJlLmVxbCgnQScpO1xuICAgICAgICB9KTtcbiAgICAgICAgaXQoJ3JldHVybiBOb3RoaW5nIHdoZW4gcG9zaXRpb24gaXMgYmV5b25kIHRoZSBjb250YWluZWQgcm93cyBjb250ZW50JywgKCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgcG9zMTAxMCA9IFBvc2l0aW9uKHJvd3MsIDEwLCAxMCk7XG4gICAgICAgICAgICBleHBlY3QocG9zMTAxMC5jaGFyKCkuaXNOb3RoaW5nKS50by5iZS50cnVlO1xuICAgICAgICAgICAgY29uc3QgcG9zMjMgPSBQb3NpdGlvbihyb3dzLCAyLCAyKS5pbmNyUG9zKCk7XG4gICAgICAgICAgICBleHBlY3QocG9zMjMuY2hhcigpLmlzTm90aGluZykudG8uYmUudHJ1ZTtcbiAgICAgICAgfSk7XG4gICAgICAgIGl0KCdjYW4gYmUgaW5pdGlhbGl6ZWQgZnJvbSB0ZXh0IHN0cmluZ3MnLCAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBwb3MwMCA9IFBvc2l0aW9uLmZyb21UZXh0KCdMb3JlbSBpcHN1bSBkb2xvciBzaXQgYW1ldCcpO1xuICAgICAgICAgICAgZXhwZWN0KHBvczAwLmNoYXIoKS52YWx1ZSkudG8uYmUuZXFsKCdMJyk7XG4gICAgICAgICAgICBleHBlY3QocG9zMDAuaW5jclBvcygpLmluY3JQb3MoKS5pbmNyUG9zKCkuaW5jclBvcygpXG4gICAgICAgICAgICAgICAgLmNoYXIoKS52YWx1ZSkudG8uYmUuZXFsKCdtJyk7XG4gICAgICAgIH0pO1xuICAgICAgICBpdCgnY2FuIGJlIGluaXRpYWxpemVkIGFsc28gZnJvbSBtdWx0aWxpbmUgdGV4dCBzdHJpbmdzLCBzdHJpcHBpbmcgbmV3bGluZXMgYXdheScsICgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHBvczAwID0gUG9zaXRpb24uZnJvbVRleHQoJ0xvcmVtIFxcbmlwc3VtJyk7XG4gICAgICAgICAgICBleHBlY3QocG9zMDAuY2hhcigpLnZhbHVlKS50by5iZS5lcWwoJ0wnKTtcbiAgICAgICAgICAgIGV4cGVjdChwb3MwMC5pbmNyUG9zKCkuaW5jclBvcygpLmluY3JQb3MoKS5pbmNyUG9zKCkuaW5jclBvcygpLmluY3JQb3MoKVxuICAgICAgICAgICAgICAgIC5jaGFyKCkudmFsdWUpLnRvLmJlLmVxbCgnaScpO1xuICAgICAgICB9KTtcbiAgICAgICAgaXQoJ3JldHVybiBzdHJpbmdzIGNvbnRhaW5pbmcgYWxsIGNoYXJhY3RlcnMgc3RhcnRpbmcgZnJvbSBhIGdpdmVuIHBvc2l0aW9uLCBmb3IgdGhlIHNha2Ugb2YgdGVzdGluZycsICgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHBvczAxID0gUG9zaXRpb24uZnJvbVRleHQoJ0xvcmVtJykuaW5jclBvcygpO1xuICAgICAgICAgICAgZXhwZWN0KHBvczAxLnJlc3QoKSkudG8uYmUuZXFsKCdvcmVtJyk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgZGVzY3JpYmUoJ3NvbWVzJywgKCkgPT4ge1xuICAgICAgICBpdCgnaW5jbHVkZSBhIHZhbHVlIGFuZCBhbGxvdyB0byByZXRyaWV2ZSBpdCcsICgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGFTb21lID0gc29tZSgxMik7XG4gICAgICAgICAgICBleHBlY3QoYVNvbWUudmFsKCkpLnRvLmJlLmVxbCgxMik7XG4gICAgICAgICAgICBleHBlY3QoaXNTb21lKGFTb21lKSkudG8uYmUudHJ1ZTtcbiAgICAgICAgICAgIGV4cGVjdChhU29tZS50b1N0cmluZygpKS50by5iZS5lcWwoJ3NvbWUoMTIpJyk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgZGVzY3JpYmUoJ25vbmVzJywgKCkgPT4ge1xuICAgICAgICBpdCgnYXJlIGp1c3QgYSBzaWducG9zdCcsICgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGFOb25lID0gbm9uZSgpO1xuICAgICAgICAgICAgZXhwZWN0KGFOb25lLnZhbCgpKS50by5iZS5udWxsO1xuICAgICAgICAgICAgZXhwZWN0KGlzTm9uZShhTm9uZSkpLnRvLmJlLnRydWU7XG4gICAgICAgICAgICBleHBlY3QoYU5vbmUudG9TdHJpbmcoKSkudG8uYmUuZXFsKCdub25lKCknKTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICBkZXNjcmliZSgncGFpcnMnLCAoKSA9PiB7XG4gICAgICAgIGl0KCdpbmNsdWRlIDIgdmFsdWVzIGFuZCBhbGxvdyB0byByZXRyaWV2ZSB0aGVtJywgKCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgYXBhaXIgPSBwYWlyKHRydWUsIDEyKTtcbiAgICAgICAgICAgIGV4cGVjdChhcGFpclswXSkudG8uYmUuZXFsKHRydWUpO1xuICAgICAgICAgICAgZXhwZWN0KGFwYWlyWzFdKS50by5iZS5lcWwoMTIpO1xuICAgICAgICAgICAgZXhwZWN0KGFwYWlyLnR5cGUpLnRvLmJlLmVxbCgncGFpcicpO1xuICAgICAgICAgICAgZXhwZWN0KGlzUGFpcihhcGFpcikpLnRvLmJlLnRydWU7XG4gICAgICAgIH0pO1xuICAgICAgICBpdCgnYXJlIGFjdHVhbGx5IGFycmF5cywgYW5kIHRoZXJlZm9yZSBhbGxvdyBwb3NpdGlvbmFsIGRlc3RydWN0dXJpbmcnLCAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBbYSwgYl0gPSBwYWlyKHRydWUsIDEyKTtcbiAgICAgICAgICAgIGV4cGVjdChhKS50by5iZS5lcWwodHJ1ZSk7XG4gICAgICAgICAgICBleHBlY3QoYikudG8uYmUuZXFsKDEyKTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICBkZXNjcmliZSgnUGFpclxcJ3MnLCAoKSA9PiB7XG4gICAgICAgIGl0KCdpbmNsdWRlIDIgdmFsdWVzIGFuZCBhbGxvdyB0byByZXRyaWV2ZSB0aGVtJywgKCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgYXBhaXIgPSBUdXBsZS5QYWlyKHRydWUsIDEyKTtcbiAgICAgICAgICAgIGV4cGVjdChhcGFpclswXSkudG8uYmUuZXFsKHRydWUpO1xuICAgICAgICAgICAgZXhwZWN0KGFwYWlyWzFdKS50by5iZS5lcWwoMTIpO1xuICAgICAgICAgICAgZXhwZWN0KGFwYWlyLnR5cGUpLnRvLmJlLmVxbCgncGFpcicpO1xuICAgICAgICAgICAgZXhwZWN0KGFwYWlyLmlzUGFpcikudG8uYmUudHJ1ZTtcbiAgICAgICAgICAgIGV4cGVjdChhcGFpci50b1N0cmluZygpKS50by5iZS5lcWwoJ1t0cnVlLDEyXScpO1xuICAgICAgICB9KTtcbiAgICAgICAgaXQoJ2FyZSBpbW11dGFibGUsIGFuZCB0aHJvdyBpZiB5b3UgdHJ5IHRvIGNoYW5nZSB0aGVtJywgKCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgYXBhaXIgPSBUdXBsZS5QYWlyKHRydWUsIDEyKTtcbiAgICAgICAgICAgIGV4cGVjdCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgYXRyaXBsZVswXSA9IGZhbHNlO1xuICAgICAgICAgICAgfSkudG8udGhyb3c7XG4gICAgICAgICAgICBleHBlY3QoKCkgPT4ge1xuICAgICAgICAgICAgICAgIGF0cmlwbGVbMV0gPSAxMztcbiAgICAgICAgICAgIH0pLnRvLnRocm93O1xuICAgICAgICB9KTtcbiAgICAgICAgaXQoJ2FyZSB0cnVlIGl0ZXJhYmxlcywgYW5kIHRoZXJlZm9yZSBhbGxvdyBwb3NpdGlvbmFsIGRlc3RydWN0dXJpbmcnLCAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBbYSwgYl0gPSBUdXBsZS5QYWlyKHRydWUsIDEyKTtcbiAgICAgICAgICAgIGV4cGVjdChhKS50by5iZS5lcWwodHJ1ZSk7XG4gICAgICAgICAgICBleHBlY3QoYikudG8uYmUuZXFsKDEyKTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICBkZXNjcmliZSgnVHJpcGxlXFwncycsICgpID0+IHtcbiAgICAgICAgaXQoJ2luY2x1ZGUgMyB2YWx1ZXMgYW5kIGFsbG93IHRvIHJldHJpZXZlIHRoZW0nLCAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBhdHJpcGxlID0gVHVwbGUuVHJpcGxlKHRydWUsIDEyLCAnYScpO1xuICAgICAgICAgICAgZXhwZWN0KGF0cmlwbGVbMF0pLnRvLmJlLmVxbCh0cnVlKTtcbiAgICAgICAgICAgIGV4cGVjdChhdHJpcGxlWzFdKS50by5iZS5lcWwoMTIpO1xuICAgICAgICAgICAgZXhwZWN0KGF0cmlwbGVbMl0pLnRvLmJlLmVxbCgnYScpO1xuICAgICAgICAgICAgZXhwZWN0KGF0cmlwbGUudHlwZSkudG8uYmUuZXFsKCd0cmlwbGUnKTtcbiAgICAgICAgICAgIGV4cGVjdChhdHJpcGxlLmlzVHJpcGxlKS50by5iZS50cnVlO1xuICAgICAgICAgICAgZXhwZWN0KGF0cmlwbGUudG9TdHJpbmcoKSkudG8uYmUuZXFsKCdbdHJ1ZSwxMixhXScpO1xuICAgICAgICB9KTtcbiAgICAgICAgaXQoJ2FyZSBpbW11dGFibGUsIGFuZCB0aHJvdyBpZiB5b3UgdHJ5IHRvIGNoYW5nZSB0aGVtJywgKCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgYXRyaXBsZSA9IFR1cGxlLlRyaXBsZSh0cnVlLCAxMiwgJ2EnKTtcbiAgICAgICAgICAgIGV4cGVjdCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgYXRyaXBsZVswXSA9IGZhbHNlO1xuICAgICAgICAgICAgfSkudG8udGhyb3c7XG4gICAgICAgICAgICBleHBlY3QoKCkgPT4ge1xuICAgICAgICAgICAgICAgIGF0cmlwbGVbMV0gPSAxMztcbiAgICAgICAgICAgIH0pLnRvLnRocm93O1xuICAgICAgICAgICAgZXhwZWN0KCgpID0+IHtcbiAgICAgICAgICAgICAgICBhdHJpcGxlWzJdID0gJ2InO1xuICAgICAgICAgICAgfSkudG8udGhyb3c7XG4gICAgICAgIH0pO1xuICAgICAgICBpdCgnYXJlIHRydWUgaXRlcmFibGVzLCBhbmQgdGhlcmVmb3JlIGFsbG93IHBvc2l0aW9uYWwgZGVzdHJ1Y3R1cmluZycsICgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IFthLCBiLCBjXSA9IFR1cGxlLlRyaXBsZSh0cnVlLCAxMiwgJ2EnKTtcbiAgICAgICAgICAgIGV4cGVjdChhKS50by5iZS5lcWwodHJ1ZSk7XG4gICAgICAgICAgICBleHBlY3QoYikudG8uYmUuZXFsKDEyKTtcbiAgICAgICAgICAgIGV4cGVjdChjKS50by5iZS5lcWwoJ2EnKTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICBkZXNjcmliZSgnc3VjY2VzcyBhbmQgZmFpbHVyZScsICgpID0+IHtcbiAgICAgICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICAgIH0pO1xuICAgICAgICBpdCgnbWF5IHJlcHJlc2VudCBzdWNjZXNzZXMnLCAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBzdWNjID0gc3VjY2Vzcyh0cnVlLCAxMik7XG4gICAgICAgICAgICBleHBlY3Qoc3VjY1swXSkudG8uYmUudHJ1ZTtcbiAgICAgICAgICAgIGV4cGVjdChzdWNjWzFdKS50by5iZS5lcWwoMTIpO1xuICAgICAgICAgICAgZXhwZWN0KGlzU3VjY2VzcyhzdWNjKSkudG8uYmUudHJ1ZTtcbiAgICAgICAgICAgIGV4cGVjdChpc1BhaXIoc3VjYykpLnRvLmJlLnRydWU7XG4gICAgICAgIH0pO1xuICAgICAgICBpdCgnbWF5IHJlcHJlc2VudCBmYWlsdXJlcycsICgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGZhaWwgPSBmYWlsdXJlKCdhJywgMTIpO1xuICAgICAgICAgICAgZXhwZWN0KGZhaWxbMF0pLnRvLmJlLmVxbCgnYScpO1xuICAgICAgICAgICAgZXhwZWN0KGZhaWxbMV0pLnRvLmJlLmVxbCgxMik7XG4gICAgICAgICAgICBleHBlY3QoaXNTdWNjZXNzKGZhaWwpKS50by5iZS5mYWxzZTtcbiAgICAgICAgICAgIGV4cGVjdChpc0ZhaWx1cmUoZmFpbCkpLnRvLmJlLnRydWU7XG4gICAgICAgICAgICBleHBlY3QoaXNQYWlyKGZhaWwpKS50by5iZS50cnVlO1xuICAgICAgICB9KTtcbiAgICB9KTtcbn0pO1xuIl19