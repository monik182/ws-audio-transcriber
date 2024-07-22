// webpack.config.js
const path = require('path');

module.exports = {
  entry: {
    // popup: './src/popup.js',
    background: './src/background.js',
    content: './src/content.js',
    processAudios: './src/processAudios.js',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].bundle.js'
  },
  mode: 'production'
};
