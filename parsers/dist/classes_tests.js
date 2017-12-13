define(['chai', 'util', 'classes'], function (_chai, _util, _classes) {
    'use strict';

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
            beforeEach(function () {});
            it('include 2 values and allow to retrieve them', function () {
                var apair = (0, _classes.pair)(true, 12);
                (0, _chai.expect)(apair[0]).to.be.eql(true);
                (0, _chai.expect)(apair[1]).to.be.eql(12);
                (0, _chai.expect)(apair.type).to.be.eql('pair');
                (0, _chai.expect)((0, _util.isPair)(apair)).to.be.true;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2pzLXNwZWMvY2xhc3Nlc190ZXN0cy5qcyJdLCJuYW1lcyI6WyJkZXNjcmliZSIsIml0IiwiYVNvbWUiLCJ2YWwiLCJ0byIsImJlIiwiZXFsIiwidHJ1ZSIsInRvU3RyaW5nIiwiYU5vbmUiLCJudWxsIiwiYmVmb3JlRWFjaCIsImFwYWlyIiwidHlwZSIsInN1Y2MiLCJmYWlsIiwiZmFsc2UiXSwibWFwcGluZ3MiOiI7OztBQWdCQUEsYUFBUyxzQkFBVCxFQUFpQyxZQUFNOztBQUVuQ0EsaUJBQVMsT0FBVCxFQUFrQixZQUFNO0FBQ3BCQyxlQUFHLDBDQUFILEVBQStDLFlBQU07QUFDakQsb0JBQU1DLFFBQVEsbUJBQUssRUFBTCxDQUFkO0FBQ0Esa0NBQU9BLE1BQU1DLEdBQU4sRUFBUCxFQUFvQkMsRUFBcEIsQ0FBdUJDLEVBQXZCLENBQTBCQyxHQUExQixDQUE4QixFQUE5QjtBQUNBLGtDQUFPLGtCQUFPSixLQUFQLENBQVAsRUFBc0JFLEVBQXRCLENBQXlCQyxFQUF6QixDQUE0QkUsSUFBNUI7QUFDQSxrQ0FBT0wsTUFBTU0sUUFBTixFQUFQLEVBQXlCSixFQUF6QixDQUE0QkMsRUFBNUIsQ0FBK0JDLEdBQS9CLENBQW1DLFVBQW5DO0FBQ0gsYUFMRDtBQU1ILFNBUEQ7O0FBU0FOLGlCQUFTLE9BQVQsRUFBa0IsWUFBTTtBQUNwQkMsZUFBRyxxQkFBSCxFQUEwQixZQUFNO0FBQzVCLG9CQUFNUSxRQUFRLG9CQUFkO0FBQ0Esa0NBQU9BLE1BQU1OLEdBQU4sRUFBUCxFQUFvQkMsRUFBcEIsQ0FBdUJDLEVBQXZCLENBQTBCSyxJQUExQjtBQUNBLGtDQUFPLGtCQUFPRCxLQUFQLENBQVAsRUFBc0JMLEVBQXRCLENBQXlCQyxFQUF6QixDQUE0QkUsSUFBNUI7QUFDQSxrQ0FBT0UsTUFBTUQsUUFBTixFQUFQLEVBQXlCSixFQUF6QixDQUE0QkMsRUFBNUIsQ0FBK0JDLEdBQS9CLENBQW1DLFFBQW5DO0FBQ0gsYUFMRDtBQU1ILFNBUEQ7O0FBU0FOLGlCQUFTLE9BQVQsRUFBa0IsWUFBTTtBQUNwQlcsdUJBQVcsWUFBTSxDQUNoQixDQUREO0FBRUFWLGVBQUcsNkNBQUgsRUFBa0QsWUFBTTtBQUNwRCxvQkFBTVcsUUFBUSxtQkFBSyxJQUFMLEVBQVcsRUFBWCxDQUFkO0FBQ0Esa0NBQU9BLE1BQU0sQ0FBTixDQUFQLEVBQWlCUixFQUFqQixDQUFvQkMsRUFBcEIsQ0FBdUJDLEdBQXZCLENBQTJCLElBQTNCO0FBQ0Esa0NBQU9NLE1BQU0sQ0FBTixDQUFQLEVBQWlCUixFQUFqQixDQUFvQkMsRUFBcEIsQ0FBdUJDLEdBQXZCLENBQTJCLEVBQTNCO0FBQ0Esa0NBQU9NLE1BQU1DLElBQWIsRUFBbUJULEVBQW5CLENBQXNCQyxFQUF0QixDQUF5QkMsR0FBekIsQ0FBNkIsTUFBN0I7QUFDQSxrQ0FBTyxrQkFBT00sS0FBUCxDQUFQLEVBQXNCUixFQUF0QixDQUF5QkMsRUFBekIsQ0FBNEJFLElBQTVCO0FBQ0gsYUFORDtBQU9ILFNBVkQ7O0FBWUFQLGlCQUFTLHFCQUFULEVBQWdDLFlBQU07QUFDbENXLHVCQUFXLFlBQU0sQ0FDaEIsQ0FERDtBQUVBVixlQUFHLHlCQUFILEVBQThCLFlBQU07QUFDaEMsb0JBQU1hLE9BQU8sc0JBQVEsSUFBUixFQUFjLEVBQWQsQ0FBYjtBQUNBLGtDQUFPQSxLQUFLLENBQUwsQ0FBUCxFQUFnQlYsRUFBaEIsQ0FBbUJDLEVBQW5CLENBQXNCRSxJQUF0QjtBQUNBLGtDQUFPTyxLQUFLLENBQUwsQ0FBUCxFQUFnQlYsRUFBaEIsQ0FBbUJDLEVBQW5CLENBQXNCQyxHQUF0QixDQUEwQixFQUExQjtBQUNBLGtDQUFPLHFCQUFVUSxJQUFWLENBQVAsRUFBd0JWLEVBQXhCLENBQTJCQyxFQUEzQixDQUE4QkUsSUFBOUI7QUFDQSxrQ0FBTyxrQkFBT08sSUFBUCxDQUFQLEVBQXFCVixFQUFyQixDQUF3QkMsRUFBeEIsQ0FBMkJFLElBQTNCO0FBQ0gsYUFORDtBQU9BTixlQUFHLHdCQUFILEVBQTZCLFlBQU07QUFDL0Isb0JBQU1jLE9BQU8sc0JBQVEsR0FBUixFQUFhLEVBQWIsQ0FBYjtBQUNBLGtDQUFPQSxLQUFLLENBQUwsQ0FBUCxFQUFnQlgsRUFBaEIsQ0FBbUJDLEVBQW5CLENBQXNCQyxHQUF0QixDQUEwQixHQUExQjtBQUNBLGtDQUFPUyxLQUFLLENBQUwsQ0FBUCxFQUFnQlgsRUFBaEIsQ0FBbUJDLEVBQW5CLENBQXNCQyxHQUF0QixDQUEwQixFQUExQjtBQUNBLGtDQUFPLHFCQUFVUyxJQUFWLENBQVAsRUFBd0JYLEVBQXhCLENBQTJCQyxFQUEzQixDQUE4QlcsS0FBOUI7QUFDQSxrQ0FBTyxxQkFBVUQsSUFBVixDQUFQLEVBQXdCWCxFQUF4QixDQUEyQkMsRUFBM0IsQ0FBOEJFLElBQTlCO0FBQ0Esa0NBQU8sa0JBQU9RLElBQVAsQ0FBUCxFQUFxQlgsRUFBckIsQ0FBd0JDLEVBQXhCLENBQTJCRSxJQUEzQjtBQUNILGFBUEQ7QUFRSCxTQWxCRDtBQW9CSCxLQXBERCIsImZpbGUiOiJjbGFzc2VzX3Rlc3RzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtleHBlY3R9IGZyb20gJ2NoYWknO1xuaW1wb3J0IHtcbiAgICBpc1BhaXIsXG4gICAgaXNTdWNjZXNzLFxuICAgIGlzRmFpbHVyZSxcbiAgICBpc1NvbWUsXG4gICAgaXNOb25lLFxufSBmcm9tICd1dGlsJztcbmltcG9ydCB7XG4gICAgcGFpcixcbiAgICBzdWNjZXNzLFxuICAgIGZhaWx1cmUsXG4gICAgc29tZSxcbiAgICBub25lLFxufSBmcm9tICdjbGFzc2VzJztcblxuZGVzY3JpYmUoJ2Ftb25nIGhlbHBlciBjbGFzc2VzJywgKCkgPT4ge1xuXG4gICAgZGVzY3JpYmUoJ3NvbWVzJywgKCkgPT4ge1xuICAgICAgICBpdCgnaW5jbHVkZSBhIHZhbHVlIGFuZCBhbGxvdyB0byByZXRyaWV2ZSBpdCcsICgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGFTb21lID0gc29tZSgxMik7XG4gICAgICAgICAgICBleHBlY3QoYVNvbWUudmFsKCkpLnRvLmJlLmVxbCgxMik7XG4gICAgICAgICAgICBleHBlY3QoaXNTb21lKGFTb21lKSkudG8uYmUudHJ1ZTtcbiAgICAgICAgICAgIGV4cGVjdChhU29tZS50b1N0cmluZygpKS50by5iZS5lcWwoJ3NvbWUoMTIpJyk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgZGVzY3JpYmUoJ25vbmVzJywgKCkgPT4ge1xuICAgICAgICBpdCgnYXJlIGp1c3QgYSBzaWducG9zdCcsICgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGFOb25lID0gbm9uZSgpO1xuICAgICAgICAgICAgZXhwZWN0KGFOb25lLnZhbCgpKS50by5iZS5udWxsO1xuICAgICAgICAgICAgZXhwZWN0KGlzTm9uZShhTm9uZSkpLnRvLmJlLnRydWU7XG4gICAgICAgICAgICBleHBlY3QoYU5vbmUudG9TdHJpbmcoKSkudG8uYmUuZXFsKCdub25lKCknKTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICBkZXNjcmliZSgncGFpcnMnLCAoKSA9PiB7XG4gICAgICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgICB9KTtcbiAgICAgICAgaXQoJ2luY2x1ZGUgMiB2YWx1ZXMgYW5kIGFsbG93IHRvIHJldHJpZXZlIHRoZW0nLCAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBhcGFpciA9IHBhaXIodHJ1ZSwgMTIpO1xuICAgICAgICAgICAgZXhwZWN0KGFwYWlyWzBdKS50by5iZS5lcWwodHJ1ZSk7XG4gICAgICAgICAgICBleHBlY3QoYXBhaXJbMV0pLnRvLmJlLmVxbCgxMik7XG4gICAgICAgICAgICBleHBlY3QoYXBhaXIudHlwZSkudG8uYmUuZXFsKCdwYWlyJyk7XG4gICAgICAgICAgICBleHBlY3QoaXNQYWlyKGFwYWlyKSkudG8uYmUudHJ1ZTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICBkZXNjcmliZSgnc3VjY2VzcyBhbmQgZmFpbHVyZScsICgpID0+IHtcbiAgICAgICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICAgIH0pO1xuICAgICAgICBpdCgnbWF5IHJlcHJlc2VudCBzdWNjZXNzZXMnLCAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBzdWNjID0gc3VjY2Vzcyh0cnVlLCAxMik7XG4gICAgICAgICAgICBleHBlY3Qoc3VjY1swXSkudG8uYmUudHJ1ZTtcbiAgICAgICAgICAgIGV4cGVjdChzdWNjWzFdKS50by5iZS5lcWwoMTIpO1xuICAgICAgICAgICAgZXhwZWN0KGlzU3VjY2VzcyhzdWNjKSkudG8uYmUudHJ1ZTtcbiAgICAgICAgICAgIGV4cGVjdChpc1BhaXIoc3VjYykpLnRvLmJlLnRydWU7XG4gICAgICAgIH0pO1xuICAgICAgICBpdCgnbWF5IHJlcHJlc2VudCBmYWlsdXJlcycsICgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGZhaWwgPSBmYWlsdXJlKCdhJywgMTIpO1xuICAgICAgICAgICAgZXhwZWN0KGZhaWxbMF0pLnRvLmJlLmVxbCgnYScpO1xuICAgICAgICAgICAgZXhwZWN0KGZhaWxbMV0pLnRvLmJlLmVxbCgxMik7XG4gICAgICAgICAgICBleHBlY3QoaXNTdWNjZXNzKGZhaWwpKS50by5iZS5mYWxzZTtcbiAgICAgICAgICAgIGV4cGVjdChpc0ZhaWx1cmUoZmFpbCkpLnRvLmJlLnRydWU7XG4gICAgICAgICAgICBleHBlY3QoaXNQYWlyKGZhaWwpKS50by5iZS50cnVlO1xuICAgICAgICB9KTtcbiAgICB9KTtcblxufSk7XG4iXX0=