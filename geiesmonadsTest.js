/*
	GEIESMONADS - JS monads
	Author: Marco Faustinelli (contacts@faustinelli.net)
	Web: http://faustinelli.net/
	     http://faustinelli.wordpress.com/
	Version: 1.0

	The MIT License - Copyright (c) 2013 Geiesmonads Project
*/

YAHOO.namespace('GEIESMONADS.test');

var Assert = YAHOO.util.Assert;

YAHOO.GEIESMONADS.test.oTestSMAIOM = new YAHOO.tool.TestCase({
	name : "TestStateMonadAsIOMonad",
	testStateMonadAsIOMonad : function() {
	
		// famb versions
		var putString_ref = function(value) {
			return function(state) {
				return {value: alert(value),state: state};
			};
		};
		var getString_ref = function(value) {
			return function(state) {
				return {value: prompt('?'),state: state};
			};
		};
		
		// full-fledged StateMonad versions
		var putString = function(value) {
			return Monad.state.unit(alert(value));
		};
		var getString = function() {
			return Monad.state.unit(prompt('?'));
		};
		
		var askThenInputThenGreet = putString('what is your name?').bind(
			function(x){ return getString(x);}).bind(
			function(x){ return putString('Ciao ' + x);}
			);

		askThenInputThenGreet(0);	
	}
});

YAHOO.GEIESMONADS.test.oTestMMAO = new YAHOO.tool.TestCase({
	name : "TestMaybeMonadAsObject",
	testMaybeMonadAsObject : function() {
	
		var coffee = Monad.maybe.unit('coffee');
		Assert.areEqual('coffee', coffee());

		var more = function(value){
			return 'more ' + value;
		};
		
		var mMore = Monad.maybe.lift(more);
		
		// Maybe.unit(new Person("marco", 123)).bind(new LookupPersonId())
		//	.bind(new LookupAccount()).bind(new LookupBalance()).bind(new CheckOverdraft());
		var moreCoffee = coffee.bind(mMore);		
		Assert.areEqual('more coffee',moreCoffee());
		
		// HERE'S THE JAVASCRIPT CHAINING!!!
		var moreMoreCoffee = coffee.bind(mMore).bind(mMore).bind(mMore).bind(mMore).bind(mMore);
		Assert.areEqual('more more more more more coffee',moreMoreCoffee());
		
		// ...and here's the sugar
		var moreSweetCoffee = coffee(mMore)(mMore)(mMore)(mMore)(mMore)(mMore)(mMore);
		Assert.areEqual('more more more more more more more coffee',moreSweetCoffee());
	}
});

YAHOO.GEIESMONADS.test.oTestSMAO = new YAHOO.tool.TestCase({
	name : "TestStateMonadAsObject",
	testStateMonadAsObject : function() {
	
		var coffee = Monad.state.unit('coffee');
		Assert.areEqual('coffee', coffee(0).value);
		Assert.areEqual(0, coffee(0).state);

		// already a famb - no need for lifting
		var more = function(value){
			return function(state){
				return {value:'more '+ value,state:state};
			};
		}

		// already a famb - no need for lifting
		var addSugar = function(value){
			return function(state){
				return {value:value,state:state+1};
			};
		}

		// Maybe.unit(new Person("marco", 123)).bind(new LookupPersonId())
		//	.bind(new LookupAccount()).bind(new LookupBalance()).bind(new CheckOverdraft());
		var moreCoffee = coffee.bind(more);
		Assert.areEqual('more coffee', moreCoffee(0).value);
		Assert.areEqual(0, moreCoffee(0).state);
		
		var moreSugar = coffee.bind(addSugar);
		Assert.areEqual('coffee', moreSugar(0).value);
		Assert.areEqual(1, moreSugar(0).state);
		
		var moreSweetCoffee = coffee.bind(more).bind(addSugar);
		Assert.areEqual('more coffee', moreSweetCoffee(0).value);
		Assert.areEqual(1, moreSweetCoffee(0).state);
		
		var sweetMoreCoffee = coffee.bind(addSugar).bind(more);
		Assert.areEqual('more coffee', sweetMoreCoffee(0).value);
		Assert.areEqual(1, sweetMoreCoffee(0).state);
		
		var moreSweetMoreSweetCoffee1 = coffee.bind(more).bind(addSugar).bind(more).bind(addSugar);
		Assert.areEqual('more more coffee',moreSweetMoreSweetCoffee1(0).value);
		Assert.areEqual(2, moreSweetMoreSweetCoffee1(0).state);
	}
});

YAHOO.util.Event
		.onDOMReady(function() {

			YAHOO.GEIESMONADS.test.GEIESMONADS_TestSuite = new YAHOO.tool.TestSuite(
					"YUI Test Suite for GEIESMONADS");

			YAHOO.GEIESMONADS.test.GEIESMONADS_TestSuite
				.add(YAHOO.GEIESMONADS.test.oTestSMAIOM);

			YAHOO.GEIESMONADS.test.GEIESMONADS_TestSuite
				.add(YAHOO.GEIESMONADS.test.oTestMMAO);

			YAHOO.GEIESMONADS.test.GEIESMONADS_TestSuite
				.add(YAHOO.GEIESMONADS.test.oTestSMAO);

			var logger = new YAHOO.tool.TestLogger("testLogger_GEIESMONADS");
			logger.hideCategory("info");

			YAHOO.tool.TestRunner
					.add(YAHOO.GEIESMONADS.test.GEIESMONADS_TestSuite);
					
			YAHOO.tool.TestRunner.run()
		});
