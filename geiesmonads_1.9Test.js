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
		
		askThenInputThenAskThenInputThenGreet(0);
	
		var getStringInState = function(msg) {
			return function(state) {
				var keyValue = prompt(msg).split('_');
				state[keyValue[0]] = keyValue[1];
				return {value: keyValue[1],state: state}
			}
		}
		
		var putStringFromState = function(msg) {
			return function(state) {
				var undy = alert(msg + ' ' + state.x + ' ' + state.y);
				return {value: undy,state: state}
			}
		}
		
		var cccchain = nullState()
			.bind(function(x){ return getStringInState('variable x: what is your first name?\nNB - please write x_YOURFIRSTNAME'); })
			.bind(function(x){ return getStringInState('variable y: what is your family name?\n NB - please write y_YOURFAMILYNAME'); })
			.bind(function(x){ return putStringFromState('welcome, '); });
			
		//cccchain({});
	}
});

YAHOO.util.Event
		.onDOMReady(function() {

			YAHOO.GEIESMONADS.test.GEIESMONADS_TestSuite = new YAHOO.tool.TestSuite(
					"Second YUI Test Suite for GEIESMONADS");

			YAHOO.GEIESMONADS.test.GEIESMONADS_TestSuite
				.add(YAHOO.GEIESMONADS.test.oTestMultipleFlatmap);

			var logger = new YAHOO.tool.TestLogger("testLogger_GEIESMONADS");
			logger.hideCategory("info");

			YAHOO.tool.TestRunner
					.add(YAHOO.GEIESMONADS.test.GEIESMONADS_TestSuite);
					
			YAHOO.tool.TestRunner.run()
		});
