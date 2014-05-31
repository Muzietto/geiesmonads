/*
	GEIESMONADS - JS monads
	Author: Marco Faustinelli (contacts@faustinelli.net)
	Web: http://faustinelli.net/
	     http://faustinelli.wordpress.com/
	Version: 2.0

	The MIT License - Copyright (c) 2013/2014 Geiesmonads Project
*/

var Monad = {
	maybe: null,
	state: null
};

var myMaybeMonad = function() {

	var unit = function(value){
		var result = function(possibleBindingFunction){
			if (possibleBindingFunction) { // synt sugar
				return bind.apply(result,[possibleBindingFunction]);
			}
			else {
				return value;
			}
		};
		result.bind = bind;
		result.flatten = flatten;
		result.unit = unit;
		result.instanceOf = instanceOf;
		result.map = map;
		return result;
	};
	
	var map = function(fab){
		return bind(lift(fab));
	};
	
	var flatten = function(){
		// grandissima FIGATA!!!!
		if (this()) {
			return this();
		} else {
			return function(){};
		}
	};
	
	// famb(flatten(ma)) --> mb
	var bind = function(famb){
		// grande FIGATA!!!! runs in the context of the monad...
		return unit(famb(flatten.apply(this)))();
	};
	
	var instanceOf = function(){
		return 'maybe';
	};
	
	// fab --> famb
	var lift = function(fab){
		return function(x) {
			return unit(fab(x));
		};
	};

	return {
		unit: unit,
		lift: lift,
		map: map,
		flatten: flatten,
		instanceOf: instanceOf,
		bind: bind
	};
}();

Monad.maybe = myMaybeMonad;

var myStateMonad = function() {

	var monad = function(fssa) { // State a :: s -> (s,a)
		var result = fssa.bind({}) // clone using prototype.bind
		;
		result.unit = unit;
		result.flatten = flatten;
		result.map = map;
		result.filter = filter;
		result.onError = onError;
		result.instanceOf = instanceOf;
		result.bind = bind; // overriding prototype.bind - what a pity!!!
		
		return result;
	};

	var unit = function(value){	
		var result = function (state) {
				return {state:state,value:value};
		};
		return monad(result);
	};

	// famb(this(newState).value)(this(newState).state) --> mb
	var bind = function(famb){
		var that = this;
		return monad(function(newState) {
			var cp = that(newState); // current pair
			return famb(cp.value)(cp.state);
		});
	};

	var flatten = function() {
		var that = this;
		return monad(function(state){
			// grandissima FIGATA!!!!
			return (that(state));
		});
	};
	
	/* NB - flatten could also mean: given a monad
	   M: s-> (s,v) return a f:v -> s -> (s,v) 
	   ...but how exactly? 
	*/
	
	var map = function(fab){
		return bind(lift(fab));
	};
	
	// fab --> famb
	var lift = function(fab){
		return function(x) {
			return unit(fab(x));
		};
	};
	
	var instanceOf = function(){
		return 'state';
	};
	
	var fail = function(value){
		return unit(function(x){throw {message:value}}());
	};
	
	// predicate: v -> boolean
	var filter = function(predicate,msg){
		var iff = function(v) {
			if (predicate(v)){
				return unit(v);
			} else {
				return fail(msg + '-' + v);
			}
		};
		return this.bind(iff);
	};
	
	// errorHandler must be a :exception -> state monad
	var executor = function(monad,errorHandler){
		return function(state){
			try {
				return monad(state);
			} catch (exception){
				return errorHandler(exception)(state);
			}
		};
	};
	
	var onError = function(errorHandler){
		return executor(this,errorHandler);
	};
	
	return {
		monad:monad,
		unit: unit,
		lift: lift,
		fail: fail,
		executor: executor,
		onError: onError,
		map: map,
		flatten: flatten,
		instanceOf: instanceOf,
		bind: bind
	};
}();

Monad.state = myStateMonad;

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
				 * updateState.bind(n -> new StateMonad(s -> {state:s,value:leaf([n,tree()])}));
				 *
				 * how to express all this in do notation?
				 */
				leafSM = updateState.bind(function(n) {
					return Monad.state.monad(function(s) {
						return {state:s,value:leaf([n,tree()])};
					});
				});
				/* SMART ALTERNATIVE using lift (since we aren't modifying state)
				leafSM = updateState.bind(Monad.state.lift(function(n) {
					return leaf([n,tree()]);
				}));
				*/
				return leafSM;
				break;
			case 'BRANCH':				
				/**
				 * do
				 *  leftSM <- MkM(left(branch))
				 *  rightSM <- MkM(right(branch)) 
				 * return (Br leftSM rightSM)
				 *
				 * MkM(oldLeft)
				 * 	 .bind(leftSM -> MkM(oldRight)
				 *		.bind(rightSM -> new StateMonad(s -> (s,branch(leftSM, rightSM)))));
				 */
				branchSM = monadicLabeler(left(tree))
					.bind(function(leftSM) { return monadicLabeler(right(tree))
						.bind(function(rightSM) {
							return Monad.state.monad(function(state){ 
								return {state:state,value:branch(leftSM,rightSM)}; 
							});
							// NO SMART ALTERNATIVE using lift here (why is that?)
						})
					});
					
				return branchSM;
				break;
			default:
				throw "Not a tree!";
		}
	};

	// helper of the monadic labeler
	updateState = Monad.state.monad(function(n){
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