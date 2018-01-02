import {expect} from 'chai';
import {
    JNullP,
    JBoolP,
    jUnescapedCharP,
    jEscapedCharP,
    jUnicodeCharP,
    jStringP,
    jNumberP,
} from 'json_parsers';
import {
    Position,
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
            expect(jEscapedCharP.run(text('\b')).isSuccess).to.be.true;
            expect(jEscapedCharP.run(text('\f')).isSuccess).to.be.true;
//            expect(jEscapedCharP.run(text('\n')).isSuccess).to.be.true;
            expect(jEscapedCharP.run(text('\r')).isSuccess).to.be.true;
            expect(jEscapedCharP.run(text('\t')).isSuccess).to.be.true;
            expect(jEscapedCharP.run(text('a')).isFailure).to.be.true;
        });
    });
    describe('a parser for escaped 4-digits unicode chars', () => {
        it('parses an escaped character and returns a Success', () => {
            const run = jUnicodeCharP.run(text('\\u1a2e'));
            expect(run.isSuccess).to.be.true;
            expect(run.value[0]).to.be.eql(6702);
            expect(jUnicodeCharP.run(text('\\u0010')).value[0]).to.be.eql(16);
            expect(jUnicodeCharP.run(text('\\u000F')).value[0]).to.be.eql(15);
        });
    });
    describe('a parser for doublequoted JSON strings', () => {
        it('parses a lot of characters and returns a JValue.JString', () => {
            const run = jStringP.run(text('\"test string\"')); // works also with unescaped doublequotes
            expect(run.isSuccess).to.be.true;
            expect(run.value[0].isJString).to.be.true;
            expect(run.value[0].value).to.be.eql('test string');
        });
        it('handles unicodes very roughly, and no escaped chars yet...', () => {
            const run = jStringP.run(text('\"test \\u0010 string\"'));
            expect(run.isSuccess).to.be.true;
            expect(run.value[0].isJString).to.be.true;
            expect(run.value[0].value).to.be.eql('test 16 string');
        });
    });
    describe('a parser for numbers inside JSON files', () => {
        it('parses simple integers and returns Success\'es', () => {
            expect(jNumberP.run(text('123')).value[0]).to.be.eql('123');
            expect(jNumberP.run(text('123.12')).value[0]).to.be.eql('123.12');
            expect(jNumberP.run(text('-123')).value[0]).to.be.eql('-123');
            expect(jNumberP.run(text('-123.12')).value[0]).to.be.eql('-123.12');
            expect(jNumberP.run(text('123e2')).value[0]).to.be.eql('123e2');
            expect(jNumberP.run(text('-123e2')).value[0]).to.be.eql('-123e2');
            expect(jNumberP.run(text('-123e-2')).value[0]).to.be.eql('-123e-2');
            expect(jNumberP.run(text('-123.234e-2')).value[0]).to.be.eql('-123.234e-2');
        });
    });
});
