YAHOO.namespace('GEIESMONADS.test');

var Assert = YAHOO.util.Assert;

YAHOO.GEIESMONADS.test.oTestMMAO = new YAHOO.tool.TestCase({
	name : "TestMaybeAsObject",
	testMaybeMonadAsObject : function() {
	
		// builds a famb from a fab
		var famb = function(fab) { 
			return function(x) {
				return Monad.maybe.unit(fab(x));};};
		
		var fabStringToIntAndReverse = function(value){
			return (typeof value === 'string') ? value.length : 'str'+value;
		};
		
		var more = function(value){
			return 'more ' + value;
		};
		
		var mMore = famb(more);
		
		// Maybe.unit(new Person(�marco�, 123)).bind(new LookupPersonId())
		//	.bind(new LookupAccount()).bind(new LookupBalance()).bind(new CheckOverdraft());
		
		//var maybeString = Monad.maybe.unit(3).bind(maybeStringToIntAndReverse);
		
		var coffee = Monad.maybe.createZZZ('coffee');
		Assert.areEqual('coffee', coffee());
		
		var moreCoffee = coffee.bind(mMore);		
		Assert.areEqual('more coffee',moreCoffee());
		
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

			var logger = new YAHOO.tool.TestLogger("testLogger_GEIESMONADS");
			logger.hideCategory("info");

			YAHOO.tool.TestRunner
					.add(YAHOO.GEIESMONADS.test.GEIESMONADS_TestSuite);
					
			YAHOO.tool.TestRunner.run()
		});
