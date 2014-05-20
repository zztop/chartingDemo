'use strict';
var gulp = require('gulp'),
    jshint = require('gulp-jshint'),
    sass = require('gulp-sass'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    bowerDir = './client/bower_components/',
    newer = require('gulp-newer'),
    clean = require('gulp-clean');

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
        .pipe(uglify())
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


gulp.task('default', ['sass', 'scripts:req', 'scripts:lab', 'css:pure'], function() {
    gulp.watch('./client/scripts/*.js', ['scripts']);
    gulp.watch('./client/scss/*.scss', ['sass']);
});

gulp.task('build', ['clean'], function() {
    gulp.start('scripts:req', 'scripts:lab', 'sass', 'css:pure');
});
