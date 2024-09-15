const CopyWebpackPlugin = require('copy-webpack-plugin')
const path = require('path')

module.exports = {
  entry: {
    background: './src/background.js',
    content: './src/content.js',
    loadAudios: './src/loadAudios.js',
  },
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: '[name].bundle.js'
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        { from: path.resolve(__dirname, 'manifest.json'), to: path.resolve(__dirname, 'build') },
      ]
    })
  ],
  mode: 'production'
}
