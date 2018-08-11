const path = require('path');

module.exports = {
    roots: ['<rootDir>/src/', '<rootDir>/test'],
    testEnvironment: 'jest-environment-jsdom',
    moduleDirectories: ['node_modules', path.join(__dirname, 'src'), path.join(__dirname, 'test', 'setup')],
    moduleNameMapper: {
        '\\.(css|scss)$': '<rootDir>/test/setup/style-mock.js',
        '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
            '<rootDir>/test/setup/fileMock.js',
    },
    watchPlugins: ['jest-watch-typeahead/filename', 'jest-watch-typeahead/testname'],
    setupTestFrameworkScriptFile: require.resolve('./test/setup/setup-tests.js'),
    transform: {
        '^.+\\.(js|jsx)$': '<rootDir>/test/setup/jest-transform.js',
    },
    collectCoverageFrom: ['**/src/**/*.(js|jsx)'],
    coverageThreshold: {
        global: {
            statements: 12,
            branches: 8,
            functions: 12,
            lines: 12,
        },
    },
    coveragePathIgnorePatterns: ['/node_modules/', '/__tests__/'],
    testMatch: ['**/test/**/*.js?(x)', '**/?(*.)+(spec|test).js?(x)'],
    testPathIgnorePatterns: ['<rootDir>/test/setup'],
    reporters: ['default'],
};
