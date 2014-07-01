
/* Define a State monad that manages errors (in a sense like Maybe): 
   if an error/problem occurs during the "do" computation, 
   it is signalled and propagated by >>=. 
   The error should also contain a string describing it.
*/
var myStateMaybeMonad = function() {

	var monad = function(fssma) { // State a :: s -> (s,maybe a)
		var result = fssma.bind({}) // clone using prototype.bind
		;
		result.bind = bind; // overriding prototype.bind - what a pity!!!
		result.instanceOf = instanceOf;
		
		return result;
	};

	var unit = function(value){
		var result = function (state) {
			return {state:state,value:Monad.maybe.unit(value)};
		};
		return monad(result);
	};

	var bind = function(fasmb){ // a -> state maybe b
		var that = this;
		return monad(function(newState) { // a new fssma
			var cp = that(newState); // current pair
			if (cp.value.is_some) return famb(cp.value())(cp.state);
			else return monad(function(state){
				return {state:newState,value:Monad.maybe.unit(null)};
			});
		});
	};

	var instanceOf = function(){
		return 'stateMaybe';
	};
	
	return {
		monad:monad,
		unit: unit,
		instanceOf: instanceOf,
		bind: bind
	};
}();

Monad.stateMaybe = myStateMaybeMonad;

	/* accepts a tree and returns a state monad
	 * that will label it starting from an initial state (to be provided)
	 */
MyTree.monadicMaybeLabeler = function(tree) {
	var leafSM, branchSM
	;
	switch (tree.type()) {
		case 'LEAF':
			leafSM = updateState.bind(function(n) {
				var maybe
				;
				if (tree()!=='x') {
					maybe = Monad.maybe.unit(MyTree.leaf([n,tree()]))
				} else {
					maybe = Monad.maybe.unit(null);
				}
				return Monad.stateMaybe.unit(maybe);
			});
			return leafSM;
			break;
			
		case 'BRANCH':				
			branchSM = MyTree.monadicMaybeLabeler(MyTree.left(tree))
				.bind(function(leftPLB) { return MyTree.monadicMaybeLabeler(MyTree.right(tree))
					.bind(function(rightPLB) {
						return Monad.stateMaybe.unit(MyTree.branch(leftPLB,rightPLB));
					});
				});					
			return branchSM;
			break;
			
		default:
			throw "Not a tree!";
	}
};
