'use strict';

var Q = require('q');
var mout = require('mout');
var path = require('path');
var expect = require('chai').expect;

var optionsMock = require('./mocks/options');
var uiMock = require('./mocks/options');

var BowerEndpoint = require(path.resolve('bower'));

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

            /**
             * Registered package name (jquery)
             */
            describe('registered package', function (done) {

                bower
                    .lookup('jquery')
                    .then(function( response ){

                        expect(response).to.be.a('object');
                        expect(response.versions).to.be.a('object');

                        mout.object.forOwn( response.versions, function(val, key) {

                            expect(val).to.be.a('object');
                            expect(val).to.deep.equal( { hash: key } );

                        });

                        done();

                    });
            });

            /**
             * Local file dir
             */
            it('local file', function(done){

                bower
                    .lookup('file:./test/assets/bower-package/other.js')
                    .then(function( response ){

                        expect(response).to.deep.equal( noVersionedResponse );
                        done();

                    })
            });

            /**
             * Local package dir
             */
            it('local package', function(done){

                bower
                    .lookup('file:./test/assets/bower-package')
                    .then(function( response ){

                        expect(response).to.deep.equal( noVersionedResponse );
                        done();

                    })
            });
        });
    });
});