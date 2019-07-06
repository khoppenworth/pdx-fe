'use strict';

var gulp = require('gulp');
var conf = require('./conf');
var path = require('path');
var gulpNgConfig = require('gulp-ng-config');

/*
 * This task uses the file "config.json".
 * It parses it and generates "src/app/config.js" which is an angular module ("pdx.config")
 * This contains a constant declaration "EnvironmentConfig" which could hold various
 * Environmental configuration for the app in the build process according to
 * the configurations in "config.json"
 *
 * see https://www.npmjs.com/package/gulp-ng-config for more details.
 *
 *
 * */

// This generates the development(local) configuration file
// src/app/config.js
// Which outputs angular module "pdx.config"
// This task is used by the task "build:development"
gulp.task('generateDevelopmentLocalConfig', function() {
    gulp.src('config.json')
        .pipe(gulpNgConfig('pdx.config', {
            environment: ['env.development.local', 'global']
        }))
        .pipe(gulp.dest(path.join(conf.paths.src, '/app/')));
});