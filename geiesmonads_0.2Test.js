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
		
		// Maybe.unit(new Person(“marco”, 123)).bind(new LookupPersonId())
		//	.bind(new LookupAccount()).bind(new LookupBalance()).bind(new CheckOverdraft());
		
		//var maybeString = Monad.maybe.unit(3).bind(maybeStringToIntAndReverse);
		
		var coffee = Monad.maybe.create('coffee');
		Assert.areEqual('coffee', coffee());
		//var flattened = coffee.flatten('qwe');
		//Assert.areEqual('coffee', coffee());
		
		var moreCoffee = coffee.bind(mMore);		
		Assert.areEqual('more coffee',moreCoffee());
		
		var moreMoreCoffee = coffee.bind(mMore).bind(mMore).bind(mMore).bind(mMore).bind(mMore);
		Assert.areEqual('more more more more more coffee',moreMoreCoffee());
		
	}
});

YAHOO.GEIESMONADS.test.oTestIdentityMonad = new YAHOO.tool.TestCase({
	name : "TestIdentityMonad",
	testMonadicLawsForIdentityMonad : function() {
	
		var monad = myIdentityMonad;

		var a = 'aaa';
		var b = 3;
		var ma = monad.unit(a);
		var mb = monad.unit(b);
		
		var fab = function(value){
			return (typeof value === 'string')?value.length:'zz'+value;
		};

		//var famb = monad.unit(fab); // cazzata! unit opera su valori, non su funzioni!!!!!	
		var famb = function(x){return monad.unit(fab(x));};
		var fbma = function(value){
			return monad.unit((typeof value === 'string')?value.length:'zz'+value);
		}
		
		Assert.areEqual(3,fab(a));
		Assert.areEqual('zz3',fab(3));
		
		var unitFab = monad.unit(fab); // cazzata! unit opera su monadi, non su funzioni!!!!!		
		var unitFabA = unitFab(a);
		// Assert.areEqual('', monad.flatten(unitFabA));
		
		// zeroeth law --> m map f = m bind unit(f(x))
		var zeroethLawLeft = monad.map(ma,fab);
		var zeroethLawRight = monad.bind(ma,function(x){return monad.unit(fab(x))});
		Assert.areEqual(monad.flatten(zeroethLawLeft),monad.flatten(zeroethLawRight));
		
		// first law --> m bind unit = m
		var firstLawLeft = monad.bind(ma,monad.unit);
		Assert.areEqual(monad.flatten(firstLawLeft),monad.flatten(ma));
		
		// second law --> unit(x) bind famb = famb(x)
		var secondLawLeft = monad.bind(monad.unit(a),famb);
		Assert.areEqual(monad.flatten(secondLawLeft),monad.flatten(famb(a)));
		
		// third law --> (m bind g) bind f = m bind (g(x) bind f)
		var mBindFbma = monad.bind(mb,fbma);
		var fbmaXBindFamb = monad.bind(fbma(mb),famb)

		var m = mb;
		var g = fbma;
		var f = famb
		var thirdLawLeft = monad.bind(monad.bind(m,g),f);
		var thirdLawRight = monad.bind(m,function(x){return monad.bind(g(x),f)})
		Assert.areEqual(monad.flatten(thirdLawLeft),monad.flatten(thirdLawRight));
		
		
	}
});

YAHOO.GEIESMONADS.test.oTestMaybeMonad = new YAHOO.tool.TestCase({
	name : "TestMaybeMonad",
	testMonadicLawsForMaybeMonad : function() {
	
		var monad = myMaybeMonad;

		var a = 'aaa';
		var b = null;
		var ma = monad.unit(a);
		var mb = monad.unit(b);
		
		var fab = function(value){
			return (typeof value === 'string')?value.length:'zz'+value;
		};
		
		//var famb = monad.unit(fab); // cazzata! unit opera su valori, non su funzioni!!!!!		
		var famb = function(x){return monad.unit(fab(x));};
		var fbma = function(value){
			return monad.unit((typeof value === 'string')?value.length:'zz'+value);
		}
		
		Assert.areEqual(3,fab(a));
		Assert.areEqual('zz3',fab(3));
		
		var unitFab = monad.unit(fab); // cazzata! unit opera su valori, non su funzioni!!!!!		
		var unitFabA = unitFab(a);
		// Assert.areEqual('', monad.flatten(unitFabA));
		
		// zeroeth law --> m map f = m bind unit(f(x))
		var zeroethLawLeft = monad.map(ma,fab);
		var zeroethLawRight = monad.bind(ma,function(x){return monad.unit(fab(x))});
		Assert.areEqual(monad.flatten(zeroethLawLeft),monad.flatten(zeroethLawRight));
		
		// first law --> m bind unit = m
		var firstLawLeft = monad.bind(ma,monad.unit);
		Assert.areEqual(monad.flatten(firstLawLeft),monad.flatten(ma));
		
		// second law --> unit(x) bind famb = famb(x)
		var secondLawLeft = monad.bind(monad.unit(a),famb);
		Assert.areEqual(monad.flatten(secondLawLeft),monad.flatten(famb(a)));
		
		// third law --> (m bind g) bind f = m bind (g(x) bind f)
		var mBindFbma = monad.bind(mb,fbma);
		var fbmaXBindFamb = monad.bind(fbma(mb),famb)

		var m = mb;
		var g = fbma;
		var f = famb
		var thirdLawLeft = monad.bind(monad.bind(m,g),f);
		var thirdLawRight = monad.bind(m,function(x){return monad.bind(g(x),f)})
		Assert.areEqual(monad.flatten(thirdLawLeft),monad.flatten(thirdLawRight));
		
		
	}
});

YAHOO.GEIESMONADS.test.oTestStateMonadLooseMethods = new YAHOO.tool.TestCase({
	name : "TestStateMonadLooseMethods",
	testStateMonadLooseMethods : function() {
	
		var monad = myStateMonad;
		
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

		var ma = monad.unit('coffee');

		var mb = monad.bind(ma, more);
		Assert.areEqual('more coffee', mb(0).value);
		
		var mc = monad.bind(mb, addSugar);
		Assert.areEqual(1, mc(0).state);
	}
});

YAHOO.GEIESMONADS.test.oTestStateMonad = new YAHOO.tool.TestCase({
	name : "TestStateMonad",
	testMonadicLawsForStateMonad : function() {
	
		var monad = myStateMonad;
		
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

		var ma = monad.unit('coffee');

		var mb = monad.bind(ma, more);
		
		// zeroeth law --> m map f = m bind unit(f(x))
		// SOSPESO IN ATTESA DEL MAP PER STATE MONAD
		//var zeroethLawLeft = monad.map(ma,fab);
		//var zeroethLawRight = monad.bind(ma,function(x){return monad.unit(fab(x))});
		//Assert.areEqual(monad.flatten(zeroethLawLeft),monad.flatten(zeroethLawRight));

		// first law --> m bind unit = m
		var firstLawLeft = monad.bind(ma,monad.unit);
		var firstLawRight = ma;
		Assert.areEqual(firstLawLeft(0).value,firstLawRight(0).value);
		Assert.areEqual(firstLawLeft(0).state,firstLawRight(0).state);

		var a = 'coffee';
		var famb = more;
		// second law --> unit(x) bind famb = famb(x)
		var secondLawLeft = monad.bind(monad.unit(a),famb);
		var secondLawRight = famb(a);
		Assert.areEqual(secondLawLeft(0).value,secondLawRight(0).value);
		Assert.areEqual(secondLawLeft(0).state,secondLawRight(0).state);

		var fbma = addSugar;
		// third law --> (m bind g) bind f = m bind (g(x) bind f)

		var m = mb;
		var g = fbma;
		var f = famb
		var thirdLawLeft = monad.bind(monad.bind(m,g),f);
		var thirdLawRight = monad.bind(m,function(x){return monad.bind(g(x),f)})
		Assert.areEqual(thirdLawLeft(0).value,thirdLawRight(0).value);
		Assert.areEqual(thirdLawLeft(0).state,thirdLawRight(0).state);
		
	}
});

YAHOO.GEIESMONADS.test.oTestYYY = new YAHOO.tool.TestCase({
	name : "TestYYY",
	testIdentityMonadAsModule : function() {
	
		var monad = myIdentityMonad;

		var ma = monad.unit('aaa');
		// a famb
		var more = function(a){
			return monad.unit('more '+a);
		};
		
		var mb = monad.bind(ma,more);
		Assert.areEqual('more aaa',monad.flatten(mb));
		
		
	}
});

YAHOO.GEIESMONADS.test.oTestXXX = new YAHOO.tool.TestCase({
	name : "TestXXX",
	testIdentityMonadAsLooseMethods : function() {
		var ma = identityUnit('aaa');
		// here is a famb!!!!
		var more = function (a){
			return identityUnit('more ' + a);
		}
		var mb = identityBind(ma, more);
		Assert.areEqual('more aaa', identityFlatten(mb));
		
		// chaining
		var mMore = function(ma){
			return identityBind(ma, more);
		};
		Assert.areEqual('more aaa', identityFlatten(mMore(ma)));
		
		var more0 = identityLift(more)(ma);
		Assert.areEqual('more aaa', identityFlatten(more0));
		
		var more_more1 = identityBind(identityBind(ma,more),more);
		var more_more2 = identityBind(identityLift(more)(ma),more);
		
		var more_more3 = identityLift(more)(identityLift(more)(ma));
		//var more_more4 = identityLift(more)(more)(ma);
		
		Assert.areEqual('more more aaa',identityFlatten(more_more1));		
		Assert.areEqual('more more aaa',identityFlatten(more_more2));
		Assert.areEqual('more more aaa',identityFlatten(more_more3));
		//Assert.areEqual('more more aaa',identityFlatten(more_more4));

	}
});

YAHOO.util.Event
		.onDOMReady(function() {

			YAHOO.GEIESMONADS.test.GEIESMONADS_TestSuite = new YAHOO.tool.TestSuite(
					"YUI Test Suite for GEIESMONADS");
			YAHOO.GEIESMONADS.test.GEIESMONADS_TestSuite
					.add(YAHOO.GEIESMONADS.test.oTestStateMonadLooseMethods);
			YAHOO.GEIESMONADS.test.GEIESMONADS_TestSuite
					.add(YAHOO.GEIESMONADS.test.oTestStateMonad);
			YAHOO.GEIESMONADS.test.GEIESMONADS_TestSuite
					.add(YAHOO.GEIESMONADS.test.oTestIdentityMonad);
			YAHOO.GEIESMONADS.test.GEIESMONADS_TestSuite
					.add(YAHOO.GEIESMONADS.test.oTestMaybeMonad);
			YAHOO.GEIESMONADS.test.GEIESMONADS_TestSuite
					.add(YAHOO.GEIESMONADS.test.oTestYYY);
			YAHOO.GEIESMONADS.test.GEIESMONADS_TestSuite
					.add(YAHOO.GEIESMONADS.test.oTestXXX);
			YAHOO.GEIESMONADS.test.GEIESMONADS_TestSuite
					.add(YAHOO.GEIESMONADS.test.oTestMMAO);

			var logger = new YAHOO.tool.TestLogger("testLogger_GEIESMONADS");
			logger.hideCategory("info");

			YAHOO.tool.TestRunner
					.add(YAHOO.GEIESMONADS.test.GEIESMONADS_TestSuite);
					
			YAHOO.tool.TestRunner.run()
		});
