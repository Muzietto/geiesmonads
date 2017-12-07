import chai from 'chai';
import sinon from 'sinon';
import sinon_chai from 'sinon-chai';

import identity from 'dist/parsers';

chai.use(sinon_chai);
let expect = chai.expect;

describe('whatever', () => {
    beforeEach(() => {
    });

    it('really', () => {
        expect(true).to.be.ok;
    });

});
