import mocha from 'mocha';

require(['babel-polyfill', 'parsers_tests'], function () {
    var runner = mocha.run();
});

