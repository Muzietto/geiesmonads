/*
	GEIESMONADS - JS monads
	Author: Marco Faustinelli (contacts@faustinelli.net)
	Web: http://faustinelli.net/
	     http://faustinelli.wordpress.com/
	Version: 2.1 - using ECMAScript 6

	The MIT License - Copyright (c) 2013/2015 Geiesmonads Project
*/

var MONAD = {
	maybe: null,
	state: null
};

MONAD.maybe = (function() {
  var monad = value => {
    var maybe = () => value;
    maybe.bind = famb => (typeof value !== 'undefined' && value !== null) ? famb(value) : maybe;
    return maybe;
  }
  return { UNIT : monad };
})();

MONAD.state = function() {
  var monad = fssa => { 
    var state = s => fssa(s);
    state.bind = fasmb => monad(s => {
      var [sss, aaa] = state(s);
      return fasmb(aaa)(sss);
    });
    return state;
  }

	return {
    UNIT : a => monad(s => [s, a]),
    state: monad,
    sSet : S => monad(s => [S, undefined]),
    sGet : monad(s => [s, s])
	};
}();

// TODO - continue from here!

/* Helper functions for the tree labeling example 
   cfr. http://channel9.msdn.com/Shows/Going+Deep/Brian-Beckman-The-Zen-of-Expressing-State-The-State-Monad
*/
var MyTree = function(){
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
    result.match = (eFun, lFun, tFun) => tFun(left, right);
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
	 */
	_monadicLabeler = function(tree) {
		var leafSM, nodeSM
		;
		switch (tree.type()) {
			case 'LEAF':
				/**
				 * updateState.bind(n -> unit(leaf([n,tree()])));
				 *
				 * do
				 *   n <- updateState
				 * return leaf([n,tree()])
				 */
				leafSM = updateState.bind(function(n) {
					return MONAD.state.UNIT(leaf([n,tree()]));
				});
				/* SMART ALTERNATIVE using lift (since we aren't modifying state)
				leafSM = updateState.bind(MONAD.state.lift(function(n) {
					return leaf([n,tree()]);
				}));
				*/
				return leafSM;
				break;
			case 'node':				
				/**
				 * do
				 *  // PLB = pair-labeled node
				 *  leftPLB <- MkM(left(node))
				 *  rightPLB <- MkM(right(node)) 
				 * return (Br leftPLB rightPLB)
				 *
				 * MkM(oldLeft)
				 * 	 .bind(leftPLB -> MkM(oldRight)
				 *		.bind(rightPLB -> unit(node(leftPLB, rightPLB))));
				 */
				nodeSM = monadicLabeler(left(tree))
					.bind(function(leftPLB) { return monadicLabeler(right(tree))
						.bind(function(rightPLB) {
							return MONAD.state.UNIT(node(leftPLB,rightPLB));
						});
							// NO SMART ALTERNATIVE using lift here (why is that?)
					});
					
				return nodeSM;
				break;
			default:
				throw "Not a tree!";
		}
	};

	// helper of the monadic labeler
	updateState = MONAD.state.UNIT(function(n){
		return {state:n+1,value:n};
	});
	
	return {
		node : node,
		leaf : leaf,
		empty : empty,
		left : left,
		right : right,
		manualLabeler : manualLabeler,
		monadicLabeler : monadicLabeler
	}
}();

/* Helper functions for the imperative programming example
   cfr. http://brandon.si/code/the-state-monad-a-tutorial-for-the-confused/
*/
var ImperativeMonad = function(){
	var push, pop
	;
	
	getState = MONAD.state.UNIT(function(state) {
		return {state:state,value:state};
	});
	
    // push(item) is a state monad
	push = function(item) {
		return MONAD.state.UNIT(function(state) {
			var stateCopy
			;
			stateCopy = state.slice();
			stateCopy.push(item);
			return {state:stateCopy,value:undefined};
		});
	};
	
    // stack -> (cdr stack,car stack)
	pop = MONAD.state.UNIT(function(state) {
			var stateCopy, item
			;
			stateCopy = state.slice(),
			item = stateCopy.pop();
			return {state:stateCopy,value:item};
		});
	
    /* use these like:
       pop.bind(x -> pop.bind(_ -> push(x)))
       
       which is:
       do
         x <- pop
              pop
              push x
    */
	return {
		push:push,
		pop:pop
	}
}();
