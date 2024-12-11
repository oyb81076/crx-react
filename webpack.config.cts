// import HtmlWebpackPlugin, { } from 'html-webpack-plugin'
import HtmlWebpackPlugin from 'html-webpack-plugin';
import MiniCssExtractPlugin, { } from 'mini-css-extract-plugin';

import { Configuration } from 'webpack'
const config: Configuration = {
  target: 'web',
  mode: 'production',
  optimization: {
    minimize: false,
    splitChunks: false,
    minimizer: [],
  },
  performance: { hints: false, },
  entry: {
    "popup": "./src/popup.tsx",
    "background": "./src/background.ts",
    "content": "./src/content.tsx"
  },
  output: {
    publicPath: '/dist/'
  },
  resolve: {
    extensionAlias: { '.js': ['.tsx', '.ts', '.js'] },
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: '[name].css',
    }),
    new HtmlWebpackPlugin({
      template: 'public/index.html',
      filename: 'popup.html',
      chunks: ['popup'],
    }),
  ],
  module: {
    strictExportPresence: true,
    rules: [
      {
        test: /.scss$/, use: [
          MiniCssExtractPlugin.loader,
          { loader: 'css-loader' },
          'sass-loader'
        ]
      },
      { test: /.tsx?$/, use: ['swc-loader'] }
    ]
  }
}
export default config;