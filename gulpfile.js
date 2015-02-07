'use strict';
var gulp = require('gulp'),
    jshint = require('gulp-jshint'),
    sass = require('gulp-sass'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    bowerDir = './client/bower_components/',
    newer = require('gulp-newer'),
    clean = require('gulp-clean'),
    rework = require('rework'),
    pureGrids = require('rework-pure-grids'),
    fs = require('fs');



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


gulp.task('scripts:req', function() {
    //if (process.env.NODE_ENV === 'test') {}
    return gulp.src('./client/scripts/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default'))
        .pipe(concat('output.js'))
        //.pipe(uglify())
        .pipe(gulp.dest('./client/dst/scripts'));
});

gulp.task('scripts:lab', function() {
    gulp.src(bowerDir + 'labjs/LAB.js')
        .pipe(newer('./client/dst/scripts/libs/LAB.js'))
        .pipe(uglify())
        .pipe(gulp.dest('./client/dst/scripts'));
});

gulp.task('clean', function() {
    return gulp.src('./client/dst', {
        read: false
    }).pipe(clean({
        force: true
    }));
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


gulp.task('default', ['sass', 'scripts:req', 'scripts:lab', 'css:pure'], function() {
    gulp.watch('./client/scripts/*.js', ['scripts:req']);
    gulp.watch('./client/scss/*.scss', ['sass']);
});

gulp.task('build', ['clean'], function() {
    gulp.start('scripts:req', 'scripts:lab', 'sass', 'css:pure', 'css:pure-grid');
});
