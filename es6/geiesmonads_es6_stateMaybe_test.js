/*
	GEIESMONADS - JS monads
	Author: Marco Faustinelli (contacts@faustinelli.net)
	Web: http://faustinelli.net/
	     http://faustinelli.wordpress.com/

	The MIT License - Copyright (c) 2013/2015 Geiesmonads Project
*/

/* Define a State monad that manages errors (in a sense like Maybe): 
   if an error/problem occurs during the "do" computation, 
   it is signalled and propagated by >>=. 
   step 1) The presence of a None indicates an error has occurred
   step 2) The error should propagate carrying a string which describes what occurred.
*/

var expect = chai.expect;
YAHOO.namespace('GEIESMONADS.test');

var Assert = YAHOO.util.Assert;

/* Go back to maybe and test a better implementation
 */

/* This test shows the labeling of a tree by using a statemaybe monad
 */
YAHOO.GEIESMONADS.test.oTestStateMaybeMonadicLabelingOK = new YAHOO.tool.TestCase({
	name : "TestStateMaybeMonadicLabelingOK",
	testStateMaybeMonadicLabelingOK : function() {

		var simpleTree = MyTree.leaf('a');

		var simpleTreeMonad = MyTree.monadicMaybeLabeler(simpleTree); 
		var simpleResultScp = simpleTreeMonad(0);
		var simpleResultLlt = simpleResultScp.value;
		var simpleResultState = simpleResultScp.state;

		Assert.areEqual(1, simpleResultState);
		Assert.areEqual('LEAF', simpleResultLlt()().type());
		Assert.areEqual('a', simpleResultLlt()()()[1]);

		var simpleTree2 = MyTree.branch(MyTree.leaf('a'),MyTree.leaf('b'));

		var simpleTreeMonad2 = MyTree.monadicMaybeLabeler(simpleTree2); 
		var simpleResultScp2 = simpleTreeMonad2(0);
		var simpleResultLlt2 = simpleResultScp2.value;
		var simpleResultState2 = simpleResultScp2.state;

		Assert.areEqual(2, simpleResultState2);
		Assert.areEqual('BRANCH', simpleResultLlt2().type());
		Assert.areEqual('LEAF', MyTree.left(simpleResultLlt2())()().type());

		var testTree = MyTree.branch(
			MyTree.leaf('a'),
			MyTree.branch(
				MyTree.branch(
					MyTree.leaf('b'),
					MyTree.leaf('c')),
				MyTree.leaf('d')
			)
		); 

		var treeMonad = MyTree.monadicMaybeLabeler(simpleTree); 
		var resultScp = treeMonad(0);
		var resultLlt = resultScp.value;
		var resultState = resultScp.state;

		Assert.areEqual(4, resultState);
		Assert.areEqual('BRANCH', resultLlt().type());
		Assert.areEqual('LEAF', MyTree.left(resultLlt())()().type());

		// here start the errors
		Assert.areEqual(1, MyTree.left(MyTree.left(MyTree.right(resultLlt)))()()[0]);
		Assert.areEqual('b', MyTree.left(MyTree.left(MyTree.right(resultLlt)))()()[1]);
		Assert.areEqual(2, MyTree.right(MyTree.left(MyTree.right(resultLlt)))()()[0]);
		Assert.areEqual('c', MyTree.right(MyTree.left(MyTree.right(resultLlt)))()()[1]);
	}
});

YAHOO.util.Event
		.onDOMReady(function() {
			YAHOO.GEIESMONADS.test.GEIESMONADS_TestSuite = new YAHOO.tool.TestSuite(
					"Second YUI Test Suite for GEIESMONADS");
			YAHOO.GEIESMONADS.test.GEIESMONADS_TestSuite
				.add(YAHOO.GEIESMONADS.test.oTestSMMAO);
			YAHOO.GEIESMONADS.test.GEIESMONADS_TestSuite
				.add(YAHOO.GEIESMONADS.test.oTestStateMaybeMonadicLabelingOK);

			var logger = new YAHOO.tool.TestLogger("testLogger_GEIESMONADS");
			logger.hideCategory("info");

			YAHOO.tool.TestRunner
					.add(YAHOO.GEIESMONADS.test.GEIESMONADS_TestSuite);
			YAHOO.tool.TestRunner.run()
		});