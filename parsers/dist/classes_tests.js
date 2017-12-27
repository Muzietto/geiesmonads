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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2pzLXNwZWMvY2xhc3Nlc190ZXN0cy5qcyJdLCJuYW1lcyI6WyJkZXNjcmliZSIsInJvd3MiLCJpdCIsInBvczAwIiwiaXNQb3NpdGlvbiIsInRvIiwiYmUiLCJ0cnVlIiwiY2hhciIsImlzSnVzdCIsInZhbHVlIiwiZXFsIiwicG9zMTEiLCJwb3MwMSIsImluY3JQb3MiLCJwb3MyMCIsInBvczEwMTAiLCJpc05vdGhpbmciLCJwb3MyMyIsImZyb21UZXh0IiwicmVzdCIsImFTb21lIiwidmFsIiwidG9TdHJpbmciLCJhTm9uZSIsIm51bGwiLCJhcGFpciIsInR5cGUiLCJhIiwiYiIsIlBhaXIiLCJpc1BhaXIiLCJhdHJpcGxlIiwidGhyb3ciLCJUcmlwbGUiLCJpc1RyaXBsZSIsImMiLCJiZWZvcmVFYWNoIiwic3VjYyIsImZhaWwiLCJmYWxzZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFrQkFBLGFBQVMsc0JBQVQsRUFBaUMsWUFBTTs7QUFFbkNBLGlCQUFTLGFBQVQsRUFBd0IsWUFBTTtBQUMxQixnQkFBTUMsT0FBTyxDQUNULENBQUMsQ0FBRCxFQUFJLENBQUosRUFBTyxDQUFQLENBRFMsRUFFVCxDQUFDLEdBQUQsRUFBTSxHQUFOLEVBQVcsR0FBWCxFQUFnQixHQUFoQixDQUZTLEVBR1QsQ0FBQyxHQUFELEVBQU0sR0FBTixFQUFXLEdBQVgsQ0FIUyxDQUFiO0FBS0FDLGVBQUcsNERBQUgsRUFBaUUsWUFBTTtBQUNuRSxvQkFBTUMsUUFBUSx1QkFBU0YsSUFBVCxFQUFlLENBQWYsRUFBa0IsQ0FBbEIsQ0FBZDtBQUNBLGtDQUFPRSxNQUFNQyxVQUFiLEVBQXlCQyxFQUF6QixDQUE0QkMsRUFBNUIsQ0FBK0JDLElBQS9CO0FBQ0Esa0NBQU9KLE1BQU1LLElBQU4sR0FBYUMsTUFBcEIsRUFBNEJKLEVBQTVCLENBQStCQyxFQUEvQixDQUFrQ0MsSUFBbEM7QUFDQSxrQ0FBT0osTUFBTUss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SUFBOUI7QUFDQSxrQ0FBTyxrQkFBT2dDLElBQVAsQ0FBUCxFQUFxQmxDLEVBQXJCLENBQXdCQyxFQUF4QixDQUEyQkMsSUFBM0I7QUFDSCxhQVBEO0FBUUgsU0FsQkQ7QUFtQkgsS0FoSkQiLCJmaWxlIjoiY2xhc3Nlc190ZXN0cy5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7ZXhwZWN0fSBmcm9tICdjaGFpJztcbmltcG9ydCB7XG4gICAgaXNQYWlyLFxuICAgIGlzU3VjY2VzcyxcbiAgICBpc0ZhaWx1cmUsXG4gICAgaXNTb21lLFxuICAgIGlzTm9uZSxcbn0gZnJvbSAndXRpbCc7XG5pbXBvcnQge1xuICAgIHBhaXIsXG4gICAgc3VjY2VzcyxcbiAgICBmYWlsdXJlLFxuICAgIHNvbWUsXG4gICAgbm9uZSxcbiAgICBQb3NpdGlvbixcbiAgICBUdXBsZSxcbn0gZnJvbSAnY2xhc3Nlcyc7XG5cbmRlc2NyaWJlKCdhbW9uZyBoZWxwZXIgY2xhc3NlcycsICgpID0+IHtcblxuICAgIGRlc2NyaWJlKCdQb3NpdGlvblxcJ3MnLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHJvd3MgPSBbXG4gICAgICAgICAgICBbMSwgMiwgM10sXG4gICAgICAgICAgICBbJ2EnLCAnYicsICdjJywgJ2QnXSxcbiAgICAgICAgICAgIFsnQScsICdCJywgJ0MnXSxcbiAgICAgICAgXTtcbiAgICAgICAgaXQoJ2luY2x1ZGUgdGFibGVzIG9mIGNoYXJzIGFuZCBhbGxvdyB0byByZXRyaWV2ZSBjaGFyIG9wdGlvbnMnLCAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBwb3MwMCA9IFBvc2l0aW9uKHJvd3MsIDAsIDApO1xuICAgICAgICAgICAgZXhwZWN0KHBvczAwLmlzUG9zaXRpb24pLnRvLmJlLnRydWU7XG4gICAgICAgICAgICBleHBlY3QocG9zMDAuY2hhcigpLmlzSnVzdCkudG8uYmUudHJ1ZTtcbiAgICAgICAgICAgIGV4cGVjdChwb3MwMC5jaGFyKCkudmFsdWUpLnRvLmJlLmVxbCgxKTtcbiAgICAgICAgICAgIGNvbnN0IHBvczExID0gUG9zaXRpb24ocm93cywgMSwgMSk7XG4gICAgICAgICAgICBleHBlY3QocG9zMTEuY2hhcigpLmlzSnVzdCkudG8uYmUudHJ1ZTtcbiAgICAgICAgICAgIGV4cGVjdChwb3MxMS5jaGFyKCkudmFsdWUpLnRvLmJlLmVxbCgnYicpO1xuICAgICAgICB9KTtcbiAgICAgICAgaXQoJ2FsbG93IHRvIGluY3JlbWVudCB0aGUgcG9zaXRpb24gYW5kIHJldHJpZXZlIGZ1cnRoZXIgY2hhcnMnLCAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBwb3MwMSA9IFBvc2l0aW9uKHJvd3MsIDAsIDApLmluY3JQb3MoKTtcbiAgICAgICAgICAgIGV4cGVjdChwb3MwMS5jaGFyKCkudmFsdWUpLnRvLmJlLmVxbCgyKTtcbiAgICAgICAgICAgIGNvbnN0IHBvczIwID0gUG9zaXRpb24ocm93cywgMSwgMykuaW5jclBvcygpO1xuICAgICAgICAgICAgZXhwZWN0KHBvczIwLmNoYXIoKS52YWx1ZSkudG8uYmUuZXFsKCdBJyk7XG4gICAgICAgIH0pO1xuICAgICAgICBpdCgncmV0dXJuIE5vdGhpbmcgd2hlbiBwb3NpdGlvbiBpcyBiZXlvbmQgdGhlIGNvbnRhaW5lZCByb3dzIGNvbnRlbnQnLCAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBwb3MxMDEwID0gUG9zaXRpb24ocm93cywgMTAsIDEwKTtcbiAgICAgICAgICAgIGV4cGVjdChwb3MxMDEwLmNoYXIoKS5pc05vdGhpbmcpLnRvLmJlLnRydWU7XG4gICAgICAgICAgICBjb25zdCBwb3MyMyA9IFBvc2l0aW9uKHJvd3MsIDIsIDIpLmluY3JQb3MoKTtcbiAgICAgICAgICAgIGV4cGVjdChwb3MyMy5jaGFyKCkuaXNOb3RoaW5nKS50by5iZS50cnVlO1xuICAgICAgICB9KTtcbiAgICAgICAgaXQoJ2NhbiBiZSBpbml0aWFsaXplZCBmcm9tIHRleHQgc3RyaW5ncycsICgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHBvczAwID0gUG9zaXRpb24uZnJvbVRleHQoJ0xvcmVtIGlwc3VtIGRvbG9yIHNpdCBhbWV0Jyk7XG4gICAgICAgICAgICBleHBlY3QocG9zMDAuY2hhcigpLnZhbHVlKS50by5iZS5lcWwoJ0wnKTtcbiAgICAgICAgICAgIGV4cGVjdChwb3MwMC5pbmNyUG9zKCkuaW5jclBvcygpLmluY3JQb3MoKS5pbmNyUG9zKClcbiAgICAgICAgICAgICAgICAuY2hhcigpLnZhbHVlKS50by5iZS5lcWwoJ20nKTtcbiAgICAgICAgfSk7XG4gICAgICAgIGl0KCdjYW4gYmUgaW5pdGlhbGl6ZWQgYWxzbyBmcm9tIG11bHRpbGluZSB0ZXh0IHN0cmluZ3MsIHN0cmlwcGluZyBuZXdsaW5lcyBhd2F5JywgKCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgcG9zMDAgPSBQb3NpdGlvbi5mcm9tVGV4dCgnTG9yZW0gXFxuaXBzdW0nKTtcbiAgICAgICAgICAgIGV4cGVjdChwb3MwMC5jaGFyKCkudmFsdWUpLnRvLmJlLmVxbCgnTCcpO1xuICAgICAgICAgICAgZXhwZWN0KHBvczAwLmluY3JQb3MoKS5pbmNyUG9zKCkuaW5jclBvcygpLmluY3JQb3MoKS5pbmNyUG9zKCkuaW5jclBvcygpXG4gICAgICAgICAgICAgICAgLmNoYXIoKS52YWx1ZSkudG8uYmUuZXFsKCdpJyk7XG4gICAgICAgIH0pO1xuICAgICAgICBpdCgncmV0dXJuIHN0cmluZ3MgY29udGFpbmluZyBhbGwgY2hhcmFjdGVycyBzdGFydGluZyBmcm9tIGEgZ2l2ZW4gcG9zaXRpb24sIGZvciB0aGUgc2FrZSBvZiB0ZXN0aW5nJywgKCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgcG9zMDEgPSBQb3NpdGlvbi5mcm9tVGV4dCgnTG9yZW0nKS5pbmNyUG9zKCk7XG4gICAgICAgICAgICBleHBlY3QocG9zMDEucmVzdCgpKS50by5iZS5lcWwoJ29yZW0nKTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICBkZXNjcmliZSgnc29tZXMnLCAoKSA9PiB7XG4gICAgICAgIGl0KCdpbmNsdWRlIGEgdmFsdWUgYW5kIGFsbG93IHRvIHJldHJpZXZlIGl0JywgKCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgYVNvbWUgPSBzb21lKDEyKTtcbiAgICAgICAgICAgIGV4cGVjdChhU29tZS52YWwoKSkudG8uYmUuZXFsKDEyKTtcbiAgICAgICAgICAgIGV4cGVjdChpc1NvbWUoYVNvbWUpKS50by5iZS50cnVlO1xuICAgICAgICAgICAgZXhwZWN0KGFTb21lLnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgnc29tZSgxMiknKTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICBkZXNjcmliZSgnbm9uZXMnLCAoKSA9PiB7XG4gICAgICAgIGl0KCdhcmUganVzdCBhIHNpZ25wb3N0JywgKCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgYU5vbmUgPSBub25lKCk7XG4gICAgICAgICAgICBleHBlY3QoYU5vbmUudmFsKCkpLnRvLmJlLm51bGw7XG4gICAgICAgICAgICBleHBlY3QoaXNOb25lKGFOb25lKSkudG8uYmUudHJ1ZTtcbiAgICAgICAgICAgIGV4cGVjdChhTm9uZS50b1N0cmluZygpKS50by5iZS5lcWwoJ25vbmUoKScpO1xuICAgICAgICB9KTtcbiAgICB9KTtcblxuICAgIGRlc2NyaWJlKCdwYWlycycsICgpID0+IHtcbiAgICAgICAgaXQoJ2luY2x1ZGUgMiB2YWx1ZXMgYW5kIGFsbG93IHRvIHJldHJpZXZlIHRoZW0nLCAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBhcGFpciA9IHBhaXIodHJ1ZSwgMTIpO1xuICAgICAgICAgICAgZXhwZWN0KGFwYWlyWzBdKS50by5iZS5lcWwodHJ1ZSk7XG4gICAgICAgICAgICBleHBlY3QoYXBhaXJbMV0pLnRvLmJlLmVxbCgxMik7XG4gICAgICAgICAgICBleHBlY3QoYXBhaXIudHlwZSkudG8uYmUuZXFsKCdwYWlyJyk7XG4gICAgICAgICAgICBleHBlY3QoaXNQYWlyKGFwYWlyKSkudG8uYmUudHJ1ZTtcbiAgICAgICAgfSk7XG4gICAgICAgIGl0KCdhcmUgYWN0dWFsbHkgYXJyYXlzLCBhbmQgdGhlcmVmb3JlIGFsbG93IHBvc2l0aW9uYWwgZGVzdHJ1Y3R1cmluZycsICgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IFthLCBiXSA9IHBhaXIodHJ1ZSwgMTIpO1xuICAgICAgICAgICAgZXhwZWN0KGEpLnRvLmJlLmVxbCh0cnVlKTtcbiAgICAgICAgICAgIGV4cGVjdChiKS50by5iZS5lcWwoMTIpO1xuICAgICAgICB9KTtcbiAgICB9KTtcblxuICAgIGRlc2NyaWJlKCdQYWlyXFwncycsICgpID0+IHtcbiAgICAgICAgaXQoJ2luY2x1ZGUgMiB2YWx1ZXMgYW5kIGFsbG93IHRvIHJldHJpZXZlIHRoZW0nLCAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBhcGFpciA9IFR1cGxlLlBhaXIodHJ1ZSwgMTIpO1xuICAgICAgICAgICAgZXhwZWN0KGFwYWlyWzBdKS50by5iZS5lcWwodHJ1ZSk7XG4gICAgICAgICAgICBleHBlY3QoYXBhaXJbMV0pLnRvLmJlLmVxbCgxMik7XG4gICAgICAgICAgICBleHBlY3QoYXBhaXIudHlwZSkudG8uYmUuZXFsKCdwYWlyJyk7XG4gICAgICAgICAgICBleHBlY3QoYXBhaXIuaXNQYWlyKS50by5iZS50cnVlO1xuICAgICAgICAgICAgZXhwZWN0KGFwYWlyLnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgnW3RydWUsMTJdJyk7XG4gICAgICAgIH0pO1xuICAgICAgICBpdCgnYXJlIGltbXV0YWJsZSwgYW5kIHRocm93IGlmIHlvdSB0cnkgdG8gY2hhbmdlIHRoZW0nLCAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBhcGFpciA9IFR1cGxlLlBhaXIodHJ1ZSwgMTIpO1xuICAgICAgICAgICAgZXhwZWN0KCgpID0+IHthdHJpcGxlWzBdID0gZmFsc2U7fSkudG8udGhyb3c7XG4gICAgICAgICAgICBleHBlY3QoKCkgPT4ge2F0cmlwbGVbMV0gPSAxMzt9KS50by50aHJvdztcbiAgICAgICAgfSk7XG4gICAgICAgIGl0KCdhcmUgdHJ1ZSBpdGVyYWJsZXMsIGFuZCB0aGVyZWZvcmUgYWxsb3cgcG9zaXRpb25hbCBkZXN0cnVjdHVyaW5nJywgKCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgW2EsIGJdID0gVHVwbGUuUGFpcih0cnVlLCAxMik7XG4gICAgICAgICAgICBleHBlY3QoYSkudG8uYmUuZXFsKHRydWUpO1xuICAgICAgICAgICAgZXhwZWN0KGIpLnRvLmJlLmVxbCgxMik7XG4gICAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgZGVzY3JpYmUoJ1RyaXBsZVxcJ3MnLCAoKSA9PiB7XG4gICAgICAgIGl0KCdpbmNsdWRlIDMgdmFsdWVzIGFuZCBhbGxvdyB0byByZXRyaWV2ZSB0aGVtJywgKCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgYXRyaXBsZSA9IFR1cGxlLlRyaXBsZSh0cnVlLCAxMiwgJ2EnKTtcbiAgICAgICAgICAgIGV4cGVjdChhdHJpcGxlWzBdKS50by5iZS5lcWwodHJ1ZSk7XG4gICAgICAgICAgICBleHBlY3QoYXRyaXBsZVsxXSkudG8uYmUuZXFsKDEyKTtcbiAgICAgICAgICAgIGV4cGVjdChhdHJpcGxlWzJdKS50by5iZS5lcWwoJ2EnKTtcbiAgICAgICAgICAgIGV4cGVjdChhdHJpcGxlLnR5cGUpLnRvLmJlLmVxbCgndHJpcGxlJyk7XG4gICAgICAgICAgICBleHBlY3QoYXRyaXBsZS5pc1RyaXBsZSkudG8uYmUudHJ1ZTtcbiAgICAgICAgICAgIGV4cGVjdChhdHJpcGxlLnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgnW3RydWUsMTIsYV0nKTtcbiAgICAgICAgfSk7XG4gICAgICAgIGl0KCdhcmUgaW1tdXRhYmxlLCBhbmQgdGhyb3cgaWYgeW91IHRyeSB0byBjaGFuZ2UgdGhlbScsICgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGF0cmlwbGUgPSBUdXBsZS5UcmlwbGUodHJ1ZSwgMTIsICdhJyk7XG4gICAgICAgICAgICBleHBlY3QoKCkgPT4ge2F0cmlwbGVbMF0gPSBmYWxzZTt9KS50by50aHJvdztcbiAgICAgICAgICAgIGV4cGVjdCgoKSA9PiB7YXRyaXBsZVsxXSA9IDEzO30pLnRvLnRocm93O1xuICAgICAgICAgICAgZXhwZWN0KCgpID0+IHthdHJpcGxlWzJdID0gJ2InO30pLnRvLnRocm93O1xuICAgICAgICB9KTtcbiAgICAgICAgaXQoJ2FyZSB0cnVlIGl0ZXJhYmxlcywgYW5kIHRoZXJlZm9yZSBhbGxvdyBwb3NpdGlvbmFsIGRlc3RydWN0dXJpbmcnLCAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBbYSwgYiwgY10gPSBUdXBsZS5UcmlwbGUodHJ1ZSwgMTIsICdhJyk7XG4gICAgICAgICAgICBleHBlY3QoYSkudG8uYmUuZXFsKHRydWUpO1xuICAgICAgICAgICAgZXhwZWN0KGIpLnRvLmJlLmVxbCgxMik7XG4gICAgICAgICAgICBleHBlY3QoYykudG8uYmUuZXFsKCdhJyk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgZGVzY3JpYmUoJ3N1Y2Nlc3MgYW5kIGZhaWx1cmUnLCAoKSA9PiB7XG4gICAgICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgICB9KTtcbiAgICAgICAgaXQoJ21heSByZXByZXNlbnQgc3VjY2Vzc2VzJywgKCkgPT4ge1xuICAgICAgICAgICAgY29uc3Qgc3VjYyA9IHN1Y2Nlc3ModHJ1ZSwgMTIpO1xuICAgICAgICAgICAgZXhwZWN0KHN1Y2NbMF0pLnRvLmJlLnRydWU7XG4gICAgICAgICAgICBleHBlY3Qoc3VjY1sxXSkudG8uYmUuZXFsKDEyKTtcbiAgICAgICAgICAgIGV4cGVjdChpc1N1Y2Nlc3Moc3VjYykpLnRvLmJlLnRydWU7XG4gICAgICAgICAgICBleHBlY3QoaXNQYWlyKHN1Y2MpKS50by5iZS50cnVlO1xuICAgICAgICB9KTtcbiAgICAgICAgaXQoJ21heSByZXByZXNlbnQgZmFpbHVyZXMnLCAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBmYWlsID0gZmFpbHVyZSgnYScsIDEyKTtcbiAgICAgICAgICAgIGV4cGVjdChmYWlsWzBdKS50by5iZS5lcWwoJ2EnKTtcbiAgICAgICAgICAgIGV4cGVjdChmYWlsWzFdKS50by5iZS5lcWwoMTIpO1xuICAgICAgICAgICAgZXhwZWN0KGlzU3VjY2VzcyhmYWlsKSkudG8uYmUuZmFsc2U7XG4gICAgICAgICAgICBleHBlY3QoaXNGYWlsdXJlKGZhaWwpKS50by5iZS50cnVlO1xuICAgICAgICAgICAgZXhwZWN0KGlzUGFpcihmYWlsKSkudG8uYmUudHJ1ZTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG59KTtcbiJdfQ==