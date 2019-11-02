// ----------------------------
// fmap :: (a -> b) -> f a -> f b
// fmap :: (a -> b) -> (r -> a) -> (r -> b)
// fmap :: (B -> C) -> (A -> B) -> (A -> C)
// fmap fBC fAB A = fBC (fAB A) = compose fBC fAB = fBC . fAB
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
// // runR (local (++ " sauce") ask) "Chocolate"
// // local(ask.bind(s => s + "sauce")).run("Chocolate")
// local :: (r -> s) -> Reader r a -> Reader s a
// local :: (r -> s) -> (r -> a) -> (s -> a)

//----------------------------

window.Reader = Reader;

function Reader(fra) {
  return {
    run: fra,
    return: a => Reader(() => a),
    fmap: Reader,
    pure: a => Reader(() => a),
    ap: function(Ra) {
      return Reader(r => fra(r)(Ra.run(r)));
    },
    bind: function(faRb) {
      return Reader(r => faRb(fra(r))(r));
    },
    ask: function() {
      return Reader(r => r);
    },
    asks: function(fra) {
      return Reader(fra);
    },
    local: function(frs) {
      //return Reader(r => );
    },
  };
}

const pure = x => Reader(_ => x)
const ask = Reader(r => r);
const asks = fra => Reader(fra);
