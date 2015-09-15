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
      }
    },
    concat: {
      options: {},
      main: {
        src: ['scripts/libs/json2.js', 'scripts/main.jsx'],
        dest: 'scripts/adp-export.jsx'
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.registerTask('default', ['concat:main']);
};
