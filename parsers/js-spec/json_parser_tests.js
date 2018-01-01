import {expect} from 'chai';
import {
    JNullP,
    JBoolP,
    junescapedCharP,
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
            expect(junescapedCharP.run(text('a')).isSuccess).to.be.true;
            expect(junescapedCharP.run(text('A')).isSuccess).to.be.true;
            expect(junescapedCharP.run(text('1')).isSuccess).to.be.true;
            expect(junescapedCharP.run(text('"')).isFailure).to.be.true;
            expect(junescapedCharP.run(text('\\')).isFailure).to.be.true;
        });
    });
});
