var util = require('util'), 
    request = require('request'),
    fs = require('fs');
var log = require('winston').loggers.get('request');

var MockRequest = function () {};

MockRequest.prototype._compose = function (url, options) {
  var req = {
    url: url
  };

  if (options.headers) {
    req.headers = options.headers;
  }

  if (options.query) {
    req.qs = options.query;
  }

  if (options.data) {
    req.form = options.data

    // Support file
    if (options.data.files) {
      var files = options.data.files;
      for (var key in files) {
        var file = files[key];
        options.data[key] = fs.createReadStream(file.path)
                              .pipe(fs.createWriteStream(file.name))  
      }
    }
    delete options.data.files;
  }
  
  return req;
};

MockRequest.prototype._callMehod = function (method, req, callback) {
  callback = callback || function () {};

  req.method = method;
  request(req, function (error, response, data) {
    if (error) {
      log.error(error);
    }
    else {
      try {
        callback(response, JSON.parse(data));  
      }
      catch (err) {
        callback(response, data);   
      }
      
    }
  });
}
// params = query
MockRequest.prototype.get = function (url, options, callback) {
  callback = callback || function () {};
  var self = this;
  var req = this._compose(url, options);

  this._callMehod('GET', req, callback);
  
};
// params = data
MockRequest.prototype.put = function (url, options, callback) {
  callback = callback || function () {};
  var req = this._compose(url, options);

  this._callMehod('PUT', req, callback);
};
// params = data
MockRequest.prototype.post = function (url, options, callback) {
  callback = callback || function () {};
  var req = this._compose(url, options);

  this._callMehod('POST', req, callback);
};

MockRequest.prototype.del = function (url, options, callback) {
  callback = callback || function () {};
  var req = this._compose(url, options);

  this._callMehod('DELETE', req, callback);
};

MockRequest.file = function (filePath, fileName) {
  return {
    path: filePath,
    name: fileName
  };
};

module.exports = MockRequest;