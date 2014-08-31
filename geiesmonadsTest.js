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

YAHOO.GEIESMONADS.test.oTestMMAO = new YAHOO.tool.TestCase({
	name : "TestMaybeMonadAsObject",
	testMaybeMonadAsObject : function() {
    
        var somme = Monad.maybe.unit('some');
        Assert.isTrue(somme.is_some());
        Assert.isFalse(somme.is_none());
	
        var nonne = Monad.maybe.unit(undefined);
        Assert.isTrue(nonne.is_none());
        Assert.isFalse(nonne.is_some());
	
        nonne = Monad.maybe.unit(null);
        Assert.isTrue(nonne.is_none());
        Assert.isFalse(nonne.is_some());
	
        nonne = Monad.maybe.unit(NaN);
        Assert.isTrue(nonne.is_none());
        Assert.isFalse(nonne.is_some());
	
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
	}
});

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
		
		// getString / putString are famb's. Got it?
		// full-fledged StateMonad versions
		/*
		var putString = function(value) {
			return Monad.state.unit(alert(value));
		};		
		var getString = function(value) {
			return Monad.state.unit(prompt((value)?value:'?'));
		};
		*/
		
		// mind-blowing lifts --> alert and prompt are fab's!!!
		// alert :String -> undefined; prompt :String -> String
		var putString = Monad.state.lift(alert);
		var getString = Monad.state.lift(prompt);

		// null state aka start
		var nullState = function(){
			return Monad.state.unit(function(x){return x});
		};
		
		var askThenInputThenGreet = nullState().bind(
			function(x){ return putString('what is your name?')}).bind(
			function(x){ return getString(x);}).bind(
			function(x){ return putString('Ciao ' + x);}
			);

		// uncomment to run
		// askThenInputThenGreet(0);
		
		var promptThenGreet = nullState().bind(
			function(x){ return getString('what is your name?')}).bind(
			function(x){ return putString('welcome ' + x);}
		);
		
		// uncomment to run
		// promptThenGreet(0);
		
		var promptThenCheckThenGreet = nullState()
			.bind(function(x){ return getString('what is your name? NB - pippo is not welcome');})
			// a naked filter throws real runtime exceptions
			.filter(function(x){return (x!='pippo');},'not welcome')
			.bind(function(x){ return putString('welcome ' + x);}
		);
		
		try{
			// uncomment to run
			//promptThenCheckThenGreet(0);
		} catch (e) {
			Assert.areEqual('not welcome-pippo',e.message);
		}
		
		// this is an errorHandler, an :exception -> state monad
		var kickAway = function(exc){
			return putString('go away-' + exc.message);
		}

		var promptThenCheckThenGreetOrKick = nullState()
		.bind(function(x){return getString('what is your name? \nNB - Jeremy is not welcome');})
		.filter(function(x){return (x!='Jeremy')},'not welcome')
		.bind(function(x){return putString('welcome '+x)})
		.onError(kickAway);
		
		// uncomment to run
		// promptThenCheckThenGreetOrKick(0);
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

YAHOO.GEIESMONADS.test.oTestMultipleFlatmap = new YAHOO.tool.TestCase({
	name : "TestMultipleFlatmap",
	testMultipleFlatmap : function() {
	
		var getString = Monad.state.lift(prompt);
		var putString = Monad.state.lift(alert);
		var nullState = function(){
			return Monad.state.unit(function(x){return x});
		};
		
/*		
		for {
			a <- nullState()
			x <- getString('what is your first name?')
			y <- getString('what is your second name?')
			z <- putString(('welcome, ' + x + ' ' + y))
		} yield z
		
		nullState
			.flatMap(a -> getString('what is your first name?')
				.flatMap(x -> getString('what is your second name?')
					.flatMap(y -> putString('welcome, ' + x + ' ' + y)
						.map(IDENTITY))))
*/
		
		var askThenInputThenAskThenInputThenGreet = nullState()
			.bind(function(a){ return getString('what is your first name?')
				.bind(function(x){ return getString('what is your second name?')
					.bind(function(y){ return putString('welcome, ' + x + ' ' + y)
						//.map(function(xxx){return xxx})
						})})});
		
		// askThenInputThenAskThenInputThenGreet(0);
	
		var getStringInState = function(msg) {
			return function(state) {
				var keyValue = prompt(msg).split('_');
				state[keyValue[0]] = keyValue[1];
				return {value: keyValue[1],state: state};
			};
		};
		
		var putStringFromState = function(msg) {
			return function(state) {
				var undy = alert(msg + ' ' + state.x + ' ' + state.y);
				return {value: undy,state: state};
			};
		};
		
		var cccchain = nullState()
			.bind(function(_){ return getStringInState('variable x: what is your first name?\nNB - please write x_YOURFIRSTNAME'); })
			.bind(function(x){ return getStringInState('ok, ' + x +'; now variable y: what is your family name?\n NB - please write y_YOURFAMILYNAME'); })
			.bind(function(y){ return putStringFromState('welcome, '); });
			
		// cccchain({});
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

			YAHOO.GEIESMONADS.test.GEIESMONADS_TestSuite
				.add(YAHOO.GEIESMONADS.test.oTestMultipleFlatmap);

			var logger = new YAHOO.tool.TestLogger("testLogger_GEIESMONADS");
			logger.hideCategory("info");

			YAHOO.tool.TestRunner
					.add(YAHOO.GEIESMONADS.test.GEIESMONADS_TestSuite);
					
			YAHOO.tool.TestRunner.run()
		});
