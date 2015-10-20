# geiesmonads (_j_-_s_-monads)

![alt image](/img/say_monad.jpg)

Crisp clear chainable Javascript monads.

**NOW with porting to ECMAScript 6**

New with RELEASE 2.1
--------------------
`Maybe`, `Either a`, `State`, `StateMaybe` and `StateEither` in ECMAScript 6. Verify whether your browser can run the code.

NB: This repo has been tested on FF 41.0.1. Mocha test runner.

Define a State monad that manages errors (in a sense like Maybe): 
if an error/problem occurs during the "do" computation, it is signalled and propagated by `bind`.
 - Step 1) The presence of a None indicates an error has occurred -> `StateMaybe` monad
 - Step 2) The error should propagate carrying a string which describes what occurred -> `StateEither` monad

See files:
* es6/geiesmonads_StateMaybe_StateEither.js
* es6/geiesmonads_stateMaybeTest.js.
* es6/geiesmonads_stateEitherTest.js.

Download/clone and doubleclick one of the HTML files.

New with RELEASE 2.0
--------------------
- Minor improvements to the `maybe` monad:
  - introduction of inner functions `some()` and `none()`
  - streamlining of the API
- Major improvements to the `state` monad:
  - monad as pure JS function - see 7)
- Implementation of monadic labeling for a binary tree and its comparison with manual labeling. See 4)
- Usage of the state monad to emulate imperative programming - see 5)

TRAINING
--------
- We start with experiments with `Identity` and `Maybe` monad. We verify the three laws for both of them.
- We improve on the design and create a chainable `Maybe` monad.
- We implement a state monad along the lines of 2) and 3) and verify the three laws also for that.
See files geiesmonads_0.1.js and geiesmonads_0.2.js.

ORIGINAL CONTRIBUTION
---------------------
Implementation of a CHAINABLE STATE MONAD.
This monad is a native JS function with type `s -> (s,a)` enriched with a `bind` method.
The present JS implementation of 4) is also available in Java 8 language at 6)

See file geiesmonads_2.0.js.

DEBITS AND CREDITS
------------------
- The non-chainable `identity`, `maybe` and `state` monad are just repetitions 
of implementations given in 2) and 3)

- The chainable maybe monad is a re-elaboration of old code of mine, written in Java and available at;
http://faustinelli.wordpress.com/2010/07/27/example-maybe-monad-in-java/

- The original contribution (chainable state monad) is a truly cool thing.

I am in debt with:
2) http://jabberwocky.eu/2012/11/02/monads-for-dummies/
3) http://igstan.ro/posts/2011-05-02-understanding-monads-with-javascript.html

I am in DEEP debt with:
1) http://james-iry.blogspot.it/2007/09/monads-are-elephants-part-1.html (and also part 2,3,4)
4) http://channel9.msdn.com/Shows/Going+Deep/Brian-Beckman-The-Zen-of-Expressing-State-The-State-Monad
5) http://brandon.si/code/the-state-monad-a-tutorial-for-the-confused/

A bit of self-promotion:
6) http://faustinelli.wordpress.com/2014/04/25/the-state-monad-in-java-8-eventually/
7) http://faustinelli.wordpress.com/2014/06/01/state-monad-goes-to-js-town-and-starts-swinging/

Every feedback is welcome.

--------------------------
Released under MIT License.
