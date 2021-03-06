/*
	GEIESMONADS - JS monads
	Author: Marco Faustinelli (contacts@faustinelli.net)
	Web: http://faustinelli.net/
	     http://faustinelli.wordpress.com/

	The MIT License - Copyright (c) 2013/2015 Geiesmonads Project
*/

var expect = chai.expect;
mocha.setup('bdd');

describe('maybe monad', function() {
  var maybe = MONAD.maybe.UNIT;
  var isSome = MONAD.maybe.isSome;
  it('may be some or none', function() {
    expect(maybe(12)()).to.be.equal(12);
    expect(isSome(maybe(null))).to.be.not.ok;
  });
  it('binds into some or none', function() {
    var famb = a => maybe(a * 2);
    expect(maybe(12).bind(famb)()).to.be.equal(24);
    expect(isSome(maybe(null).bind(famb))).to.be.not.ok;
  });
});

describe('either a monad', function() {
  var left = MONAD.either.left;
  var right = MONAD.either.right;
  var isLeft = MONAD.either.isLeft;
  var isRight = MONAD.either.isRight;
  it('may be left or right', function() {
    expect(left(12)()).to.be.equal(12);
    expect(right(13)()).to.be.equal(13);
    expect(isLeft(right('www'))).to.be.not.ok;
    expect(isRight(left('www'))).to.be.not.ok;
    expect(isLeft(left('www'))).to.be.ok;
    expect(isRight(right('www'))).to.be.ok;
  });
  it('binds from right to left', function() {
    var farb = a => right(a * 2);
    var falb = a => left(a * 2);
    var right2Right = right(12).bind(farb);
    expect(right2Right()).to.be.equal(24);
    expect(isRight(right2Right)).to.be.ok;

    var right2Left = right(12).bind(falb);
    expect(right2Left()).to.be.equal(24);
    expect(isLeft(right2Left)).to.be.ok;
  });
  it('binds from left to left', function() {
    var farb = a => right(a * 2);
    var falb = a => left(a * 2);
    var left2Right = left(12).bind(farb);
    expect(left2Right()).to.be.equal(12);
    expect(isLeft(left2Right)).to.be.ok;

    var left2Left = left(12).bind(falb);
    expect(left2Left()).to.be.equal(12);
    expect(isLeft(left2Left)).to.be.ok;
  });
});

var state = MONAD.state.state;
var unit = MONAD.state.UNIT;
var getState = MONAD.state.sGet;

describe('state monad', function() {
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

var node = MyTree.node;
var leaf = MyTree.leaf;
var empty = MyTree.empty;
var left = MyTree.left;
var right = MyTree.right;
var identity = x => x;

var simpleTree = node(leaf('a'),node(leaf('b'),leaf('c')));
var complexTree = node(
  leaf('a'),
  node(
    node(
      leaf('b'),
      leaf('c')),
    leaf('d')
  )
);
var complexTreeWithEmpties = node(
  leaf('a'),
  node(
    node(
      leaf('b'),
      empty()),
    leaf('d')
  )
);

describe('manual labeler', function() {
  it('labels a single leaf', function() {
    var result = MyTree.manualLabeler(0, leaf('aaa'));
    expect(result[0]).to.be.equal(1);
    expect(result[1](identity)).to.be.eql([0,'aaa']);
  });
  it('labels a half-empty node', function() {
    // [1, node(empty(), leaf([1,'aaa']))]
    var result = MyTree.manualLabeler(0, node(empty(), leaf('aaa')));
    expect(result[0]).to.be.equal(1);
    expect(left(result[1])(identity)).to.be.undefined;
    expect(right(result[1])(identity)).to.be.eql([0, 'aaa']);
  });
  it('labels a simple tree', function() {
    var simpleResult = MyTree.manualLabeler(0, simpleTree);
    expect(simpleResult[0]).to.be.equal(3);
    var leftLabeledLeaf = left(simpleResult[1]); // leaf([0,'a'])
    expect(leftLabeledLeaf(identity)).to.be.eql([0,'a']);
    expect(right(right(simpleResult[1]))(identity)).to.be.eql([2,'c']);
  });
  it('labels a complex tree', function() {
    var complexResult = MyTree.manualLabeler(0, complexTree);
    var finalState = complexResult[0];
    var labeledTree = complexResult[1];
    expect(finalState).to.be.equal(4);
    expect(left(labeledTree)(identity)).to.be.eql([0,'a']);
    expect(right(left(right(labeledTree)))(identity)).to.be.eql([2,'c']);
    expect(right(right(labeledTree))(identity)).to.be.eql([3,'d']);
  });
});

describe('monadic labeler', function() {
  it('labels a single leaf', function() {
    var result = MyTree.monadicLabeler(leaf('aaa'));
    // s => [s+1, leaf([s,'aaa'])]
    expect(result.bind(a => getState)(0)[1]).to.be.equal(1);
    expect(result(0)[0]).to.be.equal(1);
    expect(result(0)[1](identity)).to.be.eql([0, 'aaa']);
  });
  it('labels a half-empty node', function() {
    // result(0) = [1, node(empty(), leaf([1,'aaa']))]
    var result = MyTree.monadicLabeler(node(empty(), leaf('aaa')));
    expect(result(0)[0]).to.be.equal(1);
    expect(left(result(0)[1])(identity)).to.be.undefined;
    expect(right(result(0)[1])(identity)).to.be.eql([0, 'aaa']);
  });
  it('labels a simple tree', function() {
    var simpleResult = MyTree.monadicLabeler(simpleTree);
    // s => [s+3, node(leaf([s,'a']),node(leaf([s+1,'b']),leaf([s+2,'c'])))]
    expect(simpleResult(0)[0]).to.be.equal(3);
    var leftLabeledLeaf = left(simpleResult(0)[1]); // leaf([0,'a'])
    expect(leftLabeledLeaf(identity)).to.be.eql([0,'a']);
    expect(right(right(simpleResult(0)[1]))(identity)).to.be.eql([2,'c']);
  });
  it('labels a complex tree', function() {
    var complexResult = MyTree.monadicLabeler(complexTree);
    var finalState = complexResult(0)[0];
    var labeledTree = complexResult(0)[1];
    expect(finalState).to.be.equal(4);
    expect(left(labeledTree)(identity)).to.be.eql([0,'a']);
    expect(right(left(right(labeledTree)))(identity)).to.be.eql([2,'c']);
  });
  it('labels a complex tree with empties', function() {
    var complexResult = MyTree.monadicLabeler(complexTreeWithEmpties);
    var finalState = complexResult(0)[0];
    var labeledTree = complexResult(0)[1];
    expect(finalState).to.be.equal(3);
    expect(left(labeledTree)(identity)).to.be.eql([0,'a']);
    expect(right(left(right(labeledTree)))(identity)).to.be.undefined;
  });
});