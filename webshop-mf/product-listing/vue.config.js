const { defineConfig } = require('@vue/cli-service')
const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin')

module.exports = defineConfig({
  transpileDependencies: true,
  publicPath: 'http://localhost:8081/',
  configureWebpack: {
    optimization: {
      splitChunks: false,
    },
    plugins: [
      new ModuleFederationPlugin({
        name: 'productListing',
        filename: 'remoteEntry.js',
        exposes: {
          './ProductList': './src/main.js',
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
    port: 8081,
    hot: true,
  }
})
