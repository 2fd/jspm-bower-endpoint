var Q = require('q');
var util = require('util');
var resolverFactory = require('./resolverFactory');
var SuperPackageRepository = require('bower/lib/core/PackageRepository');


var PackageRepository = module.exports = function PackageRepository(config, logger){

    SuperPackageRepository.apply(this, arguments);
    this._resolverCache = {};

};

util.inherits(PackageRepository, SuperPackageRepository);

/**
 * @param {String} source
 * @returns {Promise}
 *      - resolve: {Array}
 *          0 : {Resolver}
 *          1 : endpoint url
 */
PackageRepository.prototype.resolve = function(source){

    var cache = this._resolverCache;

    if(cache[ source ])
        return Q(cache[ source ]);

    return resolverFactory
        .getConstructor(source, this._config, this._registryClient)
        .then(function(resolve){

            cache[ source ] = resolve;

            return resolve;
        });

};