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
                var pos00 = _classes.Position.fromText("Lorem ipsum dolor sit amet");
                (0, _chai.expect)(pos00.char().value).to.be.eql('L');
                (0, _chai.expect)(pos00.incrPos().incrPos().incrPos().incrPos().char().value).to.be.eql('m');
            });
            it('can be initialized also from multiline text strings, stripping newlines away', function () {
                var pos00 = _classes.Position.fromText("Lorem \nipsum");
                (0, _chai.expect)(pos00.char().value).to.be.eql('L');
                (0, _chai.expect)(pos00.incrPos().incrPos().incrPos().incrPos().incrPos().incrPos().char().value).to.be.eql('i');
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2pzLXNwZWMvY2xhc3Nlc190ZXN0cy5qcyJdLCJuYW1lcyI6WyJkZXNjcmliZSIsInJvd3MiLCJpdCIsInBvczAwIiwiaXNQb3NpdGlvbiIsInRvIiwiYmUiLCJ0cnVlIiwiY2hhciIsImlzSnVzdCIsInZhbHVlIiwiZXFsIiwicG9zMTEiLCJwb3MwMSIsImluY3JQb3MiLCJwb3MyMCIsInBvczEwMTAiLCJpc05vdGhpbmciLCJwb3MyMyIsImZyb21UZXh0IiwiYVNvbWUiLCJ2YWwiLCJ0b1N0cmluZyIsImFOb25lIiwibnVsbCIsImFwYWlyIiwidHlwZSIsImEiLCJiIiwiUGFpciIsImlzUGFpciIsImF0cmlwbGUiLCJUcmlwbGUiLCJpc1RyaXBsZSIsImMiLCJiZWZvcmVFYWNoIiwic3VjYyIsImZhaWwiLCJmYWxzZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFrQkFBLGFBQVMsc0JBQVQsRUFBaUMsWUFBTTs7QUFFbkNBLGlCQUFTLGFBQVQsRUFBd0IsWUFBTTtBQUMxQixnQkFBTUMsT0FBTyxDQUNULENBQUMsQ0FBRCxFQUFJLENBQUosRUFBTyxDQUFQLENBRFMsRUFFVCxDQUFDLEdBQUQsRUFBTSxHQUFOLEVBQVcsR0FBWCxFQUFnQixHQUFoQixDQUZTLEVBR1QsQ0FBQyxHQUFELEVBQU0sR0FBTixFQUFXLEdBQVgsQ0FIUyxDQUFiO0FBS0FDLGVBQUcsNERBQUgsRUFBaUUsWUFBTTtBQUNuRSxvQkFBTUMsUUFBUSx1QkFBU0YsSUFBVCxFQUFlLENBQWYsRUFBa0IsQ0FBbEIsQ0FBZDtBQUNBLGtDQUFPRSxNQUFNQyxVQUFiLEVBQXlCQyxFQUF6QixDQUE0QkMsRUFBNUIsQ0FBK0JDLElBQS9CO0FBQ0Esa0NBQU9KLE1BQU1LLElBQU4sR0FBYUMsTUFBcEIsRUFBNEJKLEVBQTVCLENBQStCQyxFQUEvQixDQUFrQ0MsSUFBbEM7QUFDQSxrQ0FBT0osTUFBTUssSUFBTixHQUFhRSxLQUFw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QUEzQixDQUE4QmdDLEtBQTlCO0FBQ0Esa0NBQU8scUJBQVVELElBQVYsQ0FBUCxFQUF3QmhDLEVBQXhCLENBQTJCQyxFQUEzQixDQUE4QkMsSUFBOUI7QUFDQSxrQ0FBTyxrQkFBTzhCLElBQVAsQ0FBUCxFQUFxQmhDLEVBQXJCLENBQXdCQyxFQUF4QixDQUEyQkMsSUFBM0I7QUFDSCxhQVBEO0FBUUgsU0FsQkQ7QUFtQkgsS0FqSUQiLCJmaWxlIjoiY2xhc3Nlc190ZXN0cy5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7ZXhwZWN0fSBmcm9tICdjaGFpJztcbmltcG9ydCB7XG4gICAgaXNQYWlyLFxuICAgIGlzU3VjY2VzcyxcbiAgICBpc0ZhaWx1cmUsXG4gICAgaXNTb21lLFxuICAgIGlzTm9uZSxcbn0gZnJvbSAndXRpbCc7XG5pbXBvcnQge1xuICAgIHBhaXIsXG4gICAgc3VjY2VzcyxcbiAgICBmYWlsdXJlLFxuICAgIHNvbWUsXG4gICAgbm9uZSxcbiAgICBQb3NpdGlvbixcbiAgICBUdXBsZSxcbn0gZnJvbSAnY2xhc3Nlcyc7XG5cbmRlc2NyaWJlKCdhbW9uZyBoZWxwZXIgY2xhc3NlcycsICgpID0+IHtcblxuICAgIGRlc2NyaWJlKCdQb3NpdGlvblxcJ3MnLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHJvd3MgPSBbXG4gICAgICAgICAgICBbMSwgMiwgM10sXG4gICAgICAgICAgICBbJ2EnLCAnYicsICdjJywgJ2QnXSxcbiAgICAgICAgICAgIFsnQScsICdCJywgJ0MnXSxcbiAgICAgICAgXTtcbiAgICAgICAgaXQoJ2luY2x1ZGUgdGFibGVzIG9mIGNoYXJzIGFuZCBhbGxvdyB0byByZXRyaWV2ZSBjaGFyIG9wdGlvbnMnLCAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBwb3MwMCA9IFBvc2l0aW9uKHJvd3MsIDAsIDApO1xuICAgICAgICAgICAgZXhwZWN0KHBvczAwLmlzUG9zaXRpb24pLnRvLmJlLnRydWU7XG4gICAgICAgICAgICBleHBlY3QocG9zMDAuY2hhcigpLmlzSnVzdCkudG8uYmUudHJ1ZTtcbiAgICAgICAgICAgIGV4cGVjdChwb3MwMC5jaGFyKCkudmFsdWUpLnRvLmJlLmVxbCgxKTtcbiAgICAgICAgICAgIGNvbnN0IHBvczExID0gUG9zaXRpb24ocm93cywgMSwgMSk7XG4gICAgICAgICAgICBleHBlY3QocG9zMTEuY2hhcigpLmlzSnVzdCkudG8uYmUudHJ1ZTtcbiAgICAgICAgICAgIGV4cGVjdChwb3MxMS5jaGFyKCkudmFsdWUpLnRvLmJlLmVxbCgnYicpO1xuICAgICAgICB9KTtcbiAgICAgICAgaXQoJ2FsbG93IHRvIGluY3JlbWVudCB0aGUgcG9zaXRpb24gYW5kIHJldHJpZXZlIGZ1cnRoZXIgY2hhcnMnLCAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBwb3MwMSA9IFBvc2l0aW9uKHJvd3MsIDAsIDApLmluY3JQb3MoKTtcbiAgICAgICAgICAgIGV4cGVjdChwb3MwMS5jaGFyKCkudmFsdWUpLnRvLmJlLmVxbCgyKTtcbiAgICAgICAgICAgIGNvbnN0IHBvczIwID0gUG9zaXRpb24ocm93cywgMSwgMykuaW5jclBvcygpO1xuICAgICAgICAgICAgZXhwZWN0KHBvczIwLmNoYXIoKS52YWx1ZSkudG8uYmUuZXFsKCdBJyk7XG4gICAgICAgIH0pO1xuICAgICAgICBpdCgncmV0dXJuIE5vdGhpbmcgd2hlbiBwb3NpdGlvbiBpcyBiZXlvbmQgdGhlIGNvbnRhaW5lZCByb3dzIGNvbnRlbnQnLCAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBwb3MxMDEwID0gUG9zaXRpb24ocm93cywgMTAsIDEwKTtcbiAgICAgICAgICAgIGV4cGVjdChwb3MxMDEwLmNoYXIoKS5pc05vdGhpbmcpLnRvLmJlLnRydWU7XG4gICAgICAgICAgICBjb25zdCBwb3MyMyA9IFBvc2l0aW9uKHJvd3MsIDIsIDIpLmluY3JQb3MoKTtcbiAgICAgICAgICAgIGV4cGVjdChwb3MyMy5jaGFyKCkuaXNOb3RoaW5nKS50by5iZS50cnVlO1xuICAgICAgICB9KTtcbiAgICAgICAgaXQoJ2NhbiBiZSBpbml0aWFsaXplZCBmcm9tIHRleHQgc3RyaW5ncycsICgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHBvczAwID0gUG9zaXRpb24uZnJvbVRleHQoXCJMb3JlbSBpcHN1bSBkb2xvciBzaXQgYW1ldFwiKTtcbiAgICAgICAgICAgIGV4cGVjdChwb3MwMC5jaGFyKCkudmFsdWUpLnRvLmJlLmVxbCgnTCcpO1xuICAgICAgICAgICAgZXhwZWN0KHBvczAwLmluY3JQb3MoKS5pbmNyUG9zKCkuaW5jclBvcygpLmluY3JQb3MoKVxuICAgICAgICAgICAgICAgIC5jaGFyKCkudmFsdWUpLnRvLmJlLmVxbCgnbScpO1xuICAgICAgICB9KTtcbiAgICAgICAgaXQoJ2NhbiBiZSBpbml0aWFsaXplZCBhbHNvIGZyb20gbXVsdGlsaW5lIHRleHQgc3RyaW5ncywgc3RyaXBwaW5nIG5ld2xpbmVzIGF3YXknLCAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBwb3MwMCA9IFBvc2l0aW9uLmZyb21UZXh0KFwiTG9yZW0gXFxuaXBzdW1cIik7XG4gICAgICAgICAgICBleHBlY3QocG9zMDAuY2hhcigpLnZhbHVlKS50by5iZS5lcWwoJ0wnKTtcbiAgICAgICAgICAgIGV4cGVjdChwb3MwMC5pbmNyUG9zKCkuaW5jclBvcygpLmluY3JQb3MoKS5pbmNyUG9zKCkuaW5jclBvcygpLmluY3JQb3MoKVxuICAgICAgICAgICAgICAgIC5jaGFyKCkudmFsdWUpLnRvLmJlLmVxbCgnaScpO1xuICAgICAgICB9KTtcbiAgICB9KTtcblxuICAgIGRlc2NyaWJlKCdzb21lcycsICgpID0+IHtcbiAgICAgICAgaXQoJ2luY2x1ZGUgYSB2YWx1ZSBhbmQgYWxsb3cgdG8gcmV0cmlldmUgaXQnLCAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBhU29tZSA9IHNvbWUoMTIpO1xuICAgICAgICAgICAgZXhwZWN0KGFTb21lLnZhbCgpKS50by5iZS5lcWwoMTIpO1xuICAgICAgICAgICAgZXhwZWN0KGlzU29tZShhU29tZSkpLnRvLmJlLnRydWU7XG4gICAgICAgICAgICBleHBlY3QoYVNvbWUudG9TdHJpbmcoKSkudG8uYmUuZXFsKCdzb21lKDEyKScpO1xuICAgICAgICB9KTtcbiAgICB9KTtcblxuICAgIGRlc2NyaWJlKCdub25lcycsICgpID0+IHtcbiAgICAgICAgaXQoJ2FyZSBqdXN0IGEgc2lnbnBvc3QnLCAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBhTm9uZSA9IG5vbmUoKTtcbiAgICAgICAgICAgIGV4cGVjdChhTm9uZS52YWwoKSkudG8uYmUubnVsbDtcbiAgICAgICAgICAgIGV4cGVjdChpc05vbmUoYU5vbmUpKS50by5iZS50cnVlO1xuICAgICAgICAgICAgZXhwZWN0KGFOb25lLnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgnbm9uZSgpJyk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgZGVzY3JpYmUoJ3BhaXJzJywgKCkgPT4ge1xuICAgICAgICBpdCgnaW5jbHVkZSAyIHZhbHVlcyBhbmQgYWxsb3cgdG8gcmV0cmlldmUgdGhlbScsICgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGFwYWlyID0gcGFpcih0cnVlLCAxMik7XG4gICAgICAgICAgICBleHBlY3QoYXBhaXJbMF0pLnRvLmJlLmVxbCh0cnVlKTtcbiAgICAgICAgICAgIGV4cGVjdChhcGFpclsxXSkudG8uYmUuZXFsKDEyKTtcbiAgICAgICAgICAgIGV4cGVjdChhcGFpci50eXBlKS50by5iZS5lcWwoJ3BhaXInKTtcbiAgICAgICAgICAgIGV4cGVjdChpc1BhaXIoYXBhaXIpKS50by5iZS50cnVlO1xuICAgICAgICB9KTtcbiAgICAgICAgaXQoJ2FyZSBhY3R1YWxseSBhcnJheXMsIGFuZCB0aGVyZWZvcmUgYWxsb3cgcG9zaXRpb25hbCBkZXN0cnVjdHVyaW5nJywgKCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgW2EsIGJdID0gcGFpcih0cnVlLCAxMik7XG4gICAgICAgICAgICBleHBlY3QoYSkudG8uYmUuZXFsKHRydWUpO1xuICAgICAgICAgICAgZXhwZWN0KGIpLnRvLmJlLmVxbCgxMik7XG4gICAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgZGVzY3JpYmUoJ1BhaXJcXCdzJywgKCkgPT4ge1xuICAgICAgICBpdCgnaW5jbHVkZSAyIHZhbHVlcyBhbmQgYWxsb3cgdG8gcmV0cmlldmUgdGhlbScsICgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGFwYWlyID0gVHVwbGUuUGFpcih0cnVlLCAxMik7XG4gICAgICAgICAgICBleHBlY3QoYXBhaXJbMF0pLnRvLmJlLmVxbCh0cnVlKTtcbiAgICAgICAgICAgIGV4cGVjdChhcGFpclsxXSkudG8uYmUuZXFsKDEyKTtcbiAgICAgICAgICAgIGV4cGVjdChhcGFpci50eXBlKS50by5iZS5lcWwoJ3BhaXInKTtcbiAgICAgICAgICAgIGV4cGVjdChhcGFpci5pc1BhaXIpLnRvLmJlLnRydWU7XG4gICAgICAgICAgICBleHBlY3QoYXBhaXIudG9TdHJpbmcoKSkudG8uYmUuZXFsKCdbdHJ1ZSwxMl0nKTtcbiAgICAgICAgfSk7XG4gICAgICAgIGl0KCdhcmUgdHJ1ZSBpdGVyYWJsZXMsIGFuZCB0aGVyZWZvcmUgYWxsb3cgcG9zaXRpb25hbCBkZXN0cnVjdHVyaW5nJywgKCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgW2EsIGJdID0gVHVwbGUuUGFpcih0cnVlLCAxMik7XG4gICAgICAgICAgICBleHBlY3QoYSkudG8uYmUuZXFsKHRydWUpO1xuICAgICAgICAgICAgZXhwZWN0KGIpLnRvLmJlLmVxbCgxMik7XG4gICAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgZGVzY3JpYmUoJ1RyaXBsZVxcJ3MnLCAoKSA9PiB7XG4gICAgICAgIGl0KCdpbmNsdWRlIDMgdmFsdWVzIGFuZCBhbGxvdyB0byByZXRyaWV2ZSB0aGVtJywgKCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgYXRyaXBsZSA9IFR1cGxlLlRyaXBsZSh0cnVlLCAxMiwgJ2EnKTtcbiAgICAgICAgICAgIGV4cGVjdChhdHJpcGxlWzBdKS50by5iZS5lcWwodHJ1ZSk7XG4gICAgICAgICAgICBleHBlY3QoYXRyaXBsZVsxXSkudG8uYmUuZXFsKDEyKTtcbiAgICAgICAgICAgIGV4cGVjdChhdHJpcGxlWzJdKS50by5iZS5lcWwoJ2EnKTtcbiAgICAgICAgICAgIGV4cGVjdChhdHJpcGxlLnR5cGUpLnRvLmJlLmVxbCgndHJpcGxlJyk7XG4gICAgICAgICAgICBleHBlY3QoYXRyaXBsZS5pc1RyaXBsZSkudG8uYmUudHJ1ZTtcbiAgICAgICAgICAgIGV4cGVjdChhdHJpcGxlLnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgnW3RydWUsMTIsYV0nKTtcbiAgICAgICAgfSk7XG4gICAgICAgIGl0KCdhcmUgdHJ1ZSBpdGVyYWJsZXMsIGFuZCB0aGVyZWZvcmUgYWxsb3cgcG9zaXRpb25hbCBkZXN0cnVjdHVyaW5nJywgKCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgW2EsIGIsIGNdID0gVHVwbGUuVHJpcGxlKHRydWUsIDEyLCAnYScpO1xuICAgICAgICAgICAgZXhwZWN0KGEpLnRvLmJlLmVxbCh0cnVlKTtcbiAgICAgICAgICAgIGV4cGVjdChiKS50by5iZS5lcWwoMTIpO1xuICAgICAgICAgICAgZXhwZWN0KGMpLnRvLmJlLmVxbCgnYScpO1xuICAgICAgICB9KTtcbiAgICB9KTtcblxuICAgIGRlc2NyaWJlKCdzdWNjZXNzIGFuZCBmYWlsdXJlJywgKCkgPT4ge1xuICAgICAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgICAgfSk7XG4gICAgICAgIGl0KCdtYXkgcmVwcmVzZW50IHN1Y2Nlc3NlcycsICgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHN1Y2MgPSBzdWNjZXNzKHRydWUsIDEyKTtcbiAgICAgICAgICAgIGV4cGVjdChzdWNjWzBdKS50by5iZS50cnVlO1xuICAgICAgICAgICAgZXhwZWN0KHN1Y2NbMV0pLnRvLmJlLmVxbCgxMik7XG4gICAgICAgICAgICBleHBlY3QoaXNTdWNjZXNzKHN1Y2MpKS50by5iZS50cnVlO1xuICAgICAgICAgICAgZXhwZWN0KGlzUGFpcihzdWNjKSkudG8uYmUudHJ1ZTtcbiAgICAgICAgfSk7XG4gICAgICAgIGl0KCdtYXkgcmVwcmVzZW50IGZhaWx1cmVzJywgKCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgZmFpbCA9IGZhaWx1cmUoJ2EnLCAxMik7XG4gICAgICAgICAgICBleHBlY3QoZmFpbFswXSkudG8uYmUuZXFsKCdhJyk7XG4gICAgICAgICAgICBleHBlY3QoZmFpbFsxXSkudG8uYmUuZXFsKDEyKTtcbiAgICAgICAgICAgIGV4cGVjdChpc1N1Y2Nlc3MoZmFpbCkpLnRvLmJlLmZhbHNlO1xuICAgICAgICAgICAgZXhwZWN0KGlzRmFpbHVyZShmYWlsKSkudG8uYmUudHJ1ZTtcbiAgICAgICAgICAgIGV4cGVjdChpc1BhaXIoZmFpbCkpLnRvLmJlLnRydWU7XG4gICAgICAgIH0pO1xuICAgIH0pO1xufSk7XG4iXX0=