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
        (0, _chai.expect)(_json_parsers.jEscapedCharP.run(text('\\b')).isSuccess).to.be.true;
        (0, _chai.expect)(_json_parsers.jEscapedCharP.run(text('\\b')).value[0]).to.be.eql('\b');
        (0, _chai.expect)(_json_parsers.jEscapedCharP.run(text('\\f')).isSuccess).to.be.true;
        (0, _chai.expect)(_json_parsers.jEscapedCharP.run(text('\\f')).value[0]).to.be.eql('\f');
        (0, _chai.expect)(_json_parsers.jEscapedCharP.run(text('\\r')).isSuccess).to.be.true;
        (0, _chai.expect)(_json_parsers.jEscapedCharP.run(text('\\t')).isSuccess).to.be.true;
        (0, _chai.expect)(_json_parsers.jEscapedCharP.run(text('\t')).isFailure).to.be.true;
      });
    });
    describe('a parser for escaped 4-digits unicode chars', function () {
      it('parses an escaped character and returns a Success', function () {
        var run = _json_parsers.jUnicodeCharP.run(text('\\u1a2e'));
        (0, _chai.expect)(run.isSuccess).to.be.true;
        (0, _chai.expect)(run.value[0]).to.be.eql(6702);
        (0, _chai.expect)(_json_parsers.jUnicodeCharP.run(text('\\u0010')).value[0]).to.be.eql(16);
        (0, _chai.expect)(_json_parsers.jUnicodeCharP.run(text('\\u000F')).value[0]).to.be.eql(15);
      });
    });
    describe('a parser for doublequoted JSON strings', function () {
      it('parses a lot of characters and returns a JValue.JString', function () {
        var run = _json_parsers.JStringP.run(text('\"test string\"')); // works also with unescaped doublequotes
        (0, _chai.expect)(run.isSuccess).to.be.true;
        (0, _chai.expect)(run.value[0].isJString).to.be.true;
        (0, _chai.expect)(run.value[0].value).to.be.eql('test string');
      });
      it('handles unicodes very roughly, and no escaped chars yet...', function () {
        var run = _json_parsers.JStringP.run(text('"test \\u0010 string"'));
        (0, _chai.expect)(run.isSuccess).to.be.true;
        (0, _chai.expect)(run.value[0].isJString).to.be.true;
        (0, _chai.expect)(run.value[0].value).to.be.eql('test 16 string');
      });
    });
    describe('a parser for numbers inside JSON files', function () {
      it('parses strings and returns Success\'es', function () {
        (0, _chai.expect)(_json_parsers.jNumberStringP.run(text('0')).value[0]).to.be.eql('0');
        (0, _chai.expect)(_json_parsers.jNumberStringP.run(text('0.1')).value[0]).to.be.eql('0.1');
        (0, _chai.expect)(_json_parsers.jNumberStringP.run(text('-0')).value[0]).to.be.eql('-0');
        (0, _chai.expect)(_json_parsers.jNumberStringP.run(text('-0.1')).value[0]).to.be.eql('-0.1');
        (0, _chai.expect)(_json_parsers.jNumberStringP.run(text('0.1234e145')).value[0]).to.be.eql('0.1234e145');
        (0, _chai.expect)(_json_parsers.jNumberStringP.run(text('-0.1234e-145')).value[0]).to.be.eql('-0.1234e-145');
        (0, _chai.expect)(_json_parsers.jNumberStringP.run(text('123')).value[0]).to.be.eql('123');
        (0, _chai.expect)(_json_parsers.jNumberStringP.run(text('123.12')).value[0]).to.be.eql('123.12');
        (0, _chai.expect)(_json_parsers.jNumberStringP.run(text('-123')).value[0]).to.be.eql('-123');
        (0, _chai.expect)(_json_parsers.jNumberStringP.run(text('-123.12')).value[0]).to.be.eql('-123.12');
        (0, _chai.expect)(_json_parsers.jNumberStringP.run(text('123e2')).value[0]).to.be.eql('123e2');
        (0, _chai.expect)(_json_parsers.jNumberStringP.run(text('-123e2')).value[0]).to.be.eql('-123e2');
        (0, _chai.expect)(_json_parsers.jNumberStringP.run(text('-123e-2')).value[0]).to.be.eql('-123e-2');
        (0, _chai.expect)(_json_parsers.jNumberStringP.run(text('-123.234e-2')).value[0]).to.be.eql('-123.234e-2');
      });
      it('parses strings and returns JNumber\'s', function () {
        (0, _chai.expect)(_json_parsers.JNumberP.run(text('0')).value[0].value).to.be.eql(0);
        (0, _chai.expect)(_json_parsers.JNumberP.run(text('0.1')).value[0].value).to.be.eql(0.1);
        (0, _chai.expect)(_json_parsers.JNumberP.run(text('-0')).value[0].value).to.be.eql(-0);
        (0, _chai.expect)(_json_parsers.JNumberP.run(text('-0.1')).value[0].value).to.be.eql(-0.1);
        (0, _chai.expect)(_json_parsers.JNumberP.run(text('0.1234e145')).value[0].value).to.be.eql(0.1234e145);
        (0, _chai.expect)(_json_parsers.JNumberP.run(text('-0.1234e-145')).value[0].value).to.be.eql(-0.1234e-145);
        (0, _chai.expect)(_json_parsers.JNumberP.run(text('123')).value[0].value).to.be.eql(123);
        (0, _chai.expect)(_json_parsers.JNumberP.run(text('123.12')).value[0].value).to.be.eql(123.12);
        (0, _chai.expect)(_json_parsers.JNumberP.run(text('-123')).value[0].value).to.be.eql(-123);
        (0, _chai.expect)(_json_parsers.JNumberP.run(text('-123.12')).value[0].value).to.be.eql(-123.12);
        (0, _chai.expect)(_json_parsers.JNumberP.run(text('123e2')).value[0].value).to.be.eql(123e2);
        (0, _chai.expect)(_json_parsers.JNumberP.run(text('-123e2')).value[0].value).to.be.eql(-123e2);
        (0, _chai.expect)(_json_parsers.JNumberP.run(text('-123e-2')).value[0].value).to.be.eql(-123e-2);
        (0, _chai.expect)(_json_parsers.JNumberP.run(text('-123.234e-2')).value[0].value).to.be.eql(-123.234e-2);
      });
    });
    describe('a parser for arrays discards square brackets', function () {
      describe('and distills into JValue.JArray\'s', function () {
        it('nothing if that\'s the case', function () {
          var jarra = '[]';
          var run = _json_parsers.JArrayP.run(text(jarra));
          (0, _chai.expect)(run.isSuccess).to.be.true;
          (0, _chai.expect)(run.value[0].isJArray).to.be.true;
        });
        it('nulls and bools', function () {
          var jarra = '[true ,   false , null,      true]';
          var run = _json_parsers.JArrayP.run(text(jarra));
          (0, _chai.expect)(run.isSuccess).to.be.true;
          (0, _chai.expect)(run.value[0].isJArray).to.be.true;
        });
      });
    });
  });
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2pzLXNwZWMvanNvbl9wYXJzZXJfdGVzdHMuanMiXSwibmFtZXMiOlsidGV4dCIsIlBvc2l0aW9uIiwiZnJvbVRleHQiLCJkZXNjcmliZSIsIml0IiwicnVuIiwiSk51bGxQIiwiaXNTdWNjZXNzIiwidG8iLCJiZSIsInRydWUiLCJ2YWx1ZSIsImlzSk51bGwiLCJpc0ZhaWx1cmUiLCJKQm9vbFAiLCJpc0pCb29sIiwiZmFsc2UiLCJqVW5lc2NhcGVkQ2hhclAiLCJqRXNjYXBlZENoYXJQIiwiZXFsIiwialVuaWNvZGVDaGFyUCIsIkpTdHJpbmdQIiwiaXNKU3RyaW5nIiwiak51bWJlclN0cmluZ1AiLCJKTnVtYmVyUCIsImphcnJhIiwiSkFycmF5UCIsImlzSkFycmF5Il0sIm1hcHBpbmdzIjoiOzs7QUFnQkEsTUFBTUEsT0FBT0Msa0JBQVNDLFFBQXRCOztBQUVBQyxXQUFTLHdCQUFULEVBQW1DLFlBQU07QUFDdkNBLGFBQVMsdUJBQVQsRUFBa0MsWUFBTTtBQUN0Q0MsU0FBRyx1REFBSCxFQUE0RCxZQUFNO0FBQ2hFLFlBQU1DLE1BQU1DLHFCQUFPRCxHQUFQLENBQVcsTUFBWCxDQUFaO0FBQ0EsMEJBQU9BLElBQUlFLFNBQVgsRUFBc0JDLEVBQXRCLENBQXlCQyxFQUF6QixDQUE0QkMsSUFBNUI7QUFDQSwwQkFBT0wsSUFBSU0sS0FBSixDQUFVLENBQVYsRUFBYUMsT0FBcEIsRUFBNkJKLEVBQTdCLENBQWdDQyxFQUFoQyxDQUFtQ0MsSUFBbkM7QUFDQSwwQkFBT0oscUJBQU9ELEdBQVAsQ0FBVyxNQUFYLEVBQW1CUSxTQUExQixFQUFxQ0wsRUFBckMsQ0FBd0NDLEVBQXhDLENBQTJDQyxJQUEzQztBQUNELE9BTEQ7QUFNRCxLQVBEO0FBUUFQLGFBQVMsdUJBQVQsRUFBa0MsWUFBTTtBQUN0Q0MsU0FBRyw2REFBSCxFQUFrRSxZQUFNO0FBQ3RFLFlBQU1DLE1BQU1TLHFCQUFPVCxHQUFQLENBQVcsTUFBWCxDQUFaO0FBQ0EsMEJBQU9BLElBQUlF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T0FmRDtBQWdCRCxLQWpDRDtBQWtDQWhCLGFBQVMsOENBQVQsRUFBeUQsWUFBTTtBQUM3REEsZUFBUyxvQ0FBVCxFQUErQyxZQUFNO0FBQ25EQyxXQUFHLDZCQUFILEVBQWtDLFlBQU07QUFDdEMsY0FBTXFCLFFBQVEsSUFBZDtBQUNBLGNBQU1wQixNQUFNcUIsc0JBQVFyQixHQUFSLENBQVlMLEtBQUt5QixLQUFMLENBQVosQ0FBWjtBQUNBLDRCQUFPcEIsSUFBSUUsU0FBWCxFQUFzQkMsRUFBdEIsQ0FBeUJDLEVBQXpCLENBQTRCQyxJQUE1QjtBQUNBLDRCQUFPTCxJQUFJTSxLQUFKLENBQVUsQ0FBVixFQUFhZ0IsUUFBcEIsRUFBOEJuQixFQUE5QixDQUFpQ0MsRUFBakMsQ0FBb0NDLElBQXBDO0FBQ0QsU0FMRDtBQU1BTixXQUFHLGlCQUFILEVBQXNCLFlBQU07QUFDMUIsY0FBTXFCLFFBQVEsb0NBQWQ7QUFDQSxjQUFNcEIsTUFBTXFCLHNCQUFRckIsR0FBUixDQUFZTCxLQUFLeUIsS0FBTCxDQUFaLENBQVo7QUFDQSw0QkFBT3BCLElBQUlFLFNBQVgsRUFBc0JDLEVBQXRCLENBQXlCQyxFQUF6QixDQUE0QkMsSUFBNUI7QUFDQSw0QkFBT0wsSUFBSU0sS0FBSixDQUFVLENBQVYsRUFBYWdCLFFBQXBCLEVBQThCbkIsRUFBOUIsQ0FBaUNDLEVBQWpDLENBQW9DQyxJQUFwQztBQUNELFNBTEQ7QUFNRCxPQWJEO0FBY0QsS0FmRDtBQWdCRCxHQXZIRCIsImZpbGUiOiJqc29uX3BhcnNlcl90ZXN0cy5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGV4cGVjdCB9IGZyb20gJ2NoYWknO1xuaW1wb3J0IHtcbiAgSk51bGxQLFxuICBKQm9vbFAsXG4gIGpVbmVzY2FwZWRDaGFyUCxcbiAgakVzY2FwZWRDaGFyUCxcbiAgalVuaWNvZGVDaGFyUCxcbiAgSlN0cmluZ1AsXG4gIGpOdW1iZXJTdHJpbmdQLFxuICBKTnVtYmVyUCxcbiAgSkFycmF5UCxcbn0gZnJvbSAnanNvbl9wYXJzZXJzJztcbmltcG9ydCB7XG4gIFBvc2l0aW9uLFxufSBmcm9tICdjbGFzc2VzJztcblxuY29uc3QgdGV4dCA9IFBvc2l0aW9uLmZyb21UZXh0O1xuXG5kZXNjcmliZSgnYnVpbGRpbmcgYSBKU09OIHBhcnNlcicsICgpID0+IHtcbiAgZGVzY3JpYmUoJ2EgcGFyc2VyIGZvciBKTnVsbFxcJ3MnLCAoKSA9PiB7XG4gICAgaXQoJ3BhcnNlcyB0aGUgc3RyaW5nIFxcJ251bGxcXCcgYW5kIHJldHVybnMgYSBKVmFsdWUuSk51bGwnLCAoKSA9PiB7XG4gICAgICBjb25zdCBydW4gPSBKTnVsbFAucnVuKCdudWxsJyk7XG4gICAgICBleHBlY3QocnVuLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcbiAgICAgIGV4cGVjdChydW4udmFsdWVbMF0uaXNKTnVsbCkudG8uYmUudHJ1ZTtcbiAgICAgIGV4cGVjdChKTnVsbFAucnVuKCdudWx4JykuaXNGYWlsdXJlKS50by5iZS50cnVlO1xuICAgIH0pO1xuICB9KTtcbiAgZGVzY3JpYmUoJ2EgcGFyc2VyIGZvciBKQm9vbFxcJ3MnLCAoKSA9PiB7XG4gICAgaXQoJ3BhcnNlcyB0aGUgc3RyaW5nIFxcJ3RydWVcXCcgYW5kIHJldHVybnMgYSBKVmFsdWUuSkJvb2wodHJ1ZSknLCAoKSA9PiB7XG4gICAgICBjb25zdCBydW4gPSBKQm9vbFAucnVuKCd0cnVlJyk7XG4gICAgICBleHBlY3QocnVuLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcbiAgICAgIGV4cGVjdChydW4udmFsdWVbMF0uaXNKQm9vbCkudG8uYmUudHJ1ZTtcbiAgICAgIGV4cGVjdChydW4udmFsdWVbMF0udmFsdWUpLnRvLmJlLnRydWU7XG4gICAgfSk7XG4gICAgaXQoJ3BhcnNlcyB0aGUgc3RyaW5nIFxcJ2ZhbHNlXFwnIGFuZCByZXR1cm5zIGEgSlZhbHVlLkpCb29sKGZhbHNlKScsICgpID0+IHtcbiAgICAgIGNvbnN0IHJ1biA9IEpCb29sUC5ydW4oJ2ZhbHNlJyk7XG4gICAgICBleHBlY3QocnVuLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcbiAgICAgIGV4cGVjdChydW4udmFsdWVbMF0uaXNKQm9vbCkudG8uYmUudHJ1ZTtcbiAgICAgIGV4cGVjdChydW4udmFsdWVbMF0udmFsdWUpLnRvLmJlLmZhbHNlO1xuICAgIH0pO1xuICAgIGl0KCdmYWlscyB0byBwYXJzZSBhbnl0aGluZyBlbHNlJywgKCkgPT4ge1xuICAgICAgZXhwZWN0KEpCb29sUC5ydW4oJ3RydXgnKS5pc0ZhaWx1cmUpLnRvLmJlLnRydWU7XG4gICAgfSk7XG4gIH0pO1xuICBkZXNjcmliZSgnYSBwYXJzZXIgZm9yIEpTT04gdW5lc2NhcGVkIGNoYXJzJywgKCkgPT4ge1xuICAgIGl0KCdwYXJzZXMgYW4gdW5lc2NhcGVkIGNoYXJhY3RlciBhbmQgcmV0dXJucyBhIFN1Y2Nlc3MnLCAoKSA9PiB7XG4gICAgICBleHBlY3QoalVuZXNjYXBlZENoYXJQLnJ1bih0ZXh0KCdhJykpLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcbiAgICAgIGV4cGVjdChqVW5lc2NhcGVkQ2hhclAucnVuKHRleHQoJ0EnKSkuaXNTdWNjZXNzKS50by5iZS50cnVlO1xuICAgICAgZXhwZWN0KGpVbmVzY2FwZWRDaGFyUC5ydW4odGV4dCgnMScpKS5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgICBleHBlY3QoalVuZXNjYXBlZENoYXJQLnJ1bih0ZXh0KCdcIicpKS5pc0ZhaWx1cmUpLnRvLmJlLnRydWU7XG4gICAgICBleHBlY3QoalVuZXNjYXBlZENoYXJQLnJ1bih0ZXh0KCdcXFxcJykpLmlzRmFpbHVyZSkudG8uYmUudHJ1ZTtcbiAgICB9KTtcbiAgfSk7XG4gIGRlc2NyaWJlKCdhIHBhcnNlciBmb3IgSlNPTiBlc2NhcGVkIGNoYXJzJywgKCkgPT4ge1xuICAgIGl0KCdwYXJzZXMgYW4gZXNjYXBlZCBjaGFyYWN0ZXIgYW5kIHJldHVybnMgYSBTdWNjZXNzJywgKCkgPT4ge1xuICAgICAgZXhwZWN0KGpFc2NhcGVkQ2hhclAucnVuKHRleHQoJ1xcXFxiJykpLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcbiAgICAgIGV4cGVjdChqRXNjYXBlZENoYXJQLnJ1bih0ZXh0KCdcXFxcYicpKS52YWx1ZVswXSkudG8uYmUuZXFsKCdcXGInKTtcbiAgICAgIGV4cGVjdChqRXNjYXBlZENoYXJQLnJ1bih0ZXh0KCdcXFxcZicpKS5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgICBleHBlY3QoakVzY2FwZWRDaGFyUC5ydW4odGV4dCgnXFxcXGYnKSkudmFsdWVbMF0pLnRvLmJlLmVxbCgnXFxmJyk7XG4gICAgICBleHBlY3QoakVzY2FwZWRDaGFyUC5ydW4odGV4dCgnXFxcXHInKSkuaXNTdWNjZXNzKS50by5iZS50cnVlO1xuICAgICAgZXhwZWN0KGpFc2NhcGVkQ2hhclAucnVuKHRleHQoJ1xcXFx0JykpLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcbiAgICAgIGV4cGVjdChqRXNjYXBlZENoYXJQLnJ1bih0ZXh0KCdcXHQnKSkuaXNGYWlsdXJlKS50by5iZS50cnVlO1xuICAgIH0pO1xuICB9KTtcbiAgZGVzY3JpYmUoJ2EgcGFyc2VyIGZvciBlc2NhcGVkIDQtZGlnaXRzIHVuaWNvZGUgY2hhcnMnLCAoKSA9PiB7XG4gICAgaXQoJ3BhcnNlcyBhbiBlc2NhcGVkIGNoYXJhY3RlciBhbmQgcmV0dXJucyBhIFN1Y2Nlc3MnLCAoKSA9PiB7XG4gICAgICBjb25zdCBydW4gPSBqVW5pY29kZUNoYXJQLnJ1bih0ZXh0KCdcXFxcdTFhMmUnKSk7XG4gICAgICBleHBlY3QocnVuLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcbiAgICAgIGV4cGVjdChydW4udmFsdWVbMF0pLnRvLmJlLmVxbCg2NzAyKTtcbiAgICAgIGV4cGVjdChqVW5pY29kZUNoYXJQLnJ1bih0ZXh0KCdcXFxcdTAwMTAnKSkudmFsdWVbMF0pLnRvLmJlLmVxbCgxNik7XG4gICAgICBleHBlY3QoalVuaWNvZGVDaGFyUC5ydW4odGV4dCgnXFxcXHUwMDBGJykpLnZhbHVlWzBdKS50by5iZS5lcWwoMTUpO1xuICAgIH0pO1xuICB9KTtcbiAgZGVzY3JpYmUoJ2EgcGFyc2VyIGZvciBkb3VibGVxdW90ZWQgSlNPTiBzdHJpbmdzJywgKCkgPT4ge1xuICAgIGl0KCdwYXJzZXMgYSBsb3Qgb2YgY2hhcmFjdGVycyBhbmQgcmV0dXJucyBhIEpWYWx1ZS5KU3RyaW5nJywgKCkgPT4ge1xuICAgICAgY29uc3QgcnVuID0gSlN0cmluZ1AucnVuKHRleHQoJ1xcXCJ0ZXN0IHN0cmluZ1xcXCInKSk7IC8vIHdvcmtzIGFsc28gd2l0aCB1bmVzY2FwZWQgZG91YmxlcXVvdGVzXG4gICAgICBleHBlY3QocnVuLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcbiAgICAgIGV4cGVjdChydW4udmFsdWVbMF0uaXNKU3RyaW5nKS50by5iZS50cnVlO1xuICAgICAgZXhwZWN0KHJ1bi52YWx1ZVswXS52YWx1ZSkudG8uYmUuZXFsKCd0ZXN0IHN0cmluZycpO1xuICAgIH0pO1xuICAgIGl0KCdoYW5kbGVzIHVuaWNvZGVzIHZlcnkgcm91Z2hseSwgYW5kIG5vIGVzY2FwZWQgY2hhcnMgeWV0Li4uJywgKCkgPT4ge1xuICAgICAgY29uc3QgcnVuID0gSlN0cmluZ1AucnVuKHRleHQoJ1xcXCJ0ZXN0IFxcXFx1MDAxMCBzdHJpbmdcXFwiJykpO1xuICAgICAgZXhwZWN0KHJ1bi5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgICBleHBlY3QocnVuLnZhbHVlWzBdLmlzSlN0cmluZykudG8uYmUudHJ1ZTtcbiAgICAgIGV4cGVjdChydW4udmFsdWVbMF0udmFsdWUpLnRvLmJlLmVxbCgndGVzdCAxNiBzdHJpbmcnKTtcbiAgICB9KTtcbiAgfSk7XG4gIGRlc2NyaWJlKCdhIHBhcnNlciBmb3IgbnVtYmVycyBpbnNpZGUgSlNPTiBmaWxlcycsICgpID0+IHtcbiAgICBpdCgncGFyc2VzIHN0cmluZ3MgYW5kIHJldHVybnMgU3VjY2Vzc1xcJ2VzJywgKCkgPT4ge1xuICAgICAgZXhwZWN0KGpOdW1iZXJTdHJpbmdQLnJ1bih0ZXh0KCcwJykpLnZhbHVlWzBdKS50by5iZS5lcWwoJzAnKTtcbiAgICAgIGV4cGVjdChqTnVtYmVyU3RyaW5nUC5ydW4odGV4dCgnMC4xJykpLnZhbHVlWzBdKS50by5iZS5lcWwoJzAuMScpO1xuICAgICAgZXhwZWN0KGpOdW1iZXJTdHJpbmdQLnJ1bih0ZXh0KCctMCcpKS52YWx1ZVswXSkudG8uYmUuZXFsKCctMCcpO1xuICAgICAgZXhwZWN0KGpOdW1iZXJTdHJpbmdQLnJ1bih0ZXh0KCctMC4xJykpLnZhbHVlWzBdKS50by5iZS5lcWwoJy0wLjEnKTtcbiAgICAgIGV4cGVjdChqTnVtYmVyU3RyaW5nUC5ydW4odGV4dCgnMC4xMjM0ZTE0NScpKS52YWx1ZVswXSkudG8uYmUuZXFsKCcwLjEyMzRlMTQ1Jyk7XG4gICAgICBleHBlY3Qoak51bWJlclN0cmluZ1AucnVuKHRleHQoJy0wLjEyMzRlLTE0NScpKS52YWx1ZVswXSkudG8uYmUuZXFsKCctMC4xMjM0ZS0xNDUnKTtcbiAgICAgIGV4cGVjdChqTnVtYmVyU3RyaW5nUC5ydW4odGV4dCgnMTIzJykpLnZhbHVlWzBdKS50by5iZS5lcWwoJzEyMycpO1xuICAgICAgZXhwZWN0KGpOdW1iZXJTdHJpbmdQLnJ1bih0ZXh0KCcxMjMuMTInKSkudmFsdWVbMF0pLnRvLmJlLmVxbCgnMTIzLjEyJyk7XG4gICAgICBleHBlY3Qoak51bWJlclN0cmluZ1AucnVuKHRleHQoJy0xMjMnKSkudmFsdWVbMF0pLnRvLmJlLmVxbCgnLTEyMycpO1xuICAgICAgZXhwZWN0KGpOdW1iZXJTdHJpbmdQLnJ1bih0ZXh0KCctMTIzLjEyJykpLnZhbHVlWzBdKS50by5iZS5lcWwoJy0xMjMuMTInKTtcbiAgICAgIGV4cGVjdChqTnVtYmVyU3RyaW5nUC5ydW4odGV4dCgnMTIzZTInKSkudmFsdWVbMF0pLnRvLmJlLmVxbCgnMTIzZTInKTtcbiAgICAgIGV4cGVjdChqTnVtYmVyU3RyaW5nUC5ydW4odGV4dCgnLTEyM2UyJykpLnZhbHVlWzBdKS50by5iZS5lcWwoJy0xMjNlMicpO1xuICAgICAgZXhwZWN0KGpOdW1iZXJTdHJpbmdQLnJ1bih0ZXh0KCctMTIzZS0yJykpLnZhbHVlWzBdKS50by5iZS5lcWwoJy0xMjNlLTInKTtcbiAgICAgIGV4cGVjdChqTnVtYmVyU3RyaW5nUC5ydW4odGV4dCgnLTEyMy4yMzRlLTInKSkudmFsdWVbMF0pLnRvLmJlLmVxbCgnLTEyMy4yMzRlLTInKTtcbiAgICB9KTtcbiAgICBpdCgncGFyc2VzIHN0cmluZ3MgYW5kIHJldHVybnMgSk51bWJlclxcJ3MnLCAoKSA9PiB7XG4gICAgICBleHBlY3QoSk51bWJlclAucnVuKHRleHQoJzAnKSkudmFsdWVbMF0udmFsdWUpLnRvLmJlLmVxbCgwKTtcbiAgICAgIGV4cGVjdChKTnVtYmVyUC5ydW4odGV4dCgnMC4xJykpLnZhbHVlWzBdLnZhbHVlKS50by5iZS5lcWwoMC4xKTtcbiAgICAgIGV4cGVjdChKTnVtYmVyUC5ydW4odGV4dCgnLTAnKSkudmFsdWVbMF0udmFsdWUpLnRvLmJlLmVxbCgtMCk7XG4gICAgICBleHBlY3QoSk51bWJlclAucnVuKHRleHQoJy0wLjEnKSkudmFsdWVbMF0udmFsdWUpLnRvLmJlLmVxbCgtMC4xKTtcbiAgICAgIGV4cGVjdChKTnVtYmVyUC5ydW4odGV4dCgnMC4xMjM0ZTE0NScpKS52YWx1ZVswXS52YWx1ZSkudG8uYmUuZXFsKDAuMTIzNGUxNDUpO1xuICAgICAgZXhwZWN0KEpOdW1iZXJQLnJ1bih0ZXh0KCctMC4xMjM0ZS0xNDUnKSkudmFsdWVbMF0udmFsdWUpLnRvLmJlLmVxbCgtMC4xMjM0ZS0xNDUpO1xuICAgICAgZXhwZWN0KEpOdW1iZXJQLnJ1bih0ZXh0KCcxMjMnKSkudmFsdWVbMF0udmFsdWUpLnRvLmJlLmVxbCgxMjMpO1xuICAgICAgZXhwZWN0KEpOdW1iZXJQLnJ1bih0ZXh0KCcxMjMuMTInKSkudmFsdWVbMF0udmFsdWUpLnRvLmJlLmVxbCgxMjMuMTIpO1xuICAgICAgZXhwZWN0KEpOdW1iZXJQLnJ1bih0ZXh0KCctMTIzJykpLnZhbHVlWzBdLnZhbHVlKS50by5iZS5lcWwoLTEyMyk7XG4gICAgICBleHBlY3QoSk51bWJlclAucnVuKHRleHQoJy0xMjMuMTInKSkudmFsdWVbMF0udmFsdWUpLnRvLmJlLmVxbCgtMTIzLjEyKTtcbiAgICAgIGV4cGVjdChKTnVtYmVyUC5ydW4odGV4dCgnMTIzZTInKSkudmFsdWVbMF0udmFsdWUpLnRvLmJlLmVxbCgxMjNlMik7XG4gICAgICBleHBlY3QoSk51bWJlclAucnVuKHRleHQoJy0xMjNlMicpKS52YWx1ZVswXS52YWx1ZSkudG8uYmUuZXFsKC0xMjNlMik7XG4gICAgICBleHBlY3QoSk51bWJlclAucnVuKHRleHQoJy0xMjNlLTInKSkudmFsdWVbMF0udmFsdWUpLnRvLmJlLmVxbCgtMTIzZS0yKTtcbiAgICAgIGV4cGVjdChKTnVtYmVyUC5ydW4odGV4dCgnLTEyMy4yMzRlLTInKSkudmFsdWVbMF0udmFsdWUpLnRvLmJlLmVxbCgtMTIzLjIzNGUtMik7XG4gICAgfSk7XG4gIH0pO1xuICBkZXNjcmliZSgnYSBwYXJzZXIgZm9yIGFycmF5cyBkaXNjYXJkcyBzcXVhcmUgYnJhY2tldHMnLCAoKSA9PiB7XG4gICAgZGVzY3JpYmUoJ2FuZCBkaXN0aWxscyBpbnRvIEpWYWx1ZS5KQXJyYXlcXCdzJywgKCkgPT4ge1xuICAgICAgaXQoJ25vdGhpbmcgaWYgdGhhdFxcJ3MgdGhlIGNhc2UnLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IGphcnJhID0gJ1tdJztcbiAgICAgICAgY29uc3QgcnVuID0gSkFycmF5UC5ydW4odGV4dChqYXJyYSkpO1xuICAgICAgICBleHBlY3QocnVuLmlzU3VjY2VzcykudG8uYmUudHJ1ZTtcbiAgICAgICAgZXhwZWN0KHJ1bi52YWx1ZVswXS5pc0pBcnJheSkudG8uYmUudHJ1ZTtcbiAgICAgIH0pO1xuICAgICAgaXQoJ251bGxzIGFuZCBib29scycsICgpID0+IHtcbiAgICAgICAgY29uc3QgamFycmEgPSAnW3RydWUgLCAgIGZhbHNlICwgbnVsbCwgICAgICB0cnVlXSc7XG4gICAgICAgIGNvbnN0IHJ1biA9IEpBcnJheVAucnVuKHRleHQoamFycmEpKTtcbiAgICAgICAgZXhwZWN0KHJ1bi5pc1N1Y2Nlc3MpLnRvLmJlLnRydWU7XG4gICAgICAgIGV4cGVjdChydW4udmFsdWVbMF0uaXNKQXJyYXkpLnRvLmJlLnRydWU7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfSk7XG59KTtcbiJdfQ==