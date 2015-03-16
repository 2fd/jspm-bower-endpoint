'use strict';

var resolvers = require('bower/lib/core/resolvers');
var resolverFactory = require('bower/lib/core/resolverFactory');
var superGetConstructor = resolverFactory.getConstructor;

var LOCAL_PACKAGE = /^file:(\/\/)?(.*)/i;

resolverFactory.getConstructor = function getConstructor(source, config, registryClient) {

    var bowerSource = source;

    if(LOCAL_PACKAGE.test(bowerSource)){

        var match = LOCAL_PACKAGE.exec(bowerSource);
        var filepath = match[2];

        // using file protocol (file://{package})
        // convert to absolute
        if(match[1] === '//') {
            bowerSource = '/' + filepath;

        // using file prefix to a implicit relative file or package (file:{package})
        // convert to explicit relative path
        } else if (
            !(filepath[0] === '/') &&
            !(filepath[0] === '~' && filepath[1] === '/') &&
            !(filepath[0] === '.' && filepath[1] === '/')
        ) {
            bowerSource = './' + filepath;

        // using file: prefix
        } else {
            bowerSource = match[2];

        }
    }



    return superGetConstructor(bowerSource, config, registryClient)
        .spread(function(ConcreteResolver, sourceResolved){

            // not used the file prefix
            if(ConcreteResolver === resolvers.Fs) {

                if(!LOCAL_PACKAGE.test(source)){
                    return [ConcreteResolver, sourceResolved, 'file:' + source];

                } else if (source !== 'file:' + bowerSource) {
                    return [ConcreteResolver, sourceResolved, 'file:' + bowerSource];

                }
            }

            return [ConcreteResolver, sourceResolved, source];

        });
}

module.exports = resolverFactory;
