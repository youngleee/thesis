const { defineConfig } = require('@vue/cli-service')
const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin')

module.exports = defineConfig({
  transpileDependencies: true,
  publicPath: 'http://localhost:8085/',
  configureWebpack: {
    optimization: {
      splitChunks: false,
    },
    plugins: [
      new ModuleFederationPlugin({
        name: 'checkout',
        filename: 'remoteEntry.js',
        exposes: {
          './Checkout': './src/components/Checkout.vue',
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
    port: 8085,
    hot: true,
  }
}) 