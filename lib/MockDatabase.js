var mongodb = require('mongodb'),
		async = require('async'),
		path = require('path'),
		fs = require('fs'),
    log = require('winston'),
    util = require('util');

var Fixture = require('./Fixture');

// use db config coz shopspot.node use property mongo in config
// but stickyrice use database in config
var MockDatabase = function (dbConfig, fixturePath) {
	this.dbConfig = dbConfig;
  this.fixturePath = fixturePath;
}

MockDatabase.prototype.print = function () {
  var config = JSON.parse(fs.readFileSync(path.join(__dirname, 'resources', 'MockConfig.json'))).mongo;
  log.info(util.inspect(this.dbConfig))
}

MockDatabase.prototype.setup = function () {
  var mockConfig = JSON.parse(fs.readFileSync(path.join(__dirname, 'resources', 'MockConfig.json')));
  // mongo use in node , database use in stickyrice
  var dbConfig = mockConfig.mongo || mockConfig.database;
	config = this.dbConfig || dbConfig;

	var server = new mongodb.Server(config.server, config.port, config.options);
	var database = new mongodb.Db(config.database.name, server, config.database.options);

	return database;
}

MockDatabase.prototype.init = function (client, callback) {

	var dataFilePath = this.fixturePath || path.join(__dirname, 'resources' ,'fixture.json');
  var fixture = new Fixture(dataFilePath);
  var data = fixture.getCollections('all');
  var items = [];

  for (var name in data) {
    if (data.hasOwnProperty(name)) {
      items.push({
        'name': name,
        'collections': data[name]
      });
    }
  }

  if (!client) {
    log.error('Please start database');
  }
  async.every(
    items, 
    function excute (item, callback) {
      
      async.waterfall([
        function drop(next) {
          client.dropCollection(item.name, function () {
            next();
          });
        },
        function create(next) {
          client.createCollection(item.name, function (error, collections) {
            if (!error) {
              if (item.name === 'stuffs') {
                collections.ensureIndex({'location.spot': '2d'}, function (error) {
                  next(null, collections, item.collections);
                });
              }
              else {
                next(null, collections, item.collections);
              }              
            }       
            else {
              logger.trace(error);
            }     
          });
        },
        function success(collection, item, next) {          
          collection.insert(item, {safe: true}, next);     
        }        
      ], function (error) {
        callback(error);
      });      
    },
    function finish (result) {
      callback();
    }
  );
}

MockDatabase.prototype.clear = function (client, callback) {

  client.collections(function (error, collections) {
    async.every(collections,
      function (item, next) {
        client.dropCollection(item.collectionName, function () {
          next();
        });
      },
      function () {
        callback();
      });
  });
}

MockDatabase.prototype.setupWithData = function (callback) {
  var self = this;

  var database = this.setup();

  database.open(function (error, client) {
    self.clear(client, function () {
      self.init(client, function (error) {
        callback(error);
      });  
    });
  });
};

module.exports = MockDatabase;