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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2pzLXNwZWMvY2xhc3Nlc190ZXN0cy5qcyJdLCJuYW1lcyI6WyJkZXNjcmliZSIsInJvd3MiLCJpdCIsInBvczAwIiwiY2hhciIsImlzSnVzdCIsInRvIiwiYmUiLCJ0cnVlIiwidmFsdWUiLCJlcWwiLCJwb3MxMSIsInBvczAxIiwiaW5jclBvcyIsInBvczIwIiwicG9zMTAxMCIsImlzTm90aGluZyIsInBvczIzIiwiYVNvbWUiLCJ2YWwiLCJ0b1N0cmluZyIsImFOb25lIiwibnVsbCIsImFwYWlyIiwidHlwZSIsImEiLCJiIiwiUGFpciIsImlzUGFpciIsImF0cmlwbGUiLCJUcmlwbGUiLCJpc1RyaXBsZSIsImMiLCJiZWZvcmVFYWNoIiwic3VjYyIsImZhaWwiLCJmYWxzZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFrQkFBLGFBQVMsc0JBQVQsRUFBaUMsWUFBTTs7QUFFbkNBLGlCQUFTLGFBQVQsRUFBd0IsWUFBTTtBQUMxQixnQkFBTUMsT0FBTyxDQUNULENBQUMsQ0FBRCxFQUFJLENBQUosRUFBTyxDQUFQLENBRFMsRUFFVCxDQUFDLEdBQUQsRUFBTSxHQUFOLEVBQVcsR0FBWCxFQUFnQixHQUFoQixDQUZTLEVBR1QsQ0FBQyxHQUFELEVBQU0sR0FBTixFQUFXLEdBQVgsQ0FIUyxDQUFiO0FBS0FDLGVBQUcsNERBQUgsRUFBaUUsWUFBTTtBQUNuRSxvQkFBTUMsUUFBUSx1QkFBU0YsSUFBVCxFQUFlLENBQWYsRUFBa0IsQ0FBbEIsQ0FBZDtBQUNBLGtDQUFPRSxNQUFNQyxJQUFOLEdBQWFDLE1BQXBCLEVBQTRCQyxFQUE1QixDQUErQkMsRUFBL0IsQ0FBa0NDLElBQWxDO0FBQ0Esa0NBQU9MLE1BQU1DLElBQU4sR0FBYUssS0FBcEIsRUFBMkJILEVBQTNCLENBQThCQyxFQUE5QixDQUFpQ0csR0FBakMsQ0FBcUMsQ0FBckM7QUFDQSxvQkFBTUMsUUFBUSx1QkFBU1YsSUFBVCxFQUFlLENBQWYsRUFBa0IsQ0FBbEIsQ0FBZDtBQUNBLGtDQUFPVSxNQUFNUCxJQUFOLEdBQWFDLE1BQXBCLEVBQTRCQyxFQUE1QixDQUErQkMsRUFBL0IsQ0FBa0NDLElBQWxDO0FBQ0Esa0NBQU9HLE1BQU1QLElBQU4sR0FBYUssS0FBcEIsRUFBMkJILEVBQTNCLENBQThCQyxFQUE5QixDQUFpQ0csR0FBakMsQ0FBcUMsR0FBckM7QUFDSCxhQVBEO0FBUUFSLGVBQUcsNERBQUgsRUFBaUUsWUFBTTtBQUNuRSxvQkFBTVUsUUFBUSx1QkFBU1gsSUFBVCxFQUFlLENBQWYsRUFBa0IsQ0FBbEIsRUFBcUJZLE9BQXJCLEVBQWQ7QUFDQSxrQ0FBT0QsTUFBTVIsSUFBTixHQUFhSyxLQUFwQixFQUEyQkgsRUFBM0IsQ0FBOEJDLEVBQTlCLENBQWlDRyxHQUFqQyxDQUFxQyxDQUFyQztBQUNBLG9CQUFNSSxRQUFRLHVCQUFTYixJQUFULEVBQWUsQ0FBZixFQUFrQixDQUFsQixFQUFxQlksT0FBckIsRUFBZDtBQUNBLGtDQUFPQyxNQUFNVixJQUFOLEdBQWFLLEtBQXBCLEVBQTJCSCxFQUEzQixDQUE4QkMsRUFBOUIsQ0FBaUNHLEdBQWpDLENBQXFDLEdBQXJDO0FBQ0gsYUFMRDtBQU1BUixlQUFHLG1FQUFILEVBQXdFLFlBQU07QUFDMUUsb0JBQU1hLFVBQVUsdUJBQVNkLElBQVQsRUFBZSxFQUFmLEVBQW1CLEVBQW5CLENBQWhCO0FBQ0Esa0NBQU9jLFFBQVFYLElBQVIsR0FBZVksU0FBdEIsRUFBaUNWLEVBQWpDLENBQW9DQyxFQUFwQyxDQUF1Q0MsSUFBdkM7QUFDQSxvQkFBTVMsUUFBUSx1QkFBU2hCLElBQVQsRUFBZSxDQUFmLEVBQWtCLENBQWxCLEVBQXFCWSxPQUFyQixFQUFkO0FBQ0Esa0NBQU9JLE1BQU1iLElBQU4sR0FBYVksU0FBcEIsRUFBK0JWLEVBQS9CLENBQWtDQyxFQUFsQyxDQUFxQ0MsSUFBckM7QUFDSCxhQUxEO0FBTUgsU0ExQkQ7O0FBNEJBUixpQkFBUyxPQUFULEVBQWtCLFlBQU07QUFDcEJFLGVBQUcsMENBQUgsRUFBK0MsWUFBTTtBQUNqRCxvQkFBTWdCLFFBQVEsbUJBQUssRUFBTCxDQUFkO0FBQ0Esa0NBQU9BLE1BQU1DLEdBQU4sRUFBUCxFQUFvQmIsRUFBcEIsQ0FBdUJDLEVBQXZCLENBQTBCRyxHQUExQixDQUE4QixFQUE5QjtBQUNBLGtDQUFPLGtCQUFPUSxLQUFQLENBQVAsRUFBc0JaLEVBQXRCLENBQXlCQyxFQUF6QixDQUE0QkMsSUFBNUI7QUFDQSxrQ0FBT1UsTUFBTUUsUUFBTixFQUFQLEVBQXlCZCxFQUF6QixDQUE0QkMsRUFBNUIsQ0FBK0JHLEdBQS9CLENBQW1DLFVBQW5DO0FBQ0gsYUFMRDtBQU1ILFNBUEQ7O0FBU0FWLGlCQUFTLE9BQVQsRUFBa0IsWUFBTTtBQUNwQkUsZUFBRyxxQkFBSCxFQUEwQixZQUFNO0FBQzVCLG9CQUFNbUIsUUFBUSxvQkFBZDtBQUNBLGtDQUFPQSxNQUFNRixHQUFOLEVBQVAsRUFBb0JiLEVBQXBCLENBQXVCQyxFQUF2QixDQUEwQmUsSUFBMUI7QUFDQSxrQ0FBTyxrQkFBT0QsS0FBUCxDQUFQLEVBQXNCZixFQUF0QixDQUF5QkMsRUFBekIsQ0FBNEJDLElBQTVCO0FBQ0Esa0NBQU9hLE1BQU1ELFFBQU4sRUFBUCxFQUF5QmQsRUFBekIsQ0FBNEJDLEVBQTVCLENBQStCRyxHQUEvQixDQUFtQyxRQUFuQztBQUNILGFBTEQ7QUFNSCxTQVBEOztBQVNBVixpQkFBUyxPQUFULEVBQWtCLFlBQU07QUFDcEJFLGVBQUcsNkNBQUgsRUFBa0QsWUFBTTtBQUNwRCxvQkFBTXFCLFFBQVEsbUJBQUssSUFBTCxFQUFXLEVBQVgsQ0FBZDtBQUNBLGtDQUFPQSxNQUFNLENBQU4sQ0FBUCxFQUFpQmpCLEVBQWpCLENBQW9CQyxFQUFwQixDQUF1QkcsR0FBdkIsQ0FBMkIsSUFBM0I7QUFDQSxrQ0FBT2EsTUFBTSxDQUFOLENBQVAsRUFBaUJqQixFQUFqQixDQUFvQkMsRUFBcEIsQ0FBdUJHLEdBQXZCLENBQTJCLEVBQTNCO0FBQ0Esa0NBQU9hLE1BQU1DLElBQWIsRUFBbUJsQixFQUFuQixDQUFzQkMsRUFBdEIsQ0FBeUJHLEdBQXpCLENBQTZCLE1BQTdCO0FBQ0Esa0NBQU8sa0JBQU9hLEtBQVAsQ0FBUCxFQUFzQmpCLEVBQXRCLENBQXlCQyxFQUF6QixDQUE0QkMsSUFBNUI7QUFDSCxhQU5EO0FBT0FOLGVBQUcsbUVBQUgsRUFBd0UsWUFBTTtBQUFBLDRCQUMzRCxtQkFBSyxJQUFMLEVBQVcsRUFBWCxDQUQyRDtBQUFBO0FBQUEsb0JBQ25FdUIsQ0FEbUU7QUFBQSxvQkFDaEVDLENBRGdFOztBQUUxRSxrQ0FBT0QsQ0FBUCxFQUFVbkIsRUFBVixDQUFhQyxFQUFiLENBQWdCRyxHQUFoQixDQUFvQixJQUFwQjtBQUNBLGtDQUFPZ0IsQ0FBUCxFQUFVcEIsRUFBVixDQUFhQyxFQUFiLENBQWdCRyxHQUFoQixDQUFvQixFQUFwQjtBQUNILGFBSkQ7QUFLSCxTQWJEOztBQWVBVixpQkFBUyxTQUFULEVBQW9CLFlBQU07QUFDdEJFLGVBQUcsNkNBQUgsRUFBa0QsWUFBTTtBQUNwRCxvQkFBTXFCLFFBQVEsZUFBTUksSUFBTixDQUFXLElBQVgsRUFBaUIsRUFBakIsQ0FBZDtBQUNBLGtDQUFPSixNQUFNLENBQU4sQ0FBUCxFQUFpQmpCLEVBQWpCLENBQW9CQyxFQUFwQixDQUF1QkcsR0FBdkIsQ0FBMkIsSUFBM0I7QUFDQSxrQ0FBT2EsTUFBTSxDQUFOLENBQVAsRUFBaUJqQixFQUFqQixDQUFvQkMsRUFBcEIsQ0FBdUJHLEdBQXZCLENBQTJCLEVBQTNCO0FBQ0Esa0NBQU9hLE1BQU1DLElBQWIsRUFBbUJsQixFQUFuQixDQUFzQkMsRUFBdEIsQ0FBeUJHLEdBQXpCLENBQTZCLE1BQTdCO0FBQ0Esa0NBQU9hLE1BQU1LLE1BQWIsRUFBcUJ0QixFQUFyQixDQUF3QkMsRUFBeEIsQ0FBMkJDLElBQTNCO0FBQ0Esa0NBQU9lLE1BQU1ILFFBQU4sRUFBUCxFQUF5QmQsRUFBekIsQ0FBNEJDLEVBQTVCLENBQStCRyxHQUEvQixDQUFtQyxXQUFuQztBQUNILGFBUEQ7QUFRQVIsZUFBRyxrRUFBSCxFQUF1RSxZQUFNO0FBQUEsa0NBQzFELGVBQU15QixJQUFOLENBQVcsSUFBWCxFQUFpQixFQUFqQixDQUQwRDtBQUFBO0FBQUEsb0JBQ2xFRixDQURrRTtBQUFBLG9CQUMvREMsQ0FEK0Q7O0FBRXpFLGtDQUFPRCxDQUFQLEVBQVVuQixFQUFWLENBQWFDLEVBQWIsQ0FBZ0JHLEdBQWhCLENBQW9CLElBQXBCO0FBQ0Esa0NBQU9nQixDQUFQLEVBQVVwQixFQUFWLENBQWFDLEVBQWIsQ0FBZ0JHLEdBQWhCLENBQW9CLEVBQXBCO0FBQ0gsYUFKRDtBQUtILFNBZEQ7O0FBZ0JBVixpQkFBUyxXQUFULEVBQXNCLFlBQU07QUFDeEJFLGVBQUcsNkNBQUgsRUFBa0QsWUFBTTtBQUNwRCxvQkFBTTJCLFVBQVUsZUFBTUMsTUFBTixDQUFhLElBQWIsRUFBbUIsRUFBbkIsRUFBdUIsR0FBdkIsQ0FBaEI7QUFDQSxrQ0FBT0QsUUFBUSxDQUFSLENBQVAsRUFBbUJ2QixFQUFuQixDQUFzQkMsRUFBdEIsQ0FBeUJHLEdBQXpCLENBQTZCLElBQTdCO0FBQ0Esa0NBQU9tQixRQUFRLENBQVIsQ0FBUCxFQUFtQnZCLEVBQW5CLENBQXNCQyxFQUF0QixDQUF5QkcsR0FBekIsQ0FBNkIsRUFBN0I7QUFDQSxrQ0FBT21CLFFBQVEsQ0FBUixDQUFQLEVBQW1CdkIsRUFBbkIsQ0FBc0JDLEVBQXRCLENBQXlCRyxHQUF6QixDQUE2QixHQUE3QjtBQUNBLGtDQUFPbUIsUUFBUUwsSUFBZixFQUFxQmxCLEVBQXJCLENBQXdCQyxFQUF4QixDQUEyQkcsR0FBM0IsQ0FBK0IsUUFBL0I7QUFDQSxrQ0FBT21CLFFBQVFFLFFBQWYsRUFBeUJ6QixFQUF6QixDQUE0QkMsRUFBNUIsQ0FBK0JDLElBQS9CO0FBQ0Esa0NBQU9xQixRQUFRVCxRQUFSLEVBQVAsRUFBMkJkLEVBQTNCLENBQThCQyxFQUE5QixDQUFpQ0csR0FBakMsQ0FBcUMsYUFBckM7QUFDSCxhQVJEO0FBU0FSLGVBQUcsa0VBQUgsRUFBdUUsWUFBTTtBQUFBLG9DQUN2RCxlQUFNNEIsTUFBTixDQUFhLElBQWIsRUFBbUIsRUFBbkIsRUFBdUIsR0FBdkIsQ0FEdUQ7QUFBQTtBQUFBLG9CQUNsRUwsQ0FEa0U7QUFBQSxvQkFDL0RDLENBRCtEO0FBQUEsb0JBQzVETSxDQUQ0RDs7QUFFekUsa0NBQU9QLENBQVAsRUFBVW5CLEVBQVYsQ0FBYUMsRUFBYixDQUFnQkcsR0FBaEIsQ0FBb0IsSUFBcEI7QUFDQSxrQ0FBT2dCLENBQVAsRUFBVXBCLEVBQVYsQ0FBYUMsRUFBYixDQUFnQkcsR0FBaEIsQ0FBb0IsRUFBcEI7QUFDQSxrQ0FBT3NCLENBQVAsRUFBVTFCLEVBQVYsQ0FBYUMsRUFBYixDQUFnQkcsR0FBaEIsQ0FBb0IsR0FBcEI7QUFDSCxhQUxEO0FBTUgsU0FoQkQ7O0FBa0JBVixpQkFBUyxxQkFBVCxFQUFnQyxZQUFNO0FBQ2xDaUMsdUJBQVcsWUFBTSxDQUNoQixDQUREO0FBRUEvQixlQUFHLHlCQUFILEVBQThCLFlBQU07QUFDaEMsb0JBQU1nQyxPQUFPLHNCQUFRLElBQVIsRUFBYyxFQUFkLENBQWI7QUFDQSxrQ0FBT0EsS0FBSyxDQUFMLENBQVAsRUFBZ0I1QixFQUFoQixDQUFtQkMsRUFBbkIsQ0FBc0JDLElBQXRCO0FBQ0Esa0NBQU8wQixLQUFLLENBQUwsQ0FBUCxFQUFnQjVCLEVBQWhCLENBQW1CQyxFQUFuQixDQUFzQkcsR0FBdEIsQ0FBMEIsRUFBMUI7QUFDQSxrQ0FBTyxxQkFBVXdCLElBQVYsQ0FBUCxFQUF3QjVCLEVBQXhCLENBQTJCQyxFQUEzQixDQUE4QkMsSUFBOUI7QUFDQSxrQ0FBTyxrQkFBTzBCLElBQVAsQ0FBUCxFQUFxQjVCLEVBQXJCLENBQXdCQyxFQUF4QixDQUEyQkMsSUFBM0I7QUFDSCxhQU5EO0FBT0FOLGVBQUcsd0JBQUgsRUFBNkIsWUFBTTtBQUMvQixvQkFBTWlDLE9BQU8sc0JBQVEsR0FBUixFQUFhLEVBQWIsQ0FBYjtBQUNBLGtDQUFPQSxLQUFLLENBQUwsQ0FBUCxFQUFnQjdCLEVBQWhCLENBQW1CQyxFQUFuQixDQUFzQkcsR0FBdEIsQ0FBMEIsR0FBMUI7QUFDQSxrQ0FBT3lCLEtBQUssQ0FBTCxDQUFQLEVBQWdCN0IsRUFBaEIsQ0FBbUJDLEVBQW5CLENBQXNCRyxHQUF0QixDQUEwQixFQUExQjtBQUNBLGtDQUFPLHFCQUFVeUIsSUFBVixDQUFQLEVBQXdCN0IsRUFBeEIsQ0FBMkJDLEVBQTNCLENBQThCNkIsS0FBOUI7QUFDQSxrQ0FBTyxxQkFBVUQsSUFBVixDQUFQLEVBQXdCN0IsRUFBeEIsQ0FBMkJDLEVBQTNCLENBQThCQyxJQUE5QjtBQUNBLGtDQUFPLGtCQUFPMkIsSUFBUCxDQUFQLEVBQXFCN0IsRUFBckIsQ0FBd0JDLEVBQXhCLENBQTJCQyxJQUEzQjtBQUNILGFBUEQ7QUFRSCxTQWxCRDtBQW1CSCxLQXBIRCIsImZpbGUiOiJjbGFzc2VzX3Rlc3RzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtleHBlY3R9IGZyb20gJ2NoYWknO1xuaW1wb3J0IHtcbiAgICBpc1BhaXIsXG4gICAgaXNTdWNjZXNzLFxuICAgIGlzRmFpbHVyZSxcbiAgICBpc1NvbWUsXG4gICAgaXNOb25lLFxufSBmcm9tICd1dGlsJztcbmltcG9ydCB7XG4gICAgcGFpcixcbiAgICBzdWNjZXNzLFxuICAgIGZhaWx1cmUsXG4gICAgc29tZSxcbiAgICBub25lLFxuICAgIFBvc2l0aW9uLFxuICAgIFR1cGxlLFxufSBmcm9tICdjbGFzc2VzJztcblxuZGVzY3JpYmUoJ2Ftb25nIGhlbHBlciBjbGFzc2VzJywgKCkgPT4ge1xuXG4gICAgZGVzY3JpYmUoJ1Bvc2l0aW9uXFwncycsICgpID0+IHtcbiAgICAgICAgY29uc3Qgcm93cyA9IFtcbiAgICAgICAgICAgIFsxLCAyLCAzXSxcbiAgICAgICAgICAgIFsnYScsICdiJywgJ2MnLCAnZCddLFxuICAgICAgICAgICAgWydBJywgJ0InLCAnQyddLFxuICAgICAgICBdO1xuICAgICAgICBpdCgnaW5jbHVkZSB0YWJsZXMgb2YgY2hhcnMgYW5kIGFsbG93IHRvIHJldHJpZXZlIGNoYXIgb3B0aW9ucycsICgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHBvczAwID0gUG9zaXRpb24ocm93cywgMCwgMCk7XG4gICAgICAgICAgICBleHBlY3QocG9zMDAuY2hhcigpLmlzSnVzdCkudG8uYmUudHJ1ZTtcbiAgICAgICAgICAgIGV4cGVjdChwb3MwMC5jaGFyKCkudmFsdWUpLnRvLmJlLmVxbCgxKTtcbiAgICAgICAgICAgIGNvbnN0IHBvczExID0gUG9zaXRpb24ocm93cywgMSwgMSk7XG4gICAgICAgICAgICBleHBlY3QocG9zMTEuY2hhcigpLmlzSnVzdCkudG8uYmUudHJ1ZTtcbiAgICAgICAgICAgIGV4cGVjdChwb3MxMS5jaGFyKCkudmFsdWUpLnRvLmJlLmVxbCgnYicpO1xuICAgICAgICB9KTtcbiAgICAgICAgaXQoJ2FsbG93IHRvIGluY3JlbWVudCB0aGUgcG9zaXRpb24gYW5kIHJldHJpZXZlIGZ1cnRoZXIgY2hhcnMnLCAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBwb3MwMSA9IFBvc2l0aW9uKHJvd3MsIDAsIDApLmluY3JQb3MoKTtcbiAgICAgICAgICAgIGV4cGVjdChwb3MwMS5jaGFyKCkudmFsdWUpLnRvLmJlLmVxbCgyKTtcbiAgICAgICAgICAgIGNvbnN0IHBvczIwID0gUG9zaXRpb24ocm93cywgMSwgMykuaW5jclBvcygpO1xuICAgICAgICAgICAgZXhwZWN0KHBvczIwLmNoYXIoKS52YWx1ZSkudG8uYmUuZXFsKCdBJyk7XG4gICAgICAgIH0pO1xuICAgICAgICBpdCgncmV0dXJuIE5vdGhpbmcgd2hlbiBwb3NpdGlvbiBpcyBiZXlvbmQgdGhlIGNvbnRhaW5lZCByb3dzIGNvbnRlbnQnLCAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBwb3MxMDEwID0gUG9zaXRpb24ocm93cywgMTAsIDEwKTtcbiAgICAgICAgICAgIGV4cGVjdChwb3MxMDEwLmNoYXIoKS5pc05vdGhpbmcpLnRvLmJlLnRydWU7XG4gICAgICAgICAgICBjb25zdCBwb3MyMyA9IFBvc2l0aW9uKHJvd3MsIDIsIDIpLmluY3JQb3MoKTtcbiAgICAgICAgICAgIGV4cGVjdChwb3MyMy5jaGFyKCkuaXNOb3RoaW5nKS50by5iZS50cnVlO1xuICAgICAgICB9KTtcbiAgICB9KTtcblxuICAgIGRlc2NyaWJlKCdzb21lcycsICgpID0+IHtcbiAgICAgICAgaXQoJ2luY2x1ZGUgYSB2YWx1ZSBhbmQgYWxsb3cgdG8gcmV0cmlldmUgaXQnLCAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBhU29tZSA9IHNvbWUoMTIpO1xuICAgICAgICAgICAgZXhwZWN0KGFTb21lLnZhbCgpKS50by5iZS5lcWwoMTIpO1xuICAgICAgICAgICAgZXhwZWN0KGlzU29tZShhU29tZSkpLnRvLmJlLnRydWU7XG4gICAgICAgICAgICBleHBlY3QoYVNvbWUudG9TdHJpbmcoKSkudG8uYmUuZXFsKCdzb21lKDEyKScpO1xuICAgICAgICB9KTtcbiAgICB9KTtcblxuICAgIGRlc2NyaWJlKCdub25lcycsICgpID0+IHtcbiAgICAgICAgaXQoJ2FyZSBqdXN0IGEgc2lnbnBvc3QnLCAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBhTm9uZSA9IG5vbmUoKTtcbiAgICAgICAgICAgIGV4cGVjdChhTm9uZS52YWwoKSkudG8uYmUubnVsbDtcbiAgICAgICAgICAgIGV4cGVjdChpc05vbmUoYU5vbmUpKS50by5iZS50cnVlO1xuICAgICAgICAgICAgZXhwZWN0KGFOb25lLnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgnbm9uZSgpJyk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgZGVzY3JpYmUoJ3BhaXJzJywgKCkgPT4ge1xuICAgICAgICBpdCgnaW5jbHVkZSAyIHZhbHVlcyBhbmQgYWxsb3cgdG8gcmV0cmlldmUgdGhlbScsICgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGFwYWlyID0gcGFpcih0cnVlLCAxMik7XG4gICAgICAgICAgICBleHBlY3QoYXBhaXJbMF0pLnRvLmJlLmVxbCh0cnVlKTtcbiAgICAgICAgICAgIGV4cGVjdChhcGFpclsxXSkudG8uYmUuZXFsKDEyKTtcbiAgICAgICAgICAgIGV4cGVjdChhcGFpci50eXBlKS50by5iZS5lcWwoJ3BhaXInKTtcbiAgICAgICAgICAgIGV4cGVjdChpc1BhaXIoYXBhaXIpKS50by5iZS50cnVlO1xuICAgICAgICB9KTtcbiAgICAgICAgaXQoJ2FyZSBhY3R1YWxseSBhcnJheXMsIGFuZCB0aGVyZWZvcmUgYWxsb3cgcG9zaXRpb25hbCBkZXN0cnVjdHVyaW5nJywgKCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgW2EsIGJdID0gcGFpcih0cnVlLCAxMik7XG4gICAgICAgICAgICBleHBlY3QoYSkudG8uYmUuZXFsKHRydWUpO1xuICAgICAgICAgICAgZXhwZWN0KGIpLnRvLmJlLmVxbCgxMik7XG4gICAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgZGVzY3JpYmUoJ1BhaXJcXCdzJywgKCkgPT4ge1xuICAgICAgICBpdCgnaW5jbHVkZSAyIHZhbHVlcyBhbmQgYWxsb3cgdG8gcmV0cmlldmUgdGhlbScsICgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGFwYWlyID0gVHVwbGUuUGFpcih0cnVlLCAxMik7XG4gICAgICAgICAgICBleHBlY3QoYXBhaXJbMF0pLnRvLmJlLmVxbCh0cnVlKTtcbiAgICAgICAgICAgIGV4cGVjdChhcGFpclsxXSkudG8uYmUuZXFsKDEyKTtcbiAgICAgICAgICAgIGV4cGVjdChhcGFpci50eXBlKS50by5iZS5lcWwoJ3BhaXInKTtcbiAgICAgICAgICAgIGV4cGVjdChhcGFpci5pc1BhaXIpLnRvLmJlLnRydWU7XG4gICAgICAgICAgICBleHBlY3QoYXBhaXIudG9TdHJpbmcoKSkudG8uYmUuZXFsKCdbdHJ1ZSwxMl0nKTtcbiAgICAgICAgfSk7XG4gICAgICAgIGl0KCdhcmUgdHJ1ZSBpdGVyYWJsZXMsIGFuZCB0aGVyZWZvcmUgYWxsb3cgcG9zaXRpb25hbCBkZXN0cnVjdHVyaW5nJywgKCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgW2EsIGJdID0gVHVwbGUuUGFpcih0cnVlLCAxMik7XG4gICAgICAgICAgICBleHBlY3QoYSkudG8uYmUuZXFsKHRydWUpO1xuICAgICAgICAgICAgZXhwZWN0KGIpLnRvLmJlLmVxbCgxMik7XG4gICAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgZGVzY3JpYmUoJ1RyaXBsZVxcJ3MnLCAoKSA9PiB7XG4gICAgICAgIGl0KCdpbmNsdWRlIDMgdmFsdWVzIGFuZCBhbGxvdyB0byByZXRyaWV2ZSB0aGVtJywgKCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgYXRyaXBsZSA9IFR1cGxlLlRyaXBsZSh0cnVlLCAxMiwgJ2EnKTtcbiAgICAgICAgICAgIGV4cGVjdChhdHJpcGxlWzBdKS50by5iZS5lcWwodHJ1ZSk7XG4gICAgICAgICAgICBleHBlY3QoYXRyaXBsZVsxXSkudG8uYmUuZXFsKDEyKTtcbiAgICAgICAgICAgIGV4cGVjdChhdHJpcGxlWzJdKS50by5iZS5lcWwoJ2EnKTtcbiAgICAgICAgICAgIGV4cGVjdChhdHJpcGxlLnR5cGUpLnRvLmJlLmVxbCgndHJpcGxlJyk7XG4gICAgICAgICAgICBleHBlY3QoYXRyaXBsZS5pc1RyaXBsZSkudG8uYmUudHJ1ZTtcbiAgICAgICAgICAgIGV4cGVjdChhdHJpcGxlLnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgnW3RydWUsMTIsYV0nKTtcbiAgICAgICAgfSk7XG4gICAgICAgIGl0KCdhcmUgdHJ1ZSBpdGVyYWJsZXMsIGFuZCB0aGVyZWZvcmUgYWxsb3cgcG9zaXRpb25hbCBkZXN0cnVjdHVyaW5nJywgKCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgW2EsIGIsIGNdID0gVHVwbGUuVHJpcGxlKHRydWUsIDEyLCAnYScpO1xuICAgICAgICAgICAgZXhwZWN0KGEpLnRvLmJlLmVxbCh0cnVlKTtcbiAgICAgICAgICAgIGV4cGVjdChiKS50by5iZS5lcWwoMTIpO1xuICAgICAgICAgICAgZXhwZWN0KGMpLnRvLmJlLmVxbCgnYScpO1xuICAgICAgICB9KTtcbiAgICB9KTtcblxuICAgIGRlc2NyaWJlKCdzdWNjZXNzIGFuZCBmYWlsdXJlJywgKCkgPT4ge1xuICAgICAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgICAgfSk7XG4gICAgICAgIGl0KCdtYXkgcmVwcmVzZW50IHN1Y2Nlc3NlcycsICgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHN1Y2MgPSBzdWNjZXNzKHRydWUsIDEyKTtcbiAgICAgICAgICAgIGV4cGVjdChzdWNjWzBdKS50by5iZS50cnVlO1xuICAgICAgICAgICAgZXhwZWN0KHN1Y2NbMV0pLnRvLmJlLmVxbCgxMik7XG4gICAgICAgICAgICBleHBlY3QoaXNTdWNjZXNzKHN1Y2MpKS50by5iZS50cnVlO1xuICAgICAgICAgICAgZXhwZWN0KGlzUGFpcihzdWNjKSkudG8uYmUudHJ1ZTtcbiAgICAgICAgfSk7XG4gICAgICAgIGl0KCdtYXkgcmVwcmVzZW50IGZhaWx1cmVzJywgKCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgZmFpbCA9IGZhaWx1cmUoJ2EnLCAxMik7XG4gICAgICAgICAgICBleHBlY3QoZmFpbFswXSkudG8uYmUuZXFsKCdhJyk7XG4gICAgICAgICAgICBleHBlY3QoZmFpbFsxXSkudG8uYmUuZXFsKDEyKTtcbiAgICAgICAgICAgIGV4cGVjdChpc1N1Y2Nlc3MoZmFpbCkpLnRvLmJlLmZhbHNlO1xuICAgICAgICAgICAgZXhwZWN0KGlzRmFpbHVyZShmYWlsKSkudG8uYmUudHJ1ZTtcbiAgICAgICAgICAgIGV4cGVjdChpc1BhaXIoZmFpbCkpLnRvLmJlLnRydWU7XG4gICAgICAgIH0pO1xuICAgIH0pO1xufSk7XG4iXX0=