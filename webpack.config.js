const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: './src/index.js',
  devServer: {
    host: '0.0.0.0',
    historyApiFallback: true,
  },
  node: {
    fs: 'empty', // temporary fix for webpack issue with fs module
  },
  plugins: [
    new CleanWebpackPlugin(['dist']),
    new HtmlWebpackPlugin({ template: 'src/index-template.html' }),
    new CopyWebpackPlugin([{ from: 'src/assets/images/**/*', to: 'images' }]),
    // new CopyWebpackPlugin([{ from: './src/models/', to: 'models' }]),
  ],
  module: {
    rules: [{
      test: /\.scss$/,
      use: [{
        loader: 'style-loader', // creates style nodes from JS strings
      }, {
        loader: 'css-loader', // translates CSS into CommonJS
      }, {
        loader: 'sass-loader', // compiles Sass to CSS
      }],
    },
    {
      test: /\.(png|svg|jpg|gif|woff|woff2|dat|patt|fbx|jd)$/,
      use: [
        'file-loader',
      ],
    }],
  },
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },

};
