import mocha from 'mocha';

require(['parsers_tests', 'classes_tests'], function () {
    var runner = mocha.run();
});

