const path = require('path');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const autoprefixer = require('autoprefixer');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const ProgressBarPlugin = require('progress-bar-webpack-plugin');
const paths = require('./paths');

const { NODE_ENV } = process.env;

const publicPath = '/';

const config = {
    mode: 'development',
    devServer: {
        historyApiFallback: true,
        contentBase: paths.appBuild,
        port: 8000,
        hot: true,
        quiet: true,
    },
    devtool: 'cheap-module-source-map',
    entry: ['@babel/polyfill', 'react-hot-loader/patch', paths.appIndexJs],
    output: {
        pathinfo: true,
        path: paths.appBuild,
        filename: 'js/bundle.js',
        chunkFilename: 'js/[name].chunk.js',
        publicPath,
    },
    optimization: {
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
                            {
                                loader: require.resolve('thread-loader'),
                                options: {
                                    poolTimeout: Infinity, // keep workers alive for more effective watch mode
                                },
                            },
                            {
                                loader: require.resolve('babel-loader'),
                                options: {
                                    presets: [
                                        [require.resolve('@babel/preset-env'), { modules: false }],
                                        require.resolve('@babel/preset-react'),
                                    ],
                                    plugins: [
                                        require.resolve('babel-plugin-lodash'),
                                        require.resolve('react-hot-loader/babel'),
                                        require.resolve('@babel/plugin-proposal-export-namespace-from'),
                                        require.resolve('@babel/plugin-syntax-dynamic-import'),
                                        [require.resolve('@babel/plugin-proposal-class-properties'), { loose: true }],
                                    ],
                                    // This is a feature of `babel-loader` for webpack (not Babel itself).
                                    // It enables caching results in ./node_modules/.cache/babel-loader/
                                    // directory for faster rebuilds.
                                    cacheDirectory: true,
                                    highlightCode: true,
                                },
                            },
                        ],
                    },
                    // "postcss" loader applies autoprefixer to CSS.
                    // "css" loader resolves paths in CSS and adds assets as dependencies.
                    {
                        test: /\.css$/,
                        loader: [
                            require.resolve('style-loader'),
                            {
                                loader: require.resolve('css-loader'),
                                options: {
                                    importLoaders: 1,
                                    sourceMap: true,
                                },
                            },
                            {
                                loader: require.resolve('postcss-loader'),
                                options: {
                                    ident: 'postcss',
                                    plugins: () => [autoprefixer()],
                                    sourceMap: true, // Adds vendor prefixing based on your specified browser support in
                                },
                            },
                        ],
                    },
                    {
                        test: /\.(scss|sass)$/,
                        loader: [
                            require.resolve('style-loader'),
                            {
                                loader: require.resolve('css-loader'),
                                options: {
                                    importLoaders: 2,
                                    sourceMap: true,
                                },
                            },
                            {
                                loader: require.resolve('postcss-loader'),
                                options: {
                                    ident: 'postcss',
                                    plugins: () => [autoprefixer()], // Adds vendor prefixing based on your specified browser support in
                                    sourceMap: true,
                                },
                            },
                            {
                                loader: require.resolve('sass-loader'),
                                options: {
                                    includePaths: [path.resolve(paths.appSrc, 'styles')],
                                    data: `$baseUrl: "/";`,
                                    sourceMap: true,
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
        new HtmlWebpackPlugin({
            template: paths.appHtml,
        }),
        new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
        new webpack.HotModuleReplacementPlugin(),
    ],
    performance: { hints: false },
    stats: {
        entrypoints: false,
        children: false,
        modules: false,
    },
};

module.exports = config;
