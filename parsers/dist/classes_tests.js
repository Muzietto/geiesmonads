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
            it('are true iterables and therefore allow positional destructuring', function () {
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
                var apair = (0, _classes.Pair)(true, 12);
                (0, _chai.expect)(apair[0]).to.be.eql(true);
                (0, _chai.expect)(apair[1]).to.be.eql(12);
                (0, _chai.expect)(apair.type).to.be.eql('pair');
                (0, _chai.expect)(apair.isPair).to.be.true;
                (0, _chai.expect)(apair.toString()).to.be.eql('[true,12]');
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2pzLXNwZWMvY2xhc3Nlc190ZXN0cy5qcyJdLCJuYW1lcyI6WyJkZXNjcmliZSIsIml0IiwiYVNvbWUiLCJ2YWwiLCJ0byIsImJlIiwiZXFsIiwidHJ1ZSIsInRvU3RyaW5nIiwiYU5vbmUiLCJudWxsIiwiYXBhaXIiLCJ0eXBlIiwiYSIsImIiLCJpc1BhaXIiLCJiZWZvcmVFYWNoIiwic3VjYyIsImZhaWwiLCJmYWxzZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFpQkFBLGFBQVMsc0JBQVQsRUFBaUMsWUFBTTs7QUFFbkNBLGlCQUFTLE9BQVQsRUFBa0IsWUFBTTtBQUNwQkMsZUFBRywwQ0FBSCxFQUErQyxZQUFNO0FBQ2pELG9CQUFNQyxRQUFRLG1CQUFLLEVBQUwsQ0FBZDtBQUNBLGtDQUFPQSxNQUFNQyxHQUFOLEVBQVAsRUFBb0JDLEVBQXBCLENBQXVCQyxFQUF2QixDQUEwQkMsR0FBMUIsQ0FBOEIsRUFBOUI7QUFDQSxrQ0FBTyxrQkFBT0osS0FBUCxDQUFQLEVBQXNCRSxFQUF0QixDQUF5QkMsRUFBekIsQ0FBNEJFLElBQTVCO0FBQ0Esa0NBQU9MLE1BQU1NLFFBQU4sRUFBUCxFQUF5QkosRUFBekIsQ0FBNEJDLEVBQTVCLENBQStCQyxHQUEvQixDQUFtQyxVQUFuQztBQUNILGFBTEQ7QUFNSCxTQVBEOztBQVNBTixpQkFBUyxPQUFULEVBQWtCLFlBQU07QUFDcEJDLGVBQUcscUJBQUgsRUFBMEIsWUFBTTtBQUM1QixvQkFBTVEsUUFBUSxvQkFBZDtBQUNBLGtDQUFPQSxNQUFNTixHQUFOLEVBQVAsRUFBb0JDLEVBQXBCLENBQXVCQyxFQUF2QixDQUEwQkssSUFBMUI7QUFDQSxrQ0FBTyxrQkFBT0QsS0FBUCxDQUFQLEVBQXNCTCxFQUF0QixDQUF5QkMsRUFBekIsQ0FBNEJFLElBQTVCO0FBQ0Esa0NBQU9FLE1BQU1ELFFBQU4sRUFBUCxFQUF5QkosRUFBekIsQ0FBNEJDLEVBQTVC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TCxDQUFQLEVBQWdCZCxFQUFoQixDQUFtQkMsRUFBbkIsQ0FBc0JDLEdBQXRCLENBQTBCLEVBQTFCO0FBQ0Esa0NBQU8scUJBQVVZLElBQVYsQ0FBUCxFQUF3QmQsRUFBeEIsQ0FBMkJDLEVBQTNCLENBQThCYyxLQUE5QjtBQUNBLGtDQUFPLHFCQUFVRCxJQUFWLENBQVAsRUFBd0JkLEVBQXhCLENBQTJCQyxFQUEzQixDQUE4QkUsSUFBOUI7QUFDQSxrQ0FBTyxrQkFBT1csSUFBUCxDQUFQLEVBQXFCZCxFQUFyQixDQUF3QkMsRUFBeEIsQ0FBMkJFLElBQTNCO0FBQ0gsYUFQRDtBQVFILFNBbEJEO0FBb0JILEtBbEVEIiwiZmlsZSI6ImNsYXNzZXNfdGVzdHMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge2V4cGVjdH0gZnJvbSAnY2hhaSc7XG5pbXBvcnQge1xuICAgIGlzUGFpcixcbiAgICBpc1N1Y2Nlc3MsXG4gICAgaXNGYWlsdXJlLFxuICAgIGlzU29tZSxcbiAgICBpc05vbmUsXG59IGZyb20gJ3V0aWwnO1xuaW1wb3J0IHtcbiAgICBwYWlyLFxuICAgIHN1Y2Nlc3MsXG4gICAgZmFpbHVyZSxcbiAgICBzb21lLFxuICAgIG5vbmUsXG4gICAgUGFpcixcbn0gZnJvbSAnY2xhc3Nlcyc7XG5cbmRlc2NyaWJlKCdhbW9uZyBoZWxwZXIgY2xhc3NlcycsICgpID0+IHtcblxuICAgIGRlc2NyaWJlKCdzb21lcycsICgpID0+IHtcbiAgICAgICAgaXQoJ2luY2x1ZGUgYSB2YWx1ZSBhbmQgYWxsb3cgdG8gcmV0cmlldmUgaXQnLCAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBhU29tZSA9IHNvbWUoMTIpO1xuICAgICAgICAgICAgZXhwZWN0KGFTb21lLnZhbCgpKS50by5iZS5lcWwoMTIpO1xuICAgICAgICAgICAgZXhwZWN0KGlzU29tZShhU29tZSkpLnRvLmJlLnRydWU7XG4gICAgICAgICAgICBleHBlY3QoYVNvbWUudG9TdHJpbmcoKSkudG8uYmUuZXFsKCdzb21lKDEyKScpO1xuICAgICAgICB9KTtcbiAgICB9KTtcblxuICAgIGRlc2NyaWJlKCdub25lcycsICgpID0+IHtcbiAgICAgICAgaXQoJ2FyZSBqdXN0IGEgc2lnbnBvc3QnLCAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBhTm9uZSA9IG5vbmUoKTtcbiAgICAgICAgICAgIGV4cGVjdChhTm9uZS52YWwoKSkudG8uYmUubnVsbDtcbiAgICAgICAgICAgIGV4cGVjdChpc05vbmUoYU5vbmUpKS50by5iZS50cnVlO1xuICAgICAgICAgICAgZXhwZWN0KGFOb25lLnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgnbm9uZSgpJyk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgZGVzY3JpYmUoJ3BhaXJzJywgKCkgPT4ge1xuICAgICAgICBpdCgnaW5jbHVkZSAyIHZhbHVlcyBhbmQgYWxsb3cgdG8gcmV0cmlldmUgdGhlbScsICgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGFwYWlyID0gcGFpcih0cnVlLCAxMik7XG4gICAgICAgICAgICBleHBlY3QoYXBhaXJbMF0pLnRvLmJlLmVxbCh0cnVlKTtcbiAgICAgICAgICAgIGV4cGVjdChhcGFpclsxXSkudG8uYmUuZXFsKDEyKTtcbiAgICAgICAgICAgIGV4cGVjdChhcGFpci50eXBlKS50by5iZS5lcWwoJ3BhaXInKTtcbiAgICAgICAgICAgIGV4cGVjdChpc1BhaXIoYXBhaXIpKS50by5iZS50cnVlO1xuICAgICAgICB9KTtcbiAgICAgICAgaXQoJ2FyZSB0cnVlIGl0ZXJhYmxlcyBhbmQgdGhlcmVmb3JlIGFsbG93IHBvc2l0aW9uYWwgZGVzdHJ1Y3R1cmluZycsICgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IFthLCBiXSA9IHBhaXIodHJ1ZSwgMTIpO1xuICAgICAgICAgICAgZXhwZWN0KGEpLnRvLmJlLmVxbCh0cnVlKTtcbiAgICAgICAgICAgIGV4cGVjdChiKS50by5iZS5lcWwoMTIpO1xuICAgICAgICB9KTtcbiAgICB9KTtcblxuICAgIGRlc2NyaWJlKCdQYWlyXFwncycsICgpID0+IHtcbiAgICAgICAgaXQoJ2luY2x1ZGUgMiB2YWx1ZXMgYW5kIGFsbG93IHRvIHJldHJpZXZlIHRoZW0nLCAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBhcGFpciA9IFBhaXIodHJ1ZSwgMTIpO1xuICAgICAgICAgICAgZXhwZWN0KGFwYWlyWzBdKS50by5iZS5lcWwodHJ1ZSk7XG4gICAgICAgICAgICBleHBlY3QoYXBhaXJbMV0pLnRvLmJlLmVxbCgxMik7XG4gICAgICAgICAgICBleHBlY3QoYXBhaXIudHlwZSkudG8uYmUuZXFsKCdwYWlyJyk7XG4gICAgICAgICAgICBleHBlY3QoYXBhaXIuaXNQYWlyKS50by5iZS50cnVlO1xuICAgICAgICAgICAgZXhwZWN0KGFwYWlyLnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgnW3RydWUsMTJdJyk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgZGVzY3JpYmUoJ3N1Y2Nlc3MgYW5kIGZhaWx1cmUnLCAoKSA9PiB7XG4gICAgICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgICB9KTtcbiAgICAgICAgaXQoJ21heSByZXByZXNlbnQgc3VjY2Vzc2VzJywgKCkgPT4ge1xuICAgICAgICAgICAgY29uc3Qgc3VjYyA9IHN1Y2Nlc3ModHJ1ZSwgMTIpO1xuICAgICAgICAgICAgZXhwZWN0KHN1Y2NbMF0pLnRvLmJlLnRydWU7XG4gICAgICAgICAgICBleHBlY3Qoc3VjY1sxXSkudG8uYmUuZXFsKDEyKTtcbiAgICAgICAgICAgIGV4cGVjdChpc1N1Y2Nlc3Moc3VjYykpLnRvLmJlLnRydWU7XG4gICAgICAgICAgICBleHBlY3QoaXNQYWlyKHN1Y2MpKS50by5iZS50cnVlO1xuICAgICAgICB9KTtcbiAgICAgICAgaXQoJ21heSByZXByZXNlbnQgZmFpbHVyZXMnLCAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBmYWlsID0gZmFpbHVyZSgnYScsIDEyKTtcbiAgICAgICAgICAgIGV4cGVjdChmYWlsWzBdKS50by5iZS5lcWwoJ2EnKTtcbiAgICAgICAgICAgIGV4cGVjdChmYWlsWzFdKS50by5iZS5lcWwoMTIpO1xuICAgICAgICAgICAgZXhwZWN0KGlzU3VjY2VzcyhmYWlsKSkudG8uYmUuZmFsc2U7XG4gICAgICAgICAgICBleHBlY3QoaXNGYWlsdXJlKGZhaWwpKS50by5iZS50cnVlO1xuICAgICAgICAgICAgZXhwZWN0KGlzUGFpcihmYWlsKSkudG8uYmUudHJ1ZTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG5cbn0pO1xuIl19