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
    Tuple,
} from 'classes';

describe('among helper classes', () => {

    describe('somes', () => {
        it('include a value and allow to retrieve it', () => {
            const aSome = some(12);
            expect(aSome.val()).to.be.eql(12);
            expect(isSome(aSome)).to.be.true;
            expect(aSome.toString()).to.be.eql('some(12)');
        });
    });

    describe('nones', () => {
        it('are just a signpost', () => {
            const aNone = none();
            expect(aNone.val()).to.be.null;
            expect(isNone(aNone)).to.be.true;
            expect(aNone.toString()).to.be.eql('none()');
        });
    });

    describe('pairs', () => {
        it('include 2 values and allow to retrieve them', () => {
            const apair = pair(true, 12);
            expect(apair[0]).to.be.eql(true);
            expect(apair[1]).to.be.eql(12);
            expect(apair.type).to.be.eql('pair');
            expect(isPair(apair)).to.be.true;
        });
        it('are actually arrays, and therefore allow positional destructuring', () => {
            const [a, b] = pair(true, 12);
            expect(a).to.be.eql(true);
            expect(b).to.be.eql(12);
        });
    });

    describe('Pair\'s', () => {
        it('include 2 values and allow to retrieve them', () => {
            const apair = Tuple.Pair(true, 12);
            expect(apair[0]).to.be.eql(true);
            expect(apair[1]).to.be.eql(12);
            expect(apair.type).to.be.eql('pair');
            expect(apair.isPair).to.be.true;
            expect(apair.toString()).to.be.eql('[true,12]');
        });
        it('are true iterables, and therefore allow positional destructuring', () => {
            const [a, b] = Tuple.Pair(true, 12);
            expect(a).to.be.eql(true);
            expect(b).to.be.eql(12);
        });
    });

    describe('Triple\'s', () => {
        it('include 3 values and allow to retrieve them', () => {
            const atriple = Tuple.Triple(true, 12, 'a');
            expect(atriple[0]).to.be.eql(true);
            expect(atriple[1]).to.be.eql(12);
            expect(atriple[2]).to.be.eql('a');
            expect(atriple.type).to.be.eql('triple');
            expect(atriple.isTriple).to.be.true;
            expect(atriple.toString()).to.be.eql('[true,12,a]');
        });
        it('are true iterables, and therefore allow positional destructuring', () => {
            const [a, b, c] = Tuple.Triple(true, 12, 'a');
            expect(a).to.be.eql(true);
            expect(b).to.be.eql(12);
            expect(c).to.be.eql('a');
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
