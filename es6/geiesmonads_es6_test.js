var expect = chai.expect;
mocha.setup('bdd');

describe('maybe monad', function() {
  var maybe = MONAD.maybe.UNIT;
  it('may be some or none', function() {
    expect(maybe(12)()).to.be.equal(12);
    expect(maybe(null)()).to.be.not.ok;
  });
  it('binds into some or none', function() {
    var famb = a => maybe(a * 2);
    expect(maybe(12).bind(famb)()).to.be.equal(24);
    expect(maybe(null).bind(famb)()).to.be.not.ok;
  });
});

describe('state monad', function() {
  var state = MONAD.state.state;
  var unit = MONAD.state.UNIT;
  it('is a spring mouse', function() {
    expect(unit(12)(1)[0]).to.be.equal(1);
    expect(unit(12)(1)[1]).to.be.equal(12);
    expect(state(s => [s, 12])(1)[0]).to.be.equal(1);
    expect(state(s => [s, 12])(1)[1]).to.be.equal(12);
  });
  it('binds very well', function() {
    var twelve = unit(12);
    var fasmb = a => state(s => [a+s, a-s]);
    var bound = twelve.bind(fasmb);
    var [sss, aaa] = bound(1);
    expect(sss).to.be.equal(13);
    expect(aaa).to.be.equal(11);
  });
  it('features sGet', function() {
    var getState = MONAD.state.sGet;
    var twelve = unit(12);
    var fasmb = a => state(s => [a+s, a-s]); // s -> 12+s
    var bound = twelve.bind(fasmb).bind(a => getState);
    var [sss, aaa] = bound(1);
    expect(sss).to.be.equal(13);
    expect(aaa).to.be.equal(13);
  });
  it('features sSet', function() {
    var setState = MONAD.state.sSet;
    var twelve = unit(12);
    var fasmb = a => state(s => [a+s, a-s]); // a -> 12-s
    var bound = twelve.bind(fasmb).bind(a => setState(a*2));
    var [sss, aaa] = bound(1);
    expect(sss).to.be.equal(22);
    expect(aaa).to.be.undefined;
  });
});

var branch = MyTree.branch;
var leaf = MyTree.leaf;
var left = MyTree.left;
var right = MyTree.right;
var identity = x => x;

var simpleTree = branch(leaf('a'),branch(leaf('b'),leaf('c')));
var complexTree = branch(
  leaf('a'),
  branch(
    branch(
      leaf('b'),
      leaf('c')),
    leaf('d')
  )
);

describe('manual labeler', function() {
  it('labels a single leaf', function() {
    var result = MyTree.manualLabeler([0, leaf('aaa')]);
    expect(result[0]).to.be.equal(1);
    expect(result[1](identity)).to.be.equal('aaa');
  });
  it('labels a simple tree', function() {
    var simpleResult = MyTree.manualLabeler([0, simpleTree]);
    expect(left(simpleResult[1])(identity)).to.be.equal('a');
    expect(left(simpleResult[0])).to.be.equal(0);
    expect(right(right(simpleResult[1]))).to.be.equal(2);
    expect(right(right(simpleResult[1]))).to.be.equal('c');
  });
  it('labels a complex tree', function() {
    var complexResult = MyTree.manualLabeler([0, complexTree]);
    expect(left(complexResult)[0]).to.be.equal(0);
    expect(left(complexResult)[1]).to.be.equal('a');
    expect(rightL(left(right(complexResult)))[0]).to.be.equal(2);
    expect(right(left(right(complexResult)))[1]).to.be.equal('c');
  });
});
