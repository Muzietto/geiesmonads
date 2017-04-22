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

var greet = name => {
  return MONAD.reader.ask().bind(ctx => {
    return MONAD.reader.UNIT(ctx + ", " + name);
  });
};

var example0 = () => {
  console.log(greet("JavaScript")("Hi"));
};

//debugger;
example0();

var end = 0