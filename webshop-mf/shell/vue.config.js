const { defineConfig } = require('@vue/cli-service')
const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin')

module.exports = defineConfig({
  transpileDependencies: true,
  publicPath: 'http://localhost:8082/',
  configureWebpack: {
    optimization: {
      splitChunks: false,
    },
    plugins: [
      new ModuleFederationPlugin({
        name: 'shell',
        filename: 'remoteEntry.js',
        remotes: {
          productListing: 'productListing@http://localhost:8081/remoteEntry.js',
          shoppingCart: 'shoppingCart@http://localhost:8083/remoteEntry.js',
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
    port: 8082,
    hot: true,
  }
})
