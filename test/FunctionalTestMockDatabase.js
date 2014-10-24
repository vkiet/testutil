var util = require('util'),
		should = require('should'),
		sinon = require('sinon'),
		path = require('path');

var MockDatabase = require('../lib/MockDatabase');
var externalConfig;

describe('FunctionalTestMockDatabase Default Config', function () {

	describe('#setup', function () {
		var mockDatabase = new MockDatabase();
		it('should success with default config', function (done) {
			var database = mockDatabase.setup();

			should.exists(database);
			database.databaseName.should.equal('shopspot');
			database.serverConfig.host.should.equal('127.0.0.1');
			database.serverConfig.port.should.equal(27017);

			done();
		});

	});

	describe('#init', function () {
		this.timeout(10000);
		var mockDatabase = new MockDatabase();

		it('should success', function (done) {
			var database = mockDatabase.setup();
			database.open(function (error, client) {
				mockDatabase.init(client, function (error) {
					client.collections(function (error, collections) {
						should.not.exist(error);
						done();
					});
					
				});
			});
		});
	});

	describe('#clear', function () {
		this.timeout(10000);
		var mockDatabase = new MockDatabase();

		it('should success', function (done) {
			var database = mockDatabase.setup();
			database.open(function (error, client) {
				mockDatabase.clear(client, function (error) {
					client.collections(function (error, collections) {
						should.not.exist(error);
						done();
					});
				});
			});
		});
	});
});

describe('FunctionalTestMockDatabase External Config', function () {
	before(function (done) {
		externalConfig = {
			db: {
				'server': '127.0.0.1',
		    'port': 27017,
		    'options': {},
		    'authentication': {
		      'username': '',
		      'password': ''
		    },
		    'database': {
		      'name': 'shopspot_mock_test',
		      'options': {}
		    }	
			},
			fixturePath: path.join(__dirname ,'MockFixture.json')
		}
		done();
	});

	describe('#setup', function () {
		var mockDatabase = new MockDatabase();

		it('should success with external config', function (done) {
			var config = externalConfig.db;
			mockDatabase.dbConfig = config;
			var database = mockDatabase.setup();
			should.exists(database);
			database.databaseName.should.equal(config.database.name);
			database.serverConfig.host.should.equal(config.server);
			database.serverConfig.port.should.equal(config.port);

			done();
		});

	});

	describe('#init', function () {
		this.timeout(10000);
		var mockDatabase = new MockDatabase();

		it('should success with external fixture', function (done) {
			var fixturePath = externalConfig.fixturePath;
			mockDatabase.fixturePath = fixturePath;
			var database = mockDatabase.setup();

			database.open(function (error, client) {
				mockDatabase.init(client, function (error) {
					client.collections(function (error, collections) {
						should.not.exist(error);
						setTimeout(function() {
							// collection in fixture equal 2
							// but include system.index 1 
							collections.length.should.equal(3);
							done();
						}, 5000);
					});
				});
			});
		});
	});

	describe('#clear', function () {
		this.timeout(10000);
		var mockDatabase = new MockDatabase();

		it('should success', function (done) {
			var database = mockDatabase.setup();
			database.open(function (error, client) {
				mockDatabase.clear(client, function (error) {
					client.collections(function (error, collections) {
						should.not.exist(error);
						done();
					});
				});
			});
		});
	});
});