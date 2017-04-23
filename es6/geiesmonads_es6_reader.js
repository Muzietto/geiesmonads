var MONAD = {};

// NB: rm means 'reader monad'; type of context is ctx, not r!
MONAD.reader = (() => { // rm a = rm ctx a = rm (ctx -> a)
  var monad = fctxa => { // fctxa :: ctx -> a
    var thisreader = ctx => fctxa(ctx); // thisreader :: ctx -> a
    thisreader.bind = farmb => monad(ctx => { // rm b :: ctx -> b
      var a = thisreader(ctx);
      return farmb(a)(ctx); // rm b ctx :: b
    });
    return thisreader;
  }

	return { // NB writing 'rm a' or 'rm ctx a' is the same
    UNIT: a => monad(_ => a), // UNIT :: a -> rm a = a -> rm (ctx -> a)
    reader: monad, // monad :: (ctx -> a) -> rm a
    ask: _ => monad(ctx => ctx), // ask :: ctx -> rm ctx
    asks: fctxb => monad(fctxb), // asks :: (ctx -> b) -> rm b
    // local :: (ctx -> ctx) -> rm a -> rm a
    local: fctxctx => rma => monad(ctx => rma(fctxctx(ctx)))
	};
})();

var reader = MONAD.reader,
unit = MONAD.reader.UNIT,
ask = MONAD.reader.ask,
asks = MONAD.reader.asks,
local = MONAD.reader.local
;

var greet = name => ask().bind(ctx => unit(ctx + ', ' + name));

var example0 = () => {
  console.log(greet('JavaScript')('Hi'));
};

example0();

var end = str => {
  var isHello = ctx => (ctx === 'Hello');
  return asks(isHello).bind(outcome => unit(str + (outcome ? '!!' : '...')));
};

var example1 = () => {
  console.log(greet('James').bind(end)('Hello'));
  console.log(greet('Tom').bind(end)('Hi'));
};

example1();

var example3 = () => {
  var insult = ctx => ctx + ' old bastard';
  console.log((local(insult)(greet('Jimmy').bind(end)))('Hello'));
}

example3();
