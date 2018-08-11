const path = require('path');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const autoprefixer = require('autoprefixer');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const ProgressBarPlugin = require('progress-bar-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const paths = require('./paths');

const { NODE_ENV, ANALYZE } = process.env;

const publicPath = '/';
const shouldUseSourceMap = NODE_ENV === 'staging';

const config = {
    mode: 'production',
    // Don't attempt to continue if there are any errors.
    bail: true,
    devtool: shouldUseSourceMap && 'source-map',
    entry: ['@babel/polyfill', paths.appIndexJs],
    output: {
        path: path.resolve(paths.appBuild, NODE_ENV),
        filename: 'js/[name].[chunkhash:8].js',
        chunkFilename: 'js/[name].[chunkhash:8].chunk.js',
        publicPath,
    },
    optimization: {
        minimizer: [
            new UglifyJsPlugin({
                // Default number of concurrent runs: os.cpus().length - 1
                parallel: true,
                // Enable file caching
                cache: true,
                sourceMap: shouldUseSourceMap,
            }),
            new OptimizeCSSAssetsPlugin({
                cssProcessorOptions: {
                    // tell cssnano to not shorten keyframes names, without this option
                    // there were animation names conflicts between app/vendors css chunks
                    reduceIdents: false,
                    map: shouldUseSourceMap
                        ? {
                              inline: true,
                          }
                        : false,
                },
            }),
        ],
        // Automatically split vendor and commons
        splitChunks: {
            chunks: 'all',
            name: 'vendors',
        },
        runtimeChunk: true,
    },
    resolve: {
        modules: ['node_modules', paths.appSrc],
        extensions: ['.js', '.json', '.jsx'],
    },
    module: {
        strictExportPresence: true,
        rules: [
            {
                // "oneOf" will traverse all following loaders until one will
                // match the requirements. When no loader matches it will fall
                // back to the "file" loader at the end of the loader list.
                oneOf: [
                    // "url" loader works just like "file" loader but it also embeds
                    // assets smaller than specified size as data URLs to avoid requests.
                    {
                        test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
                        loader: require.resolve('url-loader'),
                        options: {
                            limit: 10000,
                            name: 'media/[name].[hash:8].[ext]',
                        },
                    },
                    {
                        test: /\.(js|jsx)$/,
                        include: paths.srcPaths,
                        exclude: /node_modules/,
                        use: [
                            // This loader parallelizes code compilation, it is optional but
                            // improves compile time on larger projects
                            require.resolve('thread-loader'),
                            {
                                loader: require.resolve('babel-loader'),
                                options: {
                                    presets: [
                                        [require.resolve('@babel/preset-env'), { modules: false }],
                                        require.resolve('@babel/preset-react'),
                                    ],
                                    plugins: [
                                        require.resolve('babel-plugin-lodash'),
                                        require.resolve('@babel/plugin-proposal-export-namespace-from'),
                                        require.resolve('@babel/plugin-syntax-dynamic-import'),
                                        [require.resolve('@babel/plugin-proposal-class-properties'), { loose: true }],
                                    ],
                                    compact: true,
                                    highlightCode: true,
                                },
                            },
                        ],
                    },
                    // "postcss" loader applies autoprefixer to our CSS.
                    // "css" loader resolves paths in CSS and adds assets as dependencies.
                    // `MiniCSSExtractPlugin` extracts styles into CSS
                    // files. If you use code splitting, async bundles will have their own separate CSS chunk file.
                    {
                        test: /\.css$/,
                        loader: [
                            MiniCssExtractPlugin.loader,
                            {
                                loader: require.resolve('css-loader'),
                                options: {
                                    importLoaders: 1,
                                    sourceMap: shouldUseSourceMap,
                                },
                            },
                            {
                                loader: require.resolve('postcss-loader'),
                                options: {
                                    ident: 'postcss',
                                    plugins: () => [autoprefixer()], // Adds vendor prefixing based on your specified browser support in
                                    sourceMap: shouldUseSourceMap,
                                },
                            },
                        ],
                    },
                    {
                        test: /\.(scss|sass)$/,
                        loader: [
                            MiniCssExtractPlugin.loader,
                            {
                                loader: require.resolve('css-loader'),
                                options: {
                                    importLoaders: 2,
                                    sourceMap: shouldUseSourceMap,
                                },
                            },
                            {
                                loader: require.resolve('postcss-loader'),
                                options: {
                                    ident: 'postcss',
                                    plugins: () => [autoprefixer()], // Adds vendor prefixing based on your specified browser support in
                                    sourceMap: shouldUseSourceMap,
                                },
                            },
                            {
                                loader: require.resolve('sass-loader'),
                                options: {
                                    includePaths: [path.resolve(paths.appSrc, 'styles')],
                                    data: `$baseUrl: "/";`,
                                    sourceMap: shouldUseSourceMap,
                                },
                            },
                        ],
                    },
                    {
                        test: /\.(ttf|eot|woff|woff2)$/,
                        use: {
                            loader: 'file-loader',
                            options: {
                                name: 'fonts/[name].[hash:8].[ext]',
                            },
                        },
                    },
                    // "file" loader makes sure assets end up in the `build` folder.
                    // When you `import` an asset, you get its filename.
                    // This loader doesn't use a "test" so it will catch all modules
                    // that fall through the other loaders.
                    {
                        loader: require.resolve('file-loader'),
                        // Exclude `js` files to keep "css" loader working as it injects
                        // it's runtime that would otherwise be processed through "file" loader.
                        // Also exclude `html` and `json` extensions so they get processed
                        // by webpacks internal loaders.
                        exclude: [/\.(js|jsx)$/, /\.html$/, /\.json$/],
                        options: {
                            name: 'media/[name].[hash:8].[ext]',
                        },
                    },
                    // ** STOP ** Are you adding a new loader?
                    // Make sure to add the new loader(s) before the "file" loader.
                ],
            },
        ],
    },
    plugins: [
        new webpack.HashedModuleIdsPlugin(),
        new ProgressBarPlugin(),
        new CleanWebpackPlugin(paths.appBuild, {
            root: paths.appPath,
        }),
        new CopyWebpackPlugin([{ from: paths.appPublic }]),
        // Generates an `index.html` file with the <script> injected.
        new HtmlWebpackPlugin({
            template: paths.appHtml,
            minify: {
                collapseWhitespace: true,
                removeRedundantAttributes: true,
            },
        }),
        new MiniCssExtractPlugin({
            filename: 'css/[name].[contenthash:8].css',
            chunkFilename: 'css/[name].[contenthash:8].chunk.css',
        }),
        new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
    ],
    performance: { hints: false },
    stats: {
        entrypoints: false,
        children: false,
        modules: false,
    },
};

if (ANALYZE === 'true') {
    config.plugins.push(new BundleAnalyzerPlugin());
}

module.exports = config;
