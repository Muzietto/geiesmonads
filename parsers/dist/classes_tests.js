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
                    (0, _chai.expect)(jstring.toString()).to.be.eql('JString abc');
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
            });
            it('with JNumber\'s as parsed JSON float values', function () {
                var jnumber = _classes.JValue.JNumber(123.45e-23);
                (0, _chai.expect)(jnumber.value).to.be.eql(123.45e-23);
                (0, _chai.expect)(jnumber.toString()).to.be.eql('JNumber 1.2345e-21');
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2pzLXNwZWMvY2xhc3Nlc190ZXN0cy5qcyJdLCJuYW1lcyI6WyJkZXNjcmliZSIsImpzdHJpbmciLCJKU3RyaW5nIiwiaXQiLCJ2YWx1ZSIsInRvIiwiYmUiLCJlcWwiLCJ0b1N0cmluZyIsInRocm93Iiwiam51bWJlciIsIkpOdW1iZXIiLCJOYU4iLCJyb3dzIiwicG9zMDAiLCJpc1Bvc2l0aW9uIiwidHJ1ZSIsImNoYXIiLCJpc0p1c3QiLCJwb3MxMSIsInBvczAxIiwiaW5jclBvcyIsInBvczIwIiwicG9zMTAxMCIsImlzTm90aGluZyIsInBvczIzIiwiZnJvbVRleHQiLCJyZXN0IiwiYVNvbWUiLCJ2YWwiLCJhTm9uZSIsIm51bGwiLCJhcGFpciIsInR5cGUiLCJhIiwiYiIsIlBhaXIiLCJpc1BhaXIiLCJhdHJpcGxlIiwiVHJpcGxlIiwiaXNUcmlwbGUiLCJjIiwiYmVmb3JlRWFjaCIsInN1Y2MiLCJmYWlsIiwiZmFsc2UiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBbUJBQSxhQUFTLHNCQUFULEVBQWlDLFlBQU07O0FBRW5DQSxpQkFBUyxrQ0FBVCxFQUE2QyxZQUFNO0FBQy9DQSxxQkFBUyw4Q0FBVCxFQUF5RCxZQUFNO0FBQzNELG9CQUFNQyxVQUFVLGdCQUFPQyxPQUFQLENBQWUsS0FBZixDQUFoQjtBQUNBQyxtQkFBRyxzQkFBSCxFQUEyQixZQUFNO0FBQzdCLHNDQUFPRixRQUFRRyxLQUFmLEVBQXNCQyxFQUF0QixDQUF5QkMsRUFBekIsQ0FBNEJDLEdBQTVCLENBQWdDLEtBQWhDO0FBQ0Esc0NBQU9OLFFBQVFPLFFBQVIsRUFBUCxFQUEyQkgsRUFBM0IsQ0FBOEJDLEVBQTlCLENBQWlDQyxHQUFqQyxDQUFxQyxhQUFyQztBQUNILGlCQUhEO0FBSUFKLG1CQUFHLG9CQUFILEVBQXlCLFlBQU07QUFDM0Isc0NBQU8sWUFBTTtBQUNURixnQ0FBUUcsS0FBUixHQUFnQixLQUFoQjtB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QyxFQUFoQixDQUFtQkMsRUFBbkIsQ0FBc0JDLEdBQXRCLENBQTBCLEVBQTFCO0FBQ0Esa0NBQU8scUJBQVVxQyxJQUFWLENBQVAsRUFBd0J2QyxFQUF4QixDQUEyQkMsRUFBM0IsQ0FBOEJ1QyxLQUE5QjtBQUNBLGtDQUFPLHFCQUFVRCxJQUFWLENBQVAsRUFBd0J2QyxFQUF4QixDQUEyQkMsRUFBM0IsQ0FBOEJVLElBQTlCO0FBQ0Esa0NBQU8sa0JBQU80QixJQUFQLENBQVAsRUFBcUJ2QyxFQUFyQixDQUF3QkMsRUFBeEIsQ0FBMkJVLElBQTNCO0FBQ0gsYUFQRDtBQVFILFNBbEJEO0FBbUJILEtBdkxEIiwiZmlsZSI6ImNsYXNzZXNfdGVzdHMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge2V4cGVjdH0gZnJvbSAnY2hhaSc7XG5pbXBvcnQge1xuICAgIGlzUGFpcixcbiAgICBpc1N1Y2Nlc3MsXG4gICAgaXNGYWlsdXJlLFxuICAgIGlzU29tZSxcbiAgICBpc05vbmUsXG59IGZyb20gJ3V0aWwnO1xuaW1wb3J0IHtcbiAgICBwYWlyLFxuICAgIHN1Y2Nlc3MsXG4gICAgZmFpbHVyZSxcbiAgICBzb21lLFxuICAgIG5vbmUsXG4gICAgUG9zaXRpb24sXG4gICAgVHVwbGUsXG4gICAgSlZhbHVlLFxufSBmcm9tICdjbGFzc2VzJztcblxuZGVzY3JpYmUoJ2Ftb25nIGhlbHBlciBjbGFzc2VzJywgKCkgPT4ge1xuXG4gICAgZGVzY3JpYmUoJ0pWYWx1ZVxcJ3MgYXJlIHBhcnNlZCBKU09OIHZhbHVlcycsICgpID0+IHtcbiAgICAgICAgZGVzY3JpYmUoJ3dpdGggSlN0cmluZ1xcJ3MgYXMgcGFyc2VkIEpTT04gc3RyaW5nIHZhbHVlcycsICgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGpzdHJpbmcgPSBKVmFsdWUuSlN0cmluZygnYWJjJyk7XG4gICAgICAgICAgICBpdCgndGhhdCBhcmUgcmV0cmlldmFibGUnLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgZXhwZWN0KGpzdHJpbmcudmFsdWUpLnRvLmJlLmVxbCgnYWJjJyk7XG4gICAgICAgICAgICAgICAgZXhwZWN0KGpzdHJpbmcudG9TdHJpbmcoKSkudG8uYmUuZXFsKCdKU3RyaW5nIGFiYycpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpdCgndGhhdCBhcmUgaW1tdXRhYmxlJywgKCkgPT4ge1xuICAgICAgICAgICAgICAgIGV4cGVjdCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGpzdHJpbmcudmFsdWUgPSAnZGVmJztcbiAgICAgICAgICAgICAgICB9KS50by50aHJvdztcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaXQoJ3RoYXQgZ290dGEgYmUgc3RyaW5ncycsICgpID0+IHtcbiAgICAgICAgICAgICAgICBleHBlY3QoKCkgPT4gSlZhbHVlLkpTdHJpbmcoMTIzKSkudG8udGhyb3c7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICAgIGl0KCd3aXRoIEpOdW1iZXJcXCdzIGFzIHBhcnNlZCBKU09OIGZsb2F0IHZhbHVlcycsICgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGpudW1iZXIgPSBKVmFsdWUuSk51bWJlcigxMjMuNDVlLTIzKTtcbiAgICAgICAgICAgIGV4cGVjdChqbnVtYmVyLnZhbHVlKS50by5iZS5lcWwoMTIzLjQ1ZS0yMyk7XG4gICAgICAgICAgICBleHBlY3Qoam51bWJlci50b1N0cmluZygpKS50by5iZS5lcWwoJ0pOdW1iZXIgMS4yMzQ1ZS0yMScpO1xuICAgICAgICAgICAgZXhwZWN0KCgpID0+IHtcbiAgICAgICAgICAgICAgICBqbnVtYmVyLnZhbHVlID0gMTIzO1xuICAgICAgICAgICAgfSkudG8udGhyb3c7XG4gICAgICAgICAgICBleHBlY3QoKCkgPT4gSlZhbHVlLkpOdW1iZXIoJ3gnKSkudG8udGhyb3c7XG4gICAgICAgICAgICBleHBlY3QoKCkgPT4gSlZhbHVlLkpOdW1iZXIoTmFOKSkudG8udGhyb3c7XG4gICAgICAgIH0pO1xuXG4gICAgfSk7XG5cbiAgICBkZXNjcmliZSgnUG9zaXRpb25cXCdzJywgKCkgPT4ge1xuICAgICAgICBjb25zdCByb3dzID0gW1xuICAgICAgICAgICAgWzEsIDIsIDNdLFxuICAgICAgICAgICAgWydhJywgJ2InLCAnYycsICdkJ10sXG4gICAgICAgICAgICBbJ0EnLCAnQicsICdDJ10sXG4gICAgICAgIF07XG4gICAgICAgIGl0KCdpbmNsdWRlIHRhYmxlcyBvZiBjaGFycyBhbmQgYWxsb3cgdG8gcmV0cmlldmUgY2hhciBvcHRpb25zJywgKCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgcG9zMDAgPSBQb3NpdGlvbihyb3dzLCAwLCAwKTtcbiAgICAgICAgICAgIGV4cGVjdChwb3MwMC5pc1Bvc2l0aW9uKS50by5iZS50cnVlO1xuICAgICAgICAgICAgZXhwZWN0KHBvczAwLmNoYXIoKS5pc0p1c3QpLnRvLmJlLnRydWU7XG4gICAgICAgICAgICBleHBlY3QocG9zMDAuY2hhcigpLnZhbHVlKS50by5iZS5lcWwoMSk7XG4gICAgICAgICAgICBjb25zdCBwb3MxMSA9IFBvc2l0aW9uKHJvd3MsIDEsIDEpO1xuICAgICAgICAgICAgZXhwZWN0KHBvczExLmNoYXIoKS5pc0p1c3QpLnRvLmJlLnRydWU7XG4gICAgICAgICAgICBleHBlY3QocG9zMTEuY2hhcigpLnZhbHVlKS50by5iZS5lcWwoJ2InKTtcbiAgICAgICAgfSk7XG4gICAgICAgIGl0KCdhbGxvdyB0byBpbmNyZW1lbnQgdGhlIHBvc2l0aW9uIGFuZCByZXRyaWV2ZSBmdXJ0aGVyIGNoYXJzJywgKCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgcG9zMDEgPSBQb3NpdGlvbihyb3dzLCAwLCAwKS5pbmNyUG9zKCk7XG4gICAgICAgICAgICBleHBlY3QocG9zMDEuY2hhcigpLnZhbHVlKS50by5iZS5lcWwoMik7XG4gICAgICAgICAgICBjb25zdCBwb3MyMCA9IFBvc2l0aW9uKHJvd3MsIDEsIDMpLmluY3JQb3MoKTtcbiAgICAgICAgICAgIGV4cGVjdChwb3MyMC5jaGFyKCkudmFsdWUpLnRvLmJlLmVxbCgnQScpO1xuICAgICAgICB9KTtcbiAgICAgICAgaXQoJ3JldHVybiBOb3RoaW5nIHdoZW4gcG9zaXRpb24gaXMgYmV5b25kIHRoZSBjb250YWluZWQgcm93cyBjb250ZW50JywgKCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgcG9zMTAxMCA9IFBvc2l0aW9uKHJvd3MsIDEwLCAxMCk7XG4gICAgICAgICAgICBleHBlY3QocG9zMTAxMC5jaGFyKCkuaXNOb3RoaW5nKS50by5iZS50cnVlO1xuICAgICAgICAgICAgY29uc3QgcG9zMjMgPSBQb3NpdGlvbihyb3dzLCAyLCAyKS5pbmNyUG9zKCk7XG4gICAgICAgICAgICBleHBlY3QocG9zMjMuY2hhcigpLmlzTm90aGluZykudG8uYmUudHJ1ZTtcbiAgICAgICAgfSk7XG4gICAgICAgIGl0KCdjYW4gYmUgaW5pdGlhbGl6ZWQgZnJvbSB0ZXh0IHN0cmluZ3MnLCAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBwb3MwMCA9IFBvc2l0aW9uLmZyb21UZXh0KCdMb3JlbSBpcHN1bSBkb2xvciBzaXQgYW1ldCcpO1xuICAgICAgICAgICAgZXhwZWN0KHBvczAwLmNoYXIoKS52YWx1ZSkudG8uYmUuZXFsKCdMJyk7XG4gICAgICAgICAgICBleHBlY3QocG9zMDAuaW5jclBvcygpLmluY3JQb3MoKS5pbmNyUG9zKCkuaW5jclBvcygpXG4gICAgICAgICAgICAgICAgLmNoYXIoKS52YWx1ZSkudG8uYmUuZXFsKCdtJyk7XG4gICAgICAgIH0pO1xuICAgICAgICBpdCgnY2FuIGJlIGluaXRpYWxpemVkIGFsc28gZnJvbSBtdWx0aWxpbmUgdGV4dCBzdHJpbmdzLCBzdHJpcHBpbmcgbmV3bGluZXMgYXdheScsICgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHBvczAwID0gUG9zaXRpb24uZnJvbVRleHQoJ0xvcmVtIFxcbmlwc3VtJyk7XG4gICAgICAgICAgICBleHBlY3QocG9zMDAuY2hhcigpLnZhbHVlKS50by5iZS5lcWwoJ0wnKTtcbiAgICAgICAgICAgIGV4cGVjdChwb3MwMC5pbmNyUG9zKCkuaW5jclBvcygpLmluY3JQb3MoKS5pbmNyUG9zKCkuaW5jclBvcygpLmluY3JQb3MoKVxuICAgICAgICAgICAgICAgIC5jaGFyKCkudmFsdWUpLnRvLmJlLmVxbCgnaScpO1xuICAgICAgICB9KTtcbiAgICAgICAgaXQoJ3JldHVybiBzdHJpbmdzIGNvbnRhaW5pbmcgYWxsIGNoYXJhY3RlcnMgc3RhcnRpbmcgZnJvbSBhIGdpdmVuIHBvc2l0aW9uLCBmb3IgdGhlIHNha2Ugb2YgdGVzdGluZycsICgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHBvczAxID0gUG9zaXRpb24uZnJvbVRleHQoJ0xvcmVtJykuaW5jclBvcygpO1xuICAgICAgICAgICAgZXhwZWN0KHBvczAxLnJlc3QoKSkudG8uYmUuZXFsKCdvcmVtJyk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgZGVzY3JpYmUoJ3NvbWVzJywgKCkgPT4ge1xuICAgICAgICBpdCgnaW5jbHVkZSBhIHZhbHVlIGFuZCBhbGxvdyB0byByZXRyaWV2ZSBpdCcsICgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGFTb21lID0gc29tZSgxMik7XG4gICAgICAgICAgICBleHBlY3QoYVNvbWUudmFsKCkpLnRvLmJlLmVxbCgxMik7XG4gICAgICAgICAgICBleHBlY3QoaXNTb21lKGFTb21lKSkudG8uYmUudHJ1ZTtcbiAgICAgICAgICAgIGV4cGVjdChhU29tZS50b1N0cmluZygpKS50by5iZS5lcWwoJ3NvbWUoMTIpJyk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgZGVzY3JpYmUoJ25vbmVzJywgKCkgPT4ge1xuICAgICAgICBpdCgnYXJlIGp1c3QgYSBzaWducG9zdCcsICgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGFOb25lID0gbm9uZSgpO1xuICAgICAgICAgICAgZXhwZWN0KGFOb25lLnZhbCgpKS50by5iZS5udWxsO1xuICAgICAgICAgICAgZXhwZWN0KGlzTm9uZShhTm9uZSkpLnRvLmJlLnRydWU7XG4gICAgICAgICAgICBleHBlY3QoYU5vbmUudG9TdHJpbmcoKSkudG8uYmUuZXFsKCdub25lKCknKTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICBkZXNjcmliZSgncGFpcnMnLCAoKSA9PiB7XG4gICAgICAgIGl0KCdpbmNsdWRlIDIgdmFsdWVzIGFuZCBhbGxvdyB0byByZXRyaWV2ZSB0aGVtJywgKCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgYXBhaXIgPSBwYWlyKHRydWUsIDEyKTtcbiAgICAgICAgICAgIGV4cGVjdChhcGFpclswXSkudG8uYmUuZXFsKHRydWUpO1xuICAgICAgICAgICAgZXhwZWN0KGFwYWlyWzFdKS50by5iZS5lcWwoMTIpO1xuICAgICAgICAgICAgZXhwZWN0KGFwYWlyLnR5cGUpLnRvLmJlLmVxbCgncGFpcicpO1xuICAgICAgICAgICAgZXhwZWN0KGlzUGFpcihhcGFpcikpLnRvLmJlLnRydWU7XG4gICAgICAgIH0pO1xuICAgICAgICBpdCgnYXJlIGFjdHVhbGx5IGFycmF5cywgYW5kIHRoZXJlZm9yZSBhbGxvdyBwb3NpdGlvbmFsIGRlc3RydWN0dXJpbmcnLCAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBbYSwgYl0gPSBwYWlyKHRydWUsIDEyKTtcbiAgICAgICAgICAgIGV4cGVjdChhKS50by5iZS5lcWwodHJ1ZSk7XG4gICAgICAgICAgICBleHBlY3QoYikudG8uYmUuZXFsKDEyKTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICBkZXNjcmliZSgnUGFpclxcJ3MnLCAoKSA9PiB7XG4gICAgICAgIGl0KCdpbmNsdWRlIDIgdmFsdWVzIGFuZCBhbGxvdyB0byByZXRyaWV2ZSB0aGVtJywgKCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgYXBhaXIgPSBUdXBsZS5QYWlyKHRydWUsIDEyKTtcbiAgICAgICAgICAgIGV4cGVjdChhcGFpclswXSkudG8uYmUuZXFsKHRydWUpO1xuICAgICAgICAgICAgZXhwZWN0KGFwYWlyWzFdKS50by5iZS5lcWwoMTIpO1xuICAgICAgICAgICAgZXhwZWN0KGFwYWlyLnR5cGUpLnRvLmJlLmVxbCgncGFpcicpO1xuICAgICAgICAgICAgZXhwZWN0KGFwYWlyLmlzUGFpcikudG8uYmUudHJ1ZTtcbiAgICAgICAgICAgIGV4cGVjdChhcGFpci50b1N0cmluZygpKS50by5iZS5lcWwoJ1t0cnVlLDEyXScpO1xuICAgICAgICB9KTtcbiAgICAgICAgaXQoJ2FyZSBpbW11dGFibGUsIGFuZCB0aHJvdyBpZiB5b3UgdHJ5IHRvIGNoYW5nZSB0aGVtJywgKCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgYXBhaXIgPSBUdXBsZS5QYWlyKHRydWUsIDEyKTtcbiAgICAgICAgICAgIGV4cGVjdCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgYXRyaXBsZVswXSA9IGZhbHNlO1xuICAgICAgICAgICAgfSkudG8udGhyb3c7XG4gICAgICAgICAgICBleHBlY3QoKCkgPT4ge1xuICAgICAgICAgICAgICAgIGF0cmlwbGVbMV0gPSAxMztcbiAgICAgICAgICAgIH0pLnRvLnRocm93O1xuICAgICAgICB9KTtcbiAgICAgICAgaXQoJ2FyZSB0cnVlIGl0ZXJhYmxlcywgYW5kIHRoZXJlZm9yZSBhbGxvdyBwb3NpdGlvbmFsIGRlc3RydWN0dXJpbmcnLCAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBbYSwgYl0gPSBUdXBsZS5QYWlyKHRydWUsIDEyKTtcbiAgICAgICAgICAgIGV4cGVjdChhKS50by5iZS5lcWwodHJ1ZSk7XG4gICAgICAgICAgICBleHBlY3QoYikudG8uYmUuZXFsKDEyKTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICBkZXNjcmliZSgnVHJpcGxlXFwncycsICgpID0+IHtcbiAgICAgICAgaXQoJ2luY2x1ZGUgMyB2YWx1ZXMgYW5kIGFsbG93IHRvIHJldHJpZXZlIHRoZW0nLCAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBhdHJpcGxlID0gVHVwbGUuVHJpcGxlKHRydWUsIDEyLCAnYScpO1xuICAgICAgICAgICAgZXhwZWN0KGF0cmlwbGVbMF0pLnRvLmJlLmVxbCh0cnVlKTtcbiAgICAgICAgICAgIGV4cGVjdChhdHJpcGxlWzFdKS50by5iZS5lcWwoMTIpO1xuICAgICAgICAgICAgZXhwZWN0KGF0cmlwbGVbMl0pLnRvLmJlLmVxbCgnYScpO1xuICAgICAgICAgICAgZXhwZWN0KGF0cmlwbGUudHlwZSkudG8uYmUuZXFsKCd0cmlwbGUnKTtcbiAgICAgICAgICAgIGV4cGVjdChhdHJpcGxlLmlzVHJpcGxlKS50by5iZS50cnVlO1xuICAgICAgICAgICAgZXhwZWN0KGF0cmlwbGUudG9TdHJpbmcoKSkudG8uYmUuZXFsKCdbdHJ1ZSwxMixhXScpO1xuICAgICAgICB9KTtcbiAgICAgICAgaXQoJ2FyZSBpbW11dGFibGUsIGFuZCB0aHJvdyBpZiB5b3UgdHJ5IHRvIGNoYW5nZSB0aGVtJywgKCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgYXRyaXBsZSA9IFR1cGxlLlRyaXBsZSh0cnVlLCAxMiwgJ2EnKTtcbiAgICAgICAgICAgIGV4cGVjdCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgYXRyaXBsZVswXSA9IGZhbHNlO1xuICAgICAgICAgICAgfSkudG8udGhyb3c7XG4gICAgICAgICAgICBleHBlY3QoKCkgPT4ge1xuICAgICAgICAgICAgICAgIGF0cmlwbGVbMV0gPSAxMztcbiAgICAgICAgICAgIH0pLnRvLnRocm93O1xuICAgICAgICAgICAgZXhwZWN0KCgpID0+IHtcbiAgICAgICAgICAgICAgICBhdHJpcGxlWzJdID0gJ2InO1xuICAgICAgICAgICAgfSkudG8udGhyb3c7XG4gICAgICAgIH0pO1xuICAgICAgICBpdCgnYXJlIHRydWUgaXRlcmFibGVzLCBhbmQgdGhlcmVmb3JlIGFsbG93IHBvc2l0aW9uYWwgZGVzdHJ1Y3R1cmluZycsICgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IFthLCBiLCBjXSA9IFR1cGxlLlRyaXBsZSh0cnVlLCAxMiwgJ2EnKTtcbiAgICAgICAgICAgIGV4cGVjdChhKS50by5iZS5lcWwodHJ1ZSk7XG4gICAgICAgICAgICBleHBlY3QoYikudG8uYmUuZXFsKDEyKTtcbiAgICAgICAgICAgIGV4cGVjdChjKS50by5iZS5lcWwoJ2EnKTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICBkZXNjcmliZSgnc3VjY2VzcyBhbmQgZmFpbHVyZScsICgpID0+IHtcbiAgICAgICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICAgIH0pO1xuICAgICAgICBpdCgnbWF5IHJlcHJlc2VudCBzdWNjZXNzZXMnLCAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBzdWNjID0gc3VjY2Vzcyh0cnVlLCAxMik7XG4gICAgICAgICAgICBleHBlY3Qoc3VjY1swXSkudG8uYmUudHJ1ZTtcbiAgICAgICAgICAgIGV4cGVjdChzdWNjWzFdKS50by5iZS5lcWwoMTIpO1xuICAgICAgICAgICAgZXhwZWN0KGlzU3VjY2VzcyhzdWNjKSkudG8uYmUudHJ1ZTtcbiAgICAgICAgICAgIGV4cGVjdChpc1BhaXIoc3VjYykpLnRvLmJlLnRydWU7XG4gICAgICAgIH0pO1xuICAgICAgICBpdCgnbWF5IHJlcHJlc2VudCBmYWlsdXJlcycsICgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGZhaWwgPSBmYWlsdXJlKCdhJywgMTIpO1xuICAgICAgICAgICAgZXhwZWN0KGZhaWxbMF0pLnRvLmJlLmVxbCgnYScpO1xuICAgICAgICAgICAgZXhwZWN0KGZhaWxbMV0pLnRvLmJlLmVxbCgxMik7XG4gICAgICAgICAgICBleHBlY3QoaXNTdWNjZXNzKGZhaWwpKS50by5iZS5mYWxzZTtcbiAgICAgICAgICAgIGV4cGVjdChpc0ZhaWx1cmUoZmFpbCkpLnRvLmJlLnRydWU7XG4gICAgICAgICAgICBleHBlY3QoaXNQYWlyKGZhaWwpKS50by5iZS50cnVlO1xuICAgICAgICB9KTtcbiAgICB9KTtcbn0pO1xuIl19