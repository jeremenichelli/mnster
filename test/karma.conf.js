// karma.conf.js
module.exports = function(config) {
    config.set({
        files: [ '../src/mnster.js', '../test/mnster.spec.js' ],
        browsers: [ 'PhantomJS' ],
        frameworks: [ 'jasmine' ],
        reporters: [ 'spec' ]
    });
};