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
	either: null,
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
  var monad = (matchFun) => value => {
    var either = () => value;
    either.match = matchFun;
    either.bind = faeb => {
      try {
        if (isLeft(either)) throw either();
        return faeb(either());
      } catch (exc) {
        return left(exc);
      }
    }
    return either;
  }
  var left = monad((lFun, rFun) => lFun);
  var right = monad((lFun, rFun) => rFun);
  var isLeft = either => either.match(() => true, () => false)();
  var isRight = either => either.match(() => false, () => true)();

  return {
    left: left,
    right: right,
    UNIT: right,
    isLeft : isLeft,
    isRight : isRight
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