var path = require('path');
var mout = require('mout');
var expect = require('chai').expect;
var PackageAdapter = require(path.resolve('lib/adapters/PackageAdapter'));

describe('adapters/PackageAdapter', function(){

    it('is a constructor', function(){

        expect(PackageAdapter).to.be.a('function');
        expect(new PackageAdapter({})).to.be.instanceof(PackageAdapter);

    });

    it('used as function return an instance', function(){

        expect(PackageAdapter({})).to.be.instanceof(PackageAdapter);

    });

    describe('adapting properties', function(){

        /*********************************
         ********* Testing cases *********
         ********************************/
        var bower = {
            jquery :        PackageAdapter( require('../assets/jquery.bower.json'),             'endpoint' ),
            jqueryplugin :  PackageAdapter( require('../assets/jquery-placeholder.bower.json'), 'endpoint' ),
            bootstrap :     PackageAdapter( require('../assets/bootstrap.bower.json'),          'endpoint' ),
            materialize :   PackageAdapter( require('../assets/materialize.bower.json'),        'endpoint' ),
            skeleton :      PackageAdapter( require('../assets/skeleton.bower.json'),           'endpoint' ),
            mocha :         PackageAdapter( require('../assets/mocha.bower.json'),              'endpoint' ),
            immutable :   PackageAdapter( require('../assets/immutable-js.bower.json'),       'endpoint' ),
            fontawesome :   PackageAdapter( require('../assets/font-awesome.bower.json'),       'endpoint' )
        };

        /**
         * @property {string} name
         * @require - same value
         */
        it('#name', function(){
            expect(bower.jquery.name).to.be.equal('jquery');
        });

        /**
         * @property {string} description
         * @optional - same value
         */
        it('#description', function(){
            expect(bower.jquery.description).to.be.undefined;
            expect(bower.bootstrap.description).to.be.equal("The most popular front-end framework for developing responsive, mobile first projects on the web.");
        });

        /**
         * @property {string} version
         * @optional - same value
         */
        it('#version', function(){
            expect(bower.immutable.version).to.be.undefined;
            expect(bower.bootstrap.version).to.be.equal('3.3.2');
        });

        /**
         * @property {string} license
         * @optional
         *  1 license - same value
         *  more than one license - concatenated value
         */
        it('#license', function(){
            expect(bower.bootstrap.license).to.be.undefined;
            expect(bower.jquery.license).to.be.equal('MIT');
            expect(bower.fontawesome.license).to.be.equal('OFL-1.1,MIT,CC-BY-3.0');
        });

        /**
         * @property {string} keywords
         * @optional
         *  1 license - same value
         *  more than one license - concatenated value
         */
        it('#keywords', function(){
            expect(bower.fontawesome.keywords).to.be.undefined;
            expect(bower.jquery.keywords).to.deep.equal(["jquery","javascript","library"]);
        });

        /**
         * @property {string} main
         * @optional
         *  string - same value
         *  array - filter and concatenated .js file
         */
        it('#main', function(){
            expect(bower.fontawesome.main).to.be.undefined;
            expect(bower.jquery.main).to.be.equal('dist/jquery.js');
            expect(bower.jqueryplugin.main).to.be.equal('jquery.placeholder.js');
            expect(bower.mocha.main).to.be.equal('mocha.js');
            expect(bower.bootstrap.main).to.be.equal('dist/js/bootstrap.js');
        });

        /**
         * @property {string} homepage
         * @optional - same value
         */
        it('#homepage', function(){
            expect(bower.jquery.homepage).to.be.undefined;
            expect(bower.mocha.homepage).to.be.equal('http://mocha.github.io/mocha');
        });

        /**
         * @property {object} dependencies
         * @optional
         *   - add "endpoint:" prefix  to dependencies
         *   - if main property include css files add "css-pluging" with dependencies
         */
        it('#dependencies', function(){

            // no dependencies
            expect(bower.jquery.dependencies).to.deep.equal({});

            // only js dependencies
            expect(bower.jqueryplugin.dependencies).to.deep.equal({
                "endpoint:jquery":">=1.6"
            });

            // only css dependencies
            expect(bower.skeleton.dependencies).to.deep.equal({
                "css-plugin": "*"
            });

            // js and css dependencies
            expect(bower.bootstrap.dependencies).to.deep.equal({
                "endpoint:jquery": ">= 1.9.1",
                "css-plugin": "*"
            });
        });

        /**
         * @property {object} devDependencies
         * @optional
         *   - add "endpoint:" prefix  to dependencies
         */
        it('#devDependencies', function(){

            // no dependencies
            expect(bower.bootstrap.devDependencies).to.deep.equal({});

            // only js dependencies
            expect(bower.jquery.devDependencies).to.deep.equal({
                "endpoint:sizzle": "2.1.1-jquery.2.1.2",
                "endpoint:requirejs": "2.1.10",
                "endpoint:qunit": "1.14.0",
                "endpoint:sinon": "1.8.1"
            });
        });

        /**
         * @property {object} repository
         * @optional - same value
         */
        it('#repository', function(){
            expect(bower.jquery.repository).to.be.undefined;
            expect(bower.immutable.repository).to.deep.equal({
                "type": "git",
                "url": "git://github.com/facebook/immutable-js.git"
            });
        });

        /**
         * @property {string|object} author
         * @optional - only when the repository has a single author
         *  string - same value
         *  object - adapt
         *      name -> name
         *      email -> email
         *      homepage -> url
         */
        it('#author', function(){
            // no author
            expect(bower.jquery.author).to.be.undefined;

            // author string
            expect(bower.skeleton.author).to.be.equal("Dave Gamache <hello@davegamache.com> (http://davegamache.com/)");

            // author objects
            expect(bower.immutable.author).to.deep.equal({
                "name": "Lee Byron",
                "email": "lee@leebyron.com",
                "url": "https://github.com/leebyron"
            });

            // more than one authors
            expect(bower.mocha.author).to.be.undefined;
        });


        /**
         * @property {array} author
         * @optional - only when the repository has more than one author
         *  string - same value
         *  object - adapt
         *      name -> name
         *      email -> email
         *      homepage -> url
         */
        it('#contributors', function(){

            // no author
            expect(bower.jquery.contributors).to.be.undefined;

            // one author string
            expect(bower.skeleton.contributors).to.be.undefined;

            // one author objects
            expect(bower.immutable.contributors).to.be.undefined;

            // more than one authors
            expect(bower.mocha.contributors).to.deep.equal([
                "TJ Holowaychuk <tj@vision-media.ca>",
                "Joshua Appelman <joshua@jbna.nl>",
                "Oleg Gaidarenko <markelog@gmail.com>",
                "Christoffer Hallas <christoffer.hallas@gmail.com>",
                "Christopher Hiller <chiller@badwing.com>",
                "Travis Jeffery <tj@travisjeffery.com>",
                "Johnathan Ong <me@jongleberry.com>",
                "Guillermo Rauch <rauchg@gmail.com>"
            ]);
        });

    });

});