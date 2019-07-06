'use strict';

var path = require('path');
var gulp = require('gulp');
var conf = require('./conf');

var $ = require('gulp-load-plugins')({
  pattern: ['gulp-*', 'main-bower-files']
});



gulp.task('import-fb', function(){
  return gulp.src($.mainBowerFiles('**/firebase.js'))
        .pipe($.flatten())
        .pipe(gulp.dest(path.join(conf.paths.dist)));
});

gulp.task('notification-sw',['import-fb'], function(){
  return gulp.src([path.join(conf.paths.src, 'notification.sw.js'), path.join(conf.paths.src,'manifest.json')])
        .pipe($.flatten())
        .pipe($.replace('/bower_components/firebase/firebase.js', 'firebase.js'))
        .pipe(gulp.dest(path.join(conf.paths.dist)));
});

