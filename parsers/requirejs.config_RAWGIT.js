var require = {
    baseUrl: '/Muzietto/geiesmonads/master/parsers/dist',
    paths: {
        'mocha': 'lib/mocha',
        'chai': 'lib/chai',
    },
    shim: {
        mocha: {
            init: function () {
                this.mocha.setup('bdd');
                return this.mocha;
            }
        }
    }
};
