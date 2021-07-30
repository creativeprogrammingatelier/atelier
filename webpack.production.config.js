const webpack = require('webpack');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    mode: "production",
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
    entry: "main.js",
    output: {
		path: __dirname + "/build/client",
    },
    plugins: [
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin({
            title: "Atelier",
            template: 'client/index.html',
            files: {
                main:{
                    entry: "main.js"
                }
            }
            
        }),
        new webpack.ProvidePlugin({
            "React": "react",
            'ReactDOM':   'react-dom',
        }),
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
                test: /\.(js|jsx) $/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader"
                }
            },
            {
                test: /\.(s*)css$/i,
                use: ['style-loader', 'css-loader', 'sass-loader'],
            },
        ],

    },
};