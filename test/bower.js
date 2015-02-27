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

            })

            /**
             * Not found package
             */
            it('Not found package', function (done) {

                bower
                    .lookup('d223e1439188e478349d52476506c22e' /* md5 jquery */)
                    .then(function( response ){

                        expect(response).to.be.a('object');
                        expect(response).to.deep.equal({ notfound: true });
                        done();

                    });
            });

            /**
             * Registered package name (jquery)
             */
            it('Registered package name', function (done) {

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
            //*/

        });

    });



})