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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2pzLXNwZWMvY2xhc3Nlc190ZXN0cy5qcyJdLCJuYW1lcyI6WyJkZXNjcmliZSIsInJvd3MiLCJpdCIsInBvczAwIiwiaXNQb3NpdGlvbiIsInRvIiwiYmUiLCJ0cnVlIiwiY2hhciIsImlzSnVzdCIsInZhbHVlIiwiZXFsIiwicG9zMTEiLCJwb3MwMSIsImluY3JQb3MiLCJwb3MyMCIsInBvczEwMTAiLCJpc05vdGhpbmciLCJwb3MyMyIsImZyb21UZXh0IiwicmVzdCIsImFTb21lIiwidmFsIiwidG9TdHJpbmciLCJhTm9uZSIsIm51bGwiLCJhcGFpciIsInR5cGUiLCJhIiwiYiIsIlBhaXIiLCJpc1BhaXIiLCJhdHJpcGxlIiwiVHJpcGxlIiwiaXNUcmlwbGUiLCJjIiwiYmVmb3JlRWFjaCIsInN1Y2MiLCJmYWlsIiwiZmFsc2UiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBa0JBQSxhQUFTLHNCQUFULEVBQWlDLFlBQU07O0FBRW5DQSxpQkFBUyxhQUFULEVBQXdCLFlBQU07QUFDMUIsZ0JBQU1DLE9BQU8sQ0FDVCxDQUFDLENBQUQsRUFBSSxDQUFKLEVBQU8sQ0FBUCxDQURTLEVBRVQsQ0FBQyxHQUFELEVBQU0sR0FBTixFQUFXLEdBQVgsRUFBZ0IsR0FBaEIsQ0FGUyxFQUdULENBQUMsR0FBRCxFQUFNLEdBQU4sRUFBVyxHQUFYLENBSFMsQ0FBYjtBQUtBQyxlQUFHLDREQUFILEVBQWlFLFlBQU07QUFDbkUsb0JBQU1DLFFBQVEsdUJBQVNGLElBQVQsRUFBZSxDQUFmLEVBQWtCLENBQWxCLENBQWQ7QUFDQSxrQ0FBT0UsTUFBTUMsVUFBYixFQUF5QkMsRUFBekIsQ0FBNEJDLEVBQTVCLENBQStCQyxJQUEvQjtBQUNBLGtDQUFPSixNQUFNSyxJQUFOLEdBQWFDLE1BQXBCLEVBQTRCSixFQUE1QixDQUErQkMsRUFBL0IsQ0FBa0NDLElBQWxDO0FBQ0Esa0NBQU9KLE1BQU1LLElBQU4sR0FB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UCxFQUFnQmpDLEVBQWhCLENBQW1CQyxFQUFuQixDQUFzQkssR0FBdEIsQ0FBMEIsR0FBMUI7QUFDQSxrQ0FBTzJCLEtBQUssQ0FBTCxDQUFQLEVBQWdCakMsRUFBaEIsQ0FBbUJDLEVBQW5CLENBQXNCSyxHQUF0QixDQUEwQixFQUExQjtBQUNBLGtDQUFPLHFCQUFVMkIsSUFBVixDQUFQLEVBQXdCakMsRUFBeEIsQ0FBMkJDLEVBQTNCLENBQThCaUMsS0FBOUI7QUFDQSxrQ0FBTyxxQkFBVUQsSUFBVixDQUFQLEVBQXdCakMsRUFBeEIsQ0FBMkJDLEVBQTNCLENBQThCQyxJQUE5QjtBQUNBLGtDQUFPLGtCQUFPK0IsSUFBUCxDQUFQLEVBQXFCakMsRUFBckIsQ0FBd0JDLEVBQXhCLENBQTJCQyxJQUEzQjtBQUNILGFBUEQ7QUFRSCxTQWxCRDtBQW1CSCxLQXJJRCIsImZpbGUiOiJjbGFzc2VzX3Rlc3RzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtleHBlY3R9IGZyb20gJ2NoYWknO1xuaW1wb3J0IHtcbiAgICBpc1BhaXIsXG4gICAgaXNTdWNjZXNzLFxuICAgIGlzRmFpbHVyZSxcbiAgICBpc1NvbWUsXG4gICAgaXNOb25lLFxufSBmcm9tICd1dGlsJztcbmltcG9ydCB7XG4gICAgcGFpcixcbiAgICBzdWNjZXNzLFxuICAgIGZhaWx1cmUsXG4gICAgc29tZSxcbiAgICBub25lLFxuICAgIFBvc2l0aW9uLFxuICAgIFR1cGxlLFxufSBmcm9tICdjbGFzc2VzJztcblxuZGVzY3JpYmUoJ2Ftb25nIGhlbHBlciBjbGFzc2VzJywgKCkgPT4ge1xuXG4gICAgZGVzY3JpYmUoJ1Bvc2l0aW9uXFwncycsICgpID0+IHtcbiAgICAgICAgY29uc3Qgcm93cyA9IFtcbiAgICAgICAgICAgIFsxLCAyLCAzXSxcbiAgICAgICAgICAgIFsnYScsICdiJywgJ2MnLCAnZCddLFxuICAgICAgICAgICAgWydBJywgJ0InLCAnQyddLFxuICAgICAgICBdO1xuICAgICAgICBpdCgnaW5jbHVkZSB0YWJsZXMgb2YgY2hhcnMgYW5kIGFsbG93IHRvIHJldHJpZXZlIGNoYXIgb3B0aW9ucycsICgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHBvczAwID0gUG9zaXRpb24ocm93cywgMCwgMCk7XG4gICAgICAgICAgICBleHBlY3QocG9zMDAuaXNQb3NpdGlvbikudG8uYmUudHJ1ZTtcbiAgICAgICAgICAgIGV4cGVjdChwb3MwMC5jaGFyKCkuaXNKdXN0KS50by5iZS50cnVlO1xuICAgICAgICAgICAgZXhwZWN0KHBvczAwLmNoYXIoKS52YWx1ZSkudG8uYmUuZXFsKDEpO1xuICAgICAgICAgICAgY29uc3QgcG9zMTEgPSBQb3NpdGlvbihyb3dzLCAxLCAxKTtcbiAgICAgICAgICAgIGV4cGVjdChwb3MxMS5jaGFyKCkuaXNKdXN0KS50by5iZS50cnVlO1xuICAgICAgICAgICAgZXhwZWN0KHBvczExLmNoYXIoKS52YWx1ZSkudG8uYmUuZXFsKCdiJyk7XG4gICAgICAgIH0pO1xuICAgICAgICBpdCgnYWxsb3cgdG8gaW5jcmVtZW50IHRoZSBwb3NpdGlvbiBhbmQgcmV0cmlldmUgZnVydGhlciBjaGFycycsICgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHBvczAxID0gUG9zaXRpb24ocm93cywgMCwgMCkuaW5jclBvcygpO1xuICAgICAgICAgICAgZXhwZWN0KHBvczAxLmNoYXIoKS52YWx1ZSkudG8uYmUuZXFsKDIpO1xuICAgICAgICAgICAgY29uc3QgcG9zMjAgPSBQb3NpdGlvbihyb3dzLCAxLCAzKS5pbmNyUG9zKCk7XG4gICAgICAgICAgICBleHBlY3QocG9zMjAuY2hhcigpLnZhbHVlKS50by5iZS5lcWwoJ0EnKTtcbiAgICAgICAgfSk7XG4gICAgICAgIGl0KCdyZXR1cm4gTm90aGluZyB3aGVuIHBvc2l0aW9uIGlzIGJleW9uZCB0aGUgY29udGFpbmVkIHJvd3MgY29udGVudCcsICgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHBvczEwMTAgPSBQb3NpdGlvbihyb3dzLCAxMCwgMTApO1xuICAgICAgICAgICAgZXhwZWN0KHBvczEwMTAuY2hhcigpLmlzTm90aGluZykudG8uYmUudHJ1ZTtcbiAgICAgICAgICAgIGNvbnN0IHBvczIzID0gUG9zaXRpb24ocm93cywgMiwgMikuaW5jclBvcygpO1xuICAgICAgICAgICAgZXhwZWN0KHBvczIzLmNoYXIoKS5pc05vdGhpbmcpLnRvLmJlLnRydWU7XG4gICAgICAgIH0pO1xuICAgICAgICBpdCgnY2FuIGJlIGluaXRpYWxpemVkIGZyb20gdGV4dCBzdHJpbmdzJywgKCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgcG9zMDAgPSBQb3NpdGlvbi5mcm9tVGV4dCgnTG9yZW0gaXBzdW0gZG9sb3Igc2l0IGFtZXQnKTtcbiAgICAgICAgICAgIGV4cGVjdChwb3MwMC5jaGFyKCkudmFsdWUpLnRvLmJlLmVxbCgnTCcpO1xuICAgICAgICAgICAgZXhwZWN0KHBvczAwLmluY3JQb3MoKS5pbmNyUG9zKCkuaW5jclBvcygpLmluY3JQb3MoKVxuICAgICAgICAgICAgICAgIC5jaGFyKCkudmFsdWUpLnRvLmJlLmVxbCgnbScpO1xuICAgICAgICB9KTtcbiAgICAgICAgaXQoJ2NhbiBiZSBpbml0aWFsaXplZCBhbHNvIGZyb20gbXVsdGlsaW5lIHRleHQgc3RyaW5ncywgc3RyaXBwaW5nIG5ld2xpbmVzIGF3YXknLCAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBwb3MwMCA9IFBvc2l0aW9uLmZyb21UZXh0KCdMb3JlbSBcXG5pcHN1bScpO1xuICAgICAgICAgICAgZXhwZWN0KHBvczAwLmNoYXIoKS52YWx1ZSkudG8uYmUuZXFsKCdMJyk7XG4gICAgICAgICAgICBleHBlY3QocG9zMDAuaW5jclBvcygpLmluY3JQb3MoKS5pbmNyUG9zKCkuaW5jclBvcygpLmluY3JQb3MoKS5pbmNyUG9zKClcbiAgICAgICAgICAgICAgICAuY2hhcigpLnZhbHVlKS50by5iZS5lcWwoJ2knKTtcbiAgICAgICAgfSk7XG4gICAgICAgIGl0KCdyZXR1cm4gc3RyaW5ncyBjb250YWluaW5nIGFsbCBjaGFyYWN0ZXJzIHN0YXJ0aW5nIGZyb20gYSBnaXZlbiBwb3NpdGlvbiwgZm9yIHRoZSBzYWtlIG9mIHRlc3RpbmcnLCAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBwb3MwMSA9IFBvc2l0aW9uLmZyb21UZXh0KCdMb3JlbScpLmluY3JQb3MoKTtcbiAgICAgICAgICAgIGV4cGVjdChwb3MwMS5yZXN0KCkpLnRvLmJlLmVxbCgnb3JlbScpO1xuICAgICAgICB9KTtcbiAgICB9KTtcblxuICAgIGRlc2NyaWJlKCdzb21lcycsICgpID0+IHtcbiAgICAgICAgaXQoJ2luY2x1ZGUgYSB2YWx1ZSBhbmQgYWxsb3cgdG8gcmV0cmlldmUgaXQnLCAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBhU29tZSA9IHNvbWUoMTIpO1xuICAgICAgICAgICAgZXhwZWN0KGFTb21lLnZhbCgpKS50by5iZS5lcWwoMTIpO1xuICAgICAgICAgICAgZXhwZWN0KGlzU29tZShhU29tZSkpLnRvLmJlLnRydWU7XG4gICAgICAgICAgICBleHBlY3QoYVNvbWUudG9TdHJpbmcoKSkudG8uYmUuZXFsKCdzb21lKDEyKScpO1xuICAgICAgICB9KTtcbiAgICB9KTtcblxuICAgIGRlc2NyaWJlKCdub25lcycsICgpID0+IHtcbiAgICAgICAgaXQoJ2FyZSBqdXN0IGEgc2lnbnBvc3QnLCAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBhTm9uZSA9IG5vbmUoKTtcbiAgICAgICAgICAgIGV4cGVjdChhTm9uZS52YWwoKSkudG8uYmUubnVsbDtcbiAgICAgICAgICAgIGV4cGVjdChpc05vbmUoYU5vbmUpKS50by5iZS50cnVlO1xuICAgICAgICAgICAgZXhwZWN0KGFOb25lLnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgnbm9uZSgpJyk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgZGVzY3JpYmUoJ3BhaXJzJywgKCkgPT4ge1xuICAgICAgICBpdCgnaW5jbHVkZSAyIHZhbHVlcyBhbmQgYWxsb3cgdG8gcmV0cmlldmUgdGhlbScsICgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGFwYWlyID0gcGFpcih0cnVlLCAxMik7XG4gICAgICAgICAgICBleHBlY3QoYXBhaXJbMF0pLnRvLmJlLmVxbCh0cnVlKTtcbiAgICAgICAgICAgIGV4cGVjdChhcGFpclsxXSkudG8uYmUuZXFsKDEyKTtcbiAgICAgICAgICAgIGV4cGVjdChhcGFpci50eXBlKS50by5iZS5lcWwoJ3BhaXInKTtcbiAgICAgICAgICAgIGV4cGVjdChpc1BhaXIoYXBhaXIpKS50by5iZS50cnVlO1xuICAgICAgICB9KTtcbiAgICAgICAgaXQoJ2FyZSBhY3R1YWxseSBhcnJheXMsIGFuZCB0aGVyZWZvcmUgYWxsb3cgcG9zaXRpb25hbCBkZXN0cnVjdHVyaW5nJywgKCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgW2EsIGJdID0gcGFpcih0cnVlLCAxMik7XG4gICAgICAgICAgICBleHBlY3QoYSkudG8uYmUuZXFsKHRydWUpO1xuICAgICAgICAgICAgZXhwZWN0KGIpLnRvLmJlLmVxbCgxMik7XG4gICAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgZGVzY3JpYmUoJ1BhaXJcXCdzJywgKCkgPT4ge1xuICAgICAgICBpdCgnaW5jbHVkZSAyIHZhbHVlcyBhbmQgYWxsb3cgdG8gcmV0cmlldmUgdGhlbScsICgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGFwYWlyID0gVHVwbGUuUGFpcih0cnVlLCAxMik7XG4gICAgICAgICAgICBleHBlY3QoYXBhaXJbMF0pLnRvLmJlLmVxbCh0cnVlKTtcbiAgICAgICAgICAgIGV4cGVjdChhcGFpclsxXSkudG8uYmUuZXFsKDEyKTtcbiAgICAgICAgICAgIGV4cGVjdChhcGFpci50eXBlKS50by5iZS5lcWwoJ3BhaXInKTtcbiAgICAgICAgICAgIGV4cGVjdChhcGFpci5pc1BhaXIpLnRvLmJlLnRydWU7XG4gICAgICAgICAgICBleHBlY3QoYXBhaXIudG9TdHJpbmcoKSkudG8uYmUuZXFsKCdbdHJ1ZSwxMl0nKTtcbiAgICAgICAgfSk7XG4gICAgICAgIGl0KCdhcmUgdHJ1ZSBpdGVyYWJsZXMsIGFuZCB0aGVyZWZvcmUgYWxsb3cgcG9zaXRpb25hbCBkZXN0cnVjdHVyaW5nJywgKCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgW2EsIGJdID0gVHVwbGUuUGFpcih0cnVlLCAxMik7XG4gICAgICAgICAgICBleHBlY3QoYSkudG8uYmUuZXFsKHRydWUpO1xuICAgICAgICAgICAgZXhwZWN0KGIpLnRvLmJlLmVxbCgxMik7XG4gICAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgZGVzY3JpYmUoJ1RyaXBsZVxcJ3MnLCAoKSA9PiB7XG4gICAgICAgIGl0KCdpbmNsdWRlIDMgdmFsdWVzIGFuZCBhbGxvdyB0byByZXRyaWV2ZSB0aGVtJywgKCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgYXRyaXBsZSA9IFR1cGxlLlRyaXBsZSh0cnVlLCAxMiwgJ2EnKTtcbiAgICAgICAgICAgIGV4cGVjdChhdHJpcGxlWzBdKS50by5iZS5lcWwodHJ1ZSk7XG4gICAgICAgICAgICBleHBlY3QoYXRyaXBsZVsxXSkudG8uYmUuZXFsKDEyKTtcbiAgICAgICAgICAgIGV4cGVjdChhdHJpcGxlWzJdKS50by5iZS5lcWwoJ2EnKTtcbiAgICAgICAgICAgIGV4cGVjdChhdHJpcGxlLnR5cGUpLnRvLmJlLmVxbCgndHJpcGxlJyk7XG4gICAgICAgICAgICBleHBlY3QoYXRyaXBsZS5pc1RyaXBsZSkudG8uYmUudHJ1ZTtcbiAgICAgICAgICAgIGV4cGVjdChhdHJpcGxlLnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgnW3RydWUsMTIsYV0nKTtcbiAgICAgICAgfSk7XG4gICAgICAgIGl0KCdhcmUgdHJ1ZSBpdGVyYWJsZXMsIGFuZCB0aGVyZWZvcmUgYWxsb3cgcG9zaXRpb25hbCBkZXN0cnVjdHVyaW5nJywgKCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgW2EsIGIsIGNdID0gVHVwbGUuVHJpcGxlKHRydWUsIDEyLCAnYScpO1xuICAgICAgICAgICAgZXhwZWN0KGEpLnRvLmJlLmVxbCh0cnVlKTtcbiAgICAgICAgICAgIGV4cGVjdChiKS50by5iZS5lcWwoMTIpO1xuICAgICAgICAgICAgZXhwZWN0KGMpLnRvLmJlLmVxbCgnYScpO1xuICAgICAgICB9KTtcbiAgICB9KTtcblxuICAgIGRlc2NyaWJlKCdzdWNjZXNzIGFuZCBmYWlsdXJlJywgKCkgPT4ge1xuICAgICAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgICAgfSk7XG4gICAgICAgIGl0KCdtYXkgcmVwcmVzZW50IHN1Y2Nlc3NlcycsICgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHN1Y2MgPSBzdWNjZXNzKHRydWUsIDEyKTtcbiAgICAgICAgICAgIGV4cGVjdChzdWNjWzBdKS50by5iZS50cnVlO1xuICAgICAgICAgICAgZXhwZWN0KHN1Y2NbMV0pLnRvLmJlLmVxbCgxMik7XG4gICAgICAgICAgICBleHBlY3QoaXNTdWNjZXNzKHN1Y2MpKS50by5iZS50cnVlO1xuICAgICAgICAgICAgZXhwZWN0KGlzUGFpcihzdWNjKSkudG8uYmUudHJ1ZTtcbiAgICAgICAgfSk7XG4gICAgICAgIGl0KCdtYXkgcmVwcmVzZW50IGZhaWx1cmVzJywgKCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgZmFpbCA9IGZhaWx1cmUoJ2EnLCAxMik7XG4gICAgICAgICAgICBleHBlY3QoZmFpbFswXSkudG8uYmUuZXFsKCdhJyk7XG4gICAgICAgICAgICBleHBlY3QoZmFpbFsxXSkudG8uYmUuZXFsKDEyKTtcbiAgICAgICAgICAgIGV4cGVjdChpc1N1Y2Nlc3MoZmFpbCkpLnRvLmJlLmZhbHNlO1xuICAgICAgICAgICAgZXhwZWN0KGlzRmFpbHVyZShmYWlsKSkudG8uYmUudHJ1ZTtcbiAgICAgICAgICAgIGV4cGVjdChpc1BhaXIoZmFpbCkpLnRvLmJlLnRydWU7XG4gICAgICAgIH0pO1xuICAgIH0pO1xufSk7XG4iXX0=