const path = require('path');

const isProduction = process.env.NODE_ENV == 'production';

const config = {
  entry: './ts/index.ts',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'index.js',
    publicPath: path.resolve(__dirname, 'dist'),
  },
  devServer: {
    port: 8080,
    static: [path.join(__dirname, "dist"), path.join(__dirname, "static")],
    compress: true,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
      "Access-Control-Allow-Headers": "X-Requested-With, content-type, Authorization",
      "X-Content-Type-Options": "Disabled"
    }
  },
  plugins: [],
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/i,
        loader: 'ts-loader',
        exclude: ['/node_modules/'],
      }
    ],
  },
  resolve: {
    extensions: ['.ts', '.js', '...'],
  },
};

module.exports = () => {
  config.mode = isProduction ? 'production' : 'development';
  return config;
};
