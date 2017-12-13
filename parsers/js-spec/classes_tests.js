import {expect} from 'chai';
import {
    isPair,
    isSuccess,
    isFailure,
    isSome,
    isNone,
} from 'util';
import {
    pair,
    success,
    failure,
    some,
    none,
} from 'classes';

describe('among helper classes', () => {

    describe('somes', () => {
        it('include a value and allow to retrieve it', () => {
            const aSome = some(12);
            expect(aSome.val()).to.be.eql(12);
            expect(isSome(aSome)).to.be.true;
        });
    });

    describe('nones', () => {
        it('are just a signpost', () => {
            const aNone = none();
            expect(aNone.val()).to.be.null;
            expect(isNone(aNone)).to.be.true;
        });
    });

    describe('pairs', () => {
        beforeEach(() => {
        });
        it('include 2 values and allow to retrieve them', () => {
            const apair = pair(true, 12);
            expect(apair[0]).to.be.eql(true);
            expect(apair[1]).to.be.eql(12);
            expect(apair.type).to.be.eql('pair');
            expect(isPair(apair)).to.be.true;
        });
    });

    describe('success and failure', () => {
        beforeEach(() => {
        });
        it('may represent successes', () => {
            const succ = success(true, 12);
            expect(succ[0]).to.be.true;
            expect(succ[1]).to.be.eql(12);
            expect(isSuccess(succ)).to.be.true;
            expect(isPair(succ)).to.be.true;
        });
        it('may represent failures', () => {
            const fail = failure('a', 12);
            expect(fail[0]).to.be.eql('a');
            expect(fail[1]).to.be.eql(12);
            expect(isSuccess(fail)).to.be.false;
            expect(isFailure(fail)).to.be.true;
            expect(isPair(fail)).to.be.true;
        });
    });

});
