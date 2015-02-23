'use strict';

var PackageAdapter = require('./lib/adapters/PackageAdapter');
var PackageRepository = require('./lib/adapters/core/PackageRepository');
var Project = require('./lib/adapters/core/Project');
var bowerConfig = require('./lib/adapters/config');
var bowerEndpointParser = require('bower-endpoint-parser');
var bowerLogger = require('bower-logger');
var mout = require('mout');
//var Q = require('q');

var BowerEndpoint = module.exports = function BowerEndpoint (options, ui) {

    this._bower = {
        config: bowerConfig({}),
        logger: new bowerLogger()
    };

    this._options = options;
    this._ui = ui;
    this._endpoint = options.name;

    /*this._bower.logger.intercept(function(log){
        console.log(log);
    });*/
};

//BowerEndpoint.prototype.locate = function (packageName){};
BowerEndpoint.prototype.lookup = function (packageName){
    
    console.log(packageName);

    var repository = new PackageRepository(this._bower.config, this._bower.logger);

    return repository
        .versions(packageName)
        .then(function(versions){

            if(!versions)
                return { notfound: true };

            var lookup = { versions : {} };

            mout.array.forEach(versions, function(version){

                lookup.versions[version] = { hash: version};

            });

            return lookup;
        });
};

BowerEndpoint.prototype.download = function (packageName, version, hash, meta, dir){

    var decEndpoints = bowerEndpointParser.decompose(packageName + '#' + version);
    var endpoint = this._endpoint;

    this._bower.config.cwd = dir;
    this._bower.config.directory = '';

    var project = new Project( this._bower.config,  this._bower.logger);

    return project
        .install([decEndpoints], undefined, this._bower.config)
        .then(function(installed){

            var pkg = mout.object.reduce(installed, function(pre, cur){
                return cur;
            });

            var packageJson = new PackageAdapter(pkg.pkgMeta);
            
            packageJson.format = 'global';
            packageJson.registry = endpoint;

            console.log(packageJson.dependencies);
            
            return packageJson;
        });


};


// Methods
// BowerEndpoint.prototype.locate(packageName) //, optional
// BowerEndpoint.prototype.getPackageConfig (packageName, version, hash, meta) // optional
// BowerEndpoint.prototype.processPackageConfig (pjson) // optional
// BowerEndpoint.prototype.build (pjson, dir) // optional
// BowerEndpoint.prototype.getOverride(endpoint, packageName, versionRange, override)


// static
// BowerEndpoint.packageFormat # RegExp
// BowerEndpoint.configure (config, ui) # optional
// BowerEndpoint.remote # optional