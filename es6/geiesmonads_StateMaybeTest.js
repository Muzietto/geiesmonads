/*
	GEIESMONADS - JS monads
	Author: Marco Faustinelli (contacts@faustinelli.net)
	Web: http://faustinelli.net/
	     http://faustinelli.wordpress.com/
	Version: 2.0

	The MIT License - Copyright (c) 2013/2014 Geiesmonads Project
*/

//var expect = chai.expect; // TODO - liberate me!
YAHOO.namespace('GEIESMONADS.test');

var Assert = YAHOO.util.Assert;

/* Go back to maybe and test a better implementation
*/
YAHOO.GEIESMONADS.test.oTestSMMAO = new YAHOO.tool.TestCase({
	name : "TestChainableStateMaybeMonadAsObject",
	testChainableStateMaybeMonadAsObject : function() {

        // modifies value
		var more = function(value) {
			return 'more ' + value;
		};
        
        // modifies state - already a famb
        var sugar = function(state) {
            return 
        }

		// 1) custom built lifter
		var famb = function(fab){
			return function(a) {
				return Monad.stateMaybe.unit(fab(a));
			}
		};

		var mMore = famb(more);

		var coffee = Monad.stateMaybe.unit('coffee');
		Assert.areEqual('coffee', coffee('OK').value());
		Assert.areEqual('OK', coffee('OK').state);

		var moreCoffee = coffee.bind(mMore);

		Assert.areEqual('more coffee',moreCoffee(0).value());
		Assert.areEqual('more coffee',moreCoffee.flatten());
		Assert.areEqual('coffee', coffee('OK').value());
		Assert.areEqual('OK', coffee('OK').state);

		// 2) using liftM
		var mMore2 = Monad.stateMaybe.liftM(more);

		var moreCoffee2 = coffee.bind(mMore2);

		Assert.areEqual('more coffee',moreCoffee2());

		// 3) chaining a mapper
		var moreCoffee3 = coffee.map(more).map(more);

		Assert.areEqual('more more coffee',moreCoffee3());

		// none's in action
		var none = Monad.maybe.unit(null);		
		Assert.isUndefined(none());

		var noneChain = none.bind(famb);

		Assert.isUndefined(noneChain());
		Assert.isUndefined(noneChain.flatten());
				
		// alert fires once
		//var coffeeAlert = coffee.map(alert);
		
		// need myAlert to pass value down the chain
		var myAlert = function(value) {
			alert(value);
			return value;
		}
		
		// alerts fire twice with different messages
		// var compositeAlert = coffee.map(myAlert).bind(mMore).map(myAlert);
		// Assert.areEqual('more coffee',compositeAlert());
		
		var noAlert = none.map(alert);
		Assert.isUndefined(noAlert());
	}
});

/* This test shows the labeling of a tree by using a statemaybe monad
*/
YAHOO.GEIESMONADS.test.oTestStateMaybeMonadicLabelingOK = new YAHOO.tool.TestCase({
	name : "TestStateMaybeMonadicLabelingOK",
	testStateMaybeMonadicLabelingOK : function() {
	
		var simpleTree = MyTree.leaf('a');
		
		var simpleTreeMonad = MyTree.monadicMaybeLabeler(simpleTree); 
		var simpleResultScp = simpleTreeMonad(0);
		var simpleResultLlt = simpleResultScp.value;
		var simpleResultState = simpleResultScp.state;
		
		Assert.areEqual(1, simpleResultState);
		Assert.areEqual('LEAF', simpleResultLlt()().type());
		Assert.areEqual('a', simpleResultLlt()()()[1]);
		
		var simpleTree2 = MyTree.branch(MyTree.leaf('a'),MyTree.leaf('b'));
		
		var simpleTreeMonad2 = MyTree.monadicMaybeLabeler(simpleTree2); 
		var simpleResultScp2 = simpleTreeMonad2(0);
		var simpleResultLlt2 = simpleResultScp2.value;
		var simpleResultState2 = simpleResultScp2.state;
		
		Assert.areEqual(2, simpleResultState2);
		Assert.areEqual('BRANCH', simpleResultLlt2().type());
		Assert.areEqual('LEAF', MyTree.left(simpleResultLlt2())()().type());
		
		var testTree = MyTree.branch(
			MyTree.leaf('a'),
			MyTree.branch(
				MyTree.branch(
					MyTree.leaf('b'),
					MyTree.leaf('c')),
				MyTree.leaf('d')
			)
		); 
		
		var treeMonad = MyTree.monadicMaybeLabeler(simpleTree); 
		var resultScp = treeMonad(0);
		var resultLlt = resultScp.value;
		var resultState = resultScp.state;
		
		Assert.areEqual(4, resultState);
		Assert.areEqual('BRANCH', resultLlt().type());
		Assert.areEqual('LEAF', MyTree.left(resultLlt())()().type());
		
		// here start the errors
		Assert.areEqual(1, MyTree.left(MyTree.left(MyTree.right(resultLlt)))()()[0]);
		Assert.areEqual('b', MyTree.left(MyTree.left(MyTree.right(resultLlt)))()()[1]);
		Assert.areEqual(2, MyTree.right(MyTree.left(MyTree.right(resultLlt)))()()[0]);
		Assert.areEqual('c', MyTree.right(MyTree.left(MyTree.right(resultLlt)))()()[1]);
	}
});

YAHOO.util.Event
		.onDOMReady(function() {
			YAHOO.GEIESMONADS.test.GEIESMONADS_TestSuite = new YAHOO.tool.TestSuite(
					"Second YUI Test Suite for GEIESMONADS");
			YAHOO.GEIESMONADS.test.GEIESMONADS_TestSuite
				.add(YAHOO.GEIESMONADS.test.oTestSMMAO);
			YAHOO.GEIESMONADS.test.GEIESMONADS_TestSuite
				.add(YAHOO.GEIESMONADS.test.oTestStateMaybeMonadicLabelingOK);
				
			var logger = new YAHOO.tool.TestLogger("testLogger_GEIESMONADS");
			logger.hideCategory("info");

			YAHOO.tool.TestRunner
					.add(YAHOO.GEIESMONADS.test.GEIESMONADS_TestSuite);
			YAHOO.tool.TestRunner.run()
		});