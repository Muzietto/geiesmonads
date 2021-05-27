import mocha from 'mocha';

require(['babel-polyfill', 'classes_tests'], () => {
  // eslint-disable-next-line no-unused-vars
  const runner = mocha.run();
});
