const webpack = require("webpack");
const path = require("path");
const slsw = require("serverless-webpack");
const nodeExternals = require("webpack-node-externals");
// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
  mode: slsw.lib.webpack.isLocal ? "development" : "production",
  entry: slsw.lib.entries,
  devtool: "source-map",
  resolve: {
    // for WebStorm and IntelliJ
    alias: {
      "@": path.resolve(__dirname),
      "~": path.resolve(__dirname),
    },
    extensions: [".js", ".jsx", ".json", ".ts", ".tsx"],
  },
  output: {
    libraryTarget: "commonjs",
    path: path.join(__dirname, ".webpack"),
    filename: "[name].js",
  },
  target: "node",
  module: {
    rules: [
      {
        // all files with a `.ts` or `.tsx` extension will be handled by `ts-loader`
        test: /\.tsx?$/,
        use: [
          { loader: "thread-loader" },
          { loader: "ts-loader", options: { happyPackMode: true } },
        ],
      },
    ],
  },
  plugins: [
    /**
     * The below custom plugin is necessary because of this issue:
     * https://github.com/felixge/node-formidable/issues/337
     * Formidable is a dep of superagent which is a dep of node-mailjet. If/when the mail service is migrated to a different service,
     * this plugin can be removed.
     */
    new webpack.DefinePlugin({ "global.GENTLY": false }),
    // new BundleAnalyzerPlugin()
  ],
  externals: [nodeExternals()],
  /**
   * Workaround for issue:
   * https://github.com/serverless-heaven/serverless-webpack/issues/529
   * Terser hates mongoose for some reason.
   */
  optimization: {
    minimize: false,
  },
};
