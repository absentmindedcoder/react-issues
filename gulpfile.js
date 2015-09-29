var gulp = require('gulp');
var reactify = require('reactify');
var jshint = require('gulp-jshint');
var browserify = require('browserify');
var watchify = require('watchify');
var source = require('vinyl-source-stream');
var stylish = require('jshint-stylish');
var uglify = require('gulp-uglify');
var buffer = require('vinyl-buffer');
var babelify = require('babelify');

gulp.task('lint', function(){
  return gulp.src('./app/**/*.js')
    .pipe(jshint({linter: require('jshint-jsx').JSXHINT}))
    .pipe(jshint.reporter(stylish))
    .pipe(jshint.reporter('fail'));
});

gulp.task('browserify-dev', ['lint'], function() {
    var bundler = browserify({
        entries: ['./app/main-dev.js'],
        transform: [reactify, babelify],
        debug: true,
        cache: {}, packageCache: {}, fullPaths: true
    });
    var watcher = watchify(bundler);

    return watcher.on('update', function () {
        var updateStart = Date.now();
        console.log('Updating!');
        watcher.bundle()
        .pipe(source('main.js'))
        .pipe(gulp.dest('./app/build/'));
        console.log('Updated!', (Date.now() - updateStart) + 'ms');
    })
    .bundle()
    .pipe(source('main.js'))
    .pipe(gulp.dest('./app/build/'));
});

gulp.task('browserify-prod', ['lint'], function() {
    return browserify({
        entries: ['./app/main.js'],
        transform: [reactify, babelify],
        debug: true,
        cache: {}, packageCache: {}, fullPaths: true
    })
    .bundle()
    .pipe(source('main.js'))
    .pipe(buffer())
    .pipe(uglify())
    .pipe(gulp.dest('./app/build/'));
});


//gulp.task('css', function () {
//    gulp.watch('styles/**/*.css', function () {
//        return gulp.src('styles/**/*.css')
//        .pipe(concat('main.css'))
//        .pipe(gulp.dest('build/'));
//    });
//});

gulp.task('dev', ['browserify-dev']);
gulp.task('build', ['browserify-prod']);
