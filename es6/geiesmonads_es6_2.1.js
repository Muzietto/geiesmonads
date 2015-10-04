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
	var branch, leaf,
	left, right,
	manualLabeler,
	monadicLabeler,
	nextLeaf
	;
	
	leaf = function(value) {
		var result, _type = 'LEAF'
		;
		result = function() {return value;}
		result.type = function(){return _type;};
		return result;
	};
	
	branch = function(leftT,rightT) {
		var result, _type = 'BRANCH'
		;
		result = function(w){return w(leftT,rightT)};
		result.type = function(){return _type;};
		return result;
	};
	
	left = function(branch) {
		return branch(function(l,r){return l;});
	};
	
	right = function(branch) {
		return branch(function(l,r){return r;});
	};
	
	/* this function accepts a tree and produces a labeled tree.
	 * Because of the recursion call needs, the return value 
	 * must be a pair [state,labeled tree]
	 */
	manualLabeler = function(tree,stateNum) {
		var lltreeLeft, lltreeRight
		;
		switch (tree.type()) {
		
			case 'LEAF':
				return [stateNum+1,leaf([stateNum,tree()])];
				break;
			case 'BRANCH':
				lltreeLeft = manualLabeler(left(tree),stateNum);
				 // manualLabeler(left(tree)) returns and updated state to be fed to the right branch
				lltreeRight = manualLabeler(right(tree),lltreeLeft[0]);
				return [lltreeRight[0],branch(lltreeLeft[1],lltreeRight[1])];
				break;
			default:
				throw "Not a tree!";
		}
	};
	
	/* accepts a tree and returns a state monad
	 * that will label it starting from an initial state (to be provided)
	 */
	monadicLabeler = function(tree) {
		var leafSM, branchSM
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
			case 'BRANCH':				
				/**
				 * do
				 *  // PLB = pair-labeled branch
				 *  leftPLB <- MkM(left(branch))
				 *  rightPLB <- MkM(right(branch)) 
				 * return (Br leftPLB rightPLB)
				 *
				 * MkM(oldLeft)
				 * 	 .bind(leftPLB -> MkM(oldRight)
				 *		.bind(rightPLB -> unit(branch(leftPLB, rightPLB))));
				 */
				branchSM = monadicLabeler(left(tree))
					.bind(function(leftPLB) { return monadicLabeler(right(tree))
						.bind(function(rightPLB) {
							return MONAD.state.UNIT(branch(leftPLB,rightPLB));
						});
							// NO SMART ALTERNATIVE using lift here (why is that?)
					});
					
				return branchSM;
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
		branch:branch,
		leaf:leaf,
		left:left,
		right:right,
		manualLabeler:manualLabeler,
		monadicLabeler:monadicLabeler
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
