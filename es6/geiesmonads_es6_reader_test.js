/*
	GEIESMONADS - JS monads
	Author: Marco Faustinelli (contacts@faustinelli.net)
	Web: http://faustinelli.net/
	     http://faustinelli.wordpress.com/

	The MIT License - Copyright (c) 2013/2017 Geiesmonads Project
*/

var expect = chai.expect;
mocha.setup('bdd');

describe('the reader monad', function() {
  var reader = MONAD.reader,
  unit = MONAD.reader.UNIT,
  pure = MONAD.reader.UNIT,
  ask = MONAD.reader.ask,
  asks = MONAD.reader.asks,
  local = MONAD.reader.local;

  it('can receive and use a context provided at runtime', function() {
    expect(ask()
      .bind(x => unit(x + ', '))
      .bind(x => unit(x + 'Marco'))('Ciao')).to.be.equal('Ciao, Marco');
  });

  it('is a friggin\' functor', function() {
    expect(ask()
      .fmap(x => x + ', Marco')('Ciao')).to.be.equal('Ciao, Marco');
  });

  it('is also a bloody applicative', function() {

    let result = pure(a => b => c => a + b + c)
      .ap(unit('ciao'))
      .ap(unit('birillo'))
      .ap(unit('gugu'))();

    expect(result).to.be.equal('ciaobirillogugu');

    result = pure(a => b => c => a + b + c)
      .ap(unit('ciao'))
      .ap(unit('birillo'))
      .ap(ask().fmap(r => r + 'gugu'))('!')

    expect(result).to.be.equal('ciaobirillo!gugu');

    result = pure(a => b => a + b)
      .ap(unit('ciao'))
      .ap(ask().fmap(r => r + 'birillo'))('eterno');

    expect(result).to.be.equal('ciaoeternobirillo');

    result = pure(a => b => a + b)
      .ap(ask().fmap(x => x + ', Marco'))
      .ap(ask().fmap(x => x + ', Simpatico'))('Ciao');

    expect(result).to.be.equal('Ciao, MarcoCiao, Simpatico');
  });

  it('can operate on a locally modified context', function() {
    expect(local(s => s + 'Sauce')(ask())('Chocolate'))
      .to.be.equal('ChocolateSauce');

    expect(local(x => 'sauce' + x)
      (ask().bind(s => unit('ciao' + s)))('birillo'))
        .to.be.equal('ciaosaucebirillo');

  });





});
