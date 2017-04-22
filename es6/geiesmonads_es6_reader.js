
var Reader = function Reader(fn) {
  this.f = fn;
};

Reader.ask = function ask() {
    return new Reader(function identity(x) { return x; });
};

Reader.asks = function asks(fn) {
    return new Reader(fn);
};

Reader.prototype.run = function run(ctx) {
    return this.f(ctx);
};

Reader.prototype.unit = function unit(x) {
    return new Reader(function constant(_) { return x});
};

Reader.staticUnit = function staticUnit(x) {
    return new Reader(function constant(_) { return x});
};

Reader.prototype.flatMap_ref = function farb(k) {
    return new Reader((function bound(r) {
        // need k.call because unit is an instance method
        return k.call(this, this.run(r)).run(r);
    }).bind(this));
};

Reader.prototype.flatMap = function flatMap(k) {
    return new Reader((function bound(r) {
      var zzz = this.run(r);
      return k(zzz).run(r);
    }).bind(this));
};

var greet = function greet(name) {
    return Reader.ask().flatMap(function boundGreet(ctx) {
        return Reader.staticUnit(ctx + ", " + name);
    });
};

var greet_ref = function greet_ref(name) {
    return Reader.ask().flatMap_ref(function boundGreet(ctx) {
        return this.unit(ctx + ", " + name);
    });
};

var example0 = function example0() {
    console.log(greet_ref("JavaScript").run("Hi"));
};

debugger;
example0();