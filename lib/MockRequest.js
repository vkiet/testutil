var util = require('util'), 
    request = require('request'),
    fs = require('fs'),
    wrench = require('wrench');
    
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
  }

  if (options.followRedirects) {
    req.followRedirects = options.followRedirects;
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
      // try {
      //   callback(response, JSON.parse(data));  
      // }
      // catch (err) {
      //   callback(response, data);   
      // }
      callback(response, JSON.parse(data));
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

MockRequest.prototype.file = function (filePath, fileName) {
  return {
    path: filePath,
    name: fileName
  };
};

MockRequest.prototype.postWithFile = function (url, options, callback) {
  callback = callback || function () {};
  var req = this._compose(url, options);

  delete req.form;
  var tmpFilePath = '/tmp/test/tmpFiles/'; 

  if (!fs.existsSync(tmpFilePath)) {
    try {
      wrench.mkdirSyncRecursive(tmpFilePath, 0777);
    } catch (error) {
      
    }
  } 

  var r = request.post(req, function (error, response, data) {
    if (error) {
      logger.error(error);
    }
    else {
      callback(response, JSON.parse(data));
    }
  });

  var form = r.form();
  for (var key in options.data) {
    var tmp = options.data[key];
    if (key === 'files') {
      for (var f in tmp) {
        var file = tmp[f];
        var savedFile = fs.createReadStream(file.path);

        form.append(f, savedFile);
        savedFile.pipe(fs.createWriteStream(tmpFilePath + file.name));
      }
    }
    else {
      form.append(key, tmp);
    }
  }
};

module.exports = MockRequest;