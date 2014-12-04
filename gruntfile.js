module.exports = function(grunt) {

  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-blanket');

  grunt.initConfig({
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
      coverage: {
        options: {
          reporter: 'html-cov',
          quiet: true,
          captureFile: 'coverage.html'
        },
        src: ['coverage/test/**/*.js']
      },
      'travis-cov': {
        options: {
          reporter: 'travis-cov'
        },
        src: ['coverage/test/**/*.js']
      }
    }
  });

  grunt.registerTask('default', ['clean', 'blanket', 'copy', 'mochaTest']);
};
