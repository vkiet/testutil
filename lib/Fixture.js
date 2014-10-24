var fs = require('fs');
var ObjectID = require('mongodb').ObjectID;

var covertExpression = function (key, value) {  
  if (key == '_id') {
    return new ObjectID(value);
  }
  else if (typeof value === "string") {
    var datePattern = /^@date\((\d+|now)\)$/im;
    var idPattern = /^@id\(([a-f0-9]+)\)$/im;
    var isoDate = /^@isoDate\((\d+|now)\)$/im;

    if (datePattern.test(value)) { // case date format @date(number of date)
      var rawDate = datePattern.exec(value)[1];      
      if('now' === rawDate) {
        return new Date().getTime();
      }
      else 
        return new Date(rawDate).getTime();
    }
    else if (idPattern.test(value)) {
      var rawDate = idPattern.exec(value)[1]; 
      return new ObjectID(rawDate);
    }
    else if (isoDate.test(value)) {
      var rawDate = isoDate.exec(value)[1];      
      if('now' === rawDate) {
        return new Date();
      }
      else 
        return new Date(parseInt(rawDate));
    }
  }

  return value;
};

var Fixture = function (datafilePath) {
  this.data = JSON.parse(fs.readFileSync(datafilePath), covertExpression);
  this.collections = [];

  for (var collection in this.data) {
    if (this.data.hasOwnProperty(collection)) {
      this.collections.push(collection);
    }
  }
};

Fixture.prototype.getCollections = function (collectionNames) {
  collectionNames = collectionNames || [];

  var fixture = {};

  if ('all' === collectionNames) {
    collectionNames = this.collections;
  }
  else if (!(collectionNames instanceof Array)) {
    collectionNames = [collectionNames];
  };  

  for (var index = 0, length = collectionNames.length; index < length; index++) {
    var name = collectionNames[index];

    fixture[name] = this.data[name];
  }

  return fixture;
};

module.exports = Fixture;