import { expect } from 'chai';
import {
  JNullP,
  JBoolP,
  jUnescapedCharP,
  jEscapedCharP,
  jUnicodeCharP,
  JStringP,
  jNumberStringP,
  JNumberP,
  JArrayP,
  JObjectP,
} from 'json_parsers';
import {
  Position,
  JValue,
} from 'classes';

const text = Position.fromText;

describe('building a JSON parser', () => {
  describe('a parser for JNull\'s', () => {
    it('parses the string \'null\' and returns a JValue.JNull', () => {
      const run = JNullP.run('null');
      expect(run.isSuccess).to.be.true;
      expect(run.value[0].isJNull).to.be.true;
      expect(JNullP.run('nulx').isFailure).to.be.true;
    });
  });
  describe('a parser for JBool\'s', () => {
    it('parses the string \'true\' and returns a JValue.JBool(true)', () => {
      const run = JBoolP.run('true');
      expect(run.isSuccess).to.be.true;
      expect(run.value[0].isJBool).to.be.true;
      expect(run.value[0]).to.be.eql(JValue.JBool(true));
      expect(run.value[0].value).to.be.true;
    });
    it('parses the string \'false\' and returns a JValue.JBool(false)', () => {
      const run = JBoolP.run('false');
      expect(run.isSuccess).to.be.true;
      expect(run.value[0].isJBool).to.be.true;
      expect(run.value[0].value).to.be.false;
    });
    it('fails to parse anything else', () => {
      expect(JBoolP.run('trux').isFailure).to.be.true;
    });
  });
  describe('a parser for JSON unescaped chars', () => {
    it('parses an unescaped character and returns a Success', () => {
      expect(jUnescapedCharP.run(text('a')).isSuccess).to.be.true;
      expect(jUnescapedCharP.run(text('A')).isSuccess).to.be.true;
      expect(jUnescapedCharP.run(text('1')).isSuccess).to.be.true;
      expect(jUnescapedCharP.run(text('"')).isFailure).to.be.true;
      expect(jUnescapedCharP.run(text('\\')).isFailure).to.be.true;
    });
  });
  describe('a parser for JSON escaped chars', () => {
    it('parses an escaped character and returns a Success', () => {
      expect(jEscapedCharP.run(text('\\b')).isSuccess).to.be.true;
      expect(jEscapedCharP.run(text('\\b')).value[0]).to.be.eql('\b');
      expect(jEscapedCharP.run(text('\\f')).isSuccess).to.be.true;
      expect(jEscapedCharP.run(text('\\f')).value[0]).to.be.eql('\f');
      expect(jEscapedCharP.run(text('\\r')).isSuccess).to.be.true;
      expect(jEscapedCharP.run(text('\\t')).isSuccess).to.be.true;
      expect(jEscapedCharP.run(text('\t')).isFailure).to.be.true;
    });
  });
  describe('a parser for escaped 4-digits unicode chars', () => {
    it('parses an escaped character and returns a Success', () => {
      const run = jUnicodeCharP.run(text('\\u1a2e'));
      expect(run.isSuccess).to.be.true;// \\u263A
      expect(run.value[0]).to.be.eql(6702);
      expect(jUnicodeCharP.run(text('\\u0010')).value[0]).to.be.eql(16);
      expect(jUnicodeCharP.run(text('\\u000F')).value[0]).to.be.eql(15);
    });
  });
  describe('a parser for doublequoted JSON strings', () => {
    it('parses a lot of characters and returns a JValue.JString', () => {
      const run = JStringP.run(text('\"test string\"')); // works also with unescaped doublequotes
      expect(run.isSuccess).to.be.true;
      expect(run.value[0].isJString).to.be.true;
      expect(run.value[0].value).to.be.eql('test string');
    });
    it('handles unicodes very roughly', () => {
      const run = JStringP.run(text('\"test \\u0010 string\"'));
      expect(run.isSuccess).to.be.true;
      expect(run.value[0].isJString).to.be.true;
      expect(run.value[0].value).to.be.eql('test 16 string');
    });
    it('handles escaped chars as well', () => {
      const run = JStringP.run(text('\"test \\n string\"'));
      expect(run.isSuccess).to.be.true;
      expect(run.value[0].isJString).to.be.true;
      expect(run.value[0].value).to.be.eql('test \n string');
    });
    xit('will handle escaped chars better - this should have a smiley inside', () => {
      const run = JStringP.run(text('\"ab\\u263Ade\"'));
      expect(run.isSuccess).to.be.true;
      expect(run.value[0].isJString).to.be.true;
      expect(run.value[0].value).to.be.eql('test \n string');
    });
  });
  describe('a parser for numbers inside JSON files', () => {
    it('parses strings and returns Success\'es', () => {
      expect(jNumberStringP.run(text('0')).value[0]).to.be.eql('0');
      expect(jNumberStringP.run(text('0.1')).value[0]).to.be.eql('0.1');
      expect(jNumberStringP.run(text('-0')).value[0]).to.be.eql('-0');
      expect(jNumberStringP.run(text('-0.1')).value[0]).to.be.eql('-0.1');
      expect(jNumberStringP.run(text('0.1234e145')).value[0]).to.be.eql('0.1234e145');
      expect(jNumberStringP.run(text('-0.1234e-145')).value[0]).to.be.eql('-0.1234e-145');
      expect(jNumberStringP.run(text('123')).value[0]).to.be.eql('123');
      expect(jNumberStringP.run(text('123.12')).value[0]).to.be.eql('123.12');
      expect(jNumberStringP.run(text('-123')).value[0]).to.be.eql('-123');
      expect(jNumberStringP.run(text('-123.12')).value[0]).to.be.eql('-123.12');
      expect(jNumberStringP.run(text('123e2')).value[0]).to.be.eql('123e2');
      expect(jNumberStringP.run(text('-123e2')).value[0]).to.be.eql('-123e2');
      expect(jNumberStringP.run(text('-123e-2')).value[0]).to.be.eql('-123e-2');
      expect(jNumberStringP.run(text('-123.234e-2')).value[0]).to.be.eql('-123.234e-2');
    });
    it('parses strings and returns JNumber\'s', () => {
      expect(JNumberP.run(text('0')).value[0].value).to.be.eql(0);
      expect(JNumberP.run(text('0.1')).value[0].value).to.be.eql(0.1);
      expect(JNumberP.run(text('-0')).value[0].value).to.be.eql(-0);
      expect(JNumberP.run(text('-0.1')).value[0].value).to.be.eql(-0.1);
      expect(JNumberP.run(text('0.1234e145')).value[0].value).to.be.eql(0.1234e145);
      expect(JNumberP.run(text('-0.1234e-145')).value[0].value).to.be.eql(-0.1234e-145);
      expect(JNumberP.run(text('123')).value[0].value).to.be.eql(123);
      expect(JNumberP.run(text('123.12')).value[0].value).to.be.eql(123.12);
      expect(JNumberP.run(text('-123')).value[0].value).to.be.eql(-123);
      expect(JNumberP.run(text('-123.12')).value[0].value).to.be.eql(-123.12);
      expect(JNumberP.run(text('123e2')).value[0].value).to.be.eql(123e2);
      expect(JNumberP.run(text('-123e2')).value[0].value).to.be.eql(-123e2);
      expect(JNumberP.run(text('-123e-2')).value[0].value).to.be.eql(-123e-2);
      expect(JNumberP.run(text('-123.234e-2')).value[0].value).to.be.eql(-123.234e-2);
    });
  });
  describe('a parser for JSON arrays discards square brackets', function() {
    this.timeout(50000000000);
    describe('and distills into JValue.JArray\'s', () => {
      it('nothing if that\'s the case', () => {
        const jarra = '[   ]';
        const run = JArrayP.run(text(jarra));
        expect(run.isSuccess).to.be.true;
        expect(run.value[0].isJArray).to.be.true;
        const content = run.value[0].value;
        expect(content.length).to.be.eql(0);
      });
      it('numbers', () => {
        const jarra = '[  1   , 2   , 3    ]';
        const run = JArrayP.run(text(jarra));
        expect(run.isSuccess).to.be.true;
        expect(run.value[0].isJArray).to.be.true;
        const content = run.value[0].value;
        expect(content.length).to.be.eql(3);
        expect(content[0].isJNumber).to.be.true;
        expect(content[0].value).to.be.eql(1);
        expect(content[1].value).to.be.eql(2);
        expect(content[2].value).to.be.eql(3);
      });
      it('numbers, nulls, strings and bools', () => {
        const jarra = '[true ,   false , null,      true,123.123   ,"paperino"]';
        const run = JArrayP.run(text(jarra));
        expect(run.isSuccess).to.be.true;
        expect(run.value[0].isJArray).to.be.true;
        const content = run.value[0].value;
        expect(content.length).to.be.eql(6);
        expect(content[0].isJBool).to.be.true;
        expect(content[0].value).to.be.true;
        expect(content[1].isJBool).to.be.true;
        expect(content[1].value).to.be.false;
        expect(content[2].isJNull).to.be.true;
        expect(content[2].value).to.be.null;
        expect(content[4].isJNumber).to.be.true;
        expect(content[4].value).to.be.eql(123.123);
        expect(content[5].isJString).to.be.true;
        expect(content[5].value).to.be.eql('paperino');
      });
      it('arrays and all the rest', () => {
        const jarra = '[[123],    null, [      null,  "minnie"  ,[     ]  ]]';
        const run = JArrayP.run(text(jarra));
        expect(run.isSuccess).to.be.true;
        expect(run.value[0].isJArray).to.be.true;

        const content = run.value[0].value;
        expect(content.length).to.be.eql(3);

        expect(content[0].isJArray).to.be.true;
        expect(content[0].value.length).to.be.eql(1);
        expect(content[0].value[0].isJNumber).to.be.true;
        expect(content[0].value[0].value).to.be.eql(123);

        expect(content[1].isJNull).to.be.true;
        expect(content[1].value).to.be.null;

        expect(content[2].isJArray).to.be.true;
        expect(content[2].value.length).to.be.eql(3);
        expect(content[2].value[0].isJNull).to.be.true;
        expect(content[2].value[1].isJString).to.be.true;
        expect(content[2].value[1].value).to.be.eql('minnie');
        expect(content[2].value[2].isJArray).to.be.true;
        expect(content[2].value[2].value.length).to.be.eql(0);
      });
    });
  });
  describe('a parser for JSON object discards curly brackets', function() {
    this.timeout(50000000000);
    describe('and distills into JValue.JObject\'s', () => {
      it('nothing if that\'s the case', () => {
        const jobj = '{   }';
        const run = JObjectP.run(text(jobj));
        expect(run.isSuccess).to.be.true;
        expect(run.value[0].isJObject).to.be.true;
        const content = run.value[0].value;
        expect(content).to.be.eql({});
      });
      it('objects with numbers as values', () => {
        const jobj = '{ "qwe" : 123 }';
        const run = JObjectP.run(text(jobj));
        expect(run.isSuccess).to.be.true;
        expect(run.value[0].isJObject).to.be.true;

        const content = run.value[0].value;
        expect(Object.keys(content)).to.be.eql(['qwe']);
        expect(content['qwe'].isJNumber).to.be.true;
        expect(content['qwe'].value).to.be.eql(123);
      });
      it('objects with nulls, strings, arrays and bools as values', () => {
        const jobj = '{"bool":true ,   "null":  null,      "array": [false]   ,"string":"paperino"}';
        const run = JObjectP.run(text(jobj));
        expect(run.isSuccess).to.be.true;
        expect(run.value[0].isJObject).to.be.true;

        const content = run.value[0].value;
        expect(Object.keys(content)).to.be.eql(['bool', 'null', 'array', 'string']);
        expect(content['bool'].isJBool).to.be.true;
        expect(content['bool'].value).to.be.true;
        expect(content['null'].isJNull).to.be.true;
        expect(content['null'].value).to.be.null;
        expect(content['array'].isJArray).to.be.true;
        expect(content['array'].value[0].isJBool).to.be.true;
        expect(content['array'].value[0].value).to.be.false;
        expect(content['string'].isJString).to.be.true;
        expect(content['string'].value).to.be.eql('paperino');
      });
      it('objects with objects as values', () => {
        const jobj = '{ "object": { "innerArray": [1.23], "innerObject": {}} }';
        const run = JObjectP.run(text(jobj));
        expect(run.isSuccess).to.be.true;
        expect(run.value[0].isJObject).to.be.true;

        const content = run.value[0].value;
        expect(Object.keys(content)).to.be.eql(['object']);
        expect(content['object'].isJObject).to.be.true;

        const innerContent = content['object'].value;
        expect(Object.keys(innerContent)).to.be.eql(['innerArray', 'innerObject']);
        expect(innerContent['innerArray'].isJArray).to.be.true;
        expect(innerContent['innerArray'].value.length).to.be.eql(1);
        expect(innerContent['innerArray'].value[0].isJNumber).to.be.true;
        expect(innerContent['innerArray'].value[0].value).to.be.eql(1.23);
        expect(innerContent['innerObject'].isJObject).to.be.true;
        expect(Object.keys(innerContent['innerObject'].value)).to.be.eql([]);
      });
    });
  });
});
