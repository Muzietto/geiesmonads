import mocha from 'mocha';

require(['babel-polyfill', 'json_parser_tests'], function () {
    var runner = mocha.run();
});

