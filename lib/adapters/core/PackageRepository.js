var util = require('util');
var resolverFactory = require('bower/lib/core/resolverFactory');
var SuperPackageRepository = require('bower/lib/core/PackageRepository');


var PackageRepository = module.exports = function PackageRepository(config, logger){

    SuperPackageRepository.apply(this, arguments);

};

util.inherits(PackageRepository, SuperPackageRepository);

PackageRepository.prototype.ConcreteResolver = function(source){

    return resolverFactory
        .getConstructor(source, this._config, this._registryClient);

};