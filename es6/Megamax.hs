import Control.Monad.Reader

 data GameState = NotOver | FirstPlayerWin | SecondPlayerWin | Tie

 data Game position
   = Game {
           getNext :: position -> [position],
           getState :: position -> GameState
          }

 getNext' :: position -> Reader (Game position) [position]
 getNext' position
   = do game <- ask
        return $ getNext game position

 getState' :: position -> Reader (Game position) GameState
 getState' position
   = do game <- ask
        return $ getState game position


 negamax :: Double -> position -> Reader (Game position) Double
 negamax color position
     = do state <- getState' position
          case state of
             FirstPlayerWin -> return color
             SecondPlayerWin -> return $ negate color
             Tie -> return 0
             NotOver -> do possible <- getNext' position
                           values <- mapM ((liftM negate) . negamax (negate color)) possible
                           return $ maximum values
