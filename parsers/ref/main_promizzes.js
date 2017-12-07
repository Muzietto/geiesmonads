(function() {

  require.config({
    baseUrl: '',
    paths: {
      'promizzes': 'js/promizzes/promizzes',
      'promizzes2': 'js/promizzes/promizzes2',
      'promizzes2b': 'js/promizzes/promizzes2b',
      'promizzes3': 'js/promizzes/promizzes3',
      'test': 'js/promizzes/promizzes_test',
      'test2': 'js/promizzes/promizzes_test2',
      'test2b': 'js/promizzes/promizzes_test2b',
      'test3': 'js/promizzes/promizzes_test3',
      'mocha': 'mocha/mocha',
      'chai': 'mocha/chai'
    },
    shim: {
      mocha: {
        init: function() {
          this.mocha.setup('bdd');
          return this.mocha;
        }
      }
    }
  });
  define(['mocha'], function(mocha) {
    require(['test', 'test2', 'test2b', 'test3'], function() {
      var runner = mocha.run();
    });
  })
})();