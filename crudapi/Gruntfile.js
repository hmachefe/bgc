module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    uglify: {
      srcFolder: {
        expand: true,     // Enable dynamic expansion.
        cwd: 'src/',      // Src matches are relative to this path.
        src: ['**/*.js'], // Actual pattern(s) to match.
        dest: 'src/',     // Destination path prefix.
        ext: '.min.js',   // Dest filepaths will have this extension.
        extDot: 'first'   // Extensions in filenames begin after the first dot
      }
    }

  });

  // Load and register Grunt tasks
  // See http://gruntjs.com/getting-started to understand how to install grunt and perform uglify
  grunt.loadNpmTasks('grunt-contrib-uglify');

  // By default run uglify on src folder
  grunt.task.registerTask('default', ['uglify']);

};
