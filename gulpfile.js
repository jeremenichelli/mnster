// modules
var gulp = require('gulp'),
    gutil = require('gulp-util'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    concat = require('gulp-concat-util'),
    jshint = require('gulp-jshint'),
    karma = require('gulp-karma'),
    package = require('./package.json');

// header
var header = '// ' + package.title + ' - ' + package.author + '\n' 
    + '// ' + package.repository.url + ' - MIT License\n\n';

// paths
var paths = {
    src: 'src/' + package.name + '.js',
    dist: 'dist/' + package.name + '.js',
    spec: 'test/' + package.name + '.spec.js',
    output: 'dist/'
}

gulp.task('hint', function () {
    return gulp.src(paths.src)
        .pipe(jshint())
        .pipe(jshint.reporter('jshint-stylish'))
        .pipe(jshint.reporter('fail'));
});

gulp.task('test', ['hint'], function () {
    gutil.log(gutil.colors.bgGreen('JSHint passed'));

    return gulp.src([paths.spec, paths.src])
        .pipe(karma({configFile: 'test/karma.conf.js'}))
});


gulp.task('minify', ['test'], function () {
    gutil.log(gutil.colors.bgGreen('All tests passed'));

    return gulp.src(paths.src)
        .pipe(concat.header(header))
        .pipe(gulp.dest(paths.output))
        .pipe(uglify())
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(gulp.dest(paths.output));
});

gulp.task('default', [ 'minify' ]);