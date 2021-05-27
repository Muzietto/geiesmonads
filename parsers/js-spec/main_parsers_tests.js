import mocha from 'mocha';

require(['babel-polyfill', 'parsers_tests'], () => {
  // eslint-disable-next-line no-unused-vars
  const runner = mocha.run();
});
