const webpack = require('webpack');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    mode: "production",
    resolve: {
        // Add '.ts' and '.tsx' as resolvable extensions.
        extensions: [".ts", ".tsx"]
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
    externals: {
        "react": "React",
        "react-dom": "ReactDOM"
    },
    resolve: {
        extensions: [".ts", ".tsx", ".js", ".jsx"]
    },
};