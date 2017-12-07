import mocha from 'mocha';

require(['dist/parser_tests'], function () {
    var runner = mocha.run();
});

