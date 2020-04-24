/*
	GEIESMONADS - JS monads
	Author: Marco Faustinelli (contacts@faustinelli.net)
	Web: http://faustinelli.net/
	     http://faustinelli.wordpress.com/

	The MIT License - Copyright (c) 2013/2020 Geiesmonads Project
*/

const lunghezza = x => x.length;

const MONAD = {};

// NB: rm means 'reader monad'
MONAD.reader = (() => { // rm a = rm r a = rm (r -> a)
  const monad = fra => { // fra :: r -> a
    const thisreader = r => fra(r); // gotta CLONE fra in order to decorate it later!!
    thisreader.bind = farmb => monad(r => { // rm b :: r -> b
      const a = fra(r); // thread r into thisreader
      return farmb(a)(r); // rm b r :: b
    });
    return thisreader;
  };

  return { // NB writing 'rm a' or 'rm r a' is the same
    UNIT: a => monad(() => a), // UNIT :: a -> rm a = a -> rm (r -> a)
    reader: monad, // monad :: (r -> a) -> rm a
    ask: () => monad(r => r), // ask :: r -> rm r
    asks: frb => monad(frb), // asks :: (r -> b) -> rm b
    // local :: (r -> s) -> rm s a -> rm r a
    local: frs => Rsa => monad(r => Rsa(frs(r))),
    localwrong: frr => Rsa => monad(r => frr(Rsa(r))), // that's WRONG!!!
  };
})();

const R = MONAD.reader;

// R.ask().bind(s => R.UNIT('ciao' + s))('birillo') // "ciaobirillo"
// R.local(x => 'sauce' + x)(R.ask().bind(s => R.UNIT('ciao' + s)))('birillo') // "ciaosaucebirillo" <-- RIGHT!!!
// R.localwrong(x => 'sauce' + x)(R.ask().bind(s => R.UNIT('ciao' + s)))('birillo') // "sauceciaobirillo" <-- WRONG!!!

// ----------------------------
// fmap :: (a -> b) -> f a -> f b
// fmap :: (a -> b) -> (r -> a) -> (r -> b)
// fmap :: (a -> b) -> Reader r a -> Reader r b
// fmap :: (B -> C) -> (A -> B) -> (A -> C)
// fmap fBC fAB A = fBC (fAB A) = compose fBC fAB = fBC . fAB
//
// ----------------------------
// contramap :: (a -> b) -> f b -> f a
// contramap :: (r -> s) -> (s -> a) -> (r -> a)
// // runR (local (++ " sauce") ask) "Chocolate"
// local(s => s + "Sauce")(ask).run("Chocolate") // "ChocolateSauce"
// local(s => s + "Sauce")
//      (ask.bind(x => unit(x + "Very"))
//          .bind(x => unit(x + "Hot"))).run("Chocolate") // "ChocolateSauceVeryHot"
// local(s => s + s + "Sauce")
//      (ask.bind(x => unit(x + "Very"))
//          .bind(x => unit(x + "Hot")))
//   .run("Chocolate") // "ChocolateChocolateSauceVeryHot"
// local :: (r -> s) -> (s -> a) -> (r -> a)
// local :: (r -> s) -> Reader s a -> Reader r a
// local === contramap
//
// ----------------------------
// pure :: a -> p a
// pure x = \_ -> x
//
// ----------------------------
// ap :: p (a -> b) -> p a -> p b
// ap :: (r -> a -> b) -> (r -> a) = (r -> b)
// ap rab ra = \R -> rab R (ra R)
//
// ----------------------------
// return :: a -> m a
// pure x = \_ -> x
//
// ----------------------------
// bind :: m a -> (a -> m b) -> m b
// bind :: (r -> a) -> (a -> (r -> b)) -> (r -> b)
// bind ra arb = \R -> arb (ra R) R
//
// ----------------------------
// // runR ask 1234 = 1234
// // ask.run(1234) = 1234
// ask :: Reader r r
// ask :: r -> r
// ask = \R -> R
//
// ----------------------------
// // runR (asks length) "Banana" = 6
// // asks(\r => r.length).run("Banana") = 6
// asks :: (r -> a) -> Reader r a
// asks :: (r -> a) -> (r -> a)
// asks fra = \R -> fra(R)
// asks fra = fra
//
// ----------------------------

function Reader(fra) {
  return {
    run: fra,
    return: a => Reader(() => a),
    fmap: fab => Reader(r => fab(fra(r))),
    pure: a => Reader(() => a),
    ap: function(Rra) {
      return Reader(r => fra(r)(Rra.run(r)));
    },
    bind: function(faRb) {
      return Reader(r => faRb(fra(r)).run(r));
    },
    ask: function() {
      return Reader(r => r);
    },
    asks: function(fra) {
      return Reader(fra);
    },
    // local :: (r -> s) -> Reader s a -> Reader r a
    // local :: str -> int -> Reader int STR -> Reader str STR
    local: function(frs) {
      return Rsa => Reader(r => Rsa.run(frs(s))); // Rra
    },
  };
};

const local = frs => Rsa => Reader(r => Rsa.run(frs(r)));
//ReaderR.loca2 = f => tf => ReaderR(x => tf.run(f(x)));

const R2 = Reader;

const unit = x => Reader(() => x);
const pure = x => Reader(() => x);
// pure(a => str => lunghezza(a+str))
//   .ap(unit('ciao'))
//   .ap(pure('birillo')).run() // 11
// pure(a => str => ctx => a+str+ctx)
//   .ap(unit('ciao'))
//   .ap(pure('birillo'))
//   .ap(pure('gugu')).run() // "ciaobirillogugu"
// pure(a => str => op => op(a+str))
//   .ap(unit('ciao'))
//   .ap(pure('birillo'))
//   .ap(pure(lunghezza)).run() // 11
// pure(a => str => a+str)
//   .ap(unit('ciao'))
//   .ap(ask.bind(ctx => unit(ctx+'birillo'))).run('eterno') // "ciaoeternobirillo"

const ask = Reader(r => r);
// ask.bind(s => unit('ciao' + s)).run('birillo') // "ciaobirillo"

const asks = fra => Reader(fra);
// const asks = Reader;
// asks(x => 'ciao' + x).run('birillo') // "ciaobirillo"

// local: frs => Rsa => monad(r => Rsa(frs(r))),
// pure(a => str => a + str)
//   .ap(unit('ciao'))
//   .ap(local
//         (x => x+x)
//         (ask.bind(x => unit(x + 'birillo')))).run('gugu') --> "ciaogugugugubirillo"
// pure(a => str => end => a + str + end)
//    .ap(unit('ciao'))
//    .ap(local
//          (x => x+x)
//          (ask.bind(x => unit(x + 'birillo'))))
//    .ap(ask.bind(x => unit(x + 'END'))).run('gugu') --> "ciaogugugugubirilloguguEND"
// pure(a => str => end => a + str + end)
//   .ap(unit('ciao'))
//   .ap(local
//         (x => x + x.toUpperCase())
//         (ask.bind(x => unit(x + 'birillo'))))
//    .ap(ask.bind(x => unit(x + 'END'))).run('gugu') --> "ciaoguguGUGUbirilloguguEND"

// calculateContentLen :: Reader String Int
// calculateContentLen = do
//     content <- ask
//     return (length content);
//
// -- Calls calculateContentLen after adding a prefix to the Reader content.
// calculateModifiedContentLen :: Reader String Int
// calculateModifiedContentLen = local ("Prefix " ++) calculateContentLen

const calculateContentLen = ask.bind(x => unit(x.length));
// calculateContentLen.run('ciao') --> 4
const calculateModifiedContentLen = local(x => 'Prefix '+x)(calculateContentLen);
// calculateModifiedContentLen.run('ciao') --> 11 (calculateContentLen('Prefix ciao'))
// calculateModifiedContentLen.bind(x => unit(x*x)).run('ciao') --> 121

// cfr. https://stackoverflow.com/questions/48346504/what-is-the-purpose-of-the-reader-monads-local-function
const apply = f => x => f(x);
const id = x => x;
const first = x => y => x;
const comp = f => g => x => f(g(x));

const ReaderR = apply(constructor => f => {
  const t = new constructor();
  t.run = x => f(x);
  return t;
}) (function ReaderR() {});

ReaderR.map = f => tf => ReaderR(comp(f) (tf.run));
ReaderR.ap = af => ag => ReaderR(x => af.run(x) (ag.run(x)));
ReaderR.chain = mf => fm => ReaderR(x => fm(mf.run(x)).run(x));
ReaderR.of = f => ReaderR(first(f));
ReaderR.ask = () => ReaderR(id);
ReaderR.asks = f => ReaderR.chain(ReaderR.ask) (x => ReaderR.of(f(x)));
ReaderR.local = f => tf => ReaderR(comp(tf.run) (f));

const compM = tDict => fm => gm => x =>
  tDict.chain(tDict.chain(tDict.of(x)) (gm)) (fm);

const foo = n => ReaderR(env => (console.log(env), n + 1)),
  c = compM(ReaderR) (foo) (foo) (2);

// console.log(c.run("shared environment")); // that's just "4" - other logs are side effects
