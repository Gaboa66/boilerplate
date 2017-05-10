const webpack = require('webpack');
const path    = require('path');
const glob    = require('glob');

const InlineChunkWebpackPlugin = require('html-webpack-inline-chunk-plugin');
const HtmlWebpackPlugin  = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin')
const ExtractTextPlugin  = require('extract-text-webpack-plugin');
const PurifyCSSPlugin    = require('purifycss-webpack');

const isProduction = (process.env.NODE_ENV === 'production');

module.exports = {
    entry: {
        app: [
            './src/main.js',
            './src/main.scss'
        ],
        vendor: ['rxjs', 'pixi.js']
    },
    output: {
        path: path.resolve(__dirname, './dist'),
        filename: '[name].[chunkhash].js'
    },
    module: {
        rules: [
            {
                test: /\.scss$/,
                use: ExtractTextPlugin.extract({
                    use: ['css-loader', 'sass-loader'],
                    fallback: 'style-loader'
                })
            },
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: 'babel-loader'
            },
            {
                test: /\.(png|jpg|gif|svg|eot|ttf|woff|woff2)$/,
                loaders: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: 'assets/[name].[hash].[ext]'
                        }
                    },
                    'img-loader'
                ]
            }
        ]
    },
    plugins: [
        new CleanWebpackPlugin(['dist'], {
            root:     __dirname,
            verbose:  true,
            dry:      false
        }),
        new ExtractTextPlugin('[name].[chunkhash].css'),
        new PurifyCSSPlugin({
            paths: glob.sync(path.join(__dirname, 'index.html')),
            minimize: isProduction
        }),
        new webpack.LoaderOptionsPlugin({
            minimize: isProduction
        }),
        // function() {
        //     this.plugin('done', stats => {
        //         require('fs').writeFileSync(
        //             path.join(__dirname, 'dist/manifest.json'),
        //             JSON.stringify(stats.toJson().assetsByChunkName)
        //         );
        //     });
        // },
        new webpack.optimize.CommonsChunkPlugin({
            names: ['common', 'manifest']
        }),
        new HtmlWebpackPlugin({
            // your options, 
            excludeChunks: ['vendors']
        }),
        new InlineChunkWebpackPlugin({
            inlineChunks: ['manifest']
        })
    ]
};

if (isProduction) {
    module.exports.plugins.push(
        new webpack.optimize.UglifyJsPlugin()
    );
}
