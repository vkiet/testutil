var fs = require('fs');
var ObjectID = require('mongodb').ObjectID;

var covertExpression = function (key, value) {  
  if (typeof value === "string") {
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

var Fixture = function (datafilePath, additionalDataFilePath) {
  this.data = JSON.parse(fs.readFileSync(datafilePath), covertExpression);
  this.collections = [];


  if (additionalDataFilePath) {
    var additionalData = JSON.parse(fs.readFileSync(additionalDataFilePath), covertExpression);

    for (var key in additionalData) {
      var collection = this.data[key];
      var additionalCollection = additionalData[key];

      this.data[key] = collection ? collection.concat(additionalCollection) : additionalCollection;

      //remove collection length === 0
      if (!this.data[key].length) {
        delete this.data[key];
      }
    }
  }

  for (var key in this.data) {
    var documents = this.data[key];

    for (var i = 0; i < documents.length; i++) {
      if (documents[i].hasOwnProperty('_id')) {
        documents[i]._id = new ObjectID(documents[i]._id);
      }
    }

    if (this.data.hasOwnProperty(key)) {
      this.collections.push(key);
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