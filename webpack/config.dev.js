const webpack = require('webpack');
const config = require('./config.base');
const auth = process.env.API_AUTH || '';

config.entry = [
  'webpack-dev-server/client?http://localhost:8080',
  'webpack/hot/only-dev-server'
].concat(config.entry);

config.devServer = {
  historyApiFallback: {
    rewrites: [
      { from: /^\/$/, to: 'index.html' }
    ]
  },
  watchOptions: {
    ignored: /(node_modules|\.git)/
  },
  hot: true,
  inline: true,
  host: '0.0.0.0',
  proxy: {
    // '/api': {
    //   changeOrigin: true,
    //   target: apiTarget,
    //   auth
    // }
  }
};

config.devtool = 'inline-source-map';

console.log('Dev Server Configuration', config.devServer);

config.module.rules = config.module.rules.concat([
  {
    enforce: 'pre',
    test: /\.jsx?$/,
    loader: 'eslint-loader',
    exclude: /node_modules/,
    options: {
      emitWarning: true,
      formatter: require('eslint-friendly-formatter')
    }
  },
  {
    test: /\.less|\.css/,
    use: [
      'style-loader',
      {
        loader: 'css-loader',
        options: {
          importLoaders: 1,
          sourceMap: true
        }
      }
    ]
  },
  {
      test: /\.glsl$/,
      loader: 'webpack-glsl'
  }
]);

config.plugins.unshift(new webpack.HotModuleReplacementPlugin());

module.exports = config;
