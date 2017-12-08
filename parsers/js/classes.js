export function pair(_1, _2) {
    return {
        name: 'pair',
        first: () => _1,
        second: () => _2,
    };
}

export function success(matched, str) {
  let result = pair('got ' + matched, str);
  result.name = 'success';
  return result;
}

export function failure(matched, str) {
  let result = pair('missed ' + matched, str);
  result.name = 'failure';
  return result;
}
