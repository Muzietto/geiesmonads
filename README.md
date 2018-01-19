# geiesmonads (_j_-_s_-monads)

![alt image](/img/say_monad.jpg)

Crisp clear chainable JavaScript/ECMAScript 6 monads.

Special Challenge: parser combinators in JavaScript!!!
------------------------------------------------------
File [parsers.js](https://github.com/Muzietto/geiesmonads/blob/master/parsers/js/parsers.js) contains an implementation of __chainable parser combinators__, featuring both __applicative__ and __monadic__ interfaces.

Test page is [here](http://rawgit.com/Muzietto/geiesmonads/master/parsers/Mocha_Parser_Combinators_Tests_RAWGIT.html).

Live examples page is [here](http://rawgit.com/Muzietto/geiesmonads/master/parsers/Console_Parser_Examples_RAWGIT.html).

A [JSON parser](https://github.com/Muzietto/geiesmonads/blob/master/parsers/js/json_parsers.js) is under construction, and it is tested [here](http://rawgit.com/Muzietto/geiesmonads/master/parsers/Mocha_JSON_Parser_Tests_RAWGIT.html).

NB - with a big credit due to [Understanding Parser Combinators](https://fsharpforfunandprofit.com/posts/understanding-parser-combinators/).

New with RELEASE 2.2
--------------------
File [geiesmonads_es6_reader.js](https://github.com/Muzietto/geiesmonads/blob/master/es6/geiesmonads_es6_reader.js) contains an implementation of a __chainable reader monad__.

Test page is [here](http://rawgit.com/Muzietto/geiesmonads/master/MochaGeiesmonadsES6_Reader_Test.htm).

NB - with a big credit due to [Don't Fear the Reader](https://passy.svbtle.com/dont-fear-the-reader).

New with RELEASE 2.1
--------------------
[`Maybe`, `Either a`, `State`](http://rawgit.com/Muzietto/geiesmonads/master/MochaGeiesmonadsES6_Test.htm), [`StateMaybe`](http://rawgit.com/Muzietto/geiesmonads/master/MochaGeiesmonadsES6_StateMaybe_Test.htm) and [`StateEither`](http://rawgit.com/Muzietto/geiesmonads/master/MochaGeiesmonadsES6_StateEither_Test.htm) in ECMAScript 6.

Click on the above links to access the Mocha unit test page (verify whether your browser can run the code).

NB: This repo has been tested on FF 41 and Chrome 57.

Define a State monad that manages errors (in a sense like Maybe): 
if an error/problem occurs during the "do" computation, it is signalled and propagated by `bind`.
 - Step 1) The presence of a None indicates an error has occurred -> `StateMaybe` monad
 - Step 2) The error should propagate carrying a string which describes what occurred -> `StateEither` monad

See files:
* [es6/geiesmonads_StateMaybe_StateEither.js](https://github.com/Muzietto/geiesmonads/blob/master/es6/geiesmonads_StateMaybe_StateEither.js)
* [es6/geiesmonads_stateMaybeTest.js](https://github.com/Muzietto/geiesmonads/blob/master/es6/geiesmonads_stateMaybeTest.js)
* [es6/geiesmonads_stateEitherTest.js](https://github.com/Muzietto/geiesmonads/blob/master/es6/geiesmonads_es6_stateEither_test.js)

New with RELEASE 2.0
--------------------
- Minor improvements to the `maybe` monad:
  - introduction of inner functions `some()` and `none()`
  - streamlining of the API
- Major improvements to the `state` monad:
  - monad as pure JS function - see [[7]](http://faustinelli.wordpress.com/2014/06/01/state-monad-goes-to-js-town-and-starts-swinging/)
- Implementation of monadic labeling for a binary tree and its comparison with manual labeling. See [[4]](http://channel9.msdn.com/Shows/Going+Deep/Brian-Beckman-The-Zen-of-Expressing-State-The-State-Monad)
- Usage of the state monad to emulate imperative programming - see [[5]](http://brandon.si/code/the-state-monad-a-tutorial-for-the-confused/)

TRAINING
--------
- We start with experiments with `Identity` and `Maybe` monad. We verify the three laws for both of them.
- We improve on the design and create a chainable `Maybe` monad.
- We implement a state monad along the lines of [[2]](http://jabberwocky.eu/2012/11/02/monads-for-dummies/) and [[3]](http://igstan.ro/posts/2011-05-02-understanding-monads-with-javascript.html) and [verify the three laws also for that](http://rawgit.com/Muzietto/quindici/geiesmonads/YUIGeiesmonads_TRAIN_Test.htm).
See files [geiesmonads_0.1.js](https://github.com/Muzietto/geiesmonads/blob/master/js/geiesmonads_0.1.js) and [geiesmonads_0.2.js](https://github.com/Muzietto/geiesmonads/blob/master/js/geiesmonads_0.2.js).

ORIGINAL CONTRIBUTION: Implementation of a __chainable state monad__.
---------------------
This monad is a native JS function with type `s -> (s,a)` enriched with a `bind` method.
The present JS implementation of [[4]](http://channel9.msdn.com/Shows/Going+Deep/Brian-Beckman-The-Zen-of-Expressing-State-The-State-Monad) is also available in Java 8 language at [[6]](http://faustinelli.wordpress.com/2014/04/25/the-state-monad-in-java-8-eventually)

See file [geiesmonads_0.2.js](https://github.com/Muzietto/geiesmonads/blob/master/js/geiesmonads_0.2.js) and [related tests](http://rawgit.com/Muzietto/geiesmonads/master/YUIGeiesmonads_Test.htm).

DEBITS AND CREDITS
------------------
- The non-chainable `identity`, `maybe` and `state` monad are just repetitions of implementations given in [[2]](http://jabberwocky.eu/2012/11/02/monads-for-dummies) and [[3]](http://igstan.ro/posts/2011-05-02-understanding-monads-with-javascript.html)

- The chainable maybe monad is a re-elaboration of some old code of mine, written in Java and available [at my blog](http://faustinelli.wordpress.com/2010/07/27/example-maybe-monad-in-java)

- My original contribution (the [chainable state monad](http://faustinelli.wordpress.com/2014/06/01/state-monad-goes-to-js-town-and-starts-swinging/)) is a truly cool thing.


I am in debt with:

[2] http://jabberwocky.eu/2012/11/02/monads-for-dummies/

[3] http://igstan.ro/posts/2011-05-02-understanding-monads-with-javascript.html


I am in DEEP debt with:

[1] http://james-iry.blogspot.it/2007/09/monads-are-elephants-part-1.html (and also part 2,3,4)

[4] http://channel9.msdn.com/Shows/Going+Deep/Brian-Beckman-The-Zen-of-Expressing-State-The-State-Monad

[5] http://brandon.si/code/the-state-monad-a-tutorial-for-the-confused/


A bit of self-promotion:

[6] http://faustinelli.wordpress.com/2014/04/25/the-state-monad-in-java-8-eventually/

[7] http://faustinelli.wordpress.com/2014/06/01/state-monad-goes-to-js-town-and-starts-swinging/

Every feedback is welcome.

--------------------------
Released under MIT License.
