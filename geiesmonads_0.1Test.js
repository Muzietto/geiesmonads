// http://igstan.ro/posts/2011-05-02-understanding-monads-with-javascript.html

YAHOO.namespace('GEIESMONADS.test');

var Assert = YAHOO.util.Assert;

YAHOO.GEIESMONADS.test.oTestXXX = new YAHOO.tool.TestCase({
	name : "TestXXX",
	testXXX : function() {
//		Assert.isTrue(isEmpty(EMPTY))

		Assert.areEqual(4, r0.state[0]);
		
		Assert.areEqual('v=undefined;s=[4]', pairDumper(r0));
		
		var www = bind(push(4,s0),function(p1){
			Assert.areEqual('v=undefined;s=[4]', pairDumper(p1));
			return bind(push(5,p1.state),function(p2){
				Assert.areEqual('v=undefined;s=[5,4]', pairDumper(p2));
				return bind(pop(p2.state),function(p3){
					Assert.areEqual('v=5;s=[4]', pairDumper(p3));
					return bind(pop(p3.state),function(p4){
						return pairDumper(p4);
					});
				});
			});
		});

		Assert.areEqual('v=4;s=[]', www);
		
		var www2 = bind(curry_push(5)(s0),function(p1){
			return bind(curry_push(5)(p1.state),function(p2){
				return bind(curry_pop()(p2.state),function(p3){
					return bind(curry_pop()(p3.state),function(p4){
						return pairDumper(p4);
					});
				});
			});
		});

		Assert.areEqual('v=5;s=[]', www2);
		
		var www3 = curried_bind(curry_push(5),function(p1){
			return pairDumper(p1)
		})(s0);
		
		Assert.areEqual('v=undefined;s=[5]', www3);
		
		var www4 = curried_bind(curry_push(5),function(p1){
			return curried_bind(curry_pop(),function(p2){
				return pairDumper(p2);
			})(p1.state);
		})(s0);
		
		Assert.areEqual('v=5;s=[]', www4);
		
		var computation = curried_bind2(curry_push(5),function(p1){  // function(s0)
			return curried_bind2(curry_push(4),function(p2){ // function(s1)
				return function(sss){
					return sss;
				};
			});
		});
		
		Assert.areEqual('[4,5]', stateDumper(computation(s0)));

		var computation2 = curried_bind2(curry_push(5),function(p1){  // function(s0)
			return curried_bind2(curry_push(4),function(p2){ // function(s1)
				return haskellianResult(p1.value+':'+p2.value);
			});
		});
		
		Assert.areEqual('v=undefined:undefined;s=[4,5]', pairDumper(computation2(s0)));

		var computation3 = curried_bind3(curry_push(5),function(v1){  // function(s0)
			return curried_bind3(curry_push(4),function(v2){ // function(s1)
				return haskellianResult(v1+':'+v2);
			});
		});
		
		Assert.areEqual('v=undefined:undefined;s=[4,5]', pairDumper(computation3(s0)));
		
	}
});



YAHOO.util.Event
		.onDOMReady(function() {

			YAHOO.GEIESMONADS.test.GEIESMONADS_TestSuite = new YAHOO.tool.TestSuite(
					"YUI Test Suite for GEIESMONADS");

			YAHOO.GEIESMONADS.test.GEIESMONADS_TestSuite
					.add(YAHOO.GEIESMONADS.test.oTestXXX);

			var logger = new YAHOO.tool.TestLogger("testLogger_GEIESMONADS");
			logger.hideCategory("info");

			YAHOO.tool.TestRunner
					.add(YAHOO.GEIESMONADS.test.GEIESMONADS_TestSuite);
					
			YAHOO.tool.TestRunner.run()
		});
