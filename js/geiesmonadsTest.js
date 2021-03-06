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

YAHOO.GEIESMONADS.test.oTestSomeNone = new YAHOO.tool.TestCase({
	name : "TestMaybeMonadSomeNone",
	testMaybeMonadSomeNone : function() {
    
        var somme = Monad.maybe.unit('');
        Assert.isTrue(somme.is_some());
        Assert.isFalse(somme.is_none());
	
        somme = Monad.maybe.unit('some');
        Assert.isTrue(somme.is_some());
        Assert.isFalse(somme.is_none());
	
        somme = Monad.maybe.unit({});
        Assert.isTrue(somme.is_some());
        Assert.isFalse(somme.is_none());
	
        somme = Monad.maybe.unit({key:"value"});
        Assert.isTrue(somme.is_some());
        Assert.isFalse(somme.is_none());
	
        somme = Monad.maybe.unit([]);
        Assert.isTrue(somme.is_some());
        Assert.isFalse(somme.is_none());
	
        somme = Monad.maybe.unit([123,"string"]);
        Assert.isTrue(somme.is_some());
        Assert.isFalse(somme.is_none());
	
        somme = Monad.maybe.unit(0);
        Assert.isTrue(somme.is_some());
        Assert.isFalse(somme.is_none());
	
        somme = Monad.maybe.unit(1);
        Assert.isTrue(somme.is_some());
        Assert.isFalse(somme.is_none());
	
        somme = Monad.maybe.unit(true);
        Assert.isTrue(somme.is_some());
        Assert.isFalse(somme.is_none());
	
        somme = Monad.maybe.unit(false);
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

		var start = Monad.state.monad(function(state){
            return {value:null,state:state};
        });
		
		var promptThenGreet = start
            .bind(function(_){ return getString('promptThenGreet: what is your name?')})
                .bind(function(x){ return putString('welcome ' + x);});
		
		// uncomment to run
		// promptThenGreet(0);
		
        var promptThenCheckThenGreet = start
            .bind(function(_){ return getString('promptThenCheckThenGreet: what is your name? \NB - pippo is not welcome');})
                // a naked filter throws real runtime exceptions
                .filter(function(x){return (x!='pippo');},'not welcome')
                    .bind(function(x){ return putString('welcome ' + x);});
		
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

		var promptThenCheckThenGreetOrKick = start
		    .bind(function(_){return getString('promptThenCheckThenGreetOrKick: what is your name? \nNB - Jeremy is not welcome');})
		        .filter(function(y){return (y!='Jeremy')},'not welcome')
		            .bind(function(z){return putString('welcome '+z)})
		                .onError(kickAway);
		
		// uncomment to run
		//promptThenCheckThenGreetOrKick(0);
	}
});

YAHOO.GEIESMONADS.test.oTestSMWB = new YAHOO.tool.TestCase({
	name : "TestStateMonadWithBranching",
	testStateMonadWithBranching : function() {

		var putString = Monad.state.lift(alert);
		var getString = Monad.state.lift(prompt);
		var start = Monad.state.monad(function(state){return {value:null,state:state};});

        var jeremyPredicate = function(name){ return name !== 'Jeremy' };
        var trueMonad = start.bind(function(_){ return putString('welcome') });
        var falseMonad = start.bind(function(_){ return putString('go away') });
        
        var branching = start
            .bind(function(_){ return getString('branching: what is your name?'); })
            .iff(jeremyPredicate,trueMonad,falseMonad)
            .bind(function(x){ return putString('I told you so... ' + x); });
        
        // uncomment to run demo
        //branching(0);
	}
});

YAHOO.GEIESMONADS.test.oTestSMMF = new YAHOO.tool.TestCase({
	name : "TestStateMonadMapFlatten",
	testStateMonadMapFlatten : function() {
    
        var monad = Monad.state.monad
        var getState = monad(function(state){return {value:state,state:state}});
        var setState = function(x){return monad(function(state){return {value:undefined,state:x}})};
    
        // map
        var mapped = getState.map(function(x){return parseInt(x);});
        
        Assert.areEqual(1,mapped('1').value);
        Assert.areEqual('1',mapped('1').state);

        // setState
        var manipolated = mapped.bind(function(_){ return setState('new state') });
        
        Assert.areEqual(undefined,manipolated('whatever').value);
        Assert.areEqual('new state',manipolated('whatever else').state);
        
        // flatten
        var monadMonad = monad(mapped);
        
        Assert.areEqual(1,monadMonad.flatten()('1').value);
        Assert.areEqual('1',monadMonad.flatten()('1').state);
	}
});

YAHOO.util.Event
		.onDOMReady(function() {

			YAHOO.GEIESMONADS.test.GEIESMONADS_TestSuite = new YAHOO.tool.TestSuite(
					"YUI Test Suite for GEIESMONADS");

			YAHOO.GEIESMONADS.test.GEIESMONADS_TestSuite
				.add(YAHOO.GEIESMONADS.test.oTestSomeNone);

			YAHOO.GEIESMONADS.test.GEIESMONADS_TestSuite
				.add(YAHOO.GEIESMONADS.test.oTestMMAO);

			YAHOO.GEIESMONADS.test.GEIESMONADS_TestSuite
				.add(YAHOO.GEIESMONADS.test.oTestSMAO);

			YAHOO.GEIESMONADS.test.GEIESMONADS_TestSuite
				.add(YAHOO.GEIESMONADS.test.oTestSMMF);
                
			YAHOO.GEIESMONADS.test.GEIESMONADS_TestSuite
				.add(YAHOO.GEIESMONADS.test.oTestSMAIOM);

			YAHOO.GEIESMONADS.test.GEIESMONADS_TestSuite
				.add(YAHOO.GEIESMONADS.test.oTestSMWB);

			var logger = new YAHOO.tool.TestLogger("testLogger_GEIESMONADS");
			logger.hideCategory("info");

			YAHOO.tool.TestRunner
					.add(YAHOO.GEIESMONADS.test.GEIESMONADS_TestSuite);
					
			YAHOO.tool.TestRunner.run()
		});
