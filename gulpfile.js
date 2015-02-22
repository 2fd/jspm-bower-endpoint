var gulp = require('gulp');

// plugins
var mocha = require('gulp-mocha');

gulp.task('test', function(){

    return gulp.src('test/**/*.js', {read:false})
        .pipe(mocha({
            reporter: 'spec',
            ui: 'bdd'
        }))
        //.on('error', gutil.log);;

});

gulp.task('mocha', function(){

    return gulp.watch('test/**/*', ['test']);
});