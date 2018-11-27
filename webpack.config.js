var path = require('path');
var webpack = require('webpack');
module.exports = {
  entry: ['./lib/main.js'],
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'progo.bundle.js'
  }
}