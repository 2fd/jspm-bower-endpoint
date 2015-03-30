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

    this._ui = ui;
    this._endpoint = options.name;
    this._tmp = options.tmpDir;
    this._api = options.apiVersion;
    this._version = options.versionString;

	this._bower = {
		config: bowerConfig({}),
		logger: new bowerLogger()
	};

    this._bower.config.tmp = path.resolve( this._tmp, 'tmp');
    this._bower.config.storage.packages = path.resolve( this._tmp, 'packages');
    this._bower.config.storage.links = path.resolve( this._tmp, 'links');
    this._bower.config.storage.completion = path.resolve( this._tmp, 'completion');
    this._bower.config.storage.registry = path.resolve( this._tmp, 'registry');
    this._bower.config.storage.empty = path.resolve( this._tmp, 'empty');

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
	var repository = this._repository;
	var endpoint = this._endpoint

	return Q.Promise(function(resolve){

		repository.resolve(packageName)
			.spread(function(ConcreteResolver, source, repositoryPackageName) {


				if(packageName != repositoryPackageName)
					return { redirect: endpoint + ':' + repositoryPackageName };

				if(
					ConcreteResolver === resolvers.GitRemote ||
					ConcreteResolver === resolvers.GitHub ||
					ConcreteResolver === resolvers.Fs
				)
					return undefined;

				return fail;
			})
			.then(resolve)
			.catch(function(){
				resolve( fail );
			});
	});
}

BowerEndpoint.prototype.lookup = function (packageName){


	var fail = { notfound: true };
	var noVersioned = { versions : { latest: { hash: 'latest' } } };
	var repository = this._repository;

	return Q.Promise(function(resolve){

		Q.all([
				repository.resolve(packageName),
				repository.versions(packageName)
			])
			.spread(function(ConcreteResolver, versions){

				return [ConcreteResolver[0], versions];

			})
			.spread(function(ConcreteResolver, versions){

				// No versioned endpoints
				if(ConcreteResolver === resolvers.Fs)
					return noVersioned;

				// Versioned endpoints
				if(
					ConcreteResolver === resolvers.GitRemote||
					ConcreteResolver === resolvers.GitHub
				) {

					var lookup = { versions : {} };

					mout.array.forEach(versions, function(version){

						lookup.versions[version] = { hash: version};

					});

					return lookup;

				}

				return fail;
			})
			.then(resolve)
			.catch(function(){

				resolve( fail );

			});
	});
};

BowerEndpoint.prototype.download = function (packageName, version, hash, meta, dir){

	var ui = this._ui;
	var registry = this._endpoint;
	var repository = this._repository;
	var bowerConfig = this._bower.config;
	var bowerLogger = this._bower.logger;


	return Q.Promise(function(resolve, reject){

		repository.resolve(packageName)
			.spread(function(ConcreteResolver, source){

				var decEndpoints = bowerEndpointParser.decompose(source + '#' + version);
				var config = {};
				mout.object.deepMixIn(config, bowerConfig);
				config.cwd = dir;
				config.directory = '';

				var project = new Project( config, bowerLogger);
				return project.install([decEndpoints], undefined, config);

			})
			.then(function(installed){


				var pkg = mout.object.reduce(installed, function(pre, cur){
					return cur;
				});

				var packageJson = new PackageAdapter(pkg.pkgMeta, registry);

				return packageJson;
			})
			.then(resolve)
			.catch(resolve);
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