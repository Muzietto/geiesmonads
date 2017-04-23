/*
	GEIESMONADS - JS monads
	Author: Marco Faustinelli (contacts@faustinelli.net)
	Web: http://faustinelli.net/
	     http://faustinelli.wordpress.com/

	The MIT License - Copyright (c) 2013/2015 Geiesmonads Project
*/

/* Define a State monad that manages errors (in a sense like Maybe): 
   if an error/problem occurs during the "do" computation, it is signalled and propagated by >>= 
   step 1) The presence of a None indicates an error has occurred -> StateMaybe monad
   step 2) The error should propagate carrying a string which describes what occurred -> StateEither monad
*/

MONAD.stateMaybe = function() {
  var monad = fssma => { // s => [s, maybe a]
    var statemaybe = s => fssma(s);
    statemaybe.bind = fassmb => monad(s => {
      try {
        var [sss, maybea] = statemaybe(s);
        if (MONAD.maybe.isNone(maybea)) throw "got a none!!";
        return fassmb(maybea())(sss);
      } catch (e) {
        return [sss, MONAD.maybe.none];
      }
    });
    return statemaybe;
  }

  return {
    UNIT : value => monad(s => [s, MONAD.maybe.UNIT(value)]),
    stateMaybe : monad,
    sSet : S => monad(s => [S, MONAD.maybe.none]),
    sGet : monad(s => [s, MONAD.maybe.UNIT(s)])
  }
}();

MONAD.stateEither = function() {
  var monad = fssma => { // s => [s, either a b]
    var stateeither = s => fssma(s);
    stateeither.bind = fassmb => monad(s => {
      try {
        var [sss, either] = stateeither(s);
        if (MONAD.either.isLeft(either)) throw either();
        return fassmb(either())(sss);
      } catch (e) {
        return [sss, MONAD.either.left(e)];
      }
    });
    return stateeither;
  }
  
  // pick one depending on the type of value
  var mempty = 0;
  //var mempty = '';

  return {
    UNIT : either => monad(s => [s, either]),
    stateEither : monad,
    sSet : S => monad(s => [S, MONAD.either.right(mempty)]),
    sGet : monad(s => [s, MONAD.either.right(s)])
  }
}();