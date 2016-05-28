var gulp = require('gulp'),
lint = require('gulp-jshint'),

paths = {
   nodeScripts: 'app/**/*.js'
};

gulp.task('lint', function() {
   return gulp.src(paths.nodeScripts)
      .pipe(lint())
      .pipe(lint.reporter('jshint-reporter-jscs'));
});

gulp.task('watch', function() {
   gulp.watch(paths.nodeScripts, ['lint'])
});

gulp.task('default', ['watch', 'lint'])
