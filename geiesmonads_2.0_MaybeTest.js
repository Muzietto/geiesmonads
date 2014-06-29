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

/* Go back to maybe and test a better implementation
*/
YAHOO.GEIESMONADS.test.oTestMMAO = new YAHOO.tool.TestCase({
	name : "TestChainableMaybeMonadAsObject",
	testChainableMaybeMonadAsObject : function() {

		var more = function(value) {
			return 'more ' + value;
		};

		// 1) custom built lifter
		var famb = function(fab){
			return function(a) {
				return Monad.maybe.unit(fab(a));
			}
		};

		var mMore = famb(more);

		var coffee = Monad.maybe.unit('coffee');
		Assert.areEqual('coffee', coffee());

		var moreCoffee = coffee.bind(mMore);

		Assert.areEqual('more coffee',moreCoffee());
		Assert.areEqual('more coffee',moreCoffee.flatten());

		// 2) using liftM
		var mMore2 = Monad.maybe.liftM(more);

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
		var compositeAlert = coffee.map(myAlert).bind(mMore).map(myAlert);
		Assert.areEqual('more coffee',compositeAlert());
		
		var noAlert = none.map(alert);
		Assert.isUndefined(noAlert());
	}
});

YAHOO.util.Event
		.onDOMReady(function() {
			YAHOO.GEIESMONADS.test.GEIESMONADS_TestSuite = new YAHOO.tool.TestSuite(
					"Second YUI Test Suite for GEIESMONADS");
			YAHOO.GEIESMONADS.test.GEIESMONADS_TestSuite
				.add(YAHOO.GEIESMONADS.test.oTestMMAO);
			var logger = new YAHOO.tool.TestLogger("testLogger_GEIESMONADS");
			logger.hideCategory("info");

			YAHOO.tool.TestRunner
					.add(YAHOO.GEIESMONADS.test.GEIESMONADS_TestSuite);
			YAHOO.tool.TestRunner.run()
		});