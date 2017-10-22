var util = require('util'),
		should = require('should'),
		sinon = require('sinon'),
		path = require('path');

var MockDatabase = require('../lib/MockDatabase');
var externalConfig;
var test = {};

describe('FunctionalTestMockDatabase Default Config', function () {

	describe('#setup', function () {
		var mockDatabase = new MockDatabase();
		it('should success with default config', function (done) {

			mockDatabase.setup(function (error, database) {
				should.not.exists(error);
				should.exists(database);

				database.databaseName.should.equal('shopspot');
				database.serverConfig.host.should.equal('127.0.0.1');
				database.serverConfig.port.should.equal(27017);
				
				test.database = database;

				done();
			});
		});

	});

	describe('#init', function () {
		this.timeout(10000);
		var mockDatabase = new MockDatabase();

		it('should success', function (done) {
			var database = test.database;
			
			mockDatabase.init(database, function (error) {
				database.collections(function (error, collections) {
					collections.length.should.above(0);
					should.not.exist(error);
					done();
				});
			});
			
		});
	});

	describe('#clear', function () {
		this.timeout(10000);
		var mockDatabase = new MockDatabase();

		it('should success', function (done) {
			var database = test.database;
			console.log(database.collections)
			console.log('before clear')
			mockDatabase.clearCollection(database, function (error, result) {
				database.collections(function (error, collections) {
					console.log(database.collections)
					should.not.exist(error);

					collections.length.should.equal(0);
					// collections[0].s.name.should.equal('system.indexes')
					
					done();
				});
			});
		});
	});

	describe('setupWithData', function () {
		this.timeout(10000);
		var mockDatabase = new MockDatabase();

		it('should success', function (done) {
			
			mockDatabase.setupWithData(function (error, database) {
				database.collections(function (error, collections) {
					should.not.exist(error);

					collections.length.should.above(1);
					
					done();
				});
			});
		});
	})
});

describe.skip('FunctionalTestMockDatabase External Config', function () {
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
			}
		}
		var fixturePath = path.join(__dirname ,'MockFixture.json');
		test.mockDatabase = new MockDatabase(externalConfig.db, fixturePath);
		
		done();
	});

	describe('#setup', function () {
	
		it('should success with external config', function (done) {
			
			test.mockDatabase.setup(function (error, database) {
				should.not.exists(error);
				should.exists(database);

				database.databaseName.should.equal('shopspot_mock_test');
				database.serverConfig.host.should.equal('127.0.0.1');
				database.serverConfig.port.should.equal(27017);
				
				test.database = database;

				done();
			});
		});

	});

	describe('#init', function () {
		this.timeout(10000);

		it('should success', function (done) {
			var database = test.database;
			
			test.mockDatabase.init(database, function (error) {
				database.collections(function (error, collections) {
					collections.length.should.above(0);
					should.not.exist(error);
					done();
				});
			});
			
		});
	});

	describe('#clear', function () {
		this.timeout(10000);
		var mockDatabase = new MockDatabase();

		it('should success', function (done) {
			var database = test.database;
			
			mockDatabase.clear(database, function (error) {
				database.collections(function (error, collections) {
					should.not.exist(error);
					collections.length.should.equal(1);
					collections[0].s.name.should.equal('system.indexes')
					
					done();
					
				});
			});

		});
	});
});


describe.skip('FunctionalTestMockDatabase External Config With Additional', function () {
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
		      'name': 'shopspot_mock_additional_test',
		      'options': {}
		    }	
			}
		}
		var fixturePath = path.join(__dirname ,'MockFixture.json');
		var additionalFixturePath = path.join(__dirname ,'AdditionalMockFixture.json');
		test.mockDatabase = new MockDatabase(externalConfig.db, fixturePath, additionalFixturePath);
		
		done();
	});

	describe('#setup', function () {
	
		it('should success with external config', function (done) {
			
			test.mockDatabase.setup(function (error, database) {
				should.not.exists(error);
				should.exists(database);

				database.databaseName.should.equal('shopspot_mock_additional_test');
				database.serverConfig.host.should.equal('127.0.0.1');
				database.serverConfig.port.should.equal(27017);
				
				test.database = database;

				done();
			});
		});

	});

	describe('#init', function () {
		this.timeout(10000);

		it('should success', function (done) {
			var database = test.database;
			
			test.mockDatabase.init(database, function (error) {
				database.collections(function (error, collections) {
					collections.length.should.above(0);
					should.not.exist(error);

					database.collection('users', {}, function (error, collection) {
						collection.find({}).toArray(function (error, users) {
							users.length.should.equal(4);
						});
					});

					done();
				});
			});
			
		});
	});

	describe('#clear', function () {
		this.timeout(10000);
		var mockDatabase = new MockDatabase();

		it('should success', function (done) {
			var database = test.database;
			
			mockDatabase.clear(database, function (error) {
				database.collections(function (error, collections) {
					should.not.exist(error);
					collections.length.should.equal(1);
					collections[0].s.name.should.equal('system.indexes')
					
					done();
					
				});
			});

		});
	});
});