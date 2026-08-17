const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = {
  entry: "./src/index.tsx",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "bundle.[contenthash].js",
    clean: true,
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: "ts-loader",
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./public/index.html",
    }),
    // Lets API_BASE be overridden at build time (e.g. `API_BASE=https://... npm run build`)
    // instead of being hardcoded in source, while still defaulting sensibly for dev.
    new webpack.DefinePlugin({
      __API_BASE__: JSON.stringify(process.env.API_BASE || "http://localhost:8000"),
    }),
    new CopyWebpackPlugin({
      patterns: [
        // Copied verbatim (not imported as modules) so MapLibre's worker can
        // fetch its sibling "shared" chunk via native relative import when
        // the browser loads the worker, without webpack reprocessing either
        // file's own internal imports.
        {
          from: path.resolve(__dirname, "node_modules/maplibre-gl/dist/maplibre-gl-worker.mjs"),
          to: "maplibre-gl-worker.mjs",
        },
        {
          from: path.resolve(__dirname, "node_modules/maplibre-gl/dist/maplibre-gl-shared.mjs"),
          to: "maplibre-gl-shared.mjs",
        },
      ],
    }),
  ],
  devServer: {
    port: 5173,
    open: true,
    client: {
      overlay: false,
    },
  },
};