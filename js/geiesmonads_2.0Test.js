/*
	GEIESMONADS - JS monads
	Author: Marco Faustinelli (contacts@faustinelli.net)
	Web: http://faustinelli.net/
	     http://faustinelli.wordpress.com/
	Version: 2.0

	The MIT License - Copyright (c) 2013/2014 Geiesmonads Project
*/

YAHOO.namespace('GEIESMONADS.test');

var Assert = YAHOO.util.Assert;

/* A Couple of examples involving getString and putString
*/
YAHOO.GEIESMONADS.test.oTestMultipleFlatmap = new YAHOO.tool.TestCase({
	name : "TestMultipleFlatmap",
	testMultipleFlatmap : function() {
	
		var getString = Monad.state.lift(prompt);
		var putString = Monad.state.lift(alert);
		var start = Monad.state.monad(function(state){
            return {value:'whatever',state:state}
        });
        
/*		
		for {
			_ <- start
			x <- getString('what is your first name?')
			y <- getString('what is your second name?')
			z <- putString(('welcome, ' + x + ' ' + y))
		} yield z
		
		start
			.flatMap(_ -> getString('what is your first name?')
				.flatMap(x -> getString('what is your second name?')
					.flatMap(y -> putString('welcome, ' + x + ' ' + y)
						.map(IDENTITY))))
*/
		
		var askThenInputThenAskThenInputThenGreet = start
			.bind(function(_){ return getString('TEST askThenInputThenAskThenInputThenGreet\n\nwhat is your first name?')
				.bind(function(x){ return getString('what is your second name?')
					.bind(function(y){ return putString('welcome, ' + x + ' ' + y)
						//.map(function(xxx){return xxx})
						})})});
		
		// Uncomment to run demo
		//askThenInputThenAskThenInputThenGreet(0);
		
		/* This section handles a state object that gets enriched by the user by providing strings 'key_value'
		*/	
		var putKeyValuePairInState = function(msg) {
			return Monad.state.monad(function(state) {
				var keyValue = prompt(msg).split('_');
				state[keyValue[0]] = keyValue[1];
				return {value: keyValue[1],state: state};
			});
		}
		
		var getValuesFromState = function(msg) {
			return Monad.state.monad(function(state) {
				var undy = alert(msg + ' ' + state.x + ' ' + state.y);
				return {value: undy,state: state};
			});
		}
		
		var cccchain = start
			.bind(function(_){ return putKeyValuePairInState('TEST update state\n\nvariable x: what is your first name?\nNB - please write x_YOURFIRSTNAME'); })
			.bind(function(x){ return putKeyValuePairInState('ok, ' + x +'; we\' printing your first name here through the closure. But state is growing bigger. \nNow variable y: what is your family name?\nNB - please write y_YOURFAMILYNAME'); })
			.bind(function(_){ return getValuesFromState('The state is telling us you\'re '); });
		
		// Uncomment to run demo
		//cccchain({});
	}
});

/* This test shows the explicit manual labeling of a tree
   cfr. http://channel9.msdn.com/Shows/Going+Deep/Brian-Beckman-The-Zen-of-Expressing-State-The-State-Monad 
*/
YAHOO.GEIESMONADS.test.oTestBeckmanManualLabeling = new YAHOO.tool.TestCase({
	name : "TestBeckmanManualLabeling",
	testBeckmanManualLabeling : function() {
	
		var testTree = MyTree.branch(
			MyTree.leaf('a'),
			MyTree.branch(
				MyTree.branch(
					MyTree.leaf('b'),
					MyTree.leaf('c')),
				MyTree.leaf('d')
			)
		);
		
		Assert.areEqual('BRANCH', testTree.type());
		Assert.areEqual('LEAF', MyTree.left(testTree).type());
		Assert.areEqual('b', MyTree.left(MyTree.left(MyTree.right(testTree)))());
		Assert.areEqual('c', MyTree.right(MyTree.left(MyTree.right(testTree)))());
		
		var resultScp = MyTree.manualLabeler(testTree,0);
		var endState = resultScp[0];
		var resultLlt = resultScp[1]; // labeledTree, e.g. MyTree.leaf([0,'a'])
		
		Assert.areEqual(4, endState);
		Assert.areEqual('BRANCH', resultLlt.type());
		Assert.areEqual('LEAF', MyTree.left(resultLlt).type());
		Assert.areEqual(1, MyTree.left(MyTree.left(MyTree.right(resultLlt)))()[0]);
		Assert.areEqual('b', MyTree.left(MyTree.left(MyTree.right(resultLlt)))()[1]);
		Assert.areEqual(2, MyTree.right(MyTree.left(MyTree.right(resultLlt)))()[0]);
		Assert.areEqual('c', MyTree.right(MyTree.left(MyTree.right(resultLlt)))()[1]);
	}
});

/* This test shows the labeling of a tree by using a state monad
   cfr. http://channel9.msdn.com/Shows/Going+Deep/Brian-Beckman-The-Zen-of-Expressing-State-The-State-Monad 
*/
YAHOO.GEIESMONADS.test.oTestBeckmanMonadicLabeling = new YAHOO.tool.TestCase({
	name : "TestBeckmanMonadicLabeling",
	testBeckmanMonadicLabeling : function() {
	
		var testTree = MyTree.branch(
			MyTree.leaf('a'),
			MyTree.branch(
				MyTree.branch(
					MyTree.leaf('b'),
					MyTree.leaf('c')),
				MyTree.leaf('d')
			)
		); 
		
		/* the canonical function of treeMonad is
		 * state:int -> [state:int,value:tree([int,string])]
		 * NB - I am using [a,b] to indicate a JS pair. Haskell and Scala would write (a,b)
		 */
		var treeMonad = MyTree.monadicLabeler(testTree); 
		var resultScp = treeMonad(0);
		var resultLlt = resultScp.value; // labeledTree, e.g. MyTree.leaf([0,'a'])
		var resultState = resultScp.state;
		
		Assert.areEqual(4, resultState);
		Assert.areEqual('BRANCH', resultLlt.type());
		Assert.areEqual('LEAF', MyTree.left(resultLlt).type());
		Assert.areEqual(1, MyTree.left(MyTree.left(MyTree.right(resultLlt)))()[0]);
		Assert.areEqual('b', MyTree.left(MyTree.left(MyTree.right(resultLlt)))()[1]);
		Assert.areEqual(2, MyTree.right(MyTree.left(MyTree.right(resultLlt)))()[0]);
		Assert.areEqual('c', MyTree.right(MyTree.left(MyTree.right(resultLlt)))()[1]);
	}
});

/* This test shows the usage of the state monad to implement imperative programming
   cfr. http://brandon.si/code/the-state-monad-a-tutorial-for-the-confused/
*/
YAHOO.GEIESMONADS.test.oTestImperativeMonadProgrammingStyle = new YAHOO.tool.TestCase({
	name : "TestImperativeMonadProgrammingStyle",
	testImperativeMonadProgrammingStyle : function() {

		var testArray = [1,2,3,4,5];
		
		/* do
		 *   x <- pop
		 *   pop
		 *   push x
		 */
		var imp = ImperativeMonad.pop.bind(function(x) {
			return ImperativeMonad.pop.bind(function(_) {
				return ImperativeMonad.push(x);
			});
		});
		
		var result = imp(testArray); // {state:[1,2,3,5],value:undefined}
		
		Assert.areEqual(1, result.state[0]);
		Assert.areEqual(2, result.state[1]);
		Assert.areEqual(3, result.state[2]);
		Assert.areEqual(5, result.state[3]);
		Assert.areEqual(undefined, result.value);
	}
});

YAHOO.util.Event
		.onDOMReady(function() {
			YAHOO.GEIESMONADS.test.GEIESMONADS_TestSuite = new YAHOO.tool.TestSuite(
					"Second YUI Test Suite for GEIESMONADS");
			YAHOO.GEIESMONADS.test.GEIESMONADS_TestSuite
				.add(YAHOO.GEIESMONADS.test.oTestMultipleFlatmap);
			YAHOO.GEIESMONADS.test.GEIESMONADS_TestSuite
				.add(YAHOO.GEIESMONADS.test.oTestBeckmanManualLabeling);
			YAHOO.GEIESMONADS.test.GEIESMONADS_TestSuite
				.add(YAHOO.GEIESMONADS.test.oTestBeckmanMonadicLabeling);
			YAHOO.GEIESMONADS.test.GEIESMONADS_TestSuite
				.add(YAHOO.GEIESMONADS.test.oTestImperativeMonadProgrammingStyle);
			//var logger = new YAHOO.tool.TestLogger("testLogger_GEIESMONADS");
			//logger.hideCategory("info");

			YAHOO.tool.TestRunner
					.add(YAHOO.GEIESMONADS.test.GEIESMONADS_TestSuite);
			YAHOO.tool.TestRunner.run()
		});