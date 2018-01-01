define(['chai', 'json_parsers', 'classes'], function (_chai, _json_parsers, _classes) {
    'use strict';

    var text = _classes.Position.fromText;

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
        describe('a parser for JSON unescaped chars', function () {
            it('parses an unescaped character and returns a Success', function () {
                (0, _chai.expect)(_json_parsers.jUnescapedCharP.run(text('a')).isSuccess).to.be.true;
                (0, _chai.expect)(_json_parsers.jUnescapedCharP.run(text('A')).isSuccess).to.be.true;
                (0, _chai.expect)(_json_parsers.jUnescapedCharP.run(text('1')).isSuccess).to.be.true;
                (0, _chai.expect)(_json_parsers.jUnescapedCharP.run(text('"')).isFailure).to.be.true;
                (0, _chai.expect)(_json_parsers.jUnescapedCharP.run(text('\\')).isFailure).to.be.true;
            });
        });
        describe('a parser for JSON escaped chars', function () {
            it('parses an escaped character and returns a Success', function () {
                (0, _chai.expect)(_json_parsers.jEscapedCharP.run(text('\b')).isSuccess).to.be.true;
                (0, _chai.expect)(_json_parsers.jEscapedCharP.run(text('\f')).isSuccess).to.be.true;
                //            expect(jEscapedCharP.run(text('\n')).isSuccess).to.be.true;
                (0, _chai.expect)(_json_parsers.jEscapedCharP.run(text('\r')).isSuccess).to.be.true;
                (0, _chai.expect)(_json_parsers.jEscapedCharP.run(text('\t')).isSuccess).to.be.true;
                (0, _chai.expect)(_json_parsers.jEscapedCharP.run(text('a')).isFailure).to.be.true;
            });
        });
        describe('a parser for escaped 4-digits unicode chars', function () {
            it('parses an escaped character and returns a Success', function () {
                var run = _json_parsers.jUnicodeChar.run(text('\\u1a2e'));
                (0, _chai.expect)(run.isSuccess).to.be.true;
                (0, _chai.expect)(run.value[0]).to.be.eql(6702);
                (0, _chai.expect)(_json_parsers.jUnicodeChar.run(text('\\u0010')).value[0]).to.be.eql(16);
                (0, _chai.expect)(_json_parsers.jUnicodeChar.run(text('\\u000F')).value[0]).to.be.eql(15);
            });
        });
    });
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2pzLXNwZWMvanNvbl9wYXJzZXJfdGVzdHMuanMiXSwibmFtZXMiOlsidGV4dCIsImZyb21UZXh0IiwiZGVzY3JpYmUiLCJpdCIsInJ1biIsImlzU3VjY2VzcyIsInRvIiwiYmUiLCJ0cnVlIiwidmFsdWUiLCJpc0pOdWxsIiwiaXNGYWlsdXJlIiwiaXNKQm9vbCIsImZhbHNlIiwiZXFsIl0sIm1hcHBpbmdzIjoiOzs7QUFZQSxRQUFNQSxPQUFPLGtCQUFTQyxRQUF0Qjs7QUFFQUMsYUFBUyx3QkFBVCxFQUFtQyxZQUFNO0FBQ3JDQSxpQkFBUyx1QkFBVCxFQUFrQyxZQUFNO0FBQ3BDQyxlQUFHLHVEQUFILEVBQTRELFlBQU07QUFDOUQsb0JBQU1DLE1BQU0scUJBQU9BLEdBQVAsQ0FBVyxNQUFYLENBQVo7QUFDQSxrQ0FBT0EsSUFBSUMsU0FBWCxFQUFzQkMsRUFBdEIsQ0FBeUJDLEVBQXpCLENBQTRCQyxJQUE1QjtBQUNBLGtDQUFPSixJQUFJSyxLQUFKLENBQVUsQ0FBVixFQUFhQyxPQUFwQixFQUE2QkosRUFBN0IsQ0FBZ0NDLEVBQWhDLENBQW1DQyxJQUFuQztBQUNBLGtDQUFPLHFCQUFPSixHQUFQLENBQVcsTUFBWCxFQUFtQk8sU0FBMUIsRUFBcUNMLEVBQXJDLENBQXdDQyxFQUF4QyxDQUEyQ0MsSUFBM0M7QUFDSCxhQUxEO0FBTUgsU0FQRDtBQVFBTixpQkFBUyx1QkFBVCxFQUFrQyxZQUFNO0FBQ3BDQyxlQUFHLDZEQUFILEVBQWtFLFlBQU07QUFDcEUsb0JBQU1DLE1BQU0scUJBQU9BLEdBQVAsQ0FBVyxNQUFYLENBQVo7QUFDQSxrQ0FBT0EsSUFBSUMsU0FBWCxFQUFzQkMsRUFBdEIsQ0FBeUJDLEVBQXpCLENBQTRCQyxJQUE1QjtBQUNBLGtDQUFPSixJQUFJSyxLQUFKLENBQVUsQ0FBVixFQUFhRyxPQUFwQixFQUE2Qk4sRUFBN0IsQ0FBZ0NDLEVBQWhDLENBQW1DQyxJQUFuQztBQUNBLGtDQUFPSixJQUFJSyxLQUFKLENBQVUsQ0FB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QUFYLEVBQXNCQyxFQUF0QixDQUF5QkMsRUFBekIsQ0FBNEJDLElBQTVCO0FBQ0Esa0NBQU9KLElBQUlLLEtBQUosQ0FBVSxDQUFWLENBQVAsRUFBcUJILEVBQXJCLENBQXdCQyxFQUF4QixDQUEyQk8sR0FBM0IsQ0FBK0IsSUFBL0I7QUFDQSxrQ0FBTywyQkFBYVYsR0FBYixDQUFpQkosS0FBSyxTQUFMLENBQWpCLEVBQWtDUyxLQUFsQyxDQUF3QyxDQUF4QyxDQUFQLEVBQW1ESCxFQUFuRCxDQUFzREMsRUFBdEQsQ0FBeURPLEdBQXpELENBQTZELEVBQTdEO0FBQ0Esa0NBQU8sMkJBQWFWLEdBQWIsQ0FBaUJKLEtBQUssU0FBTCxDQUFqQixFQUFrQ1MsS0FBbEMsQ0FBd0MsQ0FBeEMsQ0FBUCxFQUFtREgsRUFBbkQsQ0FBc0RDLEVBQXRELENBQXlETyxHQUF6RCxDQUE2RCxFQUE3RDtBQUNILGFBTkQ7QUFPSCxTQVJEO0FBU0gsS0F0REQiLCJmaWxlIjoianNvbl9wYXJzZXJfdGVzdHMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge2V4cGVjdH0gZnJvbSAnY2hhaSc7XG5pbXBvcnQge1xuICAgIEpOdWxsUCxcbiAgICBKQm9vbFAsXG4gICAgalVuZXNjYXBlZENoYXJQLFxuICAgIGpFc2NhcGVkQ2hhclAsXG4gICAgalVuaWNvZGVDaGFyLFxufSBmcm9tICdqc29uX3BhcnNlcnMnO1xuaW1wb3J0IHtcbiAgICBQb3NpdGlvbixcbn0gZnJvbSAnY2xhc3Nlcyc7XG5cbmNvbnN0IHRleHQgPSBQb3NpdGlvbi5mcm9tVGV4dDtcblxuZGVzY3JpYmUoJ2J1aWxkaW5nIGEgSlNPTiBwYXJzZXInLCAoKSA9PiB7XG4gICAgZGVzY3JpYmUoJ2EgcGFyc2VyIGZvciBKTnVsbFxcJ3MnLCAoKSA9PiB7XG4gICAgICAgIGl0KCdwYXJzZXMgdGhlIHN0cmluZyBcXCdudWxsXFwnIGFuZCByZXR1cm5zIGEgSlZhbHVlLkpOdWxsJywgKCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgcnVuID0gSk51bGxQLnJ1bignbnVsbCcpO1xuICAgICAgICAgICAgZXhwZWN0KHJ1bi5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgICAgICAgICBleHBlY3QocnVuLnZhbHVlWzBdLmlzSk51bGwpLnRvLmJlLnRydWU7XG4gICAgICAgICAgICBleHBlY3QoSk51bGxQLnJ1bignbnVseCcpLmlzRmFpbHVyZSkudG8uYmUudHJ1ZTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG4gICAgZGVzY3JpYmUoJ2EgcGFyc2VyIGZvciBKQm9vbFxcJ3MnLCAoKSA9PiB7XG4gICAgICAgIGl0KCdwYXJzZXMgdGhlIHN0cmluZyBcXCd0cnVlXFwnIGFuZCByZXR1cm5zIGEgSlZhbHVlLkpCb29sKHRydWUpJywgKCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgcnVuID0gSkJvb2xQLnJ1bigndHJ1ZScpO1xuICAgICAgICAgICAgZXhwZWN0KHJ1bi5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgICAgICAgICBleHBlY3QocnVuLnZhbHVlWzBdLmlzSkJvb2wpLnRvLmJlLnRydWU7XG4gICAgICAgICAgICBleHBlY3QocnVuLnZhbHVlWzBdLnZhbHVlKS50by5iZS50cnVlO1xuICAgICAgICB9KTtcbiAgICAgICAgaXQoJ3BhcnNlcyB0aGUgc3RyaW5nIFxcJ2ZhbHNlXFwnIGFuZCByZXR1cm5zIGEgSlZhbHVlLkpCb29sKGZhbHNlKScsICgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHJ1biA9IEpCb29sUC5ydW4oJ2ZhbHNlJyk7XG4gICAgICAgICAgICBleHBlY3QocnVuLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcbiAgICAgICAgICAgIGV4cGVjdChydW4udmFsdWVbMF0uaXNKQm9vbCkudG8uYmUudHJ1ZTtcbiAgICAgICAgICAgIGV4cGVjdChydW4udmFsdWVbMF0udmFsdWUpLnRvLmJlLmZhbHNlO1xuICAgICAgICB9KTtcbiAgICAgICAgaXQoJ2ZhaWxzIHRvIHBhcnNlIGFueXRoaW5nIGVsc2UnLCAoKSA9PiB7XG4gICAgICAgICAgICBleHBlY3QoSkJvb2xQLnJ1bigndHJ1eCcpLmlzRmFpbHVyZSkudG8uYmUudHJ1ZTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG4gICAgZGVzY3JpYmUoJ2EgcGFyc2VyIGZvciBKU09OIHVuZXNjYXBlZCBjaGFycycsICgpID0+IHtcbiAgICAgICAgaXQoJ3BhcnNlcyBhbiB1bmVzY2FwZWQgY2hhcmFjdGVyIGFuZCByZXR1cm5zIGEgU3VjY2VzcycsICgpID0+IHtcbiAgICAgICAgICAgIGV4cGVjdChqVW5lc2NhcGVkQ2hhclAucnVuKHRleHQoJ2EnKSkuaXNTdWNjZXNzKS50by5iZS50cnVlO1xuICAgICAgICAgICAgZXhwZWN0KGpVbmVzY2FwZWRDaGFyUC5ydW4odGV4dCgnQScpKS5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgICAgICAgICBleHBlY3QoalVuZXNjYXBlZENoYXJQLnJ1bih0ZXh0KCcxJykpLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcbiAgICAgICAgICAgIGV4cGVjdChqVW5lc2NhcGVkQ2hhclAucnVuKHRleHQoJ1wiJykpLmlzRmFpbHVyZSkudG8uYmUudHJ1ZTtcbiAgICAgICAgICAgIGV4cGVjdChqVW5lc2NhcGVkQ2hhclAucnVuKHRleHQoJ1xcXFwnKSkuaXNGYWlsdXJlKS50by5iZS50cnVlO1xuICAgICAgICB9KTtcbiAgICB9KTtcbiAgICBkZXNjcmliZSgnYSBwYXJzZXIgZm9yIEpTT04gZXNjYXBlZCBjaGFycycsICgpID0+IHtcbiAgICAgICAgaXQoJ3BhcnNlcyBhbiBlc2NhcGVkIGNoYXJhY3RlciBhbmQgcmV0dXJucyBhIFN1Y2Nlc3MnLCAoKSA9PiB7XG4gICAgICAgICAgICBleHBlY3QoakVzY2FwZWRDaGFyUC5ydW4odGV4dCgnXFxiJykpLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcbiAgICAgICAgICAgIGV4cGVjdChqRXNjYXBlZENoYXJQLnJ1bih0ZXh0KCdcXGYnKSkuaXNTdWNjZXNzKS50by5iZS50cnVlO1xuLy8gICAgICAgICAgICBleHBlY3QoakVzY2FwZWRDaGFyUC5ydW4odGV4dCgnXFxuJykpLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcbiAgICAgICAgICAgIGV4cGVjdChqRXNjYXBlZENoYXJQLnJ1bih0ZXh0KCdcXHInKSkuaXNTdWNjZXNzKS50by5iZS50cnVlO1xuICAgICAgICAgICAgZXhwZWN0KGpFc2NhcGVkQ2hhclAucnVuKHRleHQoJ1xcdCcpKS5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgICAgICAgICBleHBlY3QoakVzY2FwZWRDaGFyUC5ydW4odGV4dCgnYScpKS5pc0ZhaWx1cmUpLnRvLmJlLnRydWU7XG4gICAgICAgIH0pO1xuICAgIH0pO1xuICAgIGRlc2NyaWJlKCdhIHBhcnNlciBmb3IgZXNjYXBlZCA0LWRpZ2l0cyB1bmljb2RlIGNoYXJzJywgKCkgPT4ge1xuICAgICAgICBpdCgncGFyc2VzIGFuIGVzY2FwZWQgY2hhcmFjdGVyIGFuZCByZXR1cm5zIGEgU3VjY2VzcycsICgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHJ1biA9IGpVbmljb2RlQ2hhci5ydW4odGV4dCgnXFxcXHUxYTJlJykpO1xuICAgICAgICAgICAgZXhwZWN0KHJ1bi5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgICAgICAgICBleHBlY3QocnVuLnZhbHVlWzBdKS50by5iZS5lcWwoNjcwMik7XG4gICAgICAgICAgICBleHBlY3QoalVuaWNvZGVDaGFyLnJ1bih0ZXh0KCdcXFxcdTAwMTAnKSkudmFsdWVbMF0pLnRvLmJlLmVxbCgxNik7XG4gICAgICAgICAgICBleHBlY3QoalVuaWNvZGVDaGFyLnJ1bih0ZXh0KCdcXFxcdTAwMEYnKSkudmFsdWVbMF0pLnRvLmJlLmVxbCgxNSk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xufSk7XG4iXX0=