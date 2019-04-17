
function compose() {
  const argz = arguments;
  return x => [...argz].reduceRight((acc, curr) => curr(acc), x);
}

const toUpperCase = x => x.toUpperCase();

const head = ([x, ...xs]) => x;

const join = val => a => a.join(val);

const split = val => str => str.split(val);

const map = f => a => a.map(f);

//not pointfree because we mention the data: name
var initialsZ = function(name) {
  return name.split(' ').map(compose(toUpperCase, head)).join('. ');
};

//pointfree
var initials = compose(join('. '), map(compose(toUpperCase, head)), split(' '));

console.log(initials("hunter stockton thompson"));
// 'H. S. T'
