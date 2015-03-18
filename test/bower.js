'use strict';

var Q = require('q');
var fs = require('fs');
var util = require('util');
var mout = require('mout');
var path = require('path');
var expect = require('chai').expect;

var optionsMock = require('./mocks/options');
var uiMock = require('./mocks/ui');

var BowerEndpoint = require(path.resolve('bower'));
var PackageAdapter = require(path.resolve('lib/adapters/PackageAdapter'));

describe('bower.js', function() {

	var bower = new BowerEndpoint(optionsMock, uiMock);

	it('instance', function () {

		expect(bower).to.be.instanceOf(BowerEndpoint);

	});

	/**
	 * Testing instance Methods
	 */
	describe('Methods', function(){

		var failResponse = { notfound: true };
		var noVersionedResponse = { versions : { latest: { hash: 'latest' } } };

		/**
		 * locate
		 */
		describe('#locate', function(){

			it('return Promise', function () {

				var promise = bower.locate();
				expect(Q.isPromise(promise)).to.be.true;

			});

			/** Validate Not Found Response **/
			var locateNotFound = function(locateExample){

				return function(done){
					bower.locate(locateExample)
						.then(function(resolved){
							expect(resolved).to.deep.equal(failResponse);
							done();
						})
				};
			};

			/** Validate Not Redirect Response **/
			var locateNotRedirect = function(locateExample){

				return function(done){
					bower.locate(locateExample)
						.then(function(resolved){
							expect(typeof resolved).to.be.equal('undefined');
							done();
						});
				};
			};

			/** Validate Redirect Response **/
			var locateRedirectTo = function(locateExample, dest){

				return function(done){
					bower.locate(locateExample)
						.then(function(resolved) {

							var expectedResponse = {
								redirect: (optionsMock.name + ':' + dest)
							};

							expect(resolved).to.deep.equal(expectedResponse);
							done();
						});
				};
			};

			describe('registered package resolve', function(){

				it('existing package (jquery)', locateNotRedirect('jquery'));
				it('not fount package (d223e1439188e478349d52476506c22e)', locateNotFound('d223e1439188e478349d52476506c22e'));

			});

			describe('git package resolve', function(){

				it('http protocol (http://gitlab.com/2fd/jspm-bower-endpoint-test.git)', locateNotRedirect('http://gitlab.com/2fd/jspm-bower-endpoint-test.git'));
				it('https protocol (https://gitlab.com/2fd/jspm-bower-endpoint-test.git)', locateNotRedirect('https://gitlab.com/2fd/jspm-bower-endpoint-test.git'));
				it.skip('ssh protocol (git@gitlab.com:2fd/jspm-bower-endpoint-test.git)', locateNotRedirect('git@gitlab.com:2fd/jspm-bower-endpoint-test.git'));
				
				it('not fount package (d223e1439188e478349d52476506c22e)', locateNotFound('d223e1439188e478349d52476506c22e'));

			});

			describe('local file resolve', function(){

				/** NOT REDIRECT **/
				it('explicitly relative to the project directory (file:./{file})',
					locateNotRedirect('file:./test/assets/bower-package/other.js')
				);
				it.skip('relative to the user directory (file:~/{file})'/*, locateNotRedirect(?)*/);
				it('absolute (file:/{file})',
					locateNotRedirect('file:' + path.resolve('./test/assets/bower-package/other.js') )
				);

				/** REDIRECT **/
				it('implicitly relative to the project directory (file:{file})',
					locateRedirectTo(
						'file:test/assets/bower-package/other.js',
						'file:./test/assets/bower-package/other.js'
					)
				);
				it('file protocol (absolute) (file://{file})',
					locateRedirectTo(
						'file:/' + path.resolve('./test/assets/bower-package/other.js'),
						'file:' + path.resolve('./test/assets/bower-package/other.js')
					)
				);
				//it.skip('not prefix implicit relative path ({file})') /* not supported*/
				it('not prefix explicit relative path (./{file})',
					locateRedirectTo(
						'./test/assets/bower-package/other.js',
						'file:./test/assets/bower-package/other.js'
					)
				);
				it.skip('not prefix relative to the user directory path (~/{file})' /*, locateRedirectTo(?) */);
				it('not prefix absolute path (/{file})',
					locateRedirectTo(
						path.resolve('./test/assets/bower-package/other.js'),
						'file:' + path.resolve('./test/assets/bower-package/other.js')
					)
				);

				/** NOT FOUND **/
				it('not fount', locateNotFound('./test/assets/bower-package/not-found.js'));

			});

			describe('local package resolve', function(){

				/** NOT REDIRECT **/
				it('explicitly relative to the project directory (file:./{package})',
					locateNotRedirect('file:./test/assets/bower-package')
				);
				it.skip('relative to the user directory (file:~/{package})'/*, locateNotRedirect(?)*/);
				it('absolute (file:/{package})',
					locateNotRedirect('file:' + path.resolve('./test/assets/bower-package'))
				);

				/** REDIRECT **/
				it('implicitly relative to the project directory (file:{package})',
					locateRedirectTo(
						'file:test/assets/bower-package',
						'file:./test/assets/bower-package'
					)
				);
				it('file protocol (absolute) (file://{package})',
					locateRedirectTo(
						'file:/' + path.resolve('./test/assets/bower-package/other.js'),
						'file:' + path.resolve('./test/assets/bower-package/other.js')
					)
				);
				//it.skip('not prefix implicit relative path ({package})'); /* not supported*/
				it('not prefix explicit relative path (./{package})',
					locateRedirectTo(
						'./test/assets/bower-package',
						'file:./test/assets/bower-package'
					)
				);
				it.skip('not prefix relative to the user directory path (~/{package})'/*, locateRedirectTo(?)*/);
				it('not prefix absolute path (/{package})',
					locateRedirectTo(
						path.resolve('./test/assets/bower-package'),
						'file:' +  path.resolve('./test/assets/bower-package')
					)
				);

				/** NOT FOUND **/
				it('not fount', locateNotFound('./test/assets/no-bower-package'));

			});
		});


		/**
		 * loockup
		 */
		describe('#loockup', function(){

			it('return Promise', function () {

				var promise = bower.lookup();
				expect(Q.isPromise(promise)).to.be.true;

			});

			var loockupVersionedResponse = function(lookup){

				return function(done){

					bower
						.lookup(lookup)
						.then(function( response ){

							expect(response).to.be.a('object');
							expect(response.versions).to.be.a('object');

							mout.object.forOwn( response.versions, function(val, key) {

								expect(val).to.be.a('object');
								expect(val).to.deep.equal( { hash: key } );

							});

							done();

						});

				};

			};

			var loockupNoVersionedResponse = function(lookup){

				return function (done) {
					bower
						.lookup(lookup)
						.then(function( response ){

							expect(response).to.deep.equal( noVersionedResponse );
							done();

						})
				};

			};

			/** Versioned Response */
			it('registered package (jquery)', loockupVersionedResponse('jquery'));
			it('http package (http://gitlab.com/2fd/jspm-bower-endpoint-test.git)', loockupVersionedResponse('http://gitlab.com/2fd/jspm-bower-endpoint-test.git'));
			it('https package (https://gitlab.com/2fd/jspm-bower-endpoint-test.git)', loockupVersionedResponse('https://gitlab.com/2fd/jspm-bower-endpoint-test.git'));
			it.skip('ssh package (git@gitlab.com:2fd/jspm-bower-endpoint-test.git)', loockupVersionedResponse('git@gitlab.com:2fd/jspm-bower-endpoint-test.git'));
				

			/** No Versioned Response */
			it('local file (file:./test/assets/bower-package/other.js)', loockupNoVersionedResponse('file:./test/assets/bower-package/other.js'));
			it('local package (file:./test/assets/bower-package)', loockupNoVersionedResponse('file:./test/assets/bower-package'));
		});




		/**
		 * download
		 */
		describe('#download', function(){


			var useCases = [

				{ skip: false,  it: 'registered package', version: '0.9.0',  pkg : 'async'},
				{ skip: false,  it: 'http package', 		version: '1.0.0',  pkg : 'http://gitlab.com/2fd/jspm-bower-endpoint-test.git'},
				{ skip: false,  it: 'https package', 		version: '1.0.0',  pkg : 'https://gitlab.com/2fd/jspm-bower-endpoint-test.git'},
				{ skip: true,  it: 'ssh package', 		version: '1.0.0',  pkg : 'git@gitlab.com:2fd/jspm-bower-endpoint-test.git'},
				{ skip: false,  it: 'local file', 		version: 'latest', pkg : 'file:./test/assets/bower-package/other.js' },
				{ skip: false,  it: 'local package', 		version: 'latest', pkg : 'file:./test/assets/bower-package' }

			];

			var installBase = path.resolve('test/assets/install');

			var installpath = function(usecase){

				return installBase + '/'+ usecase.pkg + '@' + usecase.version;

			};

			var bowerDownload = function(usecase){

				return bower.download(usecase.pkg, usecase.version, usecase.version, undefined, installpath(usecase))

			};


			mout.array.forEach(useCases, function(usecase){

				var test = usecase.skip ? it.skip : it;
				
				test(
					util.format('%s (%s@%s)', usecase.it, usecase.pkg, usecase.version),
					function(done){
						this.timeout(0);

						bowerDownload(usecase)
						.then(function(installed){

							expect(installed).to.be.instanceOf(PackageAdapter);

							var file = installpath(usecase) + '/.bower.json';
							expect(fs.statSync( file ).isFile()).to.be.true;
							expect( require(file) ).to.be.a('object');
							done();

						});
					});

			});

		});
	});
});