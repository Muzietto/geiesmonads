/*
	GEIESMONADS - JS monads
	Author: Marco Faustinelli (contacts@faustinelli.net)
	Web: http://faustinelli.net/
	     http://faustinelli.wordpress.com/

	The MIT License - Copyright (c) 2013/2020 Geiesmonads Project
*/

var MONAD = {};

// NB: rm means 'reader monad'; type of context is ctx, not r!
MONAD.reader = (() => { // rm a = rm ctx a = rm (ctx -> a)
  var monad = fra => { // fra :: ctx -> a
    var thisreader = r => fra(r); // gotta CLONE fra in order to decorate it later!!
    // fmap :: (a -> b) -> (r -> a) -> (r -> b)
    thisreader.fmap = fab => monad(r => { // fab :: a -> b
      return fab(fra(r));
    });
    // ap :: m(a -> b) -> ma -> mb
    thisreader.ap = Rra => monad(r => { // will return a Rrb
      const fr_ab = fra;  // NB in this case fra :: r -> (a -> b)
      const a = Rra(r);
      const fab = fr_ab(r);
      const b = fab(a);
      return fr_ab(r)(Rra(r)) // Rr_ab -> Rra -> Rrb
    });
    thisreader.bind = farmb => monad(r => { // rm b :: ctx -> b
      var a = fra(r);
      return farmb(a)(r); // rm b r :: b
    });
    return thisreader;
  };

  return { // NB writing 'rm a' or 'rm ctx a' is the same
    UNIT: a => monad(() => a), // UNIT :: a -> rm a = a -> rm (ctx -> a)
    pure: a => monad(() => a),
    reader: monad, // monad :: (ctx -> a) -> rm a
    ask: _ => monad(ctx => ctx), // ask :: ctx -> rm ctx
    asks: fctxb => monad(fctxb), // asks :: (ctx -> b) -> rm b
    // local :: (ctx -> ctx) -> rm a -> rm a
    local: fctxctx => rma => monad(ctx => rma(fctxctx(ctx)))
  };
})();
