module.exports = function(grunt) {

  function getBuildName() {
    var now = new Date(),
        buildName = 'Belgacom_POC_';

    buildName += now.getDate() + '-';
    buildName += ((now.getMonth() + 1) > 9) ? (now.getMonth() + 1) : ('0' + (now.getMonth() + 1));
    buildName += '-' + now.getFullYear() + '.zip';

    return (buildName);
  }

  // Project configuration.
  grunt.initConfig({
    uglify: {
      libFolder: {
        expand: true,     // Enable dynamic expansion.
        cwd: 'lib/',         // Src matches are relative to this path.
        src: ['**/*.js'], // Actual pattern(s) to match.
        dest: 'build/lib',   // Destination path prefix.
        ext: '.min.js',   // Dest filepaths will have this extension.
        extDot: 'first'   // Extensions in filenames begin after the first dot
      },
      logFolder: {
        expand: true,     // Enable dynamic expansion.
        cwd: 'log/',         // Src matches are relative to this path.
        src: ['**/*.js'], // Actual pattern(s) to match.
        dest: 'build/log',   // Destination path prefix.
        ext: '.min.js',   // Dest filepaths will have this extension.
        extDot: 'first'   // Extensions in filenames begin after the first dot
      },
      modelFolder: {
        expand: true,     // Enable dynamic expansion.
        cwd: 'model/',         // Src matches are relative to this path.
        src: ['**/*.js'], // Actual pattern(s) to match.
        dest: 'build/model',   // Destination path prefix.
        ext: '.min.js',   // Dest filepaths will have this extension.
        extDot: 'first'   // Extensions in filenames begin after the first dot
      },
      viewFolder: {
        expand: true,     // Enable dynamic expansion.
        cwd: 'view/',         // Src matches are relative to this path.
        src: ['**/*.js'], // Actual pattern(s) to match.
        dest: 'build/view',   // Destination path prefix.
        ext: '.min.js',   // Dest filepaths will have this extension.
        extDot: 'first'   // Extensions in filenames begin after the first dot
      },
      staticFiles:{
        files : {
          'build/applicationrouter.min.js': ['applicationrouter.js'],
          'build/conf/conf.min.js': ['conf/conf.js'],
          'build/event/eventlist.min.js': ['event/eventlist.js'],
          'build/util/utils.min.js': ['util/utils.js']
        }
      },
      crudapi: {
        files : {
          'build/crudapi/src/crud_impl.min.js': ['crudapi/src/crud_impl.js'],
          'build/crudapi/src/crud_api.min.js': ['crudapi/src/crud_api.js']
        }
      }
    },


    copy: {
      copyStaticFiles: {
        files: [
          // includes files within path and its sub-directories
          {expand: true, src: ['lib/**'], dest: 'build/'},
          {expand: true, src: ['css/**'], dest: 'build/'},
          {expand: true, src: ['data/**'], dest: 'build/'},
          {expand: true, src: ['resources/**'], dest: 'build/'},
          {expand: true, src: ['view/gridDatas.json'], dest: 'build/'},
          {expand: true, src: ['view/hubData.json'], dest: 'build/'}
        ]
      }
    },


    zip: {
      compressBelgacomPoC: {
        // Only zip files in build folder
        cwd: 'build/',
        src: ['build/**'],

        // Destination of zip file
        dest: getBuildName()
      }
    }

  });

  // Load and register Grunt tasks
  // See http://gruntjs.com/getting-started to understand how to install grunt and perform uglify
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-zip');

  // By default run uglify and copy
  grunt.task.registerTask('default', ['uglify:libFolder', 'uglify:logFolder', 'uglify:modelFolder', 'uglify:viewFolder', 'uglify:staticFiles', 'uglify:crudapi', 'copy']);
  // When deliver, add a zip task
  grunt.task.registerTask('delivery', ['uglify:libFolder', 'uglify:logFolder', 'uglify:modelFolder', 'uglify:viewFolder', 'uglify:staticFiles', 'uglify:crudapi', 'copy', 'zip']);
  // As Jenkins can manage one repo at a time 
  grunt.task.registerTask('jenkins', ['uglify:libFolder', 'uglify:logFolder', 'uglify:modelFolder', 'uglify:viewFolder', 'uglify:staticFiles', 'copy']);

};
