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

  it('can "ask" to receive a context provided at runtime', function() {

    expect(ask()
      .bind(x => unit(x + ', '))
      .bind(x => unit(x + 'Marco'))('Ciao')).to.be.equal('Ciao, Marco');
  });

  it('features "asks" to spare one ring in the chain', function() {

    let result = asks(x => x + 'Marco')('Ciao');

    expect(result).to.be.equal('CiaoMarco');

    result = asks(x => x + ', ').fmap(x => x + 'Marco')('Ciao')

    expect(result).to.be.equal('Ciao, Marco');
  });

  describe('is a friggin\' functor', () => {

    it('which simplifies things a lot!', function() {

      let result = ask().fmap(x => x + ', Marco')('Ciao')

      expect(result).to.be.equal('Ciao, Marco');
    });

    it('but apparently makes the monad completely useless...', function() {
      expect(ask()
        .bind(x => unit(x + ', '))
        .bind(x => unit(x + 'Marco'))('Ciao')).to.be.equal('Ciao, Marco');

      expect(ask()
        .fmap(x => x + ', ')
        .fmap(x => x + 'Marco')('Ciao')).to.be.equal('Ciao, Marco');
    });
  });

  describe('is also a bloody applicative', () => {

    it('doing its thing', function() {
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
    it('mixing types', () => {
      const lunghezza = str => str.length;

      let result = pure(a => b => lunghezza(a + b))
        .ap(unit('ciao'))
        .ap(pure('birillo'))()

      expect(result).to.be.equal(11);

      result = pure(a => b => op => op(a + b))
        .ap(unit('ciao'))
        .ap(pure('birillo'))
        .ap(pure(lunghezza))()

      expect(result).to.be.equal(11);
    });
  });

  describe('can operate on a locally modified context using "local"', () => {
    it('doing its thing', function() {
      expect(local(s => s + 'Sauce')(ask())('Chocolate'))
        .to.be.equal('ChocolateSauce');

      expect(local(x => 'sauce' + x)
        (ask().bind(s => unit('ciao' + s)))('birillo'))
          .to.be.equal('ciaosaucebirillo');
    });

    it('together with its functor and its applicative', function() {
      const result = pure(a => b => c => a + b + c)
        .ap(unit('ciao'))
        .ap(local
              (x => x + x.toUpperCase())
              (ask().fmap(x => x + 'birillo')))
         .ap(ask().fmap(x => x + 'END'))('gugu')

       expect(result).to.be.equal('ciaoguguGUGUbirilloguguEND');
    });
  });

});
