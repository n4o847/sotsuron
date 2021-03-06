const webpack = require('webpack');
const nodeExternals = require('webpack-node-externals');

module.exports = {
  entry: {
    'dist/bin/aflv': './src/bin/aflv.ts',
    'dist/bin/aflv-cc': './src/bin/aflv-cc.ts',
    'dist/bin/aflv-cxx': './src/bin/aflv-cxx.ts',
  },
  output: {
    path: __dirname,
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  target: 'node',
  externals: [nodeExternals()],
  plugins: [
    new webpack.BannerPlugin({
      banner: '#!/usr/bin/env node',
      raw: true,
    }),
  ],
};
