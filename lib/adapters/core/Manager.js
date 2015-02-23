var util = require('util');
var mout = require('mout');
var SuperManager = require('bower/lib/core/Manager');

var Manager = module.exports = function Manager(){

    SuperManager.apply(this, arguments);

};

util.inherits(Manager, SuperManager);

Manager.prototype._dissect = function(){

    var that = this;
    var _dissect = SuperManager.prototype._dissect.apply(this, arguments);

    this._deferred.promise.then(function(){

        var _dissected = that._dissected;
        that._dissected = undefined;

        mout.object.forOwn(_dissected, function(decEndpoint, name){

            if(!that._dissected)
            {
                that._dissected = {};
                that._dissected[name  + '/../'] = decEndpoint;
            }

        });

        return;
    })

    return _dissect;
};