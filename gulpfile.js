var gulp = require('gulp');

// plugins
var mocha = require('gulp-mocha');
var using = require('gulp-using');
var del = require('del');

gulp.task('del', function(){
	del.sync(['test/assets/install/*', '!test/assets/install/.gitkeep']);
});

gulp.task('test', ['del'], function(){

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