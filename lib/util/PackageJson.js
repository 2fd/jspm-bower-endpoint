'use strict';

var mout = require('mout');

var PackageJson = module.exports = function PackageJson(packageJsonPath){

    if( !(this instanceof PackageJson) )
        return new PackageJson(packageJsonPath);

    mout.object.deepMixIn(this, require( packageJsonPath ));
}

/**
 * @return {Object}
 */
PackageJson.prototype.allDependencies = function (){

    if( !!this._allDependencies )
        return this._allDependencies;

    this._allDependencies = {};
    var dependencies = [
        'optionalDependencies',
        'bundledDependencies',
        'peerDependencies',
        'devDependencies',
        'dependencies',
        'jspm.optionalDependencies',
        'jspm.bundledDependencies',
        'jspm.peerDependencies',
        'jspm.devDependencies',
        'jspm.dependencies'
    ];

    mout.array.forEach(dependencies, function(propertyName){

        if(mout.object.has(this, propertyName)) {
            mout.object.deepMixIn(
                this._allDependencies,
                mout.object.get(this, propertyName)
            );
        }

    }, this);

    return this._allDependencies;
};

/**
 * @param {Function} callback
 * @return {String};
 */
PackageJson.prototype.findDependency = function ( callback ){

    return mout.object.find(this.allDependencies(), callback);
}
