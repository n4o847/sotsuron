const webpack = require('webpack');
const { merge } = require('webpack-merge');
const common = require('./webpack.client.config');

module.exports = merge(common, {
  mode: 'development',
  entry: [
    'webpack-hot-middleware/client',
  ],
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
  ],
});
