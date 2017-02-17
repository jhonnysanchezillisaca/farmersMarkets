var gulp = require('gulp');
var sass = require('gulp-sass');
// var autoprefixer = require('gulp-autoprefixer');
var watch = require('gulp-watch');
var browserSync = require('browser-sync').create();


gulp.task('default', function() {
    browserSync.init({
        server: './'});
    gulp.watch('src/sass/**/*.scss', ['styles']);
    gulp.watch('*.html').on('change', browserSync.reload);
    gulp.watch('*/**/*.js').on('change', browserSync.reload);
    console.log('Hello');
});

gulp.task('styles', function() {
    gulp.src('src/sass/**/*.scss')
        .pipe(sass().on('error', sass.logError ))
        .pipe(browserSync.stream())
        .pipe(gulp.dest('src/css'));
});
