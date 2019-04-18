
function compose() {
  const argz = arguments;
  return x => [...argz].reduceRight((acc, curr) => curr(acc), x);
}

// const compose = (f, g) => x => f(g(x));

const map = f => xs => xs.map(f);

const prop = attr => obj => obj[attr];

const split = value => str => str.split(value);

const head = xs => xs[0];

var getFromStorage = function(key) {
  return function() {
    return localStorage[key];
  };
};

var IO = function(f) {
  this.unsafePerformIO = f;
};

IO.of = function(f) {
  return new IO(() => f);
};

IO.prototype.map = function(f) {
  // return new IO(compose(f, this.unsafePerformIO));
  const self = this;
  return new IO(() => f(self.unsafePerformIO());
};

//  io_window :: IO Window
var io_window = new IO(() => window);

const innerW = io_window.map(win => win.innerWidth);
// IO(1430)

const xxx = io_window.map(prop('location')).map(prop('href')).map(split('/'));
// IO(["file:", "", "", "home", "developer", "workspace", "geiesmonads", "io", "io.html"])

//  $ :: String -> IO [DOM]
var $ = function(selector) {
  return new IO(() => document.querySelectorAll(selector));
};

const gigio = $('#myDiv').map(head).map(function(div) {
  return div.innerHTML;
});
// IO('I am some inner html')

const pippo = 12;
