// http://etorreborre.blogspot.com/2011/06/essence-of-iterator-pattern.html

const pricer = market =>
  (market.isOpen)
  ? Maybe.of(maybeFruit => (maybeFruit.isJust)
      ? Maybe.of(market[maybeFruit.get()])
      : Maybe.Nothing)
  : Maybe.Nothing;

const maybePricer = pricer({ isOpen: true, orange: 123 });

const applic = maybeFunc => ({
  // F[a => b] => F[A] => F[B]
  apply: fa => (maybeFunc.isJust) ? Maybe.of(maybeFunc.get()(fa)) : Maybe.Nothing,
});

const maybePrice = applic(maybePricer).apply(Maybe.of('orange'));

console.log(maybePrice);
