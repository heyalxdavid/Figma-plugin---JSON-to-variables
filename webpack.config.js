const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const InlineChunkHtmlPlugin = require('react-dev-utils/InlineChunkHtmlPlugin');

// Shared configuration
const sharedConfig = {
  mode: 'production',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              transpileOnly: true,
            },
          },
        ],
        exclude: /node_modules/,
      },
    ],
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
  },
};

// UI configuration
const uiConfig = {
  ...sharedConfig,
  entry: {
    ui: './ui.tsx',
  },
  module: {
    rules: [
      ...sharedConfig.module.rules,
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.jsx'],
    alias: {
      '@mui/material': path.resolve(__dirname, 'node_modules/@mui/material'),
      '@mui/icons-material': path.resolve(__dirname, 'node_modules/@mui/icons-material'),
      '@emotion/react': path.resolve(__dirname, 'node_modules/@emotion/react'),
      '@emotion/styled': path.resolve(__dirname, 'node_modules/@emotion/styled'),
      'react': path.resolve(__dirname, 'node_modules/react'),
      'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
    },
  },
  output: {
    ...sharedConfig.output,
    filename: '[name].js',
    clean: {
      keep: /code\.js$/,  // Keep the plugin code file when cleaning
    },
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './ui.html',
      filename: 'ui.html',
      chunks: ['ui'],
      inject: 'body',
      scriptLoading: 'blocking',
      inlineSource: '.(js|css)$',
    }),
    new InlineChunkHtmlPlugin(HtmlWebpackPlugin, [/\.(js|css)$/]),
  ],
  optimization: {
    minimize: false,
    splitChunks: {
      chunks: 'all',
      minSize: 0,
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
      },
    },
  },
  target: 'web',
};

// Plugin configuration
const pluginConfig = {
  ...sharedConfig,
  entry: {
    code: './code.ts',
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    ...sharedConfig.output,
    filename: '[name].js',
  },
  target: 'webworker',
};

module.exports = [uiConfig, pluginConfig]; 