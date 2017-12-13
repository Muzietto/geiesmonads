var require = {
    baseUrl: '/geiesmonads/parsers/dist',
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
