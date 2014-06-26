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