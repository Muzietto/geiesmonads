/*
	GEIESMONADS - JS monads
	Author: Marco Faustinelli (contacts@faustinelli.net)
	Web: http://faustinelli.net/
	     http://faustinelli.wordpress.com/
	Version: 1.9

	The MIT License - Copyright (c) 2013 Geiesmonads Project
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

	var unit = function(value){
		var result = function (state) {
				return {state:state,value:value};
		};
		result.unit = unit;
		result.flatten = flatten;
		result.map = map;
		result.filter = filter;
		result.onError = onError;
		result.instanceOf = instanceOf;
		result.bind = bind;
		
		return result;
	};

	// famb(this(newState).value)(this(newState).state) --> mb
	var bind = function(famb){
		var that = this;
		return function(newState) {
			var cp = that(newState); // current pair
			return unit(famb(cp.value)(cp.state));
		}
	};

	// ea: =>a
	var apply = function(ea) {
		return function(state) {
			return {state:state,value:ea}
		};
	};
	
	var flatten = function() {
		var that = this;
		return function(state){
			// grandissima FIGATA!!!!
			return (that(state));
		};
	};
	
	/* NB - flatten could also mean: given a monad
	   M: s-> (v,s) return a f:v -> s -> (v,s) 
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
		unit: unit,
		apply: apply,
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
