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

var PackageAdapter = module.exports = function PackageAdapter(bower, endpoint){

    if ( !(this instanceof PackageAdapter) )
        return new PackageAdapter(bower, endpoint);

    endpoint = mout.lang.toString(endpoint);

    this.name = bower.name;
    this.description = bower.description;
    this.version = bower.version;
    this.keywords = bower.keywords;
    this.repository = bower.repository;
    this.homepage = bower.homepage;

    this.license = parseLicenseProperty(bower.license);
    this.main = filterScripttFiles(bower.main).join(',') || undefined;

    // some repositories use "author" instead of "authors" property
    // https://github.com/bower/bower.json-spec#authors
    this.author = parseAuthorProperty(bower.authors || bower.author);
    this.contributors = parseContributorsProperty(bower.authors || bower.author);

    this.dependencies = addEndpointToDependencies(bower.dependencies, endpoint);
    this.devDependencies = addEndpointToDependencies(bower.devDependencies, endpoint);

    if(!mout.lang.isEmpty( filterStyleFiles(bower.main) ))
        this.dependencies['css-plugin'] = '*';
};

/**
 * @function filterScripttFiles
 * @param main
 * @returns {Array.<T>}
 */
var filterScripttFiles = function(main){
    return mout.array.filter(
        mout.lang.toArray(main),
        function(item){
            return /\.js$/.test( item );
        }
    );
};

/**
 * @function filterStyleFiles
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
 *
 * @param dependencies
 * @param endpoint
 * @returns {}
 */
var addEndpointToDependencies = function(dependencies, endpoint){

    if(!mout.lang.isObject(dependencies))
        return {};

    var resolved = {};

    mout.object.forOwn(
        dependencies,
        function(value, key){

            if(endpoint)
                key = endpoint + ':' + key;

            resolved[ key ] = value;
        }
    );

    return resolved;
};

/**
 * @param people
 */
var parsePeopleFields = function(people){

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

var parseAuthorProperty = function(authors){

    authors= mout.lang.toArray(authors);

    if(authors.length === 1)
        return parsePeopleFields(authors[0]);

    return;
};

var parseContributorsProperty = function(authors){

    authors= mout.lang.toArray(authors);

    if(authors.length > 1)
        return mout.array.map(authors, parsePeopleFields);

    return;
};

var parseLicenseProperty = function(license){

    if(mout.lang.isArray(license))
        return license.join(',');

    return license;

};
