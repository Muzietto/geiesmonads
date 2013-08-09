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

	var unit = function(valueOrMonad,famb){
		var result;
		// famb(monad(newState).value)(monad(newState).state) --> mb
		if (famb) { // invocation from bind
			result = function(newState){
				var a = valueOrMonad(newState);
				var mb = famb(a.value)(a.state);
				return {value:mb.value,state:mb.state};
			};
		} else { // proper value given
			result = function (state) {
				return {value:valueOrMonad,state:state};
			};			
		}
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
	
	// famb(this(newState).value)(this(newState).state) --> mb
	var bind = function(famb){
		return unit(this,famb);
	};
	
	var instanceOf = function(){
		return 'state';
	};
	
	return {
		unit: unit,
		flatten: flatten,
		instanceOf: instanceOf,
		bind: bind
	};
}();

Monad.state = myStateMonad;
