const { defineConfig } = require('@vue/cli-service')
const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin')

module.exports = defineConfig({
  transpileDependencies: true,
  publicPath: 'http://localhost:8084/',
  configureWebpack: {
    optimization: {
      splitChunks: false,
    },
    plugins: [
      new ModuleFederationPlugin({
        name: 'productDetails',
        filename: 'remoteEntry.js',
        exposes: {
          './ProductDetails': './src/main.js',
        },
        shared: {
          vue: {
            singleton: true,
            eager: true
          },
          axios: {
            singleton: true,
          }
        }
      })
    ]
  },
  devServer: {
    port: 8084,
    hot: true,
  }
})
