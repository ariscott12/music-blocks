module.exports = function(grunt) {
	require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);
	 // Configure Grunt
	grunt.initConfig({
	 
		// grunt-contrib-connect will serve the files of the project
		// on specified port and hostname
		connect: {
			all: {
				options:{
					port: 9000,
					hostname: "0.0.0.0",
					// Prevents Grunt to close just after the task (starting the server) completes
					// This will be removed later as `watch` will take care of that
					keepalive: true
				}
			}
		}

		// libsass: {
		//     myTarget {
		//         //src: 'src/sass/*.scss'
		//         dest: 'dist/css/main.css'
		//     }
  // 		},
  // 		watch: {
		// 	css: {
		// 		files: 'sass/*.scss',
		// 		tasks: ['sass']
		// 	}
		// }
	}); 

	grunt.loadNpmTasks('grunt-contrib-connect');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-libsass');
	grunt.registerTask('default',[
		'connect'
	]); 
};