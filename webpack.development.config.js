const webpack = require("webpack");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
    mode: "development",

    // Enable sourcemaps for debugging webpack's output.
    devtool: "source-map",

    resolve: {
        // Add '.ts' and '.tsx' as resolvable extensions.
        extensions: [".ts", ".tsx", "..."],
        // Polyfills for use of path and crypto in the client
        fallback: {
            path: require.resolve("path-browserify"),
            crypto: require.resolve("crypto-browserify"),
            stream: require.resolve("stream-browserify")
        }
    },
    output: {
        path: __dirname + "/build/client",
    },
    plugins: [
        // new CleanWebpackPlugin(),
        new HtmlWebpackPlugin({
            title: "Atelier",
            template: "client/index.html",
            files: {
                main:{
                    entry: "main.js"
                }
            }
            
        })
    ],
    module: {
        rules: [{
            test: /\.ts(x?)$/,
            exclude: /node_modules/,
            use: [{
                loader: "ts-loader"
            }]
        },
        {
            enforce: "pre",
            test: /\.js$/,
            exclude: /node_modules/,
            loader: "source-map-loader"
        },
        {
            test: /\.(js|jsx) $/,
            exclude: /node_modules/,
            use: {
                loader: "babel-loader"
            }
        },
        {
            test: /\.(s*)css$/i,
            use: ["style-loader", "css-loader", "sass-loader"],
        },
        ],

    },
};