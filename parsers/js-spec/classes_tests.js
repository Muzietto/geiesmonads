import {expect} from 'chai';
import {
    isPair,
    isSuccess,
    isFailure,
} from 'util';
import {
    pair,
    success,
    failure,
} from 'classes';

describe('among helper classes', () => {

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
        });
        it('may represent failures', () => {
            const succ = failure('a', 12);
            expect(succ[0]).to.be.eql('a');
            expect(succ[1]).to.be.eql(12);
            expect(isSuccess(succ)).to.be.false;
            expect(isFailure(succ)).to.be.true;
        });
    });

});
