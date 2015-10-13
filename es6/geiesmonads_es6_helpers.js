/*
	GEIESMONADS - JS monads
	Author: Marco Faustinelli (contacts@faustinelli.net)
	Web: http://faustinelli.net/
	     http://faustinelli.wordpress.com/
	Version: 2.1 - using ECMAScript 6

	The MIT License - Copyright (c) 2013/2015 Geiesmonads Project
*/

/* Helper functions for the tree labeling example 
   cfr. http://channel9.msdn.com/Shows/Going+Deep/Brian-Beckman-The-Zen-of-Expressing-State-The-State-Monad
*/
var MyTree = function() {
	var empty, node, leaf,
	left, right,
	manualLabeler,
	monadicLabeler,
	nextLeaf
	;

	empty = () => {
		var result = () => {};
    result.match = (eFun, lFun, tFun) => eFun();
		return result;
	};

	leaf = value => {
		var result = w => w(value);
    result.match = (eFun, lFun, tFun) => lFun(value);
		return result;
	};

	node = (left, right) => {
		var result = w => w(left, right);
    result.match = (eFun, lFun, tFun) => {
      return tFun(left, right);
    }
		return result;
	};
	
	left = node => node((l,r) => l);
	right = node => node((l,r) => r);
	
	/* this function accepts a tree and produces a labeled tree.
	 * Because of the recursion call needs, the return value 
	 * must be a pair [state, labeled tree]
	 */
  manualLabeler = (s, tree) => tree.match(
    _ => [s, empty()],
    value => [s + 1, leaf([s, value])],
    (lnode, rnode) => {
      var leftLTree = manualLabeler(s, lnode);
      var rightLTree = manualLabeler(leftLTree[0], rnode);
      return [rightLTree[0], node(leftLTree[1], rightLTree[1])];
    }
  );

	/* accepts a tree and returns a state monad
	 * that will label it starting from an initial state (to be provided)
	 */
  monadicLabeler = tree => {
    var tick = MONAD.state.state(n => [n+1, n]);
    var getState = MONAD.state.sGet;
    var setState = MONAD.state.sSet;
    var unit = MONAD.state.UNIT;
    return tree.match(
      /*  do return undefined
       */
      _ => unit(empty()),
      /*  value => do n <- getState
       *              setState (n+1)
       *              return leaf([n,value])
       */
      value => tick.bind(n => unit(leaf([n,value]))),
      //value => getState.bind(n => setState(n+1).bind(_ => unit(leaf([n,value])))),
      /*  (lTree, rTree) => do leftLTree  <- monadicLabeler(lTree)
       *                       rightLTree <- monadicLabeler(rTree)
       *                       return node(leftLTree, rightLTree)
       */
      (lTree, rTree) => monadicLabeler(lTree)
                          .bind(leftLTree => monadicLabeler(rTree)
                            .bind(rightLTree => unit(node(leftLTree, rightLTree))))
    );
  }

	/* accepts a tree and returns a state monad
	 * that will label it starting from an initial state (to be provided)
   * NB: if an empty leaf is met, the whole tree becomes a none
	 */
  monadicMaybeLabeler = tree => {
    var maybe = MONAD.maybe.UNIT;
    var tick = MONAD.stateMaybe.stateMaybe(n => [n+1, maybe(n)]);
    var unit = MONAD.stateMaybe.UNIT;
    return tree.match(
      _ => unit(null),
      value => tick.bind(n => unit(leaf([n, value]))),
      (lTree, rTree) => monadicMaybeLabeler(lTree)
                          .bind(leftLTree => monadicMaybeLabeler(rTree)
                            .bind(rightLTree => unit(node(maybe(leftLTree), maybe(rightLTree)))))
    );
  }
  return {
		node : node,
		leaf : leaf,
		empty : empty,
		left : left,
		right : right,
		manualLabeler : manualLabeler,
		monadicLabeler : monadicLabeler,
		monadicMaybeLabeler : monadicMaybeLabeler
	}
}();