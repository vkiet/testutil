'use strict';

module.exports = function (grunt) {
  
  require('jit-grunt')(grunt, {
    express: 'grunt-express-server'
  });

  grunt.initConfig({
    run: {
      startMongo: {
        options: {
          wait: false,
          quiet: true,
          ready: 4000
        },
        cmd: 'mongod',
        args: ['--dbpath', '../mongodb/shopspot_test']
      },
      startNode: {
        options: {
          wait: false,
          quiet: true,
          ready: 10000
        },
        cmd: 'node',
        args: ['server/app.js']
      },
      stopProcess: {
        cmd: 'pkill',
        args: ['node', 'mongo']
      }
    },

    watch: {
      express: {
        files: [
          'server/**/*.{js,json}'
        ],
        tasks: ['express:dev', 'wait'],
        options: {
          livereload: true,
          nospawn: true //Without this option express won't be reloaded
        }
      }
    },

    express: {
      options: {
        port: process.env.PORT || 9000
      },
      dev: {
        options: {
          script: 'server/app.js'
        }
      }
    },
 
    mochaTest: {
      unitTest: {
        options: {
          reporter: 'spec'
        },
        src: [ 'test/units/*.js' ]
      },
      functionalTest: {
        options: {
          reporter: 'spec'
        },
        src: [ 'test/functionals/**/*.js' ]
      },
      api: {
        options: {
          reporter: 'spec'
        },
        src: ['test/functionals/apis/*.js']
      }
    }
  });

  grunt.registerTask('wait', function() {
    grunt.log.ok('Waiting for server reload...');

    var done = this.async();

    setTimeout(function() {
      grunt.log.writeln('Server should be reloaded');
      done();
    }, 1500);
  });

  grunt.registerTask('serve', function () {
    grunt.task.run([
      'express:dev',
      'wait',
      'watch'
    ]);
  });

  grunt.registerTask('unit-test', 'mochaTest:unitTest');
  grunt.registerTask('functional-test', 'mochaTest:functionalTest');
  grunt.registerTask('default', ['express:dev']);
  
  grunt.registerTask('api-test', ['run:startMongo', 'run:startNode', 'mochaTest:api']);
  grunt.registerTask('suit-test', ['mochaTest:unitTest', 'run:startMongo', 'run:startNode', 'mochaTest:functionalTest']);
}
