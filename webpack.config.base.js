const webpack = require('webpack')

const BASE_PLUGINS = [
  new webpack.DefinePlugin({
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
  })
]

module.exports = {
  entry: [
    './src/index'
  ],
  output: {
    path: __dirname + '/public',
    filename: 'bundle.js',
    publicPath: '/public/'
  },
  plugins: process.env.NODE_ENV === 'production'
    ? BASE_PLUGINS
    : BASE_PLUGINS.concat([
      new webpack.NamedModulesPlugin(),
      new webpack.NoEmitOnErrorsPlugin(),
      new webpack.HotModuleReplacementPlugin()
    ]),
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: [{
          loader: 'babel-loader'
        }]
      },
      { test: /\.css$/, use: [{loader: 'style-loader!css-loader'}] }
    ]
  }
};
