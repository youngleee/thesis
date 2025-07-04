const { defineConfig } = require('@vue/cli-service')
const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin')

module.exports = defineConfig({
  transpileDependencies: true,
  publicPath: 'http://localhost:8083/',
  configureWebpack: {
    optimization: {
      splitChunks: false,
    },
    plugins: [
      new ModuleFederationPlugin({
        name: 'shoppingCart',
        filename: 'remoteEntry.js',
        exposes: {
          './ShoppingCart': './src/main.js',
        },
        shared: {
          vue: {
            singleton: true,
            eager: true
          }
        }
      })
    ]
  },
  devServer: {
    port: 8083,
    hot: true,
  }
}) 