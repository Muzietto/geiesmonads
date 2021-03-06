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

var myMaybeMonad = (function() {

	var unit = function(value){
		var result = function(){
			if (some(value)) return value;
			return undefined;
		};
		result.is_some = function(){ return some(value); };
		result.is_none = function(){ return !some(value); };
		result.bind = bind;
		result.flatten = flatten;
		result.unit = unit;
		result.instanceOf = instanceOf;
		result.map = map;
		return result;
	};
	
	var some = function(value) {
		return (typeof value !== "undefined" 
			&& value !== null
			&& value === value);
	};

	// fab --> mb
	var map = function(fab){
		return this.bind(liftM(fab));
	};

	var flatten = function(){
		// grandissima FIGATA!!!!
		if (some(this())) return this();
		return undefined;
	};

	// famb(flatten(ma)) --> mb
	var bind = function(famb){
		if (some(this())) return famb(this());
		return unit(undefined);
	};
	
	var instanceOf = function(){
		return 'maybe';
	};
	
	// fab --> famb
	var liftM = function(fab){
		return function(x) {
			return unit(fab(x));
		};
	};

	return {
		unit: unit,
		monad: unit,
        // keep lift for backward compatibility
		lift: liftM,
		liftM: liftM
	};
}());

Monad.maybe = myMaybeMonad;

var myStateMonad = function() {

	var monad = function(fssa) { // s -> (s,a)
        // allow wrapping
        if (fssa.instanceOf && fssa.instanceOf()==='state') {
            return unit(fssa);
        }        
        var result = fssa.bind({}) // clone using prototype.bind
		;
		result.bind = bind; // overriding prototype.bind - what a pity!!!
		result.flatten = flatten;
		result.map = map;
		result.filter = filter;
		result.flatten = flatten;
		result.iff = iff;
		result.onError = onError;
		result.instanceOf = instanceOf;
		
		return result;
	};

	var unit = function(value){	
		var result = function (state) {
			return {state:state,value:value};
		};
		return monad(result);
	};

	// famb(this(state).value)(this(state).state) --> mb
	var bind = function(famb){
		var that = this;
		return monad(function(state) { // a new fssa
			var cp = that(state); // current pair
			return famb(cp.value)(cp.state);
		});
	};
	
	// fab --> famb
	var lift = function(fab){
		return function(x) {
			return unit(fab(x));
		};
	};

    // extract value from s -> (s, s -> (s,a))
	var flatten = function() {
		var that = this;
		return monad(function(state){
            return (that(state).value)(state);
		});
	};
	
    // monad(s -> {state:s,value:fab(this(s).state)}) -> m(mb)
	var map = function(fab){
        var that = this;
        return monad(function(state){ // a new fssa
            var cp = that(state); // current pair
            return {state:state,value:fab(cp.value)};
        });
        // simpler alternative
		//return this.bind(lift(fab));
	};
	
	var instanceOf = function(){
		return 'state';
	};
	
    /* 
    theoretically this is a bindable famb, 
    but there's no reason bind it.
    It would explode at each run of the monad */
	var fail = function(value){
		return monad(function(state){
            throw {message:value}
        });
	};

	// predicate: value -> boolean
	var filter = function(predicate,msg){
        // _iff is famb...
		var _iff = function(value) {
			if (predicate(value)){
				return unit(value);
			} else {
				return fail(msg + '-' + value);
			}
		};
        // ...that gets bound to the chain
		return this.bind(_iff);
	};

	/*
    last ring in a particular section of the monad chain.
    wraps the execution in a try block and proceeds with 
    errorHandler must be a function 
    with type exception -> state monad 
    */
	var onError = function(errorHandler){
        var that = this
        ;
        return function(state){
            try {
                return that(state);
            } catch (exception){
                return errorHandler(exception)(state);
            }
        };
    };
	
    // binds one or the other monad depending on predicate
    var iff = function(predicate,trueMonad,falseMonad) {
        // _iff is famb...
        var _iff = function(value){
            if (predicate(value)){
                return trueMonad.bind(function(_){return unit(value)})
            } else {
                return falseMonad.bind(function(_){return unit(value)})
            }
        }
        // ...that gets bound to the chain
        return this.bind(_iff);
    }
    
	return {
        monad:monad,
        unit: unit,
        lift: lift,
        liftM: lift
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
				 * updateState.bind(n -> unit(leaf([n,tree()])));
				 *
				 * do
				 *   n <- updateState
				 * return leaf([n,tree()])
				 */
				leafSM = updateState.bind(function(n) {
					return Monad.state.unit(leaf([n,tree()]));
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
							return Monad.state.unit(branch(leftPLB,rightPLB));
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

/* Helper functions for the imperative programming example
   cfr. http://brandon.si/code/the-state-monad-a-tutorial-for-the-confused/
*/
var ImperativeMonad = function(){
	var push, pop
	;
	
	getState = Monad.state.monad(function(state) {
		return {state:state,value:state};
	});
	
    // push(item) is a state monad
	push = function(item) {
		return Monad.state.monad(function(state) {
			var stateCopy
			;
			stateCopy = state.slice();
			stateCopy.push(item);
			return {state:stateCopy,value:undefined};
		});
	};
	
    // stack -> (cdr stack,car stack)
	pop = Monad.state.monad(function(state) {
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
