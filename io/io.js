
function compose() {
  const argz = arguments;
  return x => [...argz].reduce((acc, curr) => curr(acc), x);
}

const addClass = name => el => el.classList.add(name);

const S = f => g => x => f(x)(g(x))

const K = x => y => x;

const addClassOK = name => S(K)(addClass(name));

                           x => K(x)(addClass(name)(x));

const getElement = document.getElementById;

//const mess = compose (addClassOK('red'), addClassOK('blue'), getElement);

const mess = compose (x => x + 'ciao', x => x + 'mamma', x => x + 'mia' );
