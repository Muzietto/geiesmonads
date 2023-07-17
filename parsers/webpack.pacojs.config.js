const path = require('path');

module.exports = {
  mode: 'production', // put to 'production' to create less code
  // devtool: 'source-map', // put 'inline-source-map' to create sourcemaps
  entry: './js/parsers.js',
  output: {
    path: path.resolve(__dirname, 'dist_webpack'),
    filename: 'paco-js.min.js',
    globalObject: 'this',
    library: {
      // your lib name if imported with the <script> tag
      // for this library it will be available as `window.char_series`
      name: 'paco-js',

      // the module type - shouldn't be 'target' ??
      type: 'umd',

      export: 'default',
    },
    umdNamedDefine: true,
  },
};

// cfr. https://github.com/evert/bigint-money/blob/master/webpack.config.js
/* .
module.exports = [
  {
    entry: './dist/index',
    output: {
      path: __dirname + '/browser',
      filename: 'bigint-money.min.js',
      library: 'money'
    },

    resolve: {
      extensions: ['.web.ts', '.web.js', '.ts', '.js', '.json']
    },

    devtool: 'source-map',

    module: {
      rules: [
        {
          test: /\.tsx?$/,
          loader: 'awesome-typescript-loader'
        }
      ]
    },

  }
];
*/

// cfr. https://gist.github.com/dreyescat/c3fd66ea0f7e97ba5c21?permalink_comment_id=2601663#gistcomment-2601663
/*
module.exports = {
  entry: './index.js',
  output: {
    path: './lib',
    filename: 'yourlib.js',
    libraryTarget: 'umd',
    library: 'YourLibraryName',
    umdNamedDefine: true,
	libraryExport: 'default'
  }
};
*/

// cfr. https://stackoverflow.com/questions/68978395/how-write-an-npm-package-that-supports-every-javascript-environments-module-sys
/*
output: {
  // empty the output directory on every build
  clean: true,

  // the dir of output bundle
  path: path.resolve(__dirname, 'dist'),

  // output bundle name
  filename: 'index.js',

  globalObject: 'this',

  library: {
    // your lib name if imported with the <script> tag
    // for this library it will be available as `window.char_series`
    name: 'char_series',

    // the module type
    type: 'umd',

    export: 'default',
  },
},
*/
