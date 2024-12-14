import ReactRefreshWebpackPlugin from '@pmmmwh/react-refresh-webpack-plugin';
import ESLintWebpackPlugin from 'eslint-webpack-plugin';
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import { Configuration, ProgressPlugin } from 'webpack';

import 'webpack-dev-server';

const config: Configuration = {
  target: 'web',
  mode: 'development',
  devServer: {
    port: 26381,
    open: '/meizhandian/',
    hot: true,
    static: [
      { directory: 'images', publicPath: '/images' },
    ],
  },
  entry: {
    popup: './src/popup.tsx',
    app: './src/app/loader.tsx',
  },
  resolve: {
    extensionAlias: { '.js': ['.tsx', '.ts', '.js'] },
    alias: { '~': __dirname + '/src' },
  },
  plugins: [
    new ReactRefreshWebpackPlugin(),
    new ESLintWebpackPlugin(),
    new ForkTsCheckerWebpackPlugin(),
    new ProgressPlugin(),
    new MiniCssExtractPlugin({ filename: '[name].css' }),
    new HtmlWebpackPlugin({
      filename: 'popup.html',
      template: 'public/popup.html',
      chunks: ['popup'],
      inject: 'body',
    }),
    new HtmlWebpackPlugin({
      filename: 'meizhandian/index.html',
      template: 'public/meizhandian/index.html',
      chunks: ['app'],
      inject: 'head',
    }),
  ],
  module: {
    strictExportPresence: true,
    rules: [
      {
        test: /.scss$/,
        use: [
          MiniCssExtractPlugin.loader,
          { loader: 'css-loader', options: { url: false } },
          'sass-loader',
        ],
      },
      {
        test: /.tsx?$/,
        loader: 'swc-loader',
        options: {
          jsc: {
            parser: { syntax: 'typescript', tsx: true, dynamicImport: false },
            transform: { react: { runtime: 'automatic', development: true, refresh: true } },
          },
        },
      },
    ],
  },
};
export default config;
