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
  ask = MONAD.reader.ask,
  asks = MONAD.reader.asks,
  local = MONAD.reader.local
  ;
  var greet = name => ask().bind(ctx => {
    //debugger;
    return unit(ctx + ', ' + name);
  });

  it('can receive and use a context provided at runtime', function() {
    expect(greet('Marco')('Ciao')).to.be.equal('Ciao, Marco');
    expect(greet('Marco')('Eccoti qua')).to.be.equal('Eccoti qua, Marco');
  });

  var completeTheGreeting = str => {
    //debugger;
    var isCtxHello = ctx => (ctx === 'Hello');
    return asks(isCtxHello).bind(isHello => {
        //debugger;
        return unit(str + (isHello ? '!!' : '...'));
      });
  };

  it('can act upon the context value', function() {
    // ctx(greet||completeTheGreeting) = 'Hello'
    expect(greet('John').bind(completeTheGreeting)('Hello')).to.be.equal('Hello, John!!');
    var greetCompletely = name => greet(name).bind(completeTheGreeting);
    // ctx(greet||completeTheGreeting) = 'Hi'
    expect(greetCompletely('Trudy')('Hi')).to.be.equal('Hi, Trudy...');
  });

  var insult = ctx => {
    //debugger; // darn interesting observation point
    return ctx + ' old bastard';
  }

  it('can operate in a locally modified context', function() {
    // ctx(insult) = 'Hello', ctx(greet||completeTheGreeting) = 'Hello old bastard'
    expect((local(insult)(greet('John').bind(completeTheGreeting)))('Hello'))
      .to.be.equal('Hello old bastard, John...');
    // ctx(insult||completeTheGreeting) = 'Hello', ctx(greet) = 'Hello old bastard'
    expect((local(insult)(greet('John'))).bind(completeTheGreeting)('Hello'))
      .to.be.equal('Hello old bastard, John!!');
    // ctx(greet||completeTheGreeting) = 'Hello'
    // === WTF?! ===> ctx(insult) = 'Hello, John' <=== WTF?! ===
    expect(greet('John').bind(local(insult)(completeTheGreeting))('Hello'))
      .to.be.equal('Hello, John old bastard!!');
  });

  it('has some surprising quirks which can catch people unaware, or at least me...', function() {
    // ctx(greet1||completeTheGreeting1||completeTheGreeting2) = 'Hello'
    // str(completeTheGreeting1) = 'Hello, John'
    // str(completeTheGreeting2) = 'Hello, John!!'
    expect(greet('John').bind(completeTheGreeting).bind(completeTheGreeting)('Hello')).to.be.equal('Hello, John!!!!');
    // ctx(greet1||completeTheGreeting) = 'Hello'
    // str(completeTheGreeting) = 'Hello, John'
    // === AAA ===> name(greet2) = 'Hello, John!!' <=== AAA ===
    expect(greet('John').bind(completeTheGreeting).bind(greet)('Hello')).to.be.equal('Hello, Hello, John!!');
    // str(completeTheGreeting) = 'Louie'
    // ctx(completeTheGreeting||greet) = 'Hello'
    // === AAA ===> name(greet) = 'Louie!!' <=== AAA ===
    expect(completeTheGreeting('Louie').bind(greet)('Hello')).to.be.equal('Hello, Louie!!');
  });
});