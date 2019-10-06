{-# LANGUAGE FlexibleContexts, PolyKinds, DataKinds, TypeSynonymInstances #-}

import Control.Monad.Reader

type Config = FilePath

load :: Config -> String -> IO String
load config x = readFile (config ++ x)

loadRevision :: Config -> Int -> IO String
loadRevision config x = load config ("history" ++ show x ++ ".txt")

loadAll :: Config -> Int -> String -> IO (String, String)
loadAll config x y = do
    a <- load config y
    b <- loadRevision config x
    return (a, b)

-- runReaderT (load2 "monadReader.hs") "./"
load2 :: (MonadReader Config m, MonadIO m) => String -> m String
load2 x = do
    config <- ask
    liftIO $ readFile (config ++ x)

-- runReaderT (loadRevision2 123) "./"
loadRevision2 :: (MonadReader Config m, MonadIO m) => Int -> m String
loadRevision2 x = load2 ("history" ++ show x ++ ".txt")

-- runReaderT (loadAll2 123 "monadReader.hs") "./"
loadAll2 :: (MonadReader Config m, MonadIO m) => Int -> String -> m (String, String)
loadAll2 x y = do
    config <- ask
    file <- load2 y
    history <- loadRevision2 x
    return (file, history)

-- SameInput
type SI e = * -> * -> *

--  fmap :: (a -> b) -> (e -> a) -> (e -> b)
instance Functor (SI e) where
    fmap :: (a -> b) -> (SI e) a -> (SI e) b
    fmap fab sie = \x -> fab (sie x)

