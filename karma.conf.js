var webpackConfig = require("./webpack.dev");

module.exports = function(config) {
    config.set({
        basePath: "",
        frameworks: ["mocha", "chai", "sinon"],
        files: ["test/*.ts"],
        exclude: [],
        preprocessors: {
            "test/**/*.ts": ["webpack"]
        },
        webpack: {
            mode: webpackConfig.mode,
            module: webpackConfig.module,
            resolve: webpackConfig.resolve
        },
        reporters: ENVIRONMENT === "production" ? ["mocha-junit-reporter"] :["mocha"],
        port: 9876,
        colors: true,
        logLevel: config.LOG_INFO,
        autoWatch: true,
        browsers: ["PhantomJS"],
        singleRun: false,
        concurrency: Infinity
    });
};