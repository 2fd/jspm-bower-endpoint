'use strict';

var PackageAdapter = require('./lib/adapters/PackageAdapter');
var PackageRepository = require('./lib/adapters/core/PackageRepository');
var Project = require('./lib/adapters/core/Project');
var bowerConfig = require('./lib/adapters/config');

var resolvers = require('bower/lib/core/resolvers');

var bowerEndpointParser = require('bower-endpoint-parser');
var bowerLogger = require('bower-logger');
var path = require('path');
var mout = require('mout');
var Q = require('q');


var BowerEndpoint = module.exports = function BowerEndpoint (options, ui) {

    this._bower = {
        config: bowerConfig({}),
        logger: new bowerLogger()
    };

    this._cache = {};
    this._ui = ui;
    this._endpoint = options.name;
    this._tmp = options.tmpDir;
    this._api = options.apiVersion;
    this._version = options.versionString;
    this._repository = new PackageRepository(this._bower.config, this._bower.logger);

    this._bower.logger.intercept(function(log){

        if(log.level === 'info')
            ui.log(
                log.level,
                ui.format.info(
                    '- ' + log.data.endpoint.name + ' ' + log.id + ': ' + log.message
                )
            );

    });
};



BowerEndpoint.prototype.locate = function (packageName){

    var fail = { notfound: true };
    var cache = this._cache;
    var repository = this._repository;
    var endpoint = this._endpoint

    return Q.Promise(function(resolve){

        if(cache[packageName])
            resolve( undefined );

        repository.ConcreteResolver(packageName)
            .spread(function(ConcreteResolver, source) {

                if(ConcreteResolver === resolvers.Fs) {
                    var base = path.basename(source);
                    var pkg = 'package/local/' + base;
                    cache[pkg] = source;

                    resolve( { redirect: endpoint + ':' + pkg } );

                } else if(ConcreteResolver === resolvers.GitHub)  {

                    resolve( undefined );

                };

                resolve( fail );
            })
            .catch(function(){
                resolve( fail );
            });
    });
}

BowerEndpoint.prototype.lookup = function (packageName){

    var fail = { notfound: true };
    var noVersioned = { versions : { latest: { hash: 'latest' } } };
    var repository = this._repository;
    var cache = this._cache;

    packageName = cache[packageName] || packageName;

    return Q.Promise(function(resolve){

        Q.all([
                repository.ConcreteResolver(packageName),
                repository.versions(packageName)
            ])
            .spread(function(ConcreteResolver, versions){

                return [ConcreteResolver[0], ConcreteResolver[1], versions];

            })
            .spread(function(ConcreteResolver, source, versions){

                if(ConcreteResolver === resolvers.Fs) {

                    resolve( noVersioned );

                // Versioned endpoints
                } else if(ConcreteResolver === resolvers.GitHub) {

                    var lookup = { versions : {} };

                    mout.array.forEach(versions, function(version){

                        lookup.versions[version] = { hash: version};

                    });

                    resolve( lookup );

                }

                resolve( fail );
            })
            .catch(function(){

                resolve( fail );

            });
    });
};

BowerEndpoint.prototype.download = function (packageName, version, hash, meta, dir){

    var registry = this._endpoint;
    var ui = this._ui;
    var cache = this._cache;

    this._bower.config.cwd = dir;
    this._bower.config.directory = '';

    var bowerPackage = (cache[packageName] || packageName)
    var decEndpoints = bowerEndpointParser.decompose(bowerPackage + '#' + version);
    var project = new Project( this._bower.config,  this._bower.logger);

    return project
        .install([decEndpoints], undefined, this._bower.config)
        .then(function(installed){

            var pkg = mout.object.reduce(installed, function(pre, cur){
                return cur;
            });

            var packageJson = new PackageAdapter(pkg.pkgMeta);

            packageJson.registry = registry;

            // only css dependencies
            if(mout.object.equals(packageJson.dependencies, { 'css' : 'jspm:css@*'}))
                ui.log('warn', 'this package only use css dependencies, \nto use it must install the css-plugin with "jspm install css"');

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