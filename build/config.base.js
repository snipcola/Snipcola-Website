import { src, dist, config } from "./paths.js";
import path from "path";
import fs from "fs";

import { CleanWebpackPlugin } from "clean-webpack-plugin";
import RemoveEmptyScriptsPlugin from "webpack-remove-empty-scripts";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import CssMinimizerPlugin from "css-minimizer-webpack-plugin";
import HtmlWebpackPlugin from "html-webpack-plugin";

export default {
  entry: {
    main: path.resolve(src, "scripts", "main.js"),
    styles: path.resolve(src, "styles", "main.css"),
    config: path.resolve(src, "config.json"),
  },
  output: {
    path: dist,
    filename: "[contenthash].js",
    publicPath: "",
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, "css-loader"],
      },
      {
        test: /\.pug$/,
        loader: "@webdiscus/pug-loader",
      },
    ],
  },
  optimization: {
    minimizer: ["...", new CssMinimizerPlugin()],
  },
  plugins: [
    new CleanWebpackPlugin(),
    new RemoveEmptyScriptsPlugin(),
    new MiniCssExtractPlugin({ filename: "[contenthash].css" }),
    new HtmlWebpackPlugin({
      template: path.resolve(src, "html.pug"),
      filename: "index.html",
      scriptLoading: "defer",
      inject: false,
      templateParameters: {
        config: JSON.parse(fs.readFileSync(config, "utf8")),
      },
    }),
  ],
};
