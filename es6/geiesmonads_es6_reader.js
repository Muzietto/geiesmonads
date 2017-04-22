var MONAD = {};

MONAD.reader = (() => {
  var monad = fctxa => {
    var rea = ctx => fctxa(ctx); // rea :: ctx -> a
    rea.bind = farmb => monad(ctx => { // rmb :: ctx -> b
      var a = rea(ctx);
      return farmb(a)(ctx); // rmb(ctx) :: b
    });
    return rea;
  }

	return {
    UNIT: x => monad(_ => x),
    reader: monad,
    ask: () => monad(x => x),
    asks: fctxa => monad(fctxa)
	};
})();

var reader = MONAD.reader,
unit = MONAD.reader.UNIT,
ask = MONAD.reader.ask,
asks = MONAD.reader.asks
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