geiesmonads - RELEASE 2.0
=========================
Crisp clear Javascript monads.

New with release 2.0
--------------------
Major improvements to the state monad.

Implementation of monadic labeling for a binary tree and its
comparison with manual labeling. See 4)

Release 1.0
-----------
V0.1 - We start with experiments with Identity and Maybe monad. We verify the three laws for both of them.
We improve on the design and create a chainable Maybe monad.

V0.2 - We implement a state monad along the lines of 2) and 3) and verify the three laws also for that.

ORIGINAL CONTRIBUTION
---------------------
The starting soft spot is the implementation of a CHAINABLE STATE MONAD.
This monad is a native JS function with type s -> (s,a) decorated with a bind method.
The present JS implementation of 4) is also available in Java 8 language at 6)

See file geiesmonads_2.0.js.

Next steps are:
- usage of state monad to emulate imperative programming - see 5)

DEBITS AND CREDITS
------------------
- The non-chainable identity, maybe and state monad are just repetitions 
of implementations given in 2) and 3)

- The chainable state monad is a re-elaboration of old code of mine, written in Java and available at;
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

Any feedback is welcome.

--------------------------
Released under MIT License.
