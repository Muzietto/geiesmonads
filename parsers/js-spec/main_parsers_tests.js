import mocha from 'mocha';

require(['classes_tests', 'parsers_tests'], function () {
    var runner = mocha.run();
});

