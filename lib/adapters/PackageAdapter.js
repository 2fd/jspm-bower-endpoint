/**
 * @class
 *
 * @require
 * bower.name -> package.name
 *
 * @recommended
 * bower.description -> package.description
 *
 * @ignored
 * bower.version -> package.version
 *
 * @recommended
 * bower.main -> package.main
 *
 * @recommended
 * bower.license -> package.license
 *
 * @recommended
 * bower.ignore
 *
 * @recommended
 * bower.keywords -> package.keywords
 *
 * @require
 * bower.authors -> package.[author|contributors]
 *
 * @require
 * bower.homepage -> package.homepage
 *
 * @require
 * bower.repository -> package.repository
 *
 * @require
 * bower.dependencies -> package.dependencies
 *
 * @optional
 * bower.devDependencies -> package.devDependencies
 *
 * @optional
 * bower.resolutions
 *
 * @optional
 * bower.private -> package.devDependencies
 *
 * package.bugs
 * package.files
 * package.bin
 * package.man
 * package.directories
 * package.scripts
 * package.config
 * package.peerDependencies
 * package.bundledDependencies
 * package.optionalDependencies
 * package.engines
 * package.engineStrict
 * package.os
 *
 */

var mout = require('mout');
var semver = require('../util/jspmSemver').parse;

var PackageAdapter = module.exports = function PackageAdapter(bower, registry){

    if ( !(this instanceof PackageAdapter) )
        return new PackageAdapter(bower, registry);

    /**
     * NPM Package properties
     */
    this.name = bower.name;
    this.description = bower.description;
    this.version = bower.version;
    this.keywords = bower.keywords;
    this.repository = bower.repository;
    this.homepage = bower.homepage;

    if(registry)
        this.registry = registry;

    this.license = PackageAdapter.parseLicenseProperty(bower.license);
    this.main = PackageAdapter.parseMainProperty(bower.main);

    // some repositories use "author" instead of "authors" property
    // https://github.com/bower/bower.json-spec#authors
    this.author = PackageAdapter.parseAuthorProperty(bower.authors || bower.author);
    this.contributors = PackageAdapter.parseContributorsProperty(bower.authors || bower.author);

    /**
     * JSPM Package properties
     */
    this.dependencies = PackageAdapter.parseDependenciesProperty(bower.dependencies);
    this.devDependencies = PackageAdapter.parseDependenciesProperty(bower.devDependencies);

    if(!mout.lang.isEmpty( filterStyleFiles(bower.main) ))
        this.dependencies['css'] = 'jspm:css@*';

    this.format = PackageAdapter.parseFormatProperty(bower.moduleType);
};

/**
 * @function filterScriptFiles
 * @access private
 * @param main
 * @returns {Array.<T>}
 */
var filterScriptFiles = function(main){
    return mout.array.filter(
        mout.lang.toArray(main),
        function(item){
            return /\.js$/.test( item );
        }
    );
};

/**
 * @function filterStyleFiles
 * @access private
 * @param main
 * @returns {Array.<T>}
 */
var filterStyleFiles = function(main){
    return mout.array.filter(
        mout.lang.toArray(main),
        function(item){
            return /\.css$/.test( item );
        }
    );
};

/**
 * @function PackageAdapter.parseMainProperty
 * @access public
 * @param {Array|String|undefined} bowerMain
 * @returns {String|false}
 */
PackageAdapter.parseMainProperty = function(bowerMain){

    // detect js main file
    var main = filterScriptFiles(bowerMain);

    if(main.length === 1) {
        return main[0];

    } else if(main.length === 0) {
        // detect css main file
        main = filterStyleFiles(bowerMain);

        if(main.length === 1)
            return main[0] + '!css';

    }

    return false;
};

/**
 * @function PackageAdapter.parseDependenciesProperty
 * @access public
 * @param {Object} dependencies
 * @returns {Object}
 */
PackageAdapter.parseDependenciesProperty = function(dependencies){

    if(!mout.lang.isObject(dependencies))
        return {};

    var resolved = {};

    mout.object.forOwn(
        dependencies,
        function(value, key){

            var dependency = key + '@' + semver(value);

            resolved[ key ] = dependency;
        }
    );

    return resolved;
};

/**
 * @function resolvePeopleFields
 * @access private
 * @param {Object|String} people
 * @returns {Object|String}
 */
var resolvePeopleFields = function(people){

    if(!mout.lang.isObject(people))
        return people;

    var peopleAdapter = {};

    if(people.name)
        peopleAdapter.name = people.name;

    if(people.email)
        peopleAdapter.email = people.email;

    if(people.homepage)
        peopleAdapter.url = people.homepage;

    return peopleAdapter;
};

/**
 * @function PackageAdapter.parseAuthorProperty
 * @access public
 * @param {Array|String|Object} authors
 * @returns {String|Object|undefined}
 */
PackageAdapter.parseAuthorProperty = function(authors){

    authors= mout.lang.toArray(authors);

    if(authors.length === 1)
        return resolvePeopleFields(authors[0]);

    return;
};

/**
 * @function PackageAdapter.parseContributorsProperty
 * @access public
 * @param {Array|String|Object} authors
 * @returns {Array|undefined}
 */
PackageAdapter.parseContributorsProperty = function(authors){

    authors= mout.lang.toArray(authors);

    if(authors.length > 1)
        return mout.array.map(authors, resolvePeopleFields);

    return;
};

/**
 * @function PackageAdapter.parseLicenseProperty
 * @access public
 * @param {Array|String} license
 * @returns {String}
 */
PackageAdapter.parseLicenseProperty = function(license){

    if(mout.lang.isArray(license))
        return license.join(',');

    return license;

};

/**
 * @function PackageAdapter.parseFormatProperty
 * @access public
 * @param {Array|String} moduleType
 * @returns {String}
 */
PackageAdapter.parseFormatProperty = function(moduleType){

    var contains = mout.array.contains;
    moduleType = mout.lang.toArray(moduleType);

    if(contains(moduleType, 'node') || contains(moduleType, 'cjs'))
        return 'cjs';

    if(contains(moduleType, 'amd'))
        return 'amd';

    if(contains(moduleType, 'globals') || contains(moduleType, 'global'))
        return 'global';

    if(contains(moduleType, 'es6'))
        return 'es6';

    return 'global';

};
