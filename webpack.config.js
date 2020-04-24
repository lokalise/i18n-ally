/* eslint-disable @typescript-eslint/no-var-requires */
// @ts-check
'use strict'

const path = require('path')
const FilterWarningsPlugin = require('webpack-filter-warnings-plugin')

/** @type {import('webpack').Configuration} */
const config = {
  target: 'node',

  entry: './src/extension.ts',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'extension.js',
    libraryTarget: 'commonjs2',
    devtoolModuleFilenameTemplate: '../[resource-path]',
  },
  // devtool: 'source-map',
  externals: {
    vscode: 'commonjs vscode',
    nodejieba: 'nodejieba',
    esm: 'esm',
    'ts-node': 'ts-node',
    consolidate: 'consolidate',
    less: '_',
    sass: '_',
    stylus: '_',
    prettier: 'prettier',
    '@microsoft/typescript-etw': '_',
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'ts-loader',
          },
        ],
      },
    ],
  },
  plugins: [
    // @ts-ignore
    new FilterWarningsPlugin({
      exclude: /Critical dependency: the request of a dependency is an expression/,
    }),
  ],
}
module.exports = config
