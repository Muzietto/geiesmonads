// http://jabberwocky.eu/2012/11/02/monads-for-dummies/

Object.create = function(prot) {
	function F(){};
	F.prototype = prot;
	return F();
}

// identity monad
var identityUnit = function(value) {
	return function(){ return value;}
};

var identityFlatten = function(monad){
	return monad();
};

// public <B> Maybe<B> bind(F<A, Maybe<B>> famb)
var identityBind = function(ma, famb) {
	return famb(identityFlatten(ma));
};

var identityLift = function(famb){
	return function(ma){
		return identityBind(ma, famb);
	};
};

var Monad = {
	identity: null,
	maybe: null,
	state: null
};

var myIdentityMonad = function() {
	var unit = function(value){
		return function(){
			return value;
		};
	};
	
	var map = function(ma, fab){
		return unit(fab(flatten(ma)));
	};
	
	var flatten = function(ma){
		return ma();
	};
	
	var bind = function(ma, famb){
		return famb(flatten(ma));
	};
	
	var instanceOf = function(){
		return 'Identity';
	};
	
	return {
		unit: unit,
		map: map,
		instanceOf: instanceOf,
		flatten: flatten,
		bind: bind
	};
}();

Monad.identity = myIdentityMonad;

var myMaybeMonad = function() {
	var unit = function(value){
		return function(){
			return value;
		};
	};
	
	var map = function(ma, fab){
		return unit(fab(flatten(ma)));
	};
	
	var flatten = function(ma){
		if (ma()) {
			return ma();
		} else {
			return function(){};
		}
	};
	
	var bind = function(ma, famb){
		return famb(flatten(ma));
	};
	
	var instanceOf = function(){
		return 'Maybe';
	};
	
	return {
		unit: unit,
		map: map,
		flatten: flatten,
		instanceOf: instanceOf,
		bind: bind
	};
}();

var myChainableMaybeMonad = function() {
	var unit = function(value){
		return function(){
			return value;
		};
	};
	
	var map = function(ma, fab){
		return unit(fab(flatten(ma)));
	};
	
	var flatten = function(ma){
		if (ma()) {
			return ma();
		} else {
			return function(){};
		}
	};
	
	// famb(flatten(ma)) --> mb
	var bind = function(famb){
		// grande FIGATA!!!!
		return Monad.maybe.create(famb(flatten(this))());
	};
	
	var instanceOf = function(type){
		return 'Maybe';
	};
	
	return {
		unit: unit,
		map: map,
		flatten: flatten,
		instanceOf: instanceOf,
		bind: bind
	};
}();

Monad.maybe = myChainableMaybeMonad;

Monad.maybe.create = function(value,famb){
	var result = function(){
		return value;
	};
	result.bind = myChainableMaybeMonad.bind;
	result.flatten = myChainableMaybeMonad.flatten;
	result.unit = myChainableMaybeMonad.unit;
	result.instanceOf = myChainableMaybeMonad.instanceOf;
	result.map = myChainableMaybeMonad.map;
	return result;
}







