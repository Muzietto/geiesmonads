/*
	GEIESMONADS - JS monads
	Author: Marco Faustinelli (contacts@faustinelli.net)
	Web: http://faustinelli.net/
	     http://faustinelli.wordpress.com/
	Version: 1.0

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

	var unit = function(valueOrMonad,famb){
		var result;
		// famb(monad(newState).value)(monad(newState).state) --> mb
		if (famb) { // invocation from bind --> valueOrMonad = self
			result = function(newState){
				var a = valueOrMonad(newState);
				var mb = famb(a.value)(a.state);
				return mb;
			};
		} else { // proper value given
			result = function (state) {
				return {value:valueOrMonad,state:state};
			};			
		}
		result.unit = unit;
		result.flatten = flatten;
		result.map = map;
		result.filter = filter;
		result.instanceOf = instanceOf;
		result.bind = bind;
		return result;
	};

	// ea: =>a
	var apply = function(ea) {
		return function(state) {
			return {value:ea,state:state}
		};
	};
	
	var flatten = function() {
		return function(state){
			// grandissima FIGATA!!!!
			return (this(state));
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

	// famb(this(newState).value)(this(newState).state) --> mb
	var bind = function(famb){
		return unit(this,famb);
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
	
	return {
		unit: unit,
		apply: apply,
		lift: lift,
		fail: fail,
		map: map,
		flatten: flatten,
		instanceOf: instanceOf,
		bind: bind
	};
}();

Monad.state = myStateMonad;
