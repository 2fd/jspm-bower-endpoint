var Q = require('q');
var util = require('util');
var Manager = require('./Manager');
var SuperProject = require('bower/lib/core/Project');

var Project = module.exports = function Project(){

    SuperProject.apply(this, arguments);
    this._manager = new Manager(this._config, this._logger);

};

util.inherits(Project, SuperProject);