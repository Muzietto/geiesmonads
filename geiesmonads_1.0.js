var Monad = {
	maybe: null,
	state: null
};

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
	
	// famb(flatten(ma)) --> mb
	var bind = function(famb){
		// grande FIGATA!!!!
		return createZZZ(famb(flatten(this))());
	};
	
	var instanceOf = function(type){
		return 'Maybe';
	};
	
	createZZZ = function(value,famb){
		var result = function(){
			return value;
		};
		result.bind = myMaybeMonad.bind;
		result.flatten = myMaybeMonad.flatten;
		result.unit = myMaybeMonad.unit;
		result.instanceOf = myMaybeMonad.instanceOf;
		result.map = myMaybeMonad.map;
		return result;
	}

	return {
		unit: unit,
		map: map,
		flatten: flatten,
		instanceOf: instanceOf,
		bind: bind,
		createZZZ: createZZZ
	};
}();

Monad.maybe = myMaybeMonad;

Monad.maybe.create = function(value){
	var result = function(){
		return value;
	};
	result.bind = myMaybeMonad.bind;
	result.flatten = myMaybeMonad.flatten;
	result.unit = myMaybeMonad.unit;
	result.instanceOf = myMaybeMonad.instanceOf;
	result.map = myMaybeMonad.map;
	return result;
}
