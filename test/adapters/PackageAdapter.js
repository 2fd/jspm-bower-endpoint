var path = require('path');
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
            async :        PackageAdapter( require('../assets/use-case/async.bower.json') ),
            jquery :        PackageAdapter( require('../assets/use-case/jquery.bower.json') ),
            jqueryplugin :  PackageAdapter( require('../assets/use-case/jquery-placeholder.bower.json') ),
            bootstrap :     PackageAdapter( require('../assets/use-case/bootstrap.bower.json') ),
            materialize :   PackageAdapter( require('../assets/use-case/materialize.bower.json') ),
            skeleton :      PackageAdapter( require('../assets/use-case/skeleton.bower.json') ),
            mocha :         PackageAdapter( require('../assets/use-case/mocha.bower.json') ),
            immutable :     PackageAdapter( require('../assets/use-case/immutable-js.bower.json') ),
            fontawesome :   PackageAdapter( require('../assets/use-case/font-awesome.bower.json') )
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
            var main = PackageAdapter.parseMainProperty;

            expect(main(undefined)).to.be.false;
            // resolve single file
            expect(main('dist/file.js')).to.be.equal('dist/file.js');
            expect(main('dist/file.css')).to.be.equal('dist/file.css!css');
            expect(main('dist/file.other')).to.be.false;
            expect(main('dist/')).to.be.false;

            // resolve list files
            expect(main( ['dist/file.js'] )).to.be.equal('dist/file.js');
            expect(main( ['dist/file.js', 'dist/other.js'] )).to.be.false;
            expect(main( ['dist/file.css'] )).to.be.equal('dist/file.css!css');
            expect(main( ['dist/file.css', 'dist/other.css'] )).to.be.false;
            expect(main( ['dist/file.js', 'dist/other.js', 'dist/file.css'] )).to.be.false;
            expect(main( ['dist/file.other'] )).to.be.false;
            expect(main( ['dist/'] )).to.be.false;

            //priorities
            expect(main( ['dist/file.js', 'dist/file.css', 'dist/file.other', 'dist/'] )).to.be.equal('dist/file.js');
            expect(main( ['dist/file.css', 'dist/file.other', 'dist/'] )).to.be.equal('dist/file.css!css');


            // use case
            expect(bower.jquery.main).to.be.equal('dist/jquery.js');
            expect(bower.jqueryplugin.main).to.be.equal('jquery.placeholder.js');
            expect(bower.mocha.main).to.be.equal('mocha.js');
            expect(bower.bootstrap.main).to.be.equal('dist/js/bootstrap.js');
            expect(bower.fontawesome.main).to.be.equal('./css/font-awesome.css!css');
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
         * @property {string} registry
         * @optional
         */
        it('#registry', function(){
            expect(PackageAdapter({}).registry).to.be.undefined;
            expect(PackageAdapter({}, 'registryName').registry).to.be.equal('registryName');
        });

        /**
         * @property {string} format
         * @optional
         *  - global by default
         *  - use property moduleType
         *      - node|cjs -> cjs
         *      - amd -> amd
         *      - globals -> global
         *      - es6 -> es6
         */
        it('#format', function(){

            // Use case
            expect(bower.jquery.format).to.be.equal('global');
            expect(bower.async.format).to.be.equal('cjs');

            // Test
            var format = PackageAdapter.parseFormatProperty;
            expect(format(['node', 'amd', 'globals', 'es6', 'other'])).to.be.equal('cjs');
            expect(format(['amd', 'globals', 'es6', 'other'])).to.be.equal('amd');
            expect(format(['globals', 'es6', 'other'])).to.be.equal('global');
            expect(format(['es6', 'other'])).to.be.equal('es6');
            expect(format(['other'])).to.be.equal('global');
            expect(format( 'cjs' )).to.be.equal('cjs');
            expect(format( undefined )).to.be.equal('global');
        });

        /**
         * @property {object} dependencies
         * @optional
         *   - add "pacake:" prefix  to version
         *   - if main property include css files add "css-pluging" with dependencies
         */
        it('#dependencies', function(){

            // no dependencies
            expect(bower.jquery.dependencies).to.deep.equal({});

            // only js dependencies
            expect(bower.jqueryplugin.dependencies).to.deep.equal({
                "jquery":"jquery@*"
            });

            // only css dependencies
            expect(bower.skeleton.dependencies).to.deep.equal({
                "css": "jspm:css@*"
            });

            // js and css dependencies
            expect(bower.bootstrap.dependencies).to.deep.equal({
                "jquery": "jquery@*",
                "css": "jspm:css@*"
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
                "sizzle": "sizzle@2.1.1-jquery.2.1.2",
                "requirejs": "requirejs@2.1.10",
                "qunit": "qunit@1.14.0",
                "sinon": "sinon@1.8.1"
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