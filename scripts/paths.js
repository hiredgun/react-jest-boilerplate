const path = require('path');

const resolveApp = (relativePath) => path.resolve(__dirname, '..', relativePath);

module.exports = {
    appPath: resolveApp('.'),
    appBuild: resolveApp('dist'),
    appPublic: resolveApp('public'),
    appHtml: resolveApp('public/index.html'),
    appIndexJs: resolveApp('src/index.jsx'),
    appPackageJson: resolveApp('package.json'),
    appSrc: resolveApp('src'),
    appNodeModules: resolveApp('node_modules'),
};

module.exports.srcPaths = [module.exports.appSrc];
