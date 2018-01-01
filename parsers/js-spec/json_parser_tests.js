import {expect} from 'chai';
import {
    JNullP,
    JBoolP,
} from 'json_parsers';

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
});
