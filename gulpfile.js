var gulp = require('gulp');
// var sass = require('gulp-sass');
// var autoprefixer = require('gulp-autoprefixer');
var watch = require('gulp-watch');
var browserSync = require('browser-sync').create();


gulp.task('default', function() {
    browserSync.init({
        server: "./"
    });
    // gulp.watch('sass/**/*.scss', ['styles']);
    gulp.watch('*.html').on('change', browserSync.reload);
    gulp.watch('*/**/*.js').on('change', browserSync.reload);
    console.log("Hello");
});

// gulp.task('styles', function() {
//     gulp.src('sass/**/*.scss')
//         .pipe(sass().on('error', sass.logError ))
//         .pipe(autoprefixer({
//             browsers: ['last 2 versions']
//         }))
//         .pipe(browserSync.stream())
//         .pipe(gulp.dest('./css'));
// });
