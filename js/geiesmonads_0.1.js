// http://igstan.ro/posts/2011-05-02-understanding-monads-with-javascript.html

var bind = function(pair,continuation) { return continuation(pair); };

var curried_bind = function(stateOperator,continuation) { 
	return function(state){
		return continuation(stateOperator(state));
	}
};

// curried_bind2(curry_push(5),continuation)(state) = continuation(curry_push(5)(state))(curry_push(5)(state).state)
// stateOperator(state) -> pair; stateOperator e.g. curry_pop()
// continuation(pair) = computation; computation(state) = newState
var curried_bind2 = function (stateOperator, continuation) {
	return function (oldState) {
		var pair = stateOperator(oldState);  // curry_push(5)(state) --> {value:undefined,state:[v].concat(s)}
		var newState = pair.state;  // [v].concat(s)
		return continuation(pair)(newState);
	};
};

// result/unit is like a factory function that creates a new stateful context around the value we provide it with
var haskellianResult = function (value) {
	return function (state) {
		return { value: value, state: state };
	};
};
// chi cazzo ci obbliga a curryare-haskellare tutto?!? io voglio una unit così:
var unit = function(value, state) {
	return {value:value, state:state};
};

// continuation(value) =  computation; computation(state) = new State
var curried_bind3 = function (stateOperator, continuation) {
	return function (oldState) {
		var pair = stateOperator(oldState);  // curry_push(5)(state) --> {value:undefined,state:[v].concat(s)}
		return continuation(pair.value)(pair.state);
	};
};

var pairDumper = function(pair){return 'v='+pair.value+';s='+stateDumper(pair.state);}

var stateDumper = function(array){
	var result = '[';
	for (i=0;i<array.length;i++){
		result += array[i];
		if (i<array.length-1){
			result += ','
		}
	}
	return result += ']';
} 

var push = function (v,s) { 
	return {
		value: undefined, 
		state: [v].concat(s)
	}; 
};

var curry_push = function (v) { 
	return function(s) {
		return {
			value: undefined, 
			state: [v].concat(s)
		};
	};
};

var pop = function(s) {
	var out = s[0];
	return {
		value: out,
		state: s.slice(1)
	};
};

var curry_pop = function() {
	return function(s) {
		var out = s[0];
		return {
			value: out,
			state: s.slice(1)
		};
	};
};

var s0 = [];

var r0 = push(4,s0); // {value:undefined,state:[4]}
var r1 = push(5,r0.state);  // {value:undefined,state:[5,4]}
var r2 = pop(r1.state)  // {value:5,state:[4]}
var r3 = pop(r2.state)  // {value:4,state:[]}
