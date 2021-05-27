import mocha from 'mocha';

require(['babel-polyfill', 'json_parser_tests'], () => {
  // eslint-disable-next-line no-unused-vars
  const runner = mocha.run();
});
