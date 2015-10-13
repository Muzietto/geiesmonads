/*
	GEIESMONADS - JS monads
	Author: Marco Faustinelli (contacts@faustinelli.net)
	Web: http://faustinelli.net/
	     http://faustinelli.wordpress.com/
	Version: 2.1 - using ECMAScript 6

	The MIT License - Copyright (c) 2013/2015 Geiesmonads Project
*/

var MONAD = {
	maybe: null,
	state: null
};

MONAD.maybe = (() => {
  var monad = value => {
    var maybe = () => value;
    maybe.bind = famb => (isSome(maybe)) ? famb(value) : maybe;
    return maybe;
  }
  var isSome = maybe => typeof maybe() !== 'undefined' && maybe() !== null;
  var isNone = maybe => !isSome(maybe);
  return {
    UNIT : monad,
    none : monad(undefined),
    isNone : isNone,
    isSome : isSome
  };
})();

MONAD.either = (() => {
  var left = thrown => {
    
  }
  var right = value => {
    
  }
  
})();

MONAD.state = (() => {
  var monad = fssa => { 
    var state = s => fssa(s);
    state.bind = fasmb => monad(s => {
      var [sss, aaa] = state(s);
      return fasmb(aaa)(sss);
    });
    return state;
  }

	return {
    UNIT : a => monad(s => [s, a]),
    state: monad,
    sSet : S => monad(s => [S, undefined]),
    sGet : monad(s => [s, s])
	};
})();
