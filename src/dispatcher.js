"use strict";

function guaranteeArray(obj){
    return !Array.isArray(obj) ? [obj] : obj;
}

function Dispatcher(actions) {

	var self = this;
    this.__stores = [];
	this.__handlerMapCache = {};
	this.__isDispatching = false;

    var createActionList = function (actionArray) {

        var actions = guaranteeArray(actionArray);

        for (var i = 0; i < actions.length; ++i) {
            self.__registerAction(actions[i]);
        }
    };

    var initialize = function () {
        if (actions) {
            createActionList(actions);
        }
    };

    initialize();
}

Dispatcher.prototype.__getHandlerName = function(actionName){
	var r = this.__handlerMapCache[actionName];
	if(!r){
		r = "on" + actionName[0].toUpperCase() + actionName.substr(1);
		this.__handlerMapCache[actionName] = r;
	}
	return r;
}

Dispatcher.prototype.__callAction = function(){
    var handler = this.__getHandlerName(arguments[0]);
    var args = Array.prototype.slice.call(arguments,1);

    for (var i = 0; i < this.__stores.length; ++i) {
        var store = this.__stores[i];
        if(store[handler]){
            store[handler].apply(store, args);
        }
	}
};

Dispatcher.prototype.__registerAction = function (actionName) {
    if(!this[actionName]) {
        this[actionName] = this.__callAction.bind(this, actionName);
    }
};

Dispatcher.prototype.connectTo = function (storeArray) {

    var stores = guaranteeArray(storeArray);

    for(var i=0; i<stores.length;++i){
        if(this.__stores.indexOf(stores[i])===-1){
            this.__stores.push(stores[i]);
        }
    }

};

Dispatcher.prototype.dispatch = function (actionName, data) {
    this.__registerAction(actionName);

	if(this.__isDispatching){
		throw "DISPATCH WHILE DISPATCHING: Don't trigger any action in your store callbacks!";
	}

	this.__isDispatching = true;
    this[actionName](data);
	this.__isDispatching = false;
};

var dispatchers = {};

module.exports = {
    create: function (name, actionArray) {
        if(!name || name.length===0){
            throw "Empty names are not allowed";
        }

        dispatchers[name] = new Dispatcher(actionArray);
        return dispatchers[name];
    },
    getDispatcher: function (name) {
        return dispatchers[name];
    }
};
