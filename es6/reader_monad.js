// ----------------------------
// fmap :: (a -> b) -> f a -> f b
// fmap :: (a -> b) -> (r -> a) -> (r -> b)
// fmap :: (B -> C) -> (A -> B) -> (A -> C)
// fmap fBC fAB A = fBC (fAB A) = compose fBC fAB = fBC . fAB
//
// ----------------------------
// pure :: a -> p a
// pure x = \_ -> x
//
// ----------------------------
// ap :: p (a -> b) -> p a -> p b
// ap :: (r -> a -> b) -> (r -> a) = (r -> b)
// ap rab ra = \R -> rab R (ra R)
//
// ----------------------------
// return :: a -> m a
// pure x = \_ -> x
//
// ----------------------------
// bind :: m a -> (a -> m b) -> m b
// bind :: (r -> a) -> (a -> (r -> b)) -> (r -> b)
// bind ra arb = \R -> arb (ra R) R
//
// ----------------------------
// // runR ask 1234 = 1234
// // ask.run(1234) = 1234
// ask :: Reader r r
// ask :: r -> r
// ask = \R -> R
//
// ----------------------------
// // runR (asks length) "Banana" = 6
// // asks(\r => r.length).run("Banana") = 6
// asks :: (r -> a) -> Reader r a
// asks :: (r -> a) -> (r -> a)
// asks fra = \R -> fra(R)
// asks fra = fra
//
// ----------------------------
// // runR (local (++ " sauce") ask) "Chocolate"
// // local(ask.bind(s => s + "sauce")).run("Chocolate")
// local :: (r -> s) -> Reader r a -> Reader s a
// local :: (r -> s) -> (r -> a) -> (s -> a)

//----------------------------

window.Reader = Reader;

function Reader(fra) {
  return {
    run: fra,
    return: a => Reader(() => a),
    fmap: fab => Reader(r => fab(fra(r))),
    pure: a => Reader(() => a),
    ap: function(Ra) {
      return Reader(r => fra(r)(Ra.run(r)));
    },
    bind: function(faRb) {
      return Reader(r => faRb(fra(r)).run(r));
    },
    ask: function() {
      return Reader(r => r);
    },
    asks: function(fra) {
      return Reader(fra);
    },
    local: function(frs) {
      //return Reader(r => );
    },
  };
}

const unit = x => Reader(_ => x)
const pure = x => Reader(_ => x)
const ask = Reader(r => r);
const asks = fra => Reader(fra);
// const asks = Reader;

// es6_reader_test
const greet = name => ask.bind(env => unit(env + ', ' + name));
// greet('luigi').run('ciao') // 'ciao, luigi'
// TODO - greet is WRONG. find a real example that allows meaningful usage of fmap
// greet('luigi').fmap(x => x.toUpperCase()).run('ciao') // 'CIAO'

const completeTheGreeting = greeting => asks(g => g === 'ciao')
  .bind(isCiao => unit(greeting + (isCiao ? '!!!' : '...')))
// greet('luigi').bind(completeTheGreeting).run('ciao')    // 'ciao, luigi!!!'
// greet('luigi').bind(completeTheGreeting).run('fottiti') // 'fottiti, luigi...'

// eval0 :: Env -> Exp -> Value
// eval0 _ (Lit i) = IntVal i
// eval0 env (Var name) = fromJust $ Map.lookup name env
// eval0 env (Plus e1 e2) = let
//     IntVal i1 = eval0 env e1
//     IntVal i2 = eval0 env e2
//   in IntVal (i1 + i2)
// eval0 env (Lambda argname body) = FunVal argname body env
// eval0 env (App lambda expr) = let
//   v1 = eval0 env lambda
//   v2 = eval0 env expr
//   in case v1 of
//     FunVal argname body env' -> eval0 (Map.insert argname v2 env') body
//     _ -> undefined

function Lit(i) { this.i = i; }
function Var(name) { this.name = name; }
function Plus(e1, e2) { this.e1 = e1; this.e2 = e2; }
function Lambda(argname, body) { this.argname = argname; this.body = body; }
function App(lambda, expr) { this.lambda = lambda; this.expr = expr; }
//-------------
function IntVal(value) { this.value = value; }
function FunVal(argname, body, env) { this.argname = argname; this.body = body; this.env = env; }

function caseOf(expr) {
  if (expr instanceof Lit) return 'Lit';
  if (expr instanceof Var) return 'Var';
  if (expr instanceof Plus) return 'Plus';
  if (expr instanceof Lambda) return 'Lambda';
  if (expr instanceof App) return 'App';
  return 'unknown';
}

function eval0(env) {
  return expr => {
    switch(caseOf(expr)) {
      case 'Lit':
        return new IntVal(expr.i);
        break;
      case 'Var':
        return env[expr.name];
        break;
      case 'Plus':
        const { e1, e2 } = expr;
        const { value: v1 } = eval0(env)(e1);
        const { value: v2 } = eval0(env)(e2);
        return new IntVal(v1 + v2);
        break;
      case 'Lambda':
        const { argname, body } = expr;
        return new FunVal(argname, body, env);
        break;
      case 'App': // App(lambda, expr)
        const funval = eval0(env)(expr.lambda);
        const expr2 = eval0(env)(expr.expr);
        if (funval instanceof FunVal) {
          const newEnv = { ...funval.env, [funval.argname]: expr2 };
          return eval0(newEnv)(funval.body);
        }
        return undefined;
    }
  }
}


const X = new Var('X');
const UNO = new Lit(1);
const DUE = new Lit(2);
const TRE = new Plus(UNO, DUE);
const PLUS_ONE = new Lambda(X,new Plus(X,UNO));



// https://stackoverflow.com/questions/14178889/what-is-the-purpose-of-the-reader-monad
