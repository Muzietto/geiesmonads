
function compose() {
  const argz = arguments;
  return x => [...argz].reduceRight((acc, curr) => curr(acc), x);
}

const addClass = name => el => {
  el.classList.add(name);
}

const S = f => g => x => {
  const fx = f(x);
  const gx = g(x);
  const result = fx(gx);
  return result;
}

const K = x => y => {
  return x;
}

const addClassOK = name => S(K)(addClass(name));
               //     x => K(x)(addClass(name)(x));

const getElement = document.getElementById.bind(document);

const mess = compose (addClassOK('red'), addClassOK('large'), getElement);

const mess2 = el => addClassOK('red')(addClassOK('large')(getElement(el)));

const newMess = el => PIPPO().GetElement(el).AddClassOK('large').AddClassOK('red');


function PIPPO() {
  let _target;
  const result = {
    target: () => _target,
    GetElement: id => { _target = getElement(id); return result; },
    AddClassOK: name => { addClassOK(name)(result.target()); return result; },
  };
  return result;
}
