var util = require('util');
var Manager = require('./Manager');
var SuperProject = require('bower/lib/core/Project');

var Project = module.exports = function Project(){

    SuperProject.apply(this, arguments);
    this._manager = new Manager(this._config, this._logger);

};

util.inherits(Project, SuperProject);
/*
Project.prototype._readJson = function(){


    var json = SuperProject.prototype._readJson.call(this);
    this._json.dependencies = json.dependencies = {};
    this._json.devDependencies = json.devDependencies = {};
    return json;
};*/
/*
 Project.prototype._analyse = function(){

     var _analyse = SuperProject.prototype._analyse.call(this);

     _analyse.spread(function (json, installed, links){

         console.log(json);
         console.log(installed);
         console.log(links);
         process.exit();

     });

    /*
     this._json.dependencies = json.dependencies = {};
     this._json.devDependencies = json.devDependencies = {};
     * /

     return _analyse;
 };


*/