import {expect} from 'chai';
import {
    JNullP,
} from 'json_parsers';

describe('building a JSON parser', () => {
    describe('a parser for JNull\'s', () => {
        it('parsers the string \'null\' and returns a JValue.JNull', () => {
            const run = JNullP.run('null');
            expect(run.isSuccess).to.be.true;
            expect(run.value[0].isJNull).to.be.true;
            expect(JNullP.run('nulx').isFailure).to.be.true;
        });
    });
});
