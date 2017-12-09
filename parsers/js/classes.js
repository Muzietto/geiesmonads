export function pair(_1, _2) {
    return {
        name: 'pair',
        first: () => _1,
        second: () => _2,
    };
}

function _concat(msgs) {
    if (Array.isArray(msgs)) return msgs.join('');
    else return msgs;
}

export function success(matched, str) {
  let result = pair(_concat(matched), str);
  result.name = 'success';
  return result;
}

export function failure(matched, str) {
  let result = pair(_concat(matched), str);
  result.name = 'failure';
  return result;
}

export function parser(fn) {
  return {
      run: str => fn(str),
      name: 'parser',
  };
}
