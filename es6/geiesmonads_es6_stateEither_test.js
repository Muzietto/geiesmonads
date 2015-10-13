/*
	GEIESMONADS - JS monads
	Author: Marco Faustinelli (contacts@faustinelli.net)
	Web: http://faustinelli.net/
	     http://faustinelli.wordpress.com/

	The MIT License - Copyright (c) 2013/2015 Geiesmonads Project
*/

/* Define a State monad that manages errors (in a sense like Maybe): 
   if an error/problem occurs during the "do" computation, it is signalled and propagated by >>=
   step 2) The error should propagate carrying a string which describes what occurred
*/

var expect = chai.expect;
mocha.setup('bdd');

/* This test shows the labeling of a tree by using a stateeither monad
 */

var stateMaybe = MONAD.stateMaybe.stateMaybe;
var unit = MONAD.stateMaybe.UNIT;
var getState = MONAD.stateMaybe.sGet;
var setState = MONAD.stateMaybe.sSet;
var maybe = MONAD.maybe.UNIT;

describe('stateEither monad', function() {this.timeout(50000);
  it('is a spring mouse', function() {
    var stateMaybeRunned = unit(12)(1); // [1, maybe(12)]
    expect(stateMaybeRunned[0]).to.be.equal(1);
    expect(stateMaybeRunned[1]()).to.be.equal(12);
    var stateMaybeRunned2 = stateMaybe(s => [s, maybe(12)])(1); // [1, maybe(12)]
    expect(stateMaybeRunned2[0]).to.be.equal(1);
    expect(stateMaybeRunned2[1]()).to.be.equal(12);
  });
  it('binds to produce somes', function() {
    var twelve = unit(12);
    var fasmb = a => stateMaybe(s => [a+s, maybe(a-s)]);
    var bound = twelve.bind(fasmb);
    var [sss, maybea] = bound(1);
    expect(sss).to.be.equal(13);
    expect(maybea()).to.be.equal(11);
  });
  it('binds to preserve nones', function() {
    var none = unit(null);
    var fasmb = a => stateMaybe(s => [a+s, maybe(a-s)]);
    var bound = none.bind(fasmb);
    var [sss, maybea] = bound(1);
    expect(sss).to.be.equal(1);
    expect(maybea()).to.be.undefined;
  });
  it('binds to produce nones', function() {
    var twelve = unit(12);
    var facrash = a => stateMaybe(s => { throw 'ouch!'; });
    var bound = twelve.bind(facrash);
    var [sss, maybea] = bound(1);
    expect(sss).to.be.equal(1);
    expect(maybea()).to.be.undefined;
  });
  it('features sGet', function() {
    var twelve = unit(12);
    var fasmb = a => stateMaybe(s => [a+s, maybe(a-s)]); // s -> 12+s
    var bound = twelve.bind(fasmb).bind(a => getState);
    var [sss, maybea] = bound(1);
    expect(sss).to.be.equal(13);
    expect(maybea()).to.be.equal(13);
  });
  it('features sSet', function() {
    var twelve = unit(12);
    var fasmb = a => stateMaybe(s => [a+s, maybe(a-s)]); // a -> 12-s
    var bound = twelve.bind(fasmb).bind(a => setState(a*2));
    var [sss, maybea] = bound(1);
    expect(sss).to.be.equal(22);
    expect(maybea()).to.be.undefined;
  });
});

var node = MyTree.node;
var leaf = MyTree.leaf;
var empty = MyTree.empty;
var left = maybeNode => MyTree.left(maybeNode());
var right = maybeNode => MyTree.right(maybeNode());
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

describe('monadic labeler using stateEithers', function() {this.timeout(50000);
  it('labels a single leaf', function() {
    var result = MyTree.monadicMaybeLabeler(leaf('aaa'));
    // s => [s+1, maybe(leaf([s,'aaa']))]
    expect(result(0)[0]).to.be.equal(1);
    expect(result(0)[1]()(identity)).to.be.eql([0, 'aaa']);
  });
  it('puts none on an empty node', function() {
    // s => [s, none]
    var result = MyTree.monadicMaybeLabeler(empty());
    expect(result(0)[0]).to.be.equal(0);
    var none = result(0)[1];
    expect(MONAD.maybe.isNone(none)).to.be.ok;
  });
  it('labels the simplest node', function() {
    var tree = node(leaf('a'), leaf('b'));
    var result = MyTree.monadicMaybeLabeler(tree);
    // result(0) = [2, maybe(node(leaf([0,'a']), leaf([1,'b'])))]
    expect(result(0)[0]).to.be.equal(2);
    expect(left(result(0)[1])()(identity)).to.be.eql([0, 'a']);
    expect(right(result(0)[1])()(identity)).to.be.eql([1, 'b']);
  });
  it('detects nones also deep down', function() {
    var tree = node(leaf('aaa'),empty());
    var result = MyTree.monadicMaybeLabeler(tree);
    // result(0) = [0, none]
    expect(result(0)[0]).to.be.equal(1); // one leaf encountered
    expect(MONAD.maybe.isNone(result(0)[1])).to.be.ok;
  });
  it('labels a simple tree', function() {
    var simpleResult = MyTree.monadicMaybeLabeler(simpleTree);
    expect(simpleResult(0)[0]).to.be.equal(3);
    var leftLabeledLeaf = left(simpleResult(0)[1])(); // leaf([0,'a'])
    expect(leftLabeledLeaf(identity)).to.be.eql([0,'a']);
    expect(right(right(simpleResult(0)[1]))()(identity)).to.be.eql([2,'c']);
  });
  it('labels a complex tree', function() {
    var complexResult = MyTree.monadicMaybeLabeler(complexTree);
    var finalState = complexResult(0)[0];
    var labeledTree = complexResult(0)[1];
    expect(finalState).to.be.equal(4);
    expect(left(labeledTree)()(identity)).to.be.eql([0,'a']);
    expect(right(left(right(labeledTree)))()(identity)).to.be.eql([2,'c']);
  });
  it('nones a complex tree with empties', function() {
    var complexResult = MyTree.monadicMaybeLabeler(complexTreeWithEmpties);
    var finalState = complexResult(0)[0];
    var maybeLabeledTree = complexResult(0)[1];
    expect(finalState).to.be.equal(2);
    expect(MONAD.maybe.isNone(maybeLabeledTree)).to.be.ok;
  });
});
