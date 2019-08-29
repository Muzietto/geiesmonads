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
console.log(JSON.stringify(store), JSON.stringify(fullStore))
