module.exports = function(grunt) {
    //  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);
    grunt.initConfig({
        sass: {
            dist: {

                files: {
                    'css/main.css': 'sass/main.scss',
                },
                options: { // Target options
                    style: 'compact'
                }
            }
        },
        connect: {
            server: {
                options: {
                    port: 8080,
                    livereload: true
                }
            }
        },
        watch: {
            sass: {
                files: [
                    'sass/*.scss'
                ],
                tasks: 'sass'
            },
            livereload: {
                // Here we watch the files the sass task will compile to
                // These files are sent to the live reload server after sass compiles to them
                options: {
                    livereload: true
                },
                files: ['css/main.css', 'index.html'],
            },
        }
    });

    //Where we tell Grunt we plan to use this plug-in.
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-sass');
    grunt.loadNpmTasks('grunt-contrib-connect');

    //Where we tell Grunt what to do when we type "grunt" into the terminal.
    grunt.registerTask('default', ['connect', 'watch']);



};