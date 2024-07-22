const CopyWebpackPlugin = require('copy-webpack-plugin')
const path = require('path')

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
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        { from: path.resolve(__dirname, 'manifest.json'), to: path.resolve(__dirname, 'dist') },
        { from: path.resolve(__dirname, 'popup.html'), to: path.resolve(__dirname, 'dist') }
      ]
    })
  ],
  mode: 'production'
}
