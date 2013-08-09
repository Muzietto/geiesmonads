YAHOO.namespace('GEIESMONADS.test');

var Assert = YAHOO.util.Assert;

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

		var coffee2 = Monad.state.unit2('coffee',function(x){return 12+x});
		Assert.areEqual('coffee', coffee2(0).value);
		//Assert.areEqual(12, coffee2(0).state);

		// already a famb - no need for lifting
		var more = function(value){
			return function(state){
				return {value:'more '+ value,state:state+100};
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
		Assert.areEqual('more coffee', moreCoffee(50).value);
		Assert.areEqual(0, moreCoffee(50).state);
		
		var moreSugar = coffee.bind(addSugar);
		Assert.areEqual('coffee', moreSugar(0).value);
		Assert.areEqual(1, moreSugar(0).state);
		alert('123123123')
		
		var moreMoreCoffee = coffee.bind(mMore).bind(mMore).bind(mMore).bind(mMore).bind(mMore);
		Assert.areEqual('more more more more more coffee',moreMoreCoffee());		
	}
});

YAHOO.util.Event
		.onDOMReady(function() {

			YAHOO.GEIESMONADS.test.GEIESMONADS_TestSuite = new YAHOO.tool.TestSuite(
					"YUI Test Suite for GEIESMONADS");

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
