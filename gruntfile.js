module.exports = function (grunt) {
	'use strict';
	// Project configuration
	grunt.initConfig({
		// Metadata
		pkg: grunt.file.readJSON('package.json'),
		copy: {
			phaser: {
				files: [
					{ expand: false, src: ['node_modules/phaser/build/phaser.min.js'], dest: 'public/js/phaser.min.js'}
				]
			}
		},
		browserify: {
			dist: {
				files: {
					// if the source file has an extension of es6 then
					// we change the name of the source file accordingly.
					// The result file's extension is always .js
					"./public/js/app.js": [
						"./src/js/*.js"
					]
				}
			}
		},
		jshint: {
			//esversion: 6,
			options: {
				node: true,
				curly: true,
				eqeqeq: true,
				immed: true,
				latedef: true,
				newcap: true,
				noarg: true,
				sub: true,
				undef: true,
				unused: true,
				eqnull: true,
				boss: true
			},
			all: {
				src: ['gruntfile.js', 'src/js/**/*.js', 'tests/**/*.js']
			}
		},
		nodeunit: {
			files: ['tests/**/*.js']
		},
		watch: {
			all: {
				files: ['gruntfile.js', 'src/js/**/*.js', 'src/js/**/*.jsx', 'tests/**/*.js'],
				tasks: ['jshint:all', 'browserify']
			}
		}
	});

	// These plugins provide necessary tasks
	grunt.loadNpmTasks("grunt-browserify");
	grunt.loadNpmTasks('grunt-contrib-nodeunit');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-copy');

	// Default task
	grunt.registerTask('test', ['jshint', 'nodeunit']);
	grunt.registerTask('build', ['jshint', 'copy', 'browserify']);
	grunt.registerTask('default', ['build', 'watch']);
};

