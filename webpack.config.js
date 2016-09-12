var path = require('path');
var webpack = require('webpack');
require('es6-promise').polyfill();
var postcssImport = require('postcss-import');

module.exports = {
    devtool: 'source-map',
    entry: [
        'webpack-dev-server/client?http://localhost:8056',
        'webpack/hot/only-dev-server',
        './src/index.js'
    ],
    output: {
        path: path.join(__dirname, 'dist'),
        filename: 'bundle.js',
        chunkFilename: '[name].chunk.js',
        publicPath: '/static/'
    },
    plugins: [
        new webpack.HotModuleReplacementPlugin()
    ],
    resolve: {
        extensions: ['', '.js', '.jsx']
    },
    module: {
        loaders: [
            {
                test   : /\.(ttf|eot|otf|svg|png|gif|woff|jpeg(2)?)(\?[a-z0-9]+)?$/,
                loader : 'file-loader'
            },
             {
                test: /\.js/,
                exclude: /node_modules/,
                loader: 'react-hot'
            },
            {
                test: /\.js/,
                exclude: /node_modules/,
                loader: 'babel-loader',
                query: {
                    presets: ['es2015', 'react', 'stage-0'],
                    plugins: ["transform-decorators-legacy"]
                }
            },
            {
                test:   /\.css$/,
                loader: "style-loader!css-loader!postcss-loader"
            },
            {
                test: /\.less$/,
                loader: "style-loader!css-loader!less-loader"
            }
        ],
        include: path.join(__dirname, 'src')
    },
    postcss: function (webpack) {
        return [
            postcssImport({
                addDependencyTo: webpack
            })
        ];
    }
};
