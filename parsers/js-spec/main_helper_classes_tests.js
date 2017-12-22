import mocha from 'mocha';

require(['babel-polyfill', 'classes_tests'], function () {
    var runner = mocha.run();
});

