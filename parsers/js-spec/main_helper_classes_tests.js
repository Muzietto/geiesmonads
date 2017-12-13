import mocha from 'mocha';

require(['classes_tests'], function () {
    var runner = mocha.run();
});

