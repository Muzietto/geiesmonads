var require = {
    baseUrl: '/parsers/dist',
    paths: {},
    shim: {
      mocha: {
        init: function() {
          this.mocha.setup('bdd');
          return this.mocha;
        }
      }
    }
};
