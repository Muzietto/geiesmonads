import {expect} from 'chai';
import {typeOf} from 'util';
import {
    Pair,
} from 'classes';

describe('pairs', () => {
    beforeEach(() => {
    });

    it('include 2 values and allow to retrieve them', () => {
        const pair = new Pair(true, 12)
        expect(pair.first()).to.be.eql(true);
        expect(pair.second()).to.be.eql(12);
        expect(typeOf(pair)).to.be.eql('Pair');
    });

});
