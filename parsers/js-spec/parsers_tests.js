import {expect} from 'chai';
import identity from 'parsers';

describe('whatever', () => {
    beforeEach(() => {
    });

    it('really', () => {
        expect(identity(12)).to.be.eql(12);
        expect(true).to.be.ok;
    });

});
