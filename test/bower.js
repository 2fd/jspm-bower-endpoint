'use strict';

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
        var localPackageRedirect, localFileRedirect;

        /**
         * locate
         */
        describe('#locate', function(){

            it('is function', function () {

                expect(bower.locate).to.be.a('function');

            });

            it('return Promise', function () {

                var promise = bower.locate();
                expect(promise).to.has.property('then');
                expect(promise.then).to.be.a('function');

            });


            /**
             * Registered package name (jquery)
             */
            it('registered package name', function (done) {

                bower
                    .locate('jquery')
                    .then(function( response ){

                        expect(response).to.be.undefined;
                        done();

                    });
            });

            it('redirect local file', function (done) {

                bower
                    .locate('./test/assets/bower-package/other.js')
                    .then(function(response){

                        expect(response).to.be.a('object');
                        expect(response.redirect).to.be.equal('bower:package/local/other.js');
                        localFileRedirect = 'package/local/other.js';
                        done();

                    });
            });

            it('redirect local package', function (done) {

                bower
                    .locate('./test/assets/bower-package')
                    .then(function(response){

                        expect(response).to.be.a('object');
                        expect(response.redirect).to.be.equal('bower:package/local/bower-package');
                        localPackageRedirect = 'package/local/bower-package';
                        done();

                    });
            });

            it('resolve local redirection', function(done){

                bower
                    .locate(localPackageRedirect)
                    .then(function( response ){

                        expect(response).to.be.undefined;
                        done();

                    })
            });


            /**
             * Not found package
             */
            it('not found package', function (done) {

                bower
                    .lookup('d223e1439188e478349d52476506c22e' /* md5 jquery */)
                    .then(function( response ){

                        expect(response).to.be.a('object');
                        expect(response).to.deep.equal( failResponse );
                        done();

                    });
            });

            /**
             * Not found file
             */
            it('file (not found)', function(done){

                bower
                    .locate('./test/assets/bower-package/not-found.js')
                    .then(function( response ){

                        expect(response).to.be.a('object');
                        expect(response).to.deep.equal( failResponse );
                        done();

                    })
            });

            /**
             * Not found dir dir
             */
            it('local package (not found)', function(done){

                bower
                    .locate('./test/assets/no-bower-package')
                    .then(function( response ){

                        expect(response).to.be.a('object');
                        expect(response).to.deep.equal( failResponse );
                        done();

                    })
            });
        });


        /**
         * loockup
         */
        describe('#loockup', function(){

            it('is function', function () {

                expect(bower.lookup).to.be.a('function');

            });

            it('return Promise', function () {

                var promise = bower.lookup();
                expect(promise).to.has.property('then');
                expect(promise.then).to.be.a('function');

            });

            /**
             * Registered package name (jquery)
             */
            it('registered package name', function (done) {

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
            it('file', function(done){

                bower
                    .lookup(localFileRedirect)
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
                    .lookup(localPackageRedirect)
                    .then(function( response ){

                        expect(response).to.deep.equal( noVersionedResponse );
                        done();

                    })
            });
        });
    });
});