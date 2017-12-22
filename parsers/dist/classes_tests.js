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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2pzLXNwZWMvY2xhc3Nlc190ZXN0cy5qcyJdLCJuYW1lcyI6WyJkZXNjcmliZSIsIml0IiwiYVNvbWUiLCJ2YWwiLCJ0byIsImJlIiwiZXFsIiwidHJ1ZSIsInRvU3RyaW5nIiwiYU5vbmUiLCJudWxsIiwiYXBhaXIiLCJ0eXBlIiwiYSIsImIiLCJQYWlyIiwiaXNQYWlyIiwiYXRyaXBsZSIsIlRyaXBsZSIsImlzVHJpcGxlIiwiYyIsImJlZm9yZUVhY2giLCJzdWNjIiwiZmFpbCIsImZhbHNlIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQWlCQUEsYUFBUyxzQkFBVCxFQUFpQyxZQUFNOztBQUVuQ0EsaUJBQVMsT0FBVCxFQUFrQixZQUFNO0FBQ3BCQyxlQUFHLDBDQUFILEVBQStDLFlBQU07QUFDakQsb0JBQU1DLFFBQVEsbUJBQUssRUFBTCxDQUFkO0FBQ0Esa0NBQU9BLE1BQU1DLEdBQU4sRUFBUCxFQUFvQkMsRUFBcEIsQ0FBdUJDLEVBQXZCLENBQTBCQyxHQUExQixDQUE4QixFQUE5QjtBQUNBLGtDQUFPLGtCQUFPSixLQUFQLENBQVAsRUFBc0JFLEVBQXRCLENBQXlCQyxFQUF6QixDQUE0QkUsSUFBNUI7QUFDQSxrQ0FBT0wsTUFBTU0sUUFBTixFQUFQLEVBQXlCSixFQUF6QixDQUE0QkMsRUFBNUIsQ0FBK0JDLEdBQS9CLENBQW1DLFVBQW5DO0FBQ0gsYUFMRDtBQU1ILFNBUEQ7O0FBU0FOLGlCQUFTLE9BQVQsRUFBa0IsWUFBTTtBQUNwQkMsZUFBRyxxQkFBSCxFQUEwQixZQUFNO0FBQzVCLG9CQUFNUSxRQUFRLG9CQUFkO0FBQ0Esa0NBQU9BLE1BQU1OLEdBQU4sRUFBUCxFQUFvQkMsRUFBcEIsQ0FBdUJDLEVBQXZCLENBQTBCSyxJQUExQjtBQUNBLGtDQUFPLGtCQUFPRCxLQUFQLENBQVAsRUFBc0JMLEVBQXRCLENBQXlCQyxFQUF6QixDQUE0QkUsSUFBNUI7QUFDQSxrQ0FBT0Us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Q0FBTCxDQUFQLEVBQWdCbEIsRUFBaEIsQ0FBbUJDLEVBQW5CLENBQXNCQyxHQUF0QixDQUEwQixFQUExQjtBQUNBLGtDQUFPLHFCQUFVZ0IsSUFBVixDQUFQLEVBQXdCbEIsRUFBeEIsQ0FBMkJDLEVBQTNCLENBQThCRSxJQUE5QjtBQUNBLGtDQUFPLGtCQUFPZSxJQUFQLENBQVAsRUFBcUJsQixFQUFyQixDQUF3QkMsRUFBeEIsQ0FBMkJFLElBQTNCO0FBQ0gsYUFORDtBQU9BTixlQUFHLHdCQUFILEVBQTZCLFlBQU07QUFDL0Isb0JBQU1zQixPQUFPLHNCQUFRLEdBQVIsRUFBYSxFQUFiLENBQWI7QUFDQSxrQ0FBT0EsS0FBSyxDQUFMLENBQVAsRUFBZ0JuQixFQUFoQixDQUFtQkMsRUFBbkIsQ0FBc0JDLEdBQXRCLENBQTBCLEdBQTFCO0FBQ0Esa0NBQU9pQixLQUFLLENBQUwsQ0FBUCxFQUFnQm5CLEVBQWhCLENBQW1CQyxFQUFuQixDQUFzQkMsR0FBdEIsQ0FBMEIsRUFBMUI7QUFDQSxrQ0FBTyxxQkFBVWlCLElBQVYsQ0FBUCxFQUF3Qm5CLEVBQXhCLENBQTJCQyxFQUEzQixDQUE4Qm1CLEtBQTlCO0FBQ0Esa0NBQU8scUJBQVVELElBQVYsQ0FBUCxFQUF3Qm5CLEVBQXhCLENBQTJCQyxFQUEzQixDQUE4QkUsSUFBOUI7QUFDQSxrQ0FBTyxrQkFBT2dCLElBQVAsQ0FBUCxFQUFxQm5CLEVBQXJCLENBQXdCQyxFQUF4QixDQUEyQkUsSUFBM0I7QUFDSCxhQVBEO0FBUUgsU0FsQkQ7QUFvQkgsS0F6RkQiLCJmaWxlIjoiY2xhc3Nlc190ZXN0cy5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7ZXhwZWN0fSBmcm9tICdjaGFpJztcbmltcG9ydCB7XG4gICAgaXNQYWlyLFxuICAgIGlzU3VjY2VzcyxcbiAgICBpc0ZhaWx1cmUsXG4gICAgaXNTb21lLFxuICAgIGlzTm9uZSxcbn0gZnJvbSAndXRpbCc7XG5pbXBvcnQge1xuICAgIHBhaXIsXG4gICAgc3VjY2VzcyxcbiAgICBmYWlsdXJlLFxuICAgIHNvbWUsXG4gICAgbm9uZSxcbiAgICBUdXBsZSxcbn0gZnJvbSAnY2xhc3Nlcyc7XG5cbmRlc2NyaWJlKCdhbW9uZyBoZWxwZXIgY2xhc3NlcycsICgpID0+IHtcblxuICAgIGRlc2NyaWJlKCdzb21lcycsICgpID0+IHtcbiAgICAgICAgaXQoJ2luY2x1ZGUgYSB2YWx1ZSBhbmQgYWxsb3cgdG8gcmV0cmlldmUgaXQnLCAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBhU29tZSA9IHNvbWUoMTIpO1xuICAgICAgICAgICAgZXhwZWN0KGFTb21lLnZhbCgpKS50by5iZS5lcWwoMTIpO1xuICAgICAgICAgICAgZXhwZWN0KGlzU29tZShhU29tZSkpLnRvLmJlLnRydWU7XG4gICAgICAgICAgICBleHBlY3QoYVNvbWUudG9TdHJpbmcoKSkudG8uYmUuZXFsKCdzb21lKDEyKScpO1xuICAgICAgICB9KTtcbiAgICB9KTtcblxuICAgIGRlc2NyaWJlKCdub25lcycsICgpID0+IHtcbiAgICAgICAgaXQoJ2FyZSBqdXN0IGEgc2lnbnBvc3QnLCAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBhTm9uZSA9IG5vbmUoKTtcbiAgICAgICAgICAgIGV4cGVjdChhTm9uZS52YWwoKSkudG8uYmUubnVsbDtcbiAgICAgICAgICAgIGV4cGVjdChpc05vbmUoYU5vbmUpKS50by5iZS50cnVlO1xuICAgICAgICAgICAgZXhwZWN0KGFOb25lLnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgnbm9uZSgpJyk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgZGVzY3JpYmUoJ3BhaXJzJywgKCkgPT4ge1xuICAgICAgICBpdCgnaW5jbHVkZSAyIHZhbHVlcyBhbmQgYWxsb3cgdG8gcmV0cmlldmUgdGhlbScsICgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGFwYWlyID0gcGFpcih0cnVlLCAxMik7XG4gICAgICAgICAgICBleHBlY3QoYXBhaXJbMF0pLnRvLmJlLmVxbCh0cnVlKTtcbiAgICAgICAgICAgIGV4cGVjdChhcGFpclsxXSkudG8uYmUuZXFsKDEyKTtcbiAgICAgICAgICAgIGV4cGVjdChhcGFpci50eXBlKS50by5iZS5lcWwoJ3BhaXInKTtcbiAgICAgICAgICAgIGV4cGVjdChpc1BhaXIoYXBhaXIpKS50by5iZS50cnVlO1xuICAgICAgICB9KTtcbiAgICAgICAgaXQoJ2FyZSBhY3R1YWxseSBhcnJheXMsIGFuZCB0aGVyZWZvcmUgYWxsb3cgcG9zaXRpb25hbCBkZXN0cnVjdHVyaW5nJywgKCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgW2EsIGJdID0gcGFpcih0cnVlLCAxMik7XG4gICAgICAgICAgICBleHBlY3QoYSkudG8uYmUuZXFsKHRydWUpO1xuICAgICAgICAgICAgZXhwZWN0KGIpLnRvLmJlLmVxbCgxMik7XG4gICAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgZGVzY3JpYmUoJ1BhaXJcXCdzJywgKCkgPT4ge1xuICAgICAgICBpdCgnaW5jbHVkZSAyIHZhbHVlcyBhbmQgYWxsb3cgdG8gcmV0cmlldmUgdGhlbScsICgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGFwYWlyID0gVHVwbGUuUGFpcih0cnVlLCAxMik7XG4gICAgICAgICAgICBleHBlY3QoYXBhaXJbMF0pLnRvLmJlLmVxbCh0cnVlKTtcbiAgICAgICAgICAgIGV4cGVjdChhcGFpclsxXSkudG8uYmUuZXFsKDEyKTtcbiAgICAgICAgICAgIGV4cGVjdChhcGFpci50eXBlKS50by5iZS5lcWwoJ3BhaXInKTtcbiAgICAgICAgICAgIGV4cGVjdChhcGFpci5pc1BhaXIpLnRvLmJlLnRydWU7XG4gICAgICAgICAgICBleHBlY3QoYXBhaXIudG9TdHJpbmcoKSkudG8uYmUuZXFsKCdbdHJ1ZSwxMl0nKTtcbiAgICAgICAgfSk7XG4gICAgICAgIGl0KCdhcmUgdHJ1ZSBpdGVyYWJsZXMsIGFuZCB0aGVyZWZvcmUgYWxsb3cgcG9zaXRpb25hbCBkZXN0cnVjdHVyaW5nJywgKCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgW2EsIGJdID0gVHVwbGUuUGFpcih0cnVlLCAxMik7XG4gICAgICAgICAgICBleHBlY3QoYSkudG8uYmUuZXFsKHRydWUpO1xuICAgICAgICAgICAgZXhwZWN0KGIpLnRvLmJlLmVxbCgxMik7XG4gICAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgZGVzY3JpYmUoJ1RyaXBsZVxcJ3MnLCAoKSA9PiB7XG4gICAgICAgIGl0KCdpbmNsdWRlIDMgdmFsdWVzIGFuZCBhbGxvdyB0byByZXRyaWV2ZSB0aGVtJywgKCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgYXRyaXBsZSA9IFR1cGxlLlRyaXBsZSh0cnVlLCAxMiwgJ2EnKTtcbiAgICAgICAgICAgIGV4cGVjdChhdHJpcGxlWzBdKS50by5iZS5lcWwodHJ1ZSk7XG4gICAgICAgICAgICBleHBlY3QoYXRyaXBsZVsxXSkudG8uYmUuZXFsKDEyKTtcbiAgICAgICAgICAgIGV4cGVjdChhdHJpcGxlWzJdKS50by5iZS5lcWwoJ2EnKTtcbiAgICAgICAgICAgIGV4cGVjdChhdHJpcGxlLnR5cGUpLnRvLmJlLmVxbCgndHJpcGxlJyk7XG4gICAgICAgICAgICBleHBlY3QoYXRyaXBsZS5pc1RyaXBsZSkudG8uYmUudHJ1ZTtcbiAgICAgICAgICAgIGV4cGVjdChhdHJpcGxlLnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgnW3RydWUsMTIsYV0nKTtcbiAgICAgICAgfSk7XG4gICAgICAgIGl0KCdhcmUgdHJ1ZSBpdGVyYWJsZXMsIGFuZCB0aGVyZWZvcmUgYWxsb3cgcG9zaXRpb25hbCBkZXN0cnVjdHVyaW5nJywgKCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgW2EsIGIsIGNdID0gVHVwbGUuVHJpcGxlKHRydWUsIDEyLCAnYScpO1xuICAgICAgICAgICAgZXhwZWN0KGEpLnRvLmJlLmVxbCh0cnVlKTtcbiAgICAgICAgICAgIGV4cGVjdChiKS50by5iZS5lcWwoMTIpO1xuICAgICAgICAgICAgZXhwZWN0KGMpLnRvLmJlLmVxbCgnYScpO1xuICAgICAgICB9KTtcbiAgICB9KTtcblxuICAgIGRlc2NyaWJlKCdzdWNjZXNzIGFuZCBmYWlsdXJlJywgKCkgPT4ge1xuICAgICAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgICAgfSk7XG4gICAgICAgIGl0KCdtYXkgcmVwcmVzZW50IHN1Y2Nlc3NlcycsICgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHN1Y2MgPSBzdWNjZXNzKHRydWUsIDEyKTtcbiAgICAgICAgICAgIGV4cGVjdChzdWNjWzBdKS50by5iZS50cnVlO1xuICAgICAgICAgICAgZXhwZWN0KHN1Y2NbMV0pLnRvLmJlLmVxbCgxMik7XG4gICAgICAgICAgICBleHBlY3QoaXNTdWNjZXNzKHN1Y2MpKS50by5iZS50cnVlO1xuICAgICAgICAgICAgZXhwZWN0KGlzUGFpcihzdWNjKSkudG8uYmUudHJ1ZTtcbiAgICAgICAgfSk7XG4gICAgICAgIGl0KCdtYXkgcmVwcmVzZW50IGZhaWx1cmVzJywgKCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgZmFpbCA9IGZhaWx1cmUoJ2EnLCAxMik7XG4gICAgICAgICAgICBleHBlY3QoZmFpbFswXSkudG8uYmUuZXFsKCdhJyk7XG4gICAgICAgICAgICBleHBlY3QoZmFpbFsxXSkudG8uYmUuZXFsKDEyKTtcbiAgICAgICAgICAgIGV4cGVjdChpc1N1Y2Nlc3MoZmFpbCkpLnRvLmJlLmZhbHNlO1xuICAgICAgICAgICAgZXhwZWN0KGlzRmFpbHVyZShmYWlsKSkudG8uYmUudHJ1ZTtcbiAgICAgICAgICAgIGV4cGVjdChpc1BhaXIoZmFpbCkpLnRvLmJlLnRydWU7XG4gICAgICAgIH0pO1xuICAgIH0pO1xuXG59KTtcbiJdfQ==