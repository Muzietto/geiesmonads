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

var stateEither = MONAD.stateEither.stateEither;
var unit = MONAD.stateEither.UNIT;
var getState = MONAD.stateEither.sGet;
var setState = MONAD.stateEither.sSet;
var isLeft = MONAD.either.isLeft;
var isRight = MONAD.either.isRight;

describe('stateEither monad', function() {
  it('is a spring mouse', function() {
    var stateEitherRunned = unit(MONAD.either.right(12))(1); // [1, right(12)]
    expect(stateEitherRunned[0]).to.be.equal(1);
    expect(stateEitherRunned[1]()).to.be.equal(12);
    var stateEitherRunned2 = stateEither(s => [s, MONAD.either.right(12)])(1); // [1, right(12)]
    expect(stateEitherRunned2[0]).to.be.equal(1);
    expect(stateEitherRunned2[1]()).to.be.equal(12);
  });
  it('binds to produce rights', function() {
    var twelve = unit(MONAD.either.right(12));
    var faserb = a => stateEither(s => [a+s, MONAD.either.right(a-s)]);
    var bound = twelve.bind(faserb);
    var [sss, eithera] = bound(1);
    expect(sss).to.be.equal(13);
    expect(isRight(eithera)).to.be.ok;
    expect(eithera()).to.be.equal(11);
  });
  it('binds to produce and preserve lefts', function() {
    var twelve = unit(MONAD.either.right(12));
    var faselb = a => stateEither(s => [a+s, MONAD.either.left(a-s)]);
    var faserb = a => stateEither(s => [a+s, MONAD.either.right(a-s)]);
    var bound1 = twelve.bind(faselb);
    var bound2 = bound1.bind(faserb);
    var [sss1, eithera1] = bound1(1);
    expect(sss1).to.be.equal(13);
    expect(isLeft(eithera1)).to.be.ok;
    expect(eithera1()).to.be.equal(11);
    var [sss2, eithera2] = bound2(1);
    expect(sss2).to.be.equal(13);
    expect(isLeft(eithera2)).to.be.ok;
    expect(eithera2()).to.be.equal(11);
  });
  it('features sGet', function() {
    var twelve = unit(MONAD.either.right(12));
    var fasmb = a => stateEither(s => [a+s, MONAD.either.right(a-s)]); // s -> 12+s
    var bound = twelve.bind(fasmb).bind(a => getState);
    var [sss, eithera] = bound(1);
    expect(sss).to.be.equal(13);
    expect(isRight(eithera)).to.be.ok;
    expect(eithera()).to.be.equal(13);
  });
  it('features sSet', function() {
    var twelve = unit(MONAD.either.right(12));
    var fasmb = a => stateEither(s => [a+s, MONAD.either.right(a-s)]); // a -> 12-s
    var bound = twelve.bind(fasmb).bind(a => setState(a*2));
    var [sss, eithera] = bound(1);
    expect(sss).to.be.equal(22);
    expect(eithera()).to.be.equal(0);
  });
});

var node = MyTree.node;
var leaf = MyTree.leaf;
var empty = MyTree.empty;
var leftBranch = eitherNode => MyTree.left(eitherNode());
var rightBranch = eitherNode => MyTree.right(eitherNode());
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
    var result = MyTree.monadicEitherLabeler(leaf('aaa'));
    // s => [s+1, right(leaf([s,'aaa']))]
    expect(result(0)[0]).to.be.equal(1);
    expect(isRight(result(0)[1])).to.be.ok;
    expect(result(0)[1]()(identity)).to.be.eql([0, 'aaa']);
  });
  it('puts a leftie on an empty node', function() {
    // s => [s, left(0)]
    var result = MyTree.monadicEitherLabeler(empty());
    expect(result(0)[0]).to.be.equal(0);
    var lefty = result(0)[1];
    expect(isLeft(lefty)).to.be.ok;
    expect(lefty()).to.be.equal(0);
  });
  it('labels the simplest node', function() {
    var tree = node(leaf('a'), leaf('b'));
    var result = MyTree.monadicEitherLabeler(tree);
    // result(0) = [2, right(node(right(leaf([0,'a'])), right(leaf([1,'b']))))]
    expect(result(0)[0]).to.be.equal(2);
    expect(isRight(leftBranch(result(0)[1]))).to.be.ok;
    expect(leftBranch(result(0)[1])()(identity)).to.be.eql([0, 'a']);
    expect(isRight(rightBranch(result(0)[1]))).to.be.ok;
    expect(rightBranch(result(0)[1])()(identity)).to.be.eql([1, 'b']);
  });
  it('detects empties also deep down', function() {
    var tree = node(leaf('aaa'),empty());
    var result = MyTree.monadicEitherLabeler(tree);
    // result(0) = [0, none]
    expect(result(0)[0]).to.be.equal(1); // one leaf encountered
    var lefty = result(0)[1];
    expect(isLeft(lefty)).to.be.ok;
    expect(lefty()).to.be.equal(1); // one leaf encountered
  });
  it('labels a simple tree', function() {
    var simpleResult = MyTree.monadicEitherLabeler(simpleTree);
    expect(simpleResult(0)[0]).to.be.equal(3);
    var leftLabeledLeaf = leftBranch(simpleResult(0)[1]); // leaf([0,'a'])
    expect(isRight(leftLabeledLeaf)).to.be.ok;
    expect(leftLabeledLeaf()(identity)).to.be.eql([0,'a']);
    expect(isRight(rightBranch(rightBranch(simpleResult(0)[1])))).to.be.ok;
    expect(rightBranch(rightBranch(simpleResult(0)[1]))()(identity)).to.be.eql([2,'c']);
  });
  it('labels a complex tree', function() {
    var complexResult = MyTree.monadicEitherLabeler(complexTree);
    var finalState = complexResult(0)[0];
    var labeledTree = complexResult(0)[1];
    expect(finalState).to.be.equal(4);
    expect(leftBranch(labeledTree)()(identity)).to.be.eql([0,'a']);
    expect(rightBranch(leftBranch(rightBranch(labeledTree)))()(identity)).to.be.eql([2,'c']);
  });
  it('nones a complex tree with empties', function() {
    var complexResult = MyTree.monadicEitherLabeler(complexTreeWithEmpties);
    var finalState = complexResult(0)[0];
    var eitherLabeledTree = complexResult(0)[1];
    expect(finalState).to.be.equal(2);
    expect(isLeft(eitherLabeledTree)).to.be.ok;
  });
});