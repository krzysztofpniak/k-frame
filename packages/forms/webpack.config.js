const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');
const fs = require('fs');
const babelrcObject = require('./.babelrc');

module.exports = {
  mode: 'development',
  devtool: 'source-map',
  entry: './examples/basic/entry.js',
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'bundle.js',
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules|libs/,
        loader: 'babel-loader',
        options: babelrcObject,
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: 'index.template.ejs',
      inject: 'body',
    }),
    new webpack.DefinePlugin({
      COMPONENT_PATH: JSON.stringify(process.env.COMPONENT_PATH),
      'process.env': JSON.stringify(process.env || {}),
    }),
  ],
};

// This will make the redux-simpler-router module resolve to the
// latest src instead of using it from npm. Remove this if running
// outside of the source.
var src = path.join(__dirname, '..', '..', 'src');
if (fs.existsSync(src)) {
  // Use the latest src
  module.exports.resolve = {alias: {'react-router-redux': src}};
  /*module.exports.module.loaders.push({
        test: /\.js$/,
        loaders: ['babel'],
        include: src
    });*/
}
