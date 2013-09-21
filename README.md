geiesmonads - RELEASE 1.0
=========================
Crisp clear Javascript monads.

We start with experiments with Identity and Maybe monad. We verify the three laws for both of them.
We improve on the design and create a chainable Maybe monad.

We implement a state monad along the lines of 2) and 3) and verify the three laws also for that.

ORIGINAL CONTRIBUTION
---------------------
The final soft spot is the implementation of a CHAINABLE STATE MONAD.
See file geiesmonads_1.0.js.

Next steps are:
- further exploration of the capabilities of the state monad
- exploration of the connections between state monad and I/O monad

I know this Javascript code is just a bunch of global stuff, but it's not meant to be used as-is in a production environment.

DEBITS AND CREDITS
------------------
- the non-chainable identity, maybe and state monad are just repetitions 
of implementations given in 2) and 3)

- The chainable state monad is a re-elaboration of old code of mine, written in Java and available at;
http://faustinelli.wordpress.com/2010/07/27/example-maybe-monad-in-java/

- The original contribution (chainable state monad) is a truly cool thing.

I am in deep debt with:
1) http://james-iry.blogspot.it/2007/09/monads-are-elephants-part-1.html (and also part 2,3,4)
2) http://jabberwocky.eu/2012/11/02/monads-for-dummies/
3) http://igstan.ro/posts/2011-05-02-understanding-monads-with-javascript.html

Any feedback is welcome.

--------------------------
Released under MIT License.
