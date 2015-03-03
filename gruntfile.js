module.exports = function(grunt) {

  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-coveralls');
  grunt.loadNpmTasks('grunt-blanket');
  grunt.loadNpmTasks('grunt-eslint');
  grunt.loadNpmTasks('grunt-jsdoc');
  grunt.loadNpmTasks('grunt-gh-pages');

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
        src: ['test'],
        dest: 'coverage/test'
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
      upload: {
        src: 'coverage.lcov',
      }
    },
    jsdoc: {
      dist: {
        src: ['index.js', 'lib/*.js', 'README.md'],
        options: {
          destination: 'doc',
          template : "node_modules/jaguarjs-jsdoc",
          configure : "jsdoc.conf.json"
        }
      }
    },
    'gh-pages': {
      options: {
        base: 'doc',
      },
      src: ['**']
    }
  });

  grunt.registerTask('test', ['eslint', 'clean', 'blanket', 'copy', 'mochaTest']);
  grunt.registerTask('npm', ['test', 'coveralls']);
  grunt.registerTask('default', ['test', 'jsdoc']);
  grunt.registerTask('gh-doc', ['default', 'gh-pages']);
};
