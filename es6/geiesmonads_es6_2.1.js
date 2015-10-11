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

MONAD.maybe = (function() {
  var monad = value => {
    var maybe = () => value;
    maybe.bind = famb => (isSome(value)) ? famb(value) : maybe;
    return maybe;
  }
  var isSome = value => typeof value !== 'undefined' && value !== null;
  var isNone = value => !isSome(value);
  return {
    UNIT : monad ,
    isNone : isNone,
    isSome : isSome
  };
})();

MONAD.state = function() {
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
}();
