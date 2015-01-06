module.exports = function(grunt) {

  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-blanket');
  grunt.loadNpmTasks('grunt-eslint');

  grunt.initConfig({
    eslint: {
      options: {
        config: 'eslint.json'
      },
      target: ['lib/*.js', 'test/*.js']
    },
    clean: {
      coverage: {
        src: ['coverage/']
      }
    },
    copy: {
      coverage: {
        src: ['test/**'],
        dest: 'coverage/'
      }
    },
    blanket: {
      coverage: {
        src: ['lib/'],
        dest: 'coverage/lib/'
      }
    },
    mochaTest: {
      test: {
        options: {
          reporter: 'spec',
        },
        src: ['coverage/test/**/*.js']
      },
      'coverage-html': {
        options: {
          reporter: 'html-cov',
          quiet: true,
          captureFile: 'coverage.html'
        },
        src: ['coverage/test/**/*.js']
      },
      'coverage-lcov': {
        options: {
          reporter: 'mocha-lcov-reporter',
          quiet: true,
          captureFile: 'coverage.lcov'
        },
        src: ['coverage/test/**/*.js']
      },
      'travis-cov': {
        options: {
          reporter: 'travis-cov'
        },
        src: ['coverage/test/**/*.js']
      }
    },
    coveralls: {
      options: {
        src: 'coverage.lcov'
      }
    }
  });

  grunt.registerTask('default', ['eslint', 'clean', 'blanket', 'copy', 'mochaTest']);
  grunt.registerTask('travis', ['default', 'coveralls']);
};
