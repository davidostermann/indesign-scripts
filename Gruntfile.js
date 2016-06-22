module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    uglify: {
      options: {
        //compress:{},
        banner: '/* <%= grunt.template.today("yyyy-mm-dd HH:MM") %> */\r\n'
      },
      main: {
        files: {
          'scripts/adp_export.jsx': ['scripts/main.jsx', 'scripts/libs/json2.js']
        } 
      },
      mainCS5: {
        files: {
          'scripts/adp_exportCS5.jsx': ['scripts/mainCS5.jsx', 'scripts/libs/json2.js']
        } 
      }
    },
    concat: {
      options: {},
      main: {
        src: ['scripts/libs/json2.js', 'scripts/main.jsx'],
        dest: 'scripts/adp-export.jsx'
      },
      mainCS5: {
        src: ['scripts/libs/json2.js', 'scripts/mainCS5.jsx'],
        dest: 'scripts/adp-exportCS5.jsx'
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.registerTask('default', ['concat:main', 'concat:mainCS5']);
};
