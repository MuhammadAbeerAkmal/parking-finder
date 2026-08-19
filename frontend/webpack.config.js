const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const { GenerateSW } = require("workbox-webpack-plugin");

module.exports = (env, argv) => ({
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
        { from: path.resolve(__dirname, "public/manifest.json"), to: "manifest.json" },
        { from: path.resolve(__dirname, "public/icons"), to: "icons" },
      ],
    }),
    // Service worker only for production builds - running one against the
    // dev server would add a second, confusing caching layer on top of
    // webpack-dev-server's own hot-reload, which caused enough grief already
    // earlier in this project without a service worker involved too.
    ...(argv.mode === "production"
      ? [new GenerateSW({ clientsClaim: true, skipWaiting: true })]
      : []),
  ],
  devServer: {
    port: 5173,
    open: true,
    client: {
      overlay: false,
    },
  },
});