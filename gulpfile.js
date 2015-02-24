'use strict';
var gulp = require('gulp'),
    jshint = require('gulp-jshint'),
    sass = require('gulp-sass'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    bowerDir = './client/bower_components/',
    newer = require('gulp-newer'),
    rework = require('rework'),
    pureGrids = require('rework-pure-grids'),
    fs = require('fs'),
    browserify = require('browserify'),
    gutil = require('gulp-util'),
    gulpif = require('gulp-if'),
    del = require('del'),
    vinylPaths = require('vinyl-paths'),
    source = require('vinyl-source-stream'),
    streamify = require('gulp-streamify'),
    nodeDir = './node_modules',
    reactify = require('reactify');

process.env.NODE_ENV = 'test'; //default env

gulp.task('sass', function() {
    return gulp.src('./client/scss/*.scss')
        .pipe(sass())
        .pipe(gulp.dest('./client/dst/css'));
});

gulp.task('css:pure', function() {
    var pureDir = bowerDir + 'pure/';
    return gulp.src([pureDir + 'base.min.css',
            pureDir + 'buttons.min.css',
            pureDir + 'grids-min.css',
            pureDir + 'menus-min.css'
        ])
        .pipe(newer('./client/dst/css/pure.css'))
        .pipe(concat('pure.css'))
        .pipe(gulp.dest('./client/dst/css'));
});

gulp.task('css:chartist', function() {
    var chartDir = nodeDir + '/chartist/dist/';
    return gulp.src([chartDir + 'chartist.min.css'])
        .pipe(newer('./client/dst/css/chartist.min.css'))
        .pipe(gulp.dest('./client/dst/css'));
});


gulp.task('clean', function() {
    return gulp.src('./client/dst', {
        read: false
    }).pipe(vinylPaths(del));
});

gulp.task('css:pure-grid', function() {
    fs.writeFileSync('./client/tmp/pure-grid.css', rework('').use(pureGrids.units(6, {
        mediaQueries: {
            sm: 'screen and (min-width: 35.5em)', // ≥ 568px
            md: 'screen and (min-width: 48em)', // 768px
            lg: 'screen and (min-width: 64em)', // 1024px
            xl: 'screen and (min-width: 80em)' // 1280px
        }
    })).toString());
    return gulp.src('./client/tmp/pure-grid.css')
        .pipe(gulp.dest('./client/dst/css'));
});

var browserifyTask = function(options) {

    var appBundler = browserify({
        entries: [options.src],
        transform: [reactify],
        debug: options.development, // Sourcemapping
        cache: {},
        packageCache: {}
    });

    var start = Date.now();
    console.log('Building APP bundle');

    appBundler.bundle()
        .on('error', gutil.log)
        .pipe(source('main.js'))
        .pipe(gulpif(!options.development, streamify(uglify())))
        .pipe(gulp.dest(options.dest));
}



/*gulp.task('scripts:vendor', function() {
    gulp.src(bowerDir + 'labjs/LAB.js')
        .pipe(newer('./client/dst/scripts/libs/*.js'))
        .pipe(uglify())
        .pipe(gulp.dest('./client/dst/scripts'));

    browserifyTask({
        src: './client/scripts/main.js',
        development: process.env.NODE_ENV === 'test',
        dest: './client/dst/scripts'
    });
});*/

gulp.task('scripts:req', function() {
    browserifyTask({
        src: './client/scripts/main.js',
        development: process.env.NODE_ENV === 'test',
        dest: './client/dst/scripts'
    });
});

gulp.task('jshint', function() {
    return gulp.src('./client/scripts/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});


gulp.task('default', ['sass', 'jshint', 'scripts:req', 'css:pure', 'css:chartist'], function() {
    gulp.watch('./client/scripts/*.js', ['jshint', 'scripts:req']);
    gulp.watch('./client/scss/*.scss', ['sass']);
});

gulp.task('build', ['clean'], function() {
    process.env.NODE_ENV = 'prod';
    gulp.start('jshint', 'scripts:req', 'sass', 'css:pure', 'css:pure-grid', 'css:chartist');
});
