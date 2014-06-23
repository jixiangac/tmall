var gulp = require('gulp');
var less = require('gulp-less');
var path = require('path');

var paths = {
  css: ['./src/less/style.less', './src/']
};

gulp.task('less', function () {
  gulp.src('./src/less/style.less')
    .pipe(less({
      paths: [ path.join(__dirname, 'less', 'includes') ]
    }))
    .pipe(gulp.dest('./src/'));
});

gulp.task('watch', function() {
  gulp.watch(paths.css, ['less']);
});

gulp.task('default', ['less']);