module.exports = require('babel-jest').createTransformer({
    presets: [require.resolve('@babel/preset-env'), require.resolve('@babel/preset-react')],
    plugins: [
        require.resolve('@babel/plugin-proposal-export-namespace-from'),
        require.resolve('@babel/plugin-syntax-dynamic-import'),
        [require.resolve('@babel/plugin-proposal-class-properties'), { loose: true }],
    ],
});
