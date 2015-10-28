module.exports = function(grunt) {
    //  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);
    grunt.initConfig({

        sass: {
            dist: {

                files: {
                    "css/main.css": "sass/main.scss",
                },
                options: { // Target options
                    includePaths: require("node-bourbon").includePaths,
                    style: "compact"

                }
            }
        },
        concat: {
            'build/APP.js': [
                'inc/shim/Base64.js',
                'inc/shim/Base64binary.js',
                'inc/shim/WebAudioAPI.js',
                'js/midi/audioDetect.js',
                'js/midi/gm.js',
                'js/midi/loader.js',
                'js/midi/plugin.audiotag.js',
                'js/midi/plugin.webaudio.js',
                'js/midi/plugin.webmidi.js',
                'js/util/dom_request_xhr.js', // req when using XHR
                'js/util/dom_request_script.js', // req otherwise
                'js/jquery.js',
                'js/jquery-ui.js',
                'js/jquery.knob.js',
                'js/rAF.js',
                'js/browser-detect.js',

                'main.js',
                'tutorial.js'
            ]
        },
        uglify: {
            'build/APP.min.js': [
                'build/APP.js'
            ]
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
                    "sass/*.scss"
                ],
                tasks: "sass"
            },
            livereload: {
                // Here we watch the files the sass task will compile to
                // These files are sent to the live reload server after sass compiles to them
                options: {
                    livereload: true
                },
                files: ["css/main.css", "index.html"],
            },
        }
    });

    //Where we tell Grunt we plan to use this plug-in.
    grunt.loadNpmTasks("grunt-contrib-watch");
    grunt.loadNpmTasks("grunt-sass");
    grunt.loadNpmTasks("grunt-contrib-connect");
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    //Where we tell Grunt what to do when we type "grunt" into the terminal.
     grunt.registerTask("default", ["connect", "watch"]);
     grunt.registerTask("build", ["concat", "uglify"]);



};