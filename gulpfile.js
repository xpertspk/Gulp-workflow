// Load plugins
var gulp = require('gulp'),
    gutil = require('gulp-util'),
    watch = require('gulp-watch'),
    prefix = require('gulp-autoprefixer'),
    size = require('gulp-size'),
    rename = require('gulp-rename'),
    minifyCSS = require('gulp-minify-css'),
    sass = require('gulp-ruby-sass'),
    csslint = require('gulp-csslint'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    imagemin = require('gulp-imagemin');
    pngcrush = require('imagemin-pngcrush');
    browserSync = require('browser-sync'),
    browserReload = browserSync.reload;


// Minify all css files in the css directory
// Run this in the root directory of the project with `gulp minify-css `
gulp.task('minify-css', function(){
  gulp.src('./css/style.css')
    .pipe(minifyCSS({keepSpecialComments: 0}))
    .pipe(rename('style.min.css'))
    .pipe(size({gzip:true, showFiles: true}))
    .pipe(gulp.dest('./css/'));
});

// Use csslint without box-sizing or compatible vendor prefixes (these
// don't seem to be kept up to date on what to yell about)
gulp.task('csslint', function(){
  gulp.src('./css/style.css')
    .pipe(csslint({
          'compatible-vendor-prefixes': false,
          'box-sizing': false,
          'important': false,
          'known-properties': false
        }))
    .pipe(csslint.reporter());
});

// Task that compiles scss files down to good old css
gulp.task('pre-process', function(){
  gulp.src('./src/sass/style.scss')
      .pipe(watch(function(files) {
        return files.pipe(sass({style:'expanded'}))
          .pipe(prefix())
          .pipe(size({gzip:true, showFiles: true}))
          .pipe(gulp.dest('./css/'))
          .pipe(browserSync.reload({stream:true}));
      }));
});

// Task that and minifies and concatanates JS files in one single file
gulp.task('js', function(){
  return gulp.src('./src/js/*.*')
    .pipe(concat('app.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('./js/'));
});

// minify new images
gulp.task('imagemin', function () {
    return gulp.src('src/images/*')
        .pipe(imagemin({
            progressive: true,
            interlaced: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngcrush()]
        }))
        .pipe(gulp.dest('images'));
});

// Initialize browser-sync which starts a static server also allows for
// browsers to reload on filesave
gulp.task('browser-sync', function() {
    browserSync.init(null, {
        server: {
            baseDir: "./"
        }
    });
});

// Function to call for reloading browsers
gulp.task('bs-reload', function () {
    browserSync.reload();
});

/*
   DEFAULT TASK

 • Process sass then auto-prefixes and lints outputted css
 • Starts a server on port 3000
 • Reloads browsers when you change html or sass files

*/
gulp.task('default', ['pre-process', 'minify-css', 'js', 'imagemin', 'bs-reload', 'browser-sync'], function(){
  gulp.start('pre-process', 'csslint');
  gulp.watch('src/sass/*.scss', ['pre-process', 'minify-css']);
  gulp.watch('src/js/*.js', ['js']);
  gulp.watch('src/images/**/*', ['imagemin']);
  gulp.watch('css/*.css', ['bs-reload']);
  gulp.watch('*.html', ['bs-reload']);
});