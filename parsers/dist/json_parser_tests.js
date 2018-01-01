define(['chai', 'json_parsers'], function (_chai, _json_parsers) {
    'use strict';

    describe('building a JSON parser', function () {
        describe('a parser for JNull\'s', function () {
            it('parsers the string \'null\' and returns a JValue.JNull', function () {
                var run = _json_parsers.JNullP.run('null');
                (0, _chai.expect)(run.isSuccess).to.be.true;
                (0, _chai.expect)(run.value[0].isJNull).to.be.true;
                (0, _chai.expect)(_json_parsers.JNullP.run('nulx').isFailure).to.be.true;
            });
        });
    });
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2pzLXNwZWMvanNvbl9wYXJzZXJfdGVzdHMuanMiXSwibmFtZXMiOlsiZGVzY3JpYmUiLCJpdCIsInJ1biIsImlzU3VjY2VzcyIsInRvIiwiYmUiLCJ0cnVlIiwidmFsdWUiLCJpc0pOdWxsIiwiaXNGYWlsdXJlIl0sIm1hcHBpbmdzIjoiOzs7QUFLQUEsYUFBUyx3QkFBVCxFQUFtQyxZQUFNO0FBQ3JDQSxpQkFBUyx1QkFBVCxFQUFrQyxZQUFNO0FBQ3BDQyxlQUFHLHdEQUFILEVBQTZELFlBQU07QUFDL0Qsb0JBQU1DLE1BQU0scUJBQU9BLEdBQVAsQ0FBVyxNQUFYLENBQVo7QUFDQSxrQ0FBT0EsSUFBSUMsU0FBWCxFQUFzQkMsRUFBdEIsQ0FBeUJDLEVBQXpCLENBQTRCQyxJQUE1QjtBQUNBLGtDQUFPSixJQUFJSyxLQUFKLENBQVUsQ0FBVixFQUFhQyxPQUFwQixFQUE2QkosRUFBN0IsQ0FBZ0NDLEVBQWhDLENBQW1DQyxJQUFuQztBQUNBLGtDQUFPLHFCQUFPSixHQUFQLENBQVcsTUFBWCxFQUFtQk8sU0FBMUIsRUFBcUNMLEVBQXJDLENBQXdDQyxFQUF4QyxDQUEyQ0MsSUFBM0M7QUFDSCxhQUxEO0FBTUgsU0FQRDtBQVFILEtBVEQiLCJmaWxlIjoianNvbl9wYXJzZXJfdGVzdHMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge2V4cGVjdH0gZnJvbSAnY2hhaSc7XG5pbXBvcnQge1xuICAgIEpOdWxsUCxcbn0gZnJvbSAnanNvbl9wYXJzZXJzJztcblxuZGVzY3JpYmUoJ2J1aWxkaW5nIGEgSlNPTiBwYXJzZXInLCAoKSA9PiB7XG4gICAgZGVzY3JpYmUoJ2EgcGFyc2VyIGZvciBKTnVsbFxcJ3MnLCAoKSA9PiB7XG4gICAgICAgIGl0KCdwYXJzZXJzIHRoZSBzdHJpbmcgXFwnbnVsbFxcJyBhbmQgcmV0dXJucyBhIEpWYWx1ZS5KTnVsbCcsICgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHJ1biA9IEpOdWxsUC5ydW4oJ251bGwnKTtcbiAgICAgICAgICAgIGV4cGVjdChydW4uaXNTdWNjZXNzKS50by5iZS50cnVlO1xuICAgICAgICAgICAgZXhwZWN0KHJ1bi52YWx1ZVswXS5pc0pOdWxsKS50by5iZS50cnVlO1xuICAgICAgICAgICAgZXhwZWN0KEpOdWxsUC5ydW4oJ251bHgnKS5pc0ZhaWx1cmUpLnRvLmJlLnRydWU7XG4gICAgICAgIH0pO1xuICAgIH0pO1xufSk7XG4iXX0=