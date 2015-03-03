var gulp = require('gulp');

// plugins
var mocha = require('gulp-mocha');
var using = require('gulp-using');

gulp.task('test', function(){

	return gulp.src([
		'test/**/*.js',
		'!test/assets/**/*',
		'!test/mocks/**/*'
	], {read:false})
		.pipe(using())
		.pipe(mocha({
			timeout: 10000, // 10s
			reporter: 'spec',
			ui: 'bdd'
		}));

});

gulp.task('mocha', function(){

	return gulp.watch('test/**/*', ['test']);
});