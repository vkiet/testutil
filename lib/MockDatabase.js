var MongoClient = require('mongodb').MongoClient,
		async = require('async'),
		path = require('path'),
		fs = require('fs'),
    log = require('winston'),
    util = require('util');

var Fixture = require('./Fixture');

// use db config coz shopspot.node use property mongo in config
// but stickyrice use database in config
var MockDatabase = function (dbConfig, fixturePath, addtionalFixturePath) {
	this.dbConfig = dbConfig;
  this.fixturePath = fixturePath;
  this.addtionalFixturePath = addtionalFixturePath;
}

MockDatabase.prototype.print = function () {
  var config = JSON.parse(fs.readFileSync(path.join(__dirname, 'resources', 'MockConfig.json'))).mongo;
  log.info(util.inspect(this.dbConfig))
}

MockDatabase.prototype.setup = function (callback) {
  callback = callback || function () {};
  var url = 'mongodb://';

  var mockConfig = JSON.parse(fs.readFileSync(path.join(__dirname, 'resources', 'MockConfig.json')));
  // mongo use in node , database use in stickyrice
  var dbConfig = mockConfig.mongo || mockConfig.database;
  config = this.dbConfig || dbConfig;

  url += config.server + ':' + config.port + '/' + config.database.name;

  MongoClient.connect(url, callback);
};

MockDatabase.prototype.init = function (database, callback) {
  callback = callback || function () {};

  var dataFilePath = this.fixturePath || path.join(__dirname, 'resources' ,'fixture.json');
  var additionalDataFilePath = this.addtionalFixturePath;
  var fixture = new Fixture(dataFilePath, additionalDataFilePath);

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

  if (!database) {
    log.error('Please start database');
  }
  async.every(
    items, 
    function excute (item, callback) {
      
      async.waterfall([
        function drop(next) {
          database.dropCollection(item.name, function () {
            next();
          });
        },
        function create(next) {
          database.createCollection(item.name, function (error, collections) {
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

MockDatabase.prototype.clear = function (database, callback) {

  database.collections(function (error, collections) {
    async.every(collections,
      function (item, next) {
        database.dropCollection(item.collectionName, function () {
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

  this.setup(function (error, database) {
    self.clear(database, function () {
      self.init(database, function (error) {
        callback(error, database);
      });  
    });
  });

};

module.exports = MockDatabase;