var async = require('async'),
		util = require('util'),
		should = require('should'),
		sinon = require('sinon'),
		path = require('path'),
		request = require('request'),
		log = require('winston');

var MockDatabase = require('../lib/MockDatabase');
var MockRequest = require('../lib/MockRequest');
var api;
// run this test should start db & server
describe('MockRequest', function () {
	var rootUrl = 'http://127.0.0.1:8080';

	before(function (done) {
		api = {
			get: '/stuff/categories/find',
			post: '/stuff/create',
			put: ''
		};

		async.waterfall([
			function testserver (next) {
				request.get(rootUrl, function (error, response, body) {
				  next(error);
				});
			},
			function setupdb () {
				var mockDatabase = new MockDatabase();
				mockDatabase.setupWithData(function (error) {
					if (error) {
						log.info(util.inspect(error))
					}
					else {
						log.info('Set up with data success')
						done();
					}
				})
			}
		]);
	});

	describe('#get', function () {
		it('should success', function (done) {
			done();
		});
	});

	describe('#post', function () {
		it('should success', function (done) {
			done();
		});
	});

	describe('#post with file', function () {
		it('should success', function (done) {
			done();
		});
	});

	describe('#put', function () {
		it('should success', function (done) {
			done();
		});
	});

	describe('#del', function () {
		it('should success', function (done) {
			done();
		});
	});
});