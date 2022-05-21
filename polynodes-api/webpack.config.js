const webpack = require("webpack");
const path = require("path");
const slsw = require("serverless-webpack");
const awsExternals = require("webpack-aws-externals");
const CopyPlugin = require("copy-webpack-plugin");
module.exports = (async () => {
  const accountId = await slsw.lib.serverless.providers.aws.getAccountId();
  return {
    mode: "development",
    entry: slsw.lib.entries,
    target: "node",
    externals: [awsExternals(), "ssh2"],
    plugins: [
      new webpack.DefinePlugin({
        AWS_ACCOUNT_ID: `${accountId}`,
      }),
      new CopyPlugin({
        patterns: [{ from: "assets", to: "assets" }],
      }),
    ],
    module: {
      rules: [
        {
          test: /\/assets\/.*$/,
          use: "raw-loader",
          include: [__dirname, path.join(__dirname, "assets")],
        },
        {
          test: /\.tsx?$/,
          use: "ts-loader",
          exclude: /node_modules/,
        },
      ],
    },
    devtool: "source-map",
    output: {
      libraryTarget: "commonjs2",
      path: path.join(__dirname, ".webpack"),
      filename: "[name].js",
      sourceMapFilename: "[file].map",
    },
    resolve: {
      extensions: [".ts", ".js", ".json"],
    },
  };
})();
