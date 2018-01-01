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
    });
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2pzLXNwZWMvanNvbl9wYXJzZXJfdGVzdHMuanMiXSwibmFtZXMiOlsidGV4dCIsImZyb21UZXh0IiwiZGVzY3JpYmUiLCJpdCIsInJ1biIsImlzU3VjY2VzcyIsInRvIiwiYmUiLCJ0cnVlIiwidmFsdWUiLCJpc0pOdWxsIiwiaXNGYWlsdXJlIiwiaXNKQm9vbCIsImZhbHNlIl0sIm1hcHBpbmdzIjoiOzs7QUFXQSxRQUFNQSxPQUFPLGtCQUFTQyxRQUF0Qjs7QUFFQUMsYUFBUyx3QkFBVCxFQUFtQyxZQUFNO0FBQ3JDQSxpQkFBUyx1QkFBVCxFQUFrQyxZQUFNO0FBQ3BDQyxlQUFHLHVEQUFILEVBQTRELFlBQU07QUFDOUQsb0JBQU1DLE1BQU0scUJBQU9BLEdBQVAsQ0FBVyxNQUFYLENBQVo7QUFDQSxrQ0FBT0EsSUFBSUMsU0FBWCxFQUFzQkMsRUFBdEIsQ0FBeUJDLEVBQXpCLENBQTRCQyxJQUE1QjtBQUNBLGtDQUFPSixJQUFJSyxLQUFKLENBQVUsQ0FBVixFQUFhQyxPQUFwQixFQUE2QkosRUFBN0IsQ0FBZ0NDLEVBQWhDLENBQW1DQyxJQUFuQztBQUNBLGtDQUFPLHFCQUFPSixHQUFQLENBQVcsTUFBWCxFQUFtQk8sU0FBMUIsRUFBcUNMLEVBQXJDLENBQXdDQyxFQUF4QyxDQUEyQ0MsSUFBM0M7QUFDSCxhQUxEO0FBTUgsU0FQRDtBQVFBTixpQkFBUyx1QkFBVCxFQUFrQyxZQUFNO0FBQ3BDQyxlQUFHLDZEQUFILEVBQWtFLFlBQU07QUFDcEUsb0JBQU1DLE1BQU0scUJBQU9BLEdBQVAsQ0FBVyxNQUFYLENBQVo7QUFDQSxrQ0FBT0EsSUFBSUMsU0FBWCxFQUFzQkMsRUFBdEIsQ0FBeUJDLEVBQXpCLENBQTRCQyxJQUE1QjtBQUNBLGtDQUFPSixJQUFJSyxLQUFKLENBQVUsQ0FBVixFQUFhRyxPQUFwQixFQUE2Qk4sRUFBN0IsQ0FBZ0NDLEVBQWhDLENBQW1DQyxJQUFuQztBQUNBLGtDQUFPSixJQUFJSyxLQUFKLENBQVUsQ0FBVixFQUFhQSxLQUFwQixFQUEyQkgsRUFBM0IsQ0FBOEJDLEVBQTlCLENBQWlDQyxJQUFqQztBQUNILGFBTEQ7QUFNQUwsZUFBRywrREFBSCxFQUFvRSxZQUFNO0FBQ3RFLG9CQUFNQyxNQUFNLHFCQUFPQSxHQUFQLENBQVcsT0FBWCxDQUFaO0FBQ0Esa0NBQU9BLElBQUlDLFNBQVgsRUFBc0JDLEVBQXRCLENBQXlCQyxFQUF6QixDQUE0QkMsSUFBNUI7QUFDQSxrQ0FBT0osSUFBSUssS0FBSixDQUFVLENBQVYsRUFBYUcsT0FBcEIsRUFBNkJOLEVBQTdCLENBQWdDQyxFQUFoQyxDQUFtQ0MsSUFBbkM7QUFDQSxrQ0FBT0osSUFBSUssS0FBSixDQUFVLENBQVYsRUFBYUEsS0FBcEIsRUFBMkJILEVBQTNCLENBQThCQyxFQUE5QixDQUFpQ00sS0FBakM7QUFDSCxhQUxEO0FBTUFWLGVBQUcsOEJBQUgsRUFBbUMsWUFBTTtBQUNyQyxrQ0FBTyxxQkFBT0MsR0FBUCxDQUFXLE1BQVgsRUFBbUJPLFNBQTFCLEVBQXFDTCxFQUFyQyxDQUF3Q0MsRUFBeEMsQ0FBMkNDLElBQTNDO0FBQ0gsYUFGRDtBQUdILFNBaEJEO0FBaUJBTixpQkFBUyxtQ0FBVCxFQUE4QyxZQUFNO0FBQ2hEQyxlQUFHLHFEQUFILEVBQTBELFlBQU07QUFDNUQsa0NBQU8sOEJBQWdCQyxHQUFoQixDQUFvQkosS0FBSyxHQUFMLENBQXBCLEVBQStCSyxTQUF0QyxFQUFpREMsRUFBakQsQ0FBb0RDLEVBQXBELENBQXVEQyxJQUF2RDtBQUNBLGtDQUFPLDhCQUFnQkosR0FBaEIsQ0FBb0JKLEtBQUssR0FBTCxDQUFwQixFQUErQkssU0FBdEMsRUFBaURDLEVBQWpELENBQW9EQyxFQUFwRCxDQUF1REMsSUFBdkQ7QUFDQSxrQ0FBTyw4QkFBZ0JKLEdBQWhCLENBQW9CSixLQUFLLEdBQUwsQ0FBcEIsRUFBK0JLLFNBQXRDLEVBQWlEQyxFQUFqRCxDQUFvREMsRUFBcEQsQ0FBdURDLElBQXZEO0FBQ0Esa0NBQU8sOEJBQWdCSixHQUFoQixDQUFvQkosS0FBSyxHQUFMLENBQXBCLEVBQStCVyxTQUF0QyxFQUFpREwsRUFBakQsQ0FBb0RDLEVBQXBELENBQXVEQyxJQUF2RDtBQUNBLGtDQUFPLDhCQUFnQkosR0FBaEIsQ0FBb0JKLEtBQUssSUFBTCxDQUFwQixFQUFnQ1csU0FBdkMsRUFBa0RMLEVBQWxELENBQXFEQyxFQUFyRCxDQUF3REMsSUFBeEQ7QUFDSCxhQU5EO0FBT0gsU0FSRDtBQVNBTixpQkFBUyxpQ0FBVCxFQUE0QyxZQUFNO0FBQzlDQyxlQUFHLG1EQUFILEVBQXdELFlBQU07QUFDMUQsa0NBQU8sNEJBQWNDLEdBQWQsQ0FBa0JKLEtBQUssSUFBTCxDQUFsQixFQUE4QkssU0FBckMsRUFBZ0RDLEVBQWhELENBQW1EQyxFQUFuRCxDQUFzREMsSUFBdEQ7QUFDQSxrQ0FBTyw0QkFBY0osR0FBZCxDQUFrQkosS0FBSyxJQUFMLENBQWxCLEVBQThCSyxTQUFyQyxFQUFnREMsRUFBaEQsQ0FBbURDLEVBQW5ELENBQXNEQyxJQUF0RDtBQUNaO0FBQ1ksa0NBQU8sNEJBQWNKLEdBQWQsQ0FBa0JKLEtBQUssSUFBTCxDQUFsQixFQUE4QkssU0FBckMsRUFBZ0RDLEVBQWhELENBQW1EQyxFQUFuRCxDQUFzREMsSUFBdEQ7QUFDQSxrQ0FBTyw0QkFBY0osR0FBZCxDQUFrQkosS0FBSyxJQUFMLENBQWxCLEVBQThCSyxTQUFyQyxFQUFnREMsRUFBaEQsQ0FBbURDLEVBQW5ELENBQXNEQyxJQUF0RDtBQUNBLGtDQUFPLDRCQUFjSixHQUFkLENBQWtCSixLQUFLLEdBQUwsQ0FBbEIsRUFBNkJXLFNBQXBDLEVBQStDTCxFQUEvQyxDQUFrREMsRUFBbEQsQ0FBcURDLElBQXJEO0FBQ0gsYUFQRDtBQVFILFNBVEQ7QUFVSCxLQTdDRCIsImZpbGUiOiJqc29uX3BhcnNlcl90ZXN0cy5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7ZXhwZWN0fSBmcm9tICdjaGFpJztcbmltcG9ydCB7XG4gICAgSk51bGxQLFxuICAgIEpCb29sUCxcbiAgICBqVW5lc2NhcGVkQ2hhclAsXG4gICAgakVzY2FwZWRDaGFyUCxcbn0gZnJvbSAnanNvbl9wYXJzZXJzJztcbmltcG9ydCB7XG4gICAgUG9zaXRpb24sXG59IGZyb20gJ2NsYXNzZXMnO1xuXG5jb25zdCB0ZXh0ID0gUG9zaXRpb24uZnJvbVRleHQ7XG5cbmRlc2NyaWJlKCdidWlsZGluZyBhIEpTT04gcGFyc2VyJywgKCkgPT4ge1xuICAgIGRlc2NyaWJlKCdhIHBhcnNlciBmb3IgSk51bGxcXCdzJywgKCkgPT4ge1xuICAgICAgICBpdCgncGFyc2VzIHRoZSBzdHJpbmcgXFwnbnVsbFxcJyBhbmQgcmV0dXJucyBhIEpWYWx1ZS5KTnVsbCcsICgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHJ1biA9IEpOdWxsUC5ydW4oJ251bGwnKTtcbiAgICAgICAgICAgIGV4cGVjdChydW4uaXNTdWNjZXNzKS50by5iZS50cnVlO1xuICAgICAgICAgICAgZXhwZWN0KHJ1bi52YWx1ZVswXS5pc0pOdWxsKS50by5iZS50cnVlO1xuICAgICAgICAgICAgZXhwZWN0KEpOdWxsUC5ydW4oJ251bHgnKS5pc0ZhaWx1cmUpLnRvLmJlLnRydWU7XG4gICAgICAgIH0pO1xuICAgIH0pO1xuICAgIGRlc2NyaWJlKCdhIHBhcnNlciBmb3IgSkJvb2xcXCdzJywgKCkgPT4ge1xuICAgICAgICBpdCgncGFyc2VzIHRoZSBzdHJpbmcgXFwndHJ1ZVxcJyBhbmQgcmV0dXJucyBhIEpWYWx1ZS5KQm9vbCh0cnVlKScsICgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHJ1biA9IEpCb29sUC5ydW4oJ3RydWUnKTtcbiAgICAgICAgICAgIGV4cGVjdChydW4uaXNTdWNjZXNzKS50by5iZS50cnVlO1xuICAgICAgICAgICAgZXhwZWN0KHJ1bi52YWx1ZVswXS5pc0pCb29sKS50by5iZS50cnVlO1xuICAgICAgICAgICAgZXhwZWN0KHJ1bi52YWx1ZVswXS52YWx1ZSkudG8uYmUudHJ1ZTtcbiAgICAgICAgfSk7XG4gICAgICAgIGl0KCdwYXJzZXMgdGhlIHN0cmluZyBcXCdmYWxzZVxcJyBhbmQgcmV0dXJucyBhIEpWYWx1ZS5KQm9vbChmYWxzZSknLCAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBydW4gPSBKQm9vbFAucnVuKCdmYWxzZScpO1xuICAgICAgICAgICAgZXhwZWN0KHJ1bi5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgICAgICAgICBleHBlY3QocnVuLnZhbHVlWzBdLmlzSkJvb2wpLnRvLmJlLnRydWU7XG4gICAgICAgICAgICBleHBlY3QocnVuLnZhbHVlWzBdLnZhbHVlKS50by5iZS5mYWxzZTtcbiAgICAgICAgfSk7XG4gICAgICAgIGl0KCdmYWlscyB0byBwYXJzZSBhbnl0aGluZyBlbHNlJywgKCkgPT4ge1xuICAgICAgICAgICAgZXhwZWN0KEpCb29sUC5ydW4oJ3RydXgnKS5pc0ZhaWx1cmUpLnRvLmJlLnRydWU7XG4gICAgICAgIH0pO1xuICAgIH0pO1xuICAgIGRlc2NyaWJlKCdhIHBhcnNlciBmb3IgSlNPTiB1bmVzY2FwZWQgY2hhcnMnLCAoKSA9PiB7XG4gICAgICAgIGl0KCdwYXJzZXMgYW4gdW5lc2NhcGVkIGNoYXJhY3RlciBhbmQgcmV0dXJucyBhIFN1Y2Nlc3MnLCAoKSA9PiB7XG4gICAgICAgICAgICBleHBlY3QoalVuZXNjYXBlZENoYXJQLnJ1bih0ZXh0KCdhJykpLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcbiAgICAgICAgICAgIGV4cGVjdChqVW5lc2NhcGVkQ2hhclAucnVuKHRleHQoJ0EnKSkuaXNTdWNjZXNzKS50by5iZS50cnVlO1xuICAgICAgICAgICAgZXhwZWN0KGpVbmVzY2FwZWRDaGFyUC5ydW4odGV4dCgnMScpKS5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgICAgICAgICBleHBlY3QoalVuZXNjYXBlZENoYXJQLnJ1bih0ZXh0KCdcIicpKS5pc0ZhaWx1cmUpLnRvLmJlLnRydWU7XG4gICAgICAgICAgICBleHBlY3QoalVuZXNjYXBlZENoYXJQLnJ1bih0ZXh0KCdcXFxcJykpLmlzRmFpbHVyZSkudG8uYmUudHJ1ZTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG4gICAgZGVzY3JpYmUoJ2EgcGFyc2VyIGZvciBKU09OIGVzY2FwZWQgY2hhcnMnLCAoKSA9PiB7XG4gICAgICAgIGl0KCdwYXJzZXMgYW4gZXNjYXBlZCBjaGFyYWN0ZXIgYW5kIHJldHVybnMgYSBTdWNjZXNzJywgKCkgPT4ge1xuICAgICAgICAgICAgZXhwZWN0KGpFc2NhcGVkQ2hhclAucnVuKHRleHQoJ1xcYicpKS5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgICAgICAgICBleHBlY3QoakVzY2FwZWRDaGFyUC5ydW4odGV4dCgnXFxmJykpLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcbi8vICAgICAgICAgICAgZXhwZWN0KGpFc2NhcGVkQ2hhclAucnVuKHRleHQoJ1xcbicpKS5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgICAgICAgICBleHBlY3QoakVzY2FwZWRDaGFyUC5ydW4odGV4dCgnXFxyJykpLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcbiAgICAgICAgICAgIGV4cGVjdChqRXNjYXBlZENoYXJQLnJ1bih0ZXh0KCdcXHQnKSkuaXNTdWNjZXNzKS50by5iZS50cnVlO1xuICAgICAgICAgICAgZXhwZWN0KGpFc2NhcGVkQ2hhclAucnVuKHRleHQoJ2EnKSkuaXNGYWlsdXJlKS50by5iZS50cnVlO1xuICAgICAgICB9KTtcbiAgICB9KTtcbn0pO1xuIl19