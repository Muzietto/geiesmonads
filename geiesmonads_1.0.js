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
		return unit(famb(flatten.apply(this)))();
	};
	
	var bindXXX = function(famb){
		var ZZZ = flatten.apply(this);
		return unit(famb(ZZZ))();
	};
	
	var instanceOf = function(){
		return 'maybe';
	};
	
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
		var result = function(state) {
			return {value:value,state:state};
		};
		result.unit = unit;
		result.flatten = flatten;
		result.instanceOf = instanceOf;
		result.bind = bind;
		return result;
	};
	// stateFun = famb(a.value)
	var unit2 = function(value,stateFun){
		var result = function(state) {
			return {value:value,state:stateFun(state).state};
		};
		result.unit = unit;
		result.flatten = flatten;
		result.instanceOf = instanceOf;
		result.bind = bind;
		return result;
	};
	
	var flatten = function() {
		return function(state){
			// grandissima FIGATA!!!!
			return (this(state));
		};
	};
	
	// famb(flatten(ma)) --> mb
	var bindXXX = function(famb){
		// grande FIGATA!!!! runs in the context of the monad...
		return unit(famb(flatten.apply(this))());
	};
	
	// famb(flatten(this(newState)).value)(flatten(this(newState)).state) --> mb
	var bind = function(famb){
		var self = this;
		return function(newState){
			var a = self(newState);
			return unit2(famb(a.value)(a.state).value,famb(a.value))(newState);
		};
	};
	
	var instanceOf = function(){
		return 'state';
	};
	
	return {
		unit: unit,
		unit2: unit2,
		flatten: flatten,
		instanceOf: instanceOf,
		bind: bind
	};
}();

Monad.state = myStateMonad;
