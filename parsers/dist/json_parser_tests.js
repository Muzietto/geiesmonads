define(['chai', 'json_parsers'], function (_chai, _json_parsers) {
    'use strict';

    describe('building a JSON parser', function () {
        describe('a parser for JNull\'s', function () {
            it('parses the string \'null\' and returns a JValue.JNull', function () {
                var run = _json_parsers.JNullP.run('null');
                (0, _chai.expect)(run.isSuccess).to.be.true;
                (0, _chai.expect)(run.value[0].isJNull).to.be.true;
                (0, _chai.expect)(_json_parsers.JNullP.run('nulx').isFailure).to.be.true;
            });
        });
        describe('a parser for JBool\'s', function () {
            it('parses the string \'true\' and returns a JValue.JBool(true)', function () {
                var run = _json_parsers.JBoolP.run('true');
                (0, _chai.expect)(run.isSuccess).to.be.true;
                (0, _chai.expect)(run.value[0].isJBool).to.be.true;
                (0, _chai.expect)(run.value[0].value).to.be.true;
            });
            it('parses the string \'false\' and returns a JValue.JBool(false)', function () {
                var run = _json_parsers.JBoolP.run('false');
                (0, _chai.expect)(run.isSuccess).to.be.true;
                (0, _chai.expect)(run.value[0].isJBool).to.be.true;
                (0, _chai.expect)(run.value[0].value).to.be.false;
            });
            it('fails to parse anything else', function () {
                (0, _chai.expect)(_json_parsers.JBoolP.run('trux').isFailure).to.be.true;
            });
        });
    });
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2pzLXNwZWMvanNvbl9wYXJzZXJfdGVzdHMuanMiXSwibmFtZXMiOlsiZGVzY3JpYmUiLCJpdCIsInJ1biIsImlzU3VjY2VzcyIsInRvIiwiYmUiLCJ0cnVlIiwidmFsdWUiLCJpc0pOdWxsIiwiaXNGYWlsdXJlIiwiaXNKQm9vbCIsImZhbHNlIl0sIm1hcHBpbmdzIjoiOzs7QUFNQUEsYUFBUyx3QkFBVCxFQUFtQyxZQUFNO0FBQ3JDQSxpQkFBUyx1QkFBVCxFQUFrQyxZQUFNO0FBQ3BDQyxlQUFHLHVEQUFILEVBQTRELFlBQU07QUFDOUQsb0JBQU1DLE1BQU0scUJBQU9BLEdBQVAsQ0FBVyxNQUFYLENBQVo7QUFDQSxrQ0FBT0EsSUFBSUMsU0FBWCxFQUFzQkMsRUFBdEIsQ0FBeUJDLEVBQXpCLENBQTRCQyxJQUE1QjtBQUNBLGtDQUFPSixJQUFJSyxLQUFKLENBQVUsQ0FBVixFQUFhQyxPQUFwQixFQUE2QkosRUFBN0IsQ0FBZ0NDLEVBQWhDLENBQW1DQyxJQUFuQztBQUNBLGtDQUFPLHFCQUFPSixHQUFQLENBQVcsTUFBWCxFQUFtQk8sU0FBMUIsRUFBcUNMLEVBQXJDLENBQXdDQyxFQUF4QyxDQUEyQ0MsSUFBM0M7QUFDSCxhQUxEO0FBTUgsU0FQRDtBQVFBTixpQkFBUyx1QkFBVCxFQUFrQyxZQUFNO0FBQ3BDQyxlQUFHLDZEQUFILEVBQWtFLFlBQU07QUFDcEUsb0JBQU1DLE1BQU0scUJBQU9BLEdBQVAsQ0FBVyxNQUFYLENBQVo7QUFDQSxrQ0FBT0EsSUFBSUMsU0FBWCxFQUFzQkMsRUFBdEIsQ0FBeUJDLEVBQXpCLENBQTRCQyxJQUE1QjtBQUNBLGtDQUFPSixJQUFJSyxLQUFKLENBQVUsQ0FBVixFQUFhRyxPQUFwQixFQUE2Qk4sRUFBN0IsQ0FBZ0NDLEVBQWhDLENBQW1DQyxJQUFuQztBQUNBLGtDQUFPSixJQUFJSyxLQUFKLENBQVUsQ0FBVixFQUFhQSxLQUFwQixFQUEyQkgsRUFBM0IsQ0FBOEJDLEVBQTlCLENBQWlDQyxJQUFqQztBQUNILGFBTEQ7QUFNQUwsZUFBRywrREFBSCxFQUFvRSxZQUFNO0FBQ3RFLG9CQUFNQyxNQUFNLHFCQUFPQSxHQUFQLENBQVcsT0FBWCxDQUFaO0FBQ0Esa0NBQU9BLElBQUlDLFNBQVgsRUFBc0JDLEVBQXRCLENBQXlCQyxFQUF6QixDQUE0QkMsSUFBNUI7QUFDQSxrQ0FBT0osSUFBSUssS0FBSixDQUFVLENBQVYsRUFBYUcsT0FBcEIsRUFBNkJOLEVBQTdCLENBQWdDQyxFQUFoQyxDQUFtQ0MsSUFBbkM7QUFDQSxrQ0FBT0osSUFBSUssS0FBSixDQUFVLENBQVYsRUFBYUEsS0FBcEIsRUFBMkJILEVBQTNCLENBQThCQyxFQUE5QixDQUFpQ00sS0FBakM7QUFDSCxhQUxEO0FBTUFWLGVBQUcsOEJBQUgsRUFBbUMsWUFBTTtBQUNyQyxrQ0FBTyxxQkFBT0MsR0FBUCxDQUFXLE1BQVgsRUFBbUJPLFNBQTFCLEVBQXFDTCxFQUFyQyxDQUF3Q0MsRUFBeEMsQ0FBMkNDLElBQTNDO0FBQ0gsYUFGRDtBQUdILFNBaEJEO0FBaUJILEtBMUJEIiwiZmlsZSI6Impzb25fcGFyc2VyX3Rlc3RzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtleHBlY3R9IGZyb20gJ2NoYWknO1xuaW1wb3J0IHtcbiAgICBKTnVsbFAsXG4gICAgSkJvb2xQLFxufSBmcm9tICdqc29uX3BhcnNlcnMnO1xuXG5kZXNjcmliZSgnYnVpbGRpbmcgYSBKU09OIHBhcnNlcicsICgpID0+IHtcbiAgICBkZXNjcmliZSgnYSBwYXJzZXIgZm9yIEpOdWxsXFwncycsICgpID0+IHtcbiAgICAgICAgaXQoJ3BhcnNlcyB0aGUgc3RyaW5nIFxcJ251bGxcXCcgYW5kIHJldHVybnMgYSBKVmFsdWUuSk51bGwnLCAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBydW4gPSBKTnVsbFAucnVuKCdudWxsJyk7XG4gICAgICAgICAgICBleHBlY3QocnVuLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcbiAgICAgICAgICAgIGV4cGVjdChydW4udmFsdWVbMF0uaXNKTnVsbCkudG8uYmUudHJ1ZTtcbiAgICAgICAgICAgIGV4cGVjdChKTnVsbFAucnVuKCdudWx4JykuaXNGYWlsdXJlKS50by5iZS50cnVlO1xuICAgICAgICB9KTtcbiAgICB9KTtcbiAgICBkZXNjcmliZSgnYSBwYXJzZXIgZm9yIEpCb29sXFwncycsICgpID0+IHtcbiAgICAgICAgaXQoJ3BhcnNlcyB0aGUgc3RyaW5nIFxcJ3RydWVcXCcgYW5kIHJldHVybnMgYSBKVmFsdWUuSkJvb2wodHJ1ZSknLCAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBydW4gPSBKQm9vbFAucnVuKCd0cnVlJyk7XG4gICAgICAgICAgICBleHBlY3QocnVuLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcbiAgICAgICAgICAgIGV4cGVjdChydW4udmFsdWVbMF0uaXNKQm9vbCkudG8uYmUudHJ1ZTtcbiAgICAgICAgICAgIGV4cGVjdChydW4udmFsdWVbMF0udmFsdWUpLnRvLmJlLnRydWU7XG4gICAgICAgIH0pO1xuICAgICAgICBpdCgncGFyc2VzIHRoZSBzdHJpbmcgXFwnZmFsc2VcXCcgYW5kIHJldHVybnMgYSBKVmFsdWUuSkJvb2woZmFsc2UpJywgKCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgcnVuID0gSkJvb2xQLnJ1bignZmFsc2UnKTtcbiAgICAgICAgICAgIGV4cGVjdChydW4uaXNTdWNjZXNzKS50by5iZS50cnVlO1xuICAgICAgICAgICAgZXhwZWN0KHJ1bi52YWx1ZVswXS5pc0pCb29sKS50by5iZS50cnVlO1xuICAgICAgICAgICAgZXhwZWN0KHJ1bi52YWx1ZVswXS52YWx1ZSkudG8uYmUuZmFsc2U7XG4gICAgICAgIH0pO1xuICAgICAgICBpdCgnZmFpbHMgdG8gcGFyc2UgYW55dGhpbmcgZWxzZScsICgpID0+IHtcbiAgICAgICAgICAgIGV4cGVjdChKQm9vbFAucnVuKCd0cnV4JykuaXNGYWlsdXJlKS50by5iZS50cnVlO1xuICAgICAgICB9KTtcbiAgICB9KTtcbn0pO1xuIl19