'use strict';

var gulp = require('gulp');
var babel = require('gulp-babel');
var Server = require('karma').Server;

gulp.task('scripts', function() {
  return gulp.src('src/eventrino.js')
    .pipe(babel())
    .pipe(gulp.dest('lib'));
});

gulp.task('test', function(done) {
  new Server({
    configFile: __dirname + '/karma.conf.js',
    singleRun: true
  }, done).start();
});