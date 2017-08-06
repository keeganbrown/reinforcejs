const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const WebpackCleanupPlugin = require('webpack-cleanup-plugin');
const CopyWepbackPlugin = require('copy-webpack-plugin');

module.exports = {
  resolve: {
    extensions: ['.js', '.jsx', '.json']
  },
  entry: ['./src/index.js'],
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'bundle.js',
    publicPath: '/'
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        query: { presets: ['stage-2', 'es2015'] }
      },
      {
        test: /\.(gif|png|jpg|jpeg|svg|woff|woff2|ttf|eot)$/,
        loader: 'url-loader',
        query: { limit: 25000 }
      },
      {
        test: /\.glsl$/,
        loader: 'webpack-glsl'
      },
      {
        test: /\.ejs$/,
        use: [
          {
            loader: 'ejs-loader',
          }
        ]
      },
      {
        test: /\.md$/,
        use: [
          {
            loader: 'html-loader',
          },
          {
            loader: 'markdown-loader',
          }
        ]
      }
    ]
  },
  plugins: [
    new webpack.NoEmitOnErrorsPlugin(),
    new WebpackCleanupPlugin(),
    new CopyWepbackPlugin([{
      from: 'src/assets',
      to: './'
    }]),
    new webpack.DefinePlugin({
      'process.env': { NODE_ENV: JSON.stringify(process.env.NODE_ENV || 'development') }
    }),
    new HtmlWebpackPlugin({
      template: './src/index.ejs',
      filename: 'index.html'
    }),
    new HtmlWebpackPlugin({
      template: './src/assets/gridworld_dp.ejs',
      filename: 'gridworld_dp.html'
    }),
    new HtmlWebpackPlugin({
      template: './src/assets/gridworld_td.ejs',
      filename: 'gridworld_td.html'
    }),
    new HtmlWebpackPlugin({
      template: './src/assets/waterworld.ejs',
      filename: 'waterworld.html'
    }),
    new HtmlWebpackPlugin({
      template: './src/assets/puckworld.ejs',
      filename: 'puckworld.html'
    })
  ]
};
