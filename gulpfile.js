var gulp = require('gulp'),
lint = require('gulp-jshint'),
mocha = require('gulp-spawn-mocha'),

paths = {
   nodeScripts: 'app/**/*.js',
   testScripts: 'app/tests/unit/server/**/*.js'
};

gulp.task('lint', function() {
   return gulp.src(paths.nodeScripts)
      .pipe(lint())
      .pipe(lint.reporter('jshint-reporter-jscs'));
});

gulp.task('mocha', function() {
   return gulp.src(paths.testScripts)
      .pipe(mocha({reporter: 'spec'}))
      .once('error', function(err) {
         console.log(err);
         this.emit('end');
      });
});

gulp.task('watch', function() {
   gulp.watch(paths.nodeScripts, ['lint']);
});

gulp.task('mocha-watch', function() {
   gulp.watch(paths.nodeScripts, ['mocha']);
});

gulp.task('default', ['watch', 'lint']);

gulp.task('test', ['mocha-watch', 'mocha']);
