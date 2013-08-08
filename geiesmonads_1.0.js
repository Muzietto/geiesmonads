var Monad = {
	maybe: null,
	state: null
};

var myMaybeMonad = function() {
	var map = function(ma, fab){
		return unit(fab(flatten(ma)));
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
		return unit(famb(flatten.apply(this))());
	};
	
	var instanceOf = function(){
		return 'maybe';
	};
	
	var unit = function(value){
		var result = function(){
			return value;
		};
		result.bind = bind;
		result.flatten = flatten;
		result.unit = unit;
		result.instanceOf = instanceOf;
		result.map = map;
		return result;
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
