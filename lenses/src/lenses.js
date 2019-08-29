// rough lenses for me
const view = (lens, store) => lens.view(store);

const set = (lens, value, store) => lens.set(value, store);

const lensFor = key => ({
  view: store => store[key],
  set: (value, store) => ({
    ...store,
    [key]: value,
  }),
});

const aStore = {};
const lensA = lensFor('a');
const lensB = lensFor('b');
const lensC = lensFor('c');

const retrieved = view(lensA, set(lensA, 'pippo', aStore));
console.log('retrieved:', retrieved);

const overridden = view(lensB, set(lensB, 'secondo', set(lensB, 'primo', aStore)));
console.log('overridden:', overridden);
const inputStraight = view(lensC, set(lensC, 'secondo', aStore));
console.log('inputStraight:', inputStraight);

const fullStore = {
  a: 'pippo',
  b: 'pluto',
  c: 'paperino',
};

const store = set(lensA, view(lensA, fullStore), fullStore);
console.log(JSON.stringify(store), JSON.stringify(fullStore));

const upperize = x => x.toUpperCase();
const enlarge = x => x.split('').join(' ');

const over = lens => f => store => set(lens, f(view(lens, store)), store);

const upperized = over(lensA)(upperize)(fullStore);
console.log(JSON.stringify(upperized));

const upperenlargize = x => upperize(enlarge(x));
const upperenlargized = over(lensA)(upperenlargize)(fullStore);

const upperizeA = over(lensA)(upperize);
const enlargeA = over(lensA)(enlarge);
const upperenlargizeA = x => upperizeA(enlargeA(x));
const upperenlargized2 = upperenlargizeA(fullStore);

console.log(JSON.stringify(upperenlargized), JSON.stringify(upperenlargized2));
