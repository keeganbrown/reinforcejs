const webpack = require('webpack');
const config = require('./webpack.config.base');
const InlineManifestWebpackPlugin = require('inline-manifest-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

config.entry = { bundle: config.entry.pop() };
config.bail = true;
config.profile = false;
config.output.filename = '[name].[chunkhash].js';

config.module.rules = config.module.rules.concat([
  {
    test: /\.less|\.css/,
    use: ExtractTextPlugin.extract({
      fallback: 'style-loader',
      use: [
        {
          loader: 'css-loader',
          options: {
            importLoaders: 1,
            minimize: true
          }
        }
      ]
    })
  }
]);

config.plugins = config.plugins.concat([
  new ExtractTextPlugin('styles.[contenthash].css'),
  new webpack.optimize.CommonsChunkPlugin({
    name: 'vendor',
    minChunks: function(module) {
      return module.context && module.context.indexOf('node_modules') !== -1;
    }
  }),
  new webpack.optimize.CommonsChunkPlugin({ name: 'manifest' }),
  new InlineManifestWebpackPlugin({ name: 'webpackManifest' }),
  new webpack.optimize.UglifyJsPlugin({
    compress: {
      warnings: false
    },
    mangle: true,
    output: {
      comments: false
    }
  })
]);

module.exports = config;
